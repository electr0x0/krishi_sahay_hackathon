from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
import os
import uuid
from pathlib import Path

from ..database import get_db
from ..auth.dependencies import get_current_user
from ..models.store import (
    StoreProduct,
    StoreListing,
    StoreOrder,
    StoreOrderItem,
    StorePayment,
    StorePriceHistory
)
from ..models.user import User
from ..schemas.store import (
    ProductCreate,
    ProductResponse,
    ListingCreate,
    ListingResponse,
    ListingWithProduct,
    OrderCreate,
    OrderResponse,
    PublicOrderLookup
)

router = APIRouter()

# Helper function to save uploaded file
def save_uploaded_file(upload_file: UploadFile, folder: str = "products") -> str:
    """Save uploaded file and return the URL path"""
    os.makedirs(f"uploads/store/{folder}", exist_ok=True)
    
    # Generate unique filename
    file_extension = Path(upload_file.filename).suffix if upload_file.filename else ".jpg"
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    file_path = f"uploads/store/{folder}/{unique_filename}"
    
    # Save file
    with open(file_path, "wb") as buffer:
        buffer.write(upload_file.file.read())
    
    # Return URL path
    return f"/uploads/store/{folder}/{unique_filename}"


# Farmer: upload product image
@router.post("/products/upload-image")
def upload_product_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    """Upload product image and return the URL"""
    if not file.content_type.startswith('image/'):
        raise HTTPException(400, "File must be an image")
    
    if file.size > 5 * 1024 * 1024:  # 5MB limit
        raise HTTPException(400, "File too large (max 5MB)")
    
    image_url = save_uploaded_file(file, "products")
    return {"image_url": image_url}


# Public: browse listings with price trends
@router.get("/listings", response_model=List[ListingWithProduct])
def list_public_listings(
    q: Optional[str] = Query(None),
    location: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(StoreListing).filter(StoreListing.is_active == True, StoreListing.stock_qty > 0)
    if q:
        query = query.join(StoreProduct).filter(StoreProduct.name.ilike(f"%{q}%"))
    if location:
        query = query.filter(StoreListing.location.ilike(f"%{location}%"))

    listings = query.order_by(StoreListing.created_at.desc()).all()

    results: List[ListingWithProduct] = []
    for lst in listings:
        results.append(
            ListingWithProduct(
                id=lst.id,
                product_id=lst.product_id,
                price=lst.price,
                stock_qty=lst.stock_qty,
                location=lst.location,
                min_order_qty=lst.min_order_qty,
                harvest_date=lst.harvest_date,
                quality_grade=lst.quality_grade,
                organic_certified=lst.organic_certified,
                created_at=lst.created_at,
                updated_at=lst.updated_at,
                is_active=lst.is_active,
                product_name=lst.product.name,
                product_category=lst.product.category,
                product_image_url=lst.product.image_url,
                unit=lst.product.unit,
                farmer_name=lst.farmer.full_name if lst.farmer else None,
            )
        )
    return results


# Farmer: create product (enhanced)
@router.post("/products", response_model=ProductResponse)
def create_product(payload: ProductCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    prod = StoreProduct(
        name=payload.name,
        category=payload.category,
        unit=payload.unit,
        description=payload.description,
        image_url=payload.image_url
    )
    db.add(prod)
    db.commit()
    db.refresh(prod)
    return prod


# Farmer: create listing
@router.post("/listings", response_model=ListingResponse)
def create_listing(payload: ListingCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    prod = db.query(StoreProduct).filter(StoreProduct.id == payload.product_id).first()
    if not prod:
        raise HTTPException(404, "Product not found")
    lst = StoreListing(
        product_id=payload.product_id,
        farmer_user_id=current_user.id,
        location=payload.location,
        price=payload.price,
        stock_qty=payload.stock_qty,
        min_order_qty=payload.min_order_qty,
        harvest_date=payload.harvest_date,
        quality_grade=payload.quality_grade,
        organic_certified=payload.organic_certified,
    )
    db.add(lst)
    db.flush()
    db.add(StorePriceHistory(listing_id=lst.id, price=payload.price))
    db.commit()
    db.refresh(lst)
    return lst


# Farmer: update price/stock
@router.put("/listings/{listing_id}", response_model=ListingResponse)
def update_listing(listing_id: int, payload: ListingCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    lst = db.query(StoreListing).filter(StoreListing.id == listing_id, StoreListing.farmer_user_id == current_user.id).first()
    if not lst:
        raise HTTPException(404, "Listing not found")
    # Track price change
    if payload.price != lst.price:
        db.add(StorePriceHistory(listing_id=lst.id, price=payload.price))
    lst.price = payload.price
    lst.stock_qty = payload.stock_qty
    lst.location = payload.location
    lst.min_order_qty = payload.min_order_qty
    lst.harvest_date = payload.harvest_date
    lst.quality_grade = payload.quality_grade
    lst.organic_certified = payload.organic_certified
    lst.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(lst)
    return lst


# Farmer: my listings
@router.get("/listings/mine", response_model=List[ListingWithProduct])
def my_listings(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    listings = (
        db.query(StoreListing)
        .filter(StoreListing.farmer_user_id == current_user.id)
        .order_by(StoreListing.created_at.desc())
        .all()
    )
    return [
        ListingWithProduct(
            id=lst.id,
            product_id=lst.product_id,
            price=lst.price,
            stock_qty=lst.stock_qty,
            location=lst.location,
            min_order_qty=lst.min_order_qty,
            harvest_date=lst.harvest_date,
            quality_grade=lst.quality_grade,
            organic_certified=lst.organic_certified,
            created_at=lst.created_at,
            updated_at=lst.updated_at,
            is_active=lst.is_active,
            product_name=lst.product.name,
            product_category=lst.product.category,
            product_image_url=lst.product.image_url,
            unit=lst.product.unit,
            farmer_name=current_user.full_name,
        )
        for lst in listings
    ]


# Public: listing price history
@router.get("/listings/{listing_id}/price-history")
def listing_price_history(listing_id: int, db: Session = Depends(get_db)):
    lst = db.query(StoreListing).filter(StoreListing.id == listing_id).first()
    if not lst:
        raise HTTPException(404, "Listing not found")
    history = (
        db.query(StorePriceHistory)
        .filter(StorePriceHistory.listing_id == listing_id)
        .order_by(StorePriceHistory.recorded_at.asc())
        .all()
    )
    return [
        {"recorded_at": h.recorded_at.isoformat(), "price": h.price}
        for h in history
    ]


# Public: place order (no auth)
@router.post("/orders", response_model=OrderResponse)
def create_order(payload: OrderCreate, db: Session = Depends(get_db)):
    if not payload.items:
        raise HTTPException(400, "No order items")

    order = StoreOrder(
        phone=payload.phone,
        customer_name=payload.customer_name,
        address=payload.address,
        status="pending",
    )
    db.add(order)
    db.flush()

    # create items and basic stock check/deduct
    for it in payload.items:
        lst = db.query(StoreListing).filter(StoreListing.id == it.listing_id, StoreListing.is_active == True).with_for_update().first()
        if not lst:
            raise HTTPException(404, f"Listing {it.listing_id} not found")
        if lst.stock_qty < it.quantity:
            raise HTTPException(400, f"Insufficient stock for listing {it.listing_id}")
        db.add(StoreOrderItem(order_id=order.id, listing_id=lst.id, quantity=it.quantity, unit_price=lst.price))
        lst.stock_qty -= it.quantity

    # mock advance payment record
    pay = StorePayment(order_id=order.id, amount=payload.advance_amount or 0.0, status="paid" if (payload.advance_amount or 0) > 0 else "unpaid", paid_at=datetime.utcnow() if (payload.advance_amount or 0) > 0 else None)
    db.add(pay)

    db.commit()
    db.refresh(order)
    return order


# Public: track order by phone (and optional order id)
@router.get("/orders/track", response_model=List[OrderResponse])
def track_orders(phone: str = Query(...), order_id: Optional[int] = Query(None), db: Session = Depends(get_db)):
    q = db.query(StoreOrder).filter(StoreOrder.phone == phone)
    if order_id:
        q = q.filter(StoreOrder.id == order_id)
    orders = q.order_by(StoreOrder.created_at.desc()).all()
    return orders


# Farmer: my orders
@router.get("/orders", response_model=List[OrderResponse])
def farmer_orders(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # orders that include at least one item of current farmer
    order_ids = [row.order_id for row in db.query(StoreOrderItem.order_id).join(StoreListing).filter(StoreListing.farmer_user_id == current_user.id).distinct().all()]
    if not order_ids:
        return []
    orders = db.query(StoreOrder).filter(StoreOrder.id.in_(order_ids)).order_by(StoreOrder.created_at.desc()).all()
    return orders


# Farmer: update order status simple flow
@router.post("/orders/{order_id}/status")
def update_order_status(order_id: int, status_value: str = Query(..., regex="^(pending|processing|shipped|completed|cancelled)$"), db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    order = db.query(StoreOrder).join(StoreOrderItem).join(StoreListing).filter(StoreOrder.id == order_id, StoreListing.farmer_user_id == current_user.id).first()
    if not order:
        raise HTTPException(404, "Order not found")
    order.status = status_value
    order.updated_at = datetime.utcnow()
    db.commit()
    return {"message": "Order status updated"}


# Public: pay for an order (demo)
@router.post("/orders/{order_id}/pay")
def pay_order(order_id: int, amount: float = Query(..., gt=0), db: Session = Depends(get_db)):
    order = db.query(StoreOrder).filter(StoreOrder.id == order_id).first()
    if not order:
        raise HTTPException(404, "Order not found")
    if not order.payment:
        payment = StorePayment(order_id=order.id, amount=amount, status="paid", paid_at=datetime.utcnow())
        db.add(payment)
    else:
        order.payment.amount = amount
        order.payment.status = "paid"
        order.payment.paid_at = datetime.utcnow()
    db.commit()
    db.refresh(order)
    return {"message": "Payment completed", "order_id": order.id}


# Public: list products (for convenience)
@router.get("/products", response_model=List[ProductResponse])
def list_products(db: Session = Depends(get_db)):
    return db.query(StoreProduct).order_by(StoreProduct.created_at.desc()).all()



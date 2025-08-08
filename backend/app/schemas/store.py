from typing import List, Optional
from pydantic import BaseModel, Field
from datetime import datetime


class ProductCreate(BaseModel):
    name: str
    category: str = "vegetables"
    unit: str = "kg"
    description: Optional[str] = None
    image_url: Optional[str] = None


class ProductResponse(BaseModel):
    id: int
    name: str
    category: str
    unit: str
    description: Optional[str]
    image_url: Optional[str]
    created_at: datetime
    is_active: bool

    class Config:
        from_attributes = True


class ListingCreate(BaseModel):
    product_id: int
    price: float
    stock_qty: float
    location: str
    min_order_qty: float = 1.0
    harvest_date: Optional[datetime] = None
    quality_grade: str = "A"
    organic_certified: bool = False


class ListingResponse(BaseModel):
    id: int
    product_id: int
    price: float
    stock_qty: float
    location: str
    min_order_qty: float
    harvest_date: Optional[datetime]
    quality_grade: Optional[str]
    organic_certified: bool
    created_at: datetime
    updated_at: datetime
    is_active: bool

    class Config:
        from_attributes = True


class ListingWithProduct(ListingResponse):
    product_name: str = Field(...)
    product_category: str = Field(...)
    product_image_url: Optional[str] = Field(None)
    unit: str = Field(...)
    farmer_name: Optional[str] = Field(None)


class OrderItemCreate(BaseModel):
    listing_id: int
    quantity: float


class OrderCreate(BaseModel):
    phone: str
    customer_name: str
    address: str
    items: List[OrderItemCreate]
    advance_amount: float = 0.0


class OrderItemResponse(BaseModel):
    id: int
    listing_id: int
    quantity: float
    unit_price: float

    class Config:
        from_attributes = True


class PaymentResponse(BaseModel):
    id: int
    amount: float
    status: str
    paid_at: Optional[datetime]

    class Config:
        from_attributes = True


class OrderResponse(BaseModel):
    id: int
    phone: str
    customer_name: str
    address: str
    status: str
    created_at: datetime
    updated_at: datetime
    items: List[OrderItemResponse]
    payment: Optional[PaymentResponse]

    class Config:
        from_attributes = True


class PublicOrderLookup(BaseModel):
    phone: str
    order_id: Optional[int] = None



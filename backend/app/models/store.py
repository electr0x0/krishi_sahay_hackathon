from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    Text,
    DateTime,
    ForeignKey,
    Boolean
)
from sqlalchemy.orm import relationship
from datetime import datetime

from ..database import Base


class StoreProduct(Base):
    __tablename__ = "store_products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False, index=True)
    category = Column(String(100), nullable=False, default="vegetables")
    unit = Column(String(50), nullable=False, default="kg")
    description = Column(Text, nullable=True)
    image_url = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Boolean, default=True)

    listings = relationship("StoreListing", back_populates="product")


class StoreListing(Base):
    __tablename__ = "store_listings"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("store_products.id"), nullable=False, index=True)
    farmer_user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    location = Column(String(200), nullable=False)
    price = Column(Float, nullable=False)
    stock_qty = Column(Float, nullable=False, default=0.0)
    min_order_qty = Column(Float, nullable=False, default=1.0)
    harvest_date = Column(DateTime, nullable=True)
    quality_grade = Column(String(50), nullable=True, default="A")
    organic_certified = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Boolean, default=True)

    product = relationship("StoreProduct", back_populates="listings")
    farmer = relationship("User")
    price_history = relationship("StorePriceHistory", back_populates="listing", cascade="all, delete")
    order_items = relationship("StoreOrderItem", back_populates="listing")


class StorePriceHistory(Base):
    __tablename__ = "store_price_history"

    id = Column(Integer, primary_key=True, index=True)
    listing_id = Column(Integer, ForeignKey("store_listings.id"), nullable=False, index=True)
    price = Column(Float, nullable=False)
    recorded_at = Column(DateTime, default=datetime.utcnow, index=True)

    listing = relationship("StoreListing", back_populates="price_history")


class StoreOrder(Base):
    __tablename__ = "store_orders"

    id = Column(Integer, primary_key=True, index=True)
    phone = Column(String(50), nullable=False, index=True)
    customer_name = Column(String(200), nullable=False)
    address = Column(Text, nullable=False)
    status = Column(String(50), default="pending", index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)

    items = relationship("StoreOrderItem", back_populates="order", cascade="all, delete")
    payment = relationship("StorePayment", back_populates="order", uselist=False, cascade="all, delete")


class StoreOrderItem(Base):
    __tablename__ = "store_order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("store_orders.id"), nullable=False, index=True)
    listing_id = Column(Integer, ForeignKey("store_listings.id"), nullable=False, index=True)
    quantity = Column(Float, nullable=False)
    unit_price = Column(Float, nullable=False)

    order = relationship("StoreOrder", back_populates="items")
    listing = relationship("StoreListing", back_populates="order_items")


class StorePayment(Base):
    __tablename__ = "store_payments"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("store_orders.id"), nullable=False, unique=True)
    amount = Column(Float, nullable=False)
    status = Column(String(50), default="unpaid")
    paid_at = Column(DateTime, nullable=True)

    order = relationship("StoreOrder", back_populates="payment")



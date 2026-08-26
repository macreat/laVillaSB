from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class CartItem(BaseModel):
    product_id: int
    name: str
    quantity: int
    price: float

class CartOut(BaseModel):
    items: List[CartItem]
    total: float

class OrderCreate(BaseModel):
    customer_name: str
    customer_phone: str
    items: List[CartItem]

class OrderOut(BaseModel):
    id: int
    customer_name: str
    customer_phone: str
    items: List[CartItem]
    total: float
    status: str
    whatsapp_sent: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class CheckoutRequest(BaseModel):
    customer_name: str
    customer_phone: str

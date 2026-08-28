from pydantic import BaseModel
from typing import Optional

class StockLevelOut(BaseModel):
    product_id: int
    sku: Optional[str] = None
    quantity: int
    low_stock_threshold: int
    is_low_stock: bool

    class Config:
        from_attributes = True

class StockAdjust(BaseModel):
    quantity: int
    reason: Optional[str] = None

class StockSet(BaseModel):
    quantity: int
    low_stock_threshold: Optional[int] = None

class AvailabilityItem(BaseModel):
    product_id: int
    available: bool
    quantity: int

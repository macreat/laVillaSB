from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class PaymentIntentCreate(BaseModel):
    order_id: int
    amount: float
    currency: Optional[str] = "COP"

class PaymentIntentOut(BaseModel):
    id: int
    order_id: int
    amount: float
    currency: str
    status: str
    provider: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

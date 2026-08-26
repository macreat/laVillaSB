import json
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, Text, Boolean, DateTime
from src.database import Base

class Order(Base):
    __tablename__ = "orders"
    
    id = Column(Integer, primary_key=True, index=True)
    customer_name = Column(String, nullable=False)
    customer_phone = Column(String, nullable=False)
    items_json = Column(Text, nullable=False)
    total = Column(Float, nullable=False)
    status = Column(String, default="pending")
    whatsapp_sent = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

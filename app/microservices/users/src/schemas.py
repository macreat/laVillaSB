from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    name: str
    phone: Optional[str] = None

class UserCreate(UserBase):
    email: EmailStr

class UserUpdate(UserBase):
    pass

class UserOut(UserBase):
    id: int
    email: str
    role: str
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

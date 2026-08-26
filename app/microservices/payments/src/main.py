from fastapi import FastAPI, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
from contextlib import asynccontextmanager

from src.config import settings
from src.database import init_db, get_db
from src.models import PaymentIntent
from src.schemas import PaymentIntentCreate, PaymentIntentOut

@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield

app = FastAPI(title=settings.SERVICE_NAME, lifespan=lifespan)

@app.get("/health")
async def health():
    return {"status": "ok", "service": "payments"}

@app.post("/payment-intents", response_model=PaymentIntentOut)
async def create_payment_intent(intent_in: PaymentIntentCreate, db: AsyncSession = Depends(get_db)):
    intent = PaymentIntent(**intent_in.model_dump())
    db.add(intent)
    await db.commit()
    await db.refresh(intent)
    return intent

@app.get("/payment-intents", response_model=List[PaymentIntentOut])
async def list_payment_intents(skip: int = 0, limit: int = 10, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(PaymentIntent).offset(skip).limit(limit))
    intents = result.scalars().all()
    return intents

@app.get("/payment-intents/{intent_id}", response_model=PaymentIntentOut)
async def get_payment_intent(intent_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(PaymentIntent).where(PaymentIntent.id == intent_id))
    intent = result.scalar_one_or_none()
    if not intent:
        raise HTTPException(status_code=404, detail="Payment intent not found")
    return intent

@app.post("/payment-intents/{intent_id}/confirm", response_model=PaymentIntentOut)
async def confirm_payment_intent(intent_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(PaymentIntent).where(PaymentIntent.id == intent_id))
    intent = result.scalar_one_or_none()
    if not intent:
        raise HTTPException(status_code=404, detail="Payment intent not found")
        
    intent.status = "confirmed"
    await db.commit()
    await db.refresh(intent)
    return intent

@app.post("/payment-intents/{intent_id}/capture", response_model=PaymentIntentOut)
async def capture_payment_intent(intent_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(PaymentIntent).where(PaymentIntent.id == intent_id))
    intent = result.scalar_one_or_none()
    if not intent:
        raise HTTPException(status_code=404, detail="Payment intent not found")
        
    intent.status = "captured"
    await db.commit()
    await db.refresh(intent)
    return intent

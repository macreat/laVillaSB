from contextlib import asynccontextmanager
from typing import List
from fastapi import FastAPI, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from .database import get_db, init_db
from .models import StockLevel
from .schemas import StockLevelOut, StockAdjust, AvailabilityItem

@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield

app = FastAPI(lifespan=lifespan)

@app.get("/health")
async def health():
    return {"status": "ok", "service": "inventory"}

@app.get("/inventory", response_model=List[StockLevelOut])
async def list_inventory(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(StockLevel))
    stocks = result.scalars().all()
    
    out = []
    for s in stocks:
        out.append(StockLevelOut(
            product_id=s.product_id,
            sku=s.sku,
            quantity=s.quantity,
            low_stock_threshold=s.low_stock_threshold,
            is_low_stock=s.quantity <= s.low_stock_threshold
        ))
    return out

@app.get("/inventory/{product_id}", response_model=StockLevelOut)
async def get_inventory(product_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(StockLevel).where(StockLevel.product_id == product_id))
    s = result.scalars().first()
    if not s:
        raise HTTPException(status_code=404, detail="Stock level not found")
        
    return StockLevelOut(
        product_id=s.product_id,
        sku=s.sku,
        quantity=s.quantity,
        low_stock_threshold=s.low_stock_threshold,
        is_low_stock=s.quantity <= s.low_stock_threshold
    )

@app.post("/inventory/{product_id}/adjust", response_model=StockLevelOut)
async def adjust_inventory(product_id: int, adjust: StockAdjust, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(StockLevel).where(StockLevel.product_id == product_id))
    s = result.scalars().first()
    
    if not s:
        s = StockLevel(product_id=product_id, quantity=adjust.quantity)
        db.add(s)
    else:
        s.quantity += adjust.quantity
        
    await db.commit()
    await db.refresh(s)
    
    return StockLevelOut(
        product_id=s.product_id,
        sku=s.sku,
        quantity=s.quantity,
        low_stock_threshold=s.low_stock_threshold,
        is_low_stock=s.quantity <= s.low_stock_threshold
    )

@app.get("/availability", response_model=List[AvailabilityItem])
async def check_availability(ids: str = Query(..., description="Comma-separated product IDs"), db: AsyncSession = Depends(get_db)):
    try:
        product_ids = [int(id.strip()) for id in ids.split(",") if id.strip()]
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid product IDs format")
        
    if not product_ids:
        return []
        
    result = await db.execute(select(StockLevel).where(StockLevel.product_id.in_(product_ids)))
    stocks = result.scalars().all()
    stock_map = {s.product_id: s for s in stocks}
    
    out = []
    for pid in product_ids:
        s = stock_map.get(pid)
        if s:
            out.append(AvailabilityItem(product_id=pid, available=s.quantity > 0, quantity=s.quantity))
        else:
            out.append(AvailabilityItem(product_id=pid, available=False, quantity=0))
            
    return out

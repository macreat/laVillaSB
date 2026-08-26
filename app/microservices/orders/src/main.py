import json
import redis.asyncio as redis
from contextlib import asynccontextmanager
from typing import List, Optional
from fastapi import FastAPI, Depends, HTTPException, Header
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from src.config import settings
from src.database import engine, get_db, init_db
from src.models import Order
from src.schemas import CartItem, CartOut, OrderCreate, OrderOut, CheckoutRequest

redis_client = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    global redis_client
    await init_db()
    redis_client = redis.from_url(settings.REDIS_URL)
    yield
    await redis_client.aclose()

app = FastAPI(lifespan=lifespan)

@app.get("/health")
async def health():
    return {"status": "ok", "service": "orders"}

def serialize_order(order: Order) -> dict:
    return {
        "id": order.id,
        "customer_name": order.customer_name,
        "customer_phone": order.customer_phone,
        "items": json.loads(order.items_json),
        "total": order.total,
        "status": order.status,
        "whatsapp_sent": order.whatsapp_sent,
        "created_at": order.created_at,
    }

@app.post("/orders", response_model=OrderOut)
async def create_order(order_in: OrderCreate, db: AsyncSession = Depends(get_db)):
    total = sum(item.price * item.quantity for item in order_in.items)
    order = Order(
        customer_name=order_in.customer_name,
        customer_phone=order_in.customer_phone,
        items_json=json.dumps([item.model_dump() for item in order_in.items]),
        total=total
    )
    db.add(order)
    await db.commit()
    await db.refresh(order)
    return serialize_order(order)

@app.get("/orders", response_model=List[OrderOut])
async def list_orders(skip: int = 0, limit: int = 10, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Order).offset(skip).limit(limit))
    orders = result.scalars().all()
    return [serialize_order(o) for o in orders]

@app.get("/orders/{order_id}", response_model=OrderOut)
async def get_order(order_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Order).where(Order.id == order_id))
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return serialize_order(order)

@app.post("/orders/{order_id}/cancel", response_model=OrderOut)
async def cancel_order(order_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Order).where(Order.id == order_id))
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    order.status = "cancelled"
    await db.commit()
    await db.refresh(order)
    return serialize_order(order)

# Cart Endpoints
def get_session_id(x_session_id: Optional[str] = Header(None)) -> str:
    if not x_session_id:
        raise HTTPException(status_code=400, detail="X-Session-Id header missing")
    return x_session_id

def get_cart_key(session_id: str) -> str:
    return f"cart:{session_id}"

@app.get("/cart", response_model=CartOut)
async def get_cart(session_id: str = Depends(get_session_id)):
    key = get_cart_key(session_id)
    cart_data = await redis_client.get(key)
    if not cart_data:
        return CartOut(items=[], total=0.0)
    items_dicts = json.loads(cart_data)
    items = [CartItem(**item) for item in items_dicts]
    total = sum(item.price * item.quantity for item in items)
    return CartOut(items=items, total=total)

@app.post("/cart/items", response_model=CartOut)
async def add_cart_item(item: CartItem, session_id: str = Depends(get_session_id)):
    key = get_cart_key(session_id)
    cart_data = await redis_client.get(key)
    items = []
    if cart_data:
        items = json.loads(cart_data)
    
    # Check if item exists, update quantity
    found = False
    for i in items:
        if i["product_id"] == item.product_id:
            i["quantity"] += item.quantity
            found = True
            break
    if not found:
        items.append(item.model_dump())
    
    await redis_client.setex(key, settings.CART_TTL_HOURS * 3600, json.dumps(items))
    
    cart_items = [CartItem(**i) for i in items]
    total = sum(i.price * i.quantity for i in cart_items)
    return CartOut(items=cart_items, total=total)

@app.delete("/cart/items/{product_id}", response_model=CartOut)
async def remove_cart_item(product_id: int, session_id: str = Depends(get_session_id)):
    key = get_cart_key(session_id)
    cart_data = await redis_client.get(key)
    if not cart_data:
        return CartOut(items=[], total=0.0)
    
    items = json.loads(cart_data)
    items = [i for i in items if i["product_id"] != product_id]
    
    await redis_client.setex(key, settings.CART_TTL_HOURS * 3600, json.dumps(items))
    
    cart_items = [CartItem(**i) for i in items]
    total = sum(i.price * i.quantity for i in cart_items)
    return CartOut(items=cart_items, total=total)

@app.post("/cart/checkout", response_model=OrderOut)
async def checkout(
    checkout_req: CheckoutRequest,
    session_id: str = Depends(get_session_id),
    db: AsyncSession = Depends(get_db)
):
    key = get_cart_key(session_id)
    cart_data = await redis_client.get(key)
    if not cart_data:
        raise HTTPException(status_code=400, detail="Cart is empty")
    
    items_dicts = json.loads(cart_data)
    if not items_dicts:
        raise HTTPException(status_code=400, detail="Cart is empty")
    
    items = [CartItem(**i) for i in items_dicts]
    total = sum(i.price * i.quantity for i in items)
    
    order = Order(
        customer_name=checkout_req.customer_name,
        customer_phone=checkout_req.customer_phone,
        items_json=json.dumps(items_dicts),
        total=total
    )
    db.add(order)
    await db.commit()
    await db.refresh(order)
    
    await redis_client.delete(key)
    return serialize_order(order)

from datetime import datetime
from fastapi import FastAPI, HTTPException
import httpx
from pydantic import BaseModel
from .config import settings
from .whatsapp import send_whatsapp_message, send_twilio_message, format_catalog_message

app = FastAPI(title="Notifications Service")


class DeliveryLog(BaseModel):
    phone: str
    timestamp: datetime
    products_sent: int
    status: str


class WhatsAppMessageRequest(BaseModel):
    phone: str
    message: str


class OrderNotificationRequest(BaseModel):
    order_id: int
    customer_name: str
    customer_phone: str
    items_count: int
    total: float
    status: str = "pending"

@app.get("/health")
async def health_check():
    return {"status": "ok", "service": settings.service_name}

@app.post("/send-catalog")
async def send_catalog():
    # Fetch products from catalog service
    catalog_url = f"{settings.catalog_service_url}/products"
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(catalog_url, timeout=10.0)
            response.raise_for_status()
            products = response.json()
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to fetch products: {str(e)}")
            
    # Format message
    message = await format_catalog_message(products)
    
    # Send via WhatsApp to configured recipient
    recipient = settings.whatsapp_recipient
    result = await send_whatsapp_message(recipient, message, settings)

    delivery_status = "success" if result.get("status") != "error" else "error"
    delivery_log = DeliveryLog(
        phone=recipient,
        timestamp=datetime.now(),
        products_sent=len(products),
        status=delivery_status,
    )

    return {
        "status": delivery_status,
        "message_count": len(products),
        "recipient": recipient,
        "delivery_log": delivery_log.model_dump(mode="json"),
        "whatsapp_response": result,
    }

@app.post("/send-whatsapp")
async def send_whatsapp(request: WhatsAppMessageRequest):
    result = await send_whatsapp_message(request.phone, request.message, settings)
    return result

@app.post("/notify-order")
async def notify_order(request: OrderNotificationRequest):
    message = (
        "🛹 *NEW ORDER* - La Villa Skateboarding\n"
        f"Order: #{request.order_id}\n"
        f"Customer: {request.customer_name}\n"
        f"Phone: {request.customer_phone}\n"
        f"Items: {request.items_count}\n"
        f"Total: ${request.total:,.2f}\n"
        f"Status: {request.status}"
    )
    recipient = settings.twilio_to
    result = await send_twilio_message(recipient, message, settings)
    return {"recipient": recipient, "result": result}

@app.get("/status")
async def status():
    is_configured = bool(settings.whatsapp_token and settings.whatsapp_phone_id)
    is_twilio_configured = bool(settings.twilio_account_sid and settings.twilio_auth_token)
    return {
        "service": settings.service_name,
        "whatsapp_configured": is_configured,
        "whatsapp_recipient": settings.whatsapp_recipient,
        "twilio_configured": is_twilio_configured,
        "twilio_to": settings.twilio_to,
    }

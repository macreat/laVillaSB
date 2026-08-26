import httpx
import logging

logger = logging.getLogger(__name__)

async def send_whatsapp_message(phone: str, message: str, settings) -> dict:
    if not settings.whatsapp_token or not settings.whatsapp_phone_id:
        logger.warning("WHATSAPP_TOKEN or WHATSAPP_PHONE_ID is not set, returning mock success")
        return {"status": "mock_success", "message": "WhatsApp not configured"}
    
    url = f"{settings.whatsapp_api_url}/{settings.whatsapp_phone_id}/messages"
    headers = {
        "Authorization": f"Bearer {settings.whatsapp_token}",
        "Content-Type": "application/json"
    }
    payload = {
        "messaging_product": "whatsapp",
        "to": phone,
        "type": "text",
        "text": {"body": message}
    }
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(url, headers=headers, json=payload, timeout=10.0)
            response.raise_for_status()
            return response.json()
        except httpx.HTTPStatusError as e:
            logger.error(f"HTTP error occurred: {e.response.text}")
            return {"status": "error", "error": e.response.text}
        except Exception as e:
            logger.error(f"An error occurred: {e}")
            return {"status": "error", "error": str(e)}

async def format_catalog_message(products: list[dict]) -> str:
    lines = ["🛹 *LA VILLA SKATEBOARDING* - Catálogo", ""]
    for product in products:
        name = product.get("name", "Unknown Product")
        price = product.get("price", "N/A")
        category = product.get("category", "")
        lines.append(f"*{name}* - ${price}")
        if category:
            lines.append(f"{category}")
        lines.append("")
    
    lines.append("https://wa.me/")
    return "\n".join(lines)

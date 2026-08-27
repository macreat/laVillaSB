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

async def send_twilio_message(phone: str, message: str, settings) -> dict:
    if not settings.twilio_account_sid or not settings.twilio_auth_token:
        logger.warning("TWILIO_ACCOUNT_SID or TWILIO_AUTH_TOKEN is not set, returning mock success")
        return {"status": "mock_success", "message": "Twilio not configured"}

    url = f"https://api.twilio.com/2010-04-01/Accounts/{settings.twilio_account_sid}/Messages.json"
    to = f"whatsapp:{phone}" if not str(phone).startswith("whatsapp:") else str(phone)
    from_number = (
        str(settings.twilio_from)
        if str(settings.twilio_from).startswith("whatsapp:")
        else f"whatsapp:{settings.twilio_from}"
    )
    data = {"From": from_number, "To": to, "Body": message}
    auth = (settings.twilio_account_sid, settings.twilio_auth_token)

    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(url, data=data, auth=auth, timeout=10.0)
            response.raise_for_status()
            return response.json()
        except httpx.HTTPStatusError as e:
            logger.error(f"Twilio HTTP error: {e.response.text}")
            return {"status": "error", "error": e.response.text}
        except Exception as e:
            logger.error(f"Twilio error: {e}")
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

from unittest.mock import AsyncMock, MagicMock, patch
from fastapi.testclient import TestClient

from src.main import app, DeliveryLog


client = TestClient(app)


class TestSendCatalog:
    @patch("src.main.send_whatsapp_message", new_callable=AsyncMock)
    @patch("src.main.format_catalog_message", new_callable=AsyncMock)
    @patch("src.main.httpx.AsyncClient")
    def test_send_catalog_returns_delivery_log(
        self, mock_httpx_cls, mock_format, mock_send
    ):
        products_fixture = [
            {"name": "Deck Pro", "price": 89.99, "category": "decks"},
            {"name": "Wheels 52mm", "price": 24.99, "category": "wheels"},
        ]

        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.raise_for_status = MagicMock()
        mock_response.json = MagicMock(return_value=products_fixture)

        mock_cm = AsyncMock()
        mock_cm.get = AsyncMock(return_value=mock_response)
        mock_httpx_cls.return_value.__aenter__.return_value = mock_cm

        mock_format.return_value = "formatted message"
        mock_send.return_value = {"status": "mock_success", "message": "not configured"}

        response = client.post("/send-catalog")
        assert response.status_code == 200

        data = response.json()
        assert "delivery_log" in data
        assert data["delivery_log"]["phone"] == "+573245710972"
        assert data["delivery_log"]["products_sent"] == 2
        assert data["delivery_log"]["status"] == "success"
        assert "timestamp" in data["delivery_log"]

    @patch("src.main.send_whatsapp_message", new_callable=AsyncMock)
    @patch("src.main.format_catalog_message", new_callable=AsyncMock)
    @patch("src.main.httpx.AsyncClient")
    def test_send_catalog_delivery_log_status_error(
        self, mock_httpx_cls, mock_format, mock_send
    ):
        products_fixture = [{"name": "Deck", "price": 50.0}]

        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.raise_for_status = MagicMock()
        mock_response.json = MagicMock(return_value=products_fixture)

        mock_cm = AsyncMock()
        mock_cm.get = AsyncMock(return_value=mock_response)
        mock_httpx_cls.return_value.__aenter__.return_value = mock_cm

        mock_format.return_value = "formatted message"
        mock_send.return_value = {"status": "error", "error": "timeout"}

        response = client.post("/send-catalog")
        assert response.status_code == 200

        data = response.json()
        assert data["delivery_log"]["status"] == "error"

    def test_delivery_log_model_fields(self):
        log = DeliveryLog(
            phone="+1234567890",
            timestamp="2025-01-01T00:00:00",
            products_sent=3,
            status="success",
        )
        d = log.model_dump(mode="json")
        assert d["phone"] == "+1234567890"
        assert d["products_sent"] == 3
        assert d["status"] == "success"
        assert "timestamp" in d

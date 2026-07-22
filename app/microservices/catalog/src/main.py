from fastapi import FastAPI
from contextlib import asynccontextmanager


@asynccontextmanager
async def lifespan(app: FastAPI):
    # TODO: initialize database and RabbitMQ consumers
    yield
    # TODO: close connections


app = FastAPI(
    title="laVilla SB Catalog Service",
    description="Product and category management microservice.",
    version="0.1.0",
    lifespan=lifespan,
)


@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "catalog"}

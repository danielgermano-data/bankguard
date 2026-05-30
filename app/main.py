from fastapi import FastAPI

from app.api.routes import router
from app.core.config import settings

app = FastAPI(
    title=settings.app_name,
    description="API para monitoramento e analise de transacoes bancarias.",
    version="0.1.0",
)

app.include_router(router)

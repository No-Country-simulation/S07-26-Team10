from fastapi import FastAPI
from app.core.constants import API_TITLE, API_VERSION
from app.api.v1.router import api_router
from app.exceptions.handlers import register_exception_handlers
from app.middleware.cors import setup_cors

app = FastAPI(
    title=API_TITLE,
    version=API_VERSION,
)

register_exception_handlers(app)
setup_cors(app)

app.include_router(api_router)
from fastapi import FastAPI

from app.api.v1.router import api_router
from app.exceptions.handlers import register_exception_handlers
from app.middleware.cors import setup_cors
from app.exceptions.handlers import register_exception_handlers

app = FastAPI(
    title="PhysaFlow API",
    version="1.0.0"
)
register_exception_handlers(app)

setup_cors(app)
register_exception_handlers(app)

app.include_router(api_router)
from fastapi import APIRouter

from app.core.constants import API_PREFIX
from app.modules.auth.router import router as auth_router
from app.modules.reports.router import router as reports_router
from app.modules.users.router import router as users_router

api_router = APIRouter(prefix=API_PREFIX)

api_router.include_router(auth_router)
api_router.include_router(reports_router)
api_router.include_router(users_router)


@api_router.get("/", tags=["Health"])
def root():
    return {
        "message": "PhysaFlow API is running",
        "version": "1.0.0",
    }


@api_router.get("/health", tags=["Health"])
def health():
    return {
        "status": "healthy"
    }

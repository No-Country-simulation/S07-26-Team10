from fastapi import APIRouter

api_router = APIRouter()


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
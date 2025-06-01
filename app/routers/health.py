from fastapi import APIRouter, status

router = APIRouter(
    prefix="/health",
    tags=["health"]
)

@router.get("/", status_code=status.HTTP_200_OK)
async def health_check():
    return {
        "status": "healthy",
        "version": "1.0.0"
    }

@router.get("/ping", status_code=status.HTTP_200_OK)
async def ping():
    return {"message": "pong"} 
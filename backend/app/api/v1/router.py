from fastapi import APIRouter
from app.api.v1.prospects import router as prospects_router
from app.api.v1.review import router as review_router
from app.api.v1.auth import router as auth_router
from app.api.v1.analytics import router as analytics_router
from app.api.v1.onboarding import router as onboarding_router
from app.api.v1.queue import router as queue_router

router = APIRouter()
router.include_router(prospects_router)
router.include_router(review_router)
router.include_router(auth_router)
router.include_router(analytics_router)
router.include_router(onboarding_router)
router.include_router(queue_router)

from fastapi import APIRouter
from app.api.v1.prospects import router as prospects_router
from app.api.v1.review import router as review_router
from app.api.v1.auth import router as auth_router
from app.api.v1.analytics import router as analytics_router
from app.api.v1.onboarding import router as onboarding_router
from app.api.v1.queue import router as queue_router

from fastapi import Depends
from app.core.security import get_current_user

router = APIRouter()

# Secured Routes
secure_deps = [Depends(get_current_user)]
router.include_router(prospects_router, dependencies=secure_deps)
router.include_router(review_router, dependencies=secure_deps)
router.include_router(analytics_router, dependencies=secure_deps)
router.include_router(onboarding_router, dependencies=secure_deps)

# Unsecured / Custom Security Routes
router.include_router(auth_router)  # Handles OAuth Callbacks
router.include_router(queue_router) # Handles Cron Secret

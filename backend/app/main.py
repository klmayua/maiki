"""Main FastAPI application."""
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
from fastapi.requests import Request

from app.core.config import settings
from app.core.database import engine, Base
from app.api.routes import auth, users, jobs, applications, skills, payments, courses, guilds, notifications, devices, wallet, kyc, paystack_webhook, ai_matching, community, messages, reviews, email, stripe_webhook as stripe_webhook_route, analytics, admin, semantic, chatbot


# Create database tables (in production, use Alembic)
# Base.metadata.create_all(bind=engine)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler."""
    # Startup
    print("Starting up Maiki API...")
    yield
    # Shutdown
    print("Shutting down Maiki API...")


# Initialize FastAPI app
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="The Virtual Assistant Operating System API",
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None,
    openapi_url="/openapi.json" if settings.DEBUG else None,
    lifespan=lifespan,
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add trusted host middleware (in production)
if not settings.DEBUG:
    app.add_middleware(
        TrustedHostMiddleware,
        allowed_hosts=["*.maiki.io", "maiki.io"],
    )


# Exception handlers
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Global exception handler."""
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"},
    )


# Include routers
app.include_router(auth.router, prefix=settings.API_V1_STR, tags=["auth"])
app.include_router(users.router, prefix=settings.API_V1_STR, tags=["users"])
app.include_router(jobs.router, prefix=settings.API_V1_STR, tags=["jobs"])
app.include_router(applications.router, prefix=settings.API_V1_STR, tags=["applications"])
app.include_router(skills.router, prefix=settings.API_V1_STR, tags=["skills"])
app.include_router(payments.router, prefix=settings.API_V1_STR, tags=["payments"])
app.include_router(courses.router, prefix=settings.API_V1_STR, tags=["courses"])
app.include_router(guilds.router, prefix=settings.API_V1_STR, tags=["guilds"])
app.include_router(notifications.router, prefix=settings.API_V1_STR, tags=["notifications"])
app.include_router(devices.router, prefix=settings.API_V1_STR, tags=["devices"])
app.include_router(wallet.router, prefix=settings.API_V1_STR, tags=["wallets"])
app.include_router(kyc.router, prefix=settings.API_V1_STR, tags=["kyc"])
app.include_router(ai_matching.router, prefix=settings.API_V1_STR, tags=["ai-matching"])
app.include_router(community.router, prefix=settings.API_V1_STR, tags=["community"])
app.include_router(messages.router, prefix=settings.API_V1_STR, tags=["messages"])
app.include_router(reviews.router, prefix=settings.API_V1_STR, tags=["reviews"])
app.include_router(email.router, prefix=settings.API_V1_STR, tags=["email"])
app.include_router(stripe_webhook_route.router, prefix="/webhooks", tags=["webhooks"])
app.include_router(paystack_webhook.router, prefix="/webhooks", tags=["webhooks"])
app.include_router(analytics.router, prefix=settings.API_V1_STR, tags=["analytics"])
app.include_router(admin.router, prefix=settings.API_V1_STR, tags=["admin"])
app.include_router(semantic.router, prefix=settings.API_V1_STR, tags=["semantic-search"])
app.include_router(chatbot.router, prefix=settings.API_V1_STR, tags=["chatbot"])


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "Welcome to Maiki API",
        "version": settings.VERSION,
        "docs": "/docs" if settings.DEBUG else None,
    }


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "service": settings.PROJECT_NAME}


@app.get(settings.API_V1_STR + "/")
async def api_root():
    """API root endpoint."""
    return {
        "message": f"Welcome to {settings.PROJECT_NAME} API v1",
        "endpoints": {
            "auth": "/api/v1/auth",
            "users": "/api/v1/users",
            "jobs": "/api/v1/jobs",
            "applications": "/api/v1/applications",
            "skills": "/api/v1/skills",
            "payments": "/api/v1/payments",
            "wallets": "/api/v1/wallets",
            "courses": "/api/v1/courses",
            "guilds": "/api/v1/guilds",
            "notifications": "/api/v1/notifications",
            "devices": "/api/v1/devices",
            "kyc": "/api/v1/kyc",
            "ai-matching": "/api/v1/ai-matching",
            "community": "/api/v1/community",
            "semantic-search": "/api/v1/semantic",
            "analytics": "/api/v1/analytics",
            "admin": "/api/v1/admin",
            "webhooks": "/webhooks",
        },
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG,
        log_level="info",
    )

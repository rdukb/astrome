"""
Tamil Panchang API - FastAPI Application

Provides RESTful API for Tamil Panchangam calculations with:
- Daily Panchang data (Tithi, Nakshatra, Yoga, Karana, auspicious/inauspicious times)
- Location search and management
- Term definitions and educational content
- Offline-capable caching
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from src.api.middleware import add_error_handlers
from src.config import get_settings, setup_logging
from src.config.logging import get_logger

# Initialize settings and logging
settings = get_settings()
setup_logging(settings.log_level, settings.log_file)
logger = get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan manager.

    Handles startup and shutdown events:
    - Startup: Initialize database, Swiss Ephemeris, logging
    - Shutdown: Close connections, cleanup resources
    """
    # Startup
    logger.info("Starting Tamil Panchang API")
    logger.info(f"Environment: database_url={settings.database_url}")
    logger.info(f"Ephemeris path: {settings.ephe_path_absolute or 'built-in Moshier'}")

    # Initialize Swiss Ephemeris
    from src.services import get_ephemeris

    ephe = get_ephemeris(settings.ephe_path_absolute)
    logger.info(f"Swiss Ephemeris ready (built-in: {ephe.is_using_builtin()})")

    # Initialize database (create tables if not exist)
    try:
        from src.db import engine
        from src.db.schema import Base

        Base.metadata.create_all(bind=engine)
        logger.info("Database tables initialized")
    except Exception as e:
        logger.error(f"Database initialization failed: {e}")

    yield

    # Shutdown
    logger.info("Shutting down Tamil Panchang API")
    ephe.close()


# Create FastAPI application
app = FastAPI(
    title=settings.api_title,
    version=settings.api_version,
    description="Tamil Panchangam API with high-precision astronomical calculations",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan,
)

# CORS middleware - Allow all origins in development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Error handling
add_error_handlers(app)

# Mount API routes
from src.api.routes.panchang import router as panchang_router

app.include_router(panchang_router)


# Health check endpoint
@app.get("/health", tags=["Health"])
async def health_check():
    """
    Health check endpoint.

    Returns:
        API status and version information
    """
    from src.services import get_ephemeris

    ephe = get_ephemeris()

    return JSONResponse(
        content={
            "status": "healthy",
            "version": settings.api_version,
            "ephemeris": {
                "initialized": True,
                "using_builtin": ephe.is_using_builtin(),
                "path": settings.ephe_path_absolute or "built-in Moshier",
            },
            "database": {
                "url": settings.database_url.split("///")[-1],  # Hide full path
            },
        }
    )


# Root endpoint
@app.get("/", tags=["Root"])
async def root():
    """
    API root endpoint.

    Returns:
        Welcome message and documentation links
    """
    return {
        "message": "Tamil Panchang API",
        "version": settings.api_version,
        "documentation": {
            "interactive": "/docs",
            "redoc": "/redoc",
            "openapi": "/openapi.json",
        },
        "health": "/health",
    }


# TODO: Import and mount route modules
# from src.api.routes import panchang, locations, definitions
# app.include_router(panchang.router, prefix="/api/v1", tags=["Panchang"])
# app.include_router(locations.router, prefix="/api/v1", tags=["Locations"])
# app.include_router(definitions.router, prefix="/api/v1", tags=["Definitions"])


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level=settings.log_level.lower(),
    )

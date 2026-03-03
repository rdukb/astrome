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
from src.data.load_definitions import load_term_definitions

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
        from src.db import SessionLocal, engine
        from src.db.schema import Base

        Base.metadata.create_all(bind=engine)
        logger.info("Database tables initialized")

        # Seed/refresh definitions from bundled JSON.
        db = SessionLocal()
        try:
            sync_result = load_term_definitions(db)
            logger.info(
                "Term definitions synchronized: total=%s inserted=%s updated=%s",
                sync_result["total"],
                sync_result["inserted"],
                sync_result["updated"],
            )
        finally:
            db.close()
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

# CORS middleware
# Per the CORS spec, allow_credentials=True is incompatible with allow_origins=["*"].
# Use explicit origins from settings when available; fall back to wildcard (no
# credentials) for a public read-only API that doesn't rely on cookies/auth headers.
_cors_origins = (
    settings.cors_origins_list
    if hasattr(settings, "cors_origins_list") and settings.cors_origins_list
    else ["*"]
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins,
    allow_credentials=(_cors_origins != ["*"]),  # only True when origins are explicit
    allow_methods=["GET", "OPTIONS"],
    allow_headers=["Content-Type", "Accept"],
)

# Error handling
add_error_handlers(app)

# Mount API routes
from src.api.routes.panchang import router as panchang_router
from src.api.routes.definitions import router as definitions_router

app.include_router(panchang_router)
app.include_router(definitions_router)


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


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level=settings.log_level.lower(),
    )

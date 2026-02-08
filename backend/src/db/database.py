"""
SQLite database connection and session management.

Provides:
- SQLAlchemy engine with connection pooling
- Session factory
- Database dependency injection for FastAPI
- Declarative base for ORM models
"""

import os
from typing import Generator

from sqlalchemy import create_engine, event
from sqlalchemy.engine import Engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker
from sqlalchemy.pool import StaticPool

# Get database URL from environment or use default
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./astrome.db")

# SQLite-specific configuration
# Use StaticPool for SQLite to share connections across threads
# Enable foreign key constraints (disabled by default in SQLite)
connect_args = {
    "check_same_thread": False,  # Allow SQLite to be used in multi-threaded environment
}

# Create engine with connection pooling
if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(
        DATABASE_URL,
        connect_args=connect_args,
        poolclass=StaticPool,  # Single connection pool for SQLite
        echo=os.getenv("SQL_ECHO", "false").lower() == "true",  # Log SQL queries if enabled
    )

    # Enable foreign key constraints for SQLite
    @event.listens_for(Engine, "connect")
    def set_sqlite_pragma(dbapi_conn, connection_record):
        """Enable foreign key constraints on SQLite connections."""
        cursor = dbapi_conn.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()
else:
    # For other databases (PostgreSQL, MySQL, etc.)
    engine = create_engine(
        DATABASE_URL,
        pool_pre_ping=True,  # Verify connections before using
        pool_recycle=3600,  # Recycle connections after 1 hour
        echo=os.getenv("SQL_ECHO", "false").lower() == "true",
    )

# Session factory
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)


# Declarative base for ORM models
class Base(DeclarativeBase):
    """Base class for all SQLAlchemy ORM models."""
    pass


def get_db() -> Generator:
    """
    Database session dependency for FastAPI.

    Yields:
        Database session

    Usage:
        @app.get("/items")
        def get_items(db: Session = Depends(get_db)):
            return db.query(Item).all()

    Note:
        Automatically closes session after request, even if exception occurs.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db() -> None:
    """
    Initialize database tables.

    Creates all tables defined by models inheriting from Base.
    Should be called on application startup if not using Alembic migrations.

    Note:
        In production, use Alembic migrations instead of create_all().
    """
    import backend.src.db.schema  # noqa: F401 - Import to register models
    Base.metadata.create_all(bind=engine)


def drop_db() -> None:
    """
    Drop all database tables.

    WARNING: This will delete all data. Use only in development/testing.
    """
    Base.metadata.drop_all(bind=engine)

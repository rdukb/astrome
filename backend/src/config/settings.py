"""
Application settings using Pydantic BaseSettings.

Loads configuration from environment variables with validation.
"""

from functools import lru_cache
from typing import List

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Application settings with environment variable support.

    Attributes:
        database_url: SQLite database URL
        ephe_path: Swiss Ephemeris data files path (empty for built-in)
        api_title: API documentation title
        api_version: API version number
        cors_origins: Allowed CORS origins (comma-separated)
        cache_expiry_days: Panchang cache expiry in days
        log_level: Logging level (DEBUG, INFO, WARNING, ERROR)
        log_file: Log file path
        rate_limit_enabled: Enable rate limiting
        rate_limit_per_minute: Max requests per minute
    """

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # Database
    database_url: str = Field(
        default="sqlite:///./astrome.db",
        description="Database connection URL",
    )

    # Swiss Ephemeris
    ephe_path: str = Field(
        default="",
        description="Path to ephemeris files (empty for built-in Moshier)",
    )

    # API Configuration
    api_title: str = Field(
        default="Tamil Panchang API",
        description="API title for documentation",
    )
    api_version: str = Field(
        default="1.0.0",
        description="API version",
    )
    cors_origins: str = Field(
        default="http://localhost:3000,http://localhost:3001,http://localhost:3453",
        description="Comma-separated CORS allowed origins",
    )

    # Cache Configuration
    cache_expiry_days: int = Field(
        default=90,
        ge=1,
        le=365,
        description="Panchang cache expiry in days",
    )

    # Logging
    log_level: str = Field(
        default="INFO",
        description="Logging level",
    )
    log_file: str = Field(
        default="./logs/astrome.log",
        description="Log file path",
    )

    # Rate Limiting
    rate_limit_enabled: bool = Field(
        default=False,
        description="Enable rate limiting",
    )
    rate_limit_per_minute: int = Field(
        default=60,
        ge=1,
        description="Max requests per minute",
    )

    @property
    def cors_origins_list(self) -> List[str]:
        """Parse comma-separated CORS origins into list."""
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    @property
    def ephe_path_absolute(self) -> str:
        """Get absolute ephemeris path or empty string for built-in."""
        import os

        if not self.ephe_path:
            return ""
        return os.path.abspath(self.ephe_path)


@lru_cache()
def get_settings() -> Settings:
    """
    Get cached settings instance.

    Uses lru_cache to ensure settings are loaded only once.

    Returns:
        Settings instance with environment variables loaded
    """
    return Settings()

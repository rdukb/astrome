"""
Location Model

Pydantic model for geographic locations with coordinates and timezone.
Based on data-model.md specification.
"""

from datetime import datetime
from typing import Optional
from uuid import UUID, uuid4
from pydantic import Field, field_validator

from .base import BaseModel


class Location(BaseModel):
    """Geographic location with coordinates and timezone"""

    id: UUID = Field(default_factory=uuid4, description="Unique identifier")
    name: str = Field(..., min_length=2, max_length=100, description="City/location name")
    display_name: str = Field(
        ..., description="Full display name (e.g., 'Chennai, Tamil Nadu, India')"
    )
    latitude: float = Field(..., description="Latitude coordinate (-90 to +90)")
    longitude: float = Field(..., description="Longitude coordinate (-180 to +180)")
    timezone: str = Field(..., description="IANA timezone identifier (e.g., 'Asia/Kolkata')")
    country: str = Field(..., description="Country name or ISO 3166-1 alpha-2 code")
    state: Optional[str] = Field(default=None, max_length=100, description="State/province name")
    is_favorite: bool = Field(default=False, description="User marked as favorite")
    last_accessed: Optional[datetime] = Field(
        default=None, description="Last time user viewed this location"
    )
    created_at: datetime = Field(
        default_factory=datetime.utcnow, description="When location was added"
    )

    @field_validator("name")
    @classmethod
    def validate_name_not_empty(cls, v):
        """Validate name is not empty or whitespace only"""
        if not v or not v.strip():
            raise ValueError("name must not be empty or whitespace only")
        return v.strip()

    @field_validator("latitude")
    @classmethod
    def validate_latitude_range(cls, v):
        """Validate latitude range (-66.5 to +66.5, excluding polar regions)"""
        if not (-66.5 <= v <= 66.5):
            raise ValueError("latitude must be between -66.5 and +66.5 (polar regions excluded)")
        # Round to 6 decimal places (~0.1 meter precision)
        return round(v, 6)

    @field_validator("longitude")
    @classmethod
    def validate_longitude_range(cls, v):
        """Validate longitude range (-180 to +180)"""
        if not (-180 <= v <= 180):
            raise ValueError("longitude must be between -180 and +180")
        # Round to 6 decimal places (~0.1 meter precision)
        return round(v, 6)

    @field_validator("timezone")
    @classmethod
    def validate_timezone_iana(cls, v):
        """Validate IANA timezone identifier"""
        import pytz

        try:
            pytz.timezone(v)
        except pytz.UnknownTimeZoneError:
            raise ValueError(f"Invalid IANA timezone: {v}")
        return v


class LocationSearchRequest(BaseModel):
    """Request model for location search"""

    query: str = Field(..., min_length=2, max_length=100, description="Search query (city name)")
    limit: int = Field(default=10, ge=1, le=50, description="Maximum number of results")


class LocationNearbyRequest(BaseModel):
    """Request model for nearby locations search"""

    latitude: float = Field(..., description="Latitude coordinate")
    longitude: float = Field(..., description="Longitude coordinate")
    radius_km: float = Field(default=50, ge=1, le=500, description="Search radius in kilometers")
    limit: int = Field(default=10, ge=1, le=50, description="Maximum number of results")

    @field_validator("latitude")
    @classmethod
    def validate_latitude(cls, v):
        """Validate latitude range"""
        if not (-90 <= v <= 90):
            raise ValueError("latitude must be between -90 and +90")
        return round(v, 6)

    @field_validator("longitude")
    @classmethod
    def validate_longitude(cls, v):
        """Validate longitude range"""
        if not (-180 <= v <= 180):
            raise ValueError("longitude must be between -180 and +180")
        return round(v, 6)

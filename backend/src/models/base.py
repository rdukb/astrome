"""
Base Pydantic models and mixins for Tamil Panchang API.

Provides common model configuration, custom validators,
and reusable mixins for timestamps and UUIDs.
"""

from datetime import datetime
from typing import Any, Dict, Optional
from uuid import UUID, uuid4

from pydantic import BaseModel as PydanticBaseModel
from pydantic import ConfigDict, Field, field_validator


class BaseModel(PydanticBaseModel):
    """
    Base model with common configuration for all Pydantic models.

    Features:
    - JSON serialization for datetime, UUID
    - Forbid extra fields by default (strict validation)
    - Use enums by value in JSON
    - Populate by field name
    """

    model_config = ConfigDict(
        # Validation
        str_strip_whitespace=True,
        validate_assignment=True,
        extra="forbid",  # Reject unknown fields

        # Serialization
        use_enum_values=True,
        json_encoders={
            datetime: lambda v: v.isoformat(),
            UUID: lambda v: str(v),
        },

        # Schema
        populate_by_name=True,
        from_attributes=True,  # Allow ORM mode for SQLAlchemy models
    )


class TimestampMixin(BaseModel):
    """
    Mixin for models that track creation and update timestamps.

    Attributes:
        created_at: UTC timestamp when record was created
        updated_at: UTC timestamp when record was last updated
    """

    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        description="UTC timestamp when record was created",
    )
    updated_at: Optional[datetime] = Field(
        default=None,
        description="UTC timestamp when record was last updated",
    )

    def mark_updated(self) -> None:
        """Update the updated_at timestamp to current UTC time."""
        self.updated_at = datetime.utcnow()


class UUIDMixin(BaseModel):
    """
    Mixin for models that use UUID as primary key.

    Attributes:
        id: UUID v4 primary key, auto-generated if not provided
    """

    id: UUID = Field(
        default_factory=uuid4,
        description="Unique identifier (UUID v4)",
    )

    @field_validator("id", mode="before")
    @classmethod
    def validate_uuid(cls, v: Any) -> UUID:
        """
        Validate and convert UUID field.

        Accepts:
        - UUID objects (returned as-is)
        - String representations of UUIDs (converted)

        Args:
            v: Input value (UUID or string)

        Returns:
            UUID object

        Raises:
            ValueError: If string is not a valid UUID
        """
        if isinstance(v, UUID):
            return v
        if isinstance(v, str):
            try:
                return UUID(v)
            except ValueError:
                raise ValueError(f"Invalid UUID format: {v}")
        raise TypeError(f"Expected UUID or str, got {type(v)}")


class CoordinatesMixin(BaseModel):
    """
    Mixin for models that include geographic coordinates.

    Attributes:
        latitude: Latitude in degrees (-90 to +90)
        longitude: Longitude in degrees (-180 to +180)

    Validation:
        - Latitude must be between -90 and +90
        - Longitude must be between -180 and +180
        - Tropical regions: -23.5° to +23.5° latitude (not enforced)
        - Indian subcontinent: ~8° to ~35° N, ~68° to ~97° E (not enforced)
    """

    latitude: float = Field(
        ...,
        ge=-90.0,
        le=90.0,
        description="Latitude in degrees (-90 to +90)",
    )
    longitude: float = Field(
        ...,
        ge=-180.0,
        le=180.0,
        description="Longitude in degrees (-180 to +180)",
    )

    @field_validator("latitude")
    @classmethod
    def validate_latitude_precision(cls, v: float) -> float:
        """
        Validate latitude precision (round to 6 decimal places ~0.1 meter).

        Args:
            v: Latitude value

        Returns:
            Rounded latitude
        """
        return round(v, 6)

    @field_validator("longitude")
    @classmethod
    def validate_longitude_precision(cls, v: float) -> float:
        """
        Validate longitude precision (round to 6 decimal places ~0.1 meter).

        Args:
            v: Longitude value

        Returns:
            Rounded longitude
        """
        return round(v, 6)


class PakshaType(str):
    """
    Enumeration of Paksha (lunar fortnight) types.

    Values:
        SHUKLA: Waxing moon (bright fortnight)
        KRISHNA: Waning moon (dark fortnight)
    """
    SHUKLA = "Shukla"
    KRISHNA = "Krishna"


def validate_tithi_number(v: int) -> int:
    """
    Validate Tithi number (1-30).

    Args:
        v: Tithi number

    Returns:
        Valid Tithi number

    Raises:
        ValueError: If not in range 1-30
    """
    if not 1 <= v <= 30:
        raise ValueError(f"Tithi must be between 1 and 30, got {v}")
    return v


def validate_nakshatra_number(v: int) -> int:
    """
    Validate Nakshatra number (1-27).

    Args:
        v: Nakshatra number

    Returns:
        Valid Nakshatra number

    Raises:
        ValueError: If not in range 1-27
    """
    if not 1 <= v <= 27:
        raise ValueError(f"Nakshatra must be between 1 and 27, got {v}")
    return v


def validate_yoga_number(v: int) -> int:
    """
    Validate Yoga number (1-27).

    Args:
        v: Yoga number

    Returns:
        Valid Yoga number

    Raises:
        ValueError: If not in range 1-27
    """
    if not 1 <= v <= 27:
        raise ValueError(f"Yoga must be between 1 and 27, got {v}")
    return v


def validate_karana_number(v: int) -> int:
    """
    Validate Karana number (1-11 for movable, 12-15 for fixed).

    Args:
        v: Karana number

    Returns:
        Valid Karana number

    Raises:
        ValueError: If not in range 1-15
    """
    if not 1 <= v <= 15:
        raise ValueError(f"Karana must be between 1 and 15, got {v}")
    return v


def validate_timezone(v: str) -> str:
    """
    Validate IANA timezone identifier.

    Args:
        v: Timezone string

    Returns:
        Valid timezone string

    Raises:
        ValueError: If not a valid IANA timezone

    Note:
        Basic validation only. Full validation requires pytz/zoneinfo.
    """
    if not v or "/" not in v:
        raise ValueError(f"Invalid timezone format: {v}. Expected IANA format like 'Asia/Kolkata'")
    return v

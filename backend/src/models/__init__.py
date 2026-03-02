"""
Data models package for Tamil Panchang API.

Contains Pydantic models for request/response validation,
database schemas, and business logic.
"""

from .base import BaseModel, TimestampMixin, UUIDMixin
from .panchang import (
    TimePeriod,
    TithiInfo,
    NakshatraInfo,
    YogaInfo,
    KaranaInfo,
    SpecialDay,
    DailyPanchang,
    TITHI_NAMES,
    NAKSHATRA_NAMES,
    YOGA_NAMES,
    KARANA_ALL,
    KARANA_MOVABLE,
    KARANA_FIXED,
    TAMIL_MONTHS,
)
from .location import Location, LocationSearchRequest, LocationNearbyRequest
from .definition import TermDefinition, DefinitionsListResponse

__all__ = [
    # Base models
    "BaseModel",
    "TimestampMixin",
    "UUIDMixin",
    # Panchang models
    "TimePeriod",
    "TithiInfo",
    "NakshatraInfo",
    "YogaInfo",
    "KaranaInfo",
    "SpecialDay",
    "DailyPanchang",
    # Location models
    "Location",
    "LocationSearchRequest",
    "LocationNearbyRequest",
    # Definition models
    "TermDefinition",
    "DefinitionsListResponse",
    # Constants
    "TITHI_NAMES",
    "NAKSHATRA_NAMES",
    "YOGA_NAMES",
    "KARANA_ALL",
    "KARANA_MOVABLE",
    "KARANA_FIXED",
    "TAMIL_MONTHS",
]

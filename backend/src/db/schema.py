"""
SQLAlchemy database schemas for Tamil Panchang API.

Defines ORM models for:
- locations: Geographic locations with coordinates
- panchang_cache: Cached Panchang calculations
- term_definitions: Panchang terminology in English/Tamil
"""

from datetime import datetime
from typing import Optional
from uuid import uuid4

from sqlalchemy import JSON, DateTime, Float, Index, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from .database import Base


class Location(Base):
    """
    Geographic location with coordinates and timezone.

    Stores preloaded cities and user-searched locations for Panchang calculations.

    Attributes:
        id: UUID primary key
        name: Location name (e.g., "Chennai", "Bangalore")
        display_name: Formatted display name with state/country
        latitude: Latitude in degrees (-90 to +90)
        longitude: Longitude in degrees (-180 to +180)
        timezone: IANA timezone identifier (e.g., "Asia/Kolkata")
        country: Country code (ISO 3166-1 alpha-2)
        state: State/province name (optional)
        is_preloaded: True if from curated list, False if user-searched
        search_count: Number of times this location was searched
        created_at: Record creation timestamp
        updated_at: Last update timestamp

    Indexes:
        - name, country (for search queries)
        - latitude, longitude (for nearby location queries)

    Constraints:
        - Unique combination of name, state, country
    """

    __tablename__ = "locations"

    # Primary key
    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid4()),
        doc="UUID primary key",
    )

    # Location identification
    name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        index=True,
        doc="Location name (e.g., 'Chennai')",
    )
    display_name: Mapped[str] = mapped_column(
        String(500),
        nullable=False,
        doc="Formatted display name with state/country",
    )

    # Geographic coordinates
    latitude: Mapped[float] = mapped_column(
        Float,
        nullable=False,
        index=True,
        doc="Latitude in degrees (-90 to +90)",
    )
    longitude: Mapped[float] = mapped_column(
        Float,
        nullable=False,
        index=True,
        doc="Longitude in degrees (-180 to +180)",
    )

    # Timezone and location details
    timezone: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        doc="IANA timezone identifier (e.g., 'Asia/Kolkata')",
    )
    country: Mapped[str] = mapped_column(
        String(2),
        nullable=False,
        index=True,
        doc="Country code (ISO 3166-1 alpha-2)",
    )
    state: Mapped[Optional[str]] = mapped_column(
        String(255),
        nullable=True,
        doc="State/province name",
    )

    # Metadata
    is_preloaded: Mapped[bool] = mapped_column(
        default=False,
        nullable=False,
        doc="True if from curated list, False if user-searched",
    )
    search_count: Mapped[int] = mapped_column(
        default=0,
        nullable=False,
        doc="Number of times this location was searched",
    )

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
        doc="Record creation timestamp (UTC)",
    )
    updated_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime,
        onupdate=datetime.utcnow,
        nullable=True,
        doc="Last update timestamp (UTC)",
    )

    # Indexes
    __table_args__ = (
        Index("ix_locations_name_country", "name", "country"),
        Index("ix_locations_coordinates", "latitude", "longitude"),
        UniqueConstraint("name", "state", "country", name="uq_location_identity"),
    )

    def __repr__(self) -> str:
        return f"<Location(id={self.id}, name={self.name}, lat={self.latitude}, lon={self.longitude})>"


class PanchangCache(Base):
    """
    Cached Panchang calculation results.

    Stores complete Panchang data for a specific date and location to avoid
    recalculation. Cache entries expire after configured duration (default 90 days).

    Attributes:
        id: UUID primary key
        location_id: Foreign key to Location
        date: Calendar date (YYYY-MM-DD)
        timezone: IANA timezone identifier
        panchang_data: Complete Panchang JSON (all Tithi, Nakshatra, times, etc.)
        calculated_at: When calculation was performed
        expires_at: When cache entry expires
        created_at: Record creation timestamp

    Indexes:
        - location_id, date (for cache lookups)
        - expires_at (for cleanup queries)

    Constraints:
        - Unique combination of location_id and date
    """

    __tablename__ = "panchang_cache"

    # Primary key
    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid4()),
        doc="UUID primary key",
    )

    # Foreign key
    location_id: Mapped[str] = mapped_column(
        String(36),
        nullable=False,
        index=True,
        doc="Foreign key to Location",
    )

    # Date and timezone
    date: Mapped[str] = mapped_column(
        String(10),  # YYYY-MM-DD format
        nullable=False,
        index=True,
        doc="Calendar date (YYYY-MM-DD)",
    )
    timezone: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        doc="IANA timezone identifier",
    )

    # Panchang data (JSON blob)
    panchang_data: Mapped[dict] = mapped_column(
        JSON,
        nullable=False,
        doc="Complete Panchang JSON with all calculations",
    )

    # Cache metadata
    calculated_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        doc="When calculation was performed (UTC)",
    )
    expires_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        index=True,
        doc="When cache entry expires (UTC)",
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
        doc="Record creation timestamp (UTC)",
    )

    # Indexes
    __table_args__ = (
        Index("ix_panchang_cache_lookup", "location_id", "date"),
        UniqueConstraint("location_id", "date", name="uq_panchang_cache_entry"),
    )

    def __repr__(self) -> str:
        return f"<PanchangCache(id={self.id}, location_id={self.location_id}, date={self.date})>"


class TermDefinition(Base):
    """
    Panchang terminology definitions in English and Tamil.

    Stores educational content for tooltips and glossary,
    including pronunciation, significance, and related terms.

    Attributes:
        id: UUID primary key
        term_id: Unique identifier slug (e.g., "tithi", "nakshatra")
        name_en: English term name
        name_ta: Tamil term name
        short_definition_en: Brief English definition (1-2 sentences)
        short_definition_ta: Brief Tamil definition
        detailed_explanation_en: Full English explanation (multiple paragraphs)
        detailed_explanation_ta: Full Tamil explanation
        significance_iyengar: Specific significance in Iyengar tradition
        calculation_method: How the term is calculated (optional)
        related_terms: JSON array of related term_ids
        created_at: Record creation timestamp
        updated_at: Last update timestamp

    Indexes:
        - term_id (unique, for lookups)
    """

    __tablename__ = "term_definitions"

    # Primary key
    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid4()),
        doc="UUID primary key",
    )

    # Term identifier
    term_id: Mapped[str] = mapped_column(
        String(50),
        unique=True,
        nullable=False,
        index=True,
        doc="Unique identifier slug (e.g., 'tithi', 'nakshatra')",
    )

    # English names and definitions
    name_en: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        doc="English term name",
    )
    short_definition_en: Mapped[str] = mapped_column(
        Text,
        nullable=False,
        doc="Brief English definition (1-2 sentences)",
    )
    detailed_explanation_en: Mapped[str] = mapped_column(
        Text,
        nullable=False,
        doc="Full English explanation",
    )

    # Tamil names and definitions
    name_ta: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        doc="Tamil term name",
    )
    short_definition_ta: Mapped[str] = mapped_column(
        Text,
        nullable=False,
        doc="Brief Tamil definition",
    )
    detailed_explanation_ta: Mapped[str] = mapped_column(
        Text,
        nullable=False,
        doc="Full Tamil explanation",
    )

    # Additional information
    significance_iyengar: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        doc="Specific significance in Iyengar tradition",
    )
    calculation_method: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        doc="How the term is calculated",
    )

    # Related terms (JSON array)
    related_terms: Mapped[Optional[list]] = mapped_column(
        JSON,
        nullable=True,
        doc="Array of related term_ids",
    )

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
        doc="Record creation timestamp (UTC)",
    )
    updated_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime,
        onupdate=datetime.utcnow,
        nullable=True,
        doc="Last update timestamp (UTC)",
    )

    def __repr__(self) -> str:
        return f"<TermDefinition(id={self.id}, term_id={self.term_id}, name_en={self.name_en})>"

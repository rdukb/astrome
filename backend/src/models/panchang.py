"""
Panchang Models

Pydantic models for Panchang entities (Tithi, Nakshatra, Yoga, Karana, DailyPanchang).
Based on data-model.md specification.
"""

from datetime import datetime
from typing import Optional, List, ClassVar
from uuid import UUID, uuid4
from pydantic import Field, field_validator, model_validator

from .base import BaseModel


# ==================== Constants ====================

TITHI_NAMES = {
    1: "Pratipada",
    2: "Dwitiya",
    3: "Tritiya",
    4: "Chaturthi",
    5: "Panchami",
    6: "Shashthi",
    7: "Saptami",
    8: "Ashtami",
    9: "Navami",
    10: "Dashami",
    11: "Ekadashi",
    12: "Dwadashi",
    13: "Trayodashi",
    14: "Chaturdashi",
    15: "Purnima",
    16: "Pratipada",
    17: "Dwitiya",
    18: "Tritiya",
    19: "Chaturthi",
    20: "Panchami",
    21: "Shashthi",
    22: "Saptami",
    23: "Ashtami",
    24: "Navami",
    25: "Dashami",
    26: "Ekadashi",
    27: "Dwadashi",
    28: "Trayodashi",
    29: "Chaturdashi",
    30: "Amavasya",
}

NAKSHATRA_NAMES = {
    1: "Ashwini",
    2: "Bharani",
    3: "Krittika",
    4: "Rohini",
    5: "Mrigashira",
    6: "Ardra",
    7: "Punarvasu",
    8: "Pushya",
    9: "Ashlesha",
    10: "Magha",
    11: "Purva Phalguni",
    12: "Uttara Phalguni",
    13: "Hasta",
    14: "Chitra",
    15: "Swati",
    16: "Vishakha",
    17: "Anuradha",
    18: "Jyeshtha",
    19: "Mula",
    20: "Purva Ashadha",
    21: "Uttara Ashadha",
    22: "Shravana",
    23: "Dhanishta",
    24: "Shatabhisha",
    25: "Purva Bhadrapada",
    26: "Uttara Bhadrapada",
    27: "Revati",
}

YOGA_NAMES = {
    1: "Vishkambha",
    2: "Priti",
    3: "Ayushman",
    4: "Saubhagya",
    5: "Shobhana",
    6: "Atiganda",
    7: "Sukarma",
    8: "Dhriti",
    9: "Shula",
    10: "Ganda",
    11: "Vriddhi",
    12: "Dhruva",
    13: "Vyaghata",
    14: "Harshana",
    15: "Vajra",
    16: "Siddhi",
    17: "Vyatipata",
    18: "Variyan",
    19: "Parigha",
    20: "Shiva",
    21: "Siddha",
    22: "Sadhya",
    23: "Shubha",
    24: "Shukla",
    25: "Brahma",
    26: "Indra",
    27: "Vaidhriti",
}

KARANA_MOVABLE = ["Bava", "Balava", "Kaulava", "Taitila", "Garija", "Vanija", "Vishti"]
KARANA_FIXED = ["Shakuni", "Chatushpada", "Naga", "Kimstughna"]
KARANA_ALL = KARANA_MOVABLE + KARANA_FIXED

TAMIL_MONTHS = [
    "Chithirai",
    "Vaikasi",
    "Aani",
    "Aadi",
    "Aavani",
    "Purattaasi",
    "Aippasi",
    "Karthigai",
    "Margazhi",
    "Thai",
    "Maasi",
    "Panguni",
]


# ==================== Models ====================


class TimePeriod(BaseModel):
    """Generic time period for auspicious/inauspicious times"""

    start_time: datetime = Field(..., description="Period start time (UTC)")
    end_time: datetime = Field(..., description="Period end time (UTC)")
    duration_minutes: int = Field(..., description="Duration in minutes")
    is_auspicious: bool = Field(..., description="True if auspicious, False if inauspicious")

    @field_validator("end_time")
    @classmethod
    def validate_end_after_start(cls, v, info):
        """Ensure end_time is after start_time"""
        if "start_time" in info.data and v <= info.data["start_time"]:
            raise ValueError("end_time must be after start_time")
        return v

    @field_validator("duration_minutes")
    @classmethod
    def validate_duration(cls, v, info):
        """Validate duration matches actual time difference"""
        if "start_time" in info.data and "end_time" in info.data:
            actual_minutes = int(
                (info.data["end_time"] - info.data["start_time"]).total_seconds() / 60
            )
            if abs(v - actual_minutes) > 1:  # Allow 1 minute rounding tolerance
                raise ValueError(
                    f"duration_minutes ({v}) does not match actual duration ({actual_minutes})"
                )
        if v >= 1440:  # 24 hours
            raise ValueError("Duration must be less than 24 hours")
        return v


class TithiInfo(BaseModel):
    """Tithi (lunar day) information"""

    number: int = Field(..., ge=1, le=30, description="Tithi number (1-30)")
    name: str = Field(..., description="Tithi name in English")
    name_tamil: str = Field(..., description="Tithi name in Tamil")
    paksha: str = Field(..., description="Lunar fortnight: Shukla or Krishna")
    start_time: datetime = Field(..., description="Tithi start time (UTC)")
    end_time: datetime = Field(..., description="Tithi end time (UTC)")
    at_sunrise: bool = Field(..., description="Is Tithi prevailing at sunrise")

    @field_validator("paksha")
    @classmethod
    def validate_paksha(cls, v):
        """Validate paksha is either Shukla or Krishna"""
        if v not in ["Shukla", "Krishna"]:
            raise ValueError("paksha must be 'Shukla' or 'Krishna'")
        return v

    @model_validator(mode="after")
    def validate_paksha_matches_number(self):
        """Validate paksha matches Tithi number"""
        if 1 <= self.number <= 15 and self.paksha != "Shukla":
            raise ValueError(f"Tithi {self.number} must have Shukla paksha")
        if 16 <= self.number <= 30 and self.paksha != "Krishna":
            raise ValueError(f"Tithi {self.number} must have Krishna paksha")
        return self

    @model_validator(mode="after")
    def validate_duration(self):
        """Validate Tithi duration is within acceptable range (12-36 hours)"""
        duration_hours = (self.end_time - self.start_time).total_seconds() / 3600
        if not (12 <= duration_hours <= 36):
            raise ValueError(
                f"Tithi duration {duration_hours:.1f}h outside acceptable range (12-36 hours)"
            )
        return self


class NakshatraInfo(BaseModel):
    """Nakshatra (lunar mansion) information"""

    number: int = Field(..., ge=1, le=27, description="Nakshatra number (1-27)")
    name: str = Field(..., description="Nakshatra name in English")
    name_tamil: str = Field(..., description="Nakshatra name in Tamil")
    pada: int = Field(..., ge=1, le=4, description="Pada (quarter) of Nakshatra")
    ruling_deity: str = Field(..., description="Hindu deity associated with Nakshatra")
    start_time: datetime = Field(..., description="Nakshatra start time (UTC)")
    end_time: datetime = Field(..., description="Nakshatra end time (UTC)")
    at_sunrise: bool = Field(..., description="Is Nakshatra prevailing at sunrise")

    @field_validator("end_time")
    @classmethod
    def validate_end_after_start(cls, v, info):
        """Ensure end_time is after start_time"""
        if "start_time" in info.data and v <= info.data["start_time"]:
            raise ValueError("end_time must be after start_time")
        return v


class YogaInfo(BaseModel):
    """Yoga (Sun + Moon combination) information"""

    number: int = Field(..., ge=1, le=27, description="Yoga number (1-27)")
    name: str = Field(..., description="Yoga name in English")
    name_tamil: str = Field(..., description="Yoga name in Tamil")
    start_time: datetime = Field(..., description="Yoga start time (UTC)")
    end_time: datetime = Field(..., description="Yoga end time (UTC)")
    at_sunrise: bool = Field(..., description="Is Yoga prevailing at sunrise")

    @field_validator("end_time")
    @classmethod
    def validate_end_after_start(cls, v, info):
        """Ensure end_time is after start_time"""
        if "start_time" in info.data and v <= info.data["start_time"]:
            raise ValueError("end_time must be after start_time")
        return v


class KaranaInfo(BaseModel):
    """Karana (half-Tithi) information"""

    name: str = Field(..., description="Karana name")
    name_tamil: str = Field(..., description="Karana name in Tamil")
    type: str = Field(..., description="Karana type: Movable or Fixed")
    start_time: datetime = Field(..., description="Karana start time (UTC)")
    end_time: datetime = Field(..., description="Karana end time (UTC)")

    @field_validator("name")
    @classmethod
    def validate_karana_name(cls, v):
        """Validate Karana name is one of the 11 valid names"""
        if v not in KARANA_ALL:
            raise ValueError(f"Invalid Karana name: {v}. Must be one of {KARANA_ALL}")
        return v

    @field_validator("type")
    @classmethod
    def validate_karana_type(cls, v):
        """Validate Karana type"""
        if v not in ["Movable", "Fixed"]:
            raise ValueError("type must be 'Movable' or 'Fixed'")
        return v

    @model_validator(mode="after")
    def validate_type_matches_name(self):
        """Validate type matches name"""
        if self.type == "Movable" and self.name not in KARANA_MOVABLE:
            raise ValueError(f"Karana {self.name} is not a Movable type")
        if self.type == "Fixed" and self.name not in KARANA_FIXED:
            raise ValueError(f"Karana {self.name} is not a Fixed type")
        return self

    @model_validator(mode="after")
    def validate_duration(self):
        """Validate Karana duration is approximately 6 hours (half Tithi)"""
        duration_hours = (self.end_time - self.start_time).total_seconds() / 3600
        if not (5 <= duration_hours <= 7):
            raise ValueError(
                f"Karana duration {duration_hours:.1f}h outside expected range (5-7 hours)"
            )
        return self


class SpecialDay(BaseModel):
    """Special religious/astrological day"""

    type: str = Field(..., description="Type of special day (Ekadashi, Pradosham, etc.)")
    name: str = Field(..., description="Specific name of the special day")
    name_tamil: str = Field(..., description="Tamil name")
    description: str = Field(..., min_length=50, max_length=500, description="Brief description")
    significance: str = Field(
        ..., min_length=100, max_length=1000, description="Religious significance"
    )
    observances: Optional[List[str]] = Field(default=None, description="Recommended observances")
    fasting_rules: Optional[str] = Field(default=None, description="Fasting instructions")
    parana_time: Optional[datetime] = Field(
        default=None, description="Fast-breaking time (Ekadashi)"
    )

    VALID_TYPES: ClassVar[List[str]] = [
        "Ekadashi",
        "Pradosham",
        "Amavasya",
        "Purnima",
        "Shivaratri",
        "Sankranti",
        "Festival",
        "Auspicious",
    ]

    @field_validator("type")
    @classmethod
    def validate_special_day_type(cls, v):
        """Validate special day type"""
        if v not in cls.VALID_TYPES:
            raise ValueError(f"Invalid special day type: {v}. Must be one of {cls.VALID_TYPES}")
        return v


class DailyPanchang(BaseModel):
    """Complete Panchang data for a specific date and location"""

    id: UUID = Field(default_factory=uuid4, description="Unique identifier")
    date: str = Field(..., description="Calendar date (YYYY-MM-DD)")
    location_id: UUID = Field(..., description="Location identifier")
    timezone: str = Field(..., description="IANA timezone identifier")

    # Sun and Moon times
    sunrise: datetime = Field(..., description="Sunrise time (UTC)")
    sunset: datetime = Field(..., description="Sunset time (UTC)")
    moonrise: Optional[datetime] = Field(default=None, description="Moonrise time (UTC)")
    moonset: Optional[datetime] = Field(default=None, description="Moonset time (UTC)")

    # Panchang elements
    tithi: TithiInfo = Field(..., description="Lunar day information")
    nakshatra: NakshatraInfo = Field(..., description="Lunar mansion")
    yoga: YogaInfo = Field(..., description="Yoga of the day")
    karana: List[KaranaInfo] = Field(..., description="Karana periods (2 per day)")

    # Inauspicious periods
    rahu_kalam: TimePeriod = Field(..., description="Rahu Kalam period")
    gulika_kalam: TimePeriod = Field(..., description="Gulika Kalam period")
    yamaganda_kalam: TimePeriod = Field(..., description="Yamaganda period")
    durmuhurtam: List[TimePeriod] = Field(..., description="Daily inauspicious periods (2 per day)")
    varjyam: Optional[List[TimePeriod]] = Field(
        default=None, description="Inauspicious periods (0-3 per day)"
    )

    # Auspicious periods
    abhijit_muhurat: Optional[TimePeriod] = Field(
        default=None, description="Auspicious midday period"
    )
    brahma_muhurat: TimePeriod = Field(..., description="Pre-dawn auspicious period")

    # Tamil calendar
    tamil_month: str = Field(..., description="Tamil solar month name")
    tamil_year: str = Field(..., description="Tamil year name")
    paksha: str = Field(..., description="Lunar fortnight: Shukla or Krishna")

    # Special days
    special_days: Optional[List[SpecialDay]] = Field(
        default=None, description="Special observance days"
    )

    # Metadata
    calculated_at: datetime = Field(
        default_factory=datetime.utcnow, description="Calculation timestamp"
    )

    @field_validator("date")
    @classmethod
    def validate_date_format(cls, v):
        """Validate ISO 8601 date format"""
        from datetime import datetime

        try:
            datetime.fromisoformat(v)
        except ValueError:
            raise ValueError("date must be in ISO 8601 format (YYYY-MM-DD)")
        return v

    @field_validator("tamil_month")
    @classmethod
    def validate_tamil_month(cls, v):
        """Validate Tamil month name"""
        if v not in TAMIL_MONTHS:
            raise ValueError(f"Invalid Tamil month: {v}. Must be one of {TAMIL_MONTHS}")
        return v

    @field_validator("paksha")
    @classmethod
    def validate_paksha(cls, v):
        """Validate paksha"""
        if v not in ["Shukla", "Krishna"]:
            raise ValueError("paksha must be 'Shukla' or 'Krishna'")
        return v

    @model_validator(mode="after")
    def validate_sunrise_before_sunset(self):
        """Ensure sunrise is before sunset"""
        if self.sunrise >= self.sunset:
            raise ValueError("sunrise must be before sunset")
        return self

    @model_validator(mode="after")
    def validate_karana_count(self):
        """Validate exactly 2 Karana per day"""
        if len(self.karana) != 2:
            raise ValueError(f"Must have exactly 2 Karanas per day, got {len(self.karana)}")
        return self

    @model_validator(mode="after")
    def validate_durmuhurtam_count(self):
        """Validate exactly 2 Durmuhurtam periods per day"""
        if len(self.durmuhurtam) != 2:
            raise ValueError(
                f"Must have exactly 2 Durmuhurtam periods per day, got {len(self.durmuhurtam)}"
            )
        return self

    @model_validator(mode="after")
    def validate_paksha_matches_tithi(self):
        """Validate paksha matches Tithi paksha"""
        if self.paksha != self.tithi.paksha:
            raise ValueError(
                f"paksha ({self.paksha}) does not match Tithi paksha ({self.tithi.paksha})"
            )
        return self

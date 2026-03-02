"""
Panchang Calculator Service

Main orchestrator that coordinates all Panchang calculations.
Combines Tithi, Nakshatra, Yoga, Karana, sun/moon times, and auspicious/inauspicious periods.
"""

from datetime import datetime, date, timezone
from uuid import uuid4
import swisseph as swe
from typing import Optional

from ..models import DailyPanchang, Location
from .calculations.tithi import calculate_tithi
from .calculations.nakshatra import calculate_nakshatra
from .calculations.yoga_karana import calculate_yoga, calculate_karana
from .calculations.sun import calculate_sun_times, calculate_moon_times
from .calculations.inauspicious import (
    calculate_rahu_kalam,
    calculate_gulika_kalam,
    calculate_yamaganda_kalam,
    calculate_durmuhurtam,
)
from .calculations.auspicious import calculate_abhijit_muhurat, calculate_brahma_muhurat
from .calculations.tamil_calendar import calculate_tamil_calendar


class PanchangCalculator:
    """
    Main Panchang calculation orchestrator
    """

    def __init__(self, ephe_path: Optional[str] = None):
        """
        Initialize calculator with ephemeris path

        Args:
            ephe_path: Path to Swiss Ephemeris data files
        """
        if ephe_path:
            swe.set_ephe_path(ephe_path)

    def calculate_daily_panchang(
        self,
        calculation_date: date,
        latitude: float,
        longitude: float,
        timezone: str,
        location_id: Optional[str] = None,
    ) -> DailyPanchang:
        """
        Calculate complete Panchang for a given date and location

        Args:
            calculation_date: Date to calculate Panchang for
            latitude: Location latitude
            longitude: Location longitude
            timezone: IANA timezone identifier
            location_id: Optional location UUID

        Returns:
            DailyPanchang object with all calculations
        """
        # Convert date to Julian Day (midnight UTC)
        year, month, day = calculation_date.year, calculation_date.month, calculation_date.day
        julian_day = swe.julday(year, month, day, 0.0)

        # Calculate timezone offset for sunrise checks
        from datetime import datetime
        import pytz

        tz = pytz.timezone(timezone)
        dt = tz.localize(datetime(year, month, day, 12, 0))
        timezone_offset_hours = dt.utcoffset().total_seconds() / 3600

        # Calculate sun and moon times
        sun_times = calculate_sun_times(julian_day, latitude, longitude)
        moon_times = calculate_moon_times(julian_day, latitude, longitude)

        # Get sunrise/sunset JD for other calculations
        sunrise_jd = sun_times["sunrise_jd"]
        sunset_jd = sun_times["sunset_jd"]

        # Get weekday for Rahu Kalam etc. (0=Monday, 6=Sunday)
        weekday = calculation_date.weekday()

        # Calculate Panchang elements
        tithi = calculate_tithi(julian_day, timezone_offset_hours)
        nakshatra = calculate_nakshatra(julian_day, timezone_offset_hours)
        yoga = calculate_yoga(julian_day, timezone_offset_hours)
        karanas = calculate_karana(julian_day, tithi.number)

        # Calculate inauspicious periods
        rahu_kalam = calculate_rahu_kalam(sunrise_jd, sunset_jd, weekday)
        gulika_kalam = calculate_gulika_kalam(sunrise_jd, sunset_jd, weekday)
        yamaganda_kalam = calculate_yamaganda_kalam(sunrise_jd, sunset_jd, weekday)
        durmuhurtam = calculate_durmuhurtam(sunrise_jd, sunset_jd)

        # Calculate auspicious periods
        abhijit_muhurat = calculate_abhijit_muhurat(sunrise_jd, sunset_jd)
        brahma_muhurat = calculate_brahma_muhurat(sunrise_jd)

        # Calculate Tamil calendar
        tamil_cal = calculate_tamil_calendar(julian_day)

        # Create DailyPanchang object
        panchang = DailyPanchang(
            id=uuid4(),
            date=calculation_date.isoformat(),
            location_id=str(uuid4()) if not location_id else location_id,
            timezone=timezone,
            # Sun and Moon times
            sunrise=sun_times["sunrise"],
            sunset=sun_times["sunset"],
            moonrise=moon_times["moonrise"],
            moonset=moon_times["moonset"],
            # Panchang elements
            tithi=tithi,
            nakshatra=nakshatra,
            yoga=yoga,
            karana=karanas,
            # Inauspicious periods
            rahu_kalam=rahu_kalam,
            gulika_kalam=gulika_kalam,
            yamaganda_kalam=yamaganda_kalam,
            durmuhurtam=durmuhurtam,
            varjyam=None,  # TODO: Implement Varjyam calculation
            # Auspicious periods
            abhijit_muhurat=abhijit_muhurat,
            brahma_muhurat=brahma_muhurat,
            # Tamil calendar
            tamil_month=tamil_cal["tamil_month"],
            tamil_year=tamil_cal["tamil_year"],
            paksha=tithi.paksha,
            # Special days
            special_days=None,  # TODO: Implement special day detection
            # Metadata
            calculated_at=datetime.utcnow(),
        )

        return panchang


# Singleton instance
_calculator_instance: Optional[PanchangCalculator] = None


def get_panchang_calculator(ephe_path: Optional[str] = None) -> PanchangCalculator:
    """
    Get singleton instance of PanchangCalculator

    Args:
        ephe_path: Path to ephemeris files (only used on first call)

    Returns:
        PanchangCalculator instance
    """
    global _calculator_instance

    if _calculator_instance is None:
        _calculator_instance = PanchangCalculator(ephe_path)

    return _calculator_instance

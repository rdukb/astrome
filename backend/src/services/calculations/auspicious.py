"""
Auspicious Times Calculation Service

Calculates Abhijit Muhurat and Brahma Muhurat periods.
"""

from datetime import datetime, timezone
from ...models import TimePeriod


def calculate_abhijit_muhurat(sunrise_jd: float, sunset_jd: float) -> TimePeriod:
    """
    Calculate Abhijit Muhurat (auspicious midday period, 48 minutes)

    Args:
        sunrise_jd: Sunrise Julian Day
        sunset_jd: Sunset Julian Day

    Returns:
        TimePeriod for Abhijit Muhurat
    """
    # Apparent noon (midpoint between sunrise and sunset)
    apparent_noon_jd = (sunrise_jd + sunset_jd) / 2

    # Abhijit starts 4 minutes before noon, lasts 48 minutes
    abhijit_start_jd = apparent_noon_jd - (4 / (24 * 60))
    abhijit_end_jd = abhijit_start_jd + (48 / (24 * 60))

    return TimePeriod(
        start_time=julian_to_datetime(abhijit_start_jd),
        end_time=julian_to_datetime(abhijit_end_jd),
        duration_minutes=48,
        is_auspicious=True,
    )


def calculate_brahma_muhurat(sunrise_jd: float) -> TimePeriod:
    """
    Calculate Brahma Muhurat (pre-dawn auspicious period, 48 minutes)

    Args:
        sunrise_jd: Sunrise Julian Day

    Returns:
        TimePeriod for Brahma Muhurat
    """
    # Brahma Muhurat is 48-96 minutes before sunrise
    # Standard: 48 minutes ending 48 minutes before sunrise
    brahma_start_jd = sunrise_jd - (96 / (24 * 60))
    brahma_end_jd = sunrise_jd - (48 / (24 * 60))

    return TimePeriod(
        start_time=julian_to_datetime(brahma_start_jd),
        end_time=julian_to_datetime(brahma_end_jd),
        duration_minutes=48,
        is_auspicious=True,
    )


def julian_to_datetime(julian_day: float) -> datetime:
    """Convert Julian Day to Python datetime (UTC timezone-aware)"""
    import swisseph as swe

    year, month, day, hour = swe.revjul(julian_day)
    hour_int = int(hour)
    minute = int((hour - hour_int) * 60)
    second = int(((hour - hour_int) * 60 - minute) * 60)

    return datetime(int(year), int(month), int(day), hour_int, minute, second, tzinfo=timezone.utc)

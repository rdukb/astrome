"""
Auspicious Times Calculation Service

Calculates Abhijit Muhurat and Brahma Muhurat periods.
"""

from ...models import TimePeriod
from .utils import julian_to_datetime


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



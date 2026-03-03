"""
Shared utility helpers for astronomical calculations.

Centralises small functions that would otherwise be duplicated across
every calculation module (tithi, nakshatra, yoga_karana, auspicious,
inauspicious, sun, …).
"""

from datetime import datetime, timezone


def julian_to_datetime(julian_day: float) -> datetime:
    """
    Convert a Julian Day number to a UTC-aware Python datetime.

    Args:
        julian_day: Julian Day number (e.g. 2460000.5)

    Returns:
        datetime object in UTC timezone
    """
    import swisseph as swe

    year, month, day, hour = swe.revjul(julian_day)
    hour_int = int(hour)
    minute = int((hour - hour_int) * 60)
    second = int(((hour - hour_int) * 60 - minute) * 60)

    return datetime(
        int(year), int(month), int(day),
        hour_int, minute, second,
        tzinfo=timezone.utc,
    )

"""
Sun Calculation Service

Calculates sunrise, sunset, noon times using Swiss Ephemeris.
Also calculates moon rise/set times.
"""

from typing import Optional
from .utils import julian_to_datetime

import swisseph as swe

from ...config.logging import get_logger

logger = get_logger(__name__)


def _extract_event_jd(result: tuple) -> Optional[float]:
    """Extract event Julian day from rise_trans result tuple."""
    if not isinstance(result, tuple) or len(result) < 2:
        return None

    status_code = result[0]
    times = result[1]
    if status_code < 0:
        return None

    if isinstance(times, (list, tuple)) and times:
        return float(times[0])

    return None


def _rise_trans_event_jd(
    search_jd: float, body: int, event_flag: int, longitude: float, latitude: float
) -> Optional[float]:
    """
    Compute rise/set event with a signature compatible across pyswisseph builds.

    Known working form (pyswisseph 20220908 / 2.10.3.1):
        swe.rise_trans(jd, body, rsmi, (lon, lat, alt))
    """
    geopos = (longitude, latitude, 0.0)
    attempts = (
        lambda: swe.rise_trans(search_jd, body, event_flag, geopos),
        lambda: swe.rise_trans(search_jd, body, rsmi=event_flag, geopos=geopos),
    )

    last_error: Optional[Exception] = None
    for call in attempts:
        try:
            result = call()
            event_jd = _extract_event_jd(result)
            if event_jd is not None:
                return event_jd
        except Exception as exc:  # noqa: BLE001 - Swiss Ephemeris raises mixed exception types
            last_error = exc

    if last_error is not None:
        logger.warning(f"rise_trans failed with all signatures: {last_error}")
    return None


def _approximate_sun_times(julian_day: float, longitude: float) -> tuple[float, float]:
    """
    Fallback approximation when Swiss Ephemeris rise/set fails.

    NOTE: This path is intentionally retained only as resilience fallback.
    """
    local_solar_offset = longitude / 15.0  # degrees to hours
    sunrise_jd = julian_day + (6.0 - local_solar_offset) / 24.0
    sunset_jd = julian_day + (18.0 - local_solar_offset) / 24.0
    return sunrise_jd, sunset_jd


def _approximate_moon_times(julian_day: float, longitude: float) -> tuple[float, float]:
    """
    Fallback approximation for moonrise/moonset.

    NOTE: Retained only as resilience fallback when Swiss Ephemeris fails.
    """
    moonrise_jd = julian_day + (6.0 - longitude / 15.0) / 24.0
    moonset_jd = julian_day + (18.0 - longitude / 15.0) / 24.0
    return moonrise_jd, moonset_jd


def calculate_sun_times(julian_day: float, latitude: float, longitude: float) -> dict:
    """
    Calculate sunrise, sunset, and noon for given location and date

    Args:
        julian_day: Julian Day Number (midnight UTC of date)
        latitude: Location latitude (-66.5 to +66.5)
        longitude: Location longitude (-180 to +180)

    Returns:
        Dict with sunrise, sunset, noon times as datetime objects
    """
    # Sunrise for the target date
    sunrise_jd = _rise_trans_event_jd(julian_day, swe.SUN, swe.CALC_RISE, longitude, latitude)

    # Sunset after that sunrise to ensure same local calendar day window
    sunset_jd = (
        _rise_trans_event_jd(sunrise_jd + 1e-6, swe.SUN, swe.CALC_SET, longitude, latitude)
        if sunrise_jd is not None
        else None
    )

    if sunrise_jd is None or sunset_jd is None:
        logger.warning(
            "Falling back to approximate sun times for jd=%s lat=%s lon=%s",
            julian_day,
            latitude,
            longitude,
        )
        sunrise_jd, sunset_jd = _approximate_sun_times(julian_day, longitude)

    # Apparent noon (midpoint)
    noon_jd = (sunrise_jd + sunset_jd) / 2

    return {
        "sunrise": julian_to_datetime(sunrise_jd),
        "sunset": julian_to_datetime(sunset_jd),
        "noon": julian_to_datetime(noon_jd),
        "sunrise_jd": sunrise_jd,
        "sunset_jd": sunset_jd,
    }


def calculate_moon_times(julian_day: float, latitude: float, longitude: float) -> dict:
    """
    Calculate moonrise and moonset for given location and date

    Returns:
        Dict with moonrise, moonset times (may be None if moon doesn't rise/set that day)
    """
    # Moonrise for the target date
    moonrise_jd = _rise_trans_event_jd(julian_day, swe.MOON, swe.CALC_RISE, longitude, latitude)

    # Moonset after that moonrise to ensure same local-day progression
    moonset_jd = (
        _rise_trans_event_jd(moonrise_jd + 1e-6, swe.MOON, swe.CALC_SET, longitude, latitude)
        if moonrise_jd is not None
        else None
    )

    if moonrise_jd is None or moonset_jd is None:
        logger.warning(
            "Falling back to approximate moon times for jd=%s lat=%s lon=%s",
            julian_day,
            latitude,
            longitude,
        )
        moonrise_jd, moonset_jd = _approximate_moon_times(julian_day, longitude)

    return {"moonrise": julian_to_datetime(moonrise_jd), "moonset": julian_to_datetime(moonset_jd)}



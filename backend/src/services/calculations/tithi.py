"""
Tithi Calculation Service

Calculates Tithi (lunar day) information using Swiss Ephemeris.
Tithi = Moon-Sun elongation divided by 12 degrees (30 Tithis per lunar month).
"""

import swisseph as swe
from typing import Dict, Any

from ...models import TithiInfo, TITHI_NAMES
from .utils import julian_to_datetime


# Lahiri ayanamsa (standard for Indian Panchang)
AYANAMSA_LAHIRI = swe.SIDM_LAHIRI


def calculate_tithi(julian_day: float, sunrise_jd: float) -> TithiInfo:
    """
    Calculate Tithi for given Julian Day.

    Args:
        julian_day: Julian Day Number (UTC midnight of the calculation date)
        sunrise_jd: Actual sunrise Julian Day from sun.py (used for at_sunrise flag)

    Returns:
        TithiInfo with number, name, paksha, start/end times and at_sunrise flag
    """
    # Set sidereal mode with Lahiri ayanamsa
    swe.set_sid_mode(AYANAMSA_LAHIRI)

    # Get ayanamsa value for the date
    ayanamsa = swe.get_ayanamsa_ut(julian_day)

    # Calculate Sun and Moon longitudes
    sun_data, _ = swe.calc_ut(julian_day, swe.SUN)
    sun_long = sun_data[0]
    moon_data, _ = swe.calc_ut(julian_day, swe.MOON)
    moon_long = moon_data[0]

    # Apply ayanamsa for sidereal (Vedic) calculation
    sun_long_sidereal = (sun_long - ayanamsa) % 360
    moon_long_sidereal = (moon_long - ayanamsa) % 360

    # Calculate elongation (moon - sun)
    elongation = (moon_long_sidereal - sun_long_sidereal) % 360

    # Tithi number (1-30)
    tithi_num = int(elongation / 12) + 1
    if tithi_num > 30:
        tithi_num = 30

    # Determine Paksha (Shukla = waxing, Krishna = waning)
    paksha = "Shukla" if tithi_num <= 15 else "Krishna"

    # Find Tithi start and end times using bisection for ~1-minute precision
    tithi_start_jd = find_tithi_start(julian_day, tithi_num, ayanamsa)
    tithi_end_jd = find_tithi_end(julian_day, tithi_num, ayanamsa)

    # at_sunrise: use the real sunrise_jd passed in (not a crude 6 AM estimate)
    at_sunrise = tithi_start_jd <= sunrise_jd < tithi_end_jd

    return TithiInfo(
        number=tithi_num,
        name=TITHI_NAMES[tithi_num],
        name_tamil=get_tithi_tamil_name(tithi_num),
        paksha=paksha,
        start_time=julian_to_datetime(tithi_start_jd),
        end_time=julian_to_datetime(tithi_end_jd),
        at_sunrise=at_sunrise,
    )


def _bisect_elongation(
    target: float, lo_jd: float, hi_jd: float, ayanamsa: float, tolerance_deg: float = 0.0042
) -> float:
    """
    Binary-search for the Julian Day when Moon-Sun elongation crosses ``target`` degrees.

    ``tolerance_deg`` defaults to 0.0042° ≈ 1 arc-minute, which keeps boundary
    times within ~1 minute of the true value (Moon moves ~0.5°/hr, so 0.0042°
    corresponds to ~0.5 min).  A maximum of 50 iterations is more than enough
    for any 2-day window.
    """
    for _ in range(50):
        mid_jd = (lo_jd + hi_jd) / 2.0
        if (hi_jd - lo_jd) * 24 * 60 < 1.0:  # bracket < 1 minute → done
            return mid_jd
        mid_elong = get_elongation_at_jd(mid_jd, ayanamsa)
        # Signed distance from target (taking wrap-around into account)
        diff = (mid_elong - target + 180) % 360 - 180
        if abs(diff) < tolerance_deg:
            return mid_jd
        lo_elong = get_elongation_at_jd(lo_jd, ayanamsa)
        lo_diff = (lo_elong - target + 180) % 360 - 180
        if lo_diff * diff <= 0:
            hi_jd = mid_jd
        else:
            lo_jd = mid_jd
    return (lo_jd + hi_jd) / 2.0


def find_tithi_start(reference_jd: float, tithi_num: int, ayanamsa: float) -> float:
    """
    Find the Julian Day when the given Tithi starts.

    Uses a two-phase approach:
    1. Coarse backward scan (30-min steps) to bracket the crossing.
    2. Bisection inside the bracket for ~1-minute precision.
    """
    target_elongation = (tithi_num - 1) * 12.0

    # Phase 1 – coarse scan backwards to find a bracket [jd, jd+step]
    step = 0.5 / 24  # 30-minute steps
    jd = reference_jd - step
    prev_jd = reference_jd
    for _ in range(96):  # up to 2 days back
        elong = get_elongation_at_jd(jd, ayanamsa)
        diff = (elong - target_elongation + 180) % 360 - 180
        prev_elong = get_elongation_at_jd(prev_jd, ayanamsa)
        prev_diff = (prev_elong - target_elongation + 180) % 360 - 180
        if diff * prev_diff <= 0:
            # Crossing found between jd and prev_jd
            return _bisect_elongation(target_elongation, jd, prev_jd, ayanamsa)
        prev_jd = jd
        jd -= step

    return reference_jd - 0.5  # Fallback


def find_tithi_end(reference_jd: float, tithi_num: int, ayanamsa: float) -> float:
    """
    Find the Julian Day when the given Tithi ends.

    Uses a two-phase approach:
    1. Coarse forward scan (30-min steps) to bracket the crossing.
    2. Bisection inside the bracket for ~1-minute precision.
    """
    target_elongation = (tithi_num * 12.0) % 360  # 0 for Amavasya wrap

    # Phase 1 – coarse scan forwards to find a bracket [prev_jd, jd]
    step = 0.5 / 24  # 30-minute steps
    prev_jd = reference_jd
    jd = reference_jd + step
    for _ in range(96):  # up to 2 days ahead
        elong = get_elongation_at_jd(jd, ayanamsa)
        diff = (elong - target_elongation + 180) % 360 - 180
        prev_elong = get_elongation_at_jd(prev_jd, ayanamsa)
        prev_diff = (prev_elong - target_elongation + 180) % 360 - 180
        if prev_diff * diff <= 0:
            # Crossing found between prev_jd and jd
            return _bisect_elongation(target_elongation, prev_jd, jd, ayanamsa)
        prev_jd = jd
        jd += step

    return reference_jd + 1.0  # Fallback


def get_elongation_at_jd(julian_day: float, ayanamsa: float) -> float:
    """Calculate Moon-Sun elongation at given Julian Day"""
    sun_data, _ = swe.calc_ut(julian_day, swe.SUN)
    sun_long = sun_data[0]
    moon_data, _ = swe.calc_ut(julian_day, swe.MOON)
    moon_long = moon_data[0]

    sun_sidereal = (sun_long - ayanamsa) % 360
    moon_sidereal = (moon_long - ayanamsa) % 360

    return (moon_sidereal - sun_sidereal) % 360


def get_tithi_tamil_name(tithi_num: int) -> str:
    """Get Tamil name for Tithi"""
    TITHI_TAMIL = {
        1: "பிரதமை",
        2: "துவிதியை",
        3: "திருதியை",
        4: "சதுர்த்தி",
        5: "பஞ்சமி",
        6: "சஷ்டி",
        7: "சப்தமி",
        8: "அஷ்டமி",
        9: "நவமி",
        10: "தசமி",
        11: "ஏகாதசி",
        12: "துவாதசி",
        13: "திரயோதசி",
        14: "சதுர்த்தசி",
        15: "பௌர்ணமி",
        16: "பிரதமை",
        17: "துவிதியை",
        18: "திருதியை",
        19: "சதுர்த்தி",
        20: "பஞ்சமி",
        21: "சஷ்டி",
        22: "சப்தமி",
        23: "அஷ்டமி",
        24: "நவமி",
        25: "தசமி",
        26: "ஏகாதசி",
        27: "துவாதசி",
        28: "திரயோதசி",
        29: "சதுர்த்தசி",
        30: "அமாவாசை",
    }
    return TITHI_TAMIL.get(tithi_num, "")

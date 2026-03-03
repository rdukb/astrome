"""
Nakshatra Calculation Service

Calculates Nakshatra (lunar mansion) information using Swiss Ephemeris.
27 Nakshatras, each 13°20' (360°/27).
"""

import swisseph as swe
from typing import Dict
from .utils import julian_to_datetime

from ...models import NakshatraInfo, NAKSHATRA_NAMES


NAKSHATRA_DEITIES = {
    1: "Ashwini Kumaras",
    2: "Yama",
    3: "Agni",
    4: "Brahma",
    5: "Chandra",
    6: "Rudra",
    7: "Aditi",
    8: "Brihaspati",
    9: "Sarpa",
    10: "Pitris",
    11: "Bhaga",
    12: "Aryaman",
    13: "Savitar",
    14: "Tvashtar",
    15: "Vayu",
    16: "Indra-Agni",
    17: "Mitra",
    18: "Indra",
    19: "Nirriti",
    20: "Apas",
    21: "Vishvadevas",
    22: "Vishnu",
    23: "Vasu",
    24: "Varuna",
    25: "Aja Ekapada",
    26: "Ahir Budhnya",
    27: "Pushan",
}


def calculate_nakshatra(julian_day: float, sunrise_jd: float) -> NakshatraInfo:
    """
    Calculate Nakshatra for given Julian Day.

    Args:
        julian_day: Julian Day Number (UTC midnight of the calculation date)
        sunrise_jd: Actual sunrise Julian Day from sun.py (used for at_sunrise flag)

    Returns:
        NakshatraInfo with number, name, pada, deity, start/end times and at_sunrise flag
    """
    # Set sidereal mode with Lahiri ayanamsa
    swe.set_sid_mode(swe.SIDM_LAHIRI)
    ayanamsa = swe.get_ayanamsa_ut(julian_day)

    # Get Moon longitude
    moon_data, _ = swe.calc_ut(julian_day, swe.MOON)

    moon_long = moon_data[0]
    moon_long_sidereal = (moon_long - ayanamsa) % 360

    # Nakshatra number (1-27)
    nakshatra_arc = 360 / 27  # 13.333...°
    nakshatra_num = int(moon_long_sidereal / nakshatra_arc) + 1
    if nakshatra_num > 27:
        nakshatra_num = 27

    # Pada (quarter of nakshatra, each pada = 3°20')
    nakshatra_progress = moon_long_sidereal % nakshatra_arc
    pada_arc = nakshatra_arc / 4  # 3.333...°
    pada = int(nakshatra_progress / pada_arc) + 1
    if pada > 4:
        pada = 4

    # Find Nakshatra start and end times using bisection for ~1-minute precision
    nakshatra_start_jd = find_nakshatra_start(julian_day, nakshatra_num, ayanamsa)
    nakshatra_end_jd = find_nakshatra_end(julian_day, nakshatra_num, ayanamsa)

    # at_sunrise: use the real sunrise_jd passed in (not a crude 6 AM estimate)
    at_sunrise = nakshatra_start_jd <= sunrise_jd < nakshatra_end_jd

    return NakshatraInfo(
        number=nakshatra_num,
        name=NAKSHATRA_NAMES[nakshatra_num],
        name_tamil=get_nakshatra_tamil_name(nakshatra_num),
        pada=pada,
        ruling_deity=NAKSHATRA_DEITIES[nakshatra_num],
        start_time=julian_to_datetime(nakshatra_start_jd),
        end_time=julian_to_datetime(nakshatra_end_jd),
        at_sunrise=at_sunrise,
    )


def _get_moon_longitude_sidereal(julian_day: float, ayanamsa: float) -> float:
    """Return sidereal Moon longitude at given Julian Day."""
    moon_data, _ = swe.calc_ut(julian_day, swe.MOON)
    return (moon_data[0] - ayanamsa) % 360


def _bisect_moon_longitude(
    target: float, lo_jd: float, hi_jd: float, ayanamsa: float, tolerance_deg: float = 0.0042
) -> float:
    """
    Binary-search for the Julian Day when sidereal Moon longitude crosses ``target``.

    tolerance_deg defaults to 0.0042° ≈ 1 arc-minute (Moon moves ~0.5°/hr).
    """
    for _ in range(50):
        mid_jd = (lo_jd + hi_jd) / 2.0
        if (hi_jd - lo_jd) * 24 * 60 < 1.0:  # bracket < 1 minute → done
            return mid_jd
        mid_lon = _get_moon_longitude_sidereal(mid_jd, ayanamsa)
        diff = (mid_lon - target + 180) % 360 - 180
        if abs(diff) < tolerance_deg:
            return mid_jd
        lo_lon = _get_moon_longitude_sidereal(lo_jd, ayanamsa)
        lo_diff = (lo_lon - target + 180) % 360 - 180
        if lo_diff * diff <= 0:
            hi_jd = mid_jd
        else:
            lo_jd = mid_jd
    return (lo_jd + hi_jd) / 2.0


def find_nakshatra_start(reference_jd: float, nakshatra_num: int, ayanamsa: float) -> float:
    """
    Find when Nakshatra starts using coarse bracket + bisection (~1-minute precision).
    """
    target_longitude = (nakshatra_num - 1) * (360.0 / 27)

    step = 0.5 / 24  # 30-minute steps
    jd = reference_jd - step
    prev_jd = reference_jd
    for _ in range(96):  # up to 2 days back
        lon = _get_moon_longitude_sidereal(jd, ayanamsa)
        prev_lon = _get_moon_longitude_sidereal(prev_jd, ayanamsa)
        diff = (lon - target_longitude + 180) % 360 - 180
        prev_diff = (prev_lon - target_longitude + 180) % 360 - 180
        if diff * prev_diff <= 0:
            return _bisect_moon_longitude(target_longitude, jd, prev_jd, ayanamsa)
        prev_jd = jd
        jd -= step

    return reference_jd - 0.5


def find_nakshatra_end(reference_jd: float, nakshatra_num: int, ayanamsa: float) -> float:
    """
    Find when Nakshatra ends using coarse bracket + bisection (~1-minute precision).
    """
    target_longitude = (nakshatra_num * (360.0 / 27)) % 360

    step = 0.5 / 24  # 30-minute steps
    prev_jd = reference_jd
    jd = reference_jd + step
    for _ in range(96):  # up to 2 days ahead
        lon = _get_moon_longitude_sidereal(jd, ayanamsa)
        prev_lon = _get_moon_longitude_sidereal(prev_jd, ayanamsa)
        diff = (lon - target_longitude + 180) % 360 - 180
        prev_diff = (prev_lon - target_longitude + 180) % 360 - 180
        if prev_diff * diff <= 0:
            return _bisect_moon_longitude(target_longitude, prev_jd, jd, ayanamsa)
        prev_jd = jd
        jd += step

    return reference_jd + 1.0


def get_nakshatra_tamil_name(nakshatra_num: int) -> str:
    """Get Tamil name for Nakshatra"""
    NAKSHATRA_TAMIL = {
        1: "அஸ்வினி",
        2: "பரணி",
        3: "கார்த்திகை",
        4: "ரோகிணி",
        5: "மிருகசீரிடம்",
        6: "திருவாதிரை",
        7: "புனர்பூசம்",
        8: "பூசம்",
        9: "ஆயில்யம்",
        10: "மகம்",
        11: "பூரம்",
        12: "உத்திரம்",
        13: "ஹஸ்தம்",
        14: "சித்திரை",
        15: "ஸ்வாதி",
        16: "விசாகம்",
        17: "அனுஷம்",
        18: "கேட்டை",
        19: "மூலம்",
        20: "பூராடம்",
        21: "உத்திராடம்",
        22: "திருவோணம்",
        23: "அவிட்டம்",
        24: "சதயம்",
        25: "பூரட்டாதி",
        26: "உத்திரட்டாதி",
        27: "ரேவதி",
    }
    return NAKSHATRA_TAMIL.get(nakshatra_num, "")

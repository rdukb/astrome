"""
Nakshatra Calculation Service

Calculates Nakshatra (lunar mansion) information using Swiss Ephemeris.
27 Nakshatras, each 13°20' (360°/27).
"""

from datetime import datetime, timezone
import swisseph as swe
from typing import Dict

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


def calculate_nakshatra(julian_day: float, timezone_offset_hours: float = 0) -> NakshatraInfo:
    """
    Calculate Nakshatra for given Julian Day

    Args:
        julian_day: Julian Day Number (UTC)
        timezone_offset_hours: Timezone offset for sunrise check

    Returns:
        NakshatraInfo with number, name, pada, deity, start/end times
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

    # Find Nakshatra start and end times
    nakshatra_start_jd = find_nakshatra_start(julian_day, nakshatra_num, ayanamsa)
    nakshatra_end_jd = find_nakshatra_end(julian_day, nakshatra_num, ayanamsa)

    # Check if Nakshatra is prevailing at sunrise
    sunrise_jd = julian_day + (6.0 / 24.0) + (timezone_offset_hours / 24.0)
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


def find_nakshatra_start(reference_jd: float, nakshatra_num: int, ayanamsa: float) -> float:
    """Find when Nakshatra starts"""
    target_longitude = (nakshatra_num - 1) * (360 / 27)

    jd = reference_jd - 1.0
    for _ in range(30):
        moon_data, _ = swe.calc_ut(jd, swe.MOON)

        moon_long = moon_data[0]
        moon_sidereal = (moon_long - ayanamsa) % 360

        if abs(moon_sidereal - target_longitude) < 0.1:
            return jd
        jd -= 0.02

    return reference_jd - 0.5


def find_nakshatra_end(reference_jd: float, nakshatra_num: int, ayanamsa: float) -> float:
    """Find when Nakshatra ends"""
    target_longitude = nakshatra_num * (360 / 27)
    if target_longitude >= 360:
        target_longitude = 0

    jd = reference_jd
    for _ in range(30):
        moon_data, _ = swe.calc_ut(jd, swe.MOON)

        moon_long = moon_data[0]
        moon_sidereal = (moon_long - ayanamsa) % 360

        if abs(moon_sidereal - target_longitude) < 0.1:
            return jd
        jd += 0.02

    return reference_jd + 1.0


def julian_to_datetime(julian_day: float) -> datetime:
    """Convert Julian Day to Python datetime (UTC timezone-aware)"""
    year, month, day, hour = swe.revjul(julian_day)
    hour_int = int(hour)
    minute = int((hour - hour_int) * 60)
    second = int(((hour - hour_int) * 60 - minute) * 60)

    return datetime(int(year), int(month), int(day), hour_int, minute, second, tzinfo=timezone.utc)


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

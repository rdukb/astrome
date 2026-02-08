"""
Tithi Calculation Service

Calculates Tithi (lunar day) information using Swiss Ephemeris.
Tithi = Moon-Sun elongation divided by 12 degrees (30 Tithis per lunar month).
"""

from datetime import datetime, timezone
import swisseph as swe
from typing import Dict, Any

from ...models import TithiInfo, TITHI_NAMES


# Lahiri ayanamsa (standard for Indian Panchang)
AYANAMSA_LAHIRI = swe.SIDM_LAHIRI


def calculate_tithi(julian_day: float, timezone_offset_hours: float = 0) -> TithiInfo:
    """
    Calculate Tithi for given Julian Day

    Args:
        julian_day: Julian Day Number (UTC)
        timezone_offset_hours: Timezone offset for sunrise check (optional)

    Returns:
        TithiInfo with number, name, paksha, start/end times
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

    # Find Tithi start and end times
    tithi_start_jd = find_tithi_start(julian_day, tithi_num, ayanamsa)
    tithi_end_jd = find_tithi_end(julian_day, tithi_num, ayanamsa)

    # Check if Tithi is prevailing at sunrise
    sunrise_jd = julian_day + (6.0 / 24.0) + (timezone_offset_hours / 24.0)  # Approximate
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


def find_tithi_start(reference_jd: float, tithi_num: int, ayanamsa: float) -> float:
    """Find Julian Day when given Tithi starts"""
    target_elongation = (tithi_num - 1) * 12

    # Search backwards from reference point
    jd = reference_jd - 1.0
    for _ in range(48):  # Search up to 2 days back (Tithi max ~26 hours)
        elongation = get_elongation_at_jd(jd, ayanamsa)
        if abs(elongation - target_elongation) < 0.1:
            return jd
        jd -= 0.02  # Step backwards by ~30 minutes

    return reference_jd - 0.5  # Fallback


def find_tithi_end(reference_jd: float, tithi_num: int, ayanamsa: float) -> float:
    """Find Julian Day when given Tithi ends"""
    target_elongation = tithi_num * 12
    if target_elongation >= 360:
        target_elongation = 0  # Wrap around for Amavasya

    # Search forwards from reference point
    jd = reference_jd
    for _ in range(48):  # Search up to 2 days ahead
        elongation = get_elongation_at_jd(jd, ayanamsa)
        if abs(elongation - target_elongation) < 0.1:
            return jd
        jd += 0.02  # Step forward by ~30 minutes

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


def julian_to_datetime(julian_day: float) -> datetime:
    """Convert Julian Day to Python datetime (UTC timezone-aware)"""
    year, month, day, hour = swe.revjul(julian_day)
    hour_int = int(hour)
    minute = int((hour - hour_int) * 60)
    second = int(((hour - hour_int) * 60 - minute) * 60)

    return datetime(int(year), int(month), int(day), hour_int, minute, second, tzinfo=timezone.utc)


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

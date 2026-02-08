"""
Yoga and Karana Calculation Services

Yoga: Sum of Sun and Moon longitudes divided by 13°20' (27 Yogas)
Karana: Half of a Tithi (60 Karanas per lunar month, 11 types)
"""

from datetime import datetime, timezone
import swisseph as swe

from ...models import YogaInfo, KaranaInfo, YOGA_NAMES, KARANA_MOVABLE, KARANA_FIXED

KARANA_NOMINAL_DAYS = 0.25  # ~6 hours in current MVP model assumptions
KARANA_MIN_DAYS = 5 / 24
KARANA_MAX_DAYS = 7 / 24


def calculate_yoga(julian_day: float, timezone_offset_hours: float = 0) -> YogaInfo:
    """
    Calculate Yoga for given Julian Day

    Yoga = (Sun longitude + Moon longitude) / 13.333°
    """
    swe.set_sid_mode(swe.SIDM_LAHIRI)
    ayanamsa = swe.get_ayanamsa_ut(julian_day)

    # Get Sun and Moon longitudes
    sun_data, _ = swe.calc_ut(julian_day, swe.SUN)

    sun_long = sun_data[0]
    moon_data, _ = swe.calc_ut(julian_day, swe.MOON)

    moon_long = moon_data[0]

    # Apply ayanamsa
    sun_sidereal = (sun_long - ayanamsa) % 360
    moon_sidereal = (moon_long - ayanamsa) % 360

    # Yoga calculation
    yoga_longitude = (sun_sidereal + moon_sidereal) % 360
    yoga_num = int(yoga_longitude / (360 / 27)) + 1
    if yoga_num > 27:
        yoga_num = 27

    # Find Yoga start and end times
    yoga_start_jd = find_yoga_start(julian_day, yoga_num, ayanamsa)
    yoga_end_jd = find_yoga_end(julian_day, yoga_num, ayanamsa)

    # Check if at sunrise
    sunrise_jd = julian_day + (6.0 / 24.0) + (timezone_offset_hours / 24.0)
    at_sunrise = yoga_start_jd <= sunrise_jd < yoga_end_jd

    return YogaInfo(
        number=yoga_num,
        name=YOGA_NAMES[yoga_num],
        name_tamil=get_yoga_tamil_name(yoga_num),
        start_time=julian_to_datetime(yoga_start_jd),
        end_time=julian_to_datetime(yoga_end_jd),
        at_sunrise=at_sunrise,
    )


def calculate_karana(julian_day: float, tithi_number: int) -> list[KaranaInfo]:
    """
    Calculate 2 Karanas for the day (each Tithi has 2 Karanas)

    11 Karana types: 7 movable (repeat), 4 fixed (at end of month)
    """
    swe.set_sid_mode(swe.SIDM_LAHIRI)
    ayanamsa = swe.get_ayanamsa_ut(julian_day)

    # Calculate elongation to determine Karana
    sun_data, _ = swe.calc_ut(julian_day, swe.SUN)

    sun_long = sun_data[0]
    moon_data, _ = swe.calc_ut(julian_day, swe.MOON)

    moon_long = moon_data[0]

    sun_sidereal = (sun_long - ayanamsa) % 360
    moon_sidereal = (moon_long - ayanamsa) % 360
    elongation = (moon_sidereal - sun_sidereal) % 360

    # Karana index (0-59 in lunar month)
    karana_index = int(elongation / 6)

    karanas = []

    # First Karana of the day
    karana_name_1, karana_type_1 = get_karana_name(karana_index)
    karana_start_1 = julian_day
    karana_end_1 = find_karana_boundary(julian_day, (karana_index + 1) * 6, ayanamsa)
    duration_1 = karana_end_1 - karana_start_1
    # Guard against boundary detections that produce invalid short/long windows.
    if duration_1 < KARANA_MIN_DAYS or duration_1 > KARANA_MAX_DAYS:
        karana_end_1 = karana_start_1 + KARANA_NOMINAL_DAYS

    karanas.append(
        KaranaInfo(
            name=karana_name_1,
            name_tamil=get_karana_tamil_name(karana_name_1),
            type=karana_type_1,
            start_time=julian_to_datetime(karana_start_1),
            end_time=julian_to_datetime(karana_end_1),
        )
    )

    # Second Karana of the day
    karana_name_2, karana_type_2 = get_karana_name(karana_index + 1)
    karana_start_2 = karana_end_1
    karana_end_2 = karana_start_2 + KARANA_NOMINAL_DAYS

    karanas.append(
        KaranaInfo(
            name=karana_name_2,
            name_tamil=get_karana_tamil_name(karana_name_2),
            type=karana_type_2,
            start_time=julian_to_datetime(karana_start_2),
            end_time=julian_to_datetime(karana_end_2),
        )
    )

    return karanas


def get_karana_name(karana_index: int) -> tuple[str, str]:
    """
    Get Karana name and type from index (0-59)

    Returns: (name, type) where type is "Movable" or "Fixed"
    """
    if karana_index >= 57:  # Last 4 Karanas are fixed
        fixed_index = karana_index - 57
        return KARANA_FIXED[fixed_index], "Fixed"
    else:
        movable_index = karana_index % 7
        return KARANA_MOVABLE[movable_index], "Movable"


def find_yoga_start(reference_jd: float, yoga_num: int, ayanamsa: float) -> float:
    """Find when Yoga starts"""
    target = (yoga_num - 1) * (360 / 27)
    jd = reference_jd - 1.0
    for _ in range(30):
        yoga_long = get_yoga_longitude(jd, ayanamsa)
        if abs(yoga_long - target) < 0.1:
            return jd
        jd -= 0.02
    return reference_jd - 0.5


def find_yoga_end(reference_jd: float, yoga_num: int, ayanamsa: float) -> float:
    """Find when Yoga ends"""
    target = yoga_num * (360 / 27)
    if target >= 360:
        target = 0
    jd = reference_jd
    for _ in range(30):
        yoga_long = get_yoga_longitude(jd, ayanamsa)
        if abs(yoga_long - target) < 0.1:
            return jd
        jd += 0.02
    return reference_jd + 1.0


def get_yoga_longitude(julian_day: float, ayanamsa: float) -> float:
    """Calculate Yoga longitude at given JD"""
    sun_data, _ = swe.calc_ut(julian_day, swe.SUN)

    sun_long = sun_data[0]
    moon_data, _ = swe.calc_ut(julian_day, swe.MOON)

    moon_long = moon_data[0]

    sun_sidereal = (sun_long - ayanamsa) % 360
    moon_sidereal = (moon_long - ayanamsa) % 360

    return (sun_sidereal + moon_sidereal) % 360


def find_karana_boundary(reference_jd: float, target_elongation: float, ayanamsa: float) -> float:
    """Find when elongation reaches target (Karana boundary)"""
    target_elongation = target_elongation % 360
    jd = reference_jd
    for _ in range(20):
        sun_data, _ = swe.calc_ut(jd, swe.SUN)

        sun_long = sun_data[0]
        moon_data, _ = swe.calc_ut(jd, swe.MOON)

        moon_long = moon_data[0]

        elongation = ((moon_long - ayanamsa) - (sun_long - ayanamsa)) % 360
        angular_diff = abs(elongation - target_elongation)
        circular_diff = min(angular_diff, 360 - angular_diff)
        if circular_diff < 0.5:
            return jd
        jd += 0.01
    return reference_jd + KARANA_NOMINAL_DAYS


def julian_to_datetime(julian_day: float) -> datetime:
    """Convert Julian Day to Python datetime (UTC timezone-aware)"""
    year, month, day, hour = swe.revjul(julian_day)
    hour_int = int(hour)
    minute = int((hour - hour_int) * 60)
    second = int(((hour - hour_int) * 60 - minute) * 60)

    return datetime(int(year), int(month), int(day), hour_int, minute, second, tzinfo=timezone.utc)


def get_yoga_tamil_name(yoga_num: int) -> str:
    """Get Tamil name for Yoga"""
    YOGA_TAMIL = {
        1: "விஷ்கம்பம்",
        2: "ப்ரீதி",
        3: "ஆயுஷ்மான்",
        4: "ஸௌபாக்யம்",
        5: "ஷோபனம்",
        6: "அதிகண்டம்",
        7: "ஸுகர்மா",
        8: "த்ருதி",
        9: "ஷூலம்",
        10: "கண்டம்",
        11: "வ்ருத்தி",
        12: "த்ருவம்",
        13: "வ்யாகாதம்",
        14: "ஹர்ஷணம்",
        15: "வஜ்ரம்",
        16: "சித்தி",
        17: "வ்யதீபாதம்",
        18: "வரியான்",
        19: "பரிகம்",
        20: "ஷிவம்",
        21: "சித்தம்",
        22: "ஸாத்யம்",
        23: "ஷுபம்",
        24: "ஷுக்லம்",
        25: "ப்ரஹ்மம்",
        26: "இந்திரம்",
        27: "வைத்ருதி",
    }
    return YOGA_TAMIL.get(yoga_num, "")


def get_karana_tamil_name(karana_name: str) -> str:
    """Get Tamil name for Karana"""
    KARANA_TAMIL = {
        "Bava": "பவ",
        "Balava": "பாலவ",
        "Kaulava": "கௌலவ",
        "Taitila": "தைதில",
        "Garija": "கரிஜ",
        "Vanija": "வணிஜ",
        "Vishti": "விஷ்டி",
        "Shakuni": "ஷகுனி",
        "Chatushpada": "சதுஷ்பாத",
        "Naga": "நாக",
        "Kimstughna": "கிம்ஸ்துக்ன",
    }
    return KARANA_TAMIL.get(karana_name, "")

"""
Tamil Calendar Calculation Service

Calculates Tamil solar month and year based on Sun's position.
"""

from datetime import datetime
import swisseph as swe


# Tamil months based on Solar (Saura) calendar
TAMIL_MONTHS = [
    "Chithirai",  # Mesha (Aries) - Apr 14-May 14
    "Vaikasi",  # Vrishabha (Taurus) - May 15-Jun 14
    "Aani",  # Mithuna (Gemini) - Jun 15-Jul 16
    "Aadi",  # Kataka (Cancer) - Jul 17-Aug 16
    "Aavani",  # Simha (Leo) - Aug 17-Sep 16
    "Purattaasi",  # Kanya (Virgo) - Sep 17-Oct 17
    "Aippasi",  # Tula (Libra) - Oct 18-Nov 15
    "Karthigai",  # Vrischika (Scorpio) - Nov 16-Dec 15
    "Margazhi",  # Dhanus (Sagittarius) - Dec 16-Jan 13
    "Thai",  # Makara (Capricorn) - Jan 14-Feb 12
    "Maasi",  # Kumbha (Aquarius) - Feb 13-Mar 13
    "Panguni",  # Meena (Pisces) - Mar 14-Apr 13
]


def calculate_tamil_calendar(julian_day: float) -> dict:
    """
    Calculate Tamil solar month and year

    Args:
        julian_day: Julian Day Number (UTC)

    Returns:
        Dict with tamil_month and tamil_year
    """
    # Set sidereal mode
    swe.set_sid_mode(swe.SIDM_LAHIRI)
    ayanamsa = swe.get_ayanamsa_ut(julian_day)

    # Get Sun longitude
    sun_data, _ = swe.calc_ut(julian_day, swe.SUN)

    sun_long = sun_data[0]
    sun_long_sidereal = (sun_long - ayanamsa) % 360

    # Tamil month based on Sun's zodiac position
    # Each rashi (sign) = 30 degrees
    rashi_index = int(sun_long_sidereal / 30)
    tamil_month = TAMIL_MONTHS[rashi_index]

    # Tamil year calculation:
    # year changes at Mesha Sankranti (sidereal Sun entering Aries, 0°).
    # Jan-Mar are always part of previous Tamil year.
    # In April, switch year only after Sun enters Aries (sidereal < 30°).
    year, month, _, _ = swe.revjul(julian_day)
    if month < 4 or (month == 4 and sun_long_sidereal >= 330):
        tamil_year_num = year - 1
    else:
        tamil_year_num = year

    # Tamil year names cycle (60-year cycle)
    tamil_year_name = get_tamil_year_name(tamil_year_num)

    return {"tamil_month": tamil_month, "tamil_year": tamil_year_name}


def get_tamil_year_name(gregorian_year: int) -> str:
    """
    Get Tamil year name from 60-year cycle

    Args:
        gregorian_year: Gregorian year number

    Returns:
        Tamil year name
    """
    # Tamil 60-year cycle names (Jovian cycle)
    TAMIL_YEAR_NAMES = [
        "Prabhava",
        "Vibhava",
        "Shukla",
        "Pramoda",
        "Prajotpatti",
        "Angirasa",
        "Shrimukha",
        "Bhava",
        "Yuva",
        "Dhatri",
        "Ishvara",
        "Bahudhanya",
        "Pramathi",
        "Vikrama",
        "Vrisha",
        "Chitrabhanu",
        "Subhanu",
        "Tarana",
        "Parthiva",
        "Vyaya",
        "Sarvajit",
        "Sarvadharin",
        "Virodhin",
        "Vikrita",
        "Khara",
        "Nandana",
        "Vijaya",
        "Jaya",
        "Manmatha",
        "Durmukhi",
        "Hevilambi",
        "Vilambi",
        "Vikari",
        "Sharvari",
        "Plava",
        "Shubhakrit",
        "Shobhana",
        "Krodhin",
        "Vishvavasu",
        "Parabhava",
        "Plavanga",
        "Kilaka",
        "Saumya",
        "Sadharana",
        "Virodhikrit",
        "Paridhavi",
        "Pramadicha",
        "Ananda",
        "Rakshasa",
        "Anala",
        "Pingala",
        "Kalayukti",
        "Siddharthi",
        "Raudra",
        "Durmati",
        "Dundubhi",
        "Rudhirodgari",
        "Raktakshi",
        "Krodhana",
        "Akshaya",
    ]

    # Calculate position in 60-year cycle.
    # Reference alignment:
    # - 2024-2025 Tamil year: Krodhin (index 37)
    # - 2025-2026 Tamil year: Vishvavasu (index 38)
    # Therefore 1987 maps to index 0 (Prabhava) for this cycle list.
    cycle_position = (gregorian_year - 1987) % 60

    return TAMIL_YEAR_NAMES[cycle_position]


def get_tamil_month_tamil_name(tamil_month: str) -> str:
    """Get Tamil script name for Tamil month"""
    TAMIL_MONTH_NAMES = {
        "Chithirai": "சித்திரை",
        "Vaikasi": "வைகாசி",
        "Aani": "ஆனி",
        "Aadi": "ஆடி",
        "Aavani": "ஆவணி",
        "Purattaasi": "புரட்டாசி",
        "Aippasi": "ஐப்பசி",
        "Karthigai": "கார்த்திகை",
        "Margazhi": "மார்கழி",
        "Thai": "தை",
        "Maasi": "மாசி",
        "Panguni": "பங்குனி",
    }
    return TAMIL_MONTH_NAMES.get(tamil_month, "")

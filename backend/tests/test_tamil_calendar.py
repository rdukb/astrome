import swisseph as swe

from src.services.calculations.tamil_calendar import (
    calculate_tamil_calendar,
    get_tamil_year_name,
)


def test_get_tamil_year_name_known_cycle_alignment():
    assert get_tamil_year_name(2024) == "Krodhin"
    assert get_tamil_year_name(2025) == "Vishvavasu"
    assert get_tamil_year_name(2026) == "Parabhava"


def test_calculate_tamil_calendar_pre_mesha_uses_previous_tamil_year():
    # February 7, 2026 (before Mesha Sankranti) should still be the 2025 Tamil year.
    jd = swe.julday(2026, 2, 7, 12.0)
    result = calculate_tamil_calendar(jd)
    assert result["tamil_year"] == "Vishvavasu"


def test_calculate_tamil_calendar_post_mesha_uses_current_tamil_year():
    # April 20, 2026 (after Mesha Sankranti) should be 2026 Tamil year.
    jd = swe.julday(2026, 4, 20, 12.0)
    result = calculate_tamil_calendar(jd)
    assert result["tamil_year"] == "Parabhava"

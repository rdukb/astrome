"""
Inauspicious Times Calculation Service

Calculates Rahu Kalam, Gulika Kalam, Yamaganda, and Durmuhurtam periods.
Based on weekday and sunrise-sunset division.
"""

from datetime import datetime, timezone
from ...models import TimePeriod


def calculate_rahu_kalam(sunrise_jd: float, sunset_jd: float, weekday: int) -> TimePeriod:
    """
    Calculate Rahu Kalam period (90-minute inauspicious period)

    Args:
        sunrise_jd: Sunrise Julian Day
        sunset_jd: Sunset Julian Day
        weekday: Day of week (0=Monday, 6=Sunday)

    Returns:
        TimePeriod for Rahu Kalam
    """
    # Divide day into 8 equal parts
    day_duration_hours = (sunset_jd - sunrise_jd) * 24
    period_duration_hours = day_duration_hours / 8

    # Rahu Kalam period by weekday (1-indexed periods)
    # Monday=2, Tuesday=7, Wednesday=5, Thursday=6, Friday=4, Saturday=3, Sunday=8
    rahu_period_map = {
        0: 2,  # Monday
        1: 7,  # Tuesday
        2: 5,  # Wednesday
        3: 6,  # Thursday
        4: 4,  # Friday
        5: 3,  # Saturday
        6: 8,  # Sunday
    }

    rahu_period = rahu_period_map[weekday]

    # Calculate start and end times
    rahu_start_jd = sunrise_jd + ((rahu_period - 1) * period_duration_hours / 24)
    rahu_end_jd = rahu_start_jd + (period_duration_hours / 24)

    duration_minutes = int(period_duration_hours * 60)

    return TimePeriod(
        start_time=julian_to_datetime(rahu_start_jd),
        end_time=julian_to_datetime(rahu_end_jd),
        duration_minutes=duration_minutes,
        is_auspicious=False,
    )


def calculate_gulika_kalam(sunrise_jd: float, sunset_jd: float, weekday: int) -> TimePeriod:
    """
    Calculate Gulika Kalam period (similar to Rahu Kalam, different periods)

    Args:
        sunrise_jd: Sunrise Julian Day
        sunset_jd: Sunset Julian Day
        weekday: Day of week (0=Monday, 6=Sunday)

    Returns:
        TimePeriod for Gulika Kalam
    """
    day_duration_hours = (sunset_jd - sunrise_jd) * 24
    period_duration_hours = day_duration_hours / 8

    # Gulika period by weekday
    # Monday=7, Tuesday=6, Wednesday=4, Thursday=3, Friday=2, Saturday=1, Sunday=5
    gulika_period_map = {
        0: 7,  # Monday
        1: 6,  # Tuesday
        2: 4,  # Wednesday
        3: 3,  # Thursday
        4: 2,  # Friday
        5: 1,  # Saturday
        6: 5,  # Sunday
    }

    gulika_period = gulika_period_map[weekday]

    gulika_start_jd = sunrise_jd + ((gulika_period - 1) * period_duration_hours / 24)
    gulika_end_jd = gulika_start_jd + (period_duration_hours / 24)

    duration_minutes = int(period_duration_hours * 60)

    return TimePeriod(
        start_time=julian_to_datetime(gulika_start_jd),
        end_time=julian_to_datetime(gulika_end_jd),
        duration_minutes=duration_minutes,
        is_auspicious=False,
    )


def calculate_yamaganda_kalam(sunrise_jd: float, sunset_jd: float, weekday: int) -> TimePeriod:
    """
    Calculate Yamaganda Kalam period

    Args:
        sunrise_jd: Sunrise Julian Day
        sunset_jd: Sunset Julian Day
        weekday: Day of week (0=Monday, 6=Sunday)

    Returns:
        TimePeriod for Yamaganda
    """
    day_duration_hours = (sunset_jd - sunrise_jd) * 24
    period_duration_hours = day_duration_hours / 8

    # Yamaganda period by weekday
    # Monday=5, Tuesday=4, Wednesday=3, Thursday=2, Friday=1, Saturday=6, Sunday=8
    yamaganda_period_map = {
        0: 5,  # Monday
        1: 4,  # Tuesday
        2: 3,  # Wednesday
        3: 2,  # Thursday
        4: 1,  # Friday
        5: 6,  # Saturday
        6: 8,  # Sunday
    }

    yamaganda_period = yamaganda_period_map[weekday]

    yamaganda_start_jd = sunrise_jd + ((yamaganda_period - 1) * period_duration_hours / 24)
    yamaganda_end_jd = yamaganda_start_jd + (period_duration_hours / 24)

    duration_minutes = int(period_duration_hours * 60)

    return TimePeriod(
        start_time=julian_to_datetime(yamaganda_start_jd),
        end_time=julian_to_datetime(yamaganda_end_jd),
        duration_minutes=duration_minutes,
        is_auspicious=False,
    )


def calculate_durmuhurtam(sunrise_jd: float, sunset_jd: float) -> list[TimePeriod]:
    """
    Calculate Durmuhurtam periods (2 per day, each 48 minutes)

    Args:
        sunrise_jd: Sunrise Julian Day
        sunset_jd: Sunset Julian Day

    Returns:
        List of 2 TimePeriod objects for Durmuhurtam
    """
    day_duration_minutes = (sunset_jd - sunrise_jd) * 24 * 60
    muhurat_duration = day_duration_minutes / 15  # 15 muhurats in a day

    periods = []

    # Morning Durmuhurtam (10th muhurat)
    morning_start_jd = sunrise_jd + ((9 * muhurat_duration) / (24 * 60))
    morning_end_jd = morning_start_jd + (muhurat_duration / (24 * 60))

    periods.append(
        TimePeriod(
            start_time=julian_to_datetime(morning_start_jd),
            end_time=julian_to_datetime(morning_end_jd),
            duration_minutes=int(muhurat_duration),
            is_auspicious=False,
        )
    )

    # Evening Durmuhurtam (12th muhurat)
    evening_start_jd = sunrise_jd + ((11 * muhurat_duration) / (24 * 60))
    evening_end_jd = evening_start_jd + (muhurat_duration / (24 * 60))

    periods.append(
        TimePeriod(
            start_time=julian_to_datetime(evening_start_jd),
            end_time=julian_to_datetime(evening_end_jd),
            duration_minutes=int(muhurat_duration),
            is_auspicious=False,
        )
    )

    return periods


def julian_to_datetime(julian_day: float) -> datetime:
    """Convert Julian Day to Python datetime (UTC timezone-aware)"""
    import swisseph as swe

    year, month, day, hour = swe.revjul(julian_day)
    hour_int = int(hour)
    minute = int((hour - hour_int) * 60)
    second = int(((hour - hour_int) * 60 - minute) * 60)

    return datetime(int(year), int(month), int(day), hour_int, minute, second, tzinfo=timezone.utc)

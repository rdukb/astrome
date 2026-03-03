"""
Swiss Ephemeris wrapper for astronomical calculations.

Provides high-level interface to pyswisseph library with:
- Automatic ephemeris path configuration
- Thread-safe singleton pattern
- Error handling and logging
- Utility functions for common calculations
"""

import os
from datetime import datetime, timezone
from functools import lru_cache
from typing import Optional, Tuple

import swisseph as swe

from src.config.logging import get_logger

logger = get_logger(__name__)


class SwissEphemeris:
    """
    Wrapper class for Swiss Ephemeris calculations.

    Handles initialization, configuration, and provides
    convenience methods for Panchang-related astronomical calculations.

    Thread-safe singleton instance via get_ephemeris() function.
    """

    # Ephemeris flags
    FLG_SWIEPH = swe.FLG_SWIEPH  # Use Swiss Ephemeris files
    FLG_MOSEPH = swe.FLG_MOSEPH  # Use built-in Moshier ephemeris
    FLG_SIDEREAL = swe.FLG_SIDEREAL  # Sidereal calculations

    # Ayanamsa types
    SIDM_LAHIRI = swe.SIDM_LAHIRI  # Lahiri ayanamsa (Indian standard)

    def __init__(self, ephe_path: str = ""):
        """
        Initialize Swiss Ephemeris wrapper.

        Args:
            ephe_path: Path to ephemeris data files.
                      Empty string uses built-in Moshier ephemeris.

        Note:
            Built-in Moshier provides <0.1 arcsec precision (3000 BC - 3000 AD).
            External files provide 0.001 arcsec precision (1800 CE - 2400 CE).
        """
        self.ephe_path = ephe_path
        self._initialized = False
        self._using_builtin = False
        self._initialize()

    def _initialize(self) -> None:
        """
        Initialize Swiss Ephemeris library.

        Sets ephemeris path and configures sidereal mode with Lahiri ayanamsa.
        """
        if self._initialized:
            return

        try:
            # Set ephemeris path
            if self.ephe_path and os.path.exists(self.ephe_path):
                swe.set_ephe_path(self.ephe_path)
                logger.info(f"Swiss Ephemeris initialized with path: {self.ephe_path}")
                self._using_builtin = False

                # Verify files exist
                test_files = ["seas_18.se1", "semo_18.se1", "sepl_18.se1"]
                existing_files = [
                    f for f in test_files if os.path.exists(os.path.join(self.ephe_path, f))
                ]
                logger.info(f"Found {len(existing_files)}/3 ephemeris files: {existing_files}")
            else:
                # Use built-in Moshier ephemeris
                swe.set_ephe_path(None)
                logger.info("Swiss Ephemeris initialized with built-in Moshier ephemeris")
                self._using_builtin = True

            # Set sidereal mode with Lahiri ayanamsa (Indian standard)
            swe.set_sid_mode(self.SIDM_LAHIRI)
            logger.info("Sidereal mode set to Lahiri ayanamsa")

            self._initialized = True

        except Exception as e:
            logger.error(f"Failed to initialize Swiss Ephemeris: {e}")
            # Fall back to built-in ephemeris
            swe.set_ephe_path(None)
            swe.set_sid_mode(self.SIDM_LAHIRI)
            self._using_builtin = True
            self._initialized = True
            logger.warning("Falling back to built-in Moshier ephemeris")

    def is_using_builtin(self) -> bool:
        """Check if using built-in Moshier ephemeris (vs external files)."""
        return self._using_builtin

    def close(self) -> None:
        """Close Swiss Ephemeris and free resources."""
        swe.close()
        self._initialized = False
        logger.info("Swiss Ephemeris closed")

    @staticmethod
    def datetime_to_julian_day(dt: datetime) -> float:
        """
        Convert Python datetime to Julian Day number.

        Args:
            dt: Datetime object (any timezone, will be converted to UTC)

        Returns:
            Julian Day number (float)
        """
        # Convert to UTC if timezone-aware
        if dt.tzinfo is not None:
            dt_utc = dt.astimezone(timezone.utc)
        else:
            dt_utc = dt

        # Calculate Julian Day
        jd = swe.julday(
            dt_utc.year,
            dt_utc.month,
            dt_utc.day,
            dt_utc.hour + dt_utc.minute / 60.0 + dt_utc.second / 3600.0,
        )
        return jd

    @staticmethod
    def julian_day_to_datetime(jd: float) -> datetime:
        """
        Convert Julian Day number to Python datetime (UTC).

        Args:
            jd: Julian Day number

        Returns:
            Datetime object in UTC
        """
        year, month, day, hour = swe.revjul(jd)

        # Convert fractional hour to hour, minute, second
        hour_int = int(hour)
        minute_float = (hour - hour_int) * 60
        minute_int = int(minute_float)
        second = (minute_float - minute_int) * 60

        return datetime(
            year,
            month,
            day,
            hour_int,
            minute_int,
            int(second),
            int((second % 1) * 1_000_000),  # microseconds
            tzinfo=timezone.utc,
        )

    def get_planet_position(
        self,
        planet: int,
        jd: float,
        flags: Optional[int] = None,
    ) -> Tuple[float, float, float, float, float, float]:
        """
        Calculate planet position.

        Args:
            planet: Planet ID (swe.SUN, swe.MOON, swe.MARS, etc.)
            jd: Julian Day number
            flags: Calculation flags (default: FLG_SWIEPH | FLG_SIDEREAL)

        Returns:
            Tuple of (longitude, latitude, distance, speed_lon, speed_lat, speed_dist)

        Raises:
            RuntimeError: If calculation fails
        """
        if flags is None:
            flags = self.FLG_SWIEPH | self.FLG_SIDEREAL

        result, ret_flag = swe.calc_ut(jd, planet, flags)

        if ret_flag < 0:
            error_msg = swe.get_error_string()
            raise RuntimeError(f"Swiss Ephemeris calculation failed: {error_msg}")

        return tuple(result)

    def get_sun_position(self, jd: float) -> Tuple[float, float, float, float, float, float]:
        """Get Sun's sidereal longitude and other coordinates."""
        return self.get_planet_position(swe.SUN, jd)

    def get_moon_position(self, jd: float) -> Tuple[float, float, float, float, float, float]:
        """Get Moon's sidereal longitude and other coordinates."""
        return self.get_planet_position(swe.MOON, jd)

    def get_sunrise_sunset(
        self,
        jd: float,
        latitude: float,
        longitude: float,
        altitude: float = 0.0,
    ) -> Tuple[Optional[float], Optional[float]]:
        """
        Calculate sunrise and sunset times.

        Args:
            jd: Julian Day number (for the date, time is ignored)
            latitude: Geographic latitude in degrees
            longitude: Geographic longitude in degrees
            altitude: Altitude in meters above sea level (default: 0)

        Returns:
            Tuple of (sunrise_jd, sunset_jd) or (None, None) if no rise/set
        """
        # Get sunrise
        result_rise = swe.rise_trans(
            jd,
            swe.SUN,
            swe.CALC_RISE,
            (longitude, latitude, altitude),
        )

        # Get sunset
        result_set = swe.rise_trans(
            jd,
            swe.SUN,
            swe.CALC_SET,
            (longitude, latitude, altitude),
        )

        sunrise_jd = result_rise[1][0] if result_rise[0] >= 0 else None
        sunset_jd = result_set[1][0] if result_set[0] >= 0 else None

        return sunrise_jd, sunset_jd

    def get_moonrise_moonset(
        self,
        jd: float,
        latitude: float,
        longitude: float,
        altitude: float = 0.0,
    ) -> Tuple[Optional[float], Optional[float]]:
        """
        Calculate moonrise and moonset times.

        Args:
            jd: Julian Day number (for the date, time is ignored)
            latitude: Geographic latitude in degrees
            longitude: Geographic longitude in degrees
            altitude: Altitude in meters above sea level (default: 0)

        Returns:
            Tuple of (moonrise_jd, moonset_jd) or (None, None) if no rise/set
        """
        # Get moonrise
        result_rise = swe.rise_trans(
            jd,
            swe.MOON,
            swe.CALC_RISE,
            (longitude, latitude, altitude),
        )

        # Get moonset
        result_set = swe.rise_trans(
            jd,
            swe.MOON,
            swe.CALC_SET,
            (longitude, latitude, altitude),
        )

        moonrise_jd = result_rise[1][0] if result_rise[0] >= 0 else None
        moonset_jd = result_set[1][0] if result_set[0] >= 0 else None

        return moonrise_jd, moonset_jd

    def get_ayanamsa(self, jd: float) -> float:
        """
        Get ayanamsa value (precession correction).

        Args:
            jd: Julian Day number

        Returns:
            Ayanamsa in degrees
        """
        return swe.get_ayanamsa_ut(jd)


@lru_cache()
def get_ephemeris(ephe_path: str = "") -> SwissEphemeris:
    """
    Get cached Swiss Ephemeris instance (singleton).

    Args:
        ephe_path: Path to ephemeris files (default: use environment/config)

    Returns:
        SwissEphemeris singleton instance

    Note:
        Uses lru_cache to ensure only one instance per ephe_path.
        Call without arguments to use default path from settings.
    """
    if not ephe_path:
        # Try to get from settings
        try:
            from src.config import get_settings

            settings = get_settings()
            ephe_path = settings.ephe_path_absolute
        except ImportError:
            ephe_path = ""

    return SwissEphemeris(ephe_path)

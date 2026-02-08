# Swiss Ephemeris Files

This directory is for optional Swiss Ephemeris data files for astronomical calculations.

## Built-in Moshier Ephemeris (Default - No Files Needed)

**Good news!** pyswisseph includes the **Moshier ephemeris** built-in, which provides:
- **Planetary positions**: <0.1 arcsecond precision
- **Moon positions**: ~3 arcseconds precision
- **Date range**: 3000 BC to 3000 AD (covers our ±100 year requirement)
- **No external files required**

This precision is sufficient for Panchang calculations. The Swiss Ephemeris automatically uses the Moshier ephemeris when external files are not present.

## Optional High-Precision Files (~15MB total)

For maximum precision (0.001 arcsec), you can optionally download:

1. **seas_18.se1** - Main asteroid/planet ephemeris (5.2MB)
2. **semo_18.se1** - Moon ephemeris (8.1MB)
3. **sepl_18.se1** - Outer planets (1.5MB)

### Download Status

⚠️ **Note**: As of Feb 2026, the official download URLs are not accessible:
- `https://www.astro.com/ftp/swisseph/ephe/` returns 404 errors
- FTP server `ftp://ftp.astro.com/pub/swisseph/ephe/` is not responding
- GitHub mirror at `https://github.com/aloistr/swisseph` does not include large binary files

### Alternative: Use Built-in Ephemeris

Since external files are not easily obtainable and the built-in Moshier ephemeris provides excellent precision for our needs, **we recommend using the default built-in ephemeris** without downloading external files.

## Configuration

In `backend/.env`, set the ephemeris path (can be empty for built-in):

```env
# Leave empty to use built-in Moshier ephemeris
EPHE_PATH=""

# Or set to this directory if you obtain external files
# EPHE_PATH="/absolute/path/to/backend/src/data/ephe"
```

## Date Range Coverage

- **Built-in Moshier**: 3000 BC to 3000 AD
- **External files** (if obtained): 1800 CE to 2400 CE

Both exceed our requirement of ±100 years from 2026.

## License

Swiss Ephemeris is dual-licensed:
- **AGPL-3.0** (free, open source) - used by this project
- **Commercial license** (paid, for proprietary software)

See https://www.astro.com/swisseph/ for details.

## References

- Swiss Ephemeris Info: https://www.astro.com/swisseph/swephinfo_e.htm
- pyswisseph Documentation: https://astrorigin.com/pyswisseph
- GitHub Repository: https://github.com/aloistr/swisseph

"""
Panchang API Routes

FastAPI routes for Panchang calculations.
"""

from datetime import datetime, timedelta
from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from pydantic import BaseModel, Field, field_validator
import pytz
import traceback

from src.models import DailyPanchang
from src.services.panchang_calculator import get_panchang_calculator
from src.config.settings import get_settings
from src.config.logging import get_logger

logger = get_logger(__name__)

router = APIRouter(prefix="/api/v1/panchang", tags=["panchang"])


class PanchangRequest(BaseModel):
    """Request model for Panchang calculation"""

    date: str = Field(..., description="Date in YYYY-MM-DD format")
    latitude: float = Field(..., ge=-66.5, le=66.5, description="Latitude (-66.5 to +66.5)")
    longitude: float = Field(..., ge=-180, le=180, description="Longitude (-180 to +180)")
    timezone: str = Field(..., description="IANA timezone (e.g., 'Asia/Kolkata')")
    location_id: Optional[str] = Field(default=None, description="Optional location UUID")

    @field_validator("date")
    @classmethod
    def validate_date_format(cls, v):
        """Validate ISO 8601 date format"""
        try:
            datetime.fromisoformat(v)
        except ValueError:
            raise ValueError("date must be in YYYY-MM-DD format")
        return v

    @field_validator("timezone")
    @classmethod
    def validate_timezone(cls, v):
        """Validate IANA timezone"""
        try:
            pytz.timezone(v)
        except pytz.UnknownTimeZoneError:
            raise ValueError(f"Invalid timezone: {v}")
        return v


class PanchangResponse(BaseModel):
    """Response model for Panchang calculation"""

    success: bool = True
    data: DailyPanchang
    message: str = "Panchang calculated successfully"


class PanchangRangeResponse(BaseModel):
    """Response model for Panchang range calculation"""

    success: bool = True
    data: list[DailyPanchang]
    date_range: dict[str, str]
    message: str = "Panchang range calculated successfully"


@router.get("", response_model=PanchangResponse)
@router.get("/", response_model=PanchangResponse, include_in_schema=False)
@router.get("/daily", response_model=PanchangResponse, include_in_schema=False)
async def get_daily_panchang(
    date: str = Query(..., description="Date in YYYY-MM-DD format"),
    latitude: float = Query(..., ge=-66.5, le=66.5, description="Latitude"),
    longitude: float = Query(..., ge=-180, le=180, description="Longitude"),
    timezone: str = Query(..., description="IANA timezone"),
    location_id: Optional[str] = Query(default=None, description="Location UUID"),
):
    """
    Get daily Panchang for a specific date and location

    Args:
        date: Calculation date (YYYY-MM-DD)
        latitude: Location latitude
        longitude: Location longitude
        timezone: IANA timezone identifier
        location_id: Optional location UUID

    Returns:
        PanchangResponse with complete daily Panchang data

    Raises:
        HTTPException: For invalid parameters or calculation errors
    """
    try:
        # Validate and parse date
        try:
            calculation_date = datetime.fromisoformat(date).date()
        except ValueError:
            raise HTTPException(status_code=422, detail="Invalid date format. Use YYYY-MM-DD")

        # Validate timezone
        try:
            pytz.timezone(timezone)
        except pytz.UnknownTimeZoneError:
            raise HTTPException(status_code=422, detail=f"Invalid timezone: {timezone}")

        # Validate date range (ephemeris range)
        if calculation_date.year < 1900 or calculation_date.year > 2100:
            raise HTTPException(
                status_code=422, detail="Date must be between 1900-01-01 and 2100-12-31"
            )

        # Get calculator instance
        settings = get_settings()
        calculator = get_panchang_calculator(settings.ephe_path_absolute)

        # Calculate Panchang
        panchang = calculator.calculate_daily_panchang(
            calculation_date=calculation_date,
            latitude=latitude,
            longitude=longitude,
            timezone=timezone,
            location_id=location_id,
        )

        return PanchangResponse(
            success=True, data=panchang, message="Panchang calculated successfully"
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"GET /daily - Panchang calculation failed: {str(e)}")
        logger.error(f"GET /daily - Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Panchang calculation failed: {str(e)}")


@router.post("/daily", response_model=PanchangResponse)
async def post_daily_panchang(request: PanchangRequest):
    """
    Get daily Panchang (POST version for complex requests)

    Args:
        request: PanchangRequest with date, location, timezone

    Returns:
        PanchangResponse with complete daily Panchang data
    """
    try:
        calculation_date = datetime.fromisoformat(request.date).date()

        # Validate date range
        if calculation_date.year < 1900 or calculation_date.year > 2100:
            raise HTTPException(
                status_code=422, detail="Date must be between 1900-01-01 and 2100-12-31"
            )

        # Get calculator
        settings = get_settings()
        calculator = get_panchang_calculator(settings.ephe_path_absolute)

        # Calculate Panchang
        panchang = calculator.calculate_daily_panchang(
            calculation_date=calculation_date,
            latitude=request.latitude,
            longitude=request.longitude,
            timezone=request.timezone,
            location_id=request.location_id,
        )

        return PanchangResponse(
            success=True, data=panchang, message="Panchang calculated successfully"
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"POST /daily - Panchang calculation failed: {str(e)}")
        logger.error(f"POST /daily - Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Panchang calculation failed: {str(e)}")


@router.get("/range", response_model=PanchangRangeResponse)
async def get_panchang_range(
    start_date: str = Query(..., description="Start date in YYYY-MM-DD format"),
    end_date: str = Query(..., description="End date in YYYY-MM-DD format"),
    latitude: float = Query(..., ge=-66.5, le=66.5, description="Latitude"),
    longitude: float = Query(..., ge=-180, le=180, description="Longitude"),
    timezone: str = Query(..., description="IANA timezone"),
    location_id: Optional[str] = Query(default=None, description="Location UUID"),
):
    """
    Get Panchang data for a date range (inclusive).

    Maximum supported range is 31 days.
    """
    try:
        try:
            start = datetime.fromisoformat(start_date).date()
            end = datetime.fromisoformat(end_date).date()
        except ValueError:
            raise HTTPException(
                status_code=422,
                detail="Invalid date format. Use YYYY-MM-DD for start_date and end_date",
            )

        if end < start:
            raise HTTPException(status_code=422, detail="end_date must be on or after start_date")

        total_days = (end - start).days + 1
        if total_days > 31:
            raise HTTPException(status_code=422, detail="Date range must not exceed 31 days")

        try:
            pytz.timezone(timezone)
        except pytz.UnknownTimeZoneError:
            raise HTTPException(status_code=422, detail=f"Invalid timezone: {timezone}")

        if start.year < 1900 or end.year > 2100:
            raise HTTPException(
                status_code=422, detail="Dates must be between 1900-01-01 and 2100-12-31"
            )

        settings = get_settings()
        calculator = get_panchang_calculator(settings.ephe_path_absolute)

        data: list[DailyPanchang] = []
        current_date = start
        while current_date <= end:
            data.append(
                calculator.calculate_daily_panchang(
                    calculation_date=current_date,
                    latitude=latitude,
                    longitude=longitude,
                    timezone=timezone,
                    location_id=location_id,
                )
            )
            current_date += timedelta(days=1)

        return PanchangRangeResponse(
            success=True,
            data=data,
            date_range={"start_date": start.isoformat(), "end_date": end.isoformat()},
            message=f"Panchang calculated for {total_days} day(s)",
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"GET /range - Panchang range calculation failed: {str(e)}")
        logger.error(f"GET /range - Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Panchang range calculation failed: {str(e)}")

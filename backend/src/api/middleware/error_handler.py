"""
Error handling middleware for FastAPI.

Provides standardized error responses for:
- Validation errors (422)
- Not found errors (404)
- Server errors (500)
- Custom application errors
"""

import traceback
from typing import Any, Dict

from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from pydantic import ValidationError

from src.config.logging import get_logger

logger = get_logger(__name__)


class APIError(Exception):
    """
    Base exception for API errors.

    Attributes:
        status_code: HTTP status code
        message: Error message
        details: Additional error details
    """

    def __init__(
        self,
        message: str,
        status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR,
        details: Any = None,
    ):
        self.message = message
        self.status_code = status_code
        self.details = details
        super().__init__(self.message)


class NotFoundError(APIError):
    """Resource not found error (404)."""

    def __init__(self, message: str = "Resource not found", details: Any = None):
        super().__init__(message, status.HTTP_404_NOT_FOUND, details)


class ValidationError(APIError):
    """Validation error (422)."""

    def __init__(self, message: str = "Validation failed", details: Any = None):
        super().__init__(message, status.HTTP_422_UNPROCESSABLE_ENTITY, details)


class ServerError(APIError):
    """Internal server error (500)."""

    def __init__(self, message: str = "Internal server error", details: Any = None):
        super().__init__(message, status.HTTP_500_INTERNAL_SERVER_ERROR, details)


def create_error_response(
    status_code: int,
    message: str,
    details: Any = None,
    request_id: str = None,
) -> Dict[str, Any]:
    """
    Create standardized error response.

    Args:
        status_code: HTTP status code
        message: Error message
        details: Additional error details
        request_id: Request identifier for tracking

    Returns:
        Error response dictionary
    """
    response = {
        "error": {
            "status_code": status_code,
            "message": message,
        }
    }

    if details:
        response["error"]["details"] = details

    if request_id:
        response["error"]["request_id"] = request_id

    return response


async def api_error_handler(request: Request, exc: APIError) -> JSONResponse:
    """
    Handle custom API errors.

    Args:
        request: FastAPI request object
        exc: APIError instance

    Returns:
        JSON response with error details
    """
    logger.warning(
        f"API Error: {exc.status_code} - {exc.message}",
        extra={
            "status_code": exc.status_code,
            "path": request.url.path,
            "method": request.method,
        },
    )

    return JSONResponse(
        status_code=exc.status_code,
        content=create_error_response(
            exc.status_code,
            exc.message,
            exc.details,
        ),
    )


async def validation_error_handler(
    request: Request,
    exc: RequestValidationError,
) -> JSONResponse:
    """
    Handle Pydantic validation errors.

    Args:
        request: FastAPI request object
        exc: RequestValidationError instance

    Returns:
        JSON response with validation error details
    """
    logger.warning(
        f"Validation Error: {exc.errors()}",
        extra={
            "path": request.url.path,
            "method": request.method,
        },
    )

    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content=create_error_response(
            status.HTTP_422_UNPROCESSABLE_ENTITY,
            "Validation failed",
            details=exc.errors(),
        ),
    )


async def generic_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """
    Handle unexpected exceptions.

    Args:
        request: FastAPI request object
        exc: Exception instance

    Returns:
        JSON response with generic error message
    """
    logger.error(
        f"Unexpected error: {str(exc)}",
        extra={
            "path": request.url.path,
            "method": request.method,
            "traceback": traceback.format_exc(),
        },
    )

    # In production, don't expose internal error details
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content=create_error_response(
            status.HTTP_500_INTERNAL_SERVER_ERROR,
            "An unexpected error occurred",
        ),
    )


def add_error_handlers(app: FastAPI) -> None:
    """
    Register error handlers with FastAPI app.

    Args:
        app: FastAPI application instance
    """
    app.add_exception_handler(APIError, api_error_handler)
    app.add_exception_handler(RequestValidationError, validation_error_handler)
    app.add_exception_handler(Exception, generic_exception_handler)

    logger.info("Error handlers registered")

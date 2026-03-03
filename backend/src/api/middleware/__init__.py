"""
Middleware package for FastAPI.

Provides error handling, CORS, logging, and rate limiting middleware.
"""

from .error_handler import add_error_handlers

__all__ = ["add_error_handlers"]

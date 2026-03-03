"""
Logging configuration for Tamil Panchang API.

Provides structured logging with file and console handlers,
rotation, and configurable log levels.
"""

import logging
import logging.handlers
import os
from pathlib import Path
from typing import Optional


def setup_logging(
    log_level: str = "INFO",
    log_file: str = "./logs/astrome.log",
    max_bytes: int = 10 * 1024 * 1024,  # 10MB
    backup_count: int = 5,
) -> logging.Logger:
    """
    Configure application logging with file and console handlers.

    Args:
        log_level: Logging level (DEBUG, INFO, WARNING, ERROR, CRITICAL)
        log_file: Path to log file
        max_bytes: Maximum log file size before rotation
        backup_count: Number of backup files to keep

    Returns:
        Configured logger instance

    Features:
        - Console handler with colored output (if colorlog available)
        - Rotating file handler with automatic backup
        - Structured log format with timestamp, level, module
        - Separate error log file for ERROR+ messages
    """

    # Create logs directory if it doesn't exist
    log_path = Path(log_file)
    log_path.parent.mkdir(parents=True, exist_ok=True)

    # Convert log level string to logging constant
    numeric_level = getattr(logging, log_level.upper(), logging.INFO)

    # Create root logger
    logger = logging.getLogger("astrome")
    logger.setLevel(numeric_level)

    # Clear any existing handlers
    logger.handlers.clear()

    # Log format
    log_format = "%(asctime)s - %(name)s - %(levelname)s - %(module)s:%(funcName)s:%(lineno)d - %(message)s"
    date_format = "%Y-%m-%d %H:%M:%S"
    formatter = logging.Formatter(log_format, datefmt=date_format)

    # Console handler
    console_handler = logging.StreamHandler()
    console_handler.setLevel(numeric_level)
    console_handler.setFormatter(formatter)
    logger.addHandler(console_handler)

    # Rotating file handler (all levels)
    file_handler = logging.handlers.RotatingFileHandler(
        log_file,
        maxBytes=max_bytes,
        backupCount=backup_count,
        encoding="utf-8",
    )
    file_handler.setLevel(numeric_level)
    file_handler.setFormatter(formatter)
    logger.addHandler(file_handler)

    # Separate error log file (ERROR and above only)
    error_log_file = log_path.parent / f"{log_path.stem}_error.log"
    error_handler = logging.handlers.RotatingFileHandler(
        str(error_log_file),
        maxBytes=max_bytes,
        backupCount=backup_count,
        encoding="utf-8",
    )
    error_handler.setLevel(logging.ERROR)
    error_handler.setFormatter(formatter)
    logger.addHandler(error_handler)

    # Log initial message
    logger.info(f"Logging initialized: level={log_level}, file={log_file}")

    return logger


def get_logger(name: Optional[str] = None) -> logging.Logger:
    """
    Get a logger instance for a specific module.

    Args:
        name: Logger name (typically __name__). If None, returns root astrome logger.

    Returns:
        Logger instance

    Usage:
        logger = get_logger(__name__)
        logger.info("Processing Panchang calculation")
    """
    if name:
        return logging.getLogger(f"astrome.{name}")
    return logging.getLogger("astrome")

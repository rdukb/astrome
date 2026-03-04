FROM python:3.11-slim

WORKDIR /app

# Install system build deps, compile Python packages, then purge build tools —
# all in one layer so gcc/g++/python3-dev don't bloat the final image (~30 MB savings).
# pyswisseph requires gcc + g++ (swhdbxx.cpp); strip pytest/black/ruff/mypy from prod install.
COPY requirements.txt .
RUN apt-get update \
    && apt-get install -y --no-install-recommends gcc g++ python3-dev \
    && grep -Ev '^(pytest|pytest-asyncio|pytest-cov|black|ruff|mypy)\b' requirements.txt \
         > requirements.prod.txt \
    && pip install --no-cache-dir -r requirements.prod.txt \
    && apt-get purge -y --auto-remove gcc g++ python3-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy application source (includes src/data/ephe for Swiss Ephemeris .se1 files)
COPY src/ ./src/

# Cloud Run injects $PORT at runtime (default 8080)
ENV PORT=8080

# Single worker — Cloud Run scales via instances, not in-process workers
CMD exec uvicorn src.main:app --host 0.0.0.0 --port ${PORT} --workers 1

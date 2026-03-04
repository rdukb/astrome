FROM python:3.11-slim

WORKDIR /app

# Install system dependencies needed by pyswisseph (C + C++ extension) and timezonefinder
RUN apt-get update \
    && apt-get install -y --no-install-recommends gcc g++ python3-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies first (layer-cached until requirements change)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application source (includes src/data/ephe for Swiss Ephemeris .se1 files)
COPY src/ ./src/

# Cloud Run injects $PORT at runtime (default 8080)
ENV PORT=8080

# Single worker — Cloud Run scales via instances, not in-process workers
CMD exec uvicorn src.main:app --host 0.0.0.0 --port ${PORT} --workers 1

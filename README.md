# Astrome - Tamil Panchangam Web Application

**Version**: 1.0.0
**License**: AGPL-3.0
**Status**: In Development (Phase 2 - Foundation Complete)

## Overview

Astrome is a Progressive Web Application that displays daily Tamil Panchang (Hindu almanac) with accurate Vedic/South Indian astronomical calculations. Users can view location-specific auspicious and inauspicious times (Rahu Kalam, Gulika, Abhijit Muhurat), special observance days (Ekadashi, Pradosham), and receive contextual education on Panchang terms through interactive tooltips.

**Key Features:**
- 📅 Daily and monthly Panchang views with complete astronomical data
- 🌍 Location-based calculations using browser geolocation or manual entry
- 🎓 Interactive tooltips explaining Panchang terms in English and Tamil
- ✨ Visual distinction between auspicious and inauspicious time periods
- 💾 Offline-first architecture with Service Worker caching
- 🔒 Privacy-focused: all data stored locally, no cloud sync
- 🌙 Accurate calculations using Swiss Ephemeris (JPL-derived data)

## Project Structure

```
astrome/
├── backend/           # FastAPI Python backend
│   ├── src/
│   │   ├── api/      # REST API routes and middleware
│   │   ├── models/   # Pydantic models
│   │   ├── services/ # Business logic (Panchang calculations)
│   │   ├── db/       # Database (SQLite)
│   │   ├── config/   # Configuration
│   │   └── data/     # Ephemeris files + preloaded cities
│   ├── tests/        # Backend tests (pytest)
│   └── docs/         # API documentation
│
├── frontend/         # Next.js React frontend
│   ├── app/          # Next.js 16 App Router pages
│   ├── components/   # React components
│   ├── hooks/        # Custom React hooks
│   ├── services/     # API client
│   ├── stores/       # Zustand state management
│   └── tests/        # Frontend tests (Vitest, Playwright)
│
└── specs/            # Feature specifications
    └── 001-tamil-panchang-ui/
        ├── spec.md
        ├── plan.md
        ├── research.md
        ├── data-model.md
        ├── contracts/
        ├── quickstart.md
        └── tasks.md
```

## Quick Start

### Prerequisites

- **Python 3.11 or 3.12** (3.13+ may have package compatibility issues)
- Node.js 18+
- npm 9+
- Git 2.30+

### Backend Setup

```bash
# Navigate to backend
cd backend

# Create virtual environment (use Python 3.11 or 3.12)
python3.11 -m venv venv  # or python3.12
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Download Swiss Ephemeris files (~15MB)
cd src/data/ephe
wget https://www.astro.com/ftp/swisseph/ephe/seas_18.se1
wget https://www.astro.com/ftp/swisseph/ephe/semo_18.se1
wget https://www.astro.com/ftp/swisseph/ephe/sepl_18.se1
cd ../../..

# Copy environment file
cp .env.example .env

# Run backend (after Phase 2 implementation)
# uvicorn src.main:app --reload --port 8000
```

### Frontend Setup

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Copy environment file
cp .env.local.example .env.local

# Run development server (after Phase 2 implementation)
# npm run dev
```

## Tech Stack

### Backend
- **Framework**: FastAPI 0.104+
- **Language**: Python 3.11+
- **Astronomy**: pyswisseph 2.10+ (Swiss Ephemeris bindings)
- **Database**: SQLite3 with SQLAlchemy 2.0+
- **Validation**: Pydantic 2.5+
- **Server**: Uvicorn (ASGI)

### Frontend
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript 5.9+
- **UI Library**: React 19
- **Styling**: Tailwind CSS 4
- **State Management**: Zustand 5
- **Data Fetching**: TanStack React Query 5
- **Offline**: Workbox Service Worker, IndexedDB

## Development Status

### Phase 1: Setup ✅ (Complete)
- [x] Directory structure created
- [x] Python project initialized (pyproject.toml, requirements.txt)
- [x] Next.js project initialized (package.json, tsconfig.json)
- [x] Configuration files created
- [x] Sample Indian cities data added
- [x] .gitignore configured

### Phase 2: Foundational ✅ (Complete)
- [x] Database schema and migrations
- [x] Swiss Ephemeris wrapper
- [x] FastAPI app with routes
- [x] React context providers
- [x] Base UI components

### Phase 3-8: Feature Implementation
See [tasks.md](specs/001-tamil-panchang-ui/tasks.md) for complete task breakdown.

## Documentation

- **[Quickstart Guide](specs/001-tamil-panchang-ui/quickstart.md)**: Detailed setup instructions
- **[Implementation Plan](specs/001-tamil-panchang-ui/plan.md)**: Technical architecture
- **[Research Document](specs/001-tamil-panchang-ui/research.md)**: Astronomical algorithms
- **[Data Model](specs/001-tamil-panchang-ui/data-model.md)**: Entity schemas
- **[API Contracts](specs/001-tamil-panchang-ui/contracts/panchang-api.yaml)**: OpenAPI specification
- **[Tasks](specs/001-tamil-panchang-ui/tasks.md)**: Implementation task breakdown

## Troubleshooting

### Python Version Issues

**Problem**: `pip install` fails with build errors for `pydantic-core` or `h3`

**Cause**: Using Python 3.13+ which doesn't have prebuilt binary wheels yet

**Solution**:
```bash
# Check your Python version
python3 --version

# If it shows 3.13 or higher, install Python 3.11 or 3.12
# On macOS with Homebrew:
brew install python@3.11

# On Ubuntu:
sudo apt install python3.11 python3.11-venv

# Recreate virtual environment with the correct version
cd backend
rm -rf venv
python3.11 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### Ephemeris File Download Issues

**Problem**: Ephemeris files return 404 errors or HTML pages

**Solution**: The project includes downloaded ephemeris files (~1.9MB) in `backend/src/data/ephe/`. If missing, download from:
```bash
cd backend/src/data/ephe
wget https://github.com/aloistr/swisseph/raw/master/ephe/seas_18.se1
wget https://github.com/aloistr/swisseph/raw/master/ephe/semo_18.se1
wget https://github.com/aloistr/swisseph/raw/master/ephe/sepl_18.se1
```

## Constitution Principles

Astrome follows 5 core principles defined in [.specify/memory/constitution.md](.specify/memory/constitution.md):

1. **Astronomical Accuracy**: Swiss Ephemeris with ±1 arc-minute precision
2. **Location-Based Calculations**: All times calculated for user's coordinates
3. **Data Privacy & Security**: Local-first storage, no cloud sync
4. **Offline-First Architecture**: Service Worker caching, bundled ephemeris
5. **Cultural Sensitivity**: Support for Tamil traditions, bilingual content

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development workflow, code style guide, and PR process.

## License

This project is licensed under the **GNU Affero General Public License v3.0 (AGPL-3.0)** - see [LICENSE](LICENSE) file for details.

The Swiss Ephemeris library is dual-licensed under AGPL-3.0 and commercial licenses. This project uses the AGPL-3.0 version.

## Acknowledgments

- **Swiss Ephemeris** by Astrodienst AG for astronomical calculations
- **Ahobila Mutt** for traditional calendar reference
- **Drik Panchang** for validation reference data

## Contact

- **GitHub**: [rdukb/astrome](https://github.com/rdukb/astrome)
- **Issues**: [GitHub Issues](https://github.com/rdukb/astrome/issues)

---

**Current Branch**: `001-tamil-panchang-ui`
**Next Steps**: Implement Phase 3 (User Story 1 - View Daily Panchang MVP)

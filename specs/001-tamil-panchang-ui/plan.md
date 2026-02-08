# Implementation Plan: Tamil Iyengar Panchang Web Application

**Branch**: `001-tamil-panchang-ui` | **Date**: 2026-02-06 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification for Tamil Panchang web app with modern UI

## Summary

Build a Progressive Web Application displaying daily Tamil Panchang (Hindu almanac) with Vedic/South Indian astronomical calculations. Users view location-specific auspicious/inauspicious times (Rahu Kalam, Gulika, Abhijit Muhurat), special observance days (Ekadashi, Pradosham), and receive contextual education on Panchang terms through interactive tooltips. 

**Architecture**: React frontend (Next.js 14, Tailwind CSS) + Python FastAPI backend (Swiss Ephemeris calculations) + SQLite caching + IndexedDB offline storage. Offline-first PWA with Service Worker caching.

## Technical Context

**Language/Version**: 
- Frontend: TypeScript (ES2022), React 18+, Next.js 14+
- Backend: Python 3.11+

**Primary Dependencies**:
- Frontend: Next.js 14, React 18, Tailwind CSS 3, Day.js (date), Zustand (state), React Query (data fetching), Workbox (Service Worker)
- Backend: FastAPI 0.104+, pyswisseph 2.10+ (Swiss Ephemeris bindings), Pydantic 2 (validation), SQLAlchemy 2 (ORM)
- Astronomical: Swiss Ephemeris library (JPL-derived ephemeris data)

**Storage**: 
- Backend: SQLite3 for calculation caching (date+location→Panchang results), term definitions storage
- Frontend: IndexedDB for offline Panchang data (±30 days), LocalStorage for user preferences (language, favorites, theme)

**Testing**:
- Frontend: Vitest (unit), React Testing Library (component), Playwright (E2E)
- Backend: pytest, pytest-asyncio, httpx (API client testing)
- Validation: Reference calculations from prokerala.com, drikpanchang.com

**Target Platform**: Web (desktop + mobile browsers), Progressive Web App (installable), responsive design 320px-1920px+

**Project Type**: Web application (separate frontend + backend repositories)

**Performance Goals**:
- Panchang calculation API response < 500ms (constitution requirement)
- Frontend First Contentful Paint < 2s, Time to Interactive < 3s
- UI interactions 60 fps smooth scrolling/animations (constitution requirement)
- Offline data retrieval < 1s from IndexedDB
- Backend handles 100+ concurrent calculation requests

**Constraints**:
- Astronomical accuracy: ±1 minute for time calculations, ±1 arc-degree for celestial positions (constitution)
- Offline capability for recently viewed dates (±30 days from last sync)
- No cloud storage of user data - all local (constitution: privacy-first)
- Ephemeris data bundle < 50MB for 2-year range (constitution)
- Browser storage limits: LocalStorage <10MB, IndexedDB <50MB

**Scale/Scope**:
- 1000+ daily active users
- Calculate Panchang for any date ±100 years from 2026
- Support all IANA timezones worldwide
- Two languages initially (English, Tamil) with i18n framework for extensibility

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### ✅ I. Astronomical Accuracy

**Requirement**: Use verified astronomical algorithms with minimum 1 arc-minute accuracy, external ephemeris libraries required

**Compliance**: ✅ PASS
- Swiss Ephemeris selected (industry standard, JPL ephemeris derivative, <1 arc-second accuracy)
- pyswisseph Python bindings provide mature, tested interface
- Phase 0 research will validate accuracy against reference Panchang sources
- All calculations server-side for consistency
- API exposes calculation method and data source via metadata endpoint for transparency

**Risk Mitigation**: Validate against drikpanchang.com and prokerala.com for 20+ test dates

### ✅ II. Location-Based Calculations

**Requirement**: All time-sensitive calculations must incorporate geographic coordinates (lat/lon, timezone)

**Compliance**: ✅ PASS
- All Panchang API endpoints require latitude, longitude, timezone as mandatory parameters
- Frontend requests browser geolocation with explicit permission dialog explaining usage
- Manual location entry supported (city autocomplete, direct coordinates)
- Sunrise/sunset, Rahu Kalam, Gulika times calculated per location
- Timezone-aware datetime handling using Python pytz and JavaScript Day.js with timezone plugin

**Implementation**: Location data never persisted on server, only used for real-time calculation

### ✅ III. Data Privacy & Security

**Requirement**: Local-first storage, no third-party transmission without consent, encrypted sensitive data

**Compliance**: ✅ PASS
- User preferences stored exclusively in browser LocalStorage/IndexedDB (client-side)
- No user authentication system (no accounts, no server-side user database)
- Location data transmitted to backend only for calculation requests (not stored on server)
- Location favorites encrypted in browser using Web Crypto API (AES-256-GCM)
- No third-party analytics, tracking, or external API calls by default
- Open source - users can audit privacy practices

**Out of Scope**: Cloud sync feature excluded per constitution

### ✅ IV. Offline-First Architecture

**Requirement**: Core functionality works offline, ephemeris data cached locally, graceful degradation

**Compliance**: ✅ PASS
- Service Worker (Workbox) intercepts API requests and serves from IndexedDB cache when offline
- Panchang calculations for viewed dates cached client-side (±30 days rolling window)
- Ephemeris data for ±1 year bundled with backend deployment (no network required for calculations)
- HTTP caching headers (ETag, Cache-Control) enable browser caching
- UI displays "Offline Mode" indicator and cached-data timestamp
- PWA manifest enables installation and standalone app experience

**Graceful Degradation**: New date requests while offline show cached data or clear "network required" message

### ✅ V. Cultural Sensitivity

**Requirement**: Support multiple astrological systems, respect cultural contexts, no imposed framework

**Compliance**: ✅ PASS
- Focus on Vedic/South Indian Panchang system (appropriate for Iyengar Brahmin tradition)
- Tamil and English language support with culturally appropriate terminology
- Term explanations specific to Iyengar observances and practices
- No "recommended" or "best" practices imposed - user interprets based on tradition
- Extensible i18n framework allows future addition of other regional traditions
- Respectful iconography and visual design

**Future**: Architecture supports adding Western/other systems without rewrite

### Gate Summary

**Status**: ✅ ALL GATES PASSED - Approved to proceed to Phase 0 (Research)

No constitution violations. No complexity justification needed.

## Project Structure

### Documentation (this feature)

```text
specs/001-tamil-panchang-ui/
├── plan.md              # This file
├── research.md          # Phase 0: Library evaluation, calculation validation
├── data-model.md        # Phase 1: Entity schemas and relationships
├── quickstart.md        # Phase 1: Development setup and test instructions
├── contracts/           # Phase 1: API specifications
│   ├── panchang-api.yaml       # OpenAPI spec for Panchang endpoints
│   ├── location-api.yaml       # Location services endpoints
│   └── definitions-api.yaml    # Term definitions endpoints
└── checklists/
    └── requirements.md  # Quality validation (already complete)
```

### Source Code (repository root)

**Web Application Structure** (Option 2 selected)

```text
backend/
├── src/
│   ├── api/
│   │   ├── __init__.py
│   │   ├── main.py                    # FastAPI application entry
│   │   ├── routes/
│   │   │   ├── __init__.py
│   │   │   ├── panchang.py            # GET /api/panchang/daily, /monthly
│   │   │   ├── muhurat.py             # GET /api/muhurat (auspicious times)
│   │   │   ├── location.py            # GET /api/location/search
│   │   │   ├── definitions.py         # GET /api/definitions/{term}
│   │   │   └── health.py              # GET /health, /ready
│   │   └── middleware/
│   │       ├── cors.py                # CORS configuration
│   │       ├── caching.py             # Response caching logic
│   │       └── error_handlers.py      # Global error handling
│   ├── models/
│   │   ├── __init__.py
│   │   ├── panchang.py                # DailyPanchang, Tithi, Nakshatra (Pydantic)
│   │   ├── location.py                # Location, GeoCoordinates models
│   │   ├── time_period.py             # TimePeriod, MuhuratType models
│   │   ├── special_day.py             # SpecialDay, ObservanceType models
│   │   └── definition.py              # TermDefinition model
│   ├── services/
│   │   ├── __init__.py
│   │   ├── panchang_calculator.py     # Core calculation orchestrator
│   │   ├── ephemeris.py               # Swiss Ephemeris wrapper
│   │   ├── lunar_calculator.py        # Tithi, Nakshatra, Paksha calculations
│   │   ├── solar_calculator.py        # Sunrise, sunset, noon calculations
│   │   ├── muhurat_calculator.py      # Rahu Kalam, Gulika, Abhijit Muhurat
│   │   ├── special_days_detector.py   # Ekadashi, Pradosham identification
│   │   ├── varjyam_calculator.py      # Varjyam periods calculation
│   │   └── timezone_handler.py        # Timezone conversions
│   ├── db/
│   │   ├── __init__.py
│   │   ├── connection.py              # SQLite async connection pool
│   │   ├── cache_repository.py        # Calculation cache CRUD
│   │   ├── definitions_repository.py  # Term definitions CRUD
│   │   └── migrations/                # Alembic migrations
│   │       └── versions/
│   ├── schemas/
│   │   └── database.sql               # SQLite schema definition
│   └── config/
│       ├── __init__.py
│       ├── settings.py                # Environment variables, config
│       └── logging.py                 # Logging configuration
├── data/
│   ├── ephe/                          # Swiss Ephemeris data files
│   │   ├── seas_18.se1                # Bundled ephemeris ±100 years
│   │   └── semo_18.se1
│   └── definitions/
│       ├── terms_en.json              # English Panchang term definitions
│       └── terms_ta.json              # Tamil term definitions
├── tests/
│   ├── __init__.py
│   ├── unit/
│   │   ├── test_lunar_calculator.py
│   │   ├── test_muhurat_calculator.py
│   │   └── test_timezone_handler.py
│   ├── integration/
│   │   ├── test_panchang_api.py
│   │   └── test_cache_repository.py
│   └── fixtures/
│       ├── reference_calculations.json # Test data from drikpanchang
│       └── test_locations.json        # Sample locations for tests
├── scripts/
│   ├── validate_ephemeris.py         # Validate Swiss Ephemeris accuracy
│   └── seed_definitions.py           # Load term definitions to DB
├── requirements.txt                   # Python dependencies
├── requirements-dev.txt               # Development dependencies
├── pyproject.toml                     # Poetry/build configuration
├── .env.example                       # Environment variables template
└── README.md

frontend/
├── src/
│   ├── app/                           # Next.js 14 App Router
│   │   ├── layout.tsx                 # Root layout with providers
│   │   ├── page.tsx                   # Home page - daily Panchang view
│   │   ├── globals.css                # Tailwind directives
│   │   ├── month/
│   │   │   └── page.tsx               # Monthly calendar view
│   │   ├── location/
│   │   │   └── page.tsx               # Location management page
│   │   └── offline/
│   │       └── page.tsx               # Offline status page
│   ├── components/
│   │   ├── panchang/
│   │   │   ├── DailyPanchang.tsx      # Main daily Panchang display
│   │   │   ├── PanchangHeader.tsx     # Date, location, Tamil month
│   │   │   ├── TithiDisplay.tsx       # Tithi with start/end times
│   │   │   ├── NakshatraDisplay.tsx   # Nakshatra details
│   │   │   ├── YogaKaranaDisplay.tsx  # Yoga and Karana
│   │   │   ├── TimePeriodGrid.tsx     # Auspicious/inauspicious grid
│   │   │   └── SunTimesDisplay.tsx    # Sunrise, sunset, noon
│   │   ├── calendar/
│   │   │   ├── MonthView.tsx          # Monthly calendar grid
│   │   │   ├── DateCell.tsx           # Individual date cell
│   │   │   ├── SpecialDayMarker.tsx   # Ekadashi, Pradosham indicators
│   │   │   └── MonthNavigator.tsx     # Month/year selector
│   │   ├── location/
│   │   │   ├── LocationPicker.tsx     # Location selection modal
│   │   │   ├── LocationSearch.tsx     # City autocomplete search
│   │   │   ├── FavoritesList.tsx      # Saved locations list
│   │   │   └── GeolocationButton.tsx  # Browser geolocation trigger
│   │   ├── education/
│   │   │   ├── TermTooltip.tsx        # Hoverable term explanation
│   │   │   ├── TermModal.tsx          # Full-screen term details
│   │   │   └── TermHighlight.tsx      # Clickable term wrapper
│   │   ├── shared/
│   │   │   ├── DateNavigator.tsx      # Previous/next date navigation
│   │   │   ├── LanguageToggle.tsx     # English/Tamil switcher
│   │   │   ├── OfflineIndicator.tsx   # Offline mode badge
│   │   │   ├── LoadingSpinner.tsx     # Loading state component
│   │   │   └── ErrorBoundary.tsx      # Error handling wrapper
│   │   └── layout/
│   │       ├── Header.tsx             # App header with navigation
│   │       ├── Footer.tsx             # App footer
│   │       └── Sidebar.tsx            # Mobile drawer navigation
│   ├── hooks/
│   │   ├── usePanchang.ts             # React Query: fetch daily Panchang
│   │   ├── useMonthPanchang.ts        # React Query: fetch month data
│   │   ├── useLocation.ts             # Geolocation + saved locations
│   │   ├── useOffline.ts              # Online/offline state detection
│   │   ├── useDefinitions.ts          # Fetch term definitions
│   │   └── useI18n.ts                 # Internationalization hook
│   ├── services/
│   │   ├── api/
│   │   │   ├── client.ts              # Axios instance with interceptors
│   │   │   ├── panchang-service.ts    # Panchang API calls
│   │   │   ├── location-service.ts    # Location API calls
│   │   │   └── definitions-service.ts # Definitions API calls
│   │   ├── cache/
│   │   │   ├── indexdb-service.ts     # IndexedDB wrapper
│   │   │   ├── panchang-cache.ts      # Panchang caching logic
│   │   │   └── cache-expiry.ts        # TTL and cleanup logic
│   │   ├── sw/
│   │   │   └── sw-messaging.ts        # Service Worker postMessage API
│   │   └── geolocation/
│   │       └── geolocation-service.ts # Browser geolocation API
│   ├── stores/
│   │   ├── preferences-store.ts       # Zustand: language, theme, time format
│   │   ├── location-store.ts          # Zustand: current + favorite locations
│   │   └── ui-store.ts                # Zustand: modals, sidebar state
│   ├── lib/
│   │   ├── date-utils.ts              # Day.js wrappers and formatters
│   │   ├── timezone-utils.ts          # Timezone detection and conversion
│   │   ├── i18n.ts                    # Translation utilities
│   │   ├── encryption.ts              # Web Crypto API for favorites encryption
│   │   └── constants.ts               # App constants, enums
│   ├── types/
│   │   ├── panchang.ts                # Panchang TypeScript interfaces
│   │   ├── location.ts                # Location types
│   │   ├── definition.ts              # Term definition types
│   │   └── api.ts                     # API request/response types
│   └── styles/
│       ├── globals.css                # Base styles, Tailwind imports
│       └── themes.css                 # Color themes (light/dark)
├── public/
│   ├── manifest.json                  # PWA manifest
│   ├── service-worker.js              # Workbox-generated SW
│   ├── offline.html                   # Offline fallback page
│   ├── icons/
│   │   ├── icon-192.png
│   │   └── icon-512.png
│   └── fonts/                         # Tamil font files (if needed)
├── tests/
│   ├── e2e/
│   │   ├── panchang-flow.spec.ts      # Playwright: daily Panchang flow
│   │   ├── location-flow.spec.ts      # Playwright: location selection
│   │   └── offline-flow.spec.ts       # Playwright: offline behavior
│   └── unit/
│       ├── date-utils.test.ts
│       └── timezone-utils.test.ts
├── package.json
├── package-lock.json
├── tsconfig.json                      # TypeScript configuration
├── tailwind.config.js                 # Tailwind CSS configuration
├── next.config.js                     # Next.js configuration
├── vitest.config.ts                   # Vitest test runner config
├── playwright.config.ts               # Playwright E2E config
├── .env.local.example                 # Environment variables template
└── README.md

.github/
└── workflows/
    ├── backend-ci.yml                 # Backend: pytest, linting
    ├── frontend-ci.yml                # Frontend: Vitest, Playwright
    └── deploy.yml                     # Production deployment workflow
```

**Structure Decision**: Web application architecture selected because:

1. **Separation of Concerns**: Python excels at astronomical calculations (Swiss Ephemeris has mature Python bindings), React excels at interactive UI
2. **Performance**: Backend caches expensive calculations in SQLite; frontend focuses on fast rendering and smooth UX
3. **Offline Support**: Service Worker + IndexedDB enables true PWA offline-first experience with background sync
4. **Independent Scaling**: Frontend can be CDN-hosted (Vercel/Netlify), backend scales for calculation load (cloud run)
5. **Development Velocity**: Teams can develop frontend/backend in parallel with clear API contract, different release cycles possible

## Complexity Tracking

> **Constitution compliance verified - no violations**

This section intentionally left empty. All five constitution principles satisfied without trade-offs or complexity justification needed.

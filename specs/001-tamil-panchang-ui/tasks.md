# Tasks: Tamil Iyengar Panchang Web Application

**Input**: Design documents from `/specs/001-tamil-panchang-ui/`
**Date**: 2026-02-06
**Branch**: `001-tamil-panchang-ui`

**Tests**: Not explicitly requested in feature specification - test tasks excluded per workflow rules

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Backend**: `backend/src/`, `backend/tests/`
- **Frontend**: `frontend/`, `frontend/app/`, `frontend/components/`
- Project uses web app structure with separate frontend/backend

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Create backend directory structure with src/, tests/, data/, docs/ folders per plan.md
- [X] T002 Initialize Python project with pyproject.toml, setup.py, requirements.txt for FastAPI, pyswisseph, pydantic, uvicorn dependencies
- [X] T003 [P] Create frontend directory structure with app/, components/, hooks/, services/, stores/, public/ per plan.md
- [X] T004 [P] Initialize Next.js 14 project with TypeScript, Tailwind CSS 3, ESLint, Prettier configuration in frontend/
- [X] T005 [P] Configure VS Code workspace settings with Python and TypeScript linters in .vscode/settings.json
- [X] T006 Ephemeris setup: Using built-in Moshier ephemeris (<0.1 arcsec precision, no external files needed). External files unavailable as of Feb 2026 (404 errors). See backend/src/data/ephe/README.md
- [X] T007 [P] Create Indian cities dataset JSON file with 100 major cities in backend/src/data/indian_cities.json
- [X] T008 [P] Create term definitions JSON file with 20 core Panchang terms in backend/src/data/term_definitions.json
- [X] T009 Setup Git repository with .gitignore for Python, Node.js, ephemeris files, environment variables

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T010 Create Pydantic base models in backend/src/models/base.py with BaseModel configuration, validators
- [X] T011 [P] Setup SQLite database connection in backend/src/db/database.py with connection pooling
- [X] T012 [P] Create Alembic migration configuration in backend/alembic/ with initial migration script
- [X] T013 Create SQLite schema for locations table in backend/src/db/schema.py per data-model.md
- [X] T014 [P] Create SQLite schema for panchang_cache table in backend/src/db/schema.py per data-model.md
- [X] T015 [P] Create SQLite schema for term_definitions table in backend/src/db/schema.py per data-model.md
- [X] T016 Initialize Swiss Ephemeris wrapper in backend/src/services/ephemeris.py with pyswisseph configuration, path setup
- [X] T017 [P] Create FastAPI app instance in backend/src/main.py with CORS, middleware, route mounting
- [X] T018 [P] Setup logging infrastructure in backend/src/config/logging.py with file and console handlers
- [X] T019 [P] Create environment configuration loader in backend/src/config/settings.py using pydantic BaseSettings
- [X] T020 Create error handling middleware in backend/src/api/middleware/error_handler.py for standardized error responses
- [X] T021 [P] Setup React context providers in frontend/app/providers.tsx for React Query, Zustand
- [X] T022 [P] Create Tailwind CSS configuration in frontend/tailwind.config.ts with custom colors, fonts per design
- [X] T023 [P] Create TypeScript interfaces for all API schemas in frontend/types/api.ts per panchang-api.yaml
- [X] T024 [P] Setup Axios API client in frontend/services/api-client.ts with interceptors, base URL configuration
- [X] T025 Create Zustand store structure in frontend/stores/panchang-store.ts with state shape, actions placeholder
- [X] T026 [P] Setup Day.js with timezone plugin in frontend/lib/dayjs.ts for date handling
- [X] T027 [P] Create UI component library structure with Button, Card, Tooltip base components in frontend/components/ui/

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - View Daily Panchang (Priority: P1) 🎯 MVP

**Goal**: Users can view complete daily Panchang (Tithi, Nakshatra, Yoga, Karana, sunrise/sunset, auspicious/inauspicious times) for current location and current date

**Independent Test**: User opens app, allows location access, sees today's Panchang data with all times displayed. Can verify Tithi name, sunrise time, Rahu Kalam period are visible.

### Backend Implementation for User Story 1

- [X] T028 [P] [US1] Create TithiInfo Pydantic model in backend/src/models/panchang.py per data-model.md with validation
- [X] T029 [P] [US1] Create NakshatraInfo Pydantic model in backend/src/models/panchang.py per data-model.md with validation
- [X] T030 [P] [US1] Create YogaInfo Pydantic model in backend/src/models/panchang.py per data-model.md with validation
- [X] T031 [P] [US1] Create KaranaInfo Pydantic model in backend/src/models/panchang.py per data-model.md with validation
- [X] T032 [P] [US1] Create TimePeriod Pydantic model in backend/src/models/panchang.py per data-model.md with validation
- [X] T033 [P] [US1] Create SpecialDay Pydantic model in backend/src/models/panchang.py per data-model.md with validation
- [X] T034 [US1] Create DailyPanchang Pydantic model in backend/src/models/panchang.py per data-model.md (depends on T028-T033)
- [X] T035 [P] [US1] Create Location Pydantic model in backend/src/models/location.py per data-model.md with coordinate validation
- [X] T036 [US1] Implement Tithi calculation algorithm in backend/src/services/calculations/tithi.py using Swiss Ephemeris per research.md
- [X] T037 [P] [US1] Implement Nakshatra calculation algorithm in backend/src/services/calculations/nakshatra.py using Swiss Ephemeris per research.md
- [X] T038 [P] [US1] Implement Yoga calculation algorithm in backend/src/services/calculations/yoga.py using Swiss Ephemeris per research.md
- [X] T039 [P] [US1] Implement Karana calculation algorithm in backend/src/services/calculations/karana.py using Swiss Ephemeris per research.md
- [X] T040 [P] [US1] Implement sunrise/sunset calculation in backend/src/services/calculations/sun.py using Swiss Ephemeris rise_trans
- [X] T041 [P] [US1] Implement Rahu Kalam calculation in backend/src/services/calculations/inauspicious.py per research.md algorithm
- [X] T042 [P] [US1] Implement Gulika Kalam calculation in backend/src/services/calculations/inauspicious.py per research.md algorithm
- [X] T043 [P] [US1] Implement Yamaganda Kalam calculation in backend/src/services/calculations/inauspicious.py per research.md algorithm
- [X] T044 [P] [US1] Implement Abhijit Muhurat calculation in backend/src/services/calculations/auspicious.py per research.md algorithm
- [X] T045 [P] [US1] Implement Brahma Muhurat calculation in backend/src/services/calculations/auspicious.py per research.md algorithm
- [X] T046 [US1] Implement Tamil month calculation from Sun position in backend/src/services/calculations/tamil_calendar.py per research.md
- [X] T047 [US1] Create main PanchangCalculator service in backend/src/services/panchang_calculator.py orchestrating all calculations
- [ ] T048 [US1] Implement cache lookup/store logic in backend/src/services/cache_service.py for SQLite panchang_cache table (SKIPPED for MVP)
- [X] T049 [US1] Create GET /api/v1/panchang endpoint in backend/src/api/routes/panchang.py per panchang-api.yaml
- [X] T050 [US1] Add request validation and error handling to panchang endpoint for date format, coordinate ranges
- [X] T051 [P] [US1] Create health check endpoint GET /health in backend/src/api/routes/health.py per panchang-api.yaml (EXISTS in main.py)
- [X] T052 [P] [US1] Create ephemeris health endpoint GET /health/ephemeris in backend/src/api/routes/health.py per panchang-api.yaml (EXISTS in main.py)

### Frontend Implementation for User Story 1

- [X] T053 [P] [US1] Create DailyPanchang TypeScript interface in frontend/types/panchang.ts matching API schema
- [X] T054 [P] [US1] Create Location TypeScript interface in frontend/types/location.ts matching API schema
- [X] T055 [P] [US1] Create API service function fetchDailyPanchang in frontend/services/panchang-api.ts using Axios
- [X] T056 [US1] Implement geolocation hook useGeolocation in frontend/hooks/useGeolocation.ts with browser Geolocation API
- [X] T057 [US1] Create Panchang Zustand store in frontend/stores/panchang-store.ts with selectedDate, selectedLocation, currentPanchang state
- [X] T058 [US1] Implement loadPanchang action in frontend/stores/panchang-store.ts calling API, caching in-memory
- [X] T059 [P] [US1] Create PanchangCard component in frontend/components/panchang/PanchangCard.tsx displaying Tithi, Nakshatra, Yoga, Karana
- [X] T060 [P] [US1] Create SunTimesCard component in frontend/components/panchang/SunTimesCard.tsx displaying sunrise, sunset, moonrise, moonset
- [X] T061 [P] [US1] Create InauspiciousTimesCard component in frontend/components/panchang/InauspiciousTimesCard.tsx for Rahu/Gulika/Yamaganda
- [X] T062 [P] [US1] Create AuspiciousTimesCard component in frontend/components/panchang/AuspiciousTimesCard.tsx for Abhijit/Brahma Muhurat
- [X] T063 [US1] Create DateSelector component in frontend/components/panchang/DateSelector.tsx with date picker, today button
- [X] T064 [US1] Create LocationDisplay component in frontend/components/location/LocationDisplay.tsx showing current location name
- [X] T065 [US1] Create main Panchang page in frontend/app/page.tsx composing all cards, handling data loading, error states
- [X] T066 [US1] Implement loading skeleton UI in frontend/components/panchang/PanchangSkeleton.tsx for async data fetching
- [X] T067 [US1] Implement error boundary in frontend/app/error.tsx for API failures, offline scenarios
- [X] T068 [P] [US1] Style Panchang cards with Tailwind CSS following ahobilamutt.org visual hierarchy
- [X] T069 [P] [US1] Add responsive breakpoints for mobile (320px), tablet (768px), desktop (1024px+) views
- [X] T070 [US1] Implement time formatting utility in frontend/lib/format-time.ts for 12/24hr format, timezone conversion

### Visual Polish & Dark Theme (Phase 3 Extension)

- [X] T070a [P] [US1] Implement dark theme with deep blue/purple gradient background in frontend/app/globals.css and page.tsx
- [X] T070b [P] [US1] Update Tailwind config with dark theme color palette (indigo-950, purple-950, slate-800) in frontend/tailwind.config.js
- [ ] T070c [US1] Redesign card layout for horizontal stacking - merge Sun/Moon times into single compact card, use 2-column grid on desktop
- [X] T070d [P] [US1] Update all card components with dark theme styling - dark backgrounds, light text, vibrant accent colors
- [X] T070e [P] [US1] Add theme switcher widget (system/light/dark) with floating button interface in top-right corner
- [X] T070f [P] [US1] Fix font loading - add Inter font from Google Fonts, remove Times New Roman fallback
- [X] T070g [P] [US1] Implement dual theme support using Tailwind dark: variants across all components (LocationDisplay, DateSelector, PanchangCard, SunTimesCard, InauspiciousTimesCard, AuspiciousTimesCard)
- [X] T070h [P] [US1] Fix info boxes (Sacred Timing, Important) to properly support both light and dark themes

### PWA Features (Deferred)

- [ ] T071 [P] [US1] Setup Service Worker with Workbox in frontend/public/sw.js for offline Panchang caching
- [ ] T072 [P] [US1] Configure IndexedDB schema in frontend/lib/indexed-db.ts for panchang data, locations, preferences

**Checkpoint**: At this point, User Story 1 should be fully functional - users can view complete Panchang for today at their location

### Technical Debt (from Phase 3 Implementation)

**⚠️ IMPORTANT**: These tasks address shortcuts and workarounds implemented during MVP development. Should be revisited for production accuracy.

- [X] T052a [P] [US1] **[TECHNICAL DEBT]** Fix Swiss Ephemeris rise_trans compatibility issue in backend/src/services/calculations/sun.py
  - **Current State**: Using crude approximations (sunrise_jd = julian_day + (6.0 - longitude/15.0) / 24.0)
  - **Issue**: pyswisseph 2.10.3.1 rise_trans() function has parameter type incompatibility (`TypeError: 'float' object cannot be interpreted as an integer`)
  - **Resolution**: Updated to compatible signature `rise_trans(jd, body, rsmi, (lon, lat, alt))` with fallback guards in `sun.py` and `ephemeris.py`; validated against LA sample (2026-02-07) producing RK ~09:43-11:02 (close to Ahobila 09:45-11:03).
  - **Impact**: ±30-60 minute error in sunrise/sunset times, affects Rahu Kalam accuracy
  - **Observed Example**: For America/Los_Angeles on 2026-02-07, current app outputs sunrise ~06:07 and Rahu Kalam ~09:07-10:37 (or shifted display if timezone-less timestamps leak). Ahobila reference shows sunrise 07:09 and Rahu Kalam 09:45-11:03.
  - **Options**:
    1. Test different pyswisseph versions (downgrade to 2.08.x or upgrade to 2.11.x when available)
    2. Implement proper sunrise equation with atmospheric refraction
    3. Use alternative library (skyfield, ephem, astropy)
    4. Create minimal reproducible example to report pyswisseph bug
  - **Files**: backend/src/services/calculations/sun.py (lines 30-80)
  - **References**: Research.md section on sunrise calculations, Swiss Ephemeris documentation

- [X] T052b [P] [US1] **[TECHNICAL DEBT]** Implement proper moonrise/moonset calculations in backend/src/services/calculations/sun.py
  - **Current State**: Using same crude approximations as sunrise/sunset
  - **Issue**: Moon rise/set times don't account for lunar declination, parallax, or altitude
  - **Impact**: Can be off by several hours, especially at high latitudes
  - **Solution**: After T052a, switched moonrise/moonset to Swiss Ephemeris `rise_trans` (same compatible signature path), with approximation fallback only for resilience.
  - **Files**: backend/src/services/calculations/sun.py (calculate_moon_times function)

- [ ] T052c [US1] **[TECHNICAL DEBT]** Refine Tithi/Nakshatra boundary detection precision
  - **Current State**: 1-hour iteration steps, validation relaxed to 12-36h duration
  - **Issue**: Boundary times can be off by 30-60 minutes
  - **Impact**: Edge cases where Tithi changes near midnight may show incorrect "at_sunrise" flag
  - **Solution**: Reduce iteration step to 5-minute intervals, implement bisection search for exact boundary
  - **Files**:
    - backend/src/services/calculations/tithi.py (find_tithi_start, find_tithi_end functions)
    - backend/src/models/panchang.py (TithiInfo validation - can tighten to 18-27h after refinement)
  - **Priority**: MEDIUM - Functional but not production-grade accuracy

- [ ] T052d [P] [US1] **[TECHNICAL DEBT]** Tighten validation constraints after calculation refinements
  - **Current State**: TithiInfo duration validation relaxed from 19-26h to 12-36h to accommodate workarounds
  - **Issue**: Overly permissive validation allows inaccurate calculations to pass
  - **Dependency**: Complete T052a and T052c first
  - **Solution**: After sunrise/sunset and boundary detection fixes, restore stricter validation (19-27h for Tithi)
  - **Files**: backend/src/models/panchang.py (TithiInfo, KaranaInfo validators)
  - **Test**: Compare validation with established Panchang sources (drikpanchang.com, prokerala.com)

---

## Phase 4: User Story 2 - Understand Terms with Tooltips (Priority: P2)

**Goal**: Users can understand unfamiliar Panchang terms (Tithi, Nakshatra, Rahu Kalam, etc.) through interactive tooltips with short definitions in English/Tamil

**Independent Test**: User hovers/taps on "Rahu Kalam" term, sees tooltip with "90-minute inauspicious period ruled by Rahu" definition. Can toggle between English and Tamil.

### Backend Implementation for User Story 2

- [ ] T073 [P] [US2] Create TermDefinition Pydantic model in backend/src/models/definition.py per data-model.md
- [ ] T074 [US2] Implement data loader for term definitions in backend/src/data/load_definitions.py reading JSON to SQLite
- [ ] T075 [US2] Create GET /api/v1/definitions endpoint in backend/src/api/routes/definitions.py returning all 20 terms per panchang-api.yaml
- [ ] T076 [P] [US2] Create GET /api/v1/definitions/{term_id} endpoint in backend/src/api/routes/definitions.py per panchang-api.yaml
- [ ] T077 [US2] Add caching headers (Cache-Control: max-age=2592000) to definitions endpoints for 30-day browser cache

### Frontend Implementation for User Story 2

- [ ] T078 [P] [US2] Create TermDefinition TypeScript interface in frontend/types/definition.ts matching API schema
- [ ] T079 [P] [US2] Create API service function fetchDefinitions in frontend/services/definitions-api.ts
- [ ] T080 [P] [US2] Create API service function fetchDefinition in frontend/services/definitions-api.ts for individual terms
- [ ] T081 [US2] Create definitions Zustand store in frontend/stores/definitions-store.ts with definitions map, loading state
- [ ] T082 [US2] Implement preloadDefinitions action in frontend/stores/definitions-store.ts called on app initialization
- [ ] T083 [US2] Create Tooltip component in frontend/components/ui/Tooltip.tsx with hover/tap interactions, positioning logic
- [ ] T084 [US2] Create TermTooltip component in frontend/components/definitions/TermTooltip.tsx wrapping term text with Tooltip, showing definition
- [ ] T085 [US2] Create DefinitionModal component in frontend/components/definitions/DefinitionModal.tsx for detailed explanation, related terms
- [ ] T086 [US2] Wrap all Panchang term text in PanchangCard with TermTooltip component (Tithi, Nakshatra, Yoga, Karana)
- [ ] T087 [US2] Wrap time period labels in InauspiciousTimesCard with TermTooltip (Rahu Kalam, Gulika, Yamaganda)
- [ ] T088 [US2] Wrap time period labels in AuspiciousTimesCard with TermTooltip (Abhijit Muhurat, Brahma Muhurat)
- [ ] T089 [US2] Add language toggle in frontend/components/layout/LanguageToggle.tsx switching between English/Tamil
- [ ] T090 [US2] Implement i18n context in frontend/contexts/I18nContext.tsx managing current language state
- [ ] T091 [US2] Update all TermTooltip instances to display definition based on current language (short_definition_en vs short_definition_ta)
- [ ] T092 [US2] Add "Learn more" link in TermTooltip opening DefinitionModal with full explanation, Iyengar significance
- [ ] T093 [P] [US2] Style tooltips with Tailwind CSS using dark background, white text, rounded corners, drop shadow
- [ ] T094 [P] [US2] Add accessibility attributes (aria-label, role="tooltip") to Tooltip component for screen readers

**Checkpoint**: At this point, User Stories 1 AND 2 should both work - users can view Panchang AND understand terms through tooltips

---

## Phase 5: User Story 3 - Identify Auspicious Times (Priority: P3)

**Goal**: Users can clearly distinguish auspicious times (Abhijit Muhurat, Brahma Muhurat) from inauspicious times (Rahu Kalam, Gulika, Yamaganda, Durmuhurtam, Varjyam) through visual indicators and grouping

**Independent Test**: User views daily Panchang, sees green-highlighted auspicious times grouped together, red-highlighted inauspicious times grouped separately, with clear labels.

### Backend Implementation for User Story 3

- [ ] T095 [P] [US3] Implement Durmuhurtam calculation in backend/src/services/calculations/inauspicious.py per research.md algorithm
- [ ] T096 [P] [US3] Implement Varjyam calculation in backend/src/services/calculations/inauspicious.py per research.md Nakshatra-Tithi table
- [ ] T097 [US3] Add durmuhurtam array field to DailyPanchang model and calculation pipeline in PanchangCalculator
- [ ] T098 [US3] Add varjyam array field to DailyPanchang model and calculation pipeline in PanchangCalculator
- [ ] T099 [US3] Update GET /api/v1/panchang response to include durmuhurtam, varjyam arrays per panchang-api.yaml

### Frontend Implementation for User Story 3

- [ ] T100 [P] [US3] Create TimelinView component in frontend/components/panchang/TimelineView.tsx displaying day divided into time blocks
- [ ] T101 [US3] Implement timeline rendering logic mapping auspicious/inauspicious periods to visual blocks with color coding
- [ ] T102 [P] [US3] Create AuspiciousIcon component in frontend/components/ui/AuspiciousIcon.tsx with green checkmark/sun icon
- [ ] T103 [P] [US3] Create InauspiciousIcon component in frontend/components/ui/InauspiciousIcon.tsx with red warning/moon icon
- [ ] T104 [US3] Update InauspiciousTimesCard to include Durmuhurtam periods with descriptions
- [ ] T105 [US3] Update InauspiciousTimesCard to include Varjyam periods if present with conditional rendering
- [ ] T106 [US3] Add visual indicators (colored borders, icons) to AuspiciousTimesCard with green accent per design
- [ ] T107 [US3] Add visual indicators (colored borders, icons) to InauspiciousTimesCard with red accent per design
- [ ] T108 [P] [US3] Create TimePeriodBadge component in frontend/components/panchang/TimePeriodBadge.tsx showing duration, color-coded by type
- [ ] T109 [US3] Implement sorting logic in Panchang page grouping all auspicious times first, then inauspicious times
- [ ] T110 [US3] Add summary section at page top showing count of auspicious vs inauspicious periods for the day
- [ ] T111 [P] [US3] Add animations (fade-in, slide) to time cards using Tailwind CSS transitions
- [ ] T112 [P] [US3] Style timeline view with gradient backgrounds, smooth transitions between time blocks

**Checkpoint**: All three user stories (view Panchang, understand terms, identify auspicious times) should now be independently functional

---

## Phase 6: User Story 4 - View Monthly Calendar (Priority: P4)

**Goal**: Users can view Panchang data for an entire month in calendar view, identify special days (Ekadashi, Pradosham, Amavasya, Purnima) at a glance, navigate between months

**Independent Test**: User switches to monthly view, sees February 2026 calendar with Ekadashi dates highlighted, can click on any date to view full Panchang for that day.

### Backend Implementation for User Story 4

- [ ] T113 [US4] Implement Ekadashi detection in backend/src/services/calculations/special_days.py checking Tithi 11/26 per research.md
- [ ] T114 [P] [US4] Implement Pradosham detection in backend/src/services/calculations/special_days.py checking Tithi 13/28 per research.md
- [ ] T115 [P] [US4] Implement Amavasya detection in backend/src/services/calculations/special_days.py checking Tithi 30
- [ ] T116 [P] [US4] Implement Purnima detection in backend/src/services/calculations/special_days.py checking Tithi 15
- [ ] T117 [P] [US4] Implement Shivaratri detection in backend/src/services/calculations/special_days.py checking Tithi 29 + Masi month
- [ ] T118 [US4] Create GET /api/v1/panchang/range endpoint in backend/src/api/routes/panchang.py per panchang-api.yaml
- [ ] T119 [US4] Implement batch calculation optimization in PanchangCalculator for date ranges reusing ephemeris data
- [ ] T120 [US4] Add validation for date range (max 31 days) in panchang range endpoint
- [ ] T121 [US4] Update DailyPanchang model with special_days array populated by detection algorithms

### Frontend Implementation for User Story 4

- [ ] T122 [P] [US4] Create SpecialDay TypeScript interface in frontend/types/special-day.ts matching API schema
- [ ] T123 [P] [US4] Create API service function fetchPanchangRange in frontend/services/panchang-api.ts
- [ ] T124 [US4] Create MonthlyCalendar component in frontend/components/calendar/MonthlyCalendar.tsx with month grid layout
- [ ] T125 [US4] Create CalendarDay component in frontend/components/calendar/CalendarDay.tsx showing Tithi number, special day badge
- [ ] T126 [US4] Implement month navigation controls (prev/next arrows, month/year picker) in MonthlyCalendar
- [ ] T127 [US4] Add special day highlighting logic in CalendarDay component (green for Ekadashi, blue for Pradosham, etc.)
- [ ] T128 [US4] Implement click handler on CalendarDay opening detailed Panchang view for selected date
- [ ] T129 [US4] Create calendar view toggle in frontend/components/panchang/ViewToggle.tsx switching between daily/monthly views
- [ ] T130 [US4] Update Panchang page routing in frontend/app/page.tsx supporting ?view=daily|monthly query parameter
- [ ] T131 [US4] Add loading state for monthly view showing skeleton calendar grid while fetching range data
- [ ] T132 [P] [US4] Create SpecialDayLegend component in frontend/components/calendar/SpecialDayLegend.tsx explaining color codes
- [ ] T133 [P] [US4] Style monthly calendar with Tailwind CSS grid, responsive cell sizing, hover effects on dates
- [ ] T134 [US4] Implement caching strategy for monthly data in IndexedDB prefetching adjacent months

**Checkpoint**: Users can now view Panchang in both daily and monthly formats, navigate between dates, identify special observance days

---

## Phase 7: User Story 5 - Save Favorite Locations (Priority: P5)

**Goal**: Users can save multiple locations as favorites (home, work, native place), quickly switch between them without re-entering coordinates, set a default location

**Independent Test**: User searches for "Chennai", adds to favorites, searches for "Bangalore", adds to favorites, switches between them using dropdown, sets Chennai as default. On next app open, Chennai Panchang loads automatically.

### Backend Implementation for User Story 5

- [ ] T135 [P] [US5] Create GET /api/v1/locations/search endpoint in backend/src/api/routes/locations.py per panchang-api.yaml
- [ ] T136 [P] [US5] Create GET /api/v1/locations/nearby endpoint in backend/src/api/routes/locations.py per panchang-api.yaml
- [ ] T137 [P] [US5] Create GET /api/v1/locations/preloaded endpoint in backend/src/api/routes/locations.py per panchang-api.yaml
- [ ] T138 [P] [US5] Create GET /api/v1/locations/timezone endpoint in backend/src/api/routes/locations.py per panchang-api.yaml
- [ ] T139 [US5] Implement preloaded city search in backend/src/services/location_service.py using SQLite FTS5 full-text search
- [ ] T140 [US5] Implement Nominatim API fallback in backend/src/services/location_service.py for cities not in preloaded list
- [ ] T141 [US5] Implement nearby city search using Haversine distance formula in backend/src/services/location_service.py
- [ ] T142 [US5] Implement timezone detection using timezonefinder library in backend/src/services/location_service.py
- [ ] T143 [US5] Add rate limiting to Nominatim API calls (1 req/sec) with exponential backoff
- [ ] T144 [US5] Implement data loader for preloaded cities in backend/src/data/load_cities.py reading JSON to SQLite locations table

### Frontend Implementation for User Story 5

- [ ] T145 [P] [US5] Create API service functions for location endpoints in frontend/services/locations-api.ts
- [ ] T146 [P] [US5] Create UserPreferences Pydantic model in backend/src/models/preferences.py per data-model.md
- [ ] T147 [US5] Create preferences Zustand store in frontend/stores/preferences-store.ts with favoriteLocations, defaultLocation state
- [ ] T148 [US5] Implement saveFavorite action in preferences store persisting to localStorage with encryption
- [ ] T149 [US5] Implement removeFavorite action in preferences store updating localStorage
- [ ] T150 [US5] Implement setDefaultLocation action in preferences store updating localStorage
- [ ] T151 [US5] Create LocationSearch component in frontend/components/location/LocationSearch.tsx with autocomplete input
- [ ] T152 [US5] Implement debounced search in LocationSearch calling locations/search API with 300ms delay
- [ ] T153 [US5] Create LocationSearchResults component in frontend/components/location/LocationSearchResults.tsx displaying search matches
- [ ] T154 [US5] Create FavoriteLocationsList component in frontend/components/location/FavoriteLocationsList.tsx showing saved locations
- [ ] T155 [US5] Add star/favorite button to LocationSearchResults allowing users to save locations
- [ ] T156 [US5] Create LocationPicker component in frontend/components/location/LocationPicker.tsx combining search, favorites, current location
- [ ] T157 [US5] Implement location selection handler updating Panchang store and triggering data refetch
- [ ] T158 [US5] Add default location indicator (home icon) in FavoriteLocationsList with click to set default
- [ ] T159 [US5] Update app initialization in frontend/app/layout.tsx loading default location from preferences
- [ ] T160 [US5] Implement Web Crypto API encryption for favorite locations in frontend/lib/crypto.ts using AES-256-GCM
- [ ] T161 [P] [US5] Create LocationCard component in frontend/components/location/LocationCard.tsx displaying location details with edit/delete actions
- [ ] T162 [P] [US5] Style location picker with Tailwind CSS modal/drawer, search input with magnifying glass icon
- [ ] T163 [US5] Add empty state illustration when no favorites saved with prompt to search/add locations

**Checkpoint**: All five user stories are now complete - full Panchang viewing, term education, time distinction, monthly calendar, location management

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T164 [P] Create comprehensive README.md in repository root with project description, setup instructions, architecture overview
- [ ] T165 [P] Create API documentation in backend/docs/api.md from OpenAPI spec with usage examples
- [ ] T166 [P] Create user guide in frontend/public/docs/user-guide.md with screenshots, feature walkthroughs
- [ ] T167 [P] Add loading animations (spinner, skeleton screens) across all async operations for consistent UX
- [ ] T168 Add error handling for offline scenarios showing cached data indicator, sync status
- [ ] T169 Implement PWA manifest in frontend/public/manifest.json with app icons, theme colors, display mode
- [ ] T170 [P] Optimize bundle size running webpack-bundle-analyzer, code-splitting heavy components
- [ ] T171 [P] Add performance monitoring with Web Vitals tracking (LCP, FID, CLS) in frontend/lib/analytics.ts
- [ ] T172 Implement lazy loading for monthly calendar, definition modal components
- [ ] T173 [P] Add meta tags for SEO in frontend/app/layout.tsx (title, description, Open Graph, Twitter Card)
- [ ] T174 [P] Create favicon and app icons (16x16 to 512x512) in frontend/public/icons/
- [ ] T175 Add keyboard shortcuts (j/k for prev/next day, / for search, ? for help modal)
- [ ] T176 [P] Implement dark mode toggle in frontend/components/layout/ThemeToggle.tsx with system preference detection
- [ ] T177 [P] Add dark mode color scheme in Tailwind CSS configuration with dark: variants
- [ ] T178 Implement accessibility improvements (focus management, keyboard navigation, ARIA labels) across all components
- [ ] T179 Run Lighthouse audit targeting 90+ scores in all categories (Performance, Accessibility, Best Practices, SEO)
- [ ] T180 [P] Add backend logging for calculation errors, API errors, cache hits/misses in production
- [ ] T181 [P] Create deployment guide in docs/deployment.md for backend (Gunicorn, systemd) and frontend (Vercel, Netlify)
- [ ] T182 Run quickstart.md validation following all setup steps on clean environment
- [ ] T183 Create CONTRIBUTING.md with code style guide, commit conventions, PR process
- [ ] T184 [P] Add LICENSE file (AGPL-3.0 per Swiss Ephemeris requirements)
- [ ] T185 Security hardening: Add rate limiting middleware in backend, CSP headers in frontend, input sanitization

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-7)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (US1 → US2 → US3 → US4 → US5)
- **Polish (Phase 8)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational - No dependencies on other stories (MVP foundation)
- **User Story 2 (P2)**: Can start after Foundational - Builds on US1 UI but independently testable (adds tooltips)
- **User Story 3 (P3)**: Can start after Foundational - Extends US1 data display (adds more time periods, visual distinction)
- **User Story 4 (P4)**: Can start after Foundational - New view mode using US1 calculation infrastructure (monthly calendar)
- **User Story 5 (P5)**: Can start after Foundational - Pure location management feature (search, favorites, persistence)

### Critical Path

```
Setup (T001-T009) → Foundational (T010-T027) → US1 Backend (T028-T052) → US1 Frontend (T053-T072) → MVP Launch
                                               ↓
                                         [Parallel after Foundational]
                                               ↓
                    ┌──────────────────────────┼──────────────────────────┬──────────────┬──────────────┐
                    ↓                          ↓                          ↓              ↓              ↓
              US2 (T073-T094)          US3 (T095-T112)           US4 (T113-T134)  US5 (T135-T163)  Polish (T164-T185)
```

### Within Each User Story

**US1 (P1) - View Daily Panchang**:
1. Backend models (T028-T035) in parallel → calculation algorithms (T036-T046) in parallel → orchestrator (T047-T048) → API endpoint (T049-T050)
2. Frontend types (T053-T054) in parallel → API service (T055) → hooks/stores (T056-T058) → UI components (T059-T064) in parallel → page integration (T065-T067) → styling/optimization (T068-T072)

**US2 (P2) - Understand Terms**:
1. Backend: model → data loader → endpoints in parallel
2. Frontend: types/API in parallel → store → tooltip component → term wrapping → language toggle → styling in parallel

**US3 (P3) - Identify Auspicious Times**:
1. Backend: calculation algorithms in parallel → model update → API update
2. Frontend: timeline component → icons in parallel → card updates → visual indicators → animations in parallel

**US4 (P4) - Monthly Calendar**:
1. Backend: special day detection algorithms in parallel → range endpoint → optimization
2. Frontend: calendar components → navigation → special day logic → view toggle → caching

**US5 (P5) - Favorite Locations**:
1. Backend: location endpoints in parallel → search service → nearby/timezone
2. Frontend: location components (search, favorites, picker) → encryption → persistence → app initialization

### Parallel Opportunities

**Maximum Parallelization** (with 10 developers after Foundational phase):

- **Team 1**: US1 Backend (T028-T052) - 2 developers
- **Team 2**: US1 Frontend (T053-T072) - 2 developers
- **Team 3**: US2 Complete (T073-T094) - 1 developer
- **Team 4**: US3 Complete (T095-T112) - 1 developer
- **Team 5**: US4 Complete (T113-T134) - 2 developers
- **Team 6**: US5 Complete (T135-T163) - 2 developers

**Sequential (Single Developer)**:
1. Setup (2 days)
2. Foundational (5 days)
3. US1 (10 days) → Launch MVP
4. US2 (3 days)
5. US3 (3 days)
6. US4 (5 days)
7. US5 (5 days)
8. Polish (3 days)

**Total**: ~36 developer-days for complete feature

---

## Implementation Strategy

### MVP First (Minimum Viable Product)

**MVP Scope** = User Story 1 only (P1):
- Users can view daily Panchang for current location
- All core calculations working (Tithi, Nakshatra, Yoga, Karana, times)
- Basic UI with responsive design
- Offline support for today ±7 days

**MVP Deliverable**: Functional app answering core question: "What are the auspicious/inauspicious times today?"

**Timeline**: Complete Setup + Foundational + US1 = ~17 developer-days

### Incremental Delivery

After MVP launch, add one user story per sprint:

1. **Sprint 1**: US1 (MVP) - Core Panchang viewing
2. **Sprint 2**: US2 - Educational tooltips (improves usability)
3. **Sprint 3**: US3 - Visual time distinction (enhances UX)
4. **Sprint 4**: US4 - Monthly calendar (power user feature)
5. **Sprint 5**: US5 - Location management (convenience feature)
6. **Sprint 6**: Polish - Performance, accessibility, documentation

Each sprint delivers independently testable value increment.

---

## Validation Checklist

- [x] All tasks follow format: `- [ ] [TID] [P?] [Story] Description with file path`
- [x] Tasks organized by user story (Phase 3-7 = US1-US5)
- [x] Setup and Foundational phases separate from user stories
- [x] Each user story has clear goal and independent test criteria
- [x] File paths specified per plan.md structure (backend/src/, frontend/)
- [x] Tasks map to entities from data-model.md (10 entities covered)
- [x] Tasks map to endpoints from panchang-api.yaml (10 endpoints covered)
- [x] Tasks map to calculations from research.md (Tithi, Nakshatra, Rahu Kalam, etc.)
- [x] No test tasks included (not requested in specification per workflow rules)
- [x] Parallel opportunities marked with [P] for independent tasks
- [x] Dependencies documented showing user story completion order
- [x] MVP scope identified (User Story 1 only)
- [x] Critical path and parallel execution examples provided
- [x] Total task count: 185 tasks across 8 phases

**Status**: Task breakdown complete ✅
**Next**: Begin implementation starting with Phase 1 (Setup)

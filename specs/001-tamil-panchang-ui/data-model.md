# Data Model: Tamil Panchangam Web Application

**Feature Branch**: 001-tamil-panchang-ui  
**Date**: 2026-02-06  
**Status**: Phase 1 Design

## Overview

This document defines the core data entities, their attributes, relationships, validation rules, and state transitions for the Tamil Panchang application. The model supports both backend (Python/FastAPI) and frontend (TypeScript/React) implementations.

---

## 1. Core Entities

### 1.1 DailyPanchang

**Purpose**: Complete Panchang data for a specific date and location

**Attributes**:

| Field | Type | Required | Description | Validation |
|-------|------|----------|-------------|------------|
| `id` | UUID | Yes | Unique identifier | UUID v4 format |
| `date` | Date | Yes | Calendar date (YYYY-MM-DD) | ISO 8601 date |
| `location` | Location | Yes | Geographic location | Valid Location reference |
| `timezone` | String | Yes | IANA timezone identifier | Valid IANA timezone |
| `sunrise` | DateTime | Yes | Sunrise time (UTC) | After midnight, before sunset |
| `sunset` | DateTime | Yes | Sunset time (UTC) | After sunrise |
| `moonrise` | DateTime | No | Moonrise time (UTC) | ISO 8601 datetime |
| `moonset` | DateTime | No | Moonset time (UTC) | ISO 8601 datetime |
| `tithi` | TithiInfo | Yes | Lunar day information | Valid Tithi (1-30) |
| `nakshatra` | NakshatraInfo | Yes | Lunar mansion | Valid Nakshatra (1-27) |
| `yoga` | YogaInfo | Yes | Yoga of the day | Valid Yoga (1-27) |
| `karana` | Array<KaranaInfo> | Yes | Karana periods (2 per day) | 2 Karanas, non-overlapping |
| `rahu_kalam` | TimePeriod | Yes | Rahu Kalam period | Within sunrise-sunset |
| `gulika_kalam` | TimePeriod | Yes | Gulika Kalam period | Within sunrise-sunset |
| `yamaganda_kalam` | TimePeriod | Yes | Yamaganda period | Within sunrise-sunset |
| `abhijit_muhurat` | TimePeriod | No | Auspicious midday period | 48 minutes around noon |
| `brahma_muhurat` | TimePeriod | Yes | Pre-dawn auspicious period | 48-96 min before sunrise |
| `varjyam` | Array<TimePeriod> | No | Inauspicious periods | 0-3 per day |
| `durmuhurtam` | Array<TimePeriod> | Yes | Daily inauspicious periods | 2 per day |
| `tamil_month` | String | Yes | Tamil solar month name | One of 12 Tamil months |
| `tamil_year` | String | Yes | Tamil year name | Tamil year cycle name |
| `paksha` | String | Yes | Lunar fortnight | "Shukla" or "Krishna" |
| `special_days` | Array<SpecialDay> | No | Ekadashi, Pradosham, etc. | Valid special day types |
| `calculated_at` | DateTime | Yes | Calculation timestamp | UTC timestamp |

**Relationships**:
- **Location** (Many-to-One): Each Panchang belongs to one Location
- **SpecialDay** (One-to-Many): A Panchang may have multiple special days

**Validation Rules**:
- `sunrise` must be before `sunset`
- `date` must be within ephemeris range (1900-2100)
- All time periods must not extend beyond midnight
- Rahu/Gulika/Yamaganda periods must not overlap with each other
- `timezone` must match Location's timezone

**State Transitions**: N/A (immutable once calculated)

**Indexes**:
- Primary: `id`
- Composite: `(date, location.id)`
- Index on: `date`, `location.id`, `calculated_at`

---

### 1.2 Location

**Purpose**: Geographic location with coordinates and timezone

**Attributes**:

| Field | Type | Required | Description | Validation |
|-------|------|----------|-------------|------------|
| `id` | UUID | Yes | Unique identifier | UUID v4 format |
| `name` | String | Yes | City/location name | 2-100 characters |
| `display_name` | String | Yes | Full display name | e.g., "Chennai, Tamil Nadu, India" |
| `latitude` | Float | Yes | Latitude coordinate | -90 to +90, precision 6 decimals |
| `longitude` | Float | Yes | Longitude coordinate | -180 to +180, precision 6 decimals |
| `timezone` | String | Yes | IANA timezone identifier | Valid IANA timezone (e.g., "Asia/Kolkata") |
| `country` | String | Yes | Country name | ISO 3166-1 alpha-2 code or name |
| `state` | String | No | State/province name | 0-100 characters |
| `is_favorite` | Boolean | Yes | User marked as favorite | Default: false |
| `last_accessed` | DateTime | No | Last time user viewed this location | UTC timestamp |
| `created_at` | DateTime | Yes | When location was added | UTC timestamp |

**Relationships**:
- **DailyPanchang** (One-to-Many): A location can have many Panchang calculations

**Validation Rules**:
- `latitude` range: -66.5 to +66.5 (polar regions excluded per constitution)
- `longitude` range: -180 to +180
- `name` must not be empty or whitespace only
- `timezone` must be valid IANA timezone
- Unique constraint on `(latitude, longitude)` rounded to 4 decimals

**State Transitions**:
- User adds location → `created_at` set, `is_favorite` = false
- User marks favorite → `is_favorite` = true
- User views Panchang → `last_accessed` updated

**Indexes**:
- Primary: `id`
- Index on: `is_favorite`, `last_accessed`
- Spatial index on: `(latitude, longitude)` for nearby search

---

### 1.3 TithiInfo

**Purpose**: Detailed Tithi (lunar day) information

**Attributes**:

| Field | Type | Required | Description | Validation |
|-------|------|----------|-------------|------------|
| `number` | Integer | Yes | Tithi number (1-30) | 1 ≤ number ≤ 30 |
| `name` | String | Yes | Tithi name | e.g., "Pratipada", "Purnima" |
| `name_tamil` | String | Yes | Tamil name | Tamil script name |
| `paksha` | String | Yes | Lunar fortnight | "Shukla" or "Krishna" |
| `start_time` | DateTime | Yes | Tithi start time (UTC) | ISO 8601 datetime |
| `end_time` | DateTime | Yes | Tithi end time (UTC) | After start_time |
| `at_sunrise` | Boolean | Yes | Is Tithi prevailing at sunrise | true/false |

**Validation Rules**:
- `number` 1-15 → `paksha` = "Shukla"
- `number` 16-30 → `paksha` = "Krishna"
- `end_time` must be after `start_time`
- `end_time` - `start_time` must be 19-26 hours (typical Tithi duration)

**Tithi Names** (Embedded Enum):
```python
TITHI_NAMES = {
    1: "Pratipada", 2: "Dwitiya", 3: "Tritiya", 4: "Chaturthi",
    5: "Panchami", 6: "Shashthi", 7: "Saptami", 8: "Ashtami",
    9: "Navami", 10: "Dashami", 11: "Ekadashi", 12: "Dwadashi",
    13: "Trayodashi", 14: "Chaturdashi", 15: "Purnima",
    16: "Pratipada", 17: "Dwitiya", 18: "Tritiya", 19: "Chaturthi",
    20: "Panchami", 21: "Shashthi", 22: "Saptami", 23: "Ashtami",
    24: "Navami", 25: "Dashami", 26: "Ekadashi", 27: "Dwadashi",
    28: "Trayodashi", 29: "Chaturdashi", 30: "Amavasya"
}
```

---

### 1.4 NakshatraInfo

**Purpose**: Lunar mansion (Nakshatra) information

**Attributes**:

| Field | Type | Required | Description | Validation |
|-------|------|----------|-------------|------------|
| `number` | Integer | Yes | Nakshatra number (1-27) | 1 ≤ number ≤ 27 |
| `name` | String | Yes | Nakshatra name | e.g., "Ashwini", "Revati" |
| `name_tamil` | String | Yes | Tamil name | Tamil script name |
| `pada` | Integer | Yes | Pada (quarter) of Nakshatra | 1 ≤ pada ≤ 4 |
| `ruling_deity` | String | Yes | Hindu deity associated | e.g., "Ashwini Kumaras" |
| `start_time` | DateTime | Yes | Nakshatra start time (UTC) | ISO 8601 datetime |
| `end_time` | DateTime | Yes | Nakshatra end time (UTC) | After start_time |
| `at_sunrise` | Boolean | Yes | Is Nakshatra prevailing at sunrise | true/false |

**Validation Rules**:
- `number` between 1 and 27
- `pada` between 1 and 4
- `end_time` must be after `start_time`

**Nakshatra Names** (Embedded Enum):
```python
NAKSHATRA_NAMES = {
    1: "Ashwini", 2: "Bharani", 3: "Krittika", 4: "Rohini",
    5: "Mrigashira", 6: "Ardra", 7: "Punarvasu", 8: "Pushya",
    9: "Ashlesha", 10: "Magha", 11: "Purva Phalguni", 12: "Uttara Phalguni",
    13: "Hasta", 14: "Chitra", 15: "Swati", 16: "Vishakha",
    17: "Anuradha", 18: "Jyeshtha", 19: "Mula", 20: "Purva Ashadha",
    21: "Uttara Ashadha", 22: "Shravana", 23: "Dhanishta", 24: "Shatabhisha",
    25: "Purva Bhadrapada", 26: "Uttara Bhadrapada", 27: "Revati"
}
```

---

### 1.5 YogaInfo

**Purpose**: Yoga (Sun + Moon combination) information

**Attributes**:

| Field | Type | Required | Description | Validation |
|-------|------|----------|-------------|------------|
| `number` | Integer | Yes | Yoga number (1-27) | 1 ≤ number ≤ 27 |
| `name` | String | Yes | Yoga name | e.g., "Vishkambha", "Siddhi" |
| `name_tamil` | String | Yes | Tamil name | Tamil script name |

**Validation Rules**:
- `number` between 1 and 27

**Yoga Names** (Embedded Enum):
```python
YOGA_NAMES = {
    1: "Vishkambha", 2: "Priti", 3: "Ayushman", 4: "Saubhagya",
    5: "Shobhana", 6: "Atiganda", 7: "Sukarma", 8: "Dhriti",
    9: "Shula", 10: "Ganda", 11: "Vriddhi", 12: "Dhruva",
    13: "Vyaghata", 14: "Harshana", 15: "Vajra", 16: "Siddhi",
    17: "Vyatipata", 18: "Variyan", 19: "Parigha", 20: "Shiva",
    21: "Siddha", 22: "Sadhya", 23: "Shubha", 24: "Shukla",
    25: "Brahma", 26: "Indra", 27: "Vaidhriti"
}
```

---

### 1.6 KaranaInfo

**Purpose**: Karana (half-Tithi) information

**Attributes**:

| Field | Type | Required | Description | Validation |
|-------|------|----------|-------------|------------|
| `name` | String | Yes | Karana name | One of 11 Karana types |
| `name_tamil` | String | Yes | Tamil name | Tamil script name |
| `type` | String | Yes | Karana type | "Movable" or "Fixed" |
| `start_time` | DateTime | Yes | Karana start time (UTC) | ISO 8601 datetime |
| `end_time` | DateTime | Yes | Karana end time (UTC) | After start_time |

**Validation Rules**:
- `name` must be one of 11 valid Karana names
- `type` must be "Movable" or "Fixed"
- Duration approximately 6 hours (half Tithi)

**Karana Names** (Embedded Enum):
```python
KARANA_NAMES = {
    "movable": ["Bava", "Balava", "Kaulava", "Taitila", "Garija", "Vanija", "Vishti"],
    "fixed": ["Shakuni", "Chatushpada", "Naga", "Kimstughna"]
}
```

---

### 1.7 TimePeriod

**Purpose**: Generic time period for auspicious/inauspicious times

**Attributes**:

| Field | Type | Required | Description | Validation |
|-------|------|----------|-------------|------------|
| `start_time` | DateTime | Yes | Period start time (UTC) | ISO 8601 datetime |
| `end_time` | DateTime | Yes | Period end time (UTC) | After start_time |
| `duration_minutes` | Integer | Yes | Duration in minutes | end_time - start_time |
| `is_auspicious` | Boolean | Yes | True if auspicious, False if inauspicious | true/false |

**Validation Rules**:
- `end_time` must be after `start_time`
- `duration_minutes` must equal actual duration
- Duration must be < 24 hours

**Usage**:
- Rahu Kalam (inauspicious)
- Gulika Kalam (inauspicious)
- Yamaganda (inauspicious)
- Abhijit Muhurat (auspicious)
- Brahma Muhurat (auspicious)
- Varjyam (inauspicious)
- Durmuhurtam (inauspicious)

---

### 1.8 SpecialDay

**Purpose**: Special religious/astrological days

**Attributes**:

| Field | Type | Required | Description | Validation |
|-------|------|----------|-------------|------------|
| `type` | String | Yes | Type of special day | Enum: see below |
| `name` | String | Yes | Specific name | e.g., "Vaikunta Ekadashi" |
| `name_tamil` | String | Yes | Tamil name | Tamil script name |
| `description` | String | Yes | Brief description | 50-500 characters |
| `significance` | String | Yes | Religious significance | 100-1000 characters |
| `observances` | Array<String> | No | Recommended observances | e.g., ["fasting", "puja", "charity"] |
| `fasting_rules` | String | No | Fasting instructions | For Ekadashi, Pradosham, etc. |
| `parana_time` | DateTime | No | Fast-breaking time | For Ekadashi next day |

**Validation Rules**:
- `type` must be valid special day type
- `name` must not be empty
- `parana_time` only for Ekadashi type

**Special Day Types** (Enum):
```python
SPECIAL_DAY_TYPES = [
    "Ekadashi",           # 11th Tithi
    "Pradosham",          # 13th Tithi twilight
    "Amavasya",           # New moon
    "Purnima",            # Full moon
    "Shivaratri",         # Chaturdashi + specific month
    "Sankranti",          # Sun entering new zodiac sign
    "Festival",           # Major festivals (Diwali, Pongal, etc.)
    "Auspicious"          # Other auspicious days
]
```

---

### 1.9 TermDefinition

**Purpose**: Educational content for Panchang terms

**Attributes**:

| Field | Type | Required | Description | Validation |
|-------|------|----------|-------------|------------|
| `term_id` | String | Yes | Unique term identifier | Snake_case, e.g., "rahu_kalam" |
| `name_en` | String | Yes | English name | e.g., "Rahu Kalam" |
| `name_ta` | String | Yes | Tamil name | e.g., "ராகு காலம்" |
| `short_definition_en` | String | Yes | Brief English definition | 50-200 characters |
| `short_definition_ta` | String | Yes | Brief Tamil definition | 50-200 characters |
| `detailed_explanation_en` | String | Yes | Full English explanation | 200-2000 characters |
| `detailed_explanation_ta` | String | Yes | Full Tamil explanation | 200-2000 characters |
| `significance_tradition` | String | No | Tamil tradition specifics | 100-500 characters |
| `calculation_method` | String | No | How it's calculated | For technical users |
| `related_terms` | Array<String> | No | Related term IDs | References to other terms |
| `sources` | Array<String> | No | Reference sources | e.g., ["Vedic texts", "Tradition"] |
| `icon` | String | No | Icon identifier | For UI display |

**Validation Rules**:
- `term_id` must be unique
- `name_en` and `name_ta` required
- At least `short_definition_en` must be provided

**Indexed Terms** (20 core terms):
```python
CORE_TERMS = [
    "tithi", "nakshatra", "yoga", "karana", "rahu_kalam", "gulika_kalam",
    "yamaganda", "varjyam", "durmuhurtam", "abhijit_muhurat", "brahma_muhurat",
    "ekadashi", "pradosham", "amavasya", "purnima", "shukla_paksha",
    "krishna_paksha", "sankranti", "ayanamsa", "sidereal_zodiac"
]
```

---

### 1.10 UserPreferences

**Purpose**: User settings and preferences (localStorage/backend)

**Attributes**:

| Field | Type | Required | Description | Validation |
|-------|------|----------|-------------|------------|
| `id` | UUID | Yes | Unique identifier | UUID v4 format |
| `language` | String | Yes | UI language | "en" or "ta" |
| `theme` | String | Yes | UI theme | "light" or "dark" |
| `default_location` | UUID | No | Default location ID | Valid Location reference |
| `favorite_locations` | Array<UUID> | No | List of favorite location IDs | Max 10 locations |
| `show_tooltips` | Boolean | Yes | Show term tooltips | Default: true |
| `calendar_view` | String | Yes | Preferred calendar view | "daily" or "monthly" |
| `time_format` | String | Yes | Time display format | "12h" or "24h" |
| `notifications_enabled` | Boolean | Yes | Enable notifications | Default: false |
| `updated_at` | DateTime | Yes | Last update timestamp | UTC timestamp |

**Validation Rules**:
- `language` must be "en" or "ta"
- `theme` must be "light" or "dark"
- `favorite_locations` max length: 10
- `default_location` must be in `favorite_locations` if set

**State Transitions**:
- User changes language → `language` updated, `updated_at` set
- User adds favorite → append to `favorite_locations`, `updated_at` set
- User sets default → `default_location` set, `updated_at` set

---

## 2. Entity Relationships

### Relationship Diagram

```
┌──────────────────┐
│  UserPreferences │
│                  │
│  - language      │
│  - theme         │
│  - default_loc───┼─────┐
└──────────────────┘     │
                         │
                         ▼
┌──────────────────┐   ┌──────────────────┐
│  TermDefinition  │   │    Location      │
│                  │   │                  │
│  - term_id       │   │  - id            │
│  - name_en       │   │  - name          │
│  - name_ta       │   │  - lat, lon      │
│  - definitions   │   │  - timezone      │
└──────────────────┘   │  - is_favorite   │
                       └─────────┬────────┘
                                 │
                                 │ 1:N
                                 ▼
                       ┌──────────────────┐
                       │  DailyPanchang   │
                       │                  │
                       │  - id            │
                       │  - date          │
                       │  - location ────►│
                       │  - sunrise       │
                       │  - sunset        │
                       │  - tithi ────────┼───► TithiInfo
                       │  - nakshatra ────┼───► NakshatraInfo
                       │  - yoga ─────────┼───► YogaInfo
                       │  - karana[] ─────┼───► KaranaInfo[]
                       │  - rahu_kalam ───┼───► TimePeriod
                       │  - gulika_kalam ─┼───► TimePeriod
                       │  - special_days[]┼───► SpecialDay[]
                       └──────────────────┘
```

### Cardinality Rules

- **Location → DailyPanchang**: One-to-Many (1:N)
  - One location can have many Panchang calculations (different dates)
  
- **DailyPanchang → TithiInfo**: One-to-One (1:1, embedded)
  - Each Panchang has exactly one Tithi
  
- **DailyPanchang → NakshatraInfo**: One-to-One (1:1, embedded)
  - Each Panchang has exactly one Nakshatra
  
- **DailyPanchang → KaranaInfo**: One-to-Many (1:2, embedded)
  - Each Panchang has exactly 2 Karanas per day
  
- **DailyPanchang → SpecialDay**: One-to-Many (1:N, embedded)
  - Each Panchang can have 0 to N special days

- **UserPreferences → Location**: Many-to-One (N:1, reference)
  - User preferences reference one default location

---

## 3. Data Validation Summary

### Backend Validation (Pydantic Models)

```python
from pydantic import BaseModel, Field, validator
from datetime import datetime
from typing import Optional, List
from uuid import UUID

class TithiInfo(BaseModel):
    number: int = Field(..., ge=1, le=30)
    name: str
    name_tamil: str
    paksha: str = Field(..., pattern="^(Shukla|Krishna)$")
    start_time: datetime
    end_time: datetime
    at_sunrise: bool
    
    @validator('paksha')
    def validate_paksha_number(cls, v, values):
        number = values.get('number')
        if number and number <= 15 and v != "Shukla":
            raise ValueError("Tithi 1-15 must be Shukla Paksha")
        if number and number > 15 and v != "Krishna":
            raise ValueError("Tithi 16-30 must be Krishna Paksha")
        return v
    
    @validator('end_time')
    def validate_end_after_start(cls, v, values):
        start = values.get('start_time')
        if start and v <= start:
            raise ValueError("end_time must be after start_time")
        return v
```

### Frontend Validation (TypeScript Interfaces)

```typescript
export interface TithiInfo {
  number: number; // 1-30
  name: string;
  nameTamil: string;
  paksha: 'Shukla' | 'Krishna';
  startTime: string; // ISO 8601 UTC
  endTime: string; // ISO 8601 UTC
  atSunrise: boolean;
}

export interface Location {
  id: string; // UUID
  name: string;
  displayName: string;
  latitude: number; // -66.5 to +66.5
  longitude: number; // -180 to +180
  timezone: string; // IANA timezone
  country: string;
  state?: string;
  isFavorite: boolean;
  lastAccessed?: string;
  createdAt: string;
}
```

---

## 4. State Management

### Frontend State (Zustand)

```typescript
interface PanchangStore {
  // Current state
  selectedDate: Date;
  selectedLocation: Location | null;
  currentPanchang: DailyPanchang | null;
  
  // User preferences
  preferences: UserPreferences;
  
  // Loading/error states
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setDate: (date: Date) => void;
  setLocation: (location: Location) => void;
  loadPanchang: (date: Date, location: Location) => Promise<void>;
  updatePreferences: (prefs: Partial<UserPreferences>) => void;
}
```

### Backend Cache (SQLite)

```sql
-- Panchang calculation cache
CREATE TABLE panchang_cache (
    id TEXT PRIMARY KEY,
    cache_key TEXT UNIQUE NOT NULL,
    date TEXT NOT NULL,
    location_id TEXT NOT NULL,
    data TEXT NOT NULL, -- JSON blob
    calculated_at TEXT NOT NULL,
    expires_at TEXT,    -- NULL for historical dates
    FOREIGN KEY (location_id) REFERENCES locations(id)
);

CREATE INDEX idx_cache_date_location ON panchang_cache(date, location_id);
CREATE INDEX idx_cache_expires ON panchang_cache(expires_at);

-- Locations
CREATE TABLE locations (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    display_name TEXT NOT NULL,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    timezone TEXT NOT NULL,
    country TEXT NOT NULL,
    state TEXT,
    is_favorite INTEGER DEFAULT 0,
    last_accessed TEXT,
    created_at TEXT NOT NULL
);

CREATE INDEX idx_locations_favorite ON locations(is_favorite);
CREATE UNIQUE INDEX idx_locations_coords ON locations(
    ROUND(latitude, 4), 
    ROUND(longitude, 4)
);
```

---

## 5. Immutability & Caching Rules

### Immutable Entities

**DailyPanchang, TithiInfo, NakshatraInfo, YogaInfo, KaranaInfo, TimePeriod**:
- Once calculated, never modified
- Can be safely cached indefinitely
- Historical dates never expire

### Mutable Entities

**Location**:
- `is_favorite` can be toggled by user
- `last_accessed` updated on each view
- Cache invalidation on update

**UserPreferences**:
- Frequently updated by user actions
- Stored in localStorage + optional backend sync
- No cache invalidation needed (always fetch latest)

**TermDefinition**:
- Rarely updated (content changes)
- Version-controlled in codebase
- Cache with long TTL (30 days)

---

## 6. Data Migration Strategy

### Version 1.0.0 (Initial)

**Backend Schema**:
- SQLite schema created via Alembic migrations
- Seed data: 100 Indian cities preloaded
- Term definitions loaded from JSON

**Frontend Schema**:
- IndexedDB schema created via idb library
- Version 1: Stores Panchang data, locations, preferences

### Future Migrations

**Adding New Fields**:
- Backend: Alembic migration with default values
- Frontend: IndexedDB version upgrade handler
- Backward compatibility: Old data valid without new fields

**Deprecating Fields**:
- Mark as optional, maintain for 2 versions
- Remove in major version bump

---

## 7. Performance Considerations

### Entity Size Estimates

| Entity | Typical Size | Cache Strategy |
|--------|-------------|----------------|
| DailyPanchang | ~3 KB JSON | Cache 60 days (±30 days) |
| Location | ~200 bytes | Cache all favorites (<10) |
| TermDefinition | ~1 KB | Cache all (20 terms = 20 KB) |
| UserPreferences | ~500 bytes | localStorage + memory |

### Query Optimization

**Most Frequent Queries**:
1. Get Panchang by date + location (99% of traffic)
   - Index on `(date, location_id)`
   - 99% cache hit rate for current/recent dates

2. Get favorite locations
   - Index on `is_favorite`
   - <10 locations, always in memory

3. Search locations by name
   - Full-text search index on `name` + `display_name`
   - Preloaded cities eliminate most searches

---

## 8. Data Model Checklist

- [x] All entities defined with complete attributes
- [x] Validation rules specified for each field
- [x] Relationships and cardinality documented
- [x] State transitions identified for mutable entities
- [x] Indexing strategy defined
- [x] Immutability rules specified
- [x] Cache strategy documented
- [x] Backend schema (SQLite) designed
- [x] Frontend interfaces (TypeScript) designed
- [x] Performance estimates calculated

**Status**: Phase 1 Data Model Complete ✅

<!--
SYNC IMPACT REPORT
==================
Version Change: None → 1.0.0 (Initial Constitution)
Rationale: MINOR - Initial constitution establishment for Astrome project

Modified Principles:
  - Created: I. Astronomical Accuracy
  - Created: II. Location-Based Calculations
  - Created: III. Data Privacy & Security
  - Created: IV. Offline-First Architecture
  - Created: V. Cultural Sensitivity

Added Sections:
  - Core Principles (5 principles)
  - Technical Standards
  - Development Workflow
  - Governance

Removed Sections: N/A (initial creation)

Templates Status:
  ✅ plan-template.md - Constitution Check section compatible
  ✅ spec-template.md - Requirements alignment compatible
  ✅ tasks-template.md - Task categorization compatible

Follow-up TODOs: None

Generated: 2026-02-06
-->

# Astrome Constitution

## Core Principles

### I. Astronomical Accuracy

All astrological calculations MUST be based on verified astronomical algorithms and ephemeris data. Planetary positions, house cusps, and transit times MUST be computed with precision sufficient for astrological interpretation (minimum 1 arc-minute accuracy). External ephemeris libraries or validated calculation engines MUST be used; no approximations or simplified models are acceptable for core computations.

**Rationale**: Astrological practice depends on precise celestial positions. Users trust the app for accurate timing of auspicious and inauspicious moments, making astronomical accuracy non-negotiable.

### II. Location-Based Calculations

All time-sensitive astrological calculations MUST incorporate the user's geographic coordinates (latitude, longitude, timezone). The system MUST request location permissions explicitly with clear justification. Location data MUST be used exclusively for astronomical calculations (local sidereal time, house systems, rising signs). Default fallback behavior MUST be defined when location is unavailable.

**Rationale**: Astrological timing is inherently location-dependent. Local rising/setting times and house cusps vary by geography, making location data essential for accurate predictions.

### III. Data Privacy & Security

User personal data (birth details, location, preferences) MUST be stored locally on-device by default. Any cloud synchronization MUST be opt-in with explicit consent. Birth chart data and location history MUST NOT be transmitted to third-party services without user approval. All sensitive data at rest MUST be encrypted using platform-standard mechanisms.

**Rationale**: Birth details and location data are highly personal. Users must trust that their astrological inquiries remain private and are not exploited commercially or shared without consent.

### IV. Offline-First Architecture

Core functionality (birth chart calculation, daily auspicious times for cached locations) MUST work without network connectivity. Ephemeris data for a reasonable time range (minimum 1 year forward/backward) MUST be bundled or cached locally. Network requests MUST be limited to: ephemeris updates, optional cloud sync, and supplementary content. The app MUST gracefully degrade when offline, clearly indicating which features require connectivity.

**Rationale**: Users often consult astrological timing in situations without reliable internet access. Offline capability ensures the app remains useful in all circumstances.

### V. Cultural Sensitivity

The app MUST support multiple astrological systems (Vedic, Western, etc.) without imposing a single interpretive framework. Terminology, house systems, and calculation methods MUST be configurable per tradition. Cultural and religious contexts MUST be respected in UI language and iconography. No astrological tradition MUST be presented as superior or default without user selection.

**Rationale**: Astrology is practiced globally across diverse cultural contexts. Respecting these traditions ensures the app serves a broad audience without alienating any community.

## Technical Standards

### Performance Requirements

- Astrological calculations (chart generation, transit lookup) MUST complete within 500ms on target devices
- UI responsiveness MUST maintain 60 fps during normal interactions
- App launch time MUST NOT exceed 3 seconds on mid-range devices
- Ephemeris data storage MUST NOT exceed 50MB for 2-year range

### Compatibility

- Target platforms: iOS 15+, Android 8.0+
- Support for both mobile and tablet form factors
- Accessibility: WCAG 2.1 Level AA compliance for visual and interaction elements
- Localization: Support for at least English, Hindi, and configurable number/date formats

### Data Management

- Local database for user charts, locations, preferences
- Versioned ephemeris data format allowing incremental updates
- Export functionality for user data in open formats (JSON, iCal for events)
- Data retention policy: user controls all data deletion

## Development Workflow

### Quality Gates

- All features MUST include unit tests for calculation logic (minimum 80% coverage)
- Astronomical calculations MUST be validated against reference ephemeris (Swiss Ephemeris, JPL Horizons)
- UI changes MUST be tested on both iOS and Android before merge
- Accessibility features MUST be verified with platform screen readers

### Code Review Standards

- At least one reviewer approval required before merge
- Calculation changes MUST be reviewed by team member with astronomical/astrological domain knowledge
- Privacy-impacting changes MUST document data flow and storage implications
- Performance regressions MUST be justified and documented

### Versioning

- Semantic versioning: MAJOR.MINOR.PATCH
- MAJOR: Breaking changes to calculation algorithms or data formats
- MINOR: New astrological features or systems
- PATCH: Bug fixes, UI refinements, non-functional improvements

## Governance

This constitution supersedes all other development practices and guidelines. All feature specifications, implementation plans, and code reviews MUST verify compliance with these principles.

Any complexity or deviation from these principles MUST be explicitly justified in writing with stakeholder approval before implementation.

Constitution amendments require:
1. Written proposal documenting rationale and impact
2. Review by project stakeholders
3. Migration plan for existing features if applicable
4. Version bump following semantic versioning rules

For day-to-day development guidance aligned with these principles, refer to agent-specific context files generated by `.specify/scripts/bash/update-agent-context.sh`.

**Version**: 1.0.0 | **Ratified**: 2026-02-06 | **Last Amended**: 2026-02-06

# Quickstart Guide: Tamil Panchang Web Application

**Feature Branch**: 001-tamil-panchang-ui
**Date**: 2026-02-06
**Status**: Phase 1 Development Setup

## Prerequisites

### System Requirements

- **Operating System**: macOS 12+, Ubuntu 20.04+, or Windows 10+ with WSL2
- **Python**: **3.11 or 3.12 recommended** (3.13+ may have package compatibility issues)
- **Node.js**: 18.0 or later
- **Package Manager**: npm 9+ or yarn 1.22+
- **Git**: 2.30 or later

### Required Tools

```bash
# Check versions
python3.11 --version  # Should be 3.11.x or 3.12.x
node --version        # Should be >= 18.0
npm --version         # Should be >= 9.0
git --version         # Should be >= 2.30
```

---

## Project Structure

```
astrome/
├── backend/           # FastAPI Python backend
│   ├── src/
│   │   ├── api/      # REST API routes
│   │   ├── models/   # Pydantic models
│   │   ├── services/ # Business logic (Panchang calculations)
│   │   ├── db/       # Database (SQLite)
│   │   ├── config/   # Configuration
│   │   └── data/     # Ephemeris files + preloaded cities
│   ├── tests/        # Backend tests (pytest)
│   ├── requirements.txt
│   └── pyproject.toml
│
├── frontend/         # Next.js React frontend
│   ├── app/          # Next.js 14 App Router pages
│   ├── components/   # React components
│   ├── hooks/        # Custom React hooks
│   ├── services/     # API client
│   ├── stores/       # Zustand state management
│   ├── public/       # Static assets
│   ├── tests/        # Frontend tests (Vitest, Playwright)
│   ├── package.json
│   └── tsconfig.json
│
├── docs/             # Documentation
├── .specify/         # Speckit workflow files
└── specs/            # Feature specifications
    └── 001-tamil-panchang-ui/
        ├── spec.md
        ├── plan.md
        ├── research.md
        ├── data-model.md
        ├── contracts/
        └── quickstart.md (this file)
```

---

## Quick Setup (5 Minutes)

### 1. Clone Repository

```bash
git clone https://github.com/yourusername/astrome.git
cd astrome
git checkout 001-tamil-panchang-ui
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment (use Python 3.11 or 3.12 for best compatibility)
python3.11 -m venv venv  # or python3.12
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Download Swiss Ephemeris files (~15MB)
mkdir -p src/data/ephe
cd src/data/ephe
wget https://www.astro.com/ftp/swisseph/ephe/seas_18.se1
wget https://www.astro.com/ftp/swisseph/ephe/semo_18.se1
wget https://www.astro.com/ftp/swisseph/ephe/sepl_18.se1
cd ../../..

# Initialize database
python -m src.db.init_db

# Load preloaded cities
python -m src.data.load_cities

# Verify setup
python -m src.services.panchang_calculator --test
```

**Expected output**:
```
✓ Swiss Ephemeris loaded
✓ Date range: 1900-01-01 to 2100-12-31
✓ Test calculation successful
  Chennai, 2026-02-06: Tithi=Panchami, Nakshatra=Uttara Phalguni
```

### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd ../frontend

# Install dependencies
npm install

# Create .env.local file
cat > .env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_ENV=development
EOF

# Verify setup
npm run build
```

### 4. Run Development Servers

**Terminal 1 (Backend)**:
```bash
cd backend
source venv/bin/activate
uvicorn src.main:app --reload --port 8000
```

**Terminal 2 (Frontend)**:
```bash
cd frontend
npm run dev
```

**Access Application**:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs (Swagger UI)

---

## Detailed Setup Instructions

### Backend Configuration

#### 1. Environment Variables

Create `backend/.env` file:

```bash
# Database
DATABASE_URL=sqlite:///./astrome.db

# Swiss Ephemeris
EPHE_PATH=./src/data/ephe

# API Configuration
API_TITLE=Tamil Panchang API
API_VERSION=1.0.0
CORS_ORIGINS=http://localhost:3000,http://localhost:3001

# Cache Configuration
CACHE_EXPIRY_DAYS=90  # Historical Panchang cache expiry

# Logging
LOG_LEVEL=INFO
LOG_FILE=./logs/astrome.log

# Rate Limiting (optional)
RATE_LIMIT_ENABLED=false
RATE_LIMIT_PER_MINUTE=60
```

#### 2. Database Initialization

```bash
# Run migrations
alembic upgrade head

# Verify tables created
sqlite3 astrome.db ".tables"
# Expected: locations, panchang_cache, term_definitions
```

#### 3. Load Initial Data

```bash
# Load 100 preloaded Indian cities
python -m src.data.load_cities --file src/data/indian_cities.json

# Load term definitions
python -m src.data.load_definitions --file src/data/term_definitions.json

# Verify data
sqlite3 astrome.db "SELECT COUNT(*) FROM locations;"
# Expected: 100

sqlite3 astrome.db "SELECT COUNT(*) FROM term_definitions;"
# Expected: 20
```

#### 4. Run Tests

```bash
# Unit tests
pytest tests/unit/ -v

# Integration tests
pytest tests/integration/ -v

# Test coverage
pytest --cov=src --cov-report=html
# Open htmlcov/index.html in browser

# Test specific calculation
pytest tests/unit/test_panchang_calculator.py::test_tithi_calculation -v
```

### Frontend Configuration

#### 1. Environment Variables

Create `frontend/.env.local`:

```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_API_TIMEOUT=30000

# Feature Flags
NEXT_PUBLIC_ENABLE_OFFLINE_MODE=true
NEXT_PUBLIC_ENABLE_PWA=true

# Analytics (optional)
NEXT_PUBLIC_ANALYTICS_ID=

# Environment
NEXT_PUBLIC_ENV=development
```

#### 2. Install Dev Tools (Optional)

```bash
# React DevTools, Redux DevTools
npm install -D @redux-devtools/extension

# VS Code extensions (recommended)
code --install-extension dbaeumer.vscode-eslint
code --install-extension esbenp.prettier-vscode
code --install-extension bradlc.vscode-tailwindcss
```

#### 3. Run Tests

```bash
# Unit tests (Vitest)
npm run test

# Watch mode
npm run test:watch

# E2E tests (Playwright)
npm run test:e2e

# E2E with UI
npm run test:e2e:ui

# Test coverage
npm run test:coverage
```

#### 4. Linting & Formatting

```bash
# Lint
npm run lint

# Format with Prettier
npm run format

# Type check
npm run type-check
```

---

## Development Workflow

### Creating a New Feature

```bash
# 1. Create feature branch from main
git checkout main
git pull origin main
git checkout -b feature/your-feature-name

# 2. Make changes in backend and/or frontend

# 3. Run tests
cd backend && pytest
cd ../frontend && npm test

# 4. Commit with conventional commits
git add .
git commit -m "feat: add tooltip component for term definitions"

# 5. Push and create PR
git push origin feature/your-feature-name
```

### Running Individual Components

#### Backend Only

```bash
cd backend
source venv/bin/activate

# Run specific service
python -m src.services.panchang_calculator --date 2026-02-06 --lat 13.0827 --lon 80.2707

# Interactive Python shell
python
>>> from src.services.panchang_calculator import PanchangCalculator
>>> calc = PanchangCalculator()
>>> result = calc.calculate_panchang("2026-02-06", 13.0827, 80.2707, "Asia/Kolkata")
>>> print(result)
```

#### Frontend Only (with Mock API)

```bash
cd frontend

# Start with mock API (MSW - Mock Service Worker)
npm run dev:mock

# Build for production
npm run build

# Preview production build
npm run start
```

---

## API Testing

### Using Swagger UI

1. Start backend: `uvicorn src.main:app --reload`
2. Open http://localhost:8000/docs
3. Try out endpoints:
   - GET `/api/v1/panchang?date=2026-02-06&latitude=13.0827&longitude=80.2707&timezone=Asia/Kolkata`
   - GET `/api/v1/locations/search?q=Chennai`
   - GET `/api/v1/definitions`

### Using curl

```bash
# Get daily Panchang
curl "http://localhost:8000/api/v1/panchang?date=2026-02-06&latitude=13.0827&longitude=80.2707&timezone=Asia/Kolkata" | jq

# Search locations
curl "http://localhost:8000/api/v1/locations/search?q=Chennai&limit=5" | jq

# Get term definition
curl "http://localhost:8000/api/v1/definitions/rahu_kalam" | jq

# Health check
curl "http://localhost:8000/health" | jq
```

### Using HTTPie (recommended)

```bash
# Install HTTPie
pip install httpie

# Get Panchang (cleaner syntax)
http GET localhost:8000/api/v1/panchang date==2026-02-06 latitude==13.0827 longitude==80.2707 timezone==Asia/Kolkata

# Search locations
http GET localhost:8000/api/v1/locations/search q==Chennai limit==5

# Pretty-print JSON
http GET localhost:8000/api/v1/panchang date==2026-02-06 latitude==13.0827 longitude==80.2707 timezone==Asia/Kolkata | jq '.tithi'
```

---

## Troubleshooting

### Backend Issues

#### Swiss Ephemeris files not found

**Error**: `FileNotFoundError: Ephemeris file not found`

**Solution**:
```bash
cd backend/src/data/ephe
wget https://www.astro.com/ftp/swisseph/ephe/seas_18.se1
wget https://www.astro.com/ftp/swisseph/ephe/semo_18.se1
wget https://www.astro.com/ftp/swisseph/ephe/sepl_18.se1
```

#### Database locked

**Error**: `sqlite3.OperationalError: database is locked`

**Solution**:
```bash
# Close all connections, restart server
pkill -f uvicorn
uvicorn src.main:app --reload
```

#### Import errors

**Error**: `ModuleNotFoundError: No module named 'swisseph'`

**Solution**:
```bash
# Ensure virtual environment is activated
source venv/bin/activate  # or venv\Scripts\activate on Windows

# Reinstall dependencies
pip install -r requirements.txt
```

### Frontend Issues

#### API connection refused

**Error**: `ECONNREFUSED localhost:8000`

**Solution**:
1. Verify backend is running: `curl http://localhost:8000/health`
2. Check `NEXT_PUBLIC_API_URL` in `.env.local`
3. Restart Next.js dev server

#### Module not found

**Error**: `Module not found: Can't resolve 'dayjs'`

**Solution**:
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### Build errors

**Error**: `Type error: Property 'xxx' does not exist on type 'yyy'`

**Solution**:
```bash
# Check TypeScript types
npm run type-check

# Update interface definitions in types/ directory
```

---

## Performance Testing

### Backend Load Testing (Locust)

```bash
# Install locust
pip install locust

# Create locustfile.py
cat > locustfile.py << EOF
from locust import HttpUser, task, between

class PanchangUser(HttpUser):
    wait_time = between(1, 3)

    @task
    def get_panchang(self):
        self.client.get("/api/v1/panchang?date=2026-02-06&latitude=13.0827&longitude=80.2707&timezone=Asia/Kolkata")

    @task
    def search_location(self):
        self.client.get("/api/v1/locations/search?q=Chennai")
EOF

# Run load test
locust -f locustfile.py --host=http://localhost:8000

# Open http://localhost:8089 for UI
```

### Frontend Performance (Lighthouse)

```bash
# Build production version
npm run build
npm run start

# Run Lighthouse (requires Chrome)
npx lighthouse http://localhost:3000 --output html --output-path lighthouse-report.html

# Target scores:
# Performance: >90
# Accessibility: >95
# Best Practices: >95
# SEO: >90
```

---

## Deployment Checklist

### Backend Production Readiness

- [ ] Environment variables set in production `.env`
- [ ] Swiss Ephemeris files uploaded to server
- [ ] Database initialized and migrated
- [ ] Preloaded cities and definitions loaded
- [ ] Gunicorn/Uvicorn workers configured (4+ workers)
- [ ] CORS origins restricted to production domain
- [ ] Rate limiting enabled
- [ ] Logging configured (file + external service)
- [ ] Health check endpoint tested
- [ ] HTTPS configured
- [ ] Backup strategy for SQLite database

### Frontend Production Readiness

- [ ] `NEXT_PUBLIC_API_URL` set to production backend
- [ ] PWA manifest and service worker configured
- [ ] Offline mode tested
- [ ] Analytics configured (if needed)
- [ ] Error tracking (Sentry/LogRocket) integrated
- [ ] Build optimization verified (`npm run build`)
- [ ] Lighthouse scores >90 all categories
- [ ] Meta tags and SEO configured
- [ ] Favicon and app icons generated
- [ ] HTTPS configured

---

## Resources

### Documentation

- **Swiss Ephemeris**: https://www.astro.com/swisseph/swephprg.htm
- **FastAPI**: https://fastapi.tiangolo.com/
- **Next.js 14**: https://nextjs.org/docs
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Pydantic**: https://docs.pydantic.dev/
- **Zustand**: https://github.com/pmndrs/zustand

### API References

- **OpenAPI Spec**: `specs/001-tamil-panchang-ui/contracts/panchang-api.yaml`
- **Data Model**: `specs/001-tamil-panchang-ui/data-model.md`
- **Research**: `specs/001-tamil-panchang-ui/research.md`

### Community

- **GitHub Issues**: https://github.com/yourusername/astrome/issues
- **Discussions**: https://github.com/yourusername/astrome/discussions
- **Slack/Discord**: [Link to community chat]

---

## Next Steps

1. **Complete Feature Spec**: Fill out `specs/001-tamil-panchang-ui/spec.md` with user stories
2. **Generate Tasks**: Run `/speckit.tasks` command to create task breakdown
3. **Start Development**: Pick tasks from tasks.md, implement incrementally
4. **Test Each Feature**: Write tests before/during implementation
5. **Review Code**: Submit PRs for review after each user story

---

## Quick Reference Commands

```bash
# Backend
cd backend && source venv/bin/activate
uvicorn src.main:app --reload             # Dev server
pytest tests/ -v                          # Run tests
alembic revision --autogenerate -m "msg" # Create migration
alembic upgrade head                      # Run migrations

# Frontend
cd frontend
npm run dev              # Dev server
npm test                 # Unit tests
npm run test:e2e         # E2E tests
npm run build            # Production build
npm run lint             # Lint code

# Database
sqlite3 backend/astrome.db              # Open DB
.schema                                  # Show schema
SELECT * FROM locations LIMIT 10;       # Query data

# Git
git checkout 001-tamil-panchang-ui      # Switch to feature branch
git status                               # Check changes
git add . && git commit -m "msg"        # Commit
git push origin 001-tamil-panchang-ui   # Push
```

---

**Setup Complete!** 🎉
You should now be able to access:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

**Questions?** Check [docs/FAQ.md](../../docs/FAQ.md) or open an issue on GitHub.

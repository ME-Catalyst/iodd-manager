# Changelog

All notable changes to IODD Manager will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added - Latest Features

#### User Experience Enhancements
- **Dark/Light Theme Toggle** - System preference detection with manual override, localStorage persistence
- **Keyboard Shortcuts System** - Comprehensive shortcuts for navigation (h/d/s/c/a), actions (Ctrl+U, Ctrl+Shift+T, Ctrl+R), and help (Shift+?)
- **Keyboard Shortcuts Help Modal** - Interactive modal showing all available shortcuts, categorized by function
- **Analytics Dashboard** - Rich data visualizations with Chart.js
  - Summary metrics cards with trend indicators
  - Multi-tab interface (Overview, Devices, Parameters, EDS)
  - Manufacturer and vendor distribution charts (Bar, Doughnut, Pie)
  - I/O type categorization and parameter distribution analysis
  - Time range selector for future analytics expansion

#### Frontend Improvements
- Modern theme context with React hooks
- Animated theme toggle with Sun/Moon icons
- Keyboard event handling with modifier key support
- Input field awareness to prevent shortcut conflicts
- Responsive chart layouts with dark theme optimization
- Framer Motion page transitions

### Added - EDS Support (Under Development)

⚠️ **Note**: EDS (Electronic Data Sheet) support is currently under active development and not yet production-ready. Use with caution.

#### Backend
- EDS file parser with multi-vendor support (Murrelektronik, Schneider Electric, Allen Bradley)
- Inline comment stripping for proper value extraction
- Database schema with 4 new tables (eds_files, eds_parameters, eds_connections, eds_capacity, eds_tspecs)
- Alembic migrations (004-007) for EDS schema
- 7 new API endpoints for EDS management:
  - `GET /api/eds` - List all EDS files
  - `GET /api/eds/{id}` - Get EDS details with parameters, connections, capacity
  - `POST /api/eds/upload` - Upload single EDS file
  - `POST /api/eds/upload-package` - Upload EDS package (ZIP)
  - `GET /api/eds/{id}/icon` - Get device icon
  - `GET /api/eds/{id}/export-json` - Export as JSON
  - `GET /api/eds/{id}/export-zip` - Export as ZIP with assets
- EDS package parser for ZIP archives
- Diagnostic tools (check_parsing_gaps.py, fix_capacity_gaps.py)

#### Frontend
- Modern tabbed EDS detail view (EDSDetailsView.jsx) with 5 tabs:
  - Overview: Device metadata and diagnostics
  - Parameters: Searchable table with 284+ parameters
  - Connections: Network connection configurations
  - Capacity: Visual gauges for network planning
  - Raw Content: Full EDS file viewer with copy-to-clipboard
- Real-time parameter search and filtering
- ZIP export with proper filename handling
- Toast notifications for export operations
- Dark theme styling

#### Data Quality
- 100% parameter extraction (284/284 for reference device)
- 100% capacity data (13/13 test files)
- 100% connection data
- 100% raw EDS content preservation

### Known Limitations
- Feature marked as "under development" - not production-ready
- Needs broader testing with diverse EDS files from multiple vendors
- No batch export functionality yet
- No syntax highlighting in raw content view
- No mobile optimization

## [2.0.1] - 2025-01-12

### Repository Audit and Documentation Update

This release focuses on repository structure, documentation completeness, accuracy, and legal clarity. Major improvements include Windows installation support, professional Mermaid diagrams, and comprehensive documentation cleanup.

### Added

#### Documentation
- Added `LICENSE.md` with MIT license and ME-Catalyst copyright (© 2025)
- Added complete `USER_MANUAL.md` (installation, quick start, configuration, usage, advanced features)
- Added detailed `DEVELOPER_REFERENCE.md` (architecture, API, frontend, database, IODD parsing, conventions, testing)
- Added comprehensive `TROUBLESHOOTING.md` (installation, runtime, import, web interface, performance, database, API, Docker issues)
- Added no-warranty disclaimer to README.md: "Provided 'as-is,' without warranty of any kind"
- Added `docs/user/getting-started/windows-installation.md` - 600+ line comprehensive Windows guide with setup.bat documentation
- Added `docs/INDEX.md` - Complete documentation navigation hub
- Added 13 professional Mermaid diagrams to `ARCHITECTURE.md` (system architecture, component diagrams, sequence diagrams, ERD, flowcharts)

#### Repository Structure
- Restructured `/docs` directory to recommended organization:
  - `/docs/architecture/` - Contains ARCHITECTURE.md with Mermaid diagrams
  - `/docs/user/` - Contains USER_MANUAL.md, CONFIGURATION.md, GUI_DOCUMENTATION.md, VISUAL_FEATURES.md, and user guides
  - `/docs/developer/` - Contains DEVELOPER_REFERENCE.md, API_SPECIFICATION.md, BEST_PRACTICES.md, CONFIG_PAGE_DEVELOPER_GUIDE.md, ENHANCED_MENUS_SUMMARY.md
  - `/docs/troubleshooting/` - Contains TROUBLESHOOTING.md
  - `/docs/project/` - Contains CLEANUP_SUMMARY.md

### Changed

#### README Cleanup
- Reduced README.md from 589 to 144 lines (75% reduction)
- Transformed into concise introduction and launching point
- Moved detailed content (usage, configuration, development, deployment) to /docs
- Removed all adapter generation references (not implemented)

#### Documentation Accuracy
- Removed all roadmap and future/planned statements across all documentation
- Removed all adapter generation and Node-RED references (not implemented)
- Fixed 7 broken documentation links (ARCHITECTURE_DIAGRAMS.md, configuration.md paths)
- Removed 4 broken GitHub Discussions links (feature not enabled)
- Updated GUI_DOCUMENTATION.md to reflect actual current features only

#### Architecture Documentation
- Complete rewrite of ARCHITECTURE.md with 13 Mermaid diagrams replacing ASCII art
- Removed "& Roadmap" from title and all future/planned content
- Added professional GitHub-native diagram rendering
- Updated with accurate endpoints, components, and workflows

#### Other Changes
- Updated README.md LICENSE link to point to LICENSE.md
- Renamed old LICENSE file to LICENSE.md with proper formatting
- Verified all code has proper docstrings (api.py, iodd_manager.py)

### Removed

- Removed all roadmap statements and future/planned content from documentation
- Removed all adapter generation references (not implemented)
- Removed all Node-RED adapter content from documentation
- Removed `ROADMAP.md` (focus on current release only)
- Removed `.claude/` directory (user-specific Claude Code settings)
- Removed `claude/` directory (temporary analysis files)
- Removed `nul` file (accidental creation)
- Removed `temp_iodd_large.xml` (temporary test file)
- Removed `temp_iodd_sample.xml` (temporary test file)
- Removed old `LICENSE` file (replaced with LICENSE.md)
- Removed broken GitHub Discussions links (4 locations)
- Removed duplicate and redundant documentation (eliminated 1,436 lines)

### Documentation

This release completes the production-ready documentation set:
- ✅ README.md - Concise project overview (144 lines)
- ✅ docs/INDEX.md - Complete documentation navigation hub
- ✅ ARCHITECTURE.md - System structure with 13 Mermaid diagrams
- ✅ USER_MANUAL.md - Installation and usage guide
- ✅ DEVELOPER_REFERENCE.md - Code and API reference
- ✅ TROUBLESHOOTING.md - Common issues and solutions
- ✅ windows-installation.md - 600+ line Windows setup guide
- ✅ CHANGELOG.md - Version history
- ✅ LICENSE.md - MIT License with ME-Catalyst copyright

### Repository Audit Checklist

- ✅ Required docs exist and are current
- ✅ `/docs` directory matches recommended structure
- ✅ Redundant and outdated files removed (eliminated 1,436 lines)
- ✅ LICENSE present and correct (MIT)
- ✅ CHANGELOG updated with version and summary
- ✅ Code fully documented and consistent
- ✅ Root directory clean and minimal (4 essential files only)
- ✅ All documentation links verified and working
- ✅ No roadmap or future/planned content
- ✅ Accurate reflection of current capabilities

---

## [2.0.0] - 2025-11-11

### Major Release - Complete Project Modernization

This release represents a complete overhaul of the IODD Manager with professional-grade infrastructure, testing, and deployment capabilities.

### Added

#### Infrastructure & Security
- Added `.gitignore` file with comprehensive patterns for Python, Node.js, and project-specific files
- Added MIT `LICENSE` file for legal clarity
- Added `.env.example` template with 50+ configuration options
- Added `config.py` module for centralized environment-based configuration
- Added `CONFIGURATION.md` with complete configuration guide
- Added file upload validation (size limits, type checking, content validation)
- Fixed CORS security issue by restricting to localhost origins
- Added SQL injection protection verification

#### Code Quality Tools
- Added `pyproject.toml` for Black, MyPy, Pytest, Coverage, Ruff, and Bandit
- Added `.pylintrc` for comprehensive Python linting rules
- Added `frontend/.eslintrc.cjs` for React/JSX linting
- Added `frontend/.prettierrc` for consistent code formatting
- Added `frontend/.prettierignore` for excluding build artifacts
- Added `.pre-commit-config.yaml` with automated quality checks
- Added `Makefile` with convenient dev commands (format, lint, test, etc.)
- Added `CONTRIBUTING.md` with comprehensive development guidelines

#### Testing Infrastructure
- Added comprehensive test suite with 65+ tests
- Added `tests/conftest.py` with 16 pytest fixtures
- Added `tests/test_parser.py` with 15 parser tests
- Added `tests/test_api.py` with 30+ API endpoint tests
- Added `tests/test_storage.py` with 20+ database tests
- Added `tests/fixtures/` directory with sample IODD files
- Added `tests/README.md` with testing documentation
- Added test markers for unit, integration, and slow tests

#### CI/CD Pipeline
- Added GitHub Actions workflow (`.github/workflows/ci.yml`)
- Added 7 automated jobs: Python quality, frontend quality, tests, build verification, security scanning, matrix testing, CI success
- Added coverage reporting with artifacts
- Added matrix testing for Python 3.10, 3.11, 3.12
- Added security scanning with Bandit, Safety, and pip-audit

#### Frontend Modernization
- Migrated from Vue.js to React 18 with Vite
- Added `frontend/vite.config.js` with optimized build configuration
- Added `frontend/src/main.jsx` as application entry point
- Moved `IODDDashboard.jsx` to `frontend/src/App.jsx`
- Added `frontend/src/index.css` with Tailwind configuration
- Added `frontend/src/components/ui.jsx` with comprehensive UI component library
- Added `frontend/README.md` with frontend documentation
- Added code splitting for optimized bundle sizes (react-vendor, 3d-vendor, ui-vendor, chart-vendor)
- Added path aliases (`@` → `./src`)
- Added API proxy configuration for development
- Archived old Vue.js implementation as `index.vue.html.bak`

#### Database Migrations
- Added Alembic for database schema versioning
- Added `alembic.ini` configuration
- Added `alembic/env.py` for migration environment
- Added `alembic/script.py.mako` for migration templates
- Added `alembic/versions/001_initial_schema.py` initial migration
- Added `alembic/README.md` with comprehensive migration guide
- Added performance indexes on key columns (vendor_id, device_id, target_platform)
- Added foreign key constraints to all tables

#### Configuration Management
- Added python-dotenv dependency for .env file support
- Added environment variable support for all settings
- Added configuration categories: Application, API Server, Frontend, Database, Storage, Security, Logging, Performance, Feature Flags
- Added production, development, Docker, and testing configuration examples
- Added configuration validation function (`config.print_config()`)
- Added safe logging that hides sensitive paths

#### Documentation
- Completely rewrote `README.md` with modern setup instructions
- Added comprehensive project overview and features
- Added Docker quick start section
- Added complete API examples
- Added project structure diagram
- Added troubleshooting section
- Added roadmap with version 2.1, 2.2, 3.0 plans
- Added support links and acknowledgments
- Added badges for CI/CD, license, Python, React, FastAPI

### Changed

#### API Updates
- Updated `api.py` to use `config` module for all settings
- Changed CORS from wildcard (`*`) to specific localhost origins
- Changed API documentation to be conditionally enabled via `config.ENABLE_DOCS`
- Changed Uvicorn settings to use config values (host, port, reload, workers, log level)
- Updated file upload endpoint with 10MB limit and chunked reading
- Enhanced error messages with specific HTTP status codes (400, 413)

#### Startup Script Updates
- Updated `start.py` to use `config` module
- Changed logging level to use `config.LOG_LEVEL`
- Changed port numbers to use `config.API_PORT` and `config.FRONTEND_PORT`
- Updated browser auto-open to respect `config.AUTO_OPEN_BROWSER`
- Made headless-server friendly (can disable browser opening)

#### Frontend Package Updates
- Removed Vue.js dependency from `package.json`
- Removed `serve:vue` script
- Added `lint` and `format` scripts
- Updated to use React 18.2
- Added Vite 4.5 as build tool

#### Requirements Updates
- Added `python-dotenv>=1.0.0` for environment configuration
- Alembic already present, now properly configured

### Removed

- Removed Vue.js frontend implementation (archived as `.bak` file)
- Removed hardcoded configuration values
- Removed wildcard CORS origins
- Removed unvalidated file upload handling

### Fixed

- Fixed security vulnerability with unrestricted CORS
- Fixed missing file size limits on uploads
- Fixed lack of input validation
- Fixed missing database migration system
- Fixed inconsistent code style
- Fixed missing test coverage
- Fixed lack of CI/CD automation
- Fixed missing documentation

### Security

- **CRITICAL**: Fixed CORS to restrict to localhost origins only
- **HIGH**: Added file upload size limits (10MB default)
- **HIGH**: Added file type and content validation
- **MEDIUM**: Added UTF-8 encoding validation for XML files
- **MEDIUM**: Added empty file detection
- **LOW**: Added malicious content detection (basic XML validation)
- Added automated security scanning with Bandit in CI/CD
- Added dependency vulnerability scanning with Safety and pip-audit
- Verified SQL injection protection with parameterized queries

### Performance

- Added database indexes on frequently queried columns
- Added code splitting in frontend build (reduces initial bundle size)
- Added Vite for faster HMR (Hot Module Replacement)
- Added source maps for better debugging
- Optimized frontend build with rollup configuration
- Added response compression option (configurable)

### Developer Experience

- Added pre-commit hooks for automatic code quality checks
- Added Makefile with convenient commands (make format, make test, etc.)
- Added comprehensive CONTRIBUTING.md guide
- Added detailed test documentation
- Added configuration validation tools
- Added multiple example configurations
- Added troubleshooting guides
- Made setup process straightforward (cp .env.example .env)

### Deployment

- Prepared for Docker containerization (Dockerfile coming in 2.0.1)
- Added production-ready configuration examples
- Added environment separation (development, production, testing)
- Added manual deployment guide
- Made application cloud-ready with environment variables

### Documentation

- Added 8 comprehensive documentation files:
  - `README.md` - Main project documentation
  - `CONFIGURATION.md` - Configuration guide
  - `CONTRIBUTING.md` - Development guidelines
  - `CHANGELOG.md` - This file
  - `alembic/README.md` - Migration guide
  - `frontend/README.md` - Frontend documentation
  - `tests/README.md` - Testing guide
  - `LICENSE` - MIT license

### Breaking Changes

⚠️ **Breaking Changes from 1.x to 2.0:**

1. **Frontend Migration**: Vue.js frontend replaced with React
   - Old Vue.js app archived as `index.vue.html.bak`
   - New React app requires `npm install` in frontend directory
   - Access point remains http://localhost:3000

2. **Configuration System**: Hardcoded values replaced with environment variables
   - Must create `.env` file (or use defaults)
   - See `.env.example` for all options
   - Old hardcoded ports/settings no longer used

3. **CORS Policy**: Wildcard CORS removed for security
   - Only localhost origins allowed by default
   - Update `CORS_ORIGINS` in `.env` for production deployments

4. **Database Migrations**: Schema management now with Alembic
   - Run `alembic upgrade head` for new installations
   - Existing databases should run `alembic stamp head` to mark as migrated

5. **File Upload Validation**: Stricter validation added
   - 10MB file size limit (configurable via `MAX_UPLOAD_SIZE`)
   - File type checking enforced
   - Empty files rejected

### Migration Guide from 1.x

```bash
# 1. Update code
git pull origin main

# 2. Install new dependencies
pip install -r requirements.txt
cd frontend && npm install && cd ..

# 3. Create configuration
cp .env.example .env
# Edit .env if needed

# 4. Stamp existing database (skip for new installations)
alembic stamp head

# 5. Start application
python start.py
```

### Known Issues

- MkDocs documentation site not yet deployed (coming in 2.0.1)
- Docker images not yet published (coming in 2.0.1)
- Some frontend components may show ESLint warnings (non-blocking)

### Upgrade Notes

- **Recommended**: Start fresh with new installation for cleanest upgrade
- **Database**: Existing databases compatible, just run `alembic stamp head`
- **Configuration**: Review all settings in `.env.example`
- **Frontend**: Rebuild frontend with `cd frontend && npm run build`
- **Testing**: Run `make test` to verify everything works

### Contributors

- Claude Code - Project modernization and infrastructure setup

---

## [1.0.0] - 2024-XX-XX

### Initial Release

- Basic IODD file import and parsing
- SQLite database storage
- Node-RED adapter generation
- REST API with FastAPI
- Vue.js web interface
- Command-line interface
- Basic documentation

---

## Format

### Types of Changes

- `Added` for new features
- `Changed` for changes in existing functionality
- `Deprecated` for soon-to-be removed features
- `Removed` for now removed features
- `Fixed` for any bug fixes
- `Security` for vulnerability fixes
- `Performance` for performance improvements

### Version Numbering

- **MAJOR** version for incompatible API changes
- **MINOR** version for new functionality in a backwards compatible manner
- **PATCH** version for backwards compatible bug fixes

Example: `2.0.0` = Major version 2, Minor version 0, Patch version 0

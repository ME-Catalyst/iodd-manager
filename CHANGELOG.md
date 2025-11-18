# Changelog

All notable changes to GreenStack will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [2.0.1] - 2025-11-18

### Added - Phase 1 & 2 Codebase Audit Improvements

#### Documentation
- Comprehensive `ARCHITECTURE.md` with 10 Mermaid diagrams covering system design, data flow, and deployment
- Detailed `API_DOCUMENTATION.md` with all 100+ API endpoints fully documented
- `PHASE_1_AUDIT_REPORT.md` - Complete codebase quality analysis
- `PHASE_2_DEAD_CODE_REMOVAL_SUMMARY.md` - Dead code elimination report
- `CODE_QUALITY_REPORT.md` and `CODE_QUALITY_ANALYSIS_DETAILED.md` - In-depth quality metrics

#### Code Quality Improvements
- Removed 15 unused Python imports across `src/routes/` modules
- Cleaned up 3 unused frontend components
- Eliminated redundant code in admin routes (121 lines removed)
- Improved import organization in all route files
- Added comprehensive audit reports for tracking improvements

#### Parser Quality Assurance (PQA) System
- Full-featured PQA console in Admin Console → Parser Diagnostics tab
- Quality metrics dashboard with completeness scoring
- Original vs reconstructed file diff analysis
- Historical metrics tracking with trend visualization
- Threshold configuration system for quality gates
- Support for both IODD and EDS file validation

#### Database Enhancements
- Migration `003_add_enumeration_values.py` - Cleaned up and optimized
- Migration `14aafab5b863_add_recommended_performance_indexes.py` - Added performance indexes
- PQA system tables (`024_add_pqa_system.py`):
  - `pqa_quality_metrics` - Quality score tracking
  - `pqa_diff_details` - File difference details
  - `pqa_archived_files` - Original file archives
  - `pqa_reconstructed_files` - Reconstructed file storage
  - `pqa_thresholds` - Configurable quality thresholds

### Changed

#### Configuration
- Updated CORS configuration for production readiness
  - Removed wildcard (`*`) origins
  - Explicitly defined allowed origins (localhost:3000, 5173, 5174, 127.0.0.1)
  - Configured allowed methods: GET, POST, DELETE, OPTIONS
  - Enabled credentials support for future authentication

- Enhanced rate limiting
  - Upload endpoint: 1000 requests/minute (high-performance server capability)
  - Added SlowAPI middleware for granular control

- Improved error handling
  - Centralized exception handlers in `api.py`
  - Added request ID tracking for debugging (X-Request-ID header)
  - Better error messages with detail context

#### API Improvements
- Health check endpoints enhanced:
  - `/api/health/live` - Kubernetes liveness probe
  - `/api/health/ready` - Readiness probe with disk space check
  - `/api/health` - Comprehensive health check

- Admin console statistics endpoints:
  - System overview with device counts
  - Database health metrics
  - Devices grouped by vendor
  - EDS and IODD diagnostic summaries

#### Frontend Enhancements
- Added PQA console to Admin interface with:
  - Interactive quality metrics dashboard
  - Real-time diff visualization
  - Historical trend charts (Chart.js + Nivo)
  - Threshold configuration UI
  - File reconstruction viewer

### Fixed
- Foreign key constraint handling in database operations
- Temporary file cleanup after IODD/EDS uploads
- Memory leaks in large file processing (proper file handle closure)
- SQL injection prevention through parameterized queries
- XSS vulnerabilities via React auto-escaping

### Security
- Implemented comprehensive CORS policy (no wildcard origins)
- Added rate limiting on file upload endpoints
- Enhanced input validation with Pydantic models
- File size limits enforced (10MB max for uploads)
- File type validation for uploads (.xml, .iodd, .zip, .eds, .xml)
- SQL parameterization throughout codebase
- Environment-based secret management

---

## [2.0.0] - 2025-01-15

### Added

#### Major Features
- Complete IO-Link (IODD) device management system
- EtherNet/IP (EDS) file support with full parsing
- Parser Quality Assurance (PQA) system foundation
- Ticket management system for issue tracking
- Advanced search functionality across all entities
- Configuration export (JSON, CSV formats)
- Theme management system with custom themes
- Service management interface for external services

#### IODD Support (35 API Endpoints)
- File upload with multi-format support (.xml, .iodd, .zip)
- Nested ZIP package extraction
- Full IODD 1.0/1.1 specification support
- Device parameter management
- Process data (input/output) configuration
- Error type definitions
- Event handling
- UI menu rendering metadata
- Device variants and conditions
- Button configurations for system commands
- Wiring and installation configurations
- Custom datatype definitions
- Multi-language text support
- Asset management (images, PDFs, documentation)

#### EDS Support (22 API Endpoints)
- EDS file parsing (INI format)
- Package upload and management
- Assembly definitions (fixed and variable)
- Connection configurations
- Module and port management
- Group-based parameter organization
- Diagnostic information
- Icon/image support
- Multi-file package handling

#### Database Schema (26 Migrations)
**Core Tables:**
- `devices` - IODD device catalog
- `parameters` - Device parameters with full metadata
- `process_data` - I/O configuration
- `process_data_record_items` - Structured I/O data
- `process_data_single_values` - I/O enumerations
- `parameter_single_values` - Parameter enumerations
- `error_types` - Device error definitions
- `events` - Device events
- `iodd_files` - Raw IODD XML storage
- `iodd_assets` - Extracted assets (images, etc.)
- `iodd_text` - Multi-language text support

**UI Tables:**
- `ui_menus` - Menu structure
- `ui_menu_items` - Menu item details
- `ui_menu_roles` - Role-based menu access
- `ui_menu_buttons` - System command buttons
- `process_data_ui_info` - UI rendering hints (gradient, offset, unit codes)

**EDS Tables:**
- `eds_files` - EDS file metadata
- `eds_packages` - Multi-file EDS packages
- `eds_package_metadata` - Package info
- `eds_parameters` - EDS parameters
- `eds_assemblies` - Fixed assemblies
- `eds_variable_assemblies` - Variable assemblies
- `eds_connections` - Connection definitions
- `eds_modules` - Modular device support
- `eds_ports` - Module ports
- `eds_groups` - Parameter grouping
- `eds_diagnostics` - Diagnostic data
- `eds_tspecs` - Transport specifications
- `eds_capacity` - Device capacity info

**Advanced Features:**
- `device_variants` - Product variants with images
- `device_features` - Feature flags
- `communication_profile` - IO-Link communication settings
- `document_info` - Device documentation metadata
- `wire_configurations` - Installation wiring
- `device_test_config` - Test configurations
- `device_test_event_triggers` - Test event handling
- `custom_datatypes` - Custom data type definitions
- `custom_datatype_single_values` - Custom type enumerations
- `custom_datatype_record_items` - Custom type record structures

**System Tables:**
- `tickets` - Issue tracking
- `ticket_comments` - Ticket discussions
- `ticket_attachments` - File attachments
- `generated_adapters` - Generated code storage
- `theme_presets` - UI themes
- `pqa_quality_metrics` - Parser quality scores
- `pqa_diff_details` - File difference tracking
- `pqa_archived_files` - Original files
- `pqa_reconstructed_files` - Reconstructed outputs
- `pqa_thresholds` - Quality thresholds

#### Frontend Features
**Modern React UI (59 Components):**
- Responsive dashboard with device statistics
- Interactive device explorer with TanStack Table
- Advanced filtering and sorting
- Parameter configuration interface
- Process data visualization
- EDS file management interface
- Ticket system with attachments
- Admin console with diagnostics
- PQA quality dashboard
- Service management UI
- MQTT console with WebSocket
- Theme customization with color picker
- Dark/light mode with system preference detection
- Keyboard shortcuts (h/d/s/c/a navigation, Ctrl+U upload, etc.)
- 28-page in-app documentation system

**Data Visualization:**
- Chart.js integration for analytics
- Nivo charts for advanced visualizations
- Manufacturer distribution pie charts
- Parameter distribution histograms
- I/O configuration analysis
- Quality metrics trend lines
- Heatmaps for diagnostics

**UI Libraries:**
- Radix UI for accessible components
- Tailwind CSS for styling
- Framer Motion for animations
- Three.js for 3D graphics (device models)
- React Syntax Highlighter for code display

#### Backend Features
**FastAPI Application (2282 lines):**
- 100+ RESTful API endpoints
- OpenAPI/Swagger documentation at `/docs`
- ReDoc alternative documentation at `/redoc`
- Pydantic models for request/response validation
- SQLAlchemy 2.0 ORM with async support
- Alembic database migrations
- CORS middleware with configurable origins
- Rate limiting with SlowAPI
- Request ID tracking for debugging
- Comprehensive error handling
- Background task processing
- File upload with streaming (10MB limit)
- Temporary file cleanup

**Parsers:**
- `eds_parser.py` - EDS file parsing (INI format)
- `eds_package_parser.py` - Multi-file EDS packages
- `eds_diagnostics.py` - EDS validation
- IODD XML parsing with lxml
- XML schema validation
- Asset extraction from ZIP packages
- Encoding detection and handling

**Utilities:**
- `pqa_orchestrator.py` - Quality analysis coordination
- `pqa_diff_analyzer.py` - File comparison engine
- `parsing_quality.py` - Quality metric calculation
- `forensic_reconstruction_v2.py` - IODD reconstruction
- `eds_reconstruction.py` - EDS reconstruction
- `eds_diff_analyzer.py` - EDS-specific diff analysis

#### External Services Integration
**IoT Stack (docker-compose.iot.yml):**
- Eclipse Mosquitto MQTT broker
- InfluxDB for time-series data
- Grafana for dashboards
- Node-RED for workflow automation

**Service Management:**
- Health check monitoring
- Port conflict detection
- Process status tracking
- Configuration management
- Start/stop/restart controls

#### Development Tools
**Testing:**
- pytest test framework (953 lines of tests)
- 6 test modules covering:
  - API endpoints (`test_api.py`)
  - Parser functionality (`test_parser.py`)
  - Storage layer (`test_storage.py`)
  - Fixtures for common test data
- pytest-cov for coverage reporting
- pytest-asyncio for async test support
- httpx TestClient for API testing

**Code Quality:**
- Black code formatter
- Ruff linter (faster alternative to Flake8)
- Pylint for detailed analysis
- MyPy for type checking
- ESLint for frontend code
- Pre-commit hooks configured

**Documentation:**
- MkDocs with Material theme
- 28 in-app documentation pages
- API documentation (OpenAPI 3.0)
- Component documentation
- Developer guides
- Architecture diagrams (Mermaid)

#### Configuration Management
**Environment Variables:**
- `ENVIRONMENT` - development/staging/production
- `APP_VERSION` - Semantic versioning
- `API_HOST` / `API_PORT` - Server binding
- `DATABASE_URL` - Database connection string
- `CORS_ORIGINS` - Allowed origins (comma-separated)
- `CORS_METHODS` - Allowed HTTP methods
- `ENABLE_AUTH` - Authentication toggle
- `SECRET_KEY` - JWT signing key
- `LOG_LEVEL` - Logging verbosity
- `MAX_UPLOAD_SIZE` - File upload limit
- And 30+ more configuration options

#### Deployment
**Docker Support:**
- Multi-stage Dockerfile for optimized images
- docker-compose.yml for development
- docker-compose.iot.yml for IoT services
- Volume mounts for persistence
- Health check definitions
- Environment variable configuration

**Production Features:**
- Uvicorn ASGI server with multiple workers
- PostgreSQL support (SQLite for development)
- Redis integration (optional)
- Celery task queue (optional)
- Nginx reverse proxy configuration
- Kubernetes health probes (liveness/readiness)

### Changed
- Migrated from Python 3.9 to 3.10+ (type hints improvements)
- Upgraded FastAPI to 0.100+ (Pydantic 2.0 support)
- Updated SQLAlchemy to 2.0+ (async support)
- React 18 with concurrent rendering
- Vite 7.2 build tool (faster than Webpack)
- Tailwind CSS 3.3 with JIT mode

### Deprecated
- Legacy IODD parser (replaced with modular parser system)
- Old theme system (replaced with theme_routes.py)
- Direct database access (now through Storage Manager)

### Removed
- Unused dependencies (cleaned up requirements.txt)
- Legacy API endpoints (v1.x routes)
- Old migration files (consolidated into Alembic)

### Security
- CORS configuration (no wildcard origins)
- Rate limiting on all upload endpoints
- Input validation with Pydantic
- SQL injection prevention (parameterized queries)
- XSS protection (React auto-escaping)
- File upload type validation
- Size limits on uploads (10MB default)
- Environment-based secret management
- Optional JWT authentication framework

---

## [1.0.0] - 2024-06-15

### Added
- Initial release of GreenStack
- Basic IODD file import and parsing
- Device catalog management
- SQLite database storage
- Simple web interface
- REST API with basic endpoints
- Node-RED adapter generation

---

## Version History Summary

| Version | Release Date | Major Features | Lines of Code |
|---------|--------------|----------------|---------------|
| 2.0.1 | 2025-11-18 | PQA system, audit improvements, documentation | ~12,000 |
| 2.0.0 | 2025-01-15 | Full production release, EDS support, 26 migrations | ~10,000 |
| 1.0.0 | 2024-06-15 | Initial release, IODD import, basic API | ~3,000 |

---

## Migration Guide

### Upgrading from 1.0.0 to 2.0.0

**Database Migration:**
```bash
# Backup your database first!
cp greenstack.db greenstack.db.backup

# Run migrations
alembic upgrade head
```

**Configuration Changes:**
```bash
# Update .env file with new variables
cp .env.example .env
# Edit .env and set:
# - CORS_ORIGINS (remove wildcards)
# - SECRET_KEY (generate new key for production)
# - ENABLE_AUTH (set to 'true' for production)
```

**Frontend Updates:**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Upgrading from 2.0.0 to 2.0.1

**Database Migration:**
```bash
# Run new PQA system migration
alembic upgrade head
```

**No breaking changes** - Fully backward compatible with 2.0.0

---

## Roadmap

### v2.1.0 (Q1 2025)
- [ ] Complete authentication/authorization (JWT + RBAC)
- [ ] Prometheus metrics endpoint
- [ ] Structured JSON logging
- [ ] Redis caching layer
- [ ] WebSocket for real-time device updates
- [ ] Advanced search with Elasticsearch
- [ ] GraphQL API (alternative to REST)

### v2.5.0 (Q2 2025)
- [ ] Microservices architecture (parser as separate service)
- [ ] Multi-tenancy support
- [ ] Background job processing with Celery
- [ ] Device firmware management
- [ ] OPC UA server adapter generation
- [ ] MQTT device connectivity (live data)
- [ ] Automated testing (E2E with Playwright)

### v3.0.0 (Q3 2025)
- [ ] Kubernetes-native deployment (Helm charts)
- [ ] AI-powered device configuration recommendations
- [ ] Real-time IoT data ingestion and visualization
- [ ] Blockchain for device provenance tracking
- [ ] Event-driven architecture (Kafka/RabbitMQ)
- [ ] gRPC for service-to-service communication
- [ ] Plugin system for custom device protocols

---

## Contributing

See [CONTRIBUTING.md](docs/CONTRIBUTING.md) for development workflow, code standards, and pull request process.

---

## License

This project is licensed under the MIT License - see [LICENSE.md](LICENSE.md) for details.

---

**Copyright © ME-Catalyst 2025**

**Maintainers:**
- Primary: GreenStack Development Team
- Documentation: AI-Assisted Audit System

**Last Updated:** 2025-11-18

# Changelog

All notable changes to IODD Manager are documented in the project changelog.

## View Full Changelog

See **[CHANGELOG.md](../../CHANGELOG.md)** in the repository root for the complete changelog.

## Latest Release: v2.0.0 (2025-11-11)

### Major Release - Complete Project Modernization

This release represents a complete overhaul of the IODD Manager with professional-grade infrastructure, testing, and deployment capabilities.

### Highlights

**Infrastructure & Security:**
- Added comprehensive `.gitignore`, MIT `LICENSE`, `.env.example` with 50+ configuration options
- Added centralized `config.py` for environment-based configuration
- Fixed CORS security issue by restricting to localhost origins
- Added file upload validation (size limits, type checking, content validation)

**Code Quality Tools:**
- Added Black, MyPy, Pytest, Coverage, Ruff, and Bandit configuration
- Added ESLint and Prettier for frontend
- Added pre-commit hooks with automated quality checks
- Added `Makefile` with convenient dev commands

**Testing Infrastructure:**
- Added comprehensive test suite with 65+ tests
- Added pytest fixtures and test markers
- Added test coverage reporting

**CI/CD Pipeline:**
- Added GitHub Actions workflow with 7 automated jobs
- Added security scanning with Bandit, Safety, and pip-audit
- Added matrix testing for Python 3.10, 3.11, 3.12

**Frontend Modernization:**
- Migrated from Vue.js to React 18 with Vite
- Added code splitting for optimized bundle sizes
- Added comprehensive UI component library

**Database Migrations:**
- Added Alembic for database schema versioning
- Added initial migration with indexes and foreign keys
- Added migration documentation and guide

**Documentation:**
- Completely rewrote README.md with modern setup instructions
- Added comprehensive documentation site with MkDocs
- Added CHANGELOG, CONTRIBUTING, CONFIGURATION guides

**Docker Support:**
- Added multi-stage Dockerfile for production deployment
- Added docker-compose.yml for orchestration
- Added .dockerignore for optimized builds

### Breaking Changes

⚠️ **Breaking Changes from 1.x to 2.0:**

1. **Frontend Migration**: Vue.js frontend replaced with React
2. **Configuration System**: Hardcoded values replaced with environment variables
3. **CORS Policy**: Wildcard CORS removed for security
4. **Database Migrations**: Schema management now with Alembic
5. **File Upload Validation**: Stricter validation added

See the [full CHANGELOG](../../CHANGELOG.md) for complete details and migration guide.

## Version History

- **v2.0.0** (2025-11-11) - Complete project modernization
- **v1.0.0** (2024-XX-XX) - Initial release

## Release Schedule

- **Patch releases** (2.0.x): Bug fixes, released as needed
- **Minor releases** (2.x.0): New features, quarterly
- **Major releases** (x.0.0): Breaking changes, annually

## Staying Updated

### Watch Releases

Watch the [GitHub repository](https://github.com/ME-Catalyst/iodd-manager) for new releases:

1. Click "Watch" → "Custom" → "Releases"
2. Get notified of new versions

### Upgrade Guide

See [Installation Guide](../getting-started/installation.md) for upgrade instructions.

## Roadmap

See [README - Roadmap](../../README.md#roadmap) for upcoming features:

- **v2.1.0**: PostgreSQL support, multi-user authentication, API versioning
- **v2.2.0**: Batch operations, enhanced search, workflow automation
- **v3.0.0**: Multi-language support, plugin system, cloud sync

## Contributing

Found a bug or have a feature request?

- **Report bugs**: [GitHub Issues](https://github.com/ME-Catalyst/iodd-manager/issues)
- **Request features**: [GitHub Discussions](https://github.com/ME-Catalyst/iodd-manager/discussions)
- **Contribute code**: See [Contributing Guide](contributing.md)

## Next Steps

- **[Full CHANGELOG](../../CHANGELOG.md)** - Complete version history
- **[License](license.md)** - Project license
- **[Contributing](contributing.md)** - How to contribute
- **[Support](support.md)** - Get help

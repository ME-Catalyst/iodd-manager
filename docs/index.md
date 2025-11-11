# IODD Manager Documentation

Welcome to the IODD Manager documentation! This comprehensive guide will help you get started with managing IO-Link Device Description (IODD) files and generating platform-specific adapters.

## What is IODD Manager?

IODD Manager is a modern, full-stack industrial automation tool designed to simplify the management of IO-Link Device Description files. It provides a powerful REST API backend with a beautiful React frontend for device management and automated adapter generation.

## Key Features

<div class="grid cards" markdown>

-   :material-folder-upload:{ .lg .middle } __IODD File Management__

    ---

    Import, parse, and store IODD XML files and packages with intelligent metadata extraction

    [:octicons-arrow-right-24: Learn more](user-guide/web-interface.md)

-   :material-code-braces:{ .lg .middle } __Adapter Generation__

    ---

    Automatically generate platform-specific code for Node-RED, Python, MQTT, and more

    [:octicons-arrow-right-24: Explore adapters](user-guide/adapters.md)

-   :material-api:{ .lg .middle } __REST API__

    ---

    Full-featured FastAPI backend with OpenAPI documentation and comprehensive endpoints

    [:octicons-arrow-right-24: API Reference](api/overview.md)

-   :material-react:{ .lg .middle } __Modern Web UI__

    ---

    React-based dashboard with 3D visualizations, analytics, and intuitive device management

    [:octicons-arrow-right-24: Web Interface](user-guide/web-interface.md)

-   :material-database:{ .lg .middle } __Database Migrations__

    ---

    Alembic-powered schema versioning for safe database evolution

    [:octicons-arrow-right-24: Database Guide](database/migrations.md)

-   :material-cog:{ .lg .middle } __Configuration__

    ---

    Environment-based configuration with .env support for flexible deployments

    [:octicons-arrow-right-24: Configuration](getting-started/configuration.md)

-   :material-test-tube:{ .lg .middle } __Comprehensive Testing__

    ---

    65+ tests covering API, parsing, and storage with pytest

    [:octicons-arrow-right-24: Testing Guide](developer-guide/testing.md)

-   :material-docker:{ .lg .middle } __Docker Ready__

    ---

    Containerized deployment with docker-compose for easy production deployment

    [:octicons-arrow-right-24: Docker Guide](getting-started/docker.md)

</div>

## Quick Links

- **[Installation Guide](getting-started/installation.md)** - Get IODD Manager running
- **[Quick Start](getting-started/quick-start.md)** - 5-minute tutorial
- **[API Documentation](api/overview.md)** - REST API reference
- **[Developer Guide](developer-guide/setup.md)** - Contributing to IODD Manager
- **[Changelog](about/changelog.md)** - Version history

## Technology Stack

### Backend
- **Python 3.10+** - Core language
- **FastAPI** - Modern async web framework
- **SQLAlchemy** - SQL toolkit and ORM
- **Alembic** - Database migration tool
- **Pydantic** - Data validation using type hints

### Frontend
- **React 18** - UI library
- **Vite** - Next generation frontend tooling
- **Tailwind CSS** - Utility-first CSS framework
- **Three.js** - 3D visualizations
- **Nivo** - Data visualization library

### Development
- **pytest** - Testing framework
- **Black** - Code formatter
- **Ruff** - Fast Python linter
- **MyPy** - Static type checker
- **GitHub Actions** - CI/CD pipeline

## Getting Help

- :fontawesome-brands-github: **GitHub Issues**: [Report bugs](https://github.com/ME-Catalyst/iodd-manager/issues)
- :material-forum: **Discussions**: [Ask questions](https://github.com/ME-Catalyst/iodd-manager/discussions)
- :material-email: **Email**: support@example.com

## License

IODD Manager is open source software licensed under the [MIT License](about/license.md).

## Next Steps

<div class="grid cards" markdown>

-   **New Users**

    Start with the [Installation Guide](getting-started/installation.md) to set up IODD Manager

-   **Developers**

    Check out the [Developer Guide](developer-guide/setup.md) to contribute

-   **Deploying**

    See the [Production Setup](deployment/production.md) for deployment instructions

-   **API Users**

    Explore the [API Reference](api/overview.md) for integration

</div>

# Greenstack Documentation Overhaul - Master Plan

**Version:** 1.0
**Date:** 2025-01-16
**Scope:** Complete end-to-end documentation system transformation

---

## Executive Summary

This plan details a comprehensive transformation of Greenstack's documentation from static markdown files to an interactive, React-based documentation platform integrated directly into the application. The system will provide stunning visuals, interactive code examples, comprehensive API references, and intelligent search - all while maintaining the brand identity with the iconic green (#3DB60F).

**Key Objectives:**
1. ✅ Convert 45+ markdown documents to interactive React components
2. ✅ Extract and document all 61 Python backend files
3. ✅ Document all 35 frontend components with live examples
4. ✅ Build integrated documentation viewer with search
5. ✅ Add interactive code playgrounds and visual diagrams
6. ✅ Maintain only README.md as markdown

---

## Phase 1: Codebase Analysis & Inventory

### 1.1 Backend Code Analysis (61 Python Files)

**Core API Files (9 files)**
- [ ] `api.py` - Main FastAPI application, routes registration, CORS, startup/shutdown
- [ ] `admin_routes.py` - Admin console endpoints
- [ ] `config_export_routes.py` - Configuration export functionality
- [ ] `eds_routes.py` - EDS file management endpoints
- [ ] `mqtt_routes.py` - MQTT broker management
- [ ] `search_routes.py` - Search functionality
- [ ] `service_routes.py` - Service management (Grafana, InfluxDB, Node-RED, Mosquitto)
- [ ] `theme_routes.py` - Theme management API
- [ ] `ticket_routes.py` - Ticket system endpoints

**Parsers & Processing (4 files)**
- [ ] `eds_parser.py` - EDS XML parsing, assemblies, modules, parameters
- [ ] `eds_package_parser.py` - ZIP package handling, nested archives
- [ ] `eds_diagnostics.py` - EDS parsing quality diagnostics
- [ ] `parsing_quality.py` - Parsing quality metrics and reporting

**Configuration & Core (2 files)**
- [ ] `config.py` - Application configuration, environment variables
- [ ] `greenstack.py` - Core application logic

**Services (3 files)**
- [ ] `services/device-shadow/shadow_service.py` - Device shadow service
- [ ] `services/influx-ingestion/ingest.py` - InfluxDB data ingestion
- [ ] `services/mqtt-bridge/bridge.py` - MQTT bridge service

**Database Migrations (14 files)**
- [ ] `alembic/env.py` - Alembic configuration
- [ ] `alembic/versions/001_initial_schema.py` - Initial database schema
- [ ] `alembic/versions/002_add_iodd_assets_table.py` - IODD assets
- [ ] `alembic/versions/003_add_enumeration_values.py` - Enum support
- [ ] `alembic/versions/004_add_eds_tables.py` - EDS tables
- [ ] `alembic/versions/005_expand_eds_schema.py` - EDS schema expansion
- [ ] `alembic/versions/006_add_eds_package_support.py` - Package support
- [ ] `alembic/versions/007_add_eds_diagnostics.py` - Diagnostics tables
- [ ] `alembic/versions/008_add_enum_values.py` - Enhanced enums
- [ ] `alembic/versions/009_add_eds_assemblies.py` - Assembly support
- [ ] `alembic/versions/010_add_eds_modules.py` - Module support
- [ ] `alembic/versions/011_add_eds_groups.py` - Group support
- [ ] `alembic/versions/012_expand_parameter_schema.py` - Parameter expansion
- [ ] `alembic/versions/013_create_ticket_system.py` - Ticket system
- [ ] `alembic/versions/014_add_performance_indexes.py` - Performance indexes

**Testing (4 files)**
- [ ] `tests/test_api.py` - API endpoint tests
- [ ] `tests/test_parser.py` - Parser functionality tests
- [ ] `tests/test_storage.py` - Database storage tests
- [ ] `tests/conftest.py` - Test fixtures and configuration

**Utilities (2 files)**
- [ ] `start.py` - Application startup script
- [ ] `scripts/audit-colors.js` - Theme color audit tool

**Documentation Actions:**
- Extract docstrings from all functions and classes
- Document API endpoints with request/response examples
- Create sequence diagrams for data flows
- Document database schema evolution
- Add code examples for each module

### 1.2 Frontend Component Analysis (35 Files)

**Core Application (2 files)**
- [ ] `frontend/src/App.jsx` - Main application component, routing, layout
- [ ] `frontend/src/main.jsx` - React entry point, providers

**Contexts (1 file)**
- [ ] `frontend/src/contexts/ThemeContext.jsx` - Theme state management, persistence

**UI Components (24 files)**
- [ ] `frontend/src/components/ui.jsx` - Base UI components (Button, Card, Dialog, etc.)
- [ ] `frontend/src/components/AdminConsole.jsx` - Admin console with tabs
- [ ] `frontend/src/components/AnalyticsDashboard.jsx` - Analytics and charts
- [ ] `frontend/src/components/AssembliesSection.jsx` - EDS assembly display
- [ ] `frontend/src/components/ColorPicker.jsx` - Theme color picker with WCAG
- [ ] `frontend/src/components/ComparisonView.jsx` - Device comparison interface
- [ ] `frontend/src/components/EDSDetailsView.jsx` - EDS device details
- [ ] `frontend/src/components/GrafanaManager.jsx` - Grafana service management
- [ ] `frontend/src/components/InfluxManager.jsx` - InfluxDB service management
- [ ] `frontend/src/components/KeyboardShortcutsHelp.jsx` - Keyboard shortcuts modal
- [ ] `frontend/src/components/ModulesSection.jsx` - EDS modules display
- [ ] `frontend/src/components/MqttManager.jsx` - MQTT broker management
- [ ] `frontend/src/components/NodeRedManager.jsx` - Node-RED service management
- [ ] `frontend/src/components/ParameterCard.jsx` - Parameter display card
- [ ] `frontend/src/components/PortsSection.jsx` - EDS ports display
- [ ] `frontend/src/components/SearchPage.jsx` - Search interface
- [ ] `frontend/src/components/ServicesAdmin.jsx` - Services administration
- [ ] `frontend/src/components/ThemeEditor.jsx` - Theme customization editor
- [ ] `frontend/src/components/ThemeManager.jsx` - Theme management interface
- [ ] `frontend/src/components/ThemeToggle.jsx` - Dark/light toggle
- [ ] `frontend/src/components/TicketAttachments.jsx` - Ticket file attachments
- [ ] `frontend/src/components/TicketButton.jsx` - Ticket creation button
- [ ] `frontend/src/components/TicketModal.jsx` - Ticket creation/edit modal
- [ ] `frontend/src/components/TicketsPage.jsx` - Ticket list and management

**Configuration (2 files)**
- [ ] `frontend/src/config/themes.js` - Theme definitions, validation, CSS variables
- [ ] `frontend/tailwind.config.js` - Tailwind CSS configuration

**Documentation Actions:**
- Create live component playground for each component
- Document all props with TypeScript-style interfaces
- Add usage examples with code snippets
- Create visual component gallery
- Document keyboard shortcuts and interactions

### 1.3 Existing Documentation Inventory (45+ Files)

**Root Level (6 files)**
- [ ] `README.md` - **KEEP AS MARKDOWN** - Main project overview
- [ ] `CHANGELOG.md` - Version history
- [ ] `CONTRIBUTING.md` - Contribution guidelines
- [ ] `LICENSE.md` - MIT license
- [ ] `COLOR_MIGRATION_SUMMARY.md` - Theme migration notes
- [ ] `THEME_QUICKSTART.md` - Quick theme guide

**Architecture (2 files)**
- [ ] `docs/architecture/ARCHITECTURE.md` - System architecture
- [ ] `docs/architecture/FRONTEND_ARCHITECTURE.md` - Frontend architecture

**User Documentation (18 files)**
- [ ] `docs/user/USER_MANUAL.md` - Complete user manual
- [ ] `docs/user/USER_FEATURES.md` - Feature list
- [ ] `docs/user/VISUAL_FEATURES.md` - Visual features
- [ ] `docs/user/GUI_DOCUMENTATION.md` - GUI documentation
- [ ] `docs/user/CONFIGURATION.md` - Configuration reference
- [ ] `docs/user/NESTED_ZIP_IMPORT.md` - ZIP import guide
- [ ] `docs/user/getting-started/quick-start.md` - Quick start
- [ ] `docs/user/getting-started/installation.md` - Installation
- [ ] `docs/user/getting-started/windows-installation.md` - Windows setup
- [ ] `docs/user/getting-started/docker.md` - Docker setup
- [ ] `docs/user/user-guide/web-interface.md` - Web interface guide
- [ ] `docs/user/user-guide/api.md` - API usage
- [ ] `docs/user/user-guide/cli.md` - CLI usage
- [ ] `docs/user/user-guide/adapters.md` - Adapter guide

**Developer Documentation (12 files)**
- [ ] `docs/developer/DEVELOPER_REFERENCE.md` - Developer reference
- [ ] `docs/developer/API_SPECIFICATION.md` - API spec
- [ ] `docs/developer/API_ENDPOINTS.md` - Endpoint reference
- [ ] `docs/developer/BEST_PRACTICES.md` - Best practices
- [ ] `docs/developer/CONFIG_PAGE_DEVELOPER_GUIDE.md` - Config page dev guide
- [ ] `docs/developer/ENHANCED_MENUS_SUMMARY.md` - Menu system
- [ ] `docs/developer/api/overview.md` - API overview
- [ ] `docs/developer/api/endpoints.md` - Endpoint details
- [ ] `docs/developer/api/authentication.md` - Auth guide
- [ ] `docs/developer/api/errors.md` - Error handling
- [ ] `docs/developer/database/schema.md` - Database schema
- [ ] `docs/developer/database/migrations.md` - Migration guide
- [ ] `docs/developer/developer-guide/setup.md` - Dev setup
- [ ] `docs/developer/developer-guide/architecture.md` - Architecture guide
- [ ] `docs/developer/developer-guide/testing.md` - Testing guide
- [ ] `docs/developer/developer-guide/contributing.md` - Contributing
- [ ] `docs/developer/developer-guide/code-quality.md` - Code quality

**Deployment (4 files)**
- [ ] `docs/deployment/production.md` - Production deployment
- [ ] `docs/deployment/docker.md` - Docker deployment
- [ ] `docs/deployment/monitoring.md` - Monitoring setup
- [ ] `docs/deployment/environment.md` - Environment config

**Miscellaneous (7 files)**
- [ ] `docs/INDEX.md` - Documentation index
- [ ] `docs/THEME_SYSTEM.md` - Theme system docs
- [ ] `docs/THEMING_OVERHAUL_PLAN.md` - Theme overhaul plan
- [ ] `docs/IOT_PLATFORM_DEPLOYMENT.md` - IoT platform deployment
- [ ] `docs/QUICK_START_P1_ENHANCEMENTS.md` - Quick start enhancements
- [ ] `docs/troubleshooting/TROUBLESHOOTING.md` - Troubleshooting guide
- [ ] `docs/project/CLEANUP_SUMMARY.md` - Cleanup summary

---

## Phase 2: React Documentation System Architecture

### 2.1 Component Structure

```
frontend/src/
├── components/
│   ├── docs/
│   │   ├── DocsViewer.jsx           # Main documentation viewer
│   │   ├── DocsNavigation.jsx       # Sidebar navigation tree
│   │   ├── DocsSearch.jsx           # Full-text search with highlighting
│   │   ├── DocsContent.jsx          # Content renderer
│   │   ├── DocsCodeBlock.jsx        # Syntax-highlighted code blocks
│   │   ├── DocsPlayground.jsx       # Interactive code playground
│   │   ├── DocsApiReference.jsx     # API endpoint documentation
│   │   ├── DocsComponentGallery.jsx # Component showcase
│   │   ├── DocsDiagram.jsx          # Interactive diagrams
│   │   ├── DocsTableOfContents.jsx  # Auto-generated TOC
│   │   ├── DocsBreadcrumb.jsx       # Breadcrumb navigation
│   │   ├── DocsVersionSelector.jsx  # Version selection
│   │   └── DocsFeedback.jsx         # Feedback widget
│   └── ...
├── content/
│   ├── docs/
│   │   ├── getting-started/
│   │   │   ├── QuickStart.jsx
│   │   │   ├── Installation.jsx
│   │   │   ├── WindowsInstallation.jsx
│   │   │   └── DockerSetup.jsx
│   │   ├── user-guide/
│   │   │   ├── WebInterface.jsx
│   │   │   ├── ApiUsage.jsx
│   │   │   ├── Configuration.jsx
│   │   │   └── Features.jsx
│   │   ├── developer/
│   │   │   ├── Architecture.jsx
│   │   │   ├── ApiReference.jsx
│   │   │   ├── DatabaseSchema.jsx
│   │   │   ├── ComponentDevelopment.jsx
│   │   │   └── Testing.jsx
│   │   ├── api/
│   │   │   ├── Overview.jsx
│   │   │   ├── Endpoints.jsx
│   │   │   ├── Authentication.jsx
│   │   │   └── ErrorHandling.jsx
│   │   ├── components/
│   │   │   ├── ComponentGallery.jsx
│   │   │   ├── ThemeSystem.jsx
│   │   │   ├── UiComponents.jsx
│   │   │   └── Examples.jsx
│   │   ├── deployment/
│   │   │   ├── Production.jsx
│   │   │   ├── Docker.jsx
│   │   │   ├── Monitoring.jsx
│   │   │   └── Environment.jsx
│   │   └── troubleshooting/
│   │       ├── CommonIssues.jsx
│   │       ├── Debugging.jsx
│   │       └── FAQ.jsx
│   └── index.js                     # Content registry
└── utils/
    ├── docsSearch.js                # Search indexing and query
    └── syntaxHighlighter.js         # Code highlighting
```

### 2.2 Documentation Data Structure

Each documentation page will be a React component that exports metadata and content:

```jsx
// Example: frontend/src/content/docs/getting-started/QuickStart.jsx

export const metadata = {
  id: 'quick-start',
  title: 'Quick Start Guide',
  description: 'Get up and running with Greenstack in 5 minutes',
  category: 'getting-started',
  order: 1,
  keywords: ['quickstart', 'setup', 'installation', 'begin'],
  lastUpdated: '2025-01-16',
  author: 'Greenstack Team'
};

export default function QuickStart() {
  return (
    <DocsPage>
      <DocsHero
        title="Quick Start Guide"
        description="Get up and running with Greenstack in 5 minutes"
        icon={<Rocket className="w-12 h-12 text-brand-green" />}
      />

      <DocsSection title="Prerequisites">
        <DocsList>
          <li>Python 3.10 or higher</li>
          <li>Node.js 18 or higher (for development)</li>
          <li>Docker (optional, for containerized deployment)</li>
        </DocsList>
      </DocsSection>

      <DocsSection title="Installation">
        <DocsTabs>
          <DocsTab label="PyPI" icon={<Package />}>
            <DocsCodeBlock language="bash" copy>
              {`pip install greenstack
greenstack-api`}
            </DocsCodeBlock>
          </DocsTab>

          <DocsTab label="Docker" icon={<Container />}>
            <DocsCodeBlock language="bash" copy>
              {`docker pull ghcr.io/me-catalyst/greenstack:latest
docker run -d -p 8000:8000 ghcr.io/me-catalyst/greenstack:latest`}
            </DocsCodeBlock>
          </DocsTab>

          <DocsTab label="Source" icon={<Code />}>
            <DocsCodeBlock language="bash" copy>
              {`git clone https://github.com/ME-Catalyst/greenstack.git
cd greenstack
./setup.sh`}
            </DocsCodeBlock>
          </DocsTab>
        </DocsTabs>
      </DocsSection>

      <DocsSection title="First Steps">
        <DocsSteps>
          <DocsStep number={1} title="Access the Web Interface">
            Open your browser to{' '}
            <DocsLink href="http://localhost:5173">http://localhost:5173</DocsLink>
          </DocsStep>

          <DocsStep number={2} title="Import Your First Device">
            <p>Navigate to the Admin Console and upload an EDS or IODD file.</p>
            <DocsImage
              src="/docs/assets/import-device.png"
              alt="Import device screenshot"
              caption="Device import interface"
            />
          </DocsStep>

          <DocsStep number={3} title="Explore Features">
            <p>Check out the device catalog, search, and analytics dashboard.</p>
          </DocsStep>
        </DocsSteps>
      </DocsSection>

      <DocsCallout type="success" icon={<CheckCircle />}>
        You're all set! Continue to the{' '}
        <DocsInternalLink to="/docs/user-guide/web-interface">
          Web Interface Guide
        </DocsInternalLink>{' '}
        to learn more.
      </DocsCallout>

      <DocsRelatedLinks>
        <DocsRelatedLink to="/docs/user-guide/configuration">
          Configuration Reference
        </DocsRelatedLink>
        <DocsRelatedLink to="/docs/developer/architecture">
          System Architecture
        </DocsRelatedLink>
        <DocsRelatedLink to="/docs/troubleshooting/common-issues">
          Troubleshooting
        </DocsRelatedLink>
      </DocsRelatedLinks>
    </DocsPage>
  );
}
```

### 2.3 Component Library for Documentation

**Layout Components:**
- `<DocsPage>` - Main page container
- `<DocsHero>` - Page header with title and description
- `<DocsSection>` - Content section with optional anchor
- `<DocsGrid>` - Responsive grid layout
- `<DocsContainer>` - Content width container

**Content Components:**
- `<DocsParagraph>` - Enhanced paragraph with typography
- `<DocsHeading>` - Auto-anchored headings (h2-h6)
- `<DocsList>` - Styled lists (ul/ol)
- `<DocsTable>` - Responsive tables with sorting
- `<DocsImage>` - Lazy-loaded images with captions
- `<DocsVideo>` - Embedded videos with controls

**Interactive Components:**
- `<DocsCodeBlock>` - Syntax-highlighted code with copy button
- `<DocsPlayground>` - Live code editor with preview
- `<DocsTabs>` - Tabbed content sections
- `<DocsAccordion>` - Collapsible content
- `<DocsSteps>` - Numbered step-by-step guides
- `<DocsCallout>` - Info, warning, error, success callouts
- `<DocsTooltip>` - Contextual help tooltips

**Navigation Components:**
- `<DocsLink>` - External links with icon
- `<DocsInternalLink>` - Internal navigation
- `<DocsAnchor>` - Smooth scroll anchors
- `<DocsBreadcrumb>` - Breadcrumb navigation
- `<DocsRelatedLinks>` - Related content suggestions

**API Components:**
- `<DocsApiEndpoint>` - API endpoint card
- `<DocsApiMethod>` - HTTP method badge
- `<DocsApiParams>` - Parameter table
- `<DocsApiResponse>` - Response examples
- `<DocsApiTryIt>` - Interactive API testing

**Component Gallery Components:**
- `<ComponentPreview>` - Live component preview
- `<ComponentProps>` - Props documentation table
- `<ComponentVariants>` - Component variations showcase
- `<ComponentCode>` - Component source code

### 2.4 Search System Architecture

**Search Index Structure:**
```javascript
// frontend/src/utils/docsSearch.js

export class DocsSearchEngine {
  constructor() {
    this.index = [];
    this.buildIndex();
  }

  buildIndex() {
    // Index structure:
    // {
    //   id: 'unique-doc-id',
    //   title: 'Document Title',
    //   description: 'Short description',
    //   content: 'Full text content for search',
    //   keywords: ['tag1', 'tag2'],
    //   category: 'getting-started',
    //   url: '/docs/getting-started/quick-start',
    //   headings: [
    //     { level: 2, text: 'Installation', anchor: '#installation' },
    //     { level: 3, text: 'PyPI Package', anchor: '#pypi-package' }
    //   ]
    // }
  }

  search(query) {
    // Full-text search with:
    // - Fuzzy matching
    // - Keyword boost
    // - Title/description priority
    // - Category filtering
    // - Result ranking
  }

  suggest(partial) {
    // Auto-complete suggestions
  }

  getRelated(docId) {
    // Find related documents by:
    // - Category similarity
    // - Keyword overlap
    // - Content similarity
  }
}
```

**Search Features:**
- ⚡ Instant search with debouncing
- 🎯 Fuzzy matching for typo tolerance
- 📊 Result ranking and relevance scoring
- 🏷️ Category and keyword filtering
- 💡 Auto-complete suggestions
- 🔗 Related content recommendations
- ⌨️ Keyboard navigation (Ctrl+K to open)
- 🎨 Highlighted search terms in results

### 2.5 Syntax Highlighting System

**Code Block Features:**
- 🎨 Theme-aware syntax highlighting (Prism.js or Shiki)
- 📋 One-click copy to clipboard
- 📏 Line numbers
- 🎯 Line highlighting
- 📝 Language badges
- 🔍 Code folding for long blocks
- 🎭 Diff highlighting for comparisons

**Supported Languages:**
- Python (backend code)
- JavaScript/JSX (frontend code)
- Bash (shell commands)
- SQL (database queries)
- JSON (API responses, configuration)
- YAML (docker-compose, CI/CD)
- XML (IODD, EDS files)
- Markdown (documentation)

### 2.6 Interactive Code Playground

**Playground Features:**
```jsx
<DocsPlayground
  title="Theme Color Picker Example"
  description="Try customizing theme colors and see live preview"
  defaultCode={`
import { ColorPicker } from './components/ColorPicker';

function Example() {
  const [color, setColor] = useState('#3DB60F');

  return (
    <div>
      <ColorPicker
        label="Primary Color"
        value={color}
        onChange={setColor}
      />
      <p style={{ color }}>Preview text</p>
    </div>
  );
}
  `}
  scope={{
    ColorPicker,
    useState,
  }}
  previewHeight={200}
/>
```

**Playground Components:**
- Live code editor (CodeMirror or Monaco)
- Real-time preview pane
- Error boundary with helpful messages
- Console output display
- Reset to default functionality
- Full-screen mode
- Share playground state via URL

---

## Phase 3: Content Migration Strategy

### 3.1 Automated Markdown to React Conversion

**Conversion Tool:**
Create `scripts/convert-md-to-react.js` that:
1. Parses markdown files with frontmatter
2. Converts markdown syntax to React JSX
3. Extracts code blocks for syntax highlighting
4. Converts images to React Image components
5. Generates component metadata
6. Creates component file with proper imports

**Conversion Rules:**
```
# Heading 1          → <DocsHeading level={1}>
## Heading 2         → <DocsHeading level={2}>
**bold**             → <strong>
*italic*             → <em>
[link](url)          → <DocsLink href="url">
![image](src)        → <DocsImage src="src" />
```code```          → <DocsCodeBlock language="lang">
> blockquote         → <DocsCallout type="info">
- list item          → <DocsList><li>
| table | row |      → <DocsTable>
```

**Metadata Extraction:**
```yaml
---
title: Quick Start Guide
description: Get started in 5 minutes
category: getting-started
keywords: [quickstart, setup, installation]
---
```

Becomes:
```javascript
export const metadata = {
  title: 'Quick Start Guide',
  description: 'Get started in 5 minutes',
  category: 'getting-started',
  keywords: ['quickstart', 'setup', 'installation']
};
```

### 3.2 Manual Enhancement Pass

After automated conversion, manually enhance each document with:
1. **Interactive elements** - Add playgrounds, live demos
2. **Visual enhancements** - Diagrams, charts, animations
3. **Code examples** - Add runnable examples
4. **Cross-references** - Link to related content
5. **Callouts** - Highlight important information
6. **Screenshots** - Add visual guides where helpful

### 3.3 Content Organization

**Documentation Structure:**
```
/docs
├── / (Home)
│   ├── Overview
│   ├── Key Features
│   └── Quick Links
│
├── /getting-started
│   ├── Quick Start
│   ├── Installation
│   │   ├── PyPI Package
│   │   ├── Docker
│   │   ├── Windows
│   │   └── Linux/macOS
│   └── First Steps
│
├── /user-guide
│   ├── Web Interface
│   │   ├── Dashboard
│   │   ├── Device Catalog
│   │   ├── Search
│   │   ├── Analytics
│   │   └── Admin Console
│   ├── Device Management
│   │   ├── Import Devices
│   │   ├── View Details
│   │   ├── Compare Devices
│   │   └── Export Data
│   ├── Configuration
│   │   ├── Application Config
│   │   ├── Database Config
│   │   ├── Theme Customization
│   │   └── Service Management
│   └── Features
│       ├── Keyboard Shortcuts
│       ├── Dark/Light Theme
│       ├── Ticket System
│       └── Analytics Dashboard
│
├── /api-reference
│   ├── Overview
│   ├── Authentication
│   ├── Endpoints
│   │   ├── Devices
│   │   ├── EDS Files
│   │   ├── Search
│   │   ├── Themes
│   │   ├── Services
│   │   ├── Tickets
│   │   └── Admin
│   ├── Error Handling
│   └── Rate Limiting
│
├── /components
│   ├── Component Gallery
│   ├── UI Components
│   │   ├── Button
│   │   ├── Card
│   │   ├── Dialog
│   │   ├── Input
│   │   ├── Select
│   │   └── [all ui.jsx components]
│   ├── Feature Components
│   │   ├── ColorPicker
│   │   ├── ThemeEditor
│   │   ├── ThemeManager
│   │   ├── AnalyticsDashboard
│   │   └── [all feature components]
│   ├── Theme System
│   │   ├── Overview
│   │   ├── Theme Presets
│   │   ├── Custom Themes
│   │   └── Color System
│   └── Props Reference
│
├── /developer
│   ├── Architecture
│   │   ├── System Overview
│   │   ├── Backend Architecture
│   │   ├── Frontend Architecture
│   │   └── Data Flow
│   ├── Backend Development
│   │   ├── API Development
│   │   ├── Database Schemas
│   │   ├── Migrations
│   │   ├── Parsers
│   │   └── Services
│   ├── Frontend Development
│   │   ├── Component Development
│   │   ├── State Management
│   │   ├── Routing
│   │   ├── Theming
│   │   └── Build Process
│   ├── Testing
│   │   ├── Unit Tests
│   │   ├── Integration Tests
│   │   ├── E2E Tests
│   │   └── Test Coverage
│   ├── Code Quality
│   │   ├── Style Guide
│   │   ├── Linting
│   │   ├── Type Checking
│   │   └── Best Practices
│   └── Contributing
│       ├── Development Setup
│       ├── Git Workflow
│       ├── Pull Requests
│       └── Code Review
│
├── /deployment
│   ├── Production Deployment
│   ├── Docker Deployment
│   ├── Environment Configuration
│   ├── Monitoring & Logging
│   ├── Performance Tuning
│   └── Security Hardening
│
└── /troubleshooting
    ├── Common Issues
    ├── Debugging Guide
    ├── FAQ
    ├── Known Issues
    └── Support Resources
```

---

## Phase 4: UI/UX Design

### 4.1 Documentation Viewer Layout

```
┌─────────────────────────────────────────────────────────────┐
│  Header                                                       │
│  ┌──────────┬────────────────────────┬─────────────────────┐ │
│  │ Logo     │ Search (Ctrl+K)        │ Theme Toggle  Docs  │ │
│  └──────────┴────────────────────────┴─────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│  Documentation Tab Bar                                        │
│  ┌──────────────────────────────────────────────────────────┐│
│  │ [Getting Started] [User Guide] [API] [Components] [Dev]  ││
│  └──────────────────────────────────────────────────────────┘│
├────────────┬────────────────────────────────┬────────────────┤
│            │                                │                │
│  Sidebar   │  Main Content                  │  TOC           │
│  Nav       │                                │  (Right)       │
│            │  ┌──────────────────────────┐  │                │
│  📁 Get    │  │ Page Title               │  │  On This Page  │
│  Started   │  │ Description              │  │  ──────────── │
│   📄 Quick │  └──────────────────────────┘  │  • Section 1   │
│   📄 Install│                               │  • Section 2   │
│            │  Content with:                 │    ◦ Subsection│
│  📁 User   │  • Headings                    │  • Section 3   │
│  Guide     │  • Paragraphs                  │                │
│   📄 Web   │  • Code blocks                 │  Related Pages │
│   📄 Config│  • Images                      │  ──────────── │
│            │  • Diagrams                    │  → Installation│
│  📁 API    │  • Playgrounds                 │  → Config Ref  │
│  Reference │  • Callouts                    │  → API Docs    │
│            │                                │                │
│            │  ┌──────────────────────────┐  │                │
│            │  │ Navigation Footer        │  │                │
│            │  │ ← Prev    Next →         │  │                │
│            │  └──────────────────────────┘  │                │
│            │                                │                │
└────────────┴────────────────────────────────┴────────────────┘
```

### 4.2 Color Scheme

**Light Theme:**
- Background: `#FFFFFF`
- Surface: `#F8F9FA`
- Text: `#1A1A1A`
- Muted: `#6C757D`
- Border: `#DEE2E6`
- Primary: `#3DB60F` (brand green)
- Code Background: `#F6F8FA`

**Dark Theme:**
- Background: `#0A0E27`
- Surface: `#1A1F3A`
- Text: `#E9ECEF`
- Muted: `#ADB5BD`
- Border: `#2D3748`
- Primary: `#3DB60F` (brand green)
- Code Background: `#1E293B`

**Accent Colors:**
- Success: `#51CF66`
- Warning: `#FFD43B`
- Error: `#FF6B6B`
- Info: `#4DABF7`

### 4.3 Typography

**Font Stack:**
```css
--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
```

**Font Sizes:**
- H1: 2.5rem (40px) - Page titles
- H2: 2rem (32px) - Major sections
- H3: 1.5rem (24px) - Subsections
- H4: 1.25rem (20px) - Minor headings
- Body: 1rem (16px) - Paragraph text
- Small: 0.875rem (14px) - Captions, metadata
- Code: 0.9rem (14.4px) - Code blocks

**Line Heights:**
- Headings: 1.2
- Body: 1.7
- Code: 1.6

### 4.4 Spacing & Layout

**Content Width:**
- Sidebar: 280px (fixed)
- Content: max 800px (centered)
- TOC: 240px (fixed)
- Responsive breakpoints:
  - Mobile: < 768px (hide sidebars, stack)
  - Tablet: 768px - 1024px (hide TOC)
  - Desktop: > 1024px (full layout)

**Vertical Rhythm:**
- Section spacing: 3rem (48px)
- Paragraph spacing: 1.5rem (24px)
- List item spacing: 0.5rem (8px)
- Code block margin: 1.5rem (24px)

### 4.5 Animations

**Page Transitions:**
```jsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -20 }}
  transition={{ duration: 0.3 }}
>
  {/* Page content */}
</motion.div>
```

**Hover Effects:**
- Links: Underline on hover
- Buttons: Scale 1.02 + shadow
- Cards: Lift + shadow
- Code: Border highlight

**Loading States:**
- Skeleton screens for content
- Spinner for search
- Progress bar for page load

---

## Phase 5: Implementation Plan

### 5.1 Sprint 1: Foundation (Days 1-3)

**Day 1: Core Documentation Components**
- [ ] Create `DocsViewer.jsx` - main viewer shell
- [ ] Create `DocsNavigation.jsx` - sidebar navigation
- [ ] Create `DocsContent.jsx` - content renderer
- [ ] Create `DocsTableOfContents.jsx` - right sidebar TOC
- [ ] Create `DocsBreadcrumb.jsx` - breadcrumb navigation
- [ ] Set up routing for documentation pages

**Day 2: Content Components**
- [ ] Create `DocsPage.jsx` - page wrapper
- [ ] Create `DocsHero.jsx` - page header
- [ ] Create `DocsSection.jsx` - content sections
- [ ] Create `DocsHeading.jsx` - auto-anchored headings
- [ ] Create `DocsParagraph.jsx`, `DocsList.jsx`, `DocsTable.jsx`
- [ ] Create `DocsImage.jsx`, `DocsVideo.jsx`

**Day 3: Interactive Components**
- [ ] Create `DocsCodeBlock.jsx` - syntax highlighting + copy
- [ ] Create `DocsTabs.jsx` - tabbed content
- [ ] Create `DocsAccordion.jsx` - collapsible sections
- [ ] Create `DocsSteps.jsx` - step-by-step guides
- [ ] Create `DocsCallout.jsx` - info/warning/error/success
- [ ] Create `DocsTooltip.jsx` - contextual help

### 5.2 Sprint 2: Search & Navigation (Days 4-5)

**Day 4: Search System**
- [ ] Implement `DocsSearchEngine` class
- [ ] Build search index from content metadata
- [ ] Create `DocsSearch.jsx` component
- [ ] Implement fuzzy search algorithm
- [ ] Add keyboard shortcuts (Ctrl+K)
- [ ] Add search result highlighting

**Day 5: Navigation Enhancements**
- [ ] Implement auto-generated TOC from headings
- [ ] Add smooth scroll to anchors
- [ ] Create `DocsRelatedLinks.jsx` - related content
- [ ] Add previous/next navigation
- [ ] Implement breadcrumb trail
- [ ] Add keyboard navigation (arrow keys)

### 5.3 Sprint 3: API Documentation (Days 6-7)

**Day 6: API Components**
- [ ] Create `DocsApiEndpoint.jsx` - endpoint card
- [ ] Create `DocsApiMethod.jsx` - HTTP method badge
- [ ] Create `DocsApiParams.jsx` - parameter table
- [ ] Create `DocsApiResponse.jsx` - response examples
- [ ] Create `DocsApiTryIt.jsx` - interactive API tester

**Day 7: Extract Backend API Documentation**
- [ ] Document all endpoints from `api.py`
- [ ] Document `admin_routes.py` endpoints
- [ ] Document `eds_routes.py` endpoints
- [ ] Document `theme_routes.py` endpoints
- [ ] Document `service_routes.py` endpoints
- [ ] Document `ticket_routes.py` endpoints
- [ ] Document `search_routes.py` endpoints
- [ ] Document `mqtt_routes.py` endpoints
- [ ] Create comprehensive API reference pages

### 5.4 Sprint 4: Component Gallery (Days 8-9)

**Day 8: Component Documentation Components**
- [ ] Create `ComponentPreview.jsx` - live component preview
- [ ] Create `ComponentProps.jsx` - props documentation table
- [ ] Create `ComponentVariants.jsx` - variations showcase
- [ ] Create `ComponentCode.jsx` - component source code
- [ ] Create `DocsPlayground.jsx` - interactive code editor

**Day 9: Document All UI Components**
- [ ] Document all components from `ui.jsx`
- [ ] Document `ColorPicker.jsx`
- [ ] Document `ThemeEditor.jsx`
- [ ] Document `ThemeManager.jsx`
- [ ] Document `AnalyticsDashboard.jsx`
- [ ] Document all service manager components
- [ ] Create interactive examples for each

### 5.5 Sprint 5: Content Migration (Days 10-14)

**Day 10: Getting Started Section**
- [ ] Convert `docs/user/getting-started/quick-start.md`
- [ ] Convert `docs/user/getting-started/installation.md`
- [ ] Convert `docs/user/getting-started/windows-installation.md`
- [ ] Convert `docs/user/getting-started/docker.md`
- [ ] Add interactive elements and screenshots

**Day 11: User Guide Section**
- [ ] Convert `docs/user/USER_MANUAL.md`
- [ ] Convert `docs/user/GUI_DOCUMENTATION.md`
- [ ] Convert `docs/user/CONFIGURATION.md`
- [ ] Convert `docs/user/user-guide/*.md` files
- [ ] Add live configuration examples

**Day 12: Developer Documentation**
- [ ] Convert `docs/developer/DEVELOPER_REFERENCE.md`
- [ ] Convert `docs/developer/API_SPECIFICATION.md`
- [ ] Convert `docs/developer/developer-guide/*.md` files
- [ ] Convert `docs/developer/database/*.md` files
- [ ] Add code examples and diagrams

**Day 13: Architecture & Deployment**
- [ ] Convert `docs/architecture/*.md` files
- [ ] Convert `docs/deployment/*.md` files
- [ ] Create interactive architecture diagrams
- [ ] Add deployment flowcharts

**Day 14: Troubleshooting & Misc**
- [ ] Convert `docs/troubleshooting/TROUBLESHOOTING.md`
- [ ] Convert theme documentation
- [ ] Create FAQ from common issues
- [ ] Add interactive debugging tools

### 5.6 Sprint 6: Integration & Polish (Days 15-16)

**Day 15: Integration**
- [ ] Add "Documentation" tab to main application
- [ ] Integrate with existing routing
- [ ] Add documentation link to header/footer
- [ ] Connect theme system to docs viewer
- [ ] Add analytics tracking for doc usage

**Day 16: Polish & Testing**
- [ ] Test all documentation pages
- [ ] Test search functionality
- [ ] Test code playgrounds
- [ ] Test on mobile/tablet/desktop
- [ ] Optimize performance (lazy loading, code splitting)
- [ ] Add loading states and error boundaries
- [ ] Fix accessibility issues (ARIA labels, keyboard nav)
- [ ] Run Lighthouse audit

### 5.7 Sprint 7: Enhancements (Days 17-18)

**Day 17: Visual Enhancements**
- [ ] Create custom diagrams for architecture
- [ ] Add animations and transitions
- [ ] Create video tutorials (if applicable)
- [ ] Add interactive flowcharts
- [ ] Create visual guides and illustrations

**Day 18: Advanced Features**
- [ ] Add version selector (if multiple versions)
- [ ] Add feedback widget
- [ ] Add print-friendly CSS
- [ ] Add dark mode code themes
- [ ] Add code language auto-detection
- [ ] Add mermaid diagram support

### 5.8 Sprint 8: Documentation Content (Days 19-20)

**Day 19: Backend Code Documentation**
- [ ] Extract and document all parser functions
- [ ] Document service implementations
- [ ] Document database models
- [ ] Create migration guides
- [ ] Add backend best practices

**Day 20: Frontend Code Documentation**
- [ ] Document all React contexts
- [ ] Document custom hooks
- [ ] Document utility functions
- [ ] Create component development guide
- [ ] Add frontend best practices

---

## Phase 6: Quality Assurance

### 6.1 Documentation Checklist

For each documentation page:
- [ ] Clear, concise title
- [ ] Helpful description
- [ ] Accurate metadata (keywords, category)
- [ ] Working code examples
- [ ] Tested interactive playgrounds
- [ ] Valid internal links
- [ ] Valid external links
- [ ] Proper image alt text
- [ ] Mobile-responsive layout
- [ ] Accessible (WCAG AA)
- [ ] Proofread for grammar/spelling
- [ ] Technical accuracy verified

### 6.2 Testing Matrix

**Browser Testing:**
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

**Device Testing:**
- [ ] Desktop (1920x1080)
- [ ] Laptop (1366x768)
- [ ] Tablet (iPad, 768x1024)
- [ ] Mobile (iPhone, 375x667)

**Functionality Testing:**
- [ ] Navigation works on all pages
- [ ] Search returns relevant results
- [ ] Code copy buttons work
- [ ] Interactive playgrounds execute correctly
- [ ] Images load properly
- [ ] Videos play correctly
- [ ] Links navigate correctly
- [ ] Theme switching works
- [ ] Keyboard shortcuts work
- [ ] TOC scrolls to correct sections

**Performance Testing:**
- [ ] Page load time < 2s
- [ ] Search response time < 200ms
- [ ] No layout shift (CLS < 0.1)
- [ ] Smooth animations (60fps)
- [ ] Lazy loading images
- [ ] Code splitting by route

**Accessibility Testing:**
- [ ] Keyboard navigation works
- [ ] Screen reader friendly
- [ ] Sufficient color contrast
- [ ] Focus indicators visible
- [ ] ARIA labels present
- [ ] Semantic HTML used

### 6.3 Content Review

**Technical Accuracy:**
- [ ] Code examples execute correctly
- [ ] API endpoints match implementation
- [ ] Configuration options are current
- [ ] Version numbers are accurate
- [ ] Screenshots show current UI

**Completeness:**
- [ ] All features documented
- [ ] All API endpoints documented
- [ ] All components documented
- [ ] All configuration options documented
- [ ] All error messages explained

**Clarity:**
- [ ] Language is clear and simple
- [ ] No jargon without explanation
- [ ] Examples are helpful
- [ ] Flow is logical
- [ ] Cross-references are helpful

---

## Phase 7: Maintenance Plan

### 7.1 Documentation Update Workflow

**When Adding New Features:**
1. Write documentation before or during feature development
2. Add component to documentation gallery
3. Create interactive example
4. Update navigation structure
5. Add to search index
6. Update related pages

**When Fixing Bugs:**
1. Update affected documentation
2. Add to troubleshooting guide if applicable
3. Update code examples if needed

**Regular Maintenance:**
- Review documentation quarterly
- Update screenshots annually
- Verify all links monthly
- Update dependencies in examples
- Refresh metrics and statistics

### 7.2 Version Control

**Documentation Versioning Strategy:**
- Main documentation tracks latest release
- Add version selector for major versions
- Archive old documentation
- Maintain migration guides between versions

### 7.3 Contribution Guidelines

**For Contributors:**
- Documentation PRs required for new features
- Follow component structure templates
- Use provided documentation components
- Include interactive examples
- Test on multiple devices
- Run spell check

---

## Phase 8: Success Metrics

### 8.1 Key Performance Indicators (KPIs)

**Engagement Metrics:**
- Time on documentation pages
- Pages per session
- Search usage rate
- Playground interaction rate
- Navigation patterns

**Quality Metrics:**
- Page load time
- Search response time
- Mobile usage percentage
- Accessibility score (Lighthouse)
- User feedback ratings

**Content Metrics:**
- Coverage: % of features documented
- Freshness: % of docs updated in last quarter
- Completeness: % of pages with examples
- Link health: % of valid links

### 8.2 Success Criteria

**Phase Completion:**
- ✅ All 45+ markdown files converted to React
- ✅ All 61 backend files documented
- ✅ All 35 frontend components documented
- ✅ Search working with < 200ms response time
- ✅ Interactive playgrounds functional
- ✅ Mobile responsive (tested on 3+ devices)
- ✅ Accessibility score > 95 (Lighthouse)
- ✅ Page load time < 2 seconds
- ✅ 100% internal links working
- ✅ Only README.md remains as markdown

---

## Phase 9: Post-Launch Enhancements

### 9.1 Future Features

**Phase 2 Enhancements (Future):**
- [ ] PDF export of documentation
- [ ] Multi-language support (i18n)
- [ ] Video tutorials embedded
- [ ] Interactive tutorials/walkthroughs
- [ ] Community contributions section
- [ ] Documentation analytics dashboard
- [ ] AI-powered documentation assistant
- [ ] Real-time collaboration on code examples
- [ ] Documentation comments/discussions
- [ ] Documentation changelog

### 9.2 Community Features

- [ ] Community examples showcase
- [ ] User-contributed guides
- [ ] Documentation improvement suggestions
- [ ] Voting on helpful content
- [ ] Documentation bounties for missing content

---

## Appendix A: Component Templates

### Template: Documentation Page

```jsx
// frontend/src/content/docs/[category]/[PageName].jsx

import React from 'react';
import {
  DocsPage,
  DocsHero,
  DocsSection,
  DocsCodeBlock,
  DocsCallout,
  DocsRelatedLinks
} from '../../../components/docs';

export const metadata = {
  id: 'page-slug',
  title: 'Page Title',
  description: 'Brief description',
  category: 'category-name',
  order: 1,
  keywords: ['keyword1', 'keyword2'],
  lastUpdated: '2025-01-16',
};

export default function PageName() {
  return (
    <DocsPage>
      <DocsHero
        title={metadata.title}
        description={metadata.description}
      />

      <DocsSection title="Section Title">
        <p>Content goes here...</p>
      </DocsSection>

      <DocsRelatedLinks>
        {/* Related pages */}
      </DocsRelatedLinks>
    </DocsPage>
  );
}
```

### Template: API Endpoint Documentation

```jsx
<DocsApiEndpoint
  method="POST"
  path="/api/themes"
  title="Create Custom Theme"
  description="Create a new custom theme with validated colors"
>
  <DocsApiParams type="body">
    <DocsApiParam
      name="name"
      type="string"
      required
      description="Theme name"
    />
    <DocsApiParam
      name="colors"
      type="object"
      required
      description="Theme color palette"
    />
  </DocsApiParams>

  <DocsApiResponse status={201} title="Created">
    <DocsCodeBlock language="json">
      {`{
  "id": "custom-1",
  "name": "My Theme",
  "message": "Theme created successfully"
}`}
    </DocsCodeBlock>
  </DocsApiResponse>

  <DocsApiTryIt
    endpoint="/api/themes"
    method="POST"
    defaultBody={{
      name: "Test Theme",
      colors: { brand: "#3DB60F" }
    }}
  />
</DocsApiEndpoint>
```

### Template: Component Documentation

```jsx
<ComponentPreview
  component={Button}
  title="Button Component"
  description="Versatile button with multiple variants and sizes"
>
  <ComponentVariants>
    <ComponentVariant title="Default">
      <Button>Click Me</Button>
    </ComponentVariant>

    <ComponentVariant title="Primary">
      <Button variant="primary">Primary</Button>
    </ComponentVariant>

    <ComponentVariant title="Sizes">
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
    </ComponentVariant>
  </ComponentVariants>

  <ComponentProps>
    <ComponentProp
      name="variant"
      type="string"
      default="default"
      options={['default', 'primary', 'secondary', 'outline', 'ghost']}
      description="Visual style variant"
    />
    <ComponentProp
      name="size"
      type="string"
      default="md"
      options={['sm', 'md', 'lg']}
      description="Button size"
    />
  </ComponentProps>

  <ComponentCode>
    {`import { Button } from './components/ui';

<Button variant="primary" size="lg" onClick={handleClick}>
  Click Me
</Button>`}
  </ComponentCode>
</ComponentPreview>
```

---

## Appendix B: File Organization

### Documentation Source Files

```
frontend/src/content/docs/
├── getting-started/
│   ├── QuickStart.jsx
│   ├── Installation.jsx
│   ├── WindowsInstallation.jsx
│   └── DockerSetup.jsx
├── user-guide/
│   ├── WebInterface.jsx
│   ├── Configuration.jsx
│   ├── DeviceManagement.jsx
│   └── Features.jsx
├── api/
│   ├── Overview.jsx
│   ├── Endpoints.jsx
│   ├── Authentication.jsx
│   └── ErrorHandling.jsx
├── components/
│   ├── Gallery.jsx
│   ├── ThemeSystem.jsx
│   └── UiComponents.jsx
├── developer/
│   ├── Architecture.jsx
│   ├── BackendDevelopment.jsx
│   ├── FrontendDevelopment.jsx
│   ├── Testing.jsx
│   └── Contributing.jsx
├── deployment/
│   ├── Production.jsx
│   ├── Docker.jsx
│   └── Monitoring.jsx
└── troubleshooting/
    ├── CommonIssues.jsx
    ├── Debugging.jsx
    └── FAQ.jsx
```

---

## Appendix C: Dependencies

### New NPM Packages Required

```json
{
  "dependencies": {
    "prismjs": "^1.29.0",              // Syntax highlighting
    "react-live": "^4.1.3",             // Code playgrounds
    "fuse.js": "^7.0.0",                // Fuzzy search
    "framer-motion": "^10.16.0",        // Already installed
    "react-markdown": "^9.0.1",         // Markdown parsing (for conversion)
    "remark-gfm": "^4.0.0",             // GitHub Flavored Markdown
    "rehype-highlight": "^7.0.0",       // Syntax highlighting
    "mermaid": "^10.6.0"                // Diagrams (optional)
  },
  "devDependencies": {
    "gray-matter": "^4.0.3",            // Frontmatter parsing
    "unified": "^11.0.0",               // Markdown processing
    "remark-parse": "^11.0.0",          // Markdown parser
    "remark-rehype": "^11.0.0"          // Markdown to HTML
  }
}
```

---

## Appendix D: Timeline Summary

**Total Estimated Time: 20 Days**

| Sprint | Days | Focus Area | Deliverables |
|--------|------|------------|--------------|
| 1 | 1-3 | Foundation | Core documentation components |
| 2 | 4-5 | Search & Navigation | Search system, enhanced navigation |
| 3 | 6-7 | API Documentation | API reference components and content |
| 4 | 8-9 | Component Gallery | Component documentation system |
| 5 | 10-14 | Content Migration | Convert all markdown to React |
| 6 | 15-16 | Integration & Polish | UI integration, testing, optimization |
| 7 | 17-18 | Enhancements | Visual improvements, advanced features |
| 8 | 19-20 | Code Documentation | Backend and frontend code docs |

---

## Conclusion

This comprehensive plan transforms Greenstack's documentation from static markdown files into a stunning, interactive, React-based documentation platform integrated directly into the application. The result will be:

✅ **Stunning Visual Design** - Modern, brand-consistent, beautiful UI
✅ **Interactive Learning** - Live code playgrounds and examples
✅ **Comprehensive Coverage** - Every feature, API, and component documented
✅ **Excellent UX** - Fast search, smooth navigation, mobile-friendly
✅ **Maintainable** - Easy to update, version control, contribution-friendly
✅ **Accessible** - WCAG AA compliant, keyboard navigable, screen reader friendly

**Next Steps:** Begin Sprint 1 implementation of core documentation components.

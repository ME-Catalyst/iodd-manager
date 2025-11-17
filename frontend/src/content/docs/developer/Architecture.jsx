import React from 'react';
import { Layers, Database, Code, Network, Box, GitBranch, Zap } from 'lucide-react';
import DocsPage from '../../../components/docs/DocsPage';
import DocsHero from '../../../components/docs/DocsHero';
import DocsSection from '../../../components/docs/DocsSection';
import DocsCallout from '../../../components/docs/DocsCallout';
import { DocsParagraph, DocsLink } from '../../../components/docs/DocsText';
import DocsCodeBlock from '../../../components/docs/DocsCodeBlock';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Badge } from '../../../components/ui';

export const metadata = {
  id: 'developer/architecture',
  title: 'System Architecture',
  description: 'Comprehensive overview of Greenstack system design, architecture layers, data flow, and component interactions',
  category: 'developer',
  order: 1,
  keywords: ['architecture', 'design', 'structure', 'system', 'layers', 'backend', 'frontend'],
  lastUpdated: '2025-01-17',
};

export default function Architecture({ onNavigate }) {
  return (
    <DocsPage>
      <DocsHero
        title="System Architecture"
        description="Comprehensive overview of Greenstack's design, layers, and data flow"
        icon={<Layers className="w-12 h-12 text-brand-green" />}
      />

      {/* High-Level Overview */}
      <DocsSection title="High-Level Overview" icon={<Layers />}>
        <DocsParagraph>
          Greenstack is a modern full-stack application built with a clear separation between
          frontend and backend. It follows a three-tier architecture with presentation, application,
          and data layers.
        </DocsParagraph>

        <Card className="my-6 bg-gradient-to-br from-surface to-surface-hover">
          <CardContent className="pt-6">
            <pre className="text-sm font-mono text-foreground overflow-x-auto">
{`┌─────────────────────────────────────────────────────────────────────┐
│                          CLIENT BROWSER                             │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                    React Frontend (Port 5173)                 │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌──────────────────────┐  │  │
│  │  │   UI Layer  │  │   Context   │  │   Components &       │  │  │
│  │  │  Components │  │   Providers │  │   Page Views         │  │  │
│  │  └─────────────┘  └─────────────┘  └──────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                            HTTP/REST API
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      FastAPI Backend (Port 8000)                    │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                      API Layer (Routes)                       │  │
│  │  ┌─────────┐ ┌─────────┐ ┌──────────┐ ┌──────────────────┐  │  │
│  │  │   EDS   │ │  Admin  │ │  Themes  │ │   Search/MQTT    │  │  │
│  │  │ Routes  │ │ Routes  │ │  Routes  │ │   Service Routes │  │  │
│  │  └─────────┘ └─────────┘ └──────────┘ └──────────────────┘  │  │
│  └───────────────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                   Business Logic Layer                        │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐   │  │
│  │  │  EDS Parsers │  │  Validation  │  │   Data Models    │   │  │
│  │  │  (XML/ZIP)   │  │  & Business  │  │   (SQLAlchemy)   │   │  │
│  │  └──────────────┘  └──────────────┘  └──────────────────┘   │  │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                            SQL Queries
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                   SQLite Database (greenstack.db)                   │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  Tables: devices, iodds, parameters, themes, tickets, logs   │  │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘`}
            </pre>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-3 my-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Code className="w-4 h-4 text-brand-green" />
                Frontend Layer
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                React 18 with Vite, Tailwind CSS, Radix UI components, and theme system
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Zap className="w-4 h-4 text-brand-green" />
                Backend Layer
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                FastAPI with Python 3.10+, SQLAlchemy ORM, and XML parsing
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Database className="w-4 h-4 text-brand-green" />
                Data Layer
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                SQLite database with structured schema for IO-Link device data
              </p>
            </CardContent>
          </Card>
        </div>
      </DocsSection>

      {/* Backend Architecture */}
      <DocsSection title="Backend Architecture" icon={<Zap />}>
        <DocsParagraph>
          The backend is built with FastAPI and follows a modular route-based architecture.
          Each functional area has dedicated route handlers and business logic.
        </DocsParagraph>

        <Card className="my-6 bg-gradient-to-br from-surface to-surface-hover">
          <CardContent className="pt-6">
            <pre className="text-sm font-mono text-foreground overflow-x-auto">
{`src/
├── api.py                    # FastAPI application entry point
├── config.py                 # Configuration and environment variables
├── database.py               # Database connection management
├── start.py                  # Application startup script
│
├── routes/                   # API Route Handlers
│   ├── eds_routes.py         # IODD/EDS file upload & management
│   ├── admin_routes.py       # Admin console & system stats
│   ├── theme_routes.py       # Theme management endpoints
│   ├── search_routes.py      # Full-text search functionality
│   ├── mqtt_routes.py        # MQTT broker integration
│   ├── service_routes.py     # External services (Grafana, Node-RED)
│   ├── config_export_routes.py  # Configuration export
│   └── ticket_routes.py      # Ticket system endpoints
│
├── parsers/                  # EDS/IODD File Parsers
│   ├── eds_parser.py         # Main EDS XML parser
│   ├── eds_package_parser.py # ZIP package handler
│   └── eds_diagnostics.py    # Device diagnostics parser
│
└── utils/                    # Shared Utilities
    └── (helper functions)


┌─────────────────────────────────────────────────────────────────┐
│                     FastAPI Request Flow                        │
└─────────────────────────────────────────────────────────────────┘

  HTTP Request
       │
       ▼
  ┌─────────────┐
  │   CORS      │  # Cross-origin resource sharing
  │ Middleware  │
  └─────────────┘
       │
       ▼
  ┌─────────────┐
  │ Rate Limit  │  # 10/min uploads, 100/min general
  │ Middleware  │
  └─────────────┘
       │
       ▼
  ┌─────────────┐
  │   Router    │  # Route to appropriate handler
  └─────────────┘
       │
       ▼
  ┌─────────────┐
  │   Route     │  # Business logic execution
  │  Handler    │
  └─────────────┘
       │
       ▼
  ┌─────────────┐
  │  Database   │  # SQLAlchemy ORM queries
  │   Layer     │
  └─────────────┘
       │
       ▼
  ┌─────────────┐
  │  Response   │  # JSON response with status code
  │ Formatting  │
  └─────────────┘
       │
       ▼
  HTTP Response`}
            </pre>
          </CardContent>
        </Card>

        <DocsCallout type="info" title="Route Organization">
          <DocsParagraph>
            Routes are organized by domain functionality. Each route file is responsible for
            a specific feature area and includes all related endpoints (GET, POST, PUT, DELETE).
          </DocsParagraph>
        </DocsCallout>
      </DocsSection>

      {/* Frontend Architecture */}
      <DocsSection title="Frontend Architecture" icon={<Code />}>
        <DocsParagraph>
          The frontend uses React 18 with modern hooks, context providers for state management,
          and a component-based architecture with lazy loading for optimal performance.
        </DocsParagraph>

        <Card className="my-6 bg-gradient-to-br from-surface to-surface-hover">
          <CardContent className="pt-6">
            <pre className="text-sm font-mono text-foreground overflow-x-auto">
{`frontend/src/
├── main.jsx                  # Application entry point
├── App.jsx                   # Root component with routing
│
├── components/               # React Components
│   ├── ui.jsx                # Base UI components (Button, Card, etc.)
│   ├── SearchPage.jsx        # Device search interface
│   ├── EDSDetailsView.jsx    # Device detail views
│   ├── ThemeManager.jsx      # Theme customization UI
│   ├── AdminConsole.jsx      # Admin dashboard
│   ├── MqttManager.jsx       # MQTT configuration
│   ├── TicketsPage.jsx       # Ticket system UI
│   └── docs/                 # Documentation components
│       ├── DocsViewer.jsx
│       ├── DocsNavigation.jsx
│       ├── DocsContent.jsx
│       └── ...
│
├── contexts/                 # React Context Providers
│   └── ThemeContext.jsx      # Global theme state management
│
├── content/                  # Static Content
│   └── docs/                 # Documentation pages (JSX)
│       ├── index.js          # Docs registry
│       ├── getting-started/
│       ├── user-guide/
│       ├── api/
│       ├── components/
│       └── developer/
│
├── config/                   # Configuration
│   └── themes.js             # Theme definitions & presets
│
├── hooks/                    # Custom React Hooks
│   └── useKeyboardShortcuts.js
│
└── utils/                    # Utility Functions
    ├── docsSearch.js         # Documentation search
    ├── edsParameterCategorizer.js
    ├── edsDataTypeDecoder.js
    └── ...


┌─────────────────────────────────────────────────────────────────┐
│                   React Component Hierarchy                     │
└─────────────────────────────────────────────────────────────────┘

                          App.jsx
                             │
              ┌──────────────┼──────────────┐
              │              │              │
         ThemeContext   ErrorBoundary   Router
              │                             │
              └─────────────┬───────────────┘
                            │
          ┌─────────────────┼─────────────────┐
          │                 │                 │
     SearchPage      EDSDetailsView    AdminConsole
          │                 │                 │
    ┌─────┴─────┐     ┌─────┴─────┐    ┌─────┴─────┐
    │           │     │           │    │           │
 Filters   Results  Params   Modules  Stats   Services
    │           │     │           │    │           │
    └───────────┴─────┴───────────┴────┴───────────┘
                            │
                      UI Components
                  (Button, Card, Badge, etc.)`}
            </pre>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2 my-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">State Management</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• <strong>ThemeContext:</strong> Global theme state</li>
                <li>• <strong>Local useState:</strong> Component-specific state</li>
                <li>• <strong>URL params:</strong> Navigation state</li>
                <li>• <strong>API responses:</strong> Server data caching</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Performance Optimizations</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• <strong>Lazy loading:</strong> Code splitting per route</li>
                <li>• <strong>Memoization:</strong> React.memo for heavy components</li>
                <li>• <strong>Virtual scrolling:</strong> Large lists optimization</li>
                <li>• <strong>Image optimization:</strong> Lazy image loading</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </DocsSection>

      {/* Data Flow */}
      <DocsSection title="Data Flow & Communication" icon={<Network />}>
        <DocsParagraph>
          Data flows through the application in a unidirectional pattern, from user actions
          to API calls, database operations, and back to the UI.
        </DocsParagraph>

        <Card className="my-6 bg-gradient-to-br from-surface to-surface-hover">
          <CardContent className="pt-6">
            <pre className="text-sm font-mono text-foreground overflow-x-auto">
{`┌─────────────────────────────────────────────────────────────────┐
│                      Data Flow Example:                         │
│              IODD File Upload & Processing                      │
└─────────────────────────────────────────────────────────────────┘

1. USER ACTION
   │
   └─► User clicks "Upload IODD" button
       User selects .zip or .xml file
       │
       ▼

2. FRONTEND VALIDATION
   │
   └─► Validate file type (.zip, .xml, .eds)
       Check file size (< 10MB)
       Show upload progress UI
       │
       ▼

3. API REQUEST
   │
   └─► POST /api/iodds/upload
       Content-Type: multipart/form-data
       File: [binary data]
       │
       ▼

4. BACKEND PROCESSING
   │
   ├─► Rate limit check (10/min)
   │
   ├─► File validation & extraction
   │   └─► If ZIP: Extract contents
   │       If XML: Read directly
   │
   ├─► XML Parsing
   │   └─► EDSParser.parse(xml_content)
   │       Extract device metadata
   │       Parse parameters & modules
   │       Decode data types & enums
   │
   ├─► Database Operations
   │   └─► Check for duplicates
   │       Create Device record
   │       Create Parameter records
   │       Create Module records
   │       Commit transaction
   │
   └─► Response Generation
       └─► Generate JSON response
           Include device ID & summary
       │
       ▼

5. FRONTEND UPDATE
   │
   └─► Parse API response
       Update device list
       Show success notification
       Navigate to device details
       │
       ▼

6. UI REFRESH
   │
   └─► Render device card
       Display parameters
       Enable search/filter`}
            </pre>
          </CardContent>
        </Card>
      </DocsSection>

      {/* Database Schema */}
      <DocsSection title="Database Schema" icon={<Database />}>
        <DocsParagraph>
          Greenstack uses SQLite with a normalized schema designed for IO-Link device data.
          All queries use SQLAlchemy ORM for type safety and SQL injection prevention.
        </DocsParagraph>

        <Card className="my-6 bg-gradient-to-br from-surface to-surface-hover">
          <CardContent className="pt-6">
            <pre className="text-sm font-mono text-foreground overflow-x-auto">
{`┌─────────────────────────────────────────────────────────────────┐
│                      Database Entity Model                      │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────┐
│     devices      │  # IO-Link device records
├──────────────────┤
│ id (PK)          │
│ vendor_id        │  # IO-Link vendor ID
│ device_id        │  # Device identifier
│ product_name     │
│ vendor_name      │
│ product_text     │
│ device_function  │
│ hardware_rev     │
│ firmware_rev     │
│ iodd_version     │
│ process_data_in  │
│ process_data_out │
│ created_at       │
└──────────────────┘
        │
        │ 1:N
        ▼
┌──────────────────┐
│   parameters     │  # Device parameters/settings
├──────────────────┤
│ id (PK)          │
│ device_id (FK)   │────┐
│ index            │    │
│ subindex         │    │
│ name             │    │
│ description      │    │
│ data_type        │    │
│ access_rights    │    │
│ default_value    │    │
│ min_value        │    │
│ max_value        │    │
│ unit             │    │
│ category         │    │
└──────────────────┘    │
                        │
┌──────────────────┐    │
│     modules      │    │  # Device modules/assemblies
├──────────────────┤    │
│ id (PK)          │    │
│ device_id (FK)   │────┘
│ name             │
│ description      │
│ type             │
└──────────────────┘


┌──────────────────┐
│     themes       │  # Custom themes
├──────────────────┤
│ id (PK)          │
│ name             │
│ description      │
│ preset_id        │
│ colors (JSON)    │
│ created_at       │
│ updated_at       │
└──────────────────┘


┌──────────────────┐
│     tickets      │  # Support tickets
├──────────────────┤
│ id (PK)          │
│ title            │
│ description      │
│ status           │
│ priority         │
│ assignee         │
│ created_at       │
│ updated_at       │
└──────────────────┘
        │
        │ 1:N
        ▼
┌──────────────────┐
│   attachments    │  # Ticket files
├──────────────────┤
│ id (PK)          │
│ ticket_id (FK)   │
│ filename         │
│ file_path        │
│ mime_type        │
│ uploaded_at      │
└──────────────────┘


┌──────────────────┐
│    mqtt_logs     │  # MQTT message logs
├──────────────────┤
│ id (PK)          │
│ timestamp        │
│ topic            │
│ payload          │
│ qos              │
└──────────────────┘`}
            </pre>
          </CardContent>
        </Card>

        <DocsCallout type="info" title="Database Management">
          <DocsParagraph>
            The database uses SQLite by default for simplicity. For production deployments with
            high concurrency, PostgreSQL is recommended. Connection management is centralized
            in <code>src/database.py</code> for easy switching.
          </DocsParagraph>
        </DocsCallout>
      </DocsSection>

      {/* API Architecture */}
      <DocsSection title="API Architecture">
        <DocsParagraph>
          The REST API follows RESTful conventions with consistent response formats and
          comprehensive error handling.
        </DocsParagraph>

        <Card className="my-6">
          <CardHeader>
            <CardTitle className="text-base">API Endpoint Structure</CardTitle>
          </CardHeader>
          <CardContent>
            <DocsCodeBlock language="text">
{`/api
├── /iodds                    # IODD/EDS Management
│   ├── GET    /              # List all IODDs
│   ├── POST   /upload        # Upload IODD file
│   ├── GET    /{id}          # Get IODD details
│   └── DELETE /{id}          # Delete IODD
│
├── /search                   # Search & Filter
│   ├── GET    /              # Full-text search
│   └── GET    /filters       # Available filters
│
├── /themes                   # Theme Management
│   ├── GET    /              # List themes
│   ├── POST   /              # Create custom theme
│   ├── GET    /active        # Get active theme
│   ├── POST   /{id}/activate # Activate theme
│   ├── PUT    /{id}          # Update theme
│   └── DELETE /{id}          # Delete theme
│
├── /admin                    # Admin Console
│   ├── GET    /stats         # System statistics
│   ├── GET    /logs          # Application logs
│   ├── POST   /backup        # Create backup
│   └── POST   /vacuum        # Optimize database
│
├── /mqtt                     # MQTT Integration
│   ├── GET    /status        # Broker status
│   ├── POST   /publish       # Publish message
│   └── GET    /logs          # Message logs
│
├── /services                 # External Services
│   ├── GET    /grafana       # Grafana status
│   ├── GET    /nodered       # Node-RED status
│   └── GET    /influxdb      # InfluxDB status
│
└── /tickets                  # Ticket System
    ├── GET    /              # List tickets
    ├── POST   /              # Create ticket
    ├── GET    /{id}          # Get ticket details
    ├── PUT    /{id}          # Update ticket
    ├── DELETE /{id}          # Delete ticket
    └── POST   /{id}/attach   # Upload attachment`}
            </DocsCodeBlock>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2 my-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Request Format</CardTitle>
            </CardHeader>
            <CardContent>
              <DocsCodeBlock language="http">
{`POST /api/iodds/upload
Content-Type: multipart/form-data
Rate-Limit: 10/minute

Headers:
  Content-Type: multipart/form-data

Body:
  file: [binary data]`}
              </DocsCodeBlock>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Response Format</CardTitle>
            </CardHeader>
            <CardContent>
              <DocsCodeBlock language="json">
{`{
  "id": 123,
  "vendor_id": 310,
  "device_id": 1234,
  "product_name": "Device Name",
  "created_at": "2025-01-17T12:00:00"
}

// Error response
{
  "detail": "Error message",
  "status": 400
}`}
              </DocsCodeBlock>
            </CardContent>
          </Card>
        </div>
      </DocsSection>

      {/* Security Architecture */}
      <DocsSection title="Security Architecture" icon={<GitBranch />}>
        <DocsParagraph>
          Security is implemented at multiple layers with rate limiting, input validation,
          and protection against common vulnerabilities.
        </DocsParagraph>

        <div className="grid gap-4 md:grid-cols-2 my-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Backend Security</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• <strong>Rate Limiting:</strong> SlowAPI (10/min uploads, 100/min general)</li>
                <li>• <strong>CORS:</strong> Configured allowed origins</li>
                <li>• <strong>SQL Injection:</strong> SQLAlchemy ORM parameterization</li>
                <li>• <strong>File Validation:</strong> Type & size checks</li>
                <li>• <strong>Input Sanitization:</strong> Pydantic models</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Frontend Security</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• <strong>XSS Protection:</strong> React automatic escaping</li>
                <li>• <strong>CSRF:</strong> SameSite cookie policy</li>
                <li>• <strong>Input Validation:</strong> Client-side validation</li>
                <li>• <strong>Secure Storage:</strong> No sensitive data in localStorage</li>
                <li>• <strong>Content Security:</strong> Vite security defaults</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </DocsSection>

      {/* Deployment Architecture */}
      <DocsSection title="Deployment Architecture">
        <DocsParagraph>
          Greenstack can be deployed in various configurations from development to production.
        </DocsParagraph>

        <Card className="my-6 bg-gradient-to-br from-surface to-surface-hover">
          <CardContent className="pt-6">
            <pre className="text-sm font-mono text-foreground overflow-x-auto">
{`┌─────────────────────────────────────────────────────────────────┐
│                    Production Deployment                        │
└─────────────────────────────────────────────────────────────────┘

                        Internet
                           │
                           ▼
                    ┌──────────────┐
                    │  Reverse     │  # Nginx/Traefik
                    │  Proxy       │  # SSL/TLS termination
                    │  (Port 443)  │  # Load balancing
                    └──────────────┘
                           │
              ┌────────────┴────────────┐
              │                         │
              ▼                         ▼
       ┌─────────────┐          ┌─────────────┐
       │  Frontend   │          │  Backend    │
       │  Container  │          │  Container  │
       │  (Nginx)    │          │  (FastAPI)  │
       │  Port 80    │          │  Port 8000  │
       └─────────────┘          └─────────────┘
                                       │
                                       ▼
                                ┌─────────────┐
                                │  Database   │
                                │  (SQLite or │
                                │  PostgreSQL)│
                                └─────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                   Development Environment                       │
└─────────────────────────────────────────────────────────────────┘

       Developer Machine
              │
    ┌─────────┴─────────┐
    │                   │
    ▼                   ▼
┌────────┐         ┌────────┐
│ Vite   │         │ Python │
│ Dev    │    ←──→ │ FastAPI│
│ Server │         │ Server │
│ :5173  │         │ :8000  │
└────────┘         └────────┘
                       │
                       ▼
                  ┌────────┐
                  │ SQLite │
                  │  File  │
                  └────────┘`}
            </pre>
          </CardContent>
        </Card>
      </DocsSection>

      {/* Related Resources */}
      <DocsSection title="Related Resources">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 my-6">
          <DocsLink href="/docs/developer/backend" external={false} onNavigate={onNavigate} className="block border border-border rounded-lg p-4 hover:border-brand-green transition-colors">
            <h5 className="font-semibold text-foreground mb-1">Backend Development</h5>
            <p className="text-sm text-muted-foreground">Deep dive into FastAPI backend</p>
          </DocsLink>

          <DocsLink href="/docs/developer/frontend" external={false} onNavigate={onNavigate} className="block border border-border rounded-lg p-4 hover:border-brand-green transition-colors">
            <h5 className="font-semibold text-foreground mb-1">Frontend Development</h5>
            <p className="text-sm text-muted-foreground">React components and state management</p>
          </DocsLink>

          <DocsLink href="/docs/api/overview" external={false} onNavigate={onNavigate} className="block border border-border rounded-lg p-4 hover:border-brand-green transition-colors">
            <h5 className="font-semibold text-foreground mb-1">API Overview</h5>
            <p className="text-sm text-muted-foreground">Complete API documentation</p>
          </DocsLink>

          <DocsLink href="/docs/deployment/production" external={false} onNavigate={onNavigate} className="block border border-border rounded-lg p-4 hover:border-brand-green transition-colors">
            <h5 className="font-semibold text-foreground mb-1">Production Deployment</h5>
            <p className="text-sm text-muted-foreground">Deploy Greenstack to production</p>
          </DocsLink>
        </div>
      </DocsSection>
    </DocsPage>
  );
}

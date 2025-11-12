# Architecture Overview

Understanding the IODD Manager architecture and codebase structure.

## System Architecture

```
┌────────────────────────────────────────────────────────────┐
│                        Web Browser                          │
│                   (React + Vite Frontend)                   │
└─────────────────────┬──────────────────────────────────────┘
                      │ HTTP/REST
                      │
┌─────────────────────▼──────────────────────────────────────┐
│                    FastAPI Backend                          │
│  ┌────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │  API       │  │  IODD Parser │  │  Adapter         │  │
│  │  Endpoints │──│              │──│  Generator       │  │
│  └────────────┘  └──────────────┘  └──────────────────┘  │
└─────────────────────┬──────────────────────────────────────┘
                      │ SQLAlchemy ORM
                      │
┌─────────────────────▼──────────────────────────────────────┐
│                   SQLite Database                           │
│  ┌──────────┐  ┌────────────┐  ┌────────────────────┐    │
│  │ Devices  │  │ Parameters │  │ Generated Adapters │    │
│  └──────────┘  └────────────┘  └────────────────────┘    │
└────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│                      File Storage                           │
│  ┌──────────────┐              ┌──────────────────┐       │
│  │  IODD Files  │              │  Generated Code  │       │
│  │  (XML)       │              │  (JSON/PY/CPP)   │       │
│  └──────────────┘              └──────────────────┘       │
└────────────────────────────────────────────────────────────┘
```

## Project Structure

```
iodd-manager/
├── api.py                    # FastAPI application
├── iodd_manager.py           # Core IODD parser
├── config.py                 # Configuration management
├── start.py                  # Development server launcher
│
├── alembic/                  # Database migrations
│   ├── versions/             # Migration scripts
│   ├── env.py                # Migration environment
│   └── script.py.mako        # Migration template
│
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── main.jsx          # Application entry
│   │   ├── App.jsx           # Main dashboard component
│   │   ├── index.css         # Global styles
│   │   └── components/
│   │       └── ui.jsx        # UI component library
│   ├── public/               # Static assets
│   ├── package.json          # NPM dependencies
│   └── vite.config.js        # Vite configuration
│
├── tests/                    # Test suite
│   ├── conftest.py           # Pytest fixtures
│   ├── test_parser.py        # Parser tests
│   ├── test_api.py           # API tests
│   ├── test_storage.py       # Database tests
│   └── fixtures/             # Test data
│
├── iodd_storage/             # Uploaded IODD files
│   └── vendor_*/             # Organized by vendor
│
├── generated/                # Generated adapter code
│
├── docs/                     # Documentation
│   ├── getting-started/
│   ├── user-guide/
│   ├── developer-guide/
│   └── api/
│
├── .github/                  # GitHub Actions workflows
│   └── workflows/
│       └── ci.yml            # CI/CD pipeline
│
├── requirements.txt          # Python dependencies
├── .env.example              # Configuration template
├── pyproject.toml            # Python tool configuration
├── .pylintrc                 # Pylint configuration
├── .pre-commit-config.yaml   # Pre-commit hooks
├── Makefile                  # Development commands
├── Dockerfile                # Docker image
├── docker-compose.yml        # Docker orchestration
└── mkdocs.yml                # Documentation site
```

## Core Components

### 1. API Server (`api.py`)

FastAPI application providing REST API endpoints.

**Key Features:**

- RESTful API design
- OpenAPI/Swagger documentation
- CORS middleware
- File upload handling
- Error handling
- Request validation

**Main Routes:**

```python
@app.post("/api/iodd/upload")      # Upload IODD file
@app.get("/api/devices")           # List devices
@app.get("/api/devices/{vid}/{did}") # Device details
@app.get("/api/devices/{vid}/{did}/parameters") # Parameters
@app.post("/api/adapters/generate") # Generate adapter
@app.delete("/api/devices/{vid}/{did}") # Delete device
```

### 2. IODD Parser (`iodd_manager.py`)

Core XML parsing and data extraction logic.

**Classes:**

```python
class IODDManager:
    """Main manager class"""
    def __init__(self, db_path: str)
    def parse_iodd(self, xml_path: str) -> Dict
    def import_iodd(self, xml_path: str) -> bool
    def generate_adapter(self, vendor_id, device_id, platform) -> str

class IODDParser:
    """XML parsing logic"""
    def parse(self, xml_content: str) -> Dict
    def extract_device_identity(self, root: Element) -> Dict
    def extract_parameters(self, root: Element) -> List[Dict]
    def extract_process_data(self, root: Element) -> Dict

class DatabaseStorage:
    """Database operations"""
    def save_device(self, device_data: Dict)
    def get_device(self, vendor_id: int, device_id: int) -> Dict
    def list_devices(self, filters: Dict) -> List[Dict]
    def delete_device(self, vendor_id: int, device_id: int)
```

### 3. Configuration (`config.py`)

Centralized configuration using environment variables.

**Structure:**

```python
# Load .env file
load_dotenv()

# Application settings
ENVIRONMENT = os.getenv('ENVIRONMENT', 'development')
DEBUG = os.getenv('DEBUG', 'false').lower() == 'true'

# API settings
API_HOST = os.getenv('API_HOST', '127.0.0.1')
API_PORT = int(os.getenv('API_PORT', '8000'))

# Database settings
IODD_DATABASE_URL = os.getenv('IODD_DATABASE_URL', 'sqlite:///./iodd_manager.db')

# Helper functions
def print_config():
    """Display current configuration"""
    pass
```

### 4. Frontend (`frontend/src/`)

React single-page application.

**Component Hierarchy:**

```
App.jsx (Main Dashboard)
├── Header
│   ├── Logo
│   ├── SearchBar
│   └── SettingsButton
├── StatisticsCards
│   ├── DeviceCount
│   ├── VendorCount
│   └── AdapterCount
├── DeviceTable
│   ├── TableHeader
│   ├── TableBody
│   │   └── DeviceRow[]
│   └── Pagination
├── DeviceDetail (Dialog)
│   ├── Overview
│   ├── Parameters
│   ├── ProcessData
│   └── Actions
└── UploadSection
    └── FileUploader
```

**Key Components:**

- **App.jsx**: Main dashboard with state management
- **ui.jsx**: Reusable UI components (Button, Card, Dialog, Table, etc.)
- **main.jsx**: React app initialization and mounting

### 5. Database Schema

SQLite database with 4 main tables.

**Tables:**

```sql
-- Device information
devices (
    id INTEGER PRIMARY KEY,
    vendor_id INTEGER NOT NULL,
    device_id INTEGER NOT NULL,
    vendor_name TEXT,
    device_name TEXT,
    product_text TEXT,
    version TEXT,
    release_date TEXT,
    imported_at TIMESTAMP,
    UNIQUE(vendor_id, device_id)
)

-- IODD file metadata
iodd_files (
    id INTEGER PRIMARY KEY,
    device_id INTEGER REFERENCES devices(id),
    file_path TEXT UNIQUE,
    file_size INTEGER,
    checksum TEXT,
    uploaded_at TIMESTAMP
)

-- Device parameters
parameters (
    id INTEGER PRIMARY KEY,
    device_id INTEGER REFERENCES devices(id),
    index INTEGER,
    name TEXT,
    access TEXT,
    data_type TEXT,
    default_value TEXT,
    min_value TEXT,
    max_value TEXT,
    unit TEXT,
    description TEXT
)

-- Generated adapters
generated_adapters (
    id INTEGER PRIMARY KEY,
    device_id INTEGER REFERENCES devices(id),
    target_platform TEXT,
    file_path TEXT,
    generated_at TIMESTAMP
)
```

## Data Flow

### IODD Import Flow

```
1. User uploads IODD file (.xml)
   │
   ├─▶ Frontend: FormData with file
   │
2. API validates file
   │
   ├─▶ Check size (<10MB)
   ├─▶ Check extension (.xml, .iodd)
   ├─▶ Validate UTF-8 encoding
   │
3. Parser extracts data
   │
   ├─▶ Parse XML structure
   ├─▶ Extract DeviceIdentity
   ├─▶ Extract Parameters
   ├─▶ Extract ProcessData
   │
4. Database storage
   │
   ├─▶ Save device info
   ├─▶ Save parameters
   ├─▶ Store file path
   │
5. Return response
   │
   └─▶ Success message + device data
```

### Adapter Generation Flow

```
1. User requests adapter generation
   │
   ├─▶ Specify vendor_id, device_id, platform
   │
2. Load device data
   │
   ├─▶ Query database for device
   ├─▶ Load parameters
   ├─▶ Load process data structure
   │
3. Template selection
   │
   ├─▶ Choose platform template
   │   ├─▶ Node-RED: JSON template
   │   ├─▶ Python: Jinja2 template
   │   └─▶ Custom: User template
   │
4. Code generation
   │
   ├─▶ Render template with device data
   ├─▶ Format output
   ├─▶ Add metadata/comments
   │
5. Save and return
   │
   ├─▶ Save to generated/ directory
   └─▶ Return file content
```

## Design Patterns

### 1. Repository Pattern

Database access abstracted through repository classes:

```python
class DeviceRepository:
    def __init__(self, db_session):
        self.session = db_session

    def get_by_id(self, vendor_id, device_id):
        return self.session.query(Device).filter_by(
            vendor_id=vendor_id,
            device_id=device_id
        ).first()

    def save(self, device):
        self.session.add(device)
        self.session.commit()
```

### 2. Service Layer

Business logic separated from API endpoints:

```python
class IODDService:
    def __init__(self, repository):
        self.repo = repository

    def import_iodd(self, file_content):
        # Parse, validate, save
        pass

    def generate_adapter(self, vendor_id, device_id, platform):
        # Load device, generate code
        pass
```

### 3. Factory Pattern

Adapter generation uses factory pattern:

```python
class AdapterFactory:
    @staticmethod
    def create(platform: str) -> BaseAdapter:
        if platform == "nodered":
            return NodeRedAdapter()
        elif platform == "python":
            return PythonAdapter()
        elif platform == "cpp":
            return CppAdapter()
        else:
            raise ValueError(f"Unknown platform: {platform}")
```

## API Design Principles

### RESTful Design

- Resources identified by URLs
- HTTP methods for CRUD operations
- Stateless requests
- JSON responses

### Error Handling

Consistent error response format:

```json
{
  "status": "error",
  "message": "Human-readable message",
  "code": "ERROR_CODE",
  "details": {}
}
```

### Validation

Input validation at multiple layers:

1. **Pydantic models**: Request/response validation
2. **Business logic**: Domain rules
3. **Database constraints**: Data integrity

## Security Considerations

### 1. Input Validation

- File size limits (10MB)
- File type checking (.xml, .iodd)
- XML content validation
- SQL injection protection (parameterized queries)

### 2. CORS Policy

Restricted to specific origins:

```python
allow_origins=[
    "http://localhost:3000",
    "http://127.0.0.1:3000"
]
```

### 3. File Handling

- Secure file storage with organized structure
- Filename sanitization
- Path traversal prevention

## Performance Optimizations

### 1. Database Indexes

Key columns indexed for fast queries:

```sql
CREATE INDEX ix_devices_vendor_id ON devices(vendor_id);
CREATE INDEX ix_devices_device_id ON devices(device_id);
CREATE INDEX ix_parameters_device_id ON parameters(device_id);
```

### 2. Frontend Code Splitting

Vite configuration for optimized bundles:

```javascript
manualChunks: {
  'react-vendor': ['react', 'react-dom'],
  '3d-vendor': ['three', '@react-three/fiber'],
  'ui-vendor': ['framer-motion', 'lucide-react'],
}
```

### 3. Caching Strategy

- Static assets: Long-term caching
- API responses: Conditional requests
- Database queries: Connection pooling

## Testing Strategy

### Test Pyramid

```
       ┌─────────────┐
       │   E2E (5%)  │
       ├─────────────┤
       │Integration  │
       │    (20%)    │
       ├─────────────┤
       │   Unit      │
       │   Tests     │
       │   (75%)     │
       └─────────────┘
```

### Test Types

- **Unit Tests**: Individual functions/methods
- **Integration Tests**: API endpoints, database operations
- **End-to-End Tests**: Full user workflows (planned)

## Deployment Architecture

### Development

```
localhost:3000 (Frontend) → localhost:8000 (API) → SQLite DB
```

### Production (Docker)

```
nginx:80 → iodd-manager:8000 → Persistent Volume
```

## Extension Points

### 1. New Adapter Platforms

Add new platform adapter:

```python
class CustomAdapter(BaseAdapter):
    def generate(self, device_data: Dict) -> str:
        # Custom generation logic
        pass

# Register in factory
AdapterFactory.register("custom", CustomAdapter)
```

### 2. Additional API Endpoints

Follow existing patterns:

```python
@app.get("/api/custom/endpoint")
async def custom_endpoint():
    # Implementation
    pass
```

### 3. Custom Parsers

Extend parsing logic:

```python
class CustomParser(IODDParser):
    def parse_custom_section(self, root: Element):
        # Custom parsing logic
        pass
```

## Next Steps

- **[Setup Guide](setup.md)** - Set up development environment
- **[Testing Guide](testing.md)** - Write and run tests
- **[Contributing](contributing.md)** - Contribution guidelines
- **[Code Quality](code-quality.md)** - Standards and best practices

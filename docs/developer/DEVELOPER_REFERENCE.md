# IODD Manager Developer Reference

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Backend API](#backend-api)
3. [Frontend Development](#frontend-development)
4. [Database Schema](#database-schema)
5. [IODD Parsing](#iodd-parsing)
6. [Code Conventions](#code-conventions)
7. [Testing](#testing)
8. [Contributing](#contributing)

---

## Architecture Overview

See [ARCHITECTURE.md](ARCHITECTURE.md) for detailed system architecture.

**Technology Stack:**
- **Backend:** Python 3.8+, FastAPI, SQLite/PostgreSQL
- **Frontend:** React 18, Vite, TailwindCSS, shadcn/ui
- **Database:** SQLite (default), PostgreSQL (production)
- **XML Parsing:** xml.etree.ElementTree
- **API Documentation:** OpenAPI 3.0 (Swagger UI)

---

## Backend API

### Core Modules

**`api.py`** - FastAPI application with REST endpoints
**`iodd_manager.py`** - Core IODD parsing and management logic
**`config.py`** - Configuration management

### Key API Endpoints

**Device Management:**
```python
GET    /api/iodd              # List all devices
GET    /api/iodd/{id}         # Get device details
POST   /api/iodd/upload       # Import IODD/ZIP file
DELETE /api/iodd/{id}         # Delete device
POST   /api/iodd/bulk-delete  # Delete multiple devices
POST   /api/iodd/reset        # Reset entire database
```

**Device Data:**
```python
GET /api/iodd/{id}/parameters      # Device parameters
GET /api/iodd/{id}/errors          # Error codes
GET /api/iodd/{id}/events          # Event definitions
GET /api/iodd/{id}/processdata     # Process data structures
GET /api/iodd/{id}/menus           # UI menu structure
GET /api/iodd/{id}/config-schema   # Enriched config schema
GET /api/iodd/{id}/assets          # Device assets (images)
GET /api/iodd/{id}/xml             # Raw XML source
```

**System:**
```python
GET /api/health                    # Health check
GET /api/stats                     # System statistics
```

For complete API documentation, see `docs/API_SPECIFICATION.md`.

### Adding New Endpoints

```python
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

# Define request/response models
class MyRequest(BaseModel):
    field: str

class MyResponse(BaseModel):
    result: str

# Add endpoint
@app.post("/api/my-endpoint", response_model=MyResponse)
async def my_endpoint(request: MyRequest):
    """Endpoint description"""
    # Implementation
    return MyResponse(result="success")
```

---

## Frontend Development

### Project Structure
```
frontend/
├── src/
│   ├── App.jsx              # Main application component
│   ├── main.jsx             # Entry point
│   ├── index.css            # Global styles
│   └── components/
│       └── ui/              # shadcn/ui components
├── public/                  # Static assets
└── package.json
```

### Key Components

**`IODDManager`** - Main app shell and routing
**`DeviceLibrary`** - Device list and search
**`DeviceDetailsPage`** - Device detail views with tabs
**`MenuItemDisplay`** - Interactive menu rendering
**`InteractiveParameterControl`** - Parameter input controls

### State Management

Uses React hooks for state:
- `useState` - Component state
- `useEffect` - Side effects (API calls)
- `useMemo` - Computed values

### API Communication

```javascript
import axios from 'axios';

const API_BASE = 'http://localhost:8000';

// Fetch devices
const response = await axios.get(`${API_BASE}/api/iodd`);
const devices = response.data;

// Upload file
const formData = new FormData();
formData.append('file', file);
await axios.post(`${API_BASE}/api/iodd/upload`, formData);
```

### Adding New Features

1. Create component in `src/components/`
2. Import into `App.jsx`
3. Add to appropriate section
4. Connect to API endpoints
5. Test in development mode

---

## Database Schema

### Main Tables

**`iodd_devices`** - Device metadata
```sql
id, vendor_id, device_id, product_name, manufacturer,
iodd_version, xml_content, import_date
```

**`parameters`** - Device parameters
```sql
id, device_id, index, name, data_type, access_rights,
default_value, min_value, max_value, unit, description,
enumeration_values, bit_length
```

**`iodd_assets`** - Device assets (images, docs)
```sql
id, device_id, file_name, file_type, content_type,
data, image_purpose
```

**`errors`** - Error definitions
```sql
id, device_id, code, additional_code, name, description
```

**`events`** - Event definitions
```sql
id, device_id, code, name, description, event_type
```

**`process_data`** - Process data structures
```sql
id, device_id, pd_id, name, direction, bit_length,
data_type, description
```

**`record_items`** - Process data record items
```sql
id, process_data_id, subindex, name, bit_offset, bit_length,
data_type, default_value
```

**`ui_menus`** - User interface menu structures
```sql
id, device_id, menu_id, name, parent_menu_id
```

**`menu_items`** - Menu item definitions
```sql
id, menu_id, variable_id, record_item_ref, subindex,
access_right_restriction, display_format, unit_code,
button_value, menu_ref
```

---

## IODD Parsing

### Core Parser Class

**`IODDParser`** in `iodd_manager.py`

**Key Methods:**
```python
_extract_device_info()        # Parse device identification
_extract_parameters()          # Extract all variables
_parse_variable_element()      # Parse Variable elements
_parse_std_variable_ref()      # Parse standard IO-Link vars
_extract_process_data()        # Parse process data
_extract_ui_menus()            # Parse menu structure
_extract_assets()              # Extract embedded assets
```

### Standard IO-Link Variables

19+ standard variables defined in IO-Link specification:
- `V_VendorName`, `V_ProductName`, `V_SerialNumber`
- `V_HardwareRevision`, `V_FirmwareRevision`
- `V_ApplicationSpecificTag`, `V_FunctionSpecificTag`, `V_LocationSpecificTag`
- `V_DeviceStatus`, `V_SystemCommand`, `V_DetailedDeviceStatus`
- And more...

### Custom Datatype Resolution

```python
def _build_datatype_lookup(self):
    """Build lookup table for custom datatypes"""
    lookup = {}
    for datatype_elem in self.root.findall('.//iodd:Datatypes/*', self.NAMESPACES):
        dt_id = datatype_elem.get('id')
        # Parse datatype definition
        lookup[dt_id] = parsed_info
    return lookup
```

---

## Code Conventions

### Python (Backend)
- **Style:** PEP 8
- **Docstrings:** Google style
- **Type Hints:** Required for public APIs
- **Linting:** pylint, black
- **Max Line Length:** 100 characters

```python
def function_name(param: str, optional: int = 0) -> Dict[str, Any]:
    """Brief description.

    Args:
        param: Description of param
        optional: Description of optional param

    Returns:
        Dictionary containing result

    Raises:
        ValueError: If param is invalid
    """
    pass
```

### JavaScript/React (Frontend)
- **Style:** ESLint + Prettier
- **Components:** Functional components with hooks
- **Props:** Destructure in function signature
- **State:** Use hooks (useState, useEffect, useMemo)

```javascript
const MyComponent = ({ prop1, prop2, onAction }) => {
  const [state, setState] = useState(initialValue);

  useEffect(() => {
    // Side effects
  }, [dependencies]);

  return <div>{/* JSX */}</div>;
};
```

---

## Testing

### Backend Tests

**Run all tests:**
```bash
pytest
```

**Run with coverage:**
```bash
pytest --cov=. --cov-report=html
```

**Test structure:**
```
tests/
├── test_api.py           # API endpoint tests
├── test_iodd_parser.py   # Parser unit tests
└── test_integration.py   # Integration tests
```

### Frontend Tests

```bash
cd frontend
npm test
```

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines.

**Quick checklist:**
- [ ] Code follows style conventions
- [ ] All tests pass
- [ ] Docstrings/comments added
- [ ] CHANGELOG.md updated
- [ ] No breaking changes (or documented)

---

For API reference, see `docs/API_SPECIFICATION.md`.
For UI best practices, see `docs/BEST_PRACTICES.md`.

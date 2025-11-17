# Greenstack API Specification

**Version:** 2.0
**Base URL:** `http://localhost:8000`
**Content-Type:** `application/json`

---

## Configuration Schema Endpoint

### GET /api/iodd/{device_id}/config-schema

**Purpose:** Retrieve enriched menu structure with full parameter details for building device configuration pages.

**Parameters:**
- `device_id` (path, integer, required) - Device database ID

**Response:** `200 OK`

```json
{
  "menus": [
    {
      "id": "M_Parameters",
      "name": "Parameters",
      "items": [
        {
          "variable_id": "V_LEDIntensity",
          "record_item_ref": null,
          "subindex": null,
          "access_right_restriction": "rw",
          "display_format": "Dec",
          "unit_code": "1342",
          "button_value": null,
          "menu_ref": null,
          "parameter": {
            "id": 42,
            "name": "LED Intensity",
            "data_type": "UIntegerT",
            "access_rights": "rw",
            "default_value": "50",
            "min_value": "0",
            "max_value": "100",
            "unit": "%",
            "description": "Adjusts the brightness of the LED indicator",
            "enumeration_values": {},
            "bit_length": 8
          }
        },
        {
          "variable_id": null,
          "record_item_ref": null,
          "subindex": null,
          "access_right_restriction": null,
          "display_format": null,
          "unit_code": null,
          "button_value": null,
          "menu_ref": "ME_Advanced",
          "parameter": null
        }
      ]
    }
  ],
  "role_mappings": {
    "observer": {
      "IdentificationMenu": "M_Identification",
      "ObservationMenu": "M_Observation"
    },
    "maintenance": {
      "IdentificationMenu": "M_Identification",
      "ParameterMenu": "M_Parameters",
      "ObservationMenu": "M_Observation"
    },
    "specialist": {
      "IdentificationMenu": "M_Identification",
      "ParameterMenu": "M_Parameters",
      "ObservationMenu": "M_Observation",
      "DiagnosisMenu": "M_Diagnosis"
    }
  }
}
```

**Error Responses:**
- `404 Not Found` - Device not found
- `500 Internal Server Error` - Database error

---

## Menu Item Types Reference

### VariableRef Item
```json
{
  "variable_id": "V_LEDIntensity",
  "access_right_restriction": "rw",
  "display_format": "Dec",
  "unit_code": "1342",
  "parameter": { /* full parameter object */ }
}
```

### RecordItemRef Item
```json
{
  "record_item_ref": "V_Systemstate",
  "subindex": 2,
  "access_right_restriction": "ro",
  "display_format": "Dec",
  "parameter": { /* parameter for the parent record */ }
}
```

### MenuRef Item (Submenu)
```json
{
  "menu_ref": "ME_Advanced",
  "parameter": null
}
```

### Button Item
```json
{
  "variable_id": "V_SystemCommand",
  "button_value": "130",
  "parameter": { /* parameter object */ }
}
```

---

## Parameter Object Structure

```typescript
interface Parameter {
  id: number;                         // Database ID
  name: string;                       // Display name
  data_type: string;                  // IODDDataType (e.g., "UIntegerT", "BooleanT")
  access_rights: 'ro' | 'wo' | 'rw';  // Access permissions
  default_value: string | null;       // Default value
  min_value: string | null;           // Minimum value (for numeric types)
  max_value: string | null;           // Maximum value (for numeric types)
  unit: string | null;                // Human-readable unit (e.g., "%", "ms")
  description: string | null;         // Parameter description
  enumeration_values: {               // Valid enum values
    [value: string]: string;          // value → name mapping
  };
  bit_length: number | null;          // Bit length in memory
}
```

---

## Data Type Reference

| IODD Type | Description | Example Values |
|-----------|-------------|----------------|
| `BooleanT` | Boolean | "0", "1", "true", "false" |
| `IntegerT` | Signed integer | "-100", "0", "100" |
| `UIntegerT` | Unsigned integer | "0", "255" |
| `Float32T` | 32-bit float | "3.14", "0.01" |
| `StringT` | Text string | "Device Name" |
| `OctetStringT` | Byte array | "0A:FF:3C" |
| `RecordT` | Structured data | Complex object |

---

## Display Format Reference

| Format | Description | Example |
|--------|-------------|---------|
| `Dec` | Decimal | 255 |
| `Hex` | Hexadecimal | 0xFF |
| `Bin` | Binary | 0b11111111 |

---

## Access Rights Reference

| Rights | Description | Usage |
|--------|-------------|-------|
| `ro` | Read-only | Monitoring values, status |
| `wo` | Write-only | Commands, actions |
| `rw` | Read-write | Configuration parameters |

---

## Role Mapping Reference

### Standard Menu Types

| Menu Type | Purpose | Typical Content |
|-----------|---------|-----------------|
| `IdentificationMenu` | Device info | Vendor, product, serial number |
| `ParameterMenu` | Configuration | Adjustable device settings |
| `ObservationMenu` | Monitoring | Runtime values, measurements |
| `DiagnosisMenu` | Diagnostics | Error states, logs |

### Role Hierarchy

```
Specialist (Full Access)
    └─ Can access: Identification, Parameter, Observation, Diagnosis

Maintenance
    └─ Can access: Identification, Parameter, Observation

Observer (Read-Only)
    └─ Can access: Identification, Observation
```

---

## Usage Examples

### Fetch Config Schema
```javascript
const response = await fetch('/api/iodd/123/config-schema');
const schema = await response.json();

// Access menus
schema.menus.forEach(menu => {
  console.log(`Menu: ${menu.name} (${menu.items.length} items)`);
});

// Get menus for a specific role
const maintenanceMenuIds = Object.values(schema.role_mappings.maintenance);
const maintenanceMenus = schema.menus.filter(m =>
  maintenanceMenuIds.includes(m.id)
);
```

### Filter Parameters by Access Rights
```javascript
const readWriteParams = menu.items.filter(item =>
  item.parameter &&
  item.access_right_restriction === 'rw'
);
```

### Build Enumeration Dropdown
```javascript
const item = menu.items[0];
if (item.parameter?.enumeration_values) {
  const options = Object.entries(item.parameter.enumeration_values).map(
    ([value, name]) => ({ value, label: name })
  );

  // Render dropdown with options
}
```

---

## Integration Notes

1. **CORS**: Ensure frontend is allowed to access API
2. **Authentication**: Add auth headers if required
3. **Caching**: Config schemas rarely change - consider caching
4. **Error Handling**: Always check for `parameter: null` (unresolved refs)
5. **Validation**: Use `min_value`/`max_value`/`enumeration_values` for client-side validation

---

## Related Endpoints

- `GET /api/iodd/{device_id}` - Basic device info
- `GET /api/iodd/{device_id}/parameters` - All parameters (no menu structure)
- `GET /api/iodd/{device_id}/menus` - Basic menu structure (no parameter details)
- `GET /api/iodd/{device_id}/processdata` - Process data configuration

---

**See Also:**
- `CONFIG_PAGE_DEVELOPER_GUIDE.md` - Implementation guide
- `BEST_PRACTICES.md` - UI generation best practices

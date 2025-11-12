# Device Configuration Page Developer Guide

**Author:** Claude Code
**Date:** 2025-11-12
**Version:** 1.0

## Table of Contents

1. [Overview](#overview)
2. [Understanding IODD Menu Structure](#understanding-iodd-menu-structure)
3. [Using the Config Schema API](#using-the-config-schema-api)
4. [Building Configuration Pages](#building-configuration-pages)
5. [Control Type Mapping](#control-type-mapping)
6. [Role-Based Access Control](#role-based-access-control)
7. [Validation & Error Handling](#validation--error-handling)
8. [Complete Example](#complete-example)

---

## Overview

This guide shows developers how to build device configuration pages using the IODD menu structure as a blueprint. The IODD (IO Device Description) contains manufacturer-recommended parameter organization that creates a natural, intuitive configuration experience.

### Key Benefits

✅ **Manufacturer Intent Preserved** - Uses exact organization and labels from device manufacturer
✅ **Automatic UI Generation** - Convert IODD data directly into form controls
✅ **Built-in Validation** - Min/max, enumerations, and data types included
✅ **Role-Based Security** - Observer, Maintenance, and Specialist access levels
✅ **Localization Ready** - All text already resolved from textId references

---

## Understanding IODD Menu Structure

### Menu Hierarchy

IODD menus use a hierarchical structure with three levels:

```
Menu Collection
├─ Menu (e.g., "Parameters")
│   ├─ Menu Item (VariableRef)
│   ├─ Menu Item (RecordItemRef)
│   ├─ Menu Item (MenuRef → Submenu)
│   └─ Menu Item (Button)
└─ Menu (e.g., "Diagnostics")
    └─ ...
```

### Menu Item Types

**1. VariableRef** (66% of items)
```xml
<VariableRef
    variableId="V_LEDIntensity"
    accessRightRestriction="rw"
    displayFormat="Dec"
    unitCode="1342"
/>
```
- Direct reference to a device parameter
- Most common type
- Use for standard configuration values

**2. RecordItemRef** (23% of items)
```xml
<RecordItemRef
    variableId="V_Systemstate"
    subindex="2"
    accessRightRestriction="ro"
/>
```
- Reference to specific field within structured data
- Access individual elements of complex parameters
- Example: Switching Point 1 vs Switching Point 2

**3. MenuRef** (11% of items)
```xml
<MenuRef menuId="ME_DetectionSpecification"/>
```
- Link to submenu for hierarchical organization
- Creates expandable sections
- Groups related parameters

**4. Button** (embedded in VariableRef)
```xml
<VariableRef variableId="V_SystemCommand">
    <Button buttonValue="130">
        <Description textId="BT_FactoryDefaults"/>
    </Button>
</VariableRef>
```
- Action buttons for commands
- Send specific values to trigger actions
- Examples: Teach-in, Factory Reset, Calibrate

---

## Using the Config Schema API

### Endpoint

```
GET /api/iodd/{device_id}/config-schema
```

### Response Structure

```json
{
  "menus": [
    {
      "id": "M_Parameters",
      "name": "Parameters",
      "items": [
        {
          "variable_id": "V_LEDIntensity",
          "access_right_restriction": "rw",
          "display_format": "Dec",
          "unit_code": "1342",
          "parameter": {
            "id": 42,
            "name": "LED Intensity",
            "data_type": "UIntegerT",
            "access_rights": "rw",
            "default_value": "50",
            "min_value": "0",
            "max_value": "100",
            "unit": "%",
            "description": "Adjusts LED brightness level",
            "enumeration_values": {},
            "bit_length": 8
          }
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

### Fetching Schema

```javascript
// React example
const [configSchema, setConfigSchema] = useState(null);

useEffect(() => {
  const fetchSchema = async () => {
    const response = await axios.get(
      `${API_BASE}/api/iodd/${deviceId}/config-schema`
    );
    setConfigSchema(response.data);
  };

  fetchSchema();
}, [deviceId]);
```

---

## Building Configuration Pages

### Page Layout Pattern

```
┌─────────────────────────────────────────────┐
│ Header: Device Name & Role Selector         │
├──────────────┬──────────────────────────────┤
│              │                              │
│  Menu Tree   │    Active Menu Content      │
│  Navigation  │                              │
│              │  [Parameter Controls]        │
│  □ Identity  │                              │
│  ▶ Parameters│  LED Intensity: [━━━●━━━] 50%│
│    • Basic   │  Response Time: [100] ms    │
│    • Advanced│  Output Logic:  [NPN ▼]     │
│  □ Diagnosis │                              │
│              │  [Apply] [Reset] [Export]    │
└──────────────┴──────────────────────────────┘
```

### Menu Tree Component

```jsx
const MenuTree = ({ menus, activeMenuId, onMenuSelect }) => {
  return (
    <div className="w-64 border-r p-4 space-y-2">
      {menus.map(menu => (
        <MenuTreeItem
          key={menu.id}
          menu={menu}
          active={activeMenuId === menu.id}
          onClick={() => onMenuSelect(menu.id)}
          depth={0}
        />
      ))}
    </div>
  );
};

const MenuTreeItem = ({ menu, active, onClick, depth }) => {
  const [expanded, setExpanded] = useState(true);

  // Check if menu has submenus (MenuRef items)
  const subMenuRefs = menu.items
    .filter(item => item.menu_ref)
    .map(item => item.menu_ref);

  return (
    <div style={{ marginLeft: `${depth * 16}px` }}>
      <button
        onClick={onClick}
        className={`
          w-full text-left px-3 py-2 rounded
          ${active ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'}
        `}
      >
        {subMenuRefs.length > 0 && (
          <ChevronIcon
            expanded={expanded}
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(!expanded);
            }}
          />
        )}
        {menu.name}
        <span className="text-xs ml-2 opacity-70">
          ({menu.items.length})
        </span>
      </button>

      {/* Recursive submenu rendering would go here */}
    </div>
  );
};
```

### Active Menu Content

```jsx
const MenuContent = ({ menu, onParameterChange }) => {
  return (
    <div className="p-6 space-y-4">
      <h2 className="text-2xl font-bold">{menu.name}</h2>

      {menu.items.map((item, idx) => {
        if (item.menu_ref) {
          return <SubMenuLink key={idx} menuRef={item.menu_ref} />;
        }

        if (item.button_value) {
          return <ActionButton key={idx} item={item} />;
        }

        if (item.parameter) {
          return (
            <ParameterControl
              key={idx}
              item={item}
              onChange={(value) => onParameterChange(item.variable_id, value)}
            />
          );
        }

        return null;
      })}
    </div>
  );
};
```

---

## Control Type Mapping

### Decision Tree

```
Has enumeration_values?
├─ YES → Dropdown / Radio Group
└─ NO → Is data_type Boolean?
    ├─ YES → Toggle / Checkbox
    └─ NO → Has min/max values?
        ├─ YES → Slider + Number Input
        └─ NO → Text Input
```

### Implementation

```jsx
const ParameterControl = ({ item, onChange }) => {
  const param = item.parameter;

  // Enumeration → Dropdown
  if (param.enumeration_values &&
      Object.keys(param.enumeration_values).length > 0) {
    return (
      <Select
        value={param.default_value}
        onChange={(e) => onChange(e.target.value)}
        disabled={item.access_right_restriction === 'ro'}
      >
        {Object.entries(param.enumeration_values).map(([value, name]) => (
          <option key={value} value={value}>{name}</option>
        ))}
      </Select>
    );
  }

  // Boolean → Toggle
  if (param.data_type?.toLowerCase().includes('bool')) {
    return (
      <Switch
        checked={param.default_value === '1'}
        onCheckedChange={(checked) => onChange(checked ? '1' : '0')}
        disabled={item.access_right_restriction === 'ro'}
      />
    );
  }

  // Numeric with range → Slider
  if (param.min_value !== null && param.max_value !== null) {
    return (
      <div className="space-y-2">
        <input
          type="range"
          min={param.min_value}
          max={param.max_value}
          value={param.default_value}
          onChange={(e) => onChange(e.target.value)}
          disabled={item.access_right_restriction === 'ro'}
        />
        <div className="flex justify-between text-sm">
          <span>{param.min_value}</span>
          <span>{param.default_value}{item.unit_code && ` ${item.unit_code}`}</span>
          <span>{param.max_value}</span>
        </div>
      </div>
    );
  }

  // Default → Text Input
  return (
    <input
      type="text"
      value={param.default_value}
      onChange={(e) => onChange(e.target.value)}
      disabled={item.access_right_restriction === 'ro'}
      placeholder={param.description}
    />
  );
};
```

### Display Format Handling

```javascript
const formatValue = (value, displayFormat, dataType) => {
  switch (displayFormat) {
    case 'Hex':
      return `0x${parseInt(value).toString(16).toUpperCase()}`;
    case 'Bin':
      return `0b${parseInt(value).toString(2)}`;
    case 'Dec':
    default:
      return value;
  }
};
```

---

## Role-Based Access Control

### Role Hierarchy

```
Specialist (Full Access)
    ├─ All Parameters (rw)
    ├─ All Diagnostics
    └─ Advanced Settings

Maintenance
    ├─ Operational Parameters (rw)
    ├─ Basic Diagnostics (ro)
    └─ Standard Observations

Observer (Read-Only)
    ├─ Identification (ro)
    └─ Current Status (ro)
```

### Implementation

```jsx
const ConfigPage = ({ deviceId, userRole = 'specialist' }) => {
  const [configSchema, setConfigSchema] = useState(null);

  // Filter menus by role
  const availableMenus = useMemo(() => {
    if (!configSchema) return [];

    const roleMenus = configSchema.role_mappings[userRole];
    const menuIds = Object.values(roleMenus);

    return configSchema.menus.filter(menu =>
      menuIds.includes(menu.id)
    );
  }, [configSchema, userRole]);

  // Filter parameters by access rights
  const canEdit = (item) => {
    const accessRights = item.access_right_restriction || item.parameter?.access_rights;

    if (userRole === 'observer') return false;
    if (accessRights === 'ro') return false;
    if (accessRights === 'wo' && userRole !== 'specialist') return false;

    return true;
  };

  return (
    <div className="flex">
      <MenuTree menus={availableMenus} />
      <MenuContent canEdit={canEdit} />
    </div>
  );
};
```

---

## Validation & Error Handling

### Client-Side Validation

```javascript
const validateParameter = (item, value) => {
  const param = item.parameter;
  const errors = [];

  // Check enumeration
  if (param.enumeration_values &&
      !Object.keys(param.enumeration_values).includes(value)) {
    errors.push(`Invalid value. Must be one of: ${Object.keys(param.enumeration_values).join(', ')}`);
  }

  // Check range
  if (param.min_value !== null && parseInt(value) < parseInt(param.min_value)) {
    errors.push(`Value must be >= ${param.min_value}`);
  }

  if (param.max_value !== null && parseInt(value) > parseInt(param.max_value)) {
    errors.push(`Value must be <= ${param.max_value}`);
  }

  // Check data type
  if (param.data_type.includes('Integer') && !Number.isInteger(parseFloat(value))) {
    errors.push('Value must be an integer');
  }

  return errors;
};
```

### Error Display

```jsx
const ParameterWithValidation = ({ item, value, onChange }) => {
  const [errors, setErrors] = useState([]);

  const handleChange = (newValue) => {
    const validationErrors = validateParameter(item, newValue);
    setErrors(validationErrors);

    if (validationErrors.length === 0) {
      onChange(newValue);
    }
  };

  return (
    <div>
      <ParameterControl item={item} onChange={handleChange} />
      {errors.length > 0 && (
        <div className="text-red-500 text-sm mt-1">
          {errors.map((error, idx) => (
            <div key={idx}>• {error}</div>
          ))}
        </div>
      )}
    </div>
  );
};
```

---

## Complete Example

### Full Config Page Component

```jsx
import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';

const DeviceConfigPage = ({ deviceId, userRole = 'specialist' }) => {
  const [configSchema, setConfigSchema] = useState(null);
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [parameterValues, setParameterValues] = useState({});
  const [loading, setLoading] = useState(true);

  // Fetch configuration schema
  useEffect(() => {
    const fetchSchema = async () => {
      try {
        const response = await axios.get(
          `/api/iodd/${deviceId}/config-schema`
        );
        setConfigSchema(response.data);

        // Set default active menu
        if (response.data.menus.length > 0) {
          setActiveMenuId(response.data.menus[0].id);
        }

        // Initialize parameter values with defaults
        const defaults = {};
        response.data.menus.forEach(menu => {
          menu.items.forEach(item => {
            if (item.parameter) {
              defaults[item.variable_id] = item.parameter.default_value;
            }
          });
        });
        setParameterValues(defaults);

      } catch (error) {
        console.error('Failed to fetch config schema:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSchema();
  }, [deviceId]);

  // Filter menus by role
  const availableMenus = useMemo(() => {
    if (!configSchema) return [];

    const roleMenus = configSchema.role_mappings[userRole];
    const menuIds = Object.values(roleMenus);

    return configSchema.menus.filter(menu =>
      menuIds.includes(menu.id)
    );
  }, [configSchema, userRole]);

  const activeMenu = useMemo(() => {
    return availableMenus.find(m => m.id === activeMenuId);
  }, [availableMenus, activeMenuId]);

  const handleParameterChange = (variableId, value) => {
    setParameterValues(prev => ({
      ...prev,
      [variableId]: value
    }));
  };

  const handleApplyChanges = async () => {
    try {
      // TODO: Send parameter changes to device via IO-Link master
      console.log('Applying changes:', parameterValues);
    } catch (error) {
      console.error('Failed to apply changes:', error);
    }
  };

  if (loading) {
    return <div>Loading configuration...</div>;
  }

  if (!configSchema) {
    return <div>No configuration available for this device</div>;
  }

  return (
    <div className="flex h-screen">
      {/* Left Sidebar - Menu Navigation */}
      <div className="w-64 border-r bg-gray-50 p-4 overflow-y-auto">
        <h2 className="font-bold mb-4">Configuration</h2>
        {availableMenus.map(menu => (
          <button
            key={menu.id}
            onClick={() => setActiveMenuId(menu.id)}
            className={`
              w-full text-left px-3 py-2 rounded mb-1
              ${activeMenuId === menu.id
                ? 'bg-blue-500 text-white'
                : 'hover:bg-gray-200'}
            `}
          >
            {menu.name}
            <span className="text-xs ml-2 opacity-70">
              ({menu.items.length})
            </span>
          </button>
        ))}
      </div>

      {/* Main Content - Parameter Controls */}
      <div className="flex-1 p-6 overflow-y-auto">
        {activeMenu && (
          <>
            <h1 className="text-3xl font-bold mb-6">{activeMenu.name}</h1>

            <div className="space-y-6 max-w-2xl">
              {activeMenu.items.map((item, idx) => (
                <div key={idx} className="border rounded-lg p-4">
                  {item.parameter ? (
                    <ParameterControl
                      item={item}
                      value={parameterValues[item.variable_id]}
                      onChange={(value) =>
                        handleParameterChange(item.variable_id, value)
                      }
                    />
                  ) : item.menu_ref ? (
                    <button
                      onClick={() => {
                        const submenu = availableMenus.find(
                          m => m.id === item.menu_ref
                        );
                        if (submenu) setActiveMenuId(submenu.id);
                      }}
                      className="text-blue-500 hover:underline flex items-center"
                    >
                      → {item.menu_ref}
                    </button>
                  ) : item.button_value ? (
                    <button className="bg-orange-500 text-white px-4 py-2 rounded">
                      Execute Action (Value: {item.button_value})
                    </button>
                  ) : null}
                </div>
              ))}
            </div>

            <div className="mt-8 flex gap-4">
              <button
                onClick={handleApplyChanges}
                className="bg-blue-500 text-white px-6 py-2 rounded"
              >
                Apply Changes
              </button>
              <button
                onClick={() => {
                  // Reset to defaults
                  const defaults = {};
                  activeMenu.items.forEach(item => {
                    if (item.parameter) {
                      defaults[item.variable_id] = item.parameter.default_value;
                    }
                  });
                  setParameterValues(prev => ({ ...prev, ...defaults }));
                }}
                className="bg-gray-500 text-white px-6 py-2 rounded"
              >
                Reset to Defaults
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DeviceConfigPage;
```

---

## Next Steps

1. **Review the enhanced Menus tab** in the application - it demonstrates all these concepts
2. **Explore the `/api/iodd/{device_id}/config-schema` endpoint** with your devices
3. **Build a proof-of-concept config page** for one device
4. **Test role-based filtering** with different user roles
5. **Implement parameter writing** via IO-Link master integration

---

## Additional Resources

- `API_SPECIFICATION.md` - Complete API documentation
- `BEST_PRACTICES.md` - UI generation best practices
- `NESTED_ZIP_IMPORT.md` - Device package handling
- IODD Specification 1.1 - Official IO-Link standard

---

**Questions or Issues?** Check the enhanced Menus tab for a working reference implementation.

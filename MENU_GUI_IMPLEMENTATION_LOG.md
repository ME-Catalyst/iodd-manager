# IODD Menu GUI Implementation Log

**Feature**: Render IODD UserInterface menus as actual device GUI in Menus tab
**Started**: 2025-11-20
**Status**: IN PROGRESS

## Overview
Transform the parsed IODD UserInterface menu structure into a fully functional, interactive device GUI that displays menus exactly as defined in the IODD file, with proper text resolution, parameter values, and role-based menu sets.

## Architecture Plan

### Phase 1: Backend API Setup
- [ ] Create `/api/iodd/{device_id}/menus` endpoint
  - Fetch menus, menu_items, menu_roles from database
  - Resolve text IDs to actual text values
  - Include parameter metadata for each menu item
  - Support role filtering (observer, maintenance, specialist)

### Phase 2: Data Transformation Service
- [ ] Build text ID resolution service
  - Map textId references to actual text from iodd_text table
  - Handle multiple languages (default to 'en')
  - Cache text lookups for performance

- [ ] Parameter value lookup service
  - Fetch current/default values for variables
  - Resolve enumeration values
  - Format display values with units

### Phase 3: Frontend Component Architecture
- [ ] Create `IODDMenuRenderer.jsx` component
  - Main container component
  - Manages menu data fetching and state
  - Handles role selection

- [ ] Create `MenuRoleSelector.jsx` component
  - Toggle between Observer/Maintenance/Specialist roles
  - Visual indicators for each role type

- [ ] Create `MenuTabPanel.jsx` component
  - Tab interface for each menu (Identification, Parameter, Observation, etc.)
  - Badge showing item count per menu

- [ ] Create `MenuItemRenderer.jsx` component
  - Renders individual menu items (VariableRef, RecordItemRef)
  - Displays parameter name, value, description
  - Shows access rights, data type, units

### Phase 4: Integration
- [ ] Update MenusTab.jsx to use IODDMenuRenderer
- [ ] Add loading states and error handling
- [ ] Ensure responsive design

### Phase 5: Testing & Polish
- [ ] Test with Device #56
- [ ] Verify all menu types render correctly
- [ ] Check role-based menu filtering
- [ ] Validate text ID resolution

## Database Schema Reference

### Tables Used
- `ui_menus`: Menu definitions (id, device_id, menu_id, name)
- `ui_menu_items`: Menu item references (menu_id, variable_id, record_item_ref, subindex, access_right_restriction, display_format, unit_code)
- `ui_menu_roles`: Role-to-menu mappings (device_id, role_type, menu_type, menu_id)
- `iodd_text`: Text translations (device_id, text_id, text_value, language_code)
- `parameters`: Parameter metadata (device_id, param_index, name, data_type, default_value, etc.)

## Progress Log

### 2025-11-20 - Session Start
- Created implementation plan
- Set up work log structure
- Identified all required components and services
- **Next**: Create backend API endpoint

### 2025-11-20 - Step 1: Backend API Endpoint
- ✅ Created `src/routes/iodd_routes.py` with `/api/iodd/{device_id}/menus` endpoint
- ✅ Implemented complete menu data retrieval with text resolution
- ✅ Added parameter metadata lookup for menu items
- ✅ Included role-based menu sets (observer, maintenance, specialist)
- ✅ Registered router in `src/api.py`
- Features:
  - Fetches all menus for a device with items
  - Resolves text IDs to actual text values
  - Includes parameter data (name, type, defaults, ranges, enumerations)
  - Supports role filtering via query parameter
  - Returns structured data with Pydantic models
- **Next**: Create frontend Menu Renderer component

### 2025-11-20 - Step 2: Frontend Component Integration
- ✅ Created `frontend/src/components/device-details/IODDMenuRenderer.jsx` (355 lines)
- ✅ Integrated IODDMenuRenderer into `MenusTab.jsx`
- ✅ Added API_BASE prop to MenusTab component
- Component Features:
  - Role selector with Observer/Maintenance/Specialist roles
  - Tab interface for menu types (Identification/Parameter/Observation/Diagnosis)
  - Rich parameter display with metadata (type, access rights, ranges, enumerations)
  - Support for all menu item types (VariableRef, RecordItemRef, Button, MenuRef)
  - Loading states and error handling with retry functionality
  - Color-coded access rights (ro/rw/wo)
  - Icon mapping for roles and menu types
  - Responsive design with Tailwind CSS
- **Next**: Test with Device #56 and verify functionality

### 2025-11-20 - Step 3: API Fixes & Testing
- ✅ Fixed database import (`get_db` → `get_db_connection`)
- ✅ Added fallback logic for menu items without parameter metadata
  - Standard IO-Link variables (V_VendorName, etc.) now use variable_id as display name
  - RecordItemRef items fallback to record_item_ref as display name
- ⚠️ Issues discovered during testing:
  - Role sets returning empty array (database has 9 roles for device 56)
  - Device ID returning null in response
  - Need to investigate role set query logic
- **Status**: API partially functional, needs additional debugging
- **Next**: Fix role_sets query and verify complete API response

### 2025-11-20 - Step 4: Database Connection Pattern Fix
- ✅ Root cause identified: `get_db_connection()` returns context manager, not direct connection
- ✅ Fixed by implementing local `get_db()` function (following pattern from pqa_routes.py)
- ✅ Removed problematic context manager import
- ✅ Added `import sqlite3` and direct connection pattern
- ✅ Fixed indentation issues from failed context manager attempt
- ✅ Moved `role_sets` creation outside for loop (was creating it inside loop)
- ✅ Added proper `conn.close()` before return
- ✅ Server started successfully and API tested
- ✅ **VERIFIED**: API endpoint working correctly:
  - `device_id: 56` (fixed - was null)
  - 7 menus with complete item data
  - 3 role sets (maintenance, observer, specialist) (fixed - was empty array)
  - All role sets have proper menu assignments
- **Status**: Backend API fully functional
- **Next**: Test frontend component in browser

---

## Completed Steps
1. ✅ Backend API endpoint `/api/iodd/{device_id}/menus` created and registered
2. ✅ IODDMenuRenderer component created and integrated with MenusTab
3. ✅ Fixed database connection issues and verified API works correctly
4. ✅ Verified role_sets and device_id bugs are resolved

## Current Step
**Step 5**: Test frontend component in browser with live data

## Blockers/Issues
- None currently

## Notes
- Menu data already parsed and stored from IODD files
- Device #56 has 7 menus with 44 menu items
- 3 role types with 3 menu assignments each (9 total role mappings)
- Text resolution is critical for proper display

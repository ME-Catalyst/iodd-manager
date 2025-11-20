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

---

## Completed Steps
<!-- Steps will be added here as they are completed -->

## Current Step
**Step 1**: Create backend API endpoint `/api/iodd/{device_id}/menus`

## Blockers/Issues
<!-- None yet -->

## Notes
- Menu data already parsed and stored from IODD files
- Device #56 has 7 menus with 44 menu items
- 3 role types with 3 menu assignments each (9 total role mappings)
- Text resolution is critical for proper display

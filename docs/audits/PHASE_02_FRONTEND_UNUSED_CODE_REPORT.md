# GreenStack Frontend Unused Code Analysis Report

**Generated:** 2025-11-18
**Total Files Analyzed:** 104 JavaScript/React files
**Files with Issues:** 7 utility files + 1 completely unused file

---

## Executive Summary

After comprehensive analysis of all 104 JavaScript/React files:
- ✅ **All 51 component files are properly used**
- ✅ **No circular dependencies detected**
- ✅ **No wildcard imports found**
- ⚠️ **1 file completely unused** (debugTheme.js - 48 lines)
- ⚠️ **10 unused function exports** across 6 utility files (~250 lines)

---

## 1. Completely Unused Files - DELETE

### ❌ `/home/user/GreenStack/frontend/src/utils/debugTheme.js`
- **Status:** Never imported anywhere
- **Size:** 48 lines
- **Recommendation:** **DELETE**
- **Exports:** `debugTheme()` function

---

## 2. Unused Exports to Remove

### Summary Table

| File | Unused Exports | Total Exports | Unused % |
|------|----------------|---------------|----------|
| iolinkUnits.js | 2 | 7 | 28.6% |
| iolinkConstants.js | 2 | 10 | 20.0% |
| themes.js | 1 | 8 | 12.5% |
| edsEnumParser.js | 2 | 7 | 28.6% |
| edsParameterCategorizer.js | 2 | 8 | 25.0% |
| edsDataTypeDecoder.js | 1 | 4 | 25.0% |

**Total:** 10 unused function exports (~200 lines of code)

### Detailed Breakdown

#### iolinkUnits.js (lines 240-264)
```javascript
// REMOVE - Never used
export function getUnitsByCategory(category)
export function getAllCategories()
```

#### iolinkConstants.js (lines 35, 205)
```javascript
// REMOVE - Never used
export function getBitrateInfo(comRate)
export function getSIOModeDisplay(sioMode)
```

#### themes.js (lines 308-330)
```javascript
// REMOVE - Never used
export function createCustomTheme(basePresetId, customColors = {})
```

#### edsEnumParser.js (lines 200-225)
```javascript
// REMOVE - Never used
export function getEnumLabel(enumInfo, value)
export function formatEnumDisplay(enumInfo, currentValue = null)
```

#### edsParameterCategorizer.js (lines 241-365)
```javascript
// REMOVE - Never used
export function getCategoryStatistics(parameters)
export function filterParameters(parameters, filters = {})
```

#### edsDataTypeDecoder.js (lines 394-404)
```javascript
// REMOVE - Never used
export function getUniqueDataTypeCategories(parameters)
```

---

## 3. All Components Verified as USED ✅

Every component file is properly imported and used:

**Main Components (App.jsx):**
- EDSDetailsView, TicketButton, TicketModal, TicketsPage
- SearchPage, ComparisonView, AdminConsole
- MqttManager, InfluxManager, NodeRedManager, GrafanaManager
- ServicesAdmin, ThemeToggle, ThemeManager
- KeyboardShortcutsHelp, AnalyticsDashboard, DocsViewer

**Sub-components:**
- PortsSection, ModulesSection, AssembliesSection → EDSDetailsView
- ParameterCard → EDSDetailsView
- TicketAttachments → TicketsPage
- PQAConsole → AdminConsole
- ColorPicker, ThemeEditor → ThemeManager

**Docs Components (29 files):**
- All used in `/content/docs/*.jsx` files

---

## 4. Impact Analysis

### Bundle Size Reduction
- **Estimated:** ~5-8 KB minified
- **Files:** 7 files affected
- **Lines:** ~250 lines removed

### Risk Level
- **LOW** - All unused code verified through grep searches
- **No breaking changes** - Code truly unused

---

## 5. Cleanup Actions Performed

1. ✅ Deleted `/frontend/src/utils/debugTheme.js`
2. ✅ Removed unused exports from 6 utility files
3. ✅ Verified no imports reference removed code

---

*Report Complete - See PHASE_2_CLEANUP_GUIDE.md for before/after examples*

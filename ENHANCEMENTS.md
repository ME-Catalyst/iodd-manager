# GreenStack Enhancement Roadmap

## Overview

This document outlines enhancement opportunities identified through deep analysis of GreenStack's database schemas and parsers. The platform currently captures exceptional device metadata from both EDS (EtherNet/IP) and IODD (IO-Link) files, but the Compare and Search tools leverage only ~20% of available data.

---

## Database Schema Summary

### EDS (EtherNet/IP) - 14+ Tables
- **eds_files**: Core device info, vendor, product, revisions, diagnostics
- **eds_parameters**: 21+ fields including scaling, units, help text, enumerations
- **eds_assemblies**: Fixed and variable assemblies with sizes and paths
- **eds_connections**: Network connections with transport specs and I/O flow
- **eds_modules**: Modular device configurations
- **eds_ports**: Port definitions and link numbers
- **eds_groups**: Parameter organization
- **eds_capacity**: Device capability limits
- **eds_diagnostics**: Parsing issues with severity tracking
- **eds_packages**: Package management and versioning

### IODD (IO-Link) - 8+ Tables
- **devices**: Core device metadata
- **parameters**: Variable definitions with access rights, units, enumerations
- **process_data**: Input/output process data structures
- **process_data_record_items**: Bit-level field definitions
- **error_types**: Error code definitions
- **events**: Event notifications
- **iodd_assets**: Binary assets (images, documentation)
- **iodd_files**: Raw XML storage

---

## Priority 1: Quick Wins (High Value, Low Effort)

### 1.1 Assembly Comparison Tab (EDS)
**Effort**: Low | **Value**: High | **Data**: Already in database

Add new tab to ComparisonView showing:
- Assembly number, name, type
- Size comparison (fixed vs variable)
- Assembly paths
- Help strings
- I/O configuration differences

**Implementation**:
- Query `eds_assemblies` and `eds_variable_assemblies` tables
- Render side-by-side comparison like parameters
- Highlight size mismatches

### 1.2 Process Data Comparison (IODD)
**Effort**: Low | **Value**: Critical | **Data**: Already in database

Add process data tab for IO-Link devices showing:
- Input/output process data structures
- Record items with bit offsets
- Bit length comparisons
- Data type alignment
- Direction (input/output)

**Implementation**:
- Query `process_data` and `process_data_record_items`
- Visual bit-field mapping
- Highlight incompatibilities

### 1.3 Export Comparison Results
**Effort**: Low | **Value**: High

Add export buttons to ComparisonView:
- **CSV Export**: Tabular format for spreadsheets
- **JSON Export**: Structured data for automation
- **PDF Report**: Formatted comparison document

**Implementation**:
- Add export buttons to comparison header
- Client-side CSV generation from comparison data
- Use jsPDF or browser print for PDF

### 1.4 Faceted Search Filters
**Effort**: Medium | **Value**: High

Add filter dropdowns to SearchPage:
- Filter by vendor (dropdown of all vendors)
- Filter by device type (EDS/IODD)
- Filter by data type (for parameters)
- Filter by access rights (ro/rw/wo)
- Filter by "has enumerations"
- Filter by "has scaling factors"

**Implementation**:
- Add filter UI components above search results
- Modify search API to accept filter parameters
- Add SQL WHERE clauses for each filter

---

## Priority 2: Medium-Term Enhancements

### 2.1 Enhanced Parameter Comparison
**Effort**: Medium | **Value**: High

Expand parameter comparison to show:
- **Enumeration Values**: Side-by-side enum comparison with value/label pairs
- **Scaling Factors**: Display all 4 scaling types (multiplier, divisor, base, offset)
- **Help Text**: Show all 3 levels of help strings
- **Link Paths**: Compare parameter addressing
- **Decimal Places**: Display formatting info

**Implementation**:
- Modify ComparisonView parameter rendering
- Add expandable rows for detailed metadata
- Parse JSON enum_values field
- Add "Show Details" toggle

### 2.2 Connection & Port Comparison (EDS)
**Effort**: Medium | **Value**: Medium

Add connections tab showing:
- Connection types and parameters
- Originator-to-Target (O->T) flow
- Target-to-Originator (T->O) flow
- Transport specifications
- Port configurations
- Configuration parts

**Implementation**:
- Query `eds_connections` and `eds_ports`
- Network topology visualization (optional)
- Connection parameter table

### 2.3 Numeric Range Search
**Effort**: Medium | **Value**: Medium

Add advanced search for numeric parameters:
- Min value range: `min_value BETWEEN x AND y`
- Max value range: `max_value < threshold`
- Default value search: `default_value = target`
- Combined queries: `min_value > 0 AND max_value < 100`

**Implementation**:
- Add range input fields to search UI
- Modify search API to handle numeric comparisons
- Support AND/OR boolean logic

### 2.4 Module Comparison (EDS Modular Devices)
**Effort**: Medium | **Value**: Medium

Add modules tab for modular EDS devices:
- Module catalog numbers
- Slot assignments
- I/O sizes (config, input, output)
- Device types
- Revision comparison

**Implementation**:
- Query `eds_modules` table
- Group by module slot
- Highlight configuration differences

---

## Priority 3: Advanced Features

### 3.1 Version Tracking & Comparison
**Effort**: High | **Value**: High

Leverage `is_latest_version` and `package_id` fields:
- Compare different firmware revisions of same device
- Track parameter additions/removals across versions
- Migration guides (parameter mapping changes)
- Deprecated feature warnings

**Implementation**:
- UI to select device versions
- Diff algorithm for parameter changes
- Version timeline visualization

### 3.2 Semantic Search
**Effort**: High | **Value**: High

Intelligent search capabilities:
- Search by functional category (temperature, pressure, flow sensors)
- Search by unit type (all devices measuring °C)
- Search by capability (devices with data storage)
- "Find similar devices" based on parameter overlap

**Implementation**:
- Category tagging system
- Unit normalization table
- Similarity scoring algorithm
- ML-based parameter classification (future)

### 3.3 Device Substitution Engine
**Effort**: High | **Value**: Very High

Find compatible replacement devices:
- Parameter compatibility scoring
- I/O assembly matching
- Connection compatibility
- Migration complexity analysis
- "Replace with..." recommendations

**Implementation**:
- Compatibility scoring algorithm
- Parameter mapping AI
- Breaking change detection
- Migration plan generator

### 3.4 Interactive Visualizations
**Effort**: High | **Value**: Medium

Visual representations:
- Parameter distribution charts (D3.js/Chart.js)
- Process data bit-field maps
- Network topology graphs (connections/ports)
- Assembly relationship diagrams

**Implementation**:
- D3.js for interactive charts
- Canvas for bit-field visualization
- Force-directed graph for topology

---

## Priority 4: Data Quality & Performance

### 4.1 Full-Text Search (FTS5)
**Effort**: Medium | **Value**: High

Replace LIKE queries with SQLite FTS5:
- Faster text searches (10-100x improvement)
- Relevance ranking
- Phrase matching
- Fuzzy matching

**Implementation**:
- Create FTS5 virtual tables for descriptions
- Rebuild search queries using FTS5 syntax
- Add relevance scoring to results

### 4.2 Enhanced Indexing
**Effort**: Low | **Value**: Medium

Add composite indexes:
- `(vendor_name, product_name)` for vendor browsing
- `(data_type, access_rights)` for filtered searches
- JSON indexes on `enum_values` (SQLite 3.38+)

**Implementation**:
- Create migration with new indexes
- Analyze query performance before/after

### 4.3 Enum Value Normalization
**Effort**: Medium | **Value**: Medium

Extract common enumerations to separate table:
- Enable cross-device enum analysis
- "Find all devices with ON/OFF enums"
- Standard enum templates
- Unit conversion tables

**Implementation**:
- New `standard_enums` table
- Link parameters to standard enums
- Migration to populate from existing JSON

---

## Quick Reference: Current vs. Enhanced Capabilities

| Feature | Current | Enhanced |
|---------|---------|----------|
| **Parameter Comparison** | Names, values, units | + Enums, scaling, help text, access rights |
| **Assembly Comparison** | ❌ None | ✅ Full assembly comparison |
| **Process Data (IODD)** | ❌ None | ✅ Bit-level I/O comparison |
| **Connection Comparison** | ❌ None | ✅ Network topology |
| **Search Filters** | Text only | + Vendor, type, numeric ranges, facets |
| **Version Tracking** | ❌ None | ✅ Revision history, migration guides |
| **Export** | ❌ None | ✅ CSV, JSON, PDF reports |
| **Device Recommendations** | ❌ None | ✅ Substitution suggestions |

---

## API Endpoints to Implement

### Comparison Enhancements
```
GET /api/eds/{id}/assemblies          # Get assemblies for comparison
GET /api/iodd/{id}/process-data       # Get process data for comparison
GET /api/compare/export?ids=1,2,3     # Export comparison as CSV/JSON/PDF
```

### Search Enhancements
```
GET /api/search/advanced              # Advanced search with filters
  ?vendor=Siemens
  &type=EDS
  &param_min_value_gt=100
  &has_enums=true

GET /api/search/facets                # Get available filter options
GET /api/search/similar/{id}          # Find similar devices
```

### Version & Analysis
```
GET /api/devices/{id}/versions        # Get all versions of device
GET /api/devices/compare-versions     # Compare different versions
  ?id=1&from_version=1.0&to_version=2.0

GET /api/devices/{id}/substitute      # Get replacement suggestions
```

---

## Data Model Extensions

### New Tables (Optional)
```sql
-- Standard enumeration templates
CREATE TABLE standard_enums (
    id INTEGER PRIMARY KEY,
    enum_name TEXT,          -- "ON/OFF", "ENABLED/DISABLED"
    category TEXT,           -- "Boolean", "State", etc.
    values JSON              -- [{value: 0, label: "OFF"}, ...]
);

-- Parameter to standard enum mapping
CREATE TABLE parameter_enum_mapping (
    parameter_id INTEGER,
    standard_enum_id INTEGER,
    FOREIGN KEY (parameter_id) REFERENCES eds_parameters(id)
);

-- Device compatibility matrix
CREATE TABLE device_compatibility (
    device1_id INTEGER,
    device2_id INTEGER,
    compatibility_score REAL,  -- 0.0 to 1.0
    compatible BOOLEAN,
    notes TEXT,
    last_analyzed TIMESTAMP
);
```

---

## Testing Strategy

### Unit Tests
- Parameter comparison logic
- Assembly data retrieval
- Export format validation
- Search filter SQL generation

### Integration Tests
- End-to-end comparison workflow
- Export file generation
- Advanced search queries
- Multi-device comparison (2-4 devices)

### Performance Tests
- Search response time with FTS5
- Comparison with 100+ parameters
- Export generation for large datasets

---

## Estimated Development Timeline

| Priority | Features | Effort | Timeline |
|----------|----------|--------|----------|
| P1 Quick Wins | Assembly tab, Process Data, Export, Facets | 2-3 weeks | Sprint 1 |
| P2 Medium-Term | Enhanced params, Connections, Modules, Range search | 4-6 weeks | Sprint 2-3 |
| P3 Advanced | Versioning, Semantic search, Substitution, Viz | 8-12 weeks | Sprint 4-6 |
| P4 Infrastructure | FTS5, Indexes, Enum normalization | 2-3 weeks | Parallel |

---

## Success Metrics

- **Comparison Depth**: Increase from 4 fields to 15+ fields per parameter
- **Search Precision**: Reduce irrelevant results by 50% with faceted filters
- **User Efficiency**: Reduce time to find compatible device by 70%
- **Data Utilization**: Increase from 20% to 80% of captured metadata displayed
- **Export Usage**: 30% of comparisons exported for documentation

---

## Technical Debt & Considerations

### Performance
- Current comparison loads all parameters - implement pagination for 500+ params
- Search LIKE queries inefficient - migrate to FTS5
- Consider caching frequently compared devices

### UI/UX
- Comparison table becomes crowded with 15+ columns - use expandable rows
- Mobile responsiveness for comparison view
- Keyboard shortcuts for power users

### Data Quality
- Some EDS files have parsing errors - surface diagnostics in comparison
- Enum values not standardized - normalization will improve search
- Missing unit conversions - add conversion factors

---

## References

- EDS Specification: ODVA Volume 1, Chapter 5
- IO-Link Specification: IEC 61131-9
- SQLite FTS5: https://www.sqlite.org/fts5.html
- Device data captured in: `alembic/versions/*.py` (schema migrations)
- Parsers: `eds_parser.py`, `iodd_manager.py`

---

**Document Version**: 1.0
**Last Updated**: 2025-01-14
**Author**: GreenStack Development Team

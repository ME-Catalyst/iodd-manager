# EDS Complete Capture Plan
## Goal: 100% EDS Content Preservation for Recreation & Code Generation

**Date:** 2025-01-14
**Objective:** Capture every section, field, and value from EDS files to enable:
1. Perfect EDS file recreation (byte-for-byte if needed)
2. Code generation for adapters/drivers
3. Full device configuration capabilities
4. Complete documentation generation

---

## Current State Analysis

### ✅ What We Currently Capture

1. **File Information** (`[File]` section)
   - DescText, CreateDate, CreateTime, ModDate, ModTime, Revision
   - FileName, FileVersion, FileChecksum

2. **Device Identity** (`[Device]` section)
   - VendorID, VendorName, ProductCode, ProductName, ProductType
   - MajorRevision, MinorRevision, CatalogNumber

3. **Device Classification** (`[Device Classification]` section)
   - Class1, Class2, Class3, Class4

4. **Parameters** (`[Params]` section)
   - Param definitions (link path, descriptor, data type, name, help strings, default/min/max)
   - **NEW:** Enum sections (Enum22, Enum23, etc.)

5. **Connections** (`[Connection Manager]` section)
   - Connection definitions with trigger/transport, params, assemblies, paths

6. **Ports** (`[Port]` section)
   - Port definitions with types and paths

7. **Capacity** (`[Capacity]` section)
   - MaxIOConnections, MaxMsgConnections, TSpec definitions

8. **Full EDS Content**
   - Raw EDS file text stored in `eds_content` field

---

## ❌ Critical Missing Sections

Based on the Cube67+ example you provided, we're missing several **CRITICAL** sections:

### 1. Assembly Definitions ⚠️ **HIGH PRIORITY**
```ini
[Assembly]
Assem100 = "Digital Input", 0x64, 0, 1, 0x0000, , "20 04 24 65 30 03", , ;
Assem119 = "Digital Input + IO-Link(2B)", 0x77, 0, 3, 0x0000, , "20 04 24 66 30 03", , ;
```

**Impact:**
- **Cannot generate I/O configurations** without assembly definitions
- **Cannot validate connection references** (Assem100, Assem119, etc.)
- **Cannot understand data payload structures**
- **Critical for PLC configuration tools**

**Database Schema Needed:**
```sql
CREATE TABLE eds_assemblies (
    id INTEGER PRIMARY KEY,
    eds_file_id INTEGER NOT NULL,
    assembly_number INTEGER,  -- 100, 119, etc.
    assembly_name TEXT,
    assembly_type INTEGER,    -- 0x64, 0x77, etc.
    unknown_field1 INTEGER,
    size INTEGER,             -- Assembly size in bytes
    unknown_field2 INTEGER,
    path TEXT,                -- "20 04 24 65 30 03"
    help_string TEXT,
    FOREIGN KEY (eds_file_id) REFERENCES eds_files(id) ON DELETE CASCADE
);
```

### 2. Variable Assemblies ⚠️ **HIGH PRIORITY**
```ini
AssemExa134 = 34, 32, "IO-Link Process Data from IO Device";
AssemExa135 = 35, 32, "IO-Link Process Data from IO Device + State";
```

**Impact:**
- **Required for variable-length I/O** configurations
- **Referenced in Connections** (Connection36, Connection37, etc.)
- **Cannot support dynamic I/O** without this

**Database Schema:**
```sql
CREATE TABLE eds_variable_assemblies (
    id INTEGER PRIMARY KEY,
    eds_file_id INTEGER NOT NULL,
    assembly_name TEXT,       -- "AssemExa134"
    unknown_value1 INTEGER,   -- 34
    max_size INTEGER,         -- 32
    description TEXT,
    FOREIGN KEY (eds_file_id) REFERENCES eds_files(id) ON DELETE CASCADE
);
```

### 3. Object Class Definitions ⚠️ **MEDIUM PRIORITY**

#### DLR Class
```ini
[DLR Class]
Revision = 3;
Object_Name = "Device Level Ring Object";
Object_Class_Code = 0x47;
MaxInst = 1;
Number_Of_Static_Instances = 1;
Max_Number_Of_Dynamic_Instances = 0;
```

#### TCP/IP Interface Class
```ini
[TCP/IP Interface Class]
Revision = 4;
Object_Name = "TCP/IP Interface Object";
Object_Class_Code = 0xF5;
MaxInst = 1;
Number_Of_Static_Instances = 1;
Max_Number_Of_Dynamic_Instances = 0;
ENetQCT1 =
    350,    $ Ready for Connection Time
    50;     $ Accumulated CIP Connection Time
```

#### Ethernet Link Class
```ini
[Ethernet Link Class]
Revision = 4;
Object_Name = "Ethernet Link Object";
Object_Class_Code = 0xF6;
MaxInst = 2;
Number_Of_Static_Instances = 2;
Max_Number_Of_Dynamic_Instances = 0;
InterfaceLabel1 = "XF1";
InterfaceLabel2 = "XF2";
```

**Impact:**
- **Network configuration requires** these object classes
- **DLR support** (Device Level Ring for redundancy)
- **TCP/IP and Ethernet settings**
- **Interface labeling** for multi-port devices

**Database Schema:**
```sql
CREATE TABLE eds_object_classes (
    id INTEGER PRIMARY KEY,
    eds_file_id INTEGER NOT NULL,
    class_name TEXT,          -- "DLR Class", "TCP/IP Interface Class", etc.
    revision INTEGER,
    object_name TEXT,
    object_class_code INTEGER,
    max_inst INTEGER,
    static_instances INTEGER,
    dynamic_instances INTEGER,
    extra_fields TEXT,        -- JSON for class-specific fields like ENetQCT1, InterfaceLabel1, etc.
    FOREIGN KEY (eds_file_id) REFERENCES eds_files(id) ON DELETE CASCADE
);
```

### 4. Connection Overhead ⚠️ **MEDIUM PRIORITY**
Currently in `[Capacity]` but we may not be parsing `ConnOverhead`:
```ini
ConnOverhead = .004;    $ Connection Overhead
```

**Action:** Verify we're capturing this field.

---

## 📊 Additional Sections to Investigate

### Potentially Missing Sections (need to check sample EDS files):

1. **`[Groups]`** - Parameter grouping for configuration tools
2. **`[Strings]`** - Localized string resources
3. **`[VariableParam]`** - Variable parameter definitions
4. **`[Modular]`** - Modular device configuration
5. **`[IO_Info]`** - I/O mapping information
6. **`[EnumPar]`** - Enhanced enum parameter definitions (different from our Enum sections)
7. **`[DataTableDefinitions]`** - Data table structures
8. **`[Safety]`** - Safety-related configurations
9. **`[Power]`** - Power consumption data

---

## 🎯 Implementation Plan

### Phase 1: Critical Assembly Support (Week 1)
**Goal:** Capture assembly definitions to enable I/O configuration

1. **Database Migration** (Day 1)
   - Create `eds_assemblies` table
   - Create `eds_variable_assemblies` table
   - Add indexes for fast lookups

2. **Parser Updates** (Day 1-2)
   - Add `get_assemblies()` method to EDSParser
   - Add `get_variable_assemblies()` method
   - Parse `[Assembly]` section
   - Handle both fixed and variable assembly formats

3. **Backend Integration** (Day 2)
   - Update `parse_eds_file()` to extract assemblies
   - Update INSERT statements in `eds_routes.py` and `clear_and_reimport.py`
   - Add API endpoints:
     - `GET /api/eds/{id}/assemblies` - List assemblies
     - `GET /api/eds/{id}/assemblies/{assembly_number}` - Get specific assembly

4. **Frontend Display** (Day 3)
   - Create `AssembliesTab` component
   - Visualize assembly structures
   - Show assembly references in Connections tab
   - Link assemblies to connections (highlight which connections use which assemblies)

5. **Testing** (Day 3)
   - Verify assembly parsing with Cube67+ EDS
   - Validate connection-to-assembly mapping
   - Check variable assembly handling

### Phase 2: Object Class Support (Week 2)
**Goal:** Capture network and communication object classes

1. **Database Schema** (Day 1)
   - Create `eds_object_classes` table
   - JSON field for class-specific attributes

2. **Parser Implementation** (Day 1-2)
   - Generic object class parser (handles any `[*Class]` section)
   - Extract standard fields (Revision, Object_Name, etc.)
   - Store class-specific fields as JSON

3. **UI Enhancement** (Day 2-3)
   - Add "Network Configuration" tab
   - Display DLR, TCP/IP, and Ethernet Link settings
   - Visualize interface labels for multi-port devices

### Phase 3: Comprehensive Section Capture (Week 3-4)
**Goal:** Investigate and capture ALL remaining sections

1. **EDS File Survey** (Day 1)
   - Scan all 800+ EDS files in database
   - Identify unique section names
   - Categorize by frequency and importance

2. **Generic Section Storage** (Day 2)
   - Create `eds_sections` table for uncategorized sections:
   ```sql
   CREATE TABLE eds_sections (
       id INTEGER PRIMARY KEY,
       eds_file_id INTEGER NOT NULL,
       section_name TEXT,
       section_content TEXT,  -- Raw INI content
       parsed_data TEXT,      -- JSON-parsed data if applicable
       FOREIGN KEY (eds_file_id) REFERENCES eds_files(id) ON DELETE CASCADE
   );
   ```

3. **Prioritize and Implement** (Day 3-10)
   - Implement parsers for high-frequency sections
   - Test with representative devices
   - Document section meanings and usage

### Phase 4: Validation & Recreation (Week 5)
**Goal:** Verify we can perfectly recreate EDS files

1. **EDS Recreation Tool** (Day 1-3)
   - Build `eds_exporter.py` that reads from database
   - Recreate INI file format from stored data
   - Preserve comments and formatting where possible

2. **Validation** (Day 3-5)
   - Compare recreated EDS with original
   - Semantic equivalence check (may not be byte-for-byte, but functionally identical)
   - Test with EDS validation tools (if available)

---

## 🔧 Technical Implementation Details

### Assembly Parser Example

```python
def get_assemblies(self) -> List[Dict[str, Any]]:
    """Extract assembly definitions from [Assembly] section."""
    if 'Assembly' not in self.sections:
        return []

    assemblies = []
    content = self.sections['Assembly']

    # Regular assemblies: Assem100 = "Name", 0x64, 0, 1, 0x0000, , "path", , ;
    pattern = r'Assem(\d+)\s*=\s*"([^"]+)",\s*(\w+),\s*(\d+),\s*(\d+),\s*(\w+),\s*,\s*"([^"]*)",\s*,\s*;'
    matches = re.finditer(pattern, content)

    for match in matches:
        assemblies.append({
            'assembly_number': int(match.group(1)),
            'assembly_name': match.group(2),
            'assembly_type': self._parse_int(match.group(3)),  # 0x64
            'unknown_field1': int(match.group(4)),
            'size': int(match.group(5)),
            'unknown_field2': self._parse_int(match.group(6)),  # 0x0000
            'path': match.group(7),
            'is_variable': False
        })

    # Variable assemblies: AssemExa134 = 34, 32, "Description";
    var_pattern = r'AssemExa(\d+)\s*=\s*(\d+),\s*(\d+),\s*"([^"]+)"\s*;'
    var_matches = re.finditer(var_pattern, content)

    for match in var_matches:
        assemblies.append({
            'assembly_number': int(match.group(1)),
            'assembly_name': f"AssemExa{match.group(1)}",
            'unknown_value1': int(match.group(2)),
            'max_size': int(match.group(3)),
            'description': match.group(4),
            'is_variable': True
        })

    return assemblies
```

### Object Class Parser Example

```python
def get_object_classes(self) -> List[Dict[str, Any]]:
    """Extract object class definitions from sections ending with 'Class'."""
    object_classes = []

    for section_name in self.sections.keys():
        if section_name.endswith('Class'):
            class_data = self._parse_key_value(self.sections[section_name])

            # Extract standard fields
            obj_class = {
                'class_name': section_name,
                'revision': self._parse_int(class_data.get('Revision')),
                'object_name': class_data.get('Object_Name'),
                'object_class_code': self._parse_int(class_data.get('Object_Class_Code')),
                'max_inst': self._parse_int(class_data.get('MaxInst')),
                'static_instances': self._parse_int(class_data.get('Number_Of_Static_Instances')),
                'dynamic_instances': self._parse_int(class_data.get('Max_Number_Of_Dynamic_Instances'))
            }

            # Store class-specific fields as JSON
            extra_fields = {}
            for key, value in class_data.items():
                if key not in ['Revision', 'Object_Name', 'Object_Class_Code', 'MaxInst',
                               'Number_Of_Static_Instances', 'Max_Number_Of_Dynamic_Instances']:
                    extra_fields[key] = value

            obj_class['extra_fields'] = json.dumps(extra_fields) if extra_fields else None
            object_classes.append(obj_class)

    return object_classes
```

---

## 📋 Success Metrics

1. **Assembly Coverage:** 100% of assemblies extracted and stored
2. **Connection Validation:** All assembly references in connections are valid
3. **Object Class Support:** DLR, TCP/IP, and Ethernet Link classes captured
4. **Recreation Accuracy:** Recreated EDS files pass semantic validation
5. **Code Generation Ready:** All data needed for adapter generation is available

---

## 🚀 Next Steps

1. **Immediate:** Complete enum parsing implementation (in progress)
2. **This Week:** Begin Phase 1 - Assembly Support
3. **Week 2:** Object Class Support
4. **Week 3-4:** Comprehensive section capture
5. **Week 5:** Validation and recreation testing

---

## 📌 Notes

- All new tables must have proper indexes for performance
- Consider adding `last_modified` timestamps for cache invalidation
- API endpoints should return assembly->connection linkage for UI visualization
- Frontend should show "completeness percentage" for each EDS file (which sections we've captured)

---

**Status:** Enum parsing completed ✅, ready to begin Assembly implementation

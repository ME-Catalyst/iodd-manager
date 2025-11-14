# Quick Start Guide: Priority 1 Enhancements

This guide provides step-by-step implementation instructions for the Priority 1 "Quick Win" enhancements identified in `ENHANCEMENTS.md`.

## Prerequisites

- Python 3.8+
- Node.js 16+
- SQLite 3.24+
- All dependencies from `requirements.txt` and `package.json` installed
- GreenStack development environment running

---

## Enhancement 1: Assembly Comparison Tab for EDS Devices

**Goal**: Add a new tab to ComparisonView that displays EDS assemblies side-by-side

**Estimated Time**: 4-6 hours

### Backend (No Changes Needed!)
The data is already available via the existing endpoint:
```
GET /api/eds/{id}
```

Response includes `assemblies` array with all assembly data.

### Frontend Changes

**File**: `frontend/src/components/ComparisonView.jsx`

**Step 1**: Add "Assemblies" to comparison mode options (around line 19):
```javascript
const [compareMode, setCompareMode] = useState('parameters');
// Change to support: 'parameters', 'specs', 'assemblies', 'process-data'
```

**Step 2**: Add tab button for Assemblies (around line 450):
```javascript
<button
  onClick={() => setCompareMode('assemblies')}
  className={compareMode === 'assemblies' ? 'active-class' : 'inactive-class'}
>
  Assemblies
</button>
```

**Step 3**: Create assembly comparison renderer:
```javascript
const renderAssemblyComparison = () => {
  // Get all unique assembly numbers across selected EDS devices
  const assemblyNumbers = new Set();
  selectedDevices.forEach(device => {
    if (device.type === 'EDS' && deviceDetails[device.id]?.assemblies) {
      deviceDetails[device.id].assemblies.forEach(asm => {
        assemblyNumbers.add(asm.assembly_number);
      });
    }
  });

  return (
    <table className="comparison-table">
      <thead>
        <tr>
          <th>Assembly #</th>
          {selectedDevices.map(device => (
            <th key={device.id}>{device.product_name}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {Array.from(assemblyNumbers).sort((a, b) => a - b).map(asmNum => (
          <tr key={asmNum}>
            <td className="assembly-number">{asmNum}</td>
            {selectedDevices.map(device => {
              const assembly = deviceDetails[device.id]?.assemblies?.find(
                a => a.assembly_number === asmNum
              );

              return (
                <td key={device.id} className={!assembly ? 'missing' : ''}>
                  {assembly ? (
                    <div>
                      <div className="font-semibold">{assembly.assembly_name}</div>
                      <div className="text-sm text-slate-400">
                        Type: {assembly.assembly_type || 'N/A'}
                      </div>
                      <div className="text-sm text-slate-400">
                        Size: {assembly.size || 'Variable'}
                      </div>
                      {assembly.help_string && (
                        <div className="text-xs text-slate-500 mt-1">
                          {assembly.help_string}
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="text-slate-600">—</span>
                  )}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
};
```

**Step 4**: Add condition to render assemblies mode:
```javascript
{compareMode === 'assemblies' && renderAssemblyComparison()}
```

---

## Enhancement 2: Process Data Comparison for IODD Devices

**Goal**: Add process data comparison tab for IO-Link devices

**Estimated Time**: 4-6 hours

### Backend API Endpoint (NEW)

**File**: `api.py` or create `process_data_routes.py`

```python
@app.get("/api/iodd/{device_id}/process-data")
async def get_process_data(device_id: int):
    """Get process data for IODD device"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Get process data
    cursor.execute("""
        SELECT pd_id, name, direction, bit_length, data_type, description
        FROM process_data
        WHERE device_id = ?
        ORDER BY pd_id
    """, (device_id,))

    process_data = []
    for row in cursor.fetchall():
        pd_id, name, direction, bit_length, data_type, description = row

        # Get record items for this process data
        cursor.execute("""
            SELECT subindex, name, bit_offset, bit_length, data_type, default_value
            FROM process_data_record_items
            WHERE process_data_id = ?
            ORDER BY bit_offset
        """, (pd_id,))

        record_items = [
            {
                "subindex": r[0],
                "name": r[1],
                "bit_offset": r[2],
                "bit_length": r[3],
                "data_type": r[4],
                "default_value": r[5]
            }
            for r in cursor.fetchall()
        ]

        process_data.append({
            "pd_id": pd_id,
            "name": name,
            "direction": direction,
            "bit_length": bit_length,
            "data_type": data_type,
            "description": description,
            "record_items": record_items
        })

    conn.close()
    return {"process_data": process_data}
```

### Frontend Changes

**File**: `frontend/src/components/ComparisonView.jsx`

**Step 1**: Fetch process data when IODD device selected:
```javascript
const fetchProcessData = async (deviceId) => {
  const response = await axios.get(`${API_BASE}/api/iodd/${deviceId}/process-data`);
  return response.data.process_data;
};
```

**Step 2**: Add "Process Data" tab and renderer similar to assemblies

**Step 3**: Render bit-field visualization:
```javascript
const renderBitField = (recordItems, totalBitLength) => {
  return (
    <div className="bit-field-container">
      {recordItems.map((item, idx) => (
        <div
          key={idx}
          className="bit-field-item"
          style={{
            width: `${(item.bit_length / totalBitLength) * 100}%`,
            backgroundColor: `hsl(${idx * 60}, 70%, 50%)`
          }}
          title={`${item.name} (${item.bit_length} bits)`}
        >
          <span className="bit-label">{item.name}</span>
        </div>
      ))}
    </div>
  );
};
```

---

## Enhancement 3: Export Comparison Results

**Goal**: Add CSV, JSON, and PDF export buttons to ComparisonView

**Estimated Time**: 3-4 hours

### Frontend Changes

**File**: `frontend/src/components/ComparisonView.jsx`

**Step 1**: Add export buttons to header:
```javascript
import { Download, FileText, FileJson } from 'lucide-react';

const exportToCSV = () => {
  const csv = [];

  // Headers
  const headers = ['Property', ...selectedDevices.map(d => d.product_name)];
  csv.push(headers.join(','));

  // Rows for each parameter
  if (compareMode === 'parameters') {
    const allParamNames = getAllParameterNames();
    allParamNames.forEach(paramName => {
      const row = [paramName];
      selectedDevices.forEach(device => {
        const value = getParameterValue(device, paramName);
        row.push(value?.default_value || '—');
      });
      csv.push(row.join(','));
    });
  }

  // Create download
  const blob = new Blob([csv.join('\n')], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `comparison_${Date.now()}.csv`;
  a.click();
};

const exportToJSON = () => {
  const data = {
    timestamp: new Date().toISOString(),
    devices: selectedDevices.map(device => ({
      ...device,
      details: deviceDetails[device.id]
    })),
    comparison_mode: compareMode
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `comparison_${Date.now()}.json`;
  a.click();
};
```

**Step 2**: Add export button UI:
```jsx
<div className="flex gap-2">
  <Button onClick={exportToCSV} variant="outline" size="sm">
    <FileText className="w-4 h-4 mr-2" />
    Export CSV
  </Button>
  <Button onClick={exportToJSON} variant="outline" size="sm">
    <FileJson className="w-4 h-4 mr-2" />
    Export JSON
  </Button>
</div>
```

---

## Enhancement 4: Faceted Search Filters

**Goal**: Add dropdown filters to SearchPage for vendor, category, and features

**Estimated Time**: 4-5 hours

### Backend API Endpoint (NEW)

**File**: `search_routes.py`

```python
@router.get("/api/search/facets")
async def get_search_facets():
    """Get available filter options for faceted search"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Get unique vendors
    cursor.execute("""
        SELECT DISTINCT vendor_name FROM eds_files WHERE vendor_name IS NOT NULL
        UNION
        SELECT DISTINCT manufacturer FROM devices WHERE manufacturer IS NOT NULL
        ORDER BY vendor_name
    """)
    vendors = [row[0] for row in cursor.fetchall()]

    # Get parameter data types
    cursor.execute("""
        SELECT DISTINCT data_type FROM eds_parameters WHERE data_type IS NOT NULL
        ORDER BY data_type
    """)
    data_types = [row[0] for row in cursor.fetchall()]

    conn.close()

    return {
        "vendors": vendors,
        "data_types": data_types,
        "categories": ["devices", "parameters", "assemblies", "connections"],
        "device_types": ["EDS", "IODD"]
    }
```

### Update Search Endpoint

**File**: `search_routes.py`

Modify existing `/api/search` to accept filter parameters:
```python
@router.get("/api/search")
async def search_all(
    q: str,
    device_type: Optional[str] = None,
    vendor: Optional[str] = None,
    category: Optional[str] = None,
    limit: int = 50
):
    # Add WHERE clauses based on filters
    vendor_filter = f"AND vendor_name = '{vendor}'" if vendor else ""
    # ... apply filters to SQL queries
```

### Frontend Changes

**File**: `frontend/src/components/SearchPage.jsx`

**Step 1**: Add filter state:
```javascript
const [filters, setFilters] = useState({
  vendor: null,
  category: null
});
const [availableFilters, setAvailableFilters] = useState(null);
```

**Step 2**: Fetch filter options on mount:
```javascript
useEffect(() => {
  const fetchFilters = async () => {
    const response = await axios.get(`${API_BASE}/api/search/facets`);
    setAvailableFilters(response.data);
  };
  fetchFilters();
}, []);
```

**Step 3**: Add filter UI below device type filter:
```jsx
{/* Additional Filters */}
{availableFilters && (
  <div className="flex items-center gap-3 mt-3">
    <span className="text-sm text-slate-400">More filters:</span>

    {/* Vendor Filter */}
    <select
      value={filters.vendor || ''}
      onChange={(e) => setFilters({...filters, vendor: e.target.value || null})}
      className="px-3 py-1 text-sm bg-slate-800 border border-slate-700 rounded text-white"
    >
      <option value="">All Vendors</option>
      {availableFilters.vendors.map(v => (
        <option key={v} value={v}>{v}</option>
      ))}
    </select>

    {/* Category Filter */}
    <select
      value={filters.category || ''}
      onChange={(e) => setFilters({...filters, category: e.target.value || null})}
      className="px-3 py-1 text-sm bg-slate-800 border border-slate-700 rounded text-white"
    >
      <option value="">All Categories</option>
      {availableFilters.categories.map(c => (
        <option key={c} value={c}>{c}</option>
      ))}
    </select>
  </div>
)}
```

**Step 4**: Update search to include filters:
```javascript
const params = {
  q: query,
  limit: 50,
  ...(deviceTypeFilter && { device_type: deviceTypeFilter }),
  ...(filters.vendor && { vendor: filters.vendor }),
  ...(filters.category && { category: filters.category })
};
```

---

## Testing Checklist

### Assembly Comparison
- [ ] EDS devices show assembly data
- [ ] Assembly differences highlighted
- [ ] Table shows all assemblies across devices
- [ ] Missing assemblies shown as "—"
- [ ] Help strings displayed correctly

### Process Data
- [ ] IODD devices show process data
- [ ] Record items displayed with bit offsets
- [ ] Input/output direction shown
- [ ] Bit-field visualization renders

### Export
- [ ] CSV export downloads correctly
- [ ] CSV opens in Excel without errors
- [ ] JSON export is valid JSON
- [ ] JSON contains all comparison data
- [ ] PDF export (if implemented) renders correctly

### Faceted Search
- [ ] Vendor filter dropdown populates
- [ ] Category filter works
- [ ] Filters apply to search results
- [ ] Multiple filters combine correctly (AND logic)
- [ ] Clear/reset filters works

---

## Deployment Steps

1. **Backend Changes**:
   ```bash
   # If you added new endpoints
   git add api.py search_routes.py
   git commit -m "Add process data and facets endpoints"
   ```

2. **Frontend Changes**:
   ```bash
   cd frontend
   npm run build
   cd ..
   git add frontend/
   git commit -m "Add P1 enhancements: assemblies, process data, export, facets"
   ```

3. **Test Locally**:
   ```bash
   python api.py
   # In another terminal:
   cd frontend && npm run dev
   ```

4. **Push to Production**:
   ```bash
   git push origin main
   ```

---

## Troubleshooting

### "Process data not showing"
- Check that `process_data` table exists in database
- Verify IODD files have been parsed with process data extraction
- Check browser console for API errors

### "Assemblies tab empty"
- Ensure EDS files have assembly data
- Check that `eds_assemblies` table is populated
- Verify API response includes `assemblies` array

### "Export creates empty file"
- Check browser console for JavaScript errors
- Verify comparison data is loaded before export
- Test with 2-3 devices first

### "Filters not applying"
- Check API endpoint accepts filter parameters
- Verify SQL queries include WHERE clauses
- Test API endpoint directly with curl/Postman

---

## Performance Considerations

- **Large Comparisons**: Limit to 4 devices max to avoid UI crowding
- **Process Data Bit Fields**: May be slow for 100+ record items - consider pagination
- **Export Large Datasets**: CSV export may freeze browser for 1000+ parameters - add loading indicator
- **Filter Queries**: Add database indexes on `vendor_name`, `data_type` if slow

---

## Next Steps

After completing P1 enhancements, proceed to Priority 2:
1. Enhanced parameter comparison (enumerations, scaling factors)
2. Connection comparison
3. Numeric range search
4. Module comparison

See `ENHANCEMENTS.md` for full roadmap.

# EDS Export ZIP Endpoint - Implementation Plan

⚠️ **STATUS: IMPLEMENTED - UNDER DEVELOPMENT**
This endpoint has been implemented and is functional. See implementation notes at the end of this document.

---

## Endpoint Specification

**Route**: `GET /api/eds/{eds_id}/export-zip`

**Purpose**: Export a ZIP file containing the original EDS file and related assets (icon, metadata, etc.)

**Filename Format**: `{vendor_name}_{product_name}_{product_code}_v{major}.{minor}.zip`

Example: `Murrelektronik_MVK_Pro_ME_DIO8_IOL8_5P_54611_v1.8.zip`

## Implementation

Add to `eds_routes.py` after the existing `/icon` endpoint (around line 626):

```python
@router.get("/{eds_id}/export-zip")
async def export_eds_zip(eds_id: int):
    """
    Export EDS file and related assets as a ZIP file

    Returns:
        ZIP file containing:
        - Original EDS file
        - Icon file (if available)
        - Metadata JSON
    """
    conn = sqlite3.connect(get_db_path())
    cursor = conn.cursor()

    # Get EDS file data
    cursor.execute("""
        SELECT vendor_name, product_name, product_code, major_revision, minor_revision,
               eds_content, icon_filename, icon_data, catalog_number
        FROM eds_files WHERE id = ?
    """, (eds_id,))

    row = cursor.fetchone()
    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail="EDS file not found")

    vendor, product, code, maj_rev, min_rev, eds_content, icon_name, icon_data, catalog = row

    # Create safe filename
    safe_vendor = re.sub(r'[^\w\s-]', '', vendor or 'Unknown').replace(' ', '_')
    safe_product = re.sub(r'[^\w\s-]', '', product or 'Unknown').replace(' ', '_')
    zip_filename = f"{safe_vendor}_{safe_product}_{code}_v{maj_rev}.{min_rev}.zip"

    # Create ZIP in memory
    zip_buffer = io.BytesIO()
    with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
        # Add EDS file
        eds_filename = f"{catalog or product}.eds"
        zip_file.writestr(eds_filename, eds_content.encode('utf-8'))

        # Add icon if available
        if icon_data:
            icon_ext = icon_name.split('.')[-1] if icon_name else 'ico'
            zip_file.writestr(f"{catalog or product}.{icon_ext}", icon_data)

        # Add metadata JSON
        metadata = {
            'eds_id': eds_id,
            'vendor_name': vendor,
            'product_name': product,
            'product_code': code,
            'revision': f"{maj_rev}.{min_rev}",
            'catalog_number': catalog,
            'export_date': datetime.now().isoformat()
        }
        zip_file.writestr('metadata.json', json.dumps(metadata, indent=2))

    conn.close()

    # Return ZIP file
    zip_buffer.seek(0)
    return StreamingResponse(
        zip_buffer,
        media_type="application/zip",
        headers={
            "Content-Disposition": f"attachment; filename={zip_filename}"
        }
    )
```

## Required Imports

Add to top of `eds_routes.py`:
```python
import io
import zipfile
import re
import json
from fastapi.responses import StreamingResponse
```

## Testing

```bash
curl -o test_export.zip http://localhost:8000/api/eds/1/export-zip
unzip -l test_export.zip
```

Expected output:
```
Archive:  test_export.zip
  Length      Date    Time    Name
---------  ---------- -----   ----
    68012  2025-11-13 16:00   54611.eds
     1406  2025-11-13 16:00   54611.ico
      256  2025-11-13 16:00   metadata.json
---------                     -------
    69674                     3 files
```

---

## Implementation Notes

### ✅ Current Implementation Status

**File**: `eds_routes.py` (lines 633-702)

The endpoint has been successfully implemented with the following features:

1. **ZIP Creation** ✅
   - Creates ZIP file in memory using BytesIO
   - Includes original EDS file content (from database)
   - Includes icon file if available
   - Includes metadata.json with device info and export timestamp

2. **Filename Handling** ✅
   - Generates safe filenames by sanitizing vendor/product names
   - Format: `{vendor}_{product}_{code}_v{major}.{minor}.zip`
   - Example: `Murrelektronik_GmbH_IMPACT67_Pro_E_DIO8_IOL8_5P_54631_v1.8.zip`

3. **CORS Configuration** ✅
   - Added `expose_headers=["content-disposition"]` to CORS middleware in `api.py:251`
   - Allows frontend to read Content-Disposition header for proper filename extraction

4. **Frontend Integration** ✅
   - File: `frontend/src/App.jsx` (lines 4335-4377)
   - Handles blob download
   - Extracts filename from Content-Disposition header with improved regex
   - Fallback filename generation if header parsing fails
   - Toast notifications for success/failure

5. **Error Handling** ✅
   - Returns 404 if EDS file not found
   - Handles missing icon gracefully
   - Proper database connection cleanup

### Testing Results

**Backend Test** (via curl):
```bash
curl -o test.zip http://localhost:8000/api/eds/1/export-zip
# Result: Successfully downloads ZIP file
```

**Frontend Test** (via browser):
- Created `test_zip_export.html` for standalone testing
- Successfully downloads ZIP with proper filename
- Content-Disposition header properly exposed via CORS
- Blob download triggers correctly in browser

### Known Limitations

1. **Production Readiness** ⚠️
   - Feature is functional but marked as "under development"
   - Needs broader testing with various EDS file formats
   - Should validate EDS content exists before creating ZIP

2. **Future Enhancements**
   - Add progress indication for large files
   - Support batch export (multiple EDS files in one ZIP)
   - Add option to include/exclude icon
   - Validate ZIP integrity after creation

### Files Modified

1. `eds_routes.py` - Added export-zip endpoint
2. `api.py` - Updated CORS configuration
3. `frontend/src/App.jsx` - Added handleExportZIP function
4. `frontend/src/components/EDSDetailsView.jsx` - Wired up ZIP export button

### Verification

To verify the implementation:

1. **Check endpoint exists**:
   ```bash
   curl -I http://localhost:8000/api/eds/1/export-zip
   # Should return 200 OK with Content-Type: application/zip
   ```

2. **Test download**:
   ```bash
   curl -o test.zip http://localhost:8000/api/eds/1/export-zip
   unzip -l test.zip
   # Should list: .eds file, .ico file (if available), metadata.json
   ```

3. **Test in UI**:
   - Navigate to any EDS detail page
   - Click "Export ZIP" button in header
   - Verify ZIP downloads with proper filename
   - Extract and verify contents

**Conclusion**: Endpoint is fully functional and integrated into the UI. Ready for testing with broader EDS file samples before production deployment.

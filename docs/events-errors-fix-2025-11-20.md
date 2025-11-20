# Events and Errors Display Fix - November 20, 2025

## Issue: Sub-par Data on Events and Errors Tabs

### Problem
Events and Errors tabs were frequently showing missing or generic data:
- Error names like "Error 0/17" instead of "Index Not Available"
- Event names like "Event 16912" instead of "Temperature Over-run"
- Missing descriptions for most errors and events
- Inconsistent data quality across devices

### Root Cause Analysis

Deep dive into device ID 65560 (series 4x touch with display, CAPTRON Electronic GmbH) revealed:

1. **IODD files use standard references**: The IODD XML uses `StdErrorTypeRef` and `StdEventRef` elements that only contain code numbers, not names/descriptions:
   ```xml
   <ErrorTypeCollection>
       <StdErrorTypeRef additionalCode="0" />   <!-- 0x8000 -->
       <StdErrorTypeRef additionalCode="17" />  <!-- 0x8011 -->
       <StdErrorTypeRef additionalCode="48" />  <!-- 0x8030 -->
   </ErrorTypeCollection>

   <EventCollection>
       <StdEventRef code="16912" />  <!-- 0x4210 -->
       <StdEventRef code="20480" />  <!-- 0x5000 -->
       <StdEventRef code="24576" />  <!-- 0x6000 -->
   </EventCollection>
   ```

2. **Parser had incomplete mappings**: The `_get_standard_error_name()` and `_get_standard_event_name()` functions in `src/parsing/__init__.py` only had mappings for a few codes:
   - Only 13 error codes mapped (all using legacy code=128 format)
   - Only 4 event codes mapped
   - No descriptions for most codes

3. **IO-Link specification compliance**: The actual IO-Link Interface Specification v1.1 defines:
   - Error codes in format 0x80XX (where code=0, additionalCode=XX)
   - Event codes in ranges: 0x4xxx (notifications), 0x5xxx (device status), 0x6xxx (application), 0x7xxx (process), etc.

### Solution

Enhanced the IODD parser with comprehensive IO-Link standard code mappings:

#### Error Code Mappings Added (40+ codes)
- **General errors (0x8000-0x800F)**: Application errors, access errors
- **Parameter service errors (0x8010-0x802F)**: Index errors, access denied, invalid data
- **Communication errors (0x8020-0x802F)**: Checksum, invalid messages
- **Device state errors (0x8030-0x803F)**: Out of range, function unavailable
- **Device errors (0x8040-0x804F)**: Malfunction, sensor/actuator failures
- **Application specific (0x8050-0x80FF)**: Memory, configuration errors

#### Event Code Mappings Added (50+ codes)
- **Notification events (0x4xxx / 16384-20479)**: Device started, temperature warnings
- **Device status events (0x5xxx / 20480-24575)**: Hardware faults, voltage issues
- **Application events (0x6xxx / 24576-28671)**: Software faults, configuration errors
- **Process events (0x7xxx / 28672-32767)**: Alarms, sensor failures, short circuits
- **Diagnostic events (0x8xxx / 32768-36863)**: Self-test, memory errors
- **Custom/Vendor events (0x9xxx / 36864-40959)**: Vendor-specific events

### Example Improvements

**Device 53 (series 4x touch with display) - Before:**
```
Errors:
- Error 0/0
- Error 0/17
- Error 0/18
- Error 0/48
- Error 0/53
- Error 0/65

Events:
- Event 16912
- Device Status Event
- Event 20753
- Event 24576
- Event 30480
```

**After:**
```
Errors:
- Device Application Error (0x8000): General device application error occurred
- Index Not Available (0x8011): The requested parameter index does not exist
- Subindex Not Available (0x8012): The requested parameter subindex does not exist
- Parameter Value Out of Range (0x8030): Parameter value is outside the valid range
- Function Not Available (0x8035): Requested function is not supported by this device
- Inconsistent Parameter Set (0x8041): Parameter set contains inconsistent or conflicting values

Events:
- Temperature Over-run (0x4210): Device temperature has exceeded the warning threshold - clear source of heat
- Device Hardware Fault (0x5000): Device hardware fault detected - device exchange may be required
- Primary Supply Voltage Under-run (0x5111): Primary supply voltage is below minimum threshold - check tolerance
- Device Software Fault (0x6000): Device software fault detected - check firmware revision
- Short Circuit (0x7710): Short circuit detected - check wiring and connections
- Vendor Event 1 (0x8C40): Vendor-specific event 1 - see device documentation
- Vendor Event 3 (0x8C42): Vendor-specific event 3 - see device documentation
```

### Database Update

All 56 devices in the database were updated with the improved error and event data:
- Re-parsed all IODD files using the enhanced parser
- Updated error_types table with proper names and descriptions
- Updated events table with proper names and descriptions

### Files Modified
- `src/parsing/__init__.py` (lines 839-1088): Added comprehensive standard code mappings
- `greenstack.db`: Updated error_types and events tables for all 56 devices

### Testing
Verified device 53 (65560) shows complete error and event information matching the XML comments provided in the IODD file.

### Future Considerations
- Parser now supports both new (code=0) and legacy (code=128) error code formats
- Unknown codes fall back to hex display format: "Event 0x1234 (4660)"
- Custom/vendor events (0x9xxx series) show generic messages directing users to device documentation
- All future IODD uploads will automatically get proper error/event names and descriptions

## Commit
- Commit: f700344
- Message: "feat: Add comprehensive IO-Link standard error and event mappings"
- Pushed to remote: main branch

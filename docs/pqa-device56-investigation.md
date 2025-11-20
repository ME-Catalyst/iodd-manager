# Device #56 PQA Investigation - November 20, 2025

## Device Information
- **Product**: RAY26_DID8389143
- **Vendor**: SICK AG
- **Device ID**: 8389143
- **Overall Score**: 88.32% (FAILING - below 95% threshold)
- **Ticket Generated**: TICKET-0001 (Priority: HIGH)

## Quality Metrics Breakdown

| Metric | Score | Assessment |
|--------|-------|------------|
| **Overall** | 88.32% | ❌ FAIL (< 95%) |
| Structural | 95.78% | ✅ GOOD |
| **Attribute** | 72.36% | ❌ POOR |
| Value | 98.73% | ✅ EXCELLENT |
| Data Loss | 2.53% | ⚠️ ACCEPTABLE |

## Root Cause Analysis

### Issue #1: Text ID Generation (Primary Cause)
**Impact**: Drives attribute score down to 72.36%

**Problem**: The IODD reconstructor is generating sequential numeric IDs for Text elements instead of preserving the original meaningful IDs.

**Examples**:
| Original ID | Reconstructed ID | Impact |
|-------------|------------------|--------|
| `TI_VendorText` | `TI_0` | HIGH |
| `TI_VendorUrl` | `TI_1` | HIGH |
| `TI_DeviceFamily` | `TI_10` | HIGH |
| `TI_9922cd61-8890-41b2-a6a9-64b111b21e04` | `TI_100` | HIGH |
| `TI_f2c164fd-32f5-478d-823c-f1c9ef3343f6` | `TI_101` | HIGH |

**Affected Elements**: ~150+ Text elements in ExternalTextCollection

**Root Cause Location**: `src/reconstruction/iodd_reconstructor.py` - Text ID generation logic

### Issue #2: Missing High-Priority Sections
**Impact**: Drives structural score down, contributes to overall failure

**Missing Sections**:
1. **DocumentInfo** (HIGH severity)
   - Contains metadata: version, release date, copyright
   - Status: Not being reconstructed from database

2. **CommNetworkProfile** (HIGH severity)
   - Network configuration and profiles
   - Status: Not stored in database or not reconstructed

3. **ErrorTypeCollection** (HIGH severity)
   - Device has 9 error types in database
   - Status: Stored but not being reconstructed

4. **EventCollection** (HIGH severity)
   - Device has 4 events in database
   - Status: Stored but not being reconstructed

5. **ProcessDataIn** (HIGH severity)
   - Input process data definitions
   - Status: Likely database schema issue

6. **UserInterface Sections**:
   - MenuCollection
   - ObserverRoleMenuSet
   - SpecialistRoleMenuSet
   - MaintenanceRoleMenuSet
   - SupportedAccessLocks
   - Status: Menu system not fully implemented

### Issue #3: ProcessData ID Suffix Issue
**Problem**: ProcessData IDs are getting direction suffixes appended incorrectly

**Example**:
- Expected: `PD_ProcessDataA00`
- Actual: `PD_ProcessDataA00In`

**Root Cause**: ID generation logic adding `In` suffix when it shouldn't

## Database Verification

Device #56 has the following data stored:
- ✅ 34 Parameters
- ✅ 9 Error Types
- ✅ 4 Events
- ❌ 0 Menu items (not implemented/stored)

**Conclusion**: Data IS available in database but NOT being reconstructed properly.

## Recommended Fixes (Priority Order)

### Priority 1: Fix Text ID Generation ⭐⭐⭐
**File**: `src/reconstruction/iodd_reconstructor.py`
**Issue**: Text ID generation using sequential integers instead of original IDs
**Solution**: Store original Text IDs in database and retrieve them during reconstruction
**Impact**: Would increase attribute score from 72.36% → ~95%+
**Estimated Overall Score Improvement**: +10-15 points

### Priority 2: Add ErrorTypeCollection Reconstruction ⭐⭐
**File**: `src/reconstruction/iodd_reconstructor.py`
**Issue**: error_types table has data but not reconstructed
**Solution**: Add logic to reconstruct ErrorTypeCollection from error_types table
**Impact**: Would improve structural score and add missing HIGH severity section
**Estimated Overall Score Improvement**: +2-3 points

### Priority 3: Add EventCollection Reconstruction ⭐⭐
**File**: `src/reconstruction/iodd_reconstructor.py`
**Issue**: events table has data but not reconstructed
**Solution**: Add logic to reconstruct EventCollection from events table
**Impact**: Would improve structural score and add missing HIGH severity section
**Estimated Overall Score Improvement**: +2-3 points

### Priority 4: Fix ProcessData ID Generation ⭐
**File**: `src/reconstruction/iodd_reconstructor.py`
**Issue**: ID suffix logic incorrectly appending direction
**Solution**: Review ProcessData ID generation and remove inappropriate suffix addition
**Impact**: Would improve attribute score slightly
**Estimated Overall Score Improvement**: +1 point

### Priority 5: Add DocumentInfo Reconstruction ⭐
**File**: `src/reconstruction/iodd_reconstructor.py`
**Issue**: DocumentInfo section not reconstructed
**Solution**: Add DocumentInfo section with placeholder/basic metadata
**Impact**: Would improve structural score
**Estimated Overall Score Improvement**: +1 point

## Projected Score After All Fixes

| Metric | Current | Projected | Change |
|--------|---------|-----------|--------|
| Attribute | 72.36% | 95%+ | +23 pts |
| Structural | 95.78% | 98%+ | +2 pts |
| Overall | **88.32%** | **96-97%** | **+8-9 pts** |

**Result**: Device would PASS 95% threshold ✅

## Implementation Strategy

1. **Phase 1**: Fix Text ID generation (highest impact)
   - Store original IDs in text_references table
   - Modify reconstructor to use stored IDs
   - Test with Device #56

2. **Phase 2**: Add ErrorTypeCollection and EventCollection
   - Implement reconstruction from database tables
   - Test with multiple devices

3. **Phase 3**: Fix ProcessData IDs and add DocumentInfo
   - Polish remaining issues
   - Comprehensive testing

## Files to Modify

1. **src/parsing/__init__.py** (IODD parser)
   - Store original Text IDs in database during parsing
   - Store original ProcessData IDs correctly

2. **src/reconstruction/iodd_reconstructor.py** (IODD reconstructor)
   - Fix Text ID generation to use stored IDs
   - Add ErrorTypeCollection reconstruction
   - Add EventCollection reconstruction
   - Fix ProcessData ID logic
   - Add DocumentInfo section

3. **Database Schema** (if needed)
   - May need to add columns to store original IDs
   - Verify text_references table structure

## Testing Plan

1. Re-run PQA analysis on Device #56 after each fix
2. Monitor score improvements
3. Verify reconstructed XML validates against IODD schema
4. Test with other devices to ensure fixes are general

## Notes

- The user mentioned: "remember that any parsing improvements need to be mapped to the device detail front end, any time we make improvements to EDS or IODD parsing"
- After implementing fixes, need to verify Device Detail page displays new data correctly
- Priority should be on Text ID fix as it has highest impact

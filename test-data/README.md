# Test Data Directory

This directory contains sample files for testing the Greenstack application.

## Directory Structure

```
test-data/
├── eds-files/          # Sample EDS (Electronic Data Sheet) files for EtherNet/IP devices
├── iodd-files/         # Sample IODD (IO Device Description) files for IO-Link devices
└── output/             # Test output files (generated adapters, exports, etc.)
```

## EDS Files (`eds-files/`)

Place sample `.eds` files here for testing the EDS file import and management features.

**What are EDS files?**
- Electronic Data Sheets for EtherNet/IP devices
- XML-based files that describe device parameters, I/O data, and configuration
- Used by configuration tools like RSLogix/Studio 5000

**File format:** `.eds`

## IODD Files (`iodd-files/`)

Place sample IODD files here for testing the IO-Link device import features.

**What are IODD files?**
- IO Device Description files for IO-Link devices
- XML-based files that describe device communication, parameters, and diagnostics
- Can be in `.xml`, `.iodd`, or `.zip` format (for packages with multiple IODDs)

**File formats:** `.xml`, `.iodd`, `.zip`

## Output Files (`output/`)

This directory is used for testing generated output such as:
- Adapter code generation
- Device exports
- Reports
- Other generated artifacts

## Usage

1. **Adding test files:**
   - Drop sample EDS files into `eds-files/`
   - Drop sample IODD files into `iodd-files/`

2. **Running tests:**
   - Use these files to test upload functionality
   - Verify parsing and import processes
   - Test adapter generation with known-good device descriptions

3. **Automated testing:**
   - Test scripts can reference files from this directory
   - Consistent test data across development environments

## Notes

- This directory is excluded from git via `.gitignore` to avoid committing large binary files
- Keep test files organized and documented
- Remove or archive test files that are no longer needed

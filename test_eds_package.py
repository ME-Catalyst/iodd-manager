#!/usr/bin/env python
import sys
from eds_package_parser import EDSPackageParser

# Test parsing an EDS package
zip_path = r'F:\github\iodd-manager\test-data\eds-packages\55542_MVK-ME_KF5_x_15.zip'

print(f"Testing EDS package: {zip_path}")
parser = EDSPackageParser(zip_path)

try:
    result = parser.parse_package()
    print(f"[OK] Success!")
    print(f"  Vendor: {result.get('vendor_name')}")
    print(f"  Product: {result.get('product_name')}")
    print(f"  EDS files: {len(result.get('eds_files', []))}")
    print(f"  Versions: {result.get('versions')}")
    print(f"  Variants: {result.get('variants')}")
except Exception as e:
    print(f"[ERROR] Failed: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

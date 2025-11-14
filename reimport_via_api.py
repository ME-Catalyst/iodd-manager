"""Re-import EDS packages using the API upload route."""

import requests
import sqlite3
from pathlib import Path

API_BASE = "http://localhost:8000"

def clear_database():
    """Clear all EDS data."""
    print("="*80)
    print("CLEARING DATABASE")
    print("="*80)

    conn = sqlite3.connect('iodd_manager.db')
    cursor = conn.cursor()

    cursor.execute("DELETE FROM eds_diagnostics")
    cursor.execute("DELETE FROM eds_tspecs")
    cursor.execute("DELETE FROM eds_capacity")
    cursor.execute("DELETE FROM eds_ports")
    cursor.execute("DELETE FROM eds_connections")
    cursor.execute("DELETE FROM eds_parameters")
    cursor.execute("DELETE FROM eds_package_metadata")
    cursor.execute("DELETE FROM eds_files")
    cursor.execute("DELETE FROM eds_packages")

    conn.commit()
    conn.close()

    print("[OK] Database cleared")

def upload_package(package_path):
    """Upload a package via API."""
    package_name = Path(package_path).name

    print(f"\nUploading: {package_name}")

    with open(package_path, 'rb') as f:
        files = {'file': (package_name, f, 'application/zip')}
        response = requests.post(f"{API_BASE}/api/eds/upload-package", files=files, timeout=300)

    if response.status_code == 200:
        result = response.json()
        print(f"  [OK] Imported {result.get('total_imported', 0)} EDS files")
        return True
    else:
        print(f"  [ERROR] {response.status_code}: {response.text[:200]}")
        return False

def main():
    """Main function."""
    packages_dir = Path('test-data/eds-packages')
    packages = sorted(packages_dir.glob('*.zip'))

    print(f"\nFound {len(packages)} packages\n")

    # Step 1: Clear
    clear_database()

    # Step 2: Check if API is running
    try:
        response = requests.get(f"{API_BASE}/api/health", timeout=5)
        print(f"\n[OK] API is running")
    except:
        print(f"\n[ERROR] API is not running. Please start it with: python api.py")
        return 1

    # Step 3: Upload all packages
    print(f"\n{'='*80}")
    print("UPLOADING PACKAGES")
    print('='*80)

    success = 0
    failed = 0

    for package in packages:
        if upload_package(package):
            success += 1
        else:
            failed += 1

    # Summary
    print(f"\n{'='*80}")
    print("SUMMARY")
    print('='*80)
    print(f"  Success: {success}/{len(packages)}")
    print(f"  Failed: {failed}/{len(packages)}")

    return 0 if failed == 0 else 1

if __name__ == '__main__':
    import sys
    sys.exit(main())

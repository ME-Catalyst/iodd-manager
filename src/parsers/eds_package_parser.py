"""
EDS Package Parser
Handles extraction and parsing of EDS package ZIP files
"""

import re
import zipfile
import tempfile
import hashlib
from pathlib import Path
from typing import Dict, List, Tuple, Optional
from datetime import datetime
from src.parsers.eds_parser import parse_eds_file


class EDSPackageParser:
    """Parser for EDS package ZIP files containing multiple versions and variants."""

    # Variant type detection patterns
    VARIANT_PATTERNS = {
        'odva_certified': r'(?i)(01_ODVA_Certified|certified)',
        'manufacturer_1': r'(?i)(02_Manufacturer_1)',
        'manufacturer_2': r'(?i)(03_Manufacturer_2)',
    }

    # Version folder pattern
    VERSION_PATTERN = r'V(\d+)\.(\d+)'

    def __init__(self, zip_path: str):
        """Initialize parser with ZIP file path."""
        self.zip_path = zip_path
        self.package_name = Path(zip_path).stem
        self.temp_dir = None

    def calculate_checksum(self) -> str:
        """Calculate MD5 checksum of ZIP file."""
        md5 = hashlib.md5()
        with open(self.zip_path, 'rb') as f:
            for chunk in iter(lambda: f.read(8192), b''):
                md5.update(chunk)
        return md5.hexdigest()

    def identify_variant(self, file_path: str) -> str:
        """Identify EDS variant type from file path."""
        for variant_name, pattern in self.VARIANT_PATTERNS.items():
            if re.search(pattern, file_path):
                return variant_name
        return 'generic'

    def extract_version(self, file_path: str) -> Optional[str]:
        """Extract version folder name from file path."""
        match = re.search(self.VERSION_PATTERN, file_path)
        if match:
            return f"V{match.group(1)}.{match.group(2)}"
        return None

    def parse_package(self) -> Dict:
        """
        Parse entire EDS package ZIP file.

        Returns:
            Dictionary containing package metadata and all EDS files
        """
        result = {
            'package_name': self.package_name,
            'checksum': self.calculate_checksum(),
            'upload_date': datetime.now(),
            'readme_content': None,
            'eds_files': [],
            'metadata_files': [],
            'versions': set(),
            'variants': set(),
            'vendor_name': None,
            'product_name': None,
        }

        with tempfile.TemporaryDirectory() as temp_dir:
            self.temp_dir = temp_dir

            # Extract ZIP
            with zipfile.ZipFile(self.zip_path, 'r') as zip_ref:
                zip_ref.extractall(temp_dir)

            # Find all files
            temp_path = Path(temp_dir)

            # Parse EDS files
            eds_files = list(temp_path.rglob('*.eds'))

            for eds_file in eds_files:
                try:
                    # Read EDS content
                    with open(eds_file, 'r', encoding='utf-8', errors='ignore') as f:
                        eds_content = f.read()

                    # Parse EDS (returns tuple of parsed_data and diagnostics)
                    parsed_data, diagnostics = parse_eds_file(eds_content, str(eds_file))

                    # Validate that we got a dictionary
                    if not isinstance(parsed_data, dict):
                        print(f"Error parsing {eds_file}: parse_eds_file returned {type(parsed_data)} instead of dict")
                        continue

                    # Get relative path within package
                    rel_path = str(eds_file.relative_to(temp_path))

                    # Identify variant and version
                    variant = self.identify_variant(rel_path)
                    version = self.extract_version(rel_path)

                    # Read icon file if exists in same directory
                    icon_data = None
                    icon_filename = None
                    ico_files = list(eds_file.parent.glob('*.ico'))
                    if ico_files:
                        icon_file = ico_files[0]
                        with open(icon_file, 'rb') as f:
                            icon_data = f.read()
                        icon_filename = icon_file.name

                    # Store parsed EDS data
                    eds_info = {
                        'file_path': rel_path,
                        'variant_type': variant,
                        'version_folder': version,
                        'parsed_data': parsed_data,
                        'icon_data': icon_data,
                        'icon_filename': icon_filename,
                    }

                    result['eds_files'].append(eds_info)

                    # Track versions and variants
                    if version:
                        result['versions'].add(version)
                    result['variants'].add(variant)

                    # Set vendor/product from first EDS (they should all be the same)
                    if not result['vendor_name'] and 'device' in parsed_data:
                        device_info = parsed_data.get('device', {})
                        if isinstance(device_info, dict):
                            result['vendor_name'] = device_info.get('vendor_name')
                            result['product_name'] = device_info.get('product_name')

                except Exception as e:
                    print(f"Error parsing {eds_file}: {e}")
                    import traceback
                    traceback.print_exc()
                    continue

            # Parse readme files
            readme_files = list(temp_path.rglob('*[Rr]eadme*.txt'))
            for readme_file in readme_files:
                try:
                    with open(readme_file, 'r', encoding='utf-8', errors='ignore') as f:
                        content = f.read()

                    rel_path = str(readme_file.relative_to(temp_path))

                    # Store main readme content
                    if 'EDS' in rel_path and 'Readme' in readme_file.name:
                        result['readme_content'] = content

                    result['metadata_files'].append({
                        'file_path': rel_path,
                        'file_type': 'readme',
                        'content': content.encode('utf-8'),
                    })
                except Exception as e:
                    print(f"Error reading {readme_file}: {e}")

            # Parse changelog files
            changelog_files = list(temp_path.rglob('*[Cc]hange*.txt'))
            for changelog_file in changelog_files:
                try:
                    with open(changelog_file, 'r', encoding='utf-8', errors='ignore') as f:
                        content = f.read()

                    rel_path = str(changelog_file.relative_to(temp_path))
                    result['metadata_files'].append({
                        'file_path': rel_path,
                        'file_type': 'changelog',
                        'content': content.encode('utf-8'),
                    })
                except Exception as e:
                    print(f"Error reading {changelog_file}: {e}")

            # Parse IOLM XML files
            iolm_files = list(temp_path.rglob('*.xml'))
            for iolm_file in iolm_files:
                try:
                    with open(iolm_file, 'rb') as f:
                        content = f.read()

                    rel_path = str(iolm_file.relative_to(temp_path))
                    result['metadata_files'].append({
                        'file_path': rel_path,
                        'file_type': 'iolm_xml',
                        'content': content,
                    })
                except Exception as e:
                    print(f"Error reading {iolm_file}: {e}")

            # Parse images (PNG logos, etc.)
            image_files = list(temp_path.rglob('*.png'))
            for image_file in image_files:
                try:
                    with open(image_file, 'rb') as f:
                        content = f.read()

                    rel_path = str(image_file.relative_to(temp_path))
                    result['metadata_files'].append({
                        'file_path': rel_path,
                        'file_type': 'image',
                        'content': content,
                    })
                except Exception as e:
                    print(f"Error reading {image_file}: {e}")

        # Convert sets to lists for JSON serialization
        result['versions'] = sorted(list(result['versions']))
        result['variants'] = list(result['variants'])
        result['total_eds_files'] = len(result['eds_files'])
        result['total_versions'] = len(result['versions'])

        return result

    def determine_latest_version(self, eds_files: List[Dict]) -> Dict[str, int]:
        """
        Determine which EDS file is the latest version for each variant.

        Returns:
            Dictionary mapping variant names to indices in eds_files list
        """
        latest = {}

        for idx, eds_info in enumerate(eds_files):
            variant = eds_info['variant_type']
            version = eds_info['version_folder']

            if not version:
                continue

            # Extract version numbers for comparison
            match = re.search(self.VERSION_PATTERN, version)
            if match:
                major = int(match.group(1))
                minor = int(match.group(2))
                version_tuple = (major, minor)

                if variant not in latest:
                    latest[variant] = {'index': idx, 'version': version_tuple}
                else:
                    if version_tuple > latest[variant]['version']:
                        latest[variant] = {'index': idx, 'version': version_tuple}

        return {k: v['index'] for k, v in latest.items()}


def parse_eds_package(zip_path: str) -> Dict:
    """
    Convenience function to parse an EDS package ZIP file.

    Args:
        zip_path: Path to the ZIP file

    Returns:
        Parsed package data
    """
    parser = EDSPackageParser(zip_path)
    return parser.parse_package()

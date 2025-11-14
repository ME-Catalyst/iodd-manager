#!/usr/bin/env python
"""Test parsing EDS content from database"""

import sqlite3
from eds_parser import EDSParser

# Get EDS content from database
conn = sqlite3.connect('iodd_manager.db')
cursor = conn.cursor()
row = cursor.execute('SELECT id, eds_content, product_name FROM eds_files WHERE id = 1').fetchone()
conn.close()

eds_id, content, product = row
print(f"Testing EDS ID {eds_id}: {product}")
print(f"Content length: {len(content)} bytes\n")

# Parse it
parser = EDSParser(content)
print(f"Sections found: {list(parser.sections.keys())[:20]}\n")

# Check for Capacity section
if 'Capacity' in parser.sections:
    print("[Capacity] section found!")
    print(parser.sections['Capacity'][:300])
    print("\n")
else:
    print("[Capacity] section NOT found\n")

# Get capacity data
capacity = parser.get_capacity()
print("Parsed capacity data:")
for key, value in capacity.items():
    if key not in ['tspecs', 'raw_capacity_data', 'unrecognized_fields']:
        print(f"  {key}: {value}")

print(f"\nraw_capacity_data: {capacity.get('raw_capacity_data')}")
print(f"unrecognized_fields: {capacity.get('unrecognized_fields')}")

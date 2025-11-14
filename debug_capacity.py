#!/usr/bin/env python
"""Debug script to test EDS capacity parsing"""

from eds_parser import EDSParser

# Test the parser directly
with open(r'F:\github\iodd-manager\test-data\eds-files\M221\TM221_Generic.eds', 'r', encoding='latin-1') as f:
    content = f.read()

parser = EDSParser(content)
print(f"Total sections parsed: {len(parser.sections)}")
print(f"Section names: {list(parser.sections.keys())[:10]}")

if 'Capacity' in parser.sections:
    print("\n[Capacity] section found!")
    print(parser.sections['Capacity'][:200])
else:
    print("\n[Capacity] section NOT found")

# Try get_capacity
capacity = parser.get_capacity()
print(f"\nCapacity data: {capacity}")

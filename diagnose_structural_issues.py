"""
Diagnose structural score issues by examining diff details
"""

import sqlite3
import json

conn = sqlite3.connect('greenstack.db')
cursor = conn.cursor()

print("="*80)
print("Diagnosing Structural Score Issues - Device 27")
print("="*80)

# Get latest PQA result for Device 27 (eds_file_id=74)
cursor.execute('''
    SELECT id, overall_score, structural_score, attribute_score, value_score,
           total_elements_original, total_elements_reconstructed,
           missing_elements, extra_elements,
           missing_attributes, incorrect_attributes
    FROM pqa_quality_metrics
    WHERE device_id = 74 AND file_type = 'EDS'
    ORDER BY id DESC LIMIT 1
''')
row = cursor.fetchone()

if not row:
    print("[ERROR] No PQA metrics found for device 74")
    conn.close()
    exit(1)

metric_id = row[0]
print(f"\nMetric ID: {metric_id}")
print(f"\nScores:")
print(f"  Overall:    {row[1]:.1f}%")
print(f"  Structural: {row[2]:.1f}%")
print(f"  Attribute:  {row[3]:.1f}%")
print(f"  Value:      {row[4]:.1f}%")

print(f"\nElement Counts:")
print(f"  Original elements:       {row[5]}")
print(f"  Reconstructed elements:  {row[6]}")
print(f"  Missing elements:        {row[7]}")
print(f"  Extra elements:          {row[8]}")

print(f"\nAttribute Counts:")
print(f"  Missing attributes:      {row[9]}")
print(f"  Incorrect attributes:    {row[10]}")

# Calculate what structural score should be
total_orig = row[5]
missing_elem = row[7]
extra_elem = row[8]
if total_orig > 0:
    expected_structural = max(0, 100 * (1 - (missing_elem + extra_elem) / total_orig))
    print(f"\nExpected structural score: {expected_structural:.1f}%")
    print(f"  Formula: 100 * (1 - ({missing_elem} + {extra_elem}) / {total_orig})")

# Get diff details from pqa_diff_details table
print(f"\n{'='*80}")
print("DETAILED DIFF ANALYSIS")
print(f"{'='*80}")

cursor.execute('''
    SELECT diff_type, xpath, severity, description
    FROM pqa_diff_details
    WHERE metric_id = ?
    ORDER BY severity DESC, diff_type
''', (metric_id,))
diffs = cursor.fetchall()

print(f"\nTotal diff items: {len(diffs)}")

# Group by diff_type
from collections import defaultdict
by_type = defaultdict(list)
for diff in diffs:
    by_type[diff[0]].append(diff)

print(f"\nBreakdown by type:")
for diff_type, items in sorted(by_type.items()):
    print(f"  {diff_type}: {len(items)} items")

# Show missing elements
if 'missing_element' in by_type:
    print(f"\n{'='*80}")
    print(f"MISSING ELEMENTS ({len(by_type['missing_element'])} items):")
    print(f"{'='*80}")
    for diff in by_type['missing_element'][:30]:  # Show first 30
        path, severity, desc = diff[1], diff[2], diff[3]
        print(f"  [{severity}] {path}")
        if desc:
            print(f"       {desc[:120]}")

# Show extra elements
if 'extra_element' in by_type:
    print(f"\n{'='*80}")
    print(f"EXTRA ELEMENTS ({len(by_type['extra_element'])} items):")
    print(f"{'='*80}")
    for diff in by_type['extra_element'][:30]:  # Show first 30
        path, severity, desc = diff[1], diff[2], diff[3]
        print(f"  [{severity}] {path}")
        if desc:
            print(f"       {desc[:120]}")

conn.close()

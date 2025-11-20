"""
Run PQA analysis on Device 27 to measure enum extraction improvement
"""

import sqlite3
from src.utils.pqa_orchestrator import UnifiedPQAOrchestrator, FileType

def test_device_27_pqa():
    conn = sqlite3.connect('greenstack.db')
    cursor = conn.cursor()

    print("="*80)
    print("Running PQA Analysis on Device 27 (with enum extraction)")
    print("="*80)

    # Get the newly uploaded eds_file_id for Device 27
    cursor.execute('SELECT id, eds_content FROM eds_files WHERE product_code = 55514 ORDER BY id DESC LIMIT 1')
    row = cursor.fetchone()

    if not row:
        print("[ERROR] Device 27 not found in eds_files")
        conn.close()
        return

    eds_file_id, eds_content = row
    print(f"\n[1] Found eds_file_id: {eds_file_id}")

    # Check enum values
    cursor.execute('''
        SELECT COUNT(*) FROM eds_enum_values
        WHERE parameter_id IN (SELECT id FROM eds_parameters WHERE eds_file_id = ?)
    ''', (eds_file_id,))
    enum_count = cursor.fetchone()[0]
    print(f"    - Enum values in database: {enum_count}")

    if enum_count == 0:
        print("[ERROR] No enum values found! Re-upload may have failed.")
        conn.close()
        return

    # Get old scores from pqa_file_archive (device_id=27)
    cursor.execute('''
        SELECT overall_score, structural_score, attribute_score, value_score,
               missing_attributes, incorrect_attributes
        FROM pqa_quality_metrics
        WHERE device_id = 27
        ORDER BY id DESC LIMIT 1
    ''')
    old_scores = cursor.fetchone()

    if old_scores:
        print(f"\n[2] OLD SCORES (before enum fix):")
        print(f"      Overall:    {old_scores[0]:.1f}%")
        print(f"      Structural: {old_scores[1]:.1f}%")
        print(f"      Attribute:  {old_scores[2]:.1f}%")
        print(f"      Value:      {old_scores[3]:.1f}%")
        print(f"      Missing:    {old_scores[4]} attrs")
        print(f"      Incorrect:  {old_scores[5]} attrs")

    # Run PQA analysis
    print(f"\n[3] Running PQA analysis...")
    orchestrator = UnifiedPQAOrchestrator()

    try:
        orchestrator.run_full_analysis(eds_file_id, FileType.EDS, eds_content)
        print(f"    - PQA analysis completed!")

        # Get new scores
        cursor.execute('''
            SELECT overall_score, structural_score, attribute_score, value_score,
                   missing_attributes, incorrect_attributes
            FROM pqa_quality_metrics
            WHERE file_type = 'EDS'
            ORDER BY id DESC LIMIT 1
        ''')
        new_scores = cursor.fetchone()

        if new_scores and old_scores:
            print(f"\n{'='*80}")
            print("RESULTS:")
            print(f"{'='*80}")
            print(f"\n                   Before  ->  After    Change")
            print(f"  Overall:         {old_scores[0]:5.1f}% -> {new_scores[0]:5.1f}%   {new_scores[0]-old_scores[0]:+5.1f}%")
            print(f"  Structural:      {old_scores[1]:5.1f}% -> {new_scores[1]:5.1f}%   {new_scores[1]-old_scores[1]:+5.1f}%")
            print(f"  Attribute:       {old_scores[2]:5.1f}% -> {new_scores[2]:5.1f}%   {new_scores[2]-old_scores[2]:+5.1f}%")
            print(f"  Value:           {old_scores[3]:5.1f}% -> {new_scores[3]:5.1f}%   {new_scores[3]-old_scores[3]:+5.1f}%")
            print(f"  Missing attrs:   {old_scores[4]:5d}   -> {new_scores[4]:5d}     {new_scores[4]-old_scores[4]:+5d}")
            print(f"  Incorrect attrs: {old_scores[5]:5d}   -> {new_scores[5]:5d}     {new_scores[5]-old_scores[5]:+5d}")

            improvement = new_scores[0] - old_scores[0]
            print(f"\n{'='*80}")
            if improvement >= 15.0:
                print(f"[SUCCESS] Achieved {improvement:+.1f}% improvement (target: +15%)")
            elif improvement > 0:
                print(f"[PARTIAL] Achieved {improvement:+.1f}% improvement (target: +15%)")
            else:
                print(f"[ISSUE] Score changed by {improvement:+.1f}% (target: +15%)")
            print(f"{'='*80}")

    except Exception as e:
        print(f"\n[ERROR] PQA analysis failed: {e}")
        import traceback
        traceback.print_exc()

    conn.close()

if __name__ == '__main__':
    test_device_27_pqa()

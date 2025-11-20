"""
Test PQA scores on all EDS files to measure overall improvement
"""

import sqlite3
from src.utils.pqa_orchestrator import UnifiedPQAOrchestrator, FileType
import time

def test_all_eds_files():
    conn = sqlite3.connect('greenstack.db')
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    print("="*80)
    print("Testing PQA on All EDS Files")
    print("="*80)

    # Get all EDS files
    cursor.execute('SELECT DISTINCT id, product_name, product_code FROM eds_files ORDER BY id')
    files = cursor.fetchall()

    print(f"\nFound {len(files)} EDS files to test")

    total_old_score = 0
    total_new_score = 0
    files_with_old_scores = 0
    files_tested = 0
    improvements = []

    orchestrator = UnifiedPQAOrchestrator()

    for i, file_row in enumerate(files[:10], 1):  # Test first 10 files
        eds_file_id = file_row['id']
        product_name = file_row['product_name']
        product_code = file_row['product_code']

        print(f"\n[{i}/{min(10, len(files))}] Testing Device {eds_file_id}: {product_name} ({product_code})")

        # Get EDS content
        cursor.execute('SELECT eds_content FROM eds_files WHERE id = ?', (eds_file_id,))
        row = cursor.fetchone()

        if not row or not row['eds_content']:
            print(f"  [SKIP] No content")
            continue

        eds_content = row['eds_content']

        # Get old score if exists
        cursor.execute('''
            SELECT overall_score FROM pqa_quality_metrics
            WHERE device_id = ? AND file_type = 'EDS'
            ORDER BY id DESC LIMIT 1
        ''', (eds_file_id,))
        old_row = cursor.fetchone()
        old_score = old_row['overall_score'] if old_row else None

        try:
            # Run PQA
            metrics, diffs = orchestrator.run_full_analysis(eds_file_id, FileType.EDS, eds_content)
            new_score = metrics.overall_score

            files_tested += 1
            total_new_score += new_score

            if old_score is not None:
                total_old_score += old_score
                files_with_old_scores += 1
                improvement = new_score - old_score
                improvements.append(improvement)
                print(f"  Score: {old_score:.1f}% → {new_score:.1f}% ({improvement:+.1f}%)")
            else:
                print(f"  Score: {new_score:.1f}% (no baseline)")

        except Exception as e:
            print(f"  [ERROR] {e}")
            continue

    # Summary
    print("\n" + "="*80)
    print("SUMMARY")
    print("="*80)
    print(f"\nFiles tested: {files_tested}")
    print(f"Files with baseline scores: {files_with_old_scores}")

    if files_with_old_scores > 0:
        avg_old = total_old_score / files_with_old_scores
        avg_new = sum([improvements[i] + total_old_score/files_with_old_scores for i in range(len(improvements))]) / files_with_old_scores
        avg_improvement = sum(improvements) / len(improvements)

        print(f"\nAverage old score: {avg_old:.1f}%")
        print(f"Average new score: {total_new_score / files_tested:.1f}%")
        print(f"Average improvement: {avg_improvement:+.1f}%")

        # Show distribution
        print(f"\nImprovement distribution:")
        improvements_sorted = sorted(improvements, reverse=True)
        for i, imp in enumerate(improvements_sorted, 1):
            print(f"  {i:2d}. {imp:+.1f}%")

    conn.close()

if __name__ == '__main__':
    test_all_eds_files()

"""
Backfill RecordItems from Archived IODD Files

This script re-extracts RecordItem data from archived IODD files and updates
the database. This is needed because record_items storage was added after
initial device imports.

Usage:
    python scripts/backfill_record_items.py [--dry-run]
"""

import sys
import os
import sqlite3
import logging
import argparse

# Add both src and project root to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'src'))

from parsing import IODDParser
from storage.parameter import ParameterSaver
from storage.std_variable_ref import StdVariableRefSaver
from storage.build_format import BuildFormatSaver

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


def backfill_device(cursor, device_id: int, xml_content: str, dry_run: bool = False) -> dict:
    """
    Re-extract and save record items for a single device

    Returns dict with stats about what was updated
    """
    stats = {
        'param_record_items': 0,
        'record_item_info': 0,
        'single_values': 0,
        'std_variable_refs': 0,
        'build_format': False,
        'errors': []
    }

    try:
        parser = IODDParser(xml_content)
        profile = parser.parse()

        # 1. Backfill parameter record items and RecordItemInfo
        param_saver = ParameterSaver(cursor)

        for param in profile.parameters:
            # Get parameter ID from database
            cursor.execute(
                'SELECT id FROM parameters WHERE device_id = ? AND variable_id = ?',
                (device_id, param.id)
            )
            param_row = cursor.fetchone()

            if not param_row:
                continue

            param_id = param_row[0]

            # Check for record_items
            if hasattr(param, 'record_items') and param.record_items:
                # Check if already has record items
                cursor.execute(
                    'SELECT COUNT(*) FROM parameter_record_items WHERE parameter_id = ?',
                    (param_id,)
                )
                existing_count = cursor.fetchone()[0]

                if existing_count == 0:
                    if not dry_run:
                        param_saver._save_record_items(param_id, param.record_items)
                    stats['param_record_items'] += len(param.record_items)
                    logger.debug(f"  Added {len(param.record_items)} record items to {param.id}")

                # Also update data_type to RecordT if needed (parser fix)
                if not dry_run:
                    bit_length = getattr(param, 'bit_length', None)
                    subindex_access = 1 if getattr(param, 'subindex_access_supported', None) else (
                        0 if getattr(param, 'subindex_access_supported', None) is False else None
                    )
                    cursor.execute(
                        '''UPDATE parameters
                           SET data_type = 'RecordT',
                               bit_length = COALESCE(?, bit_length),
                               subindex_access_supported = COALESCE(?, subindex_access_supported)
                           WHERE id = ?''',
                        (bit_length, subindex_access, param_id)
                    )

            # Also check for RecordItemInfo
            record_item_info = getattr(param, '_record_item_info', [])
            if record_item_info:
                # Check if already has record item info
                cursor.execute(
                    'SELECT COUNT(*) FROM variable_record_item_info WHERE parameter_id = ?',
                    (param_id,)
                )
                existing_rii_count = cursor.fetchone()[0]

                if existing_rii_count == 0:
                    if not dry_run:
                        param_saver._save_record_item_info(param_id, record_item_info)
                    stats['record_item_info'] += len(record_item_info)
                    logger.debug(f"  Added {len(record_item_info)} record item info to {param.id}")

            # Backfill single_values (Parameter enumeration values)
            single_values = getattr(param, 'single_values', [])
            if single_values:
                cursor.execute(
                    'SELECT COUNT(*) FROM parameter_single_values WHERE parameter_id = ?',
                    (param_id,)
                )
                existing_sv_count = cursor.fetchone()[0]

                if existing_sv_count == 0:
                    if not dry_run:
                        param_saver._save_single_values(param_id, single_values)
                    stats['single_values'] = stats.get('single_values', 0) + len(single_values)
                    logger.debug(f"  Added {len(single_values)} single values to {param.id}")

        # 2. Backfill std_variable_refs
        if hasattr(profile, 'std_variable_refs') and profile.std_variable_refs:
            cursor.execute(
                'SELECT COUNT(*) FROM std_variable_refs WHERE device_id = ?',
                (device_id,)
            )
            existing_refs = cursor.fetchone()[0]

            if existing_refs == 0:
                if not dry_run:
                    std_ref_saver = StdVariableRefSaver(cursor)
                    std_ref_saver.save(device_id, profile.std_variable_refs)
                stats['std_variable_refs'] = len(profile.std_variable_refs)
                logger.debug(f"  Added {len(profile.std_variable_refs)} std_variable_refs")

        # 3. Backfill build format metadata
        cursor.execute(
            'SELECT COUNT(*) FROM iodd_build_format WHERE device_id = ?',
            (device_id,)
        )
        has_format = cursor.fetchone()[0] > 0

        if not has_format:
            if not dry_run:
                format_saver = BuildFormatSaver(cursor)
                format_saver.extract_and_save(device_id, xml_content)
            stats['build_format'] = True
            logger.debug(f"  Added build format metadata")

    except Exception as e:
        stats['errors'].append(str(e))
        logger.error(f"  Error processing device {device_id}: {e}")

    return stats


def main():
    parser = argparse.ArgumentParser(description='Backfill RecordItems from archived IODD files')
    parser.add_argument('--dry-run', action='store_true', help='Show what would be done without making changes')
    parser.add_argument('--device-id', type=int, help='Only process specific device ID')
    args = parser.parse_args()

    conn = sqlite3.connect('greenstack.db')
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    # Get all archived IODD files
    if args.device_id:
        cursor.execute('''
            SELECT pfa.device_id, pfa.file_content, d.product_name
            FROM pqa_file_archive pfa
            JOIN devices d ON pfa.device_id = d.id
            WHERE pfa.file_type = 'IODD' AND pfa.device_id = ?
        ''', (args.device_id,))
    else:
        cursor.execute('''
            SELECT pfa.device_id, pfa.file_content, d.product_name
            FROM pqa_file_archive pfa
            JOIN devices d ON pfa.device_id = d.id
            WHERE pfa.file_type = 'IODD'
        ''')

    def decode_content(content):
        """Decode file content (may be bytes or str)"""
        if isinstance(content, bytes):
            return content.decode('utf-8')
        return content

    archives = cursor.fetchall()

    logger.info(f"Found {len(archives)} archived IODD files to process")
    if args.dry_run:
        logger.info("DRY RUN - no changes will be made")

    total_stats = {
        'devices_processed': 0,
        'param_record_items': 0,
        'record_item_info': 0,
        'single_values': 0,
        'std_variable_refs': 0,
        'build_format': 0,
        'errors': 0
    }

    for archive in archives:
        device_id = archive['device_id']
        product_name = archive['product_name']
        xml_content = decode_content(archive['file_content'])

        logger.info(f"Processing device {device_id}: {product_name}")

        stats = backfill_device(cursor, device_id, xml_content, args.dry_run)

        total_stats['devices_processed'] += 1
        total_stats['param_record_items'] += stats['param_record_items']
        total_stats['record_item_info'] += stats['record_item_info']
        total_stats['single_values'] += stats.get('single_values', 0)
        total_stats['std_variable_refs'] += stats['std_variable_refs']
        total_stats['build_format'] += 1 if stats['build_format'] else 0
        total_stats['errors'] += len(stats['errors'])

        if stats['param_record_items'] or stats.get('single_values') or stats['std_variable_refs'] or stats['build_format']:
            logger.info(f"  Updated: {stats['param_record_items']} record_items, "
                       f"{stats.get('single_values', 0)} single_values, "
                       f"{stats['std_variable_refs']} std_var_refs")

    if not args.dry_run:
        conn.commit()

    conn.close()

    logger.info("\n=== BACKFILL SUMMARY ===")
    logger.info(f"Devices processed: {total_stats['devices_processed']}")
    logger.info(f"Parameter record items added: {total_stats['param_record_items']}")
    logger.info(f"RecordItemInfo added: {total_stats['record_item_info']}")
    logger.info(f"SingleValues added: {total_stats['single_values']}")
    logger.info(f"StdVariableRefs added: {total_stats['std_variable_refs']}")
    logger.info(f"Build format metadata added: {total_stats['build_format']}")
    logger.info(f"Errors: {total_stats['errors']}")


if __name__ == '__main__':
    main()

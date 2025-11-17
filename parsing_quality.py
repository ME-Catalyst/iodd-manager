"""
Parsing Quality Analysis System
Comprehensive diagnostics and quality scoring for EDS and IODD files
"""

import sqlite3
from typing import Dict, List, Any, Optional
from pathlib import Path
import json


class ParsingQualityAnalyzer:
    """Analyzes parsing quality for EDS and IODD files"""

    def __init__(self, db_path: str = "greenstack.db"):
        self.db_path = db_path

    def get_connection(self):
        """Get database connection"""
        return sqlite3.connect(self.db_path)

    def analyze_eds_quality(self) -> Dict[str, Any]:
        """Comprehensive EDS parsing quality analysis"""
        conn = self.get_connection()
        cursor = conn.cursor()

        # Get total EDS files
        cursor.execute("SELECT COUNT(*) FROM eds_files")
        total_files = cursor.fetchone()[0]

        # Get diagnostic statistics
        cursor.execute("""
            SELECT severity, COUNT(*) as count
            FROM eds_diagnostics
            GROUP BY severity
        """)
        diagnostics_by_severity = {row[0]: row[1] for row in cursor.fetchall()}

        # Get files with issues (using diagnostic count columns)
        cursor.execute("""
            SELECT
                id,
                product_name,
                vendor_name,
                product_code,
                vendor_code,
                diagnostic_fatal_count,
                diagnostic_error_count,
                diagnostic_warn_count,
                diagnostic_info_count
            FROM eds_files
            WHERE has_parsing_issues = 1
            ORDER BY diagnostic_fatal_count DESC, diagnostic_error_count DESC, diagnostic_warn_count DESC
        """)
        files_with_issues = []
        for row in cursor.fetchall():
            files_with_issues.append({
                "id": row[0],
                "product_name": row[1] or "Unknown",
                "vendor_name": row[2] or "Unknown",
                "product_code": row[3],
                "vendor_code": row[4],
                "fatal": row[5],
                "errors": row[6],
                "warnings": row[7],
                "info": row[8],
                "total_issues": row[5] + row[6] + row[7] + row[8]
            })

        # Get most common diagnostic codes
        cursor.execute("""
            SELECT code, severity, message, COUNT(*) as count
            FROM eds_diagnostics
            GROUP BY code, severity
            ORDER BY count DESC
            LIMIT 20
        """)
        common_codes = []
        for row in cursor.fetchall():
            common_codes.append({
                "code": row[0],
                "severity": row[1],
                "message": row[2],
                "count": row[3]
            })

        # Calculate quality score
        total_diagnostics = sum(diagnostics_by_severity.values())
        fatal_count = diagnostics_by_severity.get('FATAL', 0)
        error_count = diagnostics_by_severity.get('ERROR', 0)
        warn_count = diagnostics_by_severity.get('WARN', 0)

        # Quality score: 100 - (weighted penalties)
        quality_score = 100
        if total_files > 0:
            quality_score -= (fatal_count / total_files) * 50  # Fatal: -50 per file
            quality_score -= (error_count / total_files) * 20  # Error: -20 per file
            quality_score -= (warn_count / total_files) * 5    # Warn: -5 per file
            quality_score = max(0, min(100, quality_score))

        # Get completeness metrics
        cursor.execute("""
            SELECT
                COUNT(*) as total,
                COUNT(CASE WHEN product_name IS NOT NULL AND product_name != '' THEN 1 END) as with_name,
                COUNT(CASE WHEN vendor_name IS NOT NULL AND vendor_name != '' THEN 1 END) as with_vendor,
                COUNT(CASE WHEN description IS NOT NULL AND description != '' THEN 1 END) as with_description,
                COUNT(CASE WHEN icon_data IS NOT NULL THEN 1 END) as with_icon
            FROM eds_files
        """)
        completeness_row = cursor.fetchone()
        completeness = {
            "total": completeness_row[0],
            "with_product_name": completeness_row[1],
            "with_vendor_name": completeness_row[2],
            "with_description": completeness_row[3],
            "with_icon": completeness_row[4],
            "product_name_pct": (completeness_row[1] / completeness_row[0] * 100) if completeness_row[0] > 0 else 0,
            "vendor_name_pct": (completeness_row[2] / completeness_row[0] * 100) if completeness_row[0] > 0 else 0,
            "description_pct": (completeness_row[3] / completeness_row[0] * 100) if completeness_row[0] > 0 else 0,
            "icon_pct": (completeness_row[4] / completeness_row[0] * 100) if completeness_row[0] > 0 else 0
        }

        # Get parameter statistics
        cursor.execute("""
            SELECT
                COUNT(DISTINCT eds_file_id) as files_with_params,
                COUNT(*) as total_params,
                AVG(param_count) as avg_params_per_file
            FROM (
                SELECT eds_file_id, COUNT(*) as param_count
                FROM eds_parameters
                GROUP BY eds_file_id
            )
        """)
        param_stats = cursor.fetchone()

        conn.close()

        return {
            "total_files": total_files,
            "files_with_issues": len(files_with_issues),
            "files_clean": total_files - len(files_with_issues),
            "quality_score": round(quality_score, 2),
            "diagnostics_by_severity": diagnostics_by_severity,
            "total_diagnostics": total_diagnostics,
            "files_with_issues_detail": files_with_issues[:50],  # Limit to 50
            "common_codes": common_codes,
            "completeness": completeness,
            "parameters": {
                "files_with_params": param_stats[0] if param_stats[0] else 0,
                "total_params": param_stats[1] if param_stats[1] else 0,
                "avg_params_per_file": round(param_stats[2], 2) if param_stats[2] else 0
            }
        }

    def analyze_iodd_quality(self) -> Dict[str, Any]:
        """Comprehensive IODD parsing quality analysis"""
        conn = self.get_connection()
        cursor = conn.cursor()

        # Get total IODD files
        cursor.execute("SELECT COUNT(*) FROM iodd_files")
        total_files = cursor.fetchone()[0]

        # Get files with missing critical fields
        cursor.execute("""
            SELECT
                id,
                vendor_name,
                device_name,
                product_id,
                vendor_id,
                CASE WHEN vendor_name IS NULL OR vendor_name = '' THEN 1 ELSE 0 END as missing_vendor,
                CASE WHEN device_name IS NULL OR device_name = '' THEN 1 ELSE 0 END as missing_device,
                CASE WHEN product_id IS NULL THEN 1 ELSE 0 END as missing_product_id
            FROM iodd_files
        """)

        files_with_issues = []
        missing_vendor = 0
        missing_device = 0
        missing_product_id = 0

        for row in cursor.fetchall():
            issues = []
            if row[5]:
                missing_vendor += 1
                issues.append("Missing vendor name")
            if row[6]:
                missing_device += 1
                issues.append("Missing device name")
            if row[7]:
                missing_product_id += 1
                issues.append("Missing product ID")

            if issues:
                files_with_issues.append({
                    "id": row[0],
                    "vendor_name": row[1] or "N/A",
                    "device_name": row[2] or "N/A",
                    "product_id": row[3],
                    "vendor_id": row[4],
                    "issues": issues
                })

        # Get completeness metrics
        cursor.execute("""
            SELECT
                COUNT(*) as total,
                COUNT(CASE WHEN vendor_name IS NOT NULL AND vendor_name != '' THEN 1 END) as with_vendor,
                COUNT(CASE WHEN device_name IS NOT NULL AND device_name != '' THEN 1 END) as with_device,
                COUNT(CASE WHEN product_id IS NOT NULL THEN 1 END) as with_product_id,
                COUNT(CASE WHEN vendor_id IS NOT NULL THEN 1 END) as with_vendor_id,
                COUNT(CASE WHEN io_link_revision IS NOT NULL AND io_link_revision != '' THEN 1 END) as with_revision
            FROM iodd_files
        """)
        comp_row = cursor.fetchone()
        completeness = {
            "total": comp_row[0],
            "with_vendor_name": comp_row[1],
            "with_device_name": comp_row[2],
            "with_product_id": comp_row[3],
            "with_vendor_id": comp_row[4],
            "with_io_link_revision": comp_row[5],
            "vendor_name_pct": (comp_row[1] / comp_row[0] * 100) if comp_row[0] > 0 else 0,
            "device_name_pct": (comp_row[2] / comp_row[0] * 100) if comp_row[0] > 0 else 0,
            "product_id_pct": (comp_row[3] / comp_row[0] * 100) if comp_row[0] > 0 else 0
        }

        # Calculate quality score
        quality_score = 100
        if total_files > 0:
            quality_score -= (missing_vendor / total_files) * 30
            quality_score -= (missing_device / total_files) * 30
            quality_score -= (missing_product_id / total_files) * 20
            quality_score = max(0, min(100, quality_score))

        # Get parameter statistics
        cursor.execute("""
            SELECT
                COUNT(DISTINCT iodd_file_id) as files_with_params,
                COUNT(*) as total_params,
                AVG(param_count) as avg_params_per_file
            FROM (
                SELECT iodd_file_id, COUNT(*) as param_count
                FROM iodd_parameters
                GROUP BY iodd_file_id
            )
        """)
        param_stats = cursor.fetchone()

        # Get variable statistics
        cursor.execute("""
            SELECT
                COUNT(DISTINCT iodd_file_id) as files_with_vars,
                COUNT(*) as total_vars
            FROM iodd_variables
        """)
        var_stats = cursor.fetchone()

        conn.close()

        return {
            "total_files": total_files,
            "files_with_issues": len(files_with_issues),
            "files_clean": total_files - len(files_with_issues),
            "quality_score": round(quality_score, 2),
            "issues_summary": {
                "missing_vendor_name": missing_vendor,
                "missing_device_name": missing_device,
                "missing_product_id": missing_product_id
            },
            "files_with_issues_detail": files_with_issues[:50],  # Limit to 50
            "completeness": completeness,
            "parameters": {
                "files_with_params": param_stats[0] if param_stats[0] else 0,
                "total_params": param_stats[1] if param_stats[1] else 0,
                "avg_params_per_file": round(param_stats[2], 2) if param_stats[2] else 0
            },
            "variables": {
                "files_with_vars": var_stats[0] if var_stats[0] else 0,
                "total_vars": var_stats[1] if var_stats[1] else 0
            }
        }


if __name__ == "__main__":
    analyzer = ParsingQualityAnalyzer()

    print("=== EDS Parsing Quality Analysis ===")
    eds_quality = analyzer.analyze_eds_quality()
    print(json.dumps(eds_quality, indent=2))

    print("\n=== IODD Parsing Quality Analysis ===")
    iodd_quality = analyzer.analyze_iodd_quality()
    print(json.dumps(iodd_quality, indent=2))

"""
EDS Diff Analysis Tool

Compares original EDS files against reconstructed EDS for Parser Quality Assurance.
Handles INI-format specific comparison logic.
"""

import logging
import configparser
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
from enum import Enum

logger = logging.getLogger(__name__)


class EDSDiffSeverity(Enum):
    """Severity levels for EDS diff items"""
    CRITICAL = "CRITICAL"  # Data loss - required sections/keys missing
    HIGH = "HIGH"          # Incorrect values - functional impact
    MEDIUM = "MEDIUM"      # Non-critical differences
    LOW = "LOW"            # Minor differences
    INFO = "INFO"          # Informational only


class EDSDiffType(Enum):
    """Types of EDS differences"""
    MISSING_SECTION = "missing_section"
    EXTRA_SECTION = "extra_section"
    MISSING_KEY = "missing_key"
    EXTRA_KEY = "extra_key"
    VALUE_CHANGED = "value_changed"
    FORMAT_DIFF = "format_diff"


@dataclass
class EDSDiffItem:
    """Individual EDS difference item"""
    diff_type: EDSDiffType
    severity: EDSDiffSeverity
    location: str  # Section or Section.Key
    expected_value: Optional[str]
    actual_value: Optional[str]
    description: str


@dataclass
class EDSQualityMetrics:
    """EDS Quality metrics from diff analysis"""
    overall_score: float
    section_score: float
    key_score: float
    value_score: float

    total_sections_original: int
    total_sections_reconstructed: int
    missing_sections: int
    extra_sections: int

    total_keys_original: int
    total_keys_reconstructed: int
    missing_keys: int
    incorrect_values: int

    data_loss_percentage: float
    critical_data_loss: bool

    # EDS-specific component scores
    device_identity_score: float = 0.0
    parameters_score: float = 0.0
    assemblies_score: float = 0.0
    connections_score: float = 0.0
    capacity_score: float = 0.0


class EDSDiffAnalyzer:
    """
    Analyzes differences between original and reconstructed EDS files
    """

    # Weights for overall scoring
    WEIGHTS = {
        'section': 0.35,  # Section structure matching
        'key': 0.35,      # Key presence matching
        'value': 0.30     # Value accuracy
    }

    # Critical sections that must not be lost
    CRITICAL_SECTIONS = {
        'File', 'Device', 'Params', 'Assembly',
        'Connection Manager', 'Port'
    }

    # Critical keys within sections
    CRITICAL_KEYS = {
        'Device': ['VendCode', 'ProdCode', 'VendName', 'ProdName'],
        'Params': ['Num_Params'],
        'Assembly': ['Num_Assemblies'],
    }

    def __init__(self, db_path: str = "greenstack.db"):
        self.db_path = db_path

    def analyze(self, original_eds: str, reconstructed_eds: str) -> Tuple[EDSQualityMetrics, List[EDSDiffItem]]:
        """
        Perform comprehensive EDS diff analysis

        Args:
            original_eds: Original EDS file content
            reconstructed_eds: Reconstructed EDS from database

        Returns:
            Tuple of (EDSQualityMetrics, List[EDSDiffItem])
        """
        # Parse EDS files as INI
        original_config = self._parse_eds(original_eds)
        reconstructed_config = self._parse_eds(reconstructed_eds)

        # Collect statistics
        original_stats = self._collect_eds_stats(original_config)
        reconstructed_stats = self._collect_eds_stats(reconstructed_config)

        # Find differences
        diff_items = self._find_differences(original_config, reconstructed_config)

        # Calculate metrics
        metrics = self._calculate_metrics(
            original_stats,
            reconstructed_stats,
            diff_items
        )

        return metrics, diff_items

    def _parse_eds(self, eds_content: str) -> configparser.ConfigParser:
        """Parse EDS file (INI format) into ConfigParser"""
        config = configparser.ConfigParser(allow_no_value=True, strict=False)
        config.optionxform = str  # Preserve case sensitivity

        try:
            config.read_string(eds_content)
        except configparser.Error as e:
            logger.error(f"EDS parsing error: {e}")
            # Create empty config to continue analysis
            config = configparser.ConfigParser()

        return config

    def _collect_eds_stats(self, config: configparser.ConfigParser) -> Dict:
        """Collect statistics about EDS configuration"""
        stats = {
            'total_sections': len(config.sections()),
            'total_keys': 0,
            'sections_by_name': {},
            'keys_by_section': {}
        }

        for section in config.sections():
            keys = list(config[section].keys())
            stats['total_keys'] += len(keys)
            stats['sections_by_name'][section] = len(keys)
            stats['keys_by_section'][section] = keys

        return stats

    def _find_differences(self, original: configparser.ConfigParser,
                         reconstructed: configparser.ConfigParser) -> List[EDSDiffItem]:
        """Find differences between two EDS configurations"""
        diffs = []

        # Get all unique sections
        original_sections = set(original.sections())
        reconstructed_sections = set(reconstructed.sections())

        # Missing sections
        for section in original_sections - reconstructed_sections:
            severity = EDSDiffSeverity.CRITICAL if section in self.CRITICAL_SECTIONS else EDSDiffSeverity.HIGH
            diffs.append(EDSDiffItem(
                diff_type=EDSDiffType.MISSING_SECTION,
                severity=severity,
                location=f"[{section}]",
                expected_value=section,
                actual_value=None,
                description=f"Missing section [{section}]"
            ))

        # Extra sections (in reconstructed but not original)
        for section in reconstructed_sections - original_sections:
            diffs.append(EDSDiffItem(
                diff_type=EDSDiffType.EXTRA_SECTION,
                severity=EDSDiffSeverity.LOW,
                location=f"[{section}]",
                expected_value=None,
                actual_value=section,
                description=f"Extra section [{section}] not in original"
            ))

        # Compare common sections
        for section in original_sections & reconstructed_sections:
            section_diffs = self._compare_section(
                section,
                original[section],
                reconstructed[section]
            )
            diffs.extend(section_diffs)

        return diffs

    def _compare_section(self, section_name: str,
                        original_section: configparser.SectionProxy,
                        reconstructed_section: configparser.SectionProxy) -> List[EDSDiffItem]:
        """Compare two sections key-by-key"""
        diffs = []

        original_keys = set(original_section.keys())
        reconstructed_keys = set(reconstructed_section.keys())

        # Critical keys for this section
        critical_keys = self.CRITICAL_KEYS.get(section_name, [])

        # Missing keys
        for key in original_keys - reconstructed_keys:
            severity = EDSDiffSeverity.CRITICAL if key in critical_keys else EDSDiffSeverity.HIGH
            diffs.append(EDSDiffItem(
                diff_type=EDSDiffType.MISSING_KEY,
                severity=severity,
                location=f"[{section_name}].{key}",
                expected_value=original_section[key],
                actual_value=None,
                description=f"Missing key '{key}' in section [{section_name}]"
            ))

        # Extra keys
        for key in reconstructed_keys - original_keys:
            diffs.append(EDSDiffItem(
                diff_type=EDSDiffType.EXTRA_KEY,
                severity=EDSDiffSeverity.LOW,
                location=f"[{section_name}].{key}",
                expected_value=None,
                actual_value=reconstructed_section[key],
                description=f"Extra key '{key}' in section [{section_name}]"
            ))

        # Compare common keys
        for key in original_keys & reconstructed_keys:
            original_value = original_section[key]
            reconstructed_value = reconstructed_section[key]

            if original_value != reconstructed_value:
                # Normalize whitespace for comparison
                orig_normalized = ' '.join(original_value.split())
                recon_normalized = ' '.join(reconstructed_value.split())

                if orig_normalized != recon_normalized:
                    severity = EDSDiffSeverity.HIGH if key in critical_keys else EDSDiffSeverity.MEDIUM
                    diffs.append(EDSDiffItem(
                        diff_type=EDSDiffType.VALUE_CHANGED,
                        severity=severity,
                        location=f"[{section_name}].{key}",
                        expected_value=original_value,
                        actual_value=reconstructed_value,
                        description=f"Value mismatch for key '{key}'"
                    ))

        return diffs

    def _calculate_metrics(self, original_stats: Dict, reconstructed_stats: Dict,
                          diff_items: List[EDSDiffItem]) -> EDSQualityMetrics:
        """Calculate quality metrics from statistics and diffs"""

        # Count different types of issues
        missing_sections = sum(1 for d in diff_items if d.diff_type == EDSDiffType.MISSING_SECTION)
        extra_sections = sum(1 for d in diff_items if d.diff_type == EDSDiffType.EXTRA_SECTION)
        missing_keys = sum(1 for d in diff_items if d.diff_type == EDSDiffType.MISSING_KEY)
        value_changes = sum(1 for d in diff_items if d.diff_type == EDSDiffType.VALUE_CHANGED)

        # Section score
        total_sections = original_stats['total_sections']
        if total_sections > 0:
            section_score = max(0, 100 * (1 - (missing_sections + extra_sections) / total_sections))
        else:
            section_score = 0.0

        # Key score
        total_keys = original_stats['total_keys']
        if total_keys > 0:
            key_score = max(0, 100 * (1 - missing_keys / total_keys))
        else:
            key_score = 100.0

        # Value score
        if total_keys > 0:
            value_score = max(0, 100 * (1 - value_changes / total_keys))
        else:
            value_score = 100.0

        # Overall score (weighted average)
        overall_score = (
            section_score * self.WEIGHTS['section'] +
            key_score * self.WEIGHTS['key'] +
            value_score * self.WEIGHTS['value']
        )

        # Data loss calculation
        data_loss_percentage = (missing_keys / total_keys * 100) if total_keys > 0 else 0

        # Critical data loss check
        critical_data_loss = any(
            d.severity == EDSDiffSeverity.CRITICAL for d in diff_items
        )

        # Calculate component-specific scores
        component_scores = self._calculate_component_scores(diff_items)

        return EDSQualityMetrics(
            overall_score=overall_score,
            section_score=section_score,
            key_score=key_score,
            value_score=value_score,
            total_sections_original=original_stats['total_sections'],
            total_sections_reconstructed=reconstructed_stats['total_sections'],
            missing_sections=missing_sections,
            extra_sections=extra_sections,
            total_keys_original=original_stats['total_keys'],
            total_keys_reconstructed=reconstructed_stats['total_keys'],
            missing_keys=missing_keys,
            incorrect_values=value_changes,
            data_loss_percentage=data_loss_percentage,
            critical_data_loss=critical_data_loss,
            device_identity_score=component_scores.get('device', 100.0),
            parameters_score=component_scores.get('params', 100.0),
            assemblies_score=component_scores.get('assembly', 100.0),
            connections_score=component_scores.get('connections', 100.0),
            capacity_score=component_scores.get('capacity', 100.0)
        )

    def _calculate_component_scores(self, diff_items: List[EDSDiffItem]) -> Dict[str, float]:
        """Calculate component-specific quality scores"""
        # Component section indicators
        component_sections = {
            'device': ['Device', 'Device Classification'],
            'params': ['Params', 'EnumPar'],
            'assembly': ['Assembly'],
            'connections': ['Connection Manager'],
            'capacity': ['Capacity', 'Port']
        }

        component_scores = {}

        for component_name, sections in component_sections.items():
            # Count issues in this component
            component_issues = sum(
                1 for d in diff_items
                if any(sec.lower() in d.location.lower() for sec in sections)
            )

            # Simple scoring: 100% if no issues, decreases with issues
            if component_issues == 0:
                component_scores[component_name] = 100.0
            else:
                # Deduct 5 points per issue, minimum 0
                component_scores[component_name] = max(0.0, 100.0 - (component_issues * 5))

        return component_scores

    def format_diff_report(self, metrics: EDSQualityMetrics, diff_items: List[EDSDiffItem]) -> str:
        """Format a human-readable EDS diff report"""
        report = []
        report.append("=" * 80)
        report.append("EDS PARSER QUALITY ANALYSIS REPORT")
        report.append("=" * 80)
        report.append("")

        # Overall scores
        report.append("OVERALL QUALITY METRICS:")
        report.append(f"  Overall Score:    {metrics.overall_score:.1f}%")
        report.append(f"  Section Score:    {metrics.section_score:.1f}%")
        report.append(f"  Key Score:        {metrics.key_score:.1f}%")
        report.append(f"  Value Score:      {metrics.value_score:.1f}%")
        report.append(f"  Data Loss:        {metrics.data_loss_percentage:.2f}%")
        report.append("")

        # Section statistics
        report.append("SECTION STATISTICS:")
        report.append(f"  Original Sections:      {metrics.total_sections_original}")
        report.append(f"  Reconstructed Sections: {metrics.total_sections_reconstructed}")
        report.append(f"  Missing Sections:       {metrics.missing_sections}")
        report.append(f"  Extra Sections:         {metrics.extra_sections}")
        report.append("")

        # Key statistics
        report.append("KEY/VALUE STATISTICS:")
        report.append(f"  Original Keys:      {metrics.total_keys_original}")
        report.append(f"  Reconstructed Keys: {metrics.total_keys_reconstructed}")
        report.append(f"  Missing Keys:       {metrics.missing_keys}")
        report.append(f"  Incorrect Values:   {metrics.incorrect_values}")
        report.append("")

        # Component scores
        report.append("COMPONENT COVERAGE SCORES:")
        report.append(f"  Device Identity:       {metrics.device_identity_score:.1f}%")
        report.append(f"  Parameters:            {metrics.parameters_score:.1f}%")
        report.append(f"  Assemblies:            {metrics.assemblies_score:.1f}%")
        report.append(f"  Connections:           {metrics.connections_score:.1f}%")
        report.append(f"  Capacity/Ports:        {metrics.capacity_score:.1f}%")
        report.append("")

        # Diff items by severity
        critical = [d for d in diff_items if d.severity == EDSDiffSeverity.CRITICAL]
        high = [d for d in diff_items if d.severity == EDSDiffSeverity.HIGH]
        medium = [d for d in diff_items if d.severity == EDSDiffSeverity.MEDIUM]

        if critical:
            report.append(f"CRITICAL ISSUES ({len(critical)}):")
            for item in critical[:10]:
                report.append(f"  - {item.description}")
                report.append(f"    Location: {item.location}")
            report.append("")

        if high:
            report.append(f"HIGH PRIORITY ISSUES ({len(high)}):")
            for item in high[:10]:
                report.append(f"  - {item.description}")
                report.append(f"    Location: {item.location}")
            report.append("")

        if medium:
            report.append(f"MEDIUM PRIORITY ISSUES ({len(medium)}):")
            report.append(f"  Total: {len(medium)} issues")
            report.append("")

        report.append("=" * 80)
        return "\n".join(report)


def analyze_eds_diff(original_eds: str, reconstructed_eds: str,
                     db_path: str = "greenstack.db") -> Tuple[EDSQualityMetrics, List[EDSDiffItem]]:
    """
    Analyze differences between original and reconstructed EDS files

    Args:
        original_eds: Original EDS file content
        reconstructed_eds: Reconstructed EDS from database
        db_path: Path to database

    Returns:
        Tuple of (EDSQualityMetrics, List[EDSDiffItem])
    """
    analyzer = EDSDiffAnalyzer(db_path)
    return analyzer.analyze(original_eds, reconstructed_eds)

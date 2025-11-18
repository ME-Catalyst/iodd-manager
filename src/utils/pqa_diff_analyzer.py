"""
PQA Diff Analysis Tool

Compares original IODD XML against reconstructed XML to identify parser quality issues.
Provides detailed diff reports with severity categorization.
"""

import logging
from typing import Dict, List, Optional, Tuple
from xml.etree import ElementTree as ET
from dataclasses import dataclass
from enum import Enum

logger = logging.getLogger(__name__)


class DiffSeverity(Enum):
    """Severity levels for diff items"""
    CRITICAL = "CRITICAL"  # Data loss - required elements missing
    HIGH = "HIGH"          # Incorrect values - functional impact
    MEDIUM = "MEDIUM"      # Non-critical differences
    LOW = "LOW"            # Minor differences (ordering, whitespace)
    INFO = "INFO"          # Informational only


class DiffType(Enum):
    """Types of differences"""
    MISSING_ELEMENT = "missing_element"
    EXTRA_ELEMENT = "extra_element"
    MISSING_ATTRIBUTE = "missing_attribute"
    INCORRECT_ATTRIBUTE = "incorrect_attribute"
    VALUE_CHANGED = "value_changed"
    TYPE_CHANGED = "type_changed"
    ORDERING_DIFF = "ordering_diff"


@dataclass
class DiffItem:
    """Individual difference item"""
    diff_type: DiffType
    severity: DiffSeverity
    xpath: str
    expected_value: Optional[str]
    actual_value: Optional[str]
    description: str
    phase: Optional[str] = None  # Which phase this relates to


@dataclass
class QualityMetrics:
    """Overall quality metrics from diff analysis"""
    overall_score: float
    structural_score: float
    attribute_score: float
    value_score: float

    total_elements_original: int
    total_elements_reconstructed: int
    missing_elements: int
    extra_elements: int

    total_attributes_original: int
    total_attributes_reconstructed: int
    missing_attributes: int
    incorrect_attributes: int

    data_loss_percentage: float
    critical_data_loss: bool

    phase1_score: float = 0.0  # UI Rendering
    phase2_score: float = 0.0  # Variants & Conditions
    phase3_score: float = 0.0  # Menu Buttons
    phase4_score: float = 0.0  # Wiring & Test
    phase5_score: float = 0.0  # Custom Datatypes


class DiffAnalyzer:
    """
    Analyzes differences between original and reconstructed IODD XML
    """

    # Weights for overall scoring
    WEIGHTS = {
        'structural': 0.40,  # Most important - structure must match
        'attribute': 0.35,   # Attributes critical for functionality
        'value': 0.25        # Values important but less critical
    }

    # Critical elements that must not be lost
    CRITICAL_ELEMENTS = {
        'DeviceIdentity', 'DeviceFunction', 'ProcessData',
        'VendorId', 'DeviceId', 'Datatype'
    }

    def __init__(self, db_path: str = "greenstack.db"):
        self.db_path = db_path

    def analyze(self, original_xml: str, reconstructed_xml: str) -> Tuple[QualityMetrics, List[DiffItem]]:
        """
        Perform comprehensive diff analysis

        Args:
            original_xml: Original IODD XML string
            reconstructed_xml: Reconstructed XML from database

        Returns:
            Tuple of (QualityMetrics, List[DiffItem])
        """
        # Parse XML
        try:
            original_tree = ET.fromstring(original_xml)
            reconstructed_tree = ET.fromstring(reconstructed_xml)
        except ET.ParseError as e:
            logger.error(f"XML parsing error: {e}")
            raise

        # Collect statistics
        original_stats = self._collect_xml_stats(original_tree)
        reconstructed_stats = self._collect_xml_stats(reconstructed_tree)

        # Find differences
        diff_items = self._find_differences(original_tree, reconstructed_tree)

        # Calculate metrics
        metrics = self._calculate_metrics(
            original_stats,
            reconstructed_stats,
            diff_items
        )

        return metrics, diff_items

    def _collect_xml_stats(self, tree: ET.Element) -> Dict:
        """Collect statistics about XML tree"""
        stats = {
            'total_elements': 0,
            'total_attributes': 0,
            'elements_by_tag': {},
            'max_depth': 0
        }

        def traverse(elem: ET.Element, depth: int = 0):
            stats['total_elements'] += 1
            stats['total_attributes'] += len(elem.attrib)
            stats['max_depth'] = max(stats['max_depth'], depth)

            tag = elem.tag.split('}')[-1]  # Remove namespace
            stats['elements_by_tag'][tag] = stats['elements_by_tag'].get(tag, 0) + 1

            for child in elem:
                traverse(child, depth + 1)

        traverse(tree)
        return stats

    def _find_differences(self, original: ET.Element, reconstructed: ET.Element,
                         xpath: str = "/") -> List[DiffItem]:
        """
        Recursively find differences between two XML trees

        Args:
            original: Original XML element
            reconstructed: Reconstructed XML element
            xpath: Current XPath for tracking location

        Returns:
            List of DiffItem objects
        """
        diffs = []

        # Strip namespaces for comparison
        orig_tag = original.tag.split('}')[-1]
        recon_tag = reconstructed.tag.split('}')[-1]

        current_xpath = f"{xpath}{orig_tag}"

        # Check if tags match
        if orig_tag != recon_tag:
            diffs.append(DiffItem(
                diff_type=DiffType.TYPE_CHANGED,
                severity=DiffSeverity.CRITICAL,
                xpath=current_xpath,
                expected_value=orig_tag,
                actual_value=recon_tag,
                description=f"Element type changed from {orig_tag} to {recon_tag}"
            ))
            return diffs  # Can't continue comparison if tags don't match

        # Check attributes
        orig_attrs = original.attrib
        recon_attrs = reconstructed.attrib

        # Missing attributes
        for attr_name, attr_value in orig_attrs.items():
            if attr_name not in recon_attrs:
                severity = DiffSeverity.HIGH if attr_name in ['id', 'type', 'bitLength'] else DiffSeverity.MEDIUM
                diffs.append(DiffItem(
                    diff_type=DiffType.MISSING_ATTRIBUTE,
                    severity=severity,
                    xpath=f"{current_xpath}@{attr_name}",
                    expected_value=attr_value,
                    actual_value=None,
                    description=f"Missing attribute '{attr_name}'"
                ))
            elif recon_attrs[attr_name] != attr_value:
                severity = DiffSeverity.HIGH if attr_name in ['id', 'type'] else DiffSeverity.MEDIUM
                diffs.append(DiffItem(
                    diff_type=DiffType.INCORRECT_ATTRIBUTE,
                    severity=severity,
                    xpath=f"{current_xpath}@{attr_name}",
                    expected_value=attr_value,
                    actual_value=recon_attrs[attr_name],
                    description=f"Attribute '{attr_name}' value mismatch"
                ))

        # Extra attributes (in reconstructed but not original)
        for attr_name in recon_attrs:
            if attr_name not in orig_attrs:
                diffs.append(DiffItem(
                    diff_type=DiffType.EXTRA_ELEMENT,
                    severity=DiffSeverity.LOW,
                    xpath=f"{current_xpath}@{attr_name}",
                    expected_value=None,
                    actual_value=recon_attrs[attr_name],
                    description=f"Extra attribute '{attr_name}' not in original"
                ))

        # Check text content
        if original.text != reconstructed.text:
            if original.text and not reconstructed.text:
                diffs.append(DiffItem(
                    diff_type=DiffType.VALUE_CHANGED,
                    severity=DiffSeverity.MEDIUM,
                    xpath=current_xpath,
                    expected_value=original.text,
                    actual_value=None,
                    description="Text content missing"
                ))
            elif original.text != reconstructed.text:
                diffs.append(DiffItem(
                    diff_type=DiffType.VALUE_CHANGED,
                    severity=DiffSeverity.MEDIUM,
                    xpath=current_xpath,
                    expected_value=original.text,
                    actual_value=reconstructed.text,
                    description="Text content differs"
                ))

        # Compare children
        orig_children = list(original)
        recon_children = list(reconstructed)

        # Create maps by tag for matching
        orig_by_tag = {}
        for child in orig_children:
            tag = child.tag.split('}')[-1]
            if tag not in orig_by_tag:
                orig_by_tag[tag] = []
            orig_by_tag[tag].append(child)

        recon_by_tag = {}
        for child in recon_children:
            tag = child.tag.split('}')[-1]
            if tag not in recon_by_tag:
                recon_by_tag[tag] = []
            recon_by_tag[tag].append(child)

        # Find missing children
        for tag, children in orig_by_tag.items():
            if tag not in recon_by_tag:
                severity = DiffSeverity.CRITICAL if tag in self.CRITICAL_ELEMENTS else DiffSeverity.HIGH
                for child in children:
                    child_id = child.attrib.get('id', 'unknown')
                    diffs.append(DiffItem(
                        diff_type=DiffType.MISSING_ELEMENT,
                        severity=severity,
                        xpath=f"{current_xpath}/{tag}[{child_id}]",
                        expected_value=tag,
                        actual_value=None,
                        description=f"Missing child element '{tag}'"
                    ))
            else:
                # Compare matching children
                for i, orig_child in enumerate(children):
                    if i < len(recon_by_tag[tag]):
                        recon_child = recon_by_tag[tag][i]
                        child_diffs = self._find_differences(
                            orig_child,
                            recon_child,
                            f"{current_xpath}/"
                        )
                        diffs.extend(child_diffs)

        # Find extra children
        for tag, children in recon_by_tag.items():
            if tag not in orig_by_tag:
                for child in children:
                    child_id = child.attrib.get('id', 'unknown')
                    diffs.append(DiffItem(
                        diff_type=DiffType.EXTRA_ELEMENT,
                        severity=DiffSeverity.LOW,
                        xpath=f"{current_xpath}/{tag}[{child_id}]",
                        expected_value=None,
                        actual_value=tag,
                        description=f"Extra child element '{tag}' not in original"
                    ))

        return diffs

    def _calculate_metrics(self, original_stats: Dict, reconstructed_stats: Dict,
                          diff_items: List[DiffItem]) -> QualityMetrics:
        """Calculate quality metrics from statistics and diffs"""

        # Count different types of issues
        missing_elements = sum(1 for d in diff_items if d.diff_type == DiffType.MISSING_ELEMENT)
        extra_elements = sum(1 for d in diff_items if d.diff_type == DiffType.EXTRA_ELEMENT)
        missing_attributes = sum(1 for d in diff_items if d.diff_type == DiffType.MISSING_ATTRIBUTE)
        incorrect_attributes = sum(1 for d in diff_items if d.diff_type == DiffType.INCORRECT_ATTRIBUTE)

        # Structural score (based on element matching)
        total_elements = original_stats['total_elements']
        if total_elements > 0:
            structural_score = max(0, 100 * (1 - (missing_elements + extra_elements) / total_elements))
        else:
            structural_score = 0.0

        # Attribute score
        total_attributes = original_stats['total_attributes']
        if total_attributes > 0:
            attribute_score = max(0, 100 * (1 - (missing_attributes + incorrect_attributes) / total_attributes))
        else:
            attribute_score = 100.0

        # Value score (based on value changes)
        value_changes = sum(1 for d in diff_items if d.diff_type == DiffType.VALUE_CHANGED)
        if total_elements > 0:
            value_score = max(0, 100 * (1 - value_changes / total_elements))
        else:
            value_score = 100.0

        # Overall score (weighted average)
        overall_score = (
            structural_score * self.WEIGHTS['structural'] +
            attribute_score * self.WEIGHTS['attribute'] +
            value_score * self.WEIGHTS['value']
        )

        # Data loss calculation
        data_loss_percentage = (missing_elements / total_elements * 100) if total_elements > 0 else 0

        # Critical data loss check
        critical_data_loss = any(
            d.severity == DiffSeverity.CRITICAL for d in diff_items
        )

        # Calculate phase-specific scores
        phase_scores = self._calculate_phase_scores(diff_items)

        return QualityMetrics(
            overall_score=overall_score,
            structural_score=structural_score,
            attribute_score=attribute_score,
            value_score=value_score,
            total_elements_original=original_stats['total_elements'],
            total_elements_reconstructed=reconstructed_stats['total_elements'],
            missing_elements=missing_elements,
            extra_elements=extra_elements,
            total_attributes_original=original_stats['total_attributes'],
            total_attributes_reconstructed=reconstructed_stats['total_attributes'],
            missing_attributes=missing_attributes,
            incorrect_attributes=incorrect_attributes,
            data_loss_percentage=data_loss_percentage,
            critical_data_loss=critical_data_loss,
            phase1_score=phase_scores.get('phase1', 100.0),
            phase2_score=phase_scores.get('phase2', 100.0),
            phase3_score=phase_scores.get('phase3', 100.0),
            phase4_score=phase_scores.get('phase4', 100.0),
            phase5_score=phase_scores.get('phase5', 100.0)
        )

    def _calculate_phase_scores(self, diff_items: List[DiffItem]) -> Dict[str, float]:
        """Calculate phase-specific quality scores"""
        # Phase element indicators
        phase_indicators = {
            'phase1': ['UIRendering', 'UIInfo', 'displayFormat', 'gradient'],
            'phase2': ['DeviceVariant', 'ProcessDataCondition', 'Variable'],
            'phase3': ['Menu', 'MenuButton', 'ObserverRoleMenu'],
            'phase4': ['Identification', 'Image', 'TestConfiguration'],
            'phase5': ['DatatypeCollection', 'RecordItem', 'SingleValue']
        }

        phase_scores = {}

        for phase_name, indicators in phase_indicators.items():
            # Count issues in this phase
            phase_issues = sum(
                1 for d in diff_items
                if any(ind.lower() in d.xpath.lower() for ind in indicators)
            )

            # Simple scoring: 100% if no issues, decreases with issues
            if phase_issues == 0:
                phase_scores[phase_name] = 100.0
            else:
                # Deduct 5 points per issue, minimum 0
                phase_scores[phase_name] = max(0.0, 100.0 - (phase_issues * 5))

        return phase_scores

    def format_diff_report(self, metrics: QualityMetrics, diff_items: List[DiffItem]) -> str:
        """Format a human-readable diff report"""
        report = []
        report.append("="* 80)
        report.append("IODD PARSER QUALITY ANALYSIS REPORT")
        report.append("=" * 80)
        report.append("")

        # Overall scores
        report.append("OVERALL QUALITY METRICS:")
        report.append(f"  Overall Score:     {metrics.overall_score:.1f}%")
        report.append(f"  Structural Score:  {metrics.structural_score:.1f}%")
        report.append(f"  Attribute Score:   {metrics.attribute_score:.1f}%")
        report.append(f"  Value Score:       {metrics.value_score:.1f}%")
        report.append(f"  Data Loss:         {metrics.data_loss_percentage:.2f}%")
        report.append("")

        # Element statistics
        report.append("ELEMENT STATISTICS:")
        report.append(f"  Original Elements:      {metrics.total_elements_original}")
        report.append(f"  Reconstructed Elements: {metrics.total_elements_reconstructed}")
        report.append(f"  Missing Elements:       {metrics.missing_elements}")
        report.append(f"  Extra Elements:         {metrics.extra_elements}")
        report.append("")

        # Attribute statistics
        report.append("ATTRIBUTE STATISTICS:")
        report.append(f"  Original Attributes:      {metrics.total_attributes_original}")
        report.append(f"  Reconstructed Attributes: {metrics.total_attributes_reconstructed}")
        report.append(f"  Missing Attributes:       {metrics.missing_attributes}")
        report.append(f"  Incorrect Attributes:     {metrics.incorrect_attributes}")
        report.append("")

        # Phase scores
        report.append("PHASE COVERAGE SCORES:")
        report.append(f"  Phase 1 (UI Rendering):     {metrics.phase1_score:.1f}%")
        report.append(f"  Phase 2 (Variants/Cond.):   {metrics.phase2_score:.1f}%")
        report.append(f"  Phase 3 (Menu Buttons):     {metrics.phase3_score:.1f}%")
        report.append(f"  Phase 4 (Wiring/Test):      {metrics.phase4_score:.1f}%")
        report.append(f"  Phase 5 (Custom Types):     {metrics.phase5_score:.1f}%")
        report.append("")

        # Diff items by severity
        critical = [d for d in diff_items if d.severity == DiffSeverity.CRITICAL]
        high = [d for d in diff_items if d.severity == DiffSeverity.HIGH]
        medium = [d for d in diff_items if d.severity == DiffSeverity.MEDIUM]

        if critical:
            report.append(f"CRITICAL ISSUES ({len(critical)}):")
            for item in critical[:10]:  # Show first 10
                report.append(f"  - {item.description}")
                report.append(f"    XPath: {item.xpath}")
            report.append("")

        if high:
            report.append(f"HIGH PRIORITY ISSUES ({len(high)}):")
            for item in high[:10]:  # Show first 10
                report.append(f"  - {item.description}")
                report.append(f"    XPath: {item.xpath}")
            report.append("")

        if medium:
            report.append(f"MEDIUM PRIORITY ISSUES ({len(medium)}):")
            report.append(f"  Total: {len(medium)} issues")
            report.append("")

        report.append("=" * 80)
        return "\n".join(report)


# Convenience function
def analyze_diff(original_xml: str, reconstructed_xml: str,
                db_path: str = "greenstack.db") -> Tuple[QualityMetrics, List[DiffItem]]:
    """
    Analyze differences between original and reconstructed IODD XML

    Args:
        original_xml: Original IODD XML string
        reconstructed_xml: Reconstructed XML from database
        db_path: Path to database

    Returns:
        Tuple of (QualityMetrics, List[DiffItem])
    """
    analyzer = DiffAnalyzer(db_path)
    return analyzer.analyze(original_xml, reconstructed_xml)

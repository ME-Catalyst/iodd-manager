"""
EDS Parsing Diagnostics System
Provides structured error reporting and validation feedback
"""

from dataclasses import dataclass
from enum import Enum
from typing import List, Optional


class Severity(Enum):
    """Diagnostic severity levels."""
    INFO = "INFO"
    WARN = "WARN"
    ERROR = "ERROR"
    FATAL = "FATAL"


@dataclass
class SourceLocation:
    """Location information for a diagnostic."""
    file_path: Optional[str] = None
    line: Optional[int] = None
    column: Optional[int] = None
    section: Optional[str] = None


@dataclass
class Diagnostic:
    """A single diagnostic message."""
    code: str
    severity: Severity
    message: str
    location: Optional[SourceLocation] = None
    context: Optional[str] = None

    def to_dict(self):
        """Convert to dictionary for JSON serialization."""
        return {
            'code': self.code,
            'severity': self.severity.value,
            'message': self.message,
            'location': {
                'file_path': self.location.file_path if self.location else None,
                'line': self.location.line if self.location else None,
                'column': self.location.column if self.location else None,
                'section': self.location.section if self.location else None
            } if self.location else None,
            'context': self.context
        }


class DiagnosticCollector:
    """Collects diagnostics during parsing."""

    def __init__(self):
        self.diagnostics: List[Diagnostic] = []
        self.file_path: Optional[str] = None

    def set_file_path(self, path: str):
        """Set the current file being parsed."""
        self.file_path = path

    def info(self, code: str, message: str, section: str = None):
        """Add an informational diagnostic."""
        self.add(Diagnostic(
            code=code,
            severity=Severity.INFO,
            message=message,
            location=SourceLocation(file_path=self.file_path, section=section)
        ))

    def warn(self, code: str, message: str, section: str = None, line: int = None):
        """Add a warning diagnostic."""
        self.add(Diagnostic(
            code=code,
            severity=Severity.WARN,
            message=message,
            location=SourceLocation(
                file_path=self.file_path,
                section=section,
                line=line
            )
        ))

    def error(self, code: str, message: str, section: str = None, line: int = None):
        """Add an error diagnostic."""
        self.add(Diagnostic(
            code=code,
            severity=Severity.ERROR,
            message=message,
            location=SourceLocation(
                file_path=self.file_path,
                section=section,
                line=line
            )
        ))

    def fatal(self, code: str, message: str, section: str = None, line: int = None):
        """Add a fatal error diagnostic."""
        self.add(Diagnostic(
            code=code,
            severity=Severity.FATAL,
            message=message,
            location=SourceLocation(
                file_path=self.file_path,
                section=section,
                line=line
            )
        ))

    def add(self, diagnostic: Diagnostic):
        """Add a diagnostic to the collection."""
        self.diagnostics.append(diagnostic)

    def has_errors(self) -> bool:
        """Check if any errors or fatal errors occurred."""
        return any(d.severity in [Severity.ERROR, Severity.FATAL]
                  for d in self.diagnostics)

    def has_warnings(self) -> bool:
        """Check if any warnings occurred."""
        return any(d.severity == Severity.WARN for d in self.diagnostics)

    def get_by_severity(self, severity: Severity) -> List[Diagnostic]:
        """Get all diagnostics of a specific severity."""
        return [d for d in self.diagnostics if d.severity == severity]

    def to_dict(self) -> dict:
        """Convert all diagnostics to dictionary."""
        return {
            'total': len(self.diagnostics),
            'info_count': len(self.get_by_severity(Severity.INFO)),
            'warn_count': len(self.get_by_severity(Severity.WARN)),
            'error_count': len(self.get_by_severity(Severity.ERROR)),
            'fatal_count': len(self.get_by_severity(Severity.FATAL)),
            'diagnostics': [d.to_dict() for d in self.diagnostics]
        }

    def generate_report(self) -> str:
        """Generate a human-readable report."""
        lines = []
        lines.append("=" * 80)
        lines.append("EDS PARSING DIAGNOSTICS REPORT")
        lines.append("=" * 80)
        lines.append("")

        if self.file_path:
            lines.append(f"File: {self.file_path}")
            lines.append("")

        lines.append(f"Summary:")
        lines.append(f"  Total Diagnostics: {len(self.diagnostics)}")
        lines.append(f"  INFO: {len(self.get_by_severity(Severity.INFO))}")
        lines.append(f"  WARN: {len(self.get_by_severity(Severity.WARN))}")
        lines.append(f"  ERROR: {len(self.get_by_severity(Severity.ERROR))}")
        lines.append(f"  FATAL: {len(self.get_by_severity(Severity.FATAL))}")
        lines.append("")

        if self.diagnostics:
            lines.append("Details:")
            lines.append("-" * 80)
            for diag in self.diagnostics:
                lines.append(f"[{diag.severity.value}] {diag.code}")
                lines.append(f"  {diag.message}")
                if diag.location:
                    loc_parts = []
                    if diag.location.section:
                        loc_parts.append(f"Section: {diag.location.section}")
                    if diag.location.line:
                        loc_parts.append(f"Line: {diag.location.line}")
                    if loc_parts:
                        lines.append(f"  Location: {', '.join(loc_parts)}")
                if diag.context:
                    lines.append(f"  Context: {diag.context}")
                lines.append("")
        else:
            lines.append("No diagnostics generated - parsing completed successfully!")
            lines.append("")

        lines.append("=" * 80)
        return "\n".join(lines)


def validate_eds_data(parsed_data: dict, collector: DiagnosticCollector, strict_mode: bool = False):
    """
    Validate parsed EDS data and add diagnostics.

    Args:
        parsed_data: The parsed EDS data dictionary
        collector: Diagnostic collector
        strict_mode: If True, missing optional fields generate errors instead of warnings
    """
    device = parsed_data.get('device', {})
    file_info = parsed_data.get('file_info', {})

    # Validate required device fields
    required_device_fields = ['vendor_name', 'product_name', 'vendor_code', 'product_code']
    for field in required_device_fields:
        if not device.get(field):
            collector.error(
                f"EDS.DEVICE.MISSING_{field.upper()}",
                f"Required device field '{field}' is missing or empty",
                section="Device"
            )

    # Validate optional but recommended fields
    recommended_fields = ['product_type_str', 'catalog_number', 'home_url']
    for field in recommended_fields:
        if not device.get(field) and not file_info.get('home_url' if field == 'home_url' else None):
            severity_func = collector.error if strict_mode else collector.warn
            severity_func(
                f"EDS.DEVICE.MISSING_{field.upper()}",
                f"Recommended field '{field}' is not provided",
                section="Device"
            )

    # Validate parameters
    parameters = parsed_data.get('parameters', [])
    if not parameters and strict_mode:
        collector.warn(
            "EDS.PARAMS.EMPTY",
            "No parameters defined in EDS file",
            section="Params"
        )

    for idx, param in enumerate(parameters):
        if not param.get('param_name'):
            collector.warn(
                "EDS.PARAMS.MISSING_NAME",
                f"Parameter {idx + 1} has no name",
                section="Params"
            )

    # Validate connections
    connections = parsed_data.get('connections', [])
    if not connections and strict_mode:
        collector.warn(
            "EDS.CONNECTIONS.EMPTY",
            "No connections defined in EDS file",
            section="Connection Manager"
        )

    for idx, conn in enumerate(connections):
        if not conn.get('connection_name'):
            collector.warn(
                "EDS.CONNECTIONS.MISSING_NAME",
                f"Connection {idx + 1} has no name",
                section="Connection Manager"
            )

    # Validate capacity
    capacity = parsed_data.get('capacity', {})
    if capacity:
        if not capacity.get('max_msg_connections'):
            collector.info(
                "EDS.CAPACITY.NO_MSG_CONNECTIONS",
                "Max message connections not specified",
                section="Capacity"
            )

    # Info messages for successful parsing
    collector.info(
        "EDS.PARSE.SUCCESS",
        f"Successfully parsed EDS file: {device.get('product_name', 'Unknown')}"
    )

    collector.info(
        "EDS.PARSE.STATS",
        f"Parsed {len(parameters)} parameters, {len(connections)} connections, "
        f"{len(parsed_data.get('ports', []))} ports"
    )

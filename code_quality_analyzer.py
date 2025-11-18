#!/usr/bin/env python3
"""
Comprehensive Code Quality Analyzer for GreenStack Python Codebase
Analyzes type hints, docstrings, imports, complexity, error handling, logging, and security
"""

import ast
import os
import re
import json
from pathlib import Path
from typing import Dict, List, Set, Tuple, Any
from collections import defaultdict
from dataclasses import dataclass, field


@dataclass
class FunctionAnalysis:
    """Analysis results for a single function"""
    name: str
    line_number: int
    has_type_hints: bool
    has_docstring: bool
    has_return_type: bool
    complexity: int
    num_lines: int
    has_error_handling: bool
    has_logging: bool
    issues: List[str] = field(default_factory=list)


@dataclass
class FileAnalysis:
    """Analysis results for a single file"""
    file_path: str
    total_lines: int
    functions: List[FunctionAnalysis] = field(default_factory=list)
    classes: List[Dict] = field(default_factory=list)
    imports: List[str] = field(default_factory=list)
    unused_imports: List[str] = field(default_factory=list)
    security_issues: List[Dict] = field(default_factory=list)
    issues: List[str] = field(default_factory=list)


class CodeQualityAnalyzer(ast.NodeVisitor):
    """AST-based code quality analyzer"""

    def __init__(self, source_code: str, file_path: str):
        self.source_code = source_code
        self.file_path = file_path
        self.lines = source_code.split('\n')
        self.total_lines = len(self.lines)

        # Analysis results
        self.functions: List[FunctionAnalysis] = []
        self.classes: List[Dict] = []
        self.imports: List[str] = []
        self.import_names: Set[str] = set()
        self.used_names: Set[str] = set()
        self.security_issues: List[Dict] = []
        self.issues: List[str] = []

        try:
            self.tree = ast.parse(source_code)
        except SyntaxError as e:
            self.tree = None
            self.issues.append(f"Syntax error: {e}")

    def analyze(self) -> FileAnalysis:
        """Perform complete analysis"""
        if self.tree:
            self.visit(self.tree)
            self._detect_security_issues()
            self._detect_unused_imports()

        return FileAnalysis(
            file_path=self.file_path,
            total_lines=self.total_lines,
            functions=self.functions,
            classes=self.classes,
            imports=self.imports,
            unused_imports=list(set(self.import_names) - self.used_names),
            security_issues=self.security_issues,
            issues=self.issues
        )

    def visit_Import(self, node):
        """Track import statements"""
        for alias in node.names:
            import_name = alias.asname if alias.asname else alias.name
            self.imports.append(f"import {alias.name}")
            self.import_names.add(import_name.split('.')[0])
        self.generic_visit(node)

    def visit_ImportFrom(self, node):
        """Track from...import statements"""
        module = node.module or ''
        for alias in node.names:
            import_name = alias.asname if alias.asname else alias.name
            self.imports.append(f"from {module} import {alias.name}")
            self.import_names.add(import_name)
        self.generic_visit(node)

    def visit_Name(self, node):
        """Track name usage"""
        if isinstance(node.ctx, ast.Load):
            self.used_names.add(node.id)
        self.generic_visit(node)

    def visit_FunctionDef(self, node):
        """Analyze function definitions"""
        func_analysis = self._analyze_function(node)
        self.functions.append(func_analysis)
        self.generic_visit(node)

    def visit_AsyncFunctionDef(self, node):
        """Analyze async function definitions"""
        func_analysis = self._analyze_function(node)
        self.functions.append(func_analysis)
        self.generic_visit(node)

    def visit_ClassDef(self, node):
        """Analyze class definitions"""
        class_info = {
            'name': node.name,
            'line_number': node.lineno,
            'has_docstring': ast.get_docstring(node) is not None,
            'methods': []
        }
        self.classes.append(class_info)
        self.generic_visit(node)

    def _analyze_function(self, node) -> FunctionAnalysis:
        """Analyze a single function"""
        # Check type hints
        has_type_hints = any(arg.annotation for arg in node.args.args)
        has_return_type = node.returns is not None

        # Check docstring
        has_docstring = ast.get_docstring(node) is not None

        # Calculate complexity (McCabe complexity)
        complexity = self._calculate_complexity(node)

        # Count lines
        if hasattr(node, 'end_lineno') and node.end_lineno:
            num_lines = node.end_lineno - node.lineno + 1
        else:
            num_lines = 0

        # Check error handling
        has_error_handling = self._has_error_handling(node)

        # Check logging
        has_logging = self._has_logging(node)

        # Collect issues
        issues = []
        if not has_docstring:
            issues.append("Missing docstring")
        if not has_type_hints and len(node.args.args) > 0:
            issues.append("Missing type hints on parameters")
        if not has_return_type and node.name != '__init__':
            issues.append("Missing return type hint")
        if complexity > 10:
            issues.append(f"High complexity ({complexity})")
        if num_lines > 100:
            issues.append(f"Long function ({num_lines} lines)")

        return FunctionAnalysis(
            name=node.name,
            line_number=node.lineno,
            has_type_hints=has_type_hints,
            has_docstring=has_docstring,
            has_return_type=has_return_type,
            complexity=complexity,
            num_lines=num_lines,
            has_error_handling=has_error_handling,
            has_logging=has_logging,
            issues=issues
        )

    def _calculate_complexity(self, node) -> int:
        """Calculate McCabe complexity"""
        complexity = 1
        for child in ast.walk(node):
            if isinstance(child, (ast.If, ast.While, ast.For, ast.AsyncFor,
                                 ast.ExceptHandler, ast.With, ast.AsyncWith,
                                 ast.Assert, ast.BoolOp)):
                complexity += 1
            elif isinstance(child, (ast.And, ast.Or)):
                complexity += 1
        return complexity

    def _has_error_handling(self, node) -> bool:
        """Check if function has try/except blocks"""
        for child in ast.walk(node):
            if isinstance(child, ast.Try):
                return True
        return False

    def _has_logging(self, node) -> bool:
        """Check if function has logging calls"""
        for child in ast.walk(node):
            if isinstance(child, ast.Call):
                if isinstance(child.func, ast.Attribute):
                    if isinstance(child.func.value, ast.Name):
                        if child.func.value.id == 'logger':
                            return True
        return False

    def _detect_unused_imports(self):
        """Detect unused imports (simple heuristic)"""
        # This is already handled in analyze()
        pass

    def _detect_security_issues(self):
        """Detect potential security issues"""
        # SQL injection patterns
        for node in ast.walk(self.tree):
            # Check for string formatting in SQL
            if isinstance(node, ast.Call):
                if isinstance(node.func, ast.Attribute):
                    if node.func.attr == 'execute':
                        # Check if SQL is constructed with f-strings or %
                        if node.args:
                            arg = node.args[0]
                            if isinstance(arg, ast.JoinedStr):  # f-string
                                self.security_issues.append({
                                    'type': 'SQL Injection Risk',
                                    'line': node.lineno,
                                    'detail': 'SQL query uses f-string formatting'
                                })
                            elif isinstance(arg, ast.BinOp) and isinstance(arg.op, ast.Mod):
                                self.security_issues.append({
                                    'type': 'SQL Injection Risk',
                                    'line': node.lineno,
                                    'detail': 'SQL query uses % formatting'
                                })

            # Check for eval/exec
            if isinstance(node, ast.Call):
                if isinstance(node.func, ast.Name):
                    if node.func.id in ('eval', 'exec'):
                        self.security_issues.append({
                            'type': 'Code Injection Risk',
                            'line': node.lineno,
                            'detail': f'Use of {node.func.id}()'
                        })

            # Check for pickle
            if isinstance(node, ast.Call):
                if isinstance(node.func, ast.Attribute):
                    if isinstance(node.func.value, ast.Name):
                        if node.func.value.id == 'pickle' and node.func.attr == 'loads':
                            self.security_issues.append({
                                'type': 'Deserialization Risk',
                                'line': node.lineno,
                                'detail': 'Use of pickle.loads()'
                            })


def analyze_file(file_path: str) -> FileAnalysis:
    """Analyze a single Python file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            source = f.read()

        analyzer = CodeQualityAnalyzer(source, file_path)
        return analyzer.analyze()
    except Exception as e:
        return FileAnalysis(
            file_path=file_path,
            total_lines=0,
            issues=[f"Error analyzing file: {e}"]
        )


def analyze_directory(directory: str, patterns: List[str]) -> Dict[str, FileAnalysis]:
    """Analyze all Python files in directory matching patterns"""
    results = {}

    for pattern in patterns:
        for file_path in Path(directory).glob(pattern):
            if file_path.is_file() and file_path.suffix == '.py':
                results[str(file_path)] = analyze_file(str(file_path))

    return results


def generate_report(results: Dict[str, FileAnalysis]) -> str:
    """Generate comprehensive markdown report"""
    report = []
    report.append("# GreenStack Code Quality Analysis Report")
    report.append("")
    report.append(f"**Analysis Date**: {__import__('datetime').datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    report.append("")

    # Summary statistics
    total_functions = sum(len(r.functions) for r in results.values())
    functions_with_type_hints = sum(
        sum(1 for f in r.functions if f.has_type_hints) for r in results.values()
    )
    functions_with_docstrings = sum(
        sum(1 for f in r.functions if f.has_docstring) for r in results.values()
    )
    functions_with_return_types = sum(
        sum(1 for f in r.functions if f.has_return_type) for r in results.values()
    )
    high_complexity_functions = sum(
        sum(1 for f in r.functions if f.complexity > 10) for r in results.values()
    )
    long_functions = sum(
        sum(1 for f in r.functions if f.num_lines > 100) for r in results.values()
    )
    total_security_issues = sum(len(r.security_issues) for r in results.values())

    report.append("## Summary Statistics")
    report.append("")
    report.append(f"- **Total Files Analyzed**: {len(results)}")
    report.append(f"- **Total Functions**: {total_functions}")
    report.append(f"- **Functions with Type Hints**: {functions_with_type_hints} ({functions_with_type_hints/max(total_functions,1)*100:.1f}%)")
    report.append(f"- **Functions with Docstrings**: {functions_with_docstrings} ({functions_with_docstrings/max(total_functions,1)*100:.1f}%)")
    report.append(f"- **Functions with Return Type**: {functions_with_return_types} ({functions_with_return_types/max(total_functions,1)*100:.1f}%)")
    report.append(f"- **High Complexity Functions (>10)**: {high_complexity_functions}")
    report.append(f"- **Long Functions (>100 lines)**: {long_functions}")
    report.append(f"- **Security Issues Found**: {total_security_issues}")
    report.append("")

    # Priority issues
    report.append("## Priority Issues")
    report.append("")

    critical_issues = []
    high_issues = []
    medium_issues = []
    low_issues = []

    for file_path, analysis in results.items():
        rel_path = file_path

        # Security issues (CRITICAL)
        for issue in analysis.security_issues:
            critical_issues.append({
                'file': rel_path,
                'line': issue['line'],
                'issue': f"{issue['type']}: {issue['detail']}"
            })

        # High complexity and long functions (HIGH)
        for func in analysis.functions:
            if func.complexity > 15:
                high_issues.append({
                    'file': rel_path,
                    'line': func.line_number,
                    'issue': f"Very high complexity in {func.name}() - complexity {func.complexity}"
                })
            elif func.complexity > 10:
                medium_issues.append({
                    'file': rel_path,
                    'line': func.line_number,
                    'issue': f"High complexity in {func.name}() - complexity {func.complexity}"
                })

            if func.num_lines > 150:
                high_issues.append({
                    'file': rel_path,
                    'line': func.line_number,
                    'issue': f"Very long function {func.name}() - {func.num_lines} lines"
                })
            elif func.num_lines > 100:
                medium_issues.append({
                    'file': rel_path,
                    'line': func.line_number,
                    'issue': f"Long function {func.name}() - {func.num_lines} lines"
                })

            # Missing docstrings (MEDIUM)
            if not func.has_docstring:
                medium_issues.append({
                    'file': rel_path,
                    'line': func.line_number,
                    'issue': f"Missing docstring in {func.name}()"
                })

            # Missing type hints (LOW)
            if not func.has_type_hints:
                low_issues.append({
                    'file': rel_path,
                    'line': func.line_number,
                    'issue': f"Missing type hints in {func.name}()"
                })

    # Print priority issues
    if critical_issues:
        report.append("### Critical Issues")
        report.append("")
        for issue in critical_issues[:20]:  # Limit to 20
            report.append(f"- **{issue['file']}:{issue['line']}** - {issue['issue']}")
        if len(critical_issues) > 20:
            report.append(f"- ... and {len(critical_issues) - 20} more")
        report.append("")

    if high_issues:
        report.append("### High Priority Issues")
        report.append("")
        for issue in high_issues[:30]:  # Limit to 30
            report.append(f"- **{issue['file']}:{issue['line']}** - {issue['issue']}")
        if len(high_issues) > 30:
            report.append(f"- ... and {len(high_issues) - 30} more")
        report.append("")

    if medium_issues:
        report.append("### Medium Priority Issues")
        report.append(f"")
        report.append(f"*Total: {len(medium_issues)} issues (showing first 20)*")
        report.append("")
        for issue in medium_issues[:20]:
            report.append(f"- **{issue['file']}:{issue['line']}** - {issue['issue']}")
        report.append("")

    # File-by-file analysis
    report.append("## File-by-File Analysis")
    report.append("")

    for file_path in sorted(results.keys()):
        analysis = results[file_path]
        rel_path = file_path

        report.append(f"### {rel_path}")
        report.append("")
        report.append(f"**Lines**: {analysis.total_lines} | **Functions**: {len(analysis.functions)} | **Security Issues**: {len(analysis.security_issues)}")
        report.append("")

        if analysis.issues:
            report.append("**File-level Issues:**")
            for issue in analysis.issues:
                report.append(f"- {issue}")
            report.append("")

        if analysis.functions:
            # Type hints coverage
            funcs_with_hints = sum(1 for f in analysis.functions if f.has_type_hints)
            funcs_with_docs = sum(1 for f in analysis.functions if f.has_docstring)
            funcs_with_return = sum(1 for f in analysis.functions if f.has_return_type)

            report.append("**Statistics:**")
            report.append(f"- Type hints coverage: {funcs_with_hints}/{len(analysis.functions)} ({funcs_with_hints/len(analysis.functions)*100:.0f}%)")
            report.append(f"- Docstring coverage: {funcs_with_docs}/{len(analysis.functions)} ({funcs_with_docs/len(analysis.functions)*100:.0f}%)")
            report.append(f"- Return type hints: {funcs_with_return}/{len(analysis.functions)} ({funcs_with_return/len(analysis.functions)*100:.0f}%)")
            report.append("")

            # Top complex functions
            complex_funcs = sorted([f for f in analysis.functions if f.complexity > 5],
                                  key=lambda x: x.complexity, reverse=True)
            if complex_funcs:
                report.append("**Complex Functions:**")
                for func in complex_funcs[:5]:
                    report.append(f"- Line {func.line_number}: `{func.name}()` - complexity {func.complexity}, {func.num_lines} lines")
                report.append("")

            # Functions with issues
            funcs_with_issues = [f for f in analysis.functions if f.issues]
            if funcs_with_issues:
                report.append("**Functions with Issues:**")
                for func in funcs_with_issues[:10]:
                    report.append(f"- Line {func.line_number}: `{func.name}()` - {', '.join(func.issues)}")
                if len(funcs_with_issues) > 10:
                    report.append(f"- ... and {len(funcs_with_issues) - 10} more")
                report.append("")

        if analysis.security_issues:
            report.append("**Security Issues:**")
            for issue in analysis.security_issues:
                report.append(f"- Line {issue['line']}: {issue['type']} - {issue['detail']}")
            report.append("")

        report.append("---")
        report.append("")

    # Recommendations
    report.append("## Recommendations")
    report.append("")
    report.append("### Immediate Actions (Critical)")
    report.append("")
    report.append("1. **Address all security issues** - Review SQL injection risks and code injection vulnerabilities")
    report.append("2. **Fix functions with complexity >15** - These are maintenance nightmares")
    report.append("3. **Break down functions >150 lines** - Extract sub-functions for better maintainability")
    report.append("")
    report.append("### Short-term Improvements (High Priority)")
    report.append("")
    report.append("1. **Add type hints to all public APIs** - Start with route handlers and parser functions")
    report.append("2. **Document all public functions** - Add docstrings explaining parameters and return values")
    report.append("3. **Refactor complex functions** - Target complexity >10 for simplification")
    report.append("4. **Add error handling** - Many functions lack try/except blocks")
    report.append("")
    report.append("### Long-term Improvements (Medium Priority)")
    report.append("")
    report.append("1. **Standardize logging** - Ensure consistent logging patterns across all files")
    report.append("2. **Clean up unused imports** - Remove dead code")
    report.append("3. **Add unit tests** - Focus on complex functions first")
    report.append("4. **Consider using linters** - Integrate pylint, mypy, and bandit into CI/CD")
    report.append("")

    return '\n'.join(report)


if __name__ == '__main__':
    # Analyze key directories
    base_dir = '/home/user/GreenStack'

    patterns = [
        'src/api.py',
        'src/greenstack.py',
        'src/routes/*.py',
        'src/parsers/*.py',
        'src/utils/*.py',
    ]

    results = {}
    for pattern in patterns:
        for file_path in Path(base_dir).glob(pattern):
            if file_path.is_file() and file_path.suffix == '.py':
                print(f"Analyzing {file_path}...")
                results[str(file_path)] = analyze_file(str(file_path))

    # Generate report
    report = generate_report(results)

    # Write to file
    output_file = Path(base_dir) / 'CODE_QUALITY_REPORT.md'
    with open(output_file, 'w') as f:
        f.write(report)

    print(f"\nReport generated: {output_file}")
    print(report)

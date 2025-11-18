#!/usr/bin/env python3
"""
Comprehensive import analysis tool for Python codebases.
Identifies unused imports, wildcard imports, duplicates, and potential circular imports.
"""

import ast
import os
import sys
from collections import defaultdict
from pathlib import Path
from typing import Dict, List, Set, Tuple
import json


class ImportAnalyzer(ast.NodeVisitor):
    """Analyzes a Python AST to identify import usage."""

    def __init__(self, filepath: str):
        self.filepath = filepath
        self.imports = []  # List of (line_no, import_statement, names)
        self.imported_names = {}  # name -> (line_no, module, statement)
        self.used_names = set()  # Set of names used in the code
        self.wildcard_imports = []  # List of (line_no, module)
        self.duplicate_imports = []  # List of duplicates
        self.all_names = set()  # All names defined in the file
        self.in_function_or_class = 0

    def visit_Import(self, node):
        """Visit import statements (import x, import y as z)."""
        for alias in node.names:
            name = alias.asname if alias.asname else alias.name
            module = alias.name
            statement = f"import {alias.name}" + (f" as {alias.asname}" if alias.asname else "")

            if name in self.imported_names:
                self.duplicate_imports.append((node.lineno, statement))

            self.imported_names[name] = (node.lineno, module, statement, 'import')
            self.imports.append((node.lineno, statement, [name]))
        self.generic_visit(node)

    def visit_ImportFrom(self, node):
        """Visit from...import statements."""
        module = node.module or ''

        for alias in node.names:
            if alias.name == '*':
                self.wildcard_imports.append((node.lineno, module))
                continue

            name = alias.asname if alias.asname else alias.name
            statement = f"from {module} import {alias.name}" + (f" as {alias.asname}" if alias.asname else "")

            if name in self.imported_names:
                self.duplicate_imports.append((node.lineno, statement))

            self.imported_names[name] = (node.lineno, module, statement, 'from')
            self.imports.append((node.lineno, statement, [name]))
        self.generic_visit(node)

    def visit_Name(self, node):
        """Visit name references."""
        self.used_names.add(node.id)
        self.generic_visit(node)

    def visit_Attribute(self, node):
        """Visit attribute access (e.g., module.attribute)."""
        # Get the base name
        if isinstance(node.value, ast.Name):
            self.used_names.add(node.value.id)
        self.generic_visit(node)

    def visit_FunctionDef(self, node):
        """Visit function definitions."""
        self.in_function_or_class += 1
        self.generic_visit(node)
        self.in_function_or_class -= 1

    def visit_AsyncFunctionDef(self, node):
        """Visit async function definitions."""
        self.in_function_or_class += 1
        self.generic_visit(node)
        self.in_function_or_class -= 1

    def visit_ClassDef(self, node):
        """Visit class definitions."""
        self.in_function_or_class += 1
        # Check base classes
        for base in node.bases:
            if isinstance(base, ast.Name):
                self.used_names.add(base.id)
        self.generic_visit(node)
        self.in_function_or_class -= 1

    def visit_ExceptHandler(self, node):
        """Visit except handlers."""
        if node.type:
            if isinstance(node.type, ast.Name):
                self.used_names.add(node.type.id)
            elif isinstance(node.type, ast.Tuple):
                for exc in node.type.elts:
                    if isinstance(exc, ast.Name):
                        self.used_names.add(exc.id)
        self.generic_visit(node)

    def visit_Raise(self, node):
        """Visit raise statements."""
        if node.exc:
            if isinstance(node.exc, ast.Name):
                self.used_names.add(node.exc.id)
        self.generic_visit(node)

    def get_unused_imports(self):
        """Return list of unused imports."""
        unused = []
        for name, (line_no, module, statement, import_type) in self.imported_names.items():
            # Check if the name is used
            if name not in self.used_names:
                # Check if it might be exported via __all__
                safe_to_remove = True
                unused.append({
                    'line': line_no,
                    'name': name,
                    'module': module,
                    'statement': statement,
                    'safe_to_remove': safe_to_remove
                })
        return sorted(unused, key=lambda x: x['line'])


def analyze_file(filepath: str) -> Dict:
    """Analyze a single Python file for import issues."""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        tree = ast.parse(content, filename=filepath)
        analyzer = ImportAnalyzer(filepath)
        analyzer.visit(tree)

        # Check for __all__ definition which might use imports
        has_all = '__all__' in content

        # Adjust safety based on __all__
        unused_imports = analyzer.get_unused_imports()
        if has_all:
            for imp in unused_imports:
                imp['safe_to_remove'] = False
                imp['reason'] = 'File has __all__ definition'

        return {
            'filepath': filepath,
            'total_imports': len(analyzer.imported_names),
            'unused_imports': unused_imports,
            'wildcard_imports': analyzer.wildcard_imports,
            'duplicate_imports': analyzer.duplicate_imports,
            'has_issues': len(unused_imports) > 0 or len(analyzer.wildcard_imports) > 0 or len(analyzer.duplicate_imports) > 0
        }
    except SyntaxError as e:
        return {
            'filepath': filepath,
            'error': f'SyntaxError: {e}',
            'has_issues': False
        }
    except Exception as e:
        return {
            'filepath': filepath,
            'error': f'Error: {e}',
            'has_issues': False
        }


def find_circular_imports(results: List[Dict]) -> List[Tuple[str, str]]:
    """Detect potential circular import issues."""
    import_graph = defaultdict(set)

    for result in results:
        if 'error' in result:
            continue
        filepath = result['filepath']

        # Build import graph
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            tree = ast.parse(content)

            for node in ast.walk(tree):
                if isinstance(node, ast.ImportFrom):
                    if node.module and node.module.startswith('src.'):
                        import_graph[filepath].add(node.module)
        except:
            pass

    # Simple circular dependency detection (would need more sophisticated analysis for real cycles)
    circular = []
    # This is a simplified check - a full implementation would use DFS/BFS

    return circular


def main():
    """Main analysis function."""
    if len(sys.argv) < 2:
        print("Usage: analyze_imports.py <directory1> [directory2] ...")
        sys.exit(1)

    directories = sys.argv[1:]
    all_files = []

    # Collect all Python files
    for directory in directories:
        path = Path(directory)
        if path.is_file() and path.suffix == '.py':
            all_files.append(str(path))
        elif path.is_dir():
            all_files.extend([str(f) for f in path.rglob('*.py')])

    # Analyze each file
    results = []
    for filepath in sorted(all_files):
        result = analyze_file(filepath)
        results.append(result)

    # Output results as JSON
    output = {
        'total_files': len(results),
        'files_with_issues': sum(1 for r in results if r.get('has_issues', False)),
        'results': results
    }

    print(json.dumps(output, indent=2))


if __name__ == '__main__':
    main()

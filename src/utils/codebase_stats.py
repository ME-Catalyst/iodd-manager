"""
Codebase Statistics Generator
Analyzes the GreenStack project and generates detailed statistics
"""
import os
import subprocess
import json
import sqlite3
from datetime import datetime
from pathlib import Path
from collections import defaultdict
import logging

logger = logging.getLogger(__name__)

class CodebaseStats:
    def __init__(self, project_root: str = "."):
        self.project_root = Path(project_root)
        self.stats = {}

    def count_lines_by_extension(self):
        """Count lines of code by file extension"""
        extensions = defaultdict(lambda: {"files": 0, "lines": 0, "blank": 0, "comments": 0, "is_doc": False})

        # Define which extensions to track
        code_extensions = {
            '.py': 'Python',
            '.jsx': 'JSX',
            '.js': 'JavaScript',
            '.ts': 'TypeScript',
            '.tsx': 'TSX',
            '.css': 'CSS',
            '.json': 'JSON',
            '.md': 'Markdown',
            '.html': 'HTML',
            '.sql': 'SQL',
            '.sh': 'Shell',
            '.bat': 'Batch',
            '.yml': 'YAML',
            '.yaml': 'YAML'
        }

        # Mark documentation file types
        doc_extensions = {'.md'}

        exclude_dirs = {'node_modules', '__pycache__', 'dist', 'build', '.git', 'venv', 'env', 'test-data'}

        for ext, lang in code_extensions.items():
            for filepath in self.project_root.rglob(f'*{ext}'):
                # Skip excluded directories
                if any(excluded in filepath.parts for excluded in exclude_dirs):
                    continue

                try:
                    with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
                        lines = f.readlines()
                        total_lines = len(lines)
                        blank_lines = sum(1 for line in lines if not line.strip())

                        # Simple comment detection
                        comment_lines = 0
                        if ext == '.py':
                            comment_lines = sum(1 for line in lines if line.strip().startswith('#'))
                        elif ext in ['.js', '.jsx', '.ts', '.tsx']:
                            comment_lines = sum(1 for line in lines if line.strip().startswith('//'))

                        extensions[lang]["files"] += 1
                        extensions[lang]["lines"] += total_lines
                        extensions[lang]["blank"] += blank_lines
                        extensions[lang]["comments"] += comment_lines
                        extensions[lang]["is_doc"] = ext in doc_extensions
                except Exception as e:
                    logger.debug(f"Error reading {filepath}: {e}")

        return dict(extensions)

    def get_git_stats(self):
        """Get Git repository statistics"""
        try:
            # Total commits
            result = subprocess.run(
                ['git', 'rev-list', '--count', 'HEAD'],
                capture_output=True,
                text=True,
                cwd=self.project_root
            )
            total_commits = int(result.stdout.strip()) if result.returncode == 0 else 0

            # Contributors
            result = subprocess.run(
                ['git', 'shortlog', '-sn', '--all'],
                capture_output=True,
                text=True,
                cwd=self.project_root
            )
            contributors = len(result.stdout.strip().split('\n')) if result.returncode == 0 else 0

            # Branches
            result = subprocess.run(
                ['git', 'branch', '-a'],
                capture_output=True,
                text=True,
                cwd=self.project_root
            )
            branches = len([l for l in result.stdout.strip().split('\n') if l.strip()]) if result.returncode == 0 else 0

            # Days since first commit - get root commit hash first
            result = subprocess.run(
                ['git', 'rev-list', '--max-parents=0', 'HEAD'],
                capture_output=True,
                text=True,
                cwd=self.project_root
            )
            if result.returncode == 0 and result.stdout.strip():
                root_commit = result.stdout.strip().split('\n')[0]  # First root commit
                # Get timestamp of that commit
                result = subprocess.run(
                    ['git', 'log', '--format=%ct', '-1', root_commit],
                    capture_output=True,
                    text=True,
                    cwd=self.project_root
                )
                if result.returncode == 0 and result.stdout.strip():
                    first_commit_timestamp = int(result.stdout.strip())
                    days_active = (datetime.now().timestamp() - first_commit_timestamp) / 86400
                    # Show at least 1 day if there are commits
                    days_active = max(1, int(days_active))
                else:
                    days_active = 0
            else:
                days_active = 0

            # Recent commit activity (last 30 days)
            result = subprocess.run(
                ['git', 'log', '--since="30 days ago"', '--oneline'],
                capture_output=True,
                text=True,
                cwd=self.project_root
            )
            recent_commits = len(result.stdout.strip().split('\n')) if result.returncode == 0 and result.stdout.strip() else 0

            # Get recent commits with details
            result = subprocess.run(
                ['git', 'log', '--format=%H|%an|%ae|%ct|%s', '-n', '10'],
                capture_output=True,
                text=True,
                cwd=self.project_root
            )

            recent_commit_details = []
            if result.returncode == 0:
                for line in result.stdout.strip().split('\n'):
                    if '|' in line:
                        parts = line.split('|', 4)
                        if len(parts) == 5:
                            recent_commit_details.append({
                                'hash': parts[0][:7],
                                'author': parts[1],
                                'email': parts[2],
                                'timestamp': int(parts[3]),
                                'message': parts[4]
                            })

            return {
                'total_commits': total_commits,
                'contributors': contributors,
                'branches': branches,
                'days_active': days_active,
                'recent_commits_30d': recent_commits,
                'recent_commit_details': recent_commit_details
            }
        except Exception as e:
            logger.error(f"Error getting git stats: {e}")
            return {
                'total_commits': 0,
                'contributors': 0,
                'branches': 0,
                'days_active': 0,
                'recent_commits_30d': 0,
                'recent_commit_details': []
            }

    def count_files_and_dirs(self):
        """Count total files and directories"""
        exclude_dirs = {'node_modules', '__pycache__', 'dist', 'build', '.git', 'venv', 'env', 'test-data'}

        total_files = 0
        total_dirs = 0

        for item in self.project_root.rglob('*'):
            if any(excluded in item.parts for excluded in exclude_dirs):
                continue
            if item.is_file():
                total_files += 1
            elif item.is_dir():
                total_dirs += 1

        return {
            'total_files': total_files,
            'total_directories': total_dirs
        }

    def get_project_structure(self):
        """Get high-level project structure"""
        structure = {
            'backend': 0,
            'frontend': 0,
            'docs': 0,
            'tests': 0,
            'scripts': 0,
            'config': 0
        }

        exclude_dirs = {'node_modules', '__pycache__', 'dist', 'build', '.git', 'venv', 'env', 'test-data'}

        for filepath in self.project_root.rglob('*'):
            if not filepath.is_file():
                continue
            if any(excluded in filepath.parts for excluded in exclude_dirs):
                continue

            parts = filepath.parts
            if 'src' in parts and filepath.suffix == '.py':
                structure['backend'] += 1
            elif 'frontend' in parts and filepath.suffix in ['.jsx', '.js', '.tsx', '.ts', '.css']:
                structure['frontend'] += 1
            elif filepath.suffix == '.md' or 'docs' in parts or 'documentation' in parts:
                structure['docs'] += 1
            elif 'test' in str(filepath).lower() and filepath.suffix == '.py':
                structure['tests'] += 1
            elif 'scripts' in parts or filepath.suffix in ['.sh', '.bat']:
                structure['scripts'] += 1
            elif filepath.suffix in ['.json', '.yml', '.yaml', '.toml', '.ini']:
                structure['config'] += 1

        return structure

    def get_package_stats(self):
        """Get statistics about dependencies"""
        stats = {
            'python_packages': 0,
            'npm_packages': 0
        }

        # Count Python packages from requirements.txt
        req_file = self.project_root / 'requirements.txt'
        if req_file.exists():
            try:
                with open(req_file, 'r') as f:
                    stats['python_packages'] = len([l for l in f.readlines() if l.strip() and not l.startswith('#')])
            except Exception as e:
                logger.debug(f"Error reading requirements.txt: {e}")

        # Count npm packages from package.json
        pkg_file = self.project_root / 'frontend' / 'package.json'
        if pkg_file.exists():
            try:
                with open(pkg_file, 'r') as f:
                    pkg_data = json.load(f)
                    deps = len(pkg_data.get('dependencies', {}))
                    dev_deps = len(pkg_data.get('devDependencies', {}))
                    stats['npm_packages'] = deps + dev_deps
                    stats['npm_dependencies'] = deps
                    stats['npm_dev_dependencies'] = dev_deps
            except Exception as e:
                logger.debug(f"Error reading package.json: {e}")

        return stats

    def get_database_stats(self):
        """Get database/API statistics"""
        stats = {
            'iodd_devices': 0,
            'iodd_files': 0,
            'eds_files': 0,
            'eds_variants': 0,
            'total_parameters': 0,
            'total_assemblies': 0,
            'pqa_analyses': 0
        }

        try:
            db_path = self.project_root / 'greenstack.db'
            if db_path.exists():
                conn = sqlite3.connect(str(db_path))
                cursor = conn.cursor()

                # Count IODD devices
                cursor.execute("SELECT COUNT(*) FROM devices")
                stats['iodd_devices'] = cursor.fetchone()[0]

                # Count IODD files
                cursor.execute("SELECT COUNT(*) FROM iodd_files")
                stats['iodd_files'] = cursor.fetchone()[0]

                # Count EDS files
                cursor.execute("SELECT COUNT(*) FROM eds_files")
                stats['eds_files'] = cursor.fetchone()[0]

                # Count EDS variants (unique vendor_code + product_code + major_revision + minor_revision)
                cursor.execute("SELECT COUNT(DISTINCT vendor_code || '-' || product_code || '-' || major_revision || '-' || minor_revision) FROM eds_files")
                stats['eds_variants'] = cursor.fetchone()[0]

                # Count total parameters (IODD + EDS)
                cursor.execute("SELECT COUNT(*) FROM parameters")
                iodd_params = cursor.fetchone()[0]
                cursor.execute("SELECT COUNT(*) FROM eds_parameters")
                eds_params = cursor.fetchone()[0]
                stats['total_parameters'] = iodd_params + eds_params

                # Count assemblies
                cursor.execute("SELECT COUNT(*) FROM eds_assemblies")
                stats['total_assemblies'] = cursor.fetchone()[0]

                # Count PQA analyses (IODD only currently)
                cursor.execute("SELECT COUNT(*) FROM pqa_quality_metrics")
                stats['pqa_analyses'] = cursor.fetchone()[0]

                conn.close()
        except Exception as e:
            logger.warning(f"Error getting database stats: {e}")

        return stats

    def generate_all_stats(self):
        """Generate all statistics"""
        logger.info("Generating codebase statistics...")

        self.stats = {
            'generated_at': datetime.now().isoformat(),
            'project_name': 'GreenStack',
            'language_stats': self.count_lines_by_extension(),
            'git_stats': self.get_git_stats(),
            'file_counts': self.count_files_and_dirs(),
            'project_structure': self.get_project_structure(),
            'package_stats': self.get_package_stats(),
            'database_stats': self.get_database_stats()
        }

        # Calculate totals - separate code from docs
        total_code_lines = 0
        total_doc_lines = 0
        total_code_files = 0
        total_doc_files = 0

        for lang, data in self.stats['language_stats'].items():
            effective_lines = data['lines'] - data['blank'] - data['comments']
            if data.get('is_doc', False):
                total_doc_lines += effective_lines
                total_doc_files += data['files']
            else:
                total_code_lines += effective_lines
                total_code_files += data['files']

        total_files_counted = sum(lang['files'] for lang in self.stats['language_stats'].values())

        self.stats['totals'] = {
            'total_code_lines': total_code_lines,
            'total_doc_lines': total_doc_lines,
            'total_lines': total_code_lines + total_doc_lines,
            'total_code_files': total_code_files,
            'total_doc_files': total_doc_files,
            'total_files_counted': total_files_counted,
            'total_blank_lines': sum(lang['blank'] for lang in self.stats['language_stats'].values()),
            'total_comment_lines': sum(lang['comments'] for lang in self.stats['language_stats'].values())
        }

        logger.info(f"Statistics generated: {total_code_lines} lines of code, {total_doc_lines} lines of docs across {total_files_counted} files")

        return self.stats

    def save_to_file(self, filepath: str = "codebase_stats.json"):
        """Save statistics to JSON file"""
        output_path = self.project_root / filepath
        with open(output_path, 'w') as f:
            json.dump(self.stats, f, indent=2)
        logger.info(f"Statistics saved to {output_path}")


def generate_stats(project_root: str = "."):
    """Generate and return codebase statistics"""
    stats_generator = CodebaseStats(project_root)
    return stats_generator.generate_all_stats()


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    stats = generate_stats()

    # Save to file
    stats_gen = CodebaseStats()
    stats_gen.stats = stats
    stats_gen.save_to_file()

    # Print summary
    print(f"\n{'='*60}")
    print(f"GreenStack Codebase Statistics")
    print(f"{'='*60}")
    print(f"Total Lines of Code: {stats['totals']['total_code_lines']:,}")
    print(f"Total Files: {stats['totals']['total_files_counted']:,}")
    print(f"Total Commits: {stats['git_stats']['total_commits']:,}")
    print(f"Contributors: {stats['git_stats']['contributors']}")
    print(f"Days Active: {stats['git_stats']['days_active']:,}")
    print(f"{'='*60}\n")

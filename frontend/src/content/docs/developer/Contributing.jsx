import React from 'react';
import { GitBranch, Code, CheckCircle, AlertCircle, Book, Zap } from 'lucide-react';
import DocsPage from '../../../components/docs/DocsPage';
import DocsHero from '../../../components/docs/DocsHero';
import DocsSection from '../../../components/docs/DocsSection';
import DocsCallout from '../../../components/docs/DocsCallout';
import { DocsParagraph, DocsLink } from '../../../components/docs/DocsText';
import DocsCodeBlock from '../../../components/docs/DocsCodeBlock';
import DocsMermaid from '../../../components/docs/DocsMermaid';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Badge } from '../../../components/ui';

export const metadata = {
  id: 'developer/contributing',
  title: 'Contributing Guide',
  description: 'Learn how to contribute to Greenstack: development setup, code style, testing, and pull request workflow',
  category: 'developer',
  order: 5,
  keywords: ['contributing', 'contribute', 'development', 'pull-request', 'pr', 'git', 'workflow'],
  lastUpdated: '2025-01-17',
};

export default function Contributing({ onNavigate }) {
  return (
    <DocsPage>
      <DocsHero
        title="Contributing Guide"
        description="Join the Greenstack development community and help improve the project"
        icon={<GitBranch className="w-12 h-12 text-brand-green" />}
      />

      {/* Getting Started */}
      <DocsSection title="Getting Started" icon={<Zap />}>
        <DocsParagraph>
          Thank you for your interest in contributing to Greenstack! This guide will help you
          set up your development environment and understand our contribution workflow.
        </DocsParagraph>

        <div className="grid gap-4 md:grid-cols-3 my-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-brand-green" />
                Fork & Clone
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Fork the repository on GitHub and clone it locally to start developing
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Code className="w-4 h-4 text-brand-green" />
                Code Quality
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Follow code style guidelines with automated formatting and linting
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-brand-green" />
                Pull Request
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Submit your changes through pull requests with tests and documentation
              </p>
            </CardContent>
          </Card>
        </div>
      </DocsSection>

      {/* Development Setup */}
      <DocsSection title="Development Setup">
        <DocsParagraph>
          Set up your local development environment to contribute to Greenstack.
        </DocsParagraph>

        <Card className="my-6">
          <CardHeader>
            <CardTitle className="text-base">Prerequisites</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• <strong>Python 3.10+</strong> - Backend development</li>
              <li>• <strong>Node.js 18+</strong> - Frontend development</li>
              <li>• <strong>Git</strong> - Version control</li>
              <li>• <strong>pip & npm</strong> - Package managers</li>
            </ul>
          </CardContent>
        </Card>

        <DocsCodeBlock language="bash">
{`# 1. Fork the repository on GitHub, then clone your fork
git clone https://github.com/YOUR_USERNAME/greenstack.git
cd greenstack

# 2. Add upstream remote
git remote add upstream https://github.com/ME-Catalyst/greenstack.git

# 3. Install Python dependencies
pip install -r requirements.txt

# 4. Install frontend dependencies
cd frontend
npm install
cd ..

# 5. Install development tools (optional but recommended)
pip install black ruff mypy pytest pytest-cov bandit pre-commit

# 6. Install pre-commit hooks (recommended)
pre-commit install`}
        </DocsCodeBlock>
      </DocsSection>

      {/* Code Quality Tools */}
      <DocsSection title="Code Quality Tools" icon={<CheckCircle />}>
        <DocsParagraph>
          Greenstack uses automated tools to maintain code quality and consistency.
        </DocsParagraph>

        <div className="grid gap-4 md:grid-cols-2 my-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Python Tools</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Badge variant="outline" className="mr-2">Black</Badge>
                  Code formatter
                </li>
                <li>
                  <Badge variant="outline" className="mr-2">Ruff</Badge>
                  Fast linter (replaces flake8)
                </li>
                <li>
                  <Badge variant="outline" className="mr-2">MyPy</Badge>
                  Static type checker
                </li>
                <li>
                  <Badge variant="outline" className="mr-2">Pylint</Badge>
                  Code quality analyzer
                </li>
                <li>
                  <Badge variant="outline" className="mr-2">Bandit</Badge>
                  Security scanner
                </li>
                <li>
                  <Badge variant="outline" className="mr-2">Pytest</Badge>
                  Testing framework
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Frontend Tools</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Badge variant="outline" className="mr-2">Prettier</Badge>
                  Code formatter
                </li>
                <li>
                  <Badge variant="outline" className="mr-2">ESLint</Badge>
                  JavaScript/React linter
                </li>
                <li>
                  <Badge variant="outline" className="mr-2">Vite</Badge>
                  Build tool & dev server
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <Card className="my-6">
          <CardHeader>
            <CardTitle className="text-base">Quick Commands (Makefile)</CardTitle>
          </CardHeader>
          <CardContent>
            <DocsCodeBlock language="bash">
{`# Format all code (Python + Frontend)
make format

# Run all linters
make lint

# Run type checking
make type-check

# Run security checks
make security

# Run everything at once
make check

# Run tests
make test

# Run tests with coverage
make test-cov`}
            </DocsCodeBlock>
          </CardContent>
        </Card>
      </DocsSection>

      {/* Code Style Guidelines */}
      <DocsSection title="Code Style Guidelines" icon={<Code />}>
        <DocsParagraph>
          Follow these style guidelines to maintain consistent, readable code.
        </DocsParagraph>

        <div className="space-y-6 my-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Python Style</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground mb-4">
                <li>• <strong>Line length:</strong> 100 characters (Black default)</li>
                <li>• <strong>Variables/functions:</strong> snake_case</li>
                <li>• <strong>Classes:</strong> PascalCase</li>
                <li>• <strong>Constants:</strong> UPPER_CASE</li>
                <li>• <strong>Type hints:</strong> Required for function signatures</li>
                <li>• <strong>Docstrings:</strong> Required for public functions</li>
              </ul>

              <DocsCodeBlock language="python">
{`from typing import List, Optional
from dataclasses import dataclass

@dataclass
class DeviceInfo:
    """Information about an IODD device."""

    device_id: int
    product_name: str
    manufacturer: str
    parameters: Optional[List[str]] = None

def get_device(device_id: int) -> Optional[DeviceInfo]:
    """
    Retrieve device information by ID.

    Args:
        device_id: The unique device identifier

    Returns:
        DeviceInfo object if found, None otherwise
    """
    # Implementation here
    pass`}
              </DocsCodeBlock>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">JavaScript/React Style</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground mb-4">
                <li>• <strong>Line length:</strong> 100 characters</li>
                <li>• <strong>Quotes:</strong> Single quotes for strings</li>
                <li>• <strong>Semicolons:</strong> Required</li>
                <li>• <strong>Arrow functions:</strong> Preferred</li>
                <li>• <strong>React:</strong> Functional components with hooks</li>
                <li>• <strong>Trailing commas:</strong> ES5 style (multiline only)</li>
              </ul>

              <DocsCodeBlock language="javascript">
{`import React, { useState, useEffect } from 'react';
import axios from 'axios';

const DeviceList = ({ onDeviceSelect }) => {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const response = await axios.get('/api/iodds');
        setDevices(response.data);
      } catch (error) {
        console.error('Failed to fetch devices:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDevices();
  }, []);

  return (
    <div>
      {loading ? <Spinner /> : <DeviceTable devices={devices} />}
    </div>
  );
};

export default DeviceList;`}
              </DocsCodeBlock>
            </CardContent>
          </Card>
        </div>
      </DocsSection>

      {/* Git Workflow */}
      <DocsSection title="Git Workflow" icon={<GitBranch />}>
        <DocsParagraph>
          Follow this workflow when contributing code to Greenstack.
        </DocsParagraph>

        <DocsMermaid chart={`
graph TB
    Start["🚀 Start Contributing"] --> Update["1️⃣ Update Your Fork"]
    Update --> UpdateCmds["git checkout main<br/>git pull upstream main"]
    UpdateCmds --> Branch["2️⃣ Create Feature Branch"]
    Branch --> BranchCmd["git checkout -b<br/>feature/your-feature-name"]
    BranchCmd --> Changes["3️⃣ Make Changes"]
    Changes --> ChangesList["✏️ Edit code following style guidelines<br/>🧪 Add tests for new features<br/>📝 Update documentation if needed"]
    ChangesList --> Quality["4️⃣ Run Quality Checks"]
    Quality --> QualityList["make format<br/>make lint<br/>make type-check<br/>make security<br/>make test"]
    QualityList --> Commit["5️⃣ Commit Changes"]
    Commit --> CommitCmd["git add .<br/>git commit -m 'feat: add your feature'<br/><i>Pre-commit hooks run automatically</i>"]
    CommitCmd --> Push["6️⃣ Push to Your Fork"]
    Push --> PushCmd["git push origin<br/>feature/your-feature-name"]
    PushCmd --> PR["7️⃣ Create Pull Request"]
    PR --> PRSteps["📋 Go to GitHub<br/>➕ Click 'New Pull Request'<br/>🔀 Select your feature branch<br/>📝 Describe your changes<br/>✅ Submit for review"]
    PRSteps --> Review{"Review<br/>Feedback?"}
    Review -->|Yes| Feedback["8️⃣ Address Feedback"]
    Feedback --> FeedbackSteps["Make requested changes<br/>Push updates to same branch<br/><i>PR automatically updates</i>"]
    FeedbackSteps --> Review
    Review -->|Approved| Merge["9️⃣ Merge"]
    Merge --> MergeComplete["✨ Maintainer merges your PR<br/>🎉 Contribution Complete!"]

    style Start fill:#2d5016,stroke:#3DB60F,stroke-width:3px,color:#fff
    style Update fill:#1a1f3a,stroke:#3DB60F,stroke-width:2px,color:#fff
    style Branch fill:#1a1f3a,stroke:#3DB60F,stroke-width:2px,color:#fff
    style Changes fill:#1a1f3a,stroke:#3DB60F,stroke-width:2px,color:#fff
    style Quality fill:#1a1f3a,stroke:#51cf66,stroke-width:2px,color:#fff
    style Commit fill:#1a1f3a,stroke:#3DB60F,stroke-width:2px,color:#fff
    style Push fill:#1a1f3a,stroke:#3DB60F,stroke-width:2px,color:#fff
    style PR fill:#1a1f3a,stroke:#3DB60F,stroke-width:2px,color:#fff
    style Review fill:#2d5016,stroke:#3DB60F,stroke-width:3px,color:#fff
    style Feedback fill:#1a1f3a,stroke:#51cf66,stroke-width:2px,color:#fff
    style Merge fill:#2d5016,stroke:#3DB60F,stroke-width:3px,color:#fff
    style MergeComplete fill:#2d5016,stroke:#3DB60F,stroke-width:3px,color:#fff
    style UpdateCmds fill:#2a3050,stroke:#51cf66,stroke-width:1px,color:#fff
    style BranchCmd fill:#2a3050,stroke:#51cf66,stroke-width:1px,color:#fff
    style ChangesList fill:#2a3050,stroke:#51cf66,stroke-width:1px,color:#fff
    style QualityList fill:#2a3050,stroke:#51cf66,stroke-width:1px,color:#fff
    style CommitCmd fill:#2a3050,stroke:#51cf66,stroke-width:1px,color:#fff
    style PushCmd fill:#2a3050,stroke:#51cf66,stroke-width:1px,color:#fff
    style PRSteps fill:#2a3050,stroke:#51cf66,stroke-width:1px,color:#fff
    style FeedbackSteps fill:#2a3050,stroke:#51cf66,stroke-width:1px,color:#fff
`} className="my-6" />

        <DocsCodeBlock language="bash">
{`# Example workflow
git checkout main
git pull upstream main
git checkout -b feature/add-mqtt-logging

# Make your changes...

# Run checks
make format
make lint
make test

# Commit with descriptive message
git add .
git commit -m "feat: add MQTT message logging functionality

- Added MQTT message logging to database
- Created log viewer in admin console
- Added tests for logging functionality
- Updated API documentation"

# Push to your fork
git push origin feature/add-mqtt-logging

# Create PR on GitHub`}
        </DocsCodeBlock>
      </DocsSection>

      {/* Commit Message Convention */}
      <DocsSection title="Commit Message Convention">
        <DocsParagraph>
          Use conventional commit messages for clear history and automated changelog generation.
        </DocsParagraph>

        <Card className="my-6">
          <CardHeader>
            <CardTitle className="text-base">Commit Message Format</CardTitle>
          </CardHeader>
          <CardContent>
            <DocsCodeBlock language="text">
{`type(scope): subject

body (optional)

footer (optional)

Examples:

feat: add MQTT broker configuration UI
feat(api): add device search endpoint
fix: correct IODD XML parsing for nested parameters
fix(ui): resolve theme toggle not persisting
docs: update installation guide for Windows
docs(api): add authentication endpoint examples
refactor: simplify EDS parser logic
refactor(frontend): consolidate API calls
test: add integration tests for theme system
chore: update dependencies to latest versions
style: apply Black formatting to all Python files`}
            </DocsCodeBlock>

            <div className="mt-4">
              <h4 className="font-semibold text-foreground mb-2">Commit Types</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Badge variant="outline" className="mr-2">feat</Badge> New feature</li>
                <li><Badge variant="outline" className="mr-2">fix</Badge> Bug fix</li>
                <li><Badge variant="outline" className="mr-2">docs</Badge> Documentation</li>
                <li><Badge variant="outline" className="mr-2">style</Badge> Code style (formatting, no logic change)</li>
                <li><Badge variant="outline" className="mr-2">refactor</Badge> Code restructuring</li>
                <li><Badge variant="outline" className="mr-2">test</Badge> Adding tests</li>
                <li><Badge variant="outline" className="mr-2">chore</Badge> Maintenance tasks</li>
                <li><Badge variant="outline" className="mr-2">perf</Badge> Performance improvement</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </DocsSection>

      {/* Pull Request Checklist */}
      <DocsSection title="Pull Request Checklist">
        <DocsParagraph>
          Before submitting your pull request, ensure all items are completed.
        </DocsParagraph>

        <Card className="my-6">
          <CardContent className="pt-6">
            <div className="space-y-3">
              {[
                'Code follows style guidelines (passes make format and make lint)',
                'Type hints added for new Python functions',
                'Tests added for new features or bug fixes',
                'All tests pass (make test)',
                'Documentation updated if needed',
                'No security vulnerabilities (make security)',
                'Commit messages are clear and follow convention',
                'PR description explains what and why',
                'Branch is up to date with main',
                'No merge conflicts',
              ].map((item, index) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-brand-green flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground">{item}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </DocsSection>

      {/* Pre-commit Hooks */}
      <DocsSection title="Pre-commit Hooks">
        <DocsParagraph>
          Pre-commit hooks automatically check code quality before each commit.
        </DocsParagraph>

        <Card className="my-6">
          <CardHeader>
            <CardTitle className="text-base">Installing Pre-commit</CardTitle>
          </CardHeader>
          <CardContent>
            <DocsCodeBlock language="bash">
{`# Install pre-commit package
pip install pre-commit

# Install git hooks
pre-commit install

# Manually run all hooks on all files
pre-commit run --all-files

# Run on staged files only
pre-commit run`}
            </DocsCodeBlock>
          </CardContent>
        </Card>

        <Card className="my-6">
          <CardHeader>
            <CardTitle className="text-base">What Gets Checked</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• <strong>File checks:</strong> Trailing whitespace, file endings, merge conflicts</li>
              <li>• <strong>Python:</strong> Black formatting, Ruff linting, MyPy type checking, Bandit security</li>
              <li>• <strong>Frontend:</strong> Prettier formatting, ESLint linting</li>
              <li>• <strong>Security:</strong> Private key detection, large file detection</li>
            </ul>
          </CardContent>
        </Card>

        <DocsCallout type="warning" title="Pre-commit Hook Failures">
          <DocsParagraph>
            If pre-commit hooks fail, your commit will be blocked. Fix the issues and try again.
            Never use <code>--no-verify</code> to skip hooks unless absolutely necessary.
          </DocsParagraph>
        </DocsCallout>
      </DocsSection>

      {/* Testing Requirements */}
      <DocsSection title="Testing Requirements" icon={<CheckCircle />}>
        <DocsParagraph>
          All code contributions must include appropriate tests.
        </DocsParagraph>

        <div className="grid gap-4 md:grid-cols-2 my-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Test Requirements</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• New features require tests</li>
                <li>• Bug fixes should have regression tests</li>
                <li>• Aim for >70% code coverage</li>
                <li>• Tests must pass before merging</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Where to Add Tests</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• <code>tests/test_api.py</code> - API endpoint tests</li>
                <li>• <code>tests/test_parser.py</code> - Parser tests</li>
                <li>• <code>tests/test_storage.py</code> - Database tests</li>
                <li>• Create new files for new modules</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <DocsParagraph>
          For more information on writing tests, see the{' '}
          <DocsLink href="/docs/developer/testing" external={false} onNavigate={onNavigate}>
            Testing Guide
          </DocsLink>.
        </DocsParagraph>
      </DocsSection>

      {/* Getting Help */}
      <DocsSection title="Getting Help" icon={<AlertCircle />}>
        <DocsParagraph>
          Need help with your contribution? Here's where to get assistance.
        </DocsParagraph>

        <div className="grid gap-4 md:grid-cols-2 my-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">GitHub Issues</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                Report bugs, request features, or ask questions about development.
              </p>
              <DocsLink href="https://github.com/ME-Catalyst/greenstack/issues" external>
                View Issues →
              </DocsLink>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">GitHub Discussions</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                Ask questions, share ideas, and discuss features with the community.
              </p>
              <DocsLink href="https://github.com/ME-Catalyst/greenstack/discussions" external>
                Join Discussion →
              </DocsLink>
            </CardContent>
          </Card>
        </div>
      </DocsSection>

      {/* License */}
      <DocsSection title="License" icon={<Book />}>
        <DocsParagraph>
          By contributing to Greenstack, you agree that your contributions will be licensed
          under the MIT License. All contributions become part of the project and are subject
          to the same license terms.
        </DocsParagraph>

        <DocsCallout type="info" title="Contributor Agreement">
          <DocsParagraph>
            When you submit a pull request, you're agreeing to license your code under the
            project's MIT License. Make sure you have the right to contribute the code.
          </DocsParagraph>
        </DocsCallout>
      </DocsSection>

      {/* Related Resources */}
      <DocsSection title="Related Resources">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 my-6">
          <DocsLink href="/docs/developer/architecture" external={false} onNavigate={onNavigate} className="block border border-border rounded-lg p-4 hover:border-brand-green transition-colors">
            <h5 className="font-semibold text-foreground mb-1">System Architecture</h5>
            <p className="text-sm text-muted-foreground">Understand the system design</p>
          </DocsLink>

          <DocsLink href="/docs/developer/testing" external={false} onNavigate={onNavigate} className="block border border-border rounded-lg p-4 hover:border-brand-green transition-colors">
            <h5 className="font-semibold text-foreground mb-1">Testing Guide</h5>
            <p className="text-sm text-muted-foreground">Write effective tests</p>
          </DocsLink>

          <DocsLink href="/docs/developer/backend" external={false} onNavigate={onNavigate} className="block border border-border rounded-lg p-4 hover:border-brand-green transition-colors">
            <h5 className="font-semibold text-foreground mb-1">Backend Development</h5>
            <p className="text-sm text-muted-foreground">Backend code guidelines</p>
          </DocsLink>

          <DocsLink href="/docs/developer/frontend" external={false} onNavigate={onNavigate} className="block border border-border rounded-lg p-4 hover:border-brand-green transition-colors">
            <h5 className="font-semibold text-foreground mb-1">Frontend Development</h5>
            <p className="text-sm text-muted-foreground">Frontend code guidelines</p>
          </DocsLink>
        </div>
      </DocsSection>
    </DocsPage>
  );
}

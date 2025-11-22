# Documentation Structure Policy

This policy defines which Markdown files are allowed in the repository root, where all other documentation should live, and how to format self-hosted docs.

## Allowed files in the repository root
Only the following Markdown files belong in the project root:

- `README.md`: project overview and quickstart entry point.
- `LICENSE.md`: licensing terms.
- `CONTRIBUTING.md`: contributor expectations and workflows.
- `CHANGELOG.md`: high-level release notes for the repository.

All other Markdown content must be placed in the dedicated documentation directories below.

## Location rules for non-root Markdown
- **Developer operations and internal docs:** place under `docs/` (and its subfolders such as `reports/`, `archive/`, or `in-progress/`).
- **End-user and feature documentation:** place under `frontend/src/content/docs/` so it is published through the self-hosted docs site.

## Naming conventions
- Root Markdown files use uppercase names as listed above.
- Files under `docs/` use kebab-case or SCREAMING_SNAKE_CASE that matches existing archives (e.g., `pqa-improvement-plan.md`, `PHASE_02_CLEANUP_GUIDE.md`).
- Self-hosted docs under `frontend/src/content/docs/` should be scoped by folder and use descriptive PascalCase component filenames (e.g., `Overview.jsx`, `ProductionGuide.jsx`).

## Frontmatter and metadata for self-hosted docs
All self-hosted docs in `frontend/src/content/docs/` must export a `metadata` object before the React component definition. Include the following fields:

```js
export const metadata = {
  id: 'category/slug',      // unique path-friendly identifier
  title: 'Page Title',      // display title
  description: 'Summary',   // short summary for listings/search
  category: 'category',     // top-level section such as developer, user-guide, architecture
  order: 1,                 // numeric order within the section
  keywords: ['keyword1'],   // searchable tags
  lastUpdated: 'YYYY-MM-DD' // ISO date string
};
```

Ensure `id` and folder placement stay in sync, and update `lastUpdated` whenever substantive content changes.

# Decisions

## D-001 — Static MVP baseline

Use static HTML, CSS, and vanilla JavaScript with Node.js 20 for tests and build.

**Reason:** It is the smallest architecture that can validate the initial social challenge loop without framework, dependency, backend, or deployment complexity.

## D-002 — GitHub Pages preview

Generate `docs/` from source during build and use it as the GitHub Pages preview source.

**Reason:** It keeps preview hosting free and compatible with the public repository while preserving a separate `dist/` artifact.

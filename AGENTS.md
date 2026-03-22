# AGENTS Rules for This Project

This document defines agent behavior for this repository (TanStack Start).

## 1) Post-change workflow

- After every code change, the agent must run ESLint validation.
- After every code change, the agent must format only edited files using `yarn prettier --write`.
- After formatting, the agent must run ESLint again to confirm no regressions.
- After completing changes, the agent must rebuild the project using `yarn build`.
- The agent should not format or modify files that were not touched.

## 2) Knowledge sources and verification

- If a task depends on framework/library behavior, the agent must use MCP `context7` first.
- If a task affects frontend behavior (UI, routing, interactions), the agent must verify changes with MCP `playwright` in Chrome/Chromium.
- The TanStack Start dev server runs on port `3000`. For frontend verification, use Playwright + Chrome against `http://localhost:3000`.
- Frontend verification must include at least:
  - page renders without runtime errors,
  - basic navigation works,
  - changed functionality behaves as expected.

## 3) Target `src` architecture

### `src/routes`

- Contains route definitions.
- Files here should stay thin and work as passthrough/delegation layers.
- Do not place business logic, API logic, or large page/component implementations in this location.
- Exception: `src/routes/api` is the place for API route definitions.
- Route definitions should delegate implementations to `src/modules/*`.

### `src/modules`

- Contains folders for specific application modules/domains.
- Each module should include the following subfolders:
  - `api` - server function definitions later used in `routes/api`,
  - `components` - module-specific components,
  - `context` - module React Context files,
  - `logic` - action/page logic files,
  - `hooks` - module React hooks,
  - `pages` - rendered page definitions (primarily React/UI),
  - `utils` - module utility functions.
- If a page needs more advanced logic, move it to `logic` and keep `pages` focused on rendering.

### `src/common`

- Contains shared resources used across the whole project.
- Subfolder structure:
  - `components` - reusable components/layouts,
  - `context` - shared React Context files,
  - `logic` - shared logic files,
  - `hooks` - shared React hooks,
  - `utils` - shared utility functions.

## 4) Organization rules

- Domain and integration logic belongs in `modules` or `common`, not in `routes`.
- Route files (`routes`) should import ready implementations from modules instead of implementing logic locally.
- API routes in `routes/api` should delegate handling to server functions from `modules/*/api`.

## 5) Route and page file conventions

- Route entries must use folder-based structure: each route should live in a folder named after the route and use `index.tsx` and `index.lazy.tsx` files.
- Files that define pages (for example in `pages`) should contain only the page definition and related exports.
- Do not define page subcomponents inside page definition files; place subcomponents in separate files under the module's `components` directory and import them into the page file.

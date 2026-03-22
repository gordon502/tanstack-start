# YYWireless AI Model

A web application built with TanStack Start and Supabase for report processing and AI-related configuration data.

The project includes:

- user authentication (email + password, Supabase Auth),
- a report generator (CSV/XLSX upload, processing statuses, download, delete),
- an AI Instructions panel (editable lists and raw JSON model configuration).

## What the app does

After signing in, users work in two main areas:

- `Report Generator` (`/`) - report scheduling and status monitoring,
- `AI Instructions` (`/ai-instructions`) - configuration data used by AI-related flows.

Report statuses:

- `New`
- `Processing`
- `Done`
- `FAILED`

## Tech stack

- `TanStack Start` + `TanStack Router` (routing and server functions),
- `React 19` + `Vite`,
- `Supabase` (Auth, Postgres, Storage, Edge Functions),
- `Tailwind CSS`,
- `Netlify` (production deployment target),
- `GitHub Actions` (CI/CD).

## Project architecture

```text
src/
  routes/                    # route definitions (thin layer)
    __root.tsx
    _authenticated.tsx
    _authenticated/
      index.tsx
      ai-instructions/index.tsx
    login/index.tsx
  modules/
    auth/                    # auth API, logic, and login UI
    reports/                 # report generator and report operations
    ai-instructions/         # AI configuration data
  common/                    # shared components and utilities
supabase/
  migrations/                # schema + RLS + storage policies
  functions/
    process-report-step/     # edge function for report processing steps
.github/workflows/ci-cd.yml  # CI/CD pipeline
```

Architecture rules:

- `src/routes` delegates logic to `src/modules`,
- domain and server-side logic lives in `src/modules/*`,
- `src/common` stores shared components and utilities.

## Server functions (application backend)

The app mainly uses `createServerFn` (instead of classic REST endpoints in `src/routes/api`).

Main functions:

- `auth`
  - `getAuthenticatedUser` (`GET`) - checks user session,
- `reports`
  - `getReports` (`GET`) - list reports for the signed-in user,
  - `createReport` (`POST`) - stores metadata and triggers edge processing,
  - `deleteReport` (`POST`) - removes DB record and storage file,
- `ai-instructions`
  - `getAIInstructions` (`GET`) - reads singleton configuration,
  - `updateAIInstructions` (`POST`) - updates selected fields.

## Supabase: database, storage, edge function

### Database

Main tables:

- `public.ai_instructions` - singleton row (`id = 1`) with option lists and models JSON,
- `public.reports` - user-specific reports,
- `public.report_jobs` - queue of report processing steps.

Security:

- RLS is enabled on app tables,
- report data policies are restricted by `auth.uid()`,
- `ai_instructions` is available to `authenticated` role (select/update).

### Storage

Bucket:

- `reports-input` (private),
- file size limit: `50MB`,
- allowed MIME types: `text/csv`, `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`,
- object paths are namespaced by `user_id` (first path segment).

### Edge function

`supabase/functions/process-report-step`:

- processes `report_jobs` queue,
- updates report status `New -> Processing -> Done`,
- writes `FAILED` with an error payload on failure.

## Local requirements

- `Node.js 24` (recommended by this project and CI),
- `npm`,
- `Supabase CLI` (`npx supabase ...`),
- `Docker Desktop` (for local Supabase stack).

## Quick local start

1. Switch Node runtime:

```bash
nvm use 24
```

2. Install dependencies:

```bash
npm install
```

3. Create local env file:

```bash
cp .env.example .env
```

4. Start local Supabase:

```bash
npx supabase start
```

5. Check status and copy values into `.env`:

```bash
npx supabase status
```

Set in `.env`:

```bash
VITE_SUPABASE_URL="http://127.0.0.1:54321"
VITE_SUPABASE_ANON_KEY="<YOUR_SUPABASE_ANON_OR_PUBLISHABLE_KEY>"
SUPABASE_SECRET_KEY="<YOUR_SUPABASE_SECRET_KEY_SERVER_ONLY>"
```

6. On first run (or after migration changes), reset local database:

```bash
npx supabase db reset
```

7. Start the app:

```bash
npm run dev
```

8. Open:

- app: `http://localhost:3000`
- Supabase Studio: `http://127.0.0.1:54323`

9. Add a test user (if needed):

- Supabase Studio -> Authentication -> Users -> Add user
- sign in through `/login`.

## Environment variables

Required for app frontend/server runtime:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `SUPABASE_SECRET_KEY` (server-only; used to invoke `process-report-step`)

If these variables are missing, the app fails at runtime.
Never expose `SUPABASE_SECRET_KEY` in browser/client code.

## Developer commands

| Command               | Description                                |
| --------------------- | ------------------------------------------ |
| `npm run dev`         | Start dev server (`http://localhost:3000`) |
| `npm run build`       | Create production build                    |
| `npm run preview`     | Preview production build locally           |
| `npm run lint`        | Run ESLint                                 |
| `npm run format`      | Run Prettier check (no write)              |
| `npm run check`       | Run Prettier write + ESLint fix            |
| `npm run check-types` | Run TypeScript `tsc --noEmit`              |

## CI/CD (GitHub Actions)

Workflow: `.github/workflows/ci-cd.yml`.

### When it runs

- `pull_request`: CI job only,
- `push` to `staging` or `production`: CI + deploy.

### What CI checks

In order:

1. `npm ci`
2. `npm run format`
3. `npm run lint`
4. `npm run check-types`
5. `npm run build`

Node version in CI: `24`.

### Deploy

Deploy runs only for branches:

- `staging`,
- `production`.

Deployment order:

1. Supabase (`supabase db push`, `supabase functions deploy process-report-step`)
2. Netlify (`npx netlify deploy --build --prod ...`)

During Supabase deploy, workflow syncs `SUPABASE_SECRET_KEY` into Edge runtime as `REPORT_PROCESSOR_INVOKE_SECRET` (custom secret names cannot start with `SUPABASE_`).

### GitHub Environments and secrets

Two GitHub Environments are required:

- `staging`
- `production`

Each environment should contain:

- `SUPABASE_ACCESS_TOKEN`
- `SUPABASE_PROJECT_REF`
- `SUPABASE_DB_PASSWORD`
- `NETLIFY_AUTH_TOKEN`
- `NETLIFY_SITE_ID`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `SUPABASE_SECRET_KEY`

Branch -> environment mapping:

- `staging` -> `staging`
- `production` -> `production`

## Troubleshooting

- **`Missing required environment variable`**  
  Check `.env` values for `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.

- **Cannot connect to local Supabase**  
  Make sure Docker is running, then run `npx supabase start` and verify with `npx supabase status`.

- **Cannot sign in**  
  Verify that the user exists in Supabase Auth and the password is correct.

- **Report stays in `New`/`Processing`**  
  Check logs for `process-report-step` and inspect `report_jobs` table.

- **`process-report-step` returns `401 Unauthorized`**  
  Verify `SUPABASE_SECRET_KEY` is present in your server runtime and used as the `Authorization: Bearer <sb_secret_...>` header when invoking the function.

- **Supabase warns about leaked password protection**  
  Enable leaked password protection in Supabase Dashboard -> Auth -> Providers -> Email -> Password strength and leaked password protection.

## Notes

- The project is configured for Netlify deployment (`@netlify/vite-plugin-tanstack-start`).
- Backend behavior is implemented via Supabase and server functions, not a separate Express-style REST server.

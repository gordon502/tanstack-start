# Local Supabase (Docker Compose)

This directory contains a full local Supabase stack managed with Docker Compose.

## 1. Preparation

1. Go to the directory:

   ```bash
   cd infra/supabase
   ```

2. Copy the environment variables file:

   ```bash
   cp .env.example .env
   ```

3. Update at least the basic secrets in `.env`:
   - `POSTGRES_PASSWORD`
   - `JWT_SECRET`
   - `ANON_KEY`
   - `SERVICE_ROLE_KEY`
   - `DASHBOARD_PASSWORD`

## 2. Start the stack

```bash
docker compose up -d
```

## 3. Health check

```bash
docker compose ps
```

Services should transition to `running` or `healthy` after a short time.

## 4. Available endpoints (default)

- API Gateway: `http://localhost:8000`
- Studio: `http://localhost:8000` (behind basic auth)
- Postgres (via pooler): `localhost:5432`
- Supavisor transaction pooler: `localhost:6543`

## 5. Stop / reset

Stop:

```bash
docker compose down
```

Reset local data:

```bash
docker compose down -v
```

# Developer Guide

This guide explains the local tooling added for this repo and how to run the system in dev or prod containers.

## Prerequisites

- Docker + Docker Compose v2
- .NET SDK 8 (only required for running `dotnet ef` and local `dotnet run`)

## Quick Start (Dev)

Start everything with hot reload:
```bash
docker compose --profile dev up --build
```

Services:
- API: `http://localhost:5000`
- Web (Vite dev): `http://localhost:5173`
- Mobile (Vite dev): `http://localhost:5174`
- MinIO: `http://localhost:9000`
- MinIO Console: `http://localhost:9001`
- Adminer (DB UI): `http://localhost:8080`

## Quick Start (Prod)

Build + run production images:
```bash
docker compose --profile prod up --build
```

Services:
- API: `http://localhost:5000`
- Web (Nginx): `http://localhost:5173`
- Mobile (Nginx): `http://localhost:5174`
- MinIO: `http://localhost:9000`

## Environment Setup

Copy `.env.example` to `.env` and adjust if needed:
```bash
cp .env.example .env
```

Defaults are already good for local development.

## Database Migrations

Create a migration:
```bash
dotnet ef migrations add <Name> --project backend/Loyalty.Api/Loyalty.Api.csproj --output-dir Data/Migrations
```

Apply migrations:
```bash
dotnet ef database update --project backend/Loyalty.Api/Loyalty.Api.csproj
```

## Reset Dev Database

This stops dev containers, drops the Postgres volume, and starts Postgres:
```bash
./scripts/reset-dev-db.sh
```

After reset, re-apply migrations:
```bash
dotnet ef database update --project backend/Loyalty.Api/Loyalty.Api.csproj
```

## Seed Fake Data

Seeding only runs when `Seed__Enabled=true` and the DB is empty.

Run the helper script:
```bash
./scripts/seed-dev-data.sh
```

Or run manually:
```bash
Seed__Enabled=true dotnet run --project backend/Loyalty.Api/Loyalty.Api.csproj
```

## Object Storage (MinIO)

MinIO is used for program icons and reward images.

Defaults (from `docker-compose.yml`):
- Endpoint: `minio:9000` (inside Docker) or `http://localhost:9000` (from host)
- Access key: `minioadmin`
- Secret key: `minioadmin`
- Bucket: `loyalty-media`
- Public base URL: `http://localhost:9000`

You can access the MinIO console at:
```
http://localhost:9001
```

## Adminer (DB UI)

Adminer is available in dev only:
```
http://localhost:8080
```

Login details:
- Server: `postgres`
- Database: `loyalty`
- Username: `loyalty`
- Password: `loyalty`

## Makefile Shortcuts

```bash
make dev
make prod
make reset-db
make seed
make migrate
```

## Notes

- The API uses PostgreSQL. SQLite is no longer used.
- Dev profile is hot reload; prod profile is built artifacts.
- Seed data is safe to re-run only on an empty DB.

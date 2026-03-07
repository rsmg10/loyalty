# Loyalty Platform

This repository contains the initial backend, web, and mobile (PWA) code scaffolding for the Loyalty Platform MVP.

## Structure

- `backend/`: ASP.NET Core API implementing loyalty workflows and core data model.
- `web/`: Web app placeholder for staff/admin flows.
- `mobile/`: PWA placeholder for customer-facing views.
- `docs/`: Project documentation.

## Quick Start (Backend)

```bash
cd backend/Loyalty.Api
dotnet restore
dotnet run
```

## Developer Guide

See `docs/DEV_GUIDE.md` for full local tooling and workflow details.

## Docker (Dev + Prod)

Dev profile (hot reload):
```bash
docker compose --profile dev up --build
```

Prod profile (built artifacts):
```bash
docker compose --profile prod up --build
```

## Environment Template

Copy `.env.example` to `.env` and adjust as needed for local development.

## Adminer (DB UI)

Adminer is available in the dev profile at:
```
http://localhost:8080
```
Use server `postgres`, database `loyalty`, user `loyalty`, password `loyalty`.

## Migrations

Create a migration:
```bash
dotnet ef migrations add <Name> --project backend/Loyalty.Api/Loyalty.Api.csproj --output-dir Data/Migrations
```

Apply migrations:
```bash
dotnet ef database update --project backend/Loyalty.Api/Loyalty.Api.csproj
```

## Reset Dev DB

```bash
./scripts/reset-dev-db.sh
```

## Seed Dev Data

Set `Seed__Enabled=true` when running the API (dev compose already sets this).
```bash
Seed__Enabled=true dotnet run --project backend/Loyalty.Api/Loyalty.Api.csproj
```

Or use the helper script:
```bash
./scripts/seed-dev-data.sh
```

## Makefile shortcuts

```bash
make dev
make prod
make reset-db
make seed
make migrate
```

## Next Steps

- Implement authentication (OTP/JWT) and messaging integration.
- Build staff/admin web UI for visit recording and redemption.
- Build customer-facing PWA view for status lookup.

# Loyalty Platform

Backend + web staff console + mobile customer wallet for a loyalty MVP.

## Quick Start (Recommended)

Start the full local stack (API + web + mobile + Postgres + MinIO):

```bash
docker compose --profile dev up --build
```

When the DB is empty, seed data is created automatically in dev (`Seed__Enabled=true`).

## Local URLs

- Web staff/admin app: `http://localhost:5173`
- Mobile customer app: `http://localhost:5174`
- API: `http://localhost:5000`
- Adminer (DB UI): `http://localhost:8080`
- MinIO: `http://localhost:9000` (console `http://localhost:9001`)

## First Test Flow (10 Minutes)

1. Web owner flow
- Open `http://localhost:5173`
- Login with `purpose=owner`, phone `+10000000001`, OTP `000000`
- Owner can manage loyalty config, staff, redemptions, reports, and magic links

2. Web staff flow
- Login with `purpose=staff`, phone `+10000000011`, OTP `000000`
- Staff can issue stamps, redeem rewards, lookup customers, and update profiles

3. Mobile customer flow
- Open `http://localhost:5174`
- Login with phone `+15550000001`, OTP `000000`
- Enter business ID `1` (or use a QR magic link generated on web)
- Load status/history; if not enrolled, use Join Program

4. Platform admin flow
- Add admin phone(s) to `Reporting__AdminPhones` (for dev: in `docker-compose.yml` under `backend-dev`)
- Restart backend service after changing env
- Login on web with that phone, then open `/admin` for platform overview + vendor comparison + business/staff controls

## Reset + Reseed

```bash
./scripts/reset-dev-db.sh
docker compose --profile dev up --build
```

## Structure

- `backend/`: ASP.NET Core API
- `web/`: Vue web app (owner/staff/admin)
- `mobile/`: Vue PWA (customer wallet)
- `docs/`: dev and reporting docs

## Useful Commands

```bash
make dev
make prod
make reset-db
make seed
make migrate
```

## Migrations

```bash
dotnet ef migrations add <Name> --project backend/Loyalty.Api/Loyalty.Api.csproj --output-dir Data/Migrations
dotnet ef database update --project backend/Loyalty.Api/Loyalty.Api.csproj
```

## More Detail

See `docs/DEV_GUIDE.md`, `web/README.md`, and `mobile/README.md`.

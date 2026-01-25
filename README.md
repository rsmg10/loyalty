# Loyalty Platform

This repository contains the initial backend, web, and mobile (PWA) code scaffolding for the Loyalty Platform MVP.

## Structure

- `backend/`: ASP.NET Core API implementing loyalty workflows and core data model.
- `web/`: Web app placeholder for staff/admin flows.
- `mobile/`: PWA placeholder for customer-facing views.

## Quick Start (Backend)

```bash
cd backend/Loyalty.Api
dotnet restore
dotnet run
```

## Next Steps

- Implement authentication (OTP/JWT) and messaging integration.
- Build staff/admin web UI for visit recording and redemption.
- Build customer-facing PWA view for status lookup.

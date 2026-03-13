# Mobile/PWA (Customer)

Planned PWA for customer-facing loyalty status.

This file is the source-of-truth plan/status tracker for mobile/PWA work. Keep it updated when backend changes.

## Status Tracker

- [x] OTP login + token storage
- [x] Loyalty status screen (business + reward + progress)
- [x] Visit history list (optional)
- [x] Localization (English/Arabic + RTL support)
- [x] Magic link entry (QR)
- [x] Show program name/description + stamp expiration info
- [x] Stamp transaction history (optional detailed audit)
- [x] Show program icon + reward image when provided
- [ ] Platform admin console is web-only (no mobile scope)

## Sellability TODOs (Platform)

- [ ] SMS/OTP provider integration (platform/backend)
- [ ] Subscription + billing (platform/backend)
- [ ] Platform admin CRUD (web/admin)
- [ ] Security hardening (rate limits, audit logs)
- [ ] Observability (logs, error tracking, metrics)
- [ ] Data management (backups, export, retention)
- [ ] Tenant isolation review (platform/backend)
- [ ] Customer messaging controls (templates, quiet hours)
- [x] Reporting UX polish (web/admin)

## Planned Screens

- Magic link / OTP login
- Magic link landing
- Loyalty status (business name, reward, progress)
- Visit history (optional)
- Stamp history (optional)

## Implementation Notes (MVP)

- Stack: Vue 3 + Vite + TypeScript + Tailwind CSS + Pinia.
- Configure `VITE_API_BASE_URL` to point at the backend (defaults to `http://localhost:5000`).
- Use OTP login to get a session token; send `Authorization: Bearer <token>` on all API requests.
- The app sends `Accept-Language: en|ar` (or `?lang=`) so backend responses match the selected language.
- Use `purpose` value `customer` in OTP requests.
- Dev OTP can be fixed via `Otp__FixedCode` (e.g. `000000`) for local testing.
- CORS origins are controlled by `Cors__AllowedOrigins` (comma-separated), defaulting to localhost web/mobile ports.
- The app is read-only: show loyalty status and visit history only.
- Customers can self-signup after OTP login using `/businesses/{businessId}/self-signup`.
- Status data comes from the loyalty cycle snapshot, so the reward text stays consistent even if the business updates its config.
- Status/history endpoints require the token phone number to match the `phoneNumber` in the URL.
- Visit/redemption staff tracking happens in the backend; no customer-side input is needed.
- Customers can enter a `businessId` manually or use a magic link/QR to prefill it.
- Magic links are now supported via `/magic?token=...` and prefill the business ID.
- Loyalty status now includes program metadata and optional stamp expiration info.
- Status response fields include `programName`, `programDescription`, `stampExpirationDays`, `rewardAvailableAt`, and `lastStampAt`.
- Status response fields also include `programIconUrl` and `rewardImageUrl`.
- Reporting endpoints are web/admin only; the mobile app does not call them.
- Reporting endpoints support filtering/paging via query params (web/admin only).
- Platform admin endpoints (`/admin/businesses`, `/admin/reports/*`) are web-only.
- Health check endpoint `/health` is public and used for infra checks only.

## API Checklist

- POST `/auth/request-otp` { `phoneNumber`, `purpose` }
- POST `/auth/verify-otp` { `phoneNumber`, `code`, `purpose` } → `token`
- GET `/health` (public health check)
- GET `/me` (optional; can be used to confirm the authenticated phone number)
- GET `/businesses/{businessId}/customers/{phoneNumber}` (status)
- POST `/businesses/{businessId}/self-signup` (customer, requires auth token)
- GET `/businesses/{businessId}/customers/{phoneNumber}/visits` (optional history)
- GET `/businesses/{businessId}/customers/{phoneNumber}/stamps` (optional detailed history)
- GET `/magic-links/{token}` (resolve magic link to business info)

## Local Dev

```bash
cd mobile
npm install
npm run dev
```

## Deploy Notes

- Build output goes to `mobile/dist` after `npm run build`.
- Set `VITE_API_BASE_URL` in the hosting environment.

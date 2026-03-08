# Mobile/PWA (Customer)

Planned PWA for customer-facing loyalty status.

This file is the source-of-truth plan/status tracker for mobile/PWA work. Keep it updated when backend changes.

## Status Tracker

- [x] OTP login + token storage
- [x] Loyalty status screen (business + reward + progress)
- [x] Visit history list (optional)
- [x] Localization (English/Arabic + RTL support)
- [ ] Magic link entry (optional future)
- [ ] Show program name/description + stamp expiration info
- [ ] Stamp transaction history (optional detailed audit)
- [ ] Show program icon + reward image when provided

## Planned Screens

- Magic link / OTP login
- Loyalty status (business name, reward, progress)
- Visit history (optional)
- Stamp history (optional)

## Implementation Notes (MVP)

- Stack: Vue 3 + Vite + TypeScript + Tailwind CSS + Pinia.
- Configure `VITE_API_BASE_URL` to point at the backend (defaults to `http://localhost:5000`).
- Use OTP login to get a session token; send `Authorization: Bearer <token>` on all API requests.
- The app sends `Accept-Language: en|ar` (or `?lang=`) so backend responses match the selected language.
- Use `purpose` value `customer` in OTP requests.
- The app is read-only: show loyalty status and visit history only.
- Status data comes from the loyalty cycle snapshot, so the reward text stays consistent even if the business updates its config.
- Status/history endpoints require the token phone number to match the `phoneNumber` in the URL.
- Visit/redemption staff tracking happens in the backend; no customer-side input is needed.
- For now, customers enter a `businessId` manually (from staff/QR). Magic links can replace this later.
- Loyalty status now includes program metadata and optional stamp expiration info.
- Status response fields include `programName`, `programDescription`, `stampExpirationDays`, `rewardAvailableAt`, and `lastStampAt`.
- Status response fields also include `programIconUrl` and `rewardImageUrl`.

## API Checklist

- POST `/auth/request-otp` { `phoneNumber`, `purpose` }
- POST `/auth/verify-otp` { `phoneNumber`, `code`, `purpose` } → `token`
- GET `/me` (optional; can be used to confirm the authenticated phone number)
- GET `/businesses/{businessId}/customers/{phoneNumber}` (status)
- GET `/businesses/{businessId}/customers/{phoneNumber}/visits` (optional history)
- GET `/businesses/{businessId}/customers/{phoneNumber}/stamps` (optional detailed history)

## Local Dev

```bash
cd mobile
npm install
npm run dev
```

## Deploy Notes

- Build output goes to `mobile/dist` after `npm run build`.
- Set `VITE_API_BASE_URL` in the hosting environment.

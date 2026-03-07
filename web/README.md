# Web App (Staff/Admin)

Planned web experience for staff visit entry, customer lookup, and reward redemption.

This file is the source-of-truth plan/status tracker for web work. Keep it updated when backend changes.

## Status Tracker

- [x] OTP login + token storage
- [x] Business selection (load from `/me` for owner/staff)
- [x] Owner onboarding (business + loyalty config)
- [x] Staff management (add/list staff)
- [x] Visit entry flow with cooldown handling
- [x] Redemption flow + confirmation
- [x] Customer lookup + status view
- [x] Customer profile edit (name, optional mobile, usual order, notes)
- [x] Redemptions list (owner)
- [x] Loyalty config update (owner)
- [x] Router + screen split (login/onboarding/app)

## Planned Screens

- Login / OTP
- Business selector
- Business setup
- Visit entry
- Customer lookup
- Customer profile edit (optional mobile, usual order, notes)
- Redemption
- Loyalty config (owner)
- Dashboard hub (multi-card workspace)

## Implementation Notes (MVP)

- Stack: Vue 3 + Vite + TypeScript + Tailwind CSS + Pinia.
- Vue Router splits `/login`, `/onboarding`, and `/app` flows.
- Configure `VITE_API_BASE_URL` to point at the backend (defaults to `http://localhost:5000`).
- Auth is required for all API calls except OTP endpoints. Store the token from `/auth/verify-otp` and send `Authorization: Bearer <token>`.
- Use `purpose` values like `owner` and `staff` in OTP requests to tag sessions.
- Owners can onboard businesses, manage staff, and view redemptions. Staff can record visits, redeem rewards, and edit customer profiles.
- Visit cooldown is enforced server-side; the visit response always returns the current progress/reward status even when a visit is ignored.
- Customer mobile number is optional and stored separately from the lookup phone number.
- Visits and redemptions automatically attach the staff member based on the logged-in session; no extra UI field is required.

## Required Flows

1. Owner OTP login → onboarding (business + loyalty config).
2. Staff OTP login → visit entry + redemption.
3. Customer lookup → profile update (name, optional mobile, usual order, notes).
4. Owner staff management + redemption list.

## API Checklist

- POST `/auth/request-otp` { `phoneNumber`, `purpose` }
- POST `/auth/verify-otp` { `phoneNumber`, `code`, `purpose` } → `token`
- GET `/me` (owner + staff businesses)
- POST `/onboarding` (owner only)
- GET `/businesses/{businessId}` (owner only)
- POST `/businesses/{businessId}/loyalty-config` (owner only)
- POST `/businesses/{businessId}/staff` (owner only)
- GET `/businesses/{businessId}/staff` (owner only)
- POST `/businesses/{businessId}/visits` (staff/owner)
- POST `/businesses/{businessId}/redemptions` (staff/owner)
- GET `/businesses/{businessId}/redemptions` (owner only)
- GET `/businesses/{businessId}/customers/{phoneNumber}` (staff/owner)
- PUT `/businesses/{businessId}/customers/{phoneNumber}/profile` (staff/owner, includes optional `mobileNumber`)
- GET `/businesses/{businessId}/customers/{phoneNumber}/visits` (staff/owner)

## Local Dev

```bash
cd web
npm install
npm run dev
```

## Deploy Notes

- Build output goes to `web/dist` after `npm run build`.
- Set `VITE_API_BASE_URL` in the hosting environment.

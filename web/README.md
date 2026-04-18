# Web App (Staff/Admin)

Planned web experience for staff visit entry, customer lookup, and reward redemption.

This file is the source-of-truth plan/status tracker for web work. Keep it updated when backend changes.

## Status Tracker

- [x] OTP login + token storage
- [x] Business selection (load from `/me` for owner/staff)
- [x] Owner onboarding (business + loyalty config)
- [x] Staff user management (create/list/deactivate/reset credentials)
- [x] Visit entry flow with cooldown handling
- [x] Redemption flow + confirmation
- [x] Customer lookup + status view
- [x] Customer profile edit (name, optional mobile, usual order, notes)
- [x] Redemptions list (owner)
- [x] Loyalty config update (owner)
- [x] Router + screen split (login/onboarding/app)
- [x] Localization (English/Arabic + RTL support)
- [x] Magic link / QR generation for customer app (owner)
- [x] Reporting dashboards (overview, activity, stamps, redemptions, staff, suspicious)
- [x] Reporting overview (basic metrics card)
- [x] Reporting customer activity (basic list)
- [x] Reporting stamp issuance (basic list)
- [x] Reporting redemptions (list)
- [x] Reporting program performance
- [x] Reporting progress funnel
- [x] Reporting top customers
- [x] Reporting retention
- [x] Reporting time activity
- [x] Reporting staff activity
- [x] Reporting suspicious activity
- [x] Admin reporting console (platform overview + vendor comparison)
- [x] Platform admin console (manage businesses + configs)
- [x] Platform admin staff user management (create/deactivate/reset credentials)
- [x] Stamp issuance flow (quantity + reason) using `/stamps`
- [x] Membership join action (explicit create via `/memberships`)
- [x] Stamp transaction history view (audit)
- [x] Business stats card (enrolled customers, stamps issued, rewards redeemed)
- [x] Loyalty program fields (program name/description + stamp expiration days)
- [x] Loyalty media upload (program icon + reward image)
- [x] Guided startup + role flow hints (login/dashboard)
- [x] Avatar/icon visual polish for staff, redemptions, customer history, and admin staff lists
- [x] Role-first auth split (owner OTP vs staff credentials)
- [x] Staff credential auth (`username + password`) with migration fallback
- [x] Backend: owner user-management API for staff credentials (`/staff-users`)
- [x] Backend: credential staff login endpoint (`POST /auth/staff/login`)
- [x] Web UI: owner user management (create/deactivate/reset staff credentials)
- [x] Web UI: staff login form (`username + password`)
- [x] Disable legacy staff OTP flow (`purpose=staff`) in backend
- [x] Enforce one-business-per-staff (remove staff business picker UX)
- [x] Simplify IA: dedicated owner user-management screen (`/owner/users`) separate from daily counter dashboard

## Sellability TODOs

- [ ] SMS/OTP provider integration (Twilio/MessageBird/etc) with env config
- [ ] Subscription + billing (plans, trials, invoicing, usage limits)
- [ ] Platform admin CRUD (create/disable vendors, reset owner access)
- [ ] Security hardening (rate limits, audit logs, admin allowlist)
- [ ] Observability (structured logs, error tracking, metrics/alerts)
- [ ] Data management (backups, export, retention, GDPR delete)
- [ ] Tenant isolation review (no cross-business access paths)
- [ ] Customer messaging controls (templates, quiet hours, defaults)
- [x] Reporting UX polish (date range picker + CSV export)

## Planned Screens

- Role login (owner OTP + staff credentials)
- Business selector
- Business setup
- Visit entry
- Customer lookup
- Customer profile edit (optional mobile, usual order, notes)
- Redemption
- Loyalty config (owner)
- Owner user management (owner-only, dedicated screen)
- Dashboard hub (multi-card workspace)
- Stamp issuance (quantity + reason)
- Stamp history (customer audit)
- Business stats (owner)
- Loyalty media upload (program icon + reward image)
- Magic link / QR generator (owner)

## Implementation Notes (MVP)

- Stack: Vue 3 + Vite + TypeScript + Tailwind CSS + Pinia.
- Vue Router splits `/login`, `/onboarding`, and `/app` flows.
- Owner user-management route is `/owner/users` (owner-only).
- Configure `VITE_API_BASE_URL` to point at the backend (defaults to `http://localhost:5000`).
- Auth is required for all API calls except OTP endpoints. Store the token from `/auth/verify-otp` and send `Authorization: Bearer <token>`.
- The UI sends `Accept-Language: en|ar` (or `?lang=`) so backend error and SMS responses match the selected language.
- Use `purpose=owner` in OTP requests for owner sessions.
- Staff web sessions should use `POST /auth/staff/login` with `username` + `password`.
- `purpose=staff` OTP is disabled in backend.
- Target flow (see `docs/USER_STORIES.md`) migrates staff auth from OTP phone to `username + password`.
- Login UI now uses owner OTP and staff username/password in the same role-first screen.
- Platform admin staff operations also use credential staff users (`/admin/businesses/{businessId}/staff-users`).
- Dev OTP can be fixed via `Otp__FixedCode` (e.g. `000000`) for local testing.
- CORS origins are controlled by `Cors__AllowedOrigins` (comma-separated), defaulting to localhost web/mobile ports. For LAN/mobile testing, add your IP (e.g. `http://192.168.1.10:5173`). You can also set `Cors__AllowAll=true` for local dev.
- Owners can onboard businesses, manage staff, and view redemptions. Staff can record visits, redeem rewards, and edit customer profiles.
- Login now includes a startup checklist (dev command, URLs, OTP behavior, and role flow expectations).
- Dashboard now includes a flow guide card (owner -> staff -> customer -> platform admin path).
- Visit cooldown is enforced server-side; the visit response always returns the current progress/reward status even when a visit is ignored.
- Customer mobile number is optional and stored separately from the lookup phone number.
- Visits and redemptions automatically attach the staff member based on the logged-in session; no extra UI field is required.
- Stamp issuance is separate from visits and supports multi-stamp transactions with a required reason.
- Loyalty program now includes `programName`, optional `programDescription`, and optional `stampExpirationDays`.
- Redemption responses include `redeemedByPhone`; stamp history includes `quantity`, `reason`, and issuer metadata.
- Loyalty media upload uses multipart form data for program icon and reward image.
- Magic links are generated by owners/staff and point to the customer app `/magic` route.
- Reporting endpoints are vendor-scoped; admin endpoints require platform admin phone configuration.
- Reporting endpoints support optional `start`, `end`, `page`, `pageSize` plus filters like `status`, `reward`, `sort`, `staffId`.
- Health check endpoint `/health` is public and used for infra checks only.

## Required Flows

1. Owner OTP login → onboarding (business + loyalty config).
2. Owner/admin creates staff user (`displayName`, `username`, `password`) in staff user management.
3. Staff logs in with username/password → visit entry + redemption.
4. Customer lookup → profile update (name, optional mobile, usual order, notes).
5. Owner staff management in dedicated `/owner/users` screen + redemption list in dashboard owner tools.
6. Staff/owner stamp issuance with quantity + reason.
7. Owner stats view (enrolled customers, stamps issued, rewards redeemed).

Target flow (planned):
1. Staff cannot self-signup.
2. Owner creates staff credentials.
3. Staff signs in with username/password and is auto-scoped to one business.
4. Owner handles staff lifecycle in a dedicated user management screen.

## API Checklist

- POST `/auth/request-otp` { `phoneNumber`, `purpose` } (`purpose=staff` is disabled)
- POST `/auth/verify-otp` { `phoneNumber`, `code`, `purpose` } → `token` (`purpose=staff` is disabled)
- POST `/auth/staff/login` { `username`, `password` } → `token` (credential-based staff login)
- GET `/health` (public health check)
- GET `/me` (owner businesses + staff single-business scope)
- POST `/onboarding` (owner only, includes `programName`, `programDescription`, `rewardName`, `visitThreshold`, `optionalNote`, `stampExpirationDays`)
- GET `/businesses/{businessId}` (owner only)
- POST `/businesses/{businessId}/loyalty-config` (owner only, includes `programName`, `programDescription`, `rewardName`, `visitThreshold`, `optionalNote`, `stampExpirationDays`)
- POST `/businesses/{businessId}/staff-users` (owner only, credential staff create)
- GET `/businesses/{businessId}/staff-users` (owner only, credential staff list)
- PUT `/businesses/{businessId}/staff-users/{staffId}/status` (owner only, activate/deactivate credential staff)
- PUT `/businesses/{businessId}/staff-users/{staffId}/password` (owner only, reset credential staff password)
- POST `/businesses/{businessId}/visits` (staff/owner)
- POST `/businesses/{businessId}/stamps` (staff/owner, `{ customerPhone, quantity, reason, staffId? }`)
- POST `/businesses/{businessId}/memberships` (staff/owner)
- POST `/businesses/{businessId}/self-signup` (customer, requires auth token)
- POST `/businesses/{businessId}/loyalty-media` (owner only, multipart form, `kind=program_icon|reward_image`, `file`)
- POST `/businesses/{businessId}/redemptions` (staff/owner)
- GET `/businesses/{businessId}/redemptions` (owner only)
- GET `/businesses/{businessId}/stats` (owner only)
- GET `/businesses/{businessId}/reports/overview`
- GET `/businesses/{businessId}/reports/customer-growth`
- GET `/businesses/{businessId}/reports/customer-activity`
- GET `/businesses/{businessId}/reports/stamp-issuance`
- GET `/businesses/{businessId}/reports/redemptions`
- GET `/businesses/{businessId}/reports/program-performance`
- GET `/businesses/{businessId}/reports/progress-funnel`
- GET `/businesses/{businessId}/reports/top-customers`
- GET `/businesses/{businessId}/reports/retention`
- GET `/businesses/{businessId}/reports/time-activity`
- GET `/businesses/{businessId}/reports/staff-activity`
- GET `/businesses/{businessId}/reports/suspicious-activity`
- GET `/admin/reports/overview` (platform admin)
- GET `/admin/reports/vendor-comparison` (platform admin)
- GET `/admin/businesses` (platform admin)
- GET `/admin/businesses/{businessId}` (platform admin)
- POST `/admin/businesses` (platform admin, same payload as onboarding)
- PUT `/admin/businesses/{businessId}` (platform admin, update business + program)
- GET `/admin/businesses/{businessId}/staff-users` (platform admin)
- POST `/admin/businesses/{businessId}/staff-users` (platform admin, credential staff create)
- PUT `/admin/businesses/{businessId}/staff-users/{staffId}/status` (platform admin, activate/deactivate credential staff)
- PUT `/admin/businesses/{businessId}/staff-users/{staffId}/password` (platform admin, reset credential staff password)
- POST `/businesses/{businessId}/magic-links` (owner/staff, returns customer app link)
- GET `/businesses/{businessId}/customers/{phoneNumber}` (staff/owner)
- PUT `/businesses/{businessId}/customers/{phoneNumber}/profile` (staff/owner, includes optional `mobileNumber`)
- GET `/businesses/{businessId}/customers/{phoneNumber}/visits` (staff/owner)
- GET `/businesses/{businessId}/customers/{phoneNumber}/stamps` (staff/owner, audit history)

## Local Dev

```bash
cd web
npm install
npm run dev
```

## Deploy Notes

- Build output goes to `web/dist` after `npm run build`.
- Set `VITE_API_BASE_URL` in the hosting environment.

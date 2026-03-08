# Reporting Notes

This document summarizes the current reporting implementation and known data model gaps.

## Defaults

- Date range defaults to the last 30 days when `start`/`end` are omitted.
- Pagination defaults: `page=1`, `pageSize=25` (max 100).

## Current Data Model Gaps

- **Program filtering**: each business has a single active loyalty program. There is no per-transaction program ID, so program filters are effectively no-ops today.
- **Stamps consumed on redemption**: redemptions do not store the number of stamps consumed, only reward metadata.
- **Disabled vendors**: businesses have no active/disabled flag, so admin reporting treats all vendors as active.
- **Retention**: return-within-N-days metrics use stamp transactions as the activity proxy and a short-window approximation for repeat activity.

## Endpoint Summary

Vendor scoped:
- `GET /businesses/{businessId}/reports/overview`
- `GET /businesses/{businessId}/reports/customer-growth`
- `GET /businesses/{businessId}/reports/customer-activity`
- `GET /businesses/{businessId}/reports/stamp-issuance`
- `GET /businesses/{businessId}/reports/redemptions`
- `GET /businesses/{businessId}/reports/program-performance`
- `GET /businesses/{businessId}/reports/progress-funnel`
- `GET /businesses/{businessId}/reports/top-customers`
- `GET /businesses/{businessId}/reports/retention`
- `GET /businesses/{businessId}/reports/time-activity`
- `GET /businesses/{businessId}/reports/staff-activity`
- `GET /businesses/{businessId}/reports/suspicious-activity`

Admin scoped:
- `GET /admin/reports/overview`
- `GET /admin/reports/vendor-comparison`

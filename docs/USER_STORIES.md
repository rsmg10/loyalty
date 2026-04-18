# Product User Stories (Intentional Multi-Tenant Flow)

This document defines the target UX and behavior before implementation changes.

## Product Rules (Locked)

1. Multi-tenant: every business is isolated.
2. Staff cannot self-signup.
3. Staff accounts are created only by a business owner (or platform admin acting for owner operations).
4. Staff identity is `username + password` (no phone required).
5. A staff account belongs to exactly one business.
6. Staff should not see a business picker.
7. Owner has user management for their own business staff.
8. UI should use focused screens with one primary job per screen.

## UX Principles

1. Role-first entry: users choose role first, then see only relevant auth fields.
2. One primary action per screen.
3. Progressive disclosure: advanced options stay hidden until needed.
4. Role-scoped nav: owner tools and staff tools are separated, not mixed.
5. Short labels and obvious next action on every step.

## Personas

1. Business Owner
2. Staff Member
3. Platform Admin
4. Customer

## Stories

### Epic A: Owner onboarding and business setup

1. As a business owner, I want to create my business once so I can start operations quickly.
2. As a business owner, I want to configure the loyalty program in a guided flow so I avoid setup mistakes.

Acceptance criteria:
1. Owner reaches onboarding only when they have no business.
2. Onboarding is step-based and not a long single form.
3. Owner lands on Owner Home after completion.

### Epic B: Owner-managed staff lifecycle

1. As a business owner, I want to create staff accounts with username and temporary password so staff can sign in without phone OTP.
2. As a business owner, I want to deactivate/reactivate staff so I can control access immediately.
3. As a business owner, I want to reset a staff password so I can recover access without support.

Acceptance criteria:
1. Staff creation requires unique username within the business.
2. Staff account stores exactly one business reference.
3. Deactivated staff cannot sign in.
4. Password reset invalidates old password immediately.

### Epic C: Staff authentication and access boundaries

1. As a staff member, I want to sign in with username/password so access is simple and predictable.
2. As a staff member, I want to land directly in my assigned business so I do not make cross-business mistakes.
3. As a staff member, I want a limited workspace (counter + customer actions only) so the screen is not hectic.

Acceptance criteria:
1. Staff sign-in fails if username is unknown or deactivated.
2. Staff sign-in has no onboarding path.
3. Staff cannot query or act on any business except their assigned business.
4. Staff does not see owner/admin menus.

### Epic D: Tenant isolation and authorization

1. As a platform operator, I want strict tenant boundaries so data never leaks across businesses.
2. As a business owner, I want only my staff list visible in user management.

Acceptance criteria:
1. Every staff request is authorized against `staff.businessId`.
2. Owner user management endpoints are business-scoped.
3. Cross-business IDs return forbidden/not found with no data leakage.

### Epic E: Intentional information architecture

1. As any user, I want clean, single-purpose screens so I always know what to do next.
2. As a staff member, I want only today’s operational actions visible by default.

Acceptance criteria:
1. Login screen only contains authentication controls.
2. Owner Home contains only summary cards and entry points.
3. User management has its own dedicated screen.
4. Owner operations (redemptions + business totals) has its own dedicated screen.
5. Front-counter actions are grouped on one focused staff screen.
6. Customer-care actions have their own dedicated staff/owner screen.
7. Reporting and configuration are separate from daily operations.

## Screen Map (Target)

1. `Role Select` screen
2. `Owner Login` screen
3. `Staff Login` screen
4. `Owner Onboarding` flow (stepper)
5. `Owner Home` screen
6. `Owner User Management` screen
7. `Owner Operations` screen
8. `Owner Settings` screen
9. `Owner Reports` screen
10. `Staff Workspace` screen
11. `Staff Customer Care` screen
12. `Customer Mobile` flow

## Navigation Rules (Target)

1. Owner nav: Home, Operations, Staff Users, Settings, Reports.
2. Staff nav: Workspace, Customer Care, Redemptions History.
3. Platform admin nav remains separate from business operations.

## Backend Impact Summary (for implementation phase)

1. Add staff credential model (`username`, password hash, status, businessId).
2. Add owner user-management endpoints (create, deactivate, reset password, list).
3. Replace staff OTP flow with staff credential auth flow.
4. Keep customer auth flow separate.
5. Enforce one-business-per-staff at DB and authorization layers.

## Out of Scope for this phase

1. Fine-grained permissions per staff action.
2. Multi-business staff assignments.
3. SSO and external identity providers.

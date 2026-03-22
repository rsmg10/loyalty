# Start Here: End-to-End Setup and Onboarding

This guide is the fastest way to get from zero to a working system with shops, staff, customers, and platform admin.

## 1) Start the system

From the repo root:

```bash
docker compose --profile dev up --build
```

Wait until these are available:
- Web app: `http://localhost:5173`
- Mobile app: `http://localhost:5174`
- API: `http://localhost:5000`

Dev OTP code is fixed to: `000000`.

## 2) Decide your setup mode

### Option A: Use seeded demo data (fastest)
If this is a fresh DB, seed data is already inserted automatically in dev mode.

Use these demo accounts:
- Owner phone: `+10000000001`
- Staff phone: `+10000000011`
- Customer phone: `+15550000001`
- Business ID for mobile demo: `1`

### Option B: Create your own business (manual onboarding)
Use any new phone number as owner and create your own shop from the onboarding screen.

## 3) Create or open a shop (Owner flow)

1. Open `http://localhost:5173`.
2. In login form:
- Phone: owner phone
- Purpose: `owner`
- Request OTP, then enter `000000`
3. If owner has no shop yet, app sends you to **Onboarding**.
4. Fill shop details:
- Business name/type
- Program name + reward name
- Stamp threshold
- Optional note/expiration
5. Click **Create business**.

After this, you land in dashboard with business selected.

## 4) Add staff to a shop (Owner flow)

1. In web dashboard, open **Owner tools** section.
2. Open **Staff management** card.
3. Enter staff display name + phone number.
4. Click **Add staff**.

Staff can now sign in with:
- Purpose: `staff`
- Their phone number
- OTP `000000`

## 5) Onboard customers

You have two ways:

### Method A: Staff enrolls customer from web
1. Staff logs in to web (`purpose=staff`).
2. In **Customer care** section, open **Membership join**.
3. Enter customer phone and click **Create membership**.
4. Optional: fill **Customer profile** (name, mobile, notes, usual order).

### Method B: Customer self-signup from mobile
1. Customer opens `http://localhost:5174`.
2. Logs in with their phone + OTP `000000`.
3. Enters Business ID (or opens QR/magic link).
4. Clicks **Join program** if not enrolled yet.

## 6) Day-to-day operation (Staff flow)

In web dashboard (`purpose=staff`):
- **Front counter**:
  - Visit entry (record purchases)
  - Stamp issuance (manual adjustments)
  - Redemption (use reward)
- **Customer care**:
  - Lookup status
  - Update profile
  - Review visit/stamp history

## 7) Enable and use platform admin

Admin access is controlled by `Reporting__AdminPhones`.

1. Open `docker-compose.yml`.
2. Under `backend-dev` environment, set for example:

```yaml
Reporting__AdminPhones: "+10000000001"
```

3. Restart backend-dev service:

```bash
docker compose --profile dev up --build backend-dev
```

4. Login on web using that admin phone.
5. Open admin console at `http://localhost:5173/admin`.

Admin can:
- View platform overview
- Compare vendors
- Search/edit businesses
- Add/disable staff across businesses

## 8) Magic link / QR onboarding for customers

1. Owner or staff logs into web.
2. In **Owner tools**, open **Magic link** card.
3. Generate link and copy/share QR.
4. Customer opens link on mobile; business ID is auto-filled.

## 9) Common first-time issues

- OTP not working:
  - In dev, always use `000000`.
- Cannot access admin console:
  - Phone must be listed in `Reporting__AdminPhones` and backend restarted.
- Customer sees not found:
  - They are not enrolled yet; use Membership join or mobile Join Program.
- Wrong business in wallet:
  - Verify Business ID or re-open magic link.

## 10) Reset and start clean

```bash
./scripts/reset-dev-db.sh
docker compose --profile dev up --build
```

Then repeat this guide from step 2.

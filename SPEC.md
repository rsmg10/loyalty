# 📘 Loyalty Platform – Full Product & Technical Specification

**Version:** 1.0 (MVP)
**Audience:** AI engineering agent (Backend + Web + Mobile/PWA)
**Status:** Decisions locked

---

## 1. Product Overview

### 1.1 What This Product Is

A **full loyalty platform** for cafés, fast food, and small retail businesses where:

- Customers earn rewards through **repeat visits**
- Loyalty is **explicit and visible**
- Rewards are **guaranteed and simple**
- Familiarity is preserved across staff
- The system works **without a native app**

This product digitizes **stamp-card loyalty**, enhances it with **confirmation and transparency**, and adds **basic relationship awareness**.

---

### 1.2 What This Product Is NOT

- ❌ Not a CRM
- ❌ Not a marketing automation tool
- ❌ Not a multi-reward marketplace
- ❌ Not a gamified points economy
- ❌ Not a customer social app

Any feature resembling the above is **out of scope for MVP**.

---

## 2. Core Product Principles (Non-Negotiable)

1. **One reward per business**
2. **Visits are the earning unit**
3. **Reward is exact, predefined, and guaranteed**
4. **Redemption is binary**
5. **Customers do not install an app**
6. **Staff actions must be instant**
7. **Simplicity over flexibility**
8. **Humans decide, system enforces**

---

## 3. Actors & Roles

### 3.1 Business Owner

- Sets up the shop
- Defines the loyalty rule
- Views redemptions
- Manages staff (optional, later)

### 3.2 Staff (Cashier)

- Records visits
- Redeems rewards
- Sees customer familiarity info

### 3.3 Customer

- Earns visits
- Receives confirmation (SMS/WhatsApp)
- Optionally views loyalty status via link
- Redeems reward at counter

---

## 4. Loyalty Model (Locked)

### 4.1 Earning Mechanic

- **Unit:** Visit
- **Rule:** 1 visit = +1
- **Threshold:** Business-defined integer (e.g. 9)
- **Spend:** Ignored in MVP

---

### 4.2 Reward Definition

Each business defines **exactly one reward**.

**Fields:**

- `reward_name` (string, required)
  - Example: `"Free regular coffee"`
- `visit_threshold` (integer, required)
  - Example: `9`
- `optional_note` (string, optional)
  - Example: `"Upgrade by paying the difference"`

Reward text is **immutable during a loyalty cycle**.

---

## 5. Customer Lifecycle States

Internal states only (not exposed explicitly):

1. `NEW` – < threshold
2. `PROGRESSING` – earning visits
3. `REWARD_AVAILABLE` – reached threshold
4. `REDEEMED` – reward used, cycle reset

No tiers.
No levels.
No carryover.

---

## 6. Full User Flows

### 6.1 Business Onboarding Flow

**Goal:** Setup completed in < 5 minutes

#### Steps:

1. Enter business name
2. Enter owner phone number (OTP auth)
3. Select business type (café / fast food / retail)
4. Configure loyalty:
   - Reward name
   - Visit threshold
   - Optional note
5. Finish → Dashboard

---

### 6.2 Recording a Visit (Staff Flow)

**Trigger:** Customer checks out

#### Steps:

1. Staff enters customer phone number
2. System:
   - Finds or creates customer
   - Increments visit count
3. System checks:
   - If visit count < threshold → progress
   - If visit count == threshold → reward available
4. Confirmation message sent to customer

#### Staff UI Output:

- Customer name (if exists)
- Progress: `X / N`
- Or: **Reward Available**

---

### 6.3 Customer Confirmation (Always On)

After **every visit**, customer receives SMS or WhatsApp:

**Example (progress):**

> “Thanks for visiting ☕
> You’re now at 6 out of 9 visits.”

**Example (reward reached):**

> “🎉 You’ve earned a **Free regular coffee**!
> Ask staff to redeem on your next visit.”

---

### 6.4 Customer View (Light, Optional)

**Access:**

- Link in message
- QR at shop

**Authentication:**

- Magic link or OTP

**Shows only:**

- Business name
- Reward name
- Progress (e.g. `6 / 9`)
- Optional visit history (timestamps)

**Read-only.**

---

### 6.5 Reward Redemption Flow (Critical)

#### Preconditions:

- Visit count == threshold
- Reward status = AVAILABLE

---

#### Redemption Steps:

1. Staff looks up customer
2. System shows:

   > 🎉 Reward Available
   > **Free regular coffee**

3. Staff asks:

   > “Would you like to use it now?”

4. Staff taps **Redeem**

---

#### On Redeem:

System MUST:

- Mark reward as `REDEEMED`
- Reset visit counter to `0`
- Create redemption record:
  - customer_id
  - business_id
  - staff_id (if available)
  - timestamp

---

#### Success Messages

**Staff:**

> ✅ Reward redeemed

**Customer:**

> ☕ Enjoy your **Free regular coffee**!
> Your loyalty has restarted.

---

#### Hard Rules

- ❌ No undo
- ❌ No partial redemption
- ❌ No double redemption
- ❌ No manual override at counter

---

## 7. Familiarity Support (Secondary Value)

### 7.1 Stored Customer Context (Optional)

Per customer, optional fields:

- `display_name`
- `usual_order`
- `notes` (max 2 short strings)

### 7.2 Visibility

Shown to staff **only when customer is recognized**.

Never required.
Never enforced.

---

## 8. Abuse & Integrity Rules (MVP)

### 8.1 Visit Recording

- One visit per customer per session
- No bulk additions
- Staff identity logged (if enabled)

### 8.2 Redemption

- Immutable
- Logged
- Owner-visible

### 8.3 Rate Limiting

- Prevent rapid repeat visit recording
- Configurable cooldown (e.g. 5–10 minutes)

---

## 9. Data Model (Relational)

### 9.1 Tables

#### `businesses`

```
id
name
owner_phone
created_at
```

#### `loyalty_configs`

```
id
business_id
reward_name
visit_threshold
optional_note
active
```

#### `customers`

```
id
phone_number
display_name
```

#### `visits`

```
id
customer_id
business_id
created_at
```

#### `loyalty_cycles`

```
id
customer_id
business_id
visit_count
status (PROGRESSING | REWARD_AVAILABLE)
```

#### `redemptions`

```
id
customer_id
business_id
reward_name
redeemed_at
staff_id
```

---

## 10. Backend Architecture

### 10.1 API Style

- REST or GraphQL
- Stateless
- JWT / OTP auth

### 10.2 Core Services

- Auth Service (OTP)
- Loyalty Engine
- Messaging Service (SMS/WhatsApp)
- Reporting Service (basic)

---

## 11. Web & Mobile (PWA)

### 11.1 Platform Choice

- Mobile-first web app
- PWA-ready
- No native app required

### 11.2 Screens

- Login / OTP
- Business setup
- Visit entry
- Customer lookup
- Redemption screen
- Customer loyalty page

---

## 12. Messaging Integration

### Channels:

- SMS (fallback)
- WhatsApp (preferred)

### Message Rules:

- Transactional only
- No marketing
- One message per visit
- Clear language

---

## 13. What Is Explicitly Out of Scope (MVP)

- Multiple rewards
- Spend-based earning
- Customer app
- Push notifications
- Campaigns
- AI recommendations
- Cross-business loyalty
- Expiry logic

---

## 14. Future Extensions (Non-Blocking)

- Spend-based modifiers
- VIP acceleration
- PWA install prompt
- Multi-staff permissions
- Analytics dashboards
- AI insights

---

## 15. Final Authority Statement

> **This system enforces clarity, simplicity, and trust.
> Every decision favors operational speed over theoretical fairness.
> Loyalty is earned by presence, rewarded explicitly, and redeemed without ambiguity.**

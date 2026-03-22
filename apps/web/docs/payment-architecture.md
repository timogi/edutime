# Payment Architecture - Payrexx Integration

## Overview

EduTime uses Payrexx as payment provider for license purchases:

- **Next.js API** → checkout initiation (Payrexx Gateway creation)
- **Supabase Edge Functions** → webhook processing + daily reconciliation
- **Supabase Database** → all billing and licensing data

**Related:** Product-wide license and entitlement flows: [license-and-entitlement-flows.md](./license-and-entitlement-flows.md). Scheduled org billing jobs: [jobs.md](./jobs.md).

## Database Schema

### Existing Tables (already in Supabase)

These tables exist and are used as-is. Column names match `src/types/supabase.ts`.

#### billing.accounts

| Column          | Type         | Notes                              |
| --------------- | ------------ | ---------------------------------- |
| id              | uuid (PK)    | auto-generated                     |
| kind            | text         | `'individual'` or `'organization'` |
| user_id         | uuid \| null | FK auth.users                      |
| organization_id | int \| null  | FK public.organizations            |
| created_at      | timestamptz  |                                    |

#### billing.subscriptions

| Column                   | Type                | Notes                                     |
| ------------------------ | ------------------- | ----------------------------------------- |
| id                       | uuid (PK)           | auto-generated                            |
| account_id               | uuid                | FK billing.accounts (required)            |
| provider                 | text                | `'payrexx'` (required)                    |
| provider_subscription_id | text                | Payrexx Gateway ID (required)             |
| status                   | text                | `'active'`, `'canceled'`, etc. (required) |
| amount_cents             | int                 | total in Rappen (required)                |
| currency                 | text                | `'CHF'` (required)                        |
| interval                 | text                | `'year'` (required)                       |
| seat_count               | int \| null         | org seat count                            |
| started_at               | timestamptz         |                                           |
| current_period_start     | timestamptz \| null |                                           |
| current_period_end       | timestamptz \| null |                                           |
| cancel_at_period_end     | boolean             | default false                             |
| canceled_at              | timestamptz \| null |                                           |
| trial_end                | timestamptz \| null |                                           |
| metadata                 | jsonb \| null       | plan, reference_id, etc.                  |
| created_at               | timestamptz         |                                           |

#### billing.invoices

| Column              | Type                | Notes                                |
| ------------------- | ------------------- | ------------------------------------ |
| id                  | uuid (PK)           | auto-generated                       |
| subscription_id     | uuid                | FK billing.subscriptions (required)  |
| amount_cents        | int                 | (required)                           |
| currency            | text                | (required)                           |
| status              | text                | `'paid'`, `'draft'`, etc. (required) |
| provider_invoice_id | text \| null        | Payrexx transaction ID               |
| due_date            | timestamptz \| null |                                      |
| paid_at             | timestamptz \| null |                                      |
| created_at          | timestamptz         |                                      |

#### license.entitlements

| Column                  | Type                | Notes                                                         |
| ----------------------- | ------------------- | ------------------------------------------------------------- |
| id                      | uuid (PK)           | auto-generated                                                |
| user_id                 | uuid \| null        | individual license holder                                     |
| organization_id         | int \| null         | org seat pool                                                 |
| kind                    | text                | `'trial'`, `'personal'`, `'org_seat'`, `'student'` (required) |
| source                  | text                | `'system'`, `'payrexx'`, `'eduid'`, `'manual'` (required)     |
| status                  | text                | `'pending'`, `'active'`, `'revoked'`, `'expired'`             |
| valid_from              | timestamptz         |                                                               |
| valid_until             | timestamptz \| null |                                                               |
| billing_subscription_id | uuid \| null        | FK billing.subscriptions                                      |
| created_at              | timestamptz         |                                                               |
| updated_at              | timestamptz         |                                                               |

### New Tables (to be created)

#### billing.checkout_sessions

Tracks checkout before Payrexx redirect. See `TODO-supabase.md` for CREATE SQL.

#### billing.webhook_events

Idempotency log for webhook processing. See `TODO-supabase.md` for CREATE SQL.

## Data Flow After Successful Payment

```
billing.accounts          find or create (1 per user/org)
       │
billing.subscriptions     1 per purchase
       │
  ┌────┴────┐
  │         │
billing.invoices          1 per payment
              │
license.entitlements      1 (annual) or N (org) per subscription
```

## Purchase Flows

### Individual Annual License (plan=annual)

Creates:

- `billing.accounts` → kind=`'individual'`, user_id=X
- `billing.subscriptions` → provider=`'payrexx'`, interval=`'year'`, seat_count=null
- `billing.invoices` → status=`'paid'`
- `license.entitlements` → kind=`'personal'`, source=`'payrexx'`, valid_until=+1 year

### Organization License (plan=org)

Creates:

- `billing.accounts` → kind=`'organization'`, organization_id=X
- `billing.subscriptions` → provider=`'payrexx'`, interval=`'year'`, seat_count=N
- `billing.invoices` → status=`'paid'`
- N × `license.entitlements` → kind=`'org_seat'`, organization_id=X, user_id=null
- Updates `public.organizations.seats += N`

## Architecture Diagram

```
Browser                    Next.js API              Payrexx              Supabase
  │                            │                       │                    │
  │── POST /api/checkout ─────>│                       │                    │
  │                            │── Insert checkout ───>│                    │
  │                            │   session (pending)   │                    │
  │                            │                       │                    │
  │                            │── POST /Gateway/ ────>│                    │
  │                            │<── Gateway {id,link} ─│                    │
  │                            │                       │                    │
  │                            │── Update session ────>│                    │
  │<── { checkoutUrl } ────────│   (gateway_id, link)  │                    │
  │                            │                       │                    │
  │── Redirect to Payrexx ────>│                       │                    │
  │                            │                       │                    │
  │<── Redirect success/fail ──│                       │                    │
  │                            │                       │                    │
  │                            │                       │── Webhook ────────>│
  │                            │                       │   (Edge Function)  │
  │                            │                       │                    │
  │                            │                       │   1. webhook_events│
  │                            │                       │   2. accounts      │
  │                            │                       │   3. subscriptions │
  │                            │                       │   4. invoices      │
  │                            │                       │   5. entitlements  │
  │                            │                       │                    │
  │                            │          Daily cron job (reconciliation) ──│
  │                            │                       │<── Expire if needed│
```

## Pricing

### Individual: 30 CHF/year

### Organization (tiered):

| Licenses | Price/License |
| -------- | ------------- |
| 1–10     | 30 CHF/year   |
| 11–25    | 25 CHF/year   |
| 26–50    | 20 CHF/year   |
| 51–100   | 15 CHF/year   |
| 100+     | Custom        |

## File Structure

```
src/utils/payments/
  pricing.ts           Shared pricing logic (tiers, amounts, basket)
  paymentProvider.ts   Interface definition
  payrexxClient.ts     Low-level Payrexx API client (HMAC auth)
  payrexxProvider.ts   PayrexxProvider implementing PaymentProvider
  mockProvider.ts      MockPaymentProvider for development
  index.ts             Auto-selects provider based on env vars

src/pages/api/checkout/
  index.ts             POST: create checkout session + Payrexx Gateway

src/pages/checkout/
  index.tsx            Checkout flow (legal gate → redirect)
  success.tsx          Payment success
  failed.tsx           Payment failed
  cancel.tsx           Payment cancelled
  mock.tsx             Mock checkout (development)
```

## Environment Variables

| Variable                    | Required   | Description                         |
| --------------------------- | ---------- | ----------------------------------- |
| `PAYREXX_INSTANCE`          | Production | Payrexx instance name               |
| `PAYREXX_API_SECRET`        | Production | API secret from Payrexx dashboard   |
| `PAYREXX_WEBHOOK_SECRET`    | Production | Webhook signing key (Edge Function) |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes        | Service role key                    |
| `NEXT_PUBLIC_APP_URL`       | Yes        | App URL for redirects               |

Without `PAYREXX_INSTANCE`, the system uses MockPaymentProvider automatically.

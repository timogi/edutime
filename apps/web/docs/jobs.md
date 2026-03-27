# Scheduled Jobs

This document lists recurring backend jobs and how they are configured.

**Related:** How these jobs fit into trials, personal, and org entitlements: [license-and-entitlement-flows.md](./license-and-entitlement-flows.md). Payrexx checkout and webhooks: [payment-architecture.md](./payment-architecture.md).

## Org Billing Jobs

- **Job name:** `org-billing-jobs-daily`
- **Edge function:** `org-billing-jobs`
- **Frequency:** daily (configured via `pg_cron`)
- **Current purpose:**
  - create renewal checkout/payment links for due org subscriptions via Payrexx API (auto-renew only)
  - finalize canceled-at-period-end org subscriptions (disable access after period end)
  - schedule **payment-notice** reminders (`billing.run_org_renewal_reminder_sweep`: invoice **due + 45** / **due + 90** days) and send pending rows via Resend when `RESEND_API_KEY` is set (no separate Resend e-mails from the delinquency RPCs themselves)
  - soft delinquency (`billing.run_org_delinquency_sweep`): unpaid invoice past **due + 45 days** (see below)
  - hard delinquency (`billing.run_org_hard_delinquency_sweep`): unpaid invoice past **due + 90 days** → deactivate org

### Security

- Function-level JWT verification is disabled (`verify_jwt = false`).
- Access is protected by custom header secret:
  - env var in function: `ORG_BILLING_JOB_SECRET`
  - request header in scheduler call: `x-job-secret`

### Org payment timeline (latest open invoice)

Sweeps use the **latest** invoice per subscription with status `open`, `draft`, or `failed` (by `created_at`).

| Milestone | What happens |
|-----------|----------------|
| **Due + 45 days** | Same calendar day (job order): `run_org_renewal_reminder_sweep` may insert `invoice_overdue_45` → **org-billing-jobs** sends “please pay” e-mail if `RESEND_API_KEY` is set; then `run_org_delinquency_sweep`: subscription metadata `org_billing_status = suspended`, active `org_seat` entitlements **revoked** (`payment_failed`). Default `billing.subscriptions.grace_days` is **45**. |
| **Due + 90 days** | Same calendar day (job order): sweep may insert `invoice_overdue_90` → e-mail that access is blocked and payment can restore; then `run_org_hard_delinquency_sweep`: `billing.deactivate_organization_for_nonpayment` — `organizations.is_active = false`, memberships/invites cleared, `org_seat` entitlements expired. |

### Who receives billing emails (this job)

Only organizations with a **Payrexx org plan** subscription linked via `billing.accounts.organization_id` are in scope. **Legacy org rows without this billing link do not receive these automated emails** (and are not processed by these sweeps).

For each email, **one recipient per org** (not every row in `organization_administrators`):

1. **Auto-renew checkout link** (after Payrexx gateway + `create_org_checkout`): `subscription.metadata.responsible_email` if set; otherwise the **first** org admin by `organization_administrators.created_at` (auth email).
2. **Payment notices** (invoice **due + 45** / **due + 90**, rows in `billing.org_renewal_reminders`): same recipient rule in SQL — `responsible_email` / `responsible_user_id` from subscription metadata, else first-admin fallback. One row per milestone, one `recipient_email` per send.

**Resend:** If `RESEND_API_KEY` is missing, checkout-link and payment-notice e-mails are skipped (warnings in logs); Payrexx checkout creation still runs when Payrexx env is configured. Delinquency sweeps only update DB/org state; they do not send mail.

### Payrexx Auto-Renew Requirements

- Required for automatic org renewal checkout generation:
  - `PAYREXX_INSTANCE`
  - `PAYREXX_API_SECRET`
  - optional `PAYREXX_API_VERSION` (default `1.14`)
- Job behavior:
  - only org subscriptions with auto-renew enabled are considered (`cancel_at_period_end=false`)
  - only due subscriptions are considered (`current_period_end <= now`)
  - if an open/draft/failed invoice already exists, a new renewal checkout is skipped

### Example Daily Schedule

```sql
select cron.schedule(
  'org-billing-jobs-daily',
  '0 1 * * *',
  $$
  select net.http_post(
    url := 'https://byxozdvpisjlxfsajmwv.supabase.co/functions/v1/org-billing-jobs',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-job-secret', '<ORG_BILLING_JOB_SECRET>'
    ),
    body := '{}'::jsonb
  );
  $$
);
```

### Operations

```sql
-- List cron jobs
select jobid, jobname, schedule, active
from cron.job
order by jobid desc;

-- Unschedule a job
select cron.unschedule(<jobid>);
```

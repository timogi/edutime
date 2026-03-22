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
  - run delinquency sweep (`billing.run_org_delinquency_sweep`)
  - run renewal reminder scheduling sweep (`billing.run_org_renewal_reminder_sweep`)
  - process pending reminder queue

### Security

- Function-level JWT verification is disabled (`verify_jwt = false`).
- Access is protected by custom header secret:
  - env var in function: `ORG_BILLING_JOB_SECRET`
  - request header in scheduler call: `x-job-secret`

### Email Sending Mode

- `ORG_BILLING_SEND_EMAILS=false` (default/recommended for rollout)
  - reminder content is logged
  - no email is sent
  - reminder rows stay `pending`
- `ORG_BILLING_SEND_EMAILS=true`
  - emails are sent via Resend
  - rows are updated to `sent` or `failed`

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

# Org License V1 Test Plan

This test plan covers the org flow.

## Preconditions

- Payrexx webhook configured and reachable
- `org-billing-jobs` deployed with:
  - `RESEND_API_KEY`
  - `BILLING_FROM_EMAIL`
  - optional `ORG_BILLING_JOB_SECRET`

## Core Scenarios

- Org admin creates checkout for 3+ seats.
  - Expected: checkout link returned, org billing status becomes `active_unpaid`.
- Org checkout creates immediate access state.
  - Expected: org seat entitlements are `active` before invoice is paid.
- Successful Payrexx webhook for org checkout.
  - Expected: invoice set to `paid`, checkout marked `completed`, subscription set `active`.
- Failed/cancelled Payrexx webhook for org checkout.
  - Expected: checkout marked as failed/cancelled, no paid invoice status.

## Delinquency And Suspension

- Open invoice past `due_date + grace_days`.
  - Expected: `run_org_delinquency_sweep` sets subscription `suspended`.
  - Expected: related `org_seat` entitlements become `revoked` with reason `payment_failed`.
- Suspended org member attempts app access.
  - Expected: user no longer has active entitlement and is gated to no-license flow.

## Renewal Reminder Emails

- Run `run_org_renewal_reminder_sweep` on -30/-7/0 day checkpoints.
  - Expected: one reminder record per `(subscription_id, reminder_type, scheduled_for)`.
- Run `org-billing-jobs` with pending reminders.
  - Expected: reminder status changes `pending -> sent` on success.
  - Expected: reminder status changes `pending -> failed` with `last_error` on send failure.
- Verify localization fallback.
  - Expected: `de` default, `en` for English users, `fr` for French users.

## API Authorization

- Non-admin calls `/api/billing/org-license`.
  - Expected: request rejected (no org billing data, no checkout creation).
- Admin calls same endpoint.
  - Expected: status retrieval and checkout creation allowed.

## Rollout

- Deploy migration and both Supabase functions (`payrexx-webhook`, `org-billing-jobs`).
- Validate first renewal cycle reminders in staging before production enablement.

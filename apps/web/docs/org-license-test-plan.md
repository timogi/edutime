# Org License V1 Test Plan

This test plan covers the org flow.

## Preconditions

- Payrexx webhook configured and reachable
- `org-billing-jobs` deployed with:
  - `RESEND_API_KEY`
  - optional `ORG_BILLING_JOB_SECRET`
  - (transactional mail from address is fixed: `noreply@send.edutime.ch`)

## Core Scenarios

- Org admin creates checkout for 3+ seats.
  - Expected: checkout link returned, org billing status becomes `active_unpaid`.
- Org checkout does not auto-assign seats.
  - Expected: no new `org_seat` entitlement is created during checkout creation alone.
  - Expected: seats are assigned only when a member/admin is assigned and capacity allows.
- Successful Payrexx webhook for org checkout.
  - Expected: invoice set to `paid`, checkout marked `completed`, subscription set `active`.
- Failed/cancelled Payrexx webhook for org checkout.
  - Expected: checkout marked as failed/cancelled, no paid invoice status.

## Delinquency And Suspension

- Open invoice past `due_date + grace_days` (default **45** days for org subscriptions).
  - Expected: `run_org_delinquency_sweep` sets subscription `suspended`.
  - Expected: related `org_seat` entitlements become `revoked` with reason `payment_failed`.
- Suspended org member attempts app access.
  - Expected: user no longer has active entitlement and is gated to no-license flow.

## Payment notice e-mails (overdue invoice)

- Run `run_org_renewal_reminder_sweep` with `p_reference_time` on **due date** and **due + 45** calendar days (latest open invoice per org subscription).
  - Expected: at most one reminder row per `(subscription_id, reminder_type, scheduled_for)` for `payment_deadline_passed` / `pre_org_deactivation` (legacy: `invoice_overdue_45` / `invoice_overdue_90` in old data).
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
- Validate payment-notice and auto-renew checkout e-mails in staging before production enablement.

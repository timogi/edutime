# Legacy Organization Migration

This document describes the helper migration flow for migrating current organizations to the new org-license model.

## What this script gives you

- `billing.org_legacy_migration_plan` table to control migration per org
  - `migrate` flag (set `false` for demo orgs)
  - optional `custom_seat_count`
  - optional `custom_annual_amount_cents`
  - optional `actor_user_id` override
- `billing.seed_org_legacy_migration_plan()`
  - inserts missing orgs into the plan table
- `billing.migrate_one_legacy_organization(org_id)`
  - creates/ensures org subscription + manual open invoice + seat entitlements via existing `billing.create_org_checkout`
  - uses stable reference `org-legacy-migration-<org_id>` so re-runs do not duplicate checkout/subscription
  - creates pending invites for `public.organization_members.status='invited'` only if no pending invite already exists
- `billing.run_org_legacy_migration(p_organization_ids int[] default null)`
  - runs for all `migrate=true` orgs (or selected IDs), returns JSON results per org
- `billing.set_org_custom_price_and_seats(...)`
  - helper to manually set custom annual price + seats after migration (and clear `custom_price_pending` metadata)

## How to use

1. Apply migration.
2. Run:

```sql
select billing.seed_org_legacy_migration_plan();
```

3. In `billing.org_legacy_migration_plan` (Supabase GUI):
   - set `migrate=true` only for orgs you want
   - keep demo orgs at `migrate=false`
   - optionally set `custom_seat_count` and `custom_annual_amount_cents`

4. Run:

```sql
select billing.run_org_legacy_migration();
```

5. If needed, set manual custom values later:

```sql
select billing.set_org_custom_price_and_seats(<org_id>, <seats>, <amount_cents>, 'CHF');
```

## Re-run safety

It is safe to re-run; the flow is designed to avoid negative side effects on repeated execution.

## Related Operations Docs

- Scheduled background jobs are documented in `apps/web/docs/jobs.md`.

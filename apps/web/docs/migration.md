# Legacy Organization Migration

Migrate existing organizations to the org-license model in one controlled step per org.

## Plan table: `billing.org_legacy_migration_plan`

| Column | Required when `migrate=true` | Meaning |
|--------|------------------------------|---------|
| `migrate` | — | `true` = run migration; `false` = skip (e.g. demo orgs) |
| `is_free` | No | `true` = complimentary org: no price/renewal required (defaults: `0` Rappen, renewal in 10 years) |
| `annual_amount_cents` | **Yes** if not `is_free` | Total annual license amount in minor units (CHF: Rappen) |
| `renewal_at` | **Yes** if not `is_free` | Next renewal / first Payrexx invoice → `subscriptions.current_period_end` (no synthetic invoice) |
| `seat_count` | Auto | Filled by `seed_org_legacy_migration_plan()`: `max(3, organizations.seats, active members with account)`. Raise manually if you need extra capacity. |
| `currency` | No | Default `CHF` |
| `actor_user_id` | No | Billing contact; default: oldest org admin |
| `note` | No | Free text for your own tracking |
| `metadata` | Auto | Last migration run details (written by RPC) |

Removed columns (no longer used): `due_date`, `custom_seat_count`, `custom_annual_amount_cents`, `migrate_invites`.

## What `billing.run_org_legacy_migration()` does

Single entry point — no separate reset or backfill scripts.

**Once (before the org loop):**

1. `seed_org_legacy_migration_plan()` — refresh `seat_count` on all plan rows
2. `backfill_organization_member_user_ids()` — map `organization_members.user_id` from `auth.users` via `ilike` on e-mail
3. Void leftover synthetic invoices (`provider_invoice_id` like `org-legacy-migration-%`)

**Per org with `migrate = true`:**

1. Reset org billing state for that org (entitlements, pending invites, invoices, subscription, org account)
2. Create org subscription (`active_paid`, `current_period_end = renewal_at`) — **no synthetic invoice**
3. Insert `org_seat` entitlements for **active `organization_members`** with `user_id` (not `organization_administrators` — admins only get a seat via invite/member flow or `ensure_org_actor_entitlement`)
4. Create pending `license.org_invites` for invited members without account (no e-mail from SQL)

Re-running `billing.run_org_legacy_migration()` is idempotent: each org is reset and fully re-provisioned. Personal (individual) billing is never touched.

Returns `{ "member_user_id_backfill": …, "organizations": [ … per org … ] }`.

## Step-by-step (production)

### 1. Deploy database migrations

Including through **`20260525150000_org_legacy_migration_run_all_in_one.sql`** (single RPC: seed, backfill, reset, migrate).

```bash
cd apps/web
npx supabase db push
```

### 2. Fill the plan table

(`seed` also runs inside `run_org_legacy_migration`; step 2 below is optional if you run migration immediately.)

For each org to migrate:

- `migrate` = `true`
- Paid orgs: `annual_amount_cents` + `renewal_at`
- **Free orgs:** `is_free` = `true` (price and renewal optional; written to plan after migrate)
- Check `seat_count` (already set by seed; increase if needed)

Demo orgs: `migrate = false` (no migration). Free orgs: `migrate = true` + `is_free = true`.

### 3. Run migration

```sql
select jsonb_pretty(billing.run_org_legacy_migration());
```

If you see `42725: function billing.run_org_legacy_migration() is not unique`, apply migration `20260525120000_fix_run_org_legacy_migration_overload.sql`, then retry.

Optional: single org only — `select jsonb_pretty(billing.run_org_legacy_migration(array[48]::bigint[]));`

### 4. Verify

```sql
select om.organization_id, om.user_email, om.user_id
from public.organization_members om
join billing.org_legacy_migration_plan p
  on p.organization_id = om.organization_id and p.migrate = true
where om.status = 'active'
  and (
    om.user_id is null
    or not exists (
      select 1 from license.entitlements e
      where e.user_id = om.user_id
        and e.organization_id = om.organization_id
        and e.kind = 'org_seat'
        and e.status = 'active'
        and e.valid_from <= now()
        and (e.valid_until is null or e.valid_until >= now())
    )
  );
```

Expected: **0 rows** (covers missing `user_id` and missing entitlements).

### 5. Deploy app + edge functions

Same DB revision as migrations before enabling license gating globally.

## Adjust after migration

```sql
select billing.set_org_custom_price_and_seats(
  <org_id>,
  <seat_count>,
  <amount_cents>,
  'CHF',
  '<renewal_at>'::timestamptz
);
```

## Related docs

- [license-and-entitlement-flows.md](./license-and-entitlement-flows.md)
- [jobs.md](./jobs.md)

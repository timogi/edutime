-- Run in Supabase SQL editor if migration 20260525120000 is not deployed yet.
-- Fixes: ERROR 42725 function billing.run_org_legacy_migration() is not unique

drop function if exists billing.run_org_legacy_migration(int[]);

create or replace function billing.run_org_legacy_migration(
  p_organization_ids int[]
) returns jsonb
language plpgsql
security definer
set search_path = billing, public, auth
as $$
declare
  v_ids bigint[];
begin
  select coalesce(array_agg(x::bigint), '{}'::bigint[])
  into v_ids
  from unnest(p_organization_ids) as x;

  return billing.run_org_legacy_migration(v_ids);
end;
$$;

-- Then:
-- select jsonb_pretty(billing.run_org_legacy_migration());

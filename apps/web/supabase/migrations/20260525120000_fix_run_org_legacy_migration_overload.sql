-- Fix ERROR 42725: billing.run_org_legacy_migration() is not unique
-- (bigint[] and int[] both had default null).

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

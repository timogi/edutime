-- Run before re-running org legacy migration if members lack user_id.
-- See apps/web/supabase/migrations/20260525130000_org_legacy_migration_member_user_id_backfill.sql

create or replace function billing.backfill_organization_member_user_ids(
  p_organization_ids bigint[] default null
) returns jsonb
language plpgsql
security definer
set search_path = public, auth, billing
as $$
declare
  v_updated int := 0;
  v_orgs_touched int := 0;
  v_still_unmatched int := 0;
begin
  with updated as (
    update public.organization_members om
    set user_id = u.id
    from auth.users u
    where om.user_id is null
      and om.status = 'active'
      and om.user_email is not null
      and length(trim(om.user_email)) > 0
      and om.user_email ilike u.email
      and (
        p_organization_ids is null
        or om.organization_id::bigint = any(p_organization_ids)
      )
    returning om.organization_id
  )
  select count(*)::int, count(distinct organization_id)::int
  into v_updated, v_orgs_touched
  from updated;

  select count(*)::int
  into v_still_unmatched
  from public.organization_members om
  where om.status = 'active'
    and om.user_id is null
    and om.user_email is not null
    and length(trim(om.user_email)) > 0
    and (
      p_organization_ids is null
      or om.organization_id::bigint = any(p_organization_ids)
    );

  return jsonb_build_object(
    'updated_members', v_updated,
    'organizations_touched', v_orgs_touched,
    'still_unmatched_active', v_still_unmatched
  );
end;
$$;

-- Preview unmatched active members (before backfill):
-- select om.organization_id, om.user_email
-- from public.organization_members om
-- join billing.org_legacy_migration_plan p on p.organization_id = om.organization_id and p.migrate = true
-- where om.status = 'active' and om.user_id is null;

-- Then:
-- select jsonb_pretty(billing.run_org_legacy_migration());

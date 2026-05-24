-- run_org_legacy_migration: seed, backfill user_id, reset org billing, migrate (single entry point).

create or replace function billing.reset_one_legacy_organization_for_migration(
  p_organization_id bigint
) returns jsonb
language plpgsql
security definer
set search_path = billing, license, public, auth
as $$
declare
  v_deleted_entitlements int := 0;
  v_deleted_invites int := 0;
  v_deleted_invoices int := 0;
  v_deleted_subscriptions int := 0;
  v_deleted_accounts int := 0;
begin
  delete from license.entitlements e
  where e.kind = 'org_seat'
    and e.organization_id = p_organization_id;
  get diagnostics v_deleted_entitlements = row_count;

  delete from license.org_invites oi
  where oi.organization_id = p_organization_id
    and oi.status = 'pending';
  get diagnostics v_deleted_invites = row_count;

  update billing.checkout_sessions cs
  set subscription_id = null
  where cs.subscription_id in (
    select s.id
    from billing.subscriptions s
    join billing.accounts a on a.id = s.account_id
    where a.kind = 'organization'
      and a.organization_id = p_organization_id
  );

  delete from billing.invoices i
  where i.subscription_id in (
    select s.id
    from billing.subscriptions s
    join billing.accounts a on a.id = s.account_id
    where a.kind = 'organization'
      and a.organization_id = p_organization_id
  );
  get diagnostics v_deleted_invoices = row_count;

  delete from billing.subscriptions s
  where s.account_id in (
    select a.id
    from billing.accounts a
    where a.kind = 'organization'
      and a.organization_id = p_organization_id
  );
  get diagnostics v_deleted_subscriptions = row_count;

  delete from billing.accounts a
  where a.kind = 'organization'
    and a.organization_id = p_organization_id;
  get diagnostics v_deleted_accounts = row_count;

  return jsonb_build_object(
    'organization_id', p_organization_id,
    'deleted_entitlements', v_deleted_entitlements,
    'deleted_invites', v_deleted_invites,
    'deleted_invoices', v_deleted_invoices,
    'deleted_subscriptions', v_deleted_subscriptions,
    'deleted_accounts', v_deleted_accounts
  );
end;
$$;

create or replace function billing.run_org_legacy_migration(
  p_organization_ids bigint[] default null
) returns jsonb
language plpgsql
security definer
set search_path = billing, public, auth, license
as $$
declare
  v_org_id bigint;
  v_result jsonb;
  v_results jsonb := '[]'::jsonb;
  v_backfill jsonb;
  v_reset jsonb;
begin
  perform billing.seed_org_legacy_migration_plan();

  v_backfill := billing.backfill_organization_member_user_ids(p_organization_ids);

  update billing.invoices i
  set status = 'void'
  where coalesce(i.provider_invoice_id, '') like 'org-legacy-migration-%';

  for v_org_id in
    select p.organization_id::bigint
    from billing.org_legacy_migration_plan p
    where p.migrate = true
      and (
        p_organization_ids is null
        or p.organization_id::bigint = any(p_organization_ids)
      )
    order by p.organization_id asc
  loop
    begin
      v_reset := billing.reset_one_legacy_organization_for_migration(v_org_id);
      v_result := billing.migrate_one_legacy_organization(v_org_id);
      v_result := v_result || jsonb_build_object('reset', v_reset);
      v_results := v_results || jsonb_build_array(v_result);
    exception
      when others then
        v_results := v_results || jsonb_build_array(jsonb_build_object(
          'organization_id', v_org_id,
          'migrated', false,
          'error', sqlerrm
        ));
    end;
  end loop;

  return jsonb_build_object(
    'member_user_id_backfill', v_backfill,
    'organizations', v_results
  );
end;
$$;

drop function if exists billing.run_org_legacy_migration(int[]);

create or replace function billing.run_org_legacy_migration(
  p_organization_ids int[]
) returns jsonb
language plpgsql
security definer
set search_path = billing, public, auth, license
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

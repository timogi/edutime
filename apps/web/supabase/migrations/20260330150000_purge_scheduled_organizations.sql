-- Permanently remove organizations past scheduled_deletion_at (admin-requested deletion).

create or replace function billing.purge_organizations_past_scheduled_deletion(
  p_reference_time timestamptz default now()
) returns jsonb
language plpgsql
security definer
set search_path = billing, license, legal, public
as $$
declare
  v_org_id int;
  v_count int := 0;
begin
  for v_org_id in
    select o.id
    from public.organizations o
    where o.scheduled_deletion_at is not null
      and o.scheduled_deletion_at <= p_reference_time
    order by o.id
  loop
    delete from billing.org_renewal_reminders r
    where r.organization_id = v_org_id;

    delete from billing.org_legacy_migration_plan p
    where p.organization_id = v_org_id;

    delete from billing.invoices i
    where i.subscription_id in (
      select s.id
      from billing.subscriptions s
      join billing.accounts a on a.id = s.account_id
      where a.organization_id = v_org_id
    );

    delete from billing.checkout_sessions c
    where c.organization_id = v_org_id
       or c.subscription_id in (
         select s.id
         from billing.subscriptions s
         join billing.accounts a on a.id = s.account_id
         where a.organization_id = v_org_id
       );

    delete from billing.subscriptions s
    where s.account_id in (
      select a.id from billing.accounts a where a.organization_id = v_org_id
    );

    delete from billing.accounts a
    where a.organization_id = v_org_id;

    delete from legal.acceptances la
    where la.subject_organization_id = v_org_id;

    delete from license.entitlements e
    where e.organization_id = v_org_id;

    delete from license.org_invites i
    where i.organization_id = v_org_id;

    delete from public.organization_members m
    where m.organization_id = v_org_id;

    delete from public.organization_administrators oa
    where oa.organization_id = v_org_id;

    delete from public.organizations o
    where o.id = v_org_id;

    v_count := v_count + 1;
  end loop;

  return jsonb_build_object('purged_organizations', v_count);
end;
$$;

grant execute on function billing.purge_organizations_past_scheduled_deletion(timestamptz) to service_role;

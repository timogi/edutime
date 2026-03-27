-- Org delinquency: 45 days after invoice due = soft suspend + revoke seats;
-- 90 days after invoice due = hard deactivate org (billing-driven nonpayment).
-- Org Payrexx subscriptions get grace_days = 45 on insert (trigger) and existing rows updated below.

update billing.subscriptions s
set grace_days = 45
where s.provider = 'payrexx'
  and coalesce(s.metadata ->> 'plan', '') = 'org';

create or replace function billing.trg_set_org_subscription_grace_days()
returns trigger
language plpgsql
security definer
set search_path = billing
as $$
begin
  if new.provider = 'payrexx' and coalesce(new.metadata ->> 'plan', '') = 'org' then
    new.grace_days := 45;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_billing_subscriptions_org_grace on billing.subscriptions;
create trigger trg_billing_subscriptions_org_grace
before insert on billing.subscriptions
for each row
execute function billing.trg_set_org_subscription_grace_days();

-- Latest unpaid invoice per subscription (open / draft / failed).
create or replace function billing.run_org_delinquency_sweep(
  p_reference_time timestamptz default now()
) returns jsonb
language plpgsql
security definer
set search_path = billing, license, public
as $$
declare
  v_suspended_count int := 0;
  v_revoked_count int := 0;
begin
  with latest_open_invoice as (
    select distinct on (i.subscription_id)
      i.subscription_id,
      i.due_date
    from billing.invoices i
    where i.status in ('open', 'draft', 'failed')
      and i.due_date is not null
    order by i.subscription_id, i.created_at desc
  ),
  candidate_subscriptions as (
    select distinct s.id
    from billing.subscriptions s
    join latest_open_invoice i on i.subscription_id = s.id
    where s.provider = 'payrexx'
      and coalesce(s.metadata ->> 'plan', '') = 'org'
      and s.status in ('active', 'active_unpaid')
      and coalesce(s.metadata ->> 'org_billing_status', '') <> 'suspended'
      and p_reference_time >= (i.due_date + make_interval(days => coalesce(s.grace_days, 45)))
  )
  update billing.subscriptions s
  set suspend_at = p_reference_time,
      metadata = coalesce(s.metadata, '{}'::jsonb) || jsonb_build_object(
        'last_suspended_at', p_reference_time,
        'suspend_reason', 'invoice_overdue',
        'org_billing_status', 'suspended'
      )
  from candidate_subscriptions cs
  where s.id = cs.id;

  get diagnostics v_suspended_count = row_count;

  update license.entitlements e
  set status = 'revoked',
      revocation_reason = 'payment_failed',
      updated_at = p_reference_time
  where e.billing_subscription_id in (
    select s.id
    from billing.subscriptions s
    where s.provider = 'payrexx'
      and coalesce(s.metadata ->> 'plan', '') = 'org'
      and coalesce(s.metadata ->> 'org_billing_status', '') = 'suspended'
  )
    and e.kind = 'org_seat'
    and e.status = 'active';

  get diagnostics v_revoked_count = row_count;

  return jsonb_build_object(
    'suspended_subscriptions', v_suspended_count,
    'revoked_entitlements', v_revoked_count
  );
end;
$$;

-- System-only: same end state as admin deactivate, without actor (delinquency hard lock).
create or replace function billing.deactivate_organization_for_nonpayment(
  p_organization_id int,
  p_reference_time timestamptz default now()
) returns void
language plpgsql
security definer
set search_path = billing, license, public
as $$
begin
  if p_organization_id is null then
    return;
  end if;

  if not exists (select 1 from public.organizations o where o.id = p_organization_id) then
    return;
  end if;

  if not exists (select 1 from public.organizations o where o.id = p_organization_id and o.is_active = true) then
    return;
  end if;

  update public.organizations
  set is_active = false
  where id = p_organization_id;

  update public.organization_members
  set status = 'canceled',
      user_id = null
  where organization_id = p_organization_id
    and status in ('active', 'invited');

  update license.org_invites
  set status = 'canceled'
  where organization_id = p_organization_id
    and status = 'pending';

  update license.entitlements
  set status = 'expired',
      revocation_reason = null,
      updated_at = p_reference_time
  where organization_id = p_organization_id
    and kind = 'org_seat'
    and status in ('active', 'pending');
end;
$$;

grant execute on function billing.deactivate_organization_for_nonpayment(int, timestamptz) to service_role;

create or replace function billing.run_org_hard_delinquency_sweep(
  p_reference_time timestamptz default now()
) returns jsonb
language plpgsql
security definer
set search_path = billing, license, public
as $$
declare
  v_org_id int;
  v_deactivated_count int := 0;
begin
  for v_org_id in
    with latest_open_invoice as (
      select distinct on (i.subscription_id)
        i.subscription_id,
        i.due_date
      from billing.invoices i
      where i.status in ('open', 'draft', 'failed')
        and i.due_date is not null
      order by i.subscription_id, i.created_at desc
    ),
    hard_orgs as (
      select distinct a.organization_id as oid
      from billing.subscriptions s
      join billing.accounts a on a.id = s.account_id and a.organization_id is not null
      join latest_open_invoice i on i.subscription_id = s.id
      join public.organizations o on o.id = a.organization_id
      where s.provider = 'payrexx'
        and coalesce(s.metadata ->> 'plan', '') = 'org'
        and p_reference_time >= (i.due_date + interval '90 days')
        and o.is_active = true
    )
    select oid from hard_orgs
  loop
    perform billing.deactivate_organization_for_nonpayment(v_org_id, p_reference_time);
    v_deactivated_count := v_deactivated_count + 1;
  end loop;

  return jsonb_build_object(
    'deactivated_organizations', v_deactivated_count
  );
end;
$$;

grant execute on function billing.run_org_hard_delinquency_sweep(timestamptz) to service_role;

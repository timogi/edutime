-- Org-Zahlungsfrist: Mahnung wenn due_date erreicht ist (Zahlungsfrist abgelaufen);
-- zweite Mahnung am Tag due+45 (unmittelbar vor möglicher Deaktivierung).
-- Soft-Delinquency (Suspend + Sitze widerrufen) ab due_date (Kalendertag).
-- Harte Deaktivierung ab due_date + 45 Tagen (= 90 Tage nach Verlängerung, wenn due = Verlängerung+45).

alter table billing.org_renewal_reminders
  drop constraint if exists org_renewal_reminders_reminder_type_check;

alter table billing.org_renewal_reminders
  add constraint org_renewal_reminders_reminder_type_check
  check (
    reminder_type in (
      'payment_deadline_passed',
      'pre_org_deactivation',
      'invoice_overdue_45',
      'invoice_overdue_90'
    )
  );

create or replace function billing.run_org_renewal_reminder_sweep(
  p_reference_time timestamptz default now()
) returns jsonb
language plpgsql
security definer
set search_path = billing, public, auth
as $$
declare
  v_inserted_count int := 0;
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
  org_sub as (
    select
      s.id as subscription_id,
      a.organization_id,
      (s.metadata ->> 'responsible_user_id')::uuid as responsible_user_id,
      (s.metadata ->> 'responsible_email') as responsible_email,
      i.due_date
    from billing.subscriptions s
    join billing.accounts a on a.id = s.account_id
    join latest_open_invoice i on i.subscription_id = s.id
    where s.provider = 'payrexx'
      and coalesce(s.metadata ->> 'plan', '') = 'org'
      and a.organization_id is not null
  ),
  due_slots as (
    select
      os.subscription_id,
      os.organization_id,
      os.responsible_user_id,
      os.responsible_email,
      os.due_date,
      x.reminder_type,
      x.scheduled_for
    from org_sub os
    cross join lateral (
      values
        ('payment_deadline_passed'::text, os.due_date::date),
        ('pre_org_deactivation'::text, (os.due_date + interval '45 days')::date)
    ) as x(reminder_type, scheduled_for)
    where x.scheduled_for <= p_reference_time::date
  ),
  resolved_recipients as (
    select
      ds.subscription_id,
      ds.organization_id,
      coalesce(ds.responsible_user_id, fallback.user_id) as recipient_user_id,
      coalesce(ds.responsible_email, fallback.email) as recipient_email,
      ds.reminder_type,
      ds.scheduled_for
    from due_slots ds
    left join lateral (
      select oa.user_id, u.email
      from public.organization_administrators oa
      join auth.users u on u.id = oa.user_id
      where oa.organization_id = ds.organization_id
        and u.email is not null
      order by oa.created_at asc
      limit 1
    ) fallback on true
  )
  insert into billing.org_renewal_reminders (
    subscription_id,
    organization_id,
    recipient_user_id,
    recipient_email,
    reminder_type,
    scheduled_for,
    status
  )
  select
    rr.subscription_id,
    rr.organization_id,
    rr.recipient_user_id,
    rr.recipient_email,
    rr.reminder_type,
    rr.scheduled_for,
    'pending'
  from resolved_recipients rr
  where rr.recipient_email is not null
  on conflict (subscription_id, reminder_type, scheduled_for) do nothing;

  get diagnostics v_inserted_count = row_count;

  return jsonb_build_object('scheduled_reminders', v_inserted_count);
end;
$$;

grant execute on function billing.run_org_renewal_reminder_sweep(timestamptz) to service_role;

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
      and p_reference_time::date >= i.due_date
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
        and p_reference_time::date >= (i.due_date + interval '45 days')::date
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

grant execute on function billing.run_org_delinquency_sweep(timestamptz) to service_role;
grant execute on function billing.run_org_hard_delinquency_sweep(timestamptz) to service_role;

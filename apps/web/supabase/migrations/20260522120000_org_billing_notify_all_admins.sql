-- Org billing reminders: one pending row per org admin (deduped by email), not a single "responsible" recipient.

drop index if exists billing.uq_org_renewal_reminders_subscription_slot;

create unique index if not exists uq_org_renewal_reminders_subscription_slot_recipient
  on billing.org_renewal_reminders (subscription_id, reminder_type, scheduled_for, recipient_email);

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
  admin_recipients as (
    select distinct on (
      ds.subscription_id,
      ds.reminder_type,
      ds.scheduled_for,
      lower(trim(u.email))
    )
      ds.subscription_id,
      ds.organization_id,
      oa.user_id as recipient_user_id,
      trim(u.email) as recipient_email,
      ds.reminder_type,
      ds.scheduled_for
    from due_slots ds
    join public.organization_administrators oa
      on oa.organization_id = ds.organization_id
    join auth.users u on u.id = oa.user_id
    where u.email is not null
      and position('@' in trim(u.email)) > 0
    order by
      ds.subscription_id,
      ds.reminder_type,
      ds.scheduled_for,
      lower(trim(u.email)),
      oa.created_at asc
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
    ar.subscription_id,
    ar.organization_id,
    ar.recipient_user_id,
    ar.recipient_email,
    ar.reminder_type,
    ar.scheduled_for,
    'pending'
  from admin_recipients ar
  on conflict (subscription_id, reminder_type, scheduled_for, recipient_email) do nothing;

  get diagnostics v_inserted_count = row_count;

  return jsonb_build_object('scheduled_reminders', v_inserted_count);
end;
$$;

grant execute on function billing.run_org_renewal_reminder_sweep(timestamptz) to service_role;

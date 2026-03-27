-- Reminder rows were only inserted when (due + 45/90) equaled *exactly* the job run date.
-- That yields 0 rows on almost every day (e.g. after auto-renew the new invoice due date is in the future).
-- Insert when the milestone date is today or in the past; unique (subscription_id, reminder_type, scheduled_for)
-- still ensures one row per milestone. Missed days are backfilled on the next run.

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
        ('invoice_overdue_45'::text, (os.due_date + interval '45 days')::date),
        ('invoice_overdue_90'::text, (os.due_date + interval '90 days')::date)
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

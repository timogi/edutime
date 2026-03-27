-- Organization license V1 flow (Payrexx one-off + invoice methods).
-- This migration intentionally avoids public schema changes.

alter table billing.subscriptions
  add column if not exists grace_days int not null default 14,
  add column if not exists suspend_at timestamptz;

alter table billing.invoices
  add column if not exists checkout_session_id uuid references billing.checkout_sessions(id),
  add column if not exists issued_at timestamptz not null default now();

create index if not exists idx_billing_invoices_subscription_status_due
  on billing.invoices(subscription_id, status, due_date);

create table if not exists billing.org_renewal_reminders (
  id uuid primary key default gen_random_uuid(),
  subscription_id uuid not null references billing.subscriptions(id) on delete cascade,
  organization_id int not null references public.organizations(id),
  recipient_user_id uuid references auth.users(id),
  recipient_email text not null,
  reminder_type text not null check (reminder_type in ('invoice_overdue_45', 'invoice_overdue_90')),
  scheduled_for date not null,
  status text not null default 'pending' check (status in ('pending', 'sent', 'failed')),
  sent_at timestamptz,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists uq_org_renewal_reminders_subscription_slot
  on billing.org_renewal_reminders(subscription_id, reminder_type, scheduled_for);

create index if not exists idx_org_renewal_reminders_pending
  on billing.org_renewal_reminders(status, scheduled_for);

create or replace function billing.set_org_renewal_reminders_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_org_renewal_reminders_set_updated_at on billing.org_renewal_reminders;
create trigger trg_org_renewal_reminders_set_updated_at
before update on billing.org_renewal_reminders
for each row
execute function billing.set_org_renewal_reminders_updated_at();

alter table billing.org_renewal_reminders enable row level security;

drop policy if exists "Service role full access on org renewal reminders" on billing.org_renewal_reminders;
create policy "Service role full access on org renewal reminders"
  on billing.org_renewal_reminders
  for all
  to service_role
  using (true)
  with check (true);

create or replace function billing.create_org_checkout(
  p_actor_user_id uuid,
  p_organization_id int,
  p_quantity int,
  p_amount_cents int,
  p_currency text,
  p_reference_id text,
  p_payrexx_gateway_id bigint default null,
  p_payrexx_gateway_link text default null,
  p_payrexx_gateway_hash text default null,
  p_expires_at timestamptz default null,
  p_due_date timestamptz default null,
  p_metadata jsonb default '{}'::jsonb
) returns uuid
language plpgsql
security definer
set search_path = billing, license, public, auth
as $$
declare
  v_now timestamptz := now();
  v_period_end timestamptz;
  v_due_date timestamptz;
  v_account_id uuid;
  v_subscription_id uuid;
  v_checkout_id uuid;
  v_existing_checkout billing.checkout_sessions%rowtype;
  v_is_admin boolean;
  v_responsible_email text;
  v_assigned_count int := 0;
  v_target_assigned int;
begin
  if p_actor_user_id is null then
    raise exception 'Missing actor user id';
  end if;

  if p_organization_id is null then
    raise exception 'Missing organization id';
  end if;

  if p_quantity is null or p_quantity < 3 then
    raise exception 'Organization licenses require at least 3 seats';
  end if;

  if p_amount_cents is null or p_amount_cents <= 0 then
    raise exception 'Invalid amount';
  end if;

  if p_reference_id is null or length(trim(p_reference_id)) = 0 then
    raise exception 'Missing checkout reference id';
  end if;

  select exists(
    select 1
    from public.organization_administrators oa
    where oa.organization_id = p_organization_id
      and oa.user_id = p_actor_user_id
  ) into v_is_admin;

  if not coalesce(v_is_admin, false) then
    raise exception 'Not authorized to manage billing for organization %', p_organization_id;
  end if;

  select *
  into v_existing_checkout
  from billing.checkout_sessions
  where reference_id = p_reference_id
  for update;

  if found then
    if v_existing_checkout.plan <> 'org'
       or v_existing_checkout.organization_id is distinct from p_organization_id then
      raise exception 'Reference id already used for another checkout context';
    end if;

    if v_existing_checkout.subscription_id is not null then
      return v_existing_checkout.subscription_id;
    end if;
  end if;

  select u.email
  into v_responsible_email
  from auth.users u
  where u.id = p_actor_user_id;

  if v_responsible_email is null then
    select u.email
    into v_responsible_email
    from public.organization_administrators oa
    join auth.users u on u.id = oa.user_id
    where oa.organization_id = p_organization_id
      and u.email is not null
    order by oa.created_at asc
    limit 1;
  end if;

  select id
  into v_account_id
  from billing.accounts
  where organization_id = p_organization_id
    and kind = 'organization'
  limit 1;

  if v_account_id is null then
    insert into billing.accounts (kind, organization_id)
    values ('organization', p_organization_id)
    returning id into v_account_id;
  end if;

  select id
  into v_subscription_id
  from billing.subscriptions
  where account_id = v_account_id
    and provider = 'payrexx'
  order by created_at desc
  limit 1
  for update;

  if v_subscription_id is null then
    v_period_end := v_now + interval '1 year';
    insert into billing.subscriptions (
      account_id,
      provider,
      provider_subscription_id,
      status,
      amount_cents,
      currency,
      interval,
      seat_count,
      started_at,
      current_period_start,
      current_period_end,
      metadata,
      grace_days,
      suspend_at
    )
    values (
      v_account_id,
      'payrexx',
      coalesce(p_payrexx_gateway_id::text, p_reference_id),
      'active_unpaid',
      p_amount_cents,
      p_currency,
      'year',
      p_quantity,
      v_now,
      v_now,
      v_period_end,
      jsonb_build_object(
        'plan', 'org',
        'organization_id', p_organization_id,
        'responsible_user_id', p_actor_user_id,
        'responsible_email', v_responsible_email,
        'reference_id', p_reference_id
      ) || coalesce(p_metadata, '{}'::jsonb),
      14,
      null
    )
    returning id into v_subscription_id;
  else
    update billing.subscriptions
    set status = 'active_unpaid',
        amount_cents = p_amount_cents,
        currency = p_currency,
        interval = 'year',
        seat_count = p_quantity,
        provider_subscription_id = coalesce(provider_subscription_id, coalesce(p_payrexx_gateway_id::text, p_reference_id)),
        metadata = coalesce(metadata, '{}'::jsonb) || jsonb_build_object(
          'plan', 'org',
          'organization_id', p_organization_id,
          'responsible_user_id', p_actor_user_id,
          'responsible_email', v_responsible_email,
          'reference_id', p_reference_id,
          'last_checkout_created_at', v_now
        ) || coalesce(p_metadata, '{}'::jsonb),
        suspend_at = null
    where id = v_subscription_id;
  end if;

  if v_existing_checkout.id is null then
    insert into billing.checkout_sessions (
      user_id,
      organization_id,
      plan,
      quantity,
      amount_cents,
      currency,
      status,
      payrexx_gateway_id,
      payrexx_gateway_hash,
      payrexx_gateway_link,
      reference_id,
      subscription_id,
      metadata,
      expires_at
    )
    values (
      p_actor_user_id,
      p_organization_id,
      'org',
      p_quantity,
      p_amount_cents,
      p_currency,
      'pending',
      p_payrexx_gateway_id,
      p_payrexx_gateway_hash,
      p_payrexx_gateway_link,
      p_reference_id,
      v_subscription_id,
      jsonb_build_object(
        'source', 'org_checkout_api',
        'plan', 'org',
        'actor_user_id', p_actor_user_id
      ) || coalesce(p_metadata, '{}'::jsonb),
      p_expires_at
    )
    returning id into v_checkout_id;
  else
    update billing.checkout_sessions
    set user_id = p_actor_user_id,
        organization_id = p_organization_id,
        quantity = p_quantity,
        amount_cents = p_amount_cents,
        currency = p_currency,
        status = 'pending',
        payrexx_gateway_id = coalesce(payrexx_gateway_id, p_payrexx_gateway_id),
        payrexx_gateway_hash = coalesce(payrexx_gateway_hash, p_payrexx_gateway_hash),
        payrexx_gateway_link = coalesce(payrexx_gateway_link, p_payrexx_gateway_link),
        subscription_id = v_subscription_id,
        metadata = coalesce(metadata, '{}'::jsonb) || coalesce(p_metadata, '{}'::jsonb),
        expires_at = coalesce(p_expires_at, expires_at)
    where id = v_existing_checkout.id
    returning id into v_checkout_id;
  end if;

  v_due_date := coalesce(p_due_date, v_now + interval '30 days');
  insert into billing.invoices (
    subscription_id,
    amount_cents,
    currency,
    status,
    provider_invoice_id,
    due_date,
    paid_at,
    issued_at,
    checkout_session_id
  )
  values (
    v_subscription_id,
    p_amount_cents,
    p_currency,
    'open',
    null,
    v_due_date,
    null,
    v_now,
    v_checkout_id
  );

  update license.entitlements
  set status = 'expired',
      revocation_reason = null,
      updated_at = v_now
  where billing_subscription_id = v_subscription_id
    and kind = 'org_seat'
    and status = 'active';

  with admin_candidates as (
    select distinct oa.user_id, 0 as priority, min(oa.created_at) as created_at
    from public.organization_administrators oa
    where oa.organization_id = p_organization_id
      and oa.user_id is not null
    group by oa.user_id
  ),
  member_candidates as (
    select distinct om.user_id, 1 as priority, min(om.created_at) as created_at
    from public.organization_members om
    where om.organization_id = p_organization_id
      and om.status = 'active'
      and om.user_id is not null
    group by om.user_id
  ),
  merged as (
    select * from admin_candidates
    union all
    select * from member_candidates
  ),
  ranked as (
    select distinct on (user_id)
      user_id,
      priority,
      created_at
    from merged
    order by user_id, priority asc, created_at asc
  ),
  selected_users as (
    select user_id
    from ranked
    order by priority asc, created_at asc, user_id asc
    limit p_quantity
  )
  insert into license.entitlements (
    user_id,
    organization_id,
    kind,
    source,
    status,
    valid_from,
    valid_until,
    billing_subscription_id
  )
  select
    su.user_id,
    p_organization_id,
    'org_seat',
    'payrexx',
    'active',
    v_now,
    null,
    v_subscription_id
  from selected_users su;

  get diagnostics v_assigned_count = row_count;
  v_target_assigned := greatest(p_quantity - v_assigned_count, 0);

  if v_target_assigned > 0 then
    insert into license.entitlements (
      user_id,
      organization_id,
      kind,
      source,
      status,
      valid_from,
      valid_until,
      billing_subscription_id
    )
    select
      null,
      p_organization_id,
      'org_seat',
      'payrexx',
      'active',
      v_now,
      null,
      v_subscription_id
    from generate_series(1, v_target_assigned);
  end if;

  return v_subscription_id;
end;
$$;

create or replace function billing.process_payrexx_org_payment(
  p_reference_id text,
  p_payrexx_transaction_id text,
  p_payrexx_gateway_id bigint default null,
  p_raw_payload jsonb default '{}'::jsonb
) returns uuid
language plpgsql
security definer
set search_path = billing, license, public
as $$
declare
  v_session billing.checkout_sessions%rowtype;
  v_subscription billing.subscriptions%rowtype;
  v_now timestamptz := now();
  v_period_start timestamptz;
  v_period_end timestamptz;
begin
  select *
  into v_session
  from billing.checkout_sessions
  where reference_id = p_reference_id
  for update;

  if not found then
    raise exception 'Org checkout session not found for reference_id=%', p_reference_id;
  end if;

  if v_session.plan <> 'org' then
    raise exception 'Checkout session is not org plan: %', v_session.plan;
  end if;

  if v_session.subscription_id is null then
    raise exception 'Org checkout session has no subscription id';
  end if;

  select *
  into v_subscription
  from billing.subscriptions
  where id = v_session.subscription_id
  for update;

  if not found then
    raise exception 'Subscription not found for org checkout session %', v_session.id;
  end if;

  if v_session.status = 'completed' and v_session.payrexx_transaction_id is not null then
    return v_session.subscription_id;
  end if;

  with candidate_invoice as (
    select id
    from billing.invoices
    where subscription_id = v_session.subscription_id
    order by
      case
        when provider_invoice_id = p_payrexx_transaction_id then 0
        when provider_invoice_id is null then 1
        else 2
      end,
      created_at desc
    limit 1
  )
  update billing.invoices i
  set status = 'paid',
      paid_at = v_now,
      provider_invoice_id = coalesce(i.provider_invoice_id, p_payrexx_transaction_id)
  where i.id in (select id from candidate_invoice);

  v_period_start := case
    when v_subscription.current_period_end is not null and v_subscription.current_period_end > v_now
      then v_subscription.current_period_end
    else v_now
  end;
  v_period_end := v_period_start + interval '1 year';

  update billing.subscriptions
  set status = 'active',
      current_period_start = v_period_start,
      current_period_end = v_period_end,
      provider_subscription_id = coalesce(provider_subscription_id, coalesce(p_payrexx_gateway_id::text, p_reference_id)),
      suspend_at = null,
      metadata = coalesce(metadata, '{}'::jsonb) || jsonb_build_object(
        'last_reference_id', p_reference_id,
        'last_transaction_id', p_payrexx_transaction_id,
        'last_paid_at', v_now
      ) || coalesce(p_raw_payload, '{}'::jsonb)
  where id = v_session.subscription_id;

  update license.entitlements
  set status = 'active',
      revocation_reason = null,
      source = 'payrexx',
      updated_at = v_now
  where billing_subscription_id = v_session.subscription_id
    and kind = 'org_seat';

  update billing.checkout_sessions
  set status = 'completed',
      payrexx_gateway_id = coalesce(payrexx_gateway_id, p_payrexx_gateway_id),
      payrexx_transaction_id = coalesce(payrexx_transaction_id, p_payrexx_transaction_id),
      metadata = coalesce(metadata, '{}'::jsonb) || jsonb_build_object(
        'last_processed_at', v_now,
        'last_transaction_id', p_payrexx_transaction_id
      )
  where id = v_session.id;

  return v_session.subscription_id;
end;
$$;

create or replace function billing.get_org_billing_status(
  p_actor_user_id uuid,
  p_organization_id int
) returns table (
  subscription_id uuid,
  subscription_status text,
  amount_cents int,
  currency text,
  seat_count int,
  current_period_start timestamptz,
  current_period_end timestamptz,
  grace_days int,
  suspend_at timestamptz,
  invoice_id uuid,
  invoice_status text,
  invoice_due_date timestamptz,
  invoice_paid_at timestamptz,
  payrexx_gateway_link text,
  checkout_reference_id text,
  responsible_email text
)
language plpgsql
security definer
set search_path = billing, public, auth
as $$
declare
  v_is_admin boolean;
begin
  if p_actor_user_id is null then
    raise exception 'Missing actor user id';
  end if;

  select exists(
    select 1
    from public.organization_administrators oa
    where oa.organization_id = p_organization_id
      and oa.user_id = p_actor_user_id
  ) into v_is_admin;

  if not coalesce(v_is_admin, false) then
    raise exception 'Not authorized to read billing status for organization %', p_organization_id;
  end if;

  return query
  with org_account as (
    select a.id
    from billing.accounts a
    where a.organization_id = p_organization_id
      and a.kind = 'organization'
    order by a.created_at desc
    limit 1
  ),
  org_subscription as (
    select s.*
    from billing.subscriptions s
    where s.account_id in (select id from org_account)
      and s.provider = 'payrexx'
    order by s.created_at desc
    limit 1
  ),
  latest_invoice as (
    select i.*
    from billing.invoices i
    where i.subscription_id in (select id from org_subscription)
    order by i.created_at desc
    limit 1
  ),
  latest_checkout as (
    select c.*
    from billing.checkout_sessions c
    where c.subscription_id in (select id from org_subscription)
      and c.plan = 'org'
    order by c.created_at desc
    limit 1
  )
  select
    s.id,
    s.status,
    s.amount_cents,
    s.currency,
    s.seat_count,
    s.current_period_start,
    s.current_period_end,
    s.grace_days,
    s.suspend_at,
    i.id,
    i.status,
    i.due_date,
    i.paid_at,
    c.payrexx_gateway_link,
    c.reference_id,
    coalesce(s.metadata ->> 'responsible_email', null)
  from org_subscription s
  left join latest_invoice i on true
  left join latest_checkout c on true;
end;
$$;

create or replace function billing.run_org_delinquency_sweep(
  p_reference_time timestamptz default now()
) returns jsonb
language plpgsql
security definer
set search_path = billing, license
as $$
declare
  v_suspended_count int := 0;
  v_revoked_count int := 0;
begin
  with candidate_subscriptions as (
    select distinct s.id, coalesce(s.grace_days, 14) as grace_days, i.due_date
    from billing.subscriptions s
    join billing.invoices i on i.subscription_id = s.id
    where s.provider = 'payrexx'
      and coalesce(s.metadata ->> 'plan', '') = 'org'
      and s.status in ('active', 'active_unpaid')
      and i.status in ('open', 'draft', 'failed')
      and i.due_date is not null
      and p_reference_time >= (i.due_date + make_interval(days => coalesce(s.grace_days, 14)))
  )
  update billing.subscriptions s
  set status = 'suspended',
      suspend_at = p_reference_time,
      metadata = coalesce(s.metadata, '{}'::jsonb) || jsonb_build_object(
        'last_suspended_at', p_reference_time,
        'suspend_reason', 'invoice_overdue'
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
    where s.status = 'suspended'
      and s.provider = 'payrexx'
      and coalesce(s.metadata ->> 'plan', '') = 'org'
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

grant all on billing.org_renewal_reminders to service_role;
grant execute on function billing.create_org_checkout(uuid, int, int, int, text, text, bigint, text, text, timestamptz, timestamptz, jsonb) to service_role;
grant execute on function billing.process_payrexx_org_payment(text, text, bigint, jsonb) to service_role;
grant execute on function billing.get_org_billing_status(uuid, int) to service_role;
grant execute on function billing.run_org_delinquency_sweep(timestamptz) to service_role;
grant execute on function billing.run_org_renewal_reminder_sweep(timestamptz) to service_role;

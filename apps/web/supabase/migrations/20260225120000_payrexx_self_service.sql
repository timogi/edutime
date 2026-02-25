-- Payrexx self-service checkout + webhook processing (individual annual licenses).

create table if not exists billing.checkout_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id),
  organization_id int references public.organizations(id),
  plan text not null check (plan in ('annual', 'org')),
  quantity int not null default 1 check (quantity > 0),
  amount_cents int not null check (amount_cents > 0),
  currency text not null default 'CHF',
  status text not null default 'pending'
    check (status in ('pending', 'completed', 'failed', 'cancelled', 'expired')),
  payrexx_gateway_id bigint,
  payrexx_gateway_hash text,
  payrexx_gateway_link text,
  payrexx_transaction_id text,
  reference_id text not null unique,
  subscription_id uuid references billing.subscriptions(id),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  expires_at timestamptz
);

create table if not exists billing.webhook_events (
  id uuid primary key default gen_random_uuid(),
  event_key text not null unique,
  event_type text not null,
  payload jsonb not null,
  processed boolean not null default false,
  processing_error text,
  created_at timestamptz not null default now(),
  processed_at timestamptz
);

create index if not exists idx_checkout_sessions_user_id
  on billing.checkout_sessions(user_id);
create index if not exists idx_checkout_sessions_reference_id
  on billing.checkout_sessions(reference_id);
create index if not exists idx_checkout_sessions_status
  on billing.checkout_sessions(status);
create index if not exists idx_checkout_sessions_gateway_id
  on billing.checkout_sessions(payrexx_gateway_id);
create index if not exists idx_webhook_events_processed
  on billing.webhook_events(processed);

-- Ensure one provider_subscription_id maps to exactly one subscription.
create unique index if not exists uq_billing_subscriptions_provider_ref
  on billing.subscriptions(provider, provider_subscription_id)
  where provider_subscription_id is not null;

-- Defensive cleanup before uniqueness enforcement:
-- keep only the newest active personal entitlement per user.
with ranked as (
  select
    id,
    row_number() over (
      partition by user_id
      order by created_at desc, id desc
    ) as rn
  from license.entitlements
  where user_id is not null
    and kind = 'personal'
    and status = 'active'
)
update license.entitlements e
set status = 'expired',
    updated_at = now()
from ranked r
where e.id = r.id
  and r.rn > 1;

-- Prevent duplicate simultaneously active personal licenses for the same user.
create unique index if not exists uq_active_personal_entitlement_per_user
  on license.entitlements(user_id)
  where user_id is not null and kind = 'personal' and status = 'active';

create or replace function billing.set_checkout_session_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_checkout_sessions_set_updated_at on billing.checkout_sessions;
create trigger trg_checkout_sessions_set_updated_at
before update on billing.checkout_sessions
for each row
execute function billing.set_checkout_session_updated_at();

alter table billing.checkout_sessions enable row level security;
alter table billing.webhook_events enable row level security;

drop policy if exists "Users can read own checkout sessions" on billing.checkout_sessions;
create policy "Users can read own checkout sessions"
  on billing.checkout_sessions
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Service role full access on checkout sessions" on billing.checkout_sessions;
create policy "Service role full access on checkout sessions"
  on billing.checkout_sessions
  for all
  to service_role
  using (true)
  with check (true);

drop policy if exists "Service role full access on webhook events" on billing.webhook_events;
create policy "Service role full access on webhook events"
  on billing.webhook_events
  for all
  to service_role
  using (true)
  with check (true);

grant usage on schema billing to authenticated, service_role;
grant select on billing.checkout_sessions to authenticated;
grant all on billing.checkout_sessions to service_role;
grant all on billing.webhook_events to service_role;

create or replace function billing.process_payrexx_payment(
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
  v_account_id uuid;
  v_subscription_id uuid;
  v_invoice_id uuid;
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
    raise exception 'Checkout session not found for reference_id=%', p_reference_id;
  end if;

  if v_session.plan <> 'annual' then
    raise exception 'Unsupported plan for self-service: %', v_session.plan;
  end if;

  if v_session.status = 'completed' and v_session.subscription_id is not null then
    return v_session.subscription_id;
  end if;

  select id
  into v_account_id
  from billing.accounts
  where user_id = v_session.user_id
    and kind = 'individual'
  limit 1;

  if v_account_id is null then
    insert into billing.accounts (kind, user_id)
    values ('individual', v_session.user_id)
    returning id into v_account_id;
  end if;

  select id, current_period_end
  into v_subscription_id, v_period_start
  from billing.subscriptions
  where account_id = v_account_id
    and provider = 'payrexx'
    and provider_subscription_id = coalesce(p_payrexx_gateway_id::text, p_reference_id)
  limit 1;

  if v_subscription_id is null then
    v_period_start := v_now;
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
      metadata
    )
    values (
      v_account_id,
      'payrexx',
      coalesce(p_payrexx_gateway_id::text, p_reference_id),
      'active',
      v_session.amount_cents,
      v_session.currency,
      'year',
      null,
      v_now,
      v_period_start,
      v_period_end,
      jsonb_build_object(
        'plan', 'annual',
        'reference_id', p_reference_id,
        'checkout_session_id', v_session.id
      ) || coalesce(p_raw_payload, '{}'::jsonb)
    )
    returning id into v_subscription_id;
  else
    v_period_start := greatest(coalesce(v_period_start, v_now), v_now);
    v_period_end := v_period_start + interval '1 year';

    update billing.subscriptions
    set status = 'active',
        amount_cents = v_session.amount_cents,
        currency = v_session.currency,
        interval = 'year',
        current_period_start = v_period_start,
        current_period_end = v_period_end,
        metadata = coalesce(metadata, '{}'::jsonb) || jsonb_build_object(
          'last_reference_id', p_reference_id,
          'last_transaction_id', p_payrexx_transaction_id,
          'last_processed_at', v_now
        )
    where id = v_subscription_id;
  end if;

  select id
  into v_invoice_id
  from billing.invoices
  where provider_invoice_id = p_payrexx_transaction_id
  limit 1;

  if v_invoice_id is null then
    insert into billing.invoices (
      subscription_id,
      amount_cents,
      currency,
      status,
      provider_invoice_id,
      paid_at
    )
    values (
      v_subscription_id,
      v_session.amount_cents,
      v_session.currency,
      'paid',
      p_payrexx_transaction_id,
      v_now
    )
    returning id into v_invoice_id;
  end if;

  update license.entitlements
  set status = 'expired',
      updated_at = v_now
  where user_id = v_session.user_id
    and kind = 'personal'
    and status = 'active'
    and id not in (
      select id
      from license.entitlements
      where user_id = v_session.user_id
        and kind = 'personal'
        and status = 'active'
      order by created_at desc
      limit 1
    );

  update license.entitlements
  set status = 'active',
      source = 'payrexx',
      valid_from = v_period_start,
      valid_until = v_period_end,
      billing_subscription_id = v_subscription_id,
      updated_at = v_now
  where user_id = v_session.user_id
    and kind = 'personal'
    and status = 'active';

  if not found then
    insert into license.entitlements (
      user_id,
      kind,
      source,
      status,
      valid_from,
      valid_until,
      billing_subscription_id
    )
    values (
      v_session.user_id,
      'personal',
      'payrexx',
      'active',
      v_period_start,
      v_period_end,
      v_subscription_id
    );
  end if;

  update billing.checkout_sessions
  set status = 'completed',
      subscription_id = v_subscription_id,
      payrexx_gateway_id = coalesce(payrexx_gateway_id, p_payrexx_gateway_id),
      payrexx_transaction_id = coalesce(payrexx_transaction_id, p_payrexx_transaction_id),
      metadata = coalesce(metadata, '{}'::jsonb) || jsonb_build_object(
        'last_processed_at', v_now,
        'last_transaction_id', p_payrexx_transaction_id
      )
  where id = v_session.id;

  return v_subscription_id;
end;
$$;

create or replace function billing.fail_checkout_session(
  p_reference_id text,
  p_status text default 'failed',
  p_reason text default null
) returns void
language plpgsql
security definer
set search_path = billing
as $$
begin
  if p_status not in ('failed', 'cancelled', 'expired') then
    raise exception 'Invalid failure status: %', p_status;
  end if;

  update billing.checkout_sessions
  set status = p_status,
      metadata = coalesce(metadata, '{}'::jsonb) || jsonb_build_object(
        'failure_reason', coalesce(p_reason, 'unknown'),
        'failed_at', now()
      )
  where reference_id = p_reference_id
    and status <> 'completed';
end;
$$;

grant execute on function billing.process_payrexx_payment(text, text, bigint, jsonb) to service_role;
grant execute on function billing.fail_checkout_session(text, text, text) to service_role;

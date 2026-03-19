-- Fix personal entitlement "future start" gaps for early renewals.
-- Symptom: subscription is active/paid but entitlement.valid_from is in the future,
-- which incorrectly blocks app access checks.

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
  v_subscription billing.subscriptions%rowtype;
  v_invoice_id uuid;
  v_now timestamptz := now();
  v_period_start timestamptz;
  v_period_end timestamptz;
  v_entitlement_start timestamptz;
  v_entitlement_end timestamptz;
  v_candidate_kind text;
  v_created_subscription boolean := false;
  v_billing_cycle text;
  v_subscription_interval text;
  v_period_duration interval;
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

  select id
  into v_account_id
  from billing.accounts
  where user_id = v_session.user_id
    and organization_id is null
  order by created_at asc
  limit 1;

  if v_account_id is null then
    for v_candidate_kind in
      select unnest(array['individual', 'personal', 'user'])
    loop
      begin
        insert into billing.accounts (kind, user_id)
        values (v_candidate_kind, v_session.user_id)
        returning id into v_account_id;
        exit;
      exception
        when check_violation then
          continue;
      end;
    end loop;
  end if;

  if v_account_id is null then
    raise exception 'Could not create billing account for user %. None of [individual, personal, user] satisfied accounts_kind_check.', v_session.user_id;
  end if;

  if v_session.subscription_id is not null then
    select *
    into v_subscription
    from billing.subscriptions
    where id = v_session.subscription_id
    for update;
  end if;

  if v_subscription.id is null then
    select *
    into v_subscription
    from billing.subscriptions
    where account_id = v_account_id
      and provider = 'payrexx'
      and provider_subscription_id = coalesce(p_payrexx_gateway_id::text, p_reference_id)
    limit 1
    for update;
  end if;

  v_billing_cycle := coalesce(nullif(v_session.metadata ->> 'billing_cycle', ''), 'annual');
  if v_billing_cycle not in ('annual', 'daily_test') then
    v_billing_cycle := 'annual';
  end if;
  if v_billing_cycle = 'annual' and v_subscription.id is not null then
    v_billing_cycle := coalesce(nullif(v_subscription.metadata ->> 'billing_cycle', ''), v_billing_cycle);
    if v_billing_cycle not in ('annual', 'daily_test') then
      v_billing_cycle := 'annual';
    end if;
  end if;

  if v_billing_cycle = 'daily_test' then
    -- subscriptions.interval is constrained and may not allow 'day'.
    -- Keep semantic cycle in metadata and enforce daily period boundaries.
    v_subscription_interval := 'year';
    v_period_duration := interval '1 day';
  else
    v_subscription_interval := 'year';
    v_period_duration := interval '1 year';
  end if;

  if v_subscription.id is null then
    v_period_start := v_now;
    v_period_end := v_now + v_period_duration;
    v_created_subscription := true;

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
      v_subscription_interval,
      null,
      v_now,
      v_period_start,
      v_period_end,
      jsonb_build_object(
        'plan', 'annual',
        'billing_cycle', v_billing_cycle,
        'reference_id', p_reference_id,
        'checkout_session_id', v_session.id
      ) || coalesce(p_raw_payload, '{}'::jsonb)
    )
    returning * into v_subscription;
  end if;

  -- Idempotency for provider retries of the same transaction.
  select id
  into v_invoice_id
  from billing.invoices
  where provider_invoice_id = p_payrexx_transaction_id
  limit 1;

  if v_invoice_id is null then
    if not v_created_subscription then
      -- Recovery path for older daily_test subscriptions that were accidentally extended yearly.
      if v_billing_cycle = 'daily_test'
         and v_subscription.interval = 'year'
         and coalesce(v_subscription.current_period_end, v_now) > (v_now + interval '7 days') then
        v_period_start := v_now;
      else
        v_period_start := greatest(coalesce(v_subscription.current_period_end, v_now), v_now);
      end if;
      v_period_end := v_period_start + v_period_duration;

      update billing.subscriptions
      set status = 'active',
          amount_cents = v_session.amount_cents,
          currency = v_session.currency,
          interval = v_subscription_interval,
          current_period_start = v_period_start,
          current_period_end = v_period_end,
          metadata = coalesce(metadata, '{}'::jsonb) || jsonb_build_object(
            'billing_cycle', v_billing_cycle,
            'last_reference_id', p_reference_id,
            'last_transaction_id', p_payrexx_transaction_id,
            'last_processed_at', v_now
          ) || coalesce(p_raw_payload, '{}'::jsonb)
      where id = v_subscription.id
      returning * into v_subscription;
    else
      v_period_start := v_subscription.current_period_start;
      v_period_end := v_subscription.current_period_end;
    end if;

    insert into billing.invoices (
      subscription_id,
      amount_cents,
      currency,
      status,
      provider_invoice_id,
      paid_at
    )
    values (
      v_subscription.id,
      v_session.amount_cents,
      v_session.currency,
      'paid',
      p_payrexx_transaction_id,
      v_now
    )
    returning id into v_invoice_id;
  else
    v_period_start := coalesce(v_subscription.current_period_start, v_now);
    v_period_end := coalesce(v_subscription.current_period_end, v_period_start + v_period_duration);
  end if;

  -- Do not expose future valid_from windows to app checks.
  v_entitlement_start := least(v_period_start, v_now);
  v_entitlement_end := greatest(v_period_end, v_entitlement_start);

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
      valid_from = least(coalesce(valid_from, v_entitlement_start), v_entitlement_start),
      valid_until = greatest(coalesce(valid_until, v_entitlement_end), v_entitlement_end),
      billing_subscription_id = v_subscription.id,
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
      v_entitlement_start,
      v_entitlement_end,
      v_subscription.id
    );
  end if;

  update billing.checkout_sessions
  set status = 'completed',
      subscription_id = v_subscription.id,
      payrexx_gateway_id = coalesce(payrexx_gateway_id, p_payrexx_gateway_id),
      payrexx_transaction_id = coalesce(payrexx_transaction_id, p_payrexx_transaction_id),
      metadata = coalesce(metadata, '{}'::jsonb) || jsonb_build_object(
        'billing_cycle', v_billing_cycle,
        'last_processed_at', v_now,
        'last_transaction_id', p_payrexx_transaction_id
      )
  where id = v_session.id;

  return v_subscription.id;
end;
$$;

grant execute on function billing.process_payrexx_payment(text, text, bigint, jsonb) to service_role;

-- One-time repair for already affected users:
-- if an active personal entitlement starts in the future, clamp it to now.
update license.entitlements
set valid_from = now(),
    updated_at = now()
where kind = 'personal'
  and status = 'active'
  and valid_from > now()
  and coalesce(valid_until, now()) > now();

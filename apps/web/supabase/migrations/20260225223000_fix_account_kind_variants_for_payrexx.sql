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
  v_candidate_kind text;
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

-- Org checkout and org payment handlers must not insert license.entitlements (org_seat).
-- Seat rows are created later (e.g. billing.update_org_seat_plan with apply_immediately, or other flows).

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
  v_subscription billing.subscriptions%rowtype;
  v_checkout_id uuid;
  v_existing_checkout billing.checkout_sessions%rowtype;
  v_is_admin boolean;
  v_responsible_email text;
  v_assigned_count int := 0;
  v_keep_suspended boolean := false;
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

  select *
  into v_subscription
  from billing.subscriptions
  where account_id = v_account_id
    and provider = 'payrexx'
  order by created_at desc
  limit 1
  for update;

  if v_subscription.id is null then
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
      'active',
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
        'reference_id', p_reference_id,
        'org_billing_status', 'active_unpaid'
      ) || coalesce(p_metadata, '{}'::jsonb),
      14,
      null
    )
    returning * into v_subscription;
  else
    v_keep_suspended := coalesce(v_subscription.metadata ->> 'org_billing_status', '') = 'suspended'
      or (v_subscription.suspend_at is not null and v_subscription.suspend_at <= v_now);

    update billing.subscriptions s
    set status = 'active',
        amount_cents = p_amount_cents,
        currency = p_currency,
        interval = 'year',
        seat_count = p_quantity,
        provider_subscription_id = coalesce(
          s.provider_subscription_id,
          coalesce(p_payrexx_gateway_id::text, p_reference_id)
        ),
        metadata = coalesce(s.metadata, '{}'::jsonb) || jsonb_build_object(
          'plan', 'org',
          'organization_id', p_organization_id,
          'responsible_user_id', p_actor_user_id,
          'responsible_email', v_responsible_email,
          'reference_id', p_reference_id,
          'org_billing_status', case when v_keep_suspended then 'suspended' else 'active_unpaid' end,
          'last_checkout_created_at', v_now
        ) || coalesce(p_metadata, '{}'::jsonb),
        suspend_at = case when v_keep_suspended then s.suspend_at else null end
    where s.id = v_subscription.id
    returning * into v_subscription;
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
      v_subscription.id,
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
        subscription_id = v_subscription.id,
        metadata = coalesce(metadata, '{}'::jsonb) || coalesce(p_metadata, '{}'::jsonb),
        expires_at = coalesce(p_expires_at, expires_at)
    where id = v_existing_checkout.id
    returning id into v_checkout_id;
  end if;

  update billing.invoices
  set status = 'void'
  where subscription_id = v_subscription.id
    and status in ('open', 'draft', 'failed');

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
    v_subscription.id,
    p_amount_cents,
    p_currency,
    'open',
    null,
    v_due_date,
    null,
    v_now,
    v_checkout_id
  );

  select count(*)::int
  into v_assigned_count
  from license.entitlements e
  where e.billing_subscription_id = v_subscription.id
    and e.kind = 'org_seat'
    and e.status = 'active'
    and e.user_id is not null;

  if v_assigned_count > p_quantity then
    raise exception 'Cannot reduce seats below already assigned members (% assigned, % requested)',
      v_assigned_count, p_quantity;
  end if;

  return v_subscription.id;
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
  v_has_paid_invoice boolean := false;
  v_seat_count int;
  v_assigned_count int := 0;
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

  select exists (
    select 1
    from billing.invoices i
    where i.subscription_id = v_session.subscription_id
      and i.status = 'paid'
      and i.paid_at is not null
      and coalesce(i.provider_invoice_id, '') <> coalesce(p_payrexx_transaction_id, '')
  )
  into v_has_paid_invoice;

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

  if v_has_paid_invoice then
    v_period_start := case
      when v_subscription.current_period_end is not null and v_subscription.current_period_end > v_now
        then v_subscription.current_period_end
      else v_now
    end;
    v_period_end := v_period_start + interval '1 year';
  else
    v_period_start := coalesce(v_subscription.current_period_start, v_now);
    v_period_end := coalesce(v_subscription.current_period_end, v_period_start + interval '1 year');
    if v_period_end <= v_period_start then
      v_period_end := v_period_start + interval '1 year';
    end if;
  end if;

  update billing.subscriptions
  set status = 'active',
      current_period_start = v_period_start,
      current_period_end = v_period_end,
      provider_subscription_id = coalesce(provider_subscription_id, coalesce(p_payrexx_gateway_id::text, p_reference_id)),
      suspend_at = null,
      metadata = coalesce(metadata, '{}'::jsonb) || jsonb_build_object(
        'last_reference_id', p_reference_id,
        'last_transaction_id', p_payrexx_transaction_id,
        'last_paid_at', v_now,
        'org_billing_status', 'active_paid'
      ) || coalesce(p_raw_payload, '{}'::jsonb)
  where id = v_session.subscription_id;

  select s.seat_count
  into v_seat_count
  from billing.subscriptions s
  where s.id = v_session.subscription_id;

  if coalesce(v_seat_count, 0) < 3 then
    raise exception 'Invalid organization seat count on subscription';
  end if;

  select count(*)::int
  into v_assigned_count
  from license.entitlements e
  where e.billing_subscription_id = v_session.subscription_id
    and e.kind = 'org_seat'
    and e.status = 'active'
    and e.user_id is not null;

  if v_assigned_count > v_seat_count then
    raise exception 'Cannot reduce seats below already assigned members (% assigned, % on subscription)',
      v_assigned_count, v_seat_count;
  end if;

  -- Reactivate org_seat rows after sweep (subscription_canceled) or delinquency (payment_failed).
  update license.entitlements
  set status = 'active',
      revocation_reason = null,
      source = 'payrexx',
      updated_at = v_now
  where billing_subscription_id = v_session.subscription_id
    and kind = 'org_seat'
    and (
      (
        status = 'expired'
        and revocation_reason = 'subscription_canceled'::license.entitlement_revocation_reason
      )
      or (
        status = 'revoked'
        and revocation_reason = 'payment_failed'::license.entitlement_revocation_reason
      )
    );

  update license.entitlements
  set revocation_reason = null,
      source = 'payrexx',
      updated_at = v_now
  where billing_subscription_id = v_session.subscription_id
    and kind = 'org_seat'
    and status = 'active';

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

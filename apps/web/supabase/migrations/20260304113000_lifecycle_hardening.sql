-- Lifecycle hardening:
-- 1) Personal renewals must extend periods even when original checkout is already completed.
-- 2) Org checkout creation must not clear suspended state before payment.
-- 3) Finalize org cancellations at period end (disable access).
-- 4) Reminder scheduling should catch up missed daily runs.

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
  v_candidate_kind text;
  v_created_subscription boolean := false;
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

  if v_subscription.id is null then
    v_period_start := v_now;
    v_period_end := v_now + interval '1 year';
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
      v_period_start := greatest(coalesce(v_subscription.current_period_end, v_now), v_now);
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
    v_period_end := coalesce(v_subscription.current_period_end, v_period_start + interval '1 year');
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
      v_period_start,
      v_period_end,
      v_subscription.id
    );
  end if;

  update billing.checkout_sessions
  set status = 'completed',
      subscription_id = v_subscription.id,
      payrexx_gateway_id = coalesce(payrexx_gateway_id, p_payrexx_gateway_id),
      payrexx_transaction_id = coalesce(payrexx_transaction_id, p_payrexx_transaction_id),
      metadata = coalesce(metadata, '{}'::jsonb) || jsonb_build_object(
        'last_processed_at', v_now,
        'last_transaction_id', p_payrexx_transaction_id
      )
  where id = v_session.id;

  return v_subscription.id;
end;
$$;

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
  v_unassigned_count int := 0;
  v_target_unassigned int := 0;
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

  -- Close stale unpaid invoices so delinquency sweep evaluates the current one.
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

  select count(*)::int
  into v_unassigned_count
  from license.entitlements e
  where e.billing_subscription_id = v_subscription.id
    and e.kind = 'org_seat'
    and e.status = 'active'
    and e.user_id is null;

  v_target_unassigned := greatest(p_quantity - v_assigned_count, 0);

  if v_unassigned_count < v_target_unassigned then
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
      v_subscription.id
    from generate_series(1, v_target_unassigned - v_unassigned_count);
  elsif v_unassigned_count > v_target_unassigned then
    with to_expire as (
      select e.id
      from license.entitlements e
      where e.billing_subscription_id = v_subscription.id
        and e.kind = 'org_seat'
        and e.status = 'active'
        and e.user_id is null
      order by e.created_at desc, e.id desc
      limit (v_unassigned_count - v_target_unassigned)
    )
    update license.entitlements e
    set status = 'expired',
        revocation_reason = null,
        updated_at = v_now
    where e.id in (select id from to_expire);
  end if;

  return v_subscription.id;
end;
$$;

create or replace function billing.run_org_cancellation_finalization_sweep(
  p_reference_time timestamptz default now()
) returns jsonb
language plpgsql
security definer
set search_path = billing, license
as $$
declare
  v_finalized_subscriptions int := 0;
  v_expired_entitlements int := 0;
begin
  with candidate_subscriptions as (
    select s.id
    from billing.subscriptions s
    where s.provider = 'payrexx'
      and coalesce(s.metadata ->> 'plan', '') = 'org'
      and s.status = 'active'
      and s.cancel_at_period_end = true
      and s.current_period_end is not null
      and s.current_period_end <= p_reference_time
      and coalesce(s.metadata ->> 'org_billing_status', '') <> 'suspended'
  )
  update billing.subscriptions s
  set suspend_at = p_reference_time,
      metadata = coalesce(s.metadata, '{}'::jsonb) || jsonb_build_object(
        'last_suspended_at', p_reference_time,
        'suspend_reason', 'canceled_at_period_end',
        'org_billing_status', 'suspended'
      )
  from candidate_subscriptions cs
  where s.id = cs.id;

  get diagnostics v_finalized_subscriptions = row_count;

  update license.entitlements e
  set status = 'expired',
      revocation_reason = 'subscription_canceled',
      updated_at = p_reference_time
  where e.billing_subscription_id in (
    select s.id
    from billing.subscriptions s
    where s.provider = 'payrexx'
      and coalesce(s.metadata ->> 'plan', '') = 'org'
      and coalesce(s.metadata ->> 'org_billing_status', '') = 'suspended'
      and coalesce(s.metadata ->> 'suspend_reason', '') = 'canceled_at_period_end'
  )
    and e.kind = 'org_seat'
    and e.status = 'active';

  get diagnostics v_expired_entitlements = row_count;

  return jsonb_build_object(
    'finalized_subscriptions', v_finalized_subscriptions,
    'expired_entitlements', v_expired_entitlements
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

grant execute on function billing.run_org_cancellation_finalization_sweep(timestamptz) to service_role;
grant execute on function billing.run_org_renewal_reminder_sweep(timestamptz) to service_role;

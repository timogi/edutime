-- After run_org_cancellation_finalization_sweep (and similar), org_seat rows are expired with
-- revocation_reason = null (required for status expired). process_payrexx_org_payment only
-- reactivated expired rows with revocation_reason = subscription_canceled, so paying again left
-- entitlements expired while members still showed as assigned. Restore:
-- - expired + null: assigned seats (user_id set) always; unassigned pool only if billing was suspended
-- - keep legacy expired + subscription_canceled
-- - revoked + payment_failed unchanged

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
  v_was_billing_suspended boolean := false;
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

  v_was_billing_suspended :=
    coalesce(v_subscription.metadata ->> 'org_billing_status', '') = 'suspended';

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

  if v_has_paid_invoice
     and coalesce(v_session.metadata ->> 'source', '') = 'org_management_seat_adjustment' then
    v_period_start := coalesce(v_subscription.current_period_start, v_now);
    v_period_end := coalesce(v_subscription.current_period_end, v_period_start + interval '1 year');
    if v_period_end <= v_period_start then
      v_period_end := v_period_start + interval '1 year';
    end if;
  elsif v_has_paid_invoice then
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
        status = 'expired'
        and revocation_reason is null
        and (
          user_id is not null
          or v_was_billing_suspended
        )
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

create or replace function billing.reactivate_org_subscription(
  p_actor_user_id uuid,
  p_organization_id int
) returns uuid
language plpgsql
security definer
set search_path = billing, public, auth, license
as $$
declare
  v_is_admin boolean;
  v_subscription billing.subscriptions%rowtype;
  v_now timestamptz := now();
  v_should_resume_billing boolean;
  v_has_paid_invoice boolean;
  v_org_billing_status text;
  v_new_metadata jsonb;
begin
  if p_actor_user_id is null then
    raise exception 'Missing actor user id';
  end if;
  if p_organization_id is null then
    raise exception 'Missing organization id';
  end if;

  select exists(
    select 1
    from public.organization_administrators oa
    where oa.organization_id = p_organization_id
      and oa.user_id = p_actor_user_id
  ) into v_is_admin;

  if not coalesce(v_is_admin, false) then
    raise exception 'Not authorized to manage organization %', p_organization_id;
  end if;

  select s.*
  into v_subscription
  from billing.accounts a
  join billing.subscriptions s on s.account_id = a.id
  where a.kind = 'organization'
    and a.organization_id = p_organization_id
    and s.provider = 'payrexx'
  order by s.created_at desc
  limit 1
  for update;

  if not found then
    raise exception 'No organization subscription found';
  end if;

  if v_subscription.current_period_end is not null and v_subscription.current_period_end < v_now then
    raise exception 'Subscription period already ended, new checkout required';
  end if;

  v_should_resume_billing :=
    coalesce(v_subscription.metadata ->> 'suspend_reason', '') = 'canceled_at_period_end'
    or exists (
      select 1
      from license.entitlements e
      where e.billing_subscription_id = v_subscription.id
        and e.kind = 'org_seat'
        and e.status = 'expired'
        and e.revocation_reason = 'subscription_canceled'::license.entitlement_revocation_reason
    )
    or (
      coalesce(v_subscription.metadata ->> 'org_billing_status', '') = 'suspended'
      and exists (
        select 1
        from license.entitlements e
        where e.billing_subscription_id = v_subscription.id
          and e.kind = 'org_seat'
          and e.status = 'expired'
          and e.revocation_reason is null
      )
    );

  select exists(
    select 1
    from billing.invoices i
    where i.subscription_id = v_subscription.id
      and i.status = 'paid'
  ) into v_has_paid_invoice;

  v_org_billing_status := case when v_has_paid_invoice then 'active_paid' else 'active_unpaid' end;

  v_new_metadata :=
    coalesce(v_subscription.metadata, '{}'::jsonb)
    || jsonb_build_object(
      'org_reactivated_at', v_now,
      'org_reactivated_by', p_actor_user_id
    );

  if v_should_resume_billing then
    v_new_metadata := (v_new_metadata || jsonb_build_object('org_billing_status', v_org_billing_status)) - 'suspend_reason';
  end if;

  update billing.subscriptions s
  set cancel_at_period_end = false,
      canceled_at = null,
      suspend_at = case when v_should_resume_billing then null else s.suspend_at end,
      metadata = v_new_metadata
  where s.id = v_subscription.id;

  update license.entitlements e
  set status = 'active',
      revocation_reason = null,
      updated_at = v_now
  where e.billing_subscription_id = v_subscription.id
    and e.kind = 'org_seat'
    and e.status = 'expired'
    and (
      e.revocation_reason = 'subscription_canceled'::license.entitlement_revocation_reason
      or (
        e.revocation_reason is null
        and coalesce(v_subscription.metadata ->> 'org_billing_status', '') = 'suspended'
      )
    );

  return v_subscription.id;
end;
$$;

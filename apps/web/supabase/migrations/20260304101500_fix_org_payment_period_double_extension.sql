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
    -- First successful payment for this subscription: keep the period that
    -- create_org_checkout already staged, instead of extending it again.
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

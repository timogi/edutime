-- After run_org_cancellation_finalization_sweep, org_seat rows are expired with
-- revocation_reason = subscription_canceled. Reactivating the subscription via
-- billing.reactivate_org_subscription must restore those entitlements and clear
-- suspend metadata from the sweep (otherwise get_org_billing_status stays suspended
-- and license checks fail).

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
    and e.revocation_reason = 'subscription_canceled'::license.entitlement_revocation_reason;

  return v_subscription.id;
end;
$$;

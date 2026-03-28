-- Repair deployments where 20260327150000 nested a data-modifying CTE inside a subquery
-- (PostgreSQL: "WITH clause containing a data-modifying statement must be at the top level").

create or replace function billing.run_org_cancellation_finalization_sweep(
  p_reference_time timestamptz default now()
) returns jsonb
language plpgsql
security definer
set search_path = billing, license, public
as $$
declare
  v_finalized_subscriptions int := 0;
  v_expired_entitlements int := 0;
  v_canceled_period_end_org_ids jsonb := '[]'::jsonb;
begin
  with candidate_subscriptions as (
    select distinct
      s.id,
      case
        when coalesce(o.is_active, true) = false then 'organization_deactivated'
        else 'canceled_at_period_end'
      end as suspend_reason,
      a.organization_id
    from billing.subscriptions s
    join billing.accounts a on a.id = s.account_id
    left join public.organizations o on o.id = a.organization_id
    where s.provider = 'payrexx'
      and coalesce(s.metadata ->> 'plan', '') = 'org'
      and s.status = 'active'
      and coalesce(s.metadata ->> 'org_billing_status', '') <> 'suspended'
      and (
        (
          s.cancel_at_period_end = true
          and s.current_period_end is not null
          and s.current_period_end <= p_reference_time
        )
        or coalesce(o.is_active, true) = false
      )
  ),
  sub_update as (
    update billing.subscriptions s
    set suspend_at = p_reference_time,
        cancel_at_period_end = true,
        canceled_at = coalesce(s.canceled_at, p_reference_time),
        metadata = coalesce(s.metadata, '{}'::jsonb) || jsonb_build_object(
          'last_suspended_at', p_reference_time,
          'suspend_reason', cs.suspend_reason,
          'org_billing_status', 'suspended'
        )
    from candidate_subscriptions cs
    where s.id = cs.id
    returning cs.organization_id, cs.suspend_reason
  )
  select
    (select count(*)::int from sub_update),
    coalesce(
      (
        select jsonb_agg(sub.org_id order by sub.org_id)
        from (
          select distinct su.organization_id as org_id
          from sub_update su
          where su.suspend_reason = 'canceled_at_period_end'
            and su.organization_id is not null
        ) sub
      ),
      '[]'::jsonb
    )
  into v_finalized_subscriptions, v_canceled_period_end_org_ids;

  update license.entitlements e
  set status = 'expired',
      revocation_reason = null,
      updated_at = p_reference_time
  from billing.subscriptions s
  where e.billing_subscription_id = s.id
    and s.provider = 'payrexx'
    and coalesce(s.metadata ->> 'plan', '') = 'org'
    and coalesce(s.metadata ->> 'org_billing_status', '') = 'suspended'
    and coalesce(s.metadata ->> 'suspend_reason', '') in ('canceled_at_period_end', 'organization_deactivated')
    and e.kind = 'org_seat'
    and e.status = 'active';

  get diagnostics v_expired_entitlements = row_count;

  return jsonb_build_object(
    'finalized_subscriptions', v_finalized_subscriptions,
    'expired_entitlements', v_expired_entitlements,
    'canceled_at_period_end_organization_ids', v_canceled_period_end_org_ids
  );
end;
$$;

grant execute on function billing.run_org_cancellation_finalization_sweep(timestamptz) to service_role;

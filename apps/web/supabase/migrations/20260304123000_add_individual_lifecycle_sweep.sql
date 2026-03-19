-- Individual lifecycle sweep:
-- - expire overdue trial entitlements
-- - expire overdue personal entitlements
-- - close overdue personal subscriptions when no renewal succeeded

create or replace function billing.run_individual_lifecycle_sweep(
  p_reference_time timestamptz default now()
) returns jsonb
language plpgsql
security definer
set search_path = billing, license, public
as $$
declare
  v_expired_trials int := 0;
  v_expired_personal_entitlements int := 0;
  v_closed_personal_subscriptions int := 0;
begin
  update license.entitlements e
  set status = 'expired',
      updated_at = p_reference_time
  where e.kind = 'trial'
    and e.status = 'active'
    and e.valid_until is not null
    and e.valid_until <= p_reference_time;

  get diagnostics v_expired_trials = row_count;

  update license.entitlements e
  set status = 'expired',
      updated_at = p_reference_time
  where e.kind = 'personal'
    and e.status = 'active'
    and e.valid_until is not null
    and e.valid_until <= p_reference_time;

  get diagnostics v_expired_personal_entitlements = row_count;

  with candidate_subscriptions as (
    select s.id
    from billing.subscriptions s
    join billing.accounts a on a.id = s.account_id
    where s.provider = 'payrexx'
      and s.status = 'active'
      and a.organization_id is null
      and s.current_period_end is not null
      and s.current_period_end <= p_reference_time
  )
  update billing.subscriptions s
  set status = 'canceled',
      metadata = coalesce(s.metadata, '{}'::jsonb) || jsonb_build_object(
        'lifecycle_closed_at', p_reference_time,
        'lifecycle_close_reason', case
          when coalesce(s.cancel_at_period_end, false) then 'canceled_at_period_end'
          else 'period_elapsed_no_renewal'
        end
      )
  from candidate_subscriptions cs
  where s.id = cs.id;

  get diagnostics v_closed_personal_subscriptions = row_count;

  return jsonb_build_object(
    'expired_trials', v_expired_trials,
    'expired_personal_entitlements', v_expired_personal_entitlements,
    'closed_personal_subscriptions', v_closed_personal_subscriptions
  );
end;
$$;

grant execute on function billing.run_individual_lifecycle_sweep(timestamptz) to service_role;

create or replace function billing.update_org_seat_plan(
  p_actor_user_id uuid,
  p_organization_id int,
  p_target_seat_count int,
  p_apply_immediately boolean default false,
  p_next_annual_amount_cents int default null,
  p_metadata jsonb default '{}'::jsonb
) returns uuid
language plpgsql
security definer
set search_path = billing, license, public, auth
as $$
declare
  v_is_admin boolean;
  v_subscription billing.subscriptions%rowtype;
  v_now timestamptz := now();
  v_assigned_count int := 0;
  v_unassigned_count int := 0;
  v_target_unassigned int := 0;
  v_effective_amount_cents int;
begin
  if p_actor_user_id is null then
    raise exception 'Missing actor user id';
  end if;
  if p_organization_id is null then
    raise exception 'Missing organization id';
  end if;
  if p_target_seat_count is null or p_target_seat_count < 3 then
    raise exception 'Organization licenses require at least 3 seats';
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

  v_effective_amount_cents := coalesce(p_next_annual_amount_cents, v_subscription.amount_cents);

  if p_apply_immediately then
    select count(*)::int
    into v_assigned_count
    from license.entitlements e
    where e.billing_subscription_id = v_subscription.id
      and e.kind = 'org_seat'
      and e.status = 'active'
      and e.user_id is not null;

    if v_assigned_count > p_target_seat_count then
      raise exception 'Cannot reduce seats below already assigned members (% assigned, % requested)',
        v_assigned_count, p_target_seat_count;
    end if;

    update billing.subscriptions s
    set seat_count = p_target_seat_count,
        amount_cents = v_effective_amount_cents,
        metadata = coalesce(s.metadata, '{}'::jsonb) || jsonb_build_object(
          'next_period_seat_count', p_target_seat_count,
          'seat_plan_updated_at', v_now,
          'seat_plan_updated_by', p_actor_user_id
        ) || coalesce(p_metadata, '{}'::jsonb)
    where s.id = v_subscription.id;

    select count(*)::int
    into v_unassigned_count
    from license.entitlements e
    where e.billing_subscription_id = v_subscription.id
      and e.kind = 'org_seat'
      and e.status = 'active'
      and e.user_id is null;

    v_target_unassigned := greatest(p_target_seat_count - v_assigned_count, 0);

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
  else
    update billing.subscriptions s
    set amount_cents = v_effective_amount_cents,
        metadata = coalesce(s.metadata, '{}'::jsonb) || jsonb_build_object(
          'next_period_seat_count', p_target_seat_count,
          'seat_plan_updated_at', v_now,
          'seat_plan_updated_by', p_actor_user_id
        ) || coalesce(p_metadata, '{}'::jsonb)
    where s.id = v_subscription.id;
  end if;

  return v_subscription.id;
end;
$$;

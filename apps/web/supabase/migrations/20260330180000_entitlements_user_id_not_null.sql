-- Enforce always-assigned entitlements:
-- - license.entitlements.user_id must never be null
-- - org-seat allocation uses direct assignment on accept/ensure
-- - seat release expires entitlement rows instead of nulling user_id

do $$
begin
  if exists (
    select 1
    from license.entitlements e
    where e.user_id is null
  ) then
    raise exception
      'Migration blocked: license.entitlements contains rows with user_id IS NULL. Clean data before enforcing NOT NULL.';
  end if;
end;
$$;

alter table license.entitlements
  alter column user_id set not null;

create or replace function billing.ensure_org_actor_entitlement(
  p_actor_user_id uuid,
  p_organization_id int
) returns uuid
language plpgsql
security definer
set search_path = billing, license, public, auth
as $$
declare
  v_now timestamptz := now();
  v_is_admin boolean;
  v_actor_email text;
  v_membership_id int;
  v_subscription billing.subscriptions%rowtype;
  v_entitlement_id uuid;
  v_active_total int := 0;
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
    raise exception 'Not authorized for organization %', p_organization_id;
  end if;

  select lower(u.email)
  into v_actor_email
  from auth.users u
  where u.id = p_actor_user_id;

  if v_actor_email is null then
    raise exception 'User email not available';
  end if;

  select om.id
  into v_membership_id
  from public.organization_members om
  where om.organization_id = p_organization_id
    and lower(om.user_email) = v_actor_email
  order by om.created_at asc
  limit 1
  for update;

  if v_membership_id is null then
    insert into public.organization_members (
      organization_id,
      user_email,
      status,
      user_id
    ) values (
      p_organization_id,
      v_actor_email,
      'active',
      p_actor_user_id
    )
    returning id into v_membership_id;
  else
    update public.organization_members
    set status = 'active',
        user_id = p_actor_user_id
    where id = v_membership_id;
  end if;

  select e.id
  into v_entitlement_id
  from license.entitlements e
  where e.organization_id = p_organization_id
    and e.kind = 'org_seat'
    and e.status = 'active'
    and e.user_id = p_actor_user_id
  order by e.created_at asc
  limit 1;

  if v_entitlement_id is not null then
    return v_entitlement_id;
  end if;

  select s.*
  into v_subscription
  from billing.accounts a
  join billing.subscriptions s on s.account_id = a.id
  where a.kind = 'organization'
    and a.organization_id = p_organization_id
    and s.provider = 'payrexx'
    and s.status = 'active'
    and coalesce(s.metadata ->> 'plan', '') = 'org'
    and coalesce(s.metadata ->> 'org_billing_status', '') <> 'suspended'
  order by s.created_at desc
  limit 1
  for update;

  if v_subscription.id is null then
    raise exception 'No active organization subscription found';
  end if;

  select count(*)::int
  into v_active_total
  from license.entitlements e
  where e.billing_subscription_id = v_subscription.id
    and e.kind = 'org_seat'
    and e.status = 'active';

  if v_active_total >= coalesce(v_subscription.seat_count, 0) then
    raise exception 'No available organization seats';
  end if;

  insert into license.entitlements (
    user_id,
    organization_id,
    kind,
    source,
    status,
    valid_from,
    valid_until,
    billing_subscription_id,
    revocation_reason
  ) values (
    p_actor_user_id,
    p_organization_id,
    'org_seat',
    'payrexx',
    'active',
    v_now,
    null,
    v_subscription.id,
    null
  )
  returning id into v_entitlement_id;

  return v_entitlement_id;
end;
$$;

create or replace function billing.accept_org_member_invite(
  p_actor_user_id uuid,
  p_organization_id int
) returns uuid
language plpgsql
security definer
set search_path = billing, license, public, auth
as $$
declare
  v_now timestamptz := now();
  v_actor_email text;
  v_invite license.org_invites%rowtype;
  v_membership_id int;
  v_subscription billing.subscriptions%rowtype;
  v_entitlement_id uuid;
  v_active_total int := 0;
begin
  if p_actor_user_id is null then
    raise exception 'Missing actor user id';
  end if;
  if p_organization_id is null then
    raise exception 'Missing organization id';
  end if;

  select lower(u.email)
  into v_actor_email
  from auth.users u
  where u.id = p_actor_user_id;

  if v_actor_email is null then
    raise exception 'User email not available';
  end if;

  select *
  into v_invite
  from license.org_invites oi
  where oi.organization_id = p_organization_id
    and lower(oi.email) = v_actor_email
    and oi.status = 'pending'
  order by oi.created_at desc
  limit 1
  for update;

  if not found then
    raise exception 'No pending invite found for this organization';
  end if;

  if v_invite.expires_at is not null and v_invite.expires_at < v_now then
    update license.org_invites
    set status = 'expired'
    where id = v_invite.id;
    raise exception 'Invite has expired';
  end if;

  select om.id
  into v_membership_id
  from public.organization_members om
  where om.organization_id = p_organization_id
    and lower(om.user_email) = v_actor_email
  order by om.created_at asc
  limit 1
  for update;

  if v_membership_id is null then
    insert into public.organization_members (
      organization_id,
      user_email,
      status,
      user_id
    ) values (
      p_organization_id,
      v_actor_email,
      'active',
      p_actor_user_id
    )
    returning id into v_membership_id;
  else
    update public.organization_members om
    set status = 'active',
        user_id = p_actor_user_id
    where om.id = v_membership_id;
  end if;

  select e.id
  into v_entitlement_id
  from license.entitlements e
  where e.organization_id = p_organization_id
    and e.kind = 'org_seat'
    and e.status = 'active'
    and e.user_id = p_actor_user_id
  order by e.created_at asc
  limit 1;

  if v_entitlement_id is null then
    select s.*
    into v_subscription
    from billing.accounts a
    join billing.subscriptions s on s.account_id = a.id
    where a.kind = 'organization'
      and a.organization_id = p_organization_id
      and s.provider = 'payrexx'
      and s.status = 'active'
      and coalesce(s.metadata ->> 'plan', '') = 'org'
      and coalesce(s.metadata ->> 'org_billing_status', '') <> 'suspended'
    order by s.created_at desc
    limit 1
    for update;

    if v_subscription.id is null then
      raise exception 'No active organization subscription found';
    end if;

    select count(*)::int
    into v_active_total
    from license.entitlements e
    where e.billing_subscription_id = v_subscription.id
      and e.kind = 'org_seat'
      and e.status = 'active';

    if v_active_total >= coalesce(v_subscription.seat_count, 0) then
      raise exception 'No available organization seats';
    end if;

    insert into license.entitlements (
      user_id,
      organization_id,
      kind,
      source,
      status,
      valid_from,
      valid_until,
      billing_subscription_id,
      revocation_reason
    ) values (
      p_actor_user_id,
      p_organization_id,
      'org_seat',
      'payrexx',
      'active',
      v_now,
      null,
      v_subscription.id,
      null
    )
    returning id into v_entitlement_id;
  end if;

  update license.org_invites oi
  set status = 'accepted',
      accepted_at = v_now
  where oi.id = v_invite.id;

  return v_entitlement_id;
end;
$$;

create or replace function billing.release_org_member_seat(
  p_actor_user_id uuid,
  p_organization_id int,
  p_membership_id int
) returns uuid
language plpgsql
security definer
set search_path = billing, license, public, auth
as $$
declare
  v_is_admin boolean;
  v_now timestamptz := now();
  v_member public.organization_members%rowtype;
  v_released_entitlement_id uuid;
begin
  if p_actor_user_id is null then
    raise exception 'Missing actor user id';
  end if;
  if p_organization_id is null then
    raise exception 'Missing organization id';
  end if;
  if p_membership_id is null then
    raise exception 'Missing membership id';
  end if;

  select exists(
    select 1
    from public.organization_administrators oa
    where oa.organization_id = p_organization_id
      and oa.user_id = p_actor_user_id
  ) into v_is_admin;

  if not coalesce(v_is_admin, false) then
    raise exception 'Not authorized to release seats for organization %', p_organization_id;
  end if;

  select *
  into v_member
  from public.organization_members om
  where om.id = p_membership_id
    and om.organization_id = p_organization_id
  for update;

  if not found then
    raise exception 'Organization member not found';
  end if;

  if v_member.user_id is not null then
    select e.id
    into v_released_entitlement_id
    from license.entitlements e
    where e.organization_id = p_organization_id
      and e.kind = 'org_seat'
      and e.status = 'active'
      and e.user_id = v_member.user_id
    order by e.created_at desc
    limit 1
    for update skip locked;

    if v_released_entitlement_id is not null then
      update license.entitlements
      set status = 'expired',
          valid_until = v_now,
          updated_at = v_now,
          revocation_reason = 'other'::license.entitlement_revocation_reason
      where id = v_released_entitlement_id;
    end if;
  end if;

  update public.organization_members
  set status = 'canceled',
      user_id = null
  where id = v_member.id;

  update license.org_invites
  set status = 'canceled'
  where organization_id = p_organization_id
    and lower(email) = lower(v_member.user_email)
    and status = 'pending';

  return v_released_entitlement_id;
end;
$$;

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
      and e.status = 'active';

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

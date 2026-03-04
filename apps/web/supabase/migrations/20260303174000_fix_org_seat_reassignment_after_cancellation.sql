-- Ensure org seats remain reusable after member cancellations.
-- Repairs seat drift and hardens invite acceptance/allocation.

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
  v_missing_count int := 0;
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

  v_missing_count := greatest(coalesce(v_subscription.seat_count, 0) - v_active_total, 0);
  if v_missing_count > 0 then
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
    from generate_series(1, v_missing_count);
  end if;

  select e.id
  into v_entitlement_id
  from license.entitlements e
  where e.billing_subscription_id = v_subscription.id
    and e.kind = 'org_seat'
    and e.status = 'active'
    and e.user_id is null
  order by e.created_at asc
  limit 1
  for update skip locked;

  if v_entitlement_id is null then
    raise exception 'No available organization seats';
  end if;

  update license.entitlements e
  set user_id = p_actor_user_id,
      updated_at = v_now,
      revocation_reason = null
  where e.id = v_entitlement_id;

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
  v_missing_count int := 0;
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

    v_missing_count := greatest(coalesce(v_subscription.seat_count, 0) - v_active_total, 0);
    if v_missing_count > 0 then
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
      from generate_series(1, v_missing_count);
    end if;

    select e.id
    into v_entitlement_id
    from license.entitlements e
    where e.billing_subscription_id = v_subscription.id
      and e.kind = 'org_seat'
      and e.status = 'active'
      and e.user_id is null
    order by e.created_at asc
    limit 1
    for update skip locked;

    if v_entitlement_id is null then
      raise exception 'No available organization seats';
    end if;

    update license.entitlements e
    set user_id = p_actor_user_id,
        updated_at = v_now,
        revocation_reason = null
    where e.id = v_entitlement_id;
  end if;

  update license.org_invites oi
  set status = 'accepted',
      accepted_at = v_now
  where oi.id = v_invite.id;

  return v_entitlement_id;
end;
$$;

-- One-time repair for existing subscriptions with missing active seat entitlements.
with org_subscriptions as (
  select
    s.id as subscription_id,
    a.organization_id,
    greatest(coalesce(s.seat_count, 0), 0) as seat_count
  from billing.accounts a
  join billing.subscriptions s on s.account_id = a.id
  where a.kind = 'organization'
    and s.provider = 'payrexx'
    and s.status = 'active'
    and coalesce(s.metadata ->> 'plan', '') = 'org'
),
active_seat_counts as (
  select
    e.billing_subscription_id as subscription_id,
    count(*)::int as active_count
  from license.entitlements e
  where e.kind = 'org_seat'
    and e.status = 'active'
  group by e.billing_subscription_id
),
missing as (
  select
    os.subscription_id,
    os.organization_id,
    greatest(os.seat_count - coalesce(ascs.active_count, 0), 0) as missing_count
  from org_subscriptions os
  left join active_seat_counts ascs on ascs.subscription_id = os.subscription_id
)
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
  m.organization_id,
  'org_seat',
  'payrexx',
  'active',
  now(),
  null,
  m.subscription_id
from missing m
join generate_series(1, m.missing_count) g(n) on true
where m.missing_count > 0;

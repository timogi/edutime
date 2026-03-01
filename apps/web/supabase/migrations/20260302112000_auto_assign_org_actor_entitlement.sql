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
  v_subscription_id uuid;
  v_entitlement_id uuid;
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

  select s.id
  into v_subscription_id
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

  if v_subscription_id is null then
    raise exception 'No active organization subscription found';
  end if;

  select e.id
  into v_entitlement_id
  from license.entitlements e
  where e.billing_subscription_id = v_subscription_id
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

create or replace function billing.create_org_member_invite(
  p_actor_user_id uuid,
  p_organization_id int,
  p_email text,
  p_comment text default null,
  p_role text default 'member',
  p_expires_at timestamptz default (now() + interval '30 days')
) returns uuid
language plpgsql
security definer
set search_path = billing, license, public, auth
as $$
declare
  v_now timestamptz := now();
  v_normalized_email text;
  v_actor_email text;
  v_is_admin boolean;
  v_user_id uuid;
  v_existing_membership_id int;
  v_invite_id uuid;
begin
  if p_actor_user_id is null then
    raise exception 'Missing actor user id';
  end if;
  if p_organization_id is null then
    raise exception 'Missing organization id';
  end if;

  v_normalized_email := lower(trim(coalesce(p_email, '')));
  if v_normalized_email = '' then
    raise exception 'Missing invite email';
  end if;
  if position('@' in v_normalized_email) = 0 then
    raise exception 'Invalid invite email';
  end if;

  select lower(u.email)
  into v_actor_email
  from auth.users u
  where u.id = p_actor_user_id;

  select exists(
    select 1
    from public.organization_administrators oa
    where oa.organization_id = p_organization_id
      and oa.user_id = p_actor_user_id
  ) into v_is_admin;

  if not coalesce(v_is_admin, false) then
    raise exception 'Not authorized to invite members for organization %', p_organization_id;
  end if;

  select u.id
  into v_user_id
  from auth.users u
  where lower(u.email) = v_normalized_email
  order by u.created_at asc
  limit 1;

  update license.org_invites oi
  set status = 'canceled'
  where oi.organization_id = p_organization_id
    and lower(oi.email) = v_normalized_email
    and oi.status = 'pending';

  insert into license.org_invites (
    organization_id,
    email,
    role,
    token,
    status,
    expires_at
  ) values (
    p_organization_id,
    v_normalized_email,
    coalesce(nullif(trim(p_role), ''), 'member'),
    md5(
      random()::text ||
      clock_timestamp()::text ||
      p_organization_id::text ||
      v_normalized_email
    ),
    'pending',
    p_expires_at
  )
  returning id into v_invite_id;

  select om.id
  into v_existing_membership_id
  from public.organization_members om
  where om.organization_id = p_organization_id
    and lower(om.user_email) = v_normalized_email
  order by om.created_at asc
  limit 1;

  if v_existing_membership_id is null then
    insert into public.organization_members (
      organization_id,
      user_email,
      status,
      user_id,
      comment
    ) values (
      p_organization_id,
      v_normalized_email,
      'invited',
      v_user_id,
      nullif(trim(coalesce(p_comment, '')), '')
    );
  else
    update public.organization_members om
    set status = 'invited',
        user_id = coalesce(v_user_id, om.user_id),
        comment = coalesce(nullif(trim(coalesce(p_comment, '')), ''), om.comment)
    where om.id = v_existing_membership_id;
  end if;

  if v_actor_email is not null and v_normalized_email = v_actor_email then
    perform billing.ensure_org_actor_entitlement(p_actor_user_id, p_organization_id);
    update license.org_invites
    set status = 'accepted',
        accepted_at = v_now
    where id = v_invite_id;
  end if;

  return v_invite_id;
end;
$$;

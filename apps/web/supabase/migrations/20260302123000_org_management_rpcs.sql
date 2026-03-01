create or replace function billing.update_organization_name(
  p_actor_user_id uuid,
  p_organization_id int,
  p_name text
) returns text
language plpgsql
security definer
set search_path = billing, public, auth
as $$
declare
  v_is_admin boolean;
  v_name text;
begin
  if p_actor_user_id is null then
    raise exception 'Missing actor user id';
  end if;
  if p_organization_id is null then
    raise exception 'Missing organization id';
  end if;

  v_name := trim(coalesce(p_name, ''));
  if length(v_name) < 2 then
    raise exception 'Organization name is too short';
  end if;
  if length(v_name) > 120 then
    raise exception 'Organization name is too long';
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

  update public.organizations
  set name = v_name
  where id = p_organization_id;

  if not found then
    raise exception 'Organization not found';
  end if;

  return v_name;
end;
$$;

create or replace function billing.list_organization_admins(
  p_actor_user_id uuid,
  p_organization_id int
) returns table (
  user_id uuid,
  email text,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = billing, public, auth
as $$
declare
  v_is_admin boolean;
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

  return query
  select
    oa.user_id,
    lower(u.email) as email,
    oa.created_at
  from public.organization_administrators oa
  left join auth.users u on u.id = oa.user_id
  where oa.organization_id = p_organization_id
    and oa.user_id is not null
  order by oa.created_at asc;
end;
$$;

create or replace function billing.add_organization_admin_by_email(
  p_actor_user_id uuid,
  p_organization_id int,
  p_admin_email text
) returns uuid
language plpgsql
security definer
set search_path = billing, public, auth
as $$
declare
  v_is_admin boolean;
  v_email text;
  v_new_admin_user_id uuid;
begin
  if p_actor_user_id is null then
    raise exception 'Missing actor user id';
  end if;
  if p_organization_id is null then
    raise exception 'Missing organization id';
  end if;

  v_email := lower(trim(coalesce(p_admin_email, '')));
  if v_email = '' then
    raise exception 'Missing admin email';
  end if;
  if position('@' in v_email) = 0 then
    raise exception 'Invalid admin email';
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

  select u.id
  into v_new_admin_user_id
  from auth.users u
  where lower(u.email) = v_email
  order by u.created_at asc
  limit 1;

  if v_new_admin_user_id is null then
    raise exception 'No user found for email %', v_email;
  end if;

  insert into public.organization_administrators (organization_id, user_id)
  values (p_organization_id, v_new_admin_user_id)
  on conflict do nothing;

  return v_new_admin_user_id;
end;
$$;

create or replace function billing.remove_organization_admin(
  p_actor_user_id uuid,
  p_organization_id int,
  p_remove_user_id uuid
) returns uuid
language plpgsql
security definer
set search_path = billing, public, auth
as $$
declare
  v_is_admin boolean;
  v_admin_count int;
begin
  if p_actor_user_id is null then
    raise exception 'Missing actor user id';
  end if;
  if p_organization_id is null then
    raise exception 'Missing organization id';
  end if;
  if p_remove_user_id is null then
    raise exception 'Missing remove user id';
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

  select count(*)::int
  into v_admin_count
  from public.organization_administrators oa
  where oa.organization_id = p_organization_id
    and oa.user_id is not null;

  if v_admin_count <= 1 then
    raise exception 'Cannot remove the last organization admin';
  end if;

  delete from public.organization_administrators oa
  where oa.organization_id = p_organization_id
    and oa.user_id = p_remove_user_id;

  if not found then
    raise exception 'Admin user is not assigned to this organization';
  end if;

  return p_remove_user_id;
end;
$$;

create or replace function billing.cancel_org_subscription_at_period_end(
  p_actor_user_id uuid,
  p_organization_id int
) returns uuid
language plpgsql
security definer
set search_path = billing, public, auth
as $$
declare
  v_is_admin boolean;
  v_subscription_id uuid;
  v_now timestamptz := now();
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

  select s.id
  into v_subscription_id
  from billing.accounts a
  join billing.subscriptions s on s.account_id = a.id
  where a.kind = 'organization'
    and a.organization_id = p_organization_id
    and s.provider = 'payrexx'
  order by s.created_at desc
  limit 1
  for update;

  if v_subscription_id is null then
    raise exception 'No organization subscription found';
  end if;

  update billing.subscriptions s
  set cancel_at_period_end = true,
      canceled_at = v_now,
      metadata = coalesce(s.metadata, '{}'::jsonb) || jsonb_build_object(
        'org_cancel_requested_at', v_now,
        'org_cancel_requested_by', p_actor_user_id
      )
  where s.id = v_subscription_id;

  return v_subscription_id;
end;
$$;

create or replace function billing.reactivate_org_subscription(
  p_actor_user_id uuid,
  p_organization_id int
) returns uuid
language plpgsql
security definer
set search_path = billing, public, auth
as $$
declare
  v_is_admin boolean;
  v_subscription billing.subscriptions%rowtype;
  v_now timestamptz := now();
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

  update billing.subscriptions s
  set cancel_at_period_end = false,
      canceled_at = null,
      metadata = coalesce(s.metadata, '{}'::jsonb) || jsonb_build_object(
        'org_reactivated_at', v_now,
        'org_reactivated_by', p_actor_user_id
      )
  where s.id = v_subscription.id;

  return v_subscription.id;
end;
$$;

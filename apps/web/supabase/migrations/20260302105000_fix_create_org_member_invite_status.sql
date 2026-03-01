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
  v_normalized_email text;
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

  return v_invite_id;
end;
$$;

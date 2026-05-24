-- Fix member seat release / leave: entitlements_revocation_reason_only_if_revoked
-- requires revocation_reason IS NULL unless status = 'revoked'.
-- release_org_member_seat and leave_organization_as_member incorrectly set
-- status = 'expired' with revocation_reason = 'other', causing 400 on delete.

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
      set status = 'revoked',
          valid_until = v_now,
          updated_at = v_now,
          revocation_reason = 'org_admin_removed'::license.entitlement_revocation_reason
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

create or replace function billing.leave_organization_as_member(p_actor_user_id uuid, p_organization_id int)
returns void
language plpgsql
security definer
set search_path = billing, license, public, auth
as $$
declare
  v_email text;
  v_member record;
  v_now timestamptz := now();
begin
  if p_actor_user_id is null or p_organization_id is null then
    raise exception 'Missing parameters';
  end if;

  select lower(u.email)
  into v_email
  from auth.users u
  where u.id = p_actor_user_id;

  select om.id, om.user_email
  into v_member
  from public.organization_members om
  where om.organization_id = p_organization_id
    and om.status = 'active'
    and (
      om.user_id = p_actor_user_id
      or (v_email is not null and lower(om.user_email) = v_email)
    )
  order by om.created_at asc
  limit 1
  for update;

  if not found then
    raise exception 'No active organization membership found';
  end if;

  update license.entitlements e
  set status = 'revoked',
      valid_until = v_now,
      updated_at = v_now,
      revocation_reason = 'other'::license.entitlement_revocation_reason
  where e.organization_id = p_organization_id
    and e.kind = 'org_seat'
    and e.status = 'active'
    and e.user_id = p_actor_user_id;

  update public.organization_members
  set status = 'canceled',
      user_id = null
  where id = v_member.id;

  if v_email is not null then
    update license.org_invites
    set status = 'canceled'
    where organization_id = p_organization_id
      and status = 'pending'
      and lower(email) = v_email;
  end if;
end;
$$;

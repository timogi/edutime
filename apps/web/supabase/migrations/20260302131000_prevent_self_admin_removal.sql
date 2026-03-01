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

  if p_actor_user_id = p_remove_user_id then
    raise exception 'Cannot remove your own organization admin role';
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

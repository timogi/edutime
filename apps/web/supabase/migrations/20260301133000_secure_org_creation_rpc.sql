-- Hardened org creation RPC:
-- - transactional create organization + admin mapping
-- - per-user organization creation limit
-- - strict input validation
-- - keeps existing public tables unchanged

create or replace function public.create_organization_with_admin(
  p_actor_user_id uuid,
  p_name text,
  p_seats int default 3,
  p_max_organizations_per_user int default 3
) returns int
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_name text := btrim(coalesce(p_name, ''));
  v_seats int := coalesce(p_seats, 3);
  v_existing_count int := 0;
  v_org_id int;
begin
  if p_actor_user_id is null then
    raise exception 'Missing actor user id';
  end if;

  if length(v_name) < 2 then
    raise exception 'Organization name is too short';
  end if;

  if length(v_name) > 120 then
    raise exception 'Organization name is too long';
  end if;

  if v_seats < 3 or v_seats > 100 then
    raise exception 'Seats must be between 3 and 100';
  end if;

  if p_max_organizations_per_user < 1 or p_max_organizations_per_user > 20 then
    raise exception 'Invalid max organizations per user';
  end if;

  select count(*)
  into v_existing_count
  from public.organization_administrators oa
  where oa.user_id = p_actor_user_id;

  if v_existing_count >= p_max_organizations_per_user then
    raise exception 'Organization creation limit reached (% max)', p_max_organizations_per_user;
  end if;

  insert into public.organizations (name, seats, is_active)
  values (v_name, v_seats, true)
  returning id into v_org_id;

  insert into public.organization_administrators (organization_id, user_id)
  values (v_org_id, p_actor_user_id);

  return v_org_id;
end;
$$;

grant execute on function public.create_organization_with_admin(uuid, text, int, int) to service_role;

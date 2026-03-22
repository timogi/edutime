-- Immediate access cutoff when an organization is deactivated:
-- members (active/invited -> canceled), pending invites canceled,
-- org_seat entitlements expired (aligned with cancellation sweep: status expired, revocation_reason null).

create or replace function billing.deactivate_organization_revoke_access(
  p_actor_user_id uuid,
  p_organization_id int
) returns void
language plpgsql
security definer
set search_path = billing, license, public
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
  )
  into v_is_admin;

  if not coalesce(v_is_admin, false) then
    raise exception 'Not authorized to manage organization';
  end if;

  if not exists (select 1 from public.organizations o where o.id = p_organization_id) then
    raise exception 'Organization not found';
  end if;

  update public.organizations
  set is_active = false
  where id = p_organization_id;

  update public.organization_members
  set status = 'canceled',
      user_id = null
  where organization_id = p_organization_id
    and status in ('active', 'invited');

  update license.org_invites
  set status = 'canceled'
  where organization_id = p_organization_id
    and status = 'pending';

  update license.entitlements
  set status = 'expired',
      revocation_reason = null,
      updated_at = now()
  where organization_id = p_organization_id
    and kind = 'org_seat'
    and status in ('active', 'pending');
end;
$$;

grant execute on function billing.deactivate_organization_revoke_access(uuid, int) to service_role;

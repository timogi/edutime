-- Voluntary org shutdown: record earliest permanent removal time (30 days) while keeping
-- the same immediate access cutoff as today (is_active = false, members cleared).
-- Billing nonpayment deactivation clears scheduled_deletion_at so the org is not treated as user-scheduled deletion.

alter table public.organizations
  add column if not exists scheduled_deletion_at timestamptz;

comment on column public.organizations.scheduled_deletion_at is
  'Set when an org admin requests org removal; earliest automated purge date. Null for billing nonpayment or active orgs.';

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
  set is_active = false,
      scheduled_deletion_at = now() + interval '30 days'
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

create or replace function billing.deactivate_organization_for_nonpayment(
  p_organization_id int,
  p_reference_time timestamptz default now()
) returns void
language plpgsql
security definer
set search_path = billing, license, public
as $$
begin
  if p_organization_id is null then
    return;
  end if;

  if not exists (select 1 from public.organizations o where o.id = p_organization_id) then
    return;
  end if;

  if not exists (select 1 from public.organizations o where o.id = p_organization_id and o.is_active = true) then
    return;
  end if;

  update public.organizations
  set is_active = false,
      scheduled_deletion_at = null
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
      updated_at = p_reference_time
  where organization_id = p_organization_id
    and kind = 'org_seat'
    and status in ('active', 'pending');
end;
$$;

grant execute on function billing.deactivate_organization_for_nonpayment(int, timestamptz) to service_role;

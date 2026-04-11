-- Thin public.api_* wrappers: inject auth.uid() so clients cannot spoof p_actor_user_id.

create or replace function public.api_require_uid() returns uuid
language plpgsql
stable
as $$
declare
  v uuid := auth.uid();
begin
  if v is null then
    raise exception 'not authenticated';
  end if;
  return v;
end;
$$;

-- ---------------------------------------------------------------------------
-- Org billing & checkout (billing schema targets)
-- ---------------------------------------------------------------------------
create or replace function public.api_get_org_billing_status(p_organization_id int)
returns table (
  subscription_id uuid,
  subscription_status billing.org_subscription_status,
  amount_cents int,
  currency text,
  seat_count int,
  current_period_start timestamptz,
  current_period_end timestamptz,
  grace_days int,
  suspend_at timestamptz,
  invoice_id uuid,
  invoice_status text,
  invoice_due_date timestamptz,
  invoice_paid_at timestamptz,
  payrexx_gateway_link text,
  checkout_reference_id text,
  responsible_email text
)
language sql
security definer
set search_path = public, billing
as $$
  select * from billing.get_org_billing_status(public.api_require_uid(), p_organization_id);
$$;

create or replace function public.api_create_org_checkout(
  p_organization_id int,
  p_quantity int,
  p_amount_cents int,
  p_currency text,
  p_reference_id text,
  p_payrexx_gateway_id bigint default null,
  p_payrexx_gateway_link text default null,
  p_payrexx_gateway_hash text default null,
  p_expires_at timestamptz default null,
  p_due_date timestamptz default null,
  p_metadata jsonb default '{}'::jsonb
) returns uuid
language sql
security definer
set search_path = public, billing
as $$
  select billing.create_org_checkout(
    public.api_require_uid(),
    p_organization_id,
    p_quantity,
    p_amount_cents,
    p_currency,
    p_reference_id,
    p_payrexx_gateway_id,
    p_payrexx_gateway_link,
    p_payrexx_gateway_hash,
    p_expires_at,
    p_due_date,
    p_metadata
  );
$$;

create or replace function public.api_update_org_seat_plan(
  p_organization_id int,
  p_target_seat_count int,
  p_apply_immediately boolean default false,
  p_next_annual_amount_cents int default null,
  p_metadata jsonb default '{}'::jsonb
) returns uuid
language sql
security definer
set search_path = public, billing
as $$
  select billing.update_org_seat_plan(
    public.api_require_uid(),
    p_organization_id,
    p_target_seat_count,
    p_apply_immediately,
    p_next_annual_amount_cents,
    p_metadata
  );
$$;

create or replace function public.api_cancel_org_subscription_at_period_end(p_organization_id int)
returns uuid
language sql
security definer
set search_path = public, billing
as $$
  select billing.cancel_org_subscription_at_period_end(public.api_require_uid(), p_organization_id);
$$;

create or replace function public.api_reactivate_org_subscription(p_organization_id int)
returns uuid
language sql
security definer
set search_path = public, billing
as $$
  select billing.reactivate_org_subscription(public.api_require_uid(), p_organization_id);
$$;

create or replace function public.api_list_organization_admins(p_organization_id int)
returns table (
  user_id uuid,
  email text,
  created_at timestamptz
)
language sql
security definer
set search_path = public, billing
as $$
  select * from billing.list_organization_admins(public.api_require_uid(), p_organization_id);
$$;

create or replace function public.api_add_organization_admin_by_email(
  p_organization_id int,
  p_admin_email text
) returns uuid
language sql
security definer
set search_path = public, billing
as $$
  select billing.add_organization_admin_by_email(
    public.api_require_uid(),
    p_organization_id,
    p_admin_email
  );
$$;

create or replace function public.api_remove_organization_admin(
  p_organization_id int,
  p_remove_user_id uuid
) returns uuid
language sql
security definer
set search_path = public, billing
as $$
  select billing.remove_organization_admin(
    public.api_require_uid(),
    p_organization_id,
    p_remove_user_id
  );
$$;

create or replace function public.api_update_organization_name(
  p_organization_id int,
  p_name text
) returns text
language sql
security definer
set search_path = public, billing
as $$
  select billing.update_organization_name(public.api_require_uid(), p_organization_id, p_name);
$$;

create or replace function public.api_deactivate_organization_revoke_access(p_organization_id int)
returns void
language plpgsql
security definer
set search_path = public, billing
as $$
begin
  perform billing.deactivate_organization_revoke_access(public.api_require_uid(), p_organization_id);
end;
$$;

create or replace function public.api_create_org_member_invite(
  p_organization_id int,
  p_email text,
  p_comment text default null,
  p_role text default 'member',
  p_expires_at timestamptz default null
) returns jsonb
language plpgsql
security definer
set search_path = public, billing, license
as $$
declare
  v_uid uuid := public.api_require_uid();
  v_id uuid;
  v_exp timestamptz := coalesce(p_expires_at, now() + interval '30 days');
  v_token text;
  v_email_out text;
begin
  v_id := billing.create_org_member_invite(v_uid, p_organization_id, p_email, p_comment, p_role, v_exp);
  select oi.token, oi.email into v_token, v_email_out
  from license.org_invites oi
  where oi.id = v_id;
  return jsonb_build_object(
    'invite_id', v_id,
    'token', v_token,
    'email', v_email_out
  );
end;
$$;

create or replace function public.api_accept_org_member_invite(p_organization_id int)
returns uuid
language sql
security definer
set search_path = public, billing
as $$
  select billing.accept_org_member_invite(public.api_require_uid(), p_organization_id);
$$;

create or replace function public.api_reject_org_member_invite(p_organization_id int)
returns uuid
language sql
security definer
set search_path = public, billing
as $$
  select billing.reject_org_member_invite(public.api_require_uid(), p_organization_id);
$$;

create or replace function public.api_release_org_member_seat(
  p_organization_id int,
  p_membership_id int
) returns uuid
language sql
security definer
set search_path = public, billing
as $$
  select billing.release_org_member_seat(
    public.api_require_uid(),
    p_organization_id,
    p_membership_id
  );
$$;

create or replace function public.api_reject_org_invite_membership_fallback(p_organization_id int)
returns void
language plpgsql
security definer
set search_path = public, billing
as $$
begin
  perform billing.reject_org_invite_membership_fallback(public.api_require_uid(), p_organization_id);
end;
$$;

create or replace function public.api_leave_organization_as_member(p_organization_id int)
returns void
language plpgsql
security definer
set search_path = public, billing
as $$
begin
  perform billing.leave_organization_as_member(public.api_require_uid(), p_organization_id);
end;
$$;

-- ---------------------------------------------------------------------------
-- Organization create (public schema RPC)
-- ---------------------------------------------------------------------------
create or replace function public.api_create_organization_with_admin(
  p_name text,
  p_seats int default 3,
  p_max_organizations_per_user int default 3
) returns int
language sql
security definer
set search_path = public
as $$
  select public.create_organization_with_admin(
    public.api_require_uid(),
    p_name,
    p_seats,
    p_max_organizations_per_user
  );
$$;

-- ---------------------------------------------------------------------------
-- Personal billing / checkout
-- ---------------------------------------------------------------------------
create or replace function public.api_create_personal_checkout_session(
  p_amount_cents int,
  p_currency text,
  p_reference_id text,
  p_payrexx_gateway_id bigint,
  p_payrexx_gateway_link text,
  p_billing_cycle text default 'annual',
  p_expires_at timestamptz default null,
  p_metadata jsonb default '{}'::jsonb
) returns uuid
language sql
security definer
set search_path = public, billing
as $$
  select billing.create_personal_checkout_session(
    public.api_require_uid(),
    p_amount_cents,
    p_currency,
    p_reference_id,
    p_payrexx_gateway_id,
    p_payrexx_gateway_link,
    p_billing_cycle,
    p_expires_at,
    p_metadata
  );
$$;

create or replace function public.api_get_personal_subscription_summary()
returns jsonb
language sql
security definer
set search_path = public, billing
as $$
  select billing.get_personal_subscription_summary(public.api_require_uid());
$$;

create or replace function public.api_mark_personal_subscription_cancel_pending(
  p_canceled_at timestamptz,
  p_metadata_merge jsonb default '{}'::jsonb
) returns boolean
language sql
security definer
set search_path = public, billing
as $$
  select billing.mark_personal_subscription_cancel_pending(
    public.api_require_uid(),
    p_canceled_at,
    p_metadata_merge
  );
$$;

create or replace function public.api_user_has_active_personal_license()
returns boolean
language sql
security definer
set search_path = public, license
stable
as $$
  select license.user_has_active_personal_license(public.api_require_uid());
$$;

create or replace function public.api_cancel_active_trial_for_user()
returns uuid
language sql
security definer
set search_path = public, license
as $$
  select license.cancel_active_trial_for_user();
$$;

-- ---------------------------------------------------------------------------
-- Grants: authenticated only (service_role continues to call billing.* directly)
-- ---------------------------------------------------------------------------
revoke all on function public.api_require_uid() from public;

grant execute on function public.api_get_org_billing_status(int) to authenticated;
grant execute on function public.api_create_org_checkout(int, int, int, text, text, bigint, text, text, timestamptz, timestamptz, jsonb) to authenticated;
grant execute on function public.api_update_org_seat_plan(int, int, boolean, int, jsonb) to authenticated;
grant execute on function public.api_cancel_org_subscription_at_period_end(int) to authenticated;
grant execute on function public.api_reactivate_org_subscription(int) to authenticated;
grant execute on function public.api_list_organization_admins(int) to authenticated;
grant execute on function public.api_add_organization_admin_by_email(int, text) to authenticated;
grant execute on function public.api_remove_organization_admin(int, uuid) to authenticated;
grant execute on function public.api_update_organization_name(int, text) to authenticated;
grant execute on function public.api_deactivate_organization_revoke_access(int) to authenticated;
grant execute on function public.api_create_org_member_invite(int, text, text, text, timestamptz) to authenticated;
grant execute on function public.api_accept_org_member_invite(int) to authenticated;
grant execute on function public.api_reject_org_member_invite(int) to authenticated;
grant execute on function public.api_release_org_member_seat(int, int) to authenticated;
grant execute on function public.api_reject_org_invite_membership_fallback(int) to authenticated;
grant execute on function public.api_leave_organization_as_member(int) to authenticated;
grant execute on function public.api_create_organization_with_admin(text, int, int) to authenticated;
grant execute on function public.api_create_personal_checkout_session(int, text, text, bigint, text, text, timestamptz, jsonb) to authenticated;
grant execute on function public.api_get_personal_subscription_summary() to authenticated;
grant execute on function public.api_mark_personal_subscription_cancel_pending(timestamptz, jsonb) to authenticated;
grant execute on function public.api_user_has_active_personal_license() to authenticated;
grant execute on function public.api_cancel_active_trial_for_user() to authenticated;

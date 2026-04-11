-- Next.js no longer uses SUPABASE_SERVICE_ROLE_KEY: user JWT calls public.api_* wrappers
-- that forward auth.uid() into existing billing.* SECURITY DEFINER functions.

-- ---------------------------------------------------------------------------
-- account_deletion queue (worker processes with service role on Supabase only)
-- ---------------------------------------------------------------------------
alter table public.account_deletion
  add column if not exists processed_at timestamptz;

alter table public.account_deletion
  add column if not exists processing_error text;

create unique index if not exists uq_account_deletion_pending_user
  on public.account_deletion (user_id)
  where processed_at is null and user_id is not null;

alter table public.account_deletion enable row level security;

drop policy if exists "Users insert own account_deletion row" on public.account_deletion;
create policy "Users insert own account_deletion row"
  on public.account_deletion
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users select own account_deletion" on public.account_deletion;
create policy "Users select own account_deletion"
  on public.account_deletion
  for select
  to authenticated
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- license: cancel active trial (auth.uid() only)
-- ---------------------------------------------------------------------------
create or replace function license.cancel_active_trial_for_user()
returns uuid
language plpgsql
security definer
set search_path = license, public
as $$
declare
  v_id uuid;
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;

  select e.id
  into v_id
  from license.entitlements e
  where e.user_id = auth.uid()
    and e.kind = 'trial'
    and e.status = 'active'
  order by e.created_at desc
  limit 1;

  if v_id is null then
    return null;
  end if;

  update license.entitlements e
  set status = 'expired',
      updated_at = now()
  where e.id = v_id;

  return v_id;
end;
$$;

grant execute on function license.cancel_active_trial_for_user() to authenticated;

-- ---------------------------------------------------------------------------
-- billing: personal checkout session (validates amount server-side)
-- Matches apps/web/src/utils/payments/pricing.ts INDIVIDUAL_ANNUAL_PRICE_CENTS = 3900
-- Daily test: 100 cents
-- ---------------------------------------------------------------------------
create or replace function billing.create_personal_checkout_session(
  p_user_id uuid,
  p_amount_cents int,
  p_currency text,
  p_reference_id text,
  p_payrexx_gateway_id bigint,
  p_payrexx_gateway_link text,
  p_billing_cycle text default 'annual',
  p_expires_at timestamptz default null,
  p_metadata jsonb default '{}'::jsonb
) returns uuid
language plpgsql
security definer
set search_path = billing, public
as $$
declare
  v_expected int;
  v_checkout_id uuid;
  v_expires timestamptz := coalesce(p_expires_at, now() + interval '2 hours');
begin
  if p_user_id is null then
    raise exception 'Missing user id';
  end if;
  if p_reference_id is null or length(trim(p_reference_id)) = 0 then
    raise exception 'Missing checkout reference id';
  end if;
  if p_currency is null or upper(trim(p_currency)) <> 'CHF' then
    raise exception 'Invalid currency';
  end if;

  if coalesce(p_billing_cycle, 'annual') = 'daily_test' then
    v_expected := 100;
  else
    v_expected := 3900;
  end if;

  if p_amount_cents is null or p_amount_cents <> v_expected then
    raise exception 'Invalid checkout amount';
  end if;

  insert into billing.checkout_sessions (
    user_id,
    organization_id,
    plan,
    quantity,
    amount_cents,
    currency,
    status,
    reference_id,
    payrexx_gateway_id,
    payrexx_gateway_link,
    metadata,
    expires_at
  ) values (
    p_user_id,
    null,
    'annual',
    1,
    p_amount_cents,
    upper(trim(p_currency)),
    'pending',
    trim(p_reference_id),
    p_payrexx_gateway_id,
    p_payrexx_gateway_link,
    coalesce(p_metadata, '{}'::jsonb) || jsonb_build_object(
      'billing_cycle', coalesce(p_billing_cycle, 'annual')
    ),
    v_expires
  )
  returning id into v_checkout_id;

  return v_checkout_id;
end;
$$;

grant execute on function billing.create_personal_checkout_session(
  uuid, int, text, text, bigint, text, text, timestamptz, jsonb
) to service_role;

-- ---------------------------------------------------------------------------
-- billing: personal subscription summary as jsonb (for license management UI)
-- ---------------------------------------------------------------------------
create or replace function billing.get_personal_subscription_summary(p_user_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = billing, license, public
as $$
declare
  v_sub record;
  v_invoices jsonb := '[]'::jsonb;
  v_ent jsonb;
  v_now timestamptz := now();
  v_gateway bigint;
begin
  if p_user_id is null then
    raise exception 'Missing user id';
  end if;

  select
    s.id,
    s.provider,
    s.provider_subscription_id,
    s.status,
    s.current_period_start,
    s.current_period_end,
    s.cancel_at_period_end,
    s.canceled_at,
    s.currency,
    s.amount_cents,
    s.created_at,
    s.metadata
  into v_sub
  from billing.subscriptions s
  join billing.accounts a on a.id = s.account_id
  where a.user_id = p_user_id
    and a.organization_id is null
    and s.provider = 'payrexx'
  order by s.created_at desc
  limit 1;

  if v_sub.id is not null then
    select coalesce(jsonb_agg(
      jsonb_build_object(
        'id', i.id,
        'amount_cents', i.amount_cents,
        'currency', i.currency,
        'status', i.status,
        'provider_invoice_id', i.provider_invoice_id,
        'paid_at', i.paid_at,
        'created_at', i.created_at
      ) order by i.created_at desc
    ), '[]'::jsonb)
    into v_invoices
    from (
      select *
      from billing.invoices i
      where i.subscription_id = v_sub.id
      order by i.created_at desc
      limit 20
    ) i;

    select cs.payrexx_gateway_id
    into v_gateway
    from billing.checkout_sessions cs
    where cs.subscription_id = v_sub.id
      and cs.payrexx_gateway_id is not null
    order by cs.updated_at desc nulls last, cs.created_at desc
    limit 1;
  end if;

  select jsonb_build_object(
    'id', e.id,
    'status', e.status,
    'valid_from', e.valid_from,
    'valid_until', e.valid_until
  )
  into v_ent
  from license.entitlements e
  where e.user_id = p_user_id
    and e.kind = 'personal'
    and e.status = 'active'
    and e.valid_from <= v_now
    and (e.valid_until is null or e.valid_until >= v_now)
  order by e.created_at desc
  limit 1;

  return jsonb_build_object(
    'subscription', case when v_sub.id is null then null else jsonb_build_object(
      'id', v_sub.id,
      'provider', v_sub.provider,
      'provider_subscription_id', v_sub.provider_subscription_id,
      'status', v_sub.status,
      'current_period_start', v_sub.current_period_start,
      'current_period_end', v_sub.current_period_end,
      'cancel_at_period_end', v_sub.cancel_at_period_end,
      'canceled_at', v_sub.canceled_at,
      'currency', v_sub.currency,
      'amount_cents', v_sub.amount_cents,
      'created_at', v_sub.created_at,
      'metadata', coalesce(v_sub.metadata, '{}'::jsonb),
      'resolved_checkout_payrexx_gateway_id', v_gateway
    ) end,
    'invoices', v_invoices,
    'entitlement', v_ent
  );
end;
$$;

grant execute on function billing.get_personal_subscription_summary(uuid) to service_role;

-- ---------------------------------------------------------------------------
-- Mark personal Payrexx subscription cancel-at-period-end after provider cancel
-- ---------------------------------------------------------------------------
create or replace function billing.mark_personal_subscription_cancel_pending(
  p_user_id uuid,
  p_canceled_at timestamptz,
  p_metadata_merge jsonb
) returns boolean
language plpgsql
security definer
set search_path = billing, public
as $$
declare
  v_sub_id uuid;
  v_meta jsonb;
begin
  if p_user_id is null then
    raise exception 'Missing user id';
  end if;

  select s.id, s.metadata
  into v_sub_id, v_meta
  from billing.subscriptions s
  join billing.accounts a on a.id = s.account_id
  where a.user_id = p_user_id
    and a.organization_id is null
    and s.provider = 'payrexx'
    and s.status = 'active'
  order by s.created_at desc
  limit 1
  for update;

  if v_sub_id is null then
    return false;
  end if;

  update billing.subscriptions s
  set cancel_at_period_end = true,
      canceled_at = p_canceled_at,
      metadata = coalesce(v_meta, '{}'::jsonb) || coalesce(p_metadata_merge, '{}'::jsonb)
  where s.id = v_sub_id;

  return true;
end;
$$;

grant execute on function billing.mark_personal_subscription_cancel_pending(uuid, timestamptz, jsonb) to service_role;

-- ---------------------------------------------------------------------------
-- Checkout success page: session + entitlement flags (auth must own session)
-- ---------------------------------------------------------------------------
create or replace function public.api_get_checkout_completion_state(p_reference_id text)
returns jsonb
language plpgsql
security definer
set search_path = public, billing, license
stable
as $$
declare
  v_uid uuid := auth.uid();
  v_sess record;
  v_now timestamptz := now();
  v_personal boolean := false;
  v_org_seat boolean := false;
  v_has_active boolean := false;
begin
  if v_uid is null then
    raise exception 'not authenticated';
  end if;

  if p_reference_id is null or length(trim(p_reference_id)) = 0 then
    raise exception 'Missing reference id';
  end if;

  select c.status, c.plan, c.organization_id, c.user_id
  into v_sess
  from billing.checkout_sessions c
  where c.reference_id = trim(p_reference_id)
  limit 1;

  if not found then
    return jsonb_build_object('found', false);
  end if;

  if v_sess.user_id is distinct from v_uid then
    raise exception 'not authorized';
  end if;

  if v_sess.plan = 'annual' then
    select exists(
      select 1
      from license.entitlements e
      where e.user_id = v_uid
        and e.kind = 'personal'
        and e.status = 'active'
        and e.valid_from <= v_now
        and (e.valid_until is null or e.valid_until >= v_now)
    ) into v_personal;
  end if;

  if v_sess.plan = 'org' and v_sess.organization_id is not null then
    select exists(
      select 1
      from license.entitlements e
      where e.user_id = v_uid
        and e.kind = 'org_seat'
        and e.organization_id = v_sess.organization_id
        and e.status = 'active'
        and e.valid_from <= v_now
        and (e.valid_until is null or e.valid_until >= v_now)
    ) into v_org_seat;
  end if;

  v_has_active := v_personal;
  if not v_has_active and v_sess.plan = 'org' then
    if v_sess.status = 'completed' then
      v_has_active := true;
    else
      v_has_active := v_org_seat;
    end if;
  end if;

  return jsonb_build_object(
    'found', true,
    'status', v_sess.status,
    'plan', v_sess.plan,
    'organization_id', v_sess.organization_id,
    'has_active_personal_entitlement', v_personal,
    'has_active_org_seat_entitlement', v_org_seat,
    'has_active_entitlement', v_has_active
  );
end;
$$;

grant execute on function public.api_get_checkout_completion_state(text) to authenticated;

-- ---------------------------------------------------------------------------
-- User has active personal license (blocks duplicate annual checkout)
-- ---------------------------------------------------------------------------
create or replace function license.user_has_active_personal_license(p_user_id uuid)
returns boolean
language sql
security definer
set search_path = license, public
stable
as $$
  select exists(
    select 1
    from license.entitlements e
    where e.user_id = p_user_id
      and e.kind = 'personal'
      and e.status = 'active'
      and e.valid_from <= now()
      and (e.valid_until is null or e.valid_until >= now())
  );
$$;

grant execute on function license.user_has_active_personal_license(uuid) to service_role;

-- ---------------------------------------------------------------------------
-- Org management snapshot (single round-trip for GET + adjustSeats inputs)
-- ---------------------------------------------------------------------------
create or replace function public.api_get_organization_management_snapshot(p_organization_id int)
returns jsonb
language plpgsql
security definer
set search_path = public, billing, license, auth
as $$
declare
  v_uid uuid := auth.uid();
  v_is_admin boolean;
  v_org record;
  v_members_losing int := 0;
  v_occupied int := 0;
  v_admins jsonb := '[]'::jsonb;
  v_admins_lang jsonb := '[]'::jsonb;
  v_billing_row record;
  v_sub_cancel boolean;
  v_sub_canceled timestamptz;
  v_sub_meta jsonb;
  v_invoices jsonb := '[]'::jsonb;
  v_sub_id uuid;
begin
  if v_uid is null then
    raise exception 'not authenticated';
  end if;
  if p_organization_id is null then
    raise exception 'Missing organization id';
  end if;

  select exists(
    select 1
    from public.organization_administrators oa
    where oa.organization_id = p_organization_id
      and oa.user_id = v_uid
  ) into v_is_admin;

  if not coalesce(v_is_admin, false) then
    raise exception 'Not authorized to read organization %', p_organization_id;
  end if;

  select o.id, o.name, o.seats, o.is_active, o.scheduled_deletion_at
  into v_org
  from public.organizations o
  where o.id = p_organization_id;

  if not found then
    return jsonb_build_object('found', false);
  end if;

  select count(*)::int
  into v_members_losing
  from public.organization_members om
  where om.organization_id = p_organization_id
    and om.status in ('active', 'invited');

  select count(*)::int
  into v_occupied
  from public.organization_members om
  where om.organization_id = p_organization_id
    and om.status in ('active', 'invited');

  select coalesce(jsonb_agg(
    jsonb_build_object(
      'user_id', x.user_id,
      'email', x.email,
      'created_at', x.created_at
    ) order by x.created_at asc
  ), '[]'::jsonb)
  into v_admins
  from (
    select oa.user_id, lower(u.email) as email, oa.created_at
    from public.organization_administrators oa
    join auth.users u on u.id = oa.user_id
    where oa.organization_id = p_organization_id
      and oa.user_id is not null
    order by oa.created_at asc
  ) x;

  select coalesce(jsonb_agg(
    jsonb_build_object(
      'user_id', y.user_id,
      'email', y.email,
      'language', y.language
    ) order by y.created_at asc
  ), '[]'::jsonb)
  into v_admins_lang
  from (
    select oa.user_id, lower(u.email) as email, pu.language, oa.created_at
    from public.organization_administrators oa
    join auth.users u on u.id = oa.user_id
    left join public.users pu on pu.user_id = oa.user_id
    where oa.organization_id = p_organization_id
      and oa.user_id is not null
    order by oa.created_at asc
  ) y;

  select *
  into v_billing_row
  from billing.get_org_billing_status(v_uid, p_organization_id)
  limit 1;

  v_sub_id := v_billing_row.subscription_id;

  if v_sub_id is not null then
    select s.cancel_at_period_end, s.canceled_at, s.metadata
    into v_sub_cancel, v_sub_canceled, v_sub_meta
    from billing.subscriptions s
    where s.id = v_sub_id;

    select coalesce(jsonb_agg(
      jsonb_build_object(
        'id', i.id,
        'amount_cents', i.amount_cents,
        'currency', i.currency,
        'status', i.status,
        'provider_invoice_id', i.provider_invoice_id,
        'paid_at', i.paid_at,
        'created_at', i.created_at,
        'due_date', i.due_date
      ) order by i.created_at desc
    ), '[]'::jsonb)
    into v_invoices
    from (
      select *
      from billing.invoices i
      where i.subscription_id = v_sub_id
      order by i.created_at desc
      limit 30
    ) i;
  end if;

  return jsonb_build_object(
    'found', true,
    'organization', jsonb_build_object(
      'id', v_org.id,
      'name', v_org.name,
      'seats', v_org.seats,
      'is_active', coalesce(v_org.is_active, true),
      'scheduled_deletion_at', v_org.scheduled_deletion_at
    ),
    'members_losing_license_count', v_members_losing,
    'occupied_seats_count', v_occupied,
    'admins', v_admins,
    'admins_with_language', v_admins_lang,
    'billing_status', case when v_billing_row.subscription_id is null then null else jsonb_build_object(
      'subscription_id', v_billing_row.subscription_id,
      'subscription_status', v_billing_row.subscription_status,
      'amount_cents', v_billing_row.amount_cents,
      'currency', v_billing_row.currency,
      'seat_count', v_billing_row.seat_count,
      'current_period_start', v_billing_row.current_period_start,
      'current_period_end', v_billing_row.current_period_end,
      'grace_days', v_billing_row.grace_days,
      'suspend_at', v_billing_row.suspend_at,
      'invoice_id', v_billing_row.invoice_id,
      'invoice_status', v_billing_row.invoice_status,
      'invoice_due_date', v_billing_row.invoice_due_date,
      'invoice_paid_at', v_billing_row.invoice_paid_at,
      'payrexx_gateway_link', v_billing_row.payrexx_gateway_link,
      'checkout_reference_id', v_billing_row.checkout_reference_id,
      'responsible_email', v_billing_row.responsible_email
    ) end,
    'billing_subscription', case when v_sub_id is null then null else jsonb_build_object(
      'cancel_at_period_end', coalesce(v_sub_cancel, false),
      'canceled_at', v_sub_canceled,
      'metadata', coalesce(v_sub_meta, '{}'::jsonb)
    ) end,
    'invoices', v_invoices
  );
end;
$$;

grant execute on function public.api_get_organization_management_snapshot(int) to authenticated;

-- ---------------------------------------------------------------------------
-- Org admin: lightweight row for PATCH name guard
-- ---------------------------------------------------------------------------
create or replace function public.api_get_organization_admin_row(p_organization_id int)
returns jsonb
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_uid uuid := auth.uid();
  v_is_admin boolean;
  v_sched timestamptz;
begin
  if v_uid is null then
    raise exception 'not authenticated';
  end if;

  select exists(
    select 1
    from public.organization_administrators oa
    where oa.organization_id = p_organization_id
      and oa.user_id = v_uid
  ) into v_is_admin;

  if not coalesce(v_is_admin, false) then
    raise exception 'Not authorized';
  end if;

  select o.scheduled_deletion_at
  into v_sched
  from public.organizations o
  where o.id = p_organization_id;

  if not found then
    return jsonb_build_object('found', false);
  end if;

  return jsonb_build_object(
    'found', true,
    'scheduled_deletion_at', v_sched
  );
end;
$$;

grant execute on function public.api_get_organization_admin_row(int) to authenticated;

-- ---------------------------------------------------------------------------
-- Reject invite fallback (membership-based) + leave organization as member
-- ---------------------------------------------------------------------------
create or replace function billing.reject_org_invite_membership_fallback(
  p_actor_user_id uuid,
  p_organization_id int
) returns void
language plpgsql
security definer
set search_path = billing, license, public, auth
as $$
declare
  v_email text;
  v_member record;
begin
  if p_actor_user_id is null or p_organization_id is null then
    raise exception 'Missing parameters';
  end if;

  select lower(u.email)
  into v_email
  from auth.users u
  where u.id = p_actor_user_id;

  if v_email is null then
    raise exception 'User email not available';
  end if;

  select om.id, om.user_email
  into v_member
  from public.organization_members om
  where om.organization_id = p_organization_id
    and om.status = 'invited'
    and (om.user_id = p_actor_user_id or lower(om.user_email) = v_email)
  order by om.created_at asc
  limit 1
  for update;

  if not found then
    raise exception 'No pending invite found for this organization';
  end if;

  update public.organization_members
  set status = 'rejected',
      user_id = null
  where id = v_member.id;

  update license.org_invites
  set status = 'canceled'
  where organization_id = p_organization_id
    and status = 'pending'
    and lower(email) = v_email;
end;
$$;

grant execute on function billing.reject_org_invite_membership_fallback(uuid, int) to service_role;

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
  set status = 'expired',
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

grant execute on function billing.leave_organization_as_member(uuid, int) to service_role;

-- ---------------------------------------------------------------------------
-- Account deletion: validate + enqueue (hard delete runs in Edge worker)
-- ---------------------------------------------------------------------------
create or replace function public.account_deletion_validate()
returns jsonb
language plpgsql
security definer
set search_path = public, billing, auth
as $$
declare
  v_uid uuid := auth.uid();
  v_blockers jsonb := '[]'::jsonb;
  r record;
  v_admin_count int;
  v_personal_uncanceled boolean := false;
begin
  if v_uid is null then
    raise exception 'not authenticated';
  end if;

  for r in
    select oa.organization_id, o.name as organization_name
    from public.organization_administrators oa
    join public.organizations o on o.id = oa.organization_id
    where oa.user_id = v_uid
      and coalesce(o.is_active, true)
  loop
    select count(*)::int
    into v_admin_count
    from public.organization_administrators oa2
    where oa2.organization_id = r.organization_id;

    if coalesce(v_admin_count, 0) <= 1 then
      v_blockers := v_blockers || jsonb_build_array(
        jsonb_build_object(
          'organizationId', r.organization_id,
          'organizationName', coalesce(nullif(trim(r.organization_name), ''), '#' || r.organization_id::text)
        )
      );
    end if;
  end loop;

  if jsonb_array_length(v_blockers) > 0 then
    return jsonb_build_object(
      'ok', false,
      'code', 'SOLE_ADMIN_BLOCKER',
      'blockers', v_blockers
    );
  end if;

  select exists(
    select 1
    from billing.subscriptions s
    join billing.accounts a on a.id = s.account_id
    where a.user_id = v_uid
      and a.organization_id is null
      and s.provider = 'payrexx'
      and s.status = 'active'
      and coalesce(s.cancel_at_period_end, false) = false
  ) into v_personal_uncanceled;

  if v_personal_uncanceled then
    return jsonb_build_object(
      'ok', false,
      'code', 'PERSONAL_SUBSCRIPTION_CANCEL_REQUIRED'
    );
  end if;

  return jsonb_build_object('ok', true);
end;
$$;

grant execute on function public.account_deletion_validate() to authenticated;

create or replace function public.account_deletion_enqueue(p_email text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_val jsonb;
  v_email_norm text := lower(trim(coalesce(p_email, '')));
begin
  if v_uid is null then
    raise exception 'not authenticated';
  end if;

  v_val := public.account_deletion_validate();
  if coalesce((v_val->>'ok')::boolean, false) is distinct from true then
    return v_val;
  end if;

  if exists (
    select 1 from public.account_deletion d
    where d.user_id = v_uid and d.processed_at is null
  ) then
    return jsonb_build_object('ok', true, 'queued', true);
  end if;

  insert into public.account_deletion (user_id, email)
  values (v_uid, nullif(v_email_norm, ''));

  return jsonb_build_object('ok', true, 'queued', true);
end;
$$;

grant execute on function public.account_deletion_enqueue(text) to authenticated;

create or replace function billing.create_org_checkout(
  p_actor_user_id uuid,
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
language plpgsql
security definer
set search_path = billing, license, public, auth
as $$
declare
  v_now timestamptz := now();
  v_period_end timestamptz;
  v_due_date timestamptz;
  v_account_id uuid;
  v_subscription_id uuid;
  v_checkout_id uuid;
  v_existing_checkout billing.checkout_sessions%rowtype;
  v_is_admin boolean;
  v_responsible_email text;
  v_assigned_count int := 0;
  v_unassigned_count int := 0;
  v_target_unassigned int := 0;
begin
  if p_actor_user_id is null then
    raise exception 'Missing actor user id';
  end if;

  if p_organization_id is null then
    raise exception 'Missing organization id';
  end if;

  if p_quantity is null or p_quantity < 3 then
    raise exception 'Organization licenses require at least 3 seats';
  end if;

  if p_amount_cents is null or p_amount_cents <= 0 then
    raise exception 'Invalid amount';
  end if;

  if p_reference_id is null or length(trim(p_reference_id)) = 0 then
    raise exception 'Missing checkout reference id';
  end if;

  select exists(
    select 1
    from public.organization_administrators oa
    where oa.organization_id = p_organization_id
      and oa.user_id = p_actor_user_id
  ) into v_is_admin;

  if not coalesce(v_is_admin, false) then
    raise exception 'Not authorized to manage billing for organization %', p_organization_id;
  end if;

  select *
  into v_existing_checkout
  from billing.checkout_sessions
  where reference_id = p_reference_id
  for update;

  if found then
    if v_existing_checkout.plan <> 'org'
       or v_existing_checkout.organization_id is distinct from p_organization_id then
      raise exception 'Reference id already used for another checkout context';
    end if;

    if v_existing_checkout.subscription_id is not null then
      return v_existing_checkout.subscription_id;
    end if;
  end if;

  select u.email
  into v_responsible_email
  from auth.users u
  where u.id = p_actor_user_id;

  if v_responsible_email is null then
    select u.email
    into v_responsible_email
    from public.organization_administrators oa
    join auth.users u on u.id = oa.user_id
    where oa.organization_id = p_organization_id
      and u.email is not null
    order by oa.created_at asc
    limit 1;
  end if;

  select id
  into v_account_id
  from billing.accounts
  where organization_id = p_organization_id
    and kind = 'organization'
  limit 1;

  if v_account_id is null then
    insert into billing.accounts (kind, organization_id)
    values ('organization', p_organization_id)
    returning id into v_account_id;
  end if;

  select id
  into v_subscription_id
  from billing.subscriptions
  where account_id = v_account_id
    and provider = 'payrexx'
  order by created_at desc
  limit 1
  for update;

  if v_subscription_id is null then
    v_period_end := v_now + interval '1 year';
    insert into billing.subscriptions (
      account_id,
      provider,
      provider_subscription_id,
      status,
      amount_cents,
      currency,
      interval,
      seat_count,
      started_at,
      current_period_start,
      current_period_end,
      metadata,
      grace_days,
      suspend_at
    )
    values (
      v_account_id,
      'payrexx',
      coalesce(p_payrexx_gateway_id::text, p_reference_id),
      'active',
      p_amount_cents,
      p_currency,
      'year',
      p_quantity,
      v_now,
      v_now,
      v_period_end,
      jsonb_build_object(
        'plan', 'org',
        'organization_id', p_organization_id,
        'responsible_user_id', p_actor_user_id,
        'responsible_email', v_responsible_email,
        'reference_id', p_reference_id,
        'org_billing_status', 'active_unpaid'
      ) || coalesce(p_metadata, '{}'::jsonb),
      14,
      null
    )
    returning id into v_subscription_id;
  else
    update billing.subscriptions
    set status = 'active',
        amount_cents = p_amount_cents,
        currency = p_currency,
        interval = 'year',
        seat_count = p_quantity,
        provider_subscription_id = coalesce(provider_subscription_id, coalesce(p_payrexx_gateway_id::text, p_reference_id)),
        metadata = coalesce(metadata, '{}'::jsonb) || jsonb_build_object(
          'plan', 'org',
          'organization_id', p_organization_id,
          'responsible_user_id', p_actor_user_id,
          'responsible_email', v_responsible_email,
          'reference_id', p_reference_id,
          'org_billing_status', 'active_unpaid',
          'last_checkout_created_at', v_now
        ) || coalesce(p_metadata, '{}'::jsonb),
        suspend_at = null
    where id = v_subscription_id;
  end if;

  if v_existing_checkout.id is null then
    insert into billing.checkout_sessions (
      user_id,
      organization_id,
      plan,
      quantity,
      amount_cents,
      currency,
      status,
      payrexx_gateway_id,
      payrexx_gateway_hash,
      payrexx_gateway_link,
      reference_id,
      subscription_id,
      metadata,
      expires_at
    )
    values (
      p_actor_user_id,
      p_organization_id,
      'org',
      p_quantity,
      p_amount_cents,
      p_currency,
      'pending',
      p_payrexx_gateway_id,
      p_payrexx_gateway_hash,
      p_payrexx_gateway_link,
      p_reference_id,
      v_subscription_id,
      jsonb_build_object(
        'source', 'org_checkout_api',
        'plan', 'org',
        'actor_user_id', p_actor_user_id
      ) || coalesce(p_metadata, '{}'::jsonb),
      p_expires_at
    )
    returning id into v_checkout_id;
  else
    update billing.checkout_sessions
    set user_id = p_actor_user_id,
        organization_id = p_organization_id,
        quantity = p_quantity,
        amount_cents = p_amount_cents,
        currency = p_currency,
        status = 'pending',
        payrexx_gateway_id = coalesce(payrexx_gateway_id, p_payrexx_gateway_id),
        payrexx_gateway_hash = coalesce(payrexx_gateway_hash, p_payrexx_gateway_hash),
        payrexx_gateway_link = coalesce(payrexx_gateway_link, p_payrexx_gateway_link),
        subscription_id = v_subscription_id,
        metadata = coalesce(metadata, '{}'::jsonb) || coalesce(p_metadata, '{}'::jsonb),
        expires_at = coalesce(p_expires_at, expires_at)
    where id = v_existing_checkout.id
    returning id into v_checkout_id;
  end if;

  v_due_date := coalesce(p_due_date, v_now + interval '30 days');
  insert into billing.invoices (
    subscription_id,
    amount_cents,
    currency,
    status,
    provider_invoice_id,
    due_date,
    paid_at,
    issued_at,
    checkout_session_id
  )
  values (
    v_subscription_id,
    p_amount_cents,
    p_currency,
    'open',
    null,
    v_due_date,
    null,
    v_now,
    v_checkout_id
  );

  select count(*)::int
  into v_assigned_count
  from license.entitlements e
  where e.billing_subscription_id = v_subscription_id
    and e.kind = 'org_seat'
    and e.status = 'active'
    and e.user_id is not null;

  if v_assigned_count > p_quantity then
    raise exception 'Cannot reduce seats below already assigned members (% assigned, % requested)',
      v_assigned_count, p_quantity;
  end if;

  select count(*)::int
  into v_unassigned_count
  from license.entitlements e
  where e.billing_subscription_id = v_subscription_id
    and e.kind = 'org_seat'
    and e.status = 'active'
    and e.user_id is null;

  v_target_unassigned := greatest(p_quantity - v_assigned_count, 0);

  if v_unassigned_count < v_target_unassigned then
    insert into license.entitlements (
      user_id,
      organization_id,
      kind,
      source,
      status,
      valid_from,
      valid_until,
      billing_subscription_id
    )
    select
      null,
      p_organization_id,
      'org_seat',
      'payrexx',
      'active',
      v_now,
      null,
      v_subscription_id
    from generate_series(1, v_target_unassigned - v_unassigned_count);
  elsif v_unassigned_count > v_target_unassigned then
    with to_expire as (
      select e.id
      from license.entitlements e
      where e.billing_subscription_id = v_subscription_id
        and e.kind = 'org_seat'
        and e.status = 'active'
        and e.user_id is null
      order by e.created_at desc, e.id desc
      limit (v_unassigned_count - v_target_unassigned)
    )
    update license.entitlements e
    set status = 'expired',
        revocation_reason = null,
        updated_at = v_now
    where e.id in (select id from to_expire);
  end if;

  return v_subscription_id;
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

create or replace function billing.accept_org_member_invite(
  p_actor_user_id uuid,
  p_organization_id int
) returns uuid
language plpgsql
security definer
set search_path = billing, license, public, auth
as $$
declare
  v_now timestamptz := now();
  v_actor_email text;
  v_invite license.org_invites%rowtype;
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

  select lower(u.email)
  into v_actor_email
  from auth.users u
  where u.id = p_actor_user_id;

  if v_actor_email is null then
    raise exception 'User email not available';
  end if;

  select *
  into v_invite
  from license.org_invites oi
  where oi.organization_id = p_organization_id
    and lower(oi.email) = v_actor_email
    and oi.status = 'pending'
  order by oi.created_at desc
  limit 1
  for update;

  if not found then
    raise exception 'No pending invite found for this organization';
  end if;

  if v_invite.expires_at is not null and v_invite.expires_at < v_now then
    update license.org_invites
    set status = 'expired'
    where id = v_invite.id;
    raise exception 'Invite has expired';
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
    update public.organization_members om
    set status = 'active',
        user_id = p_actor_user_id
    where om.id = v_membership_id;
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

  if v_entitlement_id is null then
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
  end if;

  update license.org_invites oi
  set status = 'accepted',
      accepted_at = v_now
  where oi.id = v_invite.id;

  return v_entitlement_id;
end;
$$;

create or replace function billing.reject_org_member_invite(
  p_actor_user_id uuid,
  p_organization_id int
) returns uuid
language plpgsql
security definer
set search_path = billing, license, public, auth
as $$
declare
  v_actor_email text;
  v_invite_id uuid;
begin
  if p_actor_user_id is null then
    raise exception 'Missing actor user id';
  end if;
  if p_organization_id is null then
    raise exception 'Missing organization id';
  end if;

  select lower(u.email)
  into v_actor_email
  from auth.users u
  where u.id = p_actor_user_id;

  if v_actor_email is null then
    raise exception 'User email not available';
  end if;

  select oi.id
  into v_invite_id
  from license.org_invites oi
  where oi.organization_id = p_organization_id
    and lower(oi.email) = v_actor_email
    and oi.status = 'pending'
  order by oi.created_at desc
  limit 1
  for update;

  if v_invite_id is null then
    raise exception 'No pending invite found for this organization';
  end if;

  update license.org_invites
  set status = 'canceled'
  where id = v_invite_id;

  update public.organization_members
  set status = 'rejected'
  where organization_id = p_organization_id
    and lower(user_email) = v_actor_email;

  return v_invite_id;
end;
$$;

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
      set user_id = null,
          updated_at = now(),
          revocation_reason = null
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

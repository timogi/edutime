-- Legacy org migration: no synthetic paid invoices (billing was off-platform until renewal_at).
-- renewal_at -> subscriptions.current_period_end; first Payrexx invoice via org-billing-jobs.

create or replace function billing.migrate_one_legacy_organization(p_organization_id bigint)
returns jsonb
language plpgsql
security definer
set search_path = billing, license, public, auth
as $$
declare
  v_now timestamptz := now();
  v_org public.organizations%rowtype;
  v_plan billing.org_legacy_migration_plan%rowtype;
  v_is_free boolean := false;
  v_actor_user_id uuid;
  v_responsible_email text;
  v_seat_users int;
  v_seat_count int;
  v_amount_cents int;
  v_currency text;
  v_renewal_at timestamptz;
  v_period_start timestamptz;
  v_reference_id text;
  v_account_id uuid;
  v_subscription_id uuid;
  v_invoice_id uuid;
  v_subscription_meta jsonb;
  v_backfill jsonb;
  v_invite record;
  v_member record;
  v_existing_invite_id uuid;
  v_created_invites int := 0;
  v_skipped_invites int := 0;
  v_created_entitlements int := 0;
  v_skipped_entitlements int := 0;
  v_plan_org_id int;
begin
  if p_organization_id is null then
    raise exception 'Missing organization id';
  end if;

  v_plan_org_id := p_organization_id::int;

  select *
  into v_org
  from public.organizations o
  where o.id = p_organization_id;

  if not found then
    raise exception 'Organization % not found', p_organization_id;
  end if;

  insert into billing.org_legacy_migration_plan (organization_id, seat_count)
  values (v_plan_org_id, billing.compute_org_legacy_seat_count(p_organization_id))
  on conflict (organization_id) do update
  set seat_count = billing.compute_org_legacy_seat_count(p_organization_id);

  select *
  into v_plan
  from billing.org_legacy_migration_plan p
  where p.organization_id = v_plan_org_id
  for update;

  if not coalesce(v_plan.migrate, false) then
    return jsonb_build_object(
      'organization_id', p_organization_id,
      'migrated', false,
      'reason', 'migrate=false'
    );
  end if;

  v_backfill := billing.backfill_organization_member_user_ids(array[p_organization_id]);

  insert into billing.org_legacy_migration_plan (organization_id, seat_count)
  values (v_plan_org_id, billing.compute_org_legacy_seat_count(p_organization_id))
  on conflict (organization_id) do update
  set seat_count = billing.compute_org_legacy_seat_count(p_organization_id);

  v_is_free := coalesce(v_plan.is_free, false);

  if v_is_free then
    v_amount_cents := coalesce(v_plan.annual_amount_cents, 0);
    v_renewal_at := coalesce(v_plan.renewal_at, v_now + interval '10 years');
  else
    if v_plan.annual_amount_cents is null or v_plan.annual_amount_cents <= 0 then
      raise exception
        'Organization %: set annual_amount_cents before migrating (or set is_free=true)',
        p_organization_id;
    end if;

    if v_plan.renewal_at is null then
      raise exception
        'Organization %: set renewal_at before migrating (or set is_free=true)',
        p_organization_id;
    end if;

    v_amount_cents := v_plan.annual_amount_cents;
    v_renewal_at := v_plan.renewal_at;
  end if;

  v_actor_user_id := billing.pick_org_migration_actor(p_organization_id);
  if v_actor_user_id is null then
    raise exception
      'Organization %: no admin user found (set actor_user_id on the plan row)',
      p_organization_id;
  end if;

  select u.email
  into v_responsible_email
  from auth.users u
  where u.id = v_actor_user_id;

  v_currency := coalesce(nullif(trim(v_plan.currency), ''), 'CHF');
  v_period_start := v_renewal_at - interval '1 year';
  if v_period_start > v_now then
    v_period_start := v_now;
  end if;

  v_seat_users := billing.count_org_legacy_seat_users(p_organization_id);
  v_seat_count := greatest(
    billing.compute_org_legacy_seat_count(p_organization_id),
    coalesce(v_plan.seat_count, 0)
  );

  if v_seat_count < v_seat_users then
    raise exception
      'Organization %: seat_count (%) is below users needing a seat (%)',
      p_organization_id, v_seat_count, v_seat_users;
  end if;

  update billing.org_legacy_migration_plan
  set seat_count = v_seat_count,
      annual_amount_cents = case when v_is_free then v_amount_cents else annual_amount_cents end,
      renewal_at = case when v_is_free then v_renewal_at else renewal_at end
  where organization_id = v_plan_org_id;

  v_reference_id := format('org-legacy-migration-%s', p_organization_id);

  v_subscription_meta := jsonb_build_object(
    'plan', 'org',
    'organization_id', p_organization_id,
    'responsible_user_id', v_actor_user_id,
    'responsible_email', v_responsible_email,
    'reference_id', v_reference_id,
    'org_billing_status', 'active_paid',
    'source', 'legacy_org_migration',
    'legacy_migrated_at', v_now,
    'is_free', v_is_free
  ) || coalesce(v_plan.metadata, '{}'::jsonb);

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

  select s.id
  into v_subscription_id
  from billing.subscriptions s
  where s.account_id = v_account_id
    and s.provider = 'payrexx'
  order by s.created_at desc
  limit 1
  for update;

  if v_subscription_id is null then
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
      v_reference_id,
      'active',
      v_amount_cents,
      v_currency,
      'year',
      v_seat_count,
      v_period_start,
      v_period_start,
      v_renewal_at,
      v_subscription_meta,
      45,
      null
    )
    returning id into v_subscription_id;
  else
    update billing.subscriptions s
    set status = 'active',
        amount_cents = v_amount_cents,
        currency = v_currency,
        interval = 'year',
        seat_count = v_seat_count,
        current_period_start = v_period_start,
        current_period_end = v_renewal_at,
        provider_subscription_id = coalesce(s.provider_subscription_id, v_reference_id),
        suspend_at = null,
        metadata = coalesce(s.metadata, '{}'::jsonb) || v_subscription_meta
          || jsonb_build_object(
            'responsible_email',
            coalesce(v_responsible_email, s.metadata ->> 'responsible_email')
          )
    where s.id = v_subscription_id;
  end if;

  update public.organizations o
  set seats = v_seat_count
  where o.id = p_organization_id;

  -- Legacy orgs were billed off-platform. Do not insert synthetic paid invoices.
  -- org-billing-jobs creates the first open invoice/checkout when current_period_end is reached.
  update billing.invoices i
  set status = 'void'
  where i.subscription_id = v_subscription_id
    and coalesce(i.provider_invoice_id, '') like 'org-legacy-migration-%';

  v_invoice_id := null;

  for v_member in
    select distinct u.user_id
    from (
      select om.user_id
      from public.organization_members om
      where om.organization_id = p_organization_id
        and om.status = 'active'
        and om.user_id is not null
      union
      select oa.user_id
      from public.organization_administrators oa
      where oa.organization_id = p_organization_id
        and oa.user_id is not null
    ) u
  loop
    if exists (
      select 1
      from license.entitlements e
      where e.organization_id = p_organization_id
        and e.user_id = v_member.user_id
        and e.kind = 'org_seat'
        and e.status = 'active'
        and e.valid_from <= v_now
        and (e.valid_until is null or e.valid_until >= now())
    ) then
      v_skipped_entitlements := v_skipped_entitlements + 1;
      continue;
    end if;

    if (
      select count(*)::int
      from license.entitlements e
      where e.billing_subscription_id = v_subscription_id
        and e.kind = 'org_seat'
        and e.status = 'active'
    ) >= v_seat_count then
      raise exception
        'Organization %: no seats left for user % (%/% used)',
        p_organization_id, v_member.user_id, v_seat_users, v_seat_count;
    end if;

    insert into license.entitlements (
      user_id,
      organization_id,
      kind,
      source,
      status,
      valid_from,
      valid_until,
      billing_subscription_id,
      revocation_reason
    )
    values (
      v_member.user_id,
      p_organization_id,
      'org_seat',
      'payrexx',
      'active',
      v_now,
      null,
      v_subscription_id,
      null
    );

    v_created_entitlements := v_created_entitlements + 1;
  end loop;

  for v_invite in
    select distinct lower(trim(om.user_email)) as email
    from public.organization_members om
    where om.organization_id = p_organization_id
      and om.status = 'invited'
      and om.user_email is not null
      and length(trim(om.user_email)) > 3
      and om.user_id is null
  loop
    select oi.id
    into v_existing_invite_id
    from license.org_invites oi
    where oi.organization_id = p_organization_id
      and lower(oi.email) = v_invite.email
      and oi.status = 'pending'
    order by oi.created_at desc
    limit 1;

    if v_existing_invite_id is not null then
      v_skipped_invites := v_skipped_invites + 1;
    else
      insert into license.org_invites (
        organization_id,
        email,
        role,
        token,
        status,
        expires_at
      )
      values (
        p_organization_id,
        v_invite.email,
        'member',
        md5(
          random()::text ||
          clock_timestamp()::text ||
          p_organization_id::text ||
          v_invite.email
        ),
        'pending',
        v_renewal_at
      );

      update public.organization_members om
      set status = 'invited'
      where om.organization_id = p_organization_id
        and lower(om.user_email) = v_invite.email;

      v_created_invites := v_created_invites + 1;
    end if;
  end loop;

  update billing.org_legacy_migration_plan
  set metadata = coalesce(metadata, '{}'::jsonb) || jsonb_build_object(
    'last_migrated_at', v_now,
    'last_subscription_id', v_subscription_id,
    'last_created_entitlements', v_created_entitlements,
    'last_is_free', v_is_free,
    'last_member_user_id_backfill', v_backfill
  )
  where organization_id = v_plan_org_id;

  return jsonb_build_object(
    'organization_id', p_organization_id,
    'migrated', true,
    'is_free', v_is_free,
    'member_user_id_backfill', v_backfill,
    'subscription_id', v_subscription_id,
    'seat_count', v_seat_count,
    'seat_users', v_seat_users,
    'amount_cents', v_amount_cents,
    'currency', v_currency,
    'renewal_at', v_renewal_at,
    'created_entitlements', v_created_entitlements,
    'skipped_existing_entitlements', v_skipped_entitlements,
    'created_invites', v_created_invites,
    'skipped_existing_pending_invites', v_skipped_invites
  );
end;
$$;

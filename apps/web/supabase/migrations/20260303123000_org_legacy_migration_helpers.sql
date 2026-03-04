-- Legacy organization migration helpers
-- ------------------------------------------------------------
-- Goal:
-- - Idempotent migration support for existing organizations.
-- - Reuse existing org billing flow (subscription + invoice + entitlements).
-- - Create pending invites for legacy invited members.
-- - Allow custom annual price + seat count per org via Supabase GUI.
--
-- Suggested usage:
-- 1) select billing.seed_org_legacy_migration_plan();
-- 2) In billing.org_legacy_migration_plan:
--      - set migrate = true for orgs that should be migrated
--      - keep migrate = false for demo orgs
--      - set custom_seat_count / custom_annual_amount_cents when needed
-- 3) select billing.run_org_legacy_migration();
-- 4) Re-run step 3 safely whenever needed.

create table if not exists billing.org_legacy_migration_plan (
  organization_id int primary key references public.organizations(id) on delete cascade,
  migrate boolean not null default false,
  actor_user_id uuid null references auth.users(id),
  custom_seat_count int null check (custom_seat_count is null or custom_seat_count >= 3),
  custom_annual_amount_cents int null check (custom_annual_amount_cents is null or custom_annual_amount_cents > 0),
  currency text not null default 'CHF',
  due_date timestamptz null,
  migrate_invites boolean not null default true,
  note text null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function billing.set_org_legacy_migration_plan_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_org_legacy_migration_plan_set_updated_at on billing.org_legacy_migration_plan;
create trigger trg_org_legacy_migration_plan_set_updated_at
before update on billing.org_legacy_migration_plan
for each row
execute function billing.set_org_legacy_migration_plan_updated_at();

create or replace function billing.seed_org_legacy_migration_plan()
returns int
language plpgsql
security definer
set search_path = billing, public, auth
as $$
declare
  v_inserted int := 0;
begin
  insert into billing.org_legacy_migration_plan (organization_id)
  select o.id
  from public.organizations o
  on conflict (organization_id) do nothing;

  get diagnostics v_inserted = row_count;
  return v_inserted;
end;
$$;

create or replace function billing.pick_org_migration_actor(p_organization_id int)
returns uuid
language plpgsql
security definer
set search_path = billing, public, auth
as $$
declare
  v_actor_user_id uuid;
begin
  select p.actor_user_id
  into v_actor_user_id
  from billing.org_legacy_migration_plan p
  where p.organization_id = p_organization_id;

  if v_actor_user_id is not null then
    return v_actor_user_id;
  end if;

  select oa.user_id
  into v_actor_user_id
  from public.organization_administrators oa
  where oa.organization_id = p_organization_id
    and oa.user_id is not null
  order by oa.created_at asc
  limit 1;

  return v_actor_user_id;
end;
$$;

create or replace function billing.resolve_org_migration_amount(
  p_organization_id int,
  p_custom_amount_cents int
) returns int
language plpgsql
security definer
set search_path = billing, public, auth
as $$
declare
  v_amount_cents int;
begin
  if p_custom_amount_cents is not null and p_custom_amount_cents > 0 then
    return p_custom_amount_cents;
  end if;

  select s.amount_cents
  into v_amount_cents
  from billing.accounts a
  join billing.subscriptions s on s.account_id = a.id
  where a.kind = 'organization'
    and a.organization_id = p_organization_id
    and s.provider = 'payrexx'
  order by s.created_at desc
  limit 1;

  -- Placeholder amount when no custom amount exists yet.
  -- This keeps migration unblockable; amount can be corrected manually later.
  return coalesce(v_amount_cents, 100);
end;
$$;

create or replace function billing.migrate_one_legacy_organization(p_organization_id int)
returns jsonb
language plpgsql
security definer
set search_path = billing, license, public, auth
as $$
declare
  v_org public.organizations%rowtype;
  v_plan billing.org_legacy_migration_plan%rowtype;
  v_actor_user_id uuid;
  v_seat_count int;
  v_amount_cents int;
  v_currency text;
  v_due_date timestamptz;
  v_reference_id text;
  v_subscription_id uuid;
  v_open_invoice_id uuid;
  v_invite record;
  v_existing_pending_invite_id uuid;
  v_created_invites int := 0;
  v_skipped_invites int := 0;
  v_is_placeholder_amount boolean := false;
begin
  if p_organization_id is null then
    raise exception 'Missing organization id';
  end if;

  select *
  into v_org
  from public.organizations o
  where o.id = p_organization_id;

  if not found then
    raise exception 'Organization % not found', p_organization_id;
  end if;

  insert into billing.org_legacy_migration_plan (organization_id)
  values (p_organization_id)
  on conflict (organization_id) do nothing;

  select *
  into v_plan
  from billing.org_legacy_migration_plan p
  where p.organization_id = p_organization_id
  for update;

  if not coalesce(v_plan.migrate, false) then
    return jsonb_build_object(
      'organization_id', p_organization_id,
      'migrated', false,
      'reason', 'migrate=false'
    );
  end if;

  v_actor_user_id := billing.pick_org_migration_actor(p_organization_id);
  if v_actor_user_id is null then
    raise exception 'No actor_user_id available for organization % (set it in billing.org_legacy_migration_plan)', p_organization_id;
  end if;

  v_seat_count := greatest(coalesce(v_plan.custom_seat_count, v_org.seats, 3), 3);
  v_amount_cents := billing.resolve_org_migration_amount(p_organization_id, v_plan.custom_annual_amount_cents);
  v_currency := coalesce(nullif(trim(v_plan.currency), ''), 'CHF');
  v_due_date := v_plan.due_date;
  v_reference_id := format('org-legacy-migration-%s', p_organization_id);
  v_is_placeholder_amount := v_plan.custom_annual_amount_cents is null;

  v_subscription_id := billing.create_org_checkout(
    p_actor_user_id => v_actor_user_id,
    p_organization_id => p_organization_id,
    p_quantity => v_seat_count,
    p_amount_cents => v_amount_cents,
    p_currency => v_currency,
    p_reference_id => v_reference_id,
    p_payrexx_gateway_id => null,
    p_payrexx_gateway_link => null,
    p_payrexx_gateway_hash => null,
    p_expires_at => null,
    p_due_date => v_due_date,
    p_metadata => jsonb_build_object(
      'source', 'legacy_org_migration',
      'manual_payment', true,
      'custom_price_pending', v_is_placeholder_amount,
      'requested_seat_count', v_seat_count
    ) || coalesce(v_plan.metadata, '{}'::jsonb)
  );

  -- Ensure only one open migration invoice per subscription (idempotent re-runs).
  with ranked_open as (
    select i.id,
           row_number() over (order by i.created_at asc, i.id asc) as rn
    from billing.invoices i
    where i.subscription_id = v_subscription_id
      and i.status = 'open'
  )
  update billing.invoices i
  set status = 'canceled'
  from ranked_open ro
  where i.id = ro.id
    and ro.rn > 1;

  select i.id
  into v_open_invoice_id
  from billing.invoices i
  where i.subscription_id = v_subscription_id
    and i.status = 'open'
  order by i.created_at desc
  limit 1;

  if coalesce(v_plan.migrate_invites, true) then
    for v_invite in
      select distinct lower(trim(om.user_email)) as email
      from public.organization_members om
      where om.organization_id = p_organization_id
        and om.status = 'invited'
        and om.user_email is not null
        and length(trim(om.user_email)) > 3
    loop
      select oi.id
      into v_existing_pending_invite_id
      from license.org_invites oi
      where oi.organization_id = p_organization_id
        and lower(oi.email) = v_invite.email
        and oi.status = 'pending'
      order by oi.created_at desc
      limit 1;

      if v_existing_pending_invite_id is not null then
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
          md5(random()::text || clock_timestamp()::text || p_organization_id::text || v_invite.email),
          'pending',
          now() + interval '30 days'
        );

        update public.organization_members
        set status = 'invited'
        where organization_id = p_organization_id
          and lower(user_email) = v_invite.email;

        v_created_invites := v_created_invites + 1;
      end if;
    end loop;
  end if;

  update billing.subscriptions s
  set metadata = coalesce(s.metadata, '{}'::jsonb) || jsonb_build_object(
    'org_billing_status', 'active_unpaid',
    'legacy_migrated_at', now(),
    'legacy_migrated_by', 'billing.migrate_one_legacy_organization',
    'custom_price_pending', v_is_placeholder_amount
  )
  where s.id = v_subscription_id;

  update billing.org_legacy_migration_plan
  set metadata = coalesce(metadata, '{}'::jsonb) || jsonb_build_object(
    'last_migrated_at', now(),
    'last_subscription_id', v_subscription_id,
    'last_open_invoice_id', v_open_invoice_id
  )
  where organization_id = p_organization_id;

  return jsonb_build_object(
    'organization_id', p_organization_id,
    'migrated', true,
    'subscription_id', v_subscription_id,
    'open_invoice_id', v_open_invoice_id,
    'seat_count', v_seat_count,
    'amount_cents', v_amount_cents,
    'currency', v_currency,
    'custom_price_pending', v_is_placeholder_amount,
    'created_invites', v_created_invites,
    'skipped_existing_pending_invites', v_skipped_invites
  );
end;
$$;

create or replace function billing.run_org_legacy_migration(
  p_organization_ids int[] default null
) returns jsonb
language plpgsql
security definer
set search_path = billing, public, auth
as $$
declare
  v_org_id int;
  v_result jsonb;
  v_results jsonb := '[]'::jsonb;
begin
  perform billing.seed_org_legacy_migration_plan();

  for v_org_id in
    select p.organization_id
    from billing.org_legacy_migration_plan p
    where p.migrate = true
      and (p_organization_ids is null or p.organization_id = any(p_organization_ids))
    order by p.organization_id asc
  loop
    begin
      v_result := billing.migrate_one_legacy_organization(v_org_id);
      v_results := v_results || jsonb_build_array(v_result);
    exception
      when others then
        v_results := v_results || jsonb_build_array(jsonb_build_object(
          'organization_id', v_org_id,
          'migrated', false,
          'error', sqlerrm
        ));
    end;
  end loop;

  return v_results;
end;
$$;

create or replace function billing.set_org_custom_price_and_seats(
  p_organization_id int,
  p_seat_count int,
  p_amount_cents int,
  p_currency text default 'CHF'
) returns uuid
language plpgsql
security definer
set search_path = billing, public, auth
as $$
declare
  v_subscription_id uuid;
begin
  if p_organization_id is null then
    raise exception 'Missing organization id';
  end if;
  if p_seat_count is null or p_seat_count < 3 then
    raise exception 'Seat count must be at least 3';
  end if;
  if p_amount_cents is null or p_amount_cents <= 0 then
    raise exception 'Amount must be > 0';
  end if;

  select s.id
  into v_subscription_id
  from billing.accounts a
  join billing.subscriptions s on s.account_id = a.id
  where a.kind = 'organization'
    and a.organization_id = p_organization_id
    and s.provider = 'payrexx'
  order by s.created_at desc
  limit 1
  for update;

  if v_subscription_id is null then
    raise exception 'No organization subscription found';
  end if;

  update billing.subscriptions s
  set seat_count = p_seat_count,
      amount_cents = p_amount_cents,
      currency = coalesce(nullif(trim(p_currency), ''), s.currency),
      metadata = coalesce(s.metadata, '{}'::jsonb) || jsonb_build_object(
        'custom_price_pending', false,
        'custom_price_set_manually', true,
        'custom_price_set_at', now()
      )
  where s.id = v_subscription_id;

  update public.organizations o
  set seats = p_seat_count
  where o.id = p_organization_id;

  update billing.org_legacy_migration_plan p
  set custom_seat_count = p_seat_count,
      custom_annual_amount_cents = p_amount_cents,
      currency = coalesce(nullif(trim(p_currency), ''), p.currency)
  where p.organization_id = p_organization_id;

  return v_subscription_id;
end;
$$;

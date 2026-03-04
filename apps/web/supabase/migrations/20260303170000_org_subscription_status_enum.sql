-- Migrate org billing status from free text to enum semantics.
-- Keep billing.subscriptions.status untouched (shared with non-org flows),
-- but strongly type the org-specific status exposed by billing.get_org_billing_status.

do $$
begin
  if not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where t.typname = 'org_subscription_status'
      and n.nspname = 'billing'
  ) then
    create type billing.org_subscription_status as enum ('active', 'active_unpaid', 'suspended');
  end if;
end
$$;

-- Normalize legacy metadata values to enum-compatible values.
update billing.subscriptions
set metadata = jsonb_set(coalesce(metadata, '{}'::jsonb), '{org_billing_status}', to_jsonb('active'::text), true)
where coalesce(metadata ->> 'plan', '') = 'org'
  and coalesce(metadata ->> 'org_billing_status', '') in ('active_paid', 'paid');

update billing.subscriptions
set metadata = jsonb_set(
  coalesce(metadata, '{}'::jsonb),
  '{org_billing_status}',
  to_jsonb('active_unpaid'::text),
  true
)
where coalesce(metadata ->> 'plan', '') = 'org'
  and coalesce(metadata ->> 'org_billing_status', '') in ('unpaid', 'payment_pending', 'pending_payment');

-- Return type changes require dropping the previous function first.
drop function if exists billing.get_org_billing_status(uuid, int);

create function billing.get_org_billing_status(
  p_actor_user_id uuid,
  p_organization_id int
) returns table (
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
language plpgsql
security definer
set search_path = billing, public, auth
as $$
declare
  v_is_admin boolean;
begin
  if p_actor_user_id is null then
    raise exception 'Missing actor user id';
  end if;

  select exists(
    select 1
    from public.organization_administrators oa
    where oa.organization_id = p_organization_id
      and oa.user_id = p_actor_user_id
  ) into v_is_admin;

  if not coalesce(v_is_admin, false) then
    raise exception 'Not authorized to read billing status for organization %', p_organization_id;
  end if;

  return query
  with org_account as (
    select a.id
    from billing.accounts a
    where a.organization_id = p_organization_id
      and a.kind = 'organization'
    order by a.created_at desc
    limit 1
  ),
  org_subscription as (
    select s.*
    from billing.subscriptions s
    where s.account_id in (select id from org_account)
      and s.provider = 'payrexx'
    order by s.created_at desc
    limit 1
  ),
  latest_invoice as (
    select i.*
    from billing.invoices i
    where i.subscription_id in (select id from org_subscription)
    order by i.created_at desc
    limit 1
  ),
  latest_checkout as (
    select c.*
    from billing.checkout_sessions c
    where c.subscription_id in (select id from org_subscription)
      and c.plan = 'org'
    order by c.created_at desc
    limit 1
  )
  select
    s.id,
    (
      case
        when coalesce(s.metadata ->> 'org_billing_status', '') = 'suspended'
          or (s.suspend_at is not null and s.suspend_at <= now())
          then 'suspended'
        when coalesce(s.metadata ->> 'org_billing_status', '') in ('active_unpaid', 'unpaid', 'payment_pending', 'pending_payment')
          then 'active_unpaid'
        when coalesce(s.metadata ->> 'org_billing_status', '') in ('active', 'active_paid', 'paid')
          then 'active'
        when i.status in ('open', 'draft', 'failed')
          then 'active_unpaid'
        else 'active'
      end
    )::billing.org_subscription_status as subscription_status,
    s.amount_cents,
    s.currency,
    s.seat_count,
    s.current_period_start,
    s.current_period_end,
    s.grace_days,
    s.suspend_at,
    i.id,
    i.status,
    i.due_date,
    i.paid_at,
    c.payrexx_gateway_link,
    c.reference_id,
    coalesce(s.metadata ->> 'responsible_email', null)
  from org_subscription s
  left join latest_invoice i on true
  left join latest_checkout c on true;
end;
$$;

grant execute on function billing.get_org_billing_status(uuid, int) to service_role;

-- AGB / Terms version 1.1 (22 May 2026) and idempotent purchase confirmation email claim.

insert into legal.document_versions (document_code, version_label, effective_at)
values
  ('saas_agb', '1.1 (22. Mai 2026)', now()),
  ('terms_of_use', '1.1 (22. Mai 2026)', now());

create or replace function billing.claim_checkout_purchase_confirmation_email(p_reference_id text)
returns jsonb
language plpgsql
security definer
set search_path = billing, public, auth
as $$
declare
  v_sess billing.checkout_sessions%rowtype;
  v_meta jsonb;
  v_email text;
  v_locale text;
  v_period_end timestamptz;
  v_org_name text;
begin
  if p_reference_id is null or length(trim(p_reference_id)) = 0 then
    return jsonb_build_object('claimed', false, 'reason', 'missing_reference');
  end if;

  select *
  into v_sess
  from billing.checkout_sessions
  where reference_id = trim(p_reference_id)
  for update;

  if not found then
    return jsonb_build_object('claimed', false, 'reason', 'not_found');
  end if;

  if v_sess.status <> 'completed' then
    return jsonb_build_object('claimed', false, 'reason', 'not_completed');
  end if;

  v_meta := coalesce(v_sess.metadata, '{}'::jsonb);
  if v_meta ? 'purchase_confirmation_email_sent_at' then
    return jsonb_build_object('claimed', false, 'reason', 'already_sent');
  end if;

  select u.email
  into v_email
  from auth.users u
  where u.id = v_sess.user_id;

  if v_email is null or length(trim(v_email)) = 0 then
    return jsonb_build_object('claimed', false, 'reason', 'missing_email');
  end if;

  select coalesce(nullif(trim(pu.language), ''), 'de')
  into v_locale
  from public.users pu
  where pu.user_id = v_sess.user_id;

  v_locale := coalesce(v_locale, 'de');
  if v_locale not in ('de', 'en', 'fr') then
    v_locale := 'de';
  end if;

  if v_sess.subscription_id is not null then
    select s.current_period_end
    into v_period_end
    from billing.subscriptions s
    where s.id = v_sess.subscription_id;
  end if;

  if v_sess.organization_id is not null then
    select o.name
    into v_org_name
    from public.organizations o
    where o.id = v_sess.organization_id;
  end if;

  update billing.checkout_sessions
  set
    metadata = v_meta || jsonb_build_object('purchase_confirmation_email_sent_at', now()),
    updated_at = now()
  where id = v_sess.id;

  return jsonb_build_object(
    'claimed', true,
    'email', v_email,
    'locale', v_locale,
    'plan', v_sess.plan,
    'organization_name', v_org_name,
    'period_end', v_period_end,
    'amount_cents', v_sess.amount_cents,
    'quantity', v_sess.quantity,
    'currency', v_sess.currency
  );
end;
$$;

revoke all on function billing.claim_checkout_purchase_confirmation_email(text) from public;
grant execute on function billing.claim_checkout_purchase_confirmation_email(text) to service_role;

create or replace function public.api_claim_checkout_purchase_confirmation_email(p_reference_id text)
returns jsonb
language plpgsql
security definer
set search_path = public, billing
as $$
declare
  v_uid uuid := auth.uid();
  v_owner uuid;
begin
  if v_uid is null then
    raise exception 'not_authenticated';
  end if;

  select c.user_id
  into v_owner
  from billing.checkout_sessions c
  where c.reference_id = trim(p_reference_id)
  limit 1;

  if v_owner is null then
    return jsonb_build_object('claimed', false, 'reason', 'not_found');
  end if;

  if v_owner is distinct from v_uid then
    raise exception 'not_authorized';
  end if;

  return billing.claim_checkout_purchase_confirmation_email(p_reference_id);
end;
$$;

revoke all on function public.api_claim_checkout_purchase_confirmation_email(text) from public;
grant execute on function public.api_claim_checkout_purchase_confirmation_email(text) to authenticated;

-- Simplify legal acceptance: app = terms_of_use only; checkout = saas_agb (user scope).
-- privacy_policy and avv are not tracked. p_organization_id is ignored for acceptance.

update legal.documents
set
  title = 'AGB',
  scope = 'user'
where code = 'saas_agb';

update legal.documents
set is_active = false
where code in ('saas_single_contract');

-- privacy_policy and avv stay published (is_active true) but are excluded from missing-doc checks.

create unique index if not exists uq_legal_acceptances_user_document_version
  on legal.acceptances (document_version_id, subject_user_id)
  where subject_organization_id is null;

-- Remove all legacy overloads (any schema/signature).
do $$
declare
  r record;
begin
  for r in
    select
      n.nspname as schema_name,
      p.proname as func_name,
      pg_get_function_identity_arguments(p.oid) as args
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where p.proname in ('legal_missing_documents', 'legal_accept_document')
      and n.nspname in ('public', 'legal')
  loop
    execute format(
      'drop function if exists %I.%I(%s) cascade',
      r.schema_name,
      r.func_name,
      r.args
    );
  end loop;
end;
$$;

create or replace function public.legal_missing_documents(
  p_context text,
  p_organization_id integer default null
)
returns table (
  code text,
  title text,
  version_label text,
  document_version_id bigint,
  scope legal.scope,
  organization_id integer,
  can_accept boolean
)
language plpgsql
security definer
set search_path = public, legal
as $$
declare
  v_user_id uuid := auth.uid();
  v_required_codes text[];
begin
  if v_user_id is null then
    raise exception 'not_authenticated';
  end if;

  case p_context
    when 'app' then
      v_required_codes := array['terms_of_use'];
    when 'checkout_individual', 'checkout_org' then
      v_required_codes := array['saas_agb'];
    else
      raise exception 'unknown_context';
  end case;

  return query
  select
    cv.code,
    coalesce(cv.title, d.title) as title,
    cv.version_label,
    cv.document_version_id,
    cv.scope,
    null::integer as organization_id,
    true as can_accept
  from legal.current_versions cv
  inner join legal.documents d on d.code = cv.code
  where cv.code = any (v_required_codes)
    and d.is_active = true
    and cv.scope = 'user'::legal.scope
    and cv.document_version_id is not null
    and not exists (
      select 1
      from legal.acceptances a
      where a.document_version_id = cv.document_version_id
        and a.subject_user_id = v_user_id
        and a.subject_organization_id is null
    );
end;
$$;

create or replace function public.legal_accept_document(
  p_code text,
  p_source text default 'web',
  p_organization_id integer default null
)
returns void
language plpgsql
security definer
set search_path = public, legal
as $$
declare
  v_user_id uuid := auth.uid();
  v_version_id bigint;
  v_scope legal.scope;
  v_trackable_codes constant text[] := array['terms_of_use', 'saas_agb'];
begin
  if v_user_id is null then
    raise exception 'not_authenticated';
  end if;

  if p_code is null or btrim(p_code) = '' or not (p_code = any (v_trackable_codes)) then
    raise exception 'unknown_document_code';
  end if;

  select cv.document_version_id, cv.scope
  into v_version_id, v_scope
  from legal.current_versions cv
  inner join legal.documents d on d.code = cv.code
  where cv.code = p_code
    and d.is_active = true
  limit 1;

  if v_version_id is null then
    raise exception 'unknown_document_code';
  end if;

  if v_scope is distinct from 'user'::legal.scope then
    raise exception 'invalid_document_scope';
  end if;

  insert into legal.acceptances (
    document_version_id,
    accepted_by,
    subject_user_id,
    subject_organization_id,
    source
  )
  values (
    v_version_id,
    v_user_id,
    v_user_id,
    null,
    coalesce(nullif(btrim(p_source), ''), 'web')
  )
  on conflict do nothing;
end;
$$;

revoke all on function public.legal_missing_documents(text, integer) from public;
revoke all on function public.legal_accept_document(text, text, integer) from public;

grant execute on function public.legal_missing_documents(text, integer) to authenticated;
grant execute on function public.legal_accept_document(text, text, integer) to authenticated;

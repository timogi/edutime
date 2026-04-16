-- Client reads for license.entitlements: authenticated users have no USAGE on schema license.
-- Expose the same logic as @edutime/shared licensing helpers via SECURITY DEFINER RPCs.

create or replace function public.api_user_has_active_entitlement()
returns boolean
language sql
security definer
set search_path = public, license
stable
as $$
  select exists(
    select 1
    from license.entitlements e
    where e.user_id = public.api_require_uid()
      and e.status = 'active'
      and e.valid_from <= now()
      and (e.valid_until is null or e.valid_until >= now())
  )
  or exists(
    select 1
    from license.entitlements e
    where e.user_id = public.api_require_uid()
      and e.status = 'active'
      and e.kind = 'personal'
      and (e.valid_until is null or e.valid_until >= now())
  );
$$;

create or replace function public.api_has_ever_had_trial()
returns boolean
language sql
security definer
set search_path = public, license
stable
as $$
  select exists(
    select 1
    from license.entitlements e
    where e.user_id = public.api_require_uid()
      and e.kind = 'trial'
  );
$$;

create or replace function public.api_get_my_entitlements()
returns jsonb
language sql
security definer
set search_path = public, license
stable
as $$
  select coalesce(
    (
      select jsonb_agg(to_jsonb(e) order by e.created_at desc)
      from license.entitlements e
      where e.user_id = public.api_require_uid()
    ),
    '[]'::jsonb
  );
$$;

grant execute on function public.api_user_has_active_entitlement() to authenticated;
grant execute on function public.api_has_ever_had_trial() to authenticated;
grant execute on function public.api_get_my_entitlements() to authenticated;

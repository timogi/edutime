-- Remove unused RPC (app gating uses entitlements only; org billing UX is handled in NoLicenseView).
drop function if exists public.user_has_active_license_access();

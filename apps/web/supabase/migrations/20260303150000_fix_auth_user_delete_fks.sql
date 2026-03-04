-- Ensure auth user deletion does not fail with FK violations.
-- We apply explicit delete behavior for all local references to auth.users.

-- Checkout sessions are user-owned and should be removed when the user is deleted.
alter table if exists billing.checkout_sessions
  drop constraint if exists checkout_sessions_user_id_fkey;

alter table if exists billing.checkout_sessions
  add constraint checkout_sessions_user_id_fkey
  foreign key (user_id)
  references auth.users(id)
  on delete cascade;

-- Keep invoices if checkout sessions are removed during user deletion.
alter table if exists billing.invoices
  drop constraint if exists invoices_checkout_session_id_fkey;

alter table if exists billing.invoices
  add constraint invoices_checkout_session_id_fkey
  foreign key (checkout_session_id)
  references billing.checkout_sessions(id)
  on delete set null;

-- Renewal reminders keep value without the user; nullable FK should be cleared.
alter table if exists billing.org_renewal_reminders
  drop constraint if exists org_renewal_reminders_recipient_user_id_fkey;

alter table if exists billing.org_renewal_reminders
  add constraint org_renewal_reminders_recipient_user_id_fkey
  foreign key (recipient_user_id)
  references auth.users(id)
  on delete set null;

-- Legacy migration plans may point to a historical actor; preserve row and clear user reference.
alter table if exists billing.org_legacy_migration_plan
  drop constraint if exists org_legacy_migration_plan_actor_user_id_fkey;

alter table if exists billing.org_legacy_migration_plan
  add constraint org_legacy_migration_plan_actor_user_id_fkey
  foreign key (actor_user_id)
  references auth.users(id)
  on delete set null;

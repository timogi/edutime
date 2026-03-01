-- Grants for web license-management APIs that read/update billing tables
-- with the service_role key via PostgREST.

grant usage on schema billing to service_role;
grant select on billing.accounts to service_role;
grant select, update on billing.subscriptions to service_role;
grant select on billing.invoices to service_role;

grant usage on schema license to service_role;
grant select on license.entitlements to service_role;

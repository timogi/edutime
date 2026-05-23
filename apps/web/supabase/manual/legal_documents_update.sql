-- =============================================================================
-- Legal — Supabase SQL Editor (run section A, then section B)
-- File mirror: migrations/20260522130000_legal_documents_simplify.sql
-- =============================================================================

-- A) documents table
update legal.documents
set
  title = 'AGB',
  scope = 'user'
where code = 'saas_agb';

update legal.documents
set is_active = false
where code in ('saas_single_contract');

-- privacy_policy + avv: keep is_active true (public /docs pages), not in legal_missing_documents

-- B) document versions (requires migration 20260524120000 or run insert below)
insert into legal.document_versions (document_code, version_label, effective_at)
values
  ('saas_agb', '1.1 (22. Mai 2026)', now()),
  ('terms_of_use', '1.1 (22. Mai 2026)', now());

-- C) RPCs (paste from migration or run migration deploy)
-- See: apps/web/supabase/migrations/20260522130000_legal_documents_simplify.sql

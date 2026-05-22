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

-- B) RPCs (paste from migration or run migration deploy)
-- See: apps/web/supabase/migrations/20260522130000_legal_documents_simplify.sql

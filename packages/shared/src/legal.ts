import type { SupabaseClient } from '@supabase/supabase-js'

export interface MissingDocument {
  code: string
  title: string
  version_label: string
  document_version_id: number
  scope: string
  can_accept: boolean
}

export type LegalContext = 'app' | 'checkout_individual'
export type LegalSource = 'web' | 'ios' | 'android' | 'register' | 'checkout'

export const DOCUMENT_ROUTES: Record<string, string> = {
  privacy_policy: '/docs/privacy',
  terms_of_use: '/docs/terms',
  saas_agb: '/docs/agb',
}

export const DOCUMENT_LABELS: Record<string, string> = {
  privacy_policy: 'Datenschutzbestimmungen',
  terms_of_use: 'Nutzungsbedingungen',
  saas_agb: 'SaaS AGB',
}

export async function getMissingUserDocuments(
  supabase: SupabaseClient,
  context: LegalContext,
): Promise<MissingDocument[]> {
  const { data, error } = await supabase.rpc('legal_missing_documents', {
    p_context: context,
  })
  if (error) throw error
  return (data || []).filter((doc: MissingDocument) => doc.scope === 'user')
}

export async function acceptUserDocument(
  supabase: SupabaseClient,
  code: string,
  source: LegalSource,
): Promise<void> {
  const { error } = await supabase.rpc('legal_accept_document', {
    p_code: code,
    p_source: source,
  })
  if (error) throw error
}

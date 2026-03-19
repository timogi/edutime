import type { SupabaseClient } from '@supabase/supabase-js'

export interface MissingDocument {
  code: string
  title: string
  version_label: string
  document_version_id: number
  scope: string
  organization_id?: number | null
  can_accept: boolean
}

export type LegalContext = 'app' | 'checkout_individual' | 'checkout_org'
export type LegalSource = 'web' | 'ios' | 'android' | 'register' | 'checkout'

export const DOCUMENT_ROUTES: Record<string, string> = {
  privacy_policy: '/docs/privacy',
  terms_of_use: '/docs/terms',
  saas_agb: '/docs/agb',
  avv: '/docs/avv',
}

export const DOCUMENT_LABELS: Record<string, string> = {
  privacy_policy: 'Datenschutzbestimmungen',
  terms_of_use: 'Nutzungsbedingungen',
  saas_agb: 'SaaS AGB',
  avv: 'Auftragsverarbeitungsvereinbarung (AVV)',
}

export async function getMissingDocuments(
  supabase: SupabaseClient,
  context: LegalContext,
  options?: { organizationId?: number },
): Promise<MissingDocument[]> {
  const rpcArgs: { p_context: LegalContext; p_organization_id?: number } = {
    p_context: context,
  }
  if (typeof options?.organizationId === 'number') {
    rpcArgs.p_organization_id = options.organizationId
  }
  const { data, error } = await supabase.rpc('legal_missing_documents', rpcArgs)
  if (error) throw error
  return (data || []) as MissingDocument[]
}

export async function getMissingUserDocuments(
  supabase: SupabaseClient,
  context: LegalContext,
): Promise<MissingDocument[]> {
  const docs = await getMissingDocuments(supabase, context)
  return docs.filter((doc) => doc.scope === 'user')
}

export async function getMissingOrganizationDocuments(
  supabase: SupabaseClient,
  context: LegalContext,
  organizationId: number,
): Promise<MissingDocument[]> {
  const docs = await getMissingDocuments(supabase, context, { organizationId })
  return docs.filter((doc) => doc.scope === 'organization')
}

export async function acceptUserDocument(
  supabase: SupabaseClient,
  code: string,
  source: LegalSource,
  options?: { organizationId?: number },
): Promise<void> {
  const rpcArgs: { p_code: string; p_source: LegalSource; p_organization_id?: number } = {
    p_code: code,
    p_source: source,
  }
  if (typeof options?.organizationId === 'number') {
    rpcArgs.p_organization_id = options.organizationId
  }
  const { error } = await supabase.rpc('legal_accept_document', rpcArgs)
  if (error) throw error
}

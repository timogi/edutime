/** Billing address collected for organization checkouts (passed to Payrexx). */
export interface OrgBillingAddress {
  company: string
  street: string
  postcode: string
  place: string
  /** ISO 3166-1 alpha-2 (e.g. CH) */
  country: string
}

const COUNTRY_ISO_PATTERN = /^[A-Z]{2}$/

export function normalizeOrgBillingAddress(
  input: Partial<OrgBillingAddress> | null | undefined,
): OrgBillingAddress | null {
  if (!input) return null

  const company = input.company?.trim() ?? ''
  const street = input.street?.trim() ?? ''
  const postcode = input.postcode?.trim() ?? ''
  const place = input.place?.trim() ?? ''
  const country = (input.country?.trim().toUpperCase() ?? '') || 'CH'

  if (!company || !street || !postcode || !place || !country) {
    return null
  }

  if (!COUNTRY_ISO_PATTERN.test(country)) {
    return null
  }

  return { company, street, postcode, place, country }
}

export function parseOrgBillingAddressFromBody(
  body: unknown,
): OrgBillingAddress | null {
  if (!body || typeof body !== 'object') return null
  const record = body as Record<string, unknown>
  const raw = record.billingAddress
  if (!raw || typeof raw !== 'object') return null
  const address = raw as Partial<OrgBillingAddress>
  return normalizeOrgBillingAddress(address)
}

export function validateOrgBillingAddressRequired(
  address: OrgBillingAddress | null,
): address is OrgBillingAddress {
  return address !== null
}

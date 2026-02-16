/**
 * Shared pricing logic for EduTime licenses.
 * Used by both frontend PriceCalculator and backend checkout API.
 *
 * All amounts are in CHF. The backend works in cents (Rappen) for Payrexx.
 */

export interface PriceTier {
  min: number
  max: number
  /** Price per license in CHF */
  price: number
}

export interface PriceBreakdownItem {
  tierLabel: string
  count: number
  /** Price per license in CHF */
  pricePerLicense: number
  /** Subtotal in CHF */
  subtotal: number
}

export interface PriceCalculation {
  /** Total in CHF */
  totalChf: number
  /** Total in cents (Rappen) for Payrexx */
  totalCents: number
  breakdown: PriceBreakdownItem[]
  /** True if the quantity exceeds the max tier (requires custom pricing) */
  requiresCustomPricing: boolean
}

/** Individual annual license price in CHF */
export const INDIVIDUAL_ANNUAL_PRICE_CHF = 30

/** Individual annual license price in cents */
export const INDIVIDUAL_ANNUAL_PRICE_CENTS = INDIVIDUAL_ANNUAL_PRICE_CHF * 100

/** Minimum number of org licenses */
export const MIN_ORG_LICENSES = 3

/** Maximum number of org licenses with automatic pricing */
export const MAX_AUTO_PRICING_LICENSES = 100

/** Currency used for all payments */
export const CURRENCY = 'CHF'

/** Organization license price tiers (tiered/graduated pricing) */
export const ORG_PRICE_TIERS: PriceTier[] = [
  { min: 1, max: 10, price: 30 },
  { min: 11, max: 25, price: 25 },
  { min: 26, max: 50, price: 20 },
  { min: 51, max: 100, price: 15 },
]

/**
 * Calculate the price for an organization license purchase.
 * Uses tiered pricing: first 10 at 30 CHF, next 15 at 25 CHF, etc.
 */
export function calculateOrgPrice(quantity: number): PriceCalculation {
  if (quantity < MIN_ORG_LICENSES) {
    return {
      totalChf: 0,
      totalCents: 0,
      breakdown: [],
      requiresCustomPricing: false,
    }
  }

  const breakdown: PriceBreakdownItem[] = []
  let remaining = quantity
  let totalChf = 0

  for (const tier of ORG_PRICE_TIERS) {
    if (remaining <= 0) break

    const tierCount = Math.min(remaining, tier.max - tier.min + 1)
    const subtotal = tierCount * tier.price
    totalChf += subtotal

    breakdown.push({
      tierLabel: `${tier.min}-${tier.max}`,
      count: tierCount,
      pricePerLicense: tier.price,
      subtotal,
    })

    remaining -= tierCount
  }

  const requiresCustomPricing = remaining > 0

  if (requiresCustomPricing) {
    breakdown.push({
      tierLabel: `${MAX_AUTO_PRICING_LICENSES + 1}+`,
      count: remaining,
      pricePerLicense: 0,
      subtotal: 0,
    })
  }

  return {
    totalChf,
    totalCents: totalChf * 100,
    breakdown,
    requiresCustomPricing,
  }
}

/**
 * Calculate the checkout amount for any plan type.
 * Returns amount in cents (Rappen) for Payrexx.
 */
export function calculateCheckoutAmount(
  plan: 'annual' | 'org',
  quantity: number = 1,
): { amountCents: number; amountChf: number; requiresCustomPricing: boolean } {
  if (plan === 'annual') {
    return {
      amountCents: INDIVIDUAL_ANNUAL_PRICE_CENTS,
      amountChf: INDIVIDUAL_ANNUAL_PRICE_CHF,
      requiresCustomPricing: false,
    }
  }

  const orgPrice = calculateOrgPrice(quantity)
  return {
    amountCents: orgPrice.totalCents,
    amountChf: orgPrice.totalChf,
    requiresCustomPricing: orgPrice.requiresCustomPricing,
  }
}

/**
 * Build a Payrexx-compatible basket array for the checkout.
 */
export function buildBasket(
  plan: 'annual' | 'org',
  quantity: number = 1,
): Array<{ name: string[]; description: string[]; quantity: number; amount: number }> {
  if (plan === 'annual') {
    return [
      {
        name: ['EduTime Jahreslizenz', 'EduTime Annual License', 'Licence annuelle EduTime'],
        description: [
          'Persoenliche Jahreslizenz',
          'Personal annual license',
          'Licence annuelle personnelle',
        ],
        quantity: 1,
        amount: INDIVIDUAL_ANNUAL_PRICE_CENTS,
      },
    ]
  }

  const orgPrice = calculateOrgPrice(quantity)
  return orgPrice.breakdown
    .filter((item) => item.subtotal > 0)
    .map((item) => ({
      name: [
        `EduTime Organisationslizenzen (${item.tierLabel})`,
        `EduTime Organization Licenses (${item.tierLabel})`,
        `Licences organisation EduTime (${item.tierLabel})`,
      ],
      description: [
        `${item.count} Lizenzen à ${item.pricePerLicense} CHF/Jahr`,
        `${item.count} licenses at ${item.pricePerLicense} CHF/year`,
        `${item.count} licences à ${item.pricePerLicense} CHF/an`,
      ],
      quantity: item.count,
      amount: item.pricePerLicense * 100,
    }))
}

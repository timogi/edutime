/**
 * Payment provider module.
 *
 * Automatically selects between Payrexx (production) and Mock (development):
 * - If PAYREXX_INSTANCE and PAYREXX_API_SECRET are set -> PayrexxProvider
 * - Otherwise -> MockPaymentProvider
 */

import { mockPaymentProvider } from './mockProvider'
import { PaymentProvider } from './paymentProvider'

function resolveProvider(): PaymentProvider {
  const hasPayrexx = process.env.PAYREXX_INSTANCE && process.env.PAYREXX_API_SECRET

  if (hasPayrexx) {
    // Dynamic import to avoid loading Payrexx dependencies when not needed
    const { PayrexxProvider } = require('./payrexxProvider')
    return new PayrexxProvider()
  }

  console.log('[payments] Using MockPaymentProvider (PAYREXX_INSTANCE not configured)')
  return mockPaymentProvider
}

export const paymentProvider: PaymentProvider = resolveProvider()

// Re-export types and utilities
export type {
  PaymentProvider,
  CheckoutSessionParams,
  CheckoutSessionResult,
} from './paymentProvider'
export {
  calculateCheckoutAmount,
  calculateOrgPrice,
  buildBasket,
  INDIVIDUAL_ANNUAL_PRICE_CHF,
  INDIVIDUAL_ANNUAL_PRICE_CENTS,
  MIN_ORG_LICENSES,
  MAX_AUTO_PRICING_LICENSES,
  CURRENCY,
  ORG_PRICE_TIERS,
} from './pricing'
export type { PriceTier, PriceBreakdownItem, PriceCalculation } from './pricing'

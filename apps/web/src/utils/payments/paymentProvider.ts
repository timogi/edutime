/**
 * Payment provider interface.
 * Abstraction layer so we can swap between Mock and Payrexx providers.
 */

import type { OrgBillingAddress } from './orgBillingAddress'

export interface CheckoutSessionParams {
  plan: 'annual' | 'org'
  qty?: number
  userId: string
  organizationId?: number
  userEmail?: string
  firstName?: string
  lastName?: string
  /** Required for organization checkouts; forwarded to Payrexx contact fields. */
  orgBillingAddress?: OrgBillingAddress
  language?: string
  customAmountCents?: number
  customPurpose?: string
  customBasket?: Array<{ name: string[]; description: string[]; quantity: number; amount: number }>
  customSubscriptionState?: boolean
  customSubscriptionInterval?: string
  customSubscriptionPeriod?: string
}

export interface CheckoutSessionResult {
  /** URL to redirect user to for payment */
  checkoutUrl: string
  /** Internal reference ID (stored as billing.checkout_sessions.reference_id) */
  sessionId: string
  /** Payrexx Gateway ID (stored for webhook reconciliation) */
  gatewayId?: number
}

export interface PaymentProvider {
  createCheckoutSession(params: CheckoutSessionParams): Promise<CheckoutSessionResult>
}

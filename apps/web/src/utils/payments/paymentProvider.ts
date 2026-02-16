/**
 * Payment provider interface.
 * Abstraction layer so we can swap between Mock and Payrexx providers.
 */

export interface CheckoutSessionParams {
  plan: 'annual' | 'org'
  qty?: number
  userId: string
  organizationId?: number
  userEmail?: string
  firstName?: string
  lastName?: string
  language?: string
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

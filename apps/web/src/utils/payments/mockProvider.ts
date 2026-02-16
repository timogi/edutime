import { PaymentProvider, CheckoutSessionParams, CheckoutSessionResult } from './paymentProvider'
import { calculateCheckoutAmount, CURRENCY } from './pricing'

/**
 * Mock payment provider for development/testing.
 * Returns a mock checkout URL that routes to the local mock checkout page.
 */
export class MockPaymentProvider implements PaymentProvider {
  async createCheckoutSession(params: CheckoutSessionParams): Promise<CheckoutSessionResult> {
    const { plan, qty = 1 } = params
    const { amountCents, amountChf } = calculateCheckoutAmount(plan, qty)

    const sessionId = `mock_session_${Date.now()}_${Math.random().toString(36).substring(7)}`

    const checkoutUrl =
      `/checkout/mock?sessionId=${sessionId}` +
      `&plan=${plan}` +
      `&amount=${amountChf}` +
      `&currency=${CURRENCY}` +
      (qty > 1 ? `&qty=${qty}` : '')

    console.log(
      `[MockPaymentProvider] Created mock session: ${sessionId}, plan=${plan}, qty=${qty}, amount=${amountCents} cents`,
    )

    return {
      checkoutUrl,
      sessionId,
    }
  }
}

export const mockPaymentProvider = new MockPaymentProvider()

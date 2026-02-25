/**
 * Payrexx payment provider implementation.
 *
 * Creates a Payrexx Gateway for license purchases and returns the payment link.
 *
 * Architecture:
 * - Gateway creation happens here (Next.js API route)
 * - A billing.checkout_sessions row is created by the API route
 * - Webhook processing happens in a Supabase Edge Function which calls
 *   billing.process_successful_payment() to create:
 *   billing.accounts -> billing.subscriptions -> billing.invoices -> license.entitlements
 */

import { PayrexxClient, createPayrexxClientFromEnv } from './payrexxClient'
import { PaymentProvider, CheckoutSessionParams, CheckoutSessionResult } from './paymentProvider'
import {
  calculateCheckoutAmount,
  buildBasket,
  CURRENCY,
  MIN_ORG_LICENSES,
  MAX_AUTO_PRICING_LICENSES,
} from './pricing'

/** Payrexx language ID mapping (used for multi-language gateway) */
const LANGUAGE_MAP: Record<string, string> = {
  de: 'de',
  en: 'en',
  fr: 'fr',
}

/** Default gateway validity in minutes (2 hours) */
const GATEWAY_VALIDITY_MINUTES = 120
/** Payrexx subscription interval format (PHP DateInterval) */
const ONE_YEAR_PHP_INTERVAL = 'P1Y'

export class PayrexxProvider implements PaymentProvider {
  private client: PayrexxClient

  constructor(client?: PayrexxClient) {
    const resolvedClient = client || createPayrexxClientFromEnv()
    if (!resolvedClient) {
      throw new Error(
        'PayrexxProvider: Missing PAYREXX_INSTANCE or PAYREXX_API_SECRET environment variables',
      )
    }
    this.client = resolvedClient
  }

  async createCheckoutSession(params: CheckoutSessionParams): Promise<CheckoutSessionResult> {
    const {
      plan,
      qty = 1,
      userId,
      organizationId,
      userEmail,
      firstName,
      lastName,
      language,
    } = params

    if (plan === 'org' && qty < MIN_ORG_LICENSES) {
      throw new Error(`Organization plan requires at least ${MIN_ORG_LICENSES} licenses`)
    }

    const { amountCents, requiresCustomPricing } = calculateCheckoutAmount(plan, qty)

    if (requiresCustomPricing) {
      throw new Error(
        `Quantities over ${MAX_AUTO_PRICING_LICENSES} require custom pricing. Please contact sales.`,
      )
    }

    if (amountCents <= 0) {
      throw new Error('Invalid amount calculated')
    }

    const referenceId = `cs_${crypto.randomUUID()}`
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://edutime.ch'
    const environment = process.env.NODE_ENV === 'production' ? 'prod' : 'nonprod'
    const successUrl = `${appUrl}/checkout/success?ref=${referenceId}`
    const failedUrl = `${appUrl}/checkout/failed?ref=${referenceId}`
    const cancelUrl = `${appUrl}/checkout/cancel?ref=${referenceId}`

    const basket = buildBasket(plan, qty)

    const fields: Record<string, { value: string }> = {}
    if (userEmail) fields.email = { value: userEmail }
    if (firstName) fields.forename = { value: firstName }
    if (lastName) fields.surname = { value: lastName }

    const gatewayResponse = await this.client.createGateway({
      amount: amountCents,
      currency: CURRENCY,
      purpose:
        plan === 'annual'
          ? `EduTime Annual License (${environment})`
          : `EduTime Organization Licenses (${qty}x, ${environment})`,
      successRedirectUrl: encodeURI(successUrl),
      failedRedirectUrl: encodeURI(failedUrl),
      cancelRedirectUrl: encodeURI(cancelUrl),
      referenceId,
      basket,
      fields: Object.keys(fields).length > 0 ? fields : undefined,
      language: LANGUAGE_MAP[language || 'de'] || 'de',
      skipResultPage: false,
      validity: GATEWAY_VALIDITY_MINUTES,
      subscriptionState: plan === 'annual',
      // Payrexx expects PHP interval spec, e.g. P1M / P1Y.
      subscriptionInterval: plan === 'annual' ? ONE_YEAR_PHP_INTERVAL : undefined,
      subscriptionPeriod: plan === 'annual' ? ONE_YEAR_PHP_INTERVAL : undefined,
    })

    if (gatewayResponse.status !== 'success' || !gatewayResponse.data?.[0]) {
      throw new Error(`Failed to create Payrexx Gateway: ${JSON.stringify(gatewayResponse)}`)
    }

    const gateway = gatewayResponse.data[0]

    return {
      checkoutUrl: gateway.link,
      sessionId: referenceId,
      gatewayId: gateway.id,
    }
  }
}

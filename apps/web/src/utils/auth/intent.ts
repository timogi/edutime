export type IntentType = 'demo' | 'annual' | 'org'

/**
 * Builds the email redirect URL for Supabase signup
 * This URL will be called after the user clicks the confirmation link
 */
export function buildEmailRedirectTo(origin: string, intent: IntentType, qty?: number): string {
  const url = new URL(`${origin}/auth/callback`)
  url.searchParams.set('intent', intent)
  if (qty !== undefined) {
    url.searchParams.set('qty', qty.toString())
  }
  return url.toString()
}

/**
 * Determines where to redirect the user after email confirmation
 * based on their registration intent
 */
export function getPostAuthRedirect(intent?: IntentType, qty?: number): string {
  switch (intent) {
    case 'demo':
      // Redirect to app - demo will be activated in callback
      return '/app'
    case 'annual':
      return '/checkout?plan=annual'
    case 'org':
      const qtyParam = qty && qty > 0 ? qty : 3
      return `/checkout?plan=org&qty=${qtyParam}`
    default:
      // Default to app if no intent specified
      return '/app'
  }
}

/**
 * Parses intent and qty from URL search params
 */
export function parseIntentFromQuery(query: Record<string, string | string[] | undefined>): {
  intent?: IntentType
  qty?: number
} {
  const intent = query.intent
  const qty = query.qty

  let parsedIntent: IntentType | undefined
  if (
    typeof intent === 'string' &&
    (intent === 'demo' || intent === 'annual' || intent === 'org')
  ) {
    parsedIntent = intent
  }

  let parsedQty: number | undefined
  if (typeof qty === 'string') {
    const numQty = parseInt(qty, 10)
    if (!isNaN(numQty) && numQty > 0) {
      parsedQty = numQty
    }
  }

  return { intent: parsedIntent, qty: parsedQty }
}

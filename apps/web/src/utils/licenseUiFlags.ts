/**
 * Client-side flags (must use NEXT_PUBLIC_* to be available in the browser).
 *
 * `NEXT_PUBLIC_SHOW_LICENSE_TEST_OPTIONS=true` — show billing test UI
 * (e.g. daily auto-renew test card on /app/no-license).
 *
 * `NEXT_PUBLIC_LICENSE_SELF_SERVICE_ENABLED=false` — hide purchase, checkout,
 * and org price calculator (default: enabled when unset). Demo on /app/no-license
 * stays available when the user has not used a trial yet.
 */
export function showLicenseTestOptions(): boolean {
  return process.env.NEXT_PUBLIC_SHOW_LICENSE_TEST_OPTIONS === 'true'
}

export function isLicenseSelfServiceEnabled(): boolean {
  return process.env.NEXT_PUBLIC_LICENSE_SELF_SERVICE_ENABLED !== 'false'
}

/** Internal 1-CHF/day Payrexx test — allowed even when public self-service is off. */
export function isDailyTestBillingCycle(billingCycle: string | undefined | null): boolean {
  return billingCycle === 'daily_test'
}

/** Public purchase/checkout, or billing-lab daily test subscription only. */
export function isCheckoutAllowed(billingCycle?: string | null): boolean {
  return isLicenseSelfServiceEnabled() || isDailyTestBillingCycle(billingCycle)
}

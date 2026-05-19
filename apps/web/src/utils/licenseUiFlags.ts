/**
 * Client-side flags (must use NEXT_PUBLIC_* to be available in the browser).
 *
 * `NEXT_PUBLIC_SHOW_LICENSE_TEST_OPTIONS=true` — show billing test UI
 * (e.g. daily auto-renew test card on /app/no-license).
 *
 * `NEXT_PUBLIC_LICENSE_SELF_SERVICE_ENABLED=false` — hide purchase, demo,
 * org price calculator, and checkout entry points (default: enabled when unset).
 */
export function showLicenseTestOptions(): boolean {
  return process.env.NEXT_PUBLIC_SHOW_LICENSE_TEST_OPTIONS === 'true'
}

export function isLicenseSelfServiceEnabled(): boolean {
  return process.env.NEXT_PUBLIC_LICENSE_SELF_SERVICE_ENABLED !== 'false'
}

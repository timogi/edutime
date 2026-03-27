/**
 * Client-side flags (must use NEXT_PUBLIC_* to be available in the browser).
 * Set `NEXT_PUBLIC_SHOW_LICENSE_TEST_OPTIONS=true` in `.env.local` to show
 * billing test UI (e.g. daily auto-renew test card on /app/no-license).
 */
export function showLicenseTestOptions(): boolean {
  return process.env.NEXT_PUBLIC_SHOW_LICENSE_TEST_OPTIONS === 'true'
}

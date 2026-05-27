/** Obscure path segment — not linked from public navigation. */
export const BILLING_LAB_PATH = '/x/ed7a4f9c'

export const BILLING_LAB_PASSWORD = 'eduT'

export const BILLING_LAB_UNLOCK_SESSION_KEY = 'edutime_billing_lab_unlocked'

export function isBillingLabUnlocked(): boolean {
  if (typeof window === 'undefined') return false
  return sessionStorage.getItem(BILLING_LAB_UNLOCK_SESSION_KEY) === '1'
}

export function setBillingLabUnlocked(unlocked: boolean): void {
  if (typeof window === 'undefined') return
  if (unlocked) {
    sessionStorage.setItem(BILLING_LAB_UNLOCK_SESSION_KEY, '1')
  } else {
    sessionStorage.removeItem(BILLING_LAB_UNLOCK_SESSION_KEY)
  }
}

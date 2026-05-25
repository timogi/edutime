/**
 * Benign errors from the Web Locks API used by @supabase/auth-js.
 * Common when tabs compete for the auth lock or a tab wakes after being backgrounded.
 */
export function isBenignNavigatorLockError(error: unknown): boolean {
  if (!error || typeof error !== 'object') {
    return false
  }

  if ('isAcquireTimeout' in error && (error as { isAcquireTimeout?: boolean }).isAcquireTimeout) {
    return true
  }

  const name = 'name' in error ? String(error.name) : ''
  const message = 'message' in error ? String(error.message) : ''
  const code = 'code' in error ? Number((error as { code?: number }).code) : undefined

  const isAbort =
    name === 'AbortError' || (typeof DOMException !== 'undefined' && error instanceof DOMException)

  if (!isAbort && code !== 20) {
    return false
  }

  if (!message) {
    return true
  }

  return (
    /lock request is aborted/i.test(message) ||
    /lock broken by another request/i.test(message) ||
    /navigator lockmanager/i.test(message)
  )
}

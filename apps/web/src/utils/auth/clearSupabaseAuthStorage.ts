/** Clears Supabase auth tokens from browser storage (local + session + sb- cookies). */
export function clearSupabaseAuthStorage(): void {
  if (typeof window === 'undefined') return

  const removeMatchingKeys = (storage: Storage) => {
    const keysToRemove: string[] = []
    for (let i = 0; i < storage.length; i += 1) {
      const key = storage.key(i)
      if (!key) continue
      if (key.startsWith('sb-') && key.includes('-auth-token')) {
        keysToRemove.push(key)
      }
    }
    keysToRemove.forEach((key) => storage.removeItem(key))
  }

  try {
    removeMatchingKeys(window.localStorage)
  } catch (error) {
    console.error('Failed to clear localStorage auth keys:', error)
  }

  try {
    removeMatchingKeys(window.sessionStorage)
  } catch (error) {
    console.error('Failed to clear sessionStorage auth keys:', error)
  }

  try {
    const cookies = document.cookie ? document.cookie.split(';') : []
    cookies.forEach((cookie) => {
      const trimmed = cookie.trim()
      const equalIndex = trimmed.indexOf('=')
      const name = equalIndex > 0 ? trimmed.slice(0, equalIndex) : trimmed
      if (name.startsWith('sb-')) {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`
      }
    })
  } catch (error) {
    console.error('Failed to clear auth cookies:', error)
  }
}

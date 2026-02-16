import { useMantineColorScheme } from '@mantine/core'
import { useUser } from '@/contexts/UserProvider'
import { updateUserData } from '@/utils/supabase/user'
import { useCallback } from 'react'

/**
 * Custom hook for managing theme (dark/light mode) toggle
 * Handles both Mantine theme state and optional user preference persistence
 */
export function useThemeToggle() {
  const { colorScheme, setColorScheme } = useMantineColorScheme()
  const { user, refreshUserData } = useUser()

  const toggleTheme = useCallback(async () => {
    const newScheme = colorScheme === 'light' ? 'dark' : 'light'

    // Update Mantine theme immediately
    setColorScheme(newScheme)

    // If user is logged in, persist preference to database
    if (user?.user_id) {
      try {
        await updateUserData({ is_mode_dark: newScheme === 'dark' }, user.user_id)
        // Refresh user data to sync
        await refreshUserData()
      } catch (error) {
        console.error('Error updating theme preference:', error)
        // Don't throw - theme change should still work even if DB update fails
      }
    }
  }, [colorScheme, setColorScheme, user, refreshUserData])

  const setTheme = useCallback(
    async (scheme: 'light' | 'dark') => {
      if (colorScheme === scheme) return

      // Update Mantine theme immediately
      setColorScheme(scheme)

      // If user is logged in, persist preference to database
      if (user?.user_id) {
        try {
          await updateUserData({ is_mode_dark: scheme === 'dark' }, user.user_id)
          // Refresh user data to sync
          await refreshUserData()
        } catch (error) {
          console.error('Error updating theme preference:', error)
          // Don't throw - theme change should still work even if DB update fails
        }
      }
    },
    [colorScheme, setColorScheme, user, refreshUserData],
  )

  return {
    colorScheme,
    toggleTheme,
    setTheme,
    isDark: colorScheme === 'dark',
    isLight: colorScheme === 'light',
  }
}

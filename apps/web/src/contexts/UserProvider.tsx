import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { User } from '@supabase/supabase-js'
import { useRouter } from 'next/router'
import { useMantineColorScheme } from '@mantine/core'
import { supabase } from '@/utils/supabase/client'
import { getUserData } from '@/utils/supabase/user'
import { getAllCategories } from '@/utils/supabase/categories'
import { getMemberships, getOrganizations } from '@/utils/supabase/organizations'
import { getConfigProfile, getProfileCategories } from '@/utils/supabase/config_profiles'
import { ConfigMode, getConfigMode, ConfigProfileData, ProfileCategoryData } from '@edutime/shared'
import { hasActiveEntitlement } from '@edutime/shared'
import { UserData, Category, Membership, Organization } from '@/types/globals'

type UserContextType = {
  isLoading: boolean
  isInitialized: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  user: UserData | null
  hasActiveSubscription: boolean
  categories: Category[]
  memberships: Membership[]
  organizations: Organization[]
  userEmail: string | null
  refreshUserData: () => Promise<void>
  configMode: ConfigMode
  configProfile: ConfigProfileData | null
  profileCategories: ProfileCategoryData[]
}

const Context = createContext<UserContextType>({
  isLoading: true,
  isInitialized: false,
  login: async () => {},
  logout: async () => {},
  user: null,
  hasActiveSubscription: false,
  categories: [],
  memberships: [],
  organizations: [],
  userEmail: null,
  refreshUserData: async () => {},
  configMode: 'default',
  configProfile: null,
  profileCategories: [],
})

const Provider = ({ children }: { children: React.ReactNode }) => {
  const [isLoading, setIsLoading] = useState(true)
  const [isInitialized, setIsInitialized] = useState(false)
  const [user, setUser] = useState<UserData | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [memberships, setMemberships] = useState<Membership[]>([])
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [configMode, setConfigMode] = useState<ConfigMode>('default')
  const [configProfile, setConfigProfile] = useState<ConfigProfileData | null>(null)
  const [profileCategories, setProfileCategories] = useState<ProfileCategoryData[]>([])
  const mapAdditionalCategories = (cats: { id: number; title: string; subtitle: string; color: string | null }[]): Category[] =>
    cats.map((cat) => ({
      id: cat.id,
      title: cat.title,
      subtitle: cat.subtitle,
      color: cat.color,
      category_set_title: 'furtherEmployment',
    }))

  const [currentSession, setCurrentSession] = useState<{ user: User; event: string } | null>(null)
  const router = useRouter()
  const { colorScheme, toggleColorScheme } = useMantineColorScheme()

  // Define public routes that don't require authentication
  const isPublicRoute = (pathname: string) => {
    const publicRoutes = [
      '/',
      '/login',
      '/register',
      '/recover',
      '/recover/new-password',
      '/no-account',
      '/docs/privacy',
      '/docs/terms',
      '/docs/imprint',
      '/docs/agb',
      '/guide',
      '/mobile',
      '/new-edutime',
      '/license',
      '/delete/success',
      '/reset',
      '/wrong-password',
      '/auth/callback',
      '/checkout',
    ]
    return publicRoutes.some((route) => pathname.startsWith(route))
  }

  // Define protected routes that require authentication
  const isProtectedRoute = (pathname: string) => {
    return pathname.startsWith('/app')
  }

  // Simplified data fetching with proper error handling
  const fetchUserData = useCallback(async (sessionUser: User) => {
    try {
      // Check if session still exists before fetching data
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session?.user) {
        // Session no longer exists (e.g., user logged out), don't fetch data
        return
      }

      if (sessionUser.email) {
        setUserEmail(sessionUser.email)
      }

      const userData = await getUserData()
      if (!userData) {
        // Don't throw error - user might have logged out or data might not exist yet
        console.warn('No user data available')
        return
      }

      setUser(userData)

      const mode = getConfigMode(userData as unknown as { active_config_profile_id: string | null })
      setConfigMode(mode)

      if (mode === 'custom' && (userData as unknown as { active_config_profile_id: string | null }).active_config_profile_id) {
        const profileId = (userData as unknown as { active_config_profile_id: string }).active_config_profile_id
        const [profile, profCats, fetchedOrganizations] = await Promise.all([
          getConfigProfile(profileId).catch((err) => {
            console.error('Error fetching config profile:', err)
            return null
          }),
          getProfileCategories(profileId).catch((err) => {
            console.error('Error fetching profile categories:', err)
            return []
          }),
          getOrganizations(userData.user_id).catch((err) => {
            console.error('Error fetching organizations:', err)
            return []
          }),
        ])

        setConfigProfile(profile)
        setProfileCategories(profCats)

        const categoryResults: Category[] = profCats.map((pc) => ({
          id: pc.id as unknown as number,
          title: pc.title,
          subtitle: '',
          color: pc.color,
          category_set_title: 'custom',
          profile_category_id: pc.id,
        }))
        const additionalCategories = mapAdditionalCategories(userData.user_categories || [])
        setCategories([...categoryResults, ...additionalCategories])
        setOrganizations(fetchedOrganizations || [])
      } else {
        setConfigProfile(null)
        setProfileCategories([])

        const [fetchedCategories, fetchedOrganizations] = await Promise.all([
          getAllCategories(userData).catch((err) => {
            console.error('Error fetching categories:', err)
            return []
          }),
          getOrganizations(userData.user_id).catch((err) => {
            console.error('Error fetching organizations:', err)
            return []
          }),
        ])

        setCategories(fetchedCategories || [])
        setOrganizations(fetchedOrganizations || [])
      }

      // Check entitlements for active license
      try {
        const hasActive = await hasActiveEntitlement(supabase, userData.user_id)
        setHasActiveSubscription(hasActive)
      } catch (error) {
        console.error('Error checking entitlements:', error)
        setHasActiveSubscription(false)
      }

      // Fetch memberships if email is available (for display purposes only, not for license checking)
      if (sessionUser.email) {
        try {
          const fetchedMemberships = await getMemberships(sessionUser.email)
          setMemberships(fetchedMemberships || [])
        } catch (error) {
          console.error('Error fetching memberships:', error)
          setMemberships([])
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
      // Don't clear data on error, just log it
    }
  }, [])

  // Initialize session and set up auth listener
  useEffect(() => {
    let mounted = true

    const initializeSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()

        if (error) {
          console.error('Session error:', error)
        }

        if (session?.user && mounted) {
          await fetchUserData(session.user)
        }

        if (mounted) {
          setIsInitialized(true)
          setIsLoading(false)

          // Only redirect to login if on a protected route and no session
          if (!session && isProtectedRoute(router.pathname)) {
            router.push('/login')
          }
        }
      } catch (error) {
        console.error('Error initializing session:', error)
        if (mounted) {
          setIsInitialized(true)
          setIsLoading(false)
          if (isProtectedRoute(router.pathname)) {
            router.push('/login')
          }
        }
      }
    }

    initializeSession()

    // Set up auth state change listener - NO async calls in handler to avoid deadlock
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return

      // Only set state in handler - async calls will be handled in separate useEffect
      if (session?.user) {
        // Only show loading for sign in, not for token refresh or other events
        if (event === 'SIGNED_IN') {
          setIsLoading(true)
        }

        // Skip fetching data for token refresh events to avoid unnecessary loading states
        // Token refresh doesn't change user data, so we don't need to refetch
        if (event === 'TOKEN_REFRESHED') {
          // Don't set currentSession for token refresh to avoid triggering fetchUserData
          return
        }

        // Set session state - async fetchUserData will be called in useEffect
        setCurrentSession({ user: session.user, event })
      } else {
        // Only show loading for sign out, not for other events
        if (event === 'SIGNED_OUT') {
          setIsLoading(true)
        }

        // Clear session state
        setCurrentSession(null)

        setUser(null)
        setCategories([])
        setMemberships([])
        setOrganizations([])
        setUserEmail(null)
        setHasActiveSubscription(false)
        setConfigMode('default')
        setConfigProfile(null)
        setProfileCategories([])

        if (event === 'SIGNED_OUT') {
          setIsLoading(false)
        }

        if (isProtectedRoute(router.pathname)) {
          router.push('/login')
        }
      }
    })

    // Set up automatic session refresh every 45 minutes
    const refreshInterval = setInterval(
      async () => {
        if (mounted) {
          try {
            const {
              data: { session },
            } = await supabase.auth.getSession()
            if (session?.user) {
              // console.log('Refreshing user data...')
              // Don't set loading state for background refresh
              await fetchUserData(session.user)
            }
          } catch (error) {
            console.error('Error refreshing session:', error)
          }
        }
      },
      45 * 60 * 1000,
    ) // 45 minutes

    return () => {
      mounted = false
      authListener?.subscription.unsubscribe()
      clearInterval(refreshInterval)
    }
  }, [router, fetchUserData])

  // Handle async user data fetching when session changes - separate from onAuthStateChange to avoid deadlock
  useEffect(() => {
    if (!currentSession) return

    // Don't fetch user data on sign out
    if (currentSession.event === 'SIGNED_OUT') {
      return
    }

    let mounted = true

    const handleSessionChange = async () => {
      try {
        await fetchUserData(currentSession.user)

        if (mounted && currentSession.event === 'SIGNED_IN') {
          setIsLoading(false)
          // Redirect to app if on login page
          if (router.pathname === '/login' || router.pathname === '/register') {
            router.replace('/app')
          }
        }
      } catch (error) {
        console.error('Error handling session change:', error)
        if (mounted && currentSession.event === 'SIGNED_IN') {
          setIsLoading(false)
        }
      }
    }

    handleSessionChange()

    return () => {
      mounted = false
    }
  }, [currentSession, fetchUserData, router])

  // Handle theme initialization after user data is loaded
  useEffect(() => {
    if (user) {
      if (user.is_mode_dark && colorScheme !== 'dark') {
        toggleColorScheme()
      } else if (!user.is_mode_dark && colorScheme !== 'light') {
        toggleColorScheme()
      }
    }
  }, [user, colorScheme, toggleColorScheme])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
    } catch (error) {
      setIsLoading(false)
      throw error
    }
  }

  const logout = async () => {
    setIsLoading(true)
    try {
      await supabase.auth.signOut({ scope: 'local' })
      setUser(null)
      setCategories([])
      setMemberships([])
      setOrganizations([])
      setUserEmail(null)
      setHasActiveSubscription(false)
      setConfigMode('default')
      setConfigProfile(null)
      setProfileCategories([])
      router.push('/login')
    } catch (error) {
      console.error('Logout error:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const refreshUserData = async () => {
    if (!user?.user_id) return
    try {
      await fetchUserData({ email: userEmail || '', id: user.user_id } as User)
    } catch (error) {
      console.error('Error refreshing user data:', error)
    }
  }

  return (
    <Context.Provider
      value={{
        login,
        logout,
        isLoading,
        isInitialized,
        user,
        hasActiveSubscription,
        categories,
        memberships,
        organizations,
        userEmail,
        refreshUserData,
        configMode,
        configProfile,
        profileCategories,
      }}
    >
      {children}
    </Context.Provider>
  )
}

export const useUser = () => useContext(Context)

export default Provider

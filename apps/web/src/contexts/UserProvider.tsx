import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { User } from '@supabase/supabase-js'
import { useRouter } from 'next/router'
import { useMantineColorScheme } from '@mantine/core'
import { supabase } from '@/utils/supabase/client'
import { getPostAuthRedirect, parseIntentFromQuery } from '@/utils/auth/intent'
import { getUserData } from '@/utils/supabase/user'
import { getAllCategories } from '@/utils/supabase/categories'
import { getMemberships, getOrganizations } from '@/utils/supabase/organizations'
import { getConfigProfile, getProfileCategories } from '@/utils/supabase/config_profiles'
import { ConfigMode, getConfigMode, ConfigProfileData, ProfileCategoryData } from '@edutime/shared'
import { hasActiveEntitlement } from '@edutime/shared'
import { UserData, Category, Membership, Organization } from '@/types/globals'
import { hasPendingAccountDeletion } from '@/utils/auth/accountDeletionPending'
import { clearSupabaseAuthStorage } from '@/utils/auth/clearSupabaseAuthStorage'

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
  const { setColorScheme } = useMantineColorScheme()
  /** Coalesce concurrent fetchUserData for the same user (Strict Mode / overlapping effects). */
  const fetchUserDataInFlightRef = useRef<Map<string, Promise<boolean>>>(new Map())

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
      '/docs/avv',
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
  const fetchUserData = useCallback(async (sessionUser: User): Promise<boolean> => {
    const userId = sessionUser.id
    const inFlight = fetchUserDataInFlightRef.current.get(userId)
    if (inFlight) {
      return inFlight
    }

    const run = async (): Promise<boolean> => {
    try {
      // Check if session still exists before fetching data
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session?.user) {
        return false
      }

      if (await hasPendingAccountDeletion(supabase, session.user.id)) {
        try {
          await supabase.auth.signOut()
        } catch (signOutError) {
          console.error('signOut (queued account deletion):', signOutError)
        }
        try {
          await supabase.auth.signOut({ scope: 'local' })
        } catch (signOutError) {
          console.error('signOut local (queued account deletion):', signOutError)
        }
        clearSupabaseAuthStorage()
        window.dispatchEvent(new CustomEvent('edutime:pending-account-deletion-signout'))
        await router.replace({ pathname: '/login', query: { accountDeletionPending: '1' } })
        return false
      }

      if (session.user.email) {
        setUserEmail(session.user.email)
      }

      // Pass session.user so getUserData does not call auth.getUser() (avoids lock contention).
      const userData = await getUserData(session.user)
      if (!userData) {
        // Auth session without `public.users` row (incomplete signup, etc.) — not a PostgREST error
        return false
      }

      setUser(userData)

      // Apply DB preference once per fetch. Do not sync theme in a useEffect that also
      // depends on colorScheme — that fights Mantine’s cross-tab localStorage sync and causes flicker.
      setColorScheme(userData.is_mode_dark ? 'dark' : 'light')

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

      // App usage requires an entitlement (personal, trial, org seat). Org billing alone does not unlock the app.
      try {
        const hasActive = await hasActiveEntitlement(supabase, userData.user_id)
        setHasActiveSubscription(hasActive)
      } catch (error) {
        console.error('Error checking entitlements:', error)
        setHasActiveSubscription(false)
      }

      // Fetch memberships if email is available (for display purposes only, not for license checking)
      if (session.user.email) {
        try {
          const fetchedMemberships = await getMemberships(session.user.email)
          setMemberships(fetchedMemberships || [])
        } catch (error) {
          console.error('Error fetching memberships:', error)
          setMemberships([])
        }
      }

      return true
    } catch (error) {
      console.error('Error fetching user data:', error)
      return false
    }
    }

    const promise = run().finally(() => {
      fetchUserDataInFlightRef.current.delete(userId)
    })
    fetchUserDataInFlightRef.current.set(userId, promise)
    return promise
  }, [router, setColorScheme])

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
          // fetchUserData returns false if user was signed out (e.g. queued account deletion)
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

        // Token refresh: only re-check queued account deletion (cheap); skip full user refetch.
        if (event === 'TOKEN_REFRESHED') {
          window.setTimeout(() => {
            void (async () => {
              try {
                const {
                  data: { session: refreshed },
                } = await supabase.auth.getSession()
                if (!refreshed?.user || !mounted) return
                if (await hasPendingAccountDeletion(supabase, refreshed.user.id)) {
                  try {
                    await supabase.auth.signOut()
                  } catch (signOutError) {
                    console.error('signOut after TOKEN_REFRESHED + pending deletion:', signOutError)
                  }
                  try {
                    await supabase.auth.signOut({ scope: 'local' })
                  } catch (signOutError) {
                    console.error('signOut local after TOKEN_REFRESHED + pending deletion:', signOutError)
                  }
                  clearSupabaseAuthStorage()
                  window.dispatchEvent(new CustomEvent('edutime:pending-account-deletion-signout'))
                  if (mounted) {
                    await router.replace({ pathname: '/login', query: { accountDeletionPending: '1' } })
                    setIsLoading(false)
                  }
                }
              } catch (e) {
                console.error('TOKEN_REFRESHED pending-deletion check:', e)
              }
            })()
          }, 0)
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
        const loaded = await fetchUserData(currentSession.user)

        if (!mounted) return

        // Always clear loading when this handler finishes. Auth can emit several events in
        // quick succession (e.g. SIGNED_IN then USER_UPDATED). A strict-mode / dependency
        // re-run can leave the first effect's completion aborted (mounted=false) while the
        // second run only saw USER_UPDATED — previously we never cleared loading or redirected.
        setIsLoading(false)

        if (
          loaded &&
          (router.pathname === '/login' || router.pathname === '/register')
        ) {
          const { intent, qty } = parseIntentFromQuery(router.query)
          const postAuthRedirect = getPostAuthRedirect(intent, qty)
          router.replace(postAuthRedirect)
        }
      } catch (error) {
        console.error('Error handling session change:', error)
        if (mounted) {
          setIsLoading(false)
        }
      }
    }

    handleSessionChange()

    return () => {
      mounted = false
    }
  }, [currentSession, fetchUserData, router])

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

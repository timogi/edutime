import { createContext, useContext, useState, useEffect } from "react";
import { Alert } from "react-native";
import { User } from "@supabase/supabase-js";
import { getUser } from "@/lib/database/user";
import i18n from "@/lib/i18n/i18n";
import { Database, ConfigMode, getConfigMode, ConfigProfileData, ProfileCategoryData } from "@edutime/shared";
import { hasActiveEntitlement } from "@edutime/shared";
import { supabase } from "@/lib/supabase";
import { getAllCategories, CategoryResult, getUserCategories } from "@/lib/database/categories";
import { EmploymentCategory, CantonData } from "@/lib/types";
import { getCantonData } from "@/lib/database/canton";
import { getConfigProfile, getProfileCategories, profileCategoriesToCategoryResults } from "@/lib/database/config_profiles";


type UserContextType = {
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  user: Database["public"]["Tables"]["users"]["Row"] | null;
  cantonData: CantonData | null;
  hasActiveSubscription: boolean;
  categories: CategoryResult[];
  reloadSubscription: () => Promise<void>;
  userEmail: string | null;
  refreshAuth: () => Promise<void>;
  userCategories: EmploymentCategory[];
  refreshUserData: () => Promise<void>;
  configMode: ConfigMode;
  configProfile: ConfigProfileData | null;
  profileCategories: ProfileCategoryData[];
};

const Context = createContext<UserContextType>({
  isLoading: true,
  login: async () => {},
  logout: async () => {},
  user: null,
  cantonData: null,
  hasActiveSubscription: false,
  categories: [],
  reloadSubscription: async () => {},
  userEmail: null,
  refreshAuth: async () => {},
  userCategories: [],
  refreshUserData: async () => {},
  configMode: 'default',
  configProfile: null,
  profileCategories: [],
});

const STARTUP_QUERY_TIMEOUT_MS = 10_000;

function withTimeout<T>(promise: PromiseLike<T>, ms: number, label: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const id = setTimeout(() => {
      reject(new Error(`${label} timed out after ${ms}ms`));
    }, ms);

    promise.then(
      (value) => {
        clearTimeout(id);
        resolve(value);
      },
      (error: unknown) => {
        clearTimeout(id);
        reject(error instanceof Error ? error : new Error(String(error)));
      }
    );
  });
}

const Provider = ({ children }: { children: React.ReactNode }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<
    Database["public"]["Tables"]["users"]["Row"] | null
  >(null);
  const [categories, setCategories] = useState<CategoryResult[]>([]);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userCategories, setUserCategories] = useState<EmploymentCategory[]>([]);
  const [cantonData, setCantonData] = useState<CantonData | null>(null);
  const [configMode, setConfigMode] = useState<ConfigMode>('default');
  const [configProfile, setConfigProfile] = useState<ConfigProfileData | null>(null);
  const [profileCategories, setProfileCategories] = useState<ProfileCategoryData[]>([]);

  useEffect(() => {
    const initializeSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session) {
          await updateData(session.user);
        } else {
          setUser(null);
          setCategories([]);
          setUserCategories([]);
          setCantonData(null);
          setConfigMode('default');
          setConfigProfile(null);
          setProfileCategories([]);
        }
      } catch (error) {
        console.error('UserContext: initializeSession failed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    void initializeSession();

    // Subscribe to auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session) {
          void updateData(session.user).catch((error) => {
            console.error("UserContext: onAuthStateChange updateData failed:", error);
          });
        } else {
          setUser(null);
          setCategories([]);
          setUserCategories([]);
          setCantonData(null);
          setConfigMode('default');
          setConfigProfile(null);
          setProfileCategories([]);
        }
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const fetchUserEntitlements = async (userId: string) => {
    try {
      console.log("[UserContext] checking entitlements", { userId });
      const subscriptionStatus = await hasActiveEntitlement(supabase, userId);
      console.log("[UserContext] entitlements resolved", {
        userId,
        hasActiveSubscription: subscriptionStatus,
      });
      setHasActiveSubscription(subscriptionStatus);
    } catch (error) {
      console.error("Error checking subscription:", error);
      setHasActiveSubscription(false);
    }
  };

  const fetchCategories = async (
    user: Database["public"]["Tables"]["users"]["Row"] | null
  ) => {
    if (!user) return;
    try {
      const fetchedCategories = await getAllCategories(user);
      setCategories(fetchedCategories);
    } catch (error) {
      console.error("Error fetching categories", error);
    }
  };

  const mapUserCategoriesToCategoryResults = (cats: EmploymentCategory[]): CategoryResult[] =>
    cats.map((cat) => ({
      id: cat.id,
      title: cat.title,
      subtitle: cat.subtitle,
      color: cat.color ?? '#845ef7',
      category_set_title: 'furtherEmployment',
      is_further_employment: true,
      order: null,
    }));

  const fetchUserCategories = async (userId: string) => {
    try {
      const fetchedUserCategories = await getUserCategories(userId);
      setUserCategories(fetchedUserCategories);
    } catch (error) {
      console.error("Error fetching user categories", error);
    }
  };

  const fetchCantonData = async (cantonCode: string, userId: string) => {
    try {
      const data = await getCantonData(cantonCode, userId);
      setCantonData(data || null);
    } catch (error) {
      console.error("Error fetching canton data:", error);
      setCantonData(null);
    }
  };

  const loadDerivedUserData = async (
    userData: Database["public"]["Tables"]["users"]["Row"] | null
  ) => {
    const mode = userData ? getConfigMode(userData) : "default";
    setConfigMode(mode);

    if (!userData) {
      setConfigProfile(null);
      setProfileCategories([]);
      setUserCategories([]);
      setCategories([]);
      setCantonData(null);
      return;
    }

    if (mode === "custom" && userData.active_config_profile_id) {
      const [profile, profCats, fetchedUserCategories] = await Promise.all([
        getConfigProfile(userData.active_config_profile_id),
        getProfileCategories(userData.active_config_profile_id),
        getUserCategories(userData.user_id),
      ]);

      setConfigProfile(profile);
      setProfileCategories(profCats);
      setUserCategories(fetchedUserCategories);

      const profileCategoryResults = profileCategoriesToCategoryResults(profCats);
      const additionalCategoryResults =
        mapUserCategoriesToCategoryResults(fetchedUserCategories);
      setCategories([...profileCategoryResults, ...additionalCategoryResults]);

      if (userData.canton_code) {
        await fetchCantonData(userData.canton_code, userData.user_id);
      } else {
        setCantonData(null);
      }

      return;
    }

    setConfigProfile(null);
    setProfileCategories([]);

    const [fetchedUserCategories] = await Promise.all([
      getUserCategories(userData.user_id),
      userData.canton_code
        ? fetchCantonData(userData.canton_code, userData.user_id)
        : Promise.resolve(setCantonData(null)),
      fetchCategories(userData),
    ]);

    setUserCategories(fetchedUserCategories);
  };

  const checkPendingAccountDeletion = async (sessionUser: User) => {
    try {
      const { data: pendingRow, error: pendingError } = await withTimeout(
        supabase
          .from("account_deletion")
          .select("id")
          .eq("user_id", sessionUser.id)
          .is("processed_at", null)
          .maybeSingle(),
        STARTUP_QUERY_TIMEOUT_MS,
        "account_deletion check"
      );

      console.log("[UserContext] pending deletion check resolved", {
        userId: sessionUser.id,
        hasPendingDeletion: !!pendingRow,
        hasPendingError: !!pendingError,
      });

      if (!pendingError && pendingRow) {
        try {
          await supabase.auth.signOut();
        } catch (signOutError) {
          console.error("signOut (queued account deletion):", signOutError);
        }
        try {
          await supabase.auth.signOut({ scope: "local" });
        } catch (signOutError) {
          console.error("signOut local (queued account deletion):", signOutError);
        }
        setUser(null);
        setCategories([]);
        setUserCategories([]);
        setCantonData(null);
        setConfigMode("default");
        setConfigProfile(null);
        setProfileCategories([]);
        setHasActiveSubscription(false);
        setUserEmail(null);
        Alert.alert(
          i18n.t("Settings.accountDeletionPendingTitle"),
          i18n.t("Settings.accountDeletionPendingMessage"),
        );
      }
    } catch (error) {
      console.warn("[UserContext] pending deletion check skipped:", error);
    }
  };

  const updateData = async (sessionUser: User) => {
    try {
      console.log("[UserContext] updateData:start", {
        userId: sessionUser.id,
        hasEmail: !!sessionUser.email,
      });

      if (sessionUser.email) {
        setUserEmail(sessionUser.email);
      }
      void checkPendingAccountDeletion(sessionUser);
      const [userData] = await Promise.all([
        withTimeout(getUser(sessionUser.id), STARTUP_QUERY_TIMEOUT_MS, "getUser"),
        withTimeout(fetchUserEntitlements(sessionUser.id), STARTUP_QUERY_TIMEOUT_MS, "hasActiveEntitlement"),
      ]);
      console.log("[UserContext] updateData:user-loaded", {
        userId: sessionUser.id,
        hasUserData: !!userData,
        cantonCode: userData?.canton_code ?? null,
        configMode: userData ? getConfigMode(userData) : "default",
      });
      setUser(userData);
      void loadDerivedUserData(userData).catch((error) => {
        console.error("Error loading derived user data:", error);
      });
    } catch (error) {
      console.error("Error updating data:", error);
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await supabase.auth.signOut({
        scope: "local",
      });
      setIsLoading(false);
      setUser(null);
      setCategories([]);
      setUserCategories([]);
      setCantonData(null);
      setConfigMode('default');
      setConfigProfile(null);
      setProfileCategories([]);
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  const reloadSubscription = async () => {
    if (user?.user_id) {
      await fetchUserEntitlements(user.user_id);
    }
  };

  const refreshAuth = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session?.user) {
      await updateData(session.user);
    }
  };

  const refreshUserData = async () => {
    if (!user?.user_id) return;
    try {
      console.log("[UserContext] refreshUserData:start", { userId: user.user_id });
      const [userData] = await Promise.all([
        getUser(user.user_id),
        fetchUserEntitlements(user.user_id),
      ]);
      setUser(userData);
      await loadDerivedUserData(userData);
    } catch (error) {
      console.error("Error refreshing user data:", error);
    }
  };

  return (
    <Context.Provider
      value={{
        login,
        logout,
        isLoading,
        user,
        cantonData,
        hasActiveSubscription,
        categories,
        reloadSubscription,
        userEmail,
        refreshAuth,
        userCategories,
        refreshUserData,
        configMode,
        configProfile,
        profileCategories,
      }}
    >
      {children}
    </Context.Provider>
  );
};

export const useUser = () => useContext(Context);

export default Provider;
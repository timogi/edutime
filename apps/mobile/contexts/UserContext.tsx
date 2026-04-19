import { createContext, useContext, useState, useEffect } from "react";
import { Alert } from "react-native";
import { User } from "@supabase/supabase-js";
import i18n from "@/lib/i18n/i18n";
import { Database, ConfigMode, ConfigProfileData, ProfileCategoryData } from "@edutime/shared";
import { supabase } from "@/lib/supabase";
import { CategoryResult } from "@/lib/database/categories";
import { EmploymentCategory, CantonData } from "@/lib/types";
import { useQueryClient } from "@tanstack/react-query";
import {
  settingsKeys,
  useSettingsDataQuery,
  useSettingsEntitlementQuery,
  useSettingsUserQuery,
} from "@/hooks/useSettingsDataQuery";


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
  const [authUserId, setAuthUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const userQuery = useSettingsUserQuery(authUserId);
  const settingsDataQuery = useSettingsDataQuery(userQuery.data ?? null);
  const entitlementQuery = useSettingsEntitlementQuery(authUserId);

  const user = userQuery.data ?? null;
  const hasActiveSubscription = entitlementQuery.data ?? false;
  const categories = settingsDataQuery.data?.categories ?? [];
  const userCategories = settingsDataQuery.data?.userCategories ?? [];
  const cantonData = settingsDataQuery.data?.cantonData ?? null;
  const configMode: ConfigMode = settingsDataQuery.data?.configMode ?? "default";
  const configProfile: ConfigProfileData | null = settingsDataQuery.data?.configProfile ?? null;
  const profileCategories: ProfileCategoryData[] = settingsDataQuery.data?.profileCategories ?? [];
  const isAuthBootstrapLoading =
    authUserId !== null &&
    userQuery.data == null &&
    (userQuery.isPending || userQuery.isFetching);
  const combinedLoading = isLoading || isAuthBootstrapLoading;

  useEffect(() => {
    const initializeSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session) {
          setAuthUserId(session.user.id);
          setUserEmail(session.user.email ?? null);
          void checkPendingAccountDeletion(session.user);
        } else {
          setAuthUserId(null);
          setUserEmail(null);
          queryClient.removeQueries({ queryKey: settingsKeys.all });
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
          setAuthUserId(session.user.id);
          setUserEmail(session.user.email ?? null);
          void checkPendingAccountDeletion(session.user);
        } else {
          setAuthUserId(null);
          setUserEmail(null);
          queryClient.removeQueries({ queryKey: settingsKeys.all });
        }
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [queryClient]);

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
        setAuthUserId(null);
        setUserEmail(null);
        queryClient.removeQueries({ queryKey: settingsKeys.all });
        Alert.alert(
          i18n.t("Settings.accountDeletionPendingTitle"),
          i18n.t("Settings.accountDeletionPendingMessage"),
        );
      }
    } catch (error) {
      console.error("UserContext: pending account deletion check failed:", error);
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
      setAuthUserId(null);
      setUserEmail(null);
      queryClient.removeQueries({ queryKey: settingsKeys.all });
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  const reloadSubscription = async () => {
    if (authUserId) {
      await queryClient.invalidateQueries({
        queryKey: settingsKeys.entitlement(authUserId),
      });
    }
  };

  const refreshAuth = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session?.user) {
      setAuthUserId(session.user.id);
      setUserEmail(session.user.email ?? null);
      await refreshUserData();
    }
  };

  const refreshUserData = async () => {
    if (!authUserId) return;
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: settingsKeys.user(authUserId) }),
      queryClient.invalidateQueries({ queryKey: settingsKeys.entitlement(authUserId) }),
      queryClient.invalidateQueries({ queryKey: settingsKeys.dataScope(authUserId) }),
    ]);
  };

  useEffect(() => {
    if (userQuery.error) {
      console.error("UserContext: user query failed", userQuery.error);
    }
    if (settingsDataQuery.error) {
      console.error("UserContext: settings data query failed", settingsDataQuery.error);
    }
    if (entitlementQuery.error) {
      console.error("UserContext: entitlement query failed", entitlementQuery.error);
    }
  }, [userQuery.error, settingsDataQuery.error, entitlementQuery.error]);

  return (
    <Context.Provider
      value={{
        login,
        logout,
        isLoading: combinedLoading,
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
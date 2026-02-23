import { createContext, useContext, useState, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import { getUser, isSubscribed } from "@/lib/database/user";
import { Database } from "@edutime/shared";
import { supabase } from "@/lib/supabase";
import { getAllCategories, CategoryResult, getUserCategories } from "@/lib/database/categories";
import { EmploymentCategory, CantonData } from "@/lib/types";
import { getCantonData } from "@/lib/database/canton";


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
});

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

  useEffect(() => {
    const initializeSession = async () => {
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
      }
      setIsLoading(false);
    };

    initializeSession();

    // Subscribe to auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session) {
          updateData(session.user);
        } else {
          setUser(null);
          setCategories([]);
          setUserCategories([]);
          setCantonData(null);
        }
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const fetchUserEntitlements = async (userEmail: string) => {
    try {
      const subscriptionStatus = await isSubscribed(userEmail);
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

  const updateData = async (sessionUser: User) => {
    try {
      if (sessionUser.email) {
        setUserEmail(sessionUser.email);
        await fetchUserEntitlements(sessionUser.email);
      }
      const userData = await getUser(sessionUser.id);
      setUser(userData);
      if (userData?.canton_code) {
        await fetchCantonData(userData.canton_code, userData.user_id);
      }
      await fetchCategories(userData);
      await fetchUserCategories(sessionUser.id);
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
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  const reloadSubscription = async () => {
    if (userEmail) {
      await fetchUserEntitlements(userEmail);
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
      const userData = await getUser(user.user_id);
      setUser(userData);
      if (userData?.canton_code) {
        await fetchCantonData(userData.canton_code, userData.user_id);
      }
      await fetchCategories(userData);
      await fetchUserCategories(user.user_id);
      if (userEmail) {
        await fetchUserEntitlements(userEmail);
      }
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
      }}
    >
      {children}
    </Context.Provider>
  );
};

export const useUser = () => useContext(Context);

export default Provider;
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import type { UserProfile, UserRole } from "../lib/supabase";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AuthContextValue {
  user: UserProfile | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (
    name: string,
    email: string,
    password: string,
    role: UserRole,
  ) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;

  // Role helpers
  isOwner: () => boolean;
  isManager: () => boolean;
  isQC: () => boolean;
  roleRedirectPath: () => string;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch profile from user_profiles table
  const fetchProfile = useCallback(
    async (userId: string): Promise<UserProfile | null> => {
      const { data, error } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error fetching profile:", error.message);
        return null;
      }
      return data as UserProfile;
    },
    [],
  );

  // Hydrate user state from an active Supabase session
  const hydrateFromSession = useCallback(
    async (activeSession: Session | null) => {
      setSession(activeSession);
      if (!activeSession) {
        setUser(null);
        return;
      }
      const profile = await fetchProfile(activeSession.user.id);
      // Fallback: build minimal profile from auth metadata if DB row is missing
      if (!profile) {
        setUser({
          id: activeSession.user.id,
          name:
            activeSession.user.user_metadata?.name ??
            activeSession.user.email ??
            "User",
          email: activeSession.user.email ?? "",
          role:
            (activeSession.user.user_metadata?.role as UserRole) ?? "manager",
        });
      } else {
        setUser(profile);
      }
    },
    [fetchProfile],
  );

  // Bootstrap: check existing session on mount + listen to auth changes
  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (mounted) {
          await hydrateFromSession(data.session);
        }
      } catch (err) {
        // Network failure or Supabase project paused
        const msg = err instanceof Error ? err.message : String(err);
        if (mounted) {
          setError(
            msg.includes("fetch")
              ? "Cannot reach Supabase — your project may be paused. Visit supabase.com to resume it."
              : msg,
          );
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    init();

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        if (mounted) {
          setIsLoading(true);
          await hydrateFromSession(newSession);
          setIsLoading(false);
        }
      },
    );

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, [hydrateFromSession]);

  // ─── Auth Actions ────────────────────────────────────────────────────────────

  const login = async (email: string, password: string) => {
    setError(null);
    setIsLoading(true);
    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (authError) throw new Error(authError.message);
    } catch (err) {
      const raw = err instanceof Error ? err.message : "Login failed";
      const msg = raw.toLowerCase().includes("fetch")
        ? "Cannot reach Supabase — check your internet connection or resume your project at supabase.com."
        : raw.toLowerCase().includes("429") ||
            raw.toLowerCase().includes("too many")
          ? "Too many login attempts. Please wait a few minutes and try again."
          : raw;
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    role: UserRole,
  ) => {
    setError(null);
    setIsLoading(true);
    try {
      // 1. Create Supabase Auth user
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name, role } },
      });
      if (signUpError) throw new Error(signUpError.message);

      // The DB trigger (handle_new_user, SECURITY DEFINER) automatically creates
      // the user_profiles row on auth.users INSERT — no client-side write needed.
      // Attempting an upsert here without a session (email confirmation flow)
      // results in a 401 because auth.uid() is null until the user confirms.
    } catch (err) {
      const raw = err instanceof Error ? err.message : "Registration failed";
      const msg = raw.toLowerCase().includes("fetch")
        ? "Cannot reach Supabase — check your internet connection or resume your project at supabase.com."
        : raw.toLowerCase().includes("429") ||
            raw.toLowerCase().includes("too many")
          ? "Too many sign-up attempts. Please wait a few minutes and try again."
          : raw;
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setError(null);
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  const clearError = () => setError(null);

  // ─── Role Helpers ────────────────────────────────────────────────────────────

  const isOwner = () => user?.role === "owner";
  const isManager = () => user?.role === "manager";
  const isQC = () => user?.role === "qc_rep";

  const roleRedirectPath = (): string => {
    switch (user?.role) {
      case "owner":
        return "/owner/dashboard";
      case "manager":
        return "/manager/dashboard";
      case "qc_rep":
        return "/qc/orders";
      default:
        return "/auth";
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isAuthenticated: !!session,
        isLoading,
        error,
        login,
        register,
        logout,
        clearError,
        isOwner,
        isManager,
        isQC,
        roleRedirectPath,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const useAuthContext = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx)
    throw new Error("useAuthContext must be used inside <AuthProvider>");
  return ctx;
};

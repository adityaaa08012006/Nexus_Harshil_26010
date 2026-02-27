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
  refreshSession: () => Promise<void>;
  getAccessToken: () => string | null;

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
        console.log(
          "[AuthContext] Initializing - checking for existing session...",
        );
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error("[AuthContext] Session check error:", error);
          throw error;
        }

        if (mounted) {
          if (data.session) {
            console.log(
              "[AuthContext] Found existing session, hydrating user...",
            );
            await hydrateFromSession(data.session);
          } else {
            console.log("[AuthContext] No existing session found");
            setUser(null);
          }
        }
      } catch (err) {
        // Network failure or Supabase project paused
        const msg = err instanceof Error ? err.message : String(err);
        console.error("[AuthContext] Initialization error:", msg);
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

    // Listen for auth state changes (login, logout, token refresh)
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log("[AuthContext] Auth state changed:", event);
        if (mounted) {
          // Handle specific auth events
          switch (event) {
            case "SIGNED_IN":
              console.log("[AuthContext] User signed in");
              break;
            case "SIGNED_OUT":
              console.log("[AuthContext] User signed out");
              setUser(null);
              setSession(null);
              break;
            case "TOKEN_REFRESHED":
              console.log("[AuthContext] Token refreshed");
              break;
            case "USER_UPDATED":
              console.log("[AuthContext] User updated");
              break;
          }

          // Update session state
          await hydrateFromSession(newSession);
        }
      },
    );

    // Auto-refresh session when page becomes visible
    const handleVisibilityChange = () => {
      if (!document.hidden && mounted) {
        console.log("[AuthContext] Page visible, checking session...");
        supabase.auth.getSession().then(({ data }) => {
          if (data.session && mounted) {
            hydrateFromSession(data.session);
          }
        });
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [hydrateFromSession]);

  // ─── Auth Actions ────────────────────────────────────────────────────────────

  const login = async (email: string, password: string) => {
    console.log("[AuthContext] Login called", { email, password: "***" });
    setError(null);
    setIsLoading(true);
    try {
      console.log("[AuthContext] Calling Supabase signInWithPassword...");

      // Add timeout to detect hanging requests
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(
          () =>
            reject(new Error("Request timeout - Supabase may be unreachable")),
          10000,
        );
      });

      const loginPromise = supabase.auth.signInWithPassword({
        email,
        password,
      });

      const { error: authError } = (await Promise.race([
        loginPromise,
        timeoutPromise,
      ])) as any;

      if (authError) {
        console.error("[AuthContext] Supabase auth error:", authError);
        throw new Error(authError.message);
      }
      console.log("[AuthContext] Supabase sign in successful");
    } catch (err) {
      const raw = err instanceof Error ? err.message : "Login failed";
      const msg =
        raw.toLowerCase().includes("fetch") ||
        raw.toLowerCase().includes("timeout")
          ? "Cannot reach Supabase — check your internet connection or your Supabase project may be paused. Visit supabase.com to check project status."
          : raw.toLowerCase().includes("429") ||
              raw.toLowerCase().includes("too many")
            ? "Too many login attempts. Please wait a few minutes and try again."
            : raw;
      console.error("[AuthContext] Login error:", msg);
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
      console.log("[AuthContext] Login completed");
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
      // Create Supabase Auth user with auto-confirmation for testing
      // Note: Email verification is disabled for testing purposes
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name, role },
          // Skip email verification for testing
          emailRedirectTo: undefined,
        },
      });

      if (signUpError) throw new Error(signUpError.message);

      // Check if user was auto-confirmed (requires Supabase dashboard setting)
      if (data.user && !data.session) {
        // User created but not confirmed - try to sign in immediately
        // This works if email confirmation is disabled in Supabase
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          // Email confirmation might be required
          throw new Error(
            "Account created but requires email verification. Please check your inbox or disable email confirmation in Supabase dashboard (Authentication > Providers > Email > Confirm email: Disable).",
          );
        }
      }

      // The DB trigger (handle_new_user, SECURITY DEFINER) automatically creates
      // the user_profiles row on auth.users INSERT when the user is confirmed.
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
    console.log("[AuthContext] Logging out...");
    setError(null);
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    console.log("[AuthContext] Logged out successfully");
  };

  const clearError = () => setError(null);

  // Manually refresh the session (useful for long-running apps)
  const refreshSession = async () => {
    console.log("[AuthContext] Manually refreshing session...");
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) {
        console.error("[AuthContext] Session refresh failed:", error);
        throw error;
      }
      if (data.session) {
        console.log("[AuthContext] Session refreshed successfully");
        await hydrateFromSession(data.session);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Session refresh failed";
      console.error("[AuthContext] Refresh error:", msg);
      setError(msg);
    }
  };

  // Get current access token (useful for API calls to backend)
  const getAccessToken = (): string | null => {
    return session?.access_token ?? null;
  };

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
        refreshSession,
        getAccessToken,
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

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useMutation } from "@tanstack/react-query";
import { useLocation, useNavigate } from "react-router";
import { apiRevalidate, apiSignIn, apiSignOut, apiSignUp, type AuthUser } from "../lib/api";

interface AuthContextValue {
  user: AuthUser | null;
  /** True while the initial session restore is still in flight. */
  loading: boolean;
  /** True while a revalidation request is in flight. */
  revalidating: boolean;
  /** Re-validate the stored session, renewing its 5-day expiry. */
  revalidate: () => void;
  signIn: (email: string, password: string) => Promise<{ home: string }>;
  signUp: (email: string, name: string, password: string) => Promise<{ home: string }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const AUTH_ROUTES = ["/", "/sign-in"];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [booted, setBooted] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Validate the session stored in the refresh cookie. On success the cookie's
  // 5-day expiry is renewed server-side; we store the user and, when the user
  // landed on an auth route, forward them to their role's default route.
  const revalidation = useMutation({
    mutationFn: apiRevalidate,
    onSuccess: (payload) => {
      setUser(payload?.user ?? null);
      if (payload && AUTH_ROUTES.includes(location.pathname)) {
        navigate(payload.home, { replace: true });
      }
    },
    onSettled: () => setBooted(true),
  });

  // Restore the session once on mount.
  const { mutate: revalidate } = revalidation;
  useEffect(() => {
    revalidate();
  }, [revalidate]);

  const signIn = async (email: string, password: string) => {
    const payload = await apiSignIn(email, password);
    setUser(payload.user);
    return { home: payload.home };
  };

  const signUp = async (email: string, name: string, password: string) => {
    const payload = await apiSignUp(email, name, password);
    setUser(payload.user);
    return { home: payload.home };
  };

  const signOut = async () => {
    await apiSignOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading: !booted,
        revalidating: revalidation.isPending,
        revalidate,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

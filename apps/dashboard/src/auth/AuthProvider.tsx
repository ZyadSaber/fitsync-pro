import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { apiRefresh, apiSignIn, apiSignOut, apiSignUp, type AuthUser } from "../lib/api";

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ home: string }>;
  signUp: (email: string, name: string, password: string) => Promise<{ home: string }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // On mount, try to restore a session from the refresh cookie.
  useEffect(() => {
    let active = true;
    apiRefresh()
      .then((payload) => {
        if (active) setUser(payload?.user ?? null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

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
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

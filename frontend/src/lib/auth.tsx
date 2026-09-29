import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { api, clearToken, getToken, setToken } from "./api";

export type User = {
  id: number;
  email: string;
  name: string;
  plan: string;
  is_admin?: number | boolean;
  avatar?: string | null;
  email_verified_at?: string | null;
  bonus_resumes?: number;
};

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<{ needsVerification: true; email: string }>;
  completeVerification: (token: string, user: User) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!getToken()) {
      setLoading(false);
      return;
    }
    api<User>("/me")
      .then(setUser)
      .catch(() => clearToken())
      .finally(() => setLoading(false));
  }, []);

  async function login(email: string, password: string) {
    const res = await api<{ token: string; user: User }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    setToken(res.token);
    setUser(res.user);
  }

  async function register(email: string, password: string, name: string) {
    // Pas de connexion automatique : le compte doit être confirmé par email avant tout accès.
    const res = await api<{ needsVerification: true; email: string }>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, name }),
    });
    return res;
  }

  function completeVerification(token: string, user: User) {
    setToken(token);
    setUser(user);
  }

  function logout() {
    clearToken();
    setUser(null);
  }

  async function refreshUser() {
    const fresh = await api<User>("/me");
    setUser(fresh);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, completeVerification, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth doit être utilisé dans AuthProvider");
  return ctx;
}

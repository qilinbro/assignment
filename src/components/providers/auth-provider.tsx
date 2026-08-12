"use client";

import * as React from "react";

export interface AuthUser {
  id: string;
  name: string;
  email: string | null;
  role: "ADMIN" | "TA" | "STUDENT";
  mustChangePassword: boolean;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (name: string, password: string) => Promise<{ user?: AuthUser; error?: string }>;
  register: (input: {
    name: string;
    email: string;
    password: string;
    role: "STUDENT" | "TA";
  }) => Promise<{ ok: boolean; error?: string; user?: AuthUser }>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = React.createContext<AuthContextValue | undefined>(undefined);

async function fetchMe(): Promise<AuthUser | null> {
  try {
    const r = await fetch("/api/auth/me", { cache: "no-store" });
    if (!r.ok) return null;
    const data = await r.json();
    return (data.user as AuthUser) ?? null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<AuthUser | null>(null);
  const [loading, setLoading] = React.useState(true);

  // 首次挂载：从服务端 cookie session 恢复登录态
  React.useEffect(() => {
    fetchMe().then((u) => {
      setUser(u);
      setLoading(false);
    });
  }, []);

  const login = React.useCallback(async (name: string, password: string) => {
    const r = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, password }),
    });
    const data = await r.json();
    if (!r.ok) return { error: data.error || "登录失败" };
    setUser(data.user as AuthUser);
    return { user: data.user as AuthUser };
  }, []);

  const register = React.useCallback(
    async (input: { name: string; email: string; password: string; role: "STUDENT" | "TA" }) => {
      const r = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const data = await r.json();
      if (!r.ok) return { ok: false, error: data.error || "注册失败" };
      setUser(data.user as AuthUser);
      return { ok: true, user: data.user as AuthUser };
    },
    []
  );

  const logout = React.useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
  }, []);

  const refresh = React.useCallback(async () => {
    const u = await fetchMe();
    setUser(u);
  }, []);

  const value = React.useMemo<AuthContextValue>(
    () => ({ user, loading, login, register, logout, refresh }),
    [user, loading, login, register, logout, refresh]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = React.useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth 必须在 <AuthProvider> 内部使用");
  }
  return ctx;
}

"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { apiClient, setAccessToken } from "@/lib/api";
import type { ApiItem, ApiUser } from "@/lib/api-types";

type AuthStatus = "loading" | "authenticated" | "anonymous";

type AuthContextValue = {
  user: ApiUser | null;
  status: AuthStatus;
  establishSession: (user: ApiUser, token: string) => void;
  refreshUser: () => Promise<ApiUser | null>;
  updateUser: (user: ApiUser) => void;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<ApiUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");

  const clearSession = useCallback(() => {
    setAccessToken(null);
    setUser(null);
    setStatus("anonymous");
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const response = await apiClient<ApiItem<ApiUser>>("/auth/me", { auth: true });
      setUser(response.data);
      setStatus("authenticated");
      return response.data;
    } catch {
      clearSession();
      return null;
    }
  }, [clearSession]);

  useEffect(() => {
    let active = true;
    void apiClient<ApiItem<ApiUser>>("/auth/me", { auth: true }).then((response) => {
      if (!active) return;
      setUser(response.data);
      setStatus("authenticated");
    }).catch(() => {
      if (active) clearSession();
    });
    window.addEventListener("octacore:auth-expired", clearSession);
    return () => { active = false; window.removeEventListener("octacore:auth-expired", clearSession); };
  }, [clearSession]);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    status,
    establishSession(nextUser, token) {
      setAccessToken(token);
      setUser(nextUser);
      setStatus("authenticated");
    },
    refreshUser,
    updateUser(nextUser) {
      setUser(nextUser);
      setStatus("authenticated");
    },
    async logout() {
      try { await apiClient<void>("/auth/logout", { method: "POST" }); }
      finally { clearSession(); }
    },
  }), [clearSession, refreshUser, status, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth deve ser usado dentro de AuthProvider.");
  return context;
}

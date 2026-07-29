"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";

interface AuthUser {
  sub: string;
  email: string;
  username: string;
  name?: string;
  nickname?: string;
  picture?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  login: (identifier: string, password: string) => Promise<{ error?: string }>;
  register: (email: string, password: string, username: string) => Promise<{ error?: string }>;
  changePassword: () => Promise<{ error?: string }>;
  logout: () => void;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      setUser(data.user || null);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch user on mount — async setState inside effect is the standard pattern
  useEffect(() => {
    const init = async () => {
      await refresh();
    };
    init();
  }, [refresh]);

  const login = useCallback(async (identifier: string, password: string) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier, password }),
    });
    const data = await res.json();
    if (!res.ok) return { error: data.error || "Login failed" };
    // Clear guest session data from localStorage on login
    if (typeof window !== "undefined") {
      localStorage.removeItem("learntube_current");
      localStorage.removeItem("learntube_previous");
    }
    setUser(data.user);
    return {};
  }, []);

  const register = useCallback(async (email: string, password: string, username: string) => {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, username }),
    });
    const data = await res.json();
    if (!res.ok) return { error: data.error || "Registration failed" };
    return {};
  }, []);

  const changePassword = useCallback(async () => {
    const res = await fetch("/api/auth/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    const data = await res.json();
    if (!res.ok) return { error: data.error || "Failed to send reset email" };
    return {};
  }, []);

  const logout = useCallback(() => {
    window.location.href = "/api/auth/logout";
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, changePassword, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import api from "@/lib/axios";
import {
  getTabToken,
  getTabUser,
  setTabSession,
  clearTabSession,
  hasTabSession,
} from "@/lib/tab-session";
import type { User } from "@/types";
import type { Role } from "@/lib/constants";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  isAdmin: boolean;
  isSupport: boolean;
  isStaff: boolean;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  department: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const token = getTabToken();
    if (!token) {
      setUser(null);
      return;
    }

    try {
      const { data } = await api.get("/auth/me");
      if (data.success) {
        setUser(data.data.user);
        setTabSession(token, data.data.user);
      } else {
        clearTabSession();
        setUser(null);
      }
    } catch {
      clearTabSession();
      setUser(null);
    }
  }, []);

  useEffect(() => {
    const hydrate = async () => {
      if (!hasTabSession()) {
        setUser(null);
        setLoading(false);
        return;
      }

      const cached = getTabUser();
      if (cached) setUser(cached);

      await refreshUser();
      setLoading(false);
    };

    hydrate();
  }, [refreshUser]);

  const login = async (email: string, password: string) => {
    const { data } = await api.post("/auth/login", { email, password });
    if (!data.success) throw new Error(data.error);

    const { user: loggedInUser, token } = data.data;
    setTabSession(token, loggedInUser);
    setUser(loggedInUser);
  };

  const register = async (formData: RegisterData) => {
    const { data } = await api.post("/auth/register", formData);
    if (!data.success) throw new Error(data.error);

    const { user: newUser, token } = data.data;
    setTabSession(token, newUser);
    setUser(newUser);
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // clear local session even if API fails
    }
    clearTabSession();
    setUser(null);
  };

  const role = user?.role as Role | undefined;

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        refreshUser,
        isAdmin: role === "admin",
        isSupport: role === "support",
        isStaff: role === "admin" || role === "support",
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

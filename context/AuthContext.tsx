"use client";

import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import tokenStorage from "@/lib/tokenStorage";
import { setUnauthorizedHandler } from "@/lib/api";
import * as authApi from "@/lib/authApi";

interface User {
  id: number;
  email: string;
  name: string;
  first_name?: string;
  last_name?: string;
  gender?: string;
  avatar_url?: string;
  is_active: boolean;
  date_joined: string;
  restaurants?: any[];
}

interface ProfileUpdatePayload {
  first_name?: string;
  last_name?: string;
  gender?: string;
}

interface RegisterPayload {
  first_name: string;
  last_name: string;
  gender: string;
  email: string;
  password: string;
}

interface AuthContextValue {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<any>;
  register: (payload: RegisterPayload) => Promise<any>;
  verifyEmail: (code: string, email: string) => Promise<any>;
  resendOtp: (email: string) => Promise<any>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
  updateProfile: (payload: ProfileUpdatePayload) => Promise<any>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    setIsAuthenticated(tokenStorage.isAuthenticated());
    setIsLoading(false);

    const onStorage = (e: StorageEvent) => {
      if (e.key === "access" || e.key === "refresh" || e.key === null) {
        setIsAuthenticated(tokenStorage.isAuthenticated());
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      setIsAuthenticated(false);
      setUser(null);
      localStorage.removeItem("restaurant_slug");
    });
    return () => setUnauthorizedHandler(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    try {
      const data = await authApi.getProfile();
      setUser(data);
      if (data?.restaurants?.length > 0) {
        localStorage.setItem("restaurant_slug", data.restaurants[0].slug);
      }
    } catch (err) {
      console.error("Failed to refresh profile:", err);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && !user) {
      refreshProfile();
    }
  }, [isAuthenticated, user, refreshProfile]);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const data = await authApi.login(email, password);
      if (!data?.access) throw new Error("Invalid login response: missing access token");
      tokenStorage.setTokens({ access: data.access, refresh: data.refresh });
      setIsAuthenticated(true);
      
      // Fetch profile to get user data and restaurant
      try {
        const profile = await authApi.getProfile();
        setUser(profile);
        if (profile?.restaurants?.length > 0) {
          localStorage.setItem("restaurant_slug", profile.restaurants[0].slug);
        }
      } catch (err) {
        console.error("Failed to fetch profile:", err);
      }
      
      return data;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    setIsLoading(true);
    try {
      const data = await authApi.register(payload);
      return data;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const verifyEmail = useCallback(async (code: string, email: string) => {
    setIsLoading(true);
    try {
      const data = await authApi.verifyEmail(code, email);
      return data;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const resendOtp = useCallback(async (email: string) => {
    const data = await authApi.resendOtp(email);
    return data;
  }, []);

  const logout = useCallback(() => {
    tokenStorage.clear();
    localStorage.removeItem("restaurant_slug");
    setIsAuthenticated(false);
    setUser(null);
  }, []);

  const updateProfile = useCallback(async (payload: ProfileUpdatePayload) => {
    const data = await authApi.updateProfile(payload);
    setUser(data);
    return data;
  }, []);

  const value = useMemo(
    () => ({
      isAuthenticated,
      isLoading,
      user,
      login,
      register,
      verifyEmail,
      resendOtp,
      logout,
      refreshProfile,
      updateProfile,
    }),
    [isAuthenticated, isLoading, user, login, register, verifyEmail, resendOtp, refreshProfile, updateProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export { AuthContext };
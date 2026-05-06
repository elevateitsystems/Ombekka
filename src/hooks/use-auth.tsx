"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { login as apiLogin, register as apiRegister, getProfile, logout as apiLogout } from "@/lib/api";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: any) => Promise<void>;
  register: (formData: FormData) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      getProfile(token)
        .then((userData) => {
          setUser(userData);
        })
        .catch(() => {
          localStorage.removeItem("auth_token");
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (credentials: any) => {
    try {
      const result = await apiLogin(credentials);
      localStorage.setItem("auth_token", result.data.token);
      setUser(result.data.user);
      toast.success("Logged in successfully");
      router.push("/");
    } catch (error: any) {
      toast.error(error.message || "Login failed");
      throw error;
    }
  };

  const register = async (formData: FormData) => {
    try {
      const result = await apiRegister(formData);
      localStorage.setItem("auth_token", result.data.token);
      setUser(result.data.user);
      toast.success("Registered successfully");
      router.push("/");
    } catch (error: any) {
      toast.error(error.message || "Registration failed");
      throw error;
    }
  };

  const logout = async () => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      try {
        await apiLogout(token);
      } catch (error) {
        console.error("Logout error", error);
      }
    }
    localStorage.removeItem("auth_token");
    setUser(null);
    toast.success("Logged out");
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

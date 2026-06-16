import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { User } from "../types";
import { authApi } from "../api";

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem("jobhub_token");
    const savedUser = localStorage.getItem("jobhub_user");

    if (savedToken && savedUser) {
      try {
        const parsedUser: User = JSON.parse(savedUser);
        setToken(savedToken);
        setUser(parsedUser);

        // Silently re-validate and refresh user data from server
        authApi
          .me()
          .then((freshUser) => {
            setUser(freshUser);
            localStorage.setItem("jobhub_user", JSON.stringify(freshUser));
          })
          .catch(() => {
            // Token expired or invalid — log out
            localStorage.removeItem("jobhub_token");
            localStorage.removeItem("jobhub_user");
            setToken(null);
            setUser(null);
          })
          .finally(() => {
            setIsLoading(false);
          });
      } catch {
        localStorage.removeItem("jobhub_token");
        localStorage.removeItem("jobhub_user");
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback((newToken: string, newUser: User) => {
    localStorage.setItem("jobhub_token", newToken);
    localStorage.setItem("jobhub_user", JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("jobhub_token");
    localStorage.removeItem("jobhub_user");
    setToken(null);
    setUser(null);
  }, []);

  /**
   * Call this after any profile update to immediately reflect
   * changes in the UI without waiting for a server round-trip.
   */
  const updateUser = useCallback((updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem("jobhub_user", JSON.stringify(updatedUser));
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!token && !!user,
        login,
        logout,
        updateUser,
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

import { createContext, useEffect, useMemo, useState } from "react";
import { apiClient } from "../api.js";

const STORAGE_TOKEN = "eldercare_auth_token";
const STORAGE_USER = "eldercare_auth_user";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(STORAGE_TOKEN));
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem(STORAGE_USER);
    if (!storedUser) return null;
    try {
      return JSON.parse(storedUser);
    } catch {
      localStorage.removeItem(STORAGE_USER);
      return null;
    }
  });

  useEffect(() => {
    if (token) {
      localStorage.setItem(STORAGE_TOKEN, token);
    } else {
      localStorage.removeItem(STORAGE_TOKEN);
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_USER);
    }
  }, [user]);

  const login = async ({ email, password }) => {
    const response = await apiClient.post("/auth/login", { email, password });
    setToken(response.data.token);
    setUser(response.data.user);
    return response.data.user;
  };

  const register = async ({ name, email, password }) => {
    const response = await apiClient.post("/auth/register", { name, email, password });
    setToken(response.data.token);
    setUser(response.data.user);
    return response.data.user;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  const value = useMemo(
    () => ({ user, token, login, logout, register, isAuthenticated: Boolean(user && token) }),
    [user, token]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

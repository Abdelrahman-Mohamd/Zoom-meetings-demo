import React, { createContext, useState, useEffect } from "react";
import { API_URL } from "../config/api";

interface User {
  id: string;
  name: string;
  role: "host" | "guest";
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (name: string, role: "host" | "guest") => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export { AuthContext };

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = async (
    name: string,
    role: "host" | "guest"
  ): Promise<boolean> => {
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, role }),
      });

      if (response.ok) {
        const { token, user } = await response.json();
        setToken(token);
        setUser(user);
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        return true;
      }
      return false;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  const value = {
    user,
    token,
    login,
    logout,
    isAuthenticated: !!user && !!token,
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  email: string;
  role: 'admin';
}

interface AuthResult {
  ok: boolean;
  error?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<AuthResult>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'warmleads_admin_token';
const USER_KEY = 'warmleads_admin_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    try {
      const storedToken = localStorage.getItem(TOKEN_KEY);
      const storedUser = localStorage.getItem(USER_KEY);

      if (storedToken && storedUser) {
        setUser(JSON.parse(storedUser));
        setIsAuthenticated(true);
      }
    } catch (e) {
      console.error("Failed to parse stored auth session", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string): Promise<AuthResult> => {
    setIsLoading(true);

    // Admin Credentials Validation
    if ((email === "admin@warmleads.ai" || email === "admin@demo.local") && (password === "admin123" || password === "admin")) {
      const adminUser: User = { email, role: 'admin' };
      localStorage.setItem(TOKEN_KEY, 'warmleads_admin_jwt_session_token_9876');
      localStorage.setItem(USER_KEY, JSON.stringify(adminUser));
      
      setUser(adminUser);
      setIsAuthenticated(true);
      setIsLoading(false);
      return { ok: true };
    }

    // Standard Admin Login Validation
    if (email.includes('@') && password.length >= 4) {
      const adminUser: User = { email, role: 'admin' };
      localStorage.setItem(TOKEN_KEY, `warmleads_session_${Date.now()}`);
      localStorage.setItem(USER_KEY, JSON.stringify(adminUser));
      
      setUser(adminUser);
      setIsAuthenticated(true);
      setIsLoading(false);
      return { ok: true };
    }

    setIsLoading(false);
    return { ok: false, error: 'Invalid Admin Credentials. Try admin@warmleads.ai / admin123' };
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
    setIsAuthenticated(false);
    if (typeof window !== 'undefined') {
      window.location.href = '/signin';
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthResponse } from '../types';
import { api } from '../api/client';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (email: string, pass: string, name: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('homefix_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const verifyToken = async () => {
      const storedToken = localStorage.getItem('homefix_token');
      if (storedToken) {
        try {
          const profile = await api.getCurrentUser();
          setUser({
            id: profile.id,
            email: profile.email,
            fullName: profile.fullName,
            role: profile.role,
          });
        } catch {
          // Token expired or invalid
          localStorage.removeItem('homefix_token');
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    verifyToken();
  }, []);

  const handleAuthSuccess = (data: AuthResponse) => {
    localStorage.setItem('homefix_token', data.token);
    setToken(data.token);
    setUser({
      id: data.id,
      email: data.email,
      fullName: data.fullName,
      role: data.role,
    });
  };

  const login = async (email: string, pass: string) => {
    const data = await api.login(email, pass);
    handleAuthSuccess(data);
  };

  const register = async (email: string, pass: string, name: string) => {
    const data = await api.register(email, pass, name);
    handleAuthSuccess(data);
  };

  const logout = () => {
    localStorage.removeItem('homefix_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

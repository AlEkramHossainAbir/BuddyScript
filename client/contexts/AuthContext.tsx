'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { getApiErrorMessage } from '@/lib/errors';
import { AuthUser } from '@/types/social';
import { toast } from 'react-toastify';

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (firstName: string, lastName: string, email: string, password: string) => Promise<void>;
  googleLogin: (codeOrToken: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const response = await api.get('/auth/me');
        setUser(response.data.user);
      }
    } catch {
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', response.data.token);
      setUser(response.data.user);
      toast.success('Login successful!');
      router.push('/feed');
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, 'Login failed'));
      throw error;
    }
  };

  const register = async (firstName: string, lastName: string, email: string, password: string) => {
    try {
      const response = await api.post('/auth/register', {
        firstName,
        lastName,
        email,
        password,
      });
      localStorage.setItem('token', response.data.token);
      setUser(response.data.user);
      toast.success('Registration successful!');
      router.push('/feed');
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, 'Registration failed'));
      throw error;
    }
  };

  const googleLogin = async (codeOrToken: string) => {
    try {
      // Send credential to backend - it could be either authorization code or access token
      // Backend will detect and handle appropriately
      const response = await api.post('/auth/google', { 
        token: codeOrToken  // Send as token for backward compatibility
      });
      localStorage.setItem('token', response.data.token);
      setUser(response.data.user);
      toast.success('Google login successful!');
      router.push('/feed');
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, 'Google login failed'));
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    toast.success('Logged out successfully');
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, googleLogin, logout }}>
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

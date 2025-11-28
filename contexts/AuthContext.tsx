"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AuthContextType {
  isLoggedIn: boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  checkAuth: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check authentication status on mount
    checkAuth();
  }, []);

  const checkAuth = (): boolean => {
    // Check cookies instead of localStorage
    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(';').shift();
      return undefined;
    };

    const loggedIn = getCookie('isLoggedIn') === 'true';
    const loginTime = getCookie('loginTime');
    
    if (loggedIn && loginTime) {
      const loginDate = new Date(loginTime);
      const now = new Date();
      const hoursDiff = (now.getTime() - loginDate.getTime()) / (1000 * 60 * 60);
      
      // Auto logout after 24 hours
      if (hoursDiff > 24) {
        logout();
        return false;
      }
      
      setIsLoggedIn(true);
      return true;
    }
    
    setIsLoggedIn(false);
    return false;
  };

  const login = (username: string, password: string): boolean => {
    if (username === 'admin' && password === 'admin') {
      // Set cookies for 24 hours
      const expires = new Date();
      expires.setTime(expires.getTime() + (24 * 60 * 60 * 1000));
      
      document.cookie = `isLoggedIn=true; path=/; expires=${expires.toUTCString()}`;
      document.cookie = `loginTime=${new Date().toISOString()}; path=/; expires=${expires.toUTCString()}`;
      
      setIsLoggedIn(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    // Clear cookies
    document.cookie = 'isLoggedIn=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
    document.cookie = 'loginTime=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
    
    setIsLoggedIn(false);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoggedIn: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
  loading: boolean;
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
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const checkAuth = async (): Promise<boolean> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      return !!session;
    } catch (error) {
      console.error('Error checking auth:', error);
      return false;
    }
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // Check hardcoded credentials from environment variables first
      const superadminEmail = process.env.NEXT_PUBLIC_SUPERADMIN_EMAIL;
      const superadminPassword = process.env.NEXT_PUBLIC_SUPERADMIN_PASSWORD;
      const karyawanEmail = process.env.NEXT_PUBLIC_KARYAWAN_EMAIL;
      const karyawanPassword = process.env.NEXT_PUBLIC_KARYAWAN_PASSWORD;
      const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
      const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;

      let role = '';
      let isValidCredentials = false;

      // Check Superadmin credentials
      if (email === superadminEmail && password === superadminPassword) {
        isValidCredentials = true;
        role = 'admin';
      }
      // Check Karyawan credentials
      else if (email === karyawanEmail && password === karyawanPassword) {
        isValidCredentials = true;
        role = 'karyawan';
      }
      // Check Admin credentials
      else if (email === adminEmail && password === adminPassword) {
        isValidCredentials = true;
        role = 'admin';
      }

      if (isValidCredentials) {
        // Create a mock user object for the hardcoded credentials
        const mockUser = {
          id: email === superadminEmail ? '1' : email === adminEmail ? '2' : '3',
          email: email,
          aud: 'authenticated',
          role: role,
          app_metadata: {
            provider: 'email',
            providers: ['email'],
            role: role
          },
          user_metadata: { role: role },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } as User;

        const mockSession = {
          user: mockUser,
          access_token: 'mock_access_token',
          refresh_token: 'mock_refresh_token',
          expires_in: 3600,
          token_type: 'bearer',
        } as Session;

        // Set session state
        setUser(mockUser);
        setSession(mockSession);

        // Set session cookies for middleware compatibility
        const expires = new Date();
        expires.setTime(expires.getTime() + (24 * 60 * 60 * 1000)); // 24 hours
        
        document.cookie = `isLoggedIn=true; path=/; expires=${expires.toUTCString()}`;
        document.cookie = `loginTime=${new Date().toISOString()}; path=/; expires=${expires.toUTCString()}`;
        document.cookie = `userRole=${role}; path=/; expires=${expires.toUTCString()}`;
        
        return { success: true };
      }

      // If hardcoded credentials don't match, try Supabase auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.user) {
        // Set session cookies for middleware compatibility
        const expires = new Date();
        expires.setTime(expires.getTime() + (24 * 60 * 60 * 1000)); // 24 hours
        
        document.cookie = `isLoggedIn=true; path=/; expires=${expires.toUTCString()}`;
        document.cookie = `loginTime=${new Date().toISOString()}; path=/; expires=${expires.toUTCString()}`;
        
        return { success: true };
      }

      return { success: false, error: 'Invalid login credentials' };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Terjadi kesalahan saat login' };
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      
      // Clear cookies
      document.cookie = 'isLoggedIn=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
      document.cookie = 'loginTime=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
      document.cookie = 'userRole=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
      
      setUser(null);
      setSession(null);
      
      // Redirect to login page
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const value: AuthContextType = {
    user,
    session,
    isLoggedIn: !!user,
    login,
    logout,
    checkAuth,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
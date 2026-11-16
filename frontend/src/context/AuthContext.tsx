import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  signIn: (token: string, user: User) => void;
  signOut: () => void;
  quickDemoLogin: (role: UserRole) => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const TOKEN_KEY = 'edu-tech-token';
const USER_KEY = 'edu-tech-user';

const DEMO_STUDENT: User = {
  id: 'usr-student-1',
  name: 'Rahul Sharma',
  email: 'rahul.sharma@novithra.tech',
  role: 'student',
  avatar: 'R',
  joinedDate: 'October 2026',
};

const DEMO_ADMIN: User = {
  id: 'usr-admin-1',
  name: 'Prachi Goyal (Staff)',
  email: 'prachi.admin@edutech.io',
  role: 'admin',
  avatar: 'P',
  joinedDate: 'September 2026',
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem(TOKEN_KEY) || 'demo-token-123';
  });

  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem(USER_KEY);
      return stored ? JSON.parse(stored) : DEMO_STUDENT;
    } catch {
      return DEMO_STUDENT;
    }
  });

  const signIn = (newToken: string, newUser: User) => {
    localStorage.setItem(TOKEN_KEY, newToken);
    localStorage.setItem(USER_KEY, JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const signOut = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  };

  const quickDemoLogin = (role: UserRole) => {
    const demoUser = role === 'admin' ? DEMO_ADMIN : DEMO_STUDENT;
    signIn(`demo-token-${role}`, demoUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        signIn,
        signOut,
        quickDemoLogin,
        isAuthenticated: !!token && !!user,
        isAdmin: user?.role === 'admin',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

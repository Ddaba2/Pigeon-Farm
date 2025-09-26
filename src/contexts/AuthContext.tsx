import React, { createContext, useContext, ReactNode } from 'react';
import { User } from '../types/types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  handleAuthSuccess: (user: User, message?: string) => void;
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
  handleAuthSuccess: (user: User, message?: string) => void;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children, handleAuthSuccess }) => {
  const login = async (email: string, password: string) => {
    // Cette fonction sera implémentée si nécessaire
    throw new Error('Login function not implemented');
  };

  const logout = () => {
    // Cette fonction sera implémentée si nécessaire
    throw new Error('Logout function not implemented');
  };

  const value: AuthContextType = {
    user: null,
    login,
    logout,
    handleAuthSuccess
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

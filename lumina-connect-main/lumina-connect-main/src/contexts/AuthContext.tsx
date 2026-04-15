import React, { createContext, useContext, useState, ReactNode } from 'react';
import { getAuthenticatedFaculty } from '@/data/dataService';

export type UserRole = 'faculty' | 'hod';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string | UserRole;
  designation: string;
  department: string;
  employeeId: string;
  avatar?: string;
  departmentId?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role: UserRole) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, password: string, role: UserRole): Promise<boolean> => {
    if (email && password) {
      const userDoc = await getAuthenticatedFaculty(email, password, role);
      if (userDoc) {
        setUser({
          ...userDoc,
          role: userDoc.role.toLowerCase() as UserRole,
        });
        return true;
      }
    }
    return false;
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}

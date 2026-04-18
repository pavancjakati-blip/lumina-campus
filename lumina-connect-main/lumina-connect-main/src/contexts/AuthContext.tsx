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
  const [user, setUser] = useState<User | null>(() => {
    try {
      const facultyStr = localStorage.getItem('lumina_faculty');
      if (facultyStr) {
        const parsed = JSON.parse(facultyStr);
        return {
          ...parsed,
          role: (parsed.role || 'faculty').toLowerCase() as UserRole
        };
      }
    } catch {
      localStorage.removeItem('lumina_token');
      localStorage.removeItem('lumina_faculty');
    }
    return null;
  });

  const login = async (email: string, password: string, role: UserRole): Promise<boolean> => {
    if (email && password) {
      try {
        const response = await getAuthenticatedFaculty(email, password, role);
        
        // Handle new API response format { success, token, faculty }
        if (response && response.success && response.faculty) {
          localStorage.setItem('lumina_token', response.token);
          localStorage.setItem('lumina_faculty', JSON.stringify(response.faculty));
          
          setUser({
            ...response.faculty,
            role: response.faculty.role.toLowerCase() as UserRole,
          });
          return true;
        } 
        // Fallback for legacy format
        else if (response && response.id) {
          setUser({
            ...response,
            role: response.role.toLowerCase() as UserRole,
          });
          return true;
        }
      } catch (err: any) {
        throw err;
      }
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem('lumina_token');
    localStorage.removeItem('lumina_faculty');
    setUser(null);
    // Hard-redirect so ProtectedRoute doesn't flash a blank screen
    window.location.replace('/login');
  };

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

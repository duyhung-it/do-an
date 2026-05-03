// ============================================================
// Auth Context — CELLPHONES Store
// ============================================================

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { authApi } from '../services/api';
import type { AuthUser, LoginCredentials, RegisterData, UserRole } from '../types';

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<AuthUser>;
  register: (data: RegisterData) => Promise<AuthUser>;
  logout: () => Promise<void>;
  isRole: (role: UserRole) => boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authApi.getCurrentUser()
      .then(u => setUser(u))
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (credentials: LoginCredentials): Promise<AuthUser> => {
    const authUser = await authApi.login(credentials);
    localStorage.setItem('cellphones_auth_user', JSON.stringify(authUser));
    setUser(authUser);
    return authUser;
  }, []);

  const register = useCallback(async (data: RegisterData): Promise<AuthUser> => {
    const authUser = await authApi.register(data);
    localStorage.setItem('cellphones_auth_user', JSON.stringify(authUser));
    setUser(authUser);
    return authUser;
  }, []);

  const logout = useCallback(async () => {
    await authApi.logout();
    localStorage.removeItem('cellphones_auth_user');
    setUser(null);
  }, []);

  const isRole = useCallback((role: UserRole) => user?.role === role, [user]);
  const isAdmin = user?.role === 'Quản trị viên';

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      register,
      logout,
      isRole,
      isAuthenticated: !!user,
      isAdmin,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth phải được dùng bên trong AuthProvider');
  return ctx;
}
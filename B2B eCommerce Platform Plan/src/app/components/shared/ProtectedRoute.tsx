// ============================================================
// Route bảo vệ — Chặn truy cập nếu chưa đăng nhập / sai role
// ============================================================

import { Navigate, useLocation } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import type { UserRole } from '../../types';
import { normalizeRole } from '../../utils/roles';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (allowedRoles && user && !allowedRoles.some(role => normalizeRole(role) === normalizeRole(user.role))) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center space-y-4">
          <div className="h-16 w-16 mx-auto rounded-full bg-destructive/10 flex items-center justify-center">
            <span className="text-destructive text-2xl">403</span>
          </div>
          <h2>Không có quyền truy cập</h2>
          <p className="text-muted-foreground">
            Tài khoản <span className="font-medium">{user.role}</span> không được phép truy cập trang này.
          </p>
          <a href="/" className="text-primary hover:underline">Quay về trang chủ</a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

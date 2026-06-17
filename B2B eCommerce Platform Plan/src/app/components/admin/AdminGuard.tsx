// ============================================================
// Guard cho khu vực Admin — Chỉ cho phép Quản trị viên
// ============================================================

import { Outlet } from 'react-router';
import { ProtectedRoute } from '../shared/ProtectedRoute';

export function AdminGuard() {
  return (
    <ProtectedRoute allowedRoles={['ADMIN']}>
      <Outlet />
    </ProtectedRoute>
  );
}

// ============================================================
// Guard cho khu vực Seller — Yêu cầu đăng nhập + role phù hợp
// ============================================================

import { Outlet } from 'react-router';
import { ProtectedRoute } from '../shared/ProtectedRoute';

export function SellerGuard() {
  return (
    <ProtectedRoute allowedRoles={['Nhà cung cấp', 'Quản trị viên']}>
      <Outlet />
    </ProtectedRoute>
  );
}

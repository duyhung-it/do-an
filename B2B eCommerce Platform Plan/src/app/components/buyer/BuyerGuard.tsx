// ============================================================
// Guard cho route Buyer cần đăng nhập (giỏ hàng, đơn hàng, chat)
// ============================================================

import { Outlet } from 'react-router';
import { ProtectedRoute } from '../shared/ProtectedRoute';

export function BuyerGuard() {
  return (
    <ProtectedRoute>
      <Outlet />
    </ProtectedRoute>
  );
}

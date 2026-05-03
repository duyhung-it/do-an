// ============================================================
// Mobile Bottom Navigation — Thanh nav cố định cuối (Nhóm 22E.03)
// Hiện trên mobile cho Buyer
// ============================================================

import { Link, useLocation } from 'react-router';
import { Home, Package, ClipboardList, Heart, User } from 'lucide-react';

const items = [
  { path: '/', label: 'Trang chủ', icon: Home },
  { path: '/products', label: 'Sản phẩm', icon: Package },
  { path: '/orders', label: 'Đơn hàng', icon: ClipboardList },
  { path: '/wishlist', label: 'Yêu thích', icon: Heart },
  { path: '/profile', label: 'Tài khoản', icon: User },
];

export function MobileBottomNav() {
  const location = useLocation();

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-40 bg-background border-t lg:hidden"
      role="navigation"
      aria-label="Điều hướng mobile"
    >
      <div className="flex items-center justify-around h-14">
        {items.map(item => {
          const isActive = item.path === '/'
            ? location.pathname === '/'
            : location.pathname.startsWith(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center gap-0.5 flex-1 h-full min-w-[44px] min-h-[44px] transition-colors ${
                isActive ? 'text-primary' : 'text-muted-foreground'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-[10px] leading-tight">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

// ============================================================
// Customer Dashboard — Tài khoản của tôi (CELLPHONES Store B2C)
// ============================================================

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import {
  ShoppingCart, Package, Truck, Heart, Shield, Award, Gem,
  RotateCcw, Smartphone, Search, Bell, ChevronRight, Star,
} from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Skeleton } from '../ui/skeleton';
import { StatusBadge } from '../shared/StatusBadge';
import { StatsCard } from '../shared/StatsCard';
import { DashboardWidget } from '../shared/DashboardWidget';
import { useAuth } from '../../context/AuthContext';
import { orderApi, wishlistApi } from '../../services/api';
import { warrantyApi } from '../../services/warrantyApi';
import { loyaltyApi } from '../../services/loyaltyApi';
import type { Order, WishlistItem, WarrantyItem, LoyaltyProgram } from '../../types';

const formatVND = (v: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(v);

const timeAgo = (dateStr: string) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins} phút trước`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} giờ trước`;
  return `${Math.floor(hours / 24)} ngày trước`;
};

const QUICK_ACTIONS = [
  { icon: ShoppingCart, label: 'Mua sắm', path: '/products', color: 'from-red-500 to-rose-600' },
  { icon: Search, label: 'Kiểm tra IMEI', path: '/imei-check', color: 'from-blue-500 to-indigo-600' },
  { icon: RotateCcw, label: 'Thu cũ đổi mới', path: '/trade-in', color: 'from-emerald-500 to-teal-600' },
  { icon: Shield, label: 'Bảo hành', path: '/warranty', color: 'from-amber-500 to-orange-500' },
  { icon: Smartphone, label: 'Tìm điện thoại', path: '/phone-finder', color: 'from-violet-500 to-purple-600' },
  { icon: Heart, label: 'Yêu thích', path: '/wishlist', color: 'from-pink-500 to-rose-500' },
  { icon: Package, label: 'Đơn hàng', path: '/orders', color: 'from-cyan-500 to-blue-500' },
  { icon: Award, label: 'Điểm thưởng', path: '/loyalty', color: 'from-yellow-500 to-amber-500' },
];

function DashboardSkeleton() {
  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <Skeleton className="h-28 rounded-2xl" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
      </div>
      <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
        {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-64 rounded-xl" />)}
      </div>
    </div>
  );
}

export function BuyerDashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const userId = user?.id ?? 'user-001';

  const [loading, setLoading] = useState(true);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [warranties, setWarranties] = useState<WarrantyItem[]>([]);
  const [loyalty, setLoyalty] = useState<LoyaltyProgram | null>(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      orderApi.getByCustomer(userId).catch(() => []),
      wishlistApi.get(userId).catch(() => []),
      warrantyApi.getByCustomer(userId).catch(() => []),
      loyaltyApi.getProgram(userId).catch(() => null),
    ]).then(([orders, wl, wr, lp]) => {
      setRecentOrders((orders as Order[]).slice(0, 5));
      setWishlist((wl as WishlistItem[]).slice(0, 5));
      setWarranties((wr as WarrantyItem[]).filter(w => w.status === 'Còn bảo hành').slice(0, 4));
      setLoyalty(lp as LoyaltyProgram | null);
      setLoading(false);
    });
  }, [userId]);

  if (loading) return <DashboardSkeleton />;

  const totalOrders = recentOrders.length;
  const deliveringCount = recentOrders.filter(o => o.status === 'Đang giao hàng').length;
  const completedCount = recentOrders.filter(o => o.status === 'Đã giao').length;

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl p-5 sm:p-6 text-white"
        style={{ background: 'linear-gradient(135deg, #c91432 0%, #e31837 50%, #ff4757 100%)' }}
      >
        <div className="absolute top-0 right-0 w-56 h-56 rounded-full bg-white/10 -translate-y-1/3 translate-x-1/4 blur-3xl" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black mb-1">
              Xin chào, {user?.fullName ?? 'bạn'} 👋
            </h1>
            <p className="text-red-100 text-sm">
              Chào mừng quay trở lại với CELLPHONES
              {loyalty && <> · Bạn đang là khách hàng <span className="font-semibold text-yellow-200">{loyalty.tier}</span></>}
            </p>
          </div>
          <Link to="/products">
            <Button variant="secondary" className="bg-white text-[#e31837] hover:bg-red-50">
              <ShoppingCart className="h-4 w-4 mr-2" /> Mua sắm ngay
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Tổng đơn hàng" value={totalOrders} icon={Package} variant="primary" onClick={() => navigate('/orders')} />
        <StatsCard title="Đang giao" value={deliveringCount} icon={Truck} variant="warning" />
        <StatsCard title="Đã hoàn thành" value={completedCount} icon={Award} variant="success" />
        <StatsCard title="Điểm thưởng" value={loyalty?.points ?? 0} icon={Gem} variant="info" onClick={() => navigate('/loyalty')} />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 sm:gap-3">
        {QUICK_ACTIONS.map(action => (
          <button
            key={action.path}
            onClick={() => navigate(action.path)}
            className="group flex flex-col items-center gap-2 p-2.5 rounded-xl hover:bg-muted/60 transition-all hover:scale-105 active:scale-95"
          >
            <div className={`h-11 w-11 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow`}>
              <action.icon className="h-5 w-5 text-white" />
            </div>
            <span className="text-muted-foreground text-xs text-center group-hover:text-foreground transition-colors font-medium leading-tight">
              {action.label}
            </span>
          </button>
        ))}
      </div>

      {/* Main Widgets */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Đơn hàng gần đây */}
        <DashboardWidget title="Đơn hàng gần đây" onViewAll={() => navigate('/orders')}>
          <div className="space-y-1.5">
            {recentOrders.length > 0 ? recentOrders.map(order => (
              <Link
                key={order.id}
                to={`/orders/${order.id}`}
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-muted/60 transition-colors group"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate group-hover:text-primary transition-colors text-sm font-medium">{order.orderNumber}</p>
                  <p className="text-muted-foreground text-xs mt-0.5">{timeAgo(order.createdAt)}</p>
                </div>
                <div className="text-right shrink-0 ml-3">
                  <p className="text-sm font-semibold">{formatVND(order.totalAmount)}</p>
                  <StatusBadge status={order.status} size="sm" className="mt-0.5" />
                </div>
              </Link>
            )) : (
              <EmptyWidget icon={Package} text="Chưa có đơn hàng nào" />
            )}
          </div>
        </DashboardWidget>

        {/* Loyalty Card */}
        {loyalty && (
          <DashboardWidget title="Khách hàng thân thiết" onViewAll={() => navigate('/loyalty')}>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div
                  className="h-14 w-14 rounded-2xl flex items-center justify-center shadow-md"
                  style={{
                    background: loyalty.tier === 'Kim cương'
                      ? 'linear-gradient(135deg, #67e8f9, #06b6d4)'
                      : loyalty.tier === 'Vàng'
                      ? 'linear-gradient(135deg, #fde047, #f59e0b)'
                      : loyalty.tier === 'Bạc'
                      ? 'linear-gradient(135deg, #e2e8f0, #94a3b8)'
                      : 'linear-gradient(135deg, #fdba74, #ea580c)',
                  }}
                >
                  <Gem className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-lg font-bold">{loyalty.points.toLocaleString('vi-VN')} điểm</p>
                  <p className="text-sm text-muted-foreground">Hạng {loyalty.tier}</p>
                </div>
              </div>
              <div className="bg-muted/50 rounded-lg p-3 text-xs text-muted-foreground">
                <p>Tích điểm với mỗi đơn hàng để nhận ưu đãi đặc biệt!</p>
              </div>
            </div>
          </DashboardWidget>
        )}

        {/* Bảo hành */}
        <DashboardWidget title="Bảo hành đang hoạt động" onViewAll={() => navigate('/warranty')}>
          <div className="space-y-1.5">
            {warranties.length > 0 ? warranties.map(w => (
              <div key={w.id} className="flex items-center justify-between p-2.5 rounded-xl hover:bg-muted/60 transition-colors">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Shield className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    <p className="truncate text-sm font-medium">{w.productName}</p>
                  </div>
                  <p className="text-muted-foreground text-xs mt-0.5">SN: {w.serialNumber}</p>
                </div>
                <div className="text-right shrink-0 ml-3">
                  <p className="text-xs text-muted-foreground">Hết hạn</p>
                  <p className="text-xs font-medium">{w.warrantyEndDate}</p>
                </div>
              </div>
            )) : (
              <EmptyWidget icon={Shield} text="Chưa có sản phẩm bảo hành" />
            )}
          </div>
        </DashboardWidget>

        {/* Wishlist */}
        <DashboardWidget title="Sản phẩm yêu thích" onViewAll={() => navigate('/wishlist')}>
          <div className="space-y-1.5">
            {wishlist.length > 0 ? wishlist.map(item => (
              <div key={item.id} className="flex items-center justify-between p-2.5 rounded-xl hover:bg-muted/60 transition-colors">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{item.productName}</p>
                  <p className="text-muted-foreground text-xs mt-0.5">{formatVND(item.price)}</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs px-2 shrink-0 ml-3"
                  onClick={() => navigate(`/products/${item.productId}`)}
                >
                  <ShoppingCart className="mr-1 h-3 w-3" /> Mua
                </Button>
              </div>
            )) : (
              <EmptyWidget icon={Heart} text="Chưa có sản phẩm yêu thích" />
            )}
          </div>
        </DashboardWidget>

        {/* Khám phá thêm */}
        <DashboardWidget title="Khám phá thêm">
          <div className="space-y-2">
            <Link to="/promotions" className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-red-50 to-orange-50 hover:from-red-100 hover:to-orange-100 transition-colors">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-red-500 flex items-center justify-center"><Star className="h-4 w-4 text-white" /></div>
                <div>
                  <p className="text-sm font-semibold">Khuyến mãi hot</p>
                  <p className="text-xs text-muted-foreground">Ưu đãi cực sốc</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Link>
            <Link to="/blog" className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100 transition-colors">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-blue-500 flex items-center justify-center"><Bell className="h-4 w-4 text-white" /></div>
                <div>
                  <p className="text-sm font-semibold">Tin công nghệ</p>
                  <p className="text-xs text-muted-foreground">Cập nhật mới nhất</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Link>
            <Link to="/stores" className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-emerald-50 to-teal-50 hover:from-emerald-100 hover:to-teal-100 transition-colors">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-emerald-500 flex items-center justify-center"><Smartphone className="h-4 w-4 text-white" /></div>
                <div>
                  <p className="text-sm font-semibold">Hệ thống cửa hàng</p>
                  <p className="text-xs text-muted-foreground">200+ điểm bán toàn quốc</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Link>
          </div>
        </DashboardWidget>
      </div>
    </div>
  );
}

function EmptyWidget({ icon: Icon, text }: { icon: React.ElementType; text: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
      <div className="h-12 w-12 rounded-2xl bg-muted/60 flex items-center justify-center mb-2">
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-sm">{text}</p>
    </div>
  );
}

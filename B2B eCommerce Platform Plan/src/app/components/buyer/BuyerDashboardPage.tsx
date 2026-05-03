// ============================================================
// Buyer Dashboard — Trang tổng quan (P1 Đợt 1: P1.01–P1.10)
// Redesign: Welcome banner, StatsCard, Quick actions, Charts,
// DashboardWidget, "Cần xử lý", "Nhắc nhở", skeleton, mobile
// ============================================================

import { useState, useEffect, useMemo, useCallback, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router';
import {
  ShoppingCart, FileText, Zap, Package, ScrollText, CreditCard,
  Truck, TrendingUp, ArrowRight, Heart, AlertTriangle,
  DollarSign, BarChart3, Calendar, Users, ClipboardCheck,
  Wallet, Award, Gem, RotateCcw, Send, Undo2, FileBarChart,
  Clock, XCircle, CheckCircle2, Bell, ChevronRight,
  AreaChart as AreaChartIcon, BarChart as BarChartIcon, LineChart as LineChartIcon,
} from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Skeleton } from '../ui/skeleton';
import { StatusBadge } from '../shared/StatusBadge';
import { StatsCard } from '../shared/StatsCard';
import { DashboardWidget } from '../shared/DashboardWidget';
import { IconWrapper } from '../shared/IconWrapper';
import { AnimatedNumber } from '../shared/AnimatedNumber';
import { ProgressRing } from '../shared/ProgressRing';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Line,
  ComposedChart,
} from 'recharts';
import { useAuth } from '../../context/AuthContext';
import { buyerDashboardApi } from '../../services/buyerDashboardApi';
import { buyerTeamApi } from '../../services/api';
import { prApi } from '../../services/prApi';
import { analyticsApi } from '../../services/analyticsApi';
import { loyaltyApi } from '../../services/loyaltyApi';
import type {
  BuyerDashboardStats, BuyerSpendingTrend, BuyerSupplierSpend,
  BuyerOrderTrend, Order, Shipment, Payment, WishlistItem, OrderTemplate,
  BuyerTeamStats, PRStats, ProcurementKPI, LoyaltyProgram,
} from '../../types';

// ─── Constants ────────────────────────────────────────────
type Period = '7d' | '30d' | '90d' | 'custom';
type ChartType = 'area' | 'bar' | 'line';

const PIE_COLORS = ['#2563eb', '#7c3aed', '#059669', '#d97706', '#ec4899', '#0891b2', '#6366f1', '#f43f5e'];

const GRADIENT_ID = 'spendingGradient';

const formatVND = (v: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(v);

const formatShort = (v: number) => {
  if (v >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(1)} tỷ`;
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(0)} tr`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(0)}K`;
  return String(v);
};

const timeAgo = (dateStr: string) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins} phút trước`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} giờ trước`;
  return `${Math.floor(hours / 24)} ngày trước`;
};

// ─── Quick Action Item ────────────────────────────────────
interface QuickActionItem {
  icon: React.ElementType;
  label: string;
  path: string;
  color: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'purple' | 'neutral';
}

const QUICK_ACTIONS: QuickActionItem[] = [
  { icon: ShoppingCart, label: 'Đặt hàng', path: '/products', color: 'primary' },
  { icon: Zap, label: 'Đặt nhanh', path: '/quick-order', color: 'warning' },
  { icon: FileText, label: 'Báo giá', path: '/rfq/new', color: 'purple' },
  { icon: ScrollText, label: 'Hợp đồng', path: '/contracts', color: 'info' },
  { icon: Undo2, label: 'Trả hàng', path: '/returns', color: 'danger' },
  { icon: CreditCard, label: 'Thanh toán', path: '/payments', color: 'success' },
  { icon: Package, label: 'Kho hàng', path: '/grn', color: 'neutral' },
  { icon: FileBarChart, label: 'Báo cáo', path: '/analytics', color: 'primary' },
];

// ─── Urgency Item ─────────────────────────────────────────
interface UrgencyItem {
  icon: React.ElementType;
  label: string;
  count: number;
  color: 'warning' | 'danger' | 'info' | 'primary';
  path: string;
}

// ─── Custom Tooltip ───────────────────────────────────────
function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border bg-card/95 backdrop-blur-sm shadow-lg p-3 min-w-[160px]">
      <p className="text-muted-foreground mb-1.5">{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: p.color }} />
            <span className="text-muted-foreground">{p.name}</span>
          </span>
          <span style={{ fontFamily: 'var(--font-heading)' }}>
            {typeof p.value === 'number' && p.value > 100000 ? formatVND(p.value) : p.value?.toLocaleString('vi-VN')}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Skeleton Loading ─────────────────────────────────────
function DashboardSkeleton() {
  return (
    <div className="container mx-auto px-4 py-6 space-y-6 animate-in fade-in duration-300">
      {/* Welcome banner skeleton */}
      <Skeleton className="h-28 rounded-2xl" />
      {/* Stats skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="border-l-4 border-l-muted">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-8 w-28" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="h-11 w-11 rounded-xl" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {/* Quick actions skeleton */}
      <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-2 p-3">
            <Skeleton className="h-11 w-11 rounded-xl" />
            <Skeleton className="h-3 w-12" />
          </div>
        ))}
      </div>
      {/* Charts skeleton */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2"><Skeleton className="h-80 rounded-xl" /></div>
        <Skeleton className="h-80 rounded-xl" />
      </div>
      {/* Widgets skeleton */}
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-64 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────
export function BuyerDashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const userId = user?.id ?? 'user-001';

  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<Period>('30d');
  const [chartType, setChartType] = useState<ChartType>('area');

  const [stats, setStats] = useState<BuyerDashboardStats | null>(null);
  const [spendingTrend, setSpendingTrend] = useState<BuyerSpendingTrend[]>([]);
  const [supplierSpend, setSupplierSpend] = useState<BuyerSupplierSpend[]>([]);
  const [orderTrend, setOrderTrend] = useState<BuyerOrderTrend[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [activeShipments, setActiveShipments] = useState<Shipment[]>([]);
  const [pendingPayments, setPendingPayments] = useState<Payment[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [templates, setTemplates] = useState<OrderTemplate[]>([]);
  const [teamStats, setTeamStats] = useState<BuyerTeamStats | null>(null);
  const [prStats, setPrStats] = useState<PRStats | null>(null);
  const [budgetOverview, setBudgetOverview] = useState<{
    totalBudgetYear: number; totalUsedYear: number; remainingYear: number; usagePercent: number;
    byDepartment: { department: string; allocated: number; used: number }[];
  } | null>(null);
  const [procKPIs, setProcKPIs] = useState<ProcurementKPI | null>(null);
  const [loyaltyProgram, setLoyaltyProgram] = useState<LoyaltyProgram | null>(null);

  useEffect(() => {
    setLoading(true);
    const monthsMap: Record<Period, number> = { '7d': 3, '30d': 6, '90d': 12, custom: 12 };
    const months = monthsMap[period];

    Promise.all([
      buyerDashboardApi.getStats(userId),
      buyerDashboardApi.getSpendingTrend(userId, months),
      buyerDashboardApi.getSupplierSpend(userId),
      buyerDashboardApi.getOrderTrend(userId, months),
      buyerDashboardApi.getRecentOrders(userId),
      buyerDashboardApi.getActiveShipments(userId),
      buyerDashboardApi.getPendingPayments(userId),
      buyerDashboardApi.getWishlistItems(userId),
      buyerDashboardApi.getFrequentTemplates(userId),
      buyerTeamApi.getStats('bcomp-001'),
      prApi.getStats('bcomp-001'),
    ]).then(([s, st, ss, ot, ro, as2, pp, wl, tp, ts, prs]) => {
      setStats(s);
      setSpendingTrend(st);
      setSupplierSpend(ss);
      setOrderTrend(ot);
      setRecentOrders(ro);
      setActiveShipments(as2);
      setPendingPayments(pp);
      setWishlist(wl);
      setTemplates(tp);
      setTeamStats(ts);
      setPrStats(prs);
      setLoading(false);
    });

    import('../../services/budgetApi').then(({ budgetApi }) => {
      budgetApi.getOverview('comp-001').then(setBudgetOverview);
    });
    analyticsApi.getProcurementKPIs().then(setProcKPIs);
    loyaltyApi.getProgram('bcomp-001').then(setLoyaltyProgram);
  }, [userId, period]);

  // Merge spending + order trend for combined chart
  const combinedTrend = useMemo(() => {
    return spendingTrend.map((item, idx) => ({
      month: item.month,
      amount: item.amount,
      orders: orderTrend[idx]?.count ?? 0,
    }));
  }, [spendingTrend, orderTrend]);

  // Urgency items
  const urgencyItems: UrgencyItem[] = useMemo(() => {
    if (!stats) return [];
    return [
      { icon: Clock, label: 'Chờ xác nhận', count: Math.max(2, Math.floor(stats.totalOrders * 0.15)), color: 'warning', path: '/orders?status=pending' },
      { icon: AlertTriangle, label: 'Thanh toán quá hạn', count: stats.pendingPayments > 0 ? Math.min(3, stats.pendingPayments) : 1, color: 'danger', path: '/payments?status=overdue' },
      { icon: Send, label: 'RFQ chờ phản hồi', count: stats.activeRFQs, color: 'info', path: '/rfq' },
      { icon: RotateCcw, label: 'Trả hàng đang xử lý', count: 1, color: 'warning', path: '/returns' },
      { icon: FileText, label: 'HĐ sắp hết hạn', count: 2, color: 'danger', path: '/contracts' },
      { icon: ClipboardCheck, label: 'PR chờ duyệt', count: prStats?.pending ?? 0, color: 'primary', path: '/pr-list' },
    ].filter(i => i.count > 0);
  }, [stats, prStats]);

  // Deadline reminders
  const reminders = useMemo(() => [
    { id: 1, icon: ScrollText, text: 'Hợp đồng #HD-2025-012 hết hạn trong 5 ngày', color: 'danger' as const, daysLeft: 5, path: '/contracts' },
    { id: 2, icon: CreditCard, text: 'Thanh toán #TT-2026-045 quá hạn 2 ngày', color: 'danger' as const, daysLeft: -2, path: '/payments' },
    { id: 3, icon: Package, text: 'Nhận hàng #GRN-089 chờ xác nhận', color: 'warning' as const, daysLeft: 1, path: '/grn' },
    { id: 4, icon: Award, text: 'Bạn sắp đạt hạng Vàng — còn thiếu 500 điểm', color: 'info' as const, daysLeft: 30, path: '/loyalty' },
  ], []);

  const handleNavigate = useCallback((path: string) => navigate(path), [navigate]);

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="container mx-auto px-4 py-6 space-y-6 animate-in fade-in duration-300">
      {/* ─── P1.08: Welcome Banner Premium ──────────────────── */}
      <div className="relative overflow-hidden rounded-2xl p-5 sm:p-6 text-white"
        style={{ background: 'linear-gradient(135deg, #0c1445 0%, #1a237e 40%, #283593 70%, #3949ab 100%)' }}
      >
        {/* Decorative orbs */}
        <div className="absolute top-0 right-0 w-56 h-56 rounded-full bg-indigo-400/15 -translate-y-1/3 translate-x-1/4 blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-40 h-40 rounded-full bg-blue-300/10 translate-y-1/2 blur-2xl" />
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'30\' height=\'30\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0 0h30v30H0z\' fill=\'none\' stroke=\'white\' stroke-width=\'.5\'/%3E%3C/svg%3E")' }} />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center backdrop-blur-sm">
                <Zap className="h-5 w-5 text-yellow-300" />
              </div>
              <h1 className="text-xl sm:text-2xl text-white font-black" style={{ fontFamily: 'var(--font-heading)' }}>
                Xin chào, {user?.fullName ?? 'bạn'} 👋
              </h1>
            </div>
            <p className="text-indigo-200/80 text-sm mt-1 ml-[52px]">
              Hôm nay bạn có 
              <span className="text-yellow-300 font-bold">{urgencyItems.reduce((s, i) => s + i.count, 0)}</span> mục cần xử lý
              {stats && <> · Tổng chi tiêu: <span className="text-white font-semibold">{formatShort(stats.totalSpent)} ₫</span></>}
            </p>
          </div>

          {/* P1.07: Period toggle */}
          <div className="flex items-center gap-1 bg-white/10 rounded-xl p-1 backdrop-blur-sm shrink-0 border border-white/15">
            {([
              { key: '7d' as Period, label: '7 ngày' },
              { key: '30d' as Period, label: '30 ngày' },
              { key: '90d' as Period, label: '90 ngày' },
            ]).map(p => (
              <button
                key={p.key}
                onClick={() => setPeriod(p.key)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  period === p.key
                    ? 'bg-white text-indigo-700 shadow-sm'
                    : 'text-indigo-200 hover:bg-white/10'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ─── P1.01: Stats Row ──────────────────────────────── */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Tổng đơn hàng"
            value={stats.totalOrders}
            icon={Package}
            variant="primary"
            trend={12.5}
            trendLabel="vs tháng trước"
            onClick={() => handleNavigate('/orders')}
          />
          <StatsCard
            title="Chờ xử lý"
            value={stats.pendingPayments + (prStats?.pending ?? 0)}
            icon={Clock}
            variant="warning"
            trend={-8.2}
            trendLabel="vs tháng trước"
          />
          <StatsCard
            title="Đã giao"
            value={Math.max(Math.floor(stats.totalOrders * 0.7), 5)}
            icon={CheckCircle2}
            variant="success"
            trend={15.3}
            trendLabel="vs tháng trước"
            onClick={() => handleNavigate('/orders?status=delivered')}
          />
          <StatsCard
            title="Tổng chi tiêu"
            value={stats.totalSpent}
            format={formatVND}
            icon={DollarSign}
            variant="info"
            trend={5.7}
            trendLabel="vs tháng trước"
            onClick={() => handleNavigate('/analytics')}
          />
        </div>
      )}

      {/* ─── P1.02: Quick Actions Grid ─────────────────────── */}
      <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 sm:gap-3">
        {QUICK_ACTIONS.map(action => {
          const colorMap: Record<string, string> = {
            primary: 'bg-gradient-to-br from-blue-500 to-indigo-600',
            success: 'bg-gradient-to-br from-emerald-500 to-teal-600',
            warning: 'bg-gradient-to-br from-amber-500 to-orange-500',
            danger: 'bg-gradient-to-br from-red-500 to-rose-600',
            info: 'bg-gradient-to-br from-cyan-500 to-blue-500',
            purple: 'bg-gradient-to-br from-violet-500 to-purple-600',
            neutral: 'bg-gradient-to-br from-slate-500 to-gray-600',
          };
          const grad = colorMap[action.color] ?? colorMap.neutral;
          return (
            <button
              key={action.path}
              onClick={() => handleNavigate(action.path)}
              className="group flex flex-col items-center gap-2 p-2.5 rounded-xl hover:bg-muted/60 transition-all hover:scale-105 active:scale-95 relative overflow-hidden"
            >
              <div className={`h-11 w-11 rounded-xl ${grad} flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow`}>
                <action.icon className="h-5 w-5 text-white" />
              </div>
              <span className="text-muted-foreground text-xs text-center group-hover:text-foreground transition-colors font-medium leading-tight">
                {action.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* ─── P1.03 + P1.04: Charts Row ────────────────────── */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Spending chart - 2/3 width */}
        <div className="lg:col-span-2">
          <DashboardWidget
            title="Chi tiêu & đơn hàng"
            onViewAll={() => handleNavigate('/analytics')}
            headerActions={
              <div className="flex items-center gap-0.5 bg-muted rounded-lg p-0.5">
                {([
                  { key: 'area' as ChartType, icon: AreaChartIcon },
                  { key: 'bar' as ChartType, icon: BarChartIcon },
                  { key: 'line' as ChartType, icon: LineChartIcon },
                ]).map(t => (
                  <button
                    key={t.key}
                    onClick={() => setChartType(t.key)}
                    className={`p-1.5 rounded-md transition-all ${
                      chartType === t.key ? 'bg-card shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'
                    }`}
                    title={t.key === 'area' ? 'Area' : t.key === 'bar' ? 'Bar' : 'Line'}
                  >
                    <t.icon className="h-3.5 w-3.5" />
                  </button>
                ))}
              </div>
            }
          >
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={combinedTrend}>
                  <defs>
                    <linearGradient id={GRADIENT_ID} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2563eb" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#2563eb" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} vertical={true} horizontal={true} />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
                  <YAxis yAxisId="left" tickFormatter={formatShort} tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
                  <Tooltip content={<ChartTooltip />} />
                  {chartType === 'area' && (
                    <Area key="area-spending" yAxisId="left" type="monotone" dataKey="amount" stroke="#2563eb" strokeWidth={2.5} fill={`url(#${GRADIENT_ID})`} name="Chi tiêu" />
                  )}
                  {chartType === 'bar' && (
                    <Bar key="bar-spending" yAxisId="left" dataKey="amount" fill="#2563eb" radius={[6, 6, 0, 0]} name="Chi tiêu" opacity={0.85} />
                  )}
                  {chartType === 'line' && (
                    <Line key="line-spending" yAxisId="left" type="monotone" dataKey="amount" stroke="#2563eb" strokeWidth={2.5} dot={{ r: 4, fill: '#2563eb' }} name="Chi tiêu" />
                  )}
                  <Line key="line-orders" yAxisId="right" type="monotone" dataKey="orders" stroke="#7c3aed" strokeWidth={2} strokeDasharray="5 3" dot={{ r: 3, fill: '#7c3aed' }} name="Đơn hàng" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </DashboardWidget>
        </div>

        {/* Supplier spend pie chart - 1/3 width */}
        <DashboardWidget title="Chi tiêu theo NCC" onViewAll={() => handleNavigate('/analytics')}>
          <div className="h-72 flex flex-col">
            <div className="flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={supplierSpend}
                    dataKey="amount"
                    nameKey="supplierName"
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={80}
                    paddingAngle={3}
                    cornerRadius={4}
                  >
                    {supplierSpend.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* Legend */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2">
              {supplierSpend.slice(0, 6).map((s, i) => (
                <div key={s.supplierId} className="flex items-center gap-1.5 min-w-0">
                  <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                  <span className="text-xs text-muted-foreground truncate">{s.supplierName}</span>
                </div>
              ))}
            </div>
          </div>
        </DashboardWidget>
      </div>

      {/* ─── P1.05: "Cần xử lý" + P1.06: "Nhắc nhở" ──── */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Cần xử lý */}
        <DashboardWidget title="Cần xử lý" className="overflow-visible">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {urgencyItems.map(item => (
              <button
                key={item.path + item.label}
                onClick={() => handleNavigate(item.path)}
                className="group relative flex items-center gap-3 p-3 rounded-xl border border-border/60 hover:border-primary/30 hover:bg-primary/5 transition-all"
              >
                <IconWrapper icon={item.icon} variant={item.color} size="sm" />
                <div className="min-w-0 text-left">
                  <span className="block text-lg" style={{ fontFamily: 'var(--font-heading)' }}>
                    {item.count}
                  </span>
                  <span className="block text-xs text-muted-foreground truncate">{item.label}</span>
                </div>
                <ChevronRight className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ))}
          </div>
        </DashboardWidget>

        {/* Nhắc nhở */}
        <DashboardWidget title="Nhắc nhở">
          <div className="space-y-2.5">
            {reminders.map(r => {
              const colorMap = {
                danger: 'border-l-red-500 bg-red-50/50 dark:bg-red-950/10',
                warning: 'border-l-amber-500 bg-amber-50/50 dark:bg-amber-950/10',
                info: 'border-l-blue-500 bg-blue-50/50 dark:bg-blue-950/10',
              };
              return (
                <button
                  key={r.id}
                  onClick={() => handleNavigate(r.path)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg border-l-[3px] text-left transition-all hover:shadow-sm ${colorMap[r.color]}`}
                >
                  <r.icon className={`h-4 w-4 shrink-0 ${
                    r.color === 'danger' ? 'text-red-500' : r.color === 'warning' ? 'text-amber-500' : 'text-blue-500'
                  }`} />
                  <span className="flex-1 text-sm">{r.text}</span>
                  {r.daysLeft < 0 && (
                    <span className="shrink-0 text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700">Quá hạn</span>
                  )}
                  {r.daysLeft > 0 && r.daysLeft <= 7 && (
                    <span className="shrink-0 text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">{r.daysLeft} ngày</span>
                  )}
                </button>
              );
            })}
          </div>
        </DashboardWidget>
      </div>

      {/* ─── P1.04: Recent Orders + Active Shipments + Pending Payments ─ */}
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Đơn hàng gần đây */}
        <DashboardWidget title="Đơn hàng gần đây" onViewAll={() => handleNavigate('/orders')}>
          <div className="space-y-1.5">
            {recentOrders.map(order => (
              <Link
                key={order.id}
                to={`/orders/${order.id}`}
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-muted/60 transition-colors group"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate group-hover:text-primary transition-colors">{order.orderNumber}</p>
                  <p className="text-muted-foreground text-xs mt-0.5">
                    {order.supplierName} · {timeAgo(order.createdAt)}
                  </p>
                </div>
                <div className="text-right shrink-0 ml-3">
                  <p className="text-sm" style={{ fontFamily: 'var(--font-heading)' }}>
                    {formatVND(order.totalAmount)}
                  </p>
                  <StatusBadge status={order.status} size="sm" className="mt-0.5" />
                </div>
              </Link>
            ))}
            {recentOrders.length === 0 && (
              <EmptyWidget icon={Package} text="Chưa có đơn hàng" />
            )}
          </div>
        </DashboardWidget>

        {/* Vận chuyển */}
        <DashboardWidget title="Đang vận chuyển" onViewAll={() => handleNavigate('/shipments')}>
          <div className="space-y-1.5">
            {activeShipments.map(s => (
              <div key={s.id} className="flex items-center justify-between p-2.5 rounded-xl hover:bg-muted/60 transition-colors">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Truck className="h-3.5 w-3.5 text-orange-500 shrink-0" />
                    <p className="truncate">{s.trackingNumber}</p>
                  </div>
                  <p className="text-muted-foreground text-xs mt-0.5 ml-5.5">{s.carrierName}</p>
                </div>
                <div className="text-right shrink-0 ml-3">
                  <StatusBadge status={s.status} size="sm" />
                  <p className="text-muted-foreground text-xs mt-0.5 flex items-center justify-end gap-1">
                    <Calendar className="h-3 w-3" />
                    {s.estimatedDelivery}
                  </p>
                </div>
              </div>
            ))}
            {activeShipments.length === 0 && (
              <EmptyWidget icon={Truck} text="Không có hàng đang giao" />
            )}
          </div>
        </DashboardWidget>

        {/* Thanh toán sắp hạn */}
        <DashboardWidget title="Thanh toán sắp hạn" onViewAll={() => handleNavigate('/payments')}>
          <div className="space-y-1.5">
            {pendingPayments.map(p => (
              <div key={p.id} className="flex items-center justify-between p-2.5 rounded-xl hover:bg-muted/60 transition-colors">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className={`h-3.5 w-3.5 shrink-0 ${p.status === 'Quá hạn' ? 'text-red-500' : 'text-amber-500'}`} />
                    <p className="truncate">{p.orderNumber}</p>
                  </div>
                  <p className="text-muted-foreground text-xs mt-0.5 ml-5.5">Hạn: {p.dueDate}</p>
                </div>
                <div className="text-right shrink-0 ml-3">
                  <p className="text-sm" style={{ fontFamily: 'var(--font-heading)' }}>
                    {formatVND(p.remainingAmount)}
                  </p>
                  <StatusBadge status={p.status} size="sm" className="mt-0.5" />
                </div>
              </div>
            ))}
            {pendingPayments.length === 0 && (
              <EmptyWidget icon={CreditCard} text="Không có khoản chờ thanh toán" />
            )}
          </div>
        </DashboardWidget>

        {/* Nhóm mua hàng */}
        {teamStats && (
          <DashboardWidget title="Nhóm mua hàng" onViewAll={() => handleNavigate('/team')}>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Thành viên', value: teamStats.totalMembers, variant: 'neutral' as const },
                  { label: 'Hoạt động', value: teamStats.activeMembers, variant: 'success' as const },
                  { label: 'Chờ xác nhận', value: teamStats.pendingInvites, variant: 'warning' as const },
                ].map(m => (
                  <div key={m.label} className="text-center p-3 rounded-xl bg-muted/40">
                    <span className="text-xl" style={{ fontFamily: 'var(--font-heading)' }}>{m.value}</span>
                    <p className="text-muted-foreground text-xs mt-0.5">{m.label}</p>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {teamStats.roles.filter(r => r.count > 0).map(r => (
                  <span key={r.role} className="inline-flex items-center gap-1 text-xs px-2.5 py-1 bg-muted/60 rounded-full">
                    {r.role}: {r.count}
                  </span>
                ))}
              </div>
            </div>
          </DashboardWidget>
        )}

        {/* PR Widget */}
        {prStats && (
          <DashboardWidget title="Yêu cầu mua hàng" onViewAll={() => handleNavigate('/pr-list')}>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Tổng PR', value: prStats.total, variant: 'neutral' as const },
                { label: 'Chờ duyệt', value: prStats.pending, variant: 'warning' as const },
                { label: 'Đã duyệt', value: prStats.approved, variant: 'success' as const },
              ].map(m => (
                <div key={m.label} className="text-center p-3 rounded-xl bg-muted/40">
                  <span className="text-xl" style={{ fontFamily: 'var(--font-heading)' }}>{m.value}</span>
                  <p className="text-muted-foreground text-xs mt-0.5">{m.label}</p>
                </div>
              ))}
            </div>
          </DashboardWidget>
        )}

        {/* Budget Widget */}
        {budgetOverview && budgetOverview.totalBudgetYear > 0 && (
          <DashboardWidget title="Ngân sách" onViewAll={() => handleNavigate('/budget')}>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <ProgressRing
                  value={budgetOverview.usagePercent}
                  size={72}
                  strokeWidth={6}
                  color={budgetOverview.usagePercent >= 80 ? '#ef4444' : budgetOverview.usagePercent >= 60 ? '#d97706' : '#2563eb'}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-muted-foreground">Đã sử dụng</p>
                  <p className="text-lg" style={{ fontFamily: 'var(--font-heading)' }}>
                    {formatShort(budgetOverview.totalUsedYear)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Còn lại: {formatVND(budgetOverview.remainingYear)}
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                {budgetOverview.byDepartment.map(d => {
                  const pct = d.allocated > 0 ? Math.round((d.used / d.allocated) * 100) : 0;
                  return (
                    <div key={d.department} className="flex items-center gap-2 text-sm">
                      <span className="w-20 truncate text-muted-foreground">{d.department}</span>
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${pct >= 80 ? 'bg-red-400' : pct >= 60 ? 'bg-amber-400' : 'bg-blue-400'}`}
                          style={{ width: `${Math.min(pct, 100)}%` }}
                        />
                      </div>
                      <span className={`text-xs w-10 text-right ${pct >= 80 ? 'text-red-600' : ''}`}>{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </DashboardWidget>
        )}

        {/* KPI Widget */}
        {procKPIs && (
          <DashboardWidget title="KPI mua hàng" onViewAll={() => handleNavigate('/analytics')}>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'TG xử lý ĐH', value: `${procKPIs.avgOrderCycleTime}d`, ok: procKPIs.avgOrderCycleTime <= 5 },
                { label: 'RFQ→ĐH', value: `${procKPIs.rfqToOrderConversionRate}%`, ok: procKPIs.rfqToOrderConversionRate >= 60 },
                { label: 'NCC đúng hạn', value: `${procKPIs.supplierOnTimeRate}%`, ok: procKPIs.supplierOnTimeRate >= 85 },
                { label: 'Tuân thủ HĐ', value: `${procKPIs.contractComplianceRate}%`, ok: procKPIs.contractComplianceRate >= 90 },
              ].map(k => (
                <div key={k.label} className="text-center p-3 rounded-xl bg-muted/40 border border-border/40">
                  <p className={`text-lg ${k.ok ? 'text-emerald-600' : 'text-amber-600'}`}
                     style={{ fontFamily: 'var(--font-heading)' }}>
                    {k.value}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">{k.label}</p>
                </div>
              ))}
            </div>
          </DashboardWidget>
        )}

        {/* Loyalty Widget */}
        {loyaltyProgram && (
          <DashboardWidget title="Chương trình thân thiết" onViewAll={() => handleNavigate('/loyalty')}>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div
                    className="h-14 w-14 rounded-2xl flex items-center justify-center shadow-md"
                    style={{
                      background: loyaltyProgram.tier === 'Kim cương'
                        ? 'linear-gradient(135deg, #67e8f9, #06b6d4)'
                        : loyaltyProgram.tier === 'Vàng'
                        ? 'linear-gradient(135deg, #fde047, #f59e0b)'
                        : loyaltyProgram.tier === 'Bạc'
                        ? 'linear-gradient(135deg, #e2e8f0, #94a3b8)'
                        : 'linear-gradient(135deg, #fdba74, #ea580c)',
                    }}
                  >
                    <Gem className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div>
                  <p className="text-lg" style={{ fontFamily: 'var(--font-heading)' }}>
                    <AnimatedNumber value={loyaltyProgram.currentPoints} /> điểm
                  </p>
                  <p className="text-sm text-muted-foreground">Hạng {loyaltyProgram.tier}</p>
                </div>
              </div>
              {loyaltyProgram.nextTierThreshold && (
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-muted-foreground">Đến {loyaltyProgram.nextTierName}</span>
                    <span style={{ fontFamily: 'var(--font-heading)' }}>
                      {Math.min(100, Math.round((loyaltyProgram.currentPoints / loyaltyProgram.nextTierThreshold) * 100))}%
                    </span>
                  </div>
                  <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-700"
                      style={{ width: `${Math.min(100, Math.round((loyaltyProgram.currentPoints / loyaltyProgram.nextTierThreshold) * 100))}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Còn thiếu {(loyaltyProgram.nextTierThreshold - loyaltyProgram.currentPoints).toLocaleString('vi-VN')} điểm
                  </p>
                </div>
              )}
            </div>
          </DashboardWidget>
        )}

        {/* Wishlist Widget */}
        <DashboardWidget title="Yêu thích" onViewAll={() => handleNavigate('/wishlist')}>
          <div className="space-y-1.5">
            {wishlist.map(item => (
              <div key={item.id} className="flex items-center justify-between p-2.5 rounded-xl hover:bg-muted/60 transition-colors">
                <div className="min-w-0 flex-1">
                  <p className="truncate">{item.productName}</p>
                  <p className="text-muted-foreground text-xs mt-0.5">{item.supplierName}</p>
                </div>
                <div className="text-right shrink-0 ml-3">
                  <p className="text-sm" style={{ fontFamily: 'var(--font-heading)' }}>
                    {formatVND(item.price)}
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-1 h-6 text-xs px-2"
                    onClick={() => handleNavigate(`/products/${item.productId}`)}
                  >
                    <ShoppingCart className="mr-1 h-3 w-3" /> Mua
                  </Button>
                </div>
              </div>
            ))}
            {wishlist.length === 0 && (
              <EmptyWidget icon={Heart} text="Chưa có sản phẩm yêu thích" />
            )}
          </div>
        </DashboardWidget>

        {/* Templates Widget */}
        <DashboardWidget title="Đơn hàng mẫu" onViewAll={() => handleNavigate('/templates')}>
          <div className="space-y-1.5">
            {templates.map(t => (
              <div key={t.id} className="flex items-center justify-between p-2.5 rounded-xl hover:bg-muted/60 transition-colors">
                <div className="min-w-0 flex-1">
                  <p className="truncate">{t.name}</p>
                  <p className="text-muted-foreground text-xs mt-0.5">
                    {t.items.length} SP · Dùng {t.usageCount} lần
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-6 text-xs px-2 shrink-0 ml-3"
                  onClick={() => handleNavigate('/templates')}
                >
                  Đặt lại
                </Button>
              </div>
            ))}
            {templates.length === 0 && (
              <EmptyWidget icon={FileText} text="Chưa có đơn hàng mẫu" />
            )}
          </div>
        </DashboardWidget>
      </div>
    </div>
  );
}

// ─── Empty Widget Helper ──────────────────────────────────
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
// ============================================================
// Dashboard Admin — Nâng cấp UI Premium
// KPIs gradient, Welcome Banner, Sparkline, Charts upgrade
// Activity timeline, Top NCC medals, Cần xử lý cards
// ============================================================

import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router';
import {
  TrendingUp, TrendingDown, Package, ClipboardList, DollarSign, Users, Building2,
  ShieldAlert, ArrowRight, ShieldCheck, AlertTriangle, RefreshCw,
  ScrollText, PackageCheck, Wallet, FileText, Activity, Zap,
  Crown, Medal, Award,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { AppBreadcrumb } from '../shared/AppBreadcrumb';
import { DashboardSkeleton } from '../shared/PageSkeleton';
import { StatusBadge } from '../shared/StatusBadge';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Switch } from '../ui/switch';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { dashboardApi, supplierApi } from '../../services/api';
import { adminApi, activityApi, certificateApi, invoiceApi } from '../../services/adminApi';
import type { DashboardStats, Order, Supplier, ActivityLog, AdminQuickStats } from '../../types';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, LineChart, Line,
} from 'recharts';

const COLORS = ['#6366f1', '#22c55e', '#eab308', '#ef4444', '#8b5cf6', '#f97316'];

const formatPrice = (price: number) =>
  new Intl.NumberFormat('vi-VN', { notation: 'compact' }).format(price);

const formatCurrency = (price: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

interface AdminStats extends DashboardStats {
  pendingProducts: number;
  pendingUsers: number;
  totalSuppliers: number;
  recentOrders: Order[];
}

function timeAgo(dateStr: string): string {
  const now = new Date();
  const d = new Date(dateStr.replace(' ', 'T'));
  const diffMin = Math.floor((now.getTime() - d.getTime()) / 60000);
  if (diffMin < 1) return 'Vừa xong';
  if (diffMin < 60) return `${diffMin}p trước`;
  const h = Math.floor(diffMin / 60);
  if (h < 24) return `${h}h trước`;
  return `${Math.floor(h / 24)}d trước`;
}

// Generate sparkline data
function genSpark(trend: 'up' | 'down' | 'flat') {
  const base = trend === 'up' ? 30 : trend === 'down' ? 70 : 50;
  const dir = trend === 'up' ? 6 : trend === 'down' ? -5 : 0;
  return Array.from({ length: 7 }, (_, i) => ({
    v: Math.max(5, base + dir * i + (Math.random() - 0.5) * 15),
  }));
}

// ===== KPI Card Premium =====
function KpiCard({ title, value, icon: Icon, growth, gradient, link, sparkTrend = 'flat' }: {
  title: string; value: string; icon: typeof DollarSign;
  growth?: number; gradient: string; link: string; sparkTrend?: 'up' | 'down' | 'flat';
}) {
  const isPositive = (growth ?? 0) >= 0;
  const sparkData = genSpark(sparkTrend);

  return (
    <Link to={link}>
      <Card className="border-0 shadow-sm hover:-translate-y-1 hover:shadow-lg transition-all duration-300 overflow-hidden group h-full">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${gradient} shadow-md group-hover:scale-110 transition-transform duration-300`}>
              <Icon className="h-5 w-5 text-white" />
            </div>
            <div className="w-16 h-8 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sparkData}>
                  <Line type="monotone" dataKey="v"
                    stroke={isPositive ? '#22c55e' : '#ef4444'}
                    strokeWidth={1.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          <p className="text-xl font-black text-foreground">{value}</p>
          <p className="text-sm text-muted-foreground mt-0.5">{title}</p>
          {growth !== undefined && Math.abs(growth) > 0 && (
            <div className={`flex items-center gap-1 mt-1.5 text-xs font-medium ${isPositive ? 'text-emerald-600' : 'text-red-500'}`}>
              {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              <span>{isPositive ? '+' : ''}{growth?.toFixed(1)}%</span>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

export function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [quickStats, setQuickStats] = useState<AdminQuickStats | null>(null);
  const [recentLogs, setRecentLogs] = useState<ActivityLog[]>([]);
  const [topSuppliers, setTopSuppliers] = useState<{ name: string; revenue: number; rating: number }[]>([]);
  const [invoiceStats, setInvoiceStats] = useState<{ total: number; overdue: number; totalTax: number } | null>(null);
  const [certPending, setCertPending] = useState(0);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const autoRefreshRef = useRef(autoRefresh);
  autoRefreshRef.current = autoRefresh;

  const fetchAll = useCallback(async () => {
    const [adminStats, quick, logs, allSuppliers, invStats, certStats] = await Promise.all([
      dashboardApi.getAdminStats(),
      adminApi.getQuickStats(),
      activityApi.getRecent(10),
      supplierApi.getAll(),
      invoiceApi.getStats(),
      certificateApi.getStats(),
    ]);
    setStats(adminStats);
    setQuickStats(quick);
    setRecentLogs(logs);
    setInvoiceStats({ total: invStats.total, overdue: invStats.overdue, totalTax: invStats.totalTax });
    setCertPending((certStats['Chưa xác minh'] || 0) + (certStats['Đang xem xét'] || 0));

    const sorted = [...allSuppliers].sort((a, b) => b.rating - a.rating).slice(0, 5);
    setTopSuppliers(sorted.map(s => ({
      name: s.companyName,
      revenue: Math.round(Math.random() * 500 + 100) * 1000000,
      rating: s.rating,
    })));
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => { if (autoRefreshRef.current) fetchAll(); }, 60000);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchAll]);

  if (!stats) return <DashboardSkeleton />;

  const kpiCards = [
    { title: 'Doanh thu', value: formatPrice(stats.totalRevenue) + ' ₫', icon: DollarSign, growth: stats.revenueGrowth, gradient: 'bg-gradient-to-br from-emerald-500 to-teal-600', link: '/admin/orders', sparkTrend: 'up' as const },
    { title: 'Đơn hàng', value: stats.totalOrders.toLocaleString(), icon: ClipboardList, growth: stats.orderGrowth, gradient: 'bg-gradient-to-br from-blue-500 to-indigo-600', link: '/admin/orders', sparkTrend: 'up' as const },
    { title: 'Sản phẩm', value: stats.totalProducts.toLocaleString(), icon: Package, gradient: 'bg-gradient-to-br from-violet-500 to-purple-600', link: '/admin/products', sparkTrend: 'flat' as const },
    { title: 'Người dùng', value: stats.totalUsers.toLocaleString(), icon: Users, gradient: 'bg-gradient-to-br from-orange-500 to-red-500', link: '/admin/users', sparkTrend: 'up' as const },
    { title: 'Nhà cung cấp', value: stats.totalSuppliers.toLocaleString(), icon: Building2, gradient: 'bg-gradient-to-br from-pink-500 to-rose-600', link: '/admin/suppliers', sparkTrend: 'flat' as const },
    { title: 'Thuế GTGT', value: formatPrice(invoiceStats?.totalTax ?? 0) + ' ₫', icon: FileText, gradient: 'bg-gradient-to-br from-cyan-500 to-blue-500', link: '/admin/invoices', sparkTrend: 'up' as const },
  ];

  const pendingItems = [
    { label: 'Sản phẩm chờ duyệt', count: stats.pendingProducts, link: '/admin/products', icon: PackageCheck, gradient: 'bg-gradient-to-br from-amber-400 to-orange-500' },
    { label: 'Chứng chỉ chờ duyệt', count: certPending, link: '/admin/certificates', icon: ShieldCheck, gradient: 'bg-gradient-to-br from-blue-500 to-indigo-600' },
    { label: 'Công nợ quá hạn', count: quickStats?.overduePayments ?? 0, link: '/admin/payments', icon: Wallet, gradient: 'bg-gradient-to-br from-red-500 to-rose-600' },
    { label: 'Đơn tranh chấp', count: quickStats?.disputeOrders ?? 0, link: '/admin/orders', icon: AlertTriangle, gradient: 'bg-gradient-to-br from-orange-500 to-amber-600' },
    { label: 'HĐ sắp hết hạn', count: quickStats?.expiringContracts ?? 0, link: '/admin/contracts', icon: ScrollText, gradient: 'bg-gradient-to-br from-purple-500 to-violet-600' },
    { label: 'Hoá đơn quá hạn', count: invoiceStats?.overdue ?? 0, link: '/admin/invoices', icon: FileText, gradient: 'bg-gradient-to-br from-pink-500 to-rose-600' },
  ].filter(item => item.count > 0);

  const rankIcons = [Crown, Medal, Award];

  return (
    <div className="space-y-6">
      <AppBreadcrumb items={[{ label: 'Quản trị', href: '/admin' }, { label: 'Tổng quan' }]} />

      {/* Welcome Banner */}
      <div className="rounded-2xl relative overflow-hidden p-5 sm:p-6 text-white"
        style={{ background: 'linear-gradient(135deg, #0d0f1a 0%, #312e81 50%, #4f46e5 100%)' }}
      >
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-indigo-400/10 -translate-y-1/2 translate-x-1/4 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 w-48 h-48 rounded-full bg-purple-500/10 translate-y-1/2 blur-2xl" />
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0 0h40v40H0z\' fill=\'none\' stroke=\'white\' stroke-width=\'.5\'/%3E%3C/svg%3E")' }}
        />
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center shrink-0">
              <Zap className="h-6 w-6 text-yellow-300" />
            </div>
            <div>
              <h2 className="text-white font-bold text-lg">Tổng quan hệ thống</h2>
              <p className="text-indigo-200/80 mt-0.5 text-sm">
                <span className="text-yellow-200 font-semibold">{stats.totalOrders}</span> đơn hàng ·
                Doanh thu: <span className="text-white font-semibold">{formatPrice(stats.totalRevenue)} ₫</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-2 bg-white/10 rounded-xl px-3 py-2">
              <Switch checked={autoRefresh} onCheckedChange={setAutoRefresh} className="scale-90" />
              <span className="text-white/70 text-xs whitespace-nowrap">{autoRefresh ? 'Auto (60s)' : 'Thủ công'}</span>
            </div>
            <Button
              variant="secondary" size="sm"
              className="bg-white/15 text-white border-white/20 hover:bg-white/25 backdrop-blur-sm"
              onClick={fetchAll}
            >
              <RefreshCw className="mr-1 h-4 w-4" /> Làm mới
            </Button>
          </div>
        </div>
      </div>

      {/* Cần xử lý */}
      {pendingItems.length > 0 && (
        <Card className="border-0 shadow-sm overflow-hidden">
          <CardHeader className="pb-3 bg-amber-50/50 dark:bg-amber-950/10 border-b border-amber-100 dark:border-amber-900/30">
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Cần xử lý
              <Badge className="bg-amber-500 text-white ml-1">{pendingItems.reduce((s, i) => s + i.count, 0)}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {pendingItems.map(item => (
                <Link key={item.label} to={item.link}>
                  <div className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-muted/50 transition-all hover:scale-105 active:scale-95 cursor-pointer group">
                    <div className={`h-11 w-11 rounded-xl ${item.gradient} flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow relative`}>
                      <item.icon className="h-5 w-5 text-white" />
                      <span className="absolute -top-1.5 -right-1.5 h-5 min-w-5 px-1 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center shadow-sm font-bold">
                        {item.count}
                      </span>
                    </div>
                    <span className="text-xs text-center text-muted-foreground group-hover:text-foreground transition-colors leading-tight">{item.label}</span>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* KPI Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {kpiCards.map(card => (
          <KpiCard key={card.title} {...card} />
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-indigo-500" /> Doanh thu theo tháng
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.revenueByMonth}>
                  <defs>
                    <linearGradient id="gradAdmin" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(value: number) => [formatPrice(value * 1000000) + ' ₫', 'Doanh thu']} />
                  <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2.5} fill="url(#gradAdmin)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-blue-500" /> Đơn hàng theo trạng thái
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.ordersByStatus}
                    cx="50%" cy="50%"
                    innerRadius={55} outerRadius={85}
                    dataKey="count" nameKey="status"
                    paddingAngle={3}
                  >
                    {stats.ordersByStatus.map((entry, index) => (
                      <Cell key={`cell-${index}-${entry.status}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row: Đơn gần đây + Hoạt động + Top NCC */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Đơn hàng gần đây */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold">Đơn hàng gần đây</CardTitle>
            <Link to="/admin/orders" className="text-primary hover:underline flex items-center gap-1 text-sm">
              Tất cả <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats.recentOrders.map(order => (
                <div key={order.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="min-w-0">
                    <p className="font-semibold text-sm">{order.orderNumber}</p>
                    <p className="text-muted-foreground text-xs truncate">{order.buyerName}</p>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <p className="text-primary text-sm font-semibold">{formatCurrency(order.totalAmount)}</p>
                    <StatusBadge status={order.status} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Hoạt động gần nhất — Timeline */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Activity className="h-4 w-4 text-indigo-500" /> Hoạt động gần nhất
            </CardTitle>
            <Link to="/admin/activity-log" className="text-primary hover:underline flex items-center gap-1 text-sm">
              Tất cả <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-0">
              {recentLogs.slice(0, 7).map((log, idx) => (
                <div key={log.id} className="flex gap-3 pb-3 last:pb-0">
                  <div className="flex flex-col items-center">
                    <Avatar className="h-6 w-6 shrink-0">
                      <AvatarFallback className="text-[10px] bg-indigo-100 text-indigo-600 font-bold">
                        {log.userName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {idx < Math.min(recentLogs.length, 7) - 1 && (
                      <div className="w-px flex-1 bg-border mt-1.5" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0 pb-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-semibold text-sm">{log.userName}</span>
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0">{log.action}</Badge>
                    </div>
                    <p className="text-muted-foreground text-xs truncate">{log.entityName}</p>
                    <p className="text-muted-foreground text-[10px] mt-0.5">{timeAgo(log.createdAt)}</p>
                  </div>
                </div>
              ))}
              {recentLogs.length === 0 && (
                <p className="text-muted-foreground text-center py-4 text-sm">Chưa có hoạt động</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top 5 NCC — Rank medals */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold">🏆 Top NCC</CardTitle>
            <Link to="/admin/suppliers" className="text-primary hover:underline flex items-center gap-1 text-sm">
              Tất cả <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topSuppliers.map((sup, i) => {
                const RankIcon = rankIcons[i] ?? null;
                const rankColors = ['text-yellow-500', 'text-slate-400', 'text-amber-700', 'text-muted-foreground', 'text-muted-foreground'];
                const rankBg = ['bg-yellow-50 dark:bg-yellow-950/20', 'bg-slate-50 dark:bg-slate-900/30', 'bg-amber-50 dark:bg-amber-950/20', 'bg-muted/30', 'bg-muted/30'];
                return (
                  <div key={sup.name} className={`flex items-center gap-3 p-2 rounded-xl ${rankBg[i] ?? 'bg-muted/20'}`}>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${rankBg[i] ?? 'bg-muted/30'}`}>
                      {RankIcon
                        ? <RankIcon className={`h-4 w-4 ${rankColors[i]}`} />
                        : <span className={`text-xs font-black ${rankColors[i]}`}>{i + 1}</span>
                      }
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-sm truncate">{sup.name}</p>
                      <p className="text-muted-foreground text-xs">{formatPrice(sup.revenue)} ₫</p>
                    </div>
                    <Badge variant="outline" className="shrink-0 text-xs">
                      ★ {sup.rating}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sản phẩm bán chạy */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">🔥 Sản phẩm bán chạy</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {stats.topProducts.map((item, i) => (
              <div key={item.name} className="flex items-center gap-3 p-3 rounded-xl border border-border/50 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all group">
                <span className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-black ${
                  i === 0 ? 'bg-yellow-100 text-yellow-700' :
                  i === 1 ? 'bg-slate-100 text-slate-600' :
                  i === 2 ? 'bg-amber-100 text-amber-700' :
                  'bg-muted text-muted-foreground'
                }`}>
                  {i + 1}
                </span>
                <div className="min-w-0">
                  <p className="font-semibold text-sm truncate group-hover:text-indigo-700 transition-colors">{item.name}</p>
                  <p className="text-muted-foreground text-xs">{item.sales} đơn</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
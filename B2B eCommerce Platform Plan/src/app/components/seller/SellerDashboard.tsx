// ============================================================
// Dashboard NCC nâng cao — KPI, Sparkline, Widget thông minh,
// Biểu đồ tổng hợp với toggle 7/30/90 ngày
// ============================================================

import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router';
import {
  TrendingUp, TrendingDown, Package, ClipboardList, DollarSign, ArrowRight,
  ClipboardCheck, Award, AlertTriangle, FileText, ScrollText, CreditCard,
  Timer, Target, BarChart3, ShoppingCart, History, ShieldCheck, Warehouse,
  Star, RotateCcw, MessageSquare, Sparkles,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { AppBreadcrumb } from '../shared/AppBreadcrumb';
import { DashboardSkeleton } from '../shared/PageSkeleton';
import { StatusBadge } from '../shared/StatusBadge';
import { StatsCard } from '../shared/StatsCard';
import { DashboardWidget } from '../shared/DashboardWidget';
import {
  dashboardApi, orderApi, approvalApi, certificateSellerApi,
  stockAlertApi, rfqApi, contractApi, paymentApi, sellerActivityApi,
} from '../../services/api';
import { slaApi } from '../../services/slaApi';
import { warehouseTransferApi } from '../../services/warehouseTransferApi';
import { useAuth } from '../../context/AuthContext';
import type { DashboardStats, Order, StockAlert, RFQ, Contract, Payment, ActivityLog } from '../../types';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, LineChart, Line,
} from 'recharts';

const COLORS = ['#3b82f6', '#22c55e', '#eab308', '#ef4444', '#8b5cf6', '#f97316'];

const fmt = (price: number) =>
  new Intl.NumberFormat('vi-VN', { notation: 'compact' }).format(price);

const fmtCurrency = (price: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

// Generate daily revenue data
function genDailyRevenue(days: number) {
  const data: { date: string; current: number; previous: number }[] = [];
  for (let i = days; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const label = `${d.getDate()}/${d.getMonth() + 1}`;
    data.push({
      date: label,
      current: Math.floor(50 + Math.random() * 200),
      previous: Math.floor(40 + Math.random() * 180),
    });
  }
  return data;
}

// Mini sparkline data (7 points)
function genSparkline(trend: 'up' | 'down' | 'flat') {
  const base = trend === 'up' ? 30 : trend === 'down' ? 70 : 50;
  const dir = trend === 'up' ? 5 : trend === 'down' ? -5 : 0;
  return Array.from({ length: 7 }, (_, i) => ({
    v: Math.max(5, base + dir * i + (Math.random() - 0.5) * 20),
  }));
}

type TimeRange = '7' | '30' | '90';

// ===== KPI Card =====
function KpiCard({ title, value, icon: Icon, growth, color, sparkData, gradient }: {
  title: string; value: string; icon: typeof DollarSign;
  growth: number; color: string; sparkData: { v: number }[];
  gradient?: string;
}) {
  const isPositive = growth >= 0;
  return (
    <Card className="border-0 shadow-sm hover:-translate-y-1 hover:shadow-lg transition-all duration-300 overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${gradient ?? 'bg-muted'}`}>
            <Icon className="h-5 w-5 text-white" />
          </div>
          {/* Sparkline */}
          <div className="w-20 h-10 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sparkData}>
                <Line
                  type="monotone" dataKey="v"
                  stroke={isPositive ? '#22c55e' : '#ef4444'}
                  strokeWidth={2} dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <p className="text-2xl font-black text-foreground">{value}</p>
        <p className="text-sm text-muted-foreground mt-0.5 mb-2">{title}</p>
        <div className={`flex items-center gap-1 text-xs font-medium ${isPositive ? 'text-emerald-600' : 'text-red-500'}`}>
          {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          <span>{isPositive ? '+' : ''}{growth.toFixed(1)}% vs kỳ trước</span>
        </div>
      </CardContent>
    </Card>
  );
}

// ===== Widget: Stock thấp =====
function LowStockWidget({ alerts }: { alerts: StockAlert[] }) {
  const low = alerts.filter(a => a.status === 'Thấp' || a.status === 'Hết').slice(0, 5);
  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="flex items-center gap-2 text-sm">
          <div className="h-6 w-6 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-sm">
            <AlertTriangle className="h-3.5 w-3.5 text-white" />
          </div>
          Tồn kho thấp
        </CardTitle>
        <Link to="/seller/warehouse" className="text-primary hover:underline flex items-center gap-1 text-sm">
          Xem <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </CardHeader>
      <CardContent>
        {low.length === 0 ? (
          <p className="text-muted-foreground text-center py-3 text-sm">Không có cảnh báo</p>
        ) : (
          <div className="space-y-2">
            {low.map(a => (
              <div key={a.id} className="flex items-center justify-between p-2.5 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{a.productName}</p>
                  <p className="text-muted-foreground text-xs">Tồn: <span className="font-semibold text-foreground">{a.currentStock}</span> / Min: {a.minStock}</p>
                </div>
                <Badge variant={a.status === 'Hết' ? 'destructive' : 'outline'} className="shrink-0 ml-2">
                  {a.status === 'Hết' ? 'Hết hàng' : 'Thấp'}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ===== Widget: RFQ chờ phản hồi =====
function PendingRfqWidget({ rfqs }: { rfqs: RFQ[] }) {
  const pending = rfqs.filter(r => r.status === 'Đã gửi' || r.status === 'Đang xem xét').slice(0, 5);
  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="flex items-center gap-2 text-sm">
          <div className="h-6 w-6 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-sm">
            <FileText className="h-3.5 w-3.5 text-white" />
          </div>
          Báo giá chờ phản hồi
        </CardTitle>
        <Link to="/seller/rfq" className="text-primary hover:underline flex items-center gap-1 text-sm">
          Xem <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </CardHeader>
      <CardContent>
        {pending.length === 0 ? (
          <p className="text-muted-foreground text-center py-3 text-sm">Không có RFQ chờ</p>
        ) : (
          <div className="space-y-2">
            {pending.map(r => (
              <Link key={r.id} to={`/seller/rfq/${r.id}`} className="block">
                <div className="flex items-center justify-between p-2.5 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{r.title}</p>
                    <p className="text-muted-foreground text-xs">HSD: {new Date(r.deadline).toLocaleDateString('vi-VN')}</p>
                  </div>
                  <StatusBadge status={r.status} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ===== Widget: Hợp đồng sắp hết hạn =====
function ExpiringContractWidget({ contracts }: { contracts: Contract[] }) {
  const today = new Date();
  const soon = contracts.filter(c => {
    if (c.status !== 'Đang hiệu lực') return false;
    const end = new Date(c.endDate);
    const diff = (end.getTime() - today.getTime()) / 86400000;
    return diff <= 30 && diff > 0;
  }).slice(0, 5);
  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="flex items-center gap-2 text-sm">
          <div className="h-6 w-6 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-sm">
            <ScrollText className="h-3.5 w-3.5 text-white" />
          </div>
          Hợp đồng sắp hết hạn
        </CardTitle>
        <Link to="/seller/contracts" className="text-primary hover:underline flex items-center gap-1 text-sm">
          Xem <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </CardHeader>
      <CardContent>
        {soon.length === 0 ? (
          <p className="text-muted-foreground text-center py-3 text-sm">Không có hợp đồng sắp hết</p>
        ) : (
          <div className="space-y-2">
            {soon.map(c => {
              const diff = Math.ceil((new Date(c.endDate).getTime() - today.getTime()) / 86400000);
              return (
                <Link key={c.id} to={`/seller/contracts/${c.id}`} className="block">
                  <div className="flex items-center justify-between p-2.5 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{c.title}</p>
                      <p className="text-muted-foreground text-xs">{c.buyerName}</p>
                    </div>
                    <Badge variant={diff <= 7 ? 'destructive' : 'outline'} className="shrink-0 ml-2">
                      Còn {diff}d
                    </Badge>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ===== Widget: Công nợ quá hạn =====
function OverduePaymentWidget({ payments }: { payments: Payment[] }) {
  const overdue = payments.filter(p => p.status === 'Quá hạn').slice(0, 5);
  return (
    <Card className={overdue.length > 0 ? 'border-red-300' : ''}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-4 w-4 text-red-500" /> Công nợ quá hạn
          {overdue.length > 0 && (
            <Badge variant="destructive">{overdue.length}</Badge>
          )}
        </CardTitle>
        <Link to="/seller/payments" className="text-primary hover:underline flex items-center gap-1">
          Xem <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </CardHeader>
      <CardContent>
        {overdue.length === 0 ? (
          <p className="text-muted-foreground text-center py-3">Không có công nợ quá hạn</p>
        ) : (
          <div className="space-y-2">
            {overdue.map(p => (
              <div key={p.id} className="flex items-center justify-between p-2 rounded-lg bg-red-50/50 dark:bg-red-950/20">
                <div className="min-w-0 flex-1">
                  <p className="truncate">{p.orderNumber ?? `#${p.orderId.slice(-6)}`}</p>
                  <p className="text-muted-foreground">{p.buyerName ?? 'Khách hàng'}</p>
                </div>
                <span className="text-destructive shrink-0 ml-2">{fmtCurrency(p.amount)}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ===== Main Dashboard =====
export function SellerDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [pendingApprovalCount, setPendingApprovalCount] = useState(0);
  const [certStats, setCertStats] = useState({ total: 0, verified: 0, expiringSoon: 0, expired: 0 });
  const [stockAlerts, setStockAlerts] = useState<StockAlert[]>([]);
  const [grnIssueCount, setGrnIssueCount] = useState(0);
  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [allContracts, setAllContracts] = useState<Contract[]>([]);
  const [allPayments, setAllPayments] = useState<Payment[]>([]);
  const [recentActivities, setRecentActivities] = useState<ActivityLog[]>([]);
  const [timeRange, setTimeRange] = useState<TimeRange>('30');
  const [slaStats, setSlaStats] = useState<{ total: number; active: number; avgScore: number; violationCount: number } | null>(null);
  const [whStats, setWhStats] = useState<{ total: number; shipping: number; pending: number } | null>(null);

  useEffect(() => {
    const sid = user?.supplierId;
    if (sid) {
      dashboardApi.getSellerStats(sid).then(setStats);
      orderApi.getBySeller(sid).then(o => setRecentOrders(o.slice(0, 5)));
      approvalApi.getPendingCount(sid).then(setPendingApprovalCount);
      certificateSellerApi.getStats(sid).then(setCertStats);
    } else {
      dashboardApi.getStats().then(setStats);
    }
    stockAlertApi.getAll().then(setStockAlerts);
    // GRN issues
    import('../../services/grnApi').then(({ grnApi }) => {
      grnApi.getSellerStats(user?.supplierId ?? 'all').then(s => setGrnIssueCount(s.issues));
    });
    rfqApi.getPaginated({ page: 1, pageSize: 50 }).then(r => setRfqs(r.data));
    contractApi.getPaginated({ page: 1, pageSize: 50 }).then(r => setAllContracts(r.data));
    paymentApi.getPaginated({ page: 1, pageSize: 50 }).then(r => setAllPayments(r.data));
    sellerActivityApi.getRecent(10).then(setRecentActivities);
    slaApi.getStats(user?.supplierId ?? 'all').then(setSlaStats);
    warehouseTransferApi.getStats().then(st => setWhStats({ total: st.total, shipping: st.shipping, pending: st.pending }));
  }, [user?.supplierId]);

  const dailyRevenue = useMemo(() => genDailyRevenue(Number(timeRange)), [timeRange]);

  if (!stats) return <DashboardSkeleton />;

  // KPI computations
  const totalViews = stats.totalProducts * 120; // mock
  const conversionRate = stats.totalOrders > 0 ? (stats.totalOrders / totalViews) * 100 : 0;
  const aov = stats.totalOrders > 0 ? stats.totalRevenue / stats.totalOrders : 0;
  const deliveredCount = stats.ordersByStatus.find(s => s.status === 'Đã giao')?.count ?? 0;
  const completionRate = stats.totalOrders > 0 ? (deliveredCount / stats.totalOrders) * 100 : 0;
  const avgProcessingDays = 3.2; // mock

  const kpis = [
    { title: 'Doanh thu', value: fmt(stats.totalRevenue) + ' ₫', icon: DollarSign, growth: stats.revenueGrowth, color: 'text-green-500', spark: genSparkline('up'), gradient: 'bg-gradient-to-br from-emerald-500 to-teal-600' },
    { title: 'Đơn hàng', value: stats.totalOrders.toLocaleString(), icon: ClipboardList, growth: stats.orderGrowth, color: 'text-blue-500', spark: genSparkline('up'), gradient: 'bg-gradient-to-br from-blue-500 to-indigo-600' },
    { title: 'Tỷ lệ chuyển đổi', value: conversionRate.toFixed(1) + '%', icon: Target, growth: 2.3, color: 'text-indigo-500', spark: genSparkline('up'), gradient: 'bg-gradient-to-br from-violet-500 to-purple-600' },
    { title: 'AOV', value: fmt(aov) + ' ₫', icon: ShoppingCart, growth: 5.1, color: 'text-teal-500', spark: genSparkline('up'), gradient: 'bg-gradient-to-br from-cyan-500 to-blue-500' },
    { title: 'Hoàn thành đơn', value: completionRate.toFixed(0) + '%', icon: Package, growth: 1.8, color: 'text-purple-500', spark: genSparkline('flat'), gradient: 'bg-gradient-to-br from-purple-500 to-pink-600' },
    { title: 'TG xử lý TB', value: avgProcessingDays.toFixed(1) + ' ngày', icon: Timer, growth: -8.5, color: 'text-orange-500', spark: genSparkline('down'), gradient: 'bg-gradient-to-br from-orange-500 to-red-500' },
  ];

  // Top category revenue (horizontal bar)
  const topCatRevenue = stats.topCategories.map(c => ({
    name: c.name,
    revenue: Math.floor(Math.random() * 500 + 100),
  })).sort((a, b) => b.revenue - a.revenue).slice(0, 6);

  // Cần xử lý counts (P4.04)
  const newOrderCount = stats.ordersByStatus.find(s => s.status === 'Mới')?.count ?? 3;
  const shippingCount = stats.ordersByStatus.find(s => s.status === 'Đang giao')?.count ?? 2;
  const rfqCount = rfqs.filter(r => r.status === 'Đã gửi' || r.status === 'Đang xem xét').length;
  const lowStockCount = stockAlerts.filter(a => a.status === 'Thấp' || a.status === 'Hết').length;
  const returnCount = 1; // mock
  const reviewCount = 3; // mock

  const needActions = [
    { label: 'Đơn mới', count: newOrderCount, icon: ClipboardList, color: 'bg-blue-100 text-blue-600', link: '/seller/orders' },
    { label: 'Chờ giao', count: shippingCount, icon: Package, color: 'bg-purple-100 text-purple-600', link: '/seller/shipments' },
    { label: 'Báo giá', count: rfqCount, icon: FileText, color: 'bg-cyan-100 text-cyan-600', link: '/seller/rfq' },
    { label: 'Tồn kho thấp', count: lowStockCount, icon: AlertTriangle, color: 'bg-amber-100 text-amber-600', link: '/seller/warehouse' },
    { label: 'Trả hàng', count: returnCount, icon: RotateCcw, color: 'bg-red-100 text-red-600', link: '/seller/returns' },
    { label: 'Đánh giá', count: reviewCount, icon: Star, color: 'bg-yellow-100 text-yellow-600', link: '/seller/reviews' },
  ];

  // Monthly target (P4.07)
  const monthlyTarget = 500000000; // 500M mock
  const currentMonthRevenue = stats.totalRevenue * 0.3; // mock ~ 30% of total
  const targetPercent = Math.min(100, Math.round((currentMonthRevenue / monthlyTarget) * 100));

  // Stock status (P4.08)
  const stockOk = Math.max(0, stats.totalProducts - lowStockCount - stockAlerts.filter(a => a.status === 'Hết').length);
  const stockLow = stockAlerts.filter(a => a.status === 'Thấp').length;
  const stockOut = stockAlerts.filter(a => a.status === 'Hết').length;
  const stockDonutData = [
    { name: 'Đủ hàng', value: stockOk, color: '#22c55e' },
    { name: 'Sắp hết', value: stockLow, color: '#eab308' },
    { name: 'Hết hàng', value: stockOut, color: '#ef4444' },
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-6">
      <AppBreadcrumb items={[{ label: 'Kênh người bán', href: '/seller' }, { label: 'Tổng quan' }]} />

      {/* P4.01: Welcome Banner */}
      <div className="rounded-2xl relative overflow-hidden p-5 sm:p-6 text-white"
        style={{ background: 'linear-gradient(135deg, #1a0508 0%, #c91432 50%, #e31837 100%)' }}
      >
        {/* Decorative orbs */}
        <div className="absolute top-0 right-0 w-56 h-56 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/4 blur-2xl" />
        <div className="absolute bottom-0 left-1/3 w-40 h-40 rounded-full bg-white/5 translate-y-1/2 blur-xl" />
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'30\' height=\'30\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0 0h30v30H0z\' fill=\'none\' stroke=\'white\' stroke-width=\'.5\'/%3E%3C/svg%3E")' }} />

        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center shrink-0 border border-white/20">
              <Sparkles className="h-6 w-6 text-yellow-300" />
            </div>
            <div>
              <h2 className="text-white font-bold">Chào {user?.fullName ?? 'bạn'}! 👋</h2>
              <p className="text-red-100/80 mt-0.5 text-sm">
                Doanh thu hôm nay: <span className="text-white font-semibold">{fmtCurrency(Math.floor(stats.totalRevenue * 0.05))}</span>
                {' · '}<span className="text-yellow-200">{newOrderCount} đơn mới</span> cần xử lý
              </p>
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <Link to="/seller/orders">
              <Button variant="secondary" size="sm" className="bg-white/15 text-white border-white/20 hover:bg-white/25 backdrop-blur-sm">
                <ClipboardList className="h-4 w-4 mr-1" /> Xử lý đơn
              </Button>
            </Link>
            <Link to="/seller/chat">
              <Button variant="secondary" size="sm" className="bg-white/15 text-white border-white/20 hover:bg-white/25 backdrop-blur-sm">
                <MessageSquare className="h-4 w-4 mr-1" /> Tin nhắn
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* P4.02: Stats using StatsCard */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Đơn mới" value={newOrderCount} icon={ClipboardList} variant="primary" trend={stats.orderGrowth} trendLabel="vs tháng trước" />
        <StatsCard title="Doanh thu tháng" value={currentMonthRevenue} format={v => fmt(v) + ' ₫'} icon={DollarSign} variant="success" trend={stats.revenueGrowth} trendLabel="vs tháng trước" />
        <StatsCard title="SP hoạt động" value={stats.totalProducts} icon={Package} variant="purple" trend={3.2} />
        <StatsCard title="Đánh giá TB" value={4.5} format={v => v.toFixed(1) + ' ★'} icon={Star} variant="warning" trend={0.3} />
      </div>

      {/* P4.04: Cần xử lý — icon grid */}
      <Card className="border-0 shadow-sm overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-amber-400 to-orange-500" />
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-sm">
              <AlertTriangle className="h-3.5 w-3.5 text-white" />
            </div>
            Cần xử lý ngay
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {needActions.map(item => (
              <Link key={item.label} to={item.link}>
                <div className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-muted/50 transition-all hover:scale-105 active:scale-95 cursor-pointer group">
                  <div className={`h-11 w-11 rounded-xl ${item.color} flex items-center justify-center relative shadow-sm group-hover:shadow-md transition-shadow`}>
                    <item.icon className="h-5 w-5" />
                    {item.count > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 h-5 min-w-5 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center px-1 shadow-sm">
                        {item.count}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-center text-muted-foreground group-hover:text-foreground transition-colors font-medium">{item.label}</span>
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* === KPI Cards with Sparkline === */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {kpis.map(k => (
          <KpiCard key={k.title} {...k} sparkData={k.spark} gradient={k.gradient} />
        ))}
      </div>

      {/* === Quick badges row === */}
      <div className="flex flex-wrap gap-3">
        {pendingApprovalCount > 0 && (
          <Link to="/seller/approvals">
            <Badge variant="outline" className="gap-1 py-1.5 px-3 cursor-pointer hover:bg-amber-50">
              <ClipboardCheck className="h-3.5 w-3.5 text-amber-500" />
              {pendingApprovalCount} phê duyệt chờ xử lý
            </Badge>
          </Link>
        )}
        {certStats.expired > 0 && (
          <Link to="/seller/profile">
            <Badge variant="outline" className="gap-1 py-1.5 px-3 cursor-pointer hover:bg-red-50">
              <Award className="h-3.5 w-3.5 text-red-500" />
              {certStats.expired} chứng chỉ hết hạn
            </Badge>
          </Link>
        )}
        {certStats.expiringSoon > 0 && (
          <Link to="/seller/profile">
            <Badge variant="outline" className="gap-1 py-1.5 px-3 cursor-pointer hover:bg-amber-50">
              <Award className="h-3.5 w-3.5 text-amber-500" />
              {certStats.expiringSoon} chứng chỉ sắp hết hạn
            </Badge>
          </Link>
        )}
        {grnIssueCount > 0 && (
          <Link to="/seller/grn">
            <Badge variant="outline" className="gap-1 py-1.5 px-3 cursor-pointer hover:bg-red-50">
              <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
              {grnIssueCount} vấn đề GRN
            </Badge>
          </Link>
        )}
      </div>

      {/* === Charts with Time Toggle === */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2"><BarChart3 className="h-5 w-5" /> Biểu đồ tổng hợp</h2>
          <div className="flex gap-1 bg-muted rounded-lg p-1">
            {(['7', '30', '90'] as TimeRange[]).map(r => (
              <Button
                key={r} size="sm" variant={timeRange === r ? 'default' : 'ghost'}
                onClick={() => setTimeRange(r)}
              >
                {r} ngày
              </Button>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Doanh thu Area Chart */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Doanh thu {timeRange} ngày (triệu ₫)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dailyRevenue}>
                    <defs>
                      <linearGradient id="gradCurrent" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#e31837" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#e31837" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gradPrev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#94a3b8" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" vertical={false} />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} interval={timeRange === '7' ? 0 : timeRange === '30' ? 4 : 10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v: number) => [fmt(v * 1000000) + ' ₫']} />
                    <Area key="area-previous" type="monotone" dataKey="previous" stroke="#94a3b8" strokeWidth={1.5} fill="url(#gradPrev)" name="Kỳ trước" />
                    <Area key="area-current" type="monotone" dataKey="current" stroke="#e31837" strokeWidth={2.5} fill="url(#gradCurrent)" name="Kỳ này" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Đơn hàng theo trạng thái PieChart */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Đơn hàng theo trạng thái</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                {stats.ordersByStatus.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats.ordersByStatus}
                        cx="50%" cy="50%"
                        innerRadius={50} outerRadius={80}
                        dataKey="count" nameKey="status"
                        label={({ status, count }) => `${status}: ${count}`}
                      >
                        {stats.ordersByStatus.map((_, idx) => (
                          <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground">Chưa có đơn hàng</div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Top danh mục doanh thu (BarChart ngang) */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Top danh mục theo doanh thu (triệu ₫)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topCatRevenue} layout="vertical">
                    <defs>
                      <linearGradient id="gradCat" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#7c3aed" stopOpacity={0.9} />
                        <stop offset="100%" stopColor="#a855f7" stopOpacity={0.7} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" horizontal={false} />
                    <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                    <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                    <Tooltip formatter={(v: number) => [fmt(v * 1000000) + ' ₫', 'Doanh thu']} />
                    <Bar dataKey="revenue" fill="url(#gradCat)" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Doanh thu theo tháng */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Doanh thu theo tháng (triệu ₫)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.revenueByMonth}>
                    <defs>
                      <linearGradient id="gradMonth" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.9} />
                        <stop offset="100%" stopColor="#6366f1" stopOpacity={0.7} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" vertical={false} />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v: number) => [fmt(v * 1000000) + ' ₫', 'Doanh thu']} />
                    <Bar dataKey="revenue" fill="url(#gradMonth)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* === Smart Widgets Grid === */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Đơn hàng gần đây (enhanced) */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <div className="h-6 w-6 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-sm">
                <ClipboardList className="h-3.5 w-3.5 text-white" />
              </div>
              Đơn hàng mới nhất
            </CardTitle>
            <Link to="/seller/orders" className="text-primary hover:underline flex items-center gap-1 text-sm">
              Tất cả <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </CardHeader>
          <CardContent>
            {recentOrders.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">Chưa có đơn hàng</p>
            ) : (
              <div className="space-y-2">
                {recentOrders.map(order => (
                  <div key={order.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-sm">{order.orderNumber}</p>
                      <p className="text-muted-foreground text-xs truncate">{order.buyerName}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-3">
                      <div className="text-right">
                        <p className="text-[#e31837] font-bold text-sm">{fmtCurrency(order.totalAmount)}</p>
                        <StatusBadge status={order.status} />
                      </div>
                      <Link to={`/seller/orders/${order.id}`}>
                        <Button variant="outline" size="sm">Xử lý</Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sản phẩm bán chạy */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <div className="h-6 w-6 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-sm">
                <TrendingUp className="h-3.5 w-3.5 text-white" />
              </div>
              Sản phẩm bán chạy
            </CardTitle>
            <Link to="/seller/products" className="text-primary hover:underline flex items-center gap-1 text-sm">
              Tất cả <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </CardHeader>
          <CardContent>
            {stats.topProducts.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">Chưa có dữ liệu</p>
            ) : (
              <div className="space-y-2">
                {stats.topProducts.slice(0, 5).map((item, i) => (
                  <div key={item.name} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 text-white ${
                      i === 0 ? 'bg-gradient-to-br from-amber-400 to-orange-500' :
                      i === 1 ? 'bg-gradient-to-br from-slate-400 to-slate-500' :
                      i === 2 ? 'bg-gradient-to-br from-amber-600 to-amber-700' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {i + 1}
                    </span>
                    <span className="flex-1 truncate text-sm font-medium">{item.name}</span>
                    <span className="text-muted-foreground text-sm shrink-0">{item.sales} đơn</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tồn kho thấp */}
        <LowStockWidget alerts={stockAlerts} />

        {/* RFQ chờ phản hồi */}
        <PendingRfqWidget rfqs={rfqs} />

        {/* Hợp đồng sắp hết hạn */}
        <ExpiringContractWidget contracts={allContracts} />

        {/* Công nợ quá hạn */}
        <OverduePaymentWidget payments={allPayments} />

        {/* P4.07: Mục tiêu tháng */}
        <Card className="border-0 shadow-sm overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-indigo-500 to-violet-500" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <div className="h-6 w-6 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-sm">
                <Target className="h-3.5 w-3.5 text-white" />
              </div>
              Mục tiêu tháng
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <p className="text-3xl font-black text-[#e31837]" style={{ fontFamily: 'var(--font-heading)' }}>{targetPercent}%</p>
              <p className="text-muted-foreground mt-1 text-sm">đã đạt được</p>
            </div>
            <div className="relative h-4 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  targetPercent >= 100 ? 'bg-gradient-to-r from-emerald-500 to-teal-500' :
                  targetPercent >= 60 ? 'bg-gradient-to-r from-blue-500 to-indigo-500' :
                  'bg-gradient-to-r from-amber-500 to-orange-500'
                }`}
                style={{ width: `${targetPercent}%` }}
              />
              <div className="absolute top-0 bottom-0 w-0.5 bg-red-500" style={{ left: '100%', transform: 'translateX(-2px)' }} />
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Hiện tại: {fmt(currentMonthRevenue)} ₫</span>
              <span>Mục tiêu: {fmt(monthlyTarget)} ₫</span>
            </div>
            <p className="text-center text-sm">
              Còn <span className="text-[#e31837] font-semibold">{fmt(Math.max(0, monthlyTarget - currentMonthRevenue))} ₫</span> nữa để đạt mục tiêu
            </p>
          </CardContent>
        </Card>

        {/* P4.08: Tình trạng kho donut chart */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <div className="h-6 w-6 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center shadow-sm">
                <Package className="h-3.5 w-3.5 text-white" />
              </div>
              Tình trạng kho
            </CardTitle>
            <Link to="/seller/warehouse" className="text-primary hover:underline flex items-center gap-1 text-sm">
              Chi tiết <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="w-32 h-32 shrink-0">
                {stockDonutData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stockDonutData}
                        cx="50%" cy="50%"
                        innerRadius={30} outerRadius={50}
                        dataKey="value"
                      >
                        {stockDonutData.map((d, i) => (
                          <Cell key={i} fill={d.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground text-sm">N/A</div>
                )}
              </div>
              <div className="flex-1 space-y-2.5">
                {[
                  { label: 'Đủ hàng', value: stockOk, color: 'bg-emerald-500' },
                  { label: 'Sắp hết', value: stockLow, color: 'bg-amber-500' },
                  { label: 'Hết hàng', value: stockOut, color: 'bg-red-500' },
                ].map(s => (
                  <div key={s.label} className="flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${s.color} shrink-0`} />
                    <span className="flex-1 text-sm">{s.label}</span>
                    <span className="text-sm font-semibold">{s.value} SP</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 20B.03: Hoạt động gần đây (mini timeline) */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="flex items-center gap-2">
              <History className="h-4 w-4 text-teal-500" /> Hoạt động gần đây
            </CardTitle>
            <Link to="/seller/activity" className="text-primary hover:underline flex items-center gap-1">
              Tất cả <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </CardHeader>
          <CardContent>
            {recentActivities.length === 0 ? (
              <p className="text-muted-foreground text-center py-3">Chưa có hoạt động</p>
            ) : (
              <div className="space-y-0">
                {recentActivities.slice(0, 8).map((log, idx) => (
                  <div key={log.id} className="flex gap-3 pb-2.5 last:pb-0">
                    <div className="flex flex-col items-center">
                      <div className={`w-2 h-2 rounded-full shrink-0 mt-1.5 ${idx === 0 ? 'bg-primary' : 'bg-muted-foreground/40'}`} />
                      {idx < Math.min(recentActivities.length, 8) - 1 && <div className="w-0.5 flex-1 bg-muted-foreground/20 mt-0.5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate">{log.details}</p>
                      <p className="text-xs text-muted-foreground">{log.userName} · {log.createdAt.slice(11)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* SLA Widget (36E.02) */}
        {slaStats && (
          <Card className={slaStats.violationCount > 0 ? 'border-red-200' : ''}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-indigo-500" /> Cam kết DV (SLA)
                {slaStats.violationCount > 0 && (
                  <Badge variant="destructive">{slaStats.violationCount} vi phạm</Badge>
                )}
              </CardTitle>
              <Link to="/seller/sla" className="text-primary hover:underline flex items-center gap-1">
                Xem <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-2 bg-muted/30 rounded-lg">
                  <p className="text-2xl font-semibold">{slaStats.active}</p>
                  <p className="text-xs text-muted-foreground">Hiệu lực</p>
                </div>
                <div className="p-2 bg-muted/30 rounded-lg">
                  <p className={`text-2xl font-semibold ${slaStats.avgScore >= 90 ? 'text-green-600' : slaStats.avgScore >= 75 ? 'text-yellow-600' : 'text-red-600'}`}>{slaStats.avgScore}</p>
                  <p className="text-xs text-muted-foreground">Điểm TB</p>
                </div>
                <div className="p-2 bg-muted/30 rounded-lg">
                  <p className={`text-2xl font-semibold ${slaStats.violationCount > 0 ? 'text-red-600' : 'text-green-600'}`}>{slaStats.violationCount}</p>
                  <p className="text-xs text-muted-foreground">Vi phạm</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Warehouse Widget (38D.01) */}
        {whStats && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="flex items-center gap-2">
                <Warehouse className="h-5 w-5 text-indigo-600" /> Tổng quan kho
              </CardTitle>
              <Link to="/seller/warehouse" className="text-primary hover:underline text-sm">Chi tiết</Link>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 bg-muted/30 rounded-lg">
                  <p className="text-2xl">{whStats.total}</p>
                  <p className="text-xs text-muted-foreground">Lệnh CK</p>
                </div>
                <div className="p-2 bg-muted/30 rounded-lg">
                  <p className="text-2xl text-amber-600">{whStats.pending}</p>
                  <p className="text-xs text-muted-foreground">Chờ duyệt</p>
                </div>
                <div className="p-2 bg-muted/30 rounded-lg">
                  <p className="text-2xl text-blue-600">{whStats.shipping}</p>
                  <p className="text-xs text-muted-foreground">Đang chuyển</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
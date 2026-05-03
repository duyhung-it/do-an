// ============================================================
// Báo cáo hệ thống — Admin (Nâng cấp E-Phase UI)
// G4: Biểu đồ doanh thu, bảng xếp hạng NCC, phân tích xu hướng
// ============================================================

import { useState, useEffect } from 'react';
import {
  DollarSign, ShoppingCart, Building2, Users, TrendingUp, TrendingDown,
  Download, RefreshCw, Calendar, BarChart3, ArrowUpRight, ArrowDownRight,
} from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area, AreaChart,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { AppBreadcrumb } from '../shared/AppBreadcrumb';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { reportApi } from '../../services/api';

const formatPrice = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);
const formatShort = (n: number) =>
  n >= 1e9 ? `${(n / 1e9).toFixed(1)} tỷ` : n >= 1e6 ? `${(n / 1e6).toFixed(1)} tr` : n.toLocaleString('vi-VN');

const COLORS = ['#e31837', '#4f46e5', '#059669', '#d97706', '#8b5cf6', '#ec4899', '#14b8a6'];

const MONTHLY_DATA = [
  { month: 'T1', revenue: 4200, orders: 312, growth: 8 },
  { month: 'T2', revenue: 3800, orders: 278, growth: -9 },
  { month: 'T3', revenue: 5100, orders: 390, growth: 34 },
  { month: 'T4', revenue: 4700, orders: 345, growth: -8 },
  { month: 'T5', revenue: 5800, orders: 421, growth: 23 },
  { month: 'T6', revenue: 6200, orders: 480, growth: 7 },
  { month: 'T7', revenue: 5600, orders: 398, growth: -10 },
  { month: 'T8', revenue: 6800, orders: 512, growth: 21 },
  { month: 'T9', revenue: 7200, orders: 556, growth: 6 },
  { month: 'T10', revenue: 7800, orders: 598, growth: 8 },
  { month: 'T11', revenue: 9200, orders: 712, growth: 18 },
  { month: 'T12', revenue: 11400, orders: 890, growth: 24 },
];

interface SystemOverview {
  totalRevenue: number;
  totalOrders: number;
  totalSuppliers: number;
  totalBuyers: number;
  supplierRanking: { name: string; revenue: number; orders: number }[];
  categoryTrend: { name: string; orders: number; growth: number }[];
}

const PERIOD_OPTS = [
  { label: '7 ngày', value: '7d' },
  { label: '30 ngày', value: '30d' },
  { label: 'Quý này', value: 'quarter' },
  { label: 'Năm nay', value: 'year' },
];

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number; name: string; color: string }[]; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-card border border-border rounded-xl shadow-lg p-3 text-sm min-w-[140px]">
      <p className="font-semibold text-foreground mb-2">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="flex items-center justify-between gap-3">
          <span style={{ color: p.color }}>{p.name}</span>
          <span className="font-bold">{typeof p.value === 'number' && p.value > 1000 ? formatShort(p.value * 1_000_000) : p.value}</span>
        </p>
      ))}
    </div>
  );
};

export function AdminReportPage() {
  const [data, setData] = useState<SystemOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('year');
  const [activeTab, setActiveTab] = useState<'overview' | 'suppliers' | 'categories'>('overview');

  useEffect(() => {
    setLoading(true);
    reportApi.getSystemOverview()
      .then(setData)
      .finally(() => setLoading(false));
  }, [period]);

  const pieData = data?.supplierRanking.slice(0, 5).map(s => ({
    name: s.name.length > 15 ? s.name.slice(0, 15) + '…' : s.name,
    value: s.revenue,
  })) ?? [];

  const stats = data ? [
    {
      label: 'Tổng doanh thu',
      value: formatShort(data.totalRevenue),
      sub: '+18.2% so với kỳ trước',
      icon: DollarSign,
      up: true,
      bg: 'from-blue-500 to-indigo-600',
      light: 'bg-blue-50 dark:bg-blue-950/30',
      iconColor: 'text-blue-600',
    },
    {
      label: 'Tổng đơn hàng',
      value: data.totalOrders.toLocaleString('vi-VN'),
      sub: '+12.5% so với kỳ trước',
      icon: ShoppingCart,
      up: true,
      bg: 'from-emerald-500 to-teal-600',
      light: 'bg-emerald-50 dark:bg-emerald-950/30',
      iconColor: 'text-emerald-600',
    },
    {
      label: 'Nhà cung cấp',
      value: data.totalSuppliers,
      sub: '+3 mới tháng này',
      icon: Building2,
      up: true,
      bg: 'from-purple-500 to-violet-600',
      light: 'bg-purple-50 dark:bg-purple-950/30',
      iconColor: 'text-purple-600',
    },
    {
      label: 'Người mua',
      value: data.totalBuyers.toLocaleString('vi-VN'),
      sub: '-2.1% so với kỳ trước',
      icon: Users,
      up: false,
      bg: 'from-orange-500 to-red-500',
      light: 'bg-orange-50 dark:bg-orange-950/30',
      iconColor: 'text-orange-600',
    },
  ] : [];

  const TABS = [
    { key: 'overview', label: 'Tổng quan' },
    { key: 'suppliers', label: 'Nhà cung cấp' },
    { key: 'categories', label: 'Danh mục' },
  ] as const;

  return (
    <div className="space-y-6">
      <AppBreadcrumb items={[{ label: 'Quản trị', href: '/admin' }, { label: 'Báo cáo' }]} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2">
            <BarChart3 className="h-7 w-7 text-primary" />
            Báo cáo hệ thống
          </h1>
          <p className="text-muted-foreground mt-1">Tổng hợp phân tích toàn sàn thương mại</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Period filter */}
          <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
            {PERIOD_OPTS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setPeriod(opt.value)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  period === opt.value
                    ? 'bg-white dark:bg-card shadow-sm text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <Button variant="outline" size="sm" className="gap-2" onClick={() => { setLoading(true); setTimeout(() => setLoading(false), 500); }}>
            <RefreshCw className="h-4 w-4" />
            Làm mới
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            Xuất báo cáo
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton h-28 rounded-xl" />
          ))}
        </div>
      ) : (
        <>
          {/* KPI Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map(s => (
              <Card key={s.label} className="border-0 shadow-sm overflow-hidden hover-lift">
                <CardContent className="p-5">
                  <div className={`h-10 w-10 rounded-xl ${s.light} flex items-center justify-center mb-3`}>
                    <s.icon className={`h-5 w-5 ${s.iconColor}`} />
                  </div>
                  <p className="text-2xl font-black text-foreground">{s.value}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">{s.label}</p>
                  <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${s.up ? 'text-emerald-600' : 'text-red-500'}`}>
                    {s.up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                    {s.sub}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1 border-b border-border">
            {TABS.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab: Tổng quan */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Revenue line chart */}
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-semibold">Doanh thu theo tháng</CardTitle>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" />
                      Năm 2025
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={280}>
                    <AreaChart data={MONTHLY_DATA} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#e31837" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#e31837" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.15} />
                          <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                      <XAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                      <YAxis yAxisId="left" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}tr`} />
                      <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                      <Area yAxisId="left" type="monotone" dataKey="revenue" name="Doanh thu (tr VNĐ)" stroke="#e31837" strokeWidth={2.5} fill="url(#colorRevenue)" dot={false} activeDot={{ r: 5, fill: '#e31837' }} />
                      <Area yAxisId="right" type="monotone" dataKey="orders" name="Đơn hàng" stroke="#4f46e5" strokeWidth={2} fill="url(#colorOrders)" dot={false} activeDot={{ r: 4, fill: '#4f46e5' }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Bottom charts */}
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Pie */}
                <Card className="border-0 shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold">Doanh thu theo NCC (Top 5)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={260}>
                      <PieChart>
                        <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={95} paddingAngle={3}>
                          {pieData.map((_, i) => (
                            <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(v: number) => formatPrice(v)} />
                        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Bar growth */}
                <Card className="border-0 shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold">Tăng trưởng theo tháng (%)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={260}>
                      <BarChart data={MONTHLY_DATA} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                        <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                        <Tooltip />
                        <Bar dataKey="growth" name="Tăng trưởng %" radius={[4, 4, 0, 0]}>
                          {MONTHLY_DATA.map((entry, i) => (
                            <Cell key={i} fill={entry.growth >= 0 ? '#059669' : '#ef4444'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Tab: Nhà cung cấp */}
          {activeTab === 'suppliers' && data && (
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  Xếp hạng NCC theo doanh thu
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.supplierRanking.map((s, i) => {
                    const pct = Math.round((s.revenue / data.supplierRanking[0].revenue) * 100);
                    const medals = ['🥇', '🥈', '🥉'];
                    return (
                      <div key={i} className="flex items-center gap-4 p-3 rounded-xl hover:bg-muted/50 transition-colors">
                        <span className="text-lg shrink-0">{i < 3 ? medals[i] : `#${i + 1}`}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1.5">
                            <p className="text-sm font-medium truncate">{s.name}</p>
                            <div className="flex items-center gap-3 shrink-0 ml-2">
                              <Badge variant="outline" className="text-xs">{s.orders} đơn</Badge>
                              <p className="text-sm font-bold text-primary">{formatShort(s.revenue)}</p>
                            </div>
                          </div>
                          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-primary to-primary/70 transition-all duration-700"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tab: Danh mục */}
          {activeTab === 'categories' && data && (
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold">Đơn hàng theo danh mục</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data.categoryTrend} layout="vertical" margin={{ top: 0, right: 20, left: 20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" horizontal={false} />
                      <XAxis type="number" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} width={90} />
                      <Tooltip />
                      <Bar dataKey="orders" name="Đơn hàng" fill="#4f46e5" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold">Tăng trưởng danh mục (%)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 pt-2">
                    {data.categoryTrend.map((cat, i) => (
                      <div key={i}>
                        <div className="flex items-center justify-between text-sm mb-1.5">
                          <span className="font-medium">{cat.name}</span>
                          <span className={`font-bold flex items-center gap-1 ${cat.growth >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                            {cat.growth >= 0 ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                            {cat.growth > 0 ? '+' : ''}{cat.growth}%
                          </span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${cat.growth >= 0 ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' : 'bg-gradient-to-r from-red-400 to-red-500'}`}
                            style={{ width: `${Math.min(Math.abs(cat.growth) * 3, 100)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </>
      )}
    </div>
  );
}
// ============================================================
// AdminAnalyticsPage — Phân tích toàn sàn (D11)
// KPI cards, GMV LineChart, Top NCC, Top Buyer, Phân bổ ngành
// ============================================================

import { useState, useCallback, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, Building2, DollarSign, ShoppingCart, RefreshCw, Download, Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { AppBreadcrumb } from '../shared/AppBreadcrumb';
import { StatsCard } from '../shared/StatsCard';
import { AnimatedNumber } from '../shared/AnimatedNumber';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend, AreaChart, Area,
} from 'recharts';
import { toast } from 'sonner';

const COLORS = ['#3b82f6', '#22c55e', '#eab308', '#ef4444', '#8b5cf6', '#f97316', '#06b6d4'];

const formatCurrency = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', notation: 'compact' }).format(n);
const formatNum = (n: number) => n.toLocaleString('vi-VN');

const gmvData = [
  { month: 'T7/25', gmv: 12.5, orders: 320, buyers: 85 },
  { month: 'T8/25', gmv: 14.2, orders: 356, buyers: 92 },
  { month: 'T9/25', gmv: 13.8, orders: 341, buyers: 88 },
  { month: 'T10/25', gmv: 16.4, orders: 398, buyers: 105 },
  { month: 'T11/25', gmv: 19.2, orders: 451, buyers: 118 },
  { month: 'T12/25', gmv: 22.1, orders: 512, buyers: 134 },
  { month: 'T1/26', gmv: 18.5, orders: 428, buyers: 112 },
  { month: 'T2/26', gmv: 20.3, orders: 478, buyers: 125 },
  { month: 'T3/26', gmv: 21.8, orders: 498, buyers: 131 },
  { month: 'T4/26', gmv: 23.5, orders: 531, buyers: 142 },
];

const topSuppliers = [
  { name: 'Tech Solutions VN', revenue: 4250000000, orders: 142, rating: 4.8 },
  { name: 'Digital World', revenue: 3800000000, orders: 128, rating: 4.7 },
  { name: 'Network Pro', revenue: 2900000000, orders: 98, rating: 4.6 },
  { name: 'Office World', revenue: 2100000000, orders: 87, rating: 4.5 },
  { name: 'Smart Devices Co', revenue: 1850000000, orders: 76, rating: 4.4 },
];

const topBuyers = [
  { name: 'Tập đoàn XYZ', spend: 3500000000, orders: 89, tier: 'Kim cương' },
  { name: 'Ngân hàng DEF', spend: 2800000000, orders: 67, tier: 'Kim cương' },
  { name: 'Công ty ABC', spend: 1900000000, orders: 54, tier: 'Vàng' },
  { name: 'Công ty GHI', spend: 1400000000, orders: 43, tier: 'Vàng' },
  { name: 'Công ty JKL', spend: 980000000, orders: 32, tier: 'Bạc' },
];

const industryDist = [
  { name: 'Công nghệ IT', value: 38 },
  { name: 'Tài chính NH', value: 22 },
  { name: 'Sản xuất', value: 18 },
  { name: 'Thương mại', value: 12 },
  { name: 'Khác', value: 10 },
];

const TIER_COLORS: Record<string, string> = { 'Kim cương': '#3b82f6', 'Vàng': '#eab308', 'Bạc': '#94a3b8', 'Đồng': '#b87333' };

type Period = '7d' | '30d' | '90d' | '1y';

export function AdminAnalyticsPage() {
  const [period, setPeriod] = useState<Period>('30d');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'buyers' | 'sellers'>('overview');

  const refresh = useCallback(async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    setLoading(false);
    toast.success('Đã làm mới dữ liệu');
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const kpis = [
    { label: 'GMV tháng này', value: 23500000000, prev: 21800000000, icon: <DollarSign className="h-5 w-5 text-green-500" />, color: 'success' as const, format: formatCurrency },
    { label: 'Tổng đơn hàng', value: 531, prev: 498, icon: <ShoppingCart className="h-5 w-5 text-blue-500" />, color: 'info' as const, format: formatNum },
    { label: 'Nhà cung cấp', value: 48, prev: 44, icon: <Building2 className="h-5 w-5 text-purple-500" />, color: 'info' as const, format: formatNum },
    { label: 'Buyer hoạt động', value: 142, prev: 131, icon: <Users className="h-5 w-5 text-orange-500" />, color: 'warning' as const, format: formatNum },
    { label: 'Tỷ lệ chuyển đổi', value: 18.4, prev: 16.2, icon: <Target className="h-5 w-5 text-teal-500" />, color: 'success' as const, format: (v: number) => `${v}%` },
    { label: 'Giá trị đơn TB', value: 44200000, prev: 43800000, icon: <TrendingUp className="h-5 w-5 text-indigo-500" />, color: 'info' as const, format: formatCurrency },
  ];

  const periods: { key: Period; label: string }[] = [
    { key: '7d', label: '7 ngày' }, { key: '30d', label: '30 ngày' }, { key: '90d', label: '90 ngày' }, { key: '1y', label: '1 năm' },
  ];

  return (
    <div className="space-y-6">
      <AppBreadcrumb items={[{ label: 'Admin', href: '/admin' }, { label: 'Phân tích toàn sàn' }]} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2"><BarChart3 className="h-6 w-6 text-primary" /> Phân tích & BI Dashboard</h1>
          <p className="text-muted-foreground">Tổng quan hiệu suất toàn sàn thương mại</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex border rounded-lg overflow-hidden">
            {periods.map(p => (
              <button key={p.key} onClick={() => setPeriod(p.key)}
                className={`px-3 py-1.5 text-sm transition-colors ${period === p.key ? 'bg-primary text-white' : 'hover:bg-muted'}`}>
                {p.label}
              </button>
            ))}
          </div>
          <Button variant="outline" size="sm" onClick={refresh} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} /> Làm mới
          </Button>
          <Button variant="outline" size="sm" onClick={() => toast.success('Đang xuất báo cáo...')}>
            <Download className="h-4 w-4 mr-1" /> Xuất
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {kpis.map(kpi => {
          const growth = ((kpi.value - kpi.prev) / kpi.prev * 100).toFixed(1);
          const isUp = kpi.value >= kpi.prev;
          return (
            <Card key={kpi.label} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted-foreground">{kpi.label}</span>
                  {kpi.icon}
                </div>
                <p className="text-lg font-bold">{kpi.format(kpi.value)}</p>
                <div className={`flex items-center gap-1 mt-1 text-xs ${isUp ? 'text-green-500' : 'text-red-500'}`}>
                  <TrendingUp className="h-3 w-3" />
                  <span>{isUp ? '+' : ''}{growth}% vs kỳ trước</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="flex border-b gap-4">
        {[{ key: 'overview', label: 'Tổng quan' }, { key: 'buyers', label: 'Top Buyer' }, { key: 'sellers', label: 'Top NCC' }].map(t => (
          <button
            key={t.key} onClick={() => setActiveTab(t.key as typeof activeTab)}
            className={`pb-2 px-1 border-b-2 text-sm font-medium transition-colors ${activeTab === t.key ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* GMV Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><TrendingUp className="h-4 w-4" /> GMV & Đơn hàng theo tháng</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={gmvData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip formatter={(v: number, name: string) => name === 'gmv' ? [`${v} tỷ ₫`, 'GMV'] : [v, 'Đơn hàng']} />
                    <Legend />
                    <Area yAxisId="left" type="monotone" dataKey="gmv" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} name="GMV (tỷ)" />
                    <Line yAxisId="right" type="monotone" dataKey="orders" stroke="#22c55e" name="Đơn hàng" dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle>Phân bổ theo ngành</CardTitle></CardHeader>
              <CardContent>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={industryDist} cx="50%" cy="50%" outerRadius={80} dataKey="value" nameKey="name" label={({ name, value }) => `${value}%`}>
                        {industryDist.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip formatter={(v: number) => [`${v}%`, '']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Top 5 NCC theo doanh thu</CardTitle></CardHeader>
              <CardContent>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topSuppliers.map(s => ({ name: s.name.split(' ').slice(0, 2).join(' '), revenue: s.revenue / 1e9 }))} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                      <XAxis type="number" tickFormatter={v => `${v}tỷ`} />
                      <YAxis type="category" dataKey="name" width={100} />
                      <Tooltip formatter={(v: number) => [`${v} tỷ ₫`, 'Doanh thu']} />
                      <Bar dataKey="revenue" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'buyers' && (
        <Card>
          <CardHeader><CardTitle>Top Buyer theo chi tiêu</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topBuyers.map((b, i) => (
                <div key={b.name} className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${i === 0 ? 'bg-yellow-100 text-yellow-700' : i === 1 ? 'bg-gray-100 text-gray-600' : 'bg-orange-50 text-orange-600'}`}>{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{b.name}</p>
                      <Badge style={{ backgroundColor: `${TIER_COLORS[b.tier]}20`, color: TIER_COLORS[b.tier] }}>{b.tier}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{b.orders} đơn hàng</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary">{formatCurrency(b.spend)}</p>
                    <p className="text-xs text-muted-foreground">Chi tiêu tích lũy</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'sellers' && (
        <Card>
          <CardHeader><CardTitle>Top NCC theo doanh thu</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topSuppliers.map((s, i) => (
                <div key={s.name} className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${i === 0 ? 'bg-yellow-100 text-yellow-700' : i === 1 ? 'bg-gray-100 text-gray-600' : 'bg-orange-50 text-orange-600'}`}>{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{s.name}</p>
                    <p className="text-sm text-muted-foreground">{s.orders} đơn · ★ {s.rating}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary">{formatCurrency(s.revenue)}</p>
                    <div className="w-24 bg-gray-200 rounded-full h-1.5 mt-1">
                      <div className="bg-primary h-1.5 rounded-full" style={{ width: `${(s.revenue / topSuppliers[0].revenue) * 100}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

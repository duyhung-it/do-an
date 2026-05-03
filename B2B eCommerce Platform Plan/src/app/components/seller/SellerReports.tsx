// ============================================================
// Báo cáo & Phân tích — Seller (4 tab: Doanh thu / Sản phẩm /
// Khách hàng / Đơn hàng) + Date range chung + Xuất CSV
// ============================================================

import { useState, useEffect, useCallback, useMemo, createContext, useContext, type ReactNode } from 'react';
import {
  DollarSign, TrendingUp, TrendingDown, ShoppingCart, BarChart3, Users, Package,
  Download, ClipboardList, AlertTriangle, Star, Calendar,
  FileSpreadsheet, FileText as FileIcon,
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { AppBreadcrumb } from '../shared/AppBreadcrumb';
import { reportApi } from '../../services/api';
import type { RevenueReport, ProductReport, CustomerReport, ReportFilter } from '../../types';
import { toast } from 'sonner';

const fmtPrice = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);
const fmtShort = (n: number) =>
  n >= 1e9 ? `${(n / 1e9).toFixed(1)} tỷ` : n >= 1e6 ? `${(n / 1e6).toFixed(1)} tr` : n.toLocaleString();

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

// ===== Premium KPI Card =====
function MetricCard({ label, value, icon: Icon, gradient, sub }: {
  label: string; value: string | number; icon: typeof DollarSign;
  gradient: string; sub?: string;
}) {
  return (
    <Card className="border-0 shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all duration-200">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${gradient} shadow-sm`}>
            <Icon className="h-5 w-5 text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-xl font-black text-foreground truncate">{value}</p>
            <p className="text-sm text-muted-foreground truncate">{label}</p>
            {sub && <p className="text-xs text-muted-foreground/70">{sub}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ======================== Shared Filter Context ========================
interface FilterCtx {
  dateFrom: string; dateTo: string; groupBy: ReportFilter['groupBy'];
  setDateFrom: (v: string) => void; setDateTo: (v: string) => void;
  setGroupBy: (v: ReportFilter['groupBy']) => void;
  filter: ReportFilter;
}
const FilterContext = createContext<FilterCtx | null>(null);
function useFilter() {
  const ctx = useContext(FilterContext);
  if (!ctx) throw new Error('useFilter must be inside FilterProvider');
  return ctx;
}

// ======================== P5.22: Export Options Cards ========================
function ExportOptionsCards({ onExport }: { onExport: (type: 'csv' | 'excel' | 'pdf') => void }) {
  const options = [
    { type: 'csv' as const, label: 'CSV', desc: 'Dữ liệu thô, mở bằng Excel', icon: FileSpreadsheet, color: 'text-green-600 bg-green-50 dark:bg-green-950/20' },
    { type: 'excel' as const, label: 'Excel', desc: 'Bảng tính có định dạng', icon: FileSpreadsheet, color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/20' },
    { type: 'pdf' as const, label: 'PDF', desc: 'Báo cáo in ấn', icon: FileIcon, color: 'text-red-600 bg-red-50 dark:bg-red-950/20' },
  ];
  return (
    <div className="grid grid-cols-3 gap-3">
      {options.map(o => (
        <button
          key={o.type}
          onClick={() => onExport(o.type)}
          className={`flex items-center gap-3 p-3 rounded-xl border hover:shadow-md transition-all text-left ${o.color}`}
        >
          <o.icon className="h-8 w-8 shrink-0" />
          <div>
            <p className="font-medium">{o.label}</p>
            <p className="text-xs opacity-70">{o.desc}</p>
          </div>
        </button>
      ))}
    </div>
  );
}

// ======================== Shared Date Range Picker ========================
function DateRangePicker() {
  const { dateFrom, dateTo, groupBy, setDateFrom, setDateTo, setGroupBy } = useFilter();
  return (
    <div className="flex flex-wrap gap-3 items-end p-3 rounded-xl bg-muted/30 border border-border/50">
      <div>
        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Từ ngày</Label>
        <Input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="w-40 h-9 mt-1" />
      </div>
      <div>
        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Đến ngày</Label>
        <Input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="w-40 h-9 mt-1" />
      </div>
      <div>
        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Nhóm theo</Label>
        <Select value={groupBy} onValueChange={v => setGroupBy(v as ReportFilter['groupBy'])}>
          <SelectTrigger className="w-32 h-9 mt-1"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="day">Ngày</SelectItem>
            <SelectItem value="week">Tuần</SelectItem>
            <SelectItem value="month">Tháng</SelectItem>
            <SelectItem value="quarter">Quý</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

// ======================== Tab Doanh thu ========================
function RevenueTab() {
  const { filter } = useFilter();
  const [data, setData] = useState<RevenueReport[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try { setData(await reportApi.getRevenue(filter)); } finally { setLoading(false); }
  }, [filter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const totals = useMemo(() => {
    const revenue = data.reduce((s, d) => s + d.revenue, 0);
    const orderCount = data.reduce((s, d) => s + d.orders, 0);
    const avg = orderCount > 0 ? Math.round(revenue / orderCount) : 0;
    const avgGrowth = data.length > 0 ? Math.round(data.reduce((s, d) => s + d.growth, 0) / data.length) : 0;
    return { revenue, orderCount, avg, avgGrowth };
  }, [data]);

  // Previous period comparison (mock: 80-120% of current)
  const comparisonData = useMemo(() =>
    data.map(d => ({
      period: d.period,
      current: d.revenue,
      previous: Math.floor(d.revenue * (0.7 + Math.random() * 0.4)),
    })), [data]);

  // Category breakdown (mock)
  const catRevenue = useMemo(() => [
    { name: 'Điện tử', revenue: Math.floor(totals.revenue * 0.35) },
    { name: 'Vật liệu XD', revenue: Math.floor(totals.revenue * 0.25) },
    { name: 'Nông sản', revenue: Math.floor(totals.revenue * 0.18) },
    { name: 'Dệt may', revenue: Math.floor(totals.revenue * 0.12) },
    { name: 'Khác', revenue: Math.floor(totals.revenue * 0.10) },
  ], [totals.revenue]);

  // Top 10 highest value mock orders
  const topOrders = useMemo(() =>
    Array.from({ length: 10 }, (_, i) => ({
      id: `ORD-${2026000 + i}`,
      buyer: ['Vingroup', 'FPT', 'Hoà Phát', 'Thaco', 'Masan', 'Techcombank', 'VNG', 'CMC', 'TH Group', 'Trường Hải'][i],
      amount: Math.floor(totals.revenue * (0.12 - i * 0.008) + 1000000),
      date: `2025-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
    })).sort((a, b) => b.amount - a.amount)
  , [totals.revenue]);

  // Forecast (extending trend)
  const forecastData = useMemo(() => {
    if (data.length < 2) return [];
    const last3 = data.slice(-3);
    const avgGrowthRate = last3.reduce((s, d) => s + d.growth, 0) / last3.length / 100;
    const lastRevenue = data[data.length - 1]?.revenue ?? 0;
    return [
      { period: data[data.length - 1]?.period ?? '', revenue: lastRevenue, type: 'actual' },
      { period: 'Dự báo +1', revenue: Math.floor(lastRevenue * (1 + avgGrowthRate)), type: 'forecast' },
      { period: 'Dự báo +2', revenue: Math.floor(lastRevenue * (1 + avgGrowthRate) ** 2), type: 'forecast' },
    ];
  }, [data]);

  const handleExport = () => {
    exportCSV('bao-cao-doanh-thu.csv',
      ['Kỳ', 'Doanh thu', 'Đơn hàng', 'TB/đơn', 'Tăng trưởng %'],
      data.map(d => [d.period, d.revenue, d.orders, d.avgOrderValue, d.growth]),
    );
  };

  const kpis = [
    { label: 'Doanh thu', value: fmtShort(totals.revenue) + ' ₫', icon: DollarSign, gradient: 'bg-gradient-to-br from-emerald-500 to-teal-600' },
    { label: 'Đơn hàng', value: totals.orderCount.toLocaleString(), icon: ShoppingCart, gradient: 'bg-gradient-to-br from-blue-500 to-indigo-600' },
    { label: 'TB/đơn (AOV)', value: fmtShort(totals.avg) + ' ₫', icon: BarChart3, gradient: 'bg-gradient-to-br from-violet-500 to-purple-600' },
    { label: 'Tăng trưởng', value: `${totals.avgGrowth > 0 ? '+' : ''}${totals.avgGrowth}%`, icon: totals.avgGrowth >= 0 ? TrendingUp : TrendingDown, gradient: totals.avgGrowth >= 0 ? 'bg-gradient-to-br from-green-500 to-emerald-600' : 'bg-gradient-to-br from-red-500 to-rose-600' },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <DateRangePicker />
        <Button variant="outline" size="sm" onClick={handleExport}><Download className="h-4 w-4 mr-1" /> Xuất CSV</Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map(t => (
          <MetricCard key={t.label} label={t.label} value={t.value} icon={t.icon} gradient={t.gradient} />
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Đang tải...</div>
      ) : (
        <>
          <div className="grid lg:grid-cols-2 gap-4">
            {/* AreaChart so sánh kỳ trước */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-2"><CardTitle className="text-base font-semibold">Doanh thu so sánh kỳ trước</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={comparisonData}>
                    <defs>
                      <linearGradient id="gradCurr" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#e31837" stopOpacity={0.25}/>
                        <stop offset="95%" stopColor="#e31837" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="gradPrev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.15}/>
                        <stop offset="95%" stopColor="#94a3b8" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" vertical={false} />
                    <XAxis dataKey="period" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tickFormatter={v => fmtShort(v)} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip formatter={(v: number) => fmtPrice(v)} />
                    <Legend />
                    <Area type="monotone" dataKey="previous" stroke="#94a3b8" strokeWidth={1.5} fill="url(#gradPrev)" strokeDasharray="5 5" name="Kỳ trước" />
                    <Area type="monotone" dataKey="current" stroke="#e31837" strokeWidth={2.5} fill="url(#gradCurr)" name="Kỳ này" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* BarChart danh mục */}
            <Card>
              <CardHeader><CardTitle>Doanh thu theo danh mục</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={catRevenue}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tickFormatter={v => fmtShort(v)} tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v: number) => fmtPrice(v)} />
                    <Bar dataKey="revenue" fill="#8b5cf6" name="Doanh thu" radius={[4, 4, 0, 0]}>
                      {catRevenue.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Dự báo doanh thu */}
            <Card>
              <CardHeader><CardTitle>Dự báo doanh thu</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={forecastData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" tick={{ fontSize: 11 }} />
                    <YAxis tickFormatter={v => fmtShort(v)} tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v: number) => fmtPrice(v)} />
                    <Line type="monotone" dataKey="revenue" stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 5" name="Dự báo" dot />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Top 10 đơn hàng giá trị lớn */}
            <Card>
              <CardHeader><CardTitle>Top 10 đơn hàng giá trị lớn nhất</CardTitle></CardHeader>
              <CardContent>
                <div className="overflow-x-auto max-h-[300px] overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>#</TableHead>
                        <TableHead>Mã đơn</TableHead>
                        <TableHead>Khách hàng</TableHead>
                        <TableHead className="text-right">Giá trị</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {topOrders.map((o, i) => (
                        <TableRow key={o.id}>
                          <TableCell>{i + 1}</TableCell>
                          <TableCell>{o.id}</TableCell>
                          <TableCell>{o.buyer}</TableCell>
                          <TableCell className="text-right">{fmtPrice(o.amount)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

// ======================== Tab Sản phẩm ========================
function ProductTab() {
  const { filter } = useFilter();
  const [data, setData] = useState<ProductReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    reportApi.getProducts(filter).then(setData).finally(() => setLoading(false));
  }, [filter]);

  const byQuantity = useMemo(() => [...data].sort((a, b) => b.unitsSold - a.unitsSold).slice(0, 10), [data]);
  const byRevenue = useMemo(() => [...data].sort((a, b) => b.revenue - a.revenue).slice(0, 10), [data]);
  const byRating = useMemo(() => [...data].sort((a, b) => b.avgRating - a.avgRating).slice(0, 10), [data]);
  const noSales = useMemo(() => data.filter(d => d.unitsSold === 0), [data]);

  // Category distribution pie
  const catPie = useMemo(() => {
    const cats: Record<string, number> = {};
    data.forEach(d => {
      const cat = d.name.includes('Arduino') || d.name.includes('Cảm biến') ? 'Điện tử'
        : d.name.includes('Thép') || d.name.includes('Xi') ? 'Vật liệu XD'
        : d.name.includes('Gạo') || d.name.includes('Cà phê') ? 'Nông sản'
        : 'Khác';
      cats[cat] = (cats[cat] ?? 0) + d.revenue;
    });
    return Object.entries(cats).map(([name, value]) => ({ name, value }));
  }, [data]);

  // Status distribution (mock)
  const statusPie = useMemo(() => [
    { name: 'Đã duyệt', value: Math.floor(data.length * 0.75) || 10 },
    { name: 'Chờ duyệt', value: Math.floor(data.length * 0.15) || 3 },
    { name: 'Ẩn', value: Math.floor(data.length * 0.10) || 2 },
  ], [data.length]);

  const handleExport = () => {
    exportCSV('bao-cao-san-pham.csv',
      ['Sản phẩm', 'Đã bán', 'Doanh thu', 'Trả hàng %', 'Đánh giá'],
      data.map(d => [d.name, d.unitsSold, d.revenue, d.returnRate, d.avgRating]),
    );
  };

  if (loading) return <div className="text-center py-12 text-muted-foreground">Đang tải...</div>;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <DateRangePicker />
        <Button variant="outline" onClick={handleExport}><Download className="h-4 w-4 mr-1" /> Xuất CSV</Button>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* SP bán chạy theo số lượng */}
        <Card>
          <CardHeader><CardTitle>Top SP bán chạy (theo số lượng)</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={byQuantity.map(d => ({ name: d.name.slice(0, 15), qty: d.unitsSold }))} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="qty" fill="#10b981" name="Số lượng" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* SP doanh thu cao */}
        <Card>
          <CardHeader><CardTitle>Top SP doanh thu cao nhất</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={byRevenue.map(d => ({ name: d.name.slice(0, 15), revenue: d.revenue }))} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" tickFormatter={v => fmtShort(v)} />
                <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: number) => fmtPrice(v)} />
                <Bar dataKey="revenue" fill="#8b5cf6" name="Doanh thu" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Phân bổ theo danh mục (Treemap alternative: Pie) */}
        <Card>
          <CardHeader><CardTitle>Phân bổ doanh thu theo danh mục</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={catPie} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {catPie.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v: number) => fmtPrice(v)} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* SP theo trạng thái */}
        <Card>
          <CardHeader><CardTitle>Phân bổ SP theo trạng thái</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={statusPie} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={90}
                  label={({ name, value }) => `${name}: ${value}`}>
                  {statusPie.map((_, i) => <Cell key={i} fill={['#22c55e', '#f59e0b', '#94a3b8'][i]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* SP đánh giá tốt nhất */}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Star className="h-4 w-4 text-yellow-500" /> Top SP đánh giá tốt nhất</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead><TableHead>Sản phẩm</TableHead>
                  <TableHead className="text-right">Đánh giá</TableHead>
                  <TableHead className="text-right">Đã bán</TableHead>
                  <TableHead className="text-right">Doanh thu</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {byRating.map((d, i) => (
                  <TableRow key={d.productId}>
                    <TableCell>{i + 1}</TableCell>
                    <TableCell className="font-medium">{d.name}</TableCell>
                    <TableCell className="text-right">{d.avgRating} ★</TableCell>
                    <TableCell className="text-right">{d.unitsSold}</TableCell>
                    <TableCell className="text-right">{fmtPrice(d.revenue)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* SP không bán được */}
      {noSales.length > 0 && (
        <Card className="border-amber-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-600">
              <AlertTriangle className="h-4 w-4" /> SP không có đơn hàng
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {noSales.map(d => (
                <Badge key={d.productId} variant="outline">{d.name}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ======================== Tab Khách hàng ========================
function CustomerTab() {
  const { filter } = useFilter();
  const [data, setData] = useState<CustomerReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    reportApi.getCustomers(filter).then(setData).finally(() => setLoading(false));
  }, [filter]);

  const totals = useMemo(() => ({
    customers: data.length,
    totalSpent: data.reduce((s, d) => s + d.totalSpent, 0),
    avgValue: data.length > 0 ? Math.round(data.reduce((s, d) => s + d.avgOrderValue, 0) / data.length) : 0,
    returnRate: data.length > 0 ? Math.round((data.filter(d => d.totalOrders > 1).length / data.length) * 100) : 0,
  }), [data]);

  const chartData = useMemo(() => data.slice(0, 10).map(d => ({
    name: d.buyerName.length > 12 ? d.buyerName.slice(0, 12) + '…' : d.buyerName,
    spent: d.totalSpent, orders: d.totalOrders,
  })), [data]);

  // New customers by month (mock)
  const newByMonth = useMemo(() =>
    ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'].map(m => ({
      month: m, count: Math.floor(5 + Math.random() * 20),
    })), []);

  // Distribution by province (mock)
  const byProvince = useMemo(() => [
    { province: 'TP. Hồ Chí Minh', count: Math.floor(data.length * 0.35) || 8 },
    { province: 'Hà Nội', count: Math.floor(data.length * 0.25) || 6 },
    { province: 'Đà Nẵng', count: Math.floor(data.length * 0.12) || 3 },
    { province: 'Bình Dương', count: Math.floor(data.length * 0.10) || 2 },
    { province: 'Đồng Nai', count: Math.floor(data.length * 0.08) || 2 },
    { province: 'Khác', count: Math.floor(data.length * 0.10) || 2 },
  ], [data.length]);

  const handleExport = () => {
    exportCSV('bao-cao-khach-hang.csv',
      ['Khách hàng', 'Số đơn', 'Tổng chi', 'TB/đơn', 'Đơn cuối'],
      data.map(d => [d.buyerName, d.totalOrders, d.totalSpent, d.avgOrderValue, d.lastOrderDate]),
    );
  };

  if (loading) return <div className="text-center py-12 text-muted-foreground">Đang tải...</div>;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <DateRangePicker />
        <Button variant="outline" onClick={handleExport}><Download className="h-4 w-4 mr-1" /> Xuất CSV</Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard label="Khách hàng" value={totals.customers} icon={Users} gradient="bg-gradient-to-br from-blue-500 to-indigo-600" />
        <MetricCard label="Tổng chi tiêu" value={fmtShort(totals.totalSpent) + ' ₫'} icon={DollarSign} gradient="bg-gradient-to-br from-emerald-500 to-teal-600" />
        <MetricCard label="TB/đơn" value={fmtShort(totals.avgValue) + ' ₫'} icon={BarChart3} gradient="bg-gradient-to-br from-violet-500 to-purple-600" />
        <MetricCard label="Tỷ lệ quay lại" value={totals.returnRate + '%'} icon={TrendingUp} gradient="bg-gradient-to-br from-orange-500 to-amber-600" />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Top KH chi tiêu */}
        <Card>
          <CardHeader><CardTitle>Top 10 KH theo chi tiêu</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tickFormatter={v => fmtShort(v)} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: number, name: string) => [name === 'spent' ? fmtPrice(v) : v]} />
                <Legend />
                <Bar dataKey="spent" fill="#3b82f6" name="Chi tiêu" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* KH mới theo tháng */}
        <Card>
          <CardHeader><CardTitle>Khách hàng mới theo tháng</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={newByMonth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#14b8a6" name="KH mới" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Phân bổ theo tỉnh */}
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Phân bổ khách hàng theo khu vực</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={byProvince} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="province" type="category" width={140} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#f59e0b" name="Số KH" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Bảng khách hàng */}
      <Card>
        <CardHeader><CardTitle>Danh sách khách hàng</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead><TableHead>Khách hàng</TableHead>
                  <TableHead className="text-right">Số đơn</TableHead>
                  <TableHead className="text-right">Tổng chi</TableHead>
                  <TableHead className="text-right">TB/đơn</TableHead>
                  <TableHead>Đơn cuối</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((d, i) => (
                  <TableRow key={d.buyerId}>
                    <TableCell>{i + 1}</TableCell>
                    <TableCell className="font-medium">{d.buyerName}</TableCell>
                    <TableCell className="text-right">{d.totalOrders}</TableCell>
                    <TableCell className="text-right">{fmtPrice(d.totalSpent)}</TableCell>
                    <TableCell className="text-right">{fmtPrice(d.avgOrderValue)}</TableCell>
                    <TableCell>{d.lastOrderDate}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ======================== Tab Đơn hàng (MỚI) ========================
function OrderTab() {
  const { filter } = useFilter();
  const [data, setData] = useState<{
    byStatus: { status: string; count: number }[];
    byPeriod: { period: string; count: number; cancelled: number }[];
    avgProcessing: { period: string; days: number }[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    reportApi.getOrderStats(filter).then(setData).finally(() => setLoading(false));
  }, [filter]);

  const cancelRate = useMemo(() => {
    if (!data) return [];
    return data.byPeriod.map(p => ({
      period: p.period,
      rate: p.count > 0 ? Math.round((p.cancelled / p.count) * 100 * 10) / 10 : 0,
    }));
  }, [data]);

  const handleExport = () => {
    if (!data) return;
    exportCSV('bao-cao-don-hang.csv',
      ['Kỳ', 'Số đơn', 'Đã huỷ', 'TG xử lý (ngày)'],
      data.byPeriod.map((p, i) => [p.period, p.count, p.cancelled, data.avgProcessing[i]?.days ?? 0]),
    );
  };

  if (loading || !data) return <div className="text-center py-12 text-muted-foreground">Đang tải...</div>;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <DateRangePicker />
        <Button variant="outline" onClick={handleExport}><Download className="h-4 w-4 mr-1" /> Xuất CSV</Button>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* PieChart trạng thái */}
        <Card>
          <CardHeader><CardTitle>Đơn hàng theo trạng thái</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={data.byStatus} dataKey="count" nameKey="status" cx="50%" cy="50%" innerRadius={50} outerRadius={100}
                  label={({ status, count }) => `${status}: ${count}`}>
                  {data.byStatus.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* LineChart theo thời gian */}
        <Card>
          <CardHeader><CardTitle>Đơn hàng theo thời gian</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.byPeriod}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" tick={{ fontSize: 11 }} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} name="Tổng đơn" />
                <Line type="monotone" dataKey="cancelled" stroke="#ef4444" strokeWidth={2} name="Đã huỷ" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* BarChart thời gian xử lý */}
        <Card>
          <CardHeader><CardTitle>Thời gian xử lý trung bình (ngày)</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.avgProcessing}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" tick={{ fontSize: 11 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="days" fill="#f59e0b" name="Ngày" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* LineChart tỷ lệ huỷ */}
        <Card>
          <CardHeader><CardTitle>Tỷ lệ huỷ đơn (%)</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={cancelRate}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" tick={{ fontSize: 11 }} />
                <YAxis unit="%" />
                <Tooltip formatter={(v: number) => `${v}%`} />
                <Line type="monotone" dataKey="rate" stroke="#ef4444" strokeWidth={2} name="Tỷ lệ huỷ" dot />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ======================== Main ========================
export function SellerReports() {
  const [dateFrom, setDateFrom] = useState('2025-01-01');
  const [dateTo, setDateTo] = useState('2025-12-31');
  const [groupBy, setGroupBy] = useState<ReportFilter['groupBy']>('month');

  const filter = useMemo<ReportFilter>(() => ({
    dateRange: [dateFrom, dateTo], groupBy,
  }), [dateFrom, dateTo, groupBy]);

  const ctx = useMemo<FilterCtx>(() => ({
    dateFrom, dateTo, groupBy, setDateFrom, setDateTo, setGroupBy, filter,
  }), [dateFrom, dateTo, groupBy, filter]);

  const [showExport, setShowExport] = useState(false);

  return (
    <FilterContext.Provider value={ctx}>
      <div className="space-y-6">
        <AppBreadcrumb items={[{ label: 'Kênh người bán', href: '/seller' }, { label: 'Báo cáo' }]} />

        {/* Page Header Banner */}
        <div className="rounded-2xl relative overflow-hidden p-5 sm:p-6 text-white"
          style={{ background: 'linear-gradient(135deg, #1a0508 0%, #c91432 50%, #e31837 100%)' }}
        >
          <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/4 blur-2xl" />
          <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'30\' height=\'30\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0 0h30v30H0z\' fill=\'none\' stroke=\'white\' stroke-width=\'.5\'/%3E%3C/svg%3E")' }} />
          <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-11 w-11 rounded-xl bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center shrink-0">
                <BarChart3 className="h-5 w-5 text-yellow-300" />
              </div>
              <div>
                <h2 className="text-white font-bold">Báo cáo & Phân tích</h2>
                <p className="text-red-100/70 text-sm mt-0.5">Phân tích doanh thu, sản phẩm, khách hàng và đơn hàng</p>
              </div>
            </div>
            <Button
              variant="secondary" size="sm"
              className="bg-white/15 text-white border-white/20 hover:bg-white/25 backdrop-blur-sm shrink-0"
              onClick={() => setShowExport(!showExport)}
            >
              <Download className="h-4 w-4 mr-1" /> Xuất báo cáo
            </Button>
          </div>
        </div>

        {/* Export options */}
        {showExport && (
          <ExportOptionsCards onExport={(type) => {
            toast.success(`Đang xuất báo cáo dạng ${type.toUpperCase()}...`);
            setShowExport(false);
          }} />
        )}

        <Tabs defaultValue="revenue">
          <TabsList className="grid w-full grid-cols-4 h-11">
            <TabsTrigger value="revenue" className="flex items-center gap-1.5 text-sm"><DollarSign className="h-4 w-4" /> Doanh thu</TabsTrigger>
            <TabsTrigger value="products" className="flex items-center gap-1.5 text-sm"><Package className="h-4 w-4" /> Sản phẩm</TabsTrigger>
            <TabsTrigger value="customers" className="flex items-center gap-1.5 text-sm"><Users className="h-4 w-4" /> Khách hàng</TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-1.5 text-sm"><ClipboardList className="h-4 w-4" /> Đơn hàng</TabsTrigger>
          </TabsList>
          <TabsContent value="revenue" className="mt-5"><RevenueTab /></TabsContent>
          <TabsContent value="products" className="mt-5"><ProductTab /></TabsContent>
          <TabsContent value="customers" className="mt-5"><CustomerTab /></TabsContent>
          <TabsContent value="orders" className="mt-5"><OrderTab /></TabsContent>
        </Tabs>
      </div>
    </FilterContext.Provider>
  );
}
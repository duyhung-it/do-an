import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Banknote, CalendarDays, Download, RefreshCw, ShoppingCart, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { AppBreadcrumb } from '../shared/AppBreadcrumb';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { adminReportApi } from '../../services/adminBackendApi';

type RevenuePoint = {
  date: string;
  revenue: number;
  orderCount: number;
};

const today = new Date();
const defaultTo = today.toISOString().slice(0, 10);
const defaultFrom = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

const money = (value: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(Number(value || 0));

const shortMoney = (value: number) => {
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)} tỷ`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)} triệu`;
  return money(value);
};

const formatDate = (date: string) => {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
};

export function AdminRevenuePage() {
  const [from, setFrom] = useState(defaultFrom);
  const [to, setTo] = useState(defaultTo);
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<RevenuePoint[]>([]);

  const loadRevenue = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminReportApi.revenue(from, to);
      setRows((data as RevenuePoint[]).map(row => ({
        date: row.date,
        revenue: Number(row.revenue ?? 0),
        orderCount: Number(row.orderCount ?? 0),
      })));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không tải được dữ liệu doanh thu');
    } finally {
      setLoading(false);
    }
  }, [from, to]);

  useEffect(() => { loadRevenue(); }, [loadRevenue]);

  const stats = useMemo(() => {
    const totalRevenue = rows.reduce((sum, row) => sum + row.revenue, 0);
    const totalOrders = rows.reduce((sum, row) => sum + row.orderCount, 0);
    const averageOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;
    const bestDay = rows.reduce<RevenuePoint | null>(
      (best, row) => (!best || row.revenue > best.revenue ? row : best),
      null,
    );
    const midpoint = Math.floor(rows.length / 2);
    const previous = rows.slice(0, midpoint).reduce((sum, row) => sum + row.revenue, 0);
    const current = rows.slice(midpoint).reduce((sum, row) => sum + row.revenue, 0);
    const growth = previous > 0 ? ((current - previous) / previous) * 100 : current > 0 ? 100 : 0;
    return { totalRevenue, totalOrders, averageOrderValue, bestDay, growth };
  }, [rows]);

  const chartRows = useMemo(() => rows.map(row => ({
    ...row,
    label: formatDate(row.date),
  })), [rows]);

  const downloadCsv = async () => {
    try {
      const blob = await adminReportApi.export('revenue');
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `doanh-thu-${from}-${to}.csv`;
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không xuất được báo cáo doanh thu');
    }
  };

  return (
    <div className="space-y-5">
      <AppBreadcrumb items={[{ label: 'Quản trị', href: '/admin' }, { label: 'Doanh thu' }]} />

      <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h1 className="flex items-center gap-2">
            <Banknote className="h-6 w-6 text-primary" />
            Doanh thu
          </h1>
          <p className="text-muted-foreground">Theo dõi doanh thu thực tế từ đơn hàng đã hoàn tất trong BE.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Input className="w-40" type="date" value={from} onChange={event => setFrom(event.target.value)} />
          <Input className="w-40" type="date" value={to} onChange={event => setTo(event.target.value)} />
          <Button variant="outline" onClick={loadRevenue} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Làm mới
          </Button>
          <Button onClick={downloadCsv} disabled={rows.length === 0}>
            <Download className="mr-2 h-4 w-4" /> CSV
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <Banknote className="mb-2 h-5 w-5 text-emerald-600" />
            <p className="text-muted-foreground">Tổng doanh thu</p>
            <p className="text-xl font-semibold">{shortMoney(stats.totalRevenue)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <ShoppingCart className="mb-2 h-5 w-5 text-blue-600" />
            <p className="text-muted-foreground">Đơn hoàn tất</p>
            <p className="text-xl font-semibold">{stats.totalOrders}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <TrendingUp className="mb-2 h-5 w-5 text-violet-600" />
            <p className="text-muted-foreground">Giá trị TB/đơn</p>
            <p className="text-xl font-semibold">{shortMoney(stats.averageOrderValue)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <CalendarDays className="mb-2 h-5 w-5 text-amber-600" />
            <p className="text-muted-foreground">Ngày cao nhất</p>
            <p className="text-xl font-semibold">{stats.bestDay ? shortMoney(stats.bestDay.revenue) : '0 đ'}</p>
            {stats.bestDay && <p className="text-xs text-muted-foreground">{stats.bestDay.date}</p>}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.5fr_0.8fr]">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Biểu đồ doanh thu</CardTitle>
            <Badge variant={stats.growth >= 0 ? 'default' : 'destructive'}>
              {stats.growth >= 0 ? '+' : ''}{stats.growth.toFixed(1)}%
            </Badge>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex h-[360px] items-center justify-center text-muted-foreground">Đang tải doanh thu...</div>
            ) : rows.length === 0 ? (
              <div className="flex h-[360px] items-center justify-center text-muted-foreground">Chưa có doanh thu trong khoảng thời gian này.</div>
            ) : (
              <ResponsiveContainer width="100%" height={360}>
                <ComposedChart data={chartRows}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.08)" />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                  <YAxis yAxisId="left" tick={{ fontSize: 11 }} tickFormatter={shortMoney} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(value: number, name) => name === 'revenue' ? money(value) : value}
                    labelFormatter={(_, payload) => payload?.[0]?.payload?.date ?? ''}
                  />
                  <Bar yAxisId="left" dataKey="revenue" name="Doanh thu" radius={[4, 4, 0, 0]}>
                    {chartRows.map((_, index) => <Cell key={index} fill={index % 2 === 0 ? '#e31837' : '#fb7185'} />)}
                  </Bar>
                  <Line yAxisId="right" type="monotone" dataKey="orderCount" name="Đơn hàng" stroke="#2563eb" strokeWidth={2.5} dot={false} />
                </ComposedChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Cơ cấu theo ngày</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={360}>
              <BarChart data={chartRows.slice(-10)} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={shortMoney} />
                <YAxis type="category" dataKey="label" width={54} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(value: number) => money(value)} />
                <Bar dataKey="revenue" fill="#059669" radius={[0, 4, 4, 0]} name="Doanh thu" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Chi tiết doanh thu theo ngày</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 text-left">Ngày</th>
                  <th className="px-3 py-2 text-right">Đơn hoàn tất</th>
                  <th className="px-3 py-2 text-right">Doanh thu</th>
                  <th className="px-3 py-2 text-right">TB/đơn</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {rows.map(row => (
                  <tr key={row.date}>
                    <td className="px-3 py-2 font-medium">{row.date}</td>
                    <td className="px-3 py-2 text-right">{row.orderCount}</td>
                    <td className="px-3 py-2 text-right">{money(row.revenue)}</td>
                    <td className="px-3 py-2 text-right">{money(row.orderCount > 0 ? row.revenue / row.orderCount : 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

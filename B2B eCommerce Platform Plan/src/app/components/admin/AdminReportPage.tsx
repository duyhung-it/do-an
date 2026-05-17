import { useCallback, useEffect, useMemo, useState } from 'react';
import { BarChart3, Boxes, Download, PackageSearch, RefreshCw, RotateCcw, ShoppingCart, Users } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { toast } from 'sonner';
import { AppBreadcrumb } from '../shared/AppBreadcrumb';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { adminReportApi } from '../../services/adminBackendApi';

type RevenuePoint = { date: string; revenue: number; orderCount: number };
type ProductReport = { productId: string; productName: string; brand: string; soldCount: number; revenue: number };
type CustomerReport = { customerId: string; customerName: string; customerPhone: string; orderCount: number; totalSpent: number };
type InventoryReport = { productId: string; productName: string; brand: string; variantCount: number; stock: number; lowStockVariantCount: number };
type StatusCount = { status: string; count: number };

const COLORS = ['#e31837', '#2563eb', '#059669', '#d97706', '#7c3aed', '#0891b2'];

const money = (value: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(value || 0));

const shortMoney = (value: number) => {
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)} ty`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)} tr`;
  return value.toLocaleString('vi-VN');
};

const today = new Date();
const defaultTo = today.toISOString().slice(0, 10);
const defaultFrom = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

export function AdminReportPage() {
  const [from, setFrom] = useState(defaultFrom);
  const [to, setTo] = useState(defaultTo);
  const [exportType, setExportType] = useState('revenue');
  const [loading, setLoading] = useState(true);
  const [revenue, setRevenue] = useState<RevenuePoint[]>([]);
  const [products, setProducts] = useState<ProductReport[]>([]);
  const [customers, setCustomers] = useState<CustomerReport[]>([]);
  const [inventory, setInventory] = useState<InventoryReport[]>([]);
  const [returns, setReturns] = useState<StatusCount[]>([]);

  const loadReports = useCallback(async () => {
    setLoading(true);
    try {
      const [revenueRows, productRows, customerRows, inventoryRows, returnRows] = await Promise.all([
        adminReportApi.revenue(from, to),
        adminReportApi.products(),
        adminReportApi.customers(),
        adminReportApi.inventory(),
        adminReportApi.returns(),
      ]);
      setRevenue(revenueRows as RevenuePoint[]);
      setProducts(productRows as ProductReport[]);
      setCustomers(customerRows as CustomerReport[]);
      setInventory(inventoryRows as InventoryReport[]);
      setReturns(returnRows as StatusCount[]);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Khong tai duoc bao cao');
    } finally {
      setLoading(false);
    }
  }, [from, to]);

  useEffect(() => { loadReports(); }, [loadReports]);

  const stats = useMemo(() => {
    const totalRevenue = revenue.reduce((sum, row) => sum + Number(row.revenue || 0), 0);
    const totalOrders = revenue.reduce((sum, row) => sum + Number(row.orderCount || 0), 0);
    const soldCount = products.reduce((sum, row) => sum + Number(row.soldCount || 0), 0);
    const lowStock = inventory.reduce((sum, row) => sum + Number(row.lowStockVariantCount || 0), 0);
    return { totalRevenue, totalOrders, soldCount, lowStock };
  }, [inventory, products, revenue]);

  const topProducts = products.slice(0, 10);
  const topCustomers = customers.slice(0, 10);
  const lowStockRows = inventory.filter(row => Number(row.lowStockVariantCount) > 0).slice(0, 10);

  const downloadReport = async () => {
    try {
      const blob = await adminReportApi.export(exportType);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `admin-report-${exportType}.csv`;
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Xuat bao cao that bai');
    }
  };

  return (
    <div className="space-y-5">
      <AppBreadcrumb items={[{ label: 'Admin', href: '/admin' }, { label: 'Bao cao' }]} />

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-primary" />
            Bao cao he thong
          </h1>
          <p className="text-muted-foreground">Doc truc tiep tu cac endpoint report BE da document.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Input className="w-40" type="date" value={from} onChange={event => setFrom(event.target.value)} />
          <Input className="w-40" type="date" value={to} onChange={event => setTo(event.target.value)} />
          <Button variant="outline" onClick={loadReports} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Lam moi
          </Button>
          <Select value={exportType} onValueChange={setExportType}>
            <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="revenue">Revenue</SelectItem>
              <SelectItem value="returns">Returns</SelectItem>
              <SelectItem value="inventory">Inventory</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={downloadReport}>
            <Download className="mr-2 h-4 w-4" /> CSV
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Card><CardContent className="p-4"><ShoppingCart className="mb-2 h-5 w-5 text-blue-600" /><p className="text-muted-foreground">Doanh thu</p><p className="text-xl font-semibold">{shortMoney(stats.totalRevenue)}</p></CardContent></Card>
        <Card><CardContent className="p-4"><PackageSearch className="mb-2 h-5 w-5 text-emerald-600" /><p className="text-muted-foreground">Don hang</p><p className="text-xl font-semibold">{stats.totalOrders}</p></CardContent></Card>
        <Card><CardContent className="p-4"><Boxes className="mb-2 h-5 w-5 text-violet-600" /><p className="text-muted-foreground">SP da ban</p><p className="text-xl font-semibold">{stats.soldCount}</p></CardContent></Card>
        <Card><CardContent className="p-4"><RotateCcw className="mb-2 h-5 w-5 text-amber-600" /><p className="text-muted-foreground">Low-stock variants</p><p className="text-xl font-semibold">{stats.lowStock}</p></CardContent></Card>
      </div>

      {loading ? (
        <Card><CardContent className="p-8 text-center text-muted-foreground">Dang tai bao cao...</CardContent></Card>
      ) : (
        <>
          <div className="grid gap-5 xl:grid-cols-[1.4fr_1fr]">
            <Card>
              <CardHeader><CardTitle>Doanh thu theo ngay</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={revenue}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.08)" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={shortMoney} />
                    <Tooltip formatter={(value: number, name) => name === 'revenue' ? money(value) : value} />
                    <Line type="monotone" dataKey="revenue" stroke="#e31837" strokeWidth={2.5} dot={false} name="Doanh thu" />
                    <Line type="monotone" dataKey="orderCount" stroke="#2563eb" strokeWidth={2} dot={false} name="Don hang" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Trang thai hoan tra</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={returns} dataKey="count" nameKey="status" cx="50%" cy="50%" innerRadius={58} outerRadius={95} paddingAngle={3}>
                      {returns.map((_, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-3 flex flex-wrap gap-2">
                  {returns.map((row, index) => (
                    <Badge key={row.status} variant="outline" style={{ borderColor: COLORS[index % COLORS.length] }}>
                      {row.status}: {row.count}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-5 xl:grid-cols-2">
            <Card>
              <CardHeader><CardTitle>Top san pham</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={topProducts} layout="vertical" margin={{ left: 35 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 11 }} />
                    <YAxis type="category" dataKey="productName" width={120} tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(value: number, name) => name === 'revenue' ? money(value) : value} />
                    <Bar dataKey="revenue" fill="#e31837" radius={[0, 4, 4, 0]} name="Doanh thu" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Ton kho can chu y</CardTitle></CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="text-muted-foreground">
                      <tr>
                        <th className="py-2 text-left">San pham</th>
                        <th className="py-2 text-left">Brand</th>
                        <th className="py-2 text-right">Stock</th>
                        <th className="py-2 text-right">Low</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {(lowStockRows.length ? lowStockRows : inventory.slice(0, 10)).map(row => (
                        <tr key={row.productId}>
                          <td className="py-2 pr-3 font-medium">{row.productName}</td>
                          <td className="py-2 text-muted-foreground">{row.brand}</td>
                          <td className="py-2 text-right">{row.stock}</td>
                          <td className="py-2 text-right">{row.lowStockVariantCount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Users className="h-4 w-4" /> Top khach hang</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 text-muted-foreground">
                    <tr>
                      <th className="px-3 py-2 text-left">Khach hang</th>
                      <th className="px-3 py-2 text-left">Dien thoai</th>
                      <th className="px-3 py-2 text-right">Don hang</th>
                      <th className="px-3 py-2 text-right">Tong chi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {topCustomers.map(row => (
                      <tr key={row.customerId}>
                        <td className="px-3 py-2 font-medium">{row.customerName}</td>
                        <td className="px-3 py-2 text-muted-foreground">{row.customerPhone}</td>
                        <td className="px-3 py-2 text-right">{row.orderCount}</td>
                        <td className="px-3 py-2 text-right">{money(row.totalSpent)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

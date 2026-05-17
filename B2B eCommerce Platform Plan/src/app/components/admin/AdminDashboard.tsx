import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import {
  AlertTriangle,
  ClipboardList,
  CreditCard,
  FolderTree,
  Package,
  RefreshCw,
  Truck,
  Wallet,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { AppBreadcrumb } from '../shared/AppBreadcrumb';
import { StatusBadge } from '../shared/StatusBadge';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { adminCategoryApi, adminOrderApi, adminPaymentApi, adminProductApi } from '../../services/adminBackendApi';

type DashboardState = {
  products: any[];
  categories: any[];
  orders: any[];
  payments: any[];
};

const COLORS = ['#2563eb', '#16a34a', '#f59e0b', '#dc2626', '#7c3aed', '#0891b2'];

const formatMoney = (value: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', notation: 'compact' }).format(value || 0);

const flattenCategories = (categories: any[]): any[] =>
  categories.flatMap(category => [category, ...flattenCategories(category.children ?? [])]);

function KpiCard({
  title,
  value,
  icon: Icon,
  href,
  tone,
}: {
  title: string;
  value: string | number;
  icon: typeof Package;
  href: string;
  tone: string;
}) {
  return (
    <Link to={href}>
      <Card className="h-full hover:shadow-md transition-shadow">
        <CardContent className="p-4 flex items-center gap-3">
          <div className={`h-10 w-10 rounded-md flex items-center justify-center ${tone}`}>
            <Icon className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-muted-foreground">{title}</p>
            <p className="text-xl font-semibold truncate">{value}</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export function AdminDashboard() {
  const [data, setData] = useState<DashboardState | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [products, categories, orders, payments] = await Promise.all([
        adminProductApi.getPaginated({ page: 1, pageSize: 200 }, { field: 'createdAt', direction: 'desc' }),
        adminCategoryApi.getAll(),
        adminOrderApi.getPaginated({ page: 1, pageSize: 200 }, undefined, undefined, undefined),
        adminPaymentApi.getPaginated({ page: 1, pageSize: 200 }, undefined, undefined, undefined),
      ]);
      setData({
        products: products.data,
        categories: flattenCategories(categories),
        orders: orders.data,
        payments: payments.data,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const stats = useMemo(() => {
    const products = data?.products ?? [];
    const orders = data?.orders ?? [];
    const payments = data?.payments ?? [];
    const variants = products.flatMap(product => product.variants ?? []);
    const paidRevenue = payments
      .filter(payment => String(payment.status) === 'Da thanh toan' || payment.status === 'PAID')
      .reduce((sum, payment) => sum + Number(payment.paidAmount ?? payment.amount ?? 0), 0);

    const ordersByStatus = orders.reduce<Record<string, number>>((acc, order) => {
      const key = String(order.status ?? 'Khac');
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {});

    const paymentsByStatus = payments.reduce<Record<string, number>>((acc, payment) => {
      const key = String(payment.status ?? 'Khac');
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {});

    const productByBrand = products.reduce<Record<string, number>>((acc, product) => {
      const key = String(product.brand ?? 'Khac');
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {});

    return {
      productCount: products.length,
      categoryCount: data?.categories.length ?? 0,
      orderCount: orders.length,
      paymentCount: payments.length,
      paidRevenue,
      lowStockCount: variants.filter(variant => Number(variant.stock ?? 0) <= 5).length,
      pendingOrders: orders.filter(order => String(order.status).includes('Cho') || order.status === 'PENDING').length,
      unpaidPayments: payments.filter(payment => ['UNPAID', 'OVERDUE', 'Chua thanh toan', 'Cho thanh toan', 'Qua han'].includes(String(payment.status))).length,
      ordersByStatus: Object.entries(ordersByStatus).map(([status, count]) => ({ status, count })),
      paymentsByStatus: Object.entries(paymentsByStatus).map(([status, count]) => ({ status, count })),
      productByBrand: Object.entries(productByBrand).map(([brand, count]) => ({ brand, count })).slice(0, 8),
      recentOrders: orders.slice(0, 8),
    };
  }, [data]);

  return (
    <div className="space-y-5">
      <AppBreadcrumb items={[{ label: 'Quan tri', href: '/admin' }, { label: 'Tong quan' }]} />

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1>Tong quan admin</h1>
          <p className="text-muted-foreground">Tong hop truc tiep tu cac endpoint BE da co.</p>
        </div>
        <Button variant="outline" onClick={fetchData} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Lam moi
        </Button>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-6 gap-3">
        <KpiCard title="Doanh thu da thu" value={formatMoney(stats.paidRevenue)} icon={Wallet} href="/admin/payments" tone="bg-emerald-50 text-emerald-700" />
        <KpiCard title="Don hang" value={stats.orderCount} icon={ClipboardList} href="/admin/orders" tone="bg-blue-50 text-blue-700" />
        <KpiCard title="San pham" value={stats.productCount} icon={Package} href="/admin/products" tone="bg-violet-50 text-violet-700" />
        <KpiCard title="Danh muc" value={stats.categoryCount} icon={FolderTree} href="/admin/categories" tone="bg-cyan-50 text-cyan-700" />
        <KpiCard title="Thanh toan" value={stats.paymentCount} icon={CreditCard} href="/admin/payments" tone="bg-amber-50 text-amber-700" />
        <KpiCard title="Sap het hang" value={stats.lowStockCount} icon={AlertTriangle} href="/admin/inventory" tone="bg-red-50 text-red-700" />
      </div>

      <div className="grid md:grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-4">
            <p className="text-muted-foreground">Can xu ly don hang</p>
            <Link to="/admin/orders" className="mt-2 flex items-center justify-between">
              <span className="text-xl font-semibold">{stats.pendingOrders}</span>
              <ClipboardList className="h-5 w-5 text-blue-600" />
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-muted-foreground">Thanh toan chua xong</p>
            <Link to="/admin/payments" className="mt-2 flex items-center justify-between">
              <span className="text-xl font-semibold">{stats.unpaidPayments}</span>
              <Wallet className="h-5 w-5 text-amber-600" />
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-muted-foreground">Van chuyen</p>
            <Link to="/admin/shipments" className="mt-2 flex items-center justify-between">
              <span className="text-xl font-semibold">Theo don hang</span>
              <Truck className="h-5 w-5 text-cyan-600" />
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Don hang theo trang thai</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={stats.ordersByStatus} dataKey="count" nameKey="status" innerRadius={60} outerRadius={90}>
                  {stats.ordersByStatus.map((entry, index) => (
                    <Cell key={entry.status} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">San pham theo hang</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.productByBrand}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="brand" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Don hang gan day</CardTitle>
          <Link to="/admin/orders" className="text-primary">Xem tat ca</Link>
        </CardHeader>
        <CardContent>
          {stats.recentOrders.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">Chua co don hang</div>
          ) : (
            <div className="divide-y rounded-md border">
              {stats.recentOrders.map(order => (
                <Link key={order.id} to="/admin/orders" className="grid gap-2 p-3 md:grid-cols-[1fr_160px_160px] hover:bg-muted/30">
                  <div>
                    <p className="font-medium">{order.orderNumber}</p>
                    <p className="text-muted-foreground">{order.customerName ?? order.buyerName}</p>
                  </div>
                  <div className="flex items-center">
                    <StatusBadge status={order.status} />
                  </div>
                  <p className="md:text-right font-medium">{formatMoney(order.totalAmount)}</p>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

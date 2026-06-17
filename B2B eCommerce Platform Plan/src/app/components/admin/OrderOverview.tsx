// ============================================================
// Tổng quan đơn hàng Admin — Nâng cấp Nhóm 13A (Đợt 7)
// Timeline, tabs Vận chuyển/Thanh toán/Hoá đơn, huỷ đơn,
// tranh chấp, hoàn tiền, AreaChart doanh thu, CSV
// ============================================================

import { useState, useEffect, useCallback, useMemo, type ReactNode } from 'react';
import { Link } from 'react-router';
import {
  DollarSign, ClipboardList, TrendingUp, Download, Truck, Wallet,
  FileText, XCircle, CheckCircle2, Eye,
} from 'lucide-react';
import { DataTable } from '../shared/DataTable';
import { FilterBar } from '../shared/FilterBar';
import { StatusBadge } from '../shared/StatusBadge';
import { AppBreadcrumb } from '../shared/AppBreadcrumb';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Separator } from '../ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { adminOrderApi, adminPaymentApi, customerShipmentApi, orderInvoiceApi } from '../../services/adminBackendApi';
import { toast } from 'sonner';
import type {
  Order, Shipment, Payment, Invoice,
  PaginationParams, SortParams, ActiveFilter, FilterConfig, ColumnConfig,
} from '../../types';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

const formatPrice = (price: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
const formatCompact = (price: number) =>
  new Intl.NumberFormat('vi-VN', { notation: 'compact' }).format(price);

type OrderTableColumn = ColumnConfig & { render?: (order: Order) => ReactNode };

const getOrderDiscount = (order: Order) => Number(order.discountAmount ?? order.discount ?? 0);

const renderPromotion = (order: Order) => {
  const discount = getOrderDiscount(order);
  if (!order.promotionCode && discount <= 0) return <span className="text-muted-foreground">-</span>;
  return (
    <div className="min-w-0 space-y-1">
      {order.promotionCode && (
        <Badge variant="outline" className="max-w-[120px] truncate border-orange-200 bg-orange-50 text-orange-700">
          {order.promotionCode}
        </Badge>
      )}
      {discount > 0 && <p className="text-xs font-medium text-emerald-600">-{formatPrice(discount)}</p>}
    </div>
  );
};

const ORDER_STATUS_OPTIONS = ['PENDING', 'CONFIRMED', 'SHIPPING', 'DELIVERED', 'CANCELLED', 'RETURNED'];
const ORDER_STEPS = ['PENDING', 'CONFIRMED', 'SHIPPING', 'DELIVERED'];
const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDING: 'Chờ xác nhận',
  CONFIRMED: 'Đã xác nhận',
  SHIPPING: 'Đang giao',
  DELIVERED: 'Đã giao',
  CANCELLED: 'Đã hủy',
  RETURNED: 'Hoàn trả',
};
const PAYMENT_STATUS_LABELS: Record<string, string> = {
  UNPAID: 'Chưa thanh toán',
  PAID: 'Đã thanh toán',
  FAILED: 'Thất bại',
  REFUNDED: 'Đã hoàn tiền',
  PARTIALLY_REFUNDED: 'Hoàn một phần',
};

const columns: OrderTableColumn[] = [
  { key: 'orderNumber', label: 'Mã đơn hàng', visible: true, sortable: true },
  { key: 'buyerName', label: 'Người mua', visible: true, sortable: true },
  { key: 'supplierName', label: 'Cửa hàng', visible: true, sortable: true },
  { key: 'totalAmount', label: 'Tổng tiền', visible: true, sortable: true },
  { key: 'promotionCode', label: 'Khuyến mại', visible: true, sortable: false, width: '150px', render: renderPromotion },
  { key: 'status', label: 'Trạng thái', visible: true, sortable: true, editable: true, type: 'select',
    options: ORDER_STATUS_OPTIONS },
  { key: 'paymentStatus', label: 'TT thanh toán', visible: true, sortable: true },
  { key: 'paymentMethod', label: 'Thanh toán', visible: true, sortable: false },
  { key: 'createdAt', label: 'Ngày tạo', visible: true, sortable: true },
];

const filterConfigs: FilterConfig[] = [
  { key: 'status', label: 'Trạng thái', type: 'select', options: ORDER_STATUS_OPTIONS.map(status => ({ label: ORDER_STATUS_LABELS[status], value: status })) },
  { key: 'paymentStatus', label: 'TT thanh toán', type: 'select', options: Object.entries(PAYMENT_STATUS_LABELS).map(([value, label]) => ({ label, value })) },
];

export function OrderOverview() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationParams>({ page: 1, pageSize: 10 });
  const [sort, setSort] = useState<SortParams>({ field: 'createdAt', direction: 'desc' });
  const [filters, setFilters] = useState<ActiveFilter[]>([]);
  const [search, setSearch] = useState('');

  // Detail state
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [detailTab, setDetailTab] = useState('overview');
  const [orderShipment, setOrderShipment] = useState<Shipment | null>(null);
  const [orderPayment, setOrderPayment] = useState<Payment | null>(null);
  const [orderInvoices, setOrderInvoices] = useState<Invoice[]>([]);

  // Action dialogs
  const [cancelDialog, setCancelDialog] = useState<Order | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [savingStatus, setSavingStatus] = useState(false);
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [allRes, pageRes] = await Promise.all([
        adminOrderApi.getPaginated({ page: 1, pageSize: 1000 }, undefined, undefined, search || undefined),
        adminOrderApi.getPaginated(pagination, sort.field ? sort : undefined, filters, search || undefined),
      ]);
      setAllOrders(allRes.data);
      let data = pageRes.data;
      let t = pageRes.total;
      if (search) {
        const s = search.toLowerCase();
        const filtered = allRes.data.filter(o =>
          o.orderNumber.toLowerCase().includes(s) ||
          o.buyerName.toLowerCase().includes(s) ||
          o.supplierName.toLowerCase().includes(s) ||
          (o.promotionCode ?? '').toLowerCase().includes(s),
        );
        const activeFilterData = filters.length > 0
          ? filtered.filter(o => filters.every(f => String((o as unknown as Record<string, unknown>)[f.key]) === String(f.value)))
          : filtered;
        t = activeFilterData.length;
        const start = (pagination.page - 1) * pagination.pageSize;
        data = activeFilterData.slice(start, start + pagination.pageSize);
      }
      setOrders(data);
      setTotal(t);
    } finally {
      setLoading(false);
    }
  }, [pagination, sort, filters, search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Load detail data
  const openDetail = async (order: Order) => {
    setSelectedOrder(order);
    setDetailTab('overview');
    const [ship, pay, inv] = await Promise.all([
      customerShipmentApi.getByOrder(order.id).catch(() => null),
      adminPaymentApi.getByOrder(order.id, order.orderNumber).catch(() => null),
      orderInvoiceApi.getByOrder(order.id).catch(() => undefined),
    ]);
    setOrderShipment(ship ?? null);
    setOrderPayment(pay ?? null);
    setOrderInvoices(inv ? [inv] : []);
  };

  // Stats
  const stats = useMemo(() => {
    const totalRevenue = allOrders.reduce((s, o) => s + o.totalAmount, 0);
    const pendingCount = allOrders.filter(o => o.status === 'PENDING').length;
    const completedCount = allOrders.filter(o => o.status === 'DELIVERED').length;
    const cancelledCount = allOrders.filter(o => o.status === 'CANCELLED').length;
    return { totalRevenue, pendingCount, completedCount, cancelledCount, totalOrders: allOrders.length };
  }, [allOrders]);

  // Revenue by date chart
  const revenueByDate = useMemo(() => {
    const map: Record<string, number> = {};
    for (const o of allOrders) {
      if (o.status !== 'CANCELLED') {
        const d = o.createdAt.slice(0, 10);
        map[d] = (map[d] || 0) + o.totalAmount;
      }
    }
    return Object.entries(map)
      .map(([date, revenue]) => ({ date, revenue }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-14);
  }, [allOrders]);

  // Timeline
  const getTimelineStep = (status: string) => {
    if (status === 'CANCELLED') return -1;
    return ORDER_STEPS.indexOf(status);
  };

  // Inline edit
  const handleInlineEdit = async (id: string, field: string, value: unknown) => {
    if (field === 'status') {
      await adminOrderApi.updateStatus(id, value as Order['status']);
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status: value as Order['status'] } : o));
      toast.success('Đã cập nhật trạng thái');
    }
  };

  const updateOrderStatusState = (id: string, status: Order['status']) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
    setAllOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
    setSelectedOrder(prev => prev?.id === id ? { ...prev, status } : prev);
  };

  const reloadOrderSideData = async (order: Order) => {
    const [ship, pay, inv] = await Promise.all([
      customerShipmentApi.getByOrder(order.id).catch(() => null),
      adminPaymentApi.getByOrder(order.id, order.orderNumber).catch(() => null),
      orderInvoiceApi.getByOrder(order.id).catch(() => undefined),
    ]);
    setOrderShipment(ship ?? null);
    setOrderPayment(pay ?? null);
    setOrderInvoices(inv ? [inv] : []);
  };

  const handleStatusAction = async (status: Order['status'], note: string) => {
    if (!selectedOrder || savingStatus) return;
    setSavingStatus(true);
    try {
      const updated = await adminOrderApi.updateStatus(selectedOrder.id, status, note);
      updateOrderStatusState(selectedOrder.id, updated.status);
      await reloadOrderSideData({ ...selectedOrder, status: updated.status });
      toast.success('Đã cập nhật trạng thái đơn hàng');
    } finally {
      setSavingStatus(false);
    }
  };

  // Cancel order
  const handleCancel = async () => {
    if (!cancelDialog || !cancelReason.trim()) { toast.error('Vui lòng nhập lý do'); return; }
    const updated = await adminOrderApi.updateStatus(cancelDialog.id, 'CANCELLED', cancelReason);
    updateOrderStatusState(cancelDialog.id, updated.status);
    setCancelDialog(null);
    setCancelReason('');
    toast.success('Đã huỷ đơn hàng');
  };

  // CSV Export
  const handleExportCSV = () => {
    const headers = ['Mã đơn', 'Người mua', 'Cửa hàng', 'Tổng tiền', 'Khuyến mại', 'Giảm giá', 'Trạng thái', 'Thanh toán', 'Ngày tạo'];
    const rows = allOrders.map(o => [
      o.orderNumber,
      o.buyerName,
      o.supplierName,
      o.totalAmount.toString(),
      o.promotionCode || '',
      getOrderDiscount(o).toString(),
      o.status,
      o.paymentMethod,
      o.createdAt,
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `don-hang-${new Date().toISOString().slice(0, 10)}.csv`; a.click();
    URL.revokeObjectURL(url);
    toast.success('Đã xuất file CSV');
  };

  const renderListItem = (order: Order) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="min-w-0">
            <span className="font-medium">{order.orderNumber}</span>
            <div className="mt-1">
              <StatusBadge status={order.status} />
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={(event) => {
              event.stopPropagation();
              openDetail(order);
            }}
          >
            <Eye className="mr-1 h-3.5 w-3.5" /> Chi tiết
          </Button>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-muted-foreground">
          <span>Người mua: {order.buyerName}</span>
          <span>Cửa hàng: {order.supplierName}</span>
          <span className="text-primary">{formatPrice(order.totalAmount)}</span>
          {getOrderDiscount(order) > 0 && (
            <span className="text-emerald-600">
              Khuyến mại: {order.promotionCode || '-'} (-{formatPrice(getOrderDiscount(order))})
            </span>
          )}
          <span>{order.createdAt}</span>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-4">
      <AppBreadcrumb items={[{ label: 'Quản trị', href: '/admin' }, { label: 'Đơn hàng' }]} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1>Tổng quan đơn hàng</h1>
          <p className="text-muted-foreground">Quản lý tất cả đơn hàng trên hệ thống</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleExportCSV}>
          <Download className="mr-1 h-4 w-4" /> Xuất CSV
        </Button>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card><CardContent className="p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-muted-foreground">Tổng doanh thu</span>
            <DollarSign className="h-4 w-4 text-green-500" />
          </div>
          <p className="text-xl">{formatCompact(stats.totalRevenue)} ₫</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-muted-foreground">Tổng đơn hàng</span>
            <ClipboardList className="h-4 w-4 text-blue-500" />
          </div>
          <p className="text-xl">{stats.totalOrders}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-muted-foreground">Chờ xác nhận</span>
            <TrendingUp className="h-4 w-4 text-yellow-500" />
          </div>
          <p className="text-xl">{stats.pendingCount}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-muted-foreground">Đã hoàn thành</span>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </div>
          <p className="text-xl">{stats.completedCount}</p>
        </CardContent></Card>
      </div>

      {/* AreaChart doanh thu theo ngày */}
      {revenueByDate.length > 2 && (
        <Card>
          <CardHeader><CardTitle>Doanh thu 14 ngày gần nhất</CardTitle></CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueByDate}>
                  <CartesianGrid key="grid-order-revenue" strokeDasharray="3 3" />
                  <XAxis key="xaxis-order-revenue" dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis key="yaxis-order-revenue" tickFormatter={v => formatCompact(v)} />
                  <Tooltip key="tooltip-order-revenue" formatter={(v: number) => [formatPrice(v), 'Doanh thu']} />
                  <Area key="area-order-revenue" type="monotone" dataKey="revenue" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.15} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      <FilterBar
        filters={filterConfigs}
        activeFilters={filters}
        onFilterChange={f => { setFilters(f); setPagination(p => ({ ...p, page: 1 })); }}
        searchValue={search}
        onSearchChange={v => { setSearch(v); setPagination(p => ({ ...p, page: 1 })); }}
        searchPlaceholder="Tìm mã đơn, người mua, cửa hàng..."
      />

      <DataTable
        data={orders}
        columns={columns}
        totalItems={total}
        pagination={pagination}
        sort={sort}
        onPaginationChange={setPagination}
        onSortChange={setSort}
        onInlineEdit={handleInlineEdit}
        onRowClick={openDetail}
        getId={o => o.id}
        renderListItem={renderListItem}
        loading={loading}
        viewModes={['table', 'list']}
        renderActions={(order: Order) => (
          <Button
            size="sm"
            variant="outline"
            onClick={(event) => {
              event.stopPropagation();
              openDetail(order);
            }}
          >
            <Eye className="mr-1 h-3.5 w-3.5" /> Chi tiết
          </Button>
        )}
      />

      {/* === Chi tiết đơn hàng modal (tabs) === */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chi tiết đơn hàng {selectedOrder?.orderNumber}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              {/* Timeline */}
              {selectedOrder.status !== 'CANCELLED' && (
                <div className="flex items-center gap-1 overflow-x-auto pb-2">
                  {ORDER_STEPS.map((step, i) => {
                    const current = getTimelineStep(selectedOrder.status);
                    const done = i <= current;
                    return (
                      <div key={step} className="flex items-center gap-1 shrink-0">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs
                          ${done ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}>
                          {i + 1}
                        </div>
                        <span className={`text-xs ${done ? 'text-primary' : 'text-muted-foreground'}`}>{ORDER_STATUS_LABELS[step] ?? step}</span>
                        {i < ORDER_STEPS.length - 1 && <div className={`w-6 h-0.5 ${done ? 'bg-primary' : 'bg-muted'}`} />}
                      </div>
                    );
                  })}
                </div>
              )}
              {selectedOrder.status === 'CANCELLED' && (
                <Badge variant="destructive">Đơn hàng đã bị huỷ</Badge>
              )}

              {/* Admin actions */}
              <div className="flex flex-wrap gap-2">
                <StatusBadge status={selectedOrder.status} />
                <div className="ml-auto flex gap-2">
                  {selectedOrder.status === 'PENDING' && (
                    <Button
                      size="sm"
                      onClick={() => handleStatusAction('CONFIRMED' as Order['status'], 'Admin xác nhận đơn hàng')}
                      disabled={savingStatus}
                    >
                      <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Xác nhận đơn
                    </Button>
                  )}
                  {selectedOrder.status === 'CONFIRMED' && (
                    <Button
                      size="sm"
                      onClick={() => handleStatusAction('SHIPPING' as Order['status'], 'Admin chuyển đơn sang giao hàng')}
                      disabled={savingStatus}
                    >
                      <Truck className="mr-1 h-3.5 w-3.5" /> Chuyển giao hàng
                    </Button>
                  )}
                  {selectedOrder.status === 'SHIPPING' && (
                    <Button
                      size="sm"
                      onClick={() => handleStatusAction('DELIVERED' as Order['status'], 'Admin xác nhận đã giao hàng')}
                      disabled={savingStatus}
                    >
                      <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Đã giao
                    </Button>
                  )}
                  {selectedOrder.status !== 'CANCELLED' && selectedOrder.status !== 'DELIVERED' && (
                    <Button size="sm" variant="outline" className="text-red-600" onClick={() => { setCancelDialog(selectedOrder); }}>
                      <XCircle className="mr-1 h-3.5 w-3.5" /> Huỷ đơn
                    </Button>
                  )}
                </div>
              </div>

              <Tabs value={detailTab} onValueChange={setDetailTab}>
                <TabsList className="flex flex-wrap">
                  <TabsTrigger value="overview">Tổng quan</TabsTrigger>
                  <TabsTrigger value="shipping">Vận chuyển</TabsTrigger>
                  <TabsTrigger value="payment">Thanh toán</TabsTrigger>
                  <TabsTrigger value="invoices">Hoá đơn ({orderInvoices.length})</TabsTrigger>
                </TabsList>

                {/* Tab Tổng quan */}
                <TabsContent value="overview" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div><p className="text-muted-foreground">Người mua</p><p>{selectedOrder.buyerName}</p></div>
                    <div><p className="text-muted-foreground">Cửa hàng</p><p>{selectedOrder.supplierName}</p></div>
                    <div><p className="text-muted-foreground">Địa chỉ</p><p>{selectedOrder.shippingAddress}</p></div>
                    <div><p className="text-muted-foreground">Thanh toán</p><p>{selectedOrder.paymentMethod}</p></div>
                  </div>
                  {selectedOrder.notes && (
                    <div><p className="text-muted-foreground">Ghi chú</p><p>{selectedOrder.notes}</p></div>
                  )}
                  <Separator />
                  <div className="space-y-3">
                    <p className="font-medium">Sản phẩm</p>
                    {selectedOrder.items.map(item => (
                      <div key={item.id} className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0">
                          <ImageWithFallback src={item.productImage} alt={item.productName} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="truncate">{item.productName}</p>
                          <p className="text-muted-foreground">{formatPrice(item.unitPrice)} × {item.quantity}</p>
                        </div>
                        <p className="font-medium shrink-0">{formatPrice(item.totalPrice)}</p>
                      </div>
                    ))}
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <div className="flex justify-between"><span className="text-muted-foreground">Tạm tính</span><span>{formatPrice(selectedOrder.subtotal)}</span></div>
                    {(selectedOrder.promotionCode || getOrderDiscount(selectedOrder) > 0) && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Khuyến mại {selectedOrder.promotionCode ? `(${selectedOrder.promotionCode})` : ''}</span>
                        <span className="text-emerald-600">-{formatPrice(getOrderDiscount(selectedOrder))}</span>
                      </div>
                    )}
                    <div className="flex justify-between"><span className="text-muted-foreground">Vận chuyển</span><span>{formatPrice(selectedOrder.shippingFee)}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Thuế</span><span>{formatPrice(selectedOrder.tax)}</span></div>
                    <Separator />
                    <div className="flex justify-between text-lg">
                      <span className="font-medium">Tổng cộng</span>
                      <span className="text-primary">{formatPrice(selectedOrder.totalAmount)}</span>
                    </div>
                  </div>
                </TabsContent>

                {/* Tab Vận chuyển */}
                <TabsContent value="shipping" className="mt-4">
                  {orderShipment ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div><p className="text-muted-foreground">Mã vận đơn</p><p>{orderShipment.trackingNumber}</p></div>
                        <div><p className="text-muted-foreground">Đơn vị vận chuyển</p><p>{orderShipment.carrier}</p></div>
                        <div><p className="text-muted-foreground">Trạng thái</p><StatusBadge status={orderShipment.status} /></div>
                        <div><p className="text-muted-foreground">Ngày giao dự kiến</p><p>{orderShipment.estimatedDate}</p></div>
                      </div>
                      {orderShipment.actualDate && (
                        <div><p className="text-muted-foreground">Ngày giao thực tế</p><p>{orderShipment.actualDate}</p></div>
                      )}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-4">Chưa có thông tin vận chuyển</p>
                  )}
                </TabsContent>

                {/* Tab Thanh toán */}
                <TabsContent value="payment" className="mt-4">
                  {orderPayment ? (
                    <div className="space-y-3">
                      <div className="flex justify-end">
                        <Button asChild size="sm" variant="outline">
                          <Link to={`/admin/payments?search=${encodeURIComponent(selectedOrder.orderNumber)}`}>
                            <Wallet className="mr-1 h-3.5 w-3.5" /> Mở trong quản lý thanh toán
                          </Link>
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div><p className="text-muted-foreground">Mã thanh toán</p><p>{orderPayment.paymentNumber || orderPayment.id}</p></div>
                        <div><p className="text-muted-foreground">Phương thức</p><p>{orderPayment.method}</p></div>
                        <div><p className="text-muted-foreground">Số tiền</p><p className="text-primary">{formatPrice(orderPayment.amount)}</p></div>
                        <div><p className="text-muted-foreground">Trạng thái</p><StatusBadge status={orderPayment.status} /></div>
                        <div><p className="text-muted-foreground">Hạn thanh toán</p><p>{orderPayment.dueDate}</p></div>
                        {orderPayment.paidDate && (
                          <div><p className="text-muted-foreground">Ngày thanh toán</p><p>{orderPayment.paidDate}</p></div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-4">Chưa có thông tin thanh toán</p>
                  )}
                </TabsContent>

                {/* Tab Hoá đơn */}
                <TabsContent value="invoices" className="mt-4">
                  {orderInvoices.length === 0
                    ? <p className="text-muted-foreground text-center py-4">Chưa có hoá đơn</p>
                    : (
                      <div className="space-y-2">
                        {orderInvoices.map(inv => (
                          <div key={inv.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                            <div>
                              <p className="font-medium">{inv.invoiceNumber}</p>
                              <p className="text-muted-foreground">{inv.issuedDate}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-primary">{formatPrice(inv.totalAmount)}</p>
                              <StatusBadge status={inv.status} />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                </TabsContent>
              </Tabs>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Cancel dialog */}
      <Dialog open={!!cancelDialog} onOpenChange={() => { setCancelDialog(null); setCancelReason(''); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle className="text-destructive">Huỷ đơn hàng</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <p className="text-muted-foreground">Huỷ đơn hàng <strong>{cancelDialog?.orderNumber}</strong></p>
            <div className="grid gap-2">
              <Label>Lý do huỷ *</Label>
              <Textarea value={cancelReason} onChange={e => setCancelReason(e.target.value)} placeholder="Nhập lý do..." rows={3} />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => { setCancelDialog(null); setCancelReason(''); }}>Quay lại</Button>
              <Button variant="destructive" onClick={handleCancel} disabled={!cancelReason.trim()}>Xác nhận huỷ</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}

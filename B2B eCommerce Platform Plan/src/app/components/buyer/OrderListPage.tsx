// ============================================================
// Danh sách đơn hàng Buyer — Redesign UI-E Đợt 19
// E19.01–E19.02: Status tabs, card redesign, reorder
// ============================================================

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router';
import {
  RefreshCw, Package, Clock, CheckCircle2, Truck, XCircle,
  ArrowRight, Building2, Calendar, Eye,
} from 'lucide-react';
import { DataTable } from '../shared/DataTable';
import { FilterBar } from '../shared/FilterBar';
import { StatusBadge } from '../shared/StatusBadge';
import { AppBreadcrumb } from '../shared/AppBreadcrumb';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { orderApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { toast } from 'sonner';
import type { Order, PaginationParams, SortParams, ActiveFilter, FilterConfig, ColumnConfig } from '../../types';

const formatPrice = (price: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

const getOrderStoreName = (order: Pick<Order, 'supplierName'>) => order.supplierName || 'CELLPHONES';

const columns: ColumnConfig[] = [
  { key: 'orderNumber', label: 'Mã đơn hàng', visible: true, sortable: true },
  { key: 'supplierName', label: 'Cửa hàng', visible: true, sortable: true },
  { key: 'totalAmount', label: 'Tổng tiền', visible: true, sortable: true },
  { key: 'status', label: 'Trạng thái', visible: true, sortable: true },
  { key: 'paymentMethod', label: 'Thanh toán', visible: true, sortable: false },
  { key: 'createdAt', label: 'Ngày tạo', visible: true, sortable: true },
];

const filterConfigs: FilterConfig[] = [
  {
    key: 'status', label: 'Trạng thái', type: 'select', options: [
      { label: 'Chờ xác nhận', value: 'Chờ xác nhận' },
      { label: 'Đã xác nhận', value: 'Đã xác nhận' },
      { label: 'Đang xử lý', value: 'Đang xử lý' },
      { label: 'Đang giao hàng', value: 'Đang giao hàng' },
      { label: 'Đã giao', value: 'Đã giao' },
      { label: 'Đã huỷ', value: 'Đã huỷ' },
    ],
  },
];

// E19.01: Status tabs
const statusTabs = [
  { label: 'Tất cả', value: '', icon: Package, count: 0 },
  { label: 'Chờ xác nhận', value: 'Chờ xác nhận', icon: Clock, count: 0 },
  { label: 'Đang xử lý', value: 'Đang xử lý', icon: RefreshCw, count: 0 },
  { label: 'Đang giao', value: 'Đang giao hàng', icon: Truck, count: 0 },
  { label: 'Đã giao', value: 'Đã giao', icon: CheckCircle2, count: 0 },
  { label: 'Đã huỷ', value: 'Đã huỷ', icon: XCircle, count: 0 },
];

function parseUrlParams(searchParams: URLSearchParams) {
  const page = Number(searchParams.get('page')) || 1;
  const pageSize = Number(searchParams.get('pageSize')) || 10;
  const sortField = searchParams.get('sortField') || 'createdAt';
  const sortDir = (searchParams.get('sortDir') || 'desc') as 'asc' | 'desc';
  const filters: ActiveFilter[] = [];
  const status = searchParams.get('status');
  if (status) filters.push({ key: 'status', value: status });
  return { pagination: { page, pageSize }, sort: { field: sortField, direction: sortDir }, filters };
}

function buildUrlParams(pagination: PaginationParams, sort: SortParams, filters: ActiveFilter[]): Record<string, string> {
  const params: Record<string, string> = {};
  if (pagination.page > 1) params.page = String(pagination.page);
  if (pagination.pageSize !== 10) params.pageSize = String(pagination.pageSize);
  if (sort.field !== 'createdAt') params.sortField = sort.field;
  if (sort.direction !== 'desc') params.sortDir = sort.direction;
  for (const f of filters) {
    if (typeof f.value === 'string') params[f.key] = f.value;
  }
  return params;
}

// Relative time helper
function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return 'Hôm nay';
  if (days === 1) return 'Hôm qua';
  if (days < 7) return `${days} ngày trước`;
  if (days < 30) return `${Math.floor(days / 7)} tuần trước`;
  return dateStr;
}

export function OrderListPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const { addItem } = useCart();

  const initial = parseUrlParams(searchParams);
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationParams>(initial.pagination);
  const [sort, setSort] = useState<SortParams>(initial.sort);
  const [filters, setFilters] = useState<ActiveFilter[]>(initial.filters);
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({});
  const [activeTab, setActiveTab] = useState(
    initial.filters.find(f => f.key === 'status')?.value as string ?? '',
  );

  useEffect(() => {
    const params = buildUrlParams(pagination, sort, filters);
    setSearchParams(params, { replace: true });
  }, [pagination, sort, filters, setSearchParams]);

  // Load status counts
  useEffect(() => {
    if (!user) return;
    orderApi.getPaginated({ page: 1, pageSize: 1000 }, undefined, [{ key: 'buyerId', value: user.id }]).then(res => {
      const counts: Record<string, number> = {};
      for (const o of res.data) {
        counts[o.status] = (counts[o.status] || 0) + 1;
      }
      counts[''] = res.total;
      setStatusCounts(counts);
    });
  }, [user]);

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const allFilters: ActiveFilter[] = [...filters, { key: 'buyerId', value: user.id }];
      const res = await orderApi.getPaginated(pagination, sort.field ? sort : undefined, allFilters);
      setOrders(res.data);
      setTotal(res.total);
    } finally {
      setLoading(false);
    }
  }, [pagination, sort, filters, user]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleTabChange = (tabValue: string) => {
    setActiveTab(tabValue);
    if (tabValue) {
      setFilters([{ key: 'status', value: tabValue }]);
    } else {
      setFilters([]);
    }
    setPagination(p => ({ ...p, page: 1 }));
  };

  // E19.02: Card view redesign
  const renderListItem = (order: Order) => {
    const isCompleted = ['Đã giao', 'Đã huỷ', 'Hoàn trả'].includes(order.status);
    const statusColor = order.status === 'Đã giao' ? 'bg-emerald-500'
      : order.status === 'Đã huỷ' ? 'bg-destructive'
      : order.status === 'Đang giao hàng' ? 'bg-blue-500'
      : order.status === 'Đang xử lý' ? 'bg-amber-500'
      : 'bg-orange-400';

    return (
      <Card className="overflow-hidden border-0 shadow-sm hover:shadow-md transition-all duration-200 group">
        {/* Top color bar */}
        <div className={`h-1 ${statusColor}`} />
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            {/* Left: Order info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-sm" style={{ fontWeight: 600 }}>{order.orderNumber}</span>
                <StatusBadge status={order.status} />
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Building2 className="h-3 w-3 shrink-0" /> {getOrderStoreName(order)}
              </p>
              <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                <Calendar className="h-3 w-3 shrink-0" /> {timeAgo(order.createdAt)}
              </p>

              {/* Items preview */}
              <div className="flex items-center gap-1 mt-2">
                {order.items.slice(0, 3).map(item => (
                  <Badge key={item.id} variant="secondary" className="text-[10px] max-w-[120px] truncate">
                    {item.productName}
                  </Badge>
                ))}
                {order.items.length > 3 && (
                  <span className="text-[10px] text-muted-foreground">+{order.items.length - 3}</span>
                )}
              </div>
            </div>

            {/* Right: Price + actions */}
            <div className="shrink-0 text-right flex flex-col items-end gap-2">
              <p className="text-primary text-sm" style={{ fontFamily: 'var(--font-heading)', fontWeight: 700 }}>
                {formatPrice(order.totalAmount)}
              </p>
              <p className="text-[10px] text-muted-foreground">{order.items.length} sản phẩm</p>
              <div className="flex items-center gap-1.5">
                {isCompleted && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs"
                    title="Đặt lại"
                    onClick={async (e) => {
                      e.stopPropagation();
                      for (const item of order.items) {
                        await addItem({
                          productId: item.productId, productName: item.productName,
                          productImage: item.productImage, supplierId: order.supplierId,
                          supplierName: order.supplierName, quantity: item.quantity,
                          unitPrice: item.unitPrice, variantName: item.variantName,
                        });
                      }
                      toast.success(`Đã thêm SP từ ${order.orderNumber} vào giỏ`);
                    }}
                  >
                    <RefreshCw className="h-3.5 w-3.5 mr-1" /> Đặt lại
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={(e) => { e.stopPropagation(); navigate(`/orders/${order.id}`); }}
                >
                  <Eye className="h-3.5 w-3.5 mr-1" /> Chi tiết
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6">
      <AppBreadcrumb items={[{ label: 'Trang chủ', href: '/' }, { label: 'Đơn hàng' }]} />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
        <div>
          <h1 style={{ fontFamily: 'var(--font-heading)' }}>Đơn hàng của tôi</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Theo dõi và quản lý đơn hàng</p>
        </div>
      </div>

      {/* E19.01: Status tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-2 mb-4 -mx-1 px-1">
        {statusTabs.map(tab => {
          const count = statusCounts[tab.value] ?? 0;
          const isActive = activeTab === tab.value;
          return (
            <button
              key={tab.value}
              className={`
                flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm whitespace-nowrap transition-all shrink-0
                ${isActive
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'}
              `}
              onClick={() => handleTabChange(tab.value)}
            >
              <tab.icon className="h-3.5 w-3.5" />
              {tab.label}
              {count > 0 && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${isActive ? 'bg-white/20' : 'bg-muted-foreground/10'}`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <FilterBar
        filters={filterConfigs}
        activeFilters={filters}
        onFilterChange={f => { setFilters(f); setPagination(p => ({ ...p, page: 1 })); }}
      />

      <div className="mt-4">
        <DataTable
          data={orders}
          columns={columns}
          totalItems={total}
          pagination={pagination}
          sort={sort}
          onPaginationChange={setPagination}
          onSortChange={setSort}
          onRowClick={o => navigate(`/orders/${o.id}`)}
          getId={o => o.id}
          renderListItem={renderListItem}
          loading={loading}
          renderActions={(row) => {
            const order = row as Order;
            if (['Đã giao', 'Hoàn trả'].includes(order.status)) {
              return (
                <Button
                  variant="ghost" size="sm" title="Đặt lại"
                  onClick={async (e) => {
                    e.stopPropagation();
                    for (const item of order.items) {
                      await addItem({
                        productId: item.productId, productName: item.productName,
                        productImage: item.productImage, supplierId: order.supplierId,
                        supplierName: order.supplierName, quantity: item.quantity,
                        unitPrice: item.unitPrice, variantName: item.variantName,
                      });
                    }
                    toast.success(`Đã thêm SP từ ${order.orderNumber} vào giỏ`);
                  }}
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              );
            }
            return null;
          }}
        />
      </div>
    </div>
  );
}

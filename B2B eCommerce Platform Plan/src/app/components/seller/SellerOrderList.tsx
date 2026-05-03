// ============================================================
// Danh sách đơn hàng Seller — Kanban, status tabs, quick actions
// P4.21–P4.24, P4.30
// ============================================================

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router';
import {
  DollarSign, ClipboardList, Clock, CheckCircle2, Download, Columns,
  List, Eye, XCircle, Printer, MoreHorizontal, User,
} from 'lucide-react';
import { DataTable } from '../shared/DataTable';
import { FilterBar } from '../shared/FilterBar';
import { StatusBadge } from '../shared/StatusBadge';
import { AppBreadcrumb } from '../shared/AppBreadcrumb';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { orderApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';
import type { Order, PaginationParams, SortParams, ActiveFilter, FilterConfig, ColumnConfig } from '../../types';

const formatPrice = (price: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

const formatCompact = (price: number) =>
  new Intl.NumberFormat('vi-VN', { notation: 'compact' }).format(price);

const timeAgo = (dateStr: string) => {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now.getTime() - d.getTime()) / 60000);
  if (diff < 60) return `${diff} phút trước`;
  if (diff < 1440) return `${Math.floor(diff / 60)} giờ trước`;
  return `${Math.floor(diff / 1440)} ngày trước`;
};

// P4.23: Status tabs
const STATUS_TABS = [
  { key: 'all', label: 'Tất cả' },
  { key: 'Chờ xác nhận', label: 'Mới' },
  { key: 'Đã xác nhận', label: 'Xác nhận' },
  { key: 'Đang giao hàng', label: 'Đang giao' },
  { key: 'Đã giao', label: 'Hoàn thành' },
  { key: 'Đã huỷ', label: 'Đã huỷ' },
];

// Kanban config (P4.21)
const KANBAN_COLS = [
  { status: 'Chờ xác nhận', label: 'Chờ xác nhận', borderColor: 'border-t-yellow-500', textColor: 'text-yellow-600' },
  { status: 'Đã xác nhận', label: 'Đã xác nhận', borderColor: 'border-t-blue-500', textColor: 'text-blue-600' },
  { status: 'Đang xử lý', label: 'Đang xử lý', borderColor: 'border-t-indigo-500', textColor: 'text-indigo-600' },
  { status: 'Đang giao hàng', label: 'Đang giao', borderColor: 'border-t-purple-500', textColor: 'text-purple-600' },
  { status: 'Đã giao', label: 'Hoàn thành', borderColor: 'border-t-green-500', textColor: 'text-green-600' },
  { status: 'Đã huỷ', label: 'Đã huỷ', borderColor: 'border-t-red-500', textColor: 'text-red-500' },
];

const columns: ColumnConfig[] = [
  { key: 'orderNumber', label: 'Mã đơn hàng', visible: true, sortable: true },
  {
    key: 'buyerName', label: 'Người mua', visible: true, sortable: true,
    render: (o: Order) => (
      <div className="flex items-center gap-2">
        <div className="h-7 w-7 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
          <User className="h-3.5 w-3.5" />
        </div>
        <span className="truncate">{o.buyerName}</span>
      </div>
    ),
  },
  {
    key: 'totalAmount', label: 'Tổng tiền', visible: true, sortable: true,
    render: (o: Order) => <span className="text-primary">{formatPrice(o.totalAmount)}</span>,
  },
  {
    key: 'status', label: 'Trạng thái', visible: true, sortable: true, editable: true, type: 'select',
    options: ['Chờ xác nhận', 'Đã xác nhận', 'Đang xử lý', 'Đang giao hàng', 'Đã giao', 'Đã huỷ'],
    render: (o: Order) => <StatusBadge status={o.status} />,
  },
  { key: 'paymentMethod', label: 'Thanh toán', visible: true, sortable: false },
  {
    key: 'createdAt', label: 'Ngày tạo', visible: true, sortable: true,
    render: (o: Order) => <span className="text-muted-foreground">{timeAgo(o.createdAt)}</span>,
  },
];

const filterConfigs: FilterConfig[] = [
  { key: 'status', label: 'Trạng thái', type: 'select', options: [
    { label: 'Chờ xác nhận', value: 'Chờ xác nhận' },
    { label: 'Đã xác nhận', value: 'Đã xác nhận' },
    { label: 'Đang xử lý', value: 'Đang xử lý' },
    { label: 'Đang giao hàng', value: 'Đang giao hàng' },
    { label: 'Đã giao', value: 'Đã giao' },
    { label: 'Đã huỷ', value: 'Đã huỷ' },
  ]},
];

export function SellerOrderList() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [allSellerOrders, setAllSellerOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationParams>({ page: 1, pageSize: 10 });
  const [sort, setSort] = useState<SortParams>({ field: 'createdAt', direction: 'desc' });
  const [filters, setFilters] = useState<ActiveFilter[]>([]);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');
  const [statusTab, setStatusTab] = useState('all');
  const [quickActionId, setQuickActionId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const supplierFilter: ActiveFilter[] = user.supplierId
        ? [{ key: 'supplierId', value: user.supplierId }]
        : [];

      const allRes = await orderApi.getPaginated({ page: 1, pageSize: 1000 }, undefined, supplierFilter);
      setAllSellerOrders(allRes.data);

      const allFilters = [...filters, ...supplierFilter];
      if (statusTab !== 'all') {
        allFilters.push({ key: 'status', value: statusTab });
      }
      const pageRes = await orderApi.getPaginated(pagination, sort.field ? sort : undefined, allFilters);

      let data = pageRes.data;
      let t = pageRes.total;
      if (search) {
        const s = search.toLowerCase();
        const filtered = allRes.data.filter(o =>
          o.orderNumber.toLowerCase().includes(s) || o.buyerName.toLowerCase().includes(s),
        );
        const activeFilterData = allFilters.length > 0
          ? filtered.filter(o => allFilters.every(f => {
              const val = (o as unknown as Record<string, unknown>)[f.key];
              return String(val) === String(f.value);
            }))
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
  }, [pagination, sort, filters, search, user, statusTab]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const stats = useMemo(() => {
    const revenue = allSellerOrders.reduce((s, o) => s + o.totalAmount, 0);
    const pending = allSellerOrders.filter(o => o.status === 'Chờ xác nhận').length;
    const completed = allSellerOrders.filter(o => o.status === 'Đã giao').length;
    return { revenue, pending, completed, total: allSellerOrders.length };
  }, [allSellerOrders]);

  // Counts per status tab
  const tabCounts = useMemo(() => {
    const counts: Record<string, number> = { all: allSellerOrders.length };
    STATUS_TABS.forEach(t => {
      if (t.key !== 'all') counts[t.key] = allSellerOrders.filter(o => o.status === t.key).length;
    });
    return counts;
  }, [allSellerOrders]);

  const handleInlineEdit = async (id: string, field: string, value: unknown) => {
    if (field === 'status') {
      await orderApi.updateStatus(id, value as Order['status']);
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status: value as Order['status'] } : o));
      toast.success('Đã cập nhật trạng thái đơn hàng');
    }
  };

  // P4.24: Quick actions
  const handleQuickAction = async (orderId: string, action: string) => {
    setQuickActionId(null);
    if (action === 'confirm') {
      await orderApi.updateStatus(orderId, 'Đã xác nhận');
      toast.success('Đã xác nhận đơn hàng');
      fetchData();
    } else if (action === 'reject') {
      await orderApi.updateStatus(orderId, 'Đã huỷ');
      toast.success('Đã từ chối đơn hàng');
      fetchData();
    } else if (action === 'print') {
      window.print();
    } else if (action === 'view') {
      navigate(`/seller/orders/${orderId}`);
    }
  };

  const handleExportCSV = () => {
    const headers = ['Mã đơn', 'Người mua', 'Tổng tiền', 'Trạng thái', 'Thanh toán', 'Ngày tạo'];
    const rows = allSellerOrders.map(o => [
      o.orderNumber, o.buyerName, o.totalAmount.toString(),
      o.status, o.paymentMethod, o.createdAt,
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `don-hang-ncc-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Đã xuất file CSV');
  };

  // Kanban grouped data (P4.21)
  const kanbanGroups = useMemo(() =>
    KANBAN_COLS.map(col => ({
      ...col,
      items: allSellerOrders.filter(o => o.status === col.status),
    })),
  [allSellerOrders]);

  return (
    <div className="space-y-4">
      <AppBreadcrumb items={[{ label: 'Kênh người bán', href: '/seller' }, { label: 'Đơn hàng' }]} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1>Quản lý đơn hàng</h1>
          <p className="text-muted-foreground">Xem và xử lý đơn hàng từ người mua</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExportCSV}>
            <Download className="mr-1 h-4 w-4" /> Xuất CSV
          </Button>
          {/* View toggle */}
          <div className="flex gap-0.5 border rounded-lg p-0.5">
            <Button variant={viewMode === 'table' ? 'secondary' : 'ghost'} size="sm" className="h-8 px-3"
              onClick={() => setViewMode('table')}>
              <List className="h-4 w-4 mr-1" /> Bảng
            </Button>
            <Button variant={viewMode === 'kanban' ? 'secondary' : 'ghost'} size="sm" className="h-8 px-3"
              onClick={() => setViewMode('kanban')}>
              <Columns className="h-4 w-4 mr-1" /> Kanban
            </Button>
          </div>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card><CardContent className="p-4"><div className="flex items-center justify-between mb-1"><span className="text-muted-foreground">Doanh thu</span><DollarSign className="h-4 w-4 text-green-500" /></div><p className="text-xl">{formatCompact(stats.revenue)} ₫</p></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex items-center justify-between mb-1"><span className="text-muted-foreground">Tổng đơn</span><ClipboardList className="h-4 w-4 text-blue-500" /></div><p className="text-xl">{stats.total}</p></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex items-center justify-between mb-1"><span className="text-muted-foreground">Chờ xác nhận</span><Clock className="h-4 w-4 text-yellow-500" /></div><p className="text-xl">{stats.pending}</p></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex items-center justify-between mb-1"><span className="text-muted-foreground">Đã giao</span><CheckCircle2 className="h-4 w-4 text-green-500" /></div><p className="text-xl">{stats.completed}</p></CardContent></Card>
      </div>

      {/* P4.23: Status Tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1">
        {STATUS_TABS.map(tab => (
          <Button
            key={tab.key}
            variant={statusTab === tab.key ? 'default' : 'ghost'}
            size="sm"
            className="shrink-0"
            onClick={() => { setStatusTab(tab.key); setPagination(p => ({ ...p, page: 1 })); }}
          >
            {tab.label}
            {tabCounts[tab.key] > 0 && (
              <Badge variant={statusTab === tab.key ? 'secondary' : 'outline'} className="ml-1.5 h-5 min-w-5 text-[10px]">
                {tabCounts[tab.key]}
              </Badge>
            )}
          </Button>
        ))}
      </div>

      <FilterBar
        filters={filterConfigs}
        activeFilters={filters}
        onFilterChange={f => { setFilters(f); setPagination(p => ({ ...p, page: 1 })); }}
        searchValue={search}
        onSearchChange={v => { setSearch(v); setPagination(p => ({ ...p, page: 1 })); }}
        searchPlaceholder="Tìm mã đơn, người mua..."
      />

      {viewMode === 'kanban' ? (
        /* P4.21–P4.22: Kanban View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 overflow-x-auto">
          {kanbanGroups.map(col => (
            <div key={col.status} className="min-w-[240px]">
              <div className={`border-t-4 ${col.borderColor} rounded-t-lg bg-muted/30 p-3 mb-2`}>
                <div className="flex items-center justify-between">
                  <span className={col.textColor}>{col.label}</span>
                  <Badge variant="secondary">{col.items.length}</Badge>
                </div>
              </div>
              <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                {col.items.slice(0, 10).map(order => (
                  <Card
                    key={order.id}
                    className={`cursor-pointer hover:shadow-md transition-shadow border-l-4 ${
                      order.status === 'Chờ xác nhận' ? 'border-l-yellow-500' :
                      order.status === 'Đã xác nhận' ? 'border-l-blue-500' :
                      order.status === 'Đang giao hàng' ? 'border-l-purple-500' :
                      order.status === 'Đã giao' ? 'border-l-green-500' :
                      order.status === 'Đã huỷ' ? 'border-l-red-500' :
                      'border-l-gray-300'
                    }`}
                    onClick={() => navigate(`/seller/orders/${order.id}`)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="h-7 w-7 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                          <User className="h-3.5 w-3.5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm truncate">{order.buyerName}</p>
                          <p className="text-xs text-muted-foreground">{order.orderNumber}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-primary text-sm">{formatPrice(order.totalAmount)}</span>
                        <span className="text-xs text-muted-foreground">{order.items.length} SP</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{timeAgo(order.createdAt)}</p>
                    </CardContent>
                  </Card>
                ))}
                {col.items.length === 0 && (
                  <p className="text-center text-muted-foreground py-4 text-sm">Không có đơn hàng</p>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <DataTable
          data={orders}
          columns={columns}
          totalItems={total}
          pagination={pagination}
          sort={sort}
          onPaginationChange={setPagination}
          onSortChange={setSort}
          onInlineEdit={handleInlineEdit}
          onRowClick={o => navigate(`/seller/orders/${o.id}`)}
          getId={o => o.id}
          loading={loading}
          renderActions={(order: Order) => (
            <div className="relative">
              <Button
                variant="ghost" size="sm" className="h-8 w-8 p-0"
                onClick={e => { e.stopPropagation(); setQuickActionId(quickActionId === order.id ? null : order.id); }}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
              {quickActionId === order.id && (
                <div className="absolute right-0 top-full z-20 mt-1 w-40 bg-popover border rounded-lg shadow-lg py-1">
                  {order.status === 'Chờ xác nhận' && (
                    <>
                      <button className="w-full text-left px-3 py-1.5 text-sm hover:bg-muted flex items-center gap-2"
                        onClick={e => { e.stopPropagation(); handleQuickAction(order.id, 'confirm'); }}>
                        <CheckCircle2 className="h-3.5 w-3.5 text-green-500" /> Xác nhận
                      </button>
                      <button className="w-full text-left px-3 py-1.5 text-sm hover:bg-muted flex items-center gap-2"
                        onClick={e => { e.stopPropagation(); handleQuickAction(order.id, 'reject'); }}>
                        <XCircle className="h-3.5 w-3.5 text-red-500" /> Từ chối
                      </button>
                    </>
                  )}
                  <button className="w-full text-left px-3 py-1.5 text-sm hover:bg-muted flex items-center gap-2"
                    onClick={e => { e.stopPropagation(); handleQuickAction(order.id, 'view'); }}>
                    <Eye className="h-3.5 w-3.5" /> Xem chi tiết
                  </button>
                  <button className="w-full text-left px-3 py-1.5 text-sm hover:bg-muted flex items-center gap-2"
                    onClick={e => { e.stopPropagation(); handleQuickAction(order.id, 'print'); }}>
                    <Printer className="h-3.5 w-3.5" /> In đơn hàng
                  </button>
                </div>
              )}
            </div>
          )}
        />
      )}
    </div>
  );
}

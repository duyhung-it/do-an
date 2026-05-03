// ============================================================
// Danh sách vận đơn — Buyer
// DataTable + pagination + sort + card view toggle + stats
// ============================================================

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router';
import {
  Truck, Package, CheckCircle2, XCircle, Clock, MapPin,
  Bell, Navigation, Eye, Download,
} from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Separator } from '../ui/separator';
import { DataTable } from '../shared/DataTable';
import { FilterBar } from '../shared/FilterBar';
import { StatusBadge } from '../shared/StatusBadge';
import { ViewToggle } from '../shared/ViewToggle';
import { AppBreadcrumb } from '../shared/AppBreadcrumb';
import { StatsCard } from '../shared/StatsCard';
import { shipmentApi } from '../../services/api';
import { exportToCSV } from '../../utils/exportUtils';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';
import type {
  Shipment, ShipmentStatus, ActiveFilter, FilterConfig,
  PaginationParams, SortParams, ColumnConfig, ViewMode,
} from '../../types';

const formatPrice = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

const statusSteps: ShipmentStatus[] = ['Chuẩn bị', 'Đã lấy hàng', 'Đang vận chuyển', 'Đang giao', 'Đã giao'];

const filterConfigs: FilterConfig[] = [
  {
    key: 'status', label: 'Trạng thái', type: 'select', options: [
      { label: 'Chuẩn bị', value: 'Chuẩn bị' },
      { label: 'Đã lấy hàng', value: 'Đã lấy hàng' },
      { label: 'Đang vận chuyển', value: 'Đang vận chuyển' },
      { label: 'Đang giao', value: 'Đang giao' },
      { label: 'Đã giao', value: 'Đã giao' },
      { label: 'Thất bại', value: 'Thất bại' },
    ],
  },
  {
    key: 'carrierName', label: 'Hãng VC', type: 'select', options: [
      { label: 'Giao Hàng Tiết Kiệm', value: 'Giao Hàng Tiết Kiệm' },
      { label: 'Giao Hàng Nhanh', value: 'Giao Hàng Nhanh' },
      { label: 'VNPost', value: 'VNPost' },
      { label: 'J&T Express', value: 'J&T Express' },
      { label: 'BEST Express', value: 'BEST Express' },
    ],
  },
];

const columns: ColumnConfig[] = [
  { key: 'trackingNumber', label: 'Mã vận đơn', sortable: true },
  { key: 'orderNumber', label: 'Đơn hàng', sortable: true },
  { key: 'carrierName', label: 'Hãng vận chuyển', sortable: true },
  {
    key: 'status', label: 'Trạng thái', sortable: true,
    render: (_, row) => <StatusBadge status={(row as Shipment).status} />,
  },
  {
    key: 'progress', label: 'Tiến trình',
    render: (_, row) => {
      const sh = row as Shipment;
      if (sh.status === 'Thất bại') return <Badge variant="destructive">Thất bại</Badge>;
      const pct = Math.round(((statusSteps.indexOf(sh.status) + 1) / statusSteps.length) * 100);
      return <Progress value={pct} className="h-2 w-20" />;
    },
  },
  {
    key: 'shippingFee', label: 'Phí VC', sortable: true,
    render: (v) => formatPrice(v as number),
  },
  { key: 'estimatedDelivery', label: 'Dự kiến giao', sortable: true },
  {
    key: 'actualDelivery', label: 'Ngày giao thực tế', sortable: true,
    render: (v) => (v as string) || '—',
  },
  { key: 'weight', label: 'Cân nặng (kg)', sortable: true },
];

// ── Shipment Card (for card/list view) ──
function ShipmentCard({ sh, onClick }: { sh: Shipment; onClick: () => void }) {
  const progressPct = sh.status === 'Thất bại'
    ? 0
    : Math.round(((statusSteps.indexOf(sh.status) + 1) / statusSteps.length) * 100);

  return (
    <Card className="hover:shadow-md transition-all cursor-pointer" onClick={onClick}>
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${
            sh.status === 'Đã giao' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400'
            : sh.status === 'Thất bại' ? 'bg-red-100 text-red-600 dark:bg-red-950/20 dark:text-red-400'
            : 'bg-blue-100 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400'
          }`}>
            <Truck className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium">{sh.trackingNumber}</span>
              <StatusBadge status={sh.status} size="sm" />
            </div>
            <p className="text-muted-foreground text-sm truncate mt-0.5">
              {sh.orderNumber} · {sh.carrierName} · {formatPrice(sh.shippingFee)}
            </p>
            {sh.status !== 'Thất bại' && (
              <div className="mt-2">
                <Progress value={progressPct} className="h-1.5" />
              </div>
            )}
          </div>
          <div className="text-right hidden sm:block shrink-0">
            <p className="text-muted-foreground text-sm">Dự kiến: {sh.estimatedDelivery}</p>
            {sh.actualDelivery && (
              <p className="text-emerald-600 text-sm">Giao: {sh.actualDelivery}</p>
            )}
          </div>
        </div>

        {/* Route mock mini */}
        <div className="mt-3 flex items-center text-xs text-muted-foreground gap-2">
          <MapPin className="h-3 w-3 text-blue-500 shrink-0" />
          <span className="truncate">{sh.fromAddress?.split(',').slice(-1)[0]?.trim() || 'Kho hàng'}</span>
          <div className="flex-1 border-t border-dashed border-muted-foreground/30 mx-1 relative min-w-[40px]">
            <Truck className={`h-3 w-3 absolute -top-1.5 text-primary ${
              sh.status === 'Đã giao' ? 'right-0'
              : sh.status === 'Chuẩn bị' ? 'left-0'
              : 'left-1/2 -translate-x-1/2'
            }`} />
          </div>
          <span className="truncate">{sh.toAddress?.split(',').slice(-1)[0]?.trim() || 'Điểm nhận'}</span>
          <MapPin className="h-3 w-3 text-emerald-500 shrink-0" />
        </div>
      </CardContent>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════
// Main
// ═══════════════════════════════════════════════════════════════
export function BuyerShipmentList() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<Shipment[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<ActiveFilter[]>([]);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState<PaginationParams>({ page: 1, pageSize: 10 });
  const [sort, setSort] = useState<SortParams>({});
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [allShipments, setAllShipments] = useState<Shipment[]>([]);

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Sử dụng getPaginated với filter buyerId
      const buyerFilter: ActiveFilter = { key: 'buyerId', value: user.id };
      const allFilters = [buyerFilter, ...filters];
      const res = await shipmentApi.getPaginated(pagination, sort, allFilters, search);
      setData(res.data);
      setTotalItems(res.total);

      // Lấy tất cả cho stats (không phân trang)
      const all = await shipmentApi.getByBuyer(user.id);
      setAllShipments(all);

      // Notification cho đang giao
      const delivering = all.filter(s => s.status === 'Đang giao');
      if (delivering.length > 0) {
        delivering.forEach(s =>
          toast.info(`🚚 Vận đơn ${s.trackingNumber} đang được giao đến bạn!`, { duration: 5000 }),
        );
      }
    } finally {
      setLoading(false);
    }
  }, [user, pagination, sort, filters, search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Stats tính từ allShipments
  const stats = useMemo(() => {
    const t = allShipments.length;
    const preparing = allShipments.filter(s => s.status === 'Chuẩn bị' || s.status === 'Đã lấy hàng').length;
    const inTransit = allShipments.filter(s => ['Đang vận chuyển', 'Đang giao'].includes(s.status)).length;
    const delivered = allShipments.filter(s => s.status === 'Đã giao').length;
    const failed = allShipments.filter(s => s.status === 'Thất bại').length;
    return [
      { title: 'Tổng vận đơn', value: t, icon: Truck, variant: 'primary' as const },
      { title: 'Chờ lấy hàng', value: preparing, icon: Package, variant: 'warning' as const },
      { title: 'Đang vận chuyển', value: inTransit, icon: Navigation, variant: 'info' as const },
      { title: 'Đã giao', value: delivered, icon: CheckCircle2, variant: 'success' as const },
      { title: 'Thất bại', value: failed, icon: XCircle, variant: 'danger' as const },
    ];
  }, [allShipments]);

  const goToDetail = (sh: Shipment) => navigate(`/shipments/${sh.id}`);

  const handleExportCSV = () => {
    exportToCSV(data as unknown as Record<string, unknown>[], [
      { key: 'trackingNumber', label: 'Mã vận đơn' },
      { key: 'orderNumber', label: 'Đơn hàng' },
      { key: 'carrierName', label: 'Hãng VC' },
      { key: 'status', label: 'Trạng thái' },
      { key: 'shippingFee', label: 'Phí VC' },
      { key: 'estimatedDelivery', label: 'Dự kiến giao' },
      { key: 'actualDelivery', label: 'Ngày giao thực tế' },
      { key: 'weight', label: 'Cân nặng' },
    ], 'van-don-buyer');
    toast.success('Đã xuất CSV');
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <AppBreadcrumb items={[{ label: 'Trang chủ', href: '/' }, { label: 'Vận chuyển' }]} />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2">
            <Truck className="h-6 w-6 text-primary" />
            Theo dõi vận chuyển
          </h1>
          <p className="text-muted-foreground mt-1">Xem trạng thái vận chuyển tất cả đơn hàng</p>
        </div>
        <div className="flex items-center gap-2">
          <ViewToggle viewMode={viewMode} onChange={setViewMode} modes={['table', 'list']} />
          <Button variant="outline" size="sm" onClick={handleExportCSV}>
            <Download className="h-4 w-4 mr-1" /> CSV
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {stats.map(s => (
          <StatsCard key={s.title} title={s.title} value={s.value} icon={s.icon} variant={s.variant} />
        ))}
      </div>

      {/* Notification banner */}
      {allShipments.filter(s => s.status === 'Đang giao').length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 rounded-lg p-3 flex items-start gap-3">
          <Bell className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            {allShipments.filter(s => s.status === 'Đang giao').map(s => (
              <p key={s.id} className="text-sm text-blue-700 dark:text-blue-400">
                🚚 Vận đơn {s.trackingNumber} đang được giao đến bạn!
              </p>
            ))}
          </div>
        </div>
      )}

      <FilterBar
        filters={filterConfigs}
        activeFilters={filters}
        onFilterChange={setFilters}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Tìm mã vận đơn, đơn hàng, hãng vận chuyển..."
      />

      {viewMode === 'table' ? (
        <DataTable<Shipment>
          data={data}
          columns={columns}
          totalItems={totalItems}
          pagination={pagination}
          sort={sort}
          onPaginationChange={setPagination}
          onSortChange={setSort}
          getId={sh => sh.id}
          loading={loading}
          onRowClick={goToDetail}
          renderActions={sh => (
            <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); goToDetail(sh); }}>
              <Eye className="h-4 w-4" />
            </Button>
          )}
        />
      ) : loading ? (
        <div className="text-center py-12 text-muted-foreground">Đang tải...</div>
      ) : data.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Truck className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>Không có vận đơn nào</p>
        </div>
      ) : (
        <div className="space-y-3">
          {data.map(sh => (
            <ShipmentCard key={sh.id} sh={sh} onClick={() => goToDetail(sh)} />
          ))}
          {/* Simple pagination for card view */}
          <div className="flex items-center justify-between pt-4">
            <p className="text-sm text-muted-foreground">
              Hiển thị {data.length} / {totalItems} vận đơn
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline" size="sm"
                disabled={pagination.page <= 1}
                onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
              >
                Trước
              </Button>
              <span className="text-sm text-muted-foreground">
                Trang {pagination.page} / {Math.ceil(totalItems / pagination.pageSize) || 1}
              </span>
              <Button
                variant="outline" size="sm"
                disabled={pagination.page >= Math.ceil(totalItems / pagination.pageSize)}
                onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
              >
                Sau
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

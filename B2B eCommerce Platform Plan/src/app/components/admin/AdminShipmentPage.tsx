// ============================================================
// Quản lý vận chuyển Admin — Giám sát toàn bộ vận đơn hệ thống
// Stats, Filter, DataTable, Chi tiết, Cập nhật trạng thái
// ============================================================

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Truck, Package, CheckCircle2, AlertTriangle, Download, MapPin, Clock, XCircle,
} from 'lucide-react';
import { DataTable } from '../shared/DataTable';
import { FilterBar } from '../shared/FilterBar';
import { StatusBadge } from '../shared/StatusBadge';
import { AppBreadcrumb } from '../shared/AppBreadcrumb';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Separator } from '../ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { shipmentApi } from '../../services/api';
import { toast } from 'sonner';
import type {
  Shipment, ShipmentStatus, PaginationParams, SortParams,
  ActiveFilter, FilterConfig, ColumnConfig,
} from '../../types';

const formatPrice = (price: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

// --- Cấu hình cột ---
const columns: ColumnConfig[] = [
  { key: 'trackingNumber', label: 'Mã vận đơn', visible: true, sortable: true },
  { key: 'orderNumber', label: 'Đơn hàng', visible: true, sortable: true },
  { key: 'carrierName', label: 'Đơn vị VC', visible: true, sortable: true },
  { key: 'buyerName', label: 'Người mua', visible: true, sortable: true },
  { key: 'supplierName', label: 'NCC', visible: true, sortable: true },
  { key: 'status', label: 'Trạng thái', visible: true, sortable: true, editable: true, type: 'select',
    options: ['Chuẩn bị', 'Đã lấy hàng', 'Đang vận chuyển', 'Đang giao', 'Đã giao', 'Thất bại'] },
  { key: 'shippingFee', label: 'Phí VC', visible: true, sortable: true },
  { key: 'estimatedDelivery', label: 'Dự kiến giao', visible: true, sortable: true },
  { key: 'createdAt', label: 'Ngày tạo', visible: true, sortable: true },
];

// --- Cấu hình bộ lọc ---
const filterConfigs: FilterConfig[] = [
  { key: 'status', label: 'Trạng thái', type: 'select', options: [
    { label: 'Chuẩn bị', value: 'Chuẩn bị' },
    { label: 'Đã lấy hàng', value: 'Đã lấy hàng' },
    { label: 'Đang vận chuyển', value: 'Đang vận chuyển' },
    { label: 'Đang giao', value: 'Đang giao' },
    { label: 'Đã giao', value: 'Đã giao' },
    { label: 'Thất bại', value: 'Thất bại' },
  ]},
  { key: 'carrierName', label: 'Đơn vị VC', type: 'select', options: [
    { label: 'Giao Hàng Tiết Kiệm', value: 'Giao Hàng Tiết Kiệm' },
    { label: 'Giao Hàng Nhanh', value: 'Giao Hàng Nhanh' },
    { label: 'VNPost', value: 'VNPost' },
    { label: 'J&T Express', value: 'J&T Express' },
    { label: 'BEST Express', value: 'BEST Express' },
  ]},
];

const statusIcons: Record<string, React.ReactNode> = {
  'Chuẩn bị': <Package className="h-3.5 w-3.5" />,
  'Đã lấy hàng': <Truck className="h-3.5 w-3.5" />,
  'Đang vận chuyển': <Truck className="h-3.5 w-3.5" />,
  'Đang giao': <MapPin className="h-3.5 w-3.5" />,
  'Đã giao': <CheckCircle2 className="h-3.5 w-3.5" />,
  'Thất bại': <XCircle className="h-3.5 w-3.5" />,
};

export function AdminShipmentPage() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [allShipments, setAllShipments] = useState<Shipment[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationParams>({ page: 1, pageSize: 10 });
  const [sort, setSort] = useState<SortParams>({ field: 'createdAt', direction: 'desc' });
  const [filters, setFilters] = useState<ActiveFilter[]>([]);
  const [search, setSearch] = useState('');
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [statusToUpdate, setStatusToUpdate] = useState<ShipmentStatus | ''>('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [allRes, pageRes] = await Promise.all([
        shipmentApi.getPaginated({ page: 1, pageSize: 1000 }),
        shipmentApi.getPaginated(pagination, sort.field ? sort : undefined, filters),
      ]);
      setAllShipments(allRes.data);

      let data = pageRes.data;
      let t = pageRes.total;
      if (search) {
        const s = search.toLowerCase();
        const filtered = allRes.data.filter(sh =>
          sh.trackingNumber.toLowerCase().includes(s) ||
          sh.orderNumber.toLowerCase().includes(s) ||
          sh.carrierName.toLowerCase().includes(s) ||
          sh.buyerName.toLowerCase().includes(s) ||
          sh.supplierName.toLowerCase().includes(s),
        );
        const activeFilterData = filters.length > 0
          ? filtered.filter(sh => filters.every(f => {
              const val = (sh as unknown as Record<string, unknown>)[f.key];
              return String(val) === String(f.value);
            }))
          : filtered;
        t = activeFilterData.length;
        const start = (pagination.page - 1) * pagination.pageSize;
        data = activeFilterData.slice(start, start + pagination.pageSize);
      }
      setShipments(data);
      setTotal(t);
    } finally {
      setLoading(false);
    }
  }, [pagination, sort, filters, search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // --- Stats ---
  const stats = useMemo(() => {
    const inTransit = allShipments.filter(s => ['Đang vận chuyển', 'Đang giao'].includes(s.status)).length;
    const delivered = allShipments.filter(s => s.status === 'Đã giao').length;
    const failed = allShipments.filter(s => s.status === 'Thất bại').length;
    const totalFee = allShipments.reduce((sum, s) => sum + s.shippingFee, 0);
    return { total: allShipments.length, inTransit, delivered, failed, totalFee };
  }, [allShipments]);

  // --- Inline edit trạng thái ---
  const handleInlineEdit = async (id: string, field: string, value: unknown) => {
    if (field === 'status') {
      const newStatus = value as ShipmentStatus;
      await shipmentApi.updateStatus(id, newStatus, {
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
        location: 'Hệ thống Admin',
        status: newStatus,
        description: `Admin cập nhật trạng thái → ${newStatus}`,
      });
      setShipments(prev => prev.map(s => s.id === id ? { ...s, status: newStatus } : s));
      toast.success('Đã cập nhật trạng thái vận đơn');
    }
  };

  // --- Cập nhật trạng thái từ chi tiết ---
  const handleStatusUpdate = async () => {
    if (!selectedShipment || !statusToUpdate) return;
    try {
      const updated = await shipmentApi.updateStatus(selectedShipment.id, statusToUpdate as ShipmentStatus, {
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
        location: 'Hệ thống Admin',
        status: statusToUpdate as ShipmentStatus,
        description: `Admin cập nhật trạng thái → ${statusToUpdate}`,
      });
      setSelectedShipment(updated);
      setShipments(prev => prev.map(s => s.id === updated.id ? updated : s));
      setAllShipments(prev => prev.map(s => s.id === updated.id ? updated : s));
      setStatusToUpdate('');
      toast.success('Đã cập nhật trạng thái vận đơn');
    } catch {
      toast.error('Cập nhật thất bại');
    }
  };

  // --- Export CSV ---
  const handleExportCSV = () => {
    const headers = ['Mã vận đơn', 'Đơn hàng', 'Đơn vị VC', 'Người mua', 'NCC', 'Trạng thái', 'Phí VC', 'Dự kiến giao', 'Ngày tạo'];
    const rows = allShipments.map(s => [
      s.trackingNumber, s.orderNumber, s.carrierName, s.buyerName,
      s.supplierName, s.status, s.shippingFee.toString(), s.estimatedDelivery, s.createdAt,
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `van-chuyen-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Đã xuất file CSV');
  };

  // --- List view ---
  const renderListItem = (shipment: Shipment) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {statusIcons[shipment.status]}
            <span className="font-medium">{shipment.trackingNumber}</span>
          </div>
          <StatusBadge status={shipment.status} />
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-muted-foreground">
          <span>Đơn: {shipment.orderNumber}</span>
          <span>{shipment.carrierName}</span>
          <span>{shipment.buyerName}</span>
          <span className="text-primary">{formatPrice(shipment.shippingFee)}</span>
          <span>Giao: {shipment.estimatedDelivery}</span>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-4">
      <AppBreadcrumb items={[{ label: 'Quản trị', href: '/admin' }, { label: 'Vận chuyển' }]} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1>Quản lý vận chuyển</h1>
          <p className="text-muted-foreground">Giám sát toàn bộ vận đơn trên hệ thống</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleExportCSV}>
          <Download className="mr-1 h-4 w-4" /> Xuất CSV
        </Button>
      </div>

      {/* --- Stats --- */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-muted-foreground">Tổng vận đơn</span>
              <Truck className="h-4 w-4 text-blue-500" />
            </div>
            <p className="text-xl">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-muted-foreground">Đang vận chuyển</span>
              <Package className="h-4 w-4 text-indigo-500" />
            </div>
            <p className="text-xl">{stats.inTransit}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-muted-foreground">Đã giao</span>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </div>
            <p className="text-xl">{stats.delivered}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-muted-foreground">Thất bại</span>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </div>
            <p className="text-xl">{stats.failed}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-muted-foreground">Tổng phí VC</span>
              <Clock className="h-4 w-4 text-orange-500" />
            </div>
            <p className="text-xl">{formatPrice(stats.totalFee)}</p>
          </CardContent>
        </Card>
      </div>

      {/* --- Filter + Table --- */}
      <FilterBar
        filters={filterConfigs}
        activeFilters={filters}
        onFilterChange={f => { setFilters(f); setPagination(p => ({ ...p, page: 1 })); }}
        searchValue={search}
        onSearchChange={v => { setSearch(v); setPagination(p => ({ ...p, page: 1 })); }}
        searchPlaceholder="Tìm mã vận đơn, đơn hàng, đơn vị VC..."
      />

      <DataTable
        data={shipments}
        columns={columns}
        totalItems={total}
        pagination={pagination}
        sort={sort}
        onPaginationChange={setPagination}
        onSortChange={setSort}
        onInlineEdit={handleInlineEdit}
        onRowClick={sh => { setSelectedShipment(sh); setStatusToUpdate(''); }}
        getId={sh => sh.id}
        renderListItem={renderListItem}
        loading={loading}
        viewModes={['table', 'list']}
      />

      {/* --- Chi tiết vận đơn --- */}
      <Dialog open={!!selectedShipment} onOpenChange={() => setSelectedShipment(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Vận đơn {selectedShipment?.trackingNumber}
            </DialogTitle>
          </DialogHeader>
          {selectedShipment && (
            <div className="space-y-4">
              {/* Trạng thái + cập nhật */}
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Trạng thái</span>
                <StatusBadge status={selectedShipment.status} />
              </div>

              {selectedShipment.status !== 'Đã giao' && selectedShipment.status !== 'Thất bại' && (
                <div className="flex items-center gap-2">
                  <Select value={statusToUpdate} onValueChange={v => setStatusToUpdate(v as ShipmentStatus)}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Chuyển trạng thái..." />
                    </SelectTrigger>
                    <SelectContent>
                      {['Chuẩn bị', 'Đã lấy hàng', 'Đang vận chuyển', 'Đang giao', 'Đã giao', 'Thất bại']
                        .filter(s => s !== selectedShipment.status)
                        .map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Button size="sm" onClick={handleStatusUpdate} disabled={!statusToUpdate}>
                    Cập nhật
                  </Button>
                </div>
              )}

              <Separator />

              {/* Thông tin chung */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-muted-foreground">Đơn hàng</p>
                  <p className="font-medium">{selectedShipment.orderNumber}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Đơn vị VC</p>
                  <p>{selectedShipment.carrierName}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Người mua</p>
                  <p>{selectedShipment.buyerName}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Nhà cung cấp</p>
                  <p>{selectedShipment.supplierName}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Trọng lượng</p>
                  <p>{selectedShipment.weight} kg</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Kích thước</p>
                  <p>{selectedShipment.dimensions}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Phí vận chuyển</p>
                  <p className="text-primary">{formatPrice(selectedShipment.shippingFee)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Dự kiến giao</p>
                  <p>{selectedShipment.estimatedDelivery}</p>
                </div>
                {selectedShipment.actualDelivery && (
                  <div>
                    <p className="text-muted-foreground">Ngày giao thực tế</p>
                    <p className="text-green-600">{selectedShipment.actualDelivery}</p>
                  </div>
                )}
              </div>

              <Separator />

              {/* Địa chỉ */}
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 mt-0.5 text-blue-500 shrink-0" />
                  <div>
                    <p className="text-muted-foreground">Gửi từ</p>
                    <p>{selectedShipment.fromAddress}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 mt-0.5 text-green-500 shrink-0" />
                  <div>
                    <p className="text-muted-foreground">Giao đến</p>
                    <p>{selectedShipment.toAddress}</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Lịch sử vận chuyển */}
              <div>
                <p className="font-medium mb-3">Lịch sử vận chuyển</p>
                <div className="space-y-3">
                  {selectedShipment.events.map((event, idx) => (
                    <div key={idx} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className={`w-2.5 h-2.5 rounded-full shrink-0 mt-1.5 ${
                          idx === selectedShipment.events.length - 1 ? 'bg-primary' : 'bg-muted-foreground/30'
                        }`} />
                        {idx < selectedShipment.events.length - 1 && (
                          <div className="w-0.5 h-full bg-muted-foreground/20 my-0.5" />
                        )}
                      </div>
                      <div className="pb-2 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <StatusBadge status={event.status} />
                          <span className="text-muted-foreground">{event.timestamp}</span>
                        </div>
                        <p className="mt-0.5">{event.description}</p>
                        <p className="text-muted-foreground">{event.location}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

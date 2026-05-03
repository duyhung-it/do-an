// ============================================================
// Quản lý vận chuyển — Seller (Nhóm 18A: Nâng cao)
// 18A.01-08: Stats, biểu đồ, tạo vận đơn, in phiếu, export, card view
// ============================================================

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Truck, Package, CheckCircle2, XCircle, Plus, MapPin,
  Download, Printer, BarChart3, Calendar,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { DataTable } from '../shared/DataTable';
import { FilterBar } from '../shared/FilterBar';
import { StatusBadge } from '../shared/StatusBadge';
import { AppBreadcrumb } from '../shared/AppBreadcrumb';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Separator } from '../ui/separator';
import { Progress } from '../ui/progress';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip,
  ResponsiveContainer, Legend,
} from 'recharts';
import { shipmentApi } from '../../services/api';
import { exportToCSV } from '../../utils/exportUtils';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';
import type {
  Shipment, ShipmentStatus, PaginationParams, SortParams, ActiveFilter, FilterConfig, ColumnConfig,
} from '../../types';

const formatPrice = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

// 18A.06 thêm cột visible mặc định
const columns: ColumnConfig[] = [
  { key: 'trackingNumber', label: 'Mã vận đơn', visible: true, sortable: true },
  { key: 'orderNumber', label: 'Đơn hàng', visible: true, sortable: true },
  { key: 'carrierName', label: 'Hãng VC', visible: true, sortable: true },
  { key: 'buyerName', label: 'Người nhận', visible: true, sortable: true },
  { key: 'status', label: 'Trạng thái', visible: true, sortable: true },
  { key: 'estimatedDelivery', label: 'Dự kiến giao', visible: true, sortable: true },
  { key: 'actualDelivery', label: 'Giao thực tế', visible: false, sortable: true },
  { key: 'weight', label: 'Cân nặng', visible: false, sortable: true },
  { key: 'shippingFeeFormatted', label: 'Phí VC', visible: true, sortable: false },
  { key: 'createdAt', label: 'Ngày tạo', visible: false, sortable: true },
];

// 18A.03: Thêm filter hãng VC, khoảng ngày
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

const statusSteps: ShipmentStatus[] = ['Chuẩn bị', 'Đã lấy hàng', 'Đang vận chuyển', 'Đang giao', 'Đã giao'];

// P5.14: Inline 5-step progress bar component
function ShipmentSteps({ status }: { status: ShipmentStatus }) {
  const currentIdx = statusSteps.indexOf(status);
  const isFailed = status === 'Thất bại';
  if (isFailed) {
    return <Badge variant="destructive" className="text-xs">Thất bại</Badge>;
  }
  return (
    <div className="flex items-center gap-0.5 min-w-[140px]">
      {statusSteps.map((step, idx) => {
        const isPast = idx <= currentIdx;
        return (
          <div key={step} className="flex items-center flex-1">
            <div
              className={`h-2 w-2 rounded-full shrink-0 ${isPast ? 'bg-primary' : 'bg-muted'}`}
              title={step}
            />
            {idx < statusSteps.length - 1 && (
              <div className={`h-0.5 flex-1 ${idx < currentIdx ? 'bg-primary' : 'bg-muted'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

interface ShipRow extends Shipment {
  shippingFeeFormatted: string;
}

export function SellerShipmentList() {
  const { user } = useAuth();
  const [data, setData] = useState<ShipRow[]>([]);
  const [allShipments, setAllShipments] = useState<Shipment[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationParams>({ page: 1, pageSize: 10 });
  const [sort, setSort] = useState<SortParams>({ field: 'createdAt', direction: 'desc' });
  const [filters, setFilters] = useState<ActiveFilter[]>([]);
  const [search, setSearch] = useState('');

  // Detail / update status
  const [selected, setSelected] = useState<Shipment | null>(null);
  const [newStatus, setNewStatus] = useState<ShipmentStatus>('Chuẩn bị');
  const [eventDesc, setEventDesc] = useState('');
  const [eventLocation, setEventLocation] = useState('');

  // 18A.04: Create shipment
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({
    orderNumber: '', trackingNumber: '', carrier: 'ghtk', carrierName: 'Giao Hàng Tiết Kiệm',
    buyerName: '', weight: '', fromAddress: '', toAddress: '', shippingFee: '',
  });

  // 18A.02: Chart
  const [showChart, setShowChart] = useState(false);

  // 18A.06: Print
  const [showPrint, setShowPrint] = useState<Shipment | null>(null);

  const fetchData = useCallback(async () => {
    if (!user?.supplierId) return;
    setLoading(true);
    try {
      const all = await shipmentApi.getBySeller(user.supplierId);
      setAllShipments(all);

      let filtered = [...all];
      if (search) {
        const s = search.toLowerCase();
        filtered = filtered.filter(sh =>
          sh.trackingNumber.toLowerCase().includes(s) ||
          sh.orderNumber.toLowerCase().includes(s) ||
          sh.buyerName.toLowerCase().includes(s),
        );
      }
      if (filters.length > 0) {
        filtered = filtered.filter(sh =>
          filters.every(f => String((sh as unknown as Record<string, unknown>)[f.key]) === String(f.value)),
        );
      }
      if (sort.field) {
        filtered.sort((a, b) => {
          const aV = String((a as unknown as Record<string, unknown>)[sort.field] ?? '');
          const bV = String((b as unknown as Record<string, unknown>)[sort.field] ?? '');
          return sort.direction === 'asc' ? aV.localeCompare(bV) : bV.localeCompare(aV);
        });
      }
      setTotal(filtered.length);
      const start = (pagination.page - 1) * pagination.pageSize;
      setData(filtered.slice(start, start + pagination.pageSize).map(sh => ({
        ...sh,
        shippingFeeFormatted: formatPrice(sh.shippingFee),
      })));
    } finally {
      setLoading(false);
    }
  }, [user, pagination, sort, filters, search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // 18A.01: Stats nâng cao (thêm thất bại + TB ngày giao)
  const stats = useMemo(() => {
    const t = allShipments.length;
    const preparing = allShipments.filter(s => s.status === 'Chuẩn bị' || s.status === 'Đã lấy hàng').length;
    const inTransit = allShipments.filter(s => s.status === 'Đang vận chuyển' || s.status === 'Đang giao').length;
    const delivered = allShipments.filter(s => s.status === 'Đã giao').length;
    const failed = allShipments.filter(s => s.status === 'Thất bại').length;

    // TB ngày giao (từ createdAt đến actualDelivery)
    const deliveredShipments = allShipments.filter(s => s.status === 'Đã giao' && s.actualDelivery);
    let avgDays = 0;
    if (deliveredShipments.length > 0) {
      const totalDays = deliveredShipments.reduce((sum, s) => {
        const created = new Date(s.createdAt).getTime();
        const actual = new Date(s.actualDelivery!).getTime();
        return sum + Math.round((actual - created) / (1000 * 60 * 60 * 24));
      }, 0);
      avgDays = Math.round(totalDays / deliveredShipments.length);
    }

    return { t, preparing, inTransit, delivered, failed, avgDays };
  }, [allShipments]);

  // 18A.02: Biểu đồ tỷ lệ giao hàng theo tháng
  const chartData = useMemo(() => {
    const map = new Map<string, { total: number; delivered: number; failed: number }>();
    for (const sh of allShipments) {
      const month = sh.createdAt.slice(0, 7);
      const cur = map.get(month) ?? { total: 0, delivered: 0, failed: 0 };
      cur.total++;
      if (sh.status === 'Đã giao') cur.delivered++;
      if (sh.status === 'Thất bại') cur.failed++;
      map.set(month, cur);
    }
    return Array.from(map.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([month, v]) => ({
        month,
        tyLeThanhCong: v.total > 0 ? Math.round((v.delivered / v.total) * 100) : 0,
        tyLeThatBai: v.total > 0 ? Math.round((v.failed / v.total) * 100) : 0,
      }));
  }, [allShipments]);

  const openDetail = (sh: Shipment) => {
    setSelected(sh);
    const currentIdx = statusSteps.indexOf(sh.status);
    const next = currentIdx < statusSteps.length - 1 ? statusSteps[currentIdx + 1] : sh.status;
    setNewStatus(next);
    setEventDesc('');
    setEventLocation('');
  };

  // 18A.05: Cập nhật tracking
  const handleUpdateStatus = async () => {
    if (!selected || !eventDesc.trim()) {
      toast.error('Vui lòng nhập mô tả');
      return;
    }
    try {
      await shipmentApi.updateStatus(selected.id, newStatus, {
        timestamp: new Date().toLocaleString('vi-VN'),
        location: eventLocation || 'N/A',
        status: newStatus,
        description: eventDesc,
      });
      toast.success(`Cập nhật trạng thái: ${newStatus}`);
      setSelected(null);
      fetchData();
    } catch {
      toast.error('Có lỗi xảy ra');
    }
  };

  // 18A.04: Tạo vận đơn
  const handleCreateShipment = async () => {
    if (!createForm.orderNumber || !createForm.trackingNumber || !createForm.buyerName) {
      toast.error('Vui lòng nhập đầy đủ thông tin');
      return;
    }
    try {
      await shipmentApi.create({
        orderId: '',
        orderNumber: createForm.orderNumber,
        trackingNumber: createForm.trackingNumber,
        carrier: createForm.carrier,
        carrierName: createForm.carrierName,
        status: 'Chuẩn bị',
        estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
        weight: Number(createForm.weight) || 1,
        dimensions: '',
        shippingFee: Number(createForm.shippingFee) || 0,
        fromAddress: createForm.fromAddress,
        toAddress: createForm.toAddress,
        buyerId: '',
        buyerName: createForm.buyerName,
        supplierId: user?.supplierId ?? '',
        supplierName: '',
        events: [{
          timestamp: new Date().toLocaleString('vi-VN'),
          location: createForm.fromAddress || 'Kho hàng',
          status: 'Chuẩn bị',
          description: 'Đơn hàng đang được chuẩn bị',
        }],
      });
      toast.success('Đã tạo vận đơn mới');
      setShowCreate(false);
      fetchData();
    } catch {
      toast.error('Có lỗi xảy ra');
    }
  };

  // 18A.07: Export CSV
  const handleExport = () => {
    exportToCSV(allShipments as unknown as Record<string, unknown>[], [
      { key: 'trackingNumber', label: 'Mã vận đơn' },
      { key: 'orderNumber', label: 'Đơn hàng' },
      { key: 'carrierName', label: 'Hãng VC' },
      { key: 'buyerName', label: 'Người nhận' },
      { key: 'status', label: 'Trạng thái' },
      { key: 'fromAddress', label: 'Từ' },
      { key: 'toAddress', label: 'Đến' },
      { key: 'weight', label: 'Cân nặng (kg)' },
      { key: 'shippingFee', label: 'Phí VC' },
      { key: 'estimatedDelivery', label: 'Dự kiến giao' },
      { key: 'actualDelivery', label: 'Giao thực tế' },
      { key: 'createdAt', label: 'Ngày tạo' },
    ], 'danh-sach-van-don');
    toast.success('Đã xuất CSV danh sách vận đơn');
  };

  const carrierOptions = [
    { id: 'ghtk', name: 'Giao Hàng Tiết Kiệm' },
    { id: 'ghn', name: 'Giao Hàng Nhanh' },
    { id: 'vnpost', name: 'VNPost' },
    { id: 'jtexpress', name: 'J&T Express' },
    { id: 'best', name: 'BEST Express' },
  ];

  // 18A.08: Card view trên mobile
  const renderGridCard = (sh: ShipRow) => (
    <Card key={sh.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => openDetail(sh)}>
      <CardContent className="p-4 space-y-2">
        <div className="flex items-center justify-between">
          <p className="font-medium">{sh.trackingNumber}</p>
          <StatusBadge status={sh.status} />
        </div>
        <p className="text-muted-foreground">{sh.orderNumber} · {sh.carrierName}</p>
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>{sh.buyerName}</span>
          <span>{sh.shippingFeeFormatted}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Dự kiến: {sh.estimatedDelivery}</span>
          <span>{sh.weight} kg</span>
        </div>
        {/* P5.14: 5-step progress */}
        <ShipmentSteps status={sh.status} />
        <div className="flex justify-between text-xs text-muted-foreground pt-1">
          {statusSteps.map((step, i) => (
            <span key={step} className={i <= statusSteps.indexOf(sh.status) ? 'text-primary' : ''}>{step.split(' ').slice(-1)}</span>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <AppBreadcrumb items={[{ label: 'Kênh người bán', href: '/seller' }, { label: 'Vận chuyển' }]} />

      <div>
        <h1>Quản lý vận chuyển</h1>
        <p className="text-muted-foreground">Theo dõi và cập nhật trạng thái vận đơn</p>
      </div>

      {/* 18A.01: Stats card nâng cao */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: 'Tổng vận đơn', value: stats.t, icon: Truck, color: 'text-blue-500' },
          { label: 'Chờ gửi', value: stats.preparing, icon: Package, color: 'text-yellow-500' },
          { label: 'Đang VC', value: stats.inTransit, icon: MapPin, color: 'text-indigo-500' },
          { label: 'Đã giao', value: stats.delivered, icon: CheckCircle2, color: 'text-green-500' },
          { label: 'Thất bại', value: stats.failed, icon: XCircle, color: 'text-red-500' },
          { label: 'TB ngày giao', value: `${stats.avgDays}d`, icon: Calendar, color: 'text-purple-500' },
        ].map(s => (
          <Card key={s.label}>
            <CardContent className="p-3 flex items-center gap-2">
              <s.icon className={`h-6 w-6 ${s.color} shrink-0`} />
              <div className="min-w-0">
                <p className="text-lg">{s.value}</p>
                <p className="text-muted-foreground text-xs">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-2">
        <Button size="sm" onClick={() => {
          setCreateForm({ orderNumber: '', trackingNumber: '', carrier: 'ghtk', carrierName: 'Giao Hàng Tiết Kiệm', buyerName: '', weight: '', fromAddress: '', toAddress: '', shippingFee: '' });
          setShowCreate(true);
        }}>
          <Plus className="h-4 w-4 mr-1" /> Tạo vận đơn
        </Button>
        <Button variant="outline" size="sm" onClick={() => setShowChart(true)}>
          <BarChart3 className="h-4 w-4 mr-1" /> Biểu đồ
        </Button>
        <Button variant="outline" size="sm" onClick={handleExport}>
          <Download className="h-4 w-4 mr-1" /> Xuất CSV
        </Button>
      </div>

      <FilterBar
        filters={filterConfigs}
        activeFilters={filters}
        onFilterChange={f => { setFilters(f); setPagination(p => ({ ...p, page: 1 })); }}
        searchValue={search}
        onSearchChange={v => { setSearch(v); setPagination(p => ({ ...p, page: 1 })); }}
        searchPlaceholder="Tìm mã vận đơn, đơn hàng, người nhận..."
      />

      {/* 18A.08: Card view */}
      <DataTable<ShipRow>
        data={data}
        columns={columns}
        totalItems={total}
        pagination={pagination}
        sort={sort}
        onPaginationChange={setPagination}
        onSortChange={setSort}
        onRowClick={openDetail}
        getId={s => s.id}
        loading={loading}
        viewModes={['table', 'grid']}
        defaultViewMode="table"
        renderGridCard={renderGridCard}
        renderActions={sh => (
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" onClick={e => { e.stopPropagation(); openDetail(sh); }}>
              Chi tiết
            </Button>
            <Button variant="ghost" size="sm" onClick={e => { e.stopPropagation(); setShowPrint(sh); }}>
              <Printer className="h-4 w-4" />
            </Button>
          </div>
        )}
      />

      {/* Detail + Update dialog */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  {selected.trackingNumber}
                  <StatusBadge status={selected.status} />
                </DialogTitle>
                <DialogDescription>
                  {selected.orderNumber} · {selected.carrierName}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div><p className="text-muted-foreground">Người nhận</p><p className="font-medium">{selected.buyerName}</p></div>
                  <div><p className="text-muted-foreground">Phí VC</p><p className="font-medium">{formatPrice(selected.shippingFee)}</p></div>
                  <div><p className="text-muted-foreground">Từ</p><p>{selected.fromAddress}</p></div>
                  <div><p className="text-muted-foreground">Đến</p><p>{selected.toAddress}</p></div>
                  <div><p className="text-muted-foreground">Cân nặng</p><p>{selected.weight} kg</p></div>
                  <div><p className="text-muted-foreground">Dự kiến giao</p><p>{selected.estimatedDelivery}</p></div>
                  {selected.actualDelivery && (
                    <div><p className="text-muted-foreground">Giao thực tế</p><p className="text-green-600">{selected.actualDelivery}</p></div>
                  )}
                </div>

                {/* Status progress */}
                {selected.status !== 'Thất bại' && (
                  <div>
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      {statusSteps.map(s => (
                        <span key={s} className={statusSteps.indexOf(s) <= statusSteps.indexOf(selected.status) ? 'text-primary font-medium' : ''}>
                          {s}
                        </span>
                      ))}
                    </div>
                    <Progress value={Math.round(((statusSteps.indexOf(selected.status) + 1) / statusSteps.length) * 100)} />
                  </div>
                )}

                {/* Timeline */}
                <Separator />
                <div>
                  <p className="font-medium mb-3">Hành trình</p>
                  <div className="space-y-0">
                    {[...selected.events].reverse().map((ev, idx) => (
                      <div key={idx} className="flex gap-3 pb-3 last:pb-0">
                        <div className="flex flex-col items-center">
                          <div className={`w-3 h-3 rounded-full shrink-0 ${idx === 0 ? 'bg-primary' : 'bg-muted-foreground/40'}`} />
                          {idx < selected.events.length - 1 && <div className="w-0.5 flex-1 bg-muted-foreground/20 mt-1" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium">{ev.description}</p>
                          <p className="text-muted-foreground">{ev.timestamp} · {ev.location}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 18A.05: Update status form */}
                {selected.status !== 'Đã giao' && selected.status !== 'Thất bại' && (
                  <>
                    <Separator />
                    <div className="space-y-3">
                      <p className="font-medium">Cập nhật trạng thái</p>
                      <div className="grid sm:grid-cols-2 gap-3">
                        <div>
                          <Label>Trạng thái mới</Label>
                          <Select value={newStatus} onValueChange={v => setNewStatus(v as ShipmentStatus)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {statusSteps.map(s => (
                                <SelectItem key={s} value={s}>{s}</SelectItem>
                              ))}
                              <SelectItem value="Thất bại">Thất bại</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Địa điểm</Label>
                          <Input value={eventLocation} onChange={e => setEventLocation(e.target.value)} placeholder="VD: Hub GHN Q.1" />
                        </div>
                      </div>
                      <div>
                        <Label>Mô tả *</Label>
                        <Input value={eventDesc} onChange={e => setEventDesc(e.target.value)} placeholder="VD: Shipper đang giao hàng..." />
                      </div>
                      <Button onClick={handleUpdateStatus} className="w-full sm:w-auto">Cập nhật</Button>
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* 18A.04: Create shipment dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Tạo vận đơn mới</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto px-1">
            <div><Label>Mã đơn hàng *</Label><Input value={createForm.orderNumber} onChange={e => setCreateForm(f => ({ ...f, orderNumber: e.target.value }))} placeholder="DH-2025-XXXXX" /></div>
            <div><Label>Mã vận đơn *</Label><Input value={createForm.trackingNumber} onChange={e => setCreateForm(f => ({ ...f, trackingNumber: e.target.value }))} placeholder="VN..." /></div>
            <div>
              <Label>Hãng vận chuyển</Label>
              <Select value={createForm.carrier} onValueChange={v => {
                const c = carrierOptions.find(o => o.id === v);
                setCreateForm(f => ({ ...f, carrier: v, carrierName: c?.name ?? v }));
              }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {carrierOptions.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div><Label>Người nhận *</Label><Input value={createForm.buyerName} onChange={e => setCreateForm(f => ({ ...f, buyerName: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Cân nặng (kg)</Label><Input type="number" value={createForm.weight} onChange={e => setCreateForm(f => ({ ...f, weight: e.target.value }))} /></div>
              <div><Label>Phí VC</Label><Input type="number" value={createForm.shippingFee} onChange={e => setCreateForm(f => ({ ...f, shippingFee: e.target.value }))} /></div>
            </div>
            <div><Label>Địa chỉ gửi</Label><Input value={createForm.fromAddress} onChange={e => setCreateForm(f => ({ ...f, fromAddress: e.target.value }))} /></div>
            <div><Label>Địa chỉ nhận</Label><Input value={createForm.toAddress} onChange={e => setCreateForm(f => ({ ...f, toAddress: e.target.value }))} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Huỷ</Button>
            <Button onClick={handleCreateShipment}>Tạo vận đơn</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 18A.02: Biểu đồ tỷ lệ giao hàng */}
      <Dialog open={showChart} onOpenChange={setShowChart}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Tỷ lệ giao hàng theo tháng</DialogTitle>
          </DialogHeader>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={true} horizontal={true} />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} unit="%" />
              <RTooltip formatter={(v: number) => `${v}%`} />
              <Legend />
              <Line key="line-success" type="monotone" dataKey="tyLeThanhCong" name="Giao thành công" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
              <Line key="line-fail" type="monotone" dataKey="tyLeThatBai" name="Thất bại" stroke="#ef4444" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowChart(false)}>Đóng</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 18A.06: In phiếu gửi hàng */}
      <Dialog open={!!showPrint} onOpenChange={() => setShowPrint(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Phiếu gửi hàng</DialogTitle>
          </DialogHeader>
          {showPrint && (
            <div className="space-y-4 border rounded-lg p-4" id="print-shipment">
              <div className="text-center">
                <h3 className="text-lg">PHIẾU GỬI HÀNG</h3>
                <p className="text-muted-foreground">{showPrint.carrierName} · {showPrint.trackingNumber}</p>
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium mb-1">NGƯỜI GỬI</p>
                  <p>{showPrint.supplierName || 'Kho hàng'}</p>
                  <p className="text-muted-foreground">{showPrint.fromAddress}</p>
                </div>
                <div>
                  <p className="font-medium mb-1">NGƯỜI NHẬN</p>
                  <p>{showPrint.buyerName}</p>
                  <p className="text-muted-foreground">{showPrint.toAddress}</p>
                </div>
              </div>
              <Separator />
              <div className="grid grid-cols-3 gap-3 text-sm text-center">
                <div><p className="text-muted-foreground">Cân nặng</p><p className="font-medium">{showPrint.weight} kg</p></div>
                <div><p className="text-muted-foreground">Kích thước</p><p className="font-medium">{showPrint.dimensions || 'N/A'}</p></div>
                <div><p className="text-muted-foreground">Phí VC</p><p className="font-medium">{formatPrice(showPrint.shippingFee)}</p></div>
              </div>
              <Separator />
              <div className="text-sm">
                <p><strong>Mã đơn hàng:</strong> {showPrint.orderNumber}</p>
                <p><strong>Dự kiến giao:</strong> {showPrint.estimatedDelivery}</p>
              </div>
              <div className="grid grid-cols-2 gap-8 pt-4 text-center text-sm">
                <div><p>Người gửi</p><p className="mt-8">___________</p></div>
                <div><p>Người nhận</p><p className="mt-8">___________</p></div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPrint(null)}>Đóng</Button>
            <Button onClick={() => { window.print(); toast.success('Đang in phiếu gửi hàng...'); }}>
              <Printer className="h-4 w-4 mr-1" /> In phiếu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
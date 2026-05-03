// ============================================================
// WarehouseTransferPage — Chuyển kho & Multi-Warehouse Hub
// Nhóm 38B-38D: Tổng quan đa kho, lệnh chuyển kho, routing
// ============================================================

import { useState, useEffect } from 'react';
import {
  Warehouse, ArrowRight, Plus, RefreshCw, AlertTriangle,
  Package, TrendingUp, TrendingDown, MapPin, Clock,
  CheckCircle, Truck, Eye, Filter, Search, X, BarChart3,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { AppBreadcrumb } from '../shared/AppBreadcrumb';
import { EmptyState } from '../shared/EmptyState';
import { StatusBadge } from '../shared/StatusBadge';
import { warehouseTransferApi } from '../../services/warehouseTransferApi';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';

// ---- Types ----
interface WarehouseInfo {
  id: string;
  name: string;
  address: string;
  city: string;
  warehouseType: string;
  capacity: number;
  currentUsage: number;
  managerId: string;
  managerName: string;
  isActive: boolean;
  productCount: number;
  totalValue: number;
}

// ---- Mock warehouses ----
const MOCK_WAREHOUSES: WarehouseInfo[] = [
  {
    id: 'wh-001', name: 'Kho chính TP.HCM', address: '120 Lê Văn Lương', city: 'TP.HCM',
    warehouseType: 'Kho chính', capacity: 5000, currentUsage: 3850,
    managerId: 'u-1', managerName: 'Nguyễn Văn Kho', isActive: true,
    productCount: 248, totalValue: 8_500_000_000,
  },
  {
    id: 'wh-002', name: 'Kho miền Trung Đà Nẵng', address: '45 Nguyễn Hữu Thọ', city: 'Đà Nẵng',
    warehouseType: 'Kho vệ tinh', capacity: 2000, currentUsage: 940,
    managerId: 'u-2', managerName: 'Lê Thị Lan', isActive: true,
    productCount: 86, totalValue: 2_100_000_000,
  },
  {
    id: 'wh-003', name: 'Kho miền Bắc Hà Nội', address: '88 Giải Phóng', city: 'Hà Nội',
    warehouseType: 'Kho khu vực', capacity: 3000, currentUsage: 2850,
    managerId: 'u-3', managerName: 'Phạm Văn Bắc', isActive: true,
    productCount: 162, totalValue: 5_200_000_000,
  },
];

function getCapacityColor(pct: number) {
  if (pct >= 95) return 'text-red-500 bg-red-500';
  if (pct >= 80) return 'text-amber-500 bg-amber-500';
  return 'text-green-500 bg-green-500';
}

// ---- Warehouse Card ----
function WarehouseCard({ wh, onSelect }: { wh: WarehouseInfo; onSelect: () => void }) {
  const pct = Math.round((wh.currentUsage / wh.capacity) * 100);
  const colorClass = getCapacityColor(pct);
  const [barColor, textColor] = colorClass.split(' ');

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={onSelect}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Warehouse className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold">{wh.name}</p>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" />
                <span>{wh.city}</span>
              </div>
            </div>
          </div>
          <Badge variant={wh.isActive ? 'default' : 'secondary'} className="text-xs">
            {wh.isActive ? 'Hoạt động' : 'Tạm ngừng'}
          </Badge>
        </div>

        {/* Capacity bar */}
        <div className="mb-3">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-muted-foreground">Sức chứa</span>
            <span className={textColor}>{pct}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: `${pct}%` }} />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>{wh.currentUsage.toLocaleString()} đơn vị</span>
            <span>/{wh.capacity.toLocaleString()}</span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2 text-center">
          <div className="bg-muted/30 rounded-lg p-2">
            <p className="text-xs text-muted-foreground">Sản phẩm</p>
            <p className="font-bold">{wh.productCount}</p>
          </div>
          <div className="bg-muted/30 rounded-lg p-2">
            <p className="text-xs text-muted-foreground">Giá trị tồn</p>
            <p className="font-bold text-xs">{(wh.totalValue / 1e9).toFixed(1)}B ₫</p>
          </div>
        </div>

        {/* Alerts */}
        {pct >= 90 && (
          <div className="mt-2 flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 dark:bg-amber-950/20 rounded-lg px-2 py-1.5">
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>Kho sắp đầy — cần điều chuyển hàng</span>
          </div>
        )}
        {pct <= 10 && (
          <div className="mt-2 flex items-center gap-1.5 text-xs text-blue-600 bg-blue-50 dark:bg-blue-950/20 rounded-lg px-2 py-1.5">
            <Package className="h-3.5 w-3.5" />
            <span>Kho gần trống — cần nhập thêm hàng</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ---- Transfer Dialog ----
function CreateTransferDialog({ warehouses, onClose, onCreated }: {
  warehouses: WarehouseInfo[];
  onClose: () => void;
  onCreated: () => void;
}) {
  const [form, setForm] = useState({ fromId: '', toId: '', note: '' });
  const [items, setItems] = useState([{ productName: '', quantity: 1, note: '' }]);
  const [submitting, setSubmitting] = useState(false);

  const addItem = () => setItems(prev => [...prev, { productName: '', quantity: 1, note: '' }]);
  const removeItem = (i: number) => setItems(prev => prev.filter((_, idx) => idx !== i));

  const handleSubmit = async () => {
    if (!form.fromId || !form.toId) { toast.error('Chọn kho nguồn và kho đích'); return; }
    if (form.fromId === form.toId) { toast.error('Kho nguồn và kho đích phải khác nhau'); return; }
    if (items.some(it => !it.productName.trim())) { toast.error('Nhập tên sản phẩm cho tất cả dòng'); return; }
    setSubmitting(true);
    try {
      await warehouseTransferApi.create({
        fromWarehouseId: form.fromId,
        toWarehouseId: form.toId,
        items: items.map(it => ({ productId: 'prod-' + Math.random(), productName: it.productName, quantity: it.quantity, note: it.note })),
        note: form.note,
      });
      toast.success('Đã tạo lệnh chuyển kho thành công!');
      onCreated();
      onClose();
    } catch {
      toast.error('Lỗi tạo lệnh chuyển kho');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-background rounded-xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold">Tạo lệnh chuyển kho</h3>
          <Button variant="ghost" size="icon" onClick={onClose}><X className="h-4 w-4" /></Button>
        </div>

        <div className="p-4 space-y-4 overflow-y-auto flex-1">
          {/* From → To */}
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
            <div>
              <label className="text-sm font-medium mb-1 block">Kho nguồn</label>
              <select
                className="w-full border rounded-md px-2 py-1.5 text-sm bg-background"
                value={form.fromId}
                onChange={e => setForm(f => ({ ...f, fromId: e.target.value }))}
              >
                <option value="">-- Chọn kho --</option>
                {warehouses.map(wh => <option key={wh.id} value={wh.id}>{wh.name}</option>)}
              </select>
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground mt-5" />
            <div>
              <label className="text-sm font-medium mb-1 block">Kho đích</label>
              <select
                className="w-full border rounded-md px-2 py-1.5 text-sm bg-background"
                value={form.toId}
                onChange={e => setForm(f => ({ ...f, toId: e.target.value }))}
              >
                <option value="">-- Chọn kho --</option>
                {warehouses.filter(wh => wh.id !== form.fromId).map(wh => (
                  <option key={wh.id} value={wh.id}>{wh.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Items */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">Danh sách sản phẩm chuyển</label>
              <Button variant="outline" size="sm" onClick={addItem}>
                <Plus className="h-3.5 w-3.5 mr-1" /> Thêm hàng
              </Button>
            </div>
            <div className="space-y-2">
              {items.map((item, i) => (
                <div key={i} className="flex gap-2 items-start">
                  <div className="flex-1">
                    <Input
                      placeholder="Tên sản phẩm / mã SKU"
                      value={item.productName}
                      onChange={e => setItems(prev => prev.map((it, idx) => idx === i ? { ...it, productName: e.target.value } : it))}
                    />
                  </div>
                  <Input
                    type="number" min={1} placeholder="SL"
                    className="w-20"
                    value={item.quantity}
                    onChange={e => setItems(prev => prev.map((it, idx) => idx === i ? { ...it, quantity: parseInt(e.target.value) || 1 } : it))}
                  />
                  <Input
                    placeholder="Ghi chú"
                    className="w-28"
                    value={item.note}
                    onChange={e => setItems(prev => prev.map((it, idx) => idx === i ? { ...it, note: e.target.value } : it))}
                  />
                  {items.length > 1 && (
                    <Button variant="ghost" size="icon" className="text-destructive h-9 w-9" onClick={() => removeItem(i)}>
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Note */}
          <div>
            <label className="text-sm font-medium mb-1 block">Lý do chuyển kho</label>
            <textarea
              className="w-full border rounded-md px-3 py-2 text-sm bg-background resize-none"
              rows={2}
              placeholder="Ghi chú lý do..."
              value={form.note}
              onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
            />
          </div>
        </div>

        <div className="flex gap-2 p-4 border-t justify-end">
          <Button variant="outline" onClick={onClose} disabled={submitting}>Huỷ</Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Đang tạo...' : 'Tạo lệnh chuyển kho'}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ---- Main Page ----
export function WarehouseTransferPage() {
  const { user } = useAuth();
  const [transfers, setTransfers] = useState<ReturnType<typeof Array>[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Tất cả');
  const [selectedWh, setSelectedWh] = useState<WarehouseInfo | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await warehouseTransferApi.getAll();
      setTransfers(data as ReturnType<typeof Array>[]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const supplierId = (user as { supplierId?: string })?.supplierId ?? '';

  // Stats
  const totalCapacity = MOCK_WAREHOUSES.reduce((s, w) => s + w.capacity, 0);
  const totalUsage = MOCK_WAREHOUSES.reduce((s, w) => s + w.currentUsage, 0);
  const totalValue = MOCK_WAREHOUSES.reduce((s, w) => s + w.totalValue, 0);
  const alerts = MOCK_WAREHOUSES.filter(w => (w.currentUsage / w.capacity) > 0.9);

  // Chart data
  const warehouseChartData = MOCK_WAREHOUSES.map(wh => ({
    name: wh.name.replace('Kho ', ''),
    total: wh.currentUsage,
    capacity: wh.capacity,
    pct: Math.round((wh.currentUsage / wh.capacity) * 100),
  }));

  const valueDistData = MOCK_WAREHOUSES.map(wh => ({
    name: wh.city,
    value: wh.totalValue,
  }));
  const COLORS = ['#3b82f6', '#22c55e', '#f59e0b'];

  const STATUSES = ['Tất cả', 'Chờ duyệt', 'Đang chuyển', 'Đã nhận', 'Đã huỷ'];

  // Filter transfers
  const filtered = (transfers as { fromWarehouseName?: string; toWarehouseName?: string; status?: string }[]).filter(t => {
    const matchSearch = !search || (t.fromWarehouseName ?? '').toLowerCase().includes(search.toLowerCase()) ||
      (t.toWarehouseName ?? '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'Tất cả' || t.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-5">
      <AppBreadcrumb items={[{ label: 'Kênh người bán', href: '/seller' }, { label: 'Kho hàng', href: '/seller/warehouse' }, { label: 'Chuyển kho & Đa kho' }]} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Warehouse className="h-6 w-6 text-primary" />
            Quản lý đa kho
          </h1>
          <p className="text-muted-foreground text-sm">Tổng quan và chuyển hàng giữa các kho</p>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4 mr-1" /> Tạo lệnh chuyển kho
        </Button>
      </div>

      {/* Overview stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-3">
            <p className="text-xs text-muted-foreground mb-1">Tổng kho</p>
            <p className="text-2xl font-bold">{MOCK_WAREHOUSES.length}</p>
            <p className="text-xs text-muted-foreground">{MOCK_WAREHOUSES.filter(w => w.isActive).length} đang hoạt động</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <p className="text-xs text-muted-foreground mb-1">Tổng tồn kho</p>
            <p className="text-2xl font-bold">{totalUsage.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">/{totalCapacity.toLocaleString()} đv</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <p className="text-xs text-muted-foreground mb-1">Tổng giá trị</p>
            <p className="text-2xl font-bold">{(totalValue / 1e9).toFixed(1)}B</p>
            <p className="text-xs text-muted-foreground">đồng VNĐ</p>
          </CardContent>
        </Card>
        <Card className={alerts.length > 0 ? 'border-amber-300' : ''}>
          <CardContent className="p-3">
            <p className="text-xs text-muted-foreground mb-1">Cảnh báo kho</p>
            <p className={`text-2xl font-bold ${alerts.length > 0 ? 'text-amber-600' : ''}`}>{alerts.length}</p>
            <p className="text-xs text-muted-foreground">kho gần đầy (&gt;90%)</p>
          </CardContent>
        </Card>
      </div>

      {/* Alerts banner */}
      {alerts.length > 0 && (
        <div className="flex items-center gap-3 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 rounded-xl">
          <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
          <div>
            <p className="font-medium text-amber-700 dark:text-amber-400">
              {alerts.map(w => w.name).join(', ')} sắp đầy sức chứa
            </p>
            <p className="text-sm text-amber-600/80">Tạo lệnh chuyển kho để phân phối hàng hoá</p>
          </div>
          <Button size="sm" variant="outline" className="ml-auto shrink-0" onClick={() => setShowCreate(true)}>
            Chuyển kho ngay
          </Button>
        </div>
      )}

      {/* Warehouse grid */}
      <div>
        <h2 className="text-base font-semibold mb-3 flex items-center gap-2">
          <Package className="h-4 w-4" /> Danh sách kho
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {MOCK_WAREHOUSES.map(wh => (
            <WarehouseCard key={wh.id} wh={wh} onSelect={() => setSelectedWh(selectedWh?.id === wh.id ? null : wh)} />
          ))}
        </div>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Bar chart compare */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <BarChart3 className="h-4 w-4" /> So sánh tồn kho theo điểm
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={warehouseChartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: number, name: string) => [v.toLocaleString() + ' đv', name === 'total' ? 'Đang dùng' : 'Tổng sức chứa']} />
                  <Bar dataKey="capacity" name="capacity" fill="#e2e8f0" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="total" name="total" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Pie chart value */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4" /> Phân bổ giá trị tồn kho
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="h-52 w-48 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={valueDistData} cx="50%" cy="50%" innerRadius={45} outerRadius={80} dataKey="value">
                      {valueDistData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(v: number) => [(v / 1e9).toFixed(1) + 'B ₫']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2 flex-1">
                {valueDistData.map((d, i) => (
                  <div key={d.name} className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: COLORS[i] }} />
                    <span className="flex-1 text-sm">{d.name}</span>
                    <span className="text-sm font-medium">{(d.value / 1e9).toFixed(1)}B ₫</span>
                  </div>
                ))}
                <div className="pt-2 border-t">
                  <div className="flex items-center gap-2 font-medium">
                    <span className="h-3 w-3" />
                    <span className="flex-1 text-sm">Tổng cộng</span>
                    <span className="text-sm">{(totalValue / 1e9).toFixed(1)}B ₫</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transfer history */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <h2 className="text-base font-semibold flex items-center gap-2">
            <ArrowRight className="h-4 w-4" /> Lệnh chuyển kho
          </h2>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input className="pl-9 w-48" placeholder="Tìm kho..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select
              className="border rounded-md px-2 py-1.5 text-sm bg-background"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => <div key={i} className="h-16 rounded-xl bg-muted animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<ArrowRight className="h-10 w-10" />}
            title="Chưa có lệnh chuyển kho nào"
            description="Tạo lệnh chuyển kho để điều phối hàng hoá giữa các kho"
            action={<Button onClick={() => setShowCreate(true)}><Plus className="h-4 w-4 mr-1" /> Tạo lệnh đầu tiên</Button>}
          />
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="space-y-0 divide-y">
                {filtered.map((t: { id?: string; fromWarehouseName?: string; toWarehouseName?: string; status?: string; createdAt?: string; items?: { productName: string; quantity: number }[] }) => (
                  <div key={t.id} className="flex items-center gap-3 p-3 hover:bg-muted/30 transition-colors">
                    <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Truck className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{t.fromWarehouseName ?? 'Kho nguồn'}</span>
                        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="font-medium text-sm">{t.toWarehouseName ?? 'Kho đích'}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {(t.items?.length ?? 0)} sản phẩm · {t.createdAt ? new Date(t.createdAt).toLocaleDateString('vi-VN') : '--'}
                      </p>
                    </div>
                    <StatusBadge status={t.status ?? 'Chờ duyệt'} />
                    <div className="flex gap-1 shrink-0">
                      {t.status === 'Chờ duyệt' && (
                        <Button size="sm" variant="outline" onClick={() => toast.success('Đã duyệt lệnh chuyển kho')}>
                          <CheckCircle className="h-3.5 w-3.5 mr-1" /> Duyệt
                        </Button>
                      )}
                      <Button size="sm" variant="ghost" onClick={() => toast.info('Chi tiết lệnh chuyển kho')}>
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Dialog */}
      {showCreate && (
        <CreateTransferDialog
          warehouses={MOCK_WAREHOUSES}
          onClose={() => setShowCreate(false)}
          onCreated={load}
        />
      )}
    </div>
  );
}

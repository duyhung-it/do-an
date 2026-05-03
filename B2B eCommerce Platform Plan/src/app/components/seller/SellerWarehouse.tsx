import { useState, useEffect, useCallback } from 'react';
import {
  Warehouse as WarehouseIcon, Package, ArrowDownUp, AlertTriangle,
  Plus, Pencil, Trash2, Download, Upload, Printer, BarChart3,
  TrendingDown, Clock, ShoppingCart, ArrowRightLeft,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { DataTable } from '../shared/DataTable';
import { FilterBar } from '../shared/FilterBar';
import { StatusBadge } from '../shared/StatusBadge';
import { AppBreadcrumb } from '../shared/AppBreadcrumb';
import { ImportDialog, type ImportColumn } from '../shared/ImportDialog';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '../ui/dialog';
import { Switch } from '../ui/switch';
import { Textarea } from '../ui/textarea';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
  LineChart, Line,
} from 'recharts';
import { warehouseApi, inventoryApi, stockMovementApi, stockAlertApi } from '../../services/api';
import { exportToCSV } from '../../utils/exportUtils';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';
import type {
  Warehouse, InventoryItem, StockMovement, StockAlert, InventorySummary,
  StockMovementType,
  PaginationParams, SortParams, ActiveFilter, FilterConfig, ColumnConfig,
} from '../../types';
import { SellerWarehouseTransferTab } from './SellerWarehouseTransferTab';

const formatPrice = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);
const formatNumber = (n: number) => n.toLocaleString('vi-VN');
const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

// ========================== TAB 1: Kho hàng ==========================
function WarehouseTab() {
  const { user } = useAuth();
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Warehouse | null>(null);
  const [form, setForm] = useState({ name: '', address: '', city: '', capacity: '1000', isActive: true });
  const [stockByWarehouse, setStockByWarehouse] = useState<{ warehouseName: string; totalStock: number; totalValue: number }[]>([]);
  const [valueByCategory, setValueByCategory] = useState<{ categoryName: string; totalValue: number }[]>([]);

  const fetchData = useCallback(async () => {
    if (!user?.supplierId) return;
    setLoading(true);
    try {
      const [whs, stockData, catData] = await Promise.all([
        warehouseApi.getBySeller(user.supplierId),
        inventoryApi.getStockByWarehouse(),
        inventoryApi.getValueByCategory(),
      ]);
      setWarehouses(whs);
      setStockByWarehouse(stockData);
      setValueByCategory(catData);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', address: '', city: '', capacity: '1000', isActive: true });
    setShowForm(true);
  };

  const openEdit = (wh: Warehouse) => {
    setEditing(wh);
    setForm({ name: wh.name, address: wh.address, city: wh.city, capacity: String(wh.capacity), isActive: wh.isActive });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.address.trim()) {
      toast.error('Vui lòng nhập tên và địa chỉ kho');
      return;
    }
    try {
      if (editing) {
        await warehouseApi.update(editing.id, {
          name: form.name, address: form.address, city: form.city,
          capacity: Number(form.capacity), isActive: form.isActive,
        });
        toast.success('Cập nhật kho thành công');
      } else {
        await warehouseApi.create({
          name: form.name, address: form.address, city: form.city,
          supplierId: user?.supplierId ?? '',
          capacity: Number(form.capacity), currentStock: 0, isActive: form.isActive,
        });
        toast.success('Tạo kho mới thành công');
      }
      setShowForm(false);
      fetchData();
    } catch {
      toast.error('Có lỗi xảy ra');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xoá kho này?')) return;
    try {
      await warehouseApi.delete(id);
      toast.success('Đã xoá kho');
      fetchData();
    } catch {
      toast.error('Có lỗi xảy ra');
    }
  };

  if (loading) return <div className="text-center py-8 text-muted-foreground">Đang tải...</div>;

  return (
    <div className="space-y-6">
      {/* 17A.01: Biểu đồ tồn kho theo kho + 17A.02: PieChart giá trị theo danh mục */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5" /> Tồn kho theo kho</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={stockByWarehouse}>
                <CartesianGrid strokeDasharray="3 3" vertical={true} horizontal={true} />
                <XAxis dataKey="warehouseName" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <RTooltip formatter={(v: number) => formatNumber(v)} />
                <Bar key="bar-total-stock" dataKey="totalStock" name="Tồn kho" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5" /> Giá trị theo danh mục</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  key="pie-value-category"
                  data={valueByCategory}
                  dataKey="totalValue"
                  nameKey="categoryName"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ categoryName, percent }) => `${categoryName} ${(percent * 100).toFixed(0)}%`}
                >
                  {valueByCategory.map((_, i) => (
                    <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <RTooltip formatter={(v: number) => formatPrice(v)} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Danh sách kho */}
      <div className="flex justify-between items-center">
        <h2>Danh sách kho ({warehouses.length})</h2>
        <Button onClick={openCreate}><Plus className="h-4 w-4 mr-1" /> Thêm kho</Button>
      </div>

      {/* P5.11: Visual map mock — grid layout mô phỏng khu vực kho */}
      {warehouses.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2"><WarehouseIcon className="h-5 w-5" /> Bản đồ kho hàng</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {warehouses.map(wh => {
                const pct = wh.capacity > 0 ? Math.round((wh.currentStock / wh.capacity) * 100) : 0;
                const bg = pct > 90 ? 'bg-red-100 border-red-300 dark:bg-red-950/30 dark:border-red-800'
                  : pct > 70 ? 'bg-amber-100 border-amber-300 dark:bg-amber-950/30 dark:border-amber-800'
                  : 'bg-green-100 border-green-300 dark:bg-green-950/30 dark:border-green-800';
                return (
                  <div key={wh.id} className={`rounded-xl border-2 p-4 text-center transition-all hover:shadow-md cursor-default ${bg}`}>
                    <WarehouseIcon className="h-8 w-8 mx-auto mb-2 opacity-60" />
                    <p className="text-sm truncate">{wh.name}</p>
                    <p className="text-xs text-muted-foreground">{wh.city}</p>
                    <p className="text-lg mt-1">{wh.currentStock.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">/ {wh.capacity.toLocaleString()} ({pct}%)</p>
                    <StatusBadge status={wh.isActive ? 'Hoạt động' : 'Ẩn'} />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {warehouses.map(wh => {
          const pct = wh.capacity > 0 ? Math.round((wh.currentStock / wh.capacity) * 100) : 0;
          return (
            <Card key={wh.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <WarehouseIcon className="h-5 w-5" /> {wh.name}
                  </CardTitle>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(wh)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(wh.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-muted-foreground">{wh.address}, {wh.city}</p>
                <div>
                  <div className="flex justify-between mb-1">
                    <span>Sử dụng: {wh.currentStock.toLocaleString()}/{wh.capacity.toLocaleString()}</span>
                    <span className={pct > 90 ? 'text-red-500' : pct > 70 ? 'text-yellow-500' : 'text-green-500'}>{pct}%</span>
                  </div>
                  <Progress value={pct} />
                </div>
                <StatusBadge status={wh.isActive ? 'Hoạt động' : 'Ẩn'} />
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Sửa kho' : 'Thêm kho mới'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div><Label>Tên kho *</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
            <div><Label>Địa chỉ *</Label><Input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} /></div>
            <div><Label>Thành phố</Label><Input value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} /></div>
            <div><Label>Sức chứa</Label><Input type="number" value={form.capacity} onChange={e => setForm(f => ({ ...f, capacity: e.target.value }))} /></div>
            <div className="flex items-center gap-2"><Switch checked={form.isActive} onCheckedChange={v => setForm(f => ({ ...f, isActive: v }))} /><Label>Hoạt động</Label></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)}>Huỷ</Button>
            <Button onClick={handleSave}>{editing ? 'Cập nhật' : 'Tạo'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ========================== TAB 2: Tồn kho (Nâng cao) ==========================
const inventoryColumns: ColumnConfig[] = [
  { key: 'productName', label: 'Sản phẩm', visible: true, sortable: true },
  { key: 'sku', label: 'SKU', visible: true, sortable: true },
  { key: 'warehouseName', label: 'Kho', visible: true, sortable: true },
  { key: 'currentStock', label: 'Tồn kho', visible: true, sortable: true },
  { key: 'minStock', label: 'Tối thiểu', visible: true, sortable: true },
  { key: 'costPriceFmt', label: 'Giá nhập', visible: true, sortable: false },
  { key: 'totalValueFmt', label: 'Giá trị tồn', visible: true, sortable: false },
  { key: 'lastSoldDate', label: 'Bán lần cuối', visible: true, sortable: true },
  { key: 'salesVelocity', label: 'Tốc độ bán/tháng', visible: true, sortable: true },
  { key: 'daysUntilStockoutFmt', label: 'Dự kiến hết sau', visible: true, sortable: true },
  { key: 'stockLevel', label: 'Phân loại', visible: true, sortable: true },
  { key: 'status', label: 'Trạng thái', visible: true, sortable: true },
  { key: 'lastUpdated', label: 'Cập nhật', visible: true, sortable: true },
];

const inventoryFilters: FilterConfig[] = [
  { key: 'status', label: 'Trạng thái', type: 'select', options: [
    { label: 'Đủ hàng', value: 'Đủ hàng' },
    { label: 'Sắp hết', value: 'Sắp hết' },
    { label: 'Hết hàng', value: 'Hết hàng' },
  ]},
  { key: 'warehouseName', label: 'Kho', type: 'select', options: [
    { label: 'Kho Tân Bình', value: 'Kho Tân Bình' },
    { label: 'Kho Bình Dương', value: 'Kho Bình Dương' },
    { label: 'Kho Hà Nội', value: 'Kho Hà Nội' },
  ]},
  // 17C.06: Filter nhanh theo stockLevel
  { key: 'stockLevel', label: 'Phân loại tồn', type: 'select', options: [
    { label: 'Hết hàng', value: 'Hết hàng' },
    { label: 'Gần hết', value: 'Gần hết' },
    { label: 'Đủ', value: 'Đủ' },
    { label: 'Tồn đọng (> 90 ngày)', value: 'Tồn đọng' },
  ]},
];

interface InvRow extends InventoryItem {
  totalValueFmt: string;
  costPriceFmt: string;
  daysUntilStockoutFmt: string;
}

const inventoryImportColumns: ImportColumn[] = [
  { key: 'sku', label: 'SKU', required: true },
  { key: 'warehouseName', label: 'Tên kho', required: true },
  { key: 'currentStock', label: 'Tồn kho', required: true, validate: v => isNaN(Number(v)) ? 'Phải là số' : null },
  { key: 'minStock', label: 'Tồn tối thiểu', required: false },
  { key: 'unitPrice', label: 'Đơn giá', required: false },
];

function InventoryTab() {
  const [data, setData] = useState<InvRow[]>([]);
  const [allItems, setAllItems] = useState<InventoryItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<InventorySummary | null>(null);
  const [pagination, setPagination] = useState<PaginationParams>({ page: 1, pageSize: 10 });
  const [sort, setSort] = useState<SortParams>({ field: 'productName', direction: 'asc' });
  const [filters, setFilters] = useState<ActiveFilter[]>([]);
  const [search, setSearch] = useState('');
  const [showImport, setShowImport] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<InventoryItem[]>([]);

  const [adjustItem, setAdjustItem] = useState<InventoryItem | null>(null);
  const [adjustStock, setAdjustStock] = useState('');
  const [adjustReason, setAdjustReason] = useState('');
  const { user } = useAuth();

  const toRow = (i: InventoryItem): InvRow => ({
    ...i,
    totalValueFmt: formatPrice(i.totalValue),
    costPriceFmt: formatPrice(i.costPrice),
    daysUntilStockoutFmt: i.daysUntilStockout > 0 ? `${i.daysUntilStockout} ngày` : '—',
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [res, sum, all] = await Promise.all([
        inventoryApi.getPaginated(pagination, sort, filters, search),
        inventoryApi.getSummary(),
        inventoryApi.getAll(),
      ]);
      setTotal(res.total);
      setData(res.data.map(toRow));
      setSummary(sum);
      setAllItems(all);
    } finally {
      setLoading(false);
    }
  }, [pagination, sort, filters, search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleAdjust = async () => {
    if (!adjustItem || !adjustStock || !adjustReason) {
      toast.error('Vui lòng nhập đủ thông tin');
      return;
    }
    try {
      await inventoryApi.adjustStock(adjustItem.id, Number(adjustStock), adjustReason, user?.fullName ?? 'NV');
      toast.success('Đã điều chỉnh tồn kho');
      setAdjustItem(null);
      fetchData();
    } catch {
      toast.error('Có lỗi xảy ra');
    }
  };

  // 17A.04: Export CSV tồn kho
  const handleExport = () => {
    exportToCSV(allItems as unknown as Record<string, unknown>[], [
      { key: 'sku', label: 'SKU' },
      { key: 'productName', label: 'Sản phẩm' },
      { key: 'warehouseName', label: 'Kho' },
      { key: 'currentStock', label: 'Tồn kho' },
      { key: 'minStock', label: 'Tối thiểu' },
      { key: 'costPrice', label: 'Giá nhập' },
      { key: 'unitPrice', label: 'Đơn giá' },
      { key: 'totalValue', label: 'Giá trị tồn' },
      { key: 'salesVelocity', label: 'Tốc độ bán/tháng' },
      { key: 'daysUntilStockout', label: 'Dự kiến hết sau (ngày)' },
      { key: 'daysInStock', label: 'Ngày tồn kho' },
      { key: 'stockLevel', label: 'Phân loại' },
      { key: 'status', label: 'Trạng thái' },
      { key: 'lastSoldDate', label: 'Bán lần cuối' },
      { key: 'lastUpdated', label: 'Cập nhật' },
    ], 'ton-kho');
    toast.success('Đã xuất CSV tồn kho');
  };

  // 17A.05: Import CSV
  const handleImport = async (rows: Record<string, string>[]) => {
    const result = await inventoryApi.importFromCSV(rows);
    toast.success(`Nhập thành công ${result.success} dòng, lỗi ${result.failed} dòng`);
    fetchData();
    return { success: result.success, failed: result.failed, skipped: 0, errors: [], data: rows };
  };

  // 17C.05: Gợi ý đặt hàng bổ sung
  const handleShowSuggestions = async () => {
    const items = await inventoryApi.getReorderSuggestions();
    setSuggestions(items);
    setShowSuggestions(true);
  };

  const renderGridCard = (item: InvRow) => (
    <Card key={item.id}>
      <CardContent className="p-4 space-y-2">
        <p className="font-medium truncate">{item.productName}</p>
        <p className="text-muted-foreground">{item.sku} · {item.warehouseName}</p>
        <div>
          <div className="flex justify-between mb-1">
            <span>Tồn: {item.currentStock.toLocaleString()}</span>
            <span>Min: {item.minStock}</span>
          </div>
          <Progress value={item.minStock > 0 ? Math.min(100, Math.round((item.currentStock / (item.minStock * 3)) * 100)) : 100} />
        </div>
        <div className="flex justify-between items-center">
          <StatusBadge status={item.status} />
          <span className="text-muted-foreground">{item.totalValueFmt}</span>
        </div>
        {/* 17C.04: Cảnh báo thông minh */}
        {item.daysUntilStockout > 0 && item.daysUntilStockout <= 7 && (
          <Badge variant="destructive">Hết hàng sau {item.daysUntilStockout} ngày</Badge>
        )}
        {item.stockLevel === 'Tồn đọng' && (
          <Badge variant="outline" className="border-yellow-500 text-yellow-600">Tồn đọng {item.daysInStock} ngày</Badge>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-4">
      {/* Summary */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { label: 'Tổng SKU', value: summary.totalSKU },
            { label: 'Tổng tồn kho', value: summary.totalStock.toLocaleString() },
            { label: 'Sắp hết', value: summary.lowStockCount, color: 'text-yellow-500' },
            { label: 'Hết hàng', value: summary.outOfStockCount, color: 'text-red-500' },
            { label: 'Tổng giá trị', value: formatPrice(summary.totalValue) },
          ].map(s => (
            <Card key={s.label}>
              <CardContent className="p-3 text-center">
                <p className={`text-xl ${s.color ?? ''}`}>{s.value}</p>
                <p className="text-muted-foreground">{s.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={handleExport}>
          <Download className="h-4 w-4 mr-1" /> Xuất CSV
        </Button>
        <Button variant="outline" size="sm" onClick={() => setShowImport(true)}>
          <Upload className="h-4 w-4 mr-1" /> Nhập CSV
        </Button>
        <Button variant="outline" size="sm" onClick={handleShowSuggestions}>
          <ShoppingCart className="h-4 w-4 mr-1" /> Gợi ý đặt hàng
        </Button>
      </div>

      <FilterBar
        filters={inventoryFilters}
        activeFilters={filters}
        onFilterChange={f => { setFilters(f); setPagination(p => ({ ...p, page: 1 })); }}
        searchValue={search}
        onSearchChange={v => { setSearch(v); setPagination(p => ({ ...p, page: 1 })); }}
        searchPlaceholder="Tìm sản phẩm, SKU, kho..."
      />

      <DataTable<InvRow>
        data={data}
        columns={inventoryColumns}
        totalItems={total}
        pagination={pagination}
        sort={sort}
        onPaginationChange={setPagination}
        onSortChange={setSort}
        getId={i => i.id}
        loading={loading}
        viewModes={['table', 'grid']}
        defaultViewMode="table"
        renderGridCard={renderGridCard}
        renderActions={item => (
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" onClick={e => {
              e.stopPropagation();
              setAdjustItem(item);
              setAdjustStock(String(item.currentStock));
              setAdjustReason('');
            }}>
              Điều chỉnh
            </Button>
          </div>
        )}
      />

      {/* Adjust dialog */}
      <Dialog open={!!adjustItem} onOpenChange={() => setAdjustItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Điều chỉnh tồn kho</DialogTitle>
          </DialogHeader>
          {adjustItem && (
            <div className="space-y-4">
              <p className="font-medium">{adjustItem.productName}</p>
              <p className="text-muted-foreground">{adjustItem.warehouseName} · Tồn hiện tại: {adjustItem.currentStock}</p>
              <div><Label>Số lượng mới *</Label><Input type="number" min={0} value={adjustStock} onChange={e => setAdjustStock(e.target.value)} /></div>
              <div><Label>Lý do *</Label><Input value={adjustReason} onChange={e => setAdjustReason(e.target.value)} placeholder="Nhập lý do điều chỉnh..." /></div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setAdjustItem(null)}>Huỷ</Button>
            <Button onClick={handleAdjust}>Lưu</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 17A.05: Import CSV */}
      <ImportDialog
        open={showImport}
        onClose={() => setShowImport(false)}
        title="Nhập tồn kho từ CSV"
        columns={inventoryImportColumns}
        onImport={handleImport}
        templateFilename="mau-nhap-ton-kho"
      />

      {/* 17C.05: Gợi ý đặt hàng */}
      <Dialog open={showSuggestions} onOpenChange={setShowSuggestions}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" /> Gợi ý đặt hàng bổ sung
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {suggestions.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">Không có sản phẩm cần đặt hàng bổ sung</p>
            ) : (
              suggestions.map(item => (
                <Card key={item.id}>
                  <CardContent className="p-3 flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{item.productName}</p>
                      <p className="text-muted-foreground">{item.sku} · {item.warehouseName}</p>
                      <p className="text-muted-foreground">
                        Tồn: {item.currentStock} · Tốc độ: {item.salesVelocity} SP/tháng · Hết sau: {item.daysUntilStockout > 0 ? `${item.daysUntilStockout} ngày` : 'Đã hết'}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-lg text-primary">{item.suggestedReorder}</p>
                      <p className="text-muted-foreground">SL gợi ý</p>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSuggestions(false)}>Đóng</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ========================== TAB 3: Xuất nhập kho (Nâng cao) ==========================
const movementColumns: ColumnConfig[] = [
  { key: 'createdAt', label: 'Ngày', visible: true, sortable: true },
  { key: 'type', label: 'Loại', visible: true, sortable: true },
  { key: 'productName', label: 'Sản phẩm', visible: true, sortable: true },
  { key: 'warehouseName', label: 'Kho', visible: true, sortable: true },
  { key: 'quantity', label: 'Số lượng', visible: true, sortable: true },
  { key: 'previousStock', label: 'Trước', visible: true, sortable: false },
  { key: 'newStock', label: 'Sau', visible: true, sortable: false },
  { key: 'reason', label: 'Lý do', visible: true, sortable: false },
  { key: 'performedBy', label: 'Người thực hiện', visible: true, sortable: true },
  { key: 'supplierOrigin', label: 'NCC gốc', visible: false, sortable: false },
  { key: 'invoiceNumber', label: 'Số HĐ nhập', visible: false, sortable: false },
  { key: 'linkedOrderId', label: 'Đơn hàng LK', visible: false, sortable: false },
  { key: 'receiverName', label: 'Người nhận', visible: false, sortable: false },
];

const movementFilters: FilterConfig[] = [
  { key: 'type', label: 'Loại', type: 'select', options: [
    { label: 'Nhập kho', value: 'Nhập kho' },
    { label: 'Xuất kho', value: 'Xuất kho' },
    { label: 'Chuyển kho', value: 'Chuyển kho' },
    { label: 'Điều chỉnh', value: 'Điều chỉnh' },
    { label: 'Trả hàng', value: 'Trả hàng' },
  ]},
];

type MovementFormType = 'Nhập kho' | 'Xuất kho' | 'Chuyển kho';

function MovementTab() {
  const { user } = useAuth();
  const [data, setData] = useState<StockMovement[]>([]);
  const [allMovements, setAllMovements] = useState<StockMovement[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationParams>({ page: 1, pageSize: 10 });
  const [sort, setSort] = useState<SortParams>({ field: 'createdAt', direction: 'desc' });
  const [filters, setFilters] = useState<ActiveFilter[]>([]);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState<MovementFormType>('Nhập kho');
  const [showChart, setShowChart] = useState(false);
  const [chartData, setChartData] = useState<{ month: string; nhapKho: number; xuatKho: number }[]>([]);
  const [showPrint, setShowPrint] = useState<StockMovement | null>(null);

  // Form fields
  const [formData, setFormData] = useState({
    productName: '', warehouseName: '', quantity: '',
    reason: '', supplierOrigin: '', invoiceNumber: '',
    importDate: '', linkedOrderId: '', receiverName: '',
    toWarehouseName: '',
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [res, all] = await Promise.all([
        stockMovementApi.getPaginated(pagination, sort, filters, search),
        stockMovementApi.getAll(),
      ]);
      setTotal(res.total);
      setData(res.data);
      setAllMovements(all);
    } finally {
      setLoading(false);
    }
  }, [pagination, sort, filters, search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // 17B.04: Biểu đồ xuất nhập theo tháng
  const handleShowChart = async () => {
    const d = await inventoryApi.getMovementByMonth();
    setChartData(d);
    setShowChart(true);
  };

  const openMovementForm = (type: MovementFormType) => {
    setFormType(type);
    setFormData({
      productName: '', warehouseName: '', quantity: '',
      reason: '', supplierOrigin: '', invoiceNumber: '',
      importDate: '', linkedOrderId: '', receiverName: '',
      toWarehouseName: '',
    });
    setShowForm(true);
  };

  // 17B.01 + 17B.02 + 17B.03: Tạo movement
  const handleCreateMovement = async () => {
    if (!formData.productName || !formData.warehouseName || !formData.quantity) {
      toast.error('Vui lòng nhập đủ thông tin bắt buộc');
      return;
    }
    const qty = Number(formData.quantity);
    try {
      const movement: Omit<StockMovement, 'id' | 'createdAt'> = {
        warehouseId: '',
        warehouseName: formData.warehouseName,
        productId: '',
        productName: formData.productName,
        type: formType as StockMovementType,
        quantity: formType === 'Xuất kho' || formType === 'Chuyển kho' ? -Math.abs(qty) : Math.abs(qty),
        previousStock: 0,
        newStock: 0,
        reason: formData.reason || `${formType} thủ công`,
        performedBy: user?.fullName ?? 'NV',
        supplierOrigin: formData.supplierOrigin || undefined,
        invoiceNumber: formData.invoiceNumber || undefined,
        importDate: formData.importDate || undefined,
        linkedOrderId: formData.linkedOrderId || undefined,
        receiverName: formData.receiverName || undefined,
        toWarehouseId: formType === 'Chuyển kho' ? '' : undefined,
        toWarehouseName: formType === 'Chuyển kho' ? formData.toWarehouseName : undefined,
      };
      await stockMovementApi.create(movement);

      // 17B.03: Chuyển kho — tạo thêm movement nhập cho kho đích
      if (formType === 'Chuyển kho' && formData.toWarehouseName) {
        await stockMovementApi.create({
          ...movement,
          warehouseName: formData.toWarehouseName,
          type: 'Nhập kho',
          quantity: Math.abs(qty),
          reason: `Nhận chuyển từ ${formData.warehouseName}`,
        });
      }

      toast.success(`Đã tạo phiếu ${formType.toLowerCase()}`);
      setShowForm(false);
      fetchData();
    } catch {
      toast.error('Có lỗi xảy ra');
    }
  };

  // 17B.06: Export CSV lịch sử xuất nhập
  const handleExportMovements = () => {
    exportToCSV(allMovements as unknown as Record<string, unknown>[], [
      { key: 'createdAt', label: 'Ngày' },
      { key: 'type', label: 'Loại' },
      { key: 'productName', label: 'Sản phẩm' },
      { key: 'warehouseName', label: 'Kho' },
      { key: 'quantity', label: 'Số lượng' },
      { key: 'previousStock', label: 'Tồn trước' },
      { key: 'newStock', label: 'Tồn sau' },
      { key: 'reason', label: 'Lý do' },
      { key: 'performedBy', label: 'Người thực hiện' },
      { key: 'supplierOrigin', label: 'NCC gốc' },
      { key: 'invoiceNumber', label: 'Số HĐ nhập' },
      { key: 'linkedOrderId', label: 'Đơn hàng LK' },
      { key: 'receiverName', label: 'Người nhận' },
    ], 'lich-su-xuat-nhap-kho');
    toast.success('Đã xuất CSV lịch sử xuất nhập kho');
  };

  return (
    <div className="space-y-4">
      {/* Action buttons */}
      <div className="flex flex-wrap gap-2">
        <Button size="sm" onClick={() => openMovementForm('Nhập kho')}>
          <Plus className="h-4 w-4 mr-1" /> Nhập kho
        </Button>
        <Button size="sm" variant="secondary" onClick={() => openMovementForm('Xuất kho')}>
          <ArrowDownUp className="h-4 w-4 mr-1" /> Xuất kho
        </Button>
        <Button size="sm" variant="secondary" onClick={() => openMovementForm('Chuyển kho')}>
          <ArrowRightLeft className="h-4 w-4 mr-1" /> Chuyển kho
        </Button>
        <Button variant="outline" size="sm" onClick={handleShowChart}>
          <BarChart3 className="h-4 w-4 mr-1" /> Biểu đồ
        </Button>
        <Button variant="outline" size="sm" onClick={handleExportMovements}>
          <Download className="h-4 w-4 mr-1" /> Xuất CSV
        </Button>
      </div>

      <FilterBar
        filters={movementFilters}
        activeFilters={filters}
        onFilterChange={f => { setFilters(f); setPagination(p => ({ ...p, page: 1 })); }}
        searchValue={search}
        onSearchChange={v => { setSearch(v); setPagination(p => ({ ...p, page: 1 })); }}
        searchPlaceholder="Tìm sản phẩm, kho, lý do..."
      />

      <DataTable<StockMovement>
        data={data}
        columns={movementColumns}
        totalItems={total}
        pagination={pagination}
        sort={sort}
        onPaginationChange={setPagination}
        onSortChange={setSort}
        getId={m => m.id}
        loading={loading}
        viewModes={['table']}
        defaultViewMode="table"
        renderActions={item => (
          item.type === 'Xuất kho' ? (
            <Button variant="ghost" size="sm" onClick={e => { e.stopPropagation(); setShowPrint(item); }}>
              <Printer className="h-4 w-4" />
            </Button>
          ) : null
        )}
      />

      {/* Form tạo xuất nhập kho (17B.01, 17B.02, 17B.03) */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {formType === 'Nhập kho' && 'Tạo phiếu nhập kho'}
              {formType === 'Xuất kho' && 'Tạo phiếu xuất kho'}
              {formType === 'Chuyển kho' && 'Tạo phiếu chuyển kho'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto px-1">
            <div><Label>Sản phẩm *</Label><Input value={formData.productName} onChange={e => setFormData(f => ({ ...f, productName: e.target.value }))} placeholder="Tên sản phẩm" /></div>
            <div><Label>Kho {formType === 'Chuyển kho' ? 'nguồn' : ''} *</Label><Input value={formData.warehouseName} onChange={e => setFormData(f => ({ ...f, warehouseName: e.target.value }))} placeholder="Tên kho" /></div>

            {formType === 'Chuyển kho' && (
              <div><Label>Kho đích *</Label><Input value={formData.toWarehouseName} onChange={e => setFormData(f => ({ ...f, toWarehouseName: e.target.value }))} placeholder="Tên kho đích" /></div>
            )}

            <div><Label>Số lượng *</Label><Input type="number" min={1} value={formData.quantity} onChange={e => setFormData(f => ({ ...f, quantity: e.target.value }))} /></div>
            <div><Label>Lý do</Label><Textarea value={formData.reason} onChange={e => setFormData(f => ({ ...f, reason: e.target.value }))} placeholder="Ghi chú lý do..." /></div>

            {/* 17B.01: Form nhập kho nâng cao */}
            {formType === 'Nhập kho' && (
              <>
                <div><Label>NCC gốc</Label><Input value={formData.supplierOrigin} onChange={e => setFormData(f => ({ ...f, supplierOrigin: e.target.value }))} placeholder="Tên nhà cung cấp" /></div>
                <div><Label>Số hoá đơn nhập</Label><Input value={formData.invoiceNumber} onChange={e => setFormData(f => ({ ...f, invoiceNumber: e.target.value }))} placeholder="HĐ-XXXX" /></div>
                <div><Label>Ngày nhập</Label><Input type="date" value={formData.importDate} onChange={e => setFormData(f => ({ ...f, importDate: e.target.value }))} /></div>
              </>
            )}

            {/* 17B.02: Form xuất kho nâng cao */}
            {formType === 'Xuất kho' && (
              <>
                <div><Label>Đơn hàng liên kết</Label><Input value={formData.linkedOrderId} onChange={e => setFormData(f => ({ ...f, linkedOrderId: e.target.value }))} placeholder="Mã đơn hàng" /></div>
                <div><Label>Người nhận</Label><Input value={formData.receiverName} onChange={e => setFormData(f => ({ ...f, receiverName: e.target.value }))} placeholder="Tên người nhận" /></div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)}>Huỷ</Button>
            <Button onClick={handleCreateMovement}>Tạo phiếu</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 17B.04: Biểu đồ xuất nhập theo tháng */}
      <Dialog open={showChart} onOpenChange={setShowChart}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Xuất nhập kho theo tháng</DialogTitle>
          </DialogHeader>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <RTooltip formatter={(v: number) => formatNumber(v)} />
              <Legend />
              <Bar dataKey="nhapKho" name="Nhập kho" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="xuatKho" name="Xuất kho" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowChart(false)}>Đóng</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 17B.05: In phiếu xuất kho */}
      <Dialog open={!!showPrint} onOpenChange={() => setShowPrint(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Phiếu xuất kho</DialogTitle>
          </DialogHeader>
          {showPrint && (
            <div className="space-y-4 border rounded-lg p-4" id="print-area">
              <div className="text-center">
                <h3 className="text-lg">PHIẾU XUẤT KHO</h3>
                <p className="text-muted-foreground">Ngày: {showPrint.createdAt}</p>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><strong>Kho:</strong> {showPrint.warehouseName}</div>
                <div><strong>Người thực hiện:</strong> {showPrint.performedBy}</div>
                {showPrint.receiverName && <div><strong>Người nhận:</strong> {showPrint.receiverName}</div>}
                {showPrint.linkedOrderId && <div><strong>Đơn hàng:</strong> {showPrint.linkedOrderId}</div>}
              </div>
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Sản phẩm</th>
                    <th className="text-right py-2">Số lượng</th>
                    <th className="text-right py-2">Tồn trước</th>
                    <th className="text-right py-2">Tồn sau</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-2">{showPrint.productName}</td>
                    <td className="text-right">{Math.abs(showPrint.quantity)}</td>
                    <td className="text-right">{showPrint.previousStock}</td>
                    <td className="text-right">{showPrint.newStock}</td>
                  </tr>
                </tbody>
              </table>
              <div><strong>Lý do:</strong> {showPrint.reason}</div>
              <div className="grid grid-cols-2 gap-8 pt-4 text-center text-sm">
                <div>
                  <p>Người xuất</p>
                  <p className="mt-8">{showPrint.performedBy}</p>
                </div>
                <div>
                  <p>Người nhận</p>
                  <p className="mt-8">{showPrint.receiverName ?? '___________'}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPrint(null)}>Đóng</Button>
            <Button onClick={() => {
              window.print();
              toast.success('Đang in phiếu xuất kho...');
            }}>
              <Printer className="h-4 w-4 mr-1" /> In phiếu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ========================== TAB 4: Cảnh báo (Nâng cao) ==========================
function AlertTab() {
  const [alerts, setAlerts] = useState<StockAlert[]>([]);
  const [slowMoving, setSlowMoving] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      stockAlertApi.getAll(),
      inventoryApi.getSlowMoving(90),
    ]).then(([a, sm]) => {
      setAlerts(a);
      setSlowMoving(sm);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-8 text-muted-foreground">Đang tải...</div>;

  const standardAlerts = alerts.filter(a => a.alertType !== 'slow_moving');

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-xl text-red-500">{alerts.filter(a => a.status === 'Hết').length}</p>
            <p className="text-muted-foreground">Hết hàng</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-xl text-yellow-500">{alerts.filter(a => a.status === 'Thấp').length}</p>
            <p className="text-muted-foreground">Sắp hết</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-xl text-orange-500">{slowMoving.length}</p>
            <p className="text-muted-foreground">Tồn đọng (&gt;90 ngày)</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-xl">{alerts.length + slowMoving.length}</p>
            <p className="text-muted-foreground">Tổng cảnh báo</p>
          </CardContent>
        </Card>
      </div>

      {/* Hết hàng / Sắp hết */}
      <div>
        <h3 className="flex items-center gap-2 mb-3">
          <AlertTriangle className="h-5 w-5 text-red-500" /> Cảnh báo tồn kho ({standardAlerts.length})
        </h3>
        {standardAlerts.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">Không có cảnh báo tồn kho</p>
        ) : (
          <div className="space-y-3">
            {standardAlerts.map(a => (
              <Card key={a.id} className={`border-l-4 ${
                a.status === 'Hết' ? 'border-l-red-500 bg-red-50/50 dark:bg-red-950/10' :
                'border-l-yellow-500 bg-yellow-50/50 dark:bg-yellow-950/10'
              }`}>
                <CardContent className="p-4 flex items-center gap-4">
                  <AlertTriangle className={`h-6 w-6 shrink-0 ${a.status === 'Hết' ? 'text-red-500' : 'text-yellow-500'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{a.productName}</p>
                    <p className="text-muted-foreground">{a.warehouseName} · Tồn: {a.currentStock} / Tối thiểu: {a.minStock}</p>
                  </div>
                  <StatusBadge status={a.status} />
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* 17A.03: Cảnh báo SP tồn đọng */}
      <div>
        <h3 className="flex items-center gap-2 mb-3">
          <Clock className="h-5 w-5 text-orange-500" /> Sản phẩm tồn đọng (&gt; 90 ngày không bán) ({slowMoving.length})
        </h3>
        {slowMoving.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">Không có sản phẩm tồn đọng</p>
        ) : (
          <div className="space-y-3">
            {slowMoving.map(item => (
              <Card key={item.id} className="border-l-4 border-l-orange-500 bg-orange-50/50 dark:bg-orange-950/10">
                <CardContent className="p-4 flex items-center gap-4">
                  <TrendingDown className="h-6 w-6 shrink-0 text-orange-500" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{item.productName}</p>
                    <p className="text-muted-foreground">{item.warehouseName} · Tồn: {item.currentStock} · Giá trị: {formatPrice(item.totalValue)}</p>
                    <p className="text-muted-foreground">Bán lần cuối: {item.lastSoldDate} · Tốc độ bán: {item.salesVelocity} SP/tháng</p>
                  </div>
                  <div className="text-right shrink-0">
                    <Badge variant="outline" className="border-orange-500 text-orange-600">
                      {item.daysInStock} ngày
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ========================== MAIN COMPONENT ==========================
export function SellerWarehouse() {
  return (
    <div className="space-y-6">
      <AppBreadcrumb items={[{ label: 'Kênh người bán', href: '/seller' }, { label: 'Kho hàng' }]} />

      <div>
        <h1>Quản lý kho hàng</h1>
        <p className="text-muted-foreground">Quản lý kho, tồn kho thông minh, xuất nhập và cảnh báo</p>
      </div>

      <Tabs defaultValue="warehouses">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="warehouses" className="flex items-center gap-1">
            <WarehouseIcon className="h-4 w-4" /> Kho
          </TabsTrigger>
          <TabsTrigger value="inventory" className="flex items-center gap-1">
            <Package className="h-4 w-4" /> Tồn kho
          </TabsTrigger>
          <TabsTrigger value="movements" className="flex items-center gap-1">
            <ArrowDownUp className="h-4 w-4" /> Xuất nhập
          </TabsTrigger>
          <TabsTrigger value="transfers" className="flex items-center gap-1">
            <ArrowRightLeft className="h-4 w-4" /> Chuyển kho
          </TabsTrigger>
          <TabsTrigger value="alerts" className="flex items-center gap-1">
            <AlertTriangle className="h-4 w-4" /> Cảnh báo
          </TabsTrigger>
        </TabsList>
        <TabsContent value="warehouses"><WarehouseTab /></TabsContent>
        <TabsContent value="inventory"><InventoryTab /></TabsContent>
        <TabsContent value="movements"><MovementTab /></TabsContent>
        <TabsContent value="alerts"><AlertTab /></TabsContent>
        <TabsContent value="transfers"><SellerWarehouseTransferTab /></TabsContent>
      </Tabs>
    </div>
  );
}
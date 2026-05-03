// ============================================================
// Danh sach san pham Seller — Thumbnail, stock dot, batch actions, kanban
// P4.11–P4.14
// ============================================================

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router';
import {
  Plus, Trash2, Package, CheckCircle2, Clock, AlertTriangle, FileUp, Download,
  EyeOff, DollarSign, LayoutGrid, List, Columns,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { DataTable } from '../shared/DataTable';
import { FilterBar } from '../shared/FilterBar';
import { StatusBadge } from '../shared/StatusBadge';
import { AppBreadcrumb } from '../shared/AppBreadcrumb';
import { productApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';
import { ImportDialog } from '../shared/ImportDialog';
import { exportToCSV } from '../../utils/exportUtils';
import type { Product, PaginationParams, SortParams, ActiveFilter, FilterConfig, ColumnConfig } from '../../types';
import { Card, CardContent } from '../ui/card';
import { Checkbox } from '../ui/checkbox';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '../ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';

const formatPrice = (price: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

// P4.12: Stock indicator dot
function StockDot({ stock }: { stock: number }) {
  if (stock <= 0) return <span className="inline-block h-2.5 w-2.5 rounded-full bg-red-500 shrink-0" title="Hết hàng" />;
  if (stock <= 10) return <span className="inline-block h-2.5 w-2.5 rounded-full bg-yellow-500 shrink-0" title="Tồn kho thấp" />;
  return <span className="inline-block h-2.5 w-2.5 rounded-full bg-green-500 shrink-0" title="Còn hàng" />;
}

// P4.14: Kanban statuses
const KANBAN_STATUS_MAP: Record<string, { label: string; color: string; borderColor: string }> = {
  'Chờ duyệt': { label: 'Chờ duyệt', color: 'text-yellow-600', borderColor: 'border-t-yellow-500' },
  'Đã duyệt': { label: 'Đã duyệt', color: 'text-green-600', borderColor: 'border-t-green-500' },
  'Hết hàng': { label: 'Hết hàng', color: 'text-red-600', borderColor: 'border-t-red-500' },
  'Ẩn': { label: 'Ẩn', color: 'text-gray-500', borderColor: 'border-t-gray-400' },
};

// P4.11: Enhanced columns with thumbnail + stock dot
const enhancedColumns: ColumnConfig[] = [
  {
    key: 'name', label: 'Sản phẩm', visible: true, sortable: true, editable: true, type: 'text' as const,
    render: (p: Product) => (
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg overflow-hidden bg-muted shrink-0">
          <ImageWithFallback src={p.images?.[0]} alt={p.name} className="h-full w-full object-cover" />
        </div>
        <div className="min-w-0">
          <p className="truncate">{p.name}</p>
          <p className="text-xs text-muted-foreground truncate">{p.categoryName}</p>
        </div>
      </div>
    ),
  },
  {
    key: 'price', label: 'Giá', visible: true, sortable: true, editable: true, type: 'number' as const,
    render: (p: Product) => <span className="text-primary">{formatPrice(p.price)}</span>,
  },
  {
    key: 'minOrderQty', label: 'MOQ / Tồn', visible: true, sortable: true,
    render: (p: Product) => {
      const totalStock = p.variants.reduce((s, v) => s + v.stock, 0);
      return (
        <div className="flex items-center gap-2">
          <StockDot stock={totalStock} />
          <span>{totalStock} ton · {p.minOrderQty} MOQ</span>
        </div>
      );
    },
  },
  {
    key: 'status', label: 'Trạng thái', visible: true, sortable: true, editable: true,
    type: 'select' as const, options: ['Chờ duyệt', 'Đã duyệt', 'Hết hàng', 'Ẩn'],
    render: (p: Product) => <StatusBadge status={p.status} />,
  },
  { key: 'rating', label: 'Đánh giá', visible: true, sortable: true },
  { key: 'createdAt', label: 'Ngày tạo', visible: true, sortable: true },
];

const filterConfigs: FilterConfig[] = [
  { key: 'status', label: 'Trạng thái', type: 'select', options: [
    { label: 'Chờ duyệt', value: 'Chờ duyệt' },
    { label: 'Đã duyệt', value: 'Đã duyệt' },
    { label: 'Hết hàng', value: 'Hết hàng' },
    { label: 'Ẩn', value: 'Ẩn' },
  ]},
];

export function SellerProductList() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationParams>({ page: 1, pageSize: 10 });
  const [sort, setSort] = useState<SortParams>({ field: '', direction: 'asc' });
  const [filters, setFilters] = useState<ActiveFilter[]>([]);
  const [search, setSearch] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showBulkDelete, setShowBulkDelete] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'grid' | 'kanban'>('table');
  const [bulkPriceOpen, setBulkPriceOpen] = useState(false);
  const [bulkPricePercent, setBulkPricePercent] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const allFilters = [...filters];
      if (user?.supplierId) {
        allFilters.push({ key: 'supplierId', value: user.supplierId });
      }
      const supplierFilter: ActiveFilter[] = user?.supplierId
        ? [{ key: 'supplierId', value: user.supplierId }]
        : [];
      const [allRes, pageRes] = await Promise.all([
        productApi.getPaginated({ page: 1, pageSize: 1000 }, undefined, supplierFilter),
        productApi.getPaginated(pagination, sort.field ? sort : undefined, allFilters, search),
      ]);
      setAllProducts(allRes.data);
      setProducts(pageRes.data);
      setTotal(pageRes.total);
    } finally {
      setLoading(false);
    }
  }, [pagination, sort, filters, search, user]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Stats
  const stats = useMemo(() => ({
    total: allProducts.length,
    approved: allProducts.filter(p => p.status === 'Đã duyệt').length,
    pending: allProducts.filter(p => p.status === 'Chờ duyệt').length,
    outOfStock: allProducts.filter(p => p.status === 'Hết hàng').length,
  }), [allProducts]);

  const handleInlineEdit = async (id: string, field: string, value: unknown) => {
    await productApi.update(id, { [field]: value } as Partial<Product>);
    setProducts(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
    toast.success('Đã cập nhật');
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await productApi.delete(deleteId);
    setProducts(prev => prev.filter(p => p.id !== deleteId));
    setTotal(prev => prev - 1);
    setDeleteId(null);
    setSelectedIds(prev => prev.filter(id => id !== deleteId));
    toast.success('Đã xóa sản phẩm');
  };

  const handleBulkDelete = async () => {
    for (const id of selectedIds) { await productApi.delete(id); }
    setProducts(prev => prev.filter(p => !selectedIds.includes(p.id)));
    setTotal(prev => prev - selectedIds.length);
    toast.success(`Đã xóa ${selectedIds.length} sản phẩm`);
    setSelectedIds([]);
    setShowBulkDelete(false);
  };

  // P4.13: Batch hide
  const handleBulkHide = async () => {
    for (const id of selectedIds) {
      await productApi.update(id, { status: 'Ẩn' } as Partial<Product>);
    }
    toast.success(`Đã ẩn ${selectedIds.length} sản phẩm`);
    setSelectedIds([]);
    fetchData();
  };

  // P4.13: Batch price change
  const handleBulkPriceChange = async () => {
    const pct = parseFloat(bulkPricePercent);
    if (isNaN(pct)) { toast.error('Vui lòng nhập % hợp lệ'); return; }
    for (const id of selectedIds) {
      const prod = products.find(p => p.id === id);
      if (prod) {
        const newPrice = Math.round(prod.price * (1 + pct / 100));
        await productApi.update(id, { price: newPrice } as Partial<Product>);
      }
    }
    toast.success(`Đã cập nhật giá ${selectedIds.length} sản phẩm (${pct > 0 ? '+' : ''}${pct}%)`);
    setSelectedIds([]);
    setBulkPriceOpen(false);
    setBulkPricePercent('');
    fetchData();
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    const ids = products.map(p => p.id);
    const all = ids.every(id => selectedIds.includes(id));
    if (all) setSelectedIds(prev => prev.filter(id => !ids.includes(id)));
    else setSelectedIds(prev => [...new Set([...prev, ...ids])]);
  };

  const allPageSelected = products.length > 0 && products.every(p => selectedIds.includes(p.id));

  // P4.14: Kanban grouped data
  const kanbanGroups = useMemo(() => {
    const statuses = ['Chờ duyệt', 'Đã duyệt', 'Hết hàng', 'Ẩn'];
    return statuses.map(status => ({
      status,
      items: allProducts.filter(p => p.status === status),
    }));
  }, [allProducts]);

  const renderGridCard = (product: Product) => (
    <Card className="hover:shadow-lg transition-all duration-300 h-full relative group hover:-translate-y-0.5 overflow-hidden border-0 shadow-sm">
      <div className="h-0.5 w-0 group-hover:w-full bg-gradient-to-r from-[#e31837] to-[#c91432] transition-all duration-500" />
      <div className="absolute top-2 left-2 z-10">
        <Checkbox
          checked={selectedIds.includes(product.id)}
          onCheckedChange={() => toggleSelect(product.id)}
          onClick={(e: React.MouseEvent) => e.stopPropagation()}
        />
      </div>
      <div className="aspect-[4/3] overflow-hidden rounded-t-lg">
        <ImageWithFallback src={product.images[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
      </div>
      <CardContent className="p-3">
        <p className="line-clamp-1 mb-1 font-semibold text-sm">{product.name}</p>
        <p className="text-[#e31837] font-bold mb-1.5">{formatPrice(product.price)}</p>
        <div className="flex items-center justify-between">
          <StatusBadge status={product.status} />
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 hover:bg-destructive/10"
            onClick={e => { e.stopPropagation(); setDeleteId(product.id); }}>
            <Trash2 className="h-3 w-3 text-destructive" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-4">
      <AppBreadcrumb items={[{ label: 'Kênh người bán', href: '/seller' }, { label: 'Sản phẩm' }]} />

      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#e31837] to-[#c91432] flex items-center justify-center shadow-md shrink-0">
            <Package className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="font-black" style={{ fontFamily: 'var(--font-heading)' }}>Quản lý sản phẩm</h1>
            <p className="text-muted-foreground text-sm">Thêm, sửa, xóa sản phẩm của bạn</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* P4.13: Batch actions */}
          {selectedIds.length > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-slate-800 to-slate-700 text-white shadow-lg">
              <span className="text-xs font-semibold text-slate-300">{selectedIds.length} đã chọn</span>
              <div className="w-px h-4 bg-white/20 mx-1" />
              <button className="h-7 px-2.5 rounded-lg bg-white/10 hover:bg-red-500/80 text-xs flex items-center gap-1 transition-colors" onClick={() => setShowBulkDelete(true)}>
                <Trash2 className="h-3 w-3" /> Xóa
              </button>
              <button className="h-7 px-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs flex items-center gap-1 transition-colors" onClick={handleBulkHide}>
                <EyeOff className="h-3 w-3" /> Ẩn
              </button>
              <button className="h-7 px-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs flex items-center gap-1 transition-colors" onClick={() => setBulkPriceOpen(true)}>
                <DollarSign className="h-3 w-3" /> Đổi giá
              </button>
            </div>
          )}
          <Button onClick={() => navigate('/seller/products/new')} className="bg-gradient-to-r from-[#e31837] to-[#c91432] border-0 shadow-md hover:shadow-lg">
            <Plus className="mr-2 h-4 w-4" /> Thêm sản phẩm
          </Button>
          <Button variant="outline" size="sm" onClick={() => exportToCSV(allProducts as unknown as Record<string, unknown>[], [
            { key: 'name', label: 'Tên SP' }, { key: 'categoryName', label: 'Danh mục' },
            { key: 'price', label: 'Giá' }, { key: 'minOrderQty', label: 'MOQ' },
            { key: 'status', label: 'Trạng thái' }, { key: 'createdAt', label: 'Ngày tạo' },
          ], 'san-pham')}>
            <Download className="mr-1 h-4 w-4" /> Xuất CSV
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowImport(true)}>
            <FileUp className="mr-1 h-4 w-4" /> Nhập CSV
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Tổng SP', value: stats.total, icon: Package, gradient: 'from-blue-500 to-indigo-600' },
          { label: 'Đã duyệt', value: stats.approved, icon: CheckCircle2, gradient: 'from-emerald-500 to-teal-600' },
          { label: 'Chờ duyệt', value: stats.pending, icon: Clock, gradient: 'from-amber-500 to-orange-500' },
          { label: 'Hết hàng', value: stats.outOfStock, icon: AlertTriangle, gradient: 'from-red-500 to-rose-600' },
        ].map(stat => (
          <Card key={stat.label} className="border-0 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 group">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <span className="text-sm text-muted-foreground font-medium">{stat.label}</span>
                <div className={`h-9 w-9 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow`}>
                  <stat.icon className="h-4 w-4 text-white" />
                </div>
              </div>
              <p className="text-2xl font-black" style={{ fontFamily: 'var(--font-heading)' }}>{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filter + View Toggle */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <FilterBar
            filters={filterConfigs}
            activeFilters={filters}
            onFilterChange={f => { setFilters(f); setPagination(p => ({ ...p, page: 1 })); }}
            searchValue={search}
            onSearchChange={v => { setSearch(v); setPagination(p => ({ ...p, page: 1 })); }}
            searchPlaceholder="Tìm sản phẩm..."
          >
            <div className="hidden md:flex items-center gap-2 ml-2">
              <Checkbox checked={allPageSelected} onCheckedChange={toggleSelectAll} />
              <span className="text-muted-foreground">Chọn trang</span>
            </div>
          </FilterBar>
        </div>
        {/* P4.14: View mode toggle */}
        <div className="flex gap-1 border rounded-lg p-0.5 shrink-0 self-start">
          <Button variant={viewMode === 'table' ? 'secondary' : 'ghost'} size="sm" className="h-8 px-3" onClick={() => setViewMode('table')}>
            <List className="h-4 w-4 mr-1" /> Bảng
          </Button>
          <Button variant={viewMode === 'grid' ? 'secondary' : 'ghost'} size="sm" className="h-8 px-3" onClick={() => setViewMode('grid')}>
            <LayoutGrid className="h-4 w-4 mr-1" /> Lưới
          </Button>
          <Button variant={viewMode === 'kanban' ? 'secondary' : 'ghost'} size="sm" className="h-8 px-3" onClick={() => setViewMode('kanban')}>
            <Columns className="h-4 w-4 mr-1" /> Kanban
          </Button>
        </div>
      </div>

      {/* Content by view mode */}
      {viewMode === 'kanban' ? (
        // P4.14: Kanban View
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kanbanGroups.map(group => (
            <div key={group.status} className="space-y-2">
              <div className={`border-t-4 ${KANBAN_STATUS_MAP[group.status]?.borderColor ?? 'border-t-gray-300'} rounded-t-lg bg-muted/30 p-3`}>
                <div className="flex items-center justify-between">
                  <span className={KANBAN_STATUS_MAP[group.status]?.color}>{group.status}</span>
                  <Badge variant="secondary">{group.items.length}</Badge>
                </div>
              </div>
              <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                {group.items.slice(0, 8).map(p => (
                  <Card key={p.id} className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => navigate(`/seller/products/${p.id}`)}>
                    <CardContent className="p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="h-8 w-8 rounded bg-muted overflow-hidden shrink-0">
                          <ImageWithFallback src={p.images?.[0]} alt={p.name} className="h-full w-full object-cover" />
                        </div>
                        <p className="text-sm truncate flex-1">{p.name}</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-primary text-sm">{formatPrice(p.price)}</span>
                        <div className="flex items-center gap-1">
                          <StockDot stock={p.variants.reduce((s, v) => s + v.stock, 0)} />
                          <span className="text-xs text-muted-foreground">{p.variants.reduce((s, v) => s + v.stock, 0)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {group.items.length === 0 && (
                  <p className="text-center text-muted-foreground py-4 text-sm">Không có sản phẩm</p>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <DataTable
          data={products}
          columns={enhancedColumns}
          totalItems={total}
          pagination={pagination}
          sort={sort}
          onPaginationChange={setPagination}
          onSortChange={setSort}
          onInlineEdit={handleInlineEdit}
          onRowClick={p => navigate(`/seller/products/${p.id}`)}
          getId={p => p.id}
          renderGridCard={viewMode === 'grid' ? renderGridCard : undefined}
          loading={loading}
        />
      )}

      {/* Xác nhận xóa đơn */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa sản phẩm?</AlertDialogTitle>
            <AlertDialogDescription>Hành động này không thể hoàn tác.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Xóa</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Xác nhận xóa hàng loạt */}
      <AlertDialog open={showBulkDelete} onOpenChange={setShowBulkDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa {selectedIds.length} sản phẩm?</AlertDialogTitle>
            <AlertDialogDescription>Bạn đã chọn {selectedIds.length} sản phẩm để xóa. Không thể hoàn tác.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkDelete}>Xóa tất cả</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* P4.13: Bulk price change dialog */}
      <Dialog open={bulkPriceOpen} onOpenChange={setBulkPriceOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Đổi giá hàng loạt</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Áp dụng cho {selectedIds.length} sản phẩm đã chọn. Nhập % thay đổi (VD: 10 để tăng 10%, -5 để giảm 5%).
            </p>
            <Input
              type="number"
              value={bulkPricePercent}
              onChange={e => setBulkPricePercent(e.target.value)}
              placeholder="Nhập % thay đổi..."
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkPriceOpen(false)}>Hủy</Button>
            <Button onClick={handleBulkPriceChange}>Áp dụng</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import CSV Dialog */}
      <ImportDialog
        open={showImport}
        onClose={() => setShowImport(false)}
        title="Nhập sản phẩm từ CSV"
        columns={[
          { key: 'name', label: 'Tên sản phẩm', required: true },
          { key: 'sku', label: 'SKU', required: false },
          { key: 'categoryName', label: 'Danh mục', required: false },
          { key: 'price', label: 'Giá', required: true, validate: v => isNaN(Number(v)) ? 'Phải là số' : null },
          { key: 'description', label: 'Mô tả', required: false },
          { key: 'minOrderQty', label: 'Tối thiểu đặt hàng', required: false },
          { key: 'unit', label: 'Đơn vị', required: false },
        ]}
        onImport={async (data) => {
          await new Promise(r => setTimeout(r, 500));
          fetchData();
          return { success: data.length, failed: 0, skipped: 0, errors: [], data };
        }}
        templateSample={[
          ['Arduino Uno R3', 'SKU001', 'Điện tử', '250000', 'Board vi điều khiển', '5', 'Cái'],
          ['Cảm biến DS18B20', 'SKU002', 'Điện tử', '35000', 'Cảm biến nhiệt', '10', 'Cái'],
        ]}
      />
    </div>
  );
}
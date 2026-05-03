// ============================================================
// Duyệt sản phẩm — Batch actions, search, preview, detail
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import { CheckCircle, XCircle, Eye, Download } from 'lucide-react';
import { Button } from '../ui/button';
import { DataTable } from '../shared/DataTable';
import { FilterBar } from '../shared/FilterBar';
import { StatusBadge } from '../shared/StatusBadge';
import { AppBreadcrumb } from '../shared/AppBreadcrumb';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { ScrollArea } from '../ui/scroll-area';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { productApi } from '../../services/api';
import { toast } from 'sonner';
import type { Product, PaginationParams, SortParams, ActiveFilter, FilterConfig, ColumnConfig } from '../../types';
import { ImageWithFallback } from '../figma/ImageWithFallback';

const formatPrice = (price: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

const columns: ColumnConfig[] = [
  { key: 'name', label: 'Tên sản phẩm', visible: true, sortable: true },
  { key: 'categoryName', label: 'Danh mục', visible: true, sortable: true },
  { key: 'supplierName', label: 'Nhà cung cấp', visible: true, sortable: true },
  { key: 'price', label: 'Giá', visible: true, sortable: true },
  { key: 'minOrderQty', label: 'MOQ', visible: true, sortable: true },
  { key: 'status', label: 'Trạng thái', visible: true, sortable: true },
  { key: 'createdAt', label: 'Ngày nộp', visible: true, sortable: true },
];

const filterConfigs: FilterConfig[] = [
  { key: 'status', label: 'Trạng thái', type: 'select', options: [
    { label: 'Chờ duyệt', value: 'Chờ duyệt' },
    { label: 'Đã duyệt', value: 'Đã duyệt' },
    { label: 'Từ chối', value: 'Từ chối' },
    { label: 'Hết hàng', value: 'Hết hàng' },
    { label: 'Ẩn', value: 'Ẩn' },
  ]},
];

export function ProductApproval() {
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationParams>({ page: 1, pageSize: 10 });
  const [sort, setSort] = useState<SortParams>({ field: 'createdAt', direction: 'desc' });
  const [filters, setFilters] = useState<ActiveFilter[]>([]);
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [previewProduct, setPreviewProduct] = useState<Product | null>(null);
  const [rejectDialog, setRejectDialog] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [allProducts, setAllProducts] = useState<Product[]>([]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [allRes, res] = await Promise.all([
        productApi.getPaginated({ page: 1, pageSize: 1000 }, undefined, undefined, ''),
        productApi.getPaginated(pagination, sort.field ? sort : undefined, filters, search),
      ]);
      setAllProducts(allRes.data);
      setProducts(res.data);
      setTotal(res.total);
    } finally {
      setLoading(false);
    }
  }, [pagination, sort, filters, search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleApprove = async (id: string) => {
    await productApi.update(id, { status: 'Đã duyệt' });
    setProducts(prev => prev.map(p => p.id === id ? { ...p, status: 'Đã duyệt' } : p));
    toast.success('Đã duyệt sản phẩm');
  };

  const handleReject = async (id: string) => {
    setRejectDialog(id);
  };

  const confirmReject = async () => {
    if (!rejectDialog) return;
    if (!rejectReason.trim()) { toast.error('Vui lòng nhập lý do từ chối'); return; }
    await productApi.update(rejectDialog, { status: 'Từ chối' });
    setProducts(prev => prev.map(p => p.id === rejectDialog ? { ...p, status: 'Từ chối' } : p));
    if (previewProduct?.id === rejectDialog) setPreviewProduct(prev => prev ? { ...prev, status: 'Từ chối' } : null);
    setRejectDialog(null);
    setRejectReason('');
    toast.success('Đã từ chối sản phẩm');
  };

  // CSV Export
  const handleExportCSV = () => {
    const headers = ['Tên SP', 'Danh mục', 'NCC', 'Giá', 'MOQ', 'Trạng thái', 'Ngày nộp'];
    const rows = allProducts.map(p => [p.name, p.categoryName, p.supplierName, p.price.toString(), p.minOrderQty.toString(), p.status, p.createdAt]);
    const csvContent = [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `san-pham-${new Date().toISOString().slice(0, 10)}.csv`; a.click();
    URL.revokeObjectURL(url);
    toast.success('Đã xuất file CSV');
  };

  // Batch approval
  const handleBatchApprove = async () => {
    const ids = Array.from(selectedIds);
    const pending = products.filter(p => ids.includes(p.id) && p.status === 'Chờ duyệt');
    if (pending.length === 0) {
      toast.error('Không có sản phẩm nào đang chờ duyệt');
      return;
    }
    for (const p of pending) {
      await productApi.update(p.id, { status: 'Đã duyệt' });
    }
    setProducts(prev => prev.map(p => ids.includes(p.id) && p.status === 'Chờ duyệt' ? { ...p, status: 'Đã duyệt' } : p));
    setSelectedIds(new Set());
    toast.success(`Đã duyệt ${pending.length} sản phẩm`);
  };

  const handleBatchReject = async () => {
    const ids = Array.from(selectedIds);
    const pending = products.filter(p => ids.includes(p.id) && p.status === 'Chờ duyệt');
    if (pending.length === 0) {
      toast.error('Không có sản phẩm nào đang chờ duyệt');
      return;
    }
    for (const p of pending) {
      await productApi.update(p.id, { status: 'Từ chối' });
    }
    setProducts(prev => prev.map(p => ids.includes(p.id) && p.status === 'Chờ duyệt' ? { ...p, status: 'Từ chối' } : p));
    setSelectedIds(new Set());
    toast.success(`Đã từ chối ${pending.length} sản phẩm`);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === products.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(products.map(p => p.id)));
    }
  };

  const pendingCount = products.filter(p => p.status === 'Chờ duyệt').length;

  const renderListItem = (product: Product) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4 flex gap-4">
        {/* Checkbox */}
        <div className="flex items-center shrink-0">
          <input
            type="checkbox"
            checked={selectedIds.has(product.id)}
            onChange={() => toggleSelect(product.id)}
            className="h-4 w-4 rounded border-muted-foreground"
            onClick={e => e.stopPropagation()}
          />
        </div>
        <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0">
          <ImageWithFallback src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium line-clamp-1">{product.name}</p>
          <p className="text-muted-foreground">{product.supplierName} &bull; {product.categoryName}</p>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-primary">{formatPrice(product.price)}</span>
            <StatusBadge status={product.status} />
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="ghost" size="sm" onClick={e => { e.stopPropagation(); setPreviewProduct(product); }}>
            <Eye className="h-4 w-4" />
          </Button>
          {product.status === 'Chờ duyệt' && (
            <>
              <Button size="sm" onClick={e => { e.stopPropagation(); handleApprove(product.id); }}>
                <CheckCircle className="mr-1 h-4 w-4" /> Duyệt
              </Button>
              <Button size="sm" variant="destructive" onClick={e => { e.stopPropagation(); handleReject(product.id); }}>
                <XCircle className="mr-1 h-4 w-4" /> Từ chối
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-4">
      <AppBreadcrumb items={[{ label: 'Quản trị', href: '/admin' }, { label: 'Duyệt sản phẩm' }]} />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1>Duyệt sản phẩm</h1>
          <p className="text-muted-foreground">
            Xét duyệt sản phẩm mới từ nhà cung cấp
            {pendingCount > 0 && (
              <Badge variant="secondary" className="ml-2">{pendingCount} chờ duyệt</Badge>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExportCSV}>
            <Download className="mr-1 h-4 w-4" /> Xuất CSV
          </Button>
          {/* Batch actions */}
          {selectedIds.size > 0 && (
            <>
              <span className="text-muted-foreground">Đã chọn {selectedIds.size}</span>
              <Button size="sm" onClick={handleBatchApprove}>
                <CheckCircle className="mr-1 h-4 w-4" /> Duyệt tất cả
              </Button>
              <Button size="sm" variant="destructive" onClick={handleBatchReject}>
                <XCircle className="mr-1 h-4 w-4" /> Từ chối tất cả
              </Button>
              <Button size="sm" variant="outline" onClick={() => setSelectedIds(new Set())}>Bỏ chọn</Button>
            </>
          )}
        </div>
      </div>

      <FilterBar
        filters={filterConfigs}
        activeFilters={filters}
        onFilterChange={f => { setFilters(f); setPagination(p => ({ ...p, page: 1 })); }}
        searchValue={search}
        onSearchChange={v => { setSearch(v); setPagination(p => ({ ...p, page: 1 })); }}
        searchPlaceholder="Tìm sản phẩm..."
      />

      {/* Select all toggle */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={products.length > 0 && selectedIds.size === products.length}
          onChange={toggleSelectAll}
          className="h-4 w-4 rounded border-muted-foreground"
        />
        <span className="text-muted-foreground">Chọn tất cả</span>
      </div>

      <DataTable
        data={products}
        columns={columns}
        totalItems={total}
        pagination={pagination}
        sort={sort}
        onPaginationChange={setPagination}
        onSortChange={setSort}
        getId={p => p.id}
        renderListItem={renderListItem}
        loading={loading}
        defaultViewMode="list"
      />

      {/* Product Preview Dialog */}
      <Dialog open={!!previewProduct} onOpenChange={() => setPreviewProduct(null)}>
        <DialogContent className="max-w-lg max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Xem trước sản phẩm</DialogTitle>
          </DialogHeader>
          {previewProduct && (
            <ScrollArea className="max-h-[60vh]">
              <div className="space-y-4">
                {/* Image Gallery */}
                <div className="aspect-video rounded-lg overflow-hidden">
                  <ImageWithFallback
                    src={previewProduct.images[0]}
                    alt={previewProduct.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                {previewProduct.images.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto">
                    {previewProduct.images.slice(1).map((img, i) => (
                      <div key={i} className="w-16 h-16 rounded-lg overflow-hidden shrink-0">
                        <ImageWithFallback src={img} alt={`${previewProduct.name} ${i + 2}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}
                <div>
                  <h3>{previewProduct.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <StatusBadge status={previewProduct.status} />
                    <Badge variant="secondary">{previewProduct.categoryName}</Badge>
                  </div>
                </div>
                <p className="text-primary text-xl">{formatPrice(previewProduct.price)}</p>
                <Separator />
                <div>
                  <p className="text-muted-foreground mb-1">Nhà cung cấp</p>
                  <p>{previewProduct.supplierName}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Mô tả</p>
                  <p>{previewProduct.description || previewProduct.shortDescription}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Thông số kỹ thuật</p>
                  <div className="space-y-1">
                    {Object.entries(previewProduct.specifications).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-muted-foreground">{key}</span>
                        <span>{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
                {previewProduct.status === 'Chờ duyệt' && (
                  <>
                    <Separator />
                    <div className="flex gap-2">
                      <Button className="flex-1" onClick={() => { handleApprove(previewProduct.id); setPreviewProduct(prev => prev ? { ...prev, status: 'Đã duyệt' } : null); }}>
                        <CheckCircle className="mr-1 h-4 w-4" /> Duyệt
                      </Button>
                      <Button className="flex-1" variant="destructive" onClick={() => { handleReject(previewProduct.id); setPreviewProduct(prev => prev ? { ...prev, status: 'Từ chối' } : null); }}>
                        <XCircle className="mr-1 h-4 w-4" /> Từ chối
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject Reason Dialog */}
      <Dialog open={!!rejectDialog} onOpenChange={() => { setRejectDialog(null); setRejectReason(''); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-destructive">Từ chối sản phẩm</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid gap-2">
              <Label>Lý do từ chối *</Label>
              <Textarea
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                placeholder="Nhập lý do từ chối sản phẩm..."
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => { setRejectDialog(null); setRejectReason(''); }}>Huỷ</Button>
              <Button variant="destructive" onClick={confirmReject} disabled={!rejectReason.trim()}>Từ chối</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
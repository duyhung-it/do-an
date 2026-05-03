// ============================================================
// Quản lý khuyến mãi toàn hệ thống Admin
// Stats, Filter, DataTable, Chi tiết, Bật/tắt, Xoá
// ============================================================

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Tag, Percent, TrendingUp, Clock, Download, Power, Trash2, Eye,
} from 'lucide-react';
import { DataTable } from '../shared/DataTable';
import { FilterBar } from '../shared/FilterBar';
import { StatusBadge } from '../shared/StatusBadge';
import { AppBreadcrumb } from '../shared/AppBreadcrumb';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Separator } from '../ui/separator';
import { Badge } from '../ui/badge';
import { promotionApi } from '../../services/api';
import { toast } from 'sonner';
import type {
  Promotion, PaginationParams, SortParams,
  ActiveFilter, FilterConfig, ColumnConfig,
} from '../../types';

const formatPrice = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

// --- Helpers ---
function getPromoStatus(p: Promotion): string {
  if (!p.isActive) return 'Tắt';
  const today = new Date().toISOString().slice(0, 10);
  if (p.startDate > today) return 'Sắp diễn ra';
  if (p.endDate < today) return 'Hết hạn';
  return 'Đang chạy';
}

function getPromoValue(p: Promotion): string {
  if (p.type === 'Phần trăm') return `${p.value}%`;
  if (p.type === 'Số tiền') return formatPrice(p.value);
  if (p.type === 'Mua X tặng Y') return `Tặng ${p.value}`;
  if (p.type === 'Giảm theo số lượng') return `${p.value}%+`;
  return String(p.value);
}

// --- Cấu hình cột ---
const columns: ColumnConfig[] = [
  { key: 'code', label: 'Mã KM', visible: true, sortable: true },
  { key: 'name', label: 'Tên KM', visible: true, sortable: true },
  { key: 'supplierId', label: 'NCC', visible: true, sortable: true },
  { key: 'type', label: 'Loại', visible: true, sortable: true },
  { key: 'value', label: 'Giá trị', visible: true, sortable: true },
  { key: 'startDate', label: 'Bắt đầu', visible: true, sortable: true },
  { key: 'endDate', label: 'Kết thúc', visible: true, sortable: true },
  { key: 'usedCount', label: 'Đã dùng', visible: true, sortable: true },
  { key: 'usageLimit', label: 'Giới hạn', visible: true, sortable: false },
  { key: 'isActive', label: 'Trạng thái', visible: true, sortable: true },
];

// --- Cấu hình bộ lọc ---
const filterConfigs: FilterConfig[] = [
  { key: 'type', label: 'Loại giảm giá', type: 'select', options: [
    { label: 'Phần trăm', value: 'Phần trăm' },
    { label: 'Số tiền', value: 'Số tiền' },
    { label: 'Mua X tặng Y', value: 'Mua X tặng Y' },
    { label: 'Giảm theo SL', value: 'Giảm theo số lượng' },
  ]},
  { key: 'isActive', label: 'Trạng thái', type: 'select', options: [
    { label: 'Đang bật', value: 'true' },
    { label: 'Đã tắt', value: 'false' },
  ]},
];

export function AdminPromotionPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [allPromos, setAllPromos] = useState<Promotion[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationParams>({ page: 1, pageSize: 10 });
  const [sort, setSort] = useState<SortParams>({ field: 'createdAt', direction: 'desc' });
  const [filters, setFilters] = useState<ActiveFilter[]>([]);
  const [search, setSearch] = useState('');
  const [selectedPromo, setSelectedPromo] = useState<Promotion | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [allRes, pageRes] = await Promise.all([
        promotionApi.getPaginated({ page: 1, pageSize: 1000 }),
        promotionApi.getPaginated(pagination, sort.field ? sort : undefined, filters, search || undefined),
      ]);
      setAllPromos(allRes.data);
      setPromotions(pageRes.data);
      setTotal(pageRes.total);
    } finally {
      setLoading(false);
    }
  }, [pagination, sort, filters, search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // --- Stats ---
  const stats = useMemo(() => {
    const running = allPromos.filter(p => getPromoStatus(p) === 'Đang chạy').length;
    const upcoming = allPromos.filter(p => getPromoStatus(p) === 'Sắp diễn ra').length;
    const expired = allPromos.filter(p => getPromoStatus(p) === 'Hết hạn').length;
    const totalUsed = allPromos.reduce((s, p) => s + p.usedCount, 0);
    const highValue = allPromos.filter(p => p.type === 'Phần trăm' && p.value > 50).length;
    return { total: allPromos.length, running, upcoming, expired, totalUsed, highValue };
  }, [allPromos]);

  // --- Toggle active ---
  const handleToggle = async (id: string, isActive: boolean) => {
    await promotionApi.toggleActive(id, isActive);
    setPromotions(prev => prev.map(p => p.id === id ? { ...p, isActive } : p));
    setAllPromos(prev => prev.map(p => p.id === id ? { ...p, isActive } : p));
    if (selectedPromo?.id === id) setSelectedPromo(prev => prev ? { ...prev, isActive } : null);
    toast.success(isActive ? 'Đã bật khuyến mãi' : 'Đã tắt khuyến mãi');
  };

  // --- Delete ---
  const handleDelete = async (id: string) => {
    if (!confirm('Xoá khuyến mãi này? Hành động không thể hoàn tác.')) return;
    await promotionApi.delete(id);
    setPromotions(prev => prev.filter(p => p.id !== id));
    setAllPromos(prev => prev.filter(p => p.id !== id));
    if (selectedPromo?.id === id) setSelectedPromo(null);
    toast.success('Đã xoá khuyến mãi');
    fetchData();
  };

  // --- Export CSV ---
  const handleExportCSV = () => {
    const headers = ['Mã', 'Tên', 'Loại', 'Giá trị', 'Bắt đầu', 'Kết thúc', 'Đã dùng', 'Giới hạn', 'Trạng thái'];
    const rows = allPromos.map(p => [
      p.code, p.name, p.type, String(p.value), p.startDate, p.endDate,
      String(p.usedCount), String(p.usageLimit || '∞'), getPromoStatus(p),
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `khuyen-mai-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Đã xuất file CSV');
  };

  // --- List view ---
  const renderListItem = (promo: Promotion) => {
    const status = getPromoStatus(promo);
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{promo.code}</span>
              <span className="text-muted-foreground">— {promo.name}</span>
            </div>
            <StatusBadge status={status} />
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-muted-foreground">
            <span>{promo.type}: {getPromoValue(promo)}</span>
            <span>{promo.startDate} → {promo.endDate}</span>
            <span>Đã dùng: {promo.usedCount}/{promo.usageLimit || '∞'}</span>
          </div>
          {status === 'Đang chạy' && promo.type === 'Phần trăm' && promo.value > 50 && (
            <Badge variant="outline" className="mt-2 text-orange-600 border-orange-200 bg-orange-50">
              ⚠ Giảm giá cao ({promo.value}%)
            </Badge>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-4">
      <AppBreadcrumb items={[{ label: 'Quản trị', href: '/admin' }, { label: 'Khuyến mãi' }]} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1>Quản lý khuyến mãi</h1>
          <p className="text-muted-foreground">Giám sát tất cả khuyến mãi trên hệ thống</p>
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
              <span className="text-muted-foreground">Tổng KM</span>
              <Tag className="h-4 w-4 text-blue-500" />
            </div>
            <p className="text-xl">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-muted-foreground">Đang chạy</span>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </div>
            <p className="text-xl text-green-600">{stats.running}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-muted-foreground">Sắp diễn ra</span>
              <Clock className="h-4 w-4 text-indigo-500" />
            </div>
            <p className="text-xl">{stats.upcoming}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-muted-foreground">Hết hạn</span>
              <Percent className="h-4 w-4 text-gray-400" />
            </div>
            <p className="text-xl text-muted-foreground">{stats.expired}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-muted-foreground">Tổng lượt dùng</span>
              <TrendingUp className="h-4 w-4 text-orange-500" />
            </div>
            <p className="text-xl">{stats.totalUsed.toLocaleString('vi-VN')}</p>
          </CardContent>
        </Card>
      </div>

      {/* Cảnh báo */}
      {stats.highValue > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-3 flex items-center gap-2 text-orange-700">
            <Percent className="h-4 w-4 shrink-0" />
            <span>Có {stats.highValue} khuyến mãi giảm &gt; 50% đang hoạt động — cần kiểm tra.</span>
          </CardContent>
        </Card>
      )}

      {/* --- Filter + Table --- */}
      <FilterBar
        filters={filterConfigs}
        activeFilters={filters}
        onFilterChange={f => { setFilters(f); setPagination(p => ({ ...p, page: 1 })); }}
        searchValue={search}
        onSearchChange={v => { setSearch(v); setPagination(p => ({ ...p, page: 1 })); }}
        searchPlaceholder="Tìm mã, tên khuyến mãi, NCC..."
      />

      <DataTable
        data={promotions}
        columns={columns}
        totalItems={total}
        pagination={pagination}
        sort={sort}
        onPaginationChange={setPagination}
        onSortChange={setSort}
        onRowClick={p => setSelectedPromo(p)}
        getId={p => p.id}
        renderListItem={renderListItem}
        loading={loading}
        viewModes={['table', 'list']}
        renderActions={(p: Promotion) => (
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setSelectedPromo(p); }} title="Chi tiết">
              <Eye className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleToggle(p.id, !p.isActive); }}
              title={p.isActive ? 'Tắt' : 'Bật'}>
              <Power className={`h-3.5 w-3.5 ${p.isActive ? 'text-green-600' : 'text-gray-400'}`} />
            </Button>
            <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleDelete(p.id); }} title="Xoá">
              <Trash2 className="h-3.5 w-3.5 text-red-500" />
            </Button>
          </div>
        )}
      />

      {/* --- Chi tiết khuyến mãi --- */}
      <Dialog open={!!selectedPromo} onOpenChange={() => setSelectedPromo(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5" />
              {selectedPromo?.code} — {selectedPromo?.name}
            </DialogTitle>
          </DialogHeader>
          {selectedPromo && (() => {
            const status = getPromoStatus(selectedPromo);
            return (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <StatusBadge status={status} />
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline"
                      onClick={() => handleToggle(selectedPromo.id, !selectedPromo.isActive)}>
                      <Power className="mr-1 h-3.5 w-3.5" />
                      {selectedPromo.isActive ? 'Tắt' : 'Bật'}
                    </Button>
                    <Button size="sm" variant="outline" className="text-red-600"
                      onClick={() => handleDelete(selectedPromo.id)}>
                      <Trash2 className="mr-1 h-3.5 w-3.5" /> Xoá
                    </Button>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-muted-foreground">Loại giảm giá</p>
                    <p>{selectedPromo.type}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Giá trị</p>
                    <p className="text-primary">{getPromoValue(selectedPromo)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Đơn tối thiểu</p>
                    <p>{formatPrice(selectedPromo.minOrderValue)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Giảm tối đa</p>
                    <p>{formatPrice(selectedPromo.maxDiscount)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Bắt đầu</p>
                    <p>{selectedPromo.startDate}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Kết thúc</p>
                    <p>{selectedPromo.endDate}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Đã sử dụng</p>
                    <p>{selectedPromo.usedCount} / {selectedPromo.usageLimit || '∞'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Tỷ lệ sử dụng</p>
                    <p>{selectedPromo.usageLimit
                      ? `${Math.round((selectedPromo.usedCount / selectedPromo.usageLimit) * 100)}%`
                      : 'Không giới hạn'}</p>
                  </div>
                </div>

                {selectedPromo.description && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-muted-foreground">Mô tả</p>
                      <p>{selectedPromo.description}</p>
                    </div>
                  </>
                )}

                {(selectedPromo.applicableCategories.length > 0 || selectedPromo.applicableProducts.length > 0) && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-muted-foreground mb-1">Áp dụng cho</p>
                      <div className="flex flex-wrap gap-1">
                        {selectedPromo.applicableCategories.map(c => (
                          <Badge key={c} variant="secondary">{c}</Badge>
                        ))}
                        {selectedPromo.applicableProducts.map(p => (
                          <Badge key={p} variant="outline">{p}</Badge>
                        ))}
                        {selectedPromo.applicableCategories.length === 0 && selectedPromo.applicableProducts.length === 0 && (
                          <span>Tất cả sản phẩm</span>
                        )}
                      </div>
                    </div>
                  </>
                )}

                {/* Cảnh báo */}
                {selectedPromo.type === 'Phần trăm' && selectedPromo.value > 50 && (
                  <Card className="border-orange-200 bg-orange-50">
                    <CardContent className="p-3 text-orange-700">
                      ⚠ Khuyến mãi giảm giá cao ({selectedPromo.value}%) — cần kiểm tra tính hợp lý.
                    </CardContent>
                  </Card>
                )}
                {!selectedPromo.usageLimit && (
                  <Card className="border-yellow-200 bg-yellow-50">
                    <CardContent className="p-3 text-yellow-700">
                      ⚠ Khuyến mãi không giới hạn số lần sử dụng.
                    </CardContent>
                  </Card>
                )}
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}

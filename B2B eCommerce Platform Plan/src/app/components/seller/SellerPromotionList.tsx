// ============================================================
// Quản lý khuyến mãi — Seller (DataTable + CRUD)
// ============================================================

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Tag, Plus, Pencil, Trash2, Power, PowerOff,
  BarChart3, Download,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { AppBreadcrumb } from '../shared/AppBreadcrumb';
import { StatusBadge } from '../shared/StatusBadge';
import { StatsCard } from '../shared/StatsCard';
import { DataTable } from '../shared/DataTable';
import { FilterBar } from '../shared/FilterBar';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { promotionApi } from '../../services/api';
import { exportToCSV } from '../../utils/exportUtils';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';
import type {
  Promotion, DiscountType,
  PaginationParams, SortParams, ActiveFilter, FilterConfig, ColumnConfig,
} from '../../types';

const formatPrice = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

const DISCOUNT_TYPES: DiscountType[] = ['Phần trăm', 'Số tiền', 'Mua X tặng Y', 'Giảm theo số lượng'];

function getPromoStatus(p: Promotion): string {
  const now = new Date().toISOString().slice(0, 10);
  if (!p.isActive) return 'Tắt';
  if (now < p.startDate) return 'Sắp diễn ra';
  if (now > p.endDate) return 'Hết hạn';
  return 'Đang chạy';
}

const filterConfigs: FilterConfig[] = [
  {
    key: 'type', label: 'Loại', type: 'select', options:
      DISCOUNT_TYPES.map(t => ({ label: t, value: t })),
  },
  {
    key: 'promoStatus', label: 'Trạng thái', type: 'select', options: [
      { label: 'Đang chạy', value: 'Đang chạy' },
      { label: 'Sắp diễn ra', value: 'Sắp diễn ra' },
      { label: 'Hết hạn', value: 'Hết hạn' },
      { label: 'Tắt', value: 'Tắt' },
    ],
  },
];

const columns: ColumnConfig[] = [
  { 
    key: 'code', 
    label: 'Mã', 
    sortable: true, 
    render: (item) => {
      const p = item as Promotion;
      return <span className="font-mono font-medium">{p.code || '—'}</span>;
    }
  },
  {
    key: 'name', label: 'Tên', sortable: true,
    render: (item) => {
      const p = item as Promotion;
      if (!p) return null;
      return (
        <div>
          <p className="font-medium">{p.name || '—'}</p>
          <p className="text-muted-foreground text-xs truncate max-w-48">{p.description || ''}</p>
        </div>
      );
    },
  },
  {
    key: 'type', 
    label: 'Loại', 
    sortable: true,
    render: (item) => {
      const p = item as Promotion;
      return <Badge variant="secondary">{p.type || '—'}</Badge>;
    }
  },
  {
    key: 'value', label: 'Giá trị', sortable: true,
    render: (item) => {
      const p = item as Promotion;
      if (!p) return '—';
      if (p.type === 'Phần trăm') return `${p.value}%`;
      if (p.type === 'Số tiền') return formatPrice(p.value);
      return String(p.value);
    },
  },
  {
    key: 'startDate', label: 'Thời hạn', sortable: true,
    render: (item) => {
      const p = item as Promotion;
      if (!p || !p.startDate || !p.endDate) return '—';
      return <span className="text-muted-foreground text-xs">{p.startDate} → {p.endDate}</span>;
    },
  },
  {
    key: 'usedCount', label: 'Đã dùng', sortable: true,
    render: (item) => {
      const p = item as Promotion;
      if (!p) return '—';
      return `${p.usedCount || 0}${p.usageLimit > 0 ? `/${p.usageLimit}` : ''}`;
    },
  },
  {
    key: 'promoStatus', label: 'Trạng thái',
    render: (item) => {
      const p = item as Promotion;
      if (!p) return null;
      const status = getPromoStatus(p);
      return <StatusBadge status={
        status === 'Đang chạy' ? 'Hoạt động'
        : status === 'Sắp diễn ra' ? 'Chờ xác nhận'
        : status === 'Tắt' ? 'Bị khoá' : 'Hết hạn'
      } />;
    },
  },
];

export function SellerPromotionList() {
  const { user } = useAuth();
  const [allPromotions, setAllPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<ActiveFilter[]>([]);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState<PaginationParams>({ page: 1, pageSize: 10 });
  const [sort, setSort] = useState<SortParams>({});

  // Form
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Promotion | null>(null);
  const [form, setForm] = useState({
    code: '', name: '', description: '', type: 'Phần trăm' as DiscountType,
    value: '', minOrderValue: '', maxDiscount: '',
    startDate: '', endDate: '', usageLimit: '',
  });

  const fetchData = useCallback(async () => {
    if (!user?.supplierId) return;
    setLoading(true);
    try {
      const data = await promotionApi.getBySeller(user.supplierId);
      setAllPromotions(data);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Client-side filter + sort + paginate
  const { pageData, totalItems } = useMemo(() => {
    let data = [...allPromotions];

    if (search) {
      const s = search.toLowerCase();
      data = data.filter(p =>
        p.name.toLowerCase().includes(s) ||
        p.code.toLowerCase().includes(s) ||
        p.description.toLowerCase().includes(s),
      );
    }

    for (const f of filters) {
      if (f.key === 'type') data = data.filter(p => p.type === f.value);
      if (f.key === 'promoStatus') data = data.filter(p => getPromoStatus(p) === f.value);
    }

    if (sort.field) {
      data.sort((a, b) => {
        const va = (a as unknown as Record<string, unknown>)[sort.field!];
        const vb = (b as unknown as Record<string, unknown>)[sort.field!];
        let cmp = 0;
        if (typeof va === 'number' && typeof vb === 'number') cmp = va - vb;
        else cmp = String(va ?? '').localeCompare(String(vb ?? ''));
        return sort.direction === 'desc' ? -cmp : cmp;
      });
    }

    const total = data.length;
    const start = (pagination.page - 1) * pagination.pageSize;
    return { pageData: data.slice(start, start + pagination.pageSize), totalItems: total };
  }, [allPromotions, search, filters, sort, pagination]);

  const stats = useMemo(() => {
    const running = allPromotions.filter(p => getPromoStatus(p) === 'Đang chạy').length;
    const upcoming = allPromotions.filter(p => getPromoStatus(p) === 'Sắp diễn ra').length;
    const expired = allPromotions.filter(p => getPromoStatus(p) === 'Hết hạn').length;
    const totalUsed = allPromotions.reduce((s, p) => s + p.usedCount, 0);
    const totalLimit = allPromotions.reduce((s, p) => s + (p.usageLimit || 0), 0);
    const convRate = totalLimit > 0 ? Math.round((totalUsed / totalLimit) * 100) : 0;
    return [
      { title: 'Đang chạy', value: running, icon: Power, variant: 'success' as const },
      { title: 'Sắp diễn ra', value: upcoming, icon: Tag, variant: 'info' as const },
      { title: 'Hết hạn', value: expired, icon: PowerOff, variant: 'warning' as const },
      { title: `Lượt dùng (${convRate}%)`, value: totalUsed, icon: BarChart3, variant: 'purple' as const },
    ];
  }, [allPromotions]);

  const openCreate = () => {
    setEditing(null);
    const code = `KM${Date.now().toString(36).toUpperCase().slice(-6)}`;
    setForm({
      code, name: '', description: '', type: 'Phần trăm',
      value: '10', minOrderValue: '500000', maxDiscount: '5000000',
      startDate: new Date().toISOString().slice(0, 10),
      endDate: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
      usageLimit: '100',
    });
    setShowForm(true);
  };

  const openEdit = (p: Promotion) => {
    setEditing(p);
    setForm({
      code: p.code, name: p.name, description: p.description, type: p.type,
      value: String(p.value), minOrderValue: String(p.minOrderValue),
      maxDiscount: String(p.maxDiscount), startDate: p.startDate, endDate: p.endDate,
      usageLimit: String(p.usageLimit),
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.code.trim() || !form.name.trim() || !form.value) {
      toast.error('Vui lòng nhập mã, tên và giá trị');
      return;
    }
    try {
      const payload = {
        code: form.code, name: form.name, description: form.description,
        type: form.type, value: Number(form.value),
        minOrderValue: Number(form.minOrderValue || 0),
        maxDiscount: Number(form.maxDiscount || 0),
        startDate: form.startDate, endDate: form.endDate,
        usageLimit: Number(form.usageLimit || 0),
      };
      if (editing) {
        await promotionApi.update(editing.id, payload);
        toast.success('Cập nhật khuyến mãi thành công');
      } else {
        await promotionApi.create({
          ...payload,
          usedCount: 0,
          applicableProducts: [],
          applicableCategories: [],
          supplierId: user?.supplierId ?? '',
          isActive: true,
        });
        toast.success('Tạo khuyến mãi thành công');
      }
      setShowForm(false);
      fetchData();
    } catch {
      toast.error('Có lỗi xảy ra');
    }
  };

  const handleToggle = async (p: Promotion) => {
    try {
      await promotionApi.toggleActive(p.id, !p.isActive);
      toast.success(p.isActive ? 'Đã tắt khuyến mãi' : 'Đã bật khuyến mãi');
      fetchData();
    } catch {
      toast.error('Có lỗi xảy ra');
    }
  };

  const handleDelete = async (p: Promotion) => {
    if (!confirm(`Xoá khuyến mãi "${p.name}"?`)) return;
    try {
      await promotionApi.delete(p.id);
      toast.success('Đã xoá khuyến mãi');
      fetchData();
    } catch {
      toast.error('Có lỗi xảy ra');
    }
  };

  const handleExportCSV = () => {
    exportToCSV(allPromotions as unknown as Record<string, unknown>[], [
      { key: 'code', label: 'Mã' },
      { key: 'name', label: 'Tên' },
      { key: 'type', label: 'Loại' },
      { key: 'value', label: 'Giá trị' },
      { key: 'startDate', label: 'Bắt đầu' },
      { key: 'endDate', label: 'Kết thúc' },
      { key: 'usedCount', label: 'Đã dùng' },
      { key: 'usageLimit', label: 'Giới hạn' },
    ], 'khuyen-mai-seller');
    toast.success('Đã xuất CSV');
  };

  return (
    <div className="space-y-6">
      <AppBreadcrumb items={[{ label: 'Kênh người bán', href: '/seller' }, { label: 'Khuyến mãi' }]} />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2">
            <Tag className="h-6 w-6 text-primary" /> Quản lý khuyến mãi
          </h1>
          <p className="text-muted-foreground">Tạo và quản lý mã giảm giá, chương trình khuyến mãi</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExportCSV}>
            <Download className="h-4 w-4 mr-1" /> CSV
          </Button>
          <Button onClick={openCreate}><Plus className="h-4 w-4 mr-1" /> Tạo khuyến mãi</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(s => (
          <StatsCard key={s.title} title={s.title} value={s.value} icon={s.icon} variant={s.variant} />
        ))}
      </div>

      <FilterBar
        filters={filterConfigs}
        activeFilters={filters}
        onFilterChange={setFilters}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Tìm mã, tên khuyến mãi..."
      />

      <DataTable<Promotion>
        data={pageData}
        columns={columns}
        totalItems={totalItems}
        pagination={pagination}
        sort={sort}
        onPaginationChange={setPagination}
        onSortChange={setSort}
        getId={p => p.id}
        loading={loading}
        renderActions={p => (
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" title={p.isActive ? 'Tắt' : 'Bật'} onClick={() => handleToggle(p)}>
              {p.isActive ? <PowerOff className="h-4 w-4 text-orange-500" /> : <Power className="h-4 w-4 text-green-500" />}
            </Button>
            <Button variant="ghost" size="sm" title="Sửa" onClick={() => openEdit(p)}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" title="Xoá" onClick={() => handleDelete(p)}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        )}
      />

      {/* Create/Edit dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'Sửa khuyến mãi' : 'Tạo khuyến mãi mới'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Mã khuyến mãi *</Label><Input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} /></div>
              <div>
                <Label>Loại giảm giá</Label>
                <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v as DiscountType }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {DISCOUNT_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div><Label>Tên chương trình *</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
            <div><Label>Mô tả</Label><Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} /></div>
            <div className="grid grid-cols-3 gap-3">
              <div><Label>Giá trị *</Label><Input type="number" value={form.value} onChange={e => setForm(f => ({ ...f, value: e.target.value }))} /></div>
              <div><Label>Đơn tối thiểu</Label><Input type="number" value={form.minOrderValue} onChange={e => setForm(f => ({ ...f, minOrderValue: e.target.value }))} /></div>
              <div><Label>Giảm tối đa</Label><Input type="number" value={form.maxDiscount} onChange={e => setForm(f => ({ ...f, maxDiscount: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Ngày bắt đầu</Label><Input type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} /></div>
              <div><Label>Ngày kết thúc</Label><Input type="date" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} /></div>
            </div>
            <div><Label>Giới hạn lượt dùng (0 = không giới hạn)</Label><Input type="number" value={form.usageLimit} onChange={e => setForm(f => ({ ...f, usageLimit: e.target.value }))} /></div>

            {/* P5.09: Preview khuyến mãi */}
            {form.name && (
              <div className="space-y-2">
                <Label>Xem trước (như buyer sẽ thấy)</Label>
                <div className={`rounded-xl p-4 text-white ${
                  form.type === 'Phần trăm' ? 'bg-gradient-to-r from-orange-500 to-red-500' :
                  form.type === 'Số tiền' ? 'bg-gradient-to-r from-blue-500 to-indigo-500' :
                  'bg-gradient-to-r from-green-500 to-teal-500'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <Badge className="bg-white/20 text-white border-0">{form.type}</Badge>
                    <span className="font-mono text-sm opacity-80">{form.code}</span>
                  </div>
                  <p className="text-lg">{form.name}</p>
                  <p className="text-2xl mt-1">
                    {form.type === 'Phần trăm' ? `Giảm ${form.value}%` :
                     form.type === 'Số tiền' ? `Giảm ${formatPrice(Number(form.value) || 0)}` :
                     `Ưu đãi đặc biệt`}
                  </p>
                  {Number(form.minOrderValue) > 0 && (
                    <p className="text-sm opacity-80 mt-1">Đơn tối thiểu: {formatPrice(Number(form.minOrderValue))}</p>
                  )}
                  <p className="text-xs opacity-70 mt-2">{form.startDate} → {form.endDate}</p>
                </div>
              </div>
            )}
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
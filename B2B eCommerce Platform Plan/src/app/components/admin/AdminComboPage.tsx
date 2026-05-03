// ============================================================
// AdminComboPage — Quản lý Combo sản phẩm
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import { Package, Plus, Eye, Trash2, RefreshCw, Tag, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { AppBreadcrumb } from '../shared/AppBreadcrumb';
import { SimpleTable } from '../shared/SimpleTable';
import { StatsCard } from '../shared/StatsCard';
import { FilterBar } from '../shared/FilterBar';
import { comboApi } from '../../services/api';
import type { ProductCombo } from '../../types';
import { toast } from 'sonner';

const formatCurrency = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', notation: 'compact' }).format(n);

export function AdminComboPage() {
  const [combos, setCombos] = useState<ProductCombo[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Tất cả');
  const [selected, setSelected] = useState<ProductCombo | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ProductCombo | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    const res = await comboApi.getPaginated({ page: 1, pageSize: 50 });
    setCombos(res.data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = combos.filter(c => {
    const matchSearch = !search || c.name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'Tất cả' || (statusFilter === 'Hoạt động' ? c.isActive : !c.isActive);
    return matchSearch && matchStatus;
  });

  const handleToggle = async (combo: ProductCombo) => {
    toast.success(combo.isActive ? 'Đã ẩn combo' : 'Đã kích hoạt combo');
    fetchData();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    toast.success('Đã xóa combo');
    setDeleteTarget(null);
    fetchData();
  };

  const handleCreate = async () => {
    if (!newName.trim()) { toast.error('Vui lòng nhập tên combo'); return; }
    toast.success('Đã tạo combo mới');
    setShowCreate(false);
    setNewName('');
    setNewDesc('');
    fetchData();
  };

  const columns = [
    {
      key: 'name', label: 'Tên Combo',
      render: (v: string, row: ProductCombo) => (
        <div>
          <p className="font-medium">{v}</p>
          <p className="text-xs text-muted-foreground">{row.products.length} sản phẩm</p>
        </div>
      ),
    },
    {
      key: 'comboPrice', label: 'Giá Combo',
      render: (v: number, row: ProductCombo) => (
        <div>
          <p className="font-medium text-primary">{formatCurrency(v)}</p>
          <p className="text-xs line-through text-muted-foreground">{formatCurrency(row.totalOriginalPrice)}</p>
        </div>
      ),
    },
    {
      key: 'savingsPercent', label: 'Tiết kiệm',
      render: (v: number, row: ProductCombo) => (
        <div>
          <Badge variant="destructive" className="text-xs">-{v}%</Badge>
          <p className="text-xs text-muted-foreground mt-0.5">{formatCurrency(row.savings)}</p>
        </div>
      ),
    },
    {
      key: 'isActive', label: 'Trạng thái',
      render: (v: boolean) => <Badge variant={v ? 'default' : 'secondary'}>{v ? 'Hoạt động' : 'Tạm ẩn'}</Badge>,
    },
    {
      key: 'actions', label: '',
      render: (_: unknown, row: ProductCombo) => (
        <div className="flex gap-1">
          <Button size="sm" variant="ghost" onClick={() => setSelected(row)}><Eye className="h-4 w-4" /></Button>
          <Button size="sm" variant="ghost" onClick={() => handleToggle(row)}>
            <Tag className={`h-4 w-4 ${row.isActive ? 'text-yellow-500' : 'text-green-500'}`} />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setDeleteTarget(row)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
        </div>
      ),
    },
  ];

  const activeCount = combos.filter(c => c.isActive).length;
  const totalSavings = combos.reduce((s, c) => s + c.savings, 0);
  const avgDiscount = combos.length > 0 ? Math.round(combos.reduce((s, c) => s + c.savingsPercent, 0) / combos.length) : 0;

  return (
    <div className="space-y-6">
      <AppBreadcrumb items={[{ label: 'Admin', href: '/admin' }, { label: 'Combo sản phẩm' }]} />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2"><Package className="h-6 w-6 text-primary" /> Combo sản phẩm</h1>
          <p className="text-muted-foreground">Quản lý các gói combo ưu đãi trên nền tảng</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchData}><RefreshCw className="h-4 w-4 mr-1" />Làm mới</Button>
          <Button size="sm" onClick={() => setShowCreate(true)}><Plus className="h-4 w-4 mr-1" />Tạo combo</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatsCard title="Tổng combo" value={combos.length} icon={<Package className="h-5 w-5 text-primary" />} />
        <StatsCard title="Đang hoạt động" value={activeCount} icon={<Tag className="h-5 w-5 text-green-500" />} color="success" />
        <StatsCard title="Giảm TB" value={`${avgDiscount}%`} icon={<TrendingUp className="h-5 w-5 text-blue-500" />} color="info" />
        <StatsCard title="Tổng tiết kiệm" value={formatCurrency(totalSavings)} icon={<TrendingUp className="h-5 w-5 text-purple-500" />} />
      </div>

      <FilterBar
        search={search} onSearchChange={setSearch}
        searchPlaceholder="Tìm tên combo..."
        filters={[
          { key: 'status', label: 'Trạng thái', value: statusFilter, onChange: setStatusFilter, options: ['Tất cả', 'Hoạt động', 'Tạm ẩn'] },
        ]}
      />

      <SimpleTable columns={columns} data={filtered} loading={loading} emptyMessage="Không có combo nào" />

      {/* Detail Dialog */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{selected?.name}</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-4 text-sm">
              <div className="flex items-center gap-2">
                <Badge variant={selected.isActive ? 'default' : 'secondary'}>{selected.isActive ? 'Hoạt động' : 'Tạm ẩn'}</Badge>
                <Badge variant="destructive">Tiết kiệm {selected.savingsPercent}%</Badge>
              </div>
              <div>
                <p className="text-muted-foreground mb-2">Sản phẩm trong combo:</p>
                <div className="space-y-2">
                  {selected.products.map(p => (
                    <div key={p.productId} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                      <span>{p.productName}</span>
                      <div className="text-right text-xs">
                        <p className="text-primary font-medium">{formatCurrency(p.comboPrice)}</p>
                        <p className="line-through text-muted-foreground">{formatCurrency(p.originalPrice)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20">
                <div>
                  <p className="text-muted-foreground text-xs">Giá gốc</p>
                  <p className="line-through">{formatCurrency(selected.totalOriginalPrice)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Giá combo</p>
                  <p className="text-primary font-bold text-lg">{formatCurrency(selected.comboPrice)}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelected(null)}>Đóng</Button>
            <Button onClick={() => { handleToggle(selected!); setSelected(null); }}>
              {selected?.isActive ? 'Tạm ẩn combo' : 'Kích hoạt combo'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Plus className="h-5 w-5" />Tạo combo mới</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Tên combo *</Label>
              <Input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Combo iPhone 16 Pro Max + AirPods..." />
            </div>
            <div>
              <Label>Mô tả</Label>
              <Input value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="Mô tả ngắn về combo..." />
            </div>
            <p className="text-xs text-muted-foreground">Sau khi tạo, bạn có thể thêm sản phẩm vào combo trong trang chi tiết.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Hủy</Button>
            <Button onClick={handleCreate}>Tạo combo</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Xác nhận xóa combo</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Bạn có chắc muốn xóa combo <strong>"{deleteTarget?.name}"</strong>?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Hủy</Button>
            <Button variant="destructive" onClick={handleDelete}>Xóa</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

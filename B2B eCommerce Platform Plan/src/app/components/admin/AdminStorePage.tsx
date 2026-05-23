// AdminStorePage — Quản lý cửa hàng / chi nhánh
// Wire: adminBranchApi (BA-docs aligned: district, city, lat, lng, workingHours)

import { useState, useEffect, useCallback } from 'react';
import { Store, Plus, Edit2, Trash2, RefreshCw, MapPin, Phone, Clock, ToggleLeft } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { AppBreadcrumb } from '../shared/AppBreadcrumb';
import { SimpleTable } from '../shared/SimpleTable';
import { StatsCard } from '../shared/StatsCard';
import { adminBranchApi, BeBranch, BranchFormData } from '../../services/adminBackendApi';
import { toast } from 'sonner';

const EMPTY_FORM: BranchFormData = {
  name: '', phone: '', address: '', district: '', city: '', workingHours: '8:00 - 22:00 (Thứ 2 - Chủ nhật)',
  lat: null, lng: null, isActive: true,
};

export function AdminStorePage() {
  const [branches, setBranches] = useState<BeBranch[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<BeBranch | null>(null);
  const [form, setForm] = useState<BranchFormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<BeBranch | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminBranchApi.getAll();
      setBranches(data);
    } catch {
      toast.error('Không thể tải danh sách cửa hàng');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const cities = Array.from(new Set(branches.map(b => b.city).filter(Boolean))) as string[];

  const filtered = branches.filter(b => {
    const q = search.toLowerCase();
    const matchSearch = !q || b.name.toLowerCase().includes(q) || (b.address ?? '').toLowerCase().includes(q) || (b.city ?? '').toLowerCase().includes(q);
    const matchCity = !cityFilter || b.city === cityFilter;
    return matchSearch && matchCity;
  });

  const openCreate = () => { setEditTarget(null); setForm(EMPTY_FORM); setShowForm(true); };
  const openEdit = (b: BeBranch) => {
    setEditTarget(b);
    setForm({
      name: b.name, phone: b.phone, address: b.address,
      district: b.district ?? '', city: b.city ?? '',
      workingHours: b.workingHours ?? '8:00 - 22:00 (Thứ 2 - Chủ nhật)',
      lat: b.lat ?? null, lng: b.lng ?? null, isActive: b.isActive,
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Vui lòng nhập tên cửa hàng'); return; }
    setSaving(true);
    try {
      if (editTarget) {
        await adminBranchApi.update(editTarget.id, form);
        toast.success('Đã cập nhật cửa hàng');
      } else {
        await adminBranchApi.create(form);
        toast.success('Đã thêm cửa hàng mới');
      }
      setShowForm(false);
      fetchData();
    } catch (err: any) {
      toast.error(err.message ?? 'Thao tác thất bại');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (b: BeBranch) => {
    try {
      await adminBranchApi.toggle(b.id);
      toast.success(b.isActive ? 'Đã tắt cửa hàng' : 'Đã bật cửa hàng');
      fetchData();
    } catch (err: any) { toast.error(err.message ?? 'Thao tác thất bại'); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await adminBranchApi.delete(deleteTarget.id);
      toast.success('Đã xóa cửa hàng');
      fetchData();
    } catch (err: any) { toast.error(err.message ?? 'Không thể xóa'); }
    finally { setDeleteTarget(null); }
  };

  const columns = [
    {
      key: 'name', label: 'Cửa hàng',
      render: (item: BeBranch) => (
        <div>
          <p className="font-medium">{item.name}</p>
          {item.city && item.district
            ? <p className="text-xs text-muted-foreground">{item.district}, {item.city}</p>
            : <p className="text-xs text-muted-foreground">{item.city ?? '—'}</p>}
        </div>
      ),
    },
    {
      key: 'contact', label: 'Liên hệ',
      render: (item: BeBranch) => (
        <div className="text-sm space-y-0.5">
          {item.phone && <p className="flex items-center gap-1"><Phone className="h-3 w-3 text-muted-foreground" />{item.phone}</p>}
          {item.address && <p className="flex items-center gap-1 text-muted-foreground"><MapPin className="h-3 w-3" />{item.address}</p>}
        </div>
      ),
    },
    {
      key: 'workingHours', label: 'Giờ làm việc',
      render: (item: BeBranch) => (
        <span className="flex items-center gap-1 text-sm"><Clock className="h-3 w-3 text-muted-foreground" />{item.workingHours ?? '—'}</span>
      ),
    },
    {
      key: 'coords', label: 'Tọa độ',
      render: (item: BeBranch) => item.lat && item.lng
        ? <span className="text-xs text-muted-foreground">{item.lat?.toFixed(4)}, {item.lng?.toFixed(4)}</span>
        : <span className="text-xs text-muted-foreground">—</span>,
    },
    {
      key: 'isActive', label: 'Trạng thái',
      render: (item: BeBranch) => (
        <Badge variant={item.isActive ? 'default' : 'secondary'}>{item.isActive ? 'Đang mở' : 'Đã đóng'}</Badge>
      ),
    },
    {
      key: 'actions', label: '',
      render: (item: BeBranch) => (
        <div className="flex gap-1">
          <Button size="sm" variant="ghost" title={item.isActive ? 'Tắt' : 'Bật'} onClick={() => handleToggle(item)}>
            <ToggleLeft className={`h-4 w-4 ${item.isActive ? 'text-emerald-500' : 'text-muted-foreground'}`} />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => openEdit(item)}><Edit2 className="h-4 w-4" /></Button>
          <Button size="sm" variant="ghost" onClick={() => setDeleteTarget(item)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
        </div>
      ),
    },
  ];

  const activeCount = branches.filter(b => b.isActive).length;

  return (
    <div className="space-y-6">
      <AppBreadcrumb items={[{ label: 'Admin', href: '/admin' }, { label: 'Cửa hàng' }]} />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2"><Store className="h-6 w-6 text-primary" /> Quản lý cửa hàng</h1>
          <p className="text-muted-foreground">Danh sách chi nhánh toàn hệ thống CELLPHONES</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchData}><RefreshCw className="h-4 w-4 mr-1" />Làm mới</Button>
          <Button size="sm" onClick={openCreate}><Plus className="h-4 w-4 mr-1" />Thêm cửa hàng</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <StatsCard title="Tổng cửa hàng" value={branches.length} icon={Store} />
        <StatsCard title="Đang hoạt động" value={activeCount} icon={Store} variant="success" />
        <StatsCard title="Đã đóng" value={branches.length - activeCount} icon={Store} variant="warning" />
      </div>

      <div className="flex gap-3 flex-wrap">
        <Input placeholder="Tìm tên, địa chỉ..." value={search} onChange={e => setSearch(e.target.value)} className="max-w-xs" />
        <select
          className="border rounded-md px-3 py-2 text-sm bg-background"
          value={cityFilter} onChange={e => setCityFilter(e.target.value)}
        >
          <option value="">Tất cả thành phố</option>
          {cities.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <SimpleTable columns={columns} data={filtered} loading={loading} emptyMessage="Không tìm thấy cửa hàng" />

      {/* Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editTarget ? 'Chỉnh sửa cửa hàng' : 'Thêm cửa hàng mới'}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <Label>Tên cửa hàng *</Label>
              <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="CELLPHONES - Quận 1" />
            </div>
            <div>
              <Label>Điện thoại</Label>
              <Input value={form.phone ?? ''} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="1800 2097" />
            </div>
            <div>
              <Label>Thành phố</Label>
              <Input value={form.city ?? ''} onChange={e => setForm(p => ({ ...p, city: e.target.value }))} placeholder="TP.HCM" />
            </div>
            <div>
              <Label>Quận / Huyện</Label>
              <Input value={form.district ?? ''} onChange={e => setForm(p => ({ ...p, district: e.target.value }))} placeholder="Quận 1" />
            </div>
            <div className="col-span-2">
              <Label>Địa chỉ</Label>
              <Input value={form.address ?? ''} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} placeholder="12 Lê Lợi, P. Bến Nghé" />
            </div>
            <div className="col-span-2">
              <Label>Giờ làm việc</Label>
              <Input value={form.workingHours ?? ''} onChange={e => setForm(p => ({ ...p, workingHours: e.target.value }))} placeholder="8:00 - 22:00 (Thứ 2 - Chủ nhật)" />
            </div>
            <div>
              <Label>Vĩ độ (lat)</Label>
              <Input type="number" step="0.0001" value={form.lat ?? ''} onChange={e => setForm(p => ({ ...p, lat: e.target.value ? parseFloat(e.target.value) : null }))} placeholder="10.7769" />
            </div>
            <div>
              <Label>Kinh độ (lng)</Label>
              <Input type="number" step="0.0001" value={form.lng ?? ''} onChange={e => setForm(p => ({ ...p, lng: e.target.value ? parseFloat(e.target.value) : null }))} placeholder="106.6955" />
            </div>
            <div className="col-span-2 flex items-center gap-2">
              <input type="checkbox" id="branchActive" checked={form.isActive ?? true} onChange={e => setForm(p => ({ ...p, isActive: e.target.checked }))} />
              <Label htmlFor="branchActive" className="cursor-pointer">Đang hoạt động</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)}>Hủy</Button>
            <Button disabled={saving} onClick={handleSave}>{saving ? 'Đang lưu...' : (editTarget ? 'Lưu thay đổi' : 'Thêm cửa hàng')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa cửa hàng?</AlertDialogTitle>
            <AlertDialogDescription>Bạn có chắc muốn xóa <strong>{deleteTarget?.name}</strong>? Thao tác này không thể hoàn tác.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Xóa</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ============================================================
// AdminStorePage — Quản lý Cửa hàng / Store Locator
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import { MapPin, Plus, Edit2, Trash2, RefreshCw, Building2, Phone, Clock } from 'lucide-react';
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
import { storeApi } from '../../services/api';
import type { StoreLocation } from '../../types';
import { toast } from 'sonner';

const cityOptions = ['Tất cả', 'TP.HCM', 'Hà Nội', 'Đà Nẵng', 'Cần Thơ', 'Hải Phòng'];

const emptyForm = { name: '', address: '', district: '', city: 'TP.HCM', phone: '', workingHours: '8:00 - 21:30', isActive: true, mapUrl: '' };

export function AdminStorePage() {
  const [stores, setStores] = useState<StoreLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [cityFilter, setCityFilter] = useState('Tất cả');
  const [selected, setSelected] = useState<StoreLocation | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<StoreLocation | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<StoreLocation | null>(null);
  const [form, setForm] = useState(emptyForm);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const data = await storeApi.getAll();
    setStores(data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = stores.filter(s => {
    const matchSearch = !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.address.toLowerCase().includes(search.toLowerCase());
    const matchCity = cityFilter === 'Tất cả' || s.city === cityFilter;
    return matchSearch && matchCity;
  });

  const openCreate = () => { setEditTarget(null); setForm(emptyForm); setShowForm(true); };
  const openEdit = (store: StoreLocation) => {
    setEditTarget(store);
    setForm({ name: store.name, address: store.address, district: store.district, city: store.city, phone: store.phone, workingHours: store.workingHours, isActive: store.isActive, mapUrl: store.mapUrl || '' });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.address.trim()) { toast.error('Vui lòng nhập tên và địa chỉ'); return; }
    toast.success(editTarget ? 'Đã cập nhật cửa hàng' : 'Đã thêm cửa hàng mới');
    setShowForm(false);
    fetchData();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    toast.success('Đã xóa cửa hàng');
    setDeleteTarget(null);
    fetchData();
  };

  const columns = [
    {
      key: 'name', label: 'Tên cửa hàng',
      render: (item: StoreLocation) => (
        <div>
          <p className="font-medium">{item.name}</p>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <MapPin className="h-3 w-3" />{item.address}, {item.district}
          </p>
        </div>
      ),
    },
    { key: 'city', label: 'Thành phố', render: (item: StoreLocation) => <span className="text-sm">{item.city}</span> },
    {
      key: 'phone', label: 'Điện thoại',
      render: (item: StoreLocation) => (
        <span className="flex items-center gap-1 text-sm"><Phone className="h-3 w-3 text-muted-foreground" />{item.phone}</span>
      ),
    },
    {
      key: 'workingHours', label: 'Giờ làm việc',
      render: (item: StoreLocation) => (
        <span className="flex items-center gap-1 text-sm"><Clock className="h-3 w-3 text-muted-foreground" />{item.workingHours}</span>
      ),
    },
    {
      key: 'isActive', label: 'Trạng thái',
      render: (item: StoreLocation) => <Badge variant={item.isActive ? 'default' : 'secondary'}>{item.isActive ? 'Hoạt động' : 'Tạm đóng'}</Badge>,
    },
    {
      key: 'actions', label: '',
      render: (item: StoreLocation) => (
        <div className="flex gap-1">
          <Button size="sm" variant="ghost" onClick={() => openEdit(item)}><Edit2 className="h-4 w-4" /></Button>
          <Button size="sm" variant="ghost" onClick={() => setDeleteTarget(item)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
        </div>
      ),
    },
  ];

  const activeCount = stores.filter(s => s.isActive).length;
  const cityCount = new Set(stores.map(s => s.city)).size;

  return (
    <div className="space-y-6">
      <AppBreadcrumb items={[{ label: 'Admin', href: '/admin' }, { label: 'Cửa hàng' }]} />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2"><Building2 className="h-6 w-6 text-primary" /> Quản lý Cửa hàng</h1>
          <p className="text-muted-foreground">Quản lý hệ thống cửa hàng và điểm bán lẻ toàn quốc</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchData}><RefreshCw className="h-4 w-4 mr-1" />Làm mới</Button>
          <Button size="sm" onClick={openCreate}><Plus className="h-4 w-4 mr-1" />Thêm cửa hàng</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatsCard title="Tổng cửa hàng" value={stores.length} icon={Building2} />
        <StatsCard title="Đang hoạt động" value={activeCount} icon={Building2} variant="success" />
        <StatsCard title="Tạm đóng" value={stores.length - activeCount} icon={Building2} variant="warning" />
        <StatsCard title="Số thành phố" value={cityCount} icon={MapPin} variant="info" />
      </div>

      {/* Map preview */}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><MapPin className="h-4 w-4" />Phân bố cửa hàng</CardTitle></CardHeader>
        <CardContent>
          <div className="relative bg-gradient-to-b from-blue-50 to-green-50 rounded-xl h-40 overflow-hidden border flex items-center justify-center">
            <p className="text-muted-foreground text-sm">Bản đồ cửa hàng (tích hợp Google Maps API)</p>
            {filtered.map((s, i) => (
              <div key={s.id} className="absolute flex flex-col items-center"
                style={{ top: `${20 + (i * 15)}%`, left: `${35 + (i * 10)}%` }}>
                <div className="bg-primary text-white text-xs rounded-full w-6 h-6 flex items-center justify-center shadow cursor-pointer hover:scale-110 transition-transform">
                  {i + 1}
                </div>
                <span className="text-[10px] bg-white px-1 rounded shadow mt-0.5 whitespace-nowrap">{s.city}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <FilterBar
        search={search} onSearchChange={setSearch}
        searchPlaceholder="Tìm tên, địa chỉ cửa hàng..."
        filters={[{ key: 'city', label: 'Thành phố', value: cityFilter, onChange: setCityFilter, options: cityOptions }]}
      />
      <SimpleTable columns={columns} data={filtered} loading={loading} emptyMessage="Không tìm thấy cửa hàng nào" />

      {/* Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {editTarget ? <Edit2 className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
              {editTarget ? 'Chỉnh sửa cửa hàng' : 'Thêm cửa hàng mới'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Tên cửa hàng *</Label>
              <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="CELLPHONES Nguyễn Đình Chiểu..." />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Thành phố</Label>
                <select className="w-full border rounded-md px-3 py-2 text-sm bg-background" value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))}>
                  {cityOptions.slice(1).map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <Label>Quận/Huyện</Label>
                <Input value={form.district} onChange={e => setForm(p => ({ ...p, district: e.target.value }))} placeholder="Quận 3" />
              </div>
            </div>
            <div>
              <Label>Địa chỉ *</Label>
              <Input value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} placeholder="200 Nguyễn Đình Chiểu" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Số điện thoại</Label>
                <Input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="1800.2097" />
              </div>
              <div>
                <Label>Giờ mở cửa</Label>
                <Input value={form.workingHours} onChange={e => setForm(p => ({ ...p, workingHours: e.target.value }))} placeholder="8:00 - 21:30" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="isActive" checked={form.isActive} onChange={e => setForm(p => ({ ...p, isActive: e.target.checked }))} />
              <Label htmlFor="isActive" className="cursor-pointer">Đang hoạt động</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)}>Hủy</Button>
            <Button onClick={handleSave}>{editTarget ? 'Lưu thay đổi' : 'Thêm cửa hàng'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Xác nhận xóa</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Bạn có chắc muốn xóa cửa hàng <strong>"{deleteTarget?.name}"</strong>?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Hủy</Button>
            <Button variant="destructive" onClick={handleDelete}>Xóa</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

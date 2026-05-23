// ============================================================
// AdminInternalSupplierPage — Quản lý nguồn hàng nội bộ
// Khác với cửa hàng marketplace: nguồn hàng chỉ admin thấy, dùng để
// quản lý nguồn hàng nhập (Apple VN, Samsung VN, Digiworld...)
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import { Building2, Plus, Edit2, Trash2, RefreshCw, Phone, Mail, Package, MapPin } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { AppBreadcrumb } from '../shared/AppBreadcrumb';
import { SimpleTable } from '../shared/SimpleTable';
import { StatsCard } from '../shared/StatsCard';
import { FilterBar } from '../shared/FilterBar';
import type { InternalSupplier } from '../../types';
import { toast } from 'sonner';

const PAYMENT_TERMS = ['Thanh toán ngay', 'Net 15', 'Net 30', 'Net 45', 'Net 60', 'Trả góp'];
const CATEGORIES = ['Điện thoại', 'Phụ kiện', 'Tai nghe', 'Đồng hồ TM', 'Sạc & Pin', 'Thiết bị CN'];

const mockSuppliers: InternalSupplier[] = [
  {
    id: 'sup-001', name: 'Apple Việt Nam', contactPerson: 'Mr. Nguyễn Việt Hoàng',
    phone: '028.3812.5050', email: 'b2b@apple.com.vn',
    address: '23 Lê Duẩn, Q.1, TP.HCM', categories: ['Điện thoại', 'Tai nghe', 'Đồng hồ TM'],
    paymentTerms: 'Net 30', isActive: true, createdAt: '2024-01-15',
  },
  {
    id: 'sup-002', name: 'Samsung Việt Nam', contactPerson: 'Mr. Trần Quang Hưng',
    phone: '1800.1558', email: 'b2b@samsung.com.vn',
    address: 'Toà Bitexco Financial Tower, Q.1, TP.HCM', categories: ['Điện thoại', 'Đồng hồ TM', 'Tai nghe'],
    paymentTerms: 'Net 30', isActive: true, createdAt: '2024-01-15',
  },
  {
    id: 'sup-003', name: 'Xiaomi Việt Nam', contactPerson: 'Ms. Lê Mai Phương',
    phone: '1800.6601', email: 'business@mi.com',
    address: 'Đoàn Văn Bơ, Q.4, TP.HCM', categories: ['Điện thoại', 'Phụ kiện', 'Sạc & Pin'],
    paymentTerms: 'Net 45', isActive: true, createdAt: '2024-03-10',
  },
  {
    id: 'sup-004', name: 'Digiworld Corporation', contactPerson: 'Mr. Phạm Văn Tâm',
    phone: '028.7307.7575', email: 'sales@digiworld.com.vn',
    address: '128 Trần Quang Khải, Q.1, TP.HCM', categories: ['Điện thoại', 'Phụ kiện', 'Tai nghe', 'Thiết bị CN'],
    paymentTerms: 'Net 30', isActive: true, createdAt: '2024-02-01',
  },
  {
    id: 'sup-005', name: 'FPT Trading', contactPerson: 'Mr. Hoàng Đình Đức',
    phone: '024.3768.6666', email: 'fpttrading@fpt.com.vn',
    address: 'Số 17 Duy Tân, Cầu Giấy, Hà Nội', categories: ['Điện thoại', 'Thiết bị CN'],
    paymentTerms: 'Net 60', isActive: true, createdAt: '2024-04-20',
  },
  {
    id: 'sup-006', name: 'Synnex FPT', contactPerson: 'Ms. Bùi Thị Hương',
    phone: '024.7305.7777', email: 'synnex@fpt.com.vn',
    address: 'Phạm Hùng, Nam Từ Liêm, Hà Nội', categories: ['Phụ kiện', 'Sạc & Pin', 'Thiết bị CN'],
    paymentTerms: 'Net 45', isActive: true, createdAt: '2024-05-15',
  },
  {
    id: 'sup-007', name: 'Anker Vietnam', contactPerson: 'Mr. James Tan',
    phone: '028.3920.4567', email: 'partner@anker.vn',
    address: 'Phú Mỹ Hưng, Q.7, TP.HCM', categories: ['Phụ kiện', 'Sạc & Pin'],
    paymentTerms: 'Thanh toán ngay', isActive: false, createdAt: '2025-02-10',
  },
];

const emptyForm: Omit<InternalSupplier, 'id' | 'createdAt'> = {
  name: '', contactPerson: '', phone: '', email: '',
  address: '', categories: [], paymentTerms: 'Net 30', isActive: true,
};

export function AdminInternalSupplierPage() {
  const [suppliers, setSuppliers] = useState<InternalSupplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Tất cả');
  const [deleteTarget, setDeleteTarget] = useState<InternalSupplier | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<InternalSupplier | null>(null);
  const [form, setForm] = useState(emptyForm);

  const fetchData = useCallback(async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 300));
    setSuppliers(mockSuppliers);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = suppliers.filter(s => {
    const matchSearch = !search || s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.contactPerson.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'Tất cả' || (statusFilter === 'Hoạt động' ? s.isActive : !s.isActive);
    return matchSearch && matchStatus;
  });

  const openCreate = () => { setEditTarget(null); setForm(emptyForm); setShowForm(true); };
  const openEdit = (s: InternalSupplier) => {
    setEditTarget(s);
    setForm({ name: s.name, contactPerson: s.contactPerson, phone: s.phone, email: s.email, address: s.address, categories: [...s.categories], paymentTerms: s.paymentTerms, isActive: s.isActive });
    setShowForm(true);
  };

  const toggleCategory = (cat: string) => {
    setForm(p => ({
      ...p,
      categories: p.categories.includes(cat) ? p.categories.filter(c => c !== cat) : [...p.categories, cat],
    }));
  };

  const handleSave = () => {
    if (!form.name.trim()) {
      toast.error('Vui lòng nhập tên nguồn hàng');
      return;
    }
    if (editTarget) {
      setSuppliers(prev => prev.map(s => s.id === editTarget.id ? { ...s, ...form } : s));
      toast.success('Đã cập nhật nguồn hàng');
    } else {
      setSuppliers(prev => [...prev, { ...form, id: `sup-${Date.now()}`, createdAt: new Date().toISOString().split('T')[0] }]);
      toast.success('Đã thêm nguồn hàng mới');
    }
    setShowForm(false);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    setSuppliers(prev => prev.filter(s => s.id !== deleteTarget.id));
    toast.success('Đã xóa nguồn hàng');
    setDeleteTarget(null);
  };

  const columns = [
    {
      key: 'name', label: 'Nguồn hàng',
      render: (item: InternalSupplier) => (
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
            <Building2 className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="font-medium">{item.name}</p>
            <p className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" />{item.address}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'contact', label: 'Liên hệ',
      render: (item: InternalSupplier) => (
        <div className="text-xs space-y-0.5">
          <p className="font-medium text-sm">{item.contactPerson}</p>
          <p className="flex items-center gap-1 text-muted-foreground"><Mail className="h-3 w-3" />{item.email}</p>
          <p className="flex items-center gap-1 text-muted-foreground"><Phone className="h-3 w-3" />{item.phone}</p>
        </div>
      ),
    },
    {
      key: 'categories', label: 'Danh mục cung cấp',
      render: (item: InternalSupplier) => (
        <div className="flex flex-wrap gap-1 max-w-xs">
          {item.categories.slice(0, 3).map(c => <Badge key={c} variant="outline" className="text-xs">{c}</Badge>)}
          {item.categories.length > 3 && <Badge variant="outline" className="text-xs">+{item.categories.length - 3}</Badge>}
        </div>
      ),
    },
    {
      key: 'paymentTerms', label: 'Điều khoản TT',
      render: (item: InternalSupplier) => <Badge variant="secondary">{item.paymentTerms}</Badge>,
    },
    {
      key: 'isActive', label: 'Trạng thái',
      render: (item: InternalSupplier) => (
        <Badge variant={item.isActive ? 'default' : 'secondary'}>{item.isActive ? 'Hợp tác' : 'Tạm dừng'}</Badge>
      ),
    },
    {
      key: 'actions', label: '',
      render: (item: InternalSupplier) => (
        <div className="flex gap-1">
          <Button size="sm" variant="ghost" onClick={() => openEdit(item)}><Edit2 className="h-4 w-4" /></Button>
          <Button size="sm" variant="ghost" onClick={() => setDeleteTarget(item)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
        </div>
      ),
    },
  ];

  const activeCount = suppliers.filter(s => s.isActive).length;
  const categoryCount = new Set(suppliers.flatMap(s => s.categories)).size;

  return (
    <div className="space-y-6">
      <AppBreadcrumb items={[{ label: 'Admin', href: '/admin' }, { label: 'Nguồn hàng' }]} />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2"><Building2 className="h-6 w-6 text-primary" /> Nguồn hàng nội bộ</h1>
          <p className="text-muted-foreground">Quản lý đối tác nhập hàng và nhà phân phối</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchData}><RefreshCw className="h-4 w-4 mr-1" />Làm mới</Button>
          <Button size="sm" onClick={openCreate}><Plus className="h-4 w-4 mr-1" />Thêm nguồn hàng</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatsCard title="Tổng nguồn hàng" value={suppliers.length} icon={Building2} />
        <StatsCard title="Đang hợp tác" value={activeCount} icon={Building2} variant="success" />
        <StatsCard title="Danh mục cung cấp" value={categoryCount} icon={Package} variant="info" />
        <StatsCard title="Tạm dừng" value={suppliers.length - activeCount} icon={Building2} variant="warning" />
      </div>

      <FilterBar
        search={search} onSearchChange={setSearch}
        searchPlaceholder="Tìm tên nguồn hàng, người liên hệ..."
        filters={[
          { key: 'status', label: 'Trạng thái', value: statusFilter, onChange: setStatusFilter, options: ['Tất cả', 'Hoạt động', 'Tạm dừng'] },
        ]}
      />

      <SimpleTable columns={columns} data={filtered} loading={loading} emptyMessage="Chưa có nguồn hàng nào" />

      {/* Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {editTarget ? <Edit2 className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
              {editTarget ? 'Chỉnh sửa nguồn hàng' : 'Thêm nguồn hàng mới'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Tên nguồn hàng *</Label>
              <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Apple Việt Nam" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Người liên hệ</Label>
                <Input value={form.contactPerson} onChange={e => setForm(p => ({ ...p, contactPerson: e.target.value }))} placeholder="Mr. Nguyễn..." />
              </div>
              <div>
                <Label>Điện thoại</Label>
                <Input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="028.xxxx.xxxx" />
              </div>
            </div>
            <div>
              <Label>Email</Label>
              <Input value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="b2b@..." />
            </div>
            <div>
              <Label>Địa chỉ</Label>
              <Textarea value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} placeholder="Số nhà, đường, quận, thành phố" rows={2} />
            </div>
            <div>
              <Label>Danh mục cung cấp</Label>
              <div className="flex flex-wrap gap-2 mt-1">
                {CATEGORIES.map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => toggleCategory(c)}
                    className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                      form.categories.includes(c)
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-background hover:bg-muted'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label>Điều khoản thanh toán</Label>
              <select className="w-full border rounded-md px-3 py-2 text-sm bg-background" value={form.paymentTerms} onChange={e => setForm(p => ({ ...p, paymentTerms: e.target.value }))}>
                {PAYMENT_TERMS.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="supActive" checked={form.isActive} onChange={e => setForm(p => ({ ...p, isActive: e.target.checked }))} />
              <Label htmlFor="supActive" className="cursor-pointer">Đang hợp tác</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)}>Hủy</Button>
            <Button onClick={handleSave}>{editTarget ? 'Lưu thay đổi' : 'Thêm nguồn hàng'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Xác nhận xóa</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Bạn có chắc muốn xóa nguồn hàng <strong>"{deleteTarget?.name}"</strong>?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Hủy</Button>
            <Button variant="destructive" onClick={handleDelete}>Xóa</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

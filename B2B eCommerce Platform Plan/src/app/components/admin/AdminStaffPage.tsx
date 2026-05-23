// AdminStaffPage — Quản lý nhân viên
// BA-docs aligned: phone, branchId, branchName, joinedAt

import { useState, useEffect, useCallback } from 'react';
import { Users, Plus, Edit2, RefreshCw, UserCheck, UserX, Mail, Phone, Building2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { AppBreadcrumb } from '../shared/AppBreadcrumb';
import { SimpleTable } from '../shared/SimpleTable';
import { StatsCard } from '../shared/StatsCard';
import { adminStaffApi, adminBranchApi, BeStaffMember, StaffFormData, BeBranch } from '../../services/adminBackendApi';
import { toast } from 'sonner';

const BE_ROLES = ['STORE_MANAGER', 'SALES_ADVISOR', 'TECHNICIAN', 'WAREHOUSE_STAFF', 'CASHIER', 'STAFF'];

const roleLabel: Record<string, string> = {
  STORE_MANAGER: 'Quản lý cửa hàng',
  SALES_ADVISOR: 'Tư vấn viên',
  TECHNICIAN: 'Kỹ thuật viên',
  WAREHOUSE_STAFF: 'Nhân viên kho',
  CASHIER: 'Thu ngân',
  STAFF: 'Nhân viên',
};

const roleColor: Record<string, string> = {
  STORE_MANAGER: 'bg-purple-500',
  SALES_ADVISOR: 'bg-blue-500',
  TECHNICIAN: 'bg-emerald-500',
  WAREHOUSE_STAFF: 'bg-amber-500',
  CASHIER: 'bg-pink-500',
  STAFF: 'bg-gray-500',
};

const EMPTY_FORM: StaffFormData = {
  fullName: '', email: '', phone: '', role: 'SALES_ADVISOR', branchId: '', joinedAt: '', isActive: true,
};

export function AdminStaffPage() {
  const [staff, setStaff] = useState<BeStaffMember[]>([]);
  const [branches, setBranches] = useState<BeBranch[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [branchFilter, setBranchFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<BeStaffMember | null>(null);
  const [form, setForm] = useState<StaffFormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [staffData, branchData] = await Promise.all([
        adminStaffApi.getAll(),
        adminBranchApi.getAll(),
      ]);
      setStaff(staffData);
      setBranches(branchData);
    } catch {
      toast.error('Không thể tải danh sách nhân viên');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = staff.filter(s => {
    const q = search.toLowerCase();
    const matchSearch = !q || s.fullName.toLowerCase().includes(q) || s.email.toLowerCase().includes(q) || (s.phone ?? '').includes(q);
    const matchRole = !roleFilter || s.role === roleFilter;
    const matchBranch = !branchFilter || s.branchId === branchFilter;
    return matchSearch && matchRole && matchBranch;
  });

  const openCreate = () => { setEditTarget(null); setForm(EMPTY_FORM); setShowForm(true); };
  const openEdit = (s: BeStaffMember) => {
    setEditTarget(s);
    setForm({
      fullName: s.fullName, email: s.email, phone: s.phone ?? '',
      role: s.role, branchId: s.branchId ?? '', joinedAt: s.joinedAt?.slice(0, 10) ?? '',
      isActive: s.isActive,
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.fullName.trim() || !form.email.trim()) { toast.error('Vui lòng nhập họ tên và email'); return; }
    setSaving(true);
    try {
      if (editTarget) {
        await adminStaffApi.update(editTarget.id, form);
        toast.success('Đã cập nhật nhân viên');
      } else {
        await adminStaffApi.create(form);
        toast.success('Đã thêm nhân viên mới');
      }
      setShowForm(false);
      fetchData();
    } catch (err: any) {
      toast.error(err.message ?? 'Thao tác thất bại');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (s: BeStaffMember) => {
    try {
      if (s.isActive) {
        await adminStaffApi.deactivate(s.id);
        toast.success('Đã vô hiệu hóa nhân viên');
      } else {
        await adminStaffApi.update(s.id, {
          fullName: s.fullName, email: s.email, phone: s.phone,
          role: s.role, branchId: s.branchId, isActive: true,
        });
        toast.success('Đã kích hoạt lại nhân viên');
      }
      fetchData();
    } catch (err: any) { toast.error(err.message ?? 'Thao tác thất bại'); }
  };

  const columns = [
    {
      key: 'fullName', label: 'Nhân viên',
      render: (item: BeStaffMember) => (
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center text-white font-medium text-sm">
            {item.fullName.split(' ').slice(-1)[0]?.[0] ?? '?'}
          </div>
          <div>
            <p className="font-medium">{item.fullName}</p>
            <p className="text-xs text-muted-foreground">Vào làm: {item.joinedAt?.slice(0, 10) ?? '—'}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'role', label: 'Vị trí',
      render: (item: BeStaffMember) => (
        <Badge className={`${roleColor[item.role] ?? 'bg-gray-500'} text-white border-0`}>
          {roleLabel[item.role] ?? item.role}
        </Badge>
      ),
    },
    {
      key: 'branch', label: 'Chi nhánh',
      render: (item: BeStaffMember) => item.branchName
        ? <span className="flex items-center gap-1 text-sm"><Building2 className="h-3 w-3 text-muted-foreground" />{item.branchName}</span>
        : <span className="text-xs text-muted-foreground">—</span>,
    },
    {
      key: 'contact', label: 'Liên hệ',
      render: (item: BeStaffMember) => (
        <div className="text-sm space-y-0.5">
          <p className="flex items-center gap-1"><Mail className="h-3 w-3 text-muted-foreground" />{item.email}</p>
          {item.phone && <p className="flex items-center gap-1 text-muted-foreground"><Phone className="h-3 w-3" />{item.phone}</p>}
        </div>
      ),
    },
    {
      key: 'isActive', label: 'Trạng thái',
      render: (item: BeStaffMember) => (
        <Badge variant={item.isActive ? 'default' : 'secondary'}>{item.isActive ? 'Đang làm' : 'Nghỉ việc'}</Badge>
      ),
    },
    {
      key: 'actions', label: '',
      render: (item: BeStaffMember) => (
        <div className="flex gap-1">
          <Button size="sm" variant="ghost" onClick={() => handleToggleActive(item)} title={item.isActive ? 'Vô hiệu hóa' : 'Kích hoạt lại'}>
            {item.isActive
              ? <UserCheck className="h-4 w-4 text-emerald-500" />
              : <UserX className="h-4 w-4 text-muted-foreground" />}
          </Button>
          <Button size="sm" variant="ghost" onClick={() => openEdit(item)}><Edit2 className="h-4 w-4" /></Button>
        </div>
      ),
    },
  ];

  const activeCount = staff.filter(s => s.isActive).length;
  const managerCount = staff.filter(s => s.role === 'STORE_MANAGER').length;

  return (
    <div className="space-y-6">
      <AppBreadcrumb items={[{ label: 'Admin', href: '/admin' }, { label: 'Nhân viên' }]} />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2"><Users className="h-6 w-6 text-primary" /> Quản lý nhân viên</h1>
          <p className="text-muted-foreground">Danh sách nhân viên theo vị trí và chi nhánh</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchData}><RefreshCw className="h-4 w-4 mr-1" />Làm mới</Button>
          <Button size="sm" onClick={openCreate}><Plus className="h-4 w-4 mr-1" />Thêm nhân viên</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <StatsCard title="Tổng nhân viên" value={staff.length} icon={Users} />
        <StatsCard title="Đang làm" value={activeCount} icon={UserCheck} variant="success" />
        <StatsCard title="Quản lý" value={managerCount} icon={Users} variant="purple" />
      </div>

      <div className="flex gap-3 flex-wrap">
        <Input placeholder="Tìm tên, email, SĐT..." value={search} onChange={e => setSearch(e.target.value)} className="max-w-xs" />
        <select className="border rounded-md px-3 py-2 text-sm bg-background" value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
          <option value="">Tất cả vị trí</option>
          {BE_ROLES.map(r => <option key={r} value={r}>{roleLabel[r] ?? r}</option>)}
        </select>
        <select className="border rounded-md px-3 py-2 text-sm bg-background" value={branchFilter} onChange={e => setBranchFilter(e.target.value)}>
          <option value="">Tất cả chi nhánh</option>
          {branches.filter(b => b.isActive).map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
      </div>

      <SimpleTable columns={columns} data={filtered} loading={loading} emptyMessage="Không tìm thấy nhân viên" />

      {/* Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editTarget ? 'Chỉnh sửa nhân viên' : 'Thêm nhân viên mới'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Họ và tên *</Label>
              <Input value={form.fullName} onChange={e => setForm(p => ({ ...p, fullName: e.target.value }))} placeholder="Nguyễn Văn A" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Email *</Label>
                <Input value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="nv.a@cellphones.vn" />
              </div>
              <div>
                <Label>Số điện thoại</Label>
                <Input value={form.phone ?? ''} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="0901234567" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Vị trí</Label>
                <select className="w-full border rounded-md px-3 py-2 text-sm bg-background" value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))}>
                  {BE_ROLES.map(r => <option key={r} value={r}>{roleLabel[r] ?? r}</option>)}
                </select>
              </div>
              <div>
                <Label>Ngày vào làm</Label>
                <Input type="date" value={form.joinedAt ?? ''} onChange={e => setForm(p => ({ ...p, joinedAt: e.target.value }))} />
              </div>
            </div>
            <div>
              <Label>Chi nhánh</Label>
              <select className="w-full border rounded-md px-3 py-2 text-sm bg-background" value={form.branchId ?? ''} onChange={e => setForm(p => ({ ...p, branchId: e.target.value }))}>
                <option value="">— Chưa gán chi nhánh —</option>
                {branches.filter(b => b.isActive).map(b => (
                  <option key={b.id} value={b.id}>{b.name}{b.city ? ` (${b.city})` : ''}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="staffActive" checked={form.isActive ?? true} onChange={e => setForm(p => ({ ...p, isActive: e.target.checked }))} />
              <Label htmlFor="staffActive" className="cursor-pointer">Đang làm việc</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)}>Hủy</Button>
            <Button disabled={saving} onClick={handleSave}>{saving ? 'Đang lưu...' : (editTarget ? 'Lưu thay đổi' : 'Thêm nhân viên')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

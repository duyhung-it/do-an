// ============================================================
// AdminStaffPage — Quản lý nhân viên cửa hàng
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import { Users, Plus, Edit2, Trash2, RefreshCw, UserCheck, Building2, Phone, Mail } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { AppBreadcrumb } from '../shared/AppBreadcrumb';
import { SimpleTable } from '../shared/SimpleTable';
import { StatsCard } from '../shared/StatsCard';
import { FilterBar } from '../shared/FilterBar';
import type { StaffMember } from '../../types';
import { toast } from 'sonner';

const ROLES: StaffMember['role'][] = ['Quản lý cửa hàng', 'Tư vấn viên', 'Nhân viên kho', 'Kỹ thuật viên', 'Thu ngân'];

const mockStaff: StaffMember[] = [
  { id: 'st-001', fullName: 'Nguyễn Hoàng Long', email: 'long.nh@cellphones.vn', phone: '0901234567', role: 'Quản lý cửa hàng', branchId: 'br-001', branchName: 'CELLPHONES Q.3 - HCM', isActive: true, joinedAt: '2024-03-15' },
  { id: 'st-002', fullName: 'Trần Thị Mai', email: 'mai.tt@cellphones.vn', phone: '0912345678', role: 'Tư vấn viên', branchId: 'br-001', branchName: 'CELLPHONES Q.3 - HCM', isActive: true, joinedAt: '2025-01-20' },
  { id: 'st-003', fullName: 'Lê Văn Tuấn', email: 'tuan.lv@cellphones.vn', phone: '0923456789', role: 'Kỹ thuật viên', branchId: 'br-001', branchName: 'CELLPHONES Q.3 - HCM', isActive: true, joinedAt: '2024-08-10' },
  { id: 'st-004', fullName: 'Phạm Đức Anh', email: 'anh.pd@cellphones.vn', phone: '0934567890', role: 'Nhân viên kho', branchId: 'br-002', branchName: 'CELLPHONES Q.1 - HCM', isActive: true, joinedAt: '2025-05-01' },
  { id: 'st-005', fullName: 'Hoàng Thị Lan', email: 'lan.ht@cellphones.vn', phone: '0945678901', role: 'Thu ngân', branchId: 'br-002', branchName: 'CELLPHONES Q.1 - HCM', isActive: true, joinedAt: '2025-09-15' },
  { id: 'st-006', fullName: 'Vũ Quang Huy', email: 'huy.vq@cellphones.vn', phone: '0956789012', role: 'Quản lý cửa hàng', branchId: 'br-003', branchName: 'CELLPHONES Cầu Giấy - HN', isActive: true, joinedAt: '2024-06-01' },
  { id: 'st-007', fullName: 'Đỗ Minh Khoa', email: 'khoa.dm@cellphones.vn', phone: '0967890123', role: 'Tư vấn viên', branchId: 'br-003', branchName: 'CELLPHONES Cầu Giấy - HN', isActive: false, joinedAt: '2025-02-12' },
  { id: 'st-008', fullName: 'Bùi Thanh Hằng', email: 'hang.bt@cellphones.vn', phone: '0978901234', role: 'Tư vấn viên', branchId: 'br-001', branchName: 'CELLPHONES Q.3 - HCM', isActive: true, joinedAt: '2026-01-05' },
];

const branches = ['Tất cả', 'CELLPHONES Q.3 - HCM', 'CELLPHONES Q.1 - HCM', 'CELLPHONES Cầu Giấy - HN'];

const emptyForm: Omit<StaffMember, 'id' | 'joinedAt'> = {
  fullName: '', email: '', phone: '', role: 'Tư vấn viên',
  branchId: 'br-001', branchName: 'CELLPHONES Q.3 - HCM', isActive: true,
};

export function AdminStaffPage() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('Tất cả');
  const [branchFilter, setBranchFilter] = useState('Tất cả');
  const [deleteTarget, setDeleteTarget] = useState<StaffMember | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<StaffMember | null>(null);
  const [form, setForm] = useState(emptyForm);

  const fetchData = useCallback(async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 300));
    setStaff(mockStaff);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = staff.filter(s => {
    const matchSearch = !search || s.fullName.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase()) || s.phone.includes(search);
    const matchRole = roleFilter === 'Tất cả' || s.role === roleFilter;
    const matchBranch = branchFilter === 'Tất cả' || s.branchName === branchFilter;
    return matchSearch && matchRole && matchBranch;
  });

  const openCreate = () => { setEditTarget(null); setForm(emptyForm); setShowForm(true); };
  const openEdit = (m: StaffMember) => {
    setEditTarget(m);
    setForm({ fullName: m.fullName, email: m.email, phone: m.phone, role: m.role, branchId: m.branchId, branchName: m.branchName, isActive: m.isActive });
    setShowForm(true);
  };

  const handleSave = () => {
    if (!form.fullName.trim() || !form.email.trim()) {
      toast.error('Vui lòng nhập họ tên và email');
      return;
    }
    if (editTarget) {
      setStaff(prev => prev.map(s => s.id === editTarget.id ? { ...s, ...form } : s));
      toast.success('Đã cập nhật nhân viên');
    } else {
      setStaff(prev => [...prev, { ...form, id: `st-${Date.now()}`, joinedAt: new Date().toISOString().split('T')[0] }]);
      toast.success('Đã thêm nhân viên mới');
    }
    setShowForm(false);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    setStaff(prev => prev.filter(s => s.id !== deleteTarget.id));
    toast.success('Đã xóa nhân viên');
    setDeleteTarget(null);
  };

  const handleToggle = (m: StaffMember) => {
    setStaff(prev => prev.map(s => s.id === m.id ? { ...s, isActive: !s.isActive } : s));
    toast.success(m.isActive ? 'Đã vô hiệu hóa' : 'Đã kích hoạt');
  };

  const roleColors: Record<StaffMember['role'], string> = {
    'Quản lý cửa hàng': 'bg-purple-500',
    'Tư vấn viên': 'bg-blue-500',
    'Nhân viên kho': 'bg-amber-500',
    'Kỹ thuật viên': 'bg-emerald-500',
    'Thu ngân': 'bg-pink-500',
  };

  const columns = [
    {
      key: 'fullName', label: 'Nhân viên',
      render: (item: StaffMember) => (
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center text-white font-medium text-sm">
            {item.fullName.split(' ').slice(-1)[0]?.[0] ?? '?'}
          </div>
          <div>
            <p className="font-medium">{item.fullName}</p>
            <p className="text-xs text-muted-foreground">Vào làm: {new Date(item.joinedAt).toLocaleDateString('vi-VN')}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'role', label: 'Vị trí',
      render: (item: StaffMember) => (
        <Badge className={`${roleColors[item.role]} text-white border-0`}>{item.role}</Badge>
      ),
    },
    {
      key: 'branchName', label: 'Chi nhánh',
      render: (item: StaffMember) => (
        <span className="flex items-center gap-1 text-sm"><Building2 className="h-3 w-3 text-muted-foreground" />{item.branchName}</span>
      ),
    },
    {
      key: 'contact', label: 'Liên hệ',
      render: (item: StaffMember) => (
        <div className="text-xs space-y-0.5">
          <p className="flex items-center gap-1"><Mail className="h-3 w-3 text-muted-foreground" />{item.email}</p>
          <p className="flex items-center gap-1"><Phone className="h-3 w-3 text-muted-foreground" />{item.phone}</p>
        </div>
      ),
    },
    {
      key: 'isActive', label: 'Trạng thái',
      render: (item: StaffMember) => (
        <Badge variant={item.isActive ? 'default' : 'secondary'}>{item.isActive ? 'Đang làm' : 'Nghỉ việc'}</Badge>
      ),
    },
    {
      key: 'actions', label: '',
      render: (item: StaffMember) => (
        <div className="flex gap-1">
          <Button size="sm" variant="ghost" onClick={() => handleToggle(item)} title={item.isActive ? 'Vô hiệu hóa' : 'Kích hoạt'}>
            <UserCheck className={`h-4 w-4 ${item.isActive ? 'text-emerald-500' : 'text-muted-foreground'}`} />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => openEdit(item)}><Edit2 className="h-4 w-4" /></Button>
          <Button size="sm" variant="ghost" onClick={() => setDeleteTarget(item)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
        </div>
      ),
    },
  ];

  const activeCount = staff.filter(s => s.isActive).length;
  const branchCount = new Set(staff.map(s => s.branchName)).size;
  const managerCount = staff.filter(s => s.role === 'Quản lý cửa hàng').length;

  return (
    <div className="space-y-6">
      <AppBreadcrumb items={[{ label: 'Admin', href: '/admin' }, { label: 'Nhân viên' }]} />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2"><Users className="h-6 w-6 text-primary" /> Quản lý nhân viên</h1>
          <p className="text-muted-foreground">Danh sách nhân viên cửa hàng theo chi nhánh và vị trí</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchData}><RefreshCw className="h-4 w-4 mr-1" />Làm mới</Button>
          <Button size="sm" onClick={openCreate}><Plus className="h-4 w-4 mr-1" />Thêm nhân viên</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatsCard title="Tổng nhân viên" value={staff.length} icon={Users} />
        <StatsCard title="Đang làm" value={activeCount} icon={UserCheck} variant="success" />
        <StatsCard title="Chi nhánh" value={branchCount} icon={Building2} variant="info" />
        <StatsCard title="Quản lý" value={managerCount} icon={Users} variant="purple" />
      </div>

      <FilterBar
        search={search} onSearchChange={setSearch}
        searchPlaceholder="Tìm tên, email, SĐT..."
        filters={[
          { key: 'role', label: 'Vị trí', value: roleFilter, onChange: setRoleFilter, options: ['Tất cả', ...ROLES] },
          { key: 'branch', label: 'Chi nhánh', value: branchFilter, onChange: setBranchFilter, options: branches },
        ]}
      />

      <SimpleTable columns={columns} data={filtered} loading={loading} emptyMessage="Không tìm thấy nhân viên" />

      {/* Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {editTarget ? <Edit2 className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
              {editTarget ? 'Chỉnh sửa nhân viên' : 'Thêm nhân viên mới'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Họ và tên *</Label>
              <Input value={form.fullName} onChange={e => setForm(p => ({ ...p, fullName: e.target.value }))} placeholder="Nguyễn Văn A" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Email *</Label>
                <Input value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="example@cellphones.vn" />
              </div>
              <div>
                <Label>Số điện thoại</Label>
                <Input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="0901234567" />
              </div>
            </div>
            <div>
              <Label>Vị trí</Label>
              <select className="w-full border rounded-md px-3 py-2 text-sm bg-background" value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value as StaffMember['role'] }))}>
                {ROLES.map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <Label>Chi nhánh</Label>
              <select className="w-full border rounded-md px-3 py-2 text-sm bg-background" value={form.branchName} onChange={e => {
                const name = e.target.value;
                setForm(p => ({ ...p, branchName: name, branchId: `br-${branches.indexOf(name).toString().padStart(3, '0')}` }));
              }}>
                {branches.slice(1).map(b => <option key={b}>{b}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="staffActive" checked={form.isActive} onChange={e => setForm(p => ({ ...p, isActive: e.target.checked }))} />
              <Label htmlFor="staffActive" className="cursor-pointer">Đang làm việc</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)}>Hủy</Button>
            <Button onClick={handleSave}>{editTarget ? 'Lưu thay đổi' : 'Thêm nhân viên'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Xác nhận xóa</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Bạn có chắc muốn xóa nhân viên <strong>"{deleteTarget?.fullName}"</strong>?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Hủy</Button>
            <Button variant="destructive" onClick={handleDelete}>Xóa</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

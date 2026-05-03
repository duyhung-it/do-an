// ============================================================
// Quản lý nhân viên — Seller (CRUD + Phân quyền + DataTable)
// ============================================================

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Users, Plus, Pencil, Trash2, Shield, Power, PowerOff, Clock,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Checkbox } from '../ui/checkbox';
import { AppBreadcrumb } from '../shared/AppBreadcrumb';
import { StatusBadge } from '../shared/StatusBadge';
import { StatsCard } from '../shared/StatsCard';
import { DataTable } from '../shared/DataTable';
import { FilterBar } from '../shared/FilterBar';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { staffApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';
import type { StaffMember, StaffRole, Permission, PaginationParams, SortParams, ActiveFilter, FilterConfig, ColumnConfig } from '../../types';

const ROLES: StaffRole[] = ['Chủ DN', 'Quản lý', 'Nhân viên bán hàng', 'Thủ kho', 'Kế toán'];

// P5.23: Role badge colors
const ROLE_COLORS: Record<string, string> = {
  'Chủ DN': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  'Quản lý': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  'Nhân viên bán hàng': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  'Thủ kho': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  'Kế toán': 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
};

const filterConfigs: FilterConfig[] = [
  {
    key: 'role', label: 'Vai trò', type: 'select', options:
      ROLES.map(r => ({ label: r, value: r })),
  },
  {
    key: 'isActive', label: 'Trạng thái', type: 'select', options: [
      { label: 'Hoạt động', value: 'true' },
      { label: 'Vô hiệu', value: 'false' },
    ],
  },
];

const columns: ColumnConfig[] = [
  {
    key: 'fullName', label: 'Nhân viên', sortable: true,
    render: (item) => {
      const s = item as StaffMember;
      if (!s || !s.fullName) return '—';
      const initials = s.fullName.split(' ').map(w => w[0]).slice(-2).join('').toUpperCase();
      return (
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm shrink-0">
            {initials}
          </div>
          <div>
            <p className="font-medium">{s.fullName}</p>
            <p className="text-muted-foreground text-xs">{s.email || ''}</p>
          </div>
        </div>
      );
    },
  },
  {
    key: 'role', label: 'Vai trò', sortable: true,
    render: (item) => {
      const s = item as StaffMember;
      if (!s || !s.role) return '—';
      const role = s.role;
      return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs ${ROLE_COLORS[role] ?? 'bg-muted text-muted-foreground'}`}>{role}</span>;
    },
  },
  {
    key: 'permissions', label: 'Quyền',
    render: (item) => {
      const s = item as StaffMember;
      if (!s || !s.permissions || !Array.isArray(s.permissions)) return '—';
      const perms = s.permissions.slice(0, 3);
      return (
        <div className="flex flex-wrap gap-1">
          {perms.map(p => (
            <Badge key={p} variant="outline" className="text-xs">{p}</Badge>
          ))}
          {s.permissions.length > 3 && (
            <Badge variant="secondary" className="text-xs">+{s.permissions.length - 3}</Badge>
          )}
        </div>
      );
    },
  },
  {
    key: 'lastLogin', label: 'Đăng nhập cuối', sortable: true,
    render: (item) => {
      const s = item as StaffMember;
      if (!s) return '—';
      return s.lastLogin ? (
        <span className="text-muted-foreground flex items-center gap-1">
          <Clock className="h-3 w-3" /> {s.lastLogin}
        </span>
      ) : <span className="text-muted-foreground">Chưa đăng nhập</span>;
    },
  },
  {
    key: 'isActive', label: 'Trạng thái', sortable: true,
    render: (item) => {
      const s = item as StaffMember;
      if (!s) return '—';
      return <StatusBadge status={s.isActive ? 'Hoạt động' : 'Bị khoá'} />;
    },
  },
];

export function SellerStaffList() {
  const { user } = useAuth();
  const [allStaff, setAllStaff] = useState<StaffMember[]>([]);
  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<ActiveFilter[]>([]);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState<PaginationParams>({ page: 1, pageSize: 10 });
  const [sort, setSort] = useState<SortParams>({});

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<StaffMember | null>(null);
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', role: 'Nhân viên bán hàng' as StaffRole });

  // Permission dialog
  const [permStaff, setPermStaff] = useState<StaffMember | null>(null);
  const [selectedPerms, setSelectedPerms] = useState<string[]>([]);

  const fetchData = useCallback(async () => {
    if (!user?.supplierId) return;
    setLoading(true);
    try {
      const [staffData, perms] = await Promise.all([
        staffApi.getBySeller(user.supplierId),
        staffApi.getPermissions(),
      ]);
      setAllStaff(staffData);
      setAllPermissions(perms);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Client-side filter + sort + paginate
  const { pageData, totalItems } = useMemo(() => {
    let data = [...allStaff];

    // Search
    if (search) {
      const s = search.toLowerCase();
      data = data.filter(m =>
        m.fullName.toLowerCase().includes(s) ||
        m.email.toLowerCase().includes(s) ||
        m.phone.includes(s),
      );
    }

    // Filters
    for (const f of filters) {
      if (f.key === 'role') data = data.filter(m => m.role === f.value);
      if (f.key === 'isActive') data = data.filter(m => String(m.isActive) === f.value);
    }

    // Sort
    if (sort.field) {
      data.sort((a, b) => {
        const va = (a as unknown as Record<string, unknown>)[sort.field!];
        const vb = (b as unknown as Record<string, unknown>)[sort.field!];
        const cmp = typeof va === 'string' ? (va as string).localeCompare(vb as string) : 0;
        return sort.direction === 'desc' ? -cmp : cmp;
      });
    }

    const total = data.length;
    const start = (pagination.page - 1) * pagination.pageSize;
    return { pageData: data.slice(start, start + pagination.pageSize), totalItems: total };
  }, [allStaff, search, filters, sort, pagination]);

  const stats = useMemo(() => {
    const total = allStaff.length;
    const active = allStaff.filter(s => s.isActive).length;
    return { total, active, inactive: total - active };
  }, [allStaff]);

  // Permission groups
  const permGroups = useMemo(() => {
    const groups: Record<string, Permission[]> = {};
    allPermissions.forEach(p => {
      if (!groups[p.group]) groups[p.group] = [];
      groups[p.group].push(p);
    });
    return groups;
  }, [allPermissions]);

  const openCreate = () => {
    setEditing(null);
    setForm({ fullName: '', email: '', phone: '', role: 'Nhân viên bán hàng' });
    setShowForm(true);
  };

  const openEdit = (s: StaffMember) => {
    setEditing(s);
    setForm({ fullName: s.fullName, email: s.email, phone: s.phone, role: s.role });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.fullName.trim() || !form.email.trim()) {
      toast.error('Vui lòng nhập tên và email');
      return;
    }
    try {
      if (editing) {
        await staffApi.update(editing.id, form);
        toast.success('Cập nhật nhân viên thành công');
      } else {
        await staffApi.create({
          ...form,
          supplierId: user?.supplierId ?? '',
          permissions: [],
          isActive: true,
        });
        toast.success('Thêm nhân viên thành công');
      }
      setShowForm(false);
      fetchData();
    } catch {
      toast.error('Có lỗi xảy ra');
    }
  };

  const handleDelete = async (s: StaffMember) => {
    if (s.role === 'Chủ DN') { toast.error('Không thể xoá tài khoản Chủ DN'); return; }
    if (!confirm(`Xoá nhân viên ${s.fullName}?`)) return;
    try {
      await staffApi.delete(s.id);
      toast.success('Đã xoá nhân viên');
      fetchData();
    } catch {
      toast.error('Có lỗi xảy ra');
    }
  };

  const handleToggleActive = async (s: StaffMember) => {
    if (s.role === 'Chủ DN') { toast.error('Không thể vô hiệu hoá Chủ DN'); return; }
    try {
      await staffApi.toggleActive(s.id, !s.isActive);
      toast.success(s.isActive ? 'Đã vô hiệu hoá' : 'Đã kích hoạt');
      fetchData();
    } catch {
      toast.error('Có lỗi xảy ra');
    }
  };

  const openPermissions = (s: StaffMember) => {
    setPermStaff(s);
    setSelectedPerms([...s.permissions]);
  };

  const togglePerm = (key: string) => {
    setSelectedPerms(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key],
    );
  };

  const toggleGroupAll = (group: string) => {
    const keys = permGroups[group]?.map(p => p.key) ?? [];
    const allSelected = keys.every(k => selectedPerms.includes(k));
    if (allSelected) {
      setSelectedPerms(prev => prev.filter(k => !keys.includes(k)));
    } else {
      setSelectedPerms(prev => [...new Set([...prev, ...keys])]);
    }
  };

  const handleSavePermissions = async () => {
    if (!permStaff) return;
    try {
      await staffApi.updatePermissions(permStaff.id, selectedPerms);
      toast.success('Cập nhật quyền thành công');
      setPermStaff(null);
      fetchData();
    } catch {
      toast.error('Có lỗi xảy ra');
    }
  };

  return (
    <div className="space-y-6">
      <AppBreadcrumb items={[{ label: 'Kênh người bán', href: '/seller' }, { label: 'Nhân viên' }]} />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" /> Quản lý nhân viên
          </h1>
          <p className="text-muted-foreground">Quản lý nhân sự và phân quyền truy cập</p>
        </div>
        <Button onClick={openCreate}><Plus className="h-4 w-4 mr-1" /> Thêm nhân viên</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <StatsCard title="Tổng nhân viên" value={stats.total} icon={Users} variant="primary" />
        <StatsCard title="Hoạt động" value={stats.active} icon={Power} variant="success" />
        <StatsCard title="Vô hiệu" value={stats.inactive} icon={PowerOff} variant="danger" />
      </div>

      <FilterBar
        filters={filterConfigs}
        activeFilters={filters}
        onFilterChange={setFilters}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Tìm tên, email, SĐT..."
      />

      <DataTable<StaffMember>
        data={pageData}
        columns={columns}
        totalItems={totalItems}
        pagination={pagination}
        sort={sort}
        onPaginationChange={setPagination}
        onSortChange={setSort}
        getId={s => s.id}
        loading={loading}
        renderActions={s => (
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" title="Phân quyền" onClick={() => openPermissions(s)}>
              <Shield className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" title="Sửa" onClick={() => openEdit(s)}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" title={s.isActive ? 'Vô hiệu' : 'Kích hoạt'} onClick={() => handleToggleActive(s)}>
              {s.isActive ? <PowerOff className="h-4 w-4 text-orange-500" /> : <Power className="h-4 w-4 text-green-500" />}
            </Button>
            {s.role !== 'Chủ DN' && (
              <Button variant="ghost" size="sm" title="Xoá" onClick={() => handleDelete(s)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            )}
          </div>
        )}
      />

      {/* Add/Edit dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Sửa nhân viên' : 'Thêm nhân viên mới'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div><Label>Họ tên *</Label><Input value={form.fullName} onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))} /></div>
            <div><Label>Email *</Label><Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
            <div><Label>Số điện thoại</Label><Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></div>
            <div>
              <Label>Vai trò</Label>
              <Select value={form.role} onValueChange={v => setForm(f => ({ ...f, role: v as StaffRole }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ROLES.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)}>Huỷ</Button>
            <Button onClick={handleSave}>{editing ? 'Cập nhật' : 'Tạo'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Permission dialog */}
      <Dialog open={!!permStaff} onOpenChange={() => setPermStaff(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {permStaff && (
            <>
              <DialogHeader>
                <DialogTitle>Phân quyền — {permStaff.fullName}</DialogTitle>
                <DialogDescription>{permStaff.role} · {selectedPerms.length}/{allPermissions.length} quyền</DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {Object.entries(permGroups).map(([group, perms]) => {
                  const allSelected = perms.every(p => selectedPerms.includes(p.key));
                  const someSelected = perms.some(p => selectedPerms.includes(p.key));
                  return (
                    <div key={group} className="border rounded-md p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Checkbox
                          checked={allSelected}
                          // @ts-ignore indeterminate support
                          data-state={someSelected && !allSelected ? 'indeterminate' : undefined}
                          onCheckedChange={() => toggleGroupAll(group)}
                        />
                        <span className="font-medium">{group}</span>
                        <Badge variant="secondary">{perms.filter(p => selectedPerms.includes(p.key)).length}/{perms.length}</Badge>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 ml-6">
                        {perms.map(p => (
                          <label key={p.key} className="flex items-center gap-2 cursor-pointer">
                            <Checkbox
                              checked={selectedPerms.includes(p.key)}
                              onCheckedChange={() => togglePerm(p.key)}
                            />
                            <span className="text-muted-foreground">{p.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setPermStaff(null)}>Huỷ</Button>
                <Button onClick={handleSavePermissions}>Lưu quyền</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
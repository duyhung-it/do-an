// ============================================================
// Trang quản lý nhóm mua hàng — Buyer (Nhóm 27)
// Bao gồm: thống kê, danh sách thành viên, mời TV, phân quyền,
// thông tin công ty, CRUD/lọc/phân trang/sắp xếp
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import {
  Users, UserPlus, Shield, Building2, Mail, Phone, Clock,
  MoreHorizontal, Trash2, Lock, Unlock, Edit, Eye, Crown,
  Briefcase, Calculator, UserCheck, Download, GitBranch,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Checkbox } from '../ui/checkbox';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '../ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '../ui/select';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator,
} from '../ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { DataTable } from '../shared/DataTable';
import { StatusBadge } from '../shared/StatusBadge';
import { FilterBar } from '../shared/FilterBar';
import { AppBreadcrumb } from '../shared/AppBreadcrumb';
import { buyerTeamApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';
import type {
  BuyerTeamMember, BuyerCompany, BuyerPermission, BuyerRole,
  BuyerTeamStats, BuyerMemberStatus, PaginationParams, SortParams, ActiveFilter,
} from '../../types';

const COMPANY_ID = 'bcomp-001';
const ALL_ROLES: BuyerRole[] = ['Giám đốc', 'Quản lý', 'Kế toán', 'Nhân viên'];
const ALL_STATUSES: BuyerMemberStatus[] = ['Hoạt động', 'Đã khoá', 'Chờ xác nhận'];

const roleIcon = (role: BuyerRole) => {
  switch (role) {
    case 'Giám đốc': return <Crown className="h-4 w-4 text-amber-500" />;
    case 'Quản lý': return <Briefcase className="h-4 w-4 text-blue-500" />;
    case 'Kế toán': return <Calculator className="h-4 w-4 text-green-500" />;
    case 'Nhân viên': return <UserCheck className="h-4 w-4 text-gray-500" />;
    default: return <Users className="h-4 w-4" />;
  }
};

const statusVariant = (status: BuyerMemberStatus) => {
  switch (status) {
    case 'Hoạt động': return 'success';
    case 'Đã khoá': return 'error';
    case 'Chờ xác nhận': return 'warning';
    default: return 'default';
  }
};

export function BuyerTeamPage() {
  const { user } = useAuth();

  // Data
  const [members, setMembers] = useState<BuyerTeamMember[]>([]);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState<BuyerTeamStats | null>(null);
  const [company, setCompany] = useState<BuyerCompany | null>(null);
  const [allPermissions, setAllPermissions] = useState<BuyerPermission[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination & Sort
  const [pagination, setPagination] = useState<PaginationParams>({ page: 1, pageSize: 10 });
  const [sort, setSort] = useState<SortParams>({ field: 'joinedAt', direction: 'desc' });

  // Filters
  const [filters, setFilters] = useState<ActiveFilter[]>([]);
  const [searchText, setSearchText] = useState('');

  // Dialogs
  const [showInvite, setShowInvite] = useState(false);
  const [showPermissions, setShowPermissions] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [showCompany, setShowCompany] = useState(false);
  const [selected, setSelected] = useState<BuyerTeamMember | null>(null);
  const [editMode, setEditMode] = useState(false);

  // Invite form
  const [inviteForm, setInviteForm] = useState({
    fullName: '', email: '', phone: '', role: 'Nhân viên' as BuyerRole, permissions: [] as string[],
  });

  // Permission edit
  const [editPermissions, setEditPermissions] = useState<string[]>([]);

  // Company edit form
  const [companyForm, setCompanyForm] = useState<Partial<BuyerCompany>>({});

  // View mode
  const [viewMode, setViewMode] = useState<'table' | 'orgchart'>('table');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const activeFilters: ActiveFilter[] = [...filters];
      if (searchText) activeFilters.push({ key: 'search', value: searchText });

      const [res, s, c, perms] = await Promise.all([
        buyerTeamApi.getByCompany(COMPANY_ID, pagination, sort, activeFilters),
        buyerTeamApi.getStats(COMPANY_ID),
        buyerTeamApi.getCompany(COMPANY_ID),
        buyerTeamApi.getPermissions(),
      ]);
      setMembers(res.data);
      setTotal(res.total);
      setStats(s);
      if (c) setCompany(c);
      setAllPermissions(perms);
    } finally {
      setLoading(false);
    }
  }, [pagination, sort, filters, searchText]);

  useEffect(() => { loadData(); }, [loadData]);

  // Mời thành viên
  const handleInvite = async () => {
    if (!inviteForm.fullName || !inviteForm.email) {
      toast.error('Vui lòng nhập đầy đủ thông tin');
      return;
    }
    try {
      await buyerTeamApi.invite({ companyId: COMPANY_ID, ...inviteForm });
      toast.success(`Đã gửi lời mời đến ${inviteForm.email}`);
      setShowInvite(false);
      setInviteForm({ fullName: '', email: '', phone: '', role: 'Nhân viên', permissions: [] });
      loadData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Lỗi khi mời thành viên');
    }
  };

  // Xoá thành viên
  const handleRemove = async (member: BuyerTeamMember) => {
    if (!confirm(`Bạn có chắc muốn xoá ${member.fullName} khỏi nhóm?`)) return;
    try {
      await buyerTeamApi.remove(member.id);
      toast.success(`Đã xoá ${member.fullName}`);
      loadData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Lỗi khi xoá thành viên');
    }
  };

  // Khoá/Mở khoá
  const handleToggleStatus = async (member: BuyerTeamMember) => {
    try {
      await buyerTeamApi.toggleStatus(member.id);
      toast.success(member.status === 'Hoạt động' ? `Đã khoá ${member.fullName}` : `Đã mở khoá ${member.fullName}`);
      loadData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Lỗi');
    }
  };

  // Cập nhật quyền
  const handleSavePermissions = async () => {
    if (!selected) return;
    try {
      await buyerTeamApi.updatePermissions(selected.id, editPermissions);
      toast.success('Đã cập nhật quyền');
      setShowPermissions(false);
      loadData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Lỗi cập nhật quyền');
    }
  };

  // Cập nhật vai trò
  const handleChangeRole = async (member: BuyerTeamMember, newRole: BuyerRole) => {
    try {
      const defaultPerms = await buyerTeamApi.getDefaultPermissions(newRole);
      await buyerTeamApi.update(member.id, { role: newRole, permissions: defaultPerms });
      toast.success(`Đã đổi vai trò ${member.fullName} thành ${newRole}`);
      loadData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Lỗi');
    }
  };

  // Cập nhật thông tin công ty
  const handleSaveCompany = async () => {
    if (!company) return;
    try {
      await buyerTeamApi.updateCompany(company.id, companyForm);
      toast.success('Đã cập nhật thông tin công ty');
      setShowCompany(false);
      loadData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Lỗi cập nhật');
    }
  };

  // Tải khi chọn vai trò mời
  const handleInviteRoleChange = async (role: BuyerRole) => {
    const perms = await buyerTeamApi.getDefaultPermissions(role);
    setInviteForm(prev => ({ ...prev, role, permissions: perms }));
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Họ tên', 'Email', 'SĐT', 'Vai trò', 'Trạng thái', 'Ngày tham gia'];
    const rows = members.map(m => [m.fullName, m.email, m.phone, m.role, m.status, m.joinedAt]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'nhom-mua-hang.csv';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Đã xuất CSV');
  };

  // DataTable columns
  const columns = [
    {
      key: 'fullName',
      label: 'Thành viên',
      sortable: true,
      render: (m: BuyerTeamMember) => (
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <span className="text-primary">
              {m.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
            </span>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="truncate">{m.fullName}</span>
              {m.role === 'Giám đốc' && <Crown className="h-3.5 w-3.5 text-amber-500 shrink-0" />}
            </div>
            <p className="text-muted-foreground truncate">{m.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      label: 'Vai trò',
      sortable: true,
      render: (m: BuyerTeamMember) => (
        <div className="flex items-center gap-1.5">
          {roleIcon(m.role)}
          <span>{m.role}</span>
        </div>
      ),
    },
    {
      key: 'permissions',
      label: 'Quyền',
      render: (m: BuyerTeamMember) => (
        <div className="flex flex-wrap gap-1 max-w-[200px]">
          {m.permissions.length === allPermissions.length ? (
            <Badge variant="secondary">Toàn quyền</Badge>
          ) : (
            <>
              {m.permissions.slice(0, 2).map(p => {
                const perm = allPermissions.find(ap => ap.key === p);
                return <Badge key={p} variant="outline">{perm?.label ?? p}</Badge>;
              })}
              {m.permissions.length > 2 && (
                <Badge variant="outline">+{m.permissions.length - 2}</Badge>
              )}
            </>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Trạng thái',
      sortable: true,
      render: (m: BuyerTeamMember) => (
        <StatusBadge status={m.status} variant={statusVariant(m.status) as 'success' | 'error' | 'warning' | 'default'} />
      ),
    },
    {
      key: 'joinedAt',
      label: 'Ngày tham gia',
      sortable: true,
      render: (m: BuyerTeamMember) => (
        <span className="text-muted-foreground">{m.joinedAt}</span>
      ),
    },
    {
      key: 'lastActiveAt',
      label: 'Hoạt động gần nhất',
      sortable: true,
      render: (m: BuyerTeamMember) => (
        <span className="text-muted-foreground">{m.lastActiveAt}</span>
      ),
    },
  ];

  // FilterBar config
  const filterConfigs = [
    {
      key: 'role',
      label: 'Vai trò',
      type: 'select' as const,
      options: ALL_ROLES.map(r => ({ label: r, value: r })),
    },
    {
      key: 'status',
      label: 'Trạng thái',
      type: 'select' as const,
      options: ALL_STATUSES.map(s => ({ label: s, value: s })),
    },
  ];

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <AppBreadcrumb items={[{ label: 'Trang chủ', href: '/' }, { label: 'Nhóm mua hàng' }]} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            Nhóm mua hàng
          </h1>
          <p className="text-muted-foreground mt-1">
            Quản lý thành viên, phân quyền và thông tin công ty
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExportCSV}>
            <Download className="h-4 w-4 mr-1" /> Xuất CSV
          </Button>
          <Button size="sm" onClick={() => { setShowInvite(true); handleInviteRoleChange('Nhân viên'); }}>
            <UserPlus className="h-4 w-4 mr-1" /> Mời thành viên
          </Button>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-muted-foreground">Tổng thành viên</p>
                  <p className="text-2xl">{stats.totalMembers}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-100 text-green-600">
                  <UserCheck className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-muted-foreground">Đang hoạt động</p>
                  <p className="text-2xl">{stats.activeMembers}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-100 text-amber-600">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-muted-foreground">Chờ xác nhận</p>
                  <p className="text-2xl">{stats.pendingInvites}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-muted-foreground">Vai trò</p>
                  <div className="flex gap-1 flex-wrap mt-0.5">
                    {stats.roles.filter(r => r.count > 0).map(r => (
                      <Badge key={r.role} variant="outline">{r.role}: {r.count}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs: Thành viên / Công ty */}
      <Tabs defaultValue="members" className="space-y-4">
        <TabsList>
          <TabsTrigger value="members">
            <Users className="h-4 w-4 mr-1" /> Thành viên
          </TabsTrigger>
          <TabsTrigger value="company">
            <Building2 className="h-4 w-4 mr-1" /> Công ty
          </TabsTrigger>
        </TabsList>

        {/* Tab: Thành viên */}
        <TabsContent value="members" className="space-y-4">
          {/* Search + Filter + View Toggle */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Input
                placeholder="Tìm theo tên, email..."
                value={searchText}
                onChange={e => { setSearchText(e.target.value); setPagination(p => ({ ...p, page: 1 })); }}
              />
            </div>
            <FilterBar
              filters={filterConfigs}
              activeFilters={filters}
              onFilterChange={f => { setFilters(f); setPagination(p => ({ ...p, page: 1 })); }}
            />
            <div className="flex gap-1 border rounded-lg p-0.5 shrink-0">
              <Button
                variant={viewMode === 'table' ? 'secondary' : 'ghost'}
                size="sm"
                className="h-8 px-3"
                onClick={() => setViewMode('table')}
              >
                <Users className="h-4 w-4 mr-1" /> Bảng
              </Button>
              <Button
                variant={viewMode === 'orgchart' ? 'secondary' : 'ghost'}
                size="sm"
                className="h-8 px-3"
                onClick={() => setViewMode('orgchart')}
              >
                <GitBranch className="h-4 w-4 mr-1" /> Sơ đồ
              </Button>
            </div>
          </div>

          {viewMode === 'table' ? (
            /* DataTable */
            <DataTable
              columns={columns}
              data={members}
              loading={loading}
              totalItems={total}
              pagination={pagination}
              sort={sort}
              onPaginationChange={setPagination}
              onSortChange={setSort}
              getId={(m: BuyerTeamMember) => m.id}
              renderActions={(member: BuyerTeamMember) => (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => { setSelected(member); setShowDetail(true); }}>
                      <Eye className="h-4 w-4 mr-2" /> Xem chi tiết
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => {
                      setSelected(member);
                      setEditPermissions([...member.permissions]);
                      setShowPermissions(true);
                    }}>
                      <Shield className="h-4 w-4 mr-2" /> Phân quyền
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {member.role !== 'Giám đốc' && (
                      <>
                        <DropdownMenuItem onClick={() => handleToggleStatus(member)}>
                          {member.status === 'Hoạt động' ? (
                            <><Lock className="h-4 w-4 mr-2" /> Khoá tài khoản</>
                          ) : (
                            <><Unlock className="h-4 w-4 mr-2" /> Mở khoá</>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => handleRemove(member)}>
                          <Trash2 className="h-4 w-4 mr-2" /> Xoá khỏi nhóm
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            />
          ) : (
            /* Org Chart View */
            <OrgChartView
              members={members}
              onSelect={(m) => { setSelected(m); setShowDetail(true); }}
            />
          )}
        </TabsContent>

        {/* Tab: Công ty */}
        <TabsContent value="company">
          {company && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" /> Thông tin công ty
                  </CardTitle>
                  <Button variant="outline" size="sm" onClick={() => {
                    setCompanyForm({
                      name: company.name, taxCode: company.taxCode,
                      address: company.address, city: company.city,
                      industry: company.industry, contactPerson: company.contactPerson,
                      email: company.email, phone: company.phone,
                    });
                    setShowCompany(true);
                  }}>
                    <Edit className="h-4 w-4 mr-1" /> Chỉnh sửa
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <InfoRow label="Tên công ty" value={company.name} />
                    <InfoRow label="Mã số thuế" value={company.taxCode} />
                    <InfoRow label="Ngành nghề" value={company.industry} />
                    <InfoRow label="Ngày tham gia" value={company.createdAt} />
                  </div>
                  <div className="space-y-4">
                    <InfoRow label="Địa chỉ" value={`${company.address}, ${company.city}`} />
                    <InfoRow label="Người đại diện" value={company.contactPerson} />
                    <InfoRow label="Email" value={company.email} icon={<Mail className="h-4 w-4" />} />
                    <InfoRow label="Điện thoại" value={company.phone} icon={<Phone className="h-4 w-4" />} />
                  </div>
                </div>
                <Separator className="my-6" />
                <div>
                  <p className="text-muted-foreground mb-2">Số lượng thành viên</p>
                  <div className="flex gap-4 flex-wrap">
                    {stats?.roles.map(r => (
                      <div key={r.role} className="flex items-center gap-2">
                        {roleIcon(r.role)}
                        <span>{r.role}:</span>
                        <Badge variant="secondary">{r.count}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Dialog: Mời thành viên */}
      <Dialog open={showInvite} onOpenChange={setShowInvite}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Mời thành viên mới</DialogTitle>
            <DialogDescription>
              Gửi lời mời qua email để thêm thành viên vào nhóm mua hàng
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Họ và tên *</Label>
              <Input
                value={inviteForm.fullName}
                onChange={e => setInviteForm(prev => ({ ...prev, fullName: e.target.value }))}
                placeholder="Nhập họ và tên"
              />
            </div>
            <div>
              <Label>Email *</Label>
              <Input
                type="email"
                value={inviteForm.email}
                onChange={e => setInviteForm(prev => ({ ...prev, email: e.target.value }))}
                placeholder="email@congty.vn"
              />
            </div>
            <div>
              <Label>Số điện thoại</Label>
              <Input
                value={inviteForm.phone}
                onChange={e => setInviteForm(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="0912345678"
              />
            </div>
            <div>
              <Label>Vai trò</Label>
              <Select value={inviteForm.role} onValueChange={(v) => handleInviteRoleChange(v as BuyerRole)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ALL_ROLES.filter(r => r !== 'Giám đốc').map(r => (
                    <SelectItem key={r} value={r}>
                      <span className="flex items-center gap-2">{roleIcon(r)} {r}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Separator />
            <div>
              <Label className="mb-2 block">Phân quyền</Label>
              <div className="space-y-2">
                {allPermissions.map(p => (
                  <label key={p.key} className="flex items-start gap-2 cursor-pointer hover:bg-muted/50 rounded p-2 -mx-2">
                    <Checkbox
                      checked={inviteForm.permissions.includes(p.key)}
                      onCheckedChange={(checked) => {
                        setInviteForm(prev => ({
                          ...prev,
                          permissions: checked
                            ? [...prev.permissions, p.key]
                            : prev.permissions.filter(k => k !== p.key),
                        }));
                      }}
                    />
                    <div>
                      <span>{p.label}</span>
                      <p className="text-muted-foreground">{p.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInvite(false)}>Huỷ</Button>
            <Button onClick={handleInvite}>
              <Mail className="h-4 w-4 mr-1" /> Gửi lời mời
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Phân quyền */}
      <Dialog open={showPermissions} onOpenChange={setShowPermissions}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Phân quyền — {selected?.fullName}</DialogTitle>
            <DialogDescription>
              Vai trò: {selected?.role}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Quick set by role */}
            <div>
              <Label>Đặt theo vai trò</Label>
              <div className="flex gap-2 flex-wrap mt-1">
                {ALL_ROLES.map(r => (
                  <Button key={r} variant="outline" size="sm" onClick={async () => {
                    const perms = await buyerTeamApi.getDefaultPermissions(r);
                    setEditPermissions(perms);
                  }}>
                    {roleIcon(r)} {r}
                  </Button>
                ))}
              </div>
            </div>
            <Separator />
            <div className="space-y-2">
              {allPermissions.map(p => (
                <label key={p.key} className="flex items-start gap-2 cursor-pointer hover:bg-muted/50 rounded p-2 -mx-2">
                  <Checkbox
                    checked={editPermissions.includes(p.key)}
                    onCheckedChange={(checked) => {
                      setEditPermissions(prev =>
                        checked ? [...prev, p.key] : prev.filter(k => k !== p.key),
                      );
                    }}
                  />
                  <div>
                    <span>{p.label}</span>
                    <p className="text-muted-foreground">{p.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPermissions(false)}>Huỷ</Button>
            <Button onClick={handleSavePermissions}>Lưu quyền</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Chi tiết thành viên */}
      <Dialog open={showDetail} onOpenChange={setShowDetail}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Chi tiết thành viên</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-primary text-xl">
                    {selected.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 className="flex items-center gap-2">
                    {selected.fullName}
                    {selected.role === 'Giám đốc' && <Crown className="h-4 w-4 text-amber-500" />}
                  </h3>
                  <p className="text-muted-foreground">{selected.email}</p>
                </div>
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-4">
                <InfoRow label="Vai trò" value={selected.role} />
                <InfoRow label="Trạng thái" value={selected.status} />
                <InfoRow label="SĐT" value={selected.phone} />
                <InfoRow label="Ngày tham gia" value={selected.joinedAt} />
                <InfoRow label="Hoạt động gần nhất" value={selected.lastActiveAt} />
              </div>
              <Separator />
              <div>
                <p className="text-muted-foreground mb-2">Quyền hạn</p>
                <div className="flex flex-wrap gap-1.5">
                  {selected.permissions.map(p => {
                    const perm = allPermissions.find(ap => ap.key === p);
                    return (
                      <Badge key={p} variant="outline">{perm?.label ?? p}</Badge>
                    );
                  })}
                </div>
              </div>
              {selected.role !== 'Giám đốc' && (
                <>
                  <Separator />
                  <div>
                    <Label>Đổi vai trò</Label>
                    <Select value={selected.role} onValueChange={(v) => handleChangeRole(selected, v as BuyerRole)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {ALL_ROLES.filter(r => r !== 'Giám đốc').map(r => (
                          <SelectItem key={r} value={r}>{r}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog: Chỉnh sửa thông tin công ty */}
      <Dialog open={showCompany} onOpenChange={setShowCompany}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa thông tin công ty</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Tên công ty</Label>
              <Input value={companyForm.name ?? ''} onChange={e => setCompanyForm(p => ({ ...p, name: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Mã số thuế</Label>
                <Input value={companyForm.taxCode ?? ''} onChange={e => setCompanyForm(p => ({ ...p, taxCode: e.target.value }))} />
              </div>
              <div>
                <Label>Ngành nghề</Label>
                <Input value={companyForm.industry ?? ''} onChange={e => setCompanyForm(p => ({ ...p, industry: e.target.value }))} />
              </div>
            </div>
            <div>
              <Label>Địa chỉ</Label>
              <Input value={companyForm.address ?? ''} onChange={e => setCompanyForm(p => ({ ...p, address: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Thành phố</Label>
                <Input value={companyForm.city ?? ''} onChange={e => setCompanyForm(p => ({ ...p, city: e.target.value }))} />
              </div>
              <div>
                <Label>Người đại diện</Label>
                <Input value={companyForm.contactPerson ?? ''} onChange={e => setCompanyForm(p => ({ ...p, contactPerson: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Email</Label>
                <Input type="email" value={companyForm.email ?? ''} onChange={e => setCompanyForm(p => ({ ...p, email: e.target.value }))} />
              </div>
              <div>
                <Label>Điện thoại</Label>
                <Input value={companyForm.phone ?? ''} onChange={e => setCompanyForm(p => ({ ...p, phone: e.target.value }))} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCompany(false)}>Huỷ</Button>
            <Button onClick={handleSaveCompany}>Lưu thay đổi</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ====== Org Chart View (P3.37) ======
const ROLE_ORDER: BuyerRole[] = ['Giám đốc', 'Quản lý', 'Kế toán', 'Nhân viên'];
const roleBgColor = (role: BuyerRole) => {
  switch (role) {
    case 'Giám đốc': return 'bg-amber-100 border-amber-300';
    case 'Quản lý': return 'bg-blue-100 border-blue-300';
    case 'Kế toán': return 'bg-green-100 border-green-300';
    case 'Nhân viên': return 'bg-gray-100 border-gray-300';
    default: return 'bg-muted border-border';
  }
};

function OrgChartView({ members, onSelect }: { members: BuyerTeamMember[]; onSelect: (m: BuyerTeamMember) => void }) {
  const grouped = ROLE_ORDER.map(role => ({
    role,
    members: members.filter(m => m.role === role),
  })).filter(g => g.members.length > 0);

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col items-center gap-6">
          {grouped.map((group, gIdx) => (
            <div key={group.role} className="w-full">
              {gIdx > 0 && (
                <div className="flex justify-center mb-4">
                  <div className="w-0.5 h-6 bg-border" />
                </div>
              )}
              <div className="flex justify-center mb-3">
                <Badge variant="secondary" className="gap-1.5 px-3 py-1">
                  {roleIcon(group.role)} {group.role}
                </Badge>
              </div>
              {group.members.length > 1 && (
                <div className="flex justify-center mb-2">
                  <div className="h-0.5 bg-border" style={{ width: `${Math.min(group.members.length * 160, 640)}px` }} />
                </div>
              )}
              <div className="flex flex-wrap justify-center gap-4">
                {group.members.map(m => (
                  <button
                    key={m.id}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all hover:shadow-md hover:scale-105 cursor-pointer w-36 ${roleBgColor(m.role)}`}
                    onClick={() => onSelect(m)}
                  >
                    <div className="h-12 w-12 rounded-full bg-white/80 flex items-center justify-center shadow-sm">
                      <span className="text-primary">
                        {m.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                      </span>
                    </div>
                    <div className="text-center min-w-0 w-full">
                      <p className="text-sm truncate">{m.fullName}</p>
                      <p className="text-xs text-muted-foreground truncate">{m.role}</p>
                    </div>
                    <StatusBadge
                      status={m.status}
                      variant={statusVariant(m.status) as 'success' | 'error' | 'warning' | 'default'}
                    />
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Helper component
function InfoRow({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div>
      <p className="text-muted-foreground">{label}</p>
      <p className="flex items-center gap-1.5">{icon}{value}</p>
    </div>
  );
}
// ============================================================
// Quản lý người dùng — Nâng cấp Nhóm 11 (Đợt 6)
// Tab vai trò, Stats/biểu đồ, Chi tiết tabs, Ban, CSV, Card view
// ============================================================

import { DataTable } from '../shared/DataTable';
import { FilterBar } from '../shared/FilterBar';
import { AppBreadcrumb } from '../shared/AppBreadcrumb';
import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Trash2, Eye, AlertCircle, Users, ShieldCheck, Download,
  Ban, UserCheck,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Card, CardContent } from '../ui/card';
import { StatusBadge } from '../shared/StatusBadge';
import { adminActivityLogApi, adminUserApi } from '../../services/adminBackendApi';
import { toast } from 'sonner';
import type {
  User, Order, Review, ActivityLog,
  PaginationParams, SortParams, ActiveFilter, FilterConfig, ColumnConfig,
} from '../../types';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';

const PIE_COLORS = ['#3b82f6', '#22c55e', '#f59e0b'];
const getRoleDisplayName = (role: string) => role === 'Nhà cung cấp' ? 'Đối tác' : role;

const columns: ColumnConfig[] = [
  { key: 'fullName', label: 'Họ tên', visible: true, sortable: true, editable: true, type: 'text' },
  { key: 'email', label: 'Email', visible: true, sortable: true },
  { key: 'phone', label: 'Điện thoại', visible: true, sortable: false },
  { key: 'role', label: 'Vai trò', visible: true, sortable: true, editable: true, type: 'select', options: ['Người mua', 'Nhà cung cấp', 'Quản trị viên'] },
  { key: 'status', label: 'Trạng thái', visible: true, sortable: true, editable: true, type: 'select', options: ['Hoạt động', 'Bị khoá', 'Chờ xác minh'] },
  { key: 'companyName', label: 'Đơn vị', visible: true, sortable: true },
  { key: 'createdAt', label: 'Ngày tạo', visible: true, sortable: true },
];

const filterConfigs: FilterConfig[] = [
  { key: 'role', label: 'Vai trò', type: 'select', options: [
    { label: 'Người mua', value: 'Người mua' },
    { label: 'Đối tác', value: 'Nhà cung cấp' },
    { label: 'Quản trị viên', value: 'Quản trị viên' },
  ]},
  { key: 'status', label: 'Trạng thái', type: 'select', options: [
    { label: 'Hoạt động', value: 'Hoạt động' },
    { label: 'Bị khoá', value: 'Bị khoá' },
    { label: 'Chờ xác minh', value: 'Chờ xác minh' },
  ]},
];

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationParams>({ page: 1, pageSize: 10 });
  const [sort, setSort] = useState<SortParams>({ field: '', direction: 'asc' });
  const [filters, setFilters] = useState<ActiveFilter[]>([]);
  const [search, setSearch] = useState('');
  const [roleTab, setRoleTab] = useState<'all' | 'buyer' | 'seller'>('all');

  // Detail
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [detailTab, setDetailTab] = useState('info');
  const [userOrders, setUserOrders] = useState<Order[]>([]);
  const [userReviews, setUserReviews] = useState<Review[]>([]);
  const [userLogs, setUserLogs] = useState<ActivityLog[]>([]);

  // Delete / Ban
  const [deleteConfirm, setDeleteConfirm] = useState<User | null>(null);
  const [banDialog, setBanDialog] = useState<User | null>(null);
  const [banReason, setBanReason] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Build filters with role tab
      const activeFilters = [...filters];
      if (roleTab === 'buyer') activeFilters.push({ key: 'role', value: 'Người mua' });
      if (roleTab === 'seller') activeFilters.push({ key: 'role', value: 'Nhà cung cấp' });

      const [allRes, pageRes] = await Promise.all([
        adminUserApi.getPaginated({ page: 1, pageSize: 1000 }),
        adminUserApi.getPaginated(pagination, sort.field ? sort : undefined, activeFilters, search),
      ]);

      let data = pageRes.data;
      setAllUsers(allRes.data);
      setUsers(data);
      setTotal(pageRes.total);
    } finally {
      setLoading(false);
    }
  }, [pagination, sort, filters, search, roleTab]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // --- Stats ---
  const stats = useMemo(() => {
    const byRole: Record<string, number> = { 'Người mua': 0, 'Nhà cung cấp': 0, 'Quản trị viên': 0 };
    const byMonth: Record<string, number> = {};
    for (const u of allUsers) {
      byRole[u.role] = (byRole[u.role] || 0) + 1;
      const month = u.createdAt.slice(0, 7);
      byMonth[month] = (byMonth[month] || 0) + 1;
    }
    const roleChart = Object.entries(byRole).map(([name, value]) => ({ name: getRoleDisplayName(name), value }));
    const monthChart = Object.entries(byMonth)
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-6);
    const active = allUsers.filter(u => u.status === 'Hoạt động').length;
    const locked = allUsers.filter(u => u.status === 'Bị khoá').length;
    return { total: allUsers.length, active, locked, roleChart, monthChart };
  }, [allUsers]);

  // --- Inline edit ---
  const handleInlineEdit = async (id: string, field: string, value: unknown) => {
    const current = users.find(u => u.id === id);
    if (!current) return;
    const updated = await adminUserApi.update(id, current, { [field]: value } as Partial<User>);
    setUsers(prev => prev.map(u => u.id === id ? updated : u));
    toast.success('Đã cập nhật');
  };

  // --- View detail ---
  const handleViewDetail = async (user: User) => {
    setSelectedUser(user);
    setDetailTab('info');
    setShowDetail(true);
    const logsPage = await adminActivityLogApi.getPaginated({ page: 1, pageSize: 20 }, { userId: user.id });
    setUserOrders([]);
    setUserReviews([]);
    setUserLogs(logsPage.data as ActivityLog[]);
  };

  // --- Delete with warning ---
  const handleDelete = async () => {
    if (!deleteConfirm) return;
    await adminUserApi.delete(deleteConfirm.id);
    setDeleteConfirm(null);
    fetchData();
    toast.success('Đã xoá người dùng');
  };

  // --- Ban ---
  const handleBan = async () => {
    if (!banDialog || !banReason.trim()) { toast.error('Vui lòng nhập lý do'); return; }
    const updated = await adminUserApi.updateStatus(banDialog.id, 'Bị khoá');
    setUsers(prev => prev.map(u => u.id === banDialog.id ? updated : u));
    setBanDialog(null);
    setBanReason('');
    toast.success(`Đã khoá tài khoản ${banDialog.fullName}`);
  };

  // --- CSV Export ---
  const handleExportCSV = () => {
    const headers = ['Họ tên', 'Email', 'SĐT', 'Vai trò', 'Trạng thái', 'Đơn vị', 'Ngày tạo'];
    const rows = allUsers.map(u => [u.fullName, u.email, u.phone, u.role, u.status, u.companyName || '', u.createdAt]);
    const csvContent = [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `nguoi-dung-${new Date().toISOString().slice(0, 10)}.csv`; a.click();
    URL.revokeObjectURL(url);
    toast.success('Đã xuất file CSV');
  };

  // --- Card view ---
  const renderListItem = (user: User) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4 flex items-center gap-3">
        <Avatar className="h-10 w-10 shrink-0">
          <AvatarFallback className="bg-primary/10 text-primary">
            {user.fullName.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="font-medium truncate">{user.fullName}</p>
          <p className="text-muted-foreground truncate">{user.email}</p>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="secondary">{getRoleDisplayName(user.role)}</Badge>
            <StatusBadge status={user.status} />
          </div>
        </div>
        <div className="text-right shrink-0 text-muted-foreground">
          <p>{user.companyName || '—'}</p>
          <p>{user.createdAt}</p>
        </div>
      </CardContent>
    </Card>
  );

  const renderActions = (user: User) => (
    <div className="flex items-center gap-1">
      <Button variant="ghost" size="sm" onClick={e => { e.stopPropagation(); handleViewDetail(user); }}>
        <Eye className="h-4 w-4" />
      </Button>
      {user.status !== 'Bị khoá' && (
        <Button variant="ghost" size="sm" onClick={e => { e.stopPropagation(); setBanDialog(user); }} title="Khoá tài khoản">
          <Ban className="h-4 w-4 text-orange-500" />
        </Button>
      )}
      <Button variant="ghost" size="sm" onClick={e => { e.stopPropagation(); setDeleteConfirm(user); }}>
        <Trash2 className="h-4 w-4 text-destructive" />
      </Button>
    </div>
  );

  return (
    <div className="space-y-4">
      <AppBreadcrumb items={[{ label: 'Quản trị', href: '/admin' }, { label: 'Người dùng' }]} />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1>Quản lý người dùng</h1>
          <p className="text-muted-foreground">Quản lý tất cả người dùng trên hệ thống ({stats.total} người dùng)</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExportCSV}>
            <Download className="mr-1 h-4 w-4" /> Xuất CSV
          </Button>
        </div>
      </div>

      {/* --- Stats + Charts mini --- */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card><CardContent className="p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-muted-foreground">Tổng</span>
            <Users className="h-4 w-4 text-blue-500" />
          </div>
          <p className="text-xl">{stats.total}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-muted-foreground">Hoạt động</span>
            <UserCheck className="h-4 w-4 text-green-500" />
          </div>
          <p className="text-xl text-green-600">{stats.active}</p>
        </CardContent></Card>
        <Card><CardContent className="p-3">
          <p className="text-muted-foreground mb-1">Theo vai trò</p>
          <div className="h-20">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie key="pie-role" data={stats.roleChart} cx="50%" cy="50%" outerRadius={35} dataKey="value" label={false}>
                  {stats.roleChart.map((entry, i) => <Cell key={`cell-role-${i}-${entry.name}`} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip key="tooltip-role" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent></Card>
        <Card><CardContent className="p-3">
          <p className="text-muted-foreground mb-1">Mới theo tháng</p>
          <div className="h-20">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.monthChart}>
                <XAxis key="xaxis-month" dataKey="month" tick={{ fontSize: 10 }} />
                <YAxis key="yaxis-month" hide />
                <Tooltip key="tooltip-month" />
                <Bar key="bar-month" dataKey="count" fill="#6366f1" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent></Card>
      </div>

      {/* --- Role tabs --- */}
      <Tabs value={roleTab} onValueChange={v => { setRoleTab(v as typeof roleTab); setPagination(p => ({ ...p, page: 1 })); }}>
        <TabsList>
          <TabsTrigger value="all">Tất cả</TabsTrigger>
          <TabsTrigger value="buyer">Người mua</TabsTrigger>
          <TabsTrigger value="seller">Đối tác</TabsTrigger>
        </TabsList>
      </Tabs>

      <FilterBar
        filters={filterConfigs}
        activeFilters={filters}
        onFilterChange={f => { setFilters(f); setPagination(p => ({ ...p, page: 1 })); }}
        searchValue={search}
        onSearchChange={v => { setSearch(v); setPagination(p => ({ ...p, page: 1 })); }}
        searchPlaceholder="Tìm theo tên, email, công ty, SĐT..."
      />

      <DataTable
        data={users}
        columns={columns}
        totalItems={total}
        pagination={pagination}
        sort={sort}
        onPaginationChange={setPagination}
        onSortChange={setSort}
        onInlineEdit={handleInlineEdit}
        onRowClick={handleViewDetail}
        getId={u => u.id}
        loading={loading}
        viewModes={['table', 'list']}
        renderActions={renderActions}
        renderListItem={renderListItem}
      />

      {/* --- Dialog chi tiết (tabs) --- */}
      <Dialog open={showDetail} onOpenChange={setShowDetail}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chi tiết người dùng</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-primary/10 text-primary text-lg">
                    {selectedUser.fullName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium">{selectedUser.fullName}</p>
                  <p className="text-muted-foreground">{selectedUser.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{getRoleDisplayName(selectedUser.role)}</Badge>
                  <StatusBadge status={selectedUser.status} />
                </div>
              </div>

              {/* Quick actions */}
              <div className="flex flex-wrap gap-2">
                {selectedUser.status !== 'Bị khoá' && (
                  <Button size="sm" variant="outline" className="text-orange-600" onClick={() => { setBanDialog(selectedUser); setShowDetail(false); }}>
                    <Ban className="mr-1 h-3.5 w-3.5" /> Khoá tài khoản
                  </Button>
                )}
                {selectedUser.status === 'Bị khoá' && (
                  <Button size="sm" variant="outline" className="text-green-600" onClick={async () => {
                    const updated = await adminUserApi.updateStatus(selectedUser.id, 'Hoạt động');
                    setSelectedUser(updated);
                    setUsers(prev => prev.map(u => u.id === selectedUser.id ? updated : u));
                    toast.success('Đã mở khoá tài khoản');
                  }}>
                    <ShieldCheck className="mr-1 h-3.5 w-3.5" /> Mở khoá
                  </Button>
                )}
              </div>

              <Separator />

              <Tabs value={detailTab} onValueChange={setDetailTab}>
                <TabsList className="flex flex-wrap">
                  <TabsTrigger value="info">Thông tin</TabsTrigger>
                  <TabsTrigger value="orders">Đơn hàng ({userOrders.length})</TabsTrigger>
                  <TabsTrigger value="reviews">Đánh giá ({userReviews.length})</TabsTrigger>
                  <TabsTrigger value="logs">Nhật ký ({userLogs.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="info" className="mt-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div><p className="text-muted-foreground">Họ tên</p><p>{selectedUser.fullName}</p></div>
                    <div><p className="text-muted-foreground">Email</p><p>{selectedUser.email}</p></div>
                    <div><p className="text-muted-foreground">SĐT</p><p>{selectedUser.phone || '—'}</p></div>
                    <div><p className="text-muted-foreground">Vai trò</p><Badge variant="secondary">{getRoleDisplayName(selectedUser.role)}</Badge></div>
                    <div><p className="text-muted-foreground">Đơn vị</p><p>{selectedUser.companyName || '—'}</p></div>
                    <div><p className="text-muted-foreground">Địa chỉ</p><p>{selectedUser.address || '—'}</p></div>
                    <div><p className="text-muted-foreground">Ngày tạo</p><p>{selectedUser.createdAt}</p></div>
                    <div><p className="text-muted-foreground">Cập nhật</p><p>{selectedUser.updatedAt}</p></div>
                  </div>
                </TabsContent>

                <TabsContent value="orders" className="mt-4">
                  {userOrders.length === 0
                    ? <p className="text-muted-foreground text-center py-4">Chưa có đơn hàng</p>
                    : (
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {userOrders.slice(0, 10).map(o => (
                          <div key={o.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                            <div className="min-w-0">
                              <p className="font-medium">{o.orderNumber}</p>
                              <p className="text-muted-foreground truncate">{o.supplierName}</p>
                            </div>
                            <div className="text-right shrink-0 ml-3">
                              <p className="text-primary">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(o.totalAmount)}</p>
                              <StatusBadge status={o.status} />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                </TabsContent>

                <TabsContent value="reviews" className="mt-4">
                  {userReviews.length === 0
                    ? <p className="text-muted-foreground text-center py-4">Chưa có đánh giá</p>
                    : (
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {userReviews.map(r => (
                          <div key={r.id} className="p-2 rounded-lg hover:bg-muted/50">
                            <div className="flex items-center justify-between">
                              <span className="font-medium">{r.productName}</span>
                              <span className="text-yellow-500">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                            </div>
                            <p className="text-muted-foreground mt-0.5 line-clamp-2">{r.comment}</p>
                          </div>
                        ))}
                      </div>
                    )}
                </TabsContent>

                <TabsContent value="logs" className="mt-4">
                  {userLogs.length === 0
                    ? <p className="text-muted-foreground text-center py-4">Chưa có hoạt động</p>
                    : (
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {userLogs.map(log => (
                          <div key={log.id} className="p-2 rounded-lg hover:bg-muted/50">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{log.action}</Badge>
                              <span className="text-muted-foreground">{log.entity}: {log.entityName}</span>
                              <span className="ml-auto text-muted-foreground">{log.createdAt}</span>
                            </div>
                            <p className="text-muted-foreground mt-0.5">{log.details}</p>
                          </div>
                        ))}
                      </div>
                    )}
                </TabsContent>
              </Tabs>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* --- Dialog xác nhận xoá (có cảnh báo) --- */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" /> Xác nhận xoá
            </DialogTitle>
          </DialogHeader>
          {deleteConfirm && (
            <div className="space-y-3">
              <p className="text-muted-foreground">
                Bạn có chắc muốn xoá <strong>{deleteConfirm.fullName}</strong>?
              </p>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-yellow-800">
                <p className="font-medium">Cảnh báo</p>
                <p>Người dùng này có thể có đơn hàng, đánh giá hoặc dữ liệu liên quan. Hành động này không thể hoàn tác.</p>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Huỷ</Button>
                <Button variant="destructive" onClick={handleDelete}>Xoá vĩnh viễn</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* --- Dialog ban user --- */}
      <Dialog open={!!banDialog} onOpenChange={() => { setBanDialog(null); setBanReason(''); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-orange-600">
              <Ban className="h-5 w-5" /> Khoá tài khoản
            </DialogTitle>
          </DialogHeader>
          {banDialog && (
            <div className="space-y-3">
              <p className="text-muted-foreground">
                Khoá tài khoản <strong>{banDialog.fullName}</strong> ({banDialog.email})
              </p>
              <div className="grid gap-2">
                <Label>Lý do khoá *</Label>
                <Textarea
                  value={banReason}
                  onChange={e => setBanReason(e.target.value)}
                  placeholder="Nhập lý do khoá tài khoản..."
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => { setBanDialog(null); setBanReason(''); }}>Huỷ</Button>
                <Button variant="destructive" onClick={handleBan} disabled={!banReason.trim()}>Khoá tài khoản</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

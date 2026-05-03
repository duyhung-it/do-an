// ============================================================
// Nhật ký hệ thống (Audit Log) — Admin
// Tab Bảng / Dòng thời gian, Stats, Filter, Biểu đồ, Auto-refresh
// ============================================================

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  Activity, Users, Clock, Calendar, Download, RefreshCw, Eye,
  LogIn, LogOut, Plus, Pencil, Trash2, CheckCircle2, XCircle,
  FileDown, FileUp, KeyRound, ShieldCheck,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { DataTable } from '../shared/DataTable';
import { FilterBar } from '../shared/FilterBar';
import { StatusBadge } from '../shared/StatusBadge';
import { AppBreadcrumb } from '../shared/AppBreadcrumb';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Separator } from '../ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { Switch } from '../ui/switch';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { activityApi } from '../../services/adminApi';
import { toast } from 'sonner';
import type {
  ActivityLog, ActivityAction, PaginationParams, SortParams,
  ActiveFilter, FilterConfig, ColumnConfig,
} from '../../types';

// --- Màu sắc theo hành động ---
const actionColorMap: Record<string, string> = {
  'Tạo': 'bg-green-100 text-green-800 border-green-200',
  'Sửa': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'Xoá': 'bg-red-100 text-red-800 border-red-200',
  'Duyệt': 'bg-purple-100 text-purple-800 border-purple-200',
  'Từ chối': 'bg-pink-100 text-pink-800 border-pink-200',
  'Đăng nhập': 'bg-blue-100 text-blue-800 border-blue-200',
  'Đăng xuất': 'bg-gray-100 text-gray-600 border-gray-200',
  'Xuất dữ liệu': 'bg-indigo-100 text-indigo-800 border-indigo-200',
  'Nhập dữ liệu': 'bg-cyan-100 text-cyan-800 border-cyan-200',
  'Đổi mật khẩu': 'bg-orange-100 text-orange-800 border-orange-200',
  'Cập nhật quyền': 'bg-violet-100 text-violet-800 border-violet-200',
};

const actionIconMap: Record<string, React.ReactNode> = {
  'Tạo': <Plus className="h-3.5 w-3.5" />,
  'Sửa': <Pencil className="h-3.5 w-3.5" />,
  'Xoá': <Trash2 className="h-3.5 w-3.5" />,
  'Duyệt': <CheckCircle2 className="h-3.5 w-3.5" />,
  'Từ chối': <XCircle className="h-3.5 w-3.5" />,
  'Đăng nhập': <LogIn className="h-3.5 w-3.5" />,
  'Đăng xuất': <LogOut className="h-3.5 w-3.5" />,
  'Xuất dữ liệu': <FileDown className="h-3.5 w-3.5" />,
  'Nhập dữ liệu': <FileUp className="h-3.5 w-3.5" />,
  'Đổi mật khẩu': <KeyRound className="h-3.5 w-3.5" />,
  'Cập nhật quyền': <ShieldCheck className="h-3.5 w-3.5" />,
};

// --- Thời gian tương đối ---
function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr.replace(' ', 'T'));
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'Vừa xong';
  if (diffMin < 60) return `${diffMin} phút trước`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour} giờ trước`;
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 30) return `${diffDay} ngày trước`;
  return dateStr;
}

// --- Entity path mapping ---
function getEntityPath(entity: string): string | null {
  const map: Record<string, string> = {
    'Sản phẩm': '/admin/products',
    'Đơn hàng': '/admin/orders',
    'Người dùng': '/admin/users',
    'RFQ': '/admin/rfq',
    'Hợp đồng': '/admin/contracts',
    'Khuyến mãi': '/admin/promotions',
    'Cấu hình': '/admin/settings',
    'Chứng chỉ': '/admin/certificates',
    'Danh mục': '/admin/categories',
  };
  return map[entity] || null;
}

// --- Cấu hình cột ---
const columns: ColumnConfig[] = [
  { key: 'createdAt', label: 'Thời gian', visible: true, sortable: true },
  { key: 'userName', label: 'Người dùng', visible: true, sortable: true },
  { key: 'userRole', label: 'Vai trò', visible: true, sortable: true },
  { key: 'action', label: 'Hành động', visible: true, sortable: true },
  { key: 'entity', label: 'Đối tượng', visible: true, sortable: true },
  { key: 'entityName', label: 'Tên', visible: true, sortable: true },
  { key: 'details', label: 'Chi tiết', visible: true, sortable: false },
  { key: 'ipAddress', label: 'IP', visible: false, sortable: false },
  { key: 'userAgent', label: 'Trình duyệt', visible: false, sortable: false },
];

// --- Cấu hình bộ lọc ---
const filterConfigs: FilterConfig[] = [
  { key: 'action', label: 'Hành động', type: 'select', options: [
    { label: 'Tạo', value: 'Tạo' },
    { label: 'Sửa', value: 'Sửa' },
    { label: 'Xoá', value: 'Xoá' },
    { label: 'Duyệt', value: 'Duyệt' },
    { label: 'Từ chối', value: 'Từ chối' },
    { label: 'Đăng nhập', value: 'Đăng nhập' },
    { label: 'Đăng xuất', value: 'Đăng xuất' },
    { label: 'Xuất dữ liệu', value: 'Xuất dữ liệu' },
  ]},
  { key: 'userRole', label: 'Vai trò', type: 'select', options: [
    { label: 'Admin', value: 'admin' },
    { label: 'Nhà cung cấp', value: 'seller' },
    { label: 'Người mua', value: 'buyer' },
  ]},
  { key: 'entity', label: 'Đối tượng', type: 'select', options: [
    { label: 'Sản phẩm', value: 'Sản phẩm' },
    { label: 'Đơn hàng', value: 'Đơn hàng' },
    { label: 'Người dùng', value: 'Người dùng' },
    { label: 'RFQ', value: 'RFQ' },
    { label: 'Hợp đồng', value: 'Hợp đồng' },
    { label: 'Khuyến mãi', value: 'Khuyến mãi' },
    { label: 'Cấu hình', value: 'Cấu hình' },
  ]},
];

export function AdminActivityLog() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [allLogs, setAllLogs] = useState<ActivityLog[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationParams>({ page: 1, pageSize: 50 });
  const [sort, setSort] = useState<SortParams>({ field: 'createdAt', direction: 'desc' });
  const [filters, setFilters] = useState<ActiveFilter[]>([]);
  const [search, setSearch] = useState('');
  const [selectedLog, setSelectedLog] = useState<ActivityLog | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [tab, setTab] = useState<'table' | 'timeline'>('table');

  // --- Timeline state ---
  const [timelineVisible, setTimelineVisible] = useState(20);

  // --- Stats ---
  const [stats, setStats] = useState<{
    byAction: Record<string, number>;
    byDay: { date: string; count: number }[];
    byUser: { userName: string; count: number }[];
    todayCount: number;
    weekCount: number;
    monthCount: number;
  } | null>(null);

  const autoRefreshRef = useRef(autoRefresh);
  autoRefreshRef.current = autoRefresh;

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [allRes, pageRes, statsRes] = await Promise.all([
        activityApi.getPaginated({ page: 1, pageSize: 5000 }),
        activityApi.getPaginated(pagination, sort.field ? sort : undefined, filters, search || undefined),
        activityApi.getStats(),
      ]);
      setAllLogs(allRes.data);
      setLogs(pageRes.data);
      setTotal(pageRes.total);
      setStats(statsRes);
    } finally {
      setLoading(false);
    }
  }, [pagination, sort, filters, search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // --- Auto-refresh ---
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      if (autoRefreshRef.current) fetchData();
    }, 30000);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchData]);

  // --- Nhóm timeline theo ngày ---
  const timelineGroups = useMemo(() => {
    const sorted = [...allLogs].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    const visible = sorted.slice(0, timelineVisible);
    const groups: Record<string, ActivityLog[]> = {};
    for (const log of visible) {
      const day = log.createdAt.slice(0, 10);
      if (!groups[day]) groups[day] = [];
      groups[day].push(log);
    }
    return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]));
  }, [allLogs, timelineVisible]);

  const activeUsersCount = useMemo(() => {
    const set = new Set(allLogs.map(l => l.userId));
    return set.size;
  }, [allLogs]);

  // --- Biểu đồ hành động hôm nay ---
  const actionChartData = useMemo(() => {
    if (!stats) return [];
    return Object.entries(stats.byAction).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
  }, [stats]);

  // --- Top 10 người dùng hoạt động ---
  const topUsersData = useMemo(() => {
    if (!stats) return [];
    return stats.byUser.slice(0, 10);
  }, [stats]);

  // --- Export CSV ---
  const handleExportCSV = () => {
    const headers = ['Thời gian', 'Người dùng', 'Vai trò', 'Hành động', 'Đối tượng', 'Tên', 'Chi tiết', 'IP'];
    const rows = allLogs.map(l => [
      l.createdAt, l.userName, l.userRole, l.action,
      l.entity, l.entityName, l.details, l.ipAddress,
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nhat-ky-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Đã xuất file CSV');
  };

  return (
    <div className="space-y-4">
      <AppBreadcrumb items={[{ label: 'Quản trị', href: '/admin' }, { label: 'Nhật ký hệ thống' }]} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1>Nhật ký hệ thống</h1>
          <p className="text-muted-foreground">Theo dõi toàn bộ hoạt động trên hệ thống</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Switch checked={autoRefresh} onCheckedChange={setAutoRefresh} />
            <span className="text-muted-foreground whitespace-nowrap">
              {autoRefresh ? 'Tự động (30s)' : 'Thủ công'}
            </span>
          </div>
          <Button variant="outline" size="sm" onClick={fetchData}>
            <RefreshCw className="mr-1 h-4 w-4" /> Làm mới
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportCSV}>
            <Download className="mr-1 h-4 w-4" /> Xuất CSV
          </Button>
        </div>
      </div>

      {/* --- Stats --- */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-muted-foreground">Hôm nay</span>
              <Activity className="h-4 w-4 text-blue-500" />
            </div>
            <p className="text-xl">{stats?.todayCount ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-muted-foreground">Tuần này</span>
              <Calendar className="h-4 w-4 text-indigo-500" />
            </div>
            <p className="text-xl">{stats?.weekCount ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-muted-foreground">Tháng này</span>
              <Clock className="h-4 w-4 text-green-500" />
            </div>
            <p className="text-xl">{stats?.monthCount ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-muted-foreground">Người dùng HĐ</span>
              <Users className="h-4 w-4 text-orange-500" />
            </div>
            <p className="text-xl">{activeUsersCount}</p>
          </CardContent>
        </Card>
      </div>

      {/* --- Biểu đồ --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="font-medium mb-3">Hành động theo loại</p>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={actionChartData} layout="vertical">
                  <CartesianGrid key="grid-action" strokeDasharray="3 3" vertical={true} horizontal={true} />
                  <XAxis key="xaxis-action" type="number" />
                  <YAxis key="yaxis-action" dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} />
                  <Tooltip key="tooltip-action" />
                  <Bar key="bar-action" dataKey="count" fill="#6366f1" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="font-medium mb-3">Top người dùng hoạt động</p>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topUsersData} layout="vertical">
                  <CartesianGrid key="grid-users" strokeDasharray="3 3" vertical={true} horizontal={true} />
                  <XAxis key="xaxis-users" type="number" />
                  <YAxis key="yaxis-users" dataKey="userName" type="category" width={120} tick={{ fontSize: 12 }} />
                  <Tooltip key="tooltip-users" />
                  <Bar key="bar-users" dataKey="count" fill="#10b981" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* --- Tabs --- */}
      <Tabs value={tab} onValueChange={v => setTab(v as 'table' | 'timeline')}>
        <TabsList>
          <TabsTrigger value="table">Bảng</TabsTrigger>
          <TabsTrigger value="timeline">Dòng thời gian</TabsTrigger>
        </TabsList>

        {/* --- Tab Bảng --- */}
        <TabsContent value="table" className="space-y-4 mt-4">
          <FilterBar
            filters={filterConfigs}
            activeFilters={filters}
            onFilterChange={f => { setFilters(f); setPagination(p => ({ ...p, page: 1 })); }}
            searchValue={search}
            onSearchChange={v => { setSearch(v); setPagination(p => ({ ...p, page: 1 })); }}
            searchPlaceholder="Tìm người dùng, chi tiết, đối tượng..."
          />

          <DataTable
            data={logs}
            columns={columns}
            totalItems={total}
            pagination={pagination}
            sort={sort}
            onPaginationChange={setPagination}
            onSortChange={setSort}
            onRowClick={l => setSelectedLog(l)}
            getId={l => l.id}
            loading={loading}
            viewModes={['table']}
            pageSizeOptions={[25, 50, 100]}
            renderActions={(log: ActivityLog) => (
              <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setSelectedLog(log); }} title="Chi tiết">
                <Eye className="h-3.5 w-3.5" />
              </Button>
            )}
          />
        </TabsContent>

        {/* --- Tab Dòng thời gian --- */}
        <TabsContent value="timeline" className="mt-4">
          <div className="space-y-6">
            {timelineGroups.map(([date, groupLogs]) => (
              <div key={date}>
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{date}</span>
                  <Badge variant="secondary">{groupLogs.length}</Badge>
                </div>
                <div className="space-y-2 ml-2 border-l-2 border-muted pl-4">
                  {groupLogs.map(log => {
                    const colors = actionColorMap[log.action] || 'bg-gray-100 text-gray-800 border-gray-200';
                    return (
                      <div
                        key={log.id}
                        className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                        onClick={() => setSelectedLog(log)}
                      >
                        <Avatar className="h-8 w-8 shrink-0 mt-0.5">
                          <AvatarFallback className="text-xs">
                            {log.userName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-medium">{log.userName}</span>
                            <Badge variant="outline" className={colors}>
                              {actionIconMap[log.action]}
                              <span className="ml-1">{log.action}</span>
                            </Badge>
                            <span className="text-muted-foreground">{log.entity}: {log.entityName}</span>
                          </div>
                          <p className="text-muted-foreground mt-0.5 truncate">{log.details}</p>
                          <span className="text-muted-foreground">{timeAgo(log.createdAt)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {timelineVisible < allLogs.length && (
              <div className="text-center">
                <Button variant="outline" onClick={() => setTimelineVisible(prev => prev + 20)}>
                  Xem thêm ({allLogs.length - timelineVisible} còn lại)
                </Button>
              </div>
            )}

            {allLogs.length === 0 && (
              <p className="text-center text-muted-foreground py-8">Chưa có nhật ký hoạt động</p>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* --- Chi tiết sự kiện --- */}
      <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Chi tiết sự kiện
            </DialogTitle>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className={actionColorMap[selectedLog.action] || ''}>
                  {actionIconMap[selectedLog.action]}
                  <span className="ml-1">{selectedLog.action}</span>
                </Badge>
                <span className="text-muted-foreground">{selectedLog.createdAt}</span>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-muted-foreground">Người dùng</p>
                  <p className="font-medium">{selectedLog.userName}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Vai trò</p>
                  <p>{selectedLog.userRole}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Đối tượng</p>
                  <div className="flex items-center gap-1">
                    <p>{selectedLog.entity}</p>
                    {getEntityPath(selectedLog.entity) && (
                      <a href={getEntityPath(selectedLog.entity)!} className="text-primary text-xs hover:underline">
                        → Xem trang
                      </a>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-muted-foreground">Tên đối tượng</p>
                  <p className="font-medium">{selectedLog.entityName}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-muted-foreground">Chi tiết</p>
                  <p>{selectedLog.details}</p>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-muted-foreground">Địa chỉ IP</p>
                  <p className="font-mono">{selectedLog.ipAddress}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Trình duyệt</p>
                  <p className="text-sm break-all">{selectedLog.userAgent}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
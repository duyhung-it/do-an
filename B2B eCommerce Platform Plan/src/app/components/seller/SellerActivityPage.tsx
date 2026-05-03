// ============================================================
// Nhật ký hoạt động — Seller (Nhóm 20A)
// 20A.01-08: DataTable, Filter, Search, Timeline view, Stats, Export, Mobile
// ============================================================

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  History, Activity, Users, Calendar, Download, Clock,
  Plus, Edit3, Trash2, CheckCircle2, XCircle, LogIn, LogOut,
  Upload, Key, FileText,
} from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { DataTable } from '../shared/DataTable';
import { FilterBar } from '../shared/FilterBar';
import { StatusBadge } from '../shared/StatusBadge';
import { AppBreadcrumb } from '../shared/AppBreadcrumb';
import { Separator } from '../ui/separator';
import { sellerActivityApi } from '../../services/api';
import { exportToCSV } from '../../utils/exportUtils';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';
import type {
  ActivityLog, PaginationParams, SortParams, ActiveFilter, FilterConfig, ColumnConfig,
} from '../../types';

// 20A.02: Columns
const columns: ColumnConfig[] = [
  { key: 'createdAt', label: 'Thời gian', visible: true, sortable: true },
  { key: 'userName', label: 'Người thực hiện', visible: true, sortable: true },
  { key: 'userRole', label: 'Vai trò', visible: true, sortable: true },
  { key: 'action', label: 'Hành động', visible: true, sortable: true },
  { key: 'entity', label: 'Đối tượng', visible: true, sortable: true },
  { key: 'entityName', label: 'Tên', visible: true, sortable: true },
  { key: 'details', label: 'Chi tiết', visible: true, sortable: false },
  { key: 'ipAddress', label: 'IP', visible: false, sortable: false },
];

// 20A.03: Filter configs
const filterConfigs: FilterConfig[] = [
  {
    key: 'action', label: 'Hành động', type: 'select', options: [
      { label: 'Tạo', value: 'Tạo' },
      { label: 'Sửa', value: 'Sửa' },
      { label: 'Xoá', value: 'Xoá' },
      { label: 'Duyệt', value: 'Duyệt' },
      { label: 'Từ chối', value: 'Từ chối' },
      { label: 'Đăng nhập', value: 'Đăng nhập' },
      { label: 'Xuất dữ liệu', value: 'Xuất dữ liệu' },
      { label: 'Cập nhật quyền', value: 'Cập nhật quyền' },
    ],
  },
  {
    key: 'entity', label: 'Đối tượng', type: 'select', options: [
      { label: 'Sản phẩm', value: 'Sản phẩm' },
      { label: 'Đơn hàng', value: 'Đơn hàng' },
      { label: 'Vận đơn', value: 'Vận đơn' },
      { label: 'Xuất kho', value: 'Xuất kho' },
      { label: 'Nhập kho', value: 'Nhập kho' },
      { label: 'Hoá đơn', value: 'Hoá đơn' },
      { label: 'Thanh toán', value: 'Thanh toán' },
      { label: 'Hợp đồng', value: 'Hợp đồng' },
      { label: 'Hệ thống', value: 'Hệ thống' },
    ],
  },
  {
    key: 'userName', label: 'Nhân viên', type: 'select', options: [
      { label: 'Nguyễn Văn An', value: 'Nguyễn Văn An' },
      { label: 'Trần Thị Mai', value: 'Trần Thị Mai' },
      { label: 'Phạm Văn Bình', value: 'Phạm Văn Bình' },
      { label: 'Lê Hữu Dũng', value: 'Lê Hữu Dũng' },
    ],
  },
];

const actionIconMap: Record<string, React.ElementType> = {
  'Tạo': Plus,
  'Sửa': Edit3,
  'Xoá': Trash2,
  'Duyệt': CheckCircle2,
  'Từ chối': XCircle,
  'Đăng nhập': LogIn,
  'Đăng xuất': LogOut,
  'Xuất dữ liệu': Download,
  'Nhập dữ liệu': Upload,
  'Cập nhật quyền': Key,
  'Đổi mật khẩu': Key,
};

const actionColorMap: Record<string, string> = {
  'Tạo': 'text-green-500',
  'Sửa': 'text-blue-500',
  'Xoá': 'text-red-500',
  'Duyệt': 'text-green-600',
  'Từ chối': 'text-red-600',
  'Đăng nhập': 'text-indigo-500',
  'Đăng xuất': 'text-gray-500',
  'Xuất dữ liệu': 'text-purple-500',
  'Nhập dữ liệu': 'text-teal-500',
  'Cập nhật quyền': 'text-orange-500',
};

export function SellerActivityPage() {
  const { user } = useAuth();
  const [data, setData] = useState<ActivityLog[]>([]);
  const [allLogs, setAllLogs] = useState<ActivityLog[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationParams>({ page: 1, pageSize: 10 });
  const [sort, setSort] = useState<SortParams>({ field: 'createdAt', direction: 'desc' });
  const [filters, setFilters] = useState<ActiveFilter[]>([]);
  const [search, setSearch] = useState('');

  // 20A.05: View mode (table vs timeline)
  const [viewMode, setViewMode] = useState<'table' | 'timeline'>('table');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const all = await sellerActivityApi.getAll();
      setAllLogs(all);

      const result = await sellerActivityApi.getPaginated(pagination, sort, filters, search);
      setData(result.data);
      setTotal(result.total);
    } finally {
      setLoading(false);
    }
  }, [pagination, sort, filters, search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // 20A.06: Stats
  const stats = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);

    const todayCount = allLogs.filter(l => l.createdAt.slice(0, 10) === today).length;
    const weekCount = allLogs.filter(l => l.createdAt.slice(0, 10) >= weekAgo).length;

    // Nhân viên hoạt động nhất
    const userCounts = new Map<string, number>();
    for (const log of allLogs) {
      userCounts.set(log.userName, (userCounts.get(log.userName) ?? 0) + 1);
    }
    let topUser = '-';
    let topCount = 0;
    for (const [name, count] of userCounts) {
      if (count > topCount) { topUser = name; topCount = count; }
    }

    return { todayCount, weekCount, total: allLogs.length, topUser, topCount };
  }, [allLogs]);

  // 20A.07: Export CSV
  const handleExport = () => {
    exportToCSV(allLogs as unknown as Record<string, unknown>[], [
      { key: 'createdAt', label: 'Thời gian' },
      { key: 'userName', label: 'Người thực hiện' },
      { key: 'userRole', label: 'Vai trò' },
      { key: 'action', label: 'Hành động' },
      { key: 'entity', label: 'Đối tượng' },
      { key: 'entityName', label: 'Tên' },
      { key: 'details', label: 'Chi tiết' },
      { key: 'ipAddress', label: 'IP' },
    ], 'nhat-ky-hoat-dong');
    toast.success('Đã xuất CSV nhật ký hoạt động');
  };

  // 20A.05: Timeline view — group by date
  const timelineGroups = useMemo(() => {
    const groups = new Map<string, ActivityLog[]>();
    // Use filtered data from allLogs (apply same filters/search as table)
    let filtered = [...allLogs];
    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter(l =>
        l.userName.toLowerCase().includes(s) ||
        l.details.toLowerCase().includes(s) ||
        l.entityName.toLowerCase().includes(s),
      );
    }
    if (filters.length > 0) {
      filtered = filtered.filter(l =>
        filters.every(f => String((l as unknown as Record<string, unknown>)[f.key]) === String(f.value)),
      );
    }
    for (const log of filtered) {
      const date = log.createdAt.slice(0, 10);
      const group = groups.get(date) ?? [];
      group.push(log);
      groups.set(date, group);
    }
    return Array.from(groups.entries()).sort((a, b) => b[0].localeCompare(a[0]));
  }, [allLogs, search, filters]);

  // 20A.08: Mobile grid card
  const renderGridCard = (log: ActivityLog) => {
    const Icon = actionIconMap[log.action] ?? Activity;
    const color = actionColorMap[log.action] ?? 'text-gray-500';
    return (
      <Card key={log.id} className="hover:shadow-md transition-shadow">
        <CardContent className="p-4 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon className={`h-4 w-4 ${color}`} />
              <Badge variant="outline">{log.action}</Badge>
            </div>
            <span className="text-xs text-muted-foreground">{log.createdAt}</span>
          </div>
          <p className="font-medium">{log.details}</p>
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{log.userName} ({log.userRole})</span>
            <span>{log.entity}: {log.entityName}</span>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <AppBreadcrumb items={[{ label: 'Kênh người bán', href: '/seller' }, { label: 'Nhật ký' }]} />

      <div>
        <h1>Nhật ký hoạt động</h1>
        <p className="text-muted-foreground">Theo dõi tất cả hoạt động của nhân viên trong hệ thống</p>
      </div>

      {/* 20A.06: Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Hôm nay', value: stats.todayCount, icon: Calendar, color: 'text-blue-500' },
          { label: 'Tuần này', value: stats.weekCount, icon: Clock, color: 'text-indigo-500' },
          { label: 'Tổng cộng', value: stats.total, icon: Activity, color: 'text-green-500' },
          { label: 'NV tích cực nhất', value: `${stats.topUser} (${stats.topCount})`, icon: Users, color: 'text-purple-500' },
        ].map(s => (
          <Card key={s.label}>
            <CardContent className="p-3 flex items-center gap-2">
              <s.icon className={`h-6 w-6 ${s.color} shrink-0`} />
              <div className="min-w-0">
                <p className="text-sm truncate">{s.value}</p>
                <p className="text-muted-foreground text-xs">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={viewMode === 'table' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setViewMode('table')}
        >
          <FileText className="h-4 w-4 mr-1" /> Bảng
        </Button>
        <Button
          variant={viewMode === 'timeline' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setViewMode('timeline')}
        >
          <History className="h-4 w-4 mr-1" /> Timeline
        </Button>
        <Button variant="outline" size="sm" onClick={handleExport}>
          <Download className="h-4 w-4 mr-1" /> Xuất CSV
        </Button>
      </div>

      <FilterBar
        filters={filterConfigs}
        activeFilters={filters}
        onFilterChange={f => { setFilters(f); setPagination(p => ({ ...p, page: 1 })); }}
        searchValue={search}
        onSearchChange={v => { setSearch(v); setPagination(p => ({ ...p, page: 1 })); }}
        searchPlaceholder="Tìm nhân viên, chi tiết, đối tượng..."
      />

      {viewMode === 'table' ? (
        /* 20A.02: DataTable + 20A.08: grid on mobile */
        <DataTable<ActivityLog>
          data={data}
          columns={columns}
          totalItems={total}
          pagination={pagination}
          sort={sort}
          onPaginationChange={setPagination}
          onSortChange={setSort}
          getId={l => l.id}
          loading={loading}
          viewModes={['table', 'grid']}
          defaultViewMode="table"
          renderGridCard={renderGridCard}
        />
      ) : (
        /* 20A.05: Timeline view */
        loading ? (
          <div className="text-center py-12 text-muted-foreground">Đang tải...</div>
        ) : timelineGroups.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">Không có hoạt động nào</div>
        ) : (
          <div className="space-y-6">
            {timelineGroups.map(([date, logs]) => (
              <div key={date}>
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <p className="font-medium text-muted-foreground">{date}</p>
                  <Badge variant="secondary">{logs.length}</Badge>
                </div>
                <div className="space-y-0 ml-2 border-l-2 border-muted pl-4">
                  {logs.map(log => {
                    const Icon = actionIconMap[log.action] ?? Activity;
                    const color = actionColorMap[log.action] ?? 'text-gray-500';
                    return (
                      <div key={log.id} className="relative pb-4 last:pb-0">
                        <div className="absolute -left-[calc(1rem+5px)] top-1.5 w-2.5 h-2.5 rounded-full bg-background border-2 border-muted-foreground/40" />
                        <div className="flex items-start gap-3">
                          {/* P5.26: Avatar initials */}
                          <div className="h-7 w-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs shrink-0">
                            {log.userName.split(' ').map(w => w[0]).slice(-2).join('').toUpperCase()}
                          </div>
                          <Icon className={`h-4 w-4 mt-1.5 ${color} shrink-0`} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-medium">{log.details}</span>
                              <Badge variant="outline" className="text-xs">{log.action}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              <span className="font-medium">{log.userName}</span> ({log.userRole}) · {log.entity}: {log.entityName} · <span className="text-xs">{log.createdAt.slice(11)}</span>
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
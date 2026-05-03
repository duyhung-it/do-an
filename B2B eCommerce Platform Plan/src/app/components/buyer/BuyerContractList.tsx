// ============================================================
// Danh sách hợp đồng — Buyer (P2 Đợt 3: P2.01–P2.03)
// Card layout, status tabs, grid view + progress
// ============================================================

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router';
import {
  FileText, Clock, CheckCircle2, ScrollText, ShieldCheck, XCircle,
  AlertTriangle, CalendarDays, LayoutGrid, List, ArrowRight, Building2,
} from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Skeleton } from '../ui/skeleton';
import { DataTable } from '../shared/DataTable';
import { FilterBar } from '../shared/FilterBar';
import { StatusBadge } from '../shared/StatusBadge';
import { StatsCard } from '../shared/StatsCard';
import { IconWrapper } from '../shared/IconWrapper';
import { AppBreadcrumb } from '../shared/AppBreadcrumb';
import { ViewToggle } from '../shared/ViewToggle';
import { contractApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import type { Contract, PaginationParams, SortParams, ActiveFilter, FilterConfig, ColumnConfig, ViewMode } from '../../types';

const formatPrice = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n);

const fmtShort = (v: number) => {
  if (v >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(1)} tỷ`;
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(0)} tr`;
  return formatPrice(v);
};

type StatusTab = 'all' | 'active' | 'expiring' | 'expired' | 'cancelled';

const STATUS_TABS: { key: StatusTab; label: string }[] = [
  { key: 'all', label: 'Tất cả' },
  { key: 'active', label: 'Hiệu lực' },
  { key: 'expiring', label: 'Sắp hết hạn' },
  { key: 'expired', label: 'Đã hết' },
  { key: 'cancelled', label: 'Huỷ' },
];

// P2.01: Status icon mapping
function getStatusVisual(status: string) {
  switch (status) {
    case 'Đang thực hiện': return { icon: ShieldCheck, color: 'success' as const, bg: 'bg-emerald-50 dark:bg-emerald-950/10', border: 'border-l-emerald-500' };
    case 'Chờ ký': return { icon: Clock, color: 'warning' as const, bg: 'bg-amber-50 dark:bg-amber-950/10', border: 'border-l-amber-500' };
    case 'Hoàn thành': return { icon: CheckCircle2, color: 'primary' as const, bg: 'bg-blue-50 dark:bg-blue-950/10', border: 'border-l-blue-500' };
    case 'Bản nháp': return { icon: FileText, color: 'neutral' as const, bg: 'bg-slate-50 dark:bg-slate-800/30', border: 'border-l-slate-400' };
    case 'Đã huỷ': return { icon: XCircle, color: 'danger' as const, bg: 'bg-red-50 dark:bg-red-950/10', border: 'border-l-red-500' };
    case 'Hết hạn': return { icon: AlertTriangle, color: 'danger' as const, bg: 'bg-red-50 dark:bg-red-950/10', border: 'border-l-red-400' };
    default: return { icon: FileText, color: 'neutral' as const, bg: '', border: 'border-l-slate-300' };
  }
}

const columns: ColumnConfig[] = [
  { key: 'contractNumber', label: 'Số HĐ', visible: true, sortable: true },
  { key: 'supplierName', label: 'Nhà cung cấp', visible: true, sortable: true },
  { key: 'totalAmountFormatted', label: 'Giá trị', visible: true, sortable: false },
  { key: 'status', label: 'Trạng thái', visible: true, sortable: true },
  { key: 'startDate', label: 'Bắt đầu', visible: true, sortable: true },
  { key: 'endDate', label: 'Kết thúc', visible: true, sortable: true },
  { key: 'milestoneProgress', label: 'Tiến độ', visible: true, sortable: false },
];

const filterConfigs: FilterConfig[] = [
  {
    key: 'status', label: 'Trạng thái', type: 'select', options: [
      { label: 'Bản nháp', value: 'Bản nháp' },
      { label: 'Chờ ký', value: 'Chờ ký' },
      { label: 'Đang thực hiện', value: 'Đang thực hiện' },
      { label: 'Hoàn thành', value: 'Hoàn thành' },
      { label: 'Đã huỷ', value: 'Đã huỷ' },
    ],
  },
];

interface ContractRow extends Contract {
  totalAmountFormatted: string;
  milestoneProgress: string;
}

// ─── Grid Card (P2.03) ───────────────────────────────────
function ContractGridCard({ contract, onClick }: { contract: ContractRow; onClick: () => void }) {
  const vis = getStatusVisual(contract.status);
  const doneMilestones = contract.milestones.filter(m => m.status === 'Hoàn thành').length;
  const totalMilestones = contract.milestones.length;
  const progressPct = totalMilestones > 0 ? Math.round((doneMilestones / totalMilestones) * 100) : 0;
  const daysLeft = Math.ceil((new Date(contract.endDate).getTime() - Date.now()) / 86400000);

  return (
    <Card
      className={`cursor-pointer hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 border-l-4 ${vis.border} overflow-hidden`}
      onClick={onClick}
    >
      <CardContent className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <IconWrapper icon={vis.icon} variant={vis.color} size="sm" />
            <div className="min-w-0">
              <p style={{ fontFamily: 'var(--font-heading)' }} className="truncate">
                {contract.contractNumber}
              </p>
              <p className="text-muted-foreground text-xs truncate flex items-center gap-1">
                <Building2 className="h-3 w-3 shrink-0" />
                {contract.supplierName}
              </p>
            </div>
          </div>
          <StatusBadge status={contract.status} size="sm" />
        </div>

        {/* Value */}
        <p className="text-xl text-[#e31837] font-black mb-3" style={{ fontFamily: 'var(--font-heading)' }}>
          {formatPrice(contract.totalAmount)}
        </p>

        {/* Progress bar (P2.03) */}
        {totalMilestones > 0 && (
          <div className="mb-3">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-muted-foreground">Tiến độ</span>
              <span style={{ fontFamily: 'var(--font-heading)' }}>{doneMilestones}/{totalMilestones}</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        )}

        {/* Footer dates */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <CalendarDays className="h-3 w-3" />
            {contract.startDate} → {contract.endDate}
          </span>
          {contract.status === 'Đang thực hiện' && daysLeft > 0 && daysLeft <= 30 && (
            <span className="text-amber-600 flex items-center gap-0.5">
              <AlertTriangle className="h-3 w-3" /> {daysLeft} ngày
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── List Card (P2.01) ────────────────────────────────────
function ContractListCard({ contract, onClick }: { contract: ContractRow; onClick: () => void }) {
  const vis = getStatusVisual(contract.status);
  const daysLeft = Math.ceil((new Date(contract.endDate).getTime() - Date.now()) / 86400000);

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-4 p-4 rounded-xl border-l-4 ${vis.border} bg-card hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 text-left border border-border/50`}
    >
      <IconWrapper icon={vis.icon} variant={vis.color} size="md" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span style={{ fontFamily: 'var(--font-heading)' }}>{contract.contractNumber}</span>
          <StatusBadge status={contract.status} size="sm" />
        </div>
        <p className="text-muted-foreground text-sm truncate mt-0.5">
          {contract.supplierName}
          {contract.milestones.length > 0 && ` · ${contract.milestones.filter(m => m.status === 'Hoàn thành').length}/${contract.milestones.length} mốc`}
        </p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-[#e31837] font-bold" style={{ fontFamily: 'var(--font-heading)' }}>
          {fmtShort(contract.totalAmount)}
        </p>
        <p className="text-muted-foreground text-xs mt-0.5 flex items-center justify-end gap-1">
          <CalendarDays className="h-3 w-3" />
          {contract.endDate}
          {contract.status === 'Đang thực hiện' && daysLeft > 0 && daysLeft <= 30 && (
            <span className="text-amber-600 ml-1">({daysLeft}d)</span>
          )}
        </p>
      </div>
      <ArrowRight className="h-4 w-4 text-muted-foreground/40 shrink-0" />
    </button>
  );
}

// ═══════════════════════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════════════════════
export function BuyerContractList() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [data, setData] = useState<ContractRow[]>([]);
  const [allContracts, setAllContracts] = useState<Contract[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationParams>({ page: 1, pageSize: 10 });
  const [sort, setSort] = useState<SortParams>({ field: 'createdAt', direction: 'desc' });
  const [filters, setFilters] = useState<ActiveFilter[]>([]);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [statusTab, setStatusTab] = useState<StatusTab>('all');

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const all = await contractApi.getByBuyer(user.id);
      setAllContracts(all);

      let filtered = [...all];

      // P2.02: Status tab filter
      if (statusTab !== 'all') {
        const now = new Date();
        const in30 = new Date(Date.now() + 30 * 86400000);
        filtered = filtered.filter(c => {
          switch (statusTab) {
            case 'active': return c.status === 'Đang thực hiện';
            case 'expiring': return c.status === 'Đang thực hiện' && new Date(c.endDate) <= in30 && new Date(c.endDate) > now;
            case 'expired': return c.status === 'Hoàn thành' || c.status === 'Hết hạn';
            case 'cancelled': return c.status === 'Đã huỷ';
            default: return true;
          }
        });
      }

      if (search) {
        const s = search.toLowerCase();
        filtered = filtered.filter(c =>
          c.contractNumber.toLowerCase().includes(s) ||
          c.supplierName.toLowerCase().includes(s) ||
          c.items.some(i => i.productName.toLowerCase().includes(s)),
        );
      }
      if (filters.length > 0) {
        filtered = filtered.filter(c =>
          filters.every(f => String((c as unknown as Record<string, unknown>)[f.key]) === String(f.value)),
        );
      }
      if (sort.field) {
        filtered.sort((a, b) => {
          const aV = String((a as unknown as Record<string, unknown>)[sort.field] ?? '');
          const bV = String((b as unknown as Record<string, unknown>)[sort.field] ?? '');
          return sort.direction === 'asc' ? aV.localeCompare(bV) : bV.localeCompare(aV);
        });
      }
      setTotal(filtered.length);
      const start = (pagination.page - 1) * pagination.pageSize;
      const rows: ContractRow[] = filtered.slice(start, start + pagination.pageSize).map(c => ({
        ...c,
        totalAmountFormatted: formatPrice(c.totalAmount),
        milestoneProgress: c.milestones.length > 0
          ? `${c.milestones.filter(m => m.status === 'Hoàn thành').length}/${c.milestones.length}`
          : '—',
      }));
      setData(rows);
    } finally {
      setLoading(false);
    }
  }, [user, pagination, sort, filters, search, statusTab]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // P2.02: Tab counts
  const tabCounts = useMemo(() => {
    const now = new Date();
    const in30 = new Date(Date.now() + 30 * 86400000);
    return {
      all: allContracts.length,
      active: allContracts.filter(c => c.status === 'Đang thực hiện').length,
      expiring: allContracts.filter(c => c.status === 'Đang thực hiện' && new Date(c.endDate) <= in30 && new Date(c.endDate) > now).length,
      expired: allContracts.filter(c => c.status === 'Hoàn thành' || c.status === 'Hết hạn').length,
      cancelled: allContracts.filter(c => c.status === 'Đã huỷ').length,
    };
  }, [allContracts]);

  const stats = useMemo(() => {
    const totalValue = allContracts.reduce((s, c) => s + c.totalAmount, 0);
    return [
      { label: 'Tổng HĐ', value: allContracts.length, icon: ScrollText, variant: 'primary' as const },
      { label: 'Hiệu lực', value: tabCounts.active, icon: ShieldCheck, variant: 'success' as const },
      { label: 'Sắp hết hạn', value: tabCounts.expiring, icon: AlertTriangle, variant: 'warning' as const },
      { label: 'Tổng giá trị', value: totalValue, icon: CalendarDays, variant: 'info' as const, format: formatPrice },
    ];
  }, [allContracts, tabCounts]);

  const handleTabChange = (tab: StatusTab) => {
    setStatusTab(tab);
    setPagination(p => ({ ...p, page: 1 }));
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <AppBreadcrumb items={[{ label: 'Trang chủ', href: '/' }, { label: 'Hợp đồng' }]} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-700 flex items-center justify-center shadow-md shrink-0">
            <ScrollText className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="font-black" style={{ fontFamily: 'var(--font-heading)' }}>Hợp đồng</h1>
            <p className="text-muted-foreground text-sm mt-0.5">Quản lý hợp đồng với nhà cung cấp</p>
          </div>
        </div>
        <ViewToggle viewMode={viewMode} onChange={setViewMode} modes={['list', 'grid', 'table']} />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <StatsCard
            key={s.label}
            title={s.label}
            value={s.value}
            icon={s.icon}
            variant={s.variant}
            format={s.format}
          />
        ))}
      </div>

      {/* P2.02: Status Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 -mx-1 px-1">
        {STATUS_TABS.map(tab => {
          const count = tabCounts[tab.key];
          const isActive = statusTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-gradient-to-r from-[#e31837] to-[#c91432] text-white shadow-sm shadow-red-200'
                  : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
              }`}
            >
              {tab.label}
              {count > 0 && (
                <span className={`inline-flex items-center justify-center h-5 min-w-[20px] px-1.5 rounded-full text-xs ${
                  isActive ? 'bg-white/20 text-white' : 'bg-muted text-muted-foreground'
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <FilterBar
        filters={filterConfigs}
        activeFilters={filters}
        onFilterChange={f => { setFilters(f); setPagination(p => ({ ...p, page: 1 })); }}
        searchValue={search}
        onSearchChange={v => { setSearch(v); setPagination(p => ({ ...p, page: 1 })); }}
        searchPlaceholder="Tìm số HĐ, NCC, sản phẩm..."
      />

      {/* Content based on view mode */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-44 rounded-xl" />
          ))}
        </div>
      ) : viewMode === 'grid' ? (
        /* P2.03: Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.map(c => (
            <ContractGridCard
              key={c.id}
              contract={c}
              onClick={() => navigate(`/contracts/${c.id}`)}
            />
          ))}
          {data.length === 0 && (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              <ScrollText className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>Không tìm thấy hợp đồng nào</p>
            </div>
          )}
        </div>
      ) : viewMode === 'list' ? (
        /* P2.01: List Card View */
        <div className="space-y-3">
          {data.map(c => (
            <ContractListCard
              key={c.id}
              contract={c}
              onClick={() => navigate(`/contracts/${c.id}`)}
            />
          ))}
          {data.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <ScrollText className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>Không tìm thấy hợp đồng nào</p>
            </div>
          )}
        </div>
      ) : (
        /* Table View */
        <DataTable<ContractRow>
          data={data}
          columns={columns}
          totalItems={total}
          pagination={pagination}
          sort={sort}
          onPaginationChange={setPagination}
          onSortChange={setSort}
          onRowClick={c => navigate(`/contracts/${c.id}`)}
          getId={c => c.id}
          loading={loading}
          renderActions={c => (
            <Button variant="ghost" size="sm" onClick={e => { e.stopPropagation(); navigate(`/contracts/${c.id}`); }}>
              Xem
            </Button>
          )}
        />
      )}

      {/* Simple pagination for non-table views */}
      {viewMode !== 'table' && total > pagination.pageSize && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page <= 1}
            onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
          >
            Trước
          </Button>
          <span className="text-sm text-muted-foreground">
            Trang {pagination.page} / {Math.ceil(total / pagination.pageSize)}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page >= Math.ceil(total / pagination.pageSize)}
            onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
          >
            Sau
          </Button>
        </div>
      )}
    </div>
  );
}

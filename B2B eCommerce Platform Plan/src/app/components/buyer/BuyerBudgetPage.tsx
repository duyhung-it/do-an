// ============================================================
// Trang Ngân sách mua hàng — Buyer (P2 Đợt 5: P2.21–P2.24, P2.29)
// ProgressRing gauge, Pie chart, Budget alerts, Sparklines
// ============================================================

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Wallet, Plus, Eye, CheckCircle2, TrendingUp, TrendingDown,
  ArrowRightLeft, Clock, AlertTriangle, Trash2, PieChart as PieIcon,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip as ReTooltip, ResponsiveContainer,
  CartesianGrid, Legend, PieChart, Pie, Cell, LineChart, Line,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Progress } from '../ui/progress';
import { Separator } from '../ui/separator';
import { Badge } from '../ui/badge';
import { Skeleton } from '../ui/skeleton';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
  DialogDescription,
} from '../ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '../ui/select';
import { DataTable } from '../shared/DataTable';
import { StatusBadge } from '../shared/StatusBadge';
import { FilterBar } from '../shared/FilterBar';
import { AppBreadcrumb } from '../shared/AppBreadcrumb';
import { ProgressRing } from '../shared/ProgressRing';
import { IconWrapper } from '../shared/IconWrapper';
import { AnimatedNumber } from '../shared/AnimatedNumber';
import { budgetApi } from '../../services/budgetApi';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';
import type {
  BudgetPlan, BudgetAllocation, BudgetTransaction, BudgetPeriod, BudgetStatus,
  PaginationParams, SortParams, ActiveFilter, FilterConfig, ColumnConfig,
} from '../../types';

const formatPrice = (v: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(v);

const formatShort = (v: number) => {
  if (v >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(1)} tỷ`;
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(0)} tr`;
  return formatPrice(v);
};

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });

const ALL_PERIODS: BudgetPeriod[] = ['Tháng', 'Quý', 'Năm'];
const ALL_STATUSES: BudgetStatus[] = ['Bản nháp', 'Đã duyệt', 'Đang thực hiện', 'Đã đóng', 'Vượt ngân sách'];
const DEPARTMENTS = ['Sản xuất', 'Kinh doanh', 'Hành chính', 'Kỹ thuật', 'R&D'];

const PIE_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899'];

const filterConfigs: FilterConfig[] = [
  { key: 'period', label: 'Kỳ', type: 'select', options: ALL_PERIODS.map(p => ({ label: p, value: p })) },
  { key: 'status', label: 'Trạng thái', type: 'select', options: ALL_STATUSES.map(s => ({ label: s, value: s })) },
];

// P2.24: Mock sparkline data per department
const mockWeeklyTrend = (dept: string) => {
  const base = dept === 'Sản xuất' ? 15 : dept === 'Kinh doanh' ? 12 : 8;
  return Array.from({ length: 8 }, (_, i) => ({
    week: `T${i + 1}`,
    value: base + Math.floor(Math.random() * 10) - 3,
  }));
};

// ─── P2.23: Budget Alert Card ─────────────────────────────
function BudgetAlertCard({ name, pct }: { name: string; pct: number }) {
  const isRed = pct >= 95;
  const isYellow = pct >= 80 && pct < 95;
  if (!isRed && !isYellow) return null;

  return (
    <div className={`flex items-center gap-3 p-3 rounded-xl border ${
      isRed
        ? 'border-red-200 bg-red-50/60 dark:bg-red-950/10 dark:border-red-900/30'
        : 'border-amber-200 bg-amber-50/60 dark:bg-amber-950/10 dark:border-amber-900/30'
    }`}>
      <AlertTriangle className={`h-4 w-4 shrink-0 ${isRed ? 'text-red-500' : 'text-amber-500'}`} />
      <div className="flex-1 min-w-0">
        <p className="text-sm truncate">{name}</p>
        <p className={`text-xs ${isRed ? 'text-red-600' : 'text-amber-600'}`}>
          {isRed ? `Vượt ngưỡng — ${pct}% ngân sách` : `Cảnh báo — ${pct}% ngân sách`}
        </p>
      </div>
      <div className="h-2 w-16 bg-muted rounded-full overflow-hidden shrink-0">
        <div
          className={`h-full rounded-full ${isRed ? 'bg-red-500' : 'bg-amber-500'}`}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>
    </div>
  );
}

// ─── P2.24: Sparkline mini chart ──────────────────────────
function Sparkline({ data, color = '#6366f1' }: { data: { week: string; value: number }[]; color?: string }) {
  return (
    <ResponsiveContainer width="100%" height={30}>
      <LineChart data={data}>
        <Line type="monotone" dataKey="value" stroke={color} strokeWidth={1.5} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

// ═══════════════════════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════════════════════
export function BuyerBudgetPage() {
  const { user } = useAuth();
  const companyId = 'comp-001';

  const [plans, setPlans] = useState<BudgetPlan[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<{
    totalBudgetYear: number; totalUsedYear: number; remainingYear: number;
    usagePercent: number;
    byDepartment: { department: string; allocated: number; used: number }[];
    monthlyActual: { month: string; actual: number; planned: number }[];
  } | null>(null);

  const [pagination, setPagination] = useState<PaginationParams>({ page: 1, pageSize: 10 });
  const [sort, setSort] = useState<SortParams>({ field: 'startDate', direction: 'desc' });
  const [filters, setFilters] = useState<ActiveFilter[]>([]);
  const [search, setSearch] = useState('');

  // Dialogs
  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<BudgetPlan | null>(null);
  const [detailTransactions, setDetailTransactions] = useState<BudgetTransaction[]>([]);

  // P2.22: Pie chart click detail
  const [pieSelected, setPieSelected] = useState<string | null>(null);

  // Form state
  const [formName, setFormName] = useState('');
  const [formPeriod, setFormPeriod] = useState<BudgetPeriod>('Quý');
  const [formStartDate, setFormStartDate] = useState('');
  const [formEndDate, setFormEndDate] = useState('');
  const [formTotalBudget, setFormTotalBudget] = useState(0);
  const [formAllocations, setFormAllocations] = useState<{
    department: string; categoryName: string; allocatedAmount: number; warningThreshold: number;
  }[]>([{ department: 'Sản xuất', categoryName: '', allocatedAmount: 0, warningThreshold: 80 }]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [res, ov] = await Promise.all([
        budgetApi.getByCompany(companyId, pagination, sort, filters, search),
        budgetApi.getOverview(companyId),
      ]);
      setPlans(res.data);
      setTotal(res.total);
      setOverview(ov);
    } finally {
      setLoading(false);
    }
  }, [companyId, pagination, sort, filters, search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openDetail = async (plan: BudgetPlan) => {
    setSelectedPlan(plan);
    const txns = await budgetApi.getTransactions(plan.id);
    setDetailTransactions(txns);
    setShowDetail(true);
  };

  const resetForm = () => {
    setFormName(''); setFormPeriod('Quý'); setFormStartDate(''); setFormEndDate('');
    setFormTotalBudget(0);
    setFormAllocations([{ department: 'Sản xuất', categoryName: '', allocatedAmount: 0, warningThreshold: 80 }]);
  };

  const handleSave = async () => {
    if (!formName || !formStartDate || !formEndDate || formTotalBudget <= 0) {
      toast.error('Vui lòng điền đầy đủ thông tin'); return;
    }
    const allocs: BudgetAllocation[] = formAllocations.map((a, i) => ({
      id: `alloc-new-${i}`, budgetId: '',
      department: a.department, categoryName: a.categoryName || undefined,
      allocatedAmount: a.allocatedAmount, usedAmount: 0, remainingAmount: a.allocatedAmount,
      warningThreshold: a.warningThreshold,
    }));
    await budgetApi.create({
      companyId, name: formName, period: formPeriod,
      startDate: formStartDate, endDate: formEndDate,
      totalBudget: formTotalBudget, allocations: allocs,
      createdBy: user?.fullName ?? '',
    });
    toast.success('Đã tạo kế hoạch ngân sách');
    setShowForm(false); resetForm(); fetchData();
  };

  // P2.22: Pie chart data
  const pieData = useMemo(() =>
    overview?.byDepartment.map(d => ({
      name: d.department, value: d.allocated, used: d.used,
    })) ?? [],
    [overview],
  );

  // P2.23: Budget alerts
  const budgetAlerts = useMemo(() => {
    if (!overview) return [];
    return overview.byDepartment
      .map(d => ({ name: d.department, pct: d.allocated > 0 ? Math.round((d.used / d.allocated) * 100) : 0 }))
      .filter(d => d.pct >= 80)
      .sort((a, b) => b.pct - a.pct);
  }, [overview]);

  // Columns
  const columns: (ColumnConfig & { render?: (item: BudgetPlan) => React.ReactNode })[] = [
    { key: 'name', label: 'Tên NS', visible: true, sortable: true },
    { key: 'period', label: 'Kỳ', visible: true, sortable: true, render: (b) => <Badge variant="outline">{b.period}</Badge> },
    { key: 'totalBudget', label: 'Tổng NS', visible: true, sortable: true, render: (b) => <span style={{ fontFamily: 'var(--font-heading)' }}>{formatShort(b.totalBudget)}</span> },
    {
      key: 'totalUsed', label: 'Đã chi', visible: true, sortable: true,
      render: (b) => {
        const pct = b.totalBudget > 0 ? Math.round((b.totalUsed / b.totalBudget) * 100) : 0;
        return (
          <div className="min-w-[120px]">
            <div className="flex justify-between text-xs mb-1">
              <span>{formatShort(b.totalUsed)}</span>
              <span className={pct >= 80 ? 'text-red-600' : ''}>{pct}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all ${pct >= 95 ? 'bg-red-500' : pct >= 80 ? 'bg-amber-500' : 'bg-blue-500'}`} style={{ width: `${pct}%` }} />
            </div>
          </div>
        );
      },
    },
    {
      key: 'remaining', label: 'Còn lại', visible: true, sortable: false,
      render: (b) => {
        const rem = b.totalBudget - b.totalUsed;
        return <span className={rem < 0 ? 'text-red-600' : 'text-emerald-600'} style={{ fontFamily: 'var(--font-heading)' }}>{formatShort(rem)}</span>;
      },
    },
    { key: 'status', label: 'Trạng thái', visible: true, sortable: true, render: (b) => <StatusBadge status={b.status} size="sm" /> },
    { key: 'createdBy', label: 'Người tạo', visible: true, sortable: true },
  ];

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <AppBreadcrumb items={[{ label: 'Ngân sách' }]} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2" style={{ fontFamily: 'var(--font-heading)' }}>
            <Wallet className="h-6 w-6 text-primary" /> Ngân sách mua hàng
          </h1>
          <p className="text-muted-foreground mt-1">Quản lý và theo dõi ngân sách mua hàng theo kỳ</p>
        </div>
        <Button onClick={() => { resetForm(); setShowForm(true); }} className="gap-2">
          <Plus className="h-4 w-4" /> Tạo kế hoạch NS
        </Button>
      </div>

      {/* P2.21: Overview with ProgressRing Gauge */}
      {overview ? (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-6">
          {/* P2.21: Large circular gauge */}
          <Card className="flex flex-col items-center justify-center p-6">
            <ProgressRing
              value={overview.usagePercent}
              size={160}
              strokeWidth={12}
              color={overview.usagePercent >= 95 ? '#ef4444' : overview.usagePercent >= 80 ? '#f59e0b' : '#6366f1'}
              label="Đã sử dụng"
            />
            <div className="mt-4 grid grid-cols-3 gap-4 w-full text-center">
              <div>
                <p className="text-xs text-muted-foreground">Tổng NS</p>
                <p className="text-sm text-primary" style={{ fontFamily: 'var(--font-heading)' }}>
                  <AnimatedNumber value={overview.totalBudgetYear} format={formatShort} />
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Đã chi</p>
                <p className="text-sm text-red-600" style={{ fontFamily: 'var(--font-heading)' }}>
                  <AnimatedNumber value={overview.totalUsedYear} format={formatShort} />
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Còn lại</p>
                <p className="text-sm text-emerald-600" style={{ fontFamily: 'var(--font-heading)' }}>
                  <AnimatedNumber value={overview.remainingYear} format={formatShort} />
                </p>
              </div>
            </div>
          </Card>

          {/* Stats + alerts */}
          <div className="space-y-4">
            {/* Metric cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Card className="border-l-4 border-l-blue-500">
                <CardContent className="p-3 flex items-center gap-2">
                  <IconWrapper icon={Wallet} variant="primary" size="sm" />
                  <div>
                    <p className="text-xs text-muted-foreground">Tổng NS năm</p>
                    <p className="text-sm" style={{ fontFamily: 'var(--font-heading)' }}>{formatShort(overview.totalBudgetYear)}</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-l-4 border-l-red-500">
                <CardContent className="p-3 flex items-center gap-2">
                  <IconWrapper icon={TrendingUp} variant="danger" size="sm" />
                  <div>
                    <p className="text-xs text-muted-foreground">Đã chi</p>
                    <p className="text-sm" style={{ fontFamily: 'var(--font-heading)' }}>{formatShort(overview.totalUsedYear)}</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-l-4 border-l-emerald-500">
                <CardContent className="p-3 flex items-center gap-2">
                  <IconWrapper icon={TrendingDown} variant="success" size="sm" />
                  <div>
                    <p className="text-xs text-muted-foreground">Còn lại</p>
                    <p className="text-sm" style={{ fontFamily: 'var(--font-heading)' }}>{formatShort(overview.remainingYear)}</p>
                  </div>
                </CardContent>
              </Card>
              <Card className={`border-l-4 ${overview.usagePercent >= 80 ? 'border-l-red-500' : 'border-l-purple-500'}`}>
                <CardContent className="p-3 flex items-center gap-2">
                  <IconWrapper icon={ArrowRightLeft} variant={overview.usagePercent >= 80 ? 'danger' : 'purple'} size="sm" />
                  <div>
                    <p className="text-xs text-muted-foreground">% Sử dụng</p>
                    <p className="text-sm" style={{ fontFamily: 'var(--font-heading)' }}>{overview.usagePercent}%</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* P2.23: Budget Alert Cards */}
            {budgetAlerts.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <AlertTriangle className="h-3.5 w-3.5" /> Cảnh báo ngân sách
                </p>
                {budgetAlerts.map(a => (
                  <BudgetAlertCard key={a.name} name={a.name} pct={a.pct} />
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-6">
          <Skeleton className="h-64 rounded-xl" />
          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>
            <Skeleton className="h-20 rounded-xl" />
          </div>
        </div>
      )}

      {/* Charts */}
      {overview && (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* P2.22: Pie chart with click detail */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <PieIcon className="h-4.5 w-4.5 text-primary" />
                Phân bổ NS theo bộ phận
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pieData.length > 0 ? (
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <PieChart width={200} height={200}>
                    <Pie
                      data={pieData}
                      cx="50%" cy="50%"
                      innerRadius={50} outerRadius={85}
                      paddingAngle={2}
                      dataKey="value"
                      onClick={(_, idx) => setPieSelected(pieData[idx]?.name ?? null)}
                      className="cursor-pointer"
                    >
                      {pieData.map((_, idx) => (
                        <Cell
                          key={idx}
                          fill={PIE_COLORS[idx % PIE_COLORS.length]}
                          opacity={pieSelected && pieSelected !== pieData[idx]?.name ? 0.3 : 1}
                          className="transition-opacity duration-300"
                        />
                      ))}
                    </Pie>
                    <ReTooltip formatter={(v: number) => formatPrice(v)} />
                  </PieChart>
                  <div className="flex-1 space-y-2">
                    {pieData.map((d, idx) => {
                      const usedPct = d.value > 0 ? Math.round((d.used / d.value) * 100) : 0;
                      const isSelected = pieSelected === d.name;
                      return (
                        <button
                          key={d.name}
                          onClick={() => setPieSelected(isSelected ? null : d.name)}
                          className={`w-full flex items-center gap-2 p-2 rounded-lg text-left transition-all text-sm ${
                            isSelected ? 'bg-muted' : 'hover:bg-muted/40'
                          }`}
                        >
                          <div className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }} />
                          <span className="flex-1 truncate">{d.name}</span>
                          <span style={{ fontFamily: 'var(--font-heading)' }} className="text-xs">{formatShort(d.value)}</span>
                          <span className={`text-xs ${usedPct >= 80 ? 'text-red-600' : 'text-muted-foreground'}`}>{usedPct}%</span>
                        </button>
                      );
                    })}
                    {pieSelected && (
                      <Button variant="ghost" size="sm" className="w-full text-xs" onClick={() => setPieSelected(null)}>
                        Bỏ chọn
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">Chưa có dữ liệu</p>
              )}
            </CardContent>
          </Card>

          {/* Actual vs Planned BarChart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Thực tế vs Kế hoạch (theo tháng)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={overview.monthlyActual}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tickFormatter={v => formatShort(Number(v))} tick={{ fontSize: 11 }} />
                  <ReTooltip formatter={(v: number) => formatPrice(v)} />
                  <Legend />
                  <Bar dataKey="actual" name="Thực tế" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="planned" name="Kế hoạch" fill="#e0e7ff" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* P2.24: Sparkline cards per department */}
      {overview && overview.byDepartment.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Xu hướng sử dụng theo tuần</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {overview.byDepartment.map((dept, idx) => {
                const pct = dept.allocated > 0 ? Math.round((dept.used / dept.allocated) * 100) : 0;
                const trendData = mockWeeklyTrend(dept.department);
                return (
                  <div key={dept.department} className="p-3 rounded-xl border border-border/50 hover:bg-muted/20 transition-colors">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }} />
                        <span className="text-sm">{dept.department}</span>
                      </div>
                      <span className={`text-xs ${pct >= 80 ? 'text-red-600' : 'text-muted-foreground'}`} style={{ fontFamily: 'var(--font-heading)' }}>
                        {pct}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                      <span>{formatShort(dept.used)} / {formatShort(dept.allocated)}</span>
                    </div>
                    <Sparkline data={trendData} color={PIE_COLORS[idx % PIE_COLORS.length]} />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filter + Table */}
      <FilterBar
        filters={filterConfigs}
        activeFilters={filters}
        onFilterChange={f => { setFilters(f); setPagination(p => ({ ...p, page: 1 })); }}
        searchValue={search}
        onSearchChange={v => { setSearch(v); setPagination(p => ({ ...p, page: 1 })); }}
        searchPlaceholder="Tìm tên NS, người tạo..."
      />

      <DataTable
        data={plans}
        columns={columns}
        totalItems={total}
        pagination={pagination}
        sort={sort}
        onPaginationChange={setPagination}
        onSortChange={setSort}
        getId={b => b.id}
        loading={loading}
        renderActions={(plan) => (
          <div className="flex items-center gap-1">
            <Button size="sm" variant="ghost" onClick={() => openDetail(plan)}>
              <Eye className="h-4 w-4" />
            </Button>
            {plan.status === 'Bản nháp' && (
              <Button size="sm" variant="ghost" className="text-emerald-600"
                onClick={async () => {
                  await budgetApi.approve(plan.id, user?.fullName ?? '');
                  toast.success(`Đã duyệt ${plan.name}`);
                  fetchData();
                }}>
                <CheckCircle2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      />

      {/* Dialog: Tạo NS (keep existing logic) */}
      <Dialog open={showForm} onOpenChange={(o) => { if (!o) { setShowForm(false); resetForm(); } }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Tạo kế hoạch ngân sách</DialogTitle>
            <DialogDescription>Thiết lập kế hoạch và phân bổ ngân sách theo bộ phận</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Tên kế hoạch <span className="text-red-500">*</span></Label>
                <Input value={formName} onChange={e => setFormName(e.target.value)} placeholder="VD: Ngân sách Quý II 2025" />
              </div>
              <div>
                <Label>Kỳ <span className="text-red-500">*</span></Label>
                <Select value={formPeriod} onValueChange={v => setFormPeriod(v as BudgetPeriod)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{ALL_PERIODS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Ngày bắt đầu <span className="text-red-500">*</span></Label>
                <Input type="date" value={formStartDate} onChange={e => setFormStartDate(e.target.value)} />
              </div>
              <div>
                <Label>Ngày kết thúc <span className="text-red-500">*</span></Label>
                <Input type="date" value={formEndDate} onChange={e => setFormEndDate(e.target.value)} />
              </div>
              <div className="md:col-span-2">
                <Label>Tổng ngân sách (VNĐ) <span className="text-red-500">*</span></Label>
                <Input type="number" min={0} value={formTotalBudget} onChange={e => setFormTotalBudget(Number(e.target.value))} />
              </div>
            </div>
            <Separator />
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Phân bổ theo bộ phận</Label>
                <Button size="sm" variant="outline" onClick={() =>
                  setFormAllocations(prev => [...prev, { department: 'Sản xuất', categoryName: '', allocatedAmount: 0, warningThreshold: 80 }])
                }>
                  <Plus className="h-3 w-3 mr-1" /> Thêm dòng
                </Button>
              </div>
              <div className="space-y-2">
                {formAllocations.map((alloc, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-2 items-end">
                    <div className="col-span-3">
                      <Select value={alloc.department} onValueChange={v =>
                        setFormAllocations(prev => prev.map((a, i) => i === idx ? { ...a, department: v } : a))
                      }>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{DEPARTMENTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-3">
                      <Input value={alloc.categoryName} onChange={e => setFormAllocations(prev => prev.map((a, i) => i === idx ? { ...a, categoryName: e.target.value } : a))} placeholder="Danh mục" />
                    </div>
                    <div className="col-span-3">
                      <Input type="number" min={0} value={alloc.allocatedAmount} onChange={e => setFormAllocations(prev => prev.map((a, i) => i === idx ? { ...a, allocatedAmount: Number(e.target.value) } : a))} placeholder="Số tiền" />
                    </div>
                    <div className="col-span-2">
                      <Input type="number" min={50} max={100} value={alloc.warningThreshold} onChange={e => setFormAllocations(prev => prev.map((a, i) => i === idx ? { ...a, warningThreshold: Number(e.target.value) } : a))} placeholder="%" />
                    </div>
                    <div className="col-span-1">
                      <Button size="sm" variant="ghost" className="text-red-500" disabled={formAllocations.length <= 1}
                        onClick={() => setFormAllocations(prev => prev.filter((_, i) => i !== idx))}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-2 text-right text-sm">
                Tổng phân bổ:{' '}
                <strong className={formAllocations.reduce((s, a) => s + a.allocatedAmount, 0) > formTotalBudget ? 'text-red-600' : ''}>
                  {formatPrice(formAllocations.reduce((s, a) => s + a.allocatedAmount, 0))}
                </strong>
                {' / '}{formatPrice(formTotalBudget)}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowForm(false); resetForm(); }}>Huỷ</Button>
            <Button onClick={handleSave} className="gap-2"><Plus className="h-4 w-4" /> Tạo kế hoạch</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Chi tiết NS */}
      <Dialog open={showDetail} onOpenChange={setShowDetail}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedPlan?.name}</DialogTitle>
            <DialogDescription>
              Chi tiết phân bổ ngân sách, lịch sử giao dịch và trạng thái thực hiện
            </DialogDescription>
          </DialogHeader>
          {selectedPlan && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="p-2.5 rounded-lg bg-muted/30">
                  <span className="text-xs text-muted-foreground">Kỳ</span>
                  <p>{selectedPlan.period} ({formatDate(selectedPlan.startDate)} — {formatDate(selectedPlan.endDate)})</p>
                </div>
                <div className="p-2.5 rounded-lg bg-muted/30">
                  <span className="text-xs text-muted-foreground">Trạng thái</span>
                  <div className="mt-0.5"><StatusBadge status={selectedPlan.status} /></div>
                </div>
                <div className="p-2.5 rounded-lg bg-muted/30">
                  <span className="text-xs text-muted-foreground">Tổng NS</span>
                  <p style={{ fontFamily: 'var(--font-heading)' }}>{formatPrice(selectedPlan.totalBudget)}</p>
                </div>
                <div className="p-2.5 rounded-lg bg-muted/30">
                  <span className="text-xs text-muted-foreground">Đã chi</span>
                  <p className="text-red-600" style={{ fontFamily: 'var(--font-heading)' }}>{formatPrice(selectedPlan.totalUsed)}</p>
                </div>
              </div>

              {/* Overall progress with ProgressRing */}
              {(() => {
                const pct = selectedPlan.totalBudget > 0 ? Math.round((selectedPlan.totalUsed / selectedPlan.totalBudget) * 100) : 0;
                return (
                  <div className="flex items-center gap-4">
                    <ProgressRing
                      value={pct}
                      size={80}
                      strokeWidth={8}
                      color={pct >= 95 ? '#ef4444' : pct >= 80 ? '#f59e0b' : '#6366f1'}
                    />
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">Còn lại: <span className="text-emerald-600" style={{ fontFamily: 'var(--font-heading)' }}>{formatShort(selectedPlan.totalBudget - selectedPlan.totalUsed)}</span></p>
                      {pct >= 80 && (
                        <div className="mt-1 p-2 rounded-lg bg-red-50/60 dark:bg-red-950/10 flex items-center gap-2 text-xs text-red-600">
                          <AlertTriangle className="h-3.5 w-3.5" /> Cảnh báo: Đã sử dụng {pct}% ngân sách!
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}

              <Separator />

              {/* Allocations */}
              <div>
                <p style={{ fontFamily: 'var(--font-heading)' }} className="text-sm mb-2">Phân bổ ({selectedPlan.allocations.length})</p>
                <div className="space-y-2">
                  {selectedPlan.allocations.map(alloc => {
                    const pct = alloc.allocatedAmount > 0 ? Math.round((alloc.usedAmount / alloc.allocatedAmount) * 100) : 0;
                    const overWarning = pct >= alloc.warningThreshold;
                    return (
                      <div key={alloc.id} className={`p-3 rounded-xl border ${overWarning ? 'border-amber-200 bg-amber-50/30 dark:bg-amber-950/5' : 'border-border/50'}`}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm">
                            {alloc.department}
                            {alloc.categoryName && <span className="text-muted-foreground"> / {alloc.categoryName}</span>}
                          </span>
                          <span className="text-xs" style={{ fontFamily: 'var(--font-heading)' }}>
                            {formatShort(alloc.usedAmount)} / {formatShort(alloc.allocatedAmount)}
                          </span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div className={`h-full rounded-full transition-all ${pct >= 95 ? 'bg-red-500' : pct >= 80 ? 'bg-amber-500' : 'bg-blue-500'}`} style={{ width: `${Math.min(pct, 100)}%` }} />
                        </div>
                        <div className="flex justify-between mt-1 text-xs">
                          <span className={overWarning ? 'text-red-600' : 'text-muted-foreground'}>{pct}%</span>
                          <span className="text-emerald-600">Còn: {formatShort(alloc.remainingAmount)}</span>
                        </div>
                        {overWarning && (
                          <div className="mt-1 flex items-center gap-1 text-xs text-amber-600">
                            <AlertTriangle className="h-3 w-3" /> Vượt ngưỡng ({alloc.warningThreshold}%)
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Transactions */}
              {detailTransactions.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <p style={{ fontFamily: 'var(--font-heading)' }} className="text-sm mb-2">Lịch sử giao dịch ({detailTransactions.length})</p>
                    <div className="relative pl-6 space-y-3 max-h-60 overflow-y-auto">
                      {detailTransactions.map((txn, idx) => (
                        <div key={txn.id} className="relative">
                          <div className={`absolute -left-6 top-0.5 w-3 h-3 rounded-full ${
                            txn.type === 'Chi tiêu' ? 'bg-red-500' : txn.type === 'Hoàn trả' ? 'bg-emerald-500' : 'bg-blue-500'
                          }`} />
                          {idx < detailTransactions.length - 1 && <div className="absolute -left-[18px] top-3 w-0.5 h-[calc(100%+0.5rem)] bg-border" />}
                          <div className="text-sm">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">{txn.type}</Badge>
                                <span className="text-xs text-muted-foreground">{txn.allocationName}</span>
                              </div>
                              <span className={txn.type === 'Chi tiêu' ? 'text-red-600' : 'text-emerald-600'} style={{ fontFamily: 'var(--font-heading)' }}>
                                {txn.type === 'Chi tiêu' ? '-' : '+'}{formatShort(txn.amount)}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">{txn.note}</p>
                            {txn.orderNumber && <p className="text-xs text-muted-foreground">Đơn: {txn.orderNumber}</p>}
                            <p className="text-xs text-muted-foreground">{formatDate(txn.createdAt)} — {txn.createdBy}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {selectedPlan.approvedBy && (
                <>
                  <Separator />
                  <div className="flex items-center gap-2 text-sm text-emerald-600">
                    <CheckCircle2 className="h-4 w-4" />
                    Duyệt bởi {selectedPlan.approvedBy}
                    {selectedPlan.approvedAt && ` — ${formatDate(selectedPlan.approvedAt)}`}
                  </div>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default BuyerBudgetPage;
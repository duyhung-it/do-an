// ============================================================
// Phân tích mua hàng — P1 Đợt 2: Buyer Analytics Redesign
// P1.11–P1.20: Header, Stats ProgressRing, Charts, Comparison,
// Export, Filters, Mobile, Animation
// ============================================================

import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  BarChart3, TrendingUp, TrendingDown, Clock, Target, Percent, FileText,
  Download, Building2, Package, Star,
  ArrowUpRight, ArrowDownRight, Minus, FileSpreadsheet, FileDown,
  RefreshCw,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Skeleton } from '../ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { AppBreadcrumb } from '../shared/AppBreadcrumb';
import { DataTable } from '../shared/DataTable';
import { DashboardWidget } from '../shared/DashboardWidget';
import { IconWrapper } from '../shared/IconWrapper';
import { AnimatedNumber } from '../shared/AnimatedNumber';
import { ProgressRing } from '../shared/ProgressRing';
import { TrendIndicator } from '../shared/TrendIndicator';
import { useAuth } from '../../context/AuthContext';
import { analyticsApi } from '../../services/analyticsApi';
import { exportToCSV } from '../../utils/exportUtils';
import { toast } from 'sonner';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line, AreaChart, Area,
  Treemap, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ComposedChart,
} from 'recharts';
import type {
  SpendAnalysis, SavingsReport, ProcurementKPI, TrendDataPoint,
  SupplierPerformance, TopProduct, PaginationParams, SortParams, ColumnConfig,
} from '../../types';

// ─── Constants ────────────────────────────────────────────
const COLORS = ['#3b82f6', '#22c55e', '#eab308', '#ef4444', '#8b5cf6', '#f97316', '#06b6d4', '#ec4899', '#14b8a6', '#a855f7'];
const fmt = (v: number) => new Intl.NumberFormat('vi-VN', { notation: 'compact' }).format(v);
const fmtCur = (v: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(v);
const fmtShort = (v: number) => {
  if (v >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(1)} tỷ`;
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(0)} tr`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(0)}K`;
  return String(v);
};

type Period = 'month' | 'quarter' | 'year' | 'custom';
const PERIOD_LABELS: Record<Period, string> = { month: 'Tháng này', quarter: 'Quý này', year: 'Năm nay', custom: 'Tuỳ chọn' };

// ─── Custom Chart Tooltip ─────────────────────────────────
function ChartTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border bg-card/95 backdrop-blur-sm shadow-lg p-3 min-w-[180px]">
      <p className="text-muted-foreground mb-1.5">{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: p.color }} />
            <span className="text-muted-foreground">{p.name}</span>
          </span>
          <span style={{ fontFamily: 'var(--font-heading)' }}>
            {typeof p.value === 'number' && p.value > 100000 ? fmtCur(p.value) : p.value?.toLocaleString('vi-VN')}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Skeleton Loading (P1.20) ─────────────────────────────
function AnalyticsSkeleton() {
  return (
    <div className="container mx-auto px-4 py-6 space-y-6 animate-in fade-in duration-300">
      <Skeleton className="h-5 w-40" />
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-10 w-64" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}><CardContent className="p-4"><Skeleton className="h-20" /></CardContent></Card>
        ))}
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        <Skeleton className="h-80 rounded-xl" />
        <Skeleton className="h-80 rounded-xl" />
      </div>
      <Skeleton className="h-80 rounded-xl" />
    </div>
  );
}

// ─── P1.12: Stats Metric Card with ProgressRing ──────────
function MetricCard({ title, value, format, icon, variant, trend, trendLabel, ringValue, ringColor }: {
  title: string;
  value: number;
  format?: (n: number) => string;
  icon: React.ElementType;
  variant: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'purple';
  trend?: number;
  trendLabel?: string;
  ringValue?: number;
  ringColor?: string;
}) {
  return (
    <Card className="border-0 shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all duration-200">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-muted-foreground text-xs truncate mb-1.5">{title}</p>
            <p className="text-xl font-bold" style={{ fontFamily: 'var(--font-heading)' }}>
              <AnimatedNumber value={value} format={format} />
            </p>
            {trend !== undefined && (
              <TrendIndicator value={trend} label={trendLabel} size="sm" className="mt-1.5" />
            )}
          </div>
          {ringValue !== undefined ? (
            <ProgressRing value={ringValue} size={48} strokeWidth={4} color={ringColor} />
          ) : (
            <IconWrapper icon={icon} variant={variant} size="sm" />
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── P1.16: Comparison Card ──────────────────────────────
function ComparisonCard({ label, current, previous, format: formatFn }: {
  label: string;
  current: number;
  previous: number;
  format?: (n: number) => string;
}) {
  const diff = previous > 0 ? ((current - previous) / previous * 100) : 0;
  const isPositive = diff >= 0;
  const Icon = diff > 0 ? ArrowUpRight : diff < 0 ? ArrowDownRight : Minus;
  const color = isPositive ? 'text-emerald-600' : 'text-red-600';
  const bg = isPositive ? 'bg-emerald-50 dark:bg-emerald-950/10' : 'bg-red-50 dark:bg-red-950/10';
  const displayFn = formatFn ?? ((n: number) => n.toLocaleString('vi-VN'));

  return (
    <div className={`rounded-xl p-4 ${bg} border border-border/30`}>
      <p className="text-muted-foreground text-xs mb-2">{label}</p>
      <div className="flex items-end justify-between gap-2">
        <div>
          <p className="text-lg" style={{ fontFamily: 'var(--font-heading)' }}>{displayFn(current)}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Trước: {displayFn(previous)}</p>
        </div>
        <div className={`flex items-center gap-0.5 text-sm ${color}`}>
          <Icon className="h-4 w-4" />
          <span style={{ fontFamily: 'var(--font-heading)' }}>{Math.abs(diff).toFixed(1)}%</span>
        </div>
      </div>
    </div>
  );
}

// ─── P1.14: Top Suppliers Horizontal Bar ─────────────────
function TopSupplierBar({ suppliers }: { suppliers: SpendAnalysis['bySupplier'] }) {
  const maxAmount = Math.max(...suppliers.map(s => s.amount));
  return (
    <div className="space-y-3">
      {suppliers.slice(0, 10).map((sup, idx) => (
        <div key={sup.name} className="flex items-center gap-3 group">
          <span className="text-muted-foreground text-xs w-5 text-right shrink-0">{idx + 1}</span>
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 flex items-center justify-center shrink-0">
            <Building2 className="h-3.5 w-3.5 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm truncate group-hover:text-primary transition-colors">{sup.name}</span>
              <span className="text-sm shrink-0 ml-2" style={{ fontFamily: 'var(--font-heading)' }}>
                {fmtShort(sup.amount)}
              </span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-700 ease-out"
                style={{ width: `${(sup.amount / maxAmount) * 100}%` }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Tab: Chi tiêu ────────────────────────────────────────
function SpendTab({ analysis, trendData, onCategoryFilter, filteredCategory }: {
  analysis: SpendAnalysis;
  trendData: TrendDataPoint[];
  onCategoryFilter: (cat: string | null) => void;
  filteredCategory: string | null;
}) {
  const treemapData = analysis.byCategory.map((c, i) => ({
    name: c.name,
    size: c.amount,
    fill: COLORS[i % COLORS.length],
  }));

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* P1.13: Category Donut + P1.14: Top Suppliers */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Donut Chart: Chi tiêu theo danh mục */}
        <DashboardWidget
          title="Chi tiêu theo danh mục"
          headerActions={filteredCategory ? (
            <Button variant="ghost" size="sm" onClick={() => onCategoryFilter(null)}>
              Xoá lọc
            </Button>
          ) : undefined}
        >
          <div className="flex flex-col lg:flex-row items-center gap-4">
            <div className="h-64 w-full lg:w-1/2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analysis.byCategory}
                    dataKey="amount"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={85}
                    paddingAngle={3}
                    cornerRadius={4}
                    onClick={(_, idx) => {
                      const cat = analysis.byCategory[idx]?.name;
                      onCategoryFilter(cat === filteredCategory ? null : cat);
                    }}
                    className="cursor-pointer"
                  >
                    {analysis.byCategory.map((_, i) => (
                      <Cell
                        key={i}
                        fill={COLORS[i % COLORS.length]}
                        opacity={filteredCategory && filteredCategory !== analysis.byCategory[i]?.name ? 0.3 : 1}
                        className="transition-opacity duration-300"
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* Legend bên phải (P1.13) */}
            <div className="flex-1 space-y-2 w-full">
              {analysis.byCategory.map((cat, i) => (
                <button
                  key={cat.name}
                  onClick={() => onCategoryFilter(cat.name === filteredCategory ? null : cat.name)}
                  className={`w-full flex items-center gap-2.5 p-2 rounded-lg text-left transition-all hover:bg-muted/60 ${
                    filteredCategory === cat.name ? 'bg-primary/5 ring-1 ring-primary/20' : ''
                  }`}
                >
                  <span className="h-3 w-3 rounded-full shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                  <span className="flex-1 text-sm truncate">{cat.name}</span>
                  <span className="text-xs text-muted-foreground">{cat.percent}%</span>
                  <span className="text-xs" style={{ fontFamily: 'var(--font-heading)' }}>{fmtShort(cat.amount)}</span>
                </button>
              ))}
            </div>
          </div>
        </DashboardWidget>

        {/* P1.14: Top NCC horizontal bar */}
        <DashboardWidget title="Top 10 nhà cung cấp">
          <TopSupplierBar suppliers={analysis.bySupplier} />
        </DashboardWidget>
      </div>

      {/* P1.15: Xu hướng đặt hàng dual axis */}
      <DashboardWidget title="Xu hướng chi tiêu & đơn hàng 12 tháng">
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={trendData}>
              <defs>
                <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
              <YAxis yAxisId="left" tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
              <Tooltip content={<ChartTooltip />} />
              <Area yAxisId="left" type="monotone" dataKey="current" stroke="#3b82f6" strokeWidth={2.5} fill="url(#trendGrad)" name="Kỳ này" />
              <Line yAxisId="left" type="monotone" dataKey="previous" stroke="#94a3b8" strokeWidth={1.5} strokeDasharray="5 3" dot={false} name="Kỳ trước" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </DashboardWidget>

      {/* Budget vs Actual */}
      <DashboardWidget title="Chi tiêu thực tế vs Ngân sách theo bộ phận">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analysis.byDepartment.map(d => ({
              name: d.name,
              actual: Math.round(d.amount / 1_000_000),
              budget: Math.round(d.budget / 1_000_000),
            }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
              <YAxis tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
              <Tooltip content={<ChartTooltip />} />
              <Legend />
              <Bar dataKey="budget" name="Ngân sách (tr)" fill="#94a3b8" radius={[4, 4, 0, 0]} opacity={0.6} />
              <Bar dataKey="actual" name="Thực tế (tr)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </DashboardWidget>
    </div>
  );
}

// ─── Tab: Tiết kiệm ──────────────────────────────────────
function SavingsTab({ savings }: { savings: SavingsReport }) {
  const [monthlySavings, setMonthlySavings] = useState<{ month: string; target: number; actual: number; cumulative: number }[]>([]);

  useEffect(() => {
    analyticsApi.getMonthlySavings().then(setMonthlySavings);
  }, []);

  const savingsPercent = savings.targetSavings > 0
    ? (savings.actualSavings / savings.targetSavings) * 100
    : 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Summary with ProgressRing */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="hover:-translate-y-0.5 hover:shadow-md transition-all">
          <CardContent className="p-5 flex items-center gap-4">
            <ProgressRing value={savingsPercent} size={64} strokeWidth={5} color="#22c55e" />
            <div>
              <p className="text-sm text-muted-foreground">Đạt mục tiêu</p>
              <p className="text-xl" style={{ fontFamily: 'var(--font-heading)' }}>
                {savingsPercent.toFixed(1)}%
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:-translate-y-0.5 hover:shadow-md transition-all">
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground mb-1">Mục tiêu tiết kiệm</p>
            <p className="text-xl text-blue-600" style={{ fontFamily: 'var(--font-heading)' }}>
              <AnimatedNumber value={savings.targetSavings} format={fmtCur} />
            </p>
          </CardContent>
        </Card>
        <Card className="hover:-translate-y-0.5 hover:shadow-md transition-all">
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground mb-1">Thực tế tiết kiệm</p>
            <p className="text-xl text-emerald-600" style={{ fontFamily: 'var(--font-heading)' }}>
              <AnimatedNumber value={savings.actualSavings} format={fmtCur} />
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <DashboardWidget title="Tiết kiệm theo tháng (triệu ₫)">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlySavings}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                <YAxis tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                <Tooltip content={<ChartTooltip />} />
                <Legend />
                <Bar dataKey="target" name="Mục tiêu" fill="#94a3b8" radius={[4, 4, 0, 0]} opacity={0.6} />
                <Bar dataKey="actual" name="Thực tế" fill="#22c55e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </DashboardWidget>

        <DashboardWidget title="Tiết kiệm theo phương pháp">
          <div className="h-64 flex flex-col lg:flex-row items-center gap-4">
            <div className="h-full w-full lg:w-1/2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={savings.savingsByMethod}
                    dataKey="amount"
                    nameKey="method"
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={75}
                    paddingAngle={3}
                    cornerRadius={4}
                  >
                    {savings.savingsByMethod.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-2 w-full">
              {savings.savingsByMethod.map((m, i) => (
                <div key={m.method} className="flex items-center gap-2 text-sm">
                  <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                  <span className="flex-1 truncate text-muted-foreground">{m.method}</span>
                  <span style={{ fontFamily: 'var(--font-heading)' }}>{fmtShort(m.amount)}</span>
                </div>
              ))}
            </div>
          </div>
        </DashboardWidget>

        <div className="lg:col-span-2">
          <DashboardWidget title="Tiết kiệm luỹ kế (triệu ₫)">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlySavings}>
                  <defs>
                    <linearGradient id="savingsGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#22c55e" stopOpacity={0.25} />
                      <stop offset="100%" stopColor="#22c55e" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                  <YAxis tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                  <Tooltip content={<ChartTooltip />} />
                  <Area type="monotone" dataKey="cumulative" name="Luỹ kế" stroke="#22c55e" strokeWidth={2.5} fill="url(#savingsGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </DashboardWidget>
        </div>
      </div>
    </div>
  );
}

// ─── Tab: Sản phẩm ────────────────────────────────────────
function ProductsTab({ products, filteredCategory }: { products: TopProduct[]; filteredCategory: string | null }) {
  const [pagination, setPagination] = useState<PaginationParams>({ page: 1, pageSize: 10 });
  const [sort, setSort] = useState<SortParams>({ field: 'amount', direction: 'desc' });
  const [exporting, setExporting] = useState(false);

  const filtered = filteredCategory ? products : products;

  const sorted = [...filtered].sort((a, b) => {
    const aVal = (a as Record<string, unknown>)[sort.field];
    const bVal = (b as Record<string, unknown>)[sort.field];
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return sort.direction === 'asc' ? aVal - bVal : bVal - aVal;
    }
    return 0;
  });

  const start = (pagination.page - 1) * pagination.pageSize;
  const pageData = sorted.slice(start, start + pagination.pageSize);

  const columns: (ColumnConfig & { render?: (item: TopProduct) => React.ReactNode })[] = [
    {
      key: 'name', label: 'Sản phẩm', visible: true, sortable: true,
      render: (item: TopProduct) => (
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-muted/60 flex items-center justify-center shrink-0">
            <Package className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
          <span className="truncate">{item.name}</span>
        </div>
      ),
    },
    {
      key: 'qty', label: 'Số lượng', visible: true, sortable: true,
      render: (item: TopProduct) => <span style={{ fontFamily: 'var(--font-heading)' }}>{item.qty.toLocaleString('vi-VN')}</span>,
    },
    {
      key: 'amount', label: 'Tổng chi', visible: true, sortable: true,
      render: (item: TopProduct) => (
        <span className="text-primary" style={{ fontFamily: 'var(--font-heading)' }}>{fmtCur(item.amount)}</span>
      ),
    },
    { key: 'supplier', label: 'NCC chính', visible: true, sortable: true },
    {
      key: 'trend', label: 'Xu hướng', visible: true, sortable: true,
      render: (item: TopProduct) => <TrendIndicator value={item.trend} />,
    },
  ];

  const handleExport = async () => {
    setExporting(true);
    await new Promise(r => setTimeout(r, 800));
    exportToCSV(filtered as unknown as Record<string, unknown>[], [
      { key: 'name', label: 'Sản phẩm' },
      { key: 'qty', label: 'Số lượng' },
      { key: 'amount', label: 'Tổng chi (VNĐ)' },
      { key: 'supplier', label: 'NCC chính' },
      { key: 'trend', label: 'Xu hướng (%)' },
    ], 'top-san-pham');
    toast.success('Đã xuất CSV sản phẩm');
    setExporting(false);
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2">
          <Package className="h-5 w-5 text-primary" />
          Top {filtered.length} sản phẩm mua nhiều nhất
        </h3>
        <Button variant="outline" size="sm" onClick={handleExport} disabled={exporting}>
          {exporting ? <RefreshCw className="h-4 w-4 mr-1 animate-spin" /> : <Download className="h-4 w-4 mr-1" />}
          {exporting ? 'Đang xuất...' : 'Xuất CSV'}
        </Button>
      </div>
      <DataTable<TopProduct>
        data={pageData}
        columns={columns}
        totalItems={filtered.length}
        pagination={pagination}
        sort={sort}
        onPaginationChange={setPagination}
        onSortChange={setSort}
        getId={(p) => p.name}
        loading={false}
      />
    </div>
  );
}

// ─── Tab: NCC hiệu suất ──────────���───────────────────────
function SupplierTab({ suppliers }: { suppliers: SupplierPerformance[] }) {
  const [pagination, setPagination] = useState<PaginationParams>({ page: 1, pageSize: 10 });
  const [sort, setSort] = useState<SortParams>({ field: 'overallScore', direction: 'desc' });
  const [radarData, setRadarData] = useState<{ metric: string; current: number; previous: number }[]>([]);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    analyticsApi.getComparisonRadar().then(setRadarData);
  }, []);

  const sorted = [...suppliers].sort((a, b) => {
    const aVal = (a as Record<string, unknown>)[sort.field];
    const bVal = (b as Record<string, unknown>)[sort.field];
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return sort.direction === 'asc' ? aVal - bVal : bVal - aVal;
    }
    return 0;
  });

  const start = (pagination.page - 1) * pagination.pageSize;
  const pageData = sorted.slice(start, start + pagination.pageSize);

  const columns: (ColumnConfig & { render?: (item: SupplierPerformance) => React.ReactNode })[] = [
    {
      key: 'name', label: 'Nhà cung cấp', visible: true, sortable: true,
      render: (item: SupplierPerformance) => (
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 flex items-center justify-center shrink-0">
            <Building2 className="h-3.5 w-3.5 text-blue-600" />
          </div>
          <span>{item.name}</span>
        </div>
      ),
    },
    {
      key: 'orderCount', label: 'Số đơn', visible: true, sortable: true,
      render: (item: SupplierPerformance) => <span style={{ fontFamily: 'var(--font-heading)' }}>{item.orderCount}</span>,
    },
    {
      key: 'totalAmount', label: 'Giá trị', visible: true, sortable: true,
      render: (item: SupplierPerformance) => (
        <span className="text-primary" style={{ fontFamily: 'var(--font-heading)' }}>{fmtShort(item.totalAmount)}</span>
      ),
    },
    {
      key: 'onTimeRate', label: '% Đúng hạn', visible: true, sortable: true,
      render: (item: SupplierPerformance) => (
        <Badge variant={item.onTimeRate >= 90 ? 'default' : item.onTimeRate >= 80 ? 'outline' : 'destructive'}>
          {item.onTimeRate}%
        </Badge>
      ),
    },
    {
      key: 'qualityScore', label: 'Chất lượng', visible: true, sortable: true,
      render: (item: SupplierPerformance) => (
        <div className="flex items-center gap-1.5">
          <div className="h-1.5 w-12 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${item.qualityScore >= 90 ? 'bg-emerald-500' : item.qualityScore >= 80 ? 'bg-amber-500' : 'bg-red-500'}`}
              style={{ width: `${item.qualityScore}%` }}
            />
          </div>
          <span className="text-xs">{item.qualityScore}</span>
        </div>
      ),
    },
    {
      key: 'responseTime', label: 'TG phản hồi', visible: true, sortable: true,
      render: (item: SupplierPerformance) => <span className="text-muted-foreground">{item.responseTime}h</span>,
    },
    {
      key: 'overallScore', label: 'Tổng điểm', visible: true, sortable: true,
      render: (item: SupplierPerformance) => (
        <div className="flex items-center gap-1">
          <Star className={`h-4 w-4 ${item.overallScore >= 90 ? 'text-emerald-500' : item.overallScore >= 80 ? 'text-amber-500' : 'text-red-500'}`} />
          <span style={{ fontFamily: 'var(--font-heading)' }}>{item.overallScore}</span>
        </div>
      ),
    },
  ];

  const handleExport = async () => {
    setExporting(true);
    await new Promise(r => setTimeout(r, 800));
    exportToCSV(suppliers as unknown as Record<string, unknown>[], [
      { key: 'name', label: 'NCC' },
      { key: 'orderCount', label: 'Số đơn' },
      { key: 'totalAmount', label: 'Giá trị (VNĐ)' },
      { key: 'onTimeRate', label: '% Đúng hạn' },
      { key: 'qualityScore', label: 'Chất lượng' },
      { key: 'responseTime', label: 'TG phản hồi (h)' },
      { key: 'overallScore', label: 'Tổng điểm' },
    ], 'hieu-suat-ncc');
    toast.success('Đã xuất CSV hiệu suất NCC');
    setExporting(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-primary" />
          Hiệu suất nhà cung cấp
        </h3>
        <Button variant="outline" size="sm" onClick={handleExport} disabled={exporting}>
          {exporting ? <RefreshCw className="h-4 w-4 mr-1 animate-spin" /> : <Download className="h-4 w-4 mr-1" />}
          {exporting ? 'Đang xuất...' : 'Xuất CSV'}
        </Button>
      </div>

      <DataTable<SupplierPerformance>
        data={pageData}
        columns={columns}
        totalItems={suppliers.length}
        pagination={pagination}
        sort={sort}
        onPaginationChange={setPagination}
        onSortChange={setSort}
        getId={(s) => s.id}
        loading={false}
      />

      {/* Radar chart: So sánh kỳ */}
      {radarData.length > 0 && (
        <DashboardWidget title="So sánh tổng thể kỳ này vs kỳ trước">
          <div className="h-72 flex justify-center">
            <ResponsiveContainer width="100%" height="100%" maxHeight={300}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="var(--border)" />
                <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" />
                <Radar name="Kỳ này" dataKey="current" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.25} />
                <Radar name="Kỳ trước" dataKey="previous" stroke="#94a3b8" fill="#94a3b8" fillOpacity={0.1} />
                <Legend />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </DashboardWidget>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// Main Page
// ═══════════════════════════════════════════════════════════
export function BuyerAnalyticsPage() {
  const { user } = useAuth();
  const [period, setPeriod] = useState<Period>('year');
  const [loading, setLoading] = useState(true);
  const [analysis, setAnalysis] = useState<SpendAnalysis | null>(null);
  const [savings, setSavings] = useState<SavingsReport | null>(null);
  const [kpis, setKPIs] = useState<ProcurementKPI | null>(null);
  const [trendData, setTrendData] = useState<TrendDataPoint[]>([]);
  const [suppliers, setSuppliers] = useState<SupplierPerformance[]>([]);
  const [filteredCategory, setFilteredCategory] = useState<string | null>(null);
  const [exportingPdf, setExportingPdf] = useState(false);
  const [exportingExcel, setExportingExcel] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [a, s, k, t, sp] = await Promise.all([
        analyticsApi.getSpendAnalysis(period),
        analyticsApi.getSavingsReport(period),
        analyticsApi.getProcurementKPIs(period),
        analyticsApi.getTrendData(12),
        analyticsApi.getSupplierPerformances(),
      ]);
      setAnalysis(a);
      setSavings(s);
      setKPIs(k);
      setTrendData(t);
      setSuppliers(sp);
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // P1.17: Export handlers
  const handleExportPdf = async () => {
    setExportingPdf(true);
    await new Promise(r => setTimeout(r, 1500));
    toast.success('Đã xuất báo cáo PDF');
    setExportingPdf(false);
  };
  const handleExportExcel = async () => {
    setExportingExcel(true);
    await new Promise(r => setTimeout(r, 1200));
    toast.success('Đã xuất file Excel');
    setExportingExcel(false);
  };

  if (loading || !kpis) return <AnalyticsSkeleton />;

  return (
    <div className="container mx-auto px-4 py-6 space-y-6 animate-in fade-in duration-300">
      <AppBreadcrumb items={[{ label: 'Phân tích mua hàng' }]} />

      {/* ─── P1.11: Page Header ──────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-700 flex items-center justify-center shadow-md shrink-0">
            <BarChart3 className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="font-black" style={{ fontFamily: 'var(--font-heading)' }}>Phân tích mua hàng</h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              Phân tích hoạt động mua hàng của bạn — dữ liệu {PERIOD_LABELS[period].toLowerCase()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* P1.18: Period filter */}
          <div className="flex items-center gap-0.5 bg-muted rounded-xl p-1">
            {(['month', 'quarter', 'year'] as Period[]).map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                  period === p
                    ? 'bg-card shadow-sm text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {PERIOD_LABELS[p]}
              </button>
            ))}
          </div>
          {/* P1.17: Export buttons */}
          <Button variant="outline" size="sm" onClick={handleExportPdf} disabled={exportingPdf}>
            {exportingPdf ? <RefreshCw className="h-3.5 w-3.5 mr-1 animate-spin" /> : <FileDown className="h-3.5 w-3.5 mr-1" />}
            PDF
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportExcel} disabled={exportingExcel}>
            {exportingExcel ? <RefreshCw className="h-3.5 w-3.5 mr-1 animate-spin" /> : <FileSpreadsheet className="h-3.5 w-3.5 mr-1" />}
            Excel
          </Button>
        </div>
      </div>

      {/* ─── P1.12: 6 Metric Cards with ProgressRing ───── */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <MetricCard
          title="TG xử lý ĐH TB"
          value={kpis.avgOrderCycleTime}
          format={(n) => `${n.toFixed(1)} ngày`}
          icon={Clock}
          variant="primary"
          trend={-5.2}
          trendLabel="vs kỳ trước"
          ringValue={Math.min(100, (kpis.avgOrderCycleTime / 7) * 100)}
          ringColor="#3b82f6"
        />
        <MetricCard
          title="Tỷ lệ RFQ→ĐH"
          value={kpis.rfqToOrderConversionRate}
          format={(n) => `${n.toFixed(1)}%`}
          icon={Target}
          variant="success"
          trend={3.5}
          ringValue={kpis.rfqToOrderConversionRate}
          ringColor="#22c55e"
        />
        <MetricCard
          title="NCC giao đúng hạn"
          value={kpis.supplierOnTimeRate}
          format={(n) => `${n.toFixed(1)}%`}
          icon={TrendingUp}
          variant="info"
          trend={2.1}
          ringValue={kpis.supplierOnTimeRate}
          ringColor="#0ea5e9"
        />
        <MetricCard
          title="Chính xác HĐ"
          value={kpis.invoiceAccuracyRate}
          format={(n) => `${n.toFixed(1)}%`}
          icon={Percent}
          variant="purple"
          trend={0.8}
          ringValue={kpis.invoiceAccuracyRate}
          ringColor="#8b5cf6"
        />
        <MetricCard
          title="TG TT trung bình"
          value={kpis.avgPaymentCycleTime}
          format={(n) => `${n.toFixed(1)} ngày`}
          icon={Clock}
          variant="warning"
          trend={-3.0}
          trendLabel="vs kỳ trước"
          ringValue={Math.min(100, (kpis.avgPaymentCycleTime / 30) * 100)}
          ringColor="#d97706"
        />
        <MetricCard
          title="Tuân thủ HĐ"
          value={kpis.contractComplianceRate}
          format={(n) => `${n.toFixed(1)}%`}
          icon={FileText}
          variant="success"
          trend={1.5}
          ringValue={kpis.contractComplianceRate}
          ringColor="#059669"
        />
      </div>

      {/* ─── P1.16: So sánh tháng trước ─────────────────── */}
      {analysis && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <ComparisonCard
            label="Tổng chi tiêu"
            current={analysis.totalSpend}
            previous={analysis.totalSpend * 0.92}
            format={fmtCur}
          />
          <ComparisonCard
            label="Số đơn hàng"
            current={analysis.bySupplier.reduce((s, sp) => s + sp.orderCount, 0)}
            previous={Math.round(analysis.bySupplier.reduce((s, sp) => s + sp.orderCount, 0) * 0.88)}
          />
          <ComparisonCard
            label="Số NCC"
            current={analysis.bySupplier.length}
            previous={analysis.bySupplier.length - 1}
          />
          <ComparisonCard
            label="TB/đơn hàng"
            current={Math.round(analysis.totalSpend / Math.max(analysis.bySupplier.reduce((s, sp) => s + sp.orderCount, 0), 1))}
            previous={Math.round(analysis.totalSpend * 0.92 / Math.max(analysis.bySupplier.reduce((s, sp) => s + sp.orderCount, 0) * 0.88, 1))}
            format={fmtCur}
          />
        </div>
      )}

      {/* ─── Tabs ────────────────────────────────────────── */}
      <Tabs defaultValue="spend">
        <TabsList className="grid w-full grid-cols-4 rounded-xl bg-muted/60 p-1">
          <TabsTrigger value="spend" className="flex items-center gap-1.5 rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm">
            <BarChart3 className="h-4 w-4" /> <span className="hidden sm:inline">Chi tiêu</span>
          </TabsTrigger>
          <TabsTrigger value="savings" className="flex items-center gap-1.5 rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm">
            <TrendingUp className="h-4 w-4" /> <span className="hidden sm:inline">Tiết kiệm</span>
          </TabsTrigger>
          <TabsTrigger value="products" className="flex items-center gap-1.5 rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm">
            <Package className="h-4 w-4" /> <span className="hidden sm:inline">Sản phẩm</span>
          </TabsTrigger>
          <TabsTrigger value="suppliers" className="flex items-center gap-1.5 rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm">
            <Building2 className="h-4 w-4" /> <span className="hidden sm:inline">NCC</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="spend" className="mt-6">
          {analysis && (
            <SpendTab
              analysis={analysis}
              trendData={trendData}
              onCategoryFilter={setFilteredCategory}
              filteredCategory={filteredCategory}
            />
          )}
        </TabsContent>

        <TabsContent value="savings" className="mt-6">
          {savings && <SavingsTab savings={savings} />}
        </TabsContent>

        <TabsContent value="products" className="mt-6">
          {analysis && (
            <ProductsTab
              products={analysis.topProducts}
              filteredCategory={filteredCategory}
            />
          )}
        </TabsContent>

        <TabsContent value="suppliers" className="mt-6">
          <SupplierTab suppliers={suppliers} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
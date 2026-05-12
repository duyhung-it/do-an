// ============================================================
// Thanh toán & Công nợ — Buyer
// DataTable + Card list + Calendar view + Stats + QR + Timeline
// ============================================================

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router';
import {
  CreditCard, Clock, CheckCircle2, AlertTriangle, DollarSign,
  Download, BarChart3, Upload, Ban,
  Calendar, List, Table2,
  Eye,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Progress } from '../ui/progress';

import { Skeleton } from '../ui/skeleton';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
  DialogDescription,
} from '../ui/dialog';
import { Textarea } from '../ui/textarea';
import { DataTable } from '../shared/DataTable';
import { FilterBar } from '../shared/FilterBar';
import { StatusBadge } from '../shared/StatusBadge';

import { IconWrapper } from '../shared/IconWrapper';
import { AnimatedNumber } from '../shared/AnimatedNumber';
import { AppBreadcrumb } from '../shared/AppBreadcrumb';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip,
  ResponsiveContainer,
} from 'recharts';
import { paymentApi } from '../../services/api';
import { exportToCSV } from '../../utils/exportUtils';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';
import type {
  Payment, ActiveFilter, FilterConfig,
  PaginationParams, SortParams, ColumnConfig,
} from '../../types';

const formatPrice = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n);

const fmtShort = (v: number) => {
  if (v >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(1)} tỷ`;
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(0)} tr`;
  return formatPrice(v);
};

const today = new Date().toISOString().slice(0, 10);

function getDaysUntilDue(dueDate: string): number {
  const due = new Date(dueDate).getTime();
  const now = new Date(today).getTime();
  return Math.ceil((due - now) / (1000 * 60 * 60 * 24));
}

const filterConfigs: FilterConfig[] = [
  {
    key: 'status', label: 'Trạng thái', type: 'select', options: [
      { label: 'Chờ thanh toán', value: 'Chờ thanh toán' },
      { label: 'Đã thanh toán một phần', value: 'Đã thanh toán một phần' },
      { label: 'Đã thanh toán', value: 'Đã thanh toán' },
      { label: 'Quá hạn', value: 'Quá hạn' },
    ],
  },
  {
    key: 'method', label: 'Phương thức', type: 'select', options: [
      { label: 'Chuyển khoản', value: 'Chuyển khoản' },
      { label: 'COD', value: 'COD' },
      { label: 'L/C', value: 'L/C' },
      { label: 'Trả chậm 30 ngày', value: 'Trả chậm 30 ngày' },
      { label: 'Trả chậm 60 ngày', value: 'Trả chậm 60 ngày' },
    ],
  },
];

type PaymentViewMode = 'table' | 'list' | 'calendar';

const columns: ColumnConfig[] = [
  { key: 'invoiceNumber', label: 'Hoá đơn', sortable: true },
  { key: 'orderNumber', label: 'Đơn hàng', sortable: true },
  { key: 'supplierName', label: 'Nhà cung cấp', sortable: true },
  {
    key: 'status', label: 'Trạng thái', sortable: true,
    render: (_, row) => <StatusBadge status={(row as Payment).status} />,
  },
  { key: 'method', label: 'PT thanh toán', sortable: true },
  {
    key: 'amount', label: 'Tổng tiền', sortable: true,
    render: (v) => formatPrice(v as number),
  },
  {
    key: 'paidAmount', label: 'Đã trả', sortable: true,
    render: (v) => <span className="text-emerald-600">{formatPrice(v as number)}</span>,
  },
  {
    key: 'remainingAmount', label: 'Còn lại', sortable: true,
    render: (v) => {
      const val = v as number;
      return <span className={val > 0 ? 'text-red-600' : 'text-emerald-600'}>{formatPrice(val)}</span>;
    },
  },
  {
    key: 'dueDate', label: 'Hạn trả', sortable: true,
    render: (v, row) => {
      const p = row as Payment;
      const days = getDaysUntilDue(p.dueDate);
      const isOverdue = days < 0 && p.remainingAmount > 0;
      return (
        <div>
          <span className={isOverdue ? 'text-red-600' : ''}>{v as string}</span>
          {isOverdue && <Badge variant="destructive" className="ml-1 text-[10px]">Quá hạn</Badge>}
        </div>
      );
    },
  },
  {
    key: 'progress', label: 'Tiến trình',
    render: (_, row) => {
      const p = row as Payment;
      const pct = p.amount > 0 ? Math.round((p.paidAmount / p.amount) * 100) : 0;
      return <Progress value={pct} className="h-2 w-20" />;
    },
  },
];

// ── Calendar View ──
function PaymentCalendar({ payments }: { payments: Payment[] }) {
  const todayDate = new Date();
  const year = todayDate.getFullYear();
  const month = todayDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthName = todayDate.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' });

  const dateMap = useMemo(() => {
    const map = new Map<number, Payment[]>();
    for (const p of payments) {
      const d = new Date(p.dueDate);
      if (d.getFullYear() === year && d.getMonth() === month) {
        const day = d.getDate();
        const arr = map.get(day) ?? [];
        arr.push(p);
        map.set(day, arr);
      }
    }
    return map;
  }, [payments, year, month]);

  const days = [];
  for (let i = 0; i < (firstDay === 0 ? 6 : firstDay - 1); i++) {
    days.push(<div key={`e-${i}`} />);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const dayPayments = dateMap.get(d) ?? [];
    const isToday = d === todayDate.getDate();
    const hasOverdue = dayPayments.some(p => p.status === 'Quá hạn' || (p.remainingAmount > 0 && getDaysUntilDue(p.dueDate) < 0));

    days.push(
      <div
        key={d}
        className={`min-h-[60px] sm:min-h-[80px] p-1.5 rounded-lg border text-xs transition-colors ${
          isToday ? 'border-primary bg-primary/5' : 'border-border/30'
        } ${hasOverdue ? 'bg-red-50/50 dark:bg-red-950/10' : ''}`}
      >
        <span className={`inline-flex items-center justify-center h-5 w-5 rounded-full text-[10px] ${
          isToday ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
        }`}>{d}</span>
        {dayPayments.length > 0 && (
          <div className="mt-0.5 space-y-0.5">
            {dayPayments.slice(0, 2).map(p => (
              <div
                key={p.id}
                className={`truncate text-[9px] sm:text-[10px] px-1 py-0.5 rounded ${
                  p.status === 'Đã thanh toán' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/20'
                  : hasOverdue ? 'bg-red-100 text-red-700 dark:bg-red-950/20'
                  : 'bg-amber-100 text-amber-700 dark:bg-amber-950/20'
                }`}
              >
                {fmtShort(p.remainingAmount > 0 ? p.remainingAmount : p.amount)}
              </div>
            ))}
            {dayPayments.length > 2 && (
              <span className="text-[9px] text-muted-foreground">+{dayPayments.length - 2}</span>
            )}
          </div>
        )}
      </div>,
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base capitalize">{monthName}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1 mb-1">
          {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map(d => (
            <div key={d} className="text-center text-xs text-muted-foreground py-1">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">{days}</div>
      </CardContent>
    </Card>
  );
}

// ── Payment Card for list view ──
function PaymentCard({ p, onClick }: { p: Payment; onClick: () => void }) {
  const paidPct = p.amount > 0 ? Math.round((p.paidAmount / p.amount) * 100) : 0;
  const daysLeft = getDaysUntilDue(p.dueDate);
  const isOverdue = daysLeft < 0 && p.remainingAmount > 0;
  const isNearDue = daysLeft >= 0 && daysLeft <= 7 && p.remainingAmount > 0;

  return (
    <Card
      className={`hover:shadow-md transition-all cursor-pointer ${
        isOverdue ? 'border-red-200 bg-red-50/30 dark:bg-red-950/5'
        : isNearDue ? 'border-amber-200 bg-amber-50/30 dark:bg-amber-950/5' : ''
      }`}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <IconWrapper
            icon={CreditCard}
            variant={p.status === 'Đã thanh toán' ? 'success' : p.status === 'Quá hạn' ? 'danger' : 'primary'}
            size="sm"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium">{p.invoiceNumber}</span>
              <StatusBadge status={p.status} size="sm" />
              <Badge variant="outline" className="text-xs">{p.method}</Badge>
              {isOverdue && <Badge variant="destructive" className="text-[10px]">Quá hạn {Math.abs(daysLeft)}d</Badge>}
              {isNearDue && <Badge variant="outline" className="border-amber-500 text-amber-600 text-[10px]">{daysLeft}d</Badge>}
            </div>
            <p className="text-muted-foreground text-sm truncate mt-0.5">
              {p.orderNumber} · {p.supplierName}
            </p>
            <div className="mt-2 flex items-center gap-2">
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    paidPct >= 100 ? 'bg-emerald-500' : paidPct > 0 ? 'bg-blue-500' : 'bg-muted-foreground/20'
                  }`}
                  style={{ width: `${paidPct}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground shrink-0">{paidPct}%</span>
            </div>
          </div>
          <div className="text-right hidden sm:block shrink-0">
            <p className="font-medium">{formatPrice(p.amount)}</p>
            <p className="text-muted-foreground text-sm">Còn: {formatPrice(p.remainingAmount)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════════════════════════
export function BuyerPaymentList() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<Payment[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [allPayments, setAllPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<ActiveFilter[]>([]);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState<PaginationParams>({ page: 1, pageSize: 10 });
  const [sort, setSort] = useState<SortParams>({});
  const [viewMode, setViewMode] = useState<PaymentViewMode>('list');

  // Chart dialog
  const [showChart, setShowChart] = useState(false);

  // Upload proof
  const [showUpload, setShowUpload] = useState<Payment | null>(null);
  const [uploadUrl, setUploadUrl] = useState('');
  const [uploadNote, setUploadNote] = useState('');

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const buyerFilter: ActiveFilter = { key: 'buyerId', value: user.id };
      const allFilters = [buyerFilter, ...filters];
      const res = await paymentApi.getPaginated(pagination, sort, allFilters, search);
      setData(res.data);
      setTotalItems(res.total);

      const all = await paymentApi.getByBuyer(user.id);
      setAllPayments(all);
    } finally {
      setLoading(false);
    }
  }, [user, pagination, sort, filters, search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Stats
  const stats = useMemo(() => {
    const totalDebt = allPayments.reduce((s, p) => s + p.remainingAmount, 0);
    const overdue = allPayments.filter(p => p.status === 'Quá hạn').reduce((s, p) => s + p.remainingAmount, 0);
    const paidThisMonth = allPayments
      .filter(p => {
        const lastTxn = p.transactions[p.transactions.length - 1];
        if (!lastTxn) return false;
        return lastTxn.paidAt.slice(0, 7) === today.slice(0, 7);
      })
      .reduce((s, p) => s + p.paidAmount, 0);
    return { totalDebt, overdue, paidThisMonth, remaining: totalDebt };
  }, [allPayments]);

  // Chart data
  const chartData = useMemo(() => {
    const map = new Map<string, { chiTieu: number; congNo: number }>();
    for (const p of allPayments) {
      const month = p.createdAt.slice(0, 7);
      const cur = map.get(month) ?? { chiTieu: 0, congNo: 0 };
      cur.chiTieu += p.paidAmount;
      cur.congNo += p.remainingAmount;
      map.set(month, cur);
    }
    return Array.from(map.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([month, v]) => ({ month, ...v }));
  }, [allPayments]);

  // Warnings
  const overduePayments = useMemo(() =>
    allPayments.filter(p => p.status === 'Quá hạn' || (p.remainingAmount > 0 && getDaysUntilDue(p.dueDate) < 0)),
    [allPayments],
  );
  const nearDuePayments = useMemo(() =>
    allPayments.filter(p => p.remainingAmount > 0 && getDaysUntilDue(p.dueDate) >= 0 && getDaysUntilDue(p.dueDate) <= 7),
    [allPayments],
  );

  const goToDetail = (p: Payment) => navigate(`/payments/${p.id}`);

  const handleUploadProof = async () => {
    if (!showUpload) return;
    if (!uploadUrl.trim()) { toast.error('Vui lòng nhập URL chứng từ'); return; }
    try {
      await paymentApi.recordTransaction(showUpload.id, {
        paymentId: showUpload.id,
        amount: 0,
        method: 'Chuyển khoản',
        transactionRef: `PROOF-${Date.now()}`,
        note: `Chứng từ CK: ${uploadUrl}${uploadNote ? ` — ${uploadNote}` : ''}`,
        paidAt: today,
      });
      toast.success('Đã gửi xác nhận chuyển khoản');
      setShowUpload(null);
      fetchData();
    } catch { toast.error('Có lỗi xảy ra'); }
  };

  const handleExportCSV = () => {
    exportToCSV(data as unknown as Record<string, unknown>[], [
      { key: 'invoiceNumber', label: 'Hoá đơn' },
      { key: 'orderNumber', label: 'Đơn hàng' },
      { key: 'supplierName', label: 'NCC' },
      { key: 'method', label: 'PT thanh toán' },
      { key: 'amount', label: 'Tổng tiền' },
      { key: 'paidAmount', label: 'Đã trả' },
      { key: 'remainingAmount', label: 'Còn lại' },
      { key: 'dueDate', label: 'Hạn trả' },
      { key: 'status', label: 'Trạng thái' },
    ], 'lich-su-thanh-toan-buyer');
    toast.success('Đã xuất CSV');
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <AppBreadcrumb items={[{ label: 'Trang chủ', href: '/' }, { label: 'Thanh toán' }]} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2">
            <CreditCard className="h-6 w-6 text-primary" />
            Thanh toán & Công nợ
          </h1>
          <p className="text-muted-foreground mt-1">Quản lý các khoản thanh toán và công nợ</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* View toggle */}
          <div className="flex items-center gap-0.5 border rounded-xl p-1">
            {([
              { mode: 'table' as const, icon: Table2, label: 'Bảng' },
              { mode: 'list' as const, icon: List, label: 'Danh sách' },
              { mode: 'calendar' as const, icon: Calendar, label: 'Lịch' },
            ]).map(v => (
              <Button
                key={v.mode}
                variant={viewMode === v.mode ? 'default' : 'ghost'}
                size="sm" className="h-8 px-2 gap-1"
                onClick={() => setViewMode(v.mode)}
                title={v.label}
              >
                <v.icon className="h-4 w-4" />
                <span className="hidden sm:inline text-xs">{v.label}</span>
              </Button>
            ))}
          </div>
          <Button variant="outline" size="sm" onClick={() => setShowChart(true)}>
            <BarChart3 className="h-4 w-4 mr-1" /> Biểu đồ
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportCSV}>
            <Download className="h-4 w-4 mr-1" /> CSV
          </Button>
        </div>
      </div>

      {/* Warnings */}
      {overduePayments.length > 0 && (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-red-50/80 dark:bg-red-950/10 border border-red-200 dark:border-red-900/30">
          <IconWrapper icon={Ban} variant="danger" size="sm" />
          <p className="text-sm text-red-700 dark:text-red-400">
            <strong>{overduePayments.length}</strong> khoản quá hạn — Tổng: <strong>{formatPrice(overduePayments.reduce((s, p) => s + p.remainingAmount, 0))}</strong>
          </p>
        </div>
      )}
      {nearDuePayments.length > 0 && (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-50/80 dark:bg-amber-950/10 border border-amber-200 dark:border-amber-900/30">
          <IconWrapper icon={AlertTriangle} variant="warning" size="sm" />
          <p className="text-sm text-amber-700 dark:text-amber-400">
            <strong>{nearDuePayments.length}</strong> khoản sắp đến hạn (7 ngày)
          </p>
        </div>
      )}

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-red-500 hover:-translate-y-0.5 hover:shadow-md transition-all">
          <CardContent className="p-4 flex items-center gap-3">
            <IconWrapper icon={DollarSign} variant="danger" size="md" />
            <div>
              <p className="text-xs text-muted-foreground">Tổng công nợ</p>
              <p className="text-lg text-red-600"><AnimatedNumber value={stats.totalDebt} format={fmtShort} /></p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-emerald-500 hover:-translate-y-0.5 hover:shadow-md transition-all">
          <CardContent className="p-4 flex items-center gap-3">
            <IconWrapper icon={CheckCircle2} variant="success" size="md" />
            <div>
              <p className="text-xs text-muted-foreground">Đã trả tháng này</p>
              <p className="text-lg text-emerald-600"><AnimatedNumber value={stats.paidThisMonth} format={fmtShort} /></p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-amber-500 hover:-translate-y-0.5 hover:shadow-md transition-all">
          <CardContent className="p-4 flex items-center gap-3">
            <IconWrapper icon={Clock} variant="warning" size="md" />
            <div>
              <p className="text-xs text-muted-foreground">Còn lại</p>
              <p className="text-lg text-amber-600"><AnimatedNumber value={stats.remaining} format={fmtShort} /></p>
            </div>
          </CardContent>
        </Card>
      </div>

      <FilterBar
        filters={filterConfigs}
        activeFilters={filters}
        onFilterChange={setFilters}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Tìm mã đơn, hoá đơn, NCC..."
      />

      {/* Content by view mode */}
      {loading ? (
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>
      ) : viewMode === 'table' ? (
        <DataTable<Payment>
          data={data}
          columns={columns}
          totalItems={totalItems}
          pagination={pagination}
          sort={sort}
          onPaginationChange={setPagination}
          onSortChange={setSort}
          getId={p => p.id}
          loading={loading}
          onRowClick={goToDetail}
          renderActions={p => (
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); goToDetail(p); }}>
                <Eye className="h-4 w-4" />
              </Button>
              {p.remainingAmount > 0 && (
                <Button variant="ghost" size="sm" onClick={(e) => {
                  e.stopPropagation();
                  setShowUpload(p);
                  setUploadUrl('');
                  setUploadNote('');
                }}>
                  <Upload className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
        />
      ) : viewMode === 'calendar' ? (
        <PaymentCalendar payments={allPayments} />
      ) : data.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <CreditCard className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>Không có khoản thanh toán nào</p>
        </div>
      ) : (
        <div className="space-y-3">
          {data.map(p => (
            <PaymentCard key={p.id} p={p} onClick={() => goToDetail(p)} />
          ))}
          {/* Pagination */}
          <div className="flex items-center justify-between pt-4">
            <p className="text-sm text-muted-foreground">
              Hiển thị {data.length} / {totalItems} khoản
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline" size="sm"
                disabled={pagination.page <= 1}
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              >
                Trước
              </Button>
              <span className="text-sm text-muted-foreground">
                Trang {pagination.page} / {Math.ceil(totalItems / pagination.pageSize) || 1}
              </span>
              <Button
                variant="outline" size="sm"
                disabled={pagination.page >= Math.ceil(totalItems / pagination.pageSize)}
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              >
                Sau
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Chart Dialog */}
      <Dialog open={showChart} onOpenChange={setShowChart}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chi tiêu theo tháng</DialogTitle>
            <DialogDescription>Biểu đồ chi tiêu trong 12 tháng gần nhất</DialogDescription>
          </DialogHeader>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `${(v / 1000000).toFixed(0)}M`} />
              <RTooltip formatter={(v: number) => formatPrice(v)} />
              <Bar dataKey="chiTieu" name="Đã thanh toán" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="congNo" name="Công nợ" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowChart(false)}>Đóng</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upload proof dialog */}
      <Dialog open={!!showUpload} onOpenChange={() => setShowUpload(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Xác nhận chuyển khoản</DialogTitle>
            <DialogDescription>Tải lên chứng từ thanh toán để xác nhận giao dịch</DialogDescription>
          </DialogHeader>
          {showUpload && (
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-muted/30">
                <p className="text-xs text-muted-foreground">Hoá đơn</p>
                <p className="font-medium">{showUpload.invoiceNumber} · {showUpload.orderNumber}</p>
                <p className="text-muted-foreground text-sm">
                  Còn lại: <span className="text-red-600">{formatPrice(showUpload.remainingAmount)}</span>
                </p>
              </div>
              <div>
                <Label>URL chứng từ chuyển khoản *</Label>
                <Input
                  value={uploadUrl}
                  onChange={e => setUploadUrl(e.target.value)}
                  placeholder="https://link-anh-chung-tu.png"
                />
                <p className="text-xs text-muted-foreground mt-1">Dán link ảnh chụp chứng từ CK từ ngân hàng</p>
              </div>
              <div>
                <Label>Ghi chú</Label>
                <Textarea
                  value={uploadNote}
                  onChange={e => setUploadNote(e.target.value)}
                  placeholder="VD: Đã CK qua Vietcombank, mã GD: 123456..."
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUpload(null)}>Huỷ</Button>
            <Button onClick={handleUploadProof}>
              <Upload className="h-4 w-4 mr-1" /> Gửi xác nhận
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
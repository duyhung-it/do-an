// ============================================================
// Quản lý công nợ / thanh toán — Seller (Nhóm 18B: Nâng cao)
// 18B.01-08: Stats, biểu đồ, ghi nhận TT, thanh toán từng phần,
//            timeline, cảnh báo, export CSV, export theo kỳ
// ============================================================

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  DollarSign, Clock, CheckCircle2, AlertTriangle,
  Download, BarChart3, CalendarDays, Ban,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Progress } from '../ui/progress';
import { DataTable } from '../shared/DataTable';
import { FilterBar } from '../shared/FilterBar';
import { StatusBadge } from '../shared/StatusBadge';
import { AppBreadcrumb } from '../shared/AppBreadcrumb';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Separator } from '../ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip,
  ResponsiveContainer, Legend,
} from 'recharts';
import { paymentApi } from '../../services/api';
import { exportToCSV, exportWithDateRange } from '../../utils/exportUtils';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';
import type {
  Payment, PaginationParams, SortParams, ActiveFilter, FilterConfig, ColumnConfig,
} from '../../types';

const formatPrice = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

const columns: ColumnConfig[] = [
  { key: 'invoiceNumber', label: 'Hoá đơn', visible: true, sortable: true },
  { key: 'orderNumber', label: 'Đơn hàng', visible: true, sortable: true },
  { key: 'buyerName', label: 'Người mua', visible: true, sortable: true },
  { key: 'method', label: 'PT thanh toán', visible: true, sortable: true },
  { key: 'amountFormatted', label: 'Tổng', visible: true, sortable: false },
  { key: 'paidFormatted', label: 'Đã thu', visible: true, sortable: false },
  { key: 'remainFormatted', label: 'Còn lại', visible: true, sortable: false },
  { key: 'progressPct', label: '% thanh toán', visible: true, sortable: true },
  { key: 'dueDate', label: 'Hạn trả', visible: true, sortable: true },
  { key: 'status', label: 'Trạng thái', visible: true, sortable: true },
  { key: 'createdAt', label: 'Ngày tạo', visible: false, sortable: true },
];

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

interface PayRow extends Payment {
  amountFormatted: string;
  paidFormatted: string;
  remainFormatted: string;
  progressPct: number;
}

const today = new Date().toISOString().slice(0, 10);

function getDaysUntilDue(dueDate: string): number {
  const due = new Date(dueDate).getTime();
  const now = new Date(today).getTime();
  return Math.ceil((due - now) / (1000 * 60 * 60 * 24));
}

const exportColumns = [
  { key: 'invoiceNumber', label: 'Hoá đơn' },
  { key: 'orderNumber', label: 'Đơn hàng' },
  { key: 'buyerName', label: 'Người mua' },
  { key: 'method', label: 'PT thanh toán' },
  { key: 'amount', label: 'Tổng tiền' },
  { key: 'paidAmount', label: 'Đã thu' },
  { key: 'remainingAmount', label: 'Còn lại' },
  { key: 'dueDate', label: 'Hạn trả' },
  { key: 'status', label: 'Trạng thái' },
  { key: 'createdAt', label: 'Ngày tạo' },
];

export function SellerPaymentList() {
  const { user } = useAuth();
  const [data, setData] = useState<PayRow[]>([]);
  const [allPayments, setAllPayments] = useState<Payment[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationParams>({ page: 1, pageSize: 10 });
  const [sort, setSort] = useState<SortParams>({ field: 'dueDate', direction: 'asc' });
  const [filters, setFilters] = useState<ActiveFilter[]>([]);
  const [search, setSearch] = useState('');

  // Record transaction
  const [selected, setSelected] = useState<Payment | null>(null);
  const [txnAmount, setTxnAmount] = useState('');
  const [txnMethod, setTxnMethod] = useState('Chuyển khoản');
  const [txnRef, setTxnRef] = useState('');
  const [txnNote, setTxnNote] = useState('');
  const [txnBank, setTxnBank] = useState('');
  const [txnDate, setTxnDate] = useState(today);

  // 18B.02: Chart
  const [showChart, setShowChart] = useState(false);

  // 18B.08: Export theo kỳ
  const [showExportRange, setShowExportRange] = useState(false);
  const [exportFrom, setExportFrom] = useState('');
  const [exportTo, setExportTo] = useState('');

  const toRow = (p: Payment): PayRow => ({
    ...p,
    amountFormatted: formatPrice(p.amount),
    paidFormatted: formatPrice(p.paidAmount),
    remainFormatted: formatPrice(p.remainingAmount),
    progressPct: p.amount > 0 ? Math.round((p.paidAmount / p.amount) * 100) : 0,
  });

  const fetchData = useCallback(async () => {
    if (!user?.supplierId) return;
    setLoading(true);
    try {
      const all = await paymentApi.getBySeller(user.supplierId);
      setAllPayments(all);

      let filtered = [...all];
      if (search) {
        const s = search.toLowerCase();
        filtered = filtered.filter(p =>
          p.orderNumber.toLowerCase().includes(s) ||
          p.invoiceNumber.toLowerCase().includes(s) ||
          p.buyerName.toLowerCase().includes(s),
        );
      }
      if (filters.length > 0) {
        filtered = filtered.filter(p =>
          filters.every(f => String((p as unknown as Record<string, unknown>)[f.key]) === String(f.value)),
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
      setData(filtered.slice(start, start + pagination.pageSize).map(toRow));
    } finally {
      setLoading(false);
    }
  }, [user, pagination, sort, filters, search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // 18B.01: Stats nâng cao (thêm TB ngày thu)
  const stats = useMemo(() => {
    const totalReceivable = allPayments.reduce((s, p) => s + p.remainingAmount, 0);
    const overdue = allPayments.filter(p => p.status === 'Quá hạn').reduce((s, p) => s + p.remainingAmount, 0);
    const collected = allPayments.reduce((s, p) => s + p.paidAmount, 0);
    const pendingCount = allPayments.filter(p => p.status !== 'Đã thanh toán').length;

    // TB ngày thu (từ createdAt đến ngày TT cuối)
    const paidPayments = allPayments.filter(p => p.transactions.length > 0);
    let avgDays = 0;
    if (paidPayments.length > 0) {
      const totalDays = paidPayments.reduce((sum, p) => {
        const created = new Date(p.createdAt).getTime();
        const lastTxn = p.transactions[p.transactions.length - 1];
        const paid = new Date(lastTxn.paidAt).getTime();
        return sum + Math.max(0, Math.ceil((paid - created) / (1000 * 60 * 60 * 24)));
      }, 0);
      avgDays = Math.round(totalDays / paidPayments.length);
    }

    return { totalReceivable, overdue, collected, pendingCount, avgDays };
  }, [allPayments]);

  // 18B.02: Biểu đồ dòng tiền theo tháng
  const chartData = useMemo(() => {
    const map = new Map<string, { thu: number; congNo: number }>();
    for (const p of allPayments) {
      const month = p.createdAt.slice(0, 7);
      const cur = map.get(month) ?? { thu: 0, congNo: 0 };
      cur.thu += p.paidAmount;
      cur.congNo += p.remainingAmount;
      map.set(month, cur);
    }
    return Array.from(map.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([month, v]) => ({ month, thu: v.thu, congNo: v.congNo }));
  }, [allPayments]);

  // 18B.06: Cảnh báo payments
  const overduePayments = useMemo(() =>
    allPayments.filter(p => p.status === 'Quá hạn' || (p.remainingAmount > 0 && getDaysUntilDue(p.dueDate) < 0)),
    [allPayments],
  );
  const nearDuePayments = useMemo(() =>
    allPayments.filter(p => p.remainingAmount > 0 && getDaysUntilDue(p.dueDate) >= 0 && getDaysUntilDue(p.dueDate) <= 7),
    [allPayments],
  );

  const openRecordTxn = (p: Payment) => {
    setSelected(p);
    setTxnAmount(String(p.remainingAmount));
    setTxnMethod('Chuyển khoản');
    setTxnRef('');
    setTxnNote('');
    setTxnBank('');
    setTxnDate(today);
  };

  // 18B.03: Ghi nhận thanh toán chi tiết (thêm ngân hàng, ngày)
  const handleRecordTxn = async () => {
    if (!selected || !txnAmount || Number(txnAmount) <= 0) {
      toast.error('Vui lòng nhập số tiền hợp lệ');
      return;
    }
    try {
      await paymentApi.recordTransaction(selected.id, {
        paymentId: selected.id,
        amount: Number(txnAmount),
        method: txnMethod,
        transactionRef: txnRef || `TXN-${Date.now()}`,
        bankName: txnBank || undefined,
        note: txnNote || `Ghi nhận thanh toán ${selected.orderNumber}`,
        paidAt: txnDate,
      });
      toast.success('Đã ghi nhận thanh toán');
      setSelected(null);
      fetchData();
    } catch {
      toast.error('Có lỗi xảy ra');
    }
  };

  // 18B.07: Export CSV công nợ phải thu
  const handleExportCSV = () => {
    exportToCSV(allPayments as unknown as Record<string, unknown>[], exportColumns, 'cong-no-phai-thu');
    toast.success('Đã xuất CSV công nợ phải thu');
  };

  // 18B.08: Export theo kỳ
  const handleExportRange = () => {
    if (!exportFrom || !exportTo) {
      toast.error('Vui lòng chọn khoảng ngày');
      return;
    }
    exportWithDateRange(
      allPayments as unknown as Record<string, unknown>[],
      exportColumns,
      `cong-no-${exportFrom}-${exportTo}`,
      [exportFrom, exportTo],
      'createdAt',
    );
    toast.success('Đã xuất báo cáo công nợ theo kỳ');
    setShowExportRange(false);
  };

  // 18B.04: Render Grid Card with progress bar
  const renderGridCard = (p: PayRow) => {
    const daysLeft = getDaysUntilDue(p.dueDate);
    return (
      <Card key={p.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => openRecordTxn(p)}>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="font-medium">{p.invoiceNumber}</p>
            <StatusBadge status={p.status} />
          </div>
          <p className="text-muted-foreground">{p.orderNumber} · {p.buyerName}</p>

          {/* 18B.04: Thanh toán từng phần — progress bar */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Đã thu: {p.paidFormatted}</span>
              <span>{p.progressPct}%</span>
            </div>
            <Progress value={p.progressPct} />
            <p className="text-sm text-muted-foreground mt-1">Còn lại: {p.remainFormatted} / Tổng: {p.amountFormatted}</p>
          </div>

          {/* 18B.06: Cảnh báo */}
          {daysLeft < 0 && p.remainingAmount > 0 && (
            <Badge variant="destructive">Quá hạn {Math.abs(daysLeft)} ngày</Badge>
          )}
          {daysLeft >= 0 && daysLeft <= 7 && p.remainingAmount > 0 && (
            <Badge variant="outline" className="border-yellow-500 text-yellow-600">Sắp đến hạn ({daysLeft} ngày)</Badge>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <AppBreadcrumb items={[{ label: 'Kênh người bán', href: '/seller' }, { label: 'Công nợ' }]} />

      <div>
        <h1>Công nợ & Thanh toán</h1>
        <p className="text-muted-foreground">Quản lý các khoản phải thu từ người mua</p>
      </div>

      {/* 18B.06: Banner cảnh báo */}
      {overduePayments.length > 0 && (
        <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 rounded-lg p-3 flex items-center gap-3">
          <Ban className="h-5 w-5 text-red-500 shrink-0" />
          <div>
            <p className="font-medium text-red-700 dark:text-red-400">
              {overduePayments.length} khoản thanh toán quá hạn — Tổng: {formatPrice(overduePayments.reduce((s, p) => s + p.remainingAmount, 0))}
            </p>
          </div>
        </div>
      )}
      {nearDuePayments.length > 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 rounded-lg p-3 flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-yellow-500 shrink-0" />
          <div>
            <p className="font-medium text-yellow-700 dark:text-yellow-400">
              {nearDuePayments.length} khoản sắp đến hạn trong 7 ngày — Tổng: {formatPrice(nearDuePayments.reduce((s, p) => s + p.remainingAmount, 0))}
            </p>
          </div>
        </div>
      )}

      {/* 18B.01: Stats card nâng cao */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Phải thu', value: formatPrice(stats.totalReceivable), icon: DollarSign, color: 'text-blue-500' },
          { label: 'Quá hạn', value: formatPrice(stats.overdue), icon: AlertTriangle, color: 'text-red-500' },
          { label: 'Đã thu', value: formatPrice(stats.collected), icon: CheckCircle2, color: 'text-green-500' },
          { label: 'Đang chờ', value: String(stats.pendingCount), icon: Clock, color: 'text-yellow-500' },
          { label: 'TB ngày thu', value: `${stats.avgDays}d`, icon: CalendarDays, color: 'text-purple-500' },
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

      {/* Action buttons */}
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={() => setShowChart(true)}>
          <BarChart3 className="h-4 w-4 mr-1" /> Biểu đồ
        </Button>
        <Button variant="outline" size="sm" onClick={handleExportCSV}>
          <Download className="h-4 w-4 mr-1" /> Xuất CSV
        </Button>
        <Button variant="outline" size="sm" onClick={() => {
          setExportFrom('');
          setExportTo('');
          setShowExportRange(true);
        }}>
          <CalendarDays className="h-4 w-4 mr-1" /> Xuất theo kỳ
        </Button>
      </div>

      <FilterBar
        filters={filterConfigs}
        activeFilters={filters}
        onFilterChange={f => { setFilters(f); setPagination(p => ({ ...p, page: 1 })); }}
        searchValue={search}
        onSearchChange={v => { setSearch(v); setPagination(p => ({ ...p, page: 1 })); }}
        searchPlaceholder="Tìm mã đơn, hoá đơn, người mua..."
      />

      <DataTable<PayRow>
        data={data}
        columns={columns}
        totalItems={total}
        pagination={pagination}
        sort={sort}
        onPaginationChange={setPagination}
        onSortChange={setSort}
        onRowClick={openRecordTxn}
        getId={p => p.id}
        loading={loading}
        viewModes={['table', 'grid']}
        defaultViewMode="table"
        renderGridCard={renderGridCard}
        renderActions={p => (
          p.remainingAmount > 0 ? (
            <Button variant="ghost" size="sm" onClick={e => { e.stopPropagation(); openRecordTxn(p); }}>
              Ghi nhận TT
            </Button>
          ) : null
        )}
      />

      {/* 18B.03 + 18B.04 + 18B.05: Record transaction dialog */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle>Ghi nhận thanh toán</DialogTitle>
                <DialogDescription>{selected.invoiceNumber} · {selected.orderNumber}</DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {/* 18B.04: Thanh toán từng phần progress */}
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Tiến độ thanh toán</span>
                    <span>{selected.amount > 0 ? Math.round((selected.paidAmount / selected.amount) * 100) : 0}%</span>
                  </div>
                  <Progress value={selected.amount > 0 ? Math.round((selected.paidAmount / selected.amount) * 100) : 0} />
                </div>

                <div className="grid grid-cols-3 gap-3 bg-muted/30 p-3 rounded-md">
                  <div><p className="text-muted-foreground text-xs">Tổng</p><p className="font-medium">{formatPrice(selected.amount)}</p></div>
                  <div><p className="text-muted-foreground text-xs">Đã thu</p><p className="font-medium text-green-600">{formatPrice(selected.paidAmount)}</p></div>
                  <div><p className="text-muted-foreground text-xs">Còn lại</p><p className="font-medium text-red-600">{formatPrice(selected.remainingAmount)}</p></div>
                </div>

                {/* 18B.06: Cảnh báo trạng thái */}
                {(() => {
                  const daysLeft = getDaysUntilDue(selected.dueDate);
                  if (daysLeft < 0 && selected.remainingAmount > 0) {
                    return (
                      <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 rounded-md p-2 text-sm text-red-700 dark:text-red-400">
                        Quá hạn {Math.abs(daysLeft)} ngày — Hạn trả: {selected.dueDate}
                      </div>
                    );
                  }
                  if (daysLeft >= 0 && daysLeft <= 7 && selected.remainingAmount > 0) {
                    return (
                      <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 rounded-md p-2 text-sm text-yellow-700 dark:text-yellow-400">
                        Sắp đến hạn trong {daysLeft} ngày — Hạn trả: {selected.dueDate}
                      </div>
                    );
                  }
                  return null;
                })()}

                {/* 18B.05: Timeline lịch sử giao dịch */}
                {selected.transactions.length > 0 && (
                  <div>
                    <p className="text-muted-foreground mb-2">Lịch sử thanh toán ({selected.transactions.length})</p>
                    <div className="space-y-0 max-h-40 overflow-y-auto">
                      {[...selected.transactions].reverse().map((t, idx) => (
                        <div key={t.id} className="flex gap-3 pb-3 last:pb-0">
                          <div className="flex flex-col items-center">
                            <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${idx === 0 ? 'bg-green-500' : 'bg-muted-foreground/40'}`} />
                            {idx < selected.transactions.length - 1 && <div className="w-0.5 flex-1 bg-muted-foreground/20 mt-1" />}
                          </div>
                          <div className="flex-1 min-w-0 text-sm">
                            <div className="flex justify-between items-center">
                              <span className="font-medium">{formatPrice(t.amount)}</span>
                              <span className="text-muted-foreground">{t.paidAt}</span>
                            </div>
                            <p className="text-muted-foreground">{t.method}{t.bankName ? ` · ${t.bankName}` : ''} · {t.transactionRef}</p>
                            {t.note && <p className="text-muted-foreground">{t.note}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 18B.03: Form ghi nhận chi tiết */}
                {selected.remainingAmount > 0 && (
                  <>
                    <Separator />
                    <p className="font-medium">Ghi nhận khoản thu mới</p>
                    <div className="grid sm:grid-cols-2 gap-3">
                      <div>
                        <Label>Số tiền nhận *</Label>
                        <Input type="number" value={txnAmount} onChange={e => setTxnAmount(e.target.value)} />
                      </div>
                      <div>
                        <Label>Phương thức</Label>
                        <Select value={txnMethod} onValueChange={setTxnMethod}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Chuyển khoản">Chuyển khoản</SelectItem>
                            <SelectItem value="COD">COD</SelectItem>
                            <SelectItem value="L/C">L/C</SelectItem>
                            <SelectItem value="Tiền mặt">Tiền mặt</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-3">
                      <div>
                        <Label>Ngân hàng</Label>
                        <Input value={txnBank} onChange={e => setTxnBank(e.target.value)} placeholder="VD: Vietcombank" />
                      </div>
                      <div>
                        <Label>Ngày thanh toán</Label>
                        <Input type="date" value={txnDate} onChange={e => setTxnDate(e.target.value)} />
                      </div>
                    </div>
                    <div>
                      <Label>Mã giao dịch</Label>
                      <Input value={txnRef} onChange={e => setTxnRef(e.target.value)} placeholder="Mã chuyển khoản..." />
                    </div>
                    <div>
                      <Label>Ghi chú</Label>
                      <Input value={txnNote} onChange={e => setTxnNote(e.target.value)} placeholder="Ghi chú..." />
                    </div>
                  </>
                )}
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setSelected(null)}>Đóng</Button>
                {selected.remainingAmount > 0 && (
                  <Button onClick={handleRecordTxn}>Ghi nhận</Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* 18B.02: Biểu đồ dòng tiền theo tháng */}
      <Dialog open={showChart} onOpenChange={setShowChart}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Dòng tiền theo tháng</DialogTitle>
          </DialogHeader>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={true} horizontal={true} />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `${(v / 1000000).toFixed(0)}M`} />
              <RTooltip formatter={(v: number) => formatPrice(v)} />
              <Legend />
              <Bar key="bar-received" dataKey="thu" name="Đã thu" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar key="bar-debt" dataKey="congNo" name="Công nợ" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowChart(false)}>Đóng</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 18B.08: Export theo kỳ */}
      <Dialog open={showExportRange} onOpenChange={setShowExportRange}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Xuất báo cáo công nợ theo kỳ</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Từ ngày</Label>
              <Input type="date" value={exportFrom} onChange={e => setExportFrom(e.target.value)} />
            </div>
            <div>
              <Label>Đến ngày</Label>
              <Input type="date" value={exportTo} onChange={e => setExportTo(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExportRange(false)}>Huỷ</Button>
            <Button onClick={handleExportRange}>
              <Download className="h-4 w-4 mr-1" /> Xuất CSV
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
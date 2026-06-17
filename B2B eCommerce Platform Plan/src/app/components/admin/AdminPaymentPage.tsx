// ============================================================
// Quản lý thanh toán Admin — Giám sát toàn bộ
// Stats, Filter, DataTable, Chi tiết, Ghi nhận thanh toán
// ============================================================

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router';
import {
  DollarSign, AlertTriangle, CheckCircle2, Clock, Download,
  Receipt, CreditCard, TrendingDown, ReceiptText, RotateCcw,
} from 'lucide-react';
import { DataTable } from '../shared/DataTable';
import { FilterBar } from '../shared/FilterBar';
import { StatusBadge } from '../shared/StatusBadge';
import { AppBreadcrumb } from '../shared/AppBreadcrumb';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Separator } from '../ui/separator';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { adminPaymentApi } from '../../services/adminBackendApi';
import { toast } from 'sonner';
import type {
  Payment, PaymentStatus, PaginationParams, SortParams,
  ActiveFilter, FilterConfig, ColumnConfig,
} from '../../types';

const formatPrice = (price: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

const formatCompact = (price: number) =>
  new Intl.NumberFormat('vi-VN', { notation: 'compact' }).format(price);

const PAYMENT_STATUS_OPTIONS = ['UNPAID', 'PAID', 'OVERDUE', 'FAILED', 'REFUNDED', 'PARTIALLY_REFUNDED'];
const PAYMENT_METHOD_OPTIONS = ['CASH', 'BANK_TRANSFER', 'MOMO', 'VNPAY', 'COD'];
const PAYMENT_STATUS_LABELS: Record<string, string> = {
  UNPAID: 'Chưa thanh toán',
  PAID: 'Đã thanh toán',
  OVERDUE: 'Quá hạn',
  FAILED: 'Thất bại',
  REFUNDED: 'Đã hoàn tiền',
  PARTIALLY_REFUNDED: 'Hoàn một phần',
};
const PAYMENT_METHOD_LABELS: Record<string, string> = {
  CASH: 'Tiền mặt',
  BANK_TRANSFER: 'Chuyển khoản',
  MOMO: 'MOMO',
  VNPAY: 'VNPAY',
  COD: 'COD',
};

// --- Cấu hình cột ---
const columns: ColumnConfig[] = [
  { key: 'invoiceNumber', label: 'Hoá đơn', visible: true, sortable: true },
  { key: 'orderNumber', label: 'Đơn hàng', visible: true, sortable: true },
  { key: 'buyerName', label: 'Người mua', visible: true, sortable: true },
  { key: 'supplierName', label: 'Cửa hàng', visible: true, sortable: true },
  { key: 'amount', label: 'Tổng tiền', visible: true, sortable: true },
  { key: 'paidAmount', label: 'Đã TT', visible: true, sortable: true },
  { key: 'remainingAmount', label: 'Còn lại', visible: true, sortable: true },
  { key: 'method', label: 'Phương thức', visible: true, sortable: false },
  { key: 'status', label: 'Trạng thái', visible: true, sortable: true, editable: false },
  { key: 'dueDate', label: 'Hạn TT', visible: true, sortable: true },
  { key: 'createdAt', label: 'Ngày tạo', visible: true, sortable: true },
];

// --- Cấu hình bộ lọc ---
const filterConfigs: FilterConfig[] = [
  { key: 'status', label: 'Trạng thái', type: 'select', options: PAYMENT_STATUS_OPTIONS.map(status => ({ label: PAYMENT_STATUS_LABELS[status], value: status })) },
  { key: 'method', label: 'Phương thức', type: 'select', options: PAYMENT_METHOD_OPTIONS.map(method => ({ label: PAYMENT_METHOD_LABELS[method], value: method })) },
];

// --- Form ghi nhận thanh toán ---
interface TxnForm {
  amount: string;
  method: string;
  transactionRef: string;
  bankName: string;
  note: string;
}
const emptyTxnForm: TxnForm = { amount: '', method: 'BANK_TRANSFER', transactionRef: '', bankName: '', note: '' };

interface RefundForm {
  amount: string;
  method: string;
  reason: string;
}
const emptyRefundForm: RefundForm = { amount: '', method: 'BANK_TRANSFER', reason: '' };

type AdminPayment = Payment & {
  invoiceNumber?: string;
  buyerName?: string;
  supplierName?: string;
  paidAmount?: number;
  transactions?: Array<{
    id: string;
    amount: number;
    method: string;
    transactionRef: string;
    paidAt?: string;
    bankName?: string;
    note?: string;
  }>;
  refundAmount?: number | null;
  refundReason?: string | null;
  refundMethod?: string | null;
  refundedAt?: string | null;
  createdAt?: string;
};

const canMarkOverdue = (payment: AdminPayment) =>
  !['PAID', 'REFUNDED', 'PARTIALLY_REFUNDED'].includes(String(payment.status));

const getRefundedAmount = (payment: AdminPayment) =>
  Number(payment.refundAmount ?? 0);

const getRefundableAmount = (payment: AdminPayment) =>
  Math.max(Number(payment.paidAmount ?? 0) - getRefundedAmount(payment), 0);

const canRefund = (payment: AdminPayment) =>
  ['PAID', 'PARTIALLY_REFUNDED'].includes(String(payment.status)) && getRefundableAmount(payment) > 0;

export function AdminPaymentPage() {
  const [searchParams] = useSearchParams();
  const [payments, setPayments] = useState<AdminPayment[]>([]);
  const [allPayments, setAllPayments] = useState<AdminPayment[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationParams>({ page: 1, pageSize: 10 });
  const [sort, setSort] = useState<SortParams>({ field: 'createdAt', direction: 'desc' });
  const [filters, setFilters] = useState<ActiveFilter[]>([]);
  const [search, setSearch] = useState(searchParams.get('search') ?? '');
  const [selectedPayment, setSelectedPayment] = useState<AdminPayment | null>(null);
  const [showTxnForm, setShowTxnForm] = useState(false);
  const [txnForm, setTxnForm] = useState<TxnForm>(emptyTxnForm);
  const [refundDialog, setRefundDialog] = useState<AdminPayment | null>(null);
  const [refundForm, setRefundForm] = useState<RefundForm>(emptyRefundForm);
  const [savingAction, setSavingAction] = useState(false);

  const syncPayment = (updated: AdminPayment) => {
    setSelectedPayment(current => current?.id === updated.id ? updated : current);
    setRefundDialog(current => current?.id === updated.id ? updated : current);
    setPayments(prev => prev.map(payment => payment.id === updated.id ? updated : payment));
    setAllPayments(prev => prev.map(payment => payment.id === updated.id ? updated : payment));
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [allRes, pageRes] = await Promise.all([
        adminPaymentApi.getPaginated({ page: 1, pageSize: 1000 }, undefined, undefined, search || undefined),
        adminPaymentApi.getPaginated(pagination, sort.field ? sort : undefined, filters, search || undefined),
      ]);
      setAllPayments(allRes.data as AdminPayment[]);

      let data = pageRes.data as AdminPayment[];
      let t = pageRes.total;
      if (search) {
        const s = search.toLowerCase();
        const filtered = (allRes.data as AdminPayment[]).filter(p =>
          String(p.invoiceNumber ?? '').toLowerCase().includes(s) ||
          p.orderNumber.toLowerCase().includes(s) ||
          String(p.buyerName ?? '').toLowerCase().includes(s) ||
          String(p.supplierName ?? '').toLowerCase().includes(s),
        );
        const activeFilterData = filters.length > 0
          ? filtered.filter(p => filters.every(f => {
              const val = (p as unknown as Record<string, unknown>)[f.key];
              return String(val) === String(f.value);
            }))
          : filtered;
        t = activeFilterData.length;
        const start = (pagination.page - 1) * pagination.pageSize;
        data = activeFilterData.slice(start, start + pagination.pageSize);
      }
      setPayments(data);
      setTotal(t);
    } finally {
      setLoading(false);
    }
  }, [pagination, sort, filters, search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // --- Stats ---
  const stats = useMemo(() => {
    const totalAmount = allPayments.reduce((s, p) => s + p.amount, 0);
    const totalPaid = allPayments.reduce((s, p) => s + p.paidAmount, 0);
    const totalRemaining = allPayments.reduce((s, p) => s + p.remainingAmount, 0);
    const overdueCount = allPayments.filter(p => p.status === 'OVERDUE').length;
    const overdueAmount = allPayments
      .filter(p => p.status === 'OVERDUE')
      .reduce((s, p) => s + p.remainingAmount, 0);
    const pendingCount = allPayments.filter(p => p.status === 'UNPAID').length;
    const paidCount = allPayments.filter(p => p.status === 'PAID').length;
    return { totalAmount, totalPaid, totalRemaining, overdueCount, overdueAmount, pendingCount, paidCount };
  }, [allPayments]);

  // --- Ghi nhận thanh toán ---
  const handleRecordTransaction = async () => {
    if (!selectedPayment || !txnForm.amount || !txnForm.transactionRef) {
      toast.error('Vui lòng điền đầy đủ số tiền và mã giao dịch');
      return;
    }
    const amount = Number(txnForm.amount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Số tiền không hợp lệ');
      return;
    }
    if (amount > selectedPayment.remainingAmount) {
      toast.error('Số tiền vượt quá khoản còn lại');
      return;
    }

    try {
      const updated = await adminPaymentApi.recordTransaction(selectedPayment.id, {
        amount,
        method: txnForm.method,
        transactionRef: txnForm.transactionRef,
      });
      syncPayment(updated as AdminPayment);
      setShowTxnForm(false);
      setTxnForm(emptyTxnForm);
      toast.success('Đã ghi nhận thanh toán thành công');
    } catch {
      toast.error('Ghi nhận thất bại');
    }
  };

  const handleMarkOverdue = async (payment: AdminPayment) => {
    if (!canMarkOverdue(payment)) {
      toast.error('Chỉ có thể đánh dấu quá hạn với khoản chưa thanh toán');
      return;
    }
    if (!confirm(`Đánh dấu quá hạn cho thanh toán ${payment.orderNumber}?`)) return;
    setSavingAction(true);
    try {
      const updated = await adminPaymentApi.markOverdue(payment.id);
      syncPayment(updated as AdminPayment);
      await fetchData();
      toast.success('Đã đánh dấu quá hạn');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Không thể đánh dấu quá hạn');
    } finally {
      setSavingAction(false);
    }
  };

  const handleRefund = async () => {
    if (!refundDialog || !refundForm.amount || !refundForm.reason.trim()) {
      toast.error('Vui lòng nhập số tiền và lý do hoàn tiền');
      return;
    }
    const amount = Number(refundForm.amount);
    const refundableAmount = getRefundableAmount(refundDialog);
    if (!canRefund(refundDialog)) {
      toast.error('Khoản thanh toán này không còn số tiền có thể hoàn');
      return;
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      toast.error('Số tiền hoàn không hợp lệ');
      return;
    }
    if (amount > refundableAmount) {
      toast.error('Số tiền hoàn vượt quá số tiền còn có thể hoàn');
      return;
    }
    setSavingAction(true);
    try {
      const updated = await adminPaymentApi.refund(refundDialog.id, {
        refundAmount: amount,
        reason: refundForm.reason,
        method: refundForm.method,
      });
      syncPayment(updated as AdminPayment);
      setRefundDialog(null);
      setRefundForm(emptyRefundForm);
      await fetchData();
      toast.success('Đã ghi nhận hoàn tiền');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Hoàn tiền thất bại');
    } finally {
      setSavingAction(false);
    }
  };

  // --- Export CSV ---
  const handleExportCSV = () => {
    const headers = ['Hoá đơn', 'Đơn hàng', 'Người mua', 'Cửa hàng', 'Tổng tiền', 'Đã TT', 'Còn lại', 'Phương thức', 'Trạng thái', 'Hạn TT', 'Ngày tạo'];
    const rows = allPayments.map(p => [
      p.invoiceNumber, p.orderNumber, p.buyerName, p.supplierName,
      p.amount.toString(), p.paidAmount.toString(), p.remainingAmount.toString(),
      p.method, p.status, p.dueDate, p.createdAt,
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `thanh-toan-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Đã xuất file CSV');
  };

  // --- List view ---
  const openRefundDialog = (payment: AdminPayment) => {
    setRefundDialog(payment);
    setRefundForm({
      ...emptyRefundForm,
      amount: String(getRefundableAmount(payment)),
    });
  };

  const renderListItem = (payment: AdminPayment) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <ReceiptText className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{payment.invoiceNumber ?? '-'}</span>
          </div>
          <StatusBadge status={payment.status} />
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-muted-foreground">
          <span>Đơn: {payment.orderNumber}</span>
          <span>{payment.buyerName ?? '-'}</span>
          <span>{payment.method}</span>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
          <span>Tổng: <span className="text-primary">{formatPrice(payment.amount)}</span></span>
          <span>Đã TT: <span className="text-green-600">{formatPrice(payment.paidAmount)}</span></span>
          {payment.remainingAmount > 0 && (
            <span>Còn: <span className="text-red-600">{formatPrice(payment.remainingAmount)}</span></span>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-4">
      <AppBreadcrumb items={[{ label: 'Quản trị', href: '/admin' }, { label: 'Thanh toán' }]} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1>Quản lý thanh toán</h1>
          <p className="text-muted-foreground">Giám sát toàn bộ khoản thanh toán trên hệ thống</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleExportCSV}>
          <Download className="mr-1 h-4 w-4" /> Xuất CSV
        </Button>
      </div>

      {/* --- Stats --- */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-muted-foreground">Tổng cần thu</span>
              <DollarSign className="h-4 w-4 text-blue-500" />
            </div>
            <p className="text-xl">{formatCompact(stats.totalAmount)} ₫</p>
            <p className="text-muted-foreground mt-0.5">{allPayments.length} khoản</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-muted-foreground">Đã thu</span>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </div>
            <p className="text-xl text-green-600">{formatCompact(stats.totalPaid)} ₫</p>
            <p className="text-muted-foreground mt-0.5">{stats.paidCount} đã thanh toán</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-muted-foreground">Chưa thu</span>
              <Clock className="h-4 w-4 text-yellow-500" />
            </div>
            <p className="text-xl text-yellow-600">{formatCompact(stats.totalRemaining)} ₫</p>
            <p className="text-muted-foreground mt-0.5">{stats.pendingCount} chờ thanh toán</p>
          </CardContent>
        </Card>
        <Card className={stats.overdueCount > 0 ? 'border-red-200' : ''}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-muted-foreground">Quá hạn</span>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </div>
            <p className="text-xl text-red-600">{formatCompact(stats.overdueAmount)} ₫</p>
            <p className="text-muted-foreground mt-0.5">{stats.overdueCount} khoản quá hạn</p>
          </CardContent>
        </Card>
      </div>

      {/* --- Filter + Table --- */}
      <FilterBar
        filters={filterConfigs}
        activeFilters={filters}
        onFilterChange={f => { setFilters(f); setPagination(p => ({ ...p, page: 1 })); }}
        searchValue={search}
        onSearchChange={v => { setSearch(v); setPagination(p => ({ ...p, page: 1 })); }}
        searchPlaceholder="Tìm hoá đơn, đơn hàng, người mua, cửa hàng..."
      />

      <DataTable
        data={payments}
        columns={columns}
        totalItems={total}
        pagination={pagination}
        sort={sort}
        onPaginationChange={setPagination}
        onSortChange={setSort}
        onRowClick={p => { setSelectedPayment(p); setShowTxnForm(false); setTxnForm(emptyTxnForm); }}
        getId={p => p.id}
        renderListItem={renderListItem}
        loading={loading}
        viewModes={['table', 'list']}
        renderActions={(payment: AdminPayment) => (
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={(event) => { event.stopPropagation(); setSelectedPayment(payment); }} title="Xem chi tiết">
              <Receipt className="h-3.5 w-3.5" />
            </Button>
            {canMarkOverdue(payment) && (
              <Button variant="ghost" size="sm" disabled={savingAction} onClick={(event) => { event.stopPropagation(); handleMarkOverdue(payment); }} title="Đánh dấu quá hạn">
                <AlertTriangle className="h-3.5 w-3.5 text-red-600" />
              </Button>
            )}
            {canRefund(payment) && (
              <Button variant="ghost" size="sm" disabled={savingAction} onClick={(event) => { event.stopPropagation(); openRefundDialog(payment); }} title="Hoàn tiền">
                <RotateCcw className="h-3.5 w-3.5 text-orange-600" />
              </Button>
            )}
          </div>
        )}
      />

      {/* --- Chi tiết thanh toán --- */}
      <Dialog open={!!selectedPayment} onOpenChange={() => setSelectedPayment(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Thanh toán {selectedPayment?.invoiceNumber}
            </DialogTitle>
          </DialogHeader>
          {selectedPayment && (
            <div className="space-y-4">
              {/* Tóm tắt */}
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Trạng thái</span>
                <StatusBadge status={selectedPayment.status} />
              </div>

              <div className="flex flex-wrap justify-end gap-2">
                {canMarkOverdue(selectedPayment) && (
                  <Button size="sm" variant="outline" disabled={savingAction} onClick={() => handleMarkOverdue(selectedPayment)}>
                    <AlertTriangle className="mr-1 h-3.5 w-3.5" />
                    Đánh dấu quá hạn
                  </Button>
                )}
                {canRefund(selectedPayment) && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-orange-600"
                    disabled={savingAction}
                    onClick={() => openRefundDialog(selectedPayment)}
                  >
                    <RotateCcw className="mr-1 h-3.5 w-3.5" />
                    Hoàn tiền
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-3 rounded-lg bg-blue-50">
                  <p className="text-muted-foreground">Tổng tiền</p>
                  <p className="text-primary">{formatPrice(selectedPayment.amount)}</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-green-50">
                  <p className="text-muted-foreground">Đã thu</p>
                  <p className="text-green-600">{formatPrice(selectedPayment.paidAmount)}</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-red-50">
                  <p className="text-muted-foreground">Còn lại</p>
                  <p className="text-red-600">{formatPrice(selectedPayment.remainingAmount)}</p>
                </div>
              </div>

              <Separator />

              {/* Thông tin chung */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-muted-foreground">Đơn hàng</p>
                  <p className="font-medium">{selectedPayment.orderNumber}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Phương thức</p>
                  <p>{selectedPayment.method}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Người mua</p>
                  <p>{selectedPayment.buyerName}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Cửa hàng</p>
                  <p>{selectedPayment.supplierName}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Hạn thanh toán</p>
                  <p className={selectedPayment.status === 'OVERDUE' ? 'text-red-600' : ''}>
                    {selectedPayment.dueDate}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Ngày tạo</p>
                  <p>{selectedPayment.createdAt}</p>
                </div>
              </div>

              <Separator />

              {/* Lịch sử giao dịch */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="font-medium">Lịch sử giao dịch ({selectedPayment.transactions?.length ?? 0})</p>
                  {selectedPayment.remainingAmount > 0 && (
                    <Button size="sm" variant="outline" onClick={() => setShowTxnForm(!showTxnForm)}>
                      <CreditCard className="mr-1 h-3.5 w-3.5" />
                      {showTxnForm ? 'Huỷ' : 'Ghi nhận TT'}
                    </Button>
                  )}
                </div>

                {/* Form ghi nhận thanh toán */}
                {showTxnForm && (
                  <Card className="mb-3">
                    <CardContent className="p-4 space-y-3">
                      <p className="font-medium flex items-center gap-1">
                        <TrendingDown className="h-4 w-4" /> Ghi nhận thanh toán
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label>Số tiền *</Label>
                          <Input
                            type="number"
                            placeholder={`Tối đa ${formatPrice(selectedPayment.remainingAmount)}`}
                            value={txnForm.amount}
                            onChange={e => setTxnForm(f => ({ ...f, amount: e.target.value }))}
                          />
                        </div>
                        <div>
                          <Label>Phương thức *</Label>
                          <Select value={txnForm.method} onValueChange={v => setTxnForm(f => ({ ...f, method: v }))}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="BANK_TRANSFER">BANK_TRANSFER</SelectItem>
                              <SelectItem value="COD">COD</SelectItem>
                              <SelectItem value="CASH">CASH</SelectItem>
                              <SelectItem value="MOMO">MOMO</SelectItem>
                              <SelectItem value="VNPAY">VNPAY</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Mã giao dịch *</Label>
                          <Input
                            placeholder="VD: VCB-20250314-001"
                            value={txnForm.transactionRef}
                            onChange={e => setTxnForm(f => ({ ...f, transactionRef: e.target.value }))}
                          />
                        </div>
                        <div>
                          <Label>Ngân hàng</Label>
                          <Input
                            placeholder="VD: Vietcombank"
                            value={txnForm.bankName}
                            onChange={e => setTxnForm(f => ({ ...f, bankName: e.target.value }))}
                          />
                        </div>
                      </div>
                      <div>
                        <Label>Ghi chú</Label>
                        <Textarea
                          rows={2}
                          value={txnForm.note}
                          onChange={e => setTxnForm(f => ({ ...f, note: e.target.value }))}
                          placeholder="Ghi chú thêm..."
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => { setShowTxnForm(false); setTxnForm(emptyTxnForm); }}>
                          Huỷ
                        </Button>
                        <Button size="sm" onClick={handleRecordTransaction}>
                          <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Xác nhận
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Danh sách giao dịch */}
                {(selectedPayment.transactions?.length ?? 0) === 0 ? (
                  <p className="text-muted-foreground text-center py-4">Chưa có giao dịch nào</p>
                ) : (
                  <div className="space-y-2">
                    {selectedPayment.transactions?.map(txn => (
                      <Card key={txn.id}>
                        <CardContent className="p-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-green-600">+{formatPrice(txn.amount)}</span>
                            <span className="text-muted-foreground">{txn.paidAt}</span>
                          </div>
                          <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-muted-foreground">
                            <span>{txn.method}</span>
                            <span>Ref: {txn.transactionRef}</span>
                            {txn.bankName && <span>{txn.bankName}</span>}
                          </div>
                          {txn.note && <p className="mt-1 text-muted-foreground">{txn.note}</p>}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              {Number(selectedPayment.refundAmount ?? 0) > 0 && (
                <Card>
                  <CardContent className="p-3">
                    <p className="font-medium text-orange-700">Hoàn tiền</p>
                    <div className="mt-2 grid grid-cols-2 gap-3 text-sm">
                      <div><p className="text-muted-foreground">Đã hoàn</p><p>{formatPrice(getRefundedAmount(selectedPayment))}</p></div>
                      <div><p className="text-muted-foreground">Còn có thể hoàn</p><p>{formatPrice(getRefundableAmount(selectedPayment))}</p></div>
                      <div><p className="text-muted-foreground">Phương thức</p><p>{selectedPayment.refundMethod ?? '-'}</p></div>
                      <div><p className="text-muted-foreground">Thời gian hoàn</p><p>{selectedPayment.refundedAt ?? '-'}</p></div>
                      <div><p className="text-muted-foreground">Lý do</p><p>{selectedPayment.refundReason ?? '-'}</p></div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!refundDialog} onOpenChange={() => { setRefundDialog(null); setRefundForm(emptyRefundForm); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-orange-600">
              <RotateCcw className="h-5 w-5" />
              Hoàn tiền thanh toán
            </DialogTitle>
          </DialogHeader>
          {refundDialog && (
            <div className="space-y-3">
              <div className="rounded-md bg-orange-50 p-3 text-orange-800">
                <div>{refundDialog.orderNumber} - đã thu {formatPrice(Number(refundDialog.paidAmount ?? 0))}</div>
                <div>Đã hoàn {formatPrice(getRefundedAmount(refundDialog))} - còn có thể hoàn {formatPrice(getRefundableAmount(refundDialog))}</div>
              </div>
              <div className="grid gap-2">
                <Label>Số tiền hoàn *</Label>
                <Input
                  type="number"
                  min={1}
                  max={getRefundableAmount(refundDialog)}
                  value={refundForm.amount}
                  onChange={event => setRefundForm(current => ({ ...current, amount: event.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label>Phương thức *</Label>
                <Select value={refundForm.method} onValueChange={value => setRefundForm(current => ({ ...current, method: value }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BANK_TRANSFER">BANK_TRANSFER</SelectItem>
                    <SelectItem value="MOMO">MOMO</SelectItem>
                    <SelectItem value="VNPAY">VNPAY</SelectItem>
                    <SelectItem value="CASH">CASH</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Lý do *</Label>
                <Textarea
                  rows={3}
                  value={refundForm.reason}
                  onChange={event => setRefundForm(current => ({ ...current, reason: event.target.value }))}
                  placeholder="Ví dụ: Khách hủy đơn sau khi đã thanh toán"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => { setRefundDialog(null); setRefundForm(emptyRefundForm); }}>
                  Hủy
                </Button>
                <Button className="bg-orange-600 hover:bg-orange-700" onClick={handleRefund} disabled={savingAction}>
                  {savingAction ? 'Đang xử lý...' : 'Xác nhận hoàn tiền'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

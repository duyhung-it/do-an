// ============================================================
// Quản lý công nợ & thanh toán Admin — Giám sát toàn bộ
// Stats, Filter, DataTable, Chi tiết, Ghi nhận thanh toán
// ============================================================

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  DollarSign, AlertTriangle, CheckCircle2, Clock, Download,
  Receipt, CreditCard, TrendingDown, ReceiptText,
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
import { paymentApi } from '../../services/api';
import { toast } from 'sonner';
import type {
  Payment, PaymentStatus, PaginationParams, SortParams,
  ActiveFilter, FilterConfig, ColumnConfig,
} from '../../types';

const formatPrice = (price: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

const formatCompact = (price: number) =>
  new Intl.NumberFormat('vi-VN', { notation: 'compact' }).format(price);

// --- Cấu hình cột ---
const columns: ColumnConfig[] = [
  { key: 'invoiceNumber', label: 'Hoá đơn', visible: true, sortable: true },
  { key: 'orderNumber', label: 'Đơn hàng', visible: true, sortable: true },
  { key: 'buyerName', label: 'Người mua', visible: true, sortable: true },
  { key: 'supplierName', label: 'NCC', visible: true, sortable: true },
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
  { key: 'status', label: 'Trạng thái', type: 'select', options: [
    { label: 'Chờ thanh toán', value: 'Chờ thanh toán' },
    { label: 'Đã TT một phần', value: 'Đã thanh toán một phần' },
    { label: 'Đã thanh toán', value: 'Đã thanh toán' },
    { label: 'Quá hạn', value: 'Quá hạn' },
    { label: 'Hoàn tiền', value: 'Hoàn tiền' },
  ]},
  { key: 'method', label: 'Phương thức', type: 'select', options: [
    { label: 'Chuyển khoản', value: 'Chuyển khoản' },
    { label: 'COD', value: 'COD' },
    { label: 'L/C', value: 'L/C' },
    { label: 'Trả chậm 30 ngày', value: 'Trả chậm 30 ngày' },
    { label: 'Trả chậm 60 ngày', value: 'Trả chậm 60 ngày' },
    { label: 'Trả chậm 90 ngày', value: 'Trả chậm 90 ngày' },
  ]},
];

// --- Form ghi nhận thanh toán ---
interface TxnForm {
  amount: string;
  method: string;
  transactionRef: string;
  bankName: string;
  note: string;
}
const emptyTxnForm: TxnForm = { amount: '', method: 'Chuyển khoản', transactionRef: '', bankName: '', note: '' };

export function AdminPaymentPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [allPayments, setAllPayments] = useState<Payment[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationParams>({ page: 1, pageSize: 10 });
  const [sort, setSort] = useState<SortParams>({ field: 'createdAt', direction: 'desc' });
  const [filters, setFilters] = useState<ActiveFilter[]>([]);
  const [search, setSearch] = useState('');
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showTxnForm, setShowTxnForm] = useState(false);
  const [txnForm, setTxnForm] = useState<TxnForm>(emptyTxnForm);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [allRes, pageRes] = await Promise.all([
        paymentApi.getPaginated({ page: 1, pageSize: 1000 }),
        paymentApi.getPaginated(pagination, sort.field ? sort : undefined, filters),
      ]);
      setAllPayments(allRes.data);

      let data = pageRes.data;
      let t = pageRes.total;
      if (search) {
        const s = search.toLowerCase();
        const filtered = allRes.data.filter(p =>
          p.invoiceNumber.toLowerCase().includes(s) ||
          p.orderNumber.toLowerCase().includes(s) ||
          p.buyerName.toLowerCase().includes(s) ||
          p.supplierName.toLowerCase().includes(s),
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
    const overdueCount = allPayments.filter(p => p.status === 'Quá hạn').length;
    const overdueAmount = allPayments
      .filter(p => p.status === 'Quá hạn')
      .reduce((s, p) => s + p.remainingAmount, 0);
    const pendingCount = allPayments.filter(p => p.status === 'Chờ thanh toán').length;
    const paidCount = allPayments.filter(p => p.status === 'Đã thanh toán').length;
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
      toast.error('Số tiền vượt quá công nợ còn lại');
      return;
    }

    try {
      const updated = await paymentApi.recordTransaction(selectedPayment.id, {
        paymentId: selectedPayment.id,
        amount,
        method: txnForm.method,
        transactionRef: txnForm.transactionRef,
        bankName: txnForm.bankName || undefined,
        note: txnForm.note,
        paidAt: new Date().toISOString().slice(0, 10),
      });
      setSelectedPayment(updated);
      setPayments(prev => prev.map(p => p.id === updated.id ? updated : p));
      setAllPayments(prev => prev.map(p => p.id === updated.id ? updated : p));
      setShowTxnForm(false);
      setTxnForm(emptyTxnForm);
      toast.success('Đã ghi nhận thanh toán thành công');
    } catch {
      toast.error('Ghi nhận thất bại');
    }
  };

  // --- Export CSV ---
  const handleExportCSV = () => {
    const headers = ['Hoá đơn', 'Đơn hàng', 'Người mua', 'NCC', 'Tổng tiền', 'Đã TT', 'Còn lại', 'Phương thức', 'Trạng thái', 'Hạn TT', 'Ngày tạo'];
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
    a.download = `cong-no-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Đã xuất file CSV');
  };

  // --- List view ---
  const renderListItem = (payment: Payment) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <ReceiptText className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{payment.invoiceNumber}</span>
          </div>
          <StatusBadge status={payment.status} />
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-muted-foreground">
          <span>Đơn: {payment.orderNumber}</span>
          <span>{payment.buyerName}</span>
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
      <AppBreadcrumb items={[{ label: 'Quản trị', href: '/admin' }, { label: 'Công nợ & Thanh toán' }]} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1>Quản lý công nợ & thanh toán</h1>
          <p className="text-muted-foreground">Giám sát toàn bộ công nợ trên hệ thống</p>
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
              <span className="text-muted-foreground">Tổng công nợ</span>
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
        searchPlaceholder="Tìm hoá đơn, đơn hàng, người mua, NCC..."
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
      />

      {/* --- Chi tiết công nợ --- */}
      <Dialog open={!!selectedPayment} onOpenChange={() => setSelectedPayment(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Công nợ {selectedPayment?.invoiceNumber}
            </DialogTitle>
          </DialogHeader>
          {selectedPayment && (
            <div className="space-y-4">
              {/* Tóm tắt */}
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Trạng thái</span>
                <StatusBadge status={selectedPayment.status} />
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
                  <p className="text-muted-foreground">Nhà cung cấp</p>
                  <p>{selectedPayment.supplierName}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Hạn thanh toán</p>
                  <p className={selectedPayment.status === 'Quá hạn' ? 'text-red-600' : ''}>
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
                  <p className="font-medium">Lịch sử giao dịch ({selectedPayment.transactions.length})</p>
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
                              <SelectItem value="Chuyển khoản">Chuyển khoản</SelectItem>
                              <SelectItem value="COD">COD</SelectItem>
                              <SelectItem value="L/C">L/C</SelectItem>
                              <SelectItem value="Tiền mặt">Tiền mặt</SelectItem>
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
                {selectedPayment.transactions.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">Chưa có giao dịch nào</p>
                ) : (
                  <div className="space-y-2">
                    {selectedPayment.transactions.map(txn => (
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
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

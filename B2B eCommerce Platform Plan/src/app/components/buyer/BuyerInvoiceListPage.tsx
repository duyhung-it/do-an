// ============================================================
// Danh sách hoá đơn — Buyer (P2 Đợt 4: P2.11–P2.14, P2.19)
// Summary bar, overdue highlight, status tabs, print preview,
// bulk payment
// ============================================================

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router';
import {
  FileText, Eye, Printer, TrendingUp, TrendingDown, ReceiptText,
  AlertTriangle, CheckCircle2, Clock, DollarSign, CreditCard,
  XCircle, Download, RefreshCw,
} from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Label } from '../ui/label';
import { Separator } from '../ui/separator';
import { Skeleton } from '../ui/skeleton';
import { Checkbox } from '../ui/checkbox';
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
  DialogDescription,
} from '../ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '../ui/alert-dialog';
import { DataTable } from '../shared/DataTable';
import { FilterBar } from '../shared/FilterBar';
import { StatusBadge } from '../shared/StatusBadge';
import { StatsCard } from '../shared/StatsCard';
import { IconWrapper } from '../shared/IconWrapper';
import { AnimatedNumber } from '../shared/AnimatedNumber';
import { AppBreadcrumb } from '../shared/AppBreadcrumb';
import { invoiceBuyerApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';
import type {
  Invoice, PaginationParams, SortParams,
  ActiveFilter, FilterConfig, ColumnConfig,
} from '../../types';

type DebitCreditNote = { id: string; amount: number; status: string; type: string };

const formatPrice = (price: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(price);

const getInvoiceStoreName = (invoice: Pick<Invoice, 'supplierName'>) => invoice.supplierName || 'CELLPHONES';
const getInvoiceStoreCompany = (invoice: Pick<Invoice, 'supplierCompany'>) => invoice.supplierCompany || 'CELLPHONES';
const getInvoiceBuyerName = (invoice: Pick<Invoice, 'buyerCompany'>) => invoice.buyerCompany || 'Khách hàng';

const fmtShort = (v: number) => {
  if (v >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(1)} tỷ`;
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(0)} tr`;
  return formatPrice(v);
};

type InvoiceTab = 'all' | 'unpaid' | 'paid' | 'overdue';
const INVOICE_TABS: { key: InvoiceTab; label: string }[] = [
  { key: 'all', label: 'Tất cả' },
  { key: 'unpaid', label: 'Chưa TT' },
  { key: 'paid', label: 'Đã TT' },
  { key: 'overdue', label: 'Quá hạn' },
];

function isOverdue(inv: Invoice): boolean {
  return inv.status === 'Quá hạn' || (
    inv.status !== 'Đã thanh toán' && new Date(inv.dueDate) < new Date()
  );
}
function overdueDays(inv: Invoice): number {
  if (!isOverdue(inv)) return 0;
  return Math.ceil((Date.now() - new Date(inv.dueDate).getTime()) / 86400000);
}

const columns: ColumnConfig[] = [
  { key: 'invoiceNumber', label: 'Số HĐ', visible: true, sortable: true },
  { key: 'supplierName', label: 'Cửa hàng', visible: true, sortable: true },
  { key: 'totalAmount', label: 'Tổng tiền', visible: true, sortable: true },
  { key: 'taxAmount', label: 'Thuế', visible: true, sortable: false },
  { key: 'status', label: 'Trạng thái', visible: true, sortable: true },
  { key: 'issuedDate', label: 'Ngày xuất', visible: true, sortable: true },
  { key: 'dueDate', label: 'Hạn TT', visible: true, sortable: true },
];

const filterConfigs: FilterConfig[] = [
  {
    key: 'status', label: 'Trạng thái', type: 'select',
    options: ['Đã xuất', 'Đã gửi', 'Đã thanh toán', 'Quá hạn'].map(v => ({ label: v, value: v })),
  },
  { key: 'supplierName', label: 'Cửa hàng', type: 'text' },
];

// ─── P2.14: Print Preview Dialog ──────────────────────────
function InvoicePrintPreview({ invoice, onClose }: { invoice: Invoice; onClose: () => void }) {
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Hoá đơn {invoice.invoiceNumber}</DialogTitle>
          <DialogDescription>Xem và in hoá đơn GTGT</DialogDescription>
        </DialogHeader>
        <div className="space-y-5 print:p-8" id="invoice-print-area">
          {/* Company header */}
          <div className="flex flex-col sm:flex-row justify-between gap-4 pb-4 border-b-2 border-primary">
            <div>
              <h2 className="text-primary text-xl" style={{ fontFamily: 'var(--font-heading)' }}>
                HOÁ ĐƠN GIÁ TRỊ GIA TĂNG
              </h2>
              <p className="text-muted-foreground text-sm">(VAT INVOICE)</p>
              <p className="text-muted-foreground text-sm mt-2">Số: <strong>{invoice.invoiceNumber}</strong></p>
              <p className="text-muted-foreground text-sm">Ngày: {invoice.issuedDate}</p>
            </div>
            <div className="text-right">
              <StatusBadge status={invoice.status} />
              <p className="text-muted-foreground text-sm mt-2">Hạn TT: {invoice.dueDate}</p>
              {isOverdue(invoice) && (
                <Badge variant="destructive" className="mt-1">Quá hạn {overdueDays(invoice)} ngày</Badge>
              )}
            </div>
          </div>

          {/* Parties */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="p-3 rounded-xl bg-muted/30">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1.5">Bên bán</p>
              <p style={{ fontFamily: 'var(--font-heading)' }}>{getInvoiceStoreCompany(invoice)}</p>
              <p className="text-muted-foreground text-sm">MST: {invoice.supplierTaxCode}</p>
            </div>
            <div className="p-3 rounded-xl bg-muted/30">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1.5">Bên mua</p>
              <p style={{ fontFamily: 'var(--font-heading)' }}>{getInvoiceBuyerName(invoice)}</p>
              <p className="text-muted-foreground text-sm">MST: {invoice.buyerTaxCode}</p>
            </div>
          </div>

          {/* Items table */}
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="text-left p-2.5 text-xs text-muted-foreground">#</th>
                  <th className="text-left p-2.5 text-xs text-muted-foreground">Mô tả</th>
                  <th className="text-right p-2.5 text-xs text-muted-foreground">SL</th>
                  <th className="text-right p-2.5 text-xs text-muted-foreground">Đơn giá</th>
                  <th className="text-right p-2.5 text-xs text-muted-foreground">Thành tiền</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item, idx) => (
                  <tr key={idx} className="border-b hover:bg-muted/10">
                    <td className="p-2.5 text-muted-foreground">{idx + 1}</td>
                    <td className="p-2.5">{item.description}</td>
                    <td className="p-2.5 text-right" style={{ fontFamily: 'var(--font-heading)' }}>{item.quantity.toLocaleString()}</td>
                    <td className="p-2.5 text-right">{new Intl.NumberFormat('vi-VN').format(item.unitPrice)}</td>
                    <td className="p-2.5 text-right" style={{ fontFamily: 'var(--font-heading)' }}>{new Intl.NumberFormat('vi-VN').format(item.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-72 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Cộng tiền hàng:</span>
                <span>{new Intl.NumberFormat('vi-VN').format(invoice.subtotal)} ₫</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Thuế GTGT ({invoice.taxRate}%):</span>
                <span>{new Intl.NumberFormat('vi-VN').format(invoice.taxAmount)} ₫</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span style={{ fontFamily: 'var(--font-heading)' }}>Tổng cộng:</span>
                <span className="text-primary text-lg" style={{ fontFamily: 'var(--font-heading)' }}>
                  {formatPrice(invoice.totalAmount)}
                </span>
              </div>
            </div>
          </div>

          {invoice.notes && (
            <div className="p-3 rounded-xl bg-muted/20">
              <p className="text-xs text-muted-foreground mb-1">Ghi chú</p>
              <p className="text-sm">{invoice.notes}</p>
            </div>
          )}

          {/* Footer */}
          <div className="text-center text-xs text-muted-foreground border-t pt-3">
            <p>Hoá đơn điện tử — Hệ thống bán hàng CELLPHONES</p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>Đóng</Button>
          {invoice.orderId && (
            <Link to={`/orders/${invoice.orderId}`}>
              <Button variant="outline">
                <FileText className="mr-1.5 h-4 w-4" /> Đơn hàng
              </Button>
            </Link>
          )}
          <Button onClick={() => window.print()}>
            <Printer className="mr-1.5 h-4 w-4" /> In hoá đơn
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ═══════════════════════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════════════════════
export function BuyerInvoiceListPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const buyerId = user?.id ?? 'user-001';

  const [allInvoices, setAllInvoices] = useState<Invoice[]>([]);
  const [data, setData] = useState<Invoice[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationParams>({ page: 1, pageSize: 10 });
  const [sort, setSort] = useState<SortParams>({ field: 'issuedDate', direction: 'desc' });
  const [filters, setFilters] = useState<ActiveFilter[]>([]);
  const [selected, setSelected] = useState<Invoice | null>(null);
  const [dcNotes, setDcNotes] = useState<DebitCreditNote[]>([]);
  const [dcLoading, setDcLoading] = useState(true);
  const [showDCDetail, setShowDCDetail] = useState(false);
  const [selectedDC, setSelectedDC] = useState<DebitCreditNote | null>(null);
  const [activeMainTab, setActiveMainTab] = useState<'invoices' | 'debitCredit'>('invoices');
  const [statusTab, setStatusTab] = useState<InvoiceTab>('all');

  // P2.19: Bulk payment
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showBulkConfirm, setShowBulkConfirm] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setDcLoading(true);
    try {
      const res = await invoiceBuyerApi.getByBuyer(buyerId, pagination, sort, filters);
      setAllInvoices(res.data);
      setDcNotes([]);
    } finally {
      setLoading(false);
      setDcLoading(false);
    }
  }, [buyerId, pagination, sort, filters]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Filter by status tab
  const filteredByTab = useMemo(() => {
    if (statusTab === 'all') return allInvoices;
    return allInvoices.filter(inv => {
      switch (statusTab) {
        case 'unpaid': return inv.status !== 'Đã thanh toán';
        case 'paid': return inv.status === 'Đã thanh toán';
        case 'overdue': return isOverdue(inv);
        default: return true;
      }
    });
  }, [allInvoices, statusTab]);

  useEffect(() => {
    setData(filteredByTab);
    setTotal(filteredByTab.length);
  }, [filteredByTab]);

  // P2.02: Tab counts
  const tabCounts = useMemo(() => ({
    all: allInvoices.length,
    unpaid: allInvoices.filter(inv => inv.status !== 'Đã thanh toán').length,
    paid: allInvoices.filter(inv => inv.status === 'Đã thanh toán').length,
    overdue: allInvoices.filter(inv => isOverdue(inv)).length,
  }), [allInvoices]);

  // P2.11: Summary stats
  const stats = useMemo(() => {
    const unpaidTotal = allInvoices
      .filter(inv => inv.status !== 'Đã thanh toán')
      .reduce((s, inv) => s + inv.totalAmount, 0);
    const paidTotal = allInvoices
      .filter(inv => inv.status === 'Đã thanh toán')
      .reduce((s, inv) => s + inv.totalAmount, 0);
    const overdueTotal = allInvoices
      .filter(inv => isOverdue(inv))
      .reduce((s, inv) => s + inv.totalAmount, 0);
    return { unpaidTotal, paidTotal, overdueTotal };
  }, [allInvoices]);

  const tableData = useMemo(() => data.map(d => ({
    ...d,
    totalAmount: formatPrice(d.totalAmount),
    taxAmount: formatPrice(d.taxAmount),
  })), [data]);

  // P2.19: Bulk payment
  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };
  const toggleSelectAll = () => {
    const unpaid = data.filter(inv => inv.status !== 'Đã thanh toán');
    if (selectedIds.size === unpaid.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(unpaid.map(inv => inv.id)));
    }
  };
  const selectedInvoices = useMemo(() =>
    allInvoices.filter(inv => selectedIds.has(inv.id)),
    [allInvoices, selectedIds],
  );
  const selectedTotal = selectedInvoices.reduce((s, inv) => s + inv.totalAmount, 0);

  const handleBulkPay = () => {
    toast.success(`Đã gửi yêu cầu thanh toán ${selectedIds.size} hoá đơn (${formatPrice(selectedTotal)})`);
    setShowBulkConfirm(false);
    setSelectedIds(new Set());
  };

  const handleTabChange = (tab: InvoiceTab) => {
    setStatusTab(tab);
    setSelectedIds(new Set());
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <AppBreadcrumb items={[{ label: 'Hoá đơn' }]} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2" style={{ fontFamily: 'var(--font-heading)' }}>
            <FileText className="h-6 w-6 text-primary" />
            Hoá đơn của tôi
          </h1>
          <p className="text-muted-foreground mt-1">Danh sách hoá đơn từ các đơn hàng của bạn</p>
        </div>
        <div className="flex gap-2">
          <Button variant={activeMainTab === 'invoices' ? 'default' : 'outline'} size="sm"
            onClick={() => setActiveMainTab('invoices')}>
            <FileText className="h-3.5 w-3.5 mr-1" /> Hoá đơn
          </Button>
          <Button variant={activeMainTab === 'debitCredit' ? 'default' : 'outline'} size="sm"
            onClick={() => setActiveMainTab('debitCredit')}>
            <ReceiptText className="h-3.5 w-3.5 mr-1" /> Ghi nợ/có ({dcNotes.length})
          </Button>
        </div>
      </div>

      {activeMainTab === 'invoices' && (
        <>
          {/* P2.11: Summary bar — 3 metric cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="border-l-4 border-l-amber-500 hover:-translate-y-0.5 hover:shadow-md transition-all">
              <CardContent className="p-4 flex items-center gap-3">
                <IconWrapper icon={Clock} variant="warning" size="md" />
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Chưa thanh toán</p>
                  <p className="text-lg text-amber-600" style={{ fontFamily: 'var(--font-heading)' }}>
                    <AnimatedNumber value={stats.unpaidTotal} format={fmtShort} />
                  </p>
                  <p className="text-xs text-muted-foreground">{tabCounts.unpaid} hoá đơn</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-emerald-500 hover:-translate-y-0.5 hover:shadow-md transition-all">
              <CardContent className="p-4 flex items-center gap-3">
                <IconWrapper icon={CheckCircle2} variant="success" size="md" />
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Đã thanh toán</p>
                  <p className="text-lg text-emerald-600" style={{ fontFamily: 'var(--font-heading)' }}>
                    <AnimatedNumber value={stats.paidTotal} format={fmtShort} />
                  </p>
                  <p className="text-xs text-muted-foreground">{tabCounts.paid} hoá đơn</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-red-500 hover:-translate-y-0.5 hover:shadow-md transition-all">
              <CardContent className="p-4 flex items-center gap-3">
                <IconWrapper icon={AlertTriangle} variant="danger" size="md" />
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Quá hạn</p>
                  <p className="text-lg text-red-600" style={{ fontFamily: 'var(--font-heading)' }}>
                    <AnimatedNumber value={stats.overdueTotal} format={fmtShort} />
                  </p>
                  <p className="text-xs text-muted-foreground">{tabCounts.overdue} hoá đơn</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* P2.13: Status tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 -mx-1 px-1">
            {INVOICE_TABS.map(tab => {
              const count = tabCounts[tab.key];
              const isActive = statusTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => handleTabChange(tab.key)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                  }`}
                >
                  {tab.label}
                  {count > 0 && (
                    <span className={`inline-flex items-center justify-center h-5 min-w-[20px] px-1.5 rounded-full text-xs ${
                      isActive ? 'bg-primary-foreground/20' : 'bg-muted'
                    }`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* P2.19: Bulk action bar */}
          {selectedIds.size > 0 && (
            <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-primary/5 border border-primary/20">
              <span className="text-sm">
                Đã chọn <strong>{selectedIds.size}</strong> hoá đơn · Tổng: <strong className="text-primary">{formatPrice(selectedTotal)}</strong>
              </span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setSelectedIds(new Set())}>
                  Bỏ chọn
                </Button>
                <Button size="sm" onClick={() => setShowBulkConfirm(true)}>
                  <CreditCard className="h-3.5 w-3.5 mr-1" />
                  Thanh toán {selectedIds.size} HĐ
                </Button>
              </div>
            </div>
          )}

          <FilterBar
            filters={filterConfigs}
            activeFilters={filters}
            onFilterChange={f => { setFilters(f); setPagination(p => ({ ...p, page: 1 })); }}
          />

          {/* Desktop table */}
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-lg" />)}
            </div>
          ) : (
            <>
              <div className="hidden md:block">
                <DataTable
                  data={tableData}
                  columns={columns}
                  totalItems={total}
                  pagination={pagination}
                  sort={sort}
                  onPaginationChange={setPagination}
                  onSortChange={setSort}
                  getId={r => r.id}
                  loading={loading}
                  onRowClick={(row) => navigate(`/invoices/${row.id}`)}
                  renderActions={(row) => {
                    const inv = allInvoices.find(d => d.id === row.id)!;
                    return (
                      <div className="flex items-center gap-1">
                        {/* P2.19: Checkbox */}
                        {inv.status !== 'Đã thanh toán' && (
                          <Checkbox
                            checked={selectedIds.has(inv.id)}
                            onCheckedChange={() => toggleSelect(inv.id)}
                            onClick={e => e.stopPropagation()}
                          />
                        )}
                        <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); setSelected(inv); }}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    );
                  }}
                />
              </div>

              {/* P2.12 & P2.20: Mobile card list with overdue highlight */}
              <div className="md:hidden space-y-3">
                {data.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p>Chưa có hoá đơn nào</p>
                  </div>
                )}
                {data.map(inv => {
                  const overdueD = overdueDays(inv);
                  const isOD = isOverdue(inv);
                  return (
                    <Card
                      key={inv.id}
                      className={`cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all ${
                        isOD ? 'border-red-200 bg-red-50/50 dark:bg-red-950/10' : ''
                      }`}
                      onClick={() => setSelected(inv)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2 min-w-0">
                            {inv.status !== 'Đã thanh toán' && (
                              <Checkbox
                                checked={selectedIds.has(inv.id)}
                                onCheckedChange={() => toggleSelect(inv.id)}
                                onClick={e => e.stopPropagation()}
                              />
                            )}
                            <div className="min-w-0">
                              <p style={{ fontFamily: 'var(--font-heading)' }} className="truncate">{inv.invoiceNumber}</p>
                              <p className="text-muted-foreground text-sm truncate">{getInvoiceStoreName(inv)}</p>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <StatusBadge status={inv.status} size="sm" />
                            {isOD && <Badge variant="destructive" className="text-[10px]">Quá hạn {overdueD}d</Badge>}
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-primary" style={{ fontFamily: 'var(--font-heading)' }}>{formatPrice(inv.totalAmount)}</span>
                          <span className="text-muted-foreground text-xs">{inv.issuedDate}</span>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </>
          )}

          {/* P2.14: Print Preview Dialog */}
          {selected && (
            <InvoicePrintPreview invoice={selected} onClose={() => setSelected(null)} />
          )}

          {/* P2.19: Bulk Payment Confirm */}
          <AlertDialog open={showBulkConfirm} onOpenChange={setShowBulkConfirm}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Thanh toán hàng loạt</AlertDialogTitle>
                <AlertDialogDescription>
                  Bạn xác nhận gửi yêu cầu thanh toán cho <strong>{selectedIds.size} hoá đơn</strong> với tổng giá trị <strong className="text-primary">{formatPrice(selectedTotal)}</strong>?
                </AlertDialogDescription>
              </AlertDialogHeader>
              {selectedInvoices.length > 0 && (
                <div className="max-h-40 overflow-y-auto space-y-1.5 border rounded-lg p-2">
                  {selectedInvoices.map(inv => (
                    <div key={inv.id} className="flex items-center justify-between text-sm p-1.5 rounded hover:bg-muted/30">
                      <span>{inv.invoiceNumber} — {getInvoiceStoreName(inv)}</span>
                      <span style={{ fontFamily: 'var(--font-heading)' }}>{formatPrice(inv.totalAmount)}</span>
                    </div>
                  ))}
                </div>
              )}
              <AlertDialogFooter>
                <AlertDialogCancel>Huỷ</AlertDialogCancel>
                <AlertDialogAction onClick={handleBulkPay}>
                  <CreditCard className="h-4 w-4 mr-1" /> Xác nhận thanh toán
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )}

      {/* Tab Ghi nợ / Ghi có */}
      {activeMainTab === 'debitCredit' && (
        <div className="space-y-3 mt-2">
          {dcLoading && (
            <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}</div>
          )}
          {!dcLoading && dcNotes.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <ReceiptText className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>Chưa có phiếu ghi nợ/ghi có nào</p>
            </div>
          )}
          {dcNotes.map(note => (
            <Card key={note.id} className="cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all"
              onClick={() => { setSelectedDC(note); setShowDCDetail(true); }}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <IconWrapper
                      icon={note.type === 'Ghi nợ' ? TrendingUp : TrendingDown}
                      variant={note.type === 'Ghi nợ' ? 'danger' : 'success'}
                      size="sm"
                    />
                    <div>
                      <span style={{ fontFamily: 'var(--font-heading)' }}>{note.noteNumber}</span>
                      <Badge variant={note.type === 'Ghi nợ' ? 'destructive' : 'default'} className="ml-2 text-xs">
                        {note.type}
                      </Badge>
                    </div>
                  </div>
                  <StatusBadge status={note.status} size="sm" />
                </div>
                <p className="text-sm text-muted-foreground mb-1">{note.description}</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">HĐ: {note.invoiceNumber} · {note.sellerName || 'CELLPHONES'}</span>
                  <span className={`${note.type === 'Ghi nợ' ? 'text-red-600' : 'text-green-600'}`} style={{ fontFamily: 'var(--font-heading)' }}>
                    {note.type === 'Ghi nợ' ? '+' : '-'}{formatPrice(note.totalAmount)}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* DC Detail Dialog */}
      <Dialog open={showDCDetail} onOpenChange={setShowDCDetail}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Phiếu {selectedDC?.noteNumber}</DialogTitle>
            <DialogDescription>Chi tiết phiếu ghi nợ/ghi có</DialogDescription>
          </DialogHeader>
          {selectedDC && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="p-2.5 rounded-lg bg-muted/30">
                  <span className="text-xs text-muted-foreground">Loại</span>
                  <div className="mt-0.5"><Badge variant={selectedDC.type === 'Ghi nợ' ? 'destructive' : 'default'}>{selectedDC.type}</Badge></div>
                </div>
                <div className="p-2.5 rounded-lg bg-muted/30">
                  <span className="text-xs text-muted-foreground">Trạng thái</span>
                  <div className="mt-0.5"><StatusBadge status={selectedDC.status} size="sm" /></div>
                </div>
                <div className="p-2.5 rounded-lg bg-muted/30">
                  <span className="text-xs text-muted-foreground">Hoá đơn</span>
                  <p>{selectedDC.invoiceNumber}</p>
                </div>
                <div className="p-2.5 rounded-lg bg-muted/30">
                  <span className="text-xs text-muted-foreground">Cửa hàng</span>
                  <p>{selectedDC.sellerName || 'CELLPHONES'}</p>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-muted/20">
                <span className="text-xs text-muted-foreground">Lý do: </span>
                <span className="text-sm">{selectedDC.reason}</span>
              </div>
              <Separator />
              <div className="space-y-2">
                {selectedDC.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between p-2.5 bg-muted/20 rounded-lg text-sm">
                    <span>{item.description}</span>
                    <span style={{ fontFamily: 'var(--font-heading)' }}>{formatPrice(item.amount)}</span>
                  </div>
                ))}
              </div>
              <div className="text-right space-y-1">
                <p className="text-sm text-muted-foreground">Cộng: {formatPrice(selectedDC.amount)}</p>
                <p className="text-sm text-muted-foreground">Thuế: {formatPrice(selectedDC.tax)}</p>
                <p style={{ fontFamily: 'var(--font-heading)' }}>
                  Tổng: <span className={selectedDC.type === 'Ghi nợ' ? 'text-red-600' : 'text-green-600'}>
                    {formatPrice(selectedDC.totalAmount)}
                  </span>
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDCDetail(false)}>Đóng</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

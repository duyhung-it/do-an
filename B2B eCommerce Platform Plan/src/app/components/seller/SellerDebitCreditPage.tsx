// ============================================================
// Trang Ghi nợ / Ghi có & Đối soát — Seller (Nhóm 32)
// Bao gồm: thống kê, bộ lọc, DataTable, tạo phiếu, đối soát
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';
import {
  ReceiptText, TrendingUp, TrendingDown, Clock, CheckCircle2,
  Plus, Eye, Trash2, ArrowRightLeft, FileText,
} from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Textarea } from '../ui/textarea';
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
import { debitCreditApi } from '../../services/debitCreditApi';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';
import type {
  DebitCreditNote, DebitCreditStats, DebitCreditItem,
  NoteType, NoteStatus, NoteReason,
  PaginationParams, SortParams, ActiveFilter, FilterConfig, ColumnConfig,
} from '../../types';

const formatPrice = (price: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });

const ALL_STATUSES: NoteStatus[] = ['Bản nháp', 'Chờ đối soát', 'Đã đối soát', 'Từ chối', 'Đã huỷ'];
const ALL_TYPES: NoteType[] = ['Ghi nợ', 'Ghi có'];
const ALL_REASONS: NoteReason[] = ['Trả hàng', 'Giảm giá', 'Phí phát sinh', 'Điều chỉnh giá', 'Chênh lệch', 'Khác'];

const filterConfigs: FilterConfig[] = [
  { key: 'type', label: 'Loại', type: 'select', options: ALL_TYPES.map(t => ({ label: t, value: t })) },
  { key: 'status', label: 'Trạng thái', type: 'select', options: ALL_STATUSES.map(s => ({ label: s, value: s })) },
  { key: 'reason', label: 'Lý do', type: 'select', options: ALL_REASONS.map(r => ({ label: r, value: r })) },
];

const emptyItem = (): DebitCreditItem => ({ description: '', quantity: 1, unitPrice: 0, amount: 0 });

export function SellerDebitCreditPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const sellerId = user?.supplierId ?? 'all';

  const [notes, setNotes] = useState<DebitCreditNote[]>([]);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState<DebitCreditStats | null>(null);
  const [loading, setLoading] = useState(true);

  const [pagination, setPagination] = useState<PaginationParams>({ page: 1, pageSize: 10 });
  const [sort, setSort] = useState<SortParams>({ field: 'createdAt', direction: 'desc' });
  const [filters, setFilters] = useState<ActiveFilter[]>([]);
  const [search, setSearch] = useState('');

  // Dialogs
  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [showReconcile, setShowReconcile] = useState(false);
  const [selectedNote, setSelectedNote] = useState<DebitCreditNote | null>(null);

  // Form
  const [formType, setFormType] = useState<NoteType>('Ghi nợ');
  const [formReason, setFormReason] = useState<NoteReason>('Khác');
  const [formInvoiceNumber, setFormInvoiceNumber] = useState('');
  const [formBuyerName, setFormBuyerName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formItems, setFormItems] = useState<DebitCreditItem[]>([emptyItem()]);
  const [formTaxRate] = useState(10);

  // --- Fetch ---
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [res, statsRes] = await Promise.all([
        debitCreditApi.getBySeller(sellerId, pagination, sort, filters, search),
        debitCreditApi.getStats(sellerId, 'seller'),
      ]);
      setNotes(res.data);
      setTotal(res.total);
      setStats(statsRes);
    } finally {
      setLoading(false);
    }
  }, [sellerId, pagination, sort, filters, search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // --- Form ---
  const resetForm = () => {
    setFormType('Ghi nợ');
    setFormReason('Khác');
    setFormInvoiceNumber('');
    setFormBuyerName('');
    setFormDescription('');
    setFormItems([emptyItem()]);
    setSelectedNote(null);
  };

  const calcSubtotal = () => formItems.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
  const calcTax = () => Math.round(calcSubtotal() * formTaxRate / 100);

  const handleItemChange = (idx: number, field: keyof DebitCreditItem, value: string | number) => {
    setFormItems(prev => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [field]: value };
      if (field === 'quantity' || field === 'unitPrice') {
        updated[idx].amount = updated[idx].quantity * updated[idx].unitPrice;
      }
      return updated;
    });
  };

  const handleSave = async (asDraft: boolean) => {
    if (!formInvoiceNumber || !formDescription || formItems.some(i => !i.description)) {
      toast.error('Vui lòng điền đầy đủ thông tin'); return;
    }
    const subtotal = calcSubtotal();
    const tax = calcTax();
    await debitCreditApi.create({
      type: formType,
      reason: formReason,
      invoiceId: `inv-${formInvoiceNumber}`,
      invoiceNumber: formInvoiceNumber,
      sellerId,
      sellerName: user?.companyName ?? '',
      buyerId: 'user-001',
      buyerName: formBuyerName || 'Lê Hoàng Anh',
      items: formItems.map(i => ({ ...i, amount: i.quantity * i.unitPrice })),
      amount: subtotal,
      tax,
      totalAmount: subtotal + tax,
      status: asDraft ? 'Bản nháp' : 'Chờ đối soát',
      description: formDescription,
    });
    toast.success(asDraft ? 'Đã lưu nháp phiếu' : 'Đã gửi phiếu đối soát');
    setShowForm(false);
    resetForm();
    fetchData();
  };

  // --- Reconcile ---
  const handleReconcile = async () => {
    if (!selectedNote) return;
    await debitCreditApi.updateStatus(selectedNote.id, 'Đã đối soát');
    toast.success(`Đã đối soát phiếu ${selectedNote.noteNumber}`);
    setShowReconcile(false);
    setSelectedNote(null);
    fetchData();
  };

  const handleDelete = async (note: DebitCreditNote) => {
    if (note.status !== 'Bản nháp') {
      toast.error('Chỉ xoá được phiếu ở trạng thái Bản nháp'); return;
    }
    await debitCreditApi.delete(note.id);
    toast.success(`Đã xoá ${note.noteNumber}`);
    fetchData();
  };

  const handleSendForReconcile = async (note: DebitCreditNote) => {
    await debitCreditApi.updateStatus(note.id, 'Chờ đối soát');
    toast.success(`Đã gửi ${note.noteNumber} cho đối soát`);
    fetchData();
  };

  // --- Columns ---
  const columns: (ColumnConfig & { render?: (item: DebitCreditNote) => React.ReactNode })[] = [
    { key: 'noteNumber', label: 'Mã phiếu', visible: true, sortable: true },
    {
      key: 'type', label: 'Loại', visible: true, sortable: true,
      render: (n) => (
        <Badge variant={n.type === 'Ghi nợ' ? 'destructive' : 'default'} className="gap-1">
          {n.type === 'Ghi nợ' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          {n.type}
        </Badge>
      ),
    },
    { key: 'invoiceNumber', label: 'Hoá đơn', visible: true, sortable: true },
    { key: 'buyerName', label: 'Người mua', visible: true, sortable: true },
    { key: 'reason', label: 'Lý do', visible: true, sortable: true },
    {
      key: 'totalAmount', label: 'Số tiền', visible: true, sortable: true,
      render: (n) => (
        <span className={`font-medium ${n.type === 'Ghi nợ' ? 'text-red-600' : 'text-green-600'}`}>
          {n.type === 'Ghi nợ' ? '+' : '-'}{formatPrice(n.totalAmount)}
        </span>
      ),
    },
    {
      key: 'status', label: 'Trạng thái', visible: true, sortable: true,
      render: (n) => <StatusBadge status={n.status} />,
    },
    {
      key: 'createdAt', label: 'Ngày tạo', visible: true, sortable: true,
      render: (n) => <span>{formatDate(n.createdAt)}</span>,
    },
  ];

  // --- Stats ---
  const statsCards = stats ? [
    { label: 'Tổng phiếu', value: stats.total, icon: ReceiptText, color: 'text-blue-600 bg-blue-50', extra: '' },
    { label: 'Ghi nợ', value: stats.debitCount, icon: TrendingUp, color: 'text-red-600 bg-red-50', extra: formatPrice(stats.debitAmount) },
    { label: 'Ghi có', value: stats.creditCount, icon: TrendingDown, color: 'text-green-600 bg-green-50', extra: formatPrice(stats.creditAmount) },
    { label: 'Chờ đối soát', value: stats.pendingCount, icon: Clock, color: 'text-yellow-600 bg-yellow-50', extra: '' },
    { label: 'Số dư ròng', value: formatPrice(stats.netAmount), icon: ArrowRightLeft, color: `${stats.netAmount >= 0 ? 'text-red-600 bg-red-50' : 'text-green-600 bg-green-50'}`, extra: stats.netAmount >= 0 ? 'NCC nợ' : 'NCC có' },
  ] : [];

  return (
    <div className="container mx-auto px-4 py-6">
      <AppBreadcrumb items={[{ label: 'Kênh người bán', href: '/seller' }, { label: 'Ghi nợ / Ghi có' }]} />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="flex items-center gap-2">
            <ReceiptText className="h-6 w-6" />
            Ghi nợ / Ghi có & Đối soát
          </h1>
          <p className="text-muted-foreground">Quản lý phiếu ghi nợ, ghi có và đối soát công nợ</p>
        </div>
        <Button onClick={() => { resetForm(); setShowForm(true); }} className="gap-2">
          <Plus className="h-4 w-4" /> Tạo phiếu
        </Button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          {statsCards.map((card) => (
            <Card key={card.label}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${card.color}`}>
                    <card.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-muted-foreground">{card.label}</p>
                    <p className="text-xl font-semibold">{card.value}</p>
                    {card.extra && <p className="text-xs text-muted-foreground">{card.extra}</p>}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <FilterBar
        filters={filterConfigs}
        activeFilters={filters}
        onFilterChange={f => { setFilters(f); setPagination(p => ({ ...p, page: 1 })); }}
        searchValue={search}
        onSearchChange={v => { setSearch(v); setPagination(p => ({ ...p, page: 1 })); }}
        searchPlaceholder="Tìm mã phiếu, hoá đơn, người mua..."
      />

      <div className="mt-4">
        <DataTable
          data={notes}
          columns={columns}
          totalItems={total}
          pagination={pagination}
          sort={sort}
          onPaginationChange={setPagination}
          onSortChange={setSort}
          getId={n => n.id}
          loading={loading}
          renderActions={(note) => (
            <div className="flex items-center gap-1">
              <Button size="sm" variant="ghost" onClick={() => navigate(`/seller/debit-credit/${note.id}`)}>
                <Eye className="h-4 w-4" />
              </Button>
              {note.status === 'Bản nháp' && (
                <>
                  <Button size="sm" variant="ghost" className="text-blue-600" onClick={() => handleSendForReconcile(note)}>
                    <ArrowRightLeft className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" className="text-red-600" onClick={() => handleDelete(note)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </>
              )}
              {note.status === 'Chờ đối soát' && (
                <Button size="sm" variant="ghost" className="text-green-600" onClick={() => { setSelectedNote(note); setShowReconcile(true); }}>
                  <CheckCircle2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
        />
      </div>

      {/* ==================== DIALOG: Tạo phiếu ==================== */}
      <Dialog open={showForm} onOpenChange={(open) => { if (!open) { setShowForm(false); resetForm(); } }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Tạo phiếu ghi nợ / ghi có</DialogTitle>
            <DialogDescription>Điền thông tin phiếu và danh sách khoản mục</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Loại phiếu <span className="text-red-500">*</span></Label>
                <Select value={formType} onValueChange={v => setFormType(v as NoteType)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ALL_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Lý do <span className="text-red-500">*</span></Label>
                <Select value={formReason} onValueChange={v => setFormReason(v as NoteReason)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ALL_REASONS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Số hoá đơn <span className="text-red-500">*</span></Label>
                <Input value={formInvoiceNumber} onChange={e => setFormInvoiceNumber(e.target.value)} placeholder="HD-2025-XXXXX" />
              </div>
            </div>

            <div>
              <Label>Tên người mua</Label>
              <Input value={formBuyerName} onChange={e => setFormBuyerName(e.target.value)} placeholder="Tên công ty người mua" />
            </div>

            <div>
              <Label>Mô tả <span className="text-red-500">*</span></Label>
              <Textarea value={formDescription} onChange={e => setFormDescription(e.target.value)} placeholder="Mô tả chi tiết lý do..." rows={2} />
            </div>

            <Separator />

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Khoản mục</Label>
                <Button size="sm" variant="outline" onClick={() => setFormItems(prev => [...prev, emptyItem()])}>
                  <Plus className="h-3 w-3 mr-1" /> Thêm dòng
                </Button>
              </div>
              <div className="space-y-2">
                {formItems.map((item, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-2 items-end">
                    <div className="col-span-5">
                      <Input
                        value={item.description}
                        onChange={e => handleItemChange(idx, 'description', e.target.value)}
                        placeholder="Mô tả khoản mục"
                      />
                    </div>
                    <div className="col-span-2">
                      <Input
                        type="number" min={1}
                        value={item.quantity}
                        onChange={e => handleItemChange(idx, 'quantity', Number(e.target.value))}
                        placeholder="SL"
                      />
                    </div>
                    <div className="col-span-3">
                      <Input
                        type="number" min={0}
                        value={item.unitPrice}
                        onChange={e => handleItemChange(idx, 'unitPrice', Number(e.target.value))}
                        placeholder="Đơn giá"
                      />
                    </div>
                    <div className="col-span-1 text-right text-sm font-medium pt-2">
                      {formatPrice(item.quantity * item.unitPrice)}
                    </div>
                    <div className="col-span-1">
                      <Button size="sm" variant="ghost" className="text-red-500" onClick={() => {
                        if (formItems.length > 1) setFormItems(prev => prev.filter((_, i) => i !== idx));
                      }} disabled={formItems.length <= 1}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3 text-right space-y-1 text-sm">
                <p>Cộng: <strong>{formatPrice(calcSubtotal())}</strong></p>
                <p>Thuế ({formTaxRate}%): <strong>{formatPrice(calcTax())}</strong></p>
                <p className="text-base">Tổng: <strong className="text-primary">{formatPrice(calcSubtotal() + calcTax())}</strong></p>
              </div>
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => { setShowForm(false); resetForm(); }}>Huỷ</Button>
            <Button variant="secondary" onClick={() => handleSave(true)} className="gap-2">
              <FileText className="h-4 w-4" /> Lưu nháp
            </Button>
            <Button onClick={() => handleSave(false)} className="gap-2">
              <ArrowRightLeft className="h-4 w-4" /> Gửi đối soát
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ==================== DIALOG: Chi tiết ==================== */}
      <Dialog open={showDetail} onOpenChange={setShowDetail}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chi tiết {selectedNote?.noteNumber}</DialogTitle>
          </DialogHeader>
          {selectedNote && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Loại:</span>
                  <div className="mt-0.5">
                    <Badge variant={selectedNote.type === 'Ghi nợ' ? 'destructive' : 'default'}>
                      {selectedNote.type}
                    </Badge>
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Trạng thái:</span>
                  <div className="mt-0.5"><StatusBadge status={selectedNote.status} /></div>
                </div>
                <div>
                  <span className="text-muted-foreground">Hoá đơn:</span>
                  <p className="font-medium">{selectedNote.invoiceNumber}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Lý do:</span>
                  <p className="font-medium">{selectedNote.reason}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Người mua:</span>
                  <p className="font-medium">{selectedNote.buyerName}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Ngày tạo:</span>
                  <p className="font-medium">{formatDate(selectedNote.createdAt)}</p>
                </div>
              </div>

              <div>
                <span className="text-sm text-muted-foreground">Mô tả:</span>
                <p className="text-sm">{selectedNote.description}</p>
              </div>

              <Separator />

              <div className="space-y-2">
                {selectedNote.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 bg-muted/30 rounded text-sm">
                    <span className="flex-1">{item.description}</span>
                    <span className="text-muted-foreground">{item.quantity} × {formatPrice(item.unitPrice)}</span>
                    <span className="font-medium ml-3">{formatPrice(item.amount)}</span>
                  </div>
                ))}
              </div>

              <div className="text-right space-y-1 text-sm">
                <p>Cộng: {formatPrice(selectedNote.amount)}</p>
                <p>Thuế: {formatPrice(selectedNote.tax)}</p>
                <p className="text-base font-medium">
                  Tổng: <span className={selectedNote.type === 'Ghi nợ' ? 'text-red-600' : 'text-green-600'}>
                    {selectedNote.type === 'Ghi nợ' ? '+' : '-'}{formatPrice(selectedNote.totalAmount)}
                  </span>
                </p>
              </div>

              {(selectedNote.sellerConfirmedAt || selectedNote.buyerConfirmedAt) && (
                <>
                  <Separator />
                  <div className="text-sm space-y-1">
                    <p className="font-medium">Đối soát</p>
                    {selectedNote.sellerConfirmedAt && (
                      <p className="text-green-600">NCC xác nhận: {formatDate(selectedNote.sellerConfirmedAt)}</p>
                    )}
                    {selectedNote.buyerConfirmedAt && (
                      <p className="text-green-600">Người mua xác nhận: {formatDate(selectedNote.buyerConfirmedAt)}</p>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ==================== DIALOG: Đối soát ==================== */}
      <Dialog open={showReconcile} onOpenChange={setShowReconcile}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Đối soát phiếu {selectedNote?.noteNumber}?</DialogTitle>
            <DialogDescription>
              Xác nhận cả hai bên đồng ý với nội dung phiếu ghi nợ/ghi có này
            </DialogDescription>
          </DialogHeader>
          {selectedNote && (
            <div className="text-sm space-y-2">
              <p>Loại: <Badge variant={selectedNote.type === 'Ghi nợ' ? 'destructive' : 'default'}>{selectedNote.type}</Badge></p>
              <p>Người mua: <strong>{selectedNote.buyerName}</strong></p>
              <p>Số tiền: <strong className={selectedNote.type === 'Ghi nợ' ? 'text-red-600' : 'text-green-600'}>
                {formatPrice(selectedNote.totalAmount)}
              </strong></p>
              <p>Lý do: {selectedNote.reason}</p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReconcile(false)}>Huỷ</Button>
            <Button onClick={handleReconcile} className="gap-2">
              <CheckCircle2 className="h-4 w-4" /> Xác nhận đối soát
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
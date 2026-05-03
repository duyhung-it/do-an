// ============================================================
// Trang Quản lý Ghi nợ / Ghi có & Đối soát — Admin
// Quản lý và giám sát chứng từ nợ/có toàn sàn
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';
import {
  ReceiptText, TrendingUp, TrendingDown, Clock, CheckCircle2,
  Eye, ArrowRightLeft, ShieldAlert
} from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
  DialogDescription,
} from '../ui/dialog';
import { DataTable } from '../shared/DataTable';
import { StatusBadge } from '../shared/StatusBadge';
import { FilterBar } from '../shared/FilterBar';
import { AppBreadcrumb } from '../shared/AppBreadcrumb';
import { debitCreditApi } from '../../services/debitCreditApi';
import { toast } from 'sonner';
import type {
  DebitCreditNote, DebitCreditStats, NoteType, NoteStatus, NoteReason,
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

export function AdminDebitCreditPage() {
  const navigate = useNavigate();

  const [notes, setNotes] = useState<DebitCreditNote[]>([]);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState<DebitCreditStats | null>(null);
  const [loading, setLoading] = useState(true);

  const [pagination, setPagination] = useState<PaginationParams>({ page: 1, pageSize: 10 });
  const [sort, setSort] = useState<SortParams>({ field: 'createdAt', direction: 'desc' });
  const [filters, setFilters] = useState<ActiveFilter[]>([]);
  const [search, setSearch] = useState('');

  // Dialogs
  const [showDetail, setShowDetail] = useState(false);
  const [showIntervene, setShowIntervene] = useState(false);
  const [selectedNote, setSelectedNote] = useState<DebitCreditNote | null>(null);

  // --- Fetch ---
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [res, statsRes] = await Promise.all([
        debitCreditApi.getBySeller('all', pagination, sort, filters, search),
        debitCreditApi.getStats('all', 'admin'),
      ]);
      setNotes(res.data);
      setTotal(res.total);
      setStats(statsRes);
    } finally {
      setLoading(false);
    }
  }, [pagination, sort, filters, search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // --- Admin actions ---
  const handleIntervene = async () => {
    if (!selectedNote) return;
    try {
      await debitCreditApi.updateStatus(selectedNote.id, 'Đã đối soát'); // Admin ép đối soát
      toast.success(`Admin đã xác nhận đối soát phiếu ${selectedNote.noteNumber}`);
    } catch (e) {
      toast.error('Có lỗi xảy ra');
    }
    setShowIntervene(false);
    setSelectedNote(null);
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
    { key: 'sellerName', label: 'Nhà cung cấp', visible: true, sortable: true },
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
    { label: 'Tổng phiếu toàn sàn', value: stats.total, icon: ReceiptText, color: 'text-blue-600 bg-blue-50', extra: '' },
    { label: 'Ghi nợ', value: stats.debitCount, icon: TrendingUp, color: 'text-red-600 bg-red-50', extra: formatPrice(stats.debitAmount) },
    { label: 'Ghi có', value: stats.creditCount, icon: TrendingDown, color: 'text-green-600 bg-green-50', extra: formatPrice(stats.creditAmount) },
    { label: 'Chờ đối soát', value: stats.pendingCount, icon: Clock, color: 'text-yellow-600 bg-yellow-50', extra: '' },
    { label: 'Tổng giá trị ròng', value: formatPrice(stats.netAmount), icon: ArrowRightLeft, color: `${stats.netAmount >= 0 ? 'text-red-600 bg-red-50' : 'text-green-600 bg-green-50'}`, extra: '' },
  ] : [];

  return (
    <div className="container mx-auto px-4 py-6">
      <AppBreadcrumb items={[{ label: 'Admin', href: '/admin' }, { label: 'Ghi nợ / Ghi có' }]} />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="flex items-center gap-2">
            <ReceiptText className="h-6 w-6" />
            Giám sát Ghi nợ / Ghi có toàn sàn
          </h1>
          <p className="text-muted-foreground">Theo dõi và đối soát công nợ giữa người mua và các nhà cung cấp</p>
        </div>
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
        searchPlaceholder="Tìm mã phiếu, NCC, hoá đơn, người mua..."
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
              <Button size="sm" variant="ghost" onClick={() => { setSelectedNote(note); setShowDetail(true); }}>
                <Eye className="h-4 w-4" />
              </Button>
              {note.status === 'Chờ đối soát' && (
                <Button size="sm" variant="ghost" className="text-orange-600" onClick={() => { setSelectedNote(note); setShowIntervene(true); }}>
                  <ShieldAlert className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
        />
      </div>

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
                  <span className="text-muted-foreground">NCC:</span>
                  <p className="font-medium">{selectedNote.sellerName}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Người mua:</span>
                  <p className="font-medium">{selectedNote.buyerName}</p>
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

      {/* ==================== DIALOG: Can thiệp ==================== */}
      <Dialog open={showIntervene} onOpenChange={setShowIntervene}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Admin can thiệp đối soát {selectedNote?.noteNumber}?</DialogTitle>
            <DialogDescription>
              Là Admin, bạn có quyền cưỡng chế đối soát phiếu này ngay lập tức.
            </DialogDescription>
          </DialogHeader>
          {selectedNote && (
            <div className="text-sm space-y-2">
              <p>Loại: <Badge variant={selectedNote.type === 'Ghi nợ' ? 'destructive' : 'default'}>{selectedNote.type}</Badge></p>
              <p>NCC: <strong>{selectedNote.sellerName}</strong></p>
              <p>Người mua: <strong>{selectedNote.buyerName}</strong></p>
              <p>Số tiền: <strong className={selectedNote.type === 'Ghi nợ' ? 'text-red-600' : 'text-green-600'}>
                {formatPrice(selectedNote.totalAmount)}
              </strong></p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowIntervene(false)}>Huỷ</Button>
            <Button onClick={handleIntervene} className="bg-orange-600 hover:bg-orange-700 gap-2 text-white">
              <ShieldAlert className="h-4 w-4" /> Cưỡng chế đối soát
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

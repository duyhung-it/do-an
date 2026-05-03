// ============================================================
// Trang Biên bản nhận hàng & QC — Buyer (Nhóm 31)
// Bao gồm: thống kê, bộ lọc, DataTable, chi tiết GRN,
//           xác nhận, báo cáo vấn đề, tạo GRN từ đơn đã giao
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';
import {
  ClipboardCheck, Clock, CheckCircle2, AlertTriangle, Star,
  Eye, Package, Truck, FileWarning,
} from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Textarea } from '../ui/textarea';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
  DialogDescription,
} from '../ui/dialog';
import { DataTable } from '../shared/DataTable';
import { StatusBadge } from '../shared/StatusBadge';
import { FilterBar } from '../shared/FilterBar';
import { AppBreadcrumb } from '../shared/AppBreadcrumb';
import { grnApi } from '../../services/grnApi';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';
import type {
  GoodsReceivedNote, GRNStats, GRNStatus,
  PaginationParams, SortParams, ActiveFilter, FilterConfig, ColumnConfig,
} from '../../types';

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });

const ALL_STATUSES: GRNStatus[] = ['Chờ xác nhận', 'Đã xác nhận', 'Có vấn đề', 'Đã đóng'];

const filterConfigs: FilterConfig[] = [
  {
    key: 'status', label: 'Trạng thái', type: 'select',
    options: ALL_STATUSES.map(s => ({ label: s, value: s })),
  },
  {
    key: 'qualityScore', label: 'Điểm CL', type: 'select',
    options: [1, 2, 3, 4, 5].map(n => ({ label: `${n} sao`, value: String(n) })),
  },
];

// Star rating display
function StarRating({ score, size = 'sm' }: { score: number; size?: 'sm' | 'lg' }) {
  const sz = size === 'sm' ? 'h-3.5 w-3.5' : 'h-5 w-5';
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          className={`${sz} ${i <= score ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
        />
      ))}
    </div>
  );
}

export function BuyerGRNListPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const buyerId = user?.id ?? 'user-001';

  // Data
  const [grnList, setGrnList] = useState<GoodsReceivedNote[]>([]);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState<GRNStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Pagination, sort, filter
  const [pagination, setPagination] = useState<PaginationParams>({ page: 1, pageSize: 10 });
  const [sort, setSort] = useState<SortParams>({ field: 'receivedAt', direction: 'desc' });
  const [filters, setFilters] = useState<ActiveFilter[]>([]);
  const [search, setSearch] = useState('');

  // Dialogs
  const [showDetail, setShowDetail] = useState(false);
  const [showIssueDialog, setShowIssueDialog] = useState(false);
  const [selectedGRN, setSelectedGRN] = useState<GoodsReceivedNote | null>(null);
  const [issueNote, setIssueNote] = useState('');

  // --- Fetch ---
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [res, statsRes] = await Promise.all([
        grnApi.getByBuyer(buyerId, pagination, sort, filters, search),
        grnApi.getStats(buyerId),
      ]);
      setGrnList(res.data);
      setTotal(res.total);
      setStats(statsRes);
    } finally {
      setLoading(false);
    }
  }, [buyerId, pagination, sort, filters, search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // --- Actions ---
  const handleConfirm = async (grn: GoodsReceivedNote) => {
    await grnApi.confirm(grn.id);
    toast.success(`Đã xác nhận ${grn.grnNumber}`);
    fetchData();
  };

  const handleFlagIssue = async () => {
    if (!selectedGRN) return;
    await grnApi.flagIssue(selectedGRN.id);
    toast.success(`Đã báo cáo vấn đề cho ${selectedGRN.grnNumber}`);
    setShowIssueDialog(false);
    setIssueNote('');
    setSelectedGRN(null);
    fetchData();
  };

  // --- Columns ---
  const columns: (ColumnConfig & { render?: (item: GoodsReceivedNote) => React.ReactNode })[] = [
    { key: 'grnNumber', label: 'Mã GRN', visible: true, sortable: true },
    { key: 'orderNumber', label: 'Đơn hàng', visible: true, sortable: true },
    { key: 'supplierName', label: 'NCC', visible: true, sortable: true },
    {
      key: 'items', label: 'Số SP', visible: true, sortable: false,
      render: (g) => {
        const totalDefect = g.items.reduce((s, i) => s + i.defectQty, 0);
        return (
          <span>
            {g.items.length} SP
            {totalDefect > 0 && (
              <Badge variant="destructive" className="ml-1 text-xs">{totalDefect} lỗi</Badge>
            )}
          </span>
        );
      },
    },
    {
      key: 'qualityScore', label: 'Chất lượng', visible: true, sortable: true,
      render: (g) => <StarRating score={g.qualityScore} />,
    },
    {
      key: 'status', label: 'Trạng thái', visible: true, sortable: true,
      render: (g) => <StatusBadge status={g.status} />,
    },
    {
      key: 'receivedAt', label: 'Ngày nhận', visible: true, sortable: true,
      render: (g) => <span>{formatDate(g.receivedAt)}</span>,
    },
  ];

  // --- Stats cards ---
  const statsCards = stats ? [
    { label: 'Tổng GRN', value: stats.total, icon: ClipboardCheck, color: 'text-blue-600 bg-blue-50' },
    { label: 'Chờ xác nhận', value: stats.pending, icon: Clock, color: 'text-yellow-600 bg-yellow-50' },
    { label: 'Đã xác nhận', value: stats.confirmed, icon: CheckCircle2, color: 'text-green-600 bg-green-50' },
    { label: 'Có vấn đề', value: stats.issues, icon: AlertTriangle, color: 'text-red-600 bg-red-50' },
    { label: 'CL trung bình', value: `${stats.avgQuality}/5`, icon: Star, color: 'text-purple-600 bg-purple-50' },
  ] : [];

  return (
    <div className="container mx-auto px-4 py-6">
      <AppBreadcrumb items={[{ label: 'Nhận hàng & QC' }]} />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="flex items-center gap-2">
            <ClipboardCheck className="h-6 w-6" />
            Biên bản nhận hàng
          </h1>
          <p className="text-muted-foreground">Quản lý kiểm tra chất lượng hàng nhận về</p>
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
                    <p className="text-2xl font-semibold">{card.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Filter */}
      <FilterBar
        filters={filterConfigs}
        activeFilters={filters}
        onFilterChange={f => { setFilters(f); setPagination(p => ({ ...p, page: 1 })); }}
        searchValue={search}
        onSearchChange={v => { setSearch(v); setPagination(p => ({ ...p, page: 1 })); }}
        searchPlaceholder="Tìm mã GRN, đơn hàng, NCC..."
      />

      {/* Table */}
      <div className="mt-4">
        <DataTable
          data={grnList}
          columns={columns}
          totalItems={total}
          pagination={pagination}
          sort={sort}
          onPaginationChange={setPagination}
          onSortChange={setSort}
          getId={g => g.id}
          loading={loading}
          renderActions={(grn) => (
            <div className="flex items-center gap-1">
              <Button size="sm" variant="ghost" onClick={() => navigate(`/grn/${grn.id}`)}>
                <Eye className="h-4 w-4" />
              </Button>
              {grn.status === 'Chờ xác nhận' && (
                <>
                  <Button size="sm" variant="ghost" className="text-green-600" onClick={() => handleConfirm(grn)}>
                    <CheckCircle2 className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" className="text-red-600" onClick={() => { setSelectedGRN(grn); setShowIssueDialog(true); }}>
                    <FileWarning className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          )}
        />
      </div>

      {/* ==================== DIALOG: Chi tiết GRN ==================== */}
      <Dialog open={showDetail} onOpenChange={setShowDetail}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chi tiết {selectedGRN?.grnNumber}</DialogTitle>
          </DialogHeader>
          {selectedGRN && (
            <div className="space-y-4">
              {/* Thông tin chung */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Đơn hàng:</span>
                  <p className="font-medium">{selectedGRN.orderNumber}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">NCC:</span>
                  <p className="font-medium">{selectedGRN.supplierName}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Ngày nhận:</span>
                  <p className="font-medium">{formatDate(selectedGRN.receivedAt)}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Trạng thái:</span>
                  <div className="mt-0.5"><StatusBadge status={selectedGRN.status} /></div>
                </div>
              </div>

              {/* Điểm chất lượng */}
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <span className="text-sm text-muted-foreground">Điểm chất lượng:</span>
                <StarRating score={selectedGRN.qualityScore} size="lg" />
                <span className="font-medium">{selectedGRN.qualityScore}/5</span>
              </div>

              {selectedGRN.overallNote && (
                <div>
                  <span className="text-sm text-muted-foreground">Ghi chú:</span>
                  <p className="text-sm mt-1">{selectedGRN.overallNote}</p>
                </div>
              )}

              <Separator />

              {/* Chi tiết sản phẩm */}
              <div>
                <p className="font-medium mb-2">Chi tiết sản phẩm ({selectedGRN.items.length})</p>
                <div className="space-y-2">
                  {selectedGRN.items.map((item, idx) => (
                    <div key={idx} className="p-3 bg-muted/30 rounded-lg text-sm">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium flex items-center gap-2">
                            <Package className="h-3.5 w-3.5" />
                            {item.productName}
                          </p>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2 text-xs">
                            <div>
                              <span className="text-muted-foreground">Đặt:</span>
                              <span className="ml-1 font-medium">{item.orderedQty} {item.unit}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Nhận:</span>
                              <span className="ml-1 font-medium">{item.receivedQty} {item.unit}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Chấp nhận:</span>
                              <span className="ml-1 font-medium text-green-600">{item.acceptedQty}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Lỗi:</span>
                              <span className={`ml-1 font-medium ${item.defectQty > 0 ? 'text-red-600' : ''}`}>
                                {item.defectQty}
                              </span>
                            </div>
                          </div>
                          {item.defectQty > 0 && (
                            <div className="mt-2 p-2 bg-red-50 rounded text-xs">
                              <span className="text-red-600 font-medium">Lý do: {item.defectReason}</span>
                              {item.defectNote && <p className="text-red-500 mt-0.5">{item.defectNote}</p>}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tổng kết */}
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg text-sm">
                <span>Tổng đặt: <strong>{selectedGRN.items.reduce((s, i) => s + i.orderedQty, 0)}</strong></span>
                <span>Tổng nhận: <strong>{selectedGRN.items.reduce((s, i) => s + i.receivedQty, 0)}</strong></span>
                <span className="text-green-600">Chấp nhận: <strong>{selectedGRN.items.reduce((s, i) => s + i.acceptedQty, 0)}</strong></span>
                <span className="text-red-600">Lỗi: <strong>{selectedGRN.items.reduce((s, i) => s + i.defectQty, 0)}</strong></span>
              </div>

              {/* Timeline */}
              {(selectedGRN.confirmedAt || selectedGRN.linkedReturnId) && (
                <>
                  <Separator />
                  <div>
                    <p className="font-medium mb-2">Lịch trình</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                        <Truck className="h-3 w-3" />
                        <span>Nhận hàng — {formatDate(selectedGRN.receivedAt)}</span>
                      </div>
                      {selectedGRN.confirmedAt && (
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-green-500" />
                          <CheckCircle2 className="h-3 w-3" />
                          <span>Xác nhận — {formatDate(selectedGRN.confirmedAt)}</span>
                        </div>
                      )}
                      {selectedGRN.linkedReturnId && (
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-red-500" />
                          <FileWarning className="h-3 w-3" />
                          <span>Yêu cầu trả hàng: {selectedGRN.linkedReturnId}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* Actions */}
              {selectedGRN.status === 'Chờ xác nhận' && (
                <div className="flex gap-2 justify-end">
                  <Button variant="destructive" onClick={() => { setShowDetail(false); setShowIssueDialog(true); }}>
                    <FileWarning className="h-4 w-4 mr-2" /> Báo cáo vấn đề
                  </Button>
                  <Button onClick={() => { handleConfirm(selectedGRN); setShowDetail(false); }}>
                    <CheckCircle2 className="h-4 w-4 mr-2" /> Xác nhận OK
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ==================== DIALOG: Báo cáo vấn đề ==================== */}
      <Dialog open={showIssueDialog} onOpenChange={setShowIssueDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Báo cáo vấn đề — {selectedGRN?.grnNumber}</DialogTitle>
            <DialogDescription>
              Mô tả vấn đề gặp phải để tạo yêu cầu trả hàng liên kết
            </DialogDescription>
          </DialogHeader>
          {selectedGRN && (
            <div className="space-y-3">
              <div className="text-sm">
                <p>Đơn hàng: <strong>{selectedGRN.orderNumber}</strong></p>
                <p>NCC: <strong>{selectedGRN.supplierName}</strong></p>
                <p className="text-red-600">
                  Tổng lỗi: {selectedGRN.items.reduce((s, i) => s + i.defectQty, 0)} sản phẩm
                </p>
              </div>
              <div>
                <label className="text-sm font-medium">Ghi chú bổ sung</label>
                <Textarea
                  value={issueNote}
                  onChange={e => setIssueNote(e.target.value)}
                  placeholder="Mô tả chi tiết vấn đề..."
                  rows={3}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowIssueDialog(false); setIssueNote(''); }}>
              Huỷ
            </Button>
            <Button variant="destructive" onClick={handleFlagIssue}>
              <FileWarning className="h-4 w-4 mr-2" /> Báo cáo & tạo yêu cầu trả hàng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
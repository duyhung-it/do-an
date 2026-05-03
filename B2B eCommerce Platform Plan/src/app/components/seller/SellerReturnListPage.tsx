// ============================================================
// Trang quản lý trả hàng — Seller (Nhóm 25)
// Bao gồm: thống kê, bộ lọc, DataTable, chấp nhận/từ chối, xử lý hoàn tiền
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';
import {
  RotateCcw, Clock, CheckCircle2, XCircle, Banknote,
  Eye, Check, X, Download, Search,
} from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Separator } from '../ui/separator';
import { Textarea } from '../ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { DataTable } from '../shared/DataTable';
import { StatusBadge } from '../shared/StatusBadge';
import { FilterBar } from '../shared/FilterBar';
import { returnApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';
import type { ReturnRequest, ReturnStats, ReturnStatus, PaginationParams, SortParams, ActiveFilter } from '../../types';

const formatPrice = (price: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

const ALL_STATUSES: ReturnStatus[] = ['Chờ duyệt', 'Đã duyệt', 'Từ chối', 'Đang xử lý', 'Đã hoàn tiền', 'Đã đóng'];

export function SellerReturnListPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const supplierId = user?.supplierId ?? 'sup-01';

  // Data
  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState<ReturnStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Pagination & Sort
  const [pagination, setPagination] = useState<PaginationParams>({ page: 1, pageSize: 10 });
  const [sort, setSort] = useState<SortParams>({ field: 'createdAt', direction: 'desc' });

  // Filters
  const [filters, setFilters] = useState<ActiveFilter[]>([]);
  const [searchText, setSearchText] = useState('');

  // Detail dialog
  const [selected, setSelected] = useState<ReturnRequest | null>(null);
  const [showDetail, setShowDetail] = useState(false);

  // Response dialog (approve/reject)
  const [showResponseDialog, setShowResponseDialog] = useState(false);
  const [responseAction, setResponseAction] = useState<'approve' | 'reject'>('approve');
  const [responseNote, setResponseNote] = useState('');
  const [responding, setResponding] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const activeFilters: ActiveFilter[] = [...filters];
      if (searchText) activeFilters.push({ key: 'search', value: searchText, label: `Tìm: ${searchText}` });
      const [res, s] = await Promise.all([
        returnApi.getBySeller(supplierId, pagination, sort, activeFilters),
        returnApi.getSellerStats(supplierId),
      ]);
      setReturns(res.data);
      setTotal(res.total);
      setStats(s);
    } finally {
      setLoading(false);
    }
  }, [supplierId, pagination, sort, filters, searchText]);

  useEffect(() => { loadData(); }, [loadData]);

  const openResponseDialog = (ret: ReturnRequest, action: 'approve' | 'reject') => {
    setSelected(ret);
    setResponseAction(action);
    setResponseNote('');
    setShowResponseDialog(true);
  };

  const handleResponse = async () => {
    if (!selected) return;
    if (responseAction === 'reject' && !responseNote.trim()) {
      toast.error('Vui lòng nhập lý do từ chối');
      return;
    }
    setResponding(true);
    try {
      if (responseAction === 'approve') {
        await returnApi.approve(selected.id, responseNote || 'Đồng ý trả hàng');
        toast.success('Đã chấp nhận yêu cầu trả hàng');
      } else {
        await returnApi.reject(selected.id, responseNote);
        toast.success('Đã từ chối yêu cầu trả hàng');
      }
      setShowResponseDialog(false);
      loadData();
    } catch {
      toast.error('Lỗi khi xử lý yêu cầu');
    } finally {
      setResponding(false);
    }
  };

  const handleProcessRefund = async (ret: ReturnRequest) => {
    if (!confirm(`Xác nhận hoàn tiền ${formatPrice(ret.refundAmount)} cho yêu cầu ${ret.id}?`)) return;
    try {
      await returnApi.processRefund(ret.id);
      toast.success('Đã xử lý hoàn tiền');
      loadData();
    } catch {
      toast.error('Lỗi khi xử lý hoàn tiền');
    }
  };

  const handleExportCSV = () => {
    const headers = ['Mã', 'Đơn hàng', 'Khách hàng', 'Công ty', 'Lý do', 'Trạng thái', 'Số tiền hoàn', 'Ngày tạo'];
    const rows = returns.map(r => [r.id, r.orderNumber, r.buyerName, r.buyerCompany, r.reason, r.status, r.refundAmount, r.createdAt]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tra-hang-seller-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Đã xuất CSV');
  };

  const statCards = stats ? [
    { label: 'Tổng yêu cầu', value: stats.total, icon: RotateCcw, color: 'text-blue-600 bg-blue-50' },
    { label: 'Chờ duyệt', value: stats.pending, icon: Clock, color: 'text-yellow-600 bg-yellow-50' },
    { label: 'Đã duyệt', value: stats.approved, icon: CheckCircle2, color: 'text-green-600 bg-green-50' },
    { label: 'Từ chối', value: stats.rejected, icon: XCircle, color: 'text-red-600 bg-red-50' },
  ] : [];

  const columns = [
    {
      key: 'orderNumber' as const,
      label: 'Đơn hàng',
      sortable: true,
      render: (r: ReturnRequest) => (
        <div>
          <p className="font-medium">{r.orderNumber}</p>
          <p className="text-muted-foreground text-xs">{r.id}</p>
        </div>
      ),
    },
    {
      key: 'buyerName' as const,
      label: 'Khách hàng',
      sortable: true,
      render: (r: ReturnRequest) => (
        <div>
          <p>{r.buyerName}</p>
          <p className="text-muted-foreground text-xs">{r.buyerCompany}</p>
        </div>
      ),
    },
    {
      key: 'reason' as const,
      label: 'Lý do',
      sortable: true,
    },
    {
      key: 'refundAmount' as const,
      label: 'Số tiền hoàn',
      sortable: true,
      render: (r: ReturnRequest) => <span className="text-primary">{formatPrice(r.refundAmount)}</span>,
    },
    {
      key: 'status' as const,
      label: 'Trạng thái',
      sortable: true,
      render: (r: ReturnRequest) => <StatusBadge status={r.status} />,
    },
    {
      key: 'createdAt' as const,
      label: 'Ngày tạo',
      sortable: true,
    },
  ];

  const filterConfigs = [
    {
      key: 'status',
      label: 'Trạng thái',
      type: 'select' as const,
      options: ALL_STATUSES.map(s => ({ label: s, value: s })),
    },
    {
      key: 'reason',
      label: 'Lý do',
      type: 'select' as const,
      options: ['Lỗi SP', 'Không đúng mô tả', 'Giao nhầm', 'Hư hỏng VC', 'Đổi ý', 'Khác'].map(r => ({ label: r, value: r })),
    },
  ];

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="flex items-center gap-2"><RotateCcw className="h-6 w-6" /> Quản lý trả hàng</h1>
          <p className="text-muted-foreground">Xử lý yêu cầu trả hàng từ khách hàng</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleExportCSV}>
          <Download className="mr-1 h-4 w-4" /> Xuất CSV
        </Button>
      </div>

      {/* Thẻ thống kê */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {statCards.map(card => (
            <Card key={card.label}>
              <CardContent className="flex items-center gap-3 p-4">
                <div className={`p-2 rounded-lg ${card.color}`}>
                  <card.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">{card.label}</p>
                  <p className="text-lg">{card.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Bộ lọc + Tìm kiếm */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm theo mã đơn, khách hàng, sản phẩm..."
            value={searchText}
            onChange={e => { setSearchText(e.target.value); setPagination(p => ({ ...p, page: 1 })); }}
            className="pl-9"
          />
        </div>
        <FilterBar
          filters={filterConfigs}
          activeFilters={filters}
          onFilterChange={(newFilters) => { setFilters(newFilters); setPagination(p => ({ ...p, page: 1 })); }}
        />
      </div>

      {/* Bảng dữ liệu */}
      <DataTable
        columns={columns}
        data={returns}
        loading={loading}
        totalItems={total}
        pagination={pagination}
        sort={sort}
        onPaginationChange={setPagination}
        onSortChange={setSort}
        getId={(r) => r.id}
        renderActions={(r) => (
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/seller/returns/${r.id}`)}
              title="Xem chi tiết"
            >
              <Eye className="h-4 w-4" />
            </Button>
            {r.status === 'Chờ duyệt' && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => openResponseDialog(r, 'approve')}
                  title="Chấp nhận"
                  className="text-green-600 hover:text-green-700"
                >
                  <Check className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => openResponseDialog(r, 'reject')}
                  title="Từ chối"
                  className="text-destructive hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </Button>
              </>
            )}
            {r.status === 'Đã duyệt' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleProcessRefund(r)}
                title="Xử lý hoàn tiền"
                className="text-teal-600 hover:text-teal-700"
              >
                <Banknote className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
        emptyMessage="Chưa có yêu cầu trả hàng nào"
      />

      {/* Dialog chi tiết */}
      <Dialog open={showDetail} onOpenChange={setShowDetail}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <RotateCcw className="h-5 w-5" /> Chi tiết yêu cầu trả hàng
            </DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{selected.id}</p>
                  <p className="text-muted-foreground">Đơn hàng: {selected.orderNumber}</p>
                </div>
                <StatusBadge status={selected.status} />
              </div>

              <Separator />

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <p className="text-muted-foreground text-xs">Khách hàng</p>
                  <p>{selected.buyerName}</p>
                  <p className="text-muted-foreground text-xs">{selected.buyerCompany}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Lý do</p>
                  <p>{selected.reason}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Phương thức hoàn tiền</p>
                  <p>{selected.refundMethod}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Số tiền hoàn</p>
                  <p className="text-primary">{formatPrice(selected.refundAmount)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Ngày tạo</p>
                  <p>{selected.createdAt}</p>
                </div>
                {selected.resolvedAt && (
                  <div>
                    <p className="text-muted-foreground text-xs">Ngày xử lý</p>
                    <p>{selected.resolvedAt}</p>
                  </div>
                )}
              </div>

              <Separator />

              <div>
                <p className="font-medium mb-2">Mô tả</p>
                <p className="text-muted-foreground">{selected.description}</p>
              </div>

              <div>
                <p className="font-medium mb-2">Sản phẩm trả ({selected.items.length})</p>
                <div className="space-y-2">
                  {selected.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-2 rounded border">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{item.productName}</p>
                        <p className="text-muted-foreground text-xs">
                          SL: {item.quantity} × {formatPrice(item.unitPrice)} = {formatPrice(item.quantity * item.unitPrice)}
                        </p>
                        <p className="text-muted-foreground text-xs">Lý do: {item.reason}</p>
                        {item.note && <p className="text-muted-foreground text-xs">Ghi chú: {item.note}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {selected.sellerNote && (
                <>
                  <Separator />
                  <div>
                    <p className="font-medium mb-1">Phản hồi của bạn</p>
                    <p className="text-muted-foreground p-3 rounded-lg bg-muted/50">{selected.sellerNote}</p>
                  </div>
                </>
              )}
            </div>
          )}
          <div className="flex justify-end gap-2 mt-4">
            {selected?.status === 'Chờ duyệt' && (
              <>
                <Button
                  variant="outline"
                  className="text-destructive"
                  onClick={() => { setShowDetail(false); openResponseDialog(selected, 'reject'); }}
                >
                  <X className="mr-1 h-4 w-4" /> Từ chối
                </Button>
                <Button
                  onClick={() => { setShowDetail(false); openResponseDialog(selected, 'approve'); }}
                >
                  <Check className="mr-1 h-4 w-4" /> Chấp nhận
                </Button>
              </>
            )}
            {selected?.status === 'Đã duyệt' && (
              <Button onClick={() => { setShowDetail(false); handleProcessRefund(selected); }}>
                <Banknote className="mr-1 h-4 w-4" /> Xử lý hoàn tiền
              </Button>
            )}
            <Button variant="outline" onClick={() => setShowDetail(false)}>Đóng</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog phản hồi (chấp nhận/từ chối) */}
      <Dialog open={showResponseDialog} onOpenChange={setShowResponseDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {responseAction === 'approve' ? 'Chấp nhận trả hàng' : 'Từ chối trả hàng'}
            </DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="font-medium">{selected.orderNumber} — {selected.buyerName}</p>
                <p className="text-muted-foreground text-xs">{selected.reason}: {selected.description}</p>
                <p className="text-primary mt-1">{formatPrice(selected.refundAmount)}</p>
              </div>
              <div>
                <Label className="mb-1 block">
                  {responseAction === 'approve' ? 'Ghi chú (tuỳ chọn)' : 'Lý do từ chối *'}
                </Label>
                <Textarea
                  placeholder={responseAction === 'approve' ? 'Nhập ghi chú...' : 'Nhập lý do từ chối...'}
                  value={responseNote}
                  onChange={e => setResponseNote(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          )}
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setShowResponseDialog(false)}>Huỷ</Button>
            <Button
              variant={responseAction === 'reject' ? 'destructive' : 'default'}
              onClick={handleResponse}
              disabled={responding}
            >
              {responding ? 'Đang xử lý...' : responseAction === 'approve' ? 'Chấp nhận' : 'Từ chối'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
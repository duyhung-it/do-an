// ============================================================
// Duyệt chứng chỉ doanh nghiệp — Admin xác minh NCC
// Stats, Filter, DataTable, Duyệt/Từ chối, Batch, Cảnh báo hết hạn
// ============================================================

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ShieldCheck, Clock, CheckCircle2, XCircle, AlertTriangle, Download,
  FileText, Eye, ThumbsUp, ThumbsDown,
} from 'lucide-react';
import { DataTable } from '../shared/DataTable';
import { FilterBar } from '../shared/FilterBar';
import { StatusBadge } from '../shared/StatusBadge';
import { AppBreadcrumb } from '../shared/AppBreadcrumb';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Separator } from '../ui/separator';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Checkbox } from '../ui/checkbox';
import { certificateApi } from '../../services/adminApi';
import { toast } from 'sonner';
import type {
  BusinessCertificate, VerificationStatus, PaginationParams, SortParams,
  ActiveFilter, FilterConfig, ColumnConfig,
} from '../../types';

// --- Cấu hình cột ---
const columns: ColumnConfig[] = [
  { key: 'supplierName', label: 'Nhà cung cấp', visible: true, sortable: true },
  { key: 'type', label: 'Loại chứng chỉ', visible: true, sortable: true },
  { key: 'name', label: 'Tên chứng chỉ', visible: true, sortable: true },
  { key: 'issuedBy', label: 'Cơ quan cấp', visible: true, sortable: true },
  { key: 'issuedDate', label: 'Ngày cấp', visible: true, sortable: true },
  { key: 'expiryDate', label: 'Hết hạn', visible: true, sortable: true },
  { key: 'status', label: 'Trạng thái', visible: true, sortable: true },
  { key: 'createdAt', label: 'Ngày nộp', visible: true, sortable: true },
];

// --- Cấu hình bộ lọc ---
const filterConfigs: FilterConfig[] = [
  { key: 'status', label: 'Trạng thái', type: 'select', options: [
    { label: 'Chưa xác minh', value: 'Chưa xác minh' },
    { label: 'Đang xem xét', value: 'Đang xem xét' },
    { label: 'Đã xác minh', value: 'Đã xác minh' },
    { label: 'Từ chối', value: 'Từ chối' },
    { label: 'Hết hạn', value: 'Hết hạn' },
  ]},
  { key: 'type', label: 'Loại chứng chỉ', type: 'select', options: [
    { label: 'Giấy phép kinh doanh', value: 'Giấy phép kinh doanh' },
    { label: 'ISO 9001', value: 'ISO 9001' },
    { label: 'ISO 14001', value: 'ISO 14001' },
    { label: 'HACCP', value: 'HACCP' },
    { label: 'CE', value: 'CE' },
    { label: 'FDA', value: 'FDA' },
    { label: 'Khác', value: 'Khác' },
  ]},
];

// --- Kiểm tra sắp hết hạn (30 ngày) ---
function isExpiringSoon(expiryDate: string): boolean {
  const today = new Date();
  const expiry = new Date(expiryDate);
  const diff = (expiry.getTime() - today.getTime()) / (1000 * 86400);
  return diff >= 0 && diff <= 30;
}

function isExpired(expiryDate: string): boolean {
  return new Date(expiryDate) < new Date();
}

export function AdminCertificateReview() {
  const [certs, setCerts] = useState<BusinessCertificate[]>([]);
  const [allCerts, setAllCerts] = useState<BusinessCertificate[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationParams>({ page: 1, pageSize: 10 });
  const [sort, setSort] = useState<SortParams>({ field: 'createdAt', direction: 'desc' });
  const [filters, setFilters] = useState<ActiveFilter[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCert, setSelectedCert] = useState<BusinessCertificate | null>(null);

  // --- Review form ---
  const [reviewNote, setReviewNote] = useState('');
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject' | ''>('');

  // --- Batch selection ---
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [allRes, pageRes] = await Promise.all([
        certificateApi.getPaginated({ page: 1, pageSize: 1000 }),
        certificateApi.getPaginated(pagination, sort.field ? sort : undefined, filters, search || undefined),
      ]);
      setAllCerts(allRes.data);
      setCerts(pageRes.data);
      setTotal(pageRes.total);
    } finally {
      setLoading(false);
    }
  }, [pagination, sort, filters, search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // --- Stats ---
  const stats = useMemo(() => {
    const pending = allCerts.filter(c => c.status === 'Chưa xác minh' || c.status === 'Đang xem xét').length;
    const verified = allCerts.filter(c => c.status === 'Đã xác minh').length;
    const rejected = allCerts.filter(c => c.status === 'Từ chối').length;
    const expiringSoon = allCerts.filter(c => c.status === 'Đã xác minh' && isExpiringSoon(c.expiryDate)).length;
    const expired = allCerts.filter(c => isExpired(c.expiryDate) && c.status !== 'Từ chối').length;
    return { total: allCerts.length, pending, verified, rejected, expiringSoon, expired };
  }, [allCerts]);

  // --- Duyệt/Từ chối ---
  const handleReview = async (id: string, status: VerificationStatus, note: string) => {
    try {
      const updated = await certificateApi.review(id, status, note);
      setCerts(prev => prev.map(c => c.id === id ? updated : c));
      setAllCerts(prev => prev.map(c => c.id === id ? updated : c));
      if (selectedCert?.id === id) setSelectedCert(updated);
      setReviewAction('');
      setReviewNote('');
      toast.success(status === 'Đã xác minh' ? 'Đã xác minh chứng chỉ' : 'Đã từ chối chứng chỉ');
    } catch {
      toast.error('Thao tác thất bại');
    }
  };

  // --- Batch actions ---
  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === certs.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(certs.map(c => c.id)));
    }
  };

  const handleBatchAction = async (status: VerificationStatus) => {
    if (selectedIds.size === 0) return;
    const note = status === 'Đã xác minh' ? 'Duyệt hàng loạt' : 'Từ chối hàng loạt';
    try {
      for (const id of selectedIds) {
        await certificateApi.review(id, status, note);
      }
      setSelectedIds(new Set());
      fetchData();
      toast.success(`Đã ${status === 'Đã xác minh' ? 'duyệt' : 'từ chối'} ${selectedIds.size} chứng chỉ`);
    } catch {
      toast.error('Thao tác thất bại');
    }
  };

  // --- Export CSV ---
  const handleExportCSV = () => {
    const headers = ['NCC', 'Loại', 'Tên', 'Cơ quan cấp', 'Ngày cấp', 'Hết hạn', 'Trạng thái', 'Ngày nộp'];
    const rows = allCerts.map(c => [
      c.supplierName, c.type, c.name, c.issuedBy,
      c.issuedDate, c.expiryDate, c.status, c.createdAt,
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.map(col => `"${col}"`).join(','))].join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chung-chi-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Đã xuất file CSV');
  };

  // --- List view ---
  const renderListItem = (cert: BusinessCertificate) => (
    <Card className={`hover:shadow-md transition-shadow ${
      isExpired(cert.expiryDate) && cert.status !== 'Từ chối' ? 'border-red-200' : ''
    } ${isExpiringSoon(cert.expiryDate) && cert.status === 'Đã xác minh' ? 'border-orange-200' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Checkbox
              checked={selectedIds.has(cert.id)}
              onCheckedChange={() => toggleSelect(cert.id)}
              onClick={e => e.stopPropagation()}
            />
            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{cert.name}</span>
          </div>
          <StatusBadge status={cert.status} />
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-muted-foreground">
          <span>{cert.supplierName}</span>
          <span>{cert.type}</span>
          <span>Cấp: {cert.issuedBy}</span>
          <span>HH: {cert.expiryDate}</span>
        </div>
        {isExpired(cert.expiryDate) && cert.status !== 'Từ chối' && (
          <Badge variant="outline" className="mt-2 text-red-600 border-red-200 bg-red-50">Đã hết hạn</Badge>
        )}
        {isExpiringSoon(cert.expiryDate) && cert.status === 'Đã xác minh' && (
          <Badge variant="outline" className="mt-2 text-orange-600 border-orange-200 bg-orange-50">Sắp hết hạn</Badge>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-4">
      <AppBreadcrumb items={[{ label: 'Quản trị', href: '/admin' }, { label: 'Chứng chỉ DN' }]} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1>Duyệt chứng chỉ doanh nghiệp</h1>
          <p className="text-muted-foreground">Xác minh chứng chỉ và giấy phép nhà cung cấp</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleExportCSV}>
          <Download className="mr-1 h-4 w-4" /> Xuất CSV
        </Button>
      </div>

      {/* --- Stats --- */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-muted-foreground">Tổng chứng chỉ</span>
              <FileText className="h-4 w-4 text-blue-500" />
            </div>
            <p className="text-xl">{stats.total}</p>
          </CardContent>
        </Card>
        <Card className={stats.pending > 0 ? 'border-yellow-200' : ''}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-muted-foreground">Chờ duyệt</span>
              <Clock className="h-4 w-4 text-yellow-500" />
            </div>
            <p className="text-xl text-yellow-600">{stats.pending}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-muted-foreground">Đã xác minh</span>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </div>
            <p className="text-xl text-green-600">{stats.verified}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-muted-foreground">Từ chối</span>
              <XCircle className="h-4 w-4 text-red-500" />
            </div>
            <p className="text-xl">{stats.rejected}</p>
          </CardContent>
        </Card>
        <Card className={stats.expiringSoon > 0 ? 'border-orange-200' : ''}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-muted-foreground">Sắp hết hạn</span>
              <AlertTriangle className="h-4 w-4 text-orange-500" />
            </div>
            <p className="text-xl text-orange-600">{stats.expiringSoon}</p>
          </CardContent>
        </Card>
      </div>

      {/* Cảnh báo */}
      {stats.expired > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-3 flex items-center gap-2 text-red-700">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>Có {stats.expired} chứng chỉ đã hết hạn cần xử lý.</span>
          </CardContent>
        </Card>
      )}

      {/* --- Batch actions --- */}
      {selectedIds.size > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-3 flex flex-wrap items-center gap-3">
            <span>Đã chọn <strong>{selectedIds.size}</strong> chứng chỉ</span>
            <Button size="sm" variant="outline" className="text-green-600" onClick={() => handleBatchAction('Đã xác minh')}>
              <ThumbsUp className="mr-1 h-3.5 w-3.5" /> Duyệt hàng loạt
            </Button>
            <Button size="sm" variant="outline" className="text-red-600" onClick={() => handleBatchAction('Từ chối')}>
              <ThumbsDown className="mr-1 h-3.5 w-3.5" /> Từ chối hàng loạt
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setSelectedIds(new Set())}>Bỏ chọn</Button>
          </CardContent>
        </Card>
      )}

      {/* --- Filter + Table --- */}
      <FilterBar
        filters={filterConfigs}
        activeFilters={filters}
        onFilterChange={f => { setFilters(f); setPagination(p => ({ ...p, page: 1 })); }}
        searchValue={search}
        onSearchChange={v => { setSearch(v); setPagination(p => ({ ...p, page: 1 })); }}
        searchPlaceholder="Tìm NCC, tên chứng chỉ, cơ quan cấp..."
      />

      <DataTable
        data={certs}
        columns={columns}
        totalItems={total}
        pagination={pagination}
        sort={sort}
        onPaginationChange={setPagination}
        onSortChange={setSort}
        onRowClick={c => { setSelectedCert(c); setReviewAction(''); setReviewNote(''); }}
        getId={c => c.id}
        renderListItem={renderListItem}
        loading={loading}
        viewModes={['table', 'list']}
        renderActions={(c: BusinessCertificate) => (
          <div className="flex items-center gap-1">
            <Checkbox
              checked={selectedIds.has(c.id)}
              onCheckedChange={() => toggleSelect(c.id)}
              onClick={e => e.stopPropagation()}
            />
            <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setSelectedCert(c); setReviewAction(''); }} title="Chi tiết">
              <Eye className="h-3.5 w-3.5" />
            </Button>
            {(c.status === 'Chưa xác minh' || c.status === 'Đang xem xét') && (
              <>
                <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleReview(c.id, 'Đã xác minh', 'Duyệt nhanh'); }}
                  title="Duyệt">
                  <ThumbsUp className="h-3.5 w-3.5 text-green-600" />
                </Button>
                <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleReview(c.id, 'Từ chối', 'Từ chối nhanh'); }}
                  title="Từ chối">
                  <ThumbsDown className="h-3.5 w-3.5 text-red-500" />
                </Button>
              </>
            )}
          </div>
        )}
      />

      {/* --- Chi tiết chứng chỉ --- */}
      <Dialog open={!!selectedCert} onOpenChange={() => setSelectedCert(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5" />
              Chi tiết chứng chỉ
            </DialogTitle>
          </DialogHeader>
          {selectedCert && (
            <div className="space-y-4">
              {/* Trạng thái + cảnh báo */}
              <div className="flex items-center justify-between">
                <StatusBadge status={selectedCert.status} />
                <div className="flex gap-1">
                  {isExpired(selectedCert.expiryDate) && (
                    <Badge variant="outline" className="text-red-600 border-red-200 bg-red-50">Đã hết hạn</Badge>
                  )}
                  {isExpiringSoon(selectedCert.expiryDate) && selectedCert.status === 'Đã xác minh' && (
                    <Badge variant="outline" className="text-orange-600 border-orange-200 bg-orange-50">Sắp hết hạn (30 ngày)</Badge>
                  )}
                </div>
              </div>

              <Separator />

              {/* Thông tin chứng chỉ */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-muted-foreground">Nhà cung cấp</p>
                  <p className="font-medium">{selectedCert.supplierName}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Loại chứng chỉ</p>
                  <p>{selectedCert.type}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-muted-foreground">Tên chứng chỉ</p>
                  <p className="font-medium">{selectedCert.name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Cơ quan cấp</p>
                  <p>{selectedCert.issuedBy}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Ngày cấp</p>
                  <p>{selectedCert.issuedDate}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Ngày hết hạn</p>
                  <p className={isExpired(selectedCert.expiryDate) ? 'text-red-600' : ''}>{selectedCert.expiryDate}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Ngày nộp</p>
                  <p>{selectedCert.createdAt}</p>
                </div>
              </div>

              {/* Xem tài liệu */}
              <div>
                <p className="text-muted-foreground mb-1">Tài liệu đính kèm</p>
                <Button variant="outline" size="sm" onClick={() => toast.info('Xem trước tài liệu (giả lập)')}>
                  <FileText className="mr-1 h-3.5 w-3.5" /> Xem tài liệu
                </Button>
              </div>

              {/* Lịch sử duyệt */}
              {selectedCert.reviewedBy && (
                <>
                  <Separator />
                  <div>
                    <p className="font-medium mb-2">Lịch sử duyệt</p>
                    <div className="space-y-1 text-muted-foreground">
                      <p>Người duyệt: {selectedCert.reviewedBy}</p>
                      <p>Ngày duyệt: {selectedCert.reviewedAt}</p>
                      {selectedCert.reviewNote && <p>Ghi chú: {selectedCert.reviewNote}</p>}
                    </div>
                  </div>
                </>
              )}

              {/* Form duyệt/từ chối */}
              {(selectedCert.status === 'Chưa xác minh' || selectedCert.status === 'Đang xem xét') && (
                <>
                  <Separator />
                  <div>
                    <p className="font-medium mb-3">Hành động</p>
                    {!reviewAction ? (
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => setReviewAction('approve')} className="bg-green-600 hover:bg-green-700">
                          <ThumbsUp className="mr-1 h-3.5 w-3.5" /> Xác minh
                        </Button>
                        <Button size="sm" variant="outline" className="text-red-600 border-red-300" onClick={() => setReviewAction('reject')}>
                          <ThumbsDown className="mr-1 h-3.5 w-3.5" /> Từ chối
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          {reviewAction === 'approve' ? (
                            <Badge className="bg-green-100 text-green-800">Xác minh</Badge>
                          ) : (
                            <Badge className="bg-red-100 text-red-800">Từ chối</Badge>
                          )}
                        </div>
                        <div>
                          <Label>Ghi chú {reviewAction === 'reject' ? '(bắt buộc)' : '(tuỳ chọn)'}</Label>
                          <Textarea
                            rows={3}
                            placeholder={reviewAction === 'reject' ? 'Lý do từ chối...' : 'Ghi chú thêm...'}
                            value={reviewNote}
                            onChange={e => setReviewNote(e.target.value)}
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => {
                            if (reviewAction === 'reject' && !reviewNote.trim()) {
                              toast.error('Vui lòng nhập lý do từ chối');
                              return;
                            }
                            const status: VerificationStatus = reviewAction === 'approve' ? 'Đã xác minh' : 'Từ chối';
                            handleReview(selectedCert.id, status, reviewNote);
                          }}>
                            Xác nhận
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => { setReviewAction(''); setReviewNote(''); }}>
                            Huỷ
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

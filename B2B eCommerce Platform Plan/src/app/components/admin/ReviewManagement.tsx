// ============================================================
// Quản lý đánh giá Admin — Nâng cấp Nhóm 13B (Đợt 7)
// Phản hồi admin, thống kê sao, CSV, cảnh báo, auto-flag
// ============================================================

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Star, CheckCircle2, EyeOff, Trash2, MessageSquare, Clock,
  Download, AlertTriangle, Reply,
} from 'lucide-react';
import { DataTable } from '../shared/DataTable';
import { FilterBar } from '../shared/FilterBar';
import { StatusBadge } from '../shared/StatusBadge';
import { AppBreadcrumb } from '../shared/AppBreadcrumb';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Checkbox } from '../ui/checkbox';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '../ui/alert-dialog';
import { reviewApi } from '../../services/api';
import { toast } from 'sonner';
import type { Review, PaginationParams, SortParams, ActiveFilter, FilterConfig, ColumnConfig } from '../../types';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';

const STAR_COLORS = ['#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e'];

const columns: ColumnConfig[] = [
  { key: 'productName', label: 'Sản phẩm', visible: true, sortable: true },
  { key: 'userName', label: 'Người đánh giá', visible: true, sortable: true },
  { key: 'rating', label: 'Sao', visible: true, sortable: true },
  { key: 'comment', label: 'Nhận xét', visible: true, sortable: false },
  { key: 'status', label: 'Trạng thái', visible: true, sortable: true, editable: true, type: 'select',
    options: ['Hiển thị', 'Ẩn', 'Chờ duyệt'] },
  { key: 'createdAt', label: 'Ngày tạo', visible: true, sortable: true },
];

const filterConfigs: FilterConfig[] = [
  { key: 'status', label: 'Trạng thái', type: 'select', options: [
    { label: 'Hiển thị', value: 'Hiển thị' },
    { label: 'Ẩn', value: 'Ẩn' },
    { label: 'Chờ duyệt', value: 'Chờ duyệt' },
  ]},
  { key: 'rating', label: 'Đánh giá', type: 'select', options: [
    { label: '5 sao', value: '5' },
    { label: '4 sao', value: '4' },
    { label: '3 sao', value: '3' },
    { label: '1-2 sao', value: '1' },
  ]},
];

function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={`h-3.5 w-3.5 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
      ))}
    </div>
  );
}

export function ReviewManagement() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [allReviews, setAllReviews] = useState<Review[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationParams>({ page: 1, pageSize: 10 });
  const [sort, setSort] = useState<SortParams>({ field: 'createdAt', direction: 'desc' });
  const [filters, setFilters] = useState<ActiveFilter[]>([]);
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [allRes, pageRes] = await Promise.all([
        reviewApi.getPaginated({ page: 1, pageSize: 1000 }),
        reviewApi.getPaginated(pagination, sort.field ? sort : undefined, filters, search),
      ]);
      setAllReviews(allRes.data);
      setReviews(pageRes.data);
      setTotal(pageRes.total);
    } finally {
      setLoading(false);
    }
  }, [pagination, sort, filters, search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Stats
  const stats = useMemo(() => ({
    total: allReviews.length,
    pending: allReviews.filter(r => r.status === 'Chờ duyệt').length,
    visible: allReviews.filter(r => r.status === 'Hiển thị').length,
    avgRating: allReviews.length > 0
      ? Math.round((allReviews.reduce((s, r) => s + r.rating, 0) / allReviews.length) * 10) / 10
      : 0,
    oneStar: allReviews.filter(r => r.rating === 1 && r.status !== 'Ẩn').length,
  }), [allReviews]);

  // Star distribution
  const starDistribution = useMemo(() => {
    const dist = [0, 0, 0, 0, 0];
    for (const r of allReviews) dist[r.rating - 1]++;
    return dist.map((count, i) => ({ star: `${i + 1}★`, count }));
  }, [allReviews]);

  // Handlers
  const handleInlineEdit = async (id: string, field: string, value: unknown) => {
    if (field === 'status') {
      await reviewApi.updateStatus(id, value as Review['status']);
      setReviews(prev => prev.map(r => r.id === id ? { ...r, status: value as Review['status'] } : r));
      toast.success('Đã cập nhật trạng thái');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await reviewApi.delete(deleteId);
    setReviews(prev => prev.filter(r => r.id !== deleteId));
    setTotal(prev => prev - 1);
    setDeleteId(null);
    setSelectedIds(prev => prev.filter(id => id !== deleteId));
    toast.success('Đã xoá đánh giá');
  };

  const handleBatchAction = async (action: 'approve' | 'hide' | 'delete') => {
    if (action === 'delete') {
      for (const id of selectedIds) await reviewApi.delete(id);
      setReviews(prev => prev.filter(r => !selectedIds.includes(r.id)));
      setTotal(prev => prev - selectedIds.length);
      toast.success(`Đã xoá ${selectedIds.length} đánh giá`);
    } else {
      const status = action === 'approve' ? 'Hiển thị' : 'Ẩn';
      for (const id of selectedIds) await reviewApi.updateStatus(id, status);
      setReviews(prev => prev.map(r => selectedIds.includes(r.id) ? { ...r, status } : r));
      toast.success(`Đã ${action === 'approve' ? 'duyệt' : 'ẩn'} ${selectedIds.length} đánh giá`);
    }
    setSelectedIds([]);
  };

  const handleReply = () => {
    if (!replyText.trim()) { toast.error('Vui lòng nhập phản hồi'); return; }
    toast.success('Đã gửi phản hồi từ Ban QT (giả lập)');
    setReplyText('');
  };

  // CSV Export
  const handleExportCSV = () => {
    const headers = ['Sản phẩm', 'Người đánh giá', 'Sao', 'Nhận xét', 'Trạng thái', 'Ngày tạo'];
    const rows = allReviews.map(r => [r.productName ?? '', r.userName, r.rating.toString(), r.comment, r.status, r.createdAt]);
    const csvContent = [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `danh-gia-${new Date().toISOString().slice(0, 10)}.csv`; a.click();
    URL.revokeObjectURL(url);
    toast.success('Đã xuất file CSV');
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const renderListItem = (review: Review) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Checkbox checked={selectedIds.includes(review.id)} onCheckedChange={() => toggleSelect(review.id)} onClick={(e: React.MouseEvent) => e.stopPropagation()} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">{review.userName}</span>
                <StarDisplay rating={review.rating} />
              </div>
              <StatusBadge status={review.status} />
            </div>
            <p className="text-muted-foreground mb-1">Sản phẩm: {review.productName ?? review.productId}</p>
            <p className="line-clamp-2">{review.comment}</p>
            <p className="text-muted-foreground mt-1">{review.createdAt}</p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={e => { e.stopPropagation(); setSelectedReview(review); }} title="Chi tiết">
              <MessageSquare className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={e => { e.stopPropagation(); setDeleteId(review.id); }} title="Xoá">
              <Trash2 className="h-3.5 w-3.5 text-destructive" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-4">
      <AppBreadcrumb items={[{ label: 'Quản trị', href: '/admin' }, { label: 'Đánh giá' }]} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1>Quản lý đánh giá</h1>
          <p className="text-muted-foreground">Duyệt, ẩn hoặc xoá đánh giá từ người dùng</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExportCSV}>
            <Download className="mr-1 h-4 w-4" /> Xuất CSV
          </Button>
          {selectedIds.length > 0 && (
            <>
              <Badge variant="secondary">{selectedIds.length} đã chọn</Badge>
              <Button size="sm" onClick={() => handleBatchAction('approve')}><CheckCircle2 className="mr-1 h-4 w-4" /> Duyệt</Button>
              <Button variant="outline" size="sm" onClick={() => handleBatchAction('hide')}><EyeOff className="mr-1 h-4 w-4" /> Ẩn</Button>
              <Button variant="destructive" size="sm" onClick={() => handleBatchAction('delete')}><Trash2 className="mr-1 h-4 w-4" /> Xoá</Button>
            </>
          )}
        </div>
      </div>

      {/* Cảnh báo */}
      {stats.oneStar > 0 && (
        <Card className="border-red-200 bg-red-50/50">
          <CardContent className="p-3 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600 shrink-0" />
            <span className="text-red-800">{stats.oneStar} đánh giá 1 sao chưa xử lý</span>
          </CardContent>
        </Card>
      )}

      {/* Stats + Star distribution */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Card><CardContent className="p-4">
          <div className="flex items-center justify-between mb-1"><span className="text-muted-foreground">Tổng</span><MessageSquare className="h-4 w-4 text-blue-500" /></div>
          <p className="text-xl">{stats.total}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <div className="flex items-center justify-between mb-1"><span className="text-muted-foreground">Chờ duyệt</span><Clock className="h-4 w-4 text-yellow-500" /></div>
          <p className="text-xl">{stats.pending}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <div className="flex items-center justify-between mb-1"><span className="text-muted-foreground">Hiển thị</span><CheckCircle2 className="h-4 w-4 text-green-500" /></div>
          <p className="text-xl">{stats.visible}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <div className="flex items-center justify-between mb-1"><span className="text-muted-foreground">TB sao</span><Star className="h-4 w-4 fill-yellow-400 text-yellow-400" /></div>
          <p className="text-xl">{stats.avgRating}</p>
        </CardContent></Card>
        <Card><CardContent className="p-3">
          <p className="text-muted-foreground mb-1">Phân bổ sao</p>
          <div className="h-16">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={starDistribution}>
                <XAxis key="xaxis-star" dataKey="star" tick={{ fontSize: 10 }} />
                <YAxis key="yaxis-star" hide />
                <Tooltip key="tooltip-star" />
                <Bar key="bar-star" dataKey="count" radius={[2, 2, 0, 0]}>
                  {starDistribution.map((entry, i) => <Cell key={`cell-star-${i}-${entry.star}`} fill={STAR_COLORS[i]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent></Card>
      </div>

      <FilterBar
        filters={filterConfigs}
        activeFilters={filters}
        onFilterChange={f => { setFilters(f); setPagination(p => ({ ...p, page: 1 })); }}
        searchValue={search}
        onSearchChange={v => { setSearch(v); setPagination(p => ({ ...p, page: 1 })); }}
        searchPlaceholder="Tìm theo tên người dùng, sản phẩm, nhận xét..."
      />

      <DataTable
        data={reviews}
        columns={columns}
        totalItems={total}
        pagination={pagination}
        sort={sort}
        onPaginationChange={setPagination}
        onSortChange={setSort}
        onInlineEdit={handleInlineEdit}
        onRowClick={r => setSelectedReview(r)}
        getId={r => r.id}
        renderListItem={renderListItem}
        loading={loading}
        viewModes={['table', 'list']}
        renderActions={r => (
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setDeleteId(r.id)}>
              <Trash2 className="h-3.5 w-3.5 text-destructive" />
            </Button>
          </div>
        )}
      />

      {/* Chi tiết đánh giá + Phản hồi */}
      <Dialog open={!!selectedReview} onOpenChange={() => { setSelectedReview(null); setReplyText(''); }}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Chi tiết đánh giá</DialogTitle></DialogHeader>
          {selectedReview && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{selectedReview.userName}</span>
                  <StarDisplay rating={selectedReview.rating} />
                </div>
                <StatusBadge status={selectedReview.status} />
              </div>
              <div><p className="text-muted-foreground">Sản phẩm</p><p>{selectedReview.productName ?? selectedReview.productId}</p></div>
              <div><p className="text-muted-foreground">Nhận xét</p><p className="whitespace-pre-wrap">{selectedReview.comment}</p></div>
              <div><p className="text-muted-foreground">Ngày đánh giá</p><p>{selectedReview.createdAt}</p></div>

              {/* Admin reply */}
              <div className="border-t pt-3 space-y-2">
                <Label className="flex items-center gap-1"><Reply className="h-3.5 w-3.5" /> Phản hồi từ Ban QT</Label>
                <Textarea value={replyText} onChange={e => setReplyText(e.target.value)} placeholder="Nhập phản hồi công khai..." rows={3} />
                <Button size="sm" onClick={handleReply} disabled={!replyText.trim()}>
                  <Reply className="mr-1 h-3.5 w-3.5" /> Gửi phản hồi
                </Button>
              </div>

              <div className="flex gap-2 pt-2">
                {selectedReview.status !== 'Hiển thị' && (
                  <Button size="sm" onClick={async () => {
                    await reviewApi.updateStatus(selectedReview.id, 'Hiển thị');
                    setReviews(prev => prev.map(r => r.id === selectedReview.id ? { ...r, status: 'Hiển thị' } : r));
                    setSelectedReview(prev => prev ? { ...prev, status: 'Hiển thị' } : null);
                    toast.success('Đã duyệt đánh giá');
                  }}>
                    <CheckCircle2 className="mr-1 h-4 w-4" /> Duyệt
                  </Button>
                )}
                {selectedReview.status !== 'Ẩn' && (
                  <Button variant="outline" size="sm" onClick={async () => {
                    await reviewApi.updateStatus(selectedReview.id, 'Ẩn');
                    setReviews(prev => prev.map(r => r.id === selectedReview.id ? { ...r, status: 'Ẩn' } : r));
                    setSelectedReview(prev => prev ? { ...prev, status: 'Ẩn' } : null);
                    toast.success('Đã ẩn đánh giá');
                  }}>
                    <EyeOff className="mr-1 h-4 w-4" /> Ẩn
                  </Button>
                )}
                <Button variant="destructive" size="sm" onClick={() => { setDeleteId(selectedReview.id); setSelectedReview(null); }}>
                  <Trash2 className="mr-1 h-4 w-4" /> Xoá
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Xác nhận xoá */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xoá đánh giá?</AlertDialogTitle>
            <AlertDialogDescription>Hành động này không thể hoàn tác. Đánh giá sẽ bị xoá vĩnh viễn.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Huỷ</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Xoá</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
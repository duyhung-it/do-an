// ============================================================
// Quản lý đánh giá Seller — DataTable + Card view + Filter
// ============================================================

import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router';
import {
  Star, MessageSquare, Download,
} from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { AppBreadcrumb } from '../shared/AppBreadcrumb';
import { StatsCard } from '../shared/StatsCard';
import { DataTable } from '../shared/DataTable';
import { ViewToggle } from '../shared/ViewToggle';
import {
  StarDistributionBar, ReviewFilterBar, ReviewItem,
} from '../shared/ReviewComponents';
import { reviewApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import type { Review, PaginationParams, SortParams, ColumnConfig, ViewMode } from '../../types';
import { toast } from 'sonner';

const columns: ColumnConfig[] = [
  {
    key: 'productName', label: 'Sản phẩm', sortable: true,
    render: (_, row) => {
      const r = row as Review;
      return (
        <Link to={`/seller/products/${r.productId}`} className="text-primary hover:underline font-medium">
          {r.productName ?? 'Sản phẩm'}
        </Link>
      );
    },
  },
  { key: 'userName', label: 'Người đánh giá', sortable: true },
  {
    key: 'rating', label: 'Sao', sortable: true,
    render: (v) => (
      <div className="flex items-center gap-1">
        <Star className={`h-4 w-4 ${(v as number) >= 4 ? 'fill-yellow-400 text-yellow-400' : (v as number) >= 3 ? 'fill-amber-400 text-amber-400' : 'fill-red-400 text-red-400'}`} />
        <span>{v as number}</span>
      </div>
    ),
  },
  {
    key: 'comment', label: 'Nội dung',
    render: (v) => <span className="text-muted-foreground text-xs line-clamp-2 max-w-[200px]">{v as string}</span>,
  },
  { key: 'createdAt', label: 'Ngày', sortable: true },
  {
    key: 'sellerReply', label: 'Phản hồi',
    render: (v) => v
      ? <Badge variant="secondary" className="text-xs">Đã phản hồi</Badge>
      : <Badge variant="destructive" className="text-xs gap-1"><MessageSquare className="h-3 w-3" /> Cần PH</Badge>,
  },
  {
    key: 'helpfulCount', label: 'Hữu ích', sortable: true,
    render: (v) => <span className="text-muted-foreground">{v as number}</span>,
  },
];

export function SellerReviewsPage() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('all');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [pagination, setPagination] = useState<PaginationParams>({ page: 1, pageSize: 10 });
  const [sort, setSort] = useState<SortParams>({});

  // Filters
  const [starFilter, setStarFilter] = useState(0);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [hasImages, setHasImages] = useState(false);
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    if (!user) return;
    reviewApi.getRecentBySeller(user.id, 100).then(data => {
      setReviews(data);
      setLoading(false);
    });
  }, [user]);

  const handleSellerReply = async (reviewId: string, reply: string) => {
    try {
      const updated = await reviewApi.addSellerReply(reviewId, reply);
      setReviews(prev => prev.map(r => r.id === updated.id ? updated : r));
      toast.success('Đã gửi phản hồi');
    } catch {
      toast.error('Lỗi khi gửi phản hồi');
    }
  };

  const handleHelpful = async (id: string) => {
    try {
      const updated = await reviewApi.toggleHelpful(id);
      setReviews(prev => prev.map(r => r.id === updated.id ? updated : r));
    } catch {
      toast.error('Lỗi');
    }
  };

  // Apply all filters
  const filtered = useMemo(() => {
    let data = [...reviews];
    if (starFilter > 0) data = data.filter(r => r.rating === starFilter);
    if (verifiedOnly) data = data.filter(r => r.isVerifiedPurchase);
    if (hasImages) data = data.filter(r => r.images && r.images.length > 0);
    if (tab === 'unreplied') data = data.filter(r => !r.sellerReply);
    if (tab === 'replied') data = data.filter(r => !!r.sellerReply);
    if (tab === 'negative') data = data.filter(r => r.rating <= 2);

    // Sort for card view
    if (sortBy === 'newest') data.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    if (sortBy === 'oldest') data.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    if (sortBy === 'highest') data.sort((a, b) => b.rating - a.rating);
    if (sortBy === 'lowest') data.sort((a, b) => a.rating - b.rating);
    if (sortBy === 'helpful') data.sort((a, b) => b.helpfulCount - a.helpfulCount);

    return data;
  }, [reviews, starFilter, verifiedOnly, hasImages, tab, sortBy]);

  // For DataTable: apply table sort + paginate
  const { pageData, totalItems } = useMemo(() => {
    let data = [...filtered];

    // DataTable sort (overrides sortBy for table view)
    if (viewMode === 'table' && sort.field) {
      data.sort((a, b) => {
        const va = (a as unknown as Record<string, unknown>)[sort.field!];
        const vb = (b as unknown as Record<string, unknown>)[sort.field!];
        let cmp = 0;
        if (typeof va === 'number' && typeof vb === 'number') cmp = va - vb;
        else cmp = String(va ?? '').localeCompare(String(vb ?? ''));
        return sort.direction === 'desc' ? -cmp : cmp;
      });
    }

    const total = data.length;
    const start = (pagination.page - 1) * pagination.pageSize;
    return { pageData: data.slice(start, start + pagination.pageSize), totalItems: total };
  }, [filtered, sort, pagination, viewMode]);

  // Stats
  const totalReviews = reviews.length;
  const avgRating = totalReviews > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / totalReviews : 0;
  const unrepliedCount = reviews.filter(r => !r.sellerReply).length;
  const negativeCount = reviews.filter(r => r.rating <= 2).length;
  const repliedCount = reviews.filter(r => !!r.sellerReply).length;

  const distribution = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews.filter(r => r.rating === star).length,
  }));

  const exportCSV = () => {
    const header = 'Sản phẩm,Người đánh giá,Sao,Tiêu đề,Nội dung,Ngày,Phản hồi\n';
    const rows = reviews.map(r =>
      `"${r.productName ?? ''}","${r.userName}",${r.rating},"${r.title ?? ''}","${r.comment}","${r.createdAt}","${r.sellerReply ?? ''}"`
    ).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'danh-gia-san-pham.csv';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Đã xuất CSV');
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <AppBreadcrumb items={[
        { label: 'Tổng quan', href: '/seller' },
        { label: 'Đánh giá sản phẩm' },
      ]} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2">
            <Star className="h-6 w-6 text-yellow-400" /> Đánh giá sản phẩm
          </h1>
          <p className="text-muted-foreground mt-1">Xem và phản hồi đánh giá từ người mua</p>
        </div>
        <div className="flex items-center gap-2">
          <ViewToggle viewMode={viewMode} onChange={setViewMode} modes={['table', 'list']} />
          <Button variant="outline" onClick={exportCSV}>
            <Download className="mr-2 h-4 w-4" /> CSV
          </Button>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatsCard title="Tổng đánh giá" value={totalReviews} icon={MessageSquare} variant="primary" />
        <Card>
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-muted-foreground mb-1 truncate">Sao trung bình</p>
                <div className="flex items-center gap-1">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <span className="text-2xl" style={{ fontFamily: 'var(--font-heading)' }}>
                    {avgRating.toFixed(1)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <StatsCard title="Chưa phản hồi" value={unrepliedCount} icon={MessageSquare} variant="warning" />
        <StatsCard title="Tiêu cực (≤2⭐)" value={negativeCount} icon={Star} variant="danger" />
      </div>

      {/* Star distribution */}
      <StarDistributionBar distribution={distribution} total={totalReviews} avgRating={avgRating} />

      {/* P5.27: Sentiment analysis mock + Response rate */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-muted-foreground mb-3">Phân tích cảm xúc</p>
            <div className="space-y-2">
              {[
                { label: 'Tích cực', pct: totalReviews > 0 ? Math.round(reviews.filter(r => r.rating >= 4).length / totalReviews * 100) : 0, color: 'bg-green-500' },
                { label: 'Trung tính', pct: totalReviews > 0 ? Math.round(reviews.filter(r => r.rating === 3).length / totalReviews * 100) : 0, color: 'bg-amber-500' },
                { label: 'Tiêu cực', pct: totalReviews > 0 ? Math.round(reviews.filter(r => r.rating <= 2).length / totalReviews * 100) : 0, color: 'bg-red-500' },
              ].map(s => (
                <div key={s.label} className="flex items-center gap-3">
                  <span className="w-20 text-sm">{s.label}</span>
                  <div className="flex-1 h-3 rounded-full bg-muted overflow-hidden">
                    <div className={`h-full rounded-full ${s.color} transition-all`} style={{ width: `${s.pct}%` }} />
                  </div>
                  <span className="w-10 text-sm text-right">{s.pct}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-muted-foreground mb-3">Tỷ lệ phản hồi</p>
            <div className="flex items-center gap-4">
              <div className="relative h-20 w-20 shrink-0">
                <svg className="h-20 w-20 -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="15.5" fill="none" stroke="currentColor" className="text-muted" strokeWidth="3" />
                  <circle cx="18" cy="18" r="15.5" fill="none" stroke="currentColor" className="text-primary" strokeWidth="3"
                    strokeDasharray={`${totalReviews > 0 ? Math.round(repliedCount / totalReviews * 97.4) : 0} 97.4`}
                    strokeLinecap="round"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-sm">
                  {totalReviews > 0 ? Math.round(repliedCount / totalReviews * 100) : 0}%
                </span>
              </div>
              <div className="space-y-1 text-sm">
                <p>Đã phản hồi: <span className="font-medium">{repliedCount}</span></p>
                <p>Chưa phản hồi: <span className="font-medium text-amber-600">{unrepliedCount}</span></p>
                <p className="text-muted-foreground">TB phản hồi: ~2.5 giờ</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs + Filters */}
      <Tabs value={tab} onValueChange={v => { setTab(v); setPagination(p => ({ ...p, page: 1 })); }}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <TabsList>
            <TabsTrigger value="all">Tất cả ({totalReviews})</TabsTrigger>
            <TabsTrigger value="unreplied">Chưa PH ({unrepliedCount})</TabsTrigger>
            <TabsTrigger value="replied">Đã PH ({repliedCount})</TabsTrigger>
            <TabsTrigger value="negative">Tiêu cực ({negativeCount})</TabsTrigger>
          </TabsList>
        </div>

        {viewMode === 'list' && (
          <div className="mt-4 mb-4">
            <ReviewFilterBar
              starFilter={starFilter}
              onStarFilterChange={setStarFilter}
              verifiedOnly={verifiedOnly}
              onVerifiedChange={setVerifiedOnly}
              hasImages={hasImages}
              onHasImagesChange={setHasImages}
              sortBy={sortBy}
              onSortChange={setSortBy}
            />
          </div>
        )}

        <TabsContent value={tab} className="mt-0">
          {viewMode === 'table' ? (
            <DataTable<Review>
              data={pageData}
              columns={columns}
              totalItems={totalItems}
              pagination={pagination}
              sort={sort}
              onPaginationChange={setPagination}
              onSortChange={setSort}
              getId={r => r.id}
              loading={loading}
              renderActions={r => (
                <div className="flex items-center gap-1">
                  {!r.sellerReply && (
                    <Badge variant="outline" className="text-xs cursor-pointer" onClick={() => {
                      // Switch to list view to reply
                      setViewMode('list');
                    }}>
                      Phản hồi
                    </Badge>
                  )}
                </div>
              )}
            />
          ) : loading ? (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                Đang tải...
              </CardContent>
            </Card>
          ) : pageData.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-3 text-muted-foreground/30" />
                <p>Không có đánh giá phù hợp</p>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="space-y-4">
                {pageData.map(review => (
                  <Card key={review.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Link
                          to={`/seller/products/${review.productId}`}
                          className="text-primary hover:underline font-medium"
                        >
                          {review.productName ?? 'Sản phẩm'}
                        </Link>
                        {review.orderNumber && (
                          <Badge variant="outline">Đơn {review.orderNumber}</Badge>
                        )}
                        {!review.sellerReply && (
                          <Badge variant="destructive" className="gap-1">
                            <MessageSquare className="h-3 w-3" /> Cần phản hồi
                          </Badge>
                        )}
                      </div>
                      <ReviewItem
                        review={review}
                        isSellerView
                        onHelpful={handleHelpful}
                        onSellerReply={handleSellerReply}
                      />
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Pagination for card view */}
              <div className="flex items-center justify-between pt-4">
                <p className="text-sm text-muted-foreground">
                  Hiển thị {pageData.length} / {totalItems} đánh giá
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline" size="sm"
                    disabled={pagination.page <= 1}
                    onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
                  >
                    Trước
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Trang {pagination.page} / {Math.ceil(totalItems / pagination.pageSize) || 1}
                  </span>
                  <Button
                    variant="outline" size="sm"
                    disabled={pagination.page >= Math.ceil(totalItems / pagination.pageSize)}
                    onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
                  >
                    Sau
                  </Button>
                </div>
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
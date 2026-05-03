// ============================================================
// Quản lý đánh giá — Buyer (P3 Đợt 8: P3.21–P3.24)
// Star distribution, filter by stars, review card, my reviews
// ============================================================

import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router';
import {
  Star, Pencil, Trash2, MessageSquare, Package, Building2,
  Image, ThumbsUp, Filter, Camera,
} from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { AppBreadcrumb } from '../shared/AppBreadcrumb';
import { IconWrapper } from '../shared/IconWrapper';
import { AnimatedNumber } from '../shared/AnimatedNumber';
import {
  StarDisplay, ReviewItem, WriteReviewDialog,
} from '../shared/ReviewComponents';
import { reviewApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import type { Review } from '../../types';
import { toast } from 'sonner';

// ─── P3.21: Star Distribution Chart ─────────────────────
function StarDistribution({
  reviews,
  selectedStar,
  onSelectStar,
}: {
  reviews: Review[];
  selectedStar: number | null;
  onSelectStar: (star: number | null) => void;
}) {
  const total = reviews.length;
  const avgRating = total > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / total : 0;

  const distribution = useMemo(() => {
    const counts = [0, 0, 0, 0, 0]; // 1-5 stars
    reviews.forEach(r => { if (r.rating >= 1 && r.rating <= 5) counts[r.rating - 1]++; });
    return [5, 4, 3, 2, 1].map(star => ({
      star,
      count: counts[star - 1],
      pct: total > 0 ? (counts[star - 1] / total) * 100 : 0,
    }));
  }, [reviews, total]);

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex flex-col sm:flex-row gap-6">
          {/* P3.21: Average score */}
          <div className="flex flex-col items-center justify-center gap-1 min-w-[120px]">
            <p className="text-4xl text-primary" style={{ fontFamily: 'var(--font-heading)' }}>
              {avgRating.toFixed(1)}
            </p>
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${i < Math.round(avgRating) ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/20'}`}
                />
              ))}
            </div>
            <p className="text-sm text-muted-foreground">{total} đánh giá</p>
          </div>

          {/* P3.21: 5 horizontal bars */}
          <div className="flex-1 space-y-1.5">
            {distribution.map(d => (
              <button
                key={d.star}
                onClick={() => onSelectStar(selectedStar === d.star ? null : d.star)}
                className={`w-full flex items-center gap-2 px-2 py-1 rounded-lg transition-all text-sm ${
                  selectedStar === d.star
                    ? 'bg-primary/10 ring-1 ring-primary/30'
                    : 'hover:bg-muted/30'
                }`}
              >
                <span className="flex items-center gap-0.5 w-10 shrink-0" style={{ fontFamily: 'var(--font-heading)' }}>
                  {d.star} <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                </span>
                <div className="flex-1 h-2.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full transition-all duration-500"
                    style={{ width: `${d.pct}%` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground w-12 text-right">{d.count} ({Math.round(d.pct)}%)</span>
              </button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── P3.23: Review Card ─────────────────────────────────
function ReviewCard({
  review,
  userId,
  onEdit,
  onDelete,
  onHelpful,
}: {
  review: Review;
  userId?: string;
  onEdit: (r: Review) => void;
  onDelete: (id: string) => void;
  onHelpful: (id: string) => void;
}) {
  const isOwner = userId === review.userId;

  return (
    <Card className="hover:shadow-sm transition-shadow">
      <CardContent className="p-4 sm:p-5">
        {/* Product link */}
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <Link
            to={`/products/${review.productId}`}
            className="flex items-center gap-1.5 text-primary hover:underline text-sm"
          >
            <Package className="h-3.5 w-3.5" />
            {review.productName ?? 'Sản phẩm'}
          </Link>
          {review.orderNumber && (
            <Badge variant="outline" className="text-[10px]">Đơn {review.orderNumber}</Badge>
          )}
          <Badge variant={review.status === 'Hiển thị' ? 'default' : 'secondary'} className="text-[10px]">
            {review.status}
          </Badge>
        </div>

        {/* P3.23: Avatar + name + stars + date */}
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <span className="text-sm text-primary" style={{ fontFamily: 'var(--font-heading)' }}>
              {(review.userName ?? 'U')[0].toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm" style={{ fontFamily: 'var(--font-heading)' }}>
                {review.userName ?? 'Người dùng'}
              </span>
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`h-3.5 w-3.5 ${i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/20'}`} />
                ))}
              </div>
              <span className="text-xs text-muted-foreground">{review.createdAt}</span>
            </div>

            {/* Title & comment */}
            {review.title && <p className="mt-1 text-sm" style={{ fontFamily: 'var(--font-heading)' }}>{review.title}</p>}
            <p className="text-sm text-muted-foreground mt-1">{review.comment}</p>

            {/* P3.23: Image gallery inline */}
            {review.images && review.images.length > 0 && (
              <div className="flex gap-2 mt-2 flex-wrap">
                {review.images.map((img, idx) => (
                  <div key={idx} className="h-16 w-16 rounded-lg overflow-hidden border border-border/50 bg-muted">
                    <img src={img} alt={`Review ${idx + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}

            {/* Tags */}
            {review.tags && review.tags.length > 0 && (
              <div className="flex gap-1.5 mt-2 flex-wrap">
                {review.tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="text-[10px]">{tag}</Badge>
                ))}
              </div>
            )}

            {/* Seller reply */}
            {review.sellerReply && (
              <div className="mt-3 p-3 bg-blue-50/50 dark:bg-blue-950/10 rounded-xl border border-blue-100/50 dark:border-blue-900/20">
                <div className="flex items-center gap-1.5 mb-1">
                  <Building2 className="h-3.5 w-3.5 text-blue-500" />
                  <span className="text-xs text-blue-600 dark:text-blue-400" style={{ fontFamily: 'var(--font-heading)' }}>Phản hồi NCC</span>
                  {review.sellerReplyDate && <span className="text-[10px] text-muted-foreground">{review.sellerReplyDate}</span>}
                </div>
                <p className="text-sm text-muted-foreground">{review.sellerReply}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-2 mt-3">
              <Button variant="ghost" size="sm" onClick={() => onHelpful(review.id)} className="gap-1 text-xs h-7">
                <ThumbsUp className={`h-3 w-3 ${review.helpfulCount > 0 ? 'text-primary' : ''}`} />
                Hữu ích ({review.helpfulCount})
              </Button>
              {isOwner && (
                <>
                  <Button variant="ghost" size="sm" onClick={() => onEdit(review)} className="gap-1 text-xs h-7">
                    <Pencil className="h-3 w-3" /> Sửa
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => onDelete(review.id)} className="gap-1 text-xs h-7 text-destructive hover:text-destructive">
                    <Trash2 className="h-3 w-3" /> Xoá
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════
// Main
// ═══════════════════════════════════════════════════════════
export function BuyerReviewsPage() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [editReview, setEditReview] = useState<Review | null>(null);

  // P3.24: "Đánh giá của tôi" vs "Tất cả"
  const [tab, setTab] = useState<'my' | 'replied' | 'pending'>('my');

  // P3.22: Filter by stars
  const [selectedStar, setSelectedStar] = useState<number | null>(null);
  // P3.22: Filter "Có hình ảnh"
  const [hasImages, setHasImages] = useState(false);

  useEffect(() => {
    if (!user) return;
    reviewApi.getByUser(user.id).then(data => {
      setReviews(data);
      setLoading(false);
    });
  }, [user]);

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xoá đánh giá này?')) return;
    try {
      await reviewApi.delete(id);
      setReviews(prev => prev.filter(r => r.id !== id));
      toast.success('Đã xoá đánh giá');
    } catch { toast.error('Lỗi khi xoá'); }
  };

  const handleEdit = async (data: { rating: number; title: string; comment: string; tags: string[]; images: string[] }) => {
    if (!editReview) return;
    try {
      const updated = await reviewApi.update(editReview.id, data);
      setReviews(prev => prev.map(r => r.id === updated.id ? updated : r));
      setEditReview(null);
      toast.success('Đã cập nhật đánh giá');
    } catch { toast.error('Lỗi khi cập nhật'); }
  };

  const handleHelpful = async (id: string) => {
    try {
      const updated = await reviewApi.toggleHelpful(id);
      setReviews(prev => prev.map(r => r.id === updated.id ? updated : r));
    } catch { toast.error('Lỗi'); }
  };

  // P3.24: Tab filter
  const tabFiltered = useMemo(() => {
    switch (tab) {
      case 'replied': return reviews.filter(r => r.sellerReply);
      case 'pending': return reviews.filter(r => !r.sellerReply);
      default: return reviews;
    }
  }, [reviews, tab]);

  // P3.22: Star + image filters
  const filteredReviews = useMemo(() => {
    let result = tabFiltered;
    if (selectedStar) result = result.filter(r => r.rating === selectedStar);
    if (hasImages) result = result.filter(r => r.images && r.images.length > 0);
    return result;
  }, [tabFiltered, selectedStar, hasImages]);

  // Stats
  const totalReviews = reviews.length;
  const avgRating = totalReviews > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / totalReviews : 0;
  const repliedCount = reviews.filter(r => r.sellerReply).length;
  const helpfulTotal = reviews.reduce((s, r) => s + r.helpfulCount, 0);
  const withImages = reviews.filter(r => r.images && r.images.length > 0).length;

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <AppBreadcrumb items={[{ label: 'Tổng quan', href: '/dashboard' }, { label: 'Đánh giá của tôi' }]} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2" style={{ fontFamily: 'var(--font-heading)' }}>
            <Star className="h-6 w-6 text-amber-400 fill-amber-400" /> Đánh giá của tôi
          </h1>
          <p className="text-muted-foreground mt-1">Quản lý tất cả đánh giá sản phẩm bạn đã viết</p>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Tổng đánh giá', value: totalReviews, icon: Star, variant: 'primary' as const },
          { label: 'Sao trung bình', value: avgRating.toFixed(1), icon: Star, variant: 'warning' as const },
          { label: 'Đã phản hồi', value: repliedCount, icon: MessageSquare, variant: 'success' as const },
          { label: 'Lượt hữu ích', value: helpfulTotal, icon: ThumbsUp, variant: 'purple' as const },
        ].map(card => (
          <Card key={card.label} className="border-l-4" style={{ borderLeftColor: `var(--color-${card.variant === 'warning' ? 'amber' : card.variant === 'purple' ? 'purple' : card.variant}-500, #6366f1)` }}>
            <CardContent className="p-3 flex items-center gap-2.5">
              <IconWrapper icon={card.icon} variant={card.variant} size="sm" />
              <div>
                <p className="text-lg" style={{ fontFamily: 'var(--font-heading)' }}>{card.value}</p>
                <p className="text-[10px] text-muted-foreground">{card.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* P3.21: Star distribution */}
      <StarDistribution reviews={reviews} selectedStar={selectedStar} onSelectStar={setSelectedStar} />

      {/* P3.24: Tab filters + P3.22 filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1 overflow-x-auto pb-1">
          {[
            { key: 'my' as const, label: 'Tất cả', count: totalReviews },
            { key: 'replied' as const, label: 'Đã phản hồi', count: repliedCount },
            { key: 'pending' as const, label: 'Chưa phản hồi', count: totalReviews - repliedCount },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm whitespace-nowrap transition-all ${
                tab === t.key
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-muted/40'
              }`}
            >
              {t.label}
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${tab === t.key ? 'bg-primary-foreground/20' : 'bg-muted'}`}>
                {t.count}
              </span>
            </button>
          ))}
        </div>

        {/* P3.22: Additional filters */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setHasImages(!hasImages)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs border transition-all ${
              hasImages
                ? 'border-primary bg-primary/5 text-primary'
                : 'border-border text-muted-foreground hover:border-primary/30'
            }`}
          >
            <Camera className="h-3 w-3" /> Có hình ảnh ({withImages})
          </button>
          {selectedStar && (
            <Badge variant="secondary" className="gap-1 text-xs cursor-pointer" onClick={() => setSelectedStar(null)}>
              {selectedStar} <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-400" /> ×
            </Badge>
          )}
        </div>
      </div>

      {/* Review list */}
      {loading ? (
        <Card><CardContent className="p-8 text-center text-muted-foreground">Đang tải...</CardContent></Card>
      ) : filteredReviews.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="h-16 w-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-3">
              <Star className="h-8 w-8 text-muted-foreground/30" />
            </div>
            <p style={{ fontFamily: 'var(--font-heading)' }}>Chưa có đánh giá nào</p>
            <p className="text-muted-foreground text-sm mt-1">
              {selectedStar || hasImages ? 'Thử bỏ bộ lọc để xem tất cả' : 'Hãy mua hàng và viết đánh giá!'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredReviews.map(review => (
            <ReviewCard
              key={review.id}
              review={review}
              userId={user?.id}
              onEdit={r => setEditReview(r)}
              onDelete={handleDelete}
              onHelpful={handleHelpful}
            />
          ))}
        </div>
      )}

      {/* Edit dialog */}
      <WriteReviewDialog
        open={!!editReview}
        onOpenChange={v => { if (!v) setEditReview(null); }}
        onSubmit={handleEdit}
        editReview={editReview}
        productName={editReview?.productName}
      />
    </div>
  );
}

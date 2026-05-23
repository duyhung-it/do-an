// ============================================================
// Shared Review Components — Nhóm 24B/24C
// Tái sử dụng trên ProductDetailPage, SupplierDetailPage, OrderDetailPage
// ============================================================

import { useState } from 'react';
import { Star, ThumbsUp, ShieldCheck, MessageSquare, Image as ImageIcon, Pencil, Trash2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent } from '../ui/card';
import { Progress } from '../ui/progress';
import { Textarea } from '../ui/textarea';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import type { Review, SupplierReview } from '../../types';

// -------- Chọn sao --------
export function StarRating({ value, onChange, size = 'md', readonly = false }: {
  value: number;
  onChange?: (v: number) => void;
  size?: 'sm' | 'md' | 'lg';
  readonly?: boolean;
}) {
  const sizeClass = size === 'sm' ? 'h-4 w-4' : size === 'lg' ? 'h-8 w-8' : 'h-6 w-6';
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <button
          key={i}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(i + 1)}
          className={readonly ? 'cursor-default' : 'cursor-pointer'}
        >
          <Star className={`${sizeClass} transition-colors ${
            i < value ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 hover:text-yellow-300'
          }`} />
        </button>
      ))}
    </div>
  );
}

// -------- Hiển thị sao nhỏ --------
export function StarDisplay({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' }) {
  const sizeClass = size === 'sm' ? 'h-3 w-3' : 'h-4 w-4';
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`${sizeClass} ${i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
        />
      ))}
    </div>
  );
}

// -------- Phân bố sao (summary bar) --------
export function StarDistributionBar({ distribution, total, avgRating }: {
  distribution: { star: number; count: number }[];
  total: number;
  avgRating: number;
}) {
  return (
    <Card>
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row gap-6">
          {/* Điểm trung bình */}
          <div className="flex flex-col items-center justify-center min-w-[120px]">
            <span className="text-4xl text-primary">{avgRating.toFixed(1)}</span>
            <StarDisplay rating={avgRating} size="md" />
            <span className="text-muted-foreground mt-1">{total} đánh giá</span>
          </div>
          {/* Thanh phân bố */}
          <div className="flex-1 space-y-2">
            {distribution.map(({ star, count }) => (
              <div key={star} className="flex items-center gap-2">
                <span className="w-8 text-right">{star}</span>
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 shrink-0" />
                <Progress value={total > 0 ? (count / total) * 100 : 0} className="flex-1 h-2" />
                <span className="w-8 text-muted-foreground">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// -------- Review tags --------
const PRODUCT_TAGS = ['Chất lượng', 'Giao hàng', 'Đóng gói', 'Giá cả', 'Dịch vụ'];
const SUPPLIER_TAGS = ['Giá cả', 'Giao tiếp', 'Tốc độ', 'Chất lượng', 'Hỗ trợ'];

export function TagSelector({ selected, onChange, type = 'product' }: {
  selected: string[];
  onChange: (tags: string[]) => void;
  type?: 'product' | 'supplier';
}) {
  const tags = type === 'product' ? PRODUCT_TAGS : SUPPLIER_TAGS;
  return (
    <div className="flex flex-wrap gap-2">
      {tags.map(tag => (
        <Badge
          key={tag}
          variant={selected.includes(tag) ? 'default' : 'outline'}
          className="cursor-pointer"
          onClick={() =>
            onChange(
              selected.includes(tag) ? selected.filter(t => t !== tag) : [...selected, tag],
            )
          }
        >
          {tag}
        </Badge>
      ))}
    </div>
  );
}

// -------- Hiển thị 1 review sản phẩm --------
export function ReviewItem({ review, onHelpful, onEdit, onDelete, currentUserId, isSellerView, onSellerReply }: {
  review: Review;
  onHelpful?: (id: string) => void;
  onEdit?: (review: Review) => void;
  onDelete?: (id: string) => void;
  currentUserId?: string;
  isSellerView?: boolean;
  onSellerReply?: (id: string, reply: string) => void;
}) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState(review.sellerReply ?? '');
  const isOwner = currentUserId && review.userId === currentUserId;
  const daysSinceCreated = Math.floor((Date.now() - new Date(review.createdAt).getTime()) / (1000 * 60 * 60 * 24));
  const canEditDelete = isOwner && daysSinceCreated <= 7;

  return (
    <div className="border-b pb-4 last:border-0 last:pb-0">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="font-medium">{review.userName}</span>
            {review.userCompany && (
              <span className="text-muted-foreground">· {review.userCompany}</span>
            )}
            <StarDisplay rating={review.rating} />
            {review.isVerifiedPurchase && (
              <Badge variant="secondary" className="gap-1 text-green-700 bg-green-50 border-green-200">
                <ShieldCheck className="h-3 w-3" /> Đã mua hàng
              </Badge>
            )}
          </div>
          {review.title && <p className="font-medium mb-1">{review.title}</p>}
          <p className="text-muted-foreground mb-2">{review.comment}</p>
          {review.tags && review.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {review.tags.map(tag => (
                <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
              ))}
            </div>
          )}
          {review.images && review.images.length > 0 && (
            <div className="flex gap-2 mb-2">
              {review.images.map((img, idx) => (
                <div key={idx} className="w-16 h-16 rounded border overflow-hidden">
                  <img src={img} alt={`Review ${idx + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}
          <div className="flex items-center gap-3 text-muted-foreground">
            <span>{review.createdAt}</span>
            {review.orderNumber && <span>· Đơn {review.orderNumber}</span>}
            <button
              className="flex items-center gap-1 hover:text-foreground transition-colors"
              onClick={() => onHelpful?.(review.id)}
            >
              <ThumbsUp className="h-3.5 w-3.5" />
              <span>Hữu ích ({review.helpfulCount})</span>
            </button>
            {canEditDelete && onEdit && (
              <button className="flex items-center gap-1 hover:text-foreground transition-colors" onClick={() => onEdit(review)}>
                <Pencil className="h-3.5 w-3.5" /> Sửa
              </button>
            )}
            {canEditDelete && onDelete && (
              <button className="flex items-center gap-1 hover:text-destructive transition-colors" onClick={() => onDelete(review.id)}>
                <Trash2 className="h-3.5 w-3.5" /> Xoá
              </button>
            )}
          </div>
        </div>
      </div>
      {/* Phản hồi cửa hàng */}
      {review.sellerReply && (
        <div className="mt-3 ml-6 p-3 rounded-lg bg-muted/50 border-l-2 border-primary">
          <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
            <MessageSquare className="h-3 w-3" /> Phản hồi từ cửa hàng · {review.sellerReplyAt}
          </p>
          <p>{review.sellerReply}</p>
        </div>
      )}
      {/* Seller reply form */}
      {isSellerView && onSellerReply && !review.sellerReply && (
        <div className="mt-3 ml-6">
          {!showReplyForm ? (
            <Button variant="outline" size="sm" onClick={() => setShowReplyForm(true)}>
              <MessageSquare className="mr-1 h-4 w-4" /> Trả lời
            </Button>
          ) : (
            <div className="space-y-2">
              <Textarea
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                placeholder="Viết phản hồi..."
                rows={2}
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={() => { onSellerReply(review.id, replyText); setShowReplyForm(false); }} disabled={!replyText.trim()}>
                  Gửi phản hồi
                </Button>
                <Button size="sm" variant="outline" onClick={() => setShowReplyForm(false)}>Huỷ</Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// -------- Hiển thị 1 review cửa hàng --------
export function SupplierReviewItem({ review, onHelpful }: {
  review: SupplierReview;
  onHelpful?: (id: string) => void;
}) {
  return (
    <div className="border-b pb-4 last:border-0 last:pb-0">
      <div className="flex items-center gap-2 flex-wrap mb-1">
        <span className="font-medium">{review.buyerName}</span>
        <span className="text-muted-foreground">· {review.buyerCompany}</span>
        <StarDisplay rating={review.rating} />
      </div>
      <p className="text-muted-foreground mb-2">{review.comment}</p>
      {review.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {review.tags.map(tag => (
            <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
          ))}
        </div>
      )}
      <div className="flex items-center gap-3 text-muted-foreground">
        <span>{review.createdAt}</span>
        <button
          className="flex items-center gap-1 hover:text-foreground transition-colors"
          onClick={() => onHelpful?.(review.id)}
        >
          <ThumbsUp className="h-3.5 w-3.5" />
          <span>Hữu ích ({review.helpfulCount})</span>
        </button>
      </div>
      {review.sellerReply && (
        <div className="mt-3 ml-6 p-3 rounded-lg bg-muted/50 border-l-2 border-primary">
          <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
            <MessageSquare className="h-3 w-3" /> Phản hồi từ cửa hàng · {review.sellerReplyAt}
          </p>
          <p>{review.sellerReply}</p>
        </div>
      )}
    </div>
  );
}

// -------- Dialog viết đánh giá sản phẩm --------
export function WriteReviewDialog({ open, onOpenChange, onSubmit, editReview, productName }: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSubmit: (data: { rating: number; title: string; comment: string; tags: string[]; images: string[] }) => void;
  editReview?: Review | null;
  productName?: string;
}) {
  const [rating, setRating] = useState(editReview?.rating ?? 5);
  const [title, setTitle] = useState(editReview?.title ?? '');
  const [comment, setComment] = useState(editReview?.comment ?? '');
  const [tags, setTags] = useState<string[]>(editReview?.tags ?? []);
  const [imageUrl, setImageUrl] = useState('');
  const [images, setImages] = useState<string[]>(editReview?.images ?? []);
  const [errors, setErrors] = useState<string[]>([]);

  const validate = () => {
    const errs: string[] = [];
    if (rating < 1) errs.push('Vui lòng chọn số sao');
    if (comment.trim().length < 10) errs.push('Nội dung đánh giá tối thiểu 10 ký tự');
    setErrors(errs);
    return errs.length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onSubmit({ rating, title, comment, tags, images });
    // Reset
    setRating(5);
    setTitle('');
    setComment('');
    setTags([]);
    setImages([]);
    setErrors([]);
  };

  const addImage = () => {
    if (imageUrl.trim() && images.length < 5) {
      setImages([...images, imageUrl.trim()]);
      setImageUrl('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editReview ? 'Sửa đánh giá' : 'Viết đánh giá'}
            {productName && <span className="text-muted-foreground"> — {productName}</span>}
          </DialogTitle>
          <DialogDescription>
            {editReview ? 'Cập nhật đánh giá của bạn về sản phẩm này' : 'Chia sẻ trải nghiệm của bạn để giúp người mua khác'}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {errors.length > 0 && (
            <div className="p-3 rounded-lg bg-destructive/10 text-destructive space-y-1">
              {errors.map((e, i) => <p key={i}>• {e}</p>)}
            </div>
          )}
          <div>
            <Label>Đánh giá sao *</Label>
            <StarRating value={rating} onChange={setRating} size="lg" />
          </div>
          <div>
            <Label>Tiêu đề</Label>
            <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Tiêu đề đánh giá..." />
          </div>
          <div>
            <Label>Nội dung *</Label>
            <Textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm... (tối thiểu 10 ký tự)"
              rows={4}
            />
            <p className="text-xs text-muted-foreground mt-1">{comment.length}/500 ký tự</p>
          </div>
          <div>
            <Label>Nhãn đánh giá</Label>
            <TagSelector selected={tags} onChange={setTags} type="product" />
          </div>
          <div>
            <Label>Thêm hình ảnh (URL)</Label>
            <div className="flex gap-2">
              <Input value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="https://..." className="flex-1" />
              <Button variant="outline" size="sm" onClick={addImage} disabled={images.length >= 5}>
                <ImageIcon className="h-4 w-4 mr-1" /> Thêm
              </Button>
            </div>
            {images.length > 0 && (
              <div className="flex gap-2 mt-2 flex-wrap">
                {images.map((img, idx) => (
                  <div key={idx} className="relative w-16 h-16 rounded border overflow-hidden group">
                    <img src={img} alt={`Img ${idx + 1}`} className="w-full h-full object-cover" />
                    <button
                      className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                      onClick={() => setImages(images.filter((_, i) => i !== idx))}
                    >
                      <Trash2 className="h-4 w-4 text-white" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1">Tối đa 5 hình ảnh</p>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Huỷ</Button>
            <Button onClick={handleSubmit}>{editReview ? 'Cập nhật' : 'Gửi đánh giá'}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// -------- Dialog viết đánh giá cửa hàng --------
export function WriteSupplierReviewDialog({ open, onOpenChange, onSubmit, supplierName }: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSubmit: (data: { rating: number; comment: string; tags: string[] }) => void;
  supplierName: string;
}) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [errors, setErrors] = useState<string[]>([]);

  const validate = () => {
    const errs: string[] = [];
    if (rating < 1) errs.push('Vui lòng chọn số sao');
    if (comment.trim().length < 10) errs.push('Nội dung đánh giá tối thiểu 10 ký tự');
    setErrors(errs);
    return errs.length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onSubmit({ rating, comment, tags });
    setRating(5);
    setComment('');
    setTags([]);
    setErrors([]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Đánh giá cửa hàng — {supplierName}</DialogTitle>
          <DialogDescription>
            Chia sẻ trải nghiệm của bạn để giúp người mua khác
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {errors.length > 0 && (
            <div className="p-3 rounded-lg bg-destructive/10 text-destructive space-y-1">
              {errors.map((e, i) => <p key={i}>• {e}</p>)}
            </div>
          )}
          <div>
            <Label>Đánh giá sao *</Label>
            <StarRating value={rating} onChange={setRating} size="lg" />
          </div>
          <div>
            <Label>Nhận xét *</Label>
            <Textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Chia sẻ trải nghiệm với cửa hàng... (tối thiểu 10 ký tự)"
              rows={4}
            />
          </div>
          <div>
            <Label>Nhãn đánh giá</Label>
            <TagSelector selected={tags} onChange={setTags} type="supplier" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Huỷ</Button>
            <Button onClick={handleSubmit}>Gửi đánh giá</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// -------- Filter bar cho reviews --------
export function ReviewFilterBar({ starFilter, onStarFilterChange, verifiedOnly, onVerifiedChange, hasImages, onHasImagesChange, sortBy, onSortChange }: {
  starFilter: number;
  onStarFilterChange: (v: number) => void;
  verifiedOnly: boolean;
  onVerifiedChange: (v: boolean) => void;
  hasImages: boolean;
  onHasImagesChange: (v: boolean) => void;
  sortBy: string;
  onSortChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Star filter */}
      <div className="flex gap-1">
        <Badge
          variant={starFilter === 0 ? 'default' : 'outline'}
          className="cursor-pointer"
          onClick={() => onStarFilterChange(0)}
        >
          Tất cả
        </Badge>
        {[5, 4, 3, 2, 1].map(s => (
          <Badge
            key={s}
            variant={starFilter === s ? 'default' : 'outline'}
            className="cursor-pointer gap-0.5"
            onClick={() => onStarFilterChange(s)}
          >
            {s} <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
          </Badge>
        ))}
      </div>
      {/* Verified */}
      <Badge
        variant={verifiedOnly ? 'default' : 'outline'}
        className="cursor-pointer gap-1"
        onClick={() => onVerifiedChange(!verifiedOnly)}
      >
        <ShieldCheck className="h-3 w-3" /> Đã mua hàng
      </Badge>
      {/* Has images */}
      <Badge
        variant={hasImages ? 'default' : 'outline'}
        className="cursor-pointer gap-1"
        onClick={() => onHasImagesChange(!hasImages)}
      >
        <ImageIcon className="h-3 w-3" /> Có hình ảnh
      </Badge>
      {/* Sort */}
      <select
        className="border rounded px-2 py-1 bg-background"
        value={sortBy}
        onChange={e => onSortChange(e.target.value)}
      >
        <option value="newest">Mới nhất</option>
        <option value="oldest">Cũ nhất</option>
        <option value="highest">Sao cao nhất</option>
        <option value="lowest">Sao thấp nhất</option>
        <option value="helpful">Hữu ích nhất</option>
      </select>
    </div>
  );
}

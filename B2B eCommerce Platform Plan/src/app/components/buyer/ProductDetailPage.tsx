// ============================================================
// Chi tiết sản phẩm Buyer — Redesign UI-E Đợt 17
// E17.06–E17.10: gallery, sticky cart, supplier card, breadcrumb
// + Price History Chart + Combo Deals Section
// ============================================================

import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import {
  Star, ShieldCheck, ShoppingCart, Minus, Plus, MessageCircle,
  GitCompareArrows, Send, Heart, Tag, ChevronLeft, ChevronRight,
  Truck, RotateCcw, Shield, Building2, MapPin, Calendar,
  TrendingDown, Package, Zap, Cpu, Camera,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { copyToClipboard } from '../ui/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Separator } from '../ui/separator';
import { Input } from '../ui/input';
import { StatusBadge } from '../shared/StatusBadge';
import { AppBreadcrumb } from '../shared/AppBreadcrumb';
import { DetailSkeleton } from '../shared/PageSkeleton';
import {
  StarDistributionBar, ReviewFilterBar, ReviewItem, WriteReviewDialog,
} from '../shared/ReviewComponents';
import { InstallmentSection } from '../shared/InstallmentSection';
import { productApi, supplierApi, reviewApi, chatApi, promotionApi, comboApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useRecentlyViewed } from '../../hooks/useRecentlyViewed';
import type { Product, Supplier, Review, Promotion, ProductCombo, PricePoint } from '../../types';
import { toast } from 'sonner';
import { ImageWithFallback } from '../figma/ImageWithFallback';

const formatPrice = (price: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

const getProductRetailMeta = (product: Product) => {
  const legacy = product as Product & {
    supplierId?: string;
    supplierName?: string;
    minOrderQty?: number;
    unit?: string;
  };

  return {
    storeId: legacy.supplierId ?? 'cellphones',
    storeName: legacy.supplierName ?? 'CELLPHONES',
    minQty: legacy.minOrderQty ?? 1,
    unit: legacy.unit ?? 'sp',
  };
};

// E17.06: Image Gallery component
function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const mainRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!mainRef.current) return;
    const rect = mainRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x, y });
  };

  return (
    <div className="flex flex-col-reverse lg:flex-row gap-3">
      {/* E17.06: Thumbnail rail */}
      <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-y-auto lg:max-h-[400px]">
        {images.map((img, idx) => (
          <button
            key={idx}
            className={`
              w-16 h-16 rounded-lg overflow-hidden border-2 shrink-0 transition-all
              ${idx === selectedIdx ? 'border-primary ring-1 ring-primary/30' : 'border-transparent hover:border-border'}
            `}
            onClick={() => setSelectedIdx(idx)}
          >
            <ImageWithFallback src={img} alt={`${name} ${idx + 1}`} className="w-full h-full object-cover" />
          </button>
        ))}
      </div>

      {/* Main image */}
      <div
        ref={mainRef}
        className="flex-1 aspect-[4/3] rounded-xl overflow-hidden relative cursor-zoom-in border bg-muted/30 group"
        onMouseEnter={() => setZoomed(true)}
        onMouseLeave={() => setZoomed(false)}
        onMouseMove={handleMouseMove}
      >
        <ImageWithFallback
          src={images[selectedIdx]}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-300"
          style={zoomed ? {
            transform: 'scale(1.8)',
            transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
          } : undefined}
        />
        {/* Nav arrows */}
        {images.length > 1 && (
          <>
            <button
              className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-white/80 backdrop-blur-sm shadow flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
              onClick={() => setSelectedIdx(prev => (prev - 1 + images.length) % images.length)}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-white/80 backdrop-blur-sm shadow flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
              onClick={() => setSelectedIdx(prev => (prev + 1) % images.length)}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </>
        )}
        {/* Image counter */}
        <div className="absolute bottom-2 right-2 bg-black/50 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
          {selectedIdx + 1} / {images.length}
        </div>
      </div>
    </div>
  );
}

// ---- Price History Sparkline ----
function PriceHistoryChart({ history, currentPrice }: { history: PricePoint[]; currentPrice: number }) {
  if (!history || history.length < 2) return null;
  const allPrices = [...history.map(h => h.price), currentPrice];
  const minP = Math.min(...allPrices);
  const maxP = Math.max(...allPrices);
  const range = maxP - minP || 1;
  const W = 360, H = 100;
  const padX = 20, padY = 16;
  const points: PricePoint[] = [...history, { date: new Date().toISOString().slice(0, 10), price: currentPrice }];
  const coords = points.map((p, i) => ({
    x: padX + (i / (points.length - 1)) * (W - padX * 2),
    y: padY + ((maxP - p.price) / range) * (H - padY * 2),
    ...p,
  }));
  const pathD = coords.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x} ${c.y}`).join(' ');
  const areaD = `${pathD} L ${coords[coords.length - 1].x} ${H} L ${coords[0].x} ${H} Z`;
  const lowestPrice = Math.min(...history.map(h => h.price));
  const formatP = (price: number) => new Intl.NumberFormat('vi-VN', { notation: 'compact', maximumFractionDigits: 1 }).format(price) + 'đ';
  return (
    <div className="price-history-wrap">
      <div className="price-history-stats">
        <div className="price-history-stat">
          <span className="price-history-stat-label">Giá hiện tại</span>
          <span className="price-history-stat-val current">{formatP(currentPrice)}</span>
        </div>
        <div className="price-history-stat">
          <span className="price-history-stat-label">Thấp nhất 30 ngày</span>
          <span className="price-history-stat-val low"><TrendingDown className="h-3 w-3" /> {formatP(lowestPrice)}</span>
        </div>
        <div className="price-history-stat">
          <span className="price-history-stat-label">Cao nhất</span>
          <span className="price-history-stat-val high">{formatP(maxP)}</span>
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="price-history-svg" preserveAspectRatio="none">
        <defs>
          <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.25" />
            <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaD} fill="url(#priceGradient)" />
        <path d={pathD} fill="none" stroke="var(--color-primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {coords.map((c, i) => (
          <g key={i}>
            <circle cx={c.x} cy={c.y} r="4" fill="white" stroke="var(--color-primary)" strokeWidth="2" />
            {i === coords.length - 1 && (
              <circle cx={c.x} cy={c.y} r="6" fill="var(--color-primary)" opacity="0.3" />
            )}
          </g>
        ))}
      </svg>
      <div className="price-history-labels">
        {coords.map((c, i) => (
          <span key={i} className="price-history-label">
            {new Date(c.date).toLocaleDateString('vi-VN', { month: 'short', year: '2-digit' })}
          </span>
        ))}
      </div>
      {currentPrice <= lowestPrice && (
        <div className="price-history-alert">
          <TrendingDown className="h-4 w-4" /> Đây là mức giá thấp nhất trong lịch sử! Nên mua ngay.
        </div>
      )}
    </div>
  );
}

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { addItem } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { addItem: addRecentItem } = useRecentlyViewed();
  const [product, setProduct] = useState<Product | null>(null);
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [combos, setCombos] = useState<ProductCombo[]>([]);

  // E17.07: Sticky cart detection
  const infoRef = useRef<HTMLDivElement>(null);
  const [showStickyCart, setShowStickyCart] = useState(false);

  useEffect(() => {
    const el = infoRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setShowStickyCart(!entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [product]);

  // Review state
  const [reviewPage, setReviewPage] = useState(1);
  const [reviewTotal, setReviewTotal] = useState(0);
  const [starFilter, setStarFilter] = useState(0);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [hasImages, setHasImages] = useState(false);
  const [reviewSort, setReviewSort] = useState('newest');
  const [starDistribution, setStarDistribution] = useState<{ star: number; count: number }[]>([]);
  const [avgRating, setAvgRating] = useState(0);
  const [showWriteReview, setShowWriteReview] = useState(false);
  const [editReview, setEditReview] = useState<Review | null>(null);

  useEffect(() => {
    if (!id) return;
    productApi.getById(id).then(p => {
      if (p) {
        const retailMeta = getProductRetailMeta(p);
        setProduct(p);
        setQuantity(retailMeta.minQty);
        // Save to recently viewed
        addRecentItem({ id: p.id, name: p.name, image: p.images[0], price: p.price, brand: p.brand ?? '' });
        supplierApi.getById(retailMeta.storeId).then(s => s && setSupplier(s));
        promotionApi.getActiveForProduct(p.id).then(setPromotions);
        comboApi.getForProduct(p.id).then(setCombos);
        reviewApi.getStarDistribution(p.id).then(dist => {
          setStarDistribution(dist);
          const total = dist.reduce((s, d) => s + d.count, 0);
          const avg = total > 0 ? dist.reduce((s, d) => s + d.star * d.count, 0) / total : 0;
          setAvgRating(avg);
        });
      }
    });
  }, [id]);

  useEffect(() => {
    if (!product) return;
    const sortMap: Record<string, { field: string; direction: 'asc' | 'desc' }> = {
      newest: { field: 'createdAt', direction: 'desc' },
      oldest: { field: 'createdAt', direction: 'asc' },
      highest: { field: 'rating', direction: 'desc' },
      lowest: { field: 'rating', direction: 'asc' },
      helpful: { field: 'helpfulCount', direction: 'desc' },
    };
    reviewApi.getByProductPaginated(
      product.id,
      { page: reviewPage, pageSize: 5 },
      sortMap[reviewSort],
      starFilter,
      verifiedOnly,
      hasImages,
    ).then(res => {
      setReviews(res.data);
      setReviewTotal(res.total);
    });
  }, [product, reviewPage, starFilter, verifiedOnly, hasImages, reviewSort]);

  const handleAddToCart = async () => {
    if (!product) return;
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để thêm vào giỏ hàng');
      navigate('/login', { state: { from: `/products/${product.id}` } });
      return;
    }
    const retailMeta = getProductRetailMeta(product);
    await addItem({
      productId: product.id,
      productName: product.name,
      productImage: product.images[0],
      supplierId: retailMeta.storeId,
      supplierName: retailMeta.storeName,
      quantity,
      unitPrice: product.variants[selectedVariant]?.price ?? product.price,
      variantName: product.variants[selectedVariant]?.name,
    });
    toast.success('Đã thêm vào giỏ hàng');
  };

  const handleContactSupplier = async () => {
    if (!isAuthenticated || !user || !product) {
      toast.error('Vui lòng đăng nhập để nhắn tin');
      return;
    }
    const retailMeta = getProductRetailMeta(product);
    const conv = await chatApi.createConversation(
      user.id, user.fullName,
      retailMeta.storeId, retailMeta.storeName,
      product.id, product.name,
    );
    navigate(`/chat?conv=${conv.id}`);
  };

  const handleSubmitReview = async (data: { rating: number; title: string; comment: string; tags: string[]; images: string[] }) => {
    if (!product) return;
    try {
      const newReview = await reviewApi.create({
        productId: product.id, productName: product.name,
        userId: user?.id ?? 'user-001', userName: user?.fullName ?? 'Người dùng',
        userCompany: user?.companyName, rating: data.rating, title: data.title,
        comment: data.comment, tags: data.tags, images: data.images,
        isVerifiedPurchase: true, helpfulCount: 0,
      });
      setReviews(prev => [newReview, ...prev]);
      setReviewTotal(prev => prev + 1);
      setShowWriteReview(false);
      toast.success('Đã gửi đánh giá');
    } catch { toast.error('Lỗi khi gửi đánh giá'); }
  };

  const handleEditReview = async (data: { rating: number; title: string; comment: string; tags: string[]; images: string[] }) => {
    if (!editReview) return;
    try {
      const updated = await reviewApi.update(editReview.id, data);
      setReviews(prev => prev.map(r => r.id === updated.id ? updated : r));
      setEditReview(null);
      toast.success('Đã cập nhật đánh giá');
    } catch { toast.error('Lỗi khi cập nhật'); }
  };

  const handleDeleteReview = async (rid: string) => {
    try {
      await reviewApi.delete(rid);
      setReviews(prev => prev.filter(r => r.id !== rid));
      setReviewTotal(prev => prev - 1);
      toast.success('Đã xoá đánh giá');
    } catch { toast.error('Lỗi khi xoá'); }
  };

  const handleHelpful = async (rid: string) => {
    try {
      const updated = await reviewApi.toggleHelpful(rid);
      setReviews(prev => prev.map(r => r.id === updated.id ? updated : r));
    } catch { toast.error('Lỗi'); }
  };

  if (!product) {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-6">
        <DetailSkeleton />
      </div>
    );
  }

  const currentPrice = product.variants[selectedVariant]?.price ?? product.price;
  const wishlisted = isInWishlist(product.id);
  const retailMeta = getProductRetailMeta(product);

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6">
      {/* E17.09: Breadcrumb */}
      <AppBreadcrumb items={[
        { label: 'Sản phẩm', href: '/products' },
        { label: product.categoryName, href: `/products?categoryName=${encodeURIComponent(product.categoryName)}` },
        { label: product.name },
      ]} />

      <div className="grid lg:grid-cols-2 gap-8">
        {/* E17.06: Image gallery */}
        <ProductGallery images={product.images} name={product.name} />

        {/* Product info */}
        <div className="space-y-5" ref={infoRef}>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <StatusBadge status={product.status} />
              <Badge variant="secondary">{product.categoryName}</Badge>
            </div>
            <h1 className="mb-3" style={{ fontFamily: 'var(--font-heading)' }}>{product.name}</h1>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`h-4 w-4 ${i < Math.floor(product.rating) ? 'fill-amber-400 text-amber-400' : 'fill-muted text-muted'}`} />
                ))}
                <span className="ml-1">{product.rating}</span>
              </div>
              <span className="text-muted-foreground">{product.reviewCount} đánh giá</span>
            </div>
          </div>

          <Separator />

          {/* Price section */}
          <div className="p-4 rounded-xl border border-[#e31837]/20 relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, rgba(227,24,55,0.04) 0%, rgba(201,20,50,0.06) 100%)' }}
          >
            <div className="absolute top-0 right-0 w-20 h-20 rounded-full bg-[#e31837]/5 -translate-y-1/2 translate-x-1/2" />
            <p className="text-[#e31837] text-2xl font-black" style={{ fontFamily: 'var(--font-heading)' }}>
              {formatPrice(currentPrice)}
            </p>
            <p className="text-muted-foreground text-sm mt-1">
              Có thể mua từ: <span className="font-semibold text-foreground">{retailMeta.minQty} {retailMeta.unit}</span>
            </p>
          </div>

          {/* Promotions */}
          {promotions.length > 0 && (
            <div className="space-y-2">
              <p className="flex items-center gap-1 text-sm" style={{ fontWeight: 500 }}>
                <Tag className="h-4 w-4 text-orange-500" /> Khuyến mãi ({promotions.length})
              </p>
              {promotions.slice(0, 3).map(promo => (
                <div key={promo.id} className="flex items-center justify-between p-2.5 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm truncate" style={{ fontWeight: 500 }}>{promo.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {promo.type === 'Phần trăm' ? `Giảm ${promo.value}%` : promo.type === 'Số tiền' ? `Giảm ${formatPrice(promo.value)}` : promo.description}
                      {promo.minOrderValue > 0 && ` · Đơn từ ${formatPrice(promo.minOrderValue)}`}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="shrink-0 ml-2 text-xs"
                    onClick={() => { copyToClipboard(promo.code); toast.success(`Đã sao chép: ${promo.code}`); }}
                  >
                    {promo.code}
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Variants */}
          {product.variants.length > 1 && (
            <div>
              <p className="text-sm mb-2" style={{ fontWeight: 500 }}>Phân loại:</p>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v, i) => (
                  <Button
                    key={v.id}
                    variant={selectedVariant === i ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedVariant(i)}
                    className="transition-all"
                  >
                    {v.name} - {formatPrice(v.price)}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div>
            <p className="text-sm mb-2" style={{ fontWeight: 500 }}>Số lượng:</p>
            <div className="flex items-center gap-2">
              <div className="flex items-center border rounded-lg overflow-hidden">
                <Button variant="ghost" className="h-10 w-10 rounded-none" onClick={() => setQuantity(Math.max(retailMeta.minQty, quantity - 1))}>
                  <Minus className="h-4 w-4" />
                </Button>
                <Input
                  type="number"
                  className="w-20 text-center border-0 border-x rounded-none h-10"
                  value={quantity}
                  onChange={e => setQuantity(Math.max(retailMeta.minQty, Number(e.target.value)))}
                  min={retailMeta.minQty}
                />
                <Button variant="ghost" className="h-10 w-10 rounded-none" onClick={() => setQuantity(quantity + 1)}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <span className="text-muted-foreground text-sm">{retailMeta.unit}</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1.5">
              Tổng: <span className="text-primary" style={{ fontWeight: 600 }}>{formatPrice(currentPrice * quantity)}</span>
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2.5 pt-1">
            <Button
              size="lg"
              onClick={handleAddToCart}
              className="flex-1 sm:flex-none font-bold bg-gradient-to-r from-[#e31837] to-[#c91432] hover:from-[#c91432] hover:to-[#a50f28] border-0 shadow-md hover:shadow-lg transition-all"
            >
              <ShoppingCart className="mr-2 h-5 w-5" /> Thêm vào giỏ hàng
            </Button>
            <Button size="lg" variant="outline" onClick={handleContactSupplier}>
              <MessageCircle className="mr-2 h-5 w-5" /> Nhắn tin
            </Button>
            <Button
              size="lg"
              variant={wishlisted ? 'default' : 'outline'}
              className={wishlisted ? 'bg-red-500 hover:bg-red-600 border-red-500' : ''}
              onClick={() => {
                if (wishlisted) { removeFromWishlist(product.id); toast.success('Đã bỏ yêu thích'); }
                else { addToWishlist(product.id); toast.success('Đã thêm vào yêu thích'); }
              }}
            >
              <Heart className={`h-5 w-5 ${wishlisted ? 'fill-current' : ''}`} />
            </Button>
            <Link to={`/products/compare?ids=${product.id}`}>
              <Button size="lg" variant="outline">
                <GitCompareArrows className="h-5 w-5" />
              </Button>
            </Link>
          </div>

          {/* Shipping info badges */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { icon: Truck, label: 'Giao toàn quốc', sub: '2-5 ngày', gradient: 'from-blue-500 to-indigo-600' },
              { icon: RotateCcw, label: 'Đổi trả 7 ngày', sub: 'Miễn phí', gradient: 'from-emerald-500 to-teal-600' },
              { icon: Shield, label: 'Bảo hành', sub: '12 tháng', gradient: 'from-violet-500 to-purple-600' },
            ].map(item => (
              <div key={item.label} className="text-center p-3 rounded-xl bg-muted/40 hover:bg-muted/60 transition-colors group">
                <div className={`h-8 w-8 mx-auto rounded-lg bg-gradient-to-br ${item.gradient} flex items-center justify-center mb-2 shadow-sm group-hover:shadow-md transition-shadow`}>
                  <item.icon className="h-4 w-4 text-white" />
                </div>
                <p className="text-xs font-semibold">{item.label}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{item.sub}</p>
              </div>
            ))}
          </div>

          {/* E17.10: Store info card */}
          {supplier && (
            <Card className="border-0 shadow-sm overflow-hidden">
              <div className="h-16 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 relative">
                <ImageWithFallback src={supplier.coverUrl} alt="" className="w-full h-full object-cover opacity-40" />
              </div>
              <CardContent className="p-4 -mt-6 relative">
                <div className="flex items-start gap-3">
                  <div className="h-12 w-12 rounded-xl overflow-hidden shrink-0 border-2 border-white shadow-md">
                    <ImageWithFallback src={supplier.logoUrl} alt={supplier.companyName} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="truncate" style={{ fontWeight: 600 }}>{supplier.companyName}</p>
                      {supplier.isVerified && (
                        <Badge className="bg-blue-500 text-white border-0 text-[10px] h-5 gap-0.5">
                          <ShieldCheck className="h-3 w-3" /> Đã xác minh
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1 flex-wrap">
                      <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {supplier.city}</span>
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> Từ {supplier.yearEstablished}</span>
                      <span className="flex items-center gap-1"><Building2 className="h-3 w-3" /> {supplier.productCount} SP</span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map(s => (
                          <Star key={s} className={`h-3 w-3 ${s <= supplier.rating ? 'fill-amber-400 text-amber-400' : 'fill-muted text-muted'}`} />
                        ))}
                      </div>
                      <span className="text-xs text-muted-foreground">({supplier.reviewCount})</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <Link to="/stores" className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">Xem cửa hàng</Button>
                  </Link>
                  <Button variant="outline" size="sm" className="flex-1" onClick={handleContactSupplier}>
                    <MessageCircle className="mr-1 h-3.5 w-3.5" /> Liên hệ
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* E17.07: Sticky add-to-cart bar */}
      {showStickyCart && (
        <div className="fixed bottom-0 inset-x-0 z-40 bg-background/95 backdrop-blur border-t shadow-xl">
          <div className="container mx-auto px-4 sm:px-6 py-3 flex items-center gap-4">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="h-10 w-10 rounded-lg overflow-hidden shrink-0 border border-border/50">
                <ImageWithFallback src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
              </div>
              <div className="min-w-0 hidden sm:block">
                <p className="truncate text-sm font-semibold">{product.name}</p>
                <p className="text-[#e31837] text-sm font-bold">{formatPrice(currentPrice)}</p>
              </div>
              <p className="text-[#e31837] font-black sm:hidden" style={{ fontFamily: 'var(--font-heading)' }}>
                {formatPrice(currentPrice)}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button
                size="lg"
                variant={wishlisted ? 'default' : 'outline'}
                className={`h-10 w-10 p-0 ${wishlisted ? 'bg-red-500 hover:bg-red-600 border-red-500' : ''}`}
                onClick={() => {
                  if (wishlisted) { removeFromWishlist(product.id); toast.success('Đã bỏ yêu thích'); }
                  else { addToWishlist(product.id); toast.success('Đã thêm vào yêu thích'); }
                }}
              >
                <Heart className={`h-5 w-5 ${wishlisted ? 'fill-current' : ''}`} />
              </Button>
              <Button
                size="lg"
                onClick={handleAddToCart}
                className="font-bold bg-gradient-to-r from-[#e31837] to-[#c91432] hover:from-[#c91432] hover:to-[#a50f28] border-0 shadow-md"
              >
                <ShoppingCart className="mr-2 h-4 w-4" /> Thêm vào giỏ
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ---- Price History ---- */}
      {product.priceHistory && product.priceHistory.length >= 2 && (
        <Card className="border-0 shadow-sm mt-8">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingDown className="h-5 w-5 text-primary" />
              Lịch sử giá
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PriceHistoryChart history={product.priceHistory} currentPrice={currentPrice} />
          </CardContent>
        </Card>
      )}

      {/* ---- Installment Plans ---- */}
      <InstallmentSection productPrice={currentPrice} productName={product.name} />

      {/* ---- Combo Deals ---- */}
      {combos.length > 0 && (
        <div className="mt-8 space-y-3">
          <h2 className="flex items-center gap-2" style={{ fontSize: '1.1rem', fontWeight: 700 }}>
            <Zap className="h-5 w-5 text-orange-500" /> Combo ưu đãi
          </h2>
          {combos.map(combo => (
            <Card key={combo.id} className="border-0 shadow-sm overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-orange-400 to-red-500" />
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className="bg-orange-500 text-white border-0 text-[11px]">COMBO</Badge>
                      <p style={{ fontWeight: 600 }}>{combo.name}</p>
                    </div>
                    <p className="text-muted-foreground text-sm">{combo.description}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-muted-foreground text-sm line-through">{formatPrice(combo.totalOriginalPrice)}</p>
                    <p className="text-primary text-xl" style={{ fontWeight: 700 }}>{formatPrice(combo.comboPrice)}</p>
                    <Badge variant="secondary" className="text-green-600 bg-green-50 mt-1">
                      Tiết kiệm {formatPrice(combo.savings)}
                    </Badge>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-3">
                  {combo.products.map(cp => (
                    <div key={cp.productId} className="flex items-center gap-2 p-2 rounded-lg bg-muted/40 flex-1 min-w-40">
                      <img src={cp.productImage} alt={cp.productName} className="h-10 w-10 rounded-lg object-cover shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs truncate" style={{ fontWeight: 500 }}>{cp.productName}</p>
                        <div className="flex items-center gap-1.5">
                          <span className="text-primary text-xs" style={{ fontWeight: 600 }}>{formatPrice(cp.comboPrice)}</span>
                          {cp.originalPrice !== cp.comboPrice && (
                            <span className="text-muted-foreground text-[11px] line-through">{formatPrice(cp.originalPrice)}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <Button
                  className="w-full mt-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 border-0"
                  onClick={() => {
                    toast.success('Đã thêm combo vào giỏ hàng!');
                  }}
                >
                  <Package className="mr-2 h-4 w-4" />
                  Mua combo — {formatPrice(combo.comboPrice)}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Tabs defaultValue="description" className="mt-10">
        <TabsList className="bg-muted/50 p-1 rounded-xl">
          <TabsTrigger value="description" className="rounded-lg">Mô tả</TabsTrigger>
          <TabsTrigger value="specs" className="rounded-lg">Thông số kỹ thuật</TabsTrigger>
          <TabsTrigger value="camera" className="rounded-lg">Ảnh chụp thực tế</TabsTrigger>
          <TabsTrigger value="reviews" className="rounded-lg">Đánh giá ({reviewTotal})</TabsTrigger>
        </TabsList>

        <TabsContent value="description" className="mt-5">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <p className="leading-relaxed">{product.description}</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="specs" className="mt-5">
          <Card className="border-0 shadow-lg bg-white overflow-hidden">
            <CardHeader className="bg-gray-50 border-b border-gray-100 pb-4">
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <Cpu className="h-5 w-5 text-primary" />
                Cấu hình chi tiết
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-100">
                <div className="p-6 space-y-2">
                  {Object.entries(product.specifications).slice(0, Math.ceil(Object.keys(product.specifications).length / 2)).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center py-2.5 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors px-3 rounded-lg">
                      <span className="text-muted-foreground font-medium text-sm w-[40%]">{key}</span>
                      <span className="text-sm font-semibold text-right w-[60%]">{value}</span>
                    </div>
                  ))}
                </div>
                <div className="p-6 space-y-2">
                  {Object.entries(product.specifications).slice(Math.ceil(Object.keys(product.specifications).length / 2)).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center py-2.5 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors px-3 rounded-lg">
                      <span className="text-muted-foreground font-medium text-sm w-[40%]">{key}</span>
                      <span className="text-sm font-semibold text-right w-[60%]">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="camera" className="mt-5">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <Camera className="h-5 w-5 text-primary" />
                Trải nghiệm camera thực tế
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="relative rounded-2xl overflow-hidden group shadow-md">
                    <img src="https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800" alt="Chụp ngày" className="w-full h-64 object-cover transform group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
                    <Badge className="absolute bottom-4 left-4 bg-white/20 backdrop-blur-md text-white border-0 z-10 px-3 py-1 shadow-sm">Chụp ban ngày</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">Chất lượng ảnh xuất sắc trong điều kiện đủ sáng. Độ chi tiết cao, dải nhạy sáng rộng và màu sắc tái tạo trung thực.</p>
                </div>
                <div className="space-y-3">
                  <div className="relative rounded-2xl overflow-hidden group shadow-md">
                    <img src="https://images.unsplash.com/photo-1505322022379-7a5658eaf029?w=800" alt="Chụp đêm" className="w-full h-64 object-cover transform group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
                    <Badge className="absolute bottom-4 left-4 bg-white/20 backdrop-blur-md text-white border-0 z-10 px-3 py-1 shadow-sm">Night Mode</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">Khả năng chụp đêm ấn tượng. Chế độ chụp ban đêm tự động kích hoạt giúp khử nhiễu tuyệt vời và thu được nhiều ánh sáng.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reviews" className="mt-5 space-y-4">
          <StarDistributionBar distribution={starDistribution} total={reviewTotal} avgRating={avgRating} />

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <ReviewFilterBar
              starFilter={starFilter}
              onStarFilterChange={v => { setStarFilter(v); setReviewPage(1); }}
              verifiedOnly={verifiedOnly}
              onVerifiedChange={v => { setVerifiedOnly(v); setReviewPage(1); }}
              hasImages={hasImages}
              onHasImagesChange={v => { setHasImages(v); setReviewPage(1); }}
              sortBy={reviewSort}
              onSortChange={setReviewSort}
            />
            <Button onClick={() => setShowWriteReview(true)}>
              <Send className="mr-2 h-4 w-4" /> Viết đánh giá
            </Button>
          </div>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-6 space-y-4">
              {reviews.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">Chưa có đánh giá phù hợp</p>
              ) : (
                reviews.map(review => (
                  <ReviewItem
                    key={review.id}
                    review={review}
                    currentUserId={user?.id}
                    onHelpful={handleHelpful}
                    onEdit={r => setEditReview(r)}
                    onDelete={handleDeleteReview}
                  />
                ))
              )}
              {reviewTotal > 5 && (
                <div className="flex items-center justify-center gap-2 pt-4">
                  <Button variant="outline" size="sm" disabled={reviewPage <= 1} onClick={() => setReviewPage(p => p - 1)}>
                    Trước
                  </Button>
                  <span className="text-muted-foreground text-sm">
                    Trang {reviewPage} / {Math.ceil(reviewTotal / 5)}
                  </span>
                  <Button variant="outline" size="sm" disabled={reviewPage >= Math.ceil(reviewTotal / 5)} onClick={() => setReviewPage(p => p + 1)}>
                    Sau
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Review dialogs */}
      <WriteReviewDialog open={showWriteReview} onOpenChange={setShowWriteReview} onSubmit={handleSubmitReview} productName={product.name} />
      <WriteReviewDialog
        open={!!editReview}
        onOpenChange={v => { if (!v) setEditReview(null); }}
        onSubmit={handleEditReview}
        editReview={editReview}
        productName={product.name}
      />
    </div>
  );
}

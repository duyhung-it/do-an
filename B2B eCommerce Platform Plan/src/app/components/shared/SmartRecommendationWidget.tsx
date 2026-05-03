// ============================================================
// SmartRecommendationWidget — Widget gợi ý sản phẩm thông minh
// Nhóm 42: AI-powered recommendations, "Khách cũng mua"
// Dùng chung: HomePage, ProductDetailPage, CartPage, OrderList
// ============================================================

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import {
  Sparkles, Star, ShoppingCart, Heart, ChevronLeft, ChevronRight,
  TrendingUp, Users, Clock, Zap, RefreshCw,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { productApi } from '../../services/api';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';
import type { Product } from '../../types';

export type RecommendationType =
  | 'similar'        // Sản phẩm tương tự (cùng category)
  | 'frequently-bought-together'  // Thường mua cùng
  | 'trending'       // Đang xu hướng
  | 'recently-viewed' // Xem gần đây
  | 'personalized'   // Dựa trên lịch sử mua
  | 'accessories'    // Phụ kiện tương thích
  | 'flash-deals';   // Deal nhanh - giảm sâu

interface SmartRecommendationWidgetProps {
  type: RecommendationType;
  productId?: string;        // Gợi ý liên quan đến sp này
  currentProductIds?: string[]; // Loại trừ các sp này
  maxItems?: number;
  compact?: boolean;         // Compact mode: height giảm, ít info
  showTitle?: boolean;
  className?: string;
}

const TYPE_CONFIG: Record<RecommendationType, {
  title: string;
  subtitle: string;
  icon: typeof Sparkles;
  badgeText?: string;
  badgeColor?: string;
}> = {
  'similar': {
    title: 'Sản phẩm tương tự',
    subtitle: 'Cùng phân khúc và tính năng',
    icon: TrendingUp,
  },
  'frequently-bought-together': {
    title: 'Thường mua cùng',
    subtitle: 'Khách hàng hay mua kết hợp',
    icon: Users,
    badgeText: 'Combo',
    badgeColor: 'bg-blue-500',
  },
  'trending': {
    title: 'Đang hot hôm nay',
    subtitle: 'Được quan tâm nhiều nhất',
    icon: Zap,
    badgeText: 'Trending',
    badgeColor: 'bg-orange-500',
  },
  'recently-viewed': {
    title: 'Bạn đã xem gần đây',
    subtitle: 'Dựa trên lịch sử duyệt web',
    icon: Clock,
  },
  'personalized': {
    title: 'Gợi ý cho bạn',
    subtitle: 'Dựa trên đơn hàng của bạn',
    icon: Sparkles,
    badgeText: 'AI Picks',
    badgeColor: 'bg-purple-500',
  },
  'accessories': {
    title: 'Phụ kiện tương thích',
    subtitle: 'Hoàn thiện trải nghiệm của bạn',
    icon: Sparkles,
    badgeText: 'Phụ kiện',
    badgeColor: 'bg-green-500',
  },
  'flash-deals': {
    title: 'Flash Deals hôm nay',
    subtitle: 'Giảm giá sâu - số lượng có hạn',
    icon: Zap,
    badgeText: 'Sale',
    badgeColor: 'bg-red-500',
  },
};

const formatPrice = (p: number) => new Intl.NumberFormat('vi-VN', {
  style: 'currency', currency: 'VND',
}).format(p);

// ---- Mini Product Card ----
function MiniProductCard({ product, compact = false }: { product: Product; compact?: boolean }) {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addItem } = useCart();
  const [adding, setAdding] = useState(false);
  const [wished, setWished] = useState(false);

  const discountPct = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : product.discountPercent ?? 0;

  const handleCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) { toast.error('Vui lòng đăng nhập'); navigate('/login'); return; }
    setAdding(true);
    try {
      await addItem({
        productId: product.id,
        productName: product.name,
        productImage: product.images?.[0],
        brand: product.brand,
        quantity: 1,
        unitPrice: product.price,
        originalPrice: product.originalPrice,
        totalPrice: product.price,
        variantId: product.variants?.[0]?.id,
        variantName: product.variants?.[0]?.name,
      });
      toast.success('Đã thêm vào giỏ hàng!');
    } finally {
      setAdding(false);
    }
  };

  return (
    <Link to={`/products/${product.id}`}>
      <div className={`group bg-white dark:bg-card rounded-xl border hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden ${compact ? '' : 'h-full'}`}>
        {/* Image */}
        <div className={`relative bg-gray-50 overflow-hidden ${compact ? 'aspect-square' : 'aspect-[4/3]'}`}>
          <ImageWithFallback
            src={product.images?.[0]}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {discountPct > 0 && (
            <div className="absolute top-1.5 left-1.5 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              -{discountPct}%
            </div>
          )}
          {product.isNew && (
            <Badge className="absolute top-1.5 right-1.5 bg-green-500 text-white border-0 text-[10px] py-0 px-1.5">Mới</Badge>
          )}
          {/* Hover actions */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
          <div className="absolute bottom-1.5 right-1.5 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              title="Yêu thích"
              className={`h-7 w-7 rounded-full bg-white/95 shadow flex items-center justify-center hover:bg-white transition-colors ${wished ? 'text-red-500' : 'text-gray-400'}`}
              onClick={e => { e.preventDefault(); setWished(!wished); }}
            >
              <Heart className={`h-3.5 w-3.5 ${wished ? 'fill-current' : ''}`} />
            </button>
            <button
              title="Thêm vào giỏ"
              className="h-7 w-7 rounded-full bg-red-500 shadow flex items-center justify-center hover:bg-red-600 transition-colors"
              onClick={handleCart}
              disabled={adding}
            >
              {adding
                ? <span className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : <ShoppingCart className="h-3.5 w-3.5 text-white" />
              }
            </button>
          </div>
        </div>

        {/* Info */}
        <div className={`p-2.5 ${compact ? 'pb-2' : 'pb-3'}`}>
          <p className="text-[11px] text-muted-foreground mb-0.5">{product.brand}</p>
          <p className={`font-medium line-clamp-2 leading-tight mb-1.5 group-hover:text-red-600 transition-colors ${compact ? 'text-xs' : 'text-sm'}`}>
            {product.name}
          </p>

          {/* Stars (compact mode omits) */}
          {!compact && (
            <div className="flex items-center gap-1 mb-1.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={`h-3 w-3 ${i < Math.floor(product.rating ?? 0) ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200'}`} />
              ))}
              <span className="text-[10px] text-muted-foreground">({product.reviewCount ?? 0})</span>
            </div>
          )}

          {/* Price */}
          <div>
            <p className="text-red-600 font-bold text-sm">{formatPrice(product.price)}</p>
            {product.originalPrice && product.originalPrice > product.price && (
              <p className="text-[11px] text-muted-foreground line-through">{formatPrice(product.originalPrice)}</p>
            )}
          </div>

          {/* Stock warning */}
          {(product.stock ?? 0) > 0 && (product.stock ?? 99) <= 5 && (
            <p className="text-[10px] text-orange-500 mt-1 font-medium">⚡ Chỉ còn {product.stock} sp</p>
          )}
        </div>
      </div>
    </Link>
  );
}

// ---- Carousel Navigator ----
function useCarousel(total: number, perPage: number) {
  const [page, setPage] = useState(0);
  const maxPage = Math.max(0, Math.ceil(total / perPage) - 1);
  return {
    page,
    maxPage,
    canPrev: page > 0,
    canNext: page < maxPage,
    prev: () => setPage(p => Math.max(0, p - 1)),
    next: () => setPage(p => Math.min(maxPage, p + 1)),
    start: page * perPage,
    end: page * perPage + perPage,
  };
}

// ---- Main Widget ----
export function SmartRecommendationWidget({
  type,
  productId,
  currentProductIds = [],
  maxItems = 8,
  compact = false,
  showTitle = true,
  className = '',
}: SmartRecommendationWidgetProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const config = TYPE_CONFIG[type];
  const Icon = config.icon;

  // Responsive: items per row
  const perPage = compact ? 4 : 4;
  const carousel = useCarousel(products.length, perPage);
  const displayed = products.slice(carousel.start, carousel.end);

  const load = async () => {
    setLoading(true);
    try {
      let result: Product[] = [];
      switch (type) {
        case 'trending':
        case 'flash-deals':
          result = await productApi.getHot(maxItems);
          break;
        case 'recently-viewed':
        case 'personalized':
          result = await productApi.getFeatured(maxItems);
          break;
        case 'accessories':
        case 'frequently-bought-together':
        case 'similar':
        default:
          if (productId) {
            result = await productApi.getSimilar?.(productId, maxItems) ?? await productApi.getFeatured(maxItems);
          } else {
            result = await productApi.getFeatured(maxItems);
          }
          break;
      }
      // Filter out current products
      result = result.filter(p => !currentProductIds.includes(p.id)).slice(0, maxItems);
      setProducts(result);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [type, productId]);

  if (loading) {
    return (
      <div className={className}>
        {showTitle && (
          <div className="flex items-center gap-2 mb-4">
            <div className="h-5 w-5 rounded bg-muted animate-pulse" />
            <div className="h-5 w-40 rounded bg-muted animate-pulse" />
          </div>
        )}
        <div className={`grid gap-3 ${compact ? 'grid-cols-4' : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'}`}>
          {[...Array(compact ? 4 : 4)].map((_, i) => (
            <div key={i} className="rounded-xl bg-muted animate-pulse aspect-[3/4]" />
          ))}
        </div>
      </div>
    );
  }

  if (!products.length) return null;

  return (
    <div className={className}>
      {/* Header */}
      {showTitle && (
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {config.badgeText && (
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full text-white ${config.badgeColor}`}>
                {config.badgeText}
              </span>
            )}
            <div>
              <h3 className="font-bold text-lg flex items-center gap-1.5">
                <Icon className="h-5 w-5 text-primary" />
                {config.title}
              </h3>
              <p className="text-xs text-muted-foreground">{config.subtitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={load} title="Làm mới">
              <RefreshCw className="h-3.5 w-3.5" />
            </Button>
            <div className="flex gap-1">
              <Button
                variant="outline" size="icon" className="h-8 w-8"
                disabled={!carousel.canPrev} onClick={carousel.prev}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline" size="icon" className="h-8 w-8"
                disabled={!carousel.canNext} onClick={carousel.next}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Product grid */}
      <div className={`grid gap-3 ${compact ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'}`}>
        {displayed.map(p => (
          <MiniProductCard key={p.id} product={p} compact={compact} />
        ))}
      </div>

      {/* Pagination dots */}
      {carousel.maxPage > 0 && (
        <div className="flex justify-center gap-1.5 mt-4">
          {Array.from({ length: carousel.maxPage + 1 }).map((_, i) => (
            <button
              key={i}
              className={`h-1.5 rounded-full transition-all ${i === carousel.page ? 'w-6 bg-primary' : 'w-1.5 bg-muted-foreground/30'}`}
              onClick={() => carousel['page'] !== i && (i < carousel.page ? carousel.prev() : carousel.next())}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ---- Convenience: Frequently Bought Together ----
export function FrequentlyBoughtTogetherSection({ productId, productName }: {
  productId: string;
  productName: string;
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Users className="h-5 w-5 text-blue-500" />
          Thường mua cùng với "{productName.slice(0, 30)}{productName.length > 30 ? '...' : ''}"
        </CardTitle>
      </CardHeader>
      <CardContent>
        <SmartRecommendationWidget
          type="frequently-bought-together"
          productId={productId}
          currentProductIds={[productId]}
          maxItems={4}
          compact={true}
          showTitle={false}
        />
      </CardContent>
    </Card>
  );
}

// ---- Convenience: Accessories ----
export function CompatibleAccessoriesSection({ productId, productName }: {
  productId: string;
  productName: string;
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="h-5 w-5 text-green-500" />
          Phụ kiện tương thích với {productName.split(' ').slice(0, 3).join(' ')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <SmartRecommendationWidget
          type="accessories"
          productId={productId}
          currentProductIds={[productId]}
          maxItems={4}
          compact={true}
          showTitle={false}
        />
      </CardContent>
    </Card>
  );
}

// ---- Convenience: Personalized (for auth users) ----
export function PersonalizedSection() {
  return (
    <section className="container mx-auto px-4 py-8">
      <SmartRecommendationWidget
        type="personalized"
        maxItems={8}
        showTitle={true}
        className="mb-2"
      />
    </section>
  );
}

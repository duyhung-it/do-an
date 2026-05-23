// ============================================================
// So sánh sản phẩm — Buyer (P3 Đợt 6: P3.09–P3.10)
// Sticky header, best/worst price highlight, mobile scroll
// ============================================================

import { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router';
import {
  X, Plus, ArrowLeft, Star, ShoppingCart, Heart, Trophy,
  TrendingDown, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { AppBreadcrumb } from '../shared/AppBreadcrumb';
import { IconWrapper } from '../shared/IconWrapper';
import { productApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import type { Product } from '../../types';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { toast } from 'sonner';

const formatPrice = (price: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(price);

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

const MAX_COMPARE = 4;

export function ProductComparePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addItem } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const [products, setProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [showPicker, setShowPicker] = useState(false);
  const [search, setSearch] = useState('');
  const [addingToCart, setAddingToCart] = useState<string | null>(null);

  const ids = searchParams.get('ids')?.split(',').filter(Boolean) ?? [];

  useEffect(() => {
    Promise.all(ids.map(id => productApi.getById(id))).then(results => {
      setProducts(results.filter((p): p is Product => !!p));
    });
  }, [searchParams]);

  useEffect(() => {
    if (showPicker) {
      productApi.getPaginated({ page: 1, pageSize: 50 }).then(res => setAllProducts(res.data));
    }
  }, [showPicker]);

  const addProduct = (id: string) => {
    const newIds = [...ids, id];
    setSearchParams({ ids: newIds.join(',') });
    setShowPicker(false); setSearch('');
  };

  const removeProduct = (id: string) => {
    const newIds = ids.filter(i => i !== id);
    setSearchParams(newIds.length > 0 ? { ids: newIds.join(',') } : {});
  };

  const allSpecKeys = [...new Set(products.flatMap(p => Object.keys(p.specifications)))];

  const filteredPickerProducts = allProducts
    .filter(p => !ids.includes(p.id))
    .filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase()));

  const handleAddToCart = async (product: Product) => {
    if (!isAuthenticated) { toast.error('Vui lòng đăng nhập'); navigate('/login'); return; }
    setAddingToCart(product.id);
    try {
      const retailMeta = getProductRetailMeta(product);
      await addItem({
        productId: product.id, productName: product.name, productImage: product.images[0],
        supplierId: retailMeta.storeId, supplierName: retailMeta.storeName,
        quantity: retailMeta.minQty, unitPrice: product.price,
      });
      toast.success(`Đã thêm "${product.name}" vào giỏ hàng`);
    } finally { setAddingToCart(null); }
  };

  // P3.09: Find best/worst prices
  const prices = products.map(p => p.price);
  const bestPrice = prices.length > 0 ? Math.min(...prices) : 0;
  const worstPrice = prices.length > 0 ? Math.max(...prices) : 0;

  const colCount = Math.min(products.length + (products.length < MAX_COMPARE ? 1 : 0), MAX_COMPARE);

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <AppBreadcrumb items={[{ label: 'Sản phẩm', href: '/products' }, { label: 'So sánh' }]} />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2" style={{ fontFamily: 'var(--font-heading)' }}>
            <Trophy className="h-6 w-6 text-primary" />
            So sánh sản phẩm
          </h1>
          <p className="text-muted-foreground mt-1">So sánh tối đa {MAX_COMPARE} sản phẩm cùng lúc</p>
        </div>
        <Link to="/products">
          <Button variant="outline"><ArrowLeft className="mr-2 h-4 w-4" /> Quay lại</Button>
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-16">
          <Trophy className="h-12 w-12 mx-auto mb-3 text-muted-foreground/30" />
          <p className="text-muted-foreground mb-4">Chưa có sản phẩm nào để so sánh</p>
          <Link to="/products"><Button>Chọn sản phẩm</Button></Link>
        </div>
      ) : (
        /* P3.10: Mobile horizontal scroll, P3.09: sticky header */
        <div className="overflow-x-auto -mx-4 px-4 pb-4">
          <div style={{ minWidth: `${200 + colCount * 220}px` }}>
            {/* P3.09: Sticky header row */}
            <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm pb-3">
              <div className="grid gap-3" style={{ gridTemplateColumns: `180px repeat(${colCount}, 1fr)` }}>
                {/* P3.10: Fixed left column label */}
                <div className="flex items-end pb-2">
                  <p className="text-sm text-muted-foreground">{products.length} sản phẩm</p>
                </div>
                {products.map(product => (
                  <Card key={product.id} className="relative overflow-hidden group">
                    <button
                      className="absolute top-2 right-2 h-6 w-6 rounded-lg bg-destructive/10 hover:bg-destructive/20 flex items-center justify-center z-10 transition-colors"
                      onClick={() => removeProduct(product.id)}
                    >
                      <X className="h-3 w-3 text-destructive" />
                    </button>
                    <div className="aspect-[4/3] overflow-hidden">
                      <ImageWithFallback src={product.images[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    </div>
                    <CardContent className="p-3 text-center">
                      <Link to={`/products/${product.id}`} className="hover:underline text-sm line-clamp-2" style={{ fontFamily: 'var(--font-heading)' }}>
                        {product.name}
                      </Link>
                      {/* P3.09: Price highlight */}
                      <p className={`mt-1 ${
                        products.length > 1 && product.price === bestPrice
                          ? 'text-emerald-600'
                          : products.length > 1 && product.price === worstPrice
                          ? 'text-red-500'
                          : 'text-primary'
                      }`} style={{ fontFamily: 'var(--font-heading)' }}>
                        {formatPrice(product.price)}
                      </p>
                      {products.length > 1 && product.price === bestPrice && (
                        <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-[10px] mt-1">
                          <TrendingDown className="h-2.5 w-2.5 mr-0.5" /> Giá tốt nhất
                        </Badge>
                      )}
                    </CardContent>
                  </Card>
                ))}
                {products.length < MAX_COMPARE && (
                  <Card
                    className="flex items-center justify-center min-h-[200px] border-dashed border-2 cursor-pointer hover:bg-muted/30 hover:border-primary/30 transition-all"
                    onClick={() => setShowPicker(true)}
                  >
                    <div className="text-center text-muted-foreground">
                      <Plus className="h-8 w-8 mx-auto mb-2" />
                      <p className="text-sm">Thêm SP</p>
                    </div>
                  </Card>
                )}
              </div>
            </div>

            {/* Comparison rows */}
            <div className="space-y-0 mt-2">
              {/* Basic info */}
              {[
                { label: 'Danh mục', getValue: (p: Product) => <Badge variant="secondary" className="text-xs">{p.categoryName}</Badge> },
                { label: 'Đơn vị bán', getValue: (p: Product) => <span className="text-sm">{getProductRetailMeta(p).storeName}</span> },
                {
                  label: 'Giá', getValue: (p: Product) => (
                    <span className={`${
                      products.length > 1 && p.price === bestPrice ? 'text-emerald-600' :
                      products.length > 1 && p.price === worstPrice ? 'text-red-500' : 'text-primary'
                    }`} style={{ fontFamily: 'var(--font-heading)' }}>
                      {formatPrice(p.price)}
                      {products.length > 1 && p.price === bestPrice && <TrendingDown className="inline h-3 w-3 ml-1" />}
                    </span>
                  ),
                },
                { label: 'Số lượng mua', getValue: (p: Product) => {
                  const retailMeta = getProductRetailMeta(p);
                  return <span className="text-sm">Từ {retailMeta.minQty} {retailMeta.unit}</span>;
                } },
                {
                  label: 'Đánh giá', getValue: (p: Product) => (
                    <div className="flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      <span className="text-sm" style={{ fontFamily: 'var(--font-heading)' }}>{p.rating}</span>
                      <span className="text-xs text-muted-foreground">({p.reviewCount})</span>
                    </div>
                  ),
                },
                { label: 'Trạng thái', getValue: (p: Product) => <Badge variant="outline" className="text-xs">{p.status}</Badge> },
              ].map((row, ri) => (
                <div
                  key={row.label}
                  className={`grid gap-3 py-3 px-3 rounded-lg ${ri % 2 === 0 ? 'bg-muted/20' : ''}`}
                  style={{ gridTemplateColumns: `180px repeat(${products.length}, 1fr)` }}
                >
                  {/* P3.10: Fixed label */}
                  <div className="text-sm text-muted-foreground sticky left-0 bg-inherit flex items-center" style={{ fontFamily: 'var(--font-heading)' }}>
                    {row.label}
                  </div>
                  {products.map(p => (
                    <div key={p.id} className="flex items-center">{row.getValue(p)}</div>
                  ))}
                </div>
              ))}

              {/* Specs */}
              {allSpecKeys.length > 0 && (
                <>
                  <div className="py-3 px-3 rounded-lg bg-primary/5 mt-2">
                    <span className="text-sm" style={{ fontFamily: 'var(--font-heading)' }}>Thông số kỹ thuật</span>
                  </div>
                  {allSpecKeys.map((key, ki) => (
                    <div
                      key={key}
                      className={`grid gap-3 py-3 px-3 rounded-lg ${ki % 2 === 0 ? 'bg-muted/20' : ''}`}
                      style={{ gridTemplateColumns: `180px repeat(${products.length}, 1fr)` }}
                    >
                      <div className="text-sm text-muted-foreground sticky left-0 bg-inherit">{key}</div>
                      {products.map(p => (
                        <div key={p.id} className="text-sm">{p.specifications[key] || <span className="text-muted-foreground">—</span>}</div>
                      ))}
                    </div>
                  ))}
                </>
              )}

              {/* Variants */}
              <div className="py-3 px-3 rounded-lg bg-primary/5 mt-2">
                <span className="text-sm" style={{ fontFamily: 'var(--font-heading)' }}>Phân loại / Biến thể</span>
              </div>
              <div
                className="grid gap-3 py-3 px-3"
                style={{ gridTemplateColumns: `180px repeat(${products.length}, 1fr)` }}
              >
                <div className="text-sm text-muted-foreground sticky left-0">Các loại</div>
                {products.map(p => (
                  <div key={p.id} className="space-y-1">
                    {p.variants.map(v => (
                      <div key={v.id} className="flex items-center justify-between text-sm">
                        <span>{v.name}</span>
                        <span className="text-muted-foreground">{formatPrice(v.price)}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div
                className="grid gap-3 py-4 px-3 bg-muted/20 rounded-lg mt-2"
                style={{ gridTemplateColumns: `180px repeat(${products.length}, 1fr)` }}
              >
                <div className="text-sm sticky left-0" style={{ fontFamily: 'var(--font-heading)' }}>Hành động</div>
                {products.map(p => (
                  <div key={p.id} className="flex flex-col gap-2">
                    <Button size="sm" onClick={() => handleAddToCart(p)} disabled={addingToCart === p.id} className="gap-1">
                      {addingToCart === p.id
                        ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                        : <><ShoppingCart className="h-3.5 w-3.5" /> Thêm giỏ</>
                      }
                    </Button>
                    <Button
                      size="sm" variant={isInWishlist(p.id) ? 'default' : 'outline'}
                      className={`w-full ${isInWishlist(p.id) ? 'bg-red-500 hover:bg-red-600 border-red-500' : ''}`}
                      onClick={() => {
                        if (isInWishlist(p.id)) { removeFromWishlist(p.id); toast.success('Bỏ yêu thích'); }
                        else { addToWishlist(p.id); toast.success('Đã yêu thích'); }
                      }}
                    >
                      <Heart className={`mr-1 h-3.5 w-3.5 ${isInWishlist(p.id) ? 'fill-current' : ''}`} />
                      {isInWishlist(p.id) ? 'Đã thích' : 'Yêu thích'}
                    </Button>
                    <Link to={`/products/${p.id}`}>
                      <Button size="sm" variant="outline" className="w-full">Chi tiết</Button>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Product picker modal */}
      {showPicker && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setShowPicker(false)}>
          <Card className="w-full max-w-lg max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b">
              <div className="flex items-center justify-between mb-3">
                <h3 style={{ fontFamily: 'var(--font-heading)' }}>Chọn sản phẩm</h3>
                <Button variant="ghost" size="sm" onClick={() => setShowPicker(false)}><X className="h-4 w-4" /></Button>
              </div>
              <input
                className="w-full px-3 py-2.5 rounded-xl border bg-muted/30 focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="Tìm sản phẩm..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                autoFocus
              />
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              {filteredPickerProducts.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">Không tìm thấy</p>
              ) : (
                filteredPickerProducts.slice(0, 20).map(product => (
                  <button
                    key={product.id}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-muted/40 transition-colors text-left"
                    onClick={() => addProduct(product.id)}
                  >
                    <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0">
                      <ImageWithFallback src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="line-clamp-1 text-sm">{product.name}</p>
                      <p className="text-muted-foreground text-xs">{product.categoryName} · {formatPrice(product.price)}</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

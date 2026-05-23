// ============================================================
// Trang Wishlist — Buyer (P3 Đợt 6: P3.01–P3.03)
// Masonry grid, Collections tabs, Price compare
// ============================================================

import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router';
import {
  Heart, ShoppingCart, Trash2, ArrowUpDown, Eye, GitCompareArrows,
  PackageOpen, Folder, TrendingUp, TrendingDown, Minus,
} from 'lucide-react';
import Masonry, { ResponsiveMasonry } from 'react-responsive-masonry';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { ViewToggle } from '../shared/ViewToggle';
import { AppBreadcrumb } from '../shared/AppBreadcrumb';
import { IconWrapper } from '../shared/IconWrapper';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import type { ViewMode, WishlistItem } from '../../types';
import { mockWishlistFolders } from '../../data/mockData';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { toast } from 'sonner';

const formatPrice = (price: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(price);

type SortOption = 'newest' | 'price-asc' | 'price-desc' | 'name-asc';

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'newest', label: 'Mới nhất' },
  { value: 'price-asc', label: 'Giá thấp → cao' },
  { value: 'price-desc', label: 'Giá cao → thấp' },
  { value: 'name-asc', label: 'Tên A-Z' },
];

const wishlistMeta = (item: WishlistItem) => {
  const extra = item as WishlistItem & {
    supplierId?: string;
    supplierName?: string;
    minOrderQty?: number;
    unit?: string;
  };
  return {
    supplierId: extra.supplierId ?? 'cellphones',
    supplierName: extra.supplierName ?? 'CELLPHONES',
    quantity: extra.minOrderQty ?? 1,
    unit: extra.unit ?? 'sp',
  };
};

function sortItems(items: WishlistItem[], sortBy: SortOption): WishlistItem[] {
  const sorted = [...items];
  switch (sortBy) {
    case 'newest': return sorted.sort((a, b) => b.addedAt.localeCompare(a.addedAt));
    case 'price-asc': return sorted.sort((a, b) => a.price - b.price);
    case 'price-desc': return sorted.sort((a, b) => b.price - a.price);
    case 'name-asc': return sorted.sort((a, b) => a.productName.localeCompare(b.productName));
    default: return sorted;
  }
}

// P3.02: Collections — DB-C.19: sử dụng WishlistFolder thật thay vì hardcode
// Giữ fallback getCollection() cho item chưa có folderId
type Collection = 'all' | string; // 'all' hoặc folderId

// P3.03: Mock "price when added"
function getMockOldPrice(item: WishlistItem): number {
  // Deterministic mock based on item id hash
  const hash = item.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const delta = ((hash % 20) - 10) / 100; // -10% to +10%
  return Math.round(item.price * (1 + delta));
}

// ─── P3.03: Price Compare Badge ───────────────────────────
function PriceCompare({ current, old }: { current: number; old: number }) {
  if (current === old) return null;
  const diff = current - old;
  const pct = Math.round((diff / old) * 100);
  const isUp = diff > 0;

  return (
    <div className={`inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded-full ${
      isUp
        ? 'bg-red-100 text-red-600 dark:bg-red-950/20 dark:text-red-400'
        : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400'
    }`}>
      {isUp ? <TrendingUp className="h-2.5 w-2.5" /> : <TrendingDown className="h-2.5 w-2.5" />}
      {isUp ? '+' : ''}{pct}%
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// Main
// ═══════════════════════════════════════════════════════════
export function BuyerWishlistPage() {
  const navigate = useNavigate();
  const { items, removeById, clearWishlist } = useWishlist();
  const { addItem } = useCart();
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [addingToCart, setAddingToCart] = useState<string | null>(null);
  const [activeCollection, setActiveCollection] = useState<Collection>('all');

  // DB-C.19: Dùng folderId thật từ WishlistFolder
  const folders = mockWishlistFolders;

  const filteredItems = useMemo(() => {
    if (activeCollection === 'all') return items;
    // Lọc theo folderId
    return items.filter(item => item.folderId === activeCollection);
  }, [items, activeCollection]);

  const sortedItems = useMemo(() => sortItems(filteredItems, sortBy), [filteredItems, sortBy]);

  // Folder counts (thay cho collectionCounts cũ)
  const folderCounts = useMemo(() => {
    const counts: Record<string, number> = { all: items.length };
    folders.forEach(f => { counts[f.id] = 0; });
    items.forEach(item => {
      if (item.folderId && counts[item.folderId] !== undefined) {
        counts[item.folderId]++;
      }
    });
    return counts;
  }, [items, folders]);

  const handleAddToCart = async (item: WishlistItem, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setAddingToCart(item.id);
    const meta = wishlistMeta(item);
    try {
      await addItem({
        productId: item.productId, productName: item.productName,
        productImage: item.productImage, supplierId: meta.supplierId,
        supplierName: meta.supplierName, quantity: meta.quantity, unitPrice: item.price,
      });
      toast.success(`Đã thêm "${item.productName}" vào giỏ hàng`);
    } finally { setAddingToCart(null); }
  };

  const handleRemove = async (item: WishlistItem, e?: React.MouseEvent) => {
    e?.stopPropagation();
    await removeById(item.id);
    toast.success(`Đã xoá "${item.productName}" khỏi yêu thích`);
  };

  const handleAddAllToCart = async () => {
    for (const item of sortedItems) {
      const meta = wishlistMeta(item);
      await addItem({
        productId: item.productId, productName: item.productName,
        productImage: item.productImage, supplierId: meta.supplierId,
        supplierName: meta.supplierName, quantity: meta.quantity, unitPrice: item.price,
      });
    }
    toast.success(`Đã thêm ${sortedItems.length} sản phẩm vào giỏ hàng`);
  };

  const handleClearAll = async () => {
    if (!confirm('Bạn có chắc muốn xoá tất cả sản phẩm yêu thích?')) return;
    await clearWishlist();
    toast.success('Đã xoá tất cả');
  };

  // Empty state
  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-6">
        <AppBreadcrumb items={[{ label: 'Yêu thích' }]} />
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="h-20 w-20 rounded-full bg-red-50 dark:bg-red-950/10 flex items-center justify-center mb-4">
            <Heart className="h-10 w-10 text-red-400/50" />
          </div>
          <h2 style={{ fontFamily: 'var(--font-heading)' }}>Bạn chưa có sản phẩm yêu thích</h2>
          <p className="text-muted-foreground mt-2 mb-6 max-w-sm">
            Khám phá sản phẩm và nhấn vào biểu tượng trái tim để thêm vào danh sách yêu thích!
          </p>
          <Link to="/products">
            <Button><PackageOpen className="mr-2 h-4 w-4" /> Khám phá ngay</Button>
          </Link>
        </div>
      </div>
    );
  }

  // ─── P3.01: Masonry Grid Card ───────────────────────────
  const renderMasonryCard = (item: WishlistItem) => {
    const oldPrice = getMockOldPrice(item);
    const meta = wishlistMeta(item);
    return (
      <div
        key={item.id}
        className="group cursor-pointer"
        onClick={() => navigate(`/products/${item.productId}`)}
      >
        <div className="relative rounded-xl overflow-hidden">
          {/* P3.01: aspect-[3/4] image with gradient overlay */}
          <div className="aspect-[3/4] overflow-hidden">
            <ImageWithFallback
              src={item.productImage}
              alt={item.productName}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

          {/* Top actions */}
          <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              className="h-8 w-8 rounded-lg bg-white/90 backdrop-blur-sm text-primary hover:bg-primary hover:text-primary-foreground flex items-center justify-center transition-colors shadow-sm"
              onClick={e => handleAddToCart(item, e)}
              disabled={addingToCart === item.id}
              title="Thêm vào giỏ"
            >
              {addingToCart === item.id ? (
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                <ShoppingCart className="h-3.5 w-3.5" />
              )}
            </button>
            <button
              className="h-8 w-8 rounded-lg bg-white/90 backdrop-blur-sm text-destructive hover:bg-destructive hover:text-destructive-foreground flex items-center justify-center transition-colors shadow-sm"
              onClick={e => handleRemove(item, e)}
              title="Xoá"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Heart icon top left */}
          <div className="absolute top-2 left-2">
            <div className="h-8 w-8 rounded-lg bg-red-500/90 text-white flex items-center justify-center shadow-sm">
              <Heart className="h-4 w-4 fill-current" />
            </div>
          </div>

          {/* Bottom info overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
            <p className="text-sm line-clamp-2 mb-1" style={{ fontFamily: 'var(--font-heading)' }}>
              {item.productName}
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-base" style={{ fontFamily: 'var(--font-heading)' }}>
                {formatPrice(item.price)}
              </span>
              {/* P3.03: Price compare */}
              <PriceCompare current={item.price} old={oldPrice} />
            </div>
            <div className="flex items-center justify-between mt-1.5">
              <span className="text-white/70 text-xs truncate">{meta.supplierName}</span>
              <Badge variant="secondary" className="text-[10px] bg-white/20 text-white border-0">
                {item.categoryName}
              </Badge>
            </div>
          </div>
        </div>

        {/* P3.03: Old price line below card */}
        {oldPrice !== item.price && (
          <div className="mt-1.5 px-1 flex items-center gap-1.5 text-xs text-muted-foreground">
            <span>Giá khi thêm: <span className="line-through">{formatPrice(oldPrice)}</span></span>
            <PriceCompare current={item.price} old={oldPrice} />
          </div>
        )}
      </div>
    );
  };

  // List row
  const renderListRow = (item: WishlistItem) => {
    const oldPrice = getMockOldPrice(item);
    const meta = wishlistMeta(item);
    return (
      <Card
        key={item.id}
        className="hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer"
        onClick={() => navigate(`/products/${item.productId}`)}
      >
        <CardContent className="p-3 flex items-center gap-4">
          <div className="h-20 w-20 rounded-xl overflow-hidden shrink-0 relative">
            <ImageWithFallback src={item.productImage} alt={item.productName} className="w-full h-full object-cover" />
            <div className="absolute top-1 left-1 h-5 w-5 rounded-md bg-red-500/90 text-white flex items-center justify-center">
              <Heart className="h-3 w-3 fill-current" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="truncate" style={{ fontFamily: 'var(--font-heading)' }}>{item.productName}</p>
            <p className="text-muted-foreground text-sm truncate">{meta.supplierName}</p>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <Badge variant="secondary" className="text-xs">{item.categoryName}</Badge>
              <span className="text-muted-foreground text-xs">SL: {meta.quantity} {meta.unit}</span>
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="text-primary" style={{ fontFamily: 'var(--font-heading)' }}>{formatPrice(item.price)}</p>
            {oldPrice !== item.price && (
              <div className="flex items-center gap-1 justify-end mt-0.5">
                <span className="text-xs text-muted-foreground line-through">{formatPrice(oldPrice)}</span>
                <PriceCompare current={item.price} old={oldPrice} />
              </div>
            )}
            <p className="text-muted-foreground text-xs mt-0.5">{item.addedAt}</p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Button variant="ghost" size="sm" onClick={e => { e.stopPropagation(); navigate(`/products/${item.productId}`); }} title="Xem">
              <Eye className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={e => handleAddToCart(item, e)} disabled={addingToCart === item.id} title="Giỏ hàng">
              {addingToCart === item.id
                ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                : <ShoppingCart className="h-4 w-4" />
              }
            </Button>
            <Button variant="ghost" size="sm" onClick={e => handleRemove(item, e)} className="text-destructive hover:text-destructive" title="Xoá">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <AppBreadcrumb items={[{ label: 'Yêu thích' }]} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2" style={{ fontFamily: 'var(--font-heading)' }}>
            <Heart className="h-6 w-6 text-red-500 fill-red-500" />
            Sản phẩm yêu thích
          </h1>
          <p className="text-muted-foreground mt-1">{items.length} sản phẩm</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={handleAddAllToCart}>
            <ShoppingCart className="mr-1 h-4 w-4" /> Thêm tất cả vào giỏ
          </Button>
          <Button variant="outline" size="sm" onClick={handleClearAll} className="text-destructive hover:text-destructive">
            <Trash2 className="mr-1 h-4 w-4" /> Xoá tất cả
          </Button>
        </div>
      </div>

      {/* P3.02: Collection tabs — DB-C.19: dùng WishlistFolder thật */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 -mx-1 px-1">
        {/* Tab "Tất cả" */}
        <button
          onClick={() => setActiveCollection('all')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm transition-all whitespace-nowrap ${
            activeCollection === 'all'
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
          }`}
        >
          <Heart className="h-3.5 w-3.5" />
          Tất cả
          <span className={`inline-flex items-center justify-center h-5 min-w-[20px] px-1.5 rounded-full text-xs ${
            activeCollection === 'all' ? 'bg-primary-foreground/20' : 'bg-muted'
          }`}>
            {folderCounts.all}
          </span>
        </button>
        {/* Tabs từ WishlistFolder */}
        {folders.map(folder => {
          const count = folderCounts[folder.id] ?? 0;
          const isActive = activeCollection === folder.id;
          return (
            <button
              key={folder.id}
              onClick={() => setActiveCollection(folder.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
              }`}
            >
              <Folder className="h-3.5 w-3.5" />
              {folder.name}
              {folder.isDefault && <span className="text-[10px] opacity-60">*</span>}
              {count > 0 && (
                <span className={`inline-flex items-center justify-center h-5 min-w-[20px] px-1.5 rounded-full text-xs ${
                  isActive ? 'bg-primary-foreground/20' : 'bg-muted'
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
          <Select value={sortBy} onValueChange={v => setSortBy(v as SortOption)}>
            <SelectTrigger className="w-44 h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <ViewToggle viewMode={viewMode} onChange={setViewMode} modes={['grid', 'list']} />
      </div>

      {/* Content */}
      {sortedItems.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Folder className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>Không có sản phẩm trong bộ sưu tập này</p>
        </div>
      ) : viewMode === 'grid' ? (
        /* P3.01: Masonry layout */
        <ResponsiveMasonry columnsCountBreakPoints={{ 350: 1, 500: 2, 900: 3, 1200: 4 }}>
          <Masonry gutter="16px">
            {sortedItems.map(renderMasonryCard)}
          </Masonry>
        </ResponsiveMasonry>
      ) : (
        <div className="space-y-3">
          {sortedItems.map(renderListRow)}
        </div>
      )}
    </div>
  );
}

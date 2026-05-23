// ============================================================
// Danh sách sản phẩm Buyer — Redesign UI-E Đợt 17
// E17.01–E17.05: card redesign, compare, sidebar filter, sort
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router';
import {
  Star, ShoppingCart, GitCompareArrows, Heart, SlidersHorizontal,
  X, Building2, ChevronDown, LayoutGrid, List, Eye,
} from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import { Separator } from '../ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { DataTable } from '../shared/DataTable';
import { FilterBar } from '../shared/FilterBar';
import { StatusBadge } from '../shared/StatusBadge';
import { AppBreadcrumb } from '../shared/AppBreadcrumb';
import { productApi, categoryApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import type { Product, Category, PaginationParams, SortParams, ActiveFilter, FilterConfig, ColumnConfig } from '../../types';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { toast } from 'sonner';

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

const columns: ColumnConfig[] = [
  { key: 'name', label: 'Tên sản phẩm', visible: true, sortable: true },
  { key: 'categoryName', label: 'Danh mục', visible: true, sortable: true },
  { key: 'brand', label: 'Thương hiệu', visible: true, sortable: true },
  { key: 'price', label: 'Giá (VNĐ)', visible: true, sortable: true },
  { key: 'soldCount', label: 'Đã bán', visible: true, sortable: true },
  { key: 'rating', label: 'Đánh giá', visible: true, sortable: true },
  { key: 'status', label: 'Trạng thái', visible: true, sortable: true },
];

const sortOptions = [
  { label: 'Mới nhất', value: 'createdAt:desc' },
  { label: 'Giá thấp → cao', value: 'price:asc' },
  { label: 'Giá cao → thấp', value: 'price:desc' },
  { label: 'Đánh giá cao nhất', value: 'rating:desc' },
  { label: 'Bán chạy', value: 'reviewCount:desc' },
];

// E17.04: Price range presets
const priceRanges = [
  { label: 'Dưới 500K', min: 0, max: 500000 },
  { label: '500K – 2 triệu', min: 500000, max: 2000000 },
  { label: '2 – 10 triệu', min: 2000000, max: 10000000 },
  { label: '10 – 50 triệu', min: 10000000, max: 50000000 },
  { label: 'Trên 50 triệu', min: 50000000, max: Infinity },
];

export function ProductListPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addItem } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState<string | null>(null);
  const [showSidebar, setShowSidebar] = useState(true);

  const initialPage = Number(searchParams.get('page')) || 1;
  const initialSearch = searchParams.get('search') ?? '';
  const initialCategory = searchParams.get('categoryId') ?? searchParams.get('categoryName') ?? searchParams.get('category') ?? '';
  const initialStatus = searchParams.get('status') ?? '';

  const [pagination, setPagination] = useState<PaginationParams>({ page: initialPage, pageSize: 12 });
  const [sort, setSort] = useState<SortParams>({ field: '', direction: 'asc' });
  const [sortString, setSortString] = useState('createdAt:desc');
  const [filters, setFilters] = useState<ActiveFilter[]>(() => {
    const f: ActiveFilter[] = [];
    if (initialCategory) f.push({ key: 'categoryId', value: initialCategory });
    if (initialStatus) f.push({ key: 'status', value: initialStatus });
    return f;
  });
  const [search, setSearch] = useState(initialSearch);
  const [categoryOptions, setCategoryOptions] = useState<{ label: string; value: string; count?: number }[]>([]);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [selectedPriceRange, setSelectedPriceRange] = useState<number | null>(null);

  // E17.05: Sort dropdown sync
  useEffect(() => {
    const [field, direction] = sortString.split(':');
    setSort({ field, direction: direction as 'asc' | 'desc' });
  }, [sortString]);

  useEffect(() => {
    const params: Record<string, string> = {};
    if (pagination.page > 1) params.page = String(pagination.page);
    if (search) params.search = search;
    for (const f of filters) {
      if (typeof f.value === 'string' && f.value) params[f.key === 'categoryName' ? 'categoryId' : f.key] = f.value;
    }
    setSearchParams(params, { replace: true });
  }, [pagination, search, filters, setSearchParams]);

  useEffect(() => {
    const urlSearch = searchParams.get('search') ?? '';
    if (urlSearch && urlSearch !== search) {
      setSearch(urlSearch);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    categoryApi.getAll().then(cats =>
      setCategoryOptions(
        cats
          .flatMap((cat: Category) => [cat, ...(cat.children ?? [])])
          .map(c => ({ label: c.parentId ? `- ${c.name}` : c.name, value: c.id, count: c.productCount })),
      ),
    );
  }, []);

  const filterConfigs: FilterConfig[] = [
    { key: 'categoryId', label: 'Danh mục', type: 'select', options: categoryOptions },
    { key: 'status', label: 'Trạng thái', type: 'select', options: [
      { label: 'Đang bán', value: 'Đang bán' },
      { label: 'Hết hàng', value: 'Hết hàng' },
      { label: 'Ngừng kinh doanh', value: 'Ngừng kinh doanh' },
    ]},
  ];

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const allFilters = [...filters];
      if (selectedPriceRange !== null) {
        const range = priceRanges[selectedPriceRange];
        allFilters.push({ key: 'minPrice', value: range.min });
        if (Number.isFinite(range.max)) allFilters.push({ key: 'maxPrice', value: range.max });
      }
      const res = await productApi.getPaginated(pagination, sort.field ? sort : undefined, allFilters, search);
      setProducts(res.data);
      setTotal(res.total);
    } finally {
      setLoading(false);
    }
  }, [pagination, sort, filters, search, selectedPriceRange]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const toggleCompare = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCompareIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : prev.length < 4 ? [...prev, id] : prev,
    );
  };

  const handleToggleWishlist = async (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để thêm vào yêu thích');
      navigate('/login', { state: { from: '/products' } });
      return;
    }
    if (isInWishlist(product.id)) {
      await removeFromWishlist(product.id);
      toast.success(`Đã xoá "${product.name}" khỏi yêu thích`);
    } else {
      await addToWishlist(product.id);
      toast.success(`Đã thêm "${product.name}" vào yêu thích`);
    }
  };

  const handleAddToCart = async (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để thêm vào giỏ hàng');
      navigate('/login', { state: { from: '/products' } });
      return;
    }
    setAddingToCart(product.id);
    try {
      const retailMeta = getProductRetailMeta(product);
      await addItem({
        productId: product.id,
        productName: product.name,
        productImage: product.images[0],
        supplierId: retailMeta.storeId,
        supplierName: retailMeta.storeName,
        quantity: retailMeta.minQty,
        unitPrice: product.price,
      });
      toast.success(`Đã thêm "${product.name}" vào giỏ hàng`);
    } finally {
      setAddingToCart(null);
    }
  };

  const handleCategoryClick = (catName: string) => {
    const existingIdx = filters.findIndex(f => f.key === 'categoryId');
    if (existingIdx >= 0 && filters[existingIdx].value === catName) {
      setFilters(prev => prev.filter(f => f.key !== 'categoryId'));
    } else {
      setFilters(prev => [
        ...prev.filter(f => f.key !== 'categoryId'),
        { key: 'categoryId', value: catName },
      ]);
    }
    setPagination(p => ({ ...p, page: 1 }));
  };

  const activeCategory = filters.find(f => f.key === 'categoryId')?.value as string | undefined;

  // E17.01: Grid card redesign
  const renderGridCard = (product: Product) => {
    const isCompare = compareIds.includes(product.id);
    const wishlisted = isInWishlist(product.id);
    const retailMeta = getProductRetailMeta(product);

    return (
      <Card className="overflow-hidden group hover:shadow-lg hover:-translate-y-1 transition-all duration-300 h-full border-0 shadow-sm relative">
        {/* E17.02: Compare checkbox */}
        <div className="absolute top-2 left-2 z-10">
          <label className={`
            flex items-center gap-1.5 px-2 py-1 rounded-full text-xs cursor-pointer transition-all
            ${isCompare
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'bg-white/80 backdrop-blur-sm text-muted-foreground opacity-0 group-hover:opacity-100'}
          `}>
            <Checkbox
              checked={isCompare}
              onCheckedChange={() => toggleCompare(product.id, { stopPropagation: () => {} } as React.MouseEvent)}
              className="h-3.5 w-3.5"
            />
            So sánh
          </label>
        </div>

        {/* Image with overlays */}
        <div className="aspect-[4/3] overflow-hidden relative">
          <ImageWithFallback
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {/* E17.01: Gradient overlay bottom */}
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/30 to-transparent" />

          {/* Price badge */}
          <div className="absolute bottom-2 left-2">
            <Badge className="bg-primary/90 backdrop-blur-sm shadow-sm text-xs">
              {formatPrice(product.price)}
            </Badge>
          </div>

          {/* Quick actions */}
          <div className="absolute top-2 right-2 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200">
            <button
              className={`h-8 w-8 rounded-full shadow-md flex items-center justify-center transition-all
                ${wishlisted ? 'bg-red-500 text-white' : 'bg-white/90 backdrop-blur-sm text-muted-foreground hover:text-red-500'}`}
              onClick={e => handleToggleWishlist(product, e)}
              title={wishlisted ? 'Bỏ yêu thích' : 'Yêu thích'}
            >
              <Heart className={`h-4 w-4 ${wishlisted ? 'fill-current' : ''}`} />
            </button>
            <button
              className="h-8 w-8 rounded-full bg-white/90 backdrop-blur-sm shadow-md flex items-center justify-center text-muted-foreground hover:text-primary transition-colors"
              onClick={e => handleAddToCart(product, e)}
              title="Thêm vào giỏ"
              disabled={addingToCart === product.id}
            >
              {addingToCart === product.id ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              ) : (
                <ShoppingCart className="h-4 w-4" />
              )}
            </button>
            <button
              className="h-8 w-8 rounded-full bg-white/90 backdrop-blur-sm shadow-md flex items-center justify-center text-muted-foreground hover:text-primary transition-colors"
              onClick={e => { e.stopPropagation(); navigate(`/products/${product.id}`); }}
              title="Xem chi tiết"
            >
              <Eye className="h-4 w-4" />
            </button>
          </div>
        </div>

        <CardContent className="p-3.5">
          <p className="line-clamp-2 mb-1.5 text-sm font-semibold leading-snug">{product.name}</p>
          {/* E17.01: Star rating */}
          <div className="flex items-center gap-1 mb-2">
            <div className="flex">
              {[1, 2, 3, 4, 5].map(s => (
                <Star key={s} className={`h-3 w-3 ${s <= product.rating ? 'fill-amber-400 text-amber-400' : 'fill-muted text-muted'}`} />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">({product.reviewCount})</span>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-[#e31837] font-bold text-sm">{formatPrice(product.price)}</p>
            <span className="text-[10px] text-muted-foreground">Từ {retailMeta.minQty} {retailMeta.unit}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1 truncate flex items-center gap-1">
            <Building2 className="h-3 w-3 shrink-0" /> {retailMeta.storeName}
          </p>
        </CardContent>
      </Card>
    );
  };

  const renderListItem = (product: Product) => {
    const wishlisted = isInWishlist(product.id);
    const isCompare = compareIds.includes(product.id);
    const retailMeta = getProductRetailMeta(product);

    return (
      <Card className="hover:shadow-md transition-all duration-200 border-0 shadow-sm overflow-hidden">
        <CardContent className="p-0 flex gap-0">
          {/* Image */}
          <div className="w-32 sm:w-40 shrink-0 overflow-hidden relative">
            <ImageWithFallback src={product.images[0]} alt={product.name} className="w-full h-full object-cover min-h-[120px]" />
            <div className="absolute top-2 left-2">
              <label className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] cursor-pointer ${isCompare ? 'bg-primary text-primary-foreground' : 'bg-white/80 backdrop-blur-sm text-muted-foreground'}`}>
                <Checkbox
                  checked={isCompare}
                  onCheckedChange={() => toggleCompare(product.id, { stopPropagation: () => {} } as React.MouseEvent)}
                  className="h-3 w-3"
                />
              </label>
            </div>
          </div>
          {/* Info */}
          <div className="flex-1 min-w-0 p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="line-clamp-1 text-sm" style={{ fontWeight: 500 }}>{product.name}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                  <Building2 className="h-3 w-3" /> {retailMeta.storeName}
                </p>
              </div>
              <StatusBadge status={product.status} />
            </div>
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              <span className="text-primary text-sm" style={{ fontWeight: 600 }}>{formatPrice(product.price)}</span>
              <Badge variant="secondary" className="text-[10px]">{product.categoryName}</Badge>
              <span className="text-xs text-muted-foreground">Từ {retailMeta.minQty} {retailMeta.unit}</span>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map(s => (
                  <Star key={s} className={`h-3 w-3 ${s <= product.rating ? 'fill-amber-400 text-amber-400' : 'fill-muted text-muted'}`} />
                ))}
                <span className="text-xs text-muted-foreground">({product.reviewCount})</span>
              </div>
            </div>
          </div>
          {/* Actions */}
          <div className="flex flex-col items-center justify-center gap-1.5 p-3 shrink-0 border-l border-border/50">
            <Button
              variant={wishlisted ? 'default' : 'ghost'}
              size="sm"
              className={`h-8 w-8 p-0 ${wishlisted ? 'bg-red-500 hover:bg-red-600' : ''}`}
              onClick={e => handleToggleWishlist(product, e)}
            >
              <Heart className={`h-4 w-4 ${wishlisted ? 'fill-current text-white' : ''}`} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={e => handleAddToCart(product, e)}
              disabled={addingToCart === product.id}
            >
              {addingToCart === product.id ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              ) : (
                <ShoppingCart className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6">
      <AppBreadcrumb items={[{ label: 'Trang chủ', href: '/' }, { label: 'Sản phẩm' }]} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
        <div>
          <h1 style={{ fontFamily: 'var(--font-heading)' }}>Sản phẩm</h1>
          <p className="text-muted-foreground mt-0.5">
            {search ? `Kết quả cho "${search}"` : 'Khám phá sản phẩm công nghệ chính hãng'}
            {total > 0 && <span className="text-foreground" style={{ fontWeight: 500 }}> · {total} sản phẩm</span>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {compareIds.length > 0 && (
            <Button onClick={() => navigate(`/products/compare?ids=${compareIds.join(',')}`)}>
              <GitCompareArrows className="mr-2 h-4 w-4" />
              So sánh ({compareIds.length})
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            className="lg:hidden"
            onClick={() => setShowSidebar(!showSidebar)}
          >
            <SlidersHorizontal className="h-4 w-4 mr-1" /> Bộ lọc
          </Button>
        </div>
      </div>

      <div className="flex gap-6">
        {/* E17.04: Sidebar filter (desktop) */}
        <aside className={`
          ${showSidebar ? 'block' : 'hidden'} lg:block w-full lg:w-60 xl:w-64 shrink-0
          ${showSidebar ? 'fixed inset-0 z-40 bg-background p-4 lg:relative lg:inset-auto lg:z-auto lg:p-0' : ''}
        `}>
          {/* Mobile close */}
          <div className="flex items-center justify-between lg:hidden mb-4">
            <h3 style={{ fontFamily: 'var(--font-heading)' }}>Bộ lọc</h3>
            <Button variant="ghost" size="sm" onClick={() => setShowSidebar(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="space-y-5 lg:border lg:rounded-2xl lg:p-4 lg:shadow-sm bg-background">
            {/* Category filter */}
            <div>
              <h4 className="text-xs uppercase tracking-wider text-muted-foreground mb-2.5 font-semibold">
                Danh mục
              </h4>
              <div className="space-y-0.5">
                {categoryOptions.map(cat => (
                  <button
                    key={cat.value}
                    className={`
                      w-full text-left flex items-center justify-between px-2.5 py-2 rounded-lg text-sm transition-all
                      ${activeCategory === cat.value
                        ? 'bg-primary/10 text-primary font-semibold border-l-2 border-primary pl-2'
                        : 'hover:bg-muted/50 text-foreground/80'}
                    `}
                    onClick={() => handleCategoryClick(cat.value)}
                  >
                    <span className="truncate">{cat.label}</span>
                    {cat.count && <span className="text-xs text-muted-foreground bg-muted px-1.5 rounded-full">{cat.count}</span>}
                  </button>
                ))}
              </div>
            </div>

            <Separator />

            {/* Price range */}
            <div>
              <h4 className="text-xs uppercase tracking-wider text-muted-foreground mb-2.5 font-semibold">
                Mức giá
              </h4>
              <div className="space-y-0.5">
                {priceRanges.map((range, idx) => (
                  <button
                    key={idx}
                    className={`
                      w-full text-left px-2.5 py-2 rounded-lg text-sm transition-all
                      ${selectedPriceRange === idx
                        ? 'bg-primary/10 text-primary font-semibold border-l-2 border-primary pl-2'
                        : 'hover:bg-muted/50 text-foreground/80'}
                    `}
                    onClick={() => setSelectedPriceRange(selectedPriceRange === idx ? null : idx)}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </div>

            <Separator />

            {/* Status filter */}
            <div>
              <h4 className="text-xs uppercase tracking-wider text-muted-foreground mb-2.5 font-semibold">
                Trạng thái
              </h4>
              <div className="space-y-1.5">
                {['Đang bán', 'Hết hàng', 'Ngừng kinh doanh'].map(status => {
                  const isActive = filters.some(f => f.key === 'status' && f.value === status);
                  return (
                    <label key={status} className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                      <Checkbox
                        checked={isActive}
                        onCheckedChange={() => {
                          setFilters(prev => {
                            if (isActive) return prev.filter(f => !(f.key === 'status' && f.value === status));
                            return [...prev.filter(f => f.key !== 'status'), { key: 'status', value: status }];
                          });
                          setPagination(p => ({ ...p, page: 1 }));
                        }}
                        className="h-4 w-4"
                      />
                      <StatusBadge status={status} />
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Clear all */}
            {filters.length > 0 && (
              <>
                <Separator />
                <Button
                  variant="outline" size="sm" className="w-full text-destructive border-destructive/30 hover:bg-destructive/5"
                  onClick={() => { setFilters([]); setSelectedPriceRange(null); setPagination(p => ({ ...p, page: 1 })); }}
                >
                  <X className="h-3.5 w-3.5 mr-1" /> Xoá bộ lọc
                </Button>
              </>
            )}
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* E17.05: Search + sort bar */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1">
              <FilterBar
                filters={filterConfigs}
                activeFilters={filters}
                onFilterChange={f => { setFilters(f); setPagination(p => ({ ...p, page: 1 })); }}
                searchValue={search}
                onSearchChange={v => { setSearch(v); setPagination(p => ({ ...p, page: 1 })); }}
                searchPlaceholder="Tìm sản phẩm..."
              />
            </div>
            {/* E17.05: Sort dropdown */}
            <div className="hidden sm:block shrink-0">
              <Select value={sortString} onValueChange={v => { setSortString(v); }}>
                <SelectTrigger className="w-44 h-9">
                  <SelectValue placeholder="Sắp xếp" />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* E17.02: Compare bar */}
          {compareIds.length > 0 && (
            <div className="mb-4 p-3 rounded-xl bg-primary/5 border border-primary/20 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GitCompareArrows className="h-4 w-4 text-primary" />
                <span className="text-sm">Đã chọn <strong>{compareIds.length}</strong> sản phẩm để so sánh</span>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => setCompareIds([])}>
                  Bỏ chọn
                </Button>
                <Button size="sm" onClick={() => navigate(`/products/compare?ids=${compareIds.join(',')}`)}>
                  So sánh ngay
                </Button>
              </div>
            </div>
          )}

          {/* Category chips (mobile + tablet) */}
          <div className="flex gap-2 mb-4 overflow-x-auto pb-1 lg:hidden">
            <Badge
              variant={!activeCategory ? 'default' : 'outline'}
              className="cursor-pointer shrink-0"
              onClick={() => { setFilters(prev => prev.filter(f => f.key !== 'categoryId')); setPagination(p => ({ ...p, page: 1 })); }}
            >
              Tất cả
            </Badge>
            {categoryOptions.slice(0, 6).map(cat => (
              <Badge
                key={cat.value}
                variant={activeCategory === cat.value ? 'default' : 'outline'}
                className="cursor-pointer shrink-0 hover:bg-primary/10 transition-colors"
                onClick={() => handleCategoryClick(cat.value)}
              >
                {cat.label}
              </Badge>
            ))}
          </div>

          <DataTable
            data={products}
            columns={columns}
            totalItems={total}
            pagination={pagination}
            sort={sort}
            onPaginationChange={setPagination}
            onSortChange={setSort}
            onRowClick={p => navigate(`/products/${p.id}`)}
            getId={p => p.id}
            renderGridCard={renderGridCard}
            renderListItem={renderListItem}
            loading={loading}
            defaultViewMode="grid"
          />
        </div>
      </div>
    </div>
  );
}

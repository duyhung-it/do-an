// ============================================================
// Gợi ý tìm kiếm nâng cao — Keyboard nav, highlight, debounce
// ============================================================

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { Search, Package, Building2, Tag, Clock, TrendingUp, X } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { productApi, supplierApi, categoryApi } from '../../services/api';
import type { Product, Supplier, Category } from '../../types';
import { ImageWithFallback } from '../figma/ImageWithFallback';

const formatPrice = (price: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

const trendingKeywords = ['iPhone 15', 'Galaxy S24', 'MacBook Air', 'AirPods Pro', 'Sạc nhanh', 'Ốp lưng'];

/** Highlight matching text in a string */
function HighlightText({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark key={i} className="bg-yellow-200 dark:bg-yellow-800 rounded-sm px-0.5">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}

interface SuggestionItem {
  id: string;
  type: 'category' | 'product' | 'supplier';
  path: string;
  label: string;
}

interface SearchSuggestionsProps {
  className?: string;
}

export function SearchSuggestions({ className = '' }: SearchSuggestionsProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [isSearching, setIsSearching] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  // All navigable items flattened
  const flatItems = useMemo<SuggestionItem[]>(() => {
    const items: SuggestionItem[] = [];
    categories.forEach(c =>
      items.push({ id: c.id, type: 'category', path: `/products?categoryName=${encodeURIComponent(c.name)}`, label: c.name }),
    );
    products.forEach(p =>
      items.push({ id: p.id, type: 'product', path: `/products/${p.id}`, label: p.name }),
    );
    suppliers.forEach(s =>
      items.push({ id: s.id, type: 'supplier', path: `/stores/${s.id}`, label: s.companyName }),
    );
    return items;
  }, [categories, products, suppliers]);

  // Load recent searches
  useEffect(() => {
    try {
      const stored = localStorage.getItem('b2b_recent_searches');
      if (stored) setRecentSearches(JSON.parse(stored));
    } catch { /* ignore */ }
  }, []);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!query.trim()) {
      setProducts([]);
      setSuppliers([]);
      setCategories([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const [prodRes, suppRes, catRes] = await Promise.all([
          productApi.getPaginated({ page: 1, pageSize: 5 }, undefined, undefined, query),
          supplierApi.getPaginated({ page: 1, pageSize: 3 }, undefined, undefined, query),
          categoryApi.getAll(),
        ]);
        setProducts(prodRes.data);
        setSuppliers(suppRes.data);
        setCategories(catRes.filter(c => c.name.toLowerCase().includes(query.toLowerCase())).slice(0, 3));
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  // Reset active index when results change
  useEffect(() => {
    setActiveIndex(-1);
  }, [flatItems.length]);

  // Click outside to close
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const saveSearch = useCallback((term: string) => {
    const updated = [term, ...recentSearches.filter(s => s !== term)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('b2b_recent_searches', JSON.stringify(updated));
  }, [recentSearches]);

  const handleSearch = useCallback((term: string) => {
    if (!term.trim()) return;
    saveSearch(term.trim());
    navigate(`/products?search=${encodeURIComponent(term.trim())}`);
    setQuery('');
    setOpen(false);
  }, [saveSearch, navigate]);

  const handleNavigate = useCallback((path: string) => {
    setOpen(false);
    setQuery('');
    navigate(path);
  }, [navigate]);

  const clearRecent = () => {
    setRecentSearches([]);
    localStorage.removeItem('b2b_recent_searches');
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (query.trim() && flatItems.length > 0) {
          setActiveIndex(prev => (prev + 1) % flatItems.length);
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (query.trim() && flatItems.length > 0) {
          setActiveIndex(prev => (prev <= 0 ? flatItems.length - 1 : prev - 1));
        }
        break;
      case 'Enter':
        e.preventDefault();
        if (activeIndex >= 0 && activeIndex < flatItems.length) {
          const item = flatItems[activeIndex];
          if (item.type === 'category') saveSearch(item.label);
          handleNavigate(item.path);
        } else {
          handleSearch(query);
        }
        break;
      case 'Escape':
        setOpen(false);
        inputRef.current?.blur();
        break;
    }
  };

  const hasResults = products.length > 0 || suppliers.length > 0 || categories.length > 0;
  const showDefault = !query.trim();

  // Track cumulative index for highlighting
  let itemIdx = -1;

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <form onSubmit={e => { e.preventDefault(); handleSearch(query); }}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            ref={inputRef}
            className="pl-9 pr-9"
            placeholder="Tìm sản phẩm, cửa hàng, danh mục..."
            value={query}
            onChange={e => { setQuery(e.target.value); setOpen(true); }}
            onFocus={() => setOpen(true)}
            onKeyDown={handleKeyDown}
            aria-expanded={open}
            aria-haspopup="listbox"
            role="combobox"
          />
          {query && (
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2"
              onClick={() => { setQuery(''); setOpen(false); }}
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
        </div>
      </form>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute top-full mt-1 left-0 right-0 bg-background border rounded-lg shadow-lg z-50 max-h-[70vh] overflow-y-auto"
          role="listbox"
        >
          {showDefault ? (
            <div className="p-3 space-y-4">
              {/* Tìm kiếm gần đây */}
              {recentSearches.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" /> Tìm kiếm gần đây
                    </span>
                    <button className="text-muted-foreground hover:text-foreground text-xs" onClick={clearRecent}>Xoá</button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map(term => (
                      <Badge
                        key={term}
                        variant="secondary"
                        className="cursor-pointer hover:bg-secondary/80"
                        onClick={() => handleSearch(term)}
                      >
                        {term}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Xu hướng */}
              <div>
                <span className="text-muted-foreground flex items-center gap-1 mb-2">
                  <TrendingUp className="h-3.5 w-3.5" /> Xu hướng tìm kiếm
                </span>
                <div className="flex flex-wrap gap-2">
                  {trendingKeywords.map(term => (
                    <Badge
                      key={term}
                      variant="outline"
                      className="cursor-pointer hover:bg-muted"
                      onClick={() => handleSearch(term)}
                    >
                      {term}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          ) : isSearching ? (
            <div className="p-6 flex items-center justify-center gap-2 text-muted-foreground">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              Đang tìm kiếm...
            </div>
          ) : hasResults ? (
            <div className="divide-y">
              {/* Danh mục */}
              {categories.length > 0 && (
                <div className="p-2">
                  <p className="px-2 py-1 text-muted-foreground text-xs flex items-center gap-1">
                    <Tag className="h-3 w-3" /> Danh mục
                  </p>
                  {categories.map(cat => {
                    itemIdx++;
                    const idx = itemIdx;
                    return (
                      <button
                        key={cat.id}
                        role="option"
                        aria-selected={activeIndex === idx}
                        className={`w-full text-left px-3 py-2 rounded-md transition-colors flex items-center gap-2 ${
                          activeIndex === idx ? 'bg-muted' : 'hover:bg-muted/50'
                        }`}
                        onClick={() => handleNavigate(`/products?categoryName=${encodeURIComponent(cat.name)}`)}
                        onMouseEnter={() => setActiveIndex(idx)}
                      >
                        <Tag className="h-4 w-4 text-primary shrink-0" />
                        <span><HighlightText text={cat.name} query={query} /></span>
                        <span className="text-muted-foreground ml-auto">{cat.productCount} sản phẩm</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Sản phẩm */}
              {products.length > 0 && (
                <div className="p-2">
                  <p className="px-2 py-1 text-muted-foreground text-xs flex items-center gap-1">
                    <Package className="h-3 w-3" /> Sản phẩm
                  </p>
                  {products.map(product => {
                    itemIdx++;
                    const idx = itemIdx;
                    return (
                      <button
                        key={product.id}
                        role="option"
                        aria-selected={activeIndex === idx}
                        className={`w-full text-left px-3 py-2 rounded-md transition-colors flex items-center gap-3 ${
                          activeIndex === idx ? 'bg-muted' : 'hover:bg-muted/50'
                        }`}
                        onClick={() => handleNavigate(`/products/${product.id}`)}
                        onMouseEnter={() => setActiveIndex(idx)}
                      >
                        <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0">
                          <ImageWithFallback src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="truncate"><HighlightText text={product.name} query={query} /></p>
                          <p className="text-muted-foreground text-xs">{product.categoryName}</p>
                        </div>
                        <span className="text-primary shrink-0">{formatPrice(product.price)}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Cửa hàng */}
              {suppliers.length > 0 && (
                <div className="p-2">
                  <p className="px-2 py-1 text-muted-foreground text-xs flex items-center gap-1">
                    <Building2 className="h-3 w-3" /> Cửa hàng
                  </p>
                  {suppliers.map(sup => {
                    itemIdx++;
                    const idx = itemIdx;
                    return (
                      <button
                        key={sup.id}
                        role="option"
                        aria-selected={activeIndex === idx}
                        className={`w-full text-left px-3 py-2 rounded-md transition-colors flex items-center gap-3 ${
                          activeIndex === idx ? 'bg-muted' : 'hover:bg-muted/50'
                        }`}
                        onClick={() => handleNavigate(`/stores/${sup.id}`)}
                        onMouseEnter={() => setActiveIndex(idx)}
                      >
                        <Building2 className="h-5 w-5 text-muted-foreground shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="truncate"><HighlightText text={sup.companyName} query={query} /></p>
                          <p className="text-muted-foreground text-xs">{sup.city} &bull; {sup.productCount} sản phẩm</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Xem tất cả */}
              <div className="p-2">
                <Button
                  variant="ghost"
                  className="w-full justify-center"
                  onClick={() => handleSearch(query)}
                >
                  Xem tất cả kết quả cho &ldquo;{query}&rdquo;
                </Button>
              </div>
            </div>
          ) : (
            <div className="p-6 text-center text-muted-foreground">
              Không tìm thấy kết quả cho &ldquo;{query}&rdquo;
            </div>
          )}
        </div>
      )}
    </div>
  );
}

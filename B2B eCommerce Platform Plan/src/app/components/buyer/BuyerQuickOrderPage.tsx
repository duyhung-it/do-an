// ============================================================
// Đặt hàng nhanh — Buyer (P3 Đợt 7: P3.14–P3.16, P3.19)
// Autocomplete with thumbnails, frequent items, QR mock
// ============================================================

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import {
  Plus, Trash2, ShoppingCart, Search, Package, X, Loader2,
  Zap, Camera, QrCode, Clock, TrendingUp, Star,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { AppBreadcrumb } from '../shared/AppBreadcrumb';
import { IconWrapper } from '../shared/IconWrapper';
import { productApi } from '../../services/api';
import { useCart } from '../../context/CartContext';
import type { Product } from '../../types';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { toast } from 'sonner';
import { useNavigate } from 'react-router';

const fmtPrice = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n);

interface OrderLine {
  id: string;
  query: string;
  product: Product | null;
  quantity: number;
}

const MAX_LINES = 50;

function createLine(): OrderLine {
  return { id: `line-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, query: '', product: null, quantity: 1 };
}

// P3.15: Mock frequent products (from order history)
const FREQUENT_PRODUCTS = [
  { id: 'prod-001', name: 'Bo mạch Arduino Mega 2560', price: 450000, image: '', supplier: 'Điện tử Phương Nam', orderCount: 12 },
  { id: 'prod-003', name: 'Thép cuộn cán nóng HRC', price: 15200000, image: '', supplier: 'Thép Hoà Phát', orderCount: 8 },
  { id: 'prod-002', name: 'Vải cotton 100% cao cấp', price: 85000, image: '', supplier: 'Dệt may Thành Công', orderCount: 6 },
  { id: 'prod-005', name: 'Dung môi Toluene công nghiệp', price: 25000000, image: '', supplier: 'Hoá chất Việt Trì', orderCount: 5 },
  { id: 'prod-006', name: 'Gạo ST25 xuất khẩu', price: 22000, image: '', supplier: 'Nông sản Mekong', orderCount: 4 },
  { id: 'prod-004', name: 'Hộp carton 5 lớp sóng BC', price: 12000, image: '', supplier: 'Bao bì Đại Lục', orderCount: 3 },
];

// ─── P3.14: Autocomplete with thumbnail ──────────────────
function ProductAutocomplete({
  line, onChange, onSelectProduct,
}: {
  line: OrderLine;
  onChange: (product: Product | null, query: string) => void;
  onSelectProduct?: (product: Product) => void;
}) {
  const [query, setQuery] = useState(line.query);
  const [results, setResults] = useState<Product[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const search = useCallback(async (q: string) => {
    if (q.length < 2) { setResults([]); setOpen(false); return; }
    setLoading(true);
    try {
      const res = await productApi.getPaginated({ page: 1, pageSize: 10 }, undefined, undefined, q);
      setResults(res.data);
      setOpen(res.data.length > 0);
      setActiveIdx(-1);
    } finally { setLoading(false); }
  }, []);

  const handleInputChange = (val: string) => {
    setQuery(val);
    onChange(null, val);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => search(val), 300);
  };

  const handleSelect = (p: Product) => {
    setQuery(p.name);
    onChange(p, p.name);
    onSelectProduct?.(p);
    setOpen(false);
  };

  // P3.14: Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx(prev => Math.min(prev + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && activeIdx >= 0 && results[activeIdx]) {
      e.preventDefault();
      handleSelect(results[activeIdx]);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Scroll active item into view
  useEffect(() => {
    if (activeIdx >= 0 && listRef.current) {
      const items = listRef.current.querySelectorAll('[data-item]');
      items[activeIdx]?.scrollIntoView({ block: 'nearest' });
    }
  }, [activeIdx]);

  return (
    <div className="relative" ref={containerRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          className="pl-9 pr-8"
          placeholder="Nhập tên hoặc mã sản phẩm..."
          value={query}
          onChange={e => handleInputChange(e.target.value)}
          onFocus={() => { if (results.length > 0) setOpen(true); }}
          onKeyDown={handleKeyDown}
        />
        {loading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />}
        {line.product && !loading && (
          <button className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" onClick={() => { setQuery(''); onChange(null, ''); setResults([]); }}>
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      {/* P3.14: Dropdown with thumbnails */}
      {open && (
        <div ref={listRef} className="absolute z-50 top-full left-0 right-0 mt-1 bg-popover border rounded-xl shadow-lg max-h-72 overflow-y-auto">
          {results.map((p, idx) => (
            <button
              key={p.id}
              data-item
              className={`w-full text-left px-3 py-2.5 flex items-center gap-3 transition-colors ${
                idx === activeIdx ? 'bg-primary/10' : 'hover:bg-accent'
              }`}
              onClick={() => handleSelect(p)}
              onMouseEnter={() => setActiveIdx(idx)}
            >
              {/* P3.14: Image thumbnail */}
              <div className="h-10 w-10 rounded-lg overflow-hidden shrink-0 bg-muted">
                {p.images[0] ? (
                  <ImageWithFallback src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="h-4 w-4 text-muted-foreground" />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm">{p.name}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{p.supplierName}</span>
                  <span>·</span>
                  <span style={{ fontFamily: 'var(--font-heading)' }} className="text-primary">{fmtPrice(p.price)}</span>
                  <span>/ {p.unit}</span>
                </div>
              </div>
              {p.rating > 0 && (
                <div className="flex items-center gap-0.5 text-xs shrink-0">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  <span>{p.rating}</span>
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// Main
// ═══════════════════════════════════════════════════════════
export function BuyerQuickOrderPage() {
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [lines, setLines] = useState<OrderLine[]>([createLine(), createLine(), createLine()]);
  const [submitting, setSubmitting] = useState(false);
  const [showQrMock, setShowQrMock] = useState(false);

  const addLine = () => {
    if (lines.length >= MAX_LINES) { toast.error(`Tối đa ${MAX_LINES} dòng`); return; }
    setLines(p => [...p, createLine()]);
  };

  const removeLine = (id: string) => {
    if (lines.length <= 1) return;
    setLines(p => p.filter(l => l.id !== id));
  };

  const updateLine = (id: string, update: Partial<OrderLine>) => {
    setLines(p => p.map(l => l.id === id ? { ...l, ...update } : l));
  };

  // P3.15: Quick add from frequent item
  const handleQuickAdd = async (prod: typeof FREQUENT_PRODUCTS[0]) => {
    // Fetch full product, but for mock just create a line
    const fullProduct = await productApi.getById(prod.id);
    if (fullProduct) {
      const emptyLine = lines.find(l => !l.product);
      if (emptyLine) {
        updateLine(emptyLine.id, { product: fullProduct, query: fullProduct.name });
      } else {
        const newLine = createLine();
        setLines(p => [...p, { ...newLine, product: fullProduct, query: fullProduct.name }]);
      }
      toast.success(`Đã thêm "${fullProduct.name}"`);
    }
  };

  const filledLines = useMemo(() => lines.filter(l => l.product), [lines]);
  const grandTotal = useMemo(() => filledLines.reduce((s, l) => s + l.product!.price * l.quantity, 0), [filledLines]);

  const groups = useMemo(() => {
    const map: Record<string, { name: string; items: OrderLine[] }> = {};
    for (const l of filledLines) {
      const sid = l.product!.supplierId;
      if (!map[sid]) map[sid] = { name: l.product!.supplierName, items: [] };
      map[sid].items.push(l);
    }
    return Object.entries(map);
  }, [filledLines]);

  const handleAddToCart = async () => {
    if (filledLines.length === 0) { toast.error('Chưa chọn sản phẩm'); return; }
    setSubmitting(true);
    try {
      for (const l of filledLines) {
        addItem({
          productId: l.product!.id, productName: l.product!.name,
          productImage: l.product!.images[0] ?? '',
          supplierId: l.product!.supplierId, supplierName: l.product!.supplierName,
          quantity: l.quantity, unitPrice: l.product!.price,
          totalPrice: l.product!.price * l.quantity,
        });
      }
      toast.success(`Đã thêm ${filledLines.length} SP vào giỏ hàng`);
      navigate('/cart');
    } finally { setSubmitting(false); }
  };

  const handleOrderNow = async () => {
    if (filledLines.length === 0) { toast.error('Chưa chọn sản phẩm'); return; }
    setSubmitting(true);
    try {
      for (const l of filledLines) {
        addItem({
          productId: l.product!.id, productName: l.product!.name,
          productImage: l.product!.images[0] ?? '',
          supplierId: l.product!.supplierId, supplierName: l.product!.supplierName,
          quantity: l.quantity, unitPrice: l.product!.price,
          totalPrice: l.product!.price * l.quantity,
        });
      }
      toast.success('Đã thêm vào giỏ, chuyển đến thanh toán');
      navigate('/cart');
    } finally { setSubmitting(false); }
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <AppBreadcrumb items={[{ label: 'Trang chủ', href: '/' }, { label: 'Đặt hàng nhanh' }]} />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2" style={{ fontFamily: 'var(--font-heading)' }}>
            <Zap className="h-6 w-6 text-primary" /> Đặt hàng nhanh
          </h1>
          <p className="text-muted-foreground mt-1">Nhập nhiều sản phẩm cùng lúc, tự động tính tổng và nhóm theo NCC</p>
        </div>
        {/* P3.16: QR/Barcode mock button */}
        <Button variant="outline" onClick={() => setShowQrMock(true)} className="gap-1.5">
          <QrCode className="h-4 w-4" /> Quét mã QR / Barcode
        </Button>
      </div>

      {/* P3.15: Frequently bought suggestions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock className="h-4.5 w-4.5 text-primary" /> Sản phẩm hay mua
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {FREQUENT_PRODUCTS.map(prod => (
              <button
                key={prod.id}
                onClick={() => handleQuickAdd(prod)}
                className="p-3 rounded-xl border border-border/50 hover:border-primary/30 hover:bg-muted/20 transition-all text-left group"
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors">
                    <Package className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                  </div>
                  <Badge variant="outline" className="text-[9px] h-4 px-1">{prod.orderCount}x</Badge>
                </div>
                <p className="text-xs line-clamp-2 mb-1">{prod.name}</p>
                <p className="text-xs text-primary" style={{ fontFamily: 'var(--font-heading)' }}>{fmtPrice(prod.price)}</p>
                <p className="text-[10px] text-muted-foreground truncate">{prod.supplier}</p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Order lines */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Danh sách sản phẩm</CardTitle>
              <CardDescription>{lines.length}/{MAX_LINES} dòng · {filledLines.length} SP đã chọn</CardDescription>
            </div>
            <Button size="sm" variant="outline" onClick={addLine} disabled={lines.length >= MAX_LINES} className="gap-1">
              <Plus className="h-3.5 w-3.5" /> Thêm dòng
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Header row - desktop */}
          <div className="hidden sm:grid sm:grid-cols-[1fr_100px_120px_120px_40px] gap-3 items-center text-muted-foreground text-xs px-1">
            <span>Sản phẩm</span><span>Số lượng</span><span className="text-right">Đơn giá</span><span className="text-right">Thành tiền</span><span />
          </div>

          {lines.map((line) => (
            <div key={line.id} className={`grid sm:grid-cols-[1fr_100px_120px_120px_40px] gap-3 items-center rounded-xl p-3 sm:p-2 transition-colors ${
              line.product ? 'border border-primary/10 bg-primary/5' : 'border border-border/50'
            }`}>
              <ProductAutocomplete
                line={line}
                onChange={(product, query) => updateLine(line.id, { product, query })}
              />
              <Input
                type="number" min={1} max={99999}
                value={line.quantity}
                onChange={e => updateLine(line.id, { quantity: Math.max(1, parseInt(e.target.value) || 1) })}
                className="text-center"
              />
              <div className="text-right text-muted-foreground text-sm">
                {line.product ? fmtPrice(line.product.price) : '—'}
              </div>
              <div className="text-right text-sm" style={{ fontFamily: 'var(--font-heading)' }}>
                {line.product ? <span className="text-primary">{fmtPrice(line.product.price * line.quantity)}</span> : '—'}
              </div>
              <Button variant="ghost" size="sm" className="text-destructive" onClick={() => removeLine(line.id)} disabled={lines.length <= 1}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Summary */}
      {filledLines.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base">Tóm tắt đơn hàng</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {groups.map(([sid, g]) => (
              <div key={sid} className="rounded-xl border border-border/50 p-3">
                <div className="flex items-center gap-2 mb-2">
                  <IconWrapper icon={Package} variant="primary" size="xs" />
                  <span style={{ fontFamily: 'var(--font-heading)' }} className="text-sm">{g.name}</span>
                  <span className="text-muted-foreground text-xs ml-auto">{g.items.length} SP · {fmtPrice(g.items.reduce((s, l) => s + l.product!.price * l.quantity, 0))}</span>
                </div>
                <div className="space-y-1">
                  {g.items.map(l => (
                    <div key={l.id} className="flex items-center justify-between text-sm py-0.5">
                      <span className="truncate flex-1">{l.product!.name}</span>
                      <span className="text-muted-foreground shrink-0 ml-2">×{l.quantity} = <span className="text-primary" style={{ fontFamily: 'var(--font-heading)' }}>{fmtPrice(l.product!.price * l.quantity)}</span></span>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div className="flex items-center justify-between pt-4 border-t">
              <span style={{ fontFamily: 'var(--font-heading)' }}>Tổng cộng ({filledLines.length} SP)</span>
              <span className="text-primary text-lg" style={{ fontFamily: 'var(--font-heading)' }}>{fmtPrice(grandTotal)}</span>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-2">
              <Button variant="outline" onClick={handleAddToCart} disabled={submitting} className="gap-1.5">
                <ShoppingCart className="h-4 w-4" /> Thêm vào giỏ
              </Button>
              <Button onClick={handleOrderNow} disabled={submitting} className="gap-1.5">
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShoppingCart className="h-4 w-4" />}
                Đặt hàng ngay
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* P3.16: QR/Barcode Mock Dialog */}
      {showQrMock && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => setShowQrMock(false)}>
          <Card className="w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <CardContent className="p-6 text-center space-y-4">
              <div className="mx-auto h-16 w-16 rounded-2xl bg-muted/50 flex items-center justify-center">
                <Camera className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <p style={{ fontFamily: 'var(--font-heading)' }}>Quét mã QR / Barcode</p>
                <p className="text-muted-foreground text-sm mt-1">Tính năng đang phát triển</p>
              </div>
              <div className="p-4 rounded-xl border-2 border-dashed bg-muted/10">
                <div className="flex items-center justify-center gap-3 text-muted-foreground">
                  <QrCode className="h-12 w-12" />
                  <div className="text-left text-sm">
                    <p>Đưa mã QR hoặc Barcode vào camera</p>
                    <p className="text-xs">Hỗ trợ: QR Code, EAN-13, Code 128</p>
                  </div>
                </div>
              </div>
              <Button variant="outline" onClick={() => setShowQrMock(false)} className="w-full">Đóng</Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

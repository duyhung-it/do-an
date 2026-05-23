// ============================================================
// Trang giỏ hàng — Redesign UI-E Đợt 18
// E18.01–E18.10: 2-col layout, stepper, summary, mobile bar
// ============================================================

import { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import {
  Trash2, Minus, Plus, ShoppingBag, CheckCircle, Tag,
  X as XIcon, AlertTriangle, ChevronDown, ChevronUp, MessageSquare,
  Truck, ShieldCheck, RotateCcw, ArrowRight, Sparkles, Building2,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Separator } from '../ui/separator';
import { Checkbox } from '../ui/checkbox';
import { Badge } from '../ui/badge';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '../ui/dialog';
import { AppBreadcrumb } from '../shared/AppBreadcrumb';
import { TableSkeleton } from '../shared/PageSkeleton';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { orderApi, promotionApi, productApi } from '../../services/api';
import type { CartItem, Promotion, Product } from '../../types';
import { toast } from 'sonner';
import { ImageWithFallback } from '../figma/ImageWithFallback';

const formatPrice = (price: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

const OUT_OF_STOCK_IDS = new Set<string>(['prod-999']);

const estimateShipping = (supplierId: string, itemCount: number) => {
  const base: Record<string, number> = {
    'sup-01': 150000, 'sup-02': 200000, 'sup-03': 350000,
    'sup-04': 120000, 'sup-05': 280000, 'sup-06': 180000,
  };
  return (base[supplierId] ?? 250000) + (itemCount > 3 ? 50000 : 0);
};

const getCartStoreName = (item?: CartItem) => item?.supplierName || 'CELLPHONES';

// E18.02: Quantity stepper component
function QuantityStepper({ value, onChange, min = 1, disabled = false }: {
  value: number; onChange: (v: number) => void; min?: number; disabled?: boolean;
}) {
  return (
    <div className="inline-flex items-center border rounded-xl overflow-hidden bg-muted/30">
      <button
        className="h-9 w-9 flex items-center justify-center hover:bg-muted transition-colors disabled:opacity-40"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min || disabled}
      >
        <Minus className="h-3.5 w-3.5" />
      </button>
      <input
        type="number"
        className="w-14 h-9 text-center bg-transparent border-x text-sm focus:outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        value={value}
        onChange={e => onChange(Math.max(min, Number(e.target.value)))}
        min={min}
        disabled={disabled}
      />
      <button
        className="h-9 w-9 flex items-center justify-center hover:bg-muted transition-colors disabled:opacity-40"
        onClick={() => onChange(value + 1)}
        disabled={disabled}
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export function CartPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items, loading, updateQuantity, removeItem, clearCart, validateCart } = useCart();
  const [placingOrder, setPlacingOrder] = useState(false);
  const [shippingAddress, setShippingAddress] = useState(
    user?.companyName ? `${user.companyName}, TP. Hồ Chí Minh` : '123 Đường ABC, Quận 1, TP. Hồ Chí Minh',
  );
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [poNumber, setPoNumber] = useState('');
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [supplierNotes, setSupplierNotes] = useState<Record<string, string>>({});
  const [expandedNotes, setExpandedNotes] = useState<Record<string, boolean>>({});

  // Coupon
  const [couponCode, setCouponCode] = useState('');
  const [appliedPromotion, setAppliedPromotion] = useState<Promotion | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponError, setCouponError] = useState('');
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  // E18.05: Recommendations
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  useEffect(() => {
    productApi.getPaginated({ page: 1, pageSize: 4 }).then(res => setRecommendations(res.data));
  }, []);

  const groupedBySupplier = useMemo(() =>
    items.reduce<Record<string, CartItem[]>>((acc, item) => {
      const key = item.supplierId;
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    }, {}), [items]);

  const supplierGroups = Object.entries(groupedBySupplier);
  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const shippingBySupplier = useMemo(() =>
    Object.fromEntries(
      supplierGroups.map(([sid, sitems]) => [sid, estimateShipping(sid, sitems.length)]),
    ), [supplierGroups]);
  const totalShipping = Object.values(shippingBySupplier).reduce((s, v) => s + v, 0);
  const tax = Math.floor(subtotal * 0.1);
  const total = subtotal + totalShipping + tax - discountAmount;

  const buildShippingAddress = () => {
    const parts = shippingAddress.split(',').map(part => part.trim()).filter(Boolean);
    return {
      recipientName: user?.fullName || 'Khach hang',
      phone: user?.phone || '0901234567',
      province: parts.at(-1) || 'TP. Ho Chi Minh',
      district: parts.at(-2) || 'Quan 1',
      ward: parts.at(-3) || 'Ben Nghe',
      addressLine: parts.slice(0, Math.max(1, parts.length - 3)).join(', ') || shippingAddress.trim(),
    };
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) { setCouponError('Vui lòng nhập mã giảm giá'); return; }
    setApplyingCoupon(true);
    setCouponError('');
    try {
      const result = await promotionApi.validate(couponCode.trim(), subtotal);
      if (result.valid && result.promotion && result.discount) {
        setAppliedPromotion(result.promotion);
        setDiscountAmount(result.discount);
        toast.success(`Áp dụng thành công: giảm ${formatPrice(result.discount)}`);
      } else {
        setCouponError(result.error ?? 'Mã giảm giá không hợp lệ');
        setAppliedPromotion(null);
        setDiscountAmount(0);
      }
    } finally { setApplyingCoupon(false); }
  };

  const handleRemoveCoupon = () => {
    setAppliedPromotion(null); setDiscountAmount(0);
    setCouponCode(''); setCouponError('');
    toast.info('Đã xoá mã giảm giá');
  };

  const handleRemoveItem = async (id: string) => {
    await removeItem(id);
    toast.success('Đã xoá khỏi giỏ hàng');
  };

  const handleRemoveSupplierItems = async (supplierId: string) => {
    const supplierItems = groupedBySupplier[supplierId] ?? [];
    for (const item of supplierItems) await removeItem(item.id);
    toast.success('Đã xoá tất cả sản phẩm của cửa hàng');
  };

  const handleRequestPlaceOrder = () => {
    if (!user) return;
    if (!shippingAddress.trim()) { toast.error('Vui lòng nhập địa chỉ giao hàng'); return; }
    if (!agreedTerms) { toast.error('Vui lòng đồng ý điều khoản mua hàng'); return; }
    setShowConfirmDialog(true);
  };

  const handlePlaceOrder = async () => {
    if (!user) return;
    setShowConfirmDialog(false);
    setPlacingOrder(true);
    try {
      const createdOrders = [];
      for (const [supplierId, supplierItems] of supplierGroups) {
        const groupSubtotal = supplierItems.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
        const groupShipping = shippingBySupplier[supplierId] ?? 0;
        const groupTax = Math.floor(groupSubtotal * 0.1);
        const order = await orderApi.create({
          buyerId: user.id, buyerName: user.fullName, buyerEmail: user.email,
          supplierId, supplierName: supplierItems[0].supplierName,
          items: supplierItems.map(item => ({
            id: item.id, productId: item.productId, productName: item.productName,
            productImage: item.productImage, quantity: item.quantity, unitPrice: item.unitPrice,
            totalPrice: item.unitPrice * item.quantity, variantName: item.variantName,
          })),
          subtotal: groupSubtotal, shippingFee: groupShipping, tax: groupTax,
          totalAmount: groupSubtotal + groupShipping + groupTax,
          status: 'Chờ xác nhận', shippingAddress, paymentMethod,
          notes: [notes, supplierNotes[supplierId]].filter(Boolean).join(' | '),
        });
        createdOrders.push(order);
      }
      await clearCart();
      navigate('/order-confirmation', {
        state: { orders: createdOrders, poNumber, paymentMethod, shippingAddress, discount: discountAmount },
      });
    } catch {
      toast.error('Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại.');
    } finally {
      setPlacingOrder(false);
    }
  };

  const handlePlaceOrderWithBackend = async () => {
    if (!user) return;
    setShowConfirmDialog(false);
    setPlacingOrder(true);
    try {
      const validation = await validateCart();
      if (!validation.valid) {
        toast.error(validation.issues[0]?.message ?? 'Gio hang chua hop le');
        return;
      }
      const backendPaymentMethod =
        paymentMethod === 'Chuyển khoản' || paymentMethod === 'Chuyá»ƒn khoáº£n'
          ? 'BANK_TRANSFER'
          : ['COD', 'BANK_TRANSFER', 'MOMO', 'VNPAY', 'INSTALLMENT'].includes(paymentMethod)
            ? paymentMethod
            : 'COD';
      const order = await (orderApi as typeof orderApi & {
        create: (data: {
          items: Array<{ productId: string; variantId?: string; quantity: number }>;
          shippingAddress: ReturnType<typeof buildShippingAddress>;
          paymentMethod: string;
          promotionCode?: string;
          notes?: string;
        }, user?: typeof user) => ReturnType<typeof orderApi.create>;
      }).create({
        items: items.map(item => ({
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
        })),
        shippingAddress: buildShippingAddress(),
        paymentMethod: backendPaymentMethod,
        promotionCode: appliedPromotion?.code,
        notes: [notes, ...Object.values(supplierNotes)].filter(Boolean).join(' | '),
      }, user);
      await clearCart();
      navigate('/order-confirmation', {
        state: { orders: [{ ...order, supplierName: 'CELLPHONES' }], poNumber, paymentMethod: backendPaymentMethod, shippingAddress, discount: discountAmount },
      });
    } catch {
      toast.error('Co loi xay ra khi dat hang. Vui long thu lai.');
    } finally {
      setPlacingOrder(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-6">
        <AppBreadcrumb items={[{ label: 'Giỏ hàng' }]} />
        <TableSkeleton rows={3} cols={4} />
      </div>
    );
  }

  // E18.06: Empty cart redesign
  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-6">
        <AppBreadcrumb items={[{ label: 'Giỏ hàng' }]} />
        <div className="max-w-md mx-auto py-16 text-center">
          <div className="h-24 w-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 flex items-center justify-center">
            <ShoppingBag className="h-12 w-12 text-primary" />
          </div>
          <h2 className="mb-2" style={{ fontFamily: 'var(--font-heading)' }}>Giỏ hàng trống</h2>
          <p className="text-muted-foreground mb-8">Hãy khám phá các sản phẩm công nghệ chính hãng tại CELLPHONES</p>
          <Link to="/products">
            <Button size="lg">
              <Sparkles className="mr-2 h-4 w-4" /> Khám phá sản phẩm
            </Button>
          </Link>
          {/* E18.05: Gợi ý sản phẩm */}
          {recommendations.length > 0 && (
            <div className="mt-12 text-left">
              <h3 className="mb-4 text-center" style={{ fontFamily: 'var(--font-heading)' }}>Sản phẩm gợi ý</h3>
              <div className="grid grid-cols-2 gap-3">
                {recommendations.slice(0, 4).map(p => (
                  <Link key={p.id} to={`/products/${p.id}`}>
                    <Card className="overflow-hidden hover:shadow-md transition-shadow border-0 shadow-sm">
                      <div className="aspect-[4/3] overflow-hidden">
                        <ImageWithFallback src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                      </div>
                      <CardContent className="p-2.5">
                        <p className="text-xs line-clamp-1">{p.name}</p>
                        <p className="text-xs text-primary" style={{ fontWeight: 600 }}>{formatPrice(p.price)}</p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6">
      <AppBreadcrumb items={[{ label: 'Trang chủ', href: '/' }, { label: 'Giỏ hàng' }]} />

      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 style={{ fontFamily: 'var(--font-heading)' }}>Giỏ hàng</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-sm font-semibold">{items.length}</span>
          </div>
          <p className="text-muted-foreground mt-0.5 text-sm">
            {items.length} sản phẩm từ {supplierGroups.length} cửa hàng
          </p>
        </div>
      </div>

      {/* E18.01: 2-col layout */}
      <div className="grid lg:grid-cols-[1fr_380px] gap-6">
        {/* Left: Items */}
        <div className="space-y-4">
          {supplierGroups.map(([supplierId, supplierItems]) => {
            const groupTotal = supplierItems.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
            const groupShipping = shippingBySupplier[supplierId] ?? 0;
            const noteExpanded = expandedNotes[supplierId] ?? false;
            return (
              <Card key={supplierId} className="overflow-hidden border-0 shadow-sm">
                {/* E18.03: Store header */}
                <div className="px-4 py-3 border-l-4 border-[#e31837] bg-gradient-to-r from-muted/60 to-muted/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-[#e31837]" />
                    <span className="text-sm font-semibold">{getCartStoreName(supplierItems[0])}</span>
                    <Badge variant="secondary" className="text-[10px]">{supplierItems.length} SP</Badge>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-[#e31837] font-bold">{formatPrice(groupTotal)}</span>
                    <Button variant="ghost" size="sm" className="text-destructive h-7 text-xs" onClick={() => handleRemoveSupplierItems(supplierId)}>
                      <Trash2 className="h-3 w-3 mr-1" /> Xoá
                    </Button>
                  </div>
                </div>

                <div className="divide-y">
                  {supplierItems.map(item => {
                    const isOOS = OUT_OF_STOCK_IDS.has(item.productId);
                    return (
                      <div key={item.id} className={`p-4 flex gap-4 ${isOOS ? 'opacity-50 bg-muted/20' : 'hover:bg-muted/10 transition-colors'}`}>
                        {/* E18.02: Larger image */}
                        <Link to={`/products/${item.productId}`} className="shrink-0">
                          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden border bg-muted/30">
                            <ImageWithFallback src={item.productImage} alt={item.productName} className="w-full h-full object-cover" />
                          </div>
                        </Link>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <Link to={`/products/${item.productId}`} className="text-sm hover:text-primary transition-colors line-clamp-2" style={{ fontWeight: 500 }}>
                                {item.productName}
                              </Link>
                              {item.variantName && (
                                <p className="text-xs text-muted-foreground mt-0.5">Loại: {item.variantName}</p>
                              )}
                            </div>
                            <button className="shrink-0 h-7 w-7 rounded-lg hover:bg-destructive/10 flex items-center justify-center transition-colors" onClick={() => handleRemoveItem(item.id)}>
                              <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                            </button>
                          </div>

                          {isOOS && (
                            <p className="text-destructive flex items-center gap-1 text-xs mt-1">
                              <AlertTriangle className="h-3 w-3" /> Hết hàng
                            </p>
                          )}

                          {/* Price + quantity row */}
                          <div className="flex items-center justify-between mt-3 gap-3 flex-wrap">
                            <span className="text-sm text-primary" style={{ fontWeight: 600 }}>
                              {formatPrice(item.unitPrice)}
                            </span>
                            {/* E18.02: Better stepper */}
                            <QuantityStepper
                              value={item.quantity}
                              onChange={v => updateQuantity(item.id, v)}
                              min={1}
                              disabled={isOOS}
                            />
                            <span className="text-sm" style={{ fontWeight: 600 }}>
                              {formatPrice(item.unitPrice * item.quantity)}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Shipping & notes */}
                  <div className="px-4 py-3 bg-muted/20 space-y-2">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Truck className="h-3.5 w-3.5" /> Phí vận chuyển (dự kiến)
                      </span>
                      <span>{formatPrice(groupShipping)}</span>
                    </div>
                    <button
                      className="flex items-center text-xs text-muted-foreground hover:text-foreground transition-colors"
                      onClick={() => setExpandedNotes(prev => ({ ...prev, [supplierId]: !noteExpanded }))}
                    >
                      <MessageSquare className="h-3 w-3 mr-1" />
                      Ghi chú cho cửa hàng
                      {noteExpanded ? <ChevronUp className="h-3 w-3 ml-1" /> : <ChevronDown className="h-3 w-3 ml-1" />}
                    </button>
                    {noteExpanded && (
                      <Textarea
                        placeholder={`Ghi chú cho ${getCartStoreName(supplierItems[0])}...`}
                        value={supplierNotes[supplierId] ?? ''}
                        onChange={e => setSupplierNotes(prev => ({ ...prev, [supplierId]: e.target.value }))}
                        rows={2} className="text-sm"
                      />
                    )}
                  </div>
                </div>
              </Card>
            );
          })}

          {/* Shipping & payment info */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm" style={{ fontFamily: 'var(--font-heading)' }}>
                Thông tin giao hàng & thanh toán
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="address" className="text-sm">Địa chỉ giao hàng *</Label>
                <Textarea id="address" value={shippingAddress} onChange={e => setShippingAddress(e.target.value)} placeholder="Nhập địa chỉ..." rows={2} />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="payment" className="text-sm">Phương thức thanh toán</Label>
                  <select
                    id="payment"
                    className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                    value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}
                  >
                    <option value="COD">COD - Thanh toán khi nhận hàng</option>
                    <option value="BANK_TRANSFER">Chuyển khoản ngân hàng</option>
                    <option value="MOMO">Momo</option>
                    <option value="VNPAY">VNPAY</option>
                    <option value="INSTALLMENT">Trả góp</option>
                  </select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="po" className="text-sm">Số PO nội bộ</Label>
                  <Input id="po" placeholder="VD: PO-2026-0001" value={poNumber} onChange={e => setPoNumber(e.target.value)} />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="notes" className="text-sm">Ghi chú chung</Label>
                <Textarea id="notes" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Ghi chú cho đơn hàng..." rows={2} />
              </div>
            </CardContent>
          </Card>

          {/* E18.05: Recommendations */}
          {recommendations.length > 0 && (
            <div>
              <h3 className="mb-3 text-sm" style={{ fontFamily: 'var(--font-heading)' }}>Bạn cũng có thể thích</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {recommendations.slice(0, 4).map(p => (
                  <Link key={p.id} to={`/products/${p.id}`}>
                    <Card className="overflow-hidden hover:shadow-md transition-all duration-200 border-0 shadow-sm group">
                      <div className="aspect-[4/3] overflow-hidden">
                        <ImageWithFallback src={p.images[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      </div>
                      <CardContent className="p-2.5">
                        <p className="text-xs line-clamp-1">{p.name}</p>
                        <p className="text-xs text-primary" style={{ fontWeight: 600 }}>{formatPrice(p.price)}</p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: E18.04 Summary sidebar */}
        <div className="space-y-4">
          {/* E18.10: Coupon card redesign */}
          <Card className="border-0 shadow-sm overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-orange-400 to-pink-500" />
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Tag className="h-4 w-4 text-orange-500" />
                <span className="text-sm" style={{ fontWeight: 600 }}>Mã giảm giá</span>
              </div>
              {appliedPromotion ? (
                <div className="flex items-center justify-between p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-xl">
                  <div>
                    <p className="text-sm text-emerald-700 dark:text-emerald-400" style={{ fontWeight: 600 }}>{appliedPromotion.code}</p>
                    <p className="text-xs text-emerald-600 dark:text-emerald-500">Giảm {formatPrice(discountAmount)}</p>
                  </div>
                  <button className="h-7 w-7 rounded-full hover:bg-destructive/10 flex items-center justify-center" onClick={handleRemoveCoupon}>
                    <XIcon className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                      <Input
                        className="pl-9 text-sm"
                        placeholder="Nhập mã..."
                        value={couponCode}
                        onChange={e => { setCouponCode(e.target.value.toUpperCase()); setCouponError(''); }}
                        onKeyDown={e => e.key === 'Enter' && handleApplyCoupon()}
                      />
                    </div>
                    <Button onClick={handleApplyCoupon} disabled={applyingCoupon} size="sm">
                      {applyingCoupon ? '...' : 'Áp dụng'}
                    </Button>
                  </div>
                  {couponError && <p className="text-destructive text-xs">{couponError}</p>}
                  <Link to="/promotions" className="text-primary hover:underline text-xs">
                    Xem tất cả khuyến mãi →
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* E18.04: Summary card */}
          <Card className="border-0 shadow-sm overflow-hidden sticky top-20">
            <div className="h-1 bg-gradient-to-r from-blue-500 to-indigo-500" />
            <CardContent className="p-4 space-y-3">
              <h3 className="text-sm" style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}>
                Tóm tắt đơn hàng
              </h3>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tạm tính ({items.length} SP)</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>

                {supplierGroups.length > 1 ? (
                  <div className="space-y-1">
                    {supplierGroups.map(([sid, sitems]) => (
                      <div key={sid} className="flex justify-between text-xs text-muted-foreground">
                        <span className="truncate max-w-[200px]">Vận chuyển: {getCartStoreName(sitems[0])}</span>
                        <span>{formatPrice(shippingBySupplier[sid] ?? 0)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Phí vận chuyển</span>
                    <span>{formatPrice(totalShipping)}</span>
                  </div>
                )}

                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Thuế GTGT (10%)</span>
                  <span>{formatPrice(tax)}</span>
                </div>

                {appliedPromotion && (
                  <div className="flex justify-between text-sm text-emerald-600">
                    <span>Giảm giá ({appliedPromotion.code})</span>
                    <span>-{formatPrice(discountAmount)}</span>
                  </div>
                )}
              </div>

              <Separator />

              <div className="flex justify-between items-baseline">
                <span className="text-sm font-semibold">Tổng cộng</span>
                <span className="text-xl text-[#e31837] font-black" style={{ fontFamily: 'var(--font-heading)' }}>
                  {formatPrice(total)}
                </span>
              </div>

              {supplierGroups.length > 1 && (
                <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1 bg-amber-50 dark:bg-amber-950/20 p-2 rounded-lg">
                  <AlertTriangle className="h-3 w-3 shrink-0" />
                  Sẽ tạo {supplierGroups.length} đơn giao hàng riêng theo cửa hàng
                </p>
              )}

              {poNumber && (
                <p className="text-xs text-muted-foreground">PO: {poNumber}</p>
              )}

              {/* Terms */}
              <div className="flex items-start gap-2 pt-1">
                <Checkbox id="terms" checked={agreedTerms} onCheckedChange={(v) => setAgreedTerms(v === true)} className="mt-0.5" />
                <Label htmlFor="terms" className="cursor-pointer text-xs leading-relaxed">
                  Tôi đồng ý với <span className="text-primary underline">Điều khoản</span> và <span className="text-primary underline">Chính sách đổi trả</span>
                </Label>
              </div>

              <Button
                className="w-full font-bold bg-gradient-to-r from-[#e31837] to-[#c91432] hover:from-[#c91432] hover:to-[#a50f28] border-0 shadow-md hover:shadow-lg transition-all"
                size="lg" onClick={handleRequestPlaceOrder} disabled={placingOrder || !agreedTerms}
              >
                {placingOrder ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Đang xử lý...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" /> Xem lại &amp; Đặt hàng
                  </span>
                )}
              </Button>

              {/* Trust badges */}
              <div className="grid grid-cols-3 gap-1 pt-2">
                {[
                  { icon: ShieldCheck, label: 'Bảo mật', gradient: 'from-emerald-500 to-teal-600' },
                  { icon: Truck, label: 'Giao nhanh', gradient: 'from-blue-500 to-indigo-600' },
                  { icon: RotateCcw, label: 'Đổi trả', gradient: 'from-violet-500 to-purple-600' },
                ].map(b => (
                  <div key={b.label} className="text-center">
                    <div className={`h-7 w-7 mx-auto rounded-lg bg-gradient-to-br ${b.gradient} flex items-center justify-center mb-1 shadow-sm`}>
                      <b.icon className="h-3.5 w-3.5 text-white" />
                    </div>
                    <p className="text-[10px] text-muted-foreground font-medium">{b.label}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* E18.09: Mobile sticky bottom bar */}
      <div className="fixed bottom-0 inset-x-0 z-40 bg-background/95 backdrop-blur border-t shadow-xl lg:hidden">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">{items.length} sản phẩm</p>
            <p className="text-[#e31837] font-black" style={{ fontFamily: 'var(--font-heading)' }}>
              {formatPrice(total)}
            </p>
          </div>
          <Button
            onClick={handleRequestPlaceOrder} disabled={placingOrder || !agreedTerms}
            className="font-bold bg-gradient-to-r from-[#e31837] to-[#c91432] border-0 shadow-md"
          >
            Thanh toán <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Confirm dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle style={{ fontFamily: 'var(--font-heading)' }}>Xác nhận đặt hàng</DialogTitle>
            <DialogDescription>Kiểm tra thông tin trước khi đặt hàng</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <p className="text-sm mb-2" style={{ fontWeight: 600 }}>Sản phẩm ({items.length})</p>
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {items.map(item => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="truncate max-w-[280px]">{item.productName} × {item.quantity}</span>
                    <span>{formatPrice(item.unitPrice * item.quantity)}</span>
                  </div>
                ))}
              </div>
            </div>
            <Separator />
            <div className="space-y-1 text-sm">
              <p style={{ fontWeight: 500 }}>Giao hàng</p>
              <p className="text-muted-foreground">{shippingAddress}</p>
              <p className="text-muted-foreground">Thanh toán: {paymentMethod}</p>
              {poNumber && <p className="text-muted-foreground">PO: {poNumber}</p>}
            </div>
            <Separator />
            <div className="space-y-1 text-sm">
              <div className="flex justify-between"><span>Tạm tính</span><span>{formatPrice(subtotal)}</span></div>
              <div className="flex justify-between"><span>Vận chuyển</span><span>{formatPrice(totalShipping)}</span></div>
              <div className="flex justify-between"><span>Thuế GTGT</span><span>{formatPrice(tax)}</span></div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600"><span>Giảm giá</span><span>-{formatPrice(discountAmount)}</span></div>
              )}
              <Separator />
              <div className="flex justify-between" style={{ fontWeight: 600 }}>
                <span>Tổng cộng</span>
                <span className="text-primary text-lg">{formatPrice(total)}</span>
              </div>
            </div>
            {supplierGroups.length > 1 && (
              <p className="text-amber-600 flex items-center gap-1 text-xs">
                <AlertTriangle className="h-3.5 w-3.5" /> Sẽ tạo {supplierGroups.length} đơn giao hàng riêng
              </p>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>Quay lại</Button>
            <Button onClick={handlePlaceOrderWithBackend} disabled={placingOrder}>
              {placingOrder ? 'Đang xử lý...' : 'Xác nhận đặt hàng'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

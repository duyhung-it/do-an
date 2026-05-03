// ============================================================
// Chi tiết đơn hàng Buyer — Redesign UI-E Đợt 19
// E19.03–E19.05: Timeline, product table, print CSS
// ============================================================

import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import {
  MapPin, CreditCard, FileText, MessageSquare, XCircle,
  RefreshCw, CheckCircle2, Circle, Printer, Save, Receipt,
  Truck, Package, Star, RotateCcw, Clock, ShoppingCart, PackageCheck,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Separator } from '../ui/separator';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Progress } from '../ui/progress';
import { StatusBadge } from '../shared/StatusBadge';
import { AppBreadcrumb } from '../shared/AppBreadcrumb';
import { DetailSkeleton } from '../shared/PageSkeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { orderApi, chatApi, templateApi, invoiceBuyerApi, shipmentApi, reviewApi, returnApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import type { Order, Invoice, Shipment, Review, ReturnReason, ReturnItem } from '../../types';
import { Badge } from '../ui/badge';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { toast } from 'sonner';
import { WriteReviewDialog } from '../shared/ReviewComponents';

const formatPrice = (price: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

const RETURN_REASONS: ReturnReason[] = ['Lỗi SP', 'Sai quy cách', 'Giao sai', 'Hư hỏng vận chuyển', 'Không đúng mô tả', 'Khác'];
const REFUND_METHODS = ['Hoàn tiền gốc', 'Tín dụng cửa hàng', 'Đổi hàng'] as const;

// E19.03: Timeline config with icons
const statusFlowConfig = [
  { status: 'Chờ xác nhận' as Order['status'], icon: Clock, label: 'Chờ xác nhận' },
  { status: 'Đã xác nhận' as Order['status'], icon: CheckCircle2, label: 'Đã xác nhận' },
  { status: 'Đang xử lý' as Order['status'], icon: ShoppingCart, label: 'Đang xử lý' },
  { status: 'Đang giao hàng' as Order['status'], icon: Truck, label: 'Đang giao hàng' },
  { status: 'Đã giao' as Order['status'], icon: PackageCheck, label: 'Đã giao' },
];
const statusFlow: Order['status'][] = statusFlowConfig.map(s => s.status);

function OrderTimeline({ currentStatus }: { currentStatus: Order['status'] }) {
  const currentIdx = statusFlow.indexOf(currentStatus);
  const isCancelled = currentStatus === 'Đã huỷ' || currentStatus === 'Hoàn trả';

  if (isCancelled) {
    return (
      <div className="flex items-center gap-3 p-4 rounded-xl relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, rgba(239,68,68,0.08), rgba(220,38,38,0.05))' }}
      >
        <div className="h-10 w-10 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center justify-center shrink-0">
          <XCircle className="h-5 w-5 text-destructive" />
        </div>
        <div>
          <p className="font-bold text-destructive">Đơn hàng đã bị {currentStatus.toLowerCase()}</p>
          <p className="text-sm text-muted-foreground mt-0.5">Liên hệ NCC để biết thêm chi tiết</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-0 sm:gap-0 w-full">
      {statusFlowConfig.map((step, idx) => {
        const isPast = idx <= currentIdx;
        const isCurrent = idx === currentIdx;
        const IconComp = step.icon;
        return (
          <div key={step.status} className="flex items-center flex-1 min-w-0 last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <div className={`
                h-11 w-11 rounded-full flex items-center justify-center transition-all duration-300
                ${isCurrent ? 'bg-gradient-to-br from-blue-600 to-indigo-700 text-white ring-4 ring-indigo-200 shadow-lg shadow-indigo-200/50' : ''}
                ${isPast && !isCurrent ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-sm' : ''}
                ${!isPast ? 'bg-muted text-muted-foreground' : ''}
              `}>
                {isPast && !isCurrent ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : (
                  <IconComp className="h-4 w-4" />
                )}
              </div>
              <span className={`text-center whitespace-nowrap text-xs font-medium ${
                isCurrent ? 'text-indigo-600' : isPast ? 'text-emerald-600' : 'text-muted-foreground'
              }`}>
                {step.label}
              </span>
            </div>
            {idx < statusFlowConfig.length - 1 && (
              <div className={`hidden sm:block flex-1 h-1 mx-2 min-w-4 rounded-full transition-all duration-500 ${
                idx < currentIdx
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                  : 'bg-muted'
              }`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { addItem } = useCart();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [reordering, setReordering] = useState(false);

  const [relatedInvoices, setRelatedInvoices] = useState<Invoice[]>([]);
  const [showInvoice, setShowInvoice] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [relatedShipments, setRelatedShipments] = useState<Shipment[]>([]);
  const [showShipment, setShowShipment] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [orderReviews, setOrderReviews] = useState<Review[]>([]);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [reviewProductId, setReviewProductId] = useState('');
  const [reviewProductName, setReviewProductName] = useState('');

  const [showReturnDialog, setShowReturnDialog] = useState(false);
  const [returnReason, setReturnReason] = useState<ReturnReason>('Lỗi SP');
  const [returnDescription, setReturnDescription] = useState('');
  const [returnRefundMethod, setReturnRefundMethod] = useState<typeof REFUND_METHODS[number]>('Hoàn tiền gốc');
  const [returnItems, setReturnItems] = useState<{ productId: string; quantity: number; note: string }[]>([]);
  const [submittingReturn, setSubmittingReturn] = useState(false);
  const [existingReturns, setExistingReturns] = useState<string[]>([]);

  useEffect(() => {
    if (id) {
      orderApi.getById(id).then(o => { if (o) setOrder(o); setLoading(false); });
    }
  }, [id]);

  useEffect(() => {
    if (order && user) {
      invoiceBuyerApi.getByBuyer(user.id, { page: 1, pageSize: 50 }).then(res => {
        setRelatedInvoices(res.data.filter(inv => inv.orderId === order.id));
      });
    }
  }, [order, user]);

  useEffect(() => {
    if (order && user) {
      shipmentApi.getByOrder(order.id).then(sh => setRelatedShipments(sh ? [sh] : []));
    }
  }, [order, user]);

  useEffect(() => { if (order) reviewApi.getByOrder(order.id).then(setOrderReviews); }, [order]);
  useEffect(() => { if (order) returnApi.getByOrderId(order.id).then(rets => setExistingReturns(rets.map(r => r.id))); }, [order]);

  const canCancel = order && ['Chờ xác nhận', 'Đã xác nhận'].includes(order.status);
  const isCompleted = order && ['Đã giao', 'Đã huỷ', 'Hoàn trả'].includes(order.status);
  const canReturn = order?.status === 'Đã giao' && existingReturns.length === 0;

  const handleCancel = async () => {
    if (!order) return;
    setCancelling(true);
    try {
      const updated = await orderApi.updateStatus(order.id, 'Đã huỷ');
      setOrder(updated); setShowCancelConfirm(false); toast.success('Đã huỷ đơn hàng');
    } catch { toast.error('Không thể huỷ đơn hàng'); } finally { setCancelling(false); }
  };

  const handleChat = async () => {
    if (!isAuthenticated || !user || !order) { toast.error('Vui lòng đăng nhập để nhắn tin'); return; }
    const conv = await chatApi.createConversation(user.id, user.fullName, order.supplierId, order.supplierName);
    navigate(`/chat?conv=${conv.id}`);
  };

  const handleReorder = async () => {
    if (!order) return;
    setReordering(true);
    try {
      for (const item of order.items) {
        await addItem({ productId: item.productId, productName: item.productName, productImage: item.productImage, supplierId: order.supplierId, supplierName: order.supplierName, quantity: item.quantity, unitPrice: item.unitPrice, variantName: item.variantName });
      }
      toast.success('Đã thêm lại SP vào giỏ hàng'); navigate('/cart');
    } finally { setReordering(false); }
  };

  const handleOpenReturnDialog = () => {
    if (!order) return;
    setReturnItems(order.items.map(i => ({ productId: i.productId, quantity: i.quantity, note: '' })));
    setReturnReason('Lỗi SP'); setReturnDescription(''); setReturnRefundMethod('Hoàn tiền gốc'); setShowReturnDialog(true);
  };

  const handleSubmitReturn = async () => {
    if (!order || !user) return;
    if (!returnDescription.trim()) { toast.error('Vui lòng nhập mô tả lý do trả hàng'); return; }
    const selectedItems = returnItems.filter(i => i.quantity > 0);
    if (selectedItems.length === 0) { toast.error('Vui lòng chọn ít nhất 1 SP để trả'); return; }
    setSubmittingReturn(true);
    try {
      const items: ReturnItem[] = selectedItems.map(si => {
        const oi = order.items.find(o => o.productId === si.productId)!;
        return { productId: si.productId, productName: oi.productName, productImage: oi.productImage, quantity: si.quantity, unitPrice: oi.unitPrice, reason: returnReason, note: si.note };
      });
      const refundAmount = items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
      await returnApi.create({ orderId: order.id, orderNumber: order.orderNumber, buyerId: user.id, buyerName: user.fullName, buyerCompany: user.companyName ?? '', supplierId: order.supplierId, supplierName: order.supplierName, items, reason: returnReason, description: returnDescription, refundAmount, refundMethod: returnRefundMethod, images: [] });
      setShowReturnDialog(false); setExistingReturns(prev => [...prev, 'new']); toast.success('Đã gửi yêu cầu trả hàng');
    } catch { toast.error('Không thể gửi yêu cầu trả hàng'); } finally { setSubmittingReturn(false); }
  };

  if (loading) {
    return (<div className="container mx-auto px-4 sm:px-6 py-6"><AppBreadcrumb items={[{ label: 'Đơn hàng', href: '/orders' }, { label: 'Chi tiết' }]} /><DetailSkeleton /></div>);
  }
  if (!order) {
    return (<div className="container mx-auto px-4 sm:px-6 py-6 text-center py-16"><p className="text-muted-foreground">Không tìm thấy đơn hàng.</p><Link to="/orders" className="text-primary hover:underline mt-2 block">Quay lại danh sách</Link></div>);
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6">
      <AppBreadcrumb items={[{ label: 'Đơn hàng', href: '/orders' }, { label: order.orderNumber }]} />

      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap mb-1">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-sm">
              <Package className="h-4 w-4 text-white" />
            </div>
            <h1 className="font-black" style={{ fontFamily: 'var(--font-heading)' }}>{order.orderNumber}</h1>
            {order.orderType && order.orderType !== 'Thường' && (
              <Badge variant="secondary">{order.orderType}</Badge>
            )}
            {order.isUrgent && <Badge variant="destructive">Gấp</Badge>}
          </div>
          <p className="text-muted-foreground text-sm ml-11">
            Ngày tạo: {order.createdAt}
            {order.expectedDeliveryDate && <> · Giao dự kiến: <span className="text-foreground font-medium">{order.expectedDeliveryDate}</span></>}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <StatusBadge status={order.status} />
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Printer className="mr-1 h-4 w-4" /> In
          </Button>
          <Button variant="outline" size="sm" onClick={handleChat}>
            <MessageSquare className="mr-1 h-4 w-4" /> Nhắn tin
          </Button>
          {canCancel && (
            <Button variant="destructive" size="sm" onClick={() => setShowCancelConfirm(true)}>
              <XCircle className="mr-1 h-4 w-4" /> Huỷ đơn
            </Button>
          )}
          {isCompleted && (
            <>
              <Button size="sm" onClick={handleReorder} disabled={reordering}>
                <RefreshCw className={`mr-1 h-4 w-4 ${reordering ? 'animate-spin' : ''}`} /> Đặt lại
              </Button>
              {order.status === 'Đã giao' && (
                <Button size="sm" variant="outline" onClick={async () => {
                  await templateApi.create({ userId: user?.id ?? 'user-001', name: `Template từ ${order.orderNumber}`, description: `Tạo từ đơn hàng ${order.orderNumber}`, items: order.items.map(i => ({ productId: i.productId, productName: i.productName, productImage: i.productImage, quantity: i.quantity, unitPrice: i.unitPrice, unit: 'cái' })), supplierId: order.supplierId, supplierName: order.supplierName });
                  toast.success('Đã lưu làm template');
                }}>
                  <Save className="mr-1 h-4 w-4" /> Template
                </Button>
              )}
            </>
          )}
          {canReturn && (
            <Button size="sm" variant="outline" onClick={handleOpenReturnDialog}>
              <RotateCcw className="mr-1 h-4 w-4" /> Trả hàng
            </Button>
          )}
        </div>
      </div>

      {/* E19.03: Enhanced Timeline */}
      <Card className="mb-6 border-0 shadow-sm">
        <CardContent className="p-5">
          <OrderTimeline currentStatus={order.status} />
          {/* DB-C.10: Hiển thị lý do huỷ */}
          {order.status === 'Đã huỷ' && order.cancelReason && (
            <div className="mt-3 p-3 rounded-lg bg-destructive/5 border border-destructive/10 text-sm">
              <span className="text-muted-foreground">Lý do huỷ: </span>
              <span>{order.cancelReason}</span>
              {order.cancelledAt && <span className="text-muted-foreground"> · {order.cancelledAt}</span>}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          {/* E19.04: Product items */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2" style={{ fontFamily: 'var(--font-heading)' }}>
                <FileText className="h-4 w-4 text-primary" /> Sản phẩm ({order.items.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="divide-y">
                {order.items.map(item => (
                  <div key={item.id} className="flex gap-3 py-3 first:pt-0 last:pb-0">
                    <Link to={`/products/${item.productId}`} className="shrink-0">
                      <div className="w-16 h-16 rounded-xl overflow-hidden border bg-muted/30">
                        <ImageWithFallback src={item.productImage} alt={item.productName} className="w-full h-full object-cover" />
                      </div>
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link to={`/products/${item.productId}`} className="text-sm hover:text-primary transition-colors line-clamp-1" style={{ fontWeight: 500 }}>
                        {item.productName}
                      </Link>
                      {item.variantName && <p className="text-xs text-muted-foreground">Loại: {item.variantName}</p>}
                      <div className="flex items-center gap-3 mt-1 text-sm">
                        <span className="text-muted-foreground">{formatPrice(item.unitPrice)} × {item.quantity}</span>
                        <span className="text-primary" style={{ fontWeight: 600 }}>{formatPrice(item.totalPrice)}</span>
                      </div>
                      {order.status === 'Đã giao' && (
                        orderReviews.some(r => r.productId === item.productId) ? (
                          <span className="inline-flex items-center gap-1 mt-1 text-emerald-600 text-xs">
                            <CheckCircle2 className="h-3 w-3" /> Đã đánh giá
                          </span>
                        ) : (
                          <Button variant="outline" size="sm" className="mt-1.5 h-7 text-xs" onClick={() => { setReviewProductId(item.productId); setReviewProductName(item.productName); setShowReviewDialog(true); }}>
                            <Star className="mr-1 h-3 w-3" /> Đánh giá
                          </Button>
                        )
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Address & Payment */}
          <div className="grid sm:grid-cols-2 gap-4">
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2" style={{ fontFamily: 'var(--font-heading)' }}><MapPin className="h-4 w-4 text-primary" /> Địa chỉ giao hàng</CardTitle></CardHeader>
              <CardContent className="text-sm"><p style={{ fontWeight: 500 }}>{order.buyerName}</p><p className="text-muted-foreground">{order.shippingAddress}</p><p className="text-muted-foreground">{order.buyerEmail}</p></CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2" style={{ fontFamily: 'var(--font-heading)' }}><CreditCard className="h-4 w-4 text-primary" /> Thanh toán</CardTitle></CardHeader>
              <CardContent className="text-sm"><p>Phương thức: {order.paymentMethod}</p>{order.notes && <p className="text-muted-foreground mt-1">Ghi chú: {order.notes}</p>}</CardContent>
            </Card>
          </div>

          {/* Invoices */}
          {relatedInvoices.length > 0 && (
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2" style={{ fontFamily: 'var(--font-heading)' }}><Receipt className="h-4 w-4 text-primary" /> Hoá đơn ({relatedInvoices.length})</CardTitle></CardHeader>
              <CardContent><div className="space-y-2">{relatedInvoices.map(inv => (
                <div key={inv.id} className="flex items-center justify-between p-3 rounded-xl border hover:bg-muted/50 cursor-pointer transition-colors" onClick={() => { setSelectedInvoice(inv); setShowInvoice(true); }}>
                  <div><p className="text-sm" style={{ fontWeight: 500 }}>{inv.invoiceNumber}</p><p className="text-xs text-muted-foreground">{inv.supplierName} — {inv.issuedDate}</p></div>
                  <div className="text-right"><p className="text-sm text-primary" style={{ fontWeight: 600 }}>{formatPrice(inv.totalAmount)}</p><StatusBadge status={inv.status} /></div>
                </div>
              ))}</div></CardContent>
            </Card>
          )}

          {/* Shipments */}
          {relatedShipments.length > 0 && (
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2" style={{ fontFamily: 'var(--font-heading)' }}><Truck className="h-4 w-4 text-primary" /> Vận chuyển ({relatedShipments.length})</CardTitle></CardHeader>
              <CardContent><div className="space-y-2">{relatedShipments.map(ship => (
                <div key={ship.id} className="flex items-center justify-between p-3 rounded-xl border hover:bg-muted/50 cursor-pointer transition-colors" onClick={() => { setSelectedShipment(ship); setShowShipment(true); }}>
                  <div><p className="text-sm" style={{ fontWeight: 500 }}>{ship.trackingNumber}</p><p className="text-xs text-muted-foreground">{ship.carrierName} — {ship.createdAt}</p></div>
                  <div className="text-right"><StatusBadge status={ship.status} /><p className="text-xs text-muted-foreground mt-0.5">Dự kiến: {ship.estimatedDelivery}</p></div>
                </div>
              ))}</div></CardContent>
            </Card>
          )}
        </div>

        {/* Summary */}
        <Card className="h-fit border-0 shadow-sm overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-[#e31837] to-[#c91432]" />
          <CardHeader className="pb-2"><CardTitle className="text-sm" style={{ fontFamily: 'var(--font-heading)' }}>Tóm tắt đơn hàng</CardTitle></CardHeader>
          <CardContent className="space-y-2.5 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Nhà cung cấp</span><Link to={`/suppliers/${order.supplierId}`} className="text-primary hover:underline">{order.supplierName}</Link></div>
            <Separator />
            <div className="flex justify-between"><span className="text-muted-foreground">Tạm tính</span><span>{formatPrice(order.subtotal)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Vận chuyển</span><span>{formatPrice(order.shippingFee)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Thuế</span><span>{formatPrice(order.tax)}</span></div>
            {(order.discountAmount ?? 0) > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>Giảm giá{order.promotionCode ? ` (${order.promotionCode})` : ''}</span>
                <span>-{formatPrice(order.discountAmount!)}</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between items-baseline">
              <span className="font-semibold">Tổng cộng</span>
              <span className="text-[#e31837] text-lg font-black" style={{ fontFamily: 'var(--font-heading)' }}>{formatPrice(order.totalAmount)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cancel dialog */}
      <Dialog open={showCancelConfirm} onOpenChange={setShowCancelConfirm}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Xác nhận huỷ đơn hàng</DialogTitle>
            <DialogDescription>Vui lòng xác nhận trước khi huỷ đơn hàng</DialogDescription>
          </DialogHeader>
          <p className="text-muted-foreground">Bạn có chắc muốn huỷ đơn <strong>{order.orderNumber}</strong>? Không thể hoàn tác.</p>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setShowCancelConfirm(false)}>Không</Button>
            <Button variant="destructive" onClick={handleCancel} disabled={cancelling}>{cancelling ? 'Đang huỷ...' : 'Huỷ đơn hàng'}</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Invoice dialog */}
      <Dialog open={showInvoice} onOpenChange={setShowInvoice}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Hoá đơn {selectedInvoice?.invoiceNumber}</DialogTitle>
            <DialogDescription>Chi tiết hoá đơn GTGT điện tử</DialogDescription>
          </DialogHeader>
          {selectedInvoice && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div><h2 className="text-primary">HOÁ ĐƠN GTGT</h2><p className="text-muted-foreground">Số: {selectedInvoice.invoiceNumber}</p><p className="text-muted-foreground">Ngày: {selectedInvoice.issuedDate}</p></div>
                <div className="text-right"><StatusBadge status={selectedInvoice.status} /><p className="text-muted-foreground mt-1">Hạn TT: {selectedInvoice.dueDate}</p></div>
              </div>
              <Separator />
              <div className="grid sm:grid-cols-2 gap-4">
                <div><Label className="text-muted-foreground">Bên bán</Label><p>{selectedInvoice.supplierCompany}</p><p className="text-muted-foreground">MST: {selectedInvoice.supplierTaxCode}</p></div>
                <div><Label className="text-muted-foreground">Bên mua</Label><p>{selectedInvoice.buyerCompany}</p><p className="text-muted-foreground">MST: {selectedInvoice.buyerTaxCode}</p></div>
              </div>
              <Separator />
              <div className="overflow-x-auto"><table className="w-full border-collapse"><thead><tr className="border-b bg-muted/50"><th className="text-left p-2">#</th><th className="text-left p-2">Mô tả</th><th className="text-right p-2">SL</th><th className="text-right p-2">Đơn giá</th><th className="text-right p-2">Thành tiền</th></tr></thead><tbody>{selectedInvoice.items.map((item, idx) => (<tr key={idx} className="border-b"><td className="p-2">{idx + 1}</td><td className="p-2">{item.description}</td><td className="p-2 text-right">{item.quantity.toLocaleString()}</td><td className="p-2 text-right">{new Intl.NumberFormat('vi-VN').format(item.unitPrice)}</td><td className="p-2 text-right">{new Intl.NumberFormat('vi-VN').format(item.amount)}</td></tr>))}</tbody></table></div>
              <div className="flex justify-end"><div className="w-64 space-y-1"><div className="flex justify-between"><span className="text-muted-foreground">Cộng tiền hàng:</span><span>{new Intl.NumberFormat('vi-VN').format(selectedInvoice.subtotal)} ₫</span></div><div className="flex justify-between"><span className="text-muted-foreground">Thuế GTGT ({selectedInvoice.taxRate}%):</span><span>{new Intl.NumberFormat('vi-VN').format(selectedInvoice.taxAmount)} ₫</span></div><Separator /><div className="flex justify-between"><span>Tổng cộng:</span><span className="text-primary">{new Intl.NumberFormat('vi-VN').format(selectedInvoice.totalAmount)} ₫</span></div></div></div>
            </div>
          )}
          <div className="flex justify-end gap-2 mt-4"><Button variant="outline" onClick={() => setShowInvoice(false)}>Đóng</Button><Button variant="outline" onClick={() => window.print()}><Printer className="mr-1 h-4 w-4" /> In</Button></div>
        </DialogContent>
      </Dialog>

      {/* Shipment dialog */}
      <Dialog open={showShipment} onOpenChange={setShowShipment}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Truck className="h-5 w-5" /> Vận đơn {selectedShipment?.trackingNumber}</DialogTitle>
            <DialogDescription>Theo dõi chi tiết quá trình vận chuyển</DialogDescription>
          </DialogHeader>
          {selectedShipment && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div><p className="text-muted-foreground text-xs">Hãng VC</p><p className="font-medium">{selectedShipment.carrierName}</p></div>
                <div><p className="text-muted-foreground text-xs">Trạng thái</p><StatusBadge status={selectedShipment.status} /></div>
                <div><p className="text-muted-foreground text-xs">Từ</p><p>{selectedShipment.fromAddress}</p></div>
                <div><p className="text-muted-foreground text-xs">Đến</p><p>{selectedShipment.toAddress}</p></div>
                <div><p className="text-muted-foreground text-xs">Cân nặng</p><p>{selectedShipment.weight} kg</p></div>
                <div><p className="text-muted-foreground text-xs">Phí VC</p><p>{formatPrice(selectedShipment.shippingFee)}</p></div>
                <div><p className="text-muted-foreground text-xs">Dự kiến giao</p><p>{selectedShipment.estimatedDelivery}</p></div>
                {selectedShipment.actualDelivery && (<div><p className="text-muted-foreground text-xs">Giao thực tế</p><p className="text-green-600">{selectedShipment.actualDelivery}</p></div>)}
              </div>
              <Separator />
              <div>
                <p className="font-medium mb-3">Hành trình ({selectedShipment.events.length})</p>
                <div className="space-y-0">
                  {[...selectedShipment.events].reverse().map((ev, idx) => (
                    <div key={idx} className="flex gap-3 pb-3 last:pb-0">
                      <div className="flex flex-col items-center">
                        <div className={`w-3 h-3 rounded-full shrink-0 ${idx === 0 ? 'bg-primary' : 'bg-muted-foreground/40'}`} />
                        {idx < selectedShipment.events.length - 1 && <div className="w-0.5 flex-1 bg-muted-foreground/20 mt-1" />}
                      </div>
                      <div className="flex-1 min-w-0"><p className="font-medium">{ev.description}</p><p className="text-muted-foreground">{ev.timestamp} · {ev.location}</p></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          <div className="flex justify-end gap-2 mt-4"><Button variant="outline" onClick={() => setShowShipment(false)}>Đóng</Button></div>
        </DialogContent>
      </Dialog>

      {/* Review dialog */}
      <WriteReviewDialog
        open={showReviewDialog} onOpenChange={setShowReviewDialog} productName={reviewProductName}
        onSubmit={async (data) => {
          if (!order) return;
          try {
            const newReview = await reviewApi.create({ productId: reviewProductId, productName: reviewProductName, userId: user?.id ?? 'user-001', userName: user?.fullName ?? 'Người dùng', userCompany: user?.companyName, orderId: order.id, orderNumber: order.orderNumber, rating: data.rating, title: data.title, comment: data.comment, tags: data.tags, images: data.images, isVerifiedPurchase: true, helpfulCount: 0 });
            setOrderReviews(prev => [...prev, newReview]); setShowReviewDialog(false); toast.success('Đã gửi đánh giá');
          } catch { toast.error('Lỗi khi gửi đánh giá'); }
        }}
      />

      {/* Return dialog */}
      <Dialog open={showReturnDialog} onOpenChange={setShowReturnDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><RotateCcw className="h-5 w-5" /> Trả hàng — {order.orderNumber}</DialogTitle>
            <DialogDescription>Chọn sản phẩm và lý do trả hàng</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="mb-2 block text-sm" style={{ fontWeight: 500 }}>Sản phẩm trả hàng</Label>
              <div className="space-y-2">{order.items.map(item => {
                const ri = returnItems.find(i => i.productId === item.productId);
                return (
                  <div key={item.productId} className="flex items-start gap-3 p-3 rounded-xl border">
                    <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0"><ImageWithFallback src={item.productImage} alt={item.productName} className="w-full h-full object-cover" /></div>
                    <div className="flex-1 min-w-0"><p className="text-sm truncate" style={{ fontWeight: 500 }}>{item.productName}</p><p className="text-xs text-muted-foreground">{formatPrice(item.unitPrice)} × {item.quantity}</p></div>
                    <div className="flex items-center gap-2 shrink-0"><Label className="text-xs text-muted-foreground">SL:</Label><Input type="number" min={0} max={item.quantity} value={ri?.quantity ?? 0} onChange={e => { const val = Math.min(Math.max(0, parseInt(e.target.value) || 0), item.quantity); setReturnItems(prev => prev.map(i => i.productId === item.productId ? { ...i, quantity: val } : i)); }} className="w-16 h-8" /></div>
                  </div>
                );
              })}</div>
            </div>
            <Separator />
            <div className="grid sm:grid-cols-2 gap-4">
              <div><Label className="mb-1 block text-sm">Lý do</Label><Select value={returnReason} onValueChange={v => setReturnReason(v as ReturnReason)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{RETURN_REASONS.map(r => (<SelectItem key={r} value={r}>{r}</SelectItem>))}</SelectContent></Select></div>
              <div><Label className="mb-1 block text-sm">Hoàn tiền</Label><Select value={returnRefundMethod} onValueChange={v => setReturnRefundMethod(v as typeof REFUND_METHODS[number])}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{REFUND_METHODS.map(m => (<SelectItem key={m} value={m}>{m}</SelectItem>))}</SelectContent></Select></div>
            </div>
            <div><Label className="mb-1 block text-sm">Mô tả chi tiết *</Label><Textarea placeholder="Mô tả lý do, tình trạng SP..." value={returnDescription} onChange={e => setReturnDescription(e.target.value)} rows={3} /></div>
            {returnItems.some(i => i.quantity > 0) && (
              <div className="p-3 rounded-xl bg-primary/5 border border-primary/10">
                <p className="text-xs text-muted-foreground">Số tiền yêu cầu hoàn:</p>
                <p className="text-primary" style={{ fontFamily: 'var(--font-heading)', fontWeight: 700 }}>{formatPrice(returnItems.reduce((s, ri) => { const oi = order.items.find(i => i.productId === ri.productId); return s + (oi ? oi.unitPrice * ri.quantity : 0); }, 0))}</p>
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2 mt-4"><Button variant="outline" onClick={() => setShowReturnDialog(false)}>Huỷ</Button><Button onClick={handleSubmitReturn} disabled={submittingReturn}>{submittingReturn ? 'Đang gửi...' : 'Gửi yêu cầu'}</Button></div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
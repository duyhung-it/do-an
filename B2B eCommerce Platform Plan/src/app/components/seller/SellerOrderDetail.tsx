// ============================================================
// Chi tiết đơn hàng NCC — Customer card, action CTA, internal notes
// P4.25–P4.30
// ============================================================

import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import {
  ArrowLeft, CheckCircle2, Circle, Printer, MessageSquare, ClipboardCheck,
  Star, AlertTriangle, User, Building2, Mail, ShoppingBag, Edit, Lock,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Separator } from '../ui/separator';
import { StatusBadge } from '../shared/StatusBadge';
import { AppBreadcrumb } from '../shared/AppBreadcrumb';
import { DetailSkeleton } from '../shared/PageSkeleton';
import { orderApi, chatApi } from '../../services/api';
import { grnApi } from '../../services/grnApi';
import { useAuth } from '../../context/AuthContext';
import type { Order, GoodsReceivedNote } from '../../types';
import { toast } from 'sonner';
import { ImageWithFallback } from '../figma/ImageWithFallback';

const formatPrice = (price: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

const allStatuses: Order['status'][] = ['Chờ xác nhận', 'Đã xác nhận', 'Đang xử lý', 'Đang giao hàng', 'Đã giao', 'Đã huỷ'];

// Timeline hiển thị tiến trình đơn hàng
const statusFlow: Order['status'][] = ['Chờ xác nhận', 'Đã xác nhận', 'Đang xử lý', 'Đang giao hàng', 'Đã giao'];

function OrderTimeline({ currentStatus }: { currentStatus: Order['status'] }) {
  const currentIdx = statusFlow.indexOf(currentStatus);
  const isCancelled = currentStatus === 'Đã huỷ' || currentStatus === 'Hoàn trả';

  if (isCancelled) {
    return (
      <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive">
        <Circle className="h-5 w-5" />
        <span>Đơn hàng đã bị {currentStatus.toLowerCase()}</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-0 sm:gap-0 w-full">
      {statusFlow.map((status, idx) => {
        const isPast = idx <= currentIdx;
        const isCurrent = idx === currentIdx;
        return (
          <div key={status} className="flex items-center flex-1 min-w-0 last:flex-none">
            <div className="flex flex-col items-center gap-1">
              {isPast ? (
                <CheckCircle2 className={`h-6 w-6 shrink-0 ${isCurrent ? 'text-primary' : 'text-green-500'}`} />
              ) : (
                <Circle className="h-6 w-6 shrink-0 text-muted-foreground/30" />
              )}
              <span className={`text-center whitespace-nowrap ${isCurrent ? 'text-primary font-medium' : isPast ? 'text-foreground' : 'text-muted-foreground'}`}>
                {status}
              </span>
            </div>
            {idx < statusFlow.length - 1 && (
              <div className={`hidden sm:block flex-1 h-0.5 mx-2 min-w-4 ${idx < currentIdx ? 'bg-green-500' : 'bg-muted'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export function SellerOrderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [grn, setGrn] = useState<GoodsReceivedNote | null>(null);
  const [internalNote, setInternalNote] = useState('');
  const [mobileTab, setMobileTab] = useState<'items' | 'shipping' | 'payment' | 'history'>('items');

  useEffect(() => {
    if (id) {
      Promise.all([
        orderApi.getById(id),
        grnApi.getByOrderId(id),
      ]).then(([o, g]) => {
        if (o) setOrder(o);
        setGrn(g);
        setLoading(false);
      });
    }
  }, [id]);

  const handleStatusChange = async (status: Order['status']) => {
    if (!order) return;
    setUpdating(true);
    try {
      const updated = await orderApi.updateStatus(order.id, status);
      setOrder(updated);
      toast.success(`Đã cập nhật trạng thái thành "${status}"`);
    } catch {
      toast.error('Không thể cập nhật trạng thái');
    } finally {
      setUpdating(false);
    }
  };

  const handleChat = async () => {
    if (!user || !order) return;
    const conv = await chatApi.createConversation(
      order.buyerId, order.buyerName,
      user.id, user.fullName,
    );
    navigate(`/seller/chat?conv=${conv.id}`);
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <AppBreadcrumb items={[
          { label: 'Kênh người bán', href: '/seller' },
          { label: 'Đơn hàng', href: '/seller/orders' },
          { label: 'Chi tiết' },
        ]} />
        <DetailSkeleton />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">Không tìm thấy đơn hàng.</p>
        <Link to="/seller/orders" className="text-primary hover:underline mt-2 block">Quay lại danh sách</Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <AppBreadcrumb items={[
        { label: 'Kênh người bán', href: '/seller' },
        { label: 'Đơn hàng', href: '/seller/orders' },
        { label: order.orderNumber },
      ]} />

      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/seller/orders')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1>{order.orderNumber}</h1>
          <p className="text-muted-foreground">Ngày tạo: {order.createdAt}</p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      {/* P4.26: Action buttons area */}
      <div className="flex flex-wrap items-center gap-2">
        {order.status === 'Chờ xác nhận' && (
          <Button size="lg" onClick={() => handleStatusChange('Đã xác nhận')} disabled={updating}>
            <CheckCircle2 className="mr-2 h-5 w-5" /> Xác nhận đơn hàng
          </Button>
        )}
        {order.status === 'Đã xác nhận' && (
          <Button size="lg" onClick={() => handleStatusChange('Đang xử lý')} disabled={updating}>
            Bắt đầu xử lý
          </Button>
        )}
        <Button variant="outline" size="sm" onClick={() => window.print()}>
          <Printer className="mr-1 h-4 w-4" /> In
        </Button>
        <Button variant="outline" size="sm" onClick={handleChat}>
          <MessageSquare className="mr-1 h-4 w-4" /> Chat
        </Button>
        <Button variant="outline" size="sm" onClick={() => toast.info('Chức năng chỉnh sửa đơn hàng')}>
          <Edit className="mr-1 h-4 w-4" /> Sửa
        </Button>
        {updating && (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        )}
      </div>

      {/* P4.29: Timeline trạng thái enhanced */}
      <Card>
        <CardHeader><CardTitle>Tiến trình đơn hàng</CardTitle></CardHeader>
        <CardContent>
          <OrderTimeline currentStatus={order.status} />
          {/* Update labels */}
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge variant="outline" className="text-xs gap-1">
              <User className="h-3 w-3" /> Cập nhật bởi {user?.fullName ?? 'Hệ thống'}
            </Badge>
            <Badge variant="outline" className="text-xs">{order.createdAt}</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Cập nhật trạng thái */}
      <Card>
        <CardHeader><CardTitle>Cập nhật trạng thái</CardTitle></CardHeader>
        <CardContent className="flex items-center gap-4">
          <Select value={order.status} onValueChange={v => handleStatusChange(v as Order['status'])} disabled={updating}>
            <SelectTrigger className="max-w-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {allStatuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
          {updating && (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          )}
        </CardContent>
      </Card>

      {/* P4.25: Thông tin người mua — enhanced */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Thông tin người mua</CardTitle>
          <Button variant="outline" size="sm" onClick={handleChat}>
            <MessageSquare className="mr-1 h-4 w-4" /> Nhắn tin
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-4 mb-4">
            <div className="h-14 w-14 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <User className="h-7 w-7" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-lg">{order.buyerName}</p>
              <div className="flex flex-wrap gap-3 mt-1 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><Building2 className="h-3.5 w-3.5" /> Công ty ABC</span>
                <span className="flex items-center gap-1"><Mail className="h-3.5 w-3.5" /> {order.buyerEmail}</span>
                <span className="flex items-center gap-1"><ShoppingBag className="h-3.5 w-3.5" /> 12 đơn trước đó</span>
              </div>
            </div>
          </div>
          <Separator className="mb-4" />
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <p className="text-muted-foreground text-sm">Địa chỉ giao hàng</p>
              <p>{order.shippingAddress}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Phương thức thanh toán</p>
              <p>{order.paymentMethod}</p>
            </div>
            {order.notes && (
              <div className="sm:col-span-2">
                <p className="text-muted-foreground text-sm">Ghi chú từ người mua</p>
                <p>{order.notes}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Sản phẩm */}
      <Card>
        <CardHeader><CardTitle>Sản phẩm ({order.items.length})</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {order.items.map(item => (
            <div key={item.id} className="flex gap-4">
              <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0">
                <ImageWithFallback src={item.productImage} alt={item.productName} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{item.productName}</p>
                {item.variantName && <p className="text-muted-foreground">Phân loại: {item.variantName}</p>}
                <p className="text-muted-foreground">{formatPrice(item.unitPrice)} × {item.quantity}</p>
              </div>
              <p className="font-medium shrink-0">{formatPrice(item.totalPrice)}</p>
            </div>
          ))}
          <Separator />
          <div className="space-y-2">
            <div className="flex justify-between"><span className="text-muted-foreground">Tạm tính</span><span>{formatPrice(order.subtotal)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Vận chuyển</span><span>{formatPrice(order.shippingFee)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Thuế</span><span>{formatPrice(order.tax)}</span></div>
            <Separator />
            <div className="flex justify-between text-lg"><span className="font-medium">Tổng cộng</span><span className="text-primary">{formatPrice(order.totalAmount)}</span></div>
          </div>
        </CardContent>
      </Card>

      {/* P4.28: Ghi chú nội bộ */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Ghi chú nội bộ
            <Badge variant="outline" className="text-xs gap-1">
              <Lock className="h-3 w-3" /> Chỉ nhìn thấy nội bộ
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            value={internalNote}
            onChange={e => setInternalNote(e.target.value)}
            rows={3}
            placeholder="Thêm ghi chú nội bộ cho đơn hàng này..."
          />
          <div className="flex justify-end">
            <Button size="sm" onClick={() => { toast.success('Đã lưu ghi chú nội bộ'); }}>
              Lưu ghi chú
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* GRN — Nhận hàng & QC (Nhóm 31C) */}
      {grn && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5" />
              Biên bản nhận hàng — {grn.grnNumber}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-3 gap-3 text-sm">
              <div>
                <span className="text-muted-foreground">Trạng thái:</span>
                <div className="mt-0.5"><StatusBadge status={grn.status} /></div>
              </div>
              <div>
                <span className="text-muted-foreground">Ngày nhận:</span>
                <p className="font-medium">{new Date(grn.receivedAt).toLocaleDateString('vi-VN')}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Chất lượng:</span>
                <div className="flex items-center gap-1 mt-0.5">
                  {[1, 2, 3, 4, 5].map(i => (
                    <Star key={i} className={`h-4 w-4 ${i <= grn.qualityScore ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                  ))}
                  <span className="ml-1 font-medium">{grn.qualityScore}/5</span>
                </div>
              </div>
            </div>

            {grn.status === 'Có vấn đề' && (
              <div className="p-3 bg-red-50 rounded-lg flex items-start gap-2 text-sm">
                <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
                <div>
                  <p className="font-medium text-red-700">Người mua báo cáo vấn đề</p>
                  <p className="text-red-600">{grn.overallNote}</p>
                  {grn.linkedReturnId && (
                    <p className="text-red-500 mt-1">Yêu cầu trả hàng: {grn.linkedReturnId}</p>
                  )}
                </div>
              </div>
            )}

            {grn.overallNote && grn.status !== 'Có vấn đề' && (
              <div className="text-sm">
                <span className="text-muted-foreground">Ghi chú:</span>
                <p>{grn.overallNote}</p>
              </div>
            )}

            {/* Chi tiết từng SP */}
            <div className="space-y-2">
              {grn.items.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 bg-muted/30 rounded text-sm">
                  <span className="flex-1 font-medium">{item.productName}</span>
                  <div className="flex items-center gap-4 text-xs">
                    <span>Đặt: {item.orderedQty}</span>
                    <span>Nhận: {item.receivedQty}</span>
                    <span className="text-green-600">OK: {item.acceptedQty}</span>
                    {item.defectQty > 0 && (
                      <span className="text-red-600">Lỗi: {item.defectQty} ({item.defectReason})</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
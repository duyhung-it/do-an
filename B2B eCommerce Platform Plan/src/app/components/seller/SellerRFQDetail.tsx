// ============================================================
// Chi tiết YCBG + Gửi báo giá — Seller
// ============================================================

import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router';
import {
  ArrowLeft, Building2, FileText, CalendarDays, Clock, Truck, Send,
  AlertTriangle, MessageSquare, BarChart3,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Separator } from '../ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { StatusBadge } from '../shared/StatusBadge';
import { AppBreadcrumb } from '../shared/AppBreadcrumb';
import { DetailSkeleton } from '../shared/PageSkeleton';
import { rfqApi, quotationApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import type { RFQ, Quotation, QuotationItem } from '../../types';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '../ui/alert';

const formatPrice = (price: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

const paymentOptions = ['Chuyển khoản trước 100%', 'Chuyển khoản trước 50%', 'Trả chậm 30 ngày', 'Trả chậm 60 ngày', 'L/C 60 ngày', 'COD'];

interface QuoteFormItem {
  productName: string;
  quantity: number;
  unitPrice: string;
  notes: string;
}

export function SellerRFQDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [rfq, setRfq] = useState<RFQ | null>(null);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showQuoteForm, setShowQuoteForm] = useState(false);
  const [saving, setSaving] = useState(false);

  // Quote form state
  const [quoteItems, setQuoteItems] = useState<QuoteFormItem[]>([]);
  const [validUntil, setValidUntil] = useState('');
  const [deliveryDays, setDeliveryDays] = useState('7');
  const [paymentTerms, setPaymentTerms] = useState(paymentOptions[0]);
  const [quoteNotes, setQuoteNotes] = useState('');

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([
      rfqApi.getById(id),
      quotationApi.getByRFQ(id),
    ]).then(([rfqData, quots]) => {
      setRfq(rfqData ?? null);
      setQuotations(quots);
      // Chuẩn bị form items từ RFQ items
      if (rfqData) {
        setQuoteItems(rfqData.items.map(item => ({
          productName: item.productName,
          quantity: item.quantity,
          unitPrice: item.targetPrice ? String(item.targetPrice) : '',
          notes: '',
        })));
      }
    }).finally(() => setLoading(false));
  }, [id]);

  const quoteTotal = useMemo(() =>
    quoteItems.reduce((sum, item) => {
      const price = Number(item.unitPrice) || 0;
      return sum + price * item.quantity;
    }, 0),
  [quoteItems]);

  const handleUpdateQuoteItem = (index: number, field: keyof QuoteFormItem, value: string | number) => {
    setQuoteItems(prev => prev.map((item, i) => i === index ? { ...item, [field]: value } : item));
  };

  const handleSubmitQuote = async () => {
    if (!rfq || !user) return;

    // Validate
    const validItems = quoteItems.filter(i => Number(i.unitPrice) > 0);
    if (validItems.length === 0) {
      toast.error('Vui lòng nhập giá cho ít nhất 1 sản phẩm');
      return;
    }
    if (!validUntil) {
      toast.error('Vui lòng chọn ngày hiệu lực');
      return;
    }

    setSaving(true);
    try {
      const items: QuotationItem[] = validItems.map(item => ({
        productName: item.productName,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
        totalPrice: Number(item.unitPrice) * item.quantity,
        notes: item.notes || undefined,
      }));

      await quotationApi.create({
        rfqId: rfq.id,
        supplierId: user.supplierId ?? '',
        supplierName: user.companyName ?? user.fullName,
        items,
        totalAmount: items.reduce((s, i) => s + i.totalPrice, 0),
        validUntil,
        paymentTerms,
        deliveryDays: Number(deliveryDays),
        notes: quoteNotes,
      });

      toast.success('Đã gửi báo giá thành công');
      setShowQuoteForm(false);

      // Reload
      const [rfqData, quots] = await Promise.all([
        rfqApi.getById(rfq.id),
        quotationApi.getByRFQ(rfq.id),
      ]);
      setRfq(rfqData ?? null);
      setQuotations(quots);
    } catch {
      toast.error('Có lỗi xảy ra');
    } finally {
      setSaving(false);
    }
  };

  const handleMarkInProgress = async () => {
    if (!rfq) return;
    try {
      await rfqApi.updateStatus(rfq.id, 'Đang báo giá');
      setRfq(prev => prev ? { ...prev, status: 'Đang báo giá' } : null);
      toast.success('Đã cập nhật trạng thái');
    } catch {
      toast.error('Có lỗi xảy ra');
    }
  };

  if (loading) return <DetailSkeleton />;
  if (!rfq) return (
    <div className="text-center py-12">
      <p className="text-muted-foreground">Không tìm thấy yêu cầu báo giá</p>
      <Button variant="outline" className="mt-4" onClick={() => navigate('/seller/rfq')}>Quay lại</Button>
    </div>
  );

  const canQuote = rfq.status === 'Đã gửi' || rfq.status === 'Đang báo giá';
  const myQuotations = quotations.filter(q => q.supplierId === user?.supplierId);
  const isExpiring = canQuote && new Date(rfq.expiresAt) <= new Date(Date.now() + 3 * 86400000);
  const isExpired = new Date(rfq.expiresAt) < new Date();

  return (
    <div className="space-y-6">
      <AppBreadcrumb items={[
        { label: 'Kênh người bán', href: '/seller' },
        { label: 'Yêu cầu báo giá', href: '/seller/rfq' },
        { label: rfq.rfqNumber },
      ]} />

      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/seller/rfq')}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Quay lại
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1>{rfq.rfqNumber}</h1>
            <StatusBadge status={rfq.status} />
          </div>
          <p className="text-muted-foreground">Từ {rfq.buyerCompany} · {rfq.createdAt}</p>
        </div>
        <div className="flex gap-2">
          {rfq.status === 'Đã gửi' && (
            <Button variant="outline" onClick={handleMarkInProgress}>
              <Clock className="h-4 w-4 mr-1" /> Đang xem xét
            </Button>
          )}
          {canQuote && !showQuoteForm && (
            <Button onClick={() => setShowQuoteForm(true)}>
              <Send className="h-4 w-4 mr-1" /> Gửi báo giá
            </Button>
          )}
        </div>
      </div>

      {/* Expiry warnings */}
      {isExpired && canQuote && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>RFQ đã hết hạn! Không thể gửi báo giá.</AlertDescription>
        </Alert>
      )}
      {isExpiring && !isExpired && (
        <Alert>
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          <AlertDescription>RFQ sắp hết hạn ({rfq.expiresAt}). Hãy phản hồi sớm!</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Buyer info */}
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Building2 className="h-5 w-5" /> Thông tin người mua</CardTitle></CardHeader>
            <CardContent className="space-y-1">
              <p className="font-medium">{rfq.buyerCompany}</p>
              <p className="text-muted-foreground">Người liên hệ: {rfq.buyerName}</p>
            </CardContent>
          </Card>

          {/* Requested products */}
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" /> Sản phẩm yêu cầu ({rfq.items.length})</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>#</TableHead>
                      <TableHead>Sản phẩm</TableHead>
                      <TableHead className="text-right">Số lượng</TableHead>
                      <TableHead>Đơn vị</TableHead>
                      <TableHead className="text-right">Giá mục tiêu</TableHead>
                      <TableHead>Quy cách</TableHead>
                      <TableHead>Ghi chú</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rfq.items.map((item, idx) => (
                      <TableRow key={item.id ?? idx}>
                        <TableCell>{idx + 1}</TableCell>
                        <TableCell className="font-medium">{item.productName}</TableCell>
                        <TableCell className="text-right">{item.quantity.toLocaleString()}</TableCell>
                        <TableCell>{item.unit}</TableCell>
                        <TableCell className="text-right">
                          {item.targetPrice ? formatPrice(item.targetPrice) : '—'}
                        </TableCell>
                        <TableCell>{item.specifications ?? '—'}</TableCell>
                        <TableCell>{item.notes ?? '—'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Quote form */}
          {showQuoteForm && canQuote && (
            <Card className="border-primary">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <Send className="h-5 w-5" /> Tạo báo giá
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Sản phẩm</TableHead>
                        <TableHead className="text-right">SL</TableHead>
                        <TableHead className="text-right">Giá mục tiêu</TableHead>
                        <TableHead className="text-right">Đơn giá (VNĐ)</TableHead>
                        <TableHead className="text-right">Chênh lệch</TableHead>
                        <TableHead className="text-right">Thành tiền</TableHead>
                        <TableHead>Ghi chú</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {quoteItems.map((item, idx) => {
                        const total = (Number(item.unitPrice) || 0) * item.quantity;
                        const rfqItem = rfq?.items[idx];
                        const targetPrice = rfqItem?.targetPrice ?? 0;
                        const quotePrice = Number(item.unitPrice) || 0;
                        const diff = targetPrice > 0 && quotePrice > 0 ? ((quotePrice - targetPrice) / targetPrice) * 100 : 0;
                        return (
                          <TableRow key={idx}>
                            <TableCell>{item.productName}</TableCell>
                            <TableCell className="text-right">{item.quantity.toLocaleString()}</TableCell>
                            <TableCell className="text-right text-muted-foreground">
                              {targetPrice > 0 ? formatPrice(targetPrice) : '—'}
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                min={0}
                                className="w-36 ml-auto text-right"
                                value={item.unitPrice}
                                onChange={e => handleUpdateQuoteItem(idx, 'unitPrice', e.target.value)}
                                placeholder="Nhập giá"
                              />
                            </TableCell>
                            <TableCell className="text-right">
                              {diff !== 0 && (
                                <Badge variant={diff > 0 ? 'destructive' : 'default'} className={diff <= 0 ? 'bg-green-100 text-green-700' : ''}>
                                  {diff > 0 ? '+' : ''}{diff.toFixed(1)}%
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              {total > 0 ? formatPrice(total) : '—'}
                            </TableCell>
                            <TableCell>
                              <Input
                                className="w-40"
                                value={item.notes}
                                onChange={e => handleUpdateQuoteItem(idx, 'notes', e.target.value)}
                                placeholder="Ghi chú"
                              />
                            </TableCell>
                          </TableRow>
                        );
                      })}
                      <TableRow>
                        <TableCell colSpan={3} className="text-right font-medium">Tổng cộng</TableCell>
                        <TableCell className="text-right font-medium text-primary">
                          {quoteTotal > 0 ? formatPrice(quoteTotal) : '—'}
                        </TableCell>
                        <TableCell />
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>

                <Separator />

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label>Hiệu lực đến *</Label>
                    <Input type="date" value={validUntil} onChange={e => setValidUntil(e.target.value)} />
                  </div>
                  <div>
                    <Label>Thời gian giao (ngày)</Label>
                    <Input type="number" min={1} value={deliveryDays} onChange={e => setDeliveryDays(e.target.value)} />
                  </div>
                  <div>
                    <Label>Điều khoản thanh toán</Label>
                    <Select value={paymentTerms} onValueChange={setPaymentTerms}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {paymentOptions.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Ghi chú</Label>
                    <Textarea
                      value={quoteNotes}
                      onChange={e => setQuoteNotes(e.target.value)}
                      placeholder="Ghi chú thêm cho báo giá..."
                      rows={2}
                    />
                  </div>
                </div>

                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setShowQuoteForm(false)}>Huỷ</Button>
                  <Button onClick={handleSubmitQuote} disabled={saving}>
                    <Send className="h-4 w-4 mr-1" />
                    {saving ? 'Đang gửi...' : 'Gửi báo giá'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Previous quotations from this seller */}
          {myQuotations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Báo giá đã gửi ({myQuotations.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {myQuotations.map(q => (
                  <div key={q.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-muted-foreground">Gửi ngày {q.createdAt}</p>
                      <StatusBadge status={q.status} />
                    </div>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Sản phẩm</TableHead>
                            <TableHead className="text-right">SL</TableHead>
                            <TableHead className="text-right">Đơn giá</TableHead>
                            <TableHead className="text-right">Thành tiền</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {q.items.map((item, idx) => (
                            <TableRow key={item.id ?? idx}>
                              <TableCell>{item.productName}</TableCell>
                              <TableCell className="text-right">{item.quantity.toLocaleString()}</TableCell>
                              <TableCell className="text-right">{formatPrice(item.unitPrice)}</TableCell>
                              <TableCell className="text-right">{formatPrice(item.totalPrice)}</TableCell>
                            </TableRow>
                          ))}
                          <TableRow>
                            <TableCell colSpan={3} className="text-right font-medium">Tổng</TableCell>
                            <TableCell className="text-right font-medium">{formatPrice(q.totalAmount)}</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                    {q.notes && <p className="text-muted-foreground bg-muted p-3 rounded">{q.notes}</p>}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Thông tin giao hàng</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <InfoRow icon={CalendarDays} label="Ngày giao" value={rfq.deliveryDate} />
              <InfoRow icon={Clock} label="Hết hạn" value={rfq.expiresAt} />
              <Separator />
              <InfoRow icon={Truck} label="Giao hàng" value={rfq.shippingTerms} />
              <InfoRow icon={FileText} label="Thanh toán" value={rfq.paymentTerms} />
              {rfq.notes && (
                <>
                  <Separator />
                  <div>
                    <p className="text-muted-foreground mb-1">Ghi chú:</p>
                    <p>{rfq.notes}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Quick stats */}
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5" /> Thống kê</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Báo giá đã gửi</span>
                <Badge variant="secondary">{myQuotations.length}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tổng BG (tất cả NCC)</span>
                <Badge variant="secondary">{quotations.length}</Badge>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tỷ lệ chấp nhận</span>
                <Badge variant="outline">75%</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">TG trả lời TB</span>
                <Badge variant="outline">1.5 ngày</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Chat link */}
          <Button variant="outline" className="w-full" onClick={() => navigate('/seller/chat')}>
            <MessageSquare className="mr-1 h-4 w-4" /> Nhắn tin với Buyer
          </Button>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
      <span className="text-muted-foreground">{label}:</span>
      <span className="ml-auto text-right">{value}</span>
    </div>
  );
}
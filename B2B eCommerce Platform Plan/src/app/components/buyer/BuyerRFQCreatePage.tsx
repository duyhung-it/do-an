// ============================================================
// Tạo yêu cầu báo giá mới — Buyer
// ============================================================

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Plus, Trash2, AlertCircle, Send, Save } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Separator } from '../ui/separator';
import { Badge } from '../ui/badge';
import { Switch } from '../ui/switch';
import { AppBreadcrumb } from '../shared/AppBreadcrumb';
import { rfqApi, supplierApi, productApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import type { Supplier, Product, RFQItem } from '../../types';
import { toast } from 'sonner';

const paymentOptions = ['Chuyển khoản trước 100%', 'Chuyển khoản trước 50%', 'Trả chậm 30 ngày', 'Trả chậm 60 ngày', 'L/C 60 ngày', 'COD'];
const shippingOptions = ['Giao tại kho người mua', 'FOB Hồ Chí Minh', 'FOB Hà Nội', 'CIF Hải Phòng', 'Giao tại nhà máy', 'Tự vận chuyển'];
const units = ['Cái', 'Cuộn', 'Tấn', 'Thùng', 'Kg', 'Bao', 'Lít', 'Mét', 'Bộ'];

interface FormItem extends Omit<RFQItem, 'targetPrice'> {
  targetPrice: string;
}

interface FormErrors {
  supplierId?: string;
  deliveryDate?: string;
  expiresAt?: string;
  items?: string;
}

function FieldError({ error }: { error?: string }) {
  if (!error) return null;
  return (
    <p className="text-destructive flex items-center gap-1 mt-1">
      <AlertCircle className="h-3 w-3 shrink-0" />
      {error}
    </p>
  );
}

const emptyItem: FormItem = {
  productId: '', productName: '', quantity: 1, unit: 'Cái', targetPrice: '', specifications: '', notes: '',
};

export function BuyerRFQCreatePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [saving, setSaving] = useState(false);

  // Form state
  const [supplierId, setSupplierId] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [paymentTerms, setPaymentTerms] = useState(paymentOptions[0]);
  const [shippingTerms, setShippingTerms] = useState(shippingOptions[0]);
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<FormItem[]>([{ ...emptyItem }]);
  const [errors, setErrors] = useState<FormErrors>({});
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [attachments, setAttachments] = useState<string[]>([]);
  const [isPublic, setIsPublic] = useState(false);
  const [multiSupplierIds, setMultiSupplierIds] = useState<string[]>([]);

  useEffect(() => {
    supplierApi.getPaginated({ page: 1, pageSize: 100 }).then(res => setSuppliers(res.data));
  }, []);

  // Load products when supplier changes
  useEffect(() => {
    if (supplierId) {
      productApi.getBySupplier(supplierId).then(prods =>
        setProducts(prods.filter(p => p.status === 'Đã duyệt')),
      );
    } else {
      // Load all approved products
      productApi.getPaginated({ page: 1, pageSize: 200 }).then(res =>
        setProducts(res.data.filter(p => p.status === 'Đã duyệt')),
      );
    }
  }, [supplierId]);

  const selectedSupplier = suppliers.find(s => s.id === supplierId);

  const updateItem = (index: number, field: keyof FormItem, value: string | number) => {
    setItems(prev => prev.map((item, i) => i === index ? { ...item, [field]: value } : item));
  };

  const selectProduct = (index: number, productId: string) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      setItems(prev => prev.map((item, i) =>
        i === index
          ? { ...item, productId: product.id, productName: product.name, unit: product.unit }
          : item,
      ));
    }
  };

  const removeItem = (index: number) => {
    if (items.length <= 1) return;
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const addItem = () => {
    setItems(prev => [...prev, { ...emptyItem }]);
  };

  const validate = (): boolean => {
    const errs: FormErrors = {};
    if (!deliveryDate) errs.deliveryDate = 'Vui lòng chọn ngày giao dự kiến';
    else if (new Date(deliveryDate) <= new Date()) errs.deliveryDate = 'Ngày giao phải sau hôm nay';

    if (!expiresAt) errs.expiresAt = 'Vui lòng chọn ngày hết hạn';
    else if (new Date(expiresAt) <= new Date()) errs.expiresAt = 'Ngày hết hạn phải sau hôm nay';

    const validItems = items.filter(i => i.productName.trim() && i.quantity > 0);
    if (validItems.length === 0) errs.items = 'Cần ít nhất 1 sản phẩm với số lượng > 0';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (asDraft: boolean) => {
    if (!asDraft && !validate()) return;
    if (!user) return;

    setSaving(true);
    try {
      const validItems: RFQItem[] = items
        .filter(i => i.productName.trim())
        .map(i => ({
          productId: i.productId,
          productName: i.productName,
          quantity: Number(i.quantity),
          unit: i.unit,
          targetPrice: i.targetPrice ? Number(i.targetPrice) : undefined,
          specifications: i.specifications || undefined,
          notes: i.notes || undefined,
        }));

      await rfqApi.create({
        buyerId: user.id,
        buyerName: user.fullName,
        buyerCompany: user.companyName ?? '',
        supplierId: supplierId || undefined,
        supplierName: selectedSupplier?.companyName,
        items: validItems,
        status: asDraft ? 'Bản nháp' : 'Đã gửi',
        deliveryDate,
        expiresAt,
        paymentTerms,
        shippingTerms,
        notes,
        attachments,
      });

      toast.success(asDraft ? 'Đã lưu bản nháp' : 'Đã gửi yêu cầu báo giá');
      navigate('/rfq');
    } catch {
      toast.error('Có lỗi xảy ra, vui lòng thử lại');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <AppBreadcrumb items={[
        { label: 'Trang chủ', href: '/' },
        { label: 'Yêu cầu báo giá', href: '/rfq' },
        { label: 'Tạo mới' },
      ]} />

      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/rfq')}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Quay lại
        </Button>
        <div>
          <h1>Tạo yêu cầu báo giá mới</h1>
          <p className="text-muted-foreground">Gửi yêu cầu báo giá đến nhà cung cấp</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Supplier selection */}
          <Card>
            <CardHeader><CardTitle>Nhà cung cấp</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Chọn nhà cung cấp (tuỳ chọn)</Label>
                <Select value={supplierId} onValueChange={setSupplierId}>
                  <SelectTrigger><SelectValue placeholder="-- Chọn NCC hoặc để trống --" /></SelectTrigger>
                  <SelectContent>
                    {suppliers.map(s => (
                      <SelectItem key={s.id} value={s.id}>{s.companyName} — {s.city}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {supplierId && (
                  <Button variant="link" size="sm" className="mt-1 p-0 h-auto" onClick={() => setSupplierId('')}>
                    Bỏ chọn NCC
                  </Button>
                )}
                <FieldError error={errors.supplierId} />
              </div>

              <Separator />

              {/* Public/Private */}
              <div className="flex items-center justify-between">
                <div>
                  <Label>RFQ công khai</Label>
                  <p className="text-muted-foreground text-xs">NCC có thể tự tìm thấy và báo giá</p>
                </div>
                <Switch checked={isPublic} onCheckedChange={setIsPublic} />
              </div>
              {isPublic && <Badge variant="secondary">Công khai — NCC tự liên hệ</Badge>}

              {/* Multi-supplier select */}
              {!isPublic && !supplierId && (
                <div>
                  <Label>Gửi đến nhiều NCC</Label>
                  <div className="space-y-1 mt-1 max-h-40 overflow-y-auto border rounded-lg p-2">
                    {suppliers.slice(0, 20).map(s => (
                      <label key={s.id} className="flex items-center gap-2 cursor-pointer py-1">
                        <input type="checkbox" className="accent-primary"
                          checked={multiSupplierIds.includes(s.id)}
                          onChange={e => {
                            if (e.target.checked) setMultiSupplierIds(p => [...p, s.id]);
                            else setMultiSupplierIds(p => p.filter(id => id !== s.id));
                          }} />
                        <span className="truncate">{s.companyName}</span>
                      </label>
                    ))}
                  </div>
                  {multiSupplierIds.length > 0 && (
                    <p className="text-muted-foreground text-xs mt-1">Đã chọn {multiSupplierIds.length} NCC</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Product items */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Danh sách sản phẩm</CardTitle>
                <Button variant="outline" size="sm" onClick={addItem}>
                  <Plus className="h-4 w-4 mr-1" /> Thêm dòng
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.map((item, idx) => (
                <div key={idx} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Sản phẩm #{idx + 1}</span>
                    {items.length > 1 && (
                      <Button variant="ghost" size="sm" onClick={() => removeItem(idx)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <Label>Sản phẩm</Label>
                      <Select value={item.productId} onValueChange={v => selectProduct(idx, v)}>
                        <SelectTrigger><SelectValue placeholder="Chọn sản phẩm" /></SelectTrigger>
                        <SelectContent>
                          {products.map(p => (
                            <SelectItem key={p.id} value={p.id}>{p.name} — {p.supplierName}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {!item.productId && (
                        <div className="mt-2">
                          <Label>Hoặc nhập tên sản phẩm</Label>
                          <Input
                            value={item.productName}
                            onChange={e => updateItem(idx, 'productName', e.target.value)}
                            placeholder="Nhập tên sản phẩm cần báo giá"
                          />
                        </div>
                      )}
                    </div>
                    <div>
                      <Label>Số lượng</Label>
                      <Input
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={e => updateItem(idx, 'quantity', Number(e.target.value))}
                      />
                    </div>
                    <div>
                      <Label>Đơn vị</Label>
                      <Select value={item.unit} onValueChange={v => updateItem(idx, 'unit', v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {units.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Giá mục tiêu (VNĐ)</Label>
                      <Input
                        type="number"
                        min={0}
                        value={item.targetPrice}
                        onChange={e => updateItem(idx, 'targetPrice', e.target.value)}
                        placeholder="Tuỳ chọn"
                      />
                    </div>
                    <div>
                      <Label>Quy cách</Label>
                      <Input
                        value={item.specifications ?? ''}
                        onChange={e => updateItem(idx, 'specifications', e.target.value)}
                        placeholder="VD: Bản chính hãng"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Ghi chú sản phẩm</Label>
                    <Input
                      value={item.notes ?? ''}
                      onChange={e => updateItem(idx, 'notes', e.target.value)}
                      placeholder="Ghi chú thêm..."
                    />
                  </div>
                </div>
              ))}
              <FieldError error={errors.items} />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Thông tin giao hàng</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Ngày giao dự kiến *</Label>
                <Input
                  type="date"
                  value={deliveryDate}
                  onChange={e => setDeliveryDate(e.target.value)}
                />
                <FieldError error={errors.deliveryDate} />
              </div>
              <div>
                <Label>Hạn báo giá *</Label>
                <Input
                  type="date"
                  value={expiresAt}
                  onChange={e => setExpiresAt(e.target.value)}
                />
                <FieldError error={errors.expiresAt} />
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
                <Label>Điều khoản giao hàng</Label>
                <Select value={shippingTerms} onValueChange={setShippingTerms}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {shippingOptions.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Ghi chú chung</Label>
                <Textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Yêu cầu đặc biệt..."
                  rows={3}
                />
              </div>

              <Separator />

              {/* Đính kèm */}
              <div>
                <Label>File đính kèm (URL)</Label>
                <div className="flex gap-2">
                  <Input value={attachmentUrl} onChange={e => setAttachmentUrl(e.target.value)} placeholder="https://..." className="flex-1" />
                  <Button variant="outline" size="sm" onClick={() => {
                    if (attachmentUrl.trim()) {
                      setAttachments(p => [...p, attachmentUrl.trim()]);
                      setAttachmentUrl('');
                    }
                  }}>Thêm</Button>
                </div>
                {attachments.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {attachments.map((url, i) => (
                      <Badge key={i} variant="outline" className="gap-1 max-w-full">
                        <span className="truncate max-w-[150px]">{url.split('/').pop()}</span>
                        <button className="text-destructive hover:text-destructive/80" onClick={() => setAttachments(p => p.filter((_, j) => j !== i))}>×</button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 space-y-3">
              <Button
                className="w-full"
                disabled={saving}
                onClick={() => handleSubmit(false)}
              >
                <Send className="h-4 w-4 mr-2" />
                {saving ? 'Đang gửi...' : 'Gửi yêu cầu báo giá'}
              </Button>
              <Button
                variant="outline"
                className="w-full"
                disabled={saving}
                onClick={() => handleSubmit(true)}
              >
                <Save className="h-4 w-4 mr-2" />
                Lưu bản nháp
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
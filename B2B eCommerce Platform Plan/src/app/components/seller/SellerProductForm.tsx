// ============================================================
// Form tạo/sửa sản phẩm — Form validation nâng cao
// ============================================================

import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, Plus, Trash2, AlertCircle, Upload, Image as ImageIcon, Check, ChevronRight, Eye } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { CategoryCombobox } from '../shared/CategoryCombobox';
import { AppBreadcrumb } from '../shared/AppBreadcrumb';
import { productApi, supplierApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import type { Product, ProductVariant } from '../../types';
import { toast } from 'sonner';
import { IMG } from '../../data/mockData';

const units = ['Cái', 'Cuộn', 'Tấn', 'Thùng', 'Kg', 'Bao', 'Lít', 'Mét', 'Bộ'];

// P4.15: Step wizard config
const STEPS = [
  { id: 1, label: 'Thông tin', icon: '1' },
  { id: 2, label: 'Giá & Kho', icon: '2' },
  { id: 3, label: 'Hình ảnh', icon: '3' },
  { id: 4, label: 'Xem lại', icon: '4' },
];

// P4.16: Mock image data
const MOCK_IMAGES = [
  'https://images.unsplash.com/photo-1518770660439-4636190af475?w=200',
  'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=200',
];

interface FormData {
  name: string;
  description: string;
  shortDescription: string;
  categoryId: string;
  categoryName: string;
  price: number;
  minOrderQty: number;
  unit: string;
  status: Product['status'];
  variants: Omit<ProductVariant, 'id'>[];
  tags: string;
  specifications: Record<string, string>;
  // DB-B.10: Trường mới
  brandName: string;
  origin: string;
  warrantyMonths: number;
}

type FormErrors = Partial<Record<keyof FormData | 'variants', string>>;

const defaultForm: FormData = {
  name: '', description: '', shortDescription: '',
  categoryId: '', categoryName: '',
  price: 0, minOrderQty: 1, unit: 'Cái', status: 'Chờ duyệt',
  variants: [{ name: 'Tiêu chuẩn', sku: '', price: 0, stock: 0 }],
  tags: '', specifications: { 'Xuất xứ': '', 'Bảo hành': '' },
  brandName: '', origin: 'Việt Nam', warrantyMonths: 12,
};

function FieldError({ error }: { error?: string }) {
  if (!error) return null;
  return (
    <p className="text-destructive flex items-center gap-1 mt-1">
      <AlertCircle className="h-3 w-3 shrink-0" />
      {error}
    </p>
  );
}

export function SellerProductForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isNew = !id;
  const [form, setForm] = useState<FormData>(defaultForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [supplierName, setSupplierName] = useState('');
  const [activeStep, setActiveStep] = useState(1);
  const [uploadedImages, setUploadedImages] = useState<string[]>(MOCK_IMAGES);
  const [showPreview, setShowPreview] = useState(false);

  // Lấy thông tin NCC từ supplierId
  useEffect(() => {
    if (user?.supplierId) {
      supplierApi.getById(user.supplierId).then(s => {
        if (s) setSupplierName(s.companyName);
      });
    }
  }, [user?.supplierId]);

  useEffect(() => {
    if (!isNew && id) {
      productApi.getById(id).then(p => {
        if (p) {
          setForm({
            name: p.name,
            description: p.description,
            shortDescription: p.shortDescription,
            categoryId: p.categoryId,
            categoryName: p.categoryName,
            price: p.price,
            minOrderQty: p.minOrderQty,
            unit: p.unit,
            status: p.status,
            variants: p.variants,
            tags: p.tags.join(', '),
            specifications: p.specifications,
            brandName: p.brandName || '',
            origin: p.origin || '',
            warrantyMonths: p.warrantyMonths || 0,
          });
        }
        setLoading(false);
      });
    }
  }, [id, isNew]);

  const clearError = (key: keyof FormErrors) => {
    setErrors(prev => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const updateField = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
    clearError(key);
  };

  const addVariant = () => {
    setForm(prev => ({
      ...prev,
      variants: [...prev.variants, { name: '', sku: '', price: 0, stock: 0 }],
    }));
    clearError('variants');
  };

  const updateVariant = (index: number, field: keyof Omit<ProductVariant, 'id'>, value: string | number) => {
    setForm(prev => ({
      ...prev,
      variants: prev.variants.map((v, i) => i === index ? { ...v, [field]: value } : v),
    }));
    clearError('variants');
  };

  const removeVariant = (index: number) => {
    if (form.variants.length <= 1) return;
    setForm(prev => ({ ...prev, variants: prev.variants.filter((_, i) => i !== index) }));
  };

  const updateSpec = (key: string, value: string) => {
    setForm(prev => ({ ...prev, specifications: { ...prev.specifications, [key]: value } }));
  };

  const addSpec = () => {
    setForm(prev => ({ ...prev, specifications: { ...prev.specifications, '': '' } }));
  };

  const validate = (): boolean => {
    const errs: FormErrors = {};

    if (!form.name.trim()) errs.name = 'Vui lòng nhập tên sản phẩm';
    else if (form.name.trim().length < 5) errs.name = 'Tên sản phẩm phải có ít nhất 5 ký tự';

    if (!form.categoryId) errs.categoryId = 'Vui lòng chọn danh mục';

    if (form.price <= 0) errs.price = 'Giá phải lớn hơn 0';
    if (form.minOrderQty < 1) errs.minOrderQty = 'Số lượng tối thiểu phải ≥ 1';

    if (!form.shortDescription.trim()) errs.shortDescription = 'Vui lòng nhập mô tả ngắn';
    if (!form.description.trim()) errs.description = 'Vui lòng nhập mô tả chi tiết';

    // Kiểm tra variants
    const hasInvalidVariant = form.variants.some(v => !v.name.trim() || v.price <= 0);
    if (hasInvalidVariant) errs.variants = 'Mỗi biến thể phải có tên và giá > 0';

    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      toast.error('Vui lòng kiểm tra lại thông tin');
    }
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setSaving(true);
    try {
      const productData = {
        name: form.name,
        slug: form.name.toLowerCase().replace(/\s+/g, '-'),
        description: form.description,
        shortDescription: form.shortDescription,
        categoryId: form.categoryId,
        categoryName: form.categoryName,
        supplierId: user?.supplierId ?? 'sup-01',
        supplierName: supplierName || user?.companyName || 'Nhà cung cấp',
        images: [IMG.warehouse],
        price: form.price,
        minOrderQty: form.minOrderQty,
        unit: form.unit,
        status: form.status,
        variants: form.variants.map((v, i) => ({ ...v, id: `var-new-${i}` })),
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
        specifications: form.specifications,
        brandName: form.brandName,
        origin: form.origin,
        warrantyMonths: form.warrantyMonths,
      };

      if (isNew) {
        await productApi.create(productData);
        toast.success('Đã tạo sản phẩm mới');
      } else if (id) {
        await productApi.update(id, productData);
        toast.success('Đã cập nhật sản phẩm');
      }
      navigate('/seller/products');
    } catch {
      toast.error('Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <AppBreadcrumb items={[
        { label: 'Kênh người bán', href: '/seller' },
        { label: 'Sản phẩm', href: '/seller/products' },
        { label: isNew ? 'Thêm mới' : 'Chỉnh sửa' },
      ]} />

      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/seller/products')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1>{isNew ? 'Thêm sản phẩm mới' : 'Chỉnh sửa sản phẩm'}</h1>
          <p className="text-muted-foreground">Điền thông tin sản phẩm bên dưới</p>
        </div>
      </div>

      {/* P4.15: Step Indicator */}
      <div className="flex items-center justify-between bg-muted/30 rounded-xl p-4 overflow-x-auto">
        {STEPS.map((step, idx) => (
          <div key={step.id} className="flex items-center">
            <button
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${
                activeStep === step.id
                  ? 'bg-primary text-primary-foreground'
                  : activeStep > step.id
                    ? 'bg-green-100 text-green-700'
                    : 'bg-muted text-muted-foreground'
              }`}
              onClick={() => setActiveStep(step.id)}
            >
              <span className="h-6 w-6 rounded-full border-2 flex items-center justify-center text-xs shrink-0">
                {activeStep > step.id ? <Check className="h-3.5 w-3.5" /> : step.icon}
              </span>
              <span className="hidden sm:inline text-sm whitespace-nowrap">{step.label}</span>
            </button>
            {idx < STEPS.length - 1 && (
              <ChevronRight className="h-4 w-4 text-muted-foreground mx-1 shrink-0" />
            )}
          </div>
        ))}
      </div>

      <div className="flex gap-6">
        {/* Main content */}
        <div className="flex-1 min-w-0 space-y-6">

      {/* Thông tin cơ bản */}
      <Card>
        <CardHeader><CardTitle>Thông tin cơ bản</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label>Tên sản phẩm *</Label>
            <Input
              value={form.name}
              onChange={e => updateField('name', e.target.value)}
              placeholder="Nhập tên sản phẩm..."
              className={errors.name ? 'border-destructive' : ''}
            />
            <FieldError error={errors.name} />
          </div>
          <div className="grid gap-2">
            <Label>Danh mục *</Label>
            <CategoryCombobox
              value={form.categoryId}
              onChange={(catId, name) => { updateField('categoryId', catId); updateField('categoryName', name); }}
              parentId={null}
            />
            <FieldError error={errors.categoryId} />
          </div>
          <div className="grid gap-2">
            <Label>Mô tả ngắn *</Label>
            <Input
              value={form.shortDescription}
              onChange={e => updateField('shortDescription', e.target.value)}
              placeholder="Mô tả ngắn gọn..."
              className={errors.shortDescription ? 'border-destructive' : ''}
            />
            <FieldError error={errors.shortDescription} />
          </div>
          <div className="grid gap-2">
            <Label>Mô tả chi tiết *</Label>
            <Textarea
              value={form.description}
              onChange={e => updateField('description', e.target.value)}
              rows={4}
              placeholder="Mô tả chi tiết sản phẩm..."
              className={errors.description ? 'border-destructive' : ''}
            />
            <FieldError error={errors.description} />
          </div>
          <div className="grid gap-2">
            <Label>Nhãn (tags, cách nhau bằng dấu phẩy)</Label>
            <Input value={form.tags} onChange={e => updateField('tags', e.target.value)} placeholder="VD: điện tử, linh kiện, bo mạch" />
          </div>

          {/* DB-B.10: Thêm brand, origin, warranty */}
          <Separator />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="grid gap-2">
              <Label>Thương hiệu</Label>
              <Input
                value={form.brandName}
                onChange={e => updateField('brandName', e.target.value)}
                placeholder="VD: VietTech"
              />
            </div>
            <div className="grid gap-2">
              <Label>Xuất xứ</Label>
              <Input
                value={form.origin}
                onChange={e => updateField('origin', e.target.value)}
                placeholder="VD: Việt Nam"
              />
            </div>
            <div className="grid gap-2">
              <Label>Bảo hành (tháng)</Label>
              <Input
                type="number"
                value={form.warrantyMonths}
                onChange={e => updateField('warrantyMonths', Number(e.target.value))}
                min={0}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Giá & kho */}
      <Card>
        <CardHeader><CardTitle>Giá & Kho hàng</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="grid gap-2">
              <Label>Giá (VNĐ) *</Label>
              <Input
                type="number"
                value={form.price || ''}
                onChange={e => updateField('price', Number(e.target.value))}
                className={errors.price ? 'border-destructive' : ''}
                min={0}
              />
              <FieldError error={errors.price} />
            </div>
            <div className="grid gap-2">
              <Label>Số lượng tối thiểu *</Label>
              <Input
                type="number"
                value={form.minOrderQty}
                onChange={e => updateField('minOrderQty', Number(e.target.value))}
                className={errors.minOrderQty ? 'border-destructive' : ''}
                min={1}
              />
              <FieldError error={errors.minOrderQty} />
            </div>
            <div className="grid gap-2">
              <Label>Đơn vị</Label>
              <Select value={form.unit} onValueChange={v => updateField('unit', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {units.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Biến thể */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Phân loại / Biến thể</CardTitle>
          <Button variant="outline" size="sm" onClick={addVariant}>
            <Plus className="mr-1 h-4 w-4" /> Thêm
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          <FieldError error={errors.variants} />
          {form.variants.map((variant, i) => (
            <div key={i} className="grid grid-cols-2 sm:grid-cols-5 gap-2 items-end">
              <div className="grid gap-1">
                <Label>Tên *</Label>
                <Input
                  value={variant.name}
                  onChange={e => updateVariant(i, 'name', e.target.value)}
                  className={!variant.name.trim() && errors.variants ? 'border-destructive' : ''}
                />
              </div>
              <div className="grid gap-1">
                <Label>SKU</Label>
                <Input value={variant.sku} onChange={e => updateVariant(i, 'sku', e.target.value)} />
              </div>
              <div className="grid gap-1">
                <Label>Giá *</Label>
                <Input
                  type="number"
                  value={variant.price || ''}
                  onChange={e => updateVariant(i, 'price', Number(e.target.value))}
                  className={variant.price <= 0 && errors.variants ? 'border-destructive' : ''}
                  min={0}
                />
              </div>
              <div className="grid gap-1">
                <Label>Tồn kho</Label>
                <Input type="number" value={variant.stock} onChange={e => updateVariant(i, 'stock', Number(e.target.value))} min={0} />
              </div>
              <Button variant="ghost" size="sm" onClick={() => removeVariant(i)} disabled={form.variants.length <= 1}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* P4.16: Hình ảnh */}
      <Card>
        <CardHeader><CardTitle>Hình ảnh sản phẩm</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {/* Drag-drop zone */}
          <div
            className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors"
            onClick={() => {
              toast.info('Chức năng upload hình ảnh (giả lập)');
              setUploadedImages(prev => [...prev, `https://picsum.photos/200?random=${Date.now()}`]);
            }}
          >
            <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-muted-foreground">Kéo thả hoặc nhấn để tải lên</p>
            <p className="text-xs text-muted-foreground mt-1">PNG, JPG, WEBP · Tối đa 5MB · Tối đa 10 ảnh</p>
          </div>
          {/* Preview thumbnails */}
          {uploadedImages.length > 0 && (
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {uploadedImages.map((img, i) => (
                <div key={i} className="relative group aspect-square rounded-lg overflow-hidden bg-muted">
                  <div className="h-full w-full flex items-center justify-center">
                    <ImageIcon className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <button
                    className="absolute top-1 right-1 h-5 w-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => setUploadedImages(prev => prev.filter((_, j) => j !== i))}
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                  {i === 0 && <Badge className="absolute bottom-1 left-1 text-[10px] px-1">Chính</Badge>}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Thông số kỹ thuật */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Thông số kỹ thuật</CardTitle>
          <Button variant="outline" size="sm" onClick={addSpec}>
            <Plus className="mr-1 h-4 w-4" /> Thêm
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {Object.entries(form.specifications).map(([key, value], i) => (
            <div key={i} className="grid grid-cols-2 gap-2">
              <Input value={key} onChange={e => {
                const specs = { ...form.specifications };
                const entries = Object.entries(specs);
                entries[i] = [e.target.value, value];
                updateField('specifications', Object.fromEntries(entries));
              }} placeholder="Tên thông số" />
              <Input value={value} onChange={e => updateSpec(key, e.target.value)} placeholder="Giá trị" />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-between gap-3 pb-8">
        <div className="flex gap-2">
          {activeStep > 1 && (
            <Button variant="outline" onClick={() => setActiveStep(s => s - 1)}>Quay lại</Button>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/seller/products')}>Huỷ</Button>
          {activeStep < 4 ? (
            <Button onClick={() => setActiveStep(s => s + 1)}>
              Tiếp theo <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={saving}>
              {saving ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  Đang lưu...
                </span>
              ) : (
                isNew ? 'Tạo sản phẩm' : 'Cập nhật'
              )}
            </Button>
          )}
        </div>
      </div>

        </div>

        {/* P4.18: Preview Panel (desktop only) */}
        <div className="hidden lg:block w-72 shrink-0">
          <div className="sticky top-20 space-y-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-1.5">
                  <Eye className="h-4 w-4" /> Xem trước
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                  <ImageIcon className="h-10 w-10 text-muted-foreground" />
                </div>
                <div>
                  <p className="line-clamp-2">{form.name || 'Tên sản phẩm'}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{form.categoryName || 'Danh mục'}</p>
                </div>
                <p className="text-primary text-lg">
                  {form.price > 0 ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(form.price) : '—'}
                </p>
                <p className="text-xs text-muted-foreground line-clamp-3">{form.shortDescription || 'Mô tả ngắn...'}</p>
                <Separator />
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">MOQ</span>
                    <span>{form.minOrderQty} {form.unit}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Biến thể</span>
                    <span>{form.variants.length}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Tags</span>
                    <span className="truncate ml-2">{form.tags || '—'}</span>
                  </div>
                  {form.brandName && (
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Thương hiệu</span>
                      <span>{form.brandName}</span>
                    </div>
                  )}
                  {form.origin && (
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Xuất xứ</span>
                      <span>{form.origin}</span>
                    </div>
                  )}
                  {form.warrantyMonths > 0 && (
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Bảo hành</span>
                      <span>{form.warrantyMonths} tháng</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
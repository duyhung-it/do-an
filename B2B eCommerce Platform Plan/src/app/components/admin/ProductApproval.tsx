import { useCallback, useEffect, useMemo, useState } from 'react';
import { Edit, Eye, PackagePlus, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { AppBreadcrumb } from '../shared/AppBreadcrumb';
import { CategoryCombobox } from '../shared/CategoryCombobox';
import { DataTable } from '../shared/DataTable';
import { FilterBar } from '../shared/FilterBar';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { ScrollArea } from '../ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Separator } from '../ui/separator';
import { Switch } from '../ui/switch';
import { Textarea } from '../ui/textarea';
import { adminProductApi } from '../../services/adminBackendApi';
import type { ActiveFilter, ColumnConfig, FilterConfig, PaginationParams, Product, SortParams } from '../../types';

type AdminProduct = Product & {
  stock?: number;
  imageCount?: number;
  variantCount?: number;
  primaryImage?: string;
};

type SpecFormRow = {
  id: string;
  key: string;
  value: string;
};

type ProductFormState = {
  id?: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  categoryId: string;
  categoryName: string;
  brand: string;
  price: string;
  originalPrice: string;
  status: string;
  condition: string;
  warranty: string;
  color: string;
  tags: string;
  specs: SpecFormRow[];
  isNew: boolean;
  isFeatured: boolean;
  isHot: boolean;
};

type VariantFormState = {
  id?: string;
  name: string;
  sku: string;
  price: string;
  originalPrice: string;
  stock: string;
  color: string;
  storage: string;
  ram: string;
  isActive: boolean;
};

type ImageFormState = {
  id?: string;
  url: string;
  variantId: string;
  altText: string;
  sortOrder: string;
  isPrimary: boolean;
};

const emptyForm: ProductFormState = {
  name: '',
  slug: '',
  description: '',
  shortDescription: '',
  categoryId: '',
  categoryName: '',
  brand: '',
  price: '',
  originalPrice: '',
  status: 'Đang bán',
  condition: 'Mới',
  warranty: '12',
  color: '',
  tags: '',
  specs: [],
  isNew: false,
  isFeatured: false,
  isHot: false,
};

const emptyVariantForm: VariantFormState = {
  name: '',
  sku: '',
  price: '',
  originalPrice: '',
  stock: '0',
  color: '',
  storage: '',
  ram: '',
  isActive: true,
};

const emptyImageForm: ImageFormState = {
  url: '',
  variantId: 'product',
  altText: '',
  sortOrder: '0',
  isPrimary: false,
};

const columns: ColumnConfig[] = [
  { key: 'name', label: 'Sản phẩm', visible: true, sortable: true },
  { key: 'categoryName', label: 'Danh mục', visible: true, sortable: true },
  { key: 'brand', label: 'Hãng', visible: true, sortable: true },
  { key: 'price', label: 'Giá', visible: true, sortable: true },
  { key: 'stock', label: 'Tồn kho', visible: true, sortable: false },
  { key: 'status', label: 'Trạng thái', visible: true, sortable: true },
  { key: 'updatedAt', label: 'Ngày cập nhật', visible: true, sortable: true },
];

const filterConfigs: FilterConfig[] = [
  {
    key: 'status',
    label: 'Trạng thái',
    type: 'select',
    options: [
      { label: 'Đang bán', value: 'Đang bán' },
      { label: 'Hết hàng', value: 'Hết hàng' },
      { label: 'Ngừng kinh doanh', value: 'Ngừng kinh doanh' },
      { label: 'Sắp ra mắt', value: 'Sắp ra mắt' },
    ],
  },
  {
    key: 'condition',
    label: 'Tình trạng',
    type: 'select',
    options: [
      { label: 'Mới', value: 'Mới' },
      { label: 'Like New', value: 'Like New' },
      { label: 'Qua sử dụng', value: 'Qua sử dụng' },
    ],
  },
];

const defaultBrandOptions = [
  'Apple',
  'Samsung',
  'Xiaomi',
  'OPPO',
  'Vivo',
  'Realme',
  'Nokia',
  'Sony',
  'ASUS',
  'Lenovo',
  'Anker',
  'Baseus',
  'JBL',
  'Marshall',
];

const defaultColorOptions = [
  'Đen',
  'Trắng',
  'Xám',
  'Bạc',
  'Vàng',
  'Xanh',
  'Xanh dương',
  'Xanh lá',
  'Đỏ',
  'Hồng',
  'Tím',
  'Titan tự nhiên',
  'Titan đen',
  'Titan trắng',
  'Titan xanh',
  'Graphite',
  'Midnight',
  'Starlight',
];

const formatPrice = (price: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price || 0);

const slugify = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const newSpecRow = (key = '', value = ''): SpecFormRow => ({
  id: `spec-${Date.now()}-${Math.random().toString(36).slice(2)}`,
  key,
  value,
});

const specsToRows = (specifications?: Record<string, unknown>): SpecFormRow[] =>
  Object.entries(specifications ?? {}).map(([key, value]) => newSpecRow(key, String(value ?? '')));

const specsFromRows = (rows: SpecFormRow[]) =>
  rows.reduce<Record<string, string>>((acc, row) => {
    const key = row.key.trim();
    if (key) acc[key] = row.value.trim();
    return acc;
  }, {});

function productToForm(product: AdminProduct): ProductFormState {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description ?? '',
    shortDescription: product.shortDescription ?? '',
    categoryId: product.categoryId,
    categoryName: product.categoryName,
    brand: product.brand,
    price: String(product.price ?? ''),
    originalPrice: String(product.originalPrice ?? ''),
    status: String(product.status),
    condition: String(product.condition),
    warranty: String(product.warranty ?? 12),
    color: product.color ?? '',
    tags: (product.tags ?? []).join(', '),
    specs: specsToRows(product.specifications),
    isNew: !!product.isNew,
    isFeatured: !!product.isFeatured,
    isHot: !!product.isHot,
  };
}

function formToPayload(form: ProductFormState) {
  return {
    name: form.name.trim(),
    slug: (form.slug || slugify(form.name)).trim(),
    description: form.description.trim(),
    shortDescription: form.shortDescription.trim(),
    categoryId: form.categoryId,
    brand: form.brand.trim(),
    price: Number(form.price),
    originalPrice: form.originalPrice ? Number(form.originalPrice) : undefined,
    status: form.status,
    condition: form.condition,
    warranty: Number(form.warranty || 12),
    color: form.color.trim() || undefined,
    tags: form.tags.split(',').map(tag => tag.trim()).filter(Boolean),
    specifications: specsFromRows(form.specs),
    isNew: form.isNew,
    isFeatured: form.isFeatured,
    isHot: form.isHot,
  };
}

function variantToForm(variant: any): VariantFormState {
  return {
    id: variant.id,
    name: variant.name ?? '',
    sku: variant.sku ?? '',
    price: String(variant.price ?? ''),
    originalPrice: String(variant.originalPrice ?? ''),
    stock: String(variant.stock ?? 0),
    color: variant.color ?? '',
    storage: variant.storage ?? '',
    ram: variant.ram ?? '',
    isActive: variant.isActive !== false,
  };
}

function variantToPayload(form: VariantFormState) {
  return {
    name: form.name.trim(),
    sku: form.sku.trim(),
    price: Number(form.price),
    originalPrice: form.originalPrice ? Number(form.originalPrice) : undefined,
    stock: Number(form.stock || 0),
    color: form.color.trim() || undefined,
    storage: form.storage.trim() || undefined,
    ram: form.ram.trim() || undefined,
    isActive: form.isActive,
  };
}

function imageToForm(image: any): ImageFormState {
  return {
    id: image.id,
    url: image.url ?? '',
    variantId: image.variantId ?? 'product',
    altText: image.altText ?? '',
    sortOrder: String(image.sortOrder ?? 0),
    isPrimary: !!image.isPrimary,
  };
}

function imageToPayload(form: ImageFormState) {
  return {
    url: form.url.trim(),
    variantId: form.variantId === 'product' ? undefined : form.variantId,
    altText: form.altText.trim() || undefined,
    sortOrder: Number(form.sortOrder || 0),
    isPrimary: form.isPrimary,
  };
}

function imageVariantLabel(image: any) {
  return image.variantName || image.variant?.name || (image.variantId ? 'Biáº¿n thá»ƒ' : 'áº¢nh chung');
}

function ProductStatusBadge({ status }: { status: string }) {
  const label = {
    'Dang ban': 'Đang bán',
    'Het hang': 'Hết hàng',
    'Ngung kinh doanh': 'Ngừng kinh doanh',
    'Sap ra mat': 'Sắp ra mắt',
  }[status] ?? status;
  const color = {
    'Đang bán': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'Hết hàng': 'bg-amber-50 text-amber-700 border-amber-200',
    'Ngừng kinh doanh': 'bg-slate-50 text-slate-600 border-slate-200',
    'Sắp ra mắt': 'bg-blue-50 text-blue-700 border-blue-200',
    'Dang ban': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'Het hang': 'bg-amber-50 text-amber-700 border-amber-200',
    'Ngung kinh doanh': 'bg-slate-50 text-slate-600 border-slate-200',
    'Sap ra mat': 'bg-blue-50 text-blue-700 border-blue-200',
  }[status] ?? 'bg-slate-50 text-slate-700 border-slate-200';

  return <Badge variant="outline" className={color}>{label}</Badge>;
}

export function ProductApproval() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationParams>({ page: 1, pageSize: 10 });
  const [sort, setSort] = useState<SortParams>({ field: 'updatedAt', direction: 'desc' });
  const [filters, setFilters] = useState<ActiveFilter[]>([]);
  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<ProductFormState>(emptyForm);
  const [formEditing, setFormEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState<AdminProduct | null>(null);
  const [previewVariants, setPreviewVariants] = useState<any[]>([]);
  const [previewImages, setPreviewImages] = useState<any[]>([]);
  const [variantDialogOpen, setVariantDialogOpen] = useState(false);
  const [variantForm, setVariantForm] = useState<VariantFormState>(emptyVariantForm);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [imageForm, setImageForm] = useState<ImageFormState>(emptyImageForm);
  const [detailSaving, setDetailSaving] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminProductApi.getPaginated(
        pagination,
        sort.field ? sort : undefined,
        filters,
        search,
      );
      setProducts(res.data as AdminProduct[]);
      setTotal(res.total);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không tải được sản phẩm');
    } finally {
      setLoading(false);
    }
  }, [filters, pagination, search, sort]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const stats = useMemo(() => ({
    active: products.filter(product => ['Đang bán', 'Dang ban'].includes(String(product.status))).length,
    outOfStock: products.filter(product => ['Hết hàng', 'Het hang'].includes(String(product.status))).length,
    discontinued: products.filter(product => ['Ngừng kinh doanh', 'Ngung kinh doanh'].includes(String(product.status))).length,
  }), [products]);

  const brandOptions = useMemo(() => {
    const values = [
      ...defaultBrandOptions,
      ...products.map(product => product.brand),
      form.brand,
      preview?.brand,
    ];
    return [...new Set(values.map(value => String(value ?? '').trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'vi'));
  }, [form.brand, preview?.brand, products]);

  const colorOptions = useMemo(() => {
    const values = [
      ...defaultColorOptions,
      ...products.map(product => product.color),
      ...products.flatMap(product => product.variants ?? []).map(variant => variant.color),
      ...previewVariants.map(variant => variant.color),
      form.color,
      variantForm.color,
    ];
    return [...new Set(values.map(value => String(value ?? '').trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'vi'));
  }, [form.color, previewVariants, products, variantForm.color]);

  const openCreate = () => {
    setForm({ ...emptyForm, specs: [newSpecRow()] });
    setFormEditing(true);
    setFormOpen(true);
  };

  const openEdit = (product: AdminProduct) => {
    setForm(productToForm(product));
    setFormEditing(false);
    setFormOpen(true);
  };

  const addSpecRow = () => {
    setForm(prev => ({ ...prev, specs: [...prev.specs, newSpecRow()] }));
  };

  const updateSpecRow = (id: string, field: 'key' | 'value', value: string) => {
    setForm(prev => ({
      ...prev,
      specs: prev.specs.map(spec => spec.id === id ? { ...spec, [field]: value } : spec),
    }));
  };

  const removeSpecRow = (id: string) => {
    setForm(prev => ({ ...prev, specs: prev.specs.filter(spec => spec.id !== id) }));
  };

  const formReadOnly = !!form.id && !formEditing;

  const reloadProductDetail = async (productId: string, fallback?: AdminProduct) => {
    try {
      const [detail, variants, images] = await Promise.all([
        adminProductApi.getById(productId),
        adminProductApi.getVariants(productId),
        adminProductApi.getImages(productId),
      ]);
      setPreview(detail as AdminProduct);
      setPreviewVariants(variants);
      setPreviewImages(images);
    } catch (error) {
      if (fallback) {
        setPreviewVariants(fallback.variants ?? []);
        setPreviewImages((fallback.images ?? []).map((url, index) => ({ id: `${fallback.id}-${index}`, url, sortOrder: index })));
      }
      toast.error(error instanceof Error ? error.message : 'Không tải được chi tiết sản phẩm');
    }
  };

  const openPreview = async (product: AdminProduct) => {
    setPreview(product);
    await reloadProductDetail(product.id, product);
  };

  const saveProduct = async () => {
    if (!form.name.trim() || !form.categoryId || !form.brand.trim() || !Number(form.price)) {
      toast.error('Nhập đủ tên, danh mục, hãng và giá');
      return;
    }

    setSaving(true);
    try {
      const payload = formToPayload(form);
      const slug = String(payload.slug ?? '').trim();
      if (!slug) {
        toast.error('Slug không được để trống');
        return;
      }
      try {
        const existing = await adminProductApi.getBySlug(slug);
        if (existing && existing.id !== form.id) {
          toast.error(`Slug "${slug}" đã được dùng bởi sản phẩm "${existing.name}"`);
          return;
        }
      } catch {
        // Not found means the slug is available.
      }
      if (form.id) {
        const updated = await adminProductApi.update(form.id, payload);
        setForm(productToForm(updated as AdminProduct));
        setFormEditing(false);
        toast.success('Đã cập nhật sản phẩm');
      } else {
        await adminProductApi.create(payload);
        toast.success('Đã thêm sản phẩm');
        setFormOpen(false);
      }
      await fetchData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Lưu sản phẩm thất bại');
    } finally {
      setSaving(false);
    }
  };

  const deleteProduct = async (product: AdminProduct) => {
    if (!window.confirm(`Ngừng kinh doanh sản phẩm "${product.name}"?`)) return;
    try {
      await adminProductApi.delete(product.id);
      toast.success('Đã ngừng kinh doanh sản phẩm');
      await fetchData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Xóa sản phẩm thất bại');
    }
  };

  const openCreateVariant = () => {
    if (!preview) return;
    setVariantForm({ ...emptyVariantForm, price: String(preview.price ?? ''), originalPrice: String(preview.originalPrice ?? '') });
    setVariantDialogOpen(true);
  };

  const openEditVariant = (variant: any) => {
    setVariantForm(variantToForm(variant));
    setVariantDialogOpen(true);
  };

  const saveVariant = async () => {
    if (!preview) return;
    if (!variantForm.name.trim() || !variantForm.sku.trim() || !Number(variantForm.price)) {
      toast.error('Nhập đủ tên biến thể, SKU và giá');
      return;
    }
    setDetailSaving(true);
    try {
      const payload = variantToPayload(variantForm);
      if (variantForm.id) {
        await adminProductApi.updateVariant(preview.id, variantForm.id, payload);
        toast.success('Đã cập nhật biến thể');
      } else {
        await adminProductApi.createVariant(preview.id, payload);
        toast.success('Đã thêm biến thể');
      }
      setVariantDialogOpen(false);
      await reloadProductDetail(preview.id, preview);
      await fetchData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Lưu biến thể thất bại');
    } finally {
      setDetailSaving(false);
    }
  };

  const deleteVariant = async (variant: any) => {
    if (!preview || !window.confirm(`Xóa biến thể "${variant.name}"?`)) return;
    try {
      await adminProductApi.deleteVariant(preview.id, variant.id);
      toast.success('Đã xóa biến thể');
      await reloadProductDetail(preview.id, preview);
      await fetchData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Xóa biến thể thất bại');
    }
  };

  const openCreateImage = () => {
    setImageForm({ ...emptyImageForm, sortOrder: String(previewImages.length) });
    setImageDialogOpen(true);
  };

  const openEditImage = (image: any) => {
    setImageForm(imageToForm(image));
    setImageDialogOpen(true);
  };

  const saveImage = async () => {
    if (!preview) return;
    if (!imageForm.url.trim()) {
      toast.error('Nhập URL ảnh');
      return;
    }
    setDetailSaving(true);
    try {
      const payload = imageToPayload(imageForm);
      if (imageForm.id) {
        await adminProductApi.updateImage(preview.id, imageForm.id, payload);
        toast.success('Đã cập nhật ảnh');
      } else {
        await adminProductApi.createImage(preview.id, payload);
        toast.success('Đã thêm ảnh');
      }
      setImageDialogOpen(false);
      await reloadProductDetail(preview.id, preview);
      await fetchData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Lưu ảnh thất bại');
    } finally {
      setDetailSaving(false);
    }
  };

  const deleteImage = async (image: any) => {
    if (!preview || !window.confirm('Xóa ảnh sản phẩm này?')) return;
    try {
      await adminProductApi.deleteImage(preview.id, image.id);
      toast.success('Đã xóa ảnh');
      await reloadProductDetail(preview.id, preview);
      await fetchData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Xóa ảnh thất bại');
    }
  };

  const renderActions = (product: AdminProduct) => (
    <div className="flex items-center gap-1">
      <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => openPreview(product)}>
        <Eye className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => openEdit(product)}>
        <Edit className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive" onClick={() => deleteProduct(product)}>
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );

  const renderListItem = (product: AdminProduct) => (
    <Card className="hover:shadow-sm transition-shadow">
      <CardContent className="p-4 flex items-center gap-4">
        <div className="w-16 h-16 rounded-md overflow-hidden bg-muted shrink-0">
          <ImageWithFallback src={product.primaryImage || product.images?.[0]} alt={product.name} className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-medium line-clamp-1">{product.name}</p>
            <ProductStatusBadge status={String(product.status)} />
          </div>
          <p className="text-muted-foreground">{product.brand} - {product.categoryName}</p>
          <p className="text-primary">{formatPrice(product.price)}</p>
        </div>
        <div className="hidden md:grid grid-cols-3 gap-3 text-center text-sm">
          <div><p className="text-muted-foreground">Tồn</p><p>{product.stock ?? 0}</p></div>
          <div><p className="text-muted-foreground">Bien the</p><p>{product.variantCount ?? product.variants?.length ?? 0}</p></div>
          <div><p className="text-muted-foreground">Ảnh</p><p>{product.imageCount ?? product.images?.length ?? 0}</p></div>
        </div>
        {renderActions(product)}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-4">
      <AppBreadcrumb items={[{ label: 'Quản trị', href: '/admin' }, { label: 'Quản lý sản phẩm' }]} />

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1>Quản lý sản phẩm</h1>
          <p className="text-muted-foreground">Quản lý catalog sản phẩm theo dữ liệu từ BE.</p>
        </div>
        <Button onClick={openCreate}>
          <PackagePlus className="mr-2 h-4 w-4" />
          Thêm sản phẩm
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card><CardContent className="p-4"><p className="text-muted-foreground">Đang bán</p><p className="text-xl font-semibold">{stats.active}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-muted-foreground">Hết hàng</p><p className="text-xl font-semibold">{stats.outOfStock}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-muted-foreground">Ngừng kinh doanh</p><p className="text-xl font-semibold">{stats.discontinued}</p></CardContent></Card>
      </div>

      <FilterBar
        filters={filterConfigs}
        activeFilters={filters}
        onFilterChange={value => { setFilters(value); setPagination(prev => ({ ...prev, page: 1 })); }}
        searchValue={search}
        onSearchChange={value => { setSearch(value); setPagination(prev => ({ ...prev, page: 1 })); }}
        searchPlaceholder="Tìm tên, mô tả, hãng..."
      />

      <DataTable
        data={products}
        columns={columns.map(column => ({
          ...column,
          render: (item: AdminProduct) => {
            if (column.key === 'price') return formatPrice(item.price);
            if (column.key === 'status') return <ProductStatusBadge status={String(item.status)} />;
            if (column.key === 'updatedAt') return item.updatedAt ? new Date(item.updatedAt).toLocaleDateString('vi-VN') : '';
            return String((item as Record<string, unknown>)[column.key] ?? '');
          },
        }))}
        totalItems={total}
        pagination={pagination}
        sort={sort}
        onPaginationChange={setPagination}
        onSortChange={setSort}
        renderActions={renderActions}
        renderListItem={renderListItem}
        getId={product => product.id}
        loading={loading}
        defaultViewMode="table"
        emptyTitle="Chưa có sản phẩm"
        emptyDescription="Thêm sản phẩm đầu tiên hoặc đổi bộ lọc."
      />

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{form.id ? (formReadOnly ? 'Chi tiết sản phẩm' : 'Sửa sản phẩm') : 'Thêm sản phẩm'}</DialogTitle>
          </DialogHeader>
          <datalist id="admin-product-brand-options">
            {brandOptions.map(option => <option key={option} value={option} />)}
          </datalist>
          <datalist id="admin-product-color-options">
            {colorOptions.map(option => <option key={option} value={option} />)}
          </datalist>
          <ScrollArea className="max-h-[68vh] pr-4">
            <fieldset disabled={formReadOnly || saving} className="grid gap-4 disabled:opacity-75">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Tên sản phẩm *</Label>
                  <Input value={form.name} onChange={event => setForm(prev => ({ ...prev, name: event.target.value, slug: prev.slug || slugify(event.target.value) }))} />
                </div>
                <div className="grid gap-2">
                  <Label>Slug *</Label>
                  <Input value={form.slug} onChange={event => setForm(prev => ({ ...prev, slug: event.target.value }))} />
                </div>
                <div className="grid gap-2">
                  <Label>Danh mục *</Label>
                  <CategoryCombobox
                    value={form.categoryId}
                    allowRoot={false}
                    allowCreate={false}
                    onChange={(value, label) => setForm(prev => ({ ...prev, categoryId: value, categoryName: label }))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Hãng *</Label>
                  <Input
                    list="admin-product-brand-options"
                    value={form.brand}
                    onChange={event => setForm(prev => ({ ...prev, brand: event.target.value }))}
                    placeholder="Chọn hoặc nhập hãng..."
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Giá bán *</Label>
                  <Input type="number" value={form.price} onChange={event => setForm(prev => ({ ...prev, price: event.target.value }))} />
                </div>
                <div className="grid gap-2">
                  <Label>Giá gốc</Label>
                  <Input type="number" value={form.originalPrice} onChange={event => setForm(prev => ({ ...prev, originalPrice: event.target.value }))} />
                </div>
                <div className="grid gap-2">
                  <Label>Trạng thái</Label>
                  <Select value={form.status} onValueChange={value => setForm(prev => ({ ...prev, status: value }))} disabled={formReadOnly || saving}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Đang bán">Đang bán</SelectItem>
                      <SelectItem value="Hết hàng">Hết hàng</SelectItem>
                      <SelectItem value="Ngừng kinh doanh">Ngừng kinh doanh</SelectItem>
                      <SelectItem value="Sắp ra mắt">Sắp ra mắt</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Tình trạng</Label>
                  <Select value={form.condition} onValueChange={value => setForm(prev => ({ ...prev, condition: value }))} disabled={formReadOnly || saving}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Mới">Mới</SelectItem>
                      <SelectItem value="Like New">Like New</SelectItem>
                      <SelectItem value="Qua sử dụng">Qua sử dụng</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Bảo hành (tháng)</Label>
                  <Input type="number" value={form.warranty} onChange={event => setForm(prev => ({ ...prev, warranty: event.target.value }))} />
                </div>
                <div className="grid gap-2">
                  <Label>Màu sắc</Label>
                  <Input
                    list="admin-product-color-options"
                    value={form.color}
                    onChange={event => setForm(prev => ({ ...prev, color: event.target.value }))}
                    placeholder="Chọn hoặc nhập màu..."
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label>Mô tả ngắn</Label>
                <Input value={form.shortDescription} onChange={event => setForm(prev => ({ ...prev, shortDescription: event.target.value }))} />
              </div>
              <div className="grid gap-2">
                <Label>Mô tả</Label>
                <Textarea rows={4} value={form.description} onChange={event => setForm(prev => ({ ...prev, description: event.target.value }))} />
              </div>
              <div className="grid gap-2">
                <Label>Tags</Label>
                <Input value={form.tags} onChange={event => setForm(prev => ({ ...prev, tags: event.target.value }))} placeholder="iphone, flagship, 5g" />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center justify-between gap-3">
                  <Label>Thông số sản phẩm</Label>
                  <Button type="button" size="sm" variant="outline" onClick={addSpecRow}>
                    <Plus className="mr-1 h-4 w-4" />
                    Thêm thông số
                  </Button>
                </div>
                <div className="grid gap-2 rounded-md border p-3">
                  {form.specs.length === 0 ? (
                    <div className="flex flex-col gap-2 rounded-md bg-muted/40 p-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
                      <span>Chưa có thông số nào cho sản phẩm này.</span>
                      <Button type="button" size="sm" variant="secondary" onClick={addSpecRow}>Thêm dòng</Button>
                    </div>
                  ) : form.specs.map((spec, index) => (
                    <div key={spec.id} className="grid grid-cols-1 gap-2 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)_2rem]">
                      <Input
                        value={spec.key}
                        onChange={event => updateSpecRow(spec.id, 'key', event.target.value)}
                        placeholder={index === 0 ? 'Chip' : 'Tên thông số'}
                      />
                      <Input
                        value={spec.value}
                        onChange={event => updateSpecRow(spec.id, 'value', event.target.value)}
                        placeholder={index === 0 ? 'A17 Pro' : 'Giá trị'}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-9 w-9 p-0 text-destructive"
                        onClick={() => removeSpecRow(spec.id)}
                        aria-label="Xóa thông số"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex flex-wrap gap-6">
                <label className="flex items-center gap-2"><Switch disabled={formReadOnly || saving} checked={form.isNew} onCheckedChange={value => setForm(prev => ({ ...prev, isNew: value }))} /> Mới</label>
                <label className="flex items-center gap-2"><Switch disabled={formReadOnly || saving} checked={form.isFeatured} onCheckedChange={value => setForm(prev => ({ ...prev, isFeatured: value }))} /> Nổi bật</label>
                <label className="flex items-center gap-2"><Switch disabled={formReadOnly || saving} checked={form.isHot} onCheckedChange={value => setForm(prev => ({ ...prev, isHot: value }))} /> Hot</label>
              </div>
            </fieldset>
          </ScrollArea>
          <DialogFooter className="border-t bg-background px-6 py-4">
            <Button variant="outline" onClick={() => setFormOpen(false)}>{formReadOnly ? 'Đóng' : 'Hủy'}</Button>
            {formReadOnly ? (
              <Button onClick={() => setFormEditing(true)}>
                <Edit className="mr-1 h-4 w-4" />
                Sửa
              </Button>
            ) : (
              <Button onClick={saveProduct} disabled={saving}>{saving ? 'Đang lưu...' : (form.id ? 'Lưu cập nhật' : 'Lưu sản phẩm')}</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!preview} onOpenChange={() => setPreview(null)}>
        <DialogContent className="w-[calc(100vw-2rem)] max-w-none sm:max-w-none lg:w-[960px] max-h-[90vh] overflow-hidden p-0 gap-0">
          <DialogHeader>
            <DialogTitle className="px-6 pt-6 pr-12">Chi tiết sản phẩm</DialogTitle>
          </DialogHeader>
          {preview && (
            <ScrollArea className="max-h-[calc(90vh-132px)] px-6 pb-4">
              <div className="grid gap-5 xl:grid-cols-[240px_minmax(0,1fr)]">
                <div className="space-y-3">
                  <div className="aspect-square rounded-md overflow-hidden bg-muted">
                    <ImageWithFallback src={previewImages[0]?.url || preview.primaryImage || preview.images?.[0]} alt={preview.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {previewImages.slice(0, 8).map(image => (
                      <div key={image.id} className="aspect-square rounded border overflow-hidden bg-muted">
                        <ImageWithFallback src={image.url} alt={image.altText || preview.name} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-4 min-w-0">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="min-w-0 break-words text-xl leading-tight">{preview.name}</h2>
                      <ProductStatusBadge status={String(preview.status)} />
                    </div>
                    <p className="text-muted-foreground">{preview.brand} - {preview.categoryName}</p>
                    <p className="text-primary text-xl mt-2">{formatPrice(preview.price)}</p>
                  </div>
                  <Separator />
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <Card className="min-w-0"><CardContent className="p-3"><p className="text-muted-foreground text-sm">Tồn kho</p><p>{previewVariants.reduce((sum, item) => sum + (Number(item.stock) || 0), 0)}</p></CardContent></Card>
                    <Card className="min-w-0"><CardContent className="p-3"><p className="text-muted-foreground text-sm">Biến thể</p><p>{previewVariants.length}</p></CardContent></Card>
                    <Card className="min-w-0"><CardContent className="p-3"><p className="text-muted-foreground text-sm">Ảnh</p><p>{previewImages.length}</p></CardContent></Card>
                    <Card className="min-w-0"><CardContent className="p-3"><p className="text-muted-foreground text-sm">Bảo hành</p><p>{preview.warranty} tháng</p></CardContent></Card>
                  </div>
                  <div>
                    <p className="font-medium mb-1">Mô tả</p>
                    <p className="text-muted-foreground whitespace-pre-wrap break-words">{preview.description || preview.shortDescription}</p>
                  </div>
                  <div>
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <p className="font-medium">Biến thể</p>
                      <Button size="sm" variant="outline" onClick={openCreateVariant}>
                        <Plus className="mr-1 h-4 w-4" />
                        Thêm biến thể
                      </Button>
                    </div>
                    <div className="rounded-md border overflow-hidden">
                      {previewVariants.length === 0 ? (
                        <div className="p-3 text-muted-foreground">Chưa có biến thể</div>
                      ) : previewVariants.map(variant => (
                        <div key={variant.id} className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_120px_80px_80px] gap-2 p-3 border-b last:border-b-0">
                          <div className="min-w-0">
                            <p className="font-medium">{variant.name}</p>
                            <p className="text-muted-foreground break-all">{variant.sku}</p>
                          </div>
                          <p className="whitespace-nowrap">{formatPrice(variant.price)}</p>
                          <p>Tồn {variant.stock}</p>
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => openEditVariant(variant)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive" onClick={() => deleteVariant(variant)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <p className="font-medium">Ảnh sản phẩm</p>
                      <Button size="sm" variant="outline" onClick={openCreateImage}>
                        <Plus className="mr-1 h-4 w-4" />
                        Thêm ảnh
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {previewImages.length === 0 ? (
                        <div className="p-3 rounded-md border text-muted-foreground">Chưa có ảnh</div>
                      ) : previewImages.map(image => (
                        <div key={image.id} className="flex items-center gap-3 rounded-md border p-2">
                          <div className="h-14 w-14 rounded overflow-hidden bg-muted shrink-0">
                            <ImageWithFallback src={image.url} alt={image.altText || preview.name} className="h-full w-full object-cover" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate">{image.altText || preview.name}</p>
                            <p className="text-muted-foreground">Thứ tự {image.sortOrder ?? 0}{image.isPrimary ? ' - ảnh chính' : ''}</p>
                            <Badge variant="outline" className="mt-1 text-[10px]">{imageVariantLabel(image)}</Badge>
                          </div>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => openEditImage(image)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive" onClick={() => deleteImage(image)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <p className="font-medium">Thông số</p>
                      <Button size="sm" variant="outline" onClick={() => openEdit(preview)}>
                        <Edit className="mr-1 h-4 w-4" />
                        Sửa thông số
                      </Button>
                    </div>
                    <div className="grid gap-1 rounded-md border p-3">
                      {Object.entries(preview.specifications ?? {}).length === 0 ? (
                        <p className="text-muted-foreground">Chưa có thông số</p>
                      ) : Object.entries(preview.specifications ?? {}).map(([key, value]) => (
                        <div key={key} className="grid grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] gap-4 border-b py-1 last:border-b-0">
                          <span className="min-w-0 break-words text-muted-foreground">{key}</span>
                          <span className="min-w-0 break-words text-right">{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </ScrollArea>
          )}
          <DialogFooter className="border-t bg-background px-6 py-4">
            {preview && <Button variant="outline" onClick={() => openEdit(preview)}>Sửa sản phẩm</Button>}
            <Button onClick={() => setPreview(null)}>Đóng</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={variantDialogOpen} onOpenChange={setVariantDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{variantForm.id ? 'Sửa biến thể' : 'Thêm biến thể'}</DialogTitle>
          </DialogHeader>
          <datalist id="admin-variant-color-options">
            {colorOptions.map(option => <option key={option} value={option} />)}
          </datalist>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Tên biến thể *</Label>
              <Input value={variantForm.name} onChange={event => setVariantForm(prev => ({ ...prev, name: event.target.value }))} />
            </div>
            <div className="grid gap-2">
              <Label>SKU *</Label>
              <Input value={variantForm.sku} onChange={event => setVariantForm(prev => ({ ...prev, sku: event.target.value }))} />
            </div>
            <div className="grid gap-2">
              <Label>Giá *</Label>
              <Input type="number" value={variantForm.price} onChange={event => setVariantForm(prev => ({ ...prev, price: event.target.value }))} />
            </div>
            <div className="grid gap-2">
              <Label>Giá gốc</Label>
              <Input type="number" value={variantForm.originalPrice} onChange={event => setVariantForm(prev => ({ ...prev, originalPrice: event.target.value }))} />
            </div>
            <div className="grid gap-2">
              <Label>Tồn kho</Label>
              <Input type="number" value={variantForm.stock} onChange={event => setVariantForm(prev => ({ ...prev, stock: event.target.value }))} />
            </div>
            <div className="grid gap-2">
              <Label>Màu</Label>
              <Input
                list="admin-variant-color-options"
                value={variantForm.color}
                onChange={event => setVariantForm(prev => ({ ...prev, color: event.target.value }))}
                placeholder="Chọn hoặc nhập màu..."
              />
            </div>
            <div className="grid gap-2">
              <Label>Dung lượng</Label>
              <Input value={variantForm.storage} onChange={event => setVariantForm(prev => ({ ...prev, storage: event.target.value }))} />
            </div>
            <div className="grid gap-2">
              <Label>RAM</Label>
              <Input value={variantForm.ram} onChange={event => setVariantForm(prev => ({ ...prev, ram: event.target.value }))} />
            </div>
            <label className="flex items-center gap-2 md:col-span-2">
              <Switch checked={variantForm.isActive} onCheckedChange={value => setVariantForm(prev => ({ ...prev, isActive: value }))} />
              Đang bán biến thể
            </label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setVariantDialogOpen(false)}>Hủy</Button>
            <Button onClick={saveVariant} disabled={detailSaving}>{detailSaving ? 'Đang lưu...' : 'Lưu biến thể'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{imageForm.id ? 'Sửa ảnh' : 'Thêm ảnh'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label>URL ảnh *</Label>
              <Input value={imageForm.url} onChange={event => setImageForm(prev => ({ ...prev, url: event.target.value }))} />
            </div>
            <div className="grid gap-2">
              <Label>Gắn với biến thể</Label>
              <Select value={imageForm.variantId} onValueChange={value => setImageForm(prev => ({ ...prev, variantId: value }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="product">Ảnh chung sản phẩm</SelectItem>
                  {previewVariants.map(variant => (
                    <SelectItem key={variant.id} value={variant.id}>
                      {variant.name}{variant.sku ? ` - ${variant.sku}` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Alt text</Label>
                <Input value={imageForm.altText} onChange={event => setImageForm(prev => ({ ...prev, altText: event.target.value }))} />
              </div>
              <div className="grid gap-2">
                <Label>Thứ tự</Label>
                <Input type="number" value={imageForm.sortOrder} onChange={event => setImageForm(prev => ({ ...prev, sortOrder: event.target.value }))} />
              </div>
            </div>
            {imageForm.url && (
              <div className="h-40 rounded-md border overflow-hidden bg-muted">
                <ImageWithFallback src={imageForm.url} alt={imageForm.altText || 'Ảnh sản phẩm'} className="h-full w-full object-contain" />
              </div>
            )}
            <label className="flex items-center gap-2">
              <Switch checked={imageForm.isPrimary} onCheckedChange={value => setImageForm(prev => ({ ...prev, isPrimary: value }))} />
              Đặt làm ảnh chính
            </label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setImageDialogOpen(false)}>Hủy</Button>
            <Button onClick={saveImage} disabled={detailSaving}>{detailSaving ? 'Đang lưu...' : 'Lưu ảnh'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

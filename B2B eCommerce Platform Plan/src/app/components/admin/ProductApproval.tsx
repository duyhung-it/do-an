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
  specText: string;
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
  status: 'Dang ban',
  condition: 'Moi',
  warranty: '12',
  color: '',
  tags: '',
  specText: '',
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
  altText: '',
  sortOrder: '0',
  isPrimary: false,
};

const columns: ColumnConfig[] = [
  { key: 'name', label: 'San pham', visible: true, sortable: true },
  { key: 'categoryName', label: 'Danh muc', visible: true, sortable: true },
  { key: 'brand', label: 'Hang', visible: true, sortable: true },
  { key: 'price', label: 'Gia', visible: true, sortable: true },
  { key: 'stock', label: 'Ton kho', visible: true, sortable: false },
  { key: 'status', label: 'Trang thai', visible: true, sortable: true },
  { key: 'createdAt', label: 'Ngay tao', visible: true, sortable: true },
];

const filterConfigs: FilterConfig[] = [
  {
    key: 'status',
    label: 'Trang thai',
    type: 'select',
    options: [
      { label: 'Dang ban', value: 'Dang ban' },
      { label: 'Het hang', value: 'Het hang' },
      { label: 'Ngung kinh doanh', value: 'Ngung kinh doanh' },
      { label: 'Sap ra mat', value: 'Sap ra mat' },
    ],
  },
  {
    key: 'condition',
    label: 'Tinh trang',
    type: 'select',
    options: [
      { label: 'Moi', value: 'Moi' },
      { label: 'Like New', value: 'Like New' },
      { label: 'Qua su dung', value: 'Qua su dung' },
    ],
  },
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
    specText: Object.entries(product.specifications ?? {}).map(([key, value]) => `${key}: ${value}`).join('\n'),
    isNew: !!product.isNew,
    isFeatured: !!product.isFeatured,
    isHot: !!product.isHot,
  };
}

function specsFromText(value: string) {
  return value
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)
    .reduce<Record<string, string>>((acc, line) => {
      const [key, ...rest] = line.split(':');
      if (key?.trim() && rest.length > 0) acc[key.trim()] = rest.join(':').trim();
      return acc;
    }, {});
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
    specifications: specsFromText(form.specText),
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
    altText: image.altText ?? '',
    sortOrder: String(image.sortOrder ?? 0),
    isPrimary: !!image.isPrimary,
  };
}

function imageToPayload(form: ImageFormState) {
  return {
    url: form.url.trim(),
    altText: form.altText.trim() || undefined,
    sortOrder: Number(form.sortOrder || 0),
    isPrimary: form.isPrimary,
  };
}

function ProductStatusBadge({ status }: { status: string }) {
  const color = {
    'Dang ban': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'Het hang': 'bg-amber-50 text-amber-700 border-amber-200',
    'Ngung kinh doanh': 'bg-slate-50 text-slate-600 border-slate-200',
    'Sap ra mat': 'bg-blue-50 text-blue-700 border-blue-200',
  }[status] ?? 'bg-slate-50 text-slate-700 border-slate-200';

  return <Badge variant="outline" className={color}>{status}</Badge>;
}

export function ProductApproval() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationParams>({ page: 1, pageSize: 10 });
  const [sort, setSort] = useState<SortParams>({ field: 'createdAt', direction: 'desc' });
  const [filters, setFilters] = useState<ActiveFilter[]>([]);
  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<ProductFormState>(emptyForm);
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
      toast.error(error instanceof Error ? error.message : 'Khong tai duoc san pham');
    } finally {
      setLoading(false);
    }
  }, [filters, pagination, search, sort]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const stats = useMemo(() => ({
    active: products.filter(product => String(product.status) === 'Dang ban').length,
    outOfStock: products.filter(product => String(product.status) === 'Het hang').length,
    discontinued: products.filter(product => String(product.status) === 'Ngung kinh doanh').length,
  }), [products]);

  const openCreate = () => {
    setForm(emptyForm);
    setFormOpen(true);
  };

  const openEdit = (product: AdminProduct) => {
    setForm(productToForm(product));
    setFormOpen(true);
  };

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
      toast.error(error instanceof Error ? error.message : 'Khong tai duoc chi tiet san pham');
    }
  };

  const openPreview = async (product: AdminProduct) => {
    setPreview(product);
    await reloadProductDetail(product.id, product);
  };

  const saveProduct = async () => {
    if (!form.name.trim() || !form.categoryId || !form.brand.trim() || !Number(form.price)) {
      toast.error('Nhap du ten, danh muc, hang va gia');
      return;
    }

    setSaving(true);
    try {
      const payload = formToPayload(form);
      if (form.id) {
        await adminProductApi.update(form.id, payload);
        toast.success('Da cap nhat san pham');
      } else {
        await adminProductApi.create(payload);
        toast.success('Da them san pham');
      }
      setFormOpen(false);
      await fetchData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Luu san pham that bai');
    } finally {
      setSaving(false);
    }
  };

  const deleteProduct = async (product: AdminProduct) => {
    if (!window.confirm(`Ngung kinh doanh san pham "${product.name}"?`)) return;
    try {
      await adminProductApi.delete(product.id);
      toast.success('Da ngung kinh doanh san pham');
      await fetchData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Xoa san pham that bai');
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
      toast.error('Nhap du ten bien the, SKU va gia');
      return;
    }
    setDetailSaving(true);
    try {
      const payload = variantToPayload(variantForm);
      if (variantForm.id) {
        await adminProductApi.updateVariant(preview.id, variantForm.id, payload);
        toast.success('Da cap nhat bien the');
      } else {
        await adminProductApi.createVariant(preview.id, payload);
        toast.success('Da them bien the');
      }
      setVariantDialogOpen(false);
      await reloadProductDetail(preview.id, preview);
      await fetchData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Luu bien the that bai');
    } finally {
      setDetailSaving(false);
    }
  };

  const deleteVariant = async (variant: any) => {
    if (!preview || !window.confirm(`Xoa bien the "${variant.name}"?`)) return;
    try {
      await adminProductApi.deleteVariant(preview.id, variant.id);
      toast.success('Da xoa bien the');
      await reloadProductDetail(preview.id, preview);
      await fetchData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Xoa bien the that bai');
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
      toast.error('Nhap URL anh');
      return;
    }
    setDetailSaving(true);
    try {
      const payload = imageToPayload(imageForm);
      if (imageForm.id) {
        await adminProductApi.updateImage(preview.id, imageForm.id, payload);
        toast.success('Da cap nhat anh');
      } else {
        await adminProductApi.createImage(preview.id, payload);
        toast.success('Da them anh');
      }
      setImageDialogOpen(false);
      await reloadProductDetail(preview.id, preview);
      await fetchData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Luu anh that bai');
    } finally {
      setDetailSaving(false);
    }
  };

  const deleteImage = async (image: any) => {
    if (!preview || !window.confirm('Xoa anh san pham nay?')) return;
    try {
      await adminProductApi.deleteImage(preview.id, image.id);
      toast.success('Da xoa anh');
      await reloadProductDetail(preview.id, preview);
      await fetchData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Xoa anh that bai');
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
          <div><p className="text-muted-foreground">Ton</p><p>{product.stock ?? 0}</p></div>
          <div><p className="text-muted-foreground">Bien the</p><p>{product.variantCount ?? product.variants?.length ?? 0}</p></div>
          <div><p className="text-muted-foreground">Anh</p><p>{product.imageCount ?? product.images?.length ?? 0}</p></div>
        </div>
        {renderActions(product)}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-4">
      <AppBreadcrumb items={[{ label: 'Quan tri', href: '/admin' }, { label: 'Quan ly san pham' }]} />

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1>Quan ly san pham</h1>
          <p className="text-muted-foreground">Quan ly catalog san pham theo contract BE catalog.</p>
        </div>
        <Button onClick={openCreate}>
          <PackagePlus className="mr-2 h-4 w-4" />
          Them san pham
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card><CardContent className="p-4"><p className="text-muted-foreground">Dang ban</p><p className="text-xl font-semibold">{stats.active}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-muted-foreground">Het hang</p><p className="text-xl font-semibold">{stats.outOfStock}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-muted-foreground">Ngung kinh doanh</p><p className="text-xl font-semibold">{stats.discontinued}</p></CardContent></Card>
      </div>

      <FilterBar
        filters={filterConfigs}
        activeFilters={filters}
        onFilterChange={value => { setFilters(value); setPagination(prev => ({ ...prev, page: 1 })); }}
        searchValue={search}
        onSearchChange={value => { setSearch(value); setPagination(prev => ({ ...prev, page: 1 })); }}
        searchPlaceholder="Tim ten, mo ta, hang..."
      />

      <DataTable
        data={products}
        columns={columns.map(column => ({
          ...column,
          render: (item: AdminProduct) => {
            if (column.key === 'price') return formatPrice(item.price);
            if (column.key === 'status') return <ProductStatusBadge status={String(item.status)} />;
            if (column.key === 'createdAt') return item.createdAt ? new Date(item.createdAt).toLocaleDateString('vi-VN') : '';
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
        emptyTitle="Chua co san pham"
        emptyDescription="Them san pham dau tien hoac doi bo loc."
      />

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{form.id ? 'Sua san pham' : 'Them san pham'}</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[68vh] pr-4">
            <div className="grid gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Ten san pham *</Label>
                  <Input value={form.name} onChange={event => setForm(prev => ({ ...prev, name: event.target.value, slug: prev.slug || slugify(event.target.value) }))} />
                </div>
                <div className="grid gap-2">
                  <Label>Slug *</Label>
                  <Input value={form.slug} onChange={event => setForm(prev => ({ ...prev, slug: event.target.value }))} />
                </div>
                <div className="grid gap-2">
                  <Label>Danh muc *</Label>
                  <CategoryCombobox
                    value={form.categoryId}
                    allowRoot={false}
                    allowCreate={false}
                    onChange={(value, label) => setForm(prev => ({ ...prev, categoryId: value, categoryName: label }))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Hang *</Label>
                  <Input value={form.brand} onChange={event => setForm(prev => ({ ...prev, brand: event.target.value }))} placeholder="Apple, Samsung, Xiaomi..." />
                </div>
                <div className="grid gap-2">
                  <Label>Gia ban *</Label>
                  <Input type="number" value={form.price} onChange={event => setForm(prev => ({ ...prev, price: event.target.value }))} />
                </div>
                <div className="grid gap-2">
                  <Label>Gia goc</Label>
                  <Input type="number" value={form.originalPrice} onChange={event => setForm(prev => ({ ...prev, originalPrice: event.target.value }))} />
                </div>
                <div className="grid gap-2">
                  <Label>Trang thai</Label>
                  <Select value={form.status} onValueChange={value => setForm(prev => ({ ...prev, status: value }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Dang ban">Dang ban</SelectItem>
                      <SelectItem value="Het hang">Het hang</SelectItem>
                      <SelectItem value="Ngung kinh doanh">Ngung kinh doanh</SelectItem>
                      <SelectItem value="Sap ra mat">Sap ra mat</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Tinh trang</Label>
                  <Select value={form.condition} onValueChange={value => setForm(prev => ({ ...prev, condition: value }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Moi">Moi</SelectItem>
                      <SelectItem value="Like New">Like New</SelectItem>
                      <SelectItem value="Qua su dung">Qua su dung</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Bao hanh (thang)</Label>
                  <Input type="number" value={form.warranty} onChange={event => setForm(prev => ({ ...prev, warranty: event.target.value }))} />
                </div>
                <div className="grid gap-2">
                  <Label>Mau sac</Label>
                  <Input value={form.color} onChange={event => setForm(prev => ({ ...prev, color: event.target.value }))} />
                </div>
              </div>

              <div className="grid gap-2">
                <Label>Mo ta ngan</Label>
                <Input value={form.shortDescription} onChange={event => setForm(prev => ({ ...prev, shortDescription: event.target.value }))} />
              </div>
              <div className="grid gap-2">
                <Label>Mo ta</Label>
                <Textarea rows={4} value={form.description} onChange={event => setForm(prev => ({ ...prev, description: event.target.value }))} />
              </div>
              <div className="grid gap-2">
                <Label>Tags</Label>
                <Input value={form.tags} onChange={event => setForm(prev => ({ ...prev, tags: event.target.value }))} placeholder="iphone, flagship, 5g" />
              </div>
              <div className="grid gap-2">
                <Label>Thong so co ban</Label>
                <Textarea rows={4} value={form.specText} onChange={event => setForm(prev => ({ ...prev, specText: event.target.value }))} placeholder={'Chip: A17 Pro\nRAM: 8GB'} />
              </div>
              <div className="flex flex-wrap gap-6">
                <label className="flex items-center gap-2"><Switch checked={form.isNew} onCheckedChange={value => setForm(prev => ({ ...prev, isNew: value }))} /> Moi</label>
                <label className="flex items-center gap-2"><Switch checked={form.isFeatured} onCheckedChange={value => setForm(prev => ({ ...prev, isFeatured: value }))} /> Noi bat</label>
                <label className="flex items-center gap-2"><Switch checked={form.isHot} onCheckedChange={value => setForm(prev => ({ ...prev, isHot: value }))} /> Hot</label>
              </div>
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>Huy</Button>
            <Button onClick={saveProduct} disabled={saving}>{saving ? 'Dang luu...' : 'Luu san pham'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!preview} onOpenChange={() => setPreview(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Chi tiet san pham</DialogTitle>
          </DialogHeader>
          {preview && (
            <ScrollArea className="max-h-[70vh] pr-4">
              <div className="grid gap-5 lg:grid-cols-[240px_1fr]">
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
                <div className="space-y-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2>{preview.name}</h2>
                      <ProductStatusBadge status={String(preview.status)} />
                    </div>
                    <p className="text-muted-foreground">{preview.brand} - {preview.categoryName}</p>
                    <p className="text-primary text-xl mt-2">{formatPrice(preview.price)}</p>
                  </div>
                  <Separator />
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <Card><CardContent className="p-3"><p className="text-muted-foreground">Ton kho</p><p>{previewVariants.reduce((sum, item) => sum + (Number(item.stock) || 0), 0)}</p></CardContent></Card>
                    <Card><CardContent className="p-3"><p className="text-muted-foreground">Bien the</p><p>{previewVariants.length}</p></CardContent></Card>
                    <Card><CardContent className="p-3"><p className="text-muted-foreground">Anh</p><p>{previewImages.length}</p></CardContent></Card>
                    <Card><CardContent className="p-3"><p className="text-muted-foreground">Bao hanh</p><p>{preview.warranty} thang</p></CardContent></Card>
                  </div>
                  <div>
                    <p className="font-medium mb-1">Mo ta</p>
                    <p className="text-muted-foreground whitespace-pre-wrap">{preview.description || preview.shortDescription}</p>
                  </div>
                  <div>
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <p className="font-medium">Bien the</p>
                      <Button size="sm" variant="outline" onClick={openCreateVariant}>
                        <Plus className="mr-1 h-4 w-4" />
                        Them bien the
                      </Button>
                    </div>
                    <div className="rounded-md border overflow-hidden">
                      {previewVariants.length === 0 ? (
                        <div className="p-3 text-muted-foreground">Chua co bien the</div>
                      ) : previewVariants.map(variant => (
                        <div key={variant.id} className="grid grid-cols-1 md:grid-cols-[1fr_120px_80px_80px] gap-2 p-3 border-b last:border-b-0">
                          <div>
                            <p className="font-medium">{variant.name}</p>
                            <p className="text-muted-foreground">{variant.sku}</p>
                          </div>
                          <p>{formatPrice(variant.price)}</p>
                          <p>Ton {variant.stock}</p>
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
                      <p className="font-medium">Anh san pham</p>
                      <Button size="sm" variant="outline" onClick={openCreateImage}>
                        <Plus className="mr-1 h-4 w-4" />
                        Them anh
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {previewImages.length === 0 ? (
                        <div className="p-3 rounded-md border text-muted-foreground">Chua co anh</div>
                      ) : previewImages.map(image => (
                        <div key={image.id} className="flex items-center gap-3 rounded-md border p-2">
                          <div className="h-14 w-14 rounded overflow-hidden bg-muted shrink-0">
                            <ImageWithFallback src={image.url} alt={image.altText || preview.name} className="h-full w-full object-cover" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate">{image.altText || preview.name}</p>
                            <p className="text-muted-foreground">Thu tu {image.sortOrder ?? 0}{image.isPrimary ? ' - anh chinh' : ''}</p>
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
                    <p className="font-medium mb-2">Thong so</p>
                    <div className="grid gap-1">
                      {Object.entries(preview.specifications ?? {}).map(([key, value]) => (
                        <div key={key} className="flex justify-between gap-4 border-b py-1">
                          <span className="text-muted-foreground">{key}</span>
                          <span>{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </ScrollArea>
          )}
          <DialogFooter>
            {preview && <Button variant="outline" onClick={() => openEdit(preview)}>Sua san pham</Button>}
            <Button onClick={() => setPreview(null)}>Dong</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={variantDialogOpen} onOpenChange={setVariantDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{variantForm.id ? 'Sua bien the' : 'Them bien the'}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Ten bien the *</Label>
              <Input value={variantForm.name} onChange={event => setVariantForm(prev => ({ ...prev, name: event.target.value }))} />
            </div>
            <div className="grid gap-2">
              <Label>SKU *</Label>
              <Input value={variantForm.sku} onChange={event => setVariantForm(prev => ({ ...prev, sku: event.target.value }))} />
            </div>
            <div className="grid gap-2">
              <Label>Gia *</Label>
              <Input type="number" value={variantForm.price} onChange={event => setVariantForm(prev => ({ ...prev, price: event.target.value }))} />
            </div>
            <div className="grid gap-2">
              <Label>Gia goc</Label>
              <Input type="number" value={variantForm.originalPrice} onChange={event => setVariantForm(prev => ({ ...prev, originalPrice: event.target.value }))} />
            </div>
            <div className="grid gap-2">
              <Label>Ton kho</Label>
              <Input type="number" value={variantForm.stock} onChange={event => setVariantForm(prev => ({ ...prev, stock: event.target.value }))} />
            </div>
            <div className="grid gap-2">
              <Label>Mau</Label>
              <Input value={variantForm.color} onChange={event => setVariantForm(prev => ({ ...prev, color: event.target.value }))} />
            </div>
            <div className="grid gap-2">
              <Label>Dung luong</Label>
              <Input value={variantForm.storage} onChange={event => setVariantForm(prev => ({ ...prev, storage: event.target.value }))} />
            </div>
            <div className="grid gap-2">
              <Label>RAM</Label>
              <Input value={variantForm.ram} onChange={event => setVariantForm(prev => ({ ...prev, ram: event.target.value }))} />
            </div>
            <label className="flex items-center gap-2 md:col-span-2">
              <Switch checked={variantForm.isActive} onCheckedChange={value => setVariantForm(prev => ({ ...prev, isActive: value }))} />
              Dang ban bien the
            </label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setVariantDialogOpen(false)}>Huy</Button>
            <Button onClick={saveVariant} disabled={detailSaving}>{detailSaving ? 'Dang luu...' : 'Luu bien the'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{imageForm.id ? 'Sua anh' : 'Them anh'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label>URL anh *</Label>
              <Input value={imageForm.url} onChange={event => setImageForm(prev => ({ ...prev, url: event.target.value }))} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Alt text</Label>
                <Input value={imageForm.altText} onChange={event => setImageForm(prev => ({ ...prev, altText: event.target.value }))} />
              </div>
              <div className="grid gap-2">
                <Label>Thu tu</Label>
                <Input type="number" value={imageForm.sortOrder} onChange={event => setImageForm(prev => ({ ...prev, sortOrder: event.target.value }))} />
              </div>
            </div>
            {imageForm.url && (
              <div className="h-40 rounded-md border overflow-hidden bg-muted">
                <ImageWithFallback src={imageForm.url} alt={imageForm.altText || 'Anh san pham'} className="h-full w-full object-contain" />
              </div>
            )}
            <label className="flex items-center gap-2">
              <Switch checked={imageForm.isPrimary} onCheckedChange={value => setImageForm(prev => ({ ...prev, isPrimary: value }))} />
              Dat lam anh chinh
            </label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setImageDialogOpen(false)}>Huy</Button>
            <Button onClick={saveImage} disabled={detailSaving}>{detailSaving ? 'Dang luu...' : 'Luu anh'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

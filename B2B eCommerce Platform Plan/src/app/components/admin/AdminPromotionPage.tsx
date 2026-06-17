import { useCallback, useEffect, useMemo, useState } from 'react';
import { Download, Eye, Pencil, Plus, Power, Tag, Trash2, X } from 'lucide-react';
import { DataTable } from '../shared/DataTable';
import { FilterBar } from '../shared/FilterBar';
import { StatusBadge } from '../shared/StatusBadge';
import { AppBreadcrumb } from '../shared/AppBreadcrumb';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Separator } from '../ui/separator';
import { adminCategoryApi, adminProductApi, adminPromotionApi } from '../../services/adminBackendApi';
import { toast } from 'sonner';
import type { ActiveFilter, ColumnConfig, FilterConfig, PaginationParams, Promotion, SortParams } from '../../types';

type AdminPromotion = Omit<Promotion, 'type'> & {
  type: string;
  status?: string;
  applicableBrands?: string[];
};

type PromotionForm = {
  code: string;
  name: string;
  description: string;
  type: string;
  value: string;
  minOrderValue: string;
  maxDiscount: string;
  startDate: string;
  endDate: string;
  usageLimit: string;
  applicableProducts: string;
  applicableCategories: string;
  applicableBrands: string;
  isActive: boolean;
};

type ComboOption = {
  value: string;
  label: string;
  description?: string;
};

const PROMOTION_STATUSES = ['ACTIVE', 'INACTIVE', 'SCHEDULED', 'EXPIRED'];
const PROMOTION_TYPES = ['PERCENTAGE', 'FIXED_AMOUNT', 'FREE_SHIPPING'];

const nowLocal = () => new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16);
const laterLocal = () => new Date(Date.now() + 30 * 86400000 - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16);

const emptyForm: PromotionForm = {
  code: '',
  name: '',
  description: '',
  type: 'PERCENTAGE',
  value: '10',
  minOrderValue: '0',
  maxDiscount: '0',
  startDate: nowLocal(),
  endDate: laterLocal(),
  usageLimit: '0',
  applicableProducts: '',
  applicableCategories: '',
  applicableBrands: '',
  isActive: true,
};

const formatPrice = (value?: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(value ?? 0));

function toLocalInput(value?: string) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value.slice(0, 16);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

function toOffset(value: string) {
  return new Date(value).toISOString();
}

function csvToArray(value: string) {
  return value.split(',').map(item => item.trim()).filter(Boolean);
}

function arrayToCsv(values: string[]) {
  return values.map(item => item.trim()).filter(Boolean).join(', ');
}

function flattenCategoryOptions(categories: any[], depth = 0): ComboOption[] {
  return categories.flatMap(category => [
    {
      value: String(category.id),
      label: `${'  '.repeat(depth)}${category.name}`,
      description: category.slug || category.categoryName,
    },
    ...flattenCategoryOptions(category.children ?? [], depth + 1),
  ]);
}

function MultiCsvCombobox({
  label,
  value,
  options,
  placeholder,
  onChange,
}: {
  label: string;
  value: string;
  options: ComboOption[];
  placeholder: string;
  onChange: (value: string) => void;
}) {
  const [query, setQuery] = useState('');
  const selected = useMemo(() => csvToArray(value), [value]);
  const optionByValue = useMemo(() => new Map(options.map(option => [option.value.toLowerCase(), option])), [options]);
  const listId = useMemo(() => `promotion-combo-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`, [label]);
  const filteredOptions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const selectedSet = new Set(selected.map(item => item.toLowerCase()));
    return options
      .filter(option => !selectedSet.has(option.value.toLowerCase()))
      .filter(option => !normalizedQuery
        || option.label.toLowerCase().includes(normalizedQuery)
        || option.value.toLowerCase().includes(normalizedQuery)
        || option.description?.toLowerCase().includes(normalizedQuery))
      .slice(0, 8);
  }, [options, query, selected]);

  const selectedLabel = (item: string) => {
    const option = optionByValue.get(item.toLowerCase());
    return option ? option.label.trim() : item;
  };

  const addValue = (rawValue: string) => {
    const rawItems = rawValue.split(',').map(item => item.trim()).filter(Boolean);
    if (rawItems.length > 1) {
      const next = [...selected];
      rawItems.forEach(item => {
        const match = options.find(option =>
          option.value.toLowerCase() === item.toLowerCase()
          || option.label.trim().toLowerCase() === item.toLowerCase()
        );
        const nextValue = match?.value ?? item;
        if (!next.some(existing => existing.toLowerCase() === nextValue.toLowerCase())) next.push(nextValue);
      });
      onChange(arrayToCsv(next));
      setQuery('');
      return;
    }

    const trimmed = rawValue.trim();
    if (!trimmed) return;
    const match = options.find(option =>
      option.value.toLowerCase() === trimmed.toLowerCase()
      || option.label.trim().toLowerCase() === trimmed.toLowerCase()
    ) ?? filteredOptions[0];
    const nextValue = match?.value ?? trimmed;
    if (!selected.some(item => item.toLowerCase() === nextValue.toLowerCase())) {
      onChange(arrayToCsv([...selected, nextValue]));
    }
    setQuery('');
  };

  const removeValue = (item: string) => {
    onChange(arrayToCsv(selected.filter(existing => existing !== item)));
  };

  return (
    <div className="grid gap-2">
      <Label>{label}</Label>
      <div className="rounded-md border bg-background p-2">
        <div className="flex flex-wrap gap-1.5">
          {selected.length === 0 ? (
            <span className="px-1 py-0.5 text-sm text-muted-foreground">Áp dụng tất cả nếu để trống</span>
          ) : selected.map(item => (
            <Badge key={item} variant="secondary" className="max-w-full gap-1">
              <span className="max-w-[12rem] truncate">{selectedLabel(item)}</span>
              <button type="button" onClick={() => removeValue(item)} aria-label={`Xóa ${selectedLabel(item)}`}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
        <div className="mt-2 flex gap-2">
          <Input
            list={listId}
            value={query}
            onChange={event => setQuery(event.target.value)}
            onKeyDown={event => {
              if (event.key === 'Enter') {
                event.preventDefault();
                addValue(query);
              }
            }}
            onBlur={() => {
              if (query.includes(',')) addValue(query);
            }}
            placeholder={placeholder}
          />
          <Button type="button" variant="outline" size="sm" onClick={() => addValue(query)}>
            <Plus className="mr-1 h-4 w-4" />
            Thêm
          </Button>
        </div>
        <datalist id={listId}>
          {filteredOptions.map(option => (
            <option key={option.value} value={option.label.trim()} label={option.description ? `${option.value} - ${option.description}` : option.value} />
          ))}
        </datalist>
      </div>
    </div>
  );
}

function getPromoStatus(promotion: AdminPromotion) {
  if (!promotion.isActive) return 'INACTIVE';
  const now = Date.now();
  const start = new Date(promotion.startDate).getTime();
  const end = new Date(promotion.endDate).getTime();
  if (Number.isFinite(start) && start > now) return 'SCHEDULED';
  if (Number.isFinite(end) && end < now) return 'EXPIRED';
  return 'ACTIVE';
}

function valueText(promotion: AdminPromotion) {
  if (promotion.type === 'PERCENTAGE' || promotion.type === 'Phan tram') return `${promotion.value}%`;
  return formatPrice(promotion.value);
}

function formFromPromotion(promotion: AdminPromotion): PromotionForm {
  return {
    code: promotion.code,
    name: promotion.name,
    description: promotion.description ?? '',
    type: promotion.type === 'Phan tram' ? 'PERCENTAGE' : promotion.type === 'So tien' ? 'FIXED_AMOUNT' : promotion.type,
    value: String(promotion.value ?? 0),
    minOrderValue: String(promotion.minOrderValue ?? 0),
    maxDiscount: String(promotion.maxDiscount ?? 0),
    startDate: toLocalInput(promotion.startDate),
    endDate: toLocalInput(promotion.endDate),
    usageLimit: String(promotion.usageLimit ?? 0),
    applicableProducts: (promotion.applicableProducts ?? []).join(', '),
    applicableCategories: (promotion.applicableCategories ?? []).join(', '),
    applicableBrands: (promotion.applicableBrands ?? []).join(', '),
    isActive: promotion.isActive,
  };
}

function payloadFromForm(form: PromotionForm) {
  return {
    code: form.code.trim().toUpperCase(),
    name: form.name.trim(),
    description: form.description.trim(),
    type: form.type,
    value: Number(form.value),
    minOrderValue: Number(form.minOrderValue || 0),
    maxDiscount: Number(form.maxDiscount || 0),
    startDate: toOffset(form.startDate),
    endDate: toOffset(form.endDate),
    usageLimit: Number(form.usageLimit || 0),
    applicableProducts: csvToArray(form.applicableProducts),
    applicableCategories: csvToArray(form.applicableCategories),
    applicableBrands: csvToArray(form.applicableBrands),
    isActive: form.isActive,
  };
}

const columns: (ColumnConfig & { render?: (item: AdminPromotion) => React.ReactNode })[] = [
  { key: 'code', label: 'Code', visible: true, sortable: true },
  { key: 'name', label: 'Name', visible: true, sortable: true },
  { key: 'type', label: 'Type', visible: true, sortable: true },
  { key: 'value', label: 'Value', visible: true, sortable: true, render: valueText },
  { key: 'minOrderValue', label: 'Min order', visible: true, sortable: true, render: item => formatPrice(item.minOrderValue) },
  { key: 'usedCount', label: 'Used', visible: true, sortable: true },
  { key: 'usageLimit', label: 'Limit', visible: true, sortable: true, render: item => item.usageLimit || 'Unlimited' },
  { key: 'status', label: 'Status', visible: true, sortable: false, render: item => <StatusBadge status={getPromoStatus(item)} /> },
  { key: 'startDate', label: 'Start', visible: true, sortable: true },
  { key: 'endDate', label: 'End', visible: true, sortable: true },
];

const filterConfigs: FilterConfig[] = [
  { key: 'status', label: 'Status', type: 'select', options: PROMOTION_STATUSES.map(status => ({ label: status, value: status })) },
];

export function AdminPromotionPage() {
  const [promotions, setPromotions] = useState<AdminPromotion[]>([]);
  const [allPromotions, setAllPromotions] = useState<AdminPromotion[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationParams>({ page: 1, pageSize: 10 });
  const [sort, setSort] = useState<SortParams>({ field: 'updatedAt', direction: 'desc' });
  const [filters, setFilters] = useState<ActiveFilter[]>([]);
  const [search, setSearch] = useState('');
  const [selectedPromotion, setSelectedPromotion] = useState<AdminPromotion | null>(null);
  const [editingPromotion, setEditingPromotion] = useState<AdminPromotion | null>(null);
  const [form, setForm] = useState<PromotionForm>(emptyForm);
  const [productOptions, setProductOptions] = useState<ComboOption[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<ComboOption[]>([]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [allRes, pageRes] = await Promise.all([
        adminPromotionApi.getPaginated({ page: 1, pageSize: 1000 }),
        adminPromotionApi.getPaginated(pagination, sort.field ? sort : undefined, filters, search || undefined),
      ]);
      setAllPromotions(allRes.data as AdminPromotion[]);
      setPromotions(pageRes.data as AdminPromotion[]);
      setTotal(pageRes.total);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Cannot load promotions');
    } finally {
      setLoading(false);
    }
  }, [filters, pagination, search, sort]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      adminProductApi.getPaginated({ page: 1, pageSize: 1000 }, { field: 'updatedAt', direction: 'desc' }),
      adminCategoryApi.getAll(),
    ])
      .then(([productPage, categories]) => {
        if (cancelled) return;
        setProductOptions(productPage.data.map((product: any) => ({
          value: String(product.id),
          label: String(product.name),
          description: [product.brand, product.categoryName].filter(Boolean).join(' - '),
        })));
        setCategoryOptions(flattenCategoryOptions(categories));
      })
      .catch(error => {
        toast.error(error instanceof Error ? error.message : 'Cannot load promotion target options');
      });
    return () => { cancelled = true; };
  }, []);

  const stats = useMemo(() => ({
    total: allPromotions.length,
    active: allPromotions.filter(item => getPromoStatus(item) === 'ACTIVE').length,
    scheduled: allPromotions.filter(item => getPromoStatus(item) === 'SCHEDULED').length,
    expired: allPromotions.filter(item => getPromoStatus(item) === 'EXPIRED').length,
    used: allPromotions.reduce((sum, item) => sum + Number(item.usedCount ?? 0), 0),
  }), [allPromotions]);

  const brandOptions = useMemo<ComboOption[]>(() => {
    const values = [
      ...productOptions.map(option => option.description?.split(' - ')[0]),
      ...allPromotions.flatMap(item => item.applicableBrands ?? []),
      ...csvToArray(form.applicableBrands),
    ];
    return [...new Set(values.map(value => String(value ?? '').trim()).filter(Boolean))]
      .sort((a, b) => a.localeCompare(b, 'vi'))
      .map(brand => ({ value: brand, label: brand }));
  }, [allPromotions, form.applicableBrands, productOptions]);

  const openCreate = () => {
    setEditingPromotion(null);
    setForm({ ...emptyForm, startDate: nowLocal(), endDate: laterLocal() });
  };

  const openEdit = (promotion: AdminPromotion) => {
    setEditingPromotion(promotion);
    setForm(formFromPromotion(promotion));
  };

  const handleSubmit = async () => {
    if (!form.code.trim() || !form.name.trim() || !form.startDate || !form.endDate) {
      toast.error('Code, name and date range are required');
      return;
    }
    try {
      if (editingPromotion) {
        await adminPromotionApi.update(editingPromotion.id, payloadFromForm(form));
        toast.success('Promotion updated');
      } else {
        await adminPromotionApi.create(payloadFromForm(form));
        toast.success('Promotion created');
      }
      setEditingPromotion(null);
      setForm(emptyForm);
      await fetchData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Cannot save promotion');
    }
  };

  const handleToggle = async (promotion: AdminPromotion) => {
    try {
      await adminPromotionApi.toggle(promotion.id);
      toast.success('Promotion status changed');
      await fetchData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Cannot toggle promotion');
    }
  };

  const handleDelete = async (promotion: AdminPromotion) => {
    if (!confirm(`Delete promotion ${promotion.code}?`)) return;
    try {
      await adminPromotionApi.delete(promotion.id);
      toast.success('Promotion deleted');
      if (selectedPromotion?.id === promotion.id) setSelectedPromotion(null);
      await fetchData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Cannot delete promotion');
    }
  };

  const handleExportCSV = () => {
    const headers = ['Code', 'Name', 'Type', 'Value', 'Min order', 'Max discount', 'Start', 'End', 'Used', 'Limit', 'Status'];
    const rows = allPromotions.map(item => [
      item.code,
      item.name,
      item.type,
      String(item.value),
      String(item.minOrderValue ?? 0),
      String(item.maxDiscount ?? 0),
      item.startDate,
      item.endDate,
      String(item.usedCount ?? 0),
      String(item.usageLimit || 'Unlimited'),
      getPromoStatus(item),
    ]);
    const csv = [headers.join(','), ...rows.map(row => row.map(cell => `"${cell}"`).join(','))].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `admin-promotions-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const renderListItem = (promotion: AdminPromotion) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{promotion.code}</span>
              <span className="text-muted-foreground">{promotion.name}</span>
            </div>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-muted-foreground">
              <span>{promotion.type}: {valueText(promotion)}</span>
              <span>Used: {promotion.usedCount}/{promotion.usageLimit || 'Unlimited'}</span>
              <span>{promotion.startDate} - {promotion.endDate}</span>
            </div>
          </div>
          <StatusBadge status={getPromoStatus(promotion)} />
        </div>
      </CardContent>
    </Card>
  );

  const formOpen = form !== emptyForm || editingPromotion !== null;

  return (
    <div className="space-y-4">
      <AppBreadcrumb items={[{ label: 'Admin', href: '/admin' }, { label: 'Promotions' }]} />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1>Promotion management</h1>
          <p className="text-muted-foreground">Admin promotion CRUD from BE admin promotion contract.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExportCSV} disabled={allPromotions.length === 0}>
            <Download className="mr-1 h-4 w-4" /> Export CSV
          </Button>
          <Button size="sm" onClick={openCreate}>
            <Plus className="mr-1 h-4 w-4" /> New
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
        <Card><CardContent className="p-4"><p className="text-muted-foreground">Total</p><p className="text-xl">{stats.total}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-muted-foreground">Active</p><p className="text-xl text-green-600">{stats.active}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-muted-foreground">Scheduled</p><p className="text-xl">{stats.scheduled}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-muted-foreground">Expired</p><p className="text-xl">{stats.expired}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-muted-foreground">Used</p><p className="text-xl">{stats.used}</p></CardContent></Card>
      </div>

      <FilterBar
        filters={filterConfigs}
        activeFilters={filters}
        onFilterChange={next => { setFilters(next); setPagination(current => ({ ...current, page: 1 })); }}
        searchValue={search}
        onSearchChange={value => { setSearch(value); setPagination(current => ({ ...current, page: 1 })); }}
        searchPlaceholder="Search code or name..."
      />

      <DataTable
        data={promotions}
        columns={columns}
        totalItems={total}
        pagination={pagination}
        sort={sort}
        onPaginationChange={setPagination}
        onSortChange={setSort}
        onRowClick={setSelectedPromotion}
        getId={item => item.id}
        renderListItem={renderListItem}
        loading={loading}
        viewModes={['table', 'list']}
        emptyTitle="No promotions"
        emptyDescription="No admin promotions matched the current filters."
        renderActions={(promotion: AdminPromotion) => (
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={(event) => { event.stopPropagation(); setSelectedPromotion(promotion); }} title="View">
              <Eye className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="sm" onClick={(event) => { event.stopPropagation(); openEdit(promotion); }} title="Edit">
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="sm" onClick={(event) => { event.stopPropagation(); handleToggle(promotion); }} title="Toggle">
              <Power className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="sm" onClick={(event) => { event.stopPropagation(); handleDelete(promotion); }} title="Delete">
              <Trash2 className="h-3.5 w-3.5 text-red-500" />
            </Button>
          </div>
        )}
      />

      <Dialog open={formOpen} onOpenChange={(open) => { if (!open) { setEditingPromotion(null); setForm(emptyForm); } }}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingPromotion ? 'Edit promotion' : 'New promotion'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2"><Label>Code *</Label><Input value={form.code} onChange={e => setForm(current => ({ ...current, code: e.target.value }))} /></div>
              <div className="grid gap-2"><Label>Name *</Label><Input value={form.name} onChange={e => setForm(current => ({ ...current, name: e.target.value }))} /></div>
              <div className="grid gap-2">
                <Label>Type *</Label>
                <Select value={form.type} onValueChange={value => setForm(current => ({ ...current, type: value }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{PROMOTION_TYPES.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid gap-2"><Label>Value *</Label><Input type="number" value={form.value} onChange={e => setForm(current => ({ ...current, value: e.target.value }))} /></div>
              <div className="grid gap-2"><Label>Min order</Label><Input type="number" value={form.minOrderValue} onChange={e => setForm(current => ({ ...current, minOrderValue: e.target.value }))} /></div>
              <div className="grid gap-2"><Label>Max discount</Label><Input type="number" value={form.maxDiscount} onChange={e => setForm(current => ({ ...current, maxDiscount: e.target.value }))} /></div>
              <div className="grid gap-2"><Label>Start *</Label><Input type="datetime-local" value={form.startDate} onChange={e => setForm(current => ({ ...current, startDate: e.target.value }))} /></div>
              <div className="grid gap-2"><Label>End *</Label><Input type="datetime-local" value={form.endDate} onChange={e => setForm(current => ({ ...current, endDate: e.target.value }))} /></div>
              <div className="grid gap-2"><Label>Usage limit</Label><Input type="number" value={form.usageLimit} onChange={e => setForm(current => ({ ...current, usageLimit: e.target.value }))} /></div>
              <label className="flex items-center gap-2 pt-6">
                <input type="checkbox" checked={form.isActive} onChange={e => setForm(current => ({ ...current, isActive: e.target.checked }))} />
                Active
              </label>
            </div>
            <div className="grid gap-2"><Label>Description</Label><Textarea rows={3} value={form.description} onChange={e => setForm(current => ({ ...current, description: e.target.value }))} /></div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <MultiCsvCombobox
                label="Sản phẩm áp dụng"
                value={form.applicableProducts}
                options={productOptions}
                placeholder="Gõ tên sản phẩm hoặc dán product IDs..."
                onChange={value => setForm(current => ({ ...current, applicableProducts: value }))}
              />
              <MultiCsvCombobox
                label="Danh mục áp dụng"
                value={form.applicableCategories}
                options={categoryOptions}
                placeholder="Gõ tên danh mục hoặc dán category IDs..."
                onChange={value => setForm(current => ({ ...current, applicableCategories: value }))}
              />
              <MultiCsvCombobox
                label="Brand áp dụng"
                value={form.applicableBrands}
                options={brandOptions}
                placeholder="Gõ brand hoặc dán danh sách brand..."
                onChange={value => setForm(current => ({ ...current, applicableBrands: value }))}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => { setEditingPromotion(null); setForm(emptyForm); }}>Cancel</Button>
              <Button onClick={handleSubmit}>Save</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!selectedPromotion} onOpenChange={() => setSelectedPromotion(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Tag className="h-5 w-5" />{selectedPromotion?.code}</DialogTitle>
          </DialogHeader>
          {selectedPromotion && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <StatusBadge status={getPromoStatus(selectedPromotion)} />
                <span className="text-muted-foreground">{selectedPromotion.name}</span>
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-3">
                <div><p className="text-muted-foreground">Type</p><p>{selectedPromotion.type}</p></div>
                <div><p className="text-muted-foreground">Value</p><p>{valueText(selectedPromotion)}</p></div>
                <div><p className="text-muted-foreground">Min order</p><p>{formatPrice(selectedPromotion.minOrderValue)}</p></div>
                <div><p className="text-muted-foreground">Max discount</p><p>{formatPrice(selectedPromotion.maxDiscount)}</p></div>
                <div><p className="text-muted-foreground">Used</p><p>{selectedPromotion.usedCount} / {selectedPromotion.usageLimit || 'Unlimited'}</p></div>
                <div><p className="text-muted-foreground">Active</p><p>{selectedPromotion.isActive ? 'Yes' : 'No'}</p></div>
                <div><p className="text-muted-foreground">Start</p><p>{selectedPromotion.startDate}</p></div>
                <div><p className="text-muted-foreground">End</p><p>{selectedPromotion.endDate}</p></div>
              </div>
              {selectedPromotion.description && <p className="text-muted-foreground">{selectedPromotion.description}</p>}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

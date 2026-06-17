// ============================================================
// Quản lý danh mục Admin — Search, batch toggle, tree view
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, FolderTree, Search, ToggleLeft, ChevronRight, ChevronDown, Download } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Badge } from '../ui/badge';
import { DataTable } from '../shared/DataTable';
import { FormDialog } from '../shared/FormDialog';
import { AppBreadcrumb } from '../shared/AppBreadcrumb';
import { adminCategoryApi } from '../../services/adminBackendApi';
import { toast } from 'sonner';
import type { Category, PaginationParams, SortParams, ColumnConfig } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Checkbox } from '../ui/checkbox';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '../ui/alert-dialog';
import { CategoryCombobox } from '../shared/CategoryCombobox';

const columns: ColumnConfig[] = [
  { key: 'name', label: 'Tên danh mục', visible: true, sortable: true, editable: true, type: 'text' },
  { key: 'slug', label: 'Đường dẫn', visible: true, sortable: true },
  { key: 'description', label: 'Mô tả', visible: true, sortable: false, editable: true, type: 'text' },
  { key: 'productCount', label: 'Số sản phẩm', visible: true, sortable: true },
  { key: 'isActive', label: 'Kích hoạt', visible: true, sortable: true, editable: true, type: 'select', options: ['true', 'false'] },
  { key: 'createdAt', label: 'Ngày tạo', visible: true, sortable: true },
  // DB-B.20: Thêm cột mới (ẩn mặc định)
  { key: 'sortOrder', label: 'Thứ tự', visible: false, sortable: true, editable: true, type: 'number' },
  { key: 'level', label: 'Cấp', visible: false, sortable: true },
  { key: 'path', label: 'Đường dẫn cây', visible: false, sortable: false },
];

interface FormData {
  name: string;
  slug: string;
  description: string;
  parentId: string | null;
  icon: string;
  isActive: boolean;
  // DB-B.20: Thêm trường mới
  sortOrder: number;
  metaTitle: string;
  metaDescription: string;
}

const defaultForm: FormData = {
  name: '', slug: '', description: '', parentId: null, icon: 'Tag', isActive: true,
  sortOrder: 0, metaTitle: '', metaDescription: '',
};

function flattenCategoryTree(categories: Category[]): Category[] {
  return categories.flatMap(category => [
    category,
    ...flattenCategoryTree(category.children ?? []),
  ]);
}

export function CategoryManagement() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationParams>({ page: 1, pageSize: 20 });
  const [sort, setSort] = useState<SortParams>({ field: '', direction: 'asc' });
  const [showForm, setShowForm] = useState(false);
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [form, setForm] = useState<FormData>(defaultForm);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [treeSearch, setTreeSearch] = useState('');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [allRes, pageRes] = await Promise.all([
        adminCategoryApi.getAll(),
        adminCategoryApi.getPaginated(pagination, sort.field ? sort : undefined),
      ]);
      const flatCategories = flattenCategoryTree(allRes);
      setAllCategories(flatCategories);
      setCategories(pageRes.data);
      setTotal(pageRes.total);
      // Auto-expand all root by default
      setExpandedIds(new Set(flatCategories.filter(c => !c.parentId).map(c => c.id)));
    } finally {
      setLoading(false);
    }
  }, [pagination, sort]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openCreate = () => {
    setEditingCat(null);
    setForm(defaultForm);
    setFormErrors({});
    setShowForm(true);
  };

  const openEdit = (cat: Category) => {
    setEditingCat(cat);
    setForm({
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      parentId: cat.parentId,
      icon: cat.icon,
      isActive: cat.isActive,
      // DB-B.20: Thêm trường mới
      sortOrder: cat.sortOrder ?? 0,
      metaTitle: cat.metaTitle ?? '',
      metaDescription: cat.metaDescription ?? '',
    });
    setFormErrors({});
    setShowForm(true);
  };

  const validateForm = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = 'Vui lòng nhập tên danh mục';
    if (!form.slug.trim()) errs.slug = 'Vui lòng nhập đường dẫn';
    else if (!/^[a-z0-9-]+$/.test(form.slug)) errs.slug = 'Đường dẫn chỉ gồm chữ thường, số và dấu gạch ngang';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    if (editingCat) {
      await adminCategoryApi.update(editingCat.id, form);
      toast.success('Đã cập nhật danh mục');
    } else {
      await adminCategoryApi.create(form);
      toast.success('Đã tạo danh mục mới');
    }
    setShowForm(false);
    fetchData();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    // Check children
    const hasChildren = allCategories.some(c => c.parentId === deleteId);
    if (hasChildren) {
      toast.error('Không thể xoá danh mục có danh mục con. Vui lòng xoá danh mục con trước.');
      setDeleteId(null);
      return;
    }
    await adminCategoryApi.delete(deleteId);
    setDeleteId(null);
    setSelectedIds(prev => prev.filter(id => id !== deleteId));
    fetchData();
    toast.success('Đã xoá danh mục');
  };

  const handleInlineEdit = async (id: string, field: string, value: unknown) => {
    const realValue = field === 'isActive' ? value === 'true' : value;
    await adminCategoryApi.update(id, { [field]: realValue } as Partial<Category>);
    setCategories(prev => prev.map(c => c.id === id ? { ...c, [field]: realValue } : c));
    setAllCategories(prev => prev.map(c => c.id === id ? { ...c, [field]: realValue } : c));
    toast.success('Đã cập nhật');
  };

  // Batch toggle active/inactive
  const handleBatchToggle = async (active: boolean) => {
    for (const id of selectedIds) {
      await adminCategoryApi.update(id, { isActive: active });
    }
    setAllCategories(prev =>
      prev.map(c => selectedIds.includes(c.id) ? { ...c, isActive: active } : c),
    );
    setCategories(prev =>
      prev.map(c => selectedIds.includes(c.id) ? { ...c, isActive: active } : c),
    );
    toast.success(`Đã ${active ? 'kích hoạt' : 'ẩn'} ${selectedIds.length} danh mục`);
    setSelectedIds([]);
  };

  // Tree view
  const rootCats = allCategories.filter(c => !c.parentId);
  const getChildren = (parentId: string) => allCategories.filter(c => c.parentId === parentId);

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id],
    );
  };

  // Filtered tree
  const filteredRootCats = treeSearch
    ? rootCats.filter(c =>
        c.name.toLowerCase().includes(treeSearch.toLowerCase()) ||
        getChildren(c.id).some(ch => ch.name.toLowerCase().includes(treeSearch.toLowerCase())),
      )
    : rootCats;

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Tên', 'Slug', 'Mô tả', 'Số SP', 'Kích hoạt', 'Ngày tạo'];
    const rows = allCategories.map(c => [c.name, c.slug, c.description, c.productCount.toString(), c.isActive ? 'Có' : 'Không', c.createdAt]);
    const csvContent = [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `danh-muc-${new Date().toISOString().slice(0, 10)}.csv`; a.click();
    URL.revokeObjectURL(url);
    toast.success('Đã xuất file CSV');
  };

  return (
    <div className="space-y-6">
      <AppBreadcrumb items={[{ label: 'Quản trị', href: '/admin' }, { label: 'Danh mục' }]} />
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1>Quản lý danh mục</h1>
          <p className="text-muted-foreground">
            Tổ chức danh mục sản phẩm theo cấp bậc ({allCategories.length} danh mục)
          </p>
        </div>
        <div className="flex items-center gap-2">
          {selectedIds.length > 0 && (
            <>
              <Button variant="outline" size="sm" onClick={() => handleBatchToggle(true)}>
                <ToggleLeft className="mr-1 h-4 w-4" /> Kích hoạt ({selectedIds.length})
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleBatchToggle(false)}>
                Ẩn ({selectedIds.length})
              </Button>
            </>
          )}
          <Button onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" /> Thêm danh mục
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportCSV}>
            <Download className="mr-1 h-4 w-4" /> Xuất CSV
          </Button>
        </div>
      </div>

      {/* Cây danh mục */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <CardTitle className="flex items-center gap-2">
              <FolderTree className="h-5 w-5" /> Cấu trúc danh mục
            </CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-9 h-9"
                placeholder="Tìm danh mục..."
                value={treeSearch}
                onChange={e => setTreeSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredRootCats.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">Không tìm thấy danh mục nào</p>
          ) : (
            <div className="space-y-1">
              {filteredRootCats.map(cat => {
                const children = getChildren(cat.id);
                const isExpanded = expandedIds.has(cat.id);
                const filteredChildren = treeSearch
                  ? children.filter(ch => ch.name.toLowerCase().includes(treeSearch.toLowerCase()))
                  : children;

                return (
                  <div key={cat.id}>
                    <div
                      className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 group"
                    >
                      <Checkbox
                        checked={selectedIds.includes(cat.id)}
                        onClick={e => e.stopPropagation()}
                        onCheckedChange={() => toggleSelect(cat.id)}
                      />
                      {children.length > 0 ? (
                        <button
                          type="button"
                          className="h-5 w-5 flex items-center justify-center shrink-0"
                          aria-label={isExpanded ? 'Thu gọn danh mục' : 'Mở rộng danh mục'}
                          onClick={e => {
                            e.preventDefault();
                            e.stopPropagation();
                            toggleExpand(cat.id);
                          }}
                        >
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          )}
                        </button>
                      ) : (
                        <div className="w-5" />
                      )}
                      <button
                        type="button"
                        className="flex-1 flex items-center gap-2 text-left"
                        onClick={e => {
                          e.stopPropagation();
                          openEdit(cat);
                        }}
                      >
                        <FolderTree className="h-4 w-4 text-primary shrink-0" />
                        <span className="font-medium">{cat.name}</span>
                        <Badge variant="secondary" className="ml-1">{cat.productCount}</Badge>
                        {!cat.isActive && (
                          <Badge variant="outline" className="text-muted-foreground">Ẩn</Badge>
                        )}
                      </button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={e => { e.stopPropagation(); setDeleteId(cat.id); }}
                      >
                        <Trash2 className="h-3 w-3 text-destructive" />
                      </Button>
                    </div>
                    {isExpanded && filteredChildren.map(child => (
                      <div
                        key={child.id}
                        className="flex items-center gap-2 p-2 pl-12 rounded-lg hover:bg-muted/50 group"
                      >
                        <Checkbox
                          checked={selectedIds.includes(child.id)}
                          onClick={e => e.stopPropagation()}
                          onCheckedChange={() => toggleSelect(child.id)}
                        />
                        <button
                          type="button"
                          className="flex-1 flex items-center gap-2 text-left"
                          onClick={e => {
                            e.stopPropagation();
                            openEdit(child);
                          }}
                        >
                          <span className="text-muted-foreground">└</span>
                          <span>{child.name}</span>
                          <Badge variant="secondary">{child.productCount}</Badge>
                          {!child.isActive && (
                            <Badge variant="outline" className="text-muted-foreground">Ẩn</Badge>
                          )}
                        </button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={e => { e.stopPropagation(); setDeleteId(child.id); }}
                        >
                          <Trash2 className="h-3 w-3 text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bảng dữ liệu */}
      <DataTable
        data={categories}
        columns={columns}
        totalItems={total}
        pagination={pagination}
        sort={sort}
        onPaginationChange={setPagination}
        onSortChange={setSort}
        onInlineEdit={handleInlineEdit}
        onRowClick={openEdit}
        getId={c => c.id}
        loading={loading}
        viewModes={['table']}
      />

      {/* Form tạo/sửa */}
      <FormDialog
        open={showForm}
        onClose={() => setShowForm(false)}
        title={editingCat ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}
        onSubmit={handleSubmit}
        submitLabel={editingCat ? 'Cập nhật' : 'Tạo mới'}
      >
        <div className="grid gap-2">
          <Label>Tên danh mục *</Label>
          <Input
            value={form.name}
            onChange={e => {
              setForm(p => ({
                ...p,
                name: e.target.value,
                slug: e.target.value.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-'),
              }));
              setFormErrors(prev => ({ ...prev, name: '' }));
            }}
            className={formErrors.name ? 'border-destructive' : ''}
          />
          {formErrors.name && <p className="text-destructive">{formErrors.name}</p>}
        </div>
        <div className="grid gap-2">
          <Label>Đường dẫn (slug) *</Label>
          <Input
            value={form.slug}
            onChange={e => {
              setForm(p => ({ ...p, slug: e.target.value }));
              setFormErrors(prev => ({ ...prev, slug: '' }));
            }}
            className={formErrors.slug ? 'border-destructive' : ''}
          />
          {formErrors.slug && <p className="text-destructive">{formErrors.slug}</p>}
        </div>
        <div className="grid gap-2">
          <Label>Danh mục cha</Label>
          <CategoryCombobox
            value={form.parentId ?? ''}
            onChange={(id) => setForm(p => ({ ...p, parentId: id || null }))}
            placeholder="Chọn danh mục cha..."
            allowCreate={false}
            allowRoot
            excludeId={editingCat?.id}
          />
        </div>
        <div className="grid gap-2">
          <Label>Mô tả</Label>
          <Input value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
        </div>
        <div className="flex items-center gap-3">
          <Switch checked={form.isActive} onCheckedChange={v => setForm(p => ({ ...p, isActive: v }))} />
          <Label>Kích hoạt</Label>
        </div>
        {/* DB-B.20: Thêm sortOrder, SEO fields */}
        <div className="grid gap-2">
          <Label>Thứ tự sắp xếp</Label>
          <Input
            type="number"
            value={form.sortOrder}
            onChange={e => setForm(p => ({ ...p, sortOrder: Number(e.target.value) }))}
            min={0}
          />
        </div>
        <div className="grid gap-2">
          <Label>SEO Title</Label>
          <Input value={form.metaTitle} onChange={e => setForm(p => ({ ...p, metaTitle: e.target.value }))} placeholder="Tiêu đề SEO (tuỳ chọn)" />
        </div>
        <div className="grid gap-2">
          <Label>SEO Description</Label>
          <Input value={form.metaDescription} onChange={e => setForm(p => ({ ...p, metaDescription: e.target.value }))} placeholder="Mô tả SEO (tuỳ chọn)" />
        </div>
      </FormDialog>

      {/* Xác nhận xoá */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xoá danh mục?</AlertDialogTitle>
            <AlertDialogDescription>Hành động này không thể hoàn tác. Danh mục con (nếu có) phải được xoá trước.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Huỷ</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Xoá</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

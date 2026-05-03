# Code Templates cho AI Vibe Coding

> Các mẫu code chuẩn để AI copy-adapt khi tạo component/page/service mới.
> Tham chiếu: [32-vibe-coding-context.md](./32-vibe-coding-context.md)

---

## Template 1: Service File Mới

> Dùng khi tạo API service cho domain mới. File đặt tại `/src/app/services/xxxApi.ts`.

```tsx
// /src/app/services/xxxApi.ts
import type {
  PaginationParams,
  SortParams,
  PaginatedResponse,
  // Import types cần thiết
} from '../types';

// === Mock delay ===
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// === Mock data (mutable) ===
let mockItems: YourType[] = [
  {
    id: 'item-001',
    name: 'Mục 1',
    status: 'Hoạt động',
    createdAt: '2025-01-15T08:00:00Z',
    updatedAt: '2025-01-15T08:00:00Z',
  },
  // ... thêm 4-5 records nữa
];

// === Helper: lọc, sắp xếp, phân trang ===
function applyFilters(items: YourType[], filters?: Record<string, string>): YourType[] {
  let result = [...items];
  if (filters?.search) {
    const q = filters.search.toLowerCase();
    result = result.filter(i => i.name.toLowerCase().includes(q));
  }
  if (filters?.status) {
    result = result.filter(i => i.status === filters.status);
  }
  return result;
}

function applySort(items: YourType[], sort: SortParams): YourType[] {
  return [...items].sort((a, b) => {
    const aVal = a[sort.field as keyof YourType] ?? '';
    const bVal = b[sort.field as keyof YourType] ?? '';
    const cmp = String(aVal).localeCompare(String(bVal), 'vi');
    return sort.direction === 'asc' ? cmp : -cmp;
  });
}

function paginate<T>(items: T[], pagination: PaginationParams): PaginatedResponse<T> {
  const total = items.length;
  const start = (pagination.page - 1) * pagination.pageSize;
  return {
    data: items.slice(start, start + pagination.pageSize),
    total,
    page: pagination.page,
    pageSize: pagination.pageSize,
    totalPages: Math.ceil(total / pagination.pageSize),
  };
}

// === Export API ===
export const xxxApi = {
  async getAll(
    pagination: PaginationParams,
    sort: SortParams,
    filters?: Record<string, string>
  ): Promise<PaginatedResponse<YourType>> {
    await delay(300);
    let result = applyFilters(mockItems, filters);
    result = applySort(result, sort);
    return paginate(result, pagination);
  },

  async getById(id: string): Promise<YourType | undefined> {
    await delay(200);
    return mockItems.find(i => i.id === id);
  },

  async create(data: Partial<YourType>): Promise<YourType> {
    await delay(300);
    const newItem: YourType = {
      ...data,
      id: `item-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as YourType;
    mockItems.unshift(newItem);
    return newItem;
  },

  async update(id: string, data: Partial<YourType>): Promise<YourType> {
    await delay(300);
    const idx = mockItems.findIndex(i => i.id === id);
    if (idx === -1) throw new Error('Không tìm thấy');
    mockItems[idx] = { ...mockItems[idx], ...data, updatedAt: new Date().toISOString() };
    return mockItems[idx];
  },

  async remove(id: string): Promise<void> {
    await delay(200);
    mockItems = mockItems.filter(i => i.id !== id);
  },

  async getStats(): Promise<{ total: number; active: number }> {
    await delay(200);
    return {
      total: mockItems.length,
      active: mockItems.filter(i => i.status === 'Hoạt động').length,
    };
  },
};
```

---

## Template 2: Admin Page (theo pattern OrderOverview.tsx)

> Dùng cho trang quản lý Admin. Pattern: FilterBar + DataTable + FormDialog + StatusBadge.

```tsx
// /src/app/components/admin/AdminXxxPage.tsx
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import type {
  PaginationParams, SortParams, ColumnConfig, FilterConfig, ActiveFilter,
  // YourType
} from '../../types';
import { DataTable } from '../shared/DataTable';
import { FilterBar } from '../shared/FilterBar';
import { FormDialog } from '../shared/FormDialog';
import { StatusBadge } from '../shared/StatusBadge';
import { ConfirmDialog } from '../shared/ConfirmDialog';
import { Button } from '../ui/button';
import { Plus, Pencil, Trash2 } from 'lucide-react';
// import { xxxApi } from '../../services/xxxApi';

export function AdminXxxPage() {
  // === State ===
  const [items, setItems] = useState<YourType[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationParams>({ page: 1, pageSize: 10 });
  const [sort, setSort] = useState<SortParams>({ field: 'createdAt', direction: 'desc' });
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([]);

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<YourType | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<YourType | null>(null);

  // === Load data ===
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const filters: Record<string, string> = {};
      if (searchTerm) filters.search = searchTerm;
      activeFilters.forEach(f => { filters[f.key] = String(f.value); });

      const res = await xxxApi.getAll(pagination, sort, filters);
      setItems(res.data);
      setTotalItems(res.total);
    } catch {
      toast.error('Lỗi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  }, [pagination, sort, searchTerm, activeFilters]);

  useEffect(() => { loadData(); }, [loadData]);

  // === Column config ===
  const columns: ColumnConfig[] = [
    { key: 'name', label: 'Tên', sortable: true },
    {
      key: 'status', label: 'Trạng thái', sortable: true,
      render: (val: string) => <StatusBadge status={val} />,
    },
    { key: 'createdAt', label: 'Ngày tạo', sortable: true },
  ];

  // === Filter config ===
  const filterConfigs: FilterConfig[] = [
    {
      key: 'status', label: 'Trạng thái', type: 'select',
      options: [
        { label: 'Hoạt động', value: 'Hoạt động' },
        { label: 'Ngừng', value: 'Ngừng' },
      ],
    },
  ];

  // === Handlers ===
  const handleCreate = () => { setEditingItem(null); setDialogOpen(true); };
  const handleEdit = (item: YourType) => { setEditingItem(item); setDialogOpen(true); };
  const handleSubmit = async (data: Record<string, unknown>) => {
    try {
      if (editingItem) {
        await xxxApi.update(editingItem.id, data);
        toast.success('Cập nhật thành công');
      } else {
        await xxxApi.create(data);
        toast.success('Tạo mới thành công');
      }
      setDialogOpen(false);
      loadData();
    } catch {
      toast.error('Có lỗi xảy ra');
    }
  };
  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await xxxApi.remove(deleteTarget.id);
      toast.success('Xoá thành công');
      setDeleteTarget(null);
      loadData();
    } catch {
      toast.error('Có lỗi xảy ra');
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1>Quản lý Xxx</h1>
        <Button onClick={handleCreate}><Plus className="w-4 h-4 mr-2" /> Tạo mới</Button>
      </div>

      <FilterBar
        filters={filterConfigs}
        activeFilters={activeFilters}
        onFilterChange={setActiveFilters}
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Tìm kiếm..."
      />

      <DataTable
        data={items}
        columns={columns}
        totalItems={totalItems}
        pagination={pagination}
        sort={sort}
        onPaginationChange={setPagination}
        onSortChange={setSort}
        getId={(item) => item.id}
        loading={loading}
        renderActions={(item) => (
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" onClick={() => handleEdit(item)}>
              <Pencil className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(item)}>
              <Trash2 className="w-4 h-4 text-destructive" />
            </Button>
          </div>
        )}
      />

      <FormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={editingItem ? 'Chỉnh sửa' : 'Tạo mới'}
        fields={[
          { key: 'name', label: 'Tên', type: 'text', required: true },
          {
            key: 'status', label: 'Trạng thái', type: 'select',
            options: [
              { label: 'Hoạt động', value: 'Hoạt động' },
              { label: 'Ngừng', value: 'Ngừng' },
            ],
          },
        ]}
        initialData={editingItem || undefined}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Xác nhận xoá"
        description={`Bạn có chắc muốn xoá "${deleteTarget?.name}"?`}
        onConfirm={handleDelete}
        variant="destructive"
      />
    </div>
  );
}
```

---

## Template 3: Buyer List Page

> Dùng cho trang danh sách bên Buyer. Có: FilterBar + ViewToggle + DataTable (table) / CardGrid (grid).

```tsx
// /src/app/components/buyer/BuyerXxxListPage.tsx
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import type { PaginationParams, SortParams, ViewMode, ColumnConfig, FilterConfig, ActiveFilter } from '../../types';
import { DataTable } from '../shared/DataTable';
import { FilterBar } from '../shared/FilterBar';
import { ViewToggle } from '../shared/ViewToggle';
import { StatusBadge } from '../shared/StatusBadge';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Eye } from 'lucide-react';

export function BuyerXxxListPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState<YourType[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [pagination, setPagination] = useState<PaginationParams>({ page: 1, pageSize: 10 });
  const [sort, setSort] = useState<SortParams>({ field: 'createdAt', direction: 'desc' });
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const filters: Record<string, string> = {};
      if (searchTerm) filters.search = searchTerm;
      activeFilters.forEach(f => { filters[f.key] = String(f.value); });

      const res = await xxxApi.getAll(pagination, sort, filters);
      setItems(res.data);
      setTotalItems(res.total);
    } catch {
      toast.error('Lỗi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  }, [pagination, sort, searchTerm, activeFilters]);

  useEffect(() => { loadData(); }, [loadData]);

  const columns: ColumnConfig[] = [
    { key: 'name', label: 'Tên', sortable: true },
    { key: 'status', label: 'Trạng thái', sortable: true,
      render: (val: string) => <StatusBadge status={val} /> },
    { key: 'createdAt', label: 'Ngày tạo', sortable: true },
  ];

  const filterConfigs: FilterConfig[] = [
    { key: 'status', label: 'Trạng thái', type: 'select',
      options: [{ label: 'Tất cả', value: '' }] },
  ];

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1>Danh sách Xxx</h1>
        <ViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />
      </div>

      <FilterBar
        filters={filterConfigs}
        activeFilters={activeFilters}
        onFilterChange={setActiveFilters}
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
      />

      {viewMode === 'table' ? (
        <DataTable
          data={items}
          columns={columns}
          totalItems={totalItems}
          pagination={pagination}
          sort={sort}
          onPaginationChange={setPagination}
          onSortChange={setSort}
          getId={(item) => item.id}
          loading={loading}
          renderActions={(item) => (
            <Button variant="ghost" size="sm" onClick={() => navigate(`/xxx/${item.id}`)}>
              <Eye className="w-4 h-4" />
            </Button>
          )}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map(item => (
            <Card key={item.id} className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => navigate(`/xxx/${item.id}`)}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <h3>{item.name}</h3>
                  <StatusBadge status={item.status} />
                </div>
                <p className="text-muted-foreground mt-2">{item.createdAt}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
```

---

## Template 4: Buyer Detail Page

> Dùng cho trang chi tiết bên Buyer. Pattern: useParams → load → Tabs + Sections.

```tsx
// /src/app/components/buyer/BuyerXxxDetail.tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { toast } from 'sonner';
import { StatusBadge } from '../shared/StatusBadge';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ArrowLeft } from 'lucide-react';

export function BuyerXxxDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [item, setItem] = useState<YourType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    xxxApi.getById(id)
      .then(data => { if (data) setItem(data); else toast.error('Không tìm thấy'); })
      .catch(() => toast.error('Lỗi tải dữ liệu'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="container mx-auto px-4 py-6">Đang tải...</div>;
  if (!item) return <div className="container mx-auto px-4 py-6">Không tìm thấy</div>;

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4 mr-1" /> Quay lại
        </Button>
        <div className="flex-1">
          <h1>{item.name}</h1>
          <p className="text-muted-foreground">Mã: {item.id}</p>
        </div>
        <StatusBadge status={item.status} />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="info">
        <TabsList>
          <TabsTrigger value="info">Thông tin</TabsTrigger>
          <TabsTrigger value="items">Chi tiết</TabsTrigger>
          <TabsTrigger value="history">Lịch sử</TabsTrigger>
        </TabsList>

        <TabsContent value="info">
          <Card>
            <CardHeader>Thông tin chung</CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><span className="text-muted-foreground">Trạng thái:</span> {item.status}</div>
                <div><span className="text-muted-foreground">Ngày tạo:</span> {item.createdAt}</div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="items">
          {/* DataTable hoặc danh sách chi tiết */}
        </TabsContent>

        <TabsContent value="history">
          {/* Timeline / Activity log */}
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

---

## Template 5: Seller Page (CRUD)

> Tương tự Admin page nhưng trong SellerLayout. Dùng `useAuth()` để lấy `supplierId`.

```tsx
// /src/app/components/seller/SellerXxxPage.tsx
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';
// ... imports tương tự Admin template

export function SellerXxxPage() {
  const { user } = useAuth();
  const supplierId = user?.supplierId;

  // Load data lọc theo supplierId
  const loadData = useCallback(async () => {
    if (!supplierId) return;
    // const res = await xxxApi.getAll(pagination, sort, { ...filters, supplierId });
  }, [supplierId, pagination, sort, searchTerm, activeFilters]);

  // ... phần còn lại tương tự Admin template
  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Giống Admin nhưng không có admin-only controls */}
    </div>
  );
}
```

---

## Template 6: Dashboard Widget

> Dùng cho các trang Dashboard (Admin/Seller/Buyer).

```tsx
import { StatsCard } from '../shared/StatsCard';
import { AnimatedNumber } from '../shared/AnimatedNumber';
import { TrendIndicator } from '../shared/TrendIndicator';
import { DashboardWidget } from '../shared/DashboardWidget';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// === Stats Cards ===
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
  <StatsCard
    title="Tổng đơn hàng"
    value={<AnimatedNumber value={stats.totalOrders} />}
    icon={<ShoppingCart className="w-5 h-5" />}
    trend={<TrendIndicator value={stats.orderGrowth} />}
  />
</div>

// === Chart Widget ===
<DashboardWidget title="Doanh thu theo tháng">
  <ResponsiveContainer width="100%" height={300}>
    <BarChart data={chartData}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="month" />
      <YAxis />
      <Tooltip />
      <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
    </BarChart>
  </ResponsiveContainer>
</DashboardWidget>
```

---

## Template 7: Form with Validation

> Dùng FormDialog hoặc form trực tiếp trong page.

```tsx
// FormDialog fields config
const formFields = [
  { key: 'name', label: 'Tên', type: 'text' as const, required: true,
    placeholder: 'Nhập tên...' },
  { key: 'email', label: 'Email', type: 'text' as const, required: true },
  { key: 'amount', label: 'Số tiền', type: 'number' as const, required: true },
  { key: 'status', label: 'Trạng thái', type: 'select' as const,
    options: [
      { label: 'Hoạt động', value: 'Hoạt động' },
      { label: 'Ngừng', value: 'Ngừng' },
    ] },
  { key: 'categoryId', label: 'Danh mục', type: 'combobox' as const },
  { key: 'description', label: 'Mô tả', type: 'textarea' as const },
  { key: 'startDate', label: 'Ngày bắt đầu', type: 'date' as const },
];

// Submit handler with toast
const handleSubmit = async (data: Record<string, unknown>) => {
  try {
    if (editingItem) {
      await xxxApi.update(editingItem.id, data);
      toast.success('Cập nhật thành công');
    } else {
      await xxxApi.create(data);
      toast.success('Tạo mới thành công');
    }
    setDialogOpen(false);
    loadData();
  } catch {
    toast.error('Có lỗi xảy ra');
  }
};
```

---

## Template 8: DataTable Column Config

> Các loại cột thường gặp.

```tsx
const columns: ColumnConfig[] = [
  // Text cơ bản
  { key: 'name', label: 'Tên', sortable: true },

  // Số format tiền
  { key: 'amount', label: 'Số tiền', sortable: true,
    render: (val: number) => new Intl.NumberFormat('vi-VN').format(val) + ' ₫' },

  // Ngày tháng
  { key: 'createdAt', label: 'Ngày tạo', sortable: true,
    render: (val: string) => new Date(val).toLocaleDateString('vi-VN') },

  // Status badge
  { key: 'status', label: 'Trạng thái', sortable: true,
    render: (val: string) => <StatusBadge status={val} /> },

  // Boolean
  { key: 'isActive', label: 'Hoạt động', sortable: false,
    render: (val: boolean) => val ? '✓' : '✗' },

  // Cột ẩn mặc định (visible: false)
  { key: 'internalCode', label: 'Mã nội bộ', sortable: true, visible: false },

  // Cột editable
  { key: 'quantity', label: 'Số lượng', sortable: true, editable: true, type: 'number' },
];
```

---

## Template 9: Thêm Route Mới

> Quy trình 4 bước khi thêm trang mới.

### Bước 1: Tạo component file
```bash
# /src/app/components/buyer/BuyerNewPage.tsx
# hoặc /src/app/components/seller/SellerNewPage.tsx
# hoặc /src/app/components/admin/AdminNewPage.tsx
```

### Bước 2: Thêm lazy import vào routes.ts
```tsx
// Ở đầu file, trong section lazy imports phù hợp
const BuyerNewPage = lazy(() =>
  import('./components/buyer/BuyerNewPage').then(m => ({ default: m.BuyerNewPage }))
);
```

### Bước 3: Thêm route entry
```tsx
// Trong children array phù hợp (buyer/seller/admin)
{ path: 'new-path', Component: BuyerNewPage },
```

### Bước 4: Thêm menu link vào Layout
```tsx
// Trong BuyerLayout.tsx / SellerLayout.tsx / AdminLayout.tsx
// Thêm vào sidebar/navigation
{ label: 'Trang mới', href: '/new-path', icon: FileText }
```

---

## Template 10: Thêm Type + Service + Mock Data Mới

> Quy trình khi thêm entity hoàn toàn mới.

### Bước 1: Thêm type vào `/src/app/types/index.ts`
```tsx
export type NewEntityStatus = 'Bản nháp' | 'Hoạt động' | 'Đã đóng';

export interface NewEntity {
  id: string;
  name: string;
  status: NewEntityStatus;
  // ... các trường cần thiết
  createdAt: string;
  updatedAt: string;
}
```

### Bước 2: Tạo service file `/src/app/services/newEntityApi.ts`
> Sử dụng Template 1 ở trên.

### Bước 3: Tạo UI page
> Sử dụng Template 2/3/4/5 tuỳ theo portal (Admin/Buyer/Seller).

### Bước 4: Đăng ký route
> Sử dụng Template 9 ở trên.

### Bước 5: Cập nhật navigation
> Thêm link vào sidebar trong Layout component tương ứng.

---

## Lưu ý quan trọng

1. **LUÔN** kiểm tra `types/index.ts` trước khi tạo type mới (có thể đã tồn tại).
2. **LUÔN** kiểm tra `services/` trước khi tạo service (có thể đã có trong `api.ts`).
3. **LUÔN** dùng `named export` (không `default export`, trừ `App.tsx`).
4. **LUÔN** thêm `loading` state và `try/catch` cho API calls.
5. **LUÔN** dùng `toast.success()` / `toast.error()` cho feedback.
6. **LUÔN** format tiền: `Intl.NumberFormat('vi-VN').format(x) + ' ₫'`.
7. **LUÔN** format ngày: `new Date(d).toLocaleDateString('vi-VN')`.
8. **KHÔNG** hardcode text tiếng Anh — dùng tiếng Việt có dấu.

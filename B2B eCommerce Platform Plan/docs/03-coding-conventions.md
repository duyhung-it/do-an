# 03 — Quy ước Code & Patterns

> Tất cả quy ước TypeScript, React, Tailwind, Service, và patterns chuẩn
> cho sàn B2B E-Commerce. Tuân thủ Sonar, no `any`, max 2000 dòng/file.

---

## 1. TypeScript Conventions

### 1.1 Cấu hình
- **Strict mode**: `"strict": true` (bật tất cả kiểm tra).
- **No `any`**: KHÔNG dùng `any` — dùng `unknown` nếu chưa biết kiểu, rồi narrow.
- **Optional fields**: dùng `?` cho field không bắt buộc.

### 1.2 Interface vs Type
```tsx
// Dùng interface cho object shape (ưu tiên)
interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  totalAmount: number;
  createdAt: string;
  items?: OrderItem[];    // optional: dùng ?
}

// Dùng type cho union, intersection, mapped
type OrderStatus = 'Chờ xác nhận' | 'Đã xác nhận' | 'Đang giao hàng' | 'Hoàn thành' | 'Đã hủy';
type CreateOrderData = Omit<Order, 'id' | 'createdAt' | 'orderNumber'>;
```

### 1.3 Naming
| Loại | Convention | Ví dụ |
|------|-----------|-------|
| Interface | PascalCase | `interface BudgetPlan` |
| Type alias | PascalCase | `type OrderStatus` |
| Enum (dùng union thay) | PascalCase | `type UserRole = 'Người mua' \| ...` |
| Generic | Single letter/PascalCase | `<T>`, `<TItem>` |
| Import type | `import type { ... }` | `import type { Order } from '../types'` |

### 1.4 Types centralization
- Tất cả types nằm trong **`/src/app/types/index.ts`** (~2014 dòng).
- Import: `import type { Order, Product, User } from '../types'` (tự resolve `index.ts`).
- Các type chung: `PaginationParams`, `SortParams`, `PaginatedResponse<T>`, `ActiveFilter`, `ColumnConfig`, `FilterConfig`, `FormField`.

### 1.5 Shared types quan trọng
```tsx
interface PaginationParams {
  page: number;
  pageSize: number;
}

interface SortParams {
  field: string;
  direction: 'asc' | 'desc';
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

interface ActiveFilter {
  field: string;
  value: string | string[];
  label?: string;
}
```

---

## 2. Component Patterns

### 2.1 Quy tắc cơ bản
- **Function component only**: KHÔNG dùng class component.
- **Named export**: `export function OrderListPage() { ... }` — KHÔNG dùng `export default` (trừ `App.tsx`).
- **Một component chính/file**: file `OrderListPage.tsx` → export `OrderListPage`.
- **forwardRef**: `Button` và `Input` trong `/ui/` đã wrap `React.forwardRef` → dùng `ref` prop trực tiếp.

### 2.2 Props declaration
```tsx
// Inline (cho component đơn giản)
export function StatsCard({ title, value, icon }: {
  title: string;
  value: number;
  icon: React.ReactNode;
}) { ... }

// Tách interface (cho component phức tạp)
interface OrderListPageProps {
  initialFilters?: ActiveFilter[];
}
export function OrderListPage({ initialFilters }: OrderListPageProps) { ... }
```

### 2.3 File header
```tsx
// ============================================================
// Tên component — Mô tả ngắn (Nhóm/Đợt nếu có)
// Chi tiết bổ sung nếu cần
// ============================================================
```

### 2.4 Import order
```tsx
// 1. React & hooks
import { useState, useEffect, useCallback, useMemo, lazy } from 'react';

// 2. Third-party
import { useNavigate, useParams } from 'react-router';
import { toast } from 'sonner';
import { motion } from 'motion/react';

// 3. Icons (lucide-react)
import { Plus, Pencil, Trash2, Eye, Search } from 'lucide-react';

// 4. UI primitives (shadcn/ui)
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

// 5. Shared components
import { DataTable } from '../shared/DataTable';
import { FilterBar } from '../shared/FilterBar';
import { FormDialog } from '../shared/FormDialog';

// 6. Context & hooks
import { useAuth } from '../../context/AuthContext';
import { useDebounce } from '../../hooks/useDebounce';

// 7. Services & types
import { orderApi } from '../../services/api';
import type { Order, ColumnConfig, FilterConfig, ActiveFilter } from '../../types';
```

---

## 3. Tailwind Patterns

### 3.1 Quy tắc quan trọng
- **KHÔNG** dùng utility cho font-size (`text-2xl`), font-weight (`font-bold`), line-height (`leading-none`) — trừ khi user yêu cầu rõ ràng. Dùng CSS variables từ `theme.css`.
- **Page wrapper** chuẩn:
  ```tsx
  <div className="container mx-auto px-4 py-6">
    {/* Nội dung trang */}
  </div>
  ```
- **Responsive**: dùng breakpoints `sm:`, `md:`, `lg:`, `xl:` cho bố cục, **ưu tiên mobile-first**.

### 3.2 Color system
Dùng CSS variables (đã định nghĩa trong `theme.css`):
```tsx
// Đúng
className="bg-primary text-primary-foreground"
className="bg-muted text-muted-foreground"
className="border-border"
className="bg-destructive text-destructive-foreground"

// Sai — không hard-code màu
className="bg-blue-500 text-white"
```

### 3.3 Grid layouts
```tsx
// Stats cards row
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

// Two-column form
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">

// Dashboard widgets
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
```

### 3.4 Spacing convention
```tsx
// Page sections
className="space-y-6"    // Khoảng cách giữa các section

// Card nội dung
className="p-4"          // Padding trong card
className="gap-4"        // Gap giữa các item

// Header với actions
className="flex items-center justify-between mb-6"
```

---

## 4. Service Layer Pattern

### 4.1 Cấu trúc chuẩn
```tsx
// /src/app/services/xxxApi.ts
import type {
  PaginationParams, SortParams, PaginatedResponse, ActiveFilter,
  YourEntityType,
} from '../types';

const delay = (ms = 200) => new Promise(r => setTimeout(r, ms));

// Mutable in-memory array (let, không phải const)
let mockItems: YourEntityType[] = [
  { id: 'item-01', name: 'Mẫu 1', ... },
  { id: 'item-02', name: 'Mẫu 2', ... },
];

export const xxxApi = {
  /** Lấy danh sách có phân trang, sắp xếp, lọc */
  async getAll(
    pagination: PaginationParams,
    sort: SortParams,
    filters?: ActiveFilter[],
    search?: string,
  ): Promise<PaginatedResponse<YourEntityType>> {
    await delay(300);

    let result = [...mockItems];

    // Search
    if (search) {
      const s = search.toLowerCase();
      result = result.filter(i =>
        i.name.toLowerCase().includes(s) ||
        i.code?.toLowerCase().includes(s)
      );
    }

    // Filters
    if (filters?.length) {
      for (const f of filters) {
        if (f.value) {
          result = result.filter(i =>
            String((i as Record<string, unknown>)[f.field]) === f.value
          );
        }
      }
    }

    // Sort
    result.sort((a, b) => {
      const aVal = (a as Record<string, unknown>)[sort.field];
      const bVal = (b as Record<string, unknown>)[sort.field];
      const cmp = String(aVal ?? '').localeCompare(String(bVal ?? ''), 'vi');
      return sort.direction === 'asc' ? cmp : -cmp;
    });

    // Paginate
    const total = result.length;
    const start = (pagination.page - 1) * pagination.pageSize;
    const data = result.slice(start, start + pagination.pageSize);

    return {
      data,
      total,
      page: pagination.page,
      pageSize: pagination.pageSize,
      totalPages: Math.ceil(total / pagination.pageSize),
    };
  },

  /** Lấy chi tiết theo ID */
  async getById(id: string): Promise<YourEntityType | undefined> {
    await delay(200);
    return mockItems.find(i => i.id === id);
  },

  /** Tạo mới */
  async create(data: Omit<YourEntityType, 'id' | 'createdAt'>): Promise<YourEntityType> {
    await delay(300);
    const newItem: YourEntityType = {
      ...data,
      id: `item-${Date.now()}`,
      createdAt: new Date().toISOString(),
    } as YourEntityType;
    mockItems.unshift(newItem);
    return newItem;
  },

  /** Cập nhật */
  async update(id: string, data: Partial<YourEntityType>): Promise<YourEntityType> {
    await delay(300);
    const idx = mockItems.findIndex(i => i.id === id);
    if (idx < 0) throw new Error('Không tìm thấy bản ghi');
    mockItems[idx] = { ...mockItems[idx], ...data, updatedAt: new Date().toISOString() };
    return mockItems[idx];
  },

  /** Xóa */
  async remove(id: string): Promise<void> {
    await delay(200);
    mockItems = mockItems.filter(i => i.id !== id);
  },
};
```

### 4.2 Quy tắc service
- **File chính `api.ts`** đã > 2900 dòng → **KHÔNG thêm API mới** vào đây.
- Service mới → tạo file riêng `/src/app/services/xxxApi.ts`.
- Naming: `camelCase` + suffix `Api` — VD: `budgetApi`, `warrantyApi`, `slaApi`.
- Mỗi file export **1 object** chứa tất cả methods.
- Dùng `let` cho mock array (mutable), **spread copy** khi modify (`{ ...item, ...data }`).
- Delay: 200–300ms giả lập network latency.

---

## 5. DataTable Usage Pattern

### 5.1 Định nghĩa columns
```tsx
const columns: ColumnConfig[] = [
  { key: 'orderNumber', label: 'Mã đơn hàng', sortable: true },
  { key: 'buyerName', label: 'Người mua', sortable: true },
  {
    key: 'totalAmount',
    label: 'Tổng tiền',
    sortable: true,
    render: (item: Order) => (
      <span>{item.totalAmount.toLocaleString('vi-VN')} VNĐ</span>
    ),
  },
  {
    key: 'status',
    label: 'Trạng thái',
    sortable: true,
    render: (item: Order) => <StatusBadge status={item.status} />,
  },
  { key: 'createdAt', label: 'Ngày tạo', sortable: true },
  // visible: nếu không khai báo → mặc định hiển thị (true)
  { key: 'notes', label: 'Ghi chú', visible: false },  // ẩn mặc định
];
```

### 5.2 State cần thiết
```tsx
const [data, setData] = useState<Order[]>([]);
const [totalItems, setTotalItems] = useState(0);
const [loading, setLoading] = useState(true);
const [pagination, setPagination] = useState<PaginationParams>({ page: 1, pageSize: 10 });
const [sort, setSort] = useState<SortParams>({ field: 'createdAt', direction: 'desc' });
const [searchTerm, setSearchTerm] = useState('');
const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([]);

const debouncedSearch = useDebounce(searchTerm, 300);
```

### 5.3 Data fetching
```tsx
const fetchData = useCallback(async () => {
  setLoading(true);
  try {
    const res = await orderApi.getAll(pagination, sort, activeFilters, debouncedSearch);
    setData(res.data);
    setTotalItems(res.total);
  } catch {
    toast.error('Không thể tải dữ liệu');
  } finally {
    setLoading(false);
  }
}, [pagination, sort, activeFilters, debouncedSearch]);

useEffect(() => { fetchData(); }, [fetchData]);
```

### 5.4 Render
```tsx
<DataTable
  data={data}
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
      <Button variant="ghost" size="sm" onClick={() => handleView(item)}>
        <Eye className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="sm" onClick={() => handleEdit(item)}>
        <Pencil className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="sm" onClick={() => handleDelete(item)}>
        <Trash2 className="h-4 w-4 text-destructive" />
      </Button>
    </div>
  )}
/>
```

**Lưu ý**: Dùng `renderActions` — KHÔNG phải `actions`.

---

## 6. Form Pattern

### 6.1 FormDialog chuẩn
```tsx
const formFields: FormField[] = [
  { key: 'name', label: 'Tên', type: 'text', required: true },
  { key: 'email', label: 'Email', type: 'text', required: true },
  {
    key: 'status',
    label: 'Trạng thái',
    type: 'select',
    options: [
      { value: 'Hoạt động', label: 'Hoạt động' },
      { value: 'Tạm khóa', label: 'Tạm khóa' },
    ],
  },
  { key: 'notes', label: 'Ghi chú', type: 'textarea' },
  {
    key: 'categoryId',
    label: 'Danh mục',
    type: 'combobox',   // CategoryCombobox integration
  },
];

<FormDialog
  open={dialogOpen}
  onOpenChange={setDialogOpen}
  title={editingItem ? 'Chỉnh sửa' : 'Tạo mới'}
  fields={formFields}
  initialData={editingItem ?? undefined}
  onSubmit={handleSubmit}
/>
```

### 6.2 Submit handler
```tsx
const handleSubmit = async (formData: Record<string, unknown>) => {
  try {
    if (editingItem) {
      await xxxApi.update(editingItem.id, formData);
      toast.success('Cập nhật thành công');
    } else {
      await xxxApi.create(formData);
      toast.success('Tạo mới thành công');
    }
    setDialogOpen(false);
    setEditingItem(null);
    fetchData();  // refresh list
  } catch {
    toast.error('Có lỗi xảy ra');
  }
};
```

### 6.3 Inline editing
DataTable hỗ trợ `onInlineEdit` callback:
```tsx
<DataTable
  ...
  onInlineEdit={async (id, field, value) => {
    await xxxApi.update(id, { [field]: value });
    toast.success('Đã lưu');
    fetchData();
  }}
/>
```

---

## 7. Error Handling

### 7.1 Toast notifications (Sonner)
```tsx
import { toast } from 'sonner';

// Thành công
toast.success('Đã tạo đơn hàng thành công');

// Lỗi
toast.error('Không thể tải dữ liệu');

// Cảnh báo / Thông tin
toast.info('Đang xử lý...');
toast.warning('Phiên đăng nhập sắp hết hạn');
```

### 7.2 Pattern try/catch trong service calls
```tsx
// Trong useEffect / useCallback
try {
  const res = await xxxApi.getAll(pagination, sort);
  setData(res.data);
} catch (error) {
  toast.error('Không thể tải dữ liệu');
  console.error('Fetch error:', error);
}
```

### 7.3 Toast with Undo (cho delete)
```tsx
import { toastWithUndo } from '../../utils/toastWithUndo';

const handleDelete = (item: Order) => {
  // Xóa trước
  xxxApi.remove(item.id);
  fetchData();

  // Toast với hoàn tác 5s
  toastWithUndo('Đã xóa đơn hàng', async () => {
    await xxxApi.create(item);  // restore
    fetchData();
  });
};
```

### 7.4 ErrorBoundary
```tsx
// Wrap lazy-loaded routes
<Suspense fallback={<PageSkeleton />}>
  <ErrorBoundary>
    <LazyPage />
  </ErrorBoundary>
</Suspense>
```

---

## 8. Performance Patterns

### 8.1 Code splitting — React.lazy
Tất cả page components đều lazy load:
```tsx
// routes.ts
const BuyerDashboardPage = lazy(() =>
  import('./components/buyer/BuyerDashboardPage')
    .then(m => ({ default: m.BuyerDashboardPage }))
);
```
> Vì dùng named export, cần `.then(m => ({ default: m.ComponentName }))`.

### 8.2 useDebounce
```tsx
import { useDebounce } from '../../hooks/useDebounce';

const [searchTerm, setSearchTerm] = useState('');
const debouncedSearch = useDebounce(searchTerm, 300);

// Dùng debouncedSearch trong useEffect dependency
useEffect(() => {
  fetchData();
}, [debouncedSearch, pagination, sort]);
```

### 8.3 API Cache (localStorage + TTL)
```tsx
import { getCache, setCache, withCache } from '../../utils/apiCache';

// Cách 1: Manual
const cached = getCache<Product[]>('products_list');
if (cached) return cached;
const data = await fetchFromApi();
setCache('products_list', data, 5 * 60 * 1000);  // TTL 5 phút

// Cách 2: Wrapper withCache
const data = await withCache('products_list', () => fetchFromApi(), 300000);
```

### 8.4 withRetry
```tsx
import { withRetry } from '../../utils/withRetry';

// Tự động retry 3 lần, exponential backoff (200ms, 400ms, 800ms)
const data = await withRetry(() => xxxApi.getAll(pagination, sort));
```

### 8.5 Memoization
```tsx
// useMemo cho computed values
const totalAmount = useMemo(() =>
  items.reduce((sum, i) => sum + i.totalPrice, 0),
  [items]
);

// useCallback cho event handlers truyền xuống child
const handleSelect = useCallback((id: string) => {
  setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
}, []);
```

---

## 9. File Size Rules

### 9.1 Giới hạn
- **Max 2000 dòng/file** (quy tắc cứng).
- File `api.ts` hiện > 2900 dòng → **ngoại lệ lịch sử**, KHÔNG thêm mới.
- File `types/index.ts` hiện ~2014 dòng → gần giới hạn, cân nhắc tách.

### 9.2 Chiến lược tách file khi quá dài

| Loại | Cách tách |
|------|----------|
| **Service** | Tạo file riêng `/services/xxxApi.ts` (đã áp dụng cho 20 service) |
| **Component** | Tách sub-components ra file riêng trong cùng thư mục |
| **Types** | Tách theo domain: `types/order.ts`, `types/product.ts` (tương lai) |
| **Mock data** | Tách ra `/data/mockXxx.ts` riêng |
| **Utils** | Mỗi utility 1 file riêng (đã làm: `apiCache.ts`, `withRetry.ts`, ...) |

### 9.3 Checklist khi tạo file mới
1. File có header comment mô tả chức năng.
2. Import types dùng `import type { ... }`.
3. Export named (không default).
4. Service API: delay mock, CRUD methods, return `PaginatedResponse<T>`.
5. Component: đủ FilterBar + DataTable + FormDialog + ConfirmDialog nếu là trang CRUD.

---

## 10. Known Technical Debt & Workarounds

### 10.1 File quá dài
| File | Dòng | Tình trạng |
|------|------|-----------|
| `/services/api.ts` | ~2900+ | Lịch sử, chứa 30 APIs. **Không thêm mới**. Tương lai sẽ tách dần. |
| `/types/index.ts` | ~2014 | Gần giới hạn. Tương lai cần tách theo domain. |

### 10.2 Chức năng chưa implement
- **B22.03–B22.05**: Link "Tài liệu đính kèm" trên `ContractDetail`, `InvoiceDetail`, `OrderDetail` — chưa implement, sẽ bổ sung sau.

### 10.3 Naming inconsistencies
| Vấn đề | Giải pháp |
|--------|----------|
| `AuthUser.companyName` vs `company` | Luôn dùng `companyName` — KHÔNG dùng `company` |
| `ReportFilter` vs `ReportBuilderFilter` | `ReportFilter` (cũ, cho SellerReports) · `ReportBuilderFilter` (mới, cho ReportBuilder) |
| `sellerId` vs `supplierId` | Đôi chỗ không nhất quán — cần review thêm |

### 10.4 Package constraints
- **react-router**: Dùng `react-router` (data mode) — KHÔNG dùng `react-router-dom`.
- **react-hook-form**: Phải cài version `7.55.0` cụ thể.
- **motion**: Import `import { motion } from 'motion/react'` — tên gói là `motion`, KHÔNG phải `framer-motion`.
- **konva**: KHÔNG hỗ trợ trong môi trường này — dùng Canvas API trực tiếp.

### 10.5 Responsive gaps
- Đa số trang đã responsive (mobile-first) sau các đợt UI upgrade.
- Một số trang detail phức tạp (Analytics, Reports) có thể chưa tối ưu hoàn toàn trên mobile nhỏ (<375px).

---

## Tài liệu liên quan

- [01-system-overview.md](./01-system-overview.md) — Tổng quan hệ thống
- [02-architecture.md](./02-architecture.md) — Kiến trúc & Diagrams
- [33-code-templates.md](./33-code-templates.md) — Code Templates (chi tiết hơn)
- [32-vibe-coding-context.md](./32-vibe-coding-context.md) — AI Vibe Coding Context

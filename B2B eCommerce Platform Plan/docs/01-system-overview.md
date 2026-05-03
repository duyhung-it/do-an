# 01 — Tổng quan hệ thống

> Sàn Thương mại Điện tử B2B — tài liệu tổng quan dành cho developer & AI vibe coding.

---

## 1. Giới thiệu dự án

| Mục | Nội dung |
|-----|----------|
| **Tên hệ thống** | Sàn Thương mại Điện tử B2B (B2B E-Commerce Marketplace) |
| **Mục tiêu** | Kết nối doanh nghiệp mua – bán (Buyer – Seller) trên một nền tảng trực tuyến. Hỗ trợ toàn bộ vòng đời mua hàng: tìm kiếm → RFQ → báo giá → hợp đồng → đặt hàng → thanh toán → giao hàng → bảo hành. |
| **Đối tượng sử dụng** | **Người mua (Buyer)** — doanh nghiệp cần mua nguyên liệu, vật tư, hàng hóa số lượng lớn. **Nhà cung cấp (Seller)** — doanh nghiệp sản xuất/phân phối. **Quản trị viên (Admin)** — vận hành & giám sát sàn. |
| **Phạm vi** | Frontend SPA (React) với mock service layer; sẵn sàng chuyển sang Supabase backend. |
| **Tham chiếu** | Alibaba.com, Made-in-China, 1688.com — mô hình sàn B2B. |

---

## 2. Tech Stack

| Layer | Công nghệ | Phiên bản | Ghi chú |
|-------|-----------|-----------|---------|
| UI Library | React | 18.3.1 | Function components only |
| Language | TypeScript | strict mode | Không dùng `any` |
| Styling | Tailwind CSS | 4.1.12 | v4, CSS variables, custom theme |
| Routing | react-router | 7.13.0 | **Data mode** — KHÔNG dùng `react-router-dom` |
| Charts | Recharts | 2.15.2 | BarChart, LineChart, PieChart, AreaChart |
| Icons | lucide-react | 0.487.0 | 1500+ icons |
| UI Primitives | shadcn/ui (Radix) | multiple | 48 components |
| Animation | Motion | 12.23.24 | `import { motion } from 'motion/react'` |
| Toast | Sonner | 2.0.3 | `import { toast } from 'sonner'` |
| Forms | react-hook-form | 7.55.0 | FormDialog wrapper |
| Date | date-fns | 3.6.0 | Format & parse |
| Drag & Drop | react-dnd | 16.0.1 | HTML5 backend |
| Build | Vite | 6.3.5 | HMR, code splitting |
| MUI | @mui/material | 7.3.5 | Bổ trợ (ít dùng) |

---

## 3. Cấu trúc thư mục dự án

```
/src
├── app/
│   ├── App.tsx                    ← Entry point (default export)
│   ├── routes.ts                  ← React Router config (~292 dòng)
│   ├── components/
│   │   ├── admin/      (19 files) ← Admin pages & layout
│   │   ├── auth/       (3 files)  ← Login, Register, AuthLayout
│   │   ├── buyer/      (51 files) ← Buyer pages & layout
│   │   ├── figma/      (1 file)   ← ImageWithFallback (protected)
│   │   ├── seller/     (38 files) ← Seller pages & layout
│   │   ├── shared/     (39 files) ← Shared components (DataTable, FilterBar, ...)
│   │   └── ui/         (48 files) ← shadcn/ui primitives
│   ├── context/        (4 files)  ← Auth, Cart, Wishlist, Notification
│   ├── data/           (2 files)  ← Mock data (mockData.ts, mockAdminData.ts)
│   ├── hooks/          (1 file)   ← useDebounce
│   ├── services/       (21 files) ← Service layer (API mock)
│   ├── types/          (1 file)   ← types/index.ts (~2014 dòng)
│   └── utils/          (5 files)  ← Utilities (export, cache, retry, ...)
├── imports/                       ← Figma imported SVGs
├── styles/
│   ├── fonts.css                  ← Font imports
│   ├── index.css                  ← Global styles
│   ├── tailwind.css               ← Tailwind imports
│   └── theme.css                  ← CSS variables (colors, spacing, ...)
└── docs/                          ← Tài liệu thiết kế hệ thống
```

**Tổng**: ~199 component files + 21 service files + 5 utils + 4 contexts + 1 hook + 2 mock data.

---

## 4. Quy ước đặt tên

| Loại | Convention | Ví dụ |
|------|-----------|-------|
| File component | PascalCase `.tsx` | `BuyerDashboardPage.tsx`, `DataTable.tsx` |
| File service | camelCase + `Api` suffix `.ts` | `budgetApi.ts`, `warrantyApi.ts` |
| File utility | camelCase `.ts` | `exportUtils.ts`, `apiCache.ts` |
| Component name | PascalCase (named export) | `export function BuyerDashboardPage()` |
| Service object | camelCase + `Api` suffix | `export const budgetApi = { ... }` |
| Type / Interface | PascalCase | `interface Order`, `type OrderStatus` |
| CSS variable | kebab-case | `--primary`, `--muted-foreground` |
| Route path | kebab-case | `/price-agreements`, `/seller/debit-credit` |
| Mock data array | camelCase + `mock` prefix | `let mockOrders: Order[]` |
| ID format | entity prefix + timestamp/uuid | `ord-001`, `prod-123`, `user-xxx` |

> **Quan trọng**: Dùng **named export** cho tất cả components (KHÔNG dùng `default export`, trừ `App.tsx`).

---

## 5. Pattern chung

### 5.1 Page Wrapper
```tsx
<div className="container mx-auto px-4 py-6">
  {/* Nội dung trang */}
</div>
```

### 5.2 DataTable Pattern
```tsx
<DataTable
  data={items}
  columns={columns}              // ColumnConfig[]
  totalItems={totalItems}        // number (tổng số bản ghi)
  pagination={pagination}        // { page, pageSize }
  sort={sort}                    // { field, direction }
  onPaginationChange={setPagination}
  onSortChange={setSort}
  getId={(item) => item.id}      // Lấy unique key
  renderActions={(item) => (...)} // KHÔNG dùng prop "actions"
  loading={loading}              // optional
/>
```

- `ColumnConfig`: cột không khai báo `visible` → mặc định hiển thị.
- `render` function: `{ key: 'status', render: (val) => <StatusBadge status={val} /> }`.
- Hỗ trợ inline edit, column toggle, multi-select.

### 5.3 FilterBar Pattern
```tsx
<FilterBar
  filters={filterConfigs}        // FilterConfig[]
  activeFilters={activeFilters}  // ActiveFilter[]
  onFilterChange={setActiveFilters}
  searchValue={searchTerm}
  onSearchChange={setSearchTerm}
  searchPlaceholder="Tìm kiếm..."
/>
```

### 5.4 FormDialog Pattern
```tsx
<FormDialog
  open={open}
  onOpenChange={setOpen}
  title="Tạo mới / Chỉnh sửa"
  fields={formFields}            // FormField[]
  initialData={editingItem}
  onSubmit={handleSubmit}
/>
```

### 5.5 StatusBadge Pattern
```tsx
<StatusBadge status="Đã duyệt" />   // Auto color mapping
<StatusBadge status="Từ chối" />
<StatusBadge status="Đang giao hàng" />
```

---

## 6. State Management

| Context | Dữ liệu | Lưu trữ | Scope |
|---------|----------|---------|-------|
| **AuthContext** | `user: AuthUser`, `isAuthenticated`, `login()`, `logout()` | localStorage (token) | Toàn app |
| **CartContext** | `items: CartItem[]`, `addToCart()`, `removeFromCart()`, `updateQty()`, `clearCart()` | Memory (mock) | Buyer |
| **WishlistContext** | `items: WishlistItem[]`, `folders: WishlistFolder[]`, `add/remove/move()` | Memory (mock) | Buyer |
| **NotificationContext** | `notifications: AppNotification[]`, `unreadCount`, `markAsRead()`, `markAllAsRead()` | Memory (mock) | Toàn app |

**Data flow**: Page Component → `useState` / `useEffect` → `serviceApi.method()` → mock data (in-memory array) → `setState` → render.

Không dùng Redux, Zustand hay state manager bên ngoài. Mỗi page tự quản lý local state.

---

## 7. Routing Architecture

### 7.1 React Router Data Mode
```tsx
// App.tsx
import { RouterProvider } from 'react-router';
import { router } from './routes';
export default function App() {
  return <RouterProvider router={router} />;
}

// routes.ts
import { createBrowserRouter } from 'react-router';
const router = createBrowserRouter([...]);
```

### 7.2 Cấu trúc Route

```
/ → BuyerLayout (public wrapper)
  ├── / (HomePage — public)
  ├── /products, /products/:id (public)
  ├── /suppliers, /suppliers/:id (public)
  ├── /login, /register → AuthLayout
  └── BuyerGuard (auth required, role = Người mua)
      ├── /dashboard
      ├── /cart, /orders, /orders/:id
      ├── /rfq, /rfq/new, /rfq/:id
      ├── /contracts, /contracts/:id
      ├── /payments, /invoices, /shipments, ...
      └── ... (48+ protected routes)

/seller → SellerGuard → SellerLayout
  ├── / (SellerDashboard)
  ├── /products, /orders, /rfq, /contracts, /warehouse, ...
  └── ... (35+ routes)

/admin → AdminGuard → AdminLayout
  ├── / (AdminDashboard)
  ├── /users, /suppliers, /categories, /products, /orders, ...
  └── ... (17+ routes)
```

### 7.3 Guards
- **BuyerGuard**: Check `user.role === 'Người mua'` → redirect `/login` nếu không đủ quyền.
- **SellerGuard**: Check `user.role === 'Nhà cung cấp'`.
- **AdminGuard**: Check `user.role === 'Quản trị viên'`.

### 7.4 Lazy Loading
Tất cả page components đều dùng `React.lazy`:
```tsx
const BuyerDashboardPage = lazy(() =>
  import('./components/buyer/BuyerDashboardPage').then(m => ({ default: m.BuyerDashboardPage }))
);
```

---

## 8. Service Layer Architecture

### 8.1 Mock API Pattern
```tsx
const delay = (ms: number) => new Promise(r => setTimeout(r, ms));
let mockItems: YourType[] = [...];  // Mutable in-memory array

export const xxxApi = {
  async getAll(pagination, sort, filters?): Promise<PaginatedResponse<T>> {
    await delay(300);
    // filter → sort → paginate → return
  },
  async getById(id): Promise<T | undefined> { ... },
  async create(data): Promise<T> { ... },
  async update(id, data): Promise<T> { ... },
  async remove(id): Promise<void> { ... },
};
```

### 8.2 Phân bổ Service

**`api.ts` (file chính, > 2900 dòng — KHÔNG thêm mới)**:
`authApi`, `userApi`, `categoryApi`, `productApi`, `orderApi`, `rfqApi`, `quotationApi`, `contractApi`, `warehouseApi`, `inventoryApi`, `stockMovementApi`, `stockAlertApi`, `shipmentApi`, `paymentApi`, `invoiceSellerApi`, `invoiceBuyerApi`, `staffApi`, `promotionApi`, `certificateApi`, `chatApi`, `notificationApi`, `reviewApi`, `supplierReviewApi`, `cartApi`, `wishlistApi`, `orderTemplateApi`, `approvalApi`, `returnApi`, `creditApi`, `supplierApi`.

**Service files riêng** (20 files trong `/src/app/services/`):
`adminApi`, `analyticsApi`, `auctionApi`, `budgetApi`, `buyerDashboardApi`, `debitCreditApi`, `documentApi`, `grnApi`, `integrationApi`, `loyaltyApi`, `orderStatusHistoryApi`, `prApi`, `priceAgreementApi`, `productImageApi`, `reportBuilderApi`, `rfqAttachmentApi`, `slaApi`, `supplierCategoryApi`, `warehouseTransferApi`, `warrantyApi`.

### 8.3 Migration Strategy (tương lai)
| Mock | → Supabase |
|------|-----------|
| `await delay(300)` | `await supabase.from('table').select()` |
| `let mockArray` | PostgreSQL table |
| `localStorage` | Supabase Auth session |
| In-memory filter | `.eq()`, `.ilike()`, `.order()` |
| `mockArray.push()` | `.insert()` |
| `mockArray[idx] = ...` | `.update().eq('id', id)` |

---

## 9. Shared Components Library

39 shared components trong `/src/app/components/shared/`:

| # | Component | Mô tả |
|---|-----------|--------|
| 1 | **DataTable** | Bảng dữ liệu: sort, pagination, inline edit, column toggle, multi-select |
| 2 | **FilterBar** | Thanh lọc + tìm kiếm (text, select, multiSelect, range, date) |
| 3 | **FormDialog** | Dialog form CRUD (text, number, select, textarea, date, combobox) |
| 4 | **CategoryCombobox** | Combobox danh mục sản phẩm (tree, search, single/multi) |
| 5 | **StatusBadge** | Badge trạng thái (auto color mapping theo giá trị) |
| 6 | **ViewToggle** | Chuyển chế độ xem (table / grid / list) |
| 7 | **DashboardWidget** | Wrapper cho widget dashboard (title, actions) |
| 8 | **StatsCard** | Card thống kê (icon, value, trend, description) |
| 9 | **AnimatedNumber** | Số chạy animation khi mount/update |
| 10 | **TrendIndicator** | Mũi tên tăng/giảm + phần trăm |
| 11 | **ProgressRing** | Vòng tiến độ SVG |
| 12 | **IconWrapper** | Wrapper icon có background & size variants |
| 13 | **ConfirmDialog** | Dialog xác nhận (danger mode, custom messages) |
| 14 | **ImportDialog** | Dialog import file (upload, preview, validate) |
| 15 | **EmptyState** | Trạng thái trống (icon + message + action button) |
| 16 | **ErrorBoundary** | React error boundary |
| 17 | **LoadingOverlay** | Loading toàn trang / section |
| 18 | **PageSkeleton** | Skeleton loading animation |
| 19 | **PageTransition** | Hiệu ứng chuyển trang (Motion) |
| 20 | **InlineAlert** | Alert inline (info / warning / error / success) |
| 21 | **AppBreadcrumb** | Breadcrumb navigation |
| 22 | **AvatarGroup** | Nhóm avatar (+N overflow) |
| 23 | **NotificationDropdown** | Dropdown thông báo (header) |
| 24 | **NotificationCenterPage** | Trang trung tâm thông báo |
| 25 | **CommandPalette** | Cmd+K palette (search, navigate) |
| 26 | **SearchSuggestions** | Gợi ý tìm kiếm real-time |
| 27 | **MobileBottomNav** | Thanh nav dưới mobile |
| 28 | **ChatPage** | Trang chat (shared buyer/seller) |
| 29 | **DocumentCenterPage** | Trung tâm tài liệu |
| 30 | **IntegrationHubPage** | Hub tích hợp (ERP, CRM, ...) |
| 31 | **ReportBuilderPage** | Báo cáo tùy chỉnh (drag columns, chart types) |
| 32 | **ReviewComponents** | Components đánh giá (shared) |
| 33 | **NotFoundPage** | Trang 404 |
| 34 | **ProtectedRoute** | Route bảo vệ (auth check) |
| 35 | **ScrollToTop** | Auto scroll top khi route change |
| 36 | **ScrollToTopButton** | Nút scroll lên (floating) |
| 37 | **OfflineIndicator** | Hiển thị offline status |
| 38 | **SkipLink** | Accessibility skip navigation |
| 39 | **KeyboardShortcuts** | Phím tắt toàn cục |

---

## 10. UI Components (shadcn/ui)

48 UI primitives trong `/src/app/components/ui/`:

**Layout**: `card`, `separator`, `aspect-ratio`, `resizable`, `scroll-area`, `sidebar`

**Navigation**: `breadcrumb`, `dropdown-menu`, `context-menu`, `menubar`, `navigation-menu`, `pagination`, `tabs`

**Form**: `button` ✓forwardRef, `input` ✓forwardRef, `textarea`, `label`, `checkbox`, `radio-group`, `select`, `switch`, `slider`, `toggle`, `toggle-group`, `calendar`, `form`, `input-otp`, `command`

**Feedback**: `alert`, `alert-dialog`, `dialog`, `drawer`, `sheet`, `popover`, `tooltip`, `hover-card`, `sonner`, `progress`, `skeleton`

**Data Display**: `avatar`, `badge`, `table`, `accordion`, `collapsible`, `carousel`, `chart`

**Utility**: `use-mobile` (hook), `utils` (cn, clsx)

> **Lưu ý**: `Button` và `Input` đã wrap bằng `React.forwardRef` — có thể dùng `ref` prop trực tiếp.

---

## Tài liệu liên quan

- [02-architecture.md](./02-architecture.md) — Kiến trúc & Diagrams
- [03-coding-conventions.md](./03-coding-conventions.md) — Quy ước code
- [32-vibe-coding-context.md](./32-vibe-coding-context.md) — AI Vibe Coding Context
- [33-code-templates.md](./33-code-templates.md) — Code Templates

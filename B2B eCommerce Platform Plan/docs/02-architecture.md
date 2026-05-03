# 02 — Kiến trúc hệ thống & Diagrams

> Sơ đồ kiến trúc, module, routing, data flow, authentication, notification, cart/checkout,
> service dependency, và chiến lược migration sang Supabase.

---

## 1. Kiến trúc tổng thể

```
┌─────────────────────────────────────────────────────────┐
│                       BROWSER                           │
│  ┌───────────────────────────────────────────────────┐  │
│  │              React SPA (Vite build)               │  │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌────────┐  │  │
│  │  │  Buyer  │ │ Seller  │ │  Admin  │ │ Shared │  │  │
│  │  │ Portal  │ │ Portal  │ │ Portal  │ │  Comp. │  │  │
│  │  └────┬────┘ └────┬────┘ └────┬────┘ └───┬────┘  │  │
│  │       │           │           │           │       │  │
│  │  ┌────┴───────────┴───────────┴───────────┴────┐  │  │
│  │  │           Context Layer                     │  │  │
│  │  │  AuthContext · CartContext · WishlistContext  │  │  │
│  │  │  NotificationContext                         │  │  │
│  │  └──────────────────┬──────────────────────────┘  │  │
│  │                     │                             │  │
│  │  ┌──────────────────┴──────────────────────────┐  │  │
│  │  │           Service Layer (Mock API)          │  │  │
│  │  │  api.ts (30 APIs) + 20 file riêng xxxApi.ts │  │  │
│  │  └──────────────────┬──────────────────────────┘  │  │
│  │                     │                             │  │
│  │  ┌──────────────────┴──────────────────────────┐  │  │
│  │  │        Mock Data (In-memory arrays)         │  │  │
│  │  │  mockData.ts · mockAdminData.ts · let arrays │  │  │
│  │  └─────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────┘  │
│                           │                             │
│                     (Tương lai)                         │
│                           ▼                             │
│  ┌───────────────────────────────────────────────────┐  │
│  │              Supabase Backend                     │  │
│  │  Auth · PostgreSQL · Storage · Realtime · Edge Fn │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

## 2. Sơ đồ module — 3 Portals + Shared

```mermaid
graph TB
  subgraph APP["React App"]
    subgraph BUYER["Buyer Portal (~51 trang)"]
      B_PUB["Public: Home, Products, Suppliers"]
      B_AUTH["Protected: Dashboard, Orders, RFQ, Contracts,<br/>Payments, Invoices, Cart, Wishlist, PR, GRN,<br/>Budget, Auctions, PriceAgreements, Returns,<br/>Warranty, Loyalty, Analytics, Team, ..."]
    end
    subgraph SELLER["Seller Portal (~38 trang)"]
      S_PAGES["Dashboard, Products, Orders, RFQ, Contracts,<br/>Warehouse, Shipments, Payments, Invoices,<br/>Staff, Promotions, Approvals, Returns, Credits,<br/>DebitCredit, Auctions, PriceAgreements, SLA,<br/>Warranty, Reviews, Reports, Activity, ..."]
    end
    subgraph ADMIN["Admin Portal (~19 trang)"]
      A_PAGES["Dashboard, Users, Suppliers, Categories,<br/>Products, Orders, Shipments, Payments,<br/>Invoices, Promotions, Certificates,<br/>Reviews, RFQ, Contracts, Settings,<br/>Reports, ActivityLog"]
    end
    subgraph SHARED["Shared (~39 components)"]
      S_COMP["DataTable, FilterBar, FormDialog,<br/>CategoryCombobox, StatusBadge, ViewToggle,<br/>DashboardWidget, StatsCard, ChatPage,<br/>NotificationCenter, DocumentCenter,<br/>ReportBuilder, IntegrationHub, ..."]
    end
  end

  BUYER --> SHARED
  SELLER --> SHARED
  ADMIN --> SHARED
```

**Số lượng trang thực tế (từ routes.ts)**:
- Buyer: 6 public + 45 protected = **51 routes**
- Seller: **37 routes** (tất cả protected)
- Admin: **17 routes** (tất cả protected)
- Auth: **2 routes** (login, register)
- **Tổng: 107 routes** + 1 not-found

---

## 3. Sơ đồ Routing Hierarchy

```mermaid
flowchart TB
  ROOT["createBrowserRouter"]

  ROOT --> AUTH_LAYOUT["AuthLayout"]
  AUTH_LAYOUT --> LOGIN["/login → LoginPage"]
  AUTH_LAYOUT --> REGISTER["/register → RegisterPage"]

  ROOT --> BUYER_LAYOUT["/ → BuyerLayout"]
  BUYER_LAYOUT --> HOME["/ → HomePage 🌐"]
  BUYER_LAYOUT --> PRODS["/products → ProductListPage 🌐"]
  BUYER_LAYOUT --> PROD_ID["/products/:id → ProductDetailPage 🌐"]
  BUYER_LAYOUT --> PROD_CMP["/products/compare → ProductComparePage 🌐"]
  BUYER_LAYOUT --> SUPPS["/suppliers → SupplierListPage 🌐"]
  BUYER_LAYOUT --> SUPP_ID["/suppliers/:id → SupplierDetailPage 🌐"]
  BUYER_LAYOUT --> BG["BuyerGuard 🔒"]
  BG --> DASH["/dashboard"]
  BG --> CART["/cart"]
  BG --> ORDERS["/orders, /orders/:id"]
  BG --> RFQ["/rfq, /rfq/new, /rfq/:id"]
  BG --> CONTR["/contracts, /contracts/:id"]
  BG --> SHIP["/shipments, /shipments/:id"]
  BG --> PAY["/payments, /payments/:id"]
  BG --> INV["/invoices, /invoices/:id"]
  BG --> MORE["... +28 routes nữa"]

  ROOT --> SG["SellerGuard 🔒"]
  SG --> SL["/seller → SellerLayout"]
  SL --> SD["/seller → SellerDashboard"]
  SL --> SP["/seller/products, /new, /:id"]
  SL --> SO["/seller/orders, /:id"]
  SL --> SR["/seller/rfq, /:id"]
  SL --> SC["/seller/contracts, /:id"]
  SL --> SW["/seller/warehouse"]
  SL --> SMORE["... +28 routes nữa"]

  ROOT --> AG["AdminGuard 🔒"]
  AG --> AL["/admin → AdminLayout"]
  AL --> AD["/admin → AdminDashboard"]
  AL --> AU["/admin/users"]
  AL --> AS["/admin/suppliers"]
  AL --> AC["/admin/categories"]
  AL --> AMORE["... +12 routes nữa"]

  style HOME fill:#e0f7fa
  style PRODS fill:#e0f7fa
  style PROD_ID fill:#e0f7fa
  style PROD_CMP fill:#e0f7fa
  style SUPPS fill:#e0f7fa
  style SUPP_ID fill:#e0f7fa
```

> 🌐 = Public (không cần đăng nhập) · 🔒 = Protected (cần auth + đúng role)

---

## 4. Data flow cho 1 trang điển hình

Ví dụ: **OrderListPage** (Buyer)

```
┌──────────────────────────────────────────────────────────┐
│ OrderListPage                                            │
│                                                          │
│  useState:                                               │
│    orders[], totalItems, pagination, sort,                │
│    searchTerm, activeFilters, loading                    │
│                                                          │
│  useEffect([pagination, sort, searchTerm, filters])      │
│    │                                                     │
│    ▼                                                     │
│  orderApi.getOrders(pagination, sort, filters)           │
│    │                                                     │
│    ▼ (await delay 300ms)                                 │
│  Mock: filter mockOrders → sort → paginate               │
│    │                                                     │
│    ▼                                                     │
│  PaginatedResponse<Order> { data, total, page, ... }     │
│    │                                                     │
│    ▼                                                     │
│  setOrders(data), setTotalItems(total)                   │
│    │                                                     │
│    ▼                                                     │
│  ┌────────────────────────────────────────────────┐      │
│  │ FilterBar (search + status + date filters)     │      │
│  ├────────────────────────────────────────────────┤      │
│  │ DataTable                                      │      │
│  │   columns: [orderNumber, buyer, total, status] │      │
│  │   renderActions: (order) => View/Edit/Delete   │      │
│  │   pagination + sort controls                   │      │
│  └────────────────────────────────────────────────┘      │
└──────────────────────────────────────────────────────────┘
```

---

## 5. Component hierarchy — OrderOverview (Admin, trang phức tạp)

```
OrderOverview
├── <div className="container mx-auto px-4 py-6">
│   ├── Header (title + stats)
│   │   └── StatsCard × 4 (Tổng, Chờ xử lý, Đang giao, Hoàn thành)
│   ├── FilterBar
│   │   ├── Search (order number, buyer)
│   │   ├── Filter: Status (select)
│   │   ├── Filter: Date range
│   │   └── Filter: Supplier
│   ├── ViewToggle (table / grid)
│   ├── DataTable
│   │   ├── ColumnConfig[] (8-10 columns, sortable)
│   │   ├── renderActions → View / Edit status / Delete
│   │   ├── Pagination (page, pageSize)
│   │   └── Sort (field, direction)
│   ├── FormDialog (edit order status)
│   │   └── FormField[] (status select, note textarea)
│   ├── StatusBadge (per row)
│   └── ConfirmDialog (delete confirmation)
```

---

## 6. Authentication flow

```mermaid
sequenceDiagram
  participant U as User (Browser)
  participant LP as LoginPage
  participant AC as AuthContext
  participant API as authApi
  participant LS as localStorage

  U->>LP: Nhập email + password
  LP->>AC: login({ email, password })
  AC->>API: authApi.login(credentials)
  API->>API: Validate mock user
  API-->>AC: AuthUser { id, name, role, ... }
  AC->>LS: setItem('b2b_auth_user', JSON)
  AC->>AC: setUser(authUser)
  AC-->>LP: return AuthUser
  LP->>U: redirect theo role

  Note over U,LS: Khi reload trang
  U->>AC: AuthProvider mount
  AC->>API: authApi.getCurrentUser()
  API->>LS: getItem('b2b_auth_user')
  LS-->>API: JSON string
  API-->>AC: AuthUser | null
  AC->>AC: setUser(user), setLoading(false)

  Note over U,LS: Guard check
  U->>U: Navigate to /seller/*
  U->>U: SellerGuard renders
  U->>AC: useAuth() → user.role
  alt role === 'Nhà cung cấp'
    AC-->>U: Render children (SellerLayout)
  else role !== 'Nhà cung cấp'
    AC-->>U: Redirect → /login
  end
```

---

## 7. Notification flow

```
┌─────────────┐     ┌──────────────────┐     ┌────────────────────┐
│ User Action  │────▶│  Service API     │────▶│ notificationApi    │
│ (đặt hàng,  │     │ (orderApi.create, │     │ .create({          │
│  gửi RFQ,   │     │  rfqApi.submit,   │     │   type, title,     │
│  thanh toán) │     │  paymentApi.pay)  │     │   message, userId  │
│              │     └──────────────────┘     │ })                 │
└─────────────┘                               └────────┬───────────┘
                                                       │
                                                       ▼
                                              ┌────────────────────┐
                                              │ In-memory array    │
                                              │ mockNotifications  │
                                              └────────┬───────────┘
                                                       │
                                                       ▼
                                              ┌────────────────────┐
                                              │ NotificationContext│
                                              │ • refresh() poll   │
                                              │ • unreadCount      │
                                              │ • notifications[]  │
                                              └────────┬───────────┘
                                                       │
                                    ┌──────────────────┼──────────────────┐
                                    ▼                  ▼                  ▼
                           ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
                           │ Notification │  │ Notification │  │ toast()      │
                           │ Dropdown     │  │ CenterPage   │  │ (Sonner)     │
                           │ (header)     │  │ (full page)  │  │              │
                           │ badge count  │  │ list + filter│  │ instant pop  │
                           └──────────────┘  └──────────────┘  └──────────────┘
```

---

## 8. Cart / Checkout flow

```mermaid
flowchart LR
  A["ProductDetail<br/>AddToCart"] --> B["CartContext<br/>addItem()"]
  B --> C["cartApi.add()<br/>(mock)"]
  C --> D["CartPage<br/>items list"]
  D --> E{"Chọn thanh toán"}
  E --> F["OrderConfirmation<br/>• Chọn địa chỉ<br/>• Phương thức TT<br/>• Ghi chú"]
  F --> G["orderApi.create()<br/>(mock)"]
  G --> H["OrderDetailPage<br/>Theo dõi đơn"]

  style A fill:#e3f2fd
  style D fill:#fff3e0
  style F fill:#f3e5f5
  style H fill:#e8f5e9
```

**Quick paths**:
- **QuickOrder**: Nhập SKU + qty → addToCart → Checkout
- **BulkOrder**: Upload CSV → parse → addToCart (batch) → Checkout
- **OrderTemplate**: Load template items → addToCart → Checkout
- **PriceAgreement**: Order from agreement → auto pricing → Checkout

---

## 9. Service layer file dependency graph

```
┌─────────────────────────────────────────────────────────────┐
│ /src/app/types/index.ts                                     │
│ (~2014 dòng — tất cả types/interfaces)                      │
└──────────────────────────┬──────────────────────────────────┘
                           │ import type { ... }
              ┌────────────┼────────────────┐
              ▼            ▼                ▼
┌───────────────────┐ ┌──────────┐ ┌────────────────────────┐
│ /services/api.ts  │ │ /data/   │ │ /services/*Api.ts (×20)│
│ (~2900+ dòng)     │ │ mockData │ │ adminApi, auctionApi,  │
│                   │ │ .ts      │ │ budgetApi, grnApi,     │
│ 30 API objects:   │ └─────┬────┘ │ prApi, slaApi, ...     │
│ authApi, orderApi,│       │      └───────────┬────────────┘
│ productApi, ...   │       │                  │
└────────┬──────────┘       │                  │
         │                  │                  │
         │  import mockData │                  │
         ├──────────────────┘                  │
         │                                     │
         │  (một số service import từ api.ts)  │
         ├─────────────────────────────────────┘
         │
         ▼
  ┌──────────────────────────────┐
  │ Components (pages)           │
  │ import { xxxApi } from ...   │
  │ Gọi: xxxApi.getAll(...)      │
  └──────────────────────────────┘
```

### APIs trong `api.ts` (KHÔNG thêm mới):
`authApi`, `userApi`, `categoryApi`, `productApi`, `orderApi`, `rfqApi`, `quotationApi`, `contractApi`, `warehouseApi`, `inventoryApi`, `stockMovementApi`, `stockAlertApi`, `shipmentApi`, `paymentApi`, `invoiceSellerApi`, `invoiceBuyerApi`, `staffApi`, `promotionApi`, `certificateApi`, `chatApi`, `notificationApi`, `reviewApi`, `supplierReviewApi`, `cartApi`, `wishlistApi`, `orderTemplateApi`, `approvalApi`, `returnApi`, `creditApi`, `supplierApi`.

### APIs đã tách file riêng (20 files):
| File | Chức năng |
|------|-----------|
| `adminApi.ts` | Dashboard stats, user management cho Admin |
| `analyticsApi.ts` | Phân tích Buyer/Seller |
| `auctionApi.ts` | Đấu giá ngược |
| `budgetApi.ts` | Ngân sách, phân bổ, giao dịch |
| `buyerDashboardApi.ts` | Dashboard stats cho Buyer |
| `debitCreditApi.ts` | Ghi nợ / ghi có |
| `documentApi.ts` | Trung tâm tài liệu |
| `grnApi.ts` | Biên bản nhận hàng |
| `integrationApi.ts` | Tích hợp ERP/CRM, webhook, API keys |
| `loyaltyApi.ts` | Khách hàng thân thiết, điểm, phần thưởng |
| `orderStatusHistoryApi.ts` | Lịch sử trạng thái đơn hàng |
| `prApi.ts` | Yêu cầu mua hàng |
| `priceAgreementApi.ts` | Thỏa thuận giá dài hạn |
| `productImageApi.ts` | Quản lý ảnh sản phẩm |
| `reportBuilderApi.ts` | Báo cáo tùy chỉnh |
| `rfqAttachmentApi.ts` | File đính kèm RFQ |
| `slaApi.ts` | SLA definitions, metrics, reports |
| `supplierCategoryApi.ts` | Danh mục NCC |
| `warehouseTransferApi.ts` | Chuyển kho |
| `warrantyApi.ts` | Bảo hành & claims |

---

## 10. Chiến lược Migration sang Supabase

### 10.1 Giai đoạn

| Phase | Scope | Mô tả |
|-------|-------|--------|
| **Phase 1** | Auth | `authApi` → Supabase Auth. `localStorage` → Session management. |
| **Phase 2** | Core | `productApi`, `categoryApi`, `supplierApi`, `orderApi` → Supabase tables. |
| **Phase 3** | Full | Tất cả 109 bảng còn lại → PostgreSQL. Storage cho file/image. Realtime cho chat/notification. |

### 10.2 Mapping chi tiết

| Hiện tại (Mock) | → Supabase |
|-----------------|-----------|
| `await delay(300)` | Network request (tự có latency) |
| `let mockArray: T[]` | `supabase.from('table_name')` |
| `mockArray.filter(...)` | `.eq()`, `.ilike()`, `.gte()`, `.in()` |
| `mockArray.sort(...)` | `.order('column', { ascending })` |
| `mockArray.slice(start, end)` | `.range(start, end)` |
| `mockArray.push(newItem)` | `.insert(newItem)` |
| `mockArray[i] = updated` | `.update(data).eq('id', id)` |
| `mockArray.splice(i, 1)` | `.delete().eq('id', id)` |
| `localStorage.setItem()` | `supabase.auth.signInWithPassword()` |
| `localStorage.getItem()` | `supabase.auth.getSession()` |
| In-memory aggregate | SQL aggregate / Materialized view |
| `PaginatedResponse<T>` | `{ data, count }` + `.range()` |

### 10.3 RLS (Row Level Security)
```sql
-- Ví dụ: Buyer chỉ thấy đơn hàng của mình
CREATE POLICY "buyer_own_orders" ON orders
  FOR SELECT USING (buyer_id = auth.uid());

-- Seller chỉ thấy đơn hàng gửi cho mình
CREATE POLICY "seller_assigned_orders" ON orders
  FOR SELECT USING (supplier_id IN (
    SELECT id FROM suppliers WHERE user_id = auth.uid()
  ));

-- Admin thấy tất cả
CREATE POLICY "admin_all_orders" ON orders
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );
```

### 10.4 Service Migration Template
```tsx
// TRƯỚC (mock)
export const orderApi = {
  async getOrders(pagination, sort, filters?) {
    await delay(300);
    let result = applyFilters(mockOrders, filters);
    result = applySort(result, sort);
    return paginate(result, pagination);
  },
};

// SAU (Supabase)
export const orderApi = {
  async getOrders(pagination, sort, filters?) {
    let query = supabase.from('orders').select('*', { count: 'exact' });
    if (filters?.status) query = query.eq('status', filters.status);
    if (filters?.search) query = query.ilike('order_number', `%${filters.search}%`);
    query = query.order(sort.field, { ascending: sort.direction === 'asc' });
    const start = (pagination.page - 1) * pagination.pageSize;
    query = query.range(start, start + pagination.pageSize - 1);
    const { data, count } = await query;
    return { data: data ?? [], total: count ?? 0, page: pagination.page,
             pageSize: pagination.pageSize, totalPages: Math.ceil((count ?? 0) / pagination.pageSize) };
  },
};
```

---

## Tài liệu liên quan

- [01-system-overview.md](./01-system-overview.md) — Tổng quan hệ thống
- [03-coding-conventions.md](./03-coding-conventions.md) — Quy ước code
- [28-supabase-migration.md](./28-supabase-migration.md) — Chi tiết Supabase migration
- [32-vibe-coding-context.md](./32-vibe-coding-context.md) — AI Vibe Coding Context

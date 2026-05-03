# Vibe Coding Context — Sàn TMĐT B2B

> **File này là "khoáng vàng"** — cung cấp đủ context để AI đọc xong là code được ngay, không cần duyệt lại toàn bộ source.
> Cập nhật lần cuối: 2026-03-15

---

## 1. KHÔNG LÀM (Anti-patterns)

| # | Quy tắc | Lý do |
|---|---------|-------|
| 1 | **KHÔNG** dùng `react-router-dom` | Dùng `react-router` (data mode). `react-router-dom` không hoạt động trong env này. |
| 2 | **KHÔNG** tạo file > 2000 dòng | Quy tắc dự án. Tách file nếu cần. |
| 3 | **KHÔNG** dùng DataTable prop `actions` | Dùng `renderActions` — DataTable nhận prop này. |
| 4 | **KHÔNG** dùng `AuthUser.company` | Dùng `companyName` — type đã định nghĩa là `companyName`. |
| 5 | **KHÔNG** inline mock data trong component | Tất cả mock data phải nằm trong service layer (`/src/app/services/`). |
| 6 | **KHÔNG** dùng `text-2xl`, `font-bold`, `leading-none` | Trừ khi user yêu cầu rõ ràng. Theme.css đã định nghĩa default. |
| 7 | **KHÔNG** tạo file `.md` tự ý | Chỉ tạo khi user yêu cầu. |
| 8 | **KHÔNG** thêm service mới vào `api.ts` | File đã > 2900 dòng. **Tạo file riêng** trong `/src/app/services/`. |
| 9 | **KHÔNG** dùng `sellerId` trong types mới | Dùng `supplierId` cho nhất quán (trừ DebitCreditNote đã dùng `sellerId` từ trước). |
| 10 | **KHÔNG** dùng array index làm `key` | Dùng `entity.id` — mỗi entity đều có `id: string`. |
| 11 | **KHÔNG** dùng Framer Motion naming | Dùng `import { motion } from 'motion/react'`, gọi là "Motion". |
| 12 | **KHÔNG** dùng `konva` | Canvas API trực tiếp. Konva không hỗ trợ trong env này. |
| 13 | **KHÔNG** tạo default export (trừ `App.tsx`) | Dùng named export cho tất cả components. |

---

## 2. PHẢI LÀM (Mandatory Patterns)

### 2.1 Page Wrapper
```tsx
<div className="container mx-auto px-4 py-6">
  {/* Nội dung trang */}
</div>
```

### 2.2 DataTable — Props bắt buộc
```tsx
<DataTable
  data={items}
  columns={columns}            // ColumnConfig[]
  totalItems={totalItems}      // number
  pagination={pagination}      // { page, pageSize }
  sort={sort}                  // { field, direction }
  onPaginationChange={setPagination}
  onSortChange={setSort}
  getId={(item) => item.id}    // (item: T) => string
  renderActions={(item) => (   // Không dùng prop "actions"
    <div className="flex gap-2">...</div>
  )}
/>
```
> **ColumnConfig** cột không khai báo `visible` → mặc định hiển thị.
> `render` function tùy chỉnh: `{ key: 'status', label: 'Trạng thái', render: (val, row) => <StatusBadge status={val} /> }`

### 2.3 FilterBar
```tsx
<FilterBar
  filters={filterConfigs}      // FilterConfig[]
  activeFilters={activeFilters} // ActiveFilter[]
  onFilterChange={setActiveFilters}
  searchValue={searchTerm}
  onSearchChange={setSearchTerm}
  searchPlaceholder="Tìm kiếm..."
/>
```

### 2.4 FormDialog
```tsx
<FormDialog
  open={dialogOpen}
  onOpenChange={setDialogOpen}
  title="Tạo mới / Chỉnh sửa"
  fields={formFields}          // FormField[]
  initialData={editingItem}
  onSubmit={handleSubmit}
/>
```

### 2.5 Service File Mới
```tsx
// /src/app/services/xxxApi.ts
import type { PaginationParams, SortParams, PaginatedResponse, XxxType } from '../types';

const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

let mockItems: XxxType[] = [/* mock data */];

export const xxxApi = {
  async getAll(
    pagination: PaginationParams,
    sort: SortParams,
    filters?: Record<string, string>
  ): Promise<PaginatedResponse<XxxType>> {
    await delay(300);
    let result = [...mockItems];
    // filter → sort → paginate
    const total = result.length;
    const start = (pagination.page - 1) * pagination.pageSize;
    return {
      data: result.slice(start, start + pagination.pageSize),
      total,
      page: pagination.page,
      pageSize: pagination.pageSize,
      totalPages: Math.ceil(total / pagination.pageSize),
    };
  },
  async getById(id: string): Promise<XxxType | undefined> {
    await delay(200);
    return mockItems.find(i => i.id === id);
  },
  async create(item: Partial<XxxType>): Promise<XxxType> {
    await delay(300);
    const newItem = { ...item, id: `xxx-${Date.now()}`, createdAt: new Date().toISOString() } as XxxType;
    mockItems.unshift(newItem);
    return newItem;
  },
  async update(id: string, data: Partial<XxxType>): Promise<XxxType> {
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
};
```

### 2.6 Route Mới — Lazy Loading
```tsx
// Trong /src/app/routes.ts
const NewPage = lazy(() => import('./components/xxx/NewPage').then(m => ({ default: m.NewPage })));
// Thêm vào children array:
{ path: 'new-path', Component: NewPage },
```

### 2.7 Các quy tắc khác
- Mỗi trang list: **FilterBar + ViewToggle + DataTable/Grid + Pagination**
- Mỗi status display: dùng **StatusBadge**
- `React.lazy` cho **mọi page** trong routes.ts
- Tiếng Việt có dấu cho labels, placeholders, messages
- Responsive: mobile-first, test trên `< 768px`
- Toast: `import { toast } from 'sonner'`
- Date format hiển thị: `dd/MM/yyyy HH:mm`
- Tiền tệ: `Intl.NumberFormat('vi-VN').format(amount) + ' ₫'`

---

## 3. FILE MAP — Tham chiếu nhanh

| Mục đích | Đường dẫn |
|----------|-----------|
| Types (tất cả interfaces) | `/src/app/types/index.ts` (~2014 dòng) |
| Routes | `/src/app/routes.ts` (~292 dòng) |
| Main service | `/src/app/services/api.ts` (> 2900 dòng, **KHÔNG thêm mới**) |
| Mock data chính | `/src/app/data/mockData.ts` |
| Mock data admin | `/src/app/data/mockAdminData.ts` |
| CSS Theme | `/src/styles/theme.css` |
| Font imports | `/src/styles/fonts.css` |
| Global CSS | `/src/styles/index.css` |
| Tailwind config | `/src/styles/tailwind.css` |
| Entry point | `/src/app/App.tsx` (default export) |
| Auth context | `/src/app/context/AuthContext.tsx` |
| Cart context | `/src/app/context/CartContext.tsx` |
| Wishlist context | `/src/app/context/WishlistContext.tsx` |
| Notification context | `/src/app/context/NotificationContext.tsx` |
| Debounce hook | `/src/app/hooks/useDebounce.ts` |
| Export utils | `/src/app/utils/exportUtils.ts` |
| Form auto-save | `/src/app/utils/formAutoSave.ts` |
| API cache | `/src/app/utils/apiCache.ts` |
| Retry helper | `/src/app/utils/withRetry.ts` |
| Toast with undo | `/src/app/utils/toastWithUndo.ts` |

---

## 4. COMPONENT MAP

### 4.1 Shared Components (`/src/app/components/shared/`)
| Component | File | Mô tả |
|-----------|------|--------|
| DataTable | `DataTable.tsx` | Bảng dữ liệu CRUD, sort, pagination, inline edit, column toggle |
| FilterBar | `FilterBar.tsx` | Thanh lọc + tìm kiếm |
| FormDialog | `FormDialog.tsx` | Dialog form CRUD (text, number, select, textarea, date, combobox) |
| CategoryCombobox | `CategoryCombobox.tsx` | Combobox danh mục sản phẩm (tree, search) |
| StatusBadge | `StatusBadge.tsx` | Badge trạng thái (auto color mapping) |
| ViewToggle | `ViewToggle.tsx` | Chuyển chế độ xem (table/grid/list) |
| DashboardWidget | `DashboardWidget.tsx` | Wrapper cho widget dashboard |
| StatsCard | `StatsCard.tsx` | Card thống kê (icon, value, trend) |
| AnimatedNumber | `AnimatedNumber.tsx` | Số chạy animation |
| TrendIndicator | `TrendIndicator.tsx` | Mũi tên tăng/giảm + % |
| ProgressRing | `ProgressRing.tsx` | Vòng tiến độ SVG |
| IconWrapper | `IconWrapper.tsx` | Wrapper icon có background |
| ConfirmDialog | `ConfirmDialog.tsx` | Dialog xác nhận (danger mode) |
| ImportDialog | `ImportDialog.tsx` | Dialog import file (upload, preview, validate) |
| EmptyState | `EmptyState.tsx` | Trạng thái trống (icon + message + action) |
| ErrorBoundary | `ErrorBoundary.tsx` | Bắt lỗi React boundary |
| LoadingOverlay | `LoadingOverlay.tsx` | Loading toàn trang/section |
| PageSkeleton | `PageSkeleton.tsx` | Skeleton loading cho page |
| PageTransition | `PageTransition.tsx` | Hiệu ứng chuyển trang |
| InlineAlert | `InlineAlert.tsx` | Alert inline (info/warning/error/success) |
| AppBreadcrumb | `AppBreadcrumb.tsx` | Breadcrumb navigation |
| AvatarGroup | `AvatarGroup.tsx` | Nhóm avatar (+N overflow) |
| NotificationDropdown | `NotificationDropdown.tsx` | Dropdown thông báo (header) |
| NotificationCenterPage | `NotificationCenterPage.tsx` | Trang trung tâm thông báo |
| CommandPalette | `CommandPalette.tsx` | Cmd+K palette |
| SearchSuggestions | `SearchSuggestions.tsx` | Gợi ý tìm kiếm |
| MobileBottomNav | `MobileBottomNav.tsx` | Thanh nav dưới mobile |
| ChatPage | `ChatPage.tsx` | Trang chat (shared giữa buyer/seller) |
| DocumentCenterPage | `DocumentCenterPage.tsx` | Trung tâm tài liệu |
| IntegrationHubPage | `IntegrationHubPage.tsx` | Hub tích hợp |
| ReportBuilderPage | `ReportBuilderPage.tsx` | Báo cáo tùy chỉnh |
| ReviewComponents | `ReviewComponents.tsx` | Components đánh giá (shared) |
| NotFoundPage | `NotFoundPage.tsx` | Trang 404 |
| ProtectedRoute | `ProtectedRoute.tsx` | Route bảo vệ (auth check) |
| ScrollToTop | `ScrollToTop.tsx` | Auto scroll top khi route change |
| ScrollToTopButton | `ScrollToTopButton.tsx` | Nút scroll lên |
| OfflineIndicator | `OfflineIndicator.tsx` | Hiển thị offline status |
| SkipLink | `SkipLink.tsx` | Accessibility skip nav |
| KeyboardShortcuts | `KeyboardShortcuts.tsx` | Phím tắt toàn cục |

### 4.2 UI Primitives (`/src/app/components/ui/`)
48 shadcn/ui components:
`accordion`, `alert`, `alert-dialog`, `aspect-ratio`, `avatar`, `badge`,
`breadcrumb`, `button` (**forwardRef ✓**), `calendar`, `card`, `carousel`,
`chart`, `checkbox`, `collapsible`, `command`, `context-menu`, `dialog`,
`drawer`, `dropdown-menu`, `form`, `hover-card`, `input` (**forwardRef ✓**),
`input-otp`, `label`, `menubar`, `navigation-menu`, `pagination`, `popover`,
`progress`, `radio-group`, `resizable`, `scroll-area`, `select`, `separator`,
`sheet`, `sidebar`, `skeleton`, `slider`, `sonner`, `switch`, `table`,
`tabs`, `textarea`, `toggle`, `toggle-group`, `tooltip`, `use-mobile`, `utils`.

### 4.3 Layouts & Guards
| Component | File | Vai trò |
|-----------|------|---------|
| BuyerLayout | `/src/app/components/buyer/BuyerLayout.tsx` | Layout buyer (top nav + sidebar/mega menu) |
| SellerLayout | `/src/app/components/seller/SellerLayout.tsx` | Layout seller (sidebar) |
| AdminLayout | `/src/app/components/admin/AdminLayout.tsx` | Layout admin (sidebar) |
| BuyerGuard | `/src/app/components/buyer/BuyerGuard.tsx` | Auth guard: role = Người mua |
| SellerGuard | `/src/app/components/seller/SellerGuard.tsx` | Auth guard: role = Nhà cung cấp |
| AdminGuard | `/src/app/components/admin/AdminGuard.tsx` | Auth guard: role = Quản trị viên |
| AuthLayout | `/src/app/components/auth/AuthLayout.tsx` | Layout login/register |

### 4.4 Context Providers
| Context | Data | Storage |
|---------|------|---------|
| AuthContext | user, login(), logout(), isAuthenticated | localStorage (token) |
| CartContext | items, addToCart(), removeFromCart(), updateQty(), clearCart() | Memory (mock) |
| WishlistContext | items, folders, addToWishlist(), removeFromWishlist() | Memory (mock) |
| NotificationContext | notifications, unreadCount, markAsRead(), markAllAsRead() | Memory (mock) |

---

## 5. SERVICE MAP

### 5.1 Trong `api.ts` (file chính, > 2900 dòng — KHÔNG thêm mới vào đây)
```
authApi, userApi, categoryApi, productApi, orderApi, rfqApi,
quotationApi, contractApi, warehouseApi, inventoryApi, stockMovementApi,
stockAlertApi, shipmentApi, paymentApi, invoiceSellerApi, invoiceBuyerApi,
staffApi, promotionApi, certificateApi, chatApi, notificationApi,
reviewApi, supplierReviewApi, cartApi, wishlistApi, orderTemplateApi,
approvalApi, returnApi, creditApi, supplierApi
```

### 5.2 Service files riêng (`/src/app/services/`)
| File | Chứa API cho |
|------|-------------|
| `adminApi.ts` | Admin dashboard stats, admin-specific operations |
| `analyticsApi.ts` | Buyer analytics (spend, savings, KPI, supplier performance) |
| `auctionApi.ts` | Reverse auction CRUD, bids, winner selection |
| `budgetApi.ts` | Budget plans, allocations, transactions, check |
| `buyerDashboardApi.ts` | Buyer dashboard stats, trends |
| `debitCreditApi.ts` | Debit/credit notes CRUD, confirm |
| `documentApi.ts` | Document center CRUD, upload, search |
| `grnApi.ts` | GRN CRUD, confirm, report issue |
| `integrationApi.ts` | Integration hub, webhooks, API keys |
| `loyaltyApi.ts` | Loyalty programs, transactions, rewards |
| `orderStatusHistoryApi.ts` | Order status history CRUD |
| `prApi.ts` | Purchase requisition CRUD, approve, reject |
| `priceAgreementApi.ts` | Price agreements, linked orders |
| `productImageApi.ts` | Product image CRUD, reorder |
| `reportBuilderApi.ts` | Report builder CRUD, run, export |
| `rfqAttachmentApi.ts` | RFQ attachment CRUD |
| `slaApi.ts` | SLA definitions, reports |
| `supplierCategoryApi.ts` | Supplier-category N-N |
| `warehouseTransferApi.ts` | Warehouse transfers CRUD |
| `warrantyApi.ts` | Warranty & claims CRUD |

---

## 6. TYPE MAP

### 6.1 Hạ tầng chung
`PaginationParams`, `SortParams`, `PaginatedResponse<T>`, `ColumnConfig`, `FilterConfig`, `ActiveFilter`, `ViewMode`, `BreadcrumbItem`

### 6.2 Auth & User
`UserRole` (3 giá trị), `UserStatus` (3), `User`, `AuthUser`, `LoginCredentials`, `RegisterData`, `ShippingAddress`

### 6.3 Danh mục & Nhà cung cấp
`Category`, `Supplier`, `SupplierCategory`, `SupplierScorecard`

### 6.4 Sản phẩm
`ProductStatus` (5), `Product`, `ProductVariant`, `ProductImage`, `ProductSpecification`

### 6.5 Đơn hàng
`OrderStatus` (7), `OrderType` (4), `Order`, `OrderItem`, `OrderStatusHistory`, `OrderTemplate`, `OrderTemplateItem`

### 6.6 Giỏ hàng & Wishlist
`CartItem`, `WishlistItem`, `WishlistFolder`

### 6.7 RFQ & Báo giá
`RFQStatus` (7), `RFQ`, `RFQItem`, `RFQAttachment`, `QuotationStatus` (3), `Quotation`, `QuotationItem`

### 6.8 Hợp đồng
`ContractStatus` (7), `Contract`, `ContractItem`, `ContractMilestone`, `ContractHistory`

### 6.9 Kho hàng
`Warehouse`, `InventoryItem`, `InventorySummary`, `StockMovementType` (5), `StockMovement`, `StockAlert`, `WarehouseTransferStatus` (5), `WarehouseTransfer`, `TransferItem`

### 6.10 Vận chuyển
`ShipmentStatus` (6), `Shipment`, `ShipmentEvent`, `ShippingRate`

### 6.11 Thanh toán
`PaymentStatus` (5), `PaymentMethod` (6), `Payment`, `PaymentTransaction`

### 6.12 Hoá đơn
`InvoiceStatus` (6), `InvoiceType` (3), `Invoice`, `InvoiceItem`, `TaxConfig`

### 6.13 Trả hàng
`ReturnStatus` (6), `ReturnReason` (6), `ReturnRequest`, `ReturnItem`, `ReturnStats`

### 6.14 Công nợ
`CreditStatus` (4), `CreditTransactionType` (3), `PaymentTerms` (5), `CreditLimit`, `CreditTransaction`, `CreditStats`

### 6.15 Ghi nợ / Ghi có
`NoteType` (2), `NoteReason` (6), `NoteStatus` (5), `DebitCreditNote`, `DebitCreditItem`, `DebitCreditStats`

### 6.16 Đánh giá
`Review`, `ReviewTag` (5), `SupplierReview`

### 6.17 Khuyến mãi
`DiscountType` (4), `Promotion`, `VolumeDiscount`

### 6.18 Nhân viên NCC
`StaffRole` (5), `Permission`, `StaffMember`

### 6.19 Nhóm mua hàng
`BuyerRole` (4), `BuyerMemberStatus` (3), `BuyerTeamMember`, `BuyerCompany`, `BuyerPermission`, `BuyerTeamStats`

### 6.20 Phê duyệt
`ApprovalStatus` (3), `ApprovalType` (5), `ApprovalRequest`, `ApprovalRule`

### 6.21 Yêu cầu mua hàng (PR)
`PRStatus` (6), `PRPriority` (4), `PurchaseRequisition`, `PRItem`, `PRStats`

### 6.22 Biên bản nhận hàng (GRN)
`GRNStatus` (4), `DefectReason` (6), `GoodsReceivedNote`, `GRNItem`, `GRNStats`

### 6.23 Ngân sách
`BudgetPeriod` (3), `BudgetStatus` (5), `BudgetPlan`, `BudgetAllocation`, `BudgetTransaction`, `BudgetTransactionType` (3)

### 6.24 Đấu giá ngược
`AuctionStatus` (5), `ReverseAuction`, `AuctionItem`, `AuctionBid`, `AuctionBidItem`, `AuctionStats`

### 6.25 Thoả thuận giá
`AgreementType` (3), `AgreementStatus` (6), `PriceAgreement`, `PriceAgreementItem`, `AgreementOrder`

### 6.26 SLA
`SLAMetric` (6), `SLAStatus` (4), `SLADefinition`, `SLAMetricDef`, `SLAReport`, `SLAReportMetric`

### 6.27 Bảo hành
`WarrantyStatus` (4), `Warranty`, `ClaimStatus` (7), `ClaimType` (3), `WarrantyClaim`

### 6.28 Khách hàng thân thiết
`LoyaltyTier` (4), `LoyaltyTxnType` (4), `LoyaltyProgram`, `LoyaltyTransaction`, `LoyaltyReward`

### 6.29 Tài liệu
`DocCategory` (7), `DocStatus` (3), `Document`

### 6.30 Tích hợp
`IntegrationType` (8), `IntegrationStatus` (4), `Integration`, `WebhookEndpoint`, `APIKey`

### 6.31 Báo cáo
`ReportFilter` (cũ, dùng cho SellerReports), `ReportBuilderFilter` (mới, dùng cho Report Builder), `ReportDataSource` (10), `ReportChartType` (7), `ReportColumn`, `ReportDefinition`

### 6.32 Thông báo
`NotificationType` (12), `NotificationPriority` (4), `NotificationCategory` (4), `AppNotification`, `NotificationPreference`

### 6.33 Hệ thống
`SystemConfig`, `DashboardStats`, `AdminNotificationConfig`, `PlatformFee`, `MaintenanceConfig`, `EmailTemplate`, `BannerConfig`, `SEOConfig`

### 6.34 Nhật ký
`ActivityAction` (11), `ActivityLog`

### 6.35 Chứng chỉ
`CertificateType` (7), `VerificationStatus` (5), `BusinessCertificate`

### 6.36 Phân tích
`SpendByCategory`, `SpendBySupplier`, `SpendByDepartment`, `TopProduct`, `SpendAnalysis`, `SavingsReport`, `ProcurementKPI`, `TrendDataPoint`, `SupplierPerformance`

### 6.37 Dashboard
`BuyerDashboardStats`, `BuyerSpendingTrend`, `BuyerSupplierSpend`, `BuyerOrderTrend`

### 6.38 Báo cáo Seller
`ReportFilter`, `RevenueReport`, `ProductReport`, `CustomerReport`

---

## 7. STATUS ENUM MAP

| Type | Giá trị | Số lượng |
|------|---------|----------|
| `OrderStatus` | Chờ xác nhận, Đã xác nhận, Đang xử lý, Đang giao hàng, Đã giao, Đã huỷ, Hoàn trả | 7 |
| `OrderType` | Thường, RFQ, Hợp đồng, Mẫu đơn | 4 |
| `ProductStatus` | Chờ duyệt, Đã duyệt, Từ chối, Hết hàng, Ẩn | 5 |
| `RFQStatus` | Bản nháp, Đã gửi, Đang báo giá, Đã báo giá, Chấp nhận, Từ chối, Hết hạn | 7 |
| `QuotationStatus` | Chờ phản hồi, Chấp nhận, Từ chối | 3 |
| `ContractStatus` | Bản nháp, Chờ ký, Đang thực hiện, Hoàn thành, Đã huỷ, Hết hạn, Tranh chấp | 7 |
| `PaymentStatus` | Chờ thanh toán, Đã thanh toán một phần, Đã thanh toán, Quá hạn, Hoàn tiền | 5 |
| `InvoiceStatus` | Bản nháp, Đã xuất, Đã gửi, Đã thanh toán, Quá hạn, Đã huỷ | 6 |
| `ShipmentStatus` | Chuẩn bị, Đã lấy hàng, Đang vận chuyển, Đang giao, Đã giao, Thất bại | 6 |
| `ReturnStatus` | Chờ duyệt, Đã duyệt, Từ chối, Đang xử lý, Đã hoàn tiền, Đã đóng | 6 |
| `ApprovalStatus` | Chờ duyệt, Đã duyệt, Từ chối | 3 |
| `PRStatus` | Bản nháp, Chờ duyệt, Đã duyệt, Từ chối, Đã tạo đơn, Đóng | 6 |
| `GRNStatus` | Chờ xác nhận, Đã xác nhận, Có vấn đề, Đã đóng | 4 |
| `NoteStatus` | Bản nháp, Chờ đối soát, Đã đối soát, Từ chối, Đã huỷ | 5 |
| `BudgetStatus` | Bản nháp, Đã duyệt, Đang thực hiện, Đã đóng, Vượt ngân sách | 5 |
| `AuctionStatus` | Bản nháp, Đang mở, Đã đóng, Đã chọn NCC, Đã huỷ | 5 |
| `AgreementStatus` | Bản nháp, Chờ duyệt, Hiệu lực, Sắp hết hạn, Đã hết hạn, Đã huỷ | 6 |
| `SLAStatus` | Bản nháp, Hiệu lực, Đã hết hạn, Đã huỷ | 4 |
| `WarrantyStatus` | Còn hạn, Sắp hết, Hết hạn, Bị huỷ | 4 |
| `ClaimStatus` | Mới tạo, Đang xem xét, Chấp nhận, Từ chối, Đang sửa chữa, Đã giải quyết, Đã đóng | 7 |
| `CreditStatus` | Hoạt động, Tạm ngưng, Hết hạn, Chờ duyệt | 4 |
| `WarehouseTransferStatus` | Bản nháp, Chờ duyệt, Đang chuyển, Đã nhận, Đã huỷ | 5 |
| `UserRole` | Người mua, Nhà cung cấp, Quản trị viên | 3 |
| `UserStatus` | Hoạt động, Bị khoá, Chờ xác minh | 3 |
| `StaffRole` | Chủ DN, Quản lý, Nhân viên bán hàng, Thủ kho, Kế toán | 5 |
| `BuyerRole` | Quản lý, Nhân viên, Kế toán, Giám đốc | 4 |
| `VerificationStatus` | Chưa xác minh, Đang xem xét, Đã xác minh, Từ chối, Hết hạn | 5 |
| `DocStatus` | Hiệu lực, Lưu trữ, Đã xoá | 3 |
| `IntegrationStatus` | Đã kết nối, Ngắt kết nối, Lỗi, Chưa cài đặt | 4 |
| `LoyaltyTier` | Đồng, Bạc, Vàng, Kim cương | 4 |

---

## 8. PAGE MAP

### 8.1 Buyer Pages (~51 trang)

| Trang | Route | File |
|-------|-------|------|
| Trang chủ | `/` | `HomePage.tsx` |
| Danh sách SP | `/products` | `ProductListPage.tsx` |
| Chi tiết SP | `/products/:id` | `ProductDetailPage.tsx` |
| So sánh SP | `/products/compare` | `ProductComparePage.tsx` |
| DS nhà cung cấp | `/suppliers` | `SupplierListPage.tsx` |
| Chi tiết NCC | `/suppliers/:id` | `SupplierDetailPage.tsx` |
| Dashboard | `/dashboard` | `BuyerDashboardPage.tsx` |
| Giỏ hàng | `/cart` | `CartPage.tsx` |
| DS đơn hàng | `/orders` | `OrderListPage.tsx` |
| Chi tiết đơn | `/orders/:id` | `OrderDetailPage.tsx` |
| Xác nhận đơn | `/order-confirmation` | `OrderConfirmationPage.tsx` |
| DS RFQ | `/rfq` | `BuyerRFQListPage.tsx` |
| Tạo RFQ | `/rfq/new` | `BuyerRFQCreatePage.tsx` |
| Chi tiết RFQ | `/rfq/:id` | `BuyerRFQDetailPage.tsx` |
| DS hợp đồng | `/contracts` | `BuyerContractList.tsx` |
| Chi tiết HĐ | `/contracts/:id` | `BuyerContractDetail.tsx` |
| DS vận chuyển | `/shipments` | `BuyerShipmentList.tsx` |
| Chi tiết VC | `/shipments/:id` | `BuyerShipmentDetail.tsx` |
| DS thanh toán | `/payments` | `BuyerPaymentList.tsx` |
| Chi tiết TT | `/payments/:id` | `BuyerPaymentDetail.tsx` |
| DS hoá đơn | `/invoices` | `BuyerInvoiceListPage.tsx` |
| Chi tiết HĐ | `/invoices/:id` | `BuyerInvoiceDetail.tsx` |
| Yêu thích | `/wishlist` | `BuyerWishlistPage.tsx` |
| Mẫu đơn | `/templates` | `BuyerOrderTemplatePage.tsx` |
| Khuyến mãi | `/promotions` | `BuyerPromotionPage.tsx` |
| Chat | `/chat` | `BuyerChatPage.tsx` |
| Hồ sơ | `/profile` | `BuyerProfilePage.tsx` |
| Đặt hàng SL lớn | `/bulk-order` | `BuyerBulkOrderPage.tsx` |
| Đặt nhanh | `/quick-order` | `BuyerQuickOrderPage.tsx` |
| Đánh giá | `/reviews` | `BuyerReviewsPage.tsx` |
| DS trả hàng | `/returns` | `BuyerReturnListPage.tsx` |
| Chi tiết trả | `/returns/:id` | `BuyerReturnDetail.tsx` |
| Nhóm mua | `/team` | `BuyerTeamPage.tsx` |
| Thông báo | `/notifications` | `NotificationCenterPage.tsx` |
| So sánh NCC | `/supplier-compare` | `BuyerSupplierComparePage.tsx` |
| DS yêu cầu mua | `/pr-list` | `BuyerPRListPage.tsx` |
| Chi tiết PR | `/pr-list/:id` | `BuyerPRDetail.tsx` |
| DS nhận hàng | `/grn` | `BuyerGRNListPage.tsx` |
| Chi tiết GRN | `/grn/:id` | `BuyerGRNDetail.tsx` |
| Ngân sách | `/budget` | `BuyerBudgetPage.tsx` |
| DS đấu giá | `/auctions` | `BuyerAuctionListPage.tsx` |
| Chi tiết ĐG | `/auctions/:id` | `BuyerAuctionDetail.tsx` |
| Thoả thuận giá | `/price-agreements` | `BuyerPriceAgreementPage.tsx` |
| Chi tiết TTG | `/price-agreements/:id` | `BuyerPriceAgreementDetail.tsx` |
| Phân tích | `/analytics` | `BuyerAnalyticsPage.tsx` |
| Bảo hành | `/warranty` | `BuyerWarrantyPage.tsx` |
| Tích điểm | `/loyalty` | `BuyerLoyaltyPage.tsx` |
| Tài liệu | `/documents` | `DocumentCenterPage.tsx` |
| Báo cáo | `/reports` | `ReportBuilderPage.tsx` |
| Tích hợp | `/integrations` | `IntegrationHubPage.tsx` |
| Tín dụng | *(trong PaymentList)* | `BuyerCreditSection.tsx` |

### 8.2 Seller Pages (~38 trang)

| Trang | Route | File |
|-------|-------|------|
| Dashboard | `/seller` | `SellerDashboard.tsx` |
| DS sản phẩm | `/seller/products` | `SellerProductList.tsx` |
| Form SP | `/seller/products/new`, `/seller/products/:id` | `SellerProductForm.tsx` |
| DS đơn hàng | `/seller/orders` | `SellerOrderList.tsx` |
| Chi tiết đơn | `/seller/orders/:id` | `SellerOrderDetail.tsx` |
| DS RFQ | `/seller/rfq` | `SellerRFQList.tsx` |
| Chi tiết RFQ | `/seller/rfq/:id` | `SellerRFQDetail.tsx` |
| DS hợp đồng | `/seller/contracts` | `SellerContractList.tsx` |
| Chi tiết HĐ | `/seller/contracts/:id` | `SellerContractDetail.tsx` |
| Kho hàng | `/seller/warehouse` | `SellerWarehouse.tsx` |
| Chuyển kho | *(tab trong Warehouse)* | `SellerWarehouseTransferTab.tsx` |
| DS vận chuyển | `/seller/shipments` | `SellerShipmentList.tsx` |
| DS thanh toán | `/seller/payments` | `SellerPaymentList.tsx` |
| Nhân viên | `/seller/staff` | `SellerStaffList.tsx` |
| Hồ sơ | `/seller/profile` | `SellerProfile.tsx` |
| Chat | `/seller/chat` | `SellerChatPage.tsx` |
| Báo cáo | `/seller/reports` | `SellerReports.tsx` |
| Report Builder | `/seller/reports/builder` | `ReportBuilderPage.tsx` |
| Khuyến mãi | `/seller/promotions` | `SellerPromotionList.tsx` |
| DS phê duyệt | `/seller/approvals` | `SellerApprovalListPage.tsx` |
| Quy tắc PD | `/seller/approvals/rules` | `SellerApprovalRulesPage.tsx` |
| DS hoá đơn | `/seller/invoices` | `SellerInvoiceListPage.tsx` |
| Chi tiết HĐ | `/seller/invoices/:id` | `SellerInvoiceDetail.tsx` |
| Nhật ký | `/seller/activity` | `SellerActivityPage.tsx` |
| Đánh giá | `/seller/reviews` | `SellerReviewsPage.tsx` |
| DS trả hàng | `/seller/returns` | `SellerReturnListPage.tsx` |
| Chi tiết trả | `/seller/returns/:id` | `SellerReturnDetail.tsx` |
| Công nợ | `/seller/credits` | `SellerCreditPage.tsx` |
| Ghi nợ/có | `/seller/debit-credit` | `SellerDebitCreditPage.tsx` |
| Chi tiết GN/GC | `/seller/debit-credit/:id` | `SellerDebitCreditDetail.tsx` |
| DS đấu giá | `/seller/auctions` | `SellerAuctionPage.tsx` |
| Chi tiết ĐG | `/seller/auctions/:id` | `SellerAuctionDetail.tsx` |
| Thoả thuận giá | `/seller/price-agreements` | `SellerPriceAgreementPage.tsx` |
| Chi tiết TTG | `/seller/price-agreements/:id` | `SellerPriceAgreementDetail.tsx` |
| SLA | `/seller/sla` | `SellerSLAPage.tsx` |
| Chi tiết SLA | `/seller/sla/:id` | `SellerSLADetail.tsx` |
| Bảo hành | `/seller/warranty` | `SellerWarrantyPage.tsx` |
| Tài liệu | `/seller/documents` | `DocumentCenterPage.tsx` |
| Tích hợp | `/seller/integrations` | `IntegrationHubPage.tsx` |
| Thông báo | `/seller/notifications` | `NotificationCenterPage.tsx` |

### 8.3 Admin Pages (~19 trang)

| Trang | Route | File |
|-------|-------|------|
| Dashboard | `/admin` | `AdminDashboard.tsx` |
| Người dùng | `/admin/users` | `UserManagement.tsx` |
| Nhà cung cấp | `/admin/suppliers` | `AdminSupplierPage.tsx` |
| Danh mục | `/admin/categories` | `CategoryManagement.tsx` |
| Sản phẩm | `/admin/products` | `ProductApproval.tsx` |
| Đơn hàng | `/admin/orders` | `OrderOverview.tsx` |
| Vận chuyển | `/admin/shipments` | `AdminShipmentPage.tsx` |
| Thanh toán | `/admin/payments` | `AdminPaymentPage.tsx` |
| Khuyến mãi | `/admin/promotions` | `AdminPromotionPage.tsx` |
| Chứng chỉ | `/admin/certificates` | `AdminCertificateReview.tsx` |
| Nhật ký | `/admin/activity-log` | `AdminActivityLog.tsx` |
| Hoá đơn | `/admin/invoices` | `AdminInvoicePage.tsx` |
| Đánh giá | `/admin/reviews` | `ReviewManagement.tsx` |
| RFQ | `/admin/rfq` | `RFQManagement.tsx` |
| Hợp đồng | `/admin/contracts` | `ContractManagement.tsx` |
| Cài đặt | `/admin/settings` | `SystemSettings.tsx` |
| Báo cáo | `/admin/reports` | `AdminReportPage.tsx` |

---

## 9. KNOWN ISSUES & TODO

| # | Vấn đề | Ưu tiên |
|---|--------|---------|
| 1 | B22.03–B22.05: Link "Tài liệu đính kèm" trên ContractDetail, InvoiceDetail, OrderDetail chưa implement | Trung bình |
| 2 | `api.ts` > 2900 dòng — cần tách thêm services | Cao |
| 3 | `sellerId` vs `supplierId` inconsistency (DebitCreditNote dùng `sellerId`) | Thấp |
| 4 | Một số page chưa responsive hoàn chỉnh trên mobile | Trung bình |
| 5 | Mock data ID format chưa thống nhất 100% | Thấp |
| 6 | `InvoiceStatus` có lỗi typo: `'ã huỷ'` thay vì `'Đã huỷ'` | Cao |
| 7 | Chưa có proper error boundaries cho tất cả pages | Trung bình |

---

## 10. PLAN STATUS

| Kế hoạch | File | Trạng thái |
|----------|------|-----------|
| Chức năng gốc (856 bước) | `PLAN_MASTER_COMPLETION.md` | A–C xong (Đợt 1–18) |
| UI/UX cũ (~360 bước) | `PLAN_UI_UPGRADE.md` | UI-A → UI-E19 xong |
| Hoàn thiện giao diện (520 bước) | `PLAN_UI_PERFECTION.md` | P1–P5 xong (Đợt 1–15); **P6 Đợt 16 chờ** |
| Rà soát DB-UI (310 bước) | `PLAN_DB_UI_AUDIT.md` | DB-A → DB-D7 xong (70/310); **DB-E Đợt 8 chờ** |
| Tài liệu thiết kế (~420 bước) | `PLAN_DOCS_COMPLETION.md` | **Đang thực hiện: DOC-M Đợt 32** |
| + 7 đợt rà soát/sửa tổng thể | *(inline fixes)* | Xong |

---

## 11. ROUTING ARCHITECTURE

```
/ → BuyerLayout
  ├── / (HomePage — public)
  ├── /products (public)
  ├── /suppliers (public)
  └── BuyerGuard (auth required)
      ├── /dashboard
      ├── /cart, /orders, /rfq, /contracts, ...
      └── ... (48 protected routes)

/seller → SellerGuard → SellerLayout
  ├── / (SellerDashboard)
  ├── /products, /orders, /rfq, /contracts, ...
  └── ... (35 routes)

/admin → AdminGuard → AdminLayout
  ├── / (AdminDashboard)
  ├── /users, /suppliers, /categories, ...
  └── ... (17 routes)

/login, /register → AuthLayout
```

---

## 12. DATABASE OVERVIEW

103+ bảng, 16 domain nghiệp vụ. Chi tiết tại `/docs/collections.md`.
Target: PostgreSQL 15+, Supabase.

**Domain chính**: Người dùng (4), Sản phẩm (9), Đơn hàng (6), RFQ & Báo giá (6),
Hợp đồng (4), Kho hàng (6), Vận chuyển (3), Thanh toán (4), Hoá đơn (2),
Trả hàng (3), Đánh giá (5), Khuyến mãi (4), Phê duyệt (3), PR & GRN (5),
Ngân sách (3), Đấu giá (5), Thoả thuận giá (3), SLA (4), Bảo hành (3),
Loyalty (3), Tài liệu (2), Tích hợp (3), Báo cáo (3), Hệ thống (8).

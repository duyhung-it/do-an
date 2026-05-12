# Kế hoạch Refactor: B2B Marketplace → Cửa hàng điện thoại đơn lẻ

**Ngày tạo:** 2026-05-07  
**Trạng thái:** Chờ thực hiện  
**Mục tiêu:** Chuyển đổi kiến trúc từ sàn B2B marketplace 3 bên (buyer–seller–admin) sang hệ thống bán lẻ điện thoại đơn lẻ 2 bên (khách hàng–admin), mô hình tương tự CellPhones.vn / Thế Giới Di Động.

---

## Bối cảnh & Vấn đề

### Kiến trúc hiện tại (SAI)
Hệ thống được xây dựng theo mô hình **B2B marketplace** với 3 role độc lập:
- **Buyer** — doanh nghiệp mua hàng, có portal riêng với RFQ, hợp đồng, đấu giá
- **Seller** — nhà bán hàng độc lập, có portal riêng với 40 files quản lý gian hàng
- **Admin** — quản lý sàn, thu phí platform, giám sát SLA

### Kiến trúc mục tiêu (ĐÚNG)
Hệ thống **cửa hàng điện thoại B2C đơn lẻ** với 2 role:
- **Khách hàng (Customer)** — người mua lẻ, có account cá nhân
- **Admin/Nhân viên** — quản lý cửa hàng, kho, đơn hàng

### Tổng quan scope thay đổi

| Hạng mục | Trước | Sau |
|---|---|---|
| Tổng routes | ~90 | ~45 |
| Component files | ~180 | ~110 |
| API service files | 21 | 11 |
| User roles | buyer / seller / admin | customer / admin |
| Mô hình | B2B marketplace 3 bên | B2C cửa hàng 2 bên |
| Files xóa | — | ~72 files |
| Files sửa | — | ~12 files |
| Files tạo mới | — | ~4 files |

---

## Tính năng ĐÚNG — Giữ lại

| Module | Ghi chú |
|---|---|
| Catalog sản phẩm (Product, PhoneSpecs, Variants) | Đúng, giữ nguyên |
| Giỏ hàng, đặt hàng, xác nhận đơn | Đúng |
| Quản lý đơn hàng (Order management) | Đúng |
| Bảo hành (Warranty) | Đúng, đơn giản hóa (xóa logic seller) |
| Trả hàng (Returns) | Đúng, đơn giản hóa |
| Trade-in (Thu cũ đổi mới) | Đúng, đặc thù phone store |
| IMEI check | Đúng |
| Blog, Store Locator, Phone Finder | Đúng |
| Khuyến mãi (Promotions), Combo sản phẩm | Đúng |
| Loyalty program (điểm tích lũy) | Đúng, đơn giản hóa |
| Notifications, Reviews | Đúng |
| Admin: Quản lý sản phẩm, danh mục | Đúng |
| Admin: Quản lý đơn hàng, kho, vận chuyển | Đúng |
| Admin: Khuyến mãi, Banner, Blog, Email template | Đúng |
| Admin: Báo cáo, Analytics | Đúng |

## Tính năng SAI — Xóa bỏ

| Module | Lý do sai |
|---|---|
| Toàn bộ Seller Portal (~40 files) | Cửa hàng không có seller độc lập |
| RFQ (Request for Quotation) | Nghiệp vụ mua sắm B2B, không dùng trong bán lẻ |
| Contract Management | Khách lẻ không ký hợp đồng mua điện thoại |
| Price Agreements | Giá thỏa thuận riêng là đặc trưng B2B marketplace |
| Reverse Auction | Buyer đăng nhu cầu, seller đấu giá — sàn giao dịch |
| SLA Management | Cam kết dịch vụ platform–seller, không tồn tại trong 1 cửa hàng |
| Platform Fees | Phí hoa hồng thu từ seller — không có seller |
| Purchase Requisition (PR) | Quy trình mua sắm nội bộ doanh nghiệp |
| Goods Receipt Note (GRN) — customer side | Biên nhận nhập hàng không phải cho khách lẻ |
| Budget Management — buyer side | Ngân sách mua sắm doanh nghiệp B2B |
| Debit/Credit Notes | Đối soát tài chính platform–seller |
| Multi-Warehouse per Seller | Mỗi seller có kho riêng — marketplace concept |
| Supplier List/Compare — customer facing | Khách hàng bán lẻ không duyệt NCC |
| Buyer Team Management | Mua sắm theo nhóm B2B enterprise |
| Buyer Analytics/BI | Phân tích chi tiêu B2B enterprise |

---

## Phase 1 — Xóa toàn bộ Seller Portal

**Ưu tiên:** Cao nhất  
**Không có dependency**  
**Ước tính:** 2–3 giờ

### 1.1 Xóa toàn bộ thư mục `/components/seller/` (40 files)

```
components/seller/IntegrationHubPage.tsx
components/seller/SellerActivityPage.tsx
components/seller/SellerApprovalListPage.tsx
components/seller/SellerApprovalRulesPage.tsx
components/seller/SellerAuctionDetail.tsx
components/seller/SellerAuctionPage.tsx
components/seller/SellerChatPage.tsx
components/seller/SellerContractDetail.tsx
components/seller/SellerContractList.tsx
components/seller/SellerCreditPage.tsx
components/seller/SellerDashboard.tsx
components/seller/SellerDebitCreditDetail.tsx
components/seller/SellerDebitCreditPage.tsx
components/seller/SellerGuard.tsx
components/seller/SellerInvoiceDetail.tsx
components/seller/SellerInvoiceListPage.tsx
components/seller/SellerLayout.tsx
components/seller/SellerOrderDetail.tsx
components/seller/SellerOrderList.tsx
components/seller/SellerPaymentList.tsx
components/seller/SellerPriceAgreementDetail.tsx
components/seller/SellerPriceAgreementPage.tsx
components/seller/SellerProductForm.tsx
components/seller/SellerProductList.tsx
components/seller/SellerProfile.tsx
components/seller/SellerPromotionList.tsx
components/seller/SellerReports.tsx
components/seller/SellerReturnDetail.tsx
components/seller/SellerReturnListPage.tsx
components/seller/SellerReviewsPage.tsx
components/seller/SellerRFQDetail.tsx
components/seller/SellerRFQList.tsx
components/seller/SellerShipmentList.tsx
components/seller/SellerSLADetail.tsx
components/seller/SellerSLAPage.tsx
components/seller/SellerStaffList.tsx
components/seller/SellerWarehouse.tsx
components/seller/SellerWarehouseTransferTab.tsx
components/seller/SellerWarrantyPage.tsx
components/seller/WarehouseTransferPage.tsx
```

### 1.2 Cập nhật `routes.tsx`

Xóa:
- Tất cả import lazy của Seller components (~40 dòng)
- Toàn bộ route block `{ path: '/seller', element: <SellerLayout />, children: [...] }`
- Import `SellerLayout`, `SellerGuard`

### 1.3 Cập nhật `context/AuthContext.tsx`

```typescript
// SỬA:
type UserRole = 'admin' | 'customer'
// XÓA: 'seller' | 'buyer'

// SỬA logic redirect sau login:
// Nếu role === 'admin' → /admin
// Mặc định → /dashboard (customer)
// XÓA: redirect đến /seller
```

---

## Phase 2 — Xóa tính năng B2B khỏi Buyer

**Ưu tiên:** Cao  
**Làm sau Phase 1**  
**Ước tính:** 3–4 giờ

### 2.1 Xóa 20 files Buyer B2B trong `/components/buyer/`

```
components/buyer/BuyerRFQListPage.tsx
components/buyer/BuyerRFQCreatePage.tsx
components/buyer/BuyerRFQDetailPage.tsx
components/buyer/BuyerContractList.tsx
components/buyer/BuyerContractDetail.tsx
components/buyer/BuyerPriceAgreementPage.tsx
components/buyer/BuyerPriceAgreementDetail.tsx
components/buyer/BuyerAuctionListPage.tsx
components/buyer/BuyerAuctionDetail.tsx
components/buyer/BuyerPRListPage.tsx
components/buyer/BuyerPRDetail.tsx
components/buyer/BuyerGRNListPage.tsx
components/buyer/BuyerGRNDetail.tsx
components/buyer/BuyerBudgetPage.tsx
components/buyer/BuyerTeamPage.tsx
components/buyer/BuyerAnalyticsPage.tsx
components/buyer/SupplierListPage.tsx
components/buyer/SupplierDetailPage.tsx
components/buyer/BuyerSupplierComparePage.tsx
components/buyer/BuyerCreditSection.tsx
```

### 2.2 Cập nhật `routes.tsx` — xóa Buyer B2B routes

```typescript
// XÓA các routes:
{ path: 'suppliers', ... }
{ path: 'suppliers/compare', ... }
{ path: 'suppliers/:id', ... }
{ path: 'rfqs', ... }
{ path: 'rfqs/create', ... }
{ path: 'rfqs/:id', ... }
{ path: 'buyer/contracts', ... }
{ path: 'buyer/contracts/:id', ... }
{ path: 'auctions', ... }
{ path: 'auctions/:id', ... }
{ path: 'price-agreements', ... }
{ path: 'price-agreements/:id', ... }
{ path: 'team', ... }
{ path: 'analytics', ... }
{ path: 'purchase-requisitions', ... }
{ path: 'purchase-requisitions/:id', ... }
{ path: 'budgets', ... }
{ path: 'grns', ... }
{ path: 'grns/:id', ... }

// GIỮ LẠI (nhưng đơn giản hóa):
{ path: 'payments', ... }   // → đổi thành lịch sử thanh toán B2C
{ path: 'invoices', ... }   // → hóa đơn mua hàng
```

### 2.3 Sửa `BuyerLayout.tsx` — sidebar navigation

**Xóa** khỏi menu:
```
/suppliers, /rfqs, /auctions, /price-agreements
/team, /analytics, /budgets, /grns, /purchase-requisitions
```

**Menu sau khi sửa:**
```
Trang chủ tài khoản  →  /dashboard
Đơn hàng của tôi     →  /orders
Yêu thích            →  /wishlist
Điểm thưởng          →  /loyalty
Bảo hành             →  /warranty
Đổi trả              →  /returns
Theo dõi vận chuyển  →  /shipments
Hóa đơn              →  /invoices
Đánh giá của tôi     →  /reviews
Thông báo            →  /notifications
Hồ sơ cá nhân        →  /profile
```

### 2.4 Viết lại `BuyerDashboardPage.tsx`

Thay toàn bộ nội dung B2B dashboard thành màn hình **"Tài khoản của tôi"**:

```
Widgets hiển thị:
- Đơn hàng gần nhất (3 đơn)
- Điểm loyalty + tier hiện tại
- Sản phẩm đang bảo hành
- Sản phẩm yêu thích (3 sản phẩm)
- Shortcut: Đặt hàng mới, Kiểm tra IMEI, Thu cũ đổi mới
```

### 2.5 Sửa `BuyerMegaMenu.tsx`

Xóa: Link "Nhà cung cấp", "So sánh NCC"  
Giữ: Danh mục sản phẩm, thương hiệu

---

## Phase 3 — Xóa tính năng B2B khỏi Admin

**Ưu tiên:** Cao  
**Có thể làm song song với Phase 2**  
**Ước tính:** 2–3 giờ

### 3.1 Xóa 12 files Admin B2B trong `/components/admin/`

```
components/admin/AdminAuctionPage.tsx
components/admin/AdminPriceAgreementPage.tsx
components/admin/AdminSLAPage.tsx
components/admin/AdminPlatformFeePage.tsx
components/admin/AdminDebitCreditPage.tsx
components/admin/AdminPRPage.tsx
components/admin/AdminGRNPage.tsx
components/admin/AdminBudgetPage.tsx
components/admin/RFQManagement.tsx
components/admin/ContractManagement.tsx
components/admin/AdminSupplierPage.tsx
components/admin/AdminCertificateReview.tsx
```

### 3.2 Cập nhật `routes.tsx` — xóa Admin B2B routes

```typescript
// XÓA:
{ path: 'auctions', ... }
{ path: 'price-agreements', ... }
{ path: 'sla', ... }
{ path: 'platform-fees', ... }
{ path: 'debit-credit', ... }
{ path: 'purchase-requisitions', ... }
{ path: 'grns', ... }
{ path: 'budgets', ... }
{ path: 'rfqs', ... }
{ path: 'contracts', ... }
{ path: 'suppliers', ... }         // marketplace-style
{ path: 'certificates', ... }
```

### 3.3 Sửa `AdminLayout.tsx` — cập nhật sidebar

**XÓA** các sidebar items:
```
Nhà cung cấp (/admin/suppliers)
Chứng chỉ NCC (/admin/certificates)
Đấu giá (/admin/auctions)
Thỏa thuận giá (/admin/price-agreements)
Giám sát SLA (/admin/sla)
Phí sàn (/admin/platform-fees)
Công nợ (/admin/debit-credit)
Đề xuất mua (/admin/purchase-requisitions)
GRN (/admin/grns)
Ngân sách (/admin/budgets)
RFQ (/admin/rfqs)
Hợp đồng (/admin/contracts)
```

**ĐỔI TÊN** sidebar items:
```
"Duyệt sản phẩm"  →  "Quản lý sản phẩm"   (không cần duyệt)
"Kho toàn sàn"    →  "Kho hàng"
"Người dùng"      →  "Khách hàng"
```

**THÊM** vào sidebar (sau Phase 7):
```
Nhà cung cấp (NCC nội bộ)  →  /admin/suppliers-internal
Nhân viên                  →  /admin/staff
Trả góp                    →  /admin/installments
```

**Cấu trúc sidebar mục tiêu:**
```
Tổng quan
  └─ Dashboard
  └─ Phân tích & Báo cáo
  └─ Tạo báo cáo tùy chỉnh

Sản phẩm & Kho
  └─ Quản lý sản phẩm
  └─ Danh mục
  └─ Kho hàng & IMEI
  └─ Combo sản phẩm

Bán hàng
  └─ Đơn hàng
  └─ Trả hàng
  └─ Vận chuyển
  └─ Khuyến mãi
  └─ Trả góp [mới]
  └─ Thu cũ đổi mới
  └─ Banner quảng cáo

Khách hàng
  └─ Danh sách khách hàng
  └─ Đánh giá
  └─ Khách hàng thân thiết
  └─ Bảo hành

Nội dung
  └─ Blog & Bài viết
  └─ Email Templates
  └─ Tài liệu

Vận hành
  └─ Nhà cung cấp (NCC nội bộ) [mới]
  └─ Nhân viên [mới]
  └─ Cửa hàng

Tài chính
  └─ Thanh toán
  └─ Hóa đơn

Hệ thống
  └─ Cài đặt hệ thống
  └─ Nhật ký hoạt động
```

---

## Phase 4 — Xóa API Services B2B

**Ưu tiên:** Trung bình  
**Làm sau Phase 1–3**  
**Ước tính:** 1 giờ

### 4.1 Xóa 10 service files

```
services/auctionApi.ts
services/budgetApi.ts
services/debitCreditApi.ts
services/grnApi.ts
services/prApi.ts
services/priceAgreementApi.ts
services/rfqAttachmentApi.ts
services/slaApi.ts
services/supplierCategoryApi.ts
services/warehouseTransferApi.ts
```

### 4.2 Đổi tên

```
services/buyerDashboardApi.ts  →  services/customerDashboardApi.ts
```

### 4.3 Giữ lại (không thay đổi)

```
services/api.ts                  (core APIs: product, order, cart, auth...)
services/adminApi.ts
services/analyticsApi.ts
services/documentApi.ts
services/loyaltyApi.ts
services/warrantyApi.ts
services/orderStatusHistoryApi.ts
services/productImageApi.ts
services/reportBuilderApi.ts
services/integrationApi.ts       (xem xét xóa nếu không dùng)
```

---

## Phase 5 — Refactor `types/index.ts`

**Ưu tiên:** Cao  
**Làm sau Phase 1–4 để tránh TypeScript errors trung gian**  
**Ước tính:** 2–3 giờ

### 5.1 Xóa các types B2B marketplace

```typescript
// XÓA hoàn toàn:
interface RFQ
interface RFQItem
interface RFQQuote
interface Contract
interface ContractItem
interface PriceAgreement
interface PriceAgreementItem
interface ReverseAuction
interface AuctionBid
interface SLADefinition
interface SLAMetric
interface PurchaseRequisition
interface PRItem
interface GoodsReceiptNote
interface GRNItem
interface Budget
interface BudgetAllocation
interface DebitCreditNote
interface Supplier            (marketplace-style)
interface WarehouseTransfer
interface SellerProfile
type LoyaltyTransaction       (B2B specific, replace với B2C version)
```

### 5.2 Sửa types hiện có

```typescript
// SỬA UserRole:
type UserRole = 'admin' | 'customer'
// XÓA: 'buyer' | 'seller'

// SỬA User:
interface User {
  // XÓA: companyName, taxCode, businessType (B2B fields)
  // GIỮ: id, name, email, phone, role, avatar, addresses
}

// SỬA LoyaltyProgram — đơn giản hóa thành B2C:
interface LoyaltyProgram {
  id: string
  customerId: string
  customerName: string    // XÓA companyName
  tier: 'Đồng' | 'Bạc' | 'Vàng' | 'Kim cương'
  points: number
  totalSpend: number
  joinedAt: string
}
```

### 5.3 Thêm types mới

```typescript
// THÊM:
interface StaffMember {
  id: string
  name: string
  email: string
  phone: string
  role: 'manager' | 'staff' | 'warehouse' | 'technician'
  branchId: string
  branchName: string
  isActive: boolean
  joinedAt: string
}

interface InternalSupplier {
  id: string
  name: string                // VD: Apple Việt Nam, Samsung Việt Nam
  contactPerson: string
  phone: string
  email: string
  address: string
  categories: string[]        // Danh mục hàng cung cấp
  paymentTerms: string        // VD: Net 30, Net 60
  isActive: boolean
  createdAt: string
}

interface InstallmentPlan {
  id: string
  bankName: string            // VD: VPBank, Home Credit, MCredit
  logoUrl?: string
  months: number[]            // VD: [3, 6, 9, 12, 18, 24]
  interestRate: number        // % / tháng (0 = 0% lãi suất)
  minAmount: number           // Giá tối thiểu để áp dụng trả góp
  maxAmount?: number
  isActive: boolean
}

interface Branch {
  id: string
  name: string
  address: string
  district: string
  city: string
  phone: string
  managerId?: string
  isActive: boolean
}
```

---

## Phase 6 — Điều chỉnh tính năng còn lại

**Ưu tiên:** Trung bình  
**Làm sau Phase 1–5**  
**Ước tính:** 4–6 giờ

### 6.1 Sửa `AdminWarehousePage.tsx`

**Vấn đề:** Hiển thị theo từng seller, có cột `sellerName`, `sellerId`  
**Cần sửa:**
- Xóa cột `sellerName` / `sellerId`
- Thêm cột `branchName` (chi nhánh cửa hàng thay thế)
- Đổi label "NCC" → "Chi nhánh"
- Cập nhật mock data: thay `sellerId` bằng `branchId`
- StatsCard: đổi "Tổng NCC" → "Tổng kho"

### 6.2 Sửa `AdminWarrantyPage.tsx`

**Vấn đề:** Logic "can thiệp tranh chấp buyer vs seller"  
**Cần sửa:**
- Xóa cột `sellerName`, chỉ còn `customerName`
- Xóa logic "Can thiệp" với 2 bên, đổi thành "Xử lý claim"
- Đổi status flow: Mới → Đang xử lý → Đã giải quyết / Từ chối
- Xóa dialog "Can thiệp Admin" — admin IS người xử lý

### 6.3 Sửa `AdminReturnPage.tsx`

**Vấn đề:** Logic "tranh chấp buyer–seller", "cưỡng chế hoàn tiền"  
**Cần sửa:**
- Xóa cột `sellerName`, field `sellerName` trong interface
- Xóa button "Can thiệp", "Cưỡng chế hoàn tiền"
- Thêm action đơn giản: "Chấp nhận trả hàng" / "Từ chối" / "Đã hoàn tiền"
- Đổi status: bỏ "Đang tranh chấp", chỉ cần Chờ xử lý / Đang xử lý / Đã hoàn tiền / Từ chối

### 6.4 Sửa `LoginPage.tsx`

- Xóa tab "Đăng nhập Seller" hoặc option chọn loại tài khoản
- Chỉ còn: email + password → auto route dựa vào role (customer/admin)
- Đơn giản hóa giao diện

### 6.5 Sửa `RegisterPage.tsx`

- Xóa field: `companyName`, `taxCode`, `businessType`, "Đăng ký làm nhà bán hàng"
- Giữ: Họ tên, Email, Số điện thoại, Mật khẩu, Địa chỉ

### 6.6 Sửa `AdminLoyaltyPage.tsx`

- Xóa cột `companyName` (B2B field)
- Đổi ngưỡng tier phù hợp B2C:
  ```
  Đồng:      0 – 5,000,000₫ chi tiêu
  Bạc:       5,000,000 – 20,000,000₫
  Vàng:      20,000,000 – 50,000,000₫
  Kim cương: 50,000,000₫ trở lên
  ```

### 6.7 Sửa text toàn hệ thống: "Buyer" → "Khách hàng"

Tìm và thay thế trong tất cả file:
```
"Buyer"    → "Khách hàng"
"Seller"   → (xóa hoặc thay bằng "Cửa hàng")
"NCC"      → (xóa hoặc thay bằng "Kho" tùy context)
"Sàn"      → "Cửa hàng"  (VD: "toàn sàn" → "toàn hệ thống")
```

---

## Phase 7 — Bổ sung tính năng còn thiếu

**Ưu tiên:** Thấp (làm sau khi cleanup xong)  
**Ước tính:** 6–8 giờ

### 7.1 Tạo `AdminInstallmentPage.tsx` — Quản lý trả góp

Tính năng bắt buộc cho cửa hàng điện thoại.

**Nội dung trang:**
```
StatsCard: Tổng gói trả góp | Đang hoạt động | Tổng ngân hàng
Table: Ngân hàng | Số tháng | Lãi suất | Giá tối thiểu | Trạng thái | Actions
Dialog thêm/sửa gói trả góp
```

**Danh sách gói mẫu cần seed:**
```
VPBank:       3/6/9/12/18/24 tháng, 0% tháng đầu
Home Credit:  6/12/18/24 tháng, từ 1.79%/tháng
MCredit:      6/9/12 tháng
Shinhan:      3/6/9/12 tháng, 0% lãi suất
FE Credit:    3/6/9/12/18 tháng
```

### 7.2 Tạo `AdminStaffPage.tsx` — Quản lý nhân viên

Repurpose concept từ `SellerStaffList.tsx` (đã xóa) thành quản lý nhân viên cửa hàng.

**Nội dung trang:**
```
Filter: Theo chi nhánh | Theo vị trí
Table: Tên | Email | Vị trí | Chi nhánh | Trạng thái
Dialog thêm/sửa nhân viên
```

**Roles nhân viên:**
```
Quản lý cửa hàng | Tư vấn viên | Nhân viên kho | Kỹ thuật viên | Thu ngân
```

### 7.3 Tạo `AdminInternalSupplierPage.tsx` — NCC nội bộ

Đơn giản hóa từ `AdminSupplierPage.tsx` (đã xóa marketplace version).  
Chỉ admin thấy, không có portal riêng cho NCC.

**Nội dung trang:**
```
Table: Tên NCC | Người liên hệ | Danh mục hàng | Điều khoản TT | Trạng thái
Dialog thêm/sửa NCC
```

**NCC mẫu cần seed:**
```
Apple Việt Nam (phân phối chính hãng)
Samsung Việt Nam
Xiaomi Việt Nam
Các nhà phân phối: Digiworld, FPT Trading, Synnex FPT
```

### 7.4 Thêm `InstallmentSection` vào `ProductDetailPage.tsx`

Widget tính trả góp ngay trên trang sản phẩm:

```
[VPBank] [Shinhan] [Home Credit] [MCredit] [FE Credit]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Trả góp VPBank 0% lãi suất
  6 tháng: 3.500.000₫/tháng
  12 tháng: 1.800.000₫/tháng
  24 tháng: 950.000₫/tháng
  [Đăng ký trả góp]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Thứ tự thực hiện được đề xuất

```
Tuần 1:
  ├─ Phase 1: Xóa Seller portal (ưu tiên cao nhất, không dependency)
  └─ Phase 4: Xóa API services B2B (làm song song)

Tuần 2:
  ├─ Phase 2: Xóa Buyer B2B features
  └─ Phase 3: Xóa Admin B2B features (song song)

Tuần 3:
  ├─ Phase 5: Refactor types/index.ts
  └─ Phase 6: Điều chỉnh tính năng còn lại

Tuần 4:
  └─ Phase 7: Bổ sung tính năng phone store (trả góp, nhân viên, NCC nội bộ)
```

> **Lý do thứ tự này:**  
> Phase 1+4 trước để loại bỏ noise, tránh sửa file rồi lại xóa.  
> Phase 5 (types) sau cùng để tránh TypeScript errors cascade trong khi đang xóa files.  
> Phase 7 sau cùng vì là tính năng mới, không block gì.

---

## Checklist tổng hợp

### Phase 1 — Seller Portal
- [ ] Xóa 40 files trong `components/seller/`
- [ ] Xóa seller imports & routes trong `routes.tsx`
- [ ] Xóa role 'seller' trong `AuthContext.tsx`

### Phase 2 — Buyer B2B
- [ ] Xóa 20 files buyer B2B
- [ ] Xóa B2B buyer routes trong `routes.tsx`
- [ ] Sửa `BuyerLayout.tsx` — xóa B2B menu items
- [ ] Viết lại `BuyerDashboardPage.tsx` — customer account page
- [ ] Sửa `BuyerMegaMenu.tsx`

### Phase 3 — Admin B2B
- [ ] Xóa 12 files admin B2B
- [ ] Xóa B2B admin routes trong `routes.tsx`
- [ ] Sửa `AdminLayout.tsx` — cập nhật sidebar

### Phase 4 — API Services
- [ ] Xóa 10 B2B service files
- [ ] Đổi tên `buyerDashboardApi.ts` → `customerDashboardApi.ts`

### Phase 5 — Types
- [ ] Xóa B2B types trong `types/index.ts`
- [ ] Sửa `UserRole` type
- [ ] Thêm `StaffMember`, `InternalSupplier`, `InstallmentPlan`, `Branch` types

### Phase 6 — Refactor còn lại
- [ ] Sửa `AdminWarehousePage.tsx`
- [ ] Sửa `AdminWarrantyPage.tsx`
- [ ] Sửa `AdminReturnPage.tsx`
- [ ] Sửa `LoginPage.tsx`
- [ ] Sửa `RegisterPage.tsx`
- [ ] Sửa `AdminLoyaltyPage.tsx`
- [ ] Global text replace: Buyer/Seller → Khách hàng

### Phase 7 — Tính năng mới
- [ ] Tạo `AdminInstallmentPage.tsx`
- [ ] Tạo `AdminStaffPage.tsx`
- [ ] Tạo `AdminInternalSupplierPage.tsx`
- [ ] Thêm `InstallmentSection` vào `ProductDetailPage.tsx`
- [ ] Cập nhật routes + sidebar cho 3 trang mới

---

## Ghi chú kỹ thuật

- Sau mỗi phase, chạy `npm run build` để catch TypeScript errors sớm
- Ưu tiên xóa file trước khi sửa types để tránh lỗi cascade
- Không đổi tên file (giữ `BuyerLayout.tsx` thay vì `CustomerLayout.tsx`) để tránh update quá nhiều imports — chỉ đổi nội dung và text hiển thị
- Mock data trong `data/mockData.ts` và `data/mockAdminData.ts` cũng cần cập nhật: xóa field `sellerId`, `companyName` (B2B) khỏi user/customer objects

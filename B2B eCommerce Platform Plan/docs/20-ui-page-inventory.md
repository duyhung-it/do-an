# 20 — UI Page Inventory

> Danh sách đầy đủ tất cả các trang (pages) và components chính trong hệ thống B2B.
> Mỗi entry có: file path, route, mô tả, status và dependencies.
> Dùng để AI biết file nào cần chỉnh sửa khi implement feature.

---

## 1. Authentication Pages

| Component | File | Route | Mô tả |
|-----------|------|-------|-------|
| `LoginPage` | `components/auth/LoginPage.tsx` | `/login` | Form đăng nhập, chọn role demo |
| `RegisterPage` | `components/auth/RegisterPage.tsx` | `/register` | Form đăng ký tài khoản |
| `AuthLayout` | `components/auth/AuthLayout.tsx` | wrapper | Layout cho auth pages (centered card) |

---

## 2. Buyer (Storefront) Pages

### Core Storefront

| Component | File | Route | Mô tả |
|-----------|------|-------|-------|
| `HomePage` | `components/buyer/HomePage.tsx` | `/` | Trang chủ — banner, categories, featured products |
| `ProductListPage` | `components/buyer/ProductListPage.tsx` | `/products` | Catalog sản phẩm: filter, sort, pagination |
| `ProductDetailPage` | `components/buyer/ProductDetailPage.tsx` | `/products/:id` | Chi tiết SP: ảnh, specs, variants, reviews, related |
| `ProductComparePage` | `components/buyer/ProductComparePage.tsx` | `/products/compare` | So sánh tối đa 3 sản phẩm |
| `CartPage` | `components/buyer/CartPage.tsx` | `/cart` | Giỏ hàng: items, saved-for-later, checkout |
| `OrderListPage` | `components/buyer/OrderListPage.tsx` | `/orders` | Danh sách đơn hàng |
| `OrderDetailPage` | `components/buyer/OrderDetailPage.tsx` | `/orders/:id` | Chi tiết đơn: items, timeline, shipment |
| `OrderConfirmationPage` | `components/buyer/OrderConfirmationPage.tsx` | `/order-confirmation` | Xác nhận đặt hàng thành công |
| `SupplierListPage` | `components/buyer/SupplierListPage.tsx` | `/suppliers` | Danh sách NCC công khai |
| `SupplierDetailPage` | `components/buyer/SupplierDetailPage.tsx` | `/suppliers/:id` | Profile NCC, sản phẩm, đánh giá |

### Buyer B2B Features

| Component | File | Route | Mô tả |
|-----------|------|-------|-------|
| `BuyerDashboardPage` | `components/buyer/BuyerDashboardPage.tsx` | `/dashboard` | Dashboard tổng quan Buyer |
| `BuyerRFQListPage` | `components/buyer/BuyerRFQListPage.tsx` | `/rfqs` | Danh sách RFQ của buyer |
| `BuyerRFQCreatePage` | `components/buyer/BuyerRFQCreatePage.tsx` | `/rfqs/create` | Form tạo RFQ mới |
| `BuyerRFQDetailPage` | `components/buyer/BuyerRFQDetailPage.tsx` | `/rfqs/:id` | Chi tiết RFQ: quotations, so sánh |
| `BuyerContractList` | `components/buyer/BuyerContractList.tsx` | `/buyer/contracts` | Danh sách hợp đồng |
| `BuyerContractDetail` | `components/buyer/BuyerContractDetail.tsx` | `/buyer/contracts/:id` | Chi tiết hợp đồng: items, milestones, sign |
| `BuyerPaymentList` | `components/buyer/BuyerPaymentList.tsx` | `/payments` | Danh sách thanh toán |
| `BuyerPaymentDetail` | `components/buyer/BuyerPaymentDetail.tsx` | `/payments/:id` | Chi tiết thanh toán + transactions |
| `BuyerInvoiceListPage` | `components/buyer/BuyerInvoiceListPage.tsx` | `/invoices` | Danh sách hoá đơn |
| `BuyerInvoiceDetail` | `components/buyer/BuyerInvoiceDetail.tsx` | `/invoices/:id` | Chi tiết hoá đơn |
| `BuyerReturnListPage` | `components/buyer/BuyerReturnListPage.tsx` | `/returns` | Danh sách trả hàng |
| `BuyerReturnDetail` | `components/buyer/BuyerReturnDetail.tsx` | `/returns/:id` | Chi tiết yêu cầu trả hàng |
| `BuyerShipmentList` | `components/buyer/BuyerShipmentList.tsx` | `/shipments` | Theo dõi vận chuyển |
| `BuyerShipmentDetail` | `components/buyer/BuyerShipmentDetail.tsx` | `/shipments/:id` | Chi tiết shipment + tracking events |
| `BuyerGRNListPage` | `components/buyer/BuyerGRNListPage.tsx` | `/grns` | Danh sách biên bản nhận hàng |
| `BuyerGRNDetail` | `components/buyer/BuyerGRNDetail.tsx` | `/grns/:id` | Chi tiết GRN |
| `BuyerPRListPage` | `components/buyer/BuyerPRListPage.tsx` | `/purchase-requisitions` | Danh sách PR |
| `BuyerPRDetail` | `components/buyer/BuyerPRDetail.tsx` | `/purchase-requisitions/:id` | Chi tiết PR |
| `BuyerBudgetPage` | `components/buyer/BuyerBudgetPage.tsx` | `/budgets` | Budget plans & allocations |
| `BuyerOrderTemplatePage` | `components/buyer/BuyerOrderTemplatePage.tsx` | `/order-templates` | Quản lý mẫu đơn hàng |
| `BuyerBulkOrderPage` | `components/buyer/BuyerBulkOrderPage.tsx` | `/bulk-order` | Đặt hàng hàng loạt |
| `BuyerQuickOrderPage` | `components/buyer/BuyerQuickOrderPage.tsx` | `/quick-order` | Đặt hàng nhanh bằng SKU |
| `BuyerAnalyticsPage` | `components/buyer/BuyerAnalyticsPage.tsx` | `/analytics` | Phân tích mua sắm |
| `BuyerAuctionListPage` | `components/buyer/BuyerAuctionListPage.tsx` | `/auctions` | Danh sách đấu giá ngược |
| `BuyerAuctionDetail` | `components/buyer/BuyerAuctionDetail.tsx` | `/auctions/:id` | Chi tiết đấu giá ngược |
| `BuyerPriceAgreementPage` | `components/buyer/BuyerPriceAgreementPage.tsx` | `/price-agreements` | Thỏa thuận giá |
| `BuyerPriceAgreementDetail`| `components/buyer/BuyerPriceAgreementDetail.tsx` | `/price-agreements/:id`| Chi tiết thỏa thuận |
| `BuyerTeamPage` | `components/buyer/BuyerTeamPage.tsx` | `/team` | Quản lý team members |
| `BuyerCreditSection` | `components/buyer/BuyerCreditSection.tsx` | embedded | Component hạn mức tín dụng (trong Dashboard) |
| `BuyerSupplierComparePage` | `components/buyer/BuyerSupplierComparePage.tsx` | `/suppliers/compare` | So sánh NCC |
| `BuyerLoyaltyPage` | `components/buyer/BuyerLoyaltyPage.tsx` | `/loyalty` | Chương trình khách hàng thân thiết |

### Buyer Lifestyle / B2C Features

| Component | File | Route | Mô tả |
|-----------|------|-------|-------|
| `BuyerWishlistPage` | `components/buyer/BuyerWishlistPage.tsx` | `/wishlist` | Danh sách yêu thích (folders) |
| `BuyerReviewsPage` | `components/buyer/BuyerReviewsPage.tsx` | `/reviews` | Lịch sử đánh giá của buyer |
| `BuyerWarrantyPage` | `components/buyer/BuyerWarrantyPage.tsx` | `/warranty` | Theo dõi bảo hành |
| `BuyerPromotionPage` | `components/buyer/BuyerPromotionPage.tsx` | `/promotions` | Khuyến mãi đang active |
| `BuyerProfilePage` | `components/buyer/BuyerProfilePage.tsx` | `/profile` | Hồ sơ cá nhân, địa chỉ, cài đặt |
| `TradeInPage` | `components/buyer/TradeInPage.tsx` | `/trade-in` | Thu đổi máy cũ (B2C feature) |
| `IMEICheckPage` | `components/buyer/IMEICheckPage.tsx` | `/imei-check` | Kiểm tra IMEI |
| `BlogPage` | `components/buyer/BlogPage.tsx` | `/blog` | Trang blog / tin tức |
| `StoreLocatorPage` | `components/buyer/StoreLocatorPage.tsx` | `/stores` | Tìm cửa hàng |
| `PhoneFinderPage` | `components/buyer/PhoneFinderPage.tsx` | `/phone-finder` | Công cụ chọn điện thoại |

### Buyer Shared Components (trong BuyerLayout)

| Component | File | Mô tả |
|-----------|------|-------|
| `BuyerLayout` | `components/buyer/BuyerLayout.tsx` | Shell: header, sidebar (B2B), footer |
| `BuyerMegaMenu` | `components/buyer/BuyerMegaMenu.tsx` | Mega menu danh mục sản phẩm |
| `MiniCart` | `components/buyer/MiniCart.tsx` | Giỏ hàng mini (dropdown trong header) |
| `BuyerGuard` | `components/buyer/BuyerGuard.tsx` | Route guard cho Buyer pages |

---

## 3. Seller Pages

| Component | File | Route | Mô tả |
|-----------|------|-------|-------|
| `SellerDashboard` | `components/seller/SellerDashboard.tsx` | `/seller` | Dashboard NCC: doanh thu, đơn hàng, tồn kho |
| `SellerProductList` | `components/seller/SellerProductList.tsx` | `/seller/products` | Danh sách sản phẩm |
| `SellerProductForm` | `components/seller/SellerProductForm.tsx` | `/seller/products/new` | Form thêm/sửa sản phẩm |
| `SellerOrderList` | `components/seller/SellerOrderList.tsx` | `/seller/orders` | Danh sách đơn hàng |
| `SellerOrderDetail` | `components/seller/SellerOrderDetail.tsx` | `/seller/orders/:id` | Chi tiết đơn hàng, cập nhật status |
| `SellerRFQList` | `components/seller/SellerRFQList.tsx` | `/seller/rfqs` | Danh sách RFQ từ marketplace |
| `SellerRFQDetail` | `components/seller/SellerRFQDetail.tsx` | `/seller/rfqs/:id` | Chi tiết RFQ, tạo báo giá |
| `SellerContractList` | `components/seller/SellerContractList.tsx` | `/seller/contracts` | Danh sách hợp đồng |
| `SellerContractDetail` | `components/seller/SellerContractDetail.tsx` | `/seller/contracts/:id` | Chi tiết hợp đồng, ký |
| `SellerWarehouse` | `components/seller/SellerWarehouse.tsx` | `/seller/warehouse` | Quản lý kho: tồn kho, nhập/xuất, cảnh báo |
| `SellerWarehouseTransferTab`| `components/seller/SellerWarehouseTransferTab.tsx`| embedded | Tab chuyển kho trong SellerWarehouse |
| `SellerShipmentList` | `components/seller/SellerShipmentList.tsx` | `/seller/shipments` | Quản lý vận chuyển |
| `SellerPaymentList` | `components/seller/SellerPaymentList.tsx` | `/seller/payments` | Quản lý thanh toán |
| `SellerInvoiceListPage` | `components/seller/SellerInvoiceListPage.tsx` | `/seller/invoices` | Danh sách hoá đơn |
| `SellerInvoiceDetail` | `components/seller/SellerInvoiceDetail.tsx` | `/seller/invoices/:id` | Chi tiết hoá đơn |
| `SellerCreditPage` | `components/seller/SellerCreditPage.tsx` | `/seller/credit` | Quản lý hạn mức tín dụng |
| `SellerDebitCreditPage` | `components/seller/SellerDebitCreditPage.tsx` | `/seller/debit-credit` | Ghi nợ/ghi có |
| `SellerDebitCreditDetail` | `components/seller/SellerDebitCreditDetail.tsx` | `/seller/debit-credit/:id` | Chi tiết note |
| `SellerReturnListPage` | `components/seller/SellerReturnListPage.tsx` | `/seller/returns` | Danh sách trả hàng |
| `SellerReturnDetail` | `components/seller/SellerReturnDetail.tsx` | `/seller/returns/:id` | Xử lý yêu cầu trả hàng |
| `SellerReviewsPage` | `components/seller/SellerReviewsPage.tsx` | `/seller/reviews` | Quản lý đánh giá từ buyer |
| `SellerPromotionList` | `components/seller/SellerPromotionList.tsx` | `/seller/promotions` | Quản lý khuyến mãi |
| `SellerStaffList` | `components/seller/SellerStaffList.tsx` | `/seller/staff` | Quản lý nhân sự |
| `SellerApprovalListPage` | `components/seller/SellerApprovalListPage.tsx` | `/seller/approvals` | Danh sách phê duyệt |
| `SellerApprovalRulesPage` | `components/seller/SellerApprovalRulesPage.tsx` | `/seller/approval-rules` | Cấu hình quy tắc phê duyệt |
| `SellerAuctionPage` | `components/seller/SellerAuctionPage.tsx` | `/seller/auctions` | Quản lý đấu giá ngược |
| `SellerAuctionDetail` | `components/seller/SellerAuctionDetail.tsx` | `/seller/auctions/:id` | Chi tiết đấu giá, quản lý bids |
| `SellerPriceAgreementPage` | `components/seller/SellerPriceAgreementPage.tsx` | `/seller/price-agreements` | Quản lý thỏa thuận giá |
| `SellerPriceAgreementDetail`| `components/seller/SellerPriceAgreementDetail.tsx`| `/seller/price-agreements/:id`| Chi tiết |
| `SellerSLAPage` | `components/seller/SellerSLAPage.tsx` | `/seller/sla` | Quản lý SLA |
| `SellerSLADetail` | `components/seller/SellerSLADetail.tsx` | `/seller/sla/:id` | Chi tiết SLA |
| `SellerWarrantyPage` | `components/seller/SellerWarrantyPage.tsx` | `/seller/warranties` | Quản lý bảo hành |
| `SellerReports` | `components/seller/SellerReports.tsx` | `/seller/reports` | Báo cáo doanh thu, sản phẩm, khách hàng |
| `SellerActivityPage` | `components/seller/SellerActivityPage.tsx` | `/seller/activity` | Nhật ký hoạt động |
| `SellerProfile` | `components/seller/SellerProfile.tsx` | `/seller/profile` | Hồ sơ NCC, chứng chỉ, cài đặt |
| `SellerLayout` | `components/seller/SellerLayout.tsx` | wrapper | Shell: sidebar, header Seller |
| `SellerGuard` | `components/seller/SellerGuard.tsx` | guard | Route guard cho Seller pages |

---

## 4. Admin Pages

| Component | File | Route | Mô tả |
|-----------|------|-------|-------|
| `AdminDashboard` | `components/admin/AdminDashboard.tsx` | `/admin` | Dashboard tổng quan platform |
| `UserManagement` | `components/admin/UserManagement.tsx` | `/admin/customers` | Quản lý users/buyers |
| `AdminSupplierPage` | `components/admin/AdminSupplierPage.tsx` | `/admin/suppliers` | Quản lý NCC, verify |
| `CategoryManagement` | `components/admin/CategoryManagement.tsx` | `/admin/categories` | Quản lý danh mục |
| `ProductApproval` | `components/admin/ProductApproval.tsx` | `/admin/products` | Duyệt/quản lý sản phẩm |
| `AdminInventoryPage` | `components/admin/AdminInventoryPage.tsx` | `/admin/inventory` | Xem tổng quan tồn kho |
| `OrderOverview` | `components/admin/OrderOverview.tsx` | `/admin/orders` | Tổng quan đơn hàng toàn platform |
| `AdminShipmentPage` | `components/admin/AdminShipmentPage.tsx` | `/admin/shipments` | Quản lý vận chuyển |
| `AdminPaymentPage` | `components/admin/AdminPaymentPage.tsx` | `/admin/payments` | Quản lý thanh toán |
| `AdminInvoicePage` | `components/admin/AdminInvoicePage.tsx` | `/admin/invoices` | Quản lý hoá đơn |
| `RFQManagement` | `components/admin/RFQManagement.tsx` | `/admin/rfqs` | Giám sát RFQ marketplace |
| `ContractManagement` | `components/admin/ContractManagement.tsx` | `/admin/contracts` | Quản lý hợp đồng |
| `ReviewManagement` | `components/admin/ReviewManagement.tsx` | `/admin/reviews` | Duyệt/ẩn reviews |
| `AdminCertificateReview` | `components/admin/AdminCertificateReview.tsx` | `/admin/certificates` | Duyệt chứng chỉ NCC |
| `AdminPromotionPage` | `components/admin/AdminPromotionPage.tsx` | `/admin/promotions` | Quản lý khuyến mãi platform-wide |
| `AdminTradeInPage` | `components/admin/AdminTradeInPage.tsx` | `/admin/trade-in` | Quản lý Trade-in requests |
| `AdminReportPage` | `components/admin/AdminReportPage.tsx` | `/admin/reports` | Báo cáo platform tổng thể |
| `AdminActivityLog` | `components/admin/AdminActivityLog.tsx` | `/admin/activity-logs` | Nhật ký hoạt động toàn hệ thống |
| `SystemSettings` | `components/admin/SystemSettings.tsx` | `/admin/settings` | Cài đặt hệ thống, email templates, banners |
| `AdminLayout` | `components/admin/AdminLayout.tsx` | wrapper | Shell: sidebar, header Admin |
| `AdminGuard` | `components/admin/AdminGuard.tsx` | guard | Route guard cho Admin pages |

---

## 5. Shared Components

| Component | File | Mô tả |
|-----------|------|-------|
| `NotificationCenterPage` | `components/shared/NotificationCenterPage.tsx` | Trung tâm thông báo |
| `NotFoundPage` | `components/shared/NotFoundPage.tsx` | 404 page |

---

## 6. Context Providers

| Context | File | Mô tả |
|---------|------|-------|
| `AuthContext` | `context/AuthContext.tsx` | Auth state, login/logout, user info |
| `CartContext` | `context/CartContext.tsx` | Giỏ hàng state (localStorage) |
| `WishlistContext` | `context/WishlistContext.tsx` | Wishlist state (localStorage) |
| `NotificationContext` | `context/NotificationContext.tsx` | Notifications, unread count |

---

## 7. Services (API Layer)

| Service | File | Domain |
|---------|------|--------|
| `productApi` | `services/api.ts` | Products, Categories, Suppliers |
| `orderApi` | `services/api.ts` | Orders, OrderItems, CartItems |
| `rfqApi` | `services/api.ts` | RFQs, Quotations, Contracts |
| `shipmentApi` | `services/api.ts` | Shipments, ShipmentEvents |
| `paymentApi` | `services/api.ts` | Payments, Invoices |
| `warehouseApi` | `services/api.ts` | Warehouses, Inventory |
| `inventoryApi` | `services/api.ts` | InventoryItems, StockMovements |
| `reviewApi` | `services/api.ts` | ProductReviews, SupplierReviews |
| `notificationApi` | `services/api.ts` | Notifications |
| `returnApi` | `services/api.ts` | ReturnRequests |
| `promotionApi` | `services/api.ts` | Promotions, VolumeDiscounts |
| `approvalApi` | `services/api.ts` | ApprovalRequests |
| `authApi` | `services/api.ts` | Auth, Users, Addresses |
| `prApi` | `services/prApi.ts` | PurchaseRequisitions, PRItems |
| `grnApi` | `services/grnApi.ts` | GoodsReceivedNotes |
| `budgetApi` | `services/budgetApi.ts` | BudgetPlans, Allocations |
| `reportBuilderApi` | `services/reportBuilderApi.ts` | Custom Reports |
| `integrationApi` | `services/integrationApi.ts` | Integrations, Webhooks, APIKeys |
| `documentApi` | `services/documentApi.ts` | Documents |
| `loyaltyApi` | `services/loyaltyApi.ts` | Loyalty Programs, Points |
| `rfqAttachmentApi` | `services/rfqAttachmentApi.ts` | RFQ Attachments |
| `warehouseTransferApi` | `services/warehouseTransferApi.ts` | Warehouse Transfers |
| `debitCreditApi` | `services/debitCreditApi.ts` | DebitCreditNotes |
| `productImageApi` | `services/productImageApi.ts` | Product Images |
| `shippingRateApi` | `services/api.ts` | ShippingRates |
| `adminApi` | `services/adminApi.ts` | SystemConfigs, PlatformFees |

---

## 8. Tổng hợp số lượng

| Category | File count |
|----------|-----------|
| Auth pages | 3 |
| Buyer pages | 55+ |
| Seller pages | 38 |
| Admin pages | 21 |
| Shared | 3+ |
| Context | 4 |
| Services | 25+ |
| **Tổng** | **~150+** |

---

## 9. Pages chưa implement (Planned)

| Feature | Route dự kiến | Priority |
|---------|--------------|---------|
| Buyer Chat | `/chat` | Medium |
| Seller Chat | `/seller/chat` | Medium |
| Buyer Document Center | `/documents` | Low |
| Admin Platform Fee Config | `/admin/platform-fees` | High |
| Admin Email Template Editor | `/admin/email-templates` | High |
| Admin Banner Manager | `/admin/banners` | Medium |
| Admin Contract Overview | `/admin/contracts` | Low |
| Seller Integration Config | `/seller/integrations` | Low |

---

## Tài liệu liên quan

- [21-ui-components-library.md](./21-ui-components-library.md) — Thư viện UI components tái sử dụng
- [32-vibe-coding-context.md](./32-vibe-coding-context.md) — Vibe coding context (AI coding guide)
- [18-roles-permissions.md](./18-roles-permissions.md) — Route Guards, Data Isolation
- [02-architecture.md](./02-architecture.md) — Architecture & routing

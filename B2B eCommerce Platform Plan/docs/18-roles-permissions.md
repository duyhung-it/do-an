# 18 — Roles & Permissions

> Định nghĩa vai trò, ma trận quyền truy cập và data isolation rules cho hệ thống B2B.

---

## 1. Hệ thống vai trò

### 3 vai trò chính

```typescript
type UserRole = 'Buyer' | 'Seller' | 'Admin';
```

| Role | Mô tả | Login redirect |
|------|-------|---------------|
| `Buyer` | Người mua hàng (doanh nghiệp) | `/` (HomePage) |
| `Seller` | Nhà cung cấp (supplier) | `/seller/dashboard` |
| `Admin` | Quản trị viên nền tảng | `/admin/dashboard` |

### Buyer Sub-roles (BuyerTeamMember)

```typescript
type BuyerTeamRole = 'Owner' | 'Manager' | 'Viewer';
```

| Sub-role | Quyền |
|----------|-------|
| `Owner` | Toàn quyền, quản lý team, phê duyệt mọi thứ |
| `Manager` | Tạo/duyệt đơn hàng, quản lý PR, xem báo cáo |
| `Viewer` | Chỉ xem, không tạo/sửa/xóa |

### Seller Sub-roles (StaffRole)

```typescript
type StaffRole = 'Chủ DN' | 'Quản lý' | 'NV Bán hàng' | 'Thủ kho' | 'Kế toán';
```

| Sub-role | Phạm vi truy cập |
|----------|-----------------|
| `Chủ DN` | Toàn quyền trên tài khoản Seller |
| `Quản lý` | Quản lý đơn hàng, sản phẩm, nhân sự, xem tài chính |
| `NV Bán hàng` | Quản lý đơn hàng, RFQ, báo giá, xem sản phẩm |
| `Thủ kho` | Quản lý kho hàng, tồn kho, chuyển kho |
| `Kế toán` | Xem và xử lý tài chính, hoá đơn, thanh toán |

---

## 2. Buyer Access Matrix

| Feature | Owner | Manager | Viewer |
|---------|-------|---------|--------|
| **Đơn hàng** | Xem/Tạo/Sửa/Huỷ | Xem/Tạo/Huỷ | Xem |
| **Giỏ hàng** | Xem/Tạo/Sửa/Xóa | Xem/Tạo/Sửa/Xóa | Xem |
| **Wishlist** | Xem/Tạo/Sửa/Xóa | Xem/Tạo/Sửa/Xóa | Xem |
| **RFQ** | Xem/Tạo/Sửa/Gửi | Xem/Tạo/Gửi | Xem |
| **Báo giá** | Xem/Chấp nhận/Từ chối | Xem/Chấp nhận | Xem |
| **Hợp đồng** | Xem/Ký/Sửa | Xem/Ký | Xem |
| **Thanh toán** | Xem/Thanh toán | Xem | Xem |
| **Hoá đơn** | Xem/Tải | Xem/Tải | Xem |
| **Trả hàng** | Xem/Tạo | Xem/Tạo | Xem |
| **Đánh giá** | Xem/Tạo/Sửa | Xem/Tạo | Xem |
| **PR** | Xem/Tạo/Duyệt/Huỷ | Xem/Tạo/Gửi | Xem |
| **Ngân sách** | Xem/Tạo/Sửa | Xem/Tạo | Xem |
| **Phê duyệt** | Xem/Duyệt/Từ chối | Xem/Duyệt | Xem |
| **Địa chỉ** | Xem/Tạo/Sửa/Xóa | Xem/Tạo/Sửa | Xem |
| **Thông báo** | Xem/Cài đặt | Xem/Cài đặt | Xem |
| **Báo cáo** | Xem/Xuất | Xem/Xuất | Xem |
| **Quản lý Team** | Xem/Tạo/Sửa/Xóa | Xem | ❌ |
| **Loyalty** | Xem/Đổi điểm | Xem/Đổi điểm | Xem |
| **Đấu giá ngược** | Xem/Tạo/Quản lý | Xem/Tạo | Xem |
| **Thỏa thuận giá** | Xem/Tạo/Ký | Xem | Xem |

---

## 3. Seller Access Matrix

| Feature | Chủ DN | Quản lý | NV Bán hàng | Thủ kho | Kế toán |
|---------|--------|---------|-------------|---------|---------|
| **Dashboard** | ✅ Đầy đủ | ✅ Đầy đủ | ✅ Giới hạn | ✅ Kho | ✅ Tài chính |
| **Sản phẩm** | CRUD | CRUD | Xem/Sửa giá | Xem | Xem |
| **Đơn hàng** | CRUD+Status | CRUD+Status | Xem+Status | Xem | Xem |
| **RFQ** | Xem/Trả lời | Xem/Trả lời | Xem/Trả lời | ❌ | ❌ |
| **Báo giá** | CRUD | CRUD | Xem/Tạo | ❌ | Xem |
| **Hợp đồng** | Xem/Ký | Xem/Ký | Xem | ❌ | Xem |
| **Kho hàng** | ✅ Đầy đủ | Xem+Điều chỉnh | ❌ | ✅ Đầy đủ | Xem |
| **Tồn kho** | ✅ Đầy đủ | Xem+Điều chỉnh | ❌ | ✅ Đầy đủ | Xem |
| **Chuyển kho** | ✅ Đầy đủ | Xem/Duyệt | ❌ | Xem/Tạo | ❌ |
| **Vận chuyển** | ✅ Đầy đủ | Xem/Tạo | Xem | Xem | ❌ |
| **Thanh toán** | ✅ Đầy đủ | Xem | ❌ | ❌ | ✅ Đầy đủ |
| **Hoá đơn** | ✅ Đầy đủ | Xem | ❌ | ❌ | ✅ CRUD |
| **Công nợ** | ✅ Đầy đủ | Xem | ❌ | ❌ | ✅ Đầy đủ |
| **Trả hàng** | ✅ Đầy đủ | Xem/Xử lý | Xem | ❌ | Xem |
| **Đánh giá** | Xem/Trả lời | Xem/Trả lời | Xem | ❌ | ❌ |
| **Khuyến mãi** | CRUD | CRUD | Xem | ❌ | ❌ |
| **Nhân sự** | CRUD | Xem | ❌ | ❌ | ❌ |
| **Phê duyệt** | ✅ Đầy đủ | Xem/Duyệt | ❌ | ❌ | ❌ |
| **Báo cáo** | ✅ Đầy đủ | ✅ Đầy đủ | Xem doanh số | ❌ | ✅ Tài chính |
| **Cài đặt NCC** | ✅ Đầy đủ | Xem | ❌ | ❌ | ❌ |

---

## 4. Admin Access Matrix

*Admin có full access vào tất cả features. Một số actions đặc biệt:*

| Feature | Admin actions |
|---------|--------------|
| **Users** | Xem/Sửa/Khoá/Unlock/Thay đổi role |
| **Suppliers** | Xem/Duyệt/Verify/Khoá |
| **Certificates** | Xem/Duyệt/Từ chối |
| **Categories** | CRUD/Sắp xếp |
| **Products** | Xem/Duyệt/Ẩn |
| **Orders** | Xem tất cả/Can thiệp |
| **Payments** | Xem tất cả/Điều chỉnh thủ công |
| **Invoices** | Xem tất cả |
| **Reviews** | Xem/Duyệt/Ẩn/Xóa |
| **RFQs** | Giám sát marketplace |
| **Contracts** | Xem tất cả/Giải quyết tranh chấp |
| **System Settings** | Full control |
| **Platform Fees** | CRUD |
| **Email Templates** | CRUD + Preview |
| **Banner Configs** | CRUD |
| **Reports** | Full analytics |
| **Activity Logs** | Xem tất cả |

---

## 5. Permission Keys

*Danh sách 50+ permission keys nhóm theo domain:*

### Product & Category

```
product.view
product.create
product.update
product.delete
product.status_change
category.view
category.manage
```

### Order

```
order.view
order.create
order.cancel
order.status_change
order.template.manage
```

### Sourcing

```
rfq.view
rfq.create
rfq.submit
quotation.view
quotation.create
quotation.accept
contract.view
contract.sign
contract.manage
```

### Warehouse

```
warehouse.view
warehouse.manage
inventory.view
inventory.adjust
stock.movement.view
stock.alert.manage
warehouse.transfer.view
warehouse.transfer.create
warehouse.transfer.approve
```

### Finance

```
payment.view
payment.record
invoice.view
invoice.create
invoice.send
credit.view
credit.manage
debit_credit.view
debit_credit.confirm
```

### Procurement

```
pr.view
pr.create
pr.submit
pr.approve
grn.view
grn.create
grn.confirm
budget.view
budget.manage
approval.view
approval.approve
```

### Customer Service

```
return.view
return.process
review.view
review.reply
review.moderate
```

### Reporting

```
report.view
report.export
report.create
analytics.view
```

### System (Admin only)

```
user.manage
supplier.verify
system.settings
platform.fees.manage
email.template.manage
banner.manage
activity_log.view
```

---

## 6. Route Guards

```typescript
// /src/app/routes.ts — Guard mapping
const ROUTE_GUARDS = {
  '/'                     : null,           // Public
  '/products/*'           : null,           // Public (catalog)
  '/suppliers/*'          : null,           // Public
  '/login'                : null,
  '/register'             : null,

  '/dashboard'            : 'Buyer',        // BuyerGuard
  '/orders/*'             : 'Buyer',
  '/cart'                 : 'Buyer',
  '/wishlist'             : 'Buyer',
  '/rfqs/*'               : 'Buyer',
  '/buyer/contracts/*'    : 'Buyer',
  '/payments/*'           : 'Buyer',

  '/seller/*'             : 'Seller',       // SellerGuard
  '/seller/dashboard'     : 'Seller',
  '/seller/orders'        : 'Seller',
  '/seller/products'      : 'Seller',
  '/seller/warehouse'     : 'Seller',

  '/admin/*'              : 'Admin',        // AdminGuard
  '/admin/dashboard'      : 'Admin',
  '/admin/users'          : 'Admin',
  '/admin/suppliers'      : 'Admin',
};
```

---

## 7. Data Isolation Rules

### Buyer — Quy tắc filter data

```typescript
// orderApi.getOrders() — Buyer chỉ thấy đơn của mình
if (user.role === 'Buyer') {
  query.buyerId = user.id;
}

// RFQ — Buyer chỉ thấy RFQ của mình
if (user.role === 'Buyer') {
  query.buyerId = user.id;
}
```

### Seller — Quy tắc filter data

```typescript
// orderApi.getOrders() — Seller chỉ thấy đơn gửi cho mình
if (user.role === 'Seller') {
  query.supplierId = user.supplierId;
}

// Inventory — Seller chỉ thấy tồn kho của mình
if (user.role === 'Seller') {
  query.supplierId = user.supplierId;
}

// Reviews — Seller chỉ thấy review sp của mình
if (user.role === 'Seller') {
  query.supplierId = user.supplierId;
}
```

### Admin — Không filter

```typescript
// Admin thấy TẤT CẢ dữ liệu — không apply query filter theo user
if (user.role === 'Admin') {
  // Không thêm filter gì
}
```

---

## 8. Cross-role Interactions

```
Buyer ↔ Seller (trực tiếp):
  - RFQ: Buyer tạo → Seller nhận và báo giá
  - Quotation: Seller gửi → Buyer xem và chấp nhận/từ chối
  - Contract: Cả 2 ký
  - Review: Buyer đánh giá → Seller reply
  - Return: Buyer tạo → Seller xử lý
  - Chat: (future feature)

Seller ↔ Admin:
  - Product Approval: Seller submit → Admin duyệt (future)
  - Certificate Review: Seller upload → Admin duyệt
  - Supplier Verification: Admin verify supplier

Buyer ↔ Admin:
  - Dispute resolution (future)
  - Account issues

All roles ↔ System:
  - Notifications: System gửi cho tất cả roles
  - Activity logs: Ghi lại actions của tất cả roles
```

---

## 9. Approval Authority Matrix

*Áp dụng cho Buyer-side approvals (PR, Order overrides, Budget):*

| Giá trị đơn hàng | Approver yêu cầu | StaffRole tương đương |
|-----------------|-----------------|----------------------|
| < 10,000,000 VND | Tự phê duyệt | Viewer (Manager) |
| 10M - 50M VND | Manager | Manager |
| 50M - 200M VND | Director | Chủ DN (mid-level) |
| > 200M VND | CEO/Owner | Owner |

*Seller-side approvals (Warehouse Transfer, Discount Override):*

| Action | Required Role |
|--------|--------------|
| Warehouse Transfer (bất kỳ) | Quản lý trở lên |
| Discount > 20% | Chủ DN |
| Credit Limit thay đổi | Chủ DN |
| Stock Adjustment thủ công | Thủ kho trở lên |

---

## 10. Audit Trail Requirements

*20+ events bắt buộc phải ghi ActivityLog:*

```
AUTH:
  user.login, user.logout, user.failed_login (failed attempts)
  user.password_change, user.role_changed

PRODUCT:
  product.created, product.updated, product.deleted
  product.status_changed (active ↔ inactive)

ORDER:
  order.created, order.status_changed, order.cancelled

FINANCE:
  payment.recorded, payment.reminded
  invoice.sent, invoice.marked_paid
  credit_limit.adjusted

CONTRACT:
  contract.signed (buyer), contract.signed (seller)
  contract.status_changed, contract.renewed

SOURCING:
  rfq.submitted, quotation.submitted, quotation.accepted

SYSTEM (Admin):
  user.account_locked, user.account_unlocked
  supplier.verified, supplier.certificate_approved
  system_config.updated, platform_fee.updated

WAREHOUSE:
  stock.adjusted (manual), warehouse_transfer.approved
```

---

## Tài liệu liên quan

- [19-permission-implementation.md](./19-permission-implementation.md) — Cách implement permissions trong code
- [32-vibe-coding-context.md](./32-vibe-coding-context.md) — AuthContext, Guard components
- [02-architecture.md](./02-architecture.md) — Route Guards, Auth Flow
- [03-coding-conventions.md](./03-coding-conventions.md) — Coding patterns

# 13 — API Specification (Part 5): System, Loyalty, Documents, Integration, Reports, Notifications

> Phần cuối của API Specification. Conventions xem [09-api-spec-part1.md](./09-api-spec-part1.md).

---

## 1. `loyaltyApi` — Chương trình khách hàng thân thiết

> Mock: `loyaltyApi` trong `/src/app/services/loyaltyApi.ts`

### GET `/loyalty/programs`

Danh sách chương trình loyalty.

**LoyaltyProgram type:**
```typescript
interface LoyaltyProgram {
  id: string;
  name: string;
  description?: string;
  earnRate: number;          // Điểm per 1000 VND chi tiêu
  tiers: LoyaltyTier[];
  isActive: boolean;
  createdAt: string;
}

interface LoyaltyTier {
  name: string;              // 'Đồng', 'Bạc', 'Vàng', 'Kim Cương'
  minPoints: number;
  benefits: string[];
  discountRate: number;      // % giảm giá thêm
}
```

### GET `/loyalty/tiers`

Lấy cấu hình tất cả tiers.

### POST `/loyalty/earn`

Tích điểm sau khi mua hàng.

**Request Body:** `{ "buyerId": "user-001", "orderId": "ord-001", "amount": 35000000 }`

**Response:** `{ "data": { "pointsEarned": 350, "totalPoints": 1250 } }`

### POST `/loyalty/redeem`

Đổi điểm lấy phần thưởng.

**Request Body:** `{ "buyerId": "user-001", "rewardId": "reward-001", "pointsToRedeem": 500 }`

### GET `/loyalty/:programId/transactions`

Lịch sử giao dịch điểm của buyer.

**LoyaltyTransaction type:**
```typescript
interface LoyaltyTransaction {
  id: string;
  buyerId: string;
  type: 'Tích điểm' | 'Đổi điểm' | 'Thưởng' | 'Điều chỉnh' | 'Hết hạn';
  points: number;            // Dương=cộng, Âm=trừ
  balanceBefore: number;
  balanceAfter: number;
  referenceType?: string;
  referenceId?: string;
  note?: string;
  createdAt: string;
}
```

---

## 2. `documentApi` — Quản lý tài liệu

> Mock: `documentApi` trong `/src/app/services/documentApi.ts`

### GET `/documents`

Danh sách tài liệu.

**Query params:** `?entityType&entityId&accessLevel&search&tags&page&pageSize`

**Document type:**
```typescript
interface Document {
  id: string;
  name: string;
  description?: string;
  fileUrl: string;
  fileType: string;          // 'pdf', 'xlsx', 'docx', 'jpg'…
  fileSize: number;          // bytes
  accessLevel: 'Công khai' | 'Nội bộ' | 'Mật';
  entityType?: string;       // 'Contract', 'Order', 'Product'…
  entityId?: string;
  uploadedBy: string;
  uploadedByName?: string;
  tags?: string[];
  version: number;
  createdAt: string;
}
```

### GET `/documents/:id`

Chi tiết tài liệu.

### POST `/documents`

Upload tài liệu mới.

**Request Body:**
```json
{
  "name": "Hợp đồng Q1-2026",
  "fileUrl": "https://...",
  "fileType": "pdf",
  "fileSize": 2048576,
  "accessLevel": "Nội bộ",
  "entityType": "Contract",
  "entityId": "contract-001",
  "tags": ["hợp đồng", "2026"]
}
```

### PUT `/documents/:id`

Cập nhật thông tin tài liệu (không thay file).

### DELETE `/documents/:id`

Xóa tài liệu.

### GET `/documents/by-entity/:entityType/:entityId`

Lấy tất cả tài liệu liên kết với 1 entity.

### POST `/documents/:id/tags`

Thêm tags cho tài liệu.

---

## 3. `integrationApi` — Tích hợp hệ thống

> Mock: `integrationApi` trong `/src/app/services/integrationApi.ts`

### GET `/integrations`

Danh sách tích hợp đang cấu hình.

**Integration type:**
```typescript
interface Integration {
  id: string;
  name: string;
  type: string;              // 'ERP', 'Accounting', 'Shipping', 'Payment'
  status: 'Connected' | 'Disconnected' | 'Error';
  icon?: string;
  lastSync?: string;
  config?: Record<string, string>;
  createdAt: string;
}
```

### POST `/integrations`

Thêm tích hợp mới.

### PUT `/integrations/:id`

Cập nhật cấu hình.

### DELETE `/integrations/:id`

Xóa tích hợp.

### POST `/integrations/:id/connect`

Kết nối lại.

### POST `/integrations/:id/disconnect`

Ngắt kết nối.

### POST `/integrations/:id/sync`

Đồng bộ dữ liệu thủ công.

### POST `/integrations/:id/test`

Kiểm tra kết nối.

---

## 4. `webhookApi` — Webhook endpoints

> Mock: `webhookApi` trong `/src/app/services/integrationApi.ts`

```
GET    /webhooks                 — Danh sách webhook endpoints
POST   /webhooks                 — Tạo webhook mới
PUT    /webhooks/:id             — Cập nhật webhook
DELETE /webhooks/:id             — Xóa webhook
POST   /webhooks/:id/test        — Test gửi event thử
GET    /webhooks/:id/logs        — Log gửi webhook
```

**WebhookEndpoint type:**
```typescript
interface WebhookEndpoint {
  id: string;
  name: string;
  url: string;
  events: string[];          // ['order.created', 'order.status_changed'…]
  isActive: boolean;
  secret?: string;           // Để verify signature
  failureCount: number;
  lastCalledAt?: string;
  createdAt: string;
}
```

---

## 5. `apiKeyApi` — API Keys

> Mock: Trong `/src/app/services/integrationApi.ts`

```
GET    /api-keys                 — Danh sách API keys
POST   /api-keys                 — Tạo API key mới
DELETE /api-keys/:id             — Thu hồi API key
POST   /api-keys/:id/rotate      — Tạo key mới, vô hiệu key cũ
GET    /api-keys/:id/usage       — Thống kê sử dụng
```

---

## 6. `reportBuilderApi` — Báo cáo tùy chỉnh

> Mock: `reportBuilderApi` trong `/src/app/services/reportBuilderApi.ts`

### GET `/report-definitions`

Danh sách báo cáo đã tạo.

**ReportDefinition type:**
```typescript
interface ReportDefinition {
  id: string;
  name: string;
  description?: string;
  entityType: string;        // 'Order', 'Product', 'Invoice'…
  columns: ReportColumn[];
  filters: ReportFilter[];
  groupBy?: string;
  sortBy?: string;
  isScheduled: boolean;
  scheduleFrequency?: 'Hàng ngày' | 'Hàng tuần' | 'Hàng tháng';
  lastRunAt?: string;
  createdAt: string;
}
```

### POST `/report-definitions`

Tạo báo cáo tùy chỉnh mới.

### PUT `/report-definitions/:id`

Cập nhật cấu hình báo cáo.

### DELETE `/report-definitions/:id`

Xóa báo cáo.

### POST `/reports/:id/run`

Chạy báo cáo và trả về dữ liệu.

**Response 200:**
```json
{
  "data": {
    "columns": ["orderNumber", "buyerName", "totalAmount", "status"],
    "rows": [
      { "orderNumber": "ORD-001", "buyerName": "Nguyễn A", "totalAmount": 70000000, "status": "Đã giao" }
    ],
    "total": 45,
    "generatedAt": "2026-04-01T10:00:00Z"
  }
}
```

### POST `/reports/:id/schedule`

Đặt lịch chạy báo cáo tự động.

**Request Body:** `{ "frequency": "Hàng tuần", "sendTo": ["email@example.com"] }`

### POST `/reports/:id/export`

Xuất báo cáo ra file.

**Request Body:** `{ "format": "CSV" | "Excel" | "PDF" }`

**Response:** URL download file.

---

## 7. `notificationApi` — Thông báo

> Mock: `notificationApi` trong `/src/app/services/api.ts`
> Managed by `NotificationContext`

### GET `/notifications`

Danh sách thông báo của current user (phân trang).

**Query params:** `?isRead=false&type&page&pageSize`

**Notification type:**
```typescript
interface Notification {
  id: string;
  userId: string;
  type: string;              // 'order_status', 'rfq_response', 'payment_due'…
  title: string;
  message: string;
  entityType?: string;
  entityId?: string;
  entityNumber?: string;
  isRead: boolean;
  readAt?: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  actionUrl?: string;        // URL để navigate đến trang liên quan
  createdAt: string;
}
```

**Notification types thường gặp:**

| type | trigger |
|------|---------|
| `order_status_changed` | Trạng thái đơn hàng thay đổi |
| `rfq_response_received` | NCC phản hồi RFQ |
| `quotation_received` | Nhận báo giá mới |
| `contract_signed` | Hợp đồng được ký |
| `payment_due_reminder` | Nhắc nhở thanh toán |
| `low_stock_alert` | Cảnh báo tồn kho thấp |
| `return_status_changed` | Trạng thái trả hàng thay đổi |
| `review_received` | Nhận đánh giá mới |
| `approval_required` | Yêu cầu phê duyệt mới |
| `pr_approved` | PR được phê duyệt |

### PATCH `/notifications/:id/read`

Đánh dấu đã đọc.

### PATCH `/notifications/mark-all-read`

Đánh dấu tất cả đã đọc.

### GET `/notifications/unread-count`

Lấy số thông báo chưa đọc.

**Response:** `{ "data": { "count": 5 } }`

### GET `/notifications/by-entity/:entityType/:entityId`

Lấy thông báo liên quan đến 1 entity cụ thể.

---

## 8. `activityLogApi` — Nhật ký hoạt động

> Mock: `activityLogApi` trong `/src/app/services/api.ts`
> *Admin only*

### GET `/activity-logs`

Lịch sử hoạt động toàn hệ thống (admin) hoặc của supplier (seller).

**Query params:** `?userId&entityType&action&dateFrom&dateTo&page&pageSize`

**ActivityLog type:**
```typescript
interface ActivityLog {
  id: string;
  userId: string;
  userName?: string;
  userRole?: string;
  action: string;            // 'CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'EXPORT'
  entityType: string;
  entityId: string;
  entityLabel?: string;
  changes?: Record<string, [any, any]>;  // { field: [before, after] }
  ipAddress?: string;
  createdAt: string;
}
```

### GET `/activity-logs/by-user/:userId`

Lịch sử của 1 user cụ thể.

### GET `/activity-logs/:id/changes`

Chi tiết thay đổi của 1 log entry.

---

## 9. `adminApi` / `systemSettingsApi` — Cấu hình hệ thống

> Mock: `adminApi` trong `/src/app/services/adminApi.ts`
> *Admin only*

### System Configs

```
GET    /system-configs                   — Tất cả cấu hình
GET    /system-configs/:key              — 1 cấu hình theo key
PUT    /system-configs/:key              — Cập nhật giá trị
```

**Common config keys:**
- `site_name` — Tên hệ thống
- `site_logo` — URL logo
- `contact_email` — Email liên hệ
- `maintenance_mode` — true/false
- `default_tax_rate` — Thuế suất mặc định (%)

### Tax Configs

```
GET    /tax-configs                      — Cấu hình thuế
PUT    /tax-configs                      — Cập nhật thuế
```

### SEO Configs

```
GET    /seo-configs                      — Meta tags, sitemap
PUT    /seo-configs                      — Cập nhật SEO
```

### Platform Fees

```
GET    /platform-fees                    — Danh sách phí nền tảng
POST   /platform-fees                    — Tạo phí mới
PUT    /platform-fees/:id               — Cập nhật
DELETE /platform-fees/:id               — Xóa
```

### Email Templates

```
GET    /email-templates                  — Danh sách templates
GET    /email-templates/:key             — 1 template theo key
PUT    /email-templates/:id              — Cập nhật nội dung
POST   /email-templates/:id/preview      — Preview email
```

### Banner Configs

```
GET    /banner-configs                   — Tất cả banners
POST   /banner-configs                   — Tạo banner mới
PUT    /banner-configs/:id               — Cập nhật
DELETE /banner-configs/:id               — Xóa
```

---

## 10. Dashboard APIs

### `buyerDashboardApi`

```
GET /buyer/dashboard/stats
```

**Response:**
```json
{
  "data": {
    "totalOrders": 45,
    "pendingOrders": 8,
    "totalSpent": 285000000,
    "activeContracts": 3,
    "pendingRFQs": 2,
    "pendingApprovals": 1,
    "recentOrders": [...],
    "monthlySpend": [
      { "month": "2026-01", "amount": 45000000 }
    ],
    "topSuppliers": [...]
  }
}
```

### `sellerDashboardApi`

```
GET /seller/dashboard/stats
```

**Response:**
```json
{
  "data": {
    "totalRevenue": 850000000,
    "totalOrders": 123,
    "pendingOrders": 15,
    "activeProducts": 89,
    "lowStockItems": 12,
    "pendingRFQs": 7,
    "revenueByMonth": [...],
    "topProducts": [...],
    "ordersByStatus": {...}
  }
}
```

### `adminDashboardApi`

```
GET /admin/dashboard/stats
```

**Response:**
```json
{
  "data": {
    "totalUsers": 1250,
    "totalSuppliers": 89,
    "totalOrders": 4567,
    "totalRevenue": 12500000000,
    "pendingSupplierVerifications": 5,
    "pendingCertificates": 3,
    "newUsersThisMonth": 45,
    "platformFeeThisMonth": 125000000,
    "revenueByMonth": [...],
    "ordersByCategory": [...]
  }
}
```

---

## 11. Analytics APIs

### `analyticsApi` — Phân tích dữ liệu

```
GET /analytics/buyer?buyerId=:id&dateFrom=&dateTo=
```

**Buyer Analytics:**
```json
{
  "data": {
    "totalSpent": 285000000,
    "orderCount": 45,
    "avgOrderValue": 6333333,
    "topCategories": [...],
    "topSuppliers": [...],
    "monthlyTrend": [...]
  }
}
```

```
GET /analytics/seller?supplierId=:id&dateFrom=&dateTo=
```

**Seller Analytics:**
```json
{
  "data": {
    "revenue": 850000000,
    "orderCount": 123,
    "productCount": 89,
    "avgRating": 4.3,
    "revenueByCategory": [...],
    "topProducts": [...],
    "customerGrowth": [...]
  }
}
```

### Seller Report APIs

```
GET /seller/reports/revenue?period=monthly&dateFrom=&dateTo=
GET /seller/reports/products?supplierId=:id
GET /seller/reports/customers?supplierId=:id
```

---

## 12. API Error Codes

Tất cả error responses theo format chuẩn:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Dữ liệu đầu vào không hợp lệ",
    "details": {
      "email": "Email không đúng định dạng",
      "quantity": "Số lượng phải lớn hơn 0"
    }
  },
  "success": false
}
```

### Danh sách Error Codes

| HTTP | Code | Mô tả |
|------|------|-------|
| 400 | `BAD_REQUEST` | Request không hợp lệ |
| 400 | `VALIDATION_ERROR` | Lỗi validate dữ liệu |
| 401 | `UNAUTHORIZED` | Chưa đăng nhập |
| 401 | `TOKEN_EXPIRED` | Token hết hạn |
| 403 | `FORBIDDEN` | Không có quyền thực hiện |
| 403 | `ROLE_REQUIRED` | Yêu cầu role cụ thể |
| 404 | `NOT_FOUND` | Không tìm thấy resource |
| 409 | `DUPLICATE_ENTRY` | Trùng lặp (email, code,...) |
| 409 | `CONFLICT` | Xung đột trạng thái |
| 422 | `UNPROCESSABLE` | Không thể xử lý request (business rule) |
| 422 | `INSUFFICIENT_STOCK` | Không đủ tồn kho |
| 422 | `INSUFFICIENT_CREDIT` | Vượt hạn mức tín dụng |
| 422 | `BUDGET_EXCEEDED` | Vượt ngân sách |
| 422 | `PROMOTION_INVALID` | Mã khuyến mãi không hợp lệ |
| 422 | `STATUS_TRANSITION_INVALID` | Không thể chuyển trạng thái |
| 500 | `INTERNAL_ERROR` | Lỗi server nội bộ |
| 503 | `SERVICE_UNAVAILABLE` | Service tạm thời không khả dụng |

---

## Tài liệu liên quan

- [09-api-spec-part1.md](./09-api-spec-part1.md) — API: Auth, User, Product
- [12-api-spec-part4.md](./12-api-spec-part4.md) — API: Return, Review, KM, Phê duyệt
- [16-business-rules-part3.md](./16-business-rules-part3.md) — Rules: Platform & System
- [32-vibe-coding-context.md](./32-vibe-coding-context.md) — AI context & Service Map

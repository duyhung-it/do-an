# 09 - API Admin: Dashboard, Reports, Staff, Settings

> **Auth yêu cầu:** Tất cả endpoints trong file này yêu cầu `Authorization: Bearer <token>` với role `ADMIN`, trừ khi có ghi chú khác.

---

## 1. Admin Dashboard

### GET /admin/dashboard/stats
Lấy KPI tổng quan hệ thống.

**Query params:**
| Param | Type | Default | Mô tả |
|-------|------|---------|-------|
| period | string | MONTH | `TODAY` \| `WEEK` \| `MONTH` \| `YEAR` |

**Response 200:**
```json
{
  "success": true,
  "data": {
    "totalRevenue": 2500000000,
    "totalOrders": 1250,
    "totalProducts": 350,
    "totalCustomers": 8500,
    "revenueGrowth": 15.5,
    "orderGrowth": 12.3,
    "todayRevenue": 45000000,
    "todayOrders": 23,
    "pendingOrders": 45,
    "revenueByMonth": [
      { "month": "2024-01", "revenue": 180000000, "orders": 95 }
    ],
    "ordersByStatus": [
      { "status": "PENDING", "label": "Chờ xác nhận", "count": 45 },
      { "status": "CONFIRMED", "label": "Đã xác nhận", "count": 30 },
      { "status": "SHIPPING", "label": "Đang giao", "count": 120 },
      { "status": "DELIVERED", "label": "Đã giao", "count": 980 },
      { "status": "CANCELLED", "label": "Đã huỷ", "count": 50 },
      { "status": "RETURNED", "label": "Hoàn trả", "count": 25 }
    ],
    "topProducts": [
      { "id": "uuid", "name": "iPhone 16 Pro Max", "brand": "Apple", "sales": 120, "revenue": 3480000000 }
    ],
    "topCategories": [
      { "id": "uuid", "name": "Điện thoại", "orderCount": 800, "revenue": 1900000000 }
    ],
    "lowStockProducts": [
      { "id": "uuid", "name": "Samsung Galaxy S25 Ultra", "currentStock": 2, "minStock": 5 }
    ]
  }
}
```

---

### GET /admin/dashboard/revenue-chart
Dữ liệu biểu đồ doanh thu.

**Query params:** `groupBy` (DAY|WEEK|MONTH), `dateFrom`*, `dateTo`*

**Response 200:**
```json
{
  "success": true,
  "data": {
    "labels": ["01/01", "02/01", "03/01"],
    "revenue": [45000000, 32000000, 58000000],
    "orders": [23, 18, 31]
  }
}
```

---

### GET /admin/dashboard/recent-orders
Đơn hàng mới nhất cho dashboard.

**Query:** `limit` (default 10, max 50)

**Response 200:** mảng Order (tóm tắt: id, orderNumber, customerName, totalAmount, status, createdAt)

---

### GET /admin/dashboard/recent-activity
Log hoạt động gần đây.

**Query:** `limit` (default 20)

**Response 200:** mảng ActivityLog tóm tắt

---

## 2. Reports (Báo cáo)

### GET /admin/reports/revenue
Báo cáo doanh thu theo kỳ.

**Query params:**
| Param | Type | Bắt buộc | Mô tả |
|-------|------|----------|-------|
| dateFrom | date | * | Từ ngày (YYYY-MM-DD) |
| dateTo | date | * | Đến ngày |
| groupBy | string | | DAY\|WEEK\|MONTH\|QUARTER (default: MONTH) |
| categoryId | UUID | | Lọc theo danh mục |
| brand | string | | Lọc theo thương hiệu |

**Response 200:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalRevenue": 2500000000,
      "totalOrders": 1250,
      "avgOrderValue": 2000000,
      "growth": 15.5
    },
    "data": [
      { "period": "2024-01", "revenue": 180000000, "orders": 95, "avgOrderValue": 1894736 }
    ]
  }
}
```

---

### GET /admin/reports/products
Báo cáo hiệu quả sản phẩm.

**Query:** dateFrom*, dateTo*, page, pageSize, sortBy (revenue|unitsSold|returnRate|avgRating), categoryId?, brand?

**Response 200:** PaginatedResponse với mỗi item:
```json
{
  "productId": "uuid",
  "name": "iPhone 16 Pro Max",
  "brand": "Apple",
  "unitsSold": 120,
  "revenue": 3480000000,
  "returnRate": 1.2,
  "avgRating": 4.8
}
```

---

### GET /admin/reports/customers
Báo cáo khách hàng.

**Query:** dateFrom*, dateTo*, page, pageSize, sortBy (totalOrders|totalSpent|avgOrderValue)

**Response 200:** PaginatedResponse với mỗi item:
```json
{
  "customerId": "uuid",
  "customerName": "Nguyễn Văn An",
  "email": "an@example.com",
  "totalOrders": 12,
  "totalSpent": 45000000,
  "avgOrderValue": 3750000,
  "lastOrderDate": "2024-01-10",
  "tier": "SILVER"
}
```

---

### GET /admin/reports/inventory
Báo cáo tồn kho.

**Query:** status?, brand?, categoryId?

**Response 200:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalSkus": 350,
      "inStock": 280,
      "lowStock": 45,
      "outOfStock": 25,
      "totalInventoryValue": 5000000000
    },
    "items": [ ...InventoryItem[] ]
  }
}
```

---

### GET /admin/reports/returns
Báo cáo trả hàng.

**Query:** dateFrom*, dateTo*, status?, reason?

**Response 200:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalReturns": 85,
      "totalRefunded": 340000000,
      "returnRate": 2.5,
      "byReason": [
        { "reason": "DEFECTIVE", "label": "Lỗi sản phẩm", "count": 40, "percentage": 47.1 }
      ],
      "byStatus": [
        { "status": "REFUNDED", "label": "Đã hoàn tiền", "count": 60 }
      ]
    },
    "data": [ ...ReturnRequest[] ]
  }
}
```

---

### GET /admin/reports/export
Xuất báo cáo ra file CSV hoặc Excel.

**Query:**
| Param | Type | Bắt buộc | Mô tả |
|-------|------|----------|-------|
| reportType | string | * | REVENUE\|PRODUCTS\|CUSTOMERS\|ORDERS\|INVENTORY\|RETURNS |
| dateFrom | date | * | |
| dateTo | date | * | |
| format | string | | CSV\|XLSX (default: CSV) |

**Response 200:** File download
- CSV: `Content-Type: text/csv; charset=utf-8`
- XLSX: `Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- Header: `Content-Disposition: attachment; filename="report-YYYY-MM-DD.csv"`

---

## 3. Staff Management

### GET /admin/staff
Danh sách nhân viên.

**Query:** page, pageSize, position, branchId, isActive (boolean), search (name/email)

**Response 200:** PaginatedResponse\<StaffMember\>

StaffMember fields: id, fullName, email, phone, position, positionLabel, branchId, branchName, isActive, joinedAt, createdAt

---

### GET /admin/staff/:id
Chi tiết nhân viên.

**Response 200:** StaffMember

---

### POST /admin/staff
Tạo nhân viên mới.

**Request Body:**
```json
{
  "fullName": "Trần Thị Bình",
  "email": "binh@cellphones.vn",
  "phone": "0901234567",
  "position": "CONSULTANT",
  "branchId": "uuid",
  "joinedAt": "2024-01-15"
}
```

- **Side effect:** Tự động tạo User account với role=STAFF, gửi email welcome với mật khẩu tạm thời.

**Response 201:** StaffMember

---

### PATCH /admin/staff/:id
Cập nhật thông tin nhân viên.

**Request Body:** Các field tuỳ chọn (fullName, phone, position, branchId)

**Response 200:** updated StaffMember

---

### PATCH /admin/staff/:id/deactivate
Vô hiệu hoá nhân viên.

- Sets isActive=false
- **Side effect:** Khoá User account liên quan (status=LOCKED), thu hồi JWT tokens

**Response 200:** updated StaffMember

---

## 4. Branch Management

### GET /admin/branches
Danh sách cửa hàng.

**Query:** city?, isActive?

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "CELLPHONES - Hoàn Kiếm",
      "address": "123 Phố Huế",
      "district": "Hai Bà Trưng",
      "city": "Hà Nội",
      "phone": "024-1234-5678",
      "workingHours": "8:00 - 22:00 (Thứ 2 - Chủ nhật)",
      "lat": 21.028511,
      "lng": 105.854051,
      "isActive": true
    }
  ]
}
```

---

### POST /admin/branches
Tạo cửa hàng mới.

**Request Body:**
```json
{
  "name": "CELLPHONES - Đà Nẵng",
  "address": "456 Nguyễn Văn Linh",
  "district": "Hải Châu",
  "city": "Đà Nẵng",
  "phone": "0236-1234-567",
  "workingHours": "8:00 - 21:00",
  "lat": 16.068,
  "lng": 108.212,
  "isActive": true
}
```

**Response 201:** Branch

---

### PATCH /admin/branches/:id
Cập nhật thông tin cửa hàng.

**Response 200:** updated Branch

---

### PATCH /admin/branches/:id/toggle
Bật/tắt trạng thái cửa hàng.

**Response 200:** `{ id, isActive }`

---

## 5. System Settings

### GET /admin/settings
Lấy toàn bộ cấu hình hệ thống.

**Response 200:**
```json
{
  "success": true,
  "data": {
    "site_name": "CELLPHONES",
    "currency": "VND",
    "tax_rate": "10",
    "maintenance_mode": "false",
    "return_window_days": "7",
    "loyalty_points_per_100k": "1",
    "default_page_size": "20",
    "email_notifications_enabled": "true",
    "hotline": "1800-1234",
    "address": "123 Phố Huế, Hai Bà Trưng, Hà Nội"
  }
}
```

---

### PATCH /admin/settings
Cập nhật cấu hình hệ thống (bulk).

**Request Body:**
```json
{
  "settings": {
    "return_window_days": "14",
    "hotline": "1900-9999"
  }
}
```

**Business rules:**
- Chỉ update các key đã tồn tại (không tạo mới key tuỳ tiện)
- `maintenance_mode=true` → trả 503 cho tất cả public API (trừ admin)
- Tạo activity_log entry

**Response 200:** updated settings object

---

### GET /admin/settings/banners
Danh sách banners.

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Flash Sale 12/12",
      "message": "Giảm đến 50% tất cả sản phẩm!",
      "type": "INFO",
      "link": "/products",
      "isActive": true,
      "startDate": "2024-12-12",
      "endDate": "2024-12-12"
    }
  ]
}
```

---

### POST /admin/settings/banners
Tạo banner mới.

**Request Body:**
```json
{
  "title": "Thông báo bảo trì",
  "message": "Hệ thống bảo trì từ 23:00 - 01:00 ngày 20/01/2024",
  "type": "WARNING",
  "link": "",
  "isActive": true,
  "startDate": "2024-01-19",
  "endDate": "2024-01-20"
}
```

**Response 201:** BannerConfig

---

### PATCH /admin/settings/banners/:id
Cập nhật banner.

**Response 200:** updated BannerConfig

---

### DELETE /admin/settings/banners/:id
Xoá banner.

**Response 204**

---

### GET /admin/settings/email-templates
Danh sách email templates.

**Response 200:** EmailTemplate[]

EmailTemplate fields: id, name, subject, body (HTML), variables[], isActive, createdAt

---

### POST /admin/settings/email-templates
Tạo email template.

**Request Body:**
```json
{
  "name": "order_confirmation",
  "subject": "Xác nhận đơn hàng {{orderNumber}}",
  "body": "<h1>Cảm ơn {{customerName}}!</h1><p>Đơn hàng <b>{{orderNumber}}</b> đã được xác nhận.</p>",
  "variables": ["{{customerName}}", "{{orderNumber}}", "{{totalAmount}}"],
  "isActive": true
}
```

**Response 201:** EmailTemplate

---

### PATCH /admin/settings/email-templates/:id
Cập nhật template.

**Response 200:** updated EmailTemplate

---

### POST /admin/settings/email-templates/:id/preview
Preview template với dữ liệu mẫu.

**Request Body:**
```json
{
  "sampleData": {
    "customerName": "Nguyễn Văn An",
    "orderNumber": "CP2024011500001",
    "totalAmount": "5,000,000 VND"
  }
}
```

**Response 200:**
```json
{
  "renderedSubject": "Xác nhận đơn hàng CP2024011500001",
  "renderedBody": "<h1>Cảm ơn Nguyễn Văn An!</h1>..."
}
```

---

### DELETE /admin/settings/email-templates/:id
Xoá template.

**Response 204**

---

### GET /admin/settings/seo
Lấy cấu hình SEO.

**Response 200:**
```json
{
  "siteTitle": "CELLPHONES - Mua điện thoại chính hãng",
  "siteDescription": "Cửa hàng điện thoại uy tín, giá tốt nhất Việt Nam",
  "metaKeywords": "điện thoại, iphone, samsung, oppo",
  "ogImage": "https://cdn.cellphones.vn/og-image.jpg",
  "robots": "index, follow"
}
```

---

### PATCH /admin/settings/seo
Cập nhật SEO config.

**Request Body:** Các field tuỳ chọn

**Response 200:** updated SEO config

---

## 6. Activity Logs

### GET /admin/activity-logs
Lấy danh sách log hoạt động.

**Query params:**
| Param | Type | Mô tả |
|-------|------|-------|
| page, pageSize | int | Phân trang |
| action | enum | CREATE\|UPDATE\|DELETE\|APPROVE\|REJECT\|LOGIN\|LOGOUT\|EXPORT\|IMPORT |
| entity | string | Tên entity (Product, Order, User, ...) |
| userRole | string | Lọc theo role |
| userId | UUID | Lọc theo user cụ thể |
| search | string | Tìm trên userName, entityName, details |
| dateFrom, dateTo | datetime | Khoảng thời gian |

**Response 200:** PaginatedResponse\<ActivityLog\>

ActivityLog fields: id, userId, userName, userRole, action, entity, entityId, entityName, details, ipAddress, userAgent, createdAt

---

### GET /admin/activity-logs/stats
Thống kê log hoạt động.

**Query:** dateFrom?, dateTo?

**Response 200:**
```json
{
  "success": true,
  "data": {
    "todayCount": 150,
    "weekCount": 850,
    "monthCount": 3200,
    "byAction": [
      { "action": "CREATE", "label": "Tạo mới", "count": 450 },
      { "action": "UPDATE", "label": "Cập nhật", "count": 1200 }
    ],
    "byDay": [
      { "date": "2024-01-15", "count": 150 }
    ],
    "topUsers": [
      { "userId": "uuid", "userName": "admin@cellphones.vn", "count": 380 }
    ]
  }
}
```

---

## 7. Promotions (Admin Full Management)

### GET /admin/promotions
Danh sách tất cả khuyến mãi (kể cả inactive/expired).

**Query:** page, pageSize, type, isActive, search (code/name), dateFrom, dateTo

**Response 200:** PaginatedResponse\<Promotion\>

---

### POST /admin/promotions
Tạo khuyến mãi mới.

**Request Body:**
```json
{
  "code": "SUMMER50",
  "name": "Ưu đãi hè 2024",
  "description": "Giảm 10% tất cả điện thoại Apple và Samsung",
  "type": "PERCENT",
  "value": 10,
  "minOrderValue": 5000000,
  "maxDiscount": 500000,
  "startDate": "2024-06-01T00:00:00Z",
  "endDate": "2024-06-30T23:59:59Z",
  "usageLimit": 1000,
  "applicableProducts": [],
  "applicableCategories": ["uuid-dien-thoai"],
  "applicableBrands": ["Apple", "Samsung"],
  "isActive": true
}
```

**Business rules:**
- `code` phải là UPPERCASE alphanumeric (4-20 ký tự)
- `code` UNIQUE
- `endDate` > `startDate`
- `value` > 0

**Response 201:** Promotion

**Errors:** `PROMOTION_CODE_EXISTS` (409)

---

### PATCH /admin/promotions/:id
Cập nhật khuyến mãi.

**Lưu ý:** Không thể thay đổi `code` và `type` sau khi tạo.

**Response 200:** updated Promotion

---

### PATCH /admin/promotions/:id/toggle
Bật/tắt khuyến mãi.

**Response 200:** `{ id, isActive }`

---

### DELETE /admin/promotions/:id
Xoá khuyến mãi.

**Business rule:** Không thể xoá nếu `usedCount > 0`.

**Response 204**

**Errors:** `PROMOTION_HAS_USAGE` (409)

---

## 8. Tổng Hợp Endpoints

| Method | URL | Mô tả | Role |
|--------|-----|-------|------|
| GET | /admin/dashboard/stats | KPI tổng quan | ADMIN |
| GET | /admin/dashboard/revenue-chart | Biểu đồ doanh thu | ADMIN |
| GET | /admin/dashboard/recent-orders | Đơn hàng mới nhất | ADMIN |
| GET | /admin/dashboard/recent-activity | Log hoạt động | ADMIN |
| GET | /admin/reports/revenue | Báo cáo doanh thu | ADMIN |
| GET | /admin/reports/products | Báo cáo sản phẩm | ADMIN |
| GET | /admin/reports/customers | Báo cáo KH | ADMIN |
| GET | /admin/reports/inventory | Báo cáo tồn kho | ADMIN |
| GET | /admin/reports/returns | Báo cáo trả hàng | ADMIN |
| GET | /admin/reports/export | Xuất file | ADMIN |
| GET | /admin/staff | Danh sách nhân viên | ADMIN |
| GET | /admin/staff/:id | Chi tiết nhân viên | ADMIN |
| POST | /admin/staff | Tạo nhân viên | ADMIN |
| PATCH | /admin/staff/:id | Cập nhật nhân viên | ADMIN |
| PATCH | /admin/staff/:id/deactivate | Vô hiệu hoá | ADMIN |
| GET | /admin/branches | Danh sách cửa hàng | ADMIN |
| POST | /admin/branches | Tạo cửa hàng | ADMIN |
| PATCH | /admin/branches/:id | Cập nhật cửa hàng | ADMIN |
| PATCH | /admin/branches/:id/toggle | Bật/tắt | ADMIN |
| GET | /admin/settings | Cấu hình hệ thống | ADMIN |
| PATCH | /admin/settings | Cập nhật cấu hình | ADMIN |
| GET | /admin/settings/banners | Danh sách banners | ADMIN |
| POST | /admin/settings/banners | Tạo banner | ADMIN |
| PATCH | /admin/settings/banners/:id | Cập nhật banner | ADMIN |
| DELETE | /admin/settings/banners/:id | Xoá banner | ADMIN |
| GET | /admin/settings/email-templates | Email templates | ADMIN |
| POST | /admin/settings/email-templates | Tạo template | ADMIN |
| PATCH | /admin/settings/email-templates/:id | Cập nhật | ADMIN |
| POST | /admin/settings/email-templates/:id/preview | Preview | ADMIN |
| DELETE | /admin/settings/email-templates/:id | Xoá | ADMIN |
| GET | /admin/settings/seo | SEO config | ADMIN |
| PATCH | /admin/settings/seo | Cập nhật SEO | ADMIN |
| GET | /admin/activity-logs | Log hoạt động | ADMIN |
| GET | /admin/activity-logs/stats | Thống kê log | ADMIN |
| GET | /admin/promotions | Tất cả khuyến mãi | ADMIN |
| POST | /admin/promotions | Tạo khuyến mãi | ADMIN |
| PATCH | /admin/promotions/:id | Cập nhật | ADMIN |
| PATCH | /admin/promotions/:id/toggle | Bật/tắt | ADMIN |
| DELETE | /admin/promotions/:id | Xoá | ADMIN |

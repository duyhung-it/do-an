# 00 - Tổng Quan Hệ Thống
## CELLPHONES B2C eCommerce Platform

> **Phiên bản tài liệu:** 1.0  
> **Ngày tạo:** 2026-05-12  
> **Người soạn:** BA Team  
> **Dành cho:** Backend Developer (Java Spring Boot)

---

## 1. Giới thiệu hệ thống

**CELLPHONES** là nền tảng thương mại điện tử B2C chuyên về điện thoại di động và phụ kiện công nghệ. Hệ thống phục vụ 3 nhóm người dùng chính:

| Nhóm | Mô tả | Portal |
|------|-------|--------|
| **Customer** (Khách hàng) | Mua sản phẩm, quản lý đơn hàng | `/` (storefront) |
| **Admin** (Quản trị viên) | Quản lý toàn bộ hệ thống | `/admin/*` |
| **Staff** (Nhân viên) | Hỗ trợ vận hành | Tuỳ phân quyền |

---

## 2. Phạm vi chức năng

### 2.1 Storefront (Customer Portal)
- Duyệt sản phẩm: danh mục, tìm kiếm, lọc, so sánh
- Giỏ hàng & Checkout
- Quản lý đơn hàng: xem, huỷ, theo dõi
- Thanh toán & Hoá đơn
- Trả hàng & Hoàn tiền
- Bảo hành sản phẩm
- Thu cũ đổi mới (Trade-in)
- Kiểm tra IMEI
- Chương trình tích điểm (Loyalty)
- Wishlist (yêu thích)
- Đánh giá sản phẩm
- Tìm cửa hàng

### 2.2 Admin Portal
- Dashboard & Analytics
- Quản lý sản phẩm / danh mục / tồn kho
- Quản lý đơn hàng / thanh toán / hoá đơn / vận chuyển
- Quản lý trả hàng / bảo hành / trade-in
- Quản lý khuyến mãi / combo
- Quản lý người dùng / nhân viên / nhà cung cấp
- Quản lý chương trình loyalty
- Blog & Nội dung
- Cấu hình hệ thống (SEO, banner, email template)
- Báo cáo & Thống kê

---

## 3. Tech Stack Đề Xuất (Backend)

| Thành phần | Công nghệ | Ghi chú |
|-----------|-----------|---------|
| Language | Java 17+ | LTS, record types, sealed classes |
| Framework | Spring Boot 3.x | Spring Security, Spring Data JPA |
| Database | PostgreSQL 15+ | Main DB |
| Cache | Redis 7+ | Session, rate limiting, hot data |
| Auth | JWT (RS256) | Access token 1h + Refresh token 7d |
| File Storage | MinIO / S3 | Ảnh sản phẩm, tài liệu |
| Search | PostgreSQL Full-text / Elasticsearch | Tìm kiếm sản phẩm |
| Email | SMTP / SendGrid | Thông báo, hoá đơn |
| Build | Maven / Gradle | |
| API Docs | Springdoc OpenAPI 3 (Swagger UI) | |

---

## 4. Kiến Trúc Tổng Thể

```
┌─────────────────────────────────────────────────────────────────┐
│                    CLIENT LAYER                                  │
│  React SPA (Vite + TypeScript)  ←→  REST API (JSON)             │
└──────────────────────────┬──────────────────────────────────────┘
                           │ HTTPS
┌──────────────────────────▼──────────────────────────────────────┐
│                   API GATEWAY / NGINX                            │
│  Rate limiting · CORS · SSL termination · Request routing        │
└──────────────────────────┬──────────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────────┐
│              SPRING BOOT APPLICATION SERVER                      │
│                                                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐ │
│  │  Auth Layer │  │ Controllers │  │   Service Layer          │ │
│  │  JWT Filter │  │  REST APIs  │  │   Business Logic         │ │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘ │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                 Repository Layer (JPA)                    │   │
│  └─────────────────────────────────────────────────────────┘   │
└──────────────────────────┬──────────────────────────────────────┘
                           │
           ┌───────────────┴───────────────┐
           │                               │
     ┌─────▼──────┐                ┌───────▼──────┐
     │ PostgreSQL │                │    Redis      │
     │ (Main DB)  │                │   (Cache)     │
     └────────────┘                └──────────────┘
```

---

## 5. Quy Ước API

### 5.1 Base URL
```
Development:  http://localhost:8080/api/v1
Production:   https://api.cellphones.vn/api/v1
```

### 5.2 Authentication
Tất cả API có prefix `[AUTH]` yêu cầu header:
```
Authorization: Bearer <access_token>
```

### 5.3 Request Format
- Content-Type: `application/json`
- Charset: `UTF-8`
- Date format: `ISO 8601` — `2024-01-15T10:30:00Z`

### 5.4 Response Format chuẩn

**Success:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Thao tác thành công"
}
```

**Success (List/Paginated):**
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

**Error:**
```json
{
  "success": false,
  "error": {
    "code": "PRODUCT_NOT_FOUND",
    "message": "Không tìm thấy sản phẩm",
    "details": { ... }
  }
}
```

### 5.5 Phân trang (Pagination)

Query params chuẩn:
| Param | Type | Default | Mô tả |
|-------|------|---------|-------|
| `page` | int | 1 | Số trang (bắt đầu từ 1) |
| `pageSize` | int | 20 | Số bản ghi mỗi trang (max 100) |
| `sortBy` | string | `createdAt` | Field để sort |
| `sortDir` | string | `desc` | `asc` hoặc `desc` |

### 5.6 HTTP Status Codes

| Code | Ý nghĩa |
|------|---------|
| 200 | OK — Thành công |
| 201 | Created — Tạo mới thành công |
| 204 | No Content — Xoá thành công |
| 400 | Bad Request — Dữ liệu không hợp lệ |
| 401 | Unauthorized — Chưa xác thực |
| 403 | Forbidden — Không có quyền |
| 404 | Not Found — Không tìm thấy |
| 409 | Conflict — Xung đột (vd: email đã tồn tại) |
| 422 | Unprocessable Entity — Lỗi nghiệp vụ |
| 429 | Too Many Requests — Rate limit |
| 500 | Internal Server Error |

### 5.7 Ngôn ngữ & Locale
- Ngôn ngữ giao diện: **Tiếng Việt**
- Timezone: **Asia/Ho_Chi_Minh (UTC+7)**
- Currency: **VND** (không có phần thập phân)
- Số thứ tự trang: **bắt đầu từ 1**

---

## 6. Các Module Chính & File Tài Liệu

| File | Module |
|------|--------|
| [01-domain-entities.md](./01-domain-entities.md) | Mô hình dữ liệu (40+ entities) |
| [02-database-design.md](./02-database-design.md) | Thiết kế DB (PostgreSQL DDL) |
| [03-api-auth-users.md](./03-api-auth-users.md) | Authentication & User management |
| [04-api-catalog.md](./04-api-catalog.md) | Sản phẩm, Danh mục, Đánh giá, Wishlist |
| [05-api-orders.md](./05-api-orders.md) | Giỏ hàng, Đơn hàng, Khuyến mãi |
| [06-api-payments-invoices.md](./06-api-payments-invoices.md) | Thanh toán, Hoá đơn, Vận chuyển |
| [07-api-after-sales.md](./07-api-after-sales.md) | Trả hàng, Bảo hành, Trade-in, IMEI |
| [08-api-loyalty-notifications.md](./08-api-loyalty-notifications.md) | Loyalty, Thông báo |
| [09-api-admin.md](./09-api-admin.md) | Admin Dashboard, Báo cáo, Cấu hình |
| [10-business-rules.md](./10-business-rules.md) | Quy tắc nghiệp vụ & State machines |
| [11-rbac-security.md](./11-rbac-security.md) | Phân quyền & Bảo mật |
| [12-error-codes.md](./12-error-codes.md) | Danh sách mã lỗi |

---

## 7. Quy Trình Phát Triển Đề Xuất

### Phase 1 — Core (Sprint 1-2)
1. Auth: đăng ký, đăng nhập, JWT
2. User: CRUD, địa chỉ
3. Category: CRUD cây danh mục
4. Product: CRUD, tìm kiếm cơ bản
5. Cart: thêm/sửa/xoá

### Phase 2 — Orders (Sprint 3-4)
6. Order: tạo, cập nhật status, lịch sử
7. Payment: ghi nhận thanh toán
8. Invoice: tự động tạo
9. Shipment: tạo, cập nhật tracking
10. Promotion: validate coupon

### Phase 3 — After-sales (Sprint 5-6)
11. Return Request
12. Warranty
13. Trade-in
14. Review & Rating
15. Wishlist

### Phase 4 — Value-add (Sprint 7-8)
16. Loyalty Program
17. Notification
18. IMEI Check
19. Blog
20. Store Locator

### Phase 5 — Admin & Analytics (Sprint 9-10)
21. Admin Dashboard KPIs
22. Inventory management
23. Reports & Analytics
24. System Configuration

---

## 8. Ghi Chú Frontend → Backend

Frontend React gọi API thông qua service layer tại `src/app/services/`. Hiện tại dùng mock data. Backend cần implement đúng:
1. **URL pattern** như định nghĩa trong tài liệu này
2. **Response shape** y chang (field names giữ nguyên tiếng Anh camelCase)
3. **Pagination response** chuẩn `{ data, pagination }` 
4. **Error codes** theo file `12-error-codes.md`
5. **JWT** token trả về sau login phải chứa `userId`, `email`, `role`

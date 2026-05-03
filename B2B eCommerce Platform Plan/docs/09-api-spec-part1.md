# 09 — API Specification (Part 1): Auth, User, Product, Category

> Đặc tả REST API cho các domain cơ bản. Tất cả endpoints đều dùng prefix `/api/v1`.
> Hiện tại: Mock API (service layer). Tương lai: Supabase REST hoặc Edge Functions.

---

## API Conventions

### Request Format

```
Base URL: /api/v1
Content-Type: application/json
Authorization: Bearer <jwt_token>   (trừ public endpoints)
```

### Pagination Parameters

```
?page=1         — Trang hiện tại (default: 1)
?pageSize=20    — Số records/trang (default: 20, max: 100)
?sortField=name — Trường sắp xếp
?sortOrder=asc  — asc | desc (default: desc)
```

### Filter Parameters (theo domain)

```
?search=keyword           — Tìm kiếm full-text
?status=Active            — Lọc theo trạng thái
?dateFrom=2026-01-01      — Lọc từ ngày
?dateTo=2026-12-31        — Lọc đến ngày
?supplierId=uuid          — Lọc theo NCC
?categoryId=uuid          — Lọc theo danh mục
```

### Response Format

```json
// Success - Single record
{
  "data": { ... },
  "success": true
}

// Success - List
{
  "data": [...],
  "total": 150,
  "page": 1,
  "pageSize": 20,
  "success": true
}

// Error
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Không tìm thấy tài nguyên",
    "details": {}
  },
  "success": false
}
```

### HTTP Status Codes

| Code | Ý nghĩa |
|------|---------|
| 200 | OK — Thành công |
| 201 | Created — Tạo mới thành công |
| 204 | No Content — Xóa thành công |
| 400 | Bad Request — Dữ liệu đầu vào không hợp lệ |
| 401 | Unauthorized — Chưa đăng nhập |
| 403 | Forbidden — Không có quyền |
| 404 | Not Found — Không tìm thấy |
| 409 | Conflict — Trùng lặp dữ liệu |
| 422 | Unprocessable Entity — Validation Error |
| 500 | Internal Server Error |

---

## 1. `authApi` — Xác thực

> Mock: `/src/app/services/api.ts` → `authApi`

### POST `/auth/login`

Đăng nhập, trả về thông tin user và token.

**Request Body:**
```json
{
  "email": "buyer@example.com",
  "password": "password123"
}
```

**Response 200:**
```json
{
  "data": {
    "id": "user-001",
    "email": "buyer@example.com",
    "fullName": "Nguyễn Văn A",
    "role": "Buyer",
    "companyName": "Công ty TNHH ABC",
    "supplierId": null,
    "avatar": "https://...",
    "token": "eyJhbGci..."
  },
  "success": true
}
```

**AuthUser type** (TypeScript):
```typescript
interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: 'Buyer' | 'Seller' | 'Admin';
  companyName?: string;
  supplierId?: string;        // Dùng cho Seller role
  avatar?: string;
  token?: string;
}
```

### POST `/auth/register`

**Request Body:**
```json
{
  "email": "new@example.com",
  "password": "securepass",
  "fullName": "Trần Thị B",
  "role": "Buyer",
  "companyName": "Công ty XYZ"
}
```

**Response 201:** Trả về AuthUser như login.

### POST `/auth/logout`

**Response 204:** Xóa session.

### GET `/auth/me`

Lấy thông tin user đang đăng nhập từ token.

**Response 200:** Trả về AuthUser.

---

## 2. `userApi` — Quản lý người dùng

> Mock: `authApi` trong `/src/app/services/api.ts`
> **Admin only** trừ GET /users/:id (self) và PUT /users/:id (self)

### GET `/users`

*Admin only.* Lấy danh sách user phân trang.

**Query params:** `?page&pageSize&search&role&status`

**Response 200:**
```json
{
  "data": [
    {
      "id": "user-001",
      "email": "buyer@example.com",
      "fullName": "Nguyễn Văn A",
      "role": "Buyer",
      "status": "Hoạt động",
      "companyName": "Công ty TNHH ABC",
      "createdAt": "2026-01-15T08:00:00Z"
    }
  ],
  "total": 150,
  "page": 1,
  "pageSize": 20
}
```

### GET `/users/:id`

Lấy chi tiết 1 user.

### PUT `/users/:id`

Cập nhật thông tin user.

**Request Body:**
```json
{
  "fullName": "Nguyễn Văn A",
  "phone": "0912345678",
  "companyName": "Công ty TNHH ABC",
  "avatar": "https://..."
}
```

### DELETE `/users/:id`

*Admin only.* Xóa user.

### PATCH `/users/:id/status`

*Admin only.* Thay đổi trạng thái user.

**Request Body:** `{ "status": "Tạm khóa", "reason": "Vi phạm điều khoản" }`

### GET `/users/:id/addresses`

Lấy danh sách địa chỉ giao hàng của user.

---

## 3. `shippingAddressApi` — Địa chỉ giao hàng

> Mock: `shippingAddressApi` trong `/src/app/services/api.ts`

### GET `/addresses?userId=:id`

Lấy tất cả địa chỉ của user.

**Response 200:**
```json
{
  "data": [
    {
      "id": "addr-001",
      "userId": "user-001",
      "label": "Văn phòng",
      "fullName": "Nguyễn Văn A",
      "phone": "0912345678",
      "address": "123 Nguyễn Huệ",
      "city": "Hồ Chí Minh",
      "district": "Quận 1",
      "isDefault": true
    }
  ]
}
```

### POST `/addresses`

Tạo địa chỉ mới.

**ShippingAddress type:**
```typescript
interface ShippingAddress {
  id: string;
  userId: string;
  label: string;           // 'Văn phòng', 'Nhà riêng', 'Kho hàng'
  fullName: string;
  phone: string;
  address: string;
  city: string;
  district?: string;
  ward?: string;
  postalCode?: string;
  isDefault: boolean;
}
```

### PUT `/addresses/:id`

Cập nhật địa chỉ.

### DELETE `/addresses/:id`

Xóa địa chỉ (không xóa được địa chỉ mặc định).

### PATCH `/addresses/:id/default`

Đặt làm địa chỉ mặc định (tự động bỏ mặc định địa chỉ cũ).

---

## 4. `categoryApi` — Danh mục sản phẩm

> Mock: `categoryApi` trong `/src/app/services/api.ts`

### GET `/categories`

Lấy toàn bộ danh mục dạng cây (tree structure).

**Response 200:**
```json
{
  "data": [
    {
      "id": "cat-001",
      "name": "Điện tử",
      "slug": "dien-tu",
      "parentId": null,
      "level": 1,
      "icon": "Monitor",
      "isActive": true,
      "productCount": 245,
      "children": [
        {
          "id": "cat-002",
          "name": "Điện thoại",
          "parentId": "cat-001",
          "level": 2
        }
      ]
    }
  ]
}
```

**Category type:**
```typescript
interface Category {
  id: string;
  name: string;
  slug: string;
  parentId?: string;
  description?: string;
  icon?: string;
  isActive: boolean;
  imageUrl?: string;
  sortOrder: number;
  level: number;
  path?: string;            // 'cat-001/cat-002'
  productCount?: number;
  children?: Category[];
}
```

### GET `/categories/:id`

Lấy chi tiết 1 danh mục.

### POST `/categories`

*Admin only.* Tạo danh mục mới.

**Request Body:**
```json
{
  "name": "Thực phẩm",
  "parentId": null,
  "description": "Thực phẩm & đồ uống",
  "icon": "ShoppingBag",
  "isActive": true,
  "sortOrder": 5
}
```

### PUT `/categories/:id`

*Admin only.* Cập nhật danh mục.

### DELETE `/categories/:id`

*Admin only.* Xóa danh mục (chỉ được xóa nếu không có sản phẩm).

### PATCH `/categories/reorder`

*Admin only.* Sắp xếp lại thứ tự danh mục.

**Request Body:** `{ "items": [{ "id": "cat-001", "sortOrder": 1 }] }`

---

## 5. `productApi` — Sản phẩm

> Mock: `productApi` trong `/src/app/services/api.ts`

### GET `/products`

Lấy danh sách sản phẩm phân trang với filter đa dạng.

**Query params:**
```
?page=1&pageSize=20
&search=laptop
&categoryId=cat-001
&supplierId=sup-001
&status=active          — active | inactive | pending
&minPrice=100000
&maxPrice=10000000
&featured=true
&sortField=price&sortOrder=asc
```

**Response 200:**
```json
{
  "data": [
    {
      "id": "prod-001",
      "name": "Laptop Dell XPS 15",
      "slug": "laptop-dell-xps-15",
      "categoryId": "cat-002",
      "categoryName": "Laptop",
      "supplierId": "sup-001",
      "supplierName": "Công ty TNHH Dell VN",
      "price": 35000000,
      "originalPrice": 38000000,
      "stock": 50,
      "unit": "Cái",
      "minOrderQty": 1,
      "images": ["https://..."],
      "brandName": "Dell",
      "status": "active",
      "isActive": true,
      "featured": false,
      "viewCount": 1250,
      "soldCount": 87,
      "rating": 4.5,
      "reviewCount": 32,
      "createdAt": "2026-01-10T00:00:00Z"
    }
  ],
  "total": 356,
  "page": 1,
  "pageSize": 20
}
```

**Product type (đầy đủ):**
```typescript
interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  categoryId: string;
  categoryName?: string;
  supplierId: string;
  supplierName?: string;
  price: number;
  originalPrice?: number;
  stock: number;
  unit: string;
  minOrderQty: number;
  images: string[];
  specifications?: Record<string, string>;
  tags?: string[];
  status: 'active' | 'inactive' | 'pending';
  isActive: boolean;
  brandName?: string;
  origin?: string;
  weight?: number;
  dimensions?: string;
  warrantyMonths?: number;
  viewCount: number;
  soldCount: number;
  featured: boolean;
  rating?: number;
  reviewCount?: number;
  variants?: ProductVariant[];
  createdAt: string;
  updatedAt: string;
}
```

### GET `/products/:id`

Lấy chi tiết sản phẩm kèm variants và images.

### POST `/products`

*Seller only.* Tạo sản phẩm mới.

**Request Body:**
```json
{
  "name": "Bàn phím cơ Keychron K2",
  "description": "Bàn phím cơ compact...",
  "categoryId": "cat-005",
  "price": 2500000,
  "stock": 100,
  "unit": "Cái",
  "minOrderQty": 5,
  "images": ["https://..."],
  "brandName": "Keychron",
  "warrantyMonths": 12,
  "specifications": {
    "Kết nối": "Bluetooth 5.1 / USB-C",
    "Switch": "Gateron Red"
  }
}
```

### PUT `/products/:id`

*Seller only* (owner) hoặc *Admin.* Cập nhật sản phẩm.

### DELETE `/products/:id`

*Seller only* (owner) hoặc *Admin.* Xóa sản phẩm.

### PATCH `/products/:id/status`

*Seller/Admin.* Thay đổi trạng thái sản phẩm.

**Request Body:** `{ "status": "active" | "inactive" | "pending" }`

---

## 6. `productImageApi` — Ảnh sản phẩm

> Mock: `productImageApi` trong `/src/app/services/productImageApi.ts`

### GET `/products/:id/images`

Lấy danh sách ảnh của sản phẩm.

**Response 200:**
```json
{
  "data": [
    {
      "id": "img-001",
      "productId": "prod-001",
      "url": "https://...",
      "altText": "Laptop Dell XPS 15 - Mặt trước",
      "sortOrder": 0,
      "isPrimary": true
    }
  ]
}
```

### POST `/products/:id/images`

Upload thêm ảnh sản phẩm.

**Request Body:** `{ "url": "https://...", "altText": "...", "isPrimary": false }`

### PUT `/product-images/:id`

Cập nhật thông tin ảnh.

### DELETE `/product-images/:id`

Xóa ảnh (không cho xóa ảnh primary nếu còn ảnh khác).

### PATCH `/product-images/reorder`

Sắp xếp lại thứ tự ảnh.

**Request Body:** `{ "items": [{ "id": "img-001", "sortOrder": 0 }] }`

---

## 7. `productVariantApi` — Biến thể sản phẩm

> Mock: Nhúng trong `productApi` (chưa tách file riêng)

### GET `/products/:id/variants`

Lấy tất cả biến thể của sản phẩm.

**ProductVariant type:**
```typescript
interface ProductVariant {
  id: string;
  productId: string;
  name: string;              // VD: 'RAM 16GB / SSD 512GB'
  sku: string;
  price: number;
  stock: number;
  barcode?: string;
  weight?: number;
  images?: string[];
  isActive: boolean;
  costPrice?: number;        // Giá nhập (Seller only)
}
```

### POST `/products/:id/variants`

Thêm biến thể mới.

### PUT `/product-variants/:id`

Cập nhật biến thể.

### DELETE `/product-variants/:id`

Xóa biến thể.

---

## 8. `supplierApi` — Nhà cung cấp

> Mock: `supplierApi` trong `/src/app/services/api.ts`

### GET `/suppliers`

Lấy danh sách NCC phân trang.

**Query params:** `?search&city&categoryId&isVerified&rating&page&pageSize`

**Response 200:** Danh sách `Supplier[]`

**Supplier type:**
```typescript
interface Supplier {
  id: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  logoUrl?: string;
  coverUrl?: string;
  description?: string;
  rating: number;
  reviewCount: number;
  productCount: number;
  minOrderValue: number;
  avgDeliveryDays: number;
  onTimeRate: number;         // % giao hàng đúng hạn
  isVerified: boolean;
  joinedDate: string;
  employees?: number;
  categoryIds?: string[];
  createdAt: string;
}
```

### GET `/suppliers/:id`

Lấy chi tiết NCC kèm thống kê.

### POST `/suppliers`

*Admin only.* Tạo NCC mới.

### PUT `/suppliers/:id`

*Seller (self)* hoặc *Admin.* Cập nhật thông tin NCC.

### PATCH `/suppliers/:id/verify`

*Admin only.* Xác minh NCC.

**Request Body:** `{ "isVerified": true, "note": "Đã kiểm tra chứng từ" }`

### GET `/suppliers/:id/categories`

Lấy danh sách ngành hàng của NCC.

### GET `/suppliers/:id/scorecards`

Lấy scorecard đánh giá NCC (on-time rate, quality, response time).

---

## 9. `supplierCategoryApi`, `staffApi`, `certificateApi`

> Mock: Trong `/src/app/services/api.ts` + file riêng

### Supplier Categories

```
POST   /suppliers/:id/categories           — Thêm ngành hàng cho NCC
DELETE /suppliers/:id/categories/:categoryId — Xóa ngành hàng
```

### Staff Members

```
GET    /suppliers/:id/staff           — Danh sách nhân viên NCC
POST   /suppliers/:id/staff           — Thêm nhân viên
PUT    /staff/:id                     — Cập nhật nhân viên
DELETE /staff/:id                     — Xóa nhân viên
PATCH  /staff/:id/permissions         — Cập nhật quyền
```

**StaffMember type:**
```typescript
interface StaffMember {
  id: string;
  supplierId: string;
  name: string;
  email: string;
  phone?: string;
  role: 'Chủ DN' | 'Quản lý' | 'NV Bán hàng' | 'Thủ kho' | 'Kế toán';
  permissions: string[];    // ['product.view', 'order.manage', ...]
  isActive: boolean;
  joinedDate: string;
}
```

### Business Certificates

```
GET    /suppliers/:id/certificates    — Danh sách chứng chỉ
POST   /suppliers/:id/certificates    — Upload chứng chỉ mới
PUT    /certificates/:id              — Cập nhật thông tin
PATCH  /certificates/:id/approve      — Admin duyệt
PATCH  /certificates/:id/reject       — Admin từ chối
```

**BusinessCertificate type:**
```typescript
interface BusinessCertificate {
  id: string;
  supplierId: string;
  name: string;
  issuer: string;
  issueDate: string;
  expiryDate?: string;
  fileUrl?: string;
  status: 'Chờ duyệt' | 'Đã duyệt' | 'Từ chối' | 'Hết hạn';
}
```

---

## Tài liệu liên quan

- [10-api-spec-part2.md](./10-api-spec-part2.md) — API: Đơn hàng, Giỏ hàng, RFQ, Hợp đồng
- [04-database-schema-part1.md](./04-database-schema-part1.md) — Schema: Người dùng, Sản phẩm, NCC
- [18-roles-permissions.md](./18-roles-permissions.md) — Phân quyền API
- [32-vibe-coding-context.md](./32-vibe-coding-context.md) — AI context & Service Map

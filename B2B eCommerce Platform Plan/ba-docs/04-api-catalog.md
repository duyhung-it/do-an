# 04 - API Catalog: Product Catalog APIs
# Nền tảng CELLPHONES eCommerce

**Base URL:** `/api/v1`  
**Content-Type:** `application/json`  
**Authentication:** Bearer Token (JWT) — truyền qua header `Authorization: Bearer <token>`

---

## Mục lục

1. [Categories (Danh mục sản phẩm)](#1-categories)
2. [Products (Sản phẩm)](#2-products)
3. [Product Variants (Biến thể sản phẩm)](#3-product-variants)
4. [Product Images (Hình ảnh sản phẩm)](#4-product-images)
5. [Reviews (Đánh giá)](#5-reviews)
6. [Wishlist (Danh sách yêu thích)](#6-wishlist)
7. [Combos (Combo sản phẩm)](#7-combos)
8. [Blog (Bài viết)](#8-blog)
9. [Store Locator (Cửa hàng)](#9-store-locator)

---

## 1. Categories

### Mô hình dữ liệu: Category

```json
{
  "id": "uuid",
  "name": "string",
  "slug": "string",
  "description": "string",
  "icon": "string",
  "imageUrl": "string | null",
  "parentId": "uuid | null",
  "level": "number (0 = root, 1 = sub, 2 = sub-sub)",
  "path": "string (e.g. /dien-thoai/samsung)",
  "isActive": "boolean",
  "sortOrder": "number",
  "productCount": "number",
  "metaTitle": "string | null",
  "metaDescription": "string | null",
  "children": "Category[]",
  "createdAt": "ISO8601 datetime",
  "updatedAt": "ISO8601 datetime"
}
```

---

### GET /categories
**Mô tả:** Lấy toàn bộ cây danh mục sản phẩm (nested tree structure).

**Xác thực:** Không yêu cầu (Public). Tham số `includeInactive` chỉ dành cho ADMIN.

**Query Parameters:**

| Tên | Kiểu | Bắt buộc | Mặc định | Mô tả |
|-----|------|----------|----------|-------|
| includeInactive | boolean | Không | false | Nếu true: trả về cả danh mục không active. Chỉ ADMIN mới được dùng. |

**Response 200 OK:**
```json
[
  {
    "id": "a1b2c3d4-0001-0001-0001-000000000001",
    "name": "Điện thoại",
    "slug": "dien-thoai",
    "description": "Điện thoại smartphone các hãng",
    "icon": "smartphone",
    "imageUrl": "https://cdn.cellphones.vn/categories/dien-thoai.jpg",
    "parentId": null,
    "level": 0,
    "path": "/dien-thoai",
    "isActive": true,
    "sortOrder": 1,
    "productCount": 250,
    "metaTitle": "Điện thoại chính hãng giá tốt | CellPhones",
    "metaDescription": "Mua điện thoại iPhone, Samsung, Xiaomi chính hãng với giá tốt nhất",
    "children": [
      {
        "id": "a1b2c3d4-0001-0001-0001-000000000002",
        "name": "Samsung",
        "slug": "dien-thoai-samsung",
        "description": "Điện thoại Samsung Galaxy",
        "icon": "samsung",
        "imageUrl": "https://cdn.cellphones.vn/categories/samsung.jpg",
        "parentId": "a1b2c3d4-0001-0001-0001-000000000001",
        "level": 1,
        "path": "/dien-thoai/samsung",
        "isActive": true,
        "sortOrder": 1,
        "productCount": 80,
        "metaTitle": null,
        "metaDescription": null,
        "children": [],
        "createdAt": "2024-01-01T00:00:00Z",
        "updatedAt": "2024-06-01T00:00:00Z"
      }
    ],
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-06-01T00:00:00Z"
  }
]
```

**Mã lỗi:**

| HTTP Status | Error Code | Mô tả |
|------------|-----------|-------|
| 403 | FORBIDDEN | Người dùng không phải ADMIN nhưng truyền `includeInactive=true` |

---

### GET /categories/:id
**Mô tả:** Lấy thông tin chi tiết một danh mục theo ID, bao gồm các danh mục con trực tiếp.

**Xác thực:** Không yêu cầu (Public).

**Path Parameters:**

| Tên | Kiểu | Mô tả |
|-----|------|-------|
| id | UUID | ID của danh mục |

**Response 200 OK:**
```json
{
  "id": "a1b2c3d4-0001-0001-0001-000000000001",
  "name": "Điện thoại",
  "slug": "dien-thoai",
  "description": "Điện thoại smartphone các hãng",
  "icon": "smartphone",
  "imageUrl": "https://cdn.cellphones.vn/categories/dien-thoai.jpg",
  "parentId": null,
  "level": 0,
  "path": "/dien-thoai",
  "isActive": true,
  "sortOrder": 1,
  "productCount": 250,
  "metaTitle": "Điện thoại chính hãng giá tốt | CellPhones",
  "metaDescription": "Mua điện thoại chính hãng với giá tốt nhất",
  "children": [
    {
      "id": "a1b2c3d4-0001-0001-0001-000000000002",
      "name": "Samsung",
      "slug": "dien-thoai-samsung",
      "description": "Điện thoại Samsung Galaxy",
      "icon": "samsung",
      "imageUrl": "https://cdn.cellphones.vn/categories/samsung.jpg",
      "parentId": "a1b2c3d4-0001-0001-0001-000000000001",
      "level": 1,
      "path": "/dien-thoai/samsung",
      "isActive": true,
      "sortOrder": 1,
      "productCount": 80,
      "metaTitle": null,
      "metaDescription": null,
      "children": [],
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-06-01T00:00:00Z"
    }
  ],
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-06-01T00:00:00Z"
}
```

**Mã lỗi:**

| HTTP Status | Error Code | Mô tả |
|------------|-----------|-------|
| 404 | CATEGORY_NOT_FOUND | Không tìm thấy danh mục với ID này |

---

### GET /categories/:slug/by-slug
**Mô tả:** Lấy thông tin danh mục theo slug. Dùng cho SEO-friendly URL.

**Xác thực:** Không yêu cầu (Public).

**Path Parameters:**

| Tên | Kiểu | Mô tả |
|-----|------|-------|
| slug | string | Slug của danh mục (e.g. `dien-thoai-samsung`) |

**Response 200 OK:** Giống GET /categories/:id

**Mã lỗi:**

| HTTP Status | Error Code | Mô tả |
|------------|-----------|-------|
| 404 | CATEGORY_NOT_FOUND | Không tìm thấy danh mục với slug này |

---

### POST /admin/categories
**Mô tả:** Tạo mới danh mục sản phẩm.

**Xác thực:** Bắt buộc — Role: ADMIN

**Request Body:**
```json
{
  "name": "Apple",
  "slug": "dien-thoai-apple",
  "description": "Điện thoại iPhone chính hãng Apple",
  "icon": "apple",
  "imageUrl": "https://cdn.cellphones.vn/categories/apple.jpg",
  "parentId": "a1b2c3d4-0001-0001-0001-000000000001",
  "sortOrder": 2,
  "isActive": true,
  "metaTitle": "iPhone chính hãng | CellPhones",
  "metaDescription": "Mua iPhone chính hãng giá tốt nhất tại CellPhones"
}
```

**Quy tắc tự động:**
- `level` được tính tự động dựa vào `parentId`: nếu `parentId = null` thì `level = 0`, ngược lại `level = parent.level + 1`
- `path` được tính tự động: nếu `parentId = null` thì `path = /{slug}`, ngược lại `path = parent.path/{slug}`

**Validation:**
- `name`: bắt buộc, tối đa 100 ký tự
- `slug`: bắt buộc, chỉ chứa chữ thường, số, dấu gạch ngang, unique toàn hệ thống
- `description`: bắt buộc
- `icon`: bắt buộc
- `parentId`: nếu có, phải tồn tại và đang active

**Response 201 Created:**
```json
{
  "id": "a1b2c3d4-0001-0001-0001-000000000003",
  "name": "Apple",
  "slug": "dien-thoai-apple",
  "description": "Điện thoại iPhone chính hãng Apple",
  "icon": "apple",
  "imageUrl": "https://cdn.cellphones.vn/categories/apple.jpg",
  "parentId": "a1b2c3d4-0001-0001-0001-000000000001",
  "level": 1,
  "path": "/dien-thoai/dien-thoai-apple",
  "isActive": true,
  "sortOrder": 2,
  "productCount": 0,
  "metaTitle": "iPhone chính hãng | CellPhones",
  "metaDescription": "Mua iPhone chính hãng giá tốt nhất tại CellPhones",
  "children": [],
  "createdAt": "2024-06-15T08:00:00Z",
  "updatedAt": "2024-06-15T08:00:00Z"
}
```

**Mã lỗi:**

| HTTP Status | Error Code | Mô tả |
|------------|-----------|-------|
| 400 | VALIDATION_ERROR | Dữ liệu đầu vào không hợp lệ |
| 401 | UNAUTHORIZED | Chưa đăng nhập |
| 403 | FORBIDDEN | Không có quyền ADMIN |
| 404 | PARENT_CATEGORY_NOT_FOUND | parentId không tồn tại |
| 409 | CATEGORY_SLUG_EXISTED | Slug đã tồn tại trong hệ thống |

---

### PATCH /admin/categories/:id
**Mô tả:** Cập nhật thông tin danh mục. Tất cả các trường đều optional.

**Xác thực:** Bắt buộc — Role: ADMIN

**Path Parameters:**

| Tên | Kiểu | Mô tả |
|-----|------|-------|
| id | UUID | ID danh mục cần cập nhật |

**Request Body (tất cả optional):**
```json
{
  "name": "Apple iPhone",
  "slug": "iphone",
  "description": "Điện thoại iPhone từ Apple",
  "icon": "apple-icon",
  "imageUrl": "https://cdn.cellphones.vn/categories/iphone.jpg",
  "parentId": "a1b2c3d4-0001-0001-0001-000000000001",
  "sortOrder": 1,
  "isActive": true,
  "metaTitle": "iPhone chính hãng",
  "metaDescription": "Mua iPhone giá tốt"
}
```

**Lưu ý:** Nếu thay đổi `parentId` hoặc `slug`, hệ thống sẽ tự tính lại `level` và `path`.

**Response 200 OK:** Category object đã cập nhật (giống GET /categories/:id)

**Mã lỗi:**

| HTTP Status | Error Code | Mô tả |
|------------|-----------|-------|
| 400 | VALIDATION_ERROR | Dữ liệu không hợp lệ |
| 401 | UNAUTHORIZED | Chưa đăng nhập |
| 403 | FORBIDDEN | Không có quyền ADMIN |
| 404 | CATEGORY_NOT_FOUND | Không tìm thấy danh mục |
| 409 | CATEGORY_SLUG_EXISTED | Slug mới đã tồn tại |

---

### DELETE /admin/categories/:id
**Mô tả:** Xóa danh mục. Chỉ xóa được khi danh mục không có sản phẩm nào.

**Xác thực:** Bắt buộc — Role: ADMIN

**Path Parameters:**

| Tên | Kiểu | Mô tả |
|-----|------|-------|
| id | UUID | ID danh mục cần xóa |

**Quy tắc nghiệp vụ:**
- Không thể xóa nếu `productCount > 0` — phải chuyển/xóa hết sản phẩm trước
- Không thể xóa nếu danh mục còn danh mục con
- Xóa vĩnh viễn (hard delete)

**Response 204 No Content**

**Mã lỗi:**

| HTTP Status | Error Code | Mô tả |
|------------|-----------|-------|
| 401 | UNAUTHORIZED | Chưa đăng nhập |
| 403 | FORBIDDEN | Không có quyền ADMIN |
| 404 | CATEGORY_NOT_FOUND | Không tìm thấy danh mục |
| 409 | CATEGORY_HAS_PRODUCTS | Danh mục còn sản phẩm, không thể xóa |
| 409 | CATEGORY_HAS_CHILDREN | Danh mục còn danh mục con, không thể xóa |

---

## 2. Products

### Mô hình dữ liệu: Product

```json
{
  "id": "uuid",
  "name": "string",
  "slug": "string",
  "description": "string (HTML)",
  "shortDescription": "string",
  "categoryId": "uuid",
  "category": {
    "id": "uuid",
    "name": "string",
    "slug": "string"
  },
  "brand": "string",
  "price": "number (VND - giá hiện tại)",
  "originalPrice": "number (VND - giá gốc để tính % giảm)",
  "discountPercent": "number (tính tự động)",
  "status": "ACTIVE | INACTIVE | DISCONTINUED",
  "condition": "NEW | LIKE_NEW | USED",
  "warranty": "string (e.g. '12 tháng chính hãng')",
  "tags": "string[]",
  "specifications": "object (key-value pairs)",
  "color": "string | null",
  "viewCount": "number",
  "soldCount": "number",
  "rating": "number (0.0 - 5.0)",
  "reviewCount": "number",
  "isNew": "boolean",
  "isFeatured": "boolean",
  "isHot": "boolean",
  "variants": "ProductVariant[]",
  "images": "ProductImage[]",
  "phoneSpecs": "PhoneSpecs | null",
  "priceHistory": "PriceHistory[]",
  "createdAt": "ISO8601 datetime",
  "updatedAt": "ISO8601 datetime"
}
```

### Mô hình dữ liệu: PaginatedResponse<T>

```json
{
  "data": "T[]",
  "pagination": {
    "page": "number",
    "pageSize": "number",
    "total": "number",
    "totalPages": "number",
    "hasNext": "boolean",
    "hasPrev": "boolean"
  },
  "facets": {
    "brands": "string[]",
    "categories": [{ "id": "uuid", "name": "string", "count": "number" }],
    "priceRange": { "min": "number", "max": "number" },
    "ramOptions": "string[]",
    "storageOptions": "string[]"
  }
}
```

---

### GET /products
**Mô tả:** Lấy danh sách sản phẩm theo trang, hỗ trợ nhiều bộ lọc và sắp xếp.

**Xác thực:** Không yêu cầu (Public).

**Query Parameters:**

| Tên | Kiểu | Bắt buộc | Mặc định | Mô tả |
|-----|------|----------|----------|-------|
| page | number | Không | 1 | Số trang hiện tại |
| pageSize | number | Không | 20 | Số sản phẩm mỗi trang (tối đa 100) |
| sortBy | string | Không | createdAt | Sắp xếp theo: `price`, `rating`, `soldCount`, `createdAt` |
| sortDir | string | Không | desc | Chiều sắp xếp: `asc`, `desc` |
| search | string | Không | — | Tìm kiếm full-text trên name và brand |
| categoryId | UUID | Không | — | Lọc theo ID danh mục |
| categorySlug | string | Không | — | Lọc theo slug danh mục |
| brand | string | Không | — | Lọc theo thương hiệu, nhiều giá trị cách nhau bởi dấu phẩy (e.g. `Apple,Samsung`) |
| status | string | Không | ACTIVE | Lọc theo trạng thái: `ACTIVE`, `INACTIVE`, `DISCONTINUED` |
| condition | string | Không | — | Lọc theo tình trạng: `NEW`, `LIKE_NEW`, `USED` |
| minPrice | number | Không | — | Giá tối thiểu (VND) |
| maxPrice | number | Không | — | Giá tối đa (VND) |
| ram | string | Không | — | Lọc theo RAM, nhiều giá trị (e.g. `8GB,12GB`) |
| storage | string | Không | — | Lọc theo bộ nhớ (e.g. `128GB,256GB`) |
| color | string | Không | — | Lọc theo màu sắc |
| isFeatured | boolean | Không | — | Lọc sản phẩm nổi bật |
| isNew | boolean | Không | — | Lọc sản phẩm mới |
| isHot | boolean | Không | — | Lọc sản phẩm hot/trending |
| tags | string | Không | — | Lọc theo tags (nhiều tags cách nhau dấu phẩy) |

**Response 200 OK:**
```json
{
  "data": [
    {
      "id": "p0001-0001-0001-0001-000000000001",
      "name": "iPhone 15 Pro Max 256GB",
      "slug": "iphone-15-pro-max-256gb",
      "shortDescription": "Chip A17 Pro, Titanium, Camera 48MP ProRAW",
      "categoryId": "a1b2c3d4-0001-0001-0001-000000000003",
      "category": {
        "id": "a1b2c3d4-0001-0001-0001-000000000003",
        "name": "iPhone",
        "slug": "iphone"
      },
      "brand": "Apple",
      "price": 33990000,
      "originalPrice": 37990000,
      "discountPercent": 11,
      "status": "ACTIVE",
      "condition": "NEW",
      "warranty": "12 tháng chính hãng Apple",
      "rating": 4.8,
      "reviewCount": 256,
      "soldCount": 1200,
      "viewCount": 45000,
      "isNew": false,
      "isFeatured": true,
      "isHot": true,
      "images": [
        {
          "id": "img-001",
          "url": "https://cdn.cellphones.vn/products/iphone15promax-1.jpg",
          "altText": "iPhone 15 Pro Max màu Titan Tự nhiên",
          "isPrimary": true,
          "sortOrder": 0
        }
      ],
      "createdAt": "2024-01-15T00:00:00Z",
      "updatedAt": "2024-06-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 150,
    "totalPages": 8,
    "hasNext": true,
    "hasPrev": false
  },
  "facets": {
    "brands": ["Apple", "Samsung", "Xiaomi", "OPPO", "Vivo"],
    "categories": [
      { "id": "a1b2c3d4-0001-0001-0001-000000000003", "name": "iPhone", "count": 45 },
      { "id": "a1b2c3d4-0001-0001-0001-000000000002", "name": "Samsung", "count": 80 }
    ],
    "priceRange": { "min": 2990000, "max": 69990000 },
    "ramOptions": ["4GB", "6GB", "8GB", "12GB", "16GB"],
    "storageOptions": ["64GB", "128GB", "256GB", "512GB", "1TB"]
  }
}
```

**Mã lỗi:**

| HTTP Status | Error Code | Mô tả |
|------------|-----------|-------|
| 400 | INVALID_QUERY_PARAM | Tham số query không hợp lệ (e.g. pageSize > 100) |

---

### GET /products/:id
**Mô tả:** Lấy chi tiết sản phẩm theo ID. Tự động tăng `viewCount` mỗi lần gọi.

**Xác thực:** Không yêu cầu (Public).

**Path Parameters:**

| Tên | Kiểu | Mô tả |
|-----|------|-------|
| id | UUID | ID sản phẩm |

**Response 200 OK:**
```json
{
  "id": "p0001-0001-0001-0001-000000000001",
  "name": "iPhone 15 Pro Max 256GB",
  "slug": "iphone-15-pro-max-256gb",
  "description": "<p>iPhone 15 Pro Max với chip A17 Pro mạnh mẽ...</p>",
  "shortDescription": "Chip A17 Pro, Titanium, Camera 48MP ProRAW",
  "categoryId": "a1b2c3d4-0001-0001-0001-000000000003",
  "category": {
    "id": "a1b2c3d4-0001-0001-0001-000000000003",
    "name": "iPhone",
    "slug": "iphone"
  },
  "brand": "Apple",
  "price": 33990000,
  "originalPrice": 37990000,
  "discountPercent": 11,
  "status": "ACTIVE",
  "condition": "NEW",
  "warranty": "12 tháng chính hãng Apple",
  "tags": ["flagship", "5g", "promax"],
  "specifications": {
    "Hệ điều hành": "iOS 17",
    "Chip": "A17 Pro",
    "RAM": "8GB",
    "Bộ nhớ trong": "256GB",
    "Màn hình": "6.7 inch Super Retina XDR OLED"
  },
  "color": "Titan Tự Nhiên",
  "viewCount": 45001,
  "soldCount": 1200,
  "rating": 4.8,
  "reviewCount": 256,
  "isNew": false,
  "isFeatured": true,
  "isHot": true,
  "variants": [
    {
      "id": "var-001",
      "name": "256GB - Titan Tự Nhiên",
      "sku": "IPH15PM-256-TN",
      "price": 33990000,
      "originalPrice": 37990000,
      "stock": 45,
      "color": "Titan Tự Nhiên",
      "storage": "256GB",
      "ram": "8GB",
      "isActive": true
    },
    {
      "id": "var-002",
      "name": "512GB - Titan Đen",
      "sku": "IPH15PM-512-TB",
      "price": 38990000,
      "originalPrice": 43990000,
      "stock": 20,
      "color": "Titan Đen",
      "storage": "512GB",
      "ram": "8GB",
      "isActive": true
    }
  ],
  "images": [
    {
      "id": "img-001",
      "url": "https://cdn.cellphones.vn/products/iphone15promax-1.jpg",
      "altText": "iPhone 15 Pro Max màu Titan Tự nhiên - Mặt trước",
      "isPrimary": true,
      "sortOrder": 0
    },
    {
      "id": "img-002",
      "url": "https://cdn.cellphones.vn/products/iphone15promax-2.jpg",
      "altText": "iPhone 15 Pro Max - Mặt sau",
      "isPrimary": false,
      "sortOrder": 1
    }
  ],
  "phoneSpecs": {
    "display": "6.7 inch Super Retina XDR OLED, 2796x1290px, 460ppi",
    "chip": "Apple A17 Pro (3nm)",
    "ram": "8GB",
    "storage": "256GB",
    "rearCamera": "48MP main + 12MP ultrawide + 12MP 5x telephoto",
    "frontCamera": "12MP TrueDepth",
    "battery": "4422mAh, sạc MagSafe 15W",
    "os": "iOS 17",
    "connectivity": "5G, Wi-Fi 6E, Bluetooth 5.3, NFC, USB-C 3.0",
    "dimensions": "159.9 x 76.7 x 8.25 mm",
    "weight": "221g"
  },
  "priceHistory": [
    { "price": 37990000, "recordedAt": "2024-01-15T00:00:00Z" },
    { "price": 35990000, "recordedAt": "2024-03-01T00:00:00Z" },
    { "price": 33990000, "recordedAt": "2024-05-01T00:00:00Z" }
  ],
  "createdAt": "2024-01-15T00:00:00Z",
  "updatedAt": "2024-06-01T00:00:00Z"
}
```

**Mã lỗi:**

| HTTP Status | Error Code | Mô tả |
|------------|-----------|-------|
| 404 | PRODUCT_NOT_FOUND | Không tìm thấy sản phẩm |

---

### GET /products/:slug/by-slug
**Mô tả:** Lấy chi tiết sản phẩm theo slug. Dùng cho SEO URL. Tự động tăng `viewCount`.

**Xác thực:** Không yêu cầu (Public).

**Response 200 OK:** Giống GET /products/:id

**Mã lỗi:**

| HTTP Status | Error Code | Mô tả |
|------------|-----------|-------|
| 404 | PRODUCT_NOT_FOUND | Không tìm thấy sản phẩm với slug này |

---

### GET /products/:id/similar
**Mô tả:** Lấy danh sách sản phẩm tương tự. Logic: cùng categoryId HOẶC cùng brand, loại trừ chính sản phẩm đó, chỉ lấy sản phẩm ACTIVE.

**Xác thực:** Không yêu cầu (Public).

**Query Parameters:**

| Tên | Kiểu | Mặc định | Mô tả |
|-----|------|----------|-------|
| limit | number | 8 | Số sản phẩm tương tự tối đa trả về |

**Response 200 OK:**
```json
[
  {
    "id": "p0001-0001-0001-0001-000000000002",
    "name": "iPhone 15 Pro 128GB",
    "slug": "iphone-15-pro-128gb",
    "brand": "Apple",
    "price": 27990000,
    "originalPrice": 30990000,
    "discountPercent": 10,
    "rating": 4.7,
    "reviewCount": 180,
    "images": [
      {
        "id": "img-010",
        "url": "https://cdn.cellphones.vn/products/iphone15pro-1.jpg",
        "altText": "iPhone 15 Pro",
        "isPrimary": true,
        "sortOrder": 0
      }
    ]
  }
]
```

**Mã lỗi:**

| HTTP Status | Error Code | Mô tả |
|------------|-----------|-------|
| 404 | PRODUCT_NOT_FOUND | Không tìm thấy sản phẩm gốc |

---

### GET /products/:id/accessories
**Mô tả:** Lấy danh sách phụ kiện tương thích với sản phẩm (e.g. ốp lưng, sạc, tai nghe phù hợp).

**Xác thực:** Không yêu cầu (Public).

**Response 200 OK:**
```json
[
  {
    "id": "acc-001",
    "name": "Ốp lưng MagSafe iPhone 15 Pro Max",
    "slug": "op-lung-magsafe-iphone-15-pro-max",
    "brand": "Apple",
    "price": 990000,
    "originalPrice": 1290000,
    "discountPercent": 23,
    "rating": 4.5,
    "reviewCount": 42,
    "images": [
      {
        "id": "img-acc-001",
        "url": "https://cdn.cellphones.vn/products/op-lung-magsafe.jpg",
        "altText": "Ốp lưng MagSafe",
        "isPrimary": true,
        "sortOrder": 0
      }
    ]
  }
]
```

**Mã lỗi:**

| HTTP Status | Error Code | Mô tả |
|------------|-----------|-------|
| 404 | PRODUCT_NOT_FOUND | Không tìm thấy sản phẩm |

---

### GET /products/featured
**Mô tả:** Lấy danh sách sản phẩm nổi bật (`isFeatured = true`, status = ACTIVE).

**Xác thực:** Không yêu cầu (Public).

**Query Parameters:**

| Tên | Kiểu | Mặc định | Mô tả |
|-----|------|----------|-------|
| limit | number | 8 | Số sản phẩm tối đa |

**Response 200 OK:** Product[] (rút gọn, bao gồm ảnh chính)

---

### GET /products/hot
**Mô tả:** Lấy danh sách sản phẩm hot/trending (`isHot = true`, status = ACTIVE).

**Xác thực:** Không yêu cầu (Public).

**Query Parameters:**

| Tên | Kiểu | Mặc định | Mô tả |
|-----|------|----------|-------|
| limit | number | 6 | Số sản phẩm tối đa |

**Response 200 OK:** Product[] (rút gọn, bao gồm ảnh chính)

---

### GET /products/new
**Mô tả:** Lấy danh sách sản phẩm mới nhất (`isNew = true` hoặc sắp xếp theo `createdAt DESC`, status = ACTIVE).

**Xác thực:** Không yêu cầu (Public).

**Query Parameters:**

| Tên | Kiểu | Mặc định | Mô tả |
|-----|------|----------|-------|
| limit | number | 6 | Số sản phẩm tối đa |

**Response 200 OK:** Product[] (rút gọn)

---

### GET /products/brands
**Mô tả:** Lấy danh sách tất cả tên thương hiệu đang có sản phẩm ACTIVE trên hệ thống.

**Xác thực:** Không yêu cầu (Public).

**Response 200 OK:**
```json
["Apple", "OPPO", "Samsung", "Vivo", "Xiaomi"]
```

> Lưu ý: Danh sách được sắp xếp theo thứ tự alphabet (A-Z).

---

### POST /admin/products
**Mô tả:** Tạo mới sản phẩm.

**Xác thực:** Bắt buộc — Role: ADMIN

**Request Body:**
```json
{
  "name": "Samsung Galaxy S24 Ultra 256GB",
  "slug": "samsung-galaxy-s24-ultra-256gb",
  "description": "<p>Samsung Galaxy S24 Ultra với bút S Pen tích hợp...</p>",
  "shortDescription": "Bút S Pen tích hợp, Camera 200MP, Chip Snapdragon 8 Gen 3",
  "categoryId": "a1b2c3d4-0001-0001-0001-000000000002",
  "brand": "Samsung",
  "price": 31990000,
  "originalPrice": 35990000,
  "status": "ACTIVE",
  "condition": "NEW",
  "warranty": "12 tháng chính hãng Samsung",
  "tags": ["flagship", "s-pen", "5g"],
  "specifications": {
    "Chip": "Snapdragon 8 Gen 3",
    "RAM": "12GB",
    "Bộ nhớ trong": "256GB"
  },
  "color": "Titanium Black",
  "isNew": true,
  "isFeatured": true,
  "isHot": false
}
```

**Validation:**
- `name`, `slug`, `description`, `shortDescription`, `categoryId`, `brand`, `price`, `warranty`: bắt buộc
- `slug`: unique toàn hệ thống
- `price` > 0
- `originalPrice` >= `price` (nếu có)
- `categoryId` phải tồn tại và active

**Response 201 Created:** Product object đầy đủ

**Mã lỗi:**

| HTTP Status | Error Code | Mô tả |
|------------|-----------|-------|
| 400 | VALIDATION_ERROR | Dữ liệu không hợp lệ |
| 401 | UNAUTHORIZED | Chưa đăng nhập |
| 403 | FORBIDDEN | Không có quyền ADMIN |
| 404 | CATEGORY_NOT_FOUND | categoryId không tồn tại |
| 409 | PRODUCT_SLUG_EXISTED | Slug đã tồn tại |

---

### PATCH /admin/products/:id
**Mô tả:** Cập nhật thông tin sản phẩm. Tất cả các trường đều optional.

**Xác thực:** Bắt buộc — Role: ADMIN

**Request Body (tất cả optional):**
```json
{
  "name": "Samsung Galaxy S24 Ultra 256GB - Phiên bản mới",
  "price": 29990000,
  "isHot": true,
  "status": "ACTIVE"
}
```

**Response 200 OK:** Product object đã cập nhật

**Mã lỗi:**

| HTTP Status | Error Code | Mô tả |
|------------|-----------|-------|
| 400 | VALIDATION_ERROR | Dữ liệu không hợp lệ |
| 401 | UNAUTHORIZED | Chưa đăng nhập |
| 403 | FORBIDDEN | Không có quyền ADMIN |
| 404 | PRODUCT_NOT_FOUND | Không tìm thấy sản phẩm |
| 409 | PRODUCT_SLUG_EXISTED | Slug mới đã tồn tại |

---

### DELETE /admin/products/:id
**Mô tả:** Xóa mềm (soft delete) sản phẩm — thực chất là đặt `status = DISCONTINUED`. Sản phẩm không hiển thị trên storefront nhưng vẫn còn trong database để bảo toàn lịch sử đơn hàng.

**Xác thực:** Bắt buộc — Role: ADMIN

**Response 204 No Content**

**Mã lỗi:**

| HTTP Status | Error Code | Mô tả |
|------------|-----------|-------|
| 401 | UNAUTHORIZED | Chưa đăng nhập |
| 403 | FORBIDDEN | Không có quyền ADMIN |
| 404 | PRODUCT_NOT_FOUND | Không tìm thấy sản phẩm |

---

## 3. Product Variants

### Mô hình dữ liệu: ProductVariant

```json
{
  "id": "uuid",
  "productId": "uuid",
  "name": "string (e.g. '256GB - Titan Tự Nhiên')",
  "sku": "string (unique)",
  "price": "number (VND)",
  "originalPrice": "number | null",
  "stock": "number",
  "color": "string | null",
  "storage": "string | null",
  "ram": "string | null",
  "isActive": "boolean",
  "createdAt": "ISO8601 datetime",
  "updatedAt": "ISO8601 datetime"
}
```

---

### GET /products/:productId/variants
**Mô tả:** Lấy tất cả biến thể của một sản phẩm.

**Xác thực:** Không yêu cầu (Public).

**Response 200 OK:**
```json
[
  {
    "id": "var-001",
    "productId": "p0001-0001-0001-0001-000000000001",
    "name": "256GB - Titan Tự Nhiên",
    "sku": "IPH15PM-256-TN",
    "price": 33990000,
    "originalPrice": 37990000,
    "stock": 45,
    "color": "Titan Tự Nhiên",
    "storage": "256GB",
    "ram": "8GB",
    "isActive": true,
    "createdAt": "2024-01-15T00:00:00Z",
    "updatedAt": "2024-06-01T00:00:00Z"
  },
  {
    "id": "var-002",
    "productId": "p0001-0001-0001-0001-000000000001",
    "name": "512GB - Titan Đen",
    "sku": "IPH15PM-512-TB",
    "price": 38990000,
    "originalPrice": 43990000,
    "stock": 20,
    "color": "Titan Đen",
    "storage": "512GB",
    "ram": "8GB",
    "isActive": true,
    "createdAt": "2024-01-15T00:00:00Z",
    "updatedAt": "2024-06-01T00:00:00Z"
  }
]
```

**Mã lỗi:**

| HTTP Status | Error Code | Mô tả |
|------------|-----------|-------|
| 404 | PRODUCT_NOT_FOUND | Không tìm thấy sản phẩm |

---

### POST /admin/products/:productId/variants
**Mô tả:** Thêm biến thể mới cho sản phẩm.

**Xác thực:** Bắt buộc — Role: ADMIN

**Request Body:**
```json
{
  "name": "1TB - Titan Trắng",
  "sku": "IPH15PM-1TB-TT",
  "price": 46990000,
  "originalPrice": 52990000,
  "stock": 10,
  "color": "Titan Trắng",
  "storage": "1TB",
  "ram": "8GB",
  "isActive": true
}
```

**Validation:**
- `name`, `sku`, `price`, `stock`: bắt buộc
- `sku`: unique toàn hệ thống
- `price` > 0, `stock` >= 0
- `originalPrice` >= `price` nếu có

**Response 201 Created:**
```json
{
  "id": "var-003",
  "productId": "p0001-0001-0001-0001-000000000001",
  "name": "1TB - Titan Trắng",
  "sku": "IPH15PM-1TB-TT",
  "price": 46990000,
  "originalPrice": 52990000,
  "stock": 10,
  "color": "Titan Trắng",
  "storage": "1TB",
  "ram": "8GB",
  "isActive": true,
  "createdAt": "2024-06-15T10:00:00Z",
  "updatedAt": "2024-06-15T10:00:00Z"
}
```

**Mã lỗi:**

| HTTP Status | Error Code | Mô tả |
|------------|-----------|-------|
| 400 | VALIDATION_ERROR | Dữ liệu không hợp lệ |
| 401 | UNAUTHORIZED | Chưa đăng nhập |
| 403 | FORBIDDEN | Không có quyền ADMIN |
| 404 | PRODUCT_NOT_FOUND | Không tìm thấy sản phẩm |
| 409 | VARIANT_SKU_EXISTED | SKU đã tồn tại trong hệ thống |

---

### PATCH /admin/products/:productId/variants/:id
**Mô tả:** Cập nhật thông tin biến thể. Tất cả các trường đều optional.

**Xác thực:** Bắt buộc — Role: ADMIN

**Request Body (tất cả optional):**
```json
{
  "price": 44990000,
  "stock": 15,
  "isActive": true
}
```

**Response 200 OK:** ProductVariant object đã cập nhật

**Mã lỗi:**

| HTTP Status | Error Code | Mô tả |
|------------|-----------|-------|
| 400 | VALIDATION_ERROR | Dữ liệu không hợp lệ |
| 401 | UNAUTHORIZED | Chưa đăng nhập |
| 403 | FORBIDDEN | Không có quyền ADMIN |
| 404 | PRODUCT_NOT_FOUND | Không tìm thấy sản phẩm |
| 404 | VARIANT_NOT_FOUND | Không tìm thấy biến thể |

---

### DELETE /admin/products/:productId/variants/:id
**Mô tả:** Xóa biến thể sản phẩm.

**Xác thực:** Bắt buộc — Role: ADMIN

**Lưu ý nghiệp vụ:** Không thể xóa biến thể nếu đang có trong giỏ hàng của người dùng hoặc trong đơn hàng chưa hoàn thành.

**Response 204 No Content**

**Mã lỗi:**

| HTTP Status | Error Code | Mô tả |
|------------|-----------|-------|
| 401 | UNAUTHORIZED | Chưa đăng nhập |
| 403 | FORBIDDEN | Không có quyền ADMIN |
| 404 | PRODUCT_NOT_FOUND | Không tìm thấy sản phẩm |
| 404 | VARIANT_NOT_FOUND | Không tìm thấy biến thể |
| 409 | VARIANT_IN_ACTIVE_ORDER | Biến thể đang có trong đơn hàng chưa hoàn thành |

---

## 4. Product Images

### Mô hình dữ liệu: ProductImage

```json
{
  "id": "uuid",
  "productId": "uuid",
  "url": "string (CDN URL)",
  "altText": "string | null",
  "isPrimary": "boolean",
  "sortOrder": "number",
  "createdAt": "ISO8601 datetime",
  "updatedAt": "ISO8601 datetime"
}
```

---

### GET /products/:productId/images
**Mô tả:** Lấy tất cả ảnh của sản phẩm, sắp xếp theo `sortOrder` tăng dần.

**Xác thực:** Không yêu cầu (Public).

**Response 200 OK:**
```json
[
  {
    "id": "img-001",
    "productId": "p0001-0001-0001-0001-000000000001",
    "url": "https://cdn.cellphones.vn/products/iphone15promax-1.jpg",
    "altText": "iPhone 15 Pro Max màu Titan Tự nhiên - Mặt trước",
    "isPrimary": true,
    "sortOrder": 0,
    "createdAt": "2024-01-15T00:00:00Z",
    "updatedAt": "2024-01-15T00:00:00Z"
  },
  {
    "id": "img-002",
    "productId": "p0001-0001-0001-0001-000000000001",
    "url": "https://cdn.cellphones.vn/products/iphone15promax-2.jpg",
    "altText": "iPhone 15 Pro Max - Mặt sau camera",
    "isPrimary": false,
    "sortOrder": 1,
    "createdAt": "2024-01-15T00:00:00Z",
    "updatedAt": "2024-01-15T00:00:00Z"
  }
]
```

**Mã lỗi:**

| HTTP Status | Error Code | Mô tả |
|------------|-----------|-------|
| 404 | PRODUCT_NOT_FOUND | Không tìm thấy sản phẩm |

---

### POST /admin/products/:productId/images
**Mô tả:** Upload ảnh mới cho sản phẩm.

**Xác thực:** Bắt buộc — Role: ADMIN

**Content-Type:** `multipart/form-data`

**Form Fields:**

| Tên | Kiểu | Bắt buộc | Mô tả |
|-----|------|----------|-------|
| file | File | Có | File ảnh (JPEG/PNG/WebP, tối đa 5MB) |
| altText | string | Không | Văn bản thay thế cho SEO/accessibility |
| isPrimary | boolean | Không | Nếu true: đặt làm ảnh chính, bỏ isPrimary của các ảnh khác |

**Quy tắc nghiệp vụ:**
- Nếu `isPrimary = true`: tự động set `isPrimary = false` cho tất cả ảnh hiện tại trước khi tạo ảnh mới
- `sortOrder` tự động gán = số ảnh hiện tại (thêm vào cuối)
- File ảnh được upload lên CDN, lưu URL vào database

**Response 201 Created:**
```json
{
  "id": "img-003",
  "productId": "p0001-0001-0001-0001-000000000001",
  "url": "https://cdn.cellphones.vn/products/iphone15promax-3.jpg",
  "altText": "iPhone 15 Pro Max - Góc nghiêng",
  "isPrimary": false,
  "sortOrder": 2,
  "createdAt": "2024-06-15T10:30:00Z",
  "updatedAt": "2024-06-15T10:30:00Z"
}
```

**Mã lỗi:**

| HTTP Status | Error Code | Mô tả |
|------------|-----------|-------|
| 400 | INVALID_FILE_TYPE | File không đúng định dạng (chỉ chấp nhận JPEG/PNG/WebP) |
| 400 | FILE_TOO_LARGE | File vượt quá 5MB |
| 401 | UNAUTHORIZED | Chưa đăng nhập |
| 403 | FORBIDDEN | Không có quyền ADMIN |
| 404 | PRODUCT_NOT_FOUND | Không tìm thấy sản phẩm |

---

### PATCH /admin/products/:productId/images/:id
**Mô tả:** Cập nhật metadata ảnh sản phẩm (altText, sortOrder, isPrimary).

**Xác thực:** Bắt buộc — Role: ADMIN

**Request Body (tất cả optional):**
```json
{
  "altText": "iPhone 15 Pro Max Titan Tự Nhiên - Ảnh chính thức",
  "sortOrder": 0,
  "isPrimary": true
}
```

**Response 200 OK:**
```json
{
  "id": "img-001",
  "productId": "p0001-0001-0001-0001-000000000001",
  "url": "https://cdn.cellphones.vn/products/iphone15promax-1.jpg",
  "altText": "iPhone 15 Pro Max Titan Tự Nhiên - Ảnh chính thức",
  "isPrimary": true,
  "sortOrder": 0,
  "createdAt": "2024-01-15T00:00:00Z",
  "updatedAt": "2024-06-15T11:00:00Z"
}
```

**Mã lỗi:**

| HTTP Status | Error Code | Mô tả |
|------------|-----------|-------|
| 401 | UNAUTHORIZED | Chưa đăng nhập |
| 403 | FORBIDDEN | Không có quyền ADMIN |
| 404 | PRODUCT_NOT_FOUND | Không tìm thấy sản phẩm |
| 404 | IMAGE_NOT_FOUND | Không tìm thấy ảnh |

---

### DELETE /admin/products/:productId/images/:id
**Mô tả:** Xóa ảnh sản phẩm. Xóa cả file trên CDN.

**Xác thực:** Bắt buộc — Role: ADMIN

**Lưu ý:** Nếu xóa ảnh chính (isPrimary = true), hệ thống sẽ tự động đặt ảnh tiếp theo (sortOrder thấp nhất còn lại) làm ảnh chính.

**Response 204 No Content**

**Mã lỗi:**

| HTTP Status | Error Code | Mô tả |
|------------|-----------|-------|
| 401 | UNAUTHORIZED | Chưa đăng nhập |
| 403 | FORBIDDEN | Không có quyền ADMIN |
| 404 | PRODUCT_NOT_FOUND | Không tìm thấy sản phẩm |
| 404 | IMAGE_NOT_FOUND | Không tìm thấy ảnh |

---

### PATCH /admin/products/:productId/images/reorder
**Mô tả:** Sắp xếp lại thứ tự ảnh sản phẩm theo mảng ID được truyền vào.

**Xác thực:** Bắt buộc — Role: ADMIN

**Quy tắc nghiệp vụ:** Gán `sortOrder` lần lượt = 0, 1, 2, ... theo đúng thứ tự trong mảng `imageIds`.

**Request Body:**
```json
{
  "imageIds": [
    "img-003",
    "img-001",
    "img-002"
  ]
}
```

**Response 200 OK:**
```json
[
  {
    "id": "img-003",
    "productId": "p0001-0001-0001-0001-000000000001",
    "url": "https://cdn.cellphones.vn/products/iphone15promax-3.jpg",
    "altText": "iPhone 15 Pro Max - Góc nghiêng",
    "isPrimary": false,
    "sortOrder": 0,
    "createdAt": "2024-06-15T10:30:00Z",
    "updatedAt": "2024-06-15T12:00:00Z"
  },
  {
    "id": "img-001",
    "productId": "p0001-0001-0001-0001-000000000001",
    "url": "https://cdn.cellphones.vn/products/iphone15promax-1.jpg",
    "altText": "iPhone 15 Pro Max Titan Tự Nhiên - Ảnh chính thức",
    "isPrimary": true,
    "sortOrder": 1,
    "createdAt": "2024-01-15T00:00:00Z",
    "updatedAt": "2024-06-15T12:00:00Z"
  },
  {
    "id": "img-002",
    "productId": "p0001-0001-0001-0001-000000000001",
    "url": "https://cdn.cellphones.vn/products/iphone15promax-2.jpg",
    "altText": "iPhone 15 Pro Max - Mặt sau camera",
    "isPrimary": false,
    "sortOrder": 2,
    "createdAt": "2024-01-15T00:00:00Z",
    "updatedAt": "2024-06-15T12:00:00Z"
  }
]
```

**Mã lỗi:**

| HTTP Status | Error Code | Mô tả |
|------------|-----------|-------|
| 400 | INVALID_IMAGE_IDS | Một hoặc nhiều ID trong mảng không thuộc sản phẩm này |
| 401 | UNAUTHORIZED | Chưa đăng nhập |
| 403 | FORBIDDEN | Không có quyền ADMIN |
| 404 | PRODUCT_NOT_FOUND | Không tìm thấy sản phẩm |

---

## 5. Reviews

### Mô hình dữ liệu: Review

```json
{
  "id": "uuid",
  "productId": "uuid",
  "userId": "uuid",
  "user": {
    "id": "uuid",
    "fullName": "string",
    "avatarUrl": "string | null"
  },
  "orderId": "uuid | null",
  "rating": "number (1-5)",
  "title": "string | null",
  "comment": "string",
  "images": "string[] (URLs)",
  "tags": "string[]",
  "isVerifiedPurchase": "boolean",
  "status": "PENDING | VISIBLE | HIDDEN",
  "helpfulCount": "number",
  "sellerReply": "string | null",
  "sellerReplyAt": "ISO8601 datetime | null",
  "createdAt": "ISO8601 datetime",
  "updatedAt": "ISO8601 datetime"
}
```

---

### GET /products/:productId/reviews
**Mô tả:** Lấy danh sách đánh giá của sản phẩm. Chỉ trả về review có `status = VISIBLE`.

**Xác thực:** Không yêu cầu (Public).

**Query Parameters:**

| Tên | Kiểu | Mặc định | Mô tả |
|-----|------|----------|-------|
| page | number | 1 | Số trang |
| pageSize | number | 10 | Số review mỗi trang |
| sortBy | string | createdAt | Sắp xếp theo: `createdAt`, `rating`, `helpfulCount` |
| sortDir | string | desc | `asc` hoặc `desc` |
| rating | number | — | Lọc theo số sao (1-5) |
| verifiedOnly | boolean | false | Chỉ lấy review đã mua hàng xác nhận |
| hasImages | boolean | false | Chỉ lấy review có kèm ảnh |

**Response 200 OK:**
```json
{
  "data": [
    {
      "id": "rev-001",
      "productId": "p0001-0001-0001-0001-000000000001",
      "userId": "usr-001",
      "user": {
        "id": "usr-001",
        "fullName": "Nguyễn Văn An",
        "avatarUrl": "https://cdn.cellphones.vn/avatars/usr-001.jpg"
      },
      "orderId": "ord-001",
      "rating": 5,
      "title": "Điện thoại tuyệt vời",
      "comment": "Máy đẹp, camera chụp cực kỳ rõ nét, pin trâu hơn mong đợi. Rất hài lòng với sản phẩm!",
      "images": [
        "https://cdn.cellphones.vn/reviews/rev-001-1.jpg",
        "https://cdn.cellphones.vn/reviews/rev-001-2.jpg"
      ],
      "tags": ["camera-tot", "pin-trau", "dep"],
      "isVerifiedPurchase": true,
      "status": "VISIBLE",
      "helpfulCount": 24,
      "sellerReply": "Cảm ơn bạn đã tin tưởng và mua hàng tại CellPhones! Chúc bạn trải nghiệm vui vẻ.",
      "sellerReplyAt": "2024-05-20T09:00:00Z",
      "createdAt": "2024-05-18T14:30:00Z",
      "updatedAt": "2024-05-20T09:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 10,
    "total": 256,
    "totalPages": 26,
    "hasNext": true,
    "hasPrev": false
  }
}
```

**Mã lỗi:**

| HTTP Status | Error Code | Mô tả |
|------------|-----------|-------|
| 404 | PRODUCT_NOT_FOUND | Không tìm thấy sản phẩm |

---

### GET /products/:productId/reviews/stats
**Mô tả:** Lấy thống kê đánh giá tổng hợp cho sản phẩm.

**Xác thực:** Không yêu cầu (Public).

**Response 200 OK:**
```json
{
  "average": 4.5,
  "total": 128,
  "distribution": [
    { "star": 5, "count": 80 },
    { "star": 4, "count": 30 },
    { "star": 3, "count": 10 },
    { "star": 2, "count": 5 },
    { "star": 1, "count": 3 }
  ]
}
```

**Mã lỗi:**

| HTTP Status | Error Code | Mô tả |
|------------|-----------|-------|
| 404 | PRODUCT_NOT_FOUND | Không tìm thấy sản phẩm |

---

### POST /products/:productId/reviews
**Mô tả:** Gửi đánh giá cho sản phẩm.

**Xác thực:** Bắt buộc — Role: CUSTOMER (Bearer token)

**Request Body:**
```json
{
  "rating": 5,
  "comment": "Máy đẹp, camera chụp cực kỳ rõ nét, pin trâu hơn mong đợi!",
  "title": "Sản phẩm hoàn hảo cho nhiếp ảnh",
  "images": [
    "https://cdn.cellphones.vn/reviews/upload-temp-1.jpg",
    "https://cdn.cellphones.vn/reviews/upload-temp-2.jpg"
  ],
  "tags": ["camera-tot", "pin-trau"],
  "orderId": "ord-001"
}
```

**Quy tắc nghiệp vụ:**
- Nếu `orderId` được cung cấp: phải thuộc user hiện tại VÀ `order.status = DELIVERED` VÀ sản phẩm có trong `order.items` — khi đó `isVerifiedPurchase = true`
- Nếu `orderId` không hợp lệ hoặc không cung cấp: `isVerifiedPurchase = false`
- Review mới luôn bắt đầu với `status = PENDING` (chờ admin duyệt)
- Mỗi user chỉ được đánh giá một sản phẩm một lần

**Response 201 Created:**
```json
{
  "id": "rev-002",
  "productId": "p0001-0001-0001-0001-000000000001",
  "userId": "usr-002",
  "user": {
    "id": "usr-002",
    "fullName": "Trần Thị Bình",
    "avatarUrl": null
  },
  "orderId": "ord-001",
  "rating": 5,
  "title": "Sản phẩm hoàn hảo cho nhiếp ảnh",
  "comment": "Máy đẹp, camera chụp cực kỳ rõ nét, pin trâu hơn mong đợi!",
  "images": [
    "https://cdn.cellphones.vn/reviews/upload-temp-1.jpg",
    "https://cdn.cellphones.vn/reviews/upload-temp-2.jpg"
  ],
  "tags": ["camera-tot", "pin-trau"],
  "isVerifiedPurchase": true,
  "status": "PENDING",
  "helpfulCount": 0,
  "sellerReply": null,
  "sellerReplyAt": null,
  "createdAt": "2024-06-15T10:00:00Z",
  "updatedAt": "2024-06-15T10:00:00Z"
}
```

**Mã lỗi:**

| HTTP Status | Error Code | Mô tả |
|------------|-----------|-------|
| 400 | VALIDATION_ERROR | Dữ liệu không hợp lệ (rating phải từ 1-5, comment bắt buộc) |
| 401 | UNAUTHORIZED | Chưa đăng nhập |
| 404 | PRODUCT_NOT_FOUND | Không tìm thấy sản phẩm |
| 409 | REVIEW_ALREADY_EXISTS | User đã đánh giá sản phẩm này rồi |

---

### PATCH /reviews/:id/helpful
**Mô tả:** Đánh dấu review là hữu ích, tăng `helpfulCount` thêm 1.

**Xác thực:** Bắt buộc — Bất kỳ user đã đăng nhập (Bearer token)

**Response 200 OK:**
```json
{
  "helpfulCount": 25
}
```

**Mã lỗi:**

| HTTP Status | Error Code | Mô tả |
|------------|-----------|-------|
| 401 | UNAUTHORIZED | Chưa đăng nhập |
| 404 | REVIEW_NOT_FOUND | Không tìm thấy review |

---

### GET /users/me/reviews
**Mô tả:** Lấy danh sách tất cả review của user hiện tại.

**Xác thực:** Bắt buộc — Role: CUSTOMER (Bearer token)

**Query Parameters:**

| Tên | Kiểu | Mặc định | Mô tả |
|-----|------|----------|-------|
| page | number | 1 | Số trang |
| pageSize | number | 10 | Số review mỗi trang |

**Response 200 OK:**
```json
{
  "data": [
    {
      "id": "rev-001",
      "productId": "p0001-0001-0001-0001-000000000001",
      "product": {
        "id": "p0001-0001-0001-0001-000000000001",
        "name": "iPhone 15 Pro Max 256GB",
        "slug": "iphone-15-pro-max-256gb",
        "images": [{ "url": "https://cdn.cellphones.vn/products/iphone15promax-1.jpg", "isPrimary": true }]
      },
      "rating": 5,
      "title": "Điện thoại tuyệt vời",
      "comment": "Máy đẹp, camera chụp cực kỳ rõ nét...",
      "status": "VISIBLE",
      "helpfulCount": 24,
      "createdAt": "2024-05-18T14:30:00Z",
      "updatedAt": "2024-05-18T14:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 10,
    "total": 5,
    "totalPages": 1,
    "hasNext": false,
    "hasPrev": false
  }
}
```

**Mã lỗi:**

| HTTP Status | Error Code | Mô tả |
|------------|-----------|-------|
| 401 | UNAUTHORIZED | Chưa đăng nhập |

---

### GET /admin/reviews
**Mô tả:** Lấy tất cả review trong hệ thống (bao gồm cả PENDING) cho admin quản lý.

**Xác thực:** Bắt buộc — Role: ADMIN

**Query Parameters:**

| Tên | Kiểu | Mô tả |
|-----|------|-------|
| page | number | Số trang |
| pageSize | number | Số review mỗi trang |
| status | string | Lọc theo: `PENDING`, `VISIBLE`, `HIDDEN` |
| productId | UUID | Lọc theo sản phẩm |
| rating | number | Lọc theo số sao (1-5) |
| search | string | Tìm kiếm theo tên user hoặc nội dung comment |

**Response 200 OK:** PaginatedResponse<Review> (đầy đủ thông tin)

**Mã lỗi:**

| HTTP Status | Error Code | Mô tả |
|------------|-----------|-------|
| 401 | UNAUTHORIZED | Chưa đăng nhập |
| 403 | FORBIDDEN | Không có quyền ADMIN |

---

### PATCH /admin/reviews/:id/status
**Mô tả:** Thay đổi trạng thái review (duyệt/ẩn).

**Xác thực:** Bắt buộc — Role: ADMIN

**Request Body:**
```json
{
  "status": "VISIBLE"
}
```

**Giá trị hợp lệ:** `VISIBLE`, `HIDDEN`, `PENDING`

**Side effect quan trọng:** Sau khi thay đổi status, hệ thống tự động tính lại `product.rating` và `product.reviewCount` dựa trên tất cả review có `status = VISIBLE`.

**Response 200 OK:** Review object đã cập nhật

**Mã lỗi:**

| HTTP Status | Error Code | Mô tả |
|------------|-----------|-------|
| 400 | INVALID_STATUS | Giá trị status không hợp lệ |
| 401 | UNAUTHORIZED | Chưa đăng nhập |
| 403 | FORBIDDEN | Không có quyền ADMIN |
| 404 | REVIEW_NOT_FOUND | Không tìm thấy review |

---

### DELETE /admin/reviews/:id
**Mô tả:** Xóa vĩnh viễn review.

**Xác thực:** Bắt buộc — Role: ADMIN

**Side effect:** Tự động tính lại `product.rating` và `product.reviewCount`.

**Response 204 No Content**

**Mã lỗi:**

| HTTP Status | Error Code | Mô tả |
|------------|-----------|-------|
| 401 | UNAUTHORIZED | Chưa đăng nhập |
| 403 | FORBIDDEN | Không có quyền ADMIN |
| 404 | REVIEW_NOT_FOUND | Không tìm thấy review |

---

### POST /admin/reviews/:id/reply
**Mô tả:** Admin phản hồi lại đánh giá của khách hàng.

**Xác thực:** Bắt buộc — Role: ADMIN

**Request Body:**
```json
{
  "reply": "Cảm ơn bạn đã tin tưởng CellPhones! Chúng tôi rất vui khi bạn hài lòng với sản phẩm. Nếu cần hỗ trợ thêm, vui lòng liên hệ hotline 1800.2097."
}
```

**Validation:** `reply` bắt buộc, tối thiểu 10 ký tự

**Side effect:** Cập nhật `sellerReply` và `sellerReplyAt = now()`.

**Response 200 OK:**
```json
{
  "id": "rev-001",
  "sellerReply": "Cảm ơn bạn đã tin tưởng CellPhones!...",
  "sellerReplyAt": "2024-06-15T11:00:00Z",
  "updatedAt": "2024-06-15T11:00:00Z"
}
```

**Mã lỗi:**

| HTTP Status | Error Code | Mô tả |
|------------|-----------|-------|
| 400 | VALIDATION_ERROR | reply bắt buộc |
| 401 | UNAUTHORIZED | Chưa đăng nhập |
| 403 | FORBIDDEN | Không có quyền ADMIN |
| 404 | REVIEW_NOT_FOUND | Không tìm thấy review |

---

## 6. Wishlist

### Mô hình dữ liệu: WishlistItem

```json
{
  "id": "uuid",
  "userId": "uuid",
  "productId": "uuid",
  "product": {
    "id": "uuid",
    "name": "string",
    "slug": "string",
    "brand": "string",
    "price": "number",
    "originalPrice": "number | null",
    "discountPercent": "number",
    "stock": "number",
    "status": "string",
    "images": [{ "url": "string", "isPrimary": true }]
  },
  "addedPrice": "number (giá tại thời điểm thêm vào wishlist)",
  "priceAlert": "number | null (ngưỡng giá muốn nhận thông báo, VND)",
  "createdAt": "ISO8601 datetime",
  "updatedAt": "ISO8601 datetime"
}
```

---

### GET /users/me/wishlist
**Mô tả:** Lấy danh sách sản phẩm yêu thích của user hiện tại.

**Xác thực:** Bắt buộc — Role: CUSTOMER (Bearer token)

**Response 200 OK:**
```json
[
  {
    "id": "wl-001",
    "userId": "usr-001",
    "productId": "p0001-0001-0001-0001-000000000001",
    "product": {
      "id": "p0001-0001-0001-0001-000000000001",
      "name": "iPhone 15 Pro Max 256GB",
      "slug": "iphone-15-pro-max-256gb",
      "brand": "Apple",
      "price": 33990000,
      "originalPrice": 37990000,
      "discountPercent": 11,
      "stock": 45,
      "status": "ACTIVE",
      "images": [
        {
          "url": "https://cdn.cellphones.vn/products/iphone15promax-1.jpg",
          "isPrimary": true
        }
      ]
    },
    "addedPrice": 35990000,
    "priceAlert": 30000000,
    "createdAt": "2024-05-01T00:00:00Z",
    "updatedAt": "2024-06-01T00:00:00Z"
  }
]
```

**Mã lỗi:**

| HTTP Status | Error Code | Mô tả |
|------------|-----------|-------|
| 401 | UNAUTHORIZED | Chưa đăng nhập |

---

### POST /users/me/wishlist
**Mô tả:** Thêm sản phẩm vào danh sách yêu thích. Idempotent: nếu sản phẩm đã có trong wishlist, trả về 200 thay vì tạo mới.

**Xác thực:** Bắt buộc — Role: CUSTOMER (Bearer token)

**Request Body:**
```json
{
  "productId": "p0001-0001-0001-0001-000000000001",
  "priceAlert": 30000000
}
```

**Quy tắc nghiệp vụ:**
- Tự động sao chép `price`, `name`, `image`, `stock` từ sản phẩm vào `addedPrice` tại thời điểm thêm
- Nếu sản phẩm đã có trong wishlist: trả về 200 (không tạo bản ghi mới)

**Response 201 Created** (hoặc 200 nếu đã tồn tại):
```json
{
  "id": "wl-002",
  "userId": "usr-001",
  "productId": "p0001-0001-0001-0001-000000000002",
  "product": {
    "id": "p0001-0001-0001-0001-000000000002",
    "name": "iPhone 15 Pro 128GB",
    "slug": "iphone-15-pro-128gb",
    "brand": "Apple",
    "price": 27990000,
    "originalPrice": 30990000,
    "discountPercent": 10,
    "stock": 30,
    "status": "ACTIVE",
    "images": [{ "url": "https://cdn.cellphones.vn/products/iphone15pro-1.jpg", "isPrimary": true }]
  },
  "addedPrice": 27990000,
  "priceAlert": 25000000,
  "createdAt": "2024-06-15T12:00:00Z",
  "updatedAt": "2024-06-15T12:00:00Z"
}
```

**Mã lỗi:**

| HTTP Status | Error Code | Mô tả |
|------------|-----------|-------|
| 400 | VALIDATION_ERROR | productId bắt buộc |
| 401 | UNAUTHORIZED | Chưa đăng nhập |
| 404 | PRODUCT_NOT_FOUND | Không tìm thấy sản phẩm |

---

### DELETE /users/me/wishlist/:productId
**Mô tả:** Xóa một sản phẩm khỏi danh sách yêu thích.

**Xác thực:** Bắt buộc — Role: CUSTOMER (Bearer token)

**Path Parameters:**

| Tên | Kiểu | Mô tả |
|-----|------|-------|
| productId | UUID | ID sản phẩm cần xóa khỏi wishlist |

**Response 204 No Content**

**Mã lỗi:**

| HTTP Status | Error Code | Mô tả |
|------------|-----------|-------|
| 401 | UNAUTHORIZED | Chưa đăng nhập |
| 404 | WISHLIST_ITEM_NOT_FOUND | Sản phẩm không có trong wishlist |

---

### DELETE /users/me/wishlist
**Mô tả:** Xóa toàn bộ wishlist của user hiện tại.

**Xác thực:** Bắt buộc — Role: CUSTOMER (Bearer token)

**Response 204 No Content**

**Mã lỗi:**

| HTTP Status | Error Code | Mô tả |
|------------|-----------|-------|
| 401 | UNAUTHORIZED | Chưa đăng nhập |

---

### PATCH /users/me/wishlist/:productId/price-alert
**Mô tả:** Cập nhật ngưỡng giá muốn nhận thông báo cho sản phẩm trong wishlist.

**Xác thực:** Bắt buộc — Role: CUSTOMER (Bearer token)

**Request Body:**
```json
{
  "priceAlert": 28000000
}
```

**Validation:** `priceAlert` bắt buộc, phải là số dương (VND)

**Response 200 OK:**
```json
{
  "id": "wl-001",
  "productId": "p0001-0001-0001-0001-000000000001",
  "priceAlert": 28000000,
  "updatedAt": "2024-06-15T13:00:00Z"
}
```

**Mã lỗi:**

| HTTP Status | Error Code | Mô tả |
|------------|-----------|-------|
| 400 | VALIDATION_ERROR | priceAlert bắt buộc và phải > 0 |
| 401 | UNAUTHORIZED | Chưa đăng nhập |
| 404 | WISHLIST_ITEM_NOT_FOUND | Sản phẩm không có trong wishlist |

---

## 7. Combos

### Mô hình dữ liệu: ProductCombo

```json
{
  "id": "uuid",
  "name": "string",
  "description": "string",
  "comboPrice": "number (VND - tổng giá combo)",
  "totalOriginalPrice": "number (tổng giá gốc của từng sản phẩm)",
  "savings": "number (tiết kiệm = totalOriginalPrice - comboPrice)",
  "savingsPercent": "number (% tiết kiệm)",
  "isActive": "boolean",
  "startDate": "ISO8601 datetime | null",
  "endDate": "ISO8601 datetime | null",
  "products": [
    {
      "productId": "uuid",
      "product": { "id": "uuid", "name": "string", "slug": "string", "price": "number", "images": [] },
      "comboPrice": "number (giá của sản phẩm này trong combo)",
      "quantity": "number"
    }
  ],
  "createdAt": "ISO8601 datetime",
  "updatedAt": "ISO8601 datetime"
}
```

---

### GET /combos
**Mô tả:** Lấy danh sách combo đang active và trong thời gian hiệu lực.

**Xác thực:** Không yêu cầu (Public).

**Điều kiện lọc tự động:** `isActive = true` VÀ (`startDate IS NULL` HOẶC `startDate <= now()`) VÀ (`endDate IS NULL` HOẶC `endDate >= now()`)

**Response 200 OK:**
```json
[
  {
    "id": "combo-001",
    "name": "Combo iPhone 15 Pro Max + AirPods Pro 2",
    "description": "Bộ đôi hoàn hảo cho trải nghiệm âm nhạc đỉnh cao",
    "comboPrice": 42990000,
    "totalOriginalPrice": 49980000,
    "savings": 6990000,
    "savingsPercent": 14,
    "isActive": true,
    "startDate": "2024-06-01T00:00:00Z",
    "endDate": "2024-07-31T23:59:59Z",
    "products": [
      {
        "productId": "p0001-0001-0001-0001-000000000001",
        "product": {
          "id": "p0001-0001-0001-0001-000000000001",
          "name": "iPhone 15 Pro Max 256GB",
          "slug": "iphone-15-pro-max-256gb",
          "price": 33990000,
          "images": [{ "url": "https://cdn.cellphones.vn/products/iphone15promax-1.jpg", "isPrimary": true }]
        },
        "comboPrice": 33990000,
        "quantity": 1
      },
      {
        "productId": "p0001-0001-0001-0001-000000000010",
        "product": {
          "id": "p0001-0001-0001-0001-000000000010",
          "name": "AirPods Pro 2nd Generation",
          "slug": "airpods-pro-2nd-generation",
          "price": 6990000,
          "images": [{ "url": "https://cdn.cellphones.vn/products/airpods-pro-2.jpg", "isPrimary": true }]
        },
        "comboPrice": 9000000,
        "quantity": 1
      }
    ],
    "createdAt": "2024-05-28T00:00:00Z",
    "updatedAt": "2024-05-28T00:00:00Z"
  }
]
```

---

### GET /combos/:id
**Mô tả:** Lấy chi tiết một combo kèm thông tin đầy đủ về các sản phẩm trong combo.

**Xác thực:** Không yêu cầu (Public).

**Response 200 OK:** ProductCombo object đầy đủ (giống phần tử trong GET /combos)

**Mã lỗi:**

| HTTP Status | Error Code | Mô tả |
|------------|-----------|-------|
| 404 | COMBO_NOT_FOUND | Không tìm thấy combo |

---

### GET /products/:productId/combos
**Mô tả:** Lấy danh sách combo có chứa sản phẩm này. Chỉ trả về combo đang active và trong thời hạn.

**Xác thực:** Không yêu cầu (Public).

**Response 200 OK:** ProductCombo[]

**Mã lỗi:**

| HTTP Status | Error Code | Mô tả |
|------------|-----------|-------|
| 404 | PRODUCT_NOT_FOUND | Không tìm thấy sản phẩm |

---

### POST /admin/combos
**Mô tả:** Tạo combo sản phẩm mới.

**Xác thực:** Bắt buộc — Role: ADMIN

**Request Body:**
```json
{
  "name": "Combo Samsung S24 Ultra + Galaxy Buds2 Pro",
  "description": "Combo Samsung flagship cho dân công sở",
  "comboPrice": 35990000,
  "products": [
    {
      "productId": "p0001-0001-0001-0001-000000000003",
      "comboPrice": 31990000,
      "quantity": 1
    },
    {
      "productId": "p0001-0001-0001-0001-000000000011",
      "comboPrice": 4000000,
      "quantity": 1
    }
  ],
  "isActive": true,
  "startDate": "2024-07-01T00:00:00Z",
  "endDate": "2024-08-31T23:59:59Z"
}
```

**Quy tắc tự động:**
- `totalOriginalPrice` = tổng `product.price * quantity` của từng sản phẩm trong combo
- `savings` = `totalOriginalPrice - comboPrice`
- `savingsPercent` = `round(savings / totalOriginalPrice * 100)`

**Validation:**
- `name`, `comboPrice`, `products` bắt buộc
- `products` phải có ít nhất 2 sản phẩm
- Tất cả `productId` trong `products` phải tồn tại và ACTIVE
- `comboPrice` > 0

**Response 201 Created:** ProductCombo object đầy đủ

**Mã lỗi:**

| HTTP Status | Error Code | Mô tả |
|------------|-----------|-------|
| 400 | VALIDATION_ERROR | Dữ liệu không hợp lệ |
| 400 | COMBO_NEEDS_TWO_PRODUCTS | Combo phải có ít nhất 2 sản phẩm |
| 401 | UNAUTHORIZED | Chưa đăng nhập |
| 403 | FORBIDDEN | Không có quyền ADMIN |
| 404 | PRODUCT_NOT_FOUND | Một trong các sản phẩm không tồn tại |

---

### PATCH /admin/combos/:id
**Mô tả:** Cập nhật thông tin combo. Khi cập nhật danh sách `products`, hệ thống tính lại `totalOriginalPrice`, `savings`, `savingsPercent`.

**Xác thực:** Bắt buộc — Role: ADMIN

**Response 200 OK:** ProductCombo object đã cập nhật

**Mã lỗi:**

| HTTP Status | Error Code | Mô tả |
|------------|-----------|-------|
| 400 | VALIDATION_ERROR | Dữ liệu không hợp lệ |
| 401 | UNAUTHORIZED | Chưa đăng nhập |
| 403 | FORBIDDEN | Không có quyền ADMIN |
| 404 | COMBO_NOT_FOUND | Không tìm thấy combo |

---

### DELETE /admin/combos/:id
**Mô tả:** Xóa vĩnh viễn combo.

**Xác thực:** Bắt buộc — Role: ADMIN

**Response 204 No Content**

**Mã lỗi:**

| HTTP Status | Error Code | Mô tả |
|------------|-----------|-------|
| 401 | UNAUTHORIZED | Chưa đăng nhập |
| 403 | FORBIDDEN | Không có quyền ADMIN |
| 404 | COMBO_NOT_FOUND | Không tìm thấy combo |

---

## 8. Blog

### Mô hình dữ liệu: BlogPost

```json
{
  "id": "uuid",
  "title": "string",
  "slug": "string",
  "content": "string (HTML)",
  "excerpt": "string (tóm tắt ngắn)",
  "coverImage": "string (URL)",
  "category": "string",
  "tags": "string[]",
  "authorId": "uuid",
  "author": {
    "id": "uuid",
    "fullName": "string",
    "avatarUrl": "string | null"
  },
  "isPublished": "boolean",
  "viewCount": "number",
  "publishedAt": "ISO8601 datetime | null",
  "metaTitle": "string | null",
  "metaDescription": "string | null",
  "createdAt": "ISO8601 datetime",
  "updatedAt": "ISO8601 datetime"
}
```

---

### GET /blog
**Mô tả:** Lấy danh sách bài viết đã xuất bản (`isPublished = true`), phân trang.

**Xác thực:** Không yêu cầu (Public).

**Query Parameters:**

| Tên | Kiểu | Mô tả |
|-----|------|-------|
| page | number | Số trang (mặc định 1) |
| pageSize | number | Số bài mỗi trang (mặc định 10) |
| category | string | Lọc theo category |
| search | string | Tìm kiếm theo tiêu đề |
| tag | string | Lọc theo tag |

**Response 200 OK:**
```json
{
  "data": [
    {
      "id": "blog-001",
      "title": "Top 5 điện thoại tốt nhất 2024",
      "slug": "top-5-dien-thoai-tot-nhat-2024",
      "excerpt": "Khám phá 5 chiếc điện thoại được đánh giá cao nhất năm 2024 với những tính năng vượt trội...",
      "coverImage": "https://cdn.cellphones.vn/blog/top5-2024.jpg",
      "category": "Tư vấn",
      "tags": ["iphone", "samsung", "flagship", "2024"],
      "author": {
        "id": "usr-admin-001",
        "fullName": "Admin CellPhones",
        "avatarUrl": null
      },
      "isPublished": true,
      "viewCount": 12500,
      "publishedAt": "2024-01-10T09:00:00Z",
      "createdAt": "2024-01-09T15:00:00Z",
      "updatedAt": "2024-01-10T09:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 10,
    "total": 45,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  }
}
```

---

### GET /blog/:slug
**Mô tả:** Lấy chi tiết bài viết theo slug. Tự động tăng `viewCount` mỗi lần đọc.

**Xác thực:** Không yêu cầu (Public).

**Response 200 OK:**
```json
{
  "id": "blog-001",
  "title": "Top 5 điện thoại tốt nhất 2024",
  "slug": "top-5-dien-thoai-tot-nhat-2024",
  "content": "<h1>Top 5 điện thoại...</h1><p>Trong năm 2024...</p>",
  "excerpt": "Khám phá 5 chiếc điện thoại được đánh giá cao nhất năm 2024...",
  "coverImage": "https://cdn.cellphones.vn/blog/top5-2024.jpg",
  "category": "Tư vấn",
  "tags": ["iphone", "samsung", "flagship", "2024"],
  "author": {
    "id": "usr-admin-001",
    "fullName": "Admin CellPhones",
    "avatarUrl": null
  },
  "isPublished": true,
  "viewCount": 12501,
  "publishedAt": "2024-01-10T09:00:00Z",
  "metaTitle": "Top 5 điện thoại tốt nhất 2024 | CellPhones",
  "metaDescription": "Khám phá top 5 điện thoại flagship năm 2024 được đánh giá cao nhất",
  "createdAt": "2024-01-09T15:00:00Z",
  "updatedAt": "2024-01-10T09:00:00Z"
}
```

**Mã lỗi:**

| HTTP Status | Error Code | Mô tả |
|------------|-----------|-------|
| 404 | BLOG_POST_NOT_FOUND | Không tìm thấy bài viết với slug này |

---

### GET /blog/categories
**Mô tả:** Lấy danh sách tất cả category blog đang có bài viết đã xuất bản.

**Xác thực:** Không yêu cầu (Public).

**Response 200 OK:**
```json
["Đánh giá", "Tin tức", "Tư vấn", "Hướng dẫn", "So sánh"]
```

---

### POST /admin/blog
**Mô tả:** Tạo bài viết blog mới.

**Xác thực:** Bắt buộc — Role: ADMIN

**Request Body:**
```json
{
  "title": "iPhone 16 vs Samsung Galaxy S25: Cuộc chiến flagship cuối năm",
  "slug": "iphone-16-vs-samsung-galaxy-s25",
  "content": "<h1>iPhone 16 vs Samsung Galaxy S25</h1><p>Đây là so sánh chi tiết giữa hai flagship...</p>",
  "excerpt": "So sánh toàn diện iPhone 16 và Samsung Galaxy S25 - ai là kẻ chiến thắng?",
  "coverImage": "https://cdn.cellphones.vn/blog/iphone16-vs-s25.jpg",
  "category": "So sánh",
  "tags": ["iphone", "samsung", "flagship", "so-sanh"],
  "isPublished": false
}
```

**Validation:** `title`, `slug`, `content`, `excerpt`, `coverImage`, `category` bắt buộc

**Quy tắc nghiệp vụ:**
- Nếu `isPublished = true`: tự động gán `publishedAt = now()`
- `slug` phải unique toàn hệ thống

**Response 201 Created:** BlogPost object đầy đủ

**Mã lỗi:**

| HTTP Status | Error Code | Mô tả |
|------------|-----------|-------|
| 400 | VALIDATION_ERROR | Dữ liệu không hợp lệ |
| 401 | UNAUTHORIZED | Chưa đăng nhập |
| 403 | FORBIDDEN | Không có quyền ADMIN |
| 409 | BLOG_SLUG_EXISTED | Slug bài viết đã tồn tại |

---

### PATCH /admin/blog/:id
**Mô tả:** Cập nhật bài viết. Nếu thay đổi `isPublished` từ false sang true, tự động gán `publishedAt = now()`.

**Xác thực:** Bắt buộc — Role: ADMIN

**Response 200 OK:** BlogPost object đã cập nhật

**Mã lỗi:**

| HTTP Status | Error Code | Mô tả |
|------------|-----------|-------|
| 400 | VALIDATION_ERROR | Dữ liệu không hợp lệ |
| 401 | UNAUTHORIZED | Chưa đăng nhập |
| 403 | FORBIDDEN | Không có quyền ADMIN |
| 404 | BLOG_POST_NOT_FOUND | Không tìm thấy bài viết |
| 409 | BLOG_SLUG_EXISTED | Slug mới đã tồn tại |

---

### DELETE /admin/blog/:id
**Mô tả:** Xóa vĩnh viễn bài viết blog.

**Xác thực:** Bắt buộc — Role: ADMIN

**Response 204 No Content**

**Mã lỗi:**

| HTTP Status | Error Code | Mô tả |
|------------|-----------|-------|
| 401 | UNAUTHORIZED | Chưa đăng nhập |
| 403 | FORBIDDEN | Không có quyền ADMIN |
| 404 | BLOG_POST_NOT_FOUND | Không tìm thấy bài viết |

---

## 9. Store Locator

### Mô hình dữ liệu: Branch

```json
{
  "id": "uuid",
  "name": "string",
  "address": "string (địa chỉ đầy đủ)",
  "city": "string",
  "district": "string",
  "ward": "string | null",
  "phone": "string",
  "email": "string | null",
  "latitude": "number",
  "longitude": "number",
  "openingHours": "string (e.g. '8:00 - 21:30 hằng ngày')",
  "isActive": "boolean",
  "imageUrl": "string | null",
  "createdAt": "ISO8601 datetime",
  "updatedAt": "ISO8601 datetime"
}
```

---

### GET /stores
**Mô tả:** Lấy danh sách tất cả cửa hàng đang hoạt động (`isActive = true`). Có thể lọc theo thành phố.

**Xác thực:** Không yêu cầu (Public).

**Query Parameters:**

| Tên | Kiểu | Mô tả |
|-----|------|-------|
| city | string | Lọc theo tên thành phố (e.g. `Hà Nội`, `TP. Hồ Chí Minh`) |

**Response 200 OK:**
```json
[
  {
    "id": "store-001",
    "name": "CellPhones Nguyễn Đình Chiểu",
    "address": "200 Nguyễn Đình Chiểu, Phường 6, Quận 3",
    "city": "TP. Hồ Chí Minh",
    "district": "Quận 3",
    "ward": "Phường 6",
    "phone": "028.3930.9999",
    "email": "q3-ndc@cellphones.vn",
    "latitude": 10.7830,
    "longitude": 106.6855,
    "openingHours": "8:00 - 21:30 hằng ngày",
    "isActive": true,
    "imageUrl": "https://cdn.cellphones.vn/stores/store-q3-ndc.jpg",
    "createdAt": "2020-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  },
  {
    "id": "store-002",
    "name": "CellPhones Cộng Hòa",
    "address": "282 Cộng Hòa, Phường 13, Quận Tân Bình",
    "city": "TP. Hồ Chí Minh",
    "district": "Quận Tân Bình",
    "ward": "Phường 13",
    "phone": "028.3845.1234",
    "email": "tb-ch@cellphones.vn",
    "latitude": 10.8013,
    "longitude": 106.6553,
    "openingHours": "8:00 - 21:30 hằng ngày",
    "isActive": true,
    "imageUrl": "https://cdn.cellphones.vn/stores/store-tb-ch.jpg",
    "createdAt": "2021-03-15T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
]
```

---

### GET /stores/:id
**Mô tả:** Lấy thông tin chi tiết một cửa hàng.

**Xác thực:** Không yêu cầu (Public).

**Response 200 OK:** Branch object đầy đủ

**Mã lỗi:**

| HTTP Status | Error Code | Mô tả |
|------------|-----------|-------|
| 404 | STORE_NOT_FOUND | Không tìm thấy cửa hàng |

---

### GET /stores/:id/availability
**Mô tả:** Kiểm tra tồn kho của một sản phẩm tại một cửa hàng cụ thể.

**Xác thực:** Không yêu cầu (Public).

**Query Parameters:**

| Tên | Kiểu | Bắt buộc | Mô tả |
|-----|------|----------|-------|
| productId | UUID | Có | ID sản phẩm cần kiểm tra |

**Response 200 OK:**
```json
{
  "storeId": "store-001",
  "productId": "p0001-0001-0001-0001-000000000001",
  "stock": 3
}
```

> `stock = 0` nghĩa là hết hàng tại cửa hàng này nhưng endpoint vẫn trả về 200.

**Mã lỗi:**

| HTTP Status | Error Code | Mô tả |
|------------|-----------|-------|
| 400 | MISSING_PRODUCT_ID | Query param `productId` bắt buộc |
| 404 | STORE_NOT_FOUND | Không tìm thấy cửa hàng |
| 404 | PRODUCT_NOT_FOUND | Không tìm thấy sản phẩm |

---

## Phụ lục: Tổng hợp Error Codes

| HTTP Status | Error Code | Mô tả |
|------------|-----------|-------|
| 400 | VALIDATION_ERROR | Dữ liệu đầu vào không hợp lệ (field bắt buộc thiếu, sai định dạng) |
| 400 | INVALID_QUERY_PARAM | Tham số query không hợp lệ |
| 400 | INVALID_FILE_TYPE | Loại file không được hỗ trợ |
| 400 | FILE_TOO_LARGE | File vượt giới hạn dung lượng |
| 400 | MISSING_PRODUCT_ID | Thiếu tham số productId bắt buộc |
| 400 | INVALID_IMAGE_IDS | ID ảnh không hợp lệ hoặc không thuộc sản phẩm |
| 400 | INVALID_STATUS | Giá trị status không hợp lệ |
| 400 | COMBO_NEEDS_TWO_PRODUCTS | Combo cần ít nhất 2 sản phẩm |
| 401 | UNAUTHORIZED | Chưa đăng nhập hoặc token không hợp lệ/hết hạn |
| 403 | FORBIDDEN | Đã đăng nhập nhưng không đủ quyền |
| 404 | CATEGORY_NOT_FOUND | Không tìm thấy danh mục |
| 404 | PARENT_CATEGORY_NOT_FOUND | Danh mục cha không tồn tại |
| 404 | PRODUCT_NOT_FOUND | Không tìm thấy sản phẩm |
| 404 | VARIANT_NOT_FOUND | Không tìm thấy biến thể |
| 404 | IMAGE_NOT_FOUND | Không tìm thấy ảnh |
| 404 | REVIEW_NOT_FOUND | Không tìm thấy đánh giá |
| 404 | WISHLIST_ITEM_NOT_FOUND | Sản phẩm không có trong wishlist |
| 404 | COMBO_NOT_FOUND | Không tìm thấy combo |
| 404 | BLOG_POST_NOT_FOUND | Không tìm thấy bài viết |
| 404 | STORE_NOT_FOUND | Không tìm thấy cửa hàng |
| 409 | CATEGORY_SLUG_EXISTED | Slug danh mục đã tồn tại |
| 409 | CATEGORY_HAS_PRODUCTS | Danh mục còn sản phẩm, không thể xóa |
| 409 | CATEGORY_HAS_CHILDREN | Danh mục còn danh mục con, không thể xóa |
| 409 | PRODUCT_SLUG_EXISTED | Slug sản phẩm đã tồn tại |
| 409 | VARIANT_SKU_EXISTED | SKU biến thể đã tồn tại |
| 409 | VARIANT_IN_ACTIVE_ORDER | Biến thể đang trong đơn hàng chưa hoàn thành |
| 409 | REVIEW_ALREADY_EXISTS | User đã đánh giá sản phẩm này |
| 409 | BLOG_SLUG_EXISTED | Slug bài viết đã tồn tại |

---

## Phụ lục: Cấu trúc Response lỗi chuẩn

Mọi response lỗi đều có cấu trúc thống nhất:

```json
{
  "success": false,
  "error": {
    "code": "PRODUCT_NOT_FOUND",
    "message": "Không tìm thấy sản phẩm với ID đã cung cấp",
    "details": null
  },
  "timestamp": "2024-06-15T10:00:00Z",
  "path": "/api/v1/products/invalid-id"
}
```

Khi có lỗi validation (HTTP 400), field `details` chứa danh sách lỗi chi tiết:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Dữ liệu đầu vào không hợp lệ",
    "details": [
      { "field": "name", "message": "Tên sản phẩm là bắt buộc" },
      { "field": "price", "message": "Giá phải là số dương" }
    ]
  },
  "timestamp": "2024-06-15T10:00:00Z",
  "path": "/api/v1/admin/products"
}
```

---

## Phụ lục: Cấu trúc Response thành công chuẩn

```json
{
  "success": true,
  "data": { ... },
  "timestamp": "2024-06-15T10:00:00Z"
}
```

> **Lưu ý cho developer:** Trong tài liệu này, phần `Response` chỉ mô tả phần `data`. Frontend cần unwrap từ wrapper `{ success, data, timestamp }` trước khi sử dụng.

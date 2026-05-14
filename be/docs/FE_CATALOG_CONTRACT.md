# FE Catalog Contract

Base URL local: `http://localhost:8080/api/v1`

Module status: implemented for core B2C catalog flow.

Security: tam thoi chua bat auth/RBAC, nen `/admin/*` hien dang open trong local dev. Khi security duoc bat, FE can gan token admin/staff cho cac route admin.

## FE Integration Notes

- Dung `data` de lay payload.
- Dung `pagination` cho listing `/products`.
- Khi `success = false`, FE doc `error.code`, `error.message`, `error.details`.
- Boolean fields giu dang camelCase: `isNew`, `isFeatured`, `isHot`, `isActive`, `isPrimary`.
- Product detail tra kem `category`, `variants`, `images`, `phoneSpecs`.
- Product delete la soft delete: status chuyen sang `DISCONTINUED`.
- Category delete la soft delete: `isActive = false`.
- UUID fields la string.
- Money fields tra ve number JSON, FE format VND o client.

## Category APIs

### Get Category Tree

`GET /categories`

Query:

| Param | Type | Default | Note |
| --- | --- | --- | --- |
| `includeInactive` | boolean | `false` | Admin co the set `true` de xem category inactive |

Response:

```json
{
  "data": [
    {
      "id": "0f2a7c8d-1111-4222-8333-111111111111",
      "name": "Dien thoai",
      "slug": "dien-thoai",
      "description": "Dien thoai chinh hang",
      "icon": "smartphone",
      "imageUrl": null,
      "parentId": null,
      "level": 0,
      "path": "dien-thoai",
      "isActive": true,
      "sortOrder": 1,
      "productCount": 2,
      "metaTitle": null,
      "metaDescription": null,
      "children": [],
      "createdAt": "2026-05-14T00:00:00",
      "updatedAt": "2026-05-14T00:00:00"
    }
  ],
  "success": true,
  "message": "Thao tac thanh cong",
  "pagination": null,
  "error": null
}
```

### Get Category By Id

`GET /categories/{id}`

### Get Category By Slug

`GET /categories/{slug}/by-slug`

### Create Category

`POST /admin/categories`

Request:

```json
{
  "name": "Dien thoai",
  "slug": "dien-thoai",
  "parentId": null,
  "description": "Dien thoai chinh hang",
  "icon": "smartphone",
  "imageUrl": null,
  "isActive": true,
  "sortOrder": 1,
  "metaTitle": "Dien thoai",
  "metaDescription": "Mua dien thoai chinh hang"
}
```

### Update Category

`PATCH /admin/categories/{id}`

Same body as create. Partial update is supported by sending only fields that need changing.

### Delete Category

`DELETE /admin/categories/{id}`

Response: `204 No Content`.

## Product APIs

### List Products

`GET /products`

Query:

| Param | Type | Default | Note |
| --- | --- | --- | --- |
| `page` | number | `1` | 1-based |
| `pageSize` | number | `20` | |
| `sortBy` | string | `createdAt` | Supported fields depend on backend entity fields |
| `sortDir` | string | `desc` | `asc` or `desc` |
| `search` | string | | Search name, description, brand |
| `categoryId` | uuid string | | |
| `categorySlug` | string | | |
| `brand` | string | | Exact brand filter |
| `status` | string | `ACTIVE` | `ACTIVE`, `INACTIVE`, `OUT_OF_STOCK`, `DISCONTINUED` |
| `condition` | string | | `NEW`, `LIKE_NEW`, `USED`, `REFURBISHED` |
| `minPrice` | number | | |
| `maxPrice` | number | | |
| `color` | string | | |
| `isFeatured` | boolean | | |
| `isNew` | boolean | | |
| `isHot` | boolean | | |

Example:

`GET /products?page=1&pageSize=12&search=iphone&brand=Apple&minPrice=10000000&maxPrice=40000000`

Response:

```json
{
  "data": [
    {
      "id": "11111111-1111-4111-8111-111111111111",
      "name": "iPhone 15 Pro Max 256GB",
      "slug": "iphone-15-pro-max-256gb",
      "description": "iPhone 15 Pro Max chinh hang VN/A",
      "shortDescription": "Titanium, A17 Pro, camera 48MP",
      "categoryId": "0f2a7c8d-1111-4222-8333-111111111111",
      "category": {
        "id": "0f2a7c8d-1111-4222-8333-111111111111",
        "name": "Dien thoai",
        "slug": "dien-thoai"
      },
      "brand": "Apple",
      "price": 29990000,
      "originalPrice": 34990000,
      "discountPercent": 14,
      "status": "ACTIVE",
      "condition": "NEW",
      "warranty": 12,
      "tags": ["iphone", "apple", "flagship"],
      "specifications": {
        "chip": "A17 Pro",
        "display": "6.7 inch"
      },
      "color": "Titan tu nhien",
      "viewCount": 0,
      "soldCount": 0,
      "rating": 0,
      "reviewCount": 0,
      "isNew": true,
      "isFeatured": true,
      "isHot": true,
      "variants": [],
      "images": [],
      "phoneSpecs": null,
      "createdAt": "2026-05-14T00:00:00",
      "updatedAt": "2026-05-14T00:00:00"
    }
  ],
  "success": true,
  "message": "Thao tac thanh cong",
  "pagination": {
    "page": 1,
    "pageSize": 12,
    "total": 3,
    "totalPages": 1,
    "hasNext": false,
    "hasPrev": false
  },
  "error": null
}
```

### Get Product By Id

`GET /products/{id}`

### Get Product By Slug

`GET /products/{slug}/by-slug`

### Product Groups For Home Page

- `GET /products/featured?limit=8`
- `GET /products/hot?limit=6`
- `GET /products/new?limit=6`
- `GET /products/{id}/similar?limit=8`
- `GET /products/{id}/accessories?limit=8`
- `GET /products/brands`

### Create Product

`POST /admin/products`

Request:

```json
{
  "name": "iPhone 15 Pro Max 256GB",
  "slug": "iphone-15-pro-max-256gb",
  "description": "iPhone 15 Pro Max chinh hang VN/A",
  "shortDescription": "Titanium, A17 Pro, camera 48MP",
  "categoryId": "0f2a7c8d-1111-4222-8333-111111111111",
  "brand": "Apple",
  "price": 29990000,
  "originalPrice": 34990000,
  "status": "ACTIVE",
  "condition": "NEW",
  "warranty": 12,
  "tags": ["iphone", "apple", "flagship"],
  "specifications": {
    "chip": "A17 Pro",
    "display": "6.7 inch"
  },
  "color": "Titan tu nhien",
  "isNew": true,
  "isFeatured": true,
  "isHot": true
}
```

### Update Product

`PATCH /admin/products/{id}`

Same body as create. Partial update is supported by sending only fields that need changing.

### Delete Product

`DELETE /admin/products/{id}`

Response: `204 No Content`.

## Variant APIs

### List Variants

`GET /products/{productId}/variants`

Variant object:

```json
{
  "id": "33333333-3333-4333-8333-333333333333",
  "productId": "11111111-1111-4111-8111-111111111111",
  "name": "256GB Titan tu nhien",
  "sku": "IP15PM-256-TN",
  "price": 29990000,
  "originalPrice": 34990000,
  "stock": 20,
  "color": "Titan tu nhien",
  "storage": "256GB",
  "ram": "8GB",
  "isActive": true,
  "createdAt": "2026-05-14T00:00:00",
  "updatedAt": "2026-05-14T00:00:00"
}
```

### Create Variant

`POST /admin/products/{productId}/variants`

Request:

```json
{
  "name": "256GB Titan tu nhien",
  "sku": "IP15PM-256-TN",
  "price": 29990000,
  "originalPrice": 34990000,
  "stock": 20,
  "color": "Titan tu nhien",
  "storage": "256GB",
  "ram": "8GB",
  "isActive": true
}
```

### Update Variant

`PATCH /admin/products/{productId}/variants/{id}`

### Delete Variant

`DELETE /admin/products/{productId}/variants/{id}`

Response: `204 No Content`.

## Image APIs

### List Images

`GET /products/{productId}/images`

Image object:

```json
{
  "id": "44444444-4444-4444-8444-444444444444",
  "productId": "11111111-1111-4111-8111-111111111111",
  "url": "https://example.com/iphone-15-pro-max.jpg",
  "altText": "iPhone 15 Pro Max",
  "sortOrder": 1,
  "isPrimary": true,
  "createdAt": "2026-05-14T00:00:00"
}
```

### Create Image

`POST /admin/products/{productId}/images`

Request:

```json
{
  "url": "https://example.com/iphone-15-pro-max.jpg",
  "altText": "iPhone 15 Pro Max",
  "sortOrder": 1,
  "isPrimary": true
}
```

### Update Image

`PATCH /admin/products/{productId}/images/{id}`

### Delete Image

`DELETE /admin/products/{productId}/images/{id}`

Response: `204 No Content`.

## Enum Values

Product status:

- `ACTIVE`
- `INACTIVE`
- `OUT_OF_STOCK`
- `DISCONTINUED`

Product condition:

- `NEW`
- `LIKE_NEW`
- `USED`
- `REFURBISHED`

## Error Contract

Common error response:

```json
{
  "success": false,
  "error": {
    "code": "PRODUCT_NOT_FOUND",
    "message": "Khong tim thay san pham",
    "details": {}
  }
}
```

Validation error:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Du lieu dau vao khong hop le",
    "details": {
      "name": "must not be blank",
      "price": "must be greater than or equal to 1.0"
    }
  }
}
```

Catalog-specific codes implemented now:

- `PRODUCT_NOT_FOUND`
- `PRODUCT_VARIANT_NOT_FOUND`
- `VALIDATION_ERROR`
- `NOT_FOUND`
- `CONFLICT`
- `INTERNAL_ERROR`

## Current Test Data

Flyway seed hien co:

- 4 categories.
- 3 products.
- 4 variants.
- 4 product images.
- 2 phone specs records.

## FE Migration Checklist

- Replace old mock product services with `/api/v1/products`.
- Replace old category services with `/api/v1/categories`.
- Read pagination from `response.pagination`, not root-level `total/page/pageSize`.
- Read payload from `response.data`.
- Do not call old `POST /products` or `PUT /products/{id}`; use `/admin/products` and `PATCH`.
- Do not call old `POST /categories`; use `/admin/categories`.
- Keep a single API adapter for response shape before wiring screens.

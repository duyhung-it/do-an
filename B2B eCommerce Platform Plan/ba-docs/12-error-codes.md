# 12. Mã Lỗi và Xử Lý Lỗi (Error Codes & Error Handling)

> **Dự án:** B2B eCommerce Platform
> **Phiên bản:** 1.0
> **Ngày cập nhật:** 2026-05-12
> **Tác giả:** BA Team

---

## 1. Định Dạng Response Lỗi Chuẩn

Tất cả lỗi trả về từ API đều tuân theo cấu trúc JSON thống nhất sau:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Thông báo lỗi thân thiện với người dùng",
    "details": { }
  },
  "timestamp": "2024-01-15T10:30:00Z",
  "path": "/api/v1/..."
}
```

### Mô Tả Các Trường

| Trường | Kiểu dữ liệu | Bắt buộc | Mô tả |
|--------|-------------|---------|-------|
| `success` | Boolean | Có | Luôn là `false` khi có lỗi |
| `error.code` | String | Có | Mã lỗi định danh, viết HOA và gạch dưới (vd: `ORDER_NOT_FOUND`) |
| `error.message` | String | Có | Thông báo lỗi thân thiện bằng tiếng Việt, hiển thị cho người dùng |
| `error.details` | Object | Không | Thông tin bổ sung tuỳ theo loại lỗi (có thể null) |
| `timestamp` | String (ISO 8601) | Có | Thời điểm xảy ra lỗi (UTC) |
| `path` | String | Có | Đường dẫn API đã gọi |

### Ví Dụ — Lỗi Tài Nguyên Không Tồn Tại

```json
{
  "success": false,
  "error": {
    "code": "ORDER_NOT_FOUND",
    "message": "Không tìm thấy đơn hàng",
    "details": null
  },
  "timestamp": "2024-01-15T10:30:00Z",
  "path": "/api/v1/orders/ord_01HXYZ999"
}
```

### Ví Dụ — Lỗi Không Đủ Quyền

```json
{
  "success": false,
  "error": {
    "code": "AUTH_INSUFFICIENT_PERMISSION",
    "message": "Không có quyền thực hiện hành động này",
    "details": null
  },
  "timestamp": "2024-01-15T10:31:00Z",
  "path": "/api/v1/admin/reports"
}
```

---

## 2. Định Dạng Lỗi Validation (HTTP 400)

Khi dữ liệu đầu vào không vượt qua kiểm tra hợp lệ (Bean Validation, JSR-380), API trả về danh sách chi tiết các trường bị lỗi:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Dữ liệu không hợp lệ",
    "details": {
      "fields": [
        {
          "field": "email",
          "message": "Email không hợp lệ"
        },
        {
          "field": "phone",
          "message": "Số điện thoại phải có 10-11 chữ số"
        },
        {
          "field": "password",
          "message": "Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường và số"
        }
      ]
    }
  },
  "timestamp": "2024-01-15T10:32:00Z",
  "path": "/api/v1/auth/register"
}
```

### Cấu Trúc Field Error

| Trường | Kiểu | Mô tả |
|--------|------|-------|
| `field` | String | Tên trường bị lỗi (theo camelCase, ví dụ: `phoneNumber`) |
| `message` | String | Mô tả lỗi cụ thể bằng tiếng Việt |

### Ví Dụ Thêm — Lỗi Tạo Đơn Hàng

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Dữ liệu không hợp lệ",
    "details": {
      "fields": [
        {
          "field": "shippingAddressId",
          "message": "Địa chỉ giao hàng không được để trống"
        },
        {
          "field": "items",
          "message": "Đơn hàng phải có ít nhất 1 sản phẩm"
        }
      ]
    }
  },
  "timestamp": "2024-01-15T10:33:00Z",
  "path": "/api/v1/orders"
}
```

---

## 3. Danh Mục Mã Lỗi Đầy Đủ

### 3.1. Lỗi Xác Thực và Phân Quyền (Auth Errors)

> HTTP Status: `401 Unauthorized` hoặc `403 Forbidden`

| Mã lỗi | HTTP | Mô tả tiếng Việt | Ghi chú |
|--------|------|-----------------|---------|
| `AUTH_TOKEN_MISSING` | 401 | Không có token xác thực | Request không có header `Authorization` |
| `AUTH_TOKEN_INVALID` | 401 | Token không hợp lệ | Chữ ký sai, token bị giả mạo hoặc format không đúng |
| `AUTH_TOKEN_EXPIRED` | 401 | Token đã hết hạn | Access token quá 1 giờ, cần dùng refresh token |
| `AUTH_REFRESH_TOKEN_INVALID` | 401 | Refresh token không hợp lệ | Token không tồn tại, đã bị thu hồi hoặc hết hạn |
| `AUTH_INSUFFICIENT_PERMISSION` | 403 | Không có quyền thực hiện hành động này | Đã xác thực nhưng role không đủ quyền |
| `AUTH_ACCOUNT_LOCKED` | 403 | Tài khoản bị khoá | Đăng nhập sai quá 5 lần hoặc ADMIN khoá thủ công |
| `AUTH_ACCOUNT_PENDING` | 403 | Tài khoản chờ xác minh | Tài khoản mới chưa được duyệt (B2B approval flow) |
| `AUTH_INVALID_CREDENTIALS` | 401 | Email hoặc mật khẩu không đúng | Không nêu rõ trường nào sai để tránh enumeration attack |

**Ví dụ response `AUTH_TOKEN_EXPIRED`:**
```json
{
  "success": false,
  "error": {
    "code": "AUTH_TOKEN_EXPIRED",
    "message": "Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại",
    "details": null
  },
  "timestamp": "2024-01-15T11:30:00Z",
  "path": "/api/v1/orders"
}
```

---

### 3.2. Lỗi Người Dùng (User Errors)

> HTTP Status: `400 Bad Request`, `404 Not Found`, `409 Conflict`

| Mã lỗi | HTTP | Mô tả tiếng Việt | Ghi chú |
|--------|------|-----------------|---------|
| `USER_NOT_FOUND` | 404 | Không tìm thấy người dùng | userId không tồn tại trong hệ thống |
| `USER_EMAIL_EXISTS` | 409 | Email đã được đăng ký | Trùng email khi tạo tài khoản |
| `USER_PHONE_EXISTS` | 409 | Số điện thoại đã được đăng ký | Trùng số điện thoại |
| `USER_INVALID_PASSWORD` | 400 | Mật khẩu cũ không đúng | Khi đổi mật khẩu, currentPassword sai |
| `USER_LOCKED` | 403 | Tài khoản người dùng bị khoá | Dùng khi service khác cần kiểm tra trạng thái user |

**Ví dụ response `USER_EMAIL_EXISTS`:**
```json
{
  "success": false,
  "error": {
    "code": "USER_EMAIL_EXISTS",
    "message": "Email đã được đăng ký, vui lòng sử dụng email khác",
    "details": null
  },
  "timestamp": "2024-01-15T10:34:00Z",
  "path": "/api/v1/auth/register"
}
```

---

### 3.3. Lỗi Sản Phẩm (Product Errors)

> HTTP Status: `404 Not Found`, `422 Unprocessable Entity`

| Mã lỗi | HTTP | Mô tả tiếng Việt | Ghi chú |
|--------|------|-----------------|---------|
| `PRODUCT_NOT_FOUND` | 404 | Không tìm thấy sản phẩm | productId không tồn tại |
| `PRODUCT_OUT_OF_STOCK` | 422 | Sản phẩm đã hết hàng | Tồn kho = 0 hoặc không đủ số lượng yêu cầu |
| `PRODUCT_INACTIVE` | 422 | Sản phẩm không còn kinh doanh | Sản phẩm bị ẩn hoặc ngừng bán |
| `PRODUCT_VARIANT_NOT_FOUND` | 404 | Không tìm thấy biến thể sản phẩm | variantId (màu sắc, kích thước) không tồn tại |

**Ví dụ response `PRODUCT_OUT_OF_STOCK`:**
```json
{
  "success": false,
  "error": {
    "code": "PRODUCT_OUT_OF_STOCK",
    "message": "Sản phẩm đã hết hàng",
    "details": {
      "productId": "prod_01HXYZ123",
      "productName": "Laptop Dell XPS 15",
      "requestedQuantity": 3,
      "availableQuantity": 0
    }
  },
  "timestamp": "2024-01-15T10:35:00Z",
  "path": "/api/v1/cart"
}
```

---

### 3.4. Lỗi Đơn Hàng (Order Errors)

> HTTP Status: `400 Bad Request`, `404 Not Found`, `422 Unprocessable Entity`

| Mã lỗi | HTTP | Mô tả tiếng Việt | Ghi chú |
|--------|------|-----------------|---------|
| `ORDER_NOT_FOUND` | 404 | Không tìm thấy đơn hàng | orderId không tồn tại |
| `ORDER_CANNOT_CANCEL` | 422 | Đơn hàng không thể huỷ ở trạng thái này | Chỉ được huỷ khi PENDING hoặc CONFIRMED |
| `ORDER_INVALID_STATUS_TRANSITION` | 422 | Chuyển trạng thái không hợp lệ | Ví dụ: không thể chuyển từ DELIVERED về PENDING |
| `ORDER_EMPTY_CART` | 400 | Giỏ hàng trống | Đặt hàng khi không có sản phẩm nào trong giỏ |
| `ORDER_INSUFFICIENT_STOCK` | 422 | Sản phẩm không đủ tồn kho | Số lượng yêu cầu > số lượng tồn kho |
| `ORDER_ADDRESS_REQUIRED` | 400 | Vui lòng chọn địa chỉ giao hàng | Thiếu shippingAddressId khi đặt hàng |
| `ORDER_ACCESS_DENIED` | 403 | Không có quyền truy cập đơn hàng này | CUSTOMER cố truy cập đơn hàng của người khác |

**Ví dụ response `ORDER_CANNOT_CANCEL`:**
```json
{
  "success": false,
  "error": {
    "code": "ORDER_CANNOT_CANCEL",
    "message": "Đơn hàng không thể huỷ ở trạng thái này",
    "details": {
      "orderId": "ord_01HXYZ456",
      "currentStatus": "SHIPPED",
      "cancellableStatuses": ["PENDING", "CONFIRMED"]
    }
  },
  "timestamp": "2024-01-15T10:36:00Z",
  "path": "/api/v1/orders/ord_01HXYZ456"
}
```

**Ví dụ response `ORDER_INSUFFICIENT_STOCK`:**
```json
{
  "success": false,
  "error": {
    "code": "ORDER_INSUFFICIENT_STOCK",
    "message": "Một hoặc nhiều sản phẩm không đủ tồn kho",
    "details": {
      "insufficientItems": [
        {
          "productId": "prod_01HXYZ123",
          "productName": "Laptop Dell XPS 15",
          "requestedQuantity": 10,
          "availableQuantity": 3
        }
      ]
    }
  },
  "timestamp": "2024-01-15T10:37:00Z",
  "path": "/api/v1/orders"
}
```

---

### 3.5. Lỗi Khuyến Mãi (Promotion Errors)

> HTTP Status: `400 Bad Request`, `404 Not Found`, `422 Unprocessable Entity`

| Mã lỗi | HTTP | Mô tả tiếng Việt | Ghi chú |
|--------|------|-----------------|---------|
| `PROMOTION_NOT_FOUND` | 404 | Không tìm thấy khuyến mãi | Mã khuyến mãi không tồn tại |
| `PROMOTION_EXPIRED` | 422 | Khuyến mãi đã hết hạn | Thời điểm hiện tại > endDate của promotion |
| `PROMOTION_INACTIVE` | 422 | Khuyến mãi chưa bắt đầu hoặc đã kết thúc | Status = INACTIVE hoặc chưa đến startDate |
| `PROMOTION_USAGE_EXCEEDED` | 422 | Khuyến mãi đã hết lượt sử dụng | usageCount >= maxUsage |
| `PROMOTION_MIN_ORDER_NOT_MET` | 422 | Đơn hàng chưa đạt giá trị tối thiểu | Giá trị đơn hàng < minOrderValue |
| `PROMOTION_NOT_APPLICABLE` | 422 | Khuyến mãi không áp dụng cho sản phẩm này | Sản phẩm không nằm trong danh mục áp dụng |

**Ví dụ response `PROMOTION_MIN_ORDER_NOT_MET`:**
```json
{
  "success": false,
  "error": {
    "code": "PROMOTION_MIN_ORDER_NOT_MET",
    "message": "Đơn hàng chưa đạt giá trị tối thiểu để áp dụng khuyến mãi",
    "details": {
      "promotionCode": "SALE50",
      "minOrderValue": 2000000,
      "currentOrderValue": 1500000,
      "currency": "VND"
    }
  },
  "timestamp": "2024-01-15T10:38:00Z",
  "path": "/api/v1/promotions/validate"
}
```

---

### 3.6. Lỗi Trả Hàng (Return Errors)

> HTTP Status: `400 Bad Request`, `404 Not Found`, `422 Unprocessable Entity`

| Mã lỗi | HTTP | Mô tả tiếng Việt | Ghi chú |
|--------|------|-----------------|---------|
| `RETURN_NOT_FOUND` | 404 | Không tìm thấy yêu cầu trả hàng | returnId không tồn tại |
| `RETURN_WINDOW_EXPIRED` | 422 | Đã quá thời hạn trả hàng | Quá 7 ngày kể từ ngày giao hàng thành công |
| `RETURN_ORDER_NOT_DELIVERED` | 422 | Đơn hàng chưa được giao | Chỉ được yêu cầu trả hàng khi status = DELIVERED |
| `RETURN_ALREADY_REQUESTED` | 409 | Yêu cầu trả hàng đã tồn tại | Đơn hàng đã có return request đang xử lý |
| `RETURN_INVALID_STATUS` | 422 | Trạng thái trả hàng không hợp lệ | Chuyển trạng thái không hợp lệ trong quy trình |

**Ví dụ response `RETURN_WINDOW_EXPIRED`:**
```json
{
  "success": false,
  "error": {
    "code": "RETURN_WINDOW_EXPIRED",
    "message": "Đã quá thời hạn trả hàng (7 ngày kể từ ngày nhận hàng)",
    "details": {
      "orderId": "ord_01HXYZ789",
      "deliveredAt": "2024-01-05T14:00:00Z",
      "returnDeadline": "2024-01-12T14:00:00Z",
      "currentDate": "2024-01-15T10:38:00Z"
    }
  },
  "timestamp": "2024-01-15T10:38:00Z",
  "path": "/api/v1/returns"
}
```

---

### 3.7. Lỗi Bảo Hành (Warranty Errors)

> HTTP Status: `400 Bad Request`, `404 Not Found`, `422 Unprocessable Entity`

| Mã lỗi | HTTP | Mô tả tiếng Việt | Ghi chú |
|--------|------|-----------------|---------|
| `WARRANTY_NOT_FOUND` | 404 | Không tìm thấy thông tin bảo hành | warrantyId không tồn tại hoặc không thuộc user này |
| `WARRANTY_EXPIRED` | 422 | Bảo hành đã hết hạn | Thời điểm hiện tại > warranty.expiresAt |
| `WARRANTY_CLAIM_ALREADY_ACTIVE` | 409 | Đã có yêu cầu bảo hành đang xử lý | Không cho tạo thêm claim khi claim cũ chưa giải quyết |

**Ví dụ response `WARRANTY_EXPIRED`:**
```json
{
  "success": false,
  "error": {
    "code": "WARRANTY_EXPIRED",
    "message": "Thời hạn bảo hành đã kết thúc",
    "details": {
      "warrantyId": "war_01HXYZ111",
      "productName": "Laptop Dell XPS 15",
      "warrantyExpiredAt": "2023-12-31T23:59:59Z"
    }
  },
  "timestamp": "2024-01-15T10:39:00Z",
  "path": "/api/v1/warranty-claims"
}
```

---

### 3.8. Lỗi Thu Cũ (Trade-in Errors)

> HTTP Status: `404 Not Found`, `422 Unprocessable Entity`

| Mã lỗi | HTTP | Mô tả tiếng Việt | Ghi chú |
|--------|------|-----------------|---------|
| `TRADE_IN_NOT_FOUND` | 404 | Không tìm thấy yêu cầu thu cũ | tradeInId không tồn tại |
| `TRADE_IN_INVALID_STATUS` | 422 | Trạng thái không hợp lệ | Chuyển trạng thái không đúng quy trình trade-in |

**Ví dụ response `TRADE_IN_INVALID_STATUS`:**
```json
{
  "success": false,
  "error": {
    "code": "TRADE_IN_INVALID_STATUS",
    "message": "Không thể thực hiện hành động này ở trạng thái hiện tại",
    "details": {
      "tradeInId": "tin_01HXYZ222",
      "currentStatus": "COMPLETED",
      "allowedTransitions": []
    }
  },
  "timestamp": "2024-01-15T10:40:00Z",
  "path": "/api/v1/trade-in/tin_01HXYZ222/status"
}
```

---

### 3.9. Lỗi Loyalty (Loyalty Errors)

> HTTP Status: `404 Not Found`, `422 Unprocessable Entity`

| Mã lỗi | HTTP | Mô tả tiếng Việt | Ghi chú |
|--------|------|-----------------|---------|
| `LOYALTY_PROGRAM_NOT_FOUND` | 404 | Không tìm thấy chương trình loyalty | programId không tồn tại hoặc user chưa tham gia |
| `LOYALTY_INSUFFICIENT_POINTS` | 422 | Không đủ điểm để đổi thưởng | Số điểm hiện có < số điểm yêu cầu |
| `LOYALTY_REWARD_OUT_OF_STOCK` | 422 | Phần thưởng đã hết | Số lượng phần thưởng = 0 |
| `LOYALTY_REWARD_NOT_FOUND` | 404 | Không tìm thấy phần thưởng | rewardId không tồn tại hoặc đã bị xoá |

**Ví dụ response `LOYALTY_INSUFFICIENT_POINTS`:**
```json
{
  "success": false,
  "error": {
    "code": "LOYALTY_INSUFFICIENT_POINTS",
    "message": "Không đủ điểm để đổi phần thưởng này",
    "details": {
      "rewardId": "rwd_01HXYZ333",
      "rewardName": "Voucher giảm 200.000đ",
      "requiredPoints": 500,
      "currentPoints": 320
    }
  },
  "timestamp": "2024-01-15T10:41:00Z",
  "path": "/api/v1/loyalty/redeem"
}
```

---

### 3.10. Lỗi Chung (General Errors)

> HTTP Status: `400`, `404`, `409`, `429`, `500`, `503`

| Mã lỗi | HTTP | Mô tả tiếng Việt | Ghi chú |
|--------|------|-----------------|---------|
| `VALIDATION_ERROR` | 400 | Dữ liệu không hợp lệ | Lỗi Bean Validation, kèm danh sách fields (xem mục 2) |
| `NOT_FOUND` | 404 | Không tìm thấy tài nguyên | Dùng khi không có error code cụ thể hơn |
| `CONFLICT` | 409 | Xung đột dữ liệu | Dùng khi không có error code cụ thể hơn |
| `RATE_LIMIT_EXCEEDED` | 429 | Quá nhiều yêu cầu, vui lòng thử lại sau | Kèm header `Retry-After` |
| `INTERNAL_ERROR` | 500 | Lỗi hệ thống, vui lòng thử lại | Không tiết lộ stack trace cho client |
| `SERVICE_UNAVAILABLE` | 503 | Dịch vụ tạm thời không khả dụng | Maintenance mode hoặc dependency bị lỗi |

**Ví dụ response `INTERNAL_ERROR`:**
```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Đã xảy ra lỗi hệ thống, vui lòng thử lại sau",
    "details": {
      "traceId": "trace_7f3a2b1c4d5e6f78"
    }
  },
  "timestamp": "2024-01-15T10:42:00Z",
  "path": "/api/v1/orders"
}
```

> **Lưu ý:** Với lỗi `INTERNAL_ERROR`, luôn ghi log đầy đủ stack trace phía server và gán `traceId` duy nhất để hỗ trợ debug. Không bao giờ trả stack trace về client.

---

## 4. Bảng Mapping HTTP Status Code

| HTTP Code | Tên | Khi nào dùng | Ví dụ |
|-----------|-----|-------------|-------|
| `200 OK` | OK | Request thành công, có response body | GET /products, PATCH /orders/:id/status |
| `201 Created` | Created | Tạo mới tài nguyên thành công | POST /orders, POST /products |
| `204 No Content` | No Content | Xoá thành công, không có response body | DELETE /products/:id, POST /auth/logout |
| `400 Bad Request` | Bad Request | Dữ liệu đầu vào lỗi validation hoặc không hợp lệ | Email sai format, thiếu trường bắt buộc |
| `401 Unauthorized` | Unauthorized | Chưa xác thực hoặc token hết hạn/không hợp lệ | Không có Bearer token, token expired |
| `403 Forbidden` | Forbidden | Đã xác thực nhưng không có quyền thực hiện | CUSTOMER cố truy cập `/admin/**` |
| `404 Not Found` | Not Found | Tài nguyên không tồn tại | orderId, productId không có trong DB |
| `409 Conflict` | Conflict | Xung đột dữ liệu với trạng thái hiện tại | Email đã tồn tại, return đã được tạo |
| `422 Unprocessable Entity` | Unprocessable Entity | Dữ liệu hợp lệ về format nhưng vi phạm business rule | Huỷ đơn hàng đã giao, bảo hành đã hết hạn |
| `429 Too Many Requests` | Too Many Requests | Vượt quá giới hạn rate limiting | Gọi API quá 100 lần/phút |
| `500 Internal Server Error` | Internal Server Error | Lỗi không mong đợi phía server | Exception chưa được handle, DB down |
| `503 Service Unavailable` | Service Unavailable | Server đang bảo trì hoặc dependency bị lỗi | Maintenance mode, payment gateway lỗi |

---

## 5. Hướng Dẫn Xử Lý Lỗi Phía Backend (Spring Boot)

### 5.1. Global Exception Handler

```java
@RestControllerAdvice
public class GlobalExceptionHandler {

    // Xử lý lỗi business logic (AppException)
    @ExceptionHandler(AppException.class)
    public ResponseEntity<ErrorResponse> handleAppException(
            AppException ex, HttpServletRequest request) {

        ErrorCode errorCode = ex.getErrorCode();
        return ResponseEntity
            .status(errorCode.getHttpStatus())
            .body(ErrorResponse.of(errorCode, request.getRequestURI()));
    }

    // Xử lý lỗi Bean Validation (@Valid)
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationException(
            MethodArgumentNotValidException ex, HttpServletRequest request) {

        List<FieldError> fieldErrors = ex.getBindingResult()
            .getFieldErrors()
            .stream()
            .map(e -> new FieldError(e.getField(), e.getDefaultMessage()))
            .toList();

        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
            .body(ErrorResponse.validationError(fieldErrors, request.getRequestURI()));
    }

    // Xử lý lỗi không mong đợi
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleUnexpectedException(
            Exception ex, HttpServletRequest request) {

        String traceId = generateTraceId();
        log.error("[TraceId: {}] Unexpected error: {}", traceId, ex.getMessage(), ex);

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(ErrorResponse.internalError(traceId, request.getRequestURI()));
    }
}
```

### 5.2. AppException và ErrorCode Enum

```java
// Custom exception
public class AppException extends RuntimeException {
    private final ErrorCode errorCode;

    public AppException(ErrorCode errorCode) {
        super(errorCode.getMessage());
        this.errorCode = errorCode;
    }
}

// Enum định nghĩa tất cả error codes
public enum ErrorCode {

    // Auth
    AUTH_TOKEN_MISSING(HttpStatus.UNAUTHORIZED, "Không có token xác thực"),
    AUTH_TOKEN_INVALID(HttpStatus.UNAUTHORIZED, "Token không hợp lệ"),
    AUTH_TOKEN_EXPIRED(HttpStatus.UNAUTHORIZED, "Token đã hết hạn"),
    AUTH_REFRESH_TOKEN_INVALID(HttpStatus.UNAUTHORIZED, "Refresh token không hợp lệ"),
    AUTH_INSUFFICIENT_PERMISSION(HttpStatus.FORBIDDEN, "Không có quyền thực hiện hành động này"),
    AUTH_ACCOUNT_LOCKED(HttpStatus.FORBIDDEN, "Tài khoản bị khoá"),
    AUTH_ACCOUNT_PENDING(HttpStatus.FORBIDDEN, "Tài khoản chờ xác minh"),
    AUTH_INVALID_CREDENTIALS(HttpStatus.UNAUTHORIZED, "Email hoặc mật khẩu không đúng"),

    // User
    USER_NOT_FOUND(HttpStatus.NOT_FOUND, "Không tìm thấy người dùng"),
    USER_EMAIL_EXISTS(HttpStatus.CONFLICT, "Email đã được đăng ký"),
    USER_PHONE_EXISTS(HttpStatus.CONFLICT, "Số điện thoại đã được đăng ký"),
    USER_INVALID_PASSWORD(HttpStatus.BAD_REQUEST, "Mật khẩu cũ không đúng"),
    USER_LOCKED(HttpStatus.FORBIDDEN, "Tài khoản người dùng bị khoá"),

    // Product
    PRODUCT_NOT_FOUND(HttpStatus.NOT_FOUND, "Không tìm thấy sản phẩm"),
    PRODUCT_OUT_OF_STOCK(HttpStatus.UNPROCESSABLE_ENTITY, "Sản phẩm đã hết hàng"),
    PRODUCT_INACTIVE(HttpStatus.UNPROCESSABLE_ENTITY, "Sản phẩm không còn kinh doanh"),
    PRODUCT_VARIANT_NOT_FOUND(HttpStatus.NOT_FOUND, "Không tìm thấy biến thể sản phẩm"),

    // Order
    ORDER_NOT_FOUND(HttpStatus.NOT_FOUND, "Không tìm thấy đơn hàng"),
    ORDER_CANNOT_CANCEL(HttpStatus.UNPROCESSABLE_ENTITY, "Đơn hàng không thể huỷ ở trạng thái này"),
    ORDER_INVALID_STATUS_TRANSITION(HttpStatus.UNPROCESSABLE_ENTITY, "Chuyển trạng thái không hợp lệ"),
    ORDER_EMPTY_CART(HttpStatus.BAD_REQUEST, "Giỏ hàng trống"),
    ORDER_INSUFFICIENT_STOCK(HttpStatus.UNPROCESSABLE_ENTITY, "Sản phẩm không đủ tồn kho"),
    ORDER_ADDRESS_REQUIRED(HttpStatus.BAD_REQUEST, "Vui lòng chọn địa chỉ giao hàng"),
    ORDER_ACCESS_DENIED(HttpStatus.FORBIDDEN, "Không có quyền truy cập đơn hàng này"),

    // Promotion
    PROMOTION_NOT_FOUND(HttpStatus.NOT_FOUND, "Không tìm thấy khuyến mãi"),
    PROMOTION_EXPIRED(HttpStatus.UNPROCESSABLE_ENTITY, "Khuyến mãi đã hết hạn"),
    PROMOTION_INACTIVE(HttpStatus.UNPROCESSABLE_ENTITY, "Khuyến mãi chưa bắt đầu hoặc đã kết thúc"),
    PROMOTION_USAGE_EXCEEDED(HttpStatus.UNPROCESSABLE_ENTITY, "Khuyến mãi đã hết lượt sử dụng"),
    PROMOTION_MIN_ORDER_NOT_MET(HttpStatus.UNPROCESSABLE_ENTITY, "Đơn hàng chưa đạt giá trị tối thiểu"),
    PROMOTION_NOT_APPLICABLE(HttpStatus.UNPROCESSABLE_ENTITY, "Khuyến mãi không áp dụng cho sản phẩm này"),

    // Return
    RETURN_NOT_FOUND(HttpStatus.NOT_FOUND, "Không tìm thấy yêu cầu trả hàng"),
    RETURN_WINDOW_EXPIRED(HttpStatus.UNPROCESSABLE_ENTITY, "Đã quá thời hạn trả hàng (7 ngày)"),
    RETURN_ORDER_NOT_DELIVERED(HttpStatus.UNPROCESSABLE_ENTITY, "Đơn hàng chưa được giao"),
    RETURN_ALREADY_REQUESTED(HttpStatus.CONFLICT, "Yêu cầu trả hàng đã tồn tại"),
    RETURN_INVALID_STATUS(HttpStatus.UNPROCESSABLE_ENTITY, "Trạng thái trả hàng không hợp lệ"),

    // Warranty
    WARRANTY_NOT_FOUND(HttpStatus.NOT_FOUND, "Không tìm thấy thông tin bảo hành"),
    WARRANTY_EXPIRED(HttpStatus.UNPROCESSABLE_ENTITY, "Bảo hành đã hết hạn"),
    WARRANTY_CLAIM_ALREADY_ACTIVE(HttpStatus.CONFLICT, "Đã có yêu cầu bảo hành đang xử lý"),

    // Trade-in
    TRADE_IN_NOT_FOUND(HttpStatus.NOT_FOUND, "Không tìm thấy yêu cầu thu cũ"),
    TRADE_IN_INVALID_STATUS(HttpStatus.UNPROCESSABLE_ENTITY, "Trạng thái không hợp lệ"),

    // Loyalty
    LOYALTY_PROGRAM_NOT_FOUND(HttpStatus.NOT_FOUND, "Không tìm thấy chương trình loyalty"),
    LOYALTY_INSUFFICIENT_POINTS(HttpStatus.UNPROCESSABLE_ENTITY, "Không đủ điểm"),
    LOYALTY_REWARD_OUT_OF_STOCK(HttpStatus.UNPROCESSABLE_ENTITY, "Phần thưởng đã hết"),
    LOYALTY_REWARD_NOT_FOUND(HttpStatus.NOT_FOUND, "Không tìm thấy phần thưởng"),

    // General
    VALIDATION_ERROR(HttpStatus.BAD_REQUEST, "Dữ liệu không hợp lệ"),
    NOT_FOUND(HttpStatus.NOT_FOUND, "Không tìm thấy tài nguyên"),
    CONFLICT(HttpStatus.CONFLICT, "Xung đột dữ liệu"),
    RATE_LIMIT_EXCEEDED(HttpStatus.TOO_MANY_REQUESTS, "Quá nhiều yêu cầu, vui lòng thử lại sau"),
    INTERNAL_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "Lỗi hệ thống, vui lòng thử lại"),
    SERVICE_UNAVAILABLE(HttpStatus.SERVICE_UNAVAILABLE, "Dịch vụ tạm thời không khả dụng");

    private final HttpStatus httpStatus;
    private final String message;

    ErrorCode(HttpStatus httpStatus, String message) {
        this.httpStatus = httpStatus;
        this.message = message;
    }
}
```

---

## 6. Tổng Hợp Toàn Bộ Mã Lỗi

| Mã lỗi | HTTP | Nhóm |
|--------|------|------|
| `AUTH_TOKEN_MISSING` | 401 | Auth |
| `AUTH_TOKEN_INVALID` | 401 | Auth |
| `AUTH_TOKEN_EXPIRED` | 401 | Auth |
| `AUTH_REFRESH_TOKEN_INVALID` | 401 | Auth |
| `AUTH_INSUFFICIENT_PERMISSION` | 403 | Auth |
| `AUTH_ACCOUNT_LOCKED` | 403 | Auth |
| `AUTH_ACCOUNT_PENDING` | 403 | Auth |
| `AUTH_INVALID_CREDENTIALS` | 401 | Auth |
| `USER_NOT_FOUND` | 404 | User |
| `USER_EMAIL_EXISTS` | 409 | User |
| `USER_PHONE_EXISTS` | 409 | User |
| `USER_INVALID_PASSWORD` | 400 | User |
| `USER_LOCKED` | 403 | User |
| `PRODUCT_NOT_FOUND` | 404 | Product |
| `PRODUCT_OUT_OF_STOCK` | 422 | Product |
| `PRODUCT_INACTIVE` | 422 | Product |
| `PRODUCT_VARIANT_NOT_FOUND` | 404 | Product |
| `ORDER_NOT_FOUND` | 404 | Order |
| `ORDER_CANNOT_CANCEL` | 422 | Order |
| `ORDER_INVALID_STATUS_TRANSITION` | 422 | Order |
| `ORDER_EMPTY_CART` | 400 | Order |
| `ORDER_INSUFFICIENT_STOCK` | 422 | Order |
| `ORDER_ADDRESS_REQUIRED` | 400 | Order |
| `ORDER_ACCESS_DENIED` | 403 | Order |
| `PROMOTION_NOT_FOUND` | 404 | Promotion |
| `PROMOTION_EXPIRED` | 422 | Promotion |
| `PROMOTION_INACTIVE` | 422 | Promotion |
| `PROMOTION_USAGE_EXCEEDED` | 422 | Promotion |
| `PROMOTION_MIN_ORDER_NOT_MET` | 422 | Promotion |
| `PROMOTION_NOT_APPLICABLE` | 422 | Promotion |
| `RETURN_NOT_FOUND` | 404 | Return |
| `RETURN_WINDOW_EXPIRED` | 422 | Return |
| `RETURN_ORDER_NOT_DELIVERED` | 422 | Return |
| `RETURN_ALREADY_REQUESTED` | 409 | Return |
| `RETURN_INVALID_STATUS` | 422 | Return |
| `WARRANTY_NOT_FOUND` | 404 | Warranty |
| `WARRANTY_EXPIRED` | 422 | Warranty |
| `WARRANTY_CLAIM_ALREADY_ACTIVE` | 409 | Warranty |
| `TRADE_IN_NOT_FOUND` | 404 | Trade-in |
| `TRADE_IN_INVALID_STATUS` | 422 | Trade-in |
| `LOYALTY_PROGRAM_NOT_FOUND` | 404 | Loyalty |
| `LOYALTY_INSUFFICIENT_POINTS` | 422 | Loyalty |
| `LOYALTY_REWARD_OUT_OF_STOCK` | 422 | Loyalty |
| `LOYALTY_REWARD_NOT_FOUND` | 404 | Loyalty |
| `VALIDATION_ERROR` | 400 | General |
| `NOT_FOUND` | 404 | General |
| `CONFLICT` | 409 | General |
| `RATE_LIMIT_EXCEEDED` | 429 | General |
| `INTERNAL_ERROR` | 500 | General |
| `SERVICE_UNAVAILABLE` | 503 | General |

**Tổng cộng: 50 mã lỗi** trải trên 10 nhóm domain.

---

*Tài liệu này được tạo bởi BA Team — Dự án B2B eCommerce Platform*

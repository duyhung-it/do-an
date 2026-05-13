# 03 - API Specification: Authentication & User Management

> **Phiên bản tài liệu:** 1.0
> **Ngày tạo:** 2026-05-12
> **Người soạn:** BA Team
> **Dành cho:** Backend Developer (Java Spring Boot)
> **Platform:** CELLPHONES B2C eCommerce

---

## Quy ước chung

| Mục | Quy ước |
|-----|---------|
| **Base URL** | `/api/v1` |
| **Content-Type** | `application/json` (trừ khi ghi chú riêng) |
| **Authentication** | JWT Bearer Token trong header `Authorization: Bearer <token>` |
| **Ký hiệu field** | `*` = bắt buộc (required), `?` = tuỳ chọn (optional) |
| **Múi giờ** | UTC+7 (Việt Nam), datetime format: `ISO 8601` |
| **Tiền tệ** | VND (số nguyên, không thập phân) |
| **UUID** | `java.util.UUID` format: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx` |

### HTTP Status Codes sử dụng

| Code | Ý nghĩa |
|------|---------|
| `200 OK` | Thành công, trả về dữ liệu |
| `201 Created` | Tạo mới thành công |
| `204 No Content` | Thành công, không có dữ liệu trả về |
| `400 Bad Request` | Dữ liệu đầu vào không hợp lệ |
| `401 Unauthorized` | Chưa xác thực hoặc token không hợp lệ |
| `403 Forbidden` | Không có quyền truy cập |
| `404 Not Found` | Không tìm thấy resource |
| `409 Conflict` | Xung đột dữ liệu (vd: email đã tồn tại) |
| `422 Unprocessable Entity` | Validation thất bại |
| `429 Too Many Requests` | Rate limit vượt quá |
| `500 Internal Server Error` | Lỗi server |

### Cấu trúc Response lỗi chuẩn

Mọi lỗi đều trả về theo cấu trúc sau. Tham chiếu mã lỗi đầy đủ tại `12-error-codes.md`.

```json
{
  "success": false,
  "errorCode": "AUTH_INVALID_CREDENTIALS",
  "message": "Email hoặc mật khẩu không đúng",
  "timestamp": "2026-05-12T08:30:00+07:00",
  "path": "/api/v1/auth/login"
}
```

### Cấu trúc Response thành công chuẩn

```json
{
  "success": true,
  "data": { ... },
  "message": "Thành công"
}
```

---

## Shared Schemas (Dùng lại trong nhiều endpoint)

### AuthUser Object

Đối tượng thông tin người dùng trả về sau xác thực, dùng trong login/register/me response.

| Field | Type | Mô tả |
|-------|------|-------|
| `id` | `UUID` | ID người dùng |
| `fullName` | `string` | Họ và tên đầy đủ |
| `email` | `string` | Địa chỉ email |
| `role` | `enum` | `CUSTOMER` \| `ADMIN` \| `STAFF` |
| `status` | `enum` | `ACTIVE` \| `LOCKED` \| `PENDING_VERIFY` |
| `avatarUrl` | `string?` | URL ảnh đại diện |
| `phone` | `string` | Số điện thoại |
| `loyaltyPoints` | `int` | Điểm tích luỹ hiện tại |
| `emailVerified` | `boolean` | Email đã xác minh chưa |
| `phoneVerified` | `boolean` | SĐT đã xác minh chưa |

### User Object (Full)

Đối tượng đầy đủ thông tin người dùng (dùng trong profile, admin).

| Field | Type | Bắt buộc | Mô tả |
|-------|------|----------|-------|
| `id` | `UUID` | * | Primary key |
| `fullName` | `string` | * | Họ và tên đầy đủ |
| `email` | `string` | * | Địa chỉ email (unique) |
| `phone` | `string` | * | Số điện thoại |
| `role` | `enum` | * | `CUSTOMER` \| `ADMIN` \| `STAFF` |
| `status` | `enum` | * | `ACTIVE` \| `LOCKED` \| `PENDING_VERIFY` |
| `avatarUrl` | `string` | ? | URL ảnh đại diện |
| `address` | `string` | ? | Địa chỉ thường trú |
| `dateOfBirth` | `date` | ? | Ngày sinh (YYYY-MM-DD) |
| `gender` | `enum` | ? | `MALE` \| `FEMALE` \| `OTHER` |
| `loyaltyPoints` | `int` | ? | Điểm tích luỹ (default: 0) |
| `totalOrders` | `int` | ? | Tổng số đơn đã đặt (denormalized) |
| `totalSpent` | `long` | ? | Tổng tiền đã chi, đơn vị VND (denormalized) |
| `lastLoginAt` | `datetime` | ? | Thời điểm đăng nhập cuối |
| `emailVerified` | `boolean` | * | Đã xác minh email (default: false) |
| `phoneVerified` | `boolean` | * | Đã xác minh SĐT (default: false) |
| `createdAt` | `datetime` | * | Thời điểm tạo tài khoản |
| `updatedAt` | `datetime` | * | Thời điểm cập nhật cuối |

### ShippingAddress Object

| Field | Type | Bắt buộc | Mô tả |
|-------|------|----------|-------|
| `id` | `UUID` | * | Primary key |
| `userId` | `UUID` | * | FK → users.id |
| `label` | `string` | * | Nhãn địa chỉ (vd: "Nhà", "Văn phòng") |
| `fullName` | `string` | * | Tên người nhận |
| `phone` | `string` | * | SĐT người nhận |
| `address` | `string` | * | Số nhà, tên đường |
| `ward` | `string` | * | Phường/Xã |
| `district` | `string` | * | Quận/Huyện |
| `city` | `string` | * | Tỉnh/Thành phố |
| `country` | `string` | * | Quốc gia (default: "Việt Nam") |
| `postalCode` | `string` | ? | Mã bưu chính |
| `type` | `enum` | ? | `HOME` \| `OFFICE` \| `OTHER` |
| `isDefault` | `boolean` | * | Địa chỉ mặc định (default: false) |
| `notes` | `string` | ? | Ghi chú giao hàng |
| `createdAt` | `datetime` | * | |
| `updatedAt` | `datetime` | * | |

---

## Section 1: Authentication

> Tất cả endpoint trong section này có prefix: `/api/v1/auth`

---

### 1.1 POST /auth/register

**Đăng ký tài khoản khách hàng mới**

| Thuộc tính | Giá trị |
|-----------|---------|
| **Method** | `POST` |
| **URL** | `/api/v1/auth/register` |
| **Auth** | Public (không cần token) |
| **Content-Type** | `application/json` |

#### Request Body

| Field | Type | Bắt buộc | Validation | Mô tả |
|-------|------|----------|------------|-------|
| `fullName` | `string` | * | 2–100 ký tự | Họ và tên đầy đủ |
| `email` | `string` | * | Định dạng email hợp lệ, unique | Địa chỉ email đăng ký |
| `password` | `string` | * | Tối thiểu 8 ký tự, gồm chữ và số | Mật khẩu |
| `phone` | `string` | * | 10–11 chữ số Việt Nam | Số điện thoại |
| `address` | `string` | ? | Tối đa 500 ký tự | Địa chỉ thường trú |

```json
{
  "fullName": "Nguyễn Văn An",
  "email": "an.nguyen@example.com",
  "password": "Passw0rd123",
  "phone": "0901234567",
  "address": "123 Nguyễn Huệ, Quận 1, TP.HCM"
}
```

#### Response 201 Created

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "fullName": "Nguyễn Văn An",
      "email": "an.nguyen@example.com",
      "role": "CUSTOMER",
      "status": "PENDING_VERIFY",
      "avatarUrl": null,
      "phone": "0901234567",
      "loyaltyPoints": 0,
      "emailVerified": false,
      "phoneVerified": false
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "dGhpcyBpcyBhIHJlZnJlc2ggdG9rZW4..."
  },
  "message": "Đăng ký tài khoản thành công"
}
```

#### Error Codes

| HTTP | Error Code | Mô tả |
|------|-----------|-------|
| `409` | `USER_EMAIL_ALREADY_EXISTS` | Email đã được đăng ký |
| `409` | `USER_PHONE_ALREADY_EXISTS` | Số điện thoại đã được đăng ký |
| `422` | `VALIDATION_ERROR` | Dữ liệu đầu vào không hợp lệ (email sai định dạng, password yếu, phone không đúng format) |

#### Business Notes

- Tài khoản mới tạo có `status = PENDING_VERIFY` cho đến khi xác minh email.
- Tự động tạo bản ghi `loyalty_program` với `points = 0` cho user mới.
- Gửi email chào mừng kèm link xác minh email đến địa chỉ email đăng ký (async queue).
- `accessToken` có thời hạn **15 phút**, `refreshToken` có thời hạn **30 ngày**.
- Mật khẩu được hash bằng **BCrypt** (cost factor = 12) trước khi lưu vào DB, không bao giờ lưu plain text.
- Nếu email hoặc phone đã tồn tại trong DB (kể cả tài khoản đã bị xoá mềm), trả về lỗi `409`.
- Rate limit: tối đa **5 lần đăng ký** từ cùng 1 IP trong 1 giờ.

---

### 1.2 POST /auth/login

**Đăng nhập vào hệ thống**

| Thuộc tính | Giá trị |
|-----------|---------|
| **Method** | `POST` |
| **URL** | `/api/v1/auth/login` |
| **Auth** | Public (không cần token) |
| **Content-Type** | `application/json` |

#### Request Body

| Field | Type | Bắt buộc | Validation | Mô tả |
|-------|------|----------|------------|-------|
| `email` | `string` | * | Định dạng email hợp lệ | Email tài khoản |
| `password` | `string` | * | Không được rỗng | Mật khẩu |

```json
{
  "email": "an.nguyen@example.com",
  "password": "Passw0rd123"
}
```

#### Response 200 OK

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "fullName": "Nguyễn Văn An",
      "email": "an.nguyen@example.com",
      "role": "CUSTOMER",
      "status": "ACTIVE",
      "avatarUrl": "https://cdn.cellphones.com.vn/avatars/abc.jpg",
      "phone": "0901234567",
      "loyaltyPoints": 450,
      "emailVerified": true,
      "phoneVerified": false
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "dGhpcyBpcyBhIHJlZnJlc2ggdG9rZW4..."
  },
  "message": "Đăng nhập thành công"
}
```

#### Error Codes

| HTTP | Error Code | Mô tả |
|------|-----------|-------|
| `401` | `AUTH_INVALID_CREDENTIALS` | Email hoặc mật khẩu không đúng |
| `403` | `AUTH_ACCOUNT_LOCKED` | Tài khoản bị khoá (status = LOCKED) |
| `403` | `AUTH_ACCOUNT_PENDING` | Tài khoản chờ xác minh (status = PENDING_VERIFY) |
| `429` | `AUTH_TOO_MANY_ATTEMPTS` | Đăng nhập sai quá nhiều lần, tạm thời bị khoá |

#### Business Notes

- Không tiết lộ email có tồn tại hay không khi đăng nhập thất bại (trả `AUTH_INVALID_CREDENTIALS` cho cả 2 trường hợp email không tồn tại và sai mật khẩu), tránh user enumeration attack.
- Sau **5 lần đăng nhập sai** liên tiếp trong vòng 15 phút, tài khoản bị tạm khoá 30 phút (lưu trạng thái trong Redis).
- Cập nhật `lastLoginAt` sau mỗi lần đăng nhập thành công.
- `refreshToken` được lưu vào bảng `refresh_tokens` trong DB để hỗ trợ revoke.
- `accessToken` có thời hạn **15 phút**, `refreshToken` có thời hạn **30 ngày**.
- JWT payload chứa: `userId`, `email`, `role`, `iat`, `exp`.

---

### 1.3 POST /auth/logout

**Đăng xuất (huỷ refresh token)**

| Thuộc tính | Giá trị |
|-----------|---------|
| **Method** | `POST` |
| **URL** | `/api/v1/auth/logout` |
| **Auth** | Bearer Token (bất kỳ role nào) |
| **Content-Type** | `application/json` |

#### Request Body

| Field | Type | Bắt buộc | Mô tả |
|-------|------|----------|-------|
| `refreshToken` | `string` | * | Refresh token cần huỷ |

```json
{
  "refreshToken": "dGhpcyBpcyBhIHJlZnJlc2ggdG9rZW4..."
}
```

#### Response 204 No Content

Không có body trả về.

#### Error Codes

| HTTP | Error Code | Mô tả |
|------|-----------|-------|
| `401` | `AUTH_TOKEN_INVALID` | Access token không hợp lệ hoặc hết hạn |
| `400` | `AUTH_REFRESH_TOKEN_INVALID` | Refresh token không hợp lệ |

#### Business Notes

- Xoá bản ghi `refresh_token` khỏi bảng `refresh_tokens` trong DB.
- Thêm `accessToken` vào Redis blacklist (TTL = thời gian còn lại của token) để vô hiệu hoá ngay lập tức.
- Nếu `refreshToken` không tồn tại hoặc đã bị huỷ trước đó, vẫn trả về `204` (idempotent).
- Frontend cần xoá token khỏi storage sau khi nhận `204`.

---

### 1.4 POST /auth/refresh

**Lấy access token mới bằng refresh token**

| Thuộc tính | Giá trị |
|-----------|---------|
| **Method** | `POST` |
| **URL** | `/api/v1/auth/refresh` |
| **Auth** | Public (dùng refresh token thay cho Bearer) |
| **Content-Type** | `application/json` |

#### Request Body

| Field | Type | Bắt buộc | Mô tả |
|-------|------|----------|-------|
| `refreshToken` | `string` | * | Refresh token còn hiệu lực |

```json
{
  "refreshToken": "dGhpcyBpcyBhIHJlZnJlc2ggdG9rZW4..."
}
```

#### Response 200 OK

```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "bmV3UmVmcmVzaFRva2Vu..."
  },
  "message": "Token được làm mới thành công"
}
```

#### Error Codes

| HTTP | Error Code | Mô tả |
|------|-----------|-------|
| `401` | `AUTH_REFRESH_TOKEN_INVALID` | Refresh token không hợp lệ, hết hạn, hoặc đã bị huỷ |
| `401` | `AUTH_ACCOUNT_LOCKED` | Tài khoản bị khoá sau khi token được cấp |

#### Business Notes

- Áp dụng chiến lược **Refresh Token Rotation**: mỗi lần refresh, token cũ bị huỷ và token mới được cấp.
- Nếu refresh token cũ được dùng lại sau khi đã rotate (replay attack), hệ thống thu hồi toàn bộ refresh tokens của user đó.
- Kiểm tra `status` của user trước khi cấp token mới. Nếu bị khoá sau khi đăng nhập thì từ chối.
- Thời hạn `accessToken` mới: **15 phút**. Thời hạn `refreshToken` mới: **30 ngày** (reset từ thời điểm rotate).

---

### 1.5 GET /auth/me

**Lấy thông tin người dùng đang đăng nhập**

| Thuộc tính | Giá trị |
|-----------|---------|
| **Method** | `GET` |
| **URL** | `/api/v1/auth/me` |
| **Auth** | Bearer Token (bất kỳ role nào) |

#### Request Params

Không có.

#### Response 200 OK

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "fullName": "Nguyễn Văn An",
      "email": "an.nguyen@example.com",
      "role": "CUSTOMER",
      "status": "ACTIVE",
      "avatarUrl": "https://cdn.cellphones.com.vn/avatars/abc.jpg",
      "phone": "0901234567",
      "loyaltyPoints": 450,
      "emailVerified": true,
      "phoneVerified": false
    }
  },
  "message": "Thành công"
}
```

#### Error Codes

| HTTP | Error Code | Mô tả |
|------|-----------|-------|
| `401` | `AUTH_TOKEN_INVALID` | Token không hợp lệ hoặc hết hạn |
| `401` | `AUTH_TOKEN_MISSING` | Không có token trong header |

#### Business Notes

- Endpoint này dùng để frontend khôi phục session sau khi reload trang.
- Trả về `AuthUser` object (không phải full User object để tránh lộ thông tin nhạy cảm).
- `userId` được lấy từ JWT payload, không cần query param.

---

### 1.6 POST /auth/change-password

**Đổi mật khẩu (khi đã đăng nhập)**

| Thuộc tính | Giá trị |
|-----------|---------|
| **Method** | `POST` |
| **URL** | `/api/v1/auth/change-password` |
| **Auth** | Bearer Token (`CUSTOMER`, `STAFF`, `ADMIN`) |
| **Content-Type** | `application/json` |

#### Request Body

| Field | Type | Bắt buộc | Validation | Mô tả |
|-------|------|----------|------------|-------|
| `currentPassword` | `string` | * | Không được rỗng | Mật khẩu hiện tại |
| `newPassword` | `string` | * | Tối thiểu 8 ký tự, gồm chữ và số | Mật khẩu mới |

```json
{
  "currentPassword": "Passw0rd123",
  "newPassword": "NewPassw0rd456"
}
```

#### Response 200 OK

```json
{
  "success": true,
  "data": null,
  "message": "Đổi mật khẩu thành công"
}
```

#### Error Codes

| HTTP | Error Code | Mô tả |
|------|-----------|-------|
| `401` | `AUTH_TOKEN_INVALID` | Token không hợp lệ |
| `400` | `USER_INVALID_PASSWORD` | Mật khẩu hiện tại không đúng |
| `422` | `VALIDATION_ERROR` | Mật khẩu mới không đủ mạnh |
| `400` | `USER_SAME_PASSWORD` | Mật khẩu mới không được trùng mật khẩu cũ |

#### Business Notes

- Xác minh `currentPassword` bằng BCrypt compare trước khi đổi.
- Sau khi đổi mật khẩu thành công, thu hồi toàn bộ refresh tokens của user đó (buộc đăng nhập lại trên tất cả thiết bị).
- Gửi email thông báo đổi mật khẩu thành công (bảo mật).
- Không cho phép đổi sang mật khẩu trùng với mật khẩu cũ.

---

### 1.7 POST /auth/forgot-password

**Yêu cầu link đặt lại mật khẩu qua email**

| Thuộc tính | Giá trị |
|-----------|---------|
| **Method** | `POST` |
| **URL** | `/api/v1/auth/forgot-password` |
| **Auth** | Public |
| **Content-Type** | `application/json` |

#### Request Body

| Field | Type | Bắt buộc | Validation | Mô tả |
|-------|------|----------|------------|-------|
| `email` | `string` | * | Định dạng email hợp lệ | Email tài khoản cần reset |

```json
{
  "email": "an.nguyen@example.com"
}
```

#### Response 200 OK

```json
{
  "success": true,
  "data": {
    "message": "Email đặt lại mật khẩu đã được gửi"
  },
  "message": "Email đặt lại mật khẩu đã được gửi"
}
```

#### Error Codes

| HTTP | Error Code | Mô tả |
|------|-----------|-------|
| `429` | `AUTH_TOO_MANY_RESET_REQUESTS` | Gửi quá nhiều yêu cầu reset trong thời gian ngắn |

#### Business Notes

- **Luôn trả về `200`** dù email có tồn tại hay không (tránh user enumeration attack).
- Nếu email tồn tại trong DB: tạo token reset (UUID, TTL = 1 giờ) lưu vào Redis, gửi email chứa link: `https://cellphones.com.vn/reset-password?token=<token>`.
- Nếu email không tồn tại: không làm gì nhưng vẫn trả về `200`.
- Rate limit: tối đa **3 yêu cầu/giờ** từ cùng 1 email hoặc IP.
- Link reset chỉ dùng được **1 lần** và hết hạn sau **1 giờ**.

---

### 1.8 POST /auth/reset-password

**Đặt lại mật khẩu bằng token từ email**

| Thuộc tính | Giá trị |
|-----------|---------|
| **Method** | `POST` |
| **URL** | `/api/v1/auth/reset-password` |
| **Auth** | Public |
| **Content-Type** | `application/json` |

#### Request Body

| Field | Type | Bắt buộc | Validation | Mô tả |
|-------|------|----------|------------|-------|
| `token` | `string` | * | Không được rỗng | Token từ link email reset |
| `newPassword` | `string` | * | Tối thiểu 8 ký tự, gồm chữ và số | Mật khẩu mới |

```json
{
  "token": "550e8400-e29b-41d4-a716-446655440000",
  "newPassword": "NewSecurePass123"
}
```

#### Response 200 OK

```json
{
  "success": true,
  "data": null,
  "message": "Đặt lại mật khẩu thành công. Vui lòng đăng nhập lại."
}
```

#### Error Codes

| HTTP | Error Code | Mô tả |
|------|-----------|-------|
| `400` | `AUTH_RESET_TOKEN_INVALID` | Token không tồn tại hoặc đã hết hạn |
| `400` | `AUTH_RESET_TOKEN_USED` | Token đã được sử dụng trước đó |
| `422` | `VALIDATION_ERROR` | Mật khẩu mới không đủ mạnh |

#### Business Notes

- Xác minh token trong Redis trước khi cho phép đổi mật khẩu.
- Sau khi đổi thành công: xoá token khỏi Redis, thu hồi toàn bộ refresh tokens của user đó.
- Cập nhật `passwordHash` trong DB bằng BCrypt hash của mật khẩu mới.
- Gửi email xác nhận đặt lại mật khẩu thành công.

---

## Section 2: User Profile (Khách Hàng)

> Tất cả endpoint trong section này có prefix: `/api/v1/users`

---

### 2.1 GET /users/me

**Lấy thông tin profile đầy đủ của bản thân**

| Thuộc tính | Giá trị |
|-----------|---------|
| **Method** | `GET` |
| **URL** | `/api/v1/users/me` |
| **Auth** | Bearer Token (bất kỳ role nào) |

#### Request Params

Không có.

#### Response 200 OK

```json
{
  "success": true,
  "data": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "fullName": "Nguyễn Văn An",
    "email": "an.nguyen@example.com",
    "phone": "0901234567",
    "role": "CUSTOMER",
    "status": "ACTIVE",
    "avatarUrl": "https://cdn.cellphones.com.vn/avatars/abc.jpg",
    "address": "123 Nguyễn Huệ, Quận 1, TP.HCM",
    "dateOfBirth": "1995-06-15",
    "gender": "MALE",
    "loyaltyPoints": 450,
    "totalOrders": 12,
    "totalSpent": 45000000,
    "lastLoginAt": "2026-05-12T08:00:00+07:00",
    "emailVerified": true,
    "phoneVerified": false,
    "createdAt": "2024-01-10T10:00:00+07:00",
    "updatedAt": "2026-05-10T14:30:00+07:00"
  },
  "message": "Thành công"
}
```

#### Error Codes

| HTTP | Error Code | Mô tả |
|------|-----------|-------|
| `401` | `AUTH_TOKEN_INVALID` | Token không hợp lệ hoặc hết hạn |

#### Business Notes

- Trả về full `User` object bao gồm cả `totalOrders`, `totalSpent` (denormalized fields).
- `passwordHash` không bao giờ được đưa vào response.
- Dùng cache Redis (TTL = 5 phút) cho user profile để giảm tải DB. Invalidate cache khi user cập nhật profile.

---

### 2.2 PATCH /users/me

**Cập nhật thông tin profile của bản thân**

| Thuộc tính | Giá trị |
|-----------|---------|
| **Method** | `PATCH` |
| **URL** | `/api/v1/users/me` |
| **Auth** | Bearer Token (`CUSTOMER`) |
| **Content-Type** | `application/json` |

#### Request Body

Tất cả fields đều tuỳ chọn. Chỉ gửi fields cần cập nhật.

| Field | Type | Bắt buộc | Validation | Mô tả |
|-------|------|----------|------------|-------|
| `fullName` | `string` | ? | 2–100 ký tự | Họ và tên |
| `phone` | `string` | ? | 10–11 chữ số Việt Nam | Số điện thoại |
| `address` | `string` | ? | Tối đa 500 ký tự | Địa chỉ thường trú |
| `dateOfBirth` | `date` | ? | Định dạng YYYY-MM-DD, không được là ngày tương lai | Ngày sinh |
| `gender` | `enum` | ? | `MALE` \| `FEMALE` \| `OTHER` | Giới tính |
| `avatarUrl` | `string` | ? | URL hợp lệ | URL ảnh đại diện |

```json
{
  "fullName": "Nguyễn Văn An Updated",
  "phone": "0909876543",
  "dateOfBirth": "1995-06-15",
  "gender": "MALE"
}
```

#### Response 200 OK

Trả về `User` object đã được cập nhật (xem schema tại mục 2.1).

```json
{
  "success": true,
  "data": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "fullName": "Nguyễn Văn An Updated",
    "phone": "0909876543",
    ...
  },
  "message": "Cập nhật thông tin thành công"
}
```

#### Error Codes

| HTTP | Error Code | Mô tả |
|------|-----------|-------|
| `401` | `AUTH_TOKEN_INVALID` | Token không hợp lệ |
| `403` | `AUTH_FORBIDDEN` | Không có quyền cập nhật (không phải CUSTOMER) |
| `409` | `USER_PHONE_ALREADY_EXISTS` | Số điện thoại đã được dùng bởi tài khoản khác |
| `422` | `VALIDATION_ERROR` | Dữ liệu không hợp lệ |

#### Business Notes

- Không cho phép cập nhật `email` và `role` qua endpoint này (phải qua flow riêng hoặc admin).
- Nếu thay đổi `phone`, cần đặt lại `phoneVerified = false` và gửi OTP xác minh (tuỳ yêu cầu v2).
- Invalidate Redis cache sau khi cập nhật thành công.
- Chỉ áp dụng partial update: chỉ những field được gửi mới bị thay đổi.

---

### 2.3 POST /users/me/avatar

**Upload ảnh đại diện**

| Thuộc tính | Giá trị |
|-----------|---------|
| **Method** | `POST` |
| **URL** | `/api/v1/users/me/avatar` |
| **Auth** | Bearer Token (bất kỳ role nào) |
| **Content-Type** | `multipart/form-data` |

#### Request Body (multipart/form-data)

| Field | Type | Bắt buộc | Validation | Mô tả |
|-------|------|----------|------------|-------|
| `file` | `File` | * | JPG/PNG/WEBP, tối đa 5MB | File ảnh đại diện |

#### Response 200 OK

```json
{
  "success": true,
  "data": {
    "avatarUrl": "https://cdn.cellphones.com.vn/avatars/a1b2c3d4-e5f6.jpg"
  },
  "message": "Upload ảnh đại diện thành công"
}
```

#### Error Codes

| HTTP | Error Code | Mô tả |
|------|-----------|-------|
| `401` | `AUTH_TOKEN_INVALID` | Token không hợp lệ |
| `400` | `FILE_INVALID_TYPE` | Định dạng file không được hỗ trợ (chỉ chấp nhận JPG, PNG, WEBP) |
| `400` | `FILE_TOO_LARGE` | File vượt quá 5MB |
| `500` | `FILE_UPLOAD_FAILED` | Lỗi khi upload lên CDN/storage |

#### Business Notes

- Resize ảnh về `400x400 px` trước khi lưu, giữ tỉ lệ khung hình.
- Lưu file vào **S3 / MinIO / Cloud Storage**, cập nhật `avatarUrl` trong bảng `users`.
- File cũ được giữ lại trong storage (để tránh broken link nếu có cache) hoặc xoá ngay tuỳ chính sách.
- Tên file lưu trữ: `{userId}-{timestamp}.{ext}` để tránh xung đột.
- Invalidate Redis cache của user sau khi cập nhật thành công.

---

## Section 3: Shipping Addresses (Địa Chỉ Giao Hàng)

> Tất cả endpoint trong section này có prefix: `/api/v1/users/me/addresses`

---

### 3.1 GET /users/me/addresses

**Lấy danh sách tất cả địa chỉ giao hàng của user hiện tại**

| Thuộc tính | Giá trị |
|-----------|---------|
| **Method** | `GET` |
| **URL** | `/api/v1/users/me/addresses` |
| **Auth** | Bearer Token (`CUSTOMER`) |

#### Request Params

Không có.

#### Response 200 OK

```json
{
  "success": true,
  "data": [
    {
      "id": "addr-uuid-001",
      "userId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "label": "Nhà",
      "fullName": "Nguyễn Văn An",
      "phone": "0901234567",
      "address": "123 Nguyễn Huệ",
      "ward": "Phường Bến Nghé",
      "district": "Quận 1",
      "city": "TP. Hồ Chí Minh",
      "country": "Việt Nam",
      "postalCode": "700000",
      "type": "HOME",
      "isDefault": true,
      "notes": "Gọi trước khi giao",
      "createdAt": "2024-01-15T10:00:00+07:00",
      "updatedAt": "2026-03-20T08:30:00+07:00"
    },
    {
      "id": "addr-uuid-002",
      "userId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "label": "Văn phòng",
      "fullName": "Nguyễn Văn An",
      "phone": "0901234567",
      "address": "456 Lê Lợi, Lầu 5",
      "ward": "Phường Bến Thành",
      "district": "Quận 1",
      "city": "TP. Hồ Chí Minh",
      "country": "Việt Nam",
      "postalCode": null,
      "type": "OFFICE",
      "isDefault": false,
      "notes": null,
      "createdAt": "2025-02-01T09:00:00+07:00",
      "updatedAt": "2025-02-01T09:00:00+07:00"
    }
  ],
  "message": "Thành công"
}
```

#### Error Codes

| HTTP | Error Code | Mô tả |
|------|-----------|-------|
| `401` | `AUTH_TOKEN_INVALID` | Token không hợp lệ |

#### Business Notes

- Địa chỉ mặc định (`isDefault = true`) luôn được xếp đầu tiên trong danh sách.
- Không phân trang vì số lượng địa chỉ của 1 user thường nhỏ (giới hạn tối đa **10 địa chỉ/user**).

---

### 3.2 POST /users/me/addresses

**Thêm địa chỉ giao hàng mới**

| Thuộc tính | Giá trị |
|-----------|---------|
| **Method** | `POST` |
| **URL** | `/api/v1/users/me/addresses` |
| **Auth** | Bearer Token (`CUSTOMER`) |
| **Content-Type** | `application/json` |

#### Request Body

| Field | Type | Bắt buộc | Validation | Mô tả |
|-------|------|----------|------------|-------|
| `label` | `string` | * | 1–50 ký tự | Nhãn địa chỉ (vd: "Nhà", "Văn phòng") |
| `fullName` | `string` | * | 2–100 ký tự | Tên người nhận |
| `phone` | `string` | * | 10–11 chữ số Việt Nam | SĐT người nhận |
| `address` | `string` | * | 5–200 ký tự | Số nhà, tên đường |
| `ward` | `string` | * | 1–100 ký tự | Phường/Xã |
| `district` | `string` | * | 1–100 ký tự | Quận/Huyện |
| `city` | `string` | * | 1–100 ký tự | Tỉnh/Thành phố |
| `country` | `string` | ? | Default: "Việt Nam" | Quốc gia |
| `postalCode` | `string` | ? | 5–10 chữ số | Mã bưu chính |
| `type` | `enum` | ? | `HOME` \| `OFFICE` \| `OTHER` | Loại địa chỉ |
| `isDefault` | `boolean` | ? | Default: false | Đặt làm địa chỉ mặc định |
| `notes` | `string` | ? | Tối đa 500 ký tự | Ghi chú cho người giao hàng |

```json
{
  "label": "Nhà",
  "fullName": "Nguyễn Văn An",
  "phone": "0901234567",
  "address": "123 Nguyễn Huệ",
  "ward": "Phường Bến Nghé",
  "district": "Quận 1",
  "city": "TP. Hồ Chí Minh",
  "country": "Việt Nam",
  "postalCode": "700000",
  "type": "HOME",
  "isDefault": true,
  "notes": "Gọi trước khi giao 30 phút"
}
```

#### Response 201 Created

Trả về `ShippingAddress` object vừa được tạo (xem schema tại Shared Schemas).

```json
{
  "success": true,
  "data": {
    "id": "addr-uuid-003",
    "userId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "label": "Nhà",
    "fullName": "Nguyễn Văn An",
    "phone": "0901234567",
    "address": "123 Nguyễn Huệ",
    "ward": "Phường Bến Nghé",
    "district": "Quận 1",
    "city": "TP. Hồ Chí Minh",
    "country": "Việt Nam",
    "postalCode": "700000",
    "type": "HOME",
    "isDefault": true,
    "notes": "Gọi trước khi giao 30 phút",
    "createdAt": "2026-05-12T10:00:00+07:00",
    "updatedAt": "2026-05-12T10:00:00+07:00"
  },
  "message": "Thêm địa chỉ thành công"
}
```

#### Error Codes

| HTTP | Error Code | Mô tả |
|------|-----------|-------|
| `401` | `AUTH_TOKEN_INVALID` | Token không hợp lệ |
| `400` | `ADDRESS_LIMIT_EXCEEDED` | Đã đạt giới hạn tối đa 10 địa chỉ |
| `422` | `VALIDATION_ERROR` | Dữ liệu không hợp lệ |

#### Business Notes

- Nếu `isDefault = true`: tự động unset `isDefault = false` trên tất cả địa chỉ khác của user này (trong cùng 1 DB transaction).
- Nếu đây là địa chỉ đầu tiên của user: tự động set `isDefault = true` bất kể giá trị truyền vào.
- Giới hạn tối đa **10 địa chỉ/user**. Nếu vượt quá, trả về lỗi `ADDRESS_LIMIT_EXCEEDED`.

---

### 3.3 GET /users/me/addresses/:id

**Lấy thông tin một địa chỉ cụ thể**

| Thuộc tính | Giá trị |
|-----------|---------|
| **Method** | `GET` |
| **URL** | `/api/v1/users/me/addresses/:id` |
| **Auth** | Bearer Token (`CUSTOMER`, chỉ xem địa chỉ của chính mình) |

#### Request Path Params

| Param | Type | Bắt buộc | Mô tả |
|-------|------|----------|-------|
| `id` | `UUID` | * | ID của địa chỉ cần xem |

#### Response 200 OK

Trả về `ShippingAddress` object (xem schema tại Shared Schemas).

```json
{
  "success": true,
  "data": {
    "id": "addr-uuid-001",
    "userId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "label": "Nhà",
    ...
  },
  "message": "Thành công"
}
```

#### Error Codes

| HTTP | Error Code | Mô tả |
|------|-----------|-------|
| `401` | `AUTH_TOKEN_INVALID` | Token không hợp lệ |
| `403` | `AUTH_FORBIDDEN` | Địa chỉ không thuộc về user hiện tại |
| `404` | `ADDRESS_NOT_FOUND` | Không tìm thấy địa chỉ với ID này |

#### Business Notes

- Kiểm tra `userId` của address phải khớp với `userId` từ JWT. Nếu không khớp, trả về `403` (không phải `404`) để tránh lộ thông tin.

---

### 3.4 PATCH /users/me/addresses/:id

**Cập nhật thông tin một địa chỉ**

| Thuộc tính | Giá trị |
|-----------|---------|
| **Method** | `PATCH` |
| **URL** | `/api/v1/users/me/addresses/:id` |
| **Auth** | Bearer Token (`CUSTOMER`, chỉ sửa địa chỉ của chính mình) |
| **Content-Type** | `application/json` |

#### Request Path Params

| Param | Type | Bắt buộc | Mô tả |
|-------|------|----------|-------|
| `id` | `UUID` | * | ID của địa chỉ cần cập nhật |

#### Request Body

Tất cả fields đều tuỳ chọn. Tương tự Request Body của POST (mục 3.2), tất cả fields trở thành optional.

```json
{
  "label": "Nhà riêng",
  "notes": "Gọi trước 30 phút, nhận hàng buổi chiều"
}
```

#### Response 200 OK

Trả về `ShippingAddress` object đã cập nhật.

```json
{
  "success": true,
  "data": {
    "id": "addr-uuid-001",
    "label": "Nhà riêng",
    "notes": "Gọi trước 30 phút, nhận hàng buổi chiều",
    ...
  },
  "message": "Cập nhật địa chỉ thành công"
}
```

#### Error Codes

| HTTP | Error Code | Mô tả |
|------|-----------|-------|
| `401` | `AUTH_TOKEN_INVALID` | Token không hợp lệ |
| `403` | `AUTH_FORBIDDEN` | Địa chỉ không thuộc về user hiện tại |
| `404` | `ADDRESS_NOT_FOUND` | Không tìm thấy địa chỉ |
| `422` | `VALIDATION_ERROR` | Dữ liệu không hợp lệ |

#### Business Notes

- Tương tự POST: nếu cập nhật `isDefault = true`, tự động unset các địa chỉ khác của user.
- Partial update: chỉ cập nhật các field được gửi lên.

---

### 3.5 DELETE /users/me/addresses/:id

**Xoá một địa chỉ giao hàng**

| Thuộc tính | Giá trị |
|-----------|---------|
| **Method** | `DELETE` |
| **URL** | `/api/v1/users/me/addresses/:id` |
| **Auth** | Bearer Token (`CUSTOMER`) |

#### Request Path Params

| Param | Type | Bắt buộc | Mô tả |
|-------|------|----------|-------|
| `id` | `UUID` | * | ID của địa chỉ cần xoá |

#### Response 204 No Content

Không có body trả về.

#### Error Codes

| HTTP | Error Code | Mô tả |
|------|-----------|-------|
| `401` | `AUTH_TOKEN_INVALID` | Token không hợp lệ |
| `403` | `AUTH_FORBIDDEN` | Địa chỉ không thuộc về user hiện tại |
| `404` | `ADDRESS_NOT_FOUND` | Không tìm thấy địa chỉ |
| `400` | `ADDRESS_CANNOT_DELETE_ONLY` | Không thể xoá địa chỉ duy nhất |
| `400` | `ADDRESS_IN_USE` | Địa chỉ đang được dùng trong đơn hàng đang xử lý |

#### Business Notes

- Không cho phép xoá nếu đây là địa chỉ **duy nhất** của user.
- Không cho phép xoá nếu địa chỉ đang được liên kết với đơn hàng ở trạng thái `PENDING` hoặc `PROCESSING` (kiểm tra FK trong bảng `orders`).
- Nếu xoá địa chỉ mặc định, cần tự động set địa chỉ mới nhất còn lại làm mặc định.
- **Hard delete** vì dữ liệu giao hàng trong `orders` lưu snapshot địa chỉ riêng, không phụ thuộc FK.

---

### 3.6 PATCH /users/me/addresses/:id/set-default

**Đặt một địa chỉ làm địa chỉ giao hàng mặc định**

| Thuộc tính | Giá trị |
|-----------|---------|
| **Method** | `PATCH` |
| **URL** | `/api/v1/users/me/addresses/:id/set-default` |
| **Auth** | Bearer Token (`CUSTOMER`) |

#### Request Path Params

| Param | Type | Bắt buộc | Mô tả |
|-------|------|----------|-------|
| `id` | `UUID` | * | ID của địa chỉ cần đặt làm mặc định |

#### Request Body

Không có body.

#### Response 200 OK

Trả về `ShippingAddress` object đã được cập nhật.

```json
{
  "success": true,
  "data": {
    "id": "addr-uuid-002",
    "isDefault": true,
    ...
  },
  "message": "Đặt địa chỉ mặc định thành công"
}
```

#### Error Codes

| HTTP | Error Code | Mô tả |
|------|-----------|-------|
| `401` | `AUTH_TOKEN_INVALID` | Token không hợp lệ |
| `403` | `AUTH_FORBIDDEN` | Địa chỉ không thuộc về user hiện tại |
| `404` | `ADDRESS_NOT_FOUND` | Không tìm thấy địa chỉ |

#### Business Notes

- Trong cùng 1 DB transaction: set `isDefault = false` cho tất cả địa chỉ của user, sau đó set `isDefault = true` cho địa chỉ được chỉ định.
- Nếu địa chỉ đã là mặc định, vẫn trả về `200` (idempotent).

---

## Section 4: Admin - Quản Lý Người Dùng

> Tất cả endpoint trong section này có prefix: `/api/v1/admin/users`
> Yêu cầu: Bearer Token với `role = ADMIN`

---

### 4.1 GET /admin/users

**Lấy danh sách người dùng (có phân trang và bộ lọc)**

| Thuộc tính | Giá trị |
|-----------|---------|
| **Method** | `GET` |
| **URL** | `/api/v1/admin/users` |
| **Auth** | Bearer Token (`ADMIN`) |

#### Request Query Params

| Param | Type | Bắt buộc | Default | Mô tả |
|-------|------|----------|---------|-------|
| `page` | `int` | ? | `1` | Số trang (bắt đầu từ 1) |
| `pageSize` | `int` | ? | `20` | Số bản ghi/trang (max: 100) |
| `sortBy` | `string` | ? | `createdAt` | Field sắp xếp: `createdAt`, `fullName`, `email`, `totalSpent`, `loyaltyPoints` |
| `sortDir` | `string` | ? | `desc` | Chiều sắp xếp: `asc` \| `desc` |
| `role` | `enum` | ? | _(tất cả)_ | Lọc theo role: `CUSTOMER` \| `ADMIN` \| `STAFF` |
| `status` | `enum` | ? | _(tất cả)_ | Lọc theo trạng thái: `ACTIVE` \| `LOCKED` \| `PENDING_VERIFY` |
| `search` | `string` | ? | _(không lọc)_ | Tìm kiếm theo `fullName`, `email`, hoặc `phone` (ILIKE, không phân biệt hoa thường) |

**Ví dụ URL:**
```
GET /api/v1/admin/users?page=1&pageSize=20&role=CUSTOMER&status=ACTIVE&search=nguyen&sortBy=createdAt&sortDir=desc
```

#### Response 200 OK

```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        "fullName": "Nguyễn Văn An",
        "email": "an.nguyen@example.com",
        "phone": "0901234567",
        "role": "CUSTOMER",
        "status": "ACTIVE",
        "avatarUrl": "https://cdn.cellphones.com.vn/avatars/abc.jpg",
        "loyaltyPoints": 450,
        "totalOrders": 12,
        "totalSpent": 45000000,
        "emailVerified": true,
        "phoneVerified": false,
        "lastLoginAt": "2026-05-12T08:00:00+07:00",
        "createdAt": "2024-01-10T10:00:00+07:00",
        "updatedAt": "2026-05-10T14:30:00+07:00"
      }
    ],
    "page": 1,
    "pageSize": 20,
    "total": 1523,
    "totalPages": 77
  },
  "message": "Thành công"
}
```

#### Error Codes

| HTTP | Error Code | Mô tả |
|------|-----------|-------|
| `401` | `AUTH_TOKEN_INVALID` | Token không hợp lệ |
| `403` | `AUTH_FORBIDDEN` | Không có quyền ADMIN |
| `422` | `VALIDATION_ERROR` | Tham số query không hợp lệ |

#### Business Notes

- `search` tìm kiếm trên cả 3 field (`fullName`, `email`, `phone`) bằng `ILIKE '%keyword%'` (PostgreSQL).
- Cân nhắc đánh index `GIN` hoặc `pg_trgm` trên các field tìm kiếm nếu dữ liệu lớn.
- `passwordHash` không bao giờ trả về trong response.
- Có thể kết hợp nhiều filter cùng lúc (AND logic).

---

### 4.2 GET /admin/users/:id

**Xem chi tiết thông tin một người dùng**

| Thuộc tính | Giá trị |
|-----------|---------|
| **Method** | `GET` |
| **URL** | `/api/v1/admin/users/:id` |
| **Auth** | Bearer Token (`ADMIN`) |

#### Request Path Params

| Param | Type | Bắt buộc | Mô tả |
|-------|------|----------|-------|
| `id` | `UUID` | * | ID của user cần xem |

#### Response 200 OK

Trả về full `User` object (xem schema tại Shared Schemas — User Object).

```json
{
  "success": true,
  "data": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "fullName": "Nguyễn Văn An",
    "email": "an.nguyen@example.com",
    "phone": "0901234567",
    "role": "CUSTOMER",
    "status": "ACTIVE",
    "avatarUrl": "https://cdn.cellphones.com.vn/avatars/abc.jpg",
    "address": "123 Nguyễn Huệ, Quận 1, TP.HCM",
    "dateOfBirth": "1995-06-15",
    "gender": "MALE",
    "loyaltyPoints": 450,
    "totalOrders": 12,
    "totalSpent": 45000000,
    "lastLoginAt": "2026-05-12T08:00:00+07:00",
    "emailVerified": true,
    "phoneVerified": false,
    "createdAt": "2024-01-10T10:00:00+07:00",
    "updatedAt": "2026-05-10T14:30:00+07:00"
  },
  "message": "Thành công"
}
```

#### Error Codes

| HTTP | Error Code | Mô tả |
|------|-----------|-------|
| `401` | `AUTH_TOKEN_INVALID` | Token không hợp lệ |
| `403` | `AUTH_FORBIDDEN` | Không có quyền ADMIN |
| `404` | `USER_NOT_FOUND` | Không tìm thấy user với ID này |

#### Business Notes

- `passwordHash` không bao giờ trả về trong response.
- Admin có thể xem tất cả user, kể cả các user có `status = LOCKED`.

---

### 4.3 PATCH /admin/users/:id

**Cập nhật thông tin người dùng (Admin)**

| Thuộc tính | Giá trị |
|-----------|---------|
| **Method** | `PATCH` |
| **URL** | `/api/v1/admin/users/:id` |
| **Auth** | Bearer Token (`ADMIN`) |
| **Content-Type** | `application/json` |

#### Request Path Params

| Param | Type | Bắt buộc | Mô tả |
|-------|------|----------|-------|
| `id` | `UUID` | * | ID của user cần cập nhật |

#### Request Body

Tất cả fields đều tuỳ chọn.

| Field | Type | Bắt buộc | Validation | Mô tả |
|-------|------|----------|------------|-------|
| `fullName` | `string` | ? | 2–100 ký tự | Họ và tên |
| `phone` | `string` | ? | 10–11 chữ số | Số điện thoại |
| `role` | `enum` | ? | `CUSTOMER` \| `ADMIN` \| `STAFF` | Vai trò |
| `address` | `string` | ? | Tối đa 500 ký tự | Địa chỉ thường trú |
| `gender` | `enum` | ? | `MALE` \| `FEMALE` \| `OTHER` | Giới tính |
| `dateOfBirth` | `date` | ? | YYYY-MM-DD | Ngày sinh |

```json
{
  "role": "STAFF",
  "fullName": "Nguyễn Văn An (Staff)"
}
```

#### Response 200 OK

Trả về `User` object đã cập nhật.

```json
{
  "success": true,
  "data": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "role": "STAFF",
    "fullName": "Nguyễn Văn An (Staff)",
    ...
  },
  "message": "Cập nhật người dùng thành công"
}
```

#### Error Codes

| HTTP | Error Code | Mô tả |
|------|-----------|-------|
| `401` | `AUTH_TOKEN_INVALID` | Token không hợp lệ |
| `403` | `AUTH_FORBIDDEN` | Không có quyền ADMIN |
| `404` | `USER_NOT_FOUND` | Không tìm thấy user |
| `409` | `USER_PHONE_ALREADY_EXISTS` | SĐT đã dùng bởi user khác |
| `422` | `VALIDATION_ERROR` | Dữ liệu không hợp lệ |

#### Business Notes

- Admin không được cập nhật `email` và `passwordHash` qua endpoint này.
- Nếu thay đổi `role`, cần log lại thay đổi vào audit log (`admin_audit_logs`).
- Admin không được thay đổi `role` của chính mình qua endpoint này (tránh leo thang đặc quyền tự gán).
- Invalidate Redis cache của user sau khi cập nhật.

---

### 4.4 PATCH /admin/users/:id/status

**Cập nhật trạng thái tài khoản người dùng**

| Thuộc tính | Giá trị |
|-----------|---------|
| **Method** | `PATCH` |
| **URL** | `/api/v1/admin/users/:id/status` |
| **Auth** | Bearer Token (`ADMIN`) |
| **Content-Type** | `application/json` |

#### Request Path Params

| Param | Type | Bắt buộc | Mô tả |
|-------|------|----------|-------|
| `id` | `UUID` | * | ID của user cần thay đổi trạng thái |

#### Request Body

| Field | Type | Bắt buộc | Validation | Mô tả |
|-------|------|----------|------------|-------|
| `status` | `enum` | * | `ACTIVE` \| `LOCKED` \| `PENDING_VERIFY` | Trạng thái mới |
| `reason` | `string` | ? | Tối đa 500 ký tự | Lý do thay đổi (nên điền khi khoá tài khoản) |

```json
{
  "status": "LOCKED",
  "reason": "Vi phạm điều khoản sử dụng: spam đánh giá sản phẩm"
}
```

#### Response 200 OK

```json
{
  "success": true,
  "data": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "status": "LOCKED",
    ...
  },
  "message": "Cập nhật trạng thái tài khoản thành công"
}
```

#### Error Codes

| HTTP | Error Code | Mô tả |
|------|-----------|-------|
| `401` | `AUTH_TOKEN_INVALID` | Token không hợp lệ |
| `403` | `AUTH_FORBIDDEN` | Không có quyền ADMIN |
| `403` | `ADMIN_CANNOT_LOCK_SELF` | Admin không thể khoá tài khoản của chính mình |
| `404` | `USER_NOT_FOUND` | Không tìm thấy user |
| `422` | `VALIDATION_ERROR` | Status không hợp lệ |

#### Business Notes

- Khi set `status = LOCKED`: tự động thu hồi toàn bộ refresh tokens của user đó (họ bị buộc logout trên tất cả thiết bị).
- Thêm `access_token` của user đó vào Redis blacklist nếu có thể (cần lưu `jti` của active tokens).
- Ghi audit log vào `admin_audit_logs` với `action`, `reason`, `adminId`, `targetUserId`, `timestamp`.
- Gửi email thông báo đến user khi tài khoản bị khoá (kèm lý do nếu có).
- Admin không thể thay đổi status của chính mình.

---

### 4.5 DELETE /admin/users/:id

**Xoá mềm tài khoản người dùng**

| Thuộc tính | Giá trị |
|-----------|---------|
| **Method** | `DELETE` |
| **URL** | `/api/v1/admin/users/:id` |
| **Auth** | Bearer Token (`ADMIN`) |

#### Request Path Params

| Param | Type | Bắt buộc | Mô tả |
|-------|------|----------|-------|
| `id` | `UUID` | * | ID của user cần xoá |

#### Response 204 No Content

Không có body trả về.

#### Error Codes

| HTTP | Error Code | Mô tả |
|------|-----------|-------|
| `401` | `AUTH_TOKEN_INVALID` | Token không hợp lệ |
| `403` | `AUTH_FORBIDDEN` | Không có quyền ADMIN |
| `403` | `ADMIN_CANNOT_DELETE_SELF` | Admin không thể xoá tài khoản của chính mình |
| `404` | `USER_NOT_FOUND` | Không tìm thấy user |
| `400` | `USER_HAS_ACTIVE_ORDERS` | User có đơn hàng đang xử lý, không thể xoá |

#### Business Notes

- Đây là **soft delete**: set `status = LOCKED`, không xoá dữ liệu khỏi DB để bảo toàn lịch sử đơn hàng, giao dịch.
- Thu hồi toàn bộ refresh tokens của user.
- Ghi audit log.
- Không cho phép xoá nếu user có đơn hàng ở trạng thái `PENDING`, `PROCESSING`, hoặc `SHIPPED`.
- Admin không thể tự xoá tài khoản của mình qua API này.

---

## Section 5: Customer Dashboard Stats

> Endpoint lấy thống kê tổng hợp cho dashboard cá nhân của khách hàng.

---

### 5.1 GET /users/me/stats

**Lấy thống kê cá nhân trên dashboard của khách hàng**

| Thuộc tính | Giá trị |
|-----------|---------|
| **Method** | `GET` |
| **URL** | `/api/v1/users/me/stats` |
| **Auth** | Bearer Token (`CUSTOMER`) |

#### Request Params

Không có.

#### Response 200 OK

```json
{
  "success": true,
  "data": {
    "totalOrders": 12,
    "totalSpent": 45000000,
    "loyaltyPoints": 450,
    "pendingOrders": 2,
    "completedOrders": 8,
    "warrantyItems": 3
  },
  "message": "Thành công"
}
```

#### Response Schema

| Field | Type | Mô tả |
|-------|------|-------|
| `totalOrders` | `int` | Tổng số đơn hàng đã đặt (tất cả trạng thái) |
| `totalSpent` | `long` | Tổng tiền đã chi tiêu (VND), chỉ tính đơn đã hoàn thành |
| `loyaltyPoints` | `int` | Điểm tích luỹ hiện có |
| `pendingOrders` | `int` | Số đơn đang chờ xử lý hoặc đang giao (`PENDING`, `PROCESSING`, `SHIPPED`) |
| `completedOrders` | `int` | Số đơn đã hoàn thành (`DELIVERED`) |
| `warrantyItems` | `int` | Số sản phẩm đang trong thời hạn bảo hành |

#### Error Codes

| HTTP | Error Code | Mô tả |
|------|-----------|-------|
| `401` | `AUTH_TOKEN_INVALID` | Token không hợp lệ |
| `403` | `AUTH_FORBIDDEN` | Không phải CUSTOMER |

#### Business Notes

- `totalOrders` và `totalSpent` có thể đọc từ denormalized fields trên bảng `users` (để tránh aggregate query nặng) hoặc query trực tiếp từ bảng `orders`.
- `pendingOrders` = COUNT orders WHERE `status IN ('PENDING', 'PROCESSING', 'SHIPPED')` AND `userId = currentUserId`.
- `completedOrders` = COUNT orders WHERE `status = 'DELIVERED'` AND `userId = currentUserId`.
- `warrantyItems` = COUNT warranty_records WHERE `userId = currentUserId` AND `expiryDate >= NOW()`.
- Cache kết quả trong Redis với TTL = **2 phút** (dữ liệu không cần realtime tuyệt đối).
- Invalidate cache khi có đơn hàng mới hoặc trạng thái đơn thay đổi.

---

## Phụ lục: JWT Token Specification

### Access Token Payload

```json
{
  "sub": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "email": "an.nguyen@example.com",
  "role": "CUSTOMER",
  "jti": "unique-token-id-uuid",
  "iat": 1747011600,
  "exp": 1747012500
}
```

| Claim | Mô tả |
|-------|-------|
| `sub` | User ID (UUID) |
| `email` | Email người dùng |
| `role` | Role: `CUSTOMER` \| `ADMIN` \| `STAFF` |
| `jti` | JWT ID duy nhất (dùng cho blacklist) |
| `iat` | Issued At (Unix timestamp) |
| `exp` | Expiration (Unix timestamp, `iat + 900s`) |

### Token Lifecycle

| Token | Thời hạn | Lưu trữ (Frontend) | Lưu trữ (Backend) |
|-------|---------|---------------------|-------------------|
| `accessToken` | 15 phút | Memory / sessionStorage | Redis blacklist (khi logout) |
| `refreshToken` | 30 ngày | HttpOnly Cookie hoặc localStorage | Bảng `refresh_tokens` (DB) |

### Spring Security Integration Notes

```java
// SecurityFilterChain config gợi ý
@Bean
public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    http
        .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        .authorizeHttpRequests(auth -> auth
            .requestMatchers("/api/v1/auth/register", "/api/v1/auth/login",
                             "/api/v1/auth/refresh", "/api/v1/auth/forgot-password",
                             "/api/v1/auth/reset-password").permitAll()
            .requestMatchers("/api/v1/admin/**").hasRole("ADMIN")
            .anyRequest().authenticated()
        )
        .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
    return http.build();
}
```

---

## Phụ lục: Error Codes Reference (Auth & User)

> Danh sách đầy đủ tại `12-error-codes.md`. Dưới đây là các mã lỗi liên quan đến module này.

| Error Code | HTTP Status | Mô tả |
|-----------|-------------|-------|
| `AUTH_TOKEN_INVALID` | `401` | Access token không hợp lệ hoặc hết hạn |
| `AUTH_TOKEN_MISSING` | `401` | Không có token trong header `Authorization` |
| `AUTH_REFRESH_TOKEN_INVALID` | `401` | Refresh token không hợp lệ, hết hạn, hoặc đã bị thu hồi |
| `AUTH_INVALID_CREDENTIALS` | `401` | Email hoặc mật khẩu không đúng |
| `AUTH_ACCOUNT_LOCKED` | `403` | Tài khoản bị khoá |
| `AUTH_ACCOUNT_PENDING` | `403` | Tài khoản chờ xác minh email |
| `AUTH_FORBIDDEN` | `403` | Không có quyền thực hiện hành động này |
| `AUTH_TOO_MANY_ATTEMPTS` | `429` | Đăng nhập sai quá nhiều lần |
| `AUTH_TOO_MANY_RESET_REQUESTS` | `429` | Gửi yêu cầu reset password quá nhiều lần |
| `AUTH_RESET_TOKEN_INVALID` | `400` | Token reset password không hợp lệ hoặc hết hạn |
| `AUTH_RESET_TOKEN_USED` | `400` | Token reset password đã được sử dụng |
| `USER_NOT_FOUND` | `404` | Không tìm thấy người dùng |
| `USER_EMAIL_ALREADY_EXISTS` | `409` | Email đã được sử dụng |
| `USER_PHONE_ALREADY_EXISTS` | `409` | Số điện thoại đã được sử dụng |
| `USER_INVALID_PASSWORD` | `400` | Mật khẩu hiện tại không đúng |
| `USER_SAME_PASSWORD` | `400` | Mật khẩu mới không được trùng mật khẩu cũ |
| `USER_HAS_ACTIVE_ORDERS` | `400` | User có đơn hàng đang xử lý |
| `ADDRESS_NOT_FOUND` | `404` | Không tìm thấy địa chỉ giao hàng |
| `ADDRESS_LIMIT_EXCEEDED` | `400` | Đã đạt giới hạn tối đa 10 địa chỉ |
| `ADDRESS_CANNOT_DELETE_ONLY` | `400` | Không thể xoá địa chỉ duy nhất |
| `ADDRESS_IN_USE` | `400` | Địa chỉ đang được dùng trong đơn hàng đang xử lý |
| `FILE_INVALID_TYPE` | `400` | Định dạng file không được hỗ trợ |
| `FILE_TOO_LARGE` | `400` | Kích thước file vượt quá giới hạn |
| `FILE_UPLOAD_FAILED` | `500` | Lỗi khi upload file lên storage |
| `ADMIN_CANNOT_LOCK_SELF` | `403` | Admin không thể khoá tài khoản của chính mình |
| `ADMIN_CANNOT_DELETE_SELF` | `403` | Admin không thể xoá tài khoản của chính mình |
| `VALIDATION_ERROR` | `422` | Dữ liệu đầu vào không hợp lệ (kèm chi tiết field lỗi) |

---

*Tài liệu này là phần của bộ BA Docs cho CELLPHONES eCommerce Platform. Xem thêm: `01-domain-entities.md`, `02-database-design.md`, `12-error-codes.md`.*

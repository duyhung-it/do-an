# 11. Phân Quyền và Bảo Mật (RBAC & Security)

> **Dự án:** B2B eCommerce Platform
> **Phiên bản:** 1.0
> **Ngày cập nhật:** 2026-05-12
> **Tác giả:** BA Team

---

## 1. Xác Thực (Authentication) với JWT

### 1.1. Luồng Đăng Nhập

```
Client                          API Server                        Database
  |                                  |                                |
  |-- POST /api/v1/auth/login ------->|                                |
  |   { email, password }            |                                |
  |                                  |-- Kiểm tra email ------------->|
  |                                  |<-- Trả về thông tin user ------|
  |                                  |-- Xác minh bcrypt password     |
  |                                  |-- Tạo accessToken (JWT RS256)  |
  |                                  |-- Tạo refreshToken (opaque)    |
  |                                  |-- Lưu refreshToken vào DB ---->|
  |<-- 200 OK ------------------------|                                |
  |   { accessToken,                 |                                |
  |     refreshToken,                |                                |
  |     user: { id, email, role } }  |                                |
```

**Request:**
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "d4f8a2b1c3e5f7890a1b2c3d4e5f67890abcdef",
    "user": {
      "id": "usr_01HXYZ...",
      "email": "user@example.com",
      "fullName": "Nguyễn Văn A",
      "role": "CUSTOMER",
      "status": "ACTIVE"
    }
  }
}
```

---

### 1.2. Access Token (JWT RS256)

| Thuộc tính | Giá trị |
|-----------|---------|
| Thuật toán ký | RS256 (asymmetric — private key ký, public key xác minh) |
| Thời hạn sống | 1 giờ (3600 giây) |
| Lưu trữ phía client | Memory hoặc sessionStorage (không dùng localStorage) |

**Payload chuẩn:**
```json
{
  "sub": "usr_01HXYZ123456",
  "email": "user@example.com",
  "role": "CUSTOMER",
  "status": "ACTIVE",
  "iat": 1705312200,
  "exp": 1705315800
}
```

| Field | Mô tả |
|-------|-------|
| `sub` | User ID (subject) |
| `email` | Email người dùng |
| `role` | Vai trò: CUSTOMER / ADMIN / STAFF |
| `status` | Trạng thái tài khoản: ACTIVE / LOCKED / PENDING |
| `iat` | Thời điểm tạo token (issued at) |
| `exp` | Thời điểm hết hạn (expiry) |

> **Lưu ý bảo mật:** Không lưu thông tin nhạy cảm (password, số thẻ, v.v.) trong JWT payload vì payload chỉ được encode (Base64), không được mã hóa.

---

### 1.3. Refresh Token

| Thuộc tính | Giá trị |
|-----------|---------|
| Loại | Opaque token (chuỗi ngẫu nhiên 64 ký tự hex) |
| Thời hạn sống | 7 ngày |
| Lưu trữ phía server | Bảng `refresh_tokens` trong Database |
| Lưu trữ phía client | HTTP-only Secure Cookie hoặc secure storage |

**Schema bảng `refresh_tokens`:**
```sql
CREATE TABLE refresh_tokens (
    id          BIGINT PRIMARY KEY AUTO_INCREMENT,
    token       VARCHAR(128) UNIQUE NOT NULL,
    user_id     VARCHAR(36) NOT NULL,
    expires_at  TIMESTAMP NOT NULL,
    revoked     BOOLEAN DEFAULT FALSE,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

**Endpoint làm mới Access Token:**
```http
POST /api/v1/auth/refresh
Content-Type: application/json

{
  "refreshToken": "d4f8a2b1c3e5f7890a1b2c3d4e5f67890abcdef"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Các trường hợp lỗi khi refresh:**
- Refresh token không tồn tại → `AUTH_REFRESH_TOKEN_INVALID` (401)
- Refresh token đã bị thu hồi → `AUTH_REFRESH_TOKEN_INVALID` (401)
- Refresh token đã hết hạn → `AUTH_REFRESH_TOKEN_INVALID` (401)
- Tài khoản bị khoá → `AUTH_ACCOUNT_LOCKED` (403)

---

### 1.4. Đăng Xuất

```http
POST /api/v1/auth/logout
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "refreshToken": "d4f8a2b1c3e5f7890a1b2c3d4e5f67890abcdef"
}
```

**Hành vi phía server:**
1. Đánh dấu `revoked = true` cho refresh token trong DB
2. (Tùy chọn) Thêm access token vào blacklist nếu có Redis cache
3. Trả về `204 No Content`

---

### 1.5. Spring Security Filter Chain

Luồng xử lý mỗi request qua Spring Security:

```
HTTP Request
    |
    v
[JwtAuthenticationFilter]
    |-- Đọc header: Authorization: Bearer <token>
    |-- Nếu không có token → tiếp tục chain (anonymous)
    |-- Validate chữ ký JWT bằng RS256 public key
    |-- Kiểm tra exp (hết hạn chưa)
    |-- Trích xuất payload: userId, email, role, status
    |-- Kiểm tra status != LOCKED
    |-- Tạo UsernamePasswordAuthenticationToken
    |-- Gán vào SecurityContextHolder
    |
    v
[SecurityFilterChain - Authorization Rules]
    |-- Khớp URL pattern với rule được cấu hình
    |-- Kiểm tra role/authority
    |-- Cho phép hoặc từ chối (403/401)
    |
    v
[Controller / Service Layer]
    |-- @PreAuthorize cho fine-grained control
    |-- Lấy userId từ SecurityContext để filter dữ liệu
```

---

## 2. Vai Trò Người Dùng (Roles)

Hệ thống có **3 vai trò** chính:

| Vai trò | Mô tả | Đối tượng |
|---------|-------|-----------|
| `CUSTOMER` | Khách hàng doanh nghiệp | Người mua hàng B2B, đặt hàng, quản lý tài khoản |
| `ADMIN` | Quản trị viên hệ thống | Nhân viên vận hành nội bộ, toàn quyền |
| `STAFF` | Nhân viên hỗ trợ | Xử lý đơn hàng, bảo hành, trả hàng |

---

## 3. Ma Trận Phân Quyền (Permissions Matrix)

> **Chú thích:**
> - `✓ Public` — Không cần xác thực
> - `✓` — Được phép (cần xác thực)
> - `✓ (own)` — Chỉ được truy cập tài nguyên của chính mình
> - `limited` — Quyền hạn chế, chỉ một số hành động
> - `-` — Không có quyền

### 3.1. Xác Thực & Người Dùng

| Endpoint | Method | CUSTOMER | ADMIN | STAFF | Ghi chú |
|----------|--------|----------|-------|-------|---------|
| `/auth/login` | POST | ✓ Public | ✓ Public | ✓ Public | Không cần token |
| `/auth/refresh` | POST | ✓ Public | ✓ Public | ✓ Public | Không cần access token |
| `/auth/logout` | POST | ✓ | ✓ | ✓ | Cần access token hợp lệ |
| `/users` | GET | - | ✓ | - | Admin xem danh sách user |
| `/users/:id` | GET | ✓ (own) | ✓ | - | Customer chỉ xem profile của mình |
| `/users/:id` | PUT | ✓ (own) | ✓ | - | Cập nhật thông tin cá nhân |
| `/users/:id/status` | PATCH | - | ✓ | - | Khoá/mở khoá tài khoản |
| `/users/:id/password` | PATCH | ✓ (own) | - | - | Đổi mật khẩu |

### 3.2. Sản Phẩm & Danh Mục

| Endpoint | Method | CUSTOMER | ADMIN | STAFF | Ghi chú |
|----------|--------|----------|-------|-------|---------|
| `/products` | GET | ✓ Public | ✓ | ✓ | Xem danh sách sản phẩm |
| `/products/:id` | GET | ✓ Public | ✓ | ✓ | Xem chi tiết sản phẩm |
| `/products` | POST | - | ✓ | - | Tạo sản phẩm mới |
| `/products/:id` | PUT | - | ✓ | - | Cập nhật sản phẩm |
| `/products/:id` | DELETE | - | ✓ | - | Xoá sản phẩm |
| `/categories/**` | GET | ✓ Public | ✓ | ✓ | Xem danh mục |
| `/categories/**` | POST/PUT/DELETE | - | ✓ | - | Quản lý danh mục |

### 3.3. Giỏ Hàng & Đơn Hàng

| Endpoint | Method | CUSTOMER | ADMIN | STAFF | Ghi chú |
|----------|--------|----------|-------|-------|---------|
| `/cart` | GET/POST/PUT/DELETE | ✓ (own) | - | - | Chỉ thao tác giỏ hàng của mình |
| `/orders` | POST | ✓ (own) | - | - | Đặt hàng mới |
| `/orders` | GET | ✓ (own only) | ✓ (all) | ✓ (assigned) | Phân quyền theo vai trò |
| `/orders/:id` | GET | ✓ (own) | ✓ | ✓ | Xem chi tiết đơn hàng |
| `/orders/:id/status` | PATCH | - | ✓ | ✓ | Cập nhật trạng thái đơn hàng |
| `/orders/:id` | DELETE | ✓ (PENDING/CONFIRMED only) | ✓ | - | Customer chỉ huỷ khi PENDING hoặc CONFIRMED |

### 3.4. Đánh Giá (Reviews)

| Endpoint | Method | CUSTOMER | ADMIN | STAFF | Ghi chú |
|----------|--------|----------|-------|-------|---------|
| `/reviews` | GET | ✓ Public | ✓ | ✓ | Xem tất cả đánh giá |
| `/reviews` | POST | ✓ (own, verified purchase) | - | - | Chỉ đánh giá sản phẩm đã mua |
| `/reviews/:id` | PUT | ✓ (own) | ✓ | - | Sửa đánh giá của mình |
| `/reviews/:id/status` | PATCH | - | ✓ | ✓ | Duyệt / ẩn đánh giá |

### 3.5. Khuyến Mãi & Loyalty

| Endpoint | Method | CUSTOMER | ADMIN | STAFF | Ghi chú |
|----------|--------|----------|-------|-------|---------|
| `/promotions` | GET | ✓ Public | ✓ | ✓ | Xem danh sách khuyến mãi |
| `/promotions` | POST | - | ✓ | - | Tạo khuyến mãi mới |
| `/promotions/:id` | PUT/DELETE | - | ✓ | - | Quản lý khuyến mãi |
| `/promotions/validate` | POST | ✓ | ✓ | ✓ | Kiểm tra mã khuyến mãi |
| `/loyalty` | GET | ✓ (own) | ✓ (all) | - | Customer chỉ xem điểm của mình |
| `/loyalty/redeem` | POST | ✓ (own) | - | - | Đổi điểm thưởng |

### 3.6. Bảo Hành, Trả Hàng & Thu Cũ

| Endpoint | Method | CUSTOMER | ADMIN | STAFF | Ghi chú |
|----------|--------|----------|-------|-------|---------|
| `/warranty` | GET | ✓ (own) | ✓ (all) | ✓ (all) | Xem thông tin bảo hành |
| `/warranty-claims` | POST | ✓ (own) | - | - | Gửi yêu cầu bảo hành |
| `/warranty-claims/:id/status` | PATCH | - | ✓ | ✓ | Xử lý yêu cầu bảo hành |
| `/returns` | POST | ✓ (own) | - | - | Gửi yêu cầu trả hàng |
| `/returns/:id/status` | PATCH | - | ✓ | ✓ | Duyệt / từ chối trả hàng |
| `/trade-in` | POST | ✓ | ✓ | ✓ | Gửi yêu cầu thu cũ |
| `/trade-in/:id/status` | PATCH | - | ✓ | ✓ | Xử lý yêu cầu thu cũ |

### 3.7. Thông Báo, Blog & Admin

| Endpoint | Method | CUSTOMER | ADMIN | STAFF | Ghi chú |
|----------|--------|----------|-------|-------|---------|
| `/notifications` | GET | ✓ (own) | ✓ (all) | ✓ (own) | Customer và Staff chỉ xem của mình |
| `/notifications/:id/read` | PATCH | ✓ (own) | ✓ | ✓ (own) | Đánh dấu đã đọc |
| `/blog` | GET | ✓ Public | ✓ | ✓ | Xem bài viết |
| `/blog` | POST/PUT/DELETE | - | ✓ | - | Quản lý bài viết |
| `/admin/**` | GET | - | ✓ | limited | STAFF chỉ truy cập một số màn hình |
| `/admin/reports` | GET | - | ✓ | - | Báo cáo kinh doanh |
| `/admin/analytics` | GET | - | ✓ | - | Phân tích dữ liệu |
| `/admin/settings` | POST/PUT | - | ✓ | - | Cấu hình hệ thống |

---

## 4. Row-Level Security (Bảo Mật Theo Hàng)

### 4.1. Nguyên Tắc Cốt Lõi

> **Quy tắc vàng:** Backend **luôn luôn** lấy `userId` từ JWT token trong `SecurityContext`. **Không bao giờ** tin tưởng `userId` do client gửi lên trong request body hoặc query parameter.

### 4.2. Quy Tắc Cho Từng Vai Trò

| Vai trò | Nguyên tắc truy cập |
|---------|---------------------|
| `CUSTOMER` | Chỉ đọc/ghi tài nguyên thuộc sở hữu của mình (đơn hàng, giỏ hàng, wishlist, đánh giá, điểm loyalty, bảo hành) |
| `STAFF` | Đọc tài nguyên được phân công hoặc tất cả (tùy endpoint), không thể sửa cấu hình hệ thống |
| `ADMIN` | Truy cập toàn bộ tài nguyên trong hệ thống |

### 4.3. Ví Dụ Triển Khai Row-Level Security

**Lấy đơn hàng — Service Layer:**
```java
public Page<Order> getOrders(Pageable pageable) {
    // Lấy thông tin người dùng hiện tại từ SecurityContext
    UserPrincipal currentUser = (UserPrincipal) SecurityContextHolder
        .getContext()
        .getAuthentication()
        .getPrincipal();

    if (currentUser.getRole() == Role.CUSTOMER) {
        // CUSTOMER: chỉ xem đơn hàng của chính mình
        return orderRepository.findByCustomerId(currentUser.getId(), pageable);
    } else if (currentUser.getRole() == Role.STAFF) {
        // STAFF: xem đơn hàng được phân công
        return orderRepository.findByAssignedStaffId(currentUser.getId(), pageable);
    } else {
        // ADMIN: xem tất cả
        return orderRepository.findAll(pageable);
    }
}
```

**Kiểm tra quyền truy cập tài nguyên cụ thể:**
```java
public Order getOrderById(String orderId) {
    UserPrincipal currentUser = getCurrentUser();
    Order order = orderRepository.findById(orderId)
        .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));

    // Nếu là CUSTOMER, kiểm tra sở hữu
    if (currentUser.getRole() == Role.CUSTOMER
            && !order.getCustomerId().equals(currentUser.getId())) {
        throw new AppException(ErrorCode.ORDER_ACCESS_DENIED);
    }

    return order;
}
```

### 4.4. Tài Nguyên Áp Dụng Row-Level Security

| Tài nguyên | CUSTOMER filter |
|-----------|-----------------|
| Đơn hàng | `WHERE customer_id = :currentUserId` |
| Giỏ hàng | `WHERE customer_id = :currentUserId` |
| Wishlist | `WHERE customer_id = :currentUserId` |
| Đánh giá | `WHERE customer_id = :currentUserId` (khi ghi) |
| Điểm loyalty | `WHERE customer_id = :currentUserId` |
| Yêu cầu bảo hành | `WHERE customer_id = :currentUserId` |
| Yêu cầu trả hàng | `WHERE customer_id = :currentUserId` |
| Yêu cầu thu cũ | `WHERE customer_id = :currentUserId` |
| Thông báo | `WHERE user_id = :currentUserId` |

---

## 5. Cấu Hình Spring Security

### 5.1. SecurityFilterChain (Pseudocode)

```java
@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // Tắt CSRF (REST API dùng JWT, không dùng session)
            .csrf(csrf -> csrf.disable())

            // Stateless session (không lưu session phía server)
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

            // Cấu hình phân quyền theo URL
            .authorizeHttpRequests(auth -> auth

                // === PUBLIC ENDPOINTS (không cần xác thực) ===
                .requestMatchers(HttpMethod.POST,
                    "/api/v1/auth/login",
                    "/api/v1/auth/refresh",
                    "/api/v1/auth/register"
                ).permitAll()

                .requestMatchers(HttpMethod.GET,
                    "/api/v1/products/**",
                    "/api/v1/categories/**",
                    "/api/v1/blog/**",
                    "/api/v1/reviews/**",
                    "/api/v1/promotions/**"
                ).permitAll()

                // === CUSTOMER ONLY ===
                .requestMatchers(
                    "/api/v1/cart/**",
                    "/api/v1/wishlist/**",
                    "/api/v1/loyalty/redeem"
                ).hasRole("CUSTOMER")

                .requestMatchers(HttpMethod.POST,
                    "/api/v1/orders",
                    "/api/v1/reviews",
                    "/api/v1/warranty-claims",
                    "/api/v1/returns",
                    "/api/v1/trade-in"
                ).hasRole("CUSTOMER")

                // === ADMIN ONLY ===
                .requestMatchers("/api/v1/admin/**").hasRole("ADMIN")

                .requestMatchers(HttpMethod.POST,
                    "/api/v1/products",
                    "/api/v1/categories",
                    "/api/v1/promotions",
                    "/api/v1/blog"
                ).hasRole("ADMIN")

                .requestMatchers(HttpMethod.DELETE,
                    "/api/v1/products/**",
                    "/api/v1/categories/**"
                ).hasRole("ADMIN")

                .requestMatchers(HttpMethod.PATCH,
                    "/api/v1/users/*/status"
                ).hasRole("ADMIN")

                // === ADMIN hoặc STAFF ===
                .requestMatchers(HttpMethod.PATCH,
                    "/api/v1/orders/*/status",
                    "/api/v1/warranty-claims/*/status",
                    "/api/v1/returns/*/status",
                    "/api/v1/trade-in/*/status",
                    "/api/v1/reviews/*/status"
                ).hasAnyRole("ADMIN", "STAFF")

                // === BẤT KỲ USER ĐÃ XÁC THỰC ===
                .anyRequest().authenticated()
            )

            // Thêm JWT filter trước UsernamePasswordAuthenticationFilter
            .addFilterBefore(
                jwtAuthenticationFilter,
                UsernamePasswordAuthenticationFilter.class
            )

            // Xử lý lỗi xác thực
            .exceptionHandling(ex -> ex
                .authenticationEntryPoint(customAuthEntryPoint)   // 401
                .accessDeniedHandler(customAccessDeniedHandler)   // 403
            );

        return http.build();
    }
}
```

### 5.2. JwtAuthenticationFilter

```java
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        // Không có Bearer token → tiếp tục (anonymous request)
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7);

        try {
            // Xác minh chữ ký và thời hạn
            Claims claims = jwtService.validateToken(token);

            String userId = claims.getSubject();
            String role   = claims.get("role", String.class);
            String status = claims.get("status", String.class);

            // Từ chối nếu tài khoản bị khoá
            if ("LOCKED".equals(status)) {
                sendErrorResponse(response, "AUTH_ACCOUNT_LOCKED", 403);
                return;
            }

            // Gán authentication vào SecurityContext
            UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken(
                    new UserPrincipal(userId, role),
                    null,
                    List.of(new SimpleGrantedAuthority("ROLE_" + role))
                );
            SecurityContextHolder.getContext().setAuthentication(authentication);

        } catch (ExpiredJwtException e) {
            sendErrorResponse(response, "AUTH_TOKEN_EXPIRED", 401);
            return;
        } catch (JwtException e) {
            sendErrorResponse(response, "AUTH_TOKEN_INVALID", 401);
            return;
        }

        filterChain.doFilter(request, response);
    }
}
```

### 5.3. Method-Level Security với @PreAuthorize

```java
// Ví dụ sử dụng @PreAuthorize cho fine-grained control
@RestController
@RequestMapping("/api/v1/orders")
public class OrderController {

    // Chỉ ADMIN hoặc STAFF mới được PATCH status
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<OrderResponse> updateStatus(
            @PathVariable String id,
            @RequestBody UpdateStatusRequest request) {
        // ...
    }

    // Bất kỳ user đã xác thực
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<OrderResponse> createOrder(
            @RequestBody CreateOrderRequest request) {
        // Service layer sẽ tự lấy userId từ SecurityContext
    }
}
```

---

## 6. Bảo Mật Mật Khẩu

### 6.1. Mã Hóa Mật Khẩu

| Thuộc tính | Giá trị |
|-----------|---------|
| Thuật toán | BCrypt |
| Cost factor (strength) | **12** |
| Lý do chọn 12 | Cân bằng giữa bảo mật và hiệu năng (~300ms/hash trên server hiện đại) |

```java
@Bean
public PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder(12);
}
```

### 6.2. Đổi Mật Khẩu

Luồng đổi mật khẩu yêu cầu xác minh mật khẩu cũ:

```
1. Client gửi: { currentPassword, newPassword, confirmNewPassword }
2. Server xác minh currentPassword với hash trong DB
3. Nếu sai → trả về USER_INVALID_PASSWORD (400)
4. Nếu đúng → hash newPassword và cập nhật DB
5. Thu hồi tất cả refresh token của user (force re-login)
6. Trả về 200 OK
```

**Validation mật khẩu mới:**
- Tối thiểu 8 ký tự
- Phải có ít nhất 1 chữ hoa, 1 chữ thường, 1 chữ số
- Không được trùng với mật khẩu hiện tại

### 6.3. Khoá Tài Khoản Sau Nhiều Lần Đăng Nhập Thất Bại

| Tham số | Giá trị |
|---------|---------|
| Số lần thất bại tối đa | 5 lần |
| Thời gian khoá tự động | 30 phút |
| Khoá vĩnh viễn | Chỉ ADMIN mới được mở khoá thủ công |

**Schema theo dõi trong bảng `users`:**
```sql
failed_login_attempts   INT DEFAULT 0,
locked_until            TIMESTAMP NULL,
last_login_attempt      TIMESTAMP NULL
```

**Luồng xử lý:**
```
Đăng nhập thất bại:
1. Tăng failed_login_attempts += 1
2. Cập nhật last_login_attempt = NOW()
3. Nếu failed_login_attempts >= 5:
   - Set locked_until = NOW() + 30 MINUTES
   - Trả về AUTH_ACCOUNT_LOCKED

Đăng nhập thành công:
1. Reset failed_login_attempts = 0
2. Xoá locked_until = NULL
3. Cập nhật last_login_at = NOW()

Kiểm tra khi login:
1. Nếu locked_until > NOW() → trả về AUTH_ACCOUNT_LOCKED
2. Nếu locked_until <= NOW() → tự động mở khoá, reset attempts
```

---

## 7. Rate Limiting

### 7.1. Cấu Hình Rate Limit Theo Endpoint

| Endpoint / Nhóm | Giới hạn | Phạm vi | Ghi chú |
|----------------|---------|---------|---------|
| `POST /api/v1/auth/login` | 5 request/phút | Per IP | Chống brute force |
| `POST /api/v1/auth/refresh` | 10 request/phút | Per IP | |
| `POST /api/v1/auth/register` | 3 request/phút | Per IP | Chống spam đăng ký |
| API chung (authenticated) | 100 request/phút | Per User | Theo `userId` trong JWT |
| Public endpoints | 200 request/phút | Per IP | Theo IP của request |
| Admin endpoints | 300 request/phút | Per User | Admin cần thao tác nhiều hơn |

### 7.2. Response Khi Vượt Rate Limit

```http
HTTP/1.1 429 Too Many Requests
Retry-After: 60
X-RateLimit-Limit: 5
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1705312260

{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Quá nhiều yêu cầu, vui lòng thử lại sau",
    "details": {
      "retryAfterSeconds": 60
    }
  }
}
```

### 7.3. Triển Khai Rate Limiting

Sử dụng **Bucket4j** với Redis backend cho môi trường multi-instance:

```java
@Component
public class RateLimitingFilter extends OncePerRequestFilter {

    // Cấu hình bucket: 5 request/phút cho endpoint login
    private Bandwidth loginBandwidth = Bandwidth.classic(5,
        Refill.intervally(5, Duration.ofMinutes(1)));

    // Lấy identifier: IP cho public, userId cho authenticated
    private String getIdentifier(HttpServletRequest request) {
        Authentication auth = SecurityContextHolder
            .getContext().getAuthentication();

        if (auth != null && auth.isAuthenticated()
                && !(auth instanceof AnonymousAuthenticationToken)) {
            return "user:" + ((UserPrincipal) auth.getPrincipal()).getId();
        }
        return "ip:" + request.getRemoteAddr();
    }
}
```

---

## 8. Các Lưu Ý Bảo Mật Bổ Sung

### 8.1. HTTP Headers Bảo Mật

Cấu hình Spring Security thêm các header sau:

```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
Content-Security-Policy: default-src 'self'
```

### 8.2. CORS Configuration

```java
@Bean
public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration config = new CorsConfiguration();
    config.setAllowedOrigins(List.of(
        "https://app.example.com",       // Production frontend
        "http://localhost:3000"          // Local development
    ));
    config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE"));
    config.setAllowedHeaders(List.of("Authorization", "Content-Type"));
    config.setAllowCredentials(true);
    config.setMaxAge(3600L);
    // ...
}
```

### 8.3. Checklist Bảo Mật

- [ ] JWT ký bằng RS256 (asymmetric), không dùng HS256 (symmetric)
- [ ] Private key được lưu trong Vault / Kubernetes Secret, không hard-code
- [ ] Access token TTL = 1 giờ, không kéo dài hơn
- [ ] Refresh token luôn được lưu vào DB, có thể thu hồi bất cứ lúc nào
- [ ] Password hash bằng BCrypt với strength >= 12
- [ ] Tất cả endpoint nhạy cảm đều có rate limiting
- [ ] Row-level security được enforce tại Service layer
- [ ] Không log JWT token hoặc password dưới bất kỳ hình thức nào
- [ ] HTTPS bắt buộc trên production (HTTP redirect → HTTPS)
- [ ] Kiểm thử bảo mật (OWASP Top 10) trước khi release

---

*Tài liệu này được tạo bởi BA Team — Dự án B2B eCommerce Platform*

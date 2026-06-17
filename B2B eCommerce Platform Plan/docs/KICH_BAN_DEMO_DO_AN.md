# Kịch Bản Demo Đồ Án Website Bán Hàng

## 1. Mục tiêu demo

Mục tiêu buổi demo là chứng minh hệ thống đã hoàn thiện các nghiệp vụ chính của một website bán hàng B2C:

- Khách hàng xem sản phẩm, lọc/tìm kiếm, xem chi tiết, chọn biến thể, thêm giỏ hàng và đặt hàng.
- Khách hàng theo dõi sau mua: đơn hàng, thanh toán, hóa đơn, vận chuyển, đánh giá, bảo hành, đổi trả.
- Admin vận hành hệ thống: danh mục, sản phẩm, tồn kho, đơn hàng, thanh toán, hóa đơn, vận chuyển, khách hàng, đánh giá, khuyến mãi, bảo hành, đổi trả.
- Backend có API thật, database thật, migration và dữ liệu demo.

## 2. Chuẩn bị trước khi demo

### 2.1. Môi trường

- Backend: `http://localhost:8080`
- Frontend: `http://localhost:5173`
- Database đã bật.
- Backend chạy không lỗi migration.
- Frontend mở được trang admin và buyer.

### 2.2. Kiểm tra nhanh API

Mở browser hoặc Postman kiểm tra:

- `GET http://localhost:8080/api/v1/categories`
- `GET http://localhost:8080/api/v1/products?page=1&pageSize=5`
- `GET http://localhost:8080/api/v1/admin/orders?page=1&pageSize=5`
- `GET http://localhost:8080/api/v1/admin/payments?page=1&pageSize=5`

Kết quả mong muốn:

- Có danh mục.
- Có sản phẩm.
- Có đơn hàng admin.
- Có dữ liệu thanh toán.

### 2.3. Các tab nên mở sẵn

- Trang chủ: `http://localhost:5173`
- Danh sách sản phẩm: `http://localhost:5173/products`
- Giỏ hàng: `http://localhost:5173/cart`
- Admin dashboard: `http://localhost:5173/admin`
- Admin sản phẩm: `http://localhost:5173/admin/products`
- Admin đơn hàng: `http://localhost:5173/admin/orders`
- Admin thanh toán: `http://localhost:5173/admin/payments`

## 3. Lời mở đầu

Gợi ý lời nói:

> Em xin trình bày đồ án website bán hàng theo mô hình B2C. Hệ thống gồm frontend React, backend Spring Boot và database quan hệ. Người dùng có thể xem sản phẩm, đặt hàng và theo dõi sau mua. Admin có thể quản lý danh mục, sản phẩm, tồn kho, đơn hàng, thanh toán, hóa đơn, vận chuyển và các nghiệp vụ hậu mãi.

Nên nhấn mạnh:

- Hệ thống ban đầu có định hướng B2B, sau đó đã chuyển về mô hình bán lẻ B2C.
- Các luồng supplier/contract/chat không phù hợp đã được loại khỏi phần demo chính.
- Frontend bám theo contract backend, không demo các chức năng chưa có API thật.

## 4. Luồng demo khách hàng

Thời lượng đề xuất: 10 đến 12 phút.

### 4.1. Trang chủ

Đường dẫn:

`http://localhost:5173`

Nội dung demo:

- Xem banner/trang chủ.
- Xem nhóm sản phẩm nổi bật, sản phẩm mới, sản phẩm hot.
- Xem danh mục sản phẩm.
- Điều hướng sang trang danh sách sản phẩm.

Điểm cần nói:

- Dữ liệu sản phẩm lấy từ backend.
- Danh mục lấy từ backend.
- Trang chủ là điểm bắt đầu của khách hàng mua lẻ.

### 4.2. Danh sách sản phẩm

Đường dẫn:

`http://localhost:5173/products`

Nội dung demo:

- Tìm kiếm sản phẩm.
- Lọc theo danh mục.
- Lọc theo thương hiệu/giá nếu cần.
- Chuyển chế độ xem nếu có.
- Bấm vào một sản phẩm để xem chi tiết.

Điểm cần nói:

- FE gọi `GET /api/v1/products`.
- Bộ lọc gửi query params lên BE.
- Danh mục cha-con hỗ trợ lọc sản phẩm.

### 4.3. Chi tiết sản phẩm

Đường dẫn:

`http://localhost:5173/products/{productId}`

Nội dung demo:

- Xem ảnh sản phẩm.
- Chọn biến thể.
- Kiểm tra gallery đổi theo biến thể nếu biến thể có ảnh riêng.
- Xem giá, mô tả, thông số, đánh giá.
- Xem combo nếu có.
- Thêm sản phẩm vào giỏ hàng.

Điểm cần nói:

- Chi tiết sản phẩm lấy từ `GET /api/v1/products/{id}`.
- Ảnh sản phẩm có thể gắn với biến thể bằng `variantId`.
- Nếu biến thể có ảnh riêng, gallery ưu tiên ảnh của biến thể đó.
- Combo lấy từ `GET /api/v1/products/{productId}/combos`.

### 4.4. Giỏ hàng

Đường dẫn:

`http://localhost:5173/cart`

Nội dung demo:

- Xem sản phẩm trong giỏ.
- Tăng/giảm số lượng.
- Xóa sản phẩm.
- Kiểm tra tổng tiền.
- Điền thông tin giao hàng.
- Chọn phương thức thanh toán.

Điểm cần nói:

- Giỏ hàng lưu qua backend.
- Khi đặt hàng, backend tính lại giá, FE không tự quyết định giá cuối cùng.
- Cart API gồm thêm, sửa số lượng, xóa item, validate cart.

### 4.5. Đặt hàng và xác nhận đơn

Nội dung demo:

- Tạo đơn hàng từ giỏ hàng.
- Xem trang xác nhận đơn.
- Mở danh sách đơn hàng khách hàng.
- Mở chi tiết đơn hàng.

Điểm cần nói:

- Đơn hàng được tạo qua `POST /api/v1/orders`.
- Backend snapshot thông tin sản phẩm, giá, địa chỉ giao hàng.
- Trạng thái đơn hàng có thể được admin cập nhật.

### 4.6. Sau mua

Các trang có thể demo nhanh:

- `/orders`
- `/payments`
- `/invoices`
- `/shipments`
- `/reviews`
- `/warranty`
- `/returns`

Điểm cần nói:

- Khách hàng có thể theo dõi thanh toán, hóa đơn, vận chuyển.
- Có luồng bảo hành, đổi trả, đánh giá để hoàn thiện hậu mãi.

## 5. Luồng demo admin

Thời lượng đề xuất: 15 đến 18 phút.

### 5.1. Dashboard admin

Đường dẫn:

`http://localhost:5173/admin`

Nội dung demo:

- Xem tổng quan hệ thống.
- Xem số liệu sản phẩm, đơn hàng, thanh toán.
- Giới thiệu sidebar admin.

Điểm cần nói:

- Admin là nơi vận hành website bán hàng.
- Các menu chưa có backend thật hoặc không phù hợp B2C đã được ẩn khỏi sidebar chính.

### 5.2. Quản lý danh mục

Đường dẫn:

`http://localhost:5173/admin/categories`

Nội dung demo:

- Xem danh sách danh mục.
- Xem cấu trúc danh mục cha-con.
- Thêm/sửa danh mục nếu cần.
- Chọn danh mục cha.

Điểm cần nói:

- Danh mục có cấu trúc cây.
- Mỗi danh mục có thể có `parentId`.
- Danh mục phục vụ lọc sản phẩm phía khách hàng.

### 5.3. Quản lý sản phẩm

Đường dẫn:

`http://localhost:5173/admin/products`

Nội dung demo:

- Xem danh sách sản phẩm.
- Tìm kiếm/lọc sản phẩm.
- Mở popup chi tiết sản phẩm.
- Xem biến thể sản phẩm.
- Thêm/sửa biến thể.
- Thêm/sửa ảnh sản phẩm.
- Gắn ảnh với biến thể.

Điểm cần nói:

- Sản phẩm liên kết với danh mục.
- Một sản phẩm có nhiều biến thể.
- Một biến thể có thể có nhiều ảnh.
- Ảnh có thể là ảnh chung sản phẩm hoặc ảnh riêng cho biến thể.
- Dữ liệu sản phẩm được quản lý qua API admin.

### 5.4. Quản lý tồn kho

Đường dẫn:

`http://localhost:5173/admin/inventory`

Nội dung demo:

- Xem tồn kho theo sản phẩm/biến thể.
- Kiểm tra số lượng tồn.
- Xem cảnh báo nếu có.

Điểm cần nói:

- Tồn kho ảnh hưởng trực tiếp đến khả năng đặt hàng.
- Đơn hàng có thể làm giảm tồn kho hoặc giữ tồn theo logic backend.

### 5.5. Quản lý đơn hàng

Đường dẫn:

`http://localhost:5173/admin/orders`

Nội dung demo:

- Xem danh sách đơn hàng.
- Tìm kiếm đơn hàng.
- Lọc theo trạng thái.
- Mở chi tiết đơn.
- Cập nhật trạng thái đơn hàng.
- Xem thông tin thanh toán, hóa đơn, vận chuyển liên quan.

Điểm cần nói:

- Đây là nghiệp vụ trung tâm của admin.
- API dùng: `GET /api/v1/admin/orders`.
- Chi tiết đơn có thể hiển thị thông tin buyer, sản phẩm, trạng thái, thanh toán, vận chuyển.
- Trạng thái admin cập nhật sẽ ảnh hưởng đến phía khách hàng.

### 5.6. Thanh toán

Đường dẫn:

`http://localhost:5173/admin/payments`

Nội dung demo:

- Xem danh sách thanh toán.
- Lọc trạng thái thanh toán.
- Xem chi tiết thanh toán.
- Demo action nếu cần:
  - mark overdue
  - refund
  - mark paid

Điểm cần nói:

- Admin theo dõi trạng thái thanh toán của đơn hàng.
- Có xử lý hoàn tiền và quá hạn.

### 5.7. Hóa đơn

Đường dẫn:

`http://localhost:5173/admin/invoices`

Nội dung demo:

- Xem danh sách hóa đơn.
- Xem chi tiết hóa đơn.
- Kiểm tra thông tin dòng sản phẩm, tổng tiền, trạng thái.

Điểm cần nói:

- Hóa đơn liên kết với đơn hàng.
- Phục vụ kiểm tra sau mua và quản trị tài chính.

### 5.8. Vận chuyển

Đường dẫn:

`http://localhost:5173/admin/shipments`

Nội dung demo:

- Xem danh sách vận chuyển.
- Xem trạng thái giao hàng.
- Xem lịch sử vận chuyển nếu có.

Điểm cần nói:

- Vận chuyển liên kết với đơn hàng.
- Admin có thể theo dõi quá trình giao hàng.

### 5.9. Khách hàng, đánh giá, bảo hành, đổi trả

Các trang:

- `/admin/customers`
- `/admin/reviews`
- `/admin/warranty`
- `/admin/returns`

Nội dung demo:

- Quản lý khách hàng.
- Xem đánh giá sản phẩm.
- Xử lý bảo hành.
- Xử lý đổi trả.

Điểm cần nói:

- Đây là nhóm nghiệp vụ hậu mãi.
- Website không chỉ dừng ở đặt hàng mà có quản lý sau mua.

## 6. Demo backend và database

Thời lượng đề xuất: 5 phút.

### 6.1. API

Demo nhanh một số API:

- `GET /api/v1/categories`
- `GET /api/v1/products`
- `GET /api/v1/products/{id}`
- `GET /api/v1/admin/orders`
- `GET /api/v1/admin/payments`

Điểm cần nói:

- API trả JSON thống nhất.
- Có phân tách buyer API và admin API.
- FE bám theo contract của BE.

### 6.2. Database migration

Điểm cần nói:

- Database được quản lý bằng Flyway migration.
- Có migration khởi tạo schema.
- Có migration bổ sung nghiệp vụ.
- Có seed data phục vụ demo.

Các nhóm bảng chính:

- `categories`
- `products`
- `product_variants`
- `product_images`
- `cart_items`
- `orders`
- `order_items`
- `payments`
- `invoices`
- `shipments`
- `warranty_items`
- `returns`
- `product_reviews`

## 7. Thứ tự demo khuyến nghị

Nên demo theo thứ tự sau:

1. Giới thiệu tổng quan hệ thống.
2. Mở trang chủ buyer.
3. Mở danh sách sản phẩm.
4. Mở chi tiết sản phẩm.
5. Chọn biến thể và xem ảnh theo biến thể.
6. Thêm vào giỏ hàng.
7. Tạo đơn hàng.
8. Xem đơn hàng phía khách hàng.
9. Chuyển sang admin dashboard.
10. Mở admin sản phẩm.
11. Mở popup chi tiết sản phẩm, demo biến thể và ảnh theo biến thể.
12. Mở admin đơn hàng.
13. Cập nhật trạng thái đơn hàng.
14. Mở thanh toán, hóa đơn, vận chuyển.
15. Mở khách hàng, đánh giá, bảo hành, đổi trả.
16. Demo nhanh API backend.
17. Kết luận.

## 8. Các điểm nên nhấn mạnh khi trả lời giảng viên

### 8.1. Vì sao là B2C

Trả lời:

> Hệ thống hiện tập trung vào khách hàng cá nhân mua lẻ. Các chức năng không phù hợp với B2C như supplier contract hoặc luồng B2B đã được loại khỏi phần vận hành chính. Admin hiện đóng vai trò quản trị website bán lẻ.

### 8.2. FE có dùng mock không

Trả lời:

> Các luồng chính như danh mục, sản phẩm, giỏ hàng, đơn hàng, thanh toán, hóa đơn, vận chuyển và admin order đều đã dùng API backend. Một số fallback hoặc dữ liệu demo chỉ dùng khi backend không chạy hoặc phục vụ trình bày UI, nhưng phần demo chính bám API thật.

### 8.3. Ảnh theo biến thể xử lý thế nào

Trả lời:

> Bảng `product_images` có thêm `variant_id` nullable. Nếu `variant_id` null thì ảnh là ảnh chung sản phẩm. Nếu có `variant_id` thì ảnh thuộc biến thể đó. Khi khách chọn biến thể, frontend ưu tiên hiển thị ảnh của biến thể, nếu không có thì fallback về ảnh chung.

### 8.4. Backend đảm bảo giá đơn hàng thế nào

Trả lời:

> Khi tạo đơn hàng, frontend chỉ gửi productId, variantId, số lượng và thông tin giao hàng. Backend lấy giá hiện tại từ database, tính lại tổng tiền, khuyến mãi và snapshot vào order item. Vì vậy không phụ thuộc vào giá gửi từ frontend.

### 8.5. Dữ liệu demo lấy từ đâu

Trả lời:

> Dữ liệu demo được seed bằng Flyway migration. Điều này giúp khi chạy lại môi trường, hệ thống có dữ liệu ổn định cho danh mục, sản phẩm, đơn hàng, thanh toán, hóa đơn, vận chuyển và các nghiệp vụ admin.

## 9. Phương án dự phòng khi demo lỗi

### 9.1. Nếu frontend không lên

Kiểm tra:

- FE dev server có chạy ở `localhost:5173` không.
- Chạy lại `npm.cmd run dev`.
- Nếu build lỗi do `dist` bị lock trên Windows, kiểm tra bằng:

```powershell
npx.cmd vite build --outDir dist-codex-check --emptyOutDir
```

### 9.2. Nếu backend không lên

Kiểm tra:

- Java/JDK đúng version.
- Database đã bật.
- Port `8080` chưa bị chiếm.
- Migration Flyway có lỗi không.

### 9.3. Nếu trang admin không có dữ liệu

Kiểm tra API trực tiếp:

```text
http://localhost:8080/api/v1/admin/orders?page=1&pageSize=5
```

Nếu API có data nhưng FE rỗng:

- Kiểm tra console browser.
- Kiểm tra mapper FE trong `adminBackendApi.ts`.
- Kiểm tra filter/search đang bật.

### 9.4. Nếu đặt hàng lỗi

Phương án:

- Demo bằng dữ liệu đơn hàng seed sẵn ở admin.
- Giải thích luồng tạo đơn qua API.
- Mở API hoặc database để chứng minh dữ liệu đơn hàng thật.

## 10. Lời kết demo

Gợi ý lời nói:

> Qua phần demo, hệ thống đã đáp ứng các nghiệp vụ chính của một website bán hàng B2C: khách hàng có thể xem sản phẩm, chọn biến thể, thêm giỏ hàng, đặt hàng và theo dõi sau mua; admin có thể quản lý danh mục, sản phẩm, tồn kho, đơn hàng, thanh toán, hóa đơn, vận chuyển và hậu mãi. Hệ thống được xây dựng bằng React, Spring Boot, database quan hệ và quản lý schema bằng Flyway migration. Frontend và backend được phát triển theo contract để đảm bảo đúng nghiệp vụ và dễ mở rộng.


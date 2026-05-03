# 25 — User Flows: Seller

> Luồng người dùng chi tiết cho Nhà cung cấp (Seller).

---

## Flow 1: Onboarding NCC mới

```
[Chủ doanh nghiệp đăng ký]
  → /register → chọn role "Seller"
  → Form: email, password, companyName, phone
  → Hệ thống tạo User (role: Seller) + Supplier record (status: Chờ xác minh)
  → Login → /seller/dashboard (limited access)

[Hoàn thiện hồ sơ]
  → /seller/profile
  → Upload: logo, ảnh bìa, mô tả công ty
  → Thêm địa chỉ, website
  → Chọn ngành hàng kinh doanh

[Upload chứng chỉ]
  → /seller/profile → tab "Chứng chỉ"
  → Upload: Giấy phép kinh doanh, Chứng nhận ISO...
  → Admin review → Approve → Supplier.isVerified = true
  → Unlock full features
```

---

## Flow 2: Quản lý sản phẩm

```
[Thêm sản phẩm mới]
  → /seller/products → "Thêm sản phẩm"
  → SellerProductForm:

Step 1 — Thông tin cơ bản:
  → Tên, mô tả, danh mục, thương hiệu, xuất xứ
  → Giá bán, giá nhập (internal), giá gốc

Step 2 — Hình ảnh:
  → Upload nhiều ảnh (drag & drop)
  → Chọn ảnh chính (primary)
  → Sắp xếp thứ tự

Step 3 — Tồn kho:
  → Kho lưu trữ
  → Số lượng tồn kho
  → Min order quantity
  → Đơn vị tính

Step 4 — Biến thể (optional):
  → Thêm variants (màu sắc, size, cấu hình...)
  → Giá & tồn kho per variant

Step 5 — Thông số kỹ thuật:
  → Key-value pairs
  → Thời gian bảo hành

  → Save → product.status = 'active'
  → navigate /seller/products

[Sửa sản phẩm]
  → /seller/products → Edit icon
  → Same form, pre-filled
  → Save → toast.success

[Tắt/bật sản phẩm]
  → Toggle status in list page
  → PATCH /products/:id/status
```

---

## Flow 3: Xử lý đơn hàng

```
[Nhận đơn mới]
  → Notification: "Có đơn hàng mới [ORD-001]"
  → /seller/orders → filter status="Chờ xác nhận"
  → SellerOrderDetail:
    → Xem items, địa chỉ giao, ghi chú
    → "Xác nhận" → status: "Đã xác nhận"
    → "Từ chối" → nhập lý do → status: "Đã huỷ"
    → Buyer nhận notification

[Xử lý hàng]
  → /seller/orders/:id
  → "Bắt đầu xử lý" → status: "Đang xử lý"
  → Chuẩn bị hàng, đóng gói

[Tạo shipment]
  → /seller/shipments → "Tạo vận đơn"
  → Chọn Order, carrier (GHTK, GHN, Viettel Post...)
  → Nhập tracking number, cân nặng
  → Save → Shipment.status = "Chờ lấy hàng"
  → Order.status = "Đang giao hàng"
  → Buyer notification: "Đơn hàng đang được giao"

[Cập nhật tracking]
  → /seller/shipments/:id → "Thêm sự kiện"
  → Chọn status, location, mô tả
  → "Đã giao" → Order.status = "Đã giao"
  → Tạo GRN trigger
```

---

## Flow 4: Xử lý RFQ & Báo giá

```
[Seller nhận RFQ từ marketplace]
  → Notification: "RFQ mới: [tên yêu cầu]" (priority nếu urgent)
  → /seller/rfqs → filter Đã gửi
  → SellerRFQDetail:
    → Xem requirements, items, deadline
    → Xem attachments

[Tạo Quotation]
  → "Tạo báo giá" button
  → Điền giá từng item
  → Delivery time (số ngày)
  → Payment terms, warranty
  → Upload attachments (catalog, spec sheet)
  → Submit → Buyer notification

[Follow-up]
  → Xem trạng thái quotation:
    → "Chờ phản hồi": chưa có action từ Buyer
    → "Chấp nhận": tạo Contract
    → "Từ chối": xem lý do
```

---

## Flow 5: Quản lý kho hàng

```
[Xem tổng quan kho]
  → /seller/warehouse → tab "Tổng quan"
  → Xem: tổng sản phẩm, tổng giá trị, cảnh báo sắp hết hàng

[Nhập hàng vào kho]
  → /seller/warehouse → tab "Nhập/Xuất kho"
  → "Nhập hàng" → chọn kho, sản phẩm, số lượng
  → Nhập giá nhập, số lô hàng
  → Save → StockMovement (type: "Nhập kho")

[Điều chỉnh tồn kho sau kiểm kê]
  → Đếm thực tế: 45 cái (hệ thống ghi 50)
  → "Điều chỉnh" → nhập 45 + lý do "Kiểm kê Q1"
  → StockMovement (type: "Điều chỉnh", qty: -5)

[Chuyển hàng giữa kho]
  → /seller/warehouse → tab "Chuyển kho"
  → Chọn kho nguồn, kho đích
  → Chọn sản phẩm + số lượng
  → Submit → WarehouseTransfer (status: "Chờ duyệt")
  → Manager duyệt → "Đã duyệt"
  → Xác nhận giao → "Đang vận chuyển"
  → Xác nhận nhận → StockMovements cả 2 kho + "Đã nhận"

[Xử lý cảnh báo tồn kho]
  → /seller/warehouse → tab "Cảnh báo"
  → List StockAlerts (sắp hết, hết hàng, sắp hết hạn)
  → Click alert → xem sản phẩm → nhập đơn hàng mới từ nhà sản xuất
  → "Đã xử lý" → alert.status = "Đã xử lý"
```

---

## Flow 6: Quản lý tài chính

```
[Xem công nợ Buyer]
  → /seller/credit → Danh sách credit limits
  → Xem buyer nào đang nợ, mức dư nợ còn lại

[Tăng hạn mức tín dụng]
  → /seller/credit → chọn buyer
  → "Điều chỉnh hạn mức" → nhập giá trị mới
  → Save → notification gửi cho buyer

[Tạo hoá đơn]
  → /seller/invoices → "Tạo hoá đơn"
  → Chọn Order liên kết
  → Items tự điền từ order items
  → Điều chỉnh thuế, giảm giá
  → Set dueDate
  → "Lưu bản nháp" → review → "Gửi hoá đơn"
  → Buyer nhận notification + invoice PDF

[Nhắc nhở thanh toán]
  → /seller/payments → filter isOverdue=true
  → Chọn payment → "Gửi nhắc nhở"
  → Chọn channel: inApp, email
  → Send → PaymentReminder record tạo

[Ghi nhận ghi nợ/ghi có]
  → /seller/debit-credit → "Tạo ghi chú"
  → Chọn type: Debit hoặc Credit
  → Link order, invoice
  → Nhập amount, lý do
  → Submit → Buyer confirm → doubly confirmed
```

---

## Flow 7: Quản lý khuyến mãi

```
[Tạo khuyến mãi % giảm giá]
  → /seller/promotions → "Tạo khuyến mãi"

Form:
  → Tên, mô tả
  → Type: "Phần trăm" → value: 20 (%)
  → Min order: 5,000,000
  → Max discount: 2,000,000
  → Start/End date
  → Scope: "Tất cả sản phẩm" hoặc sản phẩm/danh mục cụ thể

  → Save → mã promo tự sinh (VD: "SUMMER20")
  → Buyer có thể dùng mã khi checkout

[Giảm giá theo số lượng]
  → /seller/products/:id → tab "Giảm giá SL"
  → Thêm tier: min 10 → giảm 5%, min 50 → giảm 10%
  → Tự động áp dụng khi buyer order đủ SL
```

---

## Flow 8: Quản lý trả hàng

```
[Nhận yêu cầu trả hàng]
  → Notification: "Yêu cầu trả hàng mới"
  → /seller/returns → filter "Chờ xử lý"
  → SellerReturnDetail:
    → Xem items, lý do, hình ảnh
    → "Xác nhận đã nhận hàng về" → status: "Đã nhận"
    → "Bắt đầu kiểm tra" → status: "Đang kiểm tra"
    → Điền ghi chú kiểm tra
    → Kết quả:
      a. Hàng lỗi thật: "Chấp nhận" + refundAmount
      b. Hàng không lỗi: "Từ chối" + lý do cụ thể
    → "Xác nhận hoàn tiền" → Payment update

[Credit Note tự động]
  → Sau khi return accepted
  → DebitCreditNote (type: Credit) tạo tự động
  → Buyer confirm → creditLimit.usedAmount giảm
```

---

## Flow 9: Quản lý đánh giá

```
[Xem đánh giá mới]
  → Notification: "Có đánh giá mới [5 sao] cho [Laptop Dell XPS 15]"
  → /seller/reviews → filter "Chưa phản hồi"

[Phản hồi đánh giá]
  → Click "Phản hồi"
  → Textarea: cảm ơn hoặc giải thích
  → Submit → review.sellerReply = text
  → 1 lần duy nhất, không edit được

[Quản lý đánh giá xấu]
  → Rating 1-2 sao: xem nguyên nhân
  → Liên hệ buyer để giải quyết
  → Báo cáo Admin nếu review vi phạm
```

---

## Flow 10: Xem báo cáo

```
[Doanh thu]
  → /seller/reports → tab "Doanh thu"
  → Chọn kỳ: tháng/quý/năm
  → Biểu đồ line chart: doanh thu theo thời gian
  → Breakdown: top sản phẩm, top buyers, theo danh mục

[Hiệu suất sản phẩm]
  → Tab "Sản phẩm"
  → Bảng: tên SP, số đơn, doanh thu, tồn kho, rating
  → Sort by: doanh thu desc

[Khách hàng]
  → Tab "Khách hàng"
  → Top buyers by revenue
  → Order frequency, average order value

[Xuất báo cáo]
  → "Xuất Excel" / "Xuất CSV"
  → Download file
```

---

## Tài liệu liên quan

- [24-user-flows-buyer.md](./24-user-flows-buyer.md) — User Flows: Buyer
- [26-user-flows-admin.md](./26-user-flows-admin.md) — User Flows: Admin
- [15-business-rules-part2.md](./15-business-rules-part2.md) — Business rules: Sourcing

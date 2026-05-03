# 26 — User Flows: Admin

> Luồng quản trị viên nền tảng (Admin).

---

## Flow 1: Quản lý người dùng

```
[Xem danh sách user]
  → /admin/customers
  → Filter theo role, status, ngày đăng ký
  → Search theo email, tên

[Khoá tài khoản]
  → Tìm user → Actions → "Khóa tài khoản"
  → Nhập lý do
  → user.status = "Tạm khóa"
  → User không login được
  → ActivityLog ghi: user.account_locked

[Mở khoá]
  → Filter "Tạm khóa" → chọn user → "Mở khóa"
  → user.status = "Hoạt động"

[Xem lịch sử đăng nhập]
  → Click user → tab "Hoạt động"
  → ActivityLog filter action=user.login
```

---

## Flow 2: Xác minh Nhà cung cấp

```
[Supplier mới đăng ký]
  → Admin nhận notification: "Supplier mới chờ xác minh"
  → /admin/suppliers → tab "Chờ xác minh"
  → Xem hồ sơ: company info, contact, categories

[Review chứng chỉ]
  → /admin/certificates → filter "Chờ duyệt"
  → Xem file chứng chỉ (PDF preview)
  → "Duyệt" → certificate.status = "Đã duyệt"
  → "Từ chối" + lý do → certificate.status = "Từ chối"

[Verify Supplier]
  → /admin/suppliers/:id → "Xác minh NCC"
  → supplier.isVerified = true
  → Supplier nhận notification: "Tài khoản đã được xác minh"
  → Unlock: đăng sản phẩm, tham gia marketplace

[Khoá Supplier]
  → "Khoá nhà cung cấp" + lý do
  → supplier.status = "Bị khoá"
  → Tất cả sản phẩm của supplier → hidden
  → Seller không login được
```

---

## Flow 3: Quản lý danh mục

```
[Thêm danh mục mới]
  → /admin/categories → "Thêm danh mục"
  → Nhập: tên, parent category, icon, mô tả
  → Sắp xếp thứ tự
  → Save → category.isActive = true

[Sắp xếp lại danh mục]
  → Drag & drop danh mục
  → "Lưu thứ tự" → PATCH /categories/reorder

[Ẩn danh mục]
  → Toggle isActive → false
  → Sản phẩm trong danh mục vẫn còn nhưng không hiện trên nav

[Xóa danh mục]
  → Chỉ cho xóa nếu không có sản phẩm
  → Confirm warning → DELETE
```

---

## Flow 4: Kiểm duyệt sản phẩm

```
[Sản phẩm mới cần duyệt (future feature)]
  → /admin/products → filter status="pending"
  → Xem: tên, mô tả, hình ảnh, giá, danh mục

[Actions]
  → "Duyệt" → product.status = "active"
  → "Từ chối" + lý do → product.status = "rejected"
    → Seller notification: "Sản phẩm bị từ chối: [lý do]"
  → "Ẩn" (vi phạm) → product.isActive = false

[Hiện tại (không có approval workflow)]
  → Seller đăng sản phẩm → tự động active
  → Admin có thể ẩn sản phẩm vi phạm từ /admin/products
```

---

## Flow 5: Giám sát Đơn hàng

```
[Xem tổng quan]
  → /admin/orders
  → Stats: tổng đơn, doanh thu, đơn chờ, tỷ lệ hoàn thành
  → Filter: supplierId, buyerId, status, dateRange

[Can thiệp đơn hang tranh chap]
  → /admin/orders/:id
  → Xem timeline đầy đủ
  → "Override status" (Admin only) → chọn status mới + ghi chú
  → ActivityLog ghi chi tiết thay đổi

[Xem thanh toán]
  → /admin/payments → filter isOverdue=true
  → Tổng nợ của toàn platform
  → Điều chỉnh manual nếu cần
```

---

## Flow 6: Kiểm duyệt Đánh giá

```
[Review vi phạm bị báo cáo]
  → report_count > 0 → flag → Admin nhận notification
  → /admin/reviews → filter "Bị báo cáo"
  → Xem nội dung review, lý do báo cáo

[Actions]
  → "Giữ nguyên" → review.status = "Đã duyệt"
  → "Ẩn review" → review.status = "Bị ẩn"
  → "Xóa review" → review.status = "Bị xoá"
  → Notification cho buyer & seller về kết quả
```

---

## Flow 7: Cài đặt hệ thống

```
[System Configs]
  → /admin/settings → tab "Cấu hình chung"
  → Chỉnh: site_name, logo, contact_email
  → Toggle maintenance_mode: bật → hiện trang bảo trì cho Buyer/Seller
  → Điều chỉnh: default_tax_rate, return_window_days
  → Save → notification Admin: "Cấu hình đã được cập nhật"

[Email Templates]
  → /admin/settings → tab "Email templates"
  → Chọn template: order_confirmed, payment_due...
  → Edit subject, body HTML
  → "Preview" → xem rendered email
  → Save

[Banners]
  → /admin/settings → tab "Banners"
  → "Thêm banner" → upload ảnh, link, target page, date range
  → Toggle isActive
  → Sắp xếp thứ tự

[Platform Fees]
  → /admin/settings → tab "Phí nền tảng"
  → Xem/sửa fee rates (Giao dịch, Đăng ký, Niêm yết)
  → Careful: thay đổi ảnh hưởng tất cả orders mới
```

---

## Flow 8: Xem báo cáo platform

```
[Admin Dashboard]
  → /admin → Xem summary: users, suppliers, revenue, orders
  → Charts: doanh thu theo tháng, đơn hàng theo danh mục
  → "Pending verifications" widget → navigate /admin/suppliers?pending=true

[Reports]
  → /admin/reports
  → Tab "Doanh thu": platform fee, total GMV, by supplier
  → Tab "Người dùng": new signups, active users, MAU
  → Tab "Đơn hàng": volume, completion rate, cancellation rate
  → Xuất CSV/Excel
```

---

## Flow 9: Xem Nhật ký hoạt động

```
[Kiểm tra audit trail]
  → /admin/activity-logs
  → Filter: userId, action, entityType, dateRange
  → Xem: ai làm gì, lúc nào, IP address
  → Click log → xem chi tiết changes: {field: [before, after]}

[Điều tra sự cố]
  → Filter userId của user bị tố cáo
  → Xem tất cả actions trong thời gian nghi ngờ
  → Export để báo cáo
```

---

## Flow 10: Giải quyết tranh chấp (Dispute)

```
[Contract tranh chấp]
  → Buyer hoặc Seller báo cáo → contract.status = "Tranh chấp"
  → Admin notification

[Review tranh chấp]
  → /admin/contracts/:id
  → Xem lịch sử giao dịch, milestones, payments
  → Liên hệ cả 2 bên (qua email/notification)

[Kết luận]
  → Option A: "Giải quyết - Hoàn thành" → contract.status = "Hoàn thành"
  → Option B: "Giải quyết - Huỷ" → contract.status = "Đã huỷ"
  → Điều chỉnh payment/refund nếu cần
  → Ghi chú lý do quyết định → ActivityLog
```

---

## Tài liệu liên quan

- [24-user-flows-buyer.md](./24-user-flows-buyer.md) — User Flows: Buyer
- [25-user-flows-seller.md](./25-user-flows-seller.md) — User Flows: Seller
- [18-roles-permissions.md](./18-roles-permissions.md) — Admin permissions
- [16-business-rules-part3.md](./16-business-rules-part3.md) — Platform rules

# 24 — User Flows: Buyer

> Luồng người dùng chi tiết cho các tác vụ quan trọng của Buyer.
> Dùng để phát triển và kiểm thử chức năng.

---

## Flow 1: Đặt hàng thường (Standard Order)

```
[Buyer] Tìm sản phẩm
  → /products hoặc /products/:categorySlug
  → ProductListPage: search, filter, sort
  → Click sản phẩm → ProductDetailPage

[ProductDetailPage]
  → Chọn variant (nếu có)
  → Chọn số lượng (>= minOrderQty)
  → Click "Thêm vào giỏ" → CartContext.addItem()
  → Toast: "Đã thêm vào giỏ hàng" + MiniCart badge cập nhật

[CartPage]
  → Xem items, điều chỉnh SL, xóa
  → Nhập mã khuyến mãi (validate promotion)
  → Chọn địa chỉ giao hàng
  → Xem tổng tiền (subtotal + tax + shipping)
  → Click "Đặt hàng"

[Order Creation]
  → cartApi → orderApi.create()
  → Tạo 1 Order per Supplier (nếu giỏ có nhiều NCC)
  → Clear cart → navigate `/order-confirmation?orderId=...`

[OrderConfirmationPage]
  → Hiển thị mã đơn hàng, tóm tắt
  → "Xem đơn hàng" → /orders/:id
  → "Tiếp tục mua sắm" → /products

Notification triggers:
  → Buyer: "Đặt hàng thành công"
  → Seller: "Có đơn hàng mới cần xác nhận" [urgent nếu isUrgent=true]
```

---

## Flow 2: Yêu cầu báo giá (RFQ)

```
[Buyer] Có nhu cầu nhưng không tìm thấy sản phẩm phù hợp
  → /rfqs → "Tạo yêu cầu báo giá"
  → BuyerRFQCreatePage

[BuyerRFQCreatePage]
  → Nhập tiêu đề, chọn danh mục
  → Chọn target: "marketplace" (all sellers) hoặc supplier cụ thể
  → Thêm items: tên, số lượng, đơn vị, mô tả kỹ thuật
  → Upload attachments (specs PDF)
  → Set deadline, payment terms
  → Submit → rfqApi.create() + rfqApi.submit()
  → navigate /rfqs/:id

[Seller nhận RFQ]
  → Notification: "Có RFQ mới từ [Buyer]"
  → /seller/rfqs/:id → xem yêu cầu
  → "Tạo báo giá" → điền giá từng item, delivery time, terms
  → Submit quotation → Buyer nhận notification

[Buyer so sánh báo giá]
  → /rfqs/:id → tab "Báo giá nhận được"
  → Xem tất cả quotations, so sánh giá
  → Click "Chấp nhận" trên quotation tốt nhất
  → → Tạo Contract tự động
  → → Quotation còn lại → "Từ chối"
  → navigate /buyer/contracts/:id
```

---

## Flow 3: Ký hợp đồng

```
[Contract tạo từ Quotation hoặc thủ công]
  → /buyer/contracts/:id

[BuyerContractDetail]
  → Xem thông tin: items, milestones, terms, total
  → Status: "Chờ ký"
  → Click "Ký hợp đồng" (Buyer side)
  → contractApi.sign('buyer')
  → signedByBuyer = true

[Seller ký]
  → Notification: "Buyer đã ký, chờ bạn ký"
  → /seller/contracts/:id → "Ký hợp đồng"
  → contractApi.sign('seller')
  → signedBySeller = true → status = "Đang thực hiện"

[Execute Contract]
  → Buyer đặt hàng theo hợp đồng (orderType: 'Hợp đồng')
  → Track milestones progress
  → Hoàn thành khi tất cả milestones done
```

---

## Flow 4: Trả hàng (Return)

```
[7 ngày sau khi nhận hàng]
  → /orders/:id → "Yêu cầu trả hàng" button (visible nếu ≤ 7 ngày)

[Return Form]
  → Chọn items cần trả, điền số lượng
  → Chọn lý do trả cho từng item
  → Upload ảnh minh chứng
  → Submit → returnApi.create()
  → /returns/:id

[Seller xử lý]
  → Notification: "Yêu cầu trả hàng mới"
  → /seller/returns/:id
  → "Đã nhận hàng" → status: "Đã nhận"
  → "Bắt đầu kiểm tra" → status: "Đang kiểm tra"
  → Điền ghi chú kiểm tra
  → "Chấp nhận" + nhập refundAmount → status: "Chấp nhận"
  → "Từ chối" + lý do → status: "Từ chối"

[Hoàn tiền]
  → Seller "Xác nhận hoàn tiền" → status: "Đã hoàn tiền"
  → Buyer notification + Payment.status = "Hoàn tiền"
```

---

## Flow 5: Mua sắm qua PR (Purchase Requisition)

```
[Buyer nhân viên cần mua hàng]
  → /purchase-requisitions → "Tạo yêu cầu"

[BuyerPRListPage → Create PR]
  → Nhập tiêu đề, mô tả, ngày cần
  → Chọn phòng ban, phân bổ ngân sách
  → Thêm items: tên SP, số lượng, giá ước tính
  → Save draft → Submit

[Approval Flow nếu cần]
  → ApprovalRequest tạo tự động (nếu amount > threshold)
  → Manager nhận notification: "Yêu cầu phê duyệt mới"
  → /approvals/:id → Duyệt hoặc Từ chối
  → Kết quả gửi notification cho requester

[Sau khi duyệt]
  → Option A: "Tạo RFQ" từ PR → navigate /rfqs/create?prId=...
  → Option B: "Tạo đơn hàng trực tiếp" → navigate /cart (pre-filled)
  → PR.status cập nhật theo
```

---

## Flow 6: Thanh toán đơn hàng

```
[Payment sau khi Order được tạo]
  → /payments hoặc /payments/:id

[BuyerPaymentDetail]
  → Xem số tiền, dueDate, trạng thái
  → "Thanh toán ngay" → chọn phương thức
    → Chuyển khoản: xem thông tin TK + QR code
    → Credit: check hạn mức
  → Confirm → paymentApi.createTransaction()
  → Toast: "Đã ghi nhận thanh toán"
  → Payment.status cập nhật

[Quá hạn]
  → Cron job: payment.isOverdue = true + tính lateFee
  → Seller gửi reminder → notification cho Buyer
  → Buyer thanh toán → status = "Đã thanh toán" (cộng them lateFee)
```

---

## Flow 7: Đánh giá sản phẩm

```
[Sau khi Order.status = 'Đã giao']
  → /reviews → tab "Chưa đánh giá"
  → Hoặc từ OrderDetail: "Đánh giá sản phẩm"

[Review Form]
  → Chọn rating 1-5 sao (per star click)
  → Điền tiêu đề, nội dung
  → Pros / Cons
  → Upload ảnh thực tế
  → Anonymous option
  → Submit → reviewApi.create()

[Review hiển thị]
  → ProductDetailPage: reviews section
  → Average rating cập nhật
  → Seller nhận notification: "Đánh giá mới"
  → Seller có thể reply trong 1 lần
```

---

## Flow 8: Theo dõi vận chuyển

```
[Sau khi Seller tạo Shipment]
  → Buyer nhận notification: "Đơn hàng đang giao"
  → /orders/:id → tab "Vận chuyển"
  → Tracking number hiển thị

[BuyerShipmentDetail]
  → Timeline tracking events (chronological)
  → Estimated delivery date
  → Carrier info + tracking number
  → Events tự động cập nhật khi Seller add events
  → "Đã giao" event → Order.status = "Đã giao"

[GRN tạo khi nhận hàng]
  → Buyer tạo GRN: /grns/create?orderId=...
  → Nhập received qty per item
  → Upload ảnh biên bản
  → Confirm → StockMovement tạo (nếu Buyer có warehouse)
```

---

## Flow 9: Quick Order (Đặt hàng nhanh)

```
[Buyer biết mã SKU cần mua]
  → /quick-order

[BuyerQuickOrderPage]
  → Nhập SKU / tên SP → search autocomplete
  → Thêm quantity
  → Add nhiều items cùng lúc
  → Submit → thêm vào cart
  → navigate /cart → checkout

[Bulk Order từ file Excel]
  → /bulk-order
  → Upload Excel template
  → Parse & validate
  → Preview items
  → Add to cart → checkout
```

---

## Flow 10: Đấu giá ngược (Reverse Auction)

```
[Buyer cần mua với giá tốt nhất]
  → /auctions → "Tạo đấu giá"

[Auction Setup]
  → Nhập tiêu đề, mô tả, items cần mua
  → Set thời gian bắt đầu/kết thúc
  → Set giá khởi điểm (starting price)
  → Mời suppliers tham gia
  → Publish

[Suppliers đặt giá]
  → Seller nhận notification: "Có đấu giá mới"
  → /seller/auctions/:id → "Đặt giá"
  → Giá phải thấp hơn bid hiện tại × (1 - minDecrement%)
  → Buyer xem bids real-time

[Kết thúc]
  → Hết time → hiển thị bid thấp nhất
  → Buyer "Chọn người thắng"
  → Tạo Order hoặc Contract với winner supplier
```

---

## Tài liệu liên quan

- [25-user-flows-seller.md](./25-user-flows-seller.md) — User Flows: Seller
- [26-user-flows-admin.md](./26-user-flows-admin.md) — User Flows: Admin
- [14-business-rules-part1.md](./14-business-rules-part1.md) — Business rules liên quan
- [17-state-machines.md](./17-state-machines.md) — State machines tham chiếu

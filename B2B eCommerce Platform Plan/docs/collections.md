# Danh sách bảng CSDL — Sàn TMĐT B2B

> Tổng: **78 bảng** · Phân nhóm theo 16 domain nghiệp vụ  
> DBMS mục tiêu: PostgreSQL 15+  
> Encoding: UTF-8, Collation: vi_VN.utf8

| # | Phân nhóm | Tên bảng | Mô tả |
|---|-----------|----------|-------|
| 1 | Người dùng & Xác thực | `users` | Tài khoản người dùng (Buyer, Seller, Admin) |
| 2 | Người dùng & Xác thực | `shipping_addresses` | Địa chỉ giao hàng của người dùng |
| 3 | Người dùng & Xác thực | `notification_preferences` | Cấu hình nhận thông báo theo loại |
| 4 | Danh mục sản phẩm | `categories` | Danh mục sản phẩm dạng cây (self-ref) |
| 5 | Sản phẩm | `products` | Sản phẩm chính |
| 6 | Sản phẩm | `product_variants` | Biến thể sản phẩm (SKU, giá, tồn kho) |
| 7 | Sản phẩm | `product_images` | Ảnh sản phẩm (nhiều ảnh/sp) |
| 8 | Sản phẩm | `product_tags` | Tag sản phẩm (nhiều tag/sp) |
| 9 | Sản phẩm | `product_specifications` | Thông số kỹ thuật (key-value) |
| 10 | Nhà cung cấp | `suppliers` | Thông tin doanh nghiệp NCC |
| 11 | Nhà cung cấp | `supplier_categories` | Danh mục mà NCC kinh doanh (N-N) |
| 12 | Nhà cung cấp | `staff_members` | Nhân viên nội bộ của NCC |
| 13 | Nhà cung cấp | `business_certificates` | Chứng chỉ / giấy phép kinh doanh |
| 14 | Nhà cung cấp | `supplier_scorecards` | Bảng điểm NCC (tổng hợp hiệu suất) |
| 15 | Công ty mua hàng | `buyer_companies` | Thông tin doanh nghiệp mua hàng |
| 16 | Công ty mua hàng | `buyer_team_members` | Thành viên nhóm mua hàng |
| 17 | Đơn hàng | `orders` | Đơn hàng chính |
| 18 | Đơn hàng | `order_items` | Dòng sản phẩm trong đơn hàng |
| 19 | Đơn hàng | `order_templates` | Mẫu đơn hàng tái sử dụng |
| 20 | Đơn hàng | `order_template_items` | Dòng sản phẩm trong mẫu đơn |
| 21 | Giỏ hàng & Wishlist | `cart_items` | Giỏ hàng (per-user) |
| 22 | Giỏ hàng & Wishlist | `wishlist_folders` | Thư mục yêu thích |
| 23 | Giỏ hàng & Wishlist | `wishlist_items` | Sản phẩm yêu thích |
| 24 | RFQ & Báo giá | `rfqs` | Yêu cầu báo giá (Request for Quotation) |
| 25 | RFQ & Báo giá | `rfq_items` | Dòng sản phẩm trong RFQ |
| 26 | RFQ & Báo giá | `rfq_attachments` | Tệp đính kèm RFQ |
| 27 | RFQ & Báo giá | `quotations` | Bản báo giá từ NCC |
| 28 | RFQ & Báo giá | `quotation_items` | Dòng sản phẩm trong báo giá |
| 29 | Hợp đồng | `contracts` | Hợp đồng mua bán |
| 30 | Hợp đồng | `contract_items` | Dòng hàng hoá trong hợp đồng |
| 31 | Hợp đồng | `contract_milestones` | Mốc thanh toán / giao hàng |
| 32 | Kho hàng & Tồn kho | `warehouses` | Danh sách kho hàng |
| 33 | Kho hàng & Tồn kho | `inventory_items` | Tồn kho theo SP × Kho |
| 34 | Kho hàng & Tồn kho | `stock_movements` | Lịch sử xuất nhập kho |
| 35 | Kho hàng & Tồn kho | `stock_alerts` | Cảnh báo tồn kho (thấp/hết/chậm luân chuyển) |
| 36 | Kho hàng & Tồn kho | `warehouse_transfers` | Phiếu chuyển kho |
| 37 | Kho hàng & Tồn kho | `warehouse_transfer_items` | Dòng SP trong phiếu chuyển kho |
| 38 | Vận chuyển | `shipments` | Lô hàng vận chuyển |
| 39 | Vận chuyển | `shipment_events` | Sự kiện tracking vận chuyển |
| 40 | Vận chuyển | `shipping_rates` | Bảng giá vận chuyển theo hãng |
| 41 | Thanh toán | `payments` | Thanh toán đơn hàng |
| 42 | Thanh toán | `payment_transactions` | Giao dịch thanh toán từng phần |
| 43 | Hoá đơn | `invoices` | Hoá đơn bán hàng / trả hàng / điều chỉnh |
| 44 | Hoá đơn | `invoice_items` | Dòng chi tiết hoá đơn |
| 45 | Công nợ | `credit_limits` | Hạn mức tín dụng Buyer ↔ Seller |
| 46 | Công nợ | `credit_transactions` | Lịch sử sử dụng / thanh toán tín dụng |
| 47 | Ghi nợ / Ghi có | `debit_credit_notes` | Phiếu ghi nợ / ghi có |
| 48 | Ghi nợ / Ghi có | `debit_credit_items` | Dòng chi tiết phiếu ghi nợ/có |
| 49 | Trả hàng & Hoàn tiền | `return_requests` | Yêu cầu trả hàng |
| 50 | Trả hàng & Hoàn tiền | `return_items` | Dòng sản phẩm trả hàng |
| 51 | Trả hàng & Hoàn tiền | `return_images` | Ảnh minh chứng trả hàng |
| 52 | Đánh giá | `product_reviews` | Đánh giá sản phẩm |
| 53 | Đánh giá | `review_images` | Ảnh đính kèm đánh giá |
| 54 | Đánh giá | `review_tags` | Tag đánh giá (N-N) |
| 55 | Đánh giá | `supplier_reviews` | Đánh giá nhà cung cấp |
| 56 | Đánh giá | `supplier_review_tags` | Tag đánh giá NCC (N-N) |
| 57 | Khuyến mãi | `promotions` | Chương trình khuyến mãi |
| 58 | Khuyến mãi | `promotion_products` | SP áp dụng KM (N-N) |
| 59 | Khuyến mãi | `promotion_categories` | Danh mục áp dụng KM (N-N) |
| 60 | Khuyến mãi | `volume_discounts` | Bậc giảm giá theo SL |
| 61 | Phê duyệt nội bộ | `approval_requests` | Yêu cầu phê duyệt |
| 62 | Phê duyệt nội bộ | `approval_rules` | Quy tắc phê duyệt tự động |
| 63 | Yêu cầu mua hàng | `purchase_requisitions` | Yêu cầu mua hàng nội bộ (PR) |
| 64 | Yêu cầu mua hàng | `pr_items` | Dòng SP trong PR |
| 65 | Biên bản nhận hàng | `goods_received_notes` | Biên bản nhận hàng & QC |
| 66 | Biên bản nhận hàng | `grn_items` | Dòng SP trong GRN |
| 67 | Biên bản nhận hàng | `grn_images` | Ảnh minh chứng nhận hàng |
| 68 | Ngân sách | `budget_plans` | Kế hoạch ngân sách mua hàng |
| 69 | Ngân sách | `budget_allocations` | Phân bổ ngân sách theo bộ phận/danh mục |
| 70 | Ngân sách | `budget_transactions` | Lịch sử chi tiêu ngân sách |
| 71 | Đấu giá ngược | `reverse_auctions` | Phiên đấu giá ngược |
| 72 | Đấu giá ngược | `auction_items` | Hạng mục cần mua trong phiên |
| 73 | Đấu giá ngược | `auction_invited_suppliers` | NCC được mời (N-N) |
| 74 | Đấu giá ngược | `auction_bids` | Bản chào giá của NCC |
| 75 | Đấu giá ngược | `auction_bid_items` | Chi tiết giá từng hạng mục |
| 76 | Thoả thuận giá | `price_agreements` | Thoả thuận giá / HĐ khung |
| 77 | Thoả thuận giá | `price_agreement_items` | Dòng SP trong thoả thuận |
| 78 | Thoả thuận giá | `agreement_orders` | Đơn hàng liên kết theo thoả thuận |
| 79 | SLA | `sla_definitions` | Cam kết dịch vụ (SLA) |
| 80 | SLA | `sla_metrics` | Chỉ tiêu đo lường của SLA |
| 81 | SLA | `sla_reports` | Báo cáo đánh giá SLA theo kỳ |
| 82 | SLA | `sla_report_metrics` | Chi tiết chỉ tiêu trong báo cáo |
| 83 | Bảo hành | `warranties` | Phiếu bảo hành sản phẩm |
| 84 | Bảo hành | `warranty_claims` | Yêu cầu bảo hành |
| 85 | Bảo hành | `warranty_claim_images` | Ảnh minh chứng yêu cầu BH |
| 86 | Khách hàng thân thiết | `loyalty_programs` | Chương trình tích điểm |
| 87 | Khách hàng thân thiết | `loyalty_transactions` | Lịch sử tích/tiêu điểm |
| 88 | Khách hàng thân thiết | `loyalty_rewards` | Phần thưởng đổi điểm |
| 89 | Tài liệu | `documents` | Trung tâm tài liệu (mọi loại file) |
| 90 | Tài liệu | `document_tags` | Tag tài liệu (N-N) |
| 91 | Tích hợp | `integrations` | Kết nối hệ thống bên ngoài |
| 92 | Tích hợp | `webhook_endpoints` | Webhook endpoint |
| 93 | Tích hợp | `api_keys` | API key quản lý truy cập |
| 94 | Báo cáo tuỳ chỉnh | `report_definitions` | Định nghĩa báo cáo tuỳ chỉnh |
| 95 | Báo cáo tuỳ chỉnh | `report_columns` | Cột trong báo cáo |
| 96 | Báo cáo tuỳ chỉnh | `report_filters` | Bộ lọc của báo cáo |
| 97 | Thông báo | `notifications` | Thông báo hệ thống |
| 98 | Nhật ký | `activity_logs` | Nhật ký hoạt động (audit trail) |
| 99 | Cấu hình hệ thống | `system_configs` | Cấu hình chung toàn hệ thống |
| 100 | Cấu hình hệ thống | `platform_fees` | Phí sàn |
| 101 | Cấu hình hệ thống | `email_templates` | Mẫu email hệ thống |
| 102 | Cấu hình hệ thống | `banner_configs` | Cấu hình banner thông báo |
| 103 | Cấu hình hệ thống | `tax_configs` | Cấu hình thuế & thông tin xuất HĐ |

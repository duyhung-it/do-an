// ============================================================
// Dữ liệu giả lập bổ sung cho Admin — Chứng chỉ, Nhật ký,
// Hoá đơn, Cấu hình nâng cao
// ============================================================

import type {
  BusinessCertificate, ActivityLog, Invoice,
  AdminNotificationConfig, PlatformFee, MaintenanceConfig,
  EmailTemplate, BannerConfig, SEOConfig, AdminQuickStats, TaxConfig,
} from '../types';

// ============================================================
// Chứng chỉ doanh nghiệp
// ============================================================
export const mockCertificates: BusinessCertificate[] = [
  {
    id: 'cert-001', supplierId: 'sup-01', supplierName: 'Công ty TNHH Điện tử Phương Nam',
    type: 'Giấy phép kinh doanh', name: 'GPKD số 0301234567',
    issuedBy: 'Sở KH&ĐT TP.HCM', issuedDate: '2005-06-15', expiryDate: '2030-06-15',
    documentUrl: '/docs/gpkd-phuongnam.pdf', status: 'Đã xác minh',
    reviewNote: 'Hồ sơ hợp lệ', reviewedBy: 'Admin Hệ thống', reviewedAt: '2024-07-01',
    createdAt: '2024-06-20',
  },
  {
    id: 'cert-002', supplierId: 'sup-01', supplierName: 'Công ty TNHH Điện tử Phương Nam',
    type: 'ISO 9001', name: 'ISO 9001:2015 — Quản lý chất lượng',
    issuedBy: 'Bureau Veritas', issuedDate: '2022-01-10', expiryDate: '2025-01-10',
    documentUrl: '/docs/iso9001-phuongnam.pdf', status: 'Hết hạn',
    createdAt: '2024-06-20',
  },
  {
    id: 'cert-003', supplierId: 'sup-02', supplierName: 'Tập đoàn Dệt may Thành Công',
    type: 'Giấy phép kinh doanh', name: 'GPKD số 0302345678',
    issuedBy: 'Sở KH&ĐT TP.HCM', issuedDate: '1998-03-20', expiryDate: '2028-03-20',
    documentUrl: '/docs/gpkd-thanhcong.pdf', status: 'Đã xác minh',
    reviewNote: 'Đã xác minh xong', reviewedBy: 'Admin Hệ thống', reviewedAt: '2024-07-05',
    createdAt: '2024-06-25',
  },
  {
    id: 'cert-004', supplierId: 'sup-02', supplierName: 'Tập đoàn Dệt may Thành Công',
    type: 'ISO 14001', name: 'ISO 14001:2015 — Quản lý môi trường',
    issuedBy: 'TUV SUD', issuedDate: '2023-06-01', expiryDate: '2026-06-01',
    documentUrl: '/docs/iso14001-thanhcong.pdf', status: 'Đã xác minh',
    reviewedBy: 'Admin Hệ thống', reviewedAt: '2024-07-10',
    createdAt: '2024-07-01',
  },
  {
    id: 'cert-005', supplierId: 'sup-03', supplierName: 'Thép Hoà Phát',
    type: 'Giấy phép kinh doanh', name: 'GPKD số 0100123456',
    issuedBy: 'Sở KH&ĐT Hà Nội', issuedDate: '1992-08-10', expiryDate: '2032-08-10',
    documentUrl: '/docs/gpkd-hoaphat.pdf', status: 'Đã xác minh',
    reviewedBy: 'Admin Hệ thống', reviewedAt: '2024-07-15',
    createdAt: '2024-07-10',
  },
  {
    id: 'cert-006', supplierId: 'sup-03', supplierName: 'Thép Hoà Phát',
    type: 'ISO 9001', name: 'ISO 9001:2015 — Thép Hoà Phát',
    issuedBy: 'SGS', issuedDate: '2023-03-15', expiryDate: '2026-03-15',
    documentUrl: '/docs/iso9001-hoaphat.pdf', status: 'Đang xem xét',
    createdAt: '2025-03-01',
  },
  {
    id: 'cert-007', supplierId: 'sup-04', supplierName: 'Bao bì Đại Lục',
    type: 'Giấy phép kinh doanh', name: 'GPKD số 0400567890',
    issuedBy: 'Sở KH&ĐT Đà Nẵng', issuedDate: '2010-11-05', expiryDate: '2030-11-05',
    documentUrl: '/docs/gpkd-dailuc.pdf', status: 'Chưa xác minh',
    createdAt: '2025-02-15',
  },
  {
    id: 'cert-008', supplierId: 'sup-05', supplierName: 'Hoá chất Việt Trì',
    type: 'HACCP', name: 'Chứng nhận HACCP — An toàn hoá chất',
    issuedBy: 'Bộ Công Thương', issuedDate: '2024-01-20', expiryDate: '2025-04-20',
    documentUrl: '/docs/haccp-viettri.pdf', status: 'Đã xác minh',
    reviewedBy: 'Admin Hệ thống', reviewedAt: '2024-08-01',
    createdAt: '2024-07-20',
  },
  {
    id: 'cert-009', supplierId: 'sup-06', supplierName: 'Nông sản Mekong',
    type: 'Giấy phép kinh doanh', name: 'GPKD số 1800234567',
    issuedBy: 'Sở KH&ĐT Cần Thơ', issuedDate: '2008-04-01', expiryDate: '2028-04-01',
    documentUrl: '/docs/gpkd-mekong.pdf', status: 'Đã xác minh',
    reviewedBy: 'Admin Hệ thống', reviewedAt: '2024-09-01',
    createdAt: '2024-08-20',
  },
  {
    id: 'cert-010', supplierId: 'sup-06', supplierName: 'Nông sản Mekong',
    type: 'FDA', name: 'FDA Registration — Nông sản xuất khẩu',
    issuedBy: 'U.S. Food & Drug Administration', issuedDate: '2024-06-01', expiryDate: '2026-06-01',
    documentUrl: '/docs/fda-mekong.pdf', status: 'Từ chối',
    reviewNote: 'Tài liệu không rõ ràng, cần bổ sung bản dịch công chứng',
    reviewedBy: 'Admin Hệ thống', reviewedAt: '2025-01-15',
    createdAt: '2024-12-20',
  },
];

// ============================================================
// Nhật ký hoạt động
// ============================================================
export const mockActivityLogs: ActivityLog[] = [
  { id: 'log-001', userId: 'user-006', userName: 'Admin Hệ thống', userRole: 'Quản trị viên', action: 'Duyệt', entity: 'Sản phẩm', entityId: 'prod-001', entityName: 'Bo mạch Arduino Mega 2560', details: 'Duyệt sản phẩm mới từ NCC Phương Nam', ipAddress: '113.161.72.100', userAgent: 'Chrome 122 / Windows', createdAt: '2025-03-14 08:30' },
  { id: 'log-002', userId: 'user-004', userName: 'Nguyễn Văn An', userRole: 'Nhà cung cấp', action: 'Tạo', entity: 'Sản phẩm', entityId: 'prod-036', entityName: 'Module LoRa SX1278', details: 'Thêm sản phẩm mới', ipAddress: '113.161.72.105', userAgent: 'Chrome 122 / Windows', createdAt: '2025-03-14 08:15' },
  { id: 'log-003', userId: 'user-001', userName: 'Lê Hoàng Anh', userRole: 'Người mua', action: 'Tạo', entity: 'Đơn hàng', entityId: 'ord-030', entityName: 'DH-2025-00030', details: 'Đặt hàng mới — 2 sản phẩm, tổng 42.6tr', ipAddress: '115.73.214.50', userAgent: 'Safari 17 / macOS', createdAt: '2025-03-14 07:55' },
  { id: 'log-004', userId: 'user-006', userName: 'Admin Hệ thống', userRole: 'Quản trị viên', action: 'Sửa', entity: 'Người dùng', entityId: 'user-007', entityName: 'Phạm Minh Châu', details: 'Khoá tài khoản — vi phạm chính sách', ipAddress: '113.161.72.100', userAgent: 'Chrome 122 / Windows', createdAt: '2025-03-14 07:45' },
  { id: 'log-005', userId: 'user-005', userName: 'Trần Thị Bích', userRole: 'Nhà cung cấp', action: 'Sửa', entity: 'Sản phẩm', entityId: 'prod-007', entityName: 'Vải cotton 100% - trắng', details: 'Cập nhật giá từ 42,000 → 44,000', ipAddress: '113.161.72.110', userAgent: 'Firefox 123 / Windows', createdAt: '2025-03-14 07:30' },
  { id: 'log-006', userId: 'user-002', userName: 'Nguyễn Thị Mai', userRole: 'Người mua', action: 'Đăng nhập', entity: 'Phiên', entityId: 'session-456', entityName: 'Đăng nhập', details: 'Đăng nhập thành công', ipAddress: '42.118.100.20', userAgent: 'Chrome 122 / Android', createdAt: '2025-03-14 07:20' },
  { id: 'log-007', userId: 'user-006', userName: 'Admin Hệ thống', userRole: 'Quản trị viên', action: 'Duyệt', entity: 'Chứng chỉ', entityId: 'cert-006', entityName: 'ISO 9001:2015 — Thép Hoà Phát', details: 'Đang xem xét chứng chỉ ISO', ipAddress: '113.161.72.100', userAgent: 'Chrome 122 / Windows', createdAt: '2025-03-13 17:30' },
  { id: 'log-008', userId: 'user-004', userName: 'Nguyễn Văn An', userRole: 'Nhà cung cấp', action: 'Xuất dữ liệu', entity: 'Báo cáo', entityId: 'report-revenue', entityName: 'Báo cáo doanh thu T3/2025', details: 'Xuất CSV báo cáo doanh thu', ipAddress: '113.161.72.105', userAgent: 'Chrome 122 / Windows', createdAt: '2025-03-13 16:45' },
  { id: 'log-009', userId: 'user-001', userName: 'Lê Hoàng Anh', userRole: 'Người mua', action: 'Tạo', entity: 'RFQ', entityId: 'rfq-006', entityName: 'RFQ-202500006', details: 'Tạo yêu cầu báo giá mới — Hoá chất Việt Trì', ipAddress: '115.73.214.50', userAgent: 'Safari 17 / macOS', createdAt: '2025-03-13 16:00' },
  { id: 'log-010', userId: 'user-006', userName: 'Admin Hệ thống', userRole: 'Quản trị viên', action: 'Sửa', entity: 'Cấu hình', entityId: 'config-main', entityName: 'Cấu hình hệ thống', details: 'Thay đổi: Thuế GTGT 10% → 8%', ipAddress: '113.161.72.100', userAgent: 'Chrome 122 / Windows', createdAt: '2025-03-13 15:30' },
  { id: 'log-011', userId: 'user-003', userName: 'Trần Quốc Bảo', userRole: 'Người mua', action: 'Đăng nhập', entity: 'Phiên', entityId: 'session-789', entityName: 'Đăng nhập', details: 'Đăng nhập thành công', ipAddress: '27.72.56.130', userAgent: 'Chrome 122 / Windows', createdAt: '2025-03-13 14:20' },
  { id: 'log-012', userId: 'user-005', userName: 'Trần Thị Bích', userRole: 'Nhà cung cấp', action: 'Tạo', entity: 'Khuyến mãi', entityId: 'promo-007', entityName: 'TACO20', details: 'Tạo khuyến mãi mới — Giảm 20% vải cotton', ipAddress: '113.161.72.110', userAgent: 'Firefox 123 / Windows', createdAt: '2025-03-13 14:00' },
  { id: 'log-013', userId: 'user-006', userName: 'Admin Hệ thống', userRole: 'Quản trị viên', action: 'Từ chối', entity: 'Sản phẩm', entityId: 'prod-035', entityName: 'Sản phẩm vi phạm', details: 'Từ chối — mô tả sai quy cách, hình ảnh không đạt', ipAddress: '113.161.72.100', userAgent: 'Chrome 122 / Windows', createdAt: '2025-03-13 11:00' },
  { id: 'log-014', userId: 'user-004', userName: 'Nguyễn Văn An', userRole: 'Nhà cung cấp', action: 'Sửa', entity: 'Đơn hàng', entityId: 'ord-025', entityName: 'DH-2025-00025', details: 'Cập nhật trạng thái: Đang xử lý → Đang giao hàng', ipAddress: '113.161.72.105', userAgent: 'Chrome 122 / Windows', createdAt: '2025-03-13 10:30' },
  { id: 'log-015', userId: 'user-006', userName: 'Admin Hệ thống', userRole: 'Quản trị viên', action: 'Xoá', entity: 'Đánh giá', entityId: 'rev-99', entityName: 'Đánh giá spam', details: 'Xoá đánh giá spam — nội dung quảng cáo', ipAddress: '113.161.72.100', userAgent: 'Chrome 122 / Windows', createdAt: '2025-03-13 09:45' },
  { id: 'log-016', userId: 'user-008', userName: 'Đặng Thuỳ Dung', userRole: 'Người mua', action: 'Tạo', entity: 'Đánh giá', entityId: 'rev-8-1', entityName: 'Đánh giá Vải cotton', details: 'Đánh giá 2 sao — "Chất lượng chưa đạt"', ipAddress: '42.118.200.10', userAgent: 'Chrome 122 / Android', createdAt: '2025-03-12 18:00' },
  { id: 'log-017', userId: 'user-006', userName: 'Admin Hệ thống', userRole: 'Quản trị viên', action: 'Duyệt', entity: 'Chứng chỉ', entityId: 'cert-009', entityName: 'GPKD Nông sản Mekong', details: 'Xác minh GPKD thành công', ipAddress: '113.161.72.100', userAgent: 'Chrome 122 / Windows', createdAt: '2025-03-12 16:00' },
  { id: 'log-018', userId: 'user-004', userName: 'Nguyễn Văn An', userRole: 'Nhà cung cấp', action: 'Cập nhật quyền', entity: 'Nhân viên', entityId: 'staff-003', entityName: 'Lê Thuỳ Dung', details: 'Thêm quyền: warehouse.view, shipment.view', ipAddress: '113.161.72.105', userAgent: 'Chrome 122 / Windows', createdAt: '2025-03-12 15:00' },
  { id: 'log-019', userId: 'user-001', userName: 'Lê Hoàng Anh', userRole: 'Người mua', action: 'Đổi mật khẩu', entity: 'Tài khoản', entityId: 'user-001', entityName: 'Lê Hoàng Anh', details: 'Đổi mật khẩu thành công', ipAddress: '115.73.214.50', userAgent: 'Safari 17 / macOS', createdAt: '2025-03-12 14:30' },
  { id: 'log-020', userId: 'user-006', userName: 'Admin Hệ thống', userRole: 'Quản trị viên', action: 'Từ chối', entity: 'Chứng chỉ', entityId: 'cert-010', entityName: 'FDA Registration Mekong', details: 'Từ chối — thiếu bản dịch công chứng', ipAddress: '113.161.72.100', userAgent: 'Chrome 122 / Windows', createdAt: '2025-03-12 14:00' },
  { id: 'log-021', userId: 'user-005', userName: 'Trần Thị Bích', userRole: 'Nhà cung cấp', action: 'Tạo', entity: 'Hợp đồng', entityId: 'contract-003', entityName: 'HD-202500003', details: 'Tạo hợp đồng mới với Công ty CP XYZ', ipAddress: '113.161.72.110', userAgent: 'Firefox 123 / Windows', createdAt: '2025-03-12 11:00' },
  { id: 'log-022', userId: 'user-002', userName: 'Nguyễn Thị Mai', userRole: 'Người mua', action: 'Tạo', entity: 'RFQ', entityId: 'rfq-002', entityName: 'RFQ-202500002', details: 'Tạo yêu cầu báo giá vải cotton', ipAddress: '42.118.100.20', userAgent: 'Chrome 122 / Android', createdAt: '2025-03-11 16:30' },
  { id: 'log-023', userId: 'user-006', userName: 'Admin Hệ thống', userRole: 'Quản trị viên', action: 'Tạo', entity: 'Danh mục', entityId: 'cat-09', entityName: 'Phụ tùng ô tô', details: 'Thêm danh mục mới cấp 1', ipAddress: '113.161.72.100', userAgent: 'Chrome 122 / Windows', createdAt: '2025-03-11 15:00' },
  { id: 'log-024', userId: 'user-004', userName: 'Nguyễn Văn An', userRole: 'Nhà cung cấp', action: 'Đăng nhập', entity: 'Phiên', entityId: 'session-123', entityName: 'Đăng nhập', details: 'Đăng nhập thành công', ipAddress: '113.161.72.105', userAgent: 'Chrome 122 / Windows', createdAt: '2025-03-11 08:00' },
  { id: 'log-025', userId: 'user-006', userName: 'Admin Hệ thống', userRole: 'Quản trị viên', action: 'Sửa', entity: 'Người dùng', entityId: 'user-003', entityName: 'Trần Quốc Bảo', details: 'Chuyển trạng thái: Chờ xác minh → Hoạt động', ipAddress: '113.161.72.100', userAgent: 'Chrome 122 / Windows', createdAt: '2025-03-10 17:00' },
  { id: 'log-026', userId: 'user-008', userName: 'Đặng Thuỳ Dung', userRole: 'Người mua', action: 'Tạo', entity: 'Đơn hàng', entityId: 'ord-028', entityName: 'DH-2025-00028', details: 'Đặt hàng — Gạo ST25 + Hạt điều', ipAddress: '42.118.200.10', userAgent: 'Chrome 122 / Android', createdAt: '2025-03-10 14:00' },
  { id: 'log-027', userId: 'user-006', userName: 'Admin Hệ thống', userRole: 'Quản trị viên', action: 'Nhập dữ liệu', entity: 'Sản phẩm', entityId: 'batch-001', entityName: 'Nhập 50 sản phẩm', details: 'Nhập hàng loạt từ CSV — 50 SP, 48 thành công, 2 lỗi', ipAddress: '113.161.72.100', userAgent: 'Chrome 122 / Windows', createdAt: '2025-03-10 10:00' },
  { id: 'log-028', userId: 'user-004', userName: 'Nguyễn Văn An', userRole: 'Nhà cung cấp', action: 'Sửa', entity: 'Kho hàng', entityId: 'wh-01', entityName: 'Kho Tân Bình', details: 'Điều chỉnh tồn kho LED SMD: 500 → 450', ipAddress: '113.161.72.105', userAgent: 'Chrome 122 / Windows', createdAt: '2025-03-09 16:30' },
  { id: 'log-029', userId: 'user-006', userName: 'Admin Hệ thống', userRole: 'Quản trị viên', action: 'Đăng nhập', entity: 'Phiên', entityId: 'session-admin-01', entityName: 'Đăng nhập', details: 'Đăng nhập thành công', ipAddress: '113.161.72.100', userAgent: 'Chrome 122 / Windows', createdAt: '2025-03-09 08:00' },
  { id: 'log-030', userId: 'user-001', userName: 'Lê Hoàng Anh', userRole: 'Người mua', action: 'Đăng xuất', entity: 'Phiên', entityId: 'session-ah-01', entityName: 'Đăng xuất', details: 'Đăng xuất', ipAddress: '115.73.214.50', userAgent: 'Safari 17 / macOS', createdAt: '2025-03-08 18:00' },
];

// ============================================================
// Hoá đơn
// ============================================================
export const mockInvoices: Invoice[] = [
  {
    id: 'inv-001', invoiceNumber: 'HD-PN-202500001', orderId: 'ord-001', orderNumber: 'DH-2025-00001',
    type: 'Bán hàng', buyerId: 'user-001', buyerName: 'Lê Hoàng Anh',
    buyerCompany: 'Công ty TNHH ABC', buyerTaxCode: '0312345678',
    supplierId: 'sup-01', supplierName: 'Công ty TNHH Điện tử Phương Nam',
    supplierCompany: 'Công ty TNHH Điện tử Phương Nam', supplierTaxCode: '0301234567',
    items: [
      { description: 'Bo mạch Arduino Mega 2560', quantity: 200, unitPrice: 175000, amount: 35000000, taxRate: 10 },
      { description: 'Module WiFi ESP32', quantity: 500, unitPrice: 58000, amount: 29000000, taxRate: 10 },
    ],
    subtotal: 64000000, taxRate: 10, taxAmount: 6400000, totalAmount: 70400000,
    status: 'Đã thanh toán', issuedDate: '2025-03-05', dueDate: '2025-04-05', paidDate: '2025-03-05',
    notes: 'Thanh toán chuyển khoản', createdAt: '2025-03-05',
  },
  {
    id: 'inv-002', invoiceNumber: 'HD-PN-202500002', orderId: 'ord-002', orderNumber: 'DH-2025-00002',
    type: 'Bán hàng', buyerId: 'user-001', buyerName: 'Lê Hoàng Anh',
    buyerCompany: 'Công ty TNHH ABC', buyerTaxCode: '0312345678',
    supplierId: 'sup-01', supplierName: 'Công ty TNHH Điện tử Phương Nam',
    supplierCompany: 'Công ty TNHH Điện tử Phương Nam', supplierTaxCode: '0301234567',
    items: [
      { description: 'IC điều khiển STM32F4', quantity: 50, unitPrice: 85000, amount: 4250000, taxRate: 10 },
    ],
    subtotal: 4250000, taxRate: 10, taxAmount: 425000, totalAmount: 4675000,
    status: 'Đã gửi', issuedDate: '2025-03-08', dueDate: '2025-04-08',
    notes: 'Trả chậm 30 ngày', createdAt: '2025-03-08',
  },
  {
    id: 'inv-003', invoiceNumber: 'HD-TC-202500001', orderId: 'ord-003', orderNumber: 'DH-2025-00003',
    type: 'Bán hàng', buyerId: 'user-002', buyerName: 'Nguyễn Thị Mai',
    buyerCompany: 'Công ty CP XYZ', buyerTaxCode: '0313456789',
    supplierId: 'sup-02', supplierName: 'Tập đoàn Dệt may Thành Công',
    supplierCompany: 'Tập đoàn Dệt may Thành Công', supplierTaxCode: '0302345678',
    items: [
      { description: 'Vải cotton 100% - trắng', quantity: 2000, unitPrice: 44000, amount: 88000000, taxRate: 10 },
    ],
    subtotal: 88000000, taxRate: 10, taxAmount: 8800000, totalAmount: 96800000,
    status: 'Quá hạn', issuedDate: '2025-02-01', dueDate: '2025-03-01',
    notes: '', createdAt: '2025-02-01',
  },
  {
    id: 'inv-004', invoiceNumber: 'HD-HP-202500001', orderId: 'ord-006', orderNumber: 'DH-2025-00006',
    type: 'Bán hàng', buyerId: 'user-002', buyerName: 'Nguyễn Thị Mai',
    buyerCompany: 'Công ty CP XYZ', buyerTaxCode: '0313456789',
    supplierId: 'sup-03', supplierName: 'Thép Hoà Phát',
    supplierCompany: 'Thép Hoà Phát', supplierTaxCode: '0100123456',
    items: [
      { description: 'Thép cuộn cán nóng HRC', quantity: 25, unitPrice: 14800000, amount: 370000000, taxRate: 10 },
    ],
    subtotal: 370000000, taxRate: 10, taxAmount: 37000000, totalAmount: 407000000,
    status: 'Đã thanh toán', issuedDate: '2025-03-01', dueDate: '2025-05-01', paidDate: '2025-03-01',
    notes: 'Thanh toán L/C qua Vietcombank', createdAt: '2025-03-01',
  },
  {
    id: 'inv-005', invoiceNumber: 'HD-DL-202500001', orderId: 'ord-004', orderNumber: 'DH-2025-00004',
    type: 'Bán hàng', buyerId: 'user-003', buyerName: 'Trần Quốc Bảo',
    buyerCompany: 'DNTN Bảo Trần', buyerTaxCode: '0314567890',
    supplierId: 'sup-04', supplierName: 'Bao bì Đại Lục',
    supplierCompany: 'Bao bì Đại Lục', supplierTaxCode: '0400567890',
    items: [
      { description: 'Hộp carton 3 lớp A4', quantity: 5000, unitPrice: 3800, amount: 19000000, taxRate: 10 },
      { description: 'Băng keo OPP 48mm', quantity: 1000, unitPrice: 11500, amount: 11500000, taxRate: 10 },
    ],
    subtotal: 30500000, taxRate: 10, taxAmount: 3050000, totalAmount: 33550000,
    status: 'Đã xuất', issuedDate: '2025-03-10', dueDate: '2025-04-10',
    notes: 'COD khi giao hàng', createdAt: '2025-03-10',
  },
  {
    id: 'inv-006', invoiceNumber: 'HD-VT-202500001', orderId: 'ord-005', orderNumber: 'DH-2025-00005',
    type: 'Bán hàng', buyerId: 'user-008', buyerName: 'Đặng Thuỳ Dung',
    buyerCompany: 'Công ty CP Dung Đặng', buyerTaxCode: '0315678901',
    supplierId: 'sup-05', supplierName: 'Hoá chất Việt Trì',
    supplierCompany: 'Hoá chất Việt Trì', supplierTaxCode: '0200234567',
    items: [
      { description: 'NaOH vảy 99%', quantity: 5, unitPrice: 9500000, amount: 47500000, taxRate: 10 },
    ],
    subtotal: 47500000, taxRate: 10, taxAmount: 4750000, totalAmount: 52250000,
    status: 'Quá hạn', issuedDate: '2025-01-15', dueDate: '2025-02-15',
    notes: 'Công nợ quá hạn', createdAt: '2025-01-15',
  },
  {
    id: 'inv-007', invoiceNumber: 'HD-MK-202500001', orderId: 'ord-010', orderNumber: 'DH-2025-00010',
    type: 'Bán hàng', buyerId: 'user-008', buyerName: 'Đặng Thuỳ Dung',
    buyerCompany: 'Công ty CP Dung Đặng', buyerTaxCode: '0315678901',
    supplierId: 'sup-06', supplierName: 'Nông sản Mekong',
    supplierCompany: 'Nông sản Mekong', supplierTaxCode: '1800234567',
    items: [
      { description: 'Gạo ST25 xuất khẩu', quantity: 50, unitPrice: 19000000, amount: 950000000, taxRate: 5 },
      { description: 'Hạt điều WW320', quantity: 10, unitPrice: 95000000, amount: 950000000, taxRate: 5 },
    ],
    subtotal: 1900000000, taxRate: 5, taxAmount: 95000000, totalAmount: 1995000000,
    status: 'Đã thanh toán', issuedDate: '2025-02-28', dueDate: '2025-03-28', paidDate: '2025-03-15',
    notes: 'Nông sản — thuế suất 5%', createdAt: '2025-02-28',
  },
  {
    id: 'inv-008', invoiceNumber: 'HD-PN-202500003', orderId: 'ord-008', orderNumber: 'DH-2025-00008',
    type: 'Trả hàng', buyerId: 'user-003', buyerName: 'Trần Quốc Bảo',
    buyerCompany: 'DNTN Bảo Trần', buyerTaxCode: '0314567890',
    supplierId: 'sup-01', supplierName: 'Công ty TNHH Điện tử Phương Nam',
    supplierCompany: 'Công ty TNHH Điện tử Phương Nam', supplierTaxCode: '0301234567',
    items: [
      { description: 'Mạch nguồn 12V-5A (lỗi)', quantity: 20, unitPrice: 120000, amount: 2400000, taxRate: 10 },
    ],
    subtotal: -2400000, taxRate: 10, taxAmount: -240000, totalAmount: -2640000,
    status: 'Đã xuất', issuedDate: '2025-03-11', dueDate: '2025-03-11',
    notes: 'Hoá đơn trả hàng — 20 mạch nguồn lỗi', createdAt: '2025-03-11',
  },
  {
    id: 'inv-009', invoiceNumber: 'HD-PN-202500004', orderId: 'ord-015', orderNumber: 'DH-2025-00015',
    type: 'Bán hàng', buyerId: 'user-001', buyerName: 'Lê Hoàng Anh',
    buyerCompany: 'Công ty TNHH ABC', buyerTaxCode: '0312345678',
    supplierId: 'sup-01', supplierName: 'Công ty TNHH Điện tử Phương Nam',
    supplierCompany: 'Công ty TNHH Điện tử Phương Nam', supplierTaxCode: '0301234567',
    items: [
      { description: 'Cảm biến nhiệt độ DS18B20', quantity: 300, unitPrice: 35000, amount: 10500000, taxRate: 10 },
      { description: 'LED SMD 5050 RGB', quantity: 1000, unitPrice: 2500, amount: 2500000, taxRate: 10 },
    ],
    subtotal: 13000000, taxRate: 10, taxAmount: 1300000, totalAmount: 14300000,
    status: 'Bản nháp', issuedDate: '2025-03-14', dueDate: '2025-04-14',
    notes: 'Chưa phát hành', createdAt: '2025-03-14',
  },
  {
    id: 'inv-010', invoiceNumber: 'HD-TC-202500002', orderId: 'ord-020', orderNumber: 'DH-2025-00020',
    type: 'Điều chỉnh', buyerId: 'user-002', buyerName: 'Nguyễn Thị Mai',
    buyerCompany: 'Công ty CP XYZ', buyerTaxCode: '0313456789',
    supplierId: 'sup-02', supplierName: 'Tập đoàn Dệt may Thành Công',
    supplierCompany: 'Tập đoàn Dệt may Thành Công', supplierTaxCode: '0302345678',
    items: [
      { description: 'Điều chỉnh giá vải polyester', quantity: 500, unitPrice: -2000, amount: -1000000, taxRate: 10 },
    ],
    subtotal: -1000000, taxRate: 10, taxAmount: -100000, totalAmount: -1100000,
    status: 'Đã gửi', issuedDate: '2025-03-12', dueDate: '2025-03-12',
    notes: 'Hoá đơn điều chỉnh giảm giá theo thoả thuận', createdAt: '2025-03-12',
  },
];

// ============================================================
// Cấu hình thông tin thuế NCC
// ============================================================
export const mockTaxConfigs: TaxConfig[] = [
  { companyName: 'Công ty TNHH Điện tử Phương Nam', taxCode: '0301234567', address: '123 Nguyễn Huệ, Q.1, TP.HCM', bankAccount: '0071001234567', bankName: 'Vietcombank', phone: '0901234567', email: 'ketoan@phuongnam.vn' },
  { companyName: 'Tập đoàn Dệt may Thành Công', taxCode: '0302345678', address: '456 Lê Lợi, Q.1, TP.HCM', bankAccount: '19001234567890', bankName: 'Techcombank', phone: '0912345678', email: 'ketoan@thanhcong.vn' },
  { companyName: 'Thép Hoà Phát', taxCode: '0100123456', address: '789 Trần Hưng Đạo, Hà Nội', bankAccount: '12310001234567', bankName: 'BIDV', phone: '0923456789', email: 'ketoan@hoaphat.vn' },
  { companyName: 'Bao bì Đại Lục', taxCode: '0400567890', address: '321 Hai Bà Trưng, Đà Nẵng', bankAccount: '56010001234567', bankName: 'MB Bank', phone: '0934567890', email: 'ketoan@dailuc.vn' },
  { companyName: 'Hoá chất Việt Trì', taxCode: '0200234567', address: '654 Phạm Văn Đồng, Phú Thọ', bankAccount: '108001234567', bankName: 'Vietinbank', phone: '0945678901', email: 'ketoan@viettri.vn' },
];

// ============================================================
// Cấu hình nâng cao Admin
// ============================================================
export const mockAdminNotificationConfig: AdminNotificationConfig = {
  emailOnNewOrder: true,
  emailOnNewUser: true,
  emailOnNewRFQ: false,
  emailOnCertUpload: true,
  emailOnDispute: true,
  dailyDigest: true,
  weeklyReport: true,
};

export const mockPlatformFees: PlatformFee[] = [
  { id: 'fee-001', type: 'Phần trăm', value: 2.5, minFee: 10000, maxFee: 5000000, appliesTo: 'Đơn hàng' },
  { id: 'fee-002', type: 'Cố định', value: 50000, minFee: 50000, maxFee: 50000, appliesTo: 'Hoá đơn' },
  { id: 'fee-003', type: 'Phần trăm', value: 1.5, minFee: 5000, maxFee: 2000000, appliesTo: 'Đơn hàng' },
];

export const mockMaintenanceConfig: MaintenanceConfig = {
  isEnabled: false,
  message: 'Hệ thống đang bảo trì, vui lòng quay lại sau.',
  startTime: '2025-03-20 00:00',
  endTime: '2025-03-20 06:00',
  allowAdminAccess: true,
};

export const mockEmailTemplates: EmailTemplate[] = [
  { id: 'et-001', name: 'Đơn hàng mới', subject: 'Đơn hàng mới #{{orderNumber}}', body: 'Xin chào {{buyerName}},\n\nĐơn hàng #{{orderNumber}} đã được đặt thành công.\nTổng giá trị: {{totalAmount}}\n\nCảm ơn bạn đã mua hàng!', variables: ['orderNumber', 'buyerName', 'totalAmount'], isActive: true },
  { id: 'et-002', name: 'Xác nhận đơn hàng', subject: 'Đơn hàng #{{orderNumber}} đã được xác nhận', body: 'Xin chào {{buyerName}},\n\nĐơn hàng #{{orderNumber}} đã được NCC xác nhận.\nDự kiến giao: {{estimatedDelivery}}', variables: ['orderNumber', 'buyerName', 'estimatedDelivery'], isActive: true },
  { id: 'et-003', name: 'RFQ mới', subject: 'Yêu cầu báo giá mới #{{rfqNumber}}', body: 'Xin chào {{supplierName}},\n\nBạn nhận được yêu cầu báo giá mới #{{rfqNumber}} từ {{buyerName}}.\nVui lòng xem chi tiết và phản hồi.', variables: ['rfqNumber', 'supplierName', 'buyerName'], isActive: true },
  { id: 'et-004', name: 'Duyệt sản phẩm', subject: 'Sản phẩm "{{productName}}" đã được duyệt', body: 'Xin chào {{supplierName}},\n\nSản phẩm "{{productName}}" đã được duyệt và hiển thị trên sàn.', variables: ['productName', 'supplierName'], isActive: true },
  { id: 'et-005', name: 'Từ chối sản phẩm', subject: 'Sản phẩm "{{productName}}" bị từ chối', body: 'Xin chào {{supplierName}},\n\nSản phẩm "{{productName}}" bị từ chối.\nLý do: {{reason}}\nVui lòng chỉnh sửa và gửi lại.', variables: ['productName', 'supplierName', 'reason'], isActive: true },
  { id: 'et-006', name: 'Chứng chỉ được duyệt', subject: 'Chứng chỉ "{{certName}}" đã được xác minh', body: 'Xin chào {{supplierName}},\n\nChứng chỉ "{{certName}}" đã được xác minh thành công.\nDoanh nghiệp của bạn đã được đánh dấu "Đã xác minh" trên hệ thống.', variables: ['certName', 'supplierName'], isActive: true },
  { id: 'et-007', name: 'Công nợ quá hạn', subject: 'Nhắc nhở: Công nợ đơn hàng #{{orderNumber}} quá hạn', body: 'Xin chào {{buyerName}},\n\nCông nợ đơn hàng #{{orderNumber}} đã quá hạn thanh toán.\nSố tiền còn lại: {{remainingAmount}}\nVui lòng thanh toán sớm nhất có thể.', variables: ['orderNumber', 'buyerName', 'remainingAmount'], isActive: true },
  { id: 'et-008', name: 'Chào mừng thành viên', subject: 'Chào mừng {{fullName}} đến với B2B Marketplace!', body: 'Xin chào {{fullName}},\n\nChào mừng bạn đến với B2B Marketplace Việt Nam!\nTài khoản: {{email}}\nVai trò: {{role}}\n\nBắt đầu khám phá ngay!', variables: ['fullName', 'email', 'role'], isActive: true },
];

export const mockBannerConfigs: BannerConfig[] = [
  { id: 'banner-001', title: 'Flash Sale tháng 3!', message: 'Giảm giá đến 30% cho đơn hàng công nghiệp. Áp dụng đến 31/03.', type: 'success', link: '/promotions', isActive: true, startDate: '2025-03-01', endDate: '2025-03-31' },
  { id: 'banner-002', title: 'Bảo trì hệ thống', message: 'Hệ thống sẽ bảo trì vào 20/03 từ 0h-6h. Xin lỗi vì sự bất tiện.', type: 'warning', link: '', isActive: false, startDate: '2025-03-19', endDate: '2025-03-20' },
  { id: 'banner-003', title: 'Tính năng mới: RFQ', message: 'Bạn đã có thể gửi yêu cầu báo giá trực tiếp đến nhà cung cấp!', type: 'info', link: '/rfq', isActive: true, startDate: '2025-03-10', endDate: '2025-04-10' },
];

export const mockSEOConfig: SEOConfig = {
  siteTitle: 'B2B Marketplace Việt Nam — Sàn TMĐT B2B hàng đầu',
  siteDescription: 'Kết nối doanh nghiệp mua & bán hàng hoá công nghiệp, nông sản, linh kiện điện tử với hơn 1000 nhà cung cấp uy tín.',
  metaKeywords: 'B2B, marketplace, thương mại điện tử, nhà cung cấp, mua sỉ, công nghiệp, Việt Nam',
  ogImage: '/images/og-cover.jpg',
  robots: 'index, follow',
};

export const mockAdminQuickStats: AdminQuickStats = {
  pendingCerts: 2,
  pendingProducts: 5,
  overduePayments: 3,
  disputeOrders: 1,
  lowStockAlerts: 4,
  expiringContracts: 2,
};

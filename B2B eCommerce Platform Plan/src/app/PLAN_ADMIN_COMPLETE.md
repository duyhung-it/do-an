# KE HOACH CHI TIET: HOAN THIEN PHAN QUAN TRI (ADMIN)
## San TMDT B2B Marketplace — 320 buoc, 18 nhom, 10 dot trien khai
## Ngay lap: 14/03/2026

---

## PHAN TICH HIEN TRANG ADMIN

### 10 trang hien co:
| # | Trang               | File                     | Tinh nang hien tai                                          |
|---|---------------------|--------------------------|-------------------------------------------------------------|
| 1 | Tong quan           | AdminDashboard.tsx       | 4 KPI cards, bieu do cot/tron, canh bao, don gan nhat       |
| 2 | Nguoi dung          | UserManagement.tsx       | CRUD, DataTable, filter, inline edit, xem chi tiet          |
| 3 | Danh muc            | CategoryManagement.tsx   | CRUD, tree view, search, batch toggle, CategoryCombobox     |
| 4 | Duyet san pham      | ProductApproval.tsx      | Batch duyet/tu choi, search, preview dialog                 |
| 5 | Don hang            | OrderOverview.tsx        | Stats, DataTable, filter, chi tiet dialog, xuat CSV co ban  |
| 6 | Bao gia (RFQ)       | RFQManagement.tsx        | DataTable, filter, chi tiet RFQ + bao gia, thong ke         |
| 7 | Hop dong            | ContractManagement.tsx   | DataTable, filter, chi tiet hop dong, progress milestones   |
| 8 | Danh gia            | ReviewManagement.tsx     | Batch duyet/an, filter, xem chi tiet                        |
| 9 | Bao cao             | AdminReportPage.tsx      | Tong quan doanh thu, bieu do NCC, bang xep hang             |
|10 | Cau hinh            | SystemSettings.tsx       | Form cau hinh chung, validation, unsaved changes            |

### 10 sidebar items hien co:
Tong quan, Nguoi dung, Danh muc, Duyet SP, Don hang, Bao gia, Hop dong, Danh gia, Bao cao, Cau hinh

### Can them MOI (8 trang):
- Quan ly van chuyen (Shipments) — toan he thong
- Quan ly cong no (Payments) — toan he thong
- Quan ly khuyen mai (Promotions) — toan he thong
- Duyet chung chi DN (Certificates) — duyet chung chi NCC
- Nhat ky he thong (Activity Log) — audit trail
- Quan ly kho tong quan (Warehouses) — xem kho tat ca NCC
- Quan ly thue & hoa don (Invoices) — toan he thong
- Quan ly NCC nang cao (Suppliers) — chi tiet NCC + nhan vien + xep hang

### Can NANG CAP (10 trang cu):
- Moi trang cu deu can: bo loc nang cao, xuat du lieu, bulk actions, keyboard, accessibility
- Dashboard can them nhieu widget, thong bao lien ket
- SystemSettings can them nhieu nhom cau hinh moi

---

## =====================================================
## NHOM 1: TYPES & MOCK DATA BO SUNG CHO ADMIN
## 32 buoc | Dot 1
## =====================================================

### 1A. Types moi (12 buoc)
```
1A.01  Tao type CertificateType = 'Giay phep kinh doanh' | 'ISO 9001' | 'ISO 14001' | 'HACCP' | 'CE' | 'FDA' | 'Khac'
1A.02  Tao type VerificationStatus = 'Chua xac minh' | 'Dang xem xet' | 'Da xac minh' | 'Tu choi' | 'Het han'
1A.03  Tao interface BusinessCertificate { id, supplierId, supplierName, type: CertificateType, name, issuedBy, issuedDate, expiryDate, documentUrl, status: VerificationStatus, reviewNote?, reviewedBy?, reviewedAt?, createdAt }
1A.04  Tao type ActivityAction = 'Tao' | 'Sua' | 'Xoa' | 'Duyet' | 'Tu choi' | 'Dang nhap' | 'Dang xuat' | 'Xuat du lieu' | 'Nhap du lieu' | 'Doi mat khau' | 'Cap nhat quyen'
1A.05  Tao interface ActivityLog { id, userId, userName, userRole, action: ActivityAction, entity: string, entityId: string, entityName: string, details: string, ipAddress: string, userAgent: string, createdAt }
1A.06  Tao type InvoiceStatus = 'Ban nhap' | 'Da xuat' | 'Da gui' | 'Da thanh toan' | 'Qua han' | 'Da huy'
1A.07  Tao interface Invoice { id, invoiceNumber, orderId, orderNumber, type: 'Ban hang' | 'Tra hang' | 'Dieu chinh', buyerId, buyerName, buyerCompany, buyerTaxCode, supplierId, supplierName, supplierCompany, supplierTaxCode, items: InvoiceItem[], subtotal, taxRate, taxAmount, totalAmount, status: InvoiceStatus, issuedDate, dueDate, paidDate?, notes, createdAt }
1A.08  Tao interface InvoiceItem { description, quantity, unitPrice, amount, taxRate }
1A.09  Tao interface TaxConfig { companyName, taxCode, address, bankAccount, bankName, phone, email }
1A.10  Tao interface AdminNotificationConfig { emailOnNewOrder, emailOnNewUser, emailOnNewRFQ, emailOnCertUpload, emailOnDispute, dailyDigest, weeklyReport }
1A.11  Tao interface PlatformFee { type: 'Phan tram' | 'Co dinh', value: number, minFee: number, maxFee: number, appliesTo: 'Don hang' | 'Hoa don' }
1A.12  Tao interface MaintenanceConfig { isEnabled: boolean, message: string, startTime: string, endTime: string, allowAdminAccess: boolean }
```

### 1B. Mock Data bo sung (20 buoc)
```
1B.01  Tao mockCertificates: 10 ban ghi — gom du trang thai (Chua xac minh, Dang xem xet, Da xac minh, Tu choi, Het han), nhieu NCC
1B.02  Tao mockActivityLogs: 30 ban ghi — gom du loai action, nhieu user, nhieu entity (san pham/don hang/nguoi dung/RFQ/hop dong)
1B.03  Tao mockInvoices: 10 ban ghi — gom du trang thai, nhieu NCC va buyer
1B.04  Tao mockInvoiceItems: 20-25 dong chi tiet hoa don lien ket voi mockInvoices
1B.05  Tao mockTaxConfigs: 5 ban ghi (1 cho moi NCC)
1B.06  Tao mockAdminNotificationConfig: 1 ban ghi cau hinh mac dinh
1B.07  Tao mockPlatformFees: 3 ban ghi (phi % theo don hang, phi co dinh, phi hoa don)
1B.08  Tao mockMaintenanceConfig: 1 ban ghi mac dinh (isEnabled: false)
1B.09  Bo sung truong isVerified: boolean, verifiedAt?: string vao interface Supplier (types)
1B.10  Cap nhat mockSuppliers: them isVerified, verifiedAt cho tung NCC
1B.11  Bo sung truong loginCount: number, lastLoginIp?: string vao interface User (types)
1B.12  Cap nhat mockUsers: them loginCount, lastLoginIp
1B.13  Bo sung mockShipments them 5 ban ghi nua (tong 15+) de du du lieu cho Admin
1B.14  Bo sung mockPayments them 4 ban ghi nua (tong 10+) de du du lieu cho Admin
1B.15  Bo sung mockPromotions them 4 ban ghi nua (tong 10+) — nhieu NCC khac nhau
1B.16  Tao mockAdminQuickStats { pendingCerts, pendingProducts, overduePayments, disputeOrders, lowStockAlerts, expiringContracts }
1B.17  Tao mockEmailTemplates: 8 ban ghi { id, name, subject, body, variables, isActive }
1B.18  Tao mockBannerConfigs: 3 ban ghi { id, title, message, type, link, isActive, startDate, endDate }
1B.19  Tao mockSEOConfig { siteTitle, siteDescription, metaKeywords, ogImage, robots }
1B.20  Tao mockAPIKeys: 3 ban ghi { id, name, key (masked), permissions, createdAt, lastUsed, isActive }
```

---

## =====================================================
## NHOM 2: API SERVICES BO SUNG CHO ADMIN
## 28 buoc | Dot 1
## =====================================================

### 2A. Certificate API (6 buoc)
```
2A.01  Tao certificateApi.getAll(pagination, sort, filters, search) — phan trang + loc
2A.02  Tao certificateApi.getById(id) — chi tiet 1 chung chi
2A.03  Tao certificateApi.getBySeller(supplierId) — chung chi cua 1 NCC
2A.04  Tao certificateApi.review(id, status, note) — admin duyet/tu choi
2A.05  Tao certificateApi.getStats() — so luong theo trang thai
2A.06  Tao certificateApi.getExpiring(days) — chung chi sap het han trong X ngay
```

### 2B. Activity Log API (5 buoc)
```
2B.01  Tao activityApi.getPaginated(pagination, sort, filters, search) — phan trang
2B.02  Tao activityApi.getByUser(userId, limit) — nhat ky cua 1 user
2B.03  Tao activityApi.getByEntity(entity, entityId) — nhat ky cua 1 doi tuong
2B.04  Tao activityApi.getStats(dateRange) — thong ke so hanh dong theo loai, theo ngay
2B.05  Tao activityApi.log(data) — ghi nhat ky moi (goi tu cac API khac)
```

### 2C. Invoice API (6 buoc)
```
2C.01  Tao invoiceApi.getPaginated(pagination, sort, filters, search) — admin xem tat ca
2C.02  Tao invoiceApi.getById(id) — chi tiet hoa don
2C.03  Tao invoiceApi.getBySeller(supplierId) — hoa don cua 1 NCC
2C.04  Tao invoiceApi.getByBuyer(buyerId) — hoa don cua 1 buyer
2C.05  Tao invoiceApi.updateStatus(id, status) — cap nhat trang thai
2C.06  Tao invoiceApi.getStats() — tong hop: da xuat, cho thanh toan, qua han, doanh thu thue
```

### 2D. Admin-specific API (11 buoc)
```
2D.01  Tao adminApi.getQuickStats() — tra ve mockAdminQuickStats (pending items)
2D.02  Tao adminApi.getEmailTemplates(), updateEmailTemplate(id, data) — quan ly email template
2D.03  Tao adminApi.getBanners(), createBanner(data), updateBanner(id, data), deleteBanner(id) — quan ly banner
2D.04  Tao adminApi.getSEOConfig(), updateSEOConfig(data) — cau hinh SEO
2D.05  Tao adminApi.getAPIKeys(), createAPIKey(data), revokeAPIKey(id) — quan ly API key
2D.06  Tao adminApi.getMaintenanceConfig(), updateMaintenanceConfig(data) — bao tri
2D.07  Tao adminApi.getPlatformFees(), updatePlatformFee(id, data) — phi san
2D.08  Tao adminApi.getNotificationConfig(), updateNotificationConfig(data) — cau hinh thong bao
2D.09  Bo sung shipmentApi.getAllPaginated(pagination, sort, filters, search) — admin xem tat ca shipment
2D.10  Bo sung paymentApi.getAllPaginated(pagination, sort, filters, search) — admin xem tat ca payment
2D.11  Bo sung promotionApi.getAllPaginated(pagination, sort, filters, search) — admin xem tat ca promotion
```

---

## =====================================================
## NHOM 3: TRANG MOI — QUAN LY VAN CHUYEN TOAN HE THONG
## 18 buoc | Dot 2
## =====================================================

### 3A. AdminShipmentPage.tsx (18 buoc)
```
3A.01  Tao file AdminShipmentPage.tsx — khung co ban voi AppBreadcrumb, tieu de, container
3A.02  Stats cards: Tong van don, Dang van chuyen, Da giao, That bai, % giao thanh cong
3A.03  DataTable hien thi tat ca shipment: ma van don, ma don hang, NCC, Buyer, hang VC, trang thai
3A.04  Column config: cho phep an/hien cot (trackingNumber, carrier, weight, estimatedDelivery)
3A.05  Filter: trang thai van chuyen (Select), hang van chuyen (Select), khoang ngay tao (date range)
3A.06  Filter nang cao: NCC (combobox), Buyer (combobox), khoang can nang
3A.07  Search: tim theo ma van don, ma don hang, ten NCC, ten buyer
3A.08  Sort: theo ngay tao, ngay du kien giao, trang thai, NCC
3A.09  Phan trang: 10/25/50 dong, dieu huong trang
3A.10  Chi tiet van don (Dialog): thong tin day du, timeline tracking events
3A.11  Timeline tracking: hien thi moc thoi gian + dia diem + mo ta tu ShipmentEvent[]
3A.12  Hanh dong admin: cap nhat trang thai van don (select trang thai + ghi chu)
3A.13  Hanh dong admin: gan lai hang van chuyen (truong hop that bai)
3A.14  Bieu do: phan bo van don theo trang thai (PieChart)
3A.15  Bieu do: so luong van don theo thang (BarChart)
3A.16  Xuat CSV: xuat danh sach van don da loc ra CSV
3A.17  Badge canh bao: van don tre giao (qua ngay estimatedDelivery ma chua giao)
3A.18  Responsive: table scroll ngang tren mobile, stats stack 2 cot
```

---

## =====================================================
## NHOM 4: TRANG MOI — QUAN LY CONG NO TOAN HE THONG
## 20 buoc | Dot 2
## =====================================================

### 4A. AdminPaymentPage.tsx (20 buoc)
```
4A.01  Tao file AdminPaymentPage.tsx — khung co ban
4A.02  Stats cards: Tong cong no san, Da thu, Chua thu, Qua han, % thu hoi
4A.03  Stats card dac biet: Tong doanh thu thue (taxAmount tu invoices)
4A.04  DataTable: ma don, NCC, Buyer, tong tien, da tra, con lai, PP thanh toan, han tra, trang thai
4A.05  Column config: cho phep an/hien cot
4A.06  Filter: trang thai thanh toan (Select), phuong thuc (Select), khoang han tra (date range)
4A.07  Filter nang cao: NCC (combobox), Buyer (combobox), khoang tien (min-max)
4A.08  Search: tim theo ma don, ma hoa don, ten NCC, ten buyer
4A.09  Sort: theo han tra, so tien, trang thai, ngay tao
4A.10  Phan trang: 10/25/50 dong
4A.11  Chi tiet thanh toan (Dialog): lich su giao dich, thong tin 2 ben, hoa don lien quan
4A.12  Lich su giao dich: bang hien thi tung transaction (so tien, phuong thuc, ma GD, ngay)
4A.13  Hanh dong admin: ghi nhan thanh toan ho (truong hop NCC xac nhan offline)
4A.14  Hanh dong admin: gia han thanh toan (cap nhat dueDate)
4A.15  Hanh dong admin: danh dau qua han (batch update cac payment da qua dueDate)
4A.16  Bieu do: cong no theo trang thai (PieChart)
4A.17  Bieu do: doanh thu thu duoc theo thang (BarChart)
4A.18  Xuat CSV: xuat bao cao cong no
4A.19  Canh bao: highlight dong cong no qua han bang mau do
4A.20  Responsive: scroll ngang, stats stack
```

---

## =====================================================
## NHOM 5: TRANG MOI — QUAN LY KHUYEN MAI TOAN HE THONG
## 16 buoc | Dot 3
## =====================================================

### 5A. AdminPromotionPage.tsx (16 buoc)
```
5A.01  Tao file AdminPromotionPage.tsx — khung co ban
5A.02  Stats cards: Tong KM, Dang chay, Sap dien ra, Het han, Tong luot su dung
5A.03  DataTable: ma, ten, NCC, loai, gia tri, thoi han, luot dung, trang thai
5A.04  Column config: cho phep an/hien cot
5A.05  Filter: trang thai (Dang chay/Sap dien ra/Het han/Tat), loai giam gia, NCC
5A.06  Search: tim theo ma, ten khuyen mai, ten NCC
5A.07  Sort: theo ngay tao, luot dung, gia tri, NCC
5A.08  Phan trang: 10/25/50 dong
5A.09  Chi tiet khuyen mai (Dialog): thong tin day du, san pham ap dung, thong ke su dung
5A.10  Hanh dong admin: bat/tat khuyen mai (override NCC)
5A.11  Hanh dong admin: xoa khuyen mai vi pham chinh sach
5A.12  Bieu do: phan bo khuyen mai theo loai (PieChart)
5A.13  Bieu do: top 5 khuyen mai duoc su dung nhieu nhat (BarChart)
5A.14  Xuat CSV: xuat danh sach khuyen mai
5A.15  Canh bao: khuyen mai gia tri qua cao (> 50%), khuyen mai khong gioi han
5A.16  Responsive
```

---

## =====================================================
## NHOM 6: TRANG MOI — DUYET CHUNG CHI DOANH NGHIEP
## 22 buoc | Dot 3
## =====================================================

### 6A. AdminCertificateReview.tsx (22 buoc)
```
6A.01  Tao file AdminCertificateReview.tsx — khung co ban
6A.02  Stats cards: Tong chung chi, Cho duyet, Da xac minh, Tu choi, Sap het han
6A.03  DataTable: NCC, loai chung chi, ten, co quan cap, ngay cap, ngay het han, trang thai
6A.04  Column config: cho phep an/hien cot
6A.05  Filter: trang thai (Select), loai chung chi (Select), NCC (combobox)
6A.06  Filter nang cao: khoang ngay het han, co quan cap
6A.07  Search: tim theo ten NCC, ten chung chi, co quan cap
6A.08  Sort: theo ngay nop, ngay het han, trang thai, NCC
6A.09  Phan trang: 10/25/50 dong
6A.10  Xem chi tiet chung chi (Dialog): hien thi toan bo thong tin, preview tai lieu (gia lap)
6A.11  Nut "Xem tai lieu" — mo preview anh/PDF (gia lap voi placeholder)
6A.12  Form duyet: radio Xac minh / Tu choi, textarea ghi chu, nut Submit
6A.13  Batch duyet: chon nhieu chung chi + duyet/tu choi hang loat
6A.14  Sau khi duyet: tu dong cap nhat isVerified cua Supplier (goi supplierApi.update)
6A.15  Sau khi duyet: ghi nhat ky hoat dong (goi activityApi.log)
6A.16  Canh bao sap het han: highlight chung chi het han trong 30 ngay
6A.17  Canh bao da het han: highlight chung chi da het han + nut "Yeu cau gia han"
6A.18  Tab tong quan: so luong chung chi theo loai (PieChart)
6A.19  Tab tong quan: so NCC da xac minh vs chua xac minh (BarChart)
6A.20  Xuat CSV: xuat danh sach chung chi
6A.21  Gui thong bao cho NCC sau khi duyet (gia lap — toast + notification context)
6A.22  Responsive
```

---

## =====================================================
## NHOM 7: TRANG MOI — NHAT KY HE THONG (AUDIT LOG)
## 24 buoc | Dot 4
## =====================================================

### 7A. AdminActivityLog.tsx (24 buoc)
```
7A.01  Tao file AdminActivityLog.tsx — khung co ban
7A.02  Stats cards: Tong su kien hom nay, Tuan nay, Thang nay, Nguoi dung hoat dong
7A.03  Tabs: "Bang" (table view) va "Dong thoi gian" (timeline view)
7A.04  Tab Bang — DataTable: thoi gian, nguoi dung, vai tro, hanh dong, doi tuong, chi tiet, IP
7A.05  Column config: cho phep an/hien cot (IP, userAgent an mac dinh)
7A.06  Filter: nguoi dung (combobox), vai tro (Select), hanh dong (Select multi)
7A.07  Filter: doi tuong (San pham/Don hang/Nguoi dung/RFQ/Hop dong/Khuyen mai/Cau hinh)
7A.08  Filter: khoang thoi gian (date range picker)
7A.09  Search: tim theo ten nguoi dung, chi tiet, ten doi tuong
7A.10  Sort: theo thoi gian (mac dinh moi nhat), nguoi dung, hanh dong
7A.11  Phan trang: 25/50/100 dong (mac dinh 50)
7A.12  Tab Dong thoi gian — Timeline view: nhom theo ngay, hien thi tung su kien
7A.13  Timeline item: avatar + ten + hanh dong + doi tuong + thoi gian tuong doi ("5 phut truoc")
7A.14  Timeline: mau sac theo loai hanh dong (Tao=xanh, Sua=vang, Xoa=do, Duyet=tim, Dang nhap=xam)
7A.15  Timeline: lazy load — hien thi 20 su kien, nut "Xem them"
7A.16  Chi tiet su kien (Dialog): thong tin day du, JSON details, link den doi tuong lien quan
7A.17  Link doi tuong: click vao entityName -> navigate den trang tuong ung (/admin/users, /admin/orders, ...)
7A.18  Bieu do: so su kien theo loai hanh dong hom nay (BarChart)
7A.19  Bieu do: hoat dong theo gio trong ngay (AreaChart) — phat hien gio cao diem
7A.20  Bieu do: top 10 nguoi dung hoat dong nhieu nhat (BarChart ngang)
7A.21  Xuat CSV: xuat nhat ky da loc
7A.22  Auto-refresh: tu dong tai lai moi 30 giay (toggle bat/tat)
7A.23  Badge realtime: hien thi so su kien moi ke tu lan xem cuoi (tren sidebar)
7A.24  Responsive: timeline view full-width tren mobile, table scroll ngang
```

---

## =====================================================
## NHOM 8: TRANG MOI — QUAN LY THUE & HOA DON
## 20 buoc | Dot 4
## =====================================================

### 8A. AdminInvoicePage.tsx (20 buoc)
```
8A.01  Tao file AdminInvoicePage.tsx — khung co ban
8A.02  Stats cards: Tong hoa don, Da xuat, Cho thanh toan, Qua han, Tong doanh thu thue
8A.03  DataTable: so hoa don, ma don hang, NCC, Buyer, tong tien, thue, trang thai, ngay xuat
8A.04  Column config: cho phep an/hien cot
8A.05  Filter: trang thai (Select), loai hoa don (Ban hang/Tra hang/Dieu chinh), NCC, Buyer
8A.06  Filter nang cao: khoang tien, khoang ngay xuat, khoang ngay het han
8A.07  Search: tim theo so hoa don, ma don hang, ten NCC, ten buyer, ma so thue
8A.08  Sort: theo ngay xuat, tong tien, trang thai, NCC
8A.09  Phan trang: 10/25/50 dong
8A.10  Chi tiet hoa don (Dialog): layout hoa don chuyen nghiep (print-friendly)
8A.11  Layout hoa don: logo, thong tin 2 ben (ten, dia chi, MST), bang hang hoa, tong cong, thue
8A.12  Hanh dong admin: cap nhat trang thai hoa don
8A.13  Hanh dong admin: gui lai hoa don cho buyer (gia lap — toast)
8A.14  Xem truoc in (Print preview): CSS @media print, layout A4
8A.15  Bieu do: doanh thu thue theo thang (BarChart)
8A.16  Bieu do: phan bo hoa don theo trang thai (PieChart)
8A.17  Tong hop thue: bang tong hop thue GTGT theo thang (cho ke khai thue)
8A.18  Xuat CSV: xuat danh sach hoa don + xuat bang tong hop thue
8A.19  Canh bao: hoa don qua han chua thanh toan, hoa don sai thong tin MST
8A.20  Responsive
```

---

## =====================================================
## NHOM 9: TRANG MOI — QUAN LY NCC NANG CAO
## 20 buoc | Dot 5
## =====================================================

### 9A. AdminSupplierPage.tsx (20 buoc)
```
9A.01  Tao file AdminSupplierPage.tsx — khung co ban (tach khoi UserManagement de chi tap trung NCC)
9A.02  Stats cards: Tong NCC, Da xac minh, Chua xac minh, Bi khoa, Trung binh danh gia
9A.03  DataTable: ten NCC, cong ty, tinh/TP, danh gia, so SP, so don, doanh thu, xac minh, trang thai
9A.04  Column config: cho phep an/hien cot
9A.05  Filter: trang thai xac minh, trang thai hoat dong, tinh/TP, khoang danh gia
9A.06  Search: tim theo ten, cong ty, email, SDT
9A.07  Sort: theo doanh thu, so don, danh gia, ngay tao
9A.08  Phan trang: 10/25/50 dong
9A.09  ViewToggle: Bang / The (card view voi avatar + stats)
9A.10  Chi tiet NCC (Dialog hoac trang /admin/suppliers/:id):
9A.11    — Tab Tong quan: thong tin co ban, KPI (doanh thu, don hang, danh gia TB, ty le huy)
9A.12    — Tab San pham: danh sach SP cua NCC (inline table, link den ProductApproval)
9A.13    — Tab Don hang: danh sach don hang cua NCC (inline table)
9A.14    — Tab Chung chi: danh sach chung chi + trang thai (link den CertificateReview)
9A.15    — Tab Nhan vien: danh sach nhan vien cua NCC (readonly)
9A.16    — Tab Nhat ky: 20 hoat dong gan nhat cua NCC (tu activityApi)
9A.17  Hanh dong admin: khoa/mo khoa NCC
9A.18  Hanh dong admin: cap nhat trang thai xac minh thu cong
9A.19  Xuat CSV: xuat danh sach NCC
9A.20  Responsive
```

---

## =====================================================
## NHOM 10: NANG CAP — DASHBOARD (TONG QUAN)
## 22 buoc | Dot 5
## =====================================================

### 10A. AdminDashboard enhancements (22 buoc)
```
10A.01  Them ham adminApi.getQuickStats() va goi trong Dashboard
10A.02  Them KPI card: NCC da xac minh / Tong NCC (%)
10A.03  Them KPI card: Chung chi cho duyet (badge do)
10A.04  Them KPI card: Cong no qua han (badge do)
10A.05  Them KPI card: Hop dong sap het han (< 30 ngay)
10A.06  Them section "Can xu ly" — danh sach cac hang muc pending:
10A.07    — San pham cho duyet: so luong + link /admin/products
10A.08    — Chung chi cho duyet: so luong + link /admin/certificates
10A.09    — Cong no qua han: so luong + link /admin/payments
10A.10    — Don hang tranh chap: so luong + link /admin/orders?status=dispute
10A.11  Them section "Hoat dong gan nhat" — 10 su kien moi nhat tu activityApi (timeline mini)
10A.12  Them bieu do: Doanh thu 6 thang gan nhat (AreaChart)
10A.13  Them bieu do: So don hang theo tuan (BarChart)
10A.14  Them bieu do: NCC moi theo thang (LineChart)
10A.15  Them bieu do: Phan bo don hang theo trang thai (DonutChart)
10A.16  Widget "Top 5 NCC" — bang mini: ten, doanh thu, danh gia
10A.17  Widget "Top 5 san pham ban chay" — bang mini: ten, so luong ban, doanh thu
10A.18  Widget "Canh bao ton kho" — danh sach SP het hang / sap het tu tat ca NCC
10A.19  Date range picker: cho phep chon khoang thoi gian cho tat ca bieu do
10A.20  Auto-refresh toggle: tu dong cap nhat moi 60 giay
10A.21  Layout responsive: 1 cot mobile, 2 cot tablet, 3 cot desktop
10A.22  Skeleton loading cho tung section rieng biet (khong doi tat ca cung luc)
```

---

## =====================================================
## NHOM 11: NANG CAP — QUAN LY NGUOI DUNG
## 18 buoc | Dot 6
## =====================================================

### 11A. UserManagement enhancements (18 buoc)
```
11A.01  Them tab "Nguoi mua" / "NCC" / "Tat ca" — loc nhanh theo vai tro
11A.02  Them cot: so don hang, tong chi tieu / doanh thu, lan dang nhap cuoi
11A.03  Them filter: khoang ngay tao, khoang ngay dang nhap cuoi
11A.04  Them filter: tinh/TP (cho NCC), khoang tong chi tieu (cho buyer)
11A.05  Chi tiet nguoi dung (mo rong Dialog thanh full-page /admin/users/:id):
11A.06    — Tab Thong tin: form edit thong tin ca nhan, avatar, cong ty
11A.07    — Tab Don hang: 10 don hang gan nhat (DataTable mini)
11A.08    — Tab Danh gia: danh gia da viet / nhan duoc
11A.09    — Tab Nhat ky: 20 hoat dong gan nhat (tu activityApi)
11A.10  Hanh dong: doi mat khau ho (gia lap), gui email (gia lap)
11A.11  Hanh dong: ban user vinh vien voi ly do
11A.12  Bulk import: nut "Nhap tu CSV" — mo ImportDialog (shared component)
11A.13  Bulk export: xuat danh sach nguoi dung da loc ra CSV
11A.14  Thong ke: bieu do nguoi dung moi theo thang (BarChart mini phia tren)
11A.15  Thong ke: phan bo nguoi dung theo vai tro (PieChart mini)
11A.16  Xac nhan xoa: dialog xac nhan voi canh bao "User co X don hang, Y danh gia"
11A.17  Inline edit nhanh: role, status (da co — kiem tra va hoan thien)
11A.18  Responsive: card view tren mobile (thay vi table)
```

---

## =====================================================
## NHOM 12: NANG CAP — DANH MUC & DUYET SAN PHAM
## 16 buoc | Dot 6
## =====================================================

### 12A. CategoryManagement enhancements (8 buoc)
```
12A.01  Them truong SEO: meta title, meta description, meta keywords cho moi danh muc
12A.02  Them truong icon/image cho danh muc (URL, hien thi preview)
12A.03  Them truong sortOrder (thu tu hien thi) — inline edit
12A.04  Drag & drop sap xep danh muc (dung react-dnd trong tree view)
12A.05  Bulk import danh muc tu CSV (dung ImportDialog)
12A.06  Xuat CSV danh muc
12A.07  Hien thi so san pham + doanh thu theo danh muc (cot bo sung)
12A.08  Slug tu dong sinh tu ten (co the sua thu cong)
```

### 12B. ProductApproval enhancements (8 buoc)
```
12B.01  Them chi tiet san pham day du (anh, mo ta, thong so) trong preview dialog
12B.02  So sanh phien ban: hien thi thay doi giua phien ban cu va moi (khi NCC sua san pham da duyet)
12B.03  Tu choi voi ly do: textarea bat buoc khi tu choi, luu vao reviewNote
12B.04  Them cot: NCC, danh muc, gia, ton kho, ngay nop
12B.05  Them filter: NCC (combobox), danh muc (CategoryCombobox), khoang gia
12B.06  Them sort: theo gia, ngay nop, NCC
12B.07  Xuat CSV san pham cho duyet
12B.08  Auto-assign: tu dong phan cong nguoi duyet (gia lap — random admin)
```

---

## =====================================================
## NHOM 13: NANG CAP — DON HANG & DANH GIA
## 18 buoc | Dot 7
## =====================================================

### 13A. OrderOverview enhancements (10 buoc)
```
13A.01  Them timeline don hang trong dialog chi tiet (tuong tu Buyer OrderDetail)
13A.02  Them tab "Van chuyen" trong dialog: thong tin shipment, tracking
13A.03  Them tab "Thanh toan" trong dialog: thong tin payment, lich su giao dich
13A.04  Them tab "Hoa don" trong dialog: hoa don lien quan
13A.05  Hanh dong admin: huy don hang ho + ly do
13A.06  Hanh dong admin: xu ly tranh chap — form ghi nhan ket qua tranh chap
13A.07  Hanh dong admin: hoan tien (gia lap — cap nhat payment status)
13A.08  Them filter: NCC, Buyer, khoang tien, khoang ngay
13A.09  Them bieu do: doanh thu theo ngay (AreaChart, phia tren table)
13A.10  Xuat CSV nang cao: chon cot, chon khoang ngay
```

### 13B. ReviewManagement enhancements (8 buoc)
```
13B.01  Hien thi anh san pham ben canh danh gia
13B.02  Them cot: san pham, NCC, ngay mua (lien ket tu order)
13B.03  Them filter: khoang sao (1-2, 3, 4-5), co anh, co binh luan
13B.04  Phan hoi tu admin: form tra loi danh gia cong khai ("Phan hoi tu Ban QT")
13B.05  Auto-flag: tu dong danh dau danh gia chua tu khoa nhan cam (gia lap)
13B.06  Thong ke: trung binh sao toan san, phan bo sao (5 thanh), xu huong sao theo thang
13B.07  Xuat CSV danh gia
13B.08  Canh bao: danh gia 1 sao chua xu ly, danh gia bi bao cao
```

---

## =====================================================
## NHOM 14: NANG CAP — BAO GIA & HOP DONG
## 14 buoc | Dot 7
## =====================================================

### 14A. RFQManagement enhancements (7 buoc)
```
14A.01  Them hanh dong admin: can thiep RFQ — dong RFQ, gia han, thay doi NCC
14A.02  Them tab thong ke: so RFQ theo thang, ty le chuyen doi (RFQ -> don hang)
14A.03  Them bieu do: phan bo RFQ theo trang thai (PieChart)
14A.04  Them bieu do: gia tri RFQ theo thang (BarChart)
14A.05  Them filter: khoang gia tri, khoang ngay het han
14A.06  Xuat CSV danh sach RFQ
14A.07  Canh bao: RFQ sap het han (< 7 ngay) chua co bao gia
```

### 14B. ContractManagement enhancements (7 buoc)
```
14B.01  Them hanh dong admin: dong hop dong truoc han voi ly do
14B.02  Them hanh dong admin: gia han hop dong (cap nhat endDate)
14B.03  Them tab thong ke: gia tri hop dong theo thang, ty le hoan thanh milestones
14B.04  Them bieu do: phan bo hop dong theo trang thai + loai (BarChart grouped)
14B.05  Them filter: loai hop dong, khoang gia tri, khoang ngay ky
14B.06  Xuat CSV hop dong
14B.07  Canh bao: hop dong sap het han (< 30 ngay), hop dong co tranh chap
```

---

## =====================================================
## NHOM 15: NANG CAP — BAO CAO HE THONG (MO RONG)
## 18 buoc | Dot 8
## =====================================================

### 15A. AdminReportPage enhancements (18 buoc)
```
15A.01  Them Tabs: "Tong quan" / "Doanh thu" / "San pham" / "NCC" / "Nguoi mua" / "Van chuyen" / "Cong no"
15A.02  Tab Tong quan (da co): giu nguyen, them date range picker
15A.03  Tab Doanh thu: bieu do doanh thu theo ngay/tuan/thang/quy (tuong tu SellerReports)
15A.04  Tab Doanh thu: so sanh doanh thu 2 ky (ky hien tai vs ky truoc)
15A.05  Tab Doanh thu: top 10 don hang gia tri lon nhat
15A.06  Tab San pham: top ban chay, top doanh thu, top danh gia
15A.07  Tab San pham: san pham khong ban duoc (0 don hang trong 30 ngay)
15A.08  Tab San pham: phan bo san pham theo danh muc (Treemap chart)
15A.09  Tab NCC: xep hang NCC theo doanh thu, danh gia, so don (da co — mo rong)
15A.10  Tab NCC: NCC moi vs NCC cu (so sanh hoat dong)
15A.11  Tab NCC: NCC khong hoat dong (0 don hang trong 30 ngay)
15A.12  Tab Nguoi mua: top nguoi mua theo chi tieu, tan suat mua
15A.13  Tab Nguoi mua: ty le quay lai (so buyer co > 1 don hang / tong buyer)
15A.14  Tab Van chuyen: ty le giao thanh cong, thoi gian giao trung binh, top hang van chuyen
15A.15  Tab Cong no: tong cong no, tuoi no trung binh, ty le thu hoi, du bao dong tien
15A.16  Xuat bao cao: CSV cho tung tab
15A.17  In bao cao: CSS print layout cho tung tab
15A.18  Date range picker chung cho tat ca tabs
```

---

## =====================================================
## NHOM 16: NANG CAP — CAU HINH HE THONG (MO RONG)
## 22 buoc | Dot 8
## =====================================================

### 16A. SystemSettings mo rong (22 buoc)
```
16A.01  Chia SystemSettings thanh nhieu tabs: "Chung" / "Thong bao" / "Email" / "Phi san" / "SEO" / "Bao tri" / "API Keys" / "Giao dien"
16A.02  Tab Chung (da co): giu nguyen, cleanup UI
16A.03  Tab Thong bao: form cau hinh AdminNotificationConfig (toggle tung loai email)
16A.04  Tab Thong bao: cau hinh tan suat gui bao cao (hang ngay/hang tuan/hang thang)
16A.05  Tab Email: CRUD email templates (8 template: don hang moi, RFQ moi, duyet SP, ...)
16A.06  Tab Email: preview email template voi du lieu mau
16A.07  Tab Email: editor don gian (textarea voi bien {{orderNumber}}, {{userName}}, ...)
16A.08  Tab Phi san: cau hinh PlatformFee — phi % hoac co dinh theo loai giao dich
16A.09  Tab Phi san: preview phi cho don hang mau
16A.10  Tab SEO: form siteTitle, siteDescription, metaKeywords, ogImage, robots.txt
16A.11  Tab SEO: preview Google search snippet
16A.12  Tab Bao tri: toggle che do bao tri, cau hinh thoi gian, thong bao cho user
16A.13  Tab Bao tri: preview trang bao tri
16A.14  Tab API Keys: danh sach API keys (masked), tao moi, thu hoi, quyen truy cap
16A.15  Tab API Keys: copy key khi tao moi (chi hien 1 lan)
16A.16  Tab Giao dien: cau hinh banner trang chu (CRUD banners)
16A.17  Tab Giao dien: preview banner (title, message, type, link, thoi gian hien thi)
16A.18  Tab Giao dien: cau hinh mau sac thuong hieu (primary color, accent color)
16A.19  Tab Giao dien: toggle dark mode mac dinh
16A.20  Moi tab co nut Luu rieng, canh bao unsaved changes
16A.21  Nut "Khoi phuc mac dinh" cho tung tab
16A.22  Responsive: tabs chuyen thanh accordion tren mobile
```

---

## =====================================================
## NHOM 17: TRANG MOI — QUAN LY KHO TONG QUAN
## 14 buoc | Dot 9
## =====================================================

### 17A. AdminWarehousePage.tsx (14 buoc)
```
17A.01  Tao file AdminWarehousePage.tsx — tong quan kho hang toan he thong
17A.02  Stats cards: Tong kho, Tong SKU, Tong gia tri ton kho, SP het hang, SP sap het
17A.03  DataTable: NCC, ten kho, dia chi, cong suat, da su dung, %, trang thai
17A.04  Filter: NCC (combobox), tinh/TP, trang thai (hoat dong/ngung)
17A.05  Search: theo ten kho, ten NCC
17A.06  Sort: theo cong suat, % su dung, NCC
17A.07  Phan trang
17A.08  Chi tiet kho (Dialog): danh sach SP trong kho + ton kho + gia tri
17A.09  Bieu do: phan bo kho theo vung mien (BarChart)
17A.10  Bieu do: top 5 kho lon nhat (BarChart ngang)
17A.11  Canh bao: kho gan day (> 90% cong suat), kho co nhieu SP het hang
17A.12  Danh sach SP het hang toan he thong (tab rieng)
17A.13  Xuat CSV: danh sach kho + ton kho
17A.14  Responsive
```

---

## =====================================================
## NHOM 18: TICH HOP CHUNG & HOAN THIEN
## 32 buoc | Dot 9-10
## =====================================================

### 18A. Routes & Navigation (8 buoc)
```
18A.01  Them route /admin/shipments -> AdminShipmentPage
18A.02  Them route /admin/payments -> AdminPaymentPage
18A.03  Them route /admin/promotions -> AdminPromotionPage
18A.04  Them route /admin/certificates -> AdminCertificateReview
18A.05  Them route /admin/activity -> AdminActivityLog
18A.06  Them route /admin/invoices -> AdminInvoicePage
18A.07  Them route /admin/suppliers -> AdminSupplierPage (+ /admin/suppliers/:id)
18A.08  Them route /admin/warehouses -> AdminWarehousePage
```

### 18B. AdminLayout Sidebar (6 buoc)
```
18B.01  Cap nhat sidebar: them 8 menu item moi
18B.02  Nhom sidebar thanh cac section (dung Separator + label):
         — Tong quan: Dashboard
         — Quan ly: Nguoi dung, NCC, Danh muc
         — Giao dich: Don hang, Bao gia, Hop dong
         — Tai chinh: Cong no, Hoa don, Khuyen mai
         — Van hanh: Van chuyen, Kho hang, Chung chi
         — He thong: Danh gia, Bao cao, Nhat ky, Cau hinh
18B.03  Sidebar collapsible: thu gon chi hien icon (hover hien label)
18B.04  Badge tren sidebar: so luong pending items (Duyet SP, Chung chi, Cong no qua han)
18B.05  Active state: highlight menu hien tai + expand nhom tuong ung
18B.06  Responsive: bottom sheet hoac drawer tren mobile
```

### 18C. Shared Components nang cap (8 buoc)
```
18C.01  Tao shared ExportButton.tsx — component xuat CSV/Excel chung
18C.02  Tao shared ImportDialog.tsx — component nhap CSV/Excel chung (upload, preview, mapping, validate)
18C.03  Tao shared DateRangePicker.tsx — component chon khoang ngay (dung cho filter + bao cao)
18C.04  Tao shared StatsCard.tsx — component the thong ke tái su dung (icon, value, label, trend)
18C.05  Tao shared ChartCard.tsx — component wrapper bieu do (title, subtitle, responsive container)
18C.06  Tao shared ConfirmDialog.tsx — component xac nhan hanh dong chung (thay the confirm())
18C.07  Tao shared EmptyState.tsx — component trang thai trong (icon, message, action button)
18C.08  Tao shared ActivityTimeline.tsx — component timeline hoat dong tai su dung (Dashboard + UserDetail + SupplierDetail)
```

### 18D. Cross-cutting concerns (10 buoc)
```
18D.01  Them nut "Xuat CSV" vao tat ca trang DataTable cua Admin (dung ExportButton)
18D.02  Them keyboard shortcut Ctrl+K -> Command palette (tim trang, don hang, NCC)
18D.03  Them keyboard shortcut Ctrl+E -> Xuat CSV trang hien tai
18D.04  Them ARIA labels cho tat ca button, input, dialog trong Admin
18D.05  Them focus trap trong tat ca Dialog/Sheet
18D.06  Them skip link "Chuyen den noi dung chinh" phia tren AdminLayout
18D.07  Them ErrorBoundary bao quanh moi route con trong Admin
18D.08  Them skeleton loading (PageSkeleton) cho tat ca trang moi
18D.09  Dark mode: kiem tra va chinh mau cho tat ca component Admin moi
18D.10  Print layout: CSS @media print cho AdminReportPage va AdminInvoicePage
```

---

## =====================================================
## TONG KET
## =====================================================

### Thong ke theo nhom:
| # | Nhom                                     | Buoc  | Dot   |
|---|------------------------------------------|-------|-------|
| 1 | Types & Mock Data bo sung                | 32    | D1    |
| 2 | API Services bo sung                     | 28    | D1    |
| 3 | Admin Van chuyen (Trang moi)             | 18    | D2    |
| 4 | Admin Cong no (Trang moi)                | 20    | D2    |
| 5 | Admin Khuyen mai (Trang moi)             | 16    | D3    |
| 6 | Admin Chung chi DN (Trang moi)           | 22    | D3    |
| 7 | Admin Nhat ky he thong (Trang moi)       | 24    | D4    |
| 8 | Admin Thue & Hoa don (Trang moi)         | 20    | D4    |
| 9 | Admin Quan ly NCC nang cao (Trang moi)   | 20    | D5    |
|10 | Nang cap Dashboard                       | 22    | D5    |
|11 | Nang cap Nguoi dung                      | 18    | D6    |
|12 | Nang cap Danh muc + Duyet SP             | 16    | D6    |
|13 | Nang cap Don hang + Danh gia             | 18    | D7    |
|14 | Nang cap Bao gia + Hop dong              | 14    | D7    |
|15 | Nang cap Bao cao he thong                | 18    | D8    |
|16 | Nang cap Cau hinh he thong               | 22    | D8    |
|17 | Admin Kho tong quan (Trang moi)          | 14    | D9    |
|18 | Tich hop chung & Hoan thien              | 32    | D9-10 |
|---|------------------------------------------|-------|-------|
|   | TONG CONG                                | 320   | 10 dot|

### Thong ke theo loai:
- Trang moi:           8 trang (144 buoc)
- Nang cap trang cu:  10 trang (128 buoc)
- Infrastructure:      Types/Data/API/Shared/Routes (48 buoc)

### Ket qua sau khi hoan thanh:
- Admin se co 18 trang (tu 10 -> 18)
- Admin sidebar se co 18+ menu items nhom thanh 6 section
- Moi trang co: DataTable + Filter + Search + Sort + Phan trang + Export CSV
- Dashboard co 10+ widget, 5+ bieu do, section "Can xu ly"
- SystemSettings co 8 tabs cau hinh chi tiet
- Nhat ky he thong: audit trail toan bo hoat dong
- Quan ly NCC nang cao: chi tiet voi 6 tab
- Bao cao: 7 tab phan tich chi tiet
- Full responsive, dark mode, keyboard shortcuts, accessibility

### THU TU UU TIEN:
- Dot 1 (bat buoc truoc): Types + API — tat ca trang moi deu can
- Dot 2-4 (uu tien CAO): 5 trang moi quan trong nhat (Van chuyen, Cong no, Khuyen mai, Chung chi, Nhat ky)
- Dot 5-7 (uu tien TB): Nang cap Dashboard + cac trang cu
- Dot 8-10 (uu tien THAP hon): Bao cao mo rong, Cau hinh mo rong, Kho, Tich hop

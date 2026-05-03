# KE HOACH CHI TIET: TINH NANG DOANH NGHIEP B2B
## San TMDT B2B Marketplace - 312 buoc, 15 nhom tinh nang, 12 dot trien khai

> Ngay lap: 14/03/2026
> Trang thai hien tai: Dot 1-7 hoan tat (co ban Buyer/Seller/Admin)
> Muc tieu: Hoan thien toan bo tinh nang cap doanh nghiep

---

## PHAN TICH HIEN TRANG

### Da co:
- Buyer: 10 trang (Home, ProductList/Detail, Compare, Cart, OrderList/Detail, SupplierList/Detail, Chat, Profile)
- Seller: 7 trang (Dashboard, ProductList/Form, OrderList/Detail, Profile, Chat)
- Admin: 7 trang (Dashboard, UserMgmt, CategoryMgmt, ProductApproval, OrderOverview, ReviewMgmt, SystemSettings)
- Shared: 14 component (DataTable, FilterBar, ViewToggle, CategoryCombobox, FormDialog, StatusBadge, ChatPage, ErrorBoundary, PageSkeleton, AppBreadcrumb, NotificationDropdown, ProtectedRoute, SearchSuggestions, ScrollToTop)
- Infrastructure: Types, MockData, API Service Layer, Auth/Cart/Notification Context, Routes

### Con thieu (tinh nang doanh nghiep):
- Bao gia (RFQ), Hop dong, Kho hang, Van chuyen, Thanh toan B2B
- Nhan vien NCC, Bao cao nang cao, Khuyen mai, Chung chi DN
- Wishlist, Dat hang lap lai, Phe duyet noi bo, Thue & Hoa don
- Xuat/nhap du lieu, Nhat ky hoat dong, Dashboard KPI, Multi-currency
- Dat hang hang loat, Template don hang, Quan ly chi nhanh

---

## TONG QUAN 15 NHOM TINH NANG

| # | Nhom                              | So buoc | Dot     | Uu tien |
|---|-----------------------------------|---------|---------|---------|
| A | Bao gia (RFQ)                     | 28      | D1-D2   | Cao     |
| B | Quan ly hop dong                  | 24      | D2-D3   | Cao     |
| C | Quan ly kho hang                  | 26      | D3-D4   | Cao     |
| D | Van chuyen & Logistics            | 22      | D4-D5   | Cao     |
| E | Thanh toan B2B                    | 20      | D5-D6   | Cao     |
| F | Nhan vien & Phan quyen NCC        | 18      | D6      | TB      |
| G | Bao cao & Phan tich nang cao      | 24      | D7      | Cao     |
| H | Khuyen mai & Giam gia             | 20      | D7-D8   | TB      |
| I | Chung chi & Xac minh DN           | 16      | D8      | TB      |
| J | Wishlist & Dat hang lap lai       | 18      | D8-D9   | TB      |
| K | Phe duyet noi bo & Workflow       | 16      | D9      | TB      |
| L | Thue & Hoa don dien tu            | 20      | D9-D10  | Cao     |
| M | Xuat/Nhap du lieu & Tich hop      | 18      | D10-D11 | TB      |
| N | Nhat ky & Kiem toan               | 14      | D11     | TB      |
| O | Toi uu & Hoan thien               | 28      | D12     | Cao     |

Tong: 312 buoc / 12 dot

---

## =====================================================
## NHOM A: BAO GIA (RFQ - Request for Quotation)
## 28 buoc | Dot 1-2 | Uu tien CAO
## =====================================================

### A1. Types & Data (6 buoc)
```
A1.1  Tao type RFQStatus = 'Ban nhap' | 'Da gui' | 'Dang bao gia' | 'Da bao gia' | 'Chap nhan' | 'Tu choi' | 'Het han'
A1.2  Tao interface RFQItem { productId, productName, quantity, unit, targetPrice?, specifications?, notes? }
A1.3  Tao interface RFQ { id, rfqNumber, buyerId, buyerName, buyerCompany, supplierId?, supplierName?, items: RFQItem[], status, deliveryDate, paymentTerms, shippingTerms, notes, attachments: string[], createdAt, updatedAt, expiresAt }
A1.4  Tao interface Quotation { id, rfqId, supplierId, supplierName, items: QuotationItem[], totalAmount, validUntil, paymentTerms, deliveryDays, notes, status: 'Cho phan hoi' | 'Chap nhan' | 'Tu choi', createdAt }
A1.5  Tao interface QuotationItem { productName, quantity, unitPrice, totalPrice, notes }
A1.6  Them mockRFQs (5-8 ban ghi), mockQuotations (8-10 ban ghi) vao mockData.ts
```

### A2. API Service (5 buoc)
```
A2.1  Tao rfqApi.getByBuyer(buyerId) — lay danh sach RFQ cua buyer
A2.2  Tao rfqApi.getBySeller(supplierId) — lay danh sach RFQ gui den NCC
A2.3  Tao rfqApi.create(data) — buyer tao RFQ moi
A2.4  Tao rfqApi.updateStatus(id, status) — cap nhat trang thai
A2.5  Tao rfqApi.getPaginated(pagination, sort, filters, search) — phan trang + loc
A2.6  Tao quotationApi.create(data), getByRFQ(rfqId), accept(id), reject(id)
```

### A3. Buyer - Tao & Quan ly RFQ (9 buoc)
```
A3.1  Tao BuyerRFQListPage.tsx — hien thi danh sach RFQ cua buyer voi DataTable
A3.2  Them filter: trang thai, khoang ngay tao, NCC
A3.3  Them search theo ma RFQ, ten san pham
A3.4  Them stats card: Tong RFQ, Dang cho, Da bao gia, Da chap nhan
A3.5  Tao BuyerRFQCreatePage.tsx — form tao RFQ moi
A3.6  Form: chon NCC (combobox), them nhieu san pham (dong), so luong, gia muc tieu, ghi chu
A3.7  Validation: it nhat 1 san pham, so luong > 0, ngay giao phai tuong lai
A3.8  Tao BuyerRFQDetailPage.tsx — xem chi tiet RFQ + danh sach bao gia nhan duoc
A3.9  Trang chi tiet: so sanh cac bao gia (bang so sanh gia, dieu kien), chap nhan/tu choi bao gia
```

### A4. Seller - Nhan & Bao gia (5 buoc)
```
A4.1  Tao SellerRFQListPage.tsx — danh sach RFQ nhan duoc voi DataTable, filter, search
A4.2  Tao SellerRFQDetailPage.tsx — xem chi tiet RFQ cua buyer
A4.3  Tao form bao gia: nhap gia tung san pham, tong tien tu dong, thoi han bao gia, dieu kien thanh toan, thoi gian giao
A4.4  Xem lai bao gia da gui, cap nhat bao gia (neu chua het han)
A4.5  Dashboard widget: so RFQ moi, RFQ can phan hoi, ty le chap nhan
```

### A5. Routes & Navigation (3 buoc)
```
A5.1  Them routes: /rfq, /rfq/new, /rfq/:id (buyer); /seller/rfq, /seller/rfq/:id (seller)
A5.2  Them menu Buyer: "Yeu cau bao gia" vao navItems va dropdown
A5.3  Them menu Seller: "Bao gia" vao SellerLayout sidebar
```

---

## =====================================================
## NHOM B: QUAN LY HOP DONG
## 24 buoc | Dot 2-3 | Uu tien CAO
## =====================================================

### B1. Types & Data (5 buoc)
```
B1.1  Tao type ContractStatus = 'Ban nhap' | 'Cho ky' | 'Dang hieu luc' | 'Sap het han' | 'Het han' | 'Da huy'
B1.2  Tao interface Contract { id, contractNumber, title, buyerId, buyerName, buyerCompany, supplierId, supplierName, supplierCompany, type: 'Khung' | 'Don le' | 'Dai han', items: ContractItem[], totalValue, startDate, endDate, paymentTerms, deliveryTerms, penalties, status, signedByBuyer, signedBySeller, attachments, notes, createdAt, updatedAt }
B1.3  Tao interface ContractItem { productId, productName, quantity, unitPrice, totalPrice, deliverySchedule }
B1.4  Tao interface ContractHistory { id, contractId, action, performedBy, note, createdAt }
B1.5  Them mockContracts (5-6 ban ghi), mockContractHistory vao mockData.ts
```

### B2. API Service (4 buoc)
```
B2.1  Tao contractApi.getByBuyer(buyerId), getBySeller(supplierId)
B2.2  Tao contractApi.create(data), update(id, data), updateStatus(id, status)
B2.3  Tao contractApi.getPaginated(pagination, sort, filters)
B2.4  Tao contractApi.getHistory(contractId) — lich su thay doi
```

### B3. Buyer - Hop dong (6 buoc)
```
B3.1  Tao BuyerContractListPage.tsx — danh sach hop dong voi DataTable
B3.2  Filter: trang thai, loai hop dong, khoang ngay, NCC
B3.3  Stats: tong hop dong, dang hieu luc, sap het han (< 30 ngay), da het han
B3.4  Tao BuyerContractDetailPage.tsx — xem chi tiet hop dong
B3.5  Chi tiet: thong tin 2 ben, danh sach hang hoa, dieu khoan, lich su thay doi
B3.6  Hanh dong: ky hop dong (gia lap), in hop dong, tai file dinh kem, tao don hang tu hop dong
```

### B4. Seller - Hop dong (6 buoc)
```
B4.1  Tao SellerContractListPage.tsx — danh sach hop dong
B4.2  Tao SellerContractCreatePage.tsx — tao hop dong moi tu RFQ da chap nhan hoac tao moi
B4.3  Form: thong tin ben mua (combobox), danh sach san pham (tu kho), gia, dieu khoan
B4.4  Tao SellerContractDetailPage.tsx — chi tiet + ky hop dong
B4.5  Canh bao hop dong sap het han tren Dashboard
B4.6  Lien ket hop dong -> don hang: tao don hang tu hop dong voi gia da thoa thuan
```

### B5. Routes & Admin (3 buoc)
```
B5.1  Them routes buyer: /contracts, /contracts/:id
B5.2  Them routes seller: /seller/contracts, /seller/contracts/new, /seller/contracts/:id
B5.3  Admin: trang quan ly hop dong toan he thong /admin/contracts — view only + thong ke
```

---

## =====================================================
## NHOM C: QUAN LY KHO HANG
## 26 buoc | Dot 3-4 | Uu tien CAO
## =====================================================

### C1. Types & Data (6 buoc)
```
C1.1  Tao interface Warehouse { id, name, address, city, supplierId, capacity, currentStock, isActive }
C1.2  Tao type StockMovementType = 'Nhap kho' | 'Xuat kho' | 'Chuyen kho' | 'Dieu chinh' | 'Tra hang'
C1.3  Tao interface StockMovement { id, warehouseId, warehouseName, productId, productName, type, quantity, previousStock, newStock, orderId?, reason, performedBy, createdAt }
C1.4  Tao interface StockAlert { id, productId, productName, warehouseId, currentStock, minStock, status: 'Thap' | 'Het' }
C1.5  Tao interface InventorySummary { totalSKU, totalStock, lowStockCount, outOfStockCount, totalValue }
C1.6  Them mockWarehouses (3 kho), mockStockMovements (15-20), mockStockAlerts vao mockData.ts
```

### C2. API Service (5 buoc)
```
C2.1  Tao warehouseApi.getBySeller(supplierId), create, update, delete
C2.2  Tao inventoryApi.getStock(supplierId, warehouseId?) — so luong ton kho theo SP
C2.3  Tao inventoryApi.getMovements(supplierId, pagination, filters) — lich su xuat nhap
C2.4  Tao inventoryApi.adjustStock(productId, warehouseId, quantity, reason) — dieu chinh
C2.5  Tao inventoryApi.getAlerts(supplierId) — canh bao ton kho thap
```

### C3. Seller - Quan ly kho (12 buoc)
```
C3.1   Tao SellerWarehouseListPage.tsx — danh sach kho hang voi DataTable
C3.2   CRUD kho: them/sua/xoa kho, validation ten + dia chi
C3.3   Hien thi: cong suat, da su dung, % su dung (progress bar)
C3.4   Tao SellerInventoryPage.tsx — tong quan ton kho tat ca san pham
C3.5   DataTable: ten SP, SKU, kho, ton kho, gia tri, trang thai (Du/Thap/Het)
C3.6   Filter: kho hang, trang thai ton kho, danh muc
C3.7   ViewToggle: bang / luoi (card voi progress)
C3.8   Inline edit: dieu chinh so luong ton kho nhanh (voi ly do)
C3.9   Tao SellerStockMovementPage.tsx — lich su xuat nhap kho
C3.10  Filter: loai (Nhap/Xuat/Dieu chinh), khoang ngay, san pham, kho
C3.11  Form nhap/xuat kho thu cong: chon SP, kho, so luong, ly do
C3.12  Canh bao ton kho: danh sach SP gan het/het hang, nut dat hang bo sung
```

### C4. Tich hop (3 buoc)
```
C4.1  Tu dong giam ton kho khi don hang duoc xac nhan (hook vao orderApi.updateStatus)
C4.2  Tu dong tang ton kho khi don hang bi huy/hoan tra
C4.3  Dashboard Seller: them widget canh bao ton kho thap + link nhanh
```

---

## =====================================================
## NHOM D: VAN CHUYEN & LOGISTICS
## 22 buoc | Dot 4-5 | Uu tien CAO
## =====================================================

### D1. Types & Data (5 buoc)
```
D1.1  Tao type ShipmentStatus = 'Chuan bi' | 'Da lay hang' | 'Dang van chuyen' | 'Dang giao' | 'Da giao' | 'That bai'
D1.2  Tao interface Shipment { id, orderId, orderNumber, trackingNumber, carrier, carrierName, status, estimatedDelivery, actualDelivery?, weight, dimensions, shippingFee, fromAddress, toAddress, events: ShipmentEvent[], createdAt }
D1.3  Tao interface ShipmentEvent { timestamp, location, status, description }
D1.4  Tao interface ShippingRate { carrierId, carrierName, serviceName, estimatedDays, price, currency }
D1.5  Them mockShipments (8-10), mockCarriers vao mockData.ts
```

### D2. API Service (4 buoc)
```
D2.1  Tao shipmentApi.getByOrder(orderId), getBySeller(supplierId), getByBuyer(buyerId)
D2.2  Tao shipmentApi.create(data), updateStatus(id, status, event)
D2.3  Tao shipmentApi.getTracking(trackingNumber) — theo doi thoi gian thuc
D2.4  Tao shipmentApi.calculateRate(fromCity, toCity, weight) — tinh phi van chuyen
```

### D3. Buyer - Theo doi van chuyen (5 buoc)
```
D3.1  Them tab "Van chuyen" trong OrderDetailPage — timeline tracking
D3.2  Tracking timeline: moc thoi gian + dia diem + trang thai tu ShipmentEvent
D3.3  Thong tin van chuyen: ma van don, hang van chuyen, ngay du kien
D3.4  Tao BuyerShipmentListPage.tsx — danh sach tat ca kien hang dang van chuyen
D3.5  Filter: trang thai, hang van chuyen, khoang ngay
```

### D4. Seller - Quan ly van chuyen (6 buoc)
```
D4.1  Tao SellerShipmentListPage.tsx — danh sach van don
D4.2  Stats: cho gui, dang van chuyen, da giao, that bai
D4.3  Tao van don tu don hang: chon hang van chuyen, nhap tracking, can nang
D4.4  Cap nhat trang thai van chuyen: timeline steps cho NCC
D4.5  Tinh phi van chuyen tu dong khi tao van don
D4.6  In phieu gui hang (layout in an)
```

### D5. Routes & Tich hop (2 buoc)
```
D5.1  Them routes: /shipments (buyer), /seller/shipments (seller)
D5.2  Tich hop: tu dong tao shipment khi don hang chuyen sang "Dang giao hang"
```

---

## =====================================================
## NHOM E: THANH TOAN B2B
## 20 buoc | Dot 5-6 | Uu tien CAO
## =====================================================

### E1. Types & Data (5 buoc)
```
E1.1  Tao type PaymentStatus = 'Cho thanh toan' | 'Da thanh toan mot phan' | 'Da thanh toan' | 'Qua han' | 'Hoan tien'
E1.2  Tao type PaymentMethod = 'Chuyen khoan' | 'COD' | 'L/C' | 'Tra cham 30 ngay' | 'Tra cham 60 ngay' | 'Tra cham 90 ngay'
E1.3  Tao interface Payment { id, orderId, orderNumber, amount, paidAmount, remainingAmount, method, status, dueDate, transactions: PaymentTransaction[], buyerId, buyerName, supplierId, supplierName, invoiceNumber, createdAt }
E1.4  Tao interface PaymentTransaction { id, paymentId, amount, method, transactionRef, bankName?, note, paidAt }
E1.5  Them mockPayments (8-10 ban ghi), mockTransactions vao mockData.ts
```

### E2. API Service (3 buoc)
```
E2.1  Tao paymentApi.getByBuyer(buyerId), getBySeller(supplierId), getByOrder(orderId)
E2.2  Tao paymentApi.getPaginated(pagination, sort, filters)
E2.3  Tao paymentApi.recordTransaction(paymentId, transaction) — ghi nhan thanh toan
```

### E3. Buyer - Thanh toan (5 buoc)
```
E3.1  Tao BuyerPaymentListPage.tsx — danh sach cong no / thanh toan
E3.2  DataTable: ma don, NCC, tong tien, da tra, con lai, han tra, trang thai
E3.3  Filter: trang thai, khoang han tra, NCC
E3.4  Stats: tong cong no, qua han, da thanh toan thang nay
E3.5  Chi tiet thanh toan: lich su giao dich, xac nhan chuyen khoan (upload chung tu)
```

### E4. Seller - Cong no (5 buoc)
```
E4.1  Tao SellerPaymentListPage.tsx — danh sach cong no phai thu
E4.2  Stats: tong phai thu, da thu thang nay, qua han, trung binh ngay thu tien
E4.3  Ghi nhan thanh toan: form nhap so tien nhan, phuong thuc, ma giao dich
E4.4  Lich su giao dich theo tung don hang
E4.5  Xuat bao cao cong no (CSV)
```

### E5. Routes (2 buoc)
```
E5.1  Them routes: /payments (buyer), /seller/payments (seller)
E5.2  Menu navigation cho ca 2 phia
```

---

## =====================================================
## NHOM F: NHAN VIEN & PHAN QUYEN NCC
## 18 buoc | Dot 6 | Uu tien TB
## =====================================================

### F1. Types & Data (4 buoc)
```
F1.1  Tao type StaffRole = 'Chu DN' | 'Quan ly' | 'Nhan vien ban hang' | 'Thu kho' | 'Ke toan'
F1.2  Tao interface StaffMember { id, supplierId, fullName, email, phone, role, permissions: string[], isActive, lastLogin?, createdAt }
F1.3  Tao interface Permission { key: string, label: string, group: string }
F1.4  Them mockStaffMembers (5-6 nhan vien), mockPermissions (15-20 quyen) vao mockData.ts
```

### F2. API Service (3 buoc)
```
F2.1  Tao staffApi.getBySeller(supplierId), create, update, delete
F2.2  Tao staffApi.updatePermissions(staffId, permissions)
F2.3  Tao staffApi.toggleActive(staffId, isActive)
```

### F3. Seller - Quan ly nhan vien (8 buoc)
```
F3.1  Tao SellerStaffListPage.tsx — danh sach nhan vien voi DataTable
F3.2  CRUD nhan vien: form them/sua (ten, email, SDT, vai tro)
F3.3  Phan quyen: checkbox matrix (nhom quyen x hanh dong)
F3.4  Nhom quyen: San pham (xem/tao/sua/xoa), Don hang (xem/xu ly), Kho (xem/xuat/nhap), Bao cao (xem), Chat (xem/tra loi)
F3.5  Xoa nhan vien: dialog xac nhan, chi xoa neu khong co hoat dong gan
F3.6  Kich hoat / Vo hieu hoa nhan vien
F3.7  Hien thi lan dang nhap cuoi, trang thai online
F3.8  Filter: vai tro, trang thai hoat dong
```

### F4. Routes (3 buoc)
```
F4.1  Them route: /seller/staff, /seller/staff/:id
F4.2  Them menu SellerLayout: "Nhan vien"
F4.3  Middleware: kiem tra quyen truoc khi truy cap trang (mock)
```

---

## =====================================================
## NHOM G: BAO CAO & PHAN TICH NANG CAO
## 24 buoc | Dot 7 | Uu tien CAO
## =====================================================

### G1. Types (3 buoc)
```
G1.1  Tao interface ReportFilter { dateRange: [string, string], groupBy: 'day' | 'week' | 'month' | 'quarter', supplierId?, categoryId?, status? }
G1.2  Tao interface RevenueReport { period, revenue, orders, avgOrderValue, growth }
G1.3  Tao interface ProductReport { productId, name, unitsSold, revenue, returnRate, avgRating }
```

### G2. API Service (4 buoc)
```
G2.1  Tao reportApi.getRevenue(filter) — bao cao doanh thu
G2.2  Tao reportApi.getProducts(filter) — bao cao san pham
G2.3  Tao reportApi.getCustomers(filter) — bao cao khach hang (cho Seller)
G2.4  Tao reportApi.getSystemOverview(filter) — bao cao tong quan (cho Admin)
```

### G3. Seller - Bao cao (10 buoc)
```
G3.1  Tao SellerRevenueReport.tsx — bao cao doanh thu
G3.2  Bieu do duong: doanh thu theo thoi gian (ngay/tuan/thang)
G3.3  Bieu do cot: so sanh doanh thu cac thang
G3.4  KPI cards: doanh thu, tang truong, don hang, gia tri trung binh
G3.5  Tao SellerProductReport.tsx — bao cao san pham
G3.6  Bang xep hang SP ban chay, SP doanh thu cao, SP danh gia tot
G3.7  Bieu do tron: phan bo doanh thu theo danh muc
G3.8  Tao SellerCustomerReport.tsx — bao cao khach hang
G3.9  Top khach hang, tan suat mua, gia tri trung binh, ty le quay lai
G3.10 Xuat bao cao: CSV, in trang (print layout)
```

### G4. Admin - Bao cao he thong (5 buoc)
```
G4.1  Tao AdminReportPage.tsx — tong hop bao cao toan he thong
G4.2  Bieu do: doanh thu toan san, so NCC hoat dong, so nguoi mua moi
G4.3  Bang xep hang NCC theo doanh thu, danh gia, don hang
G4.4  Phan tich xu huong: san pham hot, danh muc tang truong
G4.5  Filter: khoang thoi gian, danh muc, vung mien
```

### G5. Routes (2 buoc)
```
G5.1  Them routes: /seller/reports, /seller/reports/revenue, /seller/reports/products, /seller/reports/customers
G5.2  Them route: /admin/reports
```

---

## =====================================================
## NHOM H: KHUYEN MAI & GIAM GIA
## 20 buoc | Dot 7-8 | Uu tien TB
## =====================================================

### H1. Types & Data (5 buoc)
```
H1.1  Tao type DiscountType = 'Phan tram' | 'So tien' | 'Mua X tang Y' | 'Giam gia theo so luong'
H1.2  Tao interface Promotion { id, code, name, description, type, value, minOrderValue, maxDiscount, startDate, endDate, usageLimit, usedCount, applicableProducts: string[], applicableCategories: string[], supplierId, isActive, createdAt }
H1.3  Tao interface VolumeDiscount { minQty, maxQty, discountPercent }
H1.4  Tao interface PromotionUsage { id, promotionId, orderId, userId, discountAmount, usedAt }
H1.5  Them mockPromotions (5-6), mockVolumeDiscounts, mockUsages vao mockData.ts
```

### H2. API Service (3 buoc)
```
H2.1  Tao promotionApi.getBySeller(supplierId), create, update, delete, toggleActive
H2.2  Tao promotionApi.validate(code, orderItems) — kiem tra ma giam gia
H2.3  Tao promotionApi.getUsage(promotionId) — thong ke su dung
```

### H3. Seller - Quan ly khuyen mai (8 buoc)
```
H3.1  Tao SellerPromotionListPage.tsx — danh sach khuyen mai
H3.2  Stats: dang hoat dong, sap dien ra, da ket thuc, tong luot su dung
H3.3  CRUD: form tao/sua khuyen mai day du
H3.4  Form: ma khuyen mai (tu sinh hoac nhap), loai giam gia, gia tri, dieu kien ap dung
H3.5  Chon san pham/danh muc ap dung (multi-select combobox)
H3.6  Cau hinh: han su dung, gioi han luot dung, don toi thieu
H3.7  Bat/tat khuyen mai nhanh (switch)
H3.8  Thong ke: so don ap dung, tong giam gia, doanh thu lien quan
```

### H4. Buyer - Ap dung khuyen mai (4 buoc)
```
H4.1  Them o nhap ma giam gia vao CartPage, nut "Ap dung", hien thi giam gia
H4.2  Tu dong hien thi khuyen mai kha dung tren ProductDetailPage
H4.3  Trang khuyen mai: /promotions — danh sach khuyen mai dang co (tat ca NCC)
H4.4  Badge "Khuyen mai" tren ProductCard khi san pham co khuyen mai
```

---

## =====================================================
## NHOM I: CHUNG CHI & XAC MINH DOANH NGHIEP
## 16 buoc | Dot 8 | Uu tien TB
## =====================================================

### I1. Types & Data (4 buoc)
```
I1.1  Tao type CertificateType = 'Giay phep kinh doanh' | 'ISO 9001' | 'ISO 14001' | 'HACCP' | 'CE' | 'FDA' | 'Khac'
I1.2  Tao type VerificationStatus = 'Chua xac minh' | 'Dang xem xet' | 'Da xac minh' | 'Tu choi' | 'Het han'
I1.3  Tao interface BusinessCertificate { id, supplierId, type, name, issuedBy, issuedDate, expiryDate, documentUrl, status, reviewNote?, reviewedBy?, reviewedAt?, createdAt }
I1.4  Them mockCertificates (8-10 ban ghi) vao mockData.ts
```

### I2. API Service (2 buoc)
```
I2.1  Tao certificateApi.getBySeller(supplierId), upload(data), delete(id)
I2.2  Tao certificateApi.getAll(pagination, filters) — admin, review(id, status, note) — admin duyet
```

### I3. Seller - Nop chung chi (4 buoc)
```
I3.1  Them section "Chung chi" trong SellerProfile — danh sach chung chi da nop
I3.2  Form nop chung chi: loai, ten, co quan cap, ngay cap, ngay het han, file (gia lap)
I3.3  Hien thi trang thai tung chung chi voi StatusBadge
I3.4  Canh bao chung chi sap het han (< 30 ngay)
```

### I4. Admin - Duyet chung chi (4 buoc)
```
I4.1  Tao AdminCertificateReview.tsx — danh sach chung chi cho duyet
I4.2  Filter: trang thai, loai chung chi, NCC
I4.3  Xem chi tiet chung chi + duyet/tu choi voi ghi chu
I4.4  Sau khi duyet: tu dong cap nhat isVerified cua Supplier
```

### I5. Buyer - Xem chung chi NCC (2 buoc)
```
I5.1  Them tab/section "Chung chi" trong SupplierDetailPage
I5.2  Hien thi badge "Da xac minh" voi danh sach chung chi hop le
```

---

## =====================================================
## NHOM J: WISHLIST & DAT HANG LAP LAI
## 18 buoc | Dot 8-9 | Uu tien TB
## =====================================================

### J1. Types & Data (4 buoc)
```
J1.1  Tao interface WishlistItem { id, userId, productId, productName, productImage, supplierId, supplierName, price, addedAt }
J1.2  Tao interface OrderTemplate { id, userId, name, description, items: OrderTemplateItem[], supplierId, supplierName, lastUsed?, usageCount, createdAt }
J1.3  Tao interface OrderTemplateItem { productId, productName, quantity, unitPrice }
J1.4  Them mockWishlistItems (5-6), mockOrderTemplates (3-4) vao mockData.ts
```

### J2. API Service (4 buoc)
```
J2.1  Tao wishlistApi.getByUser(userId), add(productId), remove(id), check(userId, productId)
J2.2  Tao templateApi.getByUser(userId), create, update, delete
J2.3  Tao templateApi.createOrderFromTemplate(templateId) — tao don hang tu template
J2.4  Tao wishlistApi.moveToCart(id) — chuyen tu wishlist sang gio hang
```

### J3. Buyer - Wishlist (5 buoc)
```
J3.1  Tao BuyerWishlistPage.tsx — danh sach san pham yeu thich
J3.2  ViewToggle: luoi / danh sach
J3.3  Hanh dong: xoa, them vao gio, xem chi tiet san pham
J3.4  Them nut tim (Heart) tren ProductCard, ProductDetailPage — toggle wishlist
J3.5  So luong wishlist tren header (badge)
```

### J4. Buyer - Template don hang (5 buoc)
```
J4.1  Tao BuyerOrderTemplatePage.tsx — danh sach template
J4.2  Tao template tu don hang cu: nut "Luu lam template" tren OrderDetailPage
J4.3  Sua template: thay doi san pham, so luong
J4.4  Dat hang tu template: nut "Dat lai" -> tao don hang moi voi san pham tuong tu
J4.5  Thong ke: lan su dung cuoi, so lan da dung
```

---

## =====================================================
## NHOM K: PHE DUYET NOI BO & WORKFLOW
## 16 buoc | Dot 9 | Uu tien TB
## =====================================================

### K1. Types & Data (4 buoc)
```
K1.1  Tao type ApprovalStatus = 'Cho duyet' | 'Da duyet' | 'Tu choi'
K1.2  Tao interface ApprovalRequest { id, type: 'Don hang' | 'Bao gia' | 'Hop dong' | 'San pham', referenceId, referenceName, requestedBy, requestedByName, approver, approverName, status, amount?, note, responseNote?, createdAt, respondedAt? }
K1.3  Tao interface ApprovalRule { id, supplierId, type, minAmount, approverRole, isActive }
K1.4  Them mockApprovalRequests (5-6), mockApprovalRules vao mockData.ts
```

### K2. API Service (3 buoc)
```
K2.1  Tao approvalApi.getByApprover(userId), getByRequester(userId)
K2.2  Tao approvalApi.create(data), approve(id, note), reject(id, note)
K2.3  Tao approvalApi.getRules(supplierId), createRule, updateRule, deleteRule
```

### K3. Seller - Phe duyet (7 buoc)
```
K3.1  Tao SellerApprovalListPage.tsx — danh sach yeu cau can duyet
K3.2  Filter: loai (don hang/bao gia/hop dong), trang thai, nguoi yeu cau
K3.3  Chi tiet yeu cau: thong tin lien quan, nut Duyet/Tu choi voi ghi chu
K3.4  Cau hinh quy tac: don hang > X trieu phai duyet, bao gia > Y trieu phai duyet
K3.5  Tao form cau hinh quy tac phe duyet
K3.6  Thong bao: gui notification khi co yeu cau moi can duyet
K3.7  Dashboard widget: so yeu cau cho duyet
```

### K4. Routes (2 buoc)
```
K4.1  Them routes: /seller/approvals, /seller/approvals/rules
K4.2  Them menu SellerLayout: "Phe duyet"
```

---

## =====================================================
## NHOM L: THUE & HOA DON DIEN TU
## 20 buoc | Dot 9-10 | Uu tien CAO
## =====================================================

### L1. Types & Data (5 buoc)
```
L1.1  Tao type InvoiceStatus = 'Ban nhap' | 'Da xuat' | 'Da gui' | 'Da thanh toan' | 'Qua han' | 'Da huy'
L1.2  Tao interface Invoice { id, invoiceNumber, orderId, orderNumber, type: 'Ban hang' | 'Tra hang' | 'Dieu chinh', buyerId, buyerName, buyerCompany, buyerTaxCode, supplierId, supplierName, supplierCompany, supplierTaxCode, items: InvoiceItem[], subtotal, taxRate, taxAmount, totalAmount, status, issuedDate, dueDate, paidDate?, notes, createdAt }
L1.3  Tao interface InvoiceItem { description, quantity, unitPrice, amount, taxRate }
L1.4  Tao interface TaxConfig { companyName, taxCode, address, bankAccount, bankName }
L1.5  Them mockInvoices (8-10), mockTaxConfigs vao mockData.ts
```

### L2. API Service (3 buoc)
```
L2.1  Tao invoiceApi.getBySeller(supplierId), getByBuyer(buyerId), getByOrder(orderId)
L2.2  Tao invoiceApi.create(data), update(id, data), updateStatus(id, status)
L2.3  Tao invoiceApi.getPaginated(pagination, sort, filters)
```

### L3. Seller - Quan ly hoa don (8 buoc)
```
L3.1  Tao SellerInvoiceListPage.tsx — danh sach hoa don
L3.2  Stats: tong hoa don, da xuat, cho thanh toan, qua han
L3.3  Tao hoa don tu don hang: tu dong dien thong tin tu order
L3.4  Form tao/sua hoa don: thong tin 2 ben, danh sach hang hoa, thue
L3.5  Tinh thue tu dong: thue GTGT (10%), xuat 0% (xuat khau)
L3.6  Xem truoc hoa don: layout in an chuyen nghiep
L3.7  Xuat hoa don: PDF (gia lap), gui email (gia lap)
L3.8  Cau hinh thong tin thue: ma so thue, dia chi, tai khoan ngan hang
```

### L4. Buyer - Xem hoa don (2 buoc)
```
L4.1  Tao BuyerInvoiceListPage.tsx — danh sach hoa don nhan duoc
L4.2  Xem chi tiet hoa don, tai PDF
```

### L5. Routes (2 buoc)
```
L5.1  Them routes: /seller/invoices, /seller/invoices/:id, /invoices (buyer)
L5.2  Menu navigation
```

---

## =====================================================
## NHOM M: XUAT / NHAP DU LIEU & TICH HOP
## 18 buoc | Dot 10-11 | Uu tien TB
## =====================================================

### M1. Xuat du lieu (6 buoc)
```
M1.1  Tao util exportToCSV(data, columns, filename) — ham xuat CSV chung
M1.2  Tao util exportToExcel(data, columns, filename) — ham xuat Excel (dung thu vien)
M1.3  Them nut "Xuat CSV" / "Xuat Excel" vao tat ca trang DataTable: SellerProductList, SellerOrderList, AdminUserMgmt, AdminOrderOverview
M1.4  Xuat bao cao doanh thu: CSV voi tieu de + tong cong
M1.5  Xuat danh sach don hang: loc theo khoang ngay, trang thai
M1.6  Xuat danh sach san pham: day du thong tin + anh (URL)
```

### M2. Nhap du lieu (7 buoc)
```
M2.1  Tao shared ImportDialog.tsx — component nhap du lieu chung
M2.2  Upload file CSV/Excel (gia lap doc file)
M2.3  Xem truoc du lieu truoc khi nhap: bang preview 10 dong dau
M2.4  Mapping cot: ghep cot file voi cot he thong
M2.5  Validation: kiem tra du lieu truoc khi nhap (bat loi, highlight dong loi)
M2.6  Nhap san pham hang loat: /seller/products/import
M2.7  Nhap danh muc hang loat (Admin): /admin/categories/import
```

### M3. Template & Huong dan (5 buoc)
```
M3.1  Tao template CSV mau cho tung loai du lieu (san pham, danh muc, nguoi dung)
M3.2  Nut "Tai template mau" tren moi trang nhap
M3.3  Huong dan nhap du lieu: tooltip / collapsible section
M3.4  Lich su nhap du lieu: ngay nhap, so ban ghi, nguoi nhap, ket qua
M3.5  Xu ly trung lap: skip / ghi de / tao moi (radio options)
```

---

## =====================================================
## NHOM N: NHAT KY & KIEM TOAN (Activity Log)
## 14 buoc | Dot 11 | Uu tien TB
## =====================================================

### N1. Types & Data (3 buoc)
```
N1.1  Tao type ActivityAction = 'Tao' | 'Sua' | 'Xoa' | 'Duyet' | 'Tu choi' | 'Dang nhap' | 'Dang xuat' | 'Xuat du lieu' | 'Nhap du lieu' | 'Doi mat khau'
N1.2  Tao interface ActivityLog { id, userId, userName, userRole, action, entity: string, entityId: string, entityName: string, details: string, ipAddress: string, userAgent: string, createdAt }
N1.3  Them mockActivityLogs (20-30 ban ghi) vao mockData.ts
```

### N2. API Service (2 buoc)
```
N2.1  Tao activityApi.getPaginated(pagination, sort, filters, search) — phan trang + loc
N2.2  Tao activityApi.log(data) — ghi nhat ky (goi tu cac API khac)
```

### N3. Admin - Nhat ky he thong (6 buoc)
```
N3.1  Tao AdminActivityLog.tsx — trang nhat ky toan he thong
N3.2  DataTable: thoi gian, nguoi dung, vai tro, hanh dong, doi tuong, chi tiet
N3.3  Filter: nguoi dung, vai tro, hanh dong, khoang thoi gian, doi tuong (san pham/don hang/nguoi dung)
N3.4  Search: theo ten nguoi dung, chi tiet
N3.5  Timeline view: hien thi nhat ky dang timeline theo ngay
N3.6  Xuat nhat ky CSV
```

### N4. Seller - Nhat ky hoat dong (2 buoc)
```
N4.1  Them tab "Nhat ky" trong SellerDashboard — 10 hoat dong gan nhat
N4.2  Trang chi tiet: /seller/activity — nhat ky cua NCC (chi nhan vien cua minh)
```

### N5. Route (1 buoc)
```
N5.1  Them routes: /admin/activity, /seller/activity
```

---

## =====================================================
## NHOM O: TOI UU & HOAN THIEN
## 28 buoc | Dot 12 | Uu tien CAO
## =====================================================

### O1. Performance (6 buoc)
```
O1.1  React.lazy + Suspense cho tat ca route pages (code splitting)
O1.2  useMemo / useCallback toi uu cho cac component nang (DataTable, FilterBar)
O1.3  Virtual scrolling cho danh sach lon (> 100 items) — react-virtual
O1.4  Image lazy loading cho tat ca ImageWithFallback
O1.5  Debounce search input (250ms) tren tat ca trang co search
O1.6  Skeleton loading nhat quan cho moi trang moi
```

### O2. UX Nang cao (8 buoc)
```
O2.1  Keyboard shortcuts: Ctrl+K (search), Ctrl+N (tao moi), Esc (dong dialog)
O2.2  Drag & drop sap xep (san pham trong gio hang, muc trong RFQ)
O2.3  Infinite scroll option cho san pham Buyer (ngoai phan trang)
O2.4  Toast undo: "Da xoa. Hoan tac?" cho cac hanh dong xoa
O2.5  Empty state illustrations cho tat ca trang trong
O2.6  Onboarding tour cho Seller moi (tooltip dan buoc)
O2.7  Command palette (Ctrl+K): tim kiem nhanh trang, don hang, san pham
O2.8  Responsive table: horizontal scroll + sticky first column tren mobile
```

### O3. Accessibility (5 buoc)
```
O3.1  ARIA labels cho tat ca button, input, form
O3.2  Focus management: focus trap trong dialog, return focus khi dong
O3.3  Screen reader: aria-live regions cho toast, loading states
O3.4  Color contrast: dam bao ti le tuong phan WCAG AA cho tat ca mau
O3.5  Keyboard navigation: Tab order logic, skip links
```

### O4. Error Handling (4 buoc)
```
O4.1  ErrorBoundary bao quanh moi route section
O4.2  Retry logic cho API calls that bai (voi exponential backoff)
O4.3  Offline indicator + queue actions khi mat mang
O4.4  Form data auto-save (localStorage) phong mat du lieu
```

### O5. Testing & QA (5 buoc)
```
O5.1  Tao test data factory: ham tao du lieu mau cho tung entity
O5.2  Validation testing: kiem tra tat ca form validation edge cases
O5.3  Mobile responsive testing: dam bao moi trang hoat dong tren 320px-768px
O5.4  Cross-browser: kiem tra Chrome, Firefox, Safari, Edge
O5.5  Performance audit: Lighthouse score > 85 cho tat ca trang chinh
```

---

## =====================================================
## THU TU TRIEN KHAI CHI TIET (12 DOT)
## =====================================================

### DOT 1 (Nhom A phan 1): RFQ Types + API + Buyer RFQ
```
Buoc 1-6:    A1.1 -> A1.6  (Types & Mock Data)
Buoc 7-12:   A2.1 -> A2.6  (API Service)
Buoc 13-21:  A3.1 -> A3.9  (Buyer RFQ pages)
```

### DOT 2 (Nhom A phan 2 + Nhom B phan 1): Seller RFQ + Hop dong Types/API
```
Buoc 22-26:  A4.1 -> A4.5  (Seller RFQ)
Buoc 27-29:  A5.1 -> A5.3  (RFQ Routes)
Buoc 30-34:  B1.1 -> B1.5  (Contract Types & Data)
Buoc 35-38:  B2.1 -> B2.4  (Contract API)
```

### DOT 3 (Nhom B phan 2 + Nhom C phan 1): Hop dong pages + Kho Types/API
```
Buoc 39-44:  B3.1 -> B3.6  (Buyer Contract)
Buoc 45-50:  B4.1 -> B4.6  (Seller Contract)
Buoc 51-53:  B5.1 -> B5.3  (Contract Routes)
Buoc 54-59:  C1.1 -> C1.6  (Inventory Types)
Buoc 60-64:  C2.1 -> C2.5  (Inventory API)
```

### DOT 4 (Nhom C phan 2 + Nhom D phan 1): Kho pages + Van chuyen Types/API
```
Buoc 65-76:  C3.1 -> C3.12 (Seller Inventory pages)
Buoc 77-79:  C4.1 -> C4.3  (Inventory Integration)
Buoc 80-84:  D1.1 -> D1.5  (Shipping Types)
Buoc 85-88:  D2.1 -> D2.4  (Shipping API)
```

### DOT 5 (Nhom D phan 2 + Nhom E): Van chuyen pages + Thanh toan
```
Buoc 89-93:  D3.1 -> D3.5  (Buyer Shipment)
Buoc 94-99:  D4.1 -> D4.6  (Seller Shipment)
Buoc 100-101: D5.1 -> D5.2  (Shipping Routes)
Buoc 102-106: E1.1 -> E1.5  (Payment Types)
Buoc 107-109: E2.1 -> E2.3  (Payment API)
Buoc 110-114: E3.1 -> E3.5  (Buyer Payment)
Buoc 115-119: E4.1 -> E4.5  (Seller Payment)
Buoc 120-121: E5.1 -> E5.2  (Payment Routes)
```

### DOT 6 (Nhom F): Nhan vien & Phan quyen NCC
```
Buoc 122-125: F1.1 -> F1.4  (Staff Types)
Buoc 126-128: F2.1 -> F2.3  (Staff API)
Buoc 129-136: F3.1 -> F3.8  (Staff pages)
Buoc 137-139: F4.1 -> F4.3  (Staff Routes)
```

### DOT 7 (Nhom G + Nhom H phan 1): Bao cao + Khuyen mai Types
```
Buoc 140-142: G1.1 -> G1.3  (Report Types)
Buoc 143-146: G2.1 -> G2.4  (Report API)
Buoc 147-156: G3.1 -> G3.10 (Seller Reports)
Buoc 157-161: G4.1 -> G4.5  (Admin Reports)
Buoc 162-163: G5.1 -> G5.2  (Report Routes)
Buoc 164-168: H1.1 -> H1.5  (Promotion Types)
```

### DOT 8 (Nhom H phan 2 + Nhom I + Nhom J phan 1): Khuyen mai + Chung chi + Wishlist Types
```
Buoc 169-171: H2.1 -> H2.3  (Promotion API)
Buoc 172-179: H3.1 -> H3.8  (Seller Promotions)
Buoc 180-183: H4.1 -> H4.4  (Buyer Promotions)
Buoc 184-187: I1.1 -> I1.4  (Certificate Types)
Buoc 188-189: I2.1 -> I2.2  (Certificate API)
Buoc 190-193: I3.1 -> I3.4  (Seller Certificates)
Buoc 194-197: I4.1 -> I4.4  (Admin Certificate Review)
Buoc 198-199: I5.1 -> I5.2  (Buyer View Certificates)
Buoc 200-203: J1.1 -> J1.4  (Wishlist Types)
```

### DOT 9 (Nhom J phan 2 + Nhom K + Nhom L phan 1): Wishlist + Phe duyet + Hoa don Types
```
Buoc 204-207: J2.1 -> J2.4  (Wishlist API)
Buoc 208-212: J3.1 -> J3.5  (Buyer Wishlist)
Buoc 213-217: J4.1 -> J4.5  (Order Templates)
Buoc 218-221: K1.1 -> K1.4  (Approval Types)
Buoc 222-224: K2.1 -> K2.3  (Approval API)
Buoc 225-231: K3.1 -> K3.7  (Seller Approvals)
Buoc 232-233: K4.1 -> K4.2  (Approval Routes)
Buoc 234-238: L1.1 -> L1.5  (Invoice Types)
```

### DOT 10 (Nhom L phan 2 + Nhom M phan 1): Hoa don pages + Xuat du lieu
```
Buoc 239-241: L2.1 -> L2.3  (Invoice API)
Buoc 242-249: L3.1 -> L3.8  (Seller Invoices)
Buoc 250-251: L4.1 -> L4.2  (Buyer Invoices)
Buoc 252-253: L5.1 -> L5.2  (Invoice Routes)
Buoc 254-259: M1.1 -> M1.6  (Export Data)
```

### DOT 11 (Nhom M phan 2 + Nhom N): Nhap du lieu + Nhat ky
```
Buoc 260-266: M2.1 -> M2.7  (Import Data)
Buoc 267-271: M3.1 -> M3.5  (Templates & Guide)
Buoc 272-274: N1.1 -> N1.3  (Activity Types)
Buoc 275-276: N2.1 -> N2.2  (Activity API)
Buoc 277-282: N3.1 -> N3.6  (Admin Activity Log)
Buoc 283-284: N4.1 -> N4.2  (Seller Activity)
Buoc 285:     N5.1           (Activity Routes)
```

### DOT 12 (Nhom O): Toi uu & Hoan thien
```
Buoc 286-291: O1.1 -> O1.6  (Performance)
Buoc 292-299: O2.1 -> O2.8  (UX Nang cao)
Buoc 300-304: O3.1 -> O3.5  (Accessibility)
Buoc 305-308: O4.1 -> O4.4  (Error Handling)
Buoc 309-312: O5.1 -> O5.4  (Testing & QA - buoc 312 cuoi ket thuc voi O5.5 la performance audit, dong gop vao buoc 312)
```

---

## =====================================================
## QUY TAC CHUNG CHO MOI BUOC
## =====================================================

1. **Moi file khong qua 2000 dong** — tach component con neu can
2. **Ke thua code** — tai su dung DataTable, FilterBar, FormDialog, StatusBadge, ViewToggle, CategoryCombobox, AppBreadcrumb
3. **Mock API** — moi tinh nang tao API gia lap trong /src/app/services/api.ts (hoac tach file rieng neu qua lon)
4. **Tieng Viet co dau** — tat ca UI text, placeholder, toast, error message
5. **Mobile-first** — moi trang phai responsive, test 320px -> 1440px
6. **CRUD day du** — moi entity co: tao, xem, sua, xoa (inline edit khi co the)
7. **Bo loc + Phan trang + Sap xep** — moi trang danh sach deu co
8. **Tuy chinh cot** — trang quan trong co nut Settings2 de an/hien cot
9. **Nhieu che do hien thi** — trang phu hop co ViewToggle (bang/luoi/danh sach)
10. **Sonar compliant** — khong duplicate code, khong magic numbers, ham < 30 dong, complexity < 15

---

## =====================================================
## CAU TRUC FILE MOI (DU KIEN)
## =====================================================

### Types (bo sung vao /src/app/types/index.ts hoac tach file)
- RFQ, Quotation, QuotationItem
- Contract, ContractItem, ContractHistory
- Warehouse, StockMovement, StockAlert, InventorySummary
- Shipment, ShipmentEvent, ShippingRate
- Payment, PaymentTransaction
- StaffMember, Permission
- ReportFilter, RevenueReport, ProductReport
- Promotion, VolumeDiscount, PromotionUsage
- BusinessCertificate
- WishlistItem, OrderTemplate
- ApprovalRequest, ApprovalRule
- Invoice, InvoiceItem, TaxConfig
- ActivityLog

### Mock Data (bo sung hoac tach file)
- /src/app/data/mockData.ts (neu qua lon -> tach)
- /src/app/data/mockRFQ.ts
- /src/app/data/mockContracts.ts
- /src/app/data/mockInventory.ts
- /src/app/data/mockShipments.ts
- /src/app/data/mockPayments.ts
- /src/app/data/mockStaff.ts
- /src/app/data/mockPromotions.ts
- /src/app/data/mockInvoices.ts
- /src/app/data/mockActivity.ts

### API Services (bo sung hoac tach file)
- /src/app/services/api.ts (neu qua lon -> tach)
- /src/app/services/rfqApi.ts
- /src/app/services/contractApi.ts
- /src/app/services/inventoryApi.ts
- /src/app/services/shipmentApi.ts
- /src/app/services/paymentApi.ts
- /src/app/services/staffApi.ts
- /src/app/services/reportApi.ts
- /src/app/services/promotionApi.ts
- /src/app/services/invoiceApi.ts
- /src/app/services/activityApi.ts

### Buyer Pages (bo sung)
- BuyerRFQListPage.tsx, BuyerRFQCreatePage.tsx, BuyerRFQDetailPage.tsx
- BuyerContractListPage.tsx, BuyerContractDetailPage.tsx
- BuyerShipmentListPage.tsx
- BuyerPaymentListPage.tsx
- BuyerWishlistPage.tsx, BuyerOrderTemplatePage.tsx
- BuyerInvoiceListPage.tsx

### Seller Pages (bo sung)
- SellerRFQListPage.tsx, SellerRFQDetailPage.tsx
- SellerContractListPage.tsx, SellerContractCreatePage.tsx, SellerContractDetailPage.tsx
- SellerWarehouseListPage.tsx, SellerInventoryPage.tsx, SellerStockMovementPage.tsx
- SellerShipmentListPage.tsx
- SellerPaymentListPage.tsx
- SellerStaffListPage.tsx
- SellerRevenueReport.tsx, SellerProductReport.tsx, SellerCustomerReport.tsx
- SellerPromotionListPage.tsx
- SellerApprovalListPage.tsx
- SellerInvoiceListPage.tsx

### Admin Pages (bo sung)
- AdminReportPage.tsx
- AdminCertificateReview.tsx
- AdminContractOverview.tsx
- AdminActivityLog.tsx

### Shared Components (bo sung)
- ImportDialog.tsx (nhap du lieu)
- ExportButton.tsx (xuat du lieu)
- PrintLayout.tsx (layout in an)
- ApprovalBadge.tsx (trang thai phe duyet)
- TimelineTracker.tsx (theo doi van chuyen)
- AmountDisplay.tsx (hien thi tien te thong nhat)
- DateRangePicker.tsx (chon khoang ngay)
- MultiSelectCombobox.tsx (chon nhieu gia tri)
- CommandPalette.tsx (tim kiem nhanh Ctrl+K)
- EmptyState.tsx (trang thai trong voi illustration)

---

## =====================================================
## TONG KET
## =====================================================

- Tong so buoc: 312
- Tong so dot: 12
- Tong so trang moi (du kien): ~35 trang
- Tong so component shared moi: ~10 component
- Tong so type moi: ~30 interface/type
- Tong so API function moi: ~50 function

### Uu tien trien khai:
1. **RFQ (Bao gia)** — tinh nang loi cua B2B, khong co thi khong phai B2B
2. **Hop dong** — ket noi voi RFQ, tao chu trinh kinh doanh hoan chinh
3. **Kho hang** — quan ly ton kho la yeu cau co ban cua NCC
4. **Van chuyen** — theo doi don hang la nhu cau thiet yeu
5. **Thanh toan** — cong no B2B la dac trung cua thuong mai DN
6. **Bao cao** — ho tro ra quyet dinh kinh doanh
7. **Hoa don** — nghiep vu ke toan bat buoc
8. Con lai theo thu tu uu tien TB

### Ghi chu:
- Moi dot co the dieu chinh +/- 20% so buoc tuy do phuc tap thuc te
- Neu api.ts vuot 2000 dong -> tach thanh cac file rieng
- Neu types/index.ts vuot 500 dong -> tach theo nhom
- Backend integration (Supabase) thuc hien SAU khi hoan tat tat ca tinh nang frontend

# KE HOACH CHI TIET CON LAI — TOAN BO HE THONG
## San TMDT B2B Marketplace — Cap nhat: 15/03/2026
## Tong: 712 buoc con lai | 30 dot (Dot 11-40) | 4 Giai doan B(tt)-C-D-E-F

---

## TRANG THAI TONG HOP

| TT  | Hang muc                            | Buoc da xong | Con lai | Trang thai       |
|-----|-------------------------------------|-------------|---------|------------------|
| 1   | Nhom 01-28 (Core)                   | ~476        | 0       | DA XONG          |
| 2   | Nhom 29 (So sanh NCC)               | 16          | 0       | DA XONG          |
| 3   | Nhom 30 (PR) — Giai doan A-D1       | 22          | 0       | DA XONG          |
| 4   | Nhom 31 (GRN) — Giai doan A-D2      | 18          | 0       | DA XONG          |
| 5   | Nhom 32 (Ghi no/co) — A-D3          | 16          | 0       | DA XONG          |
| 6   | Nhom 33 (Budget) — B-D5+6           | 22          | 0       | DA XONG          |
| 7   | Nhom 34 (Auction) — B-D7            | 20          | 0       | DA XONG          |
| 8   | Nhom 35 (PriceAgreement) — B-D8+9   | 24          | 0       | DA XONG          |
| 9   | Nhom 36 (SLA) — B-D10               | 18          | 0       | DA XONG          |
| 10  | Nhom 37 (Tai lieu) — B-D11          | 0           | 16      | CHUA BAT DAU     |
| 11  | Nhom 38 (Multi-Warehouse) — B-D12   | 0           | 20      | CHUA BAT DAU     |
| 12  | Nhom 39 (Analytics BI) — C-D13+14   | 0           | 26      | CHUA BAT DAU     |
| 13  | Nhom 40 (Warranty) — C-D15          | 0           | 20      | CHUA BAT DAU     |
| 14  | Nhom 41 (Loyalty) — C-D16           | 0           | 18      | CHUA BAT DAU     |
| 15  | Nhom 42 (Report Builder) — C-D17    | 0           | 22      | CHUA BAT DAU     |
| 16  | Nhom 43 (Integration Hub) — C-D18   | 0           | 20      | CHUA BAT DAU     |
| 17  | Admin mo rong (D-D19~D24)           | 0           | 112     | CHUA BAT DAU     |
| 18  | UI Beautify (E-D25~D36)             | 0           | 380     | CHUA BAT DAU     |
| 19  | Kiem thu & Hoan thien (F-D37~D40)   | 0           | 78      | CHUA BAT DAU     |
|     | **TONG CON LAI**                    |             | **712** |                  |

---

## =====================================================
## =====================================================
##
## GIAI DOAN B (tiep) — NHOM 37-38
## 36 buoc | Dot 11-12
##
## =====================================================
## =====================================================

---

## =====================================================
## B-DOT 11: NHOM 37 — TRUNG TAM TAI LIEU (16 buoc)
## =====================================================

### B20. Nhom 37A — Types & Data (4 buoc)
```
B20.01  37A.01  Them DocCategory type (7 loai: 'Hop dong' | 'Hoa don' | 'Chung chi' | 'Bao gia' | 'Phieu xuat' | 'GRN' | 'Khac')
B20.02  37A.02  Them Document interface: { id, name, fileName, fileType, fileSize, category: DocCategory, entityType?, entityId?, tags[], version, uploadedBy, uploadedByName, companyId, companyName, description, status: 'Hieu luc' | 'Luu tru' | 'Da xoa', createdAt, updatedAt }
B20.03  37A.03  Tao mockDocuments (15 tai lieu mau): 3 Hop dong, 3 Hoa don, 2 Chung chi, 2 Bao gia, 2 Phieu xuat, 2 GRN, 1 Khac — voi du tags, version 1-3, lien ket entity
B20.04  37A.04  Tao /src/app/services/documentApi.ts: getByUser(userId, pagination, sort, filters, search), getByEntity(entityType, entityId), upload(data), update(id, data), delete(id), search(query), getStats(userId)
```

### B21. Nhom 37B — Document Center Page (7 buoc)
```
B21.01  37B.01  Tao DocumentCenterPage.tsx — 2-column layout: sidebar danh muc (250px) + noi dung chinh
B21.02  37B.02  Sidebar: danh sach DocCategory dang list button, click de filter, badge dem so tai lieu moi loai, active highlight
B21.03  37B.03  ViewToggle (Grid/List): Grid = card voi icon loai file (FileText/FileSpreadsheet/Image/File), ten, ngay, kich thuoc; List = DataTable day du
B21.04  37B.04  FilterBar: danh muc (DocCategory select), khoang ngay (2 date input), loai file (PDF/Excel/Word/Anh select), tags (multi-select chip), search full-text
B21.05  37B.05  Upload: FormDialog voi drop-zone (div dashed border, onClick + drag event gia lap), nhap ten, chon danh muc (Select), them tags (Input + Enter), mo ta (Textarea)
B21.06  37B.06  Dialog chi tiet: thong tin metadata (ten, loai, kich thuoc, nguoi upload, ngay), preview icon/thumbnail, lich su version (v1, v2, v3 voi ngay + nguoi)
B21.07  37B.07  Hanh dong: nut "Tai xuong" (toast "Dang tai xuong..."), "Chia se" (copy URL toast), "Xoa" (confirm dialog), "Luu tru" (chuyen status)
```

### B22. Nhom 37C — Tich hop (5 buoc)
```
B22.01  37C.01  Route /documents (Buyer Guard), /seller/documents (Seller) — lazy import trong routes.ts
B22.02  37C.02  Menu "Tai lieu" voi icon FolderOpen tren BuyerLayout + SellerLayout sidebar
B22.03  37C.03  ContractDetail (Buyer + Seller): them section "Tai lieu dinh kem" — link den /documents?entity=contract&id={contractId}
B22.04  37C.04  InvoiceDetail (Buyer + Seller): them section "Tai lieu dinh kem" — tuong tu
B22.05  37C.05  OrderDetail: them tab "Tai lieu" — DataTable hien thi tat ca tai lieu lien quan don hang (HD, hop dong, phieu xuat, GRN)
```

---

## =====================================================
## B-DOT 12: NHOM 38 — MULTI-WAREHOUSE (20 buoc)
## =====================================================

### B23. Nhom 38A — Types & Data (5 buoc)
```
B23.01  38A.01  Mo rong Warehouse interface: them address, city, province, warehouseType: 'Kho chinh' | 'Kho nhanh' | 'Kho tam', managerId, managerName, capacity, currentUsage, isActive, lat?, lng?
B23.02  38A.02  Them WarehouseTransfer interface: { id, transferNumber, fromWarehouseId, fromWarehouseName, toWarehouseId, toWarehouseName, items: TransferItem[], status: 'Ban nhap' | 'Cho duyet' | 'Dang chuyen' | 'Da nhan' | 'Da huy', requestedBy, approvedBy?, shippedAt?, receivedAt?, note, createdAt }
B23.03  38A.03  Them TransferItem interface: { productId, productName, quantity, actualReceived?, note }
B23.04  38A.04  Tao mockWarehouseTransfers (5 lenh chuyen kho) voi du trang thai
B23.05  38A.05  Tao /src/app/services/warehouseTransferApi.ts: getAll, getById, create, approve, ship, receive, cancel, getStats
```

### B24. Nhom 38B — Seller quan ly nhieu kho (8 buoc)
```
B24.01  38B.01  Nang cap SellerWarehouse: them Tabs component — "Tat ca kho" (tong quan) + tab cho tung kho rieng (ten kho lam tab label)
B24.02  38B.02  Tab "Tat ca kho": grid card moi kho — ten, dia chi (MapPin), SL SP, % suc chua (Progress), badge trang thai (Active/Inactive), loai kho
B24.03  38B.03  Bieu do BarChart grouped: so sanh ton kho (so SP) giua cac kho — moi kho 1 bar
B24.04  38B.04  Bieu do PieChart: phan bo gia tri ton kho theo tung kho — hien thi % va so tien
B24.05  38B.05  FormDialog "Chuyen kho": Select kho nguon, Select kho dich, multi-row SP (chon SP autocomplete + so luong), ghi chu
B24.06  38B.06  DataTable lenh chuyen kho: ma, kho nguon, kho dich, so SP, tong SL, trang thai (StatusBadge), ngay tao + filter/sort/pagination
B24.07  38B.07  Dialog chi tiet chuyen kho: timeline doc (Tao -> Duyet -> Dang chuyen -> Da nhan), bang SP, ghi chu
B24.08  38B.08  Canh bao: banner do khi kho > 90% suc chua, banner vang khi kho < 10% usage
```

### B25. Nhom 38C — Dinh tuyen don hang (4 buoc)
```
B25.01  38C.01  Tao /src/app/utils/warehouseRouting.ts: function suggestWarehouse(buyerCity, warehouses[], orderItems[]) -> { warehouseId, warehouseName, reason, score }
B25.02  38C.02  SellerOrderDetail: khi xu ly don o trang thai 'Cho xu ly', hien thi "Kho goi y: {ten kho}" voi badge "Goi y" + tooltip ly do (vi tri, ton kho)
B25.03  38C.03  Cho phep NCC override: Select dropdown cac kho khac, khi chon kho khac hien "Da thay doi kho xuat"
B25.04  38C.04  Thong ke Seller Reports: them section "Kho hang" — ty le giao tu tung kho (BarChart), TB khoang cach (so), TB thoi gian giao (so)
```

### B26. Nhom 38D — Tich hop (3 buoc)
```
B26.01  38D.01  SellerDashboard widget: "Tong quan kho" card — so kho active, tong ton kho, canh bao kho day/trong
B26.02  38D.02  SellerOrderDetail: hien thi ten kho xuat hang tren order info section
B26.03  38D.03  SellerReports: them tab "Kho hang" — bao cao ton kho tat ca kho (DataTable + BarChart)
```

---

## =====================================================
## =====================================================
##
## GIAI DOAN C — TINH NANG ENTERPRISE NANG CAO (NHOM 39-43)
## 106 buoc | Dot 13-18
##
## =====================================================
## =====================================================

---

## =====================================================
## C-DOT 13-14: NHOM 39 — PHAN TICH MUA HANG & BI DASHBOARD (26 buoc)
## =====================================================

### C1. Nhom 39A — Types & Data (4 buoc)
```
C1.01  39A.01  Them SpendAnalysis interface: { period, totalSpend, byCategory: {name, amount, percent, trend}[], bySupplier: {name, amount, percent, orderCount}[], byDepartment: {name, amount, budget, percent}[], topProducts: {name, qty, amount, supplier, trend}[] }
C1.02  39A.02  Them SavingsReport interface: { period, targetSavings, actualSavings, savingsByMethod: {method: 'Dam phan' | 'Dau gia' | 'KM' | 'HD khung' | 'Mua so luong', amount, percent}[] }
C1.03  39A.03  Them ProcurementKPI interface: { avgOrderCycleTime, rfqToOrderConversionRate, supplierOnTimeRate, invoiceAccuracyRate, avgPaymentCycleTime, contractComplianceRate }
C1.04  39A.04  Tao /src/app/services/analyticsApi.ts: getSpendAnalysis(period), getSavingsReport(period), getProcurementKPIs(period), getTrendData(months)
```

### C2. Nhom 39B — Buyer BI Dashboard (12 buoc)
```
C2.01  39B.01  Tao BuyerAnalyticsPage.tsx — trang phan tich mua hang nang cao, container mx-auto
C2.02  39B.02  Period picker component: 4 button group "Thang nay" | "Quy nay" | "Nam nay" | "Tuy chon" (date range picker)
C2.03  39B.03  KPI cards (4 card): icon + gia tri + growth % + sparkline — TG xu ly don TB (ngay), ty le RFQ->DH (%), % NCC giao dung han, do chinh xac HD (%)
C2.04  39B.04  Tab "Chi tieu" — section header "Phan tich chi tieu"
C2.05  39B.05  Treemap recharts: phan bo chi tieu theo danh muc — moi o = 1 category, kich thuoc ~ amount, mau tu COLORS[], click vao 1 o => set state filteredCategory
C2.06  39B.06  PieChart: Top 10 NCC theo chi tieu — label + percent, tooltip hien so tien
C2.07  39B.07  BarChart: chi tieu theo bo phan — moi bar = 1 dept, grouped voi budget (target vs actual)
C2.08  39B.08  LineChart: xu huong chi tieu 12 thang — 2 line (ky nay vs ky truoc), dot + tooltip
C2.09  39B.09  Tab "Tiet kiem" — section header "Phan tich tiet kiem"
C2.10  39B.10  BarChart grouped: tiet kiem thuc te vs muc tieu theo thang — 2 bar moi group
C2.11  39B.11  PieChart: tiet kiem theo phuong phap — "Dam phan", "Dau gia", "KM", "HD khung", "SL lon"
C2.12  39B.12  LineChart: xu huong tiet kiem theo thang — 1 line, cumulative
```

### C3. Nhom 39C — Bao cao chi tiet (6 buoc)
```
C3.01  39C.01  Tab "San pham": DataTable Top 20 SP mua nhieu nhat — ten SP, SL, tong tien, NCC chinh, xu huong (sparkline mini LineChart inline)
C3.02  39C.02  Tab "NCC": DataTable hieu suat NCC — ten NCC, so don, gia tri, % giao dung han, diem tong hop, icon star ranking
C3.03  39C.03  Tab "Xu huong": RadarChart so sanh ky nay vs ky truoc — overlay 2 datasets (actual + previous), legend
C3.04  39C.04  Export CSV: nut "Xuat CSV" — tao CSV string tu data cua tab hien tai, download blob, ten file "[tab]_[period].csv"
C3.05  39C.05  So sanh ky: Select chon 2 ky de so sanh — hien thi side-by-side 2 cot stats cards voi delta (xanh tang / do giam)
C3.06  39C.06  Drill-down: khi click vao 1 category tren TreeMap -> filter DataTable SP => chi hien SP trong category do, nut "Xoa bo loc" de reset
```

### C4. Nhom 39D — Tich hop (4 buoc)
```
C4.01  39D.01  Route /analytics + lazy import; menu "Phan tich" voi icon BarChart3 trong BuyerLayout sidebar
C4.02  39D.02  BuyerDashboard widget: "KPI mua hang" — 4 chi so chinh (compact card nho) voi link "Xem chi tiet"
C4.03  39D.03  Export bao cao: nut "Gui bao cao" — toast "Da gui bao cao thang [X] den email admin"
C4.04  39D.04  Quyen: chi user co role 'Quan ly' hoac 'Giam doc' (kiem tra user.role, hien canh bao neu khong du quyen)
```

---

## =====================================================
## C-DOT 15: NHOM 40 — BAO HANH & DICH VU HAU MAI (20 buoc)
## =====================================================

### C5. Nhom 40A — Types & Data (5 buoc)
```
C5.01  40A.01  Them WarrantyStatus type = 'Con han' | 'Sap het' | 'Het han' | 'Bi huy'
C5.02  40A.02  Them Warranty interface: { id, warrantyNumber, productId, productName, orderId, orderNumber, sellerId, sellerCompany, buyerId, buyerCompany, startDate, endDate, terms, status: WarrantyStatus, createdAt }
C5.03  40A.03  Them ClaimStatus type = 'Moi tao' | 'Dang xem xet' | 'Chap nhan' | 'Tu choi' | 'Dang sua chua' | 'Da giai quyet' | 'Da dong'
C5.04  40A.04  Them WarrantyClaim interface: { id, claimNumber, warrantyId, productId, productName, buyerId, buyerCompany, sellerId, sellerCompany, issueDescription, claimType: 'Sua chua' | 'Thay the' | 'Hoan tien', imageUrls[], status: ClaimStatus, resolution?, resolvedAt?, note, createdAt, updatedAt }
C5.05  40A.05  Tao mock: mockWarranties (8 ban ghi: 3 con han, 2 sap het < 30 ngay, 2 het han, 1 bi huy), mockWarrantyClaims (5 claim du trang thai)
```

### C6. Nhom 40B — API Service (3 buoc)
```
C6.01  40B.01  Tao /src/app/services/warrantyApi.ts: getByBuyer(buyerId, pagination, sort, filters, search), getBySeller(sellerId, ...), getByProduct(productId), create(data)
C6.02  40B.02  warrantyClaimApi (trong cung file): getByBuyer, getBySeller, create, updateStatus(id, status, resolution?), getStats(userId, role)
C6.03  40B.03  warrantyApi.checkWarranty(productId, buyerId) -> { isValid: boolean, daysRemaining: number, warranty?: Warranty }
```

### C7. Nhom 40C — Buyer quan ly bao hanh (6 buoc)
```
C7.01  40C.01  Tao BuyerWarrantyPage.tsx — AppBreadcrumb, container, icon Shield
C7.02  40C.02  Stats cards: Tong SP bao hanh, Con han (xanh), Sap het < 30 ngay (vang), Da het (xam)
C7.03  40C.03  DataTable: ma BH, ten SP, NCC, ngay bat dau, ngay het, trang thai (StatusBadge), so ngay con lai
C7.04  40C.04  Dialog chi tiet BH: thong tin BH, dieu khoan (Textarea readonly), link don hang goc, lich su claim (timeline doc)
C7.05  40C.05  FormDialog tao claim: chon warranty (Select BH con han), mo ta loi (Textarea), loai yeu cau (Select: Sua/Thay/Hoan), them URL anh (Input)
C7.06  40C.06  Theo doi claim: DataTable claim (ma, SP, loai, trang thai, ngay gui) + dialog timeline trang thai voi response NCC
```

### C8. Nhom 40D — Seller xu ly bao hanh (4 buoc)
```
C8.01  40D.01  Tao SellerWarrantyPage.tsx — AppBreadcrumb, container, danh sach claim
C8.02  40D.02  DataTable: ma claim, ten SP, buyer, loai (Sua/Thay/Hoan), trang thai, ngay gui, so ngay cho + filter/sort/pagination
C8.03  40D.03  Xu ly claim: dialog voi 2 action — "Chap nhan" (nhap phuong an + thoi gian xu ly) / "Tu choi" (ly do bat buoc), toast result
C8.04  40D.04  Stats cards: tong claim, dang xu ly, da giai quyet, tu choi, TG xu ly TB (ngay)
```

### C9. Nhom 40E — Tich hop (2 buoc)
```
C9.01  40E.01  Route /warranty (Buyer), /seller/warranty (Seller) + menu "Bao hanh" icon Shield tren ca 2 layout
C9.02  40E.02  OrderDetail: them badge "Con BH: {N} ngay" hoac "Het BH" tren moi SP co warranty
```

---

## =====================================================
## C-DOT 16: NHOM 41 — KHACH HANG THAN THIET / LOYALTY (18 buoc)
## =====================================================

### C10. Nhom 41A — Types & Data (4 buoc)
```
C10.01  41A.01  Them LoyaltyTier type = 'Dong' | 'Bac' | 'Vang' | 'Kim cuong'
C10.02  41A.02  Them LoyaltyProgram interface: { id, buyerId, buyerCompany, tier: LoyaltyTier, currentPoints, lifetimePoints, lifetimeSpend, tierStartDate, nextTierThreshold?, nextTierName? }
C10.03  41A.03  Them LoyaltyTransaction interface: { id, programId, type: 'Tich' | 'Tieu' | 'Het han' | 'Thuong', points, description, orderId?, createdAt }
C10.04  41A.04  Them LoyaltyReward interface: { id, name, description, pointsCost, category, imageUrl?, available: boolean, stock: number }
```

### C11. Nhom 41B — Mock Data & API (3 buoc)
```
C11.01  41B.01  Tao mock: mockLoyaltyProgram (4 buyer: tier Dong 500 diem, Bac 2500 diem, Vang 8000 diem, Kim cuong 25000 diem)
C11.02  41B.02  mockLoyaltyTransactions (20 giao dich: 12 tich + 4 tieu + 2 het han + 2 thuong), mockLoyaltyRewards (10 phan thuong: voucher, giam gia, qua tang, uu dai giao hang)
C11.03  41B.03  Tao /src/app/services/loyaltyApi.ts: getProgram(buyerId), getTransactions(buyerId, pagination), getRewards(pagination), redeemReward(rewardId, programId), getStats(buyerId)
```

### C12. Nhom 41C — Buyer chuong trinh KHTT (7 buoc)
```
C12.01  41C.01  Tao BuyerLoyaltyPage.tsx — AppBreadcrumb, container, icon Award
C12.02  41C.02  Header hero section: tier hien tai (badge voi mau dong=#CD7F32/bac=#C0C0C0/vang=#FFD700/kim cuong=#B9F2FF), diem hien co (lon), Progress bar den tier tiep theo voi label
C12.03  41C.03  Tab "Tong quan": 4 stats cards (diem hien co, tier, chi tieu lifetime, diem het han sap toi), bang loi ich theo tier (DataTable: tier, giam gia %, free ship, uu tien CS, qua tang)
C12.04  41C.04  Tab "Lich su diem": DataTable giao dich diem — ngay, loai (Tich/Tieu/Het han/Thuong voi mau khac nhau), diem (+/-), mo ta, don hang lien ket (link) + filter loai + sort ngay
C12.05  41C.05  Tab "Doi thuong": grid 2-4 col card phan thuong — ten, diem can (Badge), mo ta ngan, icon/anh, badge "Con {stock}", nut "Doi" (disabled neu khong du diem)
C12.06  41C.06  Doi thuong: click "Doi" -> Dialog xac nhan "Ban co chac doi {ten} voi {X} diem?" -> confirm -> tru diem -> toast "Doi thuong thanh cong! Ma: {random}" -> cap nhat diem
C12.07  41C.07  Bieu do BarChart grouped: diem tich vs diem tieu theo thang (6 thang gan nhat) — 2 bar moi thang
```

### C13. Nhom 41D — Tich hop (4 buoc)
```
C13.01  41D.01  Route /loyalty + menu "Than thiet" voi icon Award trong BuyerLayout sidebar
C13.02  41D.02  Checkout: hien thi "+{X} diem se nhan" o summary + checkbox "Dung {Y} diem de giam {Z} VND" (1 diem = 100 VND, tru vao tong)
C13.03  41D.03  BuyerDashboard widget: tier badge (mau tier) + "{X} diem" + progress bar den tier tiep + link "Xem chi tiet"
C13.04  41D.04  OrderConfirmation page: them banner xanh "+{X} diem da duoc cong!" sau khi dat hang thanh cong
```

---

## =====================================================
## C-DOT 17: NHOM 42 — BAO CAO TUY CHINH / REPORT BUILDER (22 buoc)
## =====================================================

### C14. Nhom 42A — Types & Data (5 buoc)
```
C14.01  42A.01  Them DataSource type = 'Don hang' | 'San pham' | 'NCC' | 'Ton kho' | 'Doanh thu' | 'Cong no' | 'Hoa don' | 'Tra hang' | 'RFQ' | 'Ngan sach'
C14.02  42A.02  Them ChartType type = 'Bar' | 'Line' | 'Pie' | 'Area' | 'Radar' | 'Treemap' | 'Table'
C14.03  42A.03  Them ReportDefinition interface: { id, name, description, dataSource: DataSource, columns: ReportColumn[], filters: ReportFilter[], groupBy?, sortBy?, chartType: ChartType, chartConfig?, isTemplate, createdBy, createdAt, updatedAt }
C14.04  42A.04  Them ReportColumn interface: { field, label, visible, aggregation?: 'sum' | 'avg' | 'count' | 'min' | 'max', format?: 'number' | 'currency' | 'percent' | 'date' }
C14.05  42A.05  Them ReportFilter interface: { field, operator: '=' | '!=' | '>' | '<' | '>=' | '<=' | 'contains' | 'in', value: string | number | string[] }
```

### C15. Nhom 42B — Mock Data & API (3 buoc)
```
C15.01  42B.01  Tao mockReportDefinitions (5 bao cao mau): "Doanh thu thang" (Bar), "Top NCC" (Pie), "Ton kho" (Table), "Cong no qua han" (Bar), "Don hang theo trang thai" (Pie)
C15.02  42B.02  Tao /src/app/services/reportBuilderApi.ts: getAll(pagination), getById(id), create(data), update(id, data), delete(id), clone(id), execute(reportDef) -> { columns, rows, chartData }
C15.03  42B.03  reportBuilderApi.getAvailableFields(dataSource: DataSource) -> { field, label, type: 'string' | 'number' | 'date' | 'enum' }[] — tra ve danh sach cot kha dung theo nguon
```

### C16. Nhom 42C — Report Builder UI (9 buoc)
```
C16.01  42C.01  Tao ReportBuilderPage.tsx — 2-column layout: sidebar danh sach BC (250px) + builder chinh
C16.02  42C.02  Sidebar: danh sach BC da tao (clickable items: icon + ten + ngay), section "Template" co san, nut "Tao moi"
C16.03  42C.03  Buoc 1 "Nguon du lieu": grid 10 card DataSource (icon + ten + mo ta ngan), click chon 1, highlight selected
C16.04  42C.04  Buoc 2 "Chon cot": checkbox list cac cot kha dung (getAvailableFields), drag handle de sap xep thu tu, select aggregation cho cot so
C16.05  42C.05  Buoc 3 "Dieu kien loc": multi-row builder — Select field + Select operator + Input value + nut xoa dong; nut "Them dieu kien"
C16.06  42C.06  Buoc 4 "Nhom & Sap xep": Select groupBy (1 field), Select sortBy (1 field) + toggle asc/desc icon
C16.07  42C.07  Buoc 5 "Kieu bieu do": toggle group 7 icon (Bar/Line/Pie/Area/Radar/Treemap/Table), khi chon Pie/Bar thi hien Select X axis + Y axis
C16.08  42C.08  Preview panel: nut "Xem truoc" -> goi execute API -> hien thi DataTable + recharts tuong ung; loading spinner khi dang execute
C16.09  42C.09  Luu bao cao: FormDialog nhap ten + mo ta + toggle "Luu lam template" (checkbox); nut "Luu" goi create/update API + toast
```

### C17. Nhom 42D — Report Viewer (3 buoc)
```
C17.01  42D.01  Xem bao cao da luu: click sidebar item -> load reportDef -> execute -> hien thi DataTable + bieu do (recharts) theo chartType
C17.02  42D.02  Export: nut "Xuat CSV" (download blob), nut "In" (window.print() voi print-friendly CSS)
C17.03  42D.03  Chia se: nut "Sao chep link" -> copy current URL voi ?reportId={id} -> toast "Da sao chep!"
```

### C18. Nhom 42E — Tich hop (2 buoc)
```
C18.01  42E.01  Route /reports/builder (Buyer + Seller) + menu "Tao bao cao" icon FileBarChart tren ca 2 layout
C18.02  42E.02  Dashboard widget (Buyer + Seller): "Bao cao yeu thich" card — 3 link nhanh den bao cao hay dung nhat (tu mockReportDefinitions)
```

---

## =====================================================
## C-DOT 18: NHOM 43 — TRUNG TAM TICH HOP / INTEGRATION HUB (20 buoc)
## =====================================================

### C19. Nhom 43A — Types & Data (5 buoc)
```
C19.01  43A.01  Them IntegrationType type = 'ERP' | 'Ke toan' | 'CRM' | 'Email' | 'Van chuyen' | 'Thanh toan' | 'Chat' | 'Custom API'
C19.02  43A.02  Them IntegrationStatus type = 'Da ket noi' | 'Ngat ket noi' | 'Loi' | 'Chua cai dat'
C19.03  43A.03  Them Integration interface: { id, name, type: IntegrationType, status: IntegrationStatus, description, iconUrl?, configData?: Record<string, string>, lastSyncAt?, syncFrequency?, companyId, createdAt }
C19.04  43A.04  Them WebhookEndpoint interface: { id, name, url, events: string[], secret?, isActive, lastTriggeredAt?, companyId, createdAt }
C19.05  43A.05  Them APIKey interface: { id, name, keyMasked: string, permissions: string[], expiresAt?, isActive, lastUsedAt?, companyId, createdAt }
```

### C20. Nhom 43B — Mock Data & API (3 buoc)
```
C20.01  43B.01  Tao mockIntegrations (8): SAP (ERP, Da ket noi), QuickBooks (Ke toan, Da ket noi), Salesforce (CRM, Ngat), Gmail (Email, Da ket noi), GHN (Van chuyen, Da ket noi), VNPay (Thanh toan, Loi), Slack (Chat, Chua cai dat), Custom API (Custom, Chua cai dat)
C20.02  43B.02  mockWebhooks (4 endpoint), mockAPIKeys (3 key voi keyMasked dang "sk_live_...xxxx")
C20.03  43B.03  Tao /src/app/services/integrationApi.ts: getAll, getById, connect(id, configData), disconnect(id), test(id) -> { ok, message, latency }, getWebhooks, createWebhook, deleteWebhook, getAPIKeys, createAPIKey, revokeAPIKey(id), getSyncHistory, getStats
```

### C21. Nhom 43C — Integration Hub Page (8 buoc)
```
C21.01  43C.01  Tao IntegrationHubPage.tsx — trang trung tam tich hop, AppBreadcrumb, container, icon Puzzle
C21.02  43C.02  Tab "Ket noi": grid card (3 col) — icon dich vu (emoji/lucide), ten, mo ta ngan, trang thai badge, nut "Ket noi" / "Ngat ket noi" / "Thu lai"
C21.03  43C.03  FilterBar: Select loai (IntegrationType), Select trang thai, search ten
C21.04  43C.04  Dialog cau hinh: FormDialog khi nhan "Ket noi" — nhap API key (Input password), URL endpoint (Input), token/secret (Input) — toast "Da ket noi!" (gia lap)
C21.05  43C.05  Tab "Webhook": DataTable (ten, URL truncate, events chip badge, trang thai, ngay tao) + nut "Tao moi" (FormDialog: ten, URL, chon events multi-checkbox) + nut "Test" (toast "Ping thanh cong! Latency: 120ms")
C21.06  43C.06  Tab "API Keys": DataTable (ten, key masked, quyen, het han, trang thai) + nut "Tao key" (FormDialog: ten, chon quyen, han su dung) + nut "Thu hoi" (confirm dialog)
C21.07  43C.07  Tab "Lich su": DataTable (thoi gian, dich vu, hanh dong, trang thai ok/loi, chi tiet loi) + filter theo dich vu + khoang ngay
C21.08  43C.08  Stats cards: so ket noi active, so webhook, so API key, so luot dong bo thang nay, loi gan nhat (badge do neu co)
```

### C22. Nhom 43D — Tich hop (4 buoc)
```
C22.01  43D.01  Route /integrations (Buyer + Seller) + menu "Tich hop" icon Puzzle tren ca 2 layout
C22.02  43D.02  SellerDashboard widget: "Tich hop" card — so ket noi, canh bao loi (neu co)
C22.03  43D.03  Admin SystemSettings: them section "Tich hop he thong" — DataTable trang thai tat ca integration tren san
C22.04  43D.04  Webhook events list (const): ['order.created', 'order.updated', 'order.cancelled', 'payment.received', 'shipment.updated', 'rfq.received', 'inventory.low']
```

---

## =====================================================
## =====================================================
##
## GIAI DOAN D — ADMIN MO RONG TOAN DIEN
## 112 buoc | Dot 19-24
##
## =====================================================
## =====================================================

---

## =====================================================
## D-DOT 19: ADMIN — PR, GRN, DEBIT/CREDIT (18 buoc)
## =====================================================

### D1. Admin PR Management (6 buoc)
```
D1.01  Tao AdminPRPage.tsx — AppBreadcrumb "Quan tri > Y/C mua hang", container
D1.02  Stats: Tong PR, Cho duyet (badge vang), Da duyet (xanh), Tu choi (do), Da tao don (indigo) — toan he thong
D1.03  DataTable: ma PR, cong ty, nguoi YC, bo phan, so SP, tong tien DK, trang thai (StatusBadge), ngay tao + filter (cong ty, trang thai, bo phan, date range) + sort + pagination
D1.04  Dialog chi tiet PR: thong tin (grid 2 col: ma, nguoi YC, bo phan, uu tien, ngay), timeline duyet (doc), DataTable items (ten SP, SL, gia DK, ghi chu)
D1.05  Hanh dong Admin: nut "Dong PR" (confirm + ghi chu admin), nut "Xoa PR" (confirm dialog), cap nhat trang thai + toast
D1.06  Route /admin/purchase-requisitions + lazy import; menu "Y/C mua hang" icon ClipboardList trong AdminLayout sidebar
```

### D2. Admin GRN Management (6 buoc)
```
D2.01  Tao AdminGRNPage.tsx — AppBreadcrumb "Quan tri > Nhan hang", container
D2.02  Stats: Tong GRN (blue), Da xac nhan (green), Co van de (red), Diem CL trung binh (indigo, hien 1 decimal)
D2.03  DataTable: ma GRN, ten buyer, ten NCC, ma don hang, ngay nhan, diem CL, trang thai + filter (trang thai, NCC, khoang ngay) + sort + pagination
D2.04  Dialog chi tiet: thong tin GRN, DataTable items (SP, SL nhan, SL chap nhan, SL loi, ly do loi), anh (ImageWithFallback), ghi chu
D2.05  Bieu do BarChart: ty le nhan du / thieu / loi toan he thong — 3 bar grouped
D2.06  Route /admin/grn + menu "Nhan hang" icon ClipboardCheck
```

### D3. Admin Debit/Credit (6 buoc)
```
D3.01  Tao AdminDebitCreditPage.tsx — AppBreadcrumb "Quan tri > Ghi no/co"
D3.02  Stats: Tong phieu, Ghi no (badge cam), Ghi co (badge xanh), So tien rong (= ghi no - ghi co, hien VND)
D3.03  DataTable: ma phieu, loai (Ghi no/Ghi co badge), NCC, buyer, hoa don lien ket, so tien, trang thai, ngay + filter + sort + pagination
D3.04  Dialog chi tiet: thong tin phieu, hoa don goc (link), chi tiet chenh lech, ghi chu
D3.05  Hanh dong: "Duyet doi soat" (confirm, chuyen trang thai 'Da doi soat'), "Tu choi" (ly do bat buoc) + toast
D3.06  Route /admin/debit-credit + menu "Ghi no/co" icon ReceiptText
```

---

## =====================================================
## D-DOT 20: ADMIN — BUDGET, AUCTION, PRICE AGREEMENT (18 buoc)
## =====================================================

### D4. Admin Budget Overview (6 buoc)
```
D4.01  Tao AdminBudgetPage.tsx — AppBreadcrumb "Quan tri > Ngan sach"
D4.02  Stats: Tong NS da cap (toan san), Da su dung, Con lai, So cong ty vuot NS (badge do)
D4.03  DataTable: cong ty, ten NS, ky (Thang/Quy/Nam), tong NS, da chi, % su dung (Progress bar inline), trang thai + filter + sort + pagination
D4.04  Dialog chi tiet: thong tin NS, DataTable phan bo (bo phan, danh muc, so tien, da chi, con lai + Progress), giao dich gan nhat
D4.05  Bieu do: BarChart top 10 cong ty chi tieu (horizontal bar), PieChart phan bo NS theo nganh nghe
D4.06  Route /admin/budgets + menu "Ngan sach" icon Wallet
```

### D5. Admin Auction Management (6 buoc)
```
D5.01  Tao AdminAuctionPage.tsx — AppBreadcrumb "Quan tri > Dau gia"
D5.02  Stats: Tong phien, Dang mo (badge xanh), Da dong (xam), So NCC tham gia TB, Gia tri trung binh
D5.03  DataTable: ma phien, buyer, tieu de, so item, so bid, gia tri TB bid, trang thai, TG ket thuc + filter + sort + pagination
D5.04  Dialog chi tiet: thong tin phien, DataTable bid (NCC, gia, thoi gian, ranking), NCC thang (highlight)
D5.05  Hanh dong: "Tam ngung phien" (confirm, chuyen trang thai), "Huy phien" (ly do vi pham) + toast
D5.06  Route /admin/auctions + menu "Dau gia" icon Gavel
```

### D6. Admin Price Agreement (6 buoc)
```
D6.01  Tao AdminPriceAgreementPage.tsx — AppBreadcrumb "Quan tri > Thoa thuan gia"
D6.02  Stats: Tong TT, Hieu luc, Sap het, Da het, Tong gia tri toan san
D6.03  DataTable: ma TT, NCC, buyer, loai (TT gia / HD khung / Don hang mo), gia tri, hieu luc, trang thai + filter + sort + pagination
D6.04  Dialog chi tiet: thong tin TT, DataTable SP (ten, gia goc, gia TT, % giam), don hang lien ket
D6.05  Hanh dong: "Tam ngung TT" (confirm + ghi chu), "Huy TT" (ly do bat buoc) + toast
D6.06  Route /admin/price-agreements + menu "Thoa thuan gia" icon Handshake
```

---

## =====================================================
## D-DOT 21: ADMIN — SLA, DOCUMENT, WARRANTY (18 buoc)
## =====================================================

### D7. Admin SLA Monitoring (6 buoc)
```
D7.01  Tao AdminSLAPage.tsx — AppBreadcrumb "Quan tri > Cam ket DV"
D7.02  Stats: Tong SLA, Dang hieu luc, Co vi pham (badge do), Diem TB toan san
D7.03  DataTable: NCC, ten SLA, buyer (hoac "Tat ca"), so chi tieu, diem hien tai (ScoreBadge), vi pham (badge), trang thai + filter + sort + pagination
D7.04  Bieu do: BarChart diem SLA theo NCC (horizontal bar, sap xep giam dan), LineChart xu huong diem TB toan san theo thang
D7.05  Canh bao: section "NCC dang vi pham SLA" — DataTable NCC + chi tieu vi pham + muc do (Canh bao / Vi pham), banner do noi bat
D7.06  Route /admin/sla + menu "Cam ket DV" icon ShieldCheck
```

### D8. Admin Document Center (6 buoc)
```
D8.01  Tao AdminDocumentPage.tsx — AppBreadcrumb "Quan tri > Tai lieu"
D8.02  Stats: Tong tai lieu, Phan bo theo loai (PieChart DocCategory), Dung luong tong (gia lap: "2.4 GB")
D8.03  DataTable: ten, danh muc, nguoi upload, cong ty, ngay, kich thuoc + filter (danh muc, cong ty, date range) + sort + pagination
D8.04  Dialog chi tiet: thong tin tai lieu, metadata, lich su version
D8.05  Hanh dong: "Xoa" (confirm + ly do), "An" (toggle visibility), "Khoi phuc" (neu da an) + toast
D8.06  Route /admin/documents + menu "Tai lieu" icon FolderOpen
```

### D9. Admin Warranty Management (6 buoc)
```
D9.01  Tao AdminWarrantyPage.tsx — AppBreadcrumb "Quan tri > Bao hanh"
D9.02  Stats: Tong claim, Dang xu ly (vang), Da giai quyet (xanh), Tu choi (do), TG xu ly TB (ngay)
D9.03  DataTable: ma claim, SP, buyer, NCC, loai (Sua/Thay/Hoan), trang thai, ngay gui, ngay xu ly + filter + sort + pagination
D9.04  Dialog chi tiet: thong tin claim, anh minh chung, timeline trang thai, phan hoi NCC, resolution
D9.05  Hanh dong Admin: "Can thiep" (gui thong bao den NCC + buyer), "Dong claim" (khi NCC khong phan hoi > 14 ngay), "Cuong che hoan tien"
D9.06  Route /admin/warranty + menu "Bao hanh" icon Shield
```

---

## =====================================================
## D-DOT 22: ADMIN — LOYALTY, ANALYTICS, REPORT BUILDER (18 buoc)
## =====================================================

### D10. Admin Loyalty Program (6 buoc)
```
D10.01  Tao AdminLoyaltyPage.tsx — AppBreadcrumb "Quan tri > Khach hang TT"
D10.02  Stats: Tong TV, Phan bo tier PieChart (Dong/Bac/Vang/KC), Tong diem da phat, Tong diem da doi
D10.03  DataTable: buyer, cong ty, tier (badge mau), diem hien co, diem lifetime, chi tieu, ngay tham gia + filter (tier) + sort + pagination
D10.04  Cau hinh: FormDialog cau hinh tier — DataTable (tier, nguong diem, giam gia %, free ship, uu tien CS) + nut "Sua" inline
D10.05  Quan ly phan thuong: DataTable phan thuong (ten, diem, danh muc, ton, trang thai) + FormDialog CRUD (ten, mo ta, diem, danh muc select, so luong, toggle active)
D10.06  Route /admin/loyalty + menu "Khach hang TT" icon Award
```

### D11. Admin Analytics Dashboard (6 buoc)
```
D11.01  Tao AdminAnalyticsPage.tsx — AppBreadcrumb "Quan tri > Phan tich"
D11.02  KPI cards (6): GMV toan san, so don thang nay, so NCC active, so buyer active, ty le chuyen doi, gia tri don TB + growth %
D11.03  Bieu do: LineChart GMV theo thang (12 thang), BarChart top 10 NCC (doanh thu), PieChart phan bo theo nganh
D11.04  Tab "Buyer": DataTable top buyer (cong ty, chi tieu, so don, tier, growth) + BarChart top 10
D11.05  Tab "NCC": DataTable top NCC (cong ty, doanh thu, so don, diem SLA, don dung han %) + BarChart top 10
D11.06  Route /admin/analytics + menu "Phan tich" icon BarChart3
```

### D12. Admin Report Management (6 buoc)
```
D12.01  Tao AdminReportBuilderPage.tsx — AppBreadcrumb "Quan tri > Tao bao cao"
D12.02  Stats: Tong bao cao, Template public, Luot su dung thang nay, Bao cao tao gan day
D12.03  DataTable: ten BC, nguoi tao, cong ty, nguon du lieu, loai bieu do, ngay tao, luot xem + filter + sort + pagination
D12.04  Hanh dong: "An BC" (toggle), "Xoa BC" (confirm), "Sao chep" (clone API + toast), "Dua len template" (toggle isTemplate)
D12.05  Tao template he thong: FormDialog chon tu mockReportDefinitions, sua ten/mo ta, toggle "Template he thong"
D12.06  Route /admin/report-builder + menu "Tao bao cao" icon FileBarChart
```

---

## =====================================================
## D-DOT 23: ADMIN — INTEGRATION HUB & MULTI-WAREHOUSE (18 buoc)
## =====================================================

### D13. Admin Integration Hub (6 buoc)
```
D13.01  Tao AdminIntegrationPage.tsx — AppBreadcrumb "Quan tri > Tich hop"
D13.02  Stats: Tong ket noi toan san, Dang hoat dong, Loi, So webhook, So API key active
D13.03  DataTable: ten dich vu, loai, cong ty, trang thai (StatusBadge), lan dong bo cuoi, so luot goi + filter (loai, trang thai, cong ty) + sort + pagination
D13.04  Dialog chi tiet: thong tin cau hinh (an secret: "sk_***xxxx"), lich su dong bo (DataTable nho), thong ke su dung
D13.05  Hanh dong Admin: "Ngat ket noi" (truong hop vi pham chinh sach), "Reset secret" (tao secret moi cho cong ty), toast + confirm
D13.06  Route /admin/integrations + menu "Tich hop" icon Puzzle
```

### D14. Admin Multi-Warehouse (6 buoc)
```
D14.01  Tao AdminWarehousePage.tsx — AppBreadcrumb "Quan tri > Kho hang"
D14.02  Stats: Tong so kho (toan san), Tong gia tri ton, So NCC co kho, So lenh chuyen kho
D14.03  DataTable: NCC, ten kho, loai kho, dia chi, suc chua, % su dung (Progress inline), trang thai + filter + sort + pagination
D14.04  Bieu do: bang xep hang kho theo tinh/thanh pho (BarChart horizontal), PieChart phan bo theo loai kho (Chinh/Nhanh/Tam)
D14.05  Dialog chi tiet kho: thong tin, DataTable SP ton kho (ten, SL, gia tri), lich su chuyen kho (DataTable nho)
D14.06  Route /admin/warehouses + menu "Kho hang" icon Warehouse
```

### D15. Admin Return Enhancement (6 buoc)
```
D15.01  Tao AdminReturnPage.tsx (moi hoac nang cap) — AppBreadcrumb "Quan tri > Tra hang"
D15.02  Stats: Tong yeu cau, Cho xu ly (vang), Da hoan tien (xanh), Tu choi (do), TB thoi gian xu ly (ngay)
D15.03  DataTable: ma tra hang, buyer, NCC, ma don hang, ly do, so tien, trang thai, ngay + filter + sort + pagination
D15.04  Dialog chi tiet: thong tin tra hang, timeline trang thai, anh minh chung, ghi chu 2 ben (buyer + seller)
D15.05  Hanh dong Admin: "Can thiep" (gui thong bao), "Cuong che hoan tien" (confirm + so tien), "Dong tranh chap" (resolve + ghi chu) + toast
D15.06  Route /admin/returns + menu "Tra hang" icon RotateCcw
```

---

## =====================================================
## D-DOT 24: ADMIN — ROUTE TONG HOP & MENU (4 buoc)
## =====================================================

### D16. Kiem tra & Cap nhat Menu Admin (4 buoc)
```
D16.01  Cap nhat AdminLayout sidebar: them tat ca 12 menu moi theo nhom logic — nhom "Mua hang" (PR, GRN, Budget, Auction, PriceAgreement), nhom "Quan ly" (SLA, Document, Warranty, Loyalty), nhom "Bao cao" (Analytics, Report Builder), nhom "He thong" (Integration, Warehouse, Return)
D16.02  Cap nhat routes.ts: kiem tra tat ca lazy import + route dang ky dung duong dan /admin/*
D16.03  AdminDashboard: them 6 widget card — PR cho duyet, GRN co van de, Auction dang mo, SLA vi pham, Claim chua xu ly, Loyalty TV moi
D16.04  Kiem tra AdminGuard: dam bao tat ca route /admin/* deu duoc bao ve boi AdminGuard (redirect login neu khong co quyen)
```

---

## =====================================================
## =====================================================
##
## GIAI DOAN E — NANG CAP GIAO DIEN (UI BEAUTIFY)
## 380 buoc | Dot 25-36
##
## =====================================================
## =====================================================

---

## =====================================================
## E-DOT 25: U01 — DESIGN TOKEN & THEME SYSTEM (28 buoc)
## =====================================================

### E1. CSS Custom Properties (8 buoc)
```
E1.01  Them --brand-50 den --brand-900 (10 shade blue B2B palette) vao /src/styles/theme.css
E1.02  Them --success-50, --success-100, --success-200, --success-500, --success-700
E1.03  Them --warning-50, --warning-100, --warning-200, --warning-500, --warning-700
E1.04  Them --danger-50, --danger-100, --danger-200, --danger-500, --danger-700
E1.05  Them --info-50, --info-100, --info-200, --info-500, --info-700
E1.06  Them --surface-1 (bg card), --surface-2 (bg section), --surface-3 (bg page)
E1.07  Them --shadow-xs (subtle), --shadow-sm, --shadow-md, --shadow-lg, --shadow-xl (dramatic)
E1.08  Them --radius-xs (2px), --radius-sm (4px), --radius-md (8px), --radius-lg (12px), --radius-xl (16px), --radius-2xl (24px)
```

### E2. Spacing & Layout Tokens (6 buoc)
```
E2.01  Them --spacing-page: 24px (mobile), 32px (tablet), 48px (desktop) su dung responsive @media
E2.02  Them --spacing-section: 32px (mobile), 48px (desktop)
E2.03  Them --spacing-card: 16px (mobile), 24px (desktop)
E2.04  Them --container-sm (640px), --container-md (768px), --container-lg (1024px), --container-xl (1280px), --container-2xl (1536px)
E2.05  Them --header-height (64px), --sidebar-width (280px), --sidebar-collapsed (72px)
E2.06  Them --bottom-nav-height (56px mobile), --breadcrumb-height (48px)
```

### E3. Motion Tokens (6 buoc)
```
E3.01  Them --duration-fast: 100ms
E3.02  Them --duration-normal: 200ms
E3.03  Them --duration-slow: 300ms
E3.04  Them --easing-default: cubic-bezier(0.4, 0, 0.2, 1)
E3.05  Them --easing-in: cubic-bezier(0.4, 0, 1, 1)
E3.06  Them --easing-out: cubic-bezier(0, 0, 0.2, 1)
```

### E4. Gradient & Effect Tokens (8 buoc)
```
E4.01  Them --gradient-primary: linear-gradient(135deg, var(--brand-500), var(--brand-700))
E4.02  Them --gradient-success: linear-gradient(135deg, var(--success-500), var(--success-700))
E4.03  Them --gradient-hero: linear-gradient(135deg, #667eea, #764ba2)
E4.04  Them --glassmorphism: backdrop-filter: blur(12px); background: rgba(255,255,255,0.8)
E4.05  Them --overlay-light: rgba(255,255,255,0.6)
E4.06  Them --overlay-dark: rgba(0,0,0,0.5)
E4.07  Them --text-gradient class: background-clip: text; -webkit-text-fill-color: transparent
E4.08  Them --border-gradient class: border-image: var(--gradient-primary) 1
```

---

## =====================================================
## E-DOT 25 (tiep): U02 — TYPOGRAPHY & FONT (16 buoc)
## =====================================================

### E5. Font Import & Config (8 buoc)
```
E5.01  Import Google Font "Inter" (400,500,600,700) vao /src/styles/fonts.css
E5.02  Them --font-display: 'Inter', system-ui, sans-serif
E5.03  Them --font-body: 'Inter', system-ui, sans-serif
E5.04  Them --font-mono: 'JetBrains Mono', ui-monospace, monospace
E5.05  Config heading styles: h1 = 30px/700, h2 = 24px/600, h3 = 20px/600, h4 = 16px/600
E5.06  Config body text: default = 14px/400, small = 12px, large = 16px
E5.07  Config letter-spacing: heading = -0.025em, body = 0
E5.08  Config font-variant-numeric: tabular-nums cho so lieu
```

### E6. Text Utilities (8 buoc)
```
E6.01  Tao .text-gradient class voi bg-clip-text + -webkit-text-fill-color: transparent
E6.02  Tao .text-muted-sm class (12px, muted color)
E6.03  Tao .text-caption class (11px, uppercase, letter-spacing: 0.05em)
E6.04  Tao .text-price class (tabular-nums, 18px, primary color)
E6.05  Tao .prose class cho long-form text (line-height: 1.7, paragraph margin)
E6.06  Tao .truncate-2 class (display: -webkit-box; -webkit-line-clamp: 2)
E6.07  Tao .truncate-3 class (line-clamp: 3)
E6.08  Tao .number-mono class (font-variant-numeric: tabular-nums)
```

---

## =====================================================
## E-DOT 26: U03 — COLOR PALETTE & BRAND (18 buoc)
## =====================================================

### E7. Brand Colors (10 buoc)
```
E7.01  Dinh nghia primary palette: --primary thay bang --brand-600
E7.02  Dinh nghia secondary palette: --secondary = --brand-100
E7.03  Cap nhat --accent voi complementary color
E7.04  Them semantic: --color-order-pending: amber, --color-order-shipped: blue, --color-order-delivered: green
E7.05  Them tier colors: --color-tier-dong: #CD7F32, --color-tier-bac: #C0C0C0, --color-tier-vang: #FFD700, --color-tier-kim-cuong: #B9F2FF
E7.06  Them chart palette: 6 mau chinh cho bieu do, dam bao phan biet ro
E7.07  Them surface tints: --surface-primary: brand-50/10, --surface-success: success-50/10
E7.08  Them text on surface: --text-on-primary: white, --text-on-surface: foreground
E7.09  Them hover/active states: --primary-hover: brand-700, --primary-active: brand-800
E7.10  Them focus ring: --focus-ring: 0 0 0 2px var(--brand-200)
```

### E8. Dark Mode Prep (8 buoc)
```
E8.01  Tao :root[data-theme="dark"] {} block trong theme.css voi tat ca variables override
E8.02  Dark mode --background: #0f172a, --foreground: #e2e8f0
E8.03  Dark mode --surface-1: #1e293b, --surface-2: #0f172a
E8.04  Dark mode --border: #334155
E8.05  Tao ThemeToggle component: button Sun/Moon icon, onClick toggle data-theme attribute
E8.06  Persist preference: localStorage.setItem('theme', 'dark'/'light')
E8.07  Auto-detect: @media (prefers-color-scheme: dark) initial value
E8.08  Them ThemeToggle vao Header cua 3 layout (Buyer, Seller, Admin)
```

---

## =====================================================
## E-DOT 27-28: U04 — SHARED COMPONENT FACELIFT (32 buoc)
## =====================================================

### E9. DataTable Redesign (8 buoc)
```
E9.01  Sticky header: position: sticky; top: 0; z-index: 10; background: surface-1
E9.02  Row hover: hover:bg-brand-50/30 voi transition 150ms
E9.03  Zebra stripe: even row bg-muted/10
E9.04  Column resize: cursor col-resize tren header border (CSS only, gia lap visual)
E9.05  Density toggle: 3 size (compact 28px, default 40px, relaxed 52px) — button group nho goc phai
E9.06  Sort indicator: icon ArrowUp/ArrowDown voi transition rotate
E9.07  Empty state: illustration SVG + text "Khong co du lieu" + optional action button
E9.08  Mobile card auto: @media < 768px hien thi data dang card thay vi table (map row -> card)
```

### E10. FilterBar & FormDialog (8 buoc)
```
E10.01  FilterBar: active filter hien thi dang chip (rounded-full bg-brand-100 text-brand-700) voi nut X xoa
E10.02  FilterBar: animation slide-down khi mo filter panel (max-height transition)
E10.03  FilterBar: active count badge tren nut "Bo loc" (Badge so do)
E10.04  FilterBar: search input co icon Search animated focus (scale 1 -> 1.1)
E10.05  FormDialog: slide-in tu phai (thay vi center, cho dialog lon) — translateX animation
E10.06  FormDialog: step indicator (tren cung) neu form co nhieu buoc (dot line)
E10.07  FormDialog: validation glow — input co loi hien border-red + shadow red nhe
E10.08  FormDialog: loading overlay khi submit (spinner + text "Dang xu ly...")
```

### E11. Button, Badge, Card Facelift (8 buoc)
```
E11.01  Button primary: gradient bg (brand-500 -> brand-600) + hover brightness 1.05
E11.02  Button hover: scale(1.02) transition 100ms
E11.03  Button loading: spinner SVG animate-spin + text "Dang..." + disabled state
E11.04  Button icon: gap-2, icon size match text size
E11.05  Badge: them dot indicator (4px circle) truoc text cho status badges
E11.06  Badge pulse: animation pulse cho badge "Moi" hoac "Khẩn cấp"
E11.07  Card hover: translateY(-2px) + shadow-md transition 200ms
E11.08  Card accent: border-left 3px solid primary cho card "active" hoac "highlighted"
```

### E12. StatusBadge, Breadcrumb, Other (8 buoc)
```
E12.01  StatusBadge: them icon nho (4px dot mau) truoc text, vd: xanh dot + "Hieu luc"
E12.02  StatusBadge: hover tooltip hien ngay/gio cap nhat cuoi
E12.03  Breadcrumb: chevron icon co animation rotate khi navigate
E12.04  Breadcrumb: current item bold + primary color, previous items hover underline
E12.05  ViewToggle: icon co animation scale khi switch (active icon scale 1.1)
E12.06  ViewToggle: active item co bg-primary text-white
E12.07  ImportDialog: drag-drop zone co dashed border animation (dash-offset animate)
E12.08  ImportDialog: file preview card voi icon loai file + ten + kich thuoc
```

---

## =====================================================
## E-DOT 29-30: U05 — LAYOUT & NAVIGATION REDESIGN (28 buoc)
## =====================================================

### E13. Header Redesign (8 buoc)
```
E13.01  Header: glassmorphism effect (backdrop-blur-md bg-white/80)
E13.02  Header: brand logo SVG/text ben trai, styled "B2B Market" voi gradient text
E13.03  Header: notification bell co animation shake khi co thong bao moi + badge do so
E13.04  Header: user avatar dropdown (Avatar circle + ChevronDown) -> menu: Profile, Settings, Logout
E13.05  Header: search bar expand animation (width 200px -> 400px on focus) voi transition
E13.06  Header: mobile hamburger menu icon co animation 3-line -> X (CSS transition)
E13.07  Header: shadow on scroll (add shadow-sm khi window.scrollY > 0, useEffect)
E13.08  Header: sticky top-0 z-50, height 64px consistent
```

### E14. Sidebar Redesign (10 buoc)
```
E14.01  Sidebar: collapsible toggle button (ChevronLeft/ChevronRight) — width animate 280px <-> 72px
E14.02  Sidebar: icon-only mode khi collapsed — tooltip hien label khi hover icon
E14.03  Sidebar: active menu item gradient bg (brand-50 -> transparent), border-left 3px brand-500
E14.04  Sidebar: hover item bg-muted/50 voi transition 150ms
E14.05  Sidebar: section dividers — Separator + section label (text-xs uppercase text-muted-foreground)
E14.06  Sidebar: badge count ben phai menu item (vd: "Don hang (5)", "Cho duyet (3)") — Badge nho
E14.07  Sidebar: collapse animation smooth (width + content opacity transition)
E14.08  Sidebar: scrollable khi nhieu menu item (overflow-y-auto, custom scrollbar thin)
E14.09  Sidebar: bottom section: user info (avatar + ten + role) khi expanded, chi avatar khi collapsed
E14.10  Sidebar: mobile overlay — fullscreen overlay voi slide-in animation, backdrop click de dong
```

### E15. Page Layout (10 buoc)
```
E15.01  Content area: bg-surface-3 (mau nhe hon card), tao depth
E15.02  Page title section: flex between title + action buttons, margin bottom 24px
E15.03  Sticky action bar: khi scroll xuong, action buttons (Tao moi, Export) sticky top duoi header
E15.04  Footer: copyright + version + links (Help, Docs, Support) — fixed bottom hoac end of content
E15.05  Responsive breakpoints: < 640px (1 col), 640-1024px (2 col), > 1024px (3+ col) cho grid layouts
E15.06  Print layout: @media print { hide sidebar, header compact, DataTable full width, no shadow }
E15.07  Container max-width: 1536px center, responsive padding
E15.08  Section spacing: gap-6 giua cac section (stats, filter, table)
E15.09  Loading state: page skeleton nhat quan (DashboardSkeleton, ListSkeleton, DetailSkeleton)
E15.10  Error boundary: ErrorFallback component voi icon, message, retry button
```

---

## =====================================================
## E-DOT 31: U06 — ANIMATION & MICRO-INTERACTIONS (24 buoc)
## =====================================================

### E16. Page Transitions (6 buoc)
```
E16.01  Fade/slide enter: trang moi fade-in + translateY(8px) -> 0 voi duration 200ms (motion/react)
E16.02  Stagger children: cards trong grid enter lan luot voi delay 50ms moi card (motion staggerChildren)
E16.03  Skeleton-to-content: skeleton fade-out + content fade-in (crossfade effect)
E16.04  Tab switch: tab content slide left/right tuy huong chuyen tab (motion AnimatePresence)
E16.05  Dialog scale-in: dialog scale(0.95) -> scale(1) + fade-in 150ms
E16.06  Toast slide-in: toast slide tu phai vao (translateX 100% -> 0)
```

### E17. Data Animations (6 buoc)
```
E17.01  Number count-up: so tren stat cards dem tu 0 den gia tri that (useEffect + requestAnimationFrame, 500ms)
E17.02  Progress bar animate: width animate tu 0 den value % voi transition 600ms ease-out
E17.03  Chart enter: recharts animationBegin=0, animationDuration=800, animationEasing="ease-out"
E17.04  List item stagger: DataTable rows stagger enter (opacity 0->1, translateY 4px->0, delay 30ms*index)
E17.05  Card grid enter: grid cards stagger (scale 0.98->1, opacity 0->1, delay 50ms*index)
E17.06  Loading shimmer: skeleton co shimmer gradient animation (background-position slide)
```

### E18. Interaction Feedback (6 buoc)
```
E18.01  Button ripple: CSS ripple effect on click (::after pseudo-element scale animation)
E18.02  Checkbox bounce: check icon bounce animation (scale 0->1.2->1) khi check
E18.03  Toggle slide: switch knob translateX animation smooth 150ms
E18.04  Input focus glow: box-shadow 0 0 0 3px brand-200/50 transition 200ms khi focus
E18.05  Drag preview: dragged item scale(1.05) + shadow-lg + opacity 0.8
E18.06  Scroll reveal: elements below fold fade-in khi scroll vao viewport (IntersectionObserver)
```

### E19. Special Effects (6 buoc)
```
E19.01  Confetti: OrderConfirmation page — confetti animation CSS (nhieu particle random position + color fall down)
E19.02  Tier-up: Loyalty page — celebration animation khi len tier moi (sparkle + text "Chuc mung!")
E19.03  Notification pop: notification badge scale animation khi co thong bao moi (scale 1->1.3->1)
E19.04  Achievement unlock: toast dac biet khi dat milestone (icon trophy + gradient background)
E19.05  Typing indicator: 3 dots bounce animation cho chat/message (dot 1,2,3 delay khac nhau)
E19.06  Online pulse: green dot co pulse animation cho user online status
```

---

## =====================================================
## E-DOT 32: U07 — FORM & INPUT BEAUTIFICATION (20 buoc)
## =====================================================

### E20. Input Redesign (10 buoc)
```
E20.01  Floating label: label translateY len tren khi input focus/co gia tri (CSS transition)
E20.02  Focus border gradient: border-color transition tu gray -> brand-500 khi focus
E20.03  Error shake: input co loi shake animation (translateX -4px, 4px, 0) 300ms
E20.04  Helper text: text nho duoi input (text-xs text-muted-foreground), do khi error
E20.05  Character count: hien "{current}/{max}" o goc phai duoi input/textarea
E20.06  Prefix/suffix icon: icon ben trai (vd: Search, Mail) hoac ben phai (vd: Eye toggle password)
E20.07  Search clear button: nut X nho xuat hien khi co text, click de xoa, fade-in animation
E20.08  Date picker style: custom style cho input[type="date"] — icon calendar, hover border
E20.09  File input drag area: dashed border + icon Upload + text "Keo tha hoac click", hover bg-muted/30
E20.10  Textarea auto-resize: textarea tu dong tang height theo noi dung (scrollHeight adjustment)
```

### E21. Select, Checkbox, Radio (10 buoc)
```
E21.01  Custom select dropdown: shadow-lg, rounded-lg, item hover bg-brand-50
E21.02  Combobox tag style: tag chip (rounded-full bg-brand-100) voi nut X xoa, wrap flex
E21.03  Checkbox custom: brand-color khi checked, transition scale
E21.04  Radio card option: card-style radio (border highlight khi selected, icon check)
E21.05  Switch toggle: bg transition gray->brand, knob slide smooth
E21.06  Slider: track + thumb styled, tooltip hien gia tri khi drag
E21.07  Star rating input: interactive stars (click de chon, hover preview), vang fill
E21.08  Color picker: grid 12 mau preset, click chon, border highlight selected
E21.09  Quantity stepper: - / input / + styled buttons, min/max validation
E21.10  OTP input: 6 o input rieng biet, auto-focus next, backspace quay lai
```

---

## =====================================================
## E-DOT 32 (tiep): U08 — DATA VISUALIZATION & CHARTS (16 buoc)
## =====================================================

### E22. Chart Styling (8 buoc)
```
E22.01  Brand color palette: export CHART_COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'] cho tat ca chart
E22.02  Gradient fills: AreaChart co gradient fill (fillOpacity 0.3 -> 0), BarChart co gradient bar
E22.03  Tooltip custom: bg-white shadow-lg rounded-lg p-3, header bold, body items
E22.04  Legend style: custom legend component voi dot color + text, flex gap, align center
E22.05  Axis style: tick font 11px, text-muted-foreground, grid line strokeDasharray "3 3" opacity 0.3
E22.06  Grid line subtle: CartesianGrid stroke="#e5e7eb" strokeDasharray="4 4"
E22.07  Responsive chart container: min-height 200px, max-height 400px, ResponsiveContainer 100% width
E22.08  Animate on scroll: chart chi animate khi scroll vao viewport (IntersectionObserver + state trigger)
```

### E23. Chart Components (8 buoc)
```
E23.01  MiniSparkline component: props { data, width=80, height=30, color }, dung cho KPI cards inline
E23.02  KPICard component: icon + value + label + trend arrow (up/down) + growth % + optional sparkline
E23.03  DonutCenterLabel component: PieChart voi text o giua (total/label) — custom label
E23.04  FunnelChart component: vertical funnel (CSS trapezoid shapes) cho conversion funnel
E23.05  GaugeChart component: half-circle gauge (CSS conic-gradient) cho score 0-100
E23.06  HeatmapChart component: grid cells voi color intensity (CSS grid + bg-opacity mapping)
E23.07  ComparisonBar component: 2 bar so sanh (target vs actual) voi label va % difference
E23.08  MetricTile component: compact tile (icon + value + label) cho dashboard widget grids
```

---

## =====================================================
## E-DOT 33: U09 — CARD & SURFACE DESIGN (18 buoc)
## =====================================================

### E24. Card Variants (10 buoc)
```
E24.01  ElevatedCard: shadow-md hover:shadow-lg transition
E24.02  FlatCard: border-0 bg-muted/30
E24.03  BorderedCard: border-2 hover:border-primary transition
E24.04  GradientCardHeader: CardHeader voi gradient bg (brand-500->brand-600), text white
E24.05  ImageCardOverlay: image background voi gradient overlay, text tren overlay
E24.06  StatCardIconBg: icon co bg circle (24x24) mau nhat phia sau
E24.07  PricingCard: highlighted center card (scale 1.05, border primary, badge "Pho bien")
E24.08  FeatureCard: icon + title + description + CTA link, hover lift
E24.09  TestimonialCard: quote icon + text + avatar + name, bg-muted/20
E24.10  NotificationCard: left border color (info/warning/error), icon + title + time + action link
```

### E25. Surface & Section (8 buoc)
```
E25.01  SectionDivider component: thin line + optional center label text
E25.02  ContentGroup component: bg-muted/10 rounded-lg p-4, dung de group related content
E25.03  Panel component: bg-white shadow-sm rounded-lg, collapsible (click header toggle body)
E25.04  Well component: bg-muted/20 rounded-md p-3 border, inset look, dung cho detail info
E25.05  BannerHero component: full-width gradient bg + title + subtitle + CTA button
E25.06  CalloutBox component: left border 3px + bg-tint, icon + text, cho important notices
E25.07  RibbonBadge component: diagonal ribbon goc tren phai "Moi" / "Hot" / "KM" (CSS transform rotate)
E25.08  FAB (FloatingActionButton): fixed bottom-right, round button + shadow, onClick action
```

---

## =====================================================
## E-DOT 34: U10 — BUYER TRANG CHU & LANDING (26 buoc)
## =====================================================

### E26. Hero & Featured (10 buoc)
```
E26.01  Hero banner: full-width gradient bg (hero gradient) + headline text + sub text
E26.02  Hero search bar: large search input centered, shadow-lg, icon Search, placeholder "Tim san pham, NCC..."
E26.03  Featured categories grid: 6-8 card category (icon + ten), grid 2x4 mobile, 4x2 desktop
E26.04  Trending products carousel: react-slick carousel, 4 visible items, arrow nav, auto-play
E26.05  Top suppliers carousel: supplier card (logo + ten + rating + badge verified), react-slick
E26.06  Promotional banner: full-width card gradient, CTA "Xem ngay", countdown neu co
E26.07  Trust badges row: 4 icon+text (Giao hang nhanh, Thanh toan an toan, Bao hanh, Ho tro 24/7)
E26.08  Stats counter: 4 so animate (500+ NCC, 10000+ SP, 2000+ Buyer, 99% hai long) — count-up animation
E26.09  Unsplash images: goi unsplash_tool cho hero bg, category icons, banner
E26.10  Responsive hero: mobile = stack vertical, desktop = 2 col (text + image)
```

### E27. Homepage Sections (8 buoc)
```
E27.01  "Moi nhat" section: heading + "Xem tat ca" link + grid 4 product cards
E27.02  "Ban chay" section: heading + grid 4 product cards voi badge "Ban chay" ribbon
E27.03  "Khuyen mai" section: heading + grid 4 product cards voi badge "Giam X%" + gia gach
E27.04  "Danh muc noi bat" section: grid 3x2 category cards voi image background + overlay text
E27.05  CTA section: "Dang ky NCC" + "Dang ky Mua hang" — 2 col card voi gradient, icon, description
E27.06  Newsletter signup: email input + nut "Dang ky" — full-width bg-brand-50
E27.07  Partner logos: row flex wrap logo NCC lon (ImageWithFallback), grayscale hover:color
E27.08  Footer redesign: 4 col (Ve chung toi, San pham, Ho tro, Ket noi) + copyright + social icons
```

### E28. Landing Polish (8 buoc)
```
E28.01  Scroll animations: sections fade-in + translateY khi scroll vao viewport
E28.02  Parallax hero: hero image translateY cham hon text khi scroll (CSS transform)
E28.03  Lazy image fade-in: ImageWithFallback co opacity 0->1 transition khi loaded
E28.04  Hover card effects: product card image scale(1.05), shadow increase, title color change
E28.05  Mobile swipe carousel: react-slick swipeToSlide cho mobile, dot indicators
E28.06  Category icon animation: icon scale(1.1) + color change on hover
E28.07  Responsive hero: mobile full-width image, tablet split, desktop full hero
E28.08  Meta tags: document.title + description cho trang chu (useEffect)
```

---

## =====================================================
## E-DOT 35: U11 — BUYER PRODUCT & SUPPLIER PAGES (24 buoc)
## =====================================================

### E29. Product Pages (12 buoc)
```
E29.01  ProductList filter sidebar: left sidebar (250px desktop, drawer mobile) voi category tree, price range slider, rating filter, stock toggle
E29.02  ProductList grid card redesign: image ratio 4:3, hover overlay "Xem nhanh", shadow transition
E29.03  ProductList list view: row layout voi image thumbnail + info + price + action buttons
E29.04  Price highlight: font-variant-numeric tabular-nums, color primary, gia goc gach do
E29.05  Stock badge: "Con hang" (green), "Sap het" (amber), "Het hang" (red) + dot indicator
E29.06  Quick view hover: overlay button "Xem nhanh" tren product image khi hover
E29.07  Compare checkbox: checkbox goc tren card, khi check hien floating bar "So sanh {N} SP"
E29.08  ProductDetail image gallery: thumbnail row duoi anh lon, click de doi, zoom on hover
E29.09  ProductDetail sticky add-to-cart: khi scroll qua section san pham, action bar sticky bottom
E29.10  ProductDetail tab redesign: tabs voi underline indicator animation (translateX)
E29.11  Related products section: "San pham tuong tu" grid 4 cards
E29.12  Breadcrumb: DM > DM con > Ten SP (full path)
```

### E30. Supplier Pages (12 buoc)
```
E30.01  SupplierList card redesign: avatar/logo prominent, ten + badge verified, rating stars, categories tags
E30.02  SupplierList verified badge: ShieldCheck icon xanh, label "Da xac minh"
E30.03  SupplierList rating stars: 5 star yellow filled + so diem + so danh gia
E30.04  SupplierList filter sidebar: category, rating, verified toggle, location
E30.05  SupplierDetail cover image: full-width image parallax effect (unsplash industrial/factory)
E30.06  SupplierDetail tab redesign: horizontal tabs voi active underline animation
E30.07  SupplierDetail contact card: card noi bat voi icon Phone + Mail + MapPin + nut "Lien he"
E30.08  SupplierDetail certificate showcase: grid card chung chi voi badge verified/expired
E30.09  SupplierDetail review section: star distribution bar chart + review cards voi avatar
E30.10  SupplierDetail scorecard: radar chart voi mau brand, metric labels clear
E30.11  SupplierCompare radar chart: overlay 2-3 NCC, legend clear, tooltip
E30.12  SupplierDetail CTA buttons: "Gui RFQ" + "Lien he" + "Theo doi" prominent
```

---

## =====================================================
## E-DOT 35 (tiep): U12 — ORDER, CART, CHECKOUT (20 buoc)
## =====================================================

### E31. Cart & Checkout (10 buoc)
```
E31.01  Cart item card: image + ten SP (link) + NCC + gia + quantity stepper + subtotal + nut xoa (X)
E31.02  Cart quantity stepper: styled -/+, border, min/max validation, disabled states
E31.03  Cart price summary sidebar: sticky right, tong tien + phi ship + giam gia + tong cong, CTA "Thanh toan"
E31.04  Cart promo code input: input + nut "Ap dung", success/error feedback
E31.05  Cart empty state: illustration + text "Gio hang trong" + nut "Tiep tuc mua sam"
E31.06  Checkout step wizard: 3 step (Dia chi -> Thanh toan -> Xac nhan), progress bar, completed step check
E31.07  Checkout address card: card voi radio select, ten + dia chi + SDT, nut "Them dia chi moi"
E31.08  Checkout payment method: card-style radio (COD, Chuyen khoan, Vi dien tu) voi icon
E31.09  Checkout order summary: right sidebar sticky, items summary, tong tien, nut "Dat hang"
E31.10  Checkout confirmation: success icon animation (check mark draw), confetti, order number, nut "Xem don hang"
```

### E32. Order Pages (10 buoc)
```
E32.01  OrderList status mini-timeline: horizontal dots (5 step) voi active highlighted
E32.02  OrderList amount highlight: font-variant-numeric tabular-nums, primary color
E32.03  OrderDetail timeline vertical: left line + dot nodes, moi node = 1 status change + thoi gian
E32.04  OrderDetail item cards: image + ten + SL + gia + subtotal, styled card
E32.05  OrderDetail invoice section: link "Xem hoa don" + badge status
E32.06  OrderDetail shipment tracking: card voi ma van don + trang thai + link theo doi
E32.07  OrderDetail action buttons: grouped buttons prominent (Huy, Doi tra, Danh gia, In)
E32.08  OrderDetail print layout: @media print CSS, an sidebar/header, hien day du thong tin
E32.09  OrderList mobile card: @media < 768px, moi order = card (status badge + amount + date)
E32.10  OrderList filter: status tabs (Tat ca, Cho xu ly, Dang giao, Da giao, Da huy) tren cung table
```

---

## =====================================================
## E-DOT 36: U13-U19 — DASHBOARD, SELLER, ADMIN, AUTH (128 buoc)
## =====================================================

### E33. U13 — Buyer Dashboard & Utility (18 buoc)
```
E33.01  BuyerDashboard KPI card: gradient bg subtle, icon bg circle
E33.02  BuyerDashboard chart styling: brand colors, tooltip custom
E33.03  BuyerDashboard widget cards: shadow-sm hover:shadow-md
E33.04  BuyerDashboard quick actions: icon buttons grid (4x2)
E33.05  BuyerDashboard recent activity: timeline vertical mini
E33.06  BuyerDashboard period toggle: styled button group
E33.07  ProfilePage: form sections card, avatar upload zone
E33.08  TeamPage: member cards voi avatar + role badge
E33.09  NotificationCenter: card per notification, unread bold, category icon
E33.10  RFQListPage: status badges prominent, deadline countdown
E33.11  RFQDetailPage: timeline, bid comparison table styled
E33.12  ContractListPage: status chip, expiry warning badge
E33.13  ContractDetailPage: terms section, signature area styled
E33.14  InvoiceListPage: amount column right-aligned, status badge
E33.15  InvoiceDetailPage: print-friendly layout, watermark "Ban sao"
E33.16  ShipmentPage: tracking timeline, carrier logo
E33.17  PaymentPage: method icon, amount styled
E33.18  WishlistPage: product cards voi remove button, "Them vao gio" CTA
```

### E34. U14 — Seller Dashboard & Layout (22 buoc)
```
E34.01  SellerLayout sidebar: section dividers, badge count
E34.02  SellerDashboard KPI cards: gradient, sparkline, growth arrow
E34.03  SellerDashboard revenue chart: area gradient fill
E34.04  SellerDashboard order pie: brand colors
E34.05  SellerDashboard top products: ranking number circle
E34.06  SellerDashboard stock alerts: red/amber highlight
E34.07  SellerDashboard RFQ widget: countdown, status badge
E34.08  SellerDashboard contract widget: expiry warning
E34.09  SellerDashboard payment widget: overdue red highlight
E34.10  SellerDashboard activity timeline: mini, 8 items
E34.11  SellerDashboard SLA widget: score color coded
E34.12  SellerDashboard responsive: 1 col mobile, 2 col tablet, multi desktop
E34.13  SellerProfile: avatar, company info card, certificate grid
E34.14  SellerNotification: category tabs, unread count
E34.15  SellerActivity: timeline full, filter by type
E34.16  SellerReports tabs: styled tab underline
E34.17  SellerStaff: member card grid, permission matrix styled
E34.18  SellerApprovals: pending queue styled, action buttons prominent
E34.19  SellerPromotions: card grid voi % badge, status
E34.20  SellerDebitCredit: type badge (no=cam, co=xanh)
E34.21  SellerPriceAgreement: progress bar styled
E34.22  SellerSLA: radar chart brand colors, violation red highlight
```

### E35. U15 — Seller Pages (20 buoc)
```
E35.01  SellerProductForm: multi-step wizard, image upload grid, specification table styled
E35.02  SellerProductList: grid/list toggle, status badge, stock indicator
E35.03  SellerOrderList: status timeline mini, amount highlight
E35.04  SellerOrderDetail: processing flow steps, action buttons prominent
E35.05  SellerOrderDetail ship dialog: carrier select card, tracking input
E35.06  SellerInventory: stock level bars, reorder point line
E35.07  SellerInventory adjustment form: reason select, quantity stepper
E35.08  SellerWarehouse: kho cards grid, capacity progress bar
E35.09  SellerWarehouse transfer: timeline steps visual
E35.10  SellerShipment: carrier logo, tracking timeline
E35.11  SellerPayment: amount column styled, method icon
E35.12  SellerInvoice: print layout, itemized table styled
E35.13  SellerContract: terms section, date range badge
E35.14  SellerRFQ: response form styled, pricing table
E35.15  SellerAuction: bid form styled, ranking table
E35.16  SellerBudget: allocation progress bars
E35.17  SellerPR: items table styled
E35.18  SellerGRN: quality score visual
E35.19  SellerWarranty: claim timeline, action buttons
E35.20  SellerDocument: file type icons, upload dropzone
```

### E36. U16 — Admin Dashboard & Layout (18 buoc)
```
E36.01  AdminLayout sidebar: grouped sections, collapsible groups
E36.02  AdminLayout sidebar: active item highlight, badge count
E36.03  AdminDashboard hero: system health card (green/amber/red dot + uptime %)
E36.04  AdminDashboard KPI: 6 cards voi trend arrows
E36.05  AdminDashboard charts: GMV line, user growth, order volume
E36.06  AdminDashboard approval queue: count badges, action links
E36.07  AdminDashboard activity feed: mini timeline, user avatars
E36.08  AdminDashboard alerts: banner warnings (NCC vi pham, het han chung chi)
E36.09  Admin pages common: consistent breadcrumb + stats + table pattern
E36.10  AdminUserPage: avatar, role badge, status toggle styled
E36.11  AdminSupplierPage: verification badge, score badge
E36.12  AdminCategoryPage: tree view styled, drag handle visual
E36.13  AdminProductPage: approval action buttons prominent
E36.14  AdminOrderPage: timeline, intervention buttons
E36.15  AdminReportPage: chart tabs styled
E36.16  AdminSettingsPage: section cards, toggle switches
E36.17  AdminSystemHealthPage: uptime %, latency gauge, error rate
E36.18  AdminRevenueReport: chart + table + export buttons
```

### E37. U17 — Admin Management Pages (16 buoc)
```
E37.01  AdminPRPage styling: timeline, items table
E37.02  AdminGRNPage styling: quality score visual, issue highlight
E37.03  AdminDebitCreditPage styling: type badge colors
E37.04  AdminBudgetPage styling: progress bars, overspend warning
E37.05  AdminAuctionPage styling: bid ranking table
E37.06  AdminPriceAgreementPage styling: expiry countdown
E37.07  AdminSLAPage styling: violation dashboard, score charts
E37.08  AdminDocumentPage styling: file type icons, grid view
E37.09  AdminWarrantyPage styling: claim timeline, status flow
E37.10  AdminLoyaltyPage styling: tier colors, reward cards
E37.11  AdminAnalyticsPage styling: charts brand colors, export buttons
E37.12  AdminReportBuilderPage styling: builder steps visual
E37.13  AdminIntegrationPage styling: service logos, status dots
E37.14  AdminWarehousePage styling: capacity visual, location tags
E37.15  AdminReturnPage styling: timeline, amount highlight
E37.16  AdminDashboard widgets: all new feature widgets styled
```

### E38. U18 — Auth Pages & Onboarding (16 buoc)
```
E38.01  LoginPage: split layout — left gradient brand + illustration, right form
E38.02  LoginPage form: card shadow-lg, logo, email + password inputs, "Dang nhap" button gradient
E38.03  LoginPage: "Quen mat khau" link, "Chua co tai khoan? Dang ky" link
E38.04  LoginPage: role selector (Buyer / Seller / Admin) styled tabs
E38.05  RegisterPage: multi-step form (1: Thong tin ca nhan, 2: Thong tin cong ty, 3: Xac nhan)
E38.06  RegisterPage step 1: ho ten, email, SDT, mat khau (strength indicator)
E38.07  RegisterPage step 2: ten cong ty, MST, dia chi, nganh nghe (select)
E38.08  RegisterPage step 3: xem lai thong tin, checkbox dong y dieu khoan, nut "Dang ky"
E38.09  RegisterPage: role selection card (Buyer card + Seller card) voi icon + mo ta
E38.10  Onboarding wizard: 3 slide welcome (feature tour) voi dot indicator + Next/Skip
E38.11  Onboarding slide 1: "Chat luong dau tien" — icon + description
E38.12  Onboarding slide 2: "Ket noi nhanh" — icon + description
E38.13  Onboarding slide 3: "Quan ly thong minh" — icon + description
E38.14  First-time setup: sau dang ky Buyer, goi y "Thiet lap ngan sach", "Tao nhom mua"
E38.15  First-time setup: sau dang ky Seller, goi y "Them san pham", "Cap nhat ho so"
E38.16  Auth animations: form slide-in, button loading, success checkmark
```

### E39. U19 — Dark Mode & Final Polish (20 buoc)
```
E39.01  Dark mode: tat ca chart colors adjust (lighter on dark bg)
E39.02  Dark mode: image brightness 90% tren dark bg
E39.03  Dark mode: border color subtle (#334155)
E39.04  Dark mode: scrollbar custom dark (track #1e293b, thumb #475569)
E39.05  Dark mode: print override (force light mode khi in)
E39.06  Contrast check: tat ca text tren bg dat WCAG AA (4.5:1 ratio)
E39.07  Hover state audit: tat ca interactive element co hover visual feedback
E39.08  Focus state audit: tat ca focusable element co visible focus ring
E39.09  Font size audit: tat ca text >= 12px, heading hierarchy nhat quan
E39.10  Spacing audit: nhat quan gap/padding/margin theo spacing tokens
E39.11  Icon consistency: tat ca icon lucide-react, size nhat quan (16px inline, 20px button, 24px header)
E39.12  Loading state: tat ca trang co skeleton loading, tat ca action co loading spinner
E39.13  Error state: tat ca form co error message, tat ca API call co error toast
E39.14  Empty state: tat ca DataTable co empty illustration + text + action
E39.15  Toast position: top-right nhat quan, max 3 visible
E39.16  Modal backdrop: bg-black/50 nhat quan, click backdrop de dong
E39.17  Z-index audit: header(50), sidebar(40), dialog(100), toast(200), dropdown(30)
E39.18  Responsive final check: tat ca trang test 375px, 768px, 1024px, 1440px
E39.19  Image optimization: tat ca ImageWithFallback co loading="lazy" + aspect ratio
E39.20  Scroll behavior: smooth scroll cho anchor links, scroll-to-top khi navigate
```

---

## =====================================================
## =====================================================
##
## GIAI DOAN F — KIEM THU, POLISH & HOAN THIEN
## 78 buoc | Dot 37-40
##
## =====================================================
## =====================================================

---

## =====================================================
## F-DOT 37: CROSS-CUTTING CONCERNS (20 buoc)
## =====================================================

### F1. Lien ket du lieu giua cac module (10 buoc)
```
F1.01  Kiem tra link chain: Order -> Shipment -> Payment -> Invoice -> GRN -> Return (click tung link, dam bao navigation dung)
F1.02  Kiem tra link chain: RFQ -> Bid -> Contract -> PriceAgreement -> Order (procurement chain)
F1.03  Kiem tra link chain: PR -> Approval -> Order -> GRN -> Payment (internal procurement chain)
F1.04  Kiem tra link chain: Auction -> Bid -> Winner -> Contract / Order
F1.05  Kiem tra link chain: Budget -> PR -> Order -> Payment -> Transaction
F1.06  Kiem tra link chain: Warranty -> Claim -> Resolution -> DebitCredit
F1.07  Kiem tra link chain: Loyalty -> Order -> Points -> Redemption
F1.08  Kiem tra link chain: SLA -> Report -> Scorecard -> Compare
F1.09  Kiem tra link chain: Document -> Order / Contract / Invoice / GRN (toan bo entity)
F1.10  Kiem tra: Notification tu dong tao cho tat ca su kien quan trong (order placed, shipped, delivered, review, claim, etc.)
```

### F2. Consistency Check (10 buoc)
```
F2.01  Kiem tra: tat ca trang deu co AppBreadcrumb
F2.02  Kiem tra: tat ca DataTable deu co pagination, sort, filter, getId, totalItems, renderActions
F2.03  Kiem tra: tat ca form deu co validation + error message tieng Viet co dau
F2.04  Kiem tra: tat ca hanh dong CRUD deu co toast (sonner) — success xanh, error do
F2.05  Kiem tra: tat ca trang deu responsive (test 375px mobile)
F2.06  Kiem tra: tat ca route deu co lazy import + Suspense fallback (skeleton)
F2.07  Kiem tra: tat ca menu sidebar deu cap nhat day du (Buyer: ~18 items, Seller: ~20 items, Admin: ~25 items)
F2.08  Kiem tra: tat ca status string deu dung StatusBadge component (khong hard-code mau)
F2.09  Kiem tra: tat ca file <= 2000 dong (tach component neu vuot)
F2.10  Kiem tra: khong co import thua, unused variable (Sonar clean)
```

---

## =====================================================
## F-DOT 38: BUYER FLOW TESTING (20 buoc)
## =====================================================

### F3. Buyer User Journeys (20 buoc)
```
F3.01  Flow: Dang nhap -> Dashboard -> Xem don hang gan day -> Click vao don -> Xem chi tiet
F3.02  Flow: Tim SP (search) -> Xem chi tiet SP -> Them gio hang -> Cart -> Checkout -> Xac nhan don
F3.03  Flow: Tao RFQ -> NCC bao gia -> So sanh bao gia -> Chon NCC -> Tao hop dong -> Dat hang tu HD
F3.04  Flow: Tao PR -> Gui duyet -> Duoc duyet -> Tao don hang tu PR -> Theo doi don
F3.05  Flow: Nhan hang (don Da giao) -> Tao GRN -> Bao loi SP -> Tao yeu cau tra hang
F3.06  Flow: Xem NCC -> Scorecard -> So sanh 2-3 NCC -> Chon NCC co diem cao nhat
F3.07  Flow: Tao phien dau gia -> Moi NCC -> NCC bo gia -> Xem ranking -> Chon NCC thang
F3.08  Flow: Xem thoa thuan gia -> Chi tiet SP -> Dat hang theo gia TT -> Cart voi gia TT
F3.09  Flow: Xem ngan sach -> Kiem tra con du -> Dat hang -> Cap nhat ngan sach
F3.10  Flow: Xem bao hanh SP -> Gui claim -> Theo doi claim -> NCC phan hoi -> Dong
F3.11  Flow: Xem loyalty -> Check diem -> Doi thuong -> Dung diem khi checkout -> +diem sau dat hang
F3.12  Flow: Tao bao cao tuy chinh -> Chon nguon -> Chon cot -> Loc -> Bieu do -> Luu -> Export CSV
F3.13  Flow: Xem phan tich mua hang -> Drill-down category -> So sanh ky truoc -> Export
F3.14  Flow: Quan ly nhom mua -> Moi TV -> Phan quyen -> TV moi dang nhap -> Thay menu tuong ung
F3.15  Flow: Xem thong bao -> Click thong bao "Don hang da giao" -> Di den OrderDetail
F3.16  Flow: Upload tai lieu -> Gan vao don hang -> Xem tai lieu tu OrderDetail
F3.17  Flow: Xem han muc tin dung -> Dat hang tra cham -> Cap nhat han muc
F3.18  Flow: Danh gia SP sau khi nhan -> NCC tra loi danh gia -> Xem tren SP detail
F3.19  Flow: Xem hoa don -> Xem phieu ghi no/co lien quan -> Xem chi tiet
F3.20  Flow: Cau hinh tich hop -> Tao webhook -> Test ping -> Xem lich su dong bo
```

---

## =====================================================
## F-DOT 39: SELLER + ADMIN FLOW TESTING (20 buoc)
## =====================================================

### F4. Seller User Journeys (10 buoc)
```
F4.01  Flow: Dashboard -> Don moi -> Xu ly don -> Chon kho -> Tao van don -> Cap nhat trang thai -> Da giao
F4.02  Flow: Quan ly kho -> Xem ton -> Chuyen kho -> Duyet -> Dang chuyen -> Da nhan
F4.03  Flow: Nhan RFQ -> Bao gia -> Duoc chon -> Tao hop dong -> Buyer dat hang -> Xu ly
F4.04  Flow: Xem phien dau gia -> Bo gia -> Cap nhat gia -> Thang -> Nhan don -> Xu ly
F4.05  Flow: Tao thoa thuan gia -> Them SP + gia TT -> Gui Buyer -> Buyer dat hang theo TT
F4.06  Flow: Tao SLA -> Them metrics -> Xem bao cao thang -> Canh bao vi pham -> Cai thien
F4.07  Flow: Nhan claim bao hanh -> Xem chi tiet -> Chap nhan -> Sua chua -> Dong claim
F4.08  Flow: Tao hoa don -> Buyer thanh toan -> Xac nhan -> Tao phieu ghi no (neu can)
F4.09  Flow: Tao bao cao doanh thu tuy chinh -> Xem bieu do -> Export
F4.10  Flow: Cau hinh tich hop API -> Tao API key -> Tao webhook -> Test -> Xem lich su
```

### F5. Admin User Journeys (10 buoc)
```
F5.01  Flow: Dashboard -> Tong quan he thong -> KPI -> Charts -> Canh bao
F5.02  Flow: Duyet SP moi -> Duyet NCC moi -> Duyet chung chi -> Cap nhat trang thai
F5.03  Flow: Quan ly don hang -> Xem chi tiet -> Shipment -> Payment -> Invoice
F5.04  Flow: Quan ly PR -> Xem chi tiet -> GRN -> Return -> Debit/Credit
F5.05  Flow: Giam sat dau gia -> Xem phien -> Can thiep (huy phien vi pham)
F5.06  Flow: Giam sat SLA -> Xem NCC vi pham -> Gui canh bao
F5.07  Flow: Quan ly ngan sach -> Xem cong ty vuot NS -> Chi tiet phan bo
F5.08  Flow: Quan ly bao hanh -> Xem claim qua han -> Can thiep -> Dong claim
F5.09  Flow: Quan ly loyalty -> Cau hinh tier -> Quan ly phan thuong -> CRUD
F5.10  Flow: Phan tich toan san -> Top NCC + Buyer -> Bao cao -> Export
```

---

## =====================================================
## F-DOT 40: FINAL POLISH & RELEASE (18 buoc)
## =====================================================

### F6. Performance & Bundle (6 buoc)
```
F6.01  Kiem tra tat ca lazy import hoat dong (React.lazy + Suspense) — moi route 1 chunk
F6.02  Kiem tra debounce 300ms cho tat ca search input (FilterBar, Combobox, autocomplete)
F6.03  Kiem tra useMemo cho cac computation nang (chart data, filtered lists, stats calculation)
F6.04  Kiem tra useCallback cho cac function truyen xuong child (fetchData, handleSubmit)
F6.05  Kiem tra skeleton loading nhat quan — moi trang co DashboardSkeleton hoac ListSkeleton
F6.06  Kiem tra offline indicator (neu co) hoac network error handling
```

### F7. Accessibility Final (6 buoc)
```
F7.01  ARIA labels: tat ca button co aria-label hoac text content
F7.02  Keyboard nav: Tab order logic, Enter activate, Escape close dialog
F7.03  Focus management: dialog open -> focus first input, dialog close -> focus trigger
F7.04  Color contrast: text-foreground on background dat >= 4.5:1 (WCAG AA)
F7.05  Screen reader: aria-live="polite" cho toast, aria-live="assertive" cho error
F7.06  Skip links: "Skip to main content" link (sr-only, visible on focus)
```

### F8. Documentation (6 buoc)
```
F8.01  Cap nhat README.md: huong dan cai dat (pnpm install), chay (pnpm dev), deploy
F8.02  Danh dau DA XONG tren tat ca plan files (PLAN_MASTER, PLAN_REMAINING)
F8.03  Tao CHANGELOG.md: danh sach feature theo Giai doan A-F, lien ket PR/commit gia lap
F8.04  Tao COMPONENT_MAP.md: bang mapping 3 cot (Component name | File path | Route) cho tat ca page
F8.05  Tao API_REFERENCE.md: danh sach mock API endpoint (service | method | params | return type)
F8.06  Tao DEPLOYMENT_GUIDE.md: huong dan chuyen tu mock -> Supabase (migration steps)
```

---

## =====================================================
## TONG KET CON LAI
## =====================================================

| Giai doan | Noi dung                              | Buoc  | Dot       | Uu tien |
|-----------|---------------------------------------|-------|-----------|---------|
| B (tt)    | Nhom 37-38 (Tai lieu, Multi-WH)       | 36    | 11-12     | CAO     |
| C         | Nhom 39-43 (Enterprise nang cao)      | 106   | 13-18     | CAO     |
| D         | Admin mo rong toan dien               | 112   | 19-24     | TRUNG BINH |
| E         | UI Beautify                           | 380   | 25-36     | THAP (song song) |
| F         | Kiem thu & Hoan thien                 | 78    | 37-40     | CAO (cuoi) |
| **TONG**  |                                       | **712** | **30 dot** |       |

### THU TU TRIEN KHAI KHUYEN NGHI:
1. **B-Dot 11-12** (Nhom 37-38): Hoan tat Giai doan B — tai lieu + multi-warehouse
2. **C-Dot 13-18** (Nhom 39-43): Cac tinh nang enterprise nang cao
3. **D-Dot 19-24** (Admin): Admin page cho tung nhom — lam ngay sau khi B/C xong nhom tuong ung
4. **E-Dot 25-36** (UI): Co the bat dau bat ky luc nao, uu tien U01-U03 (nen tang) truoc
5. **F-Dot 37-40** (Kiem thu): Cuoi cung — kiem tra toan bo truoc "release"

### QUY TAC KHI TRIEN KHAI:
- Moi DOT = 1 phien prompt "Tiep tuc"
- Moi buoc: implement code ngay + verify render
- File <= 2000 dong, tach component khi can
- Service layer rieng file khi > 300 dong
- Mock data day du, realistic
- Tieng Viet co dau toan bo UI
- DataTable: renderActions (khong phai actions), pagination, sort, getId, totalItems
- Toast sonner cho moi hanh dong CRUD
- AppBreadcrumb cho moi trang
- StatusBadge cho moi trang thai
- Responsive mobile-first
- Container: "container mx-auto px-4 py-6"

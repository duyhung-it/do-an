# KE HOACH TONG THE HOAN THIEN HE THONG
## San TMDT B2B Marketplace — 856 buoc chi tiet
## Phien ban: MASTER v1.0 — Ngay lap: 15/03/2026

---

## TRANG THAI HIEN TAI

| Hang muc                    | Buoc da xong | Buoc con lai | Trang thai      |
|-----------------------------|-------------|-------------|-----------------|
| V3 Nhom 01-28              | ~476        | 0           | DA XONG         |
| V3 Nhom 29 (So sanh NCC)   | 16          | 0           | DA XONG         |
| V3 Nhom 30 (PR)            | 22          | 0           | DA XONG (A-Dot1)|
| V3 Nhom 31 (GRN)           | 18          | 0           | DA XONG (A-Dot2)|
| V3 Nhom 32 (Ghi no/co)    | 16          | 0           | DA XONG (A-Dot3)|
| V3 Nhom 33 (Budget)        | 22          | 0           | DA XONG (B-D5+6)|
| V3 Nhom 34 (Auction)       | 20          | 0           | DA XONG (B-Dot7)|
| V3 Nhom 35 (PriceAgreement)| 24          | 0           | DA XONG (B-D8+9)|
| V3 Nhom 36 (SLA)           | 18          | 0           | DA XONG (B-D10) |
| V3 Nhom 37-43 (Enterprise) | 0           | 142         | CHUA BAT DAU    |
| Admin mo rong (Nhom 30-43) | 0           | 112         | CHUA BAT DAU    |
| Nang cap giao dien (UI)    | 0           | 380         | CHUA BAT DAU    |
| Kiem thu & Hoan thien      | 0           | 78          | CHUA BAT DAU    |

**Tong con lai: 856 buoc | 40 dot trien khai | Chia thanh 6 GIAI DOAN chinh**

---

## MUC LUC GIAI DOAN

- **GIAI DOAN A** — Hoan tat V3 con lai (Nhom 29-32): 78 buoc | Dot 1-4
- **GIAI DOAN B** — Tinh nang Enterprise moi (Nhom 33-38): 126 buoc | Dot 5-12
- **GIAI DOAN C** — Tinh nang Enterprise nang cao (Nhom 39-43): 106 buoc | Dot 13-18
- **GIAI DOAN D** — Admin mo rong toan dien: 112 buoc | Dot 19-24
- **GIAI DOAN E** — Nang cap giao dien (UI Beautify): 380 buoc | Dot 25-36 (*)
- **GIAI DOAN F** — Kiem thu, Polish & Hoan thien: 78 buoc | Dot 37-40
  (*) UI co the chay song song voi B/C/D

---

## =====================================================
## =====================================================
##
## GIAI DOAN A — HOAN TAT V3 CON LAI (NHOM 29-32)
## 78 buoc | Dot 1-4
##
## =====================================================
## =====================================================

---

## =====================================================
## A-DOT 1: HOAN TAT NHOM 29 + BAT DAU NHOM 30 (24 buoc)
## =====================================================

### A1. Hoan tat Nhom 29 — So sanh NCC (4 buoc con lai)
```
A1.01  29C.01  SupplierDetailPage: tab "Diem danh gia" — hien thi ScorecardDetail component
A1.02  29C.02  SupplierListPage: them cot "Diem" (overallScore tu scoreMap), sort theo diem
A1.03  29C.03  Route /supplier-compare da co — kiem tra va dam bao navigation hoat dong
A1.04  29C.04  SupplierListPage: checkbox chon NCC + nut "So sanh NCC" (navigate voi ids param)
```

### A2. Nhom 30A — Types & Data PR (5 buoc)
```
A2.01  30A.01  Them PRStatus type vao types/index.ts
A2.02  30A.02  Them PRItem interface vao types/index.ts
A2.03  30A.03  Them PurchaseRequisition interface vao types/index.ts
A2.04  30A.04  Them mockPurchaseRequisitions (8 ban ghi) vao mockData hoac api.ts
A2.05  30A.05  Tao prApi: getByCompany, create, update, delete, approve, reject, createOrderFromPR
```

### A3. Nhom 30B — Buyer tao & quan ly PR (10 buoc)
```
A3.01  30B.01  Tao BuyerPRListPage.tsx — layout co AppBreadcrumb, container
A3.02  30B.02  Stats cards: Tong, Cho duyet, Da duyet, Tu choi, Da tao don
A3.03  30B.03  DataTable: ma PR, nguoi YC, bo phan, so SP, tong tien DK, trang thai, ngay
A3.04  30B.04  FilterBar: trang thai, bo phan, do uu tien, khoang ngay, search
A3.05  30B.05  FormDialog tao PR: bo phan, uu tien, ly do, danh sach SP (nhieu dong)
A3.06  30B.06  Moi dong SP trong form: ten/ma SP (autocomplete), SL, gia DK, ghi chu KT
A3.07  30B.07  Nut "Luu nhap" — luu PR voi status 'Ban nhap'
A3.08  30B.08  Gui duyet: chon nguoi duyet (combobox), chuyen status 'Cho duyet'
A3.09  30B.09  Dialog chi tiet PR: timeline + thong tin + ghi chu
A3.10  30B.10  Sau duyet: nut "Tao don hang" / "Tao RFQ" tu PR da duyet
```

### A4. Nhom 30C — Buyer duyet PR (4 buoc)
```
A4.01  30C.01  Tab "Cho toi duyet": chi hien PR ma user la approver
A4.02  30C.02  Hanh dong: "Duyet" (ghi chu) va "Tu choi" (ly do bat buoc)
A4.03  30C.03  Notification cho requester khi duyet/tu choi
A4.04  30C.04  Auto-approve: PR < X trieu tu dong duyet (cau hinh threshold)
```

### A5. Nhom 30D — Tich hop PR (3 buoc - ket thuc Dot 1)
```
A5.01  30D.01  Route /purchase-requisitions trong routes.ts + lazy import
A5.02  30D.02  Menu "Yeu cau mua" voi icon ClipboardList trong BuyerLayout sidebar
A5.03  30D.03  BuyerDashboard widget: "{N} PR cho duyet" card
```

---

## =====================================================
## A-DOT 2: NHOM 31 — BIEN BAN NHAN HANG & QC (18 buoc)
## =====================================================

### A6. Nhom 31A — Types & Data GRN (5 buoc)
```
A6.01  31A.01  Them GRNStatus type vao types/index.ts
A6.02  31A.02  Them GRNItem interface vao types/index.ts
A6.03  31A.03  Them GoodsReceivedNote interface vao types/index.ts
A6.04  31A.04  Them mockGRNs (6 ban ghi) voi du lieu mau day du
A6.05  31A.05  Tao grnApi: getByBuyer, getBySeller, create, update, confirm, flag
```

### A7. Nhom 31B — Buyer xac nhan nhan hang (7 buoc)
```
A7.01  31B.01  Dialog "Xac nhan nhan hang" tren OrderDetailPage: chi khi don 'Da giao'
A7.02  31B.02  Form moi SP: SL nhan, SL chap nhan, SL loi, ly do loi (select)
A7.03  31B.03  Tong the: diem chat luong 1-5 (star rating), ghi chu, them anh URL
A7.04  31B.04  Tao BuyerGRNListPage.tsx — danh sach bien ban nhan hang
A7.05  31B.05  DataTable: ma GRN, don hang, NCC, ngay nhan, diem CL, trang thai + filter/sort/pagination
A7.06  31B.06  Chi tiet GRN: dialog bang chi tiet SP, anh, ghi chu tu GRNItem
A7.07  31B.07  Hanh dong: "Xac nhan" (dong GRN ok), "Bao cao van de" (tao return request lien ket)
```

### A8. Nhom 31C — Seller xem GRN (3 buoc)
```
A8.01  31C.01  Tab "Nhan hang" tren SellerOrderDetail: hien thi GRN lien quan den don
A8.02  31C.02  Thong ke: ty le nhan du / thieu / loi (BarChart trong Seller Reports)
A8.03  31C.03  Canh bao: GRN co van de — banner do tren SellerDashboard widget
```

### A9. Nhom 31D — Tich hop GRN (3 buoc)
```
A9.01  31D.01  Route /grn trong routes.ts + menu "Nhan hang" voi icon ClipboardCheck
A9.02  31D.02  OrderDetailPage: hien thi trang thai nhan hang (neu co GRN lien ket)
A9.03  31D.03  Lien ket: GRN -> Order -> Shipment -> ReturnRequest (breadcrumb + link)
```

---

## =====================================================
## A-DOT 3: NHOM 32 — GHI NO / GHI CO & DOI SOAT (16 buoc)
## =====================================================

### A10. Nhom 32A — Types & Data (4 buoc)
```
A10.01  32A.01  Them NoteType = 'Ghi no' | 'Ghi co' vao types/index.ts
A10.02  32A.02  Them NoteReason = 'Tra hang' | 'Giam gia' | 'Phi phat sinh' | 'Dieu chinh gia' | 'Chenh lech' | 'Khac'
A10.03  32A.03  Them DebitCreditNote interface vao types/index.ts
A10.04  32A.04  Them mockDebitCreditNotes (8 ban ghi mau)
```

### A11. Nhom 32B — API Service (3 buoc)
```
A11.01  32B.01  debitCreditApi.getBySeller(supplierId, pagination, filters)
A11.02  32B.02  debitCreditApi.getByBuyer(buyerId, pagination, filters)
A11.03  32B.03  debitCreditApi.create, updateStatus, getStats
```

### A12. Nhom 32C — Seller quan ly phieu (5 buoc)
```
A12.01  32C.01  Tao SellerDebitCreditPage.tsx — danh sach phieu ghi no/co
A12.02  32C.02  Stats cards: Tong phieu, Ghi no, Ghi co, So tien ghi no rong
A12.03  32C.03  DataTable: ma phieu, loai, hoa don, buyer, so tien, trang thai, ngay
A12.04  32C.04  Tao phieu: FormDialog — loai, hoa don lien ket (combobox), ly do, chi tiet, so tien
A12.05  32C.05  Doi soat: nut "Doi soat" — xac nhan 2 ben dong y (status change dialog)
```

### A13. Nhom 32D — Buyer xem phieu (2 buoc)
```
A13.01  32D.01  Section "Ghi no/co" trong BuyerInvoiceListPage (tab hoac section cuoi)
A13.02  32D.02  Chi tiet: dialog thong tin phieu, hoa don goc, chenh lech
```

### A14. Nhom 32E — Tich hop (2 buoc)
```
A14.01  32E.01  Route /seller/debit-credit + menu "Ghi no/co" voi icon ReceiptText
A14.02  32E.02  InvoiceDetail: hien thi phieu lien quan (link tu Invoice -> DebitCreditNote)
```

---

## =====================================================
## A-DOT 4: RO SOAT & LIEN KET GIAI DOAN A (2 buoc kiem tra)
## =====================================================

```
A15.01  Kiem tra tat ca route moi da dang ky dung trong routes.ts
A15.02  Kiem tra tat ca menu sidebar da cap nhat (BuyerLayout, SellerLayout)
```

---

## =====================================================
## =====================================================
##
## GIAI DOAN B — TINH NANG ENTERPRISE MOI (NHOM 33-38)
## 126 buoc | Dot 5-12
##
## =====================================================
## =====================================================

---

## =====================================================
## B-DOT 5: NHOM 33A-33B — BUDGET TYPES, DATA, API (9 buoc)
## =====================================================

### B1. Nhom 33A — Types ngan sach (5 buoc)
```
B1.01  33A.01  Them BudgetPeriod type = 'Thang' | 'Quy' | 'Nam'
B1.02  33A.02  Them BudgetStatus type = 'Ban nhap' | 'Da duyet' | 'Dang thuc hien' | 'Da dong' | 'Vuot ngan sach'
B1.03  33A.03  Them BudgetPlan interface { id, companyId, name, period, startDate, endDate, totalBudget, allocations, status, approvedBy?, createdBy, createdAt }
B1.04  33A.04  Them BudgetAllocation interface { id, budgetId, department, categoryId?, categoryName?, allocatedAmount, usedAmount, remainingAmount, warningThreshold }
B1.05  33A.05  Them BudgetTransaction interface { id, budgetId, allocationId, orderId?, orderNumber?, amount, type, note, createdBy, createdAt }
```

### B2. Nhom 33B — Mock Data & API (4 buoc)
```
B2.01  33B.01  mockBudgetPlans (4 ban ghi: QI 2025, QII 2025, QIII 2025, Nam 2025)
B2.02  33B.02  mockBudgetAllocations (12 dong phan bo theo bo phan + danh muc)
B2.03  33B.03  mockBudgetTransactions (20 giao dich chi tieu / hoan tra)
B2.04  33B.04  budgetApi: getByCompany, getById, create, update, approve, getAllocations, getTransactions, checkBudget
```

---

## =====================================================
## B-DOT 6: NHOM 33C-33D — BUYER BUDGET PAGE & TICH HOP (13 buoc)
## =====================================================

### B3. Nhom 33C — Buyer quan ly ngan sach (8 buoc)
```
B3.01  33C.01  Tao BuyerBudgetPage.tsx — AppBreadcrumb, container mx-auto
B3.02  33C.02  Stats cards: Tong NS nam, Da chi, Con lai, % su dung (progress bar voi mau)
B3.03  33C.03  DataTable: ten NS, ky, tong NS, da chi, con lai, trang thai, nguoi tao + filter/sort/pagination
B3.04  33C.04  FormDialog tao ke hoach NS: ten, ky (thang/quy/nam), tong NS, phan bo theo bo phan
B3.05  33C.05  Phan bo allocation: them dong — bo phan (select), danh muc (CategoryCombobox), so tien, nguong canh bao %
B3.06  33C.06  Bieu do TreeMap: phan bo NS theo bo phan / danh muc (recharts Treemap)
B3.07  33C.07  Bieu do BarChart: thuc te vs ke hoach theo thang
B3.08  33C.08  Dialog chi tiet: timeline giao dich, canh bao vuot NS (banner do), progress tung allocation
```

### B4. Nhom 33D — Tich hop ngan sach (5 buoc)
```
B4.01  33D.01  Route /budget + menu "Ngan sach" voi icon Wallet trong BuyerLayout
B4.02  33D.02  Checkout: kiem tra NS truoc khi dat hang — hien thi "NS kha dung" o buoc thanh toan
B4.03  33D.03  PR (Nhom 30): lien ket PR voi budget allocation (select allocation trong form PR)
B4.04  33D.04  BuyerDashboard widget: "Ngan sach" — progress bar tung bo phan
B4.05  33D.05  Canh bao: toast/notification khi bo phan dat > 80% NS
```

---

## =====================================================
## B-DOT 7: NHOM 34 — DAU GIA NGUOC (20 buoc)
## =====================================================

### B5. Nhom 34A — Types & Data (5 buoc)
```
B5.01  34A.01  Them AuctionStatus type
B5.02  34A.02  Them AuctionItem interface { productName, quantity, unit, specification, maxBudget }
B5.03  34A.03  Them ReverseAuction interface day du
B5.04  34A.04  Them AuctionBid interface day du
B5.05  34A.05  mockAuctions (4 phien), mockAuctionBids (10 bao gia)
```

### B6. Nhom 34B — API Service (3 buoc)
```
B6.01  34B.01  auctionApi: getByBuyer, getBySeller, getById, create, update, cancel
B6.02  34B.02  auctionApi: getBids, submitBid, selectWinner
B6.03  34B.03  auctionApi: getStats(userId, role)
```

### B7. Nhom 34C — Buyer tao & quan ly dau gia (7 buoc)
```
B7.01  34C.01  Tao BuyerAuctionListPage.tsx — danh sach phien dau gia nguoc
B7.02  34C.02  Stats: Tong phien, Dang mo, Da dong, Da chon NCC
B7.03  34C.03  DataTable: ma phien, tieu de, so SP, TG bat dau, TG ket thuc, so bid, trang thai
B7.04  34C.04  Tao phien: FormDialog — tieu de, mo ta, danh sach SP (nhieu dong), TG bat dau/ket thuc, gia tran, moi NCC
B7.05  34C.05  Xem phien chi tiet: danh sach bid (ranking theo gia), thong tin NCC, so sanh cac bid
B7.06  34C.06  Chon NCC thang: nut "Chon" + dialog tao don hang / hop dong tu bid thang
B7.07  34C.07  Countdown timer: dem nguoc den khi ket thuc phien (useEffect interval)
```

### B8. Nhom 34D — Seller tham gia dau gia (3 buoc)
```
B8.01  34D.01  Tao SellerAuctionPage.tsx — danh sach phien dau gia duoc moi / cong khai
B8.02  34D.02  Xem phien duoc moi: thong tin yeu cau, gia tran, TG con lai, bid cua minh (neu co)
B8.03  34D.03  Submit bid: form nhap gia cho tung SP, dieu khoan giao hang/thanh toan, ghi chu
```

### B9. Nhom 34E — Tich hop (2 buoc)
```
B9.01  34E.01  Route /auctions (Buyer Guard), /seller/auctions (Seller)
B9.02  34E.02  Menu "Dau gia" voi icon Gavel tren ca BuyerLayout va SellerLayout
```

---

## =====================================================
## B-DOT 8-9: NHOM 35 — THOA THUAN GIA & HD KHUNG (24 buoc)
## =====================================================

### B10. Nhom 35A — Types & Data (5 buoc)
```
B10.01  35A.01  Them AgreementType type
B10.02  35A.02  Them AgreementStatus type
B10.03  35A.03  Them PriceAgreement interface day du
B10.04  35A.04  Them PriceAgreementItem interface day du
B10.05  35A.05  Them AgreementOrder interface { id, agreementId, orderId, orderNumber, amount, date }
```

### B11. Nhom 35B — Mock Data & API (4 buoc)
```
B11.01  35B.01  mockPriceAgreements (5 ban ghi: 2 TT gia, 2 HD khung, 1 don hang mo)
B11.02  35B.02  mockPriceAgreementItems (20 dong SP gia thoa thuan)
B11.03  35B.03  mockAgreementOrders (10 don hang lien ket)
B11.04  35B.04  priceAgreementApi: getByBuyer, getBySeller, getById, create, update, approve, cancel, getOrders, getItemPrices
```

### B12. Nhom 35C — Seller quan ly thoa thuan (6 buoc)
```
B12.01  35C.01  Tao SellerPriceAgreementPage.tsx — danh sach thoa thuan gia
B12.02  35C.02  Stats: Tong, Hieu luc, Sap het han, Da het han, Gia tri TB
B12.03  35C.03  DataTable: ma TT, loai, buyer, so SP, gia tri DK, hieu luc, trang thai
B12.04  35C.04  FormDialog tao thoa thuan: loai, buyer (combobox), thoi han, danh sach SP + gia TT
B12.05  35C.05  Moi dong SP: chon SP (autocomplete), gia goc, gia TT, giam %, SL min/max, thoi han
B12.06  35C.06  Dialog chi tiet: thong tin + don hang da dat theo TT + progress gia tri
```

### B13. Nhom 35D — Buyer xem & dat hang theo TT (6 buoc)
```
B13.01  35D.01  Tao BuyerPriceAgreementPage.tsx — danh sach TT da co voi Buyer
B13.02  35D.02  DataTable: ma TT, NCC, so SP, gia tri, hieu luc, trang thai + filter/sort
B13.03  35D.03  Chi tiet: danh sach SP voi gia TT vs gia goc, nut "Dat hang nhanh"
B13.04  35D.04  Dat hang tu TT: pre-fill gio hang voi SP va gia TT (navigate to Cart voi params)
B13.05  35D.05  Canh bao: TT sap het han < 30 ngay (banner vang tren detail)
B13.06  35D.06  Lich su don hang: tab don da dat theo TT nay (DataTable nhung)
```

### B14. Nhom 35E — Tich hop (3 buoc)
```
B14.01  35E.01  Route /price-agreements (Buyer), /seller/price-agreements (Seller)
B14.02  35E.02  Menu "Thoa thuan gia" voi icon Handshake tren ca 2 layout
B14.03  35E.03  Checkout: tu dong ap dung gia TT neu co (hien thi "Gia thoa thuan" badge)
```

---

## =====================================================
## B-DOT 10: NHOM 36 — QUAN LY SLA (18 buoc)
## =====================================================

### B15. Nhom 36A — Types & Data (4 buoc)
```
B15.01  36A.01  Them SLAMetric type (6 loai chi tieu)
B15.02  36A.02  Them SLADefinition interface
B15.03  36A.03  Them SLAMetricDef interface { metric, target, unit, weight }
B15.04  36A.04  Them SLAReport interface { id, slaId, period, metrics[], overallScore, note, createdAt }
```

### B16. Nhom 36B — Mock Data & API (3 buoc)
```
B16.01  36B.01  mockSLADefinitions (5), mockSLAReports (10 bao cao theo thang)
B16.02  36B.02  slaApi: getBySeller, getByBuyer, getById, create, update, getReports
B16.03  36B.03  slaApi.calculateScore(slaId, period) -> SLAReport (tinh diem gia lap)
```

### B17. Nhom 36C — Seller quan ly SLA (6 buoc)
```
B17.01  36C.01  Tao SellerSLAPage.tsx — danh sach cam ket dich vu
B17.02  36C.02  DataTable: ten SLA, buyer (neu co), so chi tieu, diem TB, trang thai + filter
B17.03  36C.03  FormDialog tao SLA: ten, buyer (combobox optional), metrics (nhieu dong), phat/thuong
B17.04  36C.04  Moi metric dong: chon loai (SLAMetric select), muc tieu, don vi, trong so %
B17.05  36C.05  Tab bao cao: LineChart diem SLA theo thang, chi tiet tung chi tieu (BarChart horizontal)
B17.06  36C.06  Canh bao: chi tieu dang vi pham — highlight do, badge "Vi pham"
```

### B18. Nhom 36D — Buyer xem SLA NCC (3 buoc)
```
B18.01  36D.01  Tab "SLA" tren SupplierDetailPage: xem cam ket DV cua NCC (them tab moi)
B18.02  36D.02  Bieu do: RadarChart diem tung chi tieu, BarChart xu huong theo thang
B18.03  36D.03  Tich hop voi Nhom 29 Scorecard: hien thi SLA score tren BuyerSupplierComparePage
```

### B19. Nhom 36E — Tich hop (2 buoc)
```
B19.01  36E.01  Route /seller/sla + menu "Cam ket DV" voi icon ShieldCheck
B19.02  36E.02  SellerDashboard widget: diem SLA hien tai + canh bao vi pham (card)
```

---

## =====================================================
## B-DOT 11: NHOM 37 — TRUNG TAM TAI LIEU (16 buoc)
## =====================================================

### B20. Nhom 37A — Types & Data (4 buoc)
```
B20.01  37A.01  Them DocCategory type (7 loai: Hop dong, Hoa don, Chung chi, Bao gia, Phieu xuat, GRN, Khac)
B20.02  37A.02  Them Document interface day du
B20.03  37A.03  mockDocuments (15 tai lieu mau voi du loai, tags, version)
B20.04  37A.04  documentApi: getByUser, getByEntity, upload, update, delete, search, getStats
```

### B21. Nhom 37B — Document Center Page (7 buoc)
```
B21.01  37B.01  Tao DocumentCenterPage.tsx — layout sidebar danh muc + noi dung chinh
B21.02  37B.02  Sidebar: danh sach DocCategory dang tree/list, click de filter
B21.03  37B.03  ViewToggle: Grid (card voi icon loai file, ten, ngay, size) / List (DataTable)
B21.04  37B.04  FilterBar: danh muc, khoang ngay, loai file, tags (multi-select), search
B21.05  37B.05  Upload tai lieu: FormDialog voi drag-drop zone (gia lap) + ten, danh muc, tags, mo ta
B21.06  37B.06  Dialog chi tiet: thong tin, preview icon/thumbnail, lich su version
B21.07  37B.07  Hanh dong: "Tai xuong" (gia lap), "Chia se" (copy link), "Xoa", "Luu tru"
```

### B22. Nhom 37C — Tich hop (5 buoc)
```
B22.01  37C.01  Route /documents (Buyer Guard), /seller/documents (Seller)
B22.02  37C.02  Menu "Tai lieu" voi icon FolderOpen tren ca 2 layout
B22.03  37C.03  ContractDetail (Buyer + Seller): link "Xem tai lieu lien quan"
B22.04  37C.04  InvoiceDetail (Buyer + Seller): link tai lieu dinh kem
B22.05  37C.05  OrderDetail: tab "Tai lieu" — tat ca tai lieu lien quan don hang (HD, HĐ, phieu xuat, GRN)
```

---

## =====================================================
## B-DOT 12: NHOM 38 — MULTI-WAREHOUSE (20 buoc)
## =====================================================

### B23. Nhom 38A — Types & Data (5 buoc)
```
B23.01  38A.01  Mo rong Warehouse interface: address, city, warehouseType, managerId, managerName, capacity, currentUsage, isActive
B23.02  38A.02  Them WarehouseTransfer interface day du
B23.03  38A.03  Them TransferItem interface { productId, productName, quantity, note }
B23.04  38A.04  mockWarehouseTransfers (5 lenh chuyen kho)
B23.05  38A.05  warehouseTransferApi: getAll, getById, create, approve, ship, receive, cancel
```

### B24. Nhom 38B — Seller quan ly nhieu kho (8 buoc)
```
B24.01  38B.01  Nang cap SellerWarehouse: tab rieng cho tung kho (tabs dong dua tren so kho)
B24.02  38B.02  Tong quan tat ca kho: grid card moi kho (ten, dia chi, SL SP, % suc chua, badge trang thai)
B24.03  38B.03  Bieu do BarChart grouped: so sanh ton kho giua cac kho
B24.04  38B.04  PieChart: phan bo gia tri ton kho theo tung kho
B24.05  38B.05  FormDialog "Chuyen kho": chon kho nguon, kho dich, SP (multi-select), so luong
B24.06  38B.06  DataTable lenh chuyen kho: ma, kho nguon, kho dich, so SP, trang thai, ngay + filter
B24.07  38B.07  Dialog chi tiet chuyen kho: timeline (Tao -> Duyet -> Dang chuyen -> Da nhan)
B24.08  38B.08  Canh bao: kho qua tai > 90% (badge do), kho trong < 10% (badge vang)
```

### B25. Nhom 38C — Dinh tuyen don hang (4 buoc)
```
B25.01  38C.01  Tao WarehouseRoutingEngine util: chon kho toi uu (logic: vi tri buyer, ton kho, khoang cach)
B25.02  38C.02  SellerOrderDetail: khi xu ly don, hien thi "Kho goi y" + ly do (tooltip)
B25.03  38C.03  Cho phep NCC override: select kho khac thay vi kho goi y
B25.04  38C.04  Thong ke: ty le giao tu tung kho, TB khoang cach, TB thoi gian giao (trong SellerReports)
```

### B26. Nhom 38D — Tich hop (3 buoc)
```
B26.01  38D.01  SellerDashboard widget: "Tong quan kho" — so kho, tong ton, canh bao
B26.02  38D.02  SellerOrderDetail: hien thi kho xuat hang + goi y routing
B26.03  38D.03  SellerReports: tab "Kho hang" — bao cao ton kho tat ca kho
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
C1.01  39A.01  Them SpendAnalysis interface { period, totalSpend, byCategory[], bySupplier[], byDepartment[], topProducts[] }
C1.02  39A.02  Them SavingsReport interface { period, targetSavings, actualSavings, savingsByMethod[] }
C1.03  39A.03  Them ProcurementKPI interface { avgOrderCycleTime, rfqToOrderConversionRate, supplierOnTimeRate, invoiceAccuracyRate, avgPaymentCycleTime, contractComplianceRate }
C1.04  39A.04  analyticsApi: getSpendAnalysis, getSavingsReport, getProcurementKPIs, getTrendData
```

### C2. Nhom 39B — Buyer BI Dashboard (12 buoc)
```
C2.01  39B.01  Tao BuyerAnalyticsPage.tsx — trang phan tich mua hang nang cao
C2.02  39B.02  Period picker component: Thang nay / Quy nay / Nam nay / Tuy chon (date range)
C2.03  39B.03  KPI cards (4 card): TG xu ly don TB, ty le RFQ->DH, % NCC giao dung han, do chinh xac HD
C2.04  39B.04  Tab "Chi tieu" (Spend Analysis):
C2.05  39B.05    — Treemap recharts: phan bo chi tieu theo danh muc (click drill-down voi state)
C2.06  39B.06    — PieChart: Top 10 NCC theo chi tieu
C2.07  39B.07    — BarChart: chi tieu theo bo phan
C2.08  39B.08    — LineChart: xu huong chi tieu 12 thang
C2.09  39B.09  Tab "Tiet kiem" (Savings):
C2.10  39B.10    — BarChart: tiet kiem thuc te vs muc tieu (grouped bar)
C2.11  39B.11    — PieChart: tiet kiem theo phuong phap (dam phan, dau gia, KM, HD khung)
C2.12  39B.12    — LineChart: xu huong tiet kiem theo thang
```

### C3. Nhom 39C — Bao cao chi tiet (6 buoc)
```
C3.01  39C.01  Tab "San pham": DataTable Top 20 SP mua nhieu nhat (ten, SL, so tien, NCC, xu huong sparkline)
C3.02  39C.02  Tab "NCC": DataTable hieu suat NCC (ten, so don, gia tri, % dung han, diem, ranking star)
C3.03  39C.03  Tab "Xu huong": RadarChart so sanh ky nay vs ky truoc (overlay 2 datasets)
C3.04  39C.04  Export bao cao: nut "Xuat CSV" voi tieu de + period + du lieu tab hien tai
C3.05  39C.05  So sanh ky: chon 2 ky de so sanh side-by-side (2 cot stats cards)
C3.06  39C.06  Drill-down: click vao category tren TreeMap -> filter DataTable SP trong category do
```

### C4. Nhom 39D — Tich hop (4 buoc)
```
C4.01  39D.01  Route /analytics + menu "Phan tich" voi icon BarChart3 trong BuyerLayout
C4.02  39D.02  BuyerDashboard widget: "KPI mua hang" — 4 chi so chinh (compact card)
C4.03  39D.03  Export bao cao dinh ky: nut "Gui bao cao hang thang" (toast gia lap gui email)
C4.04  39D.04  Quyen: chi "Quan ly" va "Giam doc" moi xem (kiem tra BuyerTeam permissions)
```

---

## =====================================================
## C-DOT 15: NHOM 40 — BAO HANH & DICH VU HAU MAI (20 buoc)
## =====================================================

### C5. Nhom 40A — Types & Data (5 buoc)
```
C5.01  40A.01  Them WarrantyStatus type (4 trang thai)
C5.02  40A.02  Them Warranty interface day du
C5.03  40A.03  Them ClaimStatus type (7 trang thai)
C5.04  40A.04  Them WarrantyClaim interface day du
C5.05  40A.05  mockWarranties (8), mockWarrantyClaims (5)
```

### C6. Nhom 40B — API Service (3 buoc)
```
C6.01  40B.01  warrantyApi: getByBuyer, getBySeller, getByProduct, create
C6.02  40B.02  warrantyClaimApi: getByBuyer, getBySeller, create, updateStatus, getStats
C6.03  40B.03  warrantyApi.checkWarranty(productId, buyerId) -> { isValid, daysRemaining, warranty? }
```

### C7. Nhom 40C — Buyer quan ly bao hanh (6 buoc)
```
C7.01  40C.01  Tao BuyerWarrantyPage.tsx — danh sach bao hanh san pham
C7.02  40C.02  Stats: Tong SP bao hanh, Con han, Sap het (< 30 ngay), Da het
C7.03  40C.03  DataTable: ma BH, ten SP, NCC, ngay bat dau, ngay het, trang thai, hanh dong
C7.04  40C.04  Dialog chi tiet BH: dieu khoan, don hang goc (link), lich su claim (timeline)
C7.05  40C.05  FormDialog tao yeu cau BH (claim): mo ta loi, loai (sua/thay/hoan), them anh URL
C7.06  40C.06  Theo doi claim: dialog timeline trang thai, phan hoi NCC, resolution
```

### C8. Nhom 40D — Seller xu ly bao hanh (4 buoc)
```
C8.01  40D.01  Tao SellerWarrantyPage.tsx — danh sach claim bao hanh tu buyer
C8.02  40D.02  DataTable: ma claim, SP, buyer, loai (sua/thay/hoan), trang thai, ngay gui
C8.03  40D.03  Xu ly: "Chap nhan" / "Tu choi" + ghi chu + phuong an + thoi gian xu ly
C8.04  40D.04  Stats cards: tong claim, ty le chap nhan, ty le tu choi, TG xu ly TB
```

### C9. Nhom 40E — Tich hop (2 buoc)
```
C9.01  40E.01  Route /warranty (Buyer Guard), /seller/warranty (Seller) + menu "Bao hanh" icon Shield
C9.02  40E.02  OrderDetail: hien thi thong tin bao hanh SP (badge "Con BH" hoac "Het BH")
```

---

## =====================================================
## C-DOT 16: NHOM 41 — KHACH HANG THAN THIET / LOYALTY (18 buoc)
## =====================================================

### C10. Nhom 41A — Types & Data (4 buoc)
```
C10.01  41A.01  Them LoyaltyTier type = 'Dong' | 'Bac' | 'Vang' | 'Kim cuong'
C10.02  41A.02  Them LoyaltyProgram interface day du
C10.03  41A.03  Them LoyaltyTransaction interface day du
C10.04  41A.04  Them LoyaltyReward interface day du
```

### C11. Nhom 41B — Mock Data & API (3 buoc)
```
C11.01  41B.01  mockLoyaltyProgram (4 buyer voi tier khac nhau: Dong, Bac, Vang, Kim cuong)
C11.02  41B.02  mockLoyaltyTransactions (20), mockLoyaltyRewards (10 phan thuong)
C11.03  41B.03  loyaltyApi: getProgram, getTransactions, getRewards, redeemReward, getStats
```

### C12. Nhom 41C — Buyer chuong trinh KHTT (7 buoc)
```
C12.01  41C.01  Tao BuyerLoyaltyPage.tsx — trang chuong trinh khach hang than thiet
C12.02  41C.02  Header hero: tier hien tai (icon + mau dong/bac/vang/kim cuong), diem hien co, progress bar len tier tiep
C12.03  41C.03  Tab "Tong quan": stats cards (diem tich luy, tier, chi tieu lifetime), bang loi ich theo tier
C12.04  41C.04  Tab "Lich su diem": DataTable giao dich diem (tich/tieu/het han/thuong) + filter/sort
C12.05  41C.05  Tab "Doi thuong": grid card phan thuong kha dung (ten, diem can, mo ta, nut "Doi")
C12.06  41C.06  Doi thuong: dialog xac nhan, tru diem, hien thi ma thuong (toast success)
C12.07  41C.07  Bieu do BarChart: diem tich vs diem tieu theo thang (grouped bar)
```

### C13. Nhom 41D — Tich hop (4 buoc)
```
C13.01  41D.01  Route /loyalty + menu "Than thiet" voi icon Award trong BuyerLayout
C13.02  41D.02  Checkout: hien thi diem se nhan + option "Dung diem de giam gia" (checkbox + so diem)
C13.03  41D.03  BuyerDashboard widget: tier badge + diem hien co + progress bar
C13.04  41D.04  OrderConfirmation: hien thi "+{X} diem" da nhan (banner xanh)
```

---

## =====================================================
## C-DOT 17: NHOM 42 — BAO CAO TUY CHINH / REPORT BUILDER (22 buoc)
## =====================================================

### C14. Nhom 42A — Types & Data (5 buoc)
```
C14.01  42A.01  Them DataSource type (10 nguon du lieu)
C14.02  42A.02  Them ChartType type (7 loai bieu do)
C14.03  42A.03  Them ReportDefinition interface day du
C14.04  42A.04  Them ReportColumn interface { field, label, visible, aggregation?, format? }
C14.05  42A.05  Them ReportFilter interface { field, operator, value }
```

### C15. Nhom 42B — Mock Data & API (3 buoc)
```
C15.01  42B.01  mockReportDefinitions (5 bao cao mau: doanh thu, NCC, ton kho, cong no, don hang)
C15.02  42B.02  reportBuilderApi: getAll, getById, create, update, delete, clone, execute
C15.03  42B.03  reportBuilderApi.getAvailableFields(dataSource) -> { field, label, type }[]
```

### C16. Nhom 42C — Report Builder UI (9 buoc)
```
C16.01  42C.01  Tao ReportBuilderPage.tsx — giao dien tao bao cao tuy chinh
C16.02  42C.02  Sidebar: danh sach bao cao da tao (list item clickable) + template co san
C16.03  42C.03  Buoc 1: Chon nguon du lieu (DataSource select card)
C16.04  42C.04  Buoc 2: Chon cot hien thi (checkbox list cot kha dung, sap xep thu tu)
C16.05  42C.05  Buoc 3: Them dieu kien loc (builder pattern: field select + operator select + value input, nhieu dong)
C16.06  42C.06  Buoc 4: Nhom & Sap xep (groupBy select + sortBy select + direction toggle)
C16.07  42C.07  Buoc 5: Chon kieu bieu do (ChartType toggle icon group) + cau hinh (X axis, Y axis select)
C16.08  42C.08  Preview: hien thi ket qua bao cao realtime (DataTable + bieu do recharts) — execute API
C16.09  42C.09  Luu bao cao: form ten + mo ta, nut "Luu" / "Luu lam template" (toggle)
```

### C17. Nhom 42D — Report Viewer (3 buoc)
```
C17.01  42D.01  Xem bao cao rieng: DataTable + bieu do recharts theo cau hinh da luu
C17.02  42D.02  Export: CSV (exportToCSV), in (window.print layout)
C17.03  42D.03  Chia se: copy link bao cao URL voi params (toast "Da sao chep!")
```

### C18. Nhom 42E — Tich hop (2 buoc)
```
C18.01  42E.01  Route /reports/builder (Buyer Guard + Seller) + menu "Tao bao cao" icon FileBarChart
C18.02  42E.02  Dashboard widget (ca 2): "Bao cao yeu thich" — link nhanh den BC hay dung
```

---

## =====================================================
## C-DOT 18: NHOM 43 — TRUNG TAM TICH HOP / INTEGRATION HUB (20 buoc)
## =====================================================

### C19. Nhom 43A — Types & Data (5 buoc)
```
C19.01  43A.01  Them IntegrationType type (8 loai)
C19.02  43A.02  Them IntegrationStatus type (4 trang thai)
C19.03  43A.03  Them Integration interface day du (incl. iconUrl, configData, lastSyncAt)
C19.04  43A.04  Them WebhookEndpoint interface day du
C19.05  43A.05  Them APIKey interface day du (key masked)
```

### C20. Nhom 43B — Mock Data & API (3 buoc)
```
C20.01  43B.01  mockIntegrations (8: SAP, QuickBooks, Salesforce, Gmail, GHN, VNPay, Slack, Custom API)
C20.02  43B.02  mockWebhooks (4 endpoint), mockAPIKeys (3 key)
C20.03  43B.03  integrationApi: getAll, getById, connect, disconnect, test, getWebhooks, createWebhook, getAPIKeys, createAPIKey, revokeAPIKey
```

### C21. Nhom 43C — Integration Hub Page (8 buoc)
```
C21.01  43C.01  Tao IntegrationHubPage.tsx — trung tam tich hop (dung chung Buyer + Seller)
C21.02  43C.02  Tab "Ket noi": grid card cac dich vu — icon, ten, mo ta, trang thai, nut Ket noi/Ngat
C21.03  43C.03  FilterBar: theo loai (IntegrationType select), trang thai, search
C21.04  43C.04  Dialog cau hinh: FormDialog nhap thong tin ket noi (API key, URL, token) — gia lap luu
C21.05  43C.05  Tab "Webhook": DataTable endpoint (ten, URL, events, trang thai, nut "Test ping"), tao moi FormDialog
C21.06  43C.06  Tab "API Keys": DataTable key (ten, key masked, quyen, han, nut "Thu hoi"), tao moi FormDialog
C21.07  43C.07  Tab "Lich su dong bo": DataTable (thoi gian, dich vu, hanh dong, trang thai, loi?)
C21.08  43C.08  Stats cards: so ket noi active, so webhook, so API call thang nay, loi gan nhat
```

### C22. Nhom 43D — Tich hop (4 buoc)
```
C22.01  43D.01  Route /integrations (Buyer Guard + Seller) + menu "Tich hop" icon Puzzle
C22.02  43D.02  SellerDashboard widget: "Tich hop" — so ket noi, canh bao loi (neu co)
C22.03  43D.03  SystemSettings (Admin): section "Tich hop he thong" — xem trang thai cac ket noi
C22.04  43D.04  Webhook events list: order.created, order.updated, payment.received, shipment.updated, rfq.received
```

---

## =====================================================
## =====================================================
##
## GIAI DOAN D — ADMIN MO RONG TOAN DIEN
## 112 buoc | Dot 19-24
## Them trang Admin quan ly cho tat ca tinh nang moi (Nhom 30-43)
##
## =====================================================
## =====================================================

---

## =====================================================
## D-DOT 19: ADMIN — PR, GRN, DEBIT/CREDIT (18 buoc)
## =====================================================

### D1. Admin PR Management (6 buoc)
```
D1.01  Tao AdminPRPage.tsx — quan ly tat ca Purchase Requisition tren he thong
D1.02  Stats: Tong PR, Cho duyet, Da duyet, Tu choi, Da tao don (toan he thong)
D1.03  DataTable: ma PR, cong ty, nguoi YC, bo phan, tong tien, trang thai, ngay + filter/sort/pagination
D1.04  Chi tiet PR: dialog xem day du (thong tin, timeline, items, GD lien ket)
D1.05  Hanh dong Admin: "Dong PR", "Xoa PR" + ghi chu admin
D1.06  Route /admin/purchase-requisitions + menu "Y/C mua hang" icon ClipboardList
```

### D2. Admin GRN Management (6 buoc)
```
D2.01  Tao AdminGRNPage.tsx — quan ly tat ca Bien ban nhan hang
D2.02  Stats: Tong GRN, Da xac nhan, Co van de, Diem CL trung binh
D2.03  DataTable: ma GRN, buyer, NCC, don hang, diem CL, trang thai + filter/sort
D2.04  Chi tiet: dialog xem day du GRN items, anh, ghi chu
D2.05  Bieu do BarChart: ty le nhan du / thieu / loi toan he thong
D2.06  Route /admin/grn + menu "Nhan hang" icon ClipboardCheck
```

### D3. Admin Debit/Credit (6 buoc)
```
D3.01  Tao AdminDebitCreditPage.tsx — quan ly phieu ghi no/co toan he thong
D3.02  Stats: Tong phieu, Ghi no, Ghi co, So tien rong
D3.03  DataTable: ma phieu, loai, NCC, buyer, so tien, trang thai + filter/sort
D3.04  Chi tiet: dialog xem phieu, hoa don lien ket
D3.05  Hanh dong: "Duyet doi soat", "Tu choi"
D3.06  Route /admin/debit-credit + menu "Ghi no/co" icon ReceiptText
```

---

## =====================================================
## D-DOT 20: ADMIN — BUDGET, AUCTION, PRICE AGREEMENT (18 buoc)
## =====================================================

### D4. Admin Budget Overview (6 buoc)
```
D4.01  Tao AdminBudgetPage.tsx — tong quan ngan sach tat ca cong ty
D4.02  Stats: Tong NS da cap, Da su dung, Con lai, So cong ty vuot NS
D4.03  DataTable: cong ty, ten NS, ky, tong NS, da chi, % su dung, trang thai + filter
D4.04  Chi tiet: dialog xem phan bo, giao dich
D4.05  Bieu do: BarChart top 10 cong ty chi tieu, PieChart phan bo theo nganh
D4.06  Route /admin/budgets + menu "Ngan sach" icon Wallet
```

### D5. Admin Auction Management (6 buoc)
```
D5.01  Tao AdminAuctionPage.tsx — quan ly phien dau gia tren san
D5.02  Stats: Tong phien, Dang mo, Da dong, Gia tri TB, So NCC tham gia TB
D5.03  DataTable: ma phien, buyer, tieu de, so bid, gia tri, trang thai + filter
D5.04  Chi tiet: dialog xem phien, danh sach bid, NCC thang
D5.05  Hanh dong: "Tam ngung phien", "Huy phien" (truong hop vi pham)
D5.06  Route /admin/auctions + menu "Dau gia" icon Gavel
```

### D6. Admin Price Agreement (6 buoc)
```
D6.01  Tao AdminPriceAgreementPage.tsx — quan ly thoa thuan gia
D6.02  Stats: Tong TT, Hieu luc, Sap het, Da het, Gia tri toan san
D6.03  DataTable: ma TT, NCC, buyer, loai, gia tri, hieu luc, trang thai + filter
D6.04  Chi tiet: dialog xem thoa thuan, SP, don hang lien ket
D6.05  Hanh dong: "Tam ngung TT", "Huy TT"
D6.06  Route /admin/price-agreements + menu "Thoa thuan gia" icon Handshake
```

---

## =====================================================
## D-DOT 21: ADMIN — SLA, DOCUMENT CENTER, WARRANTY (18 buoc)
## =====================================================

### D7. Admin SLA Monitoring (6 buoc)
```
D7.01  Tao AdminSLAPage.tsx — giam sat SLA toan he thong
D7.02  Stats: Tong SLA, Dang hieu luc, Vi pham, Diem TB toan san
D7.03  DataTable: NCC, ten SLA, so chi tieu, diem, trang thai vi pham + filter
D7.04  Bieu do: BarChart diem SLA theo NCC (ranking), LineChart xu huong toan san
D7.05  Canh bao: danh sach NCC dang vi pham SLA (banner do)
D7.06  Route /admin/sla + menu "Cam ket DV" icon ShieldCheck
```

### D8. Admin Document Center (6 buoc)
```
D8.01  Tao AdminDocumentPage.tsx — quan ly tai lieu toan he thong
D8.02  Stats: Tong tai lieu, Theo loai (PieChart), Dung luong (gia lap)
D8.03  DataTable: ten, danh muc, nguoi upload, cong ty, ngay, kich thuoc + filter
D8.04  Chi tiet: dialog xem tai lieu
D8.05  Hanh dong: "Xoa", "An", "Khoi phuc" tai lieu vi pham
D8.06  Route /admin/documents + menu "Tai lieu" icon FolderOpen
```

### D9. Admin Warranty Management (6 buoc)
```
D9.01  Tao AdminWarrantyPage.tsx — quan ly bao hanh toan he thong
D9.02  Stats: Tong BH, Claim dang xu ly, Da giai quyet, TG xu ly TB
D9.03  DataTable: ma claim, SP, buyer, NCC, loai, trang thai + filter
D9.04  Chi tiet: dialog xem claim, timeline, lich su
D9.05  Hanh dong: "Can thiep", "Dong claim" (khi NCC khong phan hoi)
D9.06  Route /admin/warranty + menu "Bao hanh" icon Shield
```

---

## =====================================================
## D-DOT 22: ADMIN — LOYALTY, ANALYTICS, REPORT BUILDER (18 buoc)
## =====================================================

### D10. Admin Loyalty Program (6 buoc)
```
D10.01  Tao AdminLoyaltyPage.tsx — quan ly chuong trinh KHTT
D10.02  Stats: Tong TV, Phan bo tier (PieChart: Dong/Bac/Vang/KCuong), Tong diem da phat
D10.03  DataTable: buyer, cong ty, tier, diem, chi tieu, ngay tham gia + filter
D10.04  Cau hinh: dieu kien tier (chi tieu / diem), ty le tich diem, han su dung diem
D10.05  Quan ly phan thuong: DataTable phan thuong + FormDialog CRUD
D10.06  Route /admin/loyalty + menu "Khach hang TT" icon Award
```

### D11. Admin Analytics Dashboard (6 buoc)
```
D11.01  Tao AdminAnalyticsPage.tsx — phan tich toan san
D11.02  KPI cards: GMV, so don, so NCC, so buyer, ty le chuyen doi, gia tri don TB
D11.03  Bieu do: LineChart GMV theo thang, BarChart top 10 NCC, PieChart phan bo theo nganh
D11.04  Tab "Buyer": top buyer, chi tieu, don hang
D11.05  Tab "NCC": top NCC, doanh thu, diem danh gia
D11.06  Route /admin/analytics + menu "Phan tich" icon BarChart3
```

### D12. Admin Report Management (6 buoc)
```
D12.01  Tao AdminReportBuilderPage.tsx — quan ly bao cao tuy chinh toan he thong
D12.02  Stats: Tong bao cao, Template public, Luot su dung, Bao cao tao gan day
D12.03  DataTable: ten BC, nguoi tao, nguon du lieu, loai bieu do, ngay tao + filter
D12.04  Hanh dong: "An BC", "Xoa BC", "Sao chep", "Dua len template"
D12.05  Tao template he thong: FormDialog voi cau hinh co san
D12.06  Route /admin/report-builder + menu "Tao bao cao" icon FileBarChart
```

---

## =====================================================
## D-DOT 23: ADMIN — INTEGRATION HUB & MULTI-WAREHOUSE (18 buoc)
## =====================================================

### D13. Admin Integration Hub (6 buoc)
```
D13.01  Tao AdminIntegrationPage.tsx — quan ly tich hop toan he thong
D13.02  Stats: Tong ket noi, Dang hoat dong, Loi, So webhook, So API key
D13.03  DataTable: ten dich vu, loai, cong ty, trang thai, lan dong bo cuoi + filter
D13.04  Chi tiet: xem cau hinh (an secret), lich su dong bo
D13.05  Hanh dong: "Ngat ket noi" (truong hop vi pham), "Reset secret"
D13.06  Route /admin/integrations + menu "Tich hop" icon Puzzle
```

### D14. Admin Multi-Warehouse (6 buoc)
```
D14.01  Tao AdminWarehousePage.tsx — tong quan kho hang toan he thong
D14.02  Stats: Tong so kho, Tong gia tri ton, So NCC co kho, So lenh chuyen kho
D14.03  DataTable: NCC, ten kho, loai, dia chi, suc chua, % su dung, trang thai + filter
D14.04  Bieu do: Map gia lap (danh sach kho theo thanh pho), PieChart phan bo theo loai kho
D14.05  Chi tiet kho: dialog xem thong tin, ton kho, lich su chuyen kho
D14.06  Route /admin/warehouses + menu "Kho hang" icon Warehouse
```

### D15. Admin Return Enhancement (6 buoc)
```
D15.01  Nang cap AdminReturnPage (neu chua co) hoac tao moi — quan ly tra hang toan he thong
D15.02  Stats: Tong yeu cau, Cho xu ly, Da hoan tien, Tu choi, TB thoi gian xu ly
D15.03  DataTable: ma tra hang, buyer, NCC, don hang, so tien, trang thai + filter
D15.04  Chi tiet: dialog timeline, anh minh chung, ghi chu 2 ben
D15.05  Hanh dong Admin: "Can thiep", "Cuong che hoan tien", "Dong tranh chap"
D15.06  Route /admin/returns + menu "Tra hang" icon RotateCcw
```

---

## =====================================================
## D-DOT 24: ADMIN — ROUTE TONG HOP & MENU (4 buoc)
## =====================================================

### D16. Kiem tra & Cap nhat Menu Admin (4 buoc)
```
D16.01  Cap nhat AdminLayout sidebar: them tat ca menu moi (12 muc moi) theo nhom logic
D16.02  Cap nhat routes.ts: them tat ca lazy import + route cho Admin pages moi
D16.03  AdminDashboard: them widget tong hop cho cac tinh nang moi (PR, GRN, Auction, SLA, Warranty, Loyalty)
D16.04  Kiem tra quyen Admin: dam bao AdminGuard bao ve tat ca route moi
```

---

## =====================================================
## =====================================================
##
## GIAI DOAN E — NANG CAP GIAO DIEN (UI BEAUTIFY)
## 380 buoc | Dot 25-36
## (Chi tiet theo /src/app/PLAN_UI_BEAUTIFY.md)
## Tham chieu day du, tom tat cac nhom chinh:
##
## =====================================================
## =====================================================

---

## =====================================================
## E-DOT 25: U01 — DESIGN TOKEN & THEME SYSTEM (28 buoc)
## =====================================================

### E1. CSS Custom Properties (8 buoc)
```
E1.01  U01A.01  Them --brand-50 den --brand-900 (blue B2B palette) vao theme.css
E1.02  U01A.02  Them --success-50 den --success-700
E1.03  U01A.03  Them --warning-50 den --warning-700
E1.04  U01A.04  Them --danger-50 den --danger-700
E1.05  U01A.05  Them --info-50 den --info-700
E1.06  U01A.06  Them --surface-1, --surface-2, --surface-3
E1.07  U01A.07  Them --shadow-xs den --shadow-xl
E1.08  U01A.08  Them --radius-xs den --radius-2xl
```

### E2. Spacing & Layout Tokens (6 buoc)
```
E2.01  U01B.01  Them --spacing-page (responsive 24px/32px/48px)
E2.02  U01B.02  Them --spacing-section (32px/48px)
E2.03  U01B.03  Them --spacing-card (16px/24px)
E2.04  U01B.04  Them --container-sm den --container-2xl
E2.05  U01B.05  Them --header-height, --sidebar-width, --sidebar-collapsed
E2.06  U01B.06  Them --bottom-nav-height, --breadcrumb-height
```

### E3. Motion Tokens (6 buoc)
```
E3.01-E3.06  U01C.01-06  Them motion tokens: duration, easing, transition presets
```

### E4. Gradient & Effect Tokens (8 buoc)
```
E4.01-E4.08  U01D.01-08  Them gradient-primary, glassmorphism, overlay, text-gradient, etc.
```

---

## =====================================================
## E-DOT 25 (tiep): U02 — TYPOGRAPHY & FONT (16 buoc)
## =====================================================

### E5. Font Import & Config (8 buoc)
```
E5.01-E5.08  U02A.01-08  Import Inter font, config font-display-*, font-body-*, heading styles
```

### E6. Text Utilities (8 buoc)
```
E6.01-E6.08  U02B.01-08  Text gradient, text-muted, text-caption, prose classes, truncate, number mono
```

---

## =====================================================
## E-DOT 26: U03 — COLOR PALETTE & BRAND (18 buoc)
## =====================================================

### E7. Brand Colors (10 buoc)
```
E7.01-E7.10  U03A-B  Primary palette, status colors, semantic colors, surface tints
```

### E8. Dark Mode Prep (8 buoc)
```
E8.01-E8.08  U03C-D  Dark mode variables, toggle component, auto-detect, persist preference
```

---

## =====================================================
## E-DOT 27-28: U04 — SHARED COMPONENT FACELIFT (32 buoc)
## =====================================================

### E9. DataTable Redesign (8 buoc)
```
E9.01-E9.08  U04A.01-08  Sticky header, row hover gradient, zebra stripe, column resize, density toggle, sort indicator animation, empty state illustration, mobile card auto
```

### E10. FilterBar & FormDialog (8 buoc)
```
E10.01-E10.08  U04B.01-08  FilterBar: chips style, animation, active highlight; FormDialog: slide-in, step indicator, validation glow
```

### E11. Button, Badge, Card Facelift (8 buoc)
```
E11.01-E11.08  U04C.01-08  Button gradient, hover scale, loading spinner; Badge: dot indicator, pulse; Card: hover lift, border-left accent
```

### E12. StatusBadge, Breadcrumb, other (8 buoc)
```
E12.01-E12.08  U04D.01-08  StatusBadge: icon + color dot; Breadcrumb: chevron animation; ViewToggle: icon animation; ImportDialog: drag-drop visual
```

---

## =====================================================
## E-DOT 29-30: U05 — LAYOUT & NAVIGATION REDESIGN (28 buoc)
## =====================================================

### E13. Header Redesign (8 buoc)
```
E13.01-E13.08  U05A.01-08  Glassmorphism header, brand logo, notification bell animation, user avatar dropdown, search bar expand, mobile hamburger animation
```

### E14. Sidebar Redesign (10 buoc)
```
E14.01-E14.10  U05B.01-10  Collapsible sidebar, icon-only mode, active item gradient, hover tooltip, section dividers, badge count, collapse animation, resize handle
```

### E15. Page Layout (10 buoc)
```
E15.01-E15.10  U05C.01-10  Content area bg, page title section, sticky action bar, footer, responsive breakpoints, print layout
```

---

## =====================================================
## E-DOT 31: U06 — ANIMATION & MICRO-INTERACTIONS (24 buoc)
## =====================================================

### E16. Page Transitions (6 buoc)
```
E16.01-E16.06  U06A.01-06  Fade/slide enter, stagger children, skeleton-to-content, tab switch, dialog scale-in, toast slide-in
```

### E17. Data Animations (6 buoc)
```
E17.01-E17.06  U06B.01-06  Number count-up, progress bar animate, chart enter, list item stagger, card grid enter, loading shimmer
```

### E18. Interaction Feedback (6 buoc)
```
E18.01-E18.06  U06C.01-06  Button ripple, checkbox bounce, toggle slide, input focus glow, drag preview, scroll reveal
```

### E19. Special Effects (6 buoc)
```
E19.01-E19.06  U06D.01-06  Confetti on order success, tier-up celebration, notification pop, achievement unlock, typing indicator, online pulse
```

---

## =====================================================
## E-DOT 32: U07 — FORM & INPUT BEAUTIFICATION (20 buoc)
## =====================================================

### E20. Input Redesign (10 buoc)
```
E20.01-E20.10  U07A.01-10  Floating label, focus border gradient, error shake, helper text, character count, prefix/suffix icon, search input clear button, date picker style, file input drag area, textarea auto-resize
```

### E21. Select, Checkbox, Radio (10 buoc)
```
E21.01-E21.10  U07B.01-10  Custom select dropdown, combobox tag style, checkbox custom, radio card option, switch toggle, slider, star rating input, color picker, quantity stepper, OTP input
```

---

## =====================================================
## E-DOT 32 (tiep): U08 — DATA VISUALIZATION & CHARTS (16 buoc)
## =====================================================

### E22. Chart Styling (8 buoc)
```
E22.01-E22.08  U08A.01-08  Brand color palette for charts, gradient fills, tooltip custom, legend style, axis style, grid line subtle, responsive chart container, animate on scroll
```

### E23. Chart Components (8 buoc)
```
E23.01-E23.08  U08B.01-08  Mini sparkline component, KPI card with trend arrow, donut center label, funnel chart, gauge chart, heatmap, comparison bar, metric tile
```

---

## =====================================================
## E-DOT 33: U09 — CARD & SURFACE DESIGN (18 buoc)
## =====================================================

### E24. Card Variants (10 buoc)
```
E24.01-E24.10  U09A.01-10  Elevated card, flat card, bordered card, gradient card header, image card overlay, stat card icon bg, pricing card, feature card, testimonial card, notification card
```

### E25. Surface & Section (8 buoc)
```
E25.01-E25.08  U09B.01-08  Section divider, content group, panel, well (inset bg), banner hero, callout box, ribbon badge, floating action button
```

---

## =====================================================
## E-DOT 34: U10 — BUYER TRANG CHU & LANDING (26 buoc)
## =====================================================

### E26. Hero & Featured (10 buoc)
```
E26.01-E26.10  U10A.01-10  Hero banner gradient, search bar prominent, featured categories grid, trending products carousel, top suppliers carousel, promotional banner, trust badges, stats counter animate
```

### E27. Homepage Sections (8 buoc)
```
E27.01-E27.08  U10B.01-08  "Moi nhat" section, "Ban chay" section, "Khuyen mai" section, "Danh muc noi bat" section, CTA sections, newsletter signup, partner logos, footer redesign
```

### E28. Landing Polish (8 buoc)
```
E28.01-E28.08  U10C.01-08  Scroll animations, parallax hero, lazy image fade-in, hover card effects, mobile swipe carousel, category icon animation, responsive hero, SEO meta tags
```

---

## =====================================================
## E-DOT 35: U11 — BUYER PRODUCT & SUPPLIER PAGES (24 buoc)
## =====================================================

### E29. Product Pages (12 buoc)
```
E29.01-E29.12  U11A.01-12  ProductList: filter sidebar, grid card redesign, list view redesign, price highlight, stock badge, quick view hover, compare checkbox style; ProductDetail: image gallery, sticky add-to-cart, tab redesign, related products, breadcrumb style
```

### E30. Supplier Pages (12 buoc)
```
E30.01-E30.12  U11B.01-12  SupplierList: card redesign, verified badge prominent, rating stars, filter sidebar; SupplierDetail: cover image parallax, tab redesign, contact card, certificate showcase, review section, scorecard visualization, compare page radar chart style, CTA buttons
```

---

## =====================================================
## E-DOT 35 (tiep): U12 — ORDER, CART, CHECKOUT (20 buoc)
## =====================================================

### E31. Cart & Checkout (10 buoc)
```
E31.01-E31.10  U12A.01-10  Cart: item card redesign, quantity stepper, price summary sidebar, promo code input, empty cart illustration; Checkout: step wizard, address card, payment method cards, order summary, confirmation confetti
```

### E32. Order Pages (10 buoc)
```
E32.01-E32.10  U12B.01-10  OrderList: status timeline mini, amount highlight; OrderDetail: timeline vertical, item cards, invoice section, shipment tracking visual, action buttons prominent, print layout, mobile order card
```

---

## =====================================================
## E-DOT 36: U13-U19 — DASHBOARD, SELLER, ADMIN, AUTH, DARK MODE (128 buoc)
## =====================================================

### E33. U13 — Buyer Dashboard & Utility (18 buoc)
```
E33.01-E33.18  Dashboard: KPI card gradient, chart styling, widget cards, quick actions, recent activity timeline; Utility: profile page, team page, notification center, RFQ pages, contract pages styling
```

### E34. U14 — Seller Dashboard & Layout (22 buoc)
```
E34.01-E34.22  Seller sidebar, dashboard KPI, chart colors, order processing flow, inventory visual, revenue graph, notification panel
```

### E35. U15 — Seller Pages (20 buoc)
```
E35.01-E35.20  Product form, order list/detail, report tabs, warehouse visual, shipment cards, payment list, staff list, promotion cards
```

### E36. U16 — Admin Dashboard & Layout (18 buoc)
```
E36.01-E36.18  Admin sidebar, dashboard overview, system health, user stats, approval queue, activity feed
```

### E37. U17 — Admin Management Pages (16 buoc)
```
E37.01-E37.16  User management, supplier page, category tree, product approval, order overview, report page styling
```

### E38. U18 — Auth Pages & Onboarding (16 buoc)
```
E38.01-E38.16  Login page: split layout, gradient bg, form card; Register: multi-step, role selection, company info; Onboarding: welcome wizard, feature tour, first-time setup
```

### E39. U19 — Dark Mode & Final Polish (20 buoc)
```
E39.01-E39.20  Dark mode toggle, color inversion, chart dark colors, image brightness, border subtle, scrollbar dark, print override, final contrast check, hover state audit, focus state audit, font size audit, spacing audit, icon consistency, loading state consistency, error state consistency, empty state consistency, toast position, modal backdrop, z-index audit, final responsive check
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
F1.01  Kiem tra link: Order -> Shipment -> Payment -> Invoice -> GRN -> Return (toan bo chain)
F1.02  Kiem tra link: RFQ -> Bid -> Contract -> PriceAgreement -> Order (procurement chain)
F1.03  Kiem tra link: PR -> Approval -> Order -> GRN -> Payment (internal procurement chain)
F1.04  Kiem tra link: Auction -> Bid -> Winner -> Contract / Order
F1.05  Kiem tra link: Budget -> PR -> Order -> Payment -> Transaction
F1.06  Kiem tra link: Warranty -> Claim -> Resolution -> DebitCredit
F1.07  Kiem tra link: Loyalty -> Order -> Points -> Redemption
F1.08  Kiem tra link: SLA -> Report -> Scorecard -> Compare
F1.09  Kiem tra link: Document -> Order / Contract / Invoice / GRN (toan bo entity)
F1.10  Kiem tra: Notification tu dong tao cho tat ca su kien quan trong
```

### F2. Consistency Check (10 buoc)
```
F2.01  Kiem tra: tat ca trang deu co AppBreadcrumb
F2.02  Kiem tra: tat ca DataTable deu co pagination, sort, filter, getId, totalItems
F2.03  Kiem tra: tat ca form deu co validation + error message tieng Viet
F2.04  Kiem tra: tat ca hanh dong CRUD deu co toast (sonner)
F2.05  Kiem tra: tat ca trang deu responsive (mobile card view)
F2.06  Kiem tra: tat ca route deu co lazy import + Suspense fallback
F2.07  Kiem tra: tat ca menu sidebar deu cap nhat (Buyer, Seller, Admin)
F2.08  Kiem tra: tat ca status deu dung StatusBadge component
F2.09  Kiem tra: tat ca file <= 2000 dong (tach component neu can)
F2.10  Kiem tra: khong co import thua, khong co unused variable (SonarQube)
```

---

## =====================================================
## F-DOT 38: BUYER FLOW TESTING (20 buoc)
## =====================================================

### F3. Buyer User Journeys (20 buoc)
```
F3.01  Flow: Dang nhap -> Dashboard -> Xem don hang gan day
F3.02  Flow: Tim SP -> Xem chi tiet -> Them gio hang -> Thanh toan -> Xac nhan
F3.03  Flow: Tao RFQ -> NCC bao gia -> So sanh -> Chon -> Tao HD -> Dat hang
F3.04  Flow: Tao PR -> Gui duyet -> Duoc duyet -> Tao don tu PR
F3.05  Flow: Nhan hang -> Tao GRN -> Bao loi -> Tao yeu cau tra hang
F3.06  Flow: Xem NCC -> Scorecard -> So sanh NCC -> Chon NCC tot nhat
F3.07  Flow: Tao phien dau gia -> NCC bo gia -> Chon NCC thang
F3.08  Flow: Xem thoa thuan gia -> Dat hang theo gia TT
F3.09  Flow: Xem ngan sach -> Kiem tra truoc khi dat hang
F3.10  Flow: Xem bao hanh -> Gui claim -> Theo doi
F3.11  Flow: Xem diem than thiet -> Doi thuong -> Dung diem khi checkout
F3.12  Flow: Tao bao cao tuy chinh -> Xem ket qua -> Export CSV
F3.13  Flow: Xem phan tich mua hang -> Drill-down danh muc -> So sanh ky
F3.14  Flow: Quan ly nhom -> Moi thanh vien -> Phan quyen
F3.15  Flow: Xem thong bao -> Click vao thong bao -> Di den trang lien quan
F3.16  Flow: Xem tai lieu -> Upload -> Lien ket voi don hang
F3.17  Flow: Xem han muc tin dung -> Dat hang tra cham
F3.18  Flow: Danh gia SP sau khi nhan hang -> NCC tra loi
F3.19  Flow: Xem hoa don -> Xem phieu ghi no/co lien quan
F3.20  Flow: Cau hinh tich hop -> Tao webhook -> Test ping
```

---

## =====================================================
## F-DOT 39: SELLER + ADMIN FLOW TESTING (20 buoc)
## =====================================================

### F4. Seller User Journeys (10 buoc)
```
F4.01  Flow: Dashboard -> Xem don moi -> Xu ly -> Tao van don -> Giao hang
F4.02  Flow: Quan ly kho -> Chuyen kho -> Dinh tuyen don hang
F4.03  Flow: Nhan RFQ -> Bao gia -> Duoc chon -> Tao hop dong
F4.04  Flow: Tham gia dau gia -> Bo gia -> Thang -> Nhan don
F4.05  Flow: Tao thoa thuan gia -> Buyer dat hang theo TT
F4.06  Flow: Cau hinh SLA -> Xem bao cao diem -> Canh bao vi pham
F4.07  Flow: Quan ly bao hanh claim -> Xu ly -> Dong claim
F4.08  Flow: Tao hoa don -> Xu ly thanh toan -> Tao phieu ghi no/co
F4.09  Flow: Xem bao cao doanh thu -> Tao bao cao tuy chinh
F4.10  Flow: Cau hinh tich hop -> API key -> Webhook
```

### F5. Admin User Journeys (10 buoc)
```
F5.01  Flow: Dashboard -> Tong quan he thong -> KPI
F5.02  Flow: Duyet san pham -> Duyet NCC -> Duyet chung chi
F5.03  Flow: Quan ly don hang -> Shipment -> Payment -> Invoice
F5.04  Flow: Quan ly PR -> GRN -> Return -> Debit/Credit
F5.05  Flow: Giam sat dau gia -> Can thiep neu vi pham
F5.06  Flow: Giam sat SLA -> Canh bao NCC vi pham
F5.07  Flow: Quan ly ngan sach -> Xem phan bo -> Canh bao vuot NS
F5.08  Flow: Quan ly bao hanh -> Can thiep khi NCC khong phan hoi
F5.09  Flow: Quan ly loyalty -> Cau hinh tier -> Quan ly phan thuong
F5.10  Flow: Phan tich toan san -> Bao cao -> Export
```

---

## =====================================================
## F-DOT 40: FINAL POLISH & RELEASE (18 buoc)
## =====================================================

### F6. Performance & Bundle (6 buoc)
```
F6.01  Kiem tra tat ca lazy import dang hoat dong (code splitting)
F6.02  Kiem tra debounce cho tat ca search input (300ms)
F6.03  Kiem tra useMemo/useCallback cho cac computation nang
F6.04  Kiem tra image lazy loading cho tat ca ImageWithFallback
F6.05  Kiem tra skeleton loading nhat quan cho tat ca trang
F6.06  Kiem tra offline indicator hoat dong
```

### F7. Accessibility Final (6 buoc)
```
F7.01  Kiem tra ARIA labels cho tat ca interactive elements
F7.02  Kiem tra keyboard navigation: Tab, Enter, Escape, Arrow keys
F7.03  Kiem tra focus management trong Dialog/Modal
F7.04  Kiem tra color contrast WCAG AA (4.5:1)
F7.05  Kiem tra screen reader: aria-live cho dynamic content
F7.06  Kiem tra Skip links hoat dong
```

### F8. Documentation (6 buoc)
```
F8.01  Cap nhat README.md voi huong dan cai dat, chay, deploy
F8.02  Cap nhat trang thai tat ca plan files: danh dau DA XONG
F8.03  Tao CHANGELOG.md: danh sach tinh nang da implement
F8.04  Tao COMPONENT_MAP.md: mapping component -> file -> route
F8.05  Tao API_REFERENCE.md: danh sach tat ca mock API endpoints
F8.06  Tao DEPLOYMENT_GUIDE.md: huong dan deploy production (Supabase migration guide)
```

---

## =====================================================
## TONG KET
## =====================================================

| Giai doan | Noi dung                          | Buoc  | Dot     |
|-----------|-----------------------------------|-------|---------|
| A         | Hoan tat V3 (Nhom 29-32)          | 78    | 1-4     |
| B         | Enterprise moi (Nhom 33-38)       | 126   | 5-12    |
| C         | Enterprise NC (Nhom 39-43)        | 106   | 13-18   |
| D         | Admin mo rong                     | 112   | 19-24   |
| E         | UI Beautify                       | 380   | 25-36   |
| F         | Kiem thu & Hoan thien             | 78    | 37-40   |
| **TONG**  |                                   | **856** | **40 dot** |

### THU TU UU TIEN:
1. **A (bat buoc truoc)** — Hoan tat V3 con lai, tao nen tang cho B/C
2. **B + C (song song voi D)** — Tinh nang enterprise moi, Admin di kem
3. **D (song song voi B/C)** — Admin page cho tung nhom tinh nang ngay khi B/C xong
4. **E (co the bat dau bat ky luc nao)** — UI co the lam song song, bat dau tu U01 (nen tang)
5. **F (cuoi cung)** — Kiem thu toan dien, polish, tai lieu

### NGUYEN TAC KHI TRIEN KHAI:
- Moi DOT tuong duong 1 phien prompt "Tiep tuc"
- Moi buoc: implement + test co ban ngay
- File <= 2000 dong, tach component khi can
- Mock data day du, API service layer
- Tieng Viet co dau toan bo UI
- DataTable: renderActions, pagination, sort, filter, getId, totalItems
- Toast sonner cho moi hanh dong
- AppBreadcrumb cho moi trang
- Responsive mobile-first
- Route: lazy import + Suspense

---

*Ke hoach nay ke thua va thay the tat ca plan truoc do. Cac plan cu (V3, UI_BEAUTIFY, etc.) van giu lam tham chieu chi tiet.*

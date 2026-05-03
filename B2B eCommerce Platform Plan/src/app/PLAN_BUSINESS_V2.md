# KE HOACH HOAN THIEN TINH NANG DOANH NGHIEP V2
## San TMDT B2B Marketplace — 620 buoc, 32 nhom, 20 dot trien khai

> Ngay lap: 14/03/2026
> Phien ban: V2 — ke thua va mo rong tu PLAN_BUSINESS_COMPLETE.md (420 buoc)
> Trang thai: Nhom 01-05 da hoan tat, Nhom 06 dang trien khai
> Du an hien tai: Buyer (23 trang), Seller (22 trang), Admin (19 trang), Shared (15 component), 4 Context
> Muc tieu: Hoan thien TOAN BO tinh nang cap doanh nghiep cho Buyer + Seller + toi uu hoa

---

## PHAN TICH HIEN TRANG (CAP NHAT)

### Da hoan tat (Nhom 01-05):
- **Nhom 01** (22 buoc): Wishlist & San pham yeu thich — WishlistContext, BuyerWishlistPage, Heart toggle tren ProductCard/Detail, badge Header
- **Nhom 02** (20 buoc): Dat hang lap lai & Template — OrderTemplate types/API, BuyerOrderTemplatePage, nut "Luu lam Template" + "Dat lai" tren OrderDetail
- **Nhom 03** (24 buoc): Phe duyet noi bo — ApprovalRequest/Rule types/API, SellerApprovalListPage, SellerApprovalRulesPage, widget SellerDashboard
- **Nhom 04** (26 buoc): Hoa don dien tu — invoiceSellerApi/invoiceBuyerApi, SellerInvoiceListPage, BuyerInvoiceListPage, tab Hoa don trong OrderDetail
- **Nhom 05** (18 buoc): Chung chi DN — certificateSellerApi, section chung chi trong SellerProfile, tab Chung chi trong SupplierDetail, widget SellerDashboard

### Chua hoan tat / Chua bat dau (tu ke hoach cu):
- Nhom 06-22: tu Ma giam gia -> Performance & Accessibility (296 buoc con lai)

### THIEU MOI — Can bo sung (tinh nang doanh nghiep nang cao):
- Buyer Dashboard (trang tong quan rieng cho buyer)
- Danh gia & Review san pham/NCC (flow day du)
- Tra hang & Hoan tien (Return/Refund/Dispute)
- Han muc tin dung & Dieu khoan thanh toan
- Quan ly nhom mua hang (Buyer team — nhieu nguoi dung/cong ty)
- Trung tam thong bao thong minh (Notification Center)
- So sanh NCC nang cao (Supplier scorecard)
- Yeu cau mua hang noi bo (Purchase Requisition — Buyer)
- Bien ban nhan hang & Kiem tra chat luong (GRN/QC)
- Ghi no / Ghi co & Doi soat (Debit/Credit notes)

---

## TONG QUAN 32 NHOM TINH NANG

| #  | Nhom                                     | So buoc | Dot       | Trang thai  |
|----|------------------------------------------|---------|-----------|-------------|
| 01 | Wishlist & San pham yeu thich            | 22      | D1        | DA XONG     |
| 02 | Dat hang lap lai & Template              | 20      | D1-D2     | DA XONG     |
| 03 | Phe duyet noi bo & Workflow              | 24      | D2        | DA XONG     |
| 04 | Hoa don dien tu (Seller + Buyer)         | 26      | D2-D3     | DA XONG     |
| 05 | Chung chi DN — Seller nop + Buyer xem    | 18      | D3        | DA XONG     |
| 06 | Ma giam gia & Khuyen mai (Buyer)         | 16      | D4        | DA XONG     |
| 07 | Nang cap Gio hang & Thanh toan           | 22      | D4        | DA XONG     |
| 08 | Nang cap Seller Dashboard                | 18      | D5        | DA XONG     |
| 09 | Nang cap Seller Reports — tach tab       | 24      | D5-D6     | DA XONG     |
| 10 | Nang cap Seller Profile + Cau hinh thue  | 16      | D6        | DA XONG     |
| 11 | Nang cap Buyer Profile & Dia chi         | 18      | D6-D7     | DA XONG     |
| 12 | Dat hang hang loat & Bulk Order          | 16      | D7        | DA XONG     |
| 13 | Xuat / Nhap du lieu (ImportDialog)       | 22      | D7-D8     | DA XONG     |
| 14 | Nang cap Buyer RFQ flow                  | 14      | D8        | DA XONG     |
| 15 | Nang cap Buyer Contract flow             | 14      | D8-D9     | DA XONG     |
| 16 | Nang cap Seller RFQ & Contract           | 16      | D9        | DA XONG     |
| 17 | Nang cap Seller Warehouse & Inventory    | 18      | D9-D10    | DA XONG     |
| 18 | Nang cap Seller Shipment & Payment       | 16      | D10       | DA XONG     |
| 19 | Nang cap Buyer Shipment & Payment        | 14      | D10-D11   | DA XONG     |
| 20 | Seller Activity Log & Nhat ky            | 12      | D11       | CHUA        |
| 21 | UX nang cao & Command Palette            | 24      | D11-D12   | CHUA        |
| 22 | Performance & Accessibility              | 26      | D12-D13   | CHUA        |
| **23** | **Buyer Dashboard & Tong quan**      | **20**  | **D13-D14** | **MOI**   |
| **24** | **Danh gia & Review SP/NCC**         | **22**  | **D14**     | **MOI**   |
| **25** | **Tra hang & Hoan tien**             | **24**  | **D14-D15** | **MOI**   |
| **26** | **Han muc tin dung & Credit**        | **18**  | **D15**     | **MOI**   |
| **27** | **Quan ly nhom mua hang (Buyer Team)** | **20** | **D15-D16** | **MOI**  |
| **28** | **Trung tam thong bao**              | **18**  | **D16-D17** | **MOI**   |
| **29** | **So sanh NCC & Scorecard**          | **16**  | **D17**     | **MOI**   |
| **30** | **Yeu cau mua hang noi bo (PR)**     | **22**  | **D17-D18** | **MOI**   |
| **31** | **Bien ban nhan hang & QC**          | **18**  | **D18-D19** | **MOI**   |
| **32** | **Ghi no/Ghi co & Doi soat**         | **16**  | **D19-D20** | **MOI**   |

Tong: 620 buoc / 20 dot (Nhom 01-05 da xong = 110 buoc, con lai = 510 buoc)

---

## =====================================================
## NHOM 01-05: DA HOAN TAT — BO QUA
## =====================================================

(Xem PLAN_BUSINESS_COMPLETE.md cho chi tiet 110 buoc da hoan tat)

---

## =====================================================
## NHOM 06: MA GIAM GIA & KHUYEN MAI (BUYER SIDE)
## 16 buoc | Dot 4 | Uu tien TB
## =====================================================

### 06A. API bo sung (2 buoc)
```
06A.01  Them promotionApi.validate(code, cartTotal) -> { valid, promotion, discount, error }
06A.02  Them promotionApi.getActiveForProduct(productId) -> Promotion[] (khuyen mai dang hoat dong cho SP)
```

### 06B. Cart — Ap dung ma giam gia (6 buoc)
```
06B.01  Them section "Ma giam gia" trong CartPage: input + nut "Ap dung"
06B.02  Goi promotionApi.validate(code, cartTotal) — kiem tra ma hop le
06B.03  Hien thi ket qua: ten khuyen mai, loai giam gia, so tien giam, dieu kien ap dung
06B.04  Neu hop le: tru so tien giam vao tong don hang, hien thi dong "Giam gia" mau xanh
06B.05  Neu khong hop le: hien thi loi cu the (het han, don chua du, da su dung het)
06B.06  Nut "Xoa ma giam gia" — quay ve gia goc
```

### 06C. ProductDetail — Hien thi khuyen mai (4 buoc)
```
06C.01  Them section "Khuyen mai hien co" tren ProductDetailPage (duoi gia)
06C.02  Danh sach khuyen mai ap dung cho SP nay: ten, ma, dieu kien, han su dung
06C.03  Nut "Sao chep ma" (copy to clipboard) + toast xac nhan
06C.04  Badge "Khuyen mai" tren ProductCard khi SP co khuyen mai dang hoat dong
```

### 06D. Trang Khuyen mai Buyer (4 buoc)
```
06D.01  Tao BuyerPromotionPage.tsx — danh sach tat ca khuyen mai dang co tren san
06D.02  Card layout: moi khuyen mai la 1 card (ten, NCC, giam bao nhieu, dieu kien, han dung, nut "Sao chep ma")
06D.03  Filter: NCC, loai giam gia (phan tram/so tien), search theo ten/ma
06D.04  Them route /promotions vao BuyerLayout + menu "Khuyen mai" voi icon Tag
```

---

## =====================================================
## NHOM 07: NANG CAP GIO HANG & THANH TOAN
## 22 buoc | Dot 4 | Uu tien CAO
## =====================================================

### 07A. Gio hang nang cao (10 buoc)
```
07A.01  Nhom san pham theo NCC trong CartPage (moi NCC la 1 section rieng)
07A.02  Hien thi ten NCC, so SP, tong tien NCC phia tren moi nhom
07A.03  Them nut "Luu gio hang" — luu trang thai gio vao localStorage (auto-restore)
07A.04  Them nut "Xoa tat ca SP cua NCC nay" cho tung nhom
07A.05  Them o "Ghi chu cho NCC" cho tung nhom (collapse/expand)
07A.06  Tinh phi van chuyen du kien theo NCC (gia lap API)
07A.07  Hien thi canh bao MOQ: "SP nay yeu cau mua toi thieu X don vi"
07A.08  Hien thi canh bao het hang: "SP nay hien het hang" (disable +/-)
07A.09  "Dat hang rieng tung NCC" hoac "Dat hang tat ca" (tao nhieu don hang)
07A.10  Responsive: stack layout tren mobile, sidebar tom tat tren desktop
```

### 07B. Checkout nang cao (8 buoc)
```
07B.01  Them buoc chon dia chi giao hang (tu danh sach dia chi da luu — Nhom 11)
07B.02  Them buoc chon phuong thuc thanh toan: Chuyen khoan / COD / L/C / Tra cham
07B.03  Hien thi chi tiet gia: tam tinh, phi van chuyen, thue GTGT (10%), giam gia, tong cong
07B.04  Them truong "So PO noi bo" (Purchase Order number) — truong tuy chon cho buyer
07B.05  Xem lai truoc khi dat hang: dialog xac nhan voi tat ca thong tin
07B.06  Hien thi "Dieu khoan mua hang" checkbox bat buoc
07B.07  Sau khi dat hang: trang xac nhan don hang voi ma don, thong tin tom tat
07B.08  Animation confetti hoac check mark khi dat hang thanh cong
```

### 07C. Mini Cart (4 buoc)
```
07C.01  Tao MiniCart dropdown tren Header (hien thi khi hover/click icon gio hang)
07C.02  Hien thi 3 SP gan nhat, so luong tung SP, tong tien
07C.03  Nut "Xem gio hang", "Thanh toan nhanh"
07C.04  Animation khi them SP vao gio (icon gio hang bounce + toast)
```

---

## =====================================================
## NHOM 08: NANG CAP SELLER DASHBOARD
## 18 buoc | Dot 5 | Uu tien CAO
## =====================================================

### 08A. KPI nang cao (6 buoc)
```
08A.01  Them KPI card: ty le chuyen doi (don hang / luot xem SP)
08A.02  Them KPI card: gia tri don hang trung binh (AOV)
08A.03  Them KPI card: ty le hoan thanh don hang (da giao / tong don)
08A.04  Them KPI card: thoi gian xu ly don trung binh (ngay)
08A.05  So sanh voi ky truoc: "+12% so voi thang truoc" voi mui ten len/xuong va mau sac
08A.06  Mini sparkline chart trong moi KPI card (xu huong 7 ngay)
```

### 08B. Widget thong minh (8 buoc)
```
08B.01  Widget "Don hang moi" — 5 don gan nhat voi trang thai, so tien, nut "Xu ly"
08B.02  Widget "San pham ban chay" — top 5 SP theo doanh thu tuan nay
08B.03  Widget "Ton kho thap" — SP gan het / da het (link nhanh den Warehouse)
08B.04  Widget "Bao gia cho phan hoi" — RFQ chua tra loi voi deadline
08B.05  Widget "Hop dong sap het han" — hop dong con < 30 ngay
08B.06  Widget "Cong no qua han" — danh sach payment qua han thu
08B.07  Widget "Phe duyet cho xu ly" — da co, nang cap count realtime
08B.08  Widget "Chung chi sap het han" — da co, nang cap UI
```

### 08C. Bieu do tong hop (4 buoc)
```
08C.01  Bieu do doanh thu 30 ngay (AreaChart, co so sanh voi thang truoc)
08C.02  Bieu do don hang theo trang thai (PieChart)
08C.03  Bieu do top danh muc doanh thu (BarChart ngang)
08C.04  Toggle: "7 ngay" / "30 ngay" / "90 ngay" cho tat ca bieu do
```

---

## =====================================================
## NHOM 09: NANG CAP SELLER REPORTS — TACH TAB
## 24 buoc | Dot 5-6 | Uu tien CAO
## =====================================================

### 09A. Cau truc tabs (4 buoc)
```
09A.01  Refactor SellerReports.tsx thanh Tabs: "Doanh thu" / "San pham" / "Khach hang" / "Don hang"
09A.02  Date range picker chung cho tat ca tabs (component rieng)
09A.03  Period toggle: "Ngay" / "Tuan" / "Thang" / "Quy"
09A.04  Nut "Xuat bao cao CSV" cho tung tab
```

### 09B. Tab Doanh thu (6 buoc)
```
09B.01  AreaChart doanh thu theo thoi gian (ngay/tuan/thang)
09B.02  So sanh: duong net dut = ky truoc, duong lien = ky hien tai
09B.03  KPI cards: tong doanh thu, tang truong %, don hang, AOV
09B.04  BarChart: doanh thu theo danh muc san pham
09B.05  Top 10 don hang gia tri lon nhat (mini table)
09B.06  Du bao doanh thu thang toi (gia lap — duong xu huong)
```

### 09C. Tab San pham (6 buoc)
```
09C.01  Bang xep hang: SP ban chay nhat (theo so luong)
09C.02  Bang xep hang: SP doanh thu cao nhat (theo tong tien)
09C.03  Bang xep hang: SP danh gia tot nhat (theo TB sao)
09C.04  SP khong ban duoc (0 don trong 30 ngay) — danh sach canh bao
09C.05  Treemap/BarChart: phan bo doanh thu theo danh muc
09C.06  PieChart: phan bo SP theo trang thai (Da duyet/Cho duyet/An)
```

### 09D. Tab Khach hang (4 buoc)
```
09D.01  Top 10 khach hang theo chi tieu (bang voi ten, cong ty, tong chi tieu, so don)
09D.02  Ty le quay lai: % buyer co > 1 don hang
09D.03  BarChart: so khach hang moi theo thang
09D.04  Phan bo khach hang theo tinh/TP (bang hoac bieu do)
```

### 09E. Tab Don hang (4 buoc)
```
09E.01  Bieu do don hang theo trang thai (PieChart)
09E.02  Bieu do don hang theo thoi gian (LineChart)
09E.03  Thoi gian xu ly trung binh: BarChart theo thang
09E.04  Ty le huy don: LineChart xu huong
```

---

## =====================================================
## NHOM 10: NANG CAP SELLER PROFILE + CAU HINH THUE
## 16 buoc | Dot 6 | Uu tien TB
## =====================================================

### 10A. Profile nang cao (6 buoc)
```
10A.01  Tach SellerProfile thanh Tabs: "Thong tin" / "Chung chi" / "Thue & Ngan hang" / "Cau hinh"
10A.02  Tab Thong tin: giu nguyen form hien tai, them truong mo ta dai (textarea nhieu dong)
10A.03  Tab Thong tin: upload logo va cover (input URL + preview)
10A.04  Tab Chung chi: = Nhom 05A (da lam, chuyen sang tab)
10A.05  Them truong: website, so nam kinh nghiem, so nhan vien, nang luc san xuat
10A.06  Hien thi "Muc do hoan thien ho so" — progress bar % (tinh theo so truong da dien)
```

### 10B. Cau hinh thue & Ngan hang (6 buoc)
```
10B.01  Tab "Thue & Ngan hang": form cau hinh thong tin thue
10B.02  Truong: ten cong ty (phap ly), ma so thue, dia chi dang ky, nguoi dai dien
10B.03  Truong: ngan hang, so tai khoan, chi nhanh, chu tai khoan
10B.04  Validation: MST 10 hoac 13 so, so tai khoan 8-20 so
10B.05  Them truong: thue suat mac dinh (GTGT 10% / 0% xuat khau)
10B.06  Luu & hien thi "Da cau hinh thue" badge tren SellerDashboard
```

### 10C. Cau hinh NCC (4 buoc)
```
10C.01  Tab "Cau hinh": thong bao email (bat/tat cho tung loai: don moi, bao gia, thanh toan)
10C.02  Cau hinh: don vi tien te mac dinh, ngon ngu, mui gio
10C.03  Cau hinh: tu dong xac nhan don hang < X trieu (skip phe duyet)
10C.04  Cau hinh: thoi gian xu ly don mac dinh (ngay)
```

---

## =====================================================
## NHOM 11: NANG CAP BUYER PROFILE & DIA CHI
## 18 buoc | Dot 6-7 | Uu tien TB
## =====================================================

### 11A. Multi-address (8 buoc)
```
11A.01  Tao interface ShippingAddress { id, userId, label, fullName, phone, address, ward, district, city, country, isDefault, notes }
11A.02  Them mockShippingAddresses (3-4 dia chi) vao mockData
11A.03  Tao addressApi: getByUser, create, update, delete, setDefault
11A.04  Tao section "Dia chi giao hang" trong BuyerProfilePage (duoi thong tin ca nhan)
11A.05  Danh sach dia chi: card layout voi ten, dia chi, SDT, badge "Mac dinh"
11A.06  CRUD dia chi: dialog form voi cac truong, validation dia chi day du
11A.07  Dat dia chi mac dinh: nut "Dat lam mac dinh"
11A.08  Gioi han: toi da 10 dia chi
```

### 11B. Buyer Profile nang cao (6 buoc)
```
11B.01  Tach BuyerProfilePage thanh Tabs: "Thong tin" / "Dia chi" / "Bao mat" / "Thong ke"
11B.02  Tab Thong tin: them truong cong ty, chuc vu, ma so thue (cho mua hang xuat hoa don)
11B.03  Tab Bao mat: form doi mat khau (gia lap), bat/tat 2FA (gia lap)
11B.04  Tab Thong ke: tong don hang, tong chi tieu, so NCC da mua, trung binh don hang
11B.05  Tab Thong ke: bieu do chi tieu theo thang (BarChart mini)
11B.06  Avatar: upload avatar URL + preview (gia lap)
```

### 11C. Tich hop (4 buoc)
```
11C.01  Checkout: chon tu danh sach dia chi da luu (thay vi nhap moi)
11C.02  Hien thi dia chi mac dinh tren CartPage checkout section
11C.03  Them breadcrumb va meta title cho Profile pages
11C.04  Responsive: card layout tren mobile cho dia chi
```

---

## =====================================================
## NHOM 12: DAT HANG HANG LOAT & BULK ORDER
## 16 buoc | Dot 7 | Uu tien CAO
## =====================================================

### 12A. Bulk Order tu file (8 buoc)
```
12A.01  Tao BuyerBulkOrderPage.tsx — dat hang tu file CSV/Excel
12A.02  Buoc 1: Upload file CSV (input file, chi chap nhan .csv)
12A.03  Buoc 2: Preview — DataTable hien thi noi dung file (10 dong dau)
12A.04  Buoc 3: Mapping — ghep cot file voi truong he thong (productId/SKU, quantity, notes)
12A.05  Buoc 4: Validation — kiem tra SP ton tai, gia con hieu luc, ton kho du
12A.06  Buoc 5: Xac nhan — hien thi danh sach SP hop le, tong tien, canh bao SP khong hop le
12A.07  Buoc 6: Tao don hang — nut "Dat hang" tao 1 hoac nhieu don (nhom theo NCC)
12A.08  Tai template CSV mau: nut "Tai file mau" voi header columns
```

### 12B. Quick Order form (6 buoc)
```
12B.01  Tao BuyerQuickOrderPage.tsx — form dat hang nhanh (nhieu dong)
12B.02  Moi dong: input ma SP / ten SP (autocomplete), so luong, don vi, gia hien thi
12B.03  Nut "Them dong" — them dong moi (toi da 50 dong)
12B.04  Autocomplete SP: goi productApi.search() khi nhap >= 2 ky tu
12B.05  Tong tien tu dong tinh, nhom theo NCC
12B.06  Nut "Them vao gio" hoac "Dat hang ngay"
```

### 12C. Routes (2 buoc)
```
12C.01  Them routes: /bulk-order, /quick-order vao BuyerLayout
12C.02  Them menu "Dat hang nhanh" va "Dat hang tu file" vao sidebar
```

---

## =====================================================
## NHOM 13: XUAT / NHAP DU LIEU (ImportDialog)
## 22 buoc | Dot 7-8 | Uu tien TB
## =====================================================

### 13A. Shared ImportDialog component (8 buoc)
```
13A.01  Tao /src/app/components/shared/ImportDialog.tsx — component nhap du lieu chung
13A.02  Props: open, onClose, title, columns: { key, label, required }[], onImport(data)
13A.03  Buoc 1: Upload file — drag & drop zone + nut chon file (chi .csv)
13A.04  Buoc 2: Preview — DataTable 10 dong dau + tong so dong
13A.05  Buoc 3: Mapping — select: ghep cot file <-> cot he thong
13A.06  Buoc 4: Validation — kiem tra truong bat buoc, dinh dang, hien thi loi tung dong
13A.07  Buoc 5: Ket qua — so dong thanh cong / that bai / bo qua, nut "Hoan tat"
13A.08  Option xu ly trung: "Bo qua" / "Ghi de" / "Tao ban ghi moi" (radio)
```

### 13B. Shared ExportUtil (4 buoc)
```
13B.01  Tao /src/app/utils/exportUtils.ts — ham xuat du lieu chung
13B.02  exportToCSV(data, columns, filename) — ham export CSV voi UTF-8 BOM
13B.03  exportWithDateRange(data, columns, filename, dateRange) — export voi loc ngay
13B.04  Refactor tat ca nut "Xuat CSV" hien co sang dung exportToCSV chung
```

### 13C. Seller — Nhap du lieu (6 buoc)
```
13C.01  Them nut "Nhap tu CSV" tren SellerProductList — mo ImportDialog voi columns san pham
13C.02  Columns: ten, SKU, danh muc, gia, mo ta, toi thieu dat hang, don vi
13C.03  Sau khi import: tao san pham moi voi status "Cho duyet"
13C.04  Them nut "Nhap tu CSV" tren SellerWarehouse — import ton kho
13C.05  Tai template CSV mau tren moi trang co import
13C.06  Lich su import: hien thi lan nhap cuoi (ngay, so ban ghi, nguoi nhap)
```

### 13D. Admin — Nhap du lieu (4 buoc)
```
13D.01  Them nut "Nhap tu CSV" tren CategoryManagement — import danh muc
13D.02  Them nut "Nhap tu CSV" tren UserManagement — import nguoi dung
13D.03  Columns phu hop cho tung loai entity
13D.04  Validation dac thu: email unique (user), slug unique (category)
```

---

## =====================================================
## NHOM 14: NANG CAP BUYER RFQ FLOW
## 14 buoc | Dot 8 | Uu tien TB
## =====================================================

### 14A. RFQ Create nang cao (6 buoc)
```
14A.01  Them truong "Kem file dinh kem" trong BuyerRFQCreatePage (URL input, preview)
14A.02  Them truong "Thong so ky thuat" cho tung SP trong RFQ (textarea)
14A.03  Them option: gui den nhieu NCC cung luc (multi-select NCC)
14A.04  Them option: gui RFQ cong khai (NCC tu lien he) vs chi dinh NCC
14A.05  Luu ban nhap: nut "Luu ban nhap" truoc khi gui
14A.06  Template RFQ: tao RFQ tu template da luu
```

### 14B. RFQ Detail nang cao (5 buoc)
```
14B.01  Them so sanh bao gia tren BuyerRFQDetailPage: bang so sanh gia, thoi gian giao, dieu khoan
14B.02  Highlight bao gia tot nhat (gia thap nhat, giao nhanh nhat)
14B.03  Them nut "Dam phan" — gui tin nhan cho NCC (link den Chat)
14B.04  Them nut "Tao hop dong" tu bao gia da chap nhan
14B.05  Timeline: lich su thay doi trang thai RFQ
```

### 14C. RFQ List nang cao (3 buoc)
```
14C.01  Them filter: khoang ngay, NCC, khoang gia tri
14C.02  Them bieu do mini: PieChart trang thai RFQ (phia tren table)
14C.03  Card view tren mobile
```

---

## =====================================================
## NHOM 15: NANG CAP BUYER CONTRACT FLOW
## 14 buoc | Dot 8-9 | Uu tien TB
## =====================================================

### 15A. Contract Detail nang cao (6 buoc)
```
15A.01  Them timeline trong BuyerContractDetail: cac moc (Tao -> Gui -> Ky -> Hieu luc -> Het han)
15A.02  Them tab "Moc tien do" — hien thi milestones voi progress bar
15A.03  Them tab "Don hang" — don hang lien ket voi hop dong nay
15A.04  Them tab "Lich su" — nhat ky thay doi hop dong
15A.05  Nut "Ky hop dong" (gia lap — update signedByBuyer = true)
15A.06  Nut "Tao don hang tu hop dong" — tao don voi gia da thoa thuan
```

### 15B. Contract List nang cao (4 buoc)
```
15B.01  Them filter: loai hop dong, khoang gia tri, khoang ngay, NCC
15B.02  Them stats card: tong hop dong, dang hieu luc, sap het han, da ky
15B.03  Canh bao: hop dong sap het han < 30 ngay (banner vang)
15B.04  Card view tren mobile
```

### 15C. Contract tu RFQ (4 buoc)
```
15C.01  Flow: RFQ Chap nhan bao gia -> Tao hop dong tu dong
15C.02  Pre-fill hop dong tu thong tin RFQ + bao gia da chap nhan
15C.03  Buyer xem va ky hop dong
15C.04  Lien ket RFQ -> Hop dong -> Don hang (breadcrumb navigation)
```

---

## =====================================================
## NHOM 16: NANG CAP SELLER RFQ & CONTRACT
## 16 buoc | Dot 9 | Uu tien TB
## =====================================================

### 16A. Seller RFQ nang cao (6 buoc)
```
16A.01  SellerRFQDetail: them form bao gia nang cao voi dieu kien thanh toan, van chuyen
16A.02  Them option: bao gia nhieu phuong an (A/B/C voi gia khac nhau)
16A.03  Them option: gia theo so luong (volume discount trong bao gia)
16A.04  Xem lai bao gia da gui: chi tiet + trang thai + phan hoi tu buyer
16A.05  Canh bao: RFQ sap het han chua tra loi (banner do)
16A.06  Stats: ty le chap nhan bao gia, gia tri trung binh, thoi gian tra loi TB
```

### 16B. Seller Contract nang cao (6 buoc)
```
16B.01  SellerContractDetail: them timeline trang thai
16B.02  Them tab "Moc tien do" — cap nhat trang thai milestone (nut "Hoan thanh")
16B.03  Them tab "Don hang" — don hang lien ket
16B.04  Nut "Ky hop dong" (gia lap — update signedBySeller = true)
16B.05  Nut "Tao don hang tu hop dong" — danh cho NCC tao don giao
16B.06  Canh bao: hop dong co tranh chap, hop dong sap het han
```

### 16C. Seller Contract Create (4 buoc)
```
16C.01  Nang cap SellerContractList: them nut "Tao hop dong moi"
16C.02  Form: chon ben mua (combobox), loai hop dong, thoi han, dieu khoan
16C.03  Them san pham tu kho hang (autocomplete), gia, so luong
16C.04  Them milestones: ten, ngay, so tien (dynamic list)
```

---

## =====================================================
## NHOM 17: NANG CAP SELLER WAREHOUSE & INVENTORY
## 18 buoc | Dot 9-10 | Uu tien CAO
## =====================================================

### 17A. Warehouse nang cao (6 buoc)
```
17A.01  Them bieu do tren SellerWarehouse: BarChart ton kho theo kho
17A.02  Them PieChart: phan bo gia tri ton kho theo danh muc
17A.03  Them canh bao nang cao: SP ton kho cao bat thuong (> 3 thang khong ban)
17A.04  Them export CSV ton kho hien tai (nut "Xuat CSV")
17A.05  Them import ton kho tu CSV (dung ImportDialog)
17A.06  Them cot: SKU, gia nhap, gia tri ton kho (so luong x gia), thoi gian ton kho
```

### 17B. Xuat nhap kho nang cao (6 buoc)
```
17B.01  Form nhap kho: them truong "NCC goc" (ten NCC ban), "So hoa don nhap", "Ngay nhap"
17B.02  Form xuat kho: them truong "Don hang lien ket", "Nguoi nhan"
17B.03  Them loai "Chuyen kho" — xuat tu kho A, nhap vao kho B (2 movement records)
17B.04  Bieu do: xuat nhap kho theo thang (BarChart grouped: nhap vs xuat)
17B.05  In phieu xuat kho: layout in an voi danh sach SP, so luong, ky nhan
17B.06  Export CSV lich su xuat nhap kho
```

### 17C. Ton kho thong minh (6 buoc)
```
17C.01  Them cot "Ngay cuoi cung ban" cho moi SP (computed tu order)
17C.02  Them cot "Toc do ban" (SP/thang — trung binh 3 thang)
17C.03  Them cot "Du kien het hang sau" (currentStock / tocDoBan thang)
17C.04  Canh bao thong minh: "SP X se het hang sau 7 ngay — dat hang bo sung?"
17C.05  Goi y dat hang: tinh so luong can nhap dua tren toc do ban + lead time
17C.06  Filter nhanh: "Het hang" / "Gan het" / "Du" / "Ton dong" (> 90 ngay)
```

---

## =====================================================
## NHOM 18: NANG CAP SELLER SHIPMENT & PAYMENT
## 16 buoc | Dot 10 | Uu tien TB
## =====================================================

### 18A. Shipment nang cao (8 buoc)
```
18A.01  Them stats card tren SellerShipmentList: cho gui, dang van chuyen, da giao, that bai, trung binh ngay giao
18A.02  Them bieu do: ty le giao hang thanh cong theo thang (LineChart)
18A.03  Them filter: hang van chuyen, khoang ngay, trang thai
18A.04  Tao van don tu don hang: nut "Tao van don" voi form (tracking, hang VC, can nang)
18A.05  Cap nhat tracking: form nhap su kien van chuyen (dia diem, trang thai, thoi gian)
18A.06  In phieu gui hang: layout in an voi thong tin nguoi gui/nhan, danh sach SP
18A.07  Export CSV danh sach van don
18A.08  Card view tren mobile
```

### 18B. Payment nang cao (8 buoc)
```
18B.01  Them stats card tren SellerPaymentList: tong phai thu, da thu, qua han, trung binh ngay thu
18B.02  Them bieu do: dong tien theo thang (BarChart: thu vs chi)
18B.03  Ghi nhan thanh toan: form chi tiet (so tien, phuong thuc, ma giao dich, ngan hang, ngay)
18B.04  Thanh toan tung phan: hien thi so tien da tra / con lai, progress bar
18B.05  Lich su giao dich: timeline cac lan thanh toan cua 1 payment
18B.06  Canh bao: payment qua han (banner do), sap den han (banner vang)
18B.07  Export CSV cong no phai thu
18B.08  Export bao cao cong no theo ky (chon khoang ngay)
```

---

## =====================================================
## NHOM 19: NANG CAP BUYER SHIPMENT & PAYMENT
## 14 buoc | Dot 10-11 | Uu tien TB
## =====================================================

### 19A. Buyer Shipment nang cao (7 buoc)
```
19A.01  Them timeline tracking trong BuyerShipmentList: cac su kien van chuyen tu ShipmentEvent[]
19A.02  Filter nang cao: hang van chuyen, khoang ngay, trang thai
19A.03  Stats card: dang van chuyen, da giao, that bai
19A.04  Chi tiet: hien thi ban do gia lap (dia chi gui/nhan)
19A.05  Them tab "Van chuyen" trong OrderDetailPage: tracking realtime
19A.06  Thong bao: push notification khi trang thai van chuyen thay doi (gia lap)
19A.07  Card view tren mobile
```

### 19B. Buyer Payment nang cao (7 buoc)
```
19B.01  Them bieu do chi tieu theo thang (BarChart mini phia tren)
19B.02  Them filter: NCC, khoang ngay, trang thai, phuong thuc
19B.03  Chi tiet payment: lich su giao dich, trang thai, so tien con lai
19B.04  Xac nhan chuyen khoan: form upload chung tu (URL gia lap) + ghi chu
19B.05  Canh bao: payment sap den han (banner vang), qua han (banner do)
19B.06  Tong hop: "Tong cong no hien tai" card noi bat
19B.07  Export CSV lich su thanh toan
```

---

## =====================================================
## NHOM 20: SELLER ACTIVITY LOG & NHAT KY
## 12 buoc | Dot 11 | Uu tien TB
## =====================================================

### 20A. Seller Activity (8 buoc)
```
20A.01  Tao SellerActivityPage.tsx — nhat ky hoat dong cua NCC
20A.02  DataTable: thoi gian, nguoi thuc hien (nhan vien), hanh dong, doi tuong, chi tiet
20A.03  Filter: nhan vien (combobox), hanh dong (select), khoang ngay, doi tuong
20A.04  Search: theo ten nhan vien, chi tiet
20A.05  Timeline view toggle: hien thi nhat ky dang timeline theo ngay (ViewToggle)
20A.06  Stats card: tong hoat dong hom nay, tuan nay, nhan vien hoat dong nhat
20A.07  Export CSV nhat ky
20A.08  Responsive: card layout tren mobile
```

### 20B. Tich hop & Routes (4 buoc)
```
20B.01  Them route /seller/activity vao SellerLayout
20B.02  Them menu SellerLayout: "Nhat ky" voi icon History
20B.03  SellerDashboard widget: "10 hoat dong gan nhat" (mini timeline)
20B.04  Ghi nhat ky tu dong khi: tao/sua/xoa SP, xu ly don, xuat kho, gui bao gia
```

---

## =====================================================
## NHOM 21: UX NANG CAO & COMMAND PALETTE
## 24 buoc | Dot 11-12 | Uu tien CAO
## =====================================================

### 21A. Command Palette (6 buoc)
```
21A.01  Tao CommandPalette.tsx — Ctrl+K mo search box trung tam
21A.02  Search: trang (tat ca route), don hang (theo ma), san pham (theo ten), NCC
21A.03  Ket qua: nhom theo loai (Trang, Don hang, San pham, NCC) voi icon phu hop
21A.04  Keyboard: mui ten len/xuong chon, Enter mo, Esc dong
21A.05  Recent searches: hien thi 5 tim kiem gan nhat
21A.06  Tich hop vao BuyerLayout va SellerLayout (Ctrl+K)
```

### 21B. Keyboard Shortcuts (4 buoc)
```
21B.01  Ctrl+N: tao moi (context-dependent: tao SP trong seller/products, tao RFQ trong /rfq)
21B.02  Esc: dong dialog/modal dang mo
21B.03  Ctrl+S: luu form dang mo (trigger submit)
21B.04  Hien thi shortcut hints trong tooltip cua nut chinh
```

### 21C. Toast & Undo (4 buoc)
```
21C.01  Toast undo: "Da xoa san pham. Hoan tac?" voi nut "Hoan tac" (5 giay)
21C.02  Toast undo cho: xoa don hang, xoa SP trong gio, xoa template, xoa dia chi
21C.03  Animation toast: slide in tu goc phai, progress bar dem nguoc
21C.04  Tao helper: toastWithUndo(message, undoAction, timeout)
```

### 21D. Empty States (4 buoc)
```
21D.01  Tao EmptyState.tsx — component hien thi trang thai trong
21D.02  Props: icon, title, description, actionLabel, onAction
21D.03  Them EmptyState cho: Wishlist, Templates, Orders, RFQ, Contracts, Cart, Shipments
21D.04  Illustration: icon lon + text mo ta + nut hanh dong chinh
```

### 21E. Micro Interactions (6 buoc)
```
21E.01  Animation khi them SP vao gio: icon gio hang bounce + toast
21E.02  Animation khi them SP vao wishlist: Heart fill voi scale effect
21E.03  Skeleton loading nhat quan: tao skeleton cho moi kieu trang (list, detail, dashboard)
21E.04  Pull-to-refresh tren mobile (gia lap — nut refresh)
21E.05  Scroll-to-top button khi cuon xuong > 300px
21E.06  Page transition: fade in khi chuyen trang (motion)
```

---

## =====================================================
## NHOM 22: PERFORMANCE & ACCESSIBILITY
## 26 buoc | Dot 12-13 | Uu tien CAO
## =====================================================

### 22A. Code Splitting & Lazy Loading (6 buoc)
```
22A.01  React.lazy + Suspense cho tat ca route pages (Buyer ~25 trang)
22A.02  React.lazy cho tat ca route pages (Seller ~23 trang)
22A.03  React.lazy cho tat ca route pages (Admin ~19 trang)
22A.04  Skeleton fallback cho moi lazy page (dung PageSkeleton hien co)
22A.05  Image lazy loading: them loading="lazy" cho tat ca ImageWithFallback
22A.06  Preload route: prefetch trang co kha nang truy cap tiep (hover link)
```

### 22B. Render Optimization (6 buoc)
```
22B.01  useMemo cho: stats computation trong Dashboard, Reports, list pages
22B.02  useCallback cho: event handlers trong DataTable, FilterBar, FormDialog
22B.03  React.memo cho: ProductCard, StatusBadge, StarDisplay, EmptyState
22B.04  Debounce 300ms cho tat ca search input (SearchSuggestions, FilterBar, CommandPalette)
22B.05  Virtual scrolling cho danh sach > 50 items (ProductList, OrderList)
22B.06  Batch state updates: nhom setState trong cung 1 event handler
```

### 22C. Data & Cache (4 buoc)
```
22C.01  Local storage cache: luu ket qua API gan nhat (TTL 5 phut) cho product list, category
22C.02  Form auto-save: luu form data vao localStorage khi nguoi dung dang nhap lieu (RFQ, Product Form)
22C.03  Offline indicator: hien thi banner "Ban dang offline" khi mat mang
22C.04  Retry logic: tu dong thu lai API call that bai (toi da 3 lan, exponential backoff)
```

### 22D. Accessibility (6 buoc)
```
22D.01  ARIA labels: them aria-label cho tat ca Button icon-only, Input, Select
22D.02  Focus management: focus trap trong Dialog, return focus khi dong
22D.03  Keyboard navigation: Tab order logic cho DataTable (row -> cell -> action)
22D.04  Screen reader: aria-live="polite" cho toast, loading states, stat changes
22D.05  Skip links: "Chuyen den noi dung chinh" cho screen reader
22D.06  Color contrast: dam bao WCAG AA (4.5:1) cho text, 3:1 cho interactive elements
```

### 22E. Mobile Optimization (4 buoc)
```
22E.01  Touch targets: dam bao tat ca nut >= 44x44px tren mobile
22E.02  Responsive tables: horizontal scroll + sticky first column khi < 768px
22E.03  Bottom navigation: thanh nav co dinh o cuoi man hinh tren mobile (Buyer)
22E.04  Font scaling: dam bao doc duoc khi phong to 200% (WCAG 1.4.4)
```

---

## =====================================================
## =====================================================
##
## CAC NHOM MOI (23-32) — TINH NANG DOANH NGHIEP NANG CAO
##
## =====================================================
## =====================================================

---

## =====================================================
## NHOM 23: BUYER DASHBOARD & TONG QUAN
## 20 buoc | Dot 13-14 | Uu tien CAO | MOI
## =====================================================

### 23A. Types & API (4 buoc)
```
23A.01  Tao interface BuyerDashboardStats { totalOrders, totalSpent, activeRFQs, activeContracts, pendingPayments, pendingShipments, avgOrderValue, savingsFromPromotions }
23A.02  Tao interface BuyerSpendingTrend { month: string, amount: number }
23A.03  Tao buyerDashboardApi.getStats(userId) -> BuyerDashboardStats
23A.04  Tao buyerDashboardApi.getSpendingTrend(userId, months) -> BuyerSpendingTrend[]
```

### 23B. BuyerDashboardPage (10 buoc)
```
23B.01  Tao BuyerDashboardPage.tsx — trang tong quan cua Buyer (thay the HomePage hoac song song)
23B.02  Stats cards: Tong don hang, Tong chi tieu, RFQ dang mo, Hop dong hieu luc, Cong no cho TT
23B.03  Widget "Don hang gan day" — 5 don moi nhat voi trang thai, so tien, link chi tiet
23B.04  Widget "Van chuyen dang tren duong" — danh sach shipment dang giao, tracking
23B.05  Widget "Thanh toan sap den han" — payment con < 7 ngay den han
23B.06  Widget "San pham yeu thich" — 5 SP trong wishlist, nut "Them vao gio"
23B.07  Widget "Template hay dung" — 3 template dat hang thuong dung, nut "Dat lai"
23B.08  Bieu do: chi tieu theo thang (AreaChart, 12 thang gan nhat)
23B.09  Bieu do: phan bo chi tieu theo NCC (PieChart)
23B.10  Bieu do: so don hang theo thang (BarChart)
```

### 23C. Tich hop & Routes (6 buoc)
```
23C.01  Them route /dashboard vao BuyerLayout (tach biet voi / home)
23C.02  Them menu "Tong quan" vao BuyerLayout sidebar (icon LayoutDashboard, o dau)
23C.03  Trang Dashboard chi hien khi da dang nhap; chua dang nhap -> redirect ve HomePage
23C.04  Quick actions: "Tao RFQ", "Dat hang nhanh", "Xem gio hang" — 3 nut hanh dong nhanh
23C.05  Period toggle: "7 ngay" / "30 ngay" / "90 ngay" cho tat ca bieu do
23C.06  Responsive: card layout tren mobile, 2 cot tren tablet, 3 cot tren desktop
```

---

## =====================================================
## NHOM 24: DANH GIA & REVIEW SAN PHAM / NCC
## 22 buoc | Dot 14 | Uu tien CAO | MOI
## =====================================================

### 24A. Types & API (5 buoc)
```
24A.01  Mo rong interface Review: them orderId, orderNumber, isVerifiedPurchase: boolean, helpfulCount: number, images: string[]
24A.02  Tao interface SupplierReview { id, buyerId, buyerName, buyerCompany, supplierId, supplierName, rating, comment, tags: string[], createdAt }
24A.03  Tao reviewApi.getByProduct(productId, pagination, sort) -> PaginatedResponse<Review>
24A.04  Tao reviewApi.create(data) -> Review, update(id, data) -> Review, delete(id) -> void
24A.05  Tao supplierReviewApi.getBySupplierId(supplierId, pagination) -> PaginatedResponse<SupplierReview>, create, update, delete
```

### 24B. Buyer — Viet danh gia (8 buoc)
```
24B.01  Dialog "Viet danh gia" tren OrderDetailPage: chi hien khi don hang "Da giao" va chua review
24B.02  Form: chon sao (1-5), tieu de, noi dung, them anh (URL gia lap), tags (chat luong, giao hang, dong goi)
24B.03  Validation: sao bat buoc, noi dung toi thieu 10 ky tu
24B.04  Sau khi gui: hien thi toast + badge "Da danh gia" tren OrderListPage
24B.05  Buyer co the sua/xoa review cua minh (chi trong 7 ngay)
24B.06  Danh gia NCC: form rieng tren SupplierDetailPage (1-5 sao, binh luan, tags: gia ca, giao tiep, toc do)
24B.07  Hien thi "Da mua hang" badge tren review cua buyer co don hang xac nhan
24B.08  Nut "Huu ich" tren moi review (dem so lan)
```

### 24C. Hien thi danh gia (6 buoc)
```
24C.01  Section "Danh gia" tren ProductDetailPage: danh sach review, phan trang, sap xep (moi nhat, sao cao, huu ich)
24C.02  Summary bar: phan bo sao (5 thanh ngang), diem trung binh, tong so danh gia
24C.03  Filter review: theo so sao, chi "Da mua hang", co hinh anh
24C.04  Tab "Danh gia" tren SupplierDetailPage: tuong tu nhung cho NCC
24C.05  Seller response: NCC co the tra loi review cua buyer (dialog reply)
24C.06  Admin: da co ReviewManagement — dam bao lien ket dung voi data moi
```

### 24D. Tich hop (3 buoc)
```
24D.01  ProductCard: hien thi so sao trung binh + so danh gia (da co, dam bao computed dung)
24D.02  SupplierListPage: hien thi so sao + so danh gia NCC
24D.03  SellerDashboard widget: "Danh gia gan day" — 5 review moi nhat voi sao, noi dung rut gon
```

---

## =====================================================
## NHOM 25: TRA HANG & HOAN TIEN (RETURN / REFUND)
## 24 buoc | Dot 14-15 | Uu tien CAO | MOI
## =====================================================

### 25A. Types & Data (6 buoc)
```
25A.01  Tao type ReturnStatus = 'Cho duyet' | 'Da duyet' | 'Tu choi' | 'Dang xu ly' | 'Da hoan tien' | 'Da dong'
25A.02  Tao type ReturnReason = 'Loi san pham' | 'Khong dung mo ta' | 'Giao nham' | 'Hu hong van chuyen' | 'Doi y' | 'Khac'
25A.03  Tao interface ReturnItem { productId, productName, productImage, quantity, unitPrice, reason, note }
25A.04  Tao interface ReturnRequest { id, orderId, orderNumber, buyerId, buyerName, supplierId, supplierName, items: ReturnItem[], reason, status, refundAmount, refundMethod, images: string[], adminNote?, sellerNote?, createdAt, resolvedAt? }
25A.05  Them mockReturnRequests (5-6 ban ghi da mau) vao mockData.ts
25A.06  Tao type DisputeStatus = 'Mo' | 'Dang xu ly' | 'Da giai quyet' | 'Tu choi'
```

### 25B. API Service (4 buoc)
```
25B.01  Tao returnApi.getByBuyer(buyerId, pagination, filters) -> PaginatedResponse<ReturnRequest>
25B.02  Tao returnApi.getBySeller(supplierId, pagination, filters) -> PaginatedResponse<ReturnRequest>
25B.03  Tao returnApi.create(data) -> ReturnRequest
25B.04  Tao returnApi.updateStatus(id, status, note) -> ReturnRequest, getStats(supplierId)
```

### 25C. Buyer — Yeu cau tra hang (6 buoc)
```
25C.01  Tao dialog "Yeu cau tra hang" tren OrderDetailPage: chi khi don da giao va < 7 ngay
25C.02  Form: chon SP tra, so luong, ly do (select), mo ta chi tiet, them anh (URL)
25C.03  Tinh so tien hoan du kien (auto-compute)
25C.04  Tao BuyerReturnListPage.tsx — danh sach yeu cau tra hang da tao
25C.05  DataTable: ma don, ma tra hang, NCC, so tien, trang thai, ngay tao
25C.06  Chi tiet tra hang: dialog voi thong tin, timeline trang thai, ghi chu NCC/Admin
```

### 25D. Seller — Xu ly tra hang (5 buoc)
```
25D.01  Them tab "Tra hang" tren SellerOrderDetail hoac trang rieng SellerReturnListPage.tsx
25D.02  DataTable: cac yeu cau tra hang tu buyer, filter: trang thai, ngay, buyer
25D.03  Chi tiet + hanh dong: "Chap nhan" / "Tu choi" voi ly do
25D.04  Khi chap nhan: tu dong tao payment refund (so tien am)
25D.05  Stats: tong yeu cau, dang cho, da xu ly, ty le tra hang
```

### 25E. Tich hop & Routes (3 buoc)
```
25E.01  Them route /returns vao BuyerLayout, /seller/returns vao SellerLayout
25E.02  Them menu "Tra hang" cho ca 2 layout voi icon RotateCcw
25E.03  OrderDetailPage: hien thi trang thai tra hang (neu co) trong timeline
```

---

## =====================================================
## NHOM 26: HAN MUC TIN DUNG & DIEU KHOAN THANH TOAN
## 18 buoc | Dot 15 | Uu tien CAO | MOI
## =====================================================

### 26A. Types & Data (4 buoc)
```
26A.01  Tao interface CreditLimit { id, buyerId, buyerName, buyerCompany, supplierId, supplierName, creditLimit: number, usedAmount: number, availableAmount: number, paymentTerms: string, status: 'Hoat dong' | 'Tam ngung' | 'Het han', approvedBy, approvedAt, expiryDate }
26A.02  Tao interface CreditTransaction { id, creditLimitId, orderId, orderNumber, amount, type: 'Su dung' | 'Hoan tra' | 'Thanh toan', balance, note, createdAt }
26A.03  Them mockCreditLimits (4-5 ban ghi), mockCreditTransactions (10-15) vao mockData.ts
26A.04  Tao creditApi trong api.ts: getBuyerCredits(buyerId), getSellerCredits(supplierId), getTransactions(creditId)
```

### 26B. Seller — Quan ly han muc (6 buoc)
```
26B.01  Tao SellerCreditPage.tsx — quan ly han muc tin dung cho tung buyer
26B.02  DataTable: buyer, cong ty, han muc, da dung, con lai, dieu khoan TT, trang thai
26B.03  Tao moi: dialog form — chon buyer (combobox), han muc, dieu khoan TT, ngay het han
26B.04  Sua han muc: tang/giam, gia han, tam ngung
26B.05  Lich su giao dich: timeline su dung / thanh toan / hoan tra cho moi buyer
26B.06  Canh bao: buyer da su dung > 80% han muc (banner vang), 100% (banner do)
```

### 26C. Buyer — Xem han muc (4 buoc)
```
26C.01  Them section "Han muc tin dung" trong BuyerDashboard hoac BuyerPaymentList
26C.02  Danh sach NCC da cap han muc: ten NCC, han muc, da dung, con lai, progress bar
26C.03  Chi tiet: dialog voi lich su giao dich, thoi han, dieu khoan
26C.04  Checkout: kiem tra han muc truoc khi dat hang tra cham (hien thi so du kha dung)
```

### 26D. Tich hop (4 buoc)
```
26D.01  Them route /seller/credits vao SellerLayout + menu "Tin dung"
26D.02  SellerDashboard widget: "Tin dung" — tong han muc da cap, da dung, canh bao
26D.03  CartPage: hien thi han muc kha dung khi chon phuong thuc "Tra cham"
26D.04  OrderDetail: hien thi thong tin credit khi don su dung tin dung
```

---

## =====================================================
## NHOM 27: QUAN LY NHOM MUA HANG (BUYER TEAM)
## 20 buoc | Dot 15-16 | Uu tien CAO | MOI
## =====================================================

### 27A. Types & Data (5 buoc)
```
27A.01  Tao type BuyerRole = 'Quan ly mua hang' | 'Nhan vien mua hang' | 'Ke toan' | 'Giam doc'
27A.02  Tao interface BuyerTeamMember { id, companyId, userId, fullName, email, phone, role: BuyerRole, permissions: BuyerPermission[], isActive, joinedAt }
27A.03  Tao interface BuyerPermission { key: string, label: string, description: string }
27A.04  Tao interface BuyerCompany { id, name, taxCode, address, city, industry, employeeCount, contactPerson, createdAt }
27A.05  Them mockBuyerTeamMembers (4-5 thanh vien), mockBuyerCompany (2 cong ty) vao mockData.ts
```

### 27B. API Service (3 buoc)
```
27B.01  Tao buyerTeamApi.getByCompany(companyId) -> BuyerTeamMember[]
27B.02  Tao buyerTeamApi.invite(email, role, permissions) -> BuyerTeamMember
27B.03  Tao buyerTeamApi.update(id, data), remove(id), updatePermissions(id, permissions)
```

### 27C. Buyer — Quan ly nhom (8 buoc)
```
27C.01  Tao BuyerTeamPage.tsx — danh sach thanh vien nhom mua hang
27C.02  DataTable: ten, email, vai tro, quyen, trang thai, ngay tham gia
27C.03  Moi thanh vien: dialog form (ten, email, vai tro, phan quyen chi tiet)
27C.04  Danh sach quyen: dat hang, duyet don, xem bao cao, quan ly RFQ, quan ly hop dong, quan ly thanh toan
27C.05  Phan quyen: Giam doc = full, Quan ly = tat ca tru bao cao, Nhan vien = chi dat hang + xem, Ke toan = thanh toan + bao cao
27C.06  Moi thanh vien moi: form nhap email + chon vai tro (gia lap gui email)
27C.07  Xoa thanh vien: dialog xac nhan, chi quan ly moi xoa
27C.08  Hien thi "Cong ty cua ban" — thong tin cong ty, logo, ma so thue
```

### 27D. Tich hop (4 buoc)
```
27D.01  Them route /team vao BuyerLayout + menu "Nhom mua" voi icon Users
27D.02  Checkout: kiem tra quyen "dat hang" truoc khi cho phep
27D.03  BuyerDashboard: widget "Nhom cua ban" — so thanh vien, vai tro
27D.04  OrderListPage: hien thi cot "Nguoi dat" neu nhom co nhieu thanh vien
```

---

## =====================================================
## NHOM 28: TRUNG TAM THONG BAO
## 18 buoc | Dot 16-17 | Uu tien TB | MOI
## =====================================================

### 28A. Types & Data bo sung (4 buoc)
```
28A.01  Mo rong NotificationType: them 'rfq' | 'contract' | 'payment' | 'shipment' | 'approval' | 'review' | 'credit' | 'return'
28A.02  Them truong: priority: 'low' | 'medium' | 'high' | 'urgent', category, actionUrl, isActionable: boolean
28A.03  Tao notificationApi.getAll(userId, pagination, filters) -> PaginatedResponse<AppNotification>
28A.04  Tao notificationApi.markAsRead(id), markAllAsRead(userId), delete(id), getUnreadCount(userId)
```

### 28B. Notification Center Page (8 buoc)
```
28B.01  Tao NotificationCenterPage.tsx — trang tat ca thong bao
28B.02  Tabs: "Tat ca" / "Chua doc" / "Quan trong"
28B.03  Filter: loai (don hang, bao gia, thanh toan...), khoang ngay, do uu tien
28B.04  Moi thong bao: icon loai, noi dung, thoi gian, trang thai doc/chua doc, nut hanh dong
28B.05  Nut "Danh dau tat ca da doc"
28B.06  Swipe-to-dismiss tren mobile (gia lap — nut xoa)
28B.07  Group thong bao theo ngay (Hom nay / Hom qua / Tuan truoc / Cu hon)
28B.08  Empty state: "Ban khong co thong bao nao"
```

### 28C. Nang cap NotificationDropdown (3 buoc)
```
28C.01  Nang cap NotificationDropdown hien co: hien thi icon mau theo loai
28C.02  Them nut "Xem tat ca" link den NotificationCenterPage
28C.03  Realtime count: cap nhat badge so khi co thong bao moi (polling 30s gia lap)
```

### 28D. Tich hop (3 buoc)
```
28D.01  Them route /notifications (Buyer) va /seller/notifications (Seller)
28D.02  Tu dong tao thong bao khi: don moi, trang thai thay doi, thanh toan den han, RFQ moi, review moi
28D.03  Notification preference: cho phep bat/tat tung loai thong bao (trong Profile settings)
```

---

## =====================================================
## NHOM 29: SO SANH NCC & SUPPLIER SCORECARD
## 16 buoc | Dot 17 | Uu tien TB | MOI
## =====================================================

### 29A. Types & Data (4 buoc)
```
29A.01  Tao interface SupplierScorecard { supplierId, supplierName, qualityScore, deliveryScore, priceScore, communicationScore, overallScore, totalOrders, onTimeDeliveryRate, defectRate, avgResponseTime, certCount }
29A.02  Tao supplierScorecardApi.getScorecard(supplierId) -> SupplierScorecard
29A.03  Tao supplierScorecardApi.compare(supplierIds: string[]) -> SupplierScorecard[]
29A.04  Them mockScorecards (5-6 NCC) vao mockData.ts
```

### 29B. Trang so sanh NCC (8 buoc)
```
29B.01  Tao BuyerSupplierComparePage.tsx — so sanh nhieu NCC cung luc (toi da 4)
29B.02  Chon NCC: combobox multi-select, hoac them tu SupplierListPage (nut "So sanh")
29B.03  Bang so sanh: hang la tieu chi (chat luong, giao hang, gia, giao tiep, tong diem), cot la NCC
29B.04  RadarChart: bieu do radar so sanh diem tung NCC
29B.05  Thong ke: so don hang, ty le giao dung han, ty le loi, thoi gian phan hoi TB
29B.06  Chung chi: so chung chi da xac minh cua moi NCC
29B.07  Highlight NCC tot nhat theo tung tieu chi (text xanh / bold)
29B.08  Responsive: horizontal scroll tren mobile
```

### 29C. Tich hop (4 buoc)
```
29C.01  SupplierDetailPage: them tab "Diem danh gia" — hien thi scorecard chi tiet
29C.02  SupplierListPage: them cot "Diem" va sort theo diem
29C.03  Them route /supplier-compare vao BuyerLayout
29C.04  Them nut "So sanh NCC" tren SupplierListPage (checkbox chon -> nut so sanh)
```

---

## =====================================================
## NHOM 30: YEU CAU MUA HANG NOI BO (PURCHASE REQUISITION)
## 22 buoc | Dot 17-18 | Uu tien CAO | MOI
## =====================================================

### 30A. Types & Data (5 buoc)
```
30A.01  Tao type PRStatus = 'Ban nhap' | 'Cho duyet' | 'Da duyet' | 'Tu choi' | 'Da tao don' | 'Dong'
30A.02  Tao interface PRItem { productId, productName, quantity, estimatedPrice, unit, specification, note }
30A.03  Tao interface PurchaseRequisition { id, prNumber, companyId, requesterId, requesterName, department, items: PRItem[], totalEstimate, priority: 'Thap' | 'Trung binh' | 'Cao' | 'Khan cap', status, justification, approver, approverName, approvedAt?, rejectionNote?, linkedOrderId?, createdAt, updatedAt }
30A.04  Them mockPurchaseRequisitions (6-8 ban ghi) vao mockData.ts
30A.05  Tao prApi: getByCompany, create, update, delete, approve, reject, createOrderFromPR
```

### 30B. Buyer — Tao & Quan ly PR (10 buoc)
```
30B.01  Tao BuyerPRListPage.tsx — danh sach yeu cau mua hang noi bo
30B.02  Stats cards: Tong PR, Cho duyet, Da duyet, Tu choi, Da tao don
30B.03  DataTable: ma PR, nguoi yeu cau, bo phan, so SP, tong tien du kien, trang thai, ngay tao
30B.04  Filter: trang thai, bo phan, do uu tien, khoang ngay, search
30B.05  Tao PR moi: form — bo phan, do uu tien, ly do mua hang, danh sach SP (them nhieu dong)
30B.06  Moi dong SP: ten/ma SP (autocomplete), so luong, gia du kien, ghi chu ky thuat
30B.07  Luu ban nhap: nut "Luu nhap" truoc khi gui duyet
30B.08  Gui duyet: chon nguoi duyet (combobox thanh vien nhom co quyen duyet)
30B.09  Chi tiet PR: dialog voi timeline trang thai, thong tin day du, ghi chu tu nguoi duyet
30B.10  Sau khi duyet: nut "Tao don hang" hoac "Tao RFQ" tu PR da duyet
```

### 30C. Buyer — Duyet PR (4 buoc)
```
30C.01  Tab "Cho toi duyet" tren PRListPage: chi hien PR ma nguoi dung la approver
30C.02  Hanh dong: "Duyet" (voi ghi chu tuy chon), "Tu choi" (ly do bat buoc)
30C.03  Notification: thong bao cho requester khi PR duoc duyet/tu choi
30C.04  Auto-approve: PR < X trieu tu dong duyet (cau hinh trong BuyerTeam settings)
```

### 30D. Tich hop & Routes (3 buoc)
```
30D.01  Them route /purchase-requisitions vao BuyerLayout
30D.02  Them menu "Yeu cau mua" voi icon ClipboardList
30D.03  BuyerDashboard widget: "{N} PR cho duyet" voi link nhanh
```

---

## =====================================================
## NHOM 31: BIEN BAN NHAN HANG & KIEM TRA CHAT LUONG (GRN / QC)
## 18 buoc | Dot 18-19 | Uu tien TB | MOI
## =====================================================

### 31A. Types & Data (5 buoc)
```
31A.01  Tao type GRNStatus = 'Ban nhap' | 'Da xac nhan' | 'Co van de' | 'Da dong'
31A.02  Tao interface GRNItem { productId, productName, orderedQty, receivedQty, acceptedQty, rejectedQty, rejectionReason?, note }
31A.03  Tao interface GoodsReceivedNote { id, grnNumber, orderId, orderNumber, supplierId, supplierName, buyerId, receivedBy, receivedAt, items: GRNItem[], status, overallNote, images: string[], qualityScore: number, createdAt }
31A.04  Them mockGRNs (5-6 ban ghi) vao mockData.ts
31A.05  Tao grnApi: getByBuyer, getBySeller, create, update, confirm, flag
```

### 31B. Buyer — Xac nhan nhan hang (7 buoc)
```
31B.01  Tao dialog "Xac nhan nhan hang" tren OrderDetailPage: chi khi don da giao
31B.02  Form: moi SP — so luong nhan, so luong chap nhan, so luong loi, ly do loi
31B.03  Tong the: diem chat luong tong the (1-5 sao), ghi chu, them anh
31B.04  Tao BuyerGRNListPage.tsx — danh sach bien ban nhan hang
31B.05  DataTable: ma GRN, don hang, NCC, ngay nhan, diem chat luong, trang thai
31B.06  Chi tiet GRN: dialog voi bang chi tiet tung SP, anh, ghi chu
31B.07  Hanh dong: "Xac nhan" (dong GRN), "Bao cao van de" (tao return request tu GRN)
```

### 31C. Seller — Xem GRN (3 buoc)
```
31C.01  Them tab "Nhan hang" tren SellerOrderDetail: hien thi GRN lien quan
31C.02  Thong ke: ty le nhan du / thieu / loi theo thang (BarChart tren SellerDashboard hoac Reports)
31C.03  Canh bao: GRN co van de (banner do), can phan hoi
```

### 31D. Tich hop & Routes (3 buoc)
```
31D.01  Them route /grn vao BuyerLayout + menu "Nhan hang"
31D.02  OrderDetailPage: hien thi trang thai nhan hang (neu co GRN)
31D.03  Lien ket: GRN -> Order -> Shipment -> ReturnRequest
```

---

## =====================================================
## NHOM 32: GHI NO / GHI CO & DOI SOAT (DEBIT/CREDIT NOTES)
## 16 buoc | Dot 19-20 | Uu tien TB | MOI
## =====================================================

### 32A. Types & Data (4 buoc)
```
32A.01  Tao type NoteType = 'Ghi no' | 'Ghi co'
32A.02  Tao type NoteReason = 'Tra hang' | 'Giam gia' | 'Phi phat sinh' | 'Dieu chinh gia' | 'Chenh lech' | 'Khac'
32A.03  Tao interface DebitCreditNote { id, noteNumber, type: NoteType, invoiceId, invoiceNumber, orderId, orderNumber, buyerId, buyerName, supplierId, supplierName, reason, items: { description, quantity, unitPrice, amount }[], subtotal, taxRate, taxAmount, totalAmount, status: 'Ban nhap' | 'Da xuat' | 'Da doi soat' | 'Da huy', note, issuedDate, createdAt }
32A.04  Them mockDebitCreditNotes (6-8 ban ghi) vao mockData.ts
```

### 32B. API Service (3 buoc)
```
32B.01  Tao debitCreditApi.getBySeller(supplierId, pagination, filters) -> PaginatedResponse<DebitCreditNote>
32B.02  Tao debitCreditApi.getByBuyer(buyerId, pagination, filters) -> PaginatedResponse<DebitCreditNote>
32B.03  Tao debitCreditApi.create(data), updateStatus(id, status), getStats(entityId)
```

### 32C. Seller — Quan ly phieu ghi no/co (5 buoc)
```
32C.01  Tao SellerDebitCreditPage.tsx — danh sach phieu ghi no/ghi co
32C.02  Stats cards: Tong phieu, Ghi no, Ghi co, So tien ghi no rong
32C.03  DataTable: ma phieu, loai, hoa don lien ket, buyer, so tien, trang thai, ngay
32C.04  Tao phieu moi: form — loai, chon hoa don lien ket, ly do, danh sach chi tiet, so tien
32C.05  Doi soat: nut "Doi soat" — xac nhan 2 ben da dong y so lieu
```

### 32D. Buyer — Xem phieu ghi no/co (2 buoc)
```
32D.01  Them section "Ghi no / Ghi co" trong BuyerInvoiceListPage hoac tab rieng
32D.02  Chi tiet phieu: dialog voi thong tin day du, hoa don goc, so tien chenh lech
```

### 32E. Tich hop & Routes (2 buoc)
```
32E.01  Them route /seller/debit-credit + menu "Ghi no/co"
32E.02  InvoiceDetail: hien thi phieu ghi no/co lien quan (neu co)
```

---

## =====================================================
## THU TU TRIEN KHAI CHI TIET (20 DOT)
## =====================================================

### DOT 1-3: DA HOAN TAT (Nhom 01-05, 110 buoc)

---

### DOT 4: Ma giam gia + Gio hang nang cao (38 buoc)
```
Buoc 111-112: 06A.01 -> 06A.02  (Promotion API bo sung)
Buoc 113-118: 06B.01 -> 06B.06  (Cart giam gia)
Buoc 119-122: 06C.01 -> 06C.04  (Product khuyen mai)
Buoc 123-126: 06D.01 -> 06D.04  (BuyerPromotionPage)
Buoc 127-136: 07A.01 -> 07A.10  (Cart nang cao)
Buoc 137-144: 07B.01 -> 07B.08  (Checkout nang cao)
Buoc 145-148: 07C.01 -> 07C.04  (Mini Cart)
```

### DOT 5: Seller Dashboard + Reports (phan 1) (34 buoc)
```
Buoc 149-154: 08A.01 -> 08A.06  (Dashboard KPI nang cao)
Buoc 155-162: 08B.01 -> 08B.08  (Dashboard widget)
Buoc 163-166: 08C.01 -> 08C.04  (Dashboard bieu do)
Buoc 167-170: 09A.01 -> 09A.04  (Reports cau truc tabs)
Buoc 171-176: 09B.01 -> 09B.06  (Tab Doanh thu)
Buoc 177-182: 09C.01 -> 09C.06  (Tab San pham)
```

### DOT 6: Reports (tiep) + Seller Profile + Buyer Profile (42 buoc)
```
Buoc 183-186: 09D.01 -> 09D.04  (Tab Khach hang)
Buoc 187-190: 09E.01 -> 09E.04  (Tab Don hang)
Buoc 191-196: 10A.01 -> 10A.06  (Seller Profile tabs)
Buoc 197-202: 10B.01 -> 10B.06  (Thue & Ngan hang)
Buoc 203-206: 10C.01 -> 10C.04  (Cau hinh NCC)
Buoc 207-214: 11A.01 -> 11A.08  (Multi-address)
Buoc 215-220: 11B.01 -> 11B.06  (Buyer Profile tabs)
Buoc 221-224: 11C.01 -> 11C.04  (Profile tich hop)
```

### DOT 7: Bulk Order + ImportDialog (38 buoc)
```
Buoc 225-232: 12A.01 -> 12A.08  (Bulk Order tu file)
Buoc 233-238: 12B.01 -> 12B.06  (Quick Order form)
Buoc 239-240: 12C.01 -> 12C.02  (Bulk Order routes)
Buoc 241-248: 13A.01 -> 13A.08  (ImportDialog)
Buoc 249-252: 13B.01 -> 13B.04  (ExportUtil)
Buoc 253-258: 13C.01 -> 13C.06  (Seller import)
Buoc 259-262: 13D.01 -> 13D.04  (Admin import)
```

### DOT 8: Nang cap Buyer RFQ + Contract (28 buoc)
```
Buoc 263-268: 14A.01 -> 14A.06  (RFQ Create nang cao)
Buoc 269-273: 14B.01 -> 14B.05  (RFQ Detail nang cao)
Buoc 274-276: 14C.01 -> 14C.03  (RFQ List nang cao)
Buoc 277-282: 15A.01 -> 15A.06  (Contract Detail nang cao)
Buoc 283-286: 15B.01 -> 15B.04  (Contract List nang cao)
Buoc 287-290: 15C.01 -> 15C.04  (Contract tu RFQ)
```

### DOT 9: Seller RFQ/Contract + Warehouse (34 buoc)
```
Buoc 291-296: 16A.01 -> 16A.06  (Seller RFQ nang cao)
Buoc 297-302: 16B.01 -> 16B.06  (Seller Contract nang cao)
Buoc 303-306: 16C.01 -> 16C.04  (Seller Contract Create)
Buoc 307-312: 17A.01 -> 17A.06  (Warehouse nang cao)
Buoc 313-318: 17B.01 -> 17B.06  (Xuat nhap kho nang cao)
Buoc 319-324: 17C.01 -> 17C.06  (Ton kho thong minh)
```

### DOT 10: Shipment + Payment nang cao (30 buoc)
```
Buoc 325-332: 18A.01 -> 18A.08  (Seller Shipment nang cao)
Buoc 333-340: 18B.01 -> 18B.08  (Seller Payment nang cao)
Buoc 341-347: 19A.01 -> 19A.07  (Buyer Shipment nang cao)
Buoc 348-354: 19B.01 -> 19B.07  (Buyer Payment nang cao)
```

### DOT 11: Activity Log + UX (phan 1) (22 buoc)
```
Buoc 355-362: 20A.01 -> 20A.08  (SellerActivityPage)
Buoc 363-366: 20B.01 -> 20B.04  (Activity tich hop)
Buoc 367-372: 21A.01 -> 21A.06  (CommandPalette)
Buoc 373-376: 21B.01 -> 21B.04  (Keyboard Shortcuts)
```

### DOT 12: UX (phan 2) + Performance (phan 1) (30 buoc)
```
Buoc 377-380: 21C.01 -> 21C.04  (Toast & Undo)
Buoc 381-384: 21D.01 -> 21D.04  (Empty States)
Buoc 385-390: 21E.01 -> 21E.06  (Micro Interactions)
Buoc 391-396: 22A.01 -> 22A.06  (Code Splitting)
Buoc 397-402: 22B.01 -> 22B.06  (Render Optimization)
Buoc 403-406: 22C.01 -> 22C.04  (Data & Cache)
```

### DOT 13: Accessibility + Buyer Dashboard (30 buoc)
```
Buoc 407-412: 22D.01 -> 22D.06  (Accessibility)
Buoc 413-416: 22E.01 -> 22E.04  (Mobile Optimization)
Buoc 417-420: 23A.01 -> 23A.04  (BuyerDashboard Types & API)
Buoc 421-430: 23B.01 -> 23B.10  (BuyerDashboardPage)
Buoc 431-436: 23C.01 -> 23C.06  (Buyer Dashboard tich hop)
```

### DOT 14: Danh gia & Review + Tra hang (phan 1) (32 buoc)
```
Buoc 437-441: 24A.01 -> 24A.05  (Review Types & API)
Buoc 442-449: 24B.01 -> 24B.08  (Buyer viet danh gia)
Buoc 450-455: 24C.01 -> 24C.06  (Hien thi danh gia)
Buoc 456-458: 24D.01 -> 24D.03  (Review tich hop)
Buoc 459-464: 25A.01 -> 25A.06  (Return Types & Data)
Buoc 465-468: 25B.01 -> 25B.04  (Return API)
```

### DOT 15: Tra hang (tiep) + Tin dung + Team (phan 1) (32 buoc)
```
Buoc 469-474: 25C.01 -> 25C.06  (Buyer tra hang)
Buoc 475-479: 25D.01 -> 25D.05  (Seller xu ly tra hang)
Buoc 480-482: 25E.01 -> 25E.03  (Return routes)
Buoc 483-486: 26A.01 -> 26A.04  (Credit Types & Data)
Buoc 487-492: 26B.01 -> 26B.06  (Seller credit management)
Buoc 493-496: 26C.01 -> 26C.04  (Buyer credit view)
Buoc 497-500: 26D.01 -> 26D.04  (Credit tich hop)
```

### DOT 16: Buyer Team + Thong bao (phan 1) (28 buoc)
```
Buoc 501-505: 27A.01 -> 27A.05  (Team Types & Data)
Buoc 506-508: 27B.01 -> 27B.03  (Team API)
Buoc 509-516: 27C.01 -> 27C.08  (BuyerTeamPage)
Buoc 517-520: 27D.01 -> 27D.04  (Team tich hop)
Buoc 521-524: 28A.01 -> 28A.04  (Notification Types bo sung)
Buoc 525-528: 28B.01 -> 28B.04  (NotificationCenter phan 1)
```

### DOT 17: Thong bao (tiep) + So sanh NCC + PR (phan 1) (30 buoc)
```
Buoc 529-532: 28B.05 -> 28B.08  (NotificationCenter phan 2)
Buoc 533-535: 28C.01 -> 28C.03  (Notification dropdown nang cap)
Buoc 536-538: 28D.01 -> 28D.03  (Notification tich hop)
Buoc 539-542: 29A.01 -> 29A.04  (Scorecard Types & Data)
Buoc 543-550: 29B.01 -> 29B.08  (BuyerSupplierComparePage)
Buoc 551-554: 29C.01 -> 29C.04  (Scorecard tich hop)
Buoc 555-559: 30A.01 -> 30A.05  (PR Types & Data)
Buoc 560-565: 30B.01 -> 30B.06  (PR List phan 1)
```

### DOT 18: PR (tiep) + GRN/QC (27 buoc)
```
Buoc 566-569: 30B.07 -> 30B.10  (PR List phan 2)
Buoc 570-573: 30C.01 -> 30C.04  (PR approval)
Buoc 574-576: 30D.01 -> 30D.03  (PR routes)
Buoc 577-581: 31A.01 -> 31A.05  (GRN Types & Data)
Buoc 582-588: 31B.01 -> 31B.07  (Buyer GRN)
Buoc 589-591: 31C.01 -> 31C.03  (Seller GRN view)
Buoc 592-594: 31D.01 -> 31D.03  (GRN routes)
```

### DOT 19: Ghi no/co + Doi soat (16 buoc)
```
Buoc 595-598: 32A.01 -> 32A.04  (DC Note Types & Data)
Buoc 599-601: 32B.01 -> 32B.03  (DC Note API)
Buoc 602-606: 32C.01 -> 32C.05  (Seller DC Note page)
Buoc 607-608: 32D.01 -> 32D.02  (Buyer DC Note view)
Buoc 609-610: 32E.01 -> 32E.02  (DC Note routes)
```

### DOT 20: Final QA & Clean-up (10 buoc)
```
Buoc 611  Kiem tra toan bo cross-link: RFQ -> Contract -> Order -> Shipment -> Payment -> Invoice -> GRN -> Return -> DC Note
Buoc 612  Kiem tra toan bo CRUD + filter + sort + phan trang cho moi trang
Buoc 613  Kiem tra responsive cho tat ca 35+ trang (mobile/tablet/desktop)
Buoc 614  Fix Sonar violations: unused imports, any types, magic numbers
Buoc 615  Dam bao tat ca file < 2000 dong — tach component neu can
Buoc 616  Kiem tra mock data consistency (IDs, references, dates logic)
Buoc 617  Kiem tra navigation flow Buyer: Home -> Dashboard -> Search -> Product -> Cart -> Checkout -> Order -> Track -> GRN -> Review
Buoc 618  Kiem tra navigation flow Seller: Dashboard -> Order -> Process -> Ship -> Invoice -> Payment -> Report
Buoc 619  Kiem tra navigation flow Admin: Dashboard -> Users -> Products -> Orders -> Payments -> Reports
Buoc 620  Final review: remove console.log, fix TypeScript strict errors, optimize imports
```

---

## =====================================================
## QUY TAC TRIEN KHAI (GIU NGUYEN + BO SUNG)
## =====================================================

### Quy tac co ban (giu nguyen):
1. Moi file khong qua 2000 dong — tach component khi can
2. Tuan thu Sonar: khong any, khong unused vars, khong magic numbers
3. Ke thua code: dung shared components (DataTable, FilterBar, StatusBadge, FormDialog, ImportDialog)
4. Mock API: tat ca API qua service layer, khong truy cap truc tiep mockData
5. Mobile-first: responsive tat ca trang, card view tren mobile
6. Tieng Viet co dau: tat ca label, placeholder, message, error
7. CRUD day du: Create, Read, Update, Delete cho moi entity
8. Filter + Sort + Phan trang: tat ca trang danh sach
9. Export CSV: tat ca trang quan ly co nut xuat CSV
10. Inline edit: cac truong quan trong co the sua nhanh
11. Container wrapper: container mx-auto px-4 py-6
12. Bieu do: dung recharts (BarChart, PieChart, AreaChart, LineChart)
13. Combobox: dung CategoryCombobox pattern cho select phuc tap
14. Toast: dung sonner cho tat ca thong bao
15. Route: dung react-router (KHONG phai react-router-dom)

### Quy tac bo sung (moi):
16. DataTable: luon dung renderActions (khong phai actions), getId, totalItems, pagination, sort, onPaginationChange, onSortChange
17. API pattern: mock voi delay(), filterData(), sortData(), paginate() tu api.ts
18. Stats pattern: moi trang quan ly co stats cards phia tren (theo mau OrderOverview.tsx)
19. Detail pattern: dialog voi DialogHeader + DialogTitle, nut hanh dong ben duoi
20. Status flow: dinh nghia statusNextMap cho cac entity co chuyen trang thai
21. Cross-link: moi entity phai co link den entity lien quan (orderId -> Order, invoiceId -> Invoice, etc.)
22. Lazy load routes: dung React.lazy khi tong so trang > 30
23. Notification: tu dong tao thong bao khi thay doi trang thai quan trong
24. Permission check: kiem tra quyen truoc khi hien thi nut hanh dong (Buyer Team)
25. Error boundary: boc moi trang trong ErrorBoundary

---

## =====================================================
## METRIC HOAN THANH (DU KIEN)
## =====================================================

### Hien tai (sau Dot 3):
- Buyer: 23 trang
- Seller: 22 trang
- Admin: 19 trang
- Shared: 15 component
- Context: 4 (Auth, Cart, Notification, Wishlist)
- Types: ~80 interfaces/types
- Mock data: ~60 arrays

### Sau khi hoan tat (Dot 20):
- Buyer: 33 trang (+10: Dashboard, Promotion, BulkOrder, QuickOrder, Return, GRN, Team, PR, SupplierCompare, NotificationCenter)
- Seller: 26 trang (+4: Activity, Credit, Return, DebitCredit)
- Admin: 19 trang (giu nguyen — da day du)
- Shared: 20 component (+5: ImportDialog, ExportUtil, CommandPalette, EmptyState, DateRangePicker)
- Context: 4 (giu nguyen)
- Types: ~120 interfaces/types (+40)
- Mock data: ~85 arrays (+25)
- Tong file .tsx: ~85 files
- Tong dong code du kien: ~45,000 dong

### Flow kinh doanh hoan chinh:
```
[Buyer]
Purchase Requisition (PR) -> RFQ -> Quotation -> Contract -> Order -> Shipment -> GRN/QC -> Payment -> Invoice -> Review
                                                                                     |
                                                                              Return/Refund -> Debit/Credit Note

[Seller]
Receive RFQ -> Quote -> Contract -> Receive Order -> Approve -> Ship -> Invoice -> Collect Payment
                                                       |
                                              Handle Return -> Issue Credit Note

[Cross-cutting]
- Wishlist, Templates, Bulk Order (ordering helpers)
- Approval Workflow (internal governance)
- Credit Limits (financial governance)
- Team Management (organizational governance)
- Certificates (trust & compliance)
- Promotions (marketing)
- Notifications (communication)
- Activity Log (audit)
- Dashboard & Reports (analytics)
- Command Palette & Shortcuts (productivity)
```

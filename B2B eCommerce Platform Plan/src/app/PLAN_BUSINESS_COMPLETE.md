# KE HOACH HOAN THIEN TINH NANG DOANH NGHIEP THAM GIA SAN
## San TMDT B2B Marketplace — 420 buoc, 22 nhom, 14 dot trien khai

> Ngay lap: 14/03/2026
> Trang thai: Nhom A-H (co ban) da hoan tat, Nhom I-O chua trien khai
> Du an: Buyer (20 trang), Seller (19 trang), Admin (19 trang), Shared (15 component)
> Muc tieu: Hoan thien toan bo tinh nang cap doanh nghiep cho Buyer + Seller

---

## PHAN TICH HIEN TRANG

### Da co (Nhom A-H co ban):
- Buyer: Home, ProductList/Detail, Compare, Cart, OrderList/Detail, SupplierList/Detail, Chat, Profile
- Buyer B2B: RFQList/Create/Detail, ContractList/Detail, ShipmentList, PaymentList
- Seller: Dashboard, ProductList/Form, OrderList/Detail, Profile, Chat
- Seller B2B: RFQList/Detail, ContractList/Detail, Warehouse, ShipmentList, PaymentList, StaffList, Reports, PromotionList
- Admin: Full (19 trang, dang nang cap theo PLAN_ADMIN_COMPLETE.md)
- Shared: DataTable, FilterBar, ViewToggle, CategoryCombobox, FormDialog, StatusBadge, etc.
- Infrastructure: Types, MockData, API Service Layer, Auth/Cart/Notification Context, Routes

### Con thieu / Can hoan thien:
- THIEU HOAN TOAN: Wishlist, Order Template, Phe duyet noi bo, Seller Invoice, Buyer Invoice, ImportDialog, Command Palette
- THIEU TICH HOP: Chung chi trong SellerProfile, Chung chi tren SupplierDetail, Ma giam gia trong Cart, Heart/wishlist tren ProductCard
- CAN NANG CAP: SellerDashboard (them widget), Seller Reports (tach tab), SellerProfile (chung chi + thue), BuyerProfile (dia chi + thong ke)
- CAN MOI: Multi-address, Repeat Order, Bulk Order, So sanh NCC, Thong bao thong minh, Print layout
- CAN TOI UU: Lazy loading routes, Virtual scroll, Debounce, Skeleton, Accessibility, Offline

---

## TONG QUAN 22 NHOM TINH NANG

| #  | Nhom                                     | So buoc | Dot       | Uu tien |
|----|------------------------------------------|---------|-----------|---------|
| 01 | Wishlist & San pham yeu thich            | 22      | D1        | Cao     |
| 02 | Dat hang lap lai & Template              | 20      | D1-D2     | Cao     |
| 03 | Phe duyet noi bo & Workflow (Seller)     | 24      | D2        | Cao     |
| 04 | Hoa don dien tu (Seller + Buyer)         | 26      | D2-D3     | Cao     |
| 05 | Chung chi DN — Seller nop + Buyer xem    | 18      | D3        | TB      |
| 06 | Ma giam gia & Khuyen mai (Buyer side)    | 16      | D3-D4     | TB      |
| 07 | Nang cap Gio hang & Thanh toan           | 22      | D4        | Cao     |
| 08 | Nang cap Seller Dashboard                | 18      | D4-D5     | Cao     |
| 09 | Nang cap Seller Reports — tach tab       | 24      | D5        | Cao     |
| 10 | Nang cap Seller Profile + Cau hinh thue  | 16      | D5-D6     | TB      |
| 11 | Nang cap Buyer Profile & Dia chi         | 18      | D6        | TB      |
| 12 | Dat hang hang loat & Bulk Order          | 16      | D6-D7     | Cao     |
| 13 | Xuat / Nhap du lieu (ImportDialog)       | 22      | D7        | TB      |
| 14 | Nang cap Buyer RFQ flow                  | 14      | D7-D8     | TB      |
| 15 | Nang cap Buyer Contract flow             | 14      | D8        | TB      |
| 16 | Nang cap Seller RFQ & Contract           | 16      | D8-D9     | TB      |
| 17 | Nang cap Seller Warehouse & Inventory    | 18      | D9        | Cao     |
| 18 | Nang cap Seller Shipment & Payment       | 16      | D9-D10    | TB      |
| 19 | Nang cap Buyer Shipment & Payment        | 14      | D10       | TB      |
| 20 | Seller Activity Log & Nhat ky            | 12      | D10-D11   | TB      |
| 21 | UX nang cao & Command Palette            | 24      | D11-D12   | Cao     |
| 22 | Performance & Accessibility              | 26      | D13-D14   | Cao     |

Tong: 420 buoc / 14 dot

---

## =====================================================
## NHOM 01: WISHLIST & SAN PHAM YEU THICH
## 22 buoc | Dot 1 | Uu tien CAO
## =====================================================

### 01A. Types & Data (4 buoc)
```
01A.01  Tao interface WishlistItem { id, userId, productId, productName, productImage, supplierId, supplierName, categoryName, price, minOrderQty, unit, addedAt }
01A.02  Tao interface WishlistFolder { id, userId, name, description, itemCount, createdAt }
01A.03  Them WishlistItem[] vao types/index.ts, WishlistFolder[] vao types/index.ts
01A.04  Them mockWishlistItems (8-10 ban ghi), mockWishlistFolders (3 thu muc: "Yeu thich", "Mua sau", "So sanh gia") vao mockData.ts
```

### 01B. API Service (4 buoc)
```
01B.01  Tao wishlistApi trong api.ts: getByUser(userId) -> WishlistItem[]
01B.02  Tao wishlistApi.add(userId, productId) -> WishlistItem (tu dong lay thong tin SP)
01B.03  Tao wishlistApi.remove(id) -> void
01B.04  Tao wishlistApi.check(userId, productId) -> boolean, moveToCart(id) -> void
```

### 01C. WishlistContext (3 buoc)
```
01C.01  Tao WishlistContext tuong tu CartContext: items, add, remove, isInWishlist, count
01C.02  Wrap App voi WishlistProvider (chi khi da dang nhap)
01C.03  Hook useWishlist(): { items, addToWishlist, removeFromWishlist, isInWishlist, count }
```

### 01D. Buyer — Trang Wishlist (6 buoc)
```
01D.01  Tao BuyerWishlistPage.tsx — danh sach san pham yeu thich
01D.02  ViewToggle: luoi (card) / danh sach (row) — mac dinh luoi tren mobile
01D.03  Hanh dong tung item: xoa, them vao gio, xem chi tiet SP, so sanh
01D.04  Thanh cong cu: "Them tat ca vao gio", "Xoa tat ca", so luong items
01D.05  Sap xep: moi nhat, gia thap -> cao, gia cao -> thap, ten A-Z
01D.06  Empty state: "Ban chua co san pham yeu thich nao. Kham pha ngay!"
```

### 01E. Tich hop Wishlist vao UI hien co (5 buoc)
```
01E.01  Them nut Heart (toggle) tren ProductCard — outline khi chua yeu thich, fill khi da yeu thich
01E.02  Them nut Heart (toggle) tren ProductDetailPage (ben canh nut "Them vao gio")
01E.03  Them nut Heart (toggle) tren ProductComparePage (tung san pham)
01E.04  Them badge so luong wishlist tren Header (BuyerLayout) ben canh icon gio hang
01E.05  Them route /wishlist vao BuyerLayout routes + menu "Yeu thich" voi icon Heart
```

---

## =====================================================
## NHOM 02: DAT HANG LAP LAI & TEMPLATE DON HANG
## 20 buoc | Dot 1-2 | Uu tien CAO
## =====================================================

### 02A. Types & Data (4 buoc)
```
02A.01  Tao interface OrderTemplate { id, userId, name, description, items: OrderTemplateItem[], supplierId, supplierName, lastUsed, usageCount, createdAt, updatedAt }
02A.02  Tao interface OrderTemplateItem { productId, productName, productImage, quantity, unitPrice, unit }
02A.03  Them OrderTemplate[] vao types
02A.04  Them mockOrderTemplates (4-5 template) vao mockData.ts
```

### 02B. API Service (4 buoc)
```
02B.01  Tao templateApi.getByUser(userId) -> OrderTemplate[]
02B.02  Tao templateApi.create(data) -> OrderTemplate
02B.03  Tao templateApi.update(id, data), delete(id) -> void
02B.04  Tao templateApi.createOrderFromTemplate(templateId) -> Order (tao don moi tu template, cap nhat gia hien tai)
```

### 02C. Buyer — Trang Template (7 buoc)
```
02C.01  Tao BuyerOrderTemplatePage.tsx — danh sach template don hang
02C.02  DataTable: ten template, NCC, so SP, lan dung cuoi, so lan da dung
02C.03  Tao template moi: form ten, mo ta, chon NCC, them nhieu SP + so luong
02C.04  Sua template: thay doi SP, so luong (inline edit)
02C.05  Xoa template: dialog xac nhan
02C.06  Dat hang tu template: nut "Dat lai" -> tao don hang moi voi SP tu template, gia cap nhat
02C.07  Empty state: "Ban chua co template nao. Tao template tu don hang da dat!"
```

### 02D. Tich hop vao Don hang cu (5 buoc)
```
02D.01  Them nut "Luu lam Template" tren OrderDetailPage (Buyer) — chi khi don da giao
02D.02  Them nut "Dat lai" tren OrderDetailPage — tao don moi voi cung SP
02D.03  Them nut "Dat lai" tren OrderListPage — icon nhanh moi dong
02D.04  Khi "Dat lai": hien thi dialog xac nhan voi danh sach SP + gia moi (co the thay doi)
02D.05  Them route /templates vao BuyerLayout + menu "Don hang mau"
```

---

## =====================================================
## NHOM 03: PHE DUYET NOI BO & WORKFLOW (SELLER)
## 24 buoc | Dot 2 | Uu tien CAO
## =====================================================

### 03A. Types & Data (5 buoc)
```
03A.01  Tao type ApprovalStatus = 'Cho duyet' | 'Da duyet' | 'Tu choi'
03A.02  Tao type ApprovalType = 'Don hang' | 'Bao gia' | 'Hop dong' | 'San pham' | 'Xuat kho'
03A.03  Tao interface ApprovalRequest { id, type: ApprovalType, referenceId, referenceName, referenceAmount?, requestedBy, requestedByName, approver, approverName, status: ApprovalStatus, note, responseNote?, createdAt, respondedAt?, supplierId }
03A.04  Tao interface ApprovalRule { id, supplierId, type: ApprovalType, condition: 'amount_gt' | 'always', threshold?: number, approverRole: StaffRole, isActive: boolean, createdAt }
03A.05  Them mockApprovalRequests (8-10), mockApprovalRules (5-6) vao mockData.ts
```

### 03B. API Service (4 buoc)
```
03B.01  Tao approvalApi.getBySeller(supplierId, pagination, filters) -> PaginatedResponse<ApprovalRequest>
03B.02  Tao approvalApi.getByApprover(userId) -> ApprovalRequest[]
03B.03  Tao approvalApi.approve(id, note) -> ApprovalRequest, reject(id, note) -> ApprovalRequest
03B.04  Tao approvalApi.getRules(supplierId), createRule(data), updateRule(id, data), deleteRule(id)
```

### 03C. Seller — Phe duyet (10 buoc)
```
03C.01  Tao SellerApprovalListPage.tsx — danh sach yeu cau can duyet (DataTable)
03C.02  Tab: "Cho duyet" / "Da xu ly" / "Tat ca"
03C.03  Stats card: tong cho duyet, da duyet hom nay, tu choi hom nay, trung binh thoi gian xu ly
03C.04  Filter: loai (don hang/bao gia/hop dong/SP/xuat kho), trang thai, nguoi yeu cau, khoang ngay
03C.05  Chi tiet yeu cau: hien thi thong tin tham chieu (don hang/bao gia lien quan), so tien, ghi chu
03C.06  Hanh dong: Duyet (voi ghi chu tuy chon), Tu choi (voi ly do bat buoc)
03C.07  Tao SellerApprovalRulesPage.tsx — cau hinh quy tac phe duyet
03C.08  CRUD quy tac: loai, dieu kien (tong tien > X), nguoi duyet (theo vai tro), bat/tat
03C.09  Preview quy tac: "Don hang > 50 trieu -> Chu DN phai duyet"
03C.10  Validation: khong duoc tao trung quy tac, threshold > 0
```

### 03D. Tich hop & Routes (5 buoc)
```
03D.01  Tich hop: khi NCC tao bao gia > threshold -> tu dong tao ApprovalRequest
03D.02  Tich hop: khi nhan vien xac nhan don hang > threshold -> cho duyet
03D.03  SellerDashboard widget: "{N} yeu cau cho duyet" voi link nhanh
03D.04  Them routes: /seller/approvals, /seller/approvals/rules
03D.05  Them menu SellerLayout: "Phe duyet" voi badge dem
```

---

## =====================================================
## NHOM 04: HOA DON DIEN TU (SELLER + BUYER)
## 26 buoc | Dot 2-3 | Uu tien CAO
## =====================================================

### 04A. API Service bo sung (3 buoc)
```
04A.01  Tao invoiceSellerApi trong api.ts: getBySeller(supplierId, pagination, sort, filters) -> PaginatedResponse<Invoice>
04A.02  Tao invoiceSellerApi.createFromOrder(orderId) -> Invoice (tu dong dien thong tin tu order)
04A.03  Tao invoiceSellerApi.updateStatus(id, status), sendEmail(id) -> void (gia lap)
```

### 04B. Seller — Quan ly hoa don (14 buoc)
```
04B.01  Tao SellerInvoiceListPage.tsx — danh sach hoa don cua NCC
04B.02  Stats card: tong hoa don, da xuat, cho thanh toan, qua han, tong doanh thu
04B.03  DataTable: so HD, don hang lien ket, ben mua, tong tien, thue, trang thai, ngay xuat, han thanh toan
04B.04  Filter: trang thai, loai (Ban hang/Tra hang/Dieu chinh), khoang ngay, ben mua
04B.05  Search: ma hoa don, ten ben mua, ma don hang
04B.06  Tao hoa don tu don hang: nut "Xuat hoa don" — form voi thong tin tu dong dien
04B.07  Form tao hoa don: thong tin ben ban (tu TaxConfig), ben mua (tu order), danh sach hang hoa
04B.08  Tinh thue tu dong: GTGT 10%, xuat khau 0%, editable
04B.09  Inline edit: trang thai hoa don (Ban nhap -> Da xuat -> Da gui)
04B.10  Xem truoc hoa don: dialog voi layout in an chuyen nghiep (bang, logo, thong tin thue)
04B.11  In hoa don: CSS @media print layout (nut "In")
04B.12  GUI email hoa don (gia lap): toast xac nhan
04B.13  Xuat CSV danh sach hoa don
04B.14  Card view tren mobile (responsive)
```

### 04C. Buyer — Xem hoa don (6 buoc)
```
04C.01  Tao BuyerInvoiceListPage.tsx — danh sach hoa don nhan duoc
04C.02  DataTable: so HD, NCC, tong tien, thue, trang thai, ngay xuat, han thanh toan
04C.03  Filter: trang thai, khoang ngay, NCC
04C.04  Chi tiet hoa don: dialog xem chi tiet + layout in an
04C.05  Lien ket: click ma don hang -> OrderDetailPage
04C.06  Them route /invoices vao BuyerLayout + menu "Hoa don"
```

### 04D. Routes & Tich hop (3 buoc)
```
04D.01  Them route /seller/invoices vao SellerLayout
04D.02  Them menu SellerLayout: "Hoa don" voi icon FileText
04D.03  Them tab "Hoa don" trong Buyer OrderDetailPage — hien thi hoa don lien quan
```

---

## =====================================================
## NHOM 05: CHUNG CHI DN — SELLER NOP + BUYER XEM
## 18 buoc | Dot 3 | Uu tien TB
## =====================================================

### 05A. Seller — Nop chung chi (8 buoc)
```
05A.01  Them section "Chung chi doanh nghiep" trong SellerProfile.tsx (duoi thong tin cong ty)
05A.02  Hien thi danh sach chung chi da nop: ten, loai, co quan cap, ngay het han, trang thai
05A.03  StatusBadge cho tung chung chi: Chua xac minh / Dang xem xet / Da xac minh / Tu choi / Het han
05A.04  Form nop chung chi moi: dialog voi cac truong: loai (select), ten, co quan cap, ngay cap, ngay het han, URL tai lieu (input)
05A.05  Validation: ten bat buoc, ngay het han > ngay cap, URL hop le
05A.06  Xoa chung chi: chi khi trang thai "Chua xac minh" hoac "Tu choi"
05A.07  Canh bao: banner vang "X chung chi sap het han trong 30 ngay"
05A.08  Canh bao: banner do "X chung chi da het han — vui long cap nhat"
```

### 05B. Buyer — Xem chung chi NCC (6 buoc)
```
05B.01  Them tab "Chung chi" trong SupplierDetailPage.tsx (ben canh tab "San pham", "Danh gia")
05B.02  Danh sach chung chi da xac minh: ten, loai, co quan cap, ngay het han
05B.03  Badge "Da xac minh" mau xanh cho chung chi hop le
05B.04  Badge "Het han" mau do cho chung chi qua han
05B.05  Hien thi tong so chung chi hop le trong header NCC: "12 chung chi da xac minh"
05B.06  Them icon ShieldCheck xanh ben canh ten NCC tren SupplierListPage khi co >= 3 chung chi hop le
```

### 05C. Tich hop (4 buoc)
```
05C.01  API: certificateApi.getBySeller(supplierId) — da co
05C.02  Them truong certificateCount vao Supplier type (computed tu API)
05C.03  SellerDashboard: widget "Chung chi" — so hop le / tong, canh bao het han
05C.04  Admin: da co AdminCertificateReview — kiem tra va dam bao lien ket dung
```

---

## =====================================================
## NHOM 06: MA GIAM GIA & KHUYEN MAI (BUYER SIDE)
## 16 buoc | Dot 3-4 | Uu tien TB
## =====================================================

### 06A. Cart — Ap dung ma giam gia (6 buoc)
```
06A.01  Them section "Ma giam gia" trong CartPage: input + nut "Ap dung"
06A.02  Goi promotionApi.validate(code, cartItems) — kiem tra ma hop le
06A.03  Hien thi ket qua: ten khuyen mai, loai giam gia, so tien giam, dieu kien ap dung
06A.04  Neu hop le: tru so tien giam vao tong don hang, hien thi dong "Giam gia" mau xanh
06A.05  Neu khong hop le: hien thi loi cu the (het han, don chua du, da su dung het)
06A.06  Nut "Xoa ma giam gia" — quay ve gia goc
```

### 06B. ProductDetail — Hien thi khuyen mai (4 buoc)
```
06B.01  Them section "Khuyen mai hien co" tren ProductDetailPage (duoi gia)
06B.02  Danh sach khuyen mai ap dung cho SP nay: ten, ma, dieu kien, han su dung
06B.03  Nut "Sao chep ma" (copy to clipboard)
06B.04  Badge "Khuyen mai" tren ProductCard khi SP co khuyen mai dang hoat dong
```

### 06C. Trang Khuyen mai (6 buoc)
```
06C.01  Tao BuyerPromotionPage.tsx — danh sach tat ca khuyen mai dang co tren san
06C.02  Card layout: moi khuyen mai la 1 card (ten, NCC, giam bao nhieu, dieu kien, han dung)
06C.03  Filter: NCC, loai giam gia (phan tram/so tien), danh muc san pham
06C.04  Search: theo ten khuyen mai, ma
06C.05  Nut "Sao chep ma" tren moi card
06C.06  Them route /promotions vao BuyerLayout + menu "Khuyen mai"
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
07A.06  Tinh phi van chuyen du kien theo NCC (gia lap)
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
07C.04  Animation khi them SP vao gio (icon gio hang nhay)
```

---

## =====================================================
## NHOM 08: NANG CAP SELLER DASHBOARD
## 18 buoc | Dot 4-5 | Uu tien CAO
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
08B.07  Widget "Phe duyet cho xu ly" — so yeu cau dang cho (link den Approvals)
08B.08  Widget "Chung chi sap het han" — chung chi con < 30 ngay
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
## 24 buoc | Dot 5 | Uu tien CAO
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
09C.05  Treemap chart: phan bo doanh thu theo danh muc
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
## 16 buoc | Dot 5-6 | Uu tien TB
## =====================================================

### 10A. Profile nang cao (6 buoc)
```
10A.01  Tach SellerProfile thanh Tabs: "Thong tin" / "Chung chi" / "Thue & Ngan hang" / "Cau hinh"
10A.02  Tab Thong tin: giu nguyen form hien tai, them truong mo ta dai (rich text)
10A.03  Tab Thong tin: upload logo va cover (gia lap — input URL + preview)
10A.04  Tab Chung chi: = Nhom 05A (da lam)
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
## 18 buoc | Dot 6 | Uu tien TB
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
## 16 buoc | Dot 6-7 | Uu tien CAO
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
12C.02  Them menu "Dat hang nhanh" va "Dat hang tu file" vao dropdown hoac sidebar
```

---

## =====================================================
## NHOM 13: XUAT / NHAP DU LIEU (ImportDialog)
## 22 buoc | Dot 7 | Uu tien TB
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
## 14 buoc | Dot 7-8 | Uu tien TB
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
## 14 buoc | Dot 8 | Uu tien TB
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
## 16 buoc | Dot 8-9 | Uu tien TB
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
## 18 buoc | Dot 9 | Uu tien CAO
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
## 16 buoc | Dot 9-10 | Uu tien TB
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
## 14 buoc | Dot 10 | Uu tien TB
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
## 12 buoc | Dot 10-11 | Uu tien TB
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
## 26 buoc | Dot 13-14 | Uu tien CAO
## =====================================================

### 22A. Code Splitting & Lazy Loading (6 buoc)
```
22A.01  React.lazy + Suspense cho tat ca route pages (Buyer 20 trang)
22A.02  React.lazy cho tat ca route pages (Seller 19 trang)
22A.03  React.lazy cho tat ca route pages (Admin 19 trang)
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
22B.05  Virtual scrolling cho danh sach > 50 items (ProductList, OrderList) — dung react-virtual
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
## THU TU TRIEN KHAI CHI TIET (14 DOT)
## =====================================================

### DOT 1: Wishlist + Order Template Types/API + Pages
```
Buoc 1-4:     01A.01 -> 01A.04  (Wishlist Types & Data)
Buoc 5-8:     01B.01 -> 01B.04  (Wishlist API)
Buoc 9-11:    01C.01 -> 01C.03  (WishlistContext)
Buoc 12-17:   01D.01 -> 01D.06  (BuyerWishlistPage)
Buoc 18-22:   01E.01 -> 01E.05  (Wishlist tich hop UI)
Buoc 23-26:   02A.01 -> 02A.04  (Template Types & Data)
Buoc 27-30:   02B.01 -> 02B.04  (Template API)
```

### DOT 2: Order Template Pages + Phe duyet noi bo
```
Buoc 31-37:   02C.01 -> 02C.07  (BuyerOrderTemplatePage)
Buoc 38-42:   02D.01 -> 02D.05  (Template tich hop)
Buoc 43-47:   03A.01 -> 03A.05  (Approval Types & Data)
Buoc 48-51:   03B.01 -> 03B.04  (Approval API)
Buoc 52-61:   03C.01 -> 03C.10  (SellerApprovalListPage + Rules)
Buoc 62-66:   03D.01 -> 03D.05  (Approval tich hop & routes)
```

### DOT 3: Hoa don dien tu + Chung chi
```
Buoc 67-69:   04A.01 -> 04A.03  (Invoice Seller API)
Buoc 70-83:   04B.01 -> 04B.14  (SellerInvoiceListPage)
Buoc 84-89:   04C.01 -> 04C.06  (BuyerInvoiceListPage)
Buoc 90-92:   04D.01 -> 04D.03  (Invoice routes)
Buoc 93-100:  05A.01 -> 05A.08  (Seller chung chi)
Buoc 101-106: 05B.01 -> 05B.06  (Buyer xem chung chi)
Buoc 107-110: 05C.01 -> 05C.04  (Chung chi tich hop)
```

### DOT 4: Ma giam gia Buyer + Gio hang nang cao
```
Buoc 111-116: 06A.01 -> 06A.06  (Cart giam gia)
Buoc 117-120: 06B.01 -> 06B.04  (Product khuyen mai)
Buoc 121-126: 06C.01 -> 06C.06  (BuyerPromotionPage)
Buoc 127-136: 07A.01 -> 07A.10  (Cart nang cao)
Buoc 137-144: 07B.01 -> 07B.08  (Checkout nang cao)
Buoc 145-148: 07C.01 -> 07C.04  (Mini Cart)
```

### DOT 5: Seller Dashboard + Reports nang cao
```
Buoc 149-154: 08A.01 -> 08A.06  (Dashboard KPI nang cao)
Buoc 155-162: 08B.01 -> 08B.08  (Dashboard widget)
Buoc 163-166: 08C.01 -> 08C.04  (Dashboard bieu do)
Buoc 167-170: 09A.01 -> 09A.04  (Reports cau truc tabs)
Buoc 171-176: 09B.01 -> 09B.06  (Tab Doanh thu)
Buoc 177-182: 09C.01 -> 09C.06  (Tab San pham)
```

### DOT 6: Reports (tiep) + Seller Profile + Buyer Profile
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

### DOT 7: Bulk Order + ImportDialog
```
Buoc 225-232: 12A.01 -> 12A.08  (Bulk Order tu file)
Buoc 233-238: 12B.01 -> 12B.06  (Quick Order form)
Buoc 239-240: 12C.01 -> 12C.02  (Bulk Order routes)
Buoc 241-248: 13A.01 -> 13A.08  (ImportDialog)
Buoc 249-252: 13B.01 -> 13B.04  (ExportUtil)
Buoc 253-258: 13C.01 -> 13C.06  (Seller import)
Buoc 259-262: 13D.01 -> 13D.04  (Admin import)
```

### DOT 8: Nang cap Buyer RFQ + Contract
```
Buoc 263-268: 14A.01 -> 14A.06  (RFQ Create nang cao)
Buoc 269-273: 14B.01 -> 14B.05  (RFQ Detail nang cao)
Buoc 274-276: 14C.01 -> 14C.03  (RFQ List nang cao)
Buoc 277-282: 15A.01 -> 15A.06  (Contract Detail nang cao)
Buoc 283-286: 15B.01 -> 15B.04  (Contract List nang cao)
Buoc 287-290: 15C.01 -> 15C.04  (Contract tu RFQ)
```

### DOT 9: Nang cap Seller RFQ/Contract + Warehouse
```
Buoc 291-296: 16A.01 -> 16A.06  (Seller RFQ nang cao)
Buoc 297-302: 16B.01 -> 16B.06  (Seller Contract nang cao)
Buoc 303-306: 16C.01 -> 16C.04  (Seller Contract Create)
Buoc 307-312: 17A.01 -> 17A.06  (Warehouse nang cao)
Buoc 313-318: 17B.01 -> 17B.06  (Xuat nhap kho nang cao)
Buoc 319-324: 17C.01 -> 17C.06  (Ton kho thong minh)
```

### DOT 10: Nang cap Shipment/Payment + Activity
```
Buoc 325-332: 18A.01 -> 18A.08  (Seller Shipment nang cao)
Buoc 333-340: 18B.01 -> 18B.08  (Seller Payment nang cao)
Buoc 341-347: 19A.01 -> 19A.07  (Buyer Shipment nang cao)
Buoc 348-354: 19B.01 -> 19B.07  (Buyer Payment nang cao)
```

### DOT 11: Seller Activity + UX (phan 1)
```
Buoc 355-362: 20A.01 -> 20A.08  (SellerActivityPage)
Buoc 363-366: 20B.01 -> 20B.04  (Activity tich hop)
Buoc 367-372: 21A.01 -> 21A.06  (CommandPalette)
Buoc 373-376: 21B.01 -> 21B.04  (Keyboard Shortcuts)
```

### DOT 12: UX (phan 2)
```
Buoc 377-380: 21C.01 -> 21C.04  (Toast & Undo)
Buoc 381-384: 21D.01 -> 21D.04  (Empty States)
Buoc 385-390: 21E.01 -> 21E.06  (Micro Interactions)
```

### DOT 13: Performance
```
Buoc 391-396: 22A.01 -> 22A.06  (Code Splitting & Lazy Loading)
Buoc 397-402: 22B.01 -> 22B.06  (Render Optimization)
Buoc 403-406: 22C.01 -> 22C.04  (Data & Cache)
```

### DOT 14: Accessibility & Mobile
```
Buoc 407-412: 22D.01 -> 22D.06  (Accessibility)
Buoc 413-416: 22E.01 -> 22E.04  (Mobile Optimization)
Buoc 417-420: Final QA — kiem tra toan bo flow, fix bug, clean up code
```

---

## =====================================================
## QUY TAC TRIEN KHAI
## =====================================================

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

---

## =====================================================
## METRIC HOAN THANH
## =====================================================

- Buyer: 20 trang hien tai -> 26 trang (them Wishlist, Template, Invoice, Promotion, BulkOrder, QuickOrder)
- Seller: 19 trang hien tai -> 22 trang (them Approval, ApprovalRules, Invoice, Activity)
- Shared: 15 component hien tai -> 19 component (them ImportDialog, ExportUtil, CommandPalette, EmptyState)
- Context: 3 context hien tai -> 4 context (them WishlistContext)
- Toan bo flow B2B: RFQ -> Bao gia -> Hop dong -> Don hang -> Van chuyen -> Thanh toan -> Hoa don
- Cross-link: moi entity lien ket den entity lien quan (RFQ -> Contract -> Order -> Shipment -> Payment -> Invoice)

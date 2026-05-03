# ============================================================
# KE HOACH HOAN THIEN GIAO DIEN CHI TIET
# B2B Marketplace — "Dep hon, Hien dai hon, Chuyen nghiep hon, De dung hon"
# ~520 buoc | 14 Giai doan (P1–P14) | ~52 dot
# ============================================================
#
# TRANG THAI: DANG TRIEN KHAI P6 DOT 16 (150/520 buoc)
# DA HOAN THANH: P1 Dot 1 ✅, P1 Dot 2 ✅, P2 Dot 3 ✅, P2 Dot 4 ✅, P2 Dot 5 ✅, P3 Dot 6 ✅, P3 Dot 7 ✅, P3 Dot 8 ✅, P3 Dot 9 ✅, P4 Dot 10 ✅, P4 Dot 11 ✅, P4 Dot 12 ✅, P5 Dot 13 ✅, P5 Dot 14 ✅, P5 Dot 15 ✅
#
# TIEN QUYET: Da hoan thanh UI-A→E Dot 1-19 (190 buoc)
# BAO GOM:
#   - Theme, Font, Spacing, Icons (UI-A)
#   - DataTable, FilterBar, FormDialog, Card, Notification (UI-B)
#   - Mega Menu, Header, Seller/Admin Sidebar (UI-C)
#   - HomePage, Auth Pages (UI-D)
#   - Product, Cart, Order, RFQ (UI-E17-19)
#
# NGUYEN TAC:
#   1. Khong pha vo logic/data da co — chi nang cap visual + UX
#   2. Moi file khong qua 2000 dong
#   3. Uu tien shared component de tat ca trang huong loi
#   4. Mobile-first, WCAG AA, Performance
#   5. Giu tieng Viet co dau
#   6. Moi dot ~10 buoc, implement tuan tu khi user prompt "Tiep tuc"
# ============================================================

---

## ========================================================
## P1: BUYER DASHBOARD & ANALYTICS (20 buoc | Dot 1–2)
## ========================================================

### P1 Dot 1: Buyer Dashboard Redesign (10 buoc)
```
P1.01  Stats row: dung StatsCard moi (gradient left-border, IconWrapper, AnimatedNumber, TrendIndicator), 4 cards: Tong don, Cho xu ly, Da giao, Tong chi tieu
P1.02  Quick actions: grid 2x4 icon cards (Dat don, Gio hang, Bao gia, Hop dong, Tra hang, Thanh toan, Kho, Bao cao) voi hover scale + shadow, mobile 2x4 nho
P1.03  Chart "Chi tieu theo thang": Area chart gradient fill, them chart type toggle (Line/Bar/Area), tooltip card dep
P1.04  Recent orders widget: DashboardWidget wrapper + table rows voi StatusBadge dot, time relative, amount aligned right, hover row highlight
P1.05  "Can xu ly" widget: card list voi icon mau (cam=cho duyet, do=qua han, xanh=moi) + badge count + link toi trang
P1.06  "Nhac nho" widget: deadline cards (hop dong sap het, thanh toan qua han) voi icon AlertTriangle, countdown ngay
P1.07  Date range picker: button group (7 ngay / 30 ngay / 90 ngay / Tuy chon) o goc phai tren, ap dung cho stats + chart
P1.08  Welcome banner: gradient card "Chao {ten}, hom nay ban co {X} don moi, {Y} can xu ly" voi avatar
P1.09  Mobile: 1 col stack, stats 2x2, chart full width, widget cards scrollable horizontal
P1.10  Skeleton loading: StatsCard skeleton (pulse bars), chart skeleton (wave), table skeleton (rows shimmer)
```

### P1 Dot 2: Buyer Analytics Page (10 buoc)
```
P1.11  Page header: font-heading, icon BarChart3, subtitle "Phan tich hoat dong mua hang cua ban"
P1.12  Stats overview: 6 metric cards (Tong don, Tong tien, TB/don, NCC da mua, SP da mua, Ti le hoan tra) voi ProgressRing
P1.13  "Chi tieu theo danh muc" pie/donut chart: gradient segments, legend ben phai, click segment drill-down mock
P1.14  "Top NCC" horizontal bar chart: avatar + ten NCC + bar + so tien, sorted desc, top 10
P1.15  "Xu huong dat hang" line chart: dual axis (so don + gia tri), 12 thang, tooltip chi tiet
P1.16  "So sanh thang truoc" comparison cards: metric + % thay doi + arrow up/down, mau xanh/do
P1.17  Export buttons: "Xuat PDF" + "Xuat Excel" voi icon, variant outline, disabled state khi dang xuat
P1.18  Filter controls: date range + NCC combobox + danh muc combobox, ap dung cho tat ca chart
P1.19  Mobile: chart stack doc, legend nam duoi chart, stats cards 2x3
P1.20  Chart animation: bars grow up, pie segments expand, lines draw left-to-right khi mount
```

---

## ========================================================
## P2: BUYER FINANCE & CONTRACT PAGES (30 buoc | Dot 3–5)
## ========================================================

### P2 Dot 3: Contract Pages (10 buoc)
```
P2.01  ContractList: card layout voi icon trang thai trai (ShieldCheck xanh, Clock vang, XCircle do), thong tin giua, ngay + gia tri phai
P2.02  ContractList: them status tabs (Tat ca | Hieu luc | Sap het han | Da het | Huy), badge count
P2.03  ContractList: them grid view voi card co progress bar (% milestone hoan thanh), gia tri hop dong lon
P2.04  ContractDetail: contract status timeline ngang (Tao -> Duyet -> Ky -> Thuc hien -> Hoan thanh) voi icon + date
P2.05  ContractDetail: milestones section voi progress bar tong the (X/Y), tung milestone co checkbox + ten + deadline + status
P2.06  ContractDetail: them "Phu luc" section dep — list file voi icon file type (PDF/Word/Excel), size, download button
P2.07  ContractDetail: terms & conditions accordion — moi clause la 1 collapsible item
P2.08  ContractDetail: print layout — header cong ty, footer trang, format A4
P2.09  ContractDetail: them "Lich su thay doi" timeline doc — ai da thay doi gi, luc nao
P2.10  Mobile: ContractDetail tabs -> accordion, timeline ngang -> doc, milestones full width
```

### P2 Dot 4: Invoice & Payment Pages (10 buoc)
```
P2.11  InvoiceList: them summary bar o tren — 3 metric cards (Tong chua TT, Da TT, Qua han) voi mau
P2.12  InvoiceList: overdue row highlight — bg-red-50 dark:bg-red-950/10, badge "Qua han X ngay"
P2.13  InvoiceList: them quick filter buttons (Tat ca | Chua TT | Da TT | Qua han) tuong tu status tabs
P2.14  InvoiceDetail: print preview layout giong hoa don thuc — header cong ty, bang items, tong, footer
P2.15  PaymentList: them calendar view icon — toggle giua table va calendar, calendar highlight ngay den han
P2.16  PaymentList: them payment summary 3 cards — Tong no, Da tra thang nay, Con lai
P2.17  PaymentDetail: them QR code mock cho chuyen khoan, them thong tin ngan hang
P2.18  PaymentDetail: them timeline thanh toan — Tao hoa don -> Gui -> Nhan TT -> Hoan tat
P2.19  Them bulk payment UI: checkbox select nhieu invoice -> "Thanh toan X hoa don" button -> confirm dialog
P2.20  Mobile: summary cards 1 col stack, table -> card list, calendar -> list view
```

### P2 Dot 5: Budget & Credit Pages (10 buoc)
```
P2.21  BudgetPage: redesign header — them circular gauge chart "Da su dung X%" (ProgressRing lon)
P2.22  BudgetPage: budget allocation pie chart theo danh muc, click segment hien detail
P2.23  BudgetPage: them "Canh bao ngan sach" cards — tieu qua 80% -> vang, 95% -> do
P2.24  BudgetPage: them sparkline mini charts cho trend su dung theo tuan
P2.25  CreditSection: credit utilization gauge lon (ProgressRing), han muc / da dung / con lai
P2.26  CreditSection: them "Lich su giao dich tin dung" timeline dep — ngay + so tien + mo ta
P2.27  CreditSection: status card dep — "Tin dung tot" voi icon check xanh, "Can chu y" voi icon canh bao
P2.28  CreditSection: them chart line "Bien dong tin dung" theo thang
P2.29  BudgetPage: mobile — gauge chart full width, pie chart ben duoi, cards stack
P2.30  CreditSection: mobile — gauge center, timeline full width, text lon de doc
```

---

## ========================================================
## P3: BUYER REMAINING PAGES (40 buoc | Dot 6–9)
## ========================================================

### P3 Dot 6: Wishlist, Supplier, Compare (10 buoc)
```
P3.01  WishlistPage: masonry grid layout (react-responsive-masonry), image lon aspect-[3/4], overlay gradient + heart icon
P3.02  WishlistPage: them "Bo suu tap" tabs — cho phep nhom wishlist (Mac dinh, Van phong pham, Nguyen lieu, ...)
P3.03  WishlistPage: them "So sanh gia" inline — hien gia hien tai vs gia khi them vao wishlist
P3.04  SupplierList: card voi cover image banner, avatar tron, stats 3 col (SP, Rating, Don), CTA "Lien he"
P3.05  SupplierList: them "Da xac minh" badge noi bat, rating stars 5 sao voi so review
P3.06  SupplierDetail: hero header — cover image + avatar overlap + ten cong ty + badge + rating
P3.07  SupplierDetail: tabs (Tong quan | San pham | Danh gia | Lien he) voi animated tab content
P3.08  SupplierDetail: "Tong quan" — stats grid + mo ta + chung chi + dia chi map mock
P3.09  ProductCompare: fixed header sticky khi scroll, highlight gia tot nhat (xanh), gia cao nhat (do nhe)
P3.10  ProductCompare: mobile — horizontal scroll table, first col (ten feature) fixed left
```

### P3 Dot 7: Bulk Order, Quick Order, Templates (10 buoc)
```
P3.11  BulkOrderPage: drag-drop upload area dep — dashed border animated, icon Upload lon, text huong dan, supported formats
P3.12  BulkOrderPage: them preview table sau upload — hien SP nhan dien duoc, highlight loi (SP khong tim thay)
P3.13  BulkOrderPage: them template download button — "Tai file mau Excel/CSV"
P3.14  QuickOrderPage: autocomplete input dep — search icon, dropdown voi image thumbnail + ten + gia, keyboard nav
P3.15  QuickOrderPage: them "SP hay mua" suggestion grid — 6 cards tu order history
P3.16  QuickOrderPage: them "Quet ma QR/Barcode" button mock — icon Camera + Barcode
P3.17  OrderTemplatePage: them template card dep — icon Template, ten, so SP, NCC, CTA "Su dung" + "Sua"
P3.18  OrderTemplatePage: them "Tao tu don hang" flow — chon don cu -> tao template
P3.19  Mobile: upload area full width, preview table -> card list, autocomplete full screen overlay
P3.20  BulkOrderPage: them progress bar upload voi % + toc do
```

### P3 Dot 8: Reviews, Returns, Warranty (10 buoc)
```
P3.21  ReviewsPage: them star distribution chart — 5 bars horizontal (5 sao -> 1 sao) voi %, average score lon
P3.22  ReviewsPage: them filter by stars — click vao bar de filter, them "Co hinh anh" filter
P3.23  ReviewsPage: review card dep — avatar + ten + rating stars + date + comment + image gallery inline
P3.24  ReviewsPage: them "Danh gia cua toi" tab vs "Tat ca danh gia"
P3.25  ReturnList: them status tabs (Cho duyet | Dang tra | Hoan tien | Tu choi), return reason pie chart mini
P3.26  ReturnList: card voi image SP, ly do, so tien hoan, progress steps (Gui -> Duyet -> Nhan -> Hoan tien)
P3.27  WarrantyPage: them warranty card UI — giong the bao hanh (ten SP, serial, ngay het han, trang thai)
P3.28  WarrantyPage: them "Sap het bao hanh" alert — badge do cho SP sap het han, countdown ngay
P3.29  WarrantyPage: them claim form dep — multi-step (Chon SP -> Mo ta loi -> Gui hinh -> Xac nhan)
P3.30  Mobile: review cards full width, return cards stack, warranty cards swipeable
```

### P3 Dot 9: Chat, Profile, Team, Other (10 buoc)
```
P3.31  ChatPage: them message bubble dep hon — rounded corners, tail arrow, timestamp nho, avatar tron nho
P3.32  ChatPage: them typing indicator animation (...), them "Da xem" status (double check xanh)
P3.33  ChatPage: them emoji picker button mock, them image preview in chat
P3.34  BuyerProfile: them cover photo area (gradient default), avatar upload voi crop, progress bar "Ho so X%"
P3.35  BuyerProfile: them section cards — Thong tin ca nhan, Cong ty, Bao mat, Thong bao — accordion/tab
P3.36  BuyerProfile: them "Xac minh tai khoan" steps — Email ✓, SDT ✓, CCCD ?, Cong ty ?
P3.37  BuyerTeam: them org chart view (tree layout) ngoai table — avatar + ten + role + line connector
P3.38  BuyerTeam: them "Moi thanh vien" form dep — email input + role select + permission checkboxes
P3.39  LoyaltyPage: them loyalty card giong the VIP — gradient bg, ten, hang, diem, badge
P3.40  PromotionPage: them promotion cards dep — gradient bg, countdown, % giam, ma code, CTA "Sao chep"
```

---

## ========================================================
## P4: SELLER DASHBOARD & CORE PAGES (30 buoc | Dot 10–12)
## ========================================================

### P4 Dot 10: Seller Dashboard (10 buoc)
```
P4.01  Welcome section: gradient card "Chao {ten}, doanh thu hom nay: {X}" voi sparkline
P4.02  Stats: 4 StatsCard (Don moi, Doanh thu thang, SP hoat dong, Danh gia TB) voi AnimatedNumber + TrendIndicator
P4.03  "Doanh thu" area chart: gradient fill, tooltip card, them dual axis (doanh thu + so don)
P4.04  "Can xu ly" section: icon grid 2x3 (Don moi, Cho giao, Bao gia, Ton kho thap, Tra hang, Danh gia) + badge count
P4.05  "Don hang gan day" widget: DashboardWidget voi table rows — avatar buyer, ten, amount, status dot, time relative
P4.06  "Top san pham" widget: horizontal bar chart — thumbnail + ten SP + bar + so luong ban
P4.07  "Muc tieu thang" widget: progress bar voi target line va actual line, % dat duoc
P4.08  "Tinh trang kho" donut chart: Du hang (xanh), Sap het (vang), Het (do) — voi so luong
P4.09  Date range selector: button group global cho dashboard, ap dung cho tat ca widgets
P4.10  Mobile: stats 2x2, charts full width, widgets stack doc, can xu ly -> horizontal scroll cards
```

### P4 Dot 11: Seller Product Pages (10 buoc)
```
P4.11  ProductList: them thumbnail image nho trong table row (40x40 rounded), hover hien preview card lon
P4.12  ProductList: them stock indicator dot (xanh=con, vang=it, do=het) ben canh so luong
P4.13  ProductList: them batch actions bar — chon nhieu SP -> "An" / "Xuat Excel" / "Doi gia hang loat"
P4.14  ProductList: them kanban view toggle — cot theo trang thai (Nhap, Cho duyet, Hoat dong, An)
P4.15  ProductForm: them step indicator (1. Thong tin, 2. Gia & Kho, 3. Hinh anh, 4. Xem lai) voi progress
P4.16  ProductForm: image upload — drag-drop zone, preview thumbnails grid, reorder drag, delete hover X
P4.17  ProductForm: pricing section — table gia theo so luong (tiers), them "Ap dung cho tat ca variant"
P4.18  ProductForm: preview panel phai (desktop) — hien san pham nhu buyer se thay
P4.19  ProductForm: validation — required fields highlight do, scroll to first error, shake animation
P4.20  Mobile: ProductForm full width steps, image upload area lon, preview -> separate tab
```

### P4 Dot 12: Seller Order Pages (10 buoc)
```
P4.21  OrderList: them kanban view (cot theo trang thai, cards keo tha giua cot) — react-dnd
P4.22  OrderList: kanban card — buyer avatar + ten + amount + SP count + time, border-left mau status
P4.23  OrderList: them status tabs tuong tu buyer (Tat ca, Moi, Xac nhan, Dang giao, Hoan thanh, Huy)
P4.24  OrderList: them "Hanh dong nhanh" dropdown tren moi row — Xac nhan, Tu choi, In, Xem
P4.25  OrderDetail: customer info card dep — avatar, ten, cong ty, email, lich su mua (X don truoc do)
P4.26  OrderDetail: them action buttons khu vuc — primary CTA lon (Xac nhan don), secondary row (In, Chat, Sua)
P4.27  OrderDetail: items table dep hon — image thumbnail, variant info, discount line-through gia cu
P4.28  OrderDetail: them "Ghi chu noi bo" section — textarea voi "Chi nhin thay noi bo" badge
P4.29  OrderDetail: timeline status dep — tuong tu buyer nhung them "Cap nhat boi {ten}" label
P4.30  Mobile: kanban -> list voi status tabs, order detail -> tabs (SP | Giao hang | Thanh toan | Lich su)
```

---

## ========================================================
## P5: SELLER REMAINING PAGES (30 buoc | Dot 13–15)
## ========================================================

### P5 Dot 13: Seller RFQ, Contract, Promotion (10 buoc)
```
P5.01  RFQList: them urgency indicator — badge "Gap" cho RFQ sap het han, countdown timer
P5.02  RFQList: card voi buyer info, danh sach SP requested, deadline bar (ProgressRing mini)
P5.03  RFQDetail: them form bao gia dep — table items voi input gia + ghi chu per item, total tu dong
P5.04  RFQDetail: them "So sanh voi gia ban" column — gia list vs gia bao, % chenh lech
P5.05  ContractList: card dep tuong tu buyer contract, them revenue bar per contract
P5.06  ContractDetail: them "Hieu suat hop dong" stats — so don tu HD, doanh thu tu HD, ti le giao dung han
P5.07  PromotionList: promotion card dep — gradient bg theo loai (Giam %, Giam tien, Freeship), countdown active
P5.08  PromotionList: them "Hieu qua" metric — so lan su dung / han muc, conversion rate
P5.09  PromotionForm: them preview khung khuyen mai nhu buyer se thay tren san pham
P5.10  Mobile: RFQ detail -> accordion sections, contract -> simplified tabs, promotion cards stack
```

### P5 Dot 14: Seller Finance & Warehouse (10 buoc)
```
P5.11  Warehouse: them visual map mock — grid layout mo phong khu vuc kho, hover zone hien so luong
P5.12  Warehouse: stock alert cards — gradient border do/vang/xanh theo muc do, icon AlertTriangle
P5.13  Warehouse: them sparkline trend cho tung SP — xu huong ton kho 30 ngay
P5.14  ShipmentList: them inline progress bar 5 steps (Tao -> Lay hang -> Van chuyen -> Giao -> Xong)
P5.15  InvoiceList: them doanh thu chart line/area theo thang o tren, quick stats summary
P5.16  PaymentList: them "Cho rut tien" / "Da rut" / "Dang xu ly" status tabs, tong so tien per tab
P5.17  CreditPage: them credit limit gauge (ProgressRing), transaction timeline, status card
P5.18  DebitCreditPage: ledger-style layout — 2 cot (No | Co) voi tong o cuoi, mau do/xanh
P5.19  SLAPage: them SLA compliance dashboard — gauge charts cho tung metric (Ti le giao dung han, Phan hoi, ...)
P5.20  Mobile: warehouse map -> list, shipment progress inline, invoices -> card list
```

### P5 Dot 15: Seller Reports, Staff, Others (10 buoc)
```
P5.21  SellerReports: them chart interactive — click segment/bar de drill down, them breadcrumb chart
P5.22  SellerReports: them "Xuat bao cao" options dep — card chon (PDF, Excel, CSV) voi icon + mo ta
P5.23  StaffList: them role badge mau, them "Quyen" column voi permission pills
P5.24  StaffList: them "Moi nhan vien" form dep — avatar upload, email, role select, permission matrix
P5.25  ApprovalListPage: them approval flow visualization — DAG tu nguoi tao -> cap duyet -> xong
P5.26  ActivityPage: timeline dep — avatar + hanh dong + timestamp, grouped by ngay, voi icon mau
P5.27  ReviewsPage: them sentiment analysis mock — pie chart (Tich cuc, Trung tinh, Tieu cuc), response rate
P5.28  ReturnListPage: them return flow steps (Nhan YC -> Kiem tra -> Chap nhan/Tu choi -> Hoan tien)
P5.29  WarrantyPage: them warranty timeline per SP — bat dau -> yeu cau -> xu ly -> hoan tat
P5.30  SellerProfile: them "Cua hang cua toi" preview — nhu buyer thay khi vao trang NCC
```

---

## ========================================================
## P6: ADMIN DASHBOARD & CORE PAGES (30 buoc | Dot 16–18)
## ========================================================

### P6 Dot 16: Admin Dashboard (10 buoc)
```
P6.01  Stats: 6 metric cards — Tong user, Don hom nay, Doanh thu, SP cho duyet, NCC cho XM, Bao cao — AnimatedNumber
P6.02  "He thong" health mock — 3 gauges (CPU, Memory, Uptime) voi mau xanh/vang/do
P6.03  "Can xu ly" grid 2x3 — card voi icon + badge count + priority color (do > cam > vang > xanh)
P6.04  Activity feed widget: scrolling list real-time mock — avatar + "{user} da {action}" + time relative
P6.05  Revenue chart: dual axis (doanh thu bar + don hang line) trong cung chart, animated
P6.06  "Phan bo theo vung" section: Vietnam SVG map mock — mau gradient theo density, hover tooltip
P6.07  "Top NCC" leaderboard: avatar + ten + rating bar horizontal + doanh thu, top 5
P6.08  Auto-refresh indicator: animated dot xanh + "Cap nhat luc HH:mm:ss" bottom widget
P6.09  Date range global selector: 7d/30d/90d/YTD/Custom — ap dung cho tat ca widgets
P6.10  Mobile: stats 2x3, can xu ly scroll horizontal, chart full width, map -> list by region
```

### P6 Dot 17: Admin User & Category (10 buoc)
```
P6.11  UserManagement: them avatar + role color badge trong table, hover preview card (ten, email, ngay tao, trang thai)
P6.12  UserManagement: them bulk actions bar — chon nhieu -> Khoa / Mo khoa / Doi role / Xuat
P6.13  UserManagement: them user detail slide-over panel (khong can navigate) — info + activity log + orders
P6.14  UserManagement: them "Nguoi dung moi" chart widget mini — line chart 30 ngay
P6.15  CategoryManagement: tree view dep — indented voi connecting lines, folder/file icons, drag reorder mock
P6.16  CategoryManagement: them inline edit — click ten de doi ten, Enter luu, Esc huy
P6.17  CategoryManagement: them "Them danh muc con" button inline — expand + form input ngay tai cho
P6.18  CategoryManagement: them icon + image per category — upload/select icon, preview
P6.19  CategoryManagement: them "So SP" badge per category — hien so luong san pham
P6.20  Mobile: tree view indent it hon, inline edit voi modal thay vi inline, actions dropdown
```

### P6 Dot 18: Admin Approval & Orders (10 buoc)
```
P6.21  ProductApproval: them split view — list trai, preview detail phai (live preview khong can dialog)
P6.22  ProductApproval: image gallery slider trong preview — thumbnails rail + main image
P6.23  ProductApproval: them "Ly do tu choi" form dep — textarea + common reasons checkbox
P6.24  ProductApproval: them badge count per status tab (Cho duyet: 12, Da duyet: 450, Tu choi: 8)
P6.25  OrderOverview: them order flow funnel chart (Created -> Confirmed -> Shipped -> Delivered) voi % chuyen doi
P6.26  OrderOverview: them "Don co van de" highlight section — overdue, cancelled, return
P6.27  OrderOverview: them revenue by day mini chart o tren
P6.28  OrderOverview: them "Chi tiet don hang" slide-over tuong tu user management
P6.29  AdminSupplierPage: them supplier verification progress — 3 steps (Dang ky -> Xac minh -> Phe duyet) voi dot mau
P6.30  AdminCertificateReview: them document viewer inline — PDF preview area (mock), approve/reject buttons lon
```

---

## ========================================================
## P7: ADMIN REMAINING & REPORTS (20 buoc | Dot 19–20)
## ========================================================

### P7 Dot 19: Admin Finance & Shipment (10 buoc)
```
P7.01  AdminInvoicePage: them summary stats — Tong phat hanh, Gia tri, Qua han, Ti le thu
P7.02  AdminInvoicePage: them aging chart — bar chart nhom theo "0-30d", "30-60d", "60-90d", ">90d"
P7.03  AdminPaymentPage: them cash flow chart — tien vao (xanh) vs tien ra (do) theo thang
P7.04  AdminPaymentPage: them payment method pie chart — Chuyen khoan, COD, L/C, Tra cham
P7.05  AdminShipmentPage: them delivery performance chart — on-time % vs late % line chart
P7.06  AdminShipmentPage: them "Hang van chuyen" comparison table — ten, so don, ti le giao dung han, rating
P7.07  AdminPromotionPage: them "Hieu qua KM" chart — so lan dung, doanh thu tu KM, ti le chuyen doi
P7.08  ContractManagement: them contract value timeline chart — bar chart gia tri HD theo thang
P7.09  RFQManagement: them RFQ funnel (Tao -> Gui -> Bao gia -> Chap nhan -> Don hang) voi % moi buoc
P7.10  Mobile: charts full width, stats 2x2, tables -> card lists
```

### P7 Dot 20: Admin Reports & Settings (10 buoc)
```
P7.11  AdminReportPage: them chart animation on load — bars grow, lines draw, pie expand
P7.12  AdminReportPage: them "So sanh ky truoc" toggle — overlay 2 data series trong chart
P7.13  AdminReportPage: them fullscreen chart mode — click expand icon -> modal full-width chart
P7.14  AdminReportPage: them export per chart — "Tai PNG" / "Tai CSV" buttons tren moi chart
P7.15  ReviewManagement: them AI sentiment tag mock — badge Tich cuc (xanh) / Trung tinh (xam) / Tieu cuc (do)
P7.16  ReviewManagement: them review response template — chon mau phan hoi, edit, gui
P7.17  AdminActivityLog: them filter by user, by action type, by date range
P7.18  AdminActivityLog: them timeline view grouped by ngay, expand/collapse per ngay
P7.19  SystemSettings: tab-based UI dep — icon per tab, section cards voi mo ta, toggle switches dep
P7.20  SystemSettings: them "Sao luu & Khoi phuc" section mock — last backup time, button backup now
```

---

## ========================================================
## P8: SHARED COMPONENTS NANG CAP V2 (20 buoc | Dot 21–22)
## ========================================================

### P8 Dot 21: DataTable & FilterBar V2 (10 buoc)
```
P8.01  DataTable: them expandable row — click row expand section phia duoi (chi tiet don hang, SP list)
P8.02  DataTable: them inline cell editing — double click cell de edit, Enter luu, Esc huy (cho admin)
P8.03  DataTable: them column freeze — freeze 1-2 cot dau khi scroll ngang (nhu Excel)
P8.04  DataTable: them row group — nhom rows theo field (VD: nhom theo NCC, theo trang thai)
P8.05  DataTable: them summary footer row — tong, trung binh, min, max cho cot so
P8.06  FilterBar: them "Bo loc nang cao" expandable panel — nhieu dieu kien AND/OR
P8.07  FilterBar: them "Luu va dat ten bo loc" — save filter presets, load later
P8.08  FilterBar: them filter counter badge — "3 bo loc dang ap dung"
P8.09  SearchSuggestions: them voice search button mock (icon Mic)
P8.10  SearchSuggestions: them "Xu huong tim kiem" section trong dropdown — trending keywords
```

### P8 Dot 22: Form & Dialog V2 (10 buoc)
```
P8.11  FormDialog: them unsaved changes warning — "Ban co thay doi chua luu. Thoat?" dialog
P8.12  FormDialog: them field dependency — show/hide fields based on other field values
P8.13  Input: them input mask cho phone (0912-345-678), MST (0123456789-001)
P8.14  Input: them currency input format — tu dong format 1,000,000 khi nhap
P8.15  Textarea: them rich text toolbar mini — Bold, Italic, List, Link
P8.16  Select: them "Them moi" option o cuoi dropdown — open inline form or dialog
P8.17  DatePicker: them preset ranges — "Hom nay", "7 ngay qua", "Thang nay", "Quy nay"
P8.18  FileUpload component moi: drag-drop zone, preview thumbnails, progress bar, multi-file
P8.19  Stepper component moi: horizontal steps voi number + label + dot connector, active/done/future states
P8.20  FormSection component: collapsible section voi header (icon + title + badge) + divider
```

---

## ========================================================
## P9: ANIMATION & MICRO-INTERACTION (30 buoc | Dot 23–25)
## ========================================================

### P9 Dot 23: Page Transitions (10 buoc)
```
P9.01  PageTransition: upgrade stagger animation — children cards hien tuan tu (delay 50ms each)
P9.02  Route transition: cross-fade 200ms giua cac trang (AnimatePresence mode="wait")
P9.03  Skeleton shimmer: gradient animation left-to-right dep hon, mau nhat hon
P9.04  Table row animation: row moi slide down + fade in, row xoa fade out + slide up
P9.05  Dialog: scale 0.95->1 + fade enter, scale 1->0.95 + fade exit (spring physics)
P9.06  Sheet (mobile menu): slide from side voi spring physics + overlay fade
P9.07  Tab content: fade + slide transition khi chuyen tab (AnimatePresence)
P9.08  Dropdown menu: fade + scale from anchor point, items stagger in
P9.09  Tooltip: fade + scale 0.95->1 voi spring, tail/arrow animation
P9.10  Accordion: smooth height animation (motion layout), icon rotate 180deg
```

### P9 Dot 24: Interactive Micro-animations (10 buoc)
```
P9.11  Button click: subtle scale(0.97) -> scale(1) feedback, 100ms transition
P9.12  Button loading: spinner icon replace text, disabled state, min 1s (avoid flicker)
P9.13  Card hover: translateY(-2px) + shadow-md, 200ms ease-out transition
P9.14  Checkbox: checkmark SVG draw animation (path animation 200ms)
P9.15  Switch: slide circle smooth, them icon nho (Sun/Moon cho dark mode toggle)
P9.16  Heart/Wishlist: scale bounce (1 -> 1.3 -> 1) + fill red animation khi click
P9.17  Copy button: "Da sao chep!" tooltip fade in + check icon replace clipboard icon, 2s auto hide
P9.18  Delete: shake animation nhe tren dialog title khi destructive action
P9.19  Notification badge: pulse animation 3 lan khi co notification moi, dot red
P9.20  Toast: slide in from right (desktop) / bottom (mobile), auto dismiss voi progress bar
```

### P9 Dot 25: Scroll & Reveal Animations (10 buoc)
```
P9.21  Homepage sections: IntersectionObserver + motion fade-up, stagger children 100ms
P9.22  Dashboard stats: AnimatedNumber count-up khi scroll vao viewport (khong chi mount)
P9.23  Charts: animate on viewport enter — bars grow, lines draw, pie segments fan out
P9.24  Product grid: stagger fade-in cards (delay = index * 50ms)
P9.25  Timeline items: alternate reveal left/right khi scroll, slide + fade
P9.26  Parallax hero: background shift 15% khi scroll (requestAnimationFrame)
P9.27  Sticky header: shrink animation (height 80 -> 60, font nho hon) khi scroll >100px
P9.28  Image lazy load: blur-up effect (blur placeholder -> sharp image transition)
P9.29  Infinite scroll: spinner o cuoi + "Dang tai them..." text, fade in new items
P9.30  Number animations: bat ky so thong ke nao AnimatedNumber khi appear in viewport
```

---

## ========================================================
## P10: MOBILE & RESPONSIVE MASTERY (30 buoc | Dot 2628)
## ========================================================

### P10 Dot 26: Mobile UX Core (10 buoc)
```
P10.01  Mobile bottom nav: animation active indicator (line slide), badge count voi pulse
P10.02  Mobile tables: auto chuyen card layout khi < 768px, DataTable responsive built-in
P10.03  Mobile forms: input height 48px (touch friendly), spacing gap-4, label tren input
P10.04  Mobile dialogs: bottom sheet style (slide up tu duoi), drag handle tren cung
P10.05  Mobile product detail: image carousel swipeable (react-slick), sticky bottom "Them gio hang"
P10.06  Mobile cart: summary bar fixed bottom "Tong: X | Thanh toan (Y mon)" button full width
P10.07  Mobile search: full-screen overlay khi tap search icon, auto-focus input, recent searches
P10.08  Mobile filters: bottom sheet voi collapsible groups, "Ap dung (X bo loc)" sticky button
P10.09  Mobile charts: horizontal scroll container, tap to see tooltip (khong hover)
P10.10  Mobile navigation: hamburger -> slide panel left, animated icon (3 lines -> X)
```

### P10 Dot 27: Tablet Optimization (10 buoc)
```
P10.11  Tablet sidebar: collapse mac dinh, icon-only, hover expand overlay
P10.12  Tablet product grid: 3 col (khong 2 hoac 4), card size toi uu
P10.13  Tablet dashboard: 2 col stats, chart bên duoi full width
P10.14  Tablet forms: 2 col layout maintain, dialog max-width 600px center
P10.15  Tablet tables: hien 5-6 col max, an cot it quan trong, them "..." more menu
P10.16  Responsive images: width/height attributes, aspect-ratio CSS, lazy loading
P10.17  Responsive typography: heading sizes giam 20% tren mobile (CSS clamp)
P10.18  Print layout: @media print — an nav, sidebar, footer; format A4; page break
P10.19  Landscape mobile: xu ly image gallery (horizontal layout), chart expand
P10.20  No horizontal scroll: audit tat ca trang — fix overflow-x issues
```

### P10 Dot 28: Touch & Gesture (10 buoc)
```
P10.21  Touch targets: audit tat ca buttons/links — min 44x44px touch area
P10.22  Swipe gestures: swipe left tren order card de hien quick actions (Xem, Huy)
P10.23  Pull-to-refresh: pull down tren mobile list pages -> spinner -> reload data
P10.24  Pinch-to-zoom: product image zoom voi pinch gesture (touch events)
P10.25  Long press: long press tren card de hien context menu (Copy, Share, Delete)
P10.26  Haptic feedback: mock vibration pattern for important actions (navigator.vibrate)
P10.27  Bottom sheet dismiss: swipe down de dong bottom sheet, velocity-based
P10.28  Carousel swipe: product image carousel voi momentum scrolling, snap to item
P10.29  Scroll snap: horizontal scroll sections snap to items (CSS scroll-snap)
P10.30  Safe area: respect notch/home indicator (env(safe-area-inset-*))
```

---

## ========================================================
## P11: DARK MODE & ACCESSIBILITY (30 buoc | Dot 29–31)
## ========================================================

### P11 Dot 29: Dark Mode Core (10 buoc)
```
P11.01  Dark mode toggle: Sun/Moon icon tren header, voi rotate animation khi toggle
P11.02  Toggle logic: them useTheme hook, luu preference localStorage, system preference detect
P11.03  Audit hardcoded colors: tim tat ca "bg-white", "text-black", "bg-gray-*" -> thay bang CSS variables
P11.04  Dark cards: border lighter (border-white/10), shadow glow nhe (shadow-primary/5)
P11.05  Dark charts: cap nhat recharts colors — lines sang hon, grid nhat hon, tooltip dark bg
P11.06  Dark images: them overlay nhe (opacity 5%) de giam contrast voi dark bg
P11.07  Dark gradients: cap nhat hero/header gradients cho dark — tu blue-900 den blue-800
P11.08  Dark StatusBadge: cap nhat mau cho contrast WCAG AA tren dark background
P11.09  Dark forms: input border lighter, focus ring visible, placeholder text sang hon
P11.10  Test: kiem tra tat ca trang trong dark mode — fix mau khong tuong thich
```

### P11 Dot 30: Accessibility Core (10 buoc)
```
P11.11  ARIA labels: them aria-label cho tat ca icon-only buttons (Xoa, Sua, In, ...)
P11.12  Focus ring: them focus-visible:ring-2 ring-primary/50 ring-offset-2 cho tat ca interactive elements
P11.13  Skip navigation: kiem tra SkipLink hoat dong — "Bo qua den noi dung chinh"
P11.14  Role attributes: role="status" cho toast, role="alert" cho errors, role="navigation" cho menus
P11.15  Screen reader: them sr-only text cho visual-only elements (icon status, color indicators)
P11.16  Keyboard nav: Tab order logic toan app, Escape close dialog/dropdown, Enter submit form
P11.17  Color contrast: audit WCAG AA (4.5:1 text, 3:1 large text) — fix violations
P11.18  Form labels: moi input phai co <label> hoac aria-label, error messages linked voi aria-describedby
P11.19  Live regions: aria-live="polite" cho dynamic content updates (new notifications, table reload)
P11.20  Motion preference: @media (prefers-reduced-motion: reduce)  tat animations cho nguoi nhat cam
```

### P11 Dot 31: Accessibility Advanced (10 buoc)
```
P11.21  Focus trap: dialog/modal co focus trap (Tab chi di trong dialog, khong ra ngoai)
P11.22  Heading hierarchy: audit h1-h6 — moi trang chi 1 h1, headings tuan tu (khong nhay cap)
P11.23  Alt text: audit tat ca <img> — them alt text mo ta, decorative images alt=""
P11.24  Link purpose: tat ca links co text mo ta (khong chi "Click here" hoac "Xem")
P11.25  Table accessibility: them scope="col"/"row" cho th, caption cho table
P11.26  Error recovery: form errors — focus vao field loi dau tien, thong bao ro rang cach sua
P11.27  Timeout warning: neu co session timeout — canh bao truoc 2 phut, cho phep extend
P11.28  Language: them lang="vi" tren html element
P11.29  Zoom support: trang van dung khi zoom 200% (khong bi tran, khong mat noi dung)
P11.30  Testing: chay Lighthouse accessibility audit — fix tat ca issues, dat diem 90+
```

---

## ========================================================
## P12: DESIGN CONSISTENCY AUDIT (20 buoc | Dot 32–33)
## ========================================================

### P12 Dot 32: Visual Consistency (10 buoc)
```
P12.01  Border radius audit: tat ca cards dung rounded-xl (12px), buttons rounded-lg, inputs rounded-lg, badges rounded-full
P12.02  Shadow audit: cards dung shadow-sm, hover shadow-md, dialog shadow-lg — nhat quan
P12.03  Spacing audit: page padding px-4 sm:px-6, card padding p-4 sm:p-5, section gap space-y-6
P12.04  Color audit: primary cho CTA/links, emerald cho success, amber cho warning, destructive cho error — khong dung mau khac
P12.05  Icon size audit: inline icons h-4 w-4, button icons h-3.5 w-3.5, card header icons h-5 w-5
P12.06  Font usage audit: headings dung font-heading, body dung font-body, so tien dung font-heading fontWeight 700
P12.07  Button style audit: primary cho main CTA, outline cho secondary, ghost cho minor, destructive cho xoa
P12.08  Empty state audit: tat ca trang co empty state dep voi icon/illustration + CTA
P12.09  Loading state audit: tat ca trang co skeleton loading phu hop (khong chi spinner)
P12.10  Error state audit: tat ca API call co error handling + toast/inline alert
```

### P12 Dot 33: Pattern Consistency (10 buoc)
```
P12.11  Page header pattern: tat ca trang co AppBreadcrumb + h1 font-heading + subtitle muted + actions phai
P12.12  List page pattern: tat ca trang list co FilterBar + DataTable + pagination + empty state
P12.13  Detail page pattern: tat ca trang detail co breadcrumb + header voi actions + grid 2/3 + 1/3 summary
P12.14  Form pattern: tat ca form co validation, error messages, loading submit, success toast
P12.15  Status pattern: tat ca status dung StatusBadge, timeline cho flow status, tabs cho filter
P12.16  Card pattern: tat ca card co border-0 shadow-sm, hover effect, gradient top border cho noi bat
P12.17  Chart pattern: tat ca chart co tooltip, animation on load, responsive, legend dep
P12.18  Table action pattern: tat ca table co renderActions voi icon buttons + tooltip
P12.19  Mobile pattern: tat ca trang responsive, card layout thay table, sticky bottom bar, bottom sheet
P12.20  Print pattern: tat ca detail pages co @media print layout
```

---

## ========================================================
## P13: ADVANCED UX PATTERNS (20 buoc | Dot 34–35)
## ========================================================

### P13 Dot 34: Smart UX (10 buoc)
```
P13.01  Onboarding tour: tooltip sequence cho user moi — "Chao mung! Day la Dashboard", "Day la menu", ...
P13.02  Keyboard shortcuts: them shortcut hints tren tooltip buttons (VD: "Tim kiem (Ctrl+K)")
P13.03  "Moi" badge: them badge "Moi" cho feature moi — hien 7 ngay, dismiss khi click, luu localStorage
P13.04  Recent items: "Xem gan day" section o sidebar hoac dashboard — luu 10 items cuoi vao localStorage
P13.05  Smart defaults: pre-fill forms tu lich su (dia chi giao hang, phuong thuc thanh toan gan nhat)
P13.06  Undo actions: them "Hoan tac" button tren toast sau delete — 5s countdown, cancel delete
P13.07  Batch operations: tat ca list pages co checkbox multi-select + batch action bar
P13.08  Contextual help: them "?" icon ben canh complex fields — hover hien tooltip giai thich
P13.09  Progress indicators: moi multi-step process co progress bar/stepper visible
P13.10  Confirmation feedback: moi action thanh cong co visual feedback (toast + icon animation)
```

### P13 Dot 35: Performance UX (10 buoc)
```
P13.11  Optimistic updates: cap nhat UI truoc khi API response (add to cart, toggle status)
P13.12  Debounce search: them 300ms debounce cho search input, cancel previous requests
P13.13  Virtual scrolling: cho list dai (>100 items) dung react-window hoac native virtualization
P13.14  Lazy load routes: dynamic import() cho heavy pages (charts, reports) — React.lazy + Suspense
P13.15  Image optimization: ImageWithFallback them loading="lazy", placeholder blur, srcset
P13.16  Memoization: React.memo cho heavy components (chart, table rows), useMemo cho calculations
P13.17  Request dedup: cancel duplicate API requests, them request cache 30s
P13.18  Prefetch: hover link de prefetch next page data (mouse enter, 200ms delay)
P13.19  Skeleton content: skeleton phu hop content layout (khong generic rectangle)
P13.20  Error recovery: them retry button khi API fail, auto-retry 3 lan voi exponential backoff
```

---

## ========================================================
## P14: FINAL POLISH & QA (20 buoc | Dot 36–37)
## ========================================================

### P14 Dot 36: Visual Polish (10 buoc)
```
P14.01  Smooth scroll-to-top: button goc phai duoi, fade in khi scroll > 300px, icon rotate on hover
P14.02  Z-index audit: header(50) > dropdown(40) > sidebar(30) > dialog(50) > toast(60) — fix stacking
P14.03  404 page dep: illustration, "Trang khong ton tai", CTA "Ve trang chu" + "Lien he ho tro"
P14.04  500 error page: illustration, "Co loi xay ra", CTA "Thu lai" + "Lien he ho tro"
P14.05  Offline page: illustration, "Mat ket noi mang", CTA "Thu lai" — OfflineIndicator da co, polish
P14.06  Favicon + meta tags: them favicon SVG gradient, og:title, og:description cho tung trang
P14.07  Page title: document.title dynamic theo trang hien tai (VD: "Don hang — VietB2B")
P14.08  Changelog dialog: "Co gi moi?" button -> dialog list features moi voi date + mo ta
P14.09  Version indicator: footer "Phien ban 1.0.0" nho
P14.10  Console cleanup: xoa tat ca console.log, console.warn khong can thiet
```

### P14 Dot 37: Cross-browser & Final QA (10 buoc)
```
P14.11  Chrome audit: Lighthouse Performance 90+, Accessibility 90+, Best Practices 90+
P14.12  Firefox: test layout, animations, CSS compatibility — fix tat ca issues
P14.13  Safari: test CSS features (backdrop-filter, scroll-snap, gap) — fix fallbacks
P14.14  Mobile Safari: test iOS-specific issues (100vh, momentum scroll, input zoom)
P14.15  Responsive: test 320px (SE), 375px (iPhone), 768px (iPad), 1024px, 1440px, 1920px
P14.16  RTL readiness: kiem tra layout co bi pha khi future RTL support (logical properties)
P14.17  Performance: bundle size check, remove unused imports, tree-shake dead code
P14.18  Memory leaks: audit useEffect cleanup, event listener removal
P14.19  SEO basics: semantic HTML (main, article, section, nav), heading hierarchy, alt texts
P14.20  Final walkthrough: test every user journey — Buyer mua hang, Seller ban hang, Admin quan ly
```

---

# ============================================================
# TONG KET KE HOACH HOAN THIEN GIAO DIEN
# ============================================================
#
# Tong: ~520 buoc | 37 dot | 14 giai doan
#
# P1:  Buyer Dashboard & Analytics          — 20 buoc | Dot 1-2
# P2:  Buyer Finance & Contract             — 30 buoc | Dot 3-5
# P3:  Buyer Remaining Pages               — 40 buoc | Dot 6-9
# P4:  Seller Dashboard & Core             — 30 buoc | Dot 10-12
# P5:  Seller Remaining Pages              — 30 buoc | Dot 13-15
# P6:  Admin Dashboard & Core              — 30 buoc | Dot 16-18
# P7:  Admin Remaining & Reports           — 20 buoc | Dot 19-20
# P8:  Shared Components V2                — 20 buoc | Dot 21-22
# P9:  Animation & Micro-interaction       — 30 buoc | Dot 23-25
# P10: Mobile & Responsive Mastery         — 30 buoc | Dot 26-28
# P11: Dark Mode & Accessibility           — 30 buoc | Dot 29-31
# P12: Design Consistency Audit            — 20 buoc | Dot 32-33
# P13: Advanced UX Patterns                — 20 buoc | Dot 34-35
# P14: Final Polish & QA                   — 20 buoc | Dot 36-37
#
# UOC TINH THOI GIAN:
#   - Moi dot ~10 buoc, trung binh 1 prompt "Tiep tuc"
#   - Tong ~52 prompt de hoan thanh
#   - Moi prompt mat ~3-5 phut implement
#
# THU TU UU TIEN:
#   P1-P3   -> Buyer pages (nguoi dung chinh, an tuong dau tien)
#   P4-P5   -> Seller pages (nguoi ban, trai nghiem quan ly)
#   P6-P7   -> Admin pages (quan tri, bao cao)
#   P8      -> Shared components (tat ca trang huong loi)
#   P9      -> Animations (them "wow factor")
#   P10     -> Mobile (responsive, touch)
#   P11     -> Dark mode + A11y (chuyen nghiep, inclusive)
#   P12-P13 -> Consistency + UX (polish, nhat quan)
#   P14     -> Final QA (hoan thien cuoi)
#
# GHI CHU:
#   - Ke hoach nay thay the phan con lai cua PLAN_UI_UPGRADE.md (UI-E20 tro di)
#   - Cac buoc da hoan thanh (UI-A1 -> UI-E19) van duoc ghi nhan trong PLAN_UI_UPGRADE.md
#   - Khi user prompt "Tiep tuc", thuc hien dot tiep theo cua ke hoach nay
#   - Moi dot co the tach thanh nhieu file neu can (khong vuot 2000 dong/file)
#
# ============================================================
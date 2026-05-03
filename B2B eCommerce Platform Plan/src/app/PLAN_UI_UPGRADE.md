# ============================================================
# KE HOACH NANG CAP UI/UX TOAN DIEN — B2B Marketplace
# ~350 buoc | 10 Giai doan (UI-A den UI-J) | ~35 dot
# ============================================================
#
# TRANG THAI: DA HOAN THANH UI-A DOT 1-4 + UI-B DOT 5-9 + UI-C DOT 10-13 + UI-D DOT 14-16 + UI-E DOT 17-19 (190/190 buoc)
# GIAI DOAN UI-A ✅
# - A1.01-A1.10: Theme & Mau sac ✅
# - A2.01-A2.10: Typography & Font ✅  
# - A3.01-A3.10: Spacing & Layout System ✅
# - A4.01-A4.10: Icon & Visual System ✅
# GIAI DOAN UI-B ✅
# - B5.01-B5.10: DataTable Premium ✅
# - B6.01-B6.10: FilterBar & Search ✅
# - B7.01-B7.10: FormDialog & Input ✅
# - B8.01-B8.10: Card & Widget System ✅ (StatsCard, DashboardWidget)
# - B9.01-B9.10: Notification & Feedback ✅ (ConfirmDialog, InlineAlert, LoadingOverlay)
# GIAI DOAN UI-C ✅
# - C10.01-C10.10: Buyer Mega Menu ✅ (BuyerMegaMenu + BuyerMobileMenu)
# - C11.01-C11.10: Buyer Header Polish ✅ (gradient top bar, logo, scroll shadow)
# - C12.01-C12.10: Seller Sidebar ✅ (grouped sections, mini mode, collapsible)
# - C13.01-C13.10: Admin Sidebar ✅ (grouped, badge count, quick stats, mini mode)
# GIAI DOAN UI-D ✅
# - D14.01-D14.10: HomePage Redesign ✅ (hero multi-gradient, stats counter, category images, product cards, trust badges, testimonials)
# - D15.01-D15.10: HomePage CTA ✅ (how-it-works, supplier CTA, newsletter, scroll reveal, countdown timer)
# - D16.01-D16.10: Auth Pages ✅ (split layout, branding carousel, social login, multi-step register, demo accounts)
# GIAI DOAN UI-E (dang trien khai)
# - E17.01-E17.10: Product List & Detail ✅ (sidebar filter, card redesign, image gallery, sticky cart, supplier card)
# - E18.01-E18.10: Cart & Checkout ✅ (2-col layout, stepper, recommendations, empty state, timeline, mobile bar, coupon)
# - E19.01-E19.10: Order & RFQ ✅ (status tabs, card redesign, enhanced timeline, countdown, print CSS)
#
# MUC TIEU: Dep hon, hien dai hon, chuyen nghiep hon, de dung hon
# NGUYEN TAC:
#   - Khong pha vo logic/data da co, chi nang cap visual + UX
#   - Moi file khong qua 2000 dong
#   - Uu tien shared component de tat ca trang duoc huong loi
#   - Mobile-first, Accessibility, Performance
#   - Giu tieng Viet co dau
# ============================================================

---

## ========================================================
## GIAI DOAN UI-A: NEN TANG THIET KE (Design Foundation)
## 40 buoc | Dot 1–4
## ========================================================

### UI-A Dot 1: Theme & Mau sac (10 buoc)
```
A1.01  Doi --primary tu #030213 (den) sang gradient xanh chuyen nghiep: #1e40af (blue-800) — tao cam giac tin cay B2B
A1.02  Them --primary-gradient: linear-gradient(135deg, #1e40af, #3b82f6) cho hero/header/CTA
A1.03  Cap nhat --accent sang #f0f9ff (blue-50), --accent-foreground sang #1e3a5f
A1.04  Them --success: #059669, --warning: #d97706, --info: #0284c7 — dung nhat quan toan app thay vi hardcode
A1.05  Them --surface: #f8fafc (background nhe hon card), --surface-hover: #f1f5f9
A1.06  Cap nhat --chart-1 den --chart-5: bo mau hai hoa voi primary moi (#1e40af, #7c3aed, #059669, #d97706, #ec4899)
A1.07  Cap nhat dark mode tuong ung: --primary dark -> #60a5fa, --surface dark -> #0f172a
A1.08  Them --shadow-sm, --shadow-md, --shadow-lg custom variables cho elevation nhat quan
A1.09  Cap nhat --radius: 0.625rem -> 0.75rem (12px) cho cam giac hien dai hon, them --radius-lg: 1rem, --radius-xl: 1.5rem
A1.10  Them --border moi: rgba(0,0,0,0.06) nhe hon, --border-hover: rgba(0,0,0,0.12)
```

### UI-A Dot 2: Typography & Font (10 buoc)
```
A2.01  Them font "Plus Jakarta Sans" (Google Fonts) lam heading font — hien dai, clean hon Inter
A2.02  Cap nhat fonts.css: import Plus Jakarta Sans weights 500,600,700,800
A2.03  Tao --font-heading: 'Plus Jakarta Sans', --font-body: 'Inter' variables
A2.04  Cap nhat theme.css: h1-h6 dung font-heading, body dung font-body
A2.05  Them --letter-spacing-tight: -0.02em cho heading, --letter-spacing-normal: 0 cho body
A2.06  Chuan hoa text-muted-foreground = #64748b thay vi #717182 (de doc hon)
A2.07  Them utility class .text-gradient cho tieu de noi bat: bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-400
A2.08  Them .prose-content class cho noi dung dai (mo ta san pham, chi tiet hop dong) voi line-height 1.7
A2.09  Cap nhat default font-size tren mobile: 15px (tang tu 14px) cho de doc
A2.10  Them .label-caps utility: uppercase, letter-spacing 0.05em, font-size 11px — cho label nho nhu "TRANG THAI", "NGAY TAO"
```

### UI-A Dot 3: Spacing & Layout System (10 buoc)
```
A3.01  Tao .page-container class = container mx-auto px-4 sm:px-6 lg:px-8 py-6 — thay the tat ca "container mx-auto px-4 py-6"
A3.02  Tao .page-header class = flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6
A3.03  Tao .page-title class = flex items-center gap-3 (icon + text)
A3.04  Tao .section-gap class = space-y-6 cho khoang cach giua cac section
A3.05  Tao .card-grid class = grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4
A3.06  Tao .stats-grid class = grid grid-cols-2 lg:grid-cols-4 gap-4 cho dashboard stats
A3.07  Cap nhat Card component: them hover:shadow-sm transition-shadow duration-200 mac dinh
A3.08  Them .card-interactive class = hover:shadow-md hover:border-primary/20 transition-all cursor-pointer
A3.09  Them .divider-with-label component: duong ke co text o giua (dung cho form section)
A3.10  Cap nhat gap/spacing nhat quan: filter bar gap-3, form gap-4, card content p-5 (tang tu p-4)
```

### UI-A Dot 4: Icon & Visual System (10 buoc)
```
A4.01  Tao shared IconWrapper component: vong tron co bg + icon ben trong, props: size (sm/md/lg), color variant, className
A4.02  IconWrapper variants: primary (bg-blue-100 text-blue-600), success (bg-green-100 text-green-600), warning, danger, info, neutral
A4.03  Cap nhat StatusBadge: them dot indicator (cham tron nho) truoc text thay vi chi co text
A4.04  StatusBadge: them size prop (sm/md), them icon optional (CheckCircle cho "Da giao", Clock cho "Cho xac nhan", v.v.)
A4.05  Tao AnimatedNumber component: so dem len (count up animation) khi mount — dung cho dashboard stats
A4.06  Tao TrendIndicator component: mui ten len/xuong + % thay doi + mau xanh/do tuong ung
A4.07  Tao AvatarGroup component: hien thi nhieu avatar chong len nhau (dung cho team, NCC)
A4.08  Tao ProgressRing component: vong tron % (SVG) cho stats nhu "Ti le hoan thanh"
A4.09  Cap nhat EmptyState: them illustration SVG dep (khong chi icon), them gradient background nhe
A4.10  Tao Divider component voi or/and text, dung cho Login form "hoac dang nhap bang"
```

---

## ========================================================
## GIAI DOAN UI-B: SHARED COMPONENTS NANG CAP
## 50 buoc | Dot 5–9
## ========================================================

### UI-B Dot 5: DataTable Premium (10 buoc)
```
B5.01  Them striped row option: even row co bg-muted/30 de doc bang
B5.02  Them row hover effect dep hon: bg-primary/5 voi transition, bo border-bottom nang
B5.03  Them sticky header (position: sticky top-0) khi scroll bang dai
B5.04  Them column resize indicator (duong ke doc khi hover giua 2 cot header)
B5.05  Them row selection UI dep hon: checkbox tron, selected row co bg-primary/10 + left border primary
B5.06  Cap nhat pagination: them "Trang X / Y" text, dot page numbers dep hon (khong qua 7 nut)
B5.07  Them skeleton loading cho tung row thay vi spinner toan bang
B5.08  Them empty state inline trong bang (khong redirect) voi illustration
B5.09  Grid view card: them shadow hover, image zoom nhe (scale 1.02), border-radius lon hon
B5.10  Them "compact" mode: dong nho hon (h-10 thay vi h-12), font nho hon — toggle tu user
```

### UI-B Dot 6: FilterBar & Search Nang cap (10 buoc)
```
B6.01  FilterBar: them background card (bg-card border rounded-xl p-4) boc ngoai thay vi float
B6.02  FilterBar: them "Bo loc dang ap dung" badge bar phia tren voi X de xoa tung bo loc
B6.03  FilterBar: animation slide down khi mo bo loc tren mobile (Sheet dep hon)
B6.04  FilterBar: them date range picker (2 input date voi "-" o giua) la filter type moi
B6.05  FilterBar: them "Luu bo loc" icon star — luu bo loc thuong dung vao localStorage
B6.06  SearchSuggestions: them recent search history (luu localStorage), hien thi "Tim gan day" section
B6.07  SearchSuggestions: them keyboard navigation (mui ten len/xuong + Enter) cho dropdown
B6.08  SearchSuggestions: them highlight matched text trong suggestion (bold phan match)
B6.09  SearchSuggestions: them category grouping trong dropdown: "San pham", "NCC", "Don hang" sections
B6.10  FilterBar: them so luong ket qua hien thi ("Hien thi 1-20 / 156 ket qua") ngay trong FilterBar
```

### UI-B Dot 7: FormDialog & Input Enhancement (10 buoc)
```
B7.01  FormDialog: them slide-up animation tu duoi (mobile), scale animation (desktop)
B7.02  FormDialog: them progress steps indicator cho multi-step dialog (dot + line giua)
B7.03  FormDialog: them sticky footer (nut Luu/Huy luon o cuoi dialog khi scroll noi dung dai)
B7.04  Input: them floating label pattern (label bay len khi focus/co gia tri)
B7.05  Input: them character count cho textarea (XX/500)
B7.06  Input: them prefix/suffix slot (icon tien VND o dau, "kg" o cuoi)
B7.07  Input: them clear button (X) xuat hien khi co gia tri
B7.08  Select/Combobox: them avatar/icon ben canh option (VD: avatar NCC khi chon NCC)
B7.09  Form validation: hien thi loi inline (text do duoi input) voi animation shake nhe
B7.10  Them OTP-style input cho xac nhan (dung cho xac thuc 2 yeu to tuong lai)
```

### UI-B Dot 8: Card & Widget System (10 buoc)
```
B8.01  Tao StatsCard component moi: icon wrapper trai + so lon + label + trend indicator + sparkline mini
B8.02  StatsCard: them gradient border-left (4px) theo mau variant (primary, success, warning, danger)
B8.03  StatsCard: them hover effect — nang len nhe (translateY -2px) + shadow tang
B8.04  Tao DashboardWidget wrapper: header (title + "Xem tat ca" link) + content + optional footer
B8.05  DashboardWidget: them collapsible (nut ^ de thu gon widget), luu trang thai localStorage
B8.06  Tao InfoCard: layout ngang — icon | title + description | action button (dung cho CTA)
B8.07  Tao GlassCard variant: background blur, semi-transparent — dung cho hero overlay
B8.08  Tao MetricCard: so lon o giua, circular progress ring bao quanh, label phia duoi
B8.09  Cap nhat tat ca Card: them border-transparent hover:border-primary/10 transition
B8.10  Tao CardSkeleton matching tung loai card (Stats, Widget, Info) de consistent loading
```

### UI-B Dot 9: Notification & Feedback (10 buoc)
```
B9.01  Cap nhat toast style: them icon ben trai (CheckCircle xanh, XCircle do, AlertTriangle vang), border-left mau
B9.02  Them toast action button (VD: "Hoan tac" sau khi xoa) — dung Sonner action prop
B9.03  Cap nhat NotificationDropdown: them tab "Chua doc" / "Tat ca", dot unread indicator tren item
B9.04  NotificationDropdown: them avatar nguoi gui, thoi gian relative ("2 phut truoc"), grouped by ngay
B9.05  Tao ConfirmDialog component chung: icon canh bao + title + description + destructive button style
B9.06  ConfirmDialog: them type variant (danger: icon do, warning: icon vang, info: icon xanh)
B9.07  Tao InlineAlert component: banner ngang ben trong trang (info/warning/error/success) voi icon + text + close
B9.08  Tao Tooltip enhanced: them arrow, max-width, support rich content (khong chi text)
B9.09  Them loading overlay component: semi-transparent bg + spinner o giua — dung cho form submission
B9.10  Tao SuccessAnimation component: checkmark animation (SVG animated) hien sau khi tao thanh cong
```

---

## ========================================================
## GIAI DOAN UI-C: NAVIGATION & LAYOUT NANG CAP
## 40 buoc | Dot 10–13
## ========================================================

### UI-C Dot 10: Buyer Navigation Mega Menu (10 buoc)
```
C10.01  Thay horizontal nav 30+ items bang Mega Menu: chi hien 5-6 muc chinh tren header
C10.02  Mega Menu items chinh: "San pham", "Don hang", "Cong cu", "Tai chinh", "Ho tro"
C10.03  Mega Menu dropdown: grid 3-4 col, moi item co icon + ten + mo ta ngan, nhom theo category
C10.04  Mega Menu "San pham": San pham, NCC, So sanh, Danh muc, Yeu thich, Kham pha
C10.05  Mega Menu "Don hang": Don hang, Gio hang, Dat nhanh, Dat tu file, Don hang mau, Van chuyen, Tra hang
C10.06  Mega Menu "Cong cu": Bao gia (RFQ), Hop dong, Dau gia, Thoa thuan gia, YC mua, Nhan hang, Bao cao, Tich hop
C10.07  Mega Menu "Tai chinh": Thanh toan, Hoa don, Ngan sach, Cong no, Than thiet (loyalty)
C10.08  Mega Menu "Ho tro": Tin nhan, Bao hanh, Tai lieu, Thong bao, Nhom mua, Danh gia, Phan tich
C10.09  Mega Menu animation: fade-in + slide-down, close on click outside, keyboard accessible (Esc close)
C10.10  Mobile: giu Sheet menu nhung nhom theo cac nhom nhu tren, collapsible sections
```

### UI-C Dot 11: Buyer Header Polish (10 buoc)
```
C11.01  Cap nhat top bar: gradient background (primary -> primary/80) thay vi solid, text nho hon
C11.02  Logo: thay text "B2B" bang SVG logo dep hon voi gradient, them ten "VietB2B" hoac tuong tu
C11.03  Search bar: border-radius lon hon (rounded-full), them icon magnify animated, shadow khi focus
C11.04  Search bar: nen sang hon (bg-white border) noi bat tren header, chiem nhieu khong gian hon
C11.05  Header actions: Icon buttons co tooltip on hover, badge notification animation (pulse nhe)
C11.06  Avatar dropdown: them avatar image (fallback initials), them role badge mau, them plan/tier info
C11.07  Sticky header: them shadow nhe khi scroll xuong (shadow-sm), an top bar khi scroll xuong
C11.08  Them quick action bar duoi header: "Dat don nhanh" + "So sanh gia" + "Theo doi don" — 3 CTA noi bat
C11.09  Mobile header: logo nho hon, search icon (click expand), hamburger voi animation
C11.10  Them environment indicator (dev/staging) neu can — badge nho goc trai
```

### UI-C Dot 12: Seller Sidebar Nang cap (10 buoc)
```
C12.01  Nhom sidebar items thanh sections voi label: "Chinh", "Ban hang", "Van hanh", "Tai chinh", "Cai dat"
C12.02  Section "Chinh": Tong quan, San pham, Don hang
C12.03  Section "Ban hang": Bao gia, Hop dong, Khuyen mai, Dau gia, Thoa thuan gia
C12.04  Section "Van hanh": Kho hang, Van chuyen, Nhan hang, Tra hang, Bao hanh, Cam ket DV
C12.05  Section "Tai chinh": Cong no, Hoa don, Tin dung, Ghi no/co
C12.06  Section "Cai dat": Nhan vien, Phe duyet, Nhat ky, Tai lieu, Tich hop, Bao cao, Ho so
C12.07  Collapsible sections: click label de collapse/expand, luu trang thai localStorage
C12.08  Sidebar: them mini mode (chi hien icon, hover tooltip ten) — toggle button o cuoi sidebar
C12.09  Active item: them left border 3px primary + bg-primary/10, icon cung doi mau primary
C12.10  Sidebar footer: them user card nho (avatar + ten + role), nut Settings va Logout
```

### UI-C Dot 13: Admin Sidebar + Footer & Breadcrumb (10 buoc)
```
C13.01  Admin sidebar: nhom tuong tu Seller — "Tong quan", "Quan ly", "Noi dung", "He thong"
C13.02  Admin sidebar: them badge count ben canh menu items co pending (VD: "Duyet SP (5)")
C13.03  Admin sidebar: them quick stats mini o dau sidebar (tong user, don hom nay)
C13.04  Cap nhat AppBreadcrumb: them icon Home o dau, separator "/" dep hon (ChevronRight), truncate path dai
C13.05  AppBreadcrumb: them dropdown cho path segment (click vao "Don hang" -> dropdown cac sub-pages)
C13.06  Footer Buyer: redesign 4 col -> them logo, social links (icons), newsletter subscribe input
C13.07  Footer: them "Doi tac van chuyen" logos row, "Phuong thuc thanh toan" logos row
C13.08  Footer mobile: collapse columns thanh accordion
C13.09  Them global loading bar (NProgress style) o top khi navigate giua trang — dung motion
C13.10  Them "Lien he ho tro" floating button (goc phai duoi) voi chat icon, click mo chat
```

---

## ========================================================
## GIAI DOAN UI-D: TRANG CHU & XAC THUC
## 30 buoc | Dot 14–16
## ========================================================

### UI-D Dot 14: HomePage Redesign (10 buoc)
```
D14.01  Hero section: gradient background phuc tap hon (mesh gradient hoac 2 lop gradient + pattern overlay)
D14.02  Hero: them animated stats counter ("5,000+ NCC", "100K+ San pham", "50K+ Doanh nghiep") voi count-up
D14.03  Hero: them search bar noi bat ngay trong hero (thay vi chi CTA buttons)
D14.04  Hero image: thay ImageWithFallback bang illustration/abstract graphic — chuyen nghiep hon
D14.05  Benefits section: card co icon lon hon (48px), hover animation (scale + shadow), gradient icon bg
D14.06  Flash sale banner: them countdown timer component (ngay:gio:phut:giay), animation pulse
D14.07  Category section: them image/illustration cho moi category card, hover overlay effect
D14.08  Product cards: redesign — image lon hon (aspect 4:3), hover zoom, quick actions overlay (cart, wishlist, compare)
D14.09  Them "Tin tuong boi" section: logo row cac cong ty lon da su dung (trust badges)
D14.10  Them testimonial section: card voi avatar + ten + cong ty + nhan xet (carousel 3 items)
```

### UI-D Dot 15: HomePage Tiep tuc + CTA (10 buoc)
```
D15.01  Them "Cach hoat dong" section: 3 buoc voi icon + so thu tu + mo ta (1. Tim kiem, 2. Bao gia, 3. Dat hang)
D15.02  Them NCC noi bat section: card ngang voi logo + ten + rating + san pham + CTA "Xem cua hang"
D15.03  Them "Danh cho nha cung cap" CTA section: split layout — text trai + illustration phai + CTA "Bat dau ban"
D15.04  San pham grid: them lazy load (intersection observer), placeholder skeleton khi load
D15.05  Them category filter chips o tren product grid: click de filter nhanh
D15.06  Mobile hero: don gian hon, search bar noi bat, chi 1 CTA button
D15.07  Them parallax effect nhe cho hero background khi scroll
D15.08  Animation: stagger reveal cho cards khi scroll vao viewport (motion/react)
D15.09  Them "Moi xem gan day" section cuoi trang (localStorage luu productId da xem)
D15.10  Them newsletter subscribe section truoc footer: input email + CTA + mo ta ngan
```

### UI-D Dot 16: Auth Pages Redesign (10 buoc)
```
D16.01  Login: layout split — trai form (white bg), phai illustration/branding (gradient bg + text + stats)
D16.02  Login form: card voi shadow-xl, logo o tren, truong input floating label, button gradient primary
D16.03  Login: demo accounts section dep hon — card nho voi avatar color + role + 1-click fill
D16.04  Login: them social login buttons (Google, Microsoft) — chi UI, chua co logic
D16.05  Login: them animation khi chuyen giua login/register (slide trai/phai)
D16.06  Register: tuong tu split layout, them progress steps (Buoc 1: Tai khoan, Buoc 2: Cong ty, Buoc 3: Xac nhan)
D16.07  Register: them password strength indicator (4 muc: yeu/TB/manh/rat manh) voi thanh mau
D16.08  Forgot password dialog: dep hon voi icon mail, animation khi gui thanh cong
D16.09  Auth layout: phan phai hien carousel tu dong — 3 slide: "Nen tang so 1", "5000+ NCC", "Bao mat cao"
D16.10  Mobile auth: full width form, khong split, phan branding rut gon thanh logo + tagline
```

---

## ========================================================
## GIAI DOAN UI-E: BUYER PAGES NANG CAP
## 60 buoc | Dot 17–22
## ========================================================

### UI-E Dot 17: Product List & Detail (10 buoc)
```
E17.01  ProductList: product card redesign — aspect-ratio image, overlay gradient, price badge goc, rating stars
E17.02  ProductList: them "So sanh" checkbox overlay goc card, badge counter "Da chon X sp de so sanh"
E17.03  ProductList: grid view default 4 col desktop, 2 col tablet, 1 col mobile — responsive tot hon
E17.04  ProductList: them sidebar filter (desktop) ngoai FilterBar — range slider gia, checkbox danh muc
E17.05  ProductList: them "Sap xep theo" dropdown noi bat hon (khong nam trong DataTable header)
E17.06  ProductDetail: image gallery — thumbnail rail doc ben trai, main image lon ben phai, zoom on hover
E17.07  ProductDetail: sticky "Them vao gio" panel khi scroll qua product info
E17.08  ProductDetail: them tab "So sanh voi SP tuong tu" — bang so sanh 3 SP
E17.09  ProductDetail: them breadcrumb dep (Trang chu > Danh muc > Ten SP) voi category image
E17.10  ProductDetail: supplier info card dep hon — avatar, rating stars, badge "Da xac minh", CTA "Lien he"
```

### UI-E Dot 18: Cart & Checkout (10 buoc)
```
E18.01  Cart: redesign — 2 col layout (items trai 70%, summary phai 30% sticky)
E18.02  Cart item: image lon hon, quantity stepper dep hon (rounded, +/- buttons noi bat)
E18.03  Cart: them subtotal cho moi NCC group, border separator giua cac groups
E18.04  Cart summary card: gradient top border, item count, subtotal, thue VAT (10%), phi ship, tong cong lon
E18.05  Cart: them "Ban cung co the thich" recommendation section o duoi
E18.06  Cart empty: illustration dep, CTA "Kham pha san pham" noi bat
E18.07  OrderConfirmation: them timeline step (1. Dat hang -> 2. Xac nhan -> 3. Ship -> 4. Nhan hang) visual
E18.08  OrderConfirmation: them confetti/celebration animation khi dat hang thanh cong
E18.09  Cart: mobile — full width, summary bar fixed o duoi voi tong tien + nut "Thanh toan"
E18.10  Them "Ma giam gia" input dep hon: tag icon, apply button, animation khi ap dung thanh cong
```

### UI-E Dot 19: Order & RFQ Pages (10 buoc)
```
E19.01  OrderList: them status tabs o tren (Tat ca | Cho xac nhan | Dang giao | Da giao | Da huy) — FilterBar phia duoi
E19.02  OrderList: card view redesign — trai (order info), phai (status badge lon, nut hanh dong)
E19.03  OrderDetail: timeline visual dep hon — vertical line + dot mau + timestamp + mo ta, animate khi scroll
E19.04  OrderDetail: product items table dep hon — image thumbnail, gia x SL = thanh tien cot phai
E19.05  OrderDetail: them print-friendly CSS (@media print) — an nav, format cho A4
E19.06  RFQList: them status badge lon va mau sac noi bat, them remaining time countdown
E19.07  RFQCreate: multi-step form voi step indicator (1. SP, 2. Yeu cau, 3. Xem lai, 4. Gui)
E19.08  RFQDetail: so sanh bao gia bang — highlight gia tot nhat (xanh), gia cao nhat (do nhe)
E19.09  RFQDetail: them "Chon nha cung cap" UI dep — radio card voi check icon
E19.10  Them OrderTracking component visual: map/route illustration + steps
```

### UI-E Dot 20: Dashboard Buyer Nang cap (10 buoc)
```
E20.01  Stats cards: dung StatsCard component moi (gradient border, icon wrapper, trend, sparkline)
E20.02  Quick actions: redesign thanh grid 4x2 icon cards voi hover effect (khong phai list)
E20.03  Bieu do: them chart type toggle (Bar <-> Line <-> Area) cho spending trend
E20.04  Recent orders widget: them status color dot, time relative, hover row highlight
E20.05  Them "Nhac nho" widget: deadlines sap den (hop dong, thanh toan qua han) voi icon canh bao
E20.06  Them "Hieu suat mua hang" gauge chart (tiet kiem duoc X% so voi gia thi truong)
E20.07  Dashboard: them drag-and-drop reorder widgets (react-dnd) — tuy chinh layout
E20.08  Dashboard: them date range picker global (7d/30d/90d/custom) dep hon (button group)
E20.09  Mobile dashboard: 1 col, cards stack doc, chart full width, swipeable widgets
E20.10  Them "Tin moi" ticker/marquee o tren dashboard: tin khuyen mai, thong bao he thong
```

### UI-E Dot 21: Contract, Invoice, Payment Pages (10 buoc)
```
E21.01  ContractList: card layout — icon trang thai trai, thong tin giua, ngay + so tien phai
E21.02  ContractDetail: them contract status timeline (Tao -> Ky -> Thuc hien -> Hoan thanh)
E21.03  ContractDetail: milestones — them progress bar tong the (X/Y milestones hoan thanh)
E21.04  InvoiceList: them tong so tien cac filter (VD: "Tong chua thanh toan: 2.5 ty")
E21.05  InvoiceDetail: them print/PDF preview layout giong hoa don thuc (header cong ty, table items, tong)
E21.06  PaymentList: them payment calendar view (lich cac ngay den han thanh toan)
E21.07  PaymentDetail: them QR code mockup cho thanh toan
E21.08  Them PaymentSummary component: tong no, da tra, con lai — 3 metric cards
E21.09  Them overdue payment highlight: row do nhe, icon canh bao, badge "Qua han X ngay"
E21.10  Them bulk payment feature UI: chon nhieu hoa don -> thanh toan 1 lan
```

### UI-E Dot 22: Other Buyer Pages (10 buoc)
```
E22.01  WishlistPage: Pinterest-style masonry grid, image lon, overlay quick actions
E22.02  SupplierList: card voi cover image (banner), avatar, stats (SP, rating, don), CTA
E22.03  SupplierDetail: hero header voi cover image + avatar + ten + badge xac minh
E22.04  ProductCompare: fixed header khi scroll, highlight gia tot nhat/feature tot nhat
E22.05  BulkOrder: drag-drop file upload area dep (dashed border, icon upload, text huong dan)
E22.06  QuickOrder: them autocomplete input dep, them "San pham hay mua" suggestion
E22.07  ReviewsPage: them star distribution chart (5 bar), average score lon, filter by stars
E22.08  ReturnList: them return reason pie chart widget o tren, status tabs
E22.09  BuyerProfile: them cover photo area, avatar upload, progress bar "Ho so hoan thien X%"
E22.10  BuyerTeam: them org chart view (tree layout) ngoai table view
```

---

## ========================================================
## GIAI DOAN UI-F: SELLER PAGES NANG CAP
## 40 buoc | Dot 23–26
## ========================================================

### UI-F Dot 23: Seller Dashboard (10 buoc)
```
F23.01  Redesign stats cards: icon lon hon, gradient bg nhe, sparkline chart mini ben trong card
F23.02  Them "Doanh thu hom nay" widget lon noi bat — so tien lon + bieu do hourly
F23.03  "Can xu ly" section: card list voi icon mau + ten task + badge count + link di toi
F23.04  Bieu do: them smooth animation khi load data, them legend dep hon
F23.05  Recent orders: them customer avatar, status dot, amount aligned right
F23.06  Top products widget: them bieu do ngang (horizontal bar) thay vi chi text
F23.07  Them "Muc tieu thang" widget: progress bar voi target line
F23.08  Them "Tinh trang kho" widget: mini donut chart (du hang vs sap het vs het)
F23.09  Mobile: swipeable cards, chart full width, priority stack order
F23.10  Them welcome message personalized: "Chao {ten}, hom nay ban co {X} don moi"
```

### UI-F Dot 24: Seller Product & Order Pages (10 buoc)
```
F24.01  ProductList: them thumbnail image nho trong table row, hover preview card
F24.02  ProductForm: multi-step wizard (1. Thong tin, 2. Gia & Kho, 3. Hinh anh, 4. Xem lai)
F24.03  ProductForm: image upload area — drag-drop zone, preview thumbnails, reorder
F24.04  ProductForm: them rich text editor cho mo ta (bold, italic, list, link)
F24.05  OrderList: them kanban view (cot theo trang thai, keo tha card giua cot) — react-dnd
F24.06  OrderDetail: customer info card dep hon — avatar, ten, cong ty, lich su mua
F24.07  OrderDetail: them action buttons dep hon — primary CTA lon, secondary nho
F24.08  Them QuickActions floating menu tren Seller pages: "+ Don hang", "+ San pham", "Xuat bao cao"
F24.09  Them batch actions cho ProductList: chon nhieu -> "Duyet tat ca" / "An" / "Xuat Excel"
F24.10  ProductList: them stock indicator (cham xanh/vang/do) ben canh so luong
```

### UI-F Dot 25: Seller Finance & Warehouse (10 buoc)
```
F25.01  Warehouse page: them warehouse visual map (grid layout mo phong kho, hover zone chi tiet)
F25.02  Warehouse: stock alert cards dep hon — gradient border mau theo muc do (do = het, vang = sap het)
F25.03  ShipmentList: them shipping progress bar inline (5 buoc voi icon)
F25.04  PaymentList: them doanh thu chart (line/area) theo thang o tren
F25.05  InvoiceList: them invoice template preview khi hover
F25.06  CreditPage: them credit utilization gauge chart (% da dung / han muc)
F25.07  DebitCreditPage: them ledger-style layout (ben No | ben Co) voi tong o duoi
F25.08  AuctionPage: them countdown timer cho auction dang dien ra, highlight gia hien tai
F25.09  PriceAgreementPage: them comparison chart — gia thoa thuan vs gia thi truong
F25.10  SLAPage: them SLA compliance dashboard — gauge charts cho tung metric
```

### UI-F Dot 26: Seller Reports & Others (10 buoc)
```
F26.01  SellerReports: them bieu do interactive hon — click segment de drill down
F26.02  SellerReports: them "Xuat bao cao" options dep (PDF mockup, Excel, CSV) voi icon
F26.03  StaffList: them role badge mau, permission matrix UI dep (grid checkbox)
F26.04  ApprovalListPage: them approval flow visualization (dag/tree tu nguoi tao -> nguoi duyet)
F26.05  ActivityPage: them timeline dep hon — avatar + hanh dong + timestamp, grouped by ngay
F26.06  ReviewsPage: them sentiment indicator (mat cuoi/buon), response rate metric
F26.07  ReturnListPage: them return flow steps visualization
F26.08  WarrantyPage: them warranty card UI — nhu the bao hanh vat ly
F26.09  DocumentCenter: them file preview (PDF viewer mockup, image lightbox)
F26.10  ReportBuilder: them drag-drop column reorder (react-dnd), live chart preview khi cau hinh
```

---

## ========================================================
## GIAI DOAN UI-G: ADMIN PAGES NANG CAP
## 30 buoc | Dot 27–29
## ========================================================

### UI-G Dot 27: Admin Dashboard (10 buoc)
```
G27.01  Redesign stats: them icon gradient background, so dem animated, trend arrow
G27.02  Them "He thong" health status: CPU/Memory/Disk mockup gauges (hien thi mau gia lap)
G27.03  "Can xu ly" section: card grid voi badge count, priority color coding (do > cam > vang > xanh)
G27.04  Them real-time activity feed widget: scrolling list voi avatar + action + time
G27.05  Bieu do doanh thu: them dual axis (doanh thu bar + don hang line) trong cung chart
G27.06  Them geo map widget (Vietnam SVG map) — hien thi density don hang theo vung mien
G27.07  Them "Top NCC" leaderboard widget: avatar + ten + rating bar + doanh thu
G27.08  Them "Phan bo don hang" sankey/flow chart: Buyer -> Platform -> Seller
G27.09  Auto-refresh indicator: them animated dot + "Cap nhat luc HH:mm"
G27.10  Mobile admin: uu tien stats + pending items, an chart tren mobile nho
```

### UI-G Dot 28: Admin Management Pages (10 buoc)
```
G28.01  UserManagement: them user avatar + role color badge trong table, hover preview card
G28.02  UserManagement: them bulk actions bar (chon nhieu -> Khoa / Mo khoa / Xuat)
G28.03  CategoryManagement: tree view dep (indented voi line connector, folder icon, drag reorder)
G28.04  ProductApproval: them split view — list trai, preview detail phai (khong can mo dialog)
G28.05  ProductApproval: them image gallery slider trong preview panel
G28.06  OrderOverview: them order flow funnel chart (Created -> Confirmed -> Shipped -> Delivered)
G28.07  AdminSupplierPage: them supplier verification status progress (3 buoc voi icon)
G28.08  AdminCertificateReview: them document viewer inline (khong can download de xem)
G28.09  ReviewManagement: them AI sentiment tag mockup (Tich cuc / Trung tinh / Tieu cuc)
G28.10  SystemSettings: tab-based UI dep hon voi icon, section cards thay vi plain form
```

### UI-G Dot 29: Admin Charts & Reports (10 buoc)
```
G29.01  AdminReportPage: them chart animation on load (bars grow up, lines draw)
G29.02  Them comparison charts: thang nay vs thang truoc (overlay 2 data series)
G29.03  Them export button cho moi chart (download as PNG image)
G29.04  Them fullscreen mode cho chart (click expand icon -> modal full width chart)
G29.05  Them data point tooltip dep hon: card shadow voi nhieu thong tin
G29.06  ContractManagement: them contract value timeline chart
G29.07  RFQManagement: them RFQ funnel (Tao -> Gui -> Bao gia -> Chap nhan -> Don hang)
G29.08  AdminPaymentPage: them cash flow chart (tien vao vs tien ra theo thang)
G29.09  AdminShipmentPage: them delivery performance chart (on-time vs late %)
G29.10  Them "So sanh voi ky truoc" feature tren moi trang bao cao
```

---

## ========================================================
## GIAI DOAN UI-H: ANIMATION & MICRO-INTERACTION
## 30 buoc | Dot 30–32
## ========================================================

### UI-H Dot 30: Page Transitions & Loading (10 buoc)
```
H30.01  Cap nhat PageTransition: them stagger animation cho children (cards hien tuan tu)
H30.02  Them route transition: cross-fade giua cac trang (exit old + enter new)
H30.03  Them skeleton shimmer effect dep hon: gradient animation left-to-right
H30.04  Them content placeholder: skeleton match chinh xac layout cua trang (khong generic)
H30.05  Table row animation: row moi them vao animated slide down, row xoa animated fade out
H30.06  Dialog: them scale + fade animation (enter: scale 0.95->1, exit: scale 1->0.95)
H30.07  Sheet (mobile menu): smooth slide voi spring physics, overlay fade
H30.08  Tab content: them fade transition khi chuyen tab
H30.09  Them progress bar dau trang khi loading API (NProgress-like thin bar)
H30.10  Accordion/Collapsible: smooth height animation (khong nhay)
```

### UI-H Dot 31: Micro-interactions (10 buoc)
```
H31.01  Button: them ripple effect khi click (nhu Material UI)
H31.02  Button: loading state — spinner + text "Dang xu ly..." voi disable
H31.03  Card hover: them subtle scale(1.01) + shadow increase transition
H31.04  Checkbox: them checkmark draw animation (SVG path animation)
H31.05  Switch: them slide animation smooth, them icon On/Off trong switch
H31.06  Badge notification: them pulse animation khi co notification moi
H31.07  Heart/Wishlist icon: them fill animation khi click (scale bounce + color change)
H31.08  Copy button: them "Da sao chep!" tooltip appear animation + check icon replace
H31.09  Delete confirm: them shake animation tren dialog khi destructive
H31.10  Success toast: them confetti burst nho khi hoan thanh hanh dong quan trong
```

### UI-H Dot 32: Scroll & Reveal Animations (10 buoc)
```
H32.01  Homepage sections: reveal khi scroll vao viewport (fade up + stagger children)
H32.02  Dashboard stats cards: count-up animation khi scroll vao
H32.03  Chart: animate on first render (bars grow, lines draw, pie segments expand)
H32.04  Product grid: stagger fade in (card 1 hien truoc, card 2 sau 50ms, ...)
H32.05  Timeline: items reveal tuan tu khi scroll xuong (alternate left/right)
H32.06  Parallax background nhe cho hero sections (shift 10-20%)
H32.07  Sticky element animation: header shrink khi scroll, expand khi scroll up
H32.08  Infinite scroll trigger animation: spinner tai cuoi + "Dang tai them..."
H32.09  Image lazy load: placeholder blur -> sharp (blur-up effect)
H32.10  Number count animation cho bat ky so thong ke nao khi appear trong viewport
```

---

## ========================================================
## GIAI DOAN UI-I: MOBILE & RESPONSIVE OPTIMIZATION
## 20 buoc | Dot 33–34
## ========================================================

### UI-I Dot 33: Mobile UX (10 buoc)
```
I33.01  Mobile bottom nav: them animation active indicator (underline slide), badge count
I33.02  Mobile tables: chuyen sang card layout tu dong khi < 768px (responsive DataTable)
I33.03  Mobile forms: full-width inputs, large touch targets (min 44px), spacing tang
I33.04  Mobile dialogs: full screen (bottom sheet style) thay vi centered small
I33.05  Mobile product detail: image carousel swipeable, sticky bottom bar "Them gio hang"
I33.06  Mobile cart: summary bar fixed bottom voi "Thanh toan (X mon)" button
I33.07  Mobile search: full screen search overlay khi tap icon search
I33.08  Mobile filters: bottom sheet voi "Ap dung" button sticky bottom
I33.09  Pull-to-refresh gesture cho mobile list pages (animation + data reload)
I33.10  Mobile navigation: them swipe gestures (swipe right de mo sidebar)
```

### UI-I Dot 34: Tablet & Responsive Breakpoints (10 buoc)
```
I34.01  Tablet (768-1024px): sidebar collapse mac dinh, main content rong hon
I34.02  Tablet product grid: 3 col thay vi 2 hoac 4
I34.03  Tablet dashboard: 2 col stats, 1 col charts — khong bi chen
I34.04  Responsive images: them srcset/sizes cho product images (toi uu bandwidth)
I34.05  Responsive typography: heading nho hon tren mobile (clamp function)
I34.06  Print responsive: an navigation, sidebar, footer; format content cho A4
I34.07  Landscape mobile: xu ly dac biet cho image gallery, chart
I34.08  Container queries: dung @container cho Card de responsive theo parent (khong viewport)
I34.09  Touch-friendly: tang tat ca interactive elements len min 44x44px tren touch devices
I34.10  Test va fix overflow-x issues tren tat ca breakpoints (no horizontal scroll)
```

---

## ========================================================
## GIAI DOAN UI-J: POLISH & DELIGHT
## 20 buoc | Dot 35–36
## ========================================================

### UI-J Dot 35: Dark Mode & Accessibility (10 buoc)
```
J35.01  Them Dark Mode toggle button tren header (Sun/Moon icon) — luu localStorage
J35.02  Cap nhat tat ca hardcoded colors (bg-white, text-black) sang CSS variables
J35.03  Dark mode: kiem tra contrast ratio tat ca text (WCAG AA >= 4.5:1)
J35.04  Dark mode: cap nhat chart colors tuong thich dark background
J35.05  Dark mode: card borders, shadows tuong thich (lighter borders, glow shadows)
J35.06  Accessibility: them aria-labels cho tat ca icon-only buttons
J35.07  Accessibility: them focus-visible ring cho tat ca interactive elements
J35.08  Accessibility: them skip navigation link (da co SkipLink, kiem tra hoat dong)
J35.09  Accessibility: them role="status" cho toast, role="alert" cho error messages
J35.10  Accessibility: keyboard navigation test — Tab order logic, Escape close dialog
```

### UI-J Dot 36: Final Polish (10 buoc)
```
J36.01  Them onboarding tour cho user moi (tooltip sequence chi dan feature chinh) — mockup
J36.02  Them keyboard shortcuts display (? key) — da co CommandPalette, them shortcut hints tren tooltip
J36.03  Them "Moi" badge cho feature moi ra mat (hien 7 ngay, luu localStorage)
J36.04  Them smooth scroll-to-top button animation (rotate icon khi hover)
J36.05  Kiem tra va fix tat ca z-index stacking issues (header > dropdown > dialog > toast)
J36.06  Them consistent error pages: 404 dep (illustration), 500, offline
J36.07  Them app-wide loading overlay cho heavy operations (import file, generate report)
J36.08  Them "Tinh nang moi" changelog dialog (moi lan update, hien cho user moi)
J36.09  Performance: lazy load heavy components (charts, maps) voi dynamic import
J36.10  Final QA: kiem tra 100% trang tren Chrome + Firefox + Safari + Mobile Safari
```

---

# ============================================================
# TONG KET
# ============================================================
#
# Tong: ~360 buoc | 36 dot | 10 giai doan
#
# UI-A: Nen tang thiet ke (Theme, Font, Spacing, Icons)         — 40 buoc
# UI-B: Shared Components nang cap                              — 50 buoc
# UI-C: Navigation & Layout                                     — 40 buoc
# UI-D: Trang chu & Xac thuc                                    — 30 buoc
# UI-E: Buyer Pages nang cap                                    — 60 buoc
# UI-F: Seller Pages nang cap                                   — 40 buoc
# UI-G: Admin Pages nang cap                                    — 30 buoc
# UI-H: Animation & Micro-interaction                           — 30 buoc
# UI-I: Mobile & Responsive                                     — 20 buoc
# UI-J: Dark Mode, Accessibility & Polish                       — 20 buoc
#
# THU TU UU TIEN:
#   1. UI-A (nen tang) -> Moi thay doi sau se ke thua
#   2. UI-B (shared components) -> Tat ca trang huong loi
#   3. UI-C (navigation) -> Trai nghiem dieu huong tot hon ngay
#   4. UI-D (trang chu + auth) -> First impression
#   5. UI-E (buyer) -> Nguoi dung chinh
#   6. UI-H (animation) -> Them "wow factor"
#   7. UI-F (seller) -> Nguoi ban
#   8. UI-G (admin) -> Quan tri vien
#   9. UI-I (mobile) -> Responsive
#  10. UI-J (polish) -> Hoan thien cuoi
#
# ============================================================
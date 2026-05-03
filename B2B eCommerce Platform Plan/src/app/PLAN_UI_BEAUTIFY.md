# KE HOACH NANG CAP GIAO DIEN TOAN DIEN
## San TMDT B2B — Dep hon, Hien dai hon, Chuyen nghiep hon, De dung hon
## 380 buoc | 19 nhom | 12 dot trien khai

> Ngay lap: 14/03/2026
> Phien ban: UI/UX V1.0
> Trang thai hien tai: Giao dien chuc nang (functional) nhung thieu ban sac, thieu chieu sau thi giac
> Muc tieu: Nang cap len giao dien cap enterprise — ngang Alibaba / IndiaMART / SAP Ariba

---

## TRIET LY THIET KE

1. **Brand Identity**: Chuyen tu primary den (#030213) sang xanh duong B2B chuyen nghiep (blue-600 #2563eb) voi gradient accent
2. **Visual Depth**: Tang chieu sau bang shadow, glassmorphism, subtle gradient, border-radius lon hon
3. **Micro-interactions**: Moi thao tac co phan hoi thi giac — hover, click, transition, skeleton
4. **Whitespace**: Tang khoang tho cho UI — khong chat choi, de doc, de quet mat
5. **Consistency**: Thong nhat mau sac, spacing, border-radius, font-size tren TOAN BO ung dung
6. **Mobile-first Refinement**: Touch target lon, gesture support, bottom sheet thay vi dialog tren mobile
7. **Progressive Disclosure**: An do phuc tap, chi hien khi can — collapsible, expandable, tooltip

---

## TONG QUAN 19 NHOM

| #  | Nhom                                            | Buoc | Dot     | Muc do    |
|----|-------------------------------------------------|------|---------|-----------|
| U01 | Design Token & Theme System                    | 28   | D1      | NEN TANG  |
| U02 | Typography & Font Refinement                   | 16   | D1      | NEN TANG  |
| U03 | Color Palette & Brand Identity                 | 18   | D1-D2   | NEN TANG  |
| U04 | Shared Component Facelift                       | 32   | D2-D3   | QUAN TRONG|
| U05 | Layout & Navigation Redesign                    | 28   | D3-D4   | QUAN TRONG|
| U06 | Animation & Micro-interactions                  | 24   | D4-D5   | NOI BAT   |
| U07 | Form & Input Beautification                     | 20   | D5      | QUAN TRONG|
| U08 | Data Visualization & Charts                     | 16   | D5-D6   | QUAN TRONG|
| U09 | Card & Surface Design                           | 18   | D6      | NOI BAT   |
| U10 | Buyer — Trang chu & Landing                     | 26   | D6-D7   | RA MAT    |
| U11 | Buyer — Product & Supplier Pages                | 24   | D7-D8   | RA MAT    |
| U12 | Buyer — Order, Cart, Checkout Flow              | 20   | D8      | QUAN TRONG|
| U13 | Buyer — Dashboard & Utility Pages               | 18   | D8-D9   | QUAN TRONG|
| U14 | Seller — Dashboard & Layout                     | 22   | D9-D10  | QUAN TRONG|
| U15 | Seller — Product, Order, Report Pages           | 20   | D10     | QUAN TRONG|
| U16 | Admin — Dashboard & Layout                      | 18   | D10-D11 | QUAN TRONG|
| U17 | Admin — Management Pages                        | 16   | D11     | QUAN TRONG|
| U18 | Auth Pages & Onboarding                         | 16   | D11-D12 | RA MAT    |
| U19 | Dark Mode, A11y, Final Polish                   | 20   | D12     | HOAN THIEN|

**Tong: 380 buoc / 12 dot**

---

## =====================================================
## NHOM U01: DESIGN TOKEN & THEME SYSTEM
## 28 buoc | Dot 1 | NEN TANG
## =====================================================

### U01A. CSS Custom Properties mo rong (8 buoc)
```
U01A.01  Them --brand-50 den --brand-900 (xanh duong B2B: #eff6ff → #1e3a8a) vao theme.css
U01A.02  Them --success-50 den --success-700 (xanh la: #f0fdf4 → #15803d)
U01A.03  Them --warning-50 den --warning-700 (vang: #fffbeb → #a16207)
U01A.04  Them --danger-50 den --danger-700 (do: #fef2f2 → #b91c1c)
U01A.05  Them --info-50 den --info-700 (xanh nhat: #eff6ff → #1d4ed8)
U01A.06  Them --surface-1, --surface-2, --surface-3 (cac lop do sau background)
U01A.07  Them --shadow-xs, --shadow-sm, --shadow-md, --shadow-lg, --shadow-xl (he thong shadow)
U01A.08  Them --radius-xs(2px), --radius-sm(4px), --radius-md(8px), --radius-lg(12px), --radius-xl(16px), --radius-2xl(24px)
```

### U01B. Spacing & Layout Tokens (6 buoc)
```
U01B.01  Them --spacing-page (padding trang: 24px mobile, 32px tablet, 48px desktop)
U01B.02  Them --spacing-section (khoang cach giua cac section: 32px→48px)
U01B.03  Them --spacing-card (padding card: 16px→24px)
U01B.04  Them --container-sm(640px), --container-md(768px), --container-lg(1024px), --container-xl(1280px), --container-2xl(1440px)
U01B.05  Them --header-height (64px), --sidebar-width (260px), --sidebar-collapsed(64px)
U01B.06  Them --bottom-nav-height (56px mobile), --breadcrumb-height (40px)
```

### U01C. Motion Tokens (6 buoc)
```
U01C.01  Them --duration-instant(100ms), --duration-fast(200ms), --duration-normal(300ms), --duration-slow(500ms)
U01C.02  Them --ease-in, --ease-out, --ease-in-out, --ease-spring, --ease-bounce
U01C.03  Them --transition-colors: color [duration] [ease]
U01C.04  Them --transition-transform: transform [duration] [ease]
U01C.05  Them --transition-opacity: opacity [duration] [ease]
U01C.06  Them --transition-all: all [duration] [ease]
```

### U01D. Tailwind v4 Utilities (8 buoc)
```
U01D.01  Tao utility class .glass — backdrop-blur + bg-white/80 + border
U01D.02  Tao utility class .surface-elevated — shadow-md + bg-card + radius-lg
U01D.03  Tao utility class .text-gradient — background-clip text + gradient brand
U01D.04  Tao utility class .hover-lift — translateY(-2px) + shadow on hover
U01D.05  Tao utility class .hover-glow — box-shadow brand-500/20 on hover
U01D.06  Tao utility class .animate-slide-up, .animate-slide-down, .animate-fade-in
U01D.07  Tao utility class .ring-brand — focus ring mau brand
U01D.08  Tao utility class .divider-gradient — separator voi gradient thay vi solid
```

---

## =====================================================
## NHOM U02: TYPOGRAPHY & FONT REFINEMENT
## 16 buoc | Dot 1 | NEN TANG
## =====================================================

### U02A. Font System (6 buoc)
```
U02A.01  Import Inter Variable (wght@300..700) thay vi chi 400,500,600,700 — smooth scaling
U02A.02  Them font mono: JetBrains Mono — cho ma don hang, gia, code snippet
U02A.03  Them font display: Inter Display (hoac nang bold cho heading) — cho hero, tieu de lon
U02A.04  Dat font-feature-settings: "cv02","cv03","cv04","cv11" cho Inter — bo so dep hon
U02A.05  Dat letter-spacing: -0.025em cho heading, 0.01em cho body text nho
U02A.06  Dat line-height: 1.2 cho heading, 1.6 cho body — tang readability
```

### U02B. Typography Scale (6 buoc)
```
U02B.01  Cap nhat h1: 30px/700 (desktop), 24px/700 (mobile) — bold, impact
U02B.02  Cap nhat h2: 24px/600 (desktop), 20px/600 (mobile) — section heading
U02B.03  Cap nhat h3: 18px/600 — card heading, dialog title
U02B.04  Cap nhat body: 15px/400, small: 13px/400, xs: 11px/400
U02B.05  Cap nhat label: 13px/500 uppercase letter-spacing 0.05em — form label noi bat
U02B.06  Tao class .text-display: 36px/800 letter-spacing -0.03em — cho hero, so lon tren dashboard
```

### U02C. Text Utilities (4 buoc)
```
U02C.01  Tao class .text-balance — text-wrap: balance cho heading (tranh xuong dong xau)
U02C.02  Tao class .text-pretty — text-wrap: pretty cho paragraph
U02C.03  Tao class .truncate-2, .truncate-3 — gioi han dong voi -webkit-line-clamp
U02C.04  Tao class .prose — style cho noi dung rich-text (description san pham, mo ta hop dong)
```

---

## =====================================================
## NHOM U03: COLOR PALETTE & BRAND IDENTITY
## 18 buoc | Dot 1-2 | NEN TANG
## =====================================================

### U03A. Primary Brand Color (6 buoc)
```
U03A.01  Doi --primary tu #030213 (den) sang #2563eb (blue-600) — xanh B2B chuyen nghiep
U03A.02  Doi --primary-foreground sang #ffffff
U03A.03  Cap nhat --ring sang brand-500/30
U03A.04  Cap nhat sidebar-primary sang brand-600, sidebar-primary-foreground sang white
U03A.05  Cap nhat button primary: gradient tu brand-600 den brand-700 voi hover brand-500
U03A.06  Kiem tra va fix tat ca noi dung primary tren toan ung dung sau khi doi mau
```

### U03B. Semantic Colors (6 buoc)
```
U03B.01  Tao bien --success: #16a34a (green-600) va --success-foreground
U03B.02  Tao bien --warning: #ca8a04 (yellow-600) va --warning-foreground
U03B.03  Tao bien --info: #2563eb (blue-600) va --info-foreground
U03B.04  Cap nhat --destructive sang #dc2626 (red-600), sac do hien dai hon
U03B.05  Cap nhat StatusBadge.tsx: dung gradient background nhe + icon dot thay vi chi mau nen
U03B.06  Cap nhat tat ca toast: success=xanh la, error=do, info=xanh duong, warning=vang — nhat quan
```

### U03C. Surface & Background (6 buoc)
```
U03C.01  Doi --background tu #ffffff sang #f8fafc (slate-50) — nen nhe xam thay vi trang tinh
U03C.02  Giu --card la #ffffff — card noi bat tren nen xam nhe
U03C.03  Them --surface-subtle: #f1f5f9 (slate-100) — cho row striping, hover state
U03C.04  Them --surface-muted: #e2e8f0 (slate-200) — cho divider, skeleton
U03C.05  Cap nhat tat ca page background: bg-slate-50/80 thay vi bg-background trang
U03C.06  Cap nhat header background: backdrop-blur-xl + bg-white/90 — glass effect
```

---

## =====================================================
## NHOM U04: SHARED COMPONENT FACELIFT
## 32 buoc | Dot 2-3 | QUAN TRONG
## =====================================================

### U04A. DataTable Redesign (10 buoc)
```
U04A.01  Them header row gradient background (slate-50 → white) thay vi border don gian
U04A.02  Tang row height: 48px → 52px, tang padding cell
U04A.03  Them row hover: bg-brand-50/50 voi transition, cursor-pointer
U04A.04  Them row stripe: even row bg-slate-50/50 (alternating rows)
U04A.05  Them sort icon animation: rotate, color change khi active
U04A.06  Redesign pagination: rounded-full buttons, active page = brand-600
U04A.07  Them column resize handle (drag-to-resize)
U04A.08  Them bulk selection: checkbox column + floating action bar o cuoi
U04A.09  Card view mode: shadow-md, hover-lift, gia + status overlay
U04A.10  Empty state: illustration SVG dep thay vi chi text
```

### U04B. FilterBar Redesign (6 buoc)
```
U04B.01  Chuyen FilterBar sang style "chip/pill" — moi filter la 1 chip rounded-full
U04B.02  Active filter chip: brand-100 bg + brand-700 text + X button
U04B.03  Search input: rounded-full, icon search trong, clear button (X) khi co text
U04B.04  Them animation: filter chip xuat hien voi slide-in, bien mat voi fade-out
U04B.05  Mobile: filter bar co the cuon ngang (horizontal scroll) thay vi wrap
U04B.06  Them "Xoa tat ca" button khi co >= 2 filter active
```

### U04C. StatusBadge Redesign (4 buoc)
```
U04C.01  Them dot indicator (cham tron nho) truoc text — giong Shopify/Stripe
U04C.02  Dot co animation pulse cho trang thai "Dang xu ly", "Dang giao"
U04C.03  Tang border-radius thanh rounded-full (pill shape)
U04C.04  Them icon nho (optional) — check cho "Hoan thanh", clock cho "Cho xu ly"
```

### U04D. FormDialog Redesign (4 buoc)
```
U04D.01  Dialog overlay: backdrop-blur-sm thay vi chi bg-black/50
U04D.02  Dialog panel: shadow-2xl, rounded-2xl, padding 24→32px
U04D.03  Them slide-up animation (tu duoi len) cho dialog — mobile-friendly
U04D.04  Dialog header: divider gradient, icon truoc title
```

### U04E. Other Shared Components (8 buoc)
```
U04E.01  AppBreadcrumb: them icon Home o dau, separator "/" → chevron icon, hover underline
U04E.02  EmptyState: tang size icon 8→12, them nen gradient nhe (brand-50 circle), them illustration SVG
U04E.03  PageSkeleton: dung shimmer animation (gradient chay trai→phai) thay vi pulse
U04E.04  ScrollToTopButton: rounded-full, shadow-lg, brand color, scale animation on hover
U04E.05  NotificationDropdown: them avatar nguoi gui, timestamp relative, grouped by date
U04E.06  CommandPalette: them recent searches, them icon cho tung ket qua, keyboard hint
U04E.07  ViewToggle: icon buttons voi tooltip, active state brand color
U04E.08  ImportDialog: drag-and-drop zone voi dashed border animation, file preview
```

---

## =====================================================
## NHOM U05: LAYOUT & NAVIGATION REDESIGN
## 28 buoc | Dot 3-4 | QUAN TRONG
## =====================================================

### U05A. Buyer Header Redesign (8 buoc)
```
U05A.01  Top bar: gradient brand-700 → brand-800 thay vi solid primary
U05A.02  Main header: tang height 56→64px, them logo placeholder (text + icon dep hon)
U05A.03  Search bar: rounded-full, width 40-60%, shadow-sm, expand on focus voi animation
U05A.04  Cart icon: them badge so luong voi animation bounce khi them SP
U05A.05  User dropdown: avatar + ten + role, divider giua nhom menu
U05A.06  Mega menu cho danh muc: dropdown full-width voi grid layout khi hover
U05A.07  Mobile header: search icon → expand to full search bar overlay
U05A.08  Them "Sticky header" voi shrink animation khi scroll xuong
```

### U05B. Seller Sidebar Redesign (8 buoc)
```
U05B.01  Sidebar header: them company logo/avatar + ten cong ty
U05B.02  Sidebar item: them left-border indicator (3px brand) cho active item
U05B.03  Them nhom menu voi label: "Quan ly", "Ban hang", "Bao cao", "Cau hinh"
U05B.04  Them collapse/expand sidebar voi icon-only mode (64px width)
U05B.05  Them notification badge tren menu item (VD: 3 don cho xu ly)
U05B.06  Hover state: bg transition smooth, icon color transition
U05B.07  Bottom section: them quick-stats mini (doanh thu hom nay, don moi)
U05B.08  Mobile sidebar: full-height sheet voi overlay blur
```

### U05C. Admin Sidebar Redesign (6 buoc)
```
U05C.01  Them Admin branding: icon Shield + "Admin Panel" voi gradient text
U05C.02  Them grouped sections: "Tong quan", "Quan ly noi dung", "He thong"
U05C.03  Them nested sub-menu (collapsible) cho nhom lon (VD: Bao cao → Doanh thu, San pham, KH)
U05C.04  Active item: bg brand-50 + left border brand-500 + font-medium
U05C.05  Them search menu items — input filter nhanh trong sidebar
U05C.06  Footer: version app + link changelog
```

### U05D. Footer & Global (6 buoc)
```
U05D.01  Tao Buyer Footer component: 4 col (Ve chung toi, Lien ket, Ho tro, Lien he) + copyright
U05D.02  Footer gradient: bg-slate-900 text-slate-300, nen dam chuyen nghiep
U05D.03  Them social icons (placeholder): Facebook, LinkedIn, Twitter
U05D.04  Them "Newsletter" signup form mini trong footer
U05D.05  Breadcrumb: hien tren tat ca cac trang (tru trang chu), style nhat quan
U05D.06  Them loading bar (NProgress-style) o top khi chuyen trang — thanh xanh chay tu trai sang phai
```

---

## =====================================================
## NHOM U06: ANIMATION & MICRO-INTERACTIONS
## 24 buoc | Dot 4-5 | NOI BAT
## =====================================================

### U06A. Page Transitions (6 buoc)
```
U06A.01  Nang cap PageTransition: stagger children (tung phan tu xuat hien lech thoi gian)
U06A.02  Hero section: fade-in + slide-up cho text, scale-in cho hinh anh
U06A.03  Stat cards: count-up animation cho so (0 → gia tri thuc)
U06A.04  DataTable: row stagger fade-in khi load data moi
U06A.05  Dialog: spring animation (overshoot nhe) khi mo
U06A.06  Toast: slide-in tu goc phai + progress bar tu dong
```

### U06B. Hover & Click Effects (8 buoc)
```
U06B.01  Button primary: subtle gradient shift + shadow increase on hover
U06B.02  Button primary: scale(0.98) khi click (press effect)
U06B.03  Card product: lift-up 4px + shadow-lg on hover
U06B.04  Card product: image scale(1.05) on hover voi overflow hidden
U06B.05  Nav link: underline slide-in tu trai sang phai on hover
U06B.06  Icon button: rotate 15deg on hover (settings gear, refresh)
U06B.07  Sidebar item: icon bounce nhe khi hover
U06B.08  Avatar: ring brand-500 scale-in on hover
```

### U06C. Loading & Feedback (6 buoc)
```
U06C.01  Tao FullPageLoader: logo pulse + skeleton shimmer
U06C.02  Tao InlineLoader: spinner nho brand color cho button loading
U06C.03  Skeleton shimmer: gradient chay smooth (khong giat)
U06C.04  Pull-to-refresh gesture indicator (mobile)
U06C.05  Success animation: checkmark draw SVG animated
U06C.06  Error animation: shake ngang nhe cho form error
```

### U06D. Scroll Animations (4 buoc)
```
U06D.01  Tao hook useInView — trigger animation khi element vao viewport
U06D.02  Stat cards on homepage: fade-in + slide-up khi cuon den
U06D.03  Supplier cards: stagger reveal khi cuon den section
U06D.04  Parallax nhe cho hero background image (translateY theo scroll)
```

---

## =====================================================
## NHOM U07: FORM & INPUT BEAUTIFICATION
## 20 buoc | Dot 5 | QUAN TRONG
## =====================================================

### U07A. Input Redesign (8 buoc)
```
U07A.01  Input: border tu transparent sang slate-200, focus: ring-2 brand-500 + border-brand-500
U07A.02  Input: tang height 36→40px, padding-x 12→16px
U07A.03  Input label: chuyen sang floating label (label noi len khi focus/co gia tri)
U07A.04  Input error: red ring + error message slide-down animation
U07A.05  Input success: green ring + check icon
U07A.06  Textarea: auto-grow (tu dong tang chieu cao theo noi dung)
U07A.07  Select: custom dropdown voi search (combobox style) — dep hon native
U07A.08  Date picker: them quick buttons (Hom nay, Hom qua, 7 ngay truoc, 30 ngay truoc)
```

### U07B. Form Layout (6 buoc)
```
U07B.01  Form section: them divider + section title giua cac nhom field
U07B.02  Form 2-column layout: responsive — 2 col desktop, 1 col mobile
U07B.03  Required field: them dau * do truoc label (nhat quan toan bo)
U07B.04  Helper text: text nho mau muted duoi input (huong dan nhap)
U07B.05  Form action buttons: sticky bottom bar tren mobile (khong bi mat khi cuon)
U07B.06  Form progress: step indicator cho form nhieu buoc (Checkout, RFQ Create)
```

### U07C. Special Inputs (6 buoc)
```
U07C.01  Price input: them "d" (dong) suffix, format so khi blur (1000000 → 1.000.000)
U07C.02  Phone input: format tu dong (0912 345 678)
U07C.03  Quantity input: +/- buttons 2 ben, min/max validation truc quan
U07C.04  File upload: drag-drop zone dep voi icon, preview file, progress bar
U07C.05  Tag input: them tag khi Enter, xoa tag khi X — cho filter nhieu gia tri
U07C.06  Color picker mini: cho trang cau hinh — dung cho brand color settings
```

---

## =====================================================
## NHOM U08: DATA VISUALIZATION & CHARTS
## 16 buoc | Dot 5-6 | QUAN TRONG
## =====================================================

### U08A. Chart Theme (6 buoc)
```
U08A.01  Doi chart color palette: brand-500, emerald-500, amber-500, rose-500, violet-500, cyan-500
U08A.02  Chart background: transparent (khong co nen xam)
U08A.03  Grid lines: dasched, mau nhe (#e2e8f0)
U08A.04  Tooltip: rounded-lg, shadow-lg, bg-white, border — giong card
U08A.05  Legend: custom legend voi dot tron + text, co the click de toggle series
U08A.06  Responsive chart: height tu dong theo container, khong fix cung
```

### U08B. Chart Enhancements (6 buoc)
```
U08B.01  AreaChart: gradient fill tu brand-500/30 xuong transparent
U08B.02  BarChart: rounded corner (radius 4px), hover highlight bar
U08B.03  PieChart: donut style (innerRadius 60%), label trong giua
U08B.04  Them sparkline component — bieu do mini nho trong stat card
U08B.05  Them chart loading skeleton — hinh dang tuong tu chart thay vi rectangle
U08B.06  Them "No data" state dep cho chart — icon + message
```

### U08C. Dashboard Widgets (4 buoc)
```
U08C.01  Stat card: them trend arrow (up/down) voi mau va animation
U08C.02  Stat card: them sparkline mini (50x20px) phia duoi so
U08C.03  KPI card: them progress ring (circular progress) cho ti le
U08C.04  Tao widget "Hoat dong gan day" — timeline voi avatar, action, timestamp
```

---

## =====================================================
## NHOM U09: CARD & SURFACE DESIGN
## 18 buoc | Dot 6 | NOI BAT
## =====================================================

### U09A. Card System (8 buoc)
```
U09A.01  Base card: shadow-sm → shadow-md on hover, transition-shadow
U09A.02  Card header: them left border 3px brand khi la card quan trong
U09A.03  Card hover: translateY(-2px) + shadow-lg — lift effect
U09A.04  Featured card: gradient border (brand-500 → purple-500)
U09A.05  Stat card: icon voi vong tron gradient background (brand-50 → brand-100)
U09A.06  Product card: image 4:3 ratio, overlay gradient tu transparent → black/50 o duoi
U09A.07  Product card: quick-action buttons (cart, wishlist) xuat hien on hover
U09A.08  Supplier card: verified badge (shield check + "Da xac minh"), rating star
```

### U09B. Surface Patterns (6 buoc)
```
U09B.01  Page header section: gradient background (slate-50 → white) cho tieu de trang
U09B.02  Section divider: gradient line (transparent → border → transparent)
U09B.03  Sidebar: subtle shadow-sm ben phai, khong chi border
U09B.04  Modal backdrop: blur-md thay vi chi opacity
U09B.05  Notification panel: glass effect (backdrop-blur + bg-white/90)
U09B.06  Sticky elements (header, filter bar): them shadow-sm khi sticky
```

### U09C. Content Containers (4 buoc)
```
U09C.01  Tao InfoBox component: icon + title + content — cho thong tin quan trong (border-l-4)
U09C.02  Tao AlertBanner: full-width alert (warning/error/success/info) voi icon + dismiss
U09C.03  Tao FeatureCard: icon + title + desc + action — cho landing page
U09C.04  Tao PricingCard: highlight recommended option, price lon, feature list
```

---

## =====================================================
## NHOM U10: BUYER — TRANG CHU & LANDING
## 26 buoc | Dot 6-7 | RA MAT
## =====================================================

### U10A. Hero Section Redesign (8 buoc)
```
U10A.01  Hero background: gradient mesh (blue-600 → purple-600 → indigo-600) thay vi solid
U10A.02  Them dot pattern overlay (subtle) cho hero — chuyen nghiep
U10A.03  Hero text: dung .text-display, them text-shadow nhe
U10A.04  CTA buttons: primary=gradient brand, secondary=glass button (bg-white/20 + backdrop-blur)
U10A.05  Hero image: them floating elements — badge "Uy tin", "1000+ NCC", "50K+ SP"
U10A.06  Search bar lon trong hero (thay vi chi CTA) — search san pham/NCC ngay tu hero
U10A.07  Them animated stats counter trong hero: "10.000+ doanh nghiep", "50.000+ san pham"
U10A.08  Mobile hero: full-screen height, text center, CTA stack vertical
```

### U10B. Categories Section (4 buoc)
```
U10B.01  Category card: icon lon hon (40→56px), gradient background tuy theo danh muc
U10B.02  Them image/illustration cho moi danh muc thay vi chi icon
U10B.03  Hover: scale(1.02) + shadow-lg + brand overlay nhe
U10B.04  Mobile: horizontal scroll carousel thay vi grid 2 cot
```

### U10C. Featured Products (6 buoc)
```
U10C.01  Section heading: them decorative line 2 ben text "San pham noi bat"
U10C.02  Product card: image zoom on hover, badge "Moi" / "Hot" / "Giam gia"
U10C.03  Product card: quick-add button xuat hien on hover (mobile: hien mac dinh)
U10C.04  Price: dung font mono, mau brand, price goc gach ngang khi co khuyen mai
U10C.05  Them "Xem them" button cuoi section — load more hoac link den /products
U10C.06  Slider/carousel cho mobile — vuot trai/phai
```

### U10D. Supplier Section & CTA (4 buoc)
```
U10D.01  Supplier card: avatar lon + verified badge + rating + so san pham
U10D.02  Them testimonial slider: "Doanh nghiep noi gi ve chung toi"
U10D.03  CTA section cuoi trang: gradient background, "Bat dau ban hang tren nen tang"
U10D.04  Trust badges section: logo doi tac/chung chi (placeholder)
```

### U10E. Homepage Performance (4 buoc)
```
U10E.01  Lazy load tung section (IntersectionObserver) — chi render khi cuon den
U10E.02  Image lazy loading voi blur placeholder
U10E.03  Skeleton cho tung section rieng biet khi loading
U10E.04  Optimistic rendering: hien skeleton truoc, data fill vao sau
```

---

## =====================================================
## NHOM U11: BUYER — PRODUCT & SUPPLIER PAGES
## 24 buoc | Dot 7-8 | RA MAT
## =====================================================

### U11A. Product List Page (8 buoc)
```
U11A.01  Them sidebar filter trai (desktop) — category tree, price range slider, rating filter
U11A.02  Grid view: 3-4 col desktop, 2 col mobile, card dep hon voi hover
U11A.03  List view: hinh nho trai + thong tin phai — giong Amazon
U11A.04  Quick view: click icon "mat" → modal preview nhanh (khong chuyen trang)
U11A.05  Active filter chips: hien phia tren grid, rounded-full, co X de xoa
U11A.06  Sort dropdown: dep hon voi icon, checkmark active option
U11A.07  Result count: "1-20 tren 156 san pham" voi font medium
U11A.08  "Khong tim thay" state: illustration dep + goi y tim kiem khac
```

### U11B. Product Detail Page (10 buoc)
```
U11B.01  Image gallery: main image lon + thumbnail list duoi, click de zoom
U11B.02  Image zoom: hover de zoom-in (loupe effect) tren desktop
U11B.03  Product info: price lon + discount badge, stock status, MOQ
U11B.04  Them size/variant selector: visual buttons (khong chi select dropdown)
U11B.05  Quantity: redesign +/- buttons dep hon, disable khi = MOQ
U11B.06  "Them vao gio" button: gradient brand, icon cart, loading animation
U11B.07  Tabs (Mo ta, Thong so, Danh gia): underline style, smooth transition
U11B.08  Related products section: carousel horizontal
U11B.09  Supplier info box: avatar, verified badge, link "Xem gian hang", chat button
U11B.10  Mobile: sticky bottom bar voi gia + "Them vao gio" button
```

### U11C. Supplier Pages (6 buoc)
```
U11C.01  Supplier list: card grid, verified badge noi bat, rating stars
U11C.02  Supplier detail: cover image + avatar (giong Facebook page)
U11C.03  Supplier detail tabs: San pham, Gioi thieu, Chung chi, Danh gia
U11C.04  Them map placeholder cho dia chi supplier
U11C.05  Contact form/chat CTA noi bat
U11C.06  Product grid cua supplier: filter rieng, phan trang
```

---

## =====================================================
## NHOM U12: BUYER — ORDER, CART, CHECKOUT FLOW
## 20 buoc | Dot 8 | QUAN TRONG
## =====================================================

### U12A. Cart Page Redesign (6 buoc)
```
U12A.01  Cart item: hinh anh lon hon (80x80), ten san pham bold, NCC link
U12A.02  Quantity selector: +/- buttons voi transition, update tuc thi
U12A.03  Tong phu: card sticky ben phai (desktop), sliding summary bottom (mobile)
U12A.04  Empty cart: illustration dep + CTA "Tiep tuc mua sam"
U12A.05  Them "Ma giam gia" input voi apply button
U12A.06  Them "San pham da xem gan day" section o cuoi
```

### U12B. Checkout Flow (6 buoc)
```
U12B.01  Step indicator: 1. Dia chi → 2. Van chuyen → 3. Thanh toan → 4. Xac nhan
U12B.02  Step indicator: animated progress bar + icon cho moi buoc
U12B.03  Address selector: card chon dia chi voi radio, "Them dia chi moi" dialog
U12B.04  Payment method: icon cho tung phuong thuc (bank transfer, COD, credit)
U12B.05  Order summary: collapsible tren mobile, always-visible tren desktop
U12B.06  Confirmation page: success animation (confetti), order number lon
```

### U12C. Order Pages (8 buoc)
```
U12C.01  Order list: them tab trang thai (Tat ca, Cho xac nhan, Dang giao, Da giao, Da huy)
U12C.02  Order card: timeline visual trang thai (dot + line)
U12C.03  Order detail: timeline ben trai, chi tiet ben phai
U12C.04  Product list trong order: hinh anh + ten + gia + so luong — giong receipt
U12C.05  Invoice section trong order: download button noi bat
U12C.06  Them "Dat lai" button — tao don moi tu don cu
U12C.07  Order status tracking: map/timeline visual
U12C.08  Mobile order detail: collapsible sections
```

---

## =====================================================
## NHOM U13: BUYER — DASHBOARD & UTILITY PAGES
## 18 buoc | Dot 8-9 | QUAN TRONG
## =====================================================

### U13A. Buyer Dashboard (8 buoc)
```
U13A.01  Welcome banner: "Chao [Ten], ngay [thu/ngay]" + avatar + nut shortcut
U13A.02  Stat cards: 2x2 grid, moi card co icon, so lon, trend arrow, sparkline
U13A.03  Recent orders widget: 5 don gan nhat voi status timeline mini
U13A.04  Quick actions: 4-6 buttons (Dat hang, RFQ, Chat NCC, Xem hop dong)
U13A.05  Spending chart: AreaChart gradient, co toggle 7/30/90 ngay
U13A.06  Top suppliers widget: avatar + ten + so don
U13A.07  Pending approvals widget: danh sach cho phe duyet voi action buttons
U13A.08  Layout: masonry 2 col (desktop), stack 1 col (mobile)
```

### U13B. Profile Page (4 buoc)
```
U13B.01  Avatar section: avatar lon (96px) + upload overlay + edit icon
U13B.02  Profile form: 2-column layout, grouped sections voi divider
U13B.03  Address book: card list voi "Mac dinh" badge, edit/delete actions
U13B.04  Security section: doi mat khau form, 2FA toggle (placeholder)
```

### U13C. Other Buyer Pages (6 buoc)
```
U13C.01  Wishlist: grid cards voi "Them vao gio" nhanh, so sanh gia
U13C.02  RFQ List: timeline view option, status chip dep
U13C.03  Contract List: card view voi progress bar (% hoan thanh milestone)
U13C.04  Invoice List: download button noi bat, trang thai mau sac
U13C.05  Shipment Tracking: visual timeline (dang giao → da giao), map placeholder
U13C.06  Payment: card cong no voi progress bar (% da thanh toan)
```

---

## =====================================================
## NHOM U14: SELLER — DASHBOARD & LAYOUT
## 22 buoc | Dot 9-10 | QUAN TRONG
## =====================================================

### U14A. Seller Dashboard Redesign (10 buoc)
```
U14A.01  Hero stat bar: 4 KPI chinh ngang, gradient background brand-50
U14A.02  Revenue chart: AreaChart gradient, co comparison (ky truoc)
U14A.03  Order status pie chart: donut, so trong giua
U14A.04  Recent orders table: compact, 5 dong, view all link
U14A.05  Stock alerts widget: red/yellow badges, link den warehouse
U14A.06  Performance score: circular progress ring, diem 0-100
U14A.07  Quick actions grid: 6 nut (Them SP, Xu ly don, Xem bao cao, ...)
U14A.08  Activity feed: timeline voi avatar + action + time
U14A.09  Pending items banner: "3 don cho xac nhan, 2 bao gia moi" — click navigate
U14A.10  Auto-refresh: dong ho dem 60s + nut refresh manual
```

### U14B. Seller Layout Enhancements (6 buoc)
```
U14B.01  Sidebar: them section dividers voi label
U14B.02  Sidebar: icon badge (so notification) cho Orders, RFQ, Chat
U14B.03  Sidebar: collapse to icon-only mode voi tooltip
U14B.04  Header: them quick-search global cho seller
U14B.05  Header: them "Xem gian hang" button — mo trang buyer cua NCC
U14B.06  Breadcrumb cho moi trang seller — nhat quan
```

### U14C. Seller Onboarding (6 buoc)
```
U14C.01  First-time wizard: 5 buoc (Thong tin, Logo, San pham dau, Kho, Xong)
U14C.02  Setup progress bar: "Ban da hoan thanh 60% thiet lap gian hang"
U14C.03  Checklist widget tren dashboard: check items da hoan thanh
U14C.04  Tip/hint tooltips: "Ban biet khong? Them anh dep giup tang 40% luot xem"
U14C.05  Empty state cho moi trang: huong dan bat dau (Them SP dau tien, Tao kho, ...)
U14C.06  Video tutorial placeholder link
```

---

## =====================================================
## NHOM U15: SELLER — PRODUCT, ORDER, REPORT PAGES
## 20 buoc | Dot 10 | QUAN TRONG
## =====================================================

### U15A. Product Management (8 buoc)
```
U15A.01  Product list: image thumbnail trong bang, 60x60 rounded
U15A.02  Product form: multi-step (Thong tin co ban → Anh → Gia & Kho → Xuat ban)
U15A.03  Image upload: drag-reorder, main image badge, upload progress
U15A.04  Rich text editor: toolbar dep cho mo ta san pham
U15A.05  Variant editor: table editable inline cho gia/ton kho tung variant
U15A.06  SEO preview: giong Google search result preview
U15A.07  Product duplicate: "Nhan ban SP" voi pre-fill data
U15A.08  Bulk actions: select nhieu → doi trang thai / xoa / xuat CSV
```

### U15B. Order Management (6 buoc)
```
U15B.01  Order detail: 2-column layout (thong tin trai, timeline phai)
U15B.02  Order actions: buttons noi bat (Xac nhan, In don, Xuat hoa don)
U15B.03  Print-friendly order detail: @media print layout
U15B.04  Order notes: them ghi chu noi bo (chi NCC xem duoc)
U15B.05  Shipping label generator: template in nhan van chuyen
U15B.06  Order kanban view: keo tha giua cac cot trang thai
```

### U15C. Report Pages (6 buoc)
```
U15C.01  Report selector: tab bar (Doanh thu, San pham, Khach hang, Don hang)
U15C.02  Date range picker: noi bat, presets (7 ngay, 30 ngay, Quy nay, Nam nay)
U15C.03  Report cards: KPI voi comparison ky truoc, arrow up/down
U15C.04  Export: dropdown (CSV, Excel, PDF) voi icon
U15C.05  Chart: interactive tooltip, click de drill-down
U15C.06  Table bao cao: striped rows, highlight cao/thap
```

---

## =====================================================
## NHOM U16: ADMIN — DASHBOARD & LAYOUT
## 18 buoc | Dot 10-11 | QUAN TRONG
## =====================================================

### U16A. Admin Dashboard (8 buoc)
```
U16A.01  System health bar: uptime, requests/s, error rate — giong DevOps dashboard
U16A.02  KPI grid: 6 cards 3x2, moi card co sparkline mini
U16A.03  Pending actions: list card voi icon + count + "Xu ly ngay" button
U16A.04  Activity timeline: real-time feed voi avatar, action, link
U16A.05  Revenue overview: AreaChart, compare ky truoc
U16A.06  Top performers: table NCC tot nhat (doanh thu, rating, so don)
U16A.07  Alerts panel: warning/critical issues can xu ly
U16A.08  Quick links grid: 6 shortcuts den trang quan ly
```

### U16B. Admin Layout (6 buoc)
```
U16B.01  Sidebar: dark theme (bg-slate-900) — phan biet voi Seller/Buyer
U16B.02  Sidebar: icon color-coded theo nhom (xanh=noi dung, do=canh bao, tim=he thong)
U16B.03  Header: them environment badge (Production/Staging)
U16B.04  Header: global search bar cho admin
U16B.05  Them "Super admin" indicator cho admin cap cao
U16B.06  Layout: full-width (khong container) cho dashboard, container cho management pages
```

### U16C. Admin Tools (4 buoc)
```
U16C.01  Bulk action toolbar: floating bar cuoi trang khi select nhieu rows
U16C.02  Audit trail viewer: filter theo user, action, entity, time range
U16C.03  System config: categorized settings voi tab (General, Email, Payment, Security)
U16C.04  Them "Preview as..." button — xem giao dien nhu Buyer/Seller
```

---

## =====================================================
## NHOM U17: ADMIN — MANAGEMENT PAGES
## 16 buoc | Dot 11 | QUAN TRONG
## =====================================================

### U17A. User Management (4 buoc)
```
U17A.01  User list: avatar + ten + email inline, role badge mau sac
U17A.02  User detail: profile card + activity timeline + orders summary
U17A.03  User edit: form dep voi section divider
U17A.04  Bulk invite: upload CSV dialog voi preview + validation
```

### U17B. Product & Category (4 buoc)
```
U17B.01  Category tree: drag-drop reorder, indent visual cho cap con
U17B.02  Product approval: side-by-side compare (truoc/sau khi sua)
U17B.03  Them image preview trong approval view
U17B.04  Batch approve/reject voi confirmation dialog
```

### U17C. Order & Financial (4 buoc)
```
U17C.01  Order overview: them map visualization (dia ly don hang — placeholder)
U17C.02  Payment reconciliation: table voi match/unmatch status
U17C.03  Invoice verification: scan/view invoice image + approve
U17C.04  Revenue breakdown: pie chart theo danh muc, NCC
```

### U17D. System & Reports (4 buoc)
```
U17D.01  System settings: card-based layout, toggle switches, save per section
U17D.02  Report builder: drag-drop columns, filter builder UI
U17D.03  Export center: lich su export voi download link
U17D.04  Notification template editor: preview + placeholder tags
```

---

## =====================================================
## NHOM U18: AUTH PAGES & ONBOARDING
## 16 buoc | Dot 11-12 | RA MAT
## =====================================================

### U18A. Login Page Redesign (6 buoc)
```
U18A.01  Split layout: form trai (50%), illustration/branding phai (50%)
U18A.02  Left side: centered form card voi shadow-xl, rounded-2xl
U18A.03  Right side: gradient background brand + illustration/pattern + tagline
U18A.04  Form: floating labels, show/hide password icon dep
U18A.05  Demo accounts: styled cards thay vi text buttons, hover effect
U18A.06  Them "Dang nhap voi Google" button (placeholder) — social login UI
```

### U18B. Register Page (4 buoc)
```
U18B.01  Multi-step registration: 1. Tai khoan → 2. Thong tin DN → 3. Xong
U18B.02  Step progress bar voi animation
U18B.03  Role selector: visual card (Buyer/Seller) voi icon + mo ta
U18B.04  Success page: confetti animation + redirect countdown
```

### U18C. Auth UX (6 buoc)
```
U18C.01  Password strength meter: progress bar 4 muc (yeu/trung binh/manh/rat manh)
U18C.02  Email validation real-time: check format khi go
U18C.03  "Quen mat khau" flow: email input → success message
U18C.04  Loading state: spinner thay the button text khi submit
U18C.05  Error display: shake animation + red highlight field
U18C.06  Auto-focus first field khi mount
```

---

## =====================================================
## NHOM U19: DARK MODE, A11Y, FINAL POLISH
## 20 buoc | Dot 12 | HOAN THIEN
## =====================================================

### U19A. Dark Mode (6 buoc)
```
U19A.01  Tao DarkModeToggle component: sun/moon icon voi rotation animation
U19A.02  Dat toggle vao header (Buyer, Seller, Admin)
U19A.03  Cap nhat tat ca custom color (brand, success, warning, danger) cho dark mode
U19A.04  Cap nhat tat ca gradient background cho dark mode (dim xuong)
U19A.05  Cap nhat shadow: dung border thay shadow trong dark mode
U19A.06  Test va fix tat ca trang trong dark mode — dam bao contrast du
```

### U19B. Accessibility Polish (8 buoc)
```
U19B.01  Focus ring: 2px offset, brand-500 mau — hien ro khi tab
U19B.02  Tat ca interactive element: co focus-visible style
U19B.03  Tat ca image: co alt text mo ta
U19B.04  Tat ca icon button: co aria-label hoac tooltip
U19B.05  Color contrast: WCAG AA cho tat ca text (kiem tra va fix)
U19B.06  Keyboard navigation: tat ca menu, dropdown, dialog — co the dung ban phim
U19B.07  Screen reader: tat ca status change co aria-live announcement
U19B.08  Reduced motion: @media (prefers-reduced-motion) — tat animation
```

### U19C. Final Polish (6 buoc)
```
U19C.01  Favicon: tao favicon voi brand icon
U19C.02  404 page: illustration dep + search bar + link trang chu
U19C.03  Error page: friendly error message + retry button
U19C.04  Print styles: @media print cho Order detail, Invoice, Contract
U19C.05  Tat ca trang: kiem tra responsive (320px, 375px, 768px, 1024px, 1440px)
U19C.06  Performance audit: lazy load tat ca route, optimize re-render, memo
```

---

## TAI LIEU THAM KHAO THIET KE

### Mau sac chinh
- Brand: #2563eb (blue-600) — chuyen nghiep, tin cay, B2B
- Success: #16a34a (green-600)
- Warning: #ca8a04 (yellow-600)
- Danger: #dc2626 (red-600)
- Info: #3b82f6 (blue-500)
- Background: #f8fafc (slate-50)
- Surface: #ffffff (white)

### Font
- Body: Inter Variable, 15px/1.6
- Heading: Inter Variable, 600-700
- Mono: JetBrains Mono — gia, ma don

### Border Radius
- XS: 2px (tag, badge)
- SM: 4px (input, button sm)
- MD: 8px (card, button)
- LG: 12px (dialog, panel)
- XL: 16px (hero card)
- Full: 9999px (avatar, chip, pill button)

### Shadow
- XS: 0 1px 2px rgba(0,0,0,0.05)
- SM: 0 1px 3px rgba(0,0,0,0.1)
- MD: 0 4px 6px rgba(0,0,0,0.07)
- LG: 0 10px 15px rgba(0,0,0,0.1)
- XL: 0 20px 25px rgba(0,0,0,0.1)

### Spacing
- Page padding: 24px (mobile), 32px (tablet), 48px (desktop)
- Section gap: 32px (mobile), 48px (desktop)
- Card padding: 16px (mobile), 24px (desktop)
- Component gap: 8px, 12px, 16px, 24px

---

## THU TU UU TIEN TRIEN KHAI

**Dot 1 (U01+U02+U03)**: Nen tang — Theme, Font, Mau sac → Anh huong TOAN BO app
**Dot 2-3 (U04+U05)**: Shared components + Layout → Thay doi lon nhat
**Dot 4-5 (U06+U07)**: Animation + Form → UX noi bat
**Dot 5-6 (U08+U09)**: Chart + Card → Chieu sau thi giac
**Dot 6-8 (U10+U11+U12)**: Buyer pages → Trai nghiem khach hang
**Dot 8-10 (U13+U14+U15)**: Buyer utility + Seller → Backend UX
**Dot 10-11 (U16+U17)**: Admin → Quan tri chuyen nghiep
**Dot 11-12 (U18+U19)**: Auth + Polish → Hoan thien

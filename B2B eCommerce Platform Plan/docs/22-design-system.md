# 22 — Design System

> Hệ thống thiết kế: màu sắc, typography, spacing, shadows và dark mode.
> Tech stack: Tailwind CSS + CSS Custom Properties (HSL).

---

## 1. Color Tokens (CSS Variables)

> File: `src/index.css` hoặc `src/app/index.css`
> Sử dụng HSL format để dễ điều chỉnh lightness.

```css
:root {
  /* ─── Brand Colors ─── */
  --primary:             221.2 83.2% 53.3%;   /* #2563eb — Blue */
  --primary-foreground:  210 40% 98%;          /* #f8fafc — Near white */

  --secondary:           210 40% 96.1%;        /* #f0f5ff — Light blue-gray */
  --secondary-foreground: 222.2 47.4% 11.2%;  /* #0f172a — Dark */

  /* ─── Semantic Colors ─── */
  --destructive:         0 84.2% 60.2%;        /* #ef4444 — Red */
  --destructive-foreground: 210 40% 98%;

  /* ─── Neutral Scale ─── */
  --background:          0 0% 100%;            /* White */
  --foreground:          222.2 84% 4.9%;       /* Near black */

  --muted:               210 40% 96.1%;        /* #f5f5f5 */
  --muted-foreground:    215.4 16.3% 46.9%;    /* #6b7280 */

  --accent:              210 40% 96.1%;
  --accent-foreground:   222.2 47.4% 11.2%;

  --card:                0 0% 100%;
  --card-foreground:     222.2 84% 4.9%;

  --popover:             0 0% 100%;
  --popover-foreground:  222.2 84% 4.9%;

  /* ─── Border & Input ─── */
  --border:              214.3 31.8% 91.4%;    /* #e5e7eb */
  --input:               214.3 31.8% 91.4%;
  --ring:                221.2 83.2% 53.3%;    /* Match primary */

  /* ─── Sidebar ─── */
  --sidebar:             240 5.9% 10%;         /* Dark sidebar */
  --sidebar-foreground:  240 4.8% 95.9%;
  --sidebar-primary:     224.3 76.3% 48%;
  --sidebar-accent:      240 3.7% 15.9%;
  --sidebar-border:      240 3.7% 15.9%;

  /* ─── Chart ─── */
  --chart-1: 221.2 83.2% 53.3%;
  --chart-2: 142.1 76.2% 36.3%;
  --chart-3: 43.3 96.4% 56.3%;
  --chart-4: 12.7 100% 53.7%;
  --chart-5: 262.1 83.3% 57.8%;

  /* ─── Radius ─── */
  --radius: 0.625rem;    /* 10px — card corners */
}

.dark {
  --background:          222.2 84% 4.9%;
  --foreground:          210 40% 98%;
  --card:                222.2 84% 4.9%;
  --card-foreground:     210 40% 98%;
  --muted:               217.2 32.6% 17.5%;
  --muted-foreground:    215 20.2% 65.1%;
  --border:              217.2 32.6% 17.5%;
  /* ... tiếp tục cho dark mode */
}
```

---

## 2. Status Colors

*Mapping Status → Badge variant cho toàn hệ thống:*

```typescript
// Dùng trong: OrderStatus, ShipmentStatus, PaymentStatus, ReturnStatus...
const STATUS_COLORS: Record<string, BadgeVariant> = {
  // Success states
  'Đã giao':        'success',
  'Đã thanh toán':  'success',
  'Đã xác nhận':    'success',
  'Hoàn thành':     'success',
  'Đã duyệt':       'success',
  'Đã ký':          'success',
  'Đang thực hiện': 'success',
  'Chấp nhận':      'success',

  // Warning states
  'Chờ xác nhận':   'warning',
  'Chờ thanh toán': 'warning',
  'Chờ duyệt':      'warning',
  'Chờ xử lý':      'warning',
  'Đang xử lý':     'warning',
  'Đang báo giá':   'warning',
  'Đang giao hàng': 'warning',
  'Đang vận chuyển':'warning',
  'Chờ ký':         'warning',
  'Bản nháp':       'secondary',

  // Error/Danger states
  'Đã huỷ':         'destructive',
  'Từ chối':        'destructive',
  'Hết hạn':        'destructive',
  'Quá hạn':        'destructive',
  'Giao thất bại':  'destructive',
  'Có sự cố':       'destructive',

  // Default
  'Đã gửi':         'default',
  'Đã báo giá':     'default',
  'Đang kiểm tra':  'default',
};

// Shorthand function:
export const getStatusBadge = (status: string) => (
  <Badge variant={STATUS_COLORS[status] ?? 'secondary'}>{status}</Badge>
);
```

---

## 3. Typography

```css
/* Font Family — Import từ Google Fonts */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}
```

### Type Scale (Tailwind)

| Class | Size | Weight | Dùng cho |
|-------|------|--------|---------|
| `text-xs` | 12px | 400 | Metadata, timestamps, helper text |
| `text-sm` | 14px | 400/500 | Body text, table cells, labels |
| `text-base` | 16px | 400 | Mặc định |
| `text-lg` | 18px | 500/600 | Section titles |
| `text-xl` | 20px | 600 | Card headers |
| `text-2xl` | 24px | 700 | Page titles |
| `text-3xl` | 30px | 700 | Feature headings |
| `text-4xl` | 36px | 800 | Hero headlines |

### Common Text Patterns

```tsx
// Page title:
<h1 className="text-2xl font-bold tracking-tight">Đơn hàng của tôi</h1>

// Section header:
<h2 className="text-lg font-semibold">Thông tin giao hàng</h2>

// Card label:
<p className="text-sm font-medium text-muted-foreground">Tổng tiền</p>

// Value display:
<p className="text-2xl font-bold">{formatCurrency(amount)}</p>

// Metadata:
<span className="text-xs text-muted-foreground">
  {formatDate(createdAt)}
</span>

// Truncated text:
<p className="truncate max-w-[200px]">{longText}</p>
```

---

## 4. Spacing & Layout

### Container Widths

```tsx
// Page container:
<div className="container mx-auto px-4">    {/* max-w-screen-xl */}

// Narrow content (forms):
<div className="max-w-2xl mx-auto">

// Wide content (tables, dashboards):
<div className="max-w-7xl mx-auto">
```

### Grid System

```tsx
// Dashboard grid (3 columns):
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

// Stats row (4 columns):
<div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

// Product grid:
<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">

// Two-column layout (content + sidebar):
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
  <div className="lg:col-span-2">main</div>
  <div>sidebar</div>
</div>
```

### Spacing Scale

| Value | px | Dùng cho |
|-------|-----|---------|
| `gap-2` | 8px | Inline elements, icon-text |
| `gap-3` | 12px | List items |
| `gap-4` | 16px | Cards trong grid |
| `gap-6` | 24px | Section-level spacing |
| `gap-8` | 32px | Major sections |
| `p-4` | 16px | Card padding |
| `p-6` | 24px | Card padding (large) |
| `mb-6` | 24px | Section bottom margin |
| `space-y-4` | 16px | Vertical form fields |

---

## 5. Shadow System

```css
/* Sử dụng Tailwind shadow utilities: */
shadow-sm   /* Subtle card elevation */
shadow      /* Default card */
shadow-md   /* Floating elements, dropdowns */
shadow-lg   /* Modals, tooltips */
shadow-xl   /* Overlays */
shadow-2xl  /* Full-screen overlays */
```

---

## 6. Border Radius

```css
/* Từ --radius (0.625rem = 10px) */
rounded-sm    /* 6px — Input borders */
rounded-md    /* 8px — Buttons */
rounded-lg    /* 10px — Cards (default --radius) */
rounded-xl    /* 12px — Big cards */
rounded-2xl   /* 16px — Feature banners */
rounded-full  /* 9999px — Avatars, pills */
```

---

## 7. Dark Mode Support

```tsx
// Dark mode class-based (Tailwind):
<div className="bg-card text-card-foreground">       {/* Automatic dark/light */}
<div className="bg-background text-foreground">      {/* Page background */}
<div className="bg-muted text-muted-foreground">     {/* Muted areas */}
<div className="border">                             {/* Adapts in dark mode */}
```

> **Lưu ý**: Tất cả color tokens trong CSS Variables tự động áp dụng dark mode khi class `dark` được thêm vào `<html>` tag.

---

## 8. Animation & Transitions

```tsx
// Hover effects:
<div className="transition-colors hover:bg-accent">

// Scale on hover (cards):
<div className="transition-transform hover:scale-105">

// Smooth appearance (Tailwind + CSS):
<div className="animate-in fade-in-0 duration-200">

// Loading spinner:
<div className="animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent" />

// Pulse skeleton:
<div className="animate-pulse bg-muted rounded" />
```

---

## 9. Responsive Breakpoints

```
sm:   640px  — Mobile landscape
md:   768px  — Tablet
lg:   1024px — Desktop
xl:   1280px — Wide desktop
2xl:  1536px — Ultra-wide
```

### Sidebar Behavior

```
Mobile (<lg):  Sidebar = Sheet (overlay)
Desktop (≥lg): Sidebar = Fixed left panel (240px)
```

### Tables Responsive

```tsx
// Cuộn ngang trên mobile:
<div className="overflow-x-auto">
  <Table>...</Table>
</div>

// Ẩn cột không quan trọng trên mobile:
<TableCell className="hidden md:table-cell">Địa chỉ</TableCell>
```

---

## 10. Utility Functions

```typescript
// src/app/lib/utils.ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Định dạng tiền tệ VND:
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
}
// → "1.000.000 ₫"

// Định dạng số:
export function formatNumber(n: number): string {
  return new Intl.NumberFormat('vi-VN').format(n);
}
// → "1.000.000"

// Định dạng ngày:
export function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  }).format(new Date(dateStr));
}
// → "15/03/2026"

// Định dạng datetime:
export function formatDateTime(dateStr: string): string {
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(new Date(dateStr));
}
// → "15/03/2026, 08:00"

// Relative time:
export function formatRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Vừa xong';
  if (minutes < 60) return `${minutes} phút trước`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.floor(hours / 24);
  return `${days} ngày trước`;
}
```

---

## Tài liệu liên quan

- [21-ui-components-library.md](./21-ui-components-library.md) — Components list & usage
- [33-code-templates.md](./33-code-templates.md) — Code templates
- [03-coding-conventions.md](./03-coding-conventions.md) — Styling conventions

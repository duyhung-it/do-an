# 21 — UI Components Library

> Thư viện component tái sử dụng được dùng trong toàn bộ hệ thống.
> Tech stack: **shadcn/ui + Radix UI + Tailwind CSS**.
> File path: `src/app/components/ui/`

---

## 1. Primitives (shadcn/ui)

Tất cả các file sau nằm trong `src/app/components/ui/`:

### Layout & Container

| Component | File | Props chính | Dùng cho |
|-----------|------|-------------|---------|
| `Card`, `CardHeader`, `CardContent`, `CardFooter` | `card.tsx` | className | Dashboard widgets, product cards, detail panels |
| `Separator` | `separator.tsx` | orientation | Phân tách sections |
| `ScrollArea` | `scroll-area.tsx` | className, style | Lists dài, modals với content overflow |
| `Accordion` | `accordion.tsx` | type, collapsible | FAQs, filters, expandable sections |
| `Collapsible` | `collapsible.tsx` | open, onOpenChange | Toggle sections |
| `ResizablePanelGroup` | `resizable.tsx` | direction | Split-pane layouts |
| `AspectRatio` | `aspect-ratio.tsx` | ratio | Ảnh sản phẩm, banners |
| `Tabs` | `tabs.tsx` | value, onValueChange | Detail pages (multi-tab) |

### Form & Input

| Component | File | Props chính | Dùng cho |
|-----------|------|-------------|---------|
| `Input` | `input.tsx` | type, placeholder | Text inputs |
| `Textarea` | `textarea.tsx` | rows | Mô tả, notes, nội dung dài |
| `Select`, `SelectTrigger`, `SelectContent`, `SelectItem` | `select.tsx` | value, onValueChange | Dropdown chọn 1 |
| `Checkbox` | `checkbox.tsx` | checked, onCheckedChange | Multi-select, terms |
| `RadioGroup`, `RadioGroupItem` | `radio-group.tsx` | value, onValueChange | Single select từ list |
| `Switch` | `switch.tsx` | checked, onCheckedChange | Toggle settings |
| `Slider` | `slider.tsx` | min, max, step, value | Price range filter |
| `Label` | `label.tsx` | htmlFor | Form labels |
| `Calendar` | `calendar.tsx` | selected, onSelect | Date picker |
| `InputOTP` | `input-otp.tsx` | maxLength, value | OTP verification |
| `Form`, `FormField`, `FormItem`, `FormLabel`, `FormMessage` | `form.tsx` | — | React Hook Form integration |

### Feedback & Status

| Component | File | Props chính | Dùng cho |
|-----------|------|-------------|---------|
| `Badge` | `badge.tsx` | variant | Status labels, tags, counts |
| `Alert`, `AlertTitle`, `AlertDescription` | `alert.tsx` | variant | Warning/error/info boxes |
| `Progress` | `progress.tsx` | value | Loading progress, budget percentage |
| `Skeleton` | `skeleton.tsx` | className | Loading placeholders |
| `Sonner` (Toast) | `sonner.tsx` | — | Toast notifications |

### Overlay & Dialog

| Component | File | Props chính | Dùng cho |
|-----------|------|-------------|---------|
| `Dialog`, `DialogTrigger`, `DialogContent`, `DialogHeader` | `dialog.tsx` | open, onOpenChange | Modals, confirm dialogs |
| `AlertDialog`, `AlertDialogAction`, `AlertDialogCancel` | `alert-dialog.tsx` | — | Confirm destructive actions |
| `Sheet`, `SheetTrigger`, `SheetContent` | `sheet.tsx` | side | Slide-out panels (mobile filters, forms) |
| `Popover`, `PopoverTrigger`, `PopoverContent` | `popover.tsx` | — | Date pickers, advanced filters |
| `HoverCard`, `HoverCardTrigger`, `HoverCardContent` | `hover-card.tsx` | — | Product hover preview |
| `Tooltip`, `TooltipTrigger`, `TooltipContent` | `tooltip.tsx` | — | Help icons, truncated text |
| `Drawer`, `DrawerContent`, `DrawerHeader` | `drawer.tsx` | — | Mobile bottom sheet |

### Navigation

| Component | File | Props chính | Dùng cho |
|-----------|------|-------------|---------|
| `Button` | `button.tsx` | variant, size | Tất cả buttons |
| `DropdownMenu` | `dropdown-menu.tsx` | — | Action menus, user menu |
| `ContextMenu` | `context-menu.tsx` | — | Right-click menus |
| `NavigationMenu` | `navigation-menu.tsx` | — | Top navigation |
| `Menubar` | `menubar.tsx` | — | Menu bars |
| `Breadcrumb`, `BreadcrumbItem`, `BreadcrumbLink` | `breadcrumb.tsx` | — | Page navigation |
| `Pagination`, `PaginationContent`, `PaginationItem` | `pagination.tsx` | — | Phân trang |

### Data Display

| Component | File | Props chính | Dùng cho |
|-----------|------|-------------|---------|
| `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableCell` | `table.tsx` | — | Data tables |
| `Avatar`, `AvatarImage`, `AvatarFallback` | `avatar.tsx` | — | User/supplier avatars |
| `Carousel`, `CarouselContent`, `CarouselItem` | `carousel.tsx` | orientation | Product image galleries |
| `Chart` | `chart.tsx` | config | Recharts wrapper (bar, line, pie, area) |
| `Command`, `CommandInput`, `CommandList` | `command.tsx` | — | Combobox search |
| `Toggle`, `ToggleGroup` | `toggle.tsx` | variant | View mode toggles (grid/list) |

---

## 2. Button Variants

```tsx
// Định nghĩa trong button.tsx:
variant: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
size: 'default' | 'sm' | 'lg' | 'icon'

// Dùng phổ biến:
<Button>Mặc định (Primary)</Button>
<Button variant="outline">Viền</Button>
<Button variant="destructive">Xóa/Hủy nguy hiểm</Button>
<Button variant="ghost">Transparent</Button>
<Button size="icon"><Plus className="h-4 w-4" /></Button>
<Button size="sm">Nhỏ</Button>
```

---

## 3. Badge Variants

```tsx
// Định nghĩa trong badge.tsx:
variant: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning'

// Dùng cho Status:
<Badge variant="success">Đã giao</Badge>
<Badge variant="destructive">Hết hàng</Badge>
<Badge variant="warning">Chờ xác nhận</Badge>
<Badge variant="secondary">Đang xử lý</Badge>
<Badge variant="outline">Tag nhãn</Badge>
```

---

## 4. Icon Library

> Dùng `lucide-react` — import từng icon cần dùng.

### Icons thường dùng trong dự án

```tsx
import {
  // Navigation
  Home, ChevronRight, ChevronDown, ArrowLeft, Menu, X,

  // Commerce
  ShoppingCart, Package, CreditCard, Truck, RotateCcw,
  Store, Tag, Percent, Gift, Star, Heart, Eye,

  // CRUD Actions
  Plus, Edit, Trash2, Save, Copy, Search, Filter, Upload,
  Download, RefreshCw, MoreHorizontal, MoreVertical,

  // Status
  Check, CheckCircle, XCircle, AlertTriangle, AlertCircle,
  Info, Clock, Calendar, Bell, BellOff,

  // Finance
  DollarSign, TrendingUp, TrendingDown, BarChart3,
  Receipt, FileText, Building2, Wallet,

  // User & Auth
  User, Users, UserPlus, Lock, LogOut, Settings, Shield,

  // Files & Media
  File, FileImage, Download, Upload, Image, Camera, Link,
  Paperclip, Folder,

  // Misc
  Warehouse, MapPin, Phone, Mail, Globe, ExternalLink,
  Layers, Box, Archive, Inbox, Send, MessageSquare,
  QrCode, Scan, Zap, Award, Activity, LayoutDashboard,
} from 'lucide-react';
```

---

## 5. Chart Components

> Wrapper: `src/app/components/ui/chart.tsx` (wraps Recharts)

```tsx
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend } from '@/components/ui/chart';
import { BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie } from 'recharts';

// Cấu hình màu sắc:
const chartConfig = {
  revenue: { label: 'Doanh thu', color: 'hsl(var(--chart-1))' },
  orders:  { label: 'Đơn hàng', color: 'hsl(var(--chart-2))' },
};

// Chart cơ bản:
<ChartContainer config={chartConfig} className="h-[300px]">
  <BarChart data={monthlyData}>
    <Bar dataKey="revenue" fill="var(--color-revenue)" />
    <ChartTooltip content={<ChartTooltipContent />} />
  </BarChart>
</ChartContainer>
```

### CSS Variables cho chart colors

```css
/* Trong globals.css hoặc index.css */
--chart-1: 221.2 83.2% 53.3%;   /* Blue */
--chart-2: 142.1 76.2% 36.3%;   /* Green */
--chart-3: 43.3 96.4% 56.3%;    /* Yellow */
--chart-4: 12.7 100% 53.7%;     /* Orange */
--chart-5: 262.1 83.3% 57.8%;   /* Purple */
```

---

## 6. Form Pattern (React Hook Form + Zod)

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const schema = z.object({
  name: z.string().min(1, 'Tên không được để trống'),
  email: z.string().email('Email không hợp lệ'),
  quantity: z.number().min(1, 'Số lượng tối thiểu là 1'),
});

function MyForm({ onSubmit }) {
  const form = useForm({ resolver: zodResolver(schema) });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tên</FormLabel>
              <FormControl>
                <Input placeholder="Nhập tên..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Lưu</Button>
      </form>
    </Form>
  );
}
```

---

## 7. Table Pattern

```tsx
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

// Standard data table với actions:
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Mã đơn</TableHead>
      <TableHead>Khách hàng</TableHead>
      <TableHead className="text-right">Tổng tiền</TableHead>
      <TableHead className="w-[100px]">Thao tác</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {orders.map(order => (
      <TableRow key={order.id}>
        <TableCell className="font-medium">{order.orderNumber}</TableCell>
        <TableCell>{order.buyerName}</TableCell>
        <TableCell className="text-right">
          {order.totalAmount.toLocaleString('vi-VN')} đ
        </TableCell>
        <TableCell>
          <Button size="icon" variant="ghost">
            <Eye className="h-4 w-4" />
          </Button>
        </TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

---

## 8. Toast Notifications

```tsx
import { toast } from 'sonner';

// Patterns:
toast.success('Tạo đơn hàng thành công!');
toast.error('Có lỗi xảy ra, vui lòng thử lại.');
toast.warning('Tồn kho sắp hết!');
toast.info('Đang xử lý yêu cầu...');

// Với description:
toast.success('Đặt hàng thành công', {
  description: `Mã đơn ${orderNumber} đã được tạo`,
  duration: 5000,
});

// Với action:
toast.error('Thanh toán thất bại', {
  action: {
    label: 'Thử lại',
    onClick: () => retryPayment(),
  },
});
```

---

## 9. Loading & Error States

```tsx
// Loading state — Skeleton:
<div className="space-y-3">
  <Skeleton className="h-4 w-3/4" />
  <Skeleton className="h-4 w-1/2" />
  <Skeleton className="h-32 w-full" />
</div>

// Error state:
<Alert variant="destructive">
  <AlertCircle className="h-4 w-4" />
  <AlertTitle>Đã xảy ra lỗi</AlertTitle>
  <AlertDescription>
    Không thể tải dữ liệu. Vui lòng thử lại sau.
  </AlertDescription>
</Alert>

// Empty state:
<div className="flex flex-col items-center justify-center py-12 text-center">
  <Package className="h-12 w-12 text-muted-foreground mb-4" />
  <h3 className="text-lg font-semibold">Chưa có dữ liệu</h3>
  <p className="text-muted-foreground">Bắt đầu bằng cách thêm mục đầu tiên.</p>
</div>
```

---

## Tài liệu liên quan

- [22-design-system.md](./22-design-system.md) — Tokens màu sắc, typography, spacing
- [33-code-templates.md](./33-code-templates.md) — Code templates chi tiết (form, table, modal)
- [03-coding-conventions.md](./03-coding-conventions.md) — Pattern & conventions

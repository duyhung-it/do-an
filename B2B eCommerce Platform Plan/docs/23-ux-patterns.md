# 23 — UX Patterns & Interaction Guidelines

> Các pattern UX chuẩn được dùng nhất quán trong toàn hệ thống.
> Bao gồm: Data loading, CRUD flows, confirmation dialogs, filters, pagination, form validation.

---

## 1. CRUD Page Structure

### List Page Pattern

```
┌─────────────────────────────────────────────┐
│ [Page Title]                [Primary Action] │
│ [Subtitle/description]                       │
├─────────────────────────────────────────────┤
│ [Search]  [Filter 1] [Filter 2] [Date Range] │
├─────────────────────────────────────────────┤
│ [Stats Summary Cards — optional]             │
├─────────────────────────────────────────────┤
│ [Data Table]                                 │
│   [Columns with sorting]                     │
│   [Action buttons per row]                   │
├─────────────────────────────────────────────┤
│ [Pagination]                                 │
└─────────────────────────────────────────────┘
```

```tsx
// Template cho List Page:
export function OrderListPage() {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    loadOrders();
  }, [search, status, page]);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Đơn hàng</h1>
          <p className="text-muted-foreground">Quản lý tất cả đơn hàng</p>
        </div>
        <Button onClick={createNew}>
          <Plus className="h-4 w-4 mr-2" /> Tạo đơn hàng
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm..." className="pl-9"
            value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <Select value={status} onValueChange={v => { setStatus(v); setPage(1); }}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="Chờ xác nhận">Chờ xác nhận</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {loading ? <TableSkeleton /> : (
        <div className="border rounded-lg overflow-hidden">
          <Table>...</Table>
        </div>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {total} kết quả
        </p>
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious onClick={() => setPage(p => Math.max(1, p-1))} />
            </PaginationItem>
            <PaginationItem>
              <PaginationNext onClick={() => setPage(p => p+1)} />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}
```

### Detail Page Pattern

```
┌─────────────────────────────────────────────┐
│ [← Back]  [Entity Number]  [Status Badge]   │
│           [Created at] [Quick Actions]       │
├──────────────────┬──────────────────────────┤
│ Main Content     │ Side Panel               │
│ [Info sections]  │ [Status History]         │
│ [Items list]     │ [Actions Panel]          │
│ [Timeline]       │ [Related Info]           │
└──────────────────┴──────────────────────────┘
```

---

## 2. Modal/Dialog Patterns

### Confirmation Delete Dialog

```tsx
// Pattern: luôn dùng AlertDialog cho destructive actions
function DeleteConfirm({ item, onDelete }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm">
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xác nhận xóa?</AlertDialogTitle>
          <AlertDialogDescription>
            Bạn có chắc muốn xóa <strong>{item.name}</strong>?
            Hành động này không thể hoàn tác.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Hủy</AlertDialogCancel>
          <AlertDialogAction
            onClick={onDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Xóa
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
```

### Create/Edit Dialog

```tsx
// Dùng Dialog cho create/edit form inline
const [open, setOpen] = useState(false);

<Dialog open={open} onOpenChange={setOpen}>
  <DialogTrigger asChild>
    <Button><Plus className="h-4 w-4 mr-2" />Thêm mới</Button>
  </DialogTrigger>
  <DialogContent className="max-w-2xl">
    <DialogHeader>
      <DialogTitle>Thêm sản phẩm mới</DialogTitle>
      <DialogDescription>Điền thông tin sản phẩm</DialogDescription>
    </DialogHeader>
    <form onSubmit={handleSubmit}>
      {/* Form content */}
      <div className="grid gap-4 py-4">
        <FormField .../>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={() => setOpen(false)}>Hủy</Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? <Loader2 className="animate-spin h-4 w-4" /> : 'Lưu'}
        </Button>
      </DialogFooter>
    </form>
  </DialogContent>
</Dialog>
```

---

## 3. Status Change Pattern

```tsx
// Inline status update (trong Detail page):
function StatusActions({ entity, onStatusChange }) {
  const allowedTransitions = getNextStatuses(entity.status);

  if (allowedTransitions.length === 0) return null;

  return (
    <div className="flex gap-2">
      {allowedTransitions.map(status => (
        <Button
          key={status}
          variant={status.includes('Hủy') ? 'destructive' : 'default'}
          size="sm"
          onClick={() => onStatusChange(status)}
        >
          {status}
        </Button>
      ))}
    </div>
  );
}
```

---

## 4. Loading States

### Page-level Loading

```tsx
// Skeleton cho card grid:
function CardSkeleton({ count = 4 }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i}>
          <CardContent className="p-6 space-y-3">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/3" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Skeleton cho table:
function TableSkeleton({ rows = 5, cols = 4 }) {
  return (
    <div className="border rounded-lg">
      <div className="p-4 space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex gap-4">
            {Array.from({ length: cols }).map((_, j) => (
              <Skeleton key={j} className={`h-4 ${j === 0 ? 'w-1/4' : 'flex-1'}`} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Button Loading State

```tsx
<Button disabled={isLoading} onClick={submit}>
  {isLoading ? (
    <>
      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      Đang xử lý...
    </>
  ) : (
    'Lưu thay đổi'
  )}
</Button>
```

---

## 5. Empty States

```tsx
// Empty list:
function EmptyState({ title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
        <Package className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground mb-4 max-w-sm">{description}</p>
      {action && (
        <Button onClick={action.onClick}>
          <Plus className="h-4 w-4 mr-2" />
          {action.label}
        </Button>
      )}
    </div>
  );
}

// Dùng:
<EmptyState
  title="Chưa có đơn hàng nào"
  description="Bắt đầu mua sắm để xem lịch sử đơn hàng của bạn."
  action={{ label: 'Tìm sản phẩm', onClick: () => navigate('/products') }}
/>
```

---

## 6. Filter & Search Patterns

### Multi-filter bar

```tsx
// Filter state pattern:
const [filters, setFilters] = useState({
  search: '',
  status: '',
  dateFrom: '',
  dateTo: '',
  supplierId: '',
});

const updateFilter = (key: string, value: string) => {
  setFilters(prev => ({ ...prev, [key]: value }));
  setPage(1);  // Reset về trang 1 khi filter thay đổi
};

// Reset tất cả filter:
const clearFilters = () => {
  setFilters({ search: '', status: '', dateFrom: '', dateTo: '', supplierId: '' });
  setPage(1);
};

// Active filter count (để hiển thị badge):
const activeFilterCount = Object.values(filters).filter(Boolean).length;
```

### Price Range Filter

```tsx
const [priceRange, setPriceRange] = useState([0, 100000000]);

<div className="space-y-2">
  <div className="flex justify-between text-sm">
    <span>{formatCurrency(priceRange[0])}</span>
    <span>{formatCurrency(priceRange[1])}</span>
  </div>
  <Slider
    min={0} max={100000000} step={500000}
    value={priceRange}
    onValueChange={setPriceRange}
  />
</div>
```

---

## 7. Notification Toast Pattern

```typescript
// Wrapper functions cho consistent messages:
const notify = {
  success: (action: string) =>
    toast.success(`${action} thành công!`),

  error: (action: string, error?: string) =>
    toast.error(`${action} thất bại`, {
      description: error ?? 'Vui lòng thử lại sau.',
    }),

  loading: (action: string) =>
    toast.loading(`Đang ${action}...`),

  update: (id: string | number, success: boolean, action: string) =>
    toast[success ? 'success' : 'error'](
      success ? `${action} thành công!` : `${action} thất bại`,
      { id }
    ),
};

// Usage:
const toastId = notify.loading('lưu thông tin');
try {
  await productApi.update(id, data);
  notify.update(toastId, true, 'Cập nhật sản phẩm');
} catch {
  notify.update(toastId, false, 'Cập nhật sản phẩm');
}
```

---

## 8. Form Validation UX

### Real-time Validation

```tsx
// Dùng react-hook-form mode: 'onChange' | 'onBlur'
const form = useForm({
  mode: 'onBlur',  // Validate khi blur khỏi field
  resolver: zodResolver(schema),
});

// Error display tự động qua FormMessage:
<FormField
  control={form.control}
  name="price"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Giá bán <span className="text-destructive">*</span></FormLabel>
      <FormControl>
        <Input type="number" placeholder="0" {...field} />
      </FormControl>
      <FormMessage />  {/* Tự hiển thị lỗi */}
    </FormItem>
  )}
/>
```

### Required Field Indicator

```tsx
// Pattern nhất quán: dấu * màu đỏ sau label
<FormLabel>Tên sản phẩm <span className="text-destructive">*</span></FormLabel>
```

---

## 9. Data Table Actions

### Row actions dropdown

```tsx
// Dùng DropdownMenu cho nhiều actions:
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="ghost" size="icon">
      <MoreHorizontal className="h-4 w-4" />
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent align="end">
    <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
    <DropdownMenuSeparator />
    <DropdownMenuItem onClick={() => viewDetail(row.id)}>
      <Eye className="h-4 w-4 mr-2" /> Xem chi tiết
    </DropdownMenuItem>
    <DropdownMenuItem onClick={() => editItem(row)}>
      <Edit className="h-4 w-4 mr-2" /> Chỉnh sửa
    </DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuItem
      className="text-destructive focus:text-destructive"
      onClick={() => setDeleteTarget(row)}
    >
      <Trash2 className="h-4 w-4 mr-2" /> Xóa
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

### Inline quick actions (khi ≤ 3 actions)

```tsx
// Chỉ dùng inline buttons khi có tối đa 3 actions ngắn:
<div className="flex items-center gap-1">
  <Tooltip>
    <TooltipTrigger asChild>
      <Button variant="ghost" size="icon" onClick={() => view(id)}>
        <Eye className="h-4 w-4" />
      </Button>
    </TooltipTrigger>
    <TooltipContent>Xem chi tiết</TooltipContent>
  </Tooltip>
  <Button variant="ghost" size="icon" onClick={() => edit(id)}>
    <Edit className="h-4 w-4" />
  </Button>
</div>
```

---

## 10. Navigation after Action

### Sau khi CREATE thành công

```typescript
// Option A: Navigate đến detail page
toast.success('Tạo đơn hàng thành công!');
navigate(`/orders/${newOrder.id}`);

// Option B: Navigate đến list page
toast.success('Sản phẩm đã được thêm!');
navigate('/seller/products');

// Option C: Đóng modal, refresh list
setOpen(false);
refetchList();
toast.success('Đã thêm thành công!');
```

### Sau khi DELETE thành công

```typescript
// Luôn navigate về list hoặc refresh list:
await orderApi.deleteTemplate(id);
toast.success('Đã xóa mẫu đơn hàng!');
setTemplates(prev => prev.filter(t => t.id !== id));  // Optimistic UI
// OR refetchList();
```

### Sau khi STATUS CHANGE

```typescript
// Cập nhật local state ngay (optimistic):
setOrder(prev => ({ ...prev, status: newStatus }));
toast.success(`Đã cập nhật trạng thái: ${newStatus}`);
// Không navigate, user vẫn ở trang detail
```

---

## 11. Responsive Behaviors

### Mobile-first considerations

```
Tables:       Scroll ngang, ẩn cột phụ (<md:)
Dialogs:      Sheet bottom từ phía dưới trên mobile
Sidebars:     Sheet overlay trên mobile
Filter bar:   Collapse thành Drawer/Sheet trên mobile
Action buttons: Chỉ show icon, tooltip cho label
```

### Touch targets

```
Minimum button size: 44px × 44px (touch-friendly)
Icon buttons: size="icon" = h-9 w-9 ≈ 36px (dùng p-2 bao ngoài nếu cần)
List items: min-height: 48px cho touch
```

---

## Tài liệu liên quan

- [21-ui-components-library.md](./21-ui-components-library.md) — Components
- [22-design-system.md](./22-design-system.md) — Design tokens
- [24-user-flows-buyer.md](./24-user-flows-buyer.md) — Buyer user flows
- [33-code-templates.md](./33-code-templates.md) — Code templates tái sử dụng

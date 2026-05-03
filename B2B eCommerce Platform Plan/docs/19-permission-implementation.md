# 19 — Permission Implementation Guide

> Hướng dẫn cụ thể cách implement phân quyền trong source code hiện tại.
> Xem định nghĩa roles tại [18-roles-permissions.md](./18-roles-permissions.md).

---

## 1. AuthContext Structure

> File: `/src/app/context/AuthContext.tsx`

```typescript
// AuthUser shape (lưu trong Context + localStorage)
interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: 'Buyer' | 'Seller' | 'Admin';
  companyName?: string;
  supplierId?: string;    // QUAN TRỌNG: dùng cho Seller, KHÔNG dùng 'company'
  avatar?: string;
  token?: string;
}

// Context API
interface AuthContextType {
  user: AuthUser | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  updateUser: (updates: Partial<AuthUser>) => void;
  isAuthenticated: boolean;
}
```

### Login Flow

```typescript
// authApi.login() → AuthContext.login()
const login = async (credentials: LoginCredentials) => {
  const user = await authApi.login(credentials);
  setUser(user);
  localStorage.setItem('authUser', JSON.stringify(user));
  // Redirect theo role:
  if (user.role === 'Admin')   navigate('/admin/dashboard');
  if (user.role === 'Seller')  navigate('/seller/dashboard');
  if (user.role === 'Buyer')   navigate('/dashboard');
};

// Logout
const logout = () => {
  setUser(null);
  localStorage.removeItem('authUser');
  navigate('/login');
};

// Restore session khi reload trang
useEffect(() => {
  const stored = localStorage.getItem('authUser');
  if (stored) setUser(JSON.parse(stored));
}, []);
```

---

## 2. Guard Components

> Files: `/src/app/components/auth/`

### BuyerGuard

```typescript
// src/app/components/auth/BuyerGuard.tsx
export function BuyerGuard() {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'Buyer') {
    if (user.role === 'Seller') return <Navigate to="/seller/dashboard" replace />;
    if (user.role === 'Admin')  return <Navigate to="/admin/dashboard" replace />;
  }
  return <Outlet />;
}
```

### SellerGuard

```typescript
// src/app/components/auth/SellerGuard.tsx
export function SellerGuard() {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'Seller') return <Navigate to="/" replace />;
  if (!user.supplierId) return <Navigate to="/login" replace />;  // Seller phải có supplierId

  return <Outlet />;
}
```

### AdminGuard

```typescript
// src/app/components/auth/AdminGuard.tsx
export function AdminGuard() {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'Admin') return <Navigate to="/" replace />;

  return <Outlet />;
}
```

---

## 3. Conditional UI Rendering

### Pattern cơ bản

```tsx
const { user } = useAuth();

// Hiển thị nút chỉ cho Admin
{user?.role === 'Admin' && <AdminButton />}

// Hiển thị nút chỉ cho Seller
{user?.role === 'Seller' && <SellerAction />}

// Hiển thị cho Buyer và Admin
{(user?.role === 'Buyer' || user?.role === 'Admin') && <BuyerView />}

// Ẩn với Viewer (Buyer sub-role - future)
{user?.role === 'Buyer' && currentTeamMember?.role !== 'Viewer' && <CreateButton />}
```

### Dùng cho Menu Items trong BuyerLayout

```tsx
// Sidebar menu — filter theo role
const menuItems = [
  { label: 'Dashboard', path: '/dashboard',      roles: ['Buyer'] },
  { label: 'Đơn hàng',  path: '/orders',          roles: ['Buyer'] },
  { label: 'RFQ',       path: '/rfqs',             roles: ['Buyer'] },
  { label: 'Hợp đồng',  path: '/contracts',        roles: ['Buyer'] },
  { label: 'Phê duyệt', path: '/approvals',        roles: ['Buyer'] },
  { label: 'Ngân sách', path: '/budgets',           roles: ['Buyer'] },
].filter(item => item.roles.includes(user?.role ?? ''));
```

### Dùng cho Action Buttons trong DataTable

```tsx
// Seller chỉ thấy nút Edit/Delete với sản phẩm của mình
renderActions: (product) => (
  <div className="flex gap-2">
    {/* Luôn xem được */}
    <Button size="icon" variant="ghost" onClick={() => viewProduct(product.id)}>
      <Eye className="h-4 w-4" />
    </Button>
    {/* Chỉ Seller owner hoặc Admin */}
    {(user?.role === 'Admin' || product.supplierId === user?.supplierId) && (
      <Button size="icon" variant="ghost" onClick={() => editProduct(product)}>
        <Edit className="h-4 w-4" />
      </Button>
    )}
    {/* Chỉ Admin */}
    {user?.role === 'Admin' && (
      <Button size="icon" variant="destructive" onClick={() => deleteProduct(product.id)}>
        <Trash className="h-4 w-4" />
      </Button>
    )}
  </div>
)
```

---

## 4. API-level Authorization (Future — Supabase RLS)

*Hiện tại: Filter trong service layer (mock). Tương lai: Supabase RLS policies.*

### Template RLS Policy

```sql
-- Orders: buyer chỉ thấy đơn của mình
CREATE POLICY "buyers_own_orders" ON orders
  FOR SELECT TO authenticated
  USING (
    buyer_id = auth.uid()                            -- Buyer role
    OR supplier_id = (                               -- Seller role
      SELECT id FROM suppliers WHERE owner_id = auth.uid()
    )
    OR EXISTS (                                      -- Admin role
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'Admin'
    )
  );

-- Products: Anyone can read active products, only owner seller can write
CREATE POLICY "products_read_active" ON products
  FOR SELECT USING (is_active = true OR supplier_id = auth.uid()::uuid);

CREATE POLICY "products_owner_write" ON products
  FOR ALL TO authenticated
  USING (supplier_id IN (SELECT id FROM suppliers WHERE owner_id = auth.uid()));
```

---

## 5. Seller Staff Permissions

> TypeScript: `StaffMember.permissions: string[]`
> File: `/src/app/types/index.ts` — `StaffMember` interface

### Kiểm tra quyền staff

```typescript
// Helper function:
function hasPermission(staff: StaffMember, permission: string): boolean {
  return staff.permissions.includes(permission);
}

// Usage trong Seller pages:
const currentStaff = sellerStaff.find(s => s.userId === user?.id);

// Kiểm tra quyền trước khi render component
{hasPermission(currentStaff, 'inventory.edit') && (
  <Button onClick={adjustStock}>Điều chỉnh tồn kho</Button>
)}
```

### Default permissions theo StaffRole

```typescript
const DEFAULT_PERMISSIONS: Record<StaffRole, string[]> = {
  'Chủ DN': [
    'product.view', 'product.create', 'product.update', 'product.delete',
    'order.view', 'order.status_change', 'order.cancel',
    'warehouse.view', 'warehouse.manage', 'inventory.view', 'inventory.adjust',
    'payment.view', 'payment.record', 'invoice.view', 'invoice.create',
    'report.view', 'report.export', 'analytics.view',
    'staff.manage', 'settings.manage'
  ],
  'Quản lý': [
    'product.view', 'product.update',
    'order.view', 'order.status_change',
    'warehouse.view', 'inventory.view', 'inventory.adjust',
    'payment.view', 'invoice.view',
    'report.view', 'analytics.view'
  ],
  'NV Bán hàng': [
    'product.view',
    'order.view', 'order.status_change',
    'rfq.view', 'rfq.submit',
    'quotation.view', 'quotation.create'
  ],
  'Thủ kho': [
    'product.view',
    'order.view',
    'warehouse.view', 'warehouse.manage',
    'inventory.view', 'inventory.adjust',
    'stock.movement.view',
    'warehouse.transfer.view', 'warehouse.transfer.create'
  ],
  'Kế toán': [
    'order.view',
    'payment.view', 'payment.record',
    'invoice.view', 'invoice.create', 'invoice.send',
    'credit.view', 'credit.manage',
    'debit_credit.view', 'debit_credit.confirm',
    'report.view', 'report.export'
  ]
};
```

---

## 6. Buyer Team Permissions

> TypeScript: `BuyerTeamMember.role: 'Owner' | 'Manager' | 'Viewer'`

```typescript
// Helper functions:
function canApproveOrders(member: BuyerTeamMember): boolean {
  return member.role === 'Owner' || member.role === 'Manager';
}

function canManageTeam(member: BuyerTeamMember): boolean {
  return member.role === 'Owner';
}

function canViewReports(member: BuyerTeamMember): boolean {
  return member.role === 'Owner' || member.role === 'Manager';
}

function canCreateOrders(member: BuyerTeamMember): boolean {
  return member.role !== 'Viewer';
}
```

---

## 7. Navigation Filtering theo role

### BuyerLayout — Sidebar navigation

```
Dashboard           → /dashboard               (all Buyers)
Tìm kiếm sản phẩm   → /products                (all Buyers)
Đơn hàng            → /orders                  (all)
Giỏ hàng            → /cart                    (all)
Wishlist            → /wishlist                (all)
RFQ                 → /rfqs                    (all)
Hợp đồng            → /buyer/contracts         (Owner + Manager)
Thanh toán          → /payments                (Owner + Manager)
Hoá đơn             → /invoices                (Owner + Manager)
Trả hàng            → /returns                 (all)
Yêu cầu mua hàng    → /purchase-requisitions   (all)
Ngân sách           → /budgets                 (Owner + Manager)
Phê duyệt           → /approvals               (Owner + Manager)
Đấu giá ngược       → /auctions                (Owner)
Thỏa thuận giá      → /price-agreements        (Owner)
Bảo hành            → /warranties              (all)
Thông báo           → /notifications           (all)
Tài liệu            → /documents               (all)
Báo cáo             → /reports                 (Owner + Manager)
Quản lý Team        → /team                    (Owner only)
```

### SellerLayout — Sidebar navigation

```
Dashboard           → /seller/dashboard        (all Staff)
Đơn hàng            → /seller/orders           (Chủ DN, Quản lý, NV Bán hàng)
Sản phẩm            → /seller/products         (Chủ DN, Quản lý, NV Bán hàng)
RFQ                 → /seller/rfqs             (Chủ DN, Quản lý, NV Bán hàng)
Báo giá             → /seller/quotations       (Chủ DN, Quản lý, NV Bán hàng)
Hợp đồng            → /seller/contracts        (Chủ DN, Quản lý)
Kho hàng            → /seller/warehouse        (Chủ DN, Quản lý, Thủ kho)
Vận chuyển          → /seller/shipments        (Chủ DN, Quản lý, NV Bán hàng)
Thanh toán          → /seller/payments         (Chủ DN, Kế toán)
Hoá đơn             → /seller/invoices         (Chủ DN, Kế toán)
Công nợ             → /seller/credit           (Chủ DN, Kế toán)
Trả hàng            → /seller/returns          (Chủ DN, Quản lý)
Đánh giá            → /seller/reviews          (Chủ DN, Quản lý, NV Bán hàng)
Khuyến mãi          → /seller/promotions       (Chủ DN, Quản lý)
Nhân sự             → /seller/staff            (Chủ DN)
Phê duyệt           → /seller/approvals        (Chủ DN, Quản lý)
Báo cáo             → /seller/reports          (Chủ DN, Quản lý, Kế toán)
Cài đặt             → /seller/settings         (Chủ DN)
```

### AdminLayout — Sidebar navigation

```
Dashboard           → /admin/dashboard
Users               → /admin/users
Suppliers           → /admin/suppliers
Danh mục            → /admin/categories
Sản phẩm            → /admin/products
Đơn hàng            → /admin/orders
Vận chuyển          → /admin/shipments
Thanh toán          → /admin/payments
Hoá đơn             → /admin/invoices
Đánh giá            → /admin/reviews
RFQ                 → /admin/rfqs
Hợp đồng            → /admin/contracts
Chứng chỉ           → /admin/certificates
Cài đặt             → /admin/settings
Báo cáo             → /admin/reports
Nhật ký             → /admin/activity-logs
```

---

## 8. Migration to Supabase Auth

*Lộ trình chuyển từ mock auth sang Supabase:*

```typescript
// BEFORE (mock):
const login = async ({ email, password }) => {
  const user = mockUsers.find(u => u.email === email && u.password === password);
  if (!user) throw new Error('Invalid credentials');
  setUser(user);
  localStorage.setItem('authUser', JSON.stringify(user));
};

// AFTER (Supabase):
const login = async ({ email, password }) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;

  // Lấy profile từ users table
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', data.user.id)
    .single();

  setUser({ ...data.user, ...profile });
  // Supabase tự quản lý session (không cần localStorage)
};

// Restore session:
useEffect(() => {
  supabase.auth.onAuthStateChange((event, session) => {
    if (session?.user) loadUserProfile(session.user.id);
    else setUser(null);
  });
}, []);
```

---

## 9. Invited User Flow (Future)

```
Seller invite staff:
  1. Seller Admin nhập email nhân viên → POST /suppliers/:id/staff/invite
  2. System gửi email với invite token
  3. Nhân viên click link → /register?invite=TOKEN
  4. Register form tự điền email, role dựa trên token
  5. Sau register → auto join supplier với role đã gán

Buyer invite team member:
  1. Buyer Owner nhập email → POST /teams/invite
  2. Gửi email invite
  3. Người được mời register → auto join buyer company với role 'Viewer' (mặc định)
  4. Owner thay đổi role nếu cần
```

---

## 10. Security Considerations

### XSS Prevention

```
- React auto-escape tất cả JSX expressions: {userInput} → safe
- Dùng dangerouslySetInnerHTML: HẠN CHẾ, chỉ dùng với sanitized HTML
- User-generated content (reviews, descriptions): render as plain text, không render HTML
```

### Sensitive Data

```
- KHÔNG lưu password trong localStorage
- KHÔNG lưu credit card hay payment info trong frontend
- Token JWT: lưu trong localStorage (mock) → Supabase HttpOnly cookie (production)
- PII (Personal Identifiable Information): KHÔNG log trong activityLog.changes
```

### Input Validation

```
- Client-side: validate trước khi submit (type check, required fields, format)
- Service-side (mock): throw Error với message rõ ràng
- Supabase (future): Database constraints + RLS policies
```

### CSRF

```
- Mock mode: N/A (không có server)
- Supabase: Tự động handle qua session cookies với SameSite=Lax
```

---

## Tài liệu liên quan

- [18-roles-permissions.md](./18-roles-permissions.md) — Role definitions & Access Matrix
- [32-vibe-coding-context.md](./32-vibe-coding-context.md) — COMPONENT MAP (AuthContext, Guards)
- [02-architecture.md](./02-architecture.md) — Auth flow diagrams
- [29-supabase-client-guide.md](./29-supabase-client-guide.md) — Supabase Auth migration

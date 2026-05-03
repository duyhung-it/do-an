# 30 — Testing Strategy

> Chiến lược kiểm thử cho hệ thống B2B eCommerce.
> Bao gồm: Unit tests, Integration tests, E2E tests, Test scenarios quan trọng.

---

## 1. Testing Stack

| Layer | Tool | Purpose |
|-------|------|---------|
| Unit / Component | Vitest + React Testing Library | Test logic, renders, interactions |
| Service Layer | Vitest + Mock | Test API service functions |
| E2E | Playwright | Test full user flows |
| Visual Regression | Storybook + Chromatic (optional) | Component states |
| API (future) | Supertest | Test API endpoints |

### Setup

```bash
# Cài đặt
npm install -D vitest @testing-library/react @testing-library/jest-dom
npm install -D @testing-library/user-event
npm install -D playwright @playwright/test
```

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
  },
});

// src/test/setup.ts
import '@testing-library/jest-dom';
```

---

## 2. Unit Tests

### Service Layer Tests

```typescript
// src/app/services/__tests__/orderService.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { orderApi } from '../api';

describe('orderApi', () => {
  beforeEach(() => {
    // Reset mock data
  });

  describe('getOrders', () => {
    it('should return filtered orders by status', async () => {
      const result = await orderApi.getOrders({ status: 'Chờ xác nhận' });
      expect(result.data.every(o => o.status === 'Chờ xác nhận')).toBe(true);
    });

    it('should apply pagination correctly', async () => {
      const result = await orderApi.getOrders({ page: 1, pageSize: 5 });
      expect(result.data.length).toBeLessThanOrEqual(5);
      expect(result.page).toBe(1);
    });
  });

  describe('createOrder', () => {
    it('should create order with correct totals', async () => {
      const orderData = {
        supplierId: 'sup-001',
        items: [{ productId: 'prod-001', quantity: 2, unitPrice: 35000000 }],
        shippingAddressId: 'addr-001',
      };
      const result = await orderApi.createOrder(orderData);
      expect(result.totalAmount).toBe(70000000 * 1.1); // tax 10%
      expect(result.status).toBe('Chờ xác nhận');
    });
  });
});
```

### Business Logic Tests

```typescript
// src/app/utils/__tests__/promotionUtils.test.ts
import { describe, it, expect } from 'vitest';
import { calculateDiscount, validatePromotion } from '../promotionUtils';

describe('Promotion Utils', () => {
  describe('calculateDiscount', () => {
    it('should calculate percentage discount', () => {
      const promo = { type: 'Phần trăm', value: 20, maxDiscount: 2000000 };
      expect(calculateDiscount(promo, 10000000)).toBe(2000000); // capped
      expect(calculateDiscount(promo, 5000000)).toBe(1000000);  // 20%
    });

    it('should calculate fixed discount', () => {
      const promo = { type: 'Số tiền', value: 500000 };
      expect(calculateDiscount(promo, 2000000)).toBe(500000);
    });
  });

  describe('validatePromotion', () => {
    it('should fail when usage limit exceeded', () => {
      const promo = { usageLimit: 100, usedCount: 100, isActive: true };
      expect(() => validatePromotion(promo, [], 1000000)).toThrow('PROMOTION_USAGE_LIMIT_EXCEEDED');
    });

    it('should fail when minimum order value not met', () => {
      const promo = { minOrderValue: 5000000, usageLimit: null, isActive: true,
        startDate: '2026-01-01', endDate: '2026-12-31', scope: 'all', usedCount: 0 };
      expect(() => validatePromotion(promo, [], 1000000)).toThrow('PROMOTION_MIN_VALUE_NOT_MET');
    });
  });
});
```

### Utility Function Tests

```typescript
// src/app/utils/__tests__/formatUtils.test.ts
import { describe, it, expect } from 'vitest';
import { formatCurrency, formatDate, formatRelativeTime } from '../formatUtils';

describe('formatCurrency', () => {
  it('formats VND currency correctly', () => {
    expect(formatCurrency(1000000)).toContain('1.000.000');
    expect(formatCurrency(1000000)).toContain('₫');
    expect(formatCurrency(0)).toContain('0');
  });
});

describe('formatDate', () => {
  it('formats date in Vietnamese locale', () => {
    expect(formatDate('2026-03-15')).toBe('15/03/2026');
  });
});
```

---

## 3. Component Tests

```typescript
// src/app/components/__tests__/OrderStatusBadge.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { OrderStatusBadge } from '../shared/OrderStatusBadge';

describe('OrderStatusBadge', () => {
  it('renders correct status text', () => {
    render(<OrderStatusBadge status="Chờ xác nhận" />);
    expect(screen.getByText('Chờ xác nhận')).toBeInTheDocument();
  });

  it('applies warning variant for pending status', () => {
    const { container } = render(<OrderStatusBadge status="Chờ xác nhận" />);
    expect(container.firstChild).toHaveClass('badge-warning');
  });

  it('applies success variant for delivered status', () => {
    const { container } = render(<OrderStatusBadge status="Đã giao" />);
    expect(container.firstChild).toHaveClass('badge-success');
  });
});
```

```typescript
// src/app/components/__tests__/CartPage.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CartPage } from '../buyer/CartPage';
import { CartContext } from '../../context/CartContext';

const mockCart = {
  items: [
    {
      id: 'cart-001',
      productId: 'prod-001',
      productName: 'Laptop Dell XPS 15',
      quantity: 2,
      unitPrice: 35000000,
      totalPrice: 70000000,
      savedForLater: false,
    }
  ],
  subtotal: 70000000,
  removeItem: vi.fn(),
  updateQuantity: vi.fn(),
};

describe('CartPage', () => {
  it('displays cart items', () => {
    render(
      <CartContext.Provider value={mockCart}>
        <CartPage />
      </CartContext.Provider>
    );
    expect(screen.getByText('Laptop Dell XPS 15')).toBeInTheDocument();
    expect(screen.getByText('70.000.000 ₫')).toBeInTheDocument();
  });

  it('calls removeItem when delete button clicked', async () => {
    render(<CartContext.Provider value={mockCart}><CartPage /></CartContext.Provider>);
    await userEvent.click(screen.getByRole('button', { name: /xóa/i }));
    expect(mockCart.removeItem).toHaveBeenCalledWith('cart-001');
  });
});
```

---

## 4. E2E Tests (Playwright)

### Setup

```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  baseURL: 'http://localhost:5173',
  use: {
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
    { name: 'mobile', use: { viewport: { width: 375, height: 812 } } },
  ],
});
```

### Critical Flow Tests

```typescript
// e2e/buyer-order-flow.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Buyer Order Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login as Buyer
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', 'buyer@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');
    await expect(page).toHaveURL('/dashboard');
  });

  test('should add product to cart and checkout', async ({ page }) => {
    // Navigate to products
    await page.goto('/products');
    await page.click('[data-testid="product-card"]:first-child');

    // Add to cart
    await page.click('[data-testid="add-to-cart-button"]');
    await expect(page.locator('[data-testid="cart-count"]')).toHaveText('1');

    // Go to cart
    await page.goto('/cart');
    await expect(page.locator('[data-testid="cart-item"]')).toHaveCount(1);

    // Proceed to checkout
    await page.click('[data-testid="checkout-button"]');
    await expect(page.locator('[data-testid="order-success"]')).toBeVisible();
  });

  test('should filter orders by status', async ({ page }) => {
    await page.goto('/orders');
    await page.selectOption('[data-testid="status-filter"]', 'Chờ xác nhận');
    const orders = page.locator('[data-testid="order-row"]');
    for (const order of await orders.all()) {
      await expect(order.locator('.status-badge')).toHaveText('Chờ xác nhận');
    }
  });
});
```

```typescript
// e2e/seller-order-process.spec.ts
test.describe('Seller Order Processing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', 'seller@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');
    await expect(page).toHaveURL('/seller/dashboard');
  });

  test('should confirm a pending order', async ({ page }) => {
    await page.goto('/seller/orders');
    await page.click('[data-testid="pending-tab"]');
    await page.click('[data-testid="order-row"]:first-child');

    await page.click('[data-testid="confirm-order-button"]');
    await expect(page.locator('[data-testid="status-badge"]')).toHaveText('Đã xác nhận');
  });
});
```

---

## 5. Test Scenarios Checklist

### Authentication

```
✓ Login thành công với đúng credentials
✓ Login thất bại → hiện error message
✓ Redirect đúng trang theo role (Buyer/Seller/Admin)
✓ Session persist sau khi reload
✓ Logout xóa session
✓ Guard redirect khi chưa login
✓ Guard redirect sai role
```

### Order Flow

```
✓ Thêm sản phẩm vào giỏ hàng
✓ Không cho thêm quá stock
✓ Không cho thêm dưới minOrderQty
✓ Cộng dồn quantity khi thêm lại
✓ Áp dụng promotion code hợp lệ
✓ Từ chối promotion code không hợp lệ
✓ Tính tổng tiền chính xác (subtotal + tax - discount)
✓ Tạo đơn hàng thành công
✓ Seller xác nhận đơn hàng
✓ Tạo shipment
✓ Track shipment events
✓ Order = Đã giao sau shipment delivered
```

### RFQ Flow

```
✓ Tạo RFQ với ít nhất 1 item
✓ Submit RFQ (Bản nháp → Đã gửi)
✓ Seller xem RFQ trên marketplace
✓ Seller tạo quotation
✓ Buyer xem quotations
✓ Buyer accept quotation → tạo contract
✓ Quotation còn lại → Từ chối
✓ RFQ hết hạn → Hết hạn
```

### Payment Flow

```
✓ Payment tạo khi order confirmed
✓ Ghi nhận partial payment
✓ Full payment → status = Đã thanh toán
✓ Quá dueDate → isOverdue = true
✓ Tính lateFee chính xác
✓ Seller gửi reminder
```

### Inventory

```
✓ Nhập hàng → StockMovement Nhập kho
✓ Đặt hàng → reserve quantity
✓ Giao hàng xong → StockMovement Xuất kho
✓ Tồn kho = 0 → StockAlert Hết hàng
✓ Tồn kho <= minStock → StockAlert Sắp hết
✓ Chuyển kho → movements cả 2 kho
```

### Return Flow

```
✓ Không cho tạo return sau 7 ngày
✓ Tạo return request
✓ Seller xử lý (accept/reject)
✓ Accept → refundAmount hợp lệ
✓ Reject → lý do bắt buộc
✓ Hoàn tiền → Payment status update
```

### Permissions

```
✓ Buyer không access /seller/*
✓ Seller không access /admin/*
✓ Admin access tất cả
✓ Seller chỉ thấy data của mình
✓ Buyer chỉ thấy đơn hàng của mình
✓ Viewer (Buyer sub-role) không tạo được order
```

---

## 6. Test Data (Mock Data)

```typescript
// src/test/fixtures/index.ts

export const mockUser: AuthUser = {
  id: 'user-001',
  email: 'buyer@example.com',
  fullName: 'Nguyễn Văn A',
  role: 'Buyer',
  companyName: 'Công ty TNHH ABC',
};

export const mockSellerUser: AuthUser = {
  id: 'user-002',
  email: 'seller@example.com',
  fullName: 'Trần Thị B',
  role: 'Seller',
  supplierId: 'sup-001',
};

export const mockProduct: Product = {
  id: 'prod-001',
  name: 'Laptop Dell XPS 15',
  slug: 'laptop-dell-xps-15',
  categoryId: 'cat-002',
  supplierId: 'sup-001',
  price: 35000000,
  stock: 50,
  unit: 'Cái',
  minOrderQty: 1,
  images: ['https://...'],
  status: 'active',
  isActive: true,
  featured: false,
  viewCount: 0,
  soldCount: 0,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

export const mockOrder: Order = {
  id: 'ord-001',
  orderNumber: 'ORD-20260315-001',
  buyerId: 'user-001',
  buyerName: 'Nguyễn Văn A',
  supplierId: 'sup-001',
  supplierName: 'Công ty Dell VN',
  status: 'Chờ xác nhận',
  orderType: 'Thường',
  totalAmount: 70000000,
  items: [],
  createdAt: '2026-03-15T08:00:00Z',
};
```

---

## 7. Coverage Goals

| Layer | Target |
|-------|--------|
| Business logic utils | 90%+ |
| Service layer | 80%+ |
| Critical components (Cart, Checkout, Auth) | 70%+ |
| UI components | 60%+ |
| E2E critical flows | 100% |

```bash
# Chạy tests
npm run test              # Vitest watch mode
npm run test:coverage     # Coverage report
npx playwright test       # E2E tests
npx playwright test --ui  # E2E với UI
```

---

## Tài liệu liên quan

- [31-deployment.md](./31-deployment.md) — Deployment guide
- [03-coding-conventions.md](./03-coding-conventions.md) — Code conventions
- [17-state-machines.md](./17-state-machines.md) — State transitions (dùng cho test scenarios)

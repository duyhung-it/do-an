# 28 — Supabase Setup Guide

> Hướng dẫn cấu hình Supabase cho hệ thống B2B eCommerce.
> Bao gồm: Project setup, Database migration, Auth config, Storage buckets, Edge Functions.

---

## 1. Project Setup

### Khởi tạo Supabase project

```bash
# Cài đặt Supabase CLI
npm install -g supabase

# Đăng nhập
supabase login

# Khởi tạo project local
cd "B2B eCommerce Platform Plan"
supabase init

# Kết nối với Supabase Cloud project
supabase link --project-ref YOUR_PROJECT_REF
```

### Environment Variables

```bash
# .env.local
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...   # Public anon key
SUPABASE_SERVICE_KEY=eyJhbGci...      # Service role key (server only, KHÔNG dùng ở frontend)
```

### Supabase Client Setup

```typescript
// src/app/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';  // Generated types

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});
```

---

## 2. Database Migration

### Migration folder structure

```
supabase/
  migrations/
    20260101000001_create_users.sql
    20260101000002_create_suppliers.sql
    20260101000003_create_categories.sql
    20260101000004_create_products.sql
    20260101000005_create_orders.sql
    20260101000006_create_rfqs.sql
    20260101000007_create_shipments.sql
    20260101000008_create_payments.sql
    20260101000009_create_inventory.sql
    20260101000010_create_promotions.sql
    20260101000011_create_approvals.sql
    20260101000012_create_reviews.sql
    20260101000013_create_system.sql
    20260101000014_create_indexes.sql
    20260101000015_create_rls_policies.sql
    20260101000016_seed_data.sql
```

### Template migration file

```sql
-- supabase/migrations/20260101000001_create_users.sql
-- Tạo bảng users (sau auth.users của Supabase)

CREATE TABLE public.users (
  id               UUID         REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email            VARCHAR(255) NOT NULL UNIQUE,
  full_name        VARCHAR(255) NOT NULL,
  phone            VARCHAR(20)  NULL,
  role             VARCHAR(50)  NOT NULL DEFAULT 'Buyer'
                   CHECK (role IN ('Buyer', 'Seller', 'Admin')),
  supplier_id      UUID         NULL REFERENCES public.suppliers(id),
  company_id       UUID         NULL REFERENCES public.buyer_companies(id),
  avatar           TEXT         NULL,
  status           VARCHAR(50)  NOT NULL DEFAULT 'Hoạt động'
                   CHECK (status IN ('Hoạt động', 'Tạm khóa', 'Chờ xác minh')),
  created_at       TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- Khi user đăng ký → tự động tạo profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Unknown'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'Buyer')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### Chạy migrations

```bash
# Push lên Supabase Cloud
supabase db push

# Hoặc reset + push mới
supabase db reset

# Generate TypeScript types từ schema
supabase gen types typescript --local > src/app/lib/database.types.ts
```

---

## 3. Row Level Security (RLS) Policies

### Enable RLS cho tất cả bảng

```sql
-- supabase/migrations/20260101000015_create_rls_policies.sql

-- Enable RLS
ALTER TABLE public.users          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rfqs           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
-- ... tất cả các bảng
```

### Helper functions

```sql
-- Lấy role của current user
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.users WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Lấy supplierId của Seller user
CREATE OR REPLACE FUNCTION public.get_user_supplier_id()
RETURNS UUID AS $$
  SELECT supplier_id FROM public.users WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Kiểm tra user có phải Admin không
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT get_user_role() = 'Admin';
$$ LANGUAGE sql SECURITY DEFINER STABLE;
```

### Products RLS

```sql
-- Buyers/Public: chỉ thấy active products
CREATE POLICY "products_public_read" ON public.products
  FOR SELECT USING (
    is_active = true AND status IN ('active')
    OR is_admin()
    OR supplier_id = get_user_supplier_id()
  );

-- Sellers: chỉ tạo/sửa sản phẩm của mình
CREATE POLICY "products_seller_write" ON public.products
  FOR INSERT WITH CHECK (supplier_id = get_user_supplier_id());

CREATE POLICY "products_seller_update" ON public.products
  FOR UPDATE USING (
    supplier_id = get_user_supplier_id() OR is_admin()
  );
```

### Orders RLS

```sql
-- Buyers thấy đơn của mình
CREATE POLICY "orders_buyer_read" ON public.orders
  FOR SELECT USING (
    buyer_id = auth.uid()
    OR supplier_id = get_user_supplier_id()
    OR is_admin()
  );

-- Buyers tạo đơn
CREATE POLICY "orders_buyer_create" ON public.orders
  FOR INSERT WITH CHECK (buyer_id = auth.uid());

-- Sellers cập nhật status đơn của họ
CREATE POLICY "orders_seller_update" ON public.orders
  FOR UPDATE USING (
    supplier_id = get_user_supplier_id() OR is_admin()
  );
```

### Inventory RLS (Seller only)

```sql
CREATE POLICY "inventory_seller_only" ON public.inventory_items
  FOR ALL USING (
    warehouse_id IN (
      SELECT id FROM public.warehouses
      WHERE supplier_id = get_user_supplier_id()
    )
    OR is_admin()
  );
```

---

## 4. Supabase Auth Configuration

### Email Auth (mặc định)

```
Settings → Authentication → Providers
  → Email: Enable
  → Email confirmation: Enable (production)
  → Password minimum length: 8

Email templates (trong Supabase Dashboard):
  → Confirm signup: "Xác nhận đăng ký tài khoản B2B Platform"
  → Reset password: "Đặt lại mật khẩu"
  → Magic link: "Đăng nhập không cần mật khẩu"
```

### Auth Hooks

```typescript
// Sau khi login thành công → fetch user profile
supabase.auth.onAuthStateChange(async (event, session) => {
  if (event === 'SIGNED_IN' && session?.user) {
    const { data: profile } = await supabase
      .from('users')
      .select('*, suppliers(*)')
      .eq('id', session.user.id)
      .single();

    setUser(profile);
  } else if (event === 'SIGNED_OUT') {
    setUser(null);
  }
});
```

### Social Auth (Optional)

```
Settings → Authentication → Providers
  → Google: Enable (OAuth Client ID + Secret)
  → Github: Enable (for dev accounts)
```

---

## 5. Storage Buckets

```sql
-- Tạo buckets
INSERT INTO storage.buckets (id, name, public) VALUES
  ('product-images', 'product-images', true),   -- Public, CDN cached
  ('supplier-logos', 'supplier-logos', true),
  ('rfq-attachments', 'rfq-attachments', false), -- Private
  ('certificates', 'certificates', false),        -- Private, Admin review
  ('grn-images', 'grn-images', false),
  ('return-images', 'return-images', false),
  ('documents', 'documents', false),
  ('avatars', 'avatars', true);
```

### Storage policies

```sql
-- Product images: public read, seller write
CREATE POLICY "product_images_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'product-images');

CREATE POLICY "product_images_seller_write" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'product-images' AND
    (get_user_role() IN ('Seller', 'Admin'))
  );

-- RFQ attachments: only buyer+seller of that RFQ
CREATE POLICY "rfq_attachments_read" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'rfq-attachments' AND
    (is_admin() OR auth.uid() IS NOT NULL)  -- Simplify: any authenticated user
  );
```

### Upload pattern (TypeScript)

```typescript
// Upload product image
async function uploadProductImage(file: File, productId: string): Promise<string> {
  const ext = file.name.split('.').pop();
  const fileName = `${productId}/${Date.now()}.${ext}`;

  const { data, error } = await supabase.storage
    .from('product-images')
    .upload(fileName, file, {
      contentType: file.type,
      upsert: false,
    });

  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage
    .from('product-images')
    .getPublicUrl(data.path);

  return publicUrl;
}
```

---

## 6. Realtime Subscriptions

```typescript
// Realtime notifications
function subscribeToNotifications(userId: string) {
  const channel = supabase
    .channel('notifications')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        // New notification → update NotificationContext
        addNotification(payload.new as Notification);
        // Show toast for urgent notifications
        if (payload.new.priority === 'urgent') {
          toast(payload.new.title, { description: payload.new.message });
        }
      }
    )
    .subscribe();

  return () => supabase.removeChannel(channel);
}

// Realtime order status (Buyer watching their order)
function subscribeToOrderStatus(orderId: string) {
  return supabase
    .channel(`order-${orderId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'orders',
        filter: `id=eq.${orderId}`,
      },
      (payload) => {
        setOrder(prev => ({ ...prev, status: payload.new.status }));
        toast.info(`Trạng thái đơn hàng: ${payload.new.status}`);
      }
    )
    .subscribe();
}
```

---

## 7. Edge Functions

### Structure

```
supabase/functions/
  send-notification/
    index.ts          # Gửi thông báo (email + inApp)
  process-payment/
    index.ts          # Xử lý thanh toán
  cron-overdue/
    index.ts          # Cron: check overdue payments, invoices
  cron-stock-alerts/
    index.ts          # Cron: check low stock
  generate-invoice-pdf/
    index.ts          # Tạo PDF hoá đơn
  webhook-handler/
    index.ts          # Nhận webhooks từ third-party
```

### Template Edge Function

```typescript
// supabase/functions/send-notification/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  const { userId, type, title, message, entityType, entityId } = await req.json();

  // 1. Tạo notification in DB
  const { error } = await supabase
    .from('notifications')
    .insert({ user_id: userId, type, title, message, entity_type: entityType, entity_id: entityId });

  if (error) return new Response(JSON.stringify({ error }), { status: 500 });

  // 2. Gửi email nếu user bật email notifications
  const { data: prefs } = await supabase
    .from('notification_preferences')
    .select('*')
    .eq('user_id', userId)
    .eq('type', type)
    .eq('channel', 'email')
    .single();

  if (prefs?.enabled) {
    // Gọi Resend/SendGrid để gửi email
    await sendEmail(userId, title, message);
  }

  return new Response(JSON.stringify({ success: true }), { status: 200 });
});
```

### Deploy Edge Function

```bash
supabase functions deploy send-notification
supabase functions deploy cron-overdue --schedule="0 2 * * *"  # Daily 2am
```

---

## 8. Database Functions & Triggers

### Auto-update timestamp

```sql
-- Trigger auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
-- Repeat for all major tables
```

### Auto-create StockMovement khi tồn kho thay đổi

```sql
CREATE OR REPLACE FUNCTION log_inventory_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.quantity != NEW.quantity THEN
    INSERT INTO stock_movements (
      warehouse_id, product_id, type, quantity,
      quantity_before, quantity_after, reference_type
    ) VALUES (
      NEW.warehouse_id, NEW.product_id,
      CASE WHEN NEW.quantity > OLD.quantity THEN 'Nhập kho' ELSE 'Xuất kho' END,
      ABS(NEW.quantity - OLD.quantity),
      OLD.quantity, NEW.quantity,
      'System Auto'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

---

## 9. Performance: Indexes

```sql
-- Indexes quan trọng nhất (xem đầy đủ tại các migration files)

-- Full-text search cho products
CREATE INDEX idx_products_search ON products
  USING GIN (to_tsvector('simple', name || ' ' || COALESCE(description, '')));

-- Composite indexes cho queries phổ biến
CREATE INDEX idx_orders_buyer_status ON orders(buyer_id, status);
CREATE INDEX idx_orders_supplier_status ON orders(supplier_id, status);
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read)
  WHERE is_read = false;
```

---

## 10. Checklist Before Deploy

```
□ RLS enabled cho tất cả public tables
□ Tất cả secrets trong Supabase Vault (không hardcode)
□ Email templates configured
□ Storage buckets + policies set up
□ Edge Functions deployed
□ Cron jobs scheduled
□ TypeScript types generated: supabase gen types typescript
□ Database backups enabled (Plan PITR)
□ Logging configured (Supabase Dashboard → Logs)
□ Rate limiting (Supabase automatically applies)
```

---

## Tài liệu liên quan

- [29-supabase-client-guide.md](./29-supabase-client-guide.md) — Client-side Supabase usage patterns
- [04-database-schema-part1.md](./04-database-schema-part1.md) — SQL Schema definitions
- [19-permission-implementation.md](./19-permission-implementation.md) — Auth & Guards

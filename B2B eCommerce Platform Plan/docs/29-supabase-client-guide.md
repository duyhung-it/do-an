# 29 — Supabase Client Usage Guide

> Các pattern thực tế để dùng Supabase client trong React/TypeScript.
> Bổ sung cho setup tại [28-supabase-setup.md](./28-supabase-setup.md).

---

## 1. Migration từ Mock API → Supabase

### Before (Mock API)

```typescript
// src/app/services/api.ts — Mock implementation
export const productApi = {
  getProducts: async (filters?: ProductFilters): Promise<PaginatedResponse<Product>> => {
    let products = mockProducts;
    if (filters?.search) {
      products = products.filter(p =>
        p.name.toLowerCase().includes(filters.search!.toLowerCase())
      );
    }
    return { data: products, total: products.length, page: 1, pageSize: 20 };
  },
};
```

### After (Supabase)

```typescript
// src/app/services/supabase/productService.ts
import { supabase } from '@/lib/supabase';

export const productService = {
  getProducts: async (filters?: ProductFilters) => {
    let query = supabase
      .from('products')
      .select('*, suppliers(company_name), categories(name)', { count: 'exact' })
      .eq('is_active', true)
      .eq('status', 'active');

    if (filters?.search) {
      query = query.ilike('name', `%${filters.search}%`);
    }
    if (filters?.categoryId) {
      query = query.eq('category_id', filters.categoryId);
    }
    if (filters?.supplierId) {
      query = query.eq('supplier_id', filters.supplierId);
    }
    if (filters?.minPrice) {
      query = query.gte('price', filters.minPrice);
    }
    if (filters?.maxPrice) {
      query = query.lte('price', filters.maxPrice);
    }

    const page = filters?.page ?? 1;
    const pageSize = filters?.pageSize ?? 20;
    query = query
      .order(filters?.sortField ?? 'created_at', { ascending: filters?.sortOrder === 'asc' })
      .range((page - 1) * pageSize, page * pageSize - 1);

    const { data, error, count } = await query;
    if (error) throw error;

    return {
      data: data as Product[],
      total: count ?? 0,
      page,
      pageSize,
      success: true,
    };
  },
};
```

---

## 2. CRUD Patterns

### SELECT (Read)

```typescript
// Single record
const { data, error } = await supabase
  .from('orders')
  .select('*, order_items(*), users(full_name, email)')
  .eq('id', orderId)
  .single();

// List với pagination
const { data, count, error } = await supabase
  .from('orders')
  .select('*', { count: 'exact' })
  .eq('buyer_id', userId)
  .order('created_at', { ascending: false })
  .range(0, 19);  // page 1, pageSize 20

// Nested joins
const { data } = await supabase
  .from('rfqs')
  .select(`
    *,
    buyer:users!buyer_id(full_name, email),
    supplier:suppliers!supplier_id(company_name),
    rfq_items(*),
    quotations(*)
  `)
  .eq('id', rfqId)
  .single();
```

### INSERT (Create)

```typescript
// Single insert
const { data, error } = await supabase
  .from('orders')
  .insert({
    buyer_id: user.id,
    supplier_id: supplierId,
    order_number: generateNumber('ORD'),
    status: 'Chờ xác nhận',
    total_amount: cart.subtotal,
    shipping_address: selectedAddress,
  })
  .select()
  .single();

// Bulk insert
const { error } = await supabase
  .from('order_items')
  .insert(cart.items.map(item => ({
    order_id: newOrder.id,
    product_id: item.productId,
    quantity: item.quantity,
    unit_price: item.unitPrice,
    total_price: item.quantity * item.unitPrice,
  })));
```

### UPDATE

```typescript
// Update single record
const { error } = await supabase
  .from('orders')
  .update({ status: 'Đã xác nhận', updated_at: new Date().toISOString() })
  .eq('id', orderId);

// Update với returning
const { data, error } = await supabase
  .from('orders')
  .update({ status: newStatus })
  .eq('id', orderId)
  .select()
  .single();
```

### DELETE

```typescript
// Soft delete (preferred)
await supabase
  .from('products')
  .update({ is_active: false })
  .eq('id', productId);

// Hard delete (chỉ khi cần)
await supabase
  .from('cart_items')
  .delete()
  .eq('id', cartItemId);
```

---

## 3. Auth Patterns

### Login

```typescript
const loginWithSupabase = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(error.message);

  // Fetch profile vì auth.user không chứa role
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', data.user.id)
    .single();

  return { ...data.user, ...profile } as AuthUser;
};
```

### Register

```typescript
const registerWithSupabase = async (email: string, password: string, meta: {
  full_name: string;
  role: 'Buyer' | 'Seller';
  companyName?: string;
}) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {     // raw_user_meta_data → dùng trong trigger handle_new_user()
        full_name: meta.full_name,
        role: meta.role,
      },
    },
  });
  if (error) throw error;
  return data;
};
```

### Session Management

```typescript
// Context: tự động restore session
useEffect(() => {
  // Lấy session hiện tại
  supabase.auth.getSession().then(({ data: { session } }) => {
    if (session?.user) loadUserProfile(session.user.id);
  });

  // Theo dõi thay đổi auth state
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    async (event, session) => {
      if (session?.user && event === 'SIGNED_IN') {
        await loadUserProfile(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    }
  );

  return () => subscription.unsubscribe();
}, []);
```

---

## 4. Error Handling Pattern

```typescript
// Utility function để wrap Supabase calls:
async function supabaseQuery<T>(
  query: Promise<{ data: T | null; error: PostgrestError | null }>
): Promise<T> {
  const { data, error } = await query;
  if (error) {
    console.error('Supabase error:', error);
    // Map Supabase error codes to user-friendly messages
    if (error.code === '23505') throw new Error('DUPLICATE_ENTRY');
    if (error.code === '42501') throw new Error('FORBIDDEN');
    if (error.code === 'PGRST116') throw new Error('NOT_FOUND');
    throw new Error(error.message);
  }
  if (!data) throw new Error('NOT_FOUND');
  return data;
}

// Usage:
const order = await supabaseQuery(
  supabase.from('orders').select('*').eq('id', orderId).single()
);
```

---

## 5. Custom Hook Pattern

```typescript
// src/app/hooks/useSupabaseQuery.ts
import { useState, useEffect, useCallback } from 'react';

interface QueryState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useSupabaseQuery<T>(
  queryFn: () => Promise<T>,
  deps: any[] = []
): QueryState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await queryFn();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, deps);

  useEffect(() => { execute(); }, [execute]);

  return { data, loading, error, refetch: execute };
}

// Usage trong component:
const { data: orders, loading, refetch } = useSupabaseQuery(
  () => orderService.getOrders({ buyerId: user.id }),
  [user.id]
);
```

---

## 6. Optimistic Updates Pattern

```typescript
// Cập nhật UI ngay, rollback nếu API fail
const updateOrderStatus = async (orderId: string, newStatus: string) => {
  // 1. Optimistic update
  setOrders(prev => prev.map(o =>
    o.id === orderId ? { ...o, status: newStatus } : o
  ));

  // 2. API call
  try {
    await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId);
    toast.success(`Đã cập nhật trạng thái: ${newStatus}`);
  } catch (err) {
    // 3. Rollback on error
    setOrders(prev => prev.map(o =>
      o.id === orderId ? { ...o, status: prevStatus } : o
    ));
    toast.error('Cập nhật thất bại');
  }
};
```

---

## 7. Realtime Pattern (Notifications)

```typescript
// src/app/context/NotificationContext.tsx
useEffect(() => {
  if (!user) return;

  const channel = supabase
    .channel(`notifications-${user.id}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${user.id}`,
      },
      (payload) => {
        const notification = payload.new as Notification;
        setNotifications(prev => [notification, ...prev]);
        setUnreadCount(prev => prev + 1);

        // Toast cho urgent
        if (notification.priority === 'urgent') {
          toast.warning(notification.title, { description: notification.message });
        }
      }
    )
    .subscribe();

  return () => { supabase.removeChannel(channel); };
}, [user?.id]);
```

---

## 8. Full-text Search

```typescript
// Supabase full-text search với to_tsvector
const searchProducts = async (keyword: string) => {
  const { data, error } = await supabase
    .from('products')
    .select('id, name, price, images')
    .textSearch('fts', keyword, { type: 'websearch', config: 'simple' })
    .limit(10);

  return data;
};

// Cần tạo column fts trong migration:
// ALTER TABLE products ADD COLUMN fts tsvector
//   GENERATED ALWAYS AS (to_tsvector('simple', name || ' ' || COALESCE(description,''))) STORED;
// CREATE INDEX idx_products_fts ON products USING GIN(fts);
```

---

## 9. Storage Upload Pattern

```typescript
// Upload image và lấy public URL
const uploadAndGetUrl = async (
  bucket: string,
  file: File,
  path: string
): Promise<string> => {
  // Upload
  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(path, file, { upsert: true });

  if (uploadError) throw uploadError;

  // Get URL
  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(path);

  return publicUrl;
};

// Dùng:
const imageUrl = await uploadAndGetUrl(
  'product-images',
  file,
  `products/${productId}/${Date.now()}.webp`
);
```

---

## 10. TypeScript Type Generation

```bash
# Generate types từ Supabase schema
supabase gen types typescript --project-id YOUR_PROJECT_ID > src/app/lib/database.types.ts
```

```typescript
// Dùng generated types:
import type { Database } from '@/lib/database.types';

type Order = Database['public']['Tables']['orders']['Row'];
type OrderInsert = Database['public']['Tables']['orders']['Insert'];
type OrderUpdate = Database['public']['Tables']['orders']['Update'];

// Strongly-typed client:
const supabase = createClient<Database>(url, key);
// Bây giờ supabase.from('orders').select() trả về Order[]
```

---

## Tài liệu liên quan

- [28-supabase-setup.md](./28-supabase-setup.md) — Setup, migrations, RLS, Storage
- [19-permission-implementation.md](./19-permission-implementation.md) — Auth & Guards
- [32-vibe-coding-context.md](./32-vibe-coding-context.md) — Service Map

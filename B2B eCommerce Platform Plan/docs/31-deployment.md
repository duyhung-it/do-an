# 31 — Deployment Guide

> Hướng dẫn deploy hệ thống B2B eCommerce lên production.
> Stack: Vite + React → Vercel/Netlify; Supabase Cloud.

---

## 1. Environments

| Environment | URL | Supabase Project | Branch |
|-------------|-----|-----------------|--------|
| Development | `http://localhost:5173` | Local Supabase | `dev/*` |
| Staging | `https://b2b-staging.vercel.app` | Staging project | `staging` |
| Production | `https://b2b.yourcompany.com` | Production project | `main` |

---

## 2. Build & Deployment

### Vite Build

```bash
# Development
npm run dev            # localhost:5173, hot reload

# Production build
npm run build          # output: dist/
npm run preview        # preview production build locally

# Check bundle size
npm run build -- --report
```

### Environment Files

```
.env                   # Git-tracked (chỉ VITE_ public vars)
.env.local             # Git-ignored (secrets)
.env.production        # Production values
.env.staging           # Staging values

# Values:
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
VITE_APP_NAME=B2B Platform
VITE_APP_VERSION=1.0.0
```

### Vercel Deployment

```bash
# Cài Vercel CLI
npm i -g vercel

# Deploy
vercel                 # Staging
vercel --prod          # Production

# Environment variables
vercel env add VITE_SUPABASE_URL production
vercel env add VITE_SUPABASE_ANON_KEY production
```

### vercel.json

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-XSS-Protection", "value": "1; mode=block" }
      ]
    },
    {
      "source": "/assets/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    }
  ]
}
```

### GitHub Actions CI/CD

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main, staging]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run test:coverage
      - run: npm run build

  deploy-staging:
    needs: test
    if: github.ref == 'refs/heads/staging'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: 'npm' }
      - run: npm ci && npm run build
        env:
          VITE_SUPABASE_URL: ${{ secrets.STAGING_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.STAGING_SUPABASE_ANON_KEY }}
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}

  deploy-production:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: 'npm' }
      - run: npm ci && npm run build
        env:
          VITE_SUPABASE_URL: ${{ secrets.PROD_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.PROD_SUPABASE_ANON_KEY }}
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

---

## 3. Supabase Deployment

### Database Migration on Deploy

```bash
# Chạy migrations lên production
supabase db push --project-ref PROD_PROJECT_REF

# Verify migrations applied
supabase db diff --project-ref PROD_PROJECT_REF
```

### Data Seeding (Production)

```sql
-- Chỉ seed dữ liệu cần thiết ở production:
-- 1. Admin account
INSERT INTO auth.users (email, encrypted_password, ...) VALUES ('admin@platform.com', ...');
INSERT INTO public.users (id, email, full_name, role) VALUES (..., 'Admin');

-- 2. Root categories
INSERT INTO categories (name, slug, is_active) VALUES
  ('Điện tử - Công nghệ', 'dien-tu-cong-nghe', true),
  ('Văn phòng phẩm', 'van-phong-pham', true),
  ...;

-- 3. System configs
INSERT INTO system_configs (key, value, type, description) VALUES
  ('site_name', '"B2B Platform"', 'string', 'Tên hệ thống'),
  ('default_tax_rate', '10', 'number', '% VAT mặc định'),
  ('return_window_days', '7', 'number', 'Cửa sổ trả hàng'),
  ...;
```

### Edge Functions Deploy

```bash
# Deploy tất cả Edge Functions
supabase functions deploy --project-ref PROD_PROJECT_REF

# Deploy từng function
supabase functions deploy send-notification --project-ref PROD_PROJECT_REF
supabase functions deploy cron-overdue --project-ref PROD_PROJECT_REF

# Set secrets
supabase secrets set RESEND_API_KEY=re_xxx --project-ref PROD_PROJECT_REF
```

---

## 4. Performance Optimization

### Code Splitting (Vite + React Lazy)

```typescript
// Đã implement qua lazy() trong routes.tsx
// Kết quả: mỗi page = chunk riêng, giảm initial bundle

// Thêm prefetch hint cho critical pages:
<link rel="prefetch" href="/assets/ProductListPage-xxx.js" />
```

### Image Optimization

```typescript
// Dùng WebP format (convert khi upload lên Supabase Storage)
// Serve qua Supabase CDN (Cloudflare)
// Lazy loading cho images below the fold:
<img loading="lazy" src={product.image} alt={product.name} />
```

### Bundle Analysis

```bash
# Phân tích bundle size sau build:
npx vite-bundle-analyzer dist
# Hoặc:
npx rollup-plugin-visualizer
```

### Performance Targets

| Metric | Target |
|--------|--------|
| FCP (First Contentful Paint) | < 1.5s |
| LCP (Largest Contentful Paint) | < 2.5s |
| CLS (Cumulative Layout Shift) | < 0.1 |
| TTI (Time to Interactive) | < 3.5s |
| Lighthouse Score | > 90 |

---

## 5. Security Checklist

```
□ HTTPS enforced (Vercel tự động)
□ Supabase RLS enabled cho tất cả tables
□ VITE_SUPABASE_SERVICE_ROLE_KEY KHÔNG ở frontend
□ .env.local trong .gitignore
□ Content Security Policy headers configured
□ X-Frame-Options: DENY
□ Supabase anon key có tối thiểu permissions (chỉ bao gồm những gì RLS cho phép)
□ Rate limiting qua Supabase (tự động 100 req/s/project)
□ Input sanitization trước khi hiển thị HTML (dùng DOMPurify nếu cần)
□ No PII in console.log ở production
□ Supabase Vault cho API keys
```

---

## 6. Monitoring & Logging

### Error Monitoring (Sentry)

```typescript
// src/main.tsx
import * as Sentry from '@sentry/react';

if (import.meta.env.PROD) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: 'production',
    tracesSampleRate: 0.1,   // 10% của requests
    replaysSessionSampleRate: 0.1,
  });
}
```

### Analytics (Optional: Posthog, Google Analytics)

```typescript
// Chỉ track events quan trọng:
trackEvent('order_created', { orderTotal: order.totalAmount, supplierId });
trackEvent('rfq_submitted', { itemCount: rfq.items.length });
trackEvent('product_viewed', { productId, categoryId });
```

### Supabase Logs

```
Supabase Dashboard → Logs:
  → API logs: monitor slow queries
  → Auth logs: failed login attempts
  → Edge Function logs: errors

Set up alerts:
  → Error rate > 1%
  → Response time > 2s
  → Failed auth attempts > 10/min
```

---

## 7. Domain & SSL

```
Custom domain (Vercel):
1. Vercel Dashboard → Domains → Add
2. Nhập: b2b.yourcompany.com
3. Copy CNAME record → Thêm vào DNS provider
4. Vercel tự động issue Let's Encrypt SSL

Supabase custom domain (Pro plan):
1. Supabase Dashboard → Settings → Custom Domain
2. Follow setup guide
```

---

## 8. Rollback Plan

```bash
# Nếu deployment mới có lỗi:

# Option 1: Instant rollback via Vercel
vercel rollback [deployment-url]

# Option 2: Revert git commit + redeploy
git revert HEAD
git push origin main

# Option 3: Supabase DB rollback
# Nếu migration gây lỗi:
supabase db reset --db-url postgresql://...  # ⚠️ NGUY HIỂM: xóa toàn bộ data
# Tốt hơn: viết rollback script riêng cho mỗi migration
```

---

## 9. Pre-deployment Checklist

```
Code:
□ npm run build thành công
□ npm run test:coverage pass (>80%)
□ npm run lint không có errors
□ TypeScript strict mode pass

Database:
□ Migrations tested trên staging trước
□ Seed data đúng
□ RLS policies verified
□ Indexes đã tạo

Secrets:
□ Tất cả VITE_ env vars đã set trên Vercel
□ Supabase secrets đã set (RESEND_API_KEY, etc.)
□ Service role key KHÔNG public

Edge Functions:
□ Tất cả functions deployed
□ Cron jobs scheduled
□ Secrets configured

Post-deploy:
□ Smoke test: login, product list, create order
□ Check Sentry dashboard
□ Monitor error rate 30 phút sau deploy
```

---

## 10. Maintenance Mode

```typescript
// Bật maintenance mode qua system_config:
// admin/settings → key: maintenance_mode = true

// Frontend check:
const { data: config } = await supabase
  .from('system_configs')
  .select('value')
  .eq('key', 'maintenance_mode')
  .single();

if (config?.value === 'true' && user?.role !== 'Admin') {
  return <MaintenancePage />;
}
```

---

## Tài liệu liên quan

- [28-supabase-setup.md](./28-supabase-setup.md) — Supabase setup
- [30-testing-strategy.md](./30-testing-strategy.md) — Testing
- [02-architecture.md](./02-architecture.md) — System architecture

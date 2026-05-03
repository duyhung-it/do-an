# ============================================================
# KE HOACH HOAN THIEN TAI LIEU PHAN TICH THIET KE HE THONG
# SAN THUONG MAI DIEN TU B2B
# ============================================================
#
# Muc tieu: Tao bo tai lieu day du de bat ky AI nao (hoac dev)
#           doc la co the tiep tuc vibe code chinh xac, khong
#           can doc lai toan bo source code.
#
# Thu muc: /docs/
# Hien co: collections.md (danh sach 78+ bang, chua co chi tiet cot)
#
# TRANG THAI: HOAN THANH — 420/420 buoc ✅
# DOC-A(1-3) | DOC-B(4-7) | DOC-C(8) | DOC-D(9-13) | DOC-E(14-17)
# DOC-F(18-19) | DOC-G(20-23) | DOC-H(24-26) | DOC-I(27) | DOC-J(28-29)
# DOC-K(30) | DOC-L(31) | DOC-M(32-33) — TAT CA DA XONG
# TONG FILES: 01-33 (33 files) TAI /docs/
# = DOCUMENTATION HOAN CHINH, SAN SANG DE VIBE-CODE =
# TONG: ~420 buoc | 42 dot | 14 giai doan (DOC-A → DOC-N)
#
# QUY TAC:
#   1. Moi file tai lieu <= 2000 dong (tach file neu can)
#   2. Dung tieng Viet co dau cho noi dung, ASCII cho heading/key
#   3. Format: Markdown (.md)
#   4. Moi dot ~10 buoc, 1 prompt "Tiep tuc"
#   5. Tai lieu phai dong bo voi source code hien tai
#   6. Cross-reference giua cac tai lieu bang link tuong doi
#   7. Uu tien thong tin giup AI hieu ngay context khi vibe code
#   8. Khong lap lai thong tin — reference den file khac
# ============================================================


# ===========================================================
# DOC-A: TONG QUAN HE THONG & KIEN TRUC (30 buoc | Dot 1–3)
# ===========================================================

### DOC-A Dot 1: System Overview (10 buoc)
# => Tao file: /docs/01-system-overview.md

```
DOC-A.01  Viet phan "1. Gioi thieu du an": ten he thong, muc tieu kinh doanh,
          doi tuong su dung (Buyer/Seller/Admin), pham vi du an, doi thu tham chieu (Alibaba).
DOC-A.02  Viet phan "2. Tech Stack": React 18, TypeScript, Tailwind CSS v4,
          React Router (data mode), Recharts, Lucide Icons, shadcn/ui components.
          Ghi chu: KHONG dung react-router-dom, dung react-router.
DOC-A.03  Viet phan "3. Cau truc thu muc du an": mo ta tung folder
          (components/, services/, types/, data/, context/, hooks/, utils/, docs/).
          Dung tree diagram. Ghi so luong file moi folder.
DOC-A.04  Viet phan "4. Quy uoc dat ten": file (kebab-case .tsx), component (PascalCase),
          service (camelCase + Api suffix), type (PascalCase), mock data (camelCase).
DOC-A.05  Viet phan "5. Pattern chung": container wrapper (container mx-auto px-4 py-6),
          DataTable pattern (renderActions, totalItems, pagination, sort, getId),
          FilterBar + search pattern, FormDialog pattern, StatusBadge pattern.
DOC-A.06  Viet phan "6. State Management": AuthContext, CartContext, WishlistContext,
          NotificationContext. Mo ta data flow, noi luu tru (localStorage vs memory).
DOC-A.07  Viet phan "7. Routing Architecture": React Router data mode,
          3 nesting groups (BuyerLayout, SellerLayout, AdminLayout),
          Guards (BuyerGuard, SellerGuard, AdminGuard), lazy loading.
DOC-A.08  Viet phan "8. Service Layer Architecture": mock API pattern (delay + in-memory),
          api.ts (main, >2900 dong), cac service file rieng, export pattern.
          Ghi chu: api.ts qua lon, service moi PHAI tao file rieng.
DOC-A.09  Viet phan "9. Shared Components Library": liet ke 39 shared components
          voi 1 dong mo ta moi cai (DataTable, FilterBar, FormDialog, ...).
DOC-A.10  Viet phan "10. UI Components (shadcn/ui)": liet ke 48 UI primitives
          da cai (Button, Input, Dialog, ...). Ghi chu: Input va Button wrap forwardRef.
```

### DOC-A Dot 2: Architecture Diagrams (10 buoc)
# => Tao file: /docs/02-architecture.md

```
DOC-A.11  Ve so do kien truc tong the (ASCII art hoac Mermaid):
          Browser → React App → Service Layer → Mock Data (→ Future: Supabase API).
DOC-A.12  Ve so do module: 3 portals (Buyer/Seller/Admin) + Shared.
          Ghi so luong trang moi portal (Buyer ~51, Seller ~38, Admin ~19).
DOC-A.13  Ve so do routing hierarchy (Mermaid flowchart):
          / → BuyerLayout → [public pages, BuyerGuard → protected pages]
          /seller → SellerGuard → SellerLayout → [pages]
          /admin → AdminGuard → AdminLayout → [pages]
DOC-A.14  Ve so do data flow cho 1 trang dien hinh:
          Page Component → useState/useEffect → serviceApi.getXxx() → mock data → render.
DOC-A.15  Ve so do component hierarchy cho 1 trang phuc tap (VD: OrderOverview):
          Page → FilterBar + DataTable + FormDialog + StatusBadge + ...
DOC-A.16  Ve so do authentication flow:
          Login → AuthContext.login() → authApi.login() → setUser → redirect.
          Guard check → user.role → allow/redirect.
DOC-A.17  Ve so do notification flow:
          Action (order, rfq, ...) → notificationApi.create() → NotificationContext →
          NotificationDropdown badge + NotificationCenterPage.
DOC-A.18  Ve so do Cart/Checkout flow:
          AddToCart → CartContext → CartPage → OrderConfirmation → orderApi.create().
DOC-A.19  Ve so do file dependency graph cua service layer:
          api.ts imports types, mockData; cac xxxApi.ts import types.
          Liet ke api nao nam trong api.ts, api nao da tach file rieng.
DOC-A.20  Viet phan "Migration Strategy": ke hoach chuyen tu mock data sang
          Supabase (backend that). Map: mock delay → Supabase client call,
          in-memory array → PostgreSQL table, localStorage → Supabase Auth.
```

### DOC-A Dot 3: Coding Conventions & Patterns (10 buoc)
# => Tao file: /docs/03-coding-conventions.md

```
DOC-A.21  Viet phan "1. TypeScript Conventions": strict mode, no any,
          interface > type (tru union), optional fields dung `?`.
DOC-A.22  Viet phan "2. Component Patterns": function component only,
          named export (ko default tru App.tsx), props interface inline hoac tach.
DOC-A.23  Viet phan "3. Tailwind Patterns": ko dung text-2xl/font-bold/leading-none
          (tru khi user yeu cau), dung CSS variables tu theme.css,
          container mx-auto px-4 py-6 cho page wrapper.
DOC-A.24  Viet phan "4. Service Layer Pattern": async/await, delay simulation,
          let array cho mutable mock, spread copy, paginate/sort/filter helpers.
          Code template mau cho 1 service moi.
DOC-A.25  Viet phan "5. DataTable Usage Pattern": ColumnConfig[] (key, label,
          sortable, render, visible), renderActions, pagination/sort/getId props.
          Code template mau.
DOC-A.26  Viet phan "6. Form Pattern": FormDialog voi fields config,
          validation, onSubmit handler. Inline editing pattern.
          Code template mau.
DOC-A.27  Viet phan "7. Error Handling": toast.error() tu sonner,
          try/catch trong useEffect, service throw Error.
DOC-A.28  Viet phan "8. Performance Patterns": React.lazy + Suspense,
          useDebounce, apiCache (withCache), code splitting.
DOC-A.29  Viet phan "9. File Size Rules": max 2000 dong/file.
          Khi can tach: tach service rieng, tach sub-component,
          tach mock data, tach types.
DOC-A.30  Viet phan "10. Known Technical Debt & Workarounds":
          api.ts >2900 dong (can tach), B22.03-B22.05 chua implement,
          mot so page chua co responsive hoan chinh,
          sellerId vs supplierId naming inconsistency.
```


# ===========================================================
# DOC-B: DATABASE SCHEMA CHI TIET (40 buoc | Dot 4–7)
# ===========================================================

### DOC-B Dot 4: Schema — Nguoi dung, San pham, Danh muc (10 buoc)
# => Tao file: /docs/04-database-schema-part1.md

```
DOC-B.01  Viet header: quy uoc chung (PK, FK, NOT NULL, DEFAULT, INDEX),
          data types (uuid, varchar, text, integer, numeric, boolean, timestamptz),
          naming convention cot (snake_case), soft delete (is_active vs deleted_at).
DOC-B.02  Bang `users`: liet ke DAY DU tat ca cot (id, email, password_hash,
          full_name, role, avatar_url, company_name, company_id FK, supplier_id FK,
          phone, status, email_verified, phone_verified, language, timezone,
          last_login_at, created_at, updated_at). Type, nullable, default, index.
DOC-B.03  Bang `shipping_addresses`: tat ca cot (id, user_id FK, label, full_name,
          phone, address, city, district, ward, postal_code, latitude, longitude,
          type, is_default, created_at). Constraints, indexes.
DOC-B.04  Bang `notification_preferences`: tat ca cot (id, user_id FK, type,
          channel, enabled, created_at, updated_at). Unique constraint (user_id, type, channel).
DOC-B.05  Bang `categories`: tat ca cot (id, name, parent_id FK self-ref, slug UNIQUE,
          description, icon, is_active, image_url, sort_order, level, path, 
          meta_title, meta_description, product_count, created_at, updated_at).
          Index: (parent_id), (slug), (path).
DOC-B.06  Bang `products`: tat ca cot (id, name, slug, description, category_id FK,
          supplier_id FK, price, original_price, stock, unit, min_order_qty,
          images JSON, specifications JSON, tags JSON, status, is_active,
          brand_name, origin, weight, dimensions, warranty_months, view_count,
          sold_count, featured, created_at, updated_at). ~25 cot.
DOC-B.07  Bang `product_variants`: tat ca cot (id, product_id FK, name, sku UNIQUE,
          price, stock, barcode, weight, dimensions, images JSON, is_active,
          cost_price, created_at, updated_at).
DOC-B.08  Bang `product_images`: (id, product_id FK, url, alt_text, sort_order,
          is_primary, created_at).
          Bang `product_tags`: (id, product_id FK, tag).
          Bang `product_specifications`: (id, product_id FK, key, value, sort_order).
DOC-B.09  Bang `suppliers`: tat ca cot (id, company_name, contact_person, email,
          phone, address, city, country, logo_url, cover_url, description,
          rating, review_count, product_count, min_order_value, avg_delivery_days,
          on_time_rate, category_ids JSON, is_verified, joined_date,
          employees, production_capacity, website, years_experience,
          registration_number, tax_id, bank_name, bank_account, representative,
          created_at, updated_at). ~30 cot.
DOC-B.10  Bang `supplier_categories`: (id, supplier_id FK, category_id FK).
          UNIQUE (supplier_id, category_id).
          Bang `staff_members`: tat ca cot.
          Bang `business_certificates`: tat ca cot.
          Bang `supplier_scorecards`: tat ca cot.
```

### DOC-B Dot 5: Schema — Don hang, Gio hang, RFQ, Bao gia (10 buoc)
# => Tao file: /docs/05-database-schema-part2.md

```
DOC-B.11  Bang `orders`: tat ca ~35 cot (id, order_number, buyer_id FK, supplier_id FK,
          buyer_name, buyer_company, items JSON, total_amount, status, shipping_address JSON,
          payment_method, notes, order_type, rfq_id FK, contract_id FK, template_id FK,
          discount_amount, promotion_code, promotion_id FK, cancel_reason, cancelled_at,
          cancelled_by, expected_delivery_date, actual_delivery_date, buyer_company_name,
          is_urgent, created_at, updated_at).
DOC-B.12  Bang `order_items`: (id, order_id FK, product_id FK, variant_id FK,
          product_name, quantity, unit_price, total_price, sku, unit, discount, note).
DOC-B.13  Bang `order_status_history`: (id, order_id FK, from_status, to_status,
          changed_by FK, changed_by_name, note, created_at).
DOC-B.14  Bang `order_templates` + `order_template_items`:
          templates: (id, user_id FK, name, items JSON, supplier_id FK, is_default, category).
          template_items: (id, template_id FK, product_id FK, product_name, quantity, unit_price, unit).
DOC-B.15  Bang `cart_items`: (id, user_id FK, product_id FK, variant_id FK,
          quantity, added_at, saved_for_later, note, supplier_id FK).
          Bang `wishlist_folders` + `wishlist_items`.
DOC-B.16  Bang `rfqs`: tat ca cot (id, rfq_number, buyer_id FK, title, description,
          category_id FK, items JSON, deadline, status, attachments JSON,
          target_suppliers JSON, priority, response_count, created_at, updated_at).
DOC-B.17  Bang `rfq_items`: (id, rfq_id FK, product_name, quantity, unit,
          specifications, category_id FK, sample_required).
          Bang `rfq_attachments`: (id, rfq_id FK, file_name, file_url,
          file_size, file_type, uploaded_by FK, created_at).
DOC-B.18  Bang `quotations`: tat ca cot (id, rfq_id FK, rfq_number, supplier_id FK,
          supplier_name, items JSON, total_amount, valid_until, payment_terms,
          delivery_days, notes, status, warranty, attachments JSON,
          expires_at, created_at).
          Bang `quotation_items`: (id, quotation_id FK, product_id FK,
          product_name, quantity, unit_price, total_price, unit, discount).
DOC-B.19  Bang `contracts`: tat ca ~30 cot.
          Bang `contract_items`: tat ca cot.
          Bang `contract_milestones`: tat ca cot.
          Bang `contract_history`: tat ca cot.
DOC-B.20  Viet phan "Relationships" cho cac bang tren:
          ERD don gian (ASCII/Mermaid) cho: User → Order → OrderItem → Product.
          RFQ → QuotationItems → Contract flow.
```

### DOC-B Dot 6: Schema — Kho, Van chuyen, Thanh toan, Hoa don (10 buoc)
# => Tao file: /docs/06-database-schema-part3.md

```
DOC-B.21  Bang `warehouses`: tat ca cot.
          Bang `inventory_items`: tat ca cot (batch_number, expiry_date, location).
DOC-B.22  Bang `stock_movements`: tat ca cot.
          Bang `stock_alerts`: tat ca cot (acknowledged_by, acknowledged_at, resolved_at).
DOC-B.23  Bang `warehouse_transfers` + `warehouse_transfer_items`: tat ca cot.
DOC-B.24  Bang `shipments`: tat ca cot.
          Bang `shipment_events`: tat ca cot (them id, source).
          Bang `shipping_rates`: tat ca cot (them id, is_active).
DOC-B.25  Bang `payments`: tat ca cot (currency, late_fee, is_overdue).
          Bang `payment_transactions`: tat ca cot (status, gateway_ref).
DOC-B.26  Bang `invoices`: tat ca cot (~25 cot).
          Bang `invoice_items`: tat ca cot.
DOC-B.27  Bang `credit_limits`: tat ca cot.
          Bang `credit_transactions`: tat ca cot.
DOC-B.28  Bang `debit_credit_notes`: tat ca cot. Luu y: seller_id = supplier_id trong context nay.
          Bang `debit_credit_items`: tat ca cot.
DOC-B.29  Viet phan "Relationships" cho domain tai chinh:
          Order → Payment → PaymentTransaction.
          Invoice → InvoiceItem. Payment ↔ Invoice link.
          CreditLimit ↔ CreditTransaction. DebitCreditNote ↔ Invoice.
DOC-B.30  Viet phan "Indexes & Performance Notes" cho domain kho + tai chinh:
          Index strategy, composite indexes, partial indexes.
```

### DOC-B Dot 7: Schema — Tra hang, Danh gia, KM, Phe duyet, va con lai (10 buoc)
# => Tao file: /docs/07-database-schema-part4.md

```
DOC-B.31  Bang `return_requests` + `return_items` + `return_images`: tat ca cot.
DOC-B.32  Bang `product_reviews` + `review_images` + `review_tags`: tat ca cot.
          Bang `supplier_reviews` + `supplier_review_tags`: tat ca cot.
DOC-B.33  Bang `promotions` + `promotion_products` + `promotion_categories`: tat ca cot.
          Bang `volume_discounts`: tat ca cot.
DOC-B.34  Bang `approval_requests` + `approval_rules` + `approval_steps`: tat ca cot.
DOC-B.35  Bang `purchase_requisitions` + `pr_items`: tat ca cot.
          Bang `goods_received_notes` + `grn_items` + `grn_images`: tat ca cot.
DOC-B.36  Bang `budget_plans` + `budget_allocations` + `budget_transactions`: tat ca cot.
DOC-B.37  Bang `reverse_auctions` + `auction_items` + `auction_invited_suppliers`
          + `auction_bids` + `auction_bid_items`: tat ca cot.
DOC-B.38  Bang `price_agreements` + `price_agreement_items` + `agreement_orders`: tat ca cot.
          Bang `sla_definitions` + `sla_metrics` + `sla_reports` + `sla_report_metrics`: tat ca cot.
          Bang `warranties` + `warranty_claims` + `warranty_claim_images`: tat ca cot.
DOC-B.39  Bang `loyalty_programs` + `loyalty_transactions` + `loyalty_rewards`: tat ca cot.
          Bang `documents` + `document_tags`: tat ca cot.
          Bang `integrations` + `webhook_endpoints` + `api_keys`: tat ca cot.
          Bang `webhook_logs` + `api_key_usage`: tat ca cot.
DOC-B.40  Bang `report_definitions` + `report_columns` + `report_filters`: tat ca cot.
          Bang `notifications`: tat ca cot.
          Bang `activity_logs`: tat ca cot.
          Bang he thong: `system_configs`, `platform_fees`, `email_templates`,
          `banner_configs`, `tax_configs`, `seo_configs`, `maintenance_configs`: tat ca cot.
          Buyer: `buyer_companies`, `buyer_team_members`: tat ca cot.
          Payment reminder: `payment_reminders`: tat ca cot.
```


# ===========================================================
# DOC-C: ENTITY RELATIONSHIP DIAGRAM (10 buoc | Dot 8)
# ===========================================================

### DOC-C Dot 8: ERD toan he thong (10 buoc)
# => Tao file: /docs/08-erd.md

```
DOC-C.01  Ve ERD domain "Nguoi dung": users ↔ shipping_addresses,
          users ↔ notification_preferences, users ↔ buyer_companies ↔ buyer_team_members.
DOC-C.02  Ve ERD domain "San pham": categories (self-ref) → products → product_variants,
          products → product_images, product_tags, product_specifications.
          suppliers → products. supplier_categories (N-N).
DOC-C.03  Ve ERD domain "Don hang": users → orders → order_items → products.
          orders → order_status_history. orders → order_templates.
DOC-C.04  Ve ERD domain "Mua sam": rfqs → rfq_items, rfq_attachments.
          rfqs → quotations → quotation_items.
          quotations → contracts → contract_items, contract_milestones, contract_history.
DOC-C.05  Ve ERD domain "Kho hang": suppliers → warehouses → inventory_items → products.
          stock_movements. stock_alerts. warehouse_transfers → transfer_items.
DOC-C.06  Ve ERD domain "Van chuyen": orders → shipments → shipment_events.
          shipping_rates.
DOC-C.07  Ve ERD domain "Tai chinh": orders → payments → payment_transactions.
          orders → invoices → invoice_items.
          credit_limits → credit_transactions.
          debit_credit_notes → debit_credit_items.
DOC-C.08  Ve ERD domain "Phe duyet & Mua hang noi bo":
          purchase_requisitions → pr_items → approval_requests → approval_steps.
          goods_received_notes → grn_items.
          budget_plans → budget_allocations, budget_transactions.
DOC-C.09  Ve ERD domain "Nang cao": reverse_auctions → auction_bids → auction_bid_items.
          price_agreements → price_agreement_items, agreement_orders.
          sla_definitions → sla_metrics, sla_reports. warranties → warranty_claims.
DOC-C.10  Ve ERD TONG THE: 1 diagram lon (Mermaid) the hien tat ca FK relationships
          giua 109 bang. Nhom theo domain, highlight FK lines.
          (Co the chia thanh 2 diagram neu qua lon.)
```


# ===========================================================
# DOC-D: API SPECIFICATION (50 buoc | Dot 9–13)
# ===========================================================

### DOC-D Dot 9: API — Auth, User, Product, Category (10 buoc)
# => Tao file: /docs/09-api-spec-part1.md

```
DOC-D.01  Viet header: API conventions (RESTful, JSON, pagination params,
          sort params, filter params, error response format, HTTP status codes).
          Base URL: /api/v1. Auth: Bearer token (JWT).
DOC-D.02  authApi: POST /auth/login (req: {email, password}, res: AuthUser).
          POST /auth/register (req: RegisterData, res: AuthUser).
          POST /auth/logout. GET /auth/me.
DOC-D.03  userApi: GET /users (paginated, admin only).
          GET /users/:id. PUT /users/:id. DELETE /users/:id.
          PATCH /users/:id/status. GET /users/:id/addresses.
DOC-D.04  shippingAddressApi: GET /addresses?userId=. POST /addresses.
          PUT /addresses/:id. DELETE /addresses/:id. PATCH /addresses/:id/default.
DOC-D.05  categoryApi: GET /categories (tree). GET /categories/:id.
          POST /categories. PUT /categories/:id. DELETE /categories/:id.
          PATCH /categories/reorder (sortOrder).
DOC-D.06  productApi: GET /products (paginated + filter + sort + search).
          GET /products/:id. POST /products. PUT /products/:id. DELETE /products/:id.
          PATCH /products/:id/status. GET /products/:id/images.
          GET /products/:id/variants.
DOC-D.07  productImageApi: GET /products/:id/images. POST /products/:id/images.
          PUT /product-images/:id. DELETE /product-images/:id.
          PATCH /product-images/reorder.
DOC-D.08  productVariantApi: (embedded in productApi currently).
          GET /products/:id/variants. POST /products/:id/variants.
          PUT /product-variants/:id. DELETE /product-variants/:id.
DOC-D.09  supplierApi: GET /suppliers (paginated). GET /suppliers/:id.
          POST /suppliers. PUT /suppliers/:id. PATCH /suppliers/:id/verify.
          GET /suppliers/:id/categories. GET /suppliers/:id/scorecards.
DOC-D.10  supplierCategoryApi: POST /suppliers/:id/categories.
          DELETE /suppliers/:id/categories/:categoryId.
          staffApi: CRUD for /suppliers/:id/staff.
          certificateApi: CRUD + approve/reject.
```

### DOC-D Dot 10: API — Order, Cart, RFQ, Quotation, Contract (10 buoc)
# => Tao file: /docs/10-api-spec-part2.md

```
DOC-D.11  orderApi: GET /orders (paginated + filter + sort). GET /orders/:id.
          POST /orders. PUT /orders/:id. PATCH /orders/:id/status.
          PATCH /orders/:id/cancel. GET /orders/:id/status-history.
          POST /orders/:id/status-history (add note).
DOC-D.12  orderApi (buyer-specific): GET /orders?buyerId= (implicit from auth).
          GET /orders/dashboard-stats. POST /orders/from-template.
DOC-D.13  cartApi: GET /cart. POST /cart/items. PUT /cart/items/:id.
          DELETE /cart/items/:id. PATCH /cart/items/:id/save-for-later.
          DELETE /cart/clear. GET /cart/count.
DOC-D.14  wishlistApi: GET /wishlist/folders. POST /wishlist/folders.
          POST /wishlist/items. DELETE /wishlist/items/:id.
          PATCH /wishlist/items/:id/move (folderId).
DOC-D.15  orderTemplateApi: CRUD + createFromOrder + duplicate.
DOC-D.16  rfqApi: GET /rfqs (paginated). GET /rfqs/:id.
          POST /rfqs. PUT /rfqs/:id. PATCH /rfqs/:id/submit.
          POST /rfqs/:id/items. DELETE /rfqs/:id/items/:itemId.
DOC-D.17  rfqAttachmentApi: GET /rfqs/:id/attachments.
          POST /rfqs/:id/attachments. DELETE /rfq-attachments/:id.
DOC-D.18  quotationApi: GET /quotations?rfqId=. GET /quotations/:id.
          POST /quotations. PATCH /quotations/:id/submit.
          PATCH /quotations/:id/accept. PATCH /quotations/:id/reject.
          GET /quotations/compare?rfqId=.
DOC-D.19  contractApi: GET /contracts (paginated). GET /contracts/:id.
          POST /contracts. PATCH /contracts/:id/status.
          POST /contracts/:id/milestones. PATCH /milestones/:id/complete.
          POST /contracts/:id/sign. POST /contracts/:id/renew.
          GET /contracts/:id/history.
DOC-D.20  Mo ta Request/Response JSON examples cho moi nhom API tren
          (1-2 example moi endpoint).
```

### DOC-D Dot 11: API — Kho, Van chuyen, Thanh toan, Hoa don (10 buoc)
# => Tao file: /docs/11-api-spec-part3.md

```
DOC-D.21  warehouseApi: CRUD warehouses. GET /warehouses/:id/inventory.
DOC-D.22  inventoryApi: GET /inventory (paginated + filter).
          PATCH /inventory/:id/adjust. GET /inventory/summary.
DOC-D.23  stockMovementApi: GET /stock-movements (paginated). POST /stock-movements.
          stockAlertApi: GET /alerts. PATCH /alerts/:id/acknowledge. PATCH /alerts/:id/resolve.
DOC-D.24  warehouseTransferApi: CRUD + approve + ship + receive.
          GET /transfers/:id/items. POST /transfers/:id/items.
DOC-D.25  shipmentApi: GET /shipments (paginated). GET /shipments/:id.
          POST /shipments. PATCH /shipments/:id/status.
          GET /shipments/:id/events. GET /shipments/by-order/:orderId.
DOC-D.26  shippingRateApi: GET /shipping-rates. POST /shipping-rates.
          PUT /shipping-rates/:id. POST /shipping-rates/calculate.
DOC-D.27  paymentApi: GET /payments (paginated). GET /payments/:id.
          POST /payments. POST /payments/:id/transactions.
          POST /payments/:id/reminder. GET /payments/:id/late-fee.
DOC-D.28  invoiceApi: GET /invoices (paginated). GET /invoices/:id.
          POST /invoices. PUT /invoices/:id.
          POST /invoices/:id/send. POST /invoices/bulk-reminder.
          GET /invoices/overdue.
DOC-D.29  creditApi: GET /credit-limits. POST /credit-limits.
          PATCH /credit-limits/:id/adjust. GET /credit-limits/:id/transactions.
DOC-D.30  debitCreditApi: GET /debit-credit-notes (paginated). GET /debit-credit-notes/:id.
          POST /debit-credit-notes. PATCH /debit-credit-notes/:id/confirm-seller.
          PATCH /debit-credit-notes/:id/confirm-buyer.
```

### DOC-D Dot 12: API — Tra hang, Review, KM, Phe duyet, PR, GRN, Budget (10 buoc)
# => Tao file: /docs/12-api-spec-part4.md

```
DOC-D.31  returnApi: CRUD + accept + reject + refund + inspect + uploadImage.
          GET /returns/by-order/:orderId. GET /returns/stats.
DOC-D.32  reviewApi: CRUD + addSellerReply + toggleHelpful + reportReview.
          GET /reviews/by-product/:productId. GET /reviews/by-buyer/:buyerId.
DOC-D.33  supplierReviewApi: CRUD + addSellerReply.
          GET /supplier-reviews/by-supplier/:supplierId.
DOC-D.34  promotionApi: CRUD + validate (code + cartItems) + getActiveForProduct.
          volumeDiscountApi: CRUD by product.
DOC-D.35  approvalApi: CRUD + approve + reject + escalate + getHistory.
          GET /approvals/by-approver/:userId. GET /approvals/pending.
DOC-D.36  prApi: CRUD + submit + approve + reject + linkToOrder.
          POST /prs/:id/items. DELETE /prs/:id/items/:itemId.
DOC-D.37  grnApi: CRUD + confirm + reportIssue + linkToReturn + uploadImage.
DOC-D.38  budgetApi: CRUD budget plans. CRUD allocations. CRUD transactions.
          POST /budgets/:allocationId/check (amount).
DOC-D.39  auctionApi: CRUD + bid + selectWinner + extend + inviteSupplier + withdrawBid.
          priceAgreementApi: CRUD + approve + expire + renew + getLinkedOrders + checkPrice.
DOC-D.40  slaApi: CRUD + generateReport.
          warrantyApi: CRUD + submitClaim + resolveClaim.
```

### DOC-D Dot 13: API — System, Loyalty, Docs, Integration, Report, Notification (10 buoc)
# => Tao file: /docs/13-api-spec-part5.md

```
DOC-D.41  loyaltyApi: CRUD programs. earnPoints. redeemReward.
          GET /loyalty/:programId/transactions. GET /loyalty/tiers.
DOC-D.42  documentApi: CRUD + upload + download + search.
          GET /documents/by-entity/:entityType/:entityId.
          POST /documents/:id/tags.
DOC-D.43  integrationApi: CRUD + connect + disconnect + sync + testConnection.
          webhookApi: CRUD + test + getLogs.
          apiKeyApi: CRUD + rotate + getUsage.
DOC-D.44  reportBuilderApi: CRUD report definitions. POST /reports/:id/run.
          POST /reports/:id/schedule. POST /reports/:id/export.
DOC-D.45  notificationApi: GET /notifications (paginated). PATCH /notifications/:id/read.
          PATCH /notifications/mark-all-read. GET /notifications/unread-count.
          GET /notifications/by-entity/:entityType/:entityId.
DOC-D.46  activityLogApi: GET /activity-logs (paginated + filter).
          GET /activity-logs/by-user/:userId. GET /activity-logs/:id/changes.
DOC-D.47  adminApi / systemSettingsApi: GET/PUT system-configs, tax-configs,
          seo-configs, maintenance-configs. CRUD platform-fees.
          CRUD email-templates. CRUD banner-configs.
DOC-D.48  buyerDashboardApi: GET /buyer/dashboard/stats.
          sellerDashboardApi: GET /seller/dashboard/stats.
          adminDashboardApi: GET /admin/dashboard/stats.
DOC-D.49  analyticsApi: GET /analytics/buyer (filters). GET /analytics/seller.
          sellerReportApi: revenue, product, customer reports.
DOC-D.50  Viet phan "API Error Codes": danh sach ma loi chung
          (400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found,
          409 Conflict, 422 Validation Error, 500 Internal Server Error).
          Error response schema: { code, message, details? }.
```


# ===========================================================
# DOC-E: BUSINESS RULES & DOMAIN LOGIC (40 buoc | Dot 14–17)
# ===========================================================

### DOC-E Dot 14: Business Rules — Core Commerce (10 buoc)
# => Tao file: /docs/14-business-rules-part1.md

```
DOC-E.01  Viet quy tac domain "Don hang" (Order):
          - Trang thai hop le: transitions (VD: "Cho xac nhan" → "Da xac nhan" | "Da huy")
          - State machine diagram cho OrderStatus (7 trang thai, ~12 transitions)
          - Khi nao tao tu dong (tu Cart, tu Template, tu PR, tu Contract)
DOC-E.02  Viet quy tac "Gia & Giam gia":
          - Thu tu ap dung: VolumeDiscount → Promotion → PriceAgreement
          - Chi 1 ma KM / don hang
          - maxDiscount cap tren
          - Gia agreement override gia niem yet
DOC-E.03  Viet quy tac "Gio hang":
          - 1 user 1 gio hang (ko chia theo supplier)
          - Quantity validation: >= minOrderQty, <= stock
          - savedForLater: tach khoi dong checkout
DOC-E.04  Viet quy tac "Thanh toan" (Payment):
          - State machine: PaymentStatus transitions
          - Partial payment cho phep
          - Late fee: tinh sau N ngay quá han (configurable)
          - Link: 1 Order → 1 Payment → N PaymentTransactions
DOC-E.05  Viet quy tac "Hoa don" (Invoice):
          - Type: Ban hang, Tra hang, Dieu chinh
          - Auto generate tu Order (khi ship) hoac manual
          - Overdue tracking: reminderCount, lastReminderAt
          - Link: Invoice ↔ Payment ↔ Order
DOC-E.06  Viet quy tac "Tra hang" (Return):
          - Window: 7 ngay (configurable)
          - State machine: ReturnStatus transitions
          - Inspect flow: nhan hang → kiem tra → chap nhan/tu choi → hoan tien
          - Link: Return → DebitCreditNote → Invoice dieu chinh
DOC-E.07  Viet quy tac "Cong no" (Credit):
          - CreditLimit: set per buyer-seller pair
          - Auto check: khi tao don hang, check creditLimit.available >= orderAmount
          - CreditTransaction: tang khi dat hang, giam khi thanh toan
DOC-E.08  Viet quy tac "Ghi no / Ghi co" (Debit/Credit Note):
          - Tao tu: tra hang, dieu chinh gia, thieu hang
          - Confirm 2 ben (buyer + seller)
          - Link to Invoice dieu chinh
DOC-E.09  Viet quy tac "Van chuyen" (Shipment):
          - State machine: ShipmentStatus transitions
          - 1 Order → N Shipments (giao nhieu dot)
          - Events/tracking: append-only log
          - ShippingRate: tinh theo weight × carrier × region
DOC-E.10  Viet quy tac "Kho hang" (Inventory):
          - StockMovement: Nhap/Xuat/Chuyen/Dieu chinh
          - Auto create StockAlert khi stock < minStock
          - WarehouseTransfer: require approve → ship → receive
          - Batch tracking: batchNumber + expiryDate
```

### DOC-E Dot 15: Business Rules — Sourcing & Procurement (10 buoc)
# => Tao file: /docs/15-business-rules-part2.md

```
DOC-E.11  Viet quy tac "RFQ" (Request for Quotation):
          - State machine: RFQStatus transitions (7 trang thai)
          - Buyer tao → NCC gui bao gia → Buyer so sanh → Chon → Tao hop dong
          - deadline: het han thi status = "Het han"
          - priority: Thuong/Gap/Rat gap — anh huong sort order
DOC-E.12  Viet quy tac "Bao gia" (Quotation):
          - State machine: QuotationStatus transitions
          - 1 RFQ → N Quotations (tu nhieu NCC)
          - So sanh: compareQuotations → bang gia theo SP
          - Accept 1 → tao Contract; reject con lai
DOC-E.13  Viet quy tac "Hop dong" (Contract):
          - State machine: ContractStatus transitions (7 trang thai)
          - Ky: buyer ky + seller ky → "Dang thuc hien"
          - Milestones: tracking giao hang + thanh toan
          - contractType: Mua ban (1 lan), Khung (dai han), Dich vu
          - autoRenew: khi endDate - 30 ngay → nhac gia han
DOC-E.14  Viet quy tac "Phe duyet noi bo" (Approval):
          - Rule engine: ApprovalRule {type, threshold, approverRole}
          - Auto create request khi Order/PR/Contract vuot threshold
          - Multi-level: NV → QL → GD (ApprovalStep)
          - Escalation: qua due → chuyen cap tren
DOC-E.15  Viet quy tac "Yeu cau mua hang" (PR):
          - State machine: PRStatus transitions
          - Flow: Tao PR → Phe duyet → Tao RFQ hoac Order
          - Link: PR → ApprovalRequest, PR → RFQ, PR → Order
          - Budget check: PR.totalAmount <= BudgetAllocation.remaining
DOC-E.16  Viet quy tac "Bien ban nhan hang" (GRN):
          - Flow: Order ship → GRN tao → Kiem tra SL/CL → Xac nhan/Bao loi
          - Discrepancy: receivedQty != orderedQty → tao Return hoac DebitCreditNote
          - Link: GRN → Order, GRN → WarehouseMovement (nhap kho)
DOC-E.17  Viet quy tac "Ngan sach" (Budget):
          - BudgetPlan: nam/quy. BudgetAllocation: theo phong ban/danh muc
          - Check: truoc khi tao PR/Order, check budget remaining
          - Alert: khi used > 80% allocation → canh bao
          - BudgetTransaction: link to PR, Invoice, Order
DOC-E.18  Viet quy tac "Dau gia nguoc" (Reverse Auction):
          - Flow: Buyer tao phien → Moi NCC → NCC dau gia → Het gio → Chon nguoi thang
          - Rules: minBidDecrement, depositAmount, auto-extend khi co bid cuoi phut
          - Bid withdraw: cho phep truoc deadline
          - Winner → tao Order hoac Contract
DOC-E.19  Viet quy tac "Thoa thuan gia" (Price Agreement):
          - Long-term pricing: buyer-seller pair, per product, time-bound
          - Auto apply: khi buyer order SP co active agreement → dung gia agreement
          - Usage tracking: currentUsedQty / maxQty
          - Renew: manual hoac autoRenew
DOC-E.20  Viet quy tac "SLA & Bao hanh":
          - SLA: target metrics (on-time delivery, defect rate, response time)
          - SLA Report: tinh diem theo ky, so voi target
          - Warranty: per product, serialNumber, startDate + months
          - WarrantyClaim: flow Submit → Review → Approve/Reject → Resolve
```

### DOC-E Dot 16: Business Rules — Platform & System (10 buoc)
# => Tao file: /docs/16-business-rules-part3.md

```
DOC-E.21  Viet quy tac "Khuyen mai" (Promotion):
          - Types: Phan tram, So tien, Mua X tang Y, Giam theo SL
          - Validation: code unique, usedCount < usageLimit, date range
          - Scope: all | specificProducts | specificCategories
          - Stacking: KHONG cho phep nhieu ma cung luc
DOC-E.22  Viet quy tac "Danh gia" (Review):
          - Chi review sau khi Order = "Hoan thanh"
          - 1 review / order item
          - Seller reply: 1 reply / review
          - Moderation: Admin duyet truoc khi hien thi (optional)
DOC-E.23  Viet quy tac "Khach hang than thiet" (Loyalty):
          - Tiers: Dong, Bac, Vang, Kim Cuong
          - Points: earn per order (% of amount), redeem for rewards
          - Transaction: earn, redeem, bonus, manual adjust, expire
          - Expiry: points het han sau 12 thang
DOC-E.24  Viet quy tac "Tai lieu" (Document):
          - Access levels: Cong khai, Noi bo, Mat
          - Entity link: document ↔ any entity (contract, order, product, ...)
          - Version control: basic (upload new → archive old)
DOC-E.25  Viet quy tac "Tich hop" (Integration):
          - Status: Connected, Disconnected, Error
          - Webhook: retry on failure (max 3), log all events
          - API Key: rate limit, IP whitelist, environment (prod/sandbox)
DOC-E.26  Viet quy tac "Thong bao" (Notification):
          - Channels: inApp (default), email, push, sms
          - Auto triggers: order status change, RFQ response, payment due, etc.
          - Preferences: user chon on/off theo channel × event type
DOC-E.27  Viet quy tac "Nhat ky" (Activity Log):
          - Auto log: moi thao tac CRUD
          - Fields: user, action, entityType, entityId, changes diff
          - Retention: giu 90 ngay (configurable)
DOC-E.28  Viet quy tac "Bao cao" (Report Builder):
          - Custom: chon entity, columns, filters, group by
          - Schedule: manual, daily, weekly, monthly
          - Export: CSV, Excel, PDF
DOC-E.29  Viet quy tac "Phi san" (Platform Fee):
          - Types: transaction fee (%), subscription fee (monthly), listing fee
          - Apply: per order, per product listing
          - Admin configurable
DOC-E.30  Viet quy tac "Cau hinh he thong":
          - SystemConfig: site name, logo, colors, contact info
          - TaxConfig: thue suat, thong tin xuat HD
          - SEOConfig: meta tags, sitemap
          - MaintenanceConfig: bat/tat bao tri, thong bao
          - BannerConfig: target page, target role, schedule
          - EmailTemplate: Mustache-style variables, preview
```

### DOC-E Dot 17: State Machines & Workflow Diagrams (10 buoc)
# => Tao file: /docs/17-state-machines.md

```
DOC-E.31  Ve state machine "OrderStatus" (Mermaid stateDiagram):
          Cho xac nhan → Da xac nhan → Dang xu ly → Dang giao → Da giao → Hoan thanh.
          Transitions: huy, tra hang.
DOC-E.32  Ve state machine "RFQStatus":
          Ban nhap → Da gui → Dang nhan bao gia → Da chon NCC → Hoan thanh / Het han / Da huy.
DOC-E.33  Ve state machine "QuotationStatus":
          Ban nhap → Da gui → Cho phan hoi → Chap nhan → Tu choi.
DOC-E.34  Ve state machine "ContractStatus":
          Ban nhap → Cho ky → Dang thuc hien → Hoan thanh / Da huy / Het han / Tranh chap.
DOC-E.35  Ve state machine "PaymentStatus":
          Cho thanh toan → Thanh toan 1 phan → Da thanh toan / Qua han / Hoan tien.
DOC-E.36  Ve state machine "InvoiceStatus":
          Ban nhap → Da gui → Da thanh toan / Qua han / Da huy.
DOC-E.37  Ve state machine "ShipmentStatus":
          Cho lay hang → Da lay → Dang van chuyen → Da giao / That bai / Tra ve.
DOC-E.38  Ve state machine "ReturnStatus":
          Cho xu ly → Da nhan → Dang kiem tra → Chap nhan / Tu choi → Da hoan tien.
DOC-E.39  Ve state machine "ApprovalStatus":
          Cho duyet → Da duyet / Tu choi / Da huy.
          + PRStatus, GRNStatus, AuctionStatus.
DOC-E.40  Ve workflow tong hop "Procurement Lifecycle" (Mermaid flowchart):
          PR → Approval → RFQ → Quotation → Contract → Order → GRN → Invoice → Payment.
          Ghi chu: cac buoc optional, shortcut paths.
```


# ===========================================================
# DOC-F: USER ROLES & PERMISSIONS (20 buoc | Dot 18–19)
# ===========================================================

### DOC-F Dot 18: Role Definitions & Access Matrix (10 buoc)
# => Tao file: /docs/18-roles-permissions.md

```
DOC-F.01  Viet phan "1. He thong vai tro": 3 vai tro chinh
          (Nguoi mua / Nha cung cap / Quan tri vien).
          Buyer sub-roles: Owner, Manager, Staff (BuyerTeamMember).
          Seller sub-roles: Chu DN, Quan ly, NV ban hang, Thu kho, Ke toan (StaffRole).
DOC-F.02  Viet "2. Buyer Access Matrix": bang (Feature × Action × Allowed).
          VD: Don hang (Xem/Tao/Sua/Huy), RFQ (Xem/Tao/Sua/Gui), ...
          40+ features, 4 actions moi feature.
DOC-F.03  Viet "3. Seller Access Matrix": bang phan quyen theo StaffRole.
          Ma tran: 5 roles × 35+ features × 4 actions.
          VD: Thu kho chi xem/sua Kho, ko thay Tai chinh.
DOC-F.04  Viet "4. Admin Access Matrix": full access, nhung phan biet
          Super Admin vs Standard Admin (future).
DOC-F.05  Viet "5. Permission Keys": danh sach 50+ permission keys
          VD: 'product.view', 'product.create', 'order.approve', ...
          Group theo domain.
DOC-F.06  Viet "6. Route Guards": mapping route → required role.
          / → public. /dashboard → Buyer. /seller/* → Seller. /admin/* → Admin.
DOC-F.07  Viet "7. Data Isolation Rules":
          Buyer chi thay don hang cua minh (buyerId filter).
          Seller chi thay don hang gui cho minh (supplierId filter).
          Admin thay tat ca.
DOC-F.08  Viet "8. Cross-role Interactions":
          Buyer ↔ Seller: RFQ, Quotation, Contract, Chat, Review.
          Seller ↔ Admin: Product Approval, Certificate Review.
          Buyer ↔ Admin: Dispute resolution (future).
DOC-F.09  Viet "9. Approval Authority Matrix":
          Amount thresholds → required approver level.
          VD: < 10M: NV, 10-50M: QL, 50-200M: GD, > 200M: Chu DN.
DOC-F.10  Viet "10. Audit Trail Requirements":
          Moi thay doi sensitive data → ghi activity_log.
          Liet ke 20+ events can log.
```

### DOC-F Dot 19: Permission Implementation Guide (10 buoc)
# => Tao file: /docs/19-permission-implementation.md

```
DOC-F.11  Viet "1. AuthContext Structure": current user shape (AuthUser),
          login/logout flow, token storage (localStorage).
DOC-F.12  Viet "2. Guard Components": BuyerGuard, SellerGuard, AdminGuard.
          Logic: check user.role → redirect if mismatch.
DOC-F.13  Viet "3. Conditional UI Rendering":
          Pattern: {user.role === 'Admin' && <AdminButton />}.
          Dung cho action buttons, menu items, dashboard widgets.
DOC-F.14  Viet "4. API-level Authorization" (future Supabase):
          Row Level Security (RLS) policies.
          VD: orders visible to owner buyer OR assigned seller OR admin.
DOC-F.15  Viet "5. Seller Staff Permissions":
          Current: StaffMember.permissions: string[].
          Check: hasPermission(staff, 'inventory.edit').
          UI: SellerStaffList → edit permissions dialog.
DOC-F.16  Viet "6. Buyer Team Permissions":
          BuyerTeamMember: role (Owner/Manager/Viewer).
          Check: canApproveOrders, canManageTeam, canViewReports.
DOC-F.17  Viet "7. Navigation Filtering":
          BuyerLayout sidebar: hien tat ca menu cho buyer.
          SellerLayout sidebar: loc theo staff permissions.
          AdminLayout sidebar: full menu.
DOC-F.18  Viet "8. Migration to Supabase Auth":
          Map: AuthContext → Supabase Auth.
          Map: localStorage → Supabase session.
          Map: mockUsers → auth.users table.
DOC-F.19  Viet "9. Invited User Flow" (future):
          Seller invite staff via email → Register with invite token → Auto assign role.
          Buyer invite team member → Similar flow.
DOC-F.20  Viet "10. Security Considerations":
          XSS prevention (React auto-escape).
          CSRF (Supabase handles).
          Input validation (client + future server-side).
          Sensitive data: KHONG luu PII tren client.
```


# ===========================================================
# DOC-G: UI/UX SPECIFICATION (40 buoc | Dot 20–23)
# ===========================================================

### DOC-G Dot 20: Page Inventory & Navigation (10 buoc)
# => Tao file: /docs/20-ui-page-inventory.md

```
DOC-G.01  Viet "1. Buyer Pages" (~51 trang): liet ke TEN, ROUTE, MO TA NGAN,
          FILE .tsx, TRANG THAI (hoan thanh/chua).
          VD: | HomePage | / | Trang chu buyer | HomePage.tsx | Done |
DOC-G.02  Viet "2. Seller Pages" (~38 trang): tuong tu.
DOC-G.03  Viet "3. Admin Pages" (~19 trang): tuong tu.
DOC-G.04  Viet "4. Shared Pages" (~5 trang): NotificationCenter, DocumentCenter,
          ReportBuilder, IntegrationHub, NotFound.
DOC-G.05  Viet "5. Auth Pages" (2 trang): Login, Register.
DOC-G.06  Viet "6. Buyer Navigation Structure":
          Top nav: Logo, Search, Cart, Notifications, User menu.
          Sidebar/MegaMenu: phan nhom menu items.
DOC-G.07  Viet "7. Seller Navigation Structure":
          Sidebar: Dashboard, Don hang, San pham, RFQ, Hop dong, Kho, Van chuyen,
          Thanh toan, Hoa don, Bao cao, KM, Nhan su, Phe duyet, ...
DOC-G.08  Viet "8. Admin Navigation Structure":
          Sidebar: Dashboard, Users, Suppliers, Categories, Products, Orders,
          Shipments, Payments, Invoices, Reviews, RFQ, Contracts, Settings, Reports.
DOC-G.09  Viet "9. Responsive Breakpoints":
          Mobile: < 768px (1 col, bottom nav).
          Tablet: 768-1024px (2 col, collapsible sidebar).
          Desktop: > 1024px (sidebar + content).
DOC-G.10  Viet "10. Common Page Layouts":
          List page: FilterBar + ViewToggle + DataTable/Grid + Pagination.
          Detail page: Header + Tabs + Sections.
          Form page: FormDialog hoac full-page form.
          Dashboard: StatsCards + Charts + Recent lists.
```

### DOC-G Dot 21: Component Catalog — Shared (10 buoc)
# => Tao file: /docs/21-component-catalog-shared.md

```
DOC-G.11  DataTable: props, ColumnConfig interface, renderActions, pagination,
          sort, inline edit, column toggle, multi-select.
          Usage examples. Known limitations.
DOC-G.12  FilterBar: props, FilterConfig interface, ActiveFilter, date range,
          category combobox, status select.
DOC-G.13  FormDialog: props, FormField interface, validation, submit handler.
          Supported field types: text, number, select, textarea, date, combobox.
DOC-G.14  CategoryCombobox: props, search, multi-level tree, single vs multi select.
DOC-G.15  StatusBadge: props, variant mapping (status → color).
          ViewToggle: props (table/grid/kanban).
DOC-G.16  DashboardWidget + StatsCard + AnimatedNumber + TrendIndicator + ProgressRing:
          props, usage in dashboard pages.
DOC-G.17  ConfirmDialog: props, danger mode, custom messages.
          ImportDialog: props, file upload, preview, validate.
DOC-G.18  EmptyState + LoadingOverlay + PageSkeleton + ErrorBoundary:
          props, usage patterns.
DOC-G.19  NotificationDropdown + CommandPalette + SearchSuggestions + MobileBottomNav:
          props, keyboard shortcuts.
DOC-G.20  InlineAlert + AppBreadcrumb + AvatarGroup + ScrollToTop + OfflineIndicator
          + SkipLink + KeyboardShortcuts + PageTransition:
          props, accessibility considerations.
```

### DOC-G Dot 22: Component Catalog — UI Primitives (10 buoc)
# => Tao file: /docs/22-component-catalog-ui.md

```
DOC-G.21  Button: variants (default, destructive, outline, secondary, ghost, link),
          sizes (default, sm, lg, icon). forwardRef ✓.
DOC-G.22  Input: props, forwardRef ✓. Textarea: props.
          Label: props. Form (react-hook-form integration).
DOC-G.23  Dialog + Sheet + Drawer: khi nao dung cai nao.
          Dialog: form/confirm. Sheet: side panel. Drawer: mobile.
DOC-G.24  Select + Command (combobox) + Popover: pattern cho dropdown.
DOC-G.25  Table (UI primitive) vs DataTable (shared): phan biet.
          Table dung khi can custom layout. DataTable cho CRUD pages.
DOC-G.26  Tabs + Accordion + Collapsible: khi nao dung cai nao.
DOC-G.27  Card + Badge + Avatar + Separator + Progress + Slider: basic usage.
DOC-G.28  Calendar + DatePicker pattern (Popover + Calendar).
DOC-G.29  DropdownMenu + ContextMenu + Menubar + NavigationMenu:
          khi nao dung cai nao.
DOC-G.30  Alert + AlertDialog + Sonner (toast) + Tooltip + HoverCard:
          feedback/notification components.
```

### DOC-G Dot 23: Design Tokens & Theming (10 buoc)
# => Tao file: /docs/23-design-tokens.md

```
DOC-G.31  Liet ke tat ca CSS variables trong theme.css:
          Colors: background, foreground, card, popover, primary, secondary,
          muted, accent, destructive, border, input, ring.
DOC-G.32  Typography tokens: default font, heading styles, body styles.
          Ghi chu: ko dung text-2xl/font-bold/leading-none tru khi user yeu cau.
DOC-G.33  Spacing system: Tailwind default (p-1 = 4px, p-2 = 8px, ...).
          Container: container mx-auto px-4 py-6.
DOC-G.34  Border radius tokens: radius variable trong theme.css.
DOC-G.35  Shadow tokens: shadow-sm, shadow, shadow-md, shadow-lg.
DOC-G.36  Animation tokens: transition-all, duration-200.
          Motion library: import { motion } from 'motion/react'.
DOC-G.37  Dark mode: hsl color variables, dark: prefix.
          Current status: co support (CSS variables switch).
DOC-G.38  Responsive design tokens: sm/md/lg/xl breakpoints.
          Mobile-first approach.
DOC-G.39  Icon system: lucide-react. Naming convention. Size guidelines (16/20/24px).
DOC-G.40  Image guidelines: Unsplash for stock photos,
          ImageWithFallback component, figma:asset for imported images.
```


# ===========================================================
# DOC-H: USER FLOWS & USE CASES (30 buoc | Dot 24–26)
# ===========================================================

### DOC-H Dot 24: Buyer User Flows (10 buoc)
# => Tao file: /docs/24-user-flows-buyer.md

```
DOC-H.01  Flow "Dang ky & Dang nhap": Register form → verify email (future) →
          Login → redirect to Dashboard hoac HomePage.
DOC-H.02  Flow "Tim kiem & Duyet san pham": Search bar → ProductList (filter, sort) →
          ProductDetail → Add to Cart hoac RFQ.
DOC-H.03  Flow "Dat hang truc tiep": Cart → OrderConfirmation (chon dia chi, phuong thuc TT) →
          Place Order → OrderDetail (theo doi).
DOC-H.04  Flow "Dat hang nhanh & Dat hang so luong lon":
          QuickOrder (nhap SKU + qty) → Add to Cart.
          BulkOrder (upload CSV) → Review → Confirm.
DOC-H.05  Flow "Yeu cau bao gia (RFQ)": RFQ Create (chon SP, NCC, deadline) →
          Submit → Nhan bao gia → So sanh → Chon → Tao hop dong.
DOC-H.06  Flow "Quan ly hop dong": ContractList → ContractDetail →
          Ky hop dong → Theo doi milestones → Gia han.
DOC-H.07  Flow "Thanh toan & Hoa don": PaymentList → PaymentDetail →
          Thanh toan (toan phan/mot phan) → InvoiceList → InvoiceDetail → Download.
DOC-H.08  Flow "Tra hang & Bao hanh": OrderDetail → Tao yeu cau tra hang →
          Upload anh → Theo doi → Nhan hoan tien.
          WarrantyPage → Tao claim → Theo doi.
DOC-H.09  Flow "Mua hang noi bo (Procurement)":
          PR Create → Gui phe duyet → Duyet → Tao RFQ/Order →
          GRN (nhan hang) → Budget deduction.
DOC-H.10  Flow "Dau gia nguoc & Thoa thuan gia":
          AuctionList → AuctionDetail (tao/quan ly phien).
          PriceAgreement → Tao thoa thuan → Ap dung khi dat hang.
```

### DOC-H Dot 25: Seller User Flows (10 buoc)
# => Tao file: /docs/25-user-flows-seller.md

```
DOC-H.11  Flow "Quan ly san pham": ProductList → ProductForm (CRUD) →
          Them variants → Upload anh → Dang ban.
DOC-H.12  Flow "Xu ly don hang": OrderList (filter by status) → OrderDetail →
          Xac nhan → Dong goi → Tao shipment → Giao hang → Hoan thanh.
DOC-H.13  Flow "Phan hoi RFQ": RFQList → RFQDetail (xem yeu cau) →
          Gui bao gia (QuotationForm) → Cho phan hoi.
DOC-H.14  Flow "Quan ly hop dong": ContractList → ContractDetail →
          Ky → Theo doi milestones → Bao cao.
DOC-H.15  Flow "Quan ly kho": Warehouse tabs (Kho/Ton kho/Xuat nhap/Canh bao/Chuyen kho).
          Nhap hang (StockMovement) → Cap nhat ton kho → Canh bao thap.
DOC-H.16  Flow "Van chuyen": ShipmentList → Tao shipment → Cap nhat tracking events →
          Giao thanh cong / That bai.
DOC-H.17  Flow "Tai chinh": PaymentList → InvoiceList → CreditPage → DebitCreditPage.
          Tao hoa don → Gui cho buyer → Theo doi thanh toan.
DOC-H.18  Flow "Nhan su & Phe duyet":
          StaffList → Them/sua nhan vien → Gan quyen.
          ApprovalList → Duyet/tu choi → Rules config.
DOC-H.19  Flow "Khuyen mai & Gia":
          PromotionList → Tao KM → Dat code → Active/Inactive.
          PriceAgreement → Dong y thoa thuan.
DOC-H.20  Flow "Bao cao & Phan tich":
          Reports dashboard → Revenue/Product/Customer reports → Export.
          ReportBuilder → Tao bao cao tuy chinh.
```

### DOC-H Dot 26: Admin User Flows (10 buoc)
# => Tao file: /docs/26-user-flows-admin.md

```
DOC-H.21  Flow "Dashboard & Monitoring": AdminDashboard → Tong quan he thong →
          Alerts → Quick actions.
DOC-H.22  Flow "Quan ly nguoi dung": UserManagement → Xem/Sua/Khoá user →
          Thay doi role → Reset password (future).
DOC-H.23  Flow "Quan ly NCC": SupplierPage → Duyet NCC → Verify certificates →
          Scorecard review.
DOC-H.24  Flow "Quan ly danh muc & San pham":
          CategoryManagement → CRUD categories → Sort order.
          ProductApproval → Duyet/Tu choi SP moi.
DOC-H.25  Flow "Quan ly don hang & Hop dong":
          OrderOverview → Filter → Detail → Can thiep (huy, sua).
          ContractManagement → Review contracts → Approve.
DOC-H.26  Flow "Quan ly tai chinh":
          PaymentPage → Review payments → Manual adjust.
          InvoicePage → Overdue tracking → Reminders.
DOC-H.27  Flow "Quan ly danh gia & RFQ":
          ReviewManagement → Moderate → Approve/Remove.
          RFQManagement → Giam sat RFQ marketplace.
DOC-H.28  Flow "Cau hinh he thong":
          SystemSettings → General / Tax / SEO / Maintenance / Banner / Email / Fees.
DOC-H.29  Flow "Bao cao & Nhat ky":
          AdminReportPage → Platform reports → Export.
          ActivityLog → Filter → Xem chi tiet thay doi.
DOC-H.30  Flow "Shipments & Certificates":
          ShipmentPage → Giam sat van chuyen.
          CertificateReview → Duyet chung chi NCC.
```


# ===========================================================
# DOC-I: DATA DICTIONARY & GLOSSARY (10 buoc | Dot 27)
# ===========================================================

### DOC-I Dot 27: Tu dien du lieu & Thuat ngu (10 buoc)
# => Tao file: /docs/27-data-dictionary.md

```
DOC-I.01  Viet "1. Thuat ngu kinh doanh" (A-Z, 50+ entries):
          B2B, Buyer, Seller, RFQ, Quotation, Contract, PR, GRN, SLA, ...
          Moi entry: Term | Tieng Viet | Dinh nghia ngan.
DOC-I.02  Viet "2. Thuat ngu ky thuat" (30+ entries):
          CRUD, Pagination, Sort, Filter, Mock data, Service layer, Guard, ...
DOC-I.03  Viet "3. Vien tat" (30+ entries):
          RFQ, PR, GRN, SLA, KM (Khuyen mai), NCC (Nha cung cap),
          HD (Hoa don), DH (Don hang), ...
DOC-I.04  Viet "4. Trang thai he thong — Bang tham chieu":
          Liet ke TAT CA enum/union types trong types/index.ts.
          OrderStatus (7 values), RFQStatus (7), QuotationStatus (5),
          ContractStatus (7), PaymentStatus (5), InvoiceStatus (5),
          ShipmentStatus (6), ReturnStatus (5), ApprovalStatus (3), ...
DOC-I.05  Viet "5. Ma dinh danh (ID Prefixes)":
          user-xxx, prod-xxx, ord-xxx, rfq-xxx, quot-xxx, contract-xxx,
          inv-xxx, ship-xxx, pay-xxx, ret-xxx, ...
DOC-I.06  Viet "6. Don vi tien te & Dinh dang":
          VND, Intl.NumberFormat('vi-VN'), so tien luu dang number (khong format).
DOC-I.07  Viet "7. Don vi do luong":
          San pham: Cai, Cuon, Tan, Kg, Met, Hop, Thung, ...
          Trong luong: gram, kg, tan. Kich thuoc: mm, cm, m.
DOC-I.08  Viet "8. Ngay gio format":
          Luu tru: ISO 8601 (YYYY-MM-DDTHH:mm:ss hoac YYYY-MM-DD).
          Hien thi: dd/MM/yyyy HH:mm (tieng Viet).
DOC-I.09  Viet "9. File size & Upload limits":
          Max file: 10MB. Allowed types: pdf, doc, xlsx, jpg, png.
          Image: max 5MB, jpg/png/webp.
DOC-I.10  Viet "10. Mock Data Conventions":
          5+ items per entity (minimum). Realistic Vietnamese data.
          Cover tat ca status variants. Cross-reference FKs dung.
```


# ===========================================================
# DOC-J: MIGRATION & SUPABASE INTEGRATION GUIDE (20 buoc | Dot 28–29)
# ===========================================================

### DOC-J Dot 28: Supabase Schema Migration (10 buoc)
# => Tao file: /docs/28-supabase-migration.md

```
DOC-J.01  Viet "1. Migration Strategy Overview":
          Phase 1: Auth (users, sessions) → Phase 2: Core (products, orders) →
          Phase 3: Full (all 109 tables).
DOC-J.02  Viet "2. Supabase Auth Setup":
          Map mockUsers → auth.users. Custom fields trong profiles table.
          Email/password auth. OAuth providers (future).
DOC-J.03  Viet "3. SQL Migration: Phase 1 — User domain":
          CREATE TABLE users, shipping_addresses, notification_preferences,
          buyer_companies, buyer_team_members.
          Indexes, constraints, defaults.
DOC-J.04  Viet "4. SQL Migration: Phase 2 — Product domain":
          CREATE TABLE categories, products, product_variants,
          product_images, product_tags, product_specifications.
          suppliers, supplier_categories, staff_members, business_certificates.
DOC-J.05  Viet "5. SQL Migration: Phase 3 — Order domain":
          CREATE TABLE orders, order_items, order_status_history,
          order_templates, order_template_items, cart_items,
          wishlist_folders, wishlist_items.
DOC-J.06  Viet "6. SQL Migration: Phase 4 — Sourcing domain":
          rfqs, rfq_items, rfq_attachments, quotations, quotation_items,
          contracts, contract_items, contract_milestones, contract_history.
DOC-J.07  Viet "7. SQL Migration: Phase 5 — Warehouse & Shipping":
          warehouses, inventory_items, stock_movements, stock_alerts,
          warehouse_transfers, transfer_items.
          shipments, shipment_events, shipping_rates.
DOC-J.08  Viet "8. SQL Migration: Phase 6 — Finance":
          payments, payment_transactions, payment_reminders.
          invoices, invoice_items. credit_limits, credit_transactions.
          debit_credit_notes, debit_credit_items.
DOC-J.09  Viet "9. SQL Migration: Phase 7 — Remaining":
          return_requests, return_items, return_images.
          reviews, review_images, review_tags, supplier_reviews.
          promotions, volume_discounts. approval_*, pr_*, grn_*, budget_*.
          auction_*, price_agreement_*, sla_*, warranty_*, loyalty_*, document_*,
          integration_*, report_*, notification, activity_log, system configs.
DOC-J.10  Viet "10. Seed Data": SQL INSERT cho development environment.
          Map mockData.ts → SQL inserts. 50+ seed records.
```

### DOC-J Dot 29: Supabase Client Integration (10 buoc)
# => Tao file: /docs/29-supabase-client-guide.md

```
DOC-J.11  Viet "1. Supabase Client Setup":
          Install @supabase/supabase-js. createClient(url, anonKey).
          Environment variables: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY.
DOC-J.12  Viet "2. Service Layer Migration Pattern":
          Before: `const data = mockArray.filter(...)`.
          After: `const { data } = await supabase.from('table').select().eq('col', val)`.
          Template mau cho migration 1 service.
DOC-J.13  Viet "3. Auth Migration":
          AuthContext: supabase.auth.signInWithPassword().
          Session management: onAuthStateChange.
          Guard: supabase.auth.getUser().
DOC-J.14  Viet "4. Real-time Features" (future):
          Supabase Realtime: subscribe to changes.
          Use cases: chat, notifications, order status updates.
DOC-J.15  Viet "5. Storage for Files":
          Supabase Storage: upload images, documents, attachments.
          Buckets: product-images, documents, rfq-attachments, etc.
DOC-J.16  Viet "6. Row Level Security (RLS) Policies":
          Template: buyer can only see own orders.
          Template: seller can only see orders assigned to them.
          Template: admin can see all.
          30+ RLS policies needed.
DOC-J.17  Viet "7. Edge Functions" (future):
          Use cases: email sending, payment gateway, PDF generation.
DOC-J.18  Viet "8. Performance Optimization":
          Indexes on FK columns. Materialized views for dashboards.
          Pagination: offset vs cursor-based.
DOC-J.19  Viet "9. Backup & Recovery":
          Supabase automatic backups. Point-in-time recovery.
          Data export strategy.
DOC-J.20  Viet "10. Environment Setup":
          Development: local Supabase (docker).
          Staging: Supabase project.
          Production: Supabase project + custom domain.
```


# ===========================================================
# DOC-K: TESTING STRATEGY (10 buoc | Dot 30)
# ===========================================================

### DOC-K Dot 30: Testing Plan (10 buoc)
# => Tao file: /docs/30-testing-strategy.md

```
DOC-K.01  Viet "1. Testing Pyramid": Unit > Integration > E2E.
          Current: manual testing only. Target: automated tests.
DOC-K.02  Viet "2. Unit Test Plan — Services":
          Liet ke 20+ service files can test.
          Test pattern: mock delay → call function → assert result.
DOC-K.03  Viet "3. Unit Test Plan — Utils":
          exportUtils, formAutoSave, apiCache, withRetry, toastWithUndo.
DOC-K.04  Viet "4. Component Test Plan — Shared":
          DataTable, FilterBar, FormDialog, StatusBadge, CategoryCombobox.
          Test: render, user interaction, props variations.
DOC-K.05  Viet "5. Integration Test Plan — Pages":
          Liet ke 20+ key pages can test E2E flow.
          VD: OrderListPage: load → filter → sort → click detail → back.
DOC-K.06  Viet "6. E2E Test Scenarios — Buyer":
          10 critical flows: login, browse, cart, order, RFQ, contract, payment, return, PR, budget.
DOC-K.07  Viet "7. E2E Test Scenarios — Seller":
          8 critical flows: login, products, orders, RFQ, warehouse, shipment, invoice, staff.
DOC-K.08  Viet "8. E2E Test Scenarios — Admin":
          6 critical flows: login, users, suppliers, orders, settings, reports.
DOC-K.09  Viet "9. Test Data Management":
          Use mock data as test fixtures. Reset state between tests.
DOC-K.10  Viet "10. CI/CD Integration" (future):
          GitHub Actions: lint → type-check → unit tests → build → E2E.
```


# ===========================================================
# DOC-L: DEPLOYMENT & INFRASTRUCTURE (10 buoc | Dot 31)
# ===========================================================

### DOC-L Dot 31: Deployment Guide (10 buoc)
# => Tao file: /docs/31-deployment.md

```
DOC-L.01  Viet "1. Build Process": Vite build → dist/.
          Environment variables. Build optimization.
DOC-L.02  Viet "2. Hosting Options": Vercel (recommended), Netlify, Cloudflare Pages.
          SPA routing: _redirects or vercel.json.
DOC-L.03  Viet "3. Environment Configuration":
          .env.local, .env.production. Variable naming: VITE_*.
DOC-L.04  Viet "4. CDN & Caching": static assets caching.
          Code splitting: React.lazy → separate chunks.
DOC-L.05  Viet "5. Monitoring" (future): error tracking (Sentry),
          analytics (GA4), performance (Web Vitals).
DOC-L.06  Viet "6. Domain & SSL": custom domain setup.
DOC-L.07  Viet "7. Database Hosting": Supabase managed PostgreSQL.
          Region selection: Singapore (closest to VN).
DOC-L.08  Viet "8. File Storage": Supabase Storage.
          CDN for product images. Image optimization.
DOC-L.09  Viet "9. Scaling Considerations":
          Frontend: stateless, CDN-cached → scales infinitely.
          Backend: Supabase auto-scale → Pro plan for production.
          DB: connection pooling, read replicas (future).
DOC-L.10  Viet "10. Backup & Disaster Recovery":
          DB backups (Supabase). Code: Git. Config: env files.
          RTO/RPO targets.
```


# ===========================================================
# DOC-M: VIBE CODING CONTEXT FILE (20 buoc | Dot 32–33)
# ===========================================================

### DOC-M Dot 32: AI Context — Project Rules (10 buoc)
# => Tao file: /docs/32-vibe-coding-context.md
# (File nay la "KHOAN VANG" — cung cap context cho AI vibe code)

```
DOC-M.01  Viet "1. KHONG LAM" (anti-patterns):
          - KHONG dung react-router-dom (dung react-router)
          - KHONG tao file > 2000 dong
          - KHONG dung DataTable prop `actions` (dung `renderActions`)
          - KHONG dung AuthUser.company (dung companyName)
          - KHONG inline mock data trong component (dung service layer)
          - KHONG dung text-2xl/font-bold/leading-none
          - KHONG tao tai lieu md tru khi user yeu cau
DOC-M.02  Viet "2. PHAI LAM" (mandatory patterns):
          - Service file rieng cho domain moi (api.ts da qua lon)
          - container mx-auto px-4 py-6 cho page wrapper
          - DataTable: totalItems, pagination, sort, onPaginationChange, onSortChange, getId
          - FilterBar cho moi trang list
          - StatusBadge cho moi status display
          - React.lazy cho moi page trong routes.ts
          - Key prop: dung entity.id (khong dung array index)
DOC-M.03  Viet "3. FILE MAP" — tham chieu nhanh:
          Types: /src/app/types/index.ts
          Routes: /src/app/routes.ts
          Main service: /src/app/services/api.ts
          Mock data: /src/app/data/mockData.ts
          Theme: /src/styles/theme.css
          Fonts: /src/styles/fonts.css
DOC-M.04  Viet "4. COMPONENT MAP":
          Shared: DataTable, FilterBar, FormDialog, CategoryCombobox, StatusBadge, ViewToggle, ...
          UI: Button, Input, Dialog, Sheet, Select, Table, Tabs, Card, Badge, ...
          Context: AuthContext, CartContext, WishlistContext, NotificationContext.
DOC-M.05  Viet "5. SERVICE MAP":
          api.ts: authApi, userApi, categoryApi, productApi, orderApi, rfqApi,
          quotationApi, contractApi, warehouseApi, inventoryApi, stockMovementApi,
          stockAlertApi, shipmentApi, paymentApi, invoiceSellerApi, invoiceBuyerApi,
          staffApi, promotionApi, certificateApi, chatApi, notificationApi,
          reviewApi, supplierReviewApi, cartApi, wishlistApi, orderTemplateApi,
          approvalApi, returnApi, creditApi.
          Separate files: adminApi, analyticsApi, auctionApi, budgetApi,
          buyerDashboardApi, debitCreditApi, documentApi, grnApi, integrationApi,
          loyaltyApi, orderStatusHistoryApi, prApi, priceAgreementApi,
          productImageApi, reportBuilderApi, rfqAttachmentApi, slaApi,
          supplierCategoryApi, warehouseTransferApi, warrantyApi.
DOC-M.06  Viet "6. TYPE MAP" — liet ke 100+ types/interfaces theo domain:
          User domain: User, AuthUser, LoginCredentials, RegisterData, ShippingAddress, ...
          Product domain: Category, Product, ProductVariant, ProductImage, Supplier, ...
          Order domain: Order, OrderItem, OrderStatus, CartItem, WishlistItem, ...
          ... (tat ca domains)
DOC-M.07  Viet "7. STATUS ENUM MAP":
          OrderStatus: 7 values. RFQStatus: 7 values. ContractStatus: 7 values.
          PaymentStatus: 5 values. InvoiceStatus: 5 values. ShipmentStatus: 6 values.
          ... (tat ca enum/union types)
DOC-M.08  Viet "8. MOCK DATA MAP":
          mockUsers (12+), mockCategories (10+), mockProducts (35+),
          mockOrders (15+), mockSuppliers (10+), mockContracts (8+), ...
          Ghi so luong records moi entity.
DOC-M.09  Viet "9. KNOWN ISSUES & TODO":
          - B22.03-B22.05: link "Tai lieu dinh kem" chua implement
          - api.ts > 2900 dong: can tach them
          - sellerId vs supplierId inconsistency
          - Mot so page chua responsive hoan chinh
          - Mock data ID format chua thong nhat 100%
DOC-M.10  Viet "10. PLAN STATUS":
          PLAN_MASTER_COMPLETION: 856 buoc, A-C done (Dot 1-18)
          PLAN_UI_UPGRADE: UI-A → UI-E19 done
          PLAN_UI_PERFECTION: P1-P5 done (Dot 1-15)
          PLAN_DB_UI_AUDIT: DB-A → DB-D7 done (70/310 buoc)
          PLAN_DOCS_COMPLETION: this plan (420 buoc)
```

### DOC-M Dot 33: AI Context — Code Templates (10 buoc)
# => Tao file: /docs/33-code-templates.md

```
DOC-M.11  Template "New Service File": /src/app/services/xxxApi.ts
          Pattern: import types, delay function, let mockArray,
          export const xxxApi = { getPaginated, getById, create, update, delete }.
DOC-M.12  Template "New Admin Page" (theo pattern OrderOverview.tsx):
          Pattern: useState, useEffect → load data, columns config,
          FilterBar, DataTable, FormDialog, StatusBadge.
DOC-M.13  Template "New Buyer List Page":
          Pattern: container wrapper, FilterBar + ViewToggle,
          DataTable (table mode) + CardGrid (grid mode), pagination.
DOC-M.14  Template "New Buyer Detail Page":
          Pattern: useParams → load by ID, Tabs + Sections,
          Back button, Action buttons, StatusBadge.
DOC-M.15  Template "New Seller Page":
          Pattern: SellerLayout context, DataTable + FormDialog,
          CRUD operations, inline edit, column toggle.
DOC-M.16  Template "New Dashboard Widget":
          Pattern: StatsCard + AnimatedNumber + TrendIndicator,
          Recharts (BarChart/LineChart/PieChart), DashboardWidget wrapper.
DOC-M.17  Template "New Form with Validation":
          Pattern: FormDialog fields config, onSubmit handler,
          toast.success/error, optimistic update.
DOC-M.18  Template "DataTable Column Config":
          Pattern: ColumnConfig[] voi cac loai cot thuong gap:
          text, number (formatted), date, status badge, actions.
DOC-M.19  Template "Adding New Route":
          Pattern: 1) Tao component file, 2) Them lazy import vao routes.ts,
          3) Them route entry, 4) Them menu link vao Layout.
DOC-M.20  Template "Adding New Type":
          Pattern: 1) Them type vao types/index.ts, 2) Tao service,
          3) Tao mock data, 4) Tao UI page.
```


# ===========================================================
# DOC-N: CROSS-REFERENCE & INDEX (30 buoc | Dot 34–36)
# ===========================================================

### DOC-N Dot 34: Cross-Reference Tables (10 buoc)
# => Tao file: /docs/34-cross-reference.md

```
DOC-N.01  Bang "Entity → Service → UI Pages":
          Moi entity (Order, Product, ...) → service file → list of pages that use it.
          ~50 entities × 3 columns.
DOC-N.02  Bang "Page → Route → Component File → Service Calls":
          Moi page → route path → .tsx file → list of API calls.
          ~108 pages × 4 columns.
DOC-N.03  Bang "Service → Methods → Used By Pages":
          Moi service method → list of pages calling it.
          ~200 methods × 2 columns.
DOC-N.04  Bang "Type → Used In Services → Used In Components":
          Moi type → services importing it → components importing it.
DOC-N.05  Bang "DB Table → Type → Service → Mock Data":
          Map 1-1: database table → TypeScript type → API service → mock array.
DOC-N.06  Bang "Status Value → StatusBadge Variant → Color":
          Tat ca status values → badge variant mapping → visual color.
DOC-N.07  Bang "Permission Key → Feature → Pages → Actions":
          50+ permission keys → what they control.
DOC-N.08  Bang "Menu Item → Route → Page → Guard":
          Navigation menu structure → route → page component → auth guard.
DOC-N.09  Bang "Notification Trigger → Event → Channel → Template":
          Auto-notification rules: event → message → channel.
DOC-N.10  Bang "File Size Audit": moi .tsx file → so dong → trang thai (OK / can tach).
```

### DOC-N Dot 35: Documentation Index & README (10 buoc)
# => Tao file: /docs/00-index.md (master index)

```
DOC-N.11  Tao file 00-index.md: Table of Contents lien ket den tat ca 35 file tai lieu.
          Phan nhom: Architecture, Database, API, Business Rules, Roles, UI/UX,
          User Flows, Data Dictionary, Migration, Testing, Deployment,
          AI Context, Cross-Reference.
DOC-N.12  Moi file doc: them "Related Documents" section o cuoi,
          link den cac file lien quan.
DOC-N.13  Tao "Quick Start for AI" section trong 00-index.md:
          "Doc nhung file nay truoc: 01-system-overview.md, 32-vibe-coding-context.md,
          33-code-templates.md".
DOC-N.14  Tao "Quick Start for Developer" section:
          Install → Run → Understand structure → Key files.
DOC-N.15  Tao "Change Log" section: ghi lai lich su thay doi tai lieu.
DOC-N.16  Tao "Document Status Matrix": moi file → status (Draft/Review/Final).
DOC-N.17  Tao "Search Guide": huong dan tim thong tin nhanh theo topic.
DOC-N.18  Review: kiem tra tat ca internal links giua cac file tai lieu.
          Dam bao khong co broken links.
DOC-N.19  Review: kiem tra nhat quan giua tai lieu va source code.
          Danh sach kiem tra: types match, routes match, services match, pages match.
DOC-N.20  Review: spell check tieng Viet, formatting check, heading hierarchy.
```

### DOC-N Dot 36: Final Consistency Check (10 buoc)
# => Cap nhat tat ca files

```
DOC-N.21  Kiem tra: moi type trong types/index.ts co duoc document trong schema files.
DOC-N.22  Kiem tra: moi service method co duoc document trong API spec files.
DOC-N.23  Kiem tra: moi page co duoc list trong page inventory.
DOC-N.24  Kiem tra: moi route co duoc document.
DOC-N.25  Kiem tra: moi business rule co state machine diagram.
DOC-N.26  Kiem tra: moi entity co cross-reference entry.
DOC-N.27  Kiem tra: vibe coding context file (32-*) co tat ca thong tin can thiet
          de AI bat dau code ngay.
DOC-N.28  Kiem tra: Supabase migration files co cover tat ca 109 bang.
DOC-N.29  Cap nhat collections.md: dong bo voi schema files (109 bang, day du cot).
DOC-N.30  Cap nhat file nay (PLAN_DOCS_COMPLETION.md): danh dau HOAN THANH.
```


# ===========================================================
# PHU LUC: DANH SACH 36 FILE TAI LIEU SE TAO
# ===========================================================
#
# /docs/00-index.md                        — Master index & TOC
# /docs/01-system-overview.md              — Tong quan he thong
# /docs/02-architecture.md                 — Kien truc & Diagrams
# /docs/03-coding-conventions.md           — Quy uoc code
# /docs/04-database-schema-part1.md        — Schema: User, Product, Category
# /docs/05-database-schema-part2.md        — Schema: Order, Cart, RFQ, Contract
# /docs/06-database-schema-part3.md        — Schema: Warehouse, Shipping, Payment
# /docs/07-database-schema-part4.md        — Schema: Return, Review, KM, Approval, etc.
# /docs/08-erd.md                          — Entity Relationship Diagrams
# /docs/09-api-spec-part1.md               — API: Auth, User, Product, Category
# /docs/10-api-spec-part2.md               — API: Order, Cart, RFQ, Contract
# /docs/11-api-spec-part3.md               — API: Warehouse, Shipping, Payment
# /docs/12-api-spec-part4.md               — API: Return, Review, KM, Approval
# /docs/13-api-spec-part5.md               — API: System, Loyalty, Integration
# /docs/14-business-rules-part1.md         — Rules: Core Commerce
# /docs/15-business-rules-part2.md         — Rules: Sourcing & Procurement
# /docs/16-business-rules-part3.md         — Rules: Platform & System
# /docs/17-state-machines.md               — State Machine Diagrams
# /docs/18-roles-permissions.md            — Role Definitions & Access Matrix
# /docs/19-permission-implementation.md    — Permission Implementation Guide
# /docs/20-ui-page-inventory.md            — Page Inventory & Navigation
# /docs/21-component-catalog-shared.md     — Shared Component Catalog
# /docs/22-component-catalog-ui.md         — UI Primitive Catalog
# /docs/23-design-tokens.md                — Design Tokens & Theming
# /docs/24-user-flows-buyer.md             — Buyer User Flows
# /docs/25-user-flows-seller.md            — Seller User Flows
# /docs/26-user-flows-admin.md             — Admin User Flows
# /docs/27-data-dictionary.md              — Data Dictionary & Glossary
# /docs/28-supabase-migration.md           — Supabase Schema Migration
# /docs/29-supabase-client-guide.md        — Supabase Client Integration
# /docs/30-testing-strategy.md             — Testing Strategy
# /docs/31-deployment.md                   — Deployment & Infrastructure
# /docs/32-vibe-coding-context.md          — AI Vibe Coding Context (QUAN TRONG NHAT)
# /docs/33-code-templates.md               — Code Templates for AI
# /docs/34-cross-reference.md              — Cross-Reference Tables
# + /docs/collections.md                   — (da co, se cap nhat)
#
# ===========================================================
# TONG KET
# ===========================================================
#
# Tong: ~420 buoc | 42 dot | 14 giai doan
#
# DOC-A:  Tong quan & Kien truc              — 30 buoc | Dot 1-3
# DOC-B:  Database Schema chi tiet            — 40 buoc | Dot 4-7
# DOC-C:  Entity Relationship Diagram         — 10 buoc | Dot 8
# DOC-D:  API Specification                   — 50 buoc | Dot 9-13
# DOC-E:  Business Rules & Domain Logic       — 40 buoc | Dot 14-17
# DOC-F:  Roles & Permissions                 — 20 buoc | Dot 18-19
# DOC-G:  UI/UX Specification                 — 40 buoc | Dot 20-23
# DOC-H:  User Flows & Use Cases              — 30 buoc | Dot 24-26
# DOC-I:  Data Dictionary & Glossary          — 10 buoc | Dot 27
# DOC-J:  Supabase Migration Guide            — 20 buoc | Dot 28-29
# DOC-K:  Testing Strategy                    — 10 buoc | Dot 30
# DOC-L:  Deployment & Infrastructure         — 10 buoc | Dot 31
# DOC-M:  Vibe Coding Context & Templates     — 20 buoc | Dot 32-33
# DOC-N:  Cross-Reference & Final Review      — 30 buoc | Dot 34-36
#
# THU TU UU TIEN:
#   1. DOC-M (Dot 32-33): Vibe Coding Context — QUAN TRONG NHAT, lam truoc
#   2. DOC-A (Dot 1-3): System Overview — nen tang
#   3. DOC-B (Dot 4-7): Database Schema — backbone
#   4. DOC-E (Dot 14-17): Business Rules — logic nghiep vu
#   5. DOC-D (Dot 9-13): API Spec — contract
#   6. DOC-G (Dot 20-23): UI/UX Spec — giao dien
#   7. Con lai theo thu tu
#
# NGUYEN TAC:
#   - Moi file tai lieu <= 2000 dong
#   - Dong bo voi source code thuc te (khong suy doan)
#   - Cross-reference bang relative links
#   - Uu tien thong tin actionable (AI doc la code duoc ngay)
#   - Tieng Viet co dau cho noi dung, ASCII cho key/heading
#   - Dung Mermaid cho diagrams (render duoc tren GitHub)
#
# ============================================================

# FE Admin Process

Source of truth:

- BA docs: `B2B eCommerce Platform Plan/ba-docs`
- BE contracts: `be/docs/FE_*_CONTRACT.md`
- BE progress: `be/docs/PROGRESS.md`
- FE progress: `B2B eCommerce Platform Plan/docs/FE_ADMIN_PROGRESS.md`
- BE gaps requested by FE: `be/docs/FE_ADMIN_BACKEND_GAPS.md`

## Working rule

Admin FE must be implemented module by module. Do not wire a page to invented endpoints.

For every admin module:

1. Read the relevant BE contract first.
2. If BE supports the needed endpoints, implement FE against that contract.
3. If BE is missing endpoints, write the exact requirement to `be/docs/FE_ADMIN_BACKEND_GAPS.md`.
4. Keep mock/stub data only for screens that do not have BE support yet.
5. Every completed module must have at least 10 demo records.
   - If the module uses real BE API, add or request BE seed data.
   - If the module is still FE mock-only, add at least 10 mock records.
6. Run FE build after changes.
7. Update `FE_ADMIN_PROGRESS.md`.

## Definition of done

A FE admin module is done only when all items are true:

- Uses BE contract where available.
- Does not call legacy mock API for the completed behavior.
- Handles loading, empty state, error state, and successful mutation refresh.
- Supports enough data for testing, minimum 10 records.
- Build passes with `npm.cmd run build`.
- Missing BE endpoints are documented in `be/docs/FE_ADMIN_BACKEND_GAPS.md`.

## Priority order

P0 - required for a usable shop:

1. Categories
2. Products
3. Product variants, images, and stock
4. Orders
5. Payments

P1 - needed for admin operation:

1. Dashboard
2. Promotions
3. Invoices
4. Shipments

P2 - after-sales and trust:

1. Returns
2. Warranty
3. Reviews
4. Trade-in

P3 - content and system management:

1. Banners
2. Blog/content
3. Stores/branches
4. Staff
5. Settings
6. Reports
7. Activity logs

## Data policy

Minimum test/demo data per finished module:

- Categories: at least 10 categories.
- Products: at least 10 products.
- Variants/stock: at least 10 variants, preferably more than one variant for key products.
- Orders: at least 10 orders across statuses.
- Payments: at least 10 payments across statuses.
- Promotions: at least 10 promotions.
- Invoices: at least 10 invoices.
- Shipments: at least 10 shipments.
- Reviews: at least 10 reviews.
- Returns/warranty: at least 10 records each when implemented.

When a module is real-BE backed, seed data belongs in BE migrations or documented BE seed tasks. FE should not silently fake extra records for a real-BE completed module.

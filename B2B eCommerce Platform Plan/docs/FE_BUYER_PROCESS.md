# FE Buyer Process

Source of truth:

- BA docs: `B2B eCommerce Platform Plan/ba-docs`
- BE contracts: `be/docs/FE_*_CONTRACT.md`
- BE gap tracker: `be/docs/FE_BUYER_BACKEND_GAPS.md`

## Working rules

- Implement buyer pages only from the matching BE contract.
- Keep mock fallback only when BE has no contract or local BE is unavailable.
- After each completed feature, verify local API, FE route, and `npm.cmd run build`.
- After each completed feature, update `FE_BUYER_PROGRESS.md` with status, verification, data count, and next action.
- If BE is missing a contract or data, add the requirement to `be/docs/FE_BUYER_BACKEND_GAPS.md` instead of inventing FE-only behavior.

## Priority order

1. Catalog/home/product list/product detail.
2. Cart validation, add/update/remove item, checkout preparation.
3. Order create/list/detail/cancel.
4. Payment, invoice, and shipment tracking.
5. Return, warranty, trade-in, and loyalty.
6. Secondary public pages: blog, store locator, phone finder, compare, wishlist, reviews, profile, notifications.

## Current next action

Continue with cart and checkout using `be/docs/FE_CART_CONTRACT.md` and `be/docs/FE_ORDER_CONTRACT.md`.

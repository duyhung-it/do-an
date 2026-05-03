# ============================================================
# KE HOACH RA SOAT GIAO DIEN & API GIA LAP
# PHU HOP VOI THIET KE CO SO DU LIEU
# ============================================================
#
# Co so: docs/collections.md (103 bang, 16 domain)
# Doi tuong: types/index.ts, services/*, data/mock*, components/*
#
# TRANG THAI: DANG THUC HIEN — DB-D Dot 7 HOAN THANH (70/310 buoc)
# TONG: ~310 buoc | 31 dot | 10 giai doan (DB-A → DB-J)
#
# NGUYEN TAC:
#   1. Moi sub-item (line item) phai co `id` de CRUD duoc
#   2. FK fields phai nhat quan (dung *Id, khong dung *Name lam FK)
#   3. Denormalized display fields (ten, ten cong ty) giu lai cho UI
#      nhung phai co comment "// denormalized from {table}"
#   4. Cac bang N-N trong DB => o frontend co the embed array
#      nhung service phai co API rieng de quan ly
#   5. Mock data phai sinh du lieu tuong thich voi schema
#   6. Khong pha vo giao dien dang chay — chi sap xep lai data shape
#   7. Moi dot ~10 buoc, implement tuan tu
#   8. Tat ca file tuoi da <=2000 dong
# ============================================================

---

## ========================================================
## DB-A: AUDIT TYPES — NGUOI DUNG & XAC THUC (10 buoc | Dot 1)
## ========================================================

### DB-A Dot 1: users, shipping_addresses, notification_preferences

```
DB-A.01  User type: them truong `passwordHash` (mark optional, UI ko render), `companyId` (FK buyer_companies | null),
         `supplierId` (FK suppliers | null), `lastLoginAt`, `emailVerified: boolean`, `phoneVerified: boolean`,
         `language: string`, `timezone: string`. Doi `companyName` thanh computed tu companyId.
         => Quyet dinh: GIU companyName lam denormalized display field, THEM companyId FK.
DB-A.02  AuthUser type: them `companyId`, `phone`, `status: UserStatus` — hien chi co id/fullName/email/role/avatarUrl/companyName/supplierId.
         AuthContext.tsx: update login mock tra them cac field moi.
DB-A.03  ShippingAddress type: them `postalCode`, `latitude?`, `longitude?`, `type?: 'Van phong' | 'Kho' | 'Nha rieng'`.
         Kiem tra BuyerProfilePage, OrderConfirmationPage dung dung cac field.
DB-A.04  NotificationPreference type: them `id`, `userId`, `channel: 'email' | 'push' | 'sms' | 'inApp'`,
         `createdAt`, `updatedAt`. Hien tai chi co {type, label, enabled} — qua don gian.
DB-A.05  RegisterData type: them `companyName` bat buoc khi role='Nguoi mua' hoac 'Nha cung cap',
         them `taxCode?`, `address?`, `city?`, `phone` (hien da co).
DB-A.06  Service: authApi (trong api.ts) — kiem tra login/register/logout co tra dung AuthUser shape moi.
         Mock: tao 5+ user mau day du fields (buyer, seller, admin).
DB-A.07  MockData: cap nhat mockUsers trong mockData.ts — them companyId, supplierId, lastLoginAt, emailVerified.
DB-A.08  MockData: cap nhat mockShippingAddresses — them postalCode, type field. Sinh 5+ dia chi mau.
DB-A.09  UI: LoginPage, RegisterPage — kiem tra form fields khop voi RegisterData moi.
         RegisterPage: them truong companyName/taxCode khi role != admin.
DB-A.10  UI: NotificationCenterPage, NotificationDropdown — kiem tra dung NotificationPreference moi.
         Them channel selector (email/push/sms).
```

---

## ========================================================
## DB-B: AUDIT TYPES — SAN PHAM & DANH MUC (20 buoc | Dot 2–3)
## ========================================================

### DB-B Dot 2: categories, products, product_variants (10 buoc)

```
DB-B.01  Category type: them `imageUrl?`, `sortOrder: number`, `level: number` (depth trong cay),
         `path: string` (materialized path VD: 'dien-tu/dien-thoai'), `metaTitle?`, `metaDescription?`.
         Kiem tra CategoryCombobox, CategoryManagement.
DB-B.02  Product type: them `brandName?`, `origin?: string` (xuat xu), `weight?: number`, `dimensions?: string`,
         `warrantyMonths?: number`, `moq?: number` (= minOrderQty, doi ten cho nhat quan voi DB).
         => Quyet dinh: GIU `minOrderQty` (da dung khap noi), THEM alias `moq` vao DB doc.
DB-B.03  Product type: them `isActive: boolean` (khac voi status, day la soft-delete),
         `viewCount: number`, `soldCount: number`, `featured: boolean`.
DB-B.04  ProductVariant type: them `barcode?`, `weight?`, `dimensions?`, `images: string[]`,
         `isActive: boolean`, `costPrice?: number` (gia von).
         Hien tai chi co {id, name, sku, price, stock} — thieu nhieu field.
DB-B.05  Tach `product_images` thanh type rieng: `ProductImage { id, productId, url, altText, sortOrder, isPrimary }`.
         Product.images: string[] => Product.images: ProductImage[].
         => Quyet dinh thiet ke: GIU Product.images: string[] cho don gian o UI list/grid.
         Khi vao ProductDetail/ProductForm moi load ProductImage[]. Them type ProductImage.
DB-B.06  Tach `product_tags` thanh type: `ProductTag { id, productId, tag: string }`.
         => Quyet dinh: GIU Product.tags: string[] (tag don gian, ko can type rieng o FE).
         DB doc ghi chu: FE dung array, API layer chuyen doi.
DB-B.07  Tach `product_specifications`: da co Product.specifications: Record<string, string>.
         => Them type `ProductSpecification { id, productId, key, value, sortOrder }`.
         Dung khi ProductForm can CRUD specs. Product.specifications giu cho display.
DB-B.08  Service: productApi — kiem tra getAll, getById, create, update, delete deu tra dung Product shape.
         Them `getImages(productId)`, `updateImages(productId, images[])`.
DB-B.09  MockData: cap nhat products trong mockData.ts — them brandName, origin, viewCount, soldCount.
         Dam bao 10+ SP co day du truong. ProductVariant them barcode, isActive.
DB-B.10  UI: ProductListPage, ProductDetailPage, SellerProductList, SellerProductForm —
         kiem tra render dung cac field moi. ProductForm them fields brand, origin, warranty.
```

### DB-B Dot 3: product_images, product_tags, supplier_categories (10 buoc)

```
DB-B.11  Them type ProductImage { id, productId, url, altText?, sortOrder, isPrimary } vao types/index.ts.
DB-B.12  Service: them `productImageApi { getByProduct, create, update, delete, reorder }` vao service rieng.
         File moi: /src/app/services/productImageApi.ts.
DB-B.13  Them type SupplierCategory (bang N-N): { id, supplierId, categoryId }.
         Hien tai Supplier.categoryIds: string[] — giu cho UI, nhung service phai co addCategory/removeCategory.
DB-B.14  Service: them `supplierCategoryApi { getBySupplier, add, remove }` — file /src/app/services/supplierCategoryApi.ts.
DB-B.15  Supplier type: them `employees?: number`, `productionCapacity?: string`, `website?: string`,
         `yearsExperience?: number`, `registrationNumber?: string`.
         => Kiem tra SellerProfile.tsx da co nhung field tuong tu — dong bo ten field.
DB-B.16  Supplier type: them `taxId?: string`, `bankName?: string`, `bankAccount?: string`,
         `representative?: string`. Kiem tra SellerProfile TaxForm dung cac field nay.
DB-B.17  MockData: cap nhat mockSuppliers — them employees, website, taxId, bankName.
         Dam bao 5+ NCC co day du truong.
DB-B.18  UI: SupplierListPage, SupplierDetailPage — kiem tra render employees, website.
DB-B.19  UI: AdminSupplierPage — kiem tra cac field NCC khop voi Supplier type moi.
DB-B.20  UI: CategoryManagement — kiem tra sortOrder, level, path khi CRUD. Hien chi co name/parentId/slug/icon.
```

---

## ========================================================
## DB-C: AUDIT TYPES — DON HANG & GIO HANG (20 buoc | Dot 4–5)
## ========================================================

### DB-C Dot 4: orders, order_items, cart_items (10 buoc)

```
DB-C.01  Order type: them `orderType?: 'Thuong' | 'RFQ' | 'Hop dong' | 'Mau don'`,
         `rfqId?`, `contractId?`, `templateId?` (FK lien ket nguon goc don hang).
         Them `cancelReason?`, `cancelledAt?`, `cancelledBy?`.
DB-C.02  Order type: them `discountAmount: number`, `promotionCode?`, `promotionId?`.
         Hien tai chua co truong giam gia — chua tuong thich voi bang promotions.
DB-C.03  Order type: them `expectedDeliveryDate?`, `actualDeliveryDate?`,
         `buyerCompany?: string` (denormalized), `isUrgent?: boolean`.
DB-C.04  OrderItem type: them `sku?: string`, `unit?: string`, `discount?: number`,
         `note?: string`, `variantId?: string` (FK). Hien thieu `id` cho sub-item? 
         => Da co id ✓. Them sku, unit, discount.
DB-C.05  Them type OrderStatusHistory: { id, orderId, fromStatus, toStatus, changedBy, changedByName, note, createdAt }.
         Day la bang log rieng chua co trong DB doc — DE XUAT BO SUNG vao DB.
         => Cap nhat docs/collections.md: them bang `order_status_history`.
DB-C.06  CartItem type: them `addedAt: string`, `savedForLater?: boolean`, `note?: string`.
         Hien da co id ✓. Them 3 field tren.
DB-C.07  Service: orderApi — kiem tra create, update, cancel, getById deu tra dung Order shape.
         Them `getStatusHistory(orderId)`, `addStatusNote(orderId, note)`.
DB-C.08  Service: cartApi — kiem tra addToCart, updateQty, remove dung CartItem moi.
         Them `saveForLater(cartItemId)`, `getCountByUser(userId)`.
DB-C.09  MockData: cap nhat mockOrders — them orderType, discountAmount, cancelReason.
         Dam bao 15+ don hang da du trang thai.
DB-C.10  UI: OrderListPage, OrderDetailPage, SellerOrderList, SellerOrderDetail, OrderOverview —
         kiem tra render cac field moi. OrderDetail them section "Ly do huy" khi status=Da huy.
```

### DB-C Dot 5: order_templates, wishlist (10 buoc)

```
DB-C.11  OrderTemplate type: kiem tra da co day du — id, userId, name, items[], supplierId. OK.
         Them `isDefault?: boolean`, `category?: string` (nhom mau don).
DB-C.12  OrderTemplateItem type: them `id` (hien thieu), `templateId`.
         => Dam bao moi item trong template co unique ID de CRUD.
DB-C.13  WishlistFolder type: kiem tra OK. Them `coverImage?`, `isDefault?: boolean`.
DB-C.14  WishlistItem type: them `folderId: string` (FK wishlist_folders). Hien chua co lien ket folder.
         Kiem tra WishlistContext.tsx xu ly folder assignments.
DB-C.15  Service: orderTemplateApi — kiem tra CRUD, them `createFromOrder(orderId)`, `duplicate(templateId)`.
DB-C.16  Service: wishlistApi — kiem tra addToWishlist, remove, move giua folders.
         Them `moveToFolder(itemId, folderId)`.
DB-C.17  MockData: cap nhat mockWishlistItems — them folderId. Tao 3 folder, 8+ items.
DB-C.18  MockData: cap nhat mockOrderTemplates — them isDefault, category. Tao 5+ templates.
DB-C.19  UI: BuyerWishlistPage — kiem tra folder filter/move hoat dong voi folderId moi.
DB-C.20  UI: BuyerOrderTemplatePage — kiem tra CRUD voi OrderTemplateItem co id.
```

---

## ========================================================
## DB-D: AUDIT TYPES — RFQ, BAO GIA, HOP DONG (20 buoc | Dot 6–7)
## ========================================================

### DB-D Dot 6: rfqs, rfq_items, rfq_attachments, quotations (10 buoc)

```
DB-D.01  RFQItem type: them `id: string` (hien THIEU — ko CRUD duoc item rieng le).
         Them `rfqId: string`, `categoryId?`, `sampleRequired?: boolean`.
DB-D.02  RFQ type: them `categoryId?` (danh muc chinh), `priority?: 'Thuong' | 'Gap' | 'Rat gap'`,
         `responseCount?: number` (so NCC da phan hoi).
DB-D.03  Them type RFQAttachment: { id, rfqId, fileName, fileUrl, fileSize, fileType, uploadedBy, createdAt }.
         RFQ.attachments: string[] => Giu string[] cho display, them api `rfqAttachmentApi` de CRUD.
DB-D.04  QuotationItem type: them `id: string` (hien THIEU), `quotationId: string`,
         `productId?: string`, `unit?: string`, `discount?: number`.
DB-D.05  Quotation type: them `rfqNumber?: string` (denormalized), `warranty?: string`,
         `attachments?: string[]`, `expiresAt?: string`.
DB-D.06  Service: rfqApi — kiem tra create, update, submit, accept/reject quotation.
         Them `addItem(rfqId, item)`, `removeItem(rfqId, itemId)`.
         Them `addAttachment(rfqId, file)`, `removeAttachment(rfqId, attachmentId)`.
DB-D.07  Service: quotationApi — kiem tra submit, accept, reject.
         Them `getByRFQ(rfqId)`, `compareQuotations(rfqId)`.
DB-D.08  MockData: cap nhat mockRFQs — RFQItem them id. Sinh 8+ RFQ voi 2-5 items moi.
DB-D.09  MockData: cap nhat mockQuotations — QuotationItem them id. Sinh 10+ bao gia.
DB-D.10  UI: BuyerRFQCreatePage, BuyerRFQDetailPage, SellerRFQList, SellerRFQDetail —
         kiem tra item CRUD dung id, attachment CRUD.
```

### DB-D Dot 7: contracts, contract_items, contract_milestones (10 buoc)

```
DB-D.11  ContractItem type: them `id: string` (hien THIEU), `contractId: string`,
         `productId?: string`, `sku?: string`, `deliveredQty?: number`, `remainingQty?: number`.
DB-D.12  Contract type: them `contractType?: 'Mua ban' | 'Khung' | 'Dich vu'`,
         `approvedBy?`, `approvedAt?`, `renewalDate?`, `autoRenew?: boolean`.
DB-D.13  ContractMilestone type: da co id ✓. Them `contractId: string`, `completedAt?: string`,
         `completedBy?: string`, `paidAmount?: number`.
DB-D.14  Them type ContractHistory: { id, contractId, action, changedBy, changedByName, details, createdAt }.
         => DE XUAT them bang `contract_history` vao DB doc.
DB-D.15  Service: contractApi — kiem tra CRUD, them `addMilestone`, `completeMilestone`,
         `sign(contractId, role: 'buyer'|'seller')`.
DB-D.16  Service: contractApi — them `getHistory(contractId)`, `renew(contractId)`.
DB-D.17  MockData: cap nhat mockContracts — ContractItem them id, deliveredQty.
         ContractMilestone them contractId, completedAt. Sinh 8+ hop dong.
DB-D.18  UI: BuyerContractList, BuyerContractDetail — kiem tra milestone CRUD voi id moi.
DB-D.19  UI: SellerContractList, SellerContractDetail — kiem tra contract history render.
DB-D.20  UI: ContractManagement (admin) — kiem tra contractType, approvedBy fields.
```

---

## ========================================================
## DB-E: AUDIT TYPES — KHO HANG & VAN CHUYEN (20 buoc | Dot 8–9)
## ========================================================

### DB-E Dot 8: warehouses, inventory, stock_movements, stock_alerts (10 buoc)

```
DB-E.01  Warehouse type: da tuong doi day du. Them `country?: string`, `phone?: string`,
         `email?: string`, `updatedAt: string`. Kiem tra SellerWarehouse dung day du.
DB-E.02  InventoryItem type: da day du (530+ fields). Them `batchNumber?: string`,
         `expiryDate?: string`, `location?: string` (vi tri trong kho).
DB-E.03  StockMovement type: da day du. Them `batchNumber?`, `unitCost?: number`,
         `totalCost?: number`, `updatedAt?: string`.
DB-E.04  StockAlert type: them `acknowledgedBy?`, `acknowledgedAt?`, `resolvedAt?`,
         `autoCreated: boolean`. Hien thieu truong ghi nhan xu ly.
DB-E.05  WarehouseTransfer type: them `supplierId: string` (FK), `updatedAt: string`,
         `reason?: string`, `priority?: 'Thuong' | 'Gap'`.
DB-E.06  TransferItem type: them `id: string` (hien THIEU), `transferId: string`,
         `sku?: string`, `unit?: string`.
DB-E.07  Service: warehouseApi, inventoryApi, stockMovementApi, stockAlertApi —
         kiem tra CRUD day du, tra dung shape. Them `acknowledgeAlert(alertId)`.
DB-E.08  Service: warehouseTransferApi — kiem tra CRUD, them `approve`, `ship`, `receive`.
         TransferItem phai co id khi tao.
DB-E.09  MockData: cap nhat kho — them batchNumber, expiryDate cho InventoryItem.
         TransferItem them id. Sinh 5+ phieu chuyen kho.
DB-E.10  UI: SellerWarehouse (WarehouseTab, InventoryTab, MovementTab, AlertTab, TransferTab) —
         kiem tra tat ca truong moi duoc render dung.
```

### DB-E Dot 9: shipments, shipment_events, shipping_rates (10 buoc)

```
DB-E.11  ShipmentEvent type: them `id: string` (hien THIEU). Event la row rieng trong DB.
DB-E.12  Shipment type: them `supplierId` da co ✓. Them `insuranceAmount?: number`,
         `returnShipment?: boolean`, `notes?: string`, `updatedAt: string`.
DB-E.13  ShippingRate type: them `id: string` (hien THIEU), `weightMin`, `weightMax`,
         `regionFrom?`, `regionTo?`, `isActive: boolean`.
DB-E.14  Them type ShipmentTracking: { id, shipmentId, status, location, description, timestamp, source: 'system' | 'carrier' }.
         Khac voi ShipmentEvent — ShipmentTracking la tu carrier API push ve.
         => Quyet dinh: GIU ShipmentEvent (da dung rong rai), them field `source` vao.
DB-E.15  Service: shipmentApi — kiem tra CRUD, updateStatus, getEvents.
         Them `getTrackingByOrder(orderId)` (tien cho buyer).
DB-E.16  Service: shippingRateApi (moi) — file /src/app/services/shippingRateApi.ts.
         { getAll, getByCarrier, calculate(from, to, weight) }.
DB-E.17  MockData: ShipmentEvent them id. ShippingRate them id.
         Sinh 10+ shipping events, 8+ rates.
DB-E.18  UI: SellerShipmentList, BuyerShipmentList, BuyerShipmentDetail —
         kiem tra shipment events dung id moi.
DB-E.19  UI: AdminShipmentPage — kiem tra shipping rates management voi id, isActive.
DB-E.20  UI: OrderConfirmationPage — kiem tra shippingRate selection dung ShippingRate type moi.
```

---

## ========================================================
## DB-F: AUDIT TYPES — THANH TOAN, HOA DON, CONG NO (30 buoc | Dot 10–12)
## ========================================================

### DB-F Dot 10: payments, payment_transactions (10 buoc)

```
DB-F.01  Payment type: them `currency?: string` (default VND), `updatedAt: string`,
         `lateFee?: number`, `isOverdue?: boolean` (computed).
DB-F.02  PaymentTransaction type: da OK. Them `status?: 'Thanh cong' | 'That bai' | 'Cho xu ly'`,
         `gatewayRef?: string`, `createdBy?: string`.
DB-F.03  Them type PaymentReminder: { id, paymentId, sentAt, channel, message, sentBy }.
         => DE XUAT them bang `payment_reminders` vao DB doc — tracking nhac thanh toan.
DB-F.04  Service: paymentApi — kiem tra create, recordTransaction, getByOrder, getByBuyer.
         Them `sendReminder(paymentId)`, `calculateLateFee(paymentId)`.
DB-F.05  MockData: cap nhat payments — them currency, lateFee.
         PaymentTransaction them status, gatewayRef. Sinh 15+ payments.
DB-F.06  UI: BuyerPaymentList, BuyerPaymentDetail — kiem tra lateFee render, reminder button.
DB-F.07  UI: SellerPaymentList — kiem tra status tabs dung dung voi PaymentStatus.
DB-F.08  UI: AdminPaymentPage — kiem tra transaction details voi status moi.
DB-F.09  Kiem tra: Payment.method co phu hop voi PaymentMethod type?
         Tat ca UI chon method phai dung PaymentMethod options.
DB-F.10  Kiem tra: PaymentTransaction.method co map dung voi Payment.method?
         Hay la rieng (vi 1 payment co the co nhieu transaction bang nhieu method)?
         => Quyet dinh: PaymentTransaction.method la method cu the cua tung giao dich (co the khac Payment.method).
```

### DB-F Dot 11: invoices, invoice_items (10 buoc)

```
DB-F.11  InvoiceItem type: them `id: string` (hien THIEU), `invoiceId: string`,
         `productId?: string`, `productName?: string`, `sku?: string`, `unit?: string`.
DB-F.12  Invoice type: them `paymentId?: string` (FK payments), `returnId?: string` (FK return_requests cho HD tra hang),
         `currency?: string`, `exchangeRate?: number`.
DB-F.13  Invoice type: them `sentAt?: string`, `sentTo?: string` (email),
         `reminderCount?: number`, `lastReminderAt?: string`.
DB-F.14  Them type InvoiceTemplate (khac EmailTemplate): { id, name, header, footer, logo, companyInfo }.
         => Quyet dinh: KHONG them bang moi. Dung TaxConfig + SystemConfig cho template.
         Ghi chu vao DB doc.
DB-F.15  Service: invoiceSellerApi, invoiceBuyerApi (trong api.ts) —
         kiem tra CRUD, them `sendInvoice(id, email)`, `recordPayment(id, amount)`.
DB-F.16  Service: them `getOverdueInvoices()`, `sendBulkReminder(ids[])`.
DB-F.17  MockData: InvoiceItem them id. Sinh 12+ hoa don voi 2-5 items moi.
DB-F.18  UI: SellerInvoiceListPage, SellerInvoiceDetail — kiem tra InvoiceItem co id.
DB-F.19  UI: BuyerInvoiceListPage, BuyerInvoiceDetail — kiem tra payment link, sent status.
DB-F.20  UI: AdminInvoicePage — kiem tra overdue tracking, reminder count.
```

### DB-F Dot 12: credit_limits, credit_transactions, debit_credit_notes (10 buoc)

```
DB-F.21  CreditLimit type: da day du. Them `reviewedAt?: string`, `reviewNote?: string`,
         `currency?: string`, `interestRate?: number`.
DB-F.22  CreditTransaction type: da day du. Them `invoiceId?: string` (FK),
         `status?: 'Hoan thanh' | 'Dang xu ly'`.
DB-F.23  DebitCreditNote type: da day du. Kiem tra sellerId vs supplierId naming:
         Hien dung `sellerId/sellerName` — nhat quan voi contract/payment?
         => Kiem tra: cac type khac dung supplierId. DOI sellerId => supplierId cho nhat quan.
DB-F.24  DebitCreditItem type: them `id: string` (hien THIEU), `noteId: string`.
DB-F.25  Service: creditApi — kiem tra CRUD, them `adjustLimit`, `getTransactionHistory(creditLimitId)`.
DB-F.26  Service: debitCreditApi — kiem tra create, confirm, reject.
         Them `getByInvoice(invoiceId)`, `confirmBySeller(noteId)`, `confirmByBuyer(noteId)`.
DB-F.27  MockData: DebitCreditItem them id. CreditTransaction them invoiceId.
         Sinh 8+ phieu ghi no/co, 15+ credit transactions.
DB-F.28  UI: SellerCreditPage — kiem tra CreditLimit fields moi (reviewNote, interestRate).
DB-F.29  UI: SellerDebitCreditPage, SellerDebitCreditDetail — kiem tra DebitCreditItem co id.
         Kiem tra doi sellerId => supplierId khong bi loi.
DB-F.30  UI: BuyerCreditSection — kiem tra transaction history voi invoiceId link.
```

---

## ========================================================
## DB-G: AUDIT TYPES — TRA HANG, DANH GIA, KHUYEN MAI (30 buoc | Dot 13–15)
## ========================================================

### DB-G Dot 13: return_requests, return_items, return_images (10 buoc)

```
DB-G.01  ReturnItem type: them `id: string` (hien THIEU), `returnId: string`, `variantId?: string`.
DB-G.02  ReturnRequest type: kiem tra OK. Them `returnNumber: string` (ma tra hang),
         `trackingNumber?: string` (ma van don tra), `receivedAt?: string`,
         `inspectedBy?: string`, `inspectedAt?: string`.
DB-G.03  Them type ReturnImage: { id, returnId, url, caption?, uploadedBy, createdAt }.
         ReturnRequest.images: string[] => GIU cho display. Them API CRUD rieng.
DB-G.04  ReturnStats type: da OK. Them `avgProcessingDays: number` (TB ngay xu ly).
DB-G.05  Service: returnApi — kiem tra accept, reject, refund, getByOrder.
         Them `inspect(returnId, result)`, `uploadImage(returnId, file)`.
DB-G.06  MockData: ReturnItem them id. ReturnRequest them returnNumber, trackingNumber.
         Sinh 8+ yeu cau tra hang.
DB-G.07  UI: SellerReturnListPage, SellerReturnDetail — kiem tra ReturnItem id, returnNumber render.
DB-G.08  UI: BuyerReturnListPage, BuyerReturnDetail — kiem tra tracking, inspection status.
DB-G.09  UI: AdminReportPage — kiem tra return stats voi avgProcessingDays.
DB-G.10  Kiem tra flow: Return => DebitCreditNote => Invoice dieu chinh.
         Dam bao FK lien ket dung (ReturnRequest.id => DebitCreditNote.relatedReturnId?).
         => Them `relatedReturnId?` vao DebitCreditNote.
```

### DB-G Dot 14: product_reviews, review_images, supplier_reviews (10 buoc)

```
DB-G.11  Review type: da day du (194 lines). Kiem tra:
         - `productId` co match voi Product.id format?
         - `orderId` co match voi Order.id format?
         - `helpfulCount` co bi trung voi review_helpful_votes (bang rieng)?
         => Quyet dinh: KHONG tao bang helpful_votes rieng. helpfulCount la counter.
DB-G.12  Them type ReviewImage: { id, reviewId, url, sortOrder }.
         Review.images: string[] => GIU cho display. Them API CRUD rieng.
DB-G.13  SupplierReview type: them `orderId?: string`, `isVerifiedPurchase?: boolean`,
         `images?: string[]`, `status?: 'Hien thi' | 'An' | 'Cho duyet'`.
DB-G.14  Review type: sua loi typo `ReviewTag = 'Chat lung'` => `'Chat luong'`.
DB-G.15  Service: reviewApi — kiem tra CRUD, addSellerReply, toggleHelpful.
         Them `getByProduct(productId, pagination)`, `getByBuyer(buyerId)`.
         Them `reportReview(reviewId, reason)`.
DB-G.16  Service: them `supplierReviewApi` rieng (hoac trong api.ts) —
         { create, getBySupplier, getByBuyer, addSellerReply }.
DB-G.17  MockData: Review kiem tra images format. SupplierReview them orderId, images.
         Sinh 15+ reviews, 5+ supplier reviews.
DB-G.18  UI: BuyerReviewsPage — kiem tra create review co orderId, isVerifiedPurchase.
DB-G.19  UI: SellerReviewsPage — kiem tra sentiment analysis dung dung fields.
DB-G.20  UI: ReviewManagement (admin) — kiem tra moderate, approve/reject, report handling.
```

### DB-G Dot 15: promotions, volume_discounts (10 buoc)

```
DB-G.21  Promotion type: da day du. Them `termsAndConditions?: string`,
         `imageUrl?: string`, `bannerUrl?: string`, `priority?: number`.
DB-G.22  VolumeDiscount type: them `id: string` (hien THIEU), `promotionId?: string`,
         `productId: string`, `isActive: boolean`.
DB-G.23  Them type PromotionProduct (bang N-N): { id, promotionId, productId }.
         Promotion.applicableProducts: string[] => GIU. Them API quan ly rieng.
DB-G.24  Them type PromotionCategory (bang N-N): { id, promotionId, categoryId }.
         Promotion.applicableCategories: string[] => GIU. Them API quan ly rieng.
DB-G.25  Service: promotionApi — kiem tra CRUD, them `validate(code, cartItems)`,
         `getActiveForProduct(productId)`, `getActiveForCategory(categoryId)`.
DB-G.26  Service: volumeDiscountApi (moi hoac trong promotionApi) —
         { getByProduct, create, update, delete }.
DB-G.27  MockData: Promotion them imageUrl, priority. VolumeDiscount them id, productId.
         Sinh 8+ KM, 10+ volume discounts.
DB-G.28  UI: SellerPromotionList — kiem tra create/edit KM dung field moi (imageUrl, priority).
DB-G.29  UI: BuyerPromotionPage — kiem tra display KM cards voi imageUrl, bannerUrl.
DB-G.30  UI: AdminPromotionPage — kiem tra quan ly KM, validate, deactivate.
```

---

## ========================================================
## DB-H: AUDIT TYPES — PHE DUYET, PR, GRN, NGAN SACH (30 buoc | Dot 16–18)
## ========================================================

### DB-H Dot 16: approval_requests, approval_rules (10 buoc)

```
DB-H.01  ApprovalRequest type: da day du. Them `priority?: 'Thuong' | 'Gap'`,
         `dueDate?: string`, `escalatedTo?: string`, `escalatedAt?: string`.
DB-H.02  ApprovalRule type: da day du. Them `name: string` (ten quy tac),
         `description?: string`, `maxAmount?: number`, `minAmount?: number`.
DB-H.03  Them type ApprovalStep (cho multi-level approval):
         { id, requestId, stepOrder, approverId, approverName, status, note, respondedAt }.
         => DE XUAT them bang `approval_steps` vao DB doc.
DB-H.04  Service: approvalApi — kiem tra create, approve, reject, getByApprover.
         Them `escalate(requestId, toUserId)`, `getHistory(requestId)`.
DB-H.05  MockData: ApprovalRequest them priority. ApprovalRule them name.
         Sinh 10+ requests, 5+ rules.
DB-H.06  UI: SellerApprovalListPage — kiem tra priority badge, dueDate render, escalation.
DB-H.07  UI: SellerApprovalRulesPage — kiem tra rule name, description fields.
DB-H.08  Kiem tra flow: Order.totalAmount > ApprovalRule.threshold => auto tao ApprovalRequest.
         Dam bao service logic nhat quan.
DB-H.09  MockData: tao mock approval steps (3 cap: NV -> QL -> GD).
DB-H.10  UI: ApprovalListPage (detail dialog) — them multi-step approval visualization
         voi ApprovalStep data (thay vi hardcode 3 buoc).
```

### DB-H Dot 17: purchase_requisitions, pr_items (10 buoc)

```
DB-H.11  PRItem type: them `id: string` (hien THIEU), `prId: string`,
         `categoryId?: string`, `suggestedSupplierId?: string`.
DB-H.12  PurchaseRequisition type: them `budgetId?: string` (FK budget_plans),
         `expectedDate?: string`, `deliveryAddress?: string`.
DB-H.13  Them type PRApprovalHistory: { id, prId, action, by, byName, note, createdAt }.
         => Dung chung ApprovalRequest? Hay tach rieng?
         => Quyet dinh: PR tao ApprovalRequest (type='PR'). Them ApprovalType 'PR'.
DB-H.14  Service: prApi — kiem tra CRUD, submit, approve, reject, linkToOrder.
         Them `addItem(prId, item)`, `removeItem(prId, itemId)`.
DB-H.15  MockData: PRItem them id, prId, categoryId. Sinh 8+ PR voi 2-5 items.
DB-H.16  UI: BuyerPRListPage, BuyerPRDetail — kiem tra PRItem CRUD voi id moi.
DB-H.17  UI: BuyerPRDetail — kiem tra link to budget (budgetId display).
DB-H.18  Types: them 'PR' vao ApprovalType union type.
DB-H.19  Kiem tra flow: PR => Approval => RFQ hoac Order.
         Dam bao linkedRFQId, linkedOrderId hoat dong.
DB-H.20  MockData: them 3 PR linked to orders, 2 PR linked to RFQs.
```

### DB-H Dot 18: goods_received_notes, grn_items, budget_plans (10 buoc)

```
DB-H.21  GRNItem type: them `id: string` (hien THIEU), `grnId: string`,
         `variantId?: string`, `batchNumber?: string`, `expiryDate?: string`.
DB-H.22  GoodsReceivedNote type: them `warehouseId?: string` (kho nhan),
         `inspectedBy?: string`, `inspectedAt?: string`.
DB-H.23  Them type GRNImage: { id, grnId, url, caption?, uploadedBy, createdAt }.
         GRN.imageUrls: string[] => GIU. Them API CRUD rieng.
DB-H.24  BudgetAllocation type: them `createdAt`, `updatedAt`.
         Kiem tra BudgetPlan.allocations[] co dung shape.
DB-H.25  BudgetTransaction type: them `prId?: string` (FK purchase_requisitions),
         `invoiceId?: string` (FK invoices).
DB-H.26  BudgetPlan type: them `currency?: string`, `description?: string`.
DB-H.27  Service: grnApi — kiem tra CRUD, confirm, reportIssue, linkToReturn.
         Them `addItem(grnId, item)`, `uploadImage(grnId, file)`.
DB-H.28  Service: budgetApi — kiem tra CRUD allocations, transactions.
         Them `checkBudget(allocationId, amount)` => true/false.
DB-H.29  MockData: GRNItem them id, grnId, batchNumber. BudgetTransaction them prId.
         Sinh 6+ GRN, 10+ budget transactions.
DB-H.30  UI: BuyerGRNListPage, BuyerGRNDetail, BuyerBudgetPage — kiem tra fields moi.
```

---

## ========================================================
## DB-I: AUDIT TYPES — DAU GIA, THOA THUAN GIA, SLA, BAO HANH (30 buoc | Dot 19–21)
## ========================================================

### DB-I Dot 19: reverse_auctions, auction_bids (10 buoc)

```
DB-I.01  AuctionItem type: da co id ✓. Them `auctionId: string`, `categoryId?: string`.
DB-I.02  ReverseAuction type: them `minBidDecrement?: number` (muc giam toi thieu),
         `depositAmount?: number`, `rules?: string`, `currency?: string`.
DB-I.03  Them type AuctionInvitedSupplier (bang N-N): { id, auctionId, supplierId, invitedAt, respondedAt, response }.
         Hien dung invitedSupplierIds: string[] — GIU, them API rieng.
DB-I.04  AuctionBidItem type: them `id: string` (hien THIEU), `bidId: string`.
DB-I.05  AuctionBid type: them `withdrawnAt?: string`, `isWithdrawn?: boolean`.
DB-I.06  Service: auctionApi — kiem tra CRUD, bid, selectWinner, extend.
         Them `inviteSupplier(auctionId, supplierId)`, `withdrawBid(bidId)`.
DB-I.07  MockData: AuctionBidItem them id. AuctionItem them auctionId.
         Sinh 5+ phien, 15+ bids.
DB-I.08  UI: BuyerAuctionListPage, BuyerAuctionDetail — kiem tra bid items co id.
DB-I.09  UI: SellerAuctionPage, SellerAuctionDetail — kiem tra withdraw, invited list.
DB-I.10  Kiem tra flow: Auction => SelectWinner => Order. Dam bao orderId duoc link.
```

### DB-I Dot 20: price_agreements, agreement_orders (10 buoc)

```
DB-I.11  PriceAgreementItem type: da co id ✓. Them `currentUsedQty?: number`,
         `lastOrderDate?: string`.
DB-I.12  PriceAgreement type: them `currency?: string`, `autoRenew?: boolean`,
         `renewalTerms?: string`, `terminationClause?: string`.
DB-I.13  AgreementOrder type: da OK. Them `status?: string`, `itemCount?: number`.
DB-I.14  Service: priceAgreementApi — kiem tra CRUD, approve, expire, renew.
         Them `getLinkedOrders(agreementId)`, `checkPrice(agreementId, productId, qty)`.
DB-I.15  MockData: PriceAgreementItem them currentUsedQty. AgreementOrder them status.
         Sinh 5+ thoa thuan, 10+ linked orders.
DB-I.16  UI: BuyerPriceAgreementPage, BuyerPriceAgreementDetail — kiem tra usage tracking.
DB-I.17  UI: SellerPriceAgreementPage, SellerPriceAgreementDetail — kiem tra renew, terminate.
DB-I.18  Kiem tra: PriceAgreement.sellerId vs supplierId naming.
         => Hien dung sellerId — DOI thanh supplierId cho nhat quan? Hay giu sellerId?
         => Quyet dinh: PriceAgreement dung sellerId vi la goc nhin agreement (seller = doi tac ban).
         NHUNG trong types khac dung supplierId. GHI CHU ro trong code: "sellerId = supplierId in this context".
DB-I.19  Kiem tra: PriceAgreement items co overlap voi Promotion?
         => Khac nhau: PA la gia cam ket 1-1, Promotion la giam gia cong khai. OK.
DB-I.20  UI: Kiem tra cart/checkout apply PA price khi co agreement active.
```

### DB-I Dot 21: sla_definitions, sla_metrics, warranties, warranty_claims (10 buoc)

```
DB-I.21  SLADefinition type: da day du. Them `contractId?: string` (FK contracts).
DB-I.22  SLAMetricDef type: da co id ✓. Them `slaId: string`.
DB-I.23  SLAReport type: them `slaName?: string` (denormalized), `reviewedBy?: string`.
DB-I.24  SLAReportMetric type: them `id: string` (hien THIEU), `reportId: string`.
DB-I.25  Warranty type: them `serialNumber?: string`, `purchaseDate?: string`,
         `warrantyType?: 'Tieu chuan' | 'Mo rong' | 'VIP'`.
DB-I.26  WarrantyClaim type: them `warrantyNumber?: string` (denormalized),
         `estimatedResolutionDate?: string`, `actualCost?: number`.
DB-I.27  Them type WarrantyClaimImage: { id, claimId, url, caption?, createdAt }.
         WarrantyClaim.imageUrls: string[] => GIU. Them API CRUD rieng.
DB-I.28  Service: slaApi, warrantyApi — kiem tra CRUD day du.
         slaApi them `generateReport(slaId, period)`.
         warrantyApi them `submitClaim(claim)`, `resolveClaim(claimId, resolution)`.
DB-I.29  MockData: SLAReportMetric them id. Warranty them serialNumber.
         WarrantyClaim them estimatedResolutionDate. Sinh 8+ warranties, 5+ claims.
DB-I.30  UI: SellerSLAPage, SellerSLADetail, BuyerWarrantyPage, SellerWarrantyPage —
         kiem tra fields moi render dung.
```

---

## ========================================================
## DB-J: AUDIT TYPES — LOYALTY, DOCS, INTEGRATION, SYSTEM (40 buoc | Dot 22–25)
## ========================================================

### DB-J Dot 22: loyalty, documents (10 buoc)

```
DB-J.01  LoyaltyProgram type: them `rules?: string`, `startDate?: string`, `endDate?: string`,
         `isActive: boolean`. Hien thieu truong quan ly chuong trinh.
DB-J.02  LoyaltyTransaction type: them `expiresAt?: string`, `referenceType?: string`
         (loai giao dich: 'Order' | 'Reward' | 'Bonus' | 'Manual').
DB-J.03  LoyaltyReward type: them `id` da co ✓. Them `tier?: LoyaltyTier` (hang toi thieu),
         `expiresAt?: string`, `redeemedCount?: number`.
DB-J.04  Document type: da day du. Them `accessLevel?: 'Cong khai' | 'Noi bo' | 'Mat'`,
         `expiresAt?: string`, `viewCount?: number`.
DB-J.05  Them type DocumentTag (bang N-N): { id, documentId, tag }.
         Document.tags: string[] => GIU. Tag don gian.
DB-J.06  Service: loyaltyApi — kiem tra CRUD, earnPoints, redeemReward, getTiers.
         Them `getTransactionsByProgram(programId)`, `redeemReward(rewardId)`.
DB-J.07  Service: documentApi — kiem tra CRUD, upload, download, search.
         Them `getByEntity(entityType, entityId)`, `addTag(docId, tag)`.
DB-J.08  MockData: LoyaltyReward them tier. Document them accessLevel.
         Sinh 5+ rewards, 10+ documents.
DB-J.09  UI: BuyerLoyaltyPage — kiem tra tier display, reward redeem, transaction history.
DB-J.10  UI: DocumentCenterPage — kiem tra access level badge, expiry, view count.
```

### DB-J Dot 23: integrations, webhooks, api_keys (10 buoc)

```
DB-J.11  Integration type: da day du. Them `version?: string`, `documentation?: string`,
         `supportUrl?: string`, `maxRetries?: number`.
DB-J.12  WebhookEndpoint type: da day du. Them `retryCount?: number`,
         `failedCount?: number`, `headers?: Record<string, string>`.
DB-J.13  APIKey type: da day du. Them `rateLimit?: number` (calls/min),
         `allowedIps?: string[]`, `environment?: 'production' | 'sandbox'`.
DB-J.14  Them type WebhookLog: { id, endpointId, event, payload, responseCode, responseBody, createdAt }.
         => DE XUAT them bang `webhook_logs` vao DB doc.
DB-J.15  Them type APIKeyUsage: { id, apiKeyId, endpoint, method, statusCode, responseTime, createdAt }.
         => DE XUAT them bang `api_key_usage` vao DB doc.
DB-J.16  Service: integrationApi — kiem tra CRUD, connect, disconnect, sync.
         Them `testConnection(integrationId)`, `getLastSync(integrationId)`.
DB-J.17  Service: them `webhookApi` (moi hoac trong integrationApi) —
         { create, update, delete, test, getLogs }.
DB-J.18  MockData: Integration them version. WebhookEndpoint them retryCount.
         APIKey them rateLimit. Sinh 5+ integrations, 3+ webhooks, 3+ API keys.
DB-J.19  UI: IntegrationHubPage — kiem tra connection test, sync status, webhook logs.
DB-J.20  Kiem tra: IntegrationHubPage co hien thi API key usage khong?
         => Them section "Su dung API" voi chart usage.
```

### DB-J Dot 24: reports, notifications, activity_logs (10 buoc)

```
DB-J.21  ReportDefinition type: da day du. Them `lastRunAt?: string`,
         `scheduleFrequency?: 'manual' | 'daily' | 'weekly' | 'monthly'`,
         `recipientEmails?: string[]`.
DB-J.22  ReportColumn type: them `id: string` (hien THIEU khi la bang rieng).
         ReportBuilderFilter type: them `id: string`.
DB-J.23  AppNotification type: da day du. Them `entityType?: string`, `entityId?: string`
         (lien ket den doi tuong cu the: order, rfq, contract, ...).
DB-J.24  ActivityLog type: da day du. Them `sessionId?: string`, `duration?: number` (ms),
         `changes?: Record<string, { old: unknown; new: unknown }>` (diff).
DB-J.25  Service: reportBuilderApi — kiem tra CRUD, run, schedule, export.
         Them `scheduleReport(reportId, frequency, emails)`.
DB-J.26  Service: notificationApi (trong api.ts) — kiem tra markAsRead, markAllRead, getUnread.
         Them `getByEntity(entityType, entityId)`.
DB-J.27  Service: activityLogApi — kiem tra getAll, getByUser, getByEntity.
         Them `getChanges(logId)` (xem diff chi tiet).
DB-J.28  MockData: ReportDefinition them scheduleFrequency. AppNotification them entityType/entityId.
         ActivityLog them changes (2-3 mau diff). Sinh 20+ logs.
DB-J.29  UI: ReportBuilderPage — kiem tra schedule, recipients.
DB-J.30  UI: NotificationCenterPage — kiem tra entity link (click notification => navigate to entity).
```

### DB-J Dot 25: system_configs, platform_fees, email_templates, banners, tax (10 buoc)

```
DB-J.31  SystemConfig type: them `logoUrl?: string`, `faviconUrl?: string`,
         `primaryColor?: string`, `supportEmail?: string`, `supportPhone?: string`.
DB-J.32  PlatformFee type: da day du. Them `name: string`, `description?: string`,
         `isActive: boolean`, `createdAt: string`.
DB-J.33  EmailTemplate type: da day du. Them `category?: string` (nhom mau: Don hang, Thanh toan, ...),
         `previewHtml?: string`, `updatedAt: string`.
DB-J.34  BannerConfig type: da day du. Them `targetPage?: string[]` (hien tren trang nao),
         `targetRole?: UserRole[]` (hien cho role nao), `clickCount?: number`.
DB-J.35  TaxConfig type: them `id: string`, `isActive: boolean`, `updatedAt: string`.
         Hien TaxConfig khong co id — can de CRUD trong SystemSettings.
DB-J.36  SEOConfig type: them `id: string`, `updatedAt: string`.
DB-J.37  MaintenanceConfig type: them `id: string`, `updatedAt: string`.
DB-J.38  Service: adminApi / systemSettingsApi — kiem tra CRUD cho tat ca config types.
         Them `updateTaxConfig(config)`, `updateSEOConfig(config)`, `updateBannerConfig(config)`.
DB-J.39  MockData: SystemConfig them logoUrl. BannerConfig them targetPage, targetRole.
         EmailTemplate them category. TaxConfig them id. Sinh day du config data.
DB-J.40  UI: SystemSettings — kiem tra tat ca tab/section dung dung type moi.
         Dam bao save/load config hoat dong.
```

---

## ========================================================
## PHAN BO SỨNG: CẬP NHẬT DB DOC (20 buoc | Dot 26–27)
## ========================================================

### Dot 26: Cap nhat docs/collections.md — them bang moi (10 buoc)

```
DB-K.01  Them bang `order_status_history` (tu DB-C.05): id, order_id, from_status, to_status, changed_by, note, created_at.
DB-K.02  Them bang `contract_history` (tu DB-D.14): id, contract_id, action, changed_by, details, created_at.
DB-K.03  Them bang `payment_reminders` (tu DB-F.03): id, payment_id, sent_at, channel, message, sent_by.
DB-K.04  Them bang `approval_steps` (tu DB-H.03): id, request_id, step_order, approver_id, status, note, responded_at.
DB-K.05  Them bang `webhook_logs` (tu DB-J.14): id, endpoint_id, event, payload, response_code, created_at.
DB-K.06  Them bang `api_key_usage` (tu DB-J.15): id, api_key_id, endpoint, method, status_code, response_time, created_at.
DB-K.07  Cap nhat bang `users`: them company_id (FK buyer_companies), supplier_id (FK suppliers),
         last_login_at, email_verified, phone_verified, language, timezone.
DB-K.08  Cap nhat bang `products`: them brand_name, origin, weight, dimensions,
         warranty_months, view_count, sold_count, featured, is_active.
DB-K.09  Cap nhat bang `orders`: them order_type, rfq_id, contract_id, template_id,
         discount_amount, promotion_id, cancel_reason, expected_delivery_date.
DB-K.10  Tong hop: cap nhat so luong bang 103 => 109 bang. Cap nhat header doc.
```

### Dot 27: Cap nhat docs/collections.md — them cot cho bang hien co (10 buoc)

```
DB-K.11  Cap nhat `categories`: them image_url, sort_order, level, path, meta_title, meta_description.
DB-K.12  Cap nhat `product_variants`: them barcode, weight, dimensions, images, is_active, cost_price.
DB-K.13  Cap nhat `invoices`: them payment_id, return_id, currency, sent_at, reminder_count.
DB-K.14  Cap nhat `shipments`: them insurance_amount, return_shipment, notes, updated_at.
DB-K.15  Cap nhat `shipment_events`: dam bao co id (PK), them source field.
DB-K.16  Cap nhat `promotions`: them terms_and_conditions, image_url, banner_url, priority.
DB-K.17  Cap nhat `warranties`: them serial_number, warranty_type, purchase_date.
DB-K.18  Cap nhat `credit_limits`: them review_note, interest_rate.
DB-K.19  Cap nhat `debit_credit_notes`: doi seller_id => supplier_id cho nhat quan.
         Them related_return_id.
DB-K.20  Cap nhat `reverse_auctions`: them min_bid_decrement, deposit_amount, rules.
```

---

## ========================================================
## KIEM TRA TONG THE & NAMING CONVENTION (20 buoc | Dot 28–29)
## ========================================================

### Dot 28: Kiem tra FK consistency (10 buoc)

```
DB-L.01  Kiem tra: tat ca entity co `supplierId` dung nhat quan (khong mix `sellerId`).
         Danh sach can kiem tra: Order, Payment, Invoice, Shipment, Contract, RFQ, Quotation,
         Review, StockMovement, Warehouse, StaffMember, Promotion, CreditLimit.
         => DebitCreditNote.sellerId, PriceAgreement.sellerId, AuctionBid.sellerId — can review.
DB-L.02  Kiem tra: tat ca entity co `buyerId` dung nhat quan.
         Danh sach: Order, Payment, Invoice, RFQ, Contract, ReturnRequest, CreditLimit,
         Review, WarrantyClaim, BuyerTeamMember, PurchaseRequisition, BudgetPlan.
DB-L.03  Kiem tra: tat ca "line item" types co `id` field:
         OrderItem ✓, RFQItem ?, QuotationItem ?, ContractItem ?, InvoiceItem ?,
         DebitCreditItem ?, ReturnItem ?, PRItem ?, GRNItem ?, TransferItem ?,
         AuctionBidItem ?, OrderTemplateItem ?, BudgetAllocation ✓.
         => Liet ke cac item THIEU id — add trong cac dot truoc.
DB-L.04  Kiem tra: tat ca entity co `createdAt` va `updatedAt`:
         Nhieu entity chi co createdAt — them updatedAt cho nhung entity co edit.
DB-L.05  Kiem tra: format date nhat quan — tat ca dung ISO 8601 string (YYYY-MM-DDTHH:mm:ss).
         Mock data phai sinh date dung format.
DB-L.06  Kiem tra: format price/amount nhat quan — tat ca dung number (khong phai string).
         UI format bang Intl.NumberFormat, khong luu formatted string.
DB-L.07  Kiem tra: naming convention cho status fields:
         status (main), isActive (soft delete), isVerified, isDefault, isFeatured...
         Khong dung `active` (thieu `is`), khong dung `verified` (thieu `is`).
DB-L.08  Kiem tra: naming convention cho enum types:
         Tat ca dung tieng Viet co dau (OrderStatus, InvoiceStatus, ...).
         Khong mix tieng Anh trong status values.
DB-L.09  Kiem tra: ID format — tat ca entity ID nen co prefix:
         user-xxx, prod-xxx, ord-xxx, inv-xxx, ship-xxx, ...
         Hien mock data co mix format — can chuan hoa.
DB-L.10  Kiem tra: khong co circular dependency trong types/index.ts.
         Import/export clean. Moi type co doc comment.
```

### Dot 29: Kiem tra service layer consistency (10 buoc)

```
DB-L.11  Kiem tra: moi entity co day du 5 API co ban: getAll, getById, create, update, delete.
         Liet ke entity thieu — bo sung.
DB-L.12  Kiem tra: moi list API co pagination + sort + filter params.
         Liet ke API thieu pagination — bo sung.
DB-L.13  Kiem tra: moi service co error handling nhat quan (try/catch, toast.error).
DB-L.14  Kiem tra: moi service co delay simulation nhat quan (50-200ms) de gia lap network.
DB-L.15  Kiem tra: mock data khong bi duplicate ID giua cac entity.
         Moi entity dung prefix rieng.
DB-L.16  Kiem tra: mock data co du lien ket (orderId trong payment tro toi order that).
         Cross-reference FK: payment.orderId must exist in orders[].
DB-L.17  Kiem tra: tat ca service files co consistent export pattern:
         export const xxxApi = { getAll, getById, create, update, delete, ... }.
DB-L.18  Kiem tra: api.ts da vuot 2911 dong — can tach nhung api nao con trong do?
         Liet ke cac api nen tach ra file rieng.
DB-L.19  Kiem tra: tat ca service import types tu '../../types' (khong inline type).
DB-L.20  Kiem tra: khong co dead code trong service files (unused functions, commented blocks).
```

---

## ========================================================
## KIEM TRA UI COMPONENTS (20 buoc | Dot 30–31)
## ========================================================

### Dot 30: Kiem tra Buyer pages (10 buoc)

```
DB-M.01  BuyerDashboardPage: stats dung dung BuyerDashboardStats type?
         API calls khop voi service methods?
DB-M.02  ProductListPage, ProductDetailPage: Product type fields deu duoc render?
         Price, stock, variants, specifications hien thi dung?
DB-M.03  OrderListPage, OrderDetailPage, OrderConfirmationPage:
         Order type fields (moi: orderType, discountAmount) duoc render?
DB-M.04  BuyerRFQCreatePage, BuyerRFQDetailPage:
         RFQItem.id duoc dung khi CRUD items? Attachments co API CRUD?
DB-M.05  BuyerContractList, BuyerContractDetail:
         ContractItem.id duoc dung? Milestones CRUD voi contractId?
DB-M.06  BuyerInvoiceListPage, BuyerInvoiceDetail:
         InvoiceItem.id? Payment link? Overdue highlight?
DB-M.07  BuyerPaymentList, BuyerPaymentDetail:
         PaymentTransaction.status render? Late fee display?
DB-M.08  BuyerShipmentList, BuyerShipmentDetail:
         ShipmentEvent.id? Tracking events render?
DB-M.09  BuyerReturnListPage, BuyerReturnDetail, BuyerReviewsPage, BuyerWarrantyPage:
         ReturnItem.id? Review voi orderId? WarrantyClaim.estimatedResolutionDate?
DB-M.10  BuyerBudgetPage, BuyerPRListPage, BuyerGRNListPage, BuyerLoyaltyPage:
         Cac type moi (PRItem.id, GRNItem.id, LoyaltyReward.tier) duoc render?
```

### Dot 31: Kiem tra Seller + Admin pages (10 buoc)

```
DB-M.11  SellerDashboard: stats API khop?
DB-M.12  SellerProductList, SellerProductForm:
         Product fields moi (brandName, origin, viewCount) trong form?
         ProductVariant moi (barcode, costPrice) trong form?
DB-M.13  SellerOrderList, SellerOrderDetail:
         Order.orderType render? Status history?
DB-M.14  SellerRFQList, SellerRFQDetail, SellerContractList, SellerContractDetail:
         RFQItem.id, ContractItem.id trong CRUD?
DB-M.15  SellerWarehouse (5 tabs):
         InventoryItem.batchNumber? StockAlert.acknowledgedAt?
         TransferItem.id?
DB-M.16  SellerShipmentList, SellerInvoiceListPage, SellerPaymentList:
         ShipmentEvent.id? InvoiceItem.id? Payment lateFee?
DB-M.17  SellerStaffList, SellerApprovalListPage, SellerActivityPage:
         StaffMember fields OK? ApprovalRequest.priority? ActivityLog.changes?
DB-M.18  SellerReports, SellerReviewsPage, SellerReturnListPage, SellerWarrantyPage:
         Review.isVerifiedPurchase? ReturnItem.id? WarrantyClaim fields?
DB-M.19  Admin pages (Dashboard, UserManagement, CategoryManagement, ProductApproval,
         OrderOverview, AdminSupplierPage, AdminInvoicePage, AdminPaymentPage, etc.):
         Tat ca dung dung type moi? Admin-specific fields (approve, reject, moderate)?
DB-M.20  SystemSettings: SystemConfig.logoUrl? TaxConfig.id? PlatformFee.name?
         BannerConfig.targetPage? EmailTemplate.category?
```

---

# ============================================================
# TONG KET KE HOACH RA SOAT
# ============================================================
#
# Tong: ~310 buoc | 31 dot | 10 giai doan
#
# DB-A:  Nguoi dung & Xac thuc           — 10 buoc | Dot 1
# DB-B:  San pham & Danh muc             — 20 buoc | Dot 2-3
# DB-C:  Don hang & Gio hang             — 20 buoc | Dot 4-5
# DB-D:  RFQ, Bao gia, Hop dong         — 20 buoc | Dot 6-7
# DB-E:  Kho hang & Van chuyen          — 20 buoc | Dot 8-9
# DB-F:  Thanh toan, Hoa don, Cong no   — 30 buoc | Dot 10-12
# DB-G:  Tra hang, Danh gia, Khuyen mai — 30 buoc | Dot 13-15
# DB-H:  Phe duyet, PR, GRN, Ngan sach  — 30 buoc | Dot 16-18
# DB-I:  Dau gia, Thoa thuan gia, SLA   — 30 buoc | Dot 19-21
# DB-J:  Loyalty, Docs, Integration, System — 40 buoc | Dot 22-25
# DB-K:  Cap nhat DB doc                 — 20 buoc | Dot 26-27
# DB-L:  Naming convention & Consistency — 20 buoc | Dot 28-29
# DB-M:  Kiem tra UI components          — 20 buoc | Dot 30-31
#
# DE XUAT THEM VAO DB (6 bang moi):
#   - order_status_history
#   - contract_history
#   - payment_reminders
#   - approval_steps
#   - webhook_logs
#   - api_key_usage
#
# => Tong bang DB: 103 => 109 bang
#
# THU TU UU TIEN:
#   1. DB-L (Dot 28-29): Kiem tra naming convention TRUOC de co quy tac chuan
#   2. DB-A → DB-J (Dot 1-25): Ra soat tuan tu theo domain
#   3. DB-K (Dot 26-27): Cap nhat DB doc SAU khi da xac dinh het thay doi
#   4. DB-M (Dot 30-31): Kiem tra UI SAU CUNG de dam bao tat ca thay doi da apply
#
# NGUYEN TAC THUC HIEN:
#   - Moi dot ~10 buoc, 1 prompt "Tiep tuc"
#   - Uu tien sua types/index.ts TRUOC, roi service, roi mockData, roi UI
#   - Khong pha vo giao dien — chi bo sung fields, khong doi ten fields da dung
#   - Neu doi ten field (VD: sellerId => supplierId), phai update TAT CA references
#   - Moi file khong qua 2000 dong — tach file neu can
#   - Giu backward compatible: field moi la optional (?)
#   - Test: sau moi dot, dam bao app khong bi loi TypeScript
#
# ============================================================
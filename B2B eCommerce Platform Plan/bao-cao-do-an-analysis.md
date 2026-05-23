# Phan tich tai lieu de viet bao cao do an

Nguon phan tich sau khi chot pham vi:

- Mau bao cao PDF: `C:\Users\nguye\Downloads\Bui Quang Huy_211200919_Do an tot nghiep.pdf` (da nhan file, nhung moi truong hien tai chua co cong cu trich text PDF de doc truc tiep muc luc/noi dung).
- Noi dung nghiep vu/chuc nang: chi tap trung vao `B2B eCommerce Platform Plan/ba-docs/`.
- Cong nghe va hien trang cai dat frontend: mo ta theo source `B2B eCommerce Platform Plan/`.
- Cong nghe va hien trang cai dat backend: mo ta theo source `be/`.

## 1. Ket luan nhanh

Co the lam bao cao do an dua tren tai lieu hien co. Noi dung BA nen lay theo `ba-docs` va dinh vi de tai la:

**Xay dung website thuong mai dien tu B2C ban dien thoai va phu kien cong nghe CELLPHONES**

Khong nen ghi la B2B o tieu de bao cao chinh, vi `ba-docs/00-tong-quan.md` va backend implementation hien tai deu xoay quanh CELLPHONES B2C. Cac tai lieu ngoai `ba-docs` chi dung de mo ta cong nghe/source, khong dung lam can cu nghiep vu chinh.

## 2. Pham vi he thong nen trinh bay

### Doi tuong su dung

- Khach hang: xem san pham, tim kiem/loc, gio hang, dat hang, thanh toan, theo doi don hang, tra hang, bao hanh, trade-in, loyalty, thong bao.
- Quan tri vien: quan ly danh muc, san pham, bien the, hinh anh, don hang, thanh toan, hoa don, van chuyen, ton kho, khuyen mai, bao cao, cau hinh.
- Nhan vien: ho tro van hanh theo phan quyen. Phan RBAC dang co trong tai lieu BA nhung backend hien tai con defer.

### Module chinh

- Xac thuc va nguoi dung.
- Catalog: danh muc, san pham, bien the, hinh anh, thong so dien thoai.
- Gio hang va dat hang.
- Khuyen mai.
- Thanh toan, hoa don, van chuyen.
- Hau mai: doi tra, bao hanh, thu cu doi moi, kiem tra IMEI.
- Loyalty va notification.
- Admin dashboard, reports, settings, staff, branches, inventory.
- Error handling va API response contract.

## 3. Cong nghe nen dua vao bao cao theo source FE/BE

### Frontend

Lay theo source frontend trong `B2B eCommerce Platform Plan/package.json` va cau truc `src/`:

- React 18.3.1.
- TypeScript.
- Vite 6.3.5.
- Tailwind CSS 4.1.12.
- React Router 7.13.0.
- Radix/shadcn UI primitives.
- lucide-react, Recharts, Sonner, react-hook-form.
- Material UI 7.3.5 duoc cai dat bo tro.
- Framer Motion/Motion dung cho hieu ung giao dien.

Mo ta source FE:

- Thu muc `src/app/` la vung chinh cua ung dung.
- `src/app/components/` chua cac man hinh va component dung chung.
- `src/app/services/` la service layer goi API/mock API.
- `src/app/context/` quan ly state dung chung nhu auth, cart, wishlist, notification.
- `src/app/types/` chua type/interface TypeScript.
- `src/styles/` chua style, theme, Tailwind/CSS variables.
- Build bang Vite, script `npm run dev` de chay local va `npm run build` de build production.

### Backend

Lay theo source backend trong `be/pom.xml`, `be/README.md`, `be/src/main/java`, `be/src/main/resources`:

- Java 21.
- Spring Boot 4.0.6.
- Spring Web.
- Spring Data JPA.
- Bean Validation.
- PostgreSQL 15.
- Flyway migration.
- Springdoc OpenAPI/Swagger UI.
- Docker Compose cho PostgreSQL.

Mo ta source BE:

- Package goc: `com.b2b.ecommerce`.
- Cac module backend duoc tach theo domain: `auth`, `catalog`, `cart`, `order`, `promotion`, `aftersales`, `loyalty`, `notification`, `admin`, `store`.
- Tang controller nhan request REST API.
- Tang service xu ly nghiep vu va dieu phoi transaction.
- Tang repository dung Spring Data JPA de thao tac PostgreSQL.
- DTO/request/response dung de tach API contract khoi entity noi bo.
- `common` gom response chuan, error code, exception va global exception handler.
- `config` gom CORS, OpenAPI, web config va migration config.
- Migration CSDL nam trong `be/src/main/resources/db/migration`.

Luu y: `ba-docs/00-tong-quan.md` de xuat Spring Boot 3.x va Java 17+, nhung source hien tai dung Java 21 va Spring Boot 4.0.6. Bao cao phan cong nghe nen ghi theo source thuc te.

## 4. Cau truc bao cao de xuat

### Phan mo dau

1. Ly do chon de tai.
2. Muc tieu de tai.
3. Doi tuong va pham vi nghien cuu.
4. Phuong phap thuc hien.
5. Ket cau bao cao.

Noi dung can nhan manh: nhu cau mua sam dien thoai/phu kien truc tuyen, can quan ly catalog lon, don hang, thanh toan, hau mai va loyalty tren mot nen tang thong nhat.

### Chuong 1: Tong quan de tai

Nguon: `ba-docs/00-tong-quan.md`, `Y tuong website ban hang.md`.

Noi dung:

- Gioi thieu CELLPHONES B2C eCommerce Platform.
- Bai toan can giai quyet.
- Doi tuong su dung.
- Pham vi chuc nang storefront va admin portal.
- Gia tri mang lai: tang trai nghiem mua hang, ho tro quyet dinh mua, quan ly van hanh, tang do tin cay sau ban.

### Chuong 2: Co so ly thuyet va cong nghe su dung

Nguon: source FE `B2B eCommerce Platform Plan/package.json`, `B2B eCommerce Platform Plan/src/`, source BE `be/pom.xml`, `be/src/`.

Noi dung:

- Kien truc client-server va REST API.
- React SPA, component-based UI, routing.
- Spring Boot REST API, controller/service/repository.
- PostgreSQL va thiet ke quan he.
- JPA, Flyway.
- OpenAPI/Swagger.
- JSON response, pagination, validation, error handling.

### Chuong 3: Phan tich va dac ta yeu cau

Nguon: chi lay tu `ba-docs/00-tong-quan.md`, `01-domain-entities.md`, `10-business-rules.md`, `11-rbac-security.md`.

Noi dung:

- Yeu cau chuc nang theo nhom nguoi dung.
- Yeu cau phi chuc nang: bao mat, hieu nang, tinh mo rong, de bao tri.
- Use case tong quat:
  - Dang ky/dang nhap.
  - Xem va tim kiem san pham.
  - Quan ly gio hang.
  - Dat hang va thanh toan.
  - Theo doi don hang.
  - Doi tra/bao hanh/trade-in.
  - Quan tri san pham, don hang, ton kho, bao cao.
- Business rules:
  - Trang thai don hang.
  - Trang thai thanh toan.
  - Quy tac huy don.
  - Quy tac ton kho.
  - Quy tac khuyen mai.
  - Quy tac tich diem loyalty.

### Chuong 4: Thiet ke he thong

Nguon nghiep vu va database: `ba-docs/00-tong-quan.md`, `01-domain-entities.md`, `02-database-design.md`.

Nguon cong nghe/implementation: source FE va BE thuc te.

Noi dung:

- Kien truc tong the:
  - React SPA.
  - REST API Spring Boot.
  - PostgreSQL.
  - Flyway migration.
  - Swagger/OpenAPI.
- Kien truc backend:
  - Controller.
  - Service.
  - Repository.
  - DTO/Request/Response.
  - Global exception handling.
- Thiet ke CSDL:
  - users, shipping_addresses.
  - categories, products, product_variants, product_images, phone_specs.
  - cart_items.
  - orders, order_items, order_status_history.
  - payments, invoices, shipments.
  - promotions.
  - return_requests, warranty_items, trade_in_requests.
  - loyalty_programs, app_notifications.
  - branches, staff_members, inventory_items, activity_logs.
- Thiet ke API:
  - Response thanh cong.
  - Response loi.
  - Pagination.
  - Nhom endpoint theo module.

### Chuong 5: Xay dung va trien khai he thong

Nguon: source FE va BE thuc te. Chi dung `ba-docs` de giai thich module nghiep vu duoc trien khai.

Noi dung:

- Xay dung backend:
  - Auth: login/register/me.
  - Catalog: categories, products, variants, images.
  - Cart: get/add/update/delete/validate.
  - Promotion: list active, validate coupon, admin CRUD.
  - Order: create/list/detail/cancel/admin update status.
  - Payment/invoice/shipment: session, callback, invoice, tracking.
  - After-sales: returns, warranty, trade-in.
  - Loyalty/notification.
  - Admin dashboard, inventory, reports, settings.
- Xay dung frontend:
  - Buyer portal.
  - Admin portal.
  - Shared components.
  - Service layer goi API.
- Cac side effect da hoan thien:
  - Dat hang tao payment placeholder, status history, xoa cart.
  - Chuyen trang thai tao invoice/shipment.
  - COD delivered danh dau paid.
  - Delivered tao warranty item.
  - Delivered cong diem loyalty.
  - Refund/return dao diem loyalty.
  - Order/payment/after-sales tao notification tu dong.

### Chuong 6: Kiem thu va danh gia

Nguon: lenh build/test tu source FE/BE, API Swagger/Postman, backend tests.

Noi dung:

- Kiem thu API bang Swagger/Postman.
- Kiem thu unit test/service test.
- Kiem thu luong nghiep vu:
  - Xem san pham -> them gio -> dat hang.
  - Admin xac nhan -> giao hang -> hoan tat.
  - Thanh toan COD/online bridge.
  - Doi tra/bao hanh/trade-in.
  - Loyalty va notification.
- Ket qua hien tai trong backend progress:
  - Co thoi diem `mvn test` pass voi 20 tests, 0 failures, 0 errors.
  - Co thoi diem `mvn package -DskipTests` pass.
  - Mot lan `mvn test` bi chan do crash native memory/paging tren Windows sau khi them demo data, khong phai loi compile.

### Ket luan va huong phat trien

Noi dung:

- Tong ket ket qua da dat.
- Han che:
  - Security/RBAC thuc te con defer.
  - Gateway MOMO/VNPAY moi la local bridge, chua co credential/signature production.
  - Mot so module can bo sung ownership/user module day du.
- Huong phat trien:
  - Hoan thien JWT/RBAC/ownership.
  - Tich hop thanh toan that.
  - Nang cap search bang Elasticsearch/PostgreSQL full-text.
  - Them AI tu van san pham.
  - Toi uu dashboard/reporting.
  - Trien khai production voi CI/CD, logging, monitoring.

## 5. Bang mapping tai lieu -> noi dung bao cao

| Tai lieu | Dung cho phan bao cao |
| --- | --- |
| `ba-docs/00-tong-quan.md` | Tong quan, pham vi, tech stack de xuat, kien truc tong the, quy uoc API |
| `ba-docs/01-domain-entities.md` | Mo hinh domain, entity, quan he nghiep vu |
| `ba-docs/02-database-design.md` | Thiet ke CSDL, enum, bang, trigger |
| `ba-docs/03-api-auth-users.md` | Auth, user, shipping address |
| `ba-docs/04-api-catalog.md` | Catalog, product, category, review, wishlist, blog, store |
| `ba-docs/05-api-orders.md` | Cart, promotion, order |
| `ba-docs/06-api-payments-invoices.md` | Payment, invoice, shipment |
| `ba-docs/07-api-after-sales.md` | Return, warranty, trade-in, IMEI |
| `ba-docs/08-api-loyalty-notifications.md` | Loyalty, notification |
| `ba-docs/09-api-admin.md` | Admin dashboard, reports, staff, branch, settings |
| `ba-docs/10-business-rules.md` | Quy tac nghiep vu, state machine |
| `ba-docs/11-rbac-security.md` | Phan quyen, bao mat, JWT, rate limit |
| `ba-docs/12-error-codes.md` | Error response, validation error, ma loi |
| Source FE `package.json`, `src/` | Cong nghe frontend, cau truc source, component/service/context |
| Source BE `pom.xml`, `src/main/java`, `src/main/resources` | Cong nghe backend, cau truc module, API, JPA, migration |
| `be/README.md` | Cach chay backend, PostgreSQL Docker, endpoint chinh |

## 6. Cac so do nen dua vao bao cao

Nen ve lai bang Mermaid/Draw.io hoac anh chup:

- Use case diagram cho Customer va Admin.
- Kien truc tong the: React SPA -> Spring Boot API -> PostgreSQL.
- ERD rut gon gom cac cum chinh: User, Catalog, Cart/Order, Payment, After-sales, Loyalty, Admin.
- Sequence diagram:
  - Dat hang.
  - Admin cap nhat don sang delivered.
  - Doi tra/refund.
- State machine:
  - Order status.
  - Payment status.
  - Return status.
- Hinh anh giao dien:
  - Trang chu/san pham.
  - Chi tiet san pham.
  - Gio hang/checkout.
  - Lich su don hang.
  - Admin dashboard.
  - Quan ly san pham/don hang.

## 7. Diem can can than khi viet

- Ten thu muc co chu B2B nhung `ba-docs` moi la CELLPHONES B2C. Bao cao nen thong nhat theo B2C ban dien thoai.
- Khong lay noi dung nghiep vu tu `docs/01-system-overview.md` vi co the lech voi `ba-docs`; neu can mo ta FE thi doc source FE truc tiep.
- `ba-docs/11-rbac-security.md` mo ta JWT/RBAC day du, nhung `be/docs/BA_TO_BE_FE_MAPPING.md` ghi security/RBAC dang deferred. Bao cao nen ghi day la thiet ke/huong phat trien hoac neu da implement sau nay thi cap nhat lai.
- Payment gateway MOMO/VNPAY hien la local bridge; khong nen ghi la da tich hop production day du.
- Test ket qua nen lay theo log moi nhat truoc khi nop bao cao.

## 8. Viec can lam tiep de co bao cao hoan chinh

1. Trich muc luc va style tu file PDF mau, hoac yeu cau them file Word `.docx` neu co.
2. Chot ten de tai, thong tin sinh vien, giao vien huong dan, truong/khoa.
3. Lay anh giao dien tu frontend dang chay.
4. Tao ERD rut gon tu database migrations/source entities.
5. Viet ban nhap bao cao theo khung tren.
6. Chuyen sang `.docx` theo dung mau va chen hinh/screenshot.

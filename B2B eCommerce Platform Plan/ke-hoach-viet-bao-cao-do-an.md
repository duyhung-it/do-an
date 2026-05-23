# Ke hoach viet bao cao do an

Pham vi da chot:

- Nghiep vu, yeu cau, database, business rules: chi dua tren `B2B eCommerce Platform Plan/ba-docs/`.
- Cong nghe va hien trang cai dat frontend: dua tren source FE trong `B2B eCommerce Platform Plan/`.
- Cong nghe va hien trang cai dat backend: dua tren source BE trong `be/`.
- Bo qua phan mo ta API chi tiet trong bao cao. Chi nhac REST API o muc kien truc ket noi FE-BE neu can.
- Mau dinh dang/thanh phan bao cao: dua tren file `Bui Quang Huy_211200919_Do an tot nghiep.docx`.

## 1. Cau truc theo file mau

File mau gom cac phan chinh:

1. Trang bia.
2. Loi cam on.
3. Muc luc.
4. Danh muc cac tu viet tat.
5. Danh muc bang bieu.
6. Danh muc hinh anh.
7. Mo dau.
8. Chuong 1: Tong quan ve de tai.
9. Chuong 2: Phan tich thiet ke he thong.
10. Chuong 3: Cai dat chuong trinh.
11. Ket luan.
12. Tai lieu tham khao.

Bao cao moi se giu bo cuc 3 chuong nay de bam mau.

## 2. Ten de tai de xuat

**Xay dung website thuong mai dien tu ban dien thoai va phu kien cong nghe CELLPHONES**

Ly do: `ba-docs` va source BE hien tai mo ta he thong CELLPHONES B2C, co cac module san pham, gio hang, don hang, thanh toan, hau mai, loyalty, admin.

## 3. Ke hoach noi dung chi tiet

### Trang bia

Can ban cung cap/chot:

- Ten truong, khoa.
- Ten sinh vien.
- Ma sinh vien.
- Lop.
- Giang vien huong dan.
- Nam bao cao.

Phan nay se thay noi dung trong file mau bang thong tin cua ban.

### Loi cam on

Viet lai theo van phong mau, giu cau truc:

- Cam on nha truong/khoa.
- Cam on giang vien huong dan.
- Thua nhan han che ve thoi gian/kinh nghiem.
- Loi cam on ket.

### Danh muc tu viet tat

Du kien:

| Tu viet tat | Ten day du |
| --- | --- |
| API | Application Programming Interface |
| CRUD | Create, Read, Update, Delete |
| DTO | Data Transfer Object |
| FE | Frontend |
| BE | Backend |
| UI/UX | User Interface/User Experience |
| JWT | JSON Web Token |
| JPA | Java Persistence API |
| ERD | Entity Relationship Diagram |
| DB | Database |
| VND | Viet Nam Dong |
| OTP | One Time Password |

### Mo dau

Noi dung:

- Boi canh thuong mai dien tu va nhu cau mua dien thoai/phu kien online.
- Van de can giai quyet: tim kiem san pham, so sanh thong tin, dat hang, thanh toan, quan ly don, hau mai, quan tri ton kho/san pham.
- Muc tieu xay dung he thong CELLPHONES.
- Tom tat ket cau 3 chuong theo mau.

## 4. Chuong 1: Tong quan ve de tai

### 1.1 Muc tieu va pham vi cua do an

Nguon: `ba-docs/00-tong-quan.md`, `Y tuong website ban hang.md`.

Noi dung:

- Gioi thieu CELLPHONES B2C eCommerce Platform.
- Doi tuong su dung:
  - Customer.
  - Admin.
  - Staff.
- Muc tieu:
  - Ho tro khach hang mua sam dien thoai/phu kien.
  - Quan ly san pham, danh muc, don hang, thanh toan, hau mai.
  - Ho tro loyalty, notification, trade-in, warranty.
- Pham vi:
  - Storefront cho khach hang.
  - Admin portal cho quan tri.
  - Backend xu ly nghiep vu va database PostgreSQL.

### 1.2 Khao sat website thuong mai dien tu

Noi dung se viet theo huong:

- Tham khao cac website ban dien thoai/phu kien nhu CellphoneS, The Gioi Di Dong, FPT Shop.
- Cac chuc nang pho bien:
  - Danh muc san pham.
  - Tim kiem, loc, sap xep.
  - Chi tiet san pham va cau hinh.
  - Gio hang, dat hang.
  - Theo doi don hang.
  - Khuyen mai, danh gia, bao hanh.
- Tu do rut ra yeu cau cho he thong.

### 1.3 Phan tich quy trinh nghiep vu

Nguon: `ba-docs/03` den `09`, `10-business-rules.md`.

Quy trinh se viet:

- Quy trinh dang ky/dang nhap.
- Quy trinh xem, tim kiem, loc san pham.
- Quy trinh them vao gio hang.
- Quy trinh dat hang.
- Quy trinh thanh toan.
- Quy trinh admin xu ly don hang.
- Quy trinh van chuyen.
- Quy trinh doi tra/bao hanh/trade-in.
- Quy trinh tich diem loyalty va nhan thong bao.

### 1.4 Cong nghe su dung

Nguon: source FE/BE, khong lay tu BA.

Frontend:

- React 18.3.1.
- TypeScript.
- Vite 6.3.5.
- Tailwind CSS 4.1.12.
- React Router 7.13.0.
- Radix/shadcn UI, lucide-react.
- Recharts, Sonner, react-hook-form.

Backend:

- Java 21.
- Spring Boot 4.0.6.
- Spring Web.
- Spring Data JPA.
- Bean Validation.
- PostgreSQL 15.
- Flyway.
- Springdoc OpenAPI/Swagger UI.
- Docker Compose.

## 5. Chuong 2: Phan tich thiet ke he thong

### 2.1 So do phan ra chuc nang

Can ve 1 hinh:

- He thong CELLPHONES.
- Customer:
  - Auth.
  - Catalog.
  - Cart/Checkout.
  - Orders.
  - Payment/Invoice/Shipment.
  - Return/Warranty/Trade-in.
  - Loyalty/Notification.
- Admin:
  - Catalog management.
  - Order management.
  - Payment/Invoice/Shipment management.
  - Inventory.
  - Promotion.
  - After-sales.
  - Report/Settings.

### 2.2 Thiet ke Use Case

Theo file mau, moi use case nen co bang:

- Mo ta.
- Tac nhan.
- Kich hoat.
- Dieu kien truoc.
- Dieu kien sau.
- Luong su kien chinh.
- Luong thay the/ngoai le.
- Thong tin bo sung.

Danh sach use case nen co:

1. Dang ky/dang nhap.
2. Tim kiem va xem san pham.
3. Quan ly gio hang.
4. Dat hang.
5. Thanh toan.
6. Theo doi/huy don hang.
7. Yeu cau doi tra.
8. Yeu cau bao hanh.
9. Thu cu doi moi.
10. Quan ly san pham/danh muc.
11. Quan ly don hang.
12. Quan ly khuyen mai.
13. Quan ly ton kho.
14. Xem bao cao thong ke.

Can ve cac hinh use case:

- Use case tong quat Customer.
- Use case tong quat Admin.
- Use case dat hang/thanh toan.
- Use case hau mai.

### 2.3 Thiet ke co so du lieu

Nguon: `ba-docs/01-domain-entities.md`, `ba-docs/02-database-design.md`.

Bang chinh dua vao bao cao:

- `users`.
- `shipping_addresses`.
- `categories`.
- `products`.
- `product_variants`.
- `product_images`.
- `phone_specs`.
- `cart_items`.
- `orders`.
- `order_items`.
- `order_status_history`.
- `promotions`.
- `payments`.
- `invoices`.
- `shipments`.
- `return_requests`.
- `warranty_items`.
- `trade_in_requests`.
- `loyalty_programs`.
- `app_notifications`.
- `branches`.
- `staff_members`.
- `inventory_items`.
- `activity_logs`.

Can lam:

- Bang tong hop cac bang CSDL.
- Bang chi tiet cho cac bang quan trong.
- ERD rut gon, khong nen dua day du 40+ bang neu qua roi.

### 2.4 Thiet ke kien truc xu ly va luong du lieu

Thay cho phan mo ta API chi tiet, bao cao chi trinh bay ngan gon cach cac thanh phan phoi hop.

Noi dung:

- Frontend hien thi giao dien va gui yeu cau xu ly den backend.
- Backend tiep nhan yeu cau qua controller, xu ly nghiep vu tai service va luu/truy van du lieu qua repository.
- PostgreSQL luu tru du lieu san pham, nguoi dung, gio hang, don hang, thanh toan, hau mai va quan tri.
- Cac luong du lieu chinh:
  - Xem san pham.
  - Them gio hang.
  - Dat hang.
  - Cap nhat trang thai don hang.
  - Doi tra/bao hanh.
  - Tich diem va thong bao.

Khong liet ke endpoint, request/response hay ma loi chi tiet trong bao cao chinh.

## 6. Chuong 3: Cai dat chuong trinh

Theo file mau, chuong 3 chu yeu la anh giao dien + mo ta.

### 3.1 Cai dat frontend

Mo ta source:

- Cau truc `src/app`.
- Component UI.
- Service layer.
- Context layer.
- Routing.

Anh can chup:

- Trang chu.
- Danh sach san pham.
- Chi tiet san pham.
- Gio hang.
- Checkout.
- Lich su don hang.
- Thong bao/loyalty neu co.

### 3.2 Cai dat backend

Mo ta source:

- Package `com.b2b.ecommerce`.
- Controller/service/repository.
- DTO/request/response.
- Global exception handling.
- Flyway migration.
- Swagger UI neu can minh hoa backend co tai lieu tu dong.

Anh can chup:

- Swagger UI neu can, khong chup/liet ke chi tiet endpoint.
- PostgreSQL/Docker running neu can.

### 3.3 Giao dien nguoi dung

Danh sach muc de viet:

- Giao dien trang chu.
- Giao dien danh sach san pham.
- Giao dien chi tiet san pham.
- Giao dien tim kiem/loc.
- Giao dien gio hang.
- Giao dien thanh toan.
- Giao dien don hang.
- Giao dien bao hanh/doi tra/trade-in.
- Giao dien thong bao/loyalty.

### 3.4 Giao dien quan tri

Danh sach muc de viet:

- Giao dien dashboard admin.
- Giao dien quan ly danh muc.
- Giao dien quan ly san pham.
- Giao dien quan ly don hang.
- Giao dien quan ly thanh toan/hoa don/van chuyen.
- Giao dien quan ly ton kho.
- Giao dien quan ly khuyen mai.
- Giao dien bao cao/thong ke.
- Giao dien cau hinh he thong.

## 7. Ket luan

Noi dung:

- Tong ket cac ket qua da dat:
  - Phan tich yeu cau va thiet ke he thong.
  - Xay dung frontend ban hang va admin.
  - Xay dung backend xu ly nghiep vu va ket noi co so du lieu.
  - Thiet ke database PostgreSQL.
  - Ho tro cac luong chinh: catalog, cart, order, payment, after-sales, loyalty, admin.
- Han che:
  - RBAC/JWT production can hoan thien neu source hien tai con defer.
  - Payment gateway moi o muc bridge/local neu chua co credential production.
  - Can them kiem thu hieu nang/bao mat neu trien khai that.
- Huong phat trien:
  - Hoan thien security/RBAC.
  - Tich hop payment production.
  - Tim kiem nang cao.
  - AI tu van san pham.
  - CI/CD, logging, monitoring.

## 8. Viec can ban cung cap/chot truoc khi viet ban thao

1. Thong tin trang bia: ho ten, ma SV, lop, GVHD, truong/khoa, nam.
2. Ten de tai chinh xac muon ghi tren bia.
3. Co muon giu dung bo cuc 3 chuong cua file mau hay muon them chuong kiem thu rieng.
4. Anh giao dien FE/Admin: neu chua co, co the chay app va chup sau.
5. Muc do dai mong muon: ngan 45-60 trang hay day du 70+ trang nhu mau.

## 9. Thu tu thuc hien de xuat

1. Chot thong tin bia va ten de tai.
2. Lap danh sach bang/hinh can co.
3. Viet ban thao chuong 1.
4. Viet chuong 2, gom use case + database + kien truc xu ly, khong mo ta API chi tiet.
5. Chup/hop anh giao dien va viet chuong 3.
6. Viet ket luan, tai lieu tham khao.
7. Dua vao file `.docx` mau, thay noi dung va cap nhat muc luc/danh muc hinh/bang.

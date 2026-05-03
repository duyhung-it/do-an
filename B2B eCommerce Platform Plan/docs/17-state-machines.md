# 17 — State Machine Diagrams

> Sơ đồ trạng thái (State Machines) cho tất cả entities có workflow phức tạp trong hệ thống B2B.
> Sử dụng Mermaid stateDiagram-v2 syntax.

---

## 1. OrderStatus State Machine

```mermaid
stateDiagram-v2
  [*] --> ChoXacNhan : Buyer tạo đơn hàng

  ChoXacNhan --> DaXacNhan : Seller xác nhận
  ChoXacNhan --> DaHuy : Buyer/Seller huỷ

  DaXacNhan --> DangXuLy : Seller bắt đầu xử lý
  DaXacNhan --> DaHuy : Seller/Buyer huỷ

  DangXuLy --> DangGiaoHang : Tạo Shipment thành công
  DangXuLy --> DaHuy : Seller huỷ (trước khi giao)

  DangGiaoHang --> DaGiao : Shipment delivered
  DangGiaoHang --> DangXuLy : Giao thất bại (retry)

  DaGiao --> HoanTra : Buyer yêu cầu trả hàng (≤7 ngày)

  DaHuy --> [*]
  HoanTra --> [*]
  DaGiao --> [*]

  note right of ChoXacNhan: Initial state sau khi tạo đơn
  note right of DaGiao: Sau 7 ngày không trả hàng → Order hoàn tất
```

**Trạng thái tiếng Việt:**
- `ChoXacNhan` = "Chờ xác nhận"
- `DaXacNhan` = "Đã xác nhận"
- `DangXuLy` = "Đang xử lý"
- `DangGiaoHang` = "Đang giao hàng"
- `DaGiao` = "Đã giao"
- `DaHuy` = "Đã huỷ"
- `HoanTra` = "Hoàn trả"

---

## 2. RFQStatus State Machine

```mermaid
stateDiagram-v2
  [*] --> BanNhap : Buyer tạo RFQ

  BanNhap --> DaGui : Buyer submit
  BanNhap --> DaHuy : Buyer huỷ

  DaGui --> DangBaoGia : Seller bắt đầu tạo Quotation
  DaGui --> HetHan : expires_at < NOW()

  DangBaoGia --> DaBaoGia : Seller submit Quotation
  DangBaoGia --> HetHan : expires_at < NOW()

  DaBaoGia --> ChapNhan : Buyer accept Quotation
  DaBaoGia --> TuChoi : Buyer reject tất cả

  ChapNhan --> HoanThanh : Contract được ký

  HoanThanh --> [*]
  DaHuy --> [*]
  HetHan --> [*]
  TuChoi --> [*]
```

---

## 3. QuotationStatus State Machine

```mermaid
stateDiagram-v2
  [*] --> ChoPhanHoi : Seller tạo Quotation

  ChoPhanHoi --> ChapNhan : Buyer accept quotation này
  ChoPhanHoi --> TuChoi : Buyer reject | Buyer accept quotation khác

  ChapNhan --> [*] : Tạo Contract thành công
  TuChoi --> [*]
```

**Lưu ý:** Khi Buyer accept 1 Quotation → Tất cả Quotation còn lại của cùng RFQ → "Từ chối" (auto).

---

## 4. ContractStatus State Machine

```mermaid
stateDiagram-v2
  [*] --> BanNhap : Từ accepted Quotation hoặc tạo thủ công

  BanNhap --> ChoKy : Tất cả thông tin đầy đủ

  ChoKy --> DangThucHien : signedByBuyer=true AND signedBySeller=true
  ChoKy --> DaHuy : Một bên huỷ trước khi ký

  DangThucHien --> HoanThanh : Tất cả milestones hoàn thành
  DangThucHien --> TraChanh : Báo cáo tranh chấp lên Admin
  DangThucHien --> HetHan : endDate < NOW() (chưa hoàn thành)

  HoanThanh --> [*]
  DaHuy --> [*]
  HetHan --> [*]
  TraChanh --> HoanThanh : Admin giải quyết → đồng ý hoàn thành
  TraChanh --> DaHuy : Admin giải quyết → huỷ hợp đồng
```

---

## 5. PaymentStatus State Machine

```mermaid
stateDiagram-v2
  [*] --> ChoThanhToan : Payment tạo khi Order confirmed

  ChoThanhToan --> ThanhToanMotPhan : Partial payment received
  ChoThanhToan --> DaThanhToan : Full payment received
  ChoThanhToan --> QuaHan : dueDate < NOW() (cron job)

  ThanhToanMotPhan --> DaThanhToan : Đủ 100%
  ThanhToanMotPhan --> QuaHan : dueDate < NOW()

  QuaHan --> DaThanhToan : Buyer thanh toán đủ (có kèm lateFee)

  DaThanhToan --> HoanTien : Khi Return được approved

  HoanTien --> [*]
  DaThanhToan --> [*]
  DaHuy --> [*]
```

---

## 6. InvoiceStatus State Machine

```mermaid
stateDiagram-v2
  [*] --> BanNhap : Seller tạo hoá đơn

  BanNhap --> DaGui : Seller gửi cho Buyer

  DaGui --> DaThanhToan : Buyer thanh toán đủ
  DaGui --> QuaHan : dueDate < NOW() (cron job)
  DaGui --> DaHuy : Admin/Seller huỷ

  QuaHan --> DaThanhToan : Buyer thanh toán (trễ)

  BanNhap --> DaHuy : Seller huỷ trước khi gửi

  DaThanhToan --> [*]
  DaHuy --> [*]
```

---

## 7. ShipmentStatus State Machine

```mermaid
stateDiagram-v2
  [*] --> ChoLayHang : Seller tạo Shipment

  ChoLayHang --> DaLayHang : Carrier lấy hàng

  DaLayHang --> DangVanChuyen : Hàng trên đường vận chuyển

  DangVanChuyen --> DangGiao : Đến điểm giao cuối cùng
  DangVanChuyen --> DangVanChuyen : Transit point updates

  DangGiao --> DaGiao : Giao thành công → Order.status = 'Đã giao'
  DangGiao --> GiaoThatBai : Không giao được (3 lần thử)

  GiaoThatBai --> DaTrVe : Trả về kho người gửi

  DaGiao --> [*]
  DaTrVe --> [*]
```

---

## 8. ReturnStatus State Machine

```mermaid
stateDiagram-v2
  [*] --> ChoXuLy : Buyer tạo yêu cầu trả hàng

  ChoXuLy --> DaNhan : Seller xác nhận nhận hàng về
  ChoXuLy --> TuChoi : Seller từ chối ngay (lý do không hợp lệ)

  DaNhan --> DangKiemTra : Bắt đầu kiểm tra hàng

  DangKiemTra --> ChapNhan : Hàng lỗi đúng lý do
  DangKiemTra --> TuChoi : Hàng không đúng lý do trả

  ChapNhan --> DaHoanTien : Seller xác nhận hoàn tiền

  DaHoanTien --> [*]
  TuChoi --> [*]
```

---

## 9. ApprovalStatus State Machine

```mermaid
stateDiagram-v2
  [*] --> ChoDuyet : Tạo ApprovalRequest

  ChoDuyet --> DaDuyet : Tất cả steps được duyệt
  ChoDuyet --> TuChoi : Một step từ chối
  ChoDuyet --> DaHuy : Requester huỷ yêu cầu

  DaDuyet --> [*] : Entity tiếp tục xử lý
  TuChoi --> [*] : Entity bị từ chối
  DaHuy --> [*]
```

### PRStatus State Machine

```mermaid
stateDiagram-v2
  [*] --> BanNhap : Buyer tạo PR

  BanNhap --> ChoDuyet : Submit để duyệt
  BanNhap --> DaHuy : Buyer huỷ

  ChoDuyet --> DaDuyet : Approval approved
  ChoDuyet --> TuChoi : Approval rejected

  DaDuyet --> DaTaoRFQ : Tạo RFQ từ PR
  DaDuyet --> DaDatHang : Tạo Order trực tiếp từ PR

  DaTaoRFQ --> DaDatHang : RFQ → Quotation → Order
  DaDatHang --> HoanThanh : Order delivered

  HoanThanh --> [*]
  DaHuy --> [*]
  TuChoi --> [*]
```

### GRNStatus State Machine

```mermaid
stateDiagram-v2
  [*] --> ChoKiemTra : GRN tạo khi nhận hàng

  ChoKiemTra --> DangKiemTra : Bắt đầu kiểm tra SL/CL

  DangKiemTra --> HoanThanh : Nhận đủ, không sự cố
  DangKiemTra --> CoSuCo : Có sự cố (thiếu/hỏng)

  CoSuCo --> HoanThanh : Xử lý sự cố xong (return/credit note)

  HoanThanh --> [*] : Tạo StockMovement tự động
```

---

## 10. Workflow tổng hợp: Procurement Lifecycle

```mermaid
flowchart TD
  A[👤 Buyer tạo PR] --> B{Cần phê duyệt?}
  B -- Không --> E
  B -- Có --> C[📋 Approval Request]
  C --> D{Kết quả duyệt}
  D -- Từ chối --> Z1[❌ PR Từ chối]
  D -- Duyệt --> E[✅ PR Đã duyệt]

  E --> F{Chọn phương thức}
  F -- RFQ --> G[📝 Tạo RFQ]
  F -- Direct --> K[🛒 Tạo Order trực tiếp]

  G --> H[📨 Suppliers nhận RFQ]
  H --> I[💬 Quotations submitted]
  I --> J[🔍 Buyer so sánh & chọn]
  J -- Accept --> L[📄 Tạo Contract]
  J -- Reject --> Z2[❌ Quotation Từ chối]

  L --> M[✍️ Ký hợp đồng cả 2 bên]
  M --> K

  K --> N[📦 Seller xác nhận & xử lý]
  N --> O[🚚 Tạo Shipment]
  O --> P[✅ Giao hàng thành công]
  P --> Q[📋 Tạo GRN - Biên bản nhận hàng]
  Q --> R{Có sự cố?}
  R -- Không --> S[🧾 Tạo Invoice]
  R -- Có --> T[↩️ Return / Credit Note]
  T --> S

  S --> U[💳 Thanh toán]
  U --> V[🎉 Hoàn thành]

  style A fill:#4CAF50,color:#fff
  style V fill:#2196F3,color:#fff
  style Z1 fill:#f44336,color:#fff
  style Z2 fill:#f44336,color:#fff
```

---

## Bảng tổng hợp Status values

| Entity | Status values | Terminal states |
|--------|--------------|-----------------|
| `Order` | 7 values | Đã huỷ, Hoàn trả |
| `RFQ` | 7 values | Hoàn thành, Đã huỷ, Hết hạn, Từ chối |
| `Quotation` | 3 values | Chấp nhận, Từ chối |
| `Contract` | 7 values | Hoàn thành, Đã huỷ, Hết hạn |
| `Payment` | 6 values | Đã thanh toán, Hoàn tiền, Đã huỷ |
| `Invoice` | 5 values | Đã thanh toán, Đã huỷ |
| `Shipment` | 7 values | Đã giao, Đã trả về |
| `Return` | 6 values | Đã hoàn tiền, Từ chối |
| `ApprovalRequest` | 4 values | Đã duyệt, Từ chối, Đã huỷ |
| `PR` | 8 values | Hoàn thành, Đã huỷ, Từ chối |
| `GRN` | 4 values | Hoàn thành |
| `WarehouseTransfer` | 5 values | Đã nhận, Huỷ |
| `StockAlert` | 4 values | Đã xử lý, Bỏ qua |
| `CreditLimit` | 3 values | Đã huỷ |
| `DebitCreditNote` | 5 values | Đã xác nhận, Từ chối, Đã huỷ |

---

## Tài liệu liên quan

- [14-business-rules-part1.md](./14-business-rules-part1.md) — Core Commerce Rules
- [15-business-rules-part2.md](./15-business-rules-part2.md) — Sourcing & Procurement Rules
- [09-api-spec-part1.md](./09-api-spec-part1.md) — API conventions
- [32-vibe-coding-context.md](./32-vibe-coding-context.md) — STATUS ENUM MAP

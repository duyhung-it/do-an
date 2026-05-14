package com.b2b.ecommerce.order;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import com.b2b.ecommerce.cart.CartService;
import com.b2b.ecommerce.common.AppException;
import com.b2b.ecommerce.common.ErrorCode;
import com.b2b.ecommerce.common.PageRequestParams;
import com.b2b.ecommerce.promotion.PromotionCartItemRequest;
import com.b2b.ecommerce.promotion.PromotionDto;
import com.b2b.ecommerce.promotion.PromotionService;
import com.b2b.ecommerce.promotion.PromotionValidateRequest;
import com.b2b.ecommerce.promotion.PromotionValidateResponse;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class OrderService {
	private final JdbcTemplate jdbc;
	private final PromotionService promotions;
	private final CartService cart;

	public OrderService(JdbcTemplate jdbc, PromotionService promotions, CartService cart) {
		this.jdbc = jdbc;
		this.promotions = promotions;
		this.cart = cart;
	}

	@Transactional
	public OrderCreateResponse create(UUID userId, CustomerSnapshot customer, OrderCreateRequest request) {
		if (request.items() == null || request.items().isEmpty()) {
			throw new AppException(ErrorCode.ORDER_EMPTY_ITEMS);
		}
		if (request.shippingAddress() == null) {
			throw new AppException(ErrorCode.ORDER_ADDRESS_REQUIRED);
		}
		String paymentMethod = paymentMethod(request.paymentMethod());
		ShippingAddressDto address = request.shippingAddress().normalized();
		List<OrderLine> lines = request.items().stream().map(this::line).toList();
		long subtotal = lines.stream().mapToLong(OrderLine::totalPrice).sum();
		long discount = 0;
		PromotionDto promotion = null;
		if (request.promotionCode() != null && !request.promotionCode().isBlank()) {
			PromotionValidateResponse validated = promotions.validate(new PromotionValidateRequest(request.promotionCode(),
					subtotal, lines.stream().map(line -> new PromotionCartItemRequest(line.productId().toString(),
							line.categoryId().toString(), line.brand(), line.brand())).toList()));
			discount = validated.discount();
			promotion = validated.promotion();
			jdbc.update("UPDATE promotions SET used_count = used_count + 1 WHERE id = ?",
					UUID.fromString(promotion.id()));
		}
		long shippingFee = subtotal >= 3_000_000 ? 0 : 30_000;
		long totalAmount = Math.max(0, subtotal - discount + shippingFee);
		UUID orderId = UUID.randomUUID();
		UUID paymentId = UUID.randomUUID();
		UUID historyId = UUID.randomUUID();
		String orderNumber = orderNumber();
		String shippingJson = json(address);
		jdbc.update("""
				INSERT INTO orders (
				  id, order_number, customer_id, customer_name, customer_email, customer_phone,
				  subtotal, shipping_fee, discount, total_amount, status, shipping_address,
				  payment_method, payment_status, promotion_code, promotion_id, discount_amount, notes
				)
				VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING', ?::jsonb, ?::payment_method, 'UNPAID',
				        ?, ?, ?, ?)
				""", orderId, orderNumber, userId, customer.name(), customer.email(), customer.phone(), subtotal,
				shippingFee, discount, totalAmount, shippingJson, paymentMethod,
				promotion == null ? null : promotion.code(), promotion == null ? null : UUID.fromString(promotion.id()),
				discount, request.notes());
		for (OrderLine line : lines) {
			jdbc.update("""
					INSERT INTO order_items (
					  id, order_id, product_id, variant_id, product_name, product_image, brand,
					  variant_name, sku, color, storage, quantity, unit_price, original_price, discount, total_price, note
					)
					VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)
					""", line.id(), orderId, line.productId(), line.variantId(), line.productName(), line.productImage(),
					line.brand(), line.variantName(), line.sku(), line.color(), line.storage(), line.quantity(), line.unitPrice(),
					line.originalPrice(), line.totalPrice(), null);
		}
		jdbc.update("""
				INSERT INTO order_status_history (id, order_id, from_status, to_status, changed_by, changed_by_name, note)
				VALUES (?, ?, NULL, 'PENDING', ?, ?, ?)
				""", historyId, orderId, userId, customer.name(), "Don hang duoc tao");
		jdbc.update("""
				INSERT INTO payments (
				  id, order_id, order_number, customer_id, amount, paid_amount, remaining_amount,
				  due_date, status, method
				)
				VALUES (?, ?, ?, ?, ?, 0, ?, ?, 'UNPAID', ?)
				""", paymentId, orderId, orderNumber, userId, totalAmount, totalAmount, LocalDate.now().plusDays(3),
				paymentMethod);
		cart.clear(userId);
		OffsetDateTime now = OffsetDateTime.now();
		OrderDto order = new OrderDto(orderId.toString(), orderNumber, userId.toString(), customer.name(), customer.phone(),
				customer.email(), "PENDING", "UNPAID", paymentMethod, address, lines.stream().map(OrderLine::dto).toList(),
				subtotal, discount, shippingFee, totalAmount, promotion == null ? null : promotion.code(),
				promotion == null ? null : promotion.id(), request.notes(), null, null, null,
				List.of(new OrderStatusHistoryDto(historyId.toString(), null, "PENDING", "Don hang duoc tao",
						userId.toString(), customer.name(), iso(now))),
				iso(now), iso(now));
		PaymentDto payment = new PaymentDto(paymentId.toString(), orderId.toString(), orderNumber, paymentMethod, "UNPAID",
				totalAmount, 0, null, null, null, iso(now));
		return new OrderCreateResponse(order, payment);
	}

	@Transactional(readOnly = true)
	public Page<OrderSummaryDto> orders(UUID userId, PageRequestParams params, String status) {
		int page = params.normalizedPage();
		int pageSize = Math.min(params.normalizedPageSize(), 50);
		List<Object> args = new ArrayList<>();
		args.add(userId);
		StringBuilder where = new StringBuilder("WHERE o.customer_id = ?");
		if (status != null && !status.isBlank()) {
			where.append(" AND o.status = ?::order_status");
			args.add(status.trim().toUpperCase());
		}
		if (params.search() != null && !params.search().isBlank()) {
			where.append(" AND LOWER(o.order_number) LIKE ?");
			args.add("%" + params.search().trim().toLowerCase() + "%");
		}
		Long total = jdbc.queryForObject("SELECT COUNT(*) FROM orders o " + where, Long.class, args.toArray());
		args.add(pageSize);
		args.add((page - 1) * pageSize);
		List<OrderSummaryDto> content = jdbc.query("""
				SELECT o.id, o.order_number, o.status::text AS status, o.payment_status::text AS payment_status,
				       o.total_amount, o.created_at,
				       COUNT(oi.id)::int AS item_count,
				       (ARRAY_AGG(oi.product_name ORDER BY oi.id))[1] AS first_product_name,
				       (ARRAY_AGG(oi.product_image ORDER BY oi.id))[1] AS first_product_image,
				       (ARRAY_AGG(oi.variant_name ORDER BY oi.id))[1] AS first_variant_name
				FROM orders o
				LEFT JOIN order_items oi ON oi.order_id = o.id
				""" + where + " " + """
				GROUP BY o.id
				ORDER BY o.created_at DESC
				LIMIT ? OFFSET ?
				""", this::summaryDto, args.toArray());
		return new PageImpl<>(content, PageRequest.of(page - 1, pageSize), total == null ? 0 : total);
	}

	@Transactional(readOnly = true)
	public OrderDto order(UUID userId, String id) {
		UUID orderId = uuid(id, "id");
		OrderRecord order = orderRecord(userId, orderId);
		List<OrderItemDto> items = jdbc.query("""
				SELECT id, product_id, variant_id, product_name, product_image, brand, variant_name, color, storage,
				       quantity, unit_price, total_price
				FROM order_items
				WHERE order_id = ?
				ORDER BY id
				""", this::orderItemDto, orderId);
		List<OrderStatusHistoryDto> history = jdbc.query("""
				SELECT id, from_status::text AS from_status, to_status::text AS to_status, note, changed_by,
				       changed_by_name, created_at
				FROM order_status_history
				WHERE order_id = ?
				ORDER BY created_at ASC
				""", this::historyDto, orderId);
		return new OrderDto(order.id().toString(), order.orderNumber(), order.customerId().toString(), order.customerName(),
				order.customerPhone(), order.customerEmail(), order.status(), order.paymentStatus(), order.paymentMethod(),
				order.shippingAddress(), items, order.subtotal(), order.discount(), order.shippingFee(), order.totalAmount(),
				order.promotionCode(), order.promotionId() == null ? null : order.promotionId().toString(), order.notes(),
				null, order.cancelReason(), order.cancelledAt(), history, order.createdAt(), order.updatedAt());
	}

	private OrderLine line(OrderItemRequest item) {
		UUID productId = uuid(item.productId(), "productId");
		UUID variantId = item.variantId() == null || item.variantId().isBlank() ? null : uuid(item.variantId(), "variantId");
		ProductSnapshot product = product(productId);
		if (!"ACTIVE".equals(product.status())) {
			throw new AppException(ErrorCode.PRODUCT_INACTIVE);
		}
		VariantSnapshot variant = variantId == null ? null : variant(productId, variantId);
		if (variantId == null && product.variantCount() > 0) {
			throw new AppException(ErrorCode.PRODUCT_VARIANT_NOT_FOUND, "San pham can chon bien the");
		}
		if (variant != null && !variant.active()) {
			throw new AppException(ErrorCode.PRODUCT_INACTIVE, "Bien the san pham khong con kinh doanh");
		}
		if (variant != null && variant.stock() < item.quantity()) {
			throw new AppException(ErrorCode.ORDER_INSUFFICIENT_STOCK, ErrorCode.ORDER_INSUFFICIENT_STOCK.message(),
					Map.of("productId", productId.toString(), "variantId", variantId.toString(),
							"availableStock", variant.stock(), "requestedQuantity", item.quantity()));
		}
		long unitPrice = variant == null ? product.price() : variant.price();
		return new OrderLine(UUID.randomUUID(), productId, variantId, product.categoryId(), product.name(), product.image(),
				product.brand(), variant == null ? null : variant.name(), variant == null ? null : variant.sku(),
				variant == null ? null : variant.color(), variant == null ? null : variant.storage(), item.quantity(),
				unitPrice, variant == null ? product.originalPrice() : variant.originalPrice(), unitPrice * item.quantity());
	}

	private ProductSnapshot product(UUID productId) {
		try {
			return jdbc.queryForObject("""
					SELECT p.id, p.category_id, p.name, p.brand, p.price, p.original_price, p.status::text AS status,
					       COALESCE((SELECT pi.url FROM product_images pi WHERE pi.product_id = p.id
					                 ORDER BY pi.is_primary DESC, pi.sort_order ASC LIMIT 1), '') AS image,
					       (SELECT COUNT(*) FROM product_variants pv WHERE pv.product_id = p.id) AS variant_count
					FROM products p
					WHERE p.id = ?
					""", this::productSnapshot, productId);
		}
		catch (EmptyResultDataAccessException exception) {
			throw new AppException(ErrorCode.PRODUCT_NOT_FOUND);
		}
	}

	private OrderRecord orderRecord(UUID userId, UUID orderId) {
		try {
			return jdbc.queryForObject("""
					SELECT id, order_number, customer_id, customer_name, customer_email, customer_phone,
					       subtotal, shipping_fee, discount, total_amount, status::text AS status,
					       payment_method::text AS payment_method, payment_status::text AS payment_status,
					       promotion_code, promotion_id, notes, cancel_reason,
					       cancelled_at, created_at, updated_at,
					       shipping_address ->> 'recipientName' AS recipient_name,
					       shipping_address ->> 'phone' AS address_phone,
					       shipping_address ->> 'province' AS province,
					       shipping_address ->> 'district' AS district,
					       shipping_address ->> 'ward' AS ward,
					       shipping_address ->> 'addressLine' AS address_line,
					       shipping_address ->> 'fullAddress' AS full_address
					FROM orders
					WHERE id = ? AND customer_id = ?
					""", this::orderRecord, orderId, userId);
		}
		catch (EmptyResultDataAccessException exception) {
			throw new AppException(ErrorCode.ORDER_NOT_FOUND);
		}
	}

	private VariantSnapshot variant(UUID productId, UUID variantId) {
		try {
			return jdbc.queryForObject("""
					SELECT id, name, sku, price, original_price, stock, color, storage, is_active
					FROM product_variants
					WHERE id = ? AND product_id = ?
					""", this::variantSnapshot, variantId, productId);
		}
		catch (EmptyResultDataAccessException exception) {
			throw new AppException(ErrorCode.PRODUCT_VARIANT_NOT_FOUND);
		}
	}

	private String orderNumber() {
		Integer next = jdbc.queryForObject("""
				INSERT INTO order_daily_sequences (order_date, next_value)
				VALUES (CURRENT_DATE, 1)
				ON CONFLICT (order_date)
				DO UPDATE SET next_value = order_daily_sequences.next_value + 1
				RETURNING next_value
				""", Integer.class);
		return "CP" + DateTimeFormatter.BASIC_ISO_DATE.format(LocalDate.now()) + String.format("%05d", next == null ? 1 : next);
	}

	private String paymentMethod(String value) {
		String normalized = value == null ? "" : value.trim().toUpperCase();
		return switch (normalized) {
			case "COD", "BANK_TRANSFER", "MOMO", "VNPAY", "INSTALLMENT" -> normalized;
			default -> throw new AppException(ErrorCode.VALIDATION_ERROR, "Du lieu dau vao khong hop le",
					Map.of("paymentMethod", "Gia tri khong hop le"));
		};
	}

	private String json(ShippingAddressDto address) {
		return """
				{"recipientName":"%s","phone":"%s","province":"%s","district":"%s","ward":"%s","addressLine":"%s","fullAddress":"%s"}
				""".formatted(escape(address.recipientName()), escape(address.phone()), escape(address.province()),
				escape(address.district()), escape(address.ward()), escape(address.addressLine()), escape(address.fullAddress()));
	}

	private String escape(String value) {
		if (value == null) {
			return "";
		}
		return value.replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", "\\n").replace("\r", "\\r");
	}

	private ProductSnapshot productSnapshot(ResultSet rs, int rowNum) throws SQLException {
		return new ProductSnapshot(rs.getObject("id", UUID.class), rs.getObject("category_id", UUID.class),
				rs.getString("name"), rs.getString("brand"), rs.getLong("price"),
				rs.getObject("original_price") == null ? null : rs.getLong("original_price"), rs.getString("status"),
				rs.getString("image"), rs.getInt("variant_count"));
	}

	private VariantSnapshot variantSnapshot(ResultSet rs, int rowNum) throws SQLException {
		return new VariantSnapshot(rs.getObject("id", UUID.class), rs.getString("name"), rs.getString("sku"),
				rs.getLong("price"), rs.getObject("original_price") == null ? null : rs.getLong("original_price"),
				rs.getInt("stock"), rs.getString("color"), rs.getString("storage"), rs.getBoolean("is_active"));
	}

	private OrderSummaryDto summaryDto(ResultSet rs, int rowNum) throws SQLException {
		OrderFirstItemDto firstItem = new OrderFirstItemDto(rs.getString("first_product_name"),
				rs.getString("first_product_image"), rs.getString("first_variant_name"));
		return new OrderSummaryDto(rs.getObject("id", UUID.class).toString(), rs.getString("order_number"),
				rs.getString("status"), rs.getString("payment_status"), rs.getLong("total_amount"),
				new OrderSummaryItemsDto(rs.getInt("item_count"), firstItem), iso(rs.getObject("created_at", OffsetDateTime.class)));
	}

	private OrderRecord orderRecord(ResultSet rs, int rowNum) throws SQLException {
		ShippingAddressDto address = new ShippingAddressDto(rs.getString("recipient_name"), rs.getString("address_phone"),
				rs.getString("province"), rs.getString("district"), rs.getString("ward"), rs.getString("address_line"),
				rs.getString("full_address"));
		return new OrderRecord(rs.getObject("id", UUID.class), rs.getString("order_number"),
				rs.getObject("customer_id", UUID.class), rs.getString("customer_name"), rs.getString("customer_email"),
				rs.getString("customer_phone"), rs.getLong("subtotal"), rs.getLong("shipping_fee"), rs.getLong("discount"),
				rs.getLong("total_amount"), rs.getString("status"), rs.getString("payment_method"),
				rs.getString("payment_status"), rs.getString("promotion_code"), rs.getObject("promotion_id", UUID.class),
				rs.getString("notes"), rs.getString("cancel_reason"),
				rs.getObject("cancelled_at", OffsetDateTime.class) == null ? null : iso(rs.getObject("cancelled_at", OffsetDateTime.class)),
				iso(rs.getObject("created_at", OffsetDateTime.class)), iso(rs.getObject("updated_at", OffsetDateTime.class)),
				address);
	}

	private OrderItemDto orderItemDto(ResultSet rs, int rowNum) throws SQLException {
		UUID variantId = rs.getObject("variant_id", UUID.class);
		return new OrderItemDto(rs.getObject("id", UUID.class).toString(), rs.getObject("product_id", UUID.class).toString(),
				variantId == null ? null : variantId.toString(), rs.getString("product_name"), rs.getString("product_image"),
				rs.getString("brand"), rs.getString("variant_name"), rs.getString("color"), rs.getString("storage"),
				rs.getInt("quantity"), rs.getLong("unit_price"), rs.getLong("total_price"));
	}

	private OrderStatusHistoryDto historyDto(ResultSet rs, int rowNum) throws SQLException {
		return new OrderStatusHistoryDto(rs.getObject("id", UUID.class).toString(), rs.getString("from_status"),
				rs.getString("to_status"), rs.getString("note"), rs.getObject("changed_by", UUID.class).toString(),
				rs.getString("changed_by_name"), iso(rs.getObject("created_at", OffsetDateTime.class)));
	}

	private UUID uuid(String value, String field) {
		try {
			return UUID.fromString(value);
		}
		catch (RuntimeException exception) {
			throw new AppException(ErrorCode.VALIDATION_ERROR, "Du lieu dau vao khong hop le",
					Map.of(field, "UUID khong dung dinh dang"));
		}
	}

	private String iso(OffsetDateTime value) {
		return DateTimeFormatter.ISO_OFFSET_DATE_TIME.format(value);
	}

	public record CustomerSnapshot(String name, String email, String phone) {
	}

	private record ProductSnapshot(UUID id, UUID categoryId, String name, String brand, long price, Long originalPrice,
			String status, String image, int variantCount) {
	}

	private record VariantSnapshot(UUID id, String name, String sku, long price, Long originalPrice, int stock, String color,
			String storage, boolean active) {
	}

	private record OrderRecord(UUID id, String orderNumber, UUID customerId, String customerName, String customerEmail,
			String customerPhone, long subtotal, long shippingFee, long discount, long totalAmount, String status,
			String paymentMethod, String paymentStatus, String promotionCode, UUID promotionId, String notes,
			String cancelReason, String cancelledAt, String createdAt, String updatedAt, ShippingAddressDto shippingAddress) {
	}

	private record OrderLine(UUID id, UUID productId, UUID variantId, UUID categoryId, String productName,
			String productImage, String brand, String variantName, String sku, String color, String storage, int quantity,
			long unitPrice, Long originalPrice, long totalPrice) {
		OrderItemDto dto() {
			return new OrderItemDto(id.toString(), productId.toString(), variantId == null ? null : variantId.toString(),
					productName, productImage, brand, variantName, color, storage, quantity, unitPrice, totalPrice);
		}
	}
}

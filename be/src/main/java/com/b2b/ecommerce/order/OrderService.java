package com.b2b.ecommerce.order;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
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
import com.b2b.ecommerce.loyalty.LoyaltyEventService;
import com.b2b.ecommerce.notification.NotificationEventService;
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
	private static final UUID SYSTEM_ADMIN_ID = UUID.fromString("00000000-0000-4000-8000-000000000001");
	private static final String SYSTEM_ADMIN_NAME = "Admin Shipment";

	private final JdbcTemplate jdbc;
	private final PromotionService promotions;
	private final CartService cart;
	private final NotificationEventService notifications;
	private final LoyaltyEventService loyaltyEvents;
	private final VnpayGatewayService vnpayGateway;

	public OrderService(JdbcTemplate jdbc, PromotionService promotions, CartService cart,
			NotificationEventService notifications, LoyaltyEventService loyaltyEvents, VnpayGatewayService vnpayGateway) {
		this.jdbc = jdbc;
		this.promotions = promotions;
		this.cart = cart;
		this.notifications = notifications;
		this.loyaltyEvents = loyaltyEvents;
		this.vnpayGateway = vnpayGateway;
	}

	@Transactional
	public OrderCreateResponse create(UUID userId, CustomerSnapshot customer, OrderCreateRequest request) {
		if (request.items() == null || request.items().isEmpty()) {
			throw new AppException(ErrorCode.ORDER_EMPTY_ITEMS);
		}
		if ((request.shippingAddressId() == null || request.shippingAddressId().isBlank()) && request.shippingAddress() == null) {
			throw new AppException(ErrorCode.ORDER_ADDRESS_REQUIRED);
		}
		String paymentMethod = paymentMethod(request.paymentMethod());
		UUID shippingAddressId = request.shippingAddressId() == null || request.shippingAddressId().isBlank()
				? null
				: uuid(request.shippingAddressId(), "shippingAddressId");
		ShippingAddressDto address = shippingAddressId == null
				? request.shippingAddress().normalized()
				: customerAddress(userId, shippingAddressId);
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
		long shippingFee = subtotal >= 3_000_000 || (promotion != null && "FREE_SHIPPING".equals(promotion.type())) ? 0 : 30_000;
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
				  payment_method, payment_status, promotion_code, promotion_id, discount_amount, notes, shipping_address_id
				)
				VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING', ?::jsonb, ?::payment_method, 'UNPAID',
				        ?, ?, ?, ?, ?)
				""", orderId, orderNumber, userId, customer.name(), customer.email(), customer.phone(), subtotal,
				shippingFee, discount, totalAmount, shippingJson, paymentMethod,
				promotion == null ? null : promotion.code(), promotion == null ? null : UUID.fromString(promotion.id()),
				discount, request.notes(), shippingAddressId);
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
		notifyOrder(orderId, userId, "Don hang da duoc tao",
				"Don hang " + orderNumber + " da duoc tao va dang cho xac nhan.", "MEDIUM", "order_created");
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
				       (ARRAY_AGG(oi.product_id ORDER BY oi.id))[1] AS first_product_id,
				       (ARRAY_AGG(oi.variant_id ORDER BY oi.id))[1] AS first_variant_id,
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
	public Page<AdminOrderSummaryDto> adminOrders(PageRequestParams params, String status, String paymentStatus,
			String dateFrom, String dateTo) {
		int page = params.normalizedPage();
		int pageSize = Math.min(params.normalizedPageSize(), 50);
		List<Object> args = new ArrayList<>();
		StringBuilder where = new StringBuilder("WHERE 1 = 1");
		if (status != null && !status.isBlank()) {
			where.append(" AND o.status = ?::order_status");
			args.add(status.trim().toUpperCase());
		}
		if (paymentStatus != null && !paymentStatus.isBlank()) {
			where.append(" AND o.payment_status = ?::payment_status");
			args.add(paymentStatus.trim().toUpperCase());
		}
		if (params.search() != null && !params.search().isBlank()) {
			where.append("""
					 AND (
					   LOWER(o.order_number) LIKE ?
					   OR LOWER(o.customer_name) LIKE ?
					   OR LOWER(o.customer_phone) LIKE ?
					 )
					""");
			String search = "%" + params.search().trim().toLowerCase() + "%";
			args.add(search);
			args.add(search);
			args.add(search);
		}
		LocalDate from = parseDate(dateFrom, "dateFrom");
		LocalDate to = parseDate(dateTo, "dateTo");
		if (from != null && to != null && from.isAfter(to)) {
			throw new AppException(ErrorCode.VALIDATION_ERROR, "Khoang ngay khong hop le",
					Map.of("dateFrom", "dateFrom phai nho hon hoac bang dateTo"));
		}
		if (from != null) {
			where.append(" AND o.created_at >= ?::date");
			args.add(from);
		}
		if (to != null) {
			where.append(" AND o.created_at < (?::date + INTERVAL '1 day')");
			args.add(to);
		}
		Long total = jdbc.queryForObject("SELECT COUNT(*) FROM orders o " + where, Long.class, args.toArray());
		args.add(pageSize);
		args.add((page - 1) * pageSize);
		List<AdminOrderSummaryDto> content = jdbc.query("""
				SELECT o.id, o.order_number, o.customer_id, o.customer_name, o.customer_phone, o.customer_email,
				       o.status::text AS status, o.payment_status::text AS payment_status,
				       o.payment_method::text AS payment_method, o.subtotal, o.discount, o.shipping_fee,
				       o.total_amount, o.promotion_code, o.created_at, o.updated_at,
				       COUNT(oi.id)::int AS item_count,
				       (ARRAY_AGG(oi.product_id ORDER BY oi.id))[1] AS first_product_id,
				       (ARRAY_AGG(oi.variant_id ORDER BY oi.id))[1] AS first_variant_id,
				       (ARRAY_AGG(oi.product_name ORDER BY oi.id))[1] AS first_product_name,
				       (ARRAY_AGG(oi.product_image ORDER BY oi.id))[1] AS first_product_image,
				       (ARRAY_AGG(oi.variant_name ORDER BY oi.id))[1] AS first_variant_name
				FROM orders o
				LEFT JOIN order_items oi ON oi.order_id = o.id
				""" + where + " " + """
				GROUP BY o.id
				ORDER BY o.created_at DESC
				LIMIT ? OFFSET ?
				""", this::adminSummaryDto, args.toArray());
		return new PageImpl<>(content, PageRequest.of(page - 1, pageSize), total == null ? 0 : total);
	}

	@Transactional(readOnly = true)
	public OrderDto order(UUID userId, String id) {
		OrderRecord order = orderRecord(userId, uuid(id, "id"));
		return detail(order, false);
	}

	@Transactional(readOnly = true)
	public OrderDto adminOrder(String id) {
		OrderRecord order = orderRecord(uuid(id, "id"));
		return detail(order, true);
	}

	@Transactional
	public OrderDto updateNotes(String id, UpdateOrderNotesRequest request) {
		UUID orderId = uuid(id, "id");
		orderRecord(orderId);
		jdbc.update("""
				UPDATE orders
				SET internal_notes = ?,
				    updated_at = NOW()
				WHERE id = ?
				""", request.normalizedNotes(), orderId);
		return adminOrder(id);
	}

	private OrderDto detail(OrderRecord order, boolean includeInternalNotes) {
		List<OrderItemDto> items = jdbc.query("""
				SELECT id, product_id, variant_id, product_name, product_image, brand, variant_name, color, storage,
				       quantity, unit_price, total_price
				FROM order_items
				WHERE order_id = ?
				ORDER BY id
				""", this::orderItemDto, order.id());
		List<OrderStatusHistoryDto> history = jdbc.query("""
				SELECT id, from_status::text AS from_status, to_status::text AS to_status, note, changed_by,
				       changed_by_name, created_at
				FROM order_status_history
				WHERE order_id = ?
				ORDER BY created_at ASC
				""", this::historyDto, order.id());
		return new OrderDto(order.id().toString(), order.orderNumber(), order.customerId().toString(), order.customerName(),
				order.customerPhone(), order.customerEmail(), order.status(), order.paymentStatus(), order.paymentMethod(),
				order.shippingAddress(), items, order.subtotal(), order.discount(), order.shippingFee(), order.totalAmount(),
				order.promotionCode(), order.promotionId() == null ? null : order.promotionId().toString(), order.notes(),
				includeInternalNotes ? order.internalNotes() : null, order.cancelReason(), order.cancelledAt(), history,
				order.createdAt(), order.updatedAt());
	}

	@Transactional
	public OrderDto cancel(UUID userId, String id, CancelOrderRequest request) {
		UUID orderId = uuid(id, "id");
		OrderRecord order = orderRecord(userId, orderId);
		if (!"PENDING".equals(order.status()) && !"CONFIRMED".equals(order.status())) {
			throw new AppException(ErrorCode.ORDER_CANNOT_CANCEL);
		}
		String reason = request == null || request.reason() == null || request.reason().isBlank()
				? "Khach hang huy don"
				: request.reason().trim();
		jdbc.update("""
				UPDATE orders
				SET status = 'CANCELLED',
				    cancel_reason = ?,
				    cancelled_at = NOW(),
				    updated_at = NOW()
				WHERE id = ? AND customer_id = ?
				""", reason, orderId, userId);
		jdbc.update("""
				INSERT INTO order_status_history (id, order_id, from_status, to_status, changed_by, changed_by_name, note)
				VALUES (?, ?, ?::order_status, 'CANCELLED', ?, ?, ?)
				""", UUID.randomUUID(), orderId, order.status(), userId, order.customerName(), reason);
		if ("CONFIRMED".equals(order.status())) {
			releaseReservedStock(orderId);
		}
		if (order.promotionId() != null) {
			jdbc.update("UPDATE promotions SET used_count = GREATEST(used_count - 1, 0) WHERE id = ?", order.promotionId());
		}
		notifyOrder(order.id(), order.customerId(), "Don hang da huy",
				"Don hang " + order.orderNumber() + " da duoc huy.", "MEDIUM", "order_cancelled");
		return order(userId, id);
	}

	@Transactional
	public OrderDto updateStatus(UUID adminId, String adminName, String id, UpdateOrderStatusRequest request) {
		UUID orderId = uuid(id, "id");
		OrderRecord order = orderRecord(orderId);
		String nextStatus = normalizeStatus(request.status());
		if (!canTransition(order.status(), nextStatus)) {
			throw new AppException(ErrorCode.ORDER_INVALID_STATUS_TRANSITION);
		}
		String note = request.note() == null || request.note().isBlank()
				? "Cap nhat trang thai don hang"
				: request.note().trim();
		if ("PENDING".equals(order.status()) && "CONFIRMED".equals(nextStatus)) {
			reserveStock(orderId);
		}
		if ("CANCELLED".equals(nextStatus)) {
			jdbc.update("""
					UPDATE orders
					SET status = ?::order_status,
					    cancel_reason = COALESCE(cancel_reason, ?),
					    cancelled_at = COALESCE(cancelled_at, NOW()),
					    updated_at = NOW()
					WHERE id = ?
					""", nextStatus, note, orderId);
			if ("CONFIRMED".equals(order.status())) {
				releaseReservedStock(orderId);
			}
			if (order.promotionId() != null) {
				jdbc.update("UPDATE promotions SET used_count = GREATEST(used_count - 1, 0) WHERE id = ?",
						order.promotionId());
			}
			cancelInvoice(orderId);
		}
		else {
			if ("CONFIRMED".equals(order.status()) && "SHIPPING".equals(nextStatus)) {
				createInvoice(order);
				createShipment(order);
			}
			if ("SHIPPING".equals(order.status()) && "DELIVERED".equals(nextStatus)) {
				markCodPaidAndInvoicePaid(order);
				markShipmentDelivered(order.id());
				createWarrantyItems(order);
				awardLoyalty(order);
			}
			jdbc.update("""
					UPDATE orders
					SET status = ?::order_status,
					    actual_delivery_date = CASE WHEN ? = 'DELIVERED' THEN CURRENT_DATE ELSE actual_delivery_date END,
					    updated_at = NOW()
					WHERE id = ?
					""", nextStatus, nextStatus, orderId);
		}
		jdbc.update("""
				INSERT INTO order_status_history (id, order_id, from_status, to_status, changed_by, changed_by_name, note)
				VALUES (?, ?, ?::order_status, ?::order_status, ?, ?, ?)
				""", UUID.randomUUID(), orderId, order.status(), nextStatus, adminId, adminName, note);
		notifyOrder(order.id(), order.customerId(), "Cap nhat don hang " + order.orderNumber(),
				orderStatusMessage(order.orderNumber(), nextStatus), "DELIVERED".equals(nextStatus) ? "HIGH" : "MEDIUM",
				"order_status");
		return adminOrder(id);
	}

	@Transactional(readOnly = true)
	public InvoiceDto invoice(UUID userId, String orderIdValue) {
		UUID orderId = uuid(orderIdValue, "id");
		orderRecord(userId, orderId);
		return invoice(orderId);
	}

	@Transactional(readOnly = true)
	public ShipmentDto shipment(UUID userId, String orderIdValue) {
		UUID orderId = uuid(orderIdValue, "id");
		orderRecord(userId, orderId);
		return shipment(orderId);
	}

	@Transactional(readOnly = true)
	public Page<CustomerPaymentDto> customerPayments(UUID userId, PageRequestParams params, String status) {
		int page = params.normalizedPage();
		int pageSize = Math.min(params.normalizedPageSize(), 100);
		List<Object> args = new ArrayList<>();
		args.add(userId);
		StringBuilder where = new StringBuilder("WHERE p.customer_id = ?");
		if (status != null && !status.isBlank()) {
			where.append(" AND p.status = ?::payment_status");
			args.add(paymentStatus(status));
		}
		if (params.search() != null && !params.search().isBlank()) {
			where.append(" AND LOWER(p.order_number) LIKE ?");
			args.add("%" + params.search().trim().toLowerCase() + "%");
		}
		Long total = jdbc.queryForObject("SELECT COUNT(*) FROM payments p " + where, Long.class, args.toArray());
		args.add(pageSize);
		args.add((page - 1) * pageSize);
		List<CustomerPaymentDto> content = jdbc.query("""
				SELECT p.id, p.order_id, p.order_number, p.customer_id, p.amount, p.paid_amount,
				       p.remaining_amount, p.due_date, p.status::text AS status, p.method,
				       p.transaction_ref, p.paid_at, p.created_at
				FROM payments p
				""" + where + " " + """
				ORDER BY p.created_at DESC
				LIMIT ? OFFSET ?
				""", this::customerPaymentRowDto, args.toArray());
		return new PageImpl<>(content, PageRequest.of(page - 1, pageSize), total == null ? 0 : total);
	}

	@Transactional(readOnly = true)
	public CustomerPaymentDto customerPayment(UUID userId, String id) {
		PaymentRecord payment = paymentRecord(uuid(id, "id"));
		if (!payment.customerId().equals(userId)) {
			throw new AppException(ErrorCode.PAYMENT_ACCESS_DENIED);
		}
		return customerPaymentDto(payment);
	}

	@Transactional(readOnly = true)
	public List<PaymentProofDto> customerPaymentProofs(UUID userId, String id) {
		PaymentRecord payment = paymentRecord(uuid(id, "id"));
		if (!payment.customerId().equals(userId)) {
			throw new AppException(ErrorCode.PAYMENT_ACCESS_DENIED);
		}
		return paymentProofs(payment.id());
	}

	@Transactional
	public PaymentProofDto submitPaymentProof(UUID userId, String id, PaymentProofRequest request) {
		PaymentRecord payment = paymentRecord(uuid(id, "id"));
		if (!payment.customerId().equals(userId)) {
			throw new AppException(ErrorCode.PAYMENT_ACCESS_DENIED);
		}
		if ("PAID".equals(payment.status())) {
			throw new AppException(ErrorCode.PAYMENT_ALREADY_PAID);
		}
		if ("REFUNDED".equals(payment.status()) || "PARTIALLY_REFUNDED".equals(payment.status())) {
			throw new AppException(ErrorCode.PAYMENT_REFUNDED);
		}
		long amount = request.amount() == null || request.amount() <= 0 ? payment.remainingAmount() : request.amount();
		String method = proofMethod(request.method(), payment.method());
		UUID proofId = UUID.randomUUID();
		try {
			jdbc.update("""
					INSERT INTO payment_proofs (
					  id, payment_id, order_id, customer_id, proof_url, note, amount, method, transaction_ref, status
					)
					VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING_REVIEW')
					""", proofId, payment.id(), payment.orderId(), payment.customerId(), request.proofUrl().trim(),
					blankToNull(request.note()), amount, method, blankToNull(request.transactionRef()));
		}
		catch (org.springframework.dao.DataIntegrityViolationException exception) {
			throw new AppException(ErrorCode.CONFLICT, "Ma giao dich/chung tu da ton tai",
					Map.of("transactionRef", request.transactionRef()));
		}
		notifyPayment(payment.orderId(), payment.customerId(), "Da gui chung tu thanh toan",
				"Chung tu thanh toan cho don hang " + payment.orderNumber() + " dang cho xac nhan.", "MEDIUM");
		return paymentProof(proofId);
	}

	@Transactional(readOnly = true)
	public Page<AdminPaymentDto> adminPayments(PageRequestParams params, String status, String method) {
		int page = params.normalizedPage();
		int pageSize = Math.min(params.normalizedPageSize(), 100);
		List<Object> args = new ArrayList<>();
		StringBuilder where = new StringBuilder("WHERE 1 = 1");
		if (status != null && !status.isBlank()) {
			where.append(" AND p.status = ?::payment_status");
			args.add(paymentStatus(status));
		}
		if (method != null && !method.isBlank()) {
			where.append(" AND p.method = ?");
			args.add(paymentFilterMethod(method));
		}
		if (params.search() != null && !params.search().isBlank()) {
			where.append("""
					 AND (
					   LOWER(p.order_number) LIKE ?
					   OR LOWER(o.customer_name) LIKE ?
					   OR LOWER(o.customer_phone) LIKE ?
					 )
					""");
			String search = "%" + params.search().trim().toLowerCase() + "%";
			args.add(search);
			args.add(search);
			args.add(search);
		}
		Long total = jdbc.queryForObject("""
				SELECT COUNT(*)
				FROM payments p
				JOIN orders o ON o.id = p.order_id
				""" + where, Long.class, args.toArray());
		args.add(pageSize);
		args.add((page - 1) * pageSize);
		List<AdminPaymentDto> content = jdbc.query("""
				SELECT p.id, p.order_id, p.order_number, p.customer_id, o.customer_name, o.customer_phone,
				       p.amount, p.paid_amount, p.remaining_amount, p.due_date, p.status::text AS status,
				       p.method, p.transaction_ref, p.paid_at, p.refund_amount, p.refund_reason,
				       p.refund_method, p.refunded_at, p.created_at
				FROM payments p
				JOIN orders o ON o.id = p.order_id
				""" + where + " " + """
				ORDER BY p.created_at DESC
				LIMIT ? OFFSET ?
				""", this::adminPaymentDto, args.toArray());
		return new PageImpl<>(content, PageRequest.of(page - 1, pageSize), total == null ? 0 : total);
	}

	@Transactional(readOnly = true)
	public AdminPaymentDto adminPayment(String id) {
		return payment(uuid(id, "id"));
	}

	@Transactional(readOnly = true)
	public Page<InvoiceDto> customerInvoices(UUID userId, PageRequestParams params, String status) {
		int page = params.normalizedPage();
		int pageSize = Math.min(params.normalizedPageSize(), 100);
		List<Object> args = new ArrayList<>();
		args.add(userId);
		StringBuilder where = new StringBuilder("WHERE i.customer_id = ?");
		if (status != null && !status.isBlank()) {
			where.append(" AND i.status = ?::invoice_status");
			args.add(invoiceStatus(status));
		}
		if (params.search() != null && !params.search().isBlank()) {
			where.append(" AND (LOWER(i.order_number) LIKE ? OR LOWER(i.invoice_number) LIKE ?)");
			String search = "%" + params.search().trim().toLowerCase() + "%";
			args.add(search);
			args.add(search);
		}
		Long total = jdbc.queryForObject("SELECT COUNT(*) FROM invoices i " + where, Long.class, args.toArray());
		args.add(pageSize);
		args.add((page - 1) * pageSize);
		List<InvoiceDto> content = jdbc.query("""
				SELECT id, invoice_number, order_id, order_number, customer_id, customer_name,
				       total_amount, tax_amount, discount_amount, status::text AS status, issue_date, due_date, paid_at, created_at
				FROM invoices i
				""" + where + " " + """
				ORDER BY created_at DESC
				LIMIT ? OFFSET ?
				""", this::invoiceRowDto, args.toArray());
		return new PageImpl<>(content, PageRequest.of(page - 1, pageSize), total == null ? 0 : total);
	}

	@Transactional(readOnly = true)
	public InvoiceDto customerInvoice(UUID userId, String id) {
		InvoiceRecord invoice = invoiceRecord(uuid(id, "id"));
		if (!invoice.customerId().equals(userId)) {
			throw new AppException(ErrorCode.INVOICE_ACCESS_DENIED);
		}
		return invoiceDto(invoice);
	}

	@Transactional(readOnly = true)
	public InvoicePdfFile customerInvoicePdf(UUID userId, String id) {
		InvoiceRecord invoice = invoiceRecord(uuid(id, "id"));
		if (!invoice.customerId().equals(userId)) {
			throw new AppException(ErrorCode.INVOICE_ACCESS_DENIED);
		}
		return invoicePdfFile(invoice);
	}

	@Transactional(readOnly = true)
	public Page<InvoiceDto> adminInvoices(PageRequestParams params, String status) {
		int page = params.normalizedPage();
		int pageSize = Math.min(params.normalizedPageSize(), 100);
		List<Object> args = new ArrayList<>();
		StringBuilder where = new StringBuilder("WHERE 1 = 1");
		if (status != null && !status.isBlank()) {
			where.append(" AND i.status = ?::invoice_status");
			args.add(invoiceStatus(status));
		}
		if (params.search() != null && !params.search().isBlank()) {
			where.append("""
					 AND (
					   LOWER(i.invoice_number) LIKE ?
					   OR LOWER(i.order_number) LIKE ?
					   OR LOWER(i.customer_name) LIKE ?
					   OR LOWER(o.customer_phone) LIKE ?
					 )
					""");
			String search = "%" + params.search().trim().toLowerCase() + "%";
			args.add(search);
			args.add(search);
			args.add(search);
			args.add(search);
		}
		Long total = jdbc.queryForObject("""
				SELECT COUNT(*)
				FROM invoices i
				JOIN orders o ON o.id = i.order_id
				""" + where, Long.class, args.toArray());
		args.add(pageSize);
		args.add((page - 1) * pageSize);
		List<InvoiceDto> content = jdbc.query("""
				SELECT i.id, i.invoice_number, i.order_id, i.order_number, i.customer_id, i.customer_name,
				       i.total_amount, i.tax_amount, i.discount_amount, i.status::text AS status, i.issue_date, i.due_date,
				       i.paid_at, i.created_at
				FROM invoices i
				JOIN orders o ON o.id = i.order_id
				""" + where + " " + """
				ORDER BY i.created_at DESC
				LIMIT ? OFFSET ?
				""", this::invoiceRowDto, args.toArray());
		return new PageImpl<>(content, PageRequest.of(page - 1, pageSize), total == null ? 0 : total);
	}

	@Transactional(readOnly = true)
	public InvoiceDto adminInvoice(String id) {
		return invoiceDto(invoiceRecord(uuid(id, "id")));
	}

	@Transactional(readOnly = true)
	public InvoicePdfFile adminInvoicePdf(String id) {
		return invoicePdfFile(invoiceRecord(uuid(id, "id")));
	}

	@Transactional
	public InvoiceDto updateInvoiceStatus(String id, UpdateInvoiceStatusRequest request) {
		UUID invoiceId = uuid(id, "id");
		invoiceRecord(invoiceId);
		String status = invoiceStatus(request.status());
		jdbc.update("""
				UPDATE invoices
				SET status = ?::invoice_status,
				    paid_at = CASE WHEN ? = 'PAID' THEN COALESCE(paid_at, NOW()) ELSE paid_at END
				WHERE id = ?
				""", status, status, invoiceId);
		return adminInvoice(id);
	}

	@Transactional
	public InvoiceDto createAdminInvoice(CreateAdminInvoiceRequest request) {
		OrderRecord order = orderRecord(uuid(request.orderId(), "orderId"));
		Long existing = jdbc.queryForObject("SELECT COUNT(*) FROM invoices WHERE order_id = ?", Long.class, order.id());
		if (existing != null && existing > 0) {
			throw new AppException(ErrorCode.CONFLICT, "Hoa don da ton tai cho don hang nay");
		}
		UUID id = UUID.randomUUID();
		LocalDate dueDate = parseDate(request.dueDate(), "dueDate", LocalDate.now().plusDays(3));
		jdbc.update("""
				INSERT INTO invoices (
				  id, invoice_number, order_id, order_number, customer_id, customer_name,
				  total_amount, tax_amount, discount_amount, status, issue_date, due_date
				)
				VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING', CURRENT_DATE, ?)
				""", id, invoiceNumber(), order.id(), order.orderNumber(), order.customerId(), order.customerName(),
				order.totalAmount(), request.taxAmount() == null ? 0 : request.taxAmount(), order.discount(), dueDate);
		return adminInvoice(id.toString());
	}

	@Transactional
	public void deleteAdminInvoice(String id) {
		int rows = jdbc.update("DELETE FROM invoices WHERE id = ?", uuid(id, "id"));
		if (rows == 0) {
			throw new AppException(ErrorCode.INVOICE_NOT_FOUND);
		}
	}

	@Transactional(readOnly = true)
	public Page<ShipmentDto> adminShipments(PageRequestParams params, String status) {
		int page = params.normalizedPage();
		int pageSize = Math.min(params.normalizedPageSize(), 100);
		List<Object> args = new ArrayList<>();
		StringBuilder where = new StringBuilder("WHERE 1 = 1");
		if (status != null && !status.isBlank()) {
			where.append(" AND s.status = ?::shipment_status");
			args.add(shipmentStatus(status));
		}
		if (params.search() != null && !params.search().isBlank()) {
			where.append("""
					 AND (
					   LOWER(s.order_number) LIKE ?
					   OR LOWER(s.tracking_number) LIKE ?
					   OR LOWER(o.customer_name) LIKE ?
					   OR LOWER(o.customer_phone) LIKE ?
					 )
					""");
			String search = "%" + params.search().trim().toLowerCase() + "%";
			args.add(search);
			args.add(search);
			args.add(search);
			args.add(search);
		}
		Long total = jdbc.queryForObject("""
				SELECT COUNT(*)
				FROM shipments s
				JOIN orders o ON o.id = s.order_id
				""" + where, Long.class, args.toArray());
		args.add(pageSize);
		args.add((page - 1) * pageSize);
		List<ShipmentDto> content = jdbc.query("""
				SELECT s.id, s.order_id, s.order_number, s.tracking_number, s.carrier_name, s.status::text AS status,
				       s.estimated_delivery, s.actual_delivery, s.created_at, s.updated_at
				FROM shipments s
				JOIN orders o ON o.id = s.order_id
				""" + where + " " + """
				ORDER BY s.created_at DESC
				LIMIT ? OFFSET ?
				""", this::shipmentRowDto, args.toArray());
		return new PageImpl<>(content, PageRequest.of(page - 1, pageSize), total == null ? 0 : total);
	}

	@Transactional(readOnly = true)
	public ShipmentDto adminShipment(String id) {
		return shipmentDto(shipmentRecord(uuid(id, "id")));
	}

	@Transactional
	public ShipmentDto createAdminShipment(CreateShipmentRequest request) {
		UUID orderId = uuid(request.orderId(), "orderId");
		OrderRecord order = orderRecord(orderId);
		if (!List.of("CONFIRMED", "SHIPPING").contains(order.status())) {
			throw new AppException(ErrorCode.ORDER_INVALID_STATUS_TRANSITION, ErrorCode.ORDER_INVALID_STATUS_TRANSITION.message(),
					Map.of("status", "Shipment chi duoc tao khi order CONFIRMED hoac SHIPPING"));
		}
		Long existing = jdbc.queryForObject("SELECT COUNT(*) FROM shipments WHERE order_id = ?", Long.class, orderId);
		if (existing != null && existing > 0) {
			throw new AppException(ErrorCode.CONFLICT, "Don hang da co thong tin giao hang",
					Map.of("orderId", request.orderId()));
		}
		String trackingNumber = request.trackingNumber() == null || request.trackingNumber().isBlank()
				? "GHTK-" + order.orderNumber()
				: request.trackingNumber().trim();
		String carrierName = request.carrierName() == null || request.carrierName().isBlank()
				? "Giao Hang Tiet Kiem"
				: request.carrierName().trim();
		String status = request.status() == null || request.status().isBlank()
				? ("SHIPPING".equals(order.status()) ? "IN_TRANSIT" : "AWAITING_PICKUP")
				: shipmentStatus(request.status());
		if (!List.of("AWAITING_PICKUP", "IN_TRANSIT").contains(status)) {
			throw new AppException(ErrorCode.SHIPMENT_INVALID_STATUS_TRANSITION, ErrorCode.SHIPMENT_INVALID_STATUS_TRANSITION.message(),
					Map.of("status", "Shipment moi chi duoc tao voi AWAITING_PICKUP hoac IN_TRANSIT"));
		}
		LocalDate estimatedDelivery = parseDate(request.estimatedDelivery(), "estimatedDelivery", LocalDate.now().plusDays(3));
		UUID shipmentId = UUID.randomUUID();
		try {
			jdbc.update("""
					INSERT INTO shipments (
					  id, order_id, order_number, tracking_number, carrier_name, status, estimated_delivery
					)
					VALUES (?, ?, ?, ?, ?, ?::shipment_status, ?)
					""", shipmentId, order.id(), order.orderNumber(), trackingNumber, carrierName, status, estimatedDelivery);
		}
		catch (org.springframework.dao.DataIntegrityViolationException exception) {
			throw new AppException(ErrorCode.CONFLICT, "Ma van don da ton tai", Map.of("trackingNumber", trackingNumber));
		}
		return adminShipment(shipmentId.toString());
	}

	@Transactional
	public ShipmentDto updateShipmentTracking(String id, UpdateShipmentTrackingRequest request) {
		UUID shipmentId = uuid(id, "id");
		shipmentRecord(shipmentId);
		LocalDate estimatedDelivery = parseDate(request.estimatedDelivery(), "estimatedDelivery", null);
		try {
			jdbc.update("""
					UPDATE shipments
					SET tracking_number = ?,
					    carrier_name = ?,
					    estimated_delivery = COALESCE(?, estimated_delivery),
					    updated_at = NOW()
					WHERE id = ?
					""", request.trackingNumber().trim(), request.carrierName().trim(), estimatedDelivery, shipmentId);
		}
		catch (org.springframework.dao.DataIntegrityViolationException exception) {
			throw new AppException(ErrorCode.CONFLICT, "Ma van don da ton tai",
					Map.of("trackingNumber", request.trackingNumber().trim()));
		}
		return adminShipment(id);
	}

	@Transactional
	public ShipmentDto updateShipmentStatus(String id, UpdateShipmentStatusRequest request) {
		UUID shipmentId = uuid(id, "id");
		ShipmentRecord shipment = shipmentRecord(shipmentId);
		String nextStatus = shipmentStatus(request.status());
		if (!canTransitionShipment(shipment.status(), nextStatus)) {
			throw new AppException(ErrorCode.SHIPMENT_INVALID_STATUS_TRANSITION);
		}
		jdbc.update("""
				UPDATE shipments
				SET status = ?::shipment_status,
				    actual_delivery = CASE WHEN ? = 'DELIVERED' THEN COALESCE(actual_delivery, NOW()) ELSE actual_delivery END,
				    updated_at = NOW()
				WHERE id = ?
				""", nextStatus, nextStatus, shipmentId);
		if ("DELIVERED".equals(nextStatus)) {
			OrderRecord order = orderRecord(shipment.orderId());
			if ("SHIPPING".equals(order.status())) {
				markCodPaidAndInvoicePaid(order);
				jdbc.update("""
						UPDATE orders
						SET status = 'DELIVERED',
						    actual_delivery_date = CURRENT_DATE,
						    updated_at = NOW()
						WHERE id = ?
						""", order.id());
				createWarrantyItems(order);
				awardLoyalty(order);
				jdbc.update("""
						INSERT INTO order_status_history (id, order_id, from_status, to_status, changed_by, changed_by_name, note)
						VALUES (?, ?, 'SHIPPING', 'DELIVERED', ?, ?, ?)
						""", UUID.randomUUID(), order.id(), SYSTEM_ADMIN_ID, SYSTEM_ADMIN_NAME,
						"Shipment marked delivered");
				notifyOrder(order.id(), order.customerId(), "Don hang da giao thanh cong",
						"Don hang " + order.orderNumber() + " da duoc giao thanh cong.", "HIGH", "order_delivered");
			}
		}
		return adminShipment(id);
	}

	private InvoicePdfFile invoicePdfFile(InvoiceRecord invoice) {
		String text = """
				CELLPHONES INVOICE
				Invoice: %s
				Order: %s
				Customer: %s
				Status: %s
				Issue date: %s
				Due date: %s
				Subtotal: %d VND
				Discount: %d VND
				Tax: %d VND
				Grand total: %d VND
				""".formatted(invoice.invoiceNumber(), invoice.orderNumber(), invoice.customerName(), invoice.status(),
				invoice.issueDate(), invoice.dueDate(), invoice.totalAmount() + invoice.discountAmount() - invoice.taxAmount(),
				invoice.discountAmount(), invoice.taxAmount(), invoice.totalAmount());
		return new InvoicePdfFile(invoice.invoiceNumber() + ".pdf", simplePdf(text));
	}

	@Transactional(readOnly = true)
	public Page<ShipmentDto> customerShipments(UUID userId, PageRequestParams params, String status) {
		int page = params.normalizedPage();
		int pageSize = Math.min(params.normalizedPageSize(), 100);
		List<Object> args = new ArrayList<>();
		args.add(userId);
		StringBuilder where = new StringBuilder("WHERE o.customer_id = ?");
		if (status != null && !status.isBlank()) {
			where.append(" AND s.status = ?::shipment_status");
			args.add(shipmentStatus(status));
		}
		if (params.search() != null && !params.search().isBlank()) {
			where.append(" AND (LOWER(s.order_number) LIKE ? OR LOWER(s.tracking_number) LIKE ?)");
			String search = "%" + params.search().trim().toLowerCase() + "%";
			args.add(search);
			args.add(search);
		}
		Long total = jdbc.queryForObject("""
				SELECT COUNT(*)
				FROM shipments s
				JOIN orders o ON o.id = s.order_id
				""" + where, Long.class, args.toArray());
		args.add(pageSize);
		args.add((page - 1) * pageSize);
		List<ShipmentDto> content = jdbc.query("""
				SELECT s.id, s.order_id, s.order_number, s.tracking_number, s.carrier_name, s.status::text AS status,
				       s.estimated_delivery, s.actual_delivery, s.created_at, s.updated_at
				FROM shipments s
				JOIN orders o ON o.id = s.order_id
				""" + where + " " + """
				ORDER BY s.created_at DESC
				LIMIT ? OFFSET ?
				""", this::shipmentRowDto, args.toArray());
		return new PageImpl<>(content, PageRequest.of(page - 1, pageSize), total == null ? 0 : total);
	}

	@Transactional(readOnly = true)
	public ShipmentDto customerShipment(UUID userId, String id) {
		ShipmentRecord shipment = shipmentRecord(uuid(id, "id"));
		if (!shipment.customerId().equals(userId)) {
			throw new AppException(ErrorCode.SHIPMENT_ACCESS_DENIED);
		}
		return shipmentDto(shipment);
	}

	@Transactional
	public AdminPaymentDto markPaymentPaid(String id, MarkPaymentPaidRequest request) {
		UUID paymentId = uuid(id, "id");
		PaymentRecord payment = paymentRecord(paymentId);
		if ("PAID".equals(payment.status())) {
			throw new AppException(ErrorCode.PAYMENT_ALREADY_PAID);
		}
		if ("REFUNDED".equals(payment.status()) || "PARTIALLY_REFUNDED".equals(payment.status())) {
			throw new AppException(ErrorCode.PAYMENT_REFUNDED);
		}
		String method = paymentRecordMethod(request.method());
		long newPaidAmount = Math.min(payment.amount(), payment.paidAmount() + request.paidAmount());
		long remainingAmount = Math.max(0, payment.amount() - newPaidAmount);
		boolean fullyPaid = remainingAmount == 0;
		jdbc.update("""
				UPDATE payments
				SET paid_amount = ?,
				    remaining_amount = ?,
				    status = CASE WHEN ? THEN 'PAID'::payment_status ELSE status END,
				    method = ?,
				    transaction_ref = ?,
				    paid_at = CASE WHEN ? THEN COALESCE(paid_at, NOW()) ELSE paid_at END
				WHERE id = ?
				""", newPaidAmount, remainingAmount, fullyPaid, method, request.transactionRef().trim(), fullyPaid, paymentId);
		if (fullyPaid) {
			jdbc.update("UPDATE orders SET payment_status = 'PAID' WHERE id = ?", payment.orderId());
			jdbc.update("""
					UPDATE invoices
					SET status = 'PAID',
					    paid_at = COALESCE(paid_at, NOW())
					WHERE order_id = ? AND status = 'PENDING'
					""", payment.orderId());
			notifyPayment(payment.orderId(), payment.customerId(), "Thanh toan thanh cong",
					"Thanh toan cho don hang " + payment.orderNumber() + " da duoc ghi nhan.", "HIGH");
		}
		return payment(paymentId);
	}

	@Transactional
	public PaymentGatewaySessionDto createGatewaySession(UUID userId, String id, CreatePaymentSessionRequest request) {
		UUID paymentId = uuid(id, "id");
		PaymentRecord payment = paymentRecord(paymentId);
		if (!payment.customerId().equals(userId)) {
			throw new AppException(ErrorCode.PAYMENT_ACCESS_DENIED);
		}
		if ("PAID".equals(payment.status())) {
			throw new AppException(ErrorCode.PAYMENT_ALREADY_PAID);
		}
		if ("REFUNDED".equals(payment.status()) || "PARTIALLY_REFUNDED".equals(payment.status())) {
			throw new AppException(ErrorCode.PAYMENT_REFUNDED);
		}
		String provider = gatewayProvider(request == null ? null : request.provider());
		if (!provider.equals(payment.method())) {
			throw new AppException(ErrorCode.VALIDATION_ERROR, "Du lieu dau vao khong hop le",
					Map.of("provider", "Provider phai khop voi payment.method MOMO hoac VNPAY"));
		}
		if (payment.remainingAmount() <= 0) {
			throw new AppException(ErrorCode.PAYMENT_ALREADY_PAID);
		}
		PaymentGatewaySession existing = pendingGatewaySession(paymentId, provider);
		if (existing != null) {
			return gatewaySessionDto(existing);
		}
		String requestId = gatewayRequestId(provider);
		String paymentUrl = localGatewayPaymentUrl(provider, requestId);
		if ("VNPAY".equals(provider)) {
			VnpayGatewayService.PaymentUrl vnpayUrl = vnpayGateway.createPaymentUrl(new VnpayGatewayService.VnpayPaymentRequest(
					requestId,
					payment.remainingAmount(),
					"Thanh toan don hang " + payment.orderNumber(),
					request == null ? null : request.orderType(),
					request == null ? null : request.locale(),
					request == null ? null : request.bankCode(),
					request == null ? null : request.ipAddress()));
			paymentUrl = vnpayUrl.url();
		}
		jdbc.update("""
				INSERT INTO payment_gateway_sessions (
				  id, payment_id, order_id, provider, request_id, amount, status, payment_url, return_url, callback_url,
				  raw_payload
				)
				VALUES (?, ?, ?, ?, ?, ?, 'PENDING', ?, ?, ?, ?::jsonb)
				""", UUID.randomUUID(), payment.id(), payment.orderId(), provider, requestId, payment.remainingAmount(),
				paymentUrl, blankToNull(request == null ? null : request.returnUrl()),
				blankToNull(request == null ? null : request.callbackUrl()),
				gatewayPayload(provider, requestId, null, "PENDING", payment.remainingAmount()));
		return gatewaySessionDto(gatewaySession(requestId));
	}

	@Transactional
	public PaymentGatewayResultDto gatewayCallback(PaymentGatewayCallbackRequest request) {
		if (request == null || request.requestId() == null || request.requestId().isBlank()) {
			throw new AppException(ErrorCode.VALIDATION_ERROR, "Du lieu dau vao khong hop le",
					Map.of("requestId", "requestId la bat buoc"));
		}
		return applyGatewayResult(request.provider(), request.requestId(), request.transactionRef(), request.status(),
				request.amount());
	}

	@Transactional
	public PaymentGatewayResultDto gatewayReturn(Map<String, String> params) {
		return gatewayReturnOutcome(params).result();
	}

	@Transactional
	public PaymentGatewayReturnOutcome gatewayReturnOutcome(Map<String, String> params) {
		PaymentGatewayResultDto result;
		if (params != null && params.containsKey("vnp_TxnRef")) {
			VnpayGatewayService.VnpayReturnResult vnpayResult = vnpayGateway.parseAndVerify(params);
			PaymentGatewayResultDto paymentResult = applyGatewayResult("VNPAY", vnpayResult.requestId(),
					vnpayResult.transactionRef(), vnpayResult.status(), vnpayResult.amount());
			return new PaymentGatewayReturnOutcome(paymentResult, gatewayRedirectUrl(paymentResult));
		}
		String requestId = params == null ? null : params.get("requestId");
		String provider = params == null ? null : params.get("provider");
		String transactionRef = params == null ? null : params.get("transactionRef");
		String status = params == null ? null : params.getOrDefault("status", "SUCCESS");
		Long amount = null;
		if (params != null && params.get("amount") != null && !params.get("amount").isBlank()) {
			amount = Long.parseLong(params.get("amount"));
		}
		result = applyGatewayResult(provider, requestId, transactionRef, status, amount);
		return new PaymentGatewayReturnOutcome(result, gatewayRedirectUrl(result));
	}

	@Transactional
	public AdminPaymentDto markPaymentOverdue(String id) {
		UUID paymentId = uuid(id, "id");
		PaymentRecord payment = paymentRecord(paymentId);
		if ("PAID".equals(payment.status())) {
			throw new AppException(ErrorCode.PAYMENT_ALREADY_PAID);
		}
		if ("REFUNDED".equals(payment.status()) || "PARTIALLY_REFUNDED".equals(payment.status())) {
			throw new AppException(ErrorCode.PAYMENT_REFUNDED);
		}
		jdbc.update("""
				UPDATE payments
				SET status = 'OVERDUE'::payment_status
				WHERE id = ?
				""", paymentId);
		return payment(paymentId);
	}

	@Transactional
	public AdminPaymentDto refundPayment(String id, RefundPaymentRequest request) {
		UUID paymentId = uuid(id, "id");
		PaymentRecord payment = paymentRecord(paymentId);
		if ("REFUNDED".equals(payment.status())) {
			throw new AppException(ErrorCode.PAYMENT_REFUNDED);
		}
		if (!"PAID".equals(payment.status()) && !"PARTIALLY_REFUNDED".equals(payment.status())) {
			throw new AppException(ErrorCode.PAYMENT_NOT_PAID);
		}
		long alreadyRefunded = payment.refundAmount() == null ? 0 : payment.refundAmount();
		long nextRefundTotal = alreadyRefunded + request.refundAmount();
		if (nextRefundTotal > payment.paidAmount()) {
			throw new AppException(ErrorCode.REFUND_AMOUNT_EXCEEDS_PAID);
		}
		String nextStatus = nextRefundTotal == payment.paidAmount() ? "REFUNDED" : "PARTIALLY_REFUNDED";
		String method = refundMethod(request.method());
		jdbc.update("""
				UPDATE payments
				SET status = ?::payment_status,
				    refund_amount = ?,
				    refund_reason = ?,
				    refund_method = ?,
				    refunded_at = NOW()
				WHERE id = ?
				""", nextStatus, nextRefundTotal, request.normalizedReason(), method, paymentId);
		jdbc.update("UPDATE orders SET payment_status = ?::payment_status WHERE id = ?", nextStatus, payment.orderId());
		if ("REFUNDED".equals(nextStatus)) {
			loyaltyEvents.reverseEarnedPoints(payment.orderId(), "Hoan tien thanh toan");
		}
		notifyPayment(payment.orderId(), payment.customerId(), "Thanh toan da hoan tien",
				"Don hang " + payment.orderNumber() + " da duoc ghi nhan hoan tien.", "HIGH");
		return payment(paymentId);
	}

	private PaymentGatewayResultDto applyGatewayResult(String providerValue, String requestIdValue, String transactionRefValue,
			String statusValue, Long amountValue) {
		String requestId = requestIdValue == null ? "" : requestIdValue.trim();
		PaymentGatewaySession session = gatewaySession(requestId);
		String provider = providerValue == null || providerValue.isBlank() ? session.provider() : gatewayProvider(providerValue);
		if (!session.provider().equals(provider)) {
			throw new AppException(ErrorCode.VALIDATION_ERROR, "Du lieu dau vao khong hop le",
					Map.of("provider", "Provider khong khop voi phien thanh toan"));
		}
		String gatewayStatus = gatewayStatus(statusValue);
		String transactionRef = blankToNull(transactionRefValue);
		long amount = amountValue == null ? session.amount() : amountValue;
		if (amount != session.amount()) {
			throw new AppException(ErrorCode.VALIDATION_ERROR, "Du lieu dau vao khong hop le",
					Map.of("amount", "So tien callback khong khop voi phien thanh toan"));
		}
		PaymentRecord payment = paymentRecord(session.paymentId());
		if ("PAID".equals(session.status()) || "PAID".equals(payment.status())) {
			if ("PAID".equals(payment.status()) && !"PAID".equals(session.status())) {
				markGatewaySessionPaid(session, transactionRef == null ? payment.transactionRef() : transactionRef,
						gatewayPayload(provider, requestId, transactionRef, gatewayStatus, amount));
			}
			return gatewayResult(gatewaySession(requestId));
		}
		if ("SUCCESS".equals(gatewayStatus) || "PAID".equals(gatewayStatus)) {
			String finalTransactionRef = transactionRef == null ? provider + "-" + requestId : transactionRef;
			jdbc.update("""
					UPDATE payments
					SET paid_amount = amount,
					    remaining_amount = 0,
					    status = 'PAID',
					    method = ?,
					    transaction_ref = ?,
					    paid_at = COALESCE(paid_at, NOW())
					WHERE id = ? AND status <> 'PAID'
					""", provider, finalTransactionRef, payment.id());
			jdbc.update("UPDATE orders SET payment_status = 'PAID' WHERE id = ?", payment.orderId());
			jdbc.update("""
					UPDATE invoices
					SET status = 'PAID',
					    paid_at = COALESCE(paid_at, NOW())
					WHERE order_id = ? AND status IN ('PENDING', 'OVERDUE')
					""", payment.orderId());
			markGatewaySessionPaid(session, finalTransactionRef,
					gatewayPayload(provider, requestId, finalTransactionRef, gatewayStatus, amount));
			notifyPayment(payment.orderId(), payment.customerId(), "Thanh toan " + provider + " thanh cong",
					"Don hang " + payment.orderNumber() + " da thanh toan thanh cong qua " + provider + ".", "HIGH");
			return gatewayResult(gatewaySession(requestId));
		}
		String finalStatus = "CANCELLED".equals(gatewayStatus) ? "CANCELLED" : "FAILED";
		jdbc.update("""
				UPDATE payment_gateway_sessions
				SET status = ?,
				    transaction_ref = COALESCE(?, transaction_ref),
				    raw_payload = ?::jsonb,
				    updated_at = NOW()
				WHERE request_id = ? AND status = 'PENDING'
				""", finalStatus, transactionRef, gatewayPayload(provider, requestId, transactionRef, gatewayStatus, amount),
				requestId);
		notifyPayment(payment.orderId(), payment.customerId(), "Thanh toan khong thanh cong",
				"Giao dich " + provider + " cho don hang " + payment.orderNumber() + " co trang thai " + finalStatus + ".",
				"MEDIUM");
		return gatewayResult(gatewaySession(requestId));
	}

	private void markGatewaySessionPaid(PaymentGatewaySession session, String transactionRef, String payload) {
		jdbc.update("""
				UPDATE payment_gateway_sessions
				SET status = 'PAID',
				    transaction_ref = COALESCE(?, transaction_ref),
				    raw_payload = ?::jsonb,
				    paid_at = COALESCE(paid_at, NOW()),
				    updated_at = NOW()
				WHERE id = ?
				""", transactionRef, payload, session.id());
	}

	private PaymentGatewaySession pendingGatewaySession(UUID paymentId, String provider) {
		List<PaymentGatewaySession> sessions = jdbc.query("""
				SELECT id, payment_id, order_id, provider, request_id, transaction_ref, amount, status, payment_url,
				       return_url, callback_url, paid_at, created_at
				FROM payment_gateway_sessions
				WHERE payment_id = ? AND provider = ? AND status = 'PENDING'
				ORDER BY created_at DESC
				LIMIT 1
				""", this::gatewaySessionRecord, paymentId, provider);
		return sessions.isEmpty() ? null : sessions.get(0);
	}

	private PaymentGatewaySession gatewaySession(String requestId) {
		try {
			return jdbc.queryForObject("""
					SELECT id, payment_id, order_id, provider, request_id, transaction_ref, amount, status, payment_url,
					       return_url, callback_url, paid_at, created_at
					FROM payment_gateway_sessions
					WHERE request_id = ?
					""", this::gatewaySessionRecord, requestId);
		}
		catch (EmptyResultDataAccessException exception) {
			throw new AppException(ErrorCode.PAYMENT_GATEWAY_SESSION_NOT_FOUND);
		}
	}

	private PaymentGatewayResultDto gatewayResult(PaymentGatewaySession session) {
		PaymentRecord payment = paymentRecord(session.paymentId());
		return new PaymentGatewayResultDto(session.requestId(), session.provider(), session.status(),
				session.transactionRef(), session.amount(), session.paymentId().toString(), session.orderId().toString(),
				customerPaymentDto(payment));
	}

	private String gatewayRedirectUrl(PaymentGatewayResultDto result) {
		PaymentGatewaySession session = gatewaySession(result.requestId());
		String returnUrl = blankToNull(session.returnUrl());
		if (returnUrl == null) {
			return null;
		}
		String separator = returnUrl.contains("?") ? "&" : "?";
		return returnUrl + separator
				+ "requestId=" + url(result.requestId())
				+ "&paymentId=" + url(result.paymentId())
				+ "&orderId=" + url(result.orderId())
				+ "&provider=" + url(result.provider())
				+ "&status=" + url(result.status());
	}

	private PaymentGatewaySessionDto gatewaySessionDto(PaymentGatewaySession session) {
		return new PaymentGatewaySessionDto(session.id().toString(), session.paymentId().toString(),
				session.orderId().toString(), session.provider(), session.requestId(), session.transactionRef(),
				session.amount(), session.status(), session.paymentUrl(), session.returnUrl(), session.callbackUrl(),
				session.paidAt() == null ? null : iso(session.paidAt()), iso(session.createdAt()));
	}

	private void reserveStock(UUID orderId) {
		List<OrderStockLine> lines = jdbc.query("""
				SELECT oi.id AS order_item_id, oi.product_id, oi.variant_id, oi.quantity
				FROM order_items oi
				WHERE oi.order_id = ?
				ORDER BY oi.id
				""", this::orderStockLine, orderId);
		for (OrderStockLine line : lines) {
			if (line.variantId() == null) {
				throw new AppException(ErrorCode.PRODUCT_VARIANT_NOT_FOUND, "San pham can co bien the de reserve ton kho");
			}
			Integer changed = jdbc.update("""
					UPDATE product_variants
					SET stock = stock - ?,
					    updated_at = NOW()
					WHERE id = ? AND stock >= ?
					""", line.quantity(), line.variantId(), line.quantity());
			if (changed == null || changed == 0) {
				throw new AppException(ErrorCode.ORDER_INSUFFICIENT_STOCK, ErrorCode.ORDER_INSUFFICIENT_STOCK.message(),
						Map.of("productId", line.productId().toString(), "variantId", line.variantId().toString(),
								"requestedQuantity", line.quantity()));
			}
			jdbc.update("""
					INSERT INTO order_stock_reservations (id, order_id, order_item_id, product_id, variant_id, quantity)
					VALUES (?, ?, ?, ?, ?, ?)
					ON CONFLICT (order_item_id) DO NOTHING
					""", UUID.randomUUID(), orderId, line.orderItemId(), line.productId(), line.variantId(), line.quantity());
		}
	}

	private void releaseReservedStock(UUID orderId) {
		List<OrderStockLine> lines = jdbc.query("""
				SELECT order_item_id, product_id, variant_id, quantity
				FROM order_stock_reservations
				WHERE order_id = ? AND released_at IS NULL
				ORDER BY order_item_id
				""", this::orderStockLine, orderId);
		for (OrderStockLine line : lines) {
			jdbc.update("""
					UPDATE product_variants
					SET stock = stock + ?,
					    updated_at = NOW()
					WHERE id = ?
					""", line.quantity(), line.variantId());
		}
		jdbc.update("""
				UPDATE order_stock_reservations
				SET released_at = NOW()
				WHERE order_id = ? AND released_at IS NULL
				""", orderId);
	}

	private void createInvoice(OrderRecord order) {
		Long existing = jdbc.queryForObject("SELECT COUNT(*) FROM invoices WHERE order_id = ?", Long.class, order.id());
		if (existing != null && existing > 0) {
			return;
		}
		jdbc.update("""
				INSERT INTO invoices (
				  id, invoice_number, order_id, order_number, customer_id, customer_name,
				  total_amount, tax_amount, discount_amount, status, issue_date, due_date
				)
				VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?, 'PENDING', CURRENT_DATE, CURRENT_DATE + 3)
				""", UUID.randomUUID(), invoiceNumber(), order.id(), order.orderNumber(), order.customerId(),
				order.customerName(), order.totalAmount(), order.discount());
	}

	private void createShipment(OrderRecord order) {
		Long existing = jdbc.queryForObject("SELECT COUNT(*) FROM shipments WHERE order_id = ?", Long.class, order.id());
		if (existing != null && existing > 0) {
			jdbc.update("""
					UPDATE shipments
					SET status = 'IN_TRANSIT',
					    updated_at = NOW()
					WHERE order_id = ? AND status = 'AWAITING_PICKUP'
					""", order.id());
			return;
		}
		jdbc.update("""
				INSERT INTO shipments (
				  id, order_id, order_number, tracking_number, carrier_name, status, estimated_delivery
				)
				VALUES (?, ?, ?, ?, ?, 'IN_TRANSIT', CURRENT_DATE + 3)
				""", UUID.randomUUID(), order.id(), order.orderNumber(), "GHTK-" + order.orderNumber(),
				"Giao Hang Tiet Kiem");
	}

	private void markShipmentDelivered(UUID orderId) {
		jdbc.update("""
				UPDATE shipments
				SET status = 'DELIVERED',
				    actual_delivery = COALESCE(actual_delivery, NOW()),
				    updated_at = NOW()
				WHERE order_id = ?
				""", orderId);
	}

	private void awardLoyalty(OrderRecord order) {
		jdbc.update("""
				INSERT INTO loyalty_programs (id, customer_id, customer_name, customer_email)
				VALUES (?, ?, ?, ?)
				ON CONFLICT (customer_id) DO NOTHING
				""", UUID.randomUUID(), order.customerId(), order.customerName(), order.customerEmail());
		LoyaltySnapshot loyalty = jdbc.queryForObject("""
				SELECT id, points, total_earned_points, tier::text AS tier
				FROM loyalty_programs
				WHERE customer_id = ?
				""", (rs, rowNum) -> new LoyaltySnapshot(rs.getObject("id", UUID.class), rs.getInt("points"),
				rs.getInt("total_earned_points"), rs.getString("tier")), order.customerId());
		if (loyalty == null) {
			return;
		}
		Integer existing = jdbc.queryForObject("""
				SELECT COUNT(*) FROM loyalty_transactions WHERE order_id = ? AND type = 'EARN'
				""", Integer.class, order.id());
		if (existing != null && existing > 0) {
			return;
		}
		int earned = loyaltyPoints(order.totalAmount(), loyalty.tier());
		if (earned <= 0) {
			return;
		}
		int newBalance = loyalty.points() + earned;
		int newTotalEarned = loyalty.totalEarnedPoints() + earned;
		jdbc.update("""
				UPDATE loyalty_programs
				SET points = ?, total_earned_points = ?, total_spend = total_spend + ?, tier = ?::loyalty_tier,
				    points_expiry = CURRENT_DATE + 365, updated_at = NOW()
				WHERE id = ?
				""", newBalance, newTotalEarned, order.totalAmount(), loyaltyTier(newTotalEarned), loyalty.id());
		jdbc.update("""
				INSERT INTO loyalty_transactions (
				  id, loyalty_program_id, customer_id, type, points, balance_after, description, order_id
				)
				VALUES (?, ?, ?, 'EARN', ?, ?, ?, ?)
				""", UUID.randomUUID(), loyalty.id(), order.customerId(), earned, newBalance,
				"Tich diem tu don hang " + order.orderNumber(), order.id());
		notifications.send(order.customerId(), "LOYALTY", "Da cong diem thanh vien",
				"Ban nhan duoc " + earned + " diem tu don hang " + order.orderNumber() + ".", "MEDIUM", "loyalty",
				"ORDER", order.id(), "/loyalty", "Xem diem");
	}

	private void createWarrantyItems(OrderRecord order) {
		List<WarrantySeedLine> lines = jdbc.query("""
				SELECT oi.id AS order_item_id, oi.product_id, oi.product_name, oi.product_image, oi.brand,
				       oi.sku, oi.quantity, COALESCE(p.warranty, 12) AS warranty_months
				FROM order_items oi
				LEFT JOIN products p ON p.id = oi.product_id
				WHERE oi.order_id = ?
				ORDER BY oi.id
				""", this::warrantySeedLine, order.id());
		for (WarrantySeedLine line : lines) {
			Integer existing = jdbc.queryForObject("""
					SELECT COUNT(*) FROM warranty_items
					WHERE order_id = ? AND order_item_id = ? AND customer_id = ?
					""", Integer.class, order.id(), line.orderItemId(), order.customerId());
			int missing = line.quantity() - (existing == null ? 0 : existing);
			for (int unit = 1; unit <= missing; unit++) {
				String serial = warrantySerial(order.orderNumber(), line, (existing == null ? 0 : existing) + unit);
				jdbc.update("""
						INSERT INTO warranty_items (
						  id, order_id, order_item_id, product_id, customer_id, customer_name, customer_phone,
						  product_name, product_image, brand, serial_number, warranty_months, warranty_start, warranty_expiry, status
						)
						VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_DATE,
						        (CURRENT_DATE + (? || ' months')::interval)::date, 'ACTIVE')
						""", UUID.randomUUID(), order.id(), line.orderItemId(), line.productId(), order.customerId(),
						order.customerName(), order.customerPhone(), line.productName(), line.productImage(), line.brand(),
						serial, line.warrantyMonths(), line.warrantyMonths());
			}
		}
	}

	private int loyaltyPoints(long amount, String tier) {
		double multiplier = switch (tier) {
			case "GOLD" -> 1.5;
			case "DIAMOND" -> 2.0;
			default -> 1.0;
		};
		return (int) Math.floor((amount / 100_000.0) * multiplier);
	}

	private String loyaltyTier(int totalEarnedPoints) {
		if (totalEarnedPoints >= 20_000) {
			return "DIAMOND";
		}
		if (totalEarnedPoints >= 5_000) {
			return "GOLD";
		}
		if (totalEarnedPoints >= 1_000) {
			return "SILVER";
		}
		return "BRONZE";
	}

	private void markCodPaidAndInvoicePaid(OrderRecord order) {
		if (!"COD".equals(order.paymentMethod())) {
			return;
		}
		jdbc.update("""
				UPDATE payments
				SET status = 'PAID',
				    paid_amount = amount,
				    remaining_amount = 0,
				    paid_at = NOW()
				WHERE order_id = ? AND status = 'UNPAID'
				""", order.id());
		jdbc.update("""
				UPDATE orders
				SET payment_status = 'PAID'
				WHERE id = ?
				""", order.id());
		jdbc.update("""
				UPDATE invoices
				SET status = 'PAID',
				    paid_at = NOW()
				WHERE order_id = ? AND status = 'PENDING'
				""", order.id());
		notifyPayment(order.id(), order.customerId(), "Thanh toan COD thanh cong",
				"Don hang " + order.orderNumber() + " da duoc ghi nhan thanh toan COD.", "HIGH");
	}

	private void notifyOrder(UUID orderId, UUID customerId, String title, String message, String priority, String category) {
		notifications.send(customerId, "ORDER", title, message, priority, category, "ORDER", orderId,
				"/orders/" + orderId, "Xem don hang");
	}

	private void notifyPayment(UUID orderId, UUID customerId, String title, String message, String priority) {
		notifications.send(customerId, "PAYMENT", title, message, priority, "payment", "ORDER", orderId,
				"/orders/" + orderId, "Xem don hang");
	}

	private String orderStatusMessage(String orderNumber, String status) {
		return switch (status) {
			case "CONFIRMED" -> "Don hang " + orderNumber + " da duoc xac nhan.";
			case "SHIPPING" -> "Don hang " + orderNumber + " dang duoc giao.";
			case "DELIVERED" -> "Don hang " + orderNumber + " da giao thanh cong.";
			case "CANCELLED" -> "Don hang " + orderNumber + " da bi huy.";
			case "RETURNED" -> "Don hang " + orderNumber + " da cap nhat tra hang.";
			default -> "Don hang " + orderNumber + " da duoc cap nhat.";
		};
	}

	private String warrantySerial(String orderNumber, WarrantySeedLine line, int unit) {
		String sku = line.sku() == null || line.sku().isBlank()
				? line.productId().toString().substring(0, 8).toUpperCase()
				: line.sku().trim().replaceAll("[^A-Za-z0-9-]", "").toUpperCase();
		return "WR-" + orderNumber + "-" + sku + "-" + String.format("%02d", unit);
	}

	private void cancelInvoice(UUID orderId) {
		jdbc.update("""
				UPDATE invoices
				SET status = 'CANCELLED'
				WHERE order_id = ? AND status <> 'CANCELLED'
				""", orderId);
	}

	private PaymentRecord paymentRecord(UUID paymentId) {
		try {
			return jdbc.queryForObject("""
					SELECT p.id, p.order_id, p.order_number, p.customer_id, o.customer_name, o.customer_phone,
					       p.amount, p.paid_amount, p.remaining_amount, p.due_date, p.status::text AS status,
					       p.method, p.transaction_ref, p.paid_at, p.refund_amount, p.refund_reason,
					       p.refund_method, p.refunded_at, p.created_at
					FROM payments p
					JOIN orders o ON o.id = p.order_id
					WHERE p.id = ?
					""", this::paymentRecord, paymentId);
		}
		catch (EmptyResultDataAccessException exception) {
			throw new AppException(ErrorCode.PAYMENT_NOT_FOUND);
		}
	}

	private AdminPaymentDto payment(UUID paymentId) {
		PaymentRecord payment = paymentRecord(paymentId);
		return new AdminPaymentDto(payment.id().toString(), payment.orderId().toString(), payment.orderNumber(),
				payment.customerId().toString(), payment.customerName(), payment.customerPhone(), payment.amount(),
				payment.paidAmount(), payment.remainingAmount(), payment.dueDate().toString(), payment.status(),
				payment.method(), payment.transactionRef(), payment.paidAt() == null ? null : iso(payment.paidAt()),
				payment.refundAmount(), payment.refundReason(), payment.refundMethod(),
				payment.refundedAt() == null ? null : iso(payment.refundedAt()),
				iso(payment.createdAt()));
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

	private ShippingAddressDto customerAddress(UUID userId, UUID addressId) {
		try {
			return jdbc.queryForObject("""
					SELECT full_name, phone, address, ward, district, city
					FROM customer_addresses
					WHERE id = ? AND user_id = ?
					""", (rs, rowNum) -> new ShippingAddressDto(
					rs.getString("full_name"),
					rs.getString("phone"),
					rs.getString("city"),
					rs.getString("district"),
					rs.getString("ward"),
					rs.getString("address"),
					null).normalized(), addressId, userId);
		}
		catch (EmptyResultDataAccessException exception) {
			throw new AppException(ErrorCode.ORDER_ADDRESS_REQUIRED, "Khong tim thay dia chi giao hang");
		}
	}

	private OrderRecord orderRecord(UUID userId, UUID orderId) {
		try {
			return jdbc.queryForObject("""
					SELECT id, order_number, customer_id, customer_name, customer_email, customer_phone,
					       subtotal, shipping_fee, discount, total_amount, status::text AS status,
					       payment_method::text AS payment_method, payment_status::text AS payment_status,
					       promotion_code, promotion_id, notes, internal_notes, cancel_reason,
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

	private OrderRecord orderRecord(UUID orderId) {
		try {
			return jdbc.queryForObject("""
					SELECT id, order_number, customer_id, customer_name, customer_email, customer_phone,
					       subtotal, shipping_fee, discount, total_amount, status::text AS status,
					       payment_method::text AS payment_method, payment_status::text AS payment_status,
					       promotion_code, promotion_id, notes, internal_notes, cancel_reason,
					       cancelled_at, created_at, updated_at,
					       shipping_address ->> 'recipientName' AS recipient_name,
					       shipping_address ->> 'phone' AS address_phone,
					       shipping_address ->> 'province' AS province,
					       shipping_address ->> 'district' AS district,
					       shipping_address ->> 'ward' AS ward,
					       shipping_address ->> 'addressLine' AS address_line,
					       shipping_address ->> 'fullAddress' AS full_address
					FROM orders
					WHERE id = ?
					""", this::orderRecord, orderId);
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

	private String invoiceNumber() {
		Integer next = jdbc.queryForObject("""
				INSERT INTO invoice_daily_sequences (invoice_date, next_value)
				VALUES (CURRENT_DATE, 1)
				ON CONFLICT (invoice_date)
				DO UPDATE SET next_value = invoice_daily_sequences.next_value + 1
				RETURNING next_value
				""", Integer.class);
		return "INV-" + DateTimeFormatter.BASIC_ISO_DATE.format(LocalDate.now()) + "-" + String.format("%03d", next == null ? 1 : next);
	}

	private String paymentMethod(String value) {
		String normalized = value == null ? "" : value.trim().toUpperCase();
		return switch (normalized) {
			case "COD", "BANK_TRANSFER", "MOMO", "VNPAY", "INSTALLMENT" -> normalized;
			default -> throw new AppException(ErrorCode.VALIDATION_ERROR, "Du lieu dau vao khong hop le",
					Map.of("paymentMethod", "Gia tri khong hop le"));
		};
	}

	private String paymentRecordMethod(String value) {
		String normalized = value == null ? "" : value.trim().toUpperCase();
		return switch (normalized) {
			case "CASH", "BANK_TRANSFER", "MOMO", "VNPAY", "COD" -> normalized;
			default -> throw new AppException(ErrorCode.VALIDATION_ERROR, "Du lieu dau vao khong hop le",
					Map.of("method", "Gia tri khong hop le"));
		};
	}

	private String proofMethod(String value, String fallback) {
		if (value == null || value.isBlank()) {
			return fallback == null || fallback.isBlank() ? "BANK_TRANSFER" : fallback.trim().toUpperCase();
		}
		String normalized = value.trim().toUpperCase();
		if (normalized.contains("KHO") || normalized.contains("TRANSFER")) {
			return "BANK_TRANSFER";
		}
		return paymentRecordMethod(value);
	}

	private String paymentFilterMethod(String value) {
		String normalized = value == null ? "" : value.trim().toUpperCase();
		return switch (normalized) {
			case "CASH", "BANK_TRANSFER", "MOMO", "VNPAY", "COD", "INSTALLMENT" -> normalized;
			default -> throw new AppException(ErrorCode.VALIDATION_ERROR, "Du lieu dau vao khong hop le",
					Map.of("method", "Phuong thuc thanh toan khong hop le"));
		};
	}

	private String paymentStatus(String value) {
		String normalized = value == null ? "" : value.trim().toUpperCase();
		return switch (normalized) {
			case "UNPAID", "PAID", "OVERDUE", "FAILED", "REFUNDED", "PARTIALLY_REFUNDED" -> normalized;
			default -> throw new AppException(ErrorCode.VALIDATION_ERROR, "Du lieu dau vao khong hop le",
					Map.of("status", "Trang thai thanh toan khong hop le"));
		};
	}

	private String gatewayProvider(String value) {
		String normalized = value == null ? "" : value.trim().toUpperCase();
		return switch (normalized) {
			case "MOMO", "VNPAY" -> normalized;
			default -> throw new AppException(ErrorCode.VALIDATION_ERROR, "Du lieu dau vao khong hop le",
					Map.of("provider", "Provider thanh toan khong hop le"));
		};
	}

	private String gatewayStatus(String value) {
		String normalized = value == null ? "SUCCESS" : value.trim().toUpperCase();
		return switch (normalized) {
			case "SUCCESS", "PAID", "FAILED", "CANCELLED", "CANCELED" ->
					"CANCELED".equals(normalized) ? "CANCELLED" : normalized;
			default -> throw new AppException(ErrorCode.VALIDATION_ERROR, "Du lieu dau vao khong hop le",
					Map.of("status", "Trang thai gateway khong hop le"));
		};
	}

	private String refundMethod(String value) {
		String normalized = value == null ? "" : value.trim().toUpperCase();
		return switch (normalized) {
			case "BANK_TRANSFER", "MOMO", "VNPAY", "CASH" -> normalized;
			default -> throw new AppException(ErrorCode.VALIDATION_ERROR, "Du lieu dau vao khong hop le",
					Map.of("method", "Phuong thuc hoan tien khong hop le"));
		};
	}

	private String invoiceStatus(String value) {
		String normalized = value == null ? "" : value.trim().toUpperCase();
		return switch (normalized) {
			case "PENDING", "PAID", "OVERDUE", "CANCELLED" -> normalized;
			default -> throw new AppException(ErrorCode.VALIDATION_ERROR, "Du lieu dau vao khong hop le",
					Map.of("status", "Trang thai hoa don khong hop le"));
		};
	}

	private String shipmentStatus(String value) {
		String normalized = value == null ? "" : value.trim().toUpperCase();
		return switch (normalized) {
			case "AWAITING_PICKUP", "IN_TRANSIT", "DELIVERED", "FAILED" -> normalized;
			default -> throw new AppException(ErrorCode.VALIDATION_ERROR, "Du lieu dau vao khong hop le",
					Map.of("status", "Trang thai giao hang khong hop le"));
		};
	}

	private String normalizeStatus(String value) {
		String normalized = value == null ? "" : value.trim().toUpperCase();
		return switch (normalized) {
			case "PENDING", "CONFIRMED", "SHIPPING", "DELIVERED", "CANCELLED", "RETURNED" -> normalized;
			default -> throw new AppException(ErrorCode.VALIDATION_ERROR, "Du lieu dau vao khong hop le",
					Map.of("status", "Trang thai don hang khong hop le"));
		};
	}

	private boolean canTransition(String current, String next) {
		if (current.equals(next)) {
			return false;
		}
		return switch (current) {
			case "PENDING" -> "CONFIRMED".equals(next) || "CANCELLED".equals(next);
			case "CONFIRMED" -> "SHIPPING".equals(next) || "CANCELLED".equals(next);
			case "SHIPPING" -> "DELIVERED".equals(next);
			case "DELIVERED" -> "RETURNED".equals(next);
			default -> false;
		};
	}

	private boolean canTransitionShipment(String current, String next) {
		if (current.equals(next)) {
			return false;
		}
		return switch (current) {
			case "AWAITING_PICKUP" -> "IN_TRANSIT".equals(next);
			case "IN_TRANSIT" -> "DELIVERED".equals(next) || "FAILED".equals(next);
			default -> false;
		};
	}

	private LocalDate parseDate(String value, String field) {
		if (value == null || value.isBlank()) {
			return null;
		}
		try {
			return LocalDate.parse(value.trim());
		}
		catch (RuntimeException exception) {
			throw new AppException(ErrorCode.VALIDATION_ERROR, "Du lieu dau vao khong hop le",
					Map.of(field, "Ngay phai co dinh dang YYYY-MM-DD"));
		}
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

	private String blankToNull(String value) {
		return value == null || value.isBlank() ? null : value.trim();
	}

	private String gatewayPayload(String provider, String requestId, String transactionRef, String status, long amount) {
		return """
				{"provider":"%s","requestId":"%s","transactionRef":%s,"status":"%s","amount":%d}
				""".formatted(escape(provider), escape(requestId),
				transactionRef == null ? "null" : "\"" + escape(transactionRef) + "\"", escape(status), amount);
	}

	private String gatewayRequestId(String provider) {
		String date = DateTimeFormatter.BASIC_ISO_DATE.format(LocalDate.now());
		String random = UUID.randomUUID().toString().replace("-", "");
		return "VNPAY".equals(provider) ? "VNPAY" + date + random.substring(0, 20) : provider + "-" + date + "-" + UUID.randomUUID();
	}

	private String localGatewayPaymentUrl(String provider, String requestId) {
		return "/api/v1/payments/gateway/return?provider=" + provider + "&requestId=" + requestId + "&status=SUCCESS";
	}

	private String url(String value) {
		return URLEncoder.encode(value == null ? "" : value, StandardCharsets.UTF_8);
	}

	private byte[] simplePdf(String text) {
		String[] lines = text.lines().map(this::pdfText).toArray(String[]::new);
		StringBuilder content = new StringBuilder("BT\n/F1 12 Tf\n50 780 Td\n");
		for (int i = 0; i < lines.length; i++) {
			if (i > 0) {
				content.append("0 -18 Td\n");
			}
			content.append("(").append(lines[i]).append(") Tj\n");
		}
		content.append("ET\n");
		byte[] stream = content.toString().getBytes(StandardCharsets.ISO_8859_1);
		List<String> objects = List.of(
				"<< /Type /Catalog /Pages 2 0 R >>",
				"<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
				"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
				"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
				"<< /Length " + stream.length + " >>\nstream\n" + content + "endstream");
		StringBuilder pdf = new StringBuilder("%PDF-1.4\n");
		List<Integer> offsets = new ArrayList<>();
		for (int i = 0; i < objects.size(); i++) {
			offsets.add(pdf.toString().getBytes(StandardCharsets.ISO_8859_1).length);
			pdf.append(i + 1).append(" 0 obj\n").append(objects.get(i)).append("\nendobj\n");
		}
		int xref = pdf.toString().getBytes(StandardCharsets.ISO_8859_1).length;
		pdf.append("xref\n0 ").append(objects.size() + 1).append("\n");
		pdf.append("0000000000 65535 f \n");
		for (Integer offset : offsets) {
			pdf.append(String.format("%010d 00000 n \n", offset));
		}
		pdf.append("trailer\n<< /Size ").append(objects.size() + 1).append(" /Root 1 0 R >>\n");
		pdf.append("startxref\n").append(xref).append("\n%%EOF\n");
		return pdf.toString().getBytes(StandardCharsets.ISO_8859_1);
	}

	private String pdfText(String value) {
		return value.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)");
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
		OrderFirstItemDto firstItem = new OrderFirstItemDto(uuidString(rs, "first_product_id"),
				uuidString(rs, "first_variant_id"), rs.getString("first_product_name"),
				rs.getString("first_product_image"), rs.getString("first_variant_name"));
		return new OrderSummaryDto(rs.getObject("id", UUID.class).toString(), rs.getString("order_number"),
				rs.getString("status"), rs.getString("payment_status"), rs.getLong("total_amount"),
				new OrderSummaryItemsDto(rs.getInt("item_count"), firstItem), iso(rs.getObject("created_at", OffsetDateTime.class)));
	}

	private AdminOrderSummaryDto adminSummaryDto(ResultSet rs, int rowNum) throws SQLException {
		OrderFirstItemDto firstItem = new OrderFirstItemDto(uuidString(rs, "first_product_id"),
				uuidString(rs, "first_variant_id"), rs.getString("first_product_name"),
				rs.getString("first_product_image"), rs.getString("first_variant_name"));
		return new AdminOrderSummaryDto(rs.getObject("id", UUID.class).toString(), rs.getString("order_number"),
				rs.getObject("customer_id", UUID.class).toString(), rs.getString("customer_name"),
				rs.getString("customer_phone"), rs.getString("customer_email"), rs.getString("status"),
				rs.getString("payment_status"), rs.getString("payment_method"), rs.getLong("subtotal"),
				rs.getLong("discount"), rs.getLong("shipping_fee"), rs.getLong("total_amount"),
				rs.getString("promotion_code"), new OrderSummaryItemsDto(rs.getInt("item_count"), firstItem),
				iso(rs.getObject("created_at", OffsetDateTime.class)), iso(rs.getObject("updated_at", OffsetDateTime.class)));
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
				rs.getString("notes"), rs.getString("internal_notes"), rs.getString("cancel_reason"),
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

	private OrderStockLine orderStockLine(ResultSet rs, int rowNum) throws SQLException {
		return new OrderStockLine(rs.getObject("order_item_id", UUID.class), rs.getObject("product_id", UUID.class),
				rs.getObject("variant_id", UUID.class), rs.getInt("quantity"));
	}

	private OrderStatusHistoryDto historyDto(ResultSet rs, int rowNum) throws SQLException {
		return new OrderStatusHistoryDto(rs.getObject("id", UUID.class).toString(), rs.getString("from_status"),
				rs.getString("to_status"), rs.getString("note"), rs.getObject("changed_by", UUID.class).toString(),
				rs.getString("changed_by_name"), iso(rs.getObject("created_at", OffsetDateTime.class)));
	}

	private InvoiceDto invoice(UUID orderId) {
		try {
			return jdbc.queryForObject("""
					SELECT id, invoice_number, order_id, order_number, customer_id, customer_name,
					       total_amount, tax_amount, discount_amount, status::text AS status, issue_date, due_date, paid_at, created_at
					FROM invoices
					WHERE order_id = ?
					""", this::invoiceRowDto, orderId);
		}
		catch (EmptyResultDataAccessException exception) {
			throw new AppException(ErrorCode.INVOICE_NOT_AVAILABLE);
		}
	}

	private ShipmentDto shipment(UUID orderId) {
		try {
			return jdbc.queryForObject("""
					SELECT id, order_id, order_number, tracking_number, carrier_name, status::text AS status,
					       estimated_delivery, actual_delivery, created_at, updated_at
					FROM shipments
					WHERE order_id = ?
					""", this::shipmentRowDto, orderId);
		}
		catch (EmptyResultDataAccessException exception) {
			throw new AppException(ErrorCode.SHIPMENT_NOT_FOUND);
		}
	}

	private InvoiceRecord invoiceRecord(UUID invoiceId) {
		try {
			return jdbc.queryForObject("""
					SELECT id, invoice_number, order_id, order_number, customer_id, customer_name,
					       total_amount, tax_amount, discount_amount, status::text AS status, issue_date, due_date, paid_at, created_at
					FROM invoices
					WHERE id = ?
					""", this::invoiceRecord, invoiceId);
		}
		catch (EmptyResultDataAccessException exception) {
			throw new AppException(ErrorCode.INVOICE_NOT_FOUND);
		}
	}

	private ShipmentRecord shipmentRecord(UUID shipmentId) {
		try {
			return jdbc.queryForObject("""
					SELECT s.id, s.order_id, s.order_number, s.tracking_number, s.carrier_name,
					       s.status::text AS status, s.estimated_delivery, s.actual_delivery,
					       s.created_at, s.updated_at, o.customer_id
					FROM shipments s
					JOIN orders o ON o.id = s.order_id
					WHERE s.id = ?
					""", this::shipmentRecord, shipmentId);
		}
		catch (EmptyResultDataAccessException exception) {
			throw new AppException(ErrorCode.SHIPMENT_NOT_FOUND);
		}
	}

	private InvoiceDto invoiceRowDto(ResultSet rs, int rowNum) throws SQLException {
		UUID orderId = rs.getObject("order_id", UUID.class);
		OrderRecord order = orderRecord(orderId);
		OffsetDateTime paidAt = rs.getObject("paid_at", OffsetDateTime.class);
		return new InvoiceDto(rs.getObject("id", UUID.class).toString(), rs.getString("invoice_number"),
				orderId.toString(), rs.getString("order_number"),
				rs.getObject("customer_id", UUID.class).toString(), rs.getString("customer_name"),
				rs.getLong("total_amount"), rs.getLong("tax_amount"), rs.getLong("discount_amount"), rs.getString("status"),
				rs.getObject("issue_date", LocalDate.class).toString(), rs.getObject("due_date", LocalDate.class).toString(),
				paidAt == null ? null : iso(paidAt), iso(rs.getObject("created_at", OffsetDateTime.class)),
				order.customerEmail(), order.customerPhone(), "ORDER", "CELLPHONES",
				"0310000000", "350-352 Vo Van Kiet, Quan 1, TP. Ho Chi Minh", order.notes(),
				invoiceLines(orderId));
	}

	private InvoiceDto invoiceDto(InvoiceRecord invoice) {
		OrderRecord order = orderRecord(invoice.orderId());
		return new InvoiceDto(invoice.id().toString(), invoice.invoiceNumber(), invoice.orderId().toString(),
				invoice.orderNumber(), invoice.customerId().toString(), invoice.customerName(), invoice.totalAmount(),
				invoice.taxAmount(), invoice.discountAmount(), invoice.status(), invoice.issueDate().toString(), invoice.dueDate().toString(),
				invoice.paidAt() == null ? null : iso(invoice.paidAt()), iso(invoice.createdAt()),
				order.customerEmail(), order.customerPhone(), "ORDER", "CELLPHONES",
				"0310000000", "350-352 Vo Van Kiet, Quan 1, TP. Ho Chi Minh", order.notes(),
				invoiceLines(invoice.orderId()));
	}

	private ShipmentDto shipmentRowDto(ResultSet rs, int rowNum) throws SQLException {
		UUID orderId = rs.getObject("order_id", UUID.class);
		OrderRecord order = orderRecord(orderId);
		OffsetDateTime actualDelivery = rs.getObject("actual_delivery", OffsetDateTime.class);
		OffsetDateTime createdAt = rs.getObject("created_at", OffsetDateTime.class);
		OffsetDateTime updatedAt = rs.getObject("updated_at", OffsetDateTime.class);
		String shipmentStatus = rs.getString("status");
		return new ShipmentDto(rs.getObject("id", UUID.class).toString(),
				orderId.toString(), rs.getString("order_number"),
				rs.getString("tracking_number"), rs.getString("carrier_name"), shipmentStatus,
				rs.getObject("estimated_delivery", LocalDate.class).toString(),
				actualDelivery == null ? null : iso(actualDelivery), iso(createdAt), iso(updatedAt),
				order.customerName(), order.customerPhone(), order.shippingFee(),
				"CELLPHONES Warehouse, TP. Ho Chi Minh", order.shippingAddress().fullAddress(), null, null,
				shipmentTrackingHistory(shipmentStatus, rs.getString("order_number"), createdAt, updatedAt, actualDelivery));
	}

	private ShipmentDto shipmentDto(ShipmentRecord shipment) {
		OrderRecord order = orderRecord(shipment.orderId());
		return new ShipmentDto(shipment.id().toString(), shipment.orderId().toString(), shipment.orderNumber(),
				shipment.trackingNumber(), shipment.carrierName(), shipment.status(),
				shipment.estimatedDelivery().toString(),
				shipment.actualDelivery() == null ? null : iso(shipment.actualDelivery()), iso(shipment.createdAt()),
				iso(shipment.updatedAt()), order.customerName(), order.customerPhone(), order.shippingFee(),
				"CELLPHONES Warehouse, TP. Ho Chi Minh", order.shippingAddress().fullAddress(), null, null,
				shipmentTrackingHistory(shipment.status(), shipment.orderNumber(), shipment.createdAt(), shipment.updatedAt(),
						shipment.actualDelivery()));
	}

	private List<InvoiceLineDto> invoiceLines(UUID orderId) {
		return jdbc.query("""
				SELECT product_id, variant_id, product_name, product_image, variant_name, sku,
				       quantity, unit_price, original_price, discount, total_price
				FROM order_items
				WHERE order_id = ?
				ORDER BY id
				""", (rs, rowNum) -> new InvoiceLineDto(
				rs.getObject("product_id", UUID.class).toString(),
				uuidString(rs, "variant_id"),
				rs.getString("product_name"),
				rs.getString("product_image"),
				rs.getString("variant_name"),
				rs.getString("sku"),
				rs.getInt("quantity"),
				rs.getLong("unit_price"),
				rs.getObject("original_price") == null ? null : rs.getLong("original_price"),
				rs.getLong("discount"),
				rs.getLong("total_price")), orderId);
	}

	private List<ShipmentTrackingEventDto> shipmentTrackingHistory(String status, String orderNumber,
			OffsetDateTime createdAt, OffsetDateTime updatedAt, OffsetDateTime actualDelivery) {
		List<ShipmentTrackingEventDto> events = new ArrayList<>();
		events.add(new ShipmentTrackingEventDto("AWAITING_PICKUP", "Dang cho lay hang",
				"Don hang " + orderNumber + " da tao thong tin van chuyen.", iso(createdAt)));
		if (List.of("IN_TRANSIT", "DELIVERED", "FAILED").contains(status)) {
			events.add(new ShipmentTrackingEventDto("IN_TRANSIT", "Dang van chuyen",
					"Don vi van chuyen da nhan hang.", iso(updatedAt)));
		}
		if ("DELIVERED".equals(status) && actualDelivery != null) {
			events.add(new ShipmentTrackingEventDto("DELIVERED", "Da giao hang",
					"Don hang da duoc giao thanh cong.", iso(actualDelivery)));
		}
		if ("FAILED".equals(status)) {
			events.add(new ShipmentTrackingEventDto("FAILED", "Giao hang that bai",
					"Don hang giao khong thanh cong, vui long lien he ho tro.", iso(updatedAt)));
		}
		return events;
	}

	private PaymentRecord paymentRecord(ResultSet rs, int rowNum) throws SQLException {
		return new PaymentRecord(rs.getObject("id", UUID.class), rs.getObject("order_id", UUID.class),
				rs.getString("order_number"), rs.getObject("customer_id", UUID.class), rs.getString("customer_name"),
				rs.getString("customer_phone"), rs.getLong("amount"), rs.getLong("paid_amount"),
				rs.getLong("remaining_amount"), rs.getObject("due_date", LocalDate.class), rs.getString("status"),
				rs.getString("method"), rs.getString("transaction_ref"), rs.getObject("paid_at", OffsetDateTime.class),
				rs.getObject("refund_amount") == null ? null : rs.getLong("refund_amount"), rs.getString("refund_reason"),
				rs.getString("refund_method"), rs.getObject("refunded_at", OffsetDateTime.class),
				rs.getObject("created_at", OffsetDateTime.class));
	}

	private AdminPaymentDto adminPaymentDto(ResultSet rs, int rowNum) throws SQLException {
		OffsetDateTime paidAt = rs.getObject("paid_at", OffsetDateTime.class);
		return new AdminPaymentDto(rs.getObject("id", UUID.class).toString(),
				rs.getObject("order_id", UUID.class).toString(), rs.getString("order_number"),
				rs.getObject("customer_id", UUID.class).toString(), rs.getString("customer_name"),
				rs.getString("customer_phone"), rs.getLong("amount"), rs.getLong("paid_amount"),
				rs.getLong("remaining_amount"), rs.getObject("due_date", LocalDate.class).toString(), rs.getString("status"),
				rs.getString("method"), rs.getString("transaction_ref"), paidAt == null ? null : iso(paidAt),
				rs.getObject("refund_amount") == null ? null : rs.getLong("refund_amount"), rs.getString("refund_reason"),
				rs.getString("refund_method"),
				rs.getObject("refunded_at", OffsetDateTime.class) == null ? null : iso(rs.getObject("refunded_at", OffsetDateTime.class)),
				iso(rs.getObject("created_at", OffsetDateTime.class)));
	}

	private InvoiceRecord invoiceRecord(ResultSet rs, int rowNum) throws SQLException {
		return new InvoiceRecord(rs.getObject("id", UUID.class), rs.getString("invoice_number"),
				rs.getObject("order_id", UUID.class), rs.getString("order_number"), rs.getObject("customer_id", UUID.class),
				rs.getString("customer_name"), rs.getLong("total_amount"), rs.getLong("tax_amount"), rs.getLong("discount_amount"), rs.getString("status"),
				rs.getObject("issue_date", LocalDate.class), rs.getObject("due_date", LocalDate.class),
				rs.getObject("paid_at", OffsetDateTime.class), rs.getObject("created_at", OffsetDateTime.class));
	}

	private ShipmentRecord shipmentRecord(ResultSet rs, int rowNum) throws SQLException {
		return new ShipmentRecord(rs.getObject("id", UUID.class), rs.getObject("order_id", UUID.class),
				rs.getString("order_number"), rs.getString("tracking_number"), rs.getString("carrier_name"),
				rs.getString("status"), rs.getObject("estimated_delivery", LocalDate.class),
				rs.getObject("actual_delivery", OffsetDateTime.class), rs.getObject("created_at", OffsetDateTime.class),
				rs.getObject("updated_at", OffsetDateTime.class), rs.getObject("customer_id", UUID.class));
	}

	private CustomerPaymentDto customerPaymentRowDto(ResultSet rs, int rowNum) throws SQLException {
		OffsetDateTime paidAt = rs.getObject("paid_at", OffsetDateTime.class);
		return new CustomerPaymentDto(rs.getObject("id", UUID.class).toString(),
				rs.getObject("order_id", UUID.class).toString(), rs.getString("order_number"),
				rs.getObject("customer_id", UUID.class).toString(), rs.getLong("amount"), rs.getLong("paid_amount"),
				rs.getLong("remaining_amount"), rs.getObject("due_date", LocalDate.class).toString(), rs.getString("status"),
				rs.getString("method"), rs.getString("transaction_ref"), paidAt == null ? null : iso(paidAt),
				iso(rs.getObject("created_at", OffsetDateTime.class)));
	}

	private CustomerPaymentDto customerPaymentDto(PaymentRecord payment) {
		return new CustomerPaymentDto(payment.id().toString(), payment.orderId().toString(), payment.orderNumber(),
				payment.customerId().toString(), payment.amount(), payment.paidAmount(), payment.remainingAmount(),
				payment.dueDate().toString(), payment.status(), payment.method(), payment.transactionRef(),
				payment.paidAt() == null ? null : iso(payment.paidAt()), iso(payment.createdAt()));
	}

	private List<PaymentProofDto> paymentProofs(UUID paymentId) {
		return jdbc.query("""
				SELECT id, payment_id, order_id, customer_id, proof_url, note, amount, method, transaction_ref, status, created_at
				FROM payment_proofs
				WHERE payment_id = ?
				ORDER BY created_at DESC
				""", this::paymentProofRow, paymentId);
	}

	private PaymentProofDto paymentProof(UUID proofId) {
		return jdbc.queryForObject("""
				SELECT id, payment_id, order_id, customer_id, proof_url, note, amount, method, transaction_ref, status, created_at
				FROM payment_proofs
				WHERE id = ?
				""", this::paymentProofRow, proofId);
	}

	private PaymentProofDto paymentProofRow(ResultSet rs, int rowNum) throws SQLException {
		return new PaymentProofDto(rs.getObject("id", UUID.class).toString(),
				rs.getObject("payment_id", UUID.class).toString(), rs.getObject("order_id", UUID.class).toString(),
				rs.getObject("customer_id", UUID.class).toString(), rs.getString("proof_url"), rs.getString("note"),
				rs.getLong("amount"), rs.getString("method"), rs.getString("transaction_ref"), rs.getString("status"),
				iso(rs.getObject("created_at", OffsetDateTime.class)));
	}

	private WarrantySeedLine warrantySeedLine(ResultSet rs, int rowNum) throws SQLException {
		return new WarrantySeedLine(rs.getObject("order_item_id", UUID.class), rs.getObject("product_id", UUID.class),
				rs.getString("product_name"), rs.getString("product_image"), rs.getString("brand"), rs.getString("sku"),
				rs.getInt("quantity"), rs.getInt("warranty_months"));
	}

	private PaymentGatewaySession gatewaySessionRecord(ResultSet rs, int rowNum) throws SQLException {
		return new PaymentGatewaySession(rs.getObject("id", UUID.class), rs.getObject("payment_id", UUID.class),
				rs.getObject("order_id", UUID.class), rs.getString("provider"), rs.getString("request_id"),
				rs.getString("transaction_ref"), rs.getLong("amount"), rs.getString("status"), rs.getString("payment_url"),
				rs.getString("return_url"), rs.getString("callback_url"), rs.getObject("paid_at", OffsetDateTime.class),
				rs.getObject("created_at", OffsetDateTime.class));
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

	private LocalDate parseDate(String value, String field, LocalDate fallback) {
		if (value == null || value.isBlank()) {
			return fallback;
		}
		try {
			return LocalDate.parse(value.trim());
		}
		catch (RuntimeException exception) {
			throw new AppException(ErrorCode.VALIDATION_ERROR, "Du lieu dau vao khong hop le",
					Map.of(field, "Ngay phai co dinh dang YYYY-MM-DD"));
		}
	}

	private String iso(OffsetDateTime value) {
		return DateTimeFormatter.ISO_OFFSET_DATE_TIME.format(value);
	}

	private String uuidString(ResultSet rs, String column) throws SQLException {
		UUID value = rs.getObject(column, UUID.class);
		return value == null ? null : value.toString();
	}

	public record CustomerSnapshot(String name, String email, String phone) {
	}

	public record InvoicePdfFile(String fileName, byte[] content) {
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
			String internalNotes, String cancelReason, String cancelledAt, String createdAt, String updatedAt,
			ShippingAddressDto shippingAddress) {
	}

	private record OrderLine(UUID id, UUID productId, UUID variantId, UUID categoryId, String productName,
			String productImage, String brand, String variantName, String sku, String color, String storage, int quantity,
			long unitPrice, Long originalPrice, long totalPrice) {
		OrderItemDto dto() {
			return new OrderItemDto(id.toString(), productId.toString(), variantId == null ? null : variantId.toString(),
					productName, productImage, brand, variantName, color, storage, quantity, unitPrice, totalPrice);
		}
	}

	private record OrderStockLine(UUID orderItemId, UUID productId, UUID variantId, int quantity) {
	}

	private record LoyaltySnapshot(UUID id, int points, int totalEarnedPoints, String tier) {
	}

	private record WarrantySeedLine(UUID orderItemId, UUID productId, String productName, String productImage, String brand,
			String sku, int quantity, int warrantyMonths) {
	}

	private record PaymentRecord(UUID id, UUID orderId, String orderNumber, UUID customerId, String customerName,
			String customerPhone, long amount, long paidAmount, long remainingAmount, LocalDate dueDate, String status,
			String method, String transactionRef, OffsetDateTime paidAt, Long refundAmount, String refundReason,
			String refundMethod, OffsetDateTime refundedAt, OffsetDateTime createdAt) {
	}

	private record PaymentGatewaySession(UUID id, UUID paymentId, UUID orderId, String provider, String requestId,
			String transactionRef, long amount, String status, String paymentUrl, String returnUrl, String callbackUrl,
			OffsetDateTime paidAt, OffsetDateTime createdAt) {
	}

	private record InvoiceRecord(UUID id, String invoiceNumber, UUID orderId, String orderNumber, UUID customerId,
			String customerName, long totalAmount, long taxAmount, long discountAmount, String status, LocalDate issueDate, LocalDate dueDate,
			OffsetDateTime paidAt, OffsetDateTime createdAt) {
	}

	private record ShipmentRecord(UUID id, UUID orderId, String orderNumber, String trackingNumber, String carrierName,
			String status, LocalDate estimatedDelivery, OffsetDateTime actualDelivery, OffsetDateTime createdAt,
			OffsetDateTime updatedAt, UUID customerId) {
	}
}

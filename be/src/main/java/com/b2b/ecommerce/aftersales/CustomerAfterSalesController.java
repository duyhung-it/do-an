package com.b2b.ecommerce.aftersales;

import java.sql.Array;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import com.b2b.ecommerce.common.ApiResponse;
import com.b2b.ecommerce.common.AppException;
import com.b2b.ecommerce.common.ErrorCode;
import com.b2b.ecommerce.common.PageRequestParams;
import com.b2b.ecommerce.notification.NotificationEventService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1")
public class CustomerAfterSalesController {
	private static final UUID DEV_USER_ID = UUID.fromString("00000000-0000-4000-8000-000000000001");
	private final CustomerAfterSalesService afterSales;

	public CustomerAfterSalesController(CustomerAfterSalesService afterSales) {
		this.afterSales = afterSales;
	}

	@PostMapping("/returns")
	public ResponseEntity<ApiResponse<ReturnDto>> createReturn(
			@RequestHeader(name = "X-User-Id", required = false) String userId,
			@Valid @RequestBody CreateReturnRequest request) {
		return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(afterSales.createReturn(userId(userId), request)));
	}

	@GetMapping("/returns")
	public ApiResponse<List<ReturnDto>> returns(
			@RequestHeader(name = "X-User-Id", required = false) String userId,
			@RequestParam(defaultValue = "1") int page,
			@RequestParam(defaultValue = "10") int pageSize,
			@RequestParam(required = false) String status) {
		PageRequestParams params = new PageRequestParams(page, pageSize, null, "createdAt", "desc");
		Page<ReturnDto> result = afterSales.returns(userId(userId), params, status);
		return ApiResponse.page(result.getContent(), (int) result.getTotalElements(), params.normalizedPage(),
				params.normalizedPageSize());
	}

	@GetMapping("/returns/{id}")
	public ApiResponse<ReturnDto> returnDetail(
			@RequestHeader(name = "X-User-Id", required = false) String userId,
			@PathVariable String id) {
		return ApiResponse.ok(afterSales.returnDetail(userId(userId), id));
	}

	@GetMapping("/warranty")
	public ApiResponse<List<WarrantyItemDto>> warrantyItems(
			@RequestHeader(name = "X-User-Id", required = false) String userId,
			@RequestParam(defaultValue = "1") int page,
			@RequestParam(defaultValue = "10") int pageSize,
			@RequestParam(required = false) String status) {
		PageRequestParams params = new PageRequestParams(page, pageSize, null, "createdAt", "desc");
		Page<WarrantyItemDto> result = afterSales.warrantyItems(userId(userId), params, status);
		return ApiResponse.page(result.getContent(), (int) result.getTotalElements(), params.normalizedPage(),
				params.normalizedPageSize());
	}

	@GetMapping("/warranty/{id}")
	public ApiResponse<WarrantyItemDto> warrantyItem(
			@RequestHeader(name = "X-User-Id", required = false) String userId,
			@PathVariable String id) {
		return ApiResponse.ok(afterSales.warrantyItem(userId(userId), id));
	}

	@PostMapping("/warranty-claims")
	public ResponseEntity<ApiResponse<WarrantyClaimDto>> createWarrantyClaim(
			@RequestHeader(name = "X-User-Id", required = false) String userId,
			@Valid @RequestBody CreateWarrantyClaimRequest request) {
		return ResponseEntity.status(HttpStatus.CREATED)
				.body(ApiResponse.ok(afterSales.createWarrantyClaim(userId(userId), request)));
	}

	@GetMapping("/warranty-claims")
	public ApiResponse<List<WarrantyClaimDto>> warrantyClaims(
			@RequestHeader(name = "X-User-Id", required = false) String userId,
			@RequestParam(defaultValue = "1") int page,
			@RequestParam(defaultValue = "10") int pageSize,
			@RequestParam(required = false) String status) {
		PageRequestParams params = new PageRequestParams(page, pageSize, null, "createdAt", "desc");
		Page<WarrantyClaimDto> result = afterSales.warrantyClaims(userId(userId), params, status);
		return ApiResponse.page(result.getContent(), (int) result.getTotalElements(), params.normalizedPage(),
				params.normalizedPageSize());
	}

	@GetMapping("/warranty-claims/{id}")
	public ApiResponse<WarrantyClaimDto> warrantyClaim(
			@RequestHeader(name = "X-User-Id", required = false) String userId,
			@PathVariable String id) {
		return ApiResponse.ok(afterSales.warrantyClaim(userId(userId), id));
	}

	@GetMapping("/trade-in/estimate")
	public ApiResponse<TradeInEstimateDto> tradeInEstimate(
			@RequestParam String brand,
			@RequestParam String model,
			@RequestParam String condition) {
		return ApiResponse.ok(afterSales.estimate(brand, model, condition));
	}

	@PostMapping("/trade-in")
	public ResponseEntity<ApiResponse<TradeInDto>> createTradeIn(
			@RequestHeader(name = "X-User-Id", required = false) String userId,
			@RequestHeader(name = "X-User-Name", required = false, defaultValue = "Khach hang") String userName,
			@RequestHeader(name = "X-User-Phone", required = false, defaultValue = "0900000000") String userPhone,
			@Valid @RequestBody CreateTradeInRequest request) {
		CustomerSnapshot customer = new CustomerSnapshot(userName, userPhone);
		return ResponseEntity.status(HttpStatus.CREATED)
				.body(ApiResponse.ok(afterSales.createTradeIn(userId(userId), customer, request)));
	}

	@GetMapping("/trade-in")
	public ApiResponse<List<TradeInDto>> tradeIns(
			@RequestHeader(name = "X-User-Id", required = false) String userId,
			@RequestParam(defaultValue = "1") int page,
			@RequestParam(defaultValue = "10") int pageSize,
			@RequestParam(required = false) String status) {
		PageRequestParams params = new PageRequestParams(page, pageSize, null, "createdAt", "desc");
		Page<TradeInDto> result = afterSales.tradeIns(userId(userId), params, status);
		return ApiResponse.page(result.getContent(), (int) result.getTotalElements(), params.normalizedPage(),
				params.normalizedPageSize());
	}

	@GetMapping("/trade-in/{id}")
	public ApiResponse<TradeInDto> tradeIn(
			@RequestHeader(name = "X-User-Id", required = false) String userId,
			@PathVariable String id) {
		return ApiResponse.ok(afterSales.tradeIn(userId(userId), id));
	}

	@PatchMapping("/trade-in/{id}/accept")
	public ApiResponse<TradeInDto> acceptTradeIn(
			@RequestHeader(name = "X-User-Id", required = false) String userId,
			@PathVariable String id) {
		return ApiResponse.ok(afterSales.customerTradeInStatus(userId(userId), id, "ACCEPTED"));
	}

	@PatchMapping("/trade-in/{id}/reject")
	public ApiResponse<TradeInDto> rejectTradeIn(
			@RequestHeader(name = "X-User-Id", required = false) String userId,
			@PathVariable String id) {
		return ApiResponse.ok(afterSales.customerTradeInStatus(userId(userId), id, "REJECTED"));
	}

	private UUID userId(String value) {
		return value == null || value.isBlank() ? DEV_USER_ID : UUID.fromString(value);
	}

	public record CreateReturnRequest(@NotBlank String orderId, @NotBlank String reason, @Min(0) Long refundAmount) {
	}

	public record CreateWarrantyClaimRequest(@NotBlank String warrantyId, @NotBlank String issueDescription) {
	}

	public record CreateTradeInRequest(@NotBlank String deviceName, @NotBlank String brand, @NotBlank String model,
			@NotBlank String condition, @Min(0) Long estimatedValue, String targetProductId, List<String> images) {
	}

	public record CustomerSnapshot(String name, String phone) {
	}

	public record ReturnDto(String id, String returnNumber, String orderId, String customerId, String customerName,
			String customerPhone, String reason, String status, long refundAmount, String disputeResolution, String createdAt,
			String updatedAt, String orderNumber, String refundMethod, List<ReturnItemDto> items) {
	}

	public record ReturnItemDto(String orderItemId, String productId, String variantId, String productName,
			String productImage, String variantName, String sku, int quantity, long unitPrice, long totalPrice) {
	}

	public record WarrantyItemDto(String id, String orderId, String orderItemId, String productId, String customerId,
			String productName, String productImage, String brand, String serialNumber, int warrantyMonths,
			String warrantyStart, String warrantyExpiry, String status, String createdAt, String updatedAt) {
	}

	public record WarrantyClaimDto(String id, String claimNumber, String warrantyId, String orderId, String productId,
			String customerId, String customerName, String customerPhone, String issueDescription, String status,
			String resolutionNote, String createdAt, String updatedAt, String productName, String productImage, String brand,
			String serialNumber, String warrantyStatus) {
	}

	public record TradeInEstimateDto(String brand, String model, String condition, long estimatedValue, String currency) {
	}

	public record TradeInDto(String id, String requestNumber, String customerId, String customerName, String customerPhone,
			String deviceName, String brand, String model, String condition, long estimatedValue, Long finalValuation,
			String targetProductId, String status, List<String> images, String adminNote, String createdAt, String updatedAt) {
	}
}

@Service
class CustomerAfterSalesService {
	private final JdbcTemplate jdbc;
	private final NotificationEventService notifications;

	CustomerAfterSalesService(JdbcTemplate jdbc, NotificationEventService notifications) {
		this.jdbc = jdbc;
		this.notifications = notifications;
	}

	@Transactional
	public CustomerAfterSalesController.ReturnDto createReturn(UUID userId,
			CustomerAfterSalesController.CreateReturnRequest request) {
		OrderSnapshot order = deliveredOrder(userId, request.orderId());
		Integer active = jdbc.queryForObject("""
				SELECT COUNT(*) FROM return_requests
				WHERE order_id = ? AND customer_id = ? AND status::text IN ('PENDING','APPROVED','PROCESSING','REFUNDED')
				""", Integer.class, order.id(), userId);
		if (active != null && active > 0) {
			throw new AppException(ErrorCode.RETURN_ALREADY_REQUESTED);
		}
		UUID id = UUID.randomUUID();
		long refundAmount = request.refundAmount() == null ? order.totalAmount() : request.refundAmount();
		jdbc.update("""
				INSERT INTO return_requests (
				  id, return_number, order_id, customer_id, customer_name, customer_phone, reason, status, refund_amount
				)
				VALUES (?, ?, ?, ?, ?, ?, ?, 'PENDING', ?)
				""", id, number("RTN"), order.id(), userId, order.customerName(), order.customerPhone(), request.reason(),
				refundAmount);
		notifications.send(userId, "SYSTEM", "Yeu cau tra hang da duoc tao",
				"Yeu cau tra hang cho don hang cua ban dang cho xu ly.", "MEDIUM", "returns", "RETURN", id,
				"/returns/" + id, "Xem yeu cau");
		return returnDetail(userId, id.toString());
	}

	@Transactional(readOnly = true)
	public Page<CustomerAfterSalesController.ReturnDto> returns(UUID userId, PageRequestParams params, String status) {
		int page = params.normalizedPage();
		int pageSize = params.normalizedPageSize();
		String normalizedStatus = normalized(status);
		Long total = jdbc.queryForObject("""
				SELECT COUNT(*) FROM return_requests
				WHERE customer_id = ? AND (? = '' OR status::text = ?)
				""", Long.class, userId, normalizedStatus, normalizedStatus);
		List<CustomerAfterSalesController.ReturnDto> content = jdbc.query("""
				SELECT * FROM return_requests
				WHERE customer_id = ? AND (? = '' OR status::text = ?)
				ORDER BY created_at DESC
				LIMIT ? OFFSET ?
				""", this::returnRow, userId, normalizedStatus, normalizedStatus, pageSize, (page - 1) * pageSize);
		return new PageImpl<>(content, PageRequest.of(page - 1, pageSize), total == null ? 0 : total);
	}

	@Transactional(readOnly = true)
	public CustomerAfterSalesController.ReturnDto returnDetail(UUID userId, String id) {
		try {
			return jdbc.queryForObject("SELECT * FROM return_requests WHERE id = ? AND customer_id = ?", this::returnRow,
					uuid(id), userId);
		}
		catch (EmptyResultDataAccessException exception) {
			throw new AppException(ErrorCode.RETURN_NOT_FOUND);
		}
	}

	@Transactional(readOnly = true)
	public Page<CustomerAfterSalesController.WarrantyItemDto> warrantyItems(UUID userId, PageRequestParams params,
			String status) {
		int page = params.normalizedPage();
		int pageSize = params.normalizedPageSize();
		String normalizedStatus = normalized(status);
		Long total = jdbc.queryForObject("""
				SELECT COUNT(*) FROM warranty_items
				WHERE customer_id = ? AND (? = '' OR status::text = ?)
				""", Long.class, userId, normalizedStatus, normalizedStatus);
		List<CustomerAfterSalesController.WarrantyItemDto> content = jdbc.query("""
				SELECT * FROM warranty_items
				WHERE customer_id = ? AND (? = '' OR status::text = ?)
				ORDER BY created_at DESC
				LIMIT ? OFFSET ?
				""", this::warrantyItemRow, userId, normalizedStatus, normalizedStatus, pageSize, (page - 1) * pageSize);
		return new PageImpl<>(content, PageRequest.of(page - 1, pageSize), total == null ? 0 : total);
	}

	@Transactional(readOnly = true)
	public CustomerAfterSalesController.WarrantyItemDto warrantyItem(UUID userId, String id) {
		try {
			return jdbc.queryForObject("SELECT * FROM warranty_items WHERE id = ? AND customer_id = ?",
					this::warrantyItemRow, uuid(id), userId);
		}
		catch (EmptyResultDataAccessException exception) {
			throw new AppException(ErrorCode.WARRANTY_NOT_FOUND);
		}
	}

	@Transactional
	public CustomerAfterSalesController.WarrantyClaimDto createWarrantyClaim(UUID userId,
			CustomerAfterSalesController.CreateWarrantyClaimRequest request) {
		CustomerAfterSalesController.WarrantyItemDto warranty = warrantyItem(userId, request.warrantyId());
		if (!"ACTIVE".equals(warranty.status()) || LocalDate.parse(warranty.warrantyExpiry()).isBefore(LocalDate.now())) {
			throw new AppException(ErrorCode.WARRANTY_EXPIRED);
		}
		Integer active = jdbc.queryForObject("""
				SELECT COUNT(*) FROM warranty_claims
				WHERE order_id = ? AND product_id = ? AND customer_id = ? AND status::text IN ('NEW','PROCESSING')
				""", Integer.class, uuid(warranty.orderId()), uuid(warranty.productId()), userId);
		if (active != null && active > 0) {
			throw new AppException(ErrorCode.WARRANTY_CLAIM_ALREADY_ACTIVE);
		}
		UUID id = UUID.randomUUID();
		jdbc.update("""
				INSERT INTO warranty_claims (
				  id, claim_number, order_id, product_id, customer_id, customer_name, customer_phone, issue_description, status
				)
				VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'NEW')
				""", id, number("WRN"), uuid(warranty.orderId()), uuid(warranty.productId()), userId,
				customerName(userId), customerPhone(userId), request.issueDescription());
		notifications.send(userId, "SYSTEM", "Yeu cau bao hanh da duoc tao",
				"Yeu cau bao hanh cua ban da duoc tiep nhan.", "MEDIUM", "warranty", "WARRANTY_CLAIM", id,
				"/warranty-claims/" + id, "Xem yeu cau");
		return warrantyClaim(userId, id.toString());
	}

	@Transactional(readOnly = true)
	public Page<CustomerAfterSalesController.WarrantyClaimDto> warrantyClaims(UUID userId, PageRequestParams params,
			String status) {
		int page = params.normalizedPage();
		int pageSize = params.normalizedPageSize();
		String normalizedStatus = normalized(status);
		Long total = jdbc.queryForObject("""
				SELECT COUNT(*) FROM warranty_claims
				WHERE customer_id = ? AND (? = '' OR status::text = ?)
				""", Long.class, userId, normalizedStatus, normalizedStatus);
		List<CustomerAfterSalesController.WarrantyClaimDto> content = jdbc.query("""
				SELECT wc.*, wi.id AS warranty_id, wi.product_name AS warranty_product_name,
				       wi.product_image AS warranty_product_image, wi.brand AS warranty_brand,
				       wi.serial_number AS warranty_serial_number, wi.status::text AS warranty_status
				FROM warranty_claims wc
				LEFT JOIN warranty_items wi ON wi.order_id = wc.order_id AND wi.product_id = wc.product_id AND wi.customer_id = wc.customer_id
				WHERE wc.customer_id = ? AND (? = '' OR wc.status::text = ?)
				ORDER BY wc.created_at DESC
				LIMIT ? OFFSET ?
				""", this::warrantyClaimRow, userId, normalizedStatus, normalizedStatus, pageSize, (page - 1) * pageSize);
		return new PageImpl<>(content, PageRequest.of(page - 1, pageSize), total == null ? 0 : total);
	}

	@Transactional(readOnly = true)
	public CustomerAfterSalesController.WarrantyClaimDto warrantyClaim(UUID userId, String id) {
		try {
			return jdbc.queryForObject("""
					SELECT wc.*, wi.id AS warranty_id, wi.product_name AS warranty_product_name,
					       wi.product_image AS warranty_product_image, wi.brand AS warranty_brand,
					       wi.serial_number AS warranty_serial_number, wi.status::text AS warranty_status
					FROM warranty_claims wc
					LEFT JOIN warranty_items wi ON wi.order_id = wc.order_id AND wi.product_id = wc.product_id AND wi.customer_id = wc.customer_id
					WHERE wc.id = ? AND wc.customer_id = ?
					""", this::warrantyClaimRow, uuid(id), userId);
		}
		catch (EmptyResultDataAccessException exception) {
			throw new AppException(ErrorCode.WARRANTY_NOT_FOUND);
		}
	}

	@Transactional(readOnly = true)
	public CustomerAfterSalesController.TradeInEstimateDto estimate(String brand, String model, String condition) {
		long brandBase = switch (brand.trim().toUpperCase()) {
			case "APPLE" -> 7_000_000L;
			case "SAMSUNG" -> 5_500_000L;
			case "XIAOMI" -> 3_000_000L;
			default -> 2_000_000L;
		};
		double factor = switch (normalized(condition)) {
			case "GOOD" -> 1.0;
			case "FAIR" -> 0.8;
			case "AVERAGE" -> 0.6;
			case "POOR" -> 0.35;
			default -> throw new AppException(ErrorCode.VALIDATION_ERROR, "Tinh trang may khong hop le",
					Map.of("condition", "GOOD, FAIR, AVERAGE, POOR"));
		};
		long estimated = Math.round(brandBase * factor / 10_000.0) * 10_000;
		return new CustomerAfterSalesController.TradeInEstimateDto(brand, model, normalized(condition), estimated, "VND");
	}

	@Transactional
	public CustomerAfterSalesController.TradeInDto createTradeIn(UUID userId,
			CustomerAfterSalesController.CustomerSnapshot customer,
			CustomerAfterSalesController.CreateTradeInRequest request) {
		UUID id = UUID.randomUUID();
		long estimated = request.estimatedValue() == null
				? estimate(request.brand(), request.model(), request.condition()).estimatedValue()
				: request.estimatedValue();
		jdbc.update(connection -> {
			PreparedStatement ps = connection.prepareStatement("""
					INSERT INTO trade_in_requests (
					  id, request_number, customer_id, customer_name, customer_phone, device_name, brand, model, condition,
					  estimated_value, target_product_id, status, images
					)
					VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?::trade_in_condition, ?, ?, 'AWAITING_VALUATION', ?)
					""");
			ps.setObject(1, id);
			ps.setString(2, number("TIN"));
			ps.setObject(3, userId);
			ps.setString(4, customer.name());
			ps.setString(5, customer.phone());
			ps.setString(6, request.deviceName());
			ps.setString(7, request.brand());
			ps.setString(8, request.model());
			ps.setString(9, normalized(request.condition()));
			ps.setLong(10, estimated);
			if (request.targetProductId() == null || request.targetProductId().isBlank()) {
				ps.setObject(11, null);
			}
			else {
				ps.setObject(11, uuid(request.targetProductId()));
			}
			Array images = connection.createArrayOf("text",
					request.images() == null ? new String[0] : request.images().toArray(String[]::new));
			ps.setArray(12, images);
			return ps;
		});
		return tradeIn(userId, id.toString());
	}

	@Transactional(readOnly = true)
	public Page<CustomerAfterSalesController.TradeInDto> tradeIns(UUID userId, PageRequestParams params, String status) {
		int page = params.normalizedPage();
		int pageSize = params.normalizedPageSize();
		String normalizedStatus = normalized(status);
		Long total = jdbc.queryForObject("""
				SELECT COUNT(*) FROM trade_in_requests
				WHERE customer_id = ? AND (? = '' OR status::text = ?)
				""", Long.class, userId, normalizedStatus, normalizedStatus);
		List<CustomerAfterSalesController.TradeInDto> content = jdbc.query("""
				SELECT * FROM trade_in_requests
				WHERE customer_id = ? AND (? = '' OR status::text = ?)
				ORDER BY created_at DESC
				LIMIT ? OFFSET ?
				""", this::tradeInRow, userId, normalizedStatus, normalizedStatus, pageSize, (page - 1) * pageSize);
		return new PageImpl<>(content, PageRequest.of(page - 1, pageSize), total == null ? 0 : total);
	}

	@Transactional(readOnly = true)
	public CustomerAfterSalesController.TradeInDto tradeIn(UUID userId, String id) {
		try {
			return jdbc.queryForObject("SELECT * FROM trade_in_requests WHERE id = ? AND customer_id = ?", this::tradeInRow,
					uuid(id), userId);
		}
		catch (EmptyResultDataAccessException exception) {
			throw new AppException(ErrorCode.TRADE_IN_NOT_FOUND);
		}
	}

	@Transactional
	public CustomerAfterSalesController.TradeInDto customerTradeInStatus(UUID userId, String id, String next) {
		CustomerAfterSalesController.TradeInDto current = tradeIn(userId, id);
		if (!"VALUED".equals(current.status())) {
			throw new AppException(ErrorCode.TRADE_IN_INVALID_STATUS, ErrorCode.TRADE_IN_INVALID_STATUS.message(),
					Map.of("from", current.status(), "to", next));
		}
		jdbc.update("UPDATE trade_in_requests SET status = ?::trade_in_status, updated_at = NOW() WHERE id = ?",
				next, uuid(id));
		notifications.send(userId, "SYSTEM", "Cap nhat thu cu doi moi",
				"Yeu cau thu cu doi moi cua ban da duoc cap nhat: " + next + ".", "MEDIUM", "trade_in", "TRADE_IN",
				uuid(id), "/trade-in/" + id, "Xem yeu cau");
		return tradeIn(userId, id);
	}

	private OrderSnapshot deliveredOrder(UUID userId, String orderId) {
		try {
			OrderSnapshot order = jdbc.queryForObject("""
					SELECT id, customer_name, customer_phone, total_amount, status
					FROM orders
					WHERE id = ? AND customer_id = ?
					""", (rs, rowNum) -> new OrderSnapshot(rs.getObject("id", UUID.class), rs.getString("customer_name"),
					rs.getString("customer_phone"), rs.getLong("total_amount"), rs.getString("status")), uuid(orderId), userId);
			if (!"DELIVERED".equals(order.status())) {
				throw new AppException(ErrorCode.RETURN_ORDER_NOT_DELIVERED);
			}
			return order;
		}
		catch (EmptyResultDataAccessException exception) {
			throw new AppException(ErrorCode.ORDER_NOT_FOUND);
		}
	}

	private String customerName(UUID userId) {
		return jdbc.queryForObject("SELECT COALESCE(MAX(customer_name), 'Khach hang') FROM orders WHERE customer_id = ?",
				String.class, userId);
	}

	private String customerPhone(UUID userId) {
		return jdbc.queryForObject("SELECT COALESCE(MAX(customer_phone), '0900000000') FROM orders WHERE customer_id = ?",
				String.class, userId);
	}

	private CustomerAfterSalesController.ReturnDto returnRow(ResultSet rs, int rowNum) throws SQLException {
		String orderId = object(rs, "order_id");
		return new CustomerAfterSalesController.ReturnDto(rs.getObject("id").toString(), rs.getString("return_number"),
				orderId, object(rs, "customer_id"), rs.getString("customer_name"), rs.getString("customer_phone"),
				rs.getString("reason"), rs.getString("status"), rs.getLong("refund_amount"),
				rs.getString("dispute_resolution"), iso(rs.getObject("created_at", OffsetDateTime.class)),
				iso(rs.getObject("updated_at", OffsetDateTime.class)), returnOrderNumber(orderId), "ORIGINAL_PAYMENT",
				returnItems(orderId));
	}

	private CustomerAfterSalesController.WarrantyItemDto warrantyItemRow(ResultSet rs, int rowNum) throws SQLException {
		return new CustomerAfterSalesController.WarrantyItemDto(rs.getObject("id").toString(), object(rs, "order_id"),
				object(rs, "order_item_id"), object(rs, "product_id"), object(rs, "customer_id"),
				rs.getString("product_name"), rs.getString("product_image"), rs.getString("brand"), rs.getString("serial_number"),
				rs.getInt("warranty_months"), rs.getObject("warranty_start", LocalDate.class).toString(),
				rs.getObject("warranty_expiry", LocalDate.class).toString(), rs.getString("status"),
				iso(rs.getObject("created_at", OffsetDateTime.class)), iso(rs.getObject("updated_at", OffsetDateTime.class)));
	}

	private CustomerAfterSalesController.WarrantyClaimDto warrantyClaimRow(ResultSet rs, int rowNum) throws SQLException {
		String productId = object(rs, "product_id");
		return new CustomerAfterSalesController.WarrantyClaimDto(rs.getObject("id").toString(), rs.getString("claim_number"),
				object(rs, "warranty_id"), object(rs, "order_id"), productId, object(rs, "customer_id"),
				rs.getString("customer_name"), rs.getString("customer_phone"), rs.getString("issue_description"),
				rs.getString("status"), rs.getString("resolution_note"), iso(rs.getObject("created_at", OffsetDateTime.class)),
				iso(rs.getObject("updated_at", OffsetDateTime.class)), coalesce(rs.getString("warranty_product_name"), productName(productId)),
				coalesce(rs.getString("warranty_product_image"), productImage(productId)), rs.getString("warranty_brand"),
				rs.getString("warranty_serial_number"), rs.getString("warranty_status"));
	}

	private List<CustomerAfterSalesController.ReturnItemDto> returnItems(String orderId) {
		if (orderId == null || orderId.isBlank()) {
			return List.of();
		}
		return jdbc.query("""
				SELECT id, product_id, variant_id, product_name, product_image, variant_name, sku,
				       quantity, unit_price, total_price
				FROM order_items
				WHERE order_id = ?
				ORDER BY id
				""", (rs, rowNum) -> new CustomerAfterSalesController.ReturnItemDto(
				object(rs, "id"),
				object(rs, "product_id"),
				object(rs, "variant_id"),
				rs.getString("product_name"),
				rs.getString("product_image"),
				rs.getString("variant_name"),
				rs.getString("sku"),
				rs.getInt("quantity"),
				rs.getLong("unit_price"),
				rs.getLong("total_price")), uuid(orderId));
	}

	private String returnOrderNumber(String orderId) {
		if (orderId == null || orderId.isBlank()) {
			return null;
		}
		try {
			return jdbc.queryForObject("SELECT order_number FROM orders WHERE id = ?", String.class, uuid(orderId));
		}
		catch (EmptyResultDataAccessException exception) {
			return null;
		}
	}

	private String productName(String productId) {
		if (productId == null || productId.isBlank()) {
			return null;
		}
		try {
			return jdbc.queryForObject("SELECT name FROM products WHERE id = ?", String.class, uuid(productId));
		}
		catch (EmptyResultDataAccessException exception) {
			return null;
		}
	}

	private String productImage(String productId) {
		if (productId == null || productId.isBlank()) {
			return null;
		}
		try {
			return jdbc.queryForObject("""
					SELECT url
					FROM product_images
					WHERE product_id = ?
					ORDER BY is_primary DESC, sort_order ASC
					LIMIT 1
					""", String.class, uuid(productId));
		}
		catch (EmptyResultDataAccessException exception) {
			return null;
		}
	}

	private String coalesce(String value, String fallback) {
		return value == null || value.isBlank() ? fallback : value;
	}

	private CustomerAfterSalesController.TradeInDto tradeInRow(ResultSet rs, int rowNum) throws SQLException {
		Long finalValuation = rs.getObject("final_valuation") == null ? null : rs.getLong("final_valuation");
		return new CustomerAfterSalesController.TradeInDto(rs.getObject("id").toString(), rs.getString("request_number"),
				object(rs, "customer_id"), rs.getString("customer_name"), rs.getString("customer_phone"),
				rs.getString("device_name"), rs.getString("brand"), rs.getString("model"), rs.getString("condition"),
				rs.getLong("estimated_value"), finalValuation, object(rs, "target_product_id"), rs.getString("status"),
				List.of((String[]) rs.getArray("images").getArray()), rs.getString("admin_note"),
				iso(rs.getObject("created_at", OffsetDateTime.class)), iso(rs.getObject("updated_at", OffsetDateTime.class)));
	}

	private String object(ResultSet rs, String column) throws SQLException {
		Object value = rs.getObject(column);
		return value == null ? null : value.toString();
	}

	private UUID uuid(String value) {
		try {
			return UUID.fromString(value);
		}
		catch (RuntimeException exception) {
			throw new AppException(ErrorCode.VALIDATION_ERROR, "Du lieu dau vao khong hop le",
					Map.of("id", "UUID khong dung dinh dang"));
		}
	}

	private String normalized(String value) {
		return value == null || value.isBlank() ? "" : value.trim().toUpperCase();
	}

	private String number(String prefix) {
		return prefix + "-" + DateTimeFormatter.ofPattern("yyyyMMdd").format(LocalDate.now()) + "-"
				+ UUID.randomUUID().toString().substring(0, 8).toUpperCase();
	}

	private String iso(OffsetDateTime value) {
		return DateTimeFormatter.ISO_OFFSET_DATE_TIME.format(value);
	}

	private record OrderSnapshot(UUID id, String customerName, String customerPhone, long totalAmount, String status) {
	}
}

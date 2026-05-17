package com.b2b.ecommerce.admin;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import com.b2b.ecommerce.common.ApiResponse;
import com.b2b.ecommerce.common.AppException;
import com.b2b.ecommerce.common.ErrorCode;
import com.b2b.ecommerce.common.PageRequestParams;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/trade-in")
public class AdminTradeInController {
	private final AdminTradeInService tradeIns;

	public AdminTradeInController(AdminTradeInService tradeIns) {
		this.tradeIns = tradeIns;
	}

	@GetMapping
	public ApiResponse<List<TradeInDto>> tradeIns(
			@RequestParam(defaultValue = "1") int page,
			@RequestParam(defaultValue = "20") int pageSize,
			@RequestParam(required = false) String status,
			@RequestParam(required = false) String search) {
		PageRequestParams params = new PageRequestParams(page, pageSize, search, "createdAt", "desc");
		Page<TradeInDto> result = tradeIns.tradeIns(params, status);
		return ApiResponse.page(result.getContent(), (int) result.getTotalElements(), params.normalizedPage(),
				params.normalizedPageSize());
	}

	@GetMapping("/{id}")
	public ApiResponse<TradeInDto> tradeIn(@PathVariable String id) {
		return ApiResponse.ok(tradeIns.tradeIn(id));
	}

	@PatchMapping("/{id}/valuate")
	public ApiResponse<TradeInDto> valuate(@PathVariable String id, @Valid @RequestBody ValuateTradeInRequest request) {
		return ApiResponse.ok(tradeIns.valuate(id, request));
	}

	@PatchMapping("/{id}/complete")
	public ApiResponse<TradeInDto> complete(@PathVariable String id) {
		return ApiResponse.ok(tradeIns.complete(id));
	}

	@PatchMapping("/{id}/status")
	public ApiResponse<TradeInDto> updateStatus(@PathVariable String id, @Valid @RequestBody TradeInStatusRequest request) {
		return ApiResponse.ok(tradeIns.updateStatus(id, request));
	}

	public record ValuateTradeInRequest(@NotNull @Min(0) Long finalValuation, String adminNote) {
	}

	public record TradeInStatusRequest(@jakarta.validation.constraints.NotBlank String status, String adminNote) {
	}

	public record TradeInDto(String id, String requestNumber, String customerId, String customerName, String customerPhone,
			String deviceName, String brand, String model, String condition, long estimatedValue, Long finalValuation,
			String targetProductId, String status, List<String> images, String adminNote, String createdAt, String updatedAt) {
	}
}

@Service
class AdminTradeInService {
	private final JdbcTemplate jdbc;

	AdminTradeInService(JdbcTemplate jdbc) {
		this.jdbc = jdbc;
	}

	@Transactional(readOnly = true)
	public Page<AdminTradeInController.TradeInDto> tradeIns(PageRequestParams params, String status) {
		int page = params.normalizedPage();
		int pageSize = params.normalizedPageSize();
		String normalizedStatus = status == null || status.isBlank() ? "" : status.trim().toUpperCase();
		String search = params.search() == null || params.search().isBlank() ? "" : params.search().trim();
		Long total = jdbc.queryForObject("""
				SELECT COUNT(*)
				FROM trade_in_requests
				WHERE (? = '' OR status::text = ?)
				  AND (? = '' OR request_number ILIKE ? OR customer_name ILIKE ? OR customer_phone ILIKE ?
				       OR device_name ILIKE ? OR brand ILIKE ? OR model ILIKE ?)
				""", Long.class, normalizedStatus, normalizedStatus, search, like(search), like(search), like(search),
				like(search), like(search), like(search));
		List<AdminTradeInController.TradeInDto> content = jdbc.query("""
				SELECT *
				FROM trade_in_requests
				WHERE (? = '' OR status::text = ?)
				  AND (? = '' OR request_number ILIKE ? OR customer_name ILIKE ? OR customer_phone ILIKE ?
				       OR device_name ILIKE ? OR brand ILIKE ? OR model ILIKE ?)
				ORDER BY created_at DESC
				LIMIT ? OFFSET ?
				""", this::tradeInRow, normalizedStatus, normalizedStatus, search, like(search), like(search), like(search),
				like(search), like(search), like(search), pageSize, (page - 1) * pageSize);
		return new PageImpl<>(content, PageRequest.of(page - 1, pageSize), total == null ? 0 : total);
	}

	@Transactional(readOnly = true)
	public AdminTradeInController.TradeInDto tradeIn(String id) {
		try {
			return jdbc.queryForObject("SELECT * FROM trade_in_requests WHERE id = ?", this::tradeInRow, uuid(id));
		}
		catch (EmptyResultDataAccessException exception) {
			throw new AppException(ErrorCode.TRADE_IN_NOT_FOUND);
		}
	}

	@Transactional
	public AdminTradeInController.TradeInDto valuate(String id, AdminTradeInController.ValuateTradeInRequest request) {
		AdminTradeInController.TradeInDto current = tradeIn(id);
		if (!"AWAITING_VALUATION".equals(current.status())) {
			throw invalid(current.status(), "VALUED");
		}
		jdbc.update("""
				UPDATE trade_in_requests
				SET final_valuation = ?, status = 'VALUED', admin_note = COALESCE(?, admin_note), updated_at = NOW()
				WHERE id = ?
				""", request.finalValuation(), request.adminNote(), uuid(id));
		return tradeIn(id);
	}

	@Transactional
	public AdminTradeInController.TradeInDto complete(String id) {
		AdminTradeInController.TradeInDto current = tradeIn(id);
		if (!"ACCEPTED".equals(current.status())) {
			throw invalid(current.status(), "COMPLETED");
		}
		jdbc.update("UPDATE trade_in_requests SET status = 'COMPLETED', updated_at = NOW() WHERE id = ?", uuid(id));
		return tradeIn(id);
	}

	@Transactional
	public AdminTradeInController.TradeInDto updateStatus(String id, AdminTradeInController.TradeInStatusRequest request) {
		AdminTradeInController.TradeInDto current = tradeIn(id);
		String next = request.status().trim().toUpperCase();
		if (!canTransition(current.status(), next)) {
			throw invalid(current.status(), next);
		}
		jdbc.update("""
				UPDATE trade_in_requests
				SET status = ?::trade_in_status, admin_note = COALESCE(?, admin_note), updated_at = NOW()
				WHERE id = ?
				""", next, request.adminNote(), uuid(id));
		return tradeIn(id);
	}

	private boolean canTransition(String from, String to) {
		return switch (from) {
			case "AWAITING_VALUATION" -> to.equals("VALUED") || to.equals("REJECTED");
			case "VALUED" -> to.equals("ACCEPTED") || to.equals("REJECTED");
			case "ACCEPTED" -> to.equals("COMPLETED");
			default -> false;
		};
	}

	private AppException invalid(String from, String to) {
		return new AppException(ErrorCode.TRADE_IN_INVALID_STATUS, ErrorCode.TRADE_IN_INVALID_STATUS.message(),
				Map.of("from", from, "to", to));
	}

	private AdminTradeInController.TradeInDto tradeInRow(ResultSet rs, int rowNum) throws SQLException {
		Object customerId = rs.getObject("customer_id");
		Object targetProductId = rs.getObject("target_product_id");
		Long finalValuation = rs.getObject("final_valuation") == null ? null : rs.getLong("final_valuation");
		return new AdminTradeInController.TradeInDto(rs.getObject("id").toString(), rs.getString("request_number"),
				customerId == null ? null : customerId.toString(), rs.getString("customer_name"), rs.getString("customer_phone"),
				rs.getString("device_name"), rs.getString("brand"), rs.getString("model"), rs.getString("condition"),
				rs.getLong("estimated_value"), finalValuation, targetProductId == null ? null : targetProductId.toString(),
				rs.getString("status"), List.of((String[]) rs.getArray("images").getArray()), rs.getString("admin_note"),
				iso(rs.getObject("created_at", OffsetDateTime.class)), iso(rs.getObject("updated_at", OffsetDateTime.class)));
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

	private String like(String value) {
		return value == null || value.isBlank() ? "" : "%" + value + "%";
	}

	private String iso(OffsetDateTime value) {
		return DateTimeFormatter.ISO_OFFSET_DATE_TIME.format(value);
	}
}

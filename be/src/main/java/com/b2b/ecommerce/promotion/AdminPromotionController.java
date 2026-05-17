package com.b2b.ecommerce.promotion;

import java.math.BigDecimal;
import java.sql.Array;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;

import com.b2b.ecommerce.common.ApiResponse;
import com.b2b.ecommerce.common.AppException;
import com.b2b.ecommerce.common.ErrorCode;
import com.b2b.ecommerce.common.PageRequestParams;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
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
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/promotions")
public class AdminPromotionController {
	private final AdminPromotionService promotions;

	public AdminPromotionController(AdminPromotionService promotions) {
		this.promotions = promotions;
	}

	@GetMapping
	public ApiResponse<List<PromotionDto>> promotions(
			@RequestParam(defaultValue = "1") int page,
			@RequestParam(defaultValue = "20") int pageSize,
			@RequestParam(required = false) String status,
			@RequestParam(required = false) String search) {
		PageRequestParams params = new PageRequestParams(page, pageSize, search, "updatedAt", "desc");
		Page<PromotionDto> result = promotions.promotions(params, status);
		return ApiResponse.page(result.getContent(), (int) result.getTotalElements(), params.normalizedPage(),
				params.normalizedPageSize());
	}

	@PostMapping
	public ResponseEntity<ApiResponse<PromotionDto>> create(@Valid @RequestBody PromotionRequest request) {
		return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(promotions.create(request)));
	}

	@GetMapping("/{id}")
	public ApiResponse<PromotionDto> promotion(@PathVariable String id) {
		return ApiResponse.ok(promotions.promotion(id));
	}

	@PatchMapping("/{id}")
	public ApiResponse<PromotionDto> update(@PathVariable String id, @Valid @RequestBody PromotionRequest request) {
		return ApiResponse.ok(promotions.update(id, request));
	}

	@PatchMapping("/{id}/toggle")
	public ApiResponse<PromotionDto> toggle(@PathVariable String id) {
		return ApiResponse.ok(promotions.toggle(id));
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<Void> delete(@PathVariable String id) {
		promotions.delete(id);
		return ResponseEntity.noContent().build();
	}

	public record PromotionRequest(
			@NotBlank String code,
			@NotBlank String name,
			String description,
			@NotBlank String type,
			@NotNull @DecimalMin("0.0") BigDecimal value,
			@Min(0) Long minOrderValue,
			@Min(0) Long maxDiscount,
			@NotBlank String startDate,
			@NotBlank String endDate,
			@Min(0) Integer usageLimit,
			List<String> applicableProducts,
			List<String> applicableCategories,
			List<String> applicableBrands,
			Boolean isActive
	) {
	}
}

@Service
class AdminPromotionService {
	private final JdbcTemplate jdbc;

	AdminPromotionService(JdbcTemplate jdbc) {
		this.jdbc = jdbc;
	}

	@Transactional(readOnly = true)
	public Page<PromotionDto> promotions(PageRequestParams params, String status) {
		int page = params.normalizedPage();
		int pageSize = params.normalizedPageSize();
		String search = normalizedSearch(params.search());
		String normalizedStatus = status == null || status.isBlank() ? "" : status.trim().toUpperCase(Locale.ROOT);
		Long total = jdbc.queryForObject("""
				SELECT COUNT(*)
				FROM promotions
				WHERE (? = '' OR code ILIKE ? OR name ILIKE ?)
				  AND (? = ''
				       OR (? = 'ACTIVE' AND is_active = TRUE AND start_date <= NOW() AND end_date >= NOW())
				       OR (? = 'INACTIVE' AND is_active = FALSE)
				       OR (? = 'SCHEDULED' AND start_date > NOW())
				       OR (? = 'EXPIRED' AND end_date < NOW()))
				""", Long.class, search, like(search), like(search), normalizedStatus, normalizedStatus,
				normalizedStatus, normalizedStatus, normalizedStatus);
		List<PromotionDto> content = jdbc.query("""
				SELECT *
				FROM promotions
				WHERE (? = '' OR code ILIKE ? OR name ILIKE ?)
				  AND (? = ''
				       OR (? = 'ACTIVE' AND is_active = TRUE AND start_date <= NOW() AND end_date >= NOW())
				       OR (? = 'INACTIVE' AND is_active = FALSE)
				       OR (? = 'SCHEDULED' AND start_date > NOW())
				       OR (? = 'EXPIRED' AND end_date < NOW()))
				ORDER BY updated_at DESC, created_at DESC
				LIMIT ? OFFSET ?
				""", this::promotionDto, search, like(search), like(search), normalizedStatus, normalizedStatus,
				normalizedStatus, normalizedStatus, normalizedStatus, pageSize, (page - 1) * pageSize);
		return new PageImpl<>(content, PageRequest.of(page - 1, pageSize), total == null ? 0 : total);
	}

	@Transactional(readOnly = true)
	public PromotionDto promotion(String id) {
		try {
			return jdbc.queryForObject("SELECT * FROM promotions WHERE id = ?", this::promotionDto, UUID.fromString(id));
		}
		catch (EmptyResultDataAccessException exception) {
			throw new AppException(ErrorCode.PROMOTION_NOT_FOUND);
		}
	}

	@Transactional
	public PromotionDto create(AdminPromotionController.PromotionRequest request) {
		validateRequest(request, null);
		UUID id = UUID.randomUUID();
		jdbc.update("""
				INSERT INTO promotions (id, code, name, description, type, value, min_order_value, max_discount,
				                        start_date, end_date, usage_limit, applicable_products, applicable_categories,
				                        applicable_brands, is_active, updated_at)
				VALUES (?, ?, ?, ?,
				        ?::discount_type, ?, ?, ?,
				        ?::timestamptz, ?::timestamptz, ?,
				        CASE WHEN ? = '' THEN '{}'::uuid[] ELSE string_to_array(?, ',')::uuid[] END,
				        CASE WHEN ? = '' THEN '{}'::uuid[] ELSE string_to_array(?, ',')::uuid[] END,
				        CASE WHEN ? = '' THEN '{}'::text[] ELSE string_to_array(?, ',')::text[] END,
				        ?, NOW())
				""", id, request.code().trim().toUpperCase(Locale.ROOT), request.name().trim(),
				blank(request.description()), request.type().trim().toUpperCase(Locale.ROOT), request.value(),
				zero(request.minOrderValue()), zero(request.maxDiscount()), request.startDate(), request.endDate(),
				request.usageLimit() == null ? 0 : request.usageLimit(), csv(request.applicableProducts()),
				csv(request.applicableProducts()), csv(request.applicableCategories()), csv(request.applicableCategories()),
				csv(request.applicableBrands()), csv(request.applicableBrands()), request.isActive() == null || request.isActive());
		return promotion(id.toString());
	}

	@Transactional
	public PromotionDto update(String id, AdminPromotionController.PromotionRequest request) {
		UUID uuid = UUID.fromString(id);
		promotion(id);
		validateRequest(request, uuid);
		jdbc.update("""
				UPDATE promotions
				SET code = ?, name = ?, description = ?, type = ?::discount_type, value = ?,
				    min_order_value = ?, max_discount = ?, start_date = ?::timestamptz, end_date = ?::timestamptz,
				    usage_limit = ?,
				    applicable_products = CASE WHEN ? = '' THEN '{}'::uuid[] ELSE string_to_array(?, ',')::uuid[] END,
				    applicable_categories = CASE WHEN ? = '' THEN '{}'::uuid[] ELSE string_to_array(?, ',')::uuid[] END,
				    applicable_brands = CASE WHEN ? = '' THEN '{}'::text[] ELSE string_to_array(?, ',')::text[] END,
				    is_active = ?, updated_at = NOW()
				WHERE id = ?
				""", request.code().trim().toUpperCase(Locale.ROOT), request.name().trim(), blank(request.description()),
				request.type().trim().toUpperCase(Locale.ROOT), request.value(), zero(request.minOrderValue()),
				zero(request.maxDiscount()), request.startDate(), request.endDate(),
				request.usageLimit() == null ? 0 : request.usageLimit(), csv(request.applicableProducts()),
				csv(request.applicableProducts()), csv(request.applicableCategories()), csv(request.applicableCategories()),
				csv(request.applicableBrands()), csv(request.applicableBrands()), request.isActive() == null || request.isActive(),
				uuid);
		return promotion(id);
	}

	@Transactional
	public PromotionDto toggle(String id) {
		jdbc.update("UPDATE promotions SET is_active = NOT is_active, updated_at = NOW() WHERE id = ?", UUID.fromString(id));
		return promotion(id);
	}

	@Transactional
	public void delete(String id) {
		int rows = jdbc.update("DELETE FROM promotions WHERE id = ?", UUID.fromString(id));
		if (rows == 0) {
			throw new AppException(ErrorCode.PROMOTION_NOT_FOUND);
		}
	}

	private void validateRequest(AdminPromotionController.PromotionRequest request, UUID currentId) {
		OffsetDateTime start;
		OffsetDateTime end;
		try {
			start = OffsetDateTime.parse(request.startDate());
			end = OffsetDateTime.parse(request.endDate());
		}
		catch (RuntimeException exception) {
			throw new AppException(ErrorCode.VALIDATION_ERROR, "Du lieu dau vao khong hop le",
					Map.of("startDate", "Ngay phai co dinh dang ISO_OFFSET_DATE_TIME",
							"endDate", "Ngay phai co dinh dang ISO_OFFSET_DATE_TIME"));
		}
		if (!start.isBefore(end)) {
			throw new AppException(ErrorCode.VALIDATION_ERROR, "Khoang ngay khong hop le",
					Map.of("endDate", "endDate phai lon hon startDate"));
		}
		if ("PERCENTAGE".equalsIgnoreCase(request.type())
				&& (request.value().compareTo(BigDecimal.ZERO) < 0 || request.value().compareTo(BigDecimal.valueOf(100)) > 0)) {
			throw new AppException(ErrorCode.VALIDATION_ERROR, "Gia tri khuyen mai khong hop le",
					Map.of("value", "PERCENTAGE phai nam trong khoang 0-100"));
		}
		Long exists = jdbc.queryForObject("""
				SELECT COUNT(*)
				FROM promotions
				WHERE UPPER(code) = UPPER(?) AND (? IS NULL OR id <> ?)
				""", Long.class, request.code().trim(), currentId, currentId);
		if (exists != null && exists > 0) {
			throw new AppException(ErrorCode.CONFLICT, "Ma khuyen mai da ton tai", Map.of("code", request.code().trim()));
		}
	}

	private PromotionDto promotionDto(ResultSet rs, int rowNum) throws SQLException {
		return new PromotionDto(rs.getObject("id", UUID.class).toString(), rs.getString("code"), rs.getString("name"),
				rs.getString("description"), rs.getString("type"), rs.getBigDecimal("value"),
				rs.getLong("min_order_value"), rs.getLong("max_discount"),
				DateTimeFormatter.ISO_OFFSET_DATE_TIME.format(rs.getObject("start_date", OffsetDateTime.class)),
				DateTimeFormatter.ISO_OFFSET_DATE_TIME.format(rs.getObject("end_date", OffsetDateTime.class)),
				rs.getInt("usage_limit"), rs.getInt("used_count"), strings(rs.getArray("applicable_products")),
				strings(rs.getArray("applicable_categories")), strings(rs.getArray("applicable_brands")),
				rs.getBoolean("is_active"));
	}

	private List<String> strings(Array array) throws SQLException {
		if (array == null) {
			return List.of();
		}
		Object[] values = (Object[]) array.getArray();
		return Arrays.stream(values)
				.map(value -> value instanceof UUID uuid ? uuid.toString() : String.valueOf(value))
				.filter(value -> value != null && !value.isBlank())
				.map(String::trim)
				.toList();
	}

	private String csv(List<String> values) {
		return values == null ? "" : String.join(",", values.stream()
				.filter(value -> value != null && !value.isBlank())
				.map(String::trim)
				.toList());
	}

	private String like(String value) {
		return value == null || value.isBlank() ? null : "%" + value.trim() + "%";
	}

	private String normalizedSearch(String value) {
		return value == null || value.isBlank() ? "" : value.trim();
	}

	private String blank(String value) {
		return value == null ? "" : value;
	}

	private long zero(Long value) {
		return value == null ? 0 : value;
	}
}

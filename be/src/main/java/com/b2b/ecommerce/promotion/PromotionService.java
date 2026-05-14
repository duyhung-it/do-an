package com.b2b.ecommerce.promotion;

import java.math.BigDecimal;
import java.math.RoundingMode;
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

import com.b2b.ecommerce.common.AppException;
import com.b2b.ecommerce.common.ErrorCode;
import com.b2b.ecommerce.common.PageRequestParams;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PromotionService {
	private final JdbcTemplate jdbc;

	public PromotionService(JdbcTemplate jdbc) {
		this.jdbc = jdbc;
	}

	@Transactional(readOnly = true)
	public Page<PromotionDto> activePromotions(PageRequestParams params) {
		int page = params.normalizedPage();
		int pageSize = params.normalizedPageSize();
		Long total = jdbc.queryForObject("""
				SELECT COUNT(*)
				FROM promotions
				WHERE is_active = TRUE
				  AND start_date <= NOW()
				  AND end_date >= NOW()
				  AND (usage_limit = 0 OR used_count < usage_limit)
				""", Long.class);
		List<PromotionDto> content = jdbc.query("""
				SELECT *
				FROM promotions
				WHERE is_active = TRUE
				  AND start_date <= NOW()
				  AND end_date >= NOW()
				  AND (usage_limit = 0 OR used_count < usage_limit)
				ORDER BY end_date ASC
				LIMIT ? OFFSET ?
				""", this::promotionDto, pageSize, (page - 1) * pageSize);
		return new PageImpl<>(content, PageRequest.of(page - 1, pageSize), total == null ? 0 : total);
	}

	@Transactional(readOnly = true)
	public PromotionValidateResponse validate(PromotionValidateRequest request) {
		PromotionDto promotion = findByCode(request.code());
		OffsetDateTime now = OffsetDateTime.now();
		if (!promotion.isActive()) {
			throw new AppException(ErrorCode.PROMOTION_INACTIVE);
		}
		OffsetDateTime start = OffsetDateTime.parse(promotion.startDate());
		OffsetDateTime end = OffsetDateTime.parse(promotion.endDate());
		if (now.isBefore(start) || now.isAfter(end)) {
			throw new AppException(ErrorCode.PROMOTION_EXPIRED);
		}
		if (promotion.usageLimit() > 0 && promotion.usedCount() >= promotion.usageLimit()) {
			throw new AppException(ErrorCode.PROMOTION_USAGE_EXCEEDED);
		}
		if (request.cartTotal() < promotion.minOrderValue()) {
			throw new AppException(ErrorCode.PROMOTION_MIN_ORDER_NOT_MET, ErrorCode.PROMOTION_MIN_ORDER_NOT_MET.message(),
					Map.of("minOrderValue", promotion.minOrderValue(), "cartTotal", request.cartTotal()));
		}
		if (!applicable(promotion, request.cartItems())) {
			throw new AppException(ErrorCode.PROMOTION_NOT_APPLICABLE);
		}
		long discount = discount(promotion, request.cartTotal());
		return new PromotionValidateResponse(true, promotion, discount, "Giam " + discount + " VND");
	}

	private PromotionDto findByCode(String code) {
		try {
			return jdbc.queryForObject("SELECT * FROM promotions WHERE UPPER(code) = UPPER(?)",
					this::promotionDto, code.trim());
		}
		catch (EmptyResultDataAccessException exception) {
			throw new AppException(ErrorCode.PROMOTION_NOT_FOUND);
		}
	}

	private boolean applicable(PromotionDto promotion, List<PromotionCartItemRequest> items) {
		boolean all = promotion.applicableProducts().isEmpty()
				&& promotion.applicableCategories().isEmpty()
				&& promotion.applicableBrands().isEmpty();
		if (all) {
			return true;
		}
		return items.stream().anyMatch(item ->
				containsIgnoreCase(promotion.applicableProducts(), item.productId())
						|| containsIgnoreCase(promotion.applicableCategories(), item.categoryId())
						|| containsIgnoreCase(promotion.applicableBrands(), item.effectiveBrand()));
	}

	private long discount(PromotionDto promotion, long cartTotal) {
		long discount = switch (promotion.type()) {
			case "PERCENTAGE" -> BigDecimal.valueOf(cartTotal)
					.multiply(promotion.value())
					.divide(BigDecimal.valueOf(100), 0, RoundingMode.DOWN)
					.longValue();
			case "FIXED_AMOUNT" -> promotion.value().setScale(0, RoundingMode.DOWN).longValue();
			case "FREE_SHIPPING", "BUY_X_GET_Y" -> 0;
			default -> 0;
		};
		if ("PERCENTAGE".equals(promotion.type()) && promotion.maxDiscount() > 0) {
			discount = Math.min(discount, promotion.maxDiscount());
		}
		return Math.min(discount, cartTotal);
	}

	private boolean containsIgnoreCase(List<String> values, String candidate) {
		if (candidate == null || candidate.isBlank()) {
			return false;
		}
		return values.stream().anyMatch(value -> value.equalsIgnoreCase(candidate.trim()));
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
				.map(value -> value.trim().toLowerCase(Locale.ROOT).equals("null") ? "" : value.trim())
				.filter(value -> !value.isBlank())
				.toList();
	}
}

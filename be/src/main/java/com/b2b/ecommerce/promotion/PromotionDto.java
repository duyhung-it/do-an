package com.b2b.ecommerce.promotion;

import java.math.BigDecimal;
import java.util.List;

public record PromotionDto(
		String id,
		String code,
		String name,
		String description,
		String type,
		BigDecimal value,
		long minOrderValue,
		long maxDiscount,
		String startDate,
		String endDate,
		int usageLimit,
		int usedCount,
		List<String> applicableProducts,
		List<String> applicableCategories,
		List<String> applicableBrands,
		boolean isActive
) {
}

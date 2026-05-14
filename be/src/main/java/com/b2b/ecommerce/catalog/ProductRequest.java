package com.b2b.ecommerce.catalog;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

import jakarta.validation.constraints.Min;

public record ProductRequest(
		String name,
		String slug,
		String description,
		String shortDescription,
		String categoryId,
		String brand,
		BigDecimal price,
		BigDecimal originalPrice,
		String status,
		String condition,
		@Min(1) Integer warranty,
		List<String> tags,
		Map<String, String> specifications,
		String color,
		Boolean isNew,
		Boolean isFeatured,
		Boolean isHot
) {
}

package com.b2b.ecommerce.catalog;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public record ProductDto(
		String id,
		String name,
		String slug,
		String description,
		String categoryId,
		String categoryName,
		String supplierId,
		String supplierName,
		BigDecimal price,
		BigDecimal originalPrice,
		int stock,
		String unit,
		int minOrderQty,
		List<String> images,
		Map<String, String> specifications,
		List<String> tags,
		String status,
		boolean isActive,
		String brandName,
		String origin,
		Integer weight,
		String dimensions,
		Integer warrantyMonths,
		int viewCount,
		int soldCount,
		boolean featured,
		BigDecimal rating,
		int reviewCount,
		String createdAt,
		String updatedAt
) {
}

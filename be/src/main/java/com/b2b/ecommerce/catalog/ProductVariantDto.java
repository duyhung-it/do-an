package com.b2b.ecommerce.catalog;

import java.math.BigDecimal;

public record ProductVariantDto(
		String id,
		String productId,
		String name,
		String sku,
		BigDecimal price,
		BigDecimal originalPrice,
		int stock,
		String color,
		String storage,
		String ram,
		boolean isActive,
		String createdAt,
		String updatedAt
) {
}

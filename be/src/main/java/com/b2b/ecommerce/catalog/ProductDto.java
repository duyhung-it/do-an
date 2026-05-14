package com.b2b.ecommerce.catalog;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public record ProductDto(
		String id,
		String name,
		String slug,
		String description,
		String shortDescription,
		String categoryId,
		CategorySummary category,
		String brand,
		BigDecimal price,
		BigDecimal originalPrice,
		int discountPercent,
		String status,
		String condition,
		int warranty,
		List<String> tags,
		Map<String, String> specifications,
		String color,
		int viewCount,
		int soldCount,
		BigDecimal rating,
		int reviewCount,
		boolean isNew,
		boolean isFeatured,
		boolean isHot,
		List<ProductVariantDto> variants,
		List<ProductImageDto> images,
		PhoneSpecsDto phoneSpecs,
		String createdAt,
		String updatedAt
) {
	public record CategorySummary(String id, String name, String slug) {
	}
}

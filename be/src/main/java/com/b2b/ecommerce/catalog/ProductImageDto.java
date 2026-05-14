package com.b2b.ecommerce.catalog;

public record ProductImageDto(
		String id,
		String productId,
		String url,
		String altText,
		int sortOrder,
		boolean isPrimary,
		String createdAt
) {
}

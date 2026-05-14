package com.b2b.ecommerce.catalog;

public record CategoryRequest(
		String name,
		String slug,
		String parentId,
		String description,
		String icon,
		String imageUrl,
		Boolean isActive,
		Integer sortOrder,
		String metaTitle,
		String metaDescription
) {
}

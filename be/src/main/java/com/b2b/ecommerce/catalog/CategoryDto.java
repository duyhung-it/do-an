package com.b2b.ecommerce.catalog;

import java.util.List;

public record CategoryDto(
		String id,
		String name,
		String slug,
		String description,
		String icon,
		String imageUrl,
		String parentId,
		int level,
		String path,
		boolean isActive,
		int sortOrder,
		int productCount,
		String metaTitle,
		String metaDescription,
		List<CategoryDto> children,
		String createdAt,
		String updatedAt
) {
	public CategoryDto withChildren(List<CategoryDto> children) {
		return new CategoryDto(id, name, slug, description, icon, imageUrl, parentId, level, path, isActive, sortOrder,
				productCount, metaTitle, metaDescription, children, createdAt, updatedAt);
	}
}

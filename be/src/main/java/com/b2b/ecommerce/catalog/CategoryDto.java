package com.b2b.ecommerce.catalog;

import java.util.List;

public record CategoryDto(
		String id,
		String name,
		String slug,
		String parentId,
		String description,
		String icon,
		boolean isActive,
		String imageUrl,
		int sortOrder,
		int level,
		String path,
		int productCount,
		List<CategoryDto> children
) {
	public CategoryDto withChildren(List<CategoryDto> children) {
		return new CategoryDto(id, name, slug, parentId, description, icon, isActive, imageUrl, sortOrder, level, path,
				productCount, children);
	}
}

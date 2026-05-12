package com.b2b.ecommerce.catalog;

import jakarta.validation.constraints.NotBlank;

public record CategoryRequest(
		@NotBlank String name,
		String parentId,
		String description,
		String icon,
		Boolean isActive,
		Integer sortOrder
) {
}

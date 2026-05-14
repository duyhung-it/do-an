package com.b2b.ecommerce.catalog;

import jakarta.validation.constraints.NotBlank;

public record ProductImageRequest(
		@NotBlank String url,
		String altText,
		Integer sortOrder,
		Boolean isPrimary
) {
}

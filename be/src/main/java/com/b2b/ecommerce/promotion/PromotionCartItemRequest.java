package com.b2b.ecommerce.promotion;

import jakarta.validation.constraints.NotBlank;

public record PromotionCartItemRequest(
		@NotBlank String productId,
		String categoryId,
		String brand,
		String brandId
) {
	String effectiveBrand() {
		return brand() == null || brand().isBlank() ? brandId() : brand();
	}
}

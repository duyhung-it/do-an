package com.b2b.ecommerce.promotion;

public record PromotionValidateResponse(
		boolean valid,
		PromotionDto promotion,
		long discount,
		String message
) {
}

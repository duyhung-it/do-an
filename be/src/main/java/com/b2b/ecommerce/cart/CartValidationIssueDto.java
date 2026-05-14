package com.b2b.ecommerce.cart;

public record CartValidationIssueDto(
		String cartItemId,
		String productId,
		String variantId,
		String type,
		String message,
		Long cartUnitPrice,
		Long currentUnitPrice,
		Integer requestedQuantity,
		Integer availableStock
) {
}

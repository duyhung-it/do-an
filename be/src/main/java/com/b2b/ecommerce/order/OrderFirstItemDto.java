package com.b2b.ecommerce.order;

public record OrderFirstItemDto(
		String productId,
		String variantId,
		String productName,
		String productImage,
		String variantName
) {
}

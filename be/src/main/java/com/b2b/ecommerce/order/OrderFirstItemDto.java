package com.b2b.ecommerce.order;

public record OrderFirstItemDto(
		String productName,
		String productImage,
		String variantName
) {
}

package com.b2b.ecommerce.order;

public record OrderItemDto(
		String id,
		String productId,
		String variantId,
		String productName,
		String productImage,
		String brand,
		String variantName,
		String color,
		String storage,
		int quantity,
		long unitPrice,
		long totalPrice
) {
}

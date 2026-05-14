package com.b2b.ecommerce.cart;

public record CartItemDto(
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
		long totalPrice,
		String note,
		String addedAt
) {
}

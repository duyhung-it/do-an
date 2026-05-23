package com.b2b.ecommerce.order;

public record InvoiceLineDto(
		String productId,
		String variantId,
		String productName,
		String productImage,
		String variantName,
		String sku,
		int quantity,
		long unitPrice,
		Long originalPrice,
		long discount,
		long totalPrice
) {
}

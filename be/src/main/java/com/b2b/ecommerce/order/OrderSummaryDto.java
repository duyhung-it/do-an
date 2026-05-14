package com.b2b.ecommerce.order;

public record OrderSummaryDto(
		String id,
		String orderNumber,
		String status,
		String paymentStatus,
		long totalAmount,
		OrderSummaryItemsDto items,
		String createdAt
) {
}

package com.b2b.ecommerce.order;

public record AdminOrderSummaryDto(
		String id,
		String orderNumber,
		String customerId,
		String customerName,
		String customerPhone,
		String customerEmail,
		String status,
		String paymentStatus,
		String paymentMethod,
		long subtotal,
		long discount,
		long shippingFee,
		long totalAmount,
		String promotionCode,
		OrderSummaryItemsDto items,
		String createdAt,
		String updatedAt
) {
}

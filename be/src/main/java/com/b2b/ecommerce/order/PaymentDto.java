package com.b2b.ecommerce.order;

public record PaymentDto(
		String id,
		String orderId,
		String orderNumber,
		String method,
		String status,
		long amount,
		long paidAmount,
		String transactionId,
		String paymentUrl,
		String paidAt,
		String createdAt
) {
}

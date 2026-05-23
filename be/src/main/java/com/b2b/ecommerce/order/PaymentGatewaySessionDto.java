package com.b2b.ecommerce.order;

public record PaymentGatewaySessionDto(
		String id,
		String paymentId,
		String orderId,
		String provider,
		String requestId,
		String transactionRef,
		long amount,
		String status,
		String paymentUrl,
		String returnUrl,
		String callbackUrl,
		String paidAt,
		String createdAt
) {
}

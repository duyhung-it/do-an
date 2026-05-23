package com.b2b.ecommerce.order;

public record PaymentGatewayCallbackRequest(
		String provider,
		String requestId,
		String transactionRef,
		String status,
		Long amount,
		String signature
) {
}

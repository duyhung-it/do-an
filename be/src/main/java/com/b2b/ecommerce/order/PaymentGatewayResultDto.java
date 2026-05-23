package com.b2b.ecommerce.order;

public record PaymentGatewayResultDto(
		String requestId,
		String provider,
		String status,
		String transactionRef,
		long amount,
		String paymentId,
		String orderId,
		CustomerPaymentDto payment
) {
}

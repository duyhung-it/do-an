package com.b2b.ecommerce.order;

public record PaymentProofDto(
		String id,
		String paymentId,
		String orderId,
		String customerId,
		String proofUrl,
		String note,
		long amount,
		String method,
		String transactionRef,
		String status,
		String createdAt
) {
}

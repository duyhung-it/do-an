package com.b2b.ecommerce.order;

public record CustomerPaymentDto(
		String id,
		String orderId,
		String orderNumber,
		String customerId,
		long amount,
		long paidAmount,
		long remainingAmount,
		String dueDate,
		String status,
		String method,
		String transactionRef,
		String paidAt,
		String createdAt) {
}

package com.b2b.ecommerce.order;

public record AdminPaymentDto(
		String id,
		String orderId,
		String orderNumber,
		String customerId,
		String customerName,
		String customerPhone,
		long amount,
		long paidAmount,
		long remainingAmount,
		String dueDate,
		String status,
		String method,
		String transactionRef,
		String paidAt,
		Long refundAmount,
		String refundReason,
		String refundMethod,
		String refundedAt,
		String createdAt
) {
}

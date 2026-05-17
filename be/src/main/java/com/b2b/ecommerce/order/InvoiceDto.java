package com.b2b.ecommerce.order;

public record InvoiceDto(
		String id,
		String invoiceNumber,
		String orderId,
		String orderNumber,
		String customerId,
		String customerName,
		long totalAmount,
		long taxAmount,
		String status,
		String issueDate,
		String dueDate,
		String paidAt,
		String createdAt
) {
}

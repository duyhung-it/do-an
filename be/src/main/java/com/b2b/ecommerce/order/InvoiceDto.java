package com.b2b.ecommerce.order;

import java.util.List;

public record InvoiceDto(
		String id,
		String invoiceNumber,
		String orderId,
		String orderNumber,
		String customerId,
		String customerName,
		long totalAmount,
		long taxAmount,
		long discountAmount,
		String status,
		String issueDate,
		String dueDate,
		String paidAt,
		String createdAt,
		String customerEmail,
		String customerPhone,
		String invoiceType,
		String sellerName,
		String sellerTaxCode,
		String sellerAddress,
		String notes,
		List<InvoiceLineDto> lines
) {
}

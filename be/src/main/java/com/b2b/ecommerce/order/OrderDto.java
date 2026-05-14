package com.b2b.ecommerce.order;

import java.util.List;

public record OrderDto(
		String id,
		String orderNumber,
		String customerId,
		String customerName,
		String customerPhone,
		String customerEmail,
		String status,
		String paymentStatus,
		String paymentMethod,
		ShippingAddressDto shippingAddress,
		List<OrderItemDto> items,
		long subtotal,
		long discount,
		long shippingFee,
		long totalAmount,
		String promotionCode,
		String promotionId,
		String notes,
		String internalNotes,
		String cancelReason,
		String cancelledAt,
		List<OrderStatusHistoryDto> statusHistory,
		String createdAt,
		String updatedAt
) {
}

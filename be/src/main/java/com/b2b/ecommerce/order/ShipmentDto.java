package com.b2b.ecommerce.order;

public record ShipmentDto(
		String id,
		String orderId,
		String orderNumber,
		String trackingNumber,
		String carrierName,
		String status,
		String estimatedDelivery,
		String actualDelivery,
		String createdAt,
		String updatedAt) {
}

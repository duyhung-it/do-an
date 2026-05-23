package com.b2b.ecommerce.order;

import java.util.List;

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
		String updatedAt,
		String customerName,
		String customerPhone,
		long shippingFee,
		String fromAddress,
		String toAddress,
		String weight,
		String dimensions,
		List<ShipmentTrackingEventDto> trackingHistory) {
}

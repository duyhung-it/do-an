package com.b2b.ecommerce.order;

import jakarta.validation.constraints.NotBlank;

public record CreateShipmentRequest(
		@NotBlank String orderId,
		String trackingNumber,
		String carrierName,
		String status,
		String estimatedDelivery
) {
}

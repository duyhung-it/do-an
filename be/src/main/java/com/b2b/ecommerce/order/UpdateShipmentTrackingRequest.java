package com.b2b.ecommerce.order;

import jakarta.validation.constraints.NotBlank;

public record UpdateShipmentTrackingRequest(
		@NotBlank String trackingNumber,
		@NotBlank String carrierName,
		String estimatedDelivery
) {
}

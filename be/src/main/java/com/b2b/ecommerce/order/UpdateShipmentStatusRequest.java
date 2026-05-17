package com.b2b.ecommerce.order;

import jakarta.validation.constraints.NotBlank;

public record UpdateShipmentStatusRequest(
		@NotBlank
		String status) {
}

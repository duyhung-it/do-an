package com.b2b.ecommerce.order;

import jakarta.validation.constraints.NotBlank;

public record UpdateInvoiceStatusRequest(
		@NotBlank
		String status) {
}

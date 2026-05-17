package com.b2b.ecommerce.order;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RefundPaymentRequest(
		@Min(1)
		long refundAmount,
		@NotBlank
		@Size(max = 500)
		String reason,
		@NotBlank
		String method) {
	public String normalizedReason() {
		return reason.trim();
	}
}

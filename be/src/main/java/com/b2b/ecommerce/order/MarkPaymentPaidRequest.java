package com.b2b.ecommerce.order;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public record MarkPaymentPaidRequest(
		@Positive long paidAmount,
		@NotBlank @Size(max = 200) String transactionRef,
		@NotBlank String method
) {
}

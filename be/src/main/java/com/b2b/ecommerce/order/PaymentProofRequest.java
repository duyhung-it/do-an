package com.b2b.ecommerce.order;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record PaymentProofRequest(
		@NotBlank String proofUrl,
		@Size(max = 1000) String note,
		Long amount,
		@Size(max = 200) String transactionRef,
		String method
) {
}

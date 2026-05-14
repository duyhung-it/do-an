package com.b2b.ecommerce.order;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record OrderItemRequest(
		@NotBlank String productId,
		String variantId,
		@NotNull @Min(1) Integer quantity
) {
}

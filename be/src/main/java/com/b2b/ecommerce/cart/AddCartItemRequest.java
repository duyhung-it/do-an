package com.b2b.ecommerce.cart;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public record AddCartItemRequest(
		@NotBlank String productId,
		String variantId,
		@Min(1) @Max(99) Integer quantity,
		String note
) {
}

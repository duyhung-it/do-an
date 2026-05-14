package com.b2b.ecommerce.promotion;

import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record PromotionValidateRequest(
		@NotBlank String code,
		@NotNull @Min(0) Long cartTotal,
		@NotNull List<@Valid PromotionCartItemRequest> cartItems
) {
}

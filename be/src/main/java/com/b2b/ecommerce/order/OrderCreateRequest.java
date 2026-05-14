package com.b2b.ecommerce.order;

import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record OrderCreateRequest(
		List<@Valid OrderItemRequest> items,
		String shippingAddressId,
		@Valid ShippingAddressDto shippingAddress,
		@NotBlank String paymentMethod,
		String promotionCode,
		@Size(max = 500) String notes
) {
}

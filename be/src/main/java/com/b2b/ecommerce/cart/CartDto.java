package com.b2b.ecommerce.cart;

import java.util.List;

public record CartDto(
		List<CartItemDto> items,
		int itemCount,
		long subtotal,
		long estimatedShipping
) {
}

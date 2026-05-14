package com.b2b.ecommerce.order;

public record OrderCreateResponse(
		OrderDto order,
		PaymentDto payment
) {
}

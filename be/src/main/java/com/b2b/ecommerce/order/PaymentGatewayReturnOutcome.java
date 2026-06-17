package com.b2b.ecommerce.order;

public record PaymentGatewayReturnOutcome(
		PaymentGatewayResultDto result,
		String redirectUrl
) {
}

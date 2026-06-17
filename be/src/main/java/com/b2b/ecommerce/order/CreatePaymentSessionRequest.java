package com.b2b.ecommerce.order;

public record CreatePaymentSessionRequest(
		String provider,
		String returnUrl,
		String callbackUrl,
		String ipAddress,
		String locale,
		String bankCode,
		String orderType
) {
}

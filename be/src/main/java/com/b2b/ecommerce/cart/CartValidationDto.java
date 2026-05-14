package com.b2b.ecommerce.cart;

import java.util.List;

public record CartValidationDto(
		boolean valid,
		List<CartValidationIssueDto> issues
) {
}

package com.b2b.ecommerce.order;

public record OrderSummaryItemsDto(
		int count,
		OrderFirstItemDto firstItem
) {
}

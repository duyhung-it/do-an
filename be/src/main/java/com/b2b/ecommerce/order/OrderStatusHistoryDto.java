package com.b2b.ecommerce.order;

public record OrderStatusHistoryDto(
		String id,
		String fromStatus,
		String toStatus,
		String note,
		String changedBy,
		String changedByName,
		String changedAt
) {
}

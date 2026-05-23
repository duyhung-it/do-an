package com.b2b.ecommerce.order;

public record ShipmentTrackingEventDto(
		String status,
		String title,
		String description,
		String occurredAt
) {
}

package com.b2b.ecommerce.catalog;

public record PhoneSpecsDto(
		String id,
		String productId,
		String chip,
		String ram,
		String storage,
		String battery,
		String camera,
		String frontCamera,
		String screen,
		String os,
		String connectivity,
		String weight,
		String dimensions,
		String waterResistance,
		String simType,
		String chargingSpeed,
		String gpu
) {
}

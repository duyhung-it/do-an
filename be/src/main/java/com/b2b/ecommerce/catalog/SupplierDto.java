package com.b2b.ecommerce.catalog;

import java.math.BigDecimal;
import java.util.List;

public record SupplierDto(
		String id,
		String companyName,
		String contactPerson,
		String email,
		String phone,
		String address,
		String city,
		String country,
		String logoUrl,
		String coverUrl,
		String description,
		BigDecimal rating,
		int reviewCount,
		int productCount,
		BigDecimal minOrderValue,
		int avgDeliveryDays,
		BigDecimal onTimeRate,
		boolean isVerified,
		String joinedDate,
		Integer employees,
		List<String> categoryIds,
		String createdAt
) {
}

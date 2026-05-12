package com.b2b.ecommerce.catalog;

import java.math.BigDecimal;
import java.util.List;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record SupplierRequest(
		@NotBlank String companyName,
		@NotBlank String contactPerson,
		@NotBlank @Email String email,
		@NotBlank String phone,
		String address,
		String city,
		String country,
		String logoUrl,
		String coverUrl,
		String description,
		BigDecimal minOrderValue,
		Integer avgDeliveryDays,
		Integer employees,
		List<String> categoryIds
) {
}

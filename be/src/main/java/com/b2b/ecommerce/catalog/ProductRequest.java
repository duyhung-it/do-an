package com.b2b.ecommerce.catalog;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record ProductRequest(
		@NotBlank String name,
		String description,
		@NotBlank String categoryId,
		String supplierId,
		@NotNull @DecimalMin("0.0") BigDecimal price,
		BigDecimal originalPrice,
		@Min(0) Integer stock,
		String unit,
		@Min(1) Integer minOrderQty,
		List<String> images,
		Map<String, String> specifications,
		List<String> tags,
		String status,
		String brandName,
		String origin,
		Integer weight,
		String dimensions,
		Integer warrantyMonths,
		Boolean featured
) {
}

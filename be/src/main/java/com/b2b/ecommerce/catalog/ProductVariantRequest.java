package com.b2b.ecommerce.catalog;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record ProductVariantRequest(
		@NotBlank String name,
		@NotBlank String sku,
		@NotNull @DecimalMin("1.0") BigDecimal price,
		BigDecimal originalPrice,
		@Min(0) Integer stock,
		String color,
		String storage,
		String ram,
		Boolean isActive
) {
}

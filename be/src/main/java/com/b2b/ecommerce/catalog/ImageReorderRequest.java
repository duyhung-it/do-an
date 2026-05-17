package com.b2b.ecommerce.catalog;

import java.util.List;

import jakarta.validation.constraints.NotEmpty;

public record ImageReorderRequest(@NotEmpty List<String> imageIds) {
}

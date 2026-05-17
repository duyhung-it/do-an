package com.b2b.ecommerce.order;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateOrderNotesRequest(
		@NotBlank
		@Size(max = 1000)
		String notes) {
	public String normalizedNotes() {
		return notes.trim();
	}
}

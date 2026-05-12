package com.b2b.ecommerce.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record RegisterRequest(
		@NotBlank @Email String email,
		@NotBlank String password,
		@NotBlank String fullName,
		@NotBlank String role,
		String companyName
) {
}

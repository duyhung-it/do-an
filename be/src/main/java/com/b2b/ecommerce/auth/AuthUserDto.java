package com.b2b.ecommerce.auth;

public record AuthUserDto(
		String id,
		String email,
		String fullName,
		String role,
		String companyName,
		String supplierId,
		String avatar,
		String token
) {
}

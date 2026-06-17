package com.b2b.ecommerce.auth;

public record AuthUserDto(
		String id,
		String email,
		String fullName,
		String role,
		String companyName,
		String supplierId,
		String avatarUrl,
		String phone,
		String status,
		String token
) {
}

package com.b2b.ecommerce.auth;

import java.util.Collection;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Service;

@Service
public class AuthService {
	private final Map<String, AuthUserDto> usersByEmail = new ConcurrentHashMap<>();

	public AuthService() {
		save(new AuthUserDto("user-buyer-001", "buyer@example.com", "Nguyen Van A", "Buyer",
				"Cong ty TNHH ABC", null, null, "mock-token-buyer"));
		save(new AuthUserDto("user-seller-001", "seller@example.com", "Tran Thi B", "Seller",
				"Cung ung Viet", "sup-001", null, "mock-token-seller"));
		save(new AuthUserDto("user-admin-001", "admin@example.com", "Admin", "Admin",
				"B2B Platform", null, null, "mock-token-admin"));
	}

	public AuthUserDto login(LoginRequest request) {
		AuthUserDto user = usersByEmail.get(request.email().toLowerCase());
		if (user == null) {
			throw new NoSuchElementException("Khong tim thay tai khoan");
		}
		return user;
	}

	public AuthUserDto register(RegisterRequest request) {
		String email = request.email().toLowerCase();
		if (usersByEmail.containsKey(email)) {
			throw new IllegalArgumentException("Email da ton tai");
		}
		AuthUserDto user = new AuthUserDto(
				"user-" + UUID.randomUUID(),
				email,
				request.fullName(),
				request.role(),
				request.companyName(),
				null,
				null,
				"mock-token-" + UUID.randomUUID());
		save(user);
		return user;
	}

	public AuthUserDto me() {
		return usersByEmail.get("buyer@example.com");
	}

	public Collection<AuthUserDto> users() {
		return usersByEmail.values();
	}

	private void save(AuthUserDto user) {
		usersByEmail.put(user.email().toLowerCase(), user);
	}
}

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
		save(new AuthUserDto("user-001", "admin@cellphones.vn", "Nguyen Van An", "Quản trị viên",
				"CELLPHONES", null, null, "mock-token-admin"));
		save(new AuthUserDto("user-002", "khachhang@gmail.com", "Tran Thi Minh", "Khách hàng",
				null, null, null, "mock-token-customer"));
		save(new AuthUserDto("user-003", "lehoanhduc@gmail.com", "Le Hoang Duc", "Khách hàng",
				null, null, null, "mock-token-customer-2"));
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
				request.role() == null || request.role().isBlank() ? "Khách hàng" : request.role(),
				request.companyName(),
				null,
				null,
				"mock-token-" + UUID.randomUUID());
		save(user);
		return user;
	}

	public AuthUserDto me() {
		return usersByEmail.get("khachhang@gmail.com");
	}

	public Collection<AuthUserDto> users() {
		return usersByEmail.values();
	}

	private void save(AuthUserDto user) {
		usersByEmail.put(user.email().toLowerCase(), user);
	}
}

package com.b2b.ecommerce.auth;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.OffsetDateTime;
import java.util.Base64;
import java.util.Collection;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import com.b2b.ecommerce.common.AppException;
import com.b2b.ecommerce.common.ErrorCode;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {
	private static final String CUSTOMER_ROLE = "Khách hàng";
	private static final String ADMIN_ROLE = "Quản trị viên";
	private static final SecureRandom RANDOM = new SecureRandom();

	private final JdbcTemplate jdbcTemplate;

	public AuthService(JdbcTemplate jdbcTemplate) {
		this.jdbcTemplate = jdbcTemplate;
	}

	@Transactional
	public AuthUserDto login(LoginRequest request) {
		String email = normalizeEmail(request.email());
		Credential credential = findCredential(email)
				.orElseThrow(() -> new AppException(ErrorCode.AUTH_INVALID_CREDENTIALS));
		if (!matches(request.password(), credential.passwordHash())) {
			throw new AppException(ErrorCode.AUTH_INVALID_CREDENTIALS);
		}
		updateLastLogin(credential.userId(), email);
		return toAuthUser(credential);
	}

	@Transactional
	public AuthUserDto register(RegisterRequest request) {
		String email = normalizeEmail(request.email());
		String phone = blankToNull(request.phone());
		if (phone == null) {
			throw new AppException(ErrorCode.VALIDATION_ERROR, "So dien thoai la bat buoc",
					Map.of("phone", "So dien thoai la bat buoc"));
		}
		if (existsByEmail(email)) {
			throw new AppException(ErrorCode.USER_EMAIL_EXISTS);
		}
		if (existsByPhone(phone)) {
			throw new AppException(ErrorCode.USER_PHONE_EXISTS);
		}

		UUID userId = UUID.randomUUID();
		String fullName = request.fullName().trim();
		String address = joinAddress(request.address(), request.city());
		try {
			jdbcTemplate.update("""
					INSERT INTO customer_profiles (
					  id, full_name, email, phone, role, status, address,
					  email_verified, phone_verified, created_at, updated_at
					)
					VALUES (?, ?, ?, ?, 'CUSTOMER', 'ACTIVE', ?, FALSE, FALSE, NOW(), NOW())
					""",
					userId, fullName, email, phone, address);
			jdbcTemplate.update("""
					INSERT INTO auth_credentials (user_id, email, password_hash, role, created_at, updated_at)
					VALUES (?, ?, ?, 'CUSTOMER', NOW(), NOW())
					""",
					userId, email, hashPassword(request.password()));
			ensureLoyaltyProgram(userId, fullName, email);
		} catch (DataIntegrityViolationException exception) {
			throw new AppException(ErrorCode.USER_EMAIL_EXISTS);
		}

		return toAuthUser(new Credential(userId, email, hashPasswordForTokenOnly(), "CUSTOMER"));
	}

	public AuthUserDto me() {
		return findCredential("buyer.demo@cellphones.local")
				.map(this::toAuthUser)
				.orElseGet(() -> findCredential("khachhang@gmail.com")
						.map(this::toAuthUser)
						.orElse(null));
	}

	public Collection<AuthUserDto> users() {
		return jdbcTemplate.query("""
				SELECT user_id, email, password_hash, role
				FROM auth_credentials
				ORDER BY created_at DESC
				LIMIT 100
				""", (rs, rowNum) -> new Credential(
				rs.getObject("user_id", UUID.class),
				rs.getString("email"),
				rs.getString("password_hash"),
				rs.getString("role"))).stream().map(this::toAuthUser).toList();
	}

	private AuthUserDto toAuthUser(Credential credential) {
		if (isAdminRole(credential.role())) {
			return findAdminUser(credential)
					.orElseGet(() -> new AuthUserDto(
							credential.userId().toString(),
							credential.email(),
							"Nguyen Van An",
							"ADMIN",
							"CELLPHONES",
							null,
							null,
							null,
							"ACTIVE",
							issueToken(credential.userId())));
		}
		return findCustomerUser(credential)
				.orElseGet(() -> new AuthUserDto(
						credential.userId().toString(),
						credential.email(),
						credential.email(),
						"CUSTOMER",
						null,
						null,
						null,
						null,
						"ACTIVE",
						issueToken(credential.userId())));
	}

	private Optional<AuthUserDto> findCustomerUser(Credential credential) {
		List<AuthUserDto> users = jdbcTemplate.query("""
				SELECT id, email, full_name, phone, status, avatar_url
				FROM customer_profiles
				WHERE id = ? OR lower(email) = ?
				LIMIT 1
				""",
				(rs, rowNum) -> new AuthUserDto(
						rs.getObject("id", UUID.class).toString(),
						rs.getString("email"),
						rs.getString("full_name"),
						"CUSTOMER",
						null,
						null,
						rs.getString("avatar_url"),
						rs.getString("phone"),
						rs.getString("status"),
						issueToken(rs.getObject("id", UUID.class))),
				credential.userId(), credential.email());
		return users.stream().findFirst();
	}

	private Optional<AuthUserDto> findAdminUser(Credential credential) {
		List<AuthUserDto> users = jdbcTemplate.query("""
				SELECT id, email, full_name, phone, role, status, avatar_url, 'CELLPHONES' AS company_name
				FROM admin_users
				WHERE id = ? OR lower(email) = ?
				LIMIT 1
				""",
				(rs, rowNum) -> new AuthUserDto(
						rs.getObject("id", UUID.class).toString(),
						rs.getString("email"),
						rs.getString("full_name"),
						"ADMIN",
						rs.getString("company_name"),
						null,
						rs.getString("avatar_url"),
						rs.getString("phone"),
						rs.getString("status"),
						issueToken(rs.getObject("id", UUID.class))),
				credential.userId(), credential.email());
		return users.stream().findFirst();
	}

	private Optional<Credential> findCredential(String email) {
		List<Credential> credentials = jdbcTemplate.query("""
				SELECT user_id, email, password_hash, role
				FROM auth_credentials
				WHERE lower(email) = ?
				LIMIT 1
				""",
				(rs, rowNum) -> new Credential(
						rs.getObject("user_id", UUID.class),
						rs.getString("email"),
						rs.getString("password_hash"),
						rs.getString("role")),
				email);
		return credentials.stream().findFirst();
	}

	private boolean existsByEmail(String email) {
		Integer count = jdbcTemplate.queryForObject("""
				SELECT COUNT(*) FROM (
				  SELECT email FROM auth_credentials WHERE lower(email) = ?
				  UNION ALL
				  SELECT email FROM customer_profiles WHERE lower(email) = ?
				  UNION ALL
				  SELECT email FROM admin_users WHERE lower(email) = ?
				) emails
				""", Integer.class, email, email, email);
		return count != null && count > 0;
	}

	private boolean existsByPhone(String phone) {
		Integer count = jdbcTemplate.queryForObject("""
				SELECT COUNT(*) FROM customer_profiles WHERE phone = ?
				""", Integer.class, phone);
		return count != null && count > 0;
	}

	private void updateLastLogin(UUID userId, String email) {
		jdbcTemplate.update("""
				UPDATE customer_profiles
				SET last_login_at = ?, updated_at = NOW()
				WHERE id = ? OR lower(email) = ?
				""", OffsetDateTime.now(), userId, email);
	}

	private void ensureLoyaltyProgram(UUID userId, String fullName, String email) {
		jdbcTemplate.update("""
				INSERT INTO loyalty_programs (customer_id, customer_name, customer_email)
				VALUES (?, ?, ?)
				ON CONFLICT (customer_id) DO NOTHING
				""", userId, fullName, email);
	}

	private String normalizeEmail(String email) {
		if (email == null || email.isBlank()) {
			throw new AppException(ErrorCode.AUTH_INVALID_CREDENTIALS);
		}
		return email.trim().toLowerCase(Locale.ROOT);
	}

	private String joinAddress(String address, String city) {
		String mainAddress = blankToNull(address);
		String cityName = blankToNull(city);
		if (mainAddress == null) return cityName;
		if (cityName == null || mainAddress.toLowerCase(Locale.ROOT).contains(cityName.toLowerCase(Locale.ROOT))) {
			return mainAddress;
		}
		return mainAddress + ", " + cityName;
	}

	private String blankToNull(String value) {
		return value == null || value.isBlank() ? null : value.trim();
	}

	private boolean isAdminRole(String role) {
		if (role == null) return false;
		String normalized = role.trim().toUpperCase(Locale.ROOT);
		return normalized.equals("ADMIN") || normalized.equals("QUAN_TRI_VIEN") || role.equals(ADMIN_ROLE);
	}

	private String issueToken(UUID userId) {
		return "auth-token-" + userId + "-" + UUID.randomUUID();
	}

	private String hashPassword(String password) {
		byte[] salt = new byte[16];
		RANDOM.nextBytes(salt);
		String saltText = Base64.getEncoder().encodeToString(salt);
		return "sha256:" + saltText + ":" + sha256(saltText + ":" + password);
	}

	private String hashPasswordForTokenOnly() {
		return "";
	}

	private boolean matches(String rawPassword, String storedHash) {
		if (rawPassword == null || storedHash == null || storedHash.isBlank()) return false;
		if (storedHash.startsWith("plain:")) {
			return MessageDigest.isEqual(
					rawPassword.getBytes(StandardCharsets.UTF_8),
					storedHash.substring("plain:".length()).getBytes(StandardCharsets.UTF_8));
		}
		if (!storedHash.startsWith("sha256:")) return false;
		String[] parts = storedHash.split(":", 3);
		if (parts.length != 3) return false;
		String expected = sha256(parts[1] + ":" + rawPassword);
		return MessageDigest.isEqual(
				expected.getBytes(StandardCharsets.UTF_8),
				parts[2].getBytes(StandardCharsets.UTF_8));
	}

	private String sha256(String text) {
		try {
			MessageDigest digest = MessageDigest.getInstance("SHA-256");
			byte[] hash = digest.digest(text.getBytes(StandardCharsets.UTF_8));
			return Base64.getEncoder().encodeToString(hash);
		} catch (NoSuchAlgorithmException exception) {
			throw new IllegalStateException("SHA-256 unavailable", exception);
		}
	}

	private record Credential(UUID userId, String email, String passwordHash, String role) {
	}
}

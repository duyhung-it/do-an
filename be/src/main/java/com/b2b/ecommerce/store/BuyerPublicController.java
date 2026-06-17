package com.b2b.ecommerce.store;

import java.time.Instant;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

import com.b2b.ecommerce.common.ApiResponse;
import com.b2b.ecommerce.common.PageRequestParams;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1")
public class BuyerPublicController {
	private static final String DEFAULT_USER_ID = "00000000-0000-4000-8000-000000000199";

	private final StoreDataService store;
	private final JdbcTemplate jdbc;
	private final Set<String> helpfulVotes = ConcurrentHashMap.newKeySet();

	public BuyerPublicController(StoreDataService store, JdbcTemplate jdbc) {
		this.store = store;
		this.jdbc = jdbc;
	}

	@GetMapping("/users/me/wishlist")
	public ApiResponse<List<Map<String, Object>>> wishlist(
			@RequestHeader(value = "X-User-Id", required = false) String userId) {
		return ApiResponse.ok(wishlistRows(userId(userId)));
	}

	@PostMapping("/users/me/wishlist")
	public ResponseEntity<ApiResponse<Map<String, Object>>> addWishlist(
			@RequestHeader(value = "X-User-Id", required = false) String userId,
			@RequestBody Map<String, Object> body) {
		String ownerId = userId(userId);
		UUID productId = UUID.fromString(text(body.get("productId")));
		Map<String, Object> existing = wishlistRowByProduct(ownerId, productId.toString(), false);
		if (existing != null) {
			return ResponseEntity.ok(ApiResponse.ok(existing));
		}
		long addedPrice = productPrice(productId);
		jdbc.update("""
				INSERT INTO customer_wishlist (id, user_id, product_id, added_price, price_alert)
				VALUES (?, ?, ?, ?, ?)
				""", UUID.randomUUID(), UUID.fromString(ownerId), productId, addedPrice,
				longOrNull(body.get("priceAlert")));
		return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(wishlistRowByProduct(ownerId, productId.toString(), true)));
	}

	@DeleteMapping("/users/me/wishlist/{productId}")
	public ResponseEntity<Void> removeWishlistProduct(
			@RequestHeader(value = "X-User-Id", required = false) String userId,
			@PathVariable String productId) {
		String ownerId = userId(userId);
		wishlistRowByProduct(ownerId, productId, true);
		jdbc.update("DELETE FROM customer_wishlist WHERE user_id = ? AND product_id = ?",
				UUID.fromString(ownerId), UUID.fromString(productId));
		return ResponseEntity.noContent().build();
	}

	@DeleteMapping("/users/me/wishlist/items/{id}")
	public ResponseEntity<Void> removeWishlistItem(
			@RequestHeader(value = "X-User-Id", required = false) String userId,
			@PathVariable String id) {
		String ownerId = userId(userId);
		wishlistRow(ownerId, id);
		jdbc.update("DELETE FROM customer_wishlist WHERE user_id = ? AND id = ?", UUID.fromString(ownerId), UUID.fromString(id));
		return ResponseEntity.noContent().build();
	}

	@DeleteMapping("/users/me/wishlist")
	public ResponseEntity<Void> clearWishlist(@RequestHeader(value = "X-User-Id", required = false) String userId) {
		jdbc.update("DELETE FROM customer_wishlist WHERE user_id = ?", UUID.fromString(userId(userId)));
		return ResponseEntity.noContent().build();
	}

	@PatchMapping("/users/me/wishlist/{productId}/price-alert")
	public ApiResponse<Map<String, Object>> updatePriceAlert(
			@RequestHeader(value = "X-User-Id", required = false) String userId,
			@PathVariable String productId,
			@RequestBody Map<String, Object> body) {
		String ownerId = userId(userId);
		wishlistRowByProduct(ownerId, productId, true);
		Long priceAlert = longOrNull(body.get("priceAlert"));
		if (priceAlert == null || priceAlert <= 0) {
			throw new IllegalArgumentException("priceAlert phai lon hon 0");
		}
		jdbc.update("""
				UPDATE customer_wishlist
				SET price_alert = ?, updated_at = NOW()
				WHERE user_id = ? AND product_id = ?
				""", priceAlert, UUID.fromString(ownerId), UUID.fromString(productId));
		return ApiResponse.ok(wishlistRowByProduct(ownerId, productId, true));
	}

	@GetMapping("/users/me")
	public ApiResponse<Map<String, Object>> profile(
			@RequestHeader(value = "X-User-Id", required = false) String userId) {
		return ApiResponse.ok(profileRow(userId(userId)));
	}

	@PatchMapping("/users/me")
	public ApiResponse<Map<String, Object>> updateProfile(
			@RequestHeader(value = "X-User-Id", required = false) String userId,
			@RequestBody Map<String, Object> body) {
		String ownerId = userId(userId);
		Map<String, Object> current = profileRow(ownerId);
		jdbc.update("""
				UPDATE customer_profiles
				SET full_name = ?, email = ?, phone = ?, avatar_url = ?, address = ?,
				    date_of_birth = NULLIF(?, '')::date, gender = NULLIF(?, ''), updated_at = NOW()
				WHERE id = ?
				""", defaultText(body.get("fullName"), text(current.get("fullName"))),
				defaultText(body.get("email"), text(current.get("email"))),
				defaultText(body.get("phone"), text(current.get("phone"))),
				body.containsKey("avatarUrl") ? blankToNull(body.get("avatarUrl")) : current.get("avatarUrl"),
				body.containsKey("address") ? blankToNull(body.get("address")) : current.get("address"),
				body.containsKey("dateOfBirth") ? text(body.get("dateOfBirth")) : text(current.get("dateOfBirth")),
				body.containsKey("gender") ? text(body.get("gender")) : text(current.get("gender")),
				UUID.fromString(ownerId));
		return ApiResponse.ok(profileRow(ownerId));
	}

	@PostMapping("/users/me/avatar")
	public ApiResponse<Map<String, Object>> updateAvatar(
			@RequestHeader(value = "X-User-Id", required = false) String userId,
			@RequestBody Map<String, Object> body) {
		String ownerId = userId(userId);
		profileRow(ownerId);
		jdbc.update("UPDATE customer_profiles SET avatar_url = ?, updated_at = NOW() WHERE id = ?",
				blankToNull(body.get("avatarUrl")), UUID.fromString(ownerId));
		return ApiResponse.ok(profileRow(ownerId));
	}

	@GetMapping("/users/me/stats")
	public ApiResponse<Map<String, Object>> profileStats(
			@RequestHeader(value = "X-User-Id", required = false) String userId) {
		String ownerId = userId(userId);
		profileRow(ownerId);
		Long totalOrders = jdbc.queryForObject("SELECT COUNT(*) FROM orders WHERE customer_id = ?", Long.class,
				UUID.fromString(ownerId));
		Long totalSpent = jdbc.queryForObject("""
				SELECT COALESCE(SUM(total_amount), 0)
				FROM orders
				WHERE customer_id = ? AND status IN ('DELIVERED', 'RETURNED')
				""", Long.class, UUID.fromString(ownerId));
		Integer loyaltyPoints = jdbc.queryForObject("""
				SELECT COALESCE(MAX(points), 0)
				FROM loyalty_programs
				WHERE customer_id = ?
				""", Integer.class, UUID.fromString(ownerId));
		return ApiResponse.ok(map("totalOrders", totalOrders == null ? 0 : totalOrders,
				"totalSpent", totalSpent == null ? 0 : totalSpent,
				"loyaltyPoints", loyaltyPoints == null ? 0 : loyaltyPoints));
	}

	@GetMapping("/users/me/addresses")
	public ApiResponse<List<Map<String, Object>>> addresses(
			@RequestHeader(value = "X-User-Id", required = false) String userId) {
		return ApiResponse.ok(addressRows(userId(userId)));
	}

	@PostMapping("/users/me/addresses")
	public ResponseEntity<ApiResponse<Map<String, Object>>> createAddress(
			@RequestHeader(value = "X-User-Id", required = false) String userId,
			@RequestBody Map<String, Object> body) {
		String ownerId = userId(userId);
		UUID id = UUID.randomUUID();
		boolean isDefault = booleanValue(body.get("isDefault")) || addressRows(ownerId).isEmpty();
		if (isDefault) {
			unsetDefault(ownerId);
		}
		jdbc.update("""
				INSERT INTO customer_addresses (
				  id, user_id, label, full_name, phone, address, ward, district, city,
				  country, postal_code, type, is_default, notes
				)
				VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
				""", id, UUID.fromString(ownerId), defaultText(body.get("label"), "Dia chi"),
				defaultText(firstPresent(body, "fullName", "recipientName"), "Khach hang"),
				defaultText(body.get("phone"), ""), defaultText(firstPresent(body, "address", "addressLine"), ""),
				defaultText(body.get("ward"), ""), defaultText(body.get("district"), ""),
				defaultText(firstPresent(body, "city", "province"), ""), defaultText(body.get("country"), "Viet Nam"),
				blankToNull(body.get("postalCode")), blankToNull(body.get("type")), isDefault, blankToNull(body.get("notes")));
		return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(addressRow(ownerId, id.toString())));
	}

	@PatchMapping("/users/me/addresses/{id}")
	public ApiResponse<Map<String, Object>> updateAddress(
			@RequestHeader(value = "X-User-Id", required = false) String userId,
			@PathVariable String id,
			@RequestBody Map<String, Object> body) {
		String ownerId = userId(userId);
		addressRow(ownerId, id);
		boolean isDefault = booleanValue(body.get("isDefault"));
		if (isDefault) {
			unsetDefaultExcept(ownerId, id);
		}
		jdbc.update("""
				UPDATE customer_addresses
				SET label = ?, full_name = ?, phone = ?, address = ?, ward = ?, district = ?, city = ?,
				    country = ?, postal_code = ?, type = ?, is_default = ?, notes = ?, updated_at = NOW()
				WHERE id = ? AND user_id = ?
				""", defaultText(body.get("label"), "Dia chi"),
				defaultText(firstPresent(body, "fullName", "recipientName"), "Khach hang"),
				defaultText(body.get("phone"), ""), defaultText(firstPresent(body, "address", "addressLine"), ""),
				defaultText(body.get("ward"), ""), defaultText(body.get("district"), ""),
				defaultText(firstPresent(body, "city", "province"), ""), defaultText(body.get("country"), "Viet Nam"),
				blankToNull(body.get("postalCode")), blankToNull(body.get("type")), isDefault, blankToNull(body.get("notes")),
				UUID.fromString(id), UUID.fromString(ownerId));
		return ApiResponse.ok(addressRow(ownerId, id));
	}

	@DeleteMapping("/users/me/addresses/{id}")
	public ResponseEntity<Void> deleteAddress(
			@RequestHeader(value = "X-User-Id", required = false) String userId,
			@PathVariable String id) {
		String ownerId = userId(userId);
		addressRow(ownerId, id);
		jdbc.update("DELETE FROM customer_addresses WHERE id = ? AND user_id = ?", UUID.fromString(id), UUID.fromString(ownerId));
		return ResponseEntity.noContent().build();
	}

	@PatchMapping("/users/me/addresses/{id}/set-default")
	public ApiResponse<Map<String, Object>> setDefaultAddress(
			@RequestHeader(value = "X-User-Id", required = false) String userId,
			@PathVariable String id) {
		String ownerId = userId(userId);
		addressRow(ownerId, id);
		unsetDefault(ownerId);
		jdbc.update("UPDATE customer_addresses SET is_default = TRUE, updated_at = NOW() WHERE id = ? AND user_id = ?",
				UUID.fromString(id), UUID.fromString(ownerId));
		return ApiResponse.ok(addressRow(ownerId, id));
	}

	@GetMapping("/users/me/reviews")
	public ApiResponse<List<Map<String, Object>>> myReviews(
			@RequestHeader(value = "X-User-Id", required = false) String userId,
			@RequestParam(defaultValue = "1") int page,
			@RequestParam(defaultValue = "100") int pageSize) {
		PageRequestParams params = params(page, pageSize, null, "createdAt", "desc");
		List<Map<String, Object>> rows = reviewRows(null, null, userId(userId), null, false, false);
		return ApiResponse.page(page(rows, params), rows.size(), params.normalizedPage(), params.normalizedPageSize());
	}

	@GetMapping("/reviews")
	public ApiResponse<List<Map<String, Object>>> reviews(
			@RequestParam(defaultValue = "1") int page,
			@RequestParam(defaultValue = "100") int pageSize,
			@RequestParam(required = false) String orderId,
			@RequestParam(required = false) String productId,
			@RequestParam(required = false) String userId) {
		PageRequestParams params = params(page, pageSize, null, "createdAt", "desc");
		List<Map<String, Object>> rows = reviewRows(productId, orderId, userId, null, false, false);
		return ApiResponse.page(page(rows, params), rows.size(), params.normalizedPage(), params.normalizedPageSize());
	}

	@GetMapping("/products/{productId}/reviews")
	public ApiResponse<List<Map<String, Object>>> productReviews(
			@PathVariable String productId,
			@RequestParam(defaultValue = "1") int page,
			@RequestParam(defaultValue = "20") int pageSize,
			@RequestParam(required = false) Integer rating,
			@RequestParam(defaultValue = "false") boolean verifiedOnly,
			@RequestParam(defaultValue = "false") boolean hasImages) {
		PageRequestParams params = params(page, pageSize, null, "createdAt", "desc");
		List<Map<String, Object>> rows = reviewRows(productId, null, null, rating, verifiedOnly, hasImages);
		return ApiResponse.page(page(rows, params), rows.size(), params.normalizedPage(), params.normalizedPageSize());
	}

	@GetMapping("/products/{productId}/reviews/stats")
	public ApiResponse<Map<String, Object>> productReviewStats(@PathVariable String productId) {
		List<Map<String, Object>> rows = reviewRows(productId, null, null, null, false, false);
		double average = rows.stream().mapToInt(row -> number(row.get("rating")).intValue()).average().orElse(0);
		List<Map<String, Object>> distribution = List.of(5, 4, 3, 2, 1).stream()
				.map(star -> map("star", star, "count", rows.stream()
						.filter(row -> number(row.get("rating")).intValue() == star).count()))
				.toList();
		return ApiResponse.ok(map("averageRating", average, "reviewCount", rows.size(), "distribution", distribution));
	}

	@PostMapping("/products/{productId}/reviews")
	public ResponseEntity<ApiResponse<Map<String, Object>>> createProductReview(
			@RequestHeader(value = "X-User-Id", required = false) String userId,
			@PathVariable String productId,
			@RequestBody Map<String, Object> body) {
		String ownerId = userId(userId);
		UUID id = UUID.randomUUID();
		jdbc.update("""
				INSERT INTO product_reviews (
				  id, product_id, customer_id, customer_name, rating, title, content, status, is_verified_purchase
				)
				VALUES (?, ?, ?, ?, ?, ?, ?, 'PENDING', FALSE)
				""", id, UUID.fromString(productId), UUID.fromString(ownerId),
				defaultText(body.get("userName"), "Khach hang"), number(body.get("rating")).intValue(),
				defaultText(body.get("title"), ""), defaultText(body.get("content"), ""));
		return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(reviewRow(id.toString())));
	}

	@PatchMapping("/reviews/{id}")
	public ApiResponse<Map<String, Object>> updateReview(@PathVariable String id, @RequestBody Map<String, Object> body) {
		Map<String, Object> current = reviewRow(id);
		jdbc.update("""
				UPDATE product_reviews
				SET rating = ?, title = ?, content = ?, status = 'PENDING', updated_at = NOW()
				WHERE id = ?
				""", body.containsKey("rating") ? number(body.get("rating")).intValue() : number(current.get("rating")).intValue(),
				defaultText(body.get("title"), text(current.get("title"))),
				defaultText(body.get("content"), text(current.get("content"))), UUID.fromString(id));
		return ApiResponse.ok(reviewRow(id));
	}

	@DeleteMapping("/reviews/{id}")
	public ResponseEntity<Void> deleteReview(@PathVariable String id) {
		reviewRow(id);
		jdbc.update("DELETE FROM product_reviews WHERE id = ?", UUID.fromString(id));
		return ResponseEntity.noContent().build();
	}

	@PatchMapping("/reviews/{id}/helpful")
	public ApiResponse<Map<String, Object>> markReviewHelpful(
			@RequestHeader(value = "X-User-Id", required = false) String userId,
			@PathVariable String id) {
		String voteKey = userId(userId) + ":" + id;
		reviewRow(id);
		if (helpfulVotes.add(voteKey)) {
			int inserted = jdbc.update("""
					INSERT INTO product_review_helpful_votes (review_id, user_id)
					VALUES (?, ?)
					ON CONFLICT (review_id, user_id) DO NOTHING
					""", UUID.fromString(id), UUID.fromString(userId(userId)));
			if (inserted > 0) {
				jdbc.update("UPDATE product_reviews SET helpful_count = helpful_count + 1, updated_at = NOW() WHERE id = ?",
						UUID.fromString(id));
			}
		}
		Map<String, Object> current = new LinkedHashMap<>(reviewRow(id));
		current.put("helpful", true);
		return ApiResponse.ok(current);
	}

	@GetMapping("/blog")
	public ApiResponse<List<Map<String, Object>>> blogs(
			@RequestParam(defaultValue = "1") int page,
			@RequestParam(defaultValue = "20") int pageSize,
			@RequestParam(required = false) String search,
			@RequestParam(required = false) String category,
			@RequestParam(required = false) Boolean isPublished) {
		PageRequestParams params = params(page, pageSize, search, "publishedAt", "desc");
		Map<String, Object> filters = nullableMap("category", category, "isPublished", isPublished);
		return ApiResponse.page(store.blogs(params, filters), store.blogCount(search, filters),
				params.normalizedPage(), params.normalizedPageSize());
	}

	@GetMapping("/blog/{slug}")
	public ApiResponse<Map<String, Object>> blogBySlug(@PathVariable String slug) {
		return ApiResponse.ok(store.blogBySlug(slug));
	}

	@GetMapping("/blog/categories")
	public ApiResponse<List<String>> blogCategories() {
		List<String> categories = store.blogs(params(1, 100, null, "publishedAt", "desc"), Map.of()).stream()
				.map(row -> text(row.get("category")))
				.distinct()
				.toList();
		return ApiResponse.ok(categories);
	}

	@GetMapping("/stores")
	public ApiResponse<List<Map<String, Object>>> stores(@RequestParam(required = false) String city) {
		return ApiResponse.ok(storeRows(city));
	}

	@GetMapping("/stores/{id}")
	public ApiResponse<Map<String, Object>> storeById(@PathVariable String id) {
		return ApiResponse.ok(storeRow(id));
	}

	@GetMapping("/stores/{id}/availability")
	public ApiResponse<Map<String, Object>> storeAvailability(@PathVariable String id, @RequestParam String productId) {
		storeRow(id);
		productPrice(UUID.fromString(productId));
		Integer stock = jdbc.queryForObject("""
				SELECT COALESCE(MAX(stock), 0)
				FROM branch_product_inventory
				WHERE branch_id = ? AND product_id = ?
				""", Integer.class, UUID.fromString(id), UUID.fromString(productId));
		return ApiResponse.ok(map("storeId", id, "productId", productId, "stock", stock, "availableQuantity", stock));
	}

	@PostMapping("/imei/check")
	public ApiResponse<Map<String, Object>> checkImei(@RequestBody Map<String, Object> body) {
		String imei = text(body.get("imei"));
		try {
			return ApiResponse.ok(jdbc.queryForObject("""
					SELECT serial_number AS imei, brand, product_name AS model,
					       status::text AS warranty_status, warranty_expiry
					FROM warranty_items
					WHERE serial_number = ?
					LIMIT 1
					""", (rs, rowNum) -> map(
							"imei", rs.getString("imei"),
							"brand", rs.getString("brand"),
							"model", rs.getString("model"),
							"isLocked", false,
							"warrantyStatus", "ACTIVE".equals(rs.getString("warranty_status")) ? "Còn bảo hành" : "Hết bảo hành",
							"warrantyExpiry", String.valueOf(rs.getObject("warranty_expiry")),
							"purchaseCountry", "Việt Nam",
							"isBlacklisted", false,
							"activationStatus", "Đã kích hoạt",
							"checkedAt", Instant.now().toString()), imei));
		}
		catch (EmptyResultDataAccessException exception) {
			throw new NoSuchElementException("Không tìm thấy thông tin với số IMEI này. Vui lòng kiểm tra lại hoặc liên hệ hỗ trợ");
		}
	}

	private List<Map<String, Object>> addressRows(String userId) {
		return jdbc.query("""
				SELECT id::text AS id, user_id::text AS "userId", label, full_name AS "fullName",
				       full_name AS "recipientName", phone, address, address AS "addressLine",
				       ward, district, city, city AS province, country, postal_code AS "postalCode",
				       type, is_default AS "isDefault", notes,
				       created_at AS "createdAt", updated_at AS "updatedAt"
				FROM customer_addresses
				WHERE user_id = ?
				ORDER BY is_default DESC, created_at DESC
				""", (rs, rowNum) -> map(
				"id", rs.getString("id"),
				"userId", rs.getString("userId"),
				"label", rs.getString("label"),
				"fullName", rs.getString("fullName"),
				"recipientName", rs.getString("recipientName"),
				"phone", rs.getString("phone"),
				"address", rs.getString("address"),
				"addressLine", rs.getString("addressLine"),
				"ward", rs.getString("ward"),
				"district", rs.getString("district"),
				"city", rs.getString("city"),
				"province", rs.getString("province"),
				"country", rs.getString("country"),
				"postalCode", rs.getString("postalCode"),
				"type", rs.getString("type"),
				"isDefault", rs.getBoolean("isDefault"),
				"notes", rs.getString("notes"),
				"createdAt", rs.getObject("createdAt").toString(),
				"updatedAt", rs.getObject("updatedAt").toString()), UUID.fromString(userId));
	}

	private Map<String, Object> profileRow(String userId) {
		try {
			return jdbc.queryForObject("""
					SELECT cp.id::text AS id, cp.full_name AS "fullName", cp.email, cp.phone,
					       cp.role, cp.status, cp.avatar_url AS "avatarUrl", cp.address,
					       cp.date_of_birth AS "dateOfBirth", cp.gender,
					       cp.email_verified AS "emailVerified", cp.phone_verified AS "phoneVerified",
					       COALESCE(lp.points, 0) AS "loyaltyPoints",
					       (SELECT COUNT(*) FROM orders o WHERE o.customer_id = cp.id)::int AS "totalOrders",
					       (SELECT COALESCE(SUM(o.total_amount), 0) FROM orders o
					        WHERE o.customer_id = cp.id AND o.status IN ('DELIVERED', 'RETURNED')) AS "totalSpent",
					       cp.last_login_at AS "lastLoginAt", cp.created_at AS "createdAt", cp.updated_at AS "updatedAt"
					FROM customer_profiles cp
					LEFT JOIN loyalty_programs lp ON lp.customer_id = cp.id
					WHERE cp.id = ?
					""", (rs, rowNum) -> map(
					"id", rs.getString("id"),
					"fullName", rs.getString("fullName"),
					"email", rs.getString("email"),
					"phone", rs.getString("phone"),
					"role", rs.getString("role"),
					"status", rs.getString("status"),
					"avatarUrl", rs.getString("avatarUrl"),
					"address", rs.getString("address"),
					"dateOfBirth", rs.getObject("dateOfBirth") == null ? null : rs.getObject("dateOfBirth").toString(),
					"gender", rs.getString("gender"),
					"emailVerified", rs.getBoolean("emailVerified"),
					"phoneVerified", rs.getBoolean("phoneVerified"),
					"loyaltyPoints", rs.getInt("loyaltyPoints"),
					"totalOrders", rs.getInt("totalOrders"),
					"totalSpent", rs.getLong("totalSpent"),
					"lastLoginAt", rs.getObject("lastLoginAt") == null ? null : rs.getObject("lastLoginAt").toString(),
					"createdAt", rs.getObject("createdAt").toString(),
					"updatedAt", rs.getObject("updatedAt").toString()), UUID.fromString(userId));
		}
		catch (EmptyResultDataAccessException exception) {
			throw new NoSuchElementException("Khong tim thay thong tin nguoi dung");
		}
	}

	private List<Map<String, Object>> wishlistRows(String userId) {
		return jdbc.query("""
				SELECT cw.id::text AS id, cw.user_id::text AS "userId", p.id::text AS "productId",
				       p.name AS "productName", p.brand, p.category_name AS "categoryName",
				       COALESCE((SELECT pi.url FROM product_images pi WHERE pi.product_id = p.id
				                 ORDER BY pi.is_primary DESC, pi.sort_order ASC LIMIT 1), '') AS "productImage",
				       p.price, p.original_price AS "originalPrice", cw.added_price AS "addedPrice",
				       cw.price_alert AS "priceAlert",
				       COALESCE((SELECT SUM(pv.stock) FROM product_variants pv WHERE pv.product_id = p.id AND pv.is_active = TRUE), 0) AS stock,
				       cw.created_at AS "addedAt", cw.updated_at AS "updatedAt"
				FROM customer_wishlist cw
				JOIN products p ON p.id = cw.product_id
				WHERE cw.user_id = ?
				ORDER BY cw.created_at DESC
				""", (rs, rowNum) -> map(
				"id", rs.getString("id"),
				"userId", rs.getString("userId"),
				"productId", rs.getString("productId"),
				"productName", rs.getString("productName"),
				"productImage", rs.getString("productImage"),
				"brand", rs.getString("brand"),
				"categoryName", rs.getString("categoryName"),
				"price", rs.getLong("price"),
				"originalPrice", rs.getLong("originalPrice"),
				"addedPrice", rs.getLong("addedPrice"),
				"priceAlert", rs.getObject("priceAlert") == null ? null : rs.getLong("priceAlert"),
				"stock", rs.getInt("stock"),
				"addedAt", rs.getObject("addedAt").toString(),
				"updatedAt", rs.getObject("updatedAt").toString()), UUID.fromString(userId));
	}

	private Map<String, Object> wishlistRow(String userId, String id) {
		try {
			return jdbc.queryForObject("""
					SELECT cw.product_id::text AS product_id
					FROM customer_wishlist cw
					WHERE cw.user_id = ? AND cw.id = ?
					""", (rs, rowNum) -> wishlistRowByProduct(userId, rs.getString("product_id"), true),
					UUID.fromString(userId), UUID.fromString(id));
		}
		catch (EmptyResultDataAccessException exception) {
			throw new NoSuchElementException("Khong tim thay wishlist item");
		}
	}

	private Map<String, Object> wishlistRowByProduct(String userId, String productId, boolean required) {
		List<Map<String, Object>> rows = jdbc.query("""
				SELECT cw.id::text AS id, cw.user_id::text AS "userId", p.id::text AS "productId",
				       p.name AS "productName", p.brand, p.category_name AS "categoryName",
				       COALESCE((SELECT pi.url FROM product_images pi WHERE pi.product_id = p.id
				                 ORDER BY pi.is_primary DESC, pi.sort_order ASC LIMIT 1), '') AS "productImage",
				       p.price, p.original_price AS "originalPrice", cw.added_price AS "addedPrice",
				       cw.price_alert AS "priceAlert",
				       COALESCE((SELECT SUM(pv.stock) FROM product_variants pv WHERE pv.product_id = p.id AND pv.is_active = TRUE), 0) AS stock,
				       cw.created_at AS "addedAt", cw.updated_at AS "updatedAt"
				FROM customer_wishlist cw
				JOIN products p ON p.id = cw.product_id
				WHERE cw.user_id = ? AND cw.product_id = ?
				""", (rs, rowNum) -> map(
				"id", rs.getString("id"),
				"userId", rs.getString("userId"),
				"productId", rs.getString("productId"),
				"productName", rs.getString("productName"),
				"productImage", rs.getString("productImage"),
				"brand", rs.getString("brand"),
				"categoryName", rs.getString("categoryName"),
				"price", rs.getLong("price"),
				"originalPrice", rs.getLong("originalPrice"),
				"addedPrice", rs.getLong("addedPrice"),
				"priceAlert", rs.getObject("priceAlert") == null ? null : rs.getLong("priceAlert"),
				"stock", rs.getInt("stock"),
				"addedAt", rs.getObject("addedAt").toString(),
				"updatedAt", rs.getObject("updatedAt").toString()), UUID.fromString(userId), UUID.fromString(productId));
		if (rows.isEmpty() && required) {
			throw new NoSuchElementException("Khong tim thay wishlist item");
		}
		return rows.isEmpty() ? null : rows.getFirst();
	}

	private long productPrice(UUID productId) {
		try {
			return jdbc.queryForObject("SELECT price FROM products WHERE id = ? AND status = 'ACTIVE'", Long.class, productId);
		}
		catch (EmptyResultDataAccessException exception) {
			throw new NoSuchElementException("Khong tim thay san pham");
		}
	}

	private List<Map<String, Object>> reviewRows(String productId, String orderId, String userId, Integer rating,
			boolean verifiedOnly, boolean hasImages) {
		List<Object> args = new ArrayList<>();
		StringBuilder where = new StringBuilder("WHERE 1 = 1");
		if (productId != null && !productId.isBlank()) {
			where.append(" AND pr.product_id = ?");
			args.add(UUID.fromString(productId));
		}
		if (orderId != null && !orderId.isBlank()) {
			where.append(" AND pr.order_id = ?");
			args.add(UUID.fromString(orderId));
		}
		if (userId != null && !userId.isBlank()) {
			where.append(" AND pr.customer_id = ?");
			args.add(UUID.fromString(userId));
		}
		if (productId != null && !productId.isBlank() && (userId == null || userId.isBlank())) {
			where.append(" AND pr.status = 'APPROVED'");
		}
		if (rating != null) {
			where.append(" AND pr.rating = ?");
			args.add(rating);
		}
		if (verifiedOnly) {
			where.append(" AND pr.is_verified_purchase = TRUE");
		}
		if (hasImages) {
			return List.of();
		}
		return jdbc.query("""
				SELECT pr.id::text AS id, pr.product_id::text AS "productId", p.name AS "productName",
				       pr.order_id::text AS "orderId", pr.customer_id::text AS "userId",
				       pr.customer_name AS "userName", pr.rating, pr.title, pr.content,
				       pr.status::text AS status, pr.helpful_count AS "helpfulCount",
				       pr.is_verified_purchase AS "isVerifiedPurchase",
				       pr.created_at AS "createdAt", pr.updated_at AS "updatedAt"
				FROM product_reviews pr
				LEFT JOIN products p ON p.id = pr.product_id
				""" + where + " ORDER BY pr.created_at DESC", this::reviewMap, args.toArray());
	}

	private Map<String, Object> reviewRow(String id) {
		try {
			return jdbc.queryForObject("""
					SELECT pr.id::text AS id, pr.product_id::text AS "productId", p.name AS "productName",
					       pr.order_id::text AS "orderId", pr.customer_id::text AS "userId",
					       pr.customer_name AS "userName", pr.rating, pr.title, pr.content,
					       pr.status::text AS status, pr.helpful_count AS "helpfulCount",
					       pr.is_verified_purchase AS "isVerifiedPurchase",
					       pr.created_at AS "createdAt", pr.updated_at AS "updatedAt"
					FROM product_reviews pr
					LEFT JOIN products p ON p.id = pr.product_id
					WHERE pr.id = ?
					""", this::reviewMap, UUID.fromString(id));
		}
		catch (EmptyResultDataAccessException exception) {
			throw new NoSuchElementException("Khong tim thay danh gia");
		}
	}

	private Map<String, Object> reviewMap(java.sql.ResultSet rs, int rowNum) throws java.sql.SQLException {
		return map(
				"id", rs.getString("id"),
				"productId", rs.getString("productId"),
				"productName", rs.getString("productName"),
				"orderId", rs.getString("orderId"),
				"userId", rs.getString("userId"),
				"userName", rs.getString("userName"),
				"rating", rs.getInt("rating"),
				"title", rs.getString("title"),
				"content", rs.getString("content"),
				"status", rs.getString("status"),
				"helpfulCount", rs.getInt("helpfulCount"),
				"isVerifiedPurchase", rs.getBoolean("isVerifiedPurchase"),
				"images", List.of(),
				"tags", List.of(),
				"createdAt", rs.getObject("createdAt").toString(),
				"updatedAt", rs.getObject("updatedAt").toString());
	}

	private List<Map<String, Object>> storeRows(String city) {
		List<Object> args = new ArrayList<>();
		StringBuilder where = new StringBuilder("WHERE is_active = TRUE");
		if (city != null && !city.isBlank()) {
			where.append(" AND LOWER(city) LIKE ?");
			args.add("%" + city.trim().toLowerCase() + "%");
		}
		return jdbc.query("""
				SELECT id::text AS id, name, address, city, district, phone, is_active AS "isActive",
				       working_hours AS "openingHours", lat AS latitude, lng AS longitude,
				       created_at AS "createdAt", updated_at AS "updatedAt"
				FROM branches
				""" + where + " ORDER BY city ASC, district ASC, name ASC", this::storeMap, args.toArray());
	}

	private Map<String, Object> storeRow(String id) {
		try {
			return jdbc.queryForObject("""
					SELECT id::text AS id, name, address, city, district, phone, is_active AS "isActive",
					       working_hours AS "openingHours", lat AS latitude, lng AS longitude,
					       created_at AS "createdAt", updated_at AS "updatedAt"
					FROM branches
					WHERE id = ? AND is_active = TRUE
					""", this::storeMap, UUID.fromString(id));
		}
		catch (IllegalArgumentException | EmptyResultDataAccessException exception) {
			throw new NoSuchElementException("Khong tim thay cua hang");
		}
	}

	private Map<String, Object> storeMap(java.sql.ResultSet rs, int rowNum) throws java.sql.SQLException {
		return map(
				"id", rs.getString("id"),
				"name", rs.getString("name"),
				"address", rs.getString("address"),
				"city", rs.getString("city"),
				"district", rs.getString("district"),
				"ward", null,
				"phone", rs.getString("phone"),
				"email", null,
				"latitude", rs.getObject("latitude") == null ? null : rs.getBigDecimal("latitude"),
				"longitude", rs.getObject("longitude") == null ? null : rs.getBigDecimal("longitude"),
				"openingHours", rs.getString("openingHours"),
				"workingHours", rs.getString("openingHours"),
				"isActive", rs.getBoolean("isActive"),
				"imageUrl", null,
				"createdAt", rs.getObject("createdAt").toString(),
				"updatedAt", rs.getObject("updatedAt").toString());
	}

	private Map<String, Object> addressRow(String userId, String id) {
		try {
			return jdbc.queryForObject("""
					SELECT id::text AS id, user_id::text AS "userId", label, full_name AS "fullName",
					       full_name AS "recipientName", phone, address, address AS "addressLine",
					       ward, district, city, city AS province, country, postal_code AS "postalCode",
					       type, is_default AS "isDefault", notes,
					       created_at AS "createdAt", updated_at AS "updatedAt"
					FROM customer_addresses
					WHERE id = ? AND user_id = ?
					""", (rs, rowNum) -> map(
					"id", rs.getString("id"),
					"userId", rs.getString("userId"),
					"label", rs.getString("label"),
					"fullName", rs.getString("fullName"),
					"recipientName", rs.getString("recipientName"),
					"phone", rs.getString("phone"),
					"address", rs.getString("address"),
					"addressLine", rs.getString("addressLine"),
					"ward", rs.getString("ward"),
					"district", rs.getString("district"),
					"city", rs.getString("city"),
					"province", rs.getString("province"),
					"country", rs.getString("country"),
					"postalCode", rs.getString("postalCode"),
					"type", rs.getString("type"),
					"isDefault", rs.getBoolean("isDefault"),
					"notes", rs.getString("notes"),
					"createdAt", rs.getObject("createdAt").toString(),
					"updatedAt", rs.getObject("updatedAt").toString()), UUID.fromString(id), UUID.fromString(userId));
		}
		catch (EmptyResultDataAccessException exception) {
			throw new NoSuchElementException("Khong tim thay dia chi");
		}
	}

	private void unsetDefault(String userId) {
		jdbc.update("UPDATE customer_addresses SET is_default = FALSE, updated_at = NOW() WHERE user_id = ?",
				UUID.fromString(userId));
	}

	private void unsetDefaultExcept(String userId, String exceptId) {
		jdbc.update("""
				UPDATE customer_addresses
				SET is_default = FALSE, updated_at = NOW()
				WHERE user_id = ? AND id <> ?
				""", UUID.fromString(userId), UUID.fromString(exceptId));
	}

	private PageRequestParams params(int page, int pageSize, String search, String sortField, String sortOrder) {
		return new PageRequestParams(page, pageSize, search, sortField, sortOrder);
	}

	private List<Map<String, Object>> page(List<Map<String, Object>> rows, PageRequestParams params) {
		int page = params.normalizedPage();
		int pageSize = params.normalizedPageSize();
		int from = Math.min((page - 1) * pageSize, rows.size());
		int to = Math.min(from + pageSize, rows.size());
		return rows.subList(from, to);
	}

	private String userId(String header) {
		return header == null || header.isBlank() ? DEFAULT_USER_ID : header;
	}

	private Object firstPresent(Map<String, Object> body, String first, String second) {
		Object value = body.get(first);
		return value == null ? body.get(second) : value;
	}

	private String defaultText(Object value, String fallback) {
		String text = text(value);
		return text.isBlank() ? fallback : text;
	}

	private String blankToNull(Object value) {
		String text = text(value);
		return text.isBlank() ? null : text;
	}

	private boolean booleanValue(Object value) {
		return value instanceof Boolean bool ? bool : Boolean.parseBoolean(text(value));
	}

	private Long longOrNull(Object value) {
		String text = text(value);
		return text.isBlank() ? null : Long.parseLong(text);
	}

	private String text(Object value) {
		return value == null ? "" : String.valueOf(value);
	}

	private Number number(Object value) {
		if (value instanceof Number number) {
			return number;
		}
		return value == null || String.valueOf(value).isBlank() ? 0 : Double.parseDouble(String.valueOf(value));
	}

	private Map<String, Object> nullableMap(Object... values) {
		Map<String, Object> map = new LinkedHashMap<>();
		for (int i = 0; i + 1 < values.length; i += 2) {
			if (values[i + 1] != null) {
				map.put(String.valueOf(values[i]), values[i + 1]);
			}
		}
		return map;
	}

	private Map<String, Object> map(Object... values) {
		Map<String, Object> map = new LinkedHashMap<>();
		for (int i = 0; i + 1 < values.length; i += 2) {
			map.put(String.valueOf(values[i]), values[i + 1]);
		}
		return map;
	}

	private String now() {
		return Instant.now().toString();
	}
}

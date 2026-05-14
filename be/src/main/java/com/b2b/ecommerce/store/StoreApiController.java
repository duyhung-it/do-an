package com.b2b.ecommerce.store;

import java.util.List;
import java.util.Map;

import com.b2b.ecommerce.common.ApiResponse;
import com.b2b.ecommerce.common.PageRequestParams;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/mock")
public class StoreApiController {
	private final StoreDataService store;

	public StoreApiController(StoreDataService store) {
		this.store = store;
	}

	@GetMapping("/categories")
	public ApiResponse<List<Map<String, Object>>> categories(
			@RequestParam(required = false) Integer page,
			@RequestParam(required = false) Integer pageSize) {
		List<Map<String, Object>> categories = store.categories();
		if (page == null && pageSize == null) {
			return ApiResponse.ok(categories);
		}
		PageRequestParams params = params(page, pageSize, null, null, "asc");
		return ApiResponse.page(categories.stream()
				.skip((long) (params.normalizedPage() - 1) * params.normalizedPageSize())
				.limit(params.normalizedPageSize())
				.toList(), categories.size(), params.normalizedPage(), params.normalizedPageSize());
	}

	@GetMapping("/categories/{id}")
	public ApiResponse<Map<String, Object>> category(@PathVariable String id) {
		return ApiResponse.ok(store.category(id));
	}

	@PostMapping("/categories")
	public ResponseEntity<ApiResponse<Map<String, Object>>> createCategory(@RequestBody Map<String, Object> body) {
		return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(store.createCategory(body)));
	}

	@PutMapping("/categories/{id}")
	public ApiResponse<Map<String, Object>> updateCategory(@PathVariable String id, @RequestBody Map<String, Object> body) {
		return ApiResponse.ok(store.updateCategory(id, body));
	}

	@DeleteMapping("/categories/{id}")
	public ResponseEntity<Void> deleteCategory(@PathVariable String id) {
		store.deleteCategory(id);
		return ResponseEntity.noContent().build();
	}

	@GetMapping("/products")
	public ApiResponse<List<Map<String, Object>>> products(
			@RequestParam(defaultValue = "1") int page,
			@RequestParam(defaultValue = "20") int pageSize,
			@RequestParam(required = false) String search,
			@RequestParam(required = false) String categoryId,
			@RequestParam(required = false) String categoryName,
			@RequestParam(required = false) String brand,
			@RequestParam(required = false) String status,
			@RequestParam(required = false) String condition,
			@RequestParam(required = false) Long minPrice,
			@RequestParam(required = false) Long maxPrice,
			@RequestParam(required = false) String ram,
			@RequestParam(required = false) String storage,
			@RequestParam(required = false) Boolean isFeatured,
			@RequestParam(required = false) Boolean isNew,
			@RequestParam(required = false) Boolean isHot,
			@RequestParam(required = false) String sortField,
			@RequestParam(defaultValue = "desc") String sortOrder) {
		Map<String, Object> filters = filters(
				"categoryId", categoryId,
				"categoryName", categoryName,
				"brand", brand,
				"status", status,
				"condition", condition,
				"minPrice", minPrice,
				"maxPrice", maxPrice,
				"ram", ram,
				"storage", storage,
				"isFeatured", isFeatured,
				"isNew", isNew,
				"isHot", isHot);
		PageRequestParams params = params(page, pageSize, search, sortField, sortOrder);
		return ApiResponse.page(store.products(params, filters), store.productCount(search, filters),
				params.normalizedPage(), params.normalizedPageSize());
	}

	@GetMapping("/products/all")
	public ApiResponse<List<Map<String, Object>>> allProducts() {
		return ApiResponse.ok(store.products());
	}

	@GetMapping("/products/featured")
	public ApiResponse<List<Map<String, Object>>> featured(@RequestParam(defaultValue = "8") int limit) {
		return ApiResponse.ok(store.productsByFlag("isFeatured", limit));
	}

	@GetMapping("/products/hot")
	public ApiResponse<List<Map<String, Object>>> hot(@RequestParam(defaultValue = "6") int limit) {
		return ApiResponse.ok(store.productsByFlag("isHot", limit));
	}

	@GetMapping("/products/new")
	public ApiResponse<List<Map<String, Object>>> newest(@RequestParam(defaultValue = "6") int limit) {
		return ApiResponse.ok(store.productsByFlag("isNew", limit));
	}

	@GetMapping("/products/brands")
	public ApiResponse<List<String>> brands() {
		return ApiResponse.ok(store.brands());
	}

	@GetMapping("/products/category/{categoryId}")
	public ApiResponse<List<Map<String, Object>>> productsByCategory(@PathVariable String categoryId) {
		return ApiResponse.ok(store.productsByCategory(categoryId));
	}

	@GetMapping("/products/brand/{brand}")
	public ApiResponse<List<Map<String, Object>>> productsByBrand(@PathVariable String brand) {
		return ApiResponse.ok(store.productsByBrand(brand));
	}

	@GetMapping("/products/{id}/similar")
	public ApiResponse<List<Map<String, Object>>> similar(@PathVariable String id, @RequestParam(defaultValue = "4") int limit) {
		return ApiResponse.ok(store.similarProducts(id, limit));
	}

	@GetMapping("/products/{id}")
	public ApiResponse<Map<String, Object>> product(@PathVariable String id) {
		return ApiResponse.ok(store.product(id));
	}

	@PostMapping("/products")
	public ResponseEntity<ApiResponse<Map<String, Object>>> createProduct(@RequestBody Map<String, Object> body) {
		return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(store.createProduct(body)));
	}

	@PutMapping("/products/{id}")
	public ApiResponse<Map<String, Object>> updateProduct(@PathVariable String id, @RequestBody Map<String, Object> body) {
		return ApiResponse.ok(store.updateProduct(id, body));
	}

	@DeleteMapping("/products/{id}")
	public ResponseEntity<Void> deleteProduct(@PathVariable String id) {
		store.deleteProduct(id);
		return ResponseEntity.noContent().build();
	}

	@GetMapping("/orders")
	public ApiResponse<List<Map<String, Object>>> orders(
			@RequestParam(defaultValue = "1") int page,
			@RequestParam(defaultValue = "20") int pageSize,
			@RequestParam(required = false) String search,
			@RequestParam(required = false) String customerId,
			@RequestParam(required = false) String buyerId,
			@RequestParam(required = false) String status) {
		Map<String, Object> filters = filters("customerId", customerId, "buyerId", buyerId, "status", status);
		PageRequestParams params = params(page, pageSize, search, "createdAt", "desc");
		return ApiResponse.page(store.orders(params, filters), store.orderCount(search, filters), params.normalizedPage(),
				params.normalizedPageSize());
	}

	@GetMapping("/orders/customer/{customerId}")
	public ApiResponse<List<Map<String, Object>>> ordersByCustomer(@PathVariable String customerId) {
		return ApiResponse.ok(store.ordersByCustomer(customerId));
	}

	@GetMapping("/orders/buyer/{buyerId}")
	public ApiResponse<List<Map<String, Object>>> ordersByBuyer(@PathVariable String buyerId) {
		return ApiResponse.ok(store.ordersByCustomer(buyerId));
	}

	@GetMapping("/orders/{id}")
	public ApiResponse<Map<String, Object>> order(@PathVariable String id) {
		return ApiResponse.ok(store.order(id));
	}

	@PostMapping("/orders")
	public ResponseEntity<ApiResponse<Map<String, Object>>> createOrder(@RequestBody Map<String, Object> body) {
		return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(store.createOrder(body)));
	}

	@PatchMapping("/orders/{id}/status")
	public ApiResponse<Map<String, Object>> updateOrderStatus(@PathVariable String id, @RequestBody Map<String, Object> body) {
		return ApiResponse.ok(store.updateOrderStatus(id, String.valueOf(body.get("status"))));
	}

	@PatchMapping("/orders/{id}/cancel")
	public ApiResponse<Map<String, Object>> cancelOrder(@PathVariable String id, @RequestBody Map<String, Object> body) {
		return ApiResponse.ok(store.cancelOrder(id, String.valueOf(body.getOrDefault("reason", ""))));
	}

	@GetMapping("/cart")
	public ApiResponse<List<Map<String, Object>>> cart() {
		return ApiResponse.ok(store.cartItems());
	}

	@PostMapping("/cart")
	public ResponseEntity<ApiResponse<Map<String, Object>>> addCart(@RequestBody Map<String, Object> body) {
		return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(store.addCartItem(body)));
	}

	@PatchMapping("/cart/{id}")
	public ApiResponse<Map<String, Object>> updateCart(@PathVariable String id, @RequestBody Map<String, Object> body) {
		return ApiResponse.ok(store.updateCartQuantity(id, Integer.parseInt(String.valueOf(body.get("quantity")))));
	}

	@DeleteMapping("/cart/{id}")
	public ResponseEntity<Void> removeCart(@PathVariable String id) {
		store.removeCartItem(id);
		return ResponseEntity.noContent().build();
	}

	@DeleteMapping("/cart")
	public ResponseEntity<Void> clearCart() {
		store.clearCart();
		return ResponseEntity.noContent().build();
	}

	@GetMapping("/wishlist/{userId}")
	public ApiResponse<List<Map<String, Object>>> wishlist(@PathVariable String userId) {
		return ApiResponse.ok(store.wishlist(userId));
	}

	@PostMapping("/wishlist")
	public ResponseEntity<ApiResponse<Map<String, Object>>> addWishlist(@RequestBody Map<String, Object> body) {
		return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(store.addWishlist(
				String.valueOf(body.get("userId")), String.valueOf(body.get("productId")))));
	}

	@DeleteMapping("/wishlist/{id}")
	public ResponseEntity<Void> removeWishlist(@PathVariable String id) {
		store.removeWishlist(id);
		return ResponseEntity.noContent().build();
	}

	@DeleteMapping("/wishlist/user/{userId}/product/{productId}")
	public ResponseEntity<Void> removeWishlistByProduct(@PathVariable String userId, @PathVariable String productId) {
		store.removeWishlistByProduct(userId, productId);
		return ResponseEntity.noContent().build();
	}

	@GetMapping("/reviews")
	public ApiResponse<List<Map<String, Object>>> reviews(
			@RequestParam(defaultValue = "1") int page,
			@RequestParam(defaultValue = "20") int pageSize,
			@RequestParam(required = false) String productId,
			@RequestParam(required = false) String userId,
			@RequestParam(required = false) String status) {
		Map<String, Object> filters = filters("productId", productId, "userId", userId, "status", status);
		PageRequestParams params = params(page, pageSize, null, null, "desc");
		return ApiResponse.page(store.reviews(params, filters), store.reviewCount(filters), params.normalizedPage(),
				params.normalizedPageSize());
	}

	@GetMapping("/products/{productId}/reviews")
	public ApiResponse<List<Map<String, Object>>> productReviews(@PathVariable String productId) {
		return ApiResponse.ok(store.reviewsByProduct(productId));
	}

	@PostMapping("/reviews")
	public ResponseEntity<ApiResponse<Map<String, Object>>> createReview(@RequestBody Map<String, Object> body) {
		return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(store.createReview(body)));
	}

	@PatchMapping("/reviews/{id}")
	public ApiResponse<Map<String, Object>> updateReview(@PathVariable String id, @RequestBody Map<String, Object> body) {
		return ApiResponse.ok(store.updateReview(id, body));
	}

	@DeleteMapping("/reviews/{id}")
	public ResponseEntity<Void> deleteReview(@PathVariable String id) {
		store.deleteReview(id);
		return ResponseEntity.noContent().build();
	}

	@GetMapping("/promotions")
	public ApiResponse<List<Map<String, Object>>> promotions(
			@RequestParam(defaultValue = "1") int page,
			@RequestParam(defaultValue = "20") int pageSize,
			@RequestParam(required = false) String search,
			@RequestParam(required = false) Boolean isActive) {
		Map<String, Object> filters = filters("isActive", isActive);
		PageRequestParams params = params(page, pageSize, search, null, "desc");
		return ApiResponse.page(store.promotions(params, filters), store.promotionCount(search, filters),
				params.normalizedPage(), params.normalizedPageSize());
	}

	@GetMapping("/promotions/active")
	public ApiResponse<List<Map<String, Object>>> activePromotions() {
		return ApiResponse.ok(store.promotions(true));
	}

	@PostMapping("/promotions/validate")
	public ApiResponse<Map<String, Object>> validatePromotion(@RequestBody Map<String, Object> body) {
		long subtotal = Long.parseLong(String.valueOf(body.getOrDefault("subtotal", "0")));
		return ApiResponse.ok(store.validatePromotion(String.valueOf(body.get("code")), subtotal));
	}

	@PatchMapping("/promotions/{id}/toggle")
	public ApiResponse<Map<String, Object>> togglePromotion(@PathVariable String id, @RequestBody Map<String, Object> body) {
		return ApiResponse.ok(store.togglePromotion(id, Boolean.parseBoolean(String.valueOf(body.get("isActive")))));
	}

	@GetMapping("/users")
	public ApiResponse<List<Map<String, Object>>> users(
			@RequestParam(defaultValue = "1") int page,
			@RequestParam(defaultValue = "20") int pageSize,
			@RequestParam(required = false) String search,
			@RequestParam(required = false) String role,
			@RequestParam(required = false) String status) {
		Map<String, Object> filters = filters("role", role, "status", status);
		PageRequestParams params = params(page, pageSize, search, null, "desc");
		return ApiResponse.page(store.users(params, filters), store.userCount(search, filters), params.normalizedPage(),
				params.normalizedPageSize());
	}

	@GetMapping("/users/{id}")
	public ApiResponse<Map<String, Object>> user(@PathVariable String id) {
		return ApiResponse.ok(store.user(id));
	}

	@PostMapping("/users")
	public ResponseEntity<ApiResponse<Map<String, Object>>> createUser(@RequestBody Map<String, Object> body) {
		return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(store.createUser(body)));
	}

	@PutMapping("/users/{id}")
	public ApiResponse<Map<String, Object>> updateUser(@PathVariable String id, @RequestBody Map<String, Object> body) {
		return ApiResponse.ok(store.updateUser(id, body));
	}

	@DeleteMapping("/users/{id}")
	public ResponseEntity<Void> deleteUser(@PathVariable String id) {
		store.deleteUser(id);
		return ResponseEntity.noContent().build();
	}

	@GetMapping("/notifications")
	public ApiResponse<List<Map<String, Object>>> notifications() {
		return ApiResponse.ok(store.notifications());
	}

	@GetMapping("/notifications/unread-count")
	public ApiResponse<Map<String, Object>> unreadNotifications() {
		return ApiResponse.ok(Map.of("count", store.unreadNotifications()));
	}

	@PostMapping("/notifications")
	public ResponseEntity<ApiResponse<Map<String, Object>>> addNotification(@RequestBody Map<String, Object> body) {
		return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(store.addNotification(body)));
	}

	@PatchMapping("/notifications/{id}/read")
	public ApiResponse<Map<String, Object>> markNotificationRead(@PathVariable String id) {
		return ApiResponse.ok(store.markNotificationRead(id));
	}

	@PatchMapping("/notifications/read-all")
	public ResponseEntity<Void> markAllNotificationsRead() {
		store.markAllNotificationsRead();
		return ResponseEntity.noContent().build();
	}

	@DeleteMapping("/notifications/{id}")
	public ResponseEntity<Void> deleteNotification(@PathVariable String id) {
		store.deleteNotification(id);
		return ResponseEntity.noContent().build();
	}

	@GetMapping("/blogs")
	public ApiResponse<List<Map<String, Object>>> blogs(
			@RequestParam(defaultValue = "1") int page,
			@RequestParam(defaultValue = "20") int pageSize,
			@RequestParam(required = false) String search,
			@RequestParam(required = false) String category,
			@RequestParam(required = false) Boolean isPublished) {
		Map<String, Object> filters = filters("category", category, "isPublished", isPublished);
		PageRequestParams params = params(page, pageSize, search, null, "desc");
		return ApiResponse.page(store.blogs(params, filters), store.blogCount(search, filters), params.normalizedPage(),
				params.normalizedPageSize());
	}

	@GetMapping("/blogs/latest")
	public ApiResponse<List<Map<String, Object>>> latestBlogs(@RequestParam(defaultValue = "3") int limit) {
		return ApiResponse.ok(store.latestBlogs(limit));
	}

	@GetMapping("/blogs/slug/{slug}")
	public ApiResponse<Map<String, Object>> blogBySlug(@PathVariable String slug) {
		return ApiResponse.ok(store.blogBySlug(slug));
	}

	@GetMapping("/stores")
	public ApiResponse<List<Map<String, Object>>> stores() {
		return ApiResponse.ok(store.stores());
	}

	@GetMapping("/suppliers")
	public ApiResponse<List<Map<String, Object>>> suppliers(
			@RequestParam(defaultValue = "1") int page,
			@RequestParam(defaultValue = "20") int pageSize) {
		return ApiResponse.page(List.of(), 0, page, pageSize);
	}

	@GetMapping("/imei/{imei}")
	public ApiResponse<Map<String, Object>> imei(@PathVariable String imei) {
		return ApiResponse.ok(store.checkImei(imei));
	}

	@GetMapping("/dashboard/admin")
	public ApiResponse<Map<String, Object>> adminDashboard() {
		return ApiResponse.ok(store.dashboardStats());
	}

	private PageRequestParams params(Integer page, Integer pageSize, String search, String sortField, String sortOrder) {
		return new PageRequestParams(page == null ? 1 : page, pageSize == null ? 20 : pageSize, search, sortField, sortOrder);
	}

	private Map<String, Object> filters(Object... values) {
		java.util.LinkedHashMap<String, Object> filters = new java.util.LinkedHashMap<>();
		for (int i = 0; i < values.length; i += 2) {
			if (values[i + 1] != null) {
				filters.put(String.valueOf(values[i]), values[i + 1]);
			}
		}
		return filters;
	}
}

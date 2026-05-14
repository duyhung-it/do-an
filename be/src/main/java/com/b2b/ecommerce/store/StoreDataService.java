package com.b2b.ecommerce.store;

import java.time.Instant;
import java.text.Normalizer;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.UUID;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.function.Predicate;

import com.b2b.ecommerce.common.PageRequestParams;
import org.springframework.stereotype.Service;

@Service
public class StoreDataService {
	private final List<Map<String, Object>> categories = new CopyOnWriteArrayList<>();
	private final List<Map<String, Object>> products = new CopyOnWriteArrayList<>();
	private final List<Map<String, Object>> users = new CopyOnWriteArrayList<>();
	private final List<Map<String, Object>> orders = new CopyOnWriteArrayList<>();
	private final List<Map<String, Object>> reviews = new CopyOnWriteArrayList<>();
	private final List<Map<String, Object>> promotions = new CopyOnWriteArrayList<>();
	private final List<Map<String, Object>> cartItems = new CopyOnWriteArrayList<>();
	private final List<Map<String, Object>> wishlistItems = new CopyOnWriteArrayList<>();
	private final List<Map<String, Object>> notifications = new CopyOnWriteArrayList<>();
	private final List<Map<String, Object>> blogPosts = new CopyOnWriteArrayList<>();
	private final List<Map<String, Object>> stores = new CopyOnWriteArrayList<>();

	public StoreDataService() {
		seed();
	}

	public List<Map<String, Object>> categories() {
		return categories.stream()
				.sorted(Comparator.comparingInt(item -> number(item, "sortOrder").intValue()))
				.toList();
	}

	public Map<String, Object> category(String id) {
		return find(categories, id, "Khong tim thay danh muc");
	}

	public Map<String, Object> createCategory(Map<String, Object> input) {
		Map<String, Object> category = merge(map(
				"id", nextId("cat"),
				"parentId", null,
				"isActive", true,
				"productCount", 0,
				"sortOrder", categories.size() + 1,
				"level", 0,
				"createdAt", now(),
				"updatedAt", now()), input);
		category.putIfAbsent("slug", slug(String.valueOf(category.get("name"))));
		categories.add(category);
		return category;
	}

	public Map<String, Object> updateCategory(String id, Map<String, Object> input) {
		return update(categories, id, input, "Khong tim thay danh muc");
	}

	public void deleteCategory(String id) {
		categories.remove(category(id));
	}

	public List<Map<String, Object>> products() {
		return List.copyOf(products);
	}

	public List<Map<String, Object>> products(PageRequestParams params, Map<String, Object> filters) {
		return page(sort(filterProducts(params.search(), filters), params), params);
	}

	public int productCount(String search, Map<String, Object> filters) {
		return filterProducts(search, filters).size();
	}

	public Map<String, Object> product(String id) {
		return find(products, id, "Khong tim thay san pham");
	}

	public List<Map<String, Object>> productsByCategory(String categoryId) {
		return products.stream().filter(item -> equalsText(item.get("categoryId"), categoryId)).toList();
	}

	public List<Map<String, Object>> productsByBrand(String brand) {
		return products.stream().filter(item -> equalsText(item.get("brand"), brand)).toList();
	}

	public List<Map<String, Object>> productsByFlag(String flag, int limit) {
		return products.stream().filter(item -> Boolean.TRUE.equals(item.get(flag))).limit(limit).toList();
	}

	public List<Map<String, Object>> similarProducts(String productId, int limit) {
		Map<String, Object> current = product(productId);
		return products.stream()
				.filter(item -> !equalsText(item.get("id"), productId))
				.filter(item -> equalsText(item.get("categoryId"), current.get("categoryId"))
						|| equalsText(item.get("brand"), current.get("brand")))
				.limit(limit)
				.toList();
	}

	public List<String> brands() {
		return products.stream()
				.map(item -> String.valueOf(item.get("brand")))
				.distinct()
				.sorted()
				.toList();
	}

	public Map<String, Object> createProduct(Map<String, Object> input) {
		Map<String, Object> product = merge(productDefaults(), input);
		product.put("id", nextId("prod"));
		product.putIfAbsent("slug", slug(String.valueOf(product.get("name"))));
		products.add(0, product);
		return product;
	}

	public Map<String, Object> updateProduct(String id, Map<String, Object> input) {
		return update(products, id, input, "Khong tim thay san pham");
	}

	public void deleteProduct(String id) {
		products.remove(product(id));
	}

	public List<Map<String, Object>> orders(PageRequestParams params, Map<String, Object> filters) {
		List<Map<String, Object>> filtered = orders.stream()
				.filter(matches(params.search(), item -> item.get("orderNumber") + " " + item.get("customerName")))
				.filter(item -> filterEquals(filters, item, "customerId"))
				.filter(item -> filterEquals(filters, item, "buyerId", "customerId"))
				.filter(item -> filterEquals(filters, item, "status"))
				.sorted(Comparator.comparing(item -> String.valueOf(item.get("createdAt")), Comparator.reverseOrder()))
				.toList();
		return page(filtered, params);
	}

	public int orderCount(String search, Map<String, Object> filters) {
		return orders.stream()
				.filter(matches(search, item -> item.get("orderNumber") + " " + item.get("customerName")))
				.filter(item -> filterEquals(filters, item, "customerId"))
				.filter(item -> filterEquals(filters, item, "buyerId", "customerId"))
				.filter(item -> filterEquals(filters, item, "status"))
				.toList()
				.size();
	}

	public Map<String, Object> order(String id) {
		return find(orders, id, "Khong tim thay don hang");
	}

	public List<Map<String, Object>> ordersByCustomer(String customerId) {
		return orders.stream().filter(item -> equalsText(item.get("customerId"), customerId)).toList();
	}

	public Map<String, Object> createOrder(Map<String, Object> input) {
		Map<String, Object> order = merge(map(
				"id", nextId("ord"),
				"orderNumber", "CP" + System.currentTimeMillis(),
				"status", "Chờ xác nhận",
				"paymentStatus", "Chưa thanh toán",
				"shippingFee", 0,
				"discount", 0,
				"notes", "",
				"createdAt", now(),
				"updatedAt", now()), input);
		orders.add(0, order);
		cartItems.clear();
		return order;
	}

	public Map<String, Object> updateOrderStatus(String id, String status) {
		return update(orders, id, map("status", status, "updatedAt", now()), "Khong tim thay don hang");
	}

	public Map<String, Object> cancelOrder(String id, String reason) {
		return update(orders, id, map("status", "Đã huỷ", "cancelReason", reason, "cancelledAt", now(), "updatedAt", now()),
				"Khong tim thay don hang");
	}

	public List<Map<String, Object>> cartItems() {
		return List.copyOf(cartItems);
	}

	public Map<String, Object> addCartItem(Map<String, Object> input) {
		Number quantity = number(input, "quantity");
		Number unitPrice = number(input, "unitPrice");
		Map<String, Object> item = merge(map(
				"id", nextId("cart"),
				"quantity", quantity.intValue(),
				"unitPrice", unitPrice.longValue(),
				"totalPrice", unitPrice.longValue() * quantity.intValue(),
				"addedAt", now()), input);
		cartItems.add(item);
		return item;
	}

	public Map<String, Object> updateCartQuantity(String id, int quantity) {
		Map<String, Object> item = find(cartItems, id, "Khong tim thay san pham trong gio");
		Number unitPrice = number(item, "unitPrice");
		return update(cartItems, id, map("quantity", quantity, "totalPrice", unitPrice.longValue() * quantity),
				"Khong tim thay san pham trong gio");
	}

	public void removeCartItem(String id) {
		cartItems.remove(find(cartItems, id, "Khong tim thay san pham trong gio"));
	}

	public void clearCart() {
		cartItems.clear();
	}

	public List<Map<String, Object>> wishlist(String userId) {
		return wishlistItems.stream().filter(item -> equalsText(item.get("userId"), userId)).toList();
	}

	public Map<String, Object> addWishlist(String userId, String productId) {
		Map<String, Object> product = product(productId);
		Map<String, Object> item = map(
				"id", nextId("wl"),
				"userId", userId,
				"productId", productId,
				"productName", product.get("name"),
				"productImage", first((List<?>) product.get("images")),
				"brand", product.get("brand"),
				"categoryName", product.get("categoryName"),
				"price", product.get("price"),
				"originalPrice", product.get("originalPrice"),
				"stock", stock(product),
				"addedAt", now());
		wishlistItems.add(0, item);
		return item;
	}

	public void removeWishlist(String id) {
		wishlistItems.remove(find(wishlistItems, id, "Khong tim thay wishlist item"));
	}

	public void removeWishlistByProduct(String userId, String productId) {
		wishlistItems.removeIf(item -> equalsText(item.get("userId"), userId) && equalsText(item.get("productId"), productId));
	}

	public List<Map<String, Object>> reviewsByProduct(String productId) {
		return reviews.stream()
				.filter(item -> equalsText(item.get("productId"), productId))
				.filter(item -> equalsText(item.get("status"), "Hien thi"))
				.toList();
	}

	public List<Map<String, Object>> reviews(PageRequestParams params, Map<String, Object> filters) {
		List<Map<String, Object>> filtered = reviews.stream()
				.filter(item -> filterEquals(filters, item, "productId"))
				.filter(item -> filterEquals(filters, item, "userId"))
				.filter(item -> filterEquals(filters, item, "status"))
				.toList();
		return page(filtered, params);
	}

	public int reviewCount(Map<String, Object> filters) {
		return (int) reviews.stream()
				.filter(item -> filterEquals(filters, item, "productId"))
				.filter(item -> filterEquals(filters, item, "userId"))
				.filter(item -> filterEquals(filters, item, "status"))
				.count();
	}

	public Map<String, Object> createReview(Map<String, Object> input) {
		Map<String, Object> review = merge(map(
				"id", nextId("rev"),
				"status", "Chờ duyệt",
				"helpfulCount", 0,
				"images", List.of(),
				"tags", List.of(),
				"createdAt", now()), input);
		reviews.add(0, review);
		return review;
	}

	public Map<String, Object> updateReview(String id, Map<String, Object> input) {
		return update(reviews, id, input, "Khong tim thay danh gia");
	}

	public void deleteReview(String id) {
		reviews.remove(find(reviews, id, "Khong tim thay danh gia"));
	}

	public List<Map<String, Object>> promotions(boolean activeOnly) {
		if (!activeOnly) {
			return List.copyOf(promotions);
		}
		return promotions.stream().filter(item -> Boolean.TRUE.equals(item.get("isActive"))).toList();
	}

	public List<Map<String, Object>> promotions(PageRequestParams params, Map<String, Object> filters) {
		List<Map<String, Object>> filtered = promotions.stream()
				.filter(matches(params.search(), item -> item.get("code") + " " + item.get("name")))
				.filter(item -> filterEquals(filters, item, "isActive"))
				.toList();
		return page(filtered, params);
	}

	public int promotionCount(String search, Map<String, Object> filters) {
		return (int) promotions.stream()
				.filter(matches(search, item -> item.get("code") + " " + item.get("name")))
				.filter(item -> filterEquals(filters, item, "isActive"))
				.count();
	}

	public Map<String, Object> validatePromotion(String code, long subtotal) {
		return promotions.stream()
				.filter(item -> equalsText(item.get("code"), code))
				.filter(item -> Boolean.TRUE.equals(item.get("isActive")))
				.filter(item -> number(item, "minOrderValue").longValue() <= subtotal)
				.findFirst()
				.orElseThrow(() -> new IllegalArgumentException("Ma khuyen mai khong hop le hoac chua du dieu kien"));
	}

	public Map<String, Object> togglePromotion(String id, boolean active) {
		return update(promotions, id, map("isActive", active), "Khong tim thay khuyen mai");
	}

	public List<Map<String, Object>> users(PageRequestParams params, Map<String, Object> filters) {
		List<Map<String, Object>> filtered = users.stream()
				.filter(matches(params.search(), item -> item.get("fullName") + " " + item.get("email")))
				.filter(item -> filterEquals(filters, item, "role"))
				.filter(item -> filterEquals(filters, item, "status"))
				.toList();
		return page(filtered, params);
	}

	public int userCount(String search, Map<String, Object> filters) {
		return (int) users.stream()
				.filter(matches(search, item -> item.get("fullName") + " " + item.get("email")))
				.filter(item -> filterEquals(filters, item, "role"))
				.filter(item -> filterEquals(filters, item, "status"))
				.count();
	}

	public Map<String, Object> user(String id) {
		return find(users, id, "Khong tim thay nguoi dung");
	}

	public Map<String, Object> createUser(Map<String, Object> input) {
		Map<String, Object> user = merge(map(
				"id", nextId("user"),
				"role", "Khách hàng",
				"status", "Hoạt động",
				"avatarUrl", "https://api.dicebear.com/7.x/initials/svg?seed=" + input.getOrDefault("fullName", "User"),
				"loyaltyPoints", 0,
				"totalOrders", 0,
				"totalSpent", 0,
				"emailVerified", false,
				"createdAt", now(),
				"updatedAt", now()), input);
		users.add(0, user);
		return user;
	}

	public Map<String, Object> updateUser(String id, Map<String, Object> input) {
		return update(users, id, merge(map("updatedAt", now()), input), "Khong tim thay nguoi dung");
	}

	public void deleteUser(String id) {
		users.remove(user(id));
	}

	public List<Map<String, Object>> notifications() {
		return List.copyOf(notifications);
	}

	public long unreadNotifications() {
		return notifications.stream().filter(item -> !Boolean.TRUE.equals(item.get("isRead"))).count();
	}

	public Map<String, Object> addNotification(Map<String, Object> input) {
		Map<String, Object> notification = merge(map("id", nextId("n"), "isRead", false, "createdAt", now()), input);
		notifications.add(0, notification);
		return notification;
	}

	public Map<String, Object> markNotificationRead(String id) {
		return update(notifications, id, map("isRead", true), "Khong tim thay thong bao");
	}

	public void markAllNotificationsRead() {
		notifications.forEach(item -> item.put("isRead", true));
	}

	public void deleteNotification(String id) {
		notifications.remove(find(notifications, id, "Khong tim thay thong bao"));
	}

	public List<Map<String, Object>> blogs(PageRequestParams params, Map<String, Object> filters) {
		List<Map<String, Object>> filtered = blogPosts.stream()
				.filter(matches(params.search(), item -> item.get("title") + " " + item.get("excerpt")))
				.filter(item -> filterEquals(filters, item, "category"))
				.filter(item -> filterEquals(filters, item, "isPublished"))
				.toList();
		return page(filtered, params);
	}

	public int blogCount(String search, Map<String, Object> filters) {
		return (int) blogPosts.stream()
				.filter(matches(search, item -> item.get("title") + " " + item.get("excerpt")))
				.filter(item -> filterEquals(filters, item, "category"))
				.filter(item -> filterEquals(filters, item, "isPublished"))
				.count();
	}

	public Map<String, Object> blogBySlug(String slug) {
		return blogPosts.stream()
				.filter(item -> equalsText(item.get("slug"), slug))
				.findFirst()
				.orElseThrow(() -> new NoSuchElementException("Khong tim thay bai viet"));
	}

	public List<Map<String, Object>> latestBlogs(int limit) {
		return blogPosts.stream().filter(item -> Boolean.TRUE.equals(item.get("isPublished"))).limit(limit).toList();
	}

	public List<Map<String, Object>> stores() {
		return List.copyOf(stores);
	}

	public Map<String, Object> checkImei(String imei) {
		return map(
				"imei", imei,
				"brand", imei.startsWith("35") ? "Apple" : "Samsung",
				"model", imei.startsWith("35") ? "iPhone 16 Pro Max" : "Galaxy S25 Ultra",
				"isLocked", false,
				"warrantyStatus", "Còn bảo hành",
				"warrantyExpiry", "2027-05-12",
				"purchaseCountry", "Viet Nam",
				"isBlacklisted", false,
				"activationStatus", "Đã kích hoạt",
				"checkedAt", now());
	}

	public Map<String, Object> dashboardStats() {
		long revenue = orders.stream().mapToLong(item -> number(item, "totalAmount").longValue()).sum();
		return map(
				"totalRevenue", revenue,
				"totalOrders", orders.size(),
				"totalProducts", products.size(),
				"totalCustomers", users.stream().filter(item -> equalsText(item.get("role"), "Khách hàng")).count(),
				"pendingOrders", orders.stream().filter(item -> equalsText(item.get("status"), "Chờ xác nhận")).count(),
				"todayRevenue", revenue,
				"todayOrders", orders.size(),
				"revenueGrowth", 12.5,
				"orderGrowth", 8.3,
				"revenueByMonth", List.of(map("month", "T1", "revenue", 45), map("month", "T2", "revenue", 62),
						map("month", "T3", "revenue", 88)),
				"ordersByStatus", List.of(map("status", "Chờ xác nhận", "count", 1), map("status", "Đang giao hàng", "count", 1),
						map("status", "Đã giao", "count", 1)),
				"topProducts", products.stream().limit(3).map(item -> map("name", item.get("name"), "brand", item.get("brand"),
						"sales", item.get("soldCount"), "revenue", number(item, "price").longValue() * 10)).toList(),
				"topCategories", categories.stream().limit(3).map(item -> map("name", item.get("name"), "count",
						item.get("productCount"), "revenue", 10_000_000)).toList(),
				"lowStockProducts", products.stream().filter(item -> stock(item) <= 10).map(item -> map("id", item.get("id"),
						"name", item.get("name"), "stock", stock(item))).toList());
	}

	private List<Map<String, Object>> filterProducts(String search, Map<String, Object> filters) {
		return products.stream()
				.filter(matches(search, item -> item.get("name") + " " + item.get("brand") + " " + item.get("categoryName")))
				.filter(item -> filterEquals(filters, item, "categoryId"))
				.filter(item -> filterEquals(filters, item, "categoryName"))
				.filter(item -> filterEquals(filters, item, "brand"))
				.filter(item -> filterEquals(filters, item, "status"))
				.filter(item -> filterEquals(filters, item, "condition"))
				.filter(item -> filterBoolean(filters, item, "isFeatured"))
				.filter(item -> filterBoolean(filters, item, "isNew"))
				.filter(item -> filterBoolean(filters, item, "isHot"))
				.filter(item -> filterMin(filters, item, "minPrice", "price"))
				.filter(item -> filterMax(filters, item, "maxPrice", "price"))
				.filter(item -> filterPhoneSpec(filters, item, "ram"))
				.filter(item -> filterPhoneSpec(filters, item, "storage"))
				.toList();
	}

	private List<Map<String, Object>> sort(List<Map<String, Object>> items, PageRequestParams params) {
		String field = params.sortField();
		if (field == null || field.isBlank()) {
			return items;
		}
		Comparator<Map<String, Object>> comparator = (left, right) -> compareValues(left.get(field), right.get(field));
		if (!params.ascending()) {
			comparator = comparator.reversed();
		}
		return items.stream().sorted(comparator).toList();
	}

	private List<Map<String, Object>> page(List<Map<String, Object>> items, PageRequestParams params) {
		int page = params.normalizedPage();
		int pageSize = params.normalizedPageSize();
		int from = Math.min((page - 1) * pageSize, items.size());
		int to = Math.min(from + pageSize, items.size());
		return new ArrayList<>(items.subList(from, to));
	}

	private Predicate<Map<String, Object>> matches(String search, java.util.function.Function<Map<String, Object>, String> text) {
		if (search == null || search.isBlank()) {
			return ignored -> true;
		}
		String needle = normalize(search);
		return item -> normalize(text.apply(item)).contains(needle);
	}

	private boolean filterEquals(Map<String, Object> filters, Map<String, Object> item, String key) {
		return filterEquals(filters, item, key, key);
	}

	private boolean filterEquals(Map<String, Object> filters, Map<String, Object> item, String filterKey, String itemKey) {
		Object value = filters.get(filterKey);
		if (value == null || String.valueOf(value).isBlank()) {
			return true;
		}
		return equalsText(item.get(itemKey), value);
	}

	private boolean filterBoolean(Map<String, Object> filters, Map<String, Object> item, String key) {
		Object value = filters.get(key);
		return value == null || Boolean.parseBoolean(String.valueOf(value)) == Boolean.TRUE.equals(item.get(key));
	}

	private boolean filterMin(Map<String, Object> filters, Map<String, Object> item, String filterKey, String itemKey) {
		Object value = filters.get(filterKey);
		return value == null || number(item, itemKey).doubleValue() >= Double.parseDouble(String.valueOf(value));
	}

	private boolean filterMax(Map<String, Object> filters, Map<String, Object> item, String filterKey, String itemKey) {
		Object value = filters.get(filterKey);
		return value == null || number(item, itemKey).doubleValue() <= Double.parseDouble(String.valueOf(value));
	}

	private boolean filterPhoneSpec(Map<String, Object> filters, Map<String, Object> item, String key) {
		Object value = filters.get(key);
		if (value == null || String.valueOf(value).isBlank()) {
			return true;
		}
		Object specs = item.get("phoneSpecs");
		if (!(specs instanceof Map<?, ?> map)) {
			return false;
		}
		return normalize(String.valueOf(map.get(key))).contains(normalize(String.valueOf(value)));
	}

	private Map<String, Object> find(List<Map<String, Object>> list, String id, String message) {
		return list.stream()
				.filter(item -> equalsText(item.get("id"), id))
				.findFirst()
				.orElseThrow(() -> new NoSuchElementException(message));
	}

	private Map<String, Object> update(List<Map<String, Object>> list, String id, Map<String, Object> input, String message) {
		Map<String, Object> current = find(list, id, message);
		current.putAll(input);
		current.put("updatedAt", now());
		return current;
	}

	private Map<String, Object> productDefaults() {
		return map(
				"description", "",
				"shortDescription", "",
				"images", List.of(),
				"price", 0,
				"status", "Đang bán",
				"condition", "Mới",
				"rating", 0,
				"reviewCount", 0,
				"soldCount", 0,
				"viewCount", 0,
				"variants", List.of(),
				"tags", List.of(),
				"specifications", Map.of(),
				"warranty", 12,
				"isNew", false,
				"isFeatured", false,
				"isHot", false,
				"createdAt", now(),
				"updatedAt", now());
	}

	private Map<String, Object> merge(Map<String, Object> base, Map<String, Object> input) {
		Map<String, Object> result = new LinkedHashMap<>(base);
		input.forEach((key, value) -> {
			if (value != null) {
				result.put(key, value);
			}
		});
		return result;
	}

	private Map<String, Object> map(Object... values) {
		Map<String, Object> map = new LinkedHashMap<>();
		for (int i = 0; i < values.length; i += 2) {
			map.put(String.valueOf(values[i]), values[i + 1]);
		}
		return map;
	}

	private Number number(Map<String, Object> item, String key) {
		Object value = item.get(key);
		if (value instanceof Number number) {
			return number;
		}
		if (value == null || String.valueOf(value).isBlank()) {
			return 0;
		}
		return Double.parseDouble(String.valueOf(value));
	}

	private boolean equalsText(Object left, Object right) {
		return normalize(String.valueOf(left)).equals(normalize(String.valueOf(right)));
	}

	private String normalize(String value) {
		return value == null ? "" : value.toLowerCase(Locale.ROOT)
				.replace("đ", "d")
				.replaceAll("\\p{M}", "")
				.trim();
	}

	private Comparable<?> comparable(Object value) {
		if (value instanceof Comparable<?> comparable) {
			return comparable;
		}
		return String.valueOf(value);
	}

	private int compareValues(Object left, Object right) {
		if (left instanceof Number leftNumber && right instanceof Number rightNumber) {
			return Double.compare(leftNumber.doubleValue(), rightNumber.doubleValue());
		}
		return String.valueOf(left).compareToIgnoreCase(String.valueOf(right));
	}

	private String slug(String value) {
		return normalize(value).replaceAll("[^a-z0-9]+", "-").replaceAll("(^-|-$)", "");
	}

	private String nextId(String prefix) {
		return prefix + "-" + UUID.randomUUID();
	}

	private String now() {
		return Instant.now().toString();
	}

	private Object first(List<?> values) {
		return values == null || values.isEmpty() ? null : values.get(0);
	}

	private int stock(Map<String, Object> product) {
		Object variants = product.get("variants");
		if (!(variants instanceof List<?> list)) {
			return 0;
		}
		return list.stream()
				.filter(Map.class::isInstance)
				.mapToInt(item -> {
					Map<?, ?> variant = (Map<?, ?>) item;
					Object value = variant.get("stock");
					if (value instanceof Number number) {
						return number.intValue();
					}
					return value == null ? 0 : Integer.parseInt(String.valueOf(value));
				})
				.sum();
	}

	private void seed() {
		String iphone = "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600";
		String samsung = "https://images.unsplash.com/photo-1610945264803-c22b62831622?w=600";
		String xiaomi = "https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=600";
		String earbuds = "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600";
		String watch = "https://images.unsplash.com/photo-1544117519-31a4b719223d?w=600";
		String charger = "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=600";
		String caseImg = "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=600";
		String avatar = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100";

		categories.addAll(List.of(
				map("id", "cat-01", "name", "Dien thoai", "parentId", null, "slug", "dien-thoai", "description",
						"Dien thoai thong minh cac hang", "icon", "Smartphone", "isActive", true, "productCount", 6,
						"imageUrl", iphone, "sortOrder", 1, "level", 0, "createdAt", "2024-01-01T00:00:00Z", "updatedAt",
						"2024-01-01T00:00:00Z"),
				map("id", "cat-02", "name", "Phu kien", "parentId", null, "slug", "phu-kien", "description",
						"Op lung, kinh cuong luc, sac", "icon", "Package", "isActive", true, "productCount", 1,
						"imageUrl", caseImg, "sortOrder", 2, "level", 0, "createdAt", "2024-01-01T00:00:00Z", "updatedAt",
						"2024-01-01T00:00:00Z"),
				map("id", "cat-03", "name", "Tai nghe", "parentId", null, "slug", "tai-nghe", "description",
						"Tai nghe co day va khong day", "icon", "Headphones", "isActive", true, "productCount", 1,
						"imageUrl", earbuds, "sortOrder", 3, "level", 0, "createdAt", "2024-01-01T00:00:00Z", "updatedAt",
						"2024-01-01T00:00:00Z"),
				map("id", "cat-04", "name", "Dong ho thong minh", "parentId", null, "slug", "dong-ho-thong-minh",
						"description", "Smartwatch va fitness band", "icon", "Watch", "isActive", true, "productCount", 1,
						"imageUrl", watch, "sortOrder", 4, "level", 0, "createdAt", "2024-01-01T00:00:00Z", "updatedAt",
						"2024-01-01T00:00:00Z"),
				map("id", "cat-05", "name", "Sac va pin du phong", "parentId", null, "slug", "sac-pin-du-phong",
						"description", "Sac nhanh, sac khong day, pin du phong", "icon", "Battery", "isActive", true,
						"productCount", 1, "imageUrl", charger, "sortOrder", 5, "level", 0, "createdAt",
						"2024-01-01T00:00:00Z", "updatedAt", "2024-01-01T00:00:00Z")));

		products.addAll(List.of(
				productSeed("prod-001", "iPhone 16 Pro Max 256GB", "iphone-16-pro-max-256gb", "cat-01", "Dien thoai",
						"Apple", iphone, 34_990_000, 37_990_000, true, true, true, "Apple A18 Pro", "8GB", "256GB", 15),
				productSeed("prod-002", "Samsung Galaxy S25 Ultra 256GB", "samsung-galaxy-s25-ultra-256gb", "cat-01",
						"Dien thoai", "Samsung", samsung, 31_990_000, 35_990_000, true, true, true, "Snapdragon 8 Elite",
						"12GB", "256GB", 20),
				productSeed("prod-003", "Xiaomi 15 Ultra 16GB/512GB", "xiaomi-15-ultra-16gb-512gb", "cat-01",
						"Dien thoai", "Xiaomi", xiaomi, 28_990_000, 31_990_000, true, false, false, "Snapdragon 8 Elite",
						"16GB", "512GB", 18),
				productSeed("prod-007", "AirPods Pro 3 USB-C", "airpods-pro-3-usb-c", "cat-03", "Tai nghe", "Apple",
						earbuds, 6_490_000, 7_190_000, true, false, false, "Apple H2", "", "", 40),
				productSeed("prod-008", "Samsung Galaxy Watch Ultra 47mm", "samsung-galaxy-watch-ultra-47mm", "cat-04",
						"Dong ho thong minh", "Samsung", watch, 11_990_000, 13_990_000, false, false, false, "", "", "", 20),
				productSeed("prod-009", "Sac nhanh Anker 65W GaN USB-C", "sac-nhanh-anker-65w-gan-usb-c", "cat-05",
						"Sac va pin du phong", "Anker", charger, 890_000, 1_090_000, true, false, false, "", "", "", 100),
				productSeed("prod-010", "Op lung iPhone 16 Pro Max Spigen Ultra Hybrid",
						"op-lung-iphone-16-pro-max-spigen-ultra-hybrid", "cat-02", "Phu kien", "Spigen", caseImg, 390_000,
						490_000, false, false, false, "", "", "", 200)));

		users.addAll(List.of(
				map("id", "user-001", "fullName", "Nguyen Van An", "email", "admin@cellphones.vn", "phone", "0901234567",
						"role", "Quản trị viên", "status", "Hoạt động", "avatarUrl", avatar, "loyaltyPoints", 0,
						"totalOrders", 0, "totalSpent", 0, "emailVerified", true, "createdAt", "2024-01-01T00:00:00Z",
						"updatedAt", "2024-01-01T00:00:00Z"),
				map("id", "user-002", "fullName", "Tran Thi Minh", "email", "khachhang@gmail.com", "phone", "0912345678",
						"role", "Khách hàng", "status", "Hoạt động", "avatarUrl", avatar, "loyaltyPoints", 2500,
						"totalOrders", 8, "totalSpent", 85_000_000, "emailVerified", true, "createdAt", "2024-03-15T00:00:00Z",
						"updatedAt", "2025-01-15T00:00:00Z")));

		orders.addAll(List.of(
				map("id", "ord-001", "orderNumber", "CP2025031501", "customerId", "user-002", "customerName", "Tran Thi Minh",
						"customerEmail", "khachhang@gmail.com", "customerPhone", "0912345678", "items", List.of(orderItem("oi-001",
								"prod-001", "iPhone 16 Pro Max 256GB", iphone, "Apple", 1, 34_990_000)),
						"subtotal", 34_990_000, "shippingFee", 0, "discount", 1_500_000, "totalAmount", 33_490_000, "status",
						"Đã giao", "shippingAddress", "123 Nguyen Hue, Quan 1, TP.HCM", "paymentMethod", "Chuyển khoản",
						"paymentStatus", "Da thanh toan", "notes", "", "createdAt", "2025-03-15T10:30:00Z", "updatedAt",
						"2025-03-16T15:00:00Z"),
				map("id", "ord-002", "orderNumber", "CP2025031801", "customerId", "user-002", "customerName", "Tran Thi Minh",
						"customerEmail", "khachhang@gmail.com", "customerPhone", "0912345678", "items", List.of(orderItem("oi-002",
								"prod-002", "Samsung Galaxy S25 Ultra 256GB", samsung, "Samsung", 1, 31_990_000)),
						"subtotal", 31_990_000, "shippingFee", 0, "discount", 0, "totalAmount", 31_990_000, "status",
						"Đang giao hàng", "shippingAddress", "456 Le Loi, Quan 3, TP.HCM", "paymentMethod", "COD",
						"paymentStatus", "Chưa thanh toán", "notes", "", "createdAt", "2025-03-18T09:00:00Z", "updatedAt",
						"2025-03-19T08:00:00Z")));

		reviews.addAll(List.of(
				map("id", "rev-001", "productId", "prod-001", "productName", "iPhone 16 Pro Max 256GB", "userId",
						"user-002", "userName", "Tran Thi Minh", "rating", 5, "title", "May tot", "comment",
						"Camera chup dep, pin tot, hieu nang manh.", "status", "Hien thi", "isVerifiedPurchase", true,
						"helpfulCount", 48, "images", List.of(iphone), "tags", List.of("Chat luong", "Camera"), "createdAt",
						"2025-03-16T10:00:00Z")));

		promotions.addAll(List.of(
				map("id", "promo-001", "code", "NEWPHONE", "name", "Giam 1.5 trieu dien thoai moi", "description",
						"Giam 1,500,000d cho don hang dien thoai tu 15 trieu", "type", "So tien", "value", 1_500_000,
						"minOrderValue", 15_000_000, "maxDiscount", 1_500_000, "startDate", "2025-03-01T00:00:00Z",
						"endDate", "2026-12-31T23:59:59Z", "usageLimit", 500, "usedCount", 127, "applicableProducts",
						List.of(), "applicableCategories", List.of("cat-01"), "applicableBrands", List.of(), "isActive", true,
						"createdAt", "2025-03-01T00:00:00Z"),
				map("id", "promo-003", "code", "FREESHIP", "name", "Mien phi van chuyen", "description",
						"Mien phi van chuyen cho moi don hang", "type", "Mien phi van chuyen", "value", 0, "minOrderValue",
						500_000, "maxDiscount", 50_000, "startDate", "2025-01-01T00:00:00Z", "endDate",
						"2026-12-31T23:59:59Z", "usageLimit", 9999, "usedCount", 1240, "applicableProducts", List.of(),
						"applicableCategories", List.of(), "applicableBrands", List.of(), "isActive", true, "createdAt",
						"2025-01-01T00:00:00Z")));

		wishlistItems.add(map("id", "wl-001", "userId", "user-002", "productId", "prod-002", "productName",
				"Samsung Galaxy S25 Ultra 256GB", "productImage", samsung, "brand", "Samsung", "categoryName", "Dien thoai",
				"price", 31_990_000, "originalPrice", 35_990_000, "stock", 20, "addedAt", "2025-03-01T00:00:00Z",
				"priceAlert", 29_000_000));

		notifications.addAll(List.of(
				map("id", "n1", "type", "order", "title", "Don hang dang giao", "message",
						"Don hang CP2025031801 dang duoc giao den ban", "isRead", false, "createdAt", now(), "priority",
						"high", "category", "giao_dich", "isActionable", true, "actionLabel", "Theo doi", "actionUrl",
						"/orders/ord-002", "entityType", "order", "entityId", "ord-002", "link", "/orders/ord-002")));

		blogPosts.addAll(List.of(
				map("id", "blog-001", "title", "iPhone 16 Pro Max vs Samsung Galaxy S25 Ultra", "slug",
						"iphone-16-pro-max-vs-samsung-s25-ultra", "excerpt", "So sanh hai flagship hang dau.", "content", "...",
						"coverImage", iphone, "category", "So sanh", "tags", List.of("iPhone", "Samsung"), "author",
						"Bien tap CELLPHONES", "publishedAt", "2025-03-15T08:00:00Z", "viewCount", 45200, "isPublished",
						true, "relatedProducts", List.of("prod-001", "prod-002"))));

		stores.addAll(List.of(
				map("id", "store-001", "name", "CELLPHONES Nguyen Dinh Chieu", "address", "200 Nguyen Dinh Chieu",
						"district", "Quan 3", "city", "TP.HCM", "phone", "1800.2097", "workingHours", "8:00 - 21:30",
						"isActive", true, "mapUrl", "https://maps.google.com"),
				map("id", "store-002", "name", "CELLPHONES Cau Giay", "address", "79 Cau Giay", "district", "Cau Giay",
						"city", "Ha Noi", "phone", "1800.2097", "workingHours", "8:00 - 21:30", "isActive", true,
						"mapUrl", "https://maps.google.com")));
	}

	private Map<String, Object> productSeed(String id, String name, String slug, String categoryId, String categoryName,
			String brand, String image, int price, int originalPrice, boolean featured, boolean isNew, boolean hot,
			String chip, String ram, String storage, int stock) {
		return map("id", id, "name", name, "slug", slug, "description", name + " chinh hang, bao hanh day du.",
				"shortDescription", chip.isBlank() ? "Hang chinh hang | Gia tot" : chip + " | " + ram + " | " + storage,
				"categoryId", categoryId, "categoryName", categoryName, "brand", brand, "images", List.of(image), "price", price,
				"originalPrice", originalPrice, "discountPercent", Math.round((1 - price / (double) originalPrice) * 100),
				"status", "Đang bán", "condition", "Mới", "rating", 4.8, "reviewCount", 125, "soldCount", 1200,
				"viewCount", 5000, "variants", List.of(map("id", "v-" + id, "name", storage.isBlank() ? "Mac dinh" : storage,
						"sku", id.toUpperCase(Locale.ROOT), "price", price, "originalPrice", originalPrice, "stock", stock,
						"color", "Den", "storage", storage, "ram", ram, "isActive", true)),
				"tags", List.of(brand, categoryName), "specifications", map("Chip", chip, "RAM", ram, "Bo nho", storage),
				"phoneSpecs", chip.isBlank() ? null : map("chip", chip, "ram", ram, "storage", storage, "battery", "5000mAh",
						"camera", "50MP", "frontCamera", "12MP", "screen", "6.7 inch 120Hz", "os", "Android/iOS",
						"connectivity", "5G, WiFi, Bluetooth"),
				"warranty", 12, "color", "Den", "isNew", isNew, "isFeatured", featured, "isHot", hot, "createdAt",
				"2025-01-01T00:00:00Z", "updatedAt", "2025-03-01T00:00:00Z");
	}

	private Map<String, Object> orderItem(String id, String productId, String productName, String image, String brand,
			int quantity, int unitPrice) {
		return map("id", id, "productId", productId, "productName", productName, "productImage", image, "brand", brand,
				"quantity", quantity, "unitPrice", unitPrice, "totalPrice", quantity * unitPrice);
	}
}

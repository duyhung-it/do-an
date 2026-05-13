package com.b2b.ecommerce.catalog;

import java.math.BigDecimal;
import java.text.Normalizer;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
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
public class CatalogService {
	private final List<CategoryDto> categories = new CopyOnWriteArrayList<>();
	private final List<SupplierDto> suppliers = new CopyOnWriteArrayList<>();
	private final List<ProductDto> products = new CopyOnWriteArrayList<>();

	public CatalogService() {
		seed();
	}

	public List<CategoryDto> categoryTree() {
		List<CategoryDto> roots = categories.stream()
				.filter(category -> category.parentId() == null)
				.sorted(Comparator.comparingInt(CategoryDto::sortOrder))
				.map(this::attachChildren)
				.toList();
		return roots;
	}

	public CategoryDto category(String id) {
		return categories.stream()
				.filter(category -> category.id().equals(id))
				.findFirst()
				.orElseThrow(() -> new NoSuchElementException("Khong tim thay danh muc"));
	}

	public CategoryDto createCategory(CategoryRequest request) {
		String id = "cat-" + UUID.randomUUID();
		int level = request.parentId() == null ? 0 : category(request.parentId()).level() + 1;
		CategoryDto category = new CategoryDto(id, request.name(), slugify(request.name()), request.parentId(),
				request.description(), request.icon(), request.isActive() == null || request.isActive(), null,
				request.sortOrder() == null ? categories.size() + 1 : request.sortOrder(), level, null, 0, List.of());
		categories.add(category);
		return category;
	}

	public CategoryDto updateCategory(String id, CategoryRequest request) {
		CategoryDto current = category(id);
		CategoryDto updated = new CategoryDto(id, request.name(), slugify(request.name()), request.parentId(),
				request.description(), request.icon(), request.isActive() == null || request.isActive(), current.imageUrl(),
				request.sortOrder() == null ? current.sortOrder() : request.sortOrder(), current.level(), current.path(),
				current.productCount(), List.of());
		replace(categories, current, updated);
		return updated;
	}

	public void deleteCategory(String id) {
		if (products.stream().anyMatch(product -> product.categoryId().equals(id))) {
			throw new IllegalArgumentException("Danh muc dang co san pham");
		}
		categories.remove(category(id));
	}

	public List<SupplierDto> suppliers(PageRequestParams params, String city, Boolean verified) {
		return page(sortSuppliers(filterSuppliers(params.search(), city, verified), params), params);
	}

	public int supplierCount(String search, String city, Boolean verified) {
		return filterSuppliers(search, city, verified).size();
	}

	public SupplierDto supplier(String id) {
		return suppliers.stream()
				.filter(supplier -> supplier.id().equals(id))
				.findFirst()
				.orElseThrow(() -> new NoSuchElementException("Khong tim thay nha cung cap"));
	}

	public SupplierDto createSupplier(SupplierRequest request) {
		String now = Instant.now().toString();
		SupplierDto supplier = new SupplierDto("sup-" + UUID.randomUUID(), request.companyName(), request.contactPerson(),
				request.email(), request.phone(), request.address(), valueOrDefault(request.city(), "Ho Chi Minh"),
				valueOrDefault(request.country(), "Viet Nam"), request.logoUrl(), request.coverUrl(), request.description(),
				BigDecimal.ZERO, 0, 0, valueOrDefault(request.minOrderValue(), BigDecimal.ZERO),
				request.avgDeliveryDays() == null ? 3 : request.avgDeliveryDays(), BigDecimal.ZERO, false, now,
				request.employees(), valueOrDefault(request.categoryIds(), List.of()), now);
		suppliers.add(supplier);
		return supplier;
	}

	public SupplierDto verifySupplier(String id, boolean verified) {
		SupplierDto current = supplier(id);
		SupplierDto updated = new SupplierDto(current.id(), current.companyName(), current.contactPerson(), current.email(),
				current.phone(), current.address(), current.city(), current.country(), current.logoUrl(), current.coverUrl(),
				current.description(), current.rating(), current.reviewCount(), current.productCount(), current.minOrderValue(),
				current.avgDeliveryDays(), current.onTimeRate(), verified, current.joinedDate(), current.employees(),
				current.categoryIds(), current.createdAt());
		replace(suppliers, current, updated);
		return updated;
	}

	public List<ProductDto> products(PageRequestParams params, String categoryId, String supplierId, String status,
			BigDecimal minPrice, BigDecimal maxPrice, Boolean featured) {
		return page(sortProducts(filterProducts(params.search(), categoryId, supplierId, status, minPrice, maxPrice, featured),
				params), params);
	}

	public int productCount(String search, String categoryId, String supplierId, String status, BigDecimal minPrice,
			BigDecimal maxPrice, Boolean featured) {
		return filterProducts(search, categoryId, supplierId, status, minPrice, maxPrice, featured).size();
	}

	public ProductDto product(String id) {
		return products.stream()
				.filter(product -> product.id().equals(id))
				.findFirst()
				.orElseThrow(() -> new NoSuchElementException("Khong tim thay san pham"));
	}

	public ProductDto createProduct(ProductRequest request) {
		CategoryDto category = category(request.categoryId());
		SupplierDto supplier = supplier(request.supplierId() == null ? "sup-001" : request.supplierId());
		String now = Instant.now().toString();
		ProductDto product = new ProductDto("prod-" + UUID.randomUUID(), request.name(), slugify(request.name()),
				request.description(), category.id(), category.name(), supplier.id(), supplier.companyName(), request.price(),
				request.originalPrice(), request.stock() == null ? 0 : request.stock(), valueOrDefault(request.unit(), "Cai"),
				request.minOrderQty() == null ? 1 : request.minOrderQty(), valueOrDefault(request.images(), List.of()),
				valueOrDefault(request.specifications(), Map.of()), valueOrDefault(request.tags(), List.of()),
				valueOrDefault(request.status(), "pending"), true, request.brandName(), request.origin(), request.weight(),
				request.dimensions(), request.warrantyMonths(), 0, 0, Boolean.TRUE.equals(request.featured()), BigDecimal.ZERO,
				0, now, now);
		products.add(product);
		return product;
	}

	public ProductDto updateProduct(String id, ProductRequest request) {
		ProductDto current = product(id);
		ProductDto updated = createProductLike(id, request, current.createdAt());
		replace(products, current, updated);
		return updated;
	}

	public ProductDto updateProductStatus(String id, String status) {
		ProductDto current = product(id);
		ProductDto updated = new ProductDto(current.id(), current.name(), current.slug(), current.description(),
				current.categoryId(), current.categoryName(), current.supplierId(), current.supplierName(), current.price(),
				current.originalPrice(), current.stock(), current.unit(), current.minOrderQty(), current.images(),
				current.specifications(), current.tags(), status, current.isActive(), current.brandName(), current.origin(),
				current.weight(), current.dimensions(), current.warrantyMonths(), current.viewCount(), current.soldCount(),
				current.featured(), current.rating(), current.reviewCount(), current.createdAt(), Instant.now().toString());
		replace(products, current, updated);
		return updated;
	}

	public void deleteProduct(String id) {
		products.remove(product(id));
	}

	private ProductDto createProductLike(String id, ProductRequest request, String createdAt) {
		CategoryDto category = category(request.categoryId());
		SupplierDto supplier = supplier(request.supplierId() == null ? "sup-001" : request.supplierId());
		return new ProductDto(id, request.name(), slugify(request.name()), request.description(), category.id(),
				category.name(), supplier.id(), supplier.companyName(), request.price(), request.originalPrice(),
				request.stock() == null ? 0 : request.stock(), valueOrDefault(request.unit(), "Cai"),
				request.minOrderQty() == null ? 1 : request.minOrderQty(), valueOrDefault(request.images(), List.of()),
				valueOrDefault(request.specifications(), Map.of()), valueOrDefault(request.tags(), List.of()),
				valueOrDefault(request.status(), "pending"), true, request.brandName(), request.origin(), request.weight(),
				request.dimensions(), request.warrantyMonths(), 0, 0, Boolean.TRUE.equals(request.featured()), BigDecimal.ZERO,
				0, createdAt, Instant.now().toString());
	}

	private CategoryDto attachChildren(CategoryDto parent) {
		List<CategoryDto> children = categories.stream()
				.filter(category -> parent.id().equals(category.parentId()))
				.sorted(Comparator.comparingInt(CategoryDto::sortOrder))
				.map(this::attachChildren)
				.toList();
		return parent.withChildren(children);
	}

	private List<SupplierDto> filterSuppliers(String search, String city, Boolean verified) {
		return suppliers.stream()
				.filter(matches(search, supplier -> supplier.companyName() + " " + supplier.contactPerson()))
				.filter(supplier -> city == null || city.equalsIgnoreCase(supplier.city()))
				.filter(supplier -> verified == null || verified == supplier.isVerified())
				.toList();
	}

	private List<ProductDto> filterProducts(String search, String categoryId, String supplierId, String status,
			BigDecimal minPrice, BigDecimal maxPrice, Boolean featured) {
		return products.stream()
				.filter(matches(search, product -> product.name() + " " + product.brandName()))
				.filter(product -> categoryId == null || categoryId.equals(product.categoryId()))
				.filter(product -> supplierId == null || supplierId.equals(product.supplierId()))
				.filter(product -> status == null || status.equalsIgnoreCase(product.status()))
				.filter(product -> minPrice == null || product.price().compareTo(minPrice) >= 0)
				.filter(product -> maxPrice == null || product.price().compareTo(maxPrice) <= 0)
				.filter(product -> featured == null || featured == product.featured())
				.toList();
	}

	private List<SupplierDto> sortSuppliers(List<SupplierDto> items, PageRequestParams params) {
		Comparator<SupplierDto> comparator = switch (valueOrDefault(params.sortField(), "createdAt")) {
			case "companyName" -> Comparator.comparing(SupplierDto::companyName, String.CASE_INSENSITIVE_ORDER);
			case "rating" -> Comparator.comparing(SupplierDto::rating);
			case "productCount" -> Comparator.comparingInt(SupplierDto::productCount);
			default -> Comparator.comparing(SupplierDto::createdAt);
		};
		return sort(items, comparator, params);
	}

	private List<ProductDto> sortProducts(List<ProductDto> items, PageRequestParams params) {
		Comparator<ProductDto> comparator = switch (valueOrDefault(params.sortField(), "createdAt")) {
			case "name" -> Comparator.comparing(ProductDto::name, String.CASE_INSENSITIVE_ORDER);
			case "price" -> Comparator.comparing(ProductDto::price);
			case "rating" -> Comparator.comparing(ProductDto::rating);
			case "soldCount" -> Comparator.comparingInt(ProductDto::soldCount);
			default -> Comparator.comparing(ProductDto::createdAt);
		};
		return sort(items, comparator, params);
	}

	private <T> List<T> sort(List<T> items, Comparator<T> comparator, PageRequestParams params) {
		Comparator<T> effectiveComparator = params.ascending() ? comparator : comparator.reversed();
		return items.stream().sorted(effectiveComparator).toList();
	}

	private <T> List<T> page(List<T> items, PageRequestParams params) {
		int page = params.normalizedPage();
		int pageSize = params.normalizedPageSize();
		int from = Math.min((page - 1) * pageSize, items.size());
		int to = Math.min(from + pageSize, items.size());
		return new ArrayList<>(items.subList(from, to));
	}

	private <T> Predicate<T> matches(String search, java.util.function.Function<T, String> text) {
		if (search == null || search.isBlank()) {
			return ignored -> true;
		}
		String needle = normalize(search);
		return item -> normalize(text.apply(item)).contains(needle);
	}

	private String slugify(String value) {
		return normalize(value).replaceAll("[^a-z0-9]+", "-").replaceAll("(^-|-$)", "");
	}

	private String normalize(String value) {
		return Normalizer.normalize(value == null ? "" : value, Normalizer.Form.NFD)
				.replaceAll("\\p{M}", "")
				.toLowerCase(Locale.ROOT);
	}

	private <T> T valueOrDefault(T value, T defaultValue) {
		return value == null ? defaultValue : value;
	}

	private <T> void replace(List<T> list, T current, T updated) {
		int index = list.indexOf(current);
		list.set(index, updated);
	}

	private void seed() {
		categories.add(new CategoryDto("cat-001", "Dien tu", "dien-tu", null, "Thiet bi dien tu", "Monitor", true,
				null, 1, 0, "dien-tu", 2, List.of()));
		categories.add(new CategoryDto("cat-002", "Dien thoai", "dien-thoai", "cat-001", "Smartphone", "Smartphone",
				true, null, 1, 1, "dien-tu/dien-thoai", 1, List.of()));
		categories.add(new CategoryDto("cat-003", "Laptop", "laptop", "cat-001", "May tinh xach tay", "Laptop", true,
				null, 2, 1, "dien-tu/laptop", 1, List.of()));

		suppliers.add(new SupplierDto("sup-001", "Cong ty TNHH Dell VN", "Tran Thi B", "seller@example.com",
				"0900000001", "123 Nguyen Hue", "Ho Chi Minh", "Viet Nam", null, null, "Nha cung cap thiet bi CNTT",
				BigDecimal.valueOf(4.7), 32, 2, BigDecimal.valueOf(5_000_000), 3, BigDecimal.valueOf(96.5), true,
				"2026-01-01T00:00:00Z", 120, List.of("cat-001", "cat-003"), "2026-01-01T00:00:00Z"));

		products.add(new ProductDto("prod-001", "Laptop Dell XPS 15", "laptop-dell-xps-15", "Laptop hieu nang cao",
				"cat-003", "Laptop", "sup-001", "Cong ty TNHH Dell VN", BigDecimal.valueOf(35_000_000),
				BigDecimal.valueOf(38_000_000), 50, "Cai", 1, List.of(), Map.of("CPU", "Intel Core i7", "RAM", "16GB"),
				List.of("laptop", "dell"), "active", true, "Dell", "USA", 1800, "34x23x2 cm", 12, 1250, 87, true,
				BigDecimal.valueOf(4.5), 32, "2026-01-10T00:00:00Z", "2026-01-10T00:00:00Z"));
		products.add(new ProductDto("prod-002", "Dien thoai Samsung Galaxy S25", "dien-thoai-samsung-galaxy-s25",
				"Smartphone Android", "cat-002", "Dien thoai", "sup-001", "Cong ty TNHH Dell VN",
				BigDecimal.valueOf(22_000_000), null, 120, "Cai", 5, List.of(), Map.of("Storage", "256GB"),
				List.of("phone", "samsung"), "active", true, "Samsung", "Vietnam", 190, null, 12, 730, 112, false,
				BigDecimal.valueOf(4.3), 21, "2026-02-01T00:00:00Z", "2026-02-01T00:00:00Z"));
	}
}

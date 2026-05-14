package com.b2b.ecommerce.catalog;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import com.b2b.ecommerce.common.ApiResponse;
import com.b2b.ecommerce.common.PageRequestParams;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1")
public class CatalogController {
	private final CatalogService catalog;

	public CatalogController(CatalogService catalog) {
		this.catalog = catalog;
	}

	@GetMapping("/categories")
	public ApiResponse<List<CategoryDto>> categories(@RequestParam(defaultValue = "false") boolean includeInactive) {
		return ApiResponse.ok(catalog.categoryTree(includeInactive));
	}

	@GetMapping("/categories/{id}")
	public ApiResponse<CategoryDto> category(@PathVariable String id) {
		return ApiResponse.ok(catalog.category(id));
	}

	@GetMapping("/categories/{slug}/by-slug")
	public ApiResponse<CategoryDto> categoryBySlug(@PathVariable String slug) {
		return ApiResponse.ok(catalog.categoryBySlug(slug));
	}

	@PostMapping("/admin/categories")
	public ResponseEntity<ApiResponse<CategoryDto>> createCategory(@Valid @RequestBody CategoryRequest request) {
		return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(catalog.createCategory(request)));
	}

	@PatchMapping("/admin/categories/{id}")
	public ApiResponse<CategoryDto> updateCategory(@PathVariable String id, @Valid @RequestBody CategoryRequest request) {
		return ApiResponse.ok(catalog.updateCategory(id, request));
	}

	@DeleteMapping("/admin/categories/{id}")
	public ResponseEntity<Void> deleteCategory(@PathVariable String id) {
		catalog.deleteCategory(id);
		return ResponseEntity.noContent().build();
	}

	@GetMapping("/products")
	public ApiResponse<List<ProductDto>> products(
			@RequestParam(defaultValue = "1") int page,
			@RequestParam(defaultValue = "20") int pageSize,
			@RequestParam(required = false) String sortBy,
			@RequestParam(defaultValue = "desc") String sortDir,
			@RequestParam(required = false) String search,
			@RequestParam(required = false) String categoryId,
			@RequestParam(required = false) String categorySlug,
			@RequestParam(required = false) String brand,
			@RequestParam(defaultValue = "ACTIVE") String status,
			@RequestParam(required = false) String condition,
			@RequestParam(required = false) BigDecimal minPrice,
			@RequestParam(required = false) BigDecimal maxPrice,
			@RequestParam(required = false) String color,
			@RequestParam(required = false) Boolean isFeatured,
			@RequestParam(required = false) Boolean isNew,
			@RequestParam(required = false) Boolean isHot) {
		PageRequestParams params = new PageRequestParams(page, pageSize, search, sortBy, sortDir);
		CatalogService.ProductFilter filter = new CatalogService.ProductFilter(search, uuid(categoryId), categorySlug, brand,
				parse(ProductStatus.class, status), parse(ProductCondition.class, condition), minPrice, maxPrice, color,
				isFeatured, isNew, isHot);
		Page<ProductDto> result = catalog.products(params, filter);
		return ApiResponse.page(result.getContent(), (int) result.getTotalElements(), params.normalizedPage(),
				params.normalizedPageSize());
	}

	@GetMapping("/products/{id}")
	public ApiResponse<ProductDto> product(@PathVariable String id) {
		return ApiResponse.ok(catalog.product(id));
	}

	@GetMapping("/products/{slug}/by-slug")
	public ApiResponse<ProductDto> productBySlug(@PathVariable String slug) {
		return ApiResponse.ok(catalog.productBySlug(slug));
	}

	@GetMapping("/products/{id}/similar")
	public ApiResponse<List<ProductDto>> similarProducts(@PathVariable String id, @RequestParam(defaultValue = "8") int limit) {
		return ApiResponse.ok(catalog.similarProducts(id, limit));
	}

	@GetMapping("/products/{id}/accessories")
	public ApiResponse<List<ProductDto>> accessories(@PathVariable String id, @RequestParam(defaultValue = "8") int limit) {
		return ApiResponse.ok(catalog.accessories(id, limit));
	}

	@GetMapping("/products/featured")
	public ApiResponse<List<ProductDto>> featured(@RequestParam(defaultValue = "8") int limit) {
		return ApiResponse.ok(catalog.featured(limit));
	}

	@GetMapping("/products/hot")
	public ApiResponse<List<ProductDto>> hot(@RequestParam(defaultValue = "6") int limit) {
		return ApiResponse.ok(catalog.hot(limit));
	}

	@GetMapping("/products/new")
	public ApiResponse<List<ProductDto>> newest(@RequestParam(defaultValue = "6") int limit) {
		return ApiResponse.ok(catalog.newest(limit));
	}

	@GetMapping("/products/brands")
	public ApiResponse<List<String>> brands() {
		return ApiResponse.ok(catalog.brands());
	}

	@PostMapping("/admin/products")
	public ResponseEntity<ApiResponse<ProductDto>> createProduct(@Valid @RequestBody ProductRequest request) {
		return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(catalog.createProduct(request)));
	}

	@PatchMapping("/admin/products/{id}")
	public ApiResponse<ProductDto> updateProduct(@PathVariable String id, @Valid @RequestBody ProductRequest request) {
		return ApiResponse.ok(catalog.updateProduct(id, request));
	}

	@DeleteMapping("/admin/products/{id}")
	public ResponseEntity<Void> deleteProduct(@PathVariable String id) {
		catalog.deleteProduct(id);
		return ResponseEntity.noContent().build();
	}

	@GetMapping("/products/{productId}/variants")
	public ApiResponse<List<ProductVariantDto>> variants(@PathVariable String productId) {
		return ApiResponse.ok(catalog.productVariants(productId));
	}

	@PostMapping("/admin/products/{productId}/variants")
	public ResponseEntity<ApiResponse<ProductVariantDto>> createVariant(
			@PathVariable String productId,
			@Valid @RequestBody ProductVariantRequest request) {
		return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(catalog.createVariant(productId, request)));
	}

	@PatchMapping("/admin/products/{productId}/variants/{id}")
	public ApiResponse<ProductVariantDto> updateVariant(
			@PathVariable String productId,
			@PathVariable String id,
			@Valid @RequestBody ProductVariantRequest request) {
		return ApiResponse.ok(catalog.updateVariant(productId, id, request));
	}

	@DeleteMapping("/admin/products/{productId}/variants/{id}")
	public ResponseEntity<Void> deleteVariant(@PathVariable String productId, @PathVariable String id) {
		catalog.deleteVariant(productId, id);
		return ResponseEntity.noContent().build();
	}

	@GetMapping("/products/{productId}/images")
	public ApiResponse<List<ProductImageDto>> images(@PathVariable String productId) {
		return ApiResponse.ok(catalog.productImages(productId));
	}

	@PostMapping("/admin/products/{productId}/images")
	public ResponseEntity<ApiResponse<ProductImageDto>> createImage(
			@PathVariable String productId,
			@Valid @RequestBody ProductImageRequest request) {
		return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(catalog.createImage(productId, request)));
	}

	@PatchMapping("/admin/products/{productId}/images/{id}")
	public ApiResponse<ProductImageDto> updateImage(
			@PathVariable String productId,
			@PathVariable String id,
			@Valid @RequestBody ProductImageRequest request) {
		return ApiResponse.ok(catalog.updateImage(productId, id, request));
	}

	@DeleteMapping("/admin/products/{productId}/images/{id}")
	public ResponseEntity<Void> deleteImage(@PathVariable String productId, @PathVariable String id) {
		catalog.deleteImage(productId, id);
		return ResponseEntity.noContent().build();
	}

	private UUID uuid(String value) {
		return value == null || value.isBlank() ? null : UUID.fromString(value);
	}

	private <T extends Enum<T>> T parse(Class<T> type, String value) {
		return value == null || value.isBlank() ? null : Enum.valueOf(type, value.trim().toUpperCase());
	}
}

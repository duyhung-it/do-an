package com.b2b.ecommerce.catalog;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

import com.b2b.ecommerce.common.ApiResponse;
import com.b2b.ecommerce.common.PageRequestParams;
import jakarta.validation.Valid;
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
@RequestMapping("/api/v1/products")
public class ProductController {
	private final CatalogService catalogService;

	public ProductController(CatalogService catalogService) {
		this.catalogService = catalogService;
	}

	@GetMapping
	public ApiResponse<List<ProductDto>> all(
			@RequestParam(defaultValue = "1") int page,
			@RequestParam(defaultValue = "20") int pageSize,
			@RequestParam(required = false) String search,
			@RequestParam(required = false) String categoryId,
			@RequestParam(required = false) String supplierId,
			@RequestParam(required = false) String status,
			@RequestParam(required = false) BigDecimal minPrice,
			@RequestParam(required = false) BigDecimal maxPrice,
			@RequestParam(required = false) Boolean featured,
			@RequestParam(required = false) String sortField,
			@RequestParam(defaultValue = "desc") String sortOrder) {
		PageRequestParams params = new PageRequestParams(page, pageSize, search, sortField, sortOrder);
		return ApiResponse.page(catalogService.products(params, categoryId, supplierId, status, minPrice, maxPrice, featured),
				catalogService.productCount(search, categoryId, supplierId, status, minPrice, maxPrice, featured),
				params.normalizedPage(), params.normalizedPageSize());
	}

	@GetMapping("/{id}")
	public ApiResponse<ProductDto> one(@PathVariable String id) {
		return ApiResponse.ok(catalogService.product(id));
	}

	@PostMapping
	public ResponseEntity<ApiResponse<ProductDto>> create(@Valid @RequestBody ProductRequest request) {
		return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(catalogService.createProduct(request)));
	}

	@PutMapping("/{id}")
	public ApiResponse<ProductDto> update(@PathVariable String id, @Valid @RequestBody ProductRequest request) {
		return ApiResponse.ok(catalogService.updateProduct(id, request));
	}

	@PatchMapping("/{id}/status")
	public ApiResponse<ProductDto> status(@PathVariable String id, @RequestBody Map<String, String> body) {
		return ApiResponse.ok(catalogService.updateProductStatus(id, body.get("status")));
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<Void> delete(@PathVariable String id) {
		catalogService.deleteProduct(id);
		return ResponseEntity.noContent().build();
	}
}

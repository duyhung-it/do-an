package com.b2b.ecommerce.catalog;

import java.util.List;

import com.b2b.ecommerce.common.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/categories")
public class CategoryController {
	private final CatalogService catalogService;

	public CategoryController(CatalogService catalogService) {
		this.catalogService = catalogService;
	}

	@GetMapping
	public ApiResponse<List<CategoryDto>> all() {
		return ApiResponse.ok(catalogService.categoryTree());
	}

	@GetMapping("/{id}")
	public ApiResponse<CategoryDto> one(@PathVariable String id) {
		return ApiResponse.ok(catalogService.category(id));
	}

	@PostMapping
	public ResponseEntity<ApiResponse<CategoryDto>> create(@Valid @RequestBody CategoryRequest request) {
		return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(catalogService.createCategory(request)));
	}

	@PutMapping("/{id}")
	public ApiResponse<CategoryDto> update(@PathVariable String id, @Valid @RequestBody CategoryRequest request) {
		return ApiResponse.ok(catalogService.updateCategory(id, request));
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<Void> delete(@PathVariable String id) {
		catalogService.deleteCategory(id);
		return ResponseEntity.noContent().build();
	}
}

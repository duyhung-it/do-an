package com.b2b.ecommerce.catalog;

import java.util.List;
import java.util.Map;

import com.b2b.ecommerce.common.ApiResponse;
import com.b2b.ecommerce.common.PageRequestParams;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/suppliers")
public class SupplierController {
	private final CatalogService catalogService;

	public SupplierController(CatalogService catalogService) {
		this.catalogService = catalogService;
	}

	@GetMapping
	public ApiResponse<List<SupplierDto>> all(
			@RequestParam(defaultValue = "1") int page,
			@RequestParam(defaultValue = "20") int pageSize,
			@RequestParam(required = false) String search,
			@RequestParam(required = false) String city,
			@RequestParam(required = false) Boolean isVerified,
			@RequestParam(required = false) String sortField,
			@RequestParam(defaultValue = "desc") String sortOrder) {
		PageRequestParams params = new PageRequestParams(page, pageSize, search, sortField, sortOrder);
		return ApiResponse.page(catalogService.suppliers(params, city, isVerified),
				catalogService.supplierCount(search, city, isVerified), params.normalizedPage(), params.normalizedPageSize());
	}

	@GetMapping("/{id}")
	public ApiResponse<SupplierDto> one(@PathVariable String id) {
		return ApiResponse.ok(catalogService.supplier(id));
	}

	@PostMapping
	public ResponseEntity<ApiResponse<SupplierDto>> create(@Valid @RequestBody SupplierRequest request) {
		return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(catalogService.createSupplier(request)));
	}

	@PatchMapping("/{id}/verify")
	public ApiResponse<SupplierDto> verify(@PathVariable String id, @RequestBody Map<String, Object> body) {
		return ApiResponse.ok(catalogService.verifySupplier(id, Boolean.TRUE.equals(body.get("isVerified"))));
	}
}

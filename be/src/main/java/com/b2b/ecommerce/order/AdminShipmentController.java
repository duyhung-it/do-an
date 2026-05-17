package com.b2b.ecommerce.order;

import java.util.List;

import com.b2b.ecommerce.common.ApiResponse;
import com.b2b.ecommerce.common.PageRequestParams;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
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
@RequestMapping("/api/v1/admin/shipments")
public class AdminShipmentController {
	private final OrderService orders;

	public AdminShipmentController(OrderService orders) {
		this.orders = orders;
	}

	@GetMapping
	public ApiResponse<List<ShipmentDto>> shipments(
			@RequestParam(defaultValue = "1") int page,
			@RequestParam(defaultValue = "20") int pageSize,
			@RequestParam(required = false) String status,
			@RequestParam(required = false) String search) {
		PageRequestParams params = new PageRequestParams(page, pageSize, search, "createdAt", "desc");
		Page<ShipmentDto> result = orders.adminShipments(params, status);
		return ApiResponse.page(result.getContent(), (int) result.getTotalElements(), params.normalizedPage(),
				Math.min(params.normalizedPageSize(), 100));
	}

	@GetMapping("/{id}")
	public ApiResponse<ShipmentDto> shipment(@PathVariable String id) {
		return ApiResponse.ok(orders.adminShipment(id));
	}

	@PostMapping
	public ResponseEntity<ApiResponse<ShipmentDto>> create(@Valid @RequestBody CreateShipmentRequest request) {
		return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(orders.createAdminShipment(request)));
	}

	@PatchMapping("/{id}")
	public ApiResponse<ShipmentDto> updateTracking(
			@PathVariable String id,
			@Valid @RequestBody UpdateShipmentTrackingRequest request) {
		return ApiResponse.ok(orders.updateShipmentTracking(id, request));
	}

	@PatchMapping("/{id}/tracking")
	public ApiResponse<ShipmentDto> updateTrackingAlias(
			@PathVariable String id,
			@Valid @RequestBody UpdateShipmentTrackingRequest request) {
		return ApiResponse.ok(orders.updateShipmentTracking(id, request));
	}

	@PatchMapping("/{id}/status")
	public ApiResponse<ShipmentDto> updateStatus(
			@PathVariable String id,
			@Valid @RequestBody UpdateShipmentStatusRequest request) {
		return ApiResponse.ok(orders.updateShipmentStatus(id, request));
	}
}

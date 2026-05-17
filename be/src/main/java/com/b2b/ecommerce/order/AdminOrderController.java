package com.b2b.ecommerce.order;

import java.util.List;
import java.util.UUID;

import com.b2b.ecommerce.common.ApiResponse;
import com.b2b.ecommerce.common.PageRequestParams;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/orders")
public class AdminOrderController {
	private static final UUID DEV_ADMIN_ID = UUID.fromString("00000000-0000-4000-8000-000000009001");
	private final OrderService orders;

	public AdminOrderController(OrderService orders) {
		this.orders = orders;
	}

	@GetMapping
	public ApiResponse<List<AdminOrderSummaryDto>> orders(
			@RequestParam(defaultValue = "1") int page,
			@RequestParam(defaultValue = "20") int pageSize,
			@RequestParam(required = false) String status,
			@RequestParam(required = false) String paymentStatus,
			@RequestParam(required = false) String search,
			@RequestParam(required = false) String dateFrom,
			@RequestParam(required = false) String dateTo) {
		PageRequestParams params = new PageRequestParams(page, pageSize, search, "createdAt", "desc");
		Page<AdminOrderSummaryDto> result = orders.adminOrders(params, status, paymentStatus, dateFrom, dateTo);
		return ApiResponse.page(result.getContent(), (int) result.getTotalElements(), params.normalizedPage(),
				Math.min(params.normalizedPageSize(), 50));
	}

	@GetMapping("/{id}")
	public ApiResponse<OrderDto> order(@PathVariable String id) {
		return ApiResponse.ok(orders.adminOrder(id));
	}

	@PatchMapping("/{id}/status")
	public ApiResponse<OrderDto> updateStatus(
			@RequestHeader(name = "X-Admin-Id", required = false) String adminId,
			@RequestHeader(name = "X-Admin-Name", required = false, defaultValue = "Admin CELLPHONES") String adminName,
			@PathVariable String id,
			@Valid @RequestBody UpdateOrderStatusRequest request) {
		return ApiResponse.ok(orders.updateStatus(adminId(adminId), adminName, id, request));
	}

	@PatchMapping("/{id}/notes")
	public ApiResponse<OrderDto> updateNotes(
			@PathVariable String id,
			@Valid @RequestBody UpdateOrderNotesRequest request) {
		return ApiResponse.ok(orders.updateNotes(id, request));
	}

	private UUID adminId(String value) {
		return value == null || value.isBlank() ? DEV_ADMIN_ID : UUID.fromString(value);
	}
}

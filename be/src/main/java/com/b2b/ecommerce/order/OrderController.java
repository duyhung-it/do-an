package com.b2b.ecommerce.order;

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
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/orders")
public class OrderController {
	private static final UUID DEV_USER_ID = UUID.fromString("00000000-0000-4000-8000-000000000001");
	private final OrderService orders;

	public OrderController(OrderService orders) {
		this.orders = orders;
	}

	@GetMapping
	public ApiResponse<List<OrderSummaryDto>> orders(
			@RequestHeader(name = "X-User-Id", required = false) String userId,
			@RequestParam(defaultValue = "1") int page,
			@RequestParam(defaultValue = "10") int pageSize,
			@RequestParam(required = false) String status,
			@RequestParam(required = false) String search) {
		PageRequestParams params = new PageRequestParams(page, pageSize, search, "createdAt", "desc");
		Page<OrderSummaryDto> result = orders.orders(userId(userId), params, status);
		return ApiResponse.page(result.getContent(), (int) result.getTotalElements(), params.normalizedPage(),
				Math.min(params.normalizedPageSize(), 50));
	}

	@GetMapping("/{id}")
	public ApiResponse<OrderDto> order(
			@RequestHeader(name = "X-User-Id", required = false) String userId,
			@PathVariable String id) {
		return ApiResponse.ok(orders.order(userId(userId), id));
	}

	@PostMapping
	public ResponseEntity<ApiResponse<OrderCreateResponse>> create(
			@RequestHeader(name = "X-User-Id", required = false) String userId,
			@RequestHeader(name = "X-User-Name", required = false, defaultValue = "Khach hang") String userName,
			@RequestHeader(name = "X-User-Email", required = false, defaultValue = "khachhang@gmail.com") String userEmail,
			@RequestHeader(name = "X-User-Phone", required = false, defaultValue = "0900000000") String userPhone,
			@Valid @RequestBody OrderCreateRequest request) {
		OrderService.CustomerSnapshot customer = new OrderService.CustomerSnapshot(userName, userEmail, userPhone);
		return ResponseEntity.status(HttpStatus.CREATED)
				.body(ApiResponse.ok(orders.create(userId(userId), customer, request)));
	}

	@DeleteMapping("/{id}/cancel")
	public ApiResponse<OrderDto> cancel(
			@RequestHeader(name = "X-User-Id", required = false) String userId,
			@PathVariable String id,
			@Valid @RequestBody(required = false) CancelOrderRequest request) {
		return ApiResponse.ok(orders.cancel(userId(userId), id, request));
	}

	private UUID userId(String value) {
		return value == null || value.isBlank() ? DEV_USER_ID : UUID.fromString(value);
	}
}

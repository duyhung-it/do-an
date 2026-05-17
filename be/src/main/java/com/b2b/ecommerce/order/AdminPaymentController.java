package com.b2b.ecommerce.order;

import java.util.List;

import com.b2b.ecommerce.common.ApiResponse;
import com.b2b.ecommerce.common.PageRequestParams;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/payments")
public class AdminPaymentController {
	private final OrderService orders;

	public AdminPaymentController(OrderService orders) {
		this.orders = orders;
	}

	@GetMapping
	public ApiResponse<List<AdminPaymentDto>> payments(
			@RequestParam(defaultValue = "1") int page,
			@RequestParam(defaultValue = "20") int pageSize,
			@RequestParam(required = false) String status,
			@RequestParam(required = false) String method,
			@RequestParam(required = false) String search) {
		PageRequestParams params = new PageRequestParams(page, pageSize, search, "createdAt", "desc");
		Page<AdminPaymentDto> result = orders.adminPayments(params, status, method);
		return ApiResponse.page(result.getContent(), (int) result.getTotalElements(), params.normalizedPage(),
				Math.min(params.normalizedPageSize(), 100));
	}

	@GetMapping("/{id}")
	public ApiResponse<AdminPaymentDto> payment(@PathVariable String id) {
		return ApiResponse.ok(orders.adminPayment(id));
	}

	@PatchMapping("/{id}/mark-paid")
	public ApiResponse<AdminPaymentDto> markPaid(
			@PathVariable String id,
			@Valid @RequestBody MarkPaymentPaidRequest request) {
		return ApiResponse.ok(orders.markPaymentPaid(id, request));
	}

	@PatchMapping("/{id}/mark-overdue")
	public ApiResponse<AdminPaymentDto> markOverdue(@PathVariable String id) {
		return ApiResponse.ok(orders.markPaymentOverdue(id));
	}

	@PostMapping("/{id}/refund")
	public ApiResponse<AdminPaymentDto> refund(
			@PathVariable String id,
			@Valid @RequestBody RefundPaymentRequest request) {
		return ApiResponse.ok(orders.refundPayment(id, request));
	}
}

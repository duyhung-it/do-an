package com.b2b.ecommerce.order;

import java.net.URI;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import com.b2b.ecommerce.common.ApiResponse;
import com.b2b.ecommerce.common.PageRequestParams;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/payments")
public class PaymentController {
	private static final UUID DEV_USER_ID = UUID.fromString("00000000-0000-4000-8000-000000000001");
	private final OrderService orders;

	public PaymentController(OrderService orders) {
		this.orders = orders;
	}

	@GetMapping
	public ApiResponse<List<CustomerPaymentDto>> payments(
			@RequestHeader(name = "X-User-Id", required = false) String userId,
			@RequestParam(defaultValue = "1") int page,
			@RequestParam(defaultValue = "20") int pageSize,
			@RequestParam(required = false) String status,
			@RequestParam(required = false) String search) {
		PageRequestParams params = new PageRequestParams(page, pageSize, search, "createdAt", "desc");
		Page<CustomerPaymentDto> result = orders.customerPayments(userId(userId), params, status);
		return ApiResponse.page(result.getContent(), (int) result.getTotalElements(), params.normalizedPage(),
				Math.min(params.normalizedPageSize(), 100));
	}

	@GetMapping("/{id}")
	public ApiResponse<CustomerPaymentDto> payment(
			@RequestHeader(name = "X-User-Id", required = false) String userId,
			@PathVariable String id) {
		return ApiResponse.ok(orders.customerPayment(userId(userId), id));
	}

	@GetMapping("/{id}/proofs")
	public ApiResponse<List<PaymentProofDto>> paymentProofs(
			@RequestHeader(name = "X-User-Id", required = false) String userId,
			@PathVariable String id) {
		return ApiResponse.ok(orders.customerPaymentProofs(userId(userId), id));
	}

	@PostMapping("/{id}/proof")
	public ApiResponse<PaymentProofDto> submitPaymentProof(
			@RequestHeader(name = "X-User-Id", required = false) String userId,
			@PathVariable String id,
			@Valid @RequestBody PaymentProofRequest request) {
		return ApiResponse.ok(orders.submitPaymentProof(userId(userId), id, request));
	}

	@PostMapping("/{id}/gateway-session")
	public ApiResponse<PaymentGatewaySessionDto> createGatewaySession(
			@RequestHeader(name = "X-User-Id", required = false) String userId,
			@PathVariable String id,
			@RequestBody CreatePaymentSessionRequest request) {
		return ApiResponse.ok(orders.createGatewaySession(userId(userId), id, request));
	}

	@PostMapping("/gateway/callback")
	public ApiResponse<PaymentGatewayResultDto> gatewayCallback(@RequestBody PaymentGatewayCallbackRequest request) {
		return ApiResponse.ok(orders.gatewayCallback(request));
	}

	@GetMapping("/gateway/return")
	public ResponseEntity<?> gatewayReturn(@RequestParam Map<String, String> params) {
		PaymentGatewayReturnOutcome outcome = orders.gatewayReturnOutcome(params);
		if (outcome.redirectUrl() != null && !outcome.redirectUrl().isBlank()) {
			return ResponseEntity.status(302).location(URI.create(outcome.redirectUrl())).build();
		}
		return ResponseEntity.ok(ApiResponse.ok(outcome.result()));
	}

	private UUID userId(String value) {
		return value == null || value.isBlank() ? DEV_USER_ID : UUID.fromString(value);
	}
}

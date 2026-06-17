package com.b2b.ecommerce.promotion;

import java.util.List;
import java.util.Map;

import com.b2b.ecommerce.common.ApiResponse;
import com.b2b.ecommerce.common.PageRequestParams;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/promotions")
public class PromotionController {
	private final PromotionService promotions;

	public PromotionController(PromotionService promotions) {
		this.promotions = promotions;
	}

	@GetMapping
	public ApiResponse<List<PromotionDto>> promotions(
			@RequestParam(defaultValue = "1") int page,
			@RequestParam(defaultValue = "20") int pageSize) {
		PageRequestParams params = new PageRequestParams(page, pageSize, null, "endDate", "asc");
		Page<PromotionDto> result = promotions.activePromotions(params);
		return ApiResponse.page(result.getContent(), (int) result.getTotalElements(), params.normalizedPage(),
				params.normalizedPageSize());
	}

	@PostMapping("/validate")
	public ApiResponse<PromotionValidateResponse> validate(@RequestBody Map<String, Object> body) {
		return ApiResponse.ok(promotions.validate(normalizeValidateRequest(body)));
	}

	private PromotionValidateRequest normalizeValidateRequest(Map<String, Object> body) {
		String code = String.valueOf(body.getOrDefault("code", body.getOrDefault("couponCode", "")));
		Object totalValue = body.getOrDefault("cartTotal", body.getOrDefault("subtotal", body.getOrDefault("orderTotal", 0)));
		long cartTotal = Long.parseLong(String.valueOf(totalValue));
		@SuppressWarnings("unchecked")
		List<Map<String, Object>> rawItems = body.get("cartItems") instanceof List<?> rows
				? (List<Map<String, Object>>) (List<?>) rows
				: List.of();
		List<PromotionCartItemRequest> cartItems = rawItems.stream()
				.map(item -> new PromotionCartItemRequest(
						String.valueOf(item.getOrDefault("productId", "all")),
						text(item.get("categoryId")),
						text(item.get("brand")),
						text(item.get("brandId"))))
				.toList();
		if (cartItems.isEmpty()) {
			cartItems = List.of(new PromotionCartItemRequest("all", null, null, null));
		}
		return new PromotionValidateRequest(code, cartTotal, cartItems);
	}

	private String text(Object value) {
		return value == null ? null : String.valueOf(value);
	}
}

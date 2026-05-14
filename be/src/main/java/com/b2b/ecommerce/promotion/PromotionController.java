package com.b2b.ecommerce.promotion;

import java.util.List;

import com.b2b.ecommerce.common.ApiResponse;
import com.b2b.ecommerce.common.PageRequestParams;
import jakarta.validation.Valid;
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
	public ApiResponse<PromotionValidateResponse> validate(@Valid @RequestBody PromotionValidateRequest request) {
		return ApiResponse.ok(promotions.validate(request));
	}
}

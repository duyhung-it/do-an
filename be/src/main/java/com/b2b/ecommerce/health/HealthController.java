package com.b2b.ecommerce.health;

import java.time.Instant;
import java.util.Map;

import com.b2b.ecommerce.common.ApiResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1")
public class HealthController {

	@GetMapping("/health")
	public ApiResponse<Map<String, Object>> health() {
		return ApiResponse.ok(Map.of(
				"status", "UP",
				"service", "b2b-ecommerce-api",
				"timestamp", Instant.now().toString()));
	}
}

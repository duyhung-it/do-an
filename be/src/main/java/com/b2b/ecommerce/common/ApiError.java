package com.b2b.ecommerce.common;

import java.util.Map;

public record ApiError(
		String code,
		String message,
		Map<String, Object> details
) {
	public static ApiError of(String code, String message) {
		return new ApiError(code, message, Map.of());
	}

	public static ApiError of(ErrorCode errorCode) {
		return new ApiError(errorCode.name(), errorCode.message(), Map.of());
	}

	public static ApiError of(ErrorCode errorCode, String message, Map<String, Object> details) {
		return new ApiError(errorCode.name(), message == null ? errorCode.message() : message,
				details == null ? Map.of() : details);
	}
}

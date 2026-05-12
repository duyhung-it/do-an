package com.b2b.ecommerce.common;

public record ApiResponse<T>(
		T data,
		Integer total,
		Integer page,
		Integer pageSize,
		Boolean success,
		ApiError error
) {
	public static <T> ApiResponse<T> ok(T data) {
		return new ApiResponse<>(data, null, null, null, true, null);
	}

	public static <T> ApiResponse<T> page(T data, int total, int page, int pageSize) {
		return new ApiResponse<>(data, total, page, pageSize, true, null);
	}

	public static <T> ApiResponse<T> fail(ApiError error) {
		return new ApiResponse<>(null, null, null, null, false, error);
	}
}

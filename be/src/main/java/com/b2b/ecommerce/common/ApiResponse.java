package com.b2b.ecommerce.common;

public record ApiResponse<T>(
		T data,
		Boolean success,
		String message,
		Pagination pagination,
		ApiError error,
		Object meta
) {
	public static <T> ApiResponse<T> ok(T data) {
		return new ApiResponse<>(data, true, "Thao tac thanh cong", null, null, null);
	}

	public static <T> ApiResponse<T> page(T data, int total, int page, int pageSize) {
		int totalPages = pageSize <= 0 ? 0 : (int) Math.ceil((double) total / pageSize);
		Pagination pagination = new Pagination(page, pageSize, total, totalPages, page < totalPages, page > 1);
		return new ApiResponse<>(data, true, "Thao tac thanh cong", pagination, null, null);
	}

	public static <T> ApiResponse<T> page(T data, int total, int page, int pageSize, Object meta) {
		int totalPages = pageSize <= 0 ? 0 : (int) Math.ceil((double) total / pageSize);
		Pagination pagination = new Pagination(page, pageSize, total, totalPages, page < totalPages, page > 1);
		return new ApiResponse<>(data, true, "Thao tac thanh cong", pagination, null, meta);
	}

	public static <T> ApiResponse<T> fail(ApiError error) {
		return new ApiResponse<>(null, false, null, null, error, null);
	}

	public record Pagination(
			int page,
			int pageSize,
			int total,
			int totalPages,
			boolean hasNext,
			boolean hasPrev
	) {
	}
}

package com.b2b.ecommerce.common;

public record PageRequestParams(
		int page,
		int pageSize,
		String search,
		String sortField,
		String sortOrder
) {
	public int normalizedPage() {
		return Math.max(page, 1);
	}

	public int normalizedPageSize() {
		if (pageSize <= 0) {
			return 20;
		}
		return Math.min(pageSize, 100);
	}

	public boolean ascending() {
		return "asc".equalsIgnoreCase(sortOrder);
	}
}

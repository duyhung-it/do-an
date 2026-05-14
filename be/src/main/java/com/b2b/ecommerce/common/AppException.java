package com.b2b.ecommerce.common;

import java.util.Map;

public class AppException extends RuntimeException {
	private final ErrorCode errorCode;
	private final Map<String, Object> details;

	public AppException(ErrorCode errorCode) {
		this(errorCode, errorCode.message(), Map.of());
	}

	public AppException(ErrorCode errorCode, String message) {
		this(errorCode, message, Map.of());
	}

	public AppException(ErrorCode errorCode, String message, Map<String, Object> details) {
		super(message);
		this.errorCode = errorCode;
		this.details = details == null ? Map.of() : details;
	}

	public ErrorCode errorCode() {
		return errorCode;
	}

	public Map<String, Object> details() {
		return details;
	}
}

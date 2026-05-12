package com.b2b.ecommerce.common;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.NoSuchElementException;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

	@ExceptionHandler(NoSuchElementException.class)
	public ResponseEntity<ApiResponse<Void>> notFound(NoSuchElementException exception) {
		return ResponseEntity.status(HttpStatus.NOT_FOUND)
				.body(ApiResponse.fail(ApiError.of("NOT_FOUND", exception.getMessage())));
	}

	@ExceptionHandler(IllegalArgumentException.class)
	public ResponseEntity<ApiResponse<Void>> badRequest(IllegalArgumentException exception) {
		return ResponseEntity.badRequest()
				.body(ApiResponse.fail(ApiError.of("BAD_REQUEST", exception.getMessage())));
	}

	@ExceptionHandler(MethodArgumentNotValidException.class)
	public ResponseEntity<ApiResponse<Void>> validation(MethodArgumentNotValidException exception) {
		Map<String, Object> details = new LinkedHashMap<>();
		for (FieldError error : exception.getBindingResult().getFieldErrors()) {
			details.put(error.getField(), error.getDefaultMessage());
		}
		return ResponseEntity.unprocessableEntity()
				.body(ApiResponse.fail(new ApiError("VALIDATION_ERROR", "Du lieu dau vao khong hop le", details)));
	}
}

package com.b2b.ecommerce.common;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.NoSuchElementException;

import jakarta.validation.ConstraintViolationException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

@RestControllerAdvice
public class GlobalExceptionHandler {

	@ExceptionHandler(AppException.class)
	public ResponseEntity<ApiResponse<Void>> app(AppException exception) {
		ErrorCode code = exception.errorCode();
		return ResponseEntity.status(code.status())
				.body(ApiResponse.fail(ApiError.of(code, exception.getMessage(), exception.details())));
	}

	@ExceptionHandler(NoSuchElementException.class)
	public ResponseEntity<ApiResponse<Void>> notFound(NoSuchElementException exception) {
		return ResponseEntity.status(HttpStatus.NOT_FOUND)
				.body(ApiResponse.fail(ApiError.of(ErrorCode.NOT_FOUND, exception.getMessage(), Map.of())));
	}

	@ExceptionHandler(IllegalArgumentException.class)
	public ResponseEntity<ApiResponse<Void>> badRequest(IllegalArgumentException exception) {
		return ResponseEntity.badRequest()
				.body(ApiResponse.fail(ApiError.of(ErrorCode.VALIDATION_ERROR, exception.getMessage(), Map.of())));
	}

	@ExceptionHandler(MethodArgumentNotValidException.class)
	public ResponseEntity<ApiResponse<Void>> validation(MethodArgumentNotValidException exception) {
		Map<String, Object> details = new LinkedHashMap<>();
		for (FieldError error : exception.getBindingResult().getFieldErrors()) {
			details.put(error.getField(), error.getDefaultMessage());
		}
		return ResponseEntity.badRequest()
				.body(ApiResponse.fail(ApiError.of(ErrorCode.VALIDATION_ERROR, "Du lieu dau vao khong hop le", details)));
	}

	@ExceptionHandler(ConstraintViolationException.class)
	public ResponseEntity<ApiResponse<Void>> constraintViolation(ConstraintViolationException exception) {
		Map<String, Object> details = new LinkedHashMap<>();
		exception.getConstraintViolations().forEach(violation ->
				details.put(violation.getPropertyPath().toString(), violation.getMessage()));
		return ResponseEntity.badRequest()
				.body(ApiResponse.fail(ApiError.of(ErrorCode.VALIDATION_ERROR, "Du lieu dau vao khong hop le", details)));
	}

	@ExceptionHandler(MethodArgumentTypeMismatchException.class)
	public ResponseEntity<ApiResponse<Void>> typeMismatch(MethodArgumentTypeMismatchException exception) {
		Map<String, Object> details = Map.of(exception.getName(), "Gia tri khong dung dinh dang");
		return ResponseEntity.badRequest()
				.body(ApiResponse.fail(ApiError.of(ErrorCode.VALIDATION_ERROR, "Du lieu dau vao khong hop le", details)));
	}

	@ExceptionHandler(HttpMessageNotReadableException.class)
	public ResponseEntity<ApiResponse<Void>> unreadableBody(HttpMessageNotReadableException exception) {
		return ResponseEntity.badRequest()
				.body(ApiResponse.fail(ApiError.of(ErrorCode.VALIDATION_ERROR, "Body JSON khong hop le", Map.of())));
	}

	@ExceptionHandler(DataIntegrityViolationException.class)
	public ResponseEntity<ApiResponse<Void>> dataIntegrity(DataIntegrityViolationException exception) {
		return ResponseEntity.status(HttpStatus.CONFLICT)
				.body(ApiResponse.fail(ApiError.of(ErrorCode.CONFLICT)));
	}

	@ExceptionHandler(Exception.class)
	public ResponseEntity<ApiResponse<Void>> unexpected(Exception exception) {
		return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
				.body(ApiResponse.fail(ApiError.of(ErrorCode.INTERNAL_ERROR)));
	}
}

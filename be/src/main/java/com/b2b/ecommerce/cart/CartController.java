package com.b2b.ecommerce.cart;

import java.util.UUID;

import com.b2b.ecommerce.common.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PathVariable;

@RestController
@RequestMapping("/api/v1/cart")
public class CartController {
	private static final UUID DEV_USER_ID = UUID.fromString("00000000-0000-4000-8000-000000000001");
	private final CartService cart;

	public CartController(CartService cart) {
		this.cart = cart;
	}

	@GetMapping
	public ApiResponse<CartDto> cart(@RequestHeader(name = "X-User-Id", required = false) String userId) {
		return ApiResponse.ok(cart.cart(userId(userId)));
	}

	@PostMapping("/items")
	public ResponseEntity<ApiResponse<CartItemDto>> addItem(
			@RequestHeader(name = "X-User-Id", required = false) String userId,
			@Valid @RequestBody AddCartItemRequest request) {
		return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(cart.addItem(userId(userId), request)));
	}

	@PatchMapping("/items/{id}")
	public ApiResponse<CartItemDto> updateItem(
			@RequestHeader(name = "X-User-Id", required = false) String userId,
			@PathVariable String id,
			@Valid @RequestBody UpdateCartItemRequest request) {
		return ApiResponse.ok(cart.updateItem(userId(userId), id, request));
	}

	@DeleteMapping("/items/{id}")
	public ResponseEntity<Void> deleteItem(
			@RequestHeader(name = "X-User-Id", required = false) String userId,
			@PathVariable String id) {
		cart.deleteItem(userId(userId), id);
		return ResponseEntity.noContent().build();
	}

	@DeleteMapping
	public ResponseEntity<Void> clear(@RequestHeader(name = "X-User-Id", required = false) String userId) {
		cart.clear(userId(userId));
		return ResponseEntity.noContent().build();
	}

	@PostMapping("/validate")
	public ApiResponse<CartValidationDto> validate(@RequestHeader(name = "X-User-Id", required = false) String userId) {
		return ApiResponse.ok(cart.validate(userId(userId)));
	}

	private UUID userId(String value) {
		return value == null || value.isBlank() ? DEV_USER_ID : UUID.fromString(value);
	}
}

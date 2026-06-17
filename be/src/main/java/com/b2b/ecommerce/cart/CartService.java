package com.b2b.ecommerce.cart;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import com.b2b.ecommerce.common.AppException;
import com.b2b.ecommerce.common.ErrorCode;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CartService {
	private static final int MAX_CART_ITEMS = 50;
	private final CartRepository carts;
	private final JdbcTemplate jdbc;

	public CartService(CartRepository carts, JdbcTemplate jdbc) {
		this.carts = carts;
		this.jdbc = jdbc;
	}

	@Transactional(readOnly = true)
	public CartDto cart(UUID userId) {
		return cartDto(carts.findByUserIdOrderByAddedAtAsc(userId));
	}

	@Transactional
	public CartItemDto addItem(UUID userId, AddCartItemRequest request) {
		UUID productId = uuid(request.productId(), "productId");
		UUID variantId = request.variantId() == null || request.variantId().isBlank()
				? null
				: uuid(request.variantId(), "variantId");
		int quantity = request.quantity() == null ? 1 : request.quantity();
		ProductSnapshot product = product(productId);
		if (!"ACTIVE".equals(product.status())) {
			throw new AppException(ErrorCode.PRODUCT_INACTIVE);
		}
		VariantSnapshot variant = variantId == null ? null : variant(productId, variantId);
		if (variantId == null && product.variantCount() > 0) {
			throw new AppException(ErrorCode.PRODUCT_VARIANT_NOT_FOUND, "San pham can chon bien the");
		}
		if (variant != null && !variant.active()) {
			throw new AppException(ErrorCode.PRODUCT_INACTIVE, "Bien the san pham khong con kinh doanh");
		}
		if (variant != null && variant.stock() < quantity) {
			throw new AppException(ErrorCode.PRODUCT_OUT_OF_STOCK, "San pham khong du ton kho",
					Map.of("availableStock", variant.stock(), "requestedQuantity", quantity));
		}

		CartItemEntity item = carts.findByUserIdAndProductIdAndVariantId(userId, productId, variantId).orElse(null);
		if (item == null) {
			if (carts.countByUserId(userId) >= MAX_CART_ITEMS) {
				throw new AppException(ErrorCode.CART_LIMIT_EXCEEDED);
			}
			item = new CartItemEntity();
			item.setUserId(userId);
			item.setProductId(productId);
			item.setVariantId(variantId);
			item.setProductName(product.name());
			item.setProductImage(product.image());
			item.setBrand(product.brand());
			item.setVariantName(variant == null ? null : variant.name());
			item.setColor(variant == null ? null : variant.color());
			item.setStorage(variant == null ? null : variant.storage());
			item.setUnitPrice(variant == null ? product.price() : variant.price());
			item.setQuantity(quantity);
		}
		else {
			int nextQuantity = item.getQuantity() + quantity;
			if (variant != null && variant.stock() < nextQuantity) {
				throw new AppException(ErrorCode.PRODUCT_OUT_OF_STOCK, "San pham khong du ton kho",
						Map.of("availableStock", variant.stock(), "requestedQuantity", nextQuantity));
			}
			item.setQuantity(nextQuantity);
		}
		item.setNote(request.note());
		return itemDto(carts.save(item));
	}

	@Transactional
	public CartItemDto updateItem(UUID userId, String id, UpdateCartItemRequest request) {
		CartItemEntity item = cartItem(userId, id);
		if (item.getVariantId() != null) {
			VariantSnapshot variant = variant(item.getProductId(), item.getVariantId());
			if (variant.stock() < request.quantity()) {
				throw new AppException(ErrorCode.PRODUCT_OUT_OF_STOCK, "San pham khong du ton kho",
						Map.of("availableStock", variant.stock(), "requestedQuantity", request.quantity()));
			}
		}
		item.setQuantity(request.quantity());
		if (request.note() != null) {
			item.setNote(request.note());
		}
		return itemDto(carts.save(item));
	}

	@Transactional
	public void deleteItem(UUID userId, String id) {
		carts.delete(cartItem(userId, id));
	}

	@Transactional
	public void clear(UUID userId) {
		carts.deleteByUserId(userId);
	}

	@Transactional(readOnly = true)
	public CartValidationDto validate(UUID userId) {
		List<CartValidationIssueDto> issues = new ArrayList<>();
		for (CartItemEntity item : carts.findByUserIdOrderByAddedAtAsc(userId)) {
			ProductSnapshot product = product(item.getProductId());
			if (!"ACTIVE".equals(product.status())) {
				issues.add(issue(item, "PRODUCT_INACTIVE", "San pham khong con kinh doanh", null, null));
				continue;
			}
			long currentPrice = product.price();
			Integer stock = null;
			if (item.getVariantId() != null) {
				VariantSnapshot variant = variant(item.getProductId(), item.getVariantId());
				currentPrice = variant.price();
				stock = variant.stock();
				if (!variant.active()) {
					issues.add(issue(item, "VARIANT_INACTIVE", "Bien the san pham khong con kinh doanh", currentPrice, stock));
				}
				else if (variant.stock() < item.getQuantity()) {
					issues.add(issue(item, "INSUFFICIENT_STOCK", "San pham khong du ton kho", currentPrice, stock));
				}
			}
			if (item.getUnitPrice() != currentPrice) {
				issues.add(issue(item, "PRICE_CHANGED", "Gia san pham da thay doi", currentPrice, stock));
			}
		}
		return new CartValidationDto(issues.isEmpty(), issues);
	}

	private CartItemEntity cartItem(UUID userId, String id) {
		return carts.findByIdAndUserId(uuid(id, "id"), userId)
				.orElseThrow(() -> new AppException(ErrorCode.CART_ITEM_NOT_FOUND));
	}

	private CartDto cartDto(List<CartItemEntity> items) {
		List<CartItemDto> dtos = items.stream().map(this::itemDto).toList();
		long subtotal = items.stream().mapToLong(item -> item.getQuantity() * item.getUnitPrice()).sum();
		return new CartDto(dtos, dtos.size(), subtotal, 0);
	}

	private CartItemDto itemDto(CartItemEntity item) {
		return new CartItemDto(item.getId().toString(), item.getProductId().toString(),
				item.getVariantId() == null ? null : item.getVariantId().toString(), item.getProductName(),
				item.getProductImage(), item.getBrand(), item.getVariantName(), item.getColor(), item.getStorage(),
				item.getQuantity(), item.getUnitPrice(), item.getQuantity() * item.getUnitPrice(), item.getNote(),
				item.getAddedAt() == null ? null : DateTimeFormatter.ISO_OFFSET_DATE_TIME.format(item.getAddedAt()));
	}

	private CartValidationIssueDto issue(CartItemEntity item, String type, String message, Long currentPrice, Integer stock) {
		return new CartValidationIssueDto(item.getId().toString(), item.getProductId().toString(),
				item.getVariantId() == null ? null : item.getVariantId().toString(), type, message, item.getUnitPrice(),
				currentPrice, item.getQuantity(), stock);
	}

	private ProductSnapshot product(UUID productId) {
		try {
			return jdbc.queryForObject("""
					SELECT p.id, p.name, p.brand, p.price, p.status::text AS status,
					       COALESCE((
					         SELECT pi.url
					         FROM product_images pi
					         WHERE pi.product_id = p.id
					         ORDER BY pi.is_primary DESC, pi.sort_order ASC
					         LIMIT 1
					       ), '') AS image,
					       (SELECT COUNT(*) FROM product_variants pv WHERE pv.product_id = p.id) AS variant_count
					FROM products p
					WHERE p.id = ?
					""", this::productSnapshot, productId);
		}
		catch (EmptyResultDataAccessException exception) {
			throw new AppException(ErrorCode.PRODUCT_NOT_FOUND);
		}
	}

	private VariantSnapshot variant(UUID productId, UUID variantId) {
		try {
			return jdbc.queryForObject("""
					SELECT id, name, price, stock, color, storage, is_active
					FROM product_variants
					WHERE id = ? AND product_id = ?
					""", this::variantSnapshot, variantId, productId);
		}
		catch (EmptyResultDataAccessException exception) {
			throw new AppException(ErrorCode.PRODUCT_VARIANT_NOT_FOUND);
		}
	}

	private ProductSnapshot productSnapshot(ResultSet rs, int rowNum) throws SQLException {
		return new ProductSnapshot((UUID) rs.getObject("id"), rs.getString("name"), rs.getString("brand"),
				rs.getLong("price"), rs.getString("status"), rs.getString("image"), rs.getInt("variant_count"));
	}

	private VariantSnapshot variantSnapshot(ResultSet rs, int rowNum) throws SQLException {
		return new VariantSnapshot((UUID) rs.getObject("id"), rs.getString("name"), rs.getLong("price"),
				rs.getInt("stock"), rs.getString("color"), rs.getString("storage"), rs.getBoolean("is_active"));
	}

	private UUID uuid(String value, String field) {
		try {
			return UUID.fromString(value);
		}
		catch (RuntimeException exception) {
			throw new AppException(ErrorCode.VALIDATION_ERROR, "Du lieu dau vao khong hop le",
					Map.of(field, "UUID khong dung dinh dang"));
		}
	}

	private record ProductSnapshot(UUID id, String name, String brand, long price, String status, String image, int variantCount) {
	}

	private record VariantSnapshot(UUID id, String name, long price, int stock, String color, String storage, boolean active) {
	}
}

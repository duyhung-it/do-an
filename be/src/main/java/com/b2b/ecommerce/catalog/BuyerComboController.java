package com.b2b.ecommerce.catalog;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

import com.b2b.ecommerce.common.ApiResponse;
import com.b2b.ecommerce.common.AppException;
import com.b2b.ecommerce.common.ErrorCode;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1")
public class BuyerComboController {
	private final JdbcTemplate jdbc;

	public BuyerComboController(JdbcTemplate jdbc) {
		this.jdbc = jdbc;
	}

	@GetMapping("/combos")
	public ApiResponse<List<ProductComboDto>> combos() {
		return ApiResponse.ok(jdbc.query("""
				SELECT id, name, description, product_ids, price, status::text AS status, created_at, updated_at
				FROM product_combos
				WHERE status = 'ACTIVE'
				ORDER BY created_at DESC
				""", this::comboRow));
	}

	@GetMapping("/combos/{id}")
	public ApiResponse<ProductComboDto> combo(@PathVariable String id) {
		try {
			return ApiResponse.ok(jdbc.queryForObject("""
					SELECT id, name, description, product_ids, price, status::text AS status, created_at, updated_at
					FROM product_combos
					WHERE id = ? AND status = 'ACTIVE'
					""", this::comboRow, uuid(id)));
		}
		catch (EmptyResultDataAccessException exception) {
			throw new AppException(ErrorCode.NOT_FOUND, "Khong tim thay combo");
		}
	}

	@GetMapping("/products/{productId}/combos")
	public ApiResponse<List<ProductComboDto>> combosForProduct(@PathVariable String productId) {
		UUID productUuid = uuid(productId);
		return ApiResponse.ok(jdbc.query("""
				SELECT id, name, description, product_ids, price, status::text AS status, created_at, updated_at
				FROM product_combos
				WHERE status = 'ACTIVE' AND ? = ANY(product_ids)
				ORDER BY created_at DESC
				""", this::comboRow, productUuid));
	}

	private ProductComboDto comboRow(ResultSet rs, int rowNum) throws SQLException {
		List<UUID> productIds = List.of((UUID[]) rs.getArray("product_ids").getArray());
		List<ComboProductDto> products = comboProducts(productIds);
		long totalOriginalPrice = products.stream().mapToLong(item -> item.originalPrice() * item.quantity()).sum();
		long comboPrice = rs.getLong("price");
		long savings = Math.max(0, totalOriginalPrice - comboPrice);
		int savingsPercent = totalOriginalPrice <= 0 ? 0 : (int) Math.round(savings * 100.0 / totalOriginalPrice);
		return new ProductComboDto(
				rs.getObject("id", UUID.class).toString(),
				rs.getString("name"),
				rs.getString("description"),
				products,
				totalOriginalPrice,
				comboPrice,
				savings,
				savingsPercent,
				"ACTIVE".equals(rs.getString("status")),
				products.isEmpty() ? null : products.get(0).productImage(),
				iso(rs.getObject("created_at", OffsetDateTime.class)),
				iso(rs.getObject("updated_at", OffsetDateTime.class)));
	}

	private List<ComboProductDto> comboProducts(List<UUID> productIds) {
		if (productIds.isEmpty()) {
			return List.of();
		}
		return productIds.stream().map(productId -> jdbc.queryForObject("""
				SELECT p.id, p.name, p.price,
				       COALESCE((SELECT pi.url FROM product_images pi
				                 WHERE pi.product_id = p.id
				                 ORDER BY pi.is_primary DESC, pi.sort_order ASC
				                 LIMIT 1), '') AS image
				FROM products p
				WHERE p.id = ?
				""", this::comboProductRow, productId)).toList();
	}

	private ComboProductDto comboProductRow(ResultSet rs, int rowNum) throws SQLException {
		long originalPrice = rs.getLong("price");
		return new ComboProductDto(rs.getObject("id", UUID.class).toString(), rs.getString("name"),
				rs.getString("image"), originalPrice, originalPrice, 1);
	}

	private UUID uuid(String value) {
		try {
			return UUID.fromString(value);
		}
		catch (RuntimeException exception) {
			throw new AppException(ErrorCode.VALIDATION_ERROR, "Du lieu dau vao khong hop le",
					java.util.Map.of("id", "UUID khong dung dinh dang"));
		}
	}

	private String iso(OffsetDateTime value) {
		return DateTimeFormatter.ISO_OFFSET_DATE_TIME.format(value);
	}

	public record ComboProductDto(String productId, String productName, String productImage, long originalPrice,
			long comboPrice, int quantity) {
	}

	public record ProductComboDto(String id, String name, String description, List<ComboProductDto> products,
			long totalOriginalPrice, long comboPrice, long savings, int savingsPercent, boolean isActive, String image,
			String createdAt, String updatedAt) {
	}
}

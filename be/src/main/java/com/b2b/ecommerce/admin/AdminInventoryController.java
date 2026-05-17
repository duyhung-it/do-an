package com.b2b.ecommerce.admin;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import com.b2b.ecommerce.common.ApiResponse;
import com.b2b.ecommerce.common.AppException;
import com.b2b.ecommerce.common.ErrorCode;
import com.b2b.ecommerce.common.PageRequestParams;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/inventory")
public class AdminInventoryController {
	private final AdminInventoryService inventory;

	public AdminInventoryController(AdminInventoryService inventory) {
		this.inventory = inventory;
	}

	@GetMapping
	public ApiResponse<List<InventoryRowDto>> inventory(
			@RequestParam(defaultValue = "1") int page,
			@RequestParam(defaultValue = "20") int pageSize,
			@RequestParam(required = false) String status,
			@RequestParam(required = false) String brand,
			@RequestParam(required = false) String search) {
		PageRequestParams params = new PageRequestParams(page, pageSize, search, "updatedAt", "desc");
		Page<InventoryRowDto> result = inventory.inventory(params, status, brand);
		return ApiResponse.page(result.getContent(), (int) result.getTotalElements(), params.normalizedPage(),
				params.normalizedPageSize());
	}

	@GetMapping("/low-stock")
	public ApiResponse<List<InventoryRowDto>> lowStock(@RequestParam(defaultValue = "20") int limit) {
		return ApiResponse.ok(inventory.lowStock(limit));
	}

	@GetMapping("/{id}")
	public ApiResponse<InventoryRowDto> inventoryItem(@PathVariable String id) {
		return ApiResponse.ok(inventory.inventoryItem(id));
	}

	@PatchMapping("/{id}/adjust")
	public ApiResponse<InventoryRowDto> adjust(
			@PathVariable String id,
			@RequestHeader(value = "X-Admin-Id", required = false) String adminId,
			@RequestHeader(value = "X-Admin-Name", required = false, defaultValue = "Admin") String adminName,
			@Valid @RequestBody AdjustStockRequest request) {
		return ApiResponse.ok(inventory.adjust(id, adminId, adminName, request));
	}

	@GetMapping("/{productId}/movements")
	public ApiResponse<List<StockMovementDto>> movements(
			@PathVariable String productId,
			@RequestParam(defaultValue = "1") int page,
			@RequestParam(defaultValue = "20") int pageSize) {
		PageRequestParams params = new PageRequestParams(page, pageSize, null, "createdAt", "desc");
		Page<StockMovementDto> result = inventory.movements(productId, params);
		return ApiResponse.page(result.getContent(), (int) result.getTotalElements(), params.normalizedPage(),
				params.normalizedPageSize());
	}

	public record AdjustStockRequest(@NotNull @Min(0) Integer stock, @Min(0) Integer minStock, String reason) {
	}

	public record InventoryRowDto(String id, String productId, String productName, String brand, String categoryName,
			String sku, String variantName, long price, int stock, int minStock, String status, boolean lowStock,
			List<String> imeiSerials, String updatedAt) {
	}

	public record StockMovementDto(String id, String variantId, String productId, String type, int quantityBefore,
			int quantityAfter, int delta, String reason, String referenceType, String referenceId, String createdBy,
			String createdByName, String createdAt) {
	}
}

@org.springframework.stereotype.Service
class AdminInventoryService {
	private final JdbcTemplate jdbc;

	AdminInventoryService(JdbcTemplate jdbc) {
		this.jdbc = jdbc;
	}

	@Transactional(readOnly = true)
	public Page<AdminInventoryController.InventoryRowDto> inventory(PageRequestParams params, String status, String brand) {
		int page = params.normalizedPage();
		int pageSize = params.normalizedPageSize();
		String normalizedStatus = status == null || status.isBlank() ? "" : status.trim().toUpperCase();
		String normalizedBrand = brand == null || brand.isBlank() ? "" : brand.trim();
		String search = normalizedSearch(params.search());
		Long total = jdbc.queryForObject("""
				SELECT COUNT(*)
				FROM product_variants pv
				JOIN products p ON p.id = pv.product_id
				WHERE (? = '' OR p.brand ILIKE ?)
				  AND (? = '' OR
				       (? = 'LOW_STOCK' AND pv.stock <= pv.min_stock) OR
				       (? = 'OUT_OF_STOCK' AND pv.stock = 0) OR
				       (? = 'IN_STOCK' AND pv.stock > pv.min_stock))
				  AND (? = '' OR p.name ILIKE ? OR pv.name ILIKE ? OR pv.sku ILIKE ?)
				""", Long.class, normalizedBrand, like(normalizedBrand), normalizedStatus, normalizedStatus,
				normalizedStatus, normalizedStatus, search, like(search), like(search), like(search));
		List<AdminInventoryController.InventoryRowDto> content = jdbc.query("""
				SELECT pv.id, pv.product_id, p.name AS product_name, p.brand, p.category_name, pv.sku,
				       pv.name AS variant_name, pv.price, pv.stock, pv.min_stock,
				       CASE WHEN pv.stock = 0 THEN 'OUT_OF_STOCK'
				            WHEN pv.stock <= pv.min_stock THEN 'LOW_STOCK'
				            ELSE 'IN_STOCK' END AS inventory_status,
				       pv.imei_serials, pv.updated_at
				FROM product_variants pv
				JOIN products p ON p.id = pv.product_id
				WHERE (? = '' OR p.brand ILIKE ?)
				  AND (? = '' OR
				       (? = 'LOW_STOCK' AND pv.stock <= pv.min_stock) OR
				       (? = 'OUT_OF_STOCK' AND pv.stock = 0) OR
				       (? = 'IN_STOCK' AND pv.stock > pv.min_stock))
				  AND (? = '' OR p.name ILIKE ? OR pv.name ILIKE ? OR pv.sku ILIKE ?)
				ORDER BY pv.updated_at DESC, pv.created_at DESC
				LIMIT ? OFFSET ?
				""", this::inventoryRow, normalizedBrand, like(normalizedBrand), normalizedStatus, normalizedStatus,
				normalizedStatus, normalizedStatus, search, like(search), like(search), like(search), pageSize,
				(page - 1) * pageSize);
		return new PageImpl<>(content, PageRequest.of(page - 1, pageSize), total == null ? 0 : total);
	}

	@Transactional(readOnly = true)
	public List<AdminInventoryController.InventoryRowDto> lowStock(int limit) {
		return jdbc.query("""
				SELECT pv.id, pv.product_id, p.name AS product_name, p.brand, p.category_name, pv.sku,
				       pv.name AS variant_name, pv.price, pv.stock, pv.min_stock,
				       CASE WHEN pv.stock = 0 THEN 'OUT_OF_STOCK' ELSE 'LOW_STOCK' END AS inventory_status,
				       pv.imei_serials, pv.updated_at
				FROM product_variants pv
				JOIN products p ON p.id = pv.product_id
				WHERE pv.stock <= pv.min_stock
				ORDER BY pv.stock ASC, pv.updated_at DESC
				LIMIT ?
				""", this::inventoryRow, Math.max(1, Math.min(limit, 100)));
	}

	@Transactional(readOnly = true)
	public AdminInventoryController.InventoryRowDto inventoryItem(String id) {
		try {
			return jdbc.queryForObject("""
					SELECT pv.id, pv.product_id, p.name AS product_name, p.brand, p.category_name, pv.sku,
					       pv.name AS variant_name, pv.price, pv.stock, pv.min_stock,
					       CASE WHEN pv.stock = 0 THEN 'OUT_OF_STOCK'
					            WHEN pv.stock <= pv.min_stock THEN 'LOW_STOCK'
					            ELSE 'IN_STOCK' END AS inventory_status,
					       pv.imei_serials, pv.updated_at
					FROM product_variants pv
					JOIN products p ON p.id = pv.product_id
					WHERE pv.id = ?
					""", this::inventoryRow, UUID.fromString(id));
		}
		catch (EmptyResultDataAccessException exception) {
			throw new AppException(ErrorCode.PRODUCT_VARIANT_NOT_FOUND);
		}
	}

	@Transactional
	public AdminInventoryController.InventoryRowDto adjust(String id, String adminId, String adminName,
			AdminInventoryController.AdjustStockRequest request) {
		AdminInventoryController.InventoryRowDto before = inventoryItem(id);
		int minStock = request.minStock() == null ? before.minStock() : request.minStock();
		jdbc.update("""
				UPDATE product_variants
				SET stock = ?, min_stock = ?, updated_at = NOW()
				WHERE id = ?
				""", request.stock(), minStock, UUID.fromString(id));
		jdbc.update("""
				INSERT INTO stock_movements (variant_id, product_id, type, quantity_before, quantity_after, delta,
				                             reason, created_by, created_by_name)
				VALUES (?, ?, 'MANUAL_ADJUSTMENT', ?, ?, ?, ?, ?, ?)
				""", UUID.fromString(id), UUID.fromString(before.productId()), before.stock(), request.stock(),
				request.stock() - before.stock(), request.reason() == null ? "" : request.reason(),
				adminId == null || adminId.isBlank() ? null : UUID.fromString(adminId), adminName);
		return inventoryItem(id);
	}

	@Transactional(readOnly = true)
	public Page<AdminInventoryController.StockMovementDto> movements(String productId, PageRequestParams params) {
		int page = params.normalizedPage();
		int pageSize = params.normalizedPageSize();
		UUID uuid = UUID.fromString(productId);
		Long total = jdbc.queryForObject("SELECT COUNT(*) FROM stock_movements WHERE product_id = ?", Long.class, uuid);
		List<AdminInventoryController.StockMovementDto> content = jdbc.query("""
				SELECT id, variant_id, product_id, type::text AS type, quantity_before, quantity_after, delta,
				       reason, reference_type, reference_id, created_by, created_by_name, created_at
				FROM stock_movements
				WHERE product_id = ?
				ORDER BY created_at DESC
				LIMIT ? OFFSET ?
				""", this::movementRow, uuid, pageSize, (page - 1) * pageSize);
		return new PageImpl<>(content, PageRequest.of(page - 1, pageSize), total == null ? 0 : total);
	}

	private AdminInventoryController.InventoryRowDto inventoryRow(ResultSet rs, int rowNum) throws SQLException {
		List<String> serials = rs.getArray("imei_serials") == null ? List.of()
				: List.of((String[]) rs.getArray("imei_serials").getArray());
		int stock = rs.getInt("stock");
		int minStock = rs.getInt("min_stock");
		return new AdminInventoryController.InventoryRowDto(rs.getObject("id").toString(),
				rs.getObject("product_id").toString(), rs.getString("product_name"), rs.getString("brand"),
				rs.getString("category_name"), rs.getString("sku"), rs.getString("variant_name"), rs.getLong("price"),
				stock, minStock, rs.getString("inventory_status"), stock <= minStock, serials,
				iso(rs.getObject("updated_at", OffsetDateTime.class)));
	}

	private AdminInventoryController.StockMovementDto movementRow(ResultSet rs, int rowNum) throws SQLException {
		Object referenceId = rs.getObject("reference_id");
		Object createdBy = rs.getObject("created_by");
		return new AdminInventoryController.StockMovementDto(rs.getObject("id").toString(),
				rs.getObject("variant_id").toString(), rs.getObject("product_id").toString(), rs.getString("type"),
				rs.getInt("quantity_before"), rs.getInt("quantity_after"), rs.getInt("delta"), rs.getString("reason"),
				rs.getString("reference_type"), referenceId == null ? null : referenceId.toString(),
				createdBy == null ? null : createdBy.toString(), rs.getString("created_by_name"),
				iso(rs.getObject("created_at", OffsetDateTime.class)));
	}

	private String like(String value) {
		return value == null || value.isBlank() ? null : "%" + value.trim() + "%";
	}

	private String normalizedSearch(String value) {
		return value == null || value.isBlank() ? "" : value.trim();
	}

	private String iso(OffsetDateTime value) {
		return DateTimeFormatter.ISO_OFFSET_DATE_TIME.format(value);
	}
}

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
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin")
public class AdminRemainingController {
	private final AdminRemainingService service;

	public AdminRemainingController(AdminRemainingService service) {
		this.service = service;
	}

	@GetMapping("/users")
	public ApiResponse<List<AdminUserDto>> users(@RequestParam(defaultValue = "1") int page,
			@RequestParam(defaultValue = "20") int pageSize, @RequestParam(required = false) String role,
			@RequestParam(required = false) String status, @RequestParam(required = false) String search) {
		Page<AdminUserDto> result = service.users(new PageRequestParams(page, pageSize, search, "createdAt", "desc"), role, status);
		return ApiResponse.page(result.getContent(), (int) result.getTotalElements(), page, pageSize);
	}

	@GetMapping("/users/{id}")
	public ApiResponse<AdminUserDto> user(@PathVariable String id) {
		return ApiResponse.ok(service.user(id));
	}

	@PatchMapping("/users/{id}")
	public ApiResponse<AdminUserDto> updateUser(@PathVariable String id, @Valid @RequestBody AdminUserRequest request) {
		return ApiResponse.ok(service.updateUser(id, request));
	}

	@PatchMapping("/users/{id}/status")
	public ApiResponse<AdminUserDto> updateUserStatus(@PathVariable String id, @Valid @RequestBody StatusRequest request) {
		return ApiResponse.ok(service.updateUserStatus(id, request.status()));
	}

	@DeleteMapping("/users/{id}")
	public ResponseEntity<Void> deleteUser(@PathVariable String id) {
		service.delete("admin_users", id);
		return ResponseEntity.noContent().build();
	}

	@PostMapping("/notifications/broadcast")
	public ApiResponse<List<NotificationDto>> broadcast(@Valid @RequestBody BroadcastRequest request) {
		return ApiResponse.ok(service.broadcast(request));
	}

	@PostMapping("/notifications/send-to-user")
	public ApiResponse<NotificationDto> sendToUser(@Valid @RequestBody SendNotificationRequest request) {
		return ApiResponse.ok(service.sendToUser(request));
	}

	@GetMapping("/suppliers")
	public ApiResponse<List<SupplierDto>> suppliers(@RequestParam(defaultValue = "1") int page,
			@RequestParam(defaultValue = "20") int pageSize, @RequestParam(required = false) String search,
			@RequestParam(required = false) Boolean isActive) {
		Page<SupplierDto> result = service.suppliers(new PageRequestParams(page, pageSize, search, "createdAt", "desc"), isActive);
		return ApiResponse.page(result.getContent(), (int) result.getTotalElements(), page, pageSize);
	}

	@PostMapping("/suppliers")
	public ResponseEntity<ApiResponse<SupplierDto>> createSupplier(@Valid @RequestBody SupplierRequest request) {
		return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(service.createSupplier(request)));
	}

	@PatchMapping("/suppliers/{id}")
	public ApiResponse<SupplierDto> updateSupplier(@PathVariable String id, @Valid @RequestBody SupplierRequest request) {
		return ApiResponse.ok(service.updateSupplier(id, request));
	}

	@GetMapping("/installment-plans")
	public ApiResponse<List<InstallmentPlanDto>> installmentPlans() {
		return ApiResponse.ok(service.installmentPlans());
	}

	@PostMapping("/installment-plans")
	public ResponseEntity<ApiResponse<InstallmentPlanDto>> createInstallment(@Valid @RequestBody InstallmentPlanRequest request) {
		return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(service.createInstallment(request)));
	}

	@PatchMapping("/installment-plans/{id}")
	public ApiResponse<InstallmentPlanDto> updateInstallment(@PathVariable String id,
			@Valid @RequestBody InstallmentPlanRequest request) {
		return ApiResponse.ok(service.updateInstallment(id, request));
	}

	@DeleteMapping("/installment-plans/{id}")
	public ResponseEntity<Void> deleteInstallment(@PathVariable String id) {
		service.delete("installment_plans", id);
		return ResponseEntity.noContent().build();
	}

	@GetMapping("/warranty")
	public ApiResponse<List<WarrantyItemDto>> warranty(@RequestParam(defaultValue = "1") int page,
			@RequestParam(defaultValue = "20") int pageSize, @RequestParam(required = false) String status,
			@RequestParam(required = false) String search) {
		Page<WarrantyItemDto> result = service.warranty(new PageRequestParams(page, pageSize, search, "createdAt", "desc"), status);
		return ApiResponse.page(result.getContent(), (int) result.getTotalElements(), page, pageSize);
	}

	@PostMapping("/warranty")
	public ResponseEntity<ApiResponse<WarrantyItemDto>> createWarranty(@Valid @RequestBody WarrantyCreateRequest request) {
		return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(service.createWarranty(request)));
	}

	@PostMapping("/reviews/{id}/reply")
	public ResponseEntity<ApiResponse<ReviewReplyDto>> replyReview(@PathVariable String id, @Valid @RequestBody ReplyRequest request) {
		return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(service.replyReview(id, request)));
	}

	@PostMapping("/combos")
	public ResponseEntity<ApiResponse<ComboDto>> createCombo(@Valid @RequestBody ComboRequest request) {
		return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(service.createCombo(request)));
	}

	@PatchMapping("/combos/{id}")
	public ApiResponse<ComboDto> updateCombo(@PathVariable String id, @Valid @RequestBody ComboRequest request) {
		return ApiResponse.ok(service.updateCombo(id, request));
	}

	@DeleteMapping("/combos/{id}")
	public ResponseEntity<Void> deleteCombo(@PathVariable String id) {
		service.delete("product_combos", id);
		return ResponseEntity.noContent().build();
	}

	@PostMapping("/blog")
	public ResponseEntity<ApiResponse<BlogPostDto>> createBlog(@Valid @RequestBody BlogPostRequest request) {
		return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(service.createBlog(request)));
	}

	@PatchMapping("/blog/{id}")
	public ApiResponse<BlogPostDto> updateBlog(@PathVariable String id, @Valid @RequestBody BlogPostRequest request) {
		return ApiResponse.ok(service.updateBlog(id, request));
	}

	@DeleteMapping("/blog/{id}")
	public ResponseEntity<Void> deleteBlog(@PathVariable String id) {
		service.delete("blog_posts", id);
		return ResponseEntity.noContent().build();
	}

	public record AdminUserRequest(@NotBlank String fullName, @NotBlank String email, String phone, String role,
			String status, String avatarUrl) {
	}
	public record StatusRequest(@NotBlank String status) {
	}
	public record BroadcastRequest(@NotBlank String type, @NotBlank String title, @NotBlank String message,
			String priority, String category, String actionUrl, String actionLabel) {
	}
	public record SendNotificationRequest(@NotBlank String userId, @NotBlank String type, @NotBlank String title,
			@NotBlank String message, String priority, String category, String actionUrl, String actionLabel) {
	}
	public record SupplierRequest(@NotBlank String name, String contactPerson, String phone, String email, String address,
			List<String> categories, String paymentTerms, Boolean isActive) {
	}
	public record InstallmentPlanRequest(@NotBlank String bankName, String logoUrl, @NotNull Integer months,
			@NotNull java.math.BigDecimal interestRate, @NotNull Long minAmount, Long maxAmount, Boolean isActive) {
	}
	public record WarrantyCreateRequest(@NotBlank String orderId, @NotBlank String productId, @NotBlank String productName,
			String productImage, String brand, String serialNumber, Integer warrantyMonths, String customerId,
			String customerName, String customerPhone) {
	}
	public record ReplyRequest(@NotBlank String content, String adminName) {
	}
	public record ComboRequest(@NotBlank String name, String description, List<String> productIds, Long price, String status) {
	}
	public record BlogPostRequest(@NotBlank String title, String slug, String content, String excerpt, String status,
			String coverImage) {
	}

	public record AdminUserDto(String id, String fullName, String email, String phone, String role, String status,
			String avatarUrl, String createdAt, String updatedAt) {
	}
	public record NotificationDto(String id, String userId, String type, String title, String message, boolean isRead,
			String priority, String category, String actionUrl, String actionLabel, boolean isActionable, String createdAt) {
	}
	public record SupplierDto(String id, String name, String contactPerson, String phone, String email, String address,
			List<String> categories, String paymentTerms, boolean isActive, String createdAt, String updatedAt) {
	}
	public record InstallmentPlanDto(String id, String bankName, String logoUrl, int months,
			java.math.BigDecimal interestRate, long minAmount, Long maxAmount, boolean isActive, String createdAt, String updatedAt) {
	}
	public record WarrantyItemDto(String id, String orderId, String productId, String customerId, String customerName,
			String customerPhone, String productName, String serialNumber, String warrantyExpiry, String status, String createdAt) {
	}
	public record ReviewReplyDto(String id, String reviewId, String adminName, String content, String createdAt) {
	}
	public record ComboDto(String id, String name, String description, List<String> productIds, long price, String status,
			String createdAt, String updatedAt) {
	}
	public record BlogPostDto(String id, String title, String slug, String content, String excerpt, String status,
			String coverImage, String createdAt, String updatedAt) {
	}
}

@Service
class AdminRemainingService {
	private final JdbcTemplate jdbc;

	AdminRemainingService(JdbcTemplate jdbc) {
		this.jdbc = jdbc;
	}

	@Transactional(readOnly = true)
	Page<AdminRemainingController.AdminUserDto> users(PageRequestParams params, String role, String status) {
		return page("admin_users", "role::text", role, "status::text", status, params, this::userRow);
	}

	@Transactional(readOnly = true)
	AdminRemainingController.AdminUserDto user(String id) {
		return one("SELECT * FROM admin_users WHERE id = ?", this::userRow, id);
	}

	@Transactional
	AdminRemainingController.AdminUserDto updateUser(String id, AdminRemainingController.AdminUserRequest request) {
		jdbc.update("""
				UPDATE admin_users SET full_name=?, email=?, phone=?, role=?::admin_user_role, status=?::admin_user_status,
				    avatar_url=?, updated_at=NOW() WHERE id=?
				""", request.fullName(), request.email(), value(request.phone()), upper(request.role(), "CUSTOMER"),
				upper(request.status(), "ACTIVE"), request.avatarUrl(), uuid(id));
		return user(id);
	}

	@Transactional
	AdminRemainingController.AdminUserDto updateUserStatus(String id, String status) {
		jdbc.update("UPDATE admin_users SET status=?::admin_user_status, updated_at=NOW() WHERE id=?", upper(status, "ACTIVE"), uuid(id));
		return user(id);
	}

	@Transactional
	List<AdminRemainingController.NotificationDto> broadcast(AdminRemainingController.BroadcastRequest request) {
		List<UUID> users = jdbc.query("SELECT id FROM admin_users WHERE status = 'ACTIVE'", (rs, row) -> rs.getObject("id", UUID.class));
		return users.stream().map(userId -> insertNotification(userId.toString(), request.type(), request.title(), request.message(),
				request.priority(), request.category(), request.actionUrl(), request.actionLabel())).toList();
	}

	@Transactional
	AdminRemainingController.NotificationDto sendToUser(AdminRemainingController.SendNotificationRequest request) {
		return insertNotification(request.userId(), request.type(), request.title(), request.message(), request.priority(),
				request.category(), request.actionUrl(), request.actionLabel());
	}

	@Transactional(readOnly = true)
	Page<AdminRemainingController.SupplierDto> suppliers(PageRequestParams params, Boolean isActive) {
		int page = params.normalizedPage();
		int size = params.normalizedPageSize();
		String search = params.search() == null ? "" : params.search().trim().toLowerCase();
		Long total = jdbc.queryForObject("""
				SELECT COUNT(*) FROM internal_suppliers
				WHERE (? = '' OR LOWER(name) LIKE ? OR LOWER(email) LIKE ?)
				  AND (?::boolean IS NULL OR is_active = ?::boolean)
				""", Long.class, search, like(search), like(search), isActive, isActive);
		List<AdminRemainingController.SupplierDto> rows = jdbc.query("""
				SELECT * FROM internal_suppliers
				WHERE (? = '' OR LOWER(name) LIKE ? OR LOWER(email) LIKE ?)
				  AND (?::boolean IS NULL OR is_active = ?::boolean)
				ORDER BY created_at DESC LIMIT ? OFFSET ?
				""", this::supplierRow, search, like(search), like(search), isActive, isActive, size, (page - 1) * size);
		return new PageImpl<>(rows, PageRequest.of(page - 1, size), total == null ? 0 : total);
	}

	@Transactional
	AdminRemainingController.SupplierDto createSupplier(AdminRemainingController.SupplierRequest request) {
		UUID id = UUID.randomUUID();
		jdbc.update("""
				INSERT INTO internal_suppliers (id,name,contact_person,phone,email,address,categories,payment_terms,is_active)
				VALUES (?,?,?,?,?,?,string_to_array(?, ',')::text[],?,?)
				""", id, request.name(), value(request.contactPerson()), value(request.phone()), value(request.email()),
				value(request.address()), csv(request.categories()), value(request.paymentTerms()), request.isActive() == null || request.isActive());
		return one("SELECT * FROM internal_suppliers WHERE id=?", this::supplierRow, id.toString());
	}

	@Transactional
	AdminRemainingController.SupplierDto updateSupplier(String id, AdminRemainingController.SupplierRequest request) {
		jdbc.update("""
				UPDATE internal_suppliers SET name=?, contact_person=?, phone=?, email=?, address=?,
				  categories=string_to_array(?, ',')::text[], payment_terms=?, is_active=?, updated_at=NOW() WHERE id=?
				""", request.name(), value(request.contactPerson()), value(request.phone()), value(request.email()),
				value(request.address()), csv(request.categories()), value(request.paymentTerms()),
				request.isActive() == null || request.isActive(), uuid(id));
		return one("SELECT * FROM internal_suppliers WHERE id=?", this::supplierRow, id);
	}

	@Transactional(readOnly = true)
	List<AdminRemainingController.InstallmentPlanDto> installmentPlans() {
		return jdbc.query("SELECT * FROM installment_plans ORDER BY created_at DESC", this::installmentRow);
	}

	@Transactional
	AdminRemainingController.InstallmentPlanDto createInstallment(AdminRemainingController.InstallmentPlanRequest request) {
		UUID id = UUID.randomUUID();
		jdbc.update("""
				INSERT INTO installment_plans (id,bank_name,logo_url,months,interest_rate,min_amount,max_amount,is_active)
				VALUES (?,?,?,?,?,?,?,?)
				""", id, request.bankName(), request.logoUrl(), request.months(), request.interestRate(),
				request.minAmount(), request.maxAmount(), request.isActive() == null || request.isActive());
		return one("SELECT * FROM installment_plans WHERE id=?", this::installmentRow, id.toString());
	}

	@Transactional
	AdminRemainingController.InstallmentPlanDto updateInstallment(String id, AdminRemainingController.InstallmentPlanRequest request) {
		jdbc.update("""
				UPDATE installment_plans SET bank_name=?, logo_url=?, months=?, interest_rate=?, min_amount=?,
				  max_amount=?, is_active=?, updated_at=NOW() WHERE id=?
				""", request.bankName(), request.logoUrl(), request.months(), request.interestRate(),
				request.minAmount(), request.maxAmount(), request.isActive() == null || request.isActive(), uuid(id));
		return one("SELECT * FROM installment_plans WHERE id=?", this::installmentRow, id);
	}

	@Transactional(readOnly = true)
	Page<AdminRemainingController.WarrantyItemDto> warranty(PageRequestParams params, String status) {
		int page = params.normalizedPage();
		int size = params.normalizedPageSize();
		String s = upper(status, "");
		String search = params.search() == null ? "" : params.search().trim().toLowerCase();
		Long total = jdbc.queryForObject("""
				SELECT COUNT(*) FROM warranty_items
				WHERE (?='' OR status::text=?) AND (?='' OR LOWER(product_name) LIKE ? OR LOWER(customer_name) LIKE ?)
				""", Long.class, s, s, search, like(search), like(search));
		List<AdminRemainingController.WarrantyItemDto> rows = jdbc.query("""
				SELECT * FROM warranty_items
				WHERE (?='' OR status::text=?) AND (?='' OR LOWER(product_name) LIKE ? OR LOWER(customer_name) LIKE ?)
				ORDER BY created_at DESC LIMIT ? OFFSET ?
				""", this::warrantyRow, s, s, search, like(search), like(search), size, (page - 1) * size);
		return new PageImpl<>(rows, PageRequest.of(page - 1, size), total == null ? 0 : total);
	}

	@Transactional
	AdminRemainingController.WarrantyItemDto createWarranty(AdminRemainingController.WarrantyCreateRequest request) {
		UUID id = UUID.randomUUID();
		UUID customerId = request.customerId() == null ? UUID.fromString("00000000-0000-4000-8000-000000000001") : uuid(request.customerId());
		int months = request.warrantyMonths() == null ? 12 : request.warrantyMonths();
		jdbc.update("""
				INSERT INTO warranty_items (
				  id, order_id, product_id, customer_id, customer_name, customer_phone, product_name, product_image,
				  brand, serial_number, warranty_months, warranty_start, warranty_expiry, status
				)
				VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_DATE, CURRENT_DATE + (? || ' months')::interval, 'ACTIVE')
				""", id, uuid(request.orderId()), uuid(request.productId()), customerId, value(request.customerName()),
				value(request.customerPhone()), request.productName(), request.productImage(), request.brand(),
				request.serialNumber(), months, months);
		return one("SELECT * FROM warranty_items WHERE id=?", this::warrantyRow, id.toString());
	}

	@Transactional
	AdminRemainingController.ReviewReplyDto replyReview(String reviewId, AdminRemainingController.ReplyRequest request) {
		UUID id = UUID.randomUUID();
		jdbc.update("INSERT INTO review_replies (id, review_id, admin_name, content) VALUES (?, ?, ?, ?)", id,
				uuid(reviewId), value(request.adminName(), "Admin CELLPHONES"), request.content());
		return one("SELECT * FROM review_replies WHERE id=?", this::replyRow, id.toString());
	}

	@Transactional
	AdminRemainingController.ComboDto createCombo(AdminRemainingController.ComboRequest request) {
		UUID id = UUID.randomUUID();
		jdbc.update("INSERT INTO product_combos (id,name,description,product_ids,price,status) VALUES (?,?,?,string_to_array(?, ',')::uuid[],?,?::combo_status)",
				id, request.name(), value(request.description()), csv(request.productIds()), request.price() == null ? 0 : request.price(),
				upper(request.status(), "ACTIVE"));
		return one("SELECT * FROM product_combos WHERE id=?", this::comboRow, id.toString());
	}

	@Transactional
	AdminRemainingController.ComboDto updateCombo(String id, AdminRemainingController.ComboRequest request) {
		jdbc.update("UPDATE product_combos SET name=?, description=?, product_ids=string_to_array(?, ',')::uuid[], price=?, status=?::combo_status, updated_at=NOW() WHERE id=?",
				request.name(), value(request.description()), csv(request.productIds()), request.price() == null ? 0 : request.price(),
				upper(request.status(), "ACTIVE"), uuid(id));
		return one("SELECT * FROM product_combos WHERE id=?", this::comboRow, id);
	}

	@Transactional
	AdminRemainingController.BlogPostDto createBlog(AdminRemainingController.BlogPostRequest request) {
		UUID id = UUID.randomUUID();
		jdbc.update("INSERT INTO blog_posts (id,title,slug,content,excerpt,status,cover_image) VALUES (?,?,?,?,?,?::blog_status,?)",
				id, request.title(), slug(request.slug(), request.title()), value(request.content()), value(request.excerpt()),
				upper(request.status(), "DRAFT"), request.coverImage());
		return one("SELECT * FROM blog_posts WHERE id=?", this::blogRow, id.toString());
	}

	@Transactional
	AdminRemainingController.BlogPostDto updateBlog(String id, AdminRemainingController.BlogPostRequest request) {
		jdbc.update("UPDATE blog_posts SET title=?, slug=?, content=?, excerpt=?, status=?::blog_status, cover_image=?, updated_at=NOW() WHERE id=?",
				request.title(), slug(request.slug(), request.title()), value(request.content()), value(request.excerpt()),
				upper(request.status(), "DRAFT"), request.coverImage(), uuid(id));
		return one("SELECT * FROM blog_posts WHERE id=?", this::blogRow, id);
	}

	@Transactional
	void delete(String table, String id) {
		int rows = jdbc.update("DELETE FROM " + table + " WHERE id=?", uuid(id));
		if (rows == 0) throw new AppException(ErrorCode.NOT_FOUND);
	}

	private AdminRemainingController.NotificationDto insertNotification(String userId, String type, String title, String message,
			String priority, String category, String actionUrl, String actionLabel) {
		UUID id = UUID.randomUUID();
		jdbc.update("""
				INSERT INTO app_notifications (id,user_id,type,title,message,priority,category,action_url,action_label,is_actionable)
				VALUES (?, ?, ?::app_notification_type, ?, ?, ?::app_notification_priority, ?, ?, ?, ?)
				""", id, uuid(userId), upper(type, "SYSTEM"), title, message, upper(priority, "MEDIUM"),
				value(category, "system"), actionUrl, actionLabel, actionUrl != null && !actionUrl.isBlank());
		return one("SELECT * FROM app_notifications WHERE id=?", this::notificationRow, id.toString());
	}

	private <T> Page<T> page(String table, String col1, String v1, String col2, String v2, PageRequestParams params,
			org.springframework.jdbc.core.RowMapper<T> mapper) {
		int page = params.normalizedPage();
		int size = params.normalizedPageSize();
		String a = upper(v1, "");
		String b = upper(v2, "");
		String search = params.search() == null ? "" : params.search().trim().toLowerCase();
		Long total = jdbc.queryForObject("SELECT COUNT(*) FROM " + table + " WHERE (?='' OR " + col1 + "=?) AND (?='' OR " + col2 + "=?) AND (?='' OR LOWER(full_name) LIKE ? OR LOWER(email) LIKE ?)",
				Long.class, a, a, b, b, search, like(search), like(search));
		List<T> rows = jdbc.query("SELECT * FROM " + table + " WHERE (?='' OR " + col1 + "=?) AND (?='' OR " + col2 + "=?) AND (?='' OR LOWER(full_name) LIKE ? OR LOWER(email) LIKE ?) ORDER BY created_at DESC LIMIT ? OFFSET ?",
				mapper, a, a, b, b, search, like(search), like(search), size, (page - 1) * size);
		return new PageImpl<>(rows, PageRequest.of(page - 1, size), total == null ? 0 : total);
	}

	private AdminRemainingController.AdminUserDto userRow(ResultSet rs, int row) throws SQLException {
		return new AdminRemainingController.AdminUserDto(rs.getObject("id").toString(), rs.getString("full_name"),
				rs.getString("email"), rs.getString("phone"), rs.getString("role"), rs.getString("status"),
				rs.getString("avatar_url"), iso(rs.getObject("created_at", OffsetDateTime.class)), iso(rs.getObject("updated_at", OffsetDateTime.class)));
	}
	private AdminRemainingController.NotificationDto notificationRow(ResultSet rs, int row) throws SQLException {
		return new AdminRemainingController.NotificationDto(rs.getObject("id").toString(), rs.getObject("user_id").toString(),
				rs.getString("type"), rs.getString("title"), rs.getString("message"), rs.getBoolean("is_read"),
				rs.getString("priority"), rs.getString("category"), rs.getString("action_url"), rs.getString("action_label"),
				rs.getBoolean("is_actionable"), iso(rs.getObject("created_at", OffsetDateTime.class)));
	}
	private AdminRemainingController.SupplierDto supplierRow(ResultSet rs, int row) throws SQLException {
		return new AdminRemainingController.SupplierDto(rs.getObject("id").toString(), rs.getString("name"),
				rs.getString("contact_person"), rs.getString("phone"), rs.getString("email"), rs.getString("address"),
				List.of((String[]) rs.getArray("categories").getArray()), rs.getString("payment_terms"), rs.getBoolean("is_active"),
				iso(rs.getObject("created_at", OffsetDateTime.class)), iso(rs.getObject("updated_at", OffsetDateTime.class)));
	}
	private AdminRemainingController.InstallmentPlanDto installmentRow(ResultSet rs, int row) throws SQLException {
		return new AdminRemainingController.InstallmentPlanDto(rs.getObject("id").toString(), rs.getString("bank_name"),
				rs.getString("logo_url"), rs.getInt("months"), rs.getBigDecimal("interest_rate"), rs.getLong("min_amount"),
				rs.getObject("max_amount") == null ? null : rs.getLong("max_amount"), rs.getBoolean("is_active"),
				iso(rs.getObject("created_at", OffsetDateTime.class)), iso(rs.getObject("updated_at", OffsetDateTime.class)));
	}
	private AdminRemainingController.WarrantyItemDto warrantyRow(ResultSet rs, int row) throws SQLException {
		return new AdminRemainingController.WarrantyItemDto(rs.getObject("id").toString(), rs.getObject("order_id").toString(),
				rs.getObject("product_id").toString(), rs.getObject("customer_id").toString(), rs.getString("customer_name"),
				rs.getString("customer_phone"), rs.getString("product_name"), rs.getString("serial_number"),
				rs.getObject("warranty_expiry").toString(), rs.getString("status"), iso(rs.getObject("created_at", OffsetDateTime.class)));
	}
	private AdminRemainingController.ReviewReplyDto replyRow(ResultSet rs, int row) throws SQLException {
		return new AdminRemainingController.ReviewReplyDto(rs.getObject("id").toString(), rs.getObject("review_id").toString(),
				rs.getString("admin_name"), rs.getString("content"), iso(rs.getObject("created_at", OffsetDateTime.class)));
	}
	private AdminRemainingController.ComboDto comboRow(ResultSet rs, int row) throws SQLException {
		return new AdminRemainingController.ComboDto(rs.getObject("id").toString(), rs.getString("name"), rs.getString("description"),
				List.of((UUID[]) rs.getArray("product_ids").getArray()).stream().map(UUID::toString).toList(), rs.getLong("price"),
				rs.getString("status"), iso(rs.getObject("created_at", OffsetDateTime.class)), iso(rs.getObject("updated_at", OffsetDateTime.class)));
	}
	private AdminRemainingController.BlogPostDto blogRow(ResultSet rs, int row) throws SQLException {
		return new AdminRemainingController.BlogPostDto(rs.getObject("id").toString(), rs.getString("title"),
				rs.getString("slug"), rs.getString("content"), rs.getString("excerpt"), rs.getString("status"),
				rs.getString("cover_image"), iso(rs.getObject("created_at", OffsetDateTime.class)), iso(rs.getObject("updated_at", OffsetDateTime.class)));
	}

	private <T> T one(String sql, org.springframework.jdbc.core.RowMapper<T> mapper, String id) {
		try {
			return jdbc.queryForObject(sql, mapper, uuid(id));
		}
		catch (EmptyResultDataAccessException exception) {
			throw new AppException(ErrorCode.NOT_FOUND);
		}
	}
	private UUID uuid(String id) { return UUID.fromString(id); }
	private String value(String v) { return v == null ? "" : v; }
	private String value(String v, String fallback) { return v == null || v.isBlank() ? fallback : v; }
	private String upper(String v, String fallback) { return v == null || v.isBlank() ? fallback : v.trim().toUpperCase(); }
	private String csv(List<String> values) { return values == null ? "" : String.join(",", values); }
	private String like(String v) { return v == null || v.isBlank() ? "" : "%" + v + "%"; }
	private String slug(String slug, String title) { return value(slug).isBlank() ? title.toLowerCase().replaceAll("[^a-z0-9]+", "-").replaceAll("(^-|-$)", "") : slug; }
	private String iso(OffsetDateTime value) { return DateTimeFormatter.ISO_OFFSET_DATE_TIME.format(value); }
}

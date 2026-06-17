package com.b2b.ecommerce.admin;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import com.b2b.ecommerce.common.ApiResponse;
import com.b2b.ecommerce.common.AppException;
import com.b2b.ecommerce.common.ErrorCode;
import com.b2b.ecommerce.common.PageRequestParams;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
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
public class AdminReportsSettingsController {
	private final AdminReportsSettingsService service;

	public AdminReportsSettingsController(AdminReportsSettingsService service) {
		this.service = service;
	}

	@GetMapping("/reports/revenue")
	public ApiResponse<List<ReportPointDto>> revenueReport(@RequestParam(required = false) String from,
			@RequestParam(required = false) String to) {
		return ApiResponse.ok(service.revenueReport(from, to));
	}

	@GetMapping("/reports/products")
	public ApiResponse<List<ProductReportDto>> productReport() {
		return ApiResponse.ok(service.productReport());
	}

	@GetMapping("/reports/customers")
	public ApiResponse<List<CustomerReportDto>> customerReport() {
		return ApiResponse.ok(service.customerReport());
	}

	@GetMapping("/reports/inventory")
	public ApiResponse<List<InventoryReportDto>> inventoryReport() {
		return ApiResponse.ok(service.inventoryReport());
	}

	@GetMapping("/reports/returns")
	public ApiResponse<List<StatusCountDto>> returnsReport() {
		return ApiResponse.ok(service.returnsReport());
	}

	@GetMapping("/reports/export")
	public ResponseEntity<byte[]> exportReport(@RequestParam(defaultValue = "revenue") String type) {
		byte[] data = service.exportReport(type);
		return ResponseEntity.ok()
				.header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"admin-report-" + type + ".csv\"")
				.contentType(MediaType.parseMediaType("text/csv"))
				.body(data);
	}

	@GetMapping("/settings")
	public ApiResponse<List<SettingDto>> settings() {
		return ApiResponse.ok(service.settings());
	}

	@PatchMapping("/settings")
	public ApiResponse<List<SettingDto>> updateSettings(@RequestBody SettingsPatchRequest request) {
		return ApiResponse.ok(service.updateSettings(request));
	}

	@GetMapping("/banners")
	public ApiResponse<List<BannerDto>> banners() {
		return ApiResponse.ok(service.banners());
	}

	@GetMapping("/settings/banners")
	public ApiResponse<List<BannerDto>> settingsBanners() {
		return banners();
	}

	@PostMapping("/banners")
	public ApiResponse<BannerDto> createBanner(@Valid @RequestBody BannerRequest request) {
		return ApiResponse.ok(service.createBanner(request));
	}

	@PostMapping("/settings/banners")
	public ApiResponse<BannerDto> createSettingsBanner(@Valid @RequestBody BannerRequest request) {
		return createBanner(request);
	}

	@PatchMapping("/banners/{id}")
	public ApiResponse<BannerDto> updateBanner(@PathVariable String id, @Valid @RequestBody BannerRequest request) {
		return ApiResponse.ok(service.updateBanner(id, request));
	}

	@PatchMapping("/settings/banners/{id}")
	public ApiResponse<BannerDto> updateSettingsBanner(@PathVariable String id, @Valid @RequestBody BannerRequest request) {
		return updateBanner(id, request);
	}

	@DeleteMapping("/banners/{id}")
	public ResponseEntity<Void> deleteBanner(@PathVariable String id) {
		service.delete("banners", id);
		return ResponseEntity.noContent().build();
	}

	@DeleteMapping("/settings/banners/{id}")
	public ResponseEntity<Void> deleteSettingsBanner(@PathVariable String id) {
		return deleteBanner(id);
	}

	@GetMapping("/email-templates")
	public ApiResponse<List<EmailTemplateDto>> emailTemplates() {
		return ApiResponse.ok(service.emailTemplates());
	}

	@GetMapping("/settings/email-templates")
	public ApiResponse<List<EmailTemplateDto>> settingsEmailTemplates() {
		return emailTemplates();
	}

	@PostMapping("/email-templates")
	public ApiResponse<EmailTemplateDto> createEmailTemplate(@Valid @RequestBody EmailTemplateRequest request) {
		return ApiResponse.ok(service.createEmailTemplate(request));
	}

	@PostMapping("/settings/email-templates")
	public ApiResponse<EmailTemplateDto> createSettingsEmailTemplate(@Valid @RequestBody EmailTemplateRequest request) {
		return createEmailTemplate(request);
	}

	@PatchMapping("/email-templates/{id}")
	public ApiResponse<EmailTemplateDto> updateEmailTemplate(@PathVariable String id,
			@Valid @RequestBody EmailTemplateRequest request) {
		return ApiResponse.ok(service.updateEmailTemplate(id, request));
	}

	@PatchMapping("/settings/email-templates/{id}")
	public ApiResponse<EmailTemplateDto> updateSettingsEmailTemplate(@PathVariable String id,
			@Valid @RequestBody EmailTemplateRequest request) {
		return updateEmailTemplate(id, request);
	}

	@PostMapping("/email-templates/{id}/preview")
	public ApiResponse<EmailPreviewDto> previewEmailTemplate(@PathVariable String id,
			@RequestBody(required = false) PreviewRequest request) {
		return ApiResponse.ok(service.previewEmailTemplate(id, request));
	}

	@PostMapping("/settings/email-templates/{id}/preview")
	public ApiResponse<EmailPreviewDto> previewSettingsEmailTemplate(@PathVariable String id,
			@RequestBody(required = false) PreviewRequest request) {
		return previewEmailTemplate(id, request);
	}

	@DeleteMapping("/email-templates/{id}")
	public ResponseEntity<Void> deleteEmailTemplate(@PathVariable String id) {
		service.delete("email_templates", id);
		return ResponseEntity.noContent().build();
	}

	@DeleteMapping("/settings/email-templates/{id}")
	public ResponseEntity<Void> deleteSettingsEmailTemplate(@PathVariable String id) {
		return deleteEmailTemplate(id);
	}

	@GetMapping("/seo")
	public ApiResponse<List<SeoSettingDto>> seoSettings() {
		return ApiResponse.ok(service.seoSettings());
	}

	@GetMapping("/settings/seo")
	public ApiResponse<List<SeoSettingDto>> settingsSeo() {
		return seoSettings();
	}

	@PatchMapping("/seo/{pageKey}")
	public ApiResponse<SeoSettingDto> updateSeo(@PathVariable String pageKey, @Valid @RequestBody SeoRequest request) {
		return ApiResponse.ok(service.updateSeo(pageKey, request));
	}

	@PatchMapping("/settings/seo/{pageKey}")
	public ApiResponse<SeoSettingDto> updateSettingsSeo(@PathVariable String pageKey, @Valid @RequestBody SeoRequest request) {
		return updateSeo(pageKey, request);
	}

	@GetMapping("/branches")
	public ApiResponse<List<BranchDto>> branches() {
		return ApiResponse.ok(service.branches());
	}

	@PostMapping("/branches")
	public ApiResponse<BranchDto> createBranch(@Valid @RequestBody BranchRequest request) {
		return ApiResponse.ok(service.createBranch(request));
	}

	@PatchMapping("/branches/{id}")
	public ApiResponse<BranchDto> updateBranch(@PathVariable String id, @Valid @RequestBody BranchRequest request) {
		return ApiResponse.ok(service.updateBranch(id, request));
	}

	@PatchMapping("/branches/{id}/toggle")
	public ApiResponse<BranchDto> toggleBranch(@PathVariable String id) {
		return ApiResponse.ok(service.toggleBranch(id));
	}

	@DeleteMapping("/branches/{id}")
	public ResponseEntity<Void> deleteBranch(@PathVariable String id) {
		service.delete("branches", id);
		return ResponseEntity.noContent().build();
	}

	@GetMapping("/staff")
	public ApiResponse<List<StaffDto>> staff() {
		return ApiResponse.ok(service.staff());
	}

	@GetMapping("/staff/{id}")
	public ApiResponse<StaffDto> staffDetail(@PathVariable String id) {
		return ApiResponse.ok(service.staff(id));
	}

	@PostMapping("/staff")
	public ApiResponse<StaffDto> createStaff(@Valid @RequestBody StaffRequest request) {
		return ApiResponse.ok(service.createStaff(request));
	}

	@PatchMapping("/staff/{id}")
	public ApiResponse<StaffDto> updateStaff(@PathVariable String id, @Valid @RequestBody StaffRequest request) {
		return ApiResponse.ok(service.updateStaff(id, request));
	}

	@PatchMapping("/staff/{id}/deactivate")
	public ApiResponse<StaffDto> deactivateStaff(@PathVariable String id) {
		return ApiResponse.ok(service.deactivateStaff(id));
	}

	@GetMapping("/activity-logs")
	public ApiResponse<List<ActivityLogDto>> activityLogs(
			@RequestParam(defaultValue = "1") int page,
			@RequestParam(defaultValue = "20") int pageSize,
			@RequestParam(required = false) String action,
			@RequestParam(required = false) String entity,
			@RequestParam(required = false) String userId,
			@RequestParam(required = false) String search) {
		PageRequestParams params = new PageRequestParams(page, pageSize, null, "createdAt", "desc");
		Page<ActivityLogDto> result = service.activityLogs(params, action, entity, userId, search);
		return ApiResponse.page(result.getContent(), (int) result.getTotalElements(), params.normalizedPage(),
				params.normalizedPageSize());
	}

	@GetMapping("/activity-logs/stats")
	public ApiResponse<ActivityLogStatsDto> activityLogStats() {
		return ApiResponse.ok(service.activityLogStats());
	}

	public record ReportPointDto(String date, long revenue, long orderCount) {
	}

	public record ProductReportDto(String productId, String productName, String brand, long soldCount, long revenue) {
	}

	public record CustomerReportDto(String customerId, String customerName, String customerPhone, long orderCount,
			long totalSpent) {
	}

	public record InventoryReportDto(String productId, String productName, String brand, long variantCount, long stock,
			long lowStockVariantCount) {
	}

	public record StatusCountDto(String status, long count) {
	}

	public record SettingDto(String key, JsonNode value, String updatedAt) {
	}

	public record SettingsPatchRequest(Map<String, JsonNode> settings) {
	}

	public record BannerRequest(@NotBlank String title, @NotBlank String imageUrl, String linkUrl, String position,
			Boolean isActive, Integer sortOrder) {
	}

	public record BannerDto(String id, String title, String imageUrl, String linkUrl, String position, boolean isActive,
			int sortOrder, String createdAt, String updatedAt) {
	}

	public record EmailTemplateRequest(@NotBlank String templateKey, @NotBlank String subject, @NotBlank String body,
			Boolean isActive) {
	}

	public record EmailTemplateDto(String id, String templateKey, String subject, String body, boolean isActive,
			String updatedAt) {
	}

	public record PreviewRequest(Map<String, String> variables) {
	}

	public record EmailPreviewDto(String subject, String body) {
	}

	public record SeoRequest(@NotBlank String title, String description, List<String> keywords) {
	}

	public record SeoSettingDto(String id, String pageKey, String title, String description, List<String> keywords,
			String updatedAt) {
	}

	public record BranchRequest(@NotBlank String name, String phone, String address,
			String district, String city, String workingHours,
			Double lat, Double lng, Boolean isActive) {
	}

	public record BranchDto(String id, String name, String phone, String address,
			String district, String city, String workingHours,
			Double lat, Double lng, boolean isActive, String createdAt, String updatedAt) {
	}

	public record StaffRequest(@NotBlank String fullName, @NotBlank String email, String phone,
			String role, String branchId, String joinedAt, Boolean isActive) {
	}

	public record StaffDto(String id, String fullName, String email, String phone,
			String role, String branchId, String branchName, String joinedAt,
			boolean isActive, String createdAt, String updatedAt) {
	}

	public record ActivityLogDto(String id, String actorId, String actorName, String action, String entityType,
			String entityId, String note, String createdAt) {
	}

	public record ActivityLogStatsDto(long todayCount, long weekCount, long monthCount,
			List<StatusCountDto> byAction) {
	}
}

@Service
class AdminReportsSettingsService {
	private final JdbcTemplate jdbc;
	private final ObjectMapper mapper;

	AdminReportsSettingsService(JdbcTemplate jdbc) {
		this.jdbc = jdbc;
		this.mapper = new ObjectMapper();
	}

	@Transactional(readOnly = true)
	public List<AdminReportsSettingsController.ReportPointDto> revenueReport(String from, String to) {
		LocalDate fromDate = parseDate(from, LocalDate.now().minusDays(30));
		LocalDate toDate = parseDate(to, LocalDate.now());
		return jdbc.query("""
				SELECT o.created_at::date AS report_date,
				       COALESCE(SUM(o.total_amount) FILTER (
				           WHERE o.status = 'DELIVERED' AND o.payment_status = 'PAID'
				       ), 0)::bigint AS revenue,
				       COUNT(o.id) FILTER (
				           WHERE o.status = 'DELIVERED' AND o.payment_status = 'PAID'
				       )::bigint AS order_count
				FROM orders o
				WHERE o.created_at >= ?::date AND o.created_at < (?::date + INTERVAL '1 day')
				GROUP BY report_date
				ORDER BY report_date
				""", (rs, rowNum) -> new AdminReportsSettingsController.ReportPointDto(
				rs.getObject("report_date", LocalDate.class).toString(), rs.getLong("revenue"), rs.getLong("order_count")),
				fromDate, toDate);
	}

	@Transactional(readOnly = true)
	public List<AdminReportsSettingsController.ProductReportDto> productReport() {
		return jdbc.query("""
				SELECT p.id, p.name, p.brand,
				       COALESCE(SUM(oi.quantity) FILTER (
				           WHERE o.status = 'DELIVERED' AND o.payment_status = 'PAID'
				       ), 0)::bigint AS sold_count,
				       COALESCE(SUM(oi.total_price) FILTER (
				           WHERE o.status = 'DELIVERED' AND o.payment_status = 'PAID'
				       ), 0)::bigint AS revenue
				FROM products p
				LEFT JOIN order_items oi ON oi.product_id = p.id
				LEFT JOIN orders o ON o.id = oi.order_id
				GROUP BY p.id, p.name, p.brand
				ORDER BY revenue DESC, sold_count DESC
				LIMIT 50
				""", (rs, rowNum) -> new AdminReportsSettingsController.ProductReportDto(rs.getObject("id").toString(),
				rs.getString("name"), rs.getString("brand"), rs.getLong("sold_count"), rs.getLong("revenue")));
	}

	@Transactional(readOnly = true)
	public List<AdminReportsSettingsController.CustomerReportDto> customerReport() {
		return jdbc.query("""
				SELECT customer_id, customer_name, customer_phone, COUNT(*)::bigint AS order_count,
				       COALESCE(SUM(total_amount), 0)::bigint AS total_spent
				FROM orders
				GROUP BY customer_id, customer_name, customer_phone
				ORDER BY total_spent DESC
				LIMIT 50
				""", (rs, rowNum) -> new AdminReportsSettingsController.CustomerReportDto(
				rs.getObject("customer_id").toString(), rs.getString("customer_name"), rs.getString("customer_phone"),
				rs.getLong("order_count"), rs.getLong("total_spent")));
	}

	@Transactional(readOnly = true)
	public List<AdminReportsSettingsController.InventoryReportDto> inventoryReport() {
		return jdbc.query("""
				SELECT p.id, p.name, p.brand, COUNT(pv.id)::bigint AS variant_count,
				       COALESCE(SUM(pv.stock), 0)::bigint AS stock,
				       COUNT(*) FILTER (WHERE pv.stock <= pv.min_stock)::bigint AS low_stock_variant_count
				FROM products p
				LEFT JOIN product_variants pv ON pv.product_id = p.id
				GROUP BY p.id, p.name, p.brand
				ORDER BY low_stock_variant_count DESC, stock ASC
				LIMIT 50
				""", (rs, rowNum) -> new AdminReportsSettingsController.InventoryReportDto(rs.getObject("id").toString(),
				rs.getString("name"), rs.getString("brand"), rs.getLong("variant_count"), rs.getLong("stock"),
				rs.getLong("low_stock_variant_count")));
	}

	@Transactional(readOnly = true)
	public List<AdminReportsSettingsController.StatusCountDto> returnsReport() {
		return jdbc.query("""
				SELECT status::text AS status, COUNT(*)::bigint AS count
				FROM return_requests
				GROUP BY status
				ORDER BY status
				""", this::statusCount);
	}

	public byte[] exportReport(String type) {
		StringBuilder csv = new StringBuilder("type,status,count\n");
		for (AdminReportsSettingsController.StatusCountDto row : returnsReport()) {
			csv.append(type).append(',').append(row.status()).append(',').append(row.count()).append('\n');
		}
		return csv.toString().getBytes(java.nio.charset.StandardCharsets.UTF_8);
	}

	@Transactional(readOnly = true)
	public List<AdminReportsSettingsController.SettingDto> settings() {
		return jdbc.query("SELECT * FROM admin_settings ORDER BY setting_key", this::settingRow);
	}

	@Transactional
	public List<AdminReportsSettingsController.SettingDto> updateSettings(
			AdminReportsSettingsController.SettingsPatchRequest request) {
		if (request.settings() == null || request.settings().isEmpty()) {
			throw new AppException(ErrorCode.VALIDATION_ERROR, "Du lieu dau vao khong hop le",
					Map.of("settings", "settings khong duoc rong"));
		}
		request.settings().forEach((key, value) -> jdbc.update("""
				INSERT INTO admin_settings (setting_key, setting_value, updated_at)
				VALUES (?, ?::jsonb, NOW())
				ON CONFLICT (setting_key) DO UPDATE SET setting_value = EXCLUDED.setting_value, updated_at = NOW()
				""", key, value.toString()));
		return settings();
	}

	@Transactional(readOnly = true)
	public List<AdminReportsSettingsController.BannerDto> banners() {
		return jdbc.query("SELECT * FROM banners ORDER BY sort_order ASC, created_at DESC", this::bannerRow);
	}

	@Transactional
	public AdminReportsSettingsController.BannerDto createBanner(AdminReportsSettingsController.BannerRequest request) {
		UUID id = UUID.randomUUID();
		jdbc.update("""
				INSERT INTO banners (id, title, image_url, link_url, position, is_active, sort_order)
				VALUES (?, ?, ?, ?, ?, ?, ?)
				""", id, request.title(), request.imageUrl(), request.linkUrl(), fallback(request.position(), "HOME"),
				request.isActive() == null || request.isActive(), request.sortOrder() == null ? 0 : request.sortOrder());
		return banner(id.toString());
	}

	@Transactional
	public AdminReportsSettingsController.BannerDto updateBanner(String id, AdminReportsSettingsController.BannerRequest request) {
		jdbc.update("""
				UPDATE banners SET title = ?, image_url = ?, link_url = ?, position = ?, is_active = ?, sort_order = ?,
				                   updated_at = NOW()
				WHERE id = ?
				""", request.title(), request.imageUrl(), request.linkUrl(), fallback(request.position(), "HOME"),
				request.isActive() == null || request.isActive(), request.sortOrder() == null ? 0 : request.sortOrder(),
				UUID.fromString(id));
		return banner(id);
	}

	@Transactional(readOnly = true)
	public List<AdminReportsSettingsController.EmailTemplateDto> emailTemplates() {
		return jdbc.query("SELECT * FROM email_templates ORDER BY template_key", this::emailTemplateRow);
	}

	@Transactional
	public AdminReportsSettingsController.EmailTemplateDto createEmailTemplate(
			AdminReportsSettingsController.EmailTemplateRequest request) {
		UUID id = UUID.randomUUID();
		jdbc.update("""
				INSERT INTO email_templates (id, template_key, subject, body, is_active)
				VALUES (?, ?, ?, ?, ?)
				""", id, request.templateKey(), request.subject(), request.body(),
				request.isActive() == null || request.isActive());
		return emailTemplate(id.toString());
	}

	@Transactional
	public AdminReportsSettingsController.EmailTemplateDto updateEmailTemplate(String id,
			AdminReportsSettingsController.EmailTemplateRequest request) {
		jdbc.update("""
				UPDATE email_templates
				SET template_key = ?, subject = ?, body = ?, is_active = ?, updated_at = NOW()
				WHERE id = ?
				""", request.templateKey(), request.subject(), request.body(), request.isActive() == null || request.isActive(),
				UUID.fromString(id));
		return emailTemplate(id);
	}

	@Transactional(readOnly = true)
	public AdminReportsSettingsController.EmailPreviewDto previewEmailTemplate(String id,
			AdminReportsSettingsController.PreviewRequest request) {
		AdminReportsSettingsController.EmailTemplateDto template = emailTemplate(id);
		Map<String, String> variables = request == null || request.variables() == null ? Map.of() : request.variables();
		String subject = replace(template.subject(), variables);
		String body = replace(template.body(), variables);
		return new AdminReportsSettingsController.EmailPreviewDto(subject, body);
	}

	@Transactional(readOnly = true)
	public List<AdminReportsSettingsController.SeoSettingDto> seoSettings() {
		return jdbc.query("SELECT * FROM seo_settings ORDER BY page_key", this::seoRow);
	}

	@Transactional
	public AdminReportsSettingsController.SeoSettingDto updateSeo(String pageKey, AdminReportsSettingsController.SeoRequest request) {
		jdbc.update("""
				INSERT INTO seo_settings (page_key, title, description, keywords, updated_at)
				VALUES (?, ?, ?, string_to_array(?, ',')::text[], NOW())
				ON CONFLICT (page_key) DO UPDATE
				SET title = EXCLUDED.title, description = EXCLUDED.description, keywords = EXCLUDED.keywords, updated_at = NOW()
				""", pageKey, request.title(), fallback(request.description(), ""), csv(request.keywords()));
		return jdbc.queryForObject("SELECT * FROM seo_settings WHERE page_key = ?", this::seoRow, pageKey);
	}

	@Transactional(readOnly = true)
	public List<AdminReportsSettingsController.BranchDto> branches() {
		return jdbc.query("SELECT * FROM branches ORDER BY created_at DESC", this::branchRow);
	}

	@Transactional
	public AdminReportsSettingsController.BranchDto createBranch(AdminReportsSettingsController.BranchRequest request) {
		UUID id = UUID.randomUUID();
		jdbc.update("""
				INSERT INTO branches (id, name, phone, address, district, city, working_hours, lat, lng, is_active)
				VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
				""", id, request.name(), fallback(request.phone(), ""), fallback(request.address(), ""),
				request.district(), request.city(), fallback(request.workingHours(), "8:00 - 22:00"),
				request.lat(), request.lng(), request.isActive() == null || request.isActive());
		return branch(id.toString());
	}

	@Transactional
	public AdminReportsSettingsController.BranchDto updateBranch(String id, AdminReportsSettingsController.BranchRequest request) {
		jdbc.update("""
				UPDATE branches SET name = ?, phone = ?, address = ?, district = ?, city = ?,
				                   working_hours = ?, lat = ?, lng = ?, is_active = ?, updated_at = NOW()
				WHERE id = ?
				""", request.name(), fallback(request.phone(), ""), fallback(request.address(), ""),
				request.district(), request.city(), fallback(request.workingHours(), "8:00 - 22:00"),
				request.lat(), request.lng(), request.isActive() == null || request.isActive(), UUID.fromString(id));
		return branch(id);
	}

	@Transactional
	public AdminReportsSettingsController.BranchDto toggleBranch(String id) {
		jdbc.update("UPDATE branches SET is_active = NOT is_active, updated_at = NOW() WHERE id = ?", UUID.fromString(id));
		return branch(id);
	}

	@Transactional(readOnly = true)
	public List<AdminReportsSettingsController.StaffDto> staff() {
		return jdbc.query("""
				SELECT sm.*, b.name AS branch_name
				FROM staff_members sm
				LEFT JOIN branches b ON b.id = sm.branch_id
				ORDER BY sm.created_at DESC
				""", this::staffRow);
	}

	@Transactional
	public AdminReportsSettingsController.StaffDto createStaff(AdminReportsSettingsController.StaffRequest request) {
		UUID id = UUID.randomUUID();
		UUID branchUuid = parseBranchId(request.branchId());
		java.time.LocalDate joinedAt = request.joinedAt() != null && !request.joinedAt().isBlank()
				? java.time.LocalDate.parse(request.joinedAt()) : java.time.LocalDate.now();
		jdbc.update("""
				INSERT INTO staff_members (id, full_name, email, phone, role, branch_id, joined_at, is_active)
				VALUES (?, ?, ?, ?, ?, ?, ?, ?)
				""", id, request.fullName(), request.email(), fallback(request.phone(), ""),
				fallback(request.role(), "STAFF"), branchUuid, joinedAt,
				request.isActive() == null || request.isActive());
		return staff(id.toString());
	}

	@Transactional
	public AdminReportsSettingsController.StaffDto updateStaff(String id, AdminReportsSettingsController.StaffRequest request) {
		UUID branchUuid = parseBranchId(request.branchId());
		java.time.LocalDate joinedAt = request.joinedAt() != null && !request.joinedAt().isBlank()
				? java.time.LocalDate.parse(request.joinedAt()) : null;
		if (joinedAt != null) {
			jdbc.update("""
					UPDATE staff_members
					SET full_name = ?, email = ?, phone = ?, role = ?, branch_id = ?, joined_at = ?, is_active = ?, updated_at = NOW()
					WHERE id = ?
					""", request.fullName(), request.email(), fallback(request.phone(), ""),
					fallback(request.role(), "STAFF"), branchUuid, joinedAt,
					request.isActive() == null || request.isActive(), UUID.fromString(id));
		} else {
			jdbc.update("""
					UPDATE staff_members
					SET full_name = ?, email = ?, phone = ?, role = ?, branch_id = ?, is_active = ?, updated_at = NOW()
					WHERE id = ?
					""", request.fullName(), request.email(), fallback(request.phone(), ""),
					fallback(request.role(), "STAFF"), branchUuid,
					request.isActive() == null || request.isActive(), UUID.fromString(id));
		}
		return staff(id);
	}

	@Transactional
	public AdminReportsSettingsController.StaffDto deactivateStaff(String id) {
		jdbc.update("UPDATE staff_members SET is_active = FALSE, updated_at = NOW() WHERE id = ?", UUID.fromString(id));
		return staff(id);
	}

	@Transactional(readOnly = true)
	public Page<AdminReportsSettingsController.ActivityLogDto> activityLogs(
			PageRequestParams params, String action, String entity, String userId, String search) {
		int page = params.normalizedPage();
		int pageSize = params.normalizedPageSize();

		// Build dynamic WHERE clause
		List<Object> args = new java.util.ArrayList<>();
		StringBuilder where = new StringBuilder("WHERE 1=1");
		if (action != null && !action.isBlank()) {
			where.append(" AND action = ?");
			args.add(action.toUpperCase());
		}
		if (entity != null && !entity.isBlank()) {
			where.append(" AND entity_type ILIKE ?");
			args.add("%" + entity + "%");
		}
		if (userId != null && !userId.isBlank()) {
			try { args.add(UUID.fromString(userId)); where.append(" AND actor_id = ?"); }
			catch (IllegalArgumentException ignored) {}
		}
		if (search != null && !search.isBlank()) {
			where.append(" AND (actor_name ILIKE ? OR note ILIKE ? OR entity_type ILIKE ?)");
			String like = "%" + search + "%";
			args.add(like); args.add(like); args.add(like);
		}

		Long total = jdbc.queryForObject(
				"SELECT COUNT(*) FROM admin_activity_logs " + where, Long.class, args.toArray());

		List<Object> pageArgs = new java.util.ArrayList<>(args);
		pageArgs.add(pageSize);
		pageArgs.add((page - 1) * pageSize);
		List<AdminReportsSettingsController.ActivityLogDto> content = jdbc.query(
				"SELECT * FROM admin_activity_logs " + where + " ORDER BY created_at DESC LIMIT ? OFFSET ?",
				this::activityLogRow, pageArgs.toArray());
		return new PageImpl<>(content, PageRequest.of(page - 1, pageSize), total == null ? 0 : total);
	}

	@Transactional(readOnly = true)
	public AdminReportsSettingsController.ActivityLogStatsDto activityLogStats() {
		long todayCount = jdbc.queryForObject(
				"SELECT COUNT(*) FROM admin_activity_logs WHERE created_at >= CURRENT_DATE", Long.class);
		long weekCount = jdbc.queryForObject(
				"SELECT COUNT(*) FROM admin_activity_logs WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'", Long.class);
		long monthCount = jdbc.queryForObject(
				"SELECT COUNT(*) FROM admin_activity_logs WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'", Long.class);
		List<AdminReportsSettingsController.StatusCountDto> byAction = jdbc.query("""
				SELECT action AS status, COUNT(*)::bigint AS count
				FROM admin_activity_logs
				GROUP BY action ORDER BY count DESC
				""", this::statusCount);
		return new AdminReportsSettingsController.ActivityLogStatsDto(todayCount, weekCount, monthCount, byAction);
	}

	@Transactional
	public void delete(String table, String id) {
		int rows = jdbc.update("DELETE FROM " + table + " WHERE id = ?", UUID.fromString(id));
		if (rows == 0) {
			throw new AppException(ErrorCode.NOT_FOUND);
		}
	}

	private AdminReportsSettingsController.BannerDto banner(String id) {
		return one("SELECT * FROM banners WHERE id = ?", this::bannerRow, id);
	}

	private AdminReportsSettingsController.EmailTemplateDto emailTemplate(String id) {
		return one("SELECT * FROM email_templates WHERE id = ?", this::emailTemplateRow, id);
	}

	private AdminReportsSettingsController.BranchDto branch(String id) {
		return one("SELECT * FROM branches WHERE id = ?", this::branchRow, id);
	}

	AdminReportsSettingsController.StaffDto staff(String id) {
		return one("""
				SELECT sm.*, b.name AS branch_name
				FROM staff_members sm
				LEFT JOIN branches b ON b.id = sm.branch_id
				WHERE sm.id = ?
				""", this::staffRow, id);
	}

	private <T> T one(String sql, org.springframework.jdbc.core.RowMapper<T> mapper, String id) {
		try {
			return jdbc.queryForObject(sql, mapper, UUID.fromString(id));
		}
		catch (EmptyResultDataAccessException exception) {
			throw new AppException(ErrorCode.NOT_FOUND);
		}
	}

	private AdminReportsSettingsController.SettingDto settingRow(ResultSet rs, int rowNum) throws SQLException {
		try {
			return new AdminReportsSettingsController.SettingDto(rs.getString("setting_key"),
					mapper.readTree(rs.getString("setting_value")), iso(rs.getObject("updated_at", OffsetDateTime.class)));
		}
		catch (Exception exception) {
			throw new SQLException(exception);
		}
	}

	private AdminReportsSettingsController.BannerDto bannerRow(ResultSet rs, int rowNum) throws SQLException {
		return new AdminReportsSettingsController.BannerDto(rs.getObject("id").toString(), rs.getString("title"),
				rs.getString("image_url"), rs.getString("link_url"), rs.getString("position"), rs.getBoolean("is_active"),
				rs.getInt("sort_order"), iso(rs.getObject("created_at", OffsetDateTime.class)),
				iso(rs.getObject("updated_at", OffsetDateTime.class)));
	}

	private AdminReportsSettingsController.EmailTemplateDto emailTemplateRow(ResultSet rs, int rowNum) throws SQLException {
		return new AdminReportsSettingsController.EmailTemplateDto(rs.getObject("id").toString(),
				rs.getString("template_key"), rs.getString("subject"), rs.getString("body"), rs.getBoolean("is_active"),
				iso(rs.getObject("updated_at", OffsetDateTime.class)));
	}

	private AdminReportsSettingsController.SeoSettingDto seoRow(ResultSet rs, int rowNum) throws SQLException {
		return new AdminReportsSettingsController.SeoSettingDto(rs.getObject("id").toString(), rs.getString("page_key"),
				rs.getString("title"), rs.getString("description"), List.of((String[]) rs.getArray("keywords").getArray()),
				iso(rs.getObject("updated_at", OffsetDateTime.class)));
	}

	private AdminReportsSettingsController.BranchDto branchRow(ResultSet rs, int rowNum) throws SQLException {
		Object latObj = rs.getObject("lat");
		Object lngObj = rs.getObject("lng");
		return new AdminReportsSettingsController.BranchDto(
				rs.getObject("id").toString(), rs.getString("name"),
				rs.getString("phone"), rs.getString("address"),
				rs.getString("district"), rs.getString("city"), rs.getString("working_hours"),
				latObj == null ? null : ((Number) latObj).doubleValue(),
				lngObj == null ? null : ((Number) lngObj).doubleValue(),
				rs.getBoolean("is_active"),
				iso(rs.getObject("created_at", OffsetDateTime.class)),
				iso(rs.getObject("updated_at", OffsetDateTime.class)));
	}

	private AdminReportsSettingsController.StaffDto staffRow(ResultSet rs, int rowNum) throws SQLException {
		Object branchId = rs.getObject("branch_id");
		Object joinedAt = rs.getObject("joined_at");
		return new AdminReportsSettingsController.StaffDto(
				rs.getObject("id").toString(), rs.getString("full_name"),
				rs.getString("email"), rs.getString("phone"), rs.getString("role"),
				branchId == null ? null : branchId.toString(),
				rs.getString("branch_name"),
				joinedAt == null ? null : joinedAt.toString(),
				rs.getBoolean("is_active"),
				iso(rs.getObject("created_at", OffsetDateTime.class)),
				iso(rs.getObject("updated_at", OffsetDateTime.class)));
	}

	private AdminReportsSettingsController.ActivityLogDto activityLogRow(ResultSet rs, int rowNum) throws SQLException {
		Object actorId = rs.getObject("actor_id");
		Object entityId = rs.getObject("entity_id");
		return new AdminReportsSettingsController.ActivityLogDto(rs.getObject("id").toString(),
				actorId == null ? null : actorId.toString(), rs.getString("actor_name"), rs.getString("action"),
				rs.getString("entity_type"), entityId == null ? null : entityId.toString(), rs.getString("note"),
				iso(rs.getObject("created_at", OffsetDateTime.class)));
	}

	private AdminReportsSettingsController.StatusCountDto statusCount(ResultSet rs, int rowNum) throws SQLException {
		return new AdminReportsSettingsController.StatusCountDto(rs.getString("status"), rs.getLong("count"));
	}

	private String replace(String value, Map<String, String> variables) {
		String output = value;
		for (Map.Entry<String, String> entry : variables.entrySet()) {
			output = output.replace("{{" + entry.getKey() + "}}", entry.getValue());
		}
		return output;
	}

	private LocalDate parseDate(String value, LocalDate fallback) {
		return value == null || value.isBlank() ? fallback : LocalDate.parse(value.trim());
	}

	private String csv(List<String> values) {
		return values == null ? "" : String.join(",", values);
	}

	private String fallback(String value, String fallback) {
		return value == null || value.isBlank() ? fallback : value;
	}

	private UUID parseBranchId(String branchId) {
		if (branchId == null || branchId.isBlank()) return null;
		try { return UUID.fromString(branchId); } catch (IllegalArgumentException e) { return null; }
	}

	private String iso(OffsetDateTime value) {
		return DateTimeFormatter.ISO_OFFSET_DATE_TIME.format(value);
	}
}

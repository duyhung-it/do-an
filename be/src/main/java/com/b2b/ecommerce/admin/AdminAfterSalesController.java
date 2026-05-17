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
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
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
public class AdminAfterSalesController {
	private final AdminAfterSalesService afterSales;

	public AdminAfterSalesController(AdminAfterSalesService afterSales) {
		this.afterSales = afterSales;
	}

	@GetMapping("/returns")
	public ApiResponse<List<ReturnRequestDto>> returns(@RequestParam(defaultValue = "1") int page,
			@RequestParam(defaultValue = "20") int pageSize, @RequestParam(required = false) String status,
			@RequestParam(required = false) String search) {
		PageRequestParams params = new PageRequestParams(page, pageSize, search, "createdAt", "desc");
		Page<ReturnRequestDto> result = afterSales.returns(params, status);
		return ApiResponse.page(result.getContent(), (int) result.getTotalElements(), params.normalizedPage(),
				params.normalizedPageSize());
	}

	@GetMapping("/returns/{id}")
	public ApiResponse<ReturnRequestDto> returnRequest(@PathVariable String id) {
		return ApiResponse.ok(afterSales.returnRequest(id));
	}

	@PatchMapping("/returns/{id}/status")
	public ApiResponse<ReturnRequestDto> updateReturnStatus(@PathVariable String id,
			@Valid @RequestBody StatusUpdateRequest request) {
		return ApiResponse.ok(afterSales.updateReturnStatus(id, request));
	}

	@PostMapping("/returns/{id}/dispute-resolution")
	public ApiResponse<ReturnRequestDto> disputeResolution(@PathVariable String id,
			@Valid @RequestBody DisputeResolutionRequest request) {
		return ApiResponse.ok(afterSales.disputeResolution(id, request));
	}

	@GetMapping("/warranty-claims")
	public ApiResponse<List<WarrantyClaimDto>> warrantyClaims(@RequestParam(defaultValue = "1") int page,
			@RequestParam(defaultValue = "20") int pageSize, @RequestParam(required = false) String status,
			@RequestParam(required = false) String search) {
		PageRequestParams params = new PageRequestParams(page, pageSize, search, "createdAt", "desc");
		Page<WarrantyClaimDto> result = afterSales.warrantyClaims(params, status);
		return ApiResponse.page(result.getContent(), (int) result.getTotalElements(), params.normalizedPage(),
				params.normalizedPageSize());
	}

	@GetMapping("/warranty-claims/{id}")
	public ApiResponse<WarrantyClaimDto> warrantyClaim(@PathVariable String id) {
		return ApiResponse.ok(afterSales.warrantyClaim(id));
	}

	@PatchMapping("/warranty-claims/{id}/status")
	public ApiResponse<WarrantyClaimDto> updateWarrantyStatus(@PathVariable String id,
			@Valid @RequestBody StatusUpdateRequest request) {
		return ApiResponse.ok(afterSales.updateWarrantyStatus(id, request));
	}

	@GetMapping("/reviews")
	public ApiResponse<List<ReviewDto>> reviews(@RequestParam(defaultValue = "1") int page,
			@RequestParam(defaultValue = "20") int pageSize, @RequestParam(required = false) String status,
			@RequestParam(required = false) Integer rating, @RequestParam(required = false) String search) {
		PageRequestParams params = new PageRequestParams(page, pageSize, search, "createdAt", "desc");
		Page<ReviewDto> result = afterSales.reviews(params, status, rating);
		return ApiResponse.page(result.getContent(), (int) result.getTotalElements(), params.normalizedPage(),
				params.normalizedPageSize());
	}

	@PatchMapping("/reviews/{id}/approve")
	public ApiResponse<ReviewDto> approveReview(@PathVariable String id) {
		return ApiResponse.ok(afterSales.updateReviewStatus(id, "APPROVED"));
	}

	@PatchMapping("/reviews/{id}/hide")
	public ApiResponse<ReviewDto> hideReview(@PathVariable String id) {
		return ApiResponse.ok(afterSales.updateReviewStatus(id, "HIDDEN"));
	}

	@PatchMapping("/reviews/{id}/status")
	public ApiResponse<ReviewDto> updateReviewStatus(@PathVariable String id,
			@Valid @RequestBody StatusUpdateRequest request) {
		return ApiResponse.ok(afterSales.updateReviewStatus(id, request.status()));
	}

	@DeleteMapping("/reviews/{id}")
	public ResponseEntity<Void> deleteReview(@PathVariable String id) {
		afterSales.deleteReview(id);
		return ResponseEntity.noContent().build();
	}

	public record StatusUpdateRequest(@NotBlank String status, String note) {
	}

	public record DisputeResolutionRequest(@NotBlank String resolution) {
	}

	public record ReturnRequestDto(String id, String returnNumber, String orderId, String customerId, String customerName,
			String customerPhone, String reason, String status, long refundAmount, String disputeResolution, String createdAt,
			String updatedAt) {
	}

	public record WarrantyClaimDto(String id, String claimNumber, String orderId, String productId, String customerId,
			String customerName, String customerPhone, String issueDescription, String status, String resolutionNote,
			String createdAt, String updatedAt) {
	}

	public record ReviewDto(String id, String productId, String orderId, String customerId, String customerName,
			int rating, String title, String content, String status, String createdAt, String updatedAt) {
	}
}

@Service
class AdminAfterSalesService {
	private final JdbcTemplate jdbc;

	AdminAfterSalesService(JdbcTemplate jdbc) {
		this.jdbc = jdbc;
	}

	@Transactional(readOnly = true)
	public Page<AdminAfterSalesController.ReturnRequestDto> returns(PageRequestParams params, String status) {
		int page = params.normalizedPage();
		int pageSize = params.normalizedPageSize();
		String search = normalizedSearch(params.search());
		String normalizedStatus = normalized(status);
		Long total = jdbc.queryForObject("""
				SELECT COUNT(*) FROM return_requests
				WHERE (? = '' OR status::text = ?)
				  AND (? = '' OR return_number ILIKE ? OR customer_name ILIKE ? OR customer_phone ILIKE ?)
				""", Long.class, normalizedStatus, normalizedStatus, search, like(search), like(search), like(search));
		List<AdminAfterSalesController.ReturnRequestDto> content = jdbc.query("""
				SELECT * FROM return_requests
				WHERE (? = '' OR status::text = ?)
				  AND (? = '' OR return_number ILIKE ? OR customer_name ILIKE ? OR customer_phone ILIKE ?)
				ORDER BY created_at DESC
				LIMIT ? OFFSET ?
				""", this::returnRow, normalizedStatus, normalizedStatus, search, like(search), like(search), like(search),
				pageSize, (page - 1) * pageSize);
		return new PageImpl<>(content, PageRequest.of(page - 1, pageSize), total == null ? 0 : total);
	}

	@Transactional(readOnly = true)
	public AdminAfterSalesController.ReturnRequestDto returnRequest(String id) {
		try {
			return jdbc.queryForObject("SELECT * FROM return_requests WHERE id = ?", this::returnRow, UUID.fromString(id));
		}
		catch (EmptyResultDataAccessException exception) {
			throw new AppException(ErrorCode.RETURN_NOT_FOUND);
		}
	}

	@Transactional
	public AdminAfterSalesController.ReturnRequestDto updateReturnStatus(String id,
			AdminAfterSalesController.StatusUpdateRequest request) {
		AdminAfterSalesController.ReturnRequestDto current = returnRequest(id);
		String next = normalized(request.status());
		if (!validReturnTransition(current.status(), next)) {
			throw new AppException(ErrorCode.RETURN_INVALID_STATUS, "Trang thai tra hang khong hop le",
					Map.of("from", current.status(), "to", next));
		}
		jdbc.update("UPDATE return_requests SET status = ?::return_request_status, updated_at = NOW() WHERE id = ?",
				next, UUID.fromString(id));
		return returnRequest(id);
	}

	@Transactional
	public AdminAfterSalesController.ReturnRequestDto disputeResolution(String id,
			AdminAfterSalesController.DisputeResolutionRequest request) {
		returnRequest(id);
		jdbc.update("UPDATE return_requests SET dispute_resolution = ?, updated_at = NOW() WHERE id = ?",
				request.resolution(), UUID.fromString(id));
		return returnRequest(id);
	}

	@Transactional(readOnly = true)
	public Page<AdminAfterSalesController.WarrantyClaimDto> warrantyClaims(PageRequestParams params, String status) {
		int page = params.normalizedPage();
		int pageSize = params.normalizedPageSize();
		String search = normalizedSearch(params.search());
		String normalizedStatus = normalized(status);
		Long total = jdbc.queryForObject("""
				SELECT COUNT(*) FROM warranty_claims
				WHERE (? = '' OR status::text = ?)
				  AND (? = '' OR claim_number ILIKE ? OR customer_name ILIKE ? OR customer_phone ILIKE ?)
				""", Long.class, normalizedStatus, normalizedStatus, search, like(search), like(search), like(search));
		List<AdminAfterSalesController.WarrantyClaimDto> content = jdbc.query("""
				SELECT * FROM warranty_claims
				WHERE (? = '' OR status::text = ?)
				  AND (? = '' OR claim_number ILIKE ? OR customer_name ILIKE ? OR customer_phone ILIKE ?)
				ORDER BY created_at DESC
				LIMIT ? OFFSET ?
				""", this::warrantyRow, normalizedStatus, normalizedStatus, search, like(search), like(search), like(search),
				pageSize, (page - 1) * pageSize);
		return new PageImpl<>(content, PageRequest.of(page - 1, pageSize), total == null ? 0 : total);
	}

	@Transactional(readOnly = true)
	public AdminAfterSalesController.WarrantyClaimDto warrantyClaim(String id) {
		try {
			return jdbc.queryForObject("SELECT * FROM warranty_claims WHERE id = ?", this::warrantyRow, UUID.fromString(id));
		}
		catch (EmptyResultDataAccessException exception) {
			throw new AppException(ErrorCode.WARRANTY_NOT_FOUND);
		}
	}

	@Transactional
	public AdminAfterSalesController.WarrantyClaimDto updateWarrantyStatus(String id,
			AdminAfterSalesController.StatusUpdateRequest request) {
		AdminAfterSalesController.WarrantyClaimDto current = warrantyClaim(id);
		String next = normalized(request.status());
		if (!validWarrantyTransition(current.status(), next)) {
			throw new AppException(ErrorCode.RETURN_INVALID_STATUS, "Trang thai bao hanh khong hop le",
					Map.of("from", current.status(), "to", next));
		}
		jdbc.update("""
				UPDATE warranty_claims
				SET status = ?::warranty_claim_status, resolution_note = COALESCE(?, resolution_note), updated_at = NOW()
				WHERE id = ?
				""", next, request.note(), UUID.fromString(id));
		return warrantyClaim(id);
	}

	@Transactional(readOnly = true)
	public Page<AdminAfterSalesController.ReviewDto> reviews(PageRequestParams params, String status, Integer rating) {
		int page = params.normalizedPage();
		int pageSize = params.normalizedPageSize();
		String search = normalizedSearch(params.search());
		String normalizedStatus = normalized(status);
		int normalizedRating = rating == null ? 0 : rating;
		Long total = jdbc.queryForObject("""
				SELECT COUNT(*) FROM product_reviews
				WHERE (? = '' OR status::text = ?)
				  AND (? = 0 OR rating = ?)
				  AND (? = '' OR customer_name ILIKE ? OR title ILIKE ? OR content ILIKE ?)
				""", Long.class, normalizedStatus, normalizedStatus, normalizedRating, normalizedRating, search, like(search), like(search),
				like(search));
		List<AdminAfterSalesController.ReviewDto> content = jdbc.query("""
				SELECT * FROM product_reviews
				WHERE (? = '' OR status::text = ?)
				  AND (? = 0 OR rating = ?)
				  AND (? = '' OR customer_name ILIKE ? OR title ILIKE ? OR content ILIKE ?)
				ORDER BY created_at DESC
				LIMIT ? OFFSET ?
				""", this::reviewRow, normalizedStatus, normalizedStatus, normalizedRating, normalizedRating, search, like(search), like(search),
				like(search), pageSize, (page - 1) * pageSize);
		return new PageImpl<>(content, PageRequest.of(page - 1, pageSize), total == null ? 0 : total);
	}

	@Transactional
	public AdminAfterSalesController.ReviewDto updateReviewStatus(String id, String status) {
		int rows = jdbc.update("UPDATE product_reviews SET status = ?::review_status, updated_at = NOW() WHERE id = ?",
				status, UUID.fromString(id));
		if (rows == 0) {
			throw new AppException(ErrorCode.NOT_FOUND);
		}
		return review(id);
	}

	@Transactional
	public void deleteReview(String id) {
		int rows = jdbc.update("DELETE FROM product_reviews WHERE id = ?", UUID.fromString(id));
		if (rows == 0) {
			throw new AppException(ErrorCode.NOT_FOUND);
		}
	}

	private AdminAfterSalesController.ReviewDto review(String id) {
		try {
			return jdbc.queryForObject("SELECT * FROM product_reviews WHERE id = ?", this::reviewRow, UUID.fromString(id));
		}
		catch (EmptyResultDataAccessException exception) {
			throw new AppException(ErrorCode.NOT_FOUND);
		}
	}

	private boolean validReturnTransition(String from, String to) {
		return switch (from) {
			case "PENDING" -> to.equals("APPROVED") || to.equals("REJECTED");
			case "APPROVED" -> to.equals("PROCESSING");
			case "PROCESSING" -> to.equals("REFUNDED");
			case "REFUNDED" -> to.equals("CLOSED");
			default -> false;
		};
	}

	private boolean validWarrantyTransition(String from, String to) {
		return switch (from) {
			case "NEW" -> to.equals("PROCESSING") || to.equals("REJECTED");
			case "PROCESSING" -> to.equals("RESOLVED");
			default -> false;
		};
	}

	private AdminAfterSalesController.ReturnRequestDto returnRow(ResultSet rs, int rowNum) throws SQLException {
		return new AdminAfterSalesController.ReturnRequestDto(rs.getObject("id").toString(), rs.getString("return_number"),
				object(rs, "order_id"), object(rs, "customer_id"), rs.getString("customer_name"), rs.getString("customer_phone"),
				rs.getString("reason"), rs.getString("status"), rs.getLong("refund_amount"),
				rs.getString("dispute_resolution"), iso(rs.getObject("created_at", OffsetDateTime.class)),
				iso(rs.getObject("updated_at", OffsetDateTime.class)));
	}

	private AdminAfterSalesController.WarrantyClaimDto warrantyRow(ResultSet rs, int rowNum) throws SQLException {
		return new AdminAfterSalesController.WarrantyClaimDto(rs.getObject("id").toString(), rs.getString("claim_number"),
				object(rs, "order_id"), object(rs, "product_id"), object(rs, "customer_id"), rs.getString("customer_name"),
				rs.getString("customer_phone"), rs.getString("issue_description"), rs.getString("status"),
				rs.getString("resolution_note"), iso(rs.getObject("created_at", OffsetDateTime.class)),
				iso(rs.getObject("updated_at", OffsetDateTime.class)));
	}

	private AdminAfterSalesController.ReviewDto reviewRow(ResultSet rs, int rowNum) throws SQLException {
		return new AdminAfterSalesController.ReviewDto(rs.getObject("id").toString(), object(rs, "product_id"),
				object(rs, "order_id"), object(rs, "customer_id"), rs.getString("customer_name"), rs.getInt("rating"),
				rs.getString("title"), rs.getString("content"), rs.getString("status"),
				iso(rs.getObject("created_at", OffsetDateTime.class)), iso(rs.getObject("updated_at", OffsetDateTime.class)));
	}

	private String object(ResultSet rs, String column) throws SQLException {
		Object value = rs.getObject(column);
		return value == null ? null : value.toString();
	}

	private String normalized(String value) {
		return value == null || value.isBlank() ? "" : value.trim().toUpperCase();
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

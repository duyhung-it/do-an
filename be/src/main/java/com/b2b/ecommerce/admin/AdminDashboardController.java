package com.b2b.ecommerce.admin;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

import com.b2b.ecommerce.common.ApiResponse;
import com.b2b.ecommerce.common.AppException;
import com.b2b.ecommerce.common.ErrorCode;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/dashboard")
public class AdminDashboardController {
	private final JdbcTemplate jdbc;

	public AdminDashboardController(JdbcTemplate jdbc) {
		this.jdbc = jdbc;
	}

	@GetMapping("/stats")
	public ApiResponse<DashboardStatsDto> stats() {
		DashboardStatsDto data = jdbc.queryForObject("""
				SELECT
				  COALESCE(SUM(o.total_amount) FILTER (
				    WHERE o.status = 'DELIVERED' AND o.payment_status = 'PAID'
				  ), 0)::bigint AS total_revenue,
				  COUNT(o.id)::bigint AS total_orders,
				  COUNT(*) FILTER (WHERE o.status = 'PENDING')::bigint AS pending_orders,
				  COUNT(*) FILTER (WHERE o.status = 'DELIVERED')::bigint AS delivered_orders,
				  COUNT(*) FILTER (WHERE o.status = 'CANCELLED')::bigint AS cancelled_orders,
				  (SELECT COUNT(*)::bigint FROM payments p WHERE p.status = 'UNPAID') AS unpaid_payments,
				  (SELECT COUNT(*)::bigint FROM payments p WHERE p.status = 'OVERDUE') AS overdue_payments,
				  (SELECT COUNT(*)::bigint FROM product_variants pv WHERE pv.stock <= pv.min_stock) AS low_stock_variants
				FROM orders o
				""", this::statsDto);
		return ApiResponse.ok(data);
	}

	@GetMapping("/revenue-chart")
	public ApiResponse<List<RevenuePointDto>> revenueChart(
			@RequestParam(defaultValue = "day") String period,
			@RequestParam(required = false) String from,
			@RequestParam(required = false) String to) {
		String bucket = switch (period == null ? "" : period.trim().toLowerCase()) {
			case "day" -> "day";
			case "week" -> "week";
			case "month" -> "month";
			default -> throw new AppException(ErrorCode.VALIDATION_ERROR, "Du lieu dau vao khong hop le",
					Map.of("period", "period phai la day, week hoac month"));
		};
		LocalDate fromDate = parseDate(from, "from", LocalDate.now().minusDays(30));
		LocalDate toDate = parseDate(to, "to", LocalDate.now());
		if (fromDate.isAfter(toDate)) {
			throw new AppException(ErrorCode.VALIDATION_ERROR, "Khoang ngay khong hop le",
					Map.of("from", "from phai nho hon hoac bang to"));
		}
		List<RevenuePointDto> data = jdbc.query("""
				SELECT DATE_TRUNC(?, o.created_at)::date AS bucket,
				       COALESCE(SUM(o.total_amount) FILTER (
				           WHERE o.status = 'DELIVERED' AND o.payment_status = 'PAID'
				       ), 0)::bigint AS revenue,
				       COUNT(o.id) FILTER (
				           WHERE o.status = 'DELIVERED' AND o.payment_status = 'PAID'
				       )::bigint AS order_count
				FROM orders o
				WHERE o.created_at >= ?::date AND o.created_at < (?::date + INTERVAL '1 day')
				GROUP BY bucket
				ORDER BY bucket ASC
				""", this::revenuePointDto, bucket, fromDate, toDate);
		return ApiResponse.ok(data);
	}

	@GetMapping("/recent-orders")
	public ApiResponse<List<RecentOrderDto>> recentOrders(@RequestParam(defaultValue = "10") int limit) {
		int normalizedLimit = Math.max(1, Math.min(limit, 50));
		List<RecentOrderDto> data = jdbc.query("""
				SELECT id, order_number, customer_name, customer_phone, status::text AS status,
				       payment_status::text AS payment_status, total_amount, created_at
				FROM orders
				ORDER BY created_at DESC
				LIMIT ?
				""", this::recentOrderDto, normalizedLimit);
		return ApiResponse.ok(data);
	}

	@GetMapping("/recent-activity")
	public ApiResponse<List<RecentActivityDto>> recentActivity(@RequestParam(defaultValue = "10") int limit) {
		int normalizedLimit = Math.max(1, Math.min(limit, 50));
		List<RecentActivityDto> data = jdbc.query("""
				SELECT h.id, h.order_id, o.order_number, h.from_status::text AS from_status,
				       h.to_status::text AS to_status, h.changed_by_name, h.note, h.created_at
				FROM order_status_history h
				JOIN orders o ON o.id = h.order_id
				ORDER BY h.created_at DESC
				LIMIT ?
				""", this::recentActivityDto, normalizedLimit);
		return ApiResponse.ok(data);
	}

	private DashboardStatsDto statsDto(ResultSet rs, int rowNum) throws SQLException {
		return new DashboardStatsDto(rs.getLong("total_revenue"), rs.getLong("total_orders"),
				rs.getLong("pending_orders"), rs.getLong("delivered_orders"), rs.getLong("cancelled_orders"),
				rs.getLong("unpaid_payments"), rs.getLong("overdue_payments"), rs.getLong("low_stock_variants"));
	}

	private RevenuePointDto revenuePointDto(ResultSet rs, int rowNum) throws SQLException {
		return new RevenuePointDto(rs.getObject("bucket", LocalDate.class).toString(), rs.getLong("revenue"),
				rs.getLong("order_count"));
	}

	private RecentOrderDto recentOrderDto(ResultSet rs, int rowNum) throws SQLException {
		return new RecentOrderDto(rs.getObject("id").toString(), rs.getString("order_number"),
				rs.getString("customer_name"), rs.getString("customer_phone"), rs.getString("status"),
				rs.getString("payment_status"), rs.getLong("total_amount"),
				iso(rs.getObject("created_at", OffsetDateTime.class)));
	}

	private RecentActivityDto recentActivityDto(ResultSet rs, int rowNum) throws SQLException {
		return new RecentActivityDto(rs.getObject("id").toString(), rs.getObject("order_id").toString(),
				rs.getString("order_number"), rs.getString("from_status"), rs.getString("to_status"),
				rs.getString("changed_by_name"), rs.getString("note"), iso(rs.getObject("created_at", OffsetDateTime.class)));
	}

	private LocalDate parseDate(String value, String field, LocalDate fallback) {
		if (value == null || value.isBlank()) {
			return fallback;
		}
		try {
			return LocalDate.parse(value.trim());
		}
		catch (RuntimeException exception) {
			throw new AppException(ErrorCode.VALIDATION_ERROR, "Du lieu dau vao khong hop le",
					Map.of(field, "Ngay phai co dinh dang YYYY-MM-DD"));
		}
	}

	private String iso(OffsetDateTime value) {
		return DateTimeFormatter.ISO_OFFSET_DATE_TIME.format(value);
	}

	public record DashboardStatsDto(long totalRevenue, long totalOrders, long pendingOrders, long deliveredOrders,
			long cancelledOrders, long unpaidPaymentCount, long overduePaymentCount, long lowStockVariantCount) {
	}

	public record RevenuePointDto(String date, long revenue, long orderCount) {
	}

	public record RecentOrderDto(String id, String orderNumber, String customerName, String customerPhone, String status,
			String paymentStatus, long totalAmount, String createdAt) {
	}

	public record RecentActivityDto(String id, String orderId, String orderNumber, String fromStatus, String toStatus,
			String changedByName, String note, String createdAt) {
	}
}

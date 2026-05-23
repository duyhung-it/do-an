package com.b2b.ecommerce.notification;

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
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
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
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/notifications")
public class NotificationController {
	private static final UUID DEV_USER_ID = UUID.fromString("00000000-0000-4000-8000-000000000001");

	private final NotificationService notifications;

	public NotificationController(NotificationService notifications) {
		this.notifications = notifications;
	}

	@GetMapping
	public ApiResponse<List<NotificationDto>> notifications(
			@RequestHeader(name = "X-User-Id", required = false) String userId,
			@RequestParam(defaultValue = "1") int page,
			@RequestParam(defaultValue = "20") int pageSize,
			@RequestParam(required = false) Boolean isRead,
			@RequestParam(required = false) String type,
			@RequestParam(required = false) String category) {
		PageRequestParams params = new PageRequestParams(page, Math.min(pageSize, 50), null, "createdAt", "desc");
		UUID currentUser = userId(userId);
		Page<NotificationDto> result = notifications.notifications(currentUser, params, isRead, type, category);
		return ApiResponse.page(result.getContent(), (int) result.getTotalElements(), params.normalizedPage(),
				params.normalizedPageSize(), Map.of("unreadCount", notifications.unreadCount(currentUser)));
	}

	@GetMapping("/unread-count")
	public ApiResponse<Map<String, Integer>> unreadCount(
			@RequestHeader(name = "X-User-Id", required = false) String userId) {
		return ApiResponse.ok(Map.of("unreadCount", notifications.unreadCount(userId(userId))));
	}

	@PatchMapping("/{id}/read")
	public ApiResponse<NotificationReadDto> markRead(
			@RequestHeader(name = "X-User-Id", required = false) String userId,
			@PathVariable String id) {
		return ApiResponse.ok(notifications.markRead(userId(userId), id));
	}

	@PatchMapping("/read-all")
	public ApiResponse<Map<String, Integer>> markAllRead(
			@RequestHeader(name = "X-User-Id", required = false) String userId) {
		return ApiResponse.ok(Map.of("updated", notifications.markAllRead(userId(userId))));
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<Void> delete(
			@RequestHeader(name = "X-User-Id", required = false) String userId,
			@PathVariable String id) {
		notifications.delete(userId(userId), id);
		return ResponseEntity.noContent().build();
	}

	@DeleteMapping
	public ApiResponse<Map<String, Integer>> deleteRead(
			@RequestHeader(name = "X-User-Id", required = false) String userId) {
		return ApiResponse.ok(Map.of("deleted", notifications.deleteRead(userId(userId))));
	}

	@GetMapping("/preferences")
	public ApiResponse<List<NotificationPreferenceDto>> preferences(
			@RequestHeader(name = "X-User-Id", required = false) String userId) {
		return ApiResponse.ok(notifications.preferences(userId(userId)));
	}

	@PatchMapping("/preferences")
	public ApiResponse<List<NotificationPreferenceDto>> updatePreferences(
			@RequestHeader(name = "X-User-Id", required = false) String userId,
			@Valid @RequestBody NotificationPreferenceUpdateRequest request) {
		return ApiResponse.ok(notifications.updatePreferences(userId(userId), request));
	}

	private UUID userId(String value) {
		return value == null || value.isBlank() ? DEV_USER_ID : UUID.fromString(value);
	}

	public record NotificationDto(String id, String userId, String type, String title, String message, boolean isRead,
			String priority, String category, String entityType, String entityId, String actionUrl, String actionLabel,
			boolean isActionable, String createdAt, String readAt) {
	}

	public record NotificationReadDto(String id, boolean isRead, String readAt) {
	}

	public record NotificationPreferenceDto(String id, String userId, String type, String label, boolean enabled,
			String channel) {
	}

	public record NotificationPreferenceUpdateRequest(@NotEmpty List<NotificationPreferencePatch> preferences) {
	}

	public record NotificationPreferencePatch(@NotBlank String type, @NotNull Boolean enabled, String channel) {
	}
}

@Service
class NotificationService {
	private static final List<String> TYPES = List.of("ORDER", "PAYMENT", "PROMOTION", "LOYALTY", "SYSTEM", "REVIEW");
	private static final List<String> CHANNELS = List.of("inApp", "email");

	private final JdbcTemplate jdbc;

	NotificationService(JdbcTemplate jdbc) {
		this.jdbc = jdbc;
	}

	@Transactional(readOnly = true)
	public Page<NotificationController.NotificationDto> notifications(UUID userId, PageRequestParams params, Boolean isRead,
																	  String type, String category) {
		int page = params.normalizedPage();
		int size = Math.min(params.normalizedPageSize(), 50);
		String normalizedType = upper(type, "");
		String normalizedCategory = category == null || category.isBlank() ? "" : category.trim();
		Long total = jdbc.queryForObject("""
				SELECT COUNT(*) FROM app_notifications
				WHERE user_id = ?
				  AND (?::boolean IS NULL OR is_read = ?::boolean)
				  AND (? = '' OR type::text = ?)
				  AND (? = '' OR category = ?)
				""", Long.class, userId, isRead, isRead, normalizedType, normalizedType, normalizedCategory, normalizedCategory);
		List<NotificationController.NotificationDto> rows = jdbc.query("""
				SELECT * FROM app_notifications
				WHERE user_id = ?
				  AND (?::boolean IS NULL OR is_read = ?::boolean)
				  AND (? = '' OR type::text = ?)
				  AND (? = '' OR category = ?)
				ORDER BY created_at DESC
				LIMIT ? OFFSET ?
				""", this::notificationRow, userId, isRead, isRead, normalizedType, normalizedType, normalizedCategory,
				normalizedCategory, size, (page - 1) * size);
		return new PageImpl<>(rows, PageRequest.of(page - 1, size), total == null ? 0 : total);
	}

	@Transactional(readOnly = true)
	public int unreadCount(UUID userId) {
		Integer count = jdbc.queryForObject("""
				SELECT COUNT(*) FROM app_notifications WHERE user_id = ? AND is_read = FALSE
				""", Integer.class, userId);
		return count == null ? 0 : count;
	}

	@Transactional
	public NotificationController.NotificationReadDto markRead(UUID userId, String id) {
		int rows = jdbc.update("""
				UPDATE app_notifications
				SET is_read = TRUE, read_at = COALESCE(read_at, NOW())
				WHERE id = ? AND user_id = ?
				""", uuid(id), userId);
		if (rows == 0) {
			throw new AppException(ErrorCode.NOTIFICATION_NOT_FOUND);
		}
		return readStatus(userId, id);
	}

	@Transactional
	public int markAllRead(UUID userId) {
		return jdbc.update("""
				UPDATE app_notifications
				SET is_read = TRUE, read_at = COALESCE(read_at, NOW())
				WHERE user_id = ? AND is_read = FALSE
				""", userId);
	}

	@Transactional
	public void delete(UUID userId, String id) {
		int rows = jdbc.update("DELETE FROM app_notifications WHERE id = ? AND user_id = ?", uuid(id), userId);
		if (rows == 0) {
			throw new AppException(ErrorCode.NOTIFICATION_NOT_FOUND);
		}
	}

	@Transactional
	public int deleteRead(UUID userId) {
		return jdbc.update("DELETE FROM app_notifications WHERE user_id = ? AND is_read = TRUE", userId);
	}

	@Transactional
	public List<NotificationController.NotificationPreferenceDto> preferences(UUID userId) {
		ensurePreferences(userId);
		return jdbc.query("""
				SELECT * FROM notification_preferences WHERE user_id = ?
				ORDER BY type::text, CASE channel WHEN 'inApp' THEN 1 WHEN 'email' THEN 2 WHEN 'sms' THEN 3 ELSE 4 END
				""", this::preferenceRow, userId);
	}

	@Transactional
	public List<NotificationController.NotificationPreferenceDto> updatePreferences(UUID userId,
																					NotificationController.NotificationPreferenceUpdateRequest request) {
		ensurePreferences(userId);
		List<NotificationController.NotificationPreferenceDto> updated = request.preferences().stream().map(item -> {
			String type = upper(item.type(), "SYSTEM");
			String channel = channel(item.channel());
			if (!item.enabled() && channel.equals("inApp") && mandatory(type)) {
				throw new AppException(ErrorCode.NOTIFICATION_PREFERENCE_REQUIRED,
						"Khong the tat thong bao " + type + " qua kenh inApp");
			}
			jdbc.update("""
					INSERT INTO notification_preferences (id, user_id, type, label, enabled, channel)
					VALUES (?, ?, ?::app_notification_type, ?, ?, ?)
					ON CONFLICT (user_id, type, channel)
					DO UPDATE SET enabled = EXCLUDED.enabled, label = EXCLUDED.label, updated_at = NOW()
					""", UUID.randomUUID(), userId, type, label(type, channel), item.enabled(), channel);
			return preference(userId, type, channel);
		}).toList();
		return updated;
	}

	private NotificationController.NotificationReadDto readStatus(UUID userId, String id) {
		try {
			return jdbc.queryForObject("""
					SELECT id, is_read, read_at FROM app_notifications WHERE id = ? AND user_id = ?
					""", (rs, row) -> new NotificationController.NotificationReadDto(rs.getObject("id").toString(),
					rs.getBoolean("is_read"), iso(rs.getObject("read_at", OffsetDateTime.class))), uuid(id), userId);
		}
		catch (EmptyResultDataAccessException exception) {
			throw new AppException(ErrorCode.NOTIFICATION_NOT_FOUND);
		}
	}

	private NotificationController.NotificationPreferenceDto preference(UUID userId, String type, String channel) {
		try {
			return jdbc.queryForObject("""
					SELECT * FROM notification_preferences WHERE user_id = ? AND type::text = ? AND channel = ?
					""", this::preferenceRow, userId, type, channel);
		}
		catch (EmptyResultDataAccessException exception) {
			throw new AppException(ErrorCode.NOT_FOUND);
		}
	}

	private void ensurePreferences(UUID userId) {
		for (String type : TYPES) {
			for (String channel : CHANNELS) {
				boolean enabled = !type.equals("PROMOTION") || channel.equals("inApp");
				jdbc.update("""
						INSERT INTO notification_preferences (id, user_id, type, label, enabled, channel)
						VALUES (?, ?, ?::app_notification_type, ?, ?, ?)
						ON CONFLICT (user_id, type, channel) DO NOTHING
						""", UUID.randomUUID(), userId, type, label(type, channel), enabled, channel);
			}
		}
	}

	private NotificationController.NotificationDto notificationRow(ResultSet rs, int row) throws SQLException {
		return new NotificationController.NotificationDto(rs.getObject("id").toString(), rs.getObject("user_id").toString(),
				rs.getString("type"), rs.getString("title"), rs.getString("message"), rs.getBoolean("is_read"),
				rs.getString("priority"), rs.getString("category"), rs.getString("entity_type"), object(rs, "entity_id"),
				rs.getString("action_url"), rs.getString("action_label"), rs.getBoolean("is_actionable"),
				iso(rs.getObject("created_at", OffsetDateTime.class)), iso(rs.getObject("read_at", OffsetDateTime.class)));
	}

	private NotificationController.NotificationPreferenceDto preferenceRow(ResultSet rs, int row) throws SQLException {
		return new NotificationController.NotificationPreferenceDto(rs.getObject("id").toString(),
				rs.getObject("user_id").toString(), rs.getString("type"), rs.getString("label"),
				rs.getBoolean("enabled"), rs.getString("channel"));
	}

	private boolean mandatory(String type) {
		return type.equals("ORDER") || type.equals("PAYMENT") || type.equals("SYSTEM");
	}

	private String channel(String value) {
		if (value == null || value.isBlank()) {
			return "inApp";
		}
		return value.trim();
	}

	private String label(String type, String channel) {
		String base = switch (type) {
			case "ORDER" -> "Cap nhat don hang";
			case "PAYMENT" -> "Thong bao thanh toan";
			case "PROMOTION" -> "Khuyen mai va uu dai";
			case "LOYALTY" -> "Diem thuong va hang thanh vien";
			case "REVIEW" -> "Danh gia san pham";
			default -> "Thong bao he thong";
		};
		return channel.equals("inApp") ? base : base + " (" + channel + ")";
	}

	private String upper(String value, String fallback) {
		return value == null || value.isBlank() ? fallback : value.trim().toUpperCase();
	}

	private UUID uuid(String id) {
		return UUID.fromString(id);
	}

	private String object(ResultSet rs, String column) throws SQLException {
		Object value = rs.getObject(column);
		return value == null ? null : value.toString();
	}

	private String iso(OffsetDateTime value) {
		return value == null ? null : DateTimeFormatter.ISO_OFFSET_DATE_TIME.format(value);
	}
}

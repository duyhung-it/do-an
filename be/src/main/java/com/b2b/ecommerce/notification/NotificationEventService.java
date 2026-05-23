package com.b2b.ecommerce.notification;

import java.util.Map;
import java.util.UUID;

import com.b2b.ecommerce.common.AppException;
import com.b2b.ecommerce.common.ErrorCode;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

@Service
public class NotificationEventService {
	private final JdbcTemplate jdbc;

	public NotificationEventService(JdbcTemplate jdbc) {
		this.jdbc = jdbc;
	}

	public void send(UUID userId, String type, String title, String message, String priority, String category,
			String entityType, UUID entityId, String actionUrl, String actionLabel) {
		String normalizedType = notificationType(type);
		if (!inAppEnabled(userId, normalizedType)) {
			return;
		}
		jdbc.update("""
				INSERT INTO app_notifications (
				  id, user_id, type, title, message, priority, category, entity_type, entity_id,
				  action_url, action_label, is_actionable
				)
				VALUES (?, ?, ?::app_notification_type, ?, ?, ?::app_notification_priority, ?, ?, ?, ?, ?, ?)
				""", UUID.randomUUID(), userId, normalizedType, title, message, priority(priority), category(category),
				blankToNull(entityType), entityId, blankToNull(actionUrl), blankToNull(actionLabel),
				actionUrl != null && !actionUrl.isBlank());
	}

	private boolean inAppEnabled(UUID userId, String type) {
		if (type.equals("ORDER") || type.equals("PAYMENT") || type.equals("SYSTEM")) {
			return true;
		}
		Boolean disabled = jdbc.queryForObject("""
				SELECT EXISTS (
				  SELECT 1 FROM notification_preferences
				  WHERE user_id = ? AND type::text = ? AND channel = 'inApp' AND enabled = FALSE
				)
				""", Boolean.class, userId, type);
		return disabled == null || !disabled;
	}

	private String notificationType(String value) {
		String normalized = value == null ? "" : value.trim().toUpperCase();
		return switch (normalized) {
			case "ORDER", "PAYMENT", "PROMOTION", "LOYALTY", "SYSTEM", "REVIEW" -> normalized;
			default -> throw new AppException(ErrorCode.VALIDATION_ERROR, "Loai thong bao khong hop le",
					Map.of("type", value == null ? "" : value));
		};
	}

	private String priority(String value) {
		String normalized = value == null ? "MEDIUM" : value.trim().toUpperCase();
		return switch (normalized) {
			case "LOW", "MEDIUM", "HIGH", "URGENT" -> normalized;
			default -> "MEDIUM";
		};
	}

	private String category(String value) {
		return value == null || value.isBlank() ? "system" : value.trim();
	}

	private String blankToNull(String value) {
		return value == null || value.isBlank() ? null : value.trim();
	}
}

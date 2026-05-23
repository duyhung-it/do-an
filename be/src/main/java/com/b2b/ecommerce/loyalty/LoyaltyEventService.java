package com.b2b.ecommerce.loyalty;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;
import java.util.UUID;

import com.b2b.ecommerce.notification.NotificationEventService;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

@Service
public class LoyaltyEventService {
	private final JdbcTemplate jdbc;
	private final NotificationEventService notifications;

	public LoyaltyEventService(JdbcTemplate jdbc, NotificationEventService notifications) {
		this.jdbc = jdbc;
		this.notifications = notifications;
	}

	public void reverseEarnedPoints(UUID orderId, String reason) {
		List<LoyaltyEarnSnapshot> earned = jdbc.query("""
				SELECT lt.loyalty_program_id, lt.customer_id, lt.points AS earned_points,
				       lp.points AS current_points, o.order_number, o.total_amount
				FROM loyalty_transactions lt
				JOIN loyalty_programs lp ON lp.id = lt.loyalty_program_id
				JOIN orders o ON o.id = lt.order_id
				WHERE lt.order_id = ? AND lt.type = 'EARN'
				ORDER BY lt.created_at ASC
				LIMIT 1
				""", this::earnedRow, orderId);
		if (earned.isEmpty()) {
			return;
		}
		LoyaltyEarnSnapshot snapshot = earned.get(0);
		Integer reversed = jdbc.queryForObject("""
				SELECT COUNT(*) FROM loyalty_transactions
				WHERE order_id = ? AND type = 'EXPIRE' AND description LIKE 'Dao diem%'
				""", Integer.class, orderId);
		if (reversed != null && reversed > 0) {
			return;
		}
		int pointsToReverse = Math.min(snapshot.currentPoints(), snapshot.earnedPoints());
		if (pointsToReverse <= 0) {
			return;
		}
		int newBalance = snapshot.currentPoints() - pointsToReverse;
		jdbc.update("""
				UPDATE loyalty_programs
				SET points = ?,
				    total_spend = GREATEST(total_spend - ?, 0),
				    updated_at = NOW()
				WHERE id = ?
				""", newBalance, snapshot.totalAmount(), snapshot.loyaltyProgramId());
		jdbc.update("""
				INSERT INTO loyalty_transactions (
				  id, loyalty_program_id, customer_id, type, points, balance_after, description, order_id
				)
				VALUES (?, ?, ?, 'EXPIRE', ?, ?, ?, ?)
				""", UUID.randomUUID(), snapshot.loyaltyProgramId(), snapshot.customerId(), -pointsToReverse, newBalance,
				"Dao diem tu don hang " + snapshot.orderNumber() + ": " + reason, orderId);
		notifications.send(snapshot.customerId(), "LOYALTY", "Da dao diem thanh vien",
				"Don hang " + snapshot.orderNumber() + " da bi dao " + pointsToReverse + " diem.", "MEDIUM", "loyalty",
				"ORDER", orderId, "/loyalty", "Xem diem");
	}

	private LoyaltyEarnSnapshot earnedRow(ResultSet rs, int rowNum) throws SQLException {
		return new LoyaltyEarnSnapshot(rs.getObject("loyalty_program_id", UUID.class),
				rs.getObject("customer_id", UUID.class), rs.getInt("earned_points"), rs.getInt("current_points"),
				rs.getString("order_number"), rs.getLong("total_amount"));
	}

	private record LoyaltyEarnSnapshot(UUID loyaltyProgramId, UUID customerId, int earnedPoints, int currentPoints,
			String orderNumber, long totalAmount) {
	}
}

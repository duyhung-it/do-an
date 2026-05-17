package com.b2b.ecommerce.loyalty;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.YearMonth;
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
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1")
public class LoyaltyController {
	private static final UUID DEV_USER_ID = UUID.fromString("00000000-0000-4000-8000-000000000001");
	private final LoyaltyService loyalty;

	public LoyaltyController(LoyaltyService loyalty) {
		this.loyalty = loyalty;
	}

	@GetMapping("/loyalty/me")
	public ApiResponse<LoyaltyProgramDto> me(@RequestHeader(name = "X-User-Id", required = false) String userId,
			@RequestHeader(name = "X-User-Name", required = false, defaultValue = "Khach hang") String userName,
			@RequestHeader(name = "X-User-Email", required = false, defaultValue = "khachhang@gmail.com") String userEmail) {
		return ApiResponse.ok(loyalty.program(userId(userId), userName, userEmail));
	}

	@GetMapping("/loyalty/me/transactions")
	public ApiResponse<List<LoyaltyTransactionDto>> transactions(
			@RequestHeader(name = "X-User-Id", required = false) String userId,
			@RequestParam(defaultValue = "1") int page,
			@RequestParam(defaultValue = "20") int pageSize,
			@RequestParam(required = false) String type) {
		PageRequestParams params = new PageRequestParams(page, pageSize, null, "createdAt", "desc");
		Page<LoyaltyTransactionDto> result = loyalty.transactions(userId(userId), params, type);
		return ApiResponse.page(result.getContent(), (int) result.getTotalElements(), params.normalizedPage(),
				params.normalizedPageSize());
	}

	@GetMapping("/loyalty/me/stats")
	public ApiResponse<LoyaltyStatsDto> stats(@RequestHeader(name = "X-User-Id", required = false) String userId,
			@RequestHeader(name = "X-User-Name", required = false, defaultValue = "Khach hang") String userName,
			@RequestHeader(name = "X-User-Email", required = false, defaultValue = "khachhang@gmail.com") String userEmail) {
		return ApiResponse.ok(loyalty.stats(userId(userId), userName, userEmail));
	}

	@GetMapping("/loyalty/rewards")
	public ApiResponse<List<LoyaltyRewardDto>> rewards(@RequestParam(defaultValue = "1") int page,
			@RequestParam(defaultValue = "12") int pageSize, @RequestParam(required = false) String category) {
		PageRequestParams params = new PageRequestParams(page, pageSize, null, "createdAt", "desc");
		Page<LoyaltyRewardDto> result = loyalty.customerRewards(params, category);
		return ApiResponse.page(result.getContent(), (int) result.getTotalElements(), params.normalizedPage(),
				params.normalizedPageSize());
	}

	@PostMapping("/loyalty/rewards/{id}/redeem")
	public ApiResponse<RewardRedeemResponse> redeem(@RequestHeader(name = "X-User-Id", required = false) String userId,
			@RequestHeader(name = "X-User-Name", required = false, defaultValue = "Khach hang") String userName,
			@RequestHeader(name = "X-User-Email", required = false, defaultValue = "khachhang@gmail.com") String userEmail,
			@PathVariable String id) {
		return ApiResponse.ok(loyalty.redeem(userId(userId), userName, userEmail, id));
	}

	@GetMapping("/admin/loyalty")
	public ApiResponse<List<LoyaltyProgramDto>> adminPrograms(@RequestParam(defaultValue = "1") int page,
			@RequestParam(defaultValue = "20") int pageSize, @RequestParam(required = false) String tier,
			@RequestParam(required = false) String search) {
		PageRequestParams params = new PageRequestParams(page, pageSize, search, "createdAt", "desc");
		Page<LoyaltyProgramDto> result = loyalty.adminPrograms(params, tier);
		return ApiResponse.page(result.getContent(), (int) result.getTotalElements(), params.normalizedPage(),
				params.normalizedPageSize());
	}

	@GetMapping("/admin/loyalty/{customerId}")
	public ApiResponse<LoyaltyProgramDetailDto> adminProgram(@PathVariable String customerId) {
		return ApiResponse.ok(loyalty.adminProgram(customerId));
	}

	@PostMapping("/admin/loyalty/bonus-points")
	public ApiResponse<List<LoyaltyProgramDto>> bonus(@Valid @RequestBody BonusPointsRequest request) {
		return ApiResponse.ok(loyalty.bonus(request));
	}

	@GetMapping("/admin/loyalty/rewards")
	public ApiResponse<List<LoyaltyRewardDto>> adminRewards(@RequestParam(defaultValue = "1") int page,
			@RequestParam(defaultValue = "20") int pageSize) {
		PageRequestParams params = new PageRequestParams(page, pageSize, null, "createdAt", "desc");
		Page<LoyaltyRewardDto> result = loyalty.adminRewards(params);
		return ApiResponse.page(result.getContent(), (int) result.getTotalElements(), params.normalizedPage(),
				params.normalizedPageSize());
	}

	@PostMapping("/admin/loyalty/rewards")
	public ResponseEntity<ApiResponse<LoyaltyRewardDto>> createReward(@Valid @RequestBody RewardRequest request) {
		return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(loyalty.createReward(request)));
	}

	@PatchMapping("/admin/loyalty/rewards/{id}")
	public ApiResponse<LoyaltyRewardDto> updateReward(@PathVariable String id, @Valid @RequestBody RewardRequest request) {
		return ApiResponse.ok(loyalty.updateReward(id, request));
	}

	@DeleteMapping("/admin/loyalty/rewards/{id}")
	public ResponseEntity<Void> deleteReward(@PathVariable String id) {
		loyalty.deleteReward(id);
		return ResponseEntity.noContent().build();
	}

	private UUID userId(String value) {
		return value == null || value.isBlank() ? DEV_USER_ID : UUID.fromString(value);
	}

	public record LoyaltyProgramDto(String id, String customerId, String customerName, String customerEmail, String tier,
			String tierLabel, int points, int totalEarnedPoints, long totalSpend, String joinedAt, String pointsExpiry,
			int nextTierThreshold, String nextTierName, String nextTierLabel, int pointsToNextTier,
			Map<String, List<String>> tierBenefits) {
	}

	public record LoyaltyTransactionDto(String id, String loyaltyProgramId, String type, int points, int balanceAfter,
			String description, String orderId, String rewardId, String createdAt) {
	}

	public record LoyaltyRewardDto(String id, String name, String description, int pointsCost, String category,
			boolean available, int stock, String imageUrl, String createdAt, String updatedAt) {
	}

	public record LoyaltyStatsDto(int currentPoints, int expiringPoints, String expiryDate, int totalEarned,
			int totalRedeemed, int totalBonusReceived, int totalExpired, List<MonthlyPointsDto> monthlyEarned) {
	}

	public record MonthlyPointsDto(String month, int points) {
	}

	public record RewardRedeemResponse(String rewardCode, LoyaltyRewardDto reward, int newPoints,
			LoyaltyTransactionDto transaction) {
	}

	public record LoyaltyProgramDetailDto(LoyaltyProgramDto program, List<LoyaltyTransactionDto> recentTransactions,
			List<RewardRedemptionDto> redemptions) {
	}

	public record RewardRedemptionDto(String id, String rewardCode, String rewardId, String rewardName, int pointsCost,
			String status, String createdAt) {
	}

	public record BonusPointsRequest(@NotNull List<String> customerIds, @NotNull @Min(1) Integer points,
			@NotBlank String description) {
	}

	public record RewardRequest(@NotBlank String name, String description, @NotNull @Min(1) Integer pointsCost,
			@NotBlank String category, Boolean available, Integer stock, String imageUrl) {
	}
}

@Service
class LoyaltyService {
	private final JdbcTemplate jdbc;

	LoyaltyService(JdbcTemplate jdbc) {
		this.jdbc = jdbc;
	}

	@Transactional
	public LoyaltyController.LoyaltyProgramDto program(UUID customerId, String name, String email) {
		ensureProgram(customerId, name, email);
		return programByCustomer(customerId);
	}

	@Transactional(readOnly = true)
	public Page<LoyaltyController.LoyaltyTransactionDto> transactions(UUID customerId, PageRequestParams params,
			String type) {
		int page = params.normalizedPage();
		int pageSize = Math.min(params.normalizedPageSize(), 100);
		String normalizedType = normalized(type);
		Long total = jdbc.queryForObject("""
				SELECT COUNT(*) FROM loyalty_transactions
				WHERE customer_id = ? AND (? = '' OR type::text = ?)
				""", Long.class, customerId, normalizedType, normalizedType);
		List<LoyaltyController.LoyaltyTransactionDto> content = jdbc.query("""
				SELECT * FROM loyalty_transactions
				WHERE customer_id = ? AND (? = '' OR type::text = ?)
				ORDER BY created_at DESC
				LIMIT ? OFFSET ?
				""", this::transactionRow, customerId, normalizedType, normalizedType, pageSize, (page - 1) * pageSize);
		return new PageImpl<>(content, PageRequest.of(page - 1, pageSize), total == null ? 0 : total);
	}

	@Transactional
	public LoyaltyController.LoyaltyStatsDto stats(UUID customerId, String name, String email) {
		LoyaltyController.LoyaltyProgramDto program = program(customerId, name, email);
		int totalRedeemed = sum(customerId, "REDEEM") * -1;
		int totalBonus = sum(customerId, "BONUS");
		int totalExpired = sum(customerId, "EXPIRE") * -1;
		List<LoyaltyController.MonthlyPointsDto> monthly = java.util.stream.IntStream.rangeClosed(0, 11)
				.mapToObj(i -> YearMonth.now().minusMonths(11 - i))
				.map(month -> new LoyaltyController.MonthlyPointsDto(month.toString(), monthlyEarned(customerId, month)))
				.toList();
		int expiring = LocalDate.parse(program.pointsExpiry()).isBefore(LocalDate.now().plusDays(31)) ? program.points() : 0;
		return new LoyaltyController.LoyaltyStatsDto(program.points(), expiring, program.pointsExpiry(),
				sum(customerId, "EARN"), totalRedeemed, totalBonus, totalExpired, monthly);
	}

	@Transactional(readOnly = true)
	public Page<LoyaltyController.LoyaltyRewardDto> customerRewards(PageRequestParams params, String category) {
		return rewards(params, category, true);
	}

	@Transactional
	public LoyaltyController.RewardRedeemResponse redeem(UUID customerId, String name, String email, String rewardIdValue) {
		ensureProgram(customerId, name, email);
		ProgramRecord program = programRecord(customerId);
		RewardRecord reward = rewardRecord(uuid(rewardIdValue));
		if (!reward.available()) {
			throw new AppException(ErrorCode.LOYALTY_REWARD_UNAVAILABLE);
		}
		if (reward.stock() == 0) {
			throw new AppException(ErrorCode.LOYALTY_REWARD_OUT_OF_STOCK);
		}
		if (program.points() < reward.pointsCost()) {
			throw new AppException(ErrorCode.LOYALTY_INSUFFICIENT_POINTS, ErrorCode.LOYALTY_INSUFFICIENT_POINTS.message(),
					Map.of("requiredPoints", reward.pointsCost(), "currentPoints", program.points()));
		}
		int newPoints = program.points() - reward.pointsCost();
		jdbc.update("UPDATE loyalty_programs SET points = ?, updated_at = NOW() WHERE id = ?", newPoints, program.id());
		if (reward.stock() > 0) {
			jdbc.update("UPDATE loyalty_rewards SET stock = stock - 1, updated_at = NOW() WHERE id = ?", reward.id());
		}
		UUID transactionId = UUID.randomUUID();
		jdbc.update("""
				INSERT INTO loyalty_transactions (
				  id, loyalty_program_id, customer_id, type, points, balance_after, description, reward_id
				)
				VALUES (?, ?, ?, 'REDEEM', ?, ?, ?, ?)
				""", transactionId, program.id(), customerId, -reward.pointsCost(), newPoints,
				"Doi thuong: " + reward.name(), reward.id());
		String code = "RW-" + System.currentTimeMillis();
		jdbc.update("""
				INSERT INTO loyalty_reward_redemptions (
				  id, reward_code, reward_id, loyalty_program_id, customer_id, points_cost
				)
				VALUES (?, ?, ?, ?, ?, ?)
				""", UUID.randomUUID(), code, reward.id(), program.id(), customerId, reward.pointsCost());
		return new LoyaltyController.RewardRedeemResponse(code, reward(uuid(rewardIdValue)),
				newPoints, transaction(transactionId));
	}

	@Transactional(readOnly = true)
	public Page<LoyaltyController.LoyaltyProgramDto> adminPrograms(PageRequestParams params, String tier) {
		int page = params.normalizedPage();
		int pageSize = Math.min(params.normalizedPageSize(), 100);
		String normalizedTier = normalized(tier);
		String search = params.search() == null || params.search().isBlank() ? "" : params.search().trim().toLowerCase();
		Long total = jdbc.queryForObject("""
				SELECT COUNT(*) FROM loyalty_programs
				WHERE (? = '' OR tier::text = ?)
				  AND (? = '' OR LOWER(customer_name) LIKE ? OR LOWER(customer_email) LIKE ?)
				""", Long.class, normalizedTier, normalizedTier, search, like(search), like(search));
		List<LoyaltyController.LoyaltyProgramDto> content = jdbc.query("""
				SELECT * FROM loyalty_programs
				WHERE (? = '' OR tier::text = ?)
				  AND (? = '' OR LOWER(customer_name) LIKE ? OR LOWER(customer_email) LIKE ?)
				ORDER BY updated_at DESC
				LIMIT ? OFFSET ?
				""", this::programRow, normalizedTier, normalizedTier, search, like(search), like(search), pageSize,
				(page - 1) * pageSize);
		return new PageImpl<>(content, PageRequest.of(page - 1, pageSize), total == null ? 0 : total);
	}

	@Transactional(readOnly = true)
	public LoyaltyController.LoyaltyProgramDetailDto adminProgram(String customerIdValue) {
		UUID customerId = uuid(customerIdValue);
		LoyaltyController.LoyaltyProgramDto program = programByCustomer(customerId);
		List<LoyaltyController.LoyaltyTransactionDto> transactions = jdbc.query("""
				SELECT * FROM loyalty_transactions WHERE customer_id = ? ORDER BY created_at DESC LIMIT 10
				""", this::transactionRow, customerId);
		List<LoyaltyController.RewardRedemptionDto> redemptions = jdbc.query("""
				SELECT r.id, r.reward_code, r.reward_id, lr.name AS reward_name, r.points_cost, r.status, r.created_at
				FROM loyalty_reward_redemptions r
				JOIN loyalty_rewards lr ON lr.id = r.reward_id
				WHERE r.customer_id = ?
				ORDER BY r.created_at DESC
				LIMIT 10
				""", this::redemptionRow, customerId);
		return new LoyaltyController.LoyaltyProgramDetailDto(program, transactions, redemptions);
	}

	@Transactional
	public List<LoyaltyController.LoyaltyProgramDto> bonus(LoyaltyController.BonusPointsRequest request) {
		return request.customerIds().stream().map(this::uuid).map(customerId -> {
			ensureProgram(customerId, "Khach hang", "");
			ProgramRecord program = programRecord(customerId);
			int balance = program.points() + request.points();
			int earned = program.totalEarnedPoints() + request.points();
			jdbc.update("""
					UPDATE loyalty_programs
					SET points = ?, total_earned_points = ?, tier = ?::loyalty_tier, points_expiry = CURRENT_DATE + 365,
					    updated_at = NOW()
					WHERE id = ?
					""", balance, earned, tier(earned), program.id());
			jdbc.update("""
					INSERT INTO loyalty_transactions (
					  id, loyalty_program_id, customer_id, type, points, balance_after, description
					)
					VALUES (?, ?, ?, 'BONUS', ?, ?, ?)
					""", UUID.randomUUID(), program.id(), customerId, request.points(), balance, request.description());
			return programByCustomer(customerId);
		}).toList();
	}

	@Transactional(readOnly = true)
	public Page<LoyaltyController.LoyaltyRewardDto> adminRewards(PageRequestParams params) {
		return rewards(params, null, false);
	}

	@Transactional
	public LoyaltyController.LoyaltyRewardDto createReward(LoyaltyController.RewardRequest request) {
		UUID id = UUID.randomUUID();
		jdbc.update("""
				INSERT INTO loyalty_rewards (id, name, description, points_cost, category, available, stock, image_url)
				VALUES (?, ?, ?, ?, ?::loyalty_reward_category, ?, ?, ?)
				""", id, request.name(), value(request.description()), request.pointsCost(), normalized(request.category()),
				request.available() == null || request.available(), request.stock() == null ? -1 : request.stock(),
				request.imageUrl());
		return reward(id);
	}

	@Transactional
	public LoyaltyController.LoyaltyRewardDto updateReward(String idValue, LoyaltyController.RewardRequest request) {
		UUID id = uuid(idValue);
		int rows = jdbc.update("""
				UPDATE loyalty_rewards
				SET name = ?, description = ?, points_cost = ?, category = ?::loyalty_reward_category,
				    available = ?, stock = ?, image_url = ?, updated_at = NOW()
				WHERE id = ?
				""", request.name(), value(request.description()), request.pointsCost(), normalized(request.category()),
				request.available() == null || request.available(), request.stock() == null ? -1 : request.stock(),
				request.imageUrl(), id);
		if (rows == 0) {
			throw new AppException(ErrorCode.LOYALTY_REWARD_NOT_FOUND);
		}
		return reward(id);
	}

	@Transactional
	public void deleteReward(String idValue) {
		int rows = jdbc.update("DELETE FROM loyalty_rewards WHERE id = ?", uuid(idValue));
		if (rows == 0) {
			throw new AppException(ErrorCode.LOYALTY_REWARD_NOT_FOUND);
		}
	}

	private void ensureProgram(UUID customerId, String name, String email) {
		jdbc.update("""
				INSERT INTO loyalty_programs (id, customer_id, customer_name, customer_email)
				VALUES (?, ?, ?, ?)
				ON CONFLICT (customer_id) DO NOTHING
				""", UUID.randomUUID(), customerId, name, email);
	}

	private Page<LoyaltyController.LoyaltyRewardDto> rewards(PageRequestParams params, String category, boolean onlyAvailable) {
		int page = params.normalizedPage();
		int pageSize = Math.min(params.normalizedPageSize(), 100);
		String normalizedCategory = normalized(category);
		Long total = jdbc.queryForObject("""
				SELECT COUNT(*) FROM loyalty_rewards
				WHERE (? = FALSE OR available = TRUE) AND (? = '' OR category::text = ?)
				""", Long.class, onlyAvailable, normalizedCategory, normalizedCategory);
		List<LoyaltyController.LoyaltyRewardDto> content = jdbc.query("""
				SELECT * FROM loyalty_rewards
				WHERE (? = FALSE OR available = TRUE) AND (? = '' OR category::text = ?)
				ORDER BY created_at DESC
				LIMIT ? OFFSET ?
				""", this::rewardRow, onlyAvailable, normalizedCategory, normalizedCategory, pageSize, (page - 1) * pageSize);
		return new PageImpl<>(content, PageRequest.of(page - 1, pageSize), total == null ? 0 : total);
	}

	private LoyaltyController.LoyaltyProgramDto programByCustomer(UUID customerId) {
		try {
			return jdbc.queryForObject("SELECT * FROM loyalty_programs WHERE customer_id = ?", this::programRow, customerId);
		}
		catch (EmptyResultDataAccessException exception) {
			throw new AppException(ErrorCode.LOYALTY_PROGRAM_NOT_FOUND);
		}
	}

	private ProgramRecord programRecord(UUID customerId) {
		return jdbc.queryForObject("SELECT * FROM loyalty_programs WHERE customer_id = ?", (rs, rowNum) -> new ProgramRecord(
				rs.getObject("id", UUID.class), rs.getObject("customer_id", UUID.class), rs.getInt("points"),
				rs.getInt("total_earned_points")), customerId);
	}

	private RewardRecord rewardRecord(UUID rewardId) {
		try {
			return jdbc.queryForObject("SELECT * FROM loyalty_rewards WHERE id = ?", (rs, rowNum) -> new RewardRecord(
					rs.getObject("id", UUID.class), rs.getString("name"), rs.getInt("points_cost"), rs.getBoolean("available"),
					rs.getInt("stock")), rewardId);
		}
		catch (EmptyResultDataAccessException exception) {
			throw new AppException(ErrorCode.LOYALTY_REWARD_NOT_FOUND);
		}
	}

	private LoyaltyController.LoyaltyRewardDto reward(UUID rewardId) {
		return jdbc.queryForObject("SELECT * FROM loyalty_rewards WHERE id = ?", this::rewardRow, rewardId);
	}

	private LoyaltyController.LoyaltyTransactionDto transaction(UUID transactionId) {
		return jdbc.queryForObject("SELECT * FROM loyalty_transactions WHERE id = ?", this::transactionRow, transactionId);
	}

	private int sum(UUID customerId, String type) {
		Number value = jdbc.queryForObject("""
				SELECT COALESCE(SUM(points), 0) FROM loyalty_transactions WHERE customer_id = ? AND type = ?::loyalty_transaction_type
				""", Number.class, customerId, type);
		return value == null ? 0 : value.intValue();
	}

	private int monthlyEarned(UUID customerId, YearMonth month) {
		Number value = jdbc.queryForObject("""
				SELECT COALESCE(SUM(points), 0)
				FROM loyalty_transactions
				WHERE customer_id = ? AND type = 'EARN'
				  AND created_at >= ? AND created_at < ?
				""", Number.class, customerId, Timestamp.valueOf(month.atDay(1).atStartOfDay()),
				Timestamp.valueOf(month.plusMonths(1).atDay(1).atStartOfDay()));
		return value == null ? 0 : value.intValue();
	}

	private LoyaltyController.LoyaltyProgramDto programRow(ResultSet rs, int rowNum) throws SQLException {
		String tier = rs.getString("tier");
		int totalEarned = rs.getInt("total_earned_points");
		NextTier next = nextTier(totalEarned);
		return new LoyaltyController.LoyaltyProgramDto(rs.getObject("id").toString(),
				rs.getObject("customer_id").toString(), rs.getString("customer_name"), rs.getString("customer_email"),
				tier, tierLabel(tier), rs.getInt("points"), totalEarned, rs.getLong("total_spend"),
				iso(rs.getObject("joined_at", OffsetDateTime.class)), rs.getObject("points_expiry", LocalDate.class).toString(),
				next.threshold(), next.name(), next.name() == null ? null : tierLabel(next.name()),
				next.name() == null ? 0 : Math.max(0, next.threshold() - totalEarned), benefits(tier, next.name()));
	}

	private LoyaltyController.LoyaltyTransactionDto transactionRow(ResultSet rs, int rowNum) throws SQLException {
		return new LoyaltyController.LoyaltyTransactionDto(rs.getObject("id").toString(),
				rs.getObject("loyalty_program_id").toString(), rs.getString("type"), rs.getInt("points"),
				rs.getInt("balance_after"), rs.getString("description"), object(rs, "order_id"), object(rs, "reward_id"),
				iso(rs.getObject("created_at", OffsetDateTime.class)));
	}

	private LoyaltyController.LoyaltyRewardDto rewardRow(ResultSet rs, int rowNum) throws SQLException {
		return new LoyaltyController.LoyaltyRewardDto(rs.getObject("id").toString(), rs.getString("name"),
				rs.getString("description"), rs.getInt("points_cost"), rs.getString("category"), rs.getBoolean("available"),
				rs.getInt("stock"), rs.getString("image_url"), iso(rs.getObject("created_at", OffsetDateTime.class)),
				iso(rs.getObject("updated_at", OffsetDateTime.class)));
	}

	private LoyaltyController.RewardRedemptionDto redemptionRow(ResultSet rs, int rowNum) throws SQLException {
		return new LoyaltyController.RewardRedemptionDto(rs.getObject("id").toString(), rs.getString("reward_code"),
				rs.getObject("reward_id").toString(), rs.getString("reward_name"), rs.getInt("points_cost"),
				rs.getString("status"), iso(rs.getObject("created_at", OffsetDateTime.class)));
	}

	private String tier(int points) {
		if (points >= 20_000) return "DIAMOND";
		if (points >= 5_000) return "GOLD";
		if (points >= 1_000) return "SILVER";
		return "BRONZE";
	}

	private NextTier nextTier(int points) {
		if (points < 1_000) return new NextTier(1_000, "SILVER");
		if (points < 5_000) return new NextTier(5_000, "GOLD");
		if (points < 20_000) return new NextTier(20_000, "DIAMOND");
		return new NextTier(0, null);
	}

	private String tierLabel(String tier) {
		return switch (tier) {
			case "SILVER" -> "Bac";
			case "GOLD" -> "Vang";
			case "DIAMOND" -> "Kim Cuong";
			default -> "Dong";
		};
	}

	private Map<String, List<String>> benefits(String current, String next) {
		return Map.of("current", List.of("Tich diem theo hang " + tierLabel(current), "Uu tien ho tro khach hang"),
				"next", next == null ? List.of() : List.of("Len hang " + tierLabel(next), "Uu dai tot hon"));
	}

	private String object(ResultSet rs, String column) throws SQLException {
		Object value = rs.getObject(column);
		return value == null ? null : value.toString();
	}

	private UUID uuid(String value) {
		try {
			return UUID.fromString(value);
		}
		catch (RuntimeException exception) {
			throw new AppException(ErrorCode.VALIDATION_ERROR, "Du lieu dau vao khong hop le",
					Map.of("id", "UUID khong dung dinh dang"));
		}
	}

	private String normalized(String value) {
		return value == null || value.isBlank() ? "" : value.trim().toUpperCase();
	}

	private String like(String value) {
		return value == null || value.isBlank() ? "" : "%" + value + "%";
	}

	private String value(String value) {
		return value == null ? "" : value;
	}

	private String iso(OffsetDateTime value) {
		return DateTimeFormatter.ISO_OFFSET_DATE_TIME.format(value);
	}

	private record ProgramRecord(UUID id, UUID customerId, int points, int totalEarnedPoints) {
	}

	private record RewardRecord(UUID id, String name, int pointsCost, boolean available, int stock) {
	}

	private record NextTier(int threshold, String name) {
	}
}

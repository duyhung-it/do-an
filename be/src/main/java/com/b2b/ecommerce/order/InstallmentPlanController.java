package com.b2b.ecommerce.order;

import java.math.BigDecimal;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import com.b2b.ecommerce.common.ApiResponse;
import com.b2b.ecommerce.common.AppException;
import com.b2b.ecommerce.common.ErrorCode;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/installment-plans")
public class InstallmentPlanController {
	private final JdbcTemplate jdbc;

	public InstallmentPlanController(JdbcTemplate jdbc) {
		this.jdbc = jdbc;
	}

	@GetMapping
	public ApiResponse<List<InstallmentPlanDto>> plans() {
		return ApiResponse.ok(jdbc.query("""
				SELECT id, bank_name, logo_url, months, interest_rate, min_amount, max_amount, is_active
				FROM installment_plans
				WHERE is_active = TRUE
				ORDER BY bank_name ASC, months ASC
				""", this::planDto));
	}

	@PostMapping("/calculate")
	public ApiResponse<InstallmentCalculationDto> calculate(@Valid @RequestBody InstallmentCalculationRequest request) {
		InstallmentPlanRecord plan = plan(request.planId());
		long amount = request.amount();
		if (amount < plan.minAmount()) {
			throw new AppException(ErrorCode.INSTALLMENT_AMOUNT_TOO_LOW, ErrorCode.INSTALLMENT_AMOUNT_TOO_LOW.message(),
					Map.of("minAmount", plan.minAmount(), "amount", amount));
		}
		if (plan.maxAmount() != null && amount > plan.maxAmount()) {
			throw new AppException(ErrorCode.INSTALLMENT_AMOUNT_TOO_HIGH, ErrorCode.INSTALLMENT_AMOUNT_TOO_HIGH.message(),
					Map.of("maxAmount", plan.maxAmount(), "amount", amount));
		}
		if (request.months() != plan.months()) {
			throw new AppException(ErrorCode.INSTALLMENT_MONTHS_INVALID, ErrorCode.INSTALLMENT_MONTHS_INVALID.message(),
					Map.of("allowedMonths", List.of(plan.months()), "months", request.months()));
		}

		long monthlyPayment = monthlyPayment(amount, plan.interestRate(), request.months());
		long totalPayment = monthlyPayment * request.months();
		long totalInterest = totalPayment - amount;
		return ApiResponse.ok(new InstallmentCalculationDto(amount, plan.interestRate(), request.months(),
				monthlyPayment, totalInterest, totalPayment));
	}

	private InstallmentPlanRecord plan(String id) {
		try {
			return jdbc.queryForObject("""
					SELECT id, months, interest_rate, min_amount, max_amount
					FROM installment_plans
					WHERE id = ? AND is_active = TRUE
					""", (rs, rowNum) -> new InstallmentPlanRecord((UUID) rs.getObject("id"), rs.getInt("months"),
					rs.getBigDecimal("interest_rate"), rs.getLong("min_amount"),
					rs.getObject("max_amount") == null ? null : rs.getLong("max_amount")), UUID.fromString(id));
		}
		catch (IllegalArgumentException | EmptyResultDataAccessException exception) {
			throw new AppException(ErrorCode.INSTALLMENT_PLAN_NOT_FOUND);
		}
	}

	private InstallmentPlanDto planDto(ResultSet rs, int rowNum) throws SQLException {
		return new InstallmentPlanDto(rs.getObject("id").toString(), rs.getString("bank_name"), rs.getString("logo_url"),
				List.of(rs.getInt("months")), rs.getBigDecimal("interest_rate"), rs.getLong("min_amount"),
				rs.getObject("max_amount") == null ? null : rs.getLong("max_amount"), rs.getBoolean("is_active"));
	}

	private long monthlyPayment(long amount, BigDecimal interestRate, int months) {
		double rate = interestRate.doubleValue() / 100.0;
		double raw = rate == 0
				? amount / (double) months
				: amount * rate * Math.pow(1 + rate, months) / (Math.pow(1 + rate, months) - 1);
		return (long) Math.ceil(raw / 1000.0) * 1000;
	}

	public record InstallmentPlanDto(String id, String bankName, String logoUrl, List<Integer> months,
			BigDecimal interestRate, long minAmount, Long maxAmount, boolean isActive) {
	}

	public record InstallmentCalculationRequest(@NotNull @Positive Long amount, @NotBlank String planId,
			@NotNull @Positive Integer months) {
	}

	public record InstallmentCalculationDto(long principal, BigDecimal interestRate, int months, long monthlyPayment,
			long totalInterest, long totalPayment) {
	}

	private record InstallmentPlanRecord(UUID id, int months, BigDecimal interestRate, long minAmount, Long maxAmount) {
	}
}

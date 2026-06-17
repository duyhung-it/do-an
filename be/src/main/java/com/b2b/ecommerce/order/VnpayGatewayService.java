package com.b2b.ecommerce.order;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.TreeMap;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

import com.b2b.ecommerce.common.AppException;
import com.b2b.ecommerce.common.ErrorCode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class VnpayGatewayService {
	private static final ZoneId VN_ZONE = ZoneId.of("Asia/Ho_Chi_Minh");
	private static final DateTimeFormatter VNPAY_TIME = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");
	private static final String DEFAULT_TMN_CODE = "DEMOV210";
	private static final String DEFAULT_HASH_SECRET = "VNPAY_SANDBOX_HASH_SECRET_CHANGE_ME";

	private final String payUrl;
	private final String tmnCode;
	private final String hashSecret;
	private final String returnUrl;
	private final int expireMinutes;

	public VnpayGatewayService(
			@Value("${vnpay.pay-url:https://sandbox.vnpayment.vn/paymentv2/vpcpay.html}") String payUrl,
			@Value("${vnpay.tmn-code:${VNPAY_TMN_CODE:DEMOV210}}") String tmnCode,
			@Value("${vnpay.hash-secret:${VNPAY_HASH_SECRET:VNPAY_SANDBOX_HASH_SECRET_CHANGE_ME}}") String hashSecret,
			@Value("${vnpay.return-url:${VNPAY_RETURN_URL:http://localhost:8080/api/v1/payments/gateway/return}}") String returnUrl,
			@Value("${vnpay.expire-minutes:15}") int expireMinutes) {
		this.payUrl = payUrl;
		this.tmnCode = tmnCode;
		this.hashSecret = hashSecret;
		this.returnUrl = returnUrl;
		this.expireMinutes = Math.max(5, expireMinutes);
	}

	public PaymentUrl createPaymentUrl(VnpayPaymentRequest request) {
		requireConfigured();
		LocalDateTime now = LocalDateTime.now(VN_ZONE);
		Map<String, String> params = new LinkedHashMap<>();
		params.put("vnp_Version", "2.1.0");
		params.put("vnp_Command", "pay");
		params.put("vnp_TmnCode", tmnCode);
		params.put("vnp_Amount", String.valueOf(request.amount() * 100));
		params.put("vnp_CurrCode", "VND");
		params.put("vnp_TxnRef", request.requestId());
		params.put("vnp_OrderInfo", request.orderInfo());
		params.put("vnp_OrderType", blankToDefault(request.orderType(), "other"));
		params.put("vnp_Locale", blankToDefault(request.locale(), "vn"));
		params.put("vnp_ReturnUrl", returnUrl);
		params.put("vnp_IpAddr", blankToDefault(request.ipAddress(), "127.0.0.1"));
		params.put("vnp_CreateDate", VNPAY_TIME.format(now));
		params.put("vnp_ExpireDate", VNPAY_TIME.format(now.plusMinutes(expireMinutes)));
		if (request.bankCode() != null && !request.bankCode().isBlank()) {
			params.put("vnp_BankCode", request.bankCode().trim());
		}
		String secureHash = hmacSha512(hashData(params), hashSecret);
		String paymentUrl = payUrl + "?" + queryString(params) + "&vnp_SecureHash=" + secureHash;
		return new PaymentUrl(paymentUrl, params, secureHash);
	}

	public VnpayReturnResult parseAndVerify(Map<String, String> params) {
		requireConfigured();
		if (params == null || params.isEmpty()) {
			throw new AppException(ErrorCode.VALIDATION_ERROR, "Du lieu dau vao khong hop le",
					Map.of("vnpay", "Thieu tham so VNPay"));
		}
		String secureHash = params.get("vnp_SecureHash");
		if (secureHash == null || secureHash.isBlank()) {
			throw new AppException(ErrorCode.PAYMENT_GATEWAY_SIGNATURE_INVALID);
		}
		Map<String, String> signedParams = new LinkedHashMap<>(params);
		signedParams.remove("vnp_SecureHash");
		signedParams.remove("vnp_SecureHashType");
		String expected = hmacSha512(hashData(signedParams), hashSecret);
		if (!expected.equalsIgnoreCase(secureHash)) {
			throw new AppException(ErrorCode.PAYMENT_GATEWAY_SIGNATURE_INVALID);
		}
		if (!tmnCode.equals(params.get("vnp_TmnCode"))) {
			throw new AppException(ErrorCode.VALIDATION_ERROR, "Du lieu dau vao khong hop le",
					Map.of("vnp_TmnCode", "Ma merchant VNPay khong khop"));
		}
		String requestId = required(params, "vnp_TxnRef");
		long amount = Long.parseLong(required(params, "vnp_Amount")) / 100;
		String responseCode = params.getOrDefault("vnp_ResponseCode", "");
		String transactionStatus = params.getOrDefault("vnp_TransactionStatus", "");
		String status = "00".equals(responseCode) && "00".equals(transactionStatus) ? "SUCCESS" : "FAILED";
		if ("24".equals(responseCode)) {
			status = "CANCELLED";
		}
		String transactionRef = params.get("vnp_TransactionNo");
		if (transactionRef == null || transactionRef.isBlank()) {
			transactionRef = params.get("vnp_BankTranNo");
		}
		return new VnpayReturnResult(requestId, transactionRef, status, amount);
	}

	private void requireConfigured() {
		if (tmnCode == null || tmnCode.isBlank() || hashSecret == null || hashSecret.isBlank()
				|| DEFAULT_TMN_CODE.equals(tmnCode) || DEFAULT_HASH_SECRET.equals(hashSecret)) {
			throw new AppException(ErrorCode.SERVICE_UNAVAILABLE, "Chua cau hinh VNPay sandbox",
					Map.of("vnpay", "Can set VNPAY_TMN_CODE va VNPAY_HASH_SECRET that tu portal sandbox VNPay"));
		}
	}

	private String required(Map<String, String> params, String key) {
		String value = params.get(key);
		if (value == null || value.isBlank()) {
			throw new AppException(ErrorCode.VALIDATION_ERROR, "Du lieu dau vao khong hop le", Map.of(key, "Bat buoc"));
		}
		return value.trim();
	}

	private String blankToDefault(String value, String defaultValue) {
		return value == null || value.isBlank() ? defaultValue : value.trim();
	}

	private String hashData(Map<String, String> params) {
		return sorted(params).entrySet().stream()
				.filter(entry -> entry.getValue() != null && !entry.getValue().isBlank())
				.map(entry -> encode(entry.getKey()) + "=" + encode(entry.getValue()))
				.reduce((left, right) -> left + "&" + right)
				.orElse("");
	}

	private String queryString(Map<String, String> params) {
		return sorted(params).entrySet().stream()
				.filter(entry -> entry.getValue() != null && !entry.getValue().isBlank())
				.map(entry -> encode(entry.getKey()) + "=" + encode(entry.getValue()))
				.reduce((left, right) -> left + "&" + right)
				.orElse("");
	}

	private Map<String, String> sorted(Map<String, String> params) {
		return new TreeMap<>(params);
	}

	private String encode(String value) {
		return URLEncoder.encode(value, StandardCharsets.UTF_8);
	}

	private String hmacSha512(String data, String secret) {
		try {
			Mac mac = Mac.getInstance("HmacSHA512");
			mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA512"));
			byte[] bytes = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
			StringBuilder hex = new StringBuilder(bytes.length * 2);
			for (byte value : bytes) {
				hex.append(String.format("%02x", value));
			}
			return hex.toString();
		}
		catch (Exception exception) {
			throw new AppException(ErrorCode.INTERNAL_ERROR, "Khong the ky du lieu VNPay");
		}
	}

	public record VnpayPaymentRequest(
			String requestId,
			long amount,
			String orderInfo,
			String orderType,
			String locale,
			String bankCode,
			String ipAddress
	) {
	}

	public record PaymentUrl(String url, Map<String, String> params, String secureHash) {
	}

	public record VnpayReturnResult(String requestId, String transactionRef, String status, long amount) {
	}
}

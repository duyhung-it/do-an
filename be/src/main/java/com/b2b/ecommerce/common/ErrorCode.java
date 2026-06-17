package com.b2b.ecommerce.common;

import org.springframework.http.HttpStatus;

public enum ErrorCode {
	AUTH_TOKEN_MISSING(HttpStatus.UNAUTHORIZED, "Khong co token xac thuc"),
	AUTH_TOKEN_INVALID(HttpStatus.UNAUTHORIZED, "Token khong hop le"),
	AUTH_TOKEN_EXPIRED(HttpStatus.UNAUTHORIZED, "Token da het han"),
	AUTH_REFRESH_TOKEN_INVALID(HttpStatus.UNAUTHORIZED, "Refresh token khong hop le"),
	AUTH_INSUFFICIENT_PERMISSION(HttpStatus.FORBIDDEN, "Khong co quyen thuc hien hanh dong nay"),
	AUTH_ACCOUNT_LOCKED(HttpStatus.FORBIDDEN, "Tai khoan bi khoa"),
	AUTH_ACCOUNT_PENDING(HttpStatus.FORBIDDEN, "Tai khoan cho xac minh"),
	AUTH_INVALID_CREDENTIALS(HttpStatus.UNAUTHORIZED, "Email hoac mat khau khong dung"),

	USER_NOT_FOUND(HttpStatus.NOT_FOUND, "Khong tim thay nguoi dung"),
	USER_EMAIL_EXISTS(HttpStatus.CONFLICT, "Email da duoc dang ky"),
	USER_PHONE_EXISTS(HttpStatus.CONFLICT, "So dien thoai da duoc dang ky"),
	USER_INVALID_PASSWORD(HttpStatus.BAD_REQUEST, "Mat khau cu khong dung"),
	USER_LOCKED(HttpStatus.FORBIDDEN, "Tai khoan nguoi dung bi khoa"),

	PRODUCT_NOT_FOUND(HttpStatus.NOT_FOUND, "Khong tim thay san pham"),
	PRODUCT_OUT_OF_STOCK(HttpStatus.UNPROCESSABLE_ENTITY, "San pham da het hang"),
	PRODUCT_INACTIVE(HttpStatus.UNPROCESSABLE_ENTITY, "San pham khong con kinh doanh"),
	PRODUCT_VARIANT_NOT_FOUND(HttpStatus.NOT_FOUND, "Khong tim thay bien the san pham"),

	ORDER_NOT_FOUND(HttpStatus.NOT_FOUND, "Khong tim thay don hang"),
	ORDER_EMPTY_ITEMS(HttpStatus.BAD_REQUEST, "Don hang khong co san pham nao"),
	ORDER_CANNOT_CANCEL(HttpStatus.UNPROCESSABLE_ENTITY, "Don hang khong the huy o trang thai nay"),
	ORDER_INVALID_STATUS_TRANSITION(HttpStatus.UNPROCESSABLE_ENTITY, "Chuyen trang thai khong hop le"),
	ORDER_EMPTY_CART(HttpStatus.BAD_REQUEST, "Gio hang trong"),
	ORDER_INSUFFICIENT_STOCK(HttpStatus.UNPROCESSABLE_ENTITY, "San pham khong du ton kho"),
	ORDER_ADDRESS_REQUIRED(HttpStatus.BAD_REQUEST, "Vui long chon dia chi giao hang"),
	ORDER_ACCESS_DENIED(HttpStatus.FORBIDDEN, "Khong co quyen truy cap don hang nay"),
	ADDRESS_NOT_FOUND(HttpStatus.NOT_FOUND, "Khong tim thay dia chi giao hang"),
	INVOICE_NOT_AVAILABLE(HttpStatus.UNPROCESSABLE_ENTITY, "Hoa don chua kha dung"),
	INVOICE_NOT_FOUND(HttpStatus.NOT_FOUND, "Khong tim thay hoa don"),
	INVOICE_ACCESS_DENIED(HttpStatus.FORBIDDEN, "Khong co quyen truy cap hoa don nay"),
	SHIPMENT_NOT_FOUND(HttpStatus.NOT_FOUND, "Khong tim thay thong tin giao hang"),
	SHIPMENT_ACCESS_DENIED(HttpStatus.FORBIDDEN, "Khong co quyen truy cap thong tin giao hang nay"),
	SHIPMENT_INVALID_STATUS_TRANSITION(HttpStatus.UNPROCESSABLE_ENTITY, "Chuyen trang thai giao hang khong hop le"),
	PAYMENT_NOT_FOUND(HttpStatus.NOT_FOUND, "Khong tim thay thong tin thanh toan"),
	PAYMENT_ACCESS_DENIED(HttpStatus.FORBIDDEN, "Khong co quyen truy cap thong tin thanh toan nay"),
	PAYMENT_ALREADY_PAID(HttpStatus.BAD_REQUEST, "Thanh toan da duoc ghi nhan day du"),
	PAYMENT_REFUNDED(HttpStatus.BAD_REQUEST, "Thanh toan da hoan tien"),
	PAYMENT_NOT_PAID(HttpStatus.BAD_REQUEST, "Chi co the hoan tien cho thanh toan da thanh toan"),
	PAYMENT_GATEWAY_SESSION_NOT_FOUND(HttpStatus.NOT_FOUND, "Khong tim thay phien thanh toan gateway"),
	PAYMENT_GATEWAY_SIGNATURE_INVALID(HttpStatus.BAD_REQUEST, "Chu ky cong thanh toan khong hop le"),
	REFUND_AMOUNT_EXCEEDS_PAID(HttpStatus.UNPROCESSABLE_ENTITY, "So tien hoan vuot qua so tien da thanh toan"),
	INSTALLMENT_PLAN_NOT_FOUND(HttpStatus.NOT_FOUND, "Khong tim thay goi tra gop"),
	INSTALLMENT_AMOUNT_TOO_LOW(HttpStatus.BAD_REQUEST, "Gia tri tra gop thap hon muc toi thieu"),
	INSTALLMENT_AMOUNT_TOO_HIGH(HttpStatus.BAD_REQUEST, "Gia tri tra gop vuot qua muc toi da"),
	INSTALLMENT_MONTHS_INVALID(HttpStatus.BAD_REQUEST, "Ky han tra gop khong hop le"),

	PROMOTION_NOT_FOUND(HttpStatus.NOT_FOUND, "Khong tim thay khuyen mai"),
	PROMOTION_EXPIRED(HttpStatus.UNPROCESSABLE_ENTITY, "Khuyen mai da het han"),
	PROMOTION_INACTIVE(HttpStatus.UNPROCESSABLE_ENTITY, "Khuyen mai chua bat dau hoac da ket thuc"),
	PROMOTION_USAGE_EXCEEDED(HttpStatus.UNPROCESSABLE_ENTITY, "Khuyen mai da het luot su dung"),
	PROMOTION_MIN_ORDER_NOT_MET(HttpStatus.UNPROCESSABLE_ENTITY, "Don hang chua dat gia tri toi thieu"),
	PROMOTION_NOT_APPLICABLE(HttpStatus.UNPROCESSABLE_ENTITY, "Khuyen mai khong ap dung cho san pham nay"),

	CART_ITEM_NOT_FOUND(HttpStatus.NOT_FOUND, "Khong tim thay san pham trong gio hang"),
	CART_ACCESS_DENIED(HttpStatus.FORBIDDEN, "Khong co quyen truy cap gio hang nay"),
	CART_LIMIT_EXCEEDED(HttpStatus.UNPROCESSABLE_ENTITY, "Gio hang toi da 50 san pham"),

	RETURN_NOT_FOUND(HttpStatus.NOT_FOUND, "Khong tim thay yeu cau tra hang"),
	RETURN_WINDOW_EXPIRED(HttpStatus.UNPROCESSABLE_ENTITY, "Da qua thoi han tra hang"),
	RETURN_ORDER_NOT_DELIVERED(HttpStatus.UNPROCESSABLE_ENTITY, "Don hang chua duoc giao"),
	RETURN_ALREADY_REQUESTED(HttpStatus.CONFLICT, "Yeu cau tra hang da ton tai"),
	RETURN_INVALID_STATUS(HttpStatus.UNPROCESSABLE_ENTITY, "Trang thai tra hang khong hop le"),

	WARRANTY_NOT_FOUND(HttpStatus.NOT_FOUND, "Khong tim thay thong tin bao hanh"),
	WARRANTY_EXPIRED(HttpStatus.UNPROCESSABLE_ENTITY, "Bao hanh da het han"),
	WARRANTY_CLAIM_ALREADY_ACTIVE(HttpStatus.CONFLICT, "Da co yeu cau bao hanh dang xu ly"),

	TRADE_IN_NOT_FOUND(HttpStatus.NOT_FOUND, "Khong tim thay yeu cau thu cu"),
	TRADE_IN_INVALID_STATUS(HttpStatus.UNPROCESSABLE_ENTITY, "Trang thai khong hop le"),

	LOYALTY_PROGRAM_NOT_FOUND(HttpStatus.NOT_FOUND, "Khong tim thay chuong trinh loyalty"),
	LOYALTY_INSUFFICIENT_POINTS(HttpStatus.UNPROCESSABLE_ENTITY, "Khong du diem"),
	LOYALTY_REWARD_UNAVAILABLE(HttpStatus.UNPROCESSABLE_ENTITY, "Phan thuong khong kha dung"),
	LOYALTY_REWARD_OUT_OF_STOCK(HttpStatus.UNPROCESSABLE_ENTITY, "Phan thuong da het"),
	LOYALTY_REWARD_NOT_FOUND(HttpStatus.NOT_FOUND, "Khong tim thay phan thuong"),
	NOTIFICATION_NOT_FOUND(HttpStatus.NOT_FOUND, "Khong tim thay thong bao"),
	NOTIFICATION_ACCESS_DENIED(HttpStatus.FORBIDDEN, "Khong co quyen thao tac tren thong bao nay"),
	NOTIFICATION_PREFERENCE_REQUIRED(HttpStatus.UNPROCESSABLE_ENTITY, "Khong the tat thong bao bat buoc"),

	VALIDATION_ERROR(HttpStatus.BAD_REQUEST, "Du lieu khong hop le"),
	NOT_FOUND(HttpStatus.NOT_FOUND, "Khong tim thay tai nguyen"),
	CONFLICT(HttpStatus.CONFLICT, "Xung dot du lieu"),
	RATE_LIMIT_EXCEEDED(HttpStatus.TOO_MANY_REQUESTS, "Qua nhieu yeu cau, vui long thu lai sau"),
	INTERNAL_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "Loi he thong, vui long thu lai"),
	SERVICE_UNAVAILABLE(HttpStatus.SERVICE_UNAVAILABLE, "Dich vu tam thoi khong kha dung");

	private final HttpStatus status;
	private final String message;

	ErrorCode(HttpStatus status, String message) {
		this.status = status;
		this.message = message;
	}

	public HttpStatus status() {
		return status;
	}

	public String message() {
		return message;
	}
}

package com.b2b.ecommerce.order;

import jakarta.validation.constraints.NotBlank;

public record ShippingAddressDto(
		@NotBlank String recipientName,
		@NotBlank String phone,
		@NotBlank String province,
		@NotBlank String district,
		@NotBlank String ward,
		@NotBlank String addressLine,
		String fullAddress
) {
	public ShippingAddressDto normalized() {
		String full = fullAddress == null || fullAddress.isBlank()
				? addressLine + ", " + ward + ", " + district + ", " + province
				: fullAddress;
		return new ShippingAddressDto(recipientName, phone, province, district, ward, addressLine, full);
	}
}

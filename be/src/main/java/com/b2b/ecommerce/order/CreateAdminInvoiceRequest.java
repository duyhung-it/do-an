package com.b2b.ecommerce.order;

import jakarta.validation.constraints.NotBlank;

public record CreateAdminInvoiceRequest(@NotBlank String orderId, Long taxAmount, String dueDate) {
}

package com.b2b.ecommerce.order;

import java.util.List;
import java.util.UUID;

import com.b2b.ecommerce.common.ApiResponse;
import com.b2b.ecommerce.common.PageRequestParams;
import org.springframework.data.domain.Page;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/invoices")
public class InvoiceController {
	private static final UUID DEV_USER_ID = UUID.fromString("00000000-0000-4000-8000-000000000001");
	private final OrderService orders;

	public InvoiceController(OrderService orders) {
		this.orders = orders;
	}

	@GetMapping
	public ApiResponse<List<InvoiceDto>> invoices(
			@RequestHeader(name = "X-User-Id", required = false) String userId,
			@RequestParam(defaultValue = "1") int page,
			@RequestParam(defaultValue = "20") int pageSize,
			@RequestParam(required = false) String status,
			@RequestParam(required = false) String search) {
		PageRequestParams params = new PageRequestParams(page, pageSize, search, "createdAt", "desc");
		Page<InvoiceDto> result = orders.customerInvoices(userId(userId), params, status);
		return ApiResponse.page(result.getContent(), (int) result.getTotalElements(), params.normalizedPage(),
				Math.min(params.normalizedPageSize(), 100));
	}

	@GetMapping("/{id}")
	public ApiResponse<InvoiceDto> invoice(
			@RequestHeader(name = "X-User-Id", required = false) String userId,
			@PathVariable String id) {
		return ApiResponse.ok(orders.customerInvoice(userId(userId), id));
	}

	@GetMapping("/{id}/download")
	public ResponseEntity<byte[]> download(
			@RequestHeader(name = "X-User-Id", required = false) String userId,
			@PathVariable String id) {
		OrderService.InvoicePdfFile file = orders.customerInvoicePdf(userId(userId), id);
		return ResponseEntity.ok()
				.contentType(MediaType.APPLICATION_PDF)
				.header(HttpHeaders.CONTENT_DISPOSITION,
						ContentDisposition.attachment().filename(file.fileName()).build().toString())
				.contentLength(file.content().length)
				.body(file.content());
	}

	private UUID userId(String value) {
		return value == null || value.isBlank() ? DEV_USER_ID : UUID.fromString(value);
	}
}

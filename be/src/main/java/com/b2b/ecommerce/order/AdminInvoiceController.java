package com.b2b.ecommerce.order;

import java.util.List;

import com.b2b.ecommerce.common.ApiResponse;
import com.b2b.ecommerce.common.PageRequestParams;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/invoices")
public class AdminInvoiceController {
	private final OrderService orders;

	public AdminInvoiceController(OrderService orders) {
		this.orders = orders;
	}

	@GetMapping
	public ApiResponse<List<InvoiceDto>> invoices(
			@RequestParam(defaultValue = "1") int page,
			@RequestParam(defaultValue = "20") int pageSize,
			@RequestParam(required = false) String status,
			@RequestParam(required = false) String search) {
		PageRequestParams params = new PageRequestParams(page, pageSize, search, "createdAt", "desc");
		Page<InvoiceDto> result = orders.adminInvoices(params, status);
		return ApiResponse.page(result.getContent(), (int) result.getTotalElements(), params.normalizedPage(),
				Math.min(params.normalizedPageSize(), 100));
	}

	@GetMapping("/{id}")
	public ApiResponse<InvoiceDto> invoice(@PathVariable String id) {
		return ApiResponse.ok(orders.adminInvoice(id));
	}

	@GetMapping("/{id}/download")
	public ResponseEntity<byte[]> download(@PathVariable String id) {
		OrderService.InvoicePdfFile file = orders.adminInvoicePdf(id);
		return ResponseEntity.ok()
				.contentType(MediaType.APPLICATION_PDF)
				.header(HttpHeaders.CONTENT_DISPOSITION,
						ContentDisposition.attachment().filename(file.fileName()).build().toString())
				.contentLength(file.content().length)
				.body(file.content());
	}

	@PostMapping
	public ResponseEntity<ApiResponse<InvoiceDto>> create(@Valid @RequestBody CreateAdminInvoiceRequest request) {
		return ResponseEntity.status(org.springframework.http.HttpStatus.CREATED)
				.body(ApiResponse.ok(orders.createAdminInvoice(request)));
	}

	@PatchMapping("/{id}/status")
	public ApiResponse<InvoiceDto> updateStatus(
			@PathVariable String id,
			@Valid @RequestBody UpdateInvoiceStatusRequest request) {
		return ApiResponse.ok(orders.updateInvoiceStatus(id, request));
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<Void> delete(@PathVariable String id) {
		orders.deleteAdminInvoice(id);
		return ResponseEntity.noContent().build();
	}
}

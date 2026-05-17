package com.b2b.ecommerce;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.List;
import java.util.UUID;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;

import static org.hamcrest.Matchers.greaterThanOrEqualTo;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@AutoConfigureMockMvc
@SpringBootTest
class B2bEcommerceApiApplicationTests {
	@Autowired
	private MockMvc mockMvc;
	@Autowired
	private JdbcTemplate jdbc;

	@Test
	void contextLoads() {
	}

	@Test
	void catalogEndpointsReturnSeedData() throws Exception {
		mockMvc.perform(get("/api/v1/categories"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.success").value(true))
				.andExpect(jsonPath("$.data[0].slug").value("dien-thoai"));

		mockMvc.perform(get("/api/v1/products").param("page", "1").param("pageSize", "2"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.success").value(true))
				.andExpect(jsonPath("$.pagination.total").value(greaterThanOrEqualTo(10)))
				.andExpect(jsonPath("$.data[0].slug").exists());
	}

	@Test
	void productNotFoundReturnsBaErrorShape() throws Exception {
		mockMvc.perform(get("/api/v1/products/00000000-0000-4000-8000-000000000000"))
				.andExpect(status().isNotFound())
				.andExpect(jsonPath("$.success").value(false))
				.andExpect(jsonPath("$.data").doesNotExist())
				.andExpect(jsonPath("$.error.code").value("PRODUCT_NOT_FOUND"))
				.andExpect(jsonPath("$.error.message").value("Khong tim thay san pham"));
	}

	@Test
	void validationErrorsReturnFieldDetails() throws Exception {
		String body = """
				{
				  "sku": "",
				  "price": 0,
				  "stock": -1
				}
				""";

		mockMvc.perform(post("/api/v1/admin/products/11111111-1111-4111-8111-111111111111/variants")
						.contentType(MediaType.APPLICATION_JSON)
						.content(body))
				.andExpect(status().isBadRequest())
				.andExpect(jsonPath("$.success").value(false))
				.andExpect(jsonPath("$.error.code").value("VALIDATION_ERROR"))
				.andExpect(jsonPath("$.error.details.name").exists())
				.andExpect(jsonPath("$.error.details.sku").exists())
				.andExpect(jsonPath("$.error.details.price").exists())
				.andExpect(jsonPath("$.error.details.stock").exists());
	}

	@Test
	void openApiDocsAreAvailable() throws Exception {
		mockMvc.perform(get("/v3/api-docs"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.openapi").exists())
				.andExpect(jsonPath("$.info.title").value("CELLPHONES B2C API"));
	}

	@Test
	void adminDashboardEndpointsReturnRealShapes() throws Exception {
		mockMvc.perform(get("/api/v1/admin/dashboard/stats"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.data.totalRevenue").exists())
				.andExpect(jsonPath("$.data.totalOrders").exists())
				.andExpect(jsonPath("$.data.lowStockVariantCount").exists());

		mockMvc.perform(get("/api/v1/admin/dashboard/revenue-chart")
						.param("period", "day"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.data").isArray());

		mockMvc.perform(get("/api/v1/admin/dashboard/recent-orders").param("limit", "5"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.data").isArray());

		mockMvc.perform(get("/api/v1/admin/dashboard/recent-activity").param("limit", "5"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.data").isArray());
	}

	@Test
	void adminRemainingGapEndpointsReturnRealShapes() throws Exception {
		mockMvc.perform(get("/api/v1/admin/inventory").param("page", "1").param("pageSize", "5"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.data").isArray())
				.andExpect(jsonPath("$.data[0].minStock").exists());
		mockMvc.perform(get("/api/v1/admin/inventory/low-stock"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.data").isArray());
		mockMvc.perform(get("/api/v1/admin/inventory/b1b2c3d4-0001-0001-0001-000000000001/movements"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.data").isArray());

		mockMvc.perform(get("/api/v1/admin/promotions").param("page", "1").param("pageSize", "5"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.pagination.total").value(greaterThanOrEqualTo(10)));

		mockMvc.perform(get("/api/v1/admin/payments").param("page", "1").param("pageSize", "5"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.pagination.total").value(greaterThanOrEqualTo(10)));
		mockMvc.perform(get("/api/v1/admin/invoices").param("page", "1").param("pageSize", "5"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.pagination.total").value(greaterThanOrEqualTo(10)));
		mockMvc.perform(get("/api/v1/admin/shipments").param("page", "1").param("pageSize", "5"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.pagination.total").value(greaterThanOrEqualTo(10)));

		mockMvc.perform(get("/api/v1/admin/returns"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.pagination.total").value(greaterThanOrEqualTo(10)));
		mockMvc.perform(get("/api/v1/admin/warranty-claims"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.pagination.total").value(greaterThanOrEqualTo(10)));
		mockMvc.perform(get("/api/v1/admin/reviews"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.pagination.total").value(greaterThanOrEqualTo(10)));
		mockMvc.perform(get("/api/v1/admin/trade-in"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.pagination.total").value(greaterThanOrEqualTo(10)));

		mockMvc.perform(get("/api/v1/admin/reports/revenue"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.data").isArray());
		mockMvc.perform(get("/api/v1/admin/reports/products"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.data").isArray());
		mockMvc.perform(get("/api/v1/admin/reports/customers"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.data").isArray());
		mockMvc.perform(get("/api/v1/admin/reports/inventory"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.data").isArray());
		mockMvc.perform(get("/api/v1/admin/reports/returns"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.data").isArray());
		mockMvc.perform(get("/api/v1/admin/reports/export"))
				.andExpect(status().isOk())
				.andExpect(header().string("Content-Type", org.hamcrest.Matchers.containsString("text/csv")));

		mockMvc.perform(get("/api/v1/admin/settings"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.data").isArray());
		mockMvc.perform(get("/api/v1/admin/banners"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.data").isArray());
		mockMvc.perform(get("/api/v1/admin/email-templates"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.data").isArray());
		mockMvc.perform(get("/api/v1/admin/seo"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.data").isArray());
		mockMvc.perform(get("/api/v1/admin/branches"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.data").isArray());
		mockMvc.perform(get("/api/v1/admin/staff"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.data").isArray());
		mockMvc.perform(get("/api/v1/admin/activity-logs"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.data").isArray());
		mockMvc.perform(get("/api/v1/admin/activity-logs/stats"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.data").isArray());
	}

	@Test
	void adminBaRemainingEndpointsReturnRealShapes() throws Exception {
		String adminUserId = "ee000000-0001-4000-8000-000000000003";
		mockMvc.perform(get("/api/v1/admin/users").param("page", "1").param("pageSize", "5"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.data").isArray())
				.andExpect(jsonPath("$.data[0].role").exists());
		mockMvc.perform(get("/api/v1/admin/users/{id}", adminUserId))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.data.email").value("qa.customer@cellphones.local"));
		String lockedBody = """
				{
				  "status": "LOCKED"
				}
				""";
		mockMvc.perform(patch("/api/v1/admin/users/{id}/status", adminUserId)
						.contentType(MediaType.APPLICATION_JSON)
						.content(lockedBody))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.data.status").value("LOCKED"));
		String activeBody = """
				{
				  "status": "ACTIVE"
				}
				""";
		mockMvc.perform(patch("/api/v1/admin/users/{id}/status", adminUserId)
						.contentType(MediaType.APPLICATION_JSON)
						.content(activeBody))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.data.status").value("ACTIVE"));

		String notificationBody = """
				{
				  "userId": "bc000000-0001-4000-8000-000000000003",
				  "type": "SYSTEM",
				  "title": "QA admin notification",
				  "message": "Thong bao test cho FE admin",
				  "priority": "HIGH",
				  "category": "qa",
				  "actionUrl": "/admin",
				  "actionLabel": "Mo admin"
				}
				""";
		mockMvc.perform(post("/api/v1/admin/notifications/send-to-user")
						.contentType(MediaType.APPLICATION_JSON)
						.content(notificationBody))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.data.type").value("SYSTEM"))
				.andExpect(jsonPath("$.data.isActionable").value(true));
		String broadcastBody = """
				{
				  "type": "SYSTEM",
				  "title": "QA broadcast",
				  "message": "Broadcast test",
				  "priority": "MEDIUM",
				  "category": "qa"
				}
				""";
		mockMvc.perform(post("/api/v1/admin/notifications/broadcast")
						.contentType(MediaType.APPLICATION_JSON)
						.content(broadcastBody))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.data.length()").value(greaterThanOrEqualTo(2)));

		String supplierBody = """
				{
				  "name": "QA Supplier %s",
				  "contactPerson": "QA Contact",
				  "phone": "0909999999",
				  "email": "qa-supplier-%s@cellphones.local",
				  "address": "QA warehouse",
				  "categories": ["iPhone", "Samsung"],
				  "paymentTerms": "Net 7",
				  "isActive": true
				}
				""".formatted(UUID.randomUUID(), UUID.randomUUID());
		MvcResult supplier = mockMvc.perform(post("/api/v1/admin/suppliers")
						.contentType(MediaType.APPLICATION_JSON)
						.content(supplierBody))
				.andExpect(status().isCreated())
				.andExpect(jsonPath("$.data.name").exists())
				.andReturn();
		String supplierId = supplier.getResponse().getContentAsString().replaceAll("(?s).*\"id\"\\s*:\\s*\"([^\"]+)\".*", "$1");
		mockMvc.perform(patch("/api/v1/admin/suppliers/{id}", supplierId)
						.contentType(MediaType.APPLICATION_JSON)
						.content(supplierBody.replace("\"isActive\": true", "\"isActive\": false")))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.data.isActive").value(false));
		mockMvc.perform(get("/api/v1/admin/suppliers").param("search", "QA Supplier"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.pagination.total").value(greaterThanOrEqualTo(1)));

		String installmentBody = """
				{
				  "bankName": "QA Credit",
				  "logoUrl": "https://cdn.cellphones.vn/installments/qa.png",
				  "months": 9,
				  "interestRate": 1.25,
				  "minAmount": 1000000,
				  "maxAmount": 50000000,
				  "isActive": true
				}
				""";
		MvcResult installment = mockMvc.perform(post("/api/v1/admin/installment-plans")
						.contentType(MediaType.APPLICATION_JSON)
						.content(installmentBody))
				.andExpect(status().isCreated())
				.andExpect(jsonPath("$.data.bankName").value("QA Credit"))
				.andReturn();
		String installmentId = installment.getResponse().getContentAsString().replaceAll("(?s).*\"id\"\\s*:\\s*\"([^\"]+)\".*", "$1");
		mockMvc.perform(get("/api/v1/admin/installment-plans"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.data.length()").value(greaterThanOrEqualTo(2)));
		mockMvc.perform(delete("/api/v1/admin/installment-plans/{id}", installmentId))
				.andExpect(status().isNoContent());

		String userId = UUID.randomUUID().toString();
		String orderBody = """
				{
				  "items": [
				    {
				      "productId": "b1b2c3d4-0001-0001-0001-000000000001",
				      "variantId": "c1b2c3d4-0001-0001-0001-000000000001",
				      "quantity": 1
				    }
				  ],
				  "shippingAddress": {
				    "recipientName": "QA Admin Invoice",
				    "phone": "0960000000",
				    "province": "Ha Noi",
				    "district": "Cau Giay",
				    "ward": "Dich Vong",
				    "addressLine": "5 Xuan Thuy"
				  },
				  "paymentMethod": "COD"
				}
				""";
		MvcResult createdOrder = mockMvc.perform(post("/api/v1/orders")
						.header("X-User-Id", userId)
						.header("X-User-Name", "QA Admin Invoice")
						.header("X-User-Phone", "0960000000")
						.contentType(MediaType.APPLICATION_JSON)
						.content(orderBody))
				.andExpect(status().isCreated())
				.andReturn();
		String orderId = createdOrder.getResponse().getContentAsString()
				.replaceAll("(?s).*\"order\"\\s*:\\s*\\{\\s*\"id\"\\s*:\\s*\"([^\"]+)\".*", "$1");
		String adminInvoiceBody = """
				{
				  "orderId": "%s",
				  "taxAmount": 0,
				  "dueDate": "2026-05-30"
				}
				""".formatted(orderId);
		MvcResult invoice = mockMvc.perform(post("/api/v1/admin/invoices")
						.contentType(MediaType.APPLICATION_JSON)
						.content(adminInvoiceBody))
				.andExpect(status().isCreated())
				.andExpect(jsonPath("$.data.orderId").value(orderId))
				.andReturn();
		String invoiceId = invoice.getResponse().getContentAsString().replaceAll("(?s).*\"id\"\\s*:\\s*\"([^\"]+)\".*", "$1");
		mockMvc.perform(delete("/api/v1/admin/invoices/{id}", invoiceId))
				.andExpect(status().isNoContent());

		String warrantyBody = """
				{
				  "orderId": "%s",
				  "productId": "b1b2c3d4-0001-0001-0001-000000000001",
				  "productName": "iPhone 15 Pro Max 256GB",
				  "brand": "Apple",
				  "serialNumber": "QA-SN-%s",
				  "warrantyMonths": 12,
				  "customerId": "%s",
				  "customerName": "QA Admin Invoice",
				  "customerPhone": "0960000000"
				}
				""".formatted(orderId, UUID.randomUUID(), userId);
		mockMvc.perform(post("/api/v1/admin/warranty")
						.contentType(MediaType.APPLICATION_JSON)
						.content(warrantyBody))
				.andExpect(status().isCreated())
				.andExpect(jsonPath("$.data.status").value("ACTIVE"));
		mockMvc.perform(get("/api/v1/admin/warranty").param("search", "QA Admin Invoice"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.pagination.total").value(greaterThanOrEqualTo(1)));

		String reviewReplyBody = """
				{
				  "content": "Cam on ban da danh gia san pham",
				  "adminName": "Admin QA"
				}
				""";
		mockMvc.perform(post("/api/v1/admin/reviews/aa000000-0003-4000-8000-000000000001/reply")
						.contentType(MediaType.APPLICATION_JSON)
						.content(reviewReplyBody))
				.andExpect(status().isCreated())
				.andExpect(jsonPath("$.data.adminName").value("Admin QA"));
		mockMvc.perform(patch("/api/v1/admin/reviews/aa000000-0003-4000-8000-000000000001/status")
						.contentType(MediaType.APPLICATION_JSON)
						.content(activeBody.replace("ACTIVE", "APPROVED")))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.data.status").value("APPROVED"));

		List<UUID> imageIds = jdbc.query("""
				SELECT id FROM product_images
				WHERE product_id = 'b1b2c3d4-0001-0001-0001-000000000001'
				ORDER BY sort_order DESC
				""", (rs, rowNum) -> rs.getObject("id", UUID.class));
		String reorderBody = """
				{
				  "imageIds": ["%s", "%s"]
				}
				""".formatted(imageIds.get(0), imageIds.get(1));
		mockMvc.perform(patch("/api/v1/admin/products/b1b2c3d4-0001-0001-0001-000000000001/images/reorder")
						.contentType(MediaType.APPLICATION_JSON)
						.content(reorderBody))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.data[0].id").value(imageIds.get(0).toString()));

		String comboBody = """
				{
				  "name": "QA Combo %s",
				  "description": "Combo FE admin QA",
				  "productIds": [
				    "b1b2c3d4-0001-0001-0001-000000000001",
				    "b1b2c3d4-0001-0001-0001-000000000002"
				  ],
				  "price": 39990000,
				  "status": "ACTIVE"
				}
				""".formatted(UUID.randomUUID());
		MvcResult combo = mockMvc.perform(post("/api/v1/admin/combos")
						.contentType(MediaType.APPLICATION_JSON)
						.content(comboBody))
				.andExpect(status().isCreated())
				.andExpect(jsonPath("$.data.productIds.length()").value(2))
				.andReturn();
		String comboId = combo.getResponse().getContentAsString().replaceAll("(?s).*\"id\"\\s*:\\s*\"([^\"]+)\".*", "$1");
		mockMvc.perform(patch("/api/v1/admin/combos/{id}", comboId)
						.contentType(MediaType.APPLICATION_JSON)
						.content(comboBody.replace("\"status\": \"ACTIVE\"", "\"status\": \"INACTIVE\"")))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.data.status").value("INACTIVE"));
		mockMvc.perform(delete("/api/v1/admin/combos/{id}", comboId))
				.andExpect(status().isNoContent());

		String blogBody = """
				{
				  "title": "QA Blog %s",
				  "content": "Noi dung bai viet QA cho FE admin",
				  "excerpt": "QA excerpt",
				  "status": "DRAFT",
				  "coverImage": "https://cdn.cellphones.vn/blog/qa.jpg"
				}
				""".formatted(UUID.randomUUID());
		MvcResult blog = mockMvc.perform(post("/api/v1/admin/blog")
						.contentType(MediaType.APPLICATION_JSON)
						.content(blogBody))
				.andExpect(status().isCreated())
				.andExpect(jsonPath("$.data.status").value("DRAFT"))
				.andReturn();
		String blogId = blog.getResponse().getContentAsString().replaceAll("(?s).*\"id\"\\s*:\\s*\"([^\"]+)\".*", "$1");
		mockMvc.perform(patch("/api/v1/admin/blog/{id}", blogId)
						.contentType(MediaType.APPLICATION_JSON)
						.content(blogBody.replace("\"status\": \"DRAFT\"", "\"status\": \"PUBLISHED\"")))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.data.status").value("PUBLISHED"));
		mockMvc.perform(delete("/api/v1/admin/blog/{id}", blogId))
				.andExpect(status().isNoContent());

		mockMvc.perform(get("/api/v1/admin/settings/banners"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.data").isArray());
		mockMvc.perform(get("/api/v1/admin/settings/email-templates"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.data").isArray());
		mockMvc.perform(get("/api/v1/admin/settings/seo"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.data").isArray());
		mockMvc.perform(patch("/api/v1/admin/branches/aa000000-0007-4000-8000-000000000001/toggle"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.data.isActive").exists());
		mockMvc.perform(get("/api/v1/admin/staff/aa000000-0008-4000-8000-000000000001"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.data.email").value("admin@cellphones.local"));
	}

	@Test
	void customerAfterSalesFlowMatchesBaEndpoints() throws Exception {
		String returnUserId = "bc000000-0001-4000-8000-000000000003";
		mockMvc.perform(get("/api/v1/returns")
						.header("X-User-Id", returnUserId))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.data").isArray())
				.andExpect(jsonPath("$.data[0].orderId").value("bb000000-0001-4000-8000-000000000003"));
		mockMvc.perform(get("/api/v1/returns/aa000000-0001-4000-8000-000000000003")
						.header("X-User-Id", returnUserId))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.data.customerId").value(returnUserId));
		mockMvc.perform(get("/api/v1/returns/aa000000-0001-4000-8000-000000000003")
						.header("X-User-Id", UUID.randomUUID().toString()))
				.andExpect(status().isNotFound())
				.andExpect(jsonPath("$.error.code").value("RETURN_NOT_FOUND"));

		String warrantyUserId = "bc000000-0001-4000-8000-000000000001";
		jdbc.update("""
				DELETE FROM warranty_claims
				WHERE customer_id = ? AND issue_description = 'May test bi loi loa'
				""", UUID.fromString(warrantyUserId));
		MvcResult warranties = mockMvc.perform(get("/api/v1/warranty")
						.header("X-User-Id", warrantyUserId))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.data[0].status").value("ACTIVE"))
				.andReturn();
		String warrantyBody = warranties.getResponse().getContentAsString();
		String warrantyId = warrantyBody.replaceAll("(?s).*\"id\"\\s*:\\s*\"([^\"]+)\".*", "$1");
		String warrantyClaimBody = """
				{
				  "warrantyId": "%s",
				  "issueDescription": "May test bi loi loa"
				}
				""".formatted(warrantyId);
		mockMvc.perform(post("/api/v1/warranty-claims")
						.header("X-User-Id", warrantyUserId)
						.contentType(MediaType.APPLICATION_JSON)
						.content(warrantyClaimBody))
				.andExpect(status().isCreated())
				.andExpect(jsonPath("$.data.warrantyId").value(warrantyId))
				.andExpect(jsonPath("$.data.status").value("NEW"));
		mockMvc.perform(get("/api/v1/warranty-claims")
						.header("X-User-Id", warrantyUserId))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.pagination.total").value(greaterThanOrEqualTo(1)));

		String tradeUserId = "bd000000-0001-4000-8000-000000000001";
		jdbc.update("DELETE FROM trade_in_requests WHERE customer_id = ?", UUID.fromString(tradeUserId));
		mockMvc.perform(get("/api/v1/trade-in/estimate")
						.param("brand", "Apple")
						.param("model", "iPhone 13 Pro")
						.param("condition", "GOOD"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.data.estimatedValue").value(7000000));
		String tradeBody = """
				{
				  "deviceName": "iPhone 13 Pro 128GB",
				  "brand": "Apple",
				  "model": "iPhone 13 Pro",
				  "condition": "GOOD",
				  "targetProductId": "b1b2c3d4-0001-0001-0001-000000000001",
				  "images": ["https://storage.cellphones.vn/trade-in/test-front.jpg"]
				}
				""";
		MvcResult trade = mockMvc.perform(post("/api/v1/trade-in")
						.header("X-User-Id", tradeUserId)
						.header("X-User-Name", "Trade Test")
						.header("X-User-Phone", "0999999999")
						.contentType(MediaType.APPLICATION_JSON)
						.content(tradeBody))
				.andExpect(status().isCreated())
				.andExpect(jsonPath("$.data.status").value("AWAITING_VALUATION"))
				.andReturn();
		String tradeResponse = trade.getResponse().getContentAsString();
		String tradeId = tradeResponse.replaceAll("(?s).*\"id\"\\s*:\\s*\"([^\"]+)\".*", "$1");
		String valuateBody = """
				{
				  "finalValuation": 6500000,
				  "adminNote": "QA valuation"
				}
				""";
		mockMvc.perform(patch("/api/v1/admin/trade-in/{id}/valuate", tradeId)
						.contentType(MediaType.APPLICATION_JSON)
						.content(valuateBody))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.data.status").value("VALUED"));
		mockMvc.perform(patch("/api/v1/trade-in/{id}/accept", tradeId)
						.header("X-User-Id", tradeUserId))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.data.status").value("ACCEPTED"));
	}

	@Test
	void loyaltyCustomerAndAdminFlowMatchesBaEndpoints() throws Exception {
		String userId = "bd000000-0001-4000-8000-000000000002";
		jdbc.update("DELETE FROM loyalty_programs WHERE customer_id = ?", UUID.fromString(userId));

		mockMvc.perform(get("/api/v1/loyalty/me")
						.header("X-User-Id", userId)
						.header("X-User-Name", "Loyalty Test")
						.header("X-User-Email", "loyalty@test.local"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.data.customerId").value(userId))
				.andExpect(jsonPath("$.data.tier").value("BRONZE"))
				.andExpect(jsonPath("$.data.points").value(0));

		String bonusBody = """
				{
				  "customerIds": ["%s"],
				  "points": 1000,
				  "description": "QA bonus points"
				}
				""".formatted(userId);
		mockMvc.perform(post("/api/v1/admin/loyalty/bonus-points")
						.contentType(MediaType.APPLICATION_JSON)
						.content(bonusBody))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.data[0].points").value(1000))
				.andExpect(jsonPath("$.data[0].tier").value("SILVER"));

		mockMvc.perform(get("/api/v1/loyalty/me/transactions")
						.header("X-User-Id", userId)
						.param("type", "BONUS"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.pagination.total").value(1))
				.andExpect(jsonPath("$.data[0].points").value(1000));

		mockMvc.perform(get("/api/v1/loyalty/me/stats")
						.header("X-User-Id", userId))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.data.currentPoints").value(1000))
				.andExpect(jsonPath("$.data.totalBonusReceived").value(1000))
				.andExpect(jsonPath("$.data.monthlyEarned.length()").value(12));

		mockMvc.perform(get("/api/v1/loyalty/rewards")
						.param("category", "VOUCHER"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.data[0].id").value("dd000000-0003-4000-8000-000000000001"))
				.andExpect(jsonPath("$.data[0].available").value(true));

		mockMvc.perform(post("/api/v1/loyalty/rewards/dd000000-0003-4000-8000-000000000001/redeem")
						.header("X-User-Id", userId))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.data.rewardCode").exists())
				.andExpect(jsonPath("$.data.newPoints").value(600))
				.andExpect(jsonPath("$.data.transaction.type").value("REDEEM"));

		mockMvc.perform(get("/api/v1/admin/loyalty")
						.param("search", "Loyalty Test"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.pagination.total").value(1))
				.andExpect(jsonPath("$.data[0].customerId").value(userId));
		mockMvc.perform(get("/api/v1/admin/loyalty/{customerId}", userId))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.data.program.points").value(600))
				.andExpect(jsonPath("$.data.redemptions[0].rewardCode").exists());

		String rewardBody = """
				{
				  "name": "QA Loyalty Reward",
				  "description": "Reward for FE admin QA",
				  "pointsCost": 150,
				  "category": "GIFT",
				  "available": true,
				  "stock": 3,
				  "imageUrl": "https://cdn.cellphones.vn/rewards/qa.jpg"
				}
				""";
		MvcResult reward = mockMvc.perform(post("/api/v1/admin/loyalty/rewards")
						.contentType(MediaType.APPLICATION_JSON)
						.content(rewardBody))
				.andExpect(status().isCreated())
				.andExpect(jsonPath("$.data.name").value("QA Loyalty Reward"))
				.andReturn();
		String rewardResponse = reward.getResponse().getContentAsString();
		String rewardId = rewardResponse.replaceAll("(?s).*\"id\"\\s*:\\s*\"([^\"]+)\".*", "$1");
		mockMvc.perform(get("/api/v1/admin/loyalty/rewards"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.pagination.total").value(greaterThanOrEqualTo(5)));
		mockMvc.perform(delete("/api/v1/admin/loyalty/rewards/{id}", rewardId))
				.andExpect(status().isNoContent());
	}

	@Test
	void cartFlowAddsMergesAndValidatesItems() throws Exception {
		String userId = UUID.randomUUID().toString();
		String body = """
				{
				  "productId": "b1b2c3d4-0001-0001-0001-000000000001",
				  "variantId": "c1b2c3d4-0001-0001-0001-000000000001",
				  "quantity": 1
				}
				""";

		mockMvc.perform(delete("/api/v1/cart").header("X-User-Id", userId))
				.andExpect(status().isNoContent());

		mockMvc.perform(post("/api/v1/cart/items")
						.header("X-User-Id", userId)
						.contentType(MediaType.APPLICATION_JSON)
						.content(body))
				.andExpect(status().isCreated())
				.andExpect(jsonPath("$.success").value(true))
				.andExpect(jsonPath("$.data.productName").value("iPhone 15 Pro Max 256GB"))
				.andExpect(jsonPath("$.data.quantity").value(1))
				.andExpect(jsonPath("$.data.unitPrice").value(33990000));

		mockMvc.perform(post("/api/v1/cart/items")
						.header("X-User-Id", userId)
						.contentType(MediaType.APPLICATION_JSON)
						.content(body))
				.andExpect(status().isCreated())
				.andExpect(jsonPath("$.data.quantity").value(2));

		mockMvc.perform(get("/api/v1/cart").header("X-User-Id", userId))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.data.itemCount").value(1))
				.andExpect(jsonPath("$.data.subtotal").value(67980000));

		mockMvc.perform(post("/api/v1/cart/validate").header("X-User-Id", userId))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.data.valid").value(true))
				.andExpect(jsonPath("$.data.issues.length()").value(0));

		mockMvc.perform(delete("/api/v1/cart").header("X-User-Id", userId))
				.andExpect(status().isNoContent());
	}

	@Test
	void promotionsCanBeListedAndValidated() throws Exception {
		mockMvc.perform(get("/api/v1/promotions").param("page", "1").param("pageSize", "10"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.success").value(true))
				.andExpect(jsonPath("$.pagination.total").value(greaterThanOrEqualTo(8)))
				.andExpect(jsonPath("$.data[0].code").exists());

		String validBody = """
				{
				  "code": "WELCOME10",
				  "cartTotal": 33990000,
				  "cartItems": [
				    {
				      "productId": "b1b2c3d4-0001-0001-0001-000000000001",
				      "categoryId": "a1b2c3d4-0001-0001-0001-000000000003",
				      "brand": "Apple"
				    }
				  ]
				}
				""";

		mockMvc.perform(post("/api/v1/promotions/validate")
						.contentType(MediaType.APPLICATION_JSON)
						.content(validBody))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.success").value(true))
				.andExpect(jsonPath("$.data.valid").value(true))
				.andExpect(jsonPath("$.data.promotion.code").value("WELCOME10"))
				.andExpect(jsonPath("$.data.discount").value(500000));

		String invalidBody = """
				{
				  "code": "WELCOME10",
				  "cartTotal": 100000,
				  "cartItems": [
				    {
				      "productId": "b1b2c3d4-0001-0001-0001-000000000003",
				      "categoryId": "a1b2c3d4-0001-0001-0001-000000000004",
				      "brand": "Apple"
				    }
				  ]
				}
				""";

		mockMvc.perform(post("/api/v1/promotions/validate")
						.contentType(MediaType.APPLICATION_JSON)
						.content(invalidBody))
				.andExpect(status().isUnprocessableEntity())
				.andExpect(jsonPath("$.success").value(false))
				.andExpect(jsonPath("$.error.code").value("PROMOTION_MIN_ORDER_NOT_MET"))
				.andExpect(jsonPath("$.error.details.minOrderValue").value(2000000));
	}

	@Test
	void orderCreationCreatesPaymentAndClearsCart() throws Exception {
		String userId = UUID.randomUUID().toString();
		String cartBody = """
				{
				  "productId": "b1b2c3d4-0001-0001-0001-000000000001",
				  "variantId": "c1b2c3d4-0001-0001-0001-000000000001",
				  "quantity": 1
				}
				""";
		String orderBody = """
				{
				  "items": [
				    {
				      "productId": "b1b2c3d4-0001-0001-0001-000000000001",
				      "variantId": "c1b2c3d4-0001-0001-0001-000000000001",
				      "quantity": 1
				    }
				  ],
				  "shippingAddress": {
				    "recipientName": "Nguyen Van A",
				    "phone": "0901234567",
				    "province": "TP. Ho Chi Minh",
				    "district": "Quan 1",
				    "ward": "Ben Nghe",
				    "addressLine": "123 Ly Tu Trong"
				  },
				  "paymentMethod": "COD",
				  "promotionCode": "WELCOME10",
				  "notes": "Giao hang gio hanh chinh"
				}
				""";

		mockMvc.perform(delete("/api/v1/cart").header("X-User-Id", userId))
				.andExpect(status().isNoContent());

		mockMvc.perform(post("/api/v1/cart/items")
						.header("X-User-Id", userId)
						.contentType(MediaType.APPLICATION_JSON)
						.content(cartBody))
				.andExpect(status().isCreated());

		mockMvc.perform(post("/api/v1/orders")
						.header("X-User-Id", userId)
						.header("X-User-Name", "Nguyen Van A")
						.header("X-User-Email", "nguyenvana@gmail.com")
						.header("X-User-Phone", "0901234567")
						.contentType(MediaType.APPLICATION_JSON)
						.content(orderBody))
				.andExpect(status().isCreated())
				.andExpect(jsonPath("$.success").value(true))
				.andExpect(jsonPath("$.data.order.orderNumber").exists())
				.andExpect(jsonPath("$.data.order.status").value("PENDING"))
				.andExpect(jsonPath("$.data.order.paymentStatus").value("UNPAID"))
				.andExpect(jsonPath("$.data.order.subtotal").value(33990000))
				.andExpect(jsonPath("$.data.order.discount").value(500000))
				.andExpect(jsonPath("$.data.order.totalAmount").value(33490000))
				.andExpect(jsonPath("$.data.order.items[0].productName").value("iPhone 15 Pro Max 256GB"))
				.andExpect(jsonPath("$.data.payment.method").value("COD"))
				.andExpect(jsonPath("$.data.payment.status").value("UNPAID"))
				.andExpect(jsonPath("$.data.payment.amount").value(33490000));

		mockMvc.perform(get("/api/v1/orders").header("X-User-Id", userId))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.pagination.total").value(1))
				.andExpect(jsonPath("$.data[0].status").value("PENDING"))
				.andExpect(jsonPath("$.data[0].items.count").value(1))
				.andExpect(jsonPath("$.data[0].items.firstItem.productName").value("iPhone 15 Pro Max 256GB"));

		mockMvc.perform(get("/api/v1/cart").header("X-User-Id", userId))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.data.itemCount").value(0));
	}

	@Test
	void orderDetailIsScopedToCurrentUser() throws Exception {
		String userId = UUID.randomUUID().toString();
		String otherUserId = UUID.randomUUID().toString();
		String orderBody = """
				{
				  "items": [
				    {
				      "productId": "b1b2c3d4-0001-0001-0001-000000000003",
				      "variantId": "c1b2c3d4-0001-0001-0001-000000000004",
				      "quantity": 2
				    }
				  ],
				  "shippingAddress": {
				    "recipientName": "Le Van B",
				    "phone": "0912345678",
				    "province": "Ha Noi",
				    "district": "Cau Giay",
				    "ward": "Dich Vong",
				    "addressLine": "12 Xuan Thuy"
				  },
				  "paymentMethod": "BANK_TRANSFER"
				}
				""";

		MvcResult created = mockMvc.perform(post("/api/v1/orders")
						.header("X-User-Id", userId)
						.header("X-User-Name", "Le Van B")
						.header("X-User-Email", "levanb@gmail.com")
						.header("X-User-Phone", "0912345678")
						.contentType(MediaType.APPLICATION_JSON)
						.content(orderBody))
				.andExpect(status().isCreated())
				.andExpect(jsonPath("$.data.order.shippingFee").value(30000))
				.andReturn();
		String body = created.getResponse().getContentAsString();
		String orderId = body.replaceAll("(?s).*\"order\"\\s*:\\s*\\{\\s*\"id\"\\s*:\\s*\"([^\"]+)\".*", "$1");

		mockMvc.perform(get("/api/v1/orders/{id}", orderId).header("X-User-Id", userId))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.data.id").value(orderId))
				.andExpect(jsonPath("$.data.internalNotes").doesNotExist())
				.andExpect(jsonPath("$.data.items[0].productName").value("Sac nhanh Apple USB-C 20W"))
				.andExpect(jsonPath("$.data.statusHistory[0].toStatus").value("PENDING"));

		mockMvc.perform(get("/api/v1/orders/{id}", orderId).header("X-User-Id", otherUserId))
				.andExpect(status().isNotFound())
				.andExpect(jsonPath("$.error.code").value("ORDER_NOT_FOUND"));
	}

	@Test
	void pendingOrderCanBeCancelledByOwner() throws Exception {
		String userId = UUID.randomUUID().toString();
		String orderBody = """
				{
				  "items": [
				    {
				      "productId": "b1b2c3d4-0001-0001-0001-000000000001",
				      "variantId": "c1b2c3d4-0001-0001-0001-000000000001",
				      "quantity": 1
				    }
				  ],
				  "shippingAddress": {
				    "recipientName": "Pham Thi C",
				    "phone": "0923456789",
				    "province": "Da Nang",
				    "district": "Hai Chau",
				    "ward": "Thach Thang",
				    "addressLine": "1 Bach Dang"
				  },
				  "paymentMethod": "COD",
				  "promotionCode": "WELCOME10"
				}
				""";
		String cancelBody = """
				{
				  "reason": "Toi muon doi mau san pham"
				}
				""";

		MvcResult created = mockMvc.perform(post("/api/v1/orders")
						.header("X-User-Id", userId)
						.header("X-User-Name", "Pham Thi C")
						.header("X-User-Email", "phamthic@gmail.com")
						.header("X-User-Phone", "0923456789")
						.contentType(MediaType.APPLICATION_JSON)
						.content(orderBody))
				.andExpect(status().isCreated())
				.andReturn();
		String body = created.getResponse().getContentAsString();
		String orderId = body.replaceAll("(?s).*\"order\"\\s*:\\s*\\{\\s*\"id\"\\s*:\\s*\"([^\"]+)\".*", "$1");

		mockMvc.perform(delete("/api/v1/orders/{id}/cancel", orderId)
						.header("X-User-Id", userId)
						.contentType(MediaType.APPLICATION_JSON)
						.content(cancelBody))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.data.status").value("CANCELLED"))
				.andExpect(jsonPath("$.data.cancelReason").value("Toi muon doi mau san pham"))
				.andExpect(jsonPath("$.data.statusHistory[1].fromStatus").value("PENDING"))
				.andExpect(jsonPath("$.data.statusHistory[1].toStatus").value("CANCELLED"));

		mockMvc.perform(delete("/api/v1/orders/{id}/cancel", orderId)
						.header("X-User-Id", userId)
						.contentType(MediaType.APPLICATION_JSON)
						.content(cancelBody))
				.andExpect(status().isUnprocessableEntity())
				.andExpect(jsonPath("$.error.code").value("ORDER_CANNOT_CANCEL"));
	}

	@Test
	void adminCanListDetailAndUpdateOrderStatus() throws Exception {
		String userId = UUID.randomUUID().toString();
		String orderBody = """
				{
				  "items": [
				    {
				      "productId": "b1b2c3d4-0001-0001-0001-000000000001",
				      "variantId": "c1b2c3d4-0001-0001-0001-000000000001",
				      "quantity": 1
				    }
				  ],
				  "shippingAddress": {
				    "recipientName": "Tran Van D",
				    "phone": "0934567890",
				    "province": "Ha Noi",
				    "district": "Cau Giay",
				    "ward": "Dich Vong",
				    "addressLine": "2 Xuan Thuy"
				  },
				  "paymentMethod": "COD"
				}
				""";
		String statusBody = """
				{
				  "status": "CONFIRMED",
				  "note": "Da xac nhan don hang"
				}
				""";
		String invalidStatusBody = """
				{
				  "status": "PENDING",
				  "note": "Khong duoc quay lai pending"
				}
				""";
		String cancelBody = """
				{
				  "status": "CANCELLED",
				  "note": "Khach yeu cau huy sau khi xac nhan"
				}
				""";
		String shippingBody = """
				{
				  "status": "SHIPPING",
				  "note": "Bat dau giao hang"
				}
				""";
		String deliveredBody = """
				{
				  "status": "DELIVERED",
				  "note": "Giao hang thanh cong"
				}
				""";
		String notesBody = """
				{
				  "notes": "Khach VIP, uu tien giao truoc. Da goi xac nhan luc 10:30."
				}
				""";

		MvcResult created = mockMvc.perform(post("/api/v1/orders")
						.header("X-User-Id", userId)
						.header("X-User-Name", "Tran Van D")
						.header("X-User-Email", "tranvand@gmail.com")
						.header("X-User-Phone", "0934567890")
						.contentType(MediaType.APPLICATION_JSON)
						.content(orderBody))
				.andExpect(status().isCreated())
				.andReturn();
		String body = created.getResponse().getContentAsString();
		String orderId = body.replaceAll("(?s).*\"order\"\\s*:\\s*\\{\\s*\"id\"\\s*:\\s*\"([^\"]+)\".*", "$1");
		Integer stockBeforeConfirm = jdbc.queryForObject("""
				SELECT stock FROM product_variants WHERE id = 'c1b2c3d4-0001-0001-0001-000000000001'
				""", Integer.class);

		mockMvc.perform(get("/api/v1/admin/orders")
						.param("search", "Tran Van D"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.data[0].customerName").value("Tran Van D"))
				.andExpect(jsonPath("$.data[0].paymentMethod").value("COD"));

		mockMvc.perform(get("/api/v1/admin/orders/{id}", orderId))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.data.customerEmail").value("tranvand@gmail.com"))
				.andExpect(jsonPath("$.data.internalNotes").doesNotExist());

		mockMvc.perform(patch("/api/v1/admin/orders/{id}/notes", orderId)
						.contentType(MediaType.APPLICATION_JSON)
						.content(notesBody))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.data.internalNotes").value("Khach VIP, uu tien giao truoc. Da goi xac nhan luc 10:30."));
		mockMvc.perform(get("/api/v1/orders/{id}", orderId)
						.header("X-User-Id", userId))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.data.internalNotes").doesNotExist());

		mockMvc.perform(patch("/api/v1/admin/orders/{id}/status", orderId)
						.header("X-Admin-Name", "Admin CELLPHONES")
						.contentType(MediaType.APPLICATION_JSON)
						.content(statusBody))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.data.status").value("CONFIRMED"))
				.andExpect(jsonPath("$.data.statusHistory[1].fromStatus").value("PENDING"))
				.andExpect(jsonPath("$.data.statusHistory[1].toStatus").value("CONFIRMED"));
		Integer stockAfterConfirm = jdbc.queryForObject("""
				SELECT stock FROM product_variants WHERE id = 'c1b2c3d4-0001-0001-0001-000000000001'
				""", Integer.class);
		org.assertj.core.api.Assertions.assertThat(stockAfterConfirm).isEqualTo(stockBeforeConfirm - 1);

		mockMvc.perform(patch("/api/v1/admin/orders/{id}/status", orderId)
						.contentType(MediaType.APPLICATION_JSON)
						.content(invalidStatusBody))
				.andExpect(status().isUnprocessableEntity())
				.andExpect(jsonPath("$.error.code").value("ORDER_INVALID_STATUS_TRANSITION"));

		String createShipmentBody = """
				{
				  "orderId": "%s",
				  "trackingNumber": "GHTK-MANUAL-%s",
				  "carrierName": "Giao Hang Tiet Kiem",
				  "status": "AWAITING_PICKUP",
				  "estimatedDelivery": "2026-05-20"
				}
				""".formatted(orderId, userId);
		MvcResult createdShipment = mockMvc.perform(post("/api/v1/admin/shipments")
						.contentType(MediaType.APPLICATION_JSON)
						.content(createShipmentBody))
				.andExpect(status().isCreated())
				.andExpect(jsonPath("$.data.orderId").value(orderId))
				.andExpect(jsonPath("$.data.status").value("AWAITING_PICKUP"))
				.andReturn();
		String createdShipmentBodyText = createdShipment.getResponse().getContentAsString();
		String precreatedShipmentId = createdShipmentBodyText.replaceAll("(?s).*\"id\"\\s*:\\s*\"([^\"]+)\".*", "$1");
		String updateTrackingBody = """
				{
				  "trackingNumber": "GHTK-UPDATED-%s",
				  "carrierName": "Giao Hang Nhanh",
				  "estimatedDelivery": "2026-05-21"
				}
				""".formatted(userId);
		mockMvc.perform(patch("/api/v1/admin/shipments/{id}", precreatedShipmentId)
						.contentType(MediaType.APPLICATION_JSON)
						.content(updateTrackingBody))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.data.trackingNumber").value("GHTK-UPDATED-" + userId))
				.andExpect(jsonPath("$.data.carrierName").value("Giao Hang Nhanh"))
				.andExpect(jsonPath("$.data.estimatedDelivery").value("2026-05-21"));

		mockMvc.perform(patch("/api/v1/admin/orders/{id}/status", orderId)
						.contentType(MediaType.APPLICATION_JSON)
						.content(shippingBody))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.data.status").value("SHIPPING"));
		mockMvc.perform(get("/api/v1/orders/{id}/invoice", orderId)
						.header("X-User-Id", userId))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.data.orderNumber").exists())
				.andExpect(jsonPath("$.data.status").value("PENDING"));
		MvcResult invoiceList = mockMvc.perform(get("/api/v1/invoices")
						.header("X-User-Id", userId)
						.param("status", "PENDING"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.pagination.total").value(1))
				.andExpect(jsonPath("$.data[0].orderId").value(orderId))
				.andExpect(jsonPath("$.data[0].status").value("PENDING"))
				.andReturn();
		String invoiceListBody = invoiceList.getResponse().getContentAsString();
		String invoiceId = invoiceListBody.replaceAll("(?s).*\"id\"\\s*:\\s*\"([^\"]+)\".*", "$1");
		mockMvc.perform(get("/api/v1/invoices/{id}", invoiceId)
						.header("X-User-Id", userId))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.data.orderId").value(orderId))
				.andExpect(jsonPath("$.data.status").value("PENDING"));
		MvcResult pdf = mockMvc.perform(get("/api/v1/invoices/{id}/download", invoiceId)
						.header("X-User-Id", userId))
				.andExpect(status().isOk())
				.andExpect(header().string("Content-Type", "application/pdf"))
				.andExpect(header().string("Content-Disposition", org.hamcrest.Matchers.containsString(".pdf")))
				.andReturn();
		org.assertj.core.api.Assertions.assertThat(pdf.getResponse().getContentAsByteArray())
				.startsWith("%PDF".getBytes());
		mockMvc.perform(get("/api/v1/admin/invoices")
						.param("status", "PENDING")
						.param("search", "Tran Van D"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.pagination.total").value(1))
				.andExpect(jsonPath("$.data[0].id").value(invoiceId));
		mockMvc.perform(get("/api/v1/admin/invoices/{id}", invoiceId))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.data.orderId").value(orderId));
		mockMvc.perform(get("/api/v1/admin/invoices/{id}/download", invoiceId))
				.andExpect(status().isOk())
				.andExpect(header().string("Content-Type", "application/pdf"));
		mockMvc.perform(get("/api/v1/orders/{id}/shipment", orderId)
						.header("X-User-Id", userId))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.data.orderNumber").exists())
				.andExpect(jsonPath("$.data.trackingNumber").value("GHTK-UPDATED-" + userId))
				.andExpect(jsonPath("$.data.carrierName").value("Giao Hang Nhanh"))
				.andExpect(jsonPath("$.data.status").value("IN_TRANSIT"));
		MvcResult shipmentList = mockMvc.perform(get("/api/v1/shipments")
						.header("X-User-Id", userId)
						.param("status", "IN_TRANSIT"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.pagination.total").value(1))
				.andExpect(jsonPath("$.data[0].orderId").value(orderId))
				.andExpect(jsonPath("$.data[0].status").value("IN_TRANSIT"))
				.andReturn();
		String shipmentListBody = shipmentList.getResponse().getContentAsString();
		String shipmentId = shipmentListBody.replaceAll("(?s).*\"id\"\\s*:\\s*\"([^\"]+)\".*", "$1");
		mockMvc.perform(get("/api/v1/shipments/{id}", shipmentId)
						.header("X-User-Id", userId))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.data.orderId").value(orderId))
				.andExpect(jsonPath("$.data.status").value("IN_TRANSIT"));
		mockMvc.perform(get("/api/v1/admin/shipments")
						.param("status", "IN_TRANSIT")
						.param("search", "Tran Van D"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.pagination.total").value(1))
				.andExpect(jsonPath("$.data[0].id").value(shipmentId));
		mockMvc.perform(get("/api/v1/admin/shipments/{id}", shipmentId))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.data.orderId").value(orderId));
		String failedShipmentBody = """
				{
				  "status": "FAILED"
				}
				""";
		mockMvc.perform(patch("/api/v1/admin/shipments/{id}/status", shipmentId)
						.contentType(MediaType.APPLICATION_JSON)
						.content(failedShipmentBody))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.data.status").value("FAILED"));

		mockMvc.perform(patch("/api/v1/admin/orders/{id}/status", orderId)
						.contentType(MediaType.APPLICATION_JSON)
						.content(deliveredBody))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.data.status").value("DELIVERED"))
				.andExpect(jsonPath("$.data.paymentStatus").value("PAID"));
		mockMvc.perform(get("/api/v1/orders/{id}/invoice", orderId)
						.header("X-User-Id", userId))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.data.status").value("PAID"))
				.andExpect(jsonPath("$.data.paidAt").exists());
		mockMvc.perform(get("/api/v1/orders/{id}/shipment", orderId)
						.header("X-User-Id", userId))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.data.status").value("DELIVERED"))
				.andExpect(jsonPath("$.data.actualDelivery").exists());
		mockMvc.perform(get("/api/v1/shipments/{id}", shipmentId)
						.header("X-User-Id", userId))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.data.status").value("DELIVERED"))
				.andExpect(jsonPath("$.data.actualDelivery").exists());

	}

	@Test
	void cancellingConfirmedOrderRestoresReservedStock() throws Exception {
		String userId = UUID.randomUUID().toString();
		String orderBody = """
				{
				  "items": [
				    {
				      "productId": "b1b2c3d4-0001-0001-0001-000000000001",
				      "variantId": "c1b2c3d4-0001-0001-0001-000000000001",
				      "quantity": 1
				    }
				  ],
				  "shippingAddress": {
				    "recipientName": "Tran Van E",
				    "phone": "0944567890",
				    "province": "Ha Noi",
				    "district": "Cau Giay",
				    "ward": "Dich Vong",
				    "addressLine": "3 Xuan Thuy"
				  },
				  "paymentMethod": "COD"
				}
				""";
		String statusBody = """
				{
				  "status": "CONFIRMED",
				  "note": "Da xac nhan don hang"
				}
				""";
		String cancelBody = """
				{
				  "status": "CANCELLED",
				  "note": "Khach yeu cau huy sau khi xac nhan"
				}
				""";

		MvcResult created = mockMvc.perform(post("/api/v1/orders")
						.header("X-User-Id", userId)
						.header("X-User-Name", "Tran Van E")
						.header("X-User-Email", "tranvane@gmail.com")
						.header("X-User-Phone", "0944567890")
						.contentType(MediaType.APPLICATION_JSON)
						.content(orderBody))
				.andExpect(status().isCreated())
				.andReturn();
		String body = created.getResponse().getContentAsString();
		String orderId = body.replaceAll("(?s).*\"order\"\\s*:\\s*\\{\\s*\"id\"\\s*:\\s*\"([^\"]+)\".*", "$1");
		Integer stockBeforeConfirm = jdbc.queryForObject("""
				SELECT stock FROM product_variants WHERE id = 'c1b2c3d4-0001-0001-0001-000000000001'
				""", Integer.class);

		mockMvc.perform(patch("/api/v1/admin/orders/{id}/status", orderId)
						.contentType(MediaType.APPLICATION_JSON)
						.content(statusBody))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.data.status").value("CONFIRMED"));
		Integer stockAfterConfirm = jdbc.queryForObject("""
				SELECT stock FROM product_variants WHERE id = 'c1b2c3d4-0001-0001-0001-000000000001'
				""", Integer.class);
		org.assertj.core.api.Assertions.assertThat(stockAfterConfirm).isEqualTo(stockBeforeConfirm - 1);

		mockMvc.perform(patch("/api/v1/admin/orders/{id}/status", orderId)
						.contentType(MediaType.APPLICATION_JSON)
						.content(cancelBody))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.data.status").value("CANCELLED"));
		Integer stockAfterCancel = jdbc.queryForObject("""
				SELECT stock FROM product_variants WHERE id = 'c1b2c3d4-0001-0001-0001-000000000001'
				""", Integer.class);
		org.assertj.core.api.Assertions.assertThat(stockAfterCancel).isEqualTo(stockBeforeConfirm);
	}

	@Test
	void adminCanMarkBankTransferPaymentPaid() throws Exception {
		String userId = UUID.randomUUID().toString();
		String orderBody = """
				{
				  "items": [
				    {
				      "productId": "b1b2c3d4-0001-0001-0001-000000000003",
				      "variantId": "c1b2c3d4-0001-0001-0001-000000000004",
				      "quantity": 1
				    }
				  ],
				  "shippingAddress": {
				    "recipientName": "Hoang Van F",
				    "phone": "0954567890",
				    "province": "Ha Noi",
				    "district": "Cau Giay",
				    "ward": "Dich Vong",
				    "addressLine": "4 Xuan Thuy"
				  },
				  "paymentMethod": "BANK_TRANSFER"
				}
				""";

		MvcResult created = mockMvc.perform(post("/api/v1/orders")
						.header("X-User-Id", userId)
						.header("X-User-Name", "Hoang Van F")
						.header("X-User-Email", "hoangvanf@gmail.com")
						.header("X-User-Phone", "0954567890")
						.contentType(MediaType.APPLICATION_JSON)
						.content(orderBody))
				.andExpect(status().isCreated())
				.andExpect(jsonPath("$.data.payment.method").value("BANK_TRANSFER"))
				.andExpect(jsonPath("$.data.payment.status").value("UNPAID"))
				.andReturn();
		String body = created.getResponse().getContentAsString();
		String orderId = body.replaceAll("(?s).*\"order\"\\s*:\\s*\\{\\s*\"id\"\\s*:\\s*\"([^\"]+)\".*", "$1");
		String paymentId = body.replaceAll("(?s).*\"payment\"\\s*:\\s*\\{\\s*\"id\"\\s*:\\s*\"([^\"]+)\".*", "$1");
		String transactionRef = "TXN-VCB-" + userId;
		String paidBody = """
				{
				  "paidAmount": 520000,
				  "transactionRef": "%s",
				  "method": "BANK_TRANSFER"
				}
				""".formatted(transactionRef);

		mockMvc.perform(get("/api/v1/payments")
						.header("X-User-Id", userId)
						.param("status", "UNPAID"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.pagination.total").value(1))
				.andExpect(jsonPath("$.data[0].id").value(paymentId))
				.andExpect(jsonPath("$.data[0].orderId").value(orderId))
				.andExpect(jsonPath("$.data[0].remainingAmount").value(520000));

		mockMvc.perform(get("/api/v1/payments/{id}", paymentId)
						.header("X-User-Id", userId))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.data.id").value(paymentId))
				.andExpect(jsonPath("$.data.status").value("UNPAID"))
				.andExpect(jsonPath("$.data.method").value("BANK_TRANSFER"));

		mockMvc.perform(get("/api/v1/payments/{id}", paymentId)
						.header("X-User-Id", UUID.randomUUID().toString()))
				.andExpect(status().isForbidden())
				.andExpect(jsonPath("$.error.code").value("PAYMENT_ACCESS_DENIED"));

		mockMvc.perform(get("/api/v1/admin/payments")
						.param("status", "UNPAID")
						.param("method", "BANK_TRANSFER")
						.param("search", "Hoang Van F"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.pagination.total").value(1))
				.andExpect(jsonPath("$.data[0].id").value(paymentId))
				.andExpect(jsonPath("$.data[0].customerName").value("Hoang Van F"));

		mockMvc.perform(get("/api/v1/admin/payments/{id}", paymentId))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.data.id").value(paymentId))
				.andExpect(jsonPath("$.data.customerPhone").value("0954567890"));

		mockMvc.perform(patch("/api/v1/admin/payments/{id}/mark-overdue", paymentId))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.data.status").value("OVERDUE"));

		mockMvc.perform(patch("/api/v1/admin/payments/{id}/mark-paid", paymentId)
						.contentType(MediaType.APPLICATION_JSON)
						.content(paidBody))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.data.status").value("PAID"))
				.andExpect(jsonPath("$.data.method").value("BANK_TRANSFER"))
				.andExpect(jsonPath("$.data.transactionRef").value(transactionRef))
				.andExpect(jsonPath("$.data.remainingAmount").value(0))
				.andExpect(jsonPath("$.data.paidAt").exists());

		mockMvc.perform(get("/api/v1/orders/{id}", orderId).header("X-User-Id", userId))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.data.paymentStatus").value("PAID"));

		mockMvc.perform(get("/api/v1/payments/{id}", paymentId)
						.header("X-User-Id", userId))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.data.status").value("PAID"))
				.andExpect(jsonPath("$.data.transactionRef").value(transactionRef))
				.andExpect(jsonPath("$.data.paidAt").exists());

		mockMvc.perform(patch("/api/v1/admin/payments/{id}/mark-paid", paymentId)
						.contentType(MediaType.APPLICATION_JSON)
						.content(paidBody))
				.andExpect(status().isBadRequest())
				.andExpect(jsonPath("$.error.code").value("PAYMENT_ALREADY_PAID"));

		String refundBody = """
				{
				  "refundAmount": 520000,
				  "reason": "Khach huy don sau khi da thanh toan",
				  "method": "BANK_TRANSFER"
				}
				""";
		mockMvc.perform(post("/api/v1/admin/payments/{id}/refund", paymentId)
						.contentType(MediaType.APPLICATION_JSON)
						.content(refundBody))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.data.status").value("REFUNDED"))
				.andExpect(jsonPath("$.data.refundAmount").value(520000))
				.andExpect(jsonPath("$.data.refundMethod").value("BANK_TRANSFER"))
				.andExpect(jsonPath("$.data.refundedAt").exists());
		mockMvc.perform(get("/api/v1/orders/{id}", orderId).header("X-User-Id", userId))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.data.paymentStatus").value("REFUNDED"));
	}
}

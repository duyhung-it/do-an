package com.b2b.ecommerce;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.UUID;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@AutoConfigureMockMvc
@SpringBootTest
class B2bEcommerceApiApplicationTests {
	@Autowired
	private MockMvc mockMvc;

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
				.andExpect(jsonPath("$.pagination.total").value(3))
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
				.andExpect(jsonPath("$.pagination.total").value(2))
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
}

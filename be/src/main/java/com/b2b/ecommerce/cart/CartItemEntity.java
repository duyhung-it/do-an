package com.b2b.ecommerce.cart;

import java.time.OffsetDateTime;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

@Entity
@Table(name = "cart_items")
class CartItemEntity {
	@Id
	@GeneratedValue
	private UUID id;
	private UUID userId;
	private UUID productId;
	private UUID variantId;
	private String productName;
	private String productImage;
	private String brand;
	private String variantName;
	private String color;
	private String storage;
	private int quantity;
	private long unitPrice;
	@Column(insertable = false, updatable = false)
	private long totalPrice;
	private String note;
	private OffsetDateTime addedAt;

	@PrePersist
	void prePersist() {
		addedAt = OffsetDateTime.now();
	}

	UUID getId() { return id; }
	UUID getUserId() { return userId; }
	void setUserId(UUID userId) { this.userId = userId; }
	UUID getProductId() { return productId; }
	void setProductId(UUID productId) { this.productId = productId; }
	UUID getVariantId() { return variantId; }
	void setVariantId(UUID variantId) { this.variantId = variantId; }
	String getProductName() { return productName; }
	void setProductName(String productName) { this.productName = productName; }
	String getProductImage() { return productImage; }
	void setProductImage(String productImage) { this.productImage = productImage; }
	String getBrand() { return brand; }
	void setBrand(String brand) { this.brand = brand; }
	String getVariantName() { return variantName; }
	void setVariantName(String variantName) { this.variantName = variantName; }
	String getColor() { return color; }
	void setColor(String color) { this.color = color; }
	String getStorage() { return storage; }
	void setStorage(String storage) { this.storage = storage; }
	int getQuantity() { return quantity; }
	void setQuantity(int quantity) { this.quantity = quantity; }
	long getUnitPrice() { return unitPrice; }
	void setUnitPrice(long unitPrice) { this.unitPrice = unitPrice; }
	long getTotalPrice() { return totalPrice; }
	String getNote() { return note; }
	void setNote(String note) { this.note = note; }
	OffsetDateTime getAddedAt() { return addedAt; }
}

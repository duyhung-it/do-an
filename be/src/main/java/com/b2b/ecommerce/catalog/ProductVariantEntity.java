package com.b2b.ecommerce.catalog;

import java.time.OffsetDateTime;
import java.util.UUID;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

@Entity
@Table(name = "product_variants")
class ProductVariantEntity {
	@Id
	@GeneratedValue
	private UUID id;
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "product_id")
	private ProductEntity product;
	private String name;
	private String sku;
	private long price;
	private Long originalPrice;
	private int stock;
	private String color;
	private String storage;
	private String ram;
	private boolean isActive = true;
	private OffsetDateTime createdAt;
	private OffsetDateTime updatedAt;

	@PrePersist
	void prePersist() {
		OffsetDateTime now = OffsetDateTime.now();
		createdAt = now;
		updatedAt = now;
	}

	@PreUpdate
	void preUpdate() { updatedAt = OffsetDateTime.now(); }

	UUID getId() { return id; }
	ProductEntity getProduct() { return product; }
	void setProduct(ProductEntity product) { this.product = product; }
	String getName() { return name; }
	void setName(String name) { this.name = name; }
	String getSku() { return sku; }
	void setSku(String sku) { this.sku = sku; }
	long getPrice() { return price; }
	void setPrice(long price) { this.price = price; }
	Long getOriginalPrice() { return originalPrice; }
	void setOriginalPrice(Long originalPrice) { this.originalPrice = originalPrice; }
	int getStock() { return stock; }
	void setStock(int stock) { this.stock = stock; }
	String getColor() { return color; }
	void setColor(String color) { this.color = color; }
	String getStorage() { return storage; }
	void setStorage(String storage) { this.storage = storage; }
	String getRam() { return ram; }
	void setRam(String ram) { this.ram = ram; }
	boolean isActive() { return isActive; }
	void setActive(boolean active) { isActive = active; }
	OffsetDateTime getCreatedAt() { return createdAt; }
	OffsetDateTime getUpdatedAt() { return updatedAt; }
}

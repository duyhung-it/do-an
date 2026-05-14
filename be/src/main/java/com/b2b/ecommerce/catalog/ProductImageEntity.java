package com.b2b.ecommerce.catalog;

import java.time.OffsetDateTime;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

@Entity
@Table(name = "product_images")
class ProductImageEntity {
	@Id
	@GeneratedValue
	private UUID id;
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "product_id")
	private ProductEntity product;
	@Column(columnDefinition = "text")
	private String url;
	private String altText;
	private int sortOrder;
	private boolean isPrimary;
	private OffsetDateTime createdAt;

	@PrePersist
	void prePersist() { createdAt = OffsetDateTime.now(); }

	UUID getId() { return id; }
	ProductEntity getProduct() { return product; }
	void setProduct(ProductEntity product) { this.product = product; }
	String getUrl() { return url; }
	void setUrl(String url) { this.url = url; }
	String getAltText() { return altText; }
	void setAltText(String altText) { this.altText = altText; }
	int getSortOrder() { return sortOrder; }
	void setSortOrder(int sortOrder) { this.sortOrder = sortOrder; }
	boolean isPrimary() { return isPrimary; }
	void setPrimary(boolean primary) { isPrimary = primary; }
	OffsetDateTime getCreatedAt() { return createdAt; }
}

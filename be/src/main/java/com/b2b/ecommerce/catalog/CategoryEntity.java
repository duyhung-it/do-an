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
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

@Entity
@Table(name = "categories")
class CategoryEntity {
	@Id
	@GeneratedValue
	private UUID id;
	private String name;
	private String slug;
	@Column(nullable = false)
	private String description = "";
	@Column(nullable = false)
	private String icon = "";
	private String imageUrl;
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "parent_id")
	private CategoryEntity parent;
	private int level;
	private String path;
	private boolean isActive = true;
	private int sortOrder;
	private int productCount;
	private String metaTitle;
	@Column(columnDefinition = "text")
	private String metaDescription;
	private OffsetDateTime createdAt;
	private OffsetDateTime updatedAt;

	@PrePersist
	void prePersist() {
		OffsetDateTime now = OffsetDateTime.now();
		createdAt = now;
		updatedAt = now;
	}

	@PreUpdate
	void preUpdate() {
		updatedAt = OffsetDateTime.now();
	}

	UUID getId() { return id; }
	void setId(UUID id) { this.id = id; }
	String getName() { return name; }
	void setName(String name) { this.name = name; }
	String getSlug() { return slug; }
	void setSlug(String slug) { this.slug = slug; }
	String getDescription() { return description; }
	void setDescription(String description) { this.description = description; }
	String getIcon() { return icon; }
	void setIcon(String icon) { this.icon = icon; }
	String getImageUrl() { return imageUrl; }
	void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
	CategoryEntity getParent() { return parent; }
	void setParent(CategoryEntity parent) { this.parent = parent; }
	int getLevel() { return level; }
	void setLevel(int level) { this.level = level; }
	String getPath() { return path; }
	void setPath(String path) { this.path = path; }
	boolean isActive() { return isActive; }
	void setActive(boolean active) { isActive = active; }
	int getSortOrder() { return sortOrder; }
	void setSortOrder(int sortOrder) { this.sortOrder = sortOrder; }
	int getProductCount() { return productCount; }
	void setProductCount(int productCount) { this.productCount = productCount; }
	String getMetaTitle() { return metaTitle; }
	void setMetaTitle(String metaTitle) { this.metaTitle = metaTitle; }
	String getMetaDescription() { return metaDescription; }
	void setMetaDescription(String metaDescription) { this.metaDescription = metaDescription; }
	OffsetDateTime getCreatedAt() { return createdAt; }
	OffsetDateTime getUpdatedAt() { return updatedAt; }
}

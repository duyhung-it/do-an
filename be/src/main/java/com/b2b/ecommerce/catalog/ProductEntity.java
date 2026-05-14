package com.b2b.ecommerce.catalog;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "products")
class ProductEntity {
	@Id
	@GeneratedValue
	private UUID id;
	private String name;
	private String slug;
	@Column(columnDefinition = "text")
	private String description = "";
	private String shortDescription = "";
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "category_id")
	private CategoryEntity category;
	private String categoryName;
	private String brand;
	private long price;
	private Long originalPrice;
	private int discountPercent;
	@Enumerated(EnumType.STRING)
	@JdbcTypeCode(SqlTypes.NAMED_ENUM)
	private ProductStatus status = ProductStatus.ACTIVE;
	@Enumerated(EnumType.STRING)
	@JdbcTypeCode(SqlTypes.NAMED_ENUM)
	@Column(name = "condition")
	private ProductCondition condition = ProductCondition.NEW;
	private BigDecimal rating = BigDecimal.ZERO;
	private int reviewCount;
	private int soldCount;
	private int viewCount;
	private int warranty = 12;
	@JdbcTypeCode(SqlTypes.ARRAY)
	private String[] tags = new String[0];
	@JdbcTypeCode(SqlTypes.JSON)
	@Column(columnDefinition = "jsonb")
	private Map<String, String> specifications = new LinkedHashMap<>();
	private String color;
	private boolean isNew;
	private boolean isFeatured;
	private boolean isHot;
	private OffsetDateTime createdAt;
	private OffsetDateTime updatedAt;
	@OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
	private List<ProductVariantEntity> variants = new ArrayList<>();
	@OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
	private List<ProductImageEntity> images = new ArrayList<>();
	@OneToOne(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
	private PhoneSpecsEntity phoneSpecs;

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
	String getName() { return name; }
	void setName(String name) { this.name = name; }
	String getSlug() { return slug; }
	void setSlug(String slug) { this.slug = slug; }
	String getDescription() { return description; }
	void setDescription(String description) { this.description = description; }
	String getShortDescription() { return shortDescription; }
	void setShortDescription(String shortDescription) { this.shortDescription = shortDescription; }
	CategoryEntity getCategory() { return category; }
	void setCategory(CategoryEntity category) { this.category = category; }
	String getCategoryName() { return categoryName; }
	void setCategoryName(String categoryName) { this.categoryName = categoryName; }
	String getBrand() { return brand; }
	void setBrand(String brand) { this.brand = brand; }
	long getPrice() { return price; }
	void setPrice(long price) { this.price = price; }
	Long getOriginalPrice() { return originalPrice; }
	void setOriginalPrice(Long originalPrice) { this.originalPrice = originalPrice; }
	int getDiscountPercent() { return discountPercent; }
	void setDiscountPercent(int discountPercent) { this.discountPercent = discountPercent; }
	ProductStatus getStatus() { return status; }
	void setStatus(ProductStatus status) { this.status = status; }
	ProductCondition getCondition() { return condition; }
	void setCondition(ProductCondition condition) { this.condition = condition; }
	BigDecimal getRating() { return rating; }
	int getReviewCount() { return reviewCount; }
	int getSoldCount() { return soldCount; }
	int getViewCount() { return viewCount; }
	void setViewCount(int viewCount) { this.viewCount = viewCount; }
	int getWarranty() { return warranty; }
	void setWarranty(int warranty) { this.warranty = warranty; }
	String[] getTags() { return tags; }
	void setTags(String[] tags) { this.tags = tags; }
	Map<String, String> getSpecifications() { return specifications; }
	void setSpecifications(Map<String, String> specifications) { this.specifications = specifications; }
	String getColor() { return color; }
	void setColor(String color) { this.color = color; }
	boolean isNew() { return isNew; }
	void setNew(boolean aNew) { isNew = aNew; }
	boolean isFeatured() { return isFeatured; }
	void setFeatured(boolean featured) { isFeatured = featured; }
	boolean isHot() { return isHot; }
	void setHot(boolean hot) { isHot = hot; }
	OffsetDateTime getCreatedAt() { return createdAt; }
	OffsetDateTime getUpdatedAt() { return updatedAt; }
	List<ProductVariantEntity> getVariants() { return variants; }
	List<ProductImageEntity> getImages() { return images; }
	PhoneSpecsEntity getPhoneSpecs() { return phoneSpecs; }
}

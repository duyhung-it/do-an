package com.b2b.ecommerce.catalog;

import java.math.BigDecimal;
import java.text.Normalizer;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.UUID;

import com.b2b.ecommerce.common.AppException;
import com.b2b.ecommerce.common.ErrorCode;
import com.b2b.ecommerce.common.PageRequestParams;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CatalogService {
	private final CategoryRepository categories;
	private final ProductRepository products;
	private final ProductVariantRepository variants;
	private final ProductImageRepository images;

	public CatalogService(
			CategoryRepository categories,
			ProductRepository products,
			ProductVariantRepository variants,
			ProductImageRepository images) {
		this.categories = categories;
		this.products = products;
		this.variants = variants;
		this.images = images;
	}

	@Transactional(readOnly = true)
	public List<CategoryDto> categoryTree(boolean includeInactive) {
		List<CategoryEntity> all = includeInactive ? categories.findAllByOrderBySortOrderAscNameAsc()
				: categories.findByIsActiveTrueOrderBySortOrderAscNameAsc();
		return all.stream()
				.filter(category -> category.getParent() == null)
				.map(category -> categoryDto(category, children(category, all)))
				.toList();
	}

	@Transactional(readOnly = true)
	public CategoryDto category(String id) {
		CategoryEntity category = categoryEntity(id);
		return categoryDto(category, categories.findByParentIdOrderBySortOrderAscNameAsc(category.getId()).stream()
				.map(child -> categoryDto(child, List.of()))
				.toList());
	}

	@Transactional(readOnly = true)
	public CategoryDto categoryBySlug(String slug) {
		CategoryEntity category = categories.findBySlug(slug)
				.orElseThrow(() -> new NoSuchElementException("Khong tim thay danh muc"));
		return category(category.getId().toString());
	}

	@Transactional
	public CategoryDto createCategory(CategoryRequest request) {
		if (request.name() == null || request.name().isBlank()) {
			throw new IllegalArgumentException("Ten danh muc la bat buoc");
		}
		String slug = slug(request.slug(), request.name());
		if (categories.existsBySlug(slug)) {
			throw new IllegalArgumentException("Slug danh muc da ton tai");
		}
		CategoryEntity parent = request.parentId() == null ? null : categoryEntity(request.parentId());
		CategoryEntity category = new CategoryEntity();
		applyCategory(category, request, slug, parent);
		return categoryDto(categories.save(category), List.of());
	}

	@Transactional
	public CategoryDto updateCategory(String id, CategoryRequest request) {
		CategoryEntity category = categoryEntity(id);
		String slug = slug(request.slug(), request.name() == null ? category.getName() : request.name());
		if (categories.existsBySlugAndIdNot(slug, category.getId())) {
			throw new IllegalArgumentException("Slug danh muc da ton tai");
		}
		CategoryEntity parent = request.parentId() == null ? null : categoryEntity(request.parentId());
		if (parent != null && parent.getId().equals(category.getId())) {
			throw new IllegalArgumentException("Danh muc cha khong hop le");
		}
		applyCategory(category, request, slug, parent);
		return categoryDto(categories.save(category), categories.findByParentIdOrderBySortOrderAscNameAsc(category.getId())
				.stream().map(child -> categoryDto(child, List.of())).toList());
	}

	@Transactional
	public void deleteCategory(String id) {
		CategoryEntity category = categoryEntity(id);
		if (category.getProductCount() > 0 || products.existsByCategoryId(category.getId())) {
			throw new IllegalArgumentException("Danh muc con san pham, khong the xoa");
		}
		if (categories.existsByParentId(category.getId())) {
			throw new IllegalArgumentException("Danh muc con danh muc con, khong the xoa");
		}
		categories.delete(category);
	}

	@Transactional(readOnly = true)
	public Page<ProductDto> products(PageRequestParams params, ProductFilter filter) {
		Pageable pageable = PageRequest.of(params.normalizedPage() - 1, params.normalizedPageSize(), sort(params));
		return products.findAll(specification(filter), pageable).map(this::productDto);
	}

	@Transactional
	public ProductDto product(String id) {
		ProductEntity product = productEntity(id);
		product.setViewCount(product.getViewCount() + 1);
		return productDto(products.save(product));
	}

	@Transactional
	public ProductDto productBySlug(String slug) {
		ProductEntity product = products.findBySlug(slug)
				.orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));
		product.setViewCount(product.getViewCount() + 1);
		return productDto(products.save(product));
	}

	@Transactional(readOnly = true)
	public List<ProductDto> similarProducts(String id, int limit) {
		ProductEntity product = productEntity(id);
		Pageable pageable = PageRequest.of(0, Math.max(1, Math.min(limit, 24)), Sort.by(Sort.Direction.DESC, "createdAt"));
		Specification<ProductEntity> spec = (root, query, cb) -> cb.and(
				cb.notEqual(root.get("id"), product.getId()),
				cb.equal(root.get("status"), ProductStatus.ACTIVE),
				cb.or(
						cb.equal(root.get("category").get("id"), product.getCategory().getId()),
						cb.equal(root.get("brand"), product.getBrand())));
		return products.findAll(spec, pageable).stream().map(this::productDto).toList();
	}

	@Transactional(readOnly = true)
	public List<ProductDto> accessories(String id, int limit) {
		productEntity(id);
		Pageable pageable = PageRequest.of(0, Math.max(1, Math.min(limit, 24)), Sort.by(Sort.Direction.DESC, "createdAt"));
		Specification<ProductEntity> spec = (root, query, cb) -> cb.and(
				cb.equal(root.get("status"), ProductStatus.ACTIVE),
				cb.like(cb.lower(root.get("categoryName")), "%phu kien%"));
		return products.findAll(spec, pageable).stream().map(this::productDto).toList();
	}

	@Transactional(readOnly = true)
	public List<ProductDto> featured(int limit) {
		return products.findByIsFeaturedTrueAndStatusOrderByCreatedAtDesc(ProductStatus.ACTIVE, limit(limit)).stream()
				.map(this::productDto).toList();
	}

	@Transactional(readOnly = true)
	public List<ProductDto> hot(int limit) {
		return products.findByIsHotTrueAndStatusOrderByCreatedAtDesc(ProductStatus.ACTIVE, limit(limit)).stream()
				.map(this::productDto).toList();
	}

	@Transactional(readOnly = true)
	public List<ProductDto> newest(int limit) {
		List<ProductEntity> byFlag = products.findByIsNewTrueAndStatusOrderByCreatedAtDesc(ProductStatus.ACTIVE, limit(limit));
		List<ProductEntity> result = byFlag.isEmpty()
				? products.findByStatusOrderByCreatedAtDesc(ProductStatus.ACTIVE, limit(limit))
				: byFlag;
		return result.stream().map(this::productDto).toList();
	}

	@Transactional(readOnly = true)
	public List<String> brands() {
		return products.findActiveBrands();
	}

	@Transactional
	public ProductDto createProduct(ProductRequest request) {
		if (request.name() == null || request.name().isBlank()
				|| request.categoryId() == null || request.categoryId().isBlank()
				|| request.brand() == null || request.brand().isBlank()
				|| request.price() == null) {
			throw new IllegalArgumentException("name, categoryId, brand va price la bat buoc");
		}
		String slug = slug(request.slug(), request.name());
		if (products.existsBySlug(slug)) {
			throw new IllegalArgumentException("Slug san pham da ton tai");
		}
		CategoryEntity category = categoryEntity(request.categoryId());
		if (!category.isActive()) {
			throw new IllegalArgumentException("Danh muc khong active");
		}
		ProductEntity product = new ProductEntity();
		applyProduct(product, request, slug, category);
		category.setProductCount(category.getProductCount() + 1);
		categories.save(category);
		return productDto(products.save(product));
	}

	@Transactional
	public ProductDto updateProduct(String id, ProductRequest request) {
		ProductEntity product = productEntity(id);
		String slug = slug(request.slug(), request.name() == null ? product.getName() : request.name());
		if (products.existsBySlugAndIdNot(slug, product.getId())) {
			throw new IllegalArgumentException("Slug san pham da ton tai");
		}
		CategoryEntity category = request.categoryId() == null ? product.getCategory() : categoryEntity(request.categoryId());
		applyProduct(product, request, slug, category);
		return productDto(products.save(product));
	}

	@Transactional
	public void deleteProduct(String id) {
		ProductEntity product = productEntity(id);
		product.setStatus(ProductStatus.DISCONTINUED);
		products.save(product);
	}

	@Transactional(readOnly = true)
	public List<ProductVariantDto> productVariants(String productId) {
		productEntity(productId);
		return variants.findByProductIdOrderByCreatedAtAsc(UUID.fromString(productId)).stream().map(this::variantDto).toList();
	}

	@Transactional
	public ProductVariantDto createVariant(String productId, ProductVariantRequest request) {
		ProductEntity product = productEntity(productId);
		if (variants.existsBySku(request.sku())) {
			throw new IllegalArgumentException("SKU da ton tai");
		}
		ProductVariantEntity variant = new ProductVariantEntity();
		variant.setProduct(product);
		applyVariant(variant, request);
		return variantDto(variants.save(variant));
	}

	@Transactional
	public ProductVariantDto updateVariant(String productId, String id, ProductVariantRequest request) {
		ProductVariantEntity variant = variants.findByIdAndProductId(UUID.fromString(id), UUID.fromString(productId))
				.orElseThrow(() -> new AppException(ErrorCode.PRODUCT_VARIANT_NOT_FOUND));
		if (variants.existsBySkuAndIdNot(request.sku(), variant.getId())) {
			throw new IllegalArgumentException("SKU da ton tai");
		}
		applyVariant(variant, request);
		return variantDto(variants.save(variant));
	}

	@Transactional
	public void deleteVariant(String productId, String id) {
		ProductVariantEntity variant = variants.findByIdAndProductId(UUID.fromString(id), UUID.fromString(productId))
				.orElseThrow(() -> new AppException(ErrorCode.PRODUCT_VARIANT_NOT_FOUND));
		variants.delete(variant);
	}

	@Transactional(readOnly = true)
	public List<ProductImageDto> productImages(String productId) {
		productEntity(productId);
		return images.findByProductIdOrderBySortOrderAsc(UUID.fromString(productId)).stream().map(this::imageDto).toList();
	}

	@Transactional
	public ProductImageDto createImage(String productId, ProductImageRequest request) {
		ProductEntity product = productEntity(productId);
		ProductImageEntity image = new ProductImageEntity();
		image.setProduct(product);
		applyImage(image, request);
		return imageDto(images.save(image));
	}

	@Transactional
	public ProductImageDto updateImage(String productId, String id, ProductImageRequest request) {
		ProductImageEntity image = images.findByIdAndProductId(UUID.fromString(id), UUID.fromString(productId))
				.orElseThrow(() -> new NoSuchElementException("Khong tim thay anh san pham"));
		applyImage(image, request);
		return imageDto(images.save(image));
	}

	@Transactional
	public void deleteImage(String productId, String id) {
		ProductImageEntity image = images.findByIdAndProductId(UUID.fromString(id), UUID.fromString(productId))
				.orElseThrow(() -> new NoSuchElementException("Khong tim thay anh san pham"));
		images.delete(image);
	}

	private void applyCategory(CategoryEntity category, CategoryRequest request, String slug, CategoryEntity parent) {
		category.setName(value(request.name(), category.getName()));
		category.setSlug(slug);
		category.setDescription(value(request.description(), category.getDescription()));
		category.setIcon(value(request.icon(), category.getIcon()));
		category.setImageUrl(value(request.imageUrl(), category.getImageUrl()));
		category.setParent(parent);
		category.setLevel(parent == null ? 0 : parent.getLevel() + 1);
		category.setPath((parent == null ? "" : parent.getPath()) + "/" + slug);
		category.setActive(request.isActive() == null || request.isActive());
		category.setSortOrder(request.sortOrder() == null ? category.getSortOrder() : request.sortOrder());
		category.setMetaTitle(value(request.metaTitle(), category.getMetaTitle()));
		category.setMetaDescription(value(request.metaDescription(), category.getMetaDescription()));
	}

	private void applyProduct(ProductEntity product, ProductRequest request, String slug, CategoryEntity category) {
		BigDecimal originalPrice = request.originalPrice();
		BigDecimal price = request.price();
		BigDecimal effectivePrice = price == null ? BigDecimal.valueOf(product.getPrice()) : price;
		if (originalPrice != null && originalPrice.compareTo(effectivePrice) < 0) {
			throw new IllegalArgumentException("Gia goc phai lon hon hoac bang gia ban");
		}
		product.setName(value(request.name(), product.getName()));
		product.setSlug(slug);
		product.setDescription(value(request.description(), product.getDescription()));
		product.setShortDescription(value(request.shortDescription(), product.getShortDescription()));
		product.setCategory(category);
		product.setCategoryName(category.getName());
		product.setBrand(value(request.brand(), product.getBrand()));
		if (price != null) {
			product.setPrice(price.longValueExact());
		}
		product.setOriginalPrice(originalPrice == null ? product.getOriginalPrice() : originalPrice.longValueExact());
		product.setDiscountPercent(discount(product.getPrice(), product.getOriginalPrice()));
		product.setStatus(parseEnum(ProductStatus.class, request.status(), value(product.getStatus(), ProductStatus.ACTIVE)));
		product.setCondition(parseEnum(ProductCondition.class, request.condition(), value(product.getCondition(), ProductCondition.NEW)));
		product.setWarranty(request.warranty() == null ? product.getWarranty() : request.warranty());
		product.setTags(request.tags() == null ? product.getTags() : request.tags().toArray(String[]::new));
		product.setSpecifications(request.specifications() == null ? product.getSpecifications() : request.specifications());
		product.setColor(value(request.color(), product.getColor()));
		product.setNew(request.isNew() == null ? product.isNew() : request.isNew());
		product.setFeatured(request.isFeatured() == null ? product.isFeatured() : request.isFeatured());
		product.setHot(request.isHot() == null ? product.isHot() : request.isHot());
	}

	private void applyVariant(ProductVariantEntity variant, ProductVariantRequest request) {
		if (request.originalPrice() != null && request.originalPrice().compareTo(request.price()) < 0) {
			throw new IllegalArgumentException("Gia goc phai lon hon hoac bang gia ban");
		}
		variant.setName(request.name());
		variant.setSku(request.sku());
		variant.setPrice(request.price().longValueExact());
		variant.setOriginalPrice(request.originalPrice() == null ? null : request.originalPrice().longValueExact());
		variant.setStock(request.stock() == null ? 0 : request.stock());
		variant.setColor(request.color());
		variant.setStorage(request.storage());
		variant.setRam(request.ram());
		variant.setActive(request.isActive() == null || request.isActive());
	}

	private void applyImage(ProductImageEntity image, ProductImageRequest request) {
		if (Boolean.TRUE.equals(request.isPrimary())) {
			images.findByProductIdAndIsPrimaryTrue(image.getProduct().getId()).ifPresent(existing -> {
				if (!existing.getId().equals(image.getId())) {
					existing.setPrimary(false);
					images.save(existing);
				}
			});
		}
		image.setUrl(request.url());
		image.setAltText(request.altText());
		image.setSortOrder(request.sortOrder() == null ? image.getSortOrder() : request.sortOrder());
		image.setPrimary(Boolean.TRUE.equals(request.isPrimary()));
	}

	private Specification<ProductEntity> specification(ProductFilter filter) {
		return (root, query, cb) -> {
			List<jakarta.persistence.criteria.Predicate> predicates = new java.util.ArrayList<>();
			predicates.add(cb.equal(root.get("status"), filter.status() == null ? ProductStatus.ACTIVE : filter.status()));
			if (filter.search() != null && !filter.search().isBlank()) {
				String value = "%" + filter.search().toLowerCase(Locale.ROOT) + "%";
				predicates.add(cb.or(cb.like(cb.lower(root.get("name")), value), cb.like(cb.lower(root.get("brand")), value)));
			}
			if (filter.categoryId() != null) {
				predicates.add(cb.equal(root.get("category").get("id"), filter.categoryId()));
			}
			if (filter.categorySlug() != null) {
				predicates.add(cb.equal(root.get("category").get("slug"), filter.categorySlug()));
			}
			if (filter.brand() != null && !filter.brand().isBlank()) {
				predicates.add(root.get("brand").in(Arrays.stream(filter.brand().split(",")).map(String::trim).toList()));
			}
			if (filter.condition() != null) {
				predicates.add(cb.equal(root.get("condition"), filter.condition()));
			}
			if (filter.minPrice() != null) {
				predicates.add(cb.greaterThanOrEqualTo(root.get("price"), filter.minPrice().longValue()));
			}
			if (filter.maxPrice() != null) {
				predicates.add(cb.lessThanOrEqualTo(root.get("price"), filter.maxPrice().longValue()));
			}
			if (filter.color() != null) {
				predicates.add(cb.equal(root.get("color"), filter.color()));
			}
			if (filter.isFeatured() != null) {
				predicates.add(cb.equal(root.get("isFeatured"), filter.isFeatured()));
			}
			if (filter.isNew() != null) {
				predicates.add(cb.equal(root.get("isNew"), filter.isNew()));
			}
			if (filter.isHot() != null) {
				predicates.add(cb.equal(root.get("isHot"), filter.isHot()));
			}
			return cb.and(predicates.toArray(jakarta.persistence.criteria.Predicate[]::new));
		};
	}

	private Sort sort(PageRequestParams params) {
		String field = switch (value(params.sortField(), "createdAt")) {
			case "price" -> "price";
			case "rating" -> "rating";
			case "soldCount" -> "soldCount";
			default -> "createdAt";
		};
		return Sort.by(params.ascending() ? Sort.Direction.ASC : Sort.Direction.DESC, field);
	}

	private Pageable limit(int limit) {
		return PageRequest.of(0, Math.max(1, Math.min(limit, 100)));
	}

	private CategoryEntity categoryEntity(String id) {
		return categories.findById(UUID.fromString(id))
				.orElseThrow(() -> new NoSuchElementException("Khong tim thay danh muc"));
	}

	private ProductEntity productEntity(String id) {
		return products.findById(UUID.fromString(id))
				.orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));
	}

	private List<CategoryDto> children(CategoryEntity parent, List<CategoryEntity> all) {
		return all.stream()
				.filter(category -> category.getParent() != null && category.getParent().getId().equals(parent.getId()))
				.map(category -> categoryDto(category, children(category, all)))
				.toList();
	}

	private CategoryDto categoryDto(CategoryEntity category, List<CategoryDto> children) {
		return new CategoryDto(category.getId().toString(), category.getName(), category.getSlug(),
				category.getDescription(), category.getIcon(), category.getImageUrl(),
				category.getParent() == null ? null : category.getParent().getId().toString(), category.getLevel(),
				category.getPath(), category.isActive(), category.getSortOrder(), category.getProductCount(),
				category.getMetaTitle(), category.getMetaDescription(), children, iso(category.getCreatedAt()),
				iso(category.getUpdatedAt()));
	}

	private ProductDto productDto(ProductEntity product) {
		CategoryEntity category = product.getCategory();
		return new ProductDto(product.getId().toString(), product.getName(), product.getSlug(), product.getDescription(),
				product.getShortDescription(), category.getId().toString(),
				new ProductDto.CategorySummary(category.getId().toString(), category.getName(), category.getSlug()),
				product.getBrand(), BigDecimal.valueOf(product.getPrice()),
				product.getOriginalPrice() == null ? null : BigDecimal.valueOf(product.getOriginalPrice()),
				product.getDiscountPercent(), product.getStatus().name(), product.getCondition().name(), product.getWarranty(),
				Arrays.asList(product.getTags()), product.getSpecifications(), product.getColor(), product.getViewCount(),
				product.getSoldCount(), product.getRating(), product.getReviewCount(), product.isNew(), product.isFeatured(),
				product.isHot(), product.getVariants().stream().map(this::variantDto).toList(),
				product.getImages().stream().sorted(java.util.Comparator.comparingInt(ProductImageEntity::getSortOrder))
						.map(this::imageDto).toList(),
				phoneSpecsDto(product.getPhoneSpecs()), iso(product.getCreatedAt()), iso(product.getUpdatedAt()));
	}

	private ProductVariantDto variantDto(ProductVariantEntity variant) {
		return new ProductVariantDto(variant.getId().toString(), variant.getProduct().getId().toString(), variant.getName(),
				variant.getSku(), BigDecimal.valueOf(variant.getPrice()),
				variant.getOriginalPrice() == null ? null : BigDecimal.valueOf(variant.getOriginalPrice()), variant.getStock(),
				variant.getColor(), variant.getStorage(), variant.getRam(), variant.isActive(), iso(variant.getCreatedAt()),
				iso(variant.getUpdatedAt()));
	}

	private ProductImageDto imageDto(ProductImageEntity image) {
		return new ProductImageDto(image.getId().toString(), image.getProduct().getId().toString(), image.getUrl(),
				image.getAltText(), image.getSortOrder(), image.isPrimary(), iso(image.getCreatedAt()));
	}

	private PhoneSpecsDto phoneSpecsDto(PhoneSpecsEntity specs) {
		if (specs == null) {
			return null;
		}
		return new PhoneSpecsDto(specs.getId().toString(), specs.getProduct().getId().toString(), specs.getChip(),
				specs.getRam(), specs.getStorage(), specs.getBattery(), specs.getCamera(), specs.getFrontCamera(),
				specs.getScreen(), specs.getOs(), specs.getConnectivity(), specs.getWeight(), specs.getDimensions(),
				specs.getWaterResistance(), specs.getSimType(), specs.getChargingSpeed(), specs.getGpu());
	}

	private int discount(long price, Long originalPrice) {
		if (originalPrice == null || originalPrice <= 0 || originalPrice < price) {
			return 0;
		}
		return (int) Math.round((originalPrice - price) * 100.0 / originalPrice);
	}

	private String slug(String requested, String source) {
		return requested == null || requested.isBlank() ? slugify(source) : requested.trim();
	}

	private String slugify(String value) {
		return Normalizer.normalize(value == null ? "" : value, Normalizer.Form.NFD)
				.replaceAll("\\p{M}", "")
				.toLowerCase(Locale.ROOT)
				.replaceAll("[^a-z0-9]+", "-")
				.replaceAll("(^-|-$)", "");
	}

	private <T extends Enum<T>> T parseEnum(Class<T> type, String value, T defaultValue) {
		return value == null || value.isBlank() ? defaultValue : Enum.valueOf(type, value.trim().toUpperCase(Locale.ROOT));
	}

	private <T> T value(T value, T defaultValue) {
		return value == null ? defaultValue : value;
	}

	private String iso(java.time.OffsetDateTime value) {
		return value == null ? null : DateTimeFormatter.ISO_OFFSET_DATE_TIME.format(value);
	}

	public record ProductFilter(
			String search,
			UUID categoryId,
			String categorySlug,
			String brand,
			ProductStatus status,
			ProductCondition condition,
			BigDecimal minPrice,
			BigDecimal maxPrice,
			String color,
			Boolean isFeatured,
			Boolean isNew,
			Boolean isHot
	) {
	}
}

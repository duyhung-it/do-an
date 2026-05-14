package com.b2b.ecommerce.catalog;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

interface ProductRepository extends JpaRepository<ProductEntity, UUID>, JpaSpecificationExecutor<ProductEntity> {
	Optional<ProductEntity> findBySlug(String slug);
	boolean existsBySlug(String slug);
	boolean existsBySlugAndIdNot(String slug, UUID id);
	boolean existsByCategoryId(UUID categoryId);

	@Query("select distinct p.brand from ProductEntity p where p.status = 'ACTIVE' order by p.brand")
	List<String> findActiveBrands();

	List<ProductEntity> findByIsFeaturedTrueAndStatusOrderByCreatedAtDesc(ProductStatus status, Pageable pageable);
	List<ProductEntity> findByIsHotTrueAndStatusOrderByCreatedAtDesc(ProductStatus status, Pageable pageable);
	List<ProductEntity> findByIsNewTrueAndStatusOrderByCreatedAtDesc(ProductStatus status, Pageable pageable);
	List<ProductEntity> findByStatusOrderByCreatedAtDesc(ProductStatus status, Pageable pageable);
}

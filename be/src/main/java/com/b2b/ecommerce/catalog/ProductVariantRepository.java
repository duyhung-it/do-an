package com.b2b.ecommerce.catalog;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

interface ProductVariantRepository extends JpaRepository<ProductVariantEntity, UUID> {
	List<ProductVariantEntity> findByProductIdOrderByCreatedAtAsc(UUID productId);
	Optional<ProductVariantEntity> findByIdAndProductId(UUID id, UUID productId);
	boolean existsBySku(String sku);
	boolean existsBySkuAndIdNot(String sku, UUID id);
}

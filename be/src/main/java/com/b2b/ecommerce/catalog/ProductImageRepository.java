package com.b2b.ecommerce.catalog;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

interface ProductImageRepository extends JpaRepository<ProductImageEntity, UUID> {
	List<ProductImageEntity> findByProductIdOrderBySortOrderAsc(UUID productId);
	Optional<ProductImageEntity> findByIdAndProductId(UUID id, UUID productId);
	Optional<ProductImageEntity> findByProductIdAndIsPrimaryTrue(UUID productId);
}

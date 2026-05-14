package com.b2b.ecommerce.cart;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

interface CartRepository extends JpaRepository<CartItemEntity, UUID> {
	List<CartItemEntity> findByUserIdOrderByAddedAtAsc(UUID userId);
	Optional<CartItemEntity> findByIdAndUserId(UUID id, UUID userId);
	Optional<CartItemEntity> findByUserIdAndProductIdAndVariantId(UUID userId, UUID productId, UUID variantId);
	long countByUserId(UUID userId);
	void deleteByUserId(UUID userId);
}

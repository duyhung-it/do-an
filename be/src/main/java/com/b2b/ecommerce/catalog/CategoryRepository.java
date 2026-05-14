package com.b2b.ecommerce.catalog;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

interface CategoryRepository extends JpaRepository<CategoryEntity, UUID> {
	List<CategoryEntity> findByIsActiveTrueOrderBySortOrderAscNameAsc();
	List<CategoryEntity> findAllByOrderBySortOrderAscNameAsc();
	List<CategoryEntity> findByParentIdOrderBySortOrderAscNameAsc(UUID parentId);
	Optional<CategoryEntity> findBySlug(String slug);
	boolean existsBySlug(String slug);
	boolean existsBySlugAndIdNot(String slug, UUID id);
	boolean existsByParentId(UUID parentId);
}

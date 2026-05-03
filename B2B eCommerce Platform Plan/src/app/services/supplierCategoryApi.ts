// ============================================================
// Service: Supplier-Category N-N API (DB-B.14)
// Quản lý liên kết nhà cung cấp — danh mục
// ============================================================

import type { SupplierCategory } from '../types';
import { mockSuppliers } from '../data/mockData';

const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

// Mock N-N data — khởi tạo từ mockSuppliers.categoryIds
let mockSupplierCategories: SupplierCategory[] = mockSuppliers.flatMap(s =>
  s.categoryIds.map((catId, idx) => ({
    id: `sc-${s.id}-${idx}`,
    supplierId: s.id,
    categoryId: catId,
  }))
);

export const supplierCategoryApi = {
  /** Lấy danh sách category IDs theo supplier */
  async getBySupplier(supplierId: string): Promise<SupplierCategory[]> {
    await delay(80);
    return mockSupplierCategories.filter(sc => sc.supplierId === supplierId);
  },

  /** Lấy danh sách supplier IDs theo category */
  async getByCategory(categoryId: string): Promise<SupplierCategory[]> {
    await delay(80);
    return mockSupplierCategories.filter(sc => sc.categoryId === categoryId);
  },

  /** Thêm liên kết NCC — danh mục */
  async add(supplierId: string, categoryId: string): Promise<SupplierCategory> {
    await delay(100);
    const existing = mockSupplierCategories.find(
      sc => sc.supplierId === supplierId && sc.categoryId === categoryId
    );
    if (existing) return existing;
    const newItem: SupplierCategory = {
      id: `sc-${Date.now()}`,
      supplierId,
      categoryId,
    };
    mockSupplierCategories.push(newItem);
    // Đồng bộ denormalized field
    const sup = mockSuppliers.find(s => s.id === supplierId);
    if (sup && !sup.categoryIds.includes(categoryId)) {
      sup.categoryIds.push(categoryId);
    }
    return newItem;
  },

  /** Xoá liên kết NCC — danh mục */
  async remove(supplierId: string, categoryId: string): Promise<void> {
    await delay(100);
    mockSupplierCategories = mockSupplierCategories.filter(
      sc => !(sc.supplierId === supplierId && sc.categoryId === categoryId)
    );
    // Đồng bộ denormalized field
    const sup = mockSuppliers.find(s => s.id === supplierId);
    if (sup) {
      sup.categoryIds = sup.categoryIds.filter(id => id !== categoryId);
    }
  },
};

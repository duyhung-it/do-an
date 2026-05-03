// ============================================================
// Service: Product Image API (DB-B.08/B.12)
// Quản lý ảnh sản phẩm — CRUD riêng cho bảng product_images
// ============================================================

import type { ProductImage } from '../types';

const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

// Mock product images
let mockProductImages: ProductImage[] = Array.from({ length: 36 }, (_, i) => ({
  id: `pimg-${i + 1}`,
  productId: `prod-${String(Math.floor(i / 2) + 1).padStart(3, '0')}`,
  url: '', // Sẽ được resolve từ product.images khi cần
  altText: `Ảnh sản phẩm ${Math.floor(i / 2) + 1} - ${i % 2 === 0 ? 'chính' : 'phụ'}`,
  sortOrder: i % 2,
  isPrimary: i % 2 === 0,
}));

export const productImageApi = {
  /** Lấy danh sách ảnh theo productId */
  async getByProduct(productId: string): Promise<ProductImage[]> {
    await delay(100);
    return mockProductImages
      .filter(img => img.productId === productId)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  },

  /** Thêm ảnh mới */
  async create(data: Omit<ProductImage, 'id'>): Promise<ProductImage> {
    await delay(150);
    const newImg: ProductImage = { ...data, id: `pimg-${Date.now()}` };
    mockProductImages.push(newImg);
    return newImg;
  },

  /** Cập nhật ảnh (altText, sortOrder, isPrimary) */
  async update(id: string, data: Partial<ProductImage>): Promise<ProductImage> {
    await delay(100);
    const idx = mockProductImages.findIndex(img => img.id === id);
    if (idx === -1) throw new Error('Không tìm thấy ảnh');
    // Nếu set isPrimary = true, bỏ primary của ảnh khác cùng SP
    if (data.isPrimary) {
      const productId = mockProductImages[idx].productId;
      mockProductImages.forEach(img => {
        if (img.productId === productId) img.isPrimary = false;
      });
    }
    mockProductImages[idx] = { ...mockProductImages[idx], ...data };
    return mockProductImages[idx];
  },

  /** Xoá ảnh */
  async delete(id: string): Promise<void> {
    await delay(100);
    mockProductImages = mockProductImages.filter(img => img.id !== id);
  },

  /** Sắp xếp lại thứ tự ảnh */
  async reorder(productId: string, imageIds: string[]): Promise<void> {
    await delay(100);
    imageIds.forEach((imgId, order) => {
      const img = mockProductImages.find(i => i.id === imgId && i.productId === productId);
      if (img) img.sortOrder = order;
    });
  },
};

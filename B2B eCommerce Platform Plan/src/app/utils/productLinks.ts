import type { Product } from '../types';

type ProductLinkSource = Pick<Product, 'id'> & Partial<Pick<Product, 'slug'>>;

export function productDetailPath(product: ProductLinkSource) {
  return `/products/${encodeURIComponent(product.slug?.trim() || product.id)}`;
}

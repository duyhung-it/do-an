// ============================================================
// API Cache — Local storage cache với TTL (Nhóm 22C.01)
// Lưu kết quả API vào localStorage, TTL mặc định 5 phút
// ============================================================

const DEFAULT_TTL = 5 * 60 * 1000; // 5 phút

interface CacheEntry<T> {
  data: T;
  expiry: number;
}

/**
 * Lưu dữ liệu vào cache
 */
export function setCache<T>(key: string, data: T, ttl = DEFAULT_TTL): void {
  try {
    const entry: CacheEntry<T> = {
      data,
      expiry: Date.now() + ttl,
    };
    localStorage.setItem(`api_cache_${key}`, JSON.stringify(entry));
  } catch {
    // localStorage full — ignore
  }
}

/**
 * Đọc dữ liệu từ cache (trả null nếu hết hạn hoặc không có)
 */
export function getCache<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(`api_cache_${key}`);
    if (!raw) return null;
    const entry: CacheEntry<T> = JSON.parse(raw);
    if (Date.now() > entry.expiry) {
      localStorage.removeItem(`api_cache_${key}`);
      return null;
    }
    return entry.data;
  } catch {
    return null;
  }
}

/**
 * Xoá 1 key cache
 */
export function clearCache(key: string): void {
  localStorage.removeItem(`api_cache_${key}`);
}

/**
 * Xoá tất cả API cache
 */
export function clearAllCache(): void {
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k?.startsWith('api_cache_')) keysToRemove.push(k);
  }
  keysToRemove.forEach(k => localStorage.removeItem(k));
}

/**
 * Wrapper: gọi API với cache
 * @example const products = await cachedFetch('products_page1', () => productApi.getPaginated(...));
 */
export async function cachedFetch<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl = DEFAULT_TTL,
): Promise<T> {
  const cached = getCache<T>(key);
  if (cached !== null) return cached;
  const data = await fetcher();
  setCache(key, data, ttl);
  return data;
}

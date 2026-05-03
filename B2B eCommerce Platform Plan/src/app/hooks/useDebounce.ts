// ============================================================
// useDebounce — Hook debounce giá trị (Nhóm 22B.04)
// Dùng cho search input, filter, etc.
// ============================================================

import { useState, useEffect } from 'react';

/**
 * Debounce một giá trị với delay (mặc định 300ms).
 * @example const debouncedSearch = useDebounce(searchTerm, 300);
 */
export function useDebounce<T>(value: T, delay = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

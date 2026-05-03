// ============================================================
// withRetry — Retry logic cho API calls (Nhóm 22C.04)
// 3 lần retry, exponential backoff (200ms, 400ms, 800ms)
// ============================================================

/**
 * Tự động thử lại API call thất bại.
 * @param fn Hàm async cần retry
 * @param maxRetries Số lần thử tối đa (mặc định 3)
 * @param baseDelay Delay cơ sở (ms), mặc định 200
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 200,
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt < maxRetries) {
        const delay = baseDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}

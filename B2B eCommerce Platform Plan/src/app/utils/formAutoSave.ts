// ============================================================
// Form Auto-Save — Lưu form data vào localStorage (Nhóm 22C.02)
// ============================================================

const PREFIX = 'form_autosave_';

/**
 * Lưu dữ liệu form vào localStorage
 */
export function saveFormDraft<T>(formKey: string, data: T): void {
  try {
    localStorage.setItem(`${PREFIX}${formKey}`, JSON.stringify(data));
  } catch {
    // ignore
  }
}

/**
 * Đọc dữ liệu form đã lưu
 */
export function getFormDraft<T>(formKey: string): T | null {
  try {
    const raw = localStorage.getItem(`${PREFIX}${formKey}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Xoá draft form
 */
export function clearFormDraft(formKey: string): void {
  localStorage.removeItem(`${PREFIX}${formKey}`);
}

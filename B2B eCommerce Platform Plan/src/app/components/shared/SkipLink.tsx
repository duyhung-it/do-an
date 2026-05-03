// ============================================================
// Skip Link — "Chuyển đến nội dung chính" cho screen reader (Nhóm 22D.05)
// ============================================================

export function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[200] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:shadow-lg focus:outline-none"
    >
      Chuyển đến nội dung chính
    </a>
  );
}

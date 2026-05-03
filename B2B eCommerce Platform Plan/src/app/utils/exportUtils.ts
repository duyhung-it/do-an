// ============================================================
// Tiện ích xuất dữ liệu CSV — dùng chung toàn hệ thống
// ============================================================

export interface ExportColumn {
  key: string;
  label: string;
  formatter?: (value: unknown) => string;
}

/** Xuất CSV với UTF-8 BOM hỗ trợ tiếng Việt */
export function exportToCSV<T extends Record<string, unknown>>(
  data: T[],
  columns: ExportColumn[],
  filename: string,
): void {
  const bom = '\uFEFF';
  const header = columns.map(c => `"${c.label}"`).join(',');
  const rows = data.map(row =>
    columns.map(c => {
      const val = row[c.key];
      const formatted = c.formatter ? c.formatter(val) : String(val ?? '');
      return `"${formatted.replace(/"/g, '""')}"`;
    }).join(','),
  );
  const csv = bom + [header, ...rows].join('\n');
  downloadBlob(csv, filename);
}

/** Xuất CSV với lọc theo khoảng ngày */
export function exportWithDateRange<T extends Record<string, unknown>>(
  data: T[],
  columns: ExportColumn[],
  filename: string,
  dateRange: [string, string],
  dateField: string = 'createdAt',
): void {
  const [from, to] = dateRange;
  const filtered = data.filter(row => {
    const d = String(row[dateField] ?? '');
    return d >= from && d <= to;
  });
  exportToCSV(filtered, columns, filename);
}

/** Tạo nội dung CSV template mẫu */
export function downloadTemplate(headers: string[], filename: string, sampleRows?: string[][]): void {
  const bom = '\uFEFF';
  const lines = [headers.join(',')];
  if (sampleRows) {
    for (const row of sampleRows) {
      lines.push(row.map(v => `"${v}"`).join(','));
    }
  }
  downloadBlob(bom + lines.join('\n'), filename);
}

function downloadBlob(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

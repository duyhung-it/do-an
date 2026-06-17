const VI_TIME_ZONE = 'Asia/Ho_Chi_Minh';

function parseDate(value?: string | null): Date | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatVietnamDateTime(value?: string | null): string {
  const date = parseDate(value);
  if (!date) return value ?? '';
  return new Intl.DateTimeFormat('vi-VN', {
    timeZone: VI_TIME_ZONE,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function compareDateTimeDesc(left?: string | null, right?: string | null): number {
  const leftTime = parseDate(left)?.getTime() ?? 0;
  const rightTime = parseDate(right)?.getTime() ?? 0;
  return rightTime - leftTime;
}


// ============================================================
// AnimatedNumber — Số đếm lên khi mount (count-up animation)
// A4.05: Dùng cho dashboard stats
// ============================================================

import { useState, useEffect, useRef } from 'react';

interface AnimatedNumberProps {
  value: number;
  duration?: number;
  format?: (n: number) => string;
  className?: string;
}

export function AnimatedNumber({
  value,
  duration = 800,
  format,
  className = '',
}: AnimatedNumberProps) {
  // Guard: treat undefined/null/NaN as 0
  const safeValue = typeof value === 'number' && isFinite(value) ? value : 0;
  const [display, setDisplay] = useState(safeValue);
  const rafRef = useRef<number>();
  const startRef = useRef<number>();
  const prevRef = useRef(0);

  useEffect(() => {
    const from = prevRef.current;
    const to = safeValue;
    prevRef.current = to;

    if (from === to) {
      setDisplay(to);
      return;
    }

    const step = (timestamp: number) => {
      if (!startRef.current) startRef.current = timestamp;
      const elapsed = timestamp - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutQuart
      const eased = 1 - Math.pow(1 - progress, 4);
      const current = from + (to - from) * eased;
      setDisplay(Math.round(current));

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        setDisplay(to);
      }
    };

    startRef.current = undefined;
    rafRef.current = requestAnimationFrame(step);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [safeValue, duration]);

  return <span className={className}>{format ? format(display) : display.toLocaleString('vi-VN')}</span>;
}

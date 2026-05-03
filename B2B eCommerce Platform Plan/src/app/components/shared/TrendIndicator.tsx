// ============================================================
// TrendIndicator — Mũi tên lên/xuống + % thay đổi
// A4.06: Dùng cho dashboard stats cards
// ============================================================

import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface TrendIndicatorProps {
  value: number; // phần trăm thay đổi, VD: 12.5 = +12.5%, -5 = -5%
  label?: string;
  className?: string;
  size?: 'sm' | 'md';
}

export function TrendIndicator({ value, label, className = '', size = 'sm' }: TrendIndicatorProps) {
  const isPositive = value > 0;
  const isNegative = value < 0;
  const isNeutral = value === 0;

  const iconSize = size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4';
  const textSize = size === 'sm' ? 'text-xs' : 'text-sm';

  const color = isPositive
    ? 'text-emerald-600 dark:text-emerald-400'
    : isNegative
    ? 'text-red-600 dark:text-red-400'
    : 'text-slate-500';

  const bg = isPositive
    ? 'bg-emerald-50 dark:bg-emerald-900/20'
    : isNegative
    ? 'bg-red-50 dark:bg-red-900/20'
    : 'bg-slate-50 dark:bg-slate-800';

  const Icon = isPositive ? TrendingUp : isNegative ? TrendingDown : Minus;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 ${textSize} ${color} ${bg} ${className}`}
    >
      <Icon className={iconSize} />
      <span>{isPositive ? '+' : ''}{value.toFixed(1)}%</span>
      {label && <span className="text-muted-foreground ml-0.5">{label}</span>}
    </span>
  );
}

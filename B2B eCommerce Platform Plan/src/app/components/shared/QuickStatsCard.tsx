// ============================================================
// QuickStatsCard — StatsCard đơn giản cho Admin pages mới
// Nhận icon dưới dạng ReactNode và value dưới dạng string | number
// Không phụ thuộc IconWrapper/AnimatedNumber
// ============================================================

import type { ReactNode } from 'react';
import { Card, CardContent } from '../ui/card';

type CardColor = 'default' | 'success' | 'warning' | 'danger' | 'info';

interface QuickStatsCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  color?: CardColor;
}

const borderMap: Record<CardColor, string> = {
  default: 'border-l-primary',
  success: 'border-l-emerald-500',
  warning: 'border-l-amber-500',
  danger: 'border-l-red-500',
  info: 'border-l-sky-500',
};

const iconBgMap: Record<CardColor, string> = {
  default: 'bg-primary/10',
  success: 'bg-emerald-100 dark:bg-emerald-900/30',
  warning: 'bg-amber-100 dark:bg-amber-900/30',
  danger: 'bg-red-100 dark:bg-red-900/30',
  info: 'bg-sky-100 dark:bg-sky-900/30',
};

export function QuickStatsCard({ title, value, icon, color = 'default' }: QuickStatsCardProps) {
  return (
    <Card className={`border-l-4 ${borderMap[color]} hover:-translate-y-0.5 hover:shadow-md transition-all duration-200`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground mb-1 truncate">{title}</p>
            <p className="text-2xl font-bold tracking-tight">{value}</p>
          </div>
          <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${iconBgMap[color]}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

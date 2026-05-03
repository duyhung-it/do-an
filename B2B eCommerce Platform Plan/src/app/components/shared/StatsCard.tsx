// ============================================================
// StatsCard — Card thống kê với icon, trend, animated number
// E-phase: tinted bg, hover-lift, uppercase label, press feedback
// ============================================================

import { type ElementType } from 'react';
import { Card, CardContent } from '../ui/card';
import { IconWrapper } from './IconWrapper';
import { AnimatedNumber } from './AnimatedNumber';
import { TrendIndicator } from './TrendIndicator';

type StatsVariant = 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'purple';

interface StatsCardProps {
  title: string;
  value: number;
  format?: (n: number) => string;
  icon: ElementType;
  variant?: StatsVariant;
  trend?: number;
  trendLabel?: string;
  subtitle?: string;
  className?: string;
  onClick?: () => void;
}

const accentMap: Record<StatsVariant, { border: string; bg: string }> = {
  primary: { border: 'border-l-blue-500',    bg: 'bg-blue-50 dark:bg-blue-950/30'       },
  success: { border: 'border-l-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-950/30' },
  warning: { border: 'border-l-amber-500',   bg: 'bg-amber-50 dark:bg-amber-950/30'     },
  danger:  { border: 'border-l-red-500',     bg: 'bg-red-50 dark:bg-red-950/30'         },
  info:    { border: 'border-l-sky-500',     bg: 'bg-sky-50 dark:bg-sky-950/30'         },
  purple:  { border: 'border-l-purple-500',  bg: 'bg-purple-50 dark:bg-purple-950/30'   },
};

export function StatsCard({
  title, value, format, icon, variant = 'primary',
  trend, trendLabel, subtitle, className = '', onClick,
}: StatsCardProps) {
  const { border, bg } = accentMap[variant];
  return (
    <Card
      className={`
        relative border-l-4 ${border} overflow-hidden
        transition-all duration-300
        hover:-translate-y-1 hover:shadow-lg
        ${onClick ? 'cursor-pointer active:scale-[0.98]' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      {/* Subtle variant tint */}
      <div className={`absolute inset-0 ${bg} opacity-40 pointer-events-none`} />

      <CardContent className="relative p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 truncate">
              {title}
            </p>
            <div className="flex items-baseline gap-2 flex-wrap">
              <span
                className="text-2xl font-bold tracking-tight"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                <AnimatedNumber value={value} format={format} />
              </span>
              {trend !== undefined && <TrendIndicator value={trend} label={trendLabel} />}
            </div>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-1.5">{subtitle}</p>
            )}
          </div>
          <IconWrapper icon={icon} variant={variant} size="md" />
        </div>
      </CardContent>
    </Card>
  );
}

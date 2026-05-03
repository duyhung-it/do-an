// ============================================================
// IconWrapper — Vòng tròn có bg + icon bên trong
// A4.01–A4.02: size (sm/md/lg), color variants
// ============================================================

import { type ElementType } from 'react';

type IconVariant = 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'purple';
type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface IconWrapperProps {
  icon: ElementType;
  variant?: IconVariant;
  size?: IconSize;
  className?: string;
}

const variantMap: Record<IconVariant, string> = {
  primary: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
  success: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
  warning: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
  danger: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
  info: 'bg-sky-100 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400',
  neutral: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  purple: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
};

const sizeMap: Record<IconSize, { wrapper: string; icon: string }> = {
  xs: { wrapper: 'h-7 w-7 rounded-md', icon: 'h-3.5 w-3.5' },
  sm: { wrapper: 'h-9 w-9 rounded-lg', icon: 'h-4 w-4' },
  md: { wrapper: 'h-11 w-11 rounded-xl', icon: 'h-5 w-5' },
  lg: { wrapper: 'h-14 w-14 rounded-xl', icon: 'h-6 w-6' },
  xl: { wrapper: 'h-16 w-16 rounded-2xl', icon: 'h-8 w-8' },
};

export function IconWrapper({ icon: Icon, variant = 'primary', size = 'md', className = '' }: IconWrapperProps) {
  const v = variantMap[variant];
  const s = sizeMap[size];

  return (
    <div className={`flex items-center justify-center shrink-0 ${s.wrapper} ${v} ${className}`}>
      <Icon className={s.icon} />
    </div>
  );
}

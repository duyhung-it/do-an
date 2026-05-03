// ============================================================
// InlineAlert — Banner thông báo trong trang
// B9.07: info/warning/error/success variant, icon + text + close
// ============================================================

import { useState } from 'react';
import { Info, AlertTriangle, AlertCircle, CheckCircle2, X } from 'lucide-react';

type AlertVariant = 'info' | 'warning' | 'error' | 'success';

interface InlineAlertProps {
  variant?: AlertVariant;
  title?: string;
  children: React.ReactNode;
  closable?: boolean;
  className?: string;
  action?: { label: string; onClick: () => void };
}

const variantStyles: Record<AlertVariant, { icon: typeof Info; container: string; iconClass: string }> = {
  info: {
    icon: Info,
    container: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950/30 dark:border-blue-800 dark:text-blue-300',
    iconClass: 'text-blue-500 dark:text-blue-400',
  },
  warning: {
    icon: AlertTriangle,
    container: 'bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-950/30 dark:border-amber-800 dark:text-amber-300',
    iconClass: 'text-amber-500 dark:text-amber-400',
  },
  error: {
    icon: AlertCircle,
    container: 'bg-red-50 border-red-200 text-red-800 dark:bg-red-950/30 dark:border-red-800 dark:text-red-300',
    iconClass: 'text-red-500 dark:text-red-400',
  },
  success: {
    icon: CheckCircle2,
    container: 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/30 dark:border-emerald-800 dark:text-emerald-300',
    iconClass: 'text-emerald-500 dark:text-emerald-400',
  },
};

export function InlineAlert({
  variant = 'info',
  title,
  children,
  closable = true,
  className = '',
  action,
}: InlineAlertProps) {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;

  const config = variantStyles[variant];
  const Icon = config.icon;

  return (
    <div className={`flex gap-3 items-start rounded-xl border p-3.5 ${config.container} ${className}`} role="alert">
      <Icon className={`h-5 w-5 shrink-0 mt-0.5 ${config.iconClass}`} />
      <div className="flex-1 min-w-0">
        {title && <p className="mb-0.5" style={{ fontWeight: 500 }}>{title}</p>}
        <div className="text-sm opacity-90">{children}</div>
        {action && (
          <button
            className="mt-2 text-sm underline underline-offset-2 hover:opacity-80 transition-opacity"
            onClick={action.onClick}
          >
            {action.label}
          </button>
        )}
      </div>
      {closable && (
        <button onClick={() => setVisible(false)} className="p-0.5 rounded hover:bg-black/5 dark:hover:bg-white/10 transition-colors shrink-0">
          <X className="h-4 w-4 opacity-60" />
        </button>
      )}
    </div>
  );
}

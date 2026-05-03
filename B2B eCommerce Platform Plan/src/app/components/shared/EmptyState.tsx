// ============================================================
// EmptyState — E-phase: animated icon, shimmer ring, fade-in-up
// ============================================================

import { type ElementType } from 'react';
import { PackageOpen } from 'lucide-react';
import { Button } from '../ui/button';

interface EmptyStateProps {
  icon?: ElementType;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
  className?: string;
}

export function EmptyState({
  icon: Icon = PackageOpen,
  title,
  description,
  actionLabel,
  onAction,
  secondaryLabel,
  onSecondary,
  className = '',
}: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-20 px-4 text-center animate-fade-in-up ${className}`}>
      {/* Icon with pulsing ring */}
      <div className="relative mb-6">
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/10 to-primary/5 blur-xl animate-pulse" />
        <div className="relative w-24 h-24 rounded-3xl bg-gradient-to-br from-muted to-muted/60 dark:from-muted/40 dark:to-muted/20 flex items-center justify-center shadow-md border border-border/50">
          <Icon className="h-10 w-10 text-muted-foreground/60" />
        </div>
      </div>

      <h3 className="mb-2 text-foreground">{title}</h3>

      {description && (
        <p className="text-muted-foreground max-w-sm mb-6 text-sm leading-relaxed">
          {description}
        </p>
      )}

      {(actionLabel || secondaryLabel) && (
        <div className="flex gap-3 flex-wrap justify-center">
          {actionLabel && onAction && (
            <Button onClick={onAction} className="press-down">
              {actionLabel}
            </Button>
          )}
          {secondaryLabel && onSecondary && (
            <Button variant="outline" onClick={onSecondary} className="press-down">
              {secondaryLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

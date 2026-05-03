// ============================================================
// DashboardWidget — Card widget cho dashboard
// B8.04–B8.05: header + content + footer, collapsible
// ============================================================

import { useState, type ReactNode } from 'react';
import { ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Button } from '../ui/button';

interface DashboardWidgetProps {
  title: string;
  viewAllLabel?: string;
  onViewAll?: () => void;
  children: ReactNode;
  footer?: ReactNode;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  className?: string;
  headerActions?: ReactNode;
}

export function DashboardWidget({
  title,
  viewAllLabel = 'Xem tất cả',
  onViewAll,
  children,
  footer,
  collapsible = false,
  defaultCollapsed = false,
  className = '',
  headerActions,
}: DashboardWidgetProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  return (
    <Card className={`shadow-theme-sm overflow-hidden ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2 px-5 pt-4">
        <div className="flex items-center gap-2">
          <h4 style={{ fontFamily: 'var(--font-heading)' }}>{title}</h4>
          {collapsible && (
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setCollapsed(!collapsed)}>
              {collapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2">
          {headerActions}
          {onViewAll && (
            <Button variant="ghost" size="sm" className="text-primary h-7 gap-1" onClick={onViewAll}>
              {viewAllLabel}
              <ExternalLink className="h-3 w-3" />
            </Button>
          )}
        </div>
      </CardHeader>
      {!collapsed && (
        <>
          <CardContent className="px-5 pb-4">
            {children}
          </CardContent>
          {footer && (
            <div className="px-5 py-3 border-t border-border/50 bg-muted/20">
              {footer}
            </div>
          )}
        </>
      )}
    </Card>
  );
}

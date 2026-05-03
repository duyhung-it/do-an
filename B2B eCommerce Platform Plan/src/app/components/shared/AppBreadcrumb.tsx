// ============================================================
// Breadcrumb tái sử dụng — Hiển thị đường dẫn trang hiện tại
// ============================================================

import { Link } from 'react-router';
import { ChevronRight, Home } from 'lucide-react';
import type { BreadcrumbItem } from '../../types';

interface AppBreadcrumbProps {
  items: BreadcrumbItem[];
  showHome?: boolean;
}

export function AppBreadcrumb({ items, showHome = true }: AppBreadcrumbProps) {
  const allItems: BreadcrumbItem[] = showHome
    ? [{ label: 'Trang chủ', href: '/' }, ...items]
    : items;

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1 flex-wrap mb-4">
      {allItems.map((item, idx) => {
        const isLast = idx === allItems.length - 1;
        return (
          <span key={idx} className="flex items-center gap-1">
            {idx > 0 && <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />}
            {isLast || !item.href ? (
              <span className={isLast ? 'text-foreground' : 'text-muted-foreground'}>
                {idx === 0 && showHome ? <Home className="h-3.5 w-3.5" /> : item.label}
              </span>
            ) : (
              <Link
                to={item.href}
                className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
              >
                {idx === 0 && showHome ? <Home className="h-3.5 w-3.5" /> : item.label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}

// ============================================================
// SimpleFilterBar — FilterBar đơn giản cho các trang Admin mới
// API đơn giản: search + mảng filters với key/label/value/onChange/options[]
// ============================================================

import { Search, X } from 'lucide-react';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface SimpleFilter {
  key: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}

interface SimpleFilterBarProps {
  search: string;
  onSearchChange: (v: string) => void;
  searchPlaceholder?: string;
  filters?: SimpleFilter[];
  children?: React.ReactNode;
}

export function SimpleFilterBar({
  search,
  onSearchChange,
  searchPlaceholder = 'Tìm kiếm...',
  filters = [],
  children,
}: SimpleFilterBarProps) {
  return (
    <div className="bg-card border rounded-xl p-3 sm:p-4 shadow-sm">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-wrap">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9 h-9 bg-background"
            placeholder={searchPlaceholder}
            value={search}
            onChange={e => onSearchChange(e.target.value)}
          />
          {search && (
            <button
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-muted transition-colors"
              onClick={() => onSearchChange('')}
            >
              <X className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          )}
        </div>

        {/* Filters */}
        {filters.map(f => (
          <div key={f.key} className="min-w-[150px]">
            <Select value={f.value} onValueChange={f.onChange}>
              <SelectTrigger className="h-9 bg-background">
                <SelectValue placeholder={f.label} />
              </SelectTrigger>
              <SelectContent>
                {f.options.map(opt => (
                  <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ))}

        {children}
      </div>
    </div>
  );
}

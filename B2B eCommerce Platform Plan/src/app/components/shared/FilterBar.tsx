// ============================================================
// FilterBar — Bộ lọc nâng cấp UI-B Đợt 6
// B6.01–B6.10: card wrapper, active tags, date range, result count
// ============================================================

import { useState, type ReactNode } from 'react';
import { Search, SlidersHorizontal, X, Star, Calendar } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '../ui/sheet';
import type { FilterConfig, ActiveFilter } from '../../types';

// --- Simple filter item (new API for Admin pages) ---
interface SimpleFilterItem {
  key: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}

// --- Full complex filter props (old API) ---
interface FilterBarPropsComplex {
  filters: FilterConfig[];
  activeFilters: ActiveFilter[];
  onFilterChange: (filters: ActiveFilter[]) => void;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  children?: ReactNode;
  totalResults?: number;
  // Simple API not present in this mode
  search?: never;
}

// --- Simple props (new API) ---
interface FilterBarPropsSimple {
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  filters?: SimpleFilterItem[];
  children?: ReactNode;
  // Complex API not present in this mode
  activeFilters?: never;
  onFilterChange?: never;
}

type FilterBarProps = FilterBarPropsComplex | FilterBarPropsSimple;

// Type guard
function isSimpleMode(props: FilterBarProps): props is FilterBarPropsSimple {
  return 'search' in props && typeof props.search === 'string';
}

export function FilterBar(props: FilterBarProps) {
  // ---- SIMPLE MODE (new Admin pages) ----
  if (isSimpleMode(props)) {
    const { search, onSearchChange, searchPlaceholder = 'Tìm kiếm...', filters = [], children } = props;
    return (
      <div className="bg-card border rounded-xl p-3 sm:p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-wrap">
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
          {(filters as SimpleFilterItem[]).map((f: SimpleFilterItem) => (
            <div key={f.key} className="min-w-[150px]">
              <Select value={f.value} onValueChange={f.onChange}>
                <SelectTrigger className="h-9 bg-background">
                  <SelectValue placeholder={f.label} />
                </SelectTrigger>
                <SelectContent>
                  {f.options.map((opt: string) => (
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

  // ---- COMPLEX MODE (original API) ----
  const { filters, activeFilters, onFilterChange, searchValue = '', onSearchChange, searchPlaceholder = 'Tìm kiếm...', children, totalResults } = props as FilterBarPropsComplex;
  const SAVED_FILTERS_KEY = 'b2b_saved_filters';

  const [mobileOpen, setMobileOpen] = useState(false);


  const setFilter = (key: string, value: string) => {
    if (!value || value === '__all__') {
      onFilterChange(activeFilters.filter(f => f.key !== key));
    } else {
      const existing = activeFilters.findIndex(f => f.key === key);
      if (existing >= 0) {
        const updated = [...activeFilters];
        updated[existing] = { key, value };
        onFilterChange(updated);
      } else {
        onFilterChange([...activeFilters, { key, value }]);
      }
    }
  };

  const getFilterValue = (key: string): string => {
    return String(activeFilters.find(f => f.key === key)?.value ?? '');
  };

  const clearAll = () => onFilterChange([]);

  // B6.05: Lưu bộ lọc
  const saveCurrentFilters = () => {
    if (activeFilters.length === 0) return;
    try {
      const saved = JSON.parse(localStorage.getItem(SAVED_FILTERS_KEY) || '[]');
      const name = `Bộ lọc ${saved.length + 1}`;
      saved.push({ name, filters: activeFilters, savedAt: new Date().toISOString() });
      localStorage.setItem(SAVED_FILTERS_KEY, JSON.stringify(saved));
    } catch {
      // ignore localStorage errors
    }
  };

  const renderFilterInput = (filter: FilterConfig) => {
    if (filter.type === 'select' && filter.options) {
      return (
        <Select value={getFilterValue(filter.key) || '__all__'} onValueChange={v => setFilter(filter.key, v)}>
          <SelectTrigger className="h-9 bg-background">
            <SelectValue placeholder={filter.label} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">Tất cả {filter.label.toLowerCase()}</SelectItem>
            {filter.options.map(opt => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    // B6.04: Date range filter type
    if (filter.type === 'date' || filter.key.toLowerCase().includes('date') || filter.key.toLowerCase().includes('ngay')) {
      return (
        <div className="relative">
          <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            type="date"
            placeholder={filter.label}
            className="h-9 pl-8 bg-background"
            value={getFilterValue(filter.key)}
            onChange={e => setFilter(filter.key, e.target.value)}
          />
        </div>
      );
    }

    return (
      <Input
        placeholder={filter.label}
        className="h-9 bg-background"
        value={getFilterValue(filter.key)}
        onChange={e => setFilter(filter.key, e.target.value)}
      />
    );
  };

  const renderFilters = () => (
    <div className="flex flex-col sm:flex-row flex-wrap gap-2">
      {filters.map(filter => (
        <div key={filter.key} className="min-w-[160px]">
          {renderFilterInput(filter)}
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-3">
      {/* B6.01: Card wrapper cho filter bar */}
      <div className="bg-card border rounded-xl p-3 sm:p-4 shadow-theme-sm">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          {/* Tìm kiếm */}
          {onSearchChange && (
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-9 h-9 bg-background border-border/60 focus:border-primary/40"
                placeholder={searchPlaceholder}
                value={searchValue}
                onChange={e => onSearchChange(e.target.value)}
              />
              {searchValue && (
                <button
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-muted transition-colors"
                  onClick={() => onSearchChange('')}
                >
                  <X className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
              )}
            </div>
          )}

          {/* Bộ lọc desktop */}
          <div className="hidden md:flex items-center gap-2 flex-wrap">
            {renderFilters()}
          </div>

          {/* B6.05: Lưu bộ lọc */}
          {activeFilters.length > 0 && (
            <Button variant="ghost" size="sm" className="h-9 hidden md:flex" onClick={saveCurrentFilters} title="Lưu bộ lọc">
              <Star className="h-4 w-4" />
            </Button>
          )}

          {/* Nút lọc mobile */}
          <div className="md:hidden">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 w-full sm:w-auto">
                  <SlidersHorizontal className="mr-2 h-4 w-4" />
                  Bộ lọc
                  {activeFilters.length > 0 && (
                    <Badge variant="secondary" className="ml-2 bg-primary/10 text-primary">{activeFilters.length}</Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-auto max-h-[70vh] rounded-t-2xl">
                <SheetHeader>
                  <SheetTitle>Bộ lọc</SheetTitle>
                </SheetHeader>
                <div className="py-4 space-y-3">
                  {renderFilters()}
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" className="flex-1" onClick={() => { clearAll(); setMobileOpen(false); }}>
                      Xoá tất cả
                    </Button>
                    <Button className="flex-1" onClick={() => setMobileOpen(false)}>
                      Áp dụng
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {children}
        </div>

        {/* B6.10: Số lượng kết quả */}
        {totalResults !== undefined && (
          <div className="mt-2 pt-2 border-t border-border/50">
            <span className="text-muted-foreground text-sm">
              Tìm thấy <span className="text-foreground">{totalResults.toLocaleString('vi-VN')}</span> kết quả
            </span>
          </div>
        )}
      </div>

      {/* B6.02: Active filter tags (bên ngoài card) */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-muted-foreground text-sm mr-1">Đang lọc:</span>
          {activeFilters.map(f => {
            const filterConfig = filters.find(fc => fc.key === f.key);
            const label = filterConfig?.options?.find(o => o.value === f.value)?.label ?? String(f.value);
            return (
              <Badge
                key={f.key}
                variant="secondary"
                className="gap-1.5 bg-primary/10 text-primary hover:bg-primary/20 transition-colors cursor-pointer group/tag"
              >
                <span className="text-primary/60">{filterConfig?.label}:</span> {label}
                <button
                  onClick={() => setFilter(f.key, '')}
                  className="ml-0.5 rounded-full p-0.5 hover:bg-primary/20 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            );
          })}
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-destructive"
            onClick={clearAll}
          >
            Xoá tất cả
          </Button>
        </div>
      )}
    </div>
  );
}

// ============================================================
// Bảng dữ liệu tái sử dụng — Nâng cấp Premium UI-B Đợt 5
// B5.01–B5.10: striped, sticky header, skeleton, compact, pagination
// ============================================================

import { useState, useCallback, useMemo } from 'react';
import {
  ArrowUpDown, ArrowUp, ArrowDown, Settings2, ChevronLeft, ChevronRight,
  ChevronsLeft, ChevronsRight, Check, X, Pencil, PackageOpen,
  Rows3, Minimize2,
} from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Checkbox } from '../ui/checkbox';
import { Card, CardContent } from '../ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { ViewToggle } from './ViewToggle';
import type { ColumnConfig, ViewMode, SortParams, PaginationParams } from '../../types';

// --- Kiểu dữ liệu ---
interface DataTableProps<T> {
  data: T[];
  columns: (ColumnConfig & { render?: (item: T) => React.ReactNode })[];
  totalItems: number;
  pagination: PaginationParams;
  sort?: SortParams;
  onPaginationChange: (p: PaginationParams) => void;
  onSortChange: (s: SortParams) => void;
  onInlineEdit?: (id: string, field: string, value: unknown) => void;
  onRowClick?: (item: T) => void;
  renderGridCard?: (item: T) => React.ReactNode;
  renderListItem?: (item: T) => React.ReactNode;
  renderActions?: (item: T) => React.ReactNode;
  getId: (item: T) => string;
  viewModes?: ViewMode[];
  defaultViewMode?: ViewMode;
  loading?: boolean;
  pageSizeOptions?: number[];
  /** B5.01 - Hiển thị kẻ sọc xen kẽ */
  striped?: boolean;
  /** B5.05 - Bật chọn hàng */
  selectable?: boolean;
  selectedIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
  /** B5.10 - Compact mode mặc định */
  defaultCompact?: boolean;
  /** Thông báo khi không có dữ liệu */
  emptyTitle?: string;
  emptyDescription?: string;
}

// --- Skeleton Row B5.07 ---
function SkeletonRow({ cols, hasActions }: { cols: number; hasActions: boolean }) {
  return (
    <TableRow className="animate-pulse">
      {Array.from({ length: cols }).map((_, i) => (
        <TableCell key={i}>
          <div className="h-4 bg-muted rounded-md" style={{ width: `${60 + Math.random() * 30}%` }} />
        </TableCell>
      ))}
      {hasActions && (
        <TableCell>
          <div className="h-4 bg-muted rounded-md w-16" />
        </TableCell>
      )}
    </TableRow>
  );
}

// --- Phân trang B5.06 nâng cấp ---
function PaginationControls({
  pagination,
  totalItems,
  onChange,
  pageSizeOptions = [5, 10, 20, 50],
}: {
  pagination: PaginationParams;
  totalItems: number;
  onChange: (p: PaginationParams) => void;
  pageSizeOptions?: number[];
}) {
  const totalPages = Math.ceil(totalItems / pagination.pageSize);
  const canPrev = pagination.page > 1;
  const canNext = pagination.page < totalPages;

  // B5.06: Tính page numbers hiển thị (max 7)
  const pageNumbers = useMemo(() => {
    const pages: (number | '...')[] = [];
    const current = pagination.page;
    const total = totalPages;
    if (total <= 7) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      pages.push(1);
      if (current > 3) pages.push('...');
      const start = Math.max(2, current - 1);
      const end = Math.min(total - 1, current + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (current < total - 2) pages.push('...');
      pages.push(total);
    }
    return pages;
  }, [pagination.page, totalPages]);

  const from = Math.min((pagination.page - 1) * pagination.pageSize + 1, totalItems);
  const to = Math.min(pagination.page * pagination.pageSize, totalItems);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4">
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground whitespace-nowrap">
          Hiển thị {from}-{to} / {totalItems}
        </span>
        <Select
          value={String(pagination.pageSize)}
          onValueChange={v => onChange({ page: 1, pageSize: Number(v) })}
        >
          <SelectTrigger className="w-[80px] h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {pageSizeOptions.map(s => (
              <SelectItem key={s} value={String(s)}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center gap-1">
        <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={() => onChange({ ...pagination, page: 1 })} disabled={!canPrev}>
          <ChevronsLeft className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={() => onChange({ ...pagination, page: pagination.page - 1 })} disabled={!canPrev}>
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {/* B5.06: Page number buttons */}
        <div className="hidden sm:flex items-center gap-0.5">
          {pageNumbers.map((p, idx) =>
            p === '...' ? (
              <span key={`ellipsis-${idx}`} className="px-1.5 text-muted-foreground">…</span>
            ) : (
              <Button
                key={p}
                variant={p === pagination.page ? 'default' : 'ghost'}
                size="sm"
                className={`h-8 w-8 p-0 ${p === pagination.page ? '' : 'text-muted-foreground'}`}
                onClick={() => onChange({ ...pagination, page: p })}
              >
                {p}
              </Button>
            )
          )}
        </div>

        {/* Mobile: chỉ hiện text */}
        <span className="sm:hidden px-2 text-muted-foreground whitespace-nowrap">
          {pagination.page}/{totalPages || 1}
        </span>

        <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={() => onChange({ ...pagination, page: pagination.page + 1 })} disabled={!canNext}>
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={() => onChange({ ...pagination, page: totalPages })} disabled={!canNext}>
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

// --- Tuỳ chỉnh cột ---
function ColumnSettings({
  columns,
  onChange,
}: {
  columns: ColumnConfig[];
  onChange: (cols: ColumnConfig[]) => void;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-8">
          <Settings2 className="mr-2 h-4 w-4" />
          <span className="hidden sm:inline">Cột hiển thị</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56" align="end">
        <div className="grid gap-2">
          <h4 className="mb-1">Cột hiển thị</h4>
          {columns.map(col => (
            <label key={col.key} className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={col.visible}
                onCheckedChange={checked => {
                  onChange(columns.map(c => c.key === col.key ? { ...c, visible: !!checked } : c));
                }}
              />
              <span>{col.label}</span>
            </label>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

// --- Ô sửa inline ---
function InlineEditCell({
  value,
  type = 'text',
  options,
  onSave,
  onCancel,
}: {
  value: unknown;
  type?: ColumnConfig['type'];
  options?: string[];
  onSave: (val: unknown) => void;
  onCancel: () => void;
}) {
  const [editValue, setEditValue] = useState(String(value ?? ''));

  if (type === 'select' && options) {
    return (
      <div className="flex items-center gap-1">
        <Select value={editValue} onValueChange={v => { setEditValue(v); onSave(v); }}>
          <SelectTrigger className="h-7">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {options.map(opt => (
              <SelectItem key={opt} value={opt}>{opt}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={onCancel}>
          <X className="h-3 w-3" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <Input
        className="h-7"
        type={type === 'number' ? 'number' : 'text'}
        value={editValue}
        onChange={e => setEditValue(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter') onSave(type === 'number' ? Number(editValue) : editValue);
          if (e.key === 'Escape') onCancel();
        }}
        autoFocus
      />
      <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => onSave(type === 'number' ? Number(editValue) : editValue)}>
        <Check className="h-3 w-3" />
      </Button>
      <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={onCancel}>
        <X className="h-3 w-3" />
      </Button>
    </div>
  );
}

// --- B5.08: Empty state inline ---
function TableEmptyState({ colSpan, title, description }: { colSpan: number; title?: string; description?: string }) {
  return (
    <TableRow>
      <TableCell colSpan={colSpan} className="h-40">
        <div className="flex flex-col items-center justify-center text-center py-8">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 flex items-center justify-center mb-3 shadow-theme-sm">
            <PackageOpen className="h-6 w-6 text-blue-500 dark:text-blue-400" />
          </div>
          <p className="text-muted-foreground">{title || 'Không có dữ liệu'}</p>
          {description && <p className="text-muted-foreground mt-1">{description}</p>}
        </div>
      </TableCell>
    </TableRow>
  );
}

// --- Component chính ---
export function DataTable<T>({
  data,
  columns: initialColumns,
  totalItems,
  pagination,
  sort,
  onPaginationChange,
  onSortChange,
  onInlineEdit,
  onRowClick,
  renderGridCard,
  renderListItem,
  renderActions,
  getId,
  viewModes = ['table', 'grid', 'list'],
  defaultViewMode = 'table',
  loading,
  pageSizeOptions,
  striped = false,
  selectable = false,
  selectedIds = [],
  onSelectionChange,
  defaultCompact = false,
  emptyTitle,
  emptyDescription,
}: DataTableProps<T>) {
  const [viewMode, setViewMode] = useState<ViewMode>(defaultViewMode);
  const [columns, setColumns] = useState(initialColumns);
  const [editingCell, setEditingCell] = useState<{ id: string; field: string } | null>(null);
  const [compact, setCompact] = useState(defaultCompact);

  const visibleColumns = columns.filter(c => c.visible !== false);

  const handleSort = useCallback((field: string) => {
    if (!sort || sort.field !== field) {
      onSortChange({ field, direction: 'asc' });
    } else if (sort.direction === 'asc') {
      onSortChange({ field, direction: 'desc' });
    } else {
      onSortChange({ field: '', direction: 'asc' });
    }
  }, [sort, onSortChange]);

  const getSortIcon = (field: string) => {
    if (!sort || sort.field !== field) return <ArrowUpDown className="h-3.5 w-3.5 opacity-50" />;
    return sort.direction === 'asc'
      ? <ArrowUp className="h-3.5 w-3.5 text-primary" />
      : <ArrowDown className="h-3.5 w-3.5 text-primary" />;
  };

  const getCellValue = (item: T, key: string): unknown => {
    return (item as Record<string, unknown>)[key];
  };

  const formatValue = (value: unknown): string => {
    if (value === null || value === undefined) return '';
    if (typeof value === 'number') return value.toLocaleString('vi-VN');
    if (typeof value === 'boolean') return value ? 'Có' : 'Không';
    return String(value);
  };

  // B5.05: Selection helpers
  const allSelected = data.length > 0 && data.every(item => selectedIds.includes(getId(item)));
  const someSelected = data.some(item => selectedIds.includes(getId(item))) && !allSelected;

  const toggleAll = useCallback(() => {
    if (!onSelectionChange) return;
    if (allSelected) {
      const currentIds = data.map(getId);
      onSelectionChange(selectedIds.filter(id => !currentIds.includes(id)));
    } else {
      const currentIds = data.map(getId);
      const merged = [...new Set([...selectedIds, ...currentIds])];
      onSelectionChange(merged);
    }
  }, [allSelected, data, getId, onSelectionChange, selectedIds]);

  const toggleRow = useCallback((id: string) => {
    if (!onSelectionChange) return;
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter(x => x !== id));
    } else {
      onSelectionChange([...selectedIds, id]);
    }
  }, [onSelectionChange, selectedIds]);

  const cellPadding = compact ? 'py-1.5 px-3' : 'py-2.5 px-4';
  const headerPadding = compact ? 'py-2 px-3' : 'py-3 px-4';

  return (
    <div className="space-y-3">
      {/* Thanh công cụ */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <ViewToggle viewMode={viewMode} onChange={setViewMode} modes={viewModes} />
          {/* B5.05: Selection info */}
          {selectable && selectedIds.length > 0 && (
            <span className="text-primary text-sm">
              Đã chọn {selectedIds.length}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          {/* B5.10: Compact toggle */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={compact ? 'secondary' : 'ghost'}
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => setCompact(!compact)}
                >
                  {compact ? <Minimize2 className="h-4 w-4" /> : <Rows3 className="h-4 w-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{compact ? 'Chế độ thường' : 'Chế độ gọn'}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <ColumnSettings columns={columns} onChange={setColumns} />
        </div>
      </div>

      {/* B5.07: Skeleton loading */}
      {loading && viewMode === 'table' && (
        <div className="rounded-xl border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                {visibleColumns.map(col => (
                  <TableHead key={col.key} className={headerPadding} style={{ width: col.width }}>
                    {col.label}
                  </TableHead>
                ))}
                {renderActions && <TableHead className={headerPadding}>Thao tác</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: pagination.pageSize > 10 ? 5 : Math.min(pagination.pageSize, 5) }).map((_, i) => (
                <SkeletonRow key={i} cols={visibleColumns.length} hasActions={!!renderActions} />
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {loading && viewMode !== 'table' && (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      )}

      {/* Chế độ bảng */}
      {!loading && viewMode === 'table' && (
        <div className="rounded-xl border overflow-x-auto shadow-theme-sm">
          <Table>
            {/* B5.03: Sticky header */}
            <TableHeader className="sticky top-0 z-10 bg-muted/50 backdrop-blur-sm">
              <TableRow className="hover:bg-transparent border-b-2 border-border">
                {/* B5.05: Select all checkbox */}
                {selectable && (
                  <TableHead className={`${headerPadding} w-10`}>
                    <Checkbox
                      checked={allSelected}
                      {...(someSelected ? { 'data-state': 'indeterminate' } : {})}
                      onCheckedChange={() => toggleAll()}
                    />
                  </TableHead>
                )}
                {visibleColumns.map(col => (
                  <TableHead
                    key={col.key}
                    className={`${headerPadding} group/header relative`}
                    style={{ width: col.width }}
                  >
                    {col.sortable ? (
                      <button
                        className="flex items-center gap-1.5 hover:text-foreground transition-colors"
                        onClick={() => handleSort(col.key)}
                      >
                        <span>{col.label}</span>
                        {getSortIcon(col.key)}
                      </button>
                    ) : (
                      <span>{col.label}</span>
                    )}
                    {/* B5.04: Column resize indicator */}
                    <div className="absolute right-0 top-1/4 bottom-1/4 w-px bg-border opacity-0 group-hover/header:opacity-100 transition-opacity" />
                  </TableHead>
                ))}
                {renderActions && <TableHead className={headerPadding} style={{ width: '100px' }}>Thao tác</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.length === 0 ? (
                <TableEmptyState
                  colSpan={visibleColumns.length + (renderActions ? 1 : 0) + (selectable ? 1 : 0)}
                  title={emptyTitle}
                  description={emptyDescription}
                />
              ) : (
                data.map((item, rowIndex) => {
                  const id = getId(item);
                  const isSelected = selectable && selectedIds.includes(id);

                  return (
                    <TableRow
                      key={id}
                      className={[
                        'transition-colors duration-150',
                        // B5.02: Better hover
                        onRowClick ? 'cursor-pointer' : '',
                        'hover:bg-primary/[0.04]',
                        // B5.01: Striped rows
                        striped && rowIndex % 2 === 1 ? 'bg-muted/30' : '',
                        // B5.05: Selected row
                        isSelected ? 'bg-primary/[0.08] border-l-2 border-l-primary' : '',
                      ].filter(Boolean).join(' ')}
                      onClick={() => onRowClick?.(item)}
                    >
                      {/* B5.05: Row checkbox */}
                      {selectable && (
                        <TableCell className={`${cellPadding} w-10`} onClick={e => e.stopPropagation()}>
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => toggleRow(id)}
                          />
                        </TableCell>
                      )}
                      {visibleColumns.map(col => {
                        const isEditing = editingCell?.id === id && editingCell.field === col.key;
                        const cellVal = getCellValue(item, col.key);

                        return (
                          <TableCell key={col.key} className={cellPadding} onClick={e => e.stopPropagation()}>
                            {isEditing && onInlineEdit ? (
                              <InlineEditCell
                                value={cellVal}
                                type={col.type}
                                options={col.options}
                                onSave={val => {
                                  onInlineEdit(id, col.key, val);
                                  setEditingCell(null);
                                }}
                                onCancel={() => setEditingCell(null)}
                              />
                            ) : (
                              <div className="flex items-center gap-1 group/cell">
                                <span className="truncate">{col.render ? col.render(item) : formatValue(cellVal)}</span>
                                {col.editable && onInlineEdit && (
                                  <button
                                    className="opacity-0 group-hover/cell:opacity-100 transition-opacity p-0.5 rounded hover:bg-muted"
                                    onClick={() => setEditingCell({ id, field: col.key })}
                                  >
                                    <Pencil className="h-3 w-3 text-muted-foreground" />
                                  </button>
                                )}
                              </div>
                            )}
                          </TableCell>
                        );
                      })}
                      {renderActions && (
                        <TableCell className={cellPadding} onClick={e => e.stopPropagation()}>
                          {renderActions(item)}
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* B5.09: Chế độ lưới nâng cấp */}
      {!loading && viewMode === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {data.length === 0 ? (
            <div className="col-span-full">
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 flex items-center justify-center mb-3">
                  <PackageOpen className="h-6 w-6 text-blue-500 dark:text-blue-400" />
                </div>
                <p className="text-muted-foreground">{emptyTitle || 'Không có dữ liệu'}</p>
              </div>
            </div>
          ) : (
            data.map(item => (
              <div
                key={getId(item)}
                onClick={() => onRowClick?.(item)}
                className={onRowClick ? 'cursor-pointer' : ''}
              >
                {renderGridCard ? renderGridCard(item) : (
                  <Card className="hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 overflow-hidden group/card">
                    <CardContent className="p-4">
                      {visibleColumns.slice(0, 4).map(col => (
                        <div key={col.key} className="flex justify-between py-1.5 border-b border-border/50 last:border-0">
                          <span className="text-muted-foreground">{col.label}:</span>
                          <span className="truncate ml-2 text-right">{col.render ? col.render(item) : formatValue(getCellValue(item, col.key))}</span>
                        </div>
                      ))}
                      {renderActions && (
                        <div className="mt-3 pt-2 border-t border-border/50">
                          {renderActions(item)}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Chế độ danh sách */}
      {!loading && viewMode === 'list' && (
        <div className="space-y-2">
          {data.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 flex items-center justify-center mb-3">
                <PackageOpen className="h-6 w-6 text-blue-500 dark:text-blue-400" />
              </div>
              <p className="text-muted-foreground">{emptyTitle || 'Không có dữ liệu'}</p>
            </div>
          ) : (
            data.map(item => (
              <div key={getId(item)} onClick={() => onRowClick?.(item)} className={onRowClick ? 'cursor-pointer' : ''}>
                {renderListItem ? renderListItem(item) : (
                  <Card className="hover:bg-primary/[0.03] hover:shadow-sm transition-all duration-150">
                    <CardContent className="p-4 flex flex-wrap gap-x-6 gap-y-1">
                      {visibleColumns.slice(0, 6).map(col => (
                        <div key={col.key}>
                          <span className="text-muted-foreground">{col.label}: </span>
                          <span>{col.render ? col.render(item) : formatValue(getCellValue(item, col.key))}</span>
                        </div>
                      ))}
                      {renderActions && (
                        <div className="ml-auto flex items-center">
                          {renderActions(item)}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Phân trang */}
      <PaginationControls
        pagination={pagination}
        totalItems={totalItems}
        onChange={onPaginationChange}
        pageSizeOptions={pageSizeOptions}
      />
    </div>
  );
}

// ============================================================
// SimpleTable — Bảng đơn giản không cần pagination phức tạp
// Dùng cho các trang admin có dữ liệu nhỏ
// ============================================================

import { ChevronLeft, ChevronRight, PackageOpen } from 'lucide-react';
import { Button } from '../ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';

export interface SimpleColumn<T> {
  key: string;
  label: string;
  render?: (value: unknown, row: T) => React.ReactNode;
}

interface SimpleTableProps<T> {
  columns: SimpleColumn<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  // Optional simple pagination
  page?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}

function SkeletonRows({ cols }: { cols: number }) {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <TableRow key={i} className="animate-pulse">
          {Array.from({ length: cols }).map((__, j) => (
            <TableCell key={j}><div className="h-4 bg-muted rounded" style={{ width: `${50 + Math.random() * 40}%` }} /></TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}

export function SimpleTable<T extends Record<string, unknown>>({
  columns,
  data,
  loading,
  emptyMessage = 'Không có dữ liệu',
  page,
  totalPages,
  onPageChange,
}: SimpleTableProps<T>) {
  return (
    <div className="space-y-3">
      <div className="rounded-xl border overflow-x-auto shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              {columns.map(col => (
                <TableHead key={col.key} className="py-3 px-4 text-xs font-semibold uppercase tracking-wider">
                  {col.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <SkeletonRows cols={columns.length} />
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-40">
                  <div className="flex flex-col items-center justify-center text-center py-8">
                    <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-3">
                      <PackageOpen className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground">{emptyMessage}</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, rowIdx) => (
                <TableRow key={rowIdx} className="hover:bg-primary/[0.03] transition-colors">
                  {columns.map(col => (
                    <TableCell key={col.key} className="py-3 px-4">
                      {col.render
                        ? col.render(row)
                        : String(row[col.key] ?? '')}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Simple pagination */}
      {page !== undefined && totalPages !== undefined && onPageChange && totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <span className="text-sm text-muted-foreground">Trang {page} / {totalPages}</span>
          <div className="flex gap-1">
            <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={() => onPageChange(page - 1)} disabled={page <= 1}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const p = totalPages <= 5 ? i + 1 : Math.max(1, page - 2) + i;
              if (p > totalPages) return null;
              return (
                <Button key={p} variant={p === page ? 'default' : 'ghost'} size="sm" className="h-8 w-8 p-0" onClick={() => onPageChange(p)}>
                  {p}
                </Button>
              );
            })}
            <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={() => onPageChange(page + 1)} disabled={page >= totalPages}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

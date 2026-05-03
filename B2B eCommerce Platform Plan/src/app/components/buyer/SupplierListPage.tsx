// ============================================================
// Danh sách NCC — Buyer (P3 Đợt 6: P3.04–P3.05)
// Card with cover banner, avatar, stats, verified badge, stars
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';
import {
  Star, ShieldCheck, MapPin, Scale, Package, FileText,
  Users, Building2, MessageSquare, ChevronRight, Search,
} from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import { DataTable } from '../shared/DataTable';
import { FilterBar } from '../shared/FilterBar';
import { AppBreadcrumb } from '../shared/AppBreadcrumb';
import { IconWrapper } from '../shared/IconWrapper';
import { supplierApi, supplierScorecardApi } from '../../services/api';
import type { Supplier, SupplierScorecard, PaginationParams, SortParams, ActiveFilter, FilterConfig, ColumnConfig } from '../../types';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { toast } from 'sonner';

type SupplierWithScore = Supplier & { score: number };

// ─── P3.05: Star Rating Component ────────────────────────
function StarRating({ rating, reviewCount }: { rating: number; reviewCount: number }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => {
        const filled = i < Math.floor(rating);
        const half = !filled && i < rating;
        return (
          <Star
            key={i}
            className={`h-3.5 w-3.5 ${
              filled ? 'fill-amber-400 text-amber-400'
              : half ? 'fill-amber-400/50 text-amber-400'
              : 'text-muted-foreground/30'
            }`}
          />
        );
      })}
      <span className="text-sm" style={{ fontFamily: 'var(--font-heading)' }}>{rating}</span>
      <span className="text-xs text-muted-foreground">({reviewCount})</span>
    </div>
  );
}

const columns: (ColumnConfig & { render?: (item: SupplierWithScore) => React.ReactNode })[] = [
  { key: 'companyName', label: 'Tên công ty', visible: true, sortable: true },
  { key: 'city', label: 'Thành phố', visible: true, sortable: true },
  {
    key: 'rating', label: 'Đánh giá', visible: true, sortable: true,
    render: (item) => <StarRating rating={item.rating} reviewCount={item.reviewCount} />,
  },
  {
    key: 'score', label: 'Điểm NCC', visible: true, sortable: true,
    render: (item) => (
      <Badge variant={item.score >= 85 ? 'default' : item.score >= 70 ? 'secondary' : 'outline'}>
        {item.score > 0 ? `${item.score}/100` : '—'}
      </Badge>
    ),
  },
  { key: 'productCount', label: 'Số sản phẩm', visible: true, sortable: true },
  { key: 'yearEstablished', label: 'Năm thành lập', visible: true, sortable: true },
  {
    key: 'isVerified', label: 'Xác minh', visible: true, sortable: false,
    render: (item) => item.isVerified
      ? <Badge className="bg-blue-100 text-blue-700 border-blue-200 gap-1"><ShieldCheck className="h-3 w-3" />Đã xác minh</Badge>
      : <span className="text-muted-foreground text-xs">—</span>,
  },
];

const filterConfigs: FilterConfig[] = [
  {
    key: 'city', label: 'Thành phố', type: 'select', options: [
      { label: 'Hồ Chí Minh', value: 'Hồ Chí Minh' },
      { label: 'Hà Nội', value: 'Hà Nội' },
      { label: 'Đà Nẵng', value: 'Đà Nẵng' },
      { label: 'Cần Thơ', value: 'Cần Thơ' },
    ],
  },
];

export function SupplierListPage() {
  const navigate = useNavigate();
  const [suppliers, setSuppliers] = useState<SupplierWithScore[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationParams>({ page: 1, pageSize: 10 });
  const [sort, setSort] = useState<SortParams>({ field: 'rating', direction: 'desc' });
  const [filters, setFilters] = useState<ActiveFilter[]>([]);
  const [search, setSearch] = useState('');
  const [scoreMap, setScoreMap] = useState<Record<string, number>>({});
  const [compareIds, setCompareIds] = useState<string[]>([]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [res, scorecards] = await Promise.all([
        supplierApi.getPaginated(pagination, sort.field ? sort : undefined, filters, search),
        supplierScorecardApi.getAll(),
      ]);
      const map: Record<string, number> = {};
      scorecards.forEach(sc => { map[sc.supplierId] = sc.overallScore; });
      setScoreMap(map);
      const enriched: SupplierWithScore[] = res.data.map(s => ({
        ...s, score: map[s.id] ?? 0,
      }));
      setSuppliers(enriched);
      setTotal(res.total);
    } finally { setLoading(false); }
  }, [pagination, sort, filters, search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const toggleCompare = (id: string) => {
    setCompareIds(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id);
      if (prev.length >= 4) { toast.warning('Chỉ so sánh tối đa 4 NCC'); return prev; }
      return [...prev, id];
    });
  };

  const goCompare = () => {
    if (compareIds.length < 2) { toast.warning('Chọn ít nhất 2 NCC'); return; }
    navigate(`/supplier-compare?ids=${compareIds.join(',')}`);
  };

  // P3.04: Grid card with cover image banner, avatar, stats
  const renderGridCard = (supplier: SupplierWithScore) => (
    <Card className="group hover:shadow-lg hover:-translate-y-1 transition-all h-full overflow-hidden">
      {/* Cover banner */}
      <div className="h-28 overflow-hidden relative">
        <ImageWithFallback
          src={supplier.coverUrl}
          alt={supplier.companyName}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

        {/* Compare checkbox */}
        <div className="absolute top-2 left-2" onClick={e => e.stopPropagation()}>
          <div className="h-7 w-7 rounded-lg bg-white/80 backdrop-blur-sm flex items-center justify-center">
            <Checkbox
              checked={compareIds.includes(supplier.id)}
              onCheckedChange={() => toggleCompare(supplier.id)}
            />
          </div>
        </div>

        {/* P3.05: Verified badge nổi bật */}
        {supplier.isVerified && (
          <div className="absolute top-2 right-2">
            <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-500 text-white text-[10px] shadow-sm">
              <ShieldCheck className="h-3 w-3" />
              Đã xác minh
            </div>
          </div>
        )}
      </div>

      <CardContent className="p-4 -mt-6 relative">
        {/* Avatar */}
        <div className="h-12 w-12 rounded-xl bg-card border-2 border-background shadow-md flex items-center justify-center overflow-hidden mb-2">
          <Building2 className="h-6 w-6 text-primary" />
        </div>

        {/* Company name */}
        <p className="line-clamp-1 mb-1" style={{ fontFamily: 'var(--font-heading)' }}>
          {supplier.companyName}
        </p>

        {/* Location */}
        <div className="flex items-center gap-1 mb-2">
          <MapPin className="h-3 w-3 text-muted-foreground" />
          <span className="text-muted-foreground text-xs">{supplier.city}</span>
          <span className="text-muted-foreground text-xs">· Từ {supplier.yearEstablished}</span>
        </div>

        {/* P3.05: Stars */}
        <StarRating rating={supplier.rating} reviewCount={supplier.reviewCount} />

        {/* P3.04: Stats 3 col */}
        <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t">
          <div className="text-center">
            <p className="text-sm" style={{ fontFamily: 'var(--font-heading)' }}>{supplier.productCount}</p>
            <p className="text-[10px] text-muted-foreground">Sản phẩm</p>
          </div>
          <div className="text-center">
            <p className="text-sm" style={{ fontFamily: 'var(--font-heading)' }}>{supplier.rating}</p>
            <p className="text-[10px] text-muted-foreground">Đánh giá</p>
          </div>
          <div className="text-center">
            <p className="text-sm" style={{ fontFamily: 'var(--font-heading)' }}>
              {scoreMap[supplier.id] ? `${scoreMap[supplier.id]}` : '—'}
            </p>
            <p className="text-[10px] text-muted-foreground">Điểm NCC</p>
          </div>
        </div>

        {/* CTA */}
        <Button
          variant="outline"
          size="sm"
          className="w-full mt-3 gap-1"
          onClick={(e) => { e.stopPropagation(); navigate(`/suppliers/${supplier.id}`); }}
        >
          <MessageSquare className="h-3.5 w-3.5" /> Liên hệ
          <ChevronRight className="h-3.5 w-3.5 ml-auto" />
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <AppBreadcrumb items={[{ label: 'Nhà cung cấp' }]} />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2" style={{ fontFamily: 'var(--font-heading)' }}>
            <Building2 className="h-6 w-6 text-primary" />
            Nhà cung cấp
          </h1>
          <p className="text-muted-foreground mt-1">Tìm đối tác kinh doanh đáng tin cậy</p>
        </div>
        {compareIds.length > 0 && (
          <Button onClick={goCompare} className="gap-2">
            <Scale className="h-4 w-4" /> So sánh ({compareIds.length})
          </Button>
        )}
      </div>

      <FilterBar
        filters={filterConfigs}
        activeFilters={filters}
        onFilterChange={f => { setFilters(f); setPagination(p => ({ ...p, page: 1 })); }}
        searchValue={search}
        onSearchChange={v => { setSearch(v); setPagination(p => ({ ...p, page: 1 })); }}
        searchPlaceholder="Tìm nhà cung cấp..."
      />

      <DataTable
        data={suppliers}
        columns={columns}
        totalItems={total}
        pagination={pagination}
        sort={sort}
        onPaginationChange={setPagination}
        onSortChange={setSort}
        onRowClick={s => navigate(`/suppliers/${s.id}`)}
        getId={s => s.id}
        renderGridCard={renderGridCard}
        loading={loading}
        defaultViewMode="grid"
      />
    </div>
  );
}

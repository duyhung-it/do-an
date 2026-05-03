// ============================================================
// Danh sách yêu cầu báo giá (RFQ) — Redesign UI-E Đợt 19
// E19.06: Status badge, remaining time countdown
// ============================================================

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { Plus, FileText, Clock, CheckCircle2, Send, Timer, AlertTriangle, Building2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { DataTable } from '../shared/DataTable';
import { FilterBar } from '../shared/FilterBar';
import { StatusBadge } from '../shared/StatusBadge';
import { AppBreadcrumb } from '../shared/AppBreadcrumb';
import { rfqApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import type { RFQ, PaginationParams, SortParams, ActiveFilter, FilterConfig, ColumnConfig } from '../../types';

const columns: ColumnConfig[] = [
  { key: 'rfqNumber', label: 'Mã YCBG', visible: true, sortable: true },
  { key: 'supplierName', label: 'Nhà cung cấp', visible: true, sortable: true },
  { key: 'itemCount', label: 'Số SP', visible: true, sortable: true },
  { key: 'status', label: 'Trạng thái', visible: true, sortable: true },
  { key: 'deliveryDate', label: 'Ngày giao', visible: true, sortable: true },
  { key: 'expiresAt', label: 'Hết hạn', visible: true, sortable: true },
  { key: 'createdAt', label: 'Ngày tạo', visible: true, sortable: true },
];

const filterConfigs: FilterConfig[] = [
  {
    key: 'status', label: 'Trạng thái', type: 'select', options: [
      { label: 'Bản nháp', value: 'Bản nháp' },
      { label: 'Đã gửi', value: 'Đã gửi' },
      { label: 'Đang báo giá', value: 'Đang báo giá' },
      { label: 'Đã báo giá', value: 'Đã báo giá' },
      { label: 'Chấp nhận', value: 'Chấp nhận' },
      { label: 'Hết hạn', value: 'Hết hạn' },
    ],
  },
];

// E19.06: Countdown helper
function getRemainingTime(expiresAt: string): { text: string; urgent: boolean; expired: boolean } {
  const now = new Date();
  const expDate = new Date(expiresAt);
  const diff = expDate.getTime() - now.getTime();
  if (diff <= 0) return { text: 'Đã hết hạn', urgent: true, expired: true };
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  if (days > 7) return { text: `Còn ${days} ngày`, urgent: false, expired: false };
  if (days > 0) return { text: `Còn ${days}d ${hours}h`, urgent: days <= 2, expired: false };
  return { text: `Còn ${hours} giờ`, urgent: true, expired: false };
}

interface RFQRow extends RFQ {
  itemCount: number;
}

export function BuyerRFQListPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [rfqs, setRfqs] = useState<RFQRow[]>([]);
  const [allRfqs, setAllRfqs] = useState<RFQ[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationParams>({ page: 1, pageSize: 10 });
  const [sort, setSort] = useState<SortParams>({ field: 'createdAt', direction: 'desc' });
  const [filters, setFilters] = useState<ActiveFilter[]>([]);
  const [search, setSearch] = useState('');

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Lấy tất cả RFQ của buyer để tính stats
      const buyerRfqs = await rfqApi.getByBuyer(user.id);
      setAllRfqs(buyerRfqs);

      const res = await rfqApi.getPaginated(pagination, sort, filters, search);
      // Lọc theo buyer
      const filtered = res.data.filter(r => r.buyerId === user.id);
      const rows: RFQRow[] = filtered.map(r => ({ ...r, itemCount: r.items.length }));
      setRfqs(rows);

      // Tính tổng chính xác theo buyer
      const allFiltered = buyerRfqs.filter(r => {
        if (search) {
          const s = search.toLowerCase();
          const matchSearch = r.rfqNumber.toLowerCase().includes(s) ||
            (r.supplierName ?? '').toLowerCase().includes(s) ||
            r.items.some(item => item.productName.toLowerCase().includes(s));
          if (!matchSearch) return false;
        }
        if (filters.length > 0) {
          return filters.every(f => {
            const val = (r as unknown as Record<string, unknown>)[f.key];
            return String(val) === String(f.value);
          });
        }
        return true;
      });
      setTotal(allFiltered.length);
    } finally {
      setLoading(false);
    }
  }, [user, pagination, sort, filters, search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const stats = useMemo(() => {
    const total = allRfqs.length;
    const pending = allRfqs.filter(r => r.status === 'Đã gửi' || r.status === 'Đang báo giá').length;
    const quoted = allRfqs.filter(r => r.status === 'Đã báo giá').length;
    const accepted = allRfqs.filter(r => r.status === 'Chấp nhận').length;
    return [
      { label: 'Tổng YCBG', value: total, icon: FileText, color: 'text-blue-500' },
      { label: 'Đang chờ', value: pending, icon: Clock, color: 'text-yellow-500' },
      { label: 'Đã báo giá', value: quoted, icon: Send, color: 'text-purple-500' },
      { label: 'Đã chấp nhận', value: accepted, icon: CheckCircle2, color: 'text-green-500' },
    ];
  }, [allRfqs]);

  const renderGridCard = (rfq: RFQRow) => {
    const remaining = getRemainingTime(rfq.expiresAt);
    const statusColor = rfq.status === 'Chấp nhận' ? 'bg-emerald-500'
      : rfq.status === 'Đã báo giá' ? 'bg-purple-500'
      : rfq.status === 'Hết hạn' ? 'bg-muted-foreground'
      : rfq.status === 'Bản nháp' ? 'bg-slate-400'
      : 'bg-amber-500';

    return (
      <Card
        key={rfq.id}
        className="cursor-pointer overflow-hidden border-0 shadow-sm hover:shadow-md transition-all duration-200"
        onClick={() => navigate(`/rfq/${rfq.id}`)}
      >
        <div className={`h-1 ${statusColor}`} />
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm" style={{ fontWeight: 600 }}>{rfq.rfqNumber}</span>
            <StatusBadge status={rfq.status} />
          </div>
          <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
            <Building2 className="h-3 w-3 shrink-0" /> {rfq.supplierName ?? 'Chưa chọn NCC'}
          </p>
          <div className="flex items-center justify-between text-xs">
            <Badge variant="secondary" className="text-[10px]">{rfq.items.length} sản phẩm</Badge>
            <span className="text-muted-foreground">{rfq.createdAt}</span>
          </div>
          {/* E19.06: Countdown timer */}
          {!['Chấp nhận', 'Hết hạn', 'Bản nháp'].includes(rfq.status) && (
            <div className={`
              flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg
              ${remaining.urgent
                ? 'bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400'
                : 'bg-muted/50 text-muted-foreground'}
            `}>
              {remaining.urgent ? <AlertTriangle className="h-3 w-3" /> : <Timer className="h-3 w-3" />}
              {remaining.text}
            </div>
          )}
          <div className="text-xs text-muted-foreground">
            Giao: {rfq.deliveryDate}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <AppBreadcrumb items={[{ label: 'Trang chủ', href: '/' }, { label: 'Yêu cầu báo giá' }]} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1>Yêu cầu báo giá</h1>
          <p className="text-muted-foreground">Quản lý các yêu cầu báo giá gửi đến nhà cung cấp</p>
        </div>
        <Button onClick={() => navigate('/rfq/new')} className="shrink-0">
          <Plus className="mr-2 h-4 w-4" /> Tạo YCBG mới
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(s => (
          <Card key={s.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <s.icon className={`h-8 w-8 ${s.color}`} />
              <div>
                <p className="text-2xl">{s.value}</p>
                <p className="text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <FilterBar
        filters={filterConfigs}
        activeFilters={filters}
        onFilterChange={f => { setFilters(f); setPagination(p => ({ ...p, page: 1 })); }}
        searchValue={search}
        onSearchChange={v => { setSearch(v); setPagination(p => ({ ...p, page: 1 })); }}
        searchPlaceholder="Tìm mã YCBG, NCC, sản phẩm..."
      />

      {/* Table */}
      <DataTable<RFQRow>
        data={rfqs}
        columns={columns}
        totalItems={total}
        pagination={pagination}
        sort={sort}
        onPaginationChange={setPagination}
        onSortChange={setSort}
        onRowClick={rfq => navigate(`/rfq/${rfq.id}`)}
        getId={rfq => rfq.id}
        loading={loading}
        viewModes={['table', 'grid']}
        defaultViewMode="table"
        renderGridCard={renderGridCard}
        renderActions={(rfq) => (
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); navigate(`/rfq/${rfq.id}`); }}>
              Xem
            </Button>
          </div>
        )}
      />
    </div>
  );
}
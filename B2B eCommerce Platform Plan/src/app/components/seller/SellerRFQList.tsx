// ============================================================
// Danh sách yêu cầu báo giá nhận được — Seller
// P5.01–P5.02
// ============================================================

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { FileText, Clock, CheckCircle2, Inbox, Timer } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent } from '../ui/card';
import { DataTable } from '../shared/DataTable';
import { FilterBar } from '../shared/FilterBar';
import { StatusBadge } from '../shared/StatusBadge';
import { AppBreadcrumb } from '../shared/AppBreadcrumb';
import { rfqApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import type { RFQ, PaginationParams, SortParams, ActiveFilter, FilterConfig, ColumnConfig } from '../../types';

// P5.01: Urgency helpers
function daysUntil(dateStr: string): number {
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000);
}

function UrgencyBadge({ expiresAt, status }: { expiresAt: string; status: string }) {
  if (status !== 'Đã gửi' && status !== 'Đang báo giá') return null;
  const days = daysUntil(expiresAt);
  if (days < 0) return <Badge variant="destructive" className="shrink-0">Hết hạn</Badge>;
  if (days <= 1) return <Badge variant="destructive" className="shrink-0 animate-pulse">Gấp · {days <= 0 ? 'Hôm nay' : '1 ngày'}</Badge>;
  if (days <= 3) return <Badge className="bg-amber-500 text-white shrink-0"><Timer className="h-3 w-3 mr-1" />{days} ngày</Badge>;
  return null;
}

// P5.02: Deadline progress bar
function DeadlineBar({ createdAt, expiresAt }: { createdAt: string; expiresAt: string }) {
  const total = new Date(expiresAt).getTime() - new Date(createdAt).getTime();
  const elapsed = Date.now() - new Date(createdAt).getTime();
  const pct = Math.min(100, Math.max(0, (elapsed / total) * 100));
  const color = pct > 80 ? 'bg-red-500' : pct > 50 ? 'bg-amber-500' : 'bg-green-500';
  return (
    <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
      <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${pct}%` }} />
    </div>
  );
}

interface RFQRow extends RFQ {
  itemCount: number;
}

const columns: ColumnConfig[] = [
  { key: 'rfqNumber', label: 'Mã YCBG', visible: true, sortable: true },
  { key: 'buyerName', label: 'Người mua', visible: true, sortable: true,
    render: (r: RFQRow) => (
      <div>
        <p>{r.buyerName}</p>
        <p className="text-xs text-muted-foreground">{r.buyerCompany}</p>
      </div>
    ),
  },
  { key: 'itemCount', label: 'Số SP', visible: true, sortable: false,
    render: (r: RFQRow) => (
      <span>{r.itemCount} SP</span>
    ),
  },
  { key: 'status', label: 'Trạng thái', visible: true, sortable: true,
    render: (r: RFQRow) => (
      <div className="flex items-center gap-1.5">
        <StatusBadge status={r.status} />
        <UrgencyBadge expiresAt={r.expiresAt} status={r.status} />
      </div>
    ),
  },
  { key: 'expiresAt', label: 'Hết hạn', visible: true, sortable: true,
    render: (r: RFQRow) => {
      const days = daysUntil(r.expiresAt);
      return (
        <div className="space-y-1">
          <span className={days <= 3 ? 'text-red-600' : 'text-muted-foreground'}>{r.expiresAt}</span>
          <DeadlineBar createdAt={r.createdAt} expiresAt={r.expiresAt} />
        </div>
      );
    },
  },
  { key: 'createdAt', label: 'Ngày tạo', visible: true, sortable: true },
];

const filterConfigs: FilterConfig[] = [
  {
    key: 'status', label: 'Trạng thái', type: 'select', options: [
      { label: 'Đã gửi', value: 'Đã gửi' },
      { label: 'Đang báo giá', value: 'Đang báo giá' },
      { label: 'Đã báo giá', value: 'Đã báo giá' },
      { label: 'Chấp nhận', value: 'Chấp nhận' },
      { label: 'Từ chối', value: 'Từ chối' },
      { label: 'Hết hạn', value: 'Hết hạn' },
    ],
  },
];

export function SellerRFQList() {
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

  const supplierId = user?.supplierId;

  const fetchData = useCallback(async () => {
    if (!supplierId) return;
    setLoading(true);
    try {
      const sellerRfqs = await rfqApi.getBySeller(supplierId);
      setAllRfqs(sellerRfqs);

      // Lọc local theo search & filters
      let filtered = [...sellerRfqs];
      if (search) {
        const s = search.toLowerCase();
        filtered = filtered.filter(r =>
          r.rfqNumber.toLowerCase().includes(s) ||
          r.buyerName.toLowerCase().includes(s) ||
          r.buyerCompany.toLowerCase().includes(s) ||
          r.items.some(item => item.productName.toLowerCase().includes(s)),
        );
      }
      if (filters.length > 0) {
        filtered = filtered.filter(r =>
          filters.every(f => String((r as unknown as Record<string, unknown>)[f.key]) === String(f.value)),
        );
      }

      // Sort
      if (sort.field) {
        filtered.sort((a, b) => {
          const aVal = String((a as unknown as Record<string, unknown>)[sort.field] ?? '');
          const bVal = String((b as unknown as Record<string, unknown>)[sort.field] ?? '');
          return sort.direction === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
        });
      }

      setTotal(filtered.length);

      // Paginate
      const start = (pagination.page - 1) * pagination.pageSize;
      const pageData = filtered.slice(start, start + pagination.pageSize);
      setRfqs(pageData.map(r => ({ ...r, itemCount: r.items.length })));
    } finally {
      setLoading(false);
    }
  }, [supplierId, pagination, sort, filters, search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const stats = useMemo(() => {
    const t = allRfqs.length;
    const newRfqs = allRfqs.filter(r => r.status === 'Đã gửi').length;
    const inProgress = allRfqs.filter(r => r.status === 'Đang báo giá' || r.status === 'Đã báo giá').length;
    const accepted = allRfqs.filter(r => r.status === 'Chấp nhận').length;
    return [
      { label: 'Tổng nhận', value: t, icon: Inbox, color: 'text-blue-500' },
      { label: 'Mới', value: newRfqs, icon: FileText, color: 'text-yellow-500' },
      { label: 'Đang xử lý', value: inProgress, icon: Clock, color: 'text-purple-500' },
      { label: 'Đã chấp nhận', value: accepted, icon: CheckCircle2, color: 'text-green-500' },
    ];
  }, [allRfqs]);

  const renderGridCard = (rfq: RFQRow) => (
    <Card
      key={rfq.id}
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => navigate(`/seller/rfq/${rfq.id}`)}
    >
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <span className="font-mono text-sm">{rfq.rfqNumber}</span>
          <div className="flex items-center gap-1">
            <StatusBadge status={rfq.status} />
            <UrgencyBadge expiresAt={rfq.expiresAt} status={rfq.status} />
          </div>
        </div>
        <div>
          <p className="truncate">{rfq.buyerCompany}</p>
          <p className="text-sm text-muted-foreground">{rfq.buyerName}</p>
        </div>
        {/* P5.02: SP list preview */}
        <div className="text-xs text-muted-foreground space-y-0.5">
          {rfq.items.slice(0, 3).map((item, i) => (
            <p key={i} className="truncate">• {item.productName} × {item.quantity}</p>
          ))}
          {rfq.items.length > 3 && <p>+{rfq.items.length - 3} SP khác</p>}
        </div>
        {/* Deadline bar */}
        <DeadlineBar createdAt={rfq.createdAt} expiresAt={rfq.expiresAt} />
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{rfq.itemCount} sản phẩm</span>
          <span>Hết hạn: {rfq.expiresAt}</span>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <AppBreadcrumb items={[{ label: 'Kênh người bán', href: '/seller' }, { label: 'Yêu cầu báo giá' }]} />

      <div>
        <h1>Yêu cầu báo giá nhận được</h1>
        <p className="text-muted-foreground">Xem và phản hồi các yêu cầu báo giá từ người mua</p>
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
        searchPlaceholder="Tìm mã YCBG, người mua, sản phẩm..."
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
        onRowClick={rfq => navigate(`/seller/rfq/${rfq.id}`)}
        getId={rfq => rfq.id}
        loading={loading}
        viewModes={['table', 'grid']}
        defaultViewMode="table"
        renderGridCard={renderGridCard}
        renderActions={rfq => (
          <Button variant="ghost" size="sm" onClick={e => { e.stopPropagation(); navigate(`/seller/rfq/${rfq.id}`); }}>
            {rfq.status === 'Đã gửi' ? 'Báo giá' : 'Xem'}
          </Button>
        )}
      />
    </div>
  );
}
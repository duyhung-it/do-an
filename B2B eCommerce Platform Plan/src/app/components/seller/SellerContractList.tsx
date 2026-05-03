// ============================================================
// Danh sách hợp đồng — Seller
// ============================================================

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { FileText, Clock, CheckCircle2, ScrollText, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { DataTable } from '../shared/DataTable';
import { FilterBar } from '../shared/FilterBar';
import { AppBreadcrumb } from '../shared/AppBreadcrumb';
import { contractApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import type { Contract, PaginationParams, SortParams, ActiveFilter, FilterConfig, ColumnConfig } from '../../types';

const formatPrice = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

const columns: ColumnConfig[] = [
  { key: 'contractNumber', label: 'Số HĐ', visible: true, sortable: true },
  { key: 'buyerName', label: 'Người mua', visible: true, sortable: true,
    render: (c: ContractRow) => (
      <div>
        <p>{c.buyerName}</p>
        <p className="text-xs text-muted-foreground">{c.buyerCompany}</p>
      </div>
    ),
  },
  { key: 'totalAmountFormatted', label: 'Giá trị', visible: true, sortable: false,
    render: (c: ContractRow) => <span className="text-primary">{c.totalAmountFormatted}</span>,
  },
  { key: 'status', label: 'Trạng thái', visible: true, sortable: true,
    render: (c: ContractRow) => {
      const statusIcon = c.status === 'Đang thực hiện' ? '🟢' : c.status === 'Chờ ký' ? '🟡' : c.status === 'Hoàn thành' ? '✅' : '⛔';
      return (
        <div className="flex items-center gap-1.5">
          <span className="text-xs">{statusIcon}</span>
          <span>{c.status}</span>
        </div>
      );
    },
  },
  { key: 'startDate', label: 'Bắt đầu', visible: true, sortable: true },
  { key: 'endDate', label: 'Kết thúc', visible: true, sortable: true },
];

const filterConfigs: FilterConfig[] = [
  {
    key: 'status', label: 'Trạng thái', type: 'select', options: [
      { label: 'Chờ ký', value: 'Chờ ký' },
      { label: 'Đang thực hiện', value: 'Đang thực hiện' },
      { label: 'Hoàn thành', value: 'Hoàn thành' },
      { label: 'Đã huỷ', value: 'Đã huỷ' },
    ],
  },
];

interface ContractRow extends Contract {
  totalAmountFormatted: string;
}

export function SellerContractList() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [data, setData] = useState<ContractRow[]>([]);
  const [allContracts, setAllContracts] = useState<Contract[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationParams>({ page: 1, pageSize: 10 });
  const [sort, setSort] = useState<SortParams>({ field: 'createdAt', direction: 'desc' });
  const [filters, setFilters] = useState<ActiveFilter[]>([]);
  const [search, setSearch] = useState('');

  const fetchData = useCallback(async () => {
    if (!user?.supplierId) return;
    setLoading(true);
    try {
      const all = await contractApi.getBySeller(user.supplierId);
      setAllContracts(all);

      let filtered = [...all];
      if (search) {
        const s = search.toLowerCase();
        filtered = filtered.filter(c =>
          c.contractNumber.toLowerCase().includes(s) ||
          c.buyerName.toLowerCase().includes(s) ||
          c.buyerCompany.toLowerCase().includes(s),
        );
      }
      if (filters.length > 0) {
        filtered = filtered.filter(c =>
          filters.every(f => String((c as unknown as Record<string, unknown>)[f.key]) === String(f.value)),
        );
      }
      if (sort.field) {
        filtered.sort((a, b) => {
          const aV = String((a as unknown as Record<string, unknown>)[sort.field] ?? '');
          const bV = String((b as unknown as Record<string, unknown>)[sort.field] ?? '');
          return sort.direction === 'asc' ? aV.localeCompare(bV) : bV.localeCompare(aV);
        });
      }
      setTotal(filtered.length);
      const start = (pagination.page - 1) * pagination.pageSize;
      setData(filtered.slice(start, start + pagination.pageSize).map(c => ({
        ...c,
        totalAmountFormatted: formatPrice(c.totalAmount),
      })));
    } finally {
      setLoading(false);
    }
  }, [user, pagination, sort, filters, search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const stats = useMemo(() => {
    const t = allContracts.length;
    const active = allContracts.filter(c => c.status === 'Đang thực hiện').length;
    const pending = allContracts.filter(c => c.status === 'Chờ ký').length;
    const done = allContracts.filter(c => c.status === 'Hoàn thành').length;
    const totalRevenue = allContracts.reduce((s, c) => s + c.totalAmount, 0);
    return {
      cards: [
        { label: 'Tổng HĐ', value: t, icon: ScrollText, color: 'text-blue-500' },
        { label: 'Chờ ký', value: pending, icon: Clock, color: 'text-yellow-500' },
        { label: 'Đang thực hiện', value: active, icon: FileText, color: 'text-indigo-500' },
        { label: 'Hoàn thành', value: done, icon: CheckCircle2, color: 'text-green-500' },
      ],
      totalRevenue,
    };
  }, [allContracts]);

  // P5.05: Grid card with revenue bar
  const maxContractValue = useMemo(() =>
    Math.max(...allContracts.map(c => c.totalAmount), 1),
  [allContracts]);

  const renderGridCard = (c: ContractRow) => {
    const revPct = Math.round((c.totalAmount / maxContractValue) * 100);
    return (
      <Card
        key={c.id}
        className="cursor-pointer hover:shadow-md transition-shadow"
        onClick={() => navigate(`/seller/contracts/${c.id}`)}
      >
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-mono text-sm">{c.contractNumber}</span>
            <Badge variant={
              c.status === 'Đang thực hiện' ? 'default' :
              c.status === 'Chờ ký' ? 'secondary' :
              c.status === 'Hoàn thành' ? 'outline' : 'destructive'
            }>{c.status}</Badge>
          </div>
          <div>
            <p className="truncate">{c.buyerCompany}</p>
            <p className="text-sm text-muted-foreground">{c.buyerName}</p>
          </div>
          <p className="text-primary text-lg">{formatPrice(c.totalAmount)}</p>
          {/* Revenue bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Doanh thu tương đối</span>
              <span>{revPct}%</span>
            </div>
            <Progress value={revPct} className="h-1.5" />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{c.startDate}</span>
            <span>{c.endDate}</span>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <AppBreadcrumb items={[{ label: 'Kênh người bán', href: '/seller' }, { label: 'Hợp đồng' }]} />

      <div>
        <h1>Hợp đồng</h1>
        <p className="text-muted-foreground">Quản lý hợp đồng với người mua</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.cards.map(s => (
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
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <TrendingUp className="h-8 w-8 text-green-500" />
            <div>
              <p className="text-2xl">{formatPrice(stats.totalRevenue)}</p>
              <p className="text-muted-foreground">Doanh thu tổng cộng</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <FilterBar
        filters={filterConfigs}
        activeFilters={filters}
        onFilterChange={f => { setFilters(f); setPagination(p => ({ ...p, page: 1 })); }}
        searchValue={search}
        onSearchChange={v => { setSearch(v); setPagination(p => ({ ...p, page: 1 })); }}
        searchPlaceholder="Tìm số HĐ, người mua..."
      />

      <DataTable<ContractRow>
        data={data}
        columns={columns}
        totalItems={total}
        pagination={pagination}
        sort={sort}
        onPaginationChange={setPagination}
        onSortChange={setSort}
        onRowClick={c => navigate(`/seller/contracts/${c.id}`)}
        getId={c => c.id}
        loading={loading}
        viewModes={['table', 'grid']}
        defaultViewMode="table"
        renderGridCard={renderGridCard}
        renderActions={c => (
          <Button variant="ghost" size="sm" onClick={e => { e.stopPropagation(); navigate(`/seller/contracts/${c.id}`); }}>
            Xem
          </Button>
        )}
      />
    </div>
  );
}
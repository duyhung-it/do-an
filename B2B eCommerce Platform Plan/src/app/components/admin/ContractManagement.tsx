// ============================================================
// Quản lý hợp đồng — Admin — Nâng cấp Nhóm 14B (Đợt 7)
// Đóng trước hạn, gia hạn, biểu đồ, CSV, cảnh báo
// ============================================================

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ScrollText, Clock, CheckCircle2, Download, AlertTriangle,
  XOctagon, CalendarPlus,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { DataTable } from '../shared/DataTable';
import { FilterBar } from '../shared/FilterBar';
import { StatusBadge } from '../shared/StatusBadge';
import { AppBreadcrumb } from '../shared/AppBreadcrumb';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '../ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Separator } from '../ui/separator';
import { Progress } from '../ui/progress';
import { contractApi } from '../../services/api';
import { toast } from 'sonner';
import type { Contract, PaginationParams, SortParams, ActiveFilter, FilterConfig, ColumnConfig } from '../../types';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, Legend,
} from 'recharts';

const STATUS_COLORS: Record<string, string> = {
  'Bản nháp': '#94a3b8', 'Chờ ký': '#f59e0b', 'Đang thực hiện': '#3b82f6',
  'Hoàn thành': '#22c55e', 'Đã huỷ': '#ef4444', 'Tranh chấp': '#f97316',
};

const formatPrice = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);
const formatCompact = (n: number) =>
  new Intl.NumberFormat('vi-VN', { notation: 'compact' }).format(n);

const columns: ColumnConfig[] = [
  { key: 'contractNumber', label: 'Số HĐ', visible: true, sortable: true },
  { key: 'buyerCompany', label: 'Bên mua', visible: true, sortable: true },
  { key: 'supplierName', label: 'Bên bán', visible: true, sortable: true },
  { key: 'totalAmountFormatted', label: 'Giá trị', visible: true, sortable: false },
  { key: 'status', label: 'Trạng thái', visible: true, sortable: true },
  { key: 'startDate', label: 'Bắt đầu', visible: true, sortable: true },
  { key: 'endDate', label: 'Kết thúc', visible: true, sortable: true },
  { key: 'signed', label: 'Ký', visible: true, sortable: false },
];

const filterConfigs: FilterConfig[] = [
  { key: 'status', label: 'Trạng thái', type: 'select', options: [
    { label: 'Bản nháp', value: 'Bản nháp' },
    { label: 'Chờ ký', value: 'Chờ ký' },
    { label: 'Đang thực hiện', value: 'Đang thực hiện' },
    { label: 'Hoàn thành', value: 'Hoàn thành' },
    { label: 'Đã huỷ', value: 'Đã huỷ' },
    { label: 'Tranh chấp', value: 'Tranh chấp' },
  ]},
];

interface ContractRow extends Contract {
  totalAmountFormatted: string;
  signed: string;
}

export function ContractManagement() {
  const [data, setData] = useState<ContractRow[]>([]);
  const [allContracts, setAllContracts] = useState<Contract[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationParams>({ page: 1, pageSize: 10 });
  const [sort, setSort] = useState<SortParams>({ field: 'createdAt', direction: 'desc' });
  const [filters, setFilters] = useState<ActiveFilter[]>([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<ContractRow | null>(null);

  // Close early dialog
  const [closeDialog, setCloseDialog] = useState<ContractRow | null>(null);
  const [closeReason, setCloseReason] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await contractApi.getPaginated(pagination, sort, filters, search);
      setTotal(res.total);
      setData(res.data.map(c => ({
        ...c,
        totalAmountFormatted: formatPrice(c.totalAmount),
        signed: `${c.signedByBuyer ? 'Mua ✓' : 'Mua ✗'} / ${c.signedBySeller ? 'Bán ✓' : 'Bán ✗'}`,
      })));
      const allRes = await contractApi.getPaginated({ page: 1, pageSize: 1000 });
      setAllContracts(allRes.data);
    } finally {
      setLoading(false);
    }
  }, [pagination, sort, filters, search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Stats
  const stats = useMemo(() => {
    const t = allContracts.length;
    const active = allContracts.filter(c => c.status === 'Đang thực hiện').length;
    const done = allContracts.filter(c => c.status === 'Hoàn thành').length;
    const disputed = allContracts.filter(c => c.status === 'Tranh chấp').length;
    const totalValue = allContracts.reduce((s, c) => s + c.totalAmount, 0);
    return { t, active, done, disputed, totalValue };
  }, [allContracts]);

  // Chart: by status
  const statusChart = useMemo(() => {
    const map: Record<string, number> = {};
    for (const c of allContracts) map[c.status] = (map[c.status] || 0) + 1;
    return Object.entries(map).map(([name, value]) => ({ name, value, fill: STATUS_COLORS[name] || '#6b7280' }));
  }, [allContracts]);

  // Expiring warnings
  const expiringSoon = useMemo(() => {
    const now = new Date();
    const in30days = new Date(now.getTime() + 30 * 86400000);
    return allContracts.filter(c =>
      c.status === 'Đang thực hiện' &&
      new Date(c.endDate) <= in30days && new Date(c.endDate) >= now,
    );
  }, [allContracts]);

  const disputedContracts = allContracts.filter(c => c.status === 'Tranh chấp');

  // Admin actions
  const handleCloseEarly = () => {
    if (!closeDialog || !closeReason.trim()) { toast.error('Vui lòng nhập lý do'); return; }
    toast.success(`Đã đóng hợp đồng ${closeDialog.contractNumber} trước hạn (giả lập)`);
    setCloseDialog(null);
    setCloseReason('');
    setSelected(null);
  };

  const handleExtend = (c: ContractRow) => {
    toast.success(`Đã gia hạn hợp đồng ${c.contractNumber} thêm 30 ngày (giả lập)`);
  };

  // CSV Export
  const handleExportCSV = () => {
    const headers = ['Số HĐ', 'Bên mua', 'Bên bán', 'Giá trị', 'Trạng thái', 'Bắt đầu', 'Kết thúc'];
    const rows = allContracts.map(c => [c.contractNumber, c.buyerCompany, c.supplierName, c.totalAmount.toString(), c.status, c.startDate, c.endDate]);
    const csvContent = [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `hop-dong-${new Date().toISOString().slice(0, 10)}.csv`; a.click();
    URL.revokeObjectURL(url);
    toast.success('Đã xuất file CSV');
  };

  return (
    <div className="space-y-6">
      <AppBreadcrumb items={[{ label: 'Quản trị', href: '/admin' }, { label: 'Hợp đồng' }]} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1>Quản lý hợp đồng</h1>
          <p className="text-muted-foreground">Giám sát tất cả hợp đồng trên hệ thống</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleExportCSV}>
          <Download className="mr-1 h-4 w-4" /> Xuất CSV
        </Button>
      </div>

      {/* Cảnh báo */}
      {(expiringSoon.length > 0 || disputedContracts.length > 0) && (
        <div className="flex flex-wrap gap-3">
          {expiringSoon.length > 0 && (
            <Card className="border-orange-200 bg-orange-50/50 flex-1">
              <CardContent className="p-3 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-600 shrink-0" />
                <span className="text-orange-800">{expiringSoon.length} hợp đồng sắp hết hạn (30 ngày)</span>
              </CardContent>
            </Card>
          )}
          {disputedContracts.length > 0 && (
            <Card className="border-red-200 bg-red-50/50 flex-1">
              <CardContent className="p-3 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600 shrink-0" />
                <span className="text-red-800">{disputedContracts.length} hợp đồng đang tranh chấp</span>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Stats + Chart */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Card><CardContent className="p-4">
          <p className="text-muted-foreground">Tổng HĐ</p>
          <p className="text-2xl">{stats.t}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-muted-foreground">Đang thực hiện</p>
          <p className="text-2xl text-blue-600">{stats.active}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-muted-foreground">Hoàn thành</p>
          <p className="text-2xl text-green-600">{stats.done}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-muted-foreground">Tổng giá trị</p>
          <p className="text-lg text-primary">{formatCompact(stats.totalValue)} ₫</p>
        </CardContent></Card>
        <Card><CardContent className="p-3">
          <p className="text-muted-foreground mb-1">Theo trạng thái</p>
          <div className="h-20">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusChart} layout="vertical">
                <XAxis key="xaxis-contract" type="number" hide />
                <YAxis key="yaxis-contract" dataKey="name" type="category" tick={{ fontSize: 9 }} width={70} />
                <Tooltip key="tooltip-contract" />
                <Bar key="bar-contract" dataKey="value" radius={[0, 4, 4, 0]}>
                  {statusChart.map((entry, i) => <Cell key={`cell-contract-${i}-${entry.name}`} fill={entry.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent></Card>
      </div>

      <FilterBar
        filters={filterConfigs}
        activeFilters={filters}
        onFilterChange={f => { setFilters(f); setPagination(p => ({ ...p, page: 1 })); }}
        searchValue={search}
        onSearchChange={v => { setSearch(v); setPagination(p => ({ ...p, page: 1 })); }}
        searchPlaceholder="Tìm số HĐ, bên mua, bên bán..."
      />

      <DataTable<ContractRow>
        data={data}
        columns={columns}
        totalItems={total}
        pagination={pagination}
        sort={sort}
        onPaginationChange={setPagination}
        onSortChange={setSort}
        onRowClick={c => setSelected(c)}
        getId={c => c.id}
        loading={loading}
        viewModes={['table']}
        defaultViewMode="table"
        renderActions={c => (
          <Button variant="ghost" size="sm" onClick={e => { e.stopPropagation(); setSelected(c); }}>
            Chi tiết
          </Button>
        )}
      />

      {/* Detail Dialog */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  {selected.contractNumber}
                  <StatusBadge status={selected.status} />
                </DialogTitle>
                <DialogDescription>
                  {selected.buyerCompany} ↔ {selected.supplierName}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {/* Admin actions */}
                <div className="flex flex-wrap gap-2">
                  {selected.status === 'Đang thực hiện' && (
                    <>
                      <Button size="sm" variant="outline" className="text-red-600" onClick={() => setCloseDialog(selected)}>
                        <XOctagon className="mr-1 h-3.5 w-3.5" /> Đóng trước hạn
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleExtend(selected)}>
                        <CalendarPlus className="mr-1 h-3.5 w-3.5" /> Gia hạn +30 ngày
                      </Button>
                    </>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <InfoBlock label="Bên mua" value={`${selected.buyerName} (${selected.buyerCompany})`} />
                  <InfoBlock label="Bên bán" value={selected.supplierName} />
                  <InfoBlock label="Bắt đầu — Kết thúc" value={`${selected.startDate} → ${selected.endDate}`} />
                  <InfoBlock label="Giao hàng" value={selected.deliveryDate} />
                  <InfoBlock label="Thanh toán" value={selected.paymentTerms} />
                  <InfoBlock label="Vận chuyển" value={selected.shippingTerms} />
                </div>

                <div className="flex gap-4">
                  <Badge variant={selected.signedByBuyer ? 'default' : 'secondary'}>
                    Bên mua: {selected.signedByBuyer ? 'Đã ký' : 'Chưa ký'}
                  </Badge>
                  <Badge variant={selected.signedBySeller ? 'default' : 'secondary'}>
                    Bên bán: {selected.signedBySeller ? 'Đã ký' : 'Chưa ký'}
                  </Badge>
                  {selected.signedAt && <span className="text-muted-foreground">Ký ngày: {selected.signedAt}</span>}
                </div>

                <Separator />

                <div>
                  <h3 className="mb-2">Hàng hoá ({selected.items.length})</h3>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Sản phẩm</TableHead>
                          <TableHead className="text-right">SL</TableHead>
                          <TableHead>ĐVT</TableHead>
                          <TableHead className="text-right">Đơn giá</TableHead>
                          <TableHead className="text-right">Thành tiền</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selected.items.map((item, idx) => (
                          <TableRow key={item.id ?? idx}>
                            <TableCell>{item.productName}</TableCell>
                            <TableCell className="text-right">{item.quantity.toLocaleString()}</TableCell>
                            <TableCell>{item.unit}</TableCell>
                            <TableCell className="text-right">{formatPrice(item.unitPrice)}</TableCell>
                            <TableCell className="text-right">{formatPrice(item.totalPrice)}</TableCell>
                          </TableRow>
                        ))}
                        <TableRow>
                          <TableCell colSpan={4} className="text-right font-medium">Tổng</TableCell>
                          <TableCell className="text-right font-medium">{formatPrice(selected.totalAmount)}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </div>

                {selected.milestones.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h3>Mốc tiến độ ({selected.milestones.length})</h3>
                        <span className="text-muted-foreground">
                          {selected.milestones.filter(m => m.status === 'Hoàn thành').length}/{selected.milestones.length}
                        </span>
                      </div>
                      <Progress
                        value={selected.milestones.length > 0
                          ? Math.round((selected.milestones.filter(m => m.status === 'Hoàn thành').length / selected.milestones.length) * 100)
                          : 0}
                        className="mb-3"
                      />
                      {selected.milestones.map(ms => (
                        <div key={ms.id} className="flex items-center justify-between p-2 border-b last:border-0">
                          <div>
                            <p>{ms.title}</p>
                            <p className="text-muted-foreground">Hạn: {ms.dueDate}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            {ms.amount > 0 && <span className="text-muted-foreground">{formatPrice(ms.amount)}</span>}
                            <StatusBadge status={ms.status} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {selected.notes && (
                  <div className="bg-muted p-3 rounded-md">
                    <p className="text-muted-foreground">Ghi chú: {selected.notes}</p>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Close early dialog */}
      <Dialog open={!!closeDialog} onOpenChange={() => { setCloseDialog(null); setCloseReason(''); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle className="text-destructive">Đóng hợp đồng trước hạn</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <p className="text-muted-foreground">Đóng hợp đồng <strong>{closeDialog?.contractNumber}</strong></p>
            <div className="grid gap-2">
              <Label>Lý do đóng *</Label>
              <Textarea value={closeReason} onChange={e => setCloseReason(e.target.value)} placeholder="Nhập lý do..." rows={3} />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => { setCloseDialog(null); setCloseReason(''); }}>Huỷ</Button>
              <Button variant="destructive" onClick={handleCloseEarly} disabled={!closeReason.trim()}>Đóng hợp đồng</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-muted-foreground">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}
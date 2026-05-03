// ============================================================
// Quản lý yêu cầu báo giá — Admin — Nâng cấp Nhóm 14A (Đợt 7)
// Admin actions, biểu đồ, CSV, cảnh báo hết hạn
// ============================================================

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  FileText, Clock, CheckCircle2, XCircle, Download, AlertTriangle,
  XOctagon, CalendarPlus,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { DataTable } from '../shared/DataTable';
import { FilterBar } from '../shared/FilterBar';
import { StatusBadge } from '../shared/StatusBadge';
import { AppBreadcrumb } from '../shared/AppBreadcrumb';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '../ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Separator } from '../ui/separator';
import { rfqApi, quotationApi } from '../../services/api';
import { toast } from 'sonner';
import type { RFQ, Quotation, PaginationParams, SortParams, ActiveFilter, FilterConfig, ColumnConfig } from '../../types';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
} from 'recharts';

const COLORS = ['#94a3b8', '#3b82f6', '#f59e0b', '#22c55e', '#8b5cf6', '#ef4444', '#6b7280'];

const formatPrice = (price: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

const columns: ColumnConfig[] = [
  { key: 'rfqNumber', label: 'Mã YCBG', visible: true, sortable: true },
  { key: 'buyerName', label: 'Người mua', visible: true, sortable: true },
  { key: 'buyerCompany', label: 'Công ty mua', visible: true, sortable: true },
  { key: 'supplierName', label: 'Nhà cung cấp', visible: true, sortable: true },
  { key: 'itemCount', label: 'Số SP', visible: true, sortable: false },
  { key: 'quotationCount', label: 'Báo giá', visible: true, sortable: false },
  { key: 'status', label: 'Trạng thái', visible: true, sortable: true },
  { key: 'createdAt', label: 'Ngày tạo', visible: true, sortable: true },
  { key: 'expiresAt', label: 'Hết hạn', visible: true, sortable: true },
];

const filterConfigs: FilterConfig[] = [
  { key: 'status', label: 'Trạng thái', type: 'select', options: [
    { label: 'Bản nháp', value: 'Bản nháp' },
    { label: 'Đã gửi', value: 'Đã gửi' },
    { label: 'Đang báo giá', value: 'Đang báo giá' },
    { label: 'Đã báo giá', value: 'Đã báo giá' },
    { label: 'Chấp nhận', value: 'Chấp nhận' },
    { label: 'Từ chối', value: 'Từ chối' },
    { label: 'Hết hạn', value: 'Hết hạn' },
  ]},
];

interface RFQRow extends RFQ {
  itemCount: number;
  quotationCount: number;
}

export function RFQManagement() {
  const [rfqs, setRfqs] = useState<RFQRow[]>([]);
  const [allRfqs, setAllRfqs] = useState<RFQ[]>([]);
  const [quotationMap, setQuotationMap] = useState<Record<string, Quotation[]>>({});
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationParams>({ page: 1, pageSize: 10 });
  const [sort, setSort] = useState<SortParams>({ field: 'createdAt', direction: 'desc' });
  const [filters, setFilters] = useState<ActiveFilter[]>([]);
  const [search, setSearch] = useState('');
  const [selectedRFQ, setSelectedRFQ] = useState<RFQRow | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await rfqApi.getPaginated(pagination, sort, filters, search);
      setTotal(res.total);
      const qMap: Record<string, Quotation[]> = {};
      await Promise.all(res.data.map(async (rfq) => { qMap[rfq.id] = await quotationApi.getByRFQ(rfq.id); }));
      setQuotationMap(prev => ({ ...prev, ...qMap }));
      setRfqs(res.data.map(r => ({ ...r, itemCount: r.items.length, quotationCount: qMap[r.id]?.length ?? 0 })));
      const allRes = await rfqApi.getPaginated({ page: 1, pageSize: 1000 });
      setAllRfqs(allRes.data);
    } finally {
      setLoading(false);
    }
  }, [pagination, sort, filters, search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Stats
  const stats = useMemo(() => {
    const t = allRfqs.length;
    const active = allRfqs.filter(r => ['Đã gửi', 'Đang báo giá', 'Đã báo giá'].includes(r.status)).length;
    const accepted = allRfqs.filter(r => r.status === 'Chấp nhận').length;
    const rejected = allRfqs.filter(r => r.status === 'Từ chối').length;
    const expired = allRfqs.filter(r => r.status === 'Hết hạn').length;
    return [
      { label: 'Tổng YCBG', value: t, icon: FileText, color: 'text-blue-500' },
      { label: 'Đang xử lý', value: active, icon: Clock, color: 'text-yellow-500' },
      { label: 'Chấp nhận', value: accepted, icon: CheckCircle2, color: 'text-green-500' },
      { label: 'Từ chối / Hết hạn', value: rejected + expired, icon: XCircle, color: 'text-red-500' },
    ];
  }, [allRfqs]);

  // PieChart by status
  const statusChart = useMemo(() => {
    const map: Record<string, number> = {};
    for (const r of allRfqs) map[r.status] = (map[r.status] || 0) + 1;
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [allRfqs]);

  // Expiring soon warnings
  const expiringSoon = useMemo(() => {
    const now = new Date();
    const in7days = new Date(now.getTime() + 7 * 86400000);
    return allRfqs.filter(r =>
      ['Đã gửi', 'Đang báo giá'].includes(r.status) &&
      new Date(r.expiresAt) <= in7days && new Date(r.expiresAt) >= now,
    );
  }, [allRfqs]);

  const selectedQuotations = selectedRFQ ? (quotationMap[selectedRFQ.id] ?? []) : [];

  // Admin actions
  const handleCloseRFQ = (rfq: RFQRow) => {
    toast.success(`Đã đóng YCBG ${rfq.rfqNumber} (giả lập)`);
    setSelectedRFQ(null);
  };
  const handleExtendRFQ = (rfq: RFQRow) => {
    toast.success(`Đã gia hạn YCBG ${rfq.rfqNumber} thêm 14 ngày (giả lập)`);
  };

  // CSV Export
  const handleExportCSV = () => {
    const headers = ['Mã YCBG', 'Người mua', 'Công ty', 'NCC', 'Số SP', 'Trạng thái', 'Ngày tạo', 'Hết hạn'];
    const rows = allRfqs.map(r => [r.rfqNumber, r.buyerName, r.buyerCompany, r.supplierName ?? '', r.items.length.toString(), r.status, r.createdAt, r.expiresAt]);
    const csvContent = [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `ycbg-${new Date().toISOString().slice(0, 10)}.csv`; a.click();
    URL.revokeObjectURL(url);
    toast.success('Đã xuất file CSV');
  };

  return (
    <div className="space-y-6">
      <AppBreadcrumb items={[{ label: 'Quản trị', href: '/admin' }, { label: 'Yêu cầu báo giá' }]} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1>Quản lý yêu cầu báo giá</h1>
          <p className="text-muted-foreground">Giám sát tất cả YCBG trên hệ thống</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleExportCSV}>
          <Download className="mr-1 h-4 w-4" /> Xuất CSV
        </Button>
      </div>

      {/* Cảnh báo */}
      {expiringSoon.length > 0 && (
        <Card className="border-orange-200 bg-orange-50/50">
          <CardContent className="p-3 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-600 shrink-0" />
            <span className="text-orange-800">
              {expiringSoon.length} YCBG sắp hết hạn (trong 7 ngày) chưa có báo giá
            </span>
          </CardContent>
        </Card>
      )}

      {/* Stats + Chart */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
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
        <Card>
          <CardContent className="p-3">
            <p className="text-muted-foreground mb-1">Theo trạng thái</p>
            <div className="h-20">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie key="pie-rfq-status" data={statusChart} cx="50%" cy="50%" outerRadius={35} dataKey="value" label={false}>
                    {statusChart.map((entry, i) => <Cell key={`cell-rfq-${i}-${entry.name}`} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip key="tooltip-rfq-status" />
                </PieChart>
              </ResponsiveContainer>
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
        searchPlaceholder="Tìm mã YCBG, người mua, NCC..."
      />

      <DataTable<RFQRow>
        data={rfqs}
        columns={columns}
        totalItems={total}
        pagination={pagination}
        sort={sort}
        onPaginationChange={setPagination}
        onSortChange={setSort}
        onRowClick={rfq => setSelectedRFQ(rfq)}
        getId={rfq => rfq.id}
        loading={loading}
        viewModes={['table']}
        defaultViewMode="table"
        renderActions={rfq => (
          <Button variant="ghost" size="sm" onClick={e => { e.stopPropagation(); setSelectedRFQ(rfq); }}>
            Chi tiết
          </Button>
        )}
      />

      {/* Detail Dialog */}
      <Dialog open={!!selectedRFQ} onOpenChange={() => setSelectedRFQ(null)}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          {selectedRFQ && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  {selectedRFQ.rfqNumber}
                  <StatusBadge status={selectedRFQ.status} />
                </DialogTitle>
                <DialogDescription>
                  {selectedRFQ.buyerCompany} → {selectedRFQ.supplierName ?? 'Chưa chọn NCC'}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {/* Admin actions */}
                <div className="flex flex-wrap gap-2">
                  {['Đã gửi', 'Đang báo giá', 'Đã báo giá'].includes(selectedRFQ.status) && (
                    <>
                      <Button size="sm" variant="outline" onClick={() => handleCloseRFQ(selectedRFQ)}>
                        <XOctagon className="mr-1 h-3.5 w-3.5" /> Đóng YCBG
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleExtendRFQ(selectedRFQ)}>
                        <CalendarPlus className="mr-1 h-3.5 w-3.5" /> Gia hạn +14 ngày
                      </Button>
                    </>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <InfoBlock label="Người mua" value={`${selectedRFQ.buyerName} (${selectedRFQ.buyerCompany})`} />
                  <InfoBlock label="Nhà cung cấp" value={selectedRFQ.supplierName ?? 'Chưa chọn'} />
                  <InfoBlock label="Ngày giao" value={selectedRFQ.deliveryDate} />
                  <InfoBlock label="Hết hạn" value={selectedRFQ.expiresAt} />
                  <InfoBlock label="Thanh toán" value={selectedRFQ.paymentTerms} />
                  <InfoBlock label="Giao hàng" value={selectedRFQ.shippingTerms} />
                </div>

                {selectedRFQ.notes && (
                  <div className="bg-muted p-3 rounded-md">
                    <p className="text-muted-foreground">Ghi chú: {selectedRFQ.notes}</p>
                  </div>
                )}

                <Separator />

                <div>
                  <h3 className="mb-2">Sản phẩm yêu cầu ({selectedRFQ.items.length})</h3>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Sản phẩm</TableHead>
                          <TableHead className="text-right">SL</TableHead>
                          <TableHead>ĐV</TableHead>
                          <TableHead className="text-right">Giá mục tiêu</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedRFQ.items.map((item, idx) => (
                          <TableRow key={idx}>
                            <TableCell>{item.productName}</TableCell>
                            <TableCell className="text-right">{item.quantity.toLocaleString()}</TableCell>
                            <TableCell>{item.unit}</TableCell>
                            <TableCell className="text-right">{item.targetPrice ? formatPrice(item.targetPrice) : '—'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                {selectedQuotations.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="mb-2">Báo giá ({selectedQuotations.length})</h3>
                      {selectedQuotations.map(q => (
                        <div key={q.id} className="border rounded-lg p-3 mb-3 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{q.supplierName}</span>
                            <StatusBadge status={q.status} />
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <span className="text-muted-foreground">Tổng: {formatPrice(q.totalAmount)}</span>
                            <span className="text-muted-foreground">Giao: {q.deliveryDays} ngày</span>
                            <span className="text-muted-foreground">Hiệu lực: {q.validUntil}</span>
                          </div>
                          {q.notes && <p className="text-muted-foreground">{q.notes}</p>}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </>
          )}
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
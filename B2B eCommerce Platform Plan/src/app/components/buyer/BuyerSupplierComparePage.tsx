// ============================================================
// So sánh NCC & Supplier Scorecard — Nhóm 29B
// RadarChart, bảng so sánh, highlight NCC tốt nhất, responsive
// ============================================================

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router';
import {
  Scale, Trophy, Truck, AlertTriangle, Clock, ShieldCheck,
  BarChart3, Plus, X, Check, ArrowUpDown,
} from 'lucide-react';
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, Legend, Tooltip,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { AppBreadcrumb } from '../shared/AppBreadcrumb';
import { supplierScorecardApi, supplierApi } from '../../services/api';
import type { SupplierScorecard, Supplier } from '../../types';
import { toast } from 'sonner';

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b'];
const MAX_COMPARE = 4;

const scoreCriteria = [
  { key: 'qualityScore', label: 'Chất lượng' },
  { key: 'deliveryScore', label: 'Giao hàng' },
  { key: 'priceScore', label: 'Giá cả' },
  { key: 'communicationScore', label: 'Giao tiếp' },
  { key: 'overallScore', label: 'Tổng hợp' },
] as const;

type CriteriaKey = typeof scoreCriteria[number]['key'];

function getScoreColor(score: number): string {
  if (score >= 90) return 'text-green-600';
  if (score >= 75) return 'text-blue-600';
  if (score >= 60) return 'text-amber-600';
  return 'text-red-600';
}

function getScoreBg(score: number): string {
  if (score >= 90) return 'bg-green-100 text-green-700';
  if (score >= 75) return 'bg-blue-100 text-blue-700';
  if (score >= 60) return 'bg-amber-100 text-amber-700';
  return 'bg-red-100 text-red-700';
}

export function BuyerSupplierComparePage() {
  const [searchParams] = useSearchParams();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [scorecards, setScorecards] = useState<SupplierScorecard[]>([]);
  const [loading, setLoading] = useState(false);

  // Load all suppliers for selection
  useEffect(() => {
    supplierApi.getPaginated({ page: 1, pageSize: 100 }).then(res => setSuppliers(res.data));
  }, []);

  // Pre-select from URL params
  useEffect(() => {
    const ids = searchParams.get('ids');
    if (ids) {
      setSelectedIds(ids.split(',').slice(0, MAX_COMPARE));
    }
  }, [searchParams]);

  // Load scorecards when selection changes
  useEffect(() => {
    if (selectedIds.length === 0) {
      setScorecards([]);
      return;
    }
    setLoading(true);
    supplierScorecardApi.compare(selectedIds)
      .then(setScorecards)
      .finally(() => setLoading(false));
  }, [selectedIds]);

  const addSupplier = (id: string) => {
    if (selectedIds.includes(id)) {
      toast.info('NCC đã được chọn');
      return;
    }
    if (selectedIds.length >= MAX_COMPARE) {
      toast.warning(`Chỉ so sánh tối đa ${MAX_COMPARE} NCC`);
      return;
    }
    setSelectedIds(prev => [...prev, id]);
  };

  const removeSupplier = (id: string) => {
    setSelectedIds(prev => prev.filter(x => x !== id));
  };

  // RadarChart data
  const radarData = useMemo(() => {
    return scoreCriteria.map(c => {
      const point: Record<string, string | number> = { criteria: c.label };
      scorecards.forEach((sc, i) => {
        point[sc.supplierName] = sc[c.key];
      });
      return point;
    });
  }, [scorecards]);

  // Find best per criteria (29B.07)
  const bestPerCriteria = useMemo(() => {
    const result: Record<string, string> = {};
    for (const c of scoreCriteria) {
      let best = '';
      let bestVal = -1;
      for (const sc of scorecards) {
        if (sc[c.key] > bestVal) {
          bestVal = sc[c.key];
          best = sc.supplierId;
        }
      }
      result[c.key] = best;
    }
    // Stats best
    const statKeys = ['onTimeDeliveryRate', 'totalOrders', 'certCount'] as const;
    for (const k of statKeys) {
      let best = '';
      let bestVal = -1;
      for (const sc of scorecards) {
        if (sc[k] > bestVal) { bestVal = sc[k]; best = sc.supplierId; }
      }
      result[k] = best;
    }
    // defectRate — lower is better
    {
      let best = '';
      let bestVal = Infinity;
      for (const sc of scorecards) {
        if (sc.defectRate < bestVal) { bestVal = sc.defectRate; best = sc.supplierId; }
      }
      result['defectRate'] = best;
    }
    return result;
  }, [scorecards]);

  const availableSuppliers = suppliers.filter(s => !selectedIds.includes(s.id));

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <AppBreadcrumb items={[
        { label: 'Trang chủ', href: '/' },
        { label: 'Nhà cung cấp', href: '/suppliers' },
        { label: 'So sánh NCC' },
      ]} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2">
            <Scale className="h-6 w-6 text-primary" />
            So sánh nhà cung cấp
          </h1>
          <p className="text-muted-foreground mt-1">
            So sánh tối đa {MAX_COMPARE} nhà cung cấp theo nhiều tiêu chí
          </p>
        </div>
      </div>

      {/* Supplier selector (29B.02) */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-muted-foreground">Chọn NCC:</span>
            {selectedIds.map((id, i) => {
              const sup = suppliers.find(s => s.id === id);
              return (
                <Badge key={id} variant="secondary" className="px-3 py-1.5 gap-2" style={{ borderLeftColor: COLORS[i], borderLeftWidth: 3 }}>
                  {sup?.companyName ?? id}
                  <button onClick={() => removeSupplier(id)} className="hover:text-destructive">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              );
            })}
            {selectedIds.length < MAX_COMPARE && (
              <Select onValueChange={addSupplier}>
                <SelectTrigger className="w-[220px]">
                  <SelectValue placeholder="+ Thêm NCC..." />
                </SelectTrigger>
                <SelectContent>
                  {availableSuppliers.map(s => (
                    <SelectItem key={s.id} value={s.id}>{s.companyName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </CardContent>
      </Card>

      {scorecards.length === 0 && !loading && (
        <Card>
          <CardContent className="py-16 text-center">
            <Scale className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-lg">Chọn ít nhất 2 nhà cung cấp để so sánh</p>
            <p className="text-muted-foreground mt-1">Sử dụng combobox phía trên để thêm NCC vào danh sách so sánh</p>
          </CardContent>
        </Card>
      )}

      {scorecards.length >= 2 && (
        <>
          {/* RadarChart (29B.04) */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Biểu đồ Radar so sánh
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="80%">
                  <PolarGrid />
                  <PolarAngleAxis dataKey="criteria" />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  {scorecards.map((sc, i) => (
                    <Radar
                      key={sc.supplierId}
                      name={sc.supplierName}
                      dataKey={sc.supplierName}
                      stroke={COLORS[i]}
                      fill={COLORS[i]}
                      fillOpacity={0.15}
                    />
                  ))}
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Comparison table (29B.03) — horizontal scroll mobile (29B.08) */}
          <Card>
            <CardHeader>
              <CardTitle>Bảng so sánh điểm số</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Tiêu chí</th>
                    {scorecards.map((sc, i) => (
                      <th key={sc.supplierId} className="text-center py-3 px-4">
                        <div className="flex flex-col items-center gap-1">
                          <span
                            className="inline-block w-3 h-3 rounded-full"
                            style={{ backgroundColor: COLORS[i] }}
                          />
                          <span className="line-clamp-2">{sc.supplierName}</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {scoreCriteria.map(c => (
                    <tr key={c.key} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4">{c.label}</td>
                      {scorecards.map(sc => {
                        const isBest = bestPerCriteria[c.key] === sc.supplierId;
                        return (
                          <td key={sc.supplierId} className="text-center py-3 px-4">
                            <span className={`inline-flex items-center gap-1 ${getScoreColor(sc[c.key])}`}>
                              {sc[c.key]}
                              {isBest && scorecards.length > 1 && (
                                <Trophy className="h-3.5 w-3.5 text-yellow-500" />
                              )}
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          {/* Statistics comparison (29B.05) */}
          <Card>
            <CardHeader>
              <CardTitle>Thống kê hoạt động</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Chỉ tiêu</th>
                    {scorecards.map((sc, i) => (
                      <th key={sc.supplierId} className="text-center py-3 px-4">
                        <span className="inline-block w-3 h-3 rounded-full mr-1" style={{ backgroundColor: COLORS[i] }} />
                        {sc.supplierName}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <StatRow label="Tổng đơn hàng" scorecards={scorecards} getValue={sc => sc.totalOrders.toString()} bestId={bestPerCriteria.totalOrders} icon={<BarChart3 className="h-4 w-4 text-muted-foreground" />} />
                  <StatRow label="Giao đúng hạn" scorecards={scorecards} getValue={sc => `${sc.onTimeDeliveryRate}%`} bestId={bestPerCriteria.onTimeDeliveryRate} icon={<Truck className="h-4 w-4 text-muted-foreground" />} />
                  <StatRow label="Tỷ lệ lỗi" scorecards={scorecards} getValue={sc => `${sc.defectRate}%`} bestId={bestPerCriteria.defectRate} icon={<AlertTriangle className="h-4 w-4 text-muted-foreground" />} lowerIsBetter />
                  <StatRow label="TG phản hồi TB" scorecards={scorecards} getValue={sc => sc.avgResponseTime} bestId="" icon={<Clock className="h-4 w-4 text-muted-foreground" />} />
                  <StatRow label="Chứng chỉ" scorecards={scorecards} getValue={sc => sc.certCount.toString()} bestId={bestPerCriteria.certCount} icon={<ShieldCheck className="h-4 w-4 text-muted-foreground" />} />
                </tbody>
              </table>
            </CardContent>
          </Card>

          {/* Overall winner card */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {scorecards
              .sort((a, b) => b.overallScore - a.overallScore)
              .map((sc, i) => (
                <Card key={sc.supplierId} className={i === 0 ? 'border-2 border-yellow-400 ring-2 ring-yellow-100' : ''}>
                  <CardContent className="p-4 text-center">
                    {i === 0 && (
                      <Badge className="mb-2 bg-yellow-100 text-yellow-800 border-yellow-300">
                        <Trophy className="h-3 w-3 mr-1" /> NCC tốt nhất
                      </Badge>
                    )}
                    <p className="font-medium line-clamp-2 mb-2">{sc.supplierName}</p>
                    <div className={`text-3xl ${getScoreColor(sc.overallScore)} mb-1`}>
                      {sc.overallScore}
                    </div>
                    <p className="text-muted-foreground">Điểm tổng hợp</p>
                    <div className="mt-3 flex justify-center gap-1">
                      <Badge variant="outline" className={getScoreBg(sc.qualityScore)}>CL: {sc.qualityScore}</Badge>
                      <Badge variant="outline" className={getScoreBg(sc.deliveryScore)}>GH: {sc.deliveryScore}</Badge>
                    </div>
                    <div className="mt-1 flex justify-center gap-1">
                      <Badge variant="outline" className={getScoreBg(sc.priceScore)}>GC: {sc.priceScore}</Badge>
                      <Badge variant="outline" className={getScoreBg(sc.communicationScore)}>GT: {sc.communicationScore}</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </>
      )}

      {/* Show single scorecard when only 1 selected */}
      {scorecards.length === 1 && (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">Vui lòng chọn thêm ít nhất 1 NCC nữa để so sánh</p>
            <ScorecardDetail scorecard={scorecards[0]} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// --- Stat Row for table ---
function StatRow({
  label, scorecards, getValue, bestId, icon, lowerIsBetter,
}: {
  label: string;
  scorecards: SupplierScorecard[];
  getValue: (sc: SupplierScorecard) => string;
  bestId: string;
  icon: React.ReactNode;
  lowerIsBetter?: boolean;
}) {
  return (
    <tr className="border-b hover:bg-muted/50">
      <td className="py-3 px-4 flex items-center gap-2">
        {icon} {label}
      </td>
      {scorecards.map(sc => {
        const isBest = bestId === sc.supplierId;
        return (
          <td key={sc.supplierId} className="text-center py-3 px-4">
            <span className="inline-flex items-center gap-1">
              {getValue(sc)}
              {isBest && scorecards.length > 1 && <Trophy className="h-3.5 w-3.5 text-yellow-500" />}
            </span>
          </td>
        );
      })}
    </tr>
  );
}

// --- Single Scorecard Detail (used for SupplierDetailPage tab) ---
export function ScorecardDetail({ scorecard }: { scorecard: SupplierScorecard }) {
  return (
    <div className="mt-4 space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {scoreCriteria.map(c => (
          <div key={c.key} className="text-center p-3 rounded-lg bg-muted/50">
            <div className={`text-2xl ${getScoreColor(scorecard[c.key])}`}>{scorecard[c.key]}</div>
            <p className="text-muted-foreground mt-1">{c.label}</p>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Tổng đơn" value={scorecard.totalOrders.toString()} icon={<BarChart3 className="h-4 w-4" />} />
        <StatCard label="Giao đúng hạn" value={`${scorecard.onTimeDeliveryRate}%`} icon={<Truck className="h-4 w-4" />} />
        <StatCard label="Tỷ lệ lỗi" value={`${scorecard.defectRate}%`} icon={<AlertTriangle className="h-4 w-4" />} />
        <StatCard label="TG phản hồi" value={scorecard.avgResponseTime} icon={<Clock className="h-4 w-4" />} />
      </div>
      <p className="text-muted-foreground text-center">Cập nhật: {scorecard.lastUpdated}</p>
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
      <div className="text-muted-foreground">{icon}</div>
      <div>
        <p className="text-muted-foreground text-xs">{label}</p>
        <p className="font-medium">{value}</p>
      </div>
    </div>
  );
}

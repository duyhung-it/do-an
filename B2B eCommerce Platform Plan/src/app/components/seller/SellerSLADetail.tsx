// ============================================================
// Chi tiết SLA — Seller (biểu đồ, chỉ tiêu, báo cáo)
// ============================================================

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router';
import {
  ShieldCheck, ArrowLeft, CheckCircle2, XCircle, AlertTriangle,
  Target, BarChart3, TrendingUp, Award,
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, Legend,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Skeleton } from '../ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { StatusBadge } from '../shared/StatusBadge';
import { IconWrapper } from '../shared/IconWrapper';
import { AppBreadcrumb } from '../shared/AppBreadcrumb';
import { slaApi } from '../../services/slaApi';
import type { SLADefinition, SLAReport } from '../../types';

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 90 ? 'bg-green-100 text-green-700'
    : score >= 70 ? 'bg-yellow-100 text-yellow-700'
    : 'bg-red-100 text-red-700';
  return <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-sm font-medium ${color}`}>{score} điểm</span>;
}

export function SellerSLADetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sla, setSla] = useState<SLADefinition | null>(null);
  const [reports, setReports] = useState<SLAReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('metrics');

  const fetchData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [slaData, rpts] = await Promise.all([
        slaApi.getById(id),
        slaApi.getReports(id),
      ]);
      setSla(slaData);
      setReports(rpts);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Chart data
  const latestReport = reports.length > 0 ? reports[0] : null;

  const trendData = useMemo(() =>
    [...reports].reverse().map(r => ({
      period: r.period,
      score: r.overallScore,
    })),
    [reports]
  );

  const barData = useMemo(() => {
    if (!latestReport || !sla) return [];
    return latestReport.metrics.map(m => {
      const def = sla.metrics.find(d => d.id === m.metricId);
      return {
        name: def?.metric ?? m.metricId,
        score: m.score,
        fill: m.status === 'Đạt' ? '#22c55e' : m.status === 'Cảnh báo' ? '#eab308' : '#ef4444',
      };
    });
  }, [latestReport, sla]);

  const radarData = useMemo(() => {
    if (!latestReport || !sla) return [];
    return latestReport.metrics.map(m => {
      const def = sla.metrics.find(d => d.id === m.metricId);
      return {
        metric: def?.metric?.replace('Tỷ lệ ', '').slice(0, 12) ?? '',
        actual: m.actual,
        target: def?.target ?? 90,
      };
    });
  }, [latestReport, sla]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6 space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (!sla) {
    return (
      <div className="container mx-auto px-4 py-6 text-center">
        <ShieldCheck className="h-16 w-16 mx-auto mb-4 text-muted-foreground/30" />
        <h2>Không tìm thấy SLA</h2>
        <Button className="mt-4" onClick={() => navigate('/seller/sla')}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Quay lại
        </Button>
      </div>
    );
  }

  const scoreVariant = sla.currentScore >= 90 ? 'success' : sla.currentScore >= 70 ? 'warning' : 'danger';
  const daysLeft = Math.ceil((new Date(sla.endDate).getTime() - Date.now()) / 86400000);

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <AppBreadcrumb items={[
        { label: 'Kênh người bán', href: '/seller' },
        { label: 'Quản lý SLA', href: '/seller/sla' },
        { label: sla.slaNumber },
      ]} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/seller/sla')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <IconWrapper icon={ShieldCheck} variant={scoreVariant} size="lg" />
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1>{sla.name}</h1>
              <StatusBadge status={sla.status} />
            </div>
            <p className="text-muted-foreground mt-1">{sla.slaNumber}</p>
          </div>
        </div>
        {sla.currentScore > 0 && <ScoreBadge score={sla.currentScore} />}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <SummaryCard
          label="Điểm SLA"
          value={sla.currentScore > 0 ? `${sla.currentScore}` : '—'}
          icon={Award}
          highlight
        />
        <SummaryCard
          label="Số chỉ tiêu"
          value={`${sla.metrics.length}`}
          icon={Target}
        />
        <SummaryCard
          label="Tỷ lệ phạt"
          value={`${sla.penaltyRate}%`}
          icon={AlertTriangle}
        />
        <SummaryCard
          label="Tỷ lệ thưởng"
          value={`${sla.bonusRate}%`}
          icon={TrendingUp}
        />
      </div>

      {/* Thông tin + Hiệu lực */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Thông tin SLA</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <InfoRow label="Mã SLA" value={sla.slaNumber} />
            <InfoRow label="Tên" value={sla.name} />
            <InfoRow label="NCC" value={`${sla.sellerName} (${sla.sellerCompany})`} />
            <InfoRow label="Người mua" value={sla.buyerCompany ?? 'Tất cả'} />
            <InfoRow label="Hiệu lực" value={`${formatDate(sla.startDate)} — ${formatDate(sla.endDate)}`} />
            {daysLeft > 0 && daysLeft <= 30 && (
              <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/10 border border-amber-200 dark:border-amber-900/30 text-sm text-amber-700 dark:text-amber-400 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0" /> Còn {daysLeft} ngày hết hạn
              </div>
            )}
            {sla.note && (
              <>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Ghi chú</p>
                  <p className="text-sm">{sla.note}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Tổng quan điểm */}
        <Card>
          <CardHeader><CardTitle className="text-base">Tổng quan hiệu suất</CardTitle></CardHeader>
          <CardContent>
            {sla.currentScore > 0 ? (
              <div className="space-y-4">
                <div className="text-center">
                  <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full border-4 ${
                    sla.currentScore >= 90 ? 'border-green-400 text-green-600'
                    : sla.currentScore >= 70 ? 'border-yellow-400 text-yellow-600'
                    : 'border-red-400 text-red-600'
                  }`}>
                    <span className="text-2xl font-bold">{sla.currentScore}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">Điểm SLA hiện tại</p>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {latestReport && (
                    <>
                      <MiniStat
                        label="Đạt"
                        value={latestReport.metrics.filter(m => m.status === 'Đạt').length}
                        color="text-green-600"
                      />
                      <MiniStat
                        label="Cảnh báo"
                        value={latestReport.metrics.filter(m => m.status === 'Cảnh báo').length}
                        color="text-yellow-600"
                      />
                      <MiniStat
                        label="Vi phạm"
                        value={latestReport.metrics.filter(m => m.status === 'Vi phạm').length}
                        color="text-red-600"
                      />
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <BarChart3 className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
                <p className="text-muted-foreground">Chưa có dữ liệu đánh giá</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tabs: Chỉ tiêu / Báo cáo */}
      <Card>
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full justify-start rounded-none border-b bg-transparent px-4 pt-3">
              <TabsTrigger value="metrics">Chỉ tiêu ({sla.metrics.length})</TabsTrigger>
              <TabsTrigger value="reports">Báo cáo ({reports.length})</TabsTrigger>
              <TabsTrigger value="charts">Biểu đồ</TabsTrigger>
            </TabsList>

            <TabsContent value="metrics" className="p-4 space-y-3">
              {sla.metrics.map(m => {
                const latestM = latestReport?.metrics.find(rm => rm.metricId === m.id);
                return (
                  <div key={m.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 p-4 bg-muted/20 rounded-lg border">
                    <div className="flex-1">
                      <p className="font-medium">{m.metric}</p>
                      <div className="flex gap-4 mt-1 text-sm text-muted-foreground">
                        <span>Mục tiêu: <strong>{m.target}{m.unit}</strong></span>
                        <span>Trọng số: {m.weight}%</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      {latestM ? (
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-medium">{latestM.actual}{m.unit}</span>
                          <Badge className={`${
                            latestM.status === 'Đạt' ? 'bg-green-100 text-green-700'
                            : latestM.status === 'Cảnh báo' ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                          }`}>
                            {latestM.status === 'Đạt' && <CheckCircle2 className="h-3 w-3 mr-1" />}
                            {latestM.status === 'Cảnh báo' && <AlertTriangle className="h-3 w-3 mr-1" />}
                            {latestM.status === 'Vi phạm' && <XCircle className="h-3 w-3 mr-1" />}
                            {latestM.status}
                          </Badge>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">Chưa có dữ liệu</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </TabsContent>

            <TabsContent value="reports" className="p-4 space-y-3">
              {reports.length > 0 ? (
                reports.map(r => (
                  <div key={r.id} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg border">
                    <div>
                      <p className="font-medium">Kỳ: {r.period}</p>
                      <p className="text-xs text-muted-foreground">
                        {r.metrics.filter(m => m.status === 'Đạt').length}/{r.metrics.length} chỉ tiêu đạt
                        {r.penaltyAmount > 0 && ` · Phạt: ${new Intl.NumberFormat('vi-VN').format(r.penaltyAmount)}₫`}
                        {r.bonusAmount > 0 && ` · Thưởng: ${new Intl.NumberFormat('vi-VN').format(r.bonusAmount)}₫`}
                      </p>
                    </div>
                    <ScoreBadge score={r.overallScore} />
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-8">Chưa có báo cáo SLA</p>
              )}
            </TabsContent>

            <TabsContent value="charts" className="p-4 space-y-6">
              {reports.length > 0 ? (
                <>
                  {/* Line chart */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Xu hướng điểm SLA</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={220}>
                        <LineChart data={trendData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="period" />
                          <YAxis domain={[0, 100]} />
                          <Tooltip />
                          <Line type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={2} dot={{ r: 4 }} name="Điểm SLA" />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Bar chart */}
                  {barData.length > 0 && (
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Chi tiết chỉ tiêu (kỳ gần nhất)</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={220}>
                          <BarChart data={barData} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" domain={[0, 100]} />
                            <YAxis dataKey="name" type="category" width={110} tick={{ fontSize: 11 }} />
                            <Tooltip />
                            <Bar dataKey="score" name="Điểm">
                              {barData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  )}

                  {/* Radar chart */}
                  {radarData.length > 0 && (
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Biểu đồ Radar</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={280}>
                          <RadarChart data={radarData}>
                            <PolarGrid />
                            <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10 }} />
                            <PolarRadiusAxis domain={[0, 100]} />
                            <Radar name="Thực tế" dataKey="actual" stroke="#6366f1" fill="#6366f1" fillOpacity={0.3} />
                            <Radar name="Mục tiêu" dataKey="target" stroke="#d1d5db" fill="#d1d5db" fillOpacity={0.1} />
                            <Legend />
                          </RadarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  )}
                </>
              ) : (
                <p className="text-center text-muted-foreground py-8">Chưa có dữ liệu để hiển thị biểu đồ</p>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

function SummaryCard({ label, value, icon: Icon, highlight }: {
  label: string; value: string; icon: React.ElementType; highlight?: boolean;
}) {
  return (
    <Card className={highlight ? 'border-primary bg-primary/5' : ''}>
      <CardContent className="p-4 flex items-center gap-3">
        <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${
          highlight ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
        }`}><Icon className="h-4 w-4" /></div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className={`font-medium ${highlight ? 'text-primary' : ''}`}>{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-muted-foreground text-sm min-w-[100px]">{label}</span>
      <span className="text-sm">{value}</span>
    </div>
  );
}

function MiniStat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="text-center p-2 rounded-lg bg-muted/30">
      <p className={`text-lg font-medium ${color}`}>{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

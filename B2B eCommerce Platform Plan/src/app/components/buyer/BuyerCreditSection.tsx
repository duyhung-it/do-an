// ============================================================
// Section Hạn mức tín dụng — Buyer (P2 Đợt 5: P2.25–P2.28, P2.30)
// ProgressRing gauge, Timeline, Status card, Line chart
// ============================================================

import { useState, useEffect, useMemo, useId } from 'react';
import {
  CreditCard, Eye, TrendingUp, TrendingDown, CheckCircle2,
  AlertTriangle, Shield, ChevronRight,
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip as ReTooltip,
  ResponsiveContainer, CartesianGrid,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { StatusBadge } from '../shared/StatusBadge';
import { ProgressRing } from '../shared/ProgressRing';
import { IconWrapper } from '../shared/IconWrapper';
import { AnimatedNumber } from '../shared/AnimatedNumber';
import { ChartWrapper } from '../shared/ChartWrapper';
import { creditApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import type { CreditLimit, CreditTransaction } from '../../types';

const formatPrice = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n);
const formatShort = (n: number) => {
  if (n >= 1e9) return `${(n / 1e9).toFixed(1)} tỷ`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(0)} tr`;
  return new Intl.NumberFormat('vi-VN').format(n);
};

// P2.28: Mock monthly credit fluctuation data
const mockCreditTrend = [
  { id: 'm1', month: 'T1', used: 120, limit: 500 },
  { id: 'm2', month: 'T2', used: 180, limit: 500 },
  { id: 'm3', month: 'T3', used: 150, limit: 500 },
  { id: 'm4', month: 'T4', used: 220, limit: 600 },
  { id: 'm5', month: 'T5', used: 280, limit: 600 },
  { id: 'm6', month: 'T6', used: 200, limit: 600 },
  { id: 'm7', month: 'T7', used: 350, limit: 700 },
  { id: 'm8', month: 'T8', used: 300, limit: 700 },
  { id: 'm9', month: 'T9', used: 250, limit: 700 },
  { id: 'm10', month: 'T10', used: 320, limit: 800 },
  { id: 'm11', month: 'T11', used: 380, limit: 800 },
  { id: 'm12', month: 'T12', used: 340, limit: 800 },
];

// ─── P2.27: Credit Status Card ────────────────────────────
function CreditStatusCard({ pct }: { pct: number }) {
  const isGood = pct < 60;
  const isWarning = pct >= 60 && pct < 80;
  // isAlert when >= 80

  if (isGood) {
    return (
      <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/10 border border-emerald-200 dark:border-emerald-900/30">
        <div className="h-10 w-10 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
          <CheckCircle2 className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm" style={{ fontFamily: 'var(--font-heading)' }}>Tín dụng tốt</p>
          <p className="text-xs text-muted-foreground">Sử dụng {pct}% hạn mức — Trong ngưỡng an toàn</p>
        </div>
      </div>
    );
  }

  if (isWarning) {
    return (
      <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/10 border border-amber-200 dark:border-amber-900/30">
        <div className="h-10 w-10 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0">
          <AlertTriangle className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm" style={{ fontFamily: 'var(--font-heading)' }}>Cần chú ý</p>
          <p className="text-xs text-muted-foreground">Đã dùng {pct}% hạn mức — Hãy thanh toán sớm</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-red-50/60 dark:bg-red-950/10 border border-red-200 dark:border-red-900/30">
      <div className="h-10 w-10 rounded-full bg-red-500 text-white flex items-center justify-center shrink-0">
        <AlertTriangle className="h-5 w-5" />
      </div>
      <div>
        <p className="text-sm" style={{ fontFamily: 'var(--font-heading)' }}>Cảnh báo tín dụng</p>
        <p className="text-xs text-muted-foreground">Đã dùng {pct}% hạn mức — Thanh toán ngay để tránh bị khoá</p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════════════════════
export function BuyerCreditSection() {
  const { user } = useAuth();
  const buyerId = user?.id ?? 'user-001';
  const chartId = useId();

  const [credits, setCredits] = useState<CreditLimit[]>([]);
  const [loading, setLoading] = useState(true);

  const [selected, setSelected] = useState<CreditLimit | null>(null);
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [showDetail, setShowDetail] = useState(false);

  useEffect(() => {
    creditApi.getBuyerCredits(buyerId).then(data => {
      setCredits(data);
      setLoading(false);
    });
  }, [buyerId]);

  const openDetail = async (credit: CreditLimit) => {
    setSelected(credit);
    setShowDetail(true);
    const txns = await creditApi.getTransactions(credit.id);
    setTransactions(txns);
  };

  const totalLimit = useMemo(() => credits.reduce((s, c) => s + c.creditLimit, 0), [credits]);
  const totalUsed = useMemo(() => credits.reduce((s, c) => s + c.usedAmount, 0), [credits]);
  const totalAvailable = useMemo(() => credits.reduce((s, c) => s + c.availableAmount, 0), [credits]);
  const usagePct = totalLimit > 0 ? Math.round((totalUsed / totalLimit) * 100) : 0;

  if (loading) return null;
  if (credits.length === 0) return null;

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <CreditCard className="h-5 w-5 text-primary" /> Hạn mức tín dụng
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* P2.25: Main gauge + summary */}
          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* P2.25: Large ProgressRing */}
            <ProgressRing
              value={usagePct}
              size={120}
              strokeWidth={10}
              color={usagePct >= 80 ? '#ef4444' : usagePct >= 60 ? '#f59e0b' : '#10b981'}
              label="Đã dùng"
            />

            {/* Summary cards */}
            <div className="flex-1 grid grid-cols-3 gap-3 w-full">
              <div className="p-3 rounded-xl bg-blue-50/60 dark:bg-blue-950/10 border border-blue-100 dark:border-blue-900/20 text-center">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Hạn mức</p>
                <p className="text-sm text-primary mt-0.5" style={{ fontFamily: 'var(--font-heading)' }}>
                  <AnimatedNumber value={totalLimit} format={formatShort} />
                </p>
              </div>
              <div className="p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/10 border border-amber-100 dark:border-amber-900/20 text-center">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Đã dùng</p>
                <p className="text-sm text-amber-600 mt-0.5" style={{ fontFamily: 'var(--font-heading)' }}>
                  <AnimatedNumber value={totalUsed} format={formatShort} />
                </p>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/10 border border-emerald-100 dark:border-emerald-900/20 text-center">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Khả dụng</p>
                <p className="text-sm text-emerald-600 mt-0.5" style={{ fontFamily: 'var(--font-heading)' }}>
                  <AnimatedNumber value={totalAvailable} format={formatShort} />
                </p>
              </div>
            </div>
          </div>

          {/* P2.27: Credit Status Card */}
          <CreditStatusCard pct={usagePct} />

          {/* P2.28: Credit fluctuation chart */}
          <ChartWrapper>
            <p className="text-sm text-muted-foreground mb-2">Biến động tín dụng theo tháng (triệu)</p>
            <ResponsiveContainer width="100%" height={120} id={`credit-chart-${chartId}`}>
              <LineChart data={mockCreditTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <ReTooltip
                  formatter={(v: number, name: string) => [`${v} tr`, name === 'used' ? 'Đã dùng' : 'Hạn mức']}
                  labelFormatter={l => `Tháng: ${l}`}
                />
                <Line 
                  type="monotone" 
                  dataKey="limit" 
                  stroke="#6366f1" 
                  strokeWidth={1.5} 
                  strokeDasharray="4 2" 
                  dot={false} 
                  name="Hạn mức"
                  isAnimationActive={false}
                />
                <Line 
                  type="monotone" 
                  dataKey="used" 
                  stroke="#f59e0b" 
                  strokeWidth={2} 
                  dot={{ r: 2 }} 
                  name="Đã dùng"
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartWrapper>

          {/* Supplier credits list */}
          <div className="space-y-2">
            {credits.map(credit => {
              const pct = Math.round((credit.usedAmount / credit.creditLimit) * 100);
              return (
                <button
                  key={credit.id}
                  className="w-full flex items-center gap-3 p-3 rounded-xl border border-border/50 hover:bg-muted/30 hover:border-primary/20 transition-all text-left"
                  onClick={() => openDetail(credit)}
                >
                  <IconWrapper
                    icon={Shield}
                    variant={pct >= 80 ? 'danger' : pct >= 60 ? 'warning' : 'success'}
                    size="sm"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm truncate" style={{ fontFamily: 'var(--font-heading)' }}>{credit.supplierName}</p>
                      <StatusBadge status={credit.status} size="sm" />
                    </div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-muted-foreground">
                        {formatShort(credit.usedAmount)} / {formatShort(credit.creditLimit)}
                      </span>
                      <span className={`${pct >= 80 ? 'text-red-600' : 'text-muted-foreground'}`} style={{ fontFamily: 'var(--font-heading)' }}>
                        {pct}%
                      </span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          pct >= 80 ? 'bg-red-500' : pct >= 60 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between mt-1 text-[10px]">
                      <span className="text-muted-foreground">{credit.paymentTerms}</span>
                      <span className="text-primary">Khả dụng: {formatShort(credit.availableAmount)}</span>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground/40 shrink-0" />
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={showDetail} onOpenChange={setShowDetail}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" /> Hạn mức tín dụng
            </DialogTitle>
            <DialogDescription>Chi tiết hạn mức và lịch sử giao dịch tín dụng</DialogDescription>
          </DialogHeader>
          {selected && (() => {
            const pct = Math.round((selected.usedAmount / selected.creditLimit) * 100);
            return (
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <p style={{ fontFamily: 'var(--font-heading)' }}>{selected.supplierName}</p>
                  <StatusBadge status={selected.status} />
                </div>

                {/* P2.25: Gauge in dialog */}
                <div className="flex items-center gap-4">
                  <ProgressRing
                    value={pct}
                    size={80}
                    strokeWidth={8}
                    color={pct >= 80 ? '#ef4444' : pct >= 60 ? '#f59e0b' : '#10b981'}
                  />
                  <div className="grid grid-cols-3 gap-3 flex-1">
                    <div className="text-center p-2 rounded-lg bg-muted/30">
                      <p className="text-[10px] text-muted-foreground">Hạn mức</p>
                      <p className="text-sm" style={{ fontFamily: 'var(--font-heading)' }}>{formatPrice(selected.creditLimit)}</p>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-muted/30">
                      <p className="text-[10px] text-muted-foreground">Đã dùng</p>
                      <p className="text-sm text-amber-600" style={{ fontFamily: 'var(--font-heading)' }}>{formatPrice(selected.usedAmount)}</p>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-muted/30">
                      <p className="text-[10px] text-muted-foreground">Còn lại</p>
                      <p className="text-sm text-primary" style={{ fontFamily: 'var(--font-heading)' }}>{formatPrice(selected.availableAmount)}</p>
                    </div>
                  </div>
                </div>

                {/* Status card */}
                <CreditStatusCard pct={pct} />

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="p-2.5 rounded-lg bg-muted/20">
                    <p className="text-xs text-muted-foreground">Điều khoản</p>
                    <p>{selected.paymentTerms}</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-muted/20">
                    <p className="text-xs text-muted-foreground">Hết hạn</p>
                    <p>{selected.expiryDate}</p>
                  </div>
                </div>

                <Separator />

                {/* P2.26: Transaction timeline */}
                <div>
                  <p style={{ fontFamily: 'var(--font-heading)' }} className="text-sm mb-3">
                    Lịch sử giao dịch tín dụng ({transactions.length})
                  </p>
                  {transactions.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground">
                      <CreditCard className="h-8 w-8 mx-auto mb-2 opacity-30" />
                      <p className="text-sm">Chưa có giao dịch</p>
                    </div>
                  ) : (
                    <div className="relative pl-7 space-y-4 max-h-60 overflow-y-auto">
                      {transactions.map((txn, idx) => {
                        const isUse = txn.type === 'Sử dụng';
                        return (
                          <div key={txn.id} className="relative">
                            <div className={`absolute -left-7 top-0.5 h-4 w-4 rounded-full flex items-center justify-center ${
                              isUse ? 'bg-amber-500' : txn.type === 'Thanh toán' ? 'bg-emerald-500' : 'bg-blue-500'
                            }`}>
                              {isUse
                                ? <TrendingUp className="h-2.5 w-2.5 text-white" />
                                : <TrendingDown className="h-2.5 w-2.5 text-white" />
                              }
                            </div>
                            {idx < transactions.length - 1 && (
                              <div className="absolute -left-[20px] top-4 w-0.5 h-[calc(100%+0.5rem)] bg-border" />
                            )}
                            <div className="text-sm">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5">
                                  <Badge variant="outline" className="text-[10px] h-4.5 px-1.5">{txn.type}</Badge>
                                  <span className="text-xs text-muted-foreground">{txn.orderNumber}</span>
                                </div>
                                <span className={isUse ? 'text-amber-600' : 'text-emerald-600'} style={{ fontFamily: 'var(--font-heading)' }}>
                                  {isUse ? '-' : '+'}{formatPrice(txn.amount)}
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground mt-0.5">{txn.note}</p>
                              <p className="text-[10px] text-muted-foreground">{txn.createdAt}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setShowDetail(false)}>Đóng</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
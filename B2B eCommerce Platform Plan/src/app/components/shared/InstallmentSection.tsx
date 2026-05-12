// ============================================================
// InstallmentSection — Widget tính trả góp trên trang sản phẩm
// ============================================================

import { useState, useMemo } from 'react';
import { CreditCard, Banknote, Percent, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import type { InstallmentPlan } from '../../types';

const formatVND = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n);

// Mock plans (in production these would come from an API)
const ACTIVE_PLANS: InstallmentPlan[] = [
  { id: 'ip-001', bankName: 'VPBank', months: [3, 6, 9, 12, 18, 24], interestRate: 0, minAmount: 3000000, isActive: true },
  { id: 'ip-002', bankName: 'Home Credit', months: [6, 9, 12, 18, 24], interestRate: 1.79, minAmount: 3000000, isActive: true },
  { id: 'ip-004', bankName: 'Shinhan', months: [3, 6, 9, 12], interestRate: 0, minAmount: 5000000, isActive: true },
  { id: 'ip-003', bankName: 'MCredit', months: [6, 9, 12], interestRate: 2.5, minAmount: 3000000, isActive: true },
  { id: 'ip-005', bankName: 'FE Credit', months: [3, 6, 9, 12, 18], interestRate: 1.5, minAmount: 3000000, isActive: true },
];

interface InstallmentSectionProps {
  productPrice: number;
  productName?: string;
}

export function InstallmentSection({ productPrice, productName }: InstallmentSectionProps) {
  const eligiblePlans = useMemo(
    () => ACTIVE_PLANS.filter(p => p.isActive && productPrice >= p.minAmount && (!p.maxAmount || productPrice <= p.maxAmount)),
    [productPrice],
  );

  const [selectedPlanId, setSelectedPlanId] = useState<string>(eligiblePlans[0]?.id ?? '');
  const selectedPlan = eligiblePlans.find(p => p.id === selectedPlanId) ?? eligiblePlans[0];

  if (eligiblePlans.length === 0) return null;

  const calcMonthly = (months: number, rate: number) => {
    if (rate === 0) return Math.ceil(productPrice / months);
    const monthlyInterest = productPrice * (rate / 100);
    return Math.ceil(productPrice / months + monthlyInterest);
  };

  return (
    <Card className="border-0 shadow-sm mt-8">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <CreditCard className="h-5 w-5 text-primary" />
          Mua trả góp lãi suất chỉ từ 0%
          <Badge className="ml-2 bg-emerald-500 text-white border-0 text-xs">{eligiblePlans.length} gói</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Bank tabs */}
        <div className="flex flex-wrap gap-2 mb-4">
          {eligiblePlans.map(plan => (
            <button
              key={plan.id}
              onClick={() => setSelectedPlanId(plan.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-all ${
                selectedPlanId === plan.id
                  ? 'bg-red-50 border-red-300 text-red-700 shadow-sm'
                  : 'bg-background border-border hover:bg-muted/50'
              }`}
            >
              <Banknote className="h-4 w-4" />
              <span className="font-medium">{plan.bankName}</span>
              {plan.interestRate === 0 && (
                <Badge variant="outline" className="text-[10px] py-0 h-4 px-1 border-emerald-400 text-emerald-600 bg-emerald-50">
                  0% lãi
                </Badge>
              )}
            </button>
          ))}
        </div>

        {/* Selected plan details */}
        {selectedPlan && (
          <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl p-4 border border-red-200/40">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="font-semibold text-sm flex items-center gap-2">
                  <Banknote className="h-4 w-4 text-red-600" />
                  Trả góp qua {selectedPlan.bankName}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Lãi suất {selectedPlan.interestRate === 0 ? 'miễn phí' : `${selectedPlan.interestRate}%/tháng`}
                  {' · '}Áp dụng từ {formatVND(selectedPlan.minAmount)}
                </p>
              </div>
              {selectedPlan.interestRate === 0 && (
                <Badge className="bg-emerald-500 text-white border-0">
                  <Percent className="h-3 w-3 mr-1" /> Miễn lãi
                </Badge>
              )}
            </div>

            {/* Monthly payment options */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {selectedPlan.months.map(months => {
                const monthly = calcMonthly(months, selectedPlan.interestRate);
                return (
                  <div
                    key={months}
                    className="bg-white rounded-lg p-3 border border-red-100 hover:border-red-300 hover:shadow-sm transition-all cursor-pointer"
                  >
                    <p className="text-xs text-muted-foreground">{months} tháng</p>
                    <p className="text-base font-bold text-red-600 mt-0.5">{formatVND(monthly)}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">/ tháng</p>
                  </div>
                );
              })}
            </div>

            {/* CTA & terms */}
            <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="text-xs text-muted-foreground space-y-0.5">
                <p className="flex items-center gap-1"><Check className="h-3 w-3 text-emerald-500" /> Duyệt nhanh trong 5 phút</p>
                <p className="flex items-center gap-1"><Check className="h-3 w-3 text-emerald-500" /> Chỉ cần CMND/CCCD</p>
                <p className="flex items-center gap-1"><Check className="h-3 w-3 text-emerald-500" /> Không cần chứng minh thu nhập</p>
              </div>
              <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white whitespace-nowrap">
                Đăng ký trả góp
              </Button>
            </div>
          </div>
        )}

        <p className="text-[11px] text-muted-foreground mt-3 text-center">
          * Lãi suất và điều kiện có thể thay đổi tùy theo gói. Vui lòng tư vấn nhân viên cửa hàng để biết chi tiết.
        </p>
      </CardContent>
    </Card>
  );
}

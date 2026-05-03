// ============================================================
// TradeInPage — Thu cũ đổi mới
// ============================================================
import { useState } from 'react';
import { Link } from 'react-router';
import {
  RotateCcw, Smartphone, CheckCircle, ArrowRight, ChevronRight,
  Star, Shield, Zap, Clock, Camera, Cpu,
  AlertCircle, Package, TrendingDown,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { AppBreadcrumb } from '../shared/AppBreadcrumb';
import { tradeInApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';

const formatPrice = (p: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p);

const BRANDS = ['Apple', 'Samsung', 'Xiaomi', 'OPPO', 'Vivo', 'Realme', 'OnePlus', 'Google'];

const MODELS: Record<string, string[]> = {
  Apple: ['iPhone 16 Pro Max', 'iPhone 16 Pro', 'iPhone 16 Plus', 'iPhone 16', 'iPhone 15 Pro Max', 'iPhone 15 Pro', 'iPhone 15', 'iPhone 14 Pro Max', 'iPhone 14 Pro', 'iPhone 14', 'iPhone 13 Pro Max', 'iPhone 13'],
  Samsung: ['Galaxy S25 Ultra', 'Galaxy S25+', 'Galaxy S25', 'Galaxy S24 Ultra', 'Galaxy S24+', 'Galaxy S24', 'Galaxy S23 Ultra', 'Galaxy Z Fold 6', 'Galaxy Z Flip 6'],
  Xiaomi: ['Xiaomi 14 Ultra', 'Xiaomi 14', 'Xiaomi 13T Pro', 'Redmi Note 13 Pro+', 'Redmi Note 13 Pro'],
  OPPO: ['Find X8 Pro', 'Find X7 Ultra', 'Reno 12 Pro', 'Reno 12', 'A3 Pro'],
  Vivo: ['X100 Ultra', 'X100 Pro', 'V30 Pro', 'V30'],
  Realme: ['GT 6', 'GT Neo 6', '12 Pro+', '12+'],
  OnePlus: ['12', '12R', 'Nord 4'],
  Google: ['Pixel 9 Pro XL', 'Pixel 9 Pro', 'Pixel 9', 'Pixel 8 Pro'],
};

const STORAGES = ['64GB', '128GB', '256GB', '512GB', '1TB'];

const CONDITIONS = [
  {
    value: 'Tốt',
    label: 'Tốt',
    description: 'Máy không trầy xước, hoạt động bình thường',
    multiplier: 100,
    icon: Star,
    color: 'text-green-500',
    bg: 'border-green-200 bg-green-50',
  },
  {
    value: 'Khá',
    label: 'Khá',
    description: 'Vài vết trầy nhỏ, chức năng đầy đủ',
    multiplier: 85,
    icon: CheckCircle,
    color: 'text-blue-500',
    bg: 'border-blue-200 bg-blue-50',
  },
  {
    value: 'Trung bình',
    label: 'Trung bình',
    description: 'Trầy xước rõ, một số tính năng hạn chế',
    multiplier: 70,
    icon: AlertCircle,
    color: 'text-amber-500',
    bg: 'border-amber-200 bg-amber-50',
  },
  {
    value: 'Kém',
    label: 'Kém',
    description: 'Hư hỏng nặng, màn hình nứt hoặc cảm ứng kém',
    multiplier: 50,
    icon: TrendingDown,
    color: 'text-red-500',
    bg: 'border-red-200 bg-red-50',
  },
];

const HOW_IT_WORKS = [
  { step: 1, icon: Smartphone, title: 'Nhập thông tin máy', desc: 'Chọn thương hiệu, model và tình trạng thiết bị của bạn' },
  { step: 2, icon: Zap, title: 'Nhận định giá ngay', desc: 'Hệ thống tự động định giá trong vài giây' },
  { step: 3, icon: Package, title: 'Mang máy đến cửa hàng', desc: 'Nhân viên kiểm tra và xác nhận giá trị cuối cùng' },
  { step: 4, icon: RotateCcw, title: 'Đổi máy mới giá tốt', desc: 'Bù tiền chênh lệch và nhận máy mới ngay hôm nay' },
];

const POPULAR_EXCHANGES = [
  { from: 'iPhone 13', to: 'iPhone 16', savings: '5.000.000đ' },
  { from: 'Galaxy S23', to: 'Galaxy S25', savings: '4.500.000đ' },
  { from: 'Xiaomi 13', to: 'Xiaomi 14 Ultra', savings: '3.500.000đ' },
];

type Step = 'form' | 'result';

export function TradeInPage() {
  const { user, isAuthenticated } = useAuth();
  const [step, setStep] = useState<Step>('form');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [storage, setStorage] = useState('');
  const [condition, setCondition] = useState('');
  const [estimatedValue, setEstimatedValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [customerName, setCustomerName] = useState(user?.fullName || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '');
  const [note, setNote] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleEstimate = async () => {
    if (!brand || !model || !storage || !condition) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }
    setLoading(true);
    try {
      const val = await tradeInApi.estimateValue(brand, model, storage, condition);
      setEstimatedValue(val);
      setStep('result');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!customerName || !customerPhone) {
      toast.error('Vui lòng điền tên và số điện thoại');
      return;
    }
    setSubmitting(true);
    try {
      await tradeInApi.create({
        customerId: user?.id || 'guest',
        customerName,
        customerPhone,
        brand,
        model,
        storage,
        condition: condition as 'Tốt' | 'Khá' | 'Trung bình' | 'Kém',
        estimatedValue,
        note,
        status: 'Chờ định giá',
      });
      setSubmitted(true);
      toast.success('Yêu cầu thu cũ đã được gửi! Chúng tôi sẽ liên hệ bạn sớm.');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedCondition = CONDITIONS.find(c => c.value === condition);

  if (submitted) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-lg text-center">
        <div className="h-24 w-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="h-12 w-12 text-green-500" />
        </div>
        <h2 className="text-2xl font-bold mb-3">Yêu cầu đã được gửi!</h2>
        <p className="text-muted-foreground mb-2">
          Giá trị ước tính: <span className="font-bold text-[#e31837] text-lg">{formatPrice(estimatedValue)}</span>
        </p>
        <p className="text-sm text-muted-foreground mb-8">
          Nhân viên CELLPHONES sẽ liên hệ trong vòng 30 phút để sắp xếp kiểm tra máy thực tế.
        </p>
        <div className="flex gap-3 justify-center">
          <Button className="bg-[#e31837] hover:bg-[#c91432]" onClick={() => { setStep('form'); setSubmitted(false); setBrand(''); setModel(''); setStorage(''); setCondition(''); }}>
            Định giá máy khác
          </Button>
          <Link to="/products?isNew=true">
            <Button variant="outline">Xem máy mới</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="container mx-auto px-4 py-6">
        <AppBreadcrumb items={[{ label: 'Trang chủ', href: '/' }, { label: 'Thu cũ đổi mới' }]} />
      </div>

      {/* Hero */}
      <div className="bg-gradient-to-br from-[#1a0a0d] via-[#c91432] to-[#e31837] py-14">
        <div className="container mx-auto px-4 text-center text-white">
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
            <RotateCcw className="h-4 w-4" />
            <span className="text-sm font-medium">Thu cũ đổi mới</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Định giá thiết bị cũ<br />
            <span className="text-yellow-300">Nhận ngay giá tốt nhất</span>
          </h1>
          <p className="text-red-100 max-w-xl mx-auto">
            Nhập thông tin thiết bị của bạn và nhận định giá tức thì. Mang máy đến cửa hàng để đổi sang model mới với giá ưu đãi.
          </p>
          <div className="flex items-center justify-center gap-8 mt-8">
            {[
              { label: '200+', sub: 'Cửa hàng' },
              { label: '10K+', sub: 'Máy đã thu' },
              { label: '5 phút', sub: 'Định giá' },
            ].map(s => (
              <div key={s.label} className="text-center">
                <p className="text-2xl font-bold text-white">{s.label}</p>
                <p className="text-red-200 text-xs">{s.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            {step === 'form' ? (
              <Card className="border-0 shadow-lg">
                <CardHeader className="border-b bg-gray-50 rounded-t-xl">
                  <CardTitle className="flex items-center gap-2">
                    <Smartphone className="h-5 w-5 text-[#e31837]" />
                    Thông tin thiết bị của bạn
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  {/* Brand & Model */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="font-medium">Thương hiệu *</Label>
                      <Select value={brand} onValueChange={v => { setBrand(v); setModel(''); }}>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn thương hiệu" />
                        </SelectTrigger>
                        <SelectContent>
                          {BRANDS.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="font-medium">Model *</Label>
                      <Select value={model} onValueChange={setModel} disabled={!brand}>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn model" />
                        </SelectTrigger>
                        <SelectContent>
                          {(MODELS[brand] || []).map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Storage */}
                  <div className="space-y-2">
                    <Label className="font-medium">Dung lượng bộ nhớ *</Label>
                    <div className="flex gap-2 flex-wrap">
                      {STORAGES.map(s => (
                        <button
                          key={s}
                          onClick={() => setStorage(s)}
                          className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                            storage === s
                              ? 'border-[#e31837] bg-red-50 text-[#e31837]'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Condition */}
                  <div className="space-y-3">
                    <Label className="font-medium">Tình trạng máy *</Label>
                    <div className="grid grid-cols-2 gap-3">
                      {CONDITIONS.map(c => {
                        const Icon = c.icon;
                        const isSelected = condition === c.value;
                        return (
                          <button
                            key={c.value}
                            onClick={() => setCondition(c.value)}
                            className={`text-left p-4 rounded-xl border-2 transition-all ${
                              isSelected ? c.bg + ' border-2' : 'border-gray-200 hover:border-gray-300 bg-white'
                            } ${isSelected ? '' : ''}`}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <Icon className={`h-4 w-4 ${isSelected ? c.color : 'text-gray-400'}`} />
                              <span className={`font-semibold text-sm ${isSelected ? c.color : ''}`}>{c.label}</span>
                            </div>
                            <p className="text-xs text-muted-foreground">{c.description}</p>
                            <p className={`text-xs font-medium mt-1 ${isSelected ? c.color : 'text-muted-foreground'}`}>
                              Nhận {c.multiplier}% giá trị
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <Button
                    className="w-full h-12 bg-[#e31837] hover:bg-[#c91432] text-base font-semibold"
                    onClick={handleEstimate}
                    disabled={loading || !brand || !model || !storage || !condition}
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Đang định giá...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Zap className="h-5 w-5" /> Định giá ngay
                      </span>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  {/* Result */}
                  <div className="text-center mb-8">
                    <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="h-10 w-10 text-green-500" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Giá trị ước tính</h2>
                    <div className="text-4xl font-bold text-[#e31837] mb-1">{formatPrice(estimatedValue)}</div>
                    <p className="text-sm text-muted-foreground">
                      {brand} {model} • {storage} • Tình trạng: {condition}
                    </p>
                    {selectedCondition && (
                      <Badge className={`mt-2 ${selectedCondition.color} bg-transparent border`}>
                        <selectedCondition.icon className="h-3 w-3 mr-1" />
                        {selectedCondition.label} — {selectedCondition.multiplier}% giá trị
                      </Badge>
                    )}
                  </div>

                  <div className="border-t pt-6 space-y-4">
                    <h3 className="font-semibold">Thông tin liên hệ để đặt lịch</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Họ tên *</Label>
                        <Input placeholder="Nguyễn Văn A" value={customerName} onChange={e => setCustomerName(e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label>Số điện thoại *</Label>
                        <Input placeholder="0912 345 678" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Ghi chú thêm (tùy chọn)</Label>
                      <Textarea
                        placeholder="Mô tả thêm về tình trạng máy, phụ kiện đi kèm..."
                        value={note}
                        onChange={e => setNote(e.target.value)}
                        rows={3}
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <Button variant="outline" className="flex-1" onClick={() => setStep('form')}>
                      Làm lại
                    </Button>
                    <Button
                      className="flex-1 bg-[#e31837] hover:bg-[#c91432]"
                      onClick={handleSubmit}
                      disabled={submitting}
                    >
                      {submitting ? (
                        <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>Xác nhận thu cũ <ArrowRight className="ml-1 h-4 w-4" /></>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* How it works */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Quy trình thu cũ</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0 space-y-3">
                {HOW_IT_WORKS.map(item => {
                  const Icon = item.icon;
                  return (
                    <div key={item.step} className="flex items-start gap-3">
                      <div className="h-8 w-8 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                        <Icon className="h-4 w-4 text-[#e31837]" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{item.step}. {item.title}</p>
                        <p className="text-xs text-muted-foreground">{item.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Benefits */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-[#e31837] to-[#c91432] text-white">
              <CardContent className="p-5 space-y-3">
                <h3 className="font-bold text-base mb-3">Vì sao chọn CELLPHONES?</h3>
                {[
                  { icon: Zap, text: 'Định giá nhanh, minh bạch' },
                  { icon: Shield, text: 'Cam kết giá tốt nhất thị trường' },
                  { icon: Clock, text: 'Hoàn tất trong 30 phút' },
                  { icon: CheckCircle, text: 'Không mất phí định giá' },
                ].map(item => (
                  <div key={item.text} className="flex items-center gap-2">
                    <item.icon className="h-4 w-4 text-white/80 shrink-0" />
                    <span className="text-sm text-red-100">{item.text}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Popular exchanges */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Lên đời phổ biến</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0 space-y-3">
                {POPULAR_EXCHANGES.map(ex => (
                  <div key={ex.from} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">{ex.from}</span>
                      <ArrowRight className="h-3 w-3 text-[#e31837]" />
                      <span className="font-medium">{ex.to}</span>
                    </div>
                    <Badge className="bg-green-100 text-green-700 border-0 text-xs">
                      -{ex.savings}
                    </Badge>
                  </div>
                ))}
                <Link to="/products?isNew=true">
                  <Button variant="outline" className="w-full" size="sm">
                    Xem máy mới <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

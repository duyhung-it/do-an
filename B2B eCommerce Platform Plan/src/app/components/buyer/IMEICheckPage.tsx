// ============================================================
// IMEICheckPage — Kiểm tra IMEI
// ============================================================
import { useState } from 'react';
import {
  Shield, Search, CheckCircle, XCircle, AlertCircle,
  Smartphone, Globe, Calendar, Lock, Unlock, Info,
  RefreshCw, QrCode,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { AppBreadcrumb } from '../shared/AppBreadcrumb';
import { imeiApi } from '../../services/api';
import type { IMEICheckResult } from '../../types';
import { toast } from 'sonner';

const FAQ = [
  {
    q: 'IMEI là gì?',
    a: 'IMEI (International Mobile Equipment Identity) là mã số duy nhất 15 số để nhận diện mỗi thiết bị di động trên toàn cầu.',
  },
  {
    q: 'Tìm IMEI ở đâu?',
    a: 'Bạn có thể tìm IMEI bằng cách gọi *#06# trên điện thoại, hoặc xem trong Cài đặt > Thông tin thiết bị, hoặc trên vỏ hộp máy.',
  },
  {
    q: 'Máy lock là gì?',
    a: 'Máy lock (locked phone) là điện thoại bị khóa với một nhà mạng cụ thể, chỉ sử dụng được SIM của nhà mạng đó.',
  },
  {
    q: 'Blacklist nghĩa là gì?',
    a: 'Blacklist nghĩa là thiết bị đã được báo cáo là bị mất hoặc bị đánh cắp. Máy trong danh sách này thường không sử dụng được dịch vụ mạng.',
  },
];

export function IMEICheckPage() {
  const [imei, setImei] = useState('');
  const [result, setResult] = useState<IMEICheckResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCheck = async () => {
    const cleaned = imei.replace(/\s/g, '');
    if (!cleaned || cleaned.length < 14 || cleaned.length > 16 || !/^\d+$/.test(cleaned)) {
      setError('IMEI phải là 15 chữ số');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await imeiApi.check(cleaned);
      setResult(res);
    } catch {
      toast.error('Không thể kiểm tra IMEI, vui lòng thử lại');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setImei('');
    setResult(null);
    setError('');
  };

  const formatImei = (val: string) => {
    // Auto format: XXXXXX XX XXXXXX X
    const digits = val.replace(/\D/g, '').slice(0, 15);
    return digits;
  };

  return (
    <div>
      <div className="container mx-auto px-4 py-6">
        <AppBreadcrumb items={[{ label: 'Trang chủ', href: '/' }, { label: 'Kiểm tra IMEI' }]} />
      </div>

      {/* Hero */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-700 py-14">
        <div className="container mx-auto px-4 text-center text-white">
          <div className="h-16 w-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Kiểm tra IMEI</h1>
          <p className="text-slate-300 max-w-xl mx-auto mb-8">
            Xác minh tính hợp lệ, tình trạng bảo hành và thông tin nguồn gốc của thiết bị trước khi mua.
          </p>
          <div className="flex items-center justify-center gap-8">
            {[
              { label: 'Miễn phí', sub: 'Không tính phí' },
              { label: 'Chính xác', sub: 'Dữ liệu thực tế' },
              { label: '< 5 giây', sub: 'Kết quả tức thì' },
            ].map(s => (
              <div key={s.label} className="text-center">
                <p className="text-xl font-bold">{s.label}</p>
                <p className="text-slate-400 text-xs">{s.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main */}
          <div className="lg:col-span-2 space-y-6">
            {/* Input */}
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <h2 className="text-lg font-bold mb-4">Nhập số IMEI</h2>
                <div className="space-y-3">
                  <div className="relative">
                    <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      className={`pl-10 pr-20 h-14 text-lg font-mono tracking-wider ${error ? 'border-red-500' : ''}`}
                      placeholder="Nhập 15 chữ số IMEI"
                      value={imei}
                      onChange={e => { setImei(formatImei(e.target.value)); setError(''); }}
                      onKeyDown={e => e.key === 'Enter' && handleCheck()}
                      maxLength={15}
                    />
                    {imei && (
                      <button
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        onClick={handleReset}
                      >
                        <XCircle className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                  {error && <p className="text-sm text-red-500 flex items-center gap-1"><AlertCircle className="h-3 w-3" />{error}</p>}
                  <p className="text-xs text-muted-foreground">
                    Mẹo: Gọi <strong>*#06#</strong> để xem IMEI ngay trên điện thoại
                  </p>
                  <Button
                    className="w-full h-12 bg-slate-800 hover:bg-slate-700 text-base"
                    onClick={handleCheck}
                    disabled={loading || imei.length < 15}
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Đang kiểm tra...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Search className="h-5 w-5" /> Kiểm tra IMEI
                      </span>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Result */}
            {result && (
              <Card className="border-0 shadow-lg overflow-hidden">
                <div className={`p-5 ${result.isBlacklisted ? 'bg-red-50' : 'bg-green-50'}`}>
                  <div className="flex items-center gap-3">
                    {result.isBlacklisted ? (
                      <XCircle className="h-8 w-8 text-red-500" />
                    ) : (
                      <CheckCircle className="h-8 w-8 text-green-500" />
                    )}
                    <div>
                      <h3 className={`font-bold text-lg ${result.isBlacklisted ? 'text-red-700' : 'text-green-700'}`}>
                        {result.isBlacklisted ? 'Cảnh báo: Thiết bị trong blacklist!' : 'Thiết bị hợp lệ'}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Kiểm tra lúc {new Date(result.checkedAt).toLocaleTimeString('vi-VN')}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" className="ml-auto" onClick={handleReset}>
                      <RefreshCw className="h-4 w-4 mr-1" /> Kiểm tra mới
                    </Button>
                  </div>
                </div>

                <CardContent className="p-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Device info */}
                    <div>
                      <h4 className="font-semibold mb-4 flex items-center gap-2">
                        <Smartphone className="h-4 w-4 text-[#e31837]" />
                        Thông tin thiết bị
                      </h4>
                      <div className="space-y-3">
                        {[
                          { label: 'IMEI', value: result.imei },
                          { label: 'Thương hiệu', value: result.brand },
                          { label: 'Model', value: result.model },
                          { label: 'Nước xuất xứ', value: result.purchaseCountry || 'Không rõ' },
                        ].map(item => (
                          <div key={item.label} className="flex justify-between py-2 border-b border-dashed border-gray-100 last:border-0">
                            <span className="text-sm text-muted-foreground">{item.label}</span>
                            <span className="text-sm font-medium">{item.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Status info */}
                    <div>
                      <h4 className="font-semibold mb-4 flex items-center gap-2">
                        <Shield className="h-4 w-4 text-[#e31837]" />
                        Trạng thái
                      </h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between py-2 border-b border-dashed border-gray-100">
                          <span className="text-sm text-muted-foreground flex items-center gap-1">
                            {result.isLocked ? <Lock className="h-3.5 w-3.5" /> : <Unlock className="h-3.5 w-3.5" />}
                            Network Lock
                          </span>
                          <Badge className={result.isLocked ? 'bg-amber-100 text-amber-700 border-0' : 'bg-green-100 text-green-700 border-0'}>
                            {result.isLocked ? `Locked${result.lockType ? ` (${result.lockType})` : ''}` : 'Unlocked'}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-dashed border-gray-100">
                          <span className="text-sm text-muted-foreground flex items-center gap-1">
                            <AlertCircle className="h-3.5 w-3.5" />
                            Blacklist
                          </span>
                          <Badge className={result.isBlacklisted ? 'bg-red-100 text-red-700 border-0' : 'bg-green-100 text-green-700 border-0'}>
                            {result.isBlacklisted ? 'Trong blacklist' : 'Sạch'}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-dashed border-gray-100">
                          <span className="text-sm text-muted-foreground flex items-center gap-1">
                            <Globe className="h-3.5 w-3.5" />
                            Kích hoạt
                          </span>
                          <span className="text-sm font-medium">{result.activationStatus}</span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-dashed border-gray-100">
                          <span className="text-sm text-muted-foreground flex items-center gap-1">
                            <Shield className="h-3.5 w-3.5" />
                            Bảo hành
                          </span>
                          <Badge className={result.warrantyStatus === 'Còn bảo hành' ? 'bg-green-100 text-green-700 border-0' : 'bg-gray-100 text-gray-700 border-0'}>
                            {result.warrantyStatus}
                          </Badge>
                        </div>
                        {result.warrantyExpiry && (
                          <div className="flex items-center justify-between py-2">
                            <span className="text-sm text-muted-foreground flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5" />
                              Hết hạn BH
                            </span>
                            <span className="text-sm font-medium">
                              {new Date(result.warrantyExpiry).toLocaleDateString('vi-VN')}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Warning */}
                  {result.isBlacklisted && (
                    <div className="mt-4 p-4 bg-red-50 rounded-xl border border-red-200">
                      <p className="text-sm text-red-700 font-medium flex items-start gap-2">
                        <XCircle className="h-4 w-4 shrink-0 mt-0.5" />
                        Thiết bị này có trong danh sách đen. Không nên mua thiết bị này vì có thể đã bị báo mất/cắp và sẽ không sử dụng được dịch vụ mạng.
                      </p>
                    </div>
                  )}
                  {result.isLocked && !result.isBlacklisted && (
                    <div className="mt-4 p-4 bg-amber-50 rounded-xl border border-amber-200">
                      <p className="text-sm text-amber-700 font-medium flex items-start gap-2">
                        <Lock className="h-4 w-4 shrink-0 mt-0.5" />
                        Thiết bị bị khóa mạng. Cần unlock trước khi sử dụng SIM Việt Nam. Liên hệ CELLPHONES để được hỗ trợ unlock.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Tips */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <QrCode className="h-4 w-4 text-[#e31837]" />
                  Cách tìm IMEI
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0 space-y-3">
                {[
                  { method: 'Gọi *#06#', sub: 'Cách nhanh nhất trên mọi điện thoại' },
                  { method: 'Cài đặt > Thông tin', sub: 'Settings > About Phone > Status' },
                  { method: 'Trên vỏ hộp', sub: 'In trên nhãn dán hộp máy' },
                  { method: 'Khay SIM', sub: 'Khắc trên khay SIM (dòng cũ)' },
                ].map(item => (
                  <div key={item.method} className="flex items-start gap-2 p-2 rounded-lg bg-gray-50">
                    <CheckCircle className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">{item.method}</p>
                      <p className="text-xs text-muted-foreground">{item.sub}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Why check */}
            <Card className="border-0 shadow-lg bg-slate-800 text-white">
              <CardContent className="p-5">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Tại sao cần kiểm tra?
                </h3>
                <div className="space-y-3">
                  {[
                    'Tránh mua máy báo mất/cắp',
                    'Xác minh máy lock hay unlock',
                    'Kiểm tra bảo hành còn không',
                    'Xác nhận nguồn gốc xuất xứ',
                  ].map(item => (
                    <div key={item} className="flex items-center gap-2 text-sm text-slate-300">
                      <CheckCircle className="h-3.5 w-3.5 text-green-400 shrink-0" />
                      {item}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* FAQ */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Info className="h-4 w-4 text-[#e31837]" />
                  Câu hỏi thường gặp
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0 space-y-4">
                {FAQ.map(faq => (
                  <div key={faq.q}>
                    <p className="text-sm font-semibold mb-1">{faq.q}</p>
                    <p className="text-xs text-muted-foreground">{faq.a}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

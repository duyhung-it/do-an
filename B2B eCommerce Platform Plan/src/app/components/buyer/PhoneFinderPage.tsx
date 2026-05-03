// ============================================================
// PhoneFinderPage — Gợi ý điện thoại theo nhu cầu (AI advisor)
// ============================================================
import { useState } from 'react';
import { Link } from 'react-router';
import {
  Smartphone, Zap, Camera, Battery, Gamepad2, Music, Globe,
  ChevronRight, Star, ShoppingCart, ArrowRight, RefreshCw, Sparkles,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Slider } from '../ui/slider';
import { AppBreadcrumb } from '../shared/AppBreadcrumb';
import { productApi } from '../../services/api';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import type { Product } from '../../types';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { toast } from 'sonner';

const formatPrice = (p: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p);

const USE_CASES = [
  { id: 'gaming', label: 'Chơi game', icon: Gamepad2, color: 'text-purple-600', bg: 'bg-purple-50 border-purple-200', desc: 'Chip mạnh, RAM lớn, màn hình 120Hz' },
  { id: 'photo', label: 'Chụp ảnh', icon: Camera, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200', desc: 'Camera chất lượng cao, zoom tốt' },
  { id: 'battery', label: 'Pin trâu', icon: Battery, color: 'text-green-600', bg: 'bg-green-50 border-green-200', desc: 'Dùng cả ngày không lo hết pin' },
  { id: 'business', label: 'Làm việc', icon: Globe, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200', desc: 'Màn hình lớn, đa nhiệm tốt' },
  { id: 'music', label: 'Nghe nhạc', icon: Music, color: 'text-pink-600', bg: 'bg-pink-50 border-pink-200', desc: 'Loa hay, Bluetooth 5.3+' },
  { id: 'speed', label: 'Nhanh nhất', icon: Zap, color: 'text-[#e31837]', bg: 'bg-red-50 border-red-200', desc: 'Hiệu năng cao nhất phân khúc' },
];

const OS_OPTIONS = [
  { value: 'ios', label: 'iOS (iPhone)', desc: 'Hệ sinh thái Apple, cập nhật lâu' },
  { value: 'android', label: 'Android', desc: 'Đa dạng, tuỳ chỉnh linh hoạt' },
  { value: 'any', label: 'Không quan tâm', desc: 'Tất cả đều được' },
];

const BRAND_OPTIONS = ['Không quan tâm', 'Apple', 'Samsung', 'Xiaomi', 'OPPO', 'Vivo'];

function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const { isAuthenticated } = useAuth();
  const [adding, setAdding] = useState(false);
  const discountPct = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0;

  const handleAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) { toast.error('Vui lòng đăng nhập'); return; }
    setAdding(true);
    try {
      await addItem({ productId: product.id, productName: product.name, productImage: product.images[0], brand: product.brand, quantity: 1, unitPrice: product.price });
      toast.success('Đã thêm vào giỏ');
    } finally { setAdding(false); }
  };

  return (
    <Link to={`/products/${product.id}`}>
      <Card className="border-0 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group bg-white h-full">
        <div className="aspect-square overflow-hidden relative bg-gray-50 rounded-t-xl">
          <ImageWithFallback
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {discountPct > 0 && (
            <div className="absolute top-2 left-2 bg-[#e31837] text-white text-xs font-bold px-2 py-1 rounded-lg">
              -{discountPct}%
            </div>
          )}
          {product.isNew && (
            <Badge className="absolute top-2 right-2 bg-green-500 text-white border-0 text-[10px]">Mới</Badge>
          )}
          <button
            className="absolute bottom-2 right-2 h-8 w-8 rounded-full bg-white/90 shadow flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={handleAdd}
            disabled={adding}
          >
            {adding ? <span className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" /> : <ShoppingCart className="h-4 w-4 text-[#e31837]" />}
          </button>
        </div>
        <CardContent className="p-3">
          <p className="text-xs text-muted-foreground mb-1">{product.brand}</p>
          <p className="text-sm font-medium line-clamp-2 mb-2">{product.name}</p>
          <div className="flex items-center gap-1 mb-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className={`h-3 w-3 ${i < Math.floor(product.rating) ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200'}`} />
            ))}
            <span className="text-xs text-muted-foreground">({product.reviewCount})</span>
          </div>
          <p className="text-[#e31837] font-bold">{formatPrice(product.price)}</p>
          {product.originalPrice && product.originalPrice > product.price && (
            <p className="text-xs text-muted-foreground line-through">{formatPrice(product.originalPrice)}</p>
          )}
          {product.phoneSpecs && (
            <div className="flex gap-1 flex-wrap mt-2">
              {[product.phoneSpecs.ram, product.phoneSpecs.storage, product.phoneSpecs.battery].filter(Boolean).slice(0, 3).map(spec => (
                <Badge key={spec} variant="secondary" className="text-[9px] px-1.5 py-0">{spec}</Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

export function PhoneFinderPage() {
  const [budget, setBudget] = useState([5000000, 15000000]);
  const [selectedUseCases, setSelectedUseCases] = useState<string[]>([]);
  const [selectedOs, setSelectedOs] = useState('any');
  const [selectedBrand, setSelectedBrand] = useState('Không quan tâm');
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const toggleUseCase = (id: string) => {
    setSelectedUseCases(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleFind = async () => {
    setLoading(true);
    setSearched(true);
    try {
      const res = await productApi.getPaginated(
        { page: 1, pageSize: 12 },
        undefined,
        {
          minPrice: budget[0],
          maxPrice: budget[1],
          ...(selectedBrand !== 'Không quan tâm' && { brand: selectedBrand }),
          ...(selectedOs === 'ios' && { brand: 'Apple' }),
          ...(selectedOs === 'android' && { NOT_brand: 'Apple' }),
        }
      );
      // Apply use case filtering on client side
      let filtered = res.data;
      if (selectedUseCases.includes('battery')) {
        filtered = filtered.filter(p => p.phoneSpecs?.battery && parseInt(p.phoneSpecs.battery) >= 4500);
      }
      if (selectedUseCases.includes('photo')) {
        filtered = filtered.sort((a, b) => {
          const aScore = parseInt(a.phoneSpecs?.camera || '0');
          const bScore = parseInt(b.phoneSpecs?.camera || '0');
          return bScore - aScore;
        });
      }
      if (selectedUseCases.includes('gaming')) {
        filtered = filtered.filter(p => p.phoneSpecs?.ram && parseInt(p.phoneSpecs.ram) >= 8);
      }
      // Sort by rating if no use case
      if (selectedUseCases.length === 0 || filtered.length < 4) {
        filtered = res.data.sort((a, b) => b.rating - a.rating);
      }
      setResults(filtered.slice(0, 9));
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setBudget([5000000, 15000000]);
    setSelectedUseCases([]);
    setSelectedOs('any');
    setSelectedBrand('Không quan tâm');
    setResults([]);
    setSearched(false);
  };

  return (
    <div>
      <div className="container mx-auto px-4 py-6">
        <AppBreadcrumb items={[{ label: 'Trang chủ', href: '/' }, { label: 'Gợi ý điện thoại' }]} />
      </div>

      {/* Hero */}
      <div className="bg-gradient-to-br from-purple-900 via-indigo-800 to-blue-800 py-12">
        <div className="container mx-auto px-4 text-center text-white">
          <div className="h-16 w-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Gợi ý điện thoại theo nhu cầu</h1>
          <p className="text-indigo-200 max-w-xl mx-auto">
            Trả lời vài câu hỏi, chúng tôi sẽ gợi ý điện thoại phù hợp nhất với bạn.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Filter form */}
          <div className="lg:col-span-1">
            <Card className="border-0 shadow-lg sticky top-24">
              <CardContent className="p-6 space-y-6">
                {/* Budget */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <span className="h-6 w-6 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 text-xs font-bold">1</span>
                    Ngân sách của bạn
                  </h3>
                  <div className="px-2">
                    <Slider
                      min={1000000}
                      max={40000000}
                      step={500000}
                      value={budget}
                      onValueChange={setBudget}
                      className="mb-3"
                    />
                    <div className="flex justify-between text-sm font-medium">
                      <span className="text-[#e31837]">{formatPrice(budget[0])}</span>
                      <span className="text-[#e31837]">{formatPrice(budget[1])}</span>
                    </div>
                  </div>
                </div>

                {/* Use cases */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <span className="h-6 w-6 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 text-xs font-bold">2</span>
                    Nhu cầu sử dụng (chọn nhiều)
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {USE_CASES.map(uc => {
                      const Icon = uc.icon;
                      const isSelected = selectedUseCases.includes(uc.id);
                      return (
                        <button
                          key={uc.id}
                          onClick={() => toggleUseCase(uc.id)}
                          className={`text-left p-3 rounded-xl border-2 transition-all ${
                            isSelected ? uc.bg + ' border-current' : 'border-gray-200 hover:border-gray-300 bg-white'
                          }`}
                        >
                          <Icon className={`h-5 w-5 mb-1 ${isSelected ? uc.color : 'text-gray-400'}`} />
                          <p className={`text-xs font-semibold ${isSelected ? uc.color : ''}`}>{uc.label}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* OS */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <span className="h-6 w-6 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 text-xs font-bold">3</span>
                    Hệ điều hành ưa thích
                  </h3>
                  <div className="space-y-2">
                    {OS_OPTIONS.map(os => (
                      <label key={os.value} className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${selectedOs === os.value ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-gray-300'}`}>
                        <input
                          type="radio"
                          name="os"
                          value={os.value}
                          checked={selectedOs === os.value}
                          onChange={e => setSelectedOs(e.target.value)}
                          className="accent-purple-600"
                        />
                        <div>
                          <p className="text-sm font-medium">{os.label}</p>
                          <p className="text-xs text-muted-foreground">{os.desc}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Brand */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <span className="h-6 w-6 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 text-xs font-bold">4</span>
                    Thương hiệu yêu thích
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {BRAND_OPTIONS.map(b => (
                      <button
                        key={b}
                        onClick={() => setSelectedBrand(b)}
                        className={`px-3 py-1.5 rounded-full text-sm border-2 font-medium transition-all ${
                          selectedBrand === b ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={handleReset}
                  >
                    <RefreshCw className="h-4 w-4 mr-1" /> Đặt lại
                  </Button>
                  <Button
                    className="flex-1 bg-purple-700 hover:bg-purple-800"
                    onClick={handleFind}
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <><Sparkles className="h-4 w-4 mr-1" /> Tìm máy</>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results */}
          <div className="lg:col-span-2">
            {!searched ? (
              <div className="text-center py-20">
                <Smartphone className="h-20 w-20 text-muted-foreground mx-auto mb-6 opacity-30" />
                <h2 className="text-xl font-semibold mb-3">Chọn tiêu chí để tìm máy phù hợp</h2>
                <p className="text-muted-foreground max-w-sm mx-auto">
                  Điền ngân sách, nhu cầu sử dụng và nhấn "Tìm máy" — chúng tôi sẽ gợi ý những chiếc điện thoại tốt nhất cho bạn.
                </p>
              </div>
            ) : loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="border-0 shadow animate-pulse">
                    <div className="aspect-square bg-gray-200 rounded-t-xl" />
                    <CardContent className="p-3 space-y-2">
                      <div className="h-3 bg-gray-200 rounded w-3/4" />
                      <div className="h-3 bg-gray-100 rounded w-full" />
                      <div className="h-4 bg-gray-200 rounded w-1/2" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : results.length === 0 ? (
              <div className="text-center py-16">
                <Sparkles className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-30" />
                <h3 className="text-lg font-semibold mb-2">Không tìm thấy sản phẩm phù hợp</h3>
                <p className="text-muted-foreground mb-6">Thử điều chỉnh ngân sách hoặc tiêu chí tìm kiếm</p>
                <Button variant="outline" onClick={handleReset}>Thử lại</Button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h2 className="font-bold text-lg">Gợi ý phù hợp với bạn</h2>
                    <p className="text-sm text-muted-foreground">Tìm thấy {results.length} điện thoại phù hợp</p>
                  </div>
                  <Link to="/products">
                    <Button variant="outline" size="sm">
                      Xem tất cả <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </Link>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {results.map(p => <ProductCard key={p.id} product={p} />)}
                </div>

                {/* Use case tips */}
                {selectedUseCases.length > 0 && (
                  <div className="mt-6 p-4 bg-purple-50 rounded-xl border border-purple-100">
                    <h3 className="font-semibold text-purple-800 mb-2">
                      Mẹo theo nhu cầu của bạn:
                    </h3>
                    <div className="space-y-2">
                      {selectedUseCases.map(uc => {
                        const useCase = USE_CASES.find(u => u.id === uc);
                        if (!useCase) return null;
                        return (
                          <div key={uc} className="flex items-start gap-2 text-sm text-purple-700">
                            <useCase.icon className="h-4 w-4 shrink-0 mt-0.5" />
                            <span><strong>{useCase.label}: </strong>{useCase.desc}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

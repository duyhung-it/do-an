// ============================================================
// StoreLocatorPage — Hệ thống cửa hàng + Kiểm tra tồn kho
// ============================================================
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router';
import {
  MapPin, Phone, Clock, Search, Navigation, CheckCircle,
  Package, Building2, ChevronRight, Star, Filter,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { AppBreadcrumb } from '../shared/AppBreadcrumb';
import { storeApi, productApi } from '../../services/api';
import type { StoreLocation, Product } from '../../types';
import { toast } from 'sonner';

const formatPrice = (p: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p);

const CITIES = ['Tất cả', 'Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng', 'Cần Thơ', 'Hải Phòng'];

export function StoreLocatorPage() {
  const [searchParams] = useSearchParams();
  const [stores, setStores] = useState<StoreLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCity, setSelectedCity] = useState('Tất cả');
  const [selectedStore, setSelectedStore] = useState<StoreLocation | null>(null);
  const [checkProduct, setCheckProduct] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [stockLoading, setStockLoading] = useState(false);
  const [stockResult, setStockResult] = useState<{ productId: string; productName: string; stock: number } | null>(null);

  const productId = searchParams.get('productId');

  useEffect(() => {
    Promise.all([
      storeApi.getAll(),
      productApi.getAll(),
    ]).then(([s, p]) => {
      setStores(s);
      setProducts(p.slice(0, 20));
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (productId) setCheckProduct(productId);
  }, [productId]);

  const filtered = stores.filter(s => {
    const matchCity = selectedCity === 'Tất cả' || s.city === selectedCity;
    const matchSearch = !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.address.toLowerCase().includes(search.toLowerCase()) || s.district.toLowerCase().includes(search.toLowerCase());
    return matchCity && matchSearch;
  });

  const handleCheckStock = async (store: StoreLocation) => {
    if (!checkProduct) {
      toast.error('Vui lòng chọn sản phẩm cần kiểm tra');
      return;
    }
    setStockLoading(true);
    setSelectedStore(store);
    try {
      const stock = await storeApi.checkAvailability(store.id, checkProduct);
      const product = products.find(p => p.id === checkProduct);
      setStockResult({ productId: checkProduct, productName: product?.name || checkProduct, stock });
    } finally {
      setStockLoading(false);
    }
  };

  return (
    <div>
      <div className="container mx-auto px-4 py-6">
        <AppBreadcrumb items={[{ label: 'Trang chủ', href: '/' }, { label: 'Hệ thống cửa hàng' }]} />
      </div>

      {/* Hero */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 py-12">
        <div className="container mx-auto px-4 text-center text-white">
          <div className="h-16 w-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <MapPin className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Hệ thống cửa hàng CELLPHONES</h1>
          <p className="text-slate-300 max-w-xl mx-auto mb-8">
            Hơn 200 cửa hàng trên toàn quốc. Tìm cửa hàng gần bạn nhất và kiểm tra tồn kho tức thì.
          </p>
          <div className="flex items-center justify-center gap-8">
            {[
              { label: '200+', sub: 'Cửa hàng' },
              { label: '63/63', sub: 'Tỉnh/thành' },
              { label: '8:00 – 21:30', sub: 'Giờ hoạt động' },
            ].map(s => (
              <div key={s.label} className="text-center">
                <p className="text-xl font-bold">{s.label}</p>
                <p className="text-slate-400 text-xs">{s.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Check stock section */}
        <Card className="border-0 shadow-lg mb-8 overflow-hidden">
          <div className="bg-blue-600 p-5">
            <h2 className="text-white font-bold text-lg flex items-center gap-2">
              <Package className="h-5 w-5" />
              Kiểm tra tồn kho tại cửa hàng
            </h2>
            <p className="text-blue-100 text-sm mt-1">Chọn sản phẩm và cửa hàng để kiểm tra ngay</p>
          </div>
          <CardContent className="p-5">
            <div className="flex gap-3">
              <div className="flex-1">
                <select
                  className="w-full h-10 border rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={checkProduct}
                  onChange={e => { setCheckProduct(e.target.value); setStockResult(null); }}
                >
                  <option value="">-- Chọn sản phẩm --</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              {stockResult && (
                <div className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${stockResult.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {stockResult.stock > 0 ? (
                    <><CheckCircle className="h-4 w-4" /> Còn {stockResult.stock} máy tại {selectedStore?.name}</>
                  ) : (
                    <><Package className="h-4 w-4" /> Hết hàng tại {selectedStore?.name}</>
                  )}
                </div>
              )}
            </div>
            {checkProduct && (
              <p className="text-xs text-muted-foreground mt-2">
                Chọn một cửa hàng bên dưới và nhấn "Kiểm tra tồn kho"
              </p>
            )}
          </CardContent>
        </Card>

        {/* Search & filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-10"
              placeholder="Tìm theo tên, địa chỉ, quận..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2 overflow-x-auto">
            {CITIES.map(city => (
              <button
                key={city}
                onClick={() => setSelectedCity(city)}
                className={`px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                  selectedCity === city
                    ? 'bg-blue-600 text-white'
                    : 'border border-gray-200 hover:border-blue-300 text-gray-600'
                }`}
              >
                {city}
              </button>
            ))}
          </div>
        </div>

        <p className="text-sm text-muted-foreground mb-4">
          Tìm thấy <span className="font-semibold text-foreground">{filtered.length}</span> cửa hàng
          {selectedCity !== 'Tất cả' && ` tại ${selectedCity}`}
        </p>

        {/* Store list */}
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="border-0 shadow animate-pulse h-48">
                <CardContent className="p-5 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-100 rounded w-full" />
                  <div className="h-3 bg-gray-100 rounded w-2/3" />
                </CardContent>
              </Card>
            ))
          ) : filtered.length === 0 ? (
            <div className="col-span-3 text-center py-12">
              <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-40" />
              <p className="text-muted-foreground">Không tìm thấy cửa hàng phù hợp</p>
            </div>
          ) : (
            filtered.map(store => {
              const isChecked = selectedStore?.id === store.id && stockResult?.productId === checkProduct;
              return (
                <Card
                  key={store.id}
                  className={`border-0 shadow-sm hover:shadow-md transition-all duration-200 ${
                    selectedStore?.id === store.id ? 'ring-2 ring-blue-500' : ''
                  }`}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-2">
                        <div className="h-9 w-9 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
                          <Building2 className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-bold text-sm leading-tight">{store.name}</h3>
                          <Badge className="bg-green-100 text-green-700 border-0 text-[10px] mt-1">
                            Đang hoạt động
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-start gap-2 text-sm">
                        <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
                        <span className="text-muted-foreground text-xs leading-relaxed">{store.address}, {store.district}, {store.city}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Phone className="h-3.5 w-3.5 shrink-0" />
                        <a href={`tel:${store.phone}`} className="hover:text-[#e31837]">{store.phone}</a>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3.5 w-3.5 shrink-0" />
                        <span>{store.workingHours}</span>
                      </div>
                    </div>

                    {/* Stock result */}
                    {isChecked && stockResult && (
                      <div className={`mb-3 p-2.5 rounded-lg text-xs font-medium flex items-center gap-2 ${
                        stockResult.stock > 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                      }`}>
                        {stockResult.stock > 0 ? (
                          <><CheckCircle className="h-3.5 w-3.5" />Còn {stockResult.stock} máy</>
                        ) : (
                          <><Package className="h-3.5 w-3.5" />Hết hàng</>
                        )}
                      </div>
                    )}

                    <div className="flex gap-2">
                      {checkProduct && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 text-xs"
                          onClick={() => handleCheckStock(store)}
                          disabled={stockLoading && selectedStore?.id === store.id}
                        >
                          {stockLoading && selectedStore?.id === store.id ? (
                            <span className="h-3 w-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <><Package className="h-3 w-3 mr-1" />Tồn kho</>
                          )}
                        </Button>
                      )}
                      {store.mapUrl ? (
                        <a href={store.mapUrl} target="_blank" rel="noopener noreferrer" className="flex-1">
                          <Button size="sm" className="w-full text-xs bg-blue-600 hover:bg-blue-700">
                            <Navigation className="h-3 w-3 mr-1" />Chỉ đường
                          </Button>
                        </a>
                      ) : (
                        <Button
                          size="sm"
                          className="flex-1 text-xs bg-blue-600 hover:bg-blue-700"
                          onClick={() => window.open(`https://maps.google.com/?q=${encodeURIComponent(store.address + ', ' + store.city)}`, '_blank')}
                        >
                          <Navigation className="h-3 w-3 mr-1" />Chỉ đường
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

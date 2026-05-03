// ============================================================
// Chi tiết NCC — Buyer (P3 Đợt 6: P3.06–P3.08)
// Hero header, animated tabs, stats grid, map mock
// ============================================================

import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import {
  Star, ShieldCheck, MapPin, Phone, Mail, Calendar, MessageSquare,
  ShoppingCart, Award, Scale, Building2, Globe, Package, FileText,
  TrendingUp, Users, ChevronRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { AppBreadcrumb } from '../shared/AppBreadcrumb';
import { DetailSkeleton } from '../shared/PageSkeleton';
import { IconWrapper } from '../shared/IconWrapper';
import { ProgressRing } from '../shared/ProgressRing';
import { StatusBadge } from '../shared/StatusBadge';
import {
  supplierApi, productApi, chatApi, certificateSellerApi,
  supplierReviewApi, supplierScorecardApi,
} from '../../services/api';
import {
  StarDistributionBar, SupplierReviewItem, WriteSupplierReviewDialog,
} from '../shared/ReviewComponents';
import { ScorecardDetail } from './BuyerSupplierComparePage';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import type { Supplier, Product, BusinessCertificate, SupplierReview, SupplierScorecard } from '../../types';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { toast } from 'sonner';
import { slaApi } from '../../services/slaApi';
import type { SLADefinition, SLAReport } from '../../types';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell,
} from 'recharts';

const formatPrice = (price: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(price);

type TabKey = 'products' | 'certificates' | 'reviews' | 'scorecard' | 'sla' | 'contact';

// ─── Star Rating (reusable) ──────────────────────────────
function StarRating({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'lg' }) {
  const s = size === 'lg' ? 'h-5 w-5' : 'h-3.5 w-3.5';
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={`${s} ${i < Math.floor(rating) ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/20'}`} />
      ))}
    </div>
  );
}

export function SupplierDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { addItem } = useCart();
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [certificates, setCertificates] = useState<BusinessCertificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>('products');
  const [scorecard, setScorecard] = useState<SupplierScorecard | null>(null);

  // Reviews
  const [supplierReviews, setSupplierReviews] = useState<SupplierReview[]>([]);
  const [reviewTotal, setReviewTotal] = useState(0);
  const [reviewPage, setReviewPage] = useState(1);
  const [starDistribution, setStarDistribution] = useState<{ star: number; count: number }[]>([]);
  const [avgRating, setAvgRating] = useState(0);
  const [showWriteReview, setShowWriteReview] = useState(false);

  // SLA
  const [supplierSLAs, setSupplierSLAs] = useState<SLADefinition[]>([]);
  const [slaReports, setSlaReports] = useState<SLAReport[]>([]);
  const [selectedSLA, setSelectedSLA] = useState<SLADefinition | null>(null);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      supplierApi.getById(id), productApi.getBySupplier(id),
      certificateSellerApi.getVerifiedBySeller(id),
      supplierReviewApi.getStarDistribution(id),
      supplierScorecardApi.getScorecard(id),
      slaApi.getBySupplier(id),
    ]).then(([s, prods, certs, dist, sc, slas]) => {
      if (s) setSupplier(s);
      setProducts(prods);
      setCertificates(certs);
      setStarDistribution(dist);
      const total = dist.reduce((acc, d) => acc + d.count, 0);
      const avg = total > 0 ? dist.reduce((acc, d) => acc + d.star * d.count, 0) / total : 0;
      setAvgRating(avg); setReviewTotal(total);
      if (sc) setScorecard(sc);
      setSupplierSLAs(slas);
      if (slas.length > 0) {
        setSelectedSLA(slas[0]);
        slaApi.getReports(slas[0].id).then(rpts => setSlaReports(rpts));
      }
      setLoading(false);
    });
  }, [id]);

  useEffect(() => {
    if (!id) return;
    supplierReviewApi.getBySupplierId(id, { page: reviewPage, pageSize: 5 }).then(res => {
      setSupplierReviews(res.data); setReviewTotal(res.total);
    });
  }, [id, reviewPage]);

  const handleChat = async () => {
    if (!isAuthenticated || !user || !supplier) { toast.error('Vui lòng đăng nhập'); return; }
    const conv = await chatApi.createConversation(user.id, user.fullName, supplier.id, supplier.companyName);
    navigate(`/chat?conv=${conv.id}`);
  };

  const handleAddToCart = async (product: Product, e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (!isAuthenticated) { toast.error('Vui lòng đăng nhập'); navigate('/login'); return; }
    setAddingToCart(product.id);
    try {
      await addItem({
        productId: product.id, productName: product.name, productImage: product.images[0],
        supplierId: product.supplierId, supplierName: product.supplierName,
        quantity: product.minOrderQty, unitPrice: product.price,
      });
      toast.success(`Đã thêm "${product.name}" vào giỏ hàng`);
    } finally { setAddingToCart(null); }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <AppBreadcrumb items={[{ label: 'Nhà cung cấp', href: '/suppliers' }, { label: 'Chi tiết' }]} />
        <DetailSkeleton />
      </div>
    );
  }
  if (!supplier) {
    return (
      <div className="container mx-auto px-4 py-6 text-center py-16">
        <p className="text-muted-foreground">Không tìm thấy nhà cung cấp.</p>
        <Link to="/suppliers" className="text-primary hover:underline mt-2 block">Quay lại</Link>
      </div>
    );
  }

  const tabs: { key: TabKey; label: string; icon: typeof Package; count?: number }[] = [
    { key: 'products', label: 'Sản phẩm', icon: Package, count: products.length },
    { key: 'certificates', label: 'Chứng chỉ', icon: Award, count: certificates.length },
    { key: 'reviews', label: 'Đánh giá', icon: Star, count: reviewTotal },
    ...(scorecard ? [{ key: 'scorecard' as TabKey, label: 'Điểm NCC', icon: Scale }] : []),
    ...(selectedSLA ? [{ key: 'sla' as TabKey, label: 'SLA', icon: ShieldCheck }] : []),
    { key: 'contact', label: 'Liên hệ', icon: Mail },
  ];

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <AppBreadcrumb items={[{ label: 'Nhà cung cấp', href: '/suppliers' }, { label: supplier.companyName }]} />

      {/* P3.06: Hero Header — cover + avatar overlap */}
      <div className="relative rounded-2xl overflow-hidden">
        <div className="h-48 md:h-64">
          <ImageWithFallback src={supplier.coverUrl} alt={supplier.companyName} className="w-full h-full object-cover" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Content overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
            {/* P3.06: Avatar overlap */}
            <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-card border-4 border-background shadow-lg flex items-center justify-center overflow-hidden -mb-0 sm:-mb-4">
              <Building2 className="h-8 w-8 text-primary" />
            </div>

            <div className="flex-1 text-white">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h1 style={{ fontFamily: 'var(--font-heading)' }}>{supplier.companyName}</h1>
                {/* P3.06: Verified badge */}
                {supplier.isVerified && (
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-blue-500 text-white text-xs">
                    <ShieldCheck className="h-3.5 w-3.5" /> Đã xác minh
                  </div>
                )}
              </div>
              <p className="text-white/80 text-sm">{supplier.description}</p>
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                {/* P3.06: Rating */}
                <div className="flex items-center gap-1.5">
                  <StarRating rating={supplier.rating} size="sm" />
                  <span className="text-sm text-white/90" style={{ fontFamily: 'var(--font-heading)' }}>{supplier.rating}</span>
                  <span className="text-xs text-white/60">({supplier.reviewCount})</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-white/60">
                  <MapPin className="h-3 w-3" /> {supplier.city}
                </div>
                <div className="flex items-center gap-1 text-xs text-white/60">
                  <Calendar className="h-3 w-3" /> Từ {supplier.yearEstablished}
                </div>
              </div>
            </div>

            {/* CTA buttons */}
            <div className="flex gap-2 shrink-0">
              <Button onClick={handleChat} className="gap-1.5">
                <MessageSquare className="h-4 w-4" /> Nhắn tin
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* P3.08: Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="border-l-4 border-l-primary">
          <CardContent className="p-3 flex items-center gap-2">
            <IconWrapper icon={Package} variant="primary" size="sm" />
            <div>
              <p className="text-sm" style={{ fontFamily: 'var(--font-heading)' }}>{supplier.productCount}</p>
              <p className="text-[10px] text-muted-foreground">Sản phẩm</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-amber-500">
          <CardContent className="p-3 flex items-center gap-2">
            <IconWrapper icon={Star} variant="warning" size="sm" />
            <div>
              <p className="text-sm" style={{ fontFamily: 'var(--font-heading)' }}>{supplier.rating}/5.0</p>
              <p className="text-[10px] text-muted-foreground">{supplier.reviewCount} đánh giá</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-emerald-500">
          <CardContent className="p-3 flex items-center gap-2">
            <IconWrapper icon={Award} variant="success" size="sm" />
            <div>
              <p className="text-sm" style={{ fontFamily: 'var(--font-heading)' }}>{certificates.length}</p>
              <p className="text-[10px] text-muted-foreground">Chứng chỉ</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-3 flex items-center gap-2">
            <IconWrapper icon={Calendar} variant="purple" size="sm" />
            <div>
              <p className="text-sm" style={{ fontFamily: 'var(--font-heading)' }}>{new Date().getFullYear() - supplier.yearEstablished} năm</p>
              <p className="text-[10px] text-muted-foreground">Hoạt động</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* P3.07: Animated tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 -mx-1 px-1 border-b">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm transition-all whitespace-nowrap border-b-2 ${
                isActive
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${isActive ? 'bg-primary/10' : 'bg-muted'}`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div>
        {/* Products */}
        {activeTab === 'products' && (
          <div>
            {products.length > 6 && (
              <div className="flex justify-end mb-3">
                <Link to={`/products?supplierName=${encodeURIComponent(supplier.companyName)}`} className="text-primary hover:underline text-sm">
                  Xem tất cả →
                </Link>
              </div>
            )}
            {products.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>Chưa có sản phẩm</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {products.map(product => (
                  <Link key={product.id} to={`/products/${product.id}`}>
                    <Card className="hover:shadow-md hover:-translate-y-0.5 transition-all h-full group overflow-hidden">
                      <div className="aspect-[4/3] overflow-hidden relative">
                        <ImageWithFallback src={product.images[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        <button
                          className="absolute bottom-2 right-2 h-8 w-8 rounded-lg bg-primary text-primary-foreground shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={e => handleAddToCart(product, e)}
                          disabled={addingToCart === product.id}
                        >
                          {addingToCart === product.id
                            ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                            : <ShoppingCart className="h-4 w-4" />
                          }
                        </button>
                      </div>
                      <CardContent className="p-3">
                        <p className="line-clamp-2 text-sm mb-1">{product.name}</p>
                        <p className="text-primary" style={{ fontFamily: 'var(--font-heading)' }}>{formatPrice(product.price)}</p>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-muted-foreground text-xs">MOQ: {product.minOrderQty} {product.unit}</span>
                          <div className="flex items-center gap-0.5">
                            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                            <span className="text-xs">{product.rating}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Reviews */}
        {activeTab === 'reviews' && (
          <div className="space-y-4">
            <StarDistributionBar distribution={starDistribution} total={reviewTotal} avgRating={avgRating} />
            <div className="flex justify-end">
              <Button onClick={() => setShowWriteReview(true)}>
                <Star className="mr-2 h-4 w-4" /> Viết đánh giá
              </Button>
            </div>
            <Card>
              <CardContent className="p-5 space-y-4">
                {supplierReviews.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">Chưa có đánh giá</p>
                ) : (
                  supplierReviews.map(review => (
                    <SupplierReviewItem
                      key={review.id}
                      review={review}
                      onHelpful={async (rid) => {
                        const updated = await supplierReviewApi.toggleHelpful(rid);
                        setSupplierReviews(prev => prev.map(r => r.id === updated.id ? updated : r));
                      }}
                    />
                  ))
                )}
                {reviewTotal > 5 && (
                  <div className="flex items-center justify-center gap-2 pt-4">
                    <Button variant="outline" size="sm" disabled={reviewPage <= 1} onClick={() => setReviewPage(p => p - 1)}>Trước</Button>
                    <span className="text-muted-foreground text-sm">Trang {reviewPage} / {Math.ceil(reviewTotal / 5)}</span>
                    <Button variant="outline" size="sm" disabled={reviewPage >= Math.ceil(reviewTotal / 5)} onClick={() => setReviewPage(p => p + 1)}>Sau</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Certificates */}
        {activeTab === 'certificates' && (
          <div className="space-y-3">
            {certificates.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Award className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>Chưa có chứng chỉ</p>
              </div>
            ) : (
              certificates.map(cert => {
                const isExpired = new Date(cert.expiryDate) < new Date();
                return (
                  <Card key={cert.id} className="hover:shadow-sm transition-shadow">
                    <CardContent className="p-4 flex items-center gap-3">
                      <IconWrapper icon={Award} variant={isExpired ? 'danger' : 'success'} size="sm" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span style={{ fontFamily: 'var(--font-heading)' }}>{cert.name}</span>
                          <Badge variant="outline" className="text-xs">{cert.type}</Badge>
                          {isExpired
                            ? <Badge variant="destructive" className="text-xs">Hết hạn</Badge>
                            : <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-xs">Đã xác minh</Badge>
                          }
                        </div>
                        <p className="text-muted-foreground text-sm mt-0.5">{cert.issuedBy} — Hạn: {cert.expiryDate}</p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        )}

        {/* Scorecard */}
        {activeTab === 'scorecard' && scorecard && (
          <Card><CardContent className="p-5"><ScorecardDetail scorecard={scorecard} /></CardContent></Card>
        )}

        {/* SLA */}
        {activeTab === 'sla' && selectedSLA && (
          <div className="space-y-4">
            <Card>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p style={{ fontFamily: 'var(--font-heading)' }}>{selectedSLA.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedSLA.slaNumber} · Điểm: {selectedSLA.currentScore}/100</p>
                </div>
                <StatusBadge status={selectedSLA.status} />
              </CardContent>
            </Card>
            {slaReports.length > 0 && (() => {
              const latest = slaReports[slaReports.length - 1];
              const radarData = latest.metrics.map(m => ({
                metric: m.metric.replace('Tỷ lệ ', '').replace('Thời gian ', 'TG '),
                actual: m.score, target: 100,
              }));
              const barData = latest.metrics.map(m => ({
                name: m.metric.replace('Tỷ lệ ', '').replace('Thời gian ', 'TG '),
                score: m.score,
                fill: m.status === 'Đạt' ? '#22c55e' : m.status === 'Cảnh báo' ? '#f59e0b' : '#ef4444',
              }));
              return (
                <>
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-sm mb-3" style={{ fontFamily: 'var(--font-heading)' }}>Radar — Kỳ {latest.period}</p>
                      <ResponsiveContainer width="100%" height={220}>
                        <RadarChart data={radarData}>
                          <PolarGrid /><PolarAngleAxis dataKey="metric" tick={{ fontSize: 10 }} /><PolarRadiusAxis domain={[0, 100]} />
                          <Radar name="Thực tế" dataKey="actual" stroke="#6366f1" fill="#6366f1" fillOpacity={0.3} />
                          <Radar name="Mục tiêu" dataKey="target" stroke="#d1d5db" fill="#d1d5db" fillOpacity={0.1} />
                          <Legend />
                        </RadarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                  <div className="space-y-2">
                    {latest.metrics.map(m => (
                      <div key={m.metricId} className="flex items-center justify-between p-2.5 rounded-xl bg-muted/20 border border-border/40 text-sm">
                        <span>{m.metric}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">Mục tiêu: {m.target} · Thực tế: {m.actual}</span>
                          <Badge className={`text-[10px] ${
                            m.status === 'Đạt' ? 'bg-emerald-100 text-emerald-700' :
                            m.status === 'Cảnh báo' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                          }`}>{m.status}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              );
            })()}
          </div>
        )}

        {/* P3.08: Contact tab — address map mock */}
        {activeTab === 'contact' && (
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardContent className="p-5 space-y-4">
                <p style={{ fontFamily: 'var(--font-heading)' }}>Thông tin liên hệ</p>
                <div className="space-y-3">
                  {[
                    { icon: Mail, label: 'Email', value: supplier.email },
                    { icon: Phone, label: 'Điện thoại', value: supplier.phone },
                    { icon: MapPin, label: 'Địa chỉ', value: `${supplier.address}, ${supplier.city}` },
                    { icon: Calendar, label: 'Thành lập', value: String(supplier.yearEstablished) },
                    { icon: Globe, label: 'Website', value: supplier.website || '—' },
                    { icon: Users, label: 'Nhân viên', value: supplier.employees ? `${supplier.employees.toLocaleString()} người` : '—' },
                    { icon: Building2, label: 'Năng lực SX', value: supplier.productionCapacity || '—' },
                  ].map(item => {
                    const Icon = item.icon;
                    return (
                      <div key={item.label} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors">
                        <IconWrapper icon={Icon} variant="neutral" size="xs" />
                        <div>
                          <p className="text-xs text-muted-foreground">{item.label}</p>
                          <p className="text-sm">{item.value}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <Separator />
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button className="flex-1 gap-1.5" onClick={handleChat}>
                    <MessageSquare className="h-4 w-4" /> Nhắn tin ngay
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* P3.08: Map mock */}
            <Card className="overflow-hidden">
              <div className="h-full min-h-[300px] bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/10 dark:to-blue-900/10 flex flex-col items-center justify-center p-6">
                <MapPin className="h-12 w-12 text-primary mb-3" />
                <p style={{ fontFamily: 'var(--font-heading)' }} className="text-primary mb-1">{supplier.city}</p>
                <p className="text-sm text-muted-foreground text-center">{supplier.address}</p>
                <div className="mt-4 w-full max-w-xs h-32 rounded-xl bg-white/60 dark:bg-card/40 border border-primary/10 flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <Globe className="h-8 w-8 mx-auto mb-1 opacity-40" />
                    <p className="text-xs">Bản đồ (Mock)</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Write review dialog */}
      <WriteSupplierReviewDialog
        open={showWriteReview}
        onOpenChange={setShowWriteReview}
        supplierName={supplier.companyName}
        onSubmit={async (data) => {
          const newReview = await supplierReviewApi.create({
            supplierId: supplier.id, supplierName: supplier.companyName,
            buyerId: user?.id ?? 'user-001', buyerName: user?.fullName ?? 'Người dùng',
            buyerCompany: user?.companyName ?? 'Công ty',
            rating: data.rating, comment: data.comment, tags: data.tags,
          });
          setSupplierReviews(prev => [newReview, ...prev]);
          setReviewTotal(prev => prev + 1);
          setShowWriteReview(false);
          toast.success('Đã gửi đánh giá');
        }}
      />
    </div>
  );
}
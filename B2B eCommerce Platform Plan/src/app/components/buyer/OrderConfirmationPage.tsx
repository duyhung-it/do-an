// ============================================================
// Trang xác nhận đặt hàng — Redesign UI-E Đợt 18
// E18.07–E18.08: Timeline step, celebration animation
// ============================================================

import { useEffect, useState, useRef } from 'react';
import { Link, useLocation } from 'react-router';
import {
  CheckCircle2, Package, ArrowRight, Home, Copy,
  ShoppingCart, ClipboardCheck, Truck, PackageCheck,
} from 'lucide-react';
import { motion } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { copyToClipboard } from '../ui/utils';
import { orderApi } from '../../services/api';
import { toast } from 'sonner';

const formatPrice = (price: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

// Confetti animation
function Confetti() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ['#3b82f6', '#6366f1', '#8b5cf6', '#059669', '#f59e0b', '#ec4899', '#ef4444', '#06b6d4'];
    const particles: Array<{
      x: number; y: number; vx: number; vy: number;
      size: number; color: string; rotation: number; rotSpeed: number;
      life: number; shape: 'rect' | 'circle';
    }> = [];

    for (let i = 0; i < 150; i++) {
      particles.push({
        x: canvas.width / 2 + (Math.random() - 0.5) * 300,
        y: canvas.height / 3,
        vx: (Math.random() - 0.5) * 14,
        vy: Math.random() * -14 - 3,
        size: Math.random() * 8 + 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 12,
        life: 1,
        shape: Math.random() > 0.5 ? 'rect' : 'circle',
      });
    }

    let animId: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;
      for (const p of particles) {
        if (p.life <= 0) continue;
        alive = true;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.18;
        p.rotation += p.rotSpeed;
        p.life -= 0.007;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = p.color;
        if (p.shape === 'circle') {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        }
        ctx.restore();
      }
      if (alive) animId = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-50" style={{ width: '100vw', height: '100vh' }} />
  );
}

// E18.07: Order progress timeline
function OrderTimeline() {
  const steps = [
    { icon: ShoppingCart, label: 'Đặt hàng', desc: 'Đơn hàng đã được tạo', active: true, done: true },
    { icon: ClipboardCheck, label: 'Xác nhận', desc: 'Chờ NCC xác nhận', active: true, done: false },
    { icon: Truck, label: 'Vận chuyển', desc: 'Đang chuẩn bị giao', active: false, done: false },
    { icon: PackageCheck, label: 'Nhận hàng', desc: 'Giao hàng thành công', active: false, done: false },
  ];

  return (
    <div className="flex items-center justify-between max-w-lg mx-auto my-8">
      {steps.map((step, idx) => (
        <div key={step.label} className="flex items-center flex-1 last:flex-none">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.8 + idx * 0.15, type: 'spring' }}
            className="flex flex-col items-center relative"
          >
            <div className={`
              h-10 w-10 rounded-full flex items-center justify-center transition-all
              ${step.done ? 'bg-emerald-500 text-white shadow-md' : ''}
              ${step.active && !step.done ? 'bg-primary/20 text-primary ring-2 ring-primary/30' : ''}
              ${!step.active ? 'bg-muted text-muted-foreground' : ''}
            `}>
              {step.done ? (
                <CheckCircle2 className="h-5 w-5" />
              ) : (
                <step.icon className="h-4 w-4" />
              )}
            </div>
            <p className={`text-xs mt-1.5 text-center ${step.active ? '' : 'text-muted-foreground'}`} style={step.active ? { fontWeight: 500 } : {}}>
              {step.label}
            </p>
            <p className="text-[10px] text-muted-foreground text-center hidden sm:block">{step.desc}</p>
          </motion.div>
          {idx < steps.length - 1 && (
            <div className={`flex-1 h-0.5 mx-2 rounded-full ${step.done ? 'bg-emerald-500' : step.active ? 'bg-primary/30' : 'bg-muted'}`} />
          )}
        </div>
      ))}
    </div>
  );
}

interface OrderData {
  id: string;
  orderNumber: string;
  supplierName: string;
  totalAmount: number;
  items: Array<{ productName: string; quantity: number }>;
}

export function OrderConfirmationPage() {
  const location = useLocation();
  const [showConfetti, setShowConfetti] = useState(true);

  const state = location.state as {
    orders?: OrderData[];
    poNumber?: string;
    paymentMethod?: string;
    shippingAddress?: string;
    discount?: number;
  } | null;

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  if (!state?.orders?.length) {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-16 text-center">
        <div className="h-20 w-20 mx-auto mb-4 rounded-2xl bg-muted/50 flex items-center justify-center">
          <Package className="h-10 w-10 text-muted-foreground" />
        </div>
        <h2 className="mb-2" style={{ fontFamily: 'var(--font-heading)' }}>Không có thông tin đơn hàng</h2>
        <p className="text-muted-foreground mb-6">Đơn hàng không tồn tại hoặc đã hết phiên</p>
        <Link to="/cart"><Button>Quay lại giỏ hàng</Button></Link>
      </div>
    );
  }

  const { orders, poNumber, paymentMethod, shippingAddress, discount } = state;
  const grandTotal = orders.reduce((s, o) => s + o.totalAmount, 0) - (discount ?? 0);

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6">
      {showConfetti && <Confetti />}

      <div className="max-w-2xl mx-auto">
        {/* E18.08: Animated check mark */}
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
            className="mb-6"
          >
            <div className="h-24 w-24 mx-auto rounded-full bg-gradient-to-br from-emerald-100 to-green-100 dark:from-emerald-900/30 dark:to-green-900/30 flex items-center justify-center shadow-lg">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.5, type: 'spring', stiffness: 150 }}
              >
                <CheckCircle2 className="h-14 w-14 text-emerald-600" />
              </motion.div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
            <h1 className="text-emerald-600 mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
              Đặt hàng thành công!
            </h1>
            <p className="text-muted-foreground">
              {orders.length === 1
                ? `Đơn hàng ${orders[0].orderNumber} đã được tạo`
                : `Đã tạo ${orders.length} đơn hàng thành công`}
            </p>
          </motion.div>
        </div>

        {/* E18.07: Timeline */}
        <OrderTimeline />

        {/* Order cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="space-y-4"
        >
          {orders.map(order => (
            <Card key={order.id} className="border-0 shadow-sm overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-blue-500 to-indigo-500" />
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm" style={{ fontWeight: 600 }}>Đơn #{order.orderNumber}</p>
                      <Badge variant="secondary" className="text-[10px]">Chờ xác nhận</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{order.supplierName}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      className="h-7 w-7 rounded-lg hover:bg-muted flex items-center justify-center transition-colors"
                      onClick={() => { copyToClipboard(order.orderNumber); toast.success('Đã sao chép mã đơn'); }}
                    >
                      <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                    <span className="text-primary text-sm" style={{ fontWeight: 600 }}>{formatPrice(order.totalAmount)}</span>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground space-y-0.5">
                  {order.items.slice(0, 3).map((item, i) => (
                    <p key={i}>{item.productName} × {item.quantity}</p>
                  ))}
                  {order.items.length > 3 && (
                    <p>... và {order.items.length - 3} sản phẩm khác</p>
                  )}
                </div>
                <Link to={`/orders/${order.id}`}>
                  <Button variant="outline" size="sm" className="w-full text-xs">
                    Xem chi tiết đơn <ArrowRight className="h-3.5 w-3.5 ml-1" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}

          {/* Summary */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4 space-y-2 text-sm">
              {shippingAddress && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Giao hàng</span>
                  <span className="text-right max-w-[60%]">{shippingAddress}</span>
                </div>
              )}
              {paymentMethod && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Thanh toán</span>
                  <span>{paymentMethod}</span>
                </div>
              )}
              {poNumber && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Số PO</span>
                  <span>{poNumber}</span>
                </div>
              )}
              {(discount ?? 0) > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Giảm giá</span>
                  <span>-{formatPrice(discount!)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between items-baseline">
                <span style={{ fontWeight: 600 }}>Tổng cộng</span>
                <span className="text-primary text-lg" style={{ fontFamily: 'var(--font-heading)', fontWeight: 700 }}>
                  {formatPrice(grandTotal)}
                </span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="flex flex-col sm:flex-row gap-3 justify-center mt-8"
        >
          <Link to="/orders">
            <Button size="lg" className="w-full sm:w-auto">
              <Package className="h-4 w-4 mr-2" /> Quản lý đơn hàng
            </Button>
          </Link>
          <Link to="/">
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              <Home className="h-4 w-4 mr-2" /> Tiếp tục mua sắm
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
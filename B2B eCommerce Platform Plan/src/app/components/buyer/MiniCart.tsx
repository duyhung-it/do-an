// ============================================================
// MiniCart dropdown — Hiển thị 3 SP gần nhất, tổng tiền, nút xem giỏ
// ============================================================

import { Link } from 'react-router';
import { ShoppingCart, Trash2, ArrowRight } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import {
  Popover, PopoverContent, PopoverTrigger,
} from '../ui/popover';
import { useCart } from '../../context/CartContext';
import { ImageWithFallback } from '../figma/ImageWithFallback';

const formatPrice = (price: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

export function MiniCart() {
  const { items, itemCount, removeItem } = useCart();
  const recentItems = items.slice(-3).reverse();
  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <ShoppingCart className="h-5 w-5" />
          {itemCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 min-w-5 px-1 flex items-center justify-center rounded-full"
            >
              {itemCount > 99 ? '99+' : itemCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-3 border-b">
          <p className="font-medium">Giỏ hàng ({itemCount} SP)</p>
        </div>

        {items.length === 0 ? (
          <div className="p-6 text-center text-muted-foreground">
            <ShoppingCart className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Giỏ hàng trống</p>
          </div>
        ) : (
          <>
            <div className="max-h-60 overflow-y-auto divide-y">
              {recentItems.map(item => (
                <div key={item.id} className="p-3 flex gap-3">
                  <div className="w-12 h-12 rounded-md overflow-hidden shrink-0">
                    <ImageWithFallback
                      src={item.productImage}
                      alt={item.productName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate">{item.productName}</p>
                    <p className="text-muted-foreground">
                      {item.quantity} × {formatPrice(item.unitPrice)}
                    </p>
                  </div>
                  <Button
                    variant="ghost" size="sm" className="shrink-0 h-8 w-8 p-0"
                    onClick={() => removeItem(item.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>

            {items.length > 3 && (
              <p className="px-3 py-1 text-muted-foreground text-center">
                ... và {items.length - 3} sản phẩm khác
              </p>
            )}

            <Separator />

            <div className="p-3 space-y-3">
              <div className="flex justify-between font-medium">
                <span>Tạm tính</span>
                <span className="text-primary">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex gap-2">
                <Link to="/cart" className="flex-1">
                  <Button variant="outline" className="w-full">
                    Xem giỏ hàng
                  </Button>
                </Link>
                <Link to="/cart" className="flex-1">
                  <Button className="w-full">
                    Thanh toán <ArrowRight className="h-3.5 w-3.5 ml-1" />
                  </Button>
                </Link>
              </div>
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}

// ============================================================
// Trang 404 — Không tìm thấy
// ============================================================

import { Link } from 'react-router';
import { Home, ArrowLeft } from 'lucide-react';
import { Button } from '../ui/button';

export function NotFoundPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center space-y-6">
        <div className="text-8xl font-bold text-muted-foreground/30">404</div>
        <div>
          <h1>Không tìm thấy trang</h1>
          <p className="text-muted-foreground mt-2">
            Trang bạn tìm kiếm không tồn tại hoặc đã bị di chuyển.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 justify-center">
          <Button variant="outline" onClick={() => window.history.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại
          </Button>
          <Link to="/">
            <Button>
              <Home className="mr-2 h-4 w-4" />
              Về trang chủ
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// LoadingOverlay — Overlay bán trong suốt + spinner
// B9.09: Dùng cho form submission, heavy operations
// ============================================================

import { Loader2 } from 'lucide-react';

interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
  className?: string;
}

export function LoadingOverlay({ visible, message = 'Đang xử lý...', className = '' }: LoadingOverlayProps) {
  if (!visible) return null;

  return (
    <div className={`absolute inset-0 z-50 flex flex-col items-center justify-center bg-background/60 backdrop-blur-sm rounded-xl ${className}`}>
      <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
      <p className="text-muted-foreground">{message}</p>
    </div>
  );
}

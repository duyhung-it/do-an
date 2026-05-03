// ============================================================
// Offline Indicator — Banner "Bạn đang offline" (Nhóm 22C.03)
// ============================================================

import { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function OfflineIndicator() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <AnimatePresence>
      {isOffline && (
        <motion.div
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -40, opacity: 0 }}
          role="alert"
          aria-live="assertive"
          className="fixed top-0 inset-x-0 z-[100] bg-destructive text-destructive-foreground text-center py-2 flex items-center justify-center gap-2"
        >
          <WifiOff className="h-4 w-4" />
          <span>Bạn đang mất kết nối mạng. Một số tính năng có thể không hoạt động.</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

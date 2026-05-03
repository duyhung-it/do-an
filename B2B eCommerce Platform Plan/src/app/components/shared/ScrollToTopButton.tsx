// ============================================================
// Scroll-to-Top Button — E-phase: no framer-motion dep, pure CSS
// Hiển thị khi cuộn xuống > 400px, brand gradient background
// ============================================================

import { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

export function ScrollToTopButton() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    function handleScroll() { setShow(window.scrollY > 400); }
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className={`
        fixed bottom-24 right-5 z-40
        w-11 h-11 rounded-full
        bg-gradient-to-br from-[#c91432] to-[#e31837]
        text-white shadow-lg shadow-red-500/30
        flex items-center justify-center
        transition-all duration-300
        hover:scale-110 hover:shadow-xl hover:shadow-red-500/40
        active:scale-95
        ${show ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-4 pointer-events-none'}
      `}
      aria-label="Cuộn lên đầu trang"
    >
      <ArrowUp className="h-5 w-5" />
    </button>
  );
}

// ============================================================
// Keyboard Shortcuts — Phím tắt toàn cục (Nhóm 21B)
// 21B.01-04: Ctrl+N (tạo mới), Esc (đóng), Ctrl+S (lưu form)
// ============================================================

import { useEffect, useCallback, createContext, useContext, useState, type ReactNode } from 'react';

interface ShortcutHandler {
  /** Ctrl+N callback */
  onNew?: () => void;
  /** Ctrl+S callback */
  onSave?: () => void;
}

const ShortcutContext = createContext<{
  register: (handlers: ShortcutHandler) => void;
  unregister: () => void;
}>({
  register: () => {},
  unregister: () => {},
});

export function useKeyboardShortcuts() {
  return useContext(ShortcutContext);
}

export function KeyboardShortcutsProvider({ children }: { children: ReactNode }) {
  const [handlers, setHandlers] = useState<ShortcutHandler>({});

  const register = useCallback((h: ShortcutHandler) => {
    setHandlers(prev => ({ ...prev, ...h }));
  }, []);

  const unregister = useCallback(() => {
    setHandlers({});
  }, []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const ctrl = e.metaKey || e.ctrlKey;

      // 21B.01: Ctrl+N — tạo mới
      if (ctrl && e.key === 'n') {
        // Don't prevent browser new tab if no handler
        if (handlers.onNew) {
          e.preventDefault();
          handlers.onNew();
        }
      }

      // 21B.03: Ctrl+S — lưu form
      if (ctrl && e.key === 's') {
        e.preventDefault();
        handlers.onSave?.();
      }

      // 21B.02: Esc — handled natively by dialogs/modals
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handlers]);

  return (
    <ShortcutContext.Provider value={{ register, unregister }}>
      {children}
    </ShortcutContext.Provider>
  );
}

// 21B.04: Shortcut hint tooltip component
export function ShortcutHint({ keys, className = '' }: { keys: string; className?: string }) {
  return (
    <span className={`hidden sm:inline-flex items-center gap-0.5 ml-2 text-muted-foreground ${className}`}>
      {keys.split('+').map((k, i) => (
        <span key={i}>
          {i > 0 && <span className="mx-0.5">+</span>}
          <kbd className="px-1 py-0.5 bg-muted rounded border text-[10px]">{k}</kbd>
        </span>
      ))}
    </span>
  );
}

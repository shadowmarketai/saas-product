import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
  warning: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const TOAST_STYLES: Record<ToastType, { border: string; icon: string; iconColor: string }> = {
  success: { border: 'border-l-4 border-l-green-500', icon: '✓', iconColor: 'text-green-500' },
  error:   { border: 'border-l-4 border-l-red-500',   icon: '✗', iconColor: 'text-red-500'   },
  warning: { border: 'border-l-4 border-l-amber-500', icon: '⚠', iconColor: 'text-amber-500' },
  info:    { border: 'border-l-4 border-l-blue-500',  icon: 'ℹ', iconColor: 'text-blue-500'  },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev.slice(-4), { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const value: ToastContextType = {
    toast: addToast,
    success: useCallback((msg) => addToast(msg, 'success'), [addToast]),
    error:   useCallback((msg) => addToast(msg, 'error'),   [addToast]),
    info:    useCallback((msg) => addToast(msg, 'info'),    [addToast]),
    warning: useCallback((msg) => addToast(msg, 'warning'), [addToast]),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}

      {/* Toast container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        <AnimatePresence initial={false}>
          {toasts.map((t) => {
            const style = TOAST_STYLES[t.type];
            return (
              <motion.div
                key={t.id}
                data-testid="toast"
                initial={{ x: 100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 100, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                className={`pointer-events-auto w-80 pr-8 relative bg-white dark:bg-gray-900 shadow-lg rounded-xl flex items-start gap-3 p-4 ${style.border}`}
              >
                <span className={`text-base font-bold shrink-0 mt-0.5 ${style.iconColor}`}>
                  {style.icon}
                </span>
                <p className="text-sm text-gray-800 dark:text-gray-100 leading-snug">{t.message}</p>
                <button
                  onClick={() => dismiss(t.id)}
                  className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xs leading-none p-1"
                  aria-label="Dismiss"
                >
                  ✕
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextType {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

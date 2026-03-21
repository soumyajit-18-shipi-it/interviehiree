import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { clsx } from 'clsx';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastOptions {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastOptions[]>([]);

  const toast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-3 pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => {
            const icons = {
              success: <CheckCircle className="text-success" size={20} />,
              error: <AlertCircle className="text-danger" size={20} />,
              warning: <AlertTriangle className="text-warning" size={20} />,
              info: <Info className="text-primary" size={20} />,
            };
            const bgs = {
              success: 'bg-success/10 border-success/20',
              error: 'bg-danger/10 border-danger/20',
              warning: 'bg-warning/10 border-warning/20',
              info: 'bg-primary/10 border-primary/20',
            };

            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, x: 50, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                className={clsx(
                  "pointer-events-auto flex items-center gap-3 p-4 rounded-2xl border shadow-lg backdrop-blur-md max-w-sm w-full",
                  "bg-card text-foreground", bgs[t.type]
                )}
              >
                <div className="shrink-0">{icons[t.type]}</div>
                <p className="flex-1 text-sm font-bold leading-tight">{t.message}</p>
                <button
                  onClick={() => removeToast(t.id)}
                  className="shrink-0 p-1 rounded-full hover:bg-muted text-muted-foreground transition-colors"
                >
                  <X size={16} />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

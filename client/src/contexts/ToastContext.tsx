import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

let toastId = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-4 inset-x-0 z-[100] flex flex-col items-center gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

const typeClasses: Record<ToastType, string> = {
  success: 'bg-success text-white border-success/50',
  error: 'bg-danger text-white border-danger/50',
  warning: 'bg-warning text-white border-warning/50',
  info: 'bg-info text-white border-info/50',
};

function ToastItem({ toast }: { toast: Toast }) {
  return (
    <div
      className={`pointer-events-auto px-4 py-3 rounded-xl border shadow-lg text-sm font-medium ${typeClasses[toast.type]}`}
      style={{ animation: 'toast-in 200ms ease-out' }}
    >
      {toast.message}
    </div>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

"use client";

import React, { createContext, useContext, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { IconCheck, IconAlertTriangle, IconInfoCircle, IconX } from '@tabler/icons-react';
import { cn } from '@/app/lib/utils';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType) => void;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback((message: string, type: ToastType = 'info') => {
    const id = crypto.randomUUID();
    const duration = 4000;
    
    setToasts((prev) => [...prev, { id, message, type, duration }]);

    setTimeout(() => {
      dismiss(id);
    }, duration);
  }, [dismiss]);

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      {children}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="pointer-events-auto w-full"
            >
              <div
                className={cn(
                  "flex items-start gap-3 p-4 rounded-xl border glass-panel shadow-lg bg-neutral-950/95",
                  t.type === 'success' && "border-success/30",
                  t.type === 'error' && "border-error/30",
                  t.type === 'info' && "border-neutral-800"
                )}
              >
                {/* Icon */}
                <div className="flex-shrink-0 mt-0.5">
                  {t.type === 'success' && <IconCheck className="h-5 w-5 text-success" />}
                  {t.type === 'error' && <IconAlertTriangle className="h-5 w-5 text-error" />}
                  {t.type === 'info' && <IconInfoCircle className="h-5 w-5 text-neutral-400" />}
                </div>

                {/* Message */}
                <div className="flex-grow text-sm text-neutral-200 font-medium">
                  {t.message}
                </div>

                {/* Close Button */}
                <button
                  onClick={() => dismiss(t.id)}
                  className="flex-shrink-0 text-neutral-500 hover:text-white transition-colors"
                >
                  <IconX className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

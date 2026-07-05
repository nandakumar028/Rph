"use client";

import React, { useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { IconX } from '@tabler/icons-react';
import { cn } from '@/app/lib/utils';

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function Dialog({ isOpen, onClose, title, description, children, className }: DialogProps) {
  // Lock scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 overflow-y-auto">
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
          />

          {/* Dialog Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className={cn(
              "relative w-full max-w-lg rounded-xl glass-panel p-6 shadow-2xl z-10 border border-neutral-800/80 bg-neutral-950/90",
              className
            )}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute right-4 top-4 rounded-md p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors"
            >
              <IconX className="h-4 w-4" />
            </button>

            {/* Header */}
            {(title || description) && (
              <div className="flex flex-col space-y-1 mb-6 pr-6">
                {title && (
                  <h2 className="text-xl font-semibold tracking-tight text-white">
                    {title}
                  </h2>
                )}
                {description && (
                  <p className="text-sm text-neutral-400">
                    {description}
                  </p>
                )}
              </div>
            )}

            {/* Body */}
            <div className="text-sm text-neutral-200">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

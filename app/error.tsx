"use client";

import React from 'react';
import { motion } from 'motion/react';
import { IconRefresh, IconHome } from '@tabler/icons-react';
import Link from 'next/link';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-black p-6 relative overflow-hidden">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-red-500/3 rounded-full filter blur-[150px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="z-10 text-center flex flex-col items-center max-w-md"
      >
        <div className="h-16 w-16 rounded-2xl bg-red-950/60 border border-red-900/50 flex items-center justify-center mb-6">
          <span className="text-2xl">⚠</span>
        </div>

        <p className="text-xs font-semibold tracking-[0.3em] text-red-500 uppercase mb-3">
          Something went wrong
        </p>
        <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight mb-3">
          Unexpected Error
        </h1>
        <p className="text-neutral-400 text-sm leading-relaxed mb-8">
          {error.message || 'An unexpected error occurred. Please try refreshing the page or returning to the dashboard.'}
        </p>

        <div className="flex items-center gap-3">
          <button
            onClick={reset}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-black text-sm font-medium hover:bg-neutral-200 transition-colors"
          >
            <IconRefresh className="h-4 w-4" />
            Try Again
          </button>
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-neutral-800 text-neutral-400 text-sm font-medium hover:border-neutral-700 hover:text-white transition-colors"
          >
            <IconHome className="h-4 w-4" />
            Dashboard
          </Link>
        </div>

        {error.digest && (
          <p className="mt-8 text-[10px] text-neutral-700 font-mono">Error ID: {error.digest}</p>
        )}
      </motion.div>
    </main>
  );
}

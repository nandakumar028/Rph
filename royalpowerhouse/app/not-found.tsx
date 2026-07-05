"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { IconArrowLeft, IconHome } from '@tabler/icons-react';

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-black p-6 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-white/3 rounded-full filter blur-[150px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="z-10 text-center flex flex-col items-center"
      >
        {/* 404 Number */}
        <p className="text-[120px] md:text-[180px] font-bold text-white leading-none tracking-tighter select-none opacity-10">
          404
        </p>

        <div className="-mt-6 md:-mt-10 mb-6">
          <p className="text-xs font-semibold tracking-[0.4em] text-neutral-500 uppercase mb-4">
            Page Not Found
          </p>
          <h1 className="text-2xl md:text-4xl font-bold text-white tracking-tight mb-3">
            Nothing here yet
          </h1>
          <p className="text-neutral-400 text-sm max-w-sm leading-relaxed">
            The page you&apos;re looking for doesn&apos;t exist or has been moved. Head back to the dashboard.
          </p>
        </div>

        <div className="flex items-center gap-3 mt-2">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-black text-sm font-medium hover:bg-neutral-200 transition-colors"
          >
            <IconHome className="h-4 w-4" />
            Dashboard
          </Link>
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-neutral-800 text-neutral-400 text-sm font-medium hover:border-neutral-700 hover:text-white transition-colors"
          >
            <IconArrowLeft className="h-4 w-4" />
            Go Back
          </button>
        </div>
      </motion.div>

      {/* Footer */}
      <div className="absolute bottom-6 text-center">
        <span className="text-[10px] text-neutral-700 tracking-widest font-mono">ACADEMY © 2026</span>
      </div>
    </main>
  );
}

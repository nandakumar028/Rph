"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { IconArrowRight, IconShieldCheck, IconBolt, IconDeviceLaptop } from '@tabler/icons-react';
import { Button } from '@/app/components/ui/button';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-black p-6 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.02)_0,transparent_100%)] pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/5 rounded-full filter blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white/5 rounded-full filter blur-[120px] pointer-events-none" />

      {/* Main Content Container */}
      <div className="max-w-4xl w-full text-center z-10 flex flex-col items-center">
        {/* Logo/Tagline */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-6"
        >
          <span className="text-xs font-semibold tracking-[0.4em] text-neutral-500 uppercase">
            A E S T H E T I C  S Y S T E M S
          </span>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-5xl md:text-8xl font-bold text-white tracking-tighter mb-6 font-sans select-none"
        >
          ACADEMY
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="text-neutral-400 text-base md:text-lg max-w-lg mb-10 leading-relaxed font-light"
        >
          A premium, high-performance Student Management System designed with Apple-like elegance and minimal layout structure.
        </motion.p>

        {/* Action Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mb-20"
        >
          <Link href="/dashboard">
            <Button size="lg" className="group font-medium rounded-full bg-white text-black px-8 py-3.5 hover:bg-neutral-200 text-sm">
              Enter Dashboard
              <IconArrowRight className="h-4 w-4 ml-2 transition-transform duration-200 group-hover:translate-x-1" />
            </Button>
          </Link>
        </motion.div>

        {/* Features Minimal Cards Grid */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left"
        >
          {/* Card 1 */}
          <div className="glass-panel p-6 rounded-xl border border-neutral-900/50 bg-neutral-950/20 backdrop-blur-sm">
            <div className="h-10 w-10 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center mb-4">
              <IconBolt className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-sm font-semibold text-white mb-2">High Performance</h3>
            <p className="text-xs text-neutral-400 leading-relaxed font-light">
              Built on Next.js 16 with instant page transitions and server-side rendering for optimal speed.
            </p>
          </div>

          {/* Card 2 */}
          <div className="glass-panel p-6 rounded-xl border border-neutral-900/50 bg-neutral-950/20 backdrop-blur-sm">
            <div className="h-10 w-10 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center mb-4">
              <IconShieldCheck className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-sm font-semibold text-white mb-2">Supabase Sync</h3>
            <p className="text-xs text-neutral-400 leading-relaxed font-light">
              Real-time database replication, secure row-level security (RLS) tables, and simple API integration.
            </p>
          </div>

          {/* Card 3 */}
          <div className="glass-panel p-6 rounded-xl border border-neutral-900/50 bg-neutral-950/20 backdrop-blur-sm">
            <div className="h-10 w-10 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center mb-4">
              <IconDeviceLaptop className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-sm font-semibold text-white mb-2">Apple Aesthetics</h3>
            <p className="text-xs text-neutral-400 leading-relaxed font-light">
              Elegant typography, subtle micro-animations, glassmorphism panel styles, and black-and-white minimal palette.
            </p>
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-6 left-0 right-0 text-center">
        <span className="text-[10px] text-neutral-600 tracking-widest font-mono">
          DESIGNED BY ANTIGRAVITY © 2026
        </span>
      </div>
    </main>
  );
}

import React from 'react';
import { cn } from '@/app/lib/utils';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-neutral-900',
        className
      )}
    />
  );
}

/** A full-page spinner used during initial data load */
export function PageLoader() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-black p-8 min-h-[400px]">
      <div className="relative h-9 w-9">
        <div className="absolute inset-0 rounded-full border-2 border-neutral-800" />
        <div className="absolute inset-0 rounded-full border-2 border-t-white border-r-transparent border-b-transparent border-l-transparent animate-spin" />
      </div>
      <p className="mt-4 text-[11px] text-neutral-600 font-mono tracking-widest uppercase">Loading…</p>
    </div>
  );
}

/** Skeleton card for dashboard stat tiles */
export function StatCardSkeleton() {
  return (
    <div className="rounded-xl border border-neutral-900 p-5 bg-neutral-950/40 space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-4 w-4 rounded" />
      </div>
      <Skeleton className="h-8 w-16" />
      <Skeleton className="h-2.5 w-40" />
    </div>
  );
}

/** Skeleton row for table-based pages */
export function TableRowSkeleton({ cols = 5 }: { cols?: number }) {
  return (
    <div className="flex items-center gap-4 px-4 py-3 border-b border-neutral-900/60">
      <Skeleton className="h-8 w-8 rounded-full shrink-0" />
      {Array.from({ length: cols - 1 }).map((_, i) => (
        <Skeleton
          key={i}
          className={`h-3 rounded ${i === 0 ? 'w-28' : i === cols - 2 ? 'w-16' : 'w-20 hidden sm:block'}`}
        />
      ))}
    </div>
  );
}

/** Full table skeleton */
export function TableSkeleton({ rows = 6, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="rounded-xl border border-neutral-900 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-4 px-4 py-3 bg-neutral-950/60 border-b border-neutral-900">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className={`h-2.5 ${i === 0 ? 'w-8' : 'w-20'}`} />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <TableRowSkeleton key={i} cols={cols} />
      ))}
    </div>
  );
}
